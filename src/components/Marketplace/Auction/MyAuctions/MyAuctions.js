import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import AuctionContractABI from '../../../../abi/Auction.js';
import styles from '../../../../components/Marketplace/Auction/MyAuctions/MyAuctions.module.css';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import styled from 'styled-components';
import { keyframes } from 'styled-components';
import 'sweetalert2/dist/sweetalert2.min.css';
import Swal from 'sweetalert2';

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const StyledCarousel = styled(Carousel)`
  font-family: 'Arial', sans-serif; /* Custom font */

  .carousel {
    animation: ${fadeIn} 1s ease; /* Fade-in animation */

    .slide {
      background: black;
      
    }

    .carousel-slider {
      .control-arrow:before {
        border-top: 8px solid transparent;
        border-bottom: 8px solid transparent;
        transition: border-color 0.3s ease;  /* Transition effect */
      }

      .control-next.control-arrow:before {
        border-left: 8px solid #2f3e9e;

        &:hover {
          border-left: 8px solid #4c5edf; /* Hover effect */
        }
      }

      .control-prev.control-arrow:before {
        border-right: 8px solid #2f3e9e;

        &:hover {
          border-right: 8px solid #4c5edf; /* Hover effect */
        }
      }
    }

    .thumbs-wrapper {
      margin: 20px 0;
      transition: margin 0.3s ease;  /* Transition effect */
    }

    .thumb {
      border: none;
      box-shadow: 0px 0px 10px rgba(0,0,0,0.15);  /* Box shadow for a better view */

      &:hover {
        box-shadow: 0px 0px 15px rgba(0,0,0,0.3); /* Hover effect */
      }
    }

    .thumbs .selected {
      border: none;
      box-shadow: 0px 0px 15px rgba(47,62,158,0.5);  /* Box shadow for selected thumb */
    }

    .carousel-status {
      color: #2f3e9e;
      font-weight: bold;  /* Bold text for better visibility */
    }
  }
`;


const MyAuctionsContainer = styled.div`
  padding: 20px;
  background-color: #F6F6F6;
  min-height: 100vh;
  margin-top: 60px;

  @media (max-width: 768px) {
    /* Adjust padding and margin-top for smaller screens (e.g., mobile devices) */
    padding: 10px;
    margin-top: 0px;
  }
`;
const Title = styled.h1`
  color: #2F3E9E;
  text-align: center;
  font-size: 42px;
  padding: 20px 0;
`;



const AuctionItemContainer = styled.div`
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);

  /* Apply flexbox to have more control over the layout of the auction item */
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const AuctionItemTitle = styled.h2`
  color: #2F3E9E;
  font-size: 24px;
  margin-bottom: 20px;
`;

const AuctionItemDetail = styled.p`
  font-size: 18px;
  line-height: 1.5;
  margin-bottom: 10px;
  word-break: break-all; /* Add this line to break long text */

`;

// Update the ButtonContainer styles to align buttons to the center
const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
`;

const Button = styled.button`
  background-color: #2F3E9E;
  color: #FFFFFF;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  margin: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #4c5edf;
  }
`;
const CONTRACT_ADDRESS = '0x968b1F578F9c225fa7e56A725B4aEB74813882a2';

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

const MyAuctions = () => {
    const [auctions, setAuctions] = useState([]);
    const web3 = new Web3(window.ethereum);
    const [accounts, setAccounts] = useState(null); // <-- add this state
    const auctionContract = new web3.eth.Contract(AuctionContractABI, CONTRACT_ADDRESS);

    const fetchAuctions = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
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
