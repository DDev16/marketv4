import React, { useState } from 'react';
import Web3 from 'web3';
import { IERC721_ABI } from './abi';  // import ABI from local file or define it in the script

const CONTRACT_ADDRESS = '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318';

// Assumes Metamask is injected into the window object and user is logged in
const web3 = new Web3(window.ethereum);

// Initiates contract
const contract = new web3.eth.Contract(IERC721_ABI, CONTRACT_ADDRESS);

const Auction = () => {
    const [bidValue, setBidValue] = useState('');
    const [auctionIndex, setAuctionIndex] = useState('');
    const [buyerAddress, setBuyerAddress] = useState('');

    const handleBidChange = (event) => {
        setBidValue(event.target.value);
    };

    const handleAuctionIndexChange = (event) => {
        setAuctionIndex(event.target.value);
    };

    const handleBuyerAddressChange = (event) => {
        setBuyerAddress(event.target.value);
    };

    const handleBidSubmit = async (event) => {
        event.preventDefault();

        // User's Metamask address
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];

        contract.methods.bid(auctionIndex)
            .send({ from: account, value: web3.utils.toWei(bidValue, 'ether') })
            .on('receipt', console.log)
            .on('error', console.error);
    };

    const handleBuyNowSubmit = async (event) => {
        event.preventDefault();

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];

        contract.methods.buyNow(auctionIndex)
            .send({ from: account, value: web3.utils.toWei(bidValue, 'ether') })
            .on('receipt', console.log)
            .on('error', console.error);
    };

    return (
        <div>
            <form onSubmit={handleBidSubmit}>
                <label>
                    Auction Index:
                    <input type="text" name="auctionIndex" onChange={handleAuctionIndexChange} />
                </label>
                <label>
                    Bid Value:
                    <input type="text" name="bidValue" onChange={handleBidChange} />
                </label>
                <input type="submit" value="Submit Bid" />
            </form>
            <form onSubmit={handleBuyNowSubmit}>
                <label>
                    Auction Index:
                    <input type="text" name="auctionIndex" onChange={handleAuctionIndexChange} />
                </label>
                <label>
                    Bid Value:
                    <input type="text" name="bidValue" onChange={handleBidChange} />
                </label>
                <input type="submit" value="Buy Now" />
            </form>
        </div>
    );
};

export default Auction;
