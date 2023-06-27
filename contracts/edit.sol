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
        uint256 collectionId; // Add collectionId to track unique IDs
        string name;
        string logoIPFS;
        string bannerIPFS;
        string description;
        string category;
        Token[] tokens;
        bool isPublic;
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

    struct CollectionData {
    uint256 collectionId; // Add collectionId field for retrieval
    string name;
    string logoIPFS;
    string bannerIPFS;
    string description;
    address contractAddress;
}


    modifier onlyTokenOwner(address contractAddress, uint256 tokenId) {
        ERC721 tokenContract = ERC721(contractAddress);
        require(tokenContract.ownerOf(tokenId) == msg.sender, "Only token owner can perform this action");
        _;
    }

    address[] public collectionOwners;
    ERC721 public nftToken;
    Token[] public activeListings;
    mapping(address => mapping(uint256 => uint256)) public listingIndex;
    mapping(address => mapping(uint256 => Listing)) public listings;
    mapping(address => Collection[]) public collections;
    mapping(address => uint256) private collectionLengths;
    uint256 private constant BATCH_PROCESS_LIMIT = 50;
    uint256 public listingFee = 0.01 ether;
    mapping(address => mapping(uint256 => bool)) private collectionTokens;
    mapping(address => mapping(uint256 => uint256)) private collectionSoldTokenCount;
    uint256 private collectionCounter = 0; // Initialize collectionCounter




    
event CollectionCreated(address indexed owner, uint256 collectionId, string name); // Include collectionId in the event
event CollectionUpdated(address indexed owner, uint256 collectionId);
    event CollectionTransferred(
        address indexed from,
        address indexed to,
        uint256 collectionId
    );


    constructor(address _tokenAddress) {
        nftToken = ERC721(_tokenAddress);
    }

    function getTokensInCollection(address owner, uint256 collectionId)
        public
        view
        returns (uint256[] memory tokenIds)
    {
        require(collectionId < collections[owner].length, "Collection does not exist");
        Collection storage collection = collections[owner][collectionId];
        uint256 numTokens = collection.tokens.length;
        tokenIds = new uint256[](numTokens);

        for (uint256 i = 0; i < numTokens; i++) {
            tokenIds[i] = collection.tokens[i].tokenId;
        }

        return tokenIds;
    }

    // Updated function to get all collections in a single array
    function getAllCollections(uint256 page, uint256 pageSize) public view returns (CollectionData[] memory) {
    uint256 ownerCount = collectionOwners.length;
    uint256 startIndex = (page - 1) * pageSize;
    uint256 endIndex = startIndex + pageSize;

    if (endIndex > ownerCount) {
        endIndex = ownerCount;
    }

    // Calculate the maximum size for the allCollections array
    uint256 maxCollectionCount = 0;
    for (uint256 i = startIndex; i < endIndex; i++) {
        address owner = collectionOwners[i];
        maxCollectionCount += collections[owner].length;
    }

    CollectionData[] memory allCollections = new CollectionData[](maxCollectionCount);

    uint256 currentCollection = 0;
    for (uint256 i = startIndex; i < endIndex; i++) {
        address owner = collectionOwners[i];
        Collection[] storage ownerCollections = collections[owner];
        uint256 collectionCount = ownerCollections.length;

        for (uint256 j = 0; j < collectionCount; j++) {
            if (ownerCollections[j].tokens.length > 0) {
                allCollections[currentCollection] = CollectionData({
                    collectionId: ownerCollections[j].collectionId, // Include collectionId
                    name: ownerCollections[j].name,
                    logoIPFS: ownerCollections[j].logoIPFS,
                    bannerIPFS: ownerCollections[j].bannerIPFS,
                    description: ownerCollections[j].description,
                    contractAddress: owner // Add the contractAddress field here
                });
                currentCollection++;
            }
        }
    }

    // Shorten the allCollections array to exclude empty items at the end
    CollectionData[] memory validCollections = new CollectionData[](currentCollection);
    for (uint256 i = 0; i < currentCollection; i++) {
        validCollections[i] = allCollections[i];
    }

    return validCollections;
}


