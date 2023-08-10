import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import styles from '../../../../components/Marketplace/Auction/MyAuctions/MyAuctions.css';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import styled from 'styled-components';
import { keyframes } from 'styled-components';
import 'sweetalert2/dist/sweetalert2.min.css';
import Swal from 'sweetalert2';


const CONTRACT_ADDRESS = process.env.REACT_APP_AUCTION_ADDRESS_31337;
// Import the ABI from the environment variable
const AuctionContractABI = JSON.parse(process.env.REACT_APP_AUCTION_ABI);

// ... Rest of your code remains the same

// ERC721 ABI
const ERC721_ABI = [
    {
        constant: true,
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        name: 'tokenURI',
        outputs: [{ name: '', type: 'string' }],
        payable: false,
        type: 'function'
    }
];

const MyAuctionsContainer = styled.div`
    max-width: 1000px; /* Wider container for larger screens */
    margin: 0 auto;
    padding: 40px; /* More spacing for better readability */
    background-color: #f9f9f9; /* Subtle background color */
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1); /* Soft shadow for depth */
    border-radius: 10px; /* Rounded corners */
`;
const Title = styled.h1`
    font-size: 40px; /* Further increased font size for a bold impact */
    margin-bottom: 15px; /* Reduced margin for a tighter spacing */
    color: #333; /* Opted for a slightly darker and warmer title color */
    text-align: center; /* Center-align the title for a clean and balanced presentation */
    text-transform: uppercase; /* Uppercase for a stronger visual presence */
    letter-spacing: 1.5px; /* Increased letter spacing for better legibility */
    font-weight: 700; /* Further increased font weight for maximum boldness */
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2); /* Subtle text shadow for depth and contrast */
    transition: font-size 0.3s, color 0.3s, transform 0.3s; /* Added smooth transitions for interactions */

    &:hover {
        font-size: 42px; /* Slightly larger font size on hover for a dynamic effect */
        color: #555; /* Darker color on hover for a subtle interaction */
        transform: scale(1.05); /* Slight scale-up effect on hover for interactivity */
    }
`;

const AuctionItemContainer = styled.div`
    border: 1px solid #ddd; /* Softer border color */
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
    padding: 30px;
    margin-bottom: 30px;
    background-color: #fff; /* White background for clarity */
    border-radius: 8px; /* Rounded corners */
`;

const AuctionItemTitle = styled.h2`
    font-size: 26px; /* Slightly larger title font size */
    margin-bottom: 20px; /* Increased margin for spacing */
    color: #333; /* Darker title color for better contrast */
    text-align: center; /* Center-align the title */
    font-weight: 600; /* Add a slightly bold weight for emphasis */
    text-transform: uppercase; /* Convert text to uppercase for boldness */

    &:after {
        content: ""; /* Add an underline effect */
        display: block;
        width: 40px; /* Underline width */
        height: 3px; /* Underline thickness */
        background-color: #007bff; /* Blue underline color */
        margin: 8px auto 0; /* Position the underline */
    }
`;
const StyledCarousel = styled(Carousel)`
    position: relative; /* Ensure position is set for absolute arrow placement */

    .carousel-root {
        border-radius: 8px;
        overflow: hidden;
        position: relative; /* Set position for relative arrow placement */
    }

    .carousel .slider-wrapper {
        border-radius: 8px;
        overflow: hidden;
    }

    .slide {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 300px;
        background-color: #f5f5f5;
        border-radius: 8px;
    }

    img {
        max-width: 100%;
        max-height: 300px;
        object-fit: contain;
    }

    /* Customize carousel arrows */
    .carousel .control-arrow {
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        width: 32px;
        height: 32px;
        padding: 0; /* Remove inner padding */
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute; /* Set position for absolute arrow placement */
        top: calc(50% - 16px); /* Vertically center the arrows */
        z-index: 2; /* Ensure arrows are on top of the slides */
        cursor: pointer;
        transition: background-color 0.3s ease; /* Add transition for hover effect */

        &:hover {
            background-color: rgba(0, 0, 0, 0.7);
        }

        &.control-prev {
            left: -20px; /* Position left arrow to the left of the carousel */
        }

        &.control-next {
            right: -20px; /* Position right arrow to the right of the carousel */
        }
    }

    /* Style carousel indicators */
    .carousel .thumbs-wrapper {
        display: none; /* Hide indicators */
    }
`;


const AuctionItemDetail = styled.p`
    margin: 10px 0;
    font-size: 16px;
    color: #666; /* Subdued text color */
    line-height: 1.4; /* Slightly increased line height for readability */

    &:first-child {
        margin-top: 0; /* Remove top margin from the first detail */
    }

    strong {
        font-weight: 600; /* Bolden key details */
        color: #333; /* Darker color for strong elements */
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
`;

const Button = styled.button`
    background-color: #007bff;
    color: #fff;
    padding: 5px 10px;
    border: none;
    cursor: pointer;
    font-size: 14px;

    &:hover {
        background-color: #0056b3;
    }
`;

