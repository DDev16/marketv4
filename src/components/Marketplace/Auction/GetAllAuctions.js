import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import AuctionContractABI from '../../../abi/Auction.js';
import IERC721ABI from '../../../abi/ERC721.js';
import '../../../components/Marketplace/Auction/GetAllAuctions.css';
const AUCTION_CONTRACT_ADDRESS = '0x162A433068F51e18b7d13932F27e66a3f99E6890';
function parseAuctionData(auctionTuple) {
    console.log(auctionTuple); // Add this line

    return {
        nftContract: auctionTuple[0],
        nftIds: auctionTuple[1],
        seller: auctionTuple[2],
        startPrice: auctionTuple[3],
        reservePrice: auctionTuple[4],
        buyNowPrice: auctionTuple[5],
        highestBidder: auctionTuple[6],
        highestBid: auctionTuple[7],
        bidIncrement: auctionTuple[8],
        endTimestamp: auctionTuple[9],  // Changed from endBlock to endTimestamp
        ended: auctionTuple[10],
        tokenURIs: [], // added this field to store token URIs
        metadata: [] // added this field to store token metadata
    };
}


function ipfsToHttp(uri) {
    const cleanUri = uri.replace(/^ipfs:/, '').replace(/^\/+/, '');
    return `https://ipfs.io/ipfs/${cleanUri}`;
  }
  

function GetAllAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create a function to calculate the remaining time for the auction
  function calculateTimeRemaining(endTimestamp) {
    const now = new Date();
    const endDate = new Date(endTimestamp * 1000); // Convert the timestamp to milliseconds
    const diffInMilliseconds = endDate - now;

    const days = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffInMilliseconds / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diffInMilliseconds / (1000 * 60)) % 60);
    const seconds = Math.floor((diffInMilliseconds / 1000) % 60);

    return {days, hours, minutes, seconds};
  }


  useEffect(() => {
    const web3 = new Web3(window.ethereum);
    const auctionContractInstance = new web3.eth.Contract(AuctionContractABI, AUCTION_CONTRACT_ADDRESS);

    async function fetchAuctions() {
      const result = await auctionContractInstance.methods.getAllAuctions().call();
      const parsedAuctions = result.map(parseAuctionData);

      // Fetch token URIs and metadata for each auction
      await Promise.all(parsedAuctions.map(async (auction) => {
        const nftContractInstance = new web3.eth.Contract(IERC721ABI, auction.nftContract);
        auction.tokenURIs = await Promise.all(auction.nftIds.map(id => nftContractInstance.methods.tokenURI(id).call()));
        auction.metadata = await Promise.all(auction.tokenURIs.map(async (uri) => {
            const res = await fetch(ipfsToHttp(uri));
            const data = await res.json();
            if (data.image && data.image.startsWith('ipfs:')) {
                data.image = ipfsToHttp(data.image);
            }
            return data;
        }));
        
      }));

      setAuctions(parsedAuctions);
      setLoading(false);
    }

    fetchAuctions();
  }, []);

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="container">
    <h1>All Auctions</h1>
    {auctions.map((auction, index) => {
  console.log(auction); // Add this line
  const {days, hours, minutes, seconds} = calculateTimeRemaining(auction.endTimestamp);return (
    <div className="auction" key={index}>
    <p className="tag">NFT Contract: {auction.nftContract}</p>
    {auction.metadata.map((token, i) => (
    <div className="nft-info" key={i}>
    <div>
    <img src={token.image} alt={token.name} />
    </div>
    <div>
    <p>{token.name}</p>
    <p>{token.description}</p>
    </div>
    </div>
    ))}
    <p className="tag">Seller: {auction.seller}</p>
    <p className="tag">Start Price: {auction.startPrice}</p>
    <p className="tag">Reserve Price: {auction.reservePrice}</p>
    <p className="tag">Buy Now Price: {auction.buyNowPrice}</p>
    <p className="tag">Highest Bidder: {auction.highestBidder}</p>
    <p className="tag">Highest Bid: {auction.highestBid}</p>
    <p className="tag">Bid Increment: {auction.bidIncrement}</p>
    <p className="tag">End Time: {new Date(auction.endTimestamp * 1000).toLocaleString()}</p>
    <p className="tag">Time Remaining: {days} days, {hours} hours, {minutes} minutes, and {seconds} seconds</p>
    <p className="tag">Auction Ended: {auction.ended ? "Yes" : "No"}</p>
    </div>
    )})}
    </div>
    );
};

export default GetAllAuctions;