function createCollection(
    string memory name,
    string memory logoIPFS,
    string memory bannerIPFS,
    string memory description,
    string memory category
) public {
    Collection storage newCollection = collections[msg.sender].push();
    newCollection.collectionId = collectionCounter; // Use global collectionCounter
    newCollection.name = name;
    newCollection.logoIPFS = logoIPFS;
    newCollection.bannerIPFS = bannerIPFS;
    newCollection.description = description;
    newCollection.category = category;
    emit CollectionCreated(msg.sender, newCollection.collectionId, name); // Emit event with the new collection ID
    collectionCounter++; // Increment the global collection counter
}


    function addToCollection(uint256 collectionId, address contractAddress, uint256 tokenId)
        public
        onlyTokenOwner(contractAddress, tokenId)
    {
        require(!collectionTokens[contractAddress][tokenId], "Token already exists in the collection");
        collections[msg.sender][collectionId].tokens.push(Token(contractAddress, tokenId));
        collectionTokens[contractAddress][tokenId] = true;
        emit CollectionUpdated(msg.sender, collectionId);
    }



    function getCollection(address owner, uint256 collectionId)
        public
        view
        returns (
            string memory name,
            string memory logoIPFS,
            address[] memory contractAddresses,
            uint256[] memory tokenIds
        )
    {
        require(collectionId < collections[owner].length, "Collection does not exist");
        Collection memory collection = collections[owner][collectionId];
        contractAddresses = new address[](collection.tokens.length);
        tokenIds = new uint256[](collection.tokens.length);

        for (uint256 i = 0; i < collection.tokens.length; i++) {
            contractAddresses[i] = collection.tokens[i].contractAddress;
            tokenIds[i] = collection.tokens[i].tokenId;
        }

        return (collection.name, collection.logoIPFS, contractAddresses, tokenIds);
    }

    function getSpecificCollection(uint256 collectionId)
        public
        view
        returns (
            address owner,
            string memory name,
            string memory logoIPFS,
            string memory bannerIPFS,
            string memory description,
            address[] memory contractAddresses,
            uint256[] memory tokenIds
        )
    {
        require(collectionId < collections[msg.sender].length, "Collection does not exist");
        Collection memory collection = collections[msg.sender][collectionId];
        contractAddresses = new address[](collection.tokens.length);
        tokenIds = new uint256[](collection.tokens.length);

        for (uint256 i = 0; i < collection.tokens.length; i++) {
            contractAddresses[i] = collection.tokens[i].contractAddress;
            tokenIds[i] = collection.tokens[i].tokenId;
        }

        return (
            msg.sender,
            collection.name,
            collection.logoIPFS,
            collection.bannerIPFS,
            collection.description,
            contractAddresses,
            tokenIds
        );
    }

    function getCollectionsByOwner(address owner) public view returns (Collection[] memory) {
        return collections[owner];
    }

    function getNumContracts(Collection memory collection) internal pure returns (uint256) {
        uint256 count;
        address[] memory uniqueContracts = new address[](collection.tokens.length);
        for (uint256 i = 0; i < collection.tokens.length; i++) {
            address contractAddress = collection.tokens[i].contractAddress;
            bool found;
            for (uint256 j = 0; j < count; j++) {
                if (uniqueContracts[j] == contractAddress) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                uniqueContracts[count] = contractAddress;
                count++;
            }
        }
        return count;
    }

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

    ERC721 tokenContract = ERC721(listing.contractAddress);
    IERC2981 royaltyContract = IERC2981(listing.contractAddress);

    address royaltyRecipient;
    uint256 royaltyAmount;

    try royaltyContract.royaltyInfo(tokenId, listing.price) returns (address recipient, uint256 amount) {
        royaltyRecipient = recipient;
        royaltyAmount = amount;
    } catch {
        royaltyRecipient = address(0);
        royaltyAmount = 0;
    }

    require(listing.price >= royaltyAmount, "The price is less than the royalty.");

    payable(listing.seller).transfer(listing.price - royaltyAmount);

    if (royaltyRecipient != address(0)) {
        payable(royaltyRecipient).transfer(royaltyAmount);
        emit TokenBought(listing.tokenId, royaltyAmount, royaltyRecipient);
    }

    tokenContract.safeTransferFrom(listing.seller, msg.sender, listing.tokenId);

    emit TokenSold(listing.tokenId, listing.seller, msg.sender);

    // Remove the token listing from the marketplace
    delete listings[contractAddress][tokenId];

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