const MyAuctions = () => {
    const [auctions, setAuctions] = useState([]);
    const web3 = new Web3(window.ethereum);
    const [accounts, setAccounts] = useState(null); // <-- add this state
    const auctionContract = new web3.eth.Contract(AuctionContractABI, CONTRACT_ADDRESS);

    const fetchAuctions = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            try {
                // Request account access
                await window.ethereum.request({ method: 'eth_requestAccounts' });
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        } else {
            window.alert('Non-Ethereum browser detected. Please install MetaMask!');
            return;
        }

        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
        const auctionContract = new web3.eth.Contract(AuctionContractABI, CONTRACT_ADDRESS);
        const results = await auctionContract.methods.myAuctions().call({ from: accounts[0] });
        const myActiveAuctions = results[0];
        const auctionIndexes = results[1];

        const auctionsData = await Promise.all(myActiveAuctions.map(async (auction, index) => {
            const nftContract = new web3.eth.Contract(ERC721_ABI, auction.nftContract);
            const nftImages = await Promise.all(auction.nftIds.map(async (id) => {
                let uri = await nftContract.methods.tokenURI(id).call();
                uri = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
                console.log(`Metadata URL for token ${id}: ${uri}`);  // log metadata URL
                const response = await fetch(uri);
                const metadata = await response.json();
                const imageUrl = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');  // replace ipfs:// in image URL
                console.log(`Image URL for token ${id}: ${imageUrl}`);  // log image URL
                return imageUrl;
            }));

            return {
                auctionIndex: auctionIndexes[index],
                nftIds: auction.nftIds,
                nftImages,
                nftContract: auction.nftContract,
                startPrice: web3.utils.fromWei(auction.startPrice.toString(), 'ether'),
                highestBid: web3.utils.fromWei(auction.highestBid.toString(), 'ether'),
                reservePrice: web3.utils.fromWei(auction.reservePrice.toString(), 'ether'),
                buyNowPrice: web3.utils.fromWei(auction.buyNowPrice.toString(), 'ether'),
                bidIncrement: web3.utils.fromWei(auction.bidIncrement.toString(), 'ether'),
                endTimestamp: new Date(auction.endTimestamp * 1000)
            };
        }));

        setAuctions(auctionsData);
    };

    const endAuction = async (auctionIndex) => {
        try {
          if (!accounts) {
            throw new Error("Accounts not loaded yet");
          }
          // Show a loading indicator while the auction is being ended
          Swal.fire({
            title: 'Ending Auction',
            text: 'Please wait while the auction is being ended...',
            allowOutsideClick: false,
            onBeforeOpen: () => {
              Swal.showLoading();
            }
          });
      
          try {
            await auctionContract.methods.endAuction(auctionIndex).send({ from: accounts[0] });
            fetchAuctions();
            // Show a success message when the auction is successfully ended
            Swal.fire({
              icon: 'success',
              title: 'Auction Ended',
              text: 'The auction has been successfully ended!',
            });
          } catch (err) {
            console.error(err); // Log the actual error message to the console
      
            if (err.message.includes("The auction is still ongoing")) {
              // The error is related to the ongoing auction
              // Show a message to the user to wait until the auction is over
              Swal.fire({
                icon: 'info',
                title: 'Cannot End Auction',
                text: 'The auction is still ongoing. Please wait until it is over before ending it.',
              });
            } else {
              // Show an error message for other types of errors
              Swal.fire({
                icon: 'error',
                title: 'Error Ending Auction',
                text: err.message,
              });
            }
          }
        } catch (err) {
          // Show an error message when an error occurs
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.message,
          });
        }
      };
      
      const cancelAuction = async (auctionIndex) => {
        try {
          if (!accounts) {
            throw new Error("Accounts not loaded yet");
          }
          // Show a loading indicator while the auction is being canceled
          Swal.fire({
            title: 'Cancelling Auction',
            text: 'Please wait while the auction is being canceled...',
            allowOutsideClick: false,
            onBeforeOpen: () => {
              Swal.showLoading();
            }
          });
      
          await auctionContract.methods.cancelAuction(auctionIndex).send({ from: accounts[0] });
          fetchAuctions();
          // Show a success message when the auction is successfully canceled
          Swal.fire({
            icon: 'success',
            title: 'Auction Cancelled',
            text: 'The auction has been successfully cancelled!',
          });
        } catch (err) {
          // Show an error message when an error occurs
          Swal.fire({
            icon: 'error',
            title: 'Error Cancelling Auction',
            text: err.message,
          });
        }
      };
      
      useEffect(() => {
        fetchAuctions();
      }, []);

    return (
        <MyAuctionsContainer>
        <Title>My Auctions</Title>
        {auctions.length > 0 ? (
            auctions.map((auction) => (
                <AuctionItemContainer key={auction.auctionIndex}>
                    <AuctionItemTitle>Auction {auction.auctionIndex + 1}</AuctionItemTitle>
                    <StyledCarousel showThumbs={false}>
                        {auction.nftImages.map((image, index) => (
                            <div key={index}>
                                <img src={image} alt={`NFT ${auction.nftIds[index]}`} className={styles.auctionItem__image} />
                            </div>
                        ))}
                    </StyledCarousel>
    
                    <AuctionItemDetail>NFT Contract: {auction.nftContract}</AuctionItemDetail>
                    <AuctionItemDetail>NFT IDs: {auction.nftIds.join(', ')}</AuctionItemDetail>
                    <AuctionItemDetail>Start Price: {auction.startPrice}</AuctionItemDetail>
                    <AuctionItemDetail>Highest Bid: {auction.highestBid}</AuctionItemDetail>
                    <AuctionItemDetail>Reserve Price: {auction.reservePrice}</AuctionItemDetail>
                    <AuctionItemDetail>Buy Now Price: {auction.buyNowPrice}</AuctionItemDetail>
                    <AuctionItemDetail>Bid Increment: {auction.bidIncrement}</AuctionItemDetail>
                    <AuctionItemDetail>End Date: {auction.endTimestamp.toString()}</AuctionItemDetail>
                    <ButtonContainer>
                        <Button onClick={() => endAuction(auction.auctionIndex)}>End Auction</Button>
                        <Button onClick={() => cancelAuction(auction.auctionIndex)}>Cancel Auction</Button>
                    </ButtonContainer>
                    </AuctionItemContainer>
            ))
        ) : (
            <p>No auctions found</p>
        )}
    </MyAuctionsContainer>
);
};


export default MyAuctions;
