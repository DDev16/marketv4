// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract NFT is ERC721Enumerable, Ownable, ERC721Holder {
    using SafeMath for uint256;
    using Strings for uint256;

    string private _baseExtension = ".json";
    string private _metadataURI;
    uint256 private _cost = 0.05 ether;
    uint256 private _maxSupply = 10000;
    uint256 private _maxMintAmount = 20;
    bool private _paused = false;
    bool private _revealed = false;
    string private _notRevealedUri;
    address payable private _withdrawAddress; // Declare the _withdrawAddress variable
    string private _baseURIValue; // Renamed variable


    event Mint(address indexed minter, uint256[] tokenIds);
    event Reveal();
    event CostUpdated(uint256 newCost);
    event MaxMintAmountUpdated(uint256 newMaxMintAmount);
    event NotRevealedURIUpdated(string newNotRevealedURI);
    event BaseExtensionUpdated(string newBaseExtension);
    event MetadataURIUpdated(string newMetadataURI);
    event MintFor(address indexed minter, address indexed recipient, uint256[] tokenIds);
    event Burn(address indexed burner, uint256[] tokenIds);
    event Withdraw(address indexed recipient, uint256 amount);
    event BaseURIUpdated(string newBaseURI); // Added the event declaration here

    constructor(
        string memory name,
        string memory symbol,
        string memory initBaseURI,
        string memory initNotRevealedUri
    ) ERC721(name, symbol) {
        setBaseURI(initBaseURI);
        _notRevealedUri = initNotRevealedUri;
    }



