import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import AuctionContractABI from '../../../abi/Auction.js';
import IERC721ABI from '../../../abi/ERC721.js';
import '../../../components/Marketplace/Auction/GetAllAuctions.css';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useMediaQuery } from '@mui/material';
import Typography from '@mui/material/Typography';

const AUCTION_CONTRACT_ADDRESS = '0x59b670e9fA9D0A427751Af201D676719a970857b';



function parseAuctionData(auctionTuple, index) {
  return {
    auctionIndex: index,
    nftContract: auctionTuple[0],
    nftIds: auctionTuple[1],
    seller: auctionTuple[2],
    startPrice: auctionTuple[3],
    reservePrice: auctionTuple[4],
    buyNowPrice: auctionTuple[5],
    highestBidder: auctionTuple[6],
    highestBid: auctionTuple[7],
    bidIncrement: auctionTuple[8],
    endTimestamp: auctionTuple[9],
    ended: auctionTuple[10],
    tokenURIs: [], // added this field to store token URIs
    metadata: [] // added this field to store token metadata
  };
}

function ipfsToHttp(uri) {
  const cleanUri = uri.replace(/^ipfs:/, '').replace(/^\/+/, '');
  return `https://ipfs.io/ipfs/${cleanUri}`;
}

function WeiToEther(wei) {
  const web3 = new Web3();
  return web3.utils.fromWei(wei, 'ether');
}

async function buyNow(auctionIndex, price) {
  const web3 = new Web3(window.ethereum);
  const auctionContractInstance = new web3.eth.Contract(AuctionContractABI, AUCTION_CONTRACT_ADDRESS);
  const accounts = await web3.eth.getAccounts();
  const fromAccount = accounts[0];
  await auctionContractInstance.methods.buyNow(auctionIndex).send({ from: fromAccount, value: web3.utils.toWei(price, 'ether') });
}

function GetAllAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [sortedAuctions, setSortedAuctions] = useState([]);
  const [sortingMethod, setSortingMethod] = useState('highestBid');
  const [loading, setLoading] = useState(true);
  const [bidValue, setBidValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');


  const filteredAuctions = sortedAuctions.filter((auction) =>
  auction.auctionIndex.toString().includes(searchQuery)
);

  function sortAuctions(auctions, sortingMethod) {
    switch(sortingMethod) {
      case 'time':
        return [...auctions].sort((a, b) => a.endTimestamp - b.endTimestamp);
      case 'highestBid':
        return [...auctions].sort((a, b) => (b.highestBid || 0) - (a.highestBid || 0));
      case 'buyNowPrice':
        return [...auctions].sort((a, b) => (b.buyNowPrice || 0) - (a.buyNowPrice || 0));
      case 'active':
        return [...auctions].filter((a) => !a.ended);
      case 'ended':
        return [...auctions].filter((a) => a.ended);
      default:
        return auctions;
    }
  }

  function calculateTimeRemaining(endTimestamp) {
    const now = new Date();
    const endDate = new Date(endTimestamp * 1000);
    const diffInMilliseconds = endDate - now;
    const days = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffInMilliseconds / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diffInMilliseconds / (1000 * 60)) % 60);
    const seconds = Math.floor((diffInMilliseconds / 1000) % 60);
    return { days, hours, minutes, seconds };
  }

  async function placeBid(auctionIndex) {
    const web3 = new Web3(window.ethereum);
    const auctionContractInstance = new web3.eth.Contract(AuctionContractABI, AUCTION_CONTRACT_ADDRESS);
    const accounts = await web3.eth.getAccounts();
    const fromAccount = accounts[0];
    await auctionContractInstance.methods.bid(auctionIndex).send({ from: fromAccount, value: web3.utils.toWei(bidValue, 'ether') });
  }

  useEffect(() => {
    const web3 = new Web3(window.ethereum);
    const auctionContractInstance = new web3.eth.Contract(AuctionContractABI, AUCTION_CONTRACT_ADDRESS);

    async function fetchAuctions() {
      const result = await auctionContractInstance.methods.getAllAuctions().call();
      const parsedAuctions = result[1].map(parseAuctionData);

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
      setSortedAuctions(sortAuctions(parsedAuctions, sortingMethod));
      setLoading(false);
    }

    fetchAuctions();
  }, []);

  useEffect(() => {
    setSortedAuctions(sortAuctions(auctions, sortingMethod));
  }, [sortingMethod, auctions]);


  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="auctionbg">
       <div className="container">
      <h1 data-text="Auctions">Auctions</h1>
      </div>
    <div className="container">
    
      <Accordion style={{width: "100%", margin: "0 auto"}} defaultExpanded={true}>
      
        <AccordionSummary
        
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
                    <Typography>View Auctions</Typography>

        </AccordionSummary>
        <AccordionDetails>
      <div className="sort-container">
        <label>Sort by: </label>
        <select value={sortingMethod} onChange={(e) => setSortingMethod(e.target.value)}>
          <option value="time">Time Remaining</option>
          <option value="highestBid">Highest Bid</option>
          <option value="buyNowPrice">Buy Now Price</option>
          <option value="active">Active Auctions</option>
          <option value="ended">Ended Auctions</option>
        </select>
        <input
        className='search-auctions'
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search index..."
        />
      </div>
      {filteredAuctions.map((auction) => {
        const { days, hours, minutes, seconds } = calculateTimeRemaining(auction.endTimestamp);
        return (
          <div className="auction" key={auction.auctionIndex}>
            <Carousel showThumbs={true} showStatus={true} showIndicators={true} infiniteLoop={true} autoPlay={true} transitionTime={500}>
              {auction.metadata.map((token, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', height: '700px' }}>
                  <img src={token.image} alt={token.name} className="carouselImage" style={{ flexGrow: 1 }} />
                  {token.description && 
                    <p className="legend" style={{ 
                      maxHeight: '200px', 
                      overflow: 'auto', 
                      flexGrow: 1,
                      backgroundColor: '#1e1e1e', 
                      color: '#fff', 
                      fontSize: '20px'
                    }}>
                      {token.description}
                    </p>}
                </div>
              ))}
            </Carousel>
            <button className="auctionbuy" onClick={() => buyNow(auction.auctionIndex, WeiToEther(auction.buyNowPrice))}>
              Buy Now
            </button>
            <form onSubmit={e => { e.preventDefault(); placeBid(auction.auctionIndex); }} class="bid-form">
              <input type="text" value={bidValue} onChange={e => setBidValue(e.target.value)} placeholder="Enter the amount to bid" />
              <input type="submit" value="Place Bid" />
            </form>
            <p className="auctionIndex">Auction Index: {auction.auctionIndex}</p>
            <p className="tag">NFT Contract: {auction.nftContract}</p>
            <p className="tag">IDs: {auction.nftIds.join(', ')}</p>
            <p className="tag">Seller: {auction.seller}</p>
            <p className="tag">Start Price: {WeiToEther(auction.startPrice)} Ether</p>
            <p className="tag">Reserve Price: {WeiToEther(auction.reservePrice)} Ether</p>
            <p className="tag">Buy Now Price: {WeiToEther(auction.buyNowPrice)} Ether</p>
            <p className="tag">Highest Bidder: {auction.highestBidder}</p>
            <p className="tag">Highest Bid: {WeiToEther(auction.highestBid)} Ether</p>
            <p className="tag">Bid Increment: {WeiToEther(auction.bidIncrement)} Ether</p>
            <p className="tag">End Time: {new Date(auction.endTimestamp * 1000).toLocaleString()}</p>
            <p className="tag">Time Remaining: {days} days, {hours} hours, {minutes} minutes, and {seconds} seconds</p>
            <p className="tag">Auction Ended: {auction.ended ? "Yes" : "No"}</p>
          </div>
        );
      })}
     </AccordionDetails>
    </Accordion>
  </div>
  </div>
);

}

export default GetAllAuctions;
