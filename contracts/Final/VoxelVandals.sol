// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol"; // Import the ERC721 Receiver interface
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract VoxelVandals is ERC721Enumerable, Ownable, IERC721Receiver {
    using Strings for uint256;

    string baseURI;
    string public baseExtension = ".json";
    uint256 public cost = 5 ether;
    uint256 public maxSupply = 486;
    uint256 public maxMintAmount = 50;
    bool public paused = false;
    bool public revealed = true;
    string public notRevealedUri;
    // Mapping to keep track of the number of extra NFTs each address has received 6739
    mapping(address => uint256) public extraNFTsReceived;
    uint256 public extraRewardPercentage = 15; // The percentage of extra NFT rewards (default set to 15%)

    // Event to log the details of the received NFT
    event NFTReceived(
        address operator,
        address from,
        uint256 tokenId,
        bytes data
    );

    // Event to display the extra NFT reward received upon minting
    event ExtraNFTReceived(
        address indexed receiver,
        address indexed contractAddress,
        uint256 tokenId
    );

    // Event to display the randomly generated number when minting an NFT
event RandomNumberGenerated(uint256 randomNumber);

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _initBaseURI,
        string memory _initNotRevealedUri
    ) ERC721(_name, _symbol) {
        setBaseURI(_initBaseURI);
        setNotRevealedURI(_initNotRevealedUri);
    }

    // Internal
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

   // Variable to store the generated random number for each minting transaction
uint256 private randomNumber;


function mint(uint256 _mintAmount) public payable {
        uint256 supply = totalSupply();
        require(!paused);
        require(supply + _mintAmount <= maxSupply); // Check if the requested quantity exceeds the maxSupply

        if (msg.sender != owner()) {
            require(msg.value >= cost * _mintAmount); // Adjust the cost based on the requested quantity
        }

        // Generate the random number only once per minting transaction
        if (randomNumber == 0) {
            randomNumber = (uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), block.timestamp, msg.sender))) % 100) + 1;
            // Emit the generated random number for this minting transaction.
            emit RandomNumberGenerated(randomNumber);
        }

        for (uint256 i = 0; i < _mintAmount; i++) {
            uint256 tokenId = supply + i + 1;
            _safeMint(msg.sender, tokenId);

            // Mint the extra NFT as a reward if the random number falls within the range for the specified reward percentage
            if (randomNumber <= extraRewardPercentage) {
                if (depositedNFTs.length > 0) {
                    uint256 selectedNFTIndex = uint256(keccak256(abi.encode(randomNumber))) % depositedNFTs.length;
                    DepositedNFT memory selectedNFT = depositedNFTs[selectedNFTIndex];

                    _mintExtraReward(msg.sender, selectedNFT.contractAddress, selectedNFT.tokenId);

                    // Emit the ExtraNFTReceived event with contract address and tokenId
                    emit ExtraNFTReceived(msg.sender, selectedNFT.contractAddress, selectedNFT.tokenId);

                    // Remove the rewarded NFT from the array to prevent it from being used again
                    _removeDepositedNFT(selectedNFTIndex);
                }
            }
        }
    }



 // Function to update the percentage of extra NFT rewards
    function updateExtraRewardPercentage(uint256 _newPercentage) public onlyOwner {
        require(_newPercentage <= 100, "Percentage must be between 0 and 100");
        extraRewardPercentage = _newPercentage;
    }

    function walletOfOwner(address _owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        if (revealed == false) {
            return notRevealedUri;
        }

        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        tokenId.toString(),
                        baseExtension
                    )
                )
                : "";
    }

    // Only owner
    function reveal() public onlyOwner {
        revealed = true;
    }

    function setCost(uint256 _newCost) public onlyOwner {
        cost = _newCost;
    }

    function setmaxMintAmount(uint256 _newmaxMintAmount) public onlyOwner {
        maxMintAmount = _newmaxMintAmount;
    }

    function setNotRevealedURI(string memory _notRevealedURI) public onlyOwner {
        notRevealedUri = _notRevealedURI;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function setBaseExtension(string memory _newBaseExtension)
        public
        onlyOwner
    {
        baseExtension = _newBaseExtension;
    }

    function pause(bool _state) public onlyOwner {
        paused = _state;
    }

    function withdraw() public payable onlyOwner {
        // This will payout the owner 100% of the contract balance.
        // Do not remove this otherwise you will not be able to withdraw the funds.
        // =============================================================================
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os);
        // =============================================================================
    }

    // Deposited NFT struct
    struct DepositedNFT {
        address contractAddress;
        uint256 tokenId;
    }

    // Array to store deposited NFTs
    DepositedNFT[] public depositedNFTs;

    // Function to deposit NFTs from another contract
    function depositNFT(address _contractAddress, uint256[] memory _tokenIds)
        public
        onlyOwner
    {
        require(_tokenIds.length > 0, "No token IDs provided");

        for (uint256 i = 0; i < _tokenIds.length; i++) {
            uint256 _tokenId = _tokenIds[i];

            // Ensure that the contract address is a valid ERC721 contract
            require(
                ERC721(_contractAddress).ownerOf(_tokenId) == msg.sender,
                "NFT not owned by sender"
            );

            // Transfer the ownership of the NFT from the sender to this contract
            ERC721(_contractAddress).safeTransferFrom(
                msg.sender,
                address(this),
                _tokenId
            );

            depositedNFTs.push(
                DepositedNFT({
                    contractAddress: _contractAddress,
                    tokenId: _tokenId
                })
            );
        }
    }

      function _mintExtraReward(
    address _receiver,
    address _contractAddress,
    uint256 _tokenId
) internal {
    // Transfer the extra NFT from the contract to the receiver
    ERC721(_contractAddress).safeTransferFrom(
        address(this),
        _receiver,
        _tokenId
    );

    // Increase the count of extra NFTs received for the receiver
    extraNFTsReceived[_receiver]++;
}

    function _removeDepositedNFT(uint256 _index) internal {
        require(_index < depositedNFTs.length, "Invalid index");
        depositedNFTs[_index] = depositedNFTs[depositedNFTs.length - 1];
        depositedNFTs.pop();
    }

    // Implement the ERC721Receiver interface
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes memory data
    ) public virtual override returns (bytes4) {
        // Implement any additional logic here, if required.
        // For now, just return the predefined value.
        // Also, use the variables to avoid the "unused variable" error.
        // For example, you can log the details of the received NFT:
        emit NFTReceived(operator, from, tokenId, data);
        return IERC721Receiver.onERC721Received.selector;
    }

    


function getExtraNFTsRemaining() public view returns (uint256) {
    uint256 depositedNFTCount = depositedNFTs.length;
    uint256 totalExtraNFTsMinted = 0;

    // Calculate the total count of extra NFTs minted
    for (uint256 i = 0; i < depositedNFTCount; i++) {
        totalExtraNFTsMinted += extraNFTsReceived[address(this)];
    }

    // Calculate the remaining count of extra NFTs in the contract
    uint256 remainingExtraNFTs = depositedNFTCount - totalExtraNFTsMinted;
    return remainingExtraNFTs;
}

}
