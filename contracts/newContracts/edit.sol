// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract NFTMarketplace is ReentrancyGuard, Ownable {

    struct Listing {
        address contractAddress;
        uint256 tokenId;
        uint256 price;
        address seller;
        bool isActive;
    }

      struct Collection {
        uint256 collectionId; // Added collection ID
        string name;
        string logoIPFS;
        string bannerIPFS;
        string description;
        string category;
        address owner;
    }
    
    struct Token {
        address contractAddress;
        uint256 tokenId;
    }
      struct TokenDetails {
        address contractAddress;
        uint256 tokenId;
        uint256 price;
        address seller;
    }

    event TokenBought(
    uint256 indexed tokenId,
    uint256 royalty,
    address indexed recipient
);

    event CollectionCreated(uint256 indexed collectionId, address indexed owner, string name);



    modifier onlyTokenOwner(address contractAddress, uint256 tokenId) {
        ERC721 tokenContract = ERC721(contractAddress);
        require(tokenContract.ownerOf(tokenId) == msg.sender, "Only token owner can perform this action");
        _;
    }

    ERC721 public nftToken;
    Token[] public activeListings;
    mapping(uint256 => Collection) public collections;
    mapping(address => mapping(uint256 => uint256)) private listingIndex;
    mapping(address => mapping(uint256 => Listing)) public listings;

    uint256 private constant BATCH_PROCESS_LIMIT = 50;
    uint256 public listingFee = 0.01 ether;
    uint256 public totalCollections;
  uint256 public collectionCount = 0;
        
    event TokenListed(
        uint256 indexed tokenId,
        uint256 price,
        address indexed seller
    );
    event TokenSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer
    );
    event SaleCancelled(uint256 indexed tokenId, address indexed seller);



      
   constructor(address _tokenAddress) {
        nftToken = ERC721(_tokenAddress);
    }

      function createCollection(
    string memory name,
    string memory logoIPFS,
    string memory bannerIPFS,
    string memory description,
    string memory category
) public {
    collections[collectionCount] = Collection(
        collectionCount, // Assign the collection ID
        name,
        logoIPFS,
        bannerIPFS,
        description,
        category,
        msg.sender
    );

    emit CollectionCreated(collectionCount, msg.sender, name);

    collectionCount++;
    totalCollections++; // Increment totalCollections here
}


function getAllCollections(uint256 startIndex, uint256 pageSize) public view returns (Collection[] memory) {
    require(startIndex < collectionCount, "Start index out of range");

    uint256 actualPageSize = pageSize;

    // Check if the request is out of range
    if (startIndex + pageSize > collectionCount) {
        actualPageSize = collectionCount - startIndex;
    }

    Collection[] memory paginatedCollections = new Collection[](actualPageSize);

    for (uint256 i = 0; i < actualPageSize; i++) {
        paginatedCollections[i] = collections[startIndex + i];
    }

    return paginatedCollections;
}

    function getCollectionsByOwner(address owner) public view returns (Collection[] memory) {
        uint256 count = 0;

        // Count the number of collections owned by the given address
        for (uint256 i = 0; i < totalCollections; i++) {
            if (collections[i].owner == owner) {
                count++;
            }
        }

        // Create an array to store the collections
        Collection[] memory ownedCollections = new Collection[](count);
        uint256 index = 0;

        // Retrieve the collections owned by the given address
        for (uint256 i = 0; i < totalCollections; i++) {
            if (collections[i].owner == owner) {
                ownedCollections[index] = collections[i];
                index++;
            }
        }

        return ownedCollections;
    }


    

     // Fetch all tokens for sale
    function getAllTokensForSale() external view returns (TokenDetails[] memory) {
        uint256 length = activeListings.length;
        TokenDetails[] memory tokens = new TokenDetails[](length);

        for (uint256 i = 0; i < length; i++) {
            Token memory token = activeListings[i];
            Listing memory listing = listings[token.contractAddress][token.tokenId];
            tokens[i] = TokenDetails(
                token.contractAddress,
                token.tokenId,
                listing.price,
                listing.seller
            );
        }

        return tokens;
    }

    // List a token for sale
   function listToken(address contractAddress, uint256 tokenId, uint256 price) external payable onlyTokenOwner(contractAddress, tokenId) nonReentrant {
    require(msg.value >= listingFee, "Listing fee not provided");

    ERC721 tokenContract = ERC721(contractAddress);
    tokenContract.approve(address(this), tokenId);

    Listing storage listing = listings[contractAddress][tokenId];
    require(!listing.isActive, "Token is already listed for sale");

    listing.contractAddress = contractAddress;
    listing.tokenId = tokenId;
    listing.price = price;
    listing.seller = msg.sender;
    listing.isActive = true;


    Token memory token = Token(contractAddress, tokenId);
    activeListings.push(token);

    emit TokenListed(tokenId, price, msg.sender);
}

