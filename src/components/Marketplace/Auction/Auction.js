import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import AuctionContractABI from '../../../abi/Auction.js';
import ERC721ContractABI from '../../../abi/ERC721.js';


// Contract address.
const AUCTION_CONTRACT_ADDRESS = '0x59b670e9fA9D0A427751Af201D676719a970857b';

const AuctionComponent = () => {
    const [account, setAccount] = useState(null);
    const [web3, setWeb3] = useState(null);
    const [nftContractAddress, setNftContractAddress] = useState("");
    const [nftIds, setNftIds] = useState("");
    const [startPrice, setStartPrice] = useState("");
    const [reservePrice, setReservePrice] = useState("");
    const [buyNowPrice, setBuyNowPrice] = useState("");
    const [bidIncrement, setBidIncrement] = useState("");
    const [auctionDuration, setAuctionDuration] = useState("");

    useEffect(() => {
        const initWeb3 = async () => {
            if(window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);

                // Request account access
                await window.ethereum.enable();
                const accounts = await web3Instance.eth.getAccounts();
                setAccount(accounts[0]);

                window.ethereum.on('accountsChanged', (accounts) => {
                    setAccount(accounts[0]);
                });
            } else {
                alert("Please install MetaMask!");
            }
        }
        initWeb3();
    }, []);

    const createAuction = async (event) => {
        event.preventDefault();

        const nftContract = new web3.eth.Contract(ERC721ContractABI, nftContractAddress);
        await nftContract.methods.setApprovalForAll(AUCTION_CONTRACT_ADDRESS, true)
            .send({ from: account });
        
        const auctionContract = new web3.eth.Contract(AuctionContractABI, AUCTION_CONTRACT_ADDRESS);
        await auctionContract.methods.createAuction(
            nftContractAddress, 
            nftIds.split(',').map(id => Number(id)), 
            web3.utils.toWei(startPrice, 'ether'), 
            web3.utils.toWei(reservePrice, 'ether'), 
            web3.utils.toWei(buyNowPrice, 'ether'), 
            web3.utils.toWei(bidIncrement, 'ether'), 
            Number(auctionDuration)
        ).send({ from: account });
    }

    return (
        
        <div>
            
            <h2>Create Auction</h2>
            <form onSubmit={createAuction}>
                <input type="text" onChange={event => setNftContractAddress(event.target.value)} placeholder="NFT Contract Address" />
                <input type="text" onChange={event => setNftIds(event.target.value)} placeholder="NFT IDs (comma-separated)" />
                <input type="text" onChange={event => setStartPrice(event.target.value)} placeholder="Start Price (in Ether)" />
                <input type="text" onChange={event => setReservePrice(event.target.value)} placeholder="Reserve Price (in Ether)" />
                <input type="text" onChange={event => setBuyNowPrice(event.target.value)} placeholder="Buy Now Price (in Ether)" />
                <input type="text" onChange={event => setBidIncrement(event.target.value)} placeholder="Bid Increment (in Ether)" />
                <input type="text" onChange={event => setAuctionDuration(event.target.value)} placeholder="Auction Duration (in days)" />
                <button type="submit">Create Auction</button>
            </form>
        </div>
    );
}

export default AuctionComponent;
