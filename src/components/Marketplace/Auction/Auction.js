import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import AuctionContractABI from '../../../abi/Auction.js';
import ERC721ContractABI from '../../../abi/ERC721.js';
import styled from 'styled-components';
import Swal from 'sweetalert2'; // import SweetAlert2


const Container = styled.div`
    width: 70%;
    margin: 2em auto;
    background-color: #f5f5f5;
    border-radius: 10px;
    padding: 2em;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
    color: #333;
    font-size: 2.5em;
    text-align: center;
    margin-bottom: 1em;
    margin-top:30px;

`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.5em;
`;

const Input = styled.input`
    padding: 1em;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-size: 1.1em;
    outline: none;
    transition: border-color 0.3s;

    &:focus {
        border-color: #007BFF;
        box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
    }
`;

const Label = styled.label`
    font-size: 1.2em;
`;

const Description = styled.p`
    font-size: 1em;
    color: #777;
    
`;

const SubmitButton = styled.button`
    padding: 1em;
    border-radius: 5px;
    border: none;
    background-color: #007BFF;
    color: white;
    font-size: 1.2em;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background-color: #0056b3;
    }

    
`;

const ErrorText = styled.span`
    color: red;
    margin-bottom: 10px;
    display: block;
`;


// Contract address.
const AUCTION_CONTRACT_ADDRESS = '0x4826533B4897376654Bb4d4AD88B7faFD0C98528';

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
    const [error, setError] = useState(null); // add this

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

        // Basic form validation
        if (!web3.utils.isAddress(nftContractAddress)) {
            Swal.fire('Error', 'Please enter a valid contract address', 'error');
            return;
        }

        try {
            const nftContract = new web3.eth.Contract(ERC721ContractABI, nftContractAddress);
            await nftContract.methods.setApprovalForAll(AUCTION_CONTRACT_ADDRESS, true).send({ from: account });
            
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

            Swal.fire('Success', 'Auction created successfully!', 'success');
        } catch (e) {
            Swal.fire('Error', e.message, 'error');
        }
    }

    return (
        <Container>
            <Title>Create Auction</Title>
            <Form onSubmit={createAuction}>
                <Label> NFT Contract Address </Label>
                <Description>This is the address of the NFT Contract associated with the auction.</Description>
                <Input type="text" onChange={event => setNftContractAddress(event.target.value)} placeholder="e.g., 0xAbCdEf1234567890" />

                <Label> NFT IDs (comma-separated) </Label>
                <Description>Enter the IDs of the NFTs for this auction, separated by commas.</Description>
                <Input type="text" onChange={event => setNftIds(event.target.value)} placeholder="e.g., 1, 2, 3" />

                <Label> Starting Price (in Native Token) </Label>
                <Description>The starting price for this auction in your native token (e.g., SGB/FLR).</Description>
                <Input type="text" onChange={event => setStartPrice(event.target.value)} placeholder="e.g., 1.5" />

                <Label> Reserve Price (in Native Token) </Label>
                <Description>The reserve price is the lowest price at which the item can be sold. Also in your native token.</Description>
                <Input type="text" onChange={event => setReservePrice(event.target.value)} placeholder="e.g., 2.0" />

                <Label> Buy Now Price (in Native Token) </Label>
                <Description>If set, users can choose to buy the item outright at this price.</Description>
                <Input type="text" onChange={event => setBuyNowPrice(event.target.value)} placeholder="e.g., 3.0" />

                <Label> Bid Increment (in Native Token) </Label>
                <Description>This is the minimum increment between bids.</Description>
                <Input type="text" onChange={event => setBidIncrement(event.target.value)} placeholder="e.g., 0.1" />

                <Label> Auction Duration (in days) </Label>
                <Description>This is the length of the auction, in days.</Description>
                <Input type="text" onChange={event => setAuctionDuration(event.target.value)} placeholder="e.g., 7" />

                {error && <ErrorText>{error}</ErrorText>}

                <Description>
                    Please make sure you have sufficient balance and approve the NFT contract before creating the auction.
                </Description>

                <SubmitButton type="submit">Create Auction</SubmitButton>
            </Form>
        </Container>
    );
}

export default AuctionComponent;