function buyToken(address contractAddress, uint256 tokenId) external payable nonReentrant {
    Listing storage listing = listings[contractAddress][tokenId];
    require(listing.isActive, "Token is not for sale");
    require(msg.value >= listing.price, "Insufficient funds to buy token");

    // Instantiate the ERC721 contract and IERC2981 interface
    ERC721 tokenContract = ERC721(listing.contractAddress);
    IERC2981 royaltyContract = IERC2981(listing.contractAddress);

    // Initialize royaltyRecipient and royaltyAmount
    address royaltyRecipient;
    uint256 royaltyAmount;

    // Try to call royaltyInfo function
    try royaltyContract.royaltyInfo(tokenId, listing.price) returns (address recipient, uint256 amount) {
        royaltyRecipient = recipient;
        royaltyAmount = amount;
    } 
    catch {
        royaltyRecipient = address(0);
        royaltyAmount = 0;
    }

    // Check if there's enough for the royalty
    require(listing.price >= royaltyAmount, "The price is less than the royalty.");

    // Transfer funds to the seller minus the royalty
    payable(listing.seller).transfer(listing.price - royaltyAmount);

    // If royaltyRecipient is not the zero address, pay the royalty
    if (royaltyRecipient != address(0)) {
        payable(royaltyRecipient).transfer(royaltyAmount);
            emit TokenBought(tokenId, royaltyAmount, royaltyRecipient);

    }

    // Transfer token ownership to the buyer
    tokenContract.safeTransferFrom(listing.seller, msg.sender, listing.tokenId);

    emit TokenSold(listing.tokenId, listing.seller, msg.sender);

    // Remove the listing
    delete listings[contractAddress][tokenId];

    // Update the activeListings array
    for (uint256 i = 0; i < activeListings.length; i++) {
        if (activeListings[i].contractAddress == contractAddress && activeListings[i].tokenId == tokenId) {
            if (i != activeListings.length - 1) {
                activeListings[i] = activeListings[activeListings.length - 1];
            }
            activeListings.pop();
            break;
        }
    }
}

function cancelListing(address contractAddress, uint256 tokenId) external onlyTokenOwner(contractAddress, tokenId) {
    require(listings[contractAddress][tokenId].isActive, "Token is not listed for sale");

    delete listings[contractAddress][tokenId];

    emit SaleCancelled(tokenId, msg.sender);
}


     function setListingFee(uint256 _listingFee) external onlyOwner {
        listingFee = _listingFee;
    }



   

//  BATCH FUNCTIONS

