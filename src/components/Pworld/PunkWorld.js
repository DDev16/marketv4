import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import contractABI from '../../abi/ERC721.js';
import Swal from 'sweetalert2';
import { keyframes } from 'styled-components';
import { bounceIn } from 'react-animations';
import styledComponents from 'styled-components';
import logo from '../../assets/logo.png';
import backgroundImage from '../../assets/background.jpg';
import gifLeft from '../../assets/punk1.png';
import gifRight from '../../assets/punk2.png';
import styled from 'styled-components';
import RotatingSphere from './3d.js';

const bounceInAnimation = keyframes`${bounceIn}`;

const StyledContainer = styledComponents.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; 
  height: 100vh;
  width: 100vw;
  padding: 1rem;
  text-align: center;
  background-image: url(${backgroundImage});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  margin-bottom: 50px;
  overflow: hidden;
  perspective: 1000px;

  @media (max-width: 480px) {
    padding: 0.5rem;
    height: auto;
    min-height: 100vh;
  }
`;

const StyledAccountText = styledComponents.p`
  color: #fff;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-family: monospace; /* Add this line */
  overflow-wrap: anywhere; /* Add this line */

  @media (max-width: 480px) {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }
`;

const StyledGifContainerLeft = styledComponents.div`
  position: absolute;
  top: 20%;
  left: 8%;
  width: 30%;
  height: 60%;
  background-image: url(${gifLeft});
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
  z-index: 0;
  border: 2px solid #fff;
  border-radius: 50%;
  filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.6));
  transform-style: preserve-3d;
  transform: rotateY(45deg) translateZ(-100px);
  transition: transform 0.5s;

  

  @media (max-width: 600px) {
    top: 55%; 
    left: 20%;
    width: 200px; 
    height: 200px; 
  }

  @media (min-device-width: 360px) 
    and (max-device-width: 740px) 
    and (-webkit-device-pixel-ratio: 3) { 
    top: 65%; 
    left: 12%;
    width: 250px; 
    height: 250px; 
  }

  @media (max-height: 600px) {
    top: 65%;
    left: 10%;
    width: 180px;
    height: 180px;
  }

  @media (max-width: 392px) and (max-height: 436px) {
    top: 65%; 
    left: 20%;
    width: 200px; 
    height: 200px; 
  }
`;

const StyledGifContainerRight = styledComponents.div`
  position: absolute;
  top: 20%;
  right: 8%;
  width: 30%;
  height: 60%;
  background-image: url(${gifRight});
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
  z-index: 0;
  border: 2px solid #fff;
  border-radius: 50%;
  filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.6));
  transform-style: preserve-3d;
  transform: rotateY(-45deg) translateZ(-100px);
  transition: transform 0.5s;



  @media (max-width: 600px) {
    top: 55%; 
    right: 20%;
    width: 200px; 
    height: 200px; 
  }

  @media (min-device-width: 360px) 
    and (max-device-width: 740px) 
    and (-webkit-device-pixel-ratio: 3) { 
    top: 65%; 
    right: 12%;
    width: 250px; 
    height: 250px; 
  }

  @media (max-height: 600px) {
    top: 65%;
    right: 10%;
    width: 180px;
    height: 180px;
  }
  @media (max-width: 392px) and (max-height: 436px) {
    top: 65%; 
    right: 20%;
    width: 200px; 
    height: 200px; 
  }
`;

const StyledButtonContainer = styledComponents.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;

  @media (max-width: 480px) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
  }
`;

const StyledButton = styledComponents(Button)`
  margin-top: 1rem;
  animation: 2s ${bounceInAnimation};
  position: relative;
  z-index: 1;
 
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6));
  transition: filter 0.3s;

  &:hover {
    filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.8));
  }
`;


const StyledWorldButton = styledComponents(Button)`
  margin-top: 2rem;
  animation: 2s ${bounceInAnimation};
  position: relative;
  z-index: 1;
 
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6));
  transition: filter 0.3s;

  &:hover {
    filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.8));
  }

  @media (max-width: 480px) {
    margin: 0.5rem;
  }

`;

const StyledThreeContainer = styledComponents.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1; 

  @media (max-width: 768px) {
    height: 100vh;
    width: 100vw;
  }