function getHottestCollections(uint256 count) public view returns (CollectionData[] memory) {
    require(count > 0, "Count must be greater than zero");

    uint256 collectionCount = collectionOwners.length;
    CollectionData[] memory allCollections = new CollectionData[](collectionCount);

    for (uint256 i = 0; i < collectionCount; i++) {
        address owner = collectionOwners[i];
        Collection[] storage ownerCollections = collections[owner];
        uint256 collectionLength = ownerCollections.length;

        for (uint256 j = 0; j < collectionLength; j++) {
            Collection storage collection = ownerCollections[j];
            uint256 soldTokenCount = collectionSoldTokenCount[collection.tokens[0].contractAddress][collection.tokens[0].tokenId];

            allCollections[i] = CollectionData({
                collectionId: collection.collectionId, // Include collectionId
                name: collection.name,
                logoIPFS: collection.logoIPFS,
                bannerIPFS: collection.bannerIPFS,
                description: collection.description,
                contractAddress: owner
            });

            // Sort the collections based on sold token count (descending order)
            for (uint256 k = i; k > 0 && soldTokenCount > collectionSoldTokenCount[allCollections[k - 1].contractAddress][allCollections[k - 1].collectionId]; k--) {
                CollectionData memory temp = allCollections[k];
                allCollections[k] = allCollections[k - 1];
                allCollections[k - 1] = temp;
            }
        }
    }

    // Trim the array to the desired count
    if (count < allCollections.length) {
        CollectionData[] memory trimmedCollections = new CollectionData[](count);
        for (uint256 i = 0; i < count; i++) {
            trimmedCollections[i] = allCollections[i];
        }
        return trimmedCollections;
    }

    return allCollections;
}



    function cancelListing(address contractAddress, uint256 tokenId) external onlyTokenOwner(contractAddress, tokenId) {
        require(listings[contractAddress][tokenId].isActive, "Token is not listed for sale");

        delete listings[contractAddress][tokenId];

        emit SaleCancelled(tokenId, msg.sender);
    }

    function setListingFee(uint256 _listingFee) external onlyOwner {
        listingFee = _listingFee;
    }

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

    function getTokenDetails(address contractAddress, uint256 tokenId) public view returns (TokenDetails memory) {
    Listing storage listing = listings[contractAddress][tokenId];
    require(listing.isActive, "Token is not listed for sale");

    TokenDetails memory tokenDetails = TokenDetails({
        contractAddress: contractAddress,
        tokenId: tokenId,
        price: listing.price,
        seller: listing.seller
    });

    return tokenDetails;
}


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

    function buyTokens(address[] memory contractAddresses, uint256[] memory tokenIds) external payable nonReentrant {
    require(contractAddresses.length == tokenIds.length, "Mismatched input arrays");

    for (uint256 i = 0; i < contractAddresses.length; i++) {
        address contractAddress = contractAddresses[i];
        uint256 tokenId = tokenIds[i];

        Listing storage listing = listings[contractAddress][tokenId];
        require(listing.isActive, "Token is not for sale");
        require(msg.value >= listing.price, "Insufficient funds to buy token");

        ERC721 tokenContract = ERC721(listing.contractAddress);
        IERC2981 royaltyContract = IERC2981(listing.contractAddress);

        address royaltyRecipient;
        uint256 royaltyAmount;

        try royaltyContract.royaltyInfo(tokenId, listing.price) returns (address recipient, uint256 amount) {
            royaltyRecipient = recipient;
            royaltyAmount = amount;
        } catch {
            royaltyRecipient = address(0);
            royaltyAmount = 0;
        }

        require(listing.price >= royaltyAmount, "The price is less than the royalty.");

        payable(listing.seller).transfer(listing.price - royaltyAmount);

        if (royaltyRecipient != address(0)) {
            payable(royaltyRecipient).transfer(royaltyAmount);
            emit TokenBought(listing.tokenId, royaltyAmount, royaltyRecipient);
        }

        tokenContract.safeTransferFrom(listing.seller, msg.sender, listing.tokenId);

        emit TokenSold(listing.tokenId, listing.seller, msg.sender);

        // Remove the token listing from the marketplace
        delete listings[contractAddress][tokenId];

        for (uint256 j = 0; j < activeListings.length; j++) {
            if (activeListings[j].contractAddress == contractAddress && activeListings[j].tokenId == tokenId) {
                if (j != activeListings.length - 1) {
                    activeListings[j] = activeListings[activeListings.length - 1];
                }
                activeListings.pop();
                break;
            }
        }
    }
}

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