// Batch listing function
    function listTokens(address[] memory contractAddresses, uint256[] memory tokenIds, uint256[] memory prices) external payable nonReentrant {
    require(contractAddresses.length == tokenIds.length && tokenIds.length == prices.length && prices.length > 0, "Mismatched input arrays");
    require(msg.value >= listingFee * tokenIds.length, "Listing fee not provided");

    uint256 tokensToProcess = contractAddresses.length;
    uint256 startIndex = 0;

    while (tokensToProcess > 0) {
        uint256 tokensInBatch = tokensToProcess > BATCH_PROCESS_LIMIT ? BATCH_PROCESS_LIMIT : tokensToProcess;
        address[] memory contractAddressesBatch = new address[](tokensInBatch);
        uint256[] memory tokenIdsBatch = new uint256[](tokensInBatch);
        uint256[] memory pricesBatch = new uint256[](tokensInBatch);

        for (uint256 i = 0; i < tokensInBatch; i++) {
            contractAddressesBatch[i] = contractAddresses[startIndex + i];
            tokenIdsBatch[i] = tokenIds[startIndex + i];
            pricesBatch[i] = prices[startIndex + i];
        }

        processListings(contractAddressesBatch, tokenIdsBatch, pricesBatch);

        startIndex += tokensInBatch;
        tokensToProcess -= tokensInBatch;
    }
}


    // Internal function to process batch listings
    function processListings(address[] memory contractAddresses, uint256[] memory tokenIds, uint256[] memory prices) internal {
        for (uint256 i = 0; i < contractAddresses.length; i++) {
            address contractAddress = contractAddresses[i];
            uint256 tokenId = tokenIds[i];
            uint256 price = prices[i];


            ERC721 tokenContract = ERC721(contractAddress);
            require(tokenContract.ownerOf(tokenId) == msg.sender, "Only token owner can perform this action");

            tokenContract.approve(address(this), tokenId);

            listings[contractAddress][tokenId] = Listing(contractAddress, tokenId, price, msg.sender, true);

            emit TokenListed(tokenId, price, msg.sender);
        }
    }

    // Batch buying function
   function buyTokens(address[] memory contractAddresses, uint256[] memory tokenIds) external payable nonReentrant {
    require(contractAddresses.length == tokenIds.length, "Mismatched input arrays");

    for (uint256 i = 0; i < contractAddresses.length; i++) {
        address contractAddress = contractAddresses[i];
        uint256 tokenId = tokenIds[i];

        Listing storage listing = listings[contractAddress][tokenId];
        require(listing.isActive, "Token is not for sale");
        require(msg.value >= listing.price, "Insufficient funds to buy token");

        // Instantiate the ERC721 contract and IERC2981 interface
        ERC721 tokenContract = ERC721(listing.contractAddress);
        IERC2981 royaltyContract = IERC2981(listing.contractAddress);

        // Initialize royaltyRecipient and royaltyAmount
        address royaltyRecipient;
        uint256 royaltyAmount;

        // Try to call royaltyInfo function
        try royaltyContract.royaltyInfo(tokenId, listing.price) returns (address recipient, uint256 amount) {
            royaltyRecipient = recipient;
            royaltyAmount = amount;
        } 
        catch {
            royaltyRecipient = address(0);
            royaltyAmount = 0;
        }

        // Check if there's enough for the royalty
        require(listing.price >= royaltyAmount, "The price is less than the royalty.");

        // Transfer funds to the seller minus the royalty
        payable(listing.seller).transfer(listing.price - royaltyAmount);

        // If royaltyRecipient is not the zero address, pay the royalty
        if (royaltyRecipient != address(0)) {
            payable(royaltyRecipient).transfer(royaltyAmount);
            emit TokenBought(listing.tokenId, royaltyAmount, royaltyRecipient);
        }

        // Transfer token ownership to the buyer
        tokenContract.safeTransferFrom(listing.seller, msg.sender, listing.tokenId);

        emit TokenSold(listing.tokenId, listing.seller, msg.sender);

        delete listings[contractAddress][tokenId];
    }
}


    // Batch canceling listings function
    function cancelListings(address[] memory contractAddresses, uint256[] memory tokenIds) external {
        require(contractAddresses.length == tokenIds.length, "Mismatched input arrays");

        for (uint256 i = 0; i < contractAddresses.length; i++) {
            address contractAddress = contractAddresses[i];
            uint256 tokenId = tokenIds[i];

            require(listings[contractAddress][tokenId].isActive, "Token is not listed for sale");

            delete listings[contractAddress][tokenId];

            emit SaleCancelled(tokenId, msg.sender);
        }
    }




       function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");

        payable(owner()).transfer(balance);

        
    }

}
