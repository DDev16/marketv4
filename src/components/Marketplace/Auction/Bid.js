import { useContext, useState } from 'react';
import { Web3Context } from '../../../utils/Web3Provider.js';

export default function Bid() {
    const { auctionContract } = useContext(Web3Context);
    const [bidAmount, setBidAmount] = useState('');
    const [auctionIndex, setAuctionIndex] = useState('');
  
    const handleBid = async () => {
      try {
        // Make sure we have a connection
        if (!auctionContract) throw new Error('Contract is not connected');
  
        // Convert bidAmount to Wei
        const bidAmountInWei = auctionContract.methods.web3.utils.toWei(bidAmount, 'ether');
  
        // Get the current account
        const accounts = await auctionContract.methods.web3.eth.getAccounts();
        if (accounts.length === 0) throw new Error('No account is connected');
  
        // Call the bid function
        await auctionContract.methods.bid(auctionIndex).send({ from: accounts[0], value: bidAmountInWei });
  
        // Log success
        console.log('Bid placed successfully');
      } catch (err) {
        // Log errors
        console.error('There was an error!', err);
      }
    };
  
    return (
      <div>
        <input
          type='text'
          value={auctionIndex}
          onChange={e => setAuctionIndex(e.target.value)}
          placeholder='Enter the auction index'
        />
        <input
          type='text'
          value={bidAmount}
          onChange={e => setBidAmount(e.target.value)}
          placeholder='Enter your bid amount in Ether'
        />
        <button onClick={handleBid}>Bid</button>
      </div>
    );
  }