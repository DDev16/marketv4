import React, { useState, useEffect,useContext } from 'react';
import Web3 from 'web3';
import '../../../components/Marketplace/Auction/GetAllAuctions.css';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; 
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import Swal from 'sweetalert2'; 
import { Web3Context } from '../../../utils/Web3Provider.js';



const IERC721ABI = JSON.parse(process.env.REACT_APP_ERC721_ABI)

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


function GetAllAuctions() {
  const { web3, auction } = useContext(Web3Context); // Access web3 and auction from the context

  const [auctions, setAuctions] = useState([]);
  const [sortedAuctions, setSortedAuctions] = useState([]);
  const [sortingMethod, setSortingMethod] = useState('active');
  const [loading, setLoading] = useState(true);
  const [bidValue, setBidValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');


  const filteredAuctions = sortedAuctions.filter((auction) =>
  auction.auctionIndex.toString().includes(searchQuery)
);


async function buyNow(auctionIndex, price) {
  try {
    if (!web3 || !auction) {
      console.error('Web3 or auction not initialized.');
      return;
    }

    const accounts = await web3.eth.getAccounts();
    const fromAccount = accounts[0];

    // Show "Buying..." message while the transaction is being signed
    Swal.fire({
      icon: 'info',
      title: 'Buying...',
      text: 'Please wait while we process your request.',
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    const transaction = await auction.methods.buyNow(auctionIndex).send({ from: fromAccount, value: web3.utils.toWei(price, 'ether') });
    
    // Check if the transaction receipt has a status of 1 (successful transaction)
    if (transaction.status) {
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Auction purchased successfully.',
      });
    } else {
      throw new Error('Transaction status not successful.');
    }
  } catch (error) {
    console.error('Error while purchasing auction:', error);
    let errorMessage = 'Failed to purchase the auction. Please try again later.';

    if (error.message.includes('This auction has already ended.')) {
      errorMessage = 'This auction has already ended.';
    } else if (error.message.includes('Sent value must be equal to buy now price.')) {
      errorMessage = 'Sent value must be equal to buy now price.';
    } else if (error.message.includes('Transfer of bid to seller failed.')) {
      errorMessage = 'Transfer of bid to seller failed.';
    } else if (error.message.includes('Transfer of fee to owner failed.')) {
      errorMessage = 'Transfer of fee to owner failed.';
    }

    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: errorMessage,
    });
  }
}


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
  try {
    if (!web3 || !auction) {
      console.error('Web3 or auction not initialized.');
      return;
    }

    Swal.fire({
      icon: 'info',
      title: 'Placing Bid...',
      text: 'Please wait while we process your request.',
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
    });


    const accounts = await web3.eth.getAccounts();
    const fromAccount = accounts[0];

    // Check if the auction has ended before placing a bid
    const auctionEnded = await auction.methods
      .hasAuctionEnded(auctionIndex)
      .call();

    if (auctionEnded) {
      Swal.fire({
        icon: 'warning',
        title: 'Auction Ended!',
        text: 'Sorry, this auction has already ended.',
      });
      return;
    }

    await auction.methods
      .bid(auctionIndex)
      .send({ from: fromAccount, value: web3.utils.toWei(bidValue, 'ether') });

    // Display a success message after the transaction
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Bid placed successfully.',
    });
  } catch (error) {
    console.error('Error while placing bid:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: 'Failed to place the bid. Please try again later.',
    });
  }
}
useEffect(() => {
  // Check if web3 and auction contract are initialized
  if (web3 && auction) {
    const fetchAuctions = async () => {
      try {
        const result = await auction.methods.getAllAuctions().call();
        const parsedAuctions = result[1].map(parseAuctionData);

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
      } catch (error) {
        console.error('Error fetching auctions:', error);
      }
    };

    fetchAuctions();
  }
}, [web3, auction, sortingMethod]);


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
        <option value="active">Active Auctions</option>
          <option value="time">Time Remaining</option>
          <option value="highestBid">Highest Bid</option>
          <option value="buyNowPrice">Buy Now Price</option>
          
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
                      fontSize: '20px',
                      marginTop: '30px'
                    }}>
                      {token.description}
                    </p>}
                </div>
              ))}
            </Carousel>
            <button className="auctionbuy" onClick={() => buyNow(auction.auctionIndex, WeiToEther(auction.buyNowPrice))}>
              Buy Now
            </button>
            <form onSubmit={e => { e.preventDefault(); placeBid(auction.auctionIndex); }} className="bid-form">
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
