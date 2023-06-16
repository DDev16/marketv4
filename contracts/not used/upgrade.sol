// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract NFTMarketplace is Initializable, ERC721Upgradeable, ReentrancyGuardUpgradeable, OwnableUpgradeable, AccessControlUpgradeable {
    ERC721Upgradeable private nftToken;  // Add this line to declare the nftToken variable
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant TOKEN_OWNER_ROLE = keccak256("TOKEN_OWNER_ROLE");
    

    struct Listing {
        address contractAddress;
        uint256 tokenId;
        uint256 price;
        uint256 royalty;
        address seller;
        bool isActive;
    }

    struct Auction {
        address payable highestBidder;
        uint256 highestBid;
        uint256 endTime;
        bool isActive;
        address payable seller;
        mapping(address => uint256) pendingReturns; // Track refunds
    }

    struct TradeOffer {
        address offeror;
        address contractAddress1;
        uint256 tokenId1;
        address contractAddress2;
        uint256 tokenId2;
        bool isActive;
    }

    struct Token {
        address contractAddress;
        uint256 tokenId;
    }

    struct Collection {
        string name;
        Token[] tokens;
    }

    modifier onlyTokenOwner(address contractAddress, uint256 tokenId) {
        ERC721Upgradeable tokenContract = ERC721Upgradeable(contractAddress);
        require(tokenContract.ownerOf(tokenId) == msg.sender, "Only token owner can perform this action");
        _;
    }

    mapping(address => mapping(uint256 => Listing)) public listings;
    mapping(address => Collection[]) public collections;
    mapping(address => mapping(uint256 => TradeOffer)) public tradeOffers;
    mapping(address => mapping(uint256 => Auction)) public auctions;

    // Batch processing limits
    uint256 private constant BATCH_PROCESS_LIMIT = 50;
    uint256 public listingFee;
    uint256 private constant MAX_PRICE_THRESHOLD = 100 ether; // Set a maximum price threshold for safety
    uint256 private constant MIN_PRICE_THRESHOLD = 0.001 ether; // Set a minimum price threshold for safety
    uint256 private constant MAX_TOKENS_PER_SWEEP = 10; // Set a maximum number of tokens that can be swept in a single transaction
    bool private sweepFloorEnabled; // Circuit breaker flag

    // New Events
    event AuctionStarted(
        address indexed contractAddress,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 startBid,
        uint256 endTime
    );
    event NewHighestBid(
        address indexed contractAddress,
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 bidAmount
    );
    event AuctionEnded(
        address indexed contractAddress,
        uint256 indexed tokenId,
        address indexed highestBidder,
        uint256 highestBid
    );
    event TradeOfferCreated(
        address indexed offeror,
        address indexed contractAddress1,
        uint256 indexed tokenId1,
        address contractAddress2,
        uint256 tokenId2
    );
    event TradeOfferAccepted(
        address indexed offeree,
        address indexed contractAddress1,
        uint256 indexed tokenId1,
        address contractAddress2,
        uint256 tokenId2
    );
    event TradeOfferCancelled(
        address indexed offeror,
        address indexed contractAddress1,
        uint256 indexed tokenId1
    );
    event TokenListed(
        uint256 indexed tokenId,
        uint256 price,
        uint256 royalty,
        address indexed seller
    );
    event TokenSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer
    );
    event SaleCancelled(uint256 indexed tokenId, address indexed seller);
    event CollectionCreated(address indexed owner, string name);
    event CollectionUpdated(address indexed owner, uint256 collectionId);
    event CollectionTransferred(
        address indexed from,
        address indexed to,
        uint256 collectionId
    );
    event FeesWithdrawn(address indexed owner, uint256 amount);

    function initialize(address _tokenAddress) public initializer {
        __ERC721_init("NFTMarketplace", "NFTM");
        __ReentrancyGuard_init();
        __Ownable_init();
        __AccessControl_init();

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(ADMIN_ROLE, _msgSender());

        listingFee = 0.21 ether;
        sweepFloorEnabled = true;

        ERC721Upgradeable tokenContract = ERC721Upgradeable(_tokenAddress);
        setNFTTokenContract(tokenContract);
    }

    function setNFTTokenContract(ERC721Upgradeable _tokenContract) public onlyRole(ADMIN_ROLE) {
        require(address(_tokenContract) != address(0), "Invalid token contract address");
        _setNFTTokenContract(_tokenContract);
    }

    function _setNFTTokenContract(ERC721Upgradeable _tokenContract) internal {
        nftToken = _tokenContract;
    }

    function createCollection(string memory name) public {
        Collection storage newCollection = collections[msg.sender].push();
        newCollection.name = name;
        emit CollectionCreated(msg.sender, name);
    }

    function addToCollection(uint256 collectionId, address contractAddress, uint256 tokenId) public onlyTokenOwner(contractAddress, tokenId) {
        collections[msg.sender][collectionId].tokens.push(Token(contractAddress, tokenId));
        emit CollectionUpdated(msg.sender, collectionId);
    }

    function removeFromCollection(uint256 collectionId, address contractAddress, uint256 tokenId) public onlyTokenOwner(contractAddress, tokenId) {
        Collection storage collection = collections[msg.sender][collectionId];
        Token[] storage tokens = collection.tokens;
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i].contractAddress == contractAddress && tokens[i].tokenId == tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                emit CollectionUpdated(msg.sender, collectionId);
                return;
            }
        }
        revert("Token not found in collection");
    }

    function deleteCollection(uint256 collectionId) public {
        require(collectionId < collections[msg.sender].length, "Collection does not exist");
        delete collections[msg.sender][collectionId];
        emit CollectionUpdated(msg.sender, collectionId);
    }

    function getCollection(address owner, uint256 collectionId) public view returns (string memory name, address[] memory contractAddresses, uint256[][] memory tokenIds) {
        require(collectionId < collections[owner].length, "Collection does not exist");
        Collection memory collection = collections[owner][collectionId];
        uint256 numContracts = getNumContracts(collection);
        address[] memory addresses = new address[](numContracts);
        uint256[][] memory ids = new uint256[][](numContracts);
        uint256 index;
        for (uint256 i = 0; i < collection.tokens.length; i++) {
            address contractAddress = collection.tokens[i].contractAddress;
            uint256 tokenId = collection.tokens[i].tokenId;
            addresses[index] = contractAddress;
            ids[index] = new uint256[](1);
            ids[index][0] = tokenId;
            index++;
        }
        return (collection.name, addresses, ids);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Upgradeable, AccessControlUpgradeable) returns (bool) {
    return super.supportsInterface(interfaceId);
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

    function listToken(address contractAddress, uint256 tokenId, uint256 price, uint256 royalty) external payable onlyTokenOwner(contractAddress, tokenId) nonReentrant {
        require(msg.value >= listingFee, "Listing fee not provided");
        require(royalty <= 100, "Royalty cannot be greater than 100%");

        ERC721Upgradeable tokenContract = ERC721Upgradeable(contractAddress);
        tokenContract.approve(address(this), tokenId);

        listings[contractAddress][tokenId] = Listing(contractAddress, tokenId, price, royalty, msg.sender, true);

        emit TokenListed(tokenId, price, royalty, msg.sender);
    }

    function buyToken(address contractAddress, uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[contractAddress][tokenId];
        require(listing.isActive, "Token is not for sale");
        require(msg.value >= listing.price, "Insufficient funds to buy token");

        // Calculate royalty amount
        uint256 royalty = (msg.value * listing.royalty) / 100;

        ERC721Upgradeable tokenContract = ERC721Upgradeable(listing.contractAddress);

        // Transfer funds to the seller and royalty to the token owner
        payable(listing.seller).transfer(msg.value - royalty);
        if (royalty > 0) {
            payable(tokenContract.ownerOf(listing.tokenId)).transfer(royalty);
        }

        // Transfer token ownership to the buyer
        tokenContract.safeTransferFrom(listing.seller, msg.sender, listing.tokenId);

        emit TokenSold(tokenId, listing.seller, msg.sender);

        delete listings[contractAddress][tokenId];
    }

    function cancelListing(address contractAddress, uint256 tokenId) external onlyTokenOwner(contractAddress, tokenId) {
        require(listings[contractAddress][tokenId].isActive, "Token is not listed for sale");

        delete listings[contractAddress][tokenId];

        emit SaleCancelled(tokenId, msg.sender);
    }

    function setListingFee(uint256 _listingFee) external onlyRole(ADMIN_ROLE) {
        listingFee = _listingFee;
    }

    //Trade functions

    function createTradeOffer(address contractAddress1, uint256 tokenId1, address contractAddress2, uint256 tokenId2) external onlyTokenOwner(contractAddress1, tokenId1) {
        tradeOffers[contractAddress1][tokenId1] = TradeOffer(msg.sender, contractAddress1, tokenId1, contractAddress2, tokenId2, true);

        emit TradeOfferCreated(msg.sender, contractAddress1, tokenId1, contractAddress2, tokenId2);
    }

    function acceptTradeOffer(address contractAddress1, uint256 tokenId1) external nonReentrant {
        TradeOffer storage offer = tradeOffers[contractAddress1][tokenId1];
        require(offer.isActive, "Trade offer is not active");

        ERC721Upgradeable token1 = ERC721Upgradeable(contractAddress1);
        ERC721Upgradeable token2 = ERC721Upgradeable(offer.contractAddress2);

        require(token2.ownerOf(offer.tokenId2) == msg.sender, "Only token owner can accept this trade offer");

        // Transfer token1 ownership to the offeror
        token2.safeTransferFrom(msg.sender, offer.offeror, offer.tokenId2);

        // Transfer token2 ownership to the offeree
        token1.safeTransferFrom(offer.offeror, msg.sender, offer.tokenId1);

        emit TradeOfferAccepted(msg.sender, contractAddress1, tokenId1, offer.contractAddress2, offer.tokenId2);

        delete tradeOffers[contractAddress1][tokenId1];
    }

    function cancelTradeOffer(address contractAddress1, uint256 tokenId1) external {
        require(tradeOffers[contractAddress1][tokenId1].isActive, "Trade offer is not active");
        require(tradeOffers[contractAddress1][tokenId1].offeror == msg.sender, "Only offeror can cancel the trade offer");

        delete tradeOffers[contractAddress1][tokenId1];

        emit TradeOfferCancelled(msg.sender, contractAddress1, tokenId1);
    }

    //AUCTION FUNCTIONS

    function startAuction(address contractAddress, uint256 tokenId, uint256 startBid, uint256 duration) external onlyTokenOwner(contractAddress, tokenId) {
        Auction storage auction = auctions[contractAddress][tokenId];
        require(!auction.isActive, "Auction already started");

        auction.highestBidder = payable(msg.sender);
        auction.highestBid = startBid;
        auction.endTime = block.timestamp + duration;
        auction.isActive = true;
        auction.seller = payable(msg.sender);

        emit AuctionStarted(contractAddress, tokenId, msg.sender, startBid, auction.endTime);
    }

    function placeBid(address contractAddress, uint256 tokenId) external payable {
        Auction storage auction = auctions[contractAddress][tokenId];
        require(auction.isActive, "Auction is not active");
        require(block.timestamp < auction.endTime, "Auction already ended");
        require(msg.value > auction.highestBid, "Bid must be higher than current highest bid");
        require(auction.seller != msg.sender, "Seller cannot bid on their own auction");

        // Instead of sending the money back directly, we track it for a manual withdrawal
        if (auction.highestBidder != address(0)) {
            auction.pendingReturns[auction.highestBidder] += auction.highestBid;
        }

        auction.highestBidder = payable(msg.sender);
        auction.highestBid = msg.value;

        emit NewHighestBid(contractAddress, tokenId, msg.sender, msg.value);
    }

    function withdrawBid(address contractAddress, uint256 tokenId) external {
        Auction storage auction = auctions[contractAddress][tokenId];

        uint256 amount = auction.pendingReturns[msg.sender];
        require(amount > 0, "No funds to withdraw");

        // It's important to zero the pending refund before sending to prevent re-entrancy attacks
        auction.pendingReturns[msg.sender] = 0;

        payable(msg.sender).transfer(amount);
    }

    function endAuction(address contractAddress, uint256 tokenId) external {
        Auction storage auction = auctions[contractAddress][tokenId];
        require(auction.isActive, "Auction is not active");
        require(block.timestamp >= auction.endTime, "Auction has not ended yet");
        require(auction.seller == msg.sender, "Only the seller can end the auction");

        ERC721Upgradeable tokenContract = ERC721Upgradeable(contractAddress);

        // If no one has bid on the auction, the token remains with the seller
        if (auction.highestBidder != address(0)) {
            // Transfer the token to the highest bidder
            tokenContract.safeTransferFrom(msg.sender, auction.highestBidder, tokenId);
        }

        // Mark the auction as ended
        auction.isActive = false;

        emit AuctionEnded(contractAddress, tokenId, auction.highestBidder, auction.highestBid);
    }

    //  BATCH FUNCTIONS

    // Batch listing function
    function listTokens(
        address[] memory contractAddresses,
        uint256[] memory tokenIds,
        uint256[] memory prices,
        uint256[] memory royalties
    ) external payable nonReentrant {
        require(
            contractAddresses.length == tokenIds.length &&
                tokenIds.length == prices.length &&
                prices.length == royalties.length,
            "Mismatched input arrays"
        );
        require(msg.value >= listingFee * tokenIds.length, "Listing fee not provided");

        uint256 tokensToProcess = contractAddresses.length;
        uint256 startIndex = 0;

        while (tokensToProcess > 0) {
            uint256 tokensInBatch = tokensToProcess > BATCH_PROCESS_LIMIT ? BATCH_PROCESS_LIMIT : tokensToProcess;
            address[] memory contractAddressesBatch = new address[](tokensInBatch);
            uint256[] memory tokenIdsBatch = new uint256[](tokensInBatch);
            uint256[] memory pricesBatch = new uint256[](tokensInBatch);
            uint256[] memory royaltiesBatch = new uint256[](tokensInBatch);

            for (uint256 i = 0; i < tokensInBatch; i++) {
                contractAddressesBatch[i] = contractAddresses[startIndex + i];
                tokenIdsBatch[i] = tokenIds[startIndex + i];
                pricesBatch[i] = prices[startIndex + i];
                royaltiesBatch[i] = royalties[startIndex + i];
            }

            processListings(contractAddressesBatch, tokenIdsBatch, pricesBatch, royaltiesBatch);

            startIndex += tokensInBatch;
            tokensToProcess -= tokensInBatch;
        }
    }

    // Internal function to process batch listings
    function processListings(
        address[] memory contractAddresses,
        uint256[] memory tokenIds,
        uint256[] memory prices,
        uint256[] memory royalties
    ) internal {
        for (uint256 i = 0; i < contractAddresses.length; i++) {
            address contractAddress = contractAddresses[i];
            uint256 tokenId = tokenIds[i];
            uint256 price = prices[i];
            uint256 royalty = royalties[i];

            require(royalty <= 100, "Royalty cannot be greater than 100%");

            ERC721Upgradeable tokenContract = ERC721Upgradeable(contractAddress);
            require(tokenContract.ownerOf(tokenId) == msg.sender, "Only token owner can perform this action");

            tokenContract.approve(address(this), tokenId);

            listings[contractAddress][tokenId] = Listing(contractAddress, tokenId, price, royalty, msg.sender, true);

            emit TokenListed(tokenId, price, royalty, msg.sender);
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

            // Calculate royalty amount
            uint256 royalty = (msg.value * listing.royalty) / 100;

            ERC721Upgradeable tokenContract = ERC721Upgradeable(listing.contractAddress);

            // Transfer funds to the seller and royalty to the token owner
            payable(listing.seller).transfer(msg.value - royalty);
            if (royalty > 0) {
                payable(tokenContract.ownerOf(listing.tokenId)).transfer(royalty);
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

    //FLOOR SWEEPING FUNCTIONS

    function sweepFloor(uint256 collectionId, uint256 maxPrice) external nonReentrant {
        require(sweepFloorEnabled, "Sweeping is currently disabled");
        require(collectionId < collections[msg.sender].length, "Collection does not exist");
        require(maxPrice >= MIN_PRICE_THRESHOLD && maxPrice <= MAX_PRICE_THRESHOLD, "Invalid maximum price");

        Collection storage collection = collections[msg.sender][collectionId];
        uint256 numTokens = collection.tokens.length;
        uint256 tokensToSweep = numTokens < MAX_TOKENS_PER_SWEEP ? numTokens : MAX_TOKENS_PER_SWEEP; // Limit the number of tokens to be swept in a single transaction

        for (uint256 i = 0; i < tokensToSweep; i++) {
            Token memory token = collection.tokens[i];
            Listing storage listing = listings[token.contractAddress][token.tokenId];

            if (listing.isActive && listing.price <= maxPrice) {
                // Calculate royalty amount
                uint256 royalty = (listing.price * listing.royalty) / 100;

                ERC721Upgradeable tokenContract = ERC721Upgradeable(listing.contractAddress);

                // Transfer funds to the seller and royalty to the token owner
                payable(listing.seller).transfer(listing.price - royalty);
                if (royalty > 0) {
                    payable(tokenContract.ownerOf(token.tokenId)).transfer(royalty);
                }

                // Transfer token ownership to the caller
                tokenContract.safeTransferFrom(listing.seller, msg.sender, token.tokenId);

                emit TokenSold(token.tokenId, listing.seller, msg.sender);

                delete listings[token.contractAddress][token.tokenId];
            }
        }
    }

    function setSweepFloorEnabled(bool enabled) external onlyRole(ADMIN_ROLE) {
        sweepFloorEnabled = enabled;
    }

    function withdrawFees() external onlyRole(ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
        emit FeesWithdrawn(owner(), balance);
    }
}