`;


const Heading = styled.h1`
  position: relative;
  font-size: 3rem;
  font-weight: bold;
  color: #f9f9f9;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  transition: transform 0.3s ease-in-out;
  margin-top: 0;
  z-index: 1; // Position the text in front of the pseudo-element



  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, #00e8e4, #ff4081, #d50064, #ff4081, #00e8e4);
    z-index: -1;
    opacity: 0.6;
    filter: blur(8px); // Apply the blur effect to the background
    transition: opacity 0.3s ease-in-out;
  }

  @media (max-width: 600px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;


const StyledInfoMessage = styledComponents.p`
  color: #fff;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-top: 2rem;

  @media (max-width: 480px) {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }
`;



const PunkWorld = () => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Your smart contract address
  const contractAddress = "0xcd61F8F6E215CE93F7724a6BB4F5641b108D0276";

  // Initialize web3, account, and contract
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.enable();
        const accounts = await web3Instance.eth.getAccounts();
        const contractInstance = new web3Instance.eth.Contract(
          contractABI,
          contractAddress
        );
        setAccount(accounts[0]);
        setWeb3(web3Instance);
        setContract(contractInstance);
      } else {
        Swal.fire(
          'No Ethereum wallet found',
          'Please install MetaMask to use this dApp!',
          'error'
        );
      }
    };
    init();
  }, []);

//   const mintToken = async (mintAmount) => {
//     setIsLoading(true);
//     setTooltipText('Minting in progress...');
//     try {
//       const result = await contract.methods.mint(mintAmount).send({
//         from: account,
//         onTransactionHash: () => {
//           Swal.fire({
//             title: 'Transaction in Progress',
//             html: 'Minting NFT...',
//             allowOutsideClick: false,
//             onBeforeOpen: () => {
//               Swal.showLoading();
//               Swal.getContent().querySelector('strong').textContent =
//                 Swal.getTimerLeft();
//             },
//           });
//         },
//       });
//       if (result) {
//         Swal.fire({
//           title: 'Transaction successful',
//           text: 'Your NFT is minted successfully!',
//           icon: 'success',
//           confirmButtonText: 'Cool',
//           onAfterClose: () => setTooltipText('Click to mint another NFT'),
//         });
//       }
//     } catch (error) {
//       Swal.fire('Failed!', `Failed to mint NFT: ${error.message}`, 'error');
//     }
//     setIsLoading(false);
//   };




const mintToken = async () => {
    const imageUrl = `https://source.unsplash.com/1600x900/?psychedelic?${Date.now()}`;

    Swal.fire({
      title: 'Congratulations!',
      text: 'Your NFT has been minted successfully.',
      imageUrl: imageUrl,
      imageWidth: 400,
      imageHeight: 200,
      imageAlt: 'Custom image',
      timer: 5000,  // 5 seconds timer, auto-closes after this time.
      timerProgressBar: true,
      backdrop: `
        rgba(0,0,123,0.4)
        url("https://sweetalert2.github.io/images/nyan-cat.gif")
        left top
        no-repeat
      `,
    });
  };


  const enterPunkMetaWorld = () => {
    // Code to handle entering the Punk MetaWorld
    // Replace with your own logic
    console.log('Entering Punk MetaWorld...');
   

  };

  return (
    <StyledContainer>
      <Heading>Welcome to PunksWorld NFT Minting Dapp</Heading>

      <StyledGifContainerLeft />
      <StyledGifContainerRight />

      {/* <StyledLogo src={logo} alt="Logo" /> */}
      <StyledThreeContainer>
        <RotatingSphere />
      </StyledThreeContainer>
      <StyledAccountText>
        {account ? `Your account: ${account}` : 'No account connected'}
      </StyledAccountText>
      {isLoading ? (
        <div>
          <LinearProgress />
          <CircularProgress />
        </div>
      ) : (
        <StyledButtonContainer>
            <StyledButton variant="contained" color="primary" onClick={() => mintToken(1)}>
              Mint NFT
            </StyledButton>
            <StyledInfoMessage>
      Mint an NFT to gain access to PunksWorld!
    </StyledInfoMessage>
          <StyledWorldButton 
    sx={{ marginTop: '2rem' }} // Add margin-top directly here
    variant="contained" 
    color="secondary" 
    href="https://vr-world-jade.vercel.app/"
    onClick={enterPunkMetaWorld}>
  Enter Punk MetaWorld
</StyledWorldButton>
        </StyledButtonContainer>
      )}
    </StyledContainer>
  );
};

export default PunkWorld;
