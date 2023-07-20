// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTAuction is IERC721Receiver, Pausable, Ownable {
      struct Auction {
        IERC721 nftContract;
        uint256[] nftIds;
        address payable seller;
        uint256 startPrice;
        uint256 reservePrice;
        uint256 buyNowPrice;
        address payable highestBidder;
        uint256 highestBid;
        uint256 bidIncrement;
        uint256 endBlock;
        bool ended;
     
    }

    Auction[] public auctions;
    uint256 public auctionFee = 50; // 5%, expressed as parts per 1000

    event AuctionCreated(uint256 auctionIndex, address seller, uint256 startPrice, uint256 endBlock);
    event NewBid(uint256 auctionIndex, address bidder, uint256 bidAmount);
    event AuctionEnded(uint256 auctionIndex, address winner, uint256 winningBid);
    event AuctionCancelled(uint256 auctionIndex);
    event BuyNow(uint256 auctionIndex, address buyer, uint256 price);

    function createAuction(
    IERC721 _nftContract,
    uint256[] memory _nftIds,
    uint256 _startPrice,
    uint256 _reservePrice,
    uint256 _buyNowPrice,
    uint256 _bidIncrement,
    uint256 _auctionDuration
  
) public whenNotPaused {
    uint256 endBlock = block.number + _auctionDuration;

    // Approve the transfer of NFTs to the auction contract
    for (uint256 i = 0; i < _nftIds.length; i++) {
        _nftContract.approve(address(this), _nftIds[i]);
    }

    auctions.push(Auction({
        nftContract: _nftContract,
        nftIds: _nftIds,
        seller: payable(msg.sender),
        startPrice: _startPrice,
        reservePrice: _reservePrice,
        buyNowPrice: _buyNowPrice,
        highestBidder: payable(address(0)),
        highestBid: 0,
        bidIncrement: _bidIncrement,
        endBlock: endBlock,
        ended: false
       
    }));

    emit AuctionCreated(auctions.length - 1, msg.sender, _startPrice, endBlock);
}


    function bid(uint256 auctionIndex) public payable whenNotPaused {
        Auction storage auction = auctions[auctionIndex];

        require(block.number <= auction.endBlock, "This auction has ended.");
        require(!auction.ended, "This auction has already ended.");
        require(msg.value >= auction.startPrice, "Your bid is below the starting price.");
        require(msg.value >= auction.highestBid + auction.bidIncrement, "Your bid increment is less than the minimum bid increment.");
        require(msg.value < auction.buyNowPrice, "Use buyNow function to end the auction immediately.");

        if (auction.highestBid != 0) {
            (bool success, ) = auction.highestBidder.call{value: auction.highestBid}("");
            require(success, "Refund failed.");
        }

        auction.highestBidder = payable(msg.sender);
        auction.highestBid = msg.value;

        emit NewBid(auctionIndex, msg.sender, msg.value);
    }

    function buyNow(uint256 auctionIndex) public payable whenNotPaused {
        Auction storage auction = auctions[auctionIndex];

        require(!auction.ended, "This auction has already ended.");
        require(msg.value == auction.buyNowPrice, "Sent value must be equal to buy now price.");

        auction.ended = true;

        uint256 fee = auction.buyNowPrice * auctionFee / 1000;
        uint256 sellerProceeds = auction.buyNowPrice - fee;

        // Transfer NFTs to buyer
        for(uint i = 0; i < auction.nftIds.length; i++){
            auction.nftContract.transferFrom(address(this), msg.sender, auction.nftIds[i]);
        }

        // Send money to seller
        (bool success, ) = auction.seller.call{value: sellerProceeds}("");
        require(success, "Transfer of bid to seller failed.");

         // Transfer fee to contract owner
        (bool feeSuccess, ) = owner().call{value: fee}("");
        require(feeSuccess, "Transfer of fee to owner failed.");


        emit BuyNow(auctionIndex, msg.sender, msg.value);
    }

    function endAuction(uint256 auctionIndex) public whenNotPaused {
        Auction storage auction = auctions[auctionIndex];

        require(msg.sender == auction.seller, "You are not the seller.");
        require(!auction.ended, "This auction has already ended.");
        require(block.number > auction.endBlock, "The auction is not over yet.");

        auction.ended = true;

        if(auction.highestBid >= auction.reservePrice){
            uint256 fee = auction.highestBid * auctionFee / 1000;
            uint256 sellerProceeds = auction.highestBid - fee;

            // Transfer NFTs to highest bidder
            for(uint i = 0; i < auction.nftIds.length; i++){
                auction.nftContract.transferFrom(address(this), auction.highestBidder, auction.nftIds[i]);
            }

            // Send money to seller
            (bool success, ) = auction.seller.call{value: sellerProceeds}("");
            require(success, "Transfer of bid to seller failed.");

            // Transfer fee to contract owner
            (bool feeSuccess, ) = owner().call{value: fee}("");
            require(feeSuccess, "Transfer of fee to owner failed.");

    

            emit AuctionEnded(auctionIndex, auction.highestBidder, auction.highestBid);
        } else {
            // Return NFTs to seller
            for(uint i = 0; i < auction.nftIds.length; i++){
                auction.nftContract.transferFrom(address(this), auction.seller, auction.nftIds[i]);
            }

            emit AuctionEnded(auctionIndex, address(0), 0);
        }
    }

    function cancelAuction(uint256 auctionIndex) public whenNotPaused {
        Auction storage auction = auctions[auctionIndex];

        require(msg.sender == auction.seller, "You are not the seller.");
        require(!auction.ended, "This auction has already ended.");

        auction.ended = true;

        if(auction.highestBid > 0){
            // Return bid to highest bidder
            (bool success, ) = auction.highestBidder.call{value: auction.highestBid}("");
            require(success, "Refund failed.");
        }

        // Return NFTs to seller
        for(uint i = 0; i < auction.nftIds.length; i++){
            auction.nftContract.transferFrom(address(this), auction.seller, auction.nftIds[i]);
        }

        emit AuctionCancelled(auctionIndex);
    }

    function onERC721Received(address, address, uint256, bytes calldata) public pure override returns (bytes4) {
    return this.onERC721Received.selector;
}

}