function notRevealedURI() public view returns (string memory) {
    return _notRevealedUri;
}

   

     function baseURI() public view returns (string memory) {
        return _baseURIValue;
    }

    function setBaseURI(string memory newBaseURI) public onlyOwner {
        _baseURIValue = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    function metadataURI() public view returns (string memory) {
        return _metadataURI;
    }

    


    function mint(uint256 mintAmount) public payable {
        require(!_paused, "Minting is paused");
        require(mintAmount > 0, "Number of NFTs to mint must be greater than 0");
        require(
            mintAmount <= _maxMintAmount,
            "Exceeds the maximum mint amount"
        );
        require(
            totalSupply().add(mintAmount) <= _maxSupply,
            "Exceeds the maximum supply"
        );

        if (msg.sender != owner()) {
            require(
                msg.value >= _cost.mul(mintAmount),
                "Insufficient payment amount"
            );
        }

        uint256[] memory tokenIds = new uint256[](mintAmount);
        for (uint256 i = 0; i < mintAmount; i++) {
            uint256 tokenId = totalSupply().add(1);
            _safeMint(msg.sender, tokenId);
            tokenIds[i] = tokenId;
        }

        emit Mint(msg.sender, tokenIds);
    }

    function walletOfOwner(address owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256 ownerTokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        return tokenIds;
    }

   function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        if (!_revealed) {
            return _notRevealedUri;
        }

        string memory currentBaseURI = baseURI(); // Use the baseURI() function
        return bytes(currentBaseURI).length > 0
            ? string(abi.encodePacked(currentBaseURI, tokenId.toString(), _baseExtension))
            : "";
    }

    function reveal() public onlyOwner {
        _revealed = true;
        emit Reveal();
    }

    function setCost(uint256 newCost) public onlyOwner {
        _cost = newCost;
        emit CostUpdated(newCost);
    }

    function setMaxMintAmount(uint256 newMaxMintAmount) public onlyOwner {
        _maxMintAmount = newMaxMintAmount;
        emit MaxMintAmountUpdated(newMaxMintAmount);
    }

    function setNotRevealedURI(string memory newNotRevealedURI)
        public
        onlyOwner
    {
        _notRevealedUri = newNotRevealedURI;
        emit NotRevealedURIUpdated(newNotRevealedURI);
    }

  

    function setBaseExtension(string memory newBaseExtension)
        public
        onlyOwner
    {
        _baseExtension = newBaseExtension;
        emit BaseExtensionUpdated(newBaseExtension);
    }

    function setMetadataURI(string memory newMetadataURI) public onlyOwner {
        _metadataURI = newMetadataURI;
        emit MetadataURIUpdated(newMetadataURI);
    }

    function pause(bool paused) public onlyOwner {
    _paused = paused;
}


    function withdraw() public payable onlyOwner {
    // This will pay HashLips 5% of the initial sale.
    // You can remove this if you want, or keep it in to support HashLips and his channel.
    // =============================================================================
    (bool hs, ) = payable(0x943590A42C27D08e3744202c4Ae5eD55c2dE240D).call{value: address(this).balance * 5 / 100}("");
    require(hs);
    // =============================================================================
    
    // This will payout the owner 95% of the contract balance.
    // Do not remove this otherwise you will not be able to withdraw the funds.
    // =============================================================================
    (bool os, ) = payable(owner()).call{value: address(this).balance}("");
    require(os);
    // =============================================================================
  }

    

    function _sendFunds(address payable recipient, uint256 amount) private {
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Failed to send funds");
    }

    // Universal functions

    function updateMaxSupply(uint256 newMaxSupply) external onlyOwner {
        require(
            newMaxSupply > _maxSupply,
            "New max supply must be greater than the current max supply"
        );
        _maxSupply = newMaxSupply;
    }

    function updateCost(uint256 newCost) external onlyOwner {
        _cost = newCost;
        emit CostUpdated(newCost);
    }

    function updateMaxMintAmount(uint256 newMaxMintAmount) external onlyOwner {
        _maxMintAmount = newMaxMintAmount;
        emit MaxMintAmountUpdated(newMaxMintAmount);
    }

    

    function updateBaseExtension(string memory newBaseExtension)
        external
        onlyOwner
    {
        _baseExtension = newBaseExtension;
        emit BaseExtensionUpdated(newBaseExtension);
    }

    function updateNotRevealedURI(string memory newNotRevealedURI)
        external
        onlyOwner
    {
        _notRevealedUri = newNotRevealedURI;
        emit NotRevealedURIUpdated(newNotRevealedURI);
    }

    function updateRevealStatus(bool revealed) external onlyOwner {
        _revealed = revealed;
        emit Reveal();
    }

   

    function updateWithdrawAddress(address payable newWithdrawAddress)
        external
        onlyOwner
    {
        require(
            newWithdrawAddress != address(0),
            "Invalid withdraw address"
        );
        _withdrawAddress = newWithdrawAddress;
    }

    function mintFor(address recipient, uint256 mintAmount) external onlyOwner {
        require(
            recipient != address(0),
            "Invalid recipient address"
        );

        uint256[] memory tokenIds = new uint256[](mintAmount);
        for (uint256 i = 0; i < mintAmount; i++) {
            uint256 tokenId = totalSupply().add(1);
            _safeMint(recipient, tokenId);
            tokenIds[i] = tokenId;
        }

        emit MintFor(msg.sender, recipient, tokenIds);
    }

    function burn(uint256 tokenId) external {
        require(
            _exists(tokenId),
            "ERC721: token does not exist"
        );
        require(
            _isApprovedOrOwner(msg.sender, tokenId),
            "ERC721: burn caller is not owner nor approved"
        );

        _burn(tokenId);
    }

    function burnBatch(uint256[] calldata tokenIds) external {
        uint256 tokenCount = tokenIds.length;
        require(tokenCount > 0, "No token IDs provided");

        for (uint256 i = 0; i < tokenCount; i++) {
            uint256 tokenId = tokenIds[i];
            require(
                _exists(tokenId),
                "ERC721: token does not exist"
            );
            require(
                _isApprovedOrOwner(msg.sender, tokenId),
                "ERC721: burn caller is not owner nor approved"
            );

            _burn(tokenId);
        }
    }

   
    
    function safeTransferBatch(address[] calldata to, uint256[] calldata tokenIds) external {
        require(to.length == tokenIds.length, "Arrays length mismatch");

        uint256 length = to.length;
        for (uint256 i = 0; i < length; i++) {
            safeTransferFrom(msg.sender, to[i], tokenIds[i], "");
        }
    }


    function tokenExists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }
}
