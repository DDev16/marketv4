import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

import "../../components/FreeMint/FreeMint.css";
import "../../components/FreeMint/FreeMint.css";
import exampleGif from '../../assets/example.gif'; // Import the GIF
import Swal from 'sweetalert2';

const contractAddress = '0x5d1a74EB382326E3C26322994F905a82e2A33C47';
const contractAbi = JSON.parse(process.env.REACT_APP_FREEMINT_ABI);
const tokenAbi = JSON.parse(process.env.REACT_APP_IERC20_ABI);
const maxSupply = 2478;
const mintAmount = 1; // Change the minting amount if needed
const pid = 2; // Placeholder value, replace this with the appropriate _pid value based on your application logic

const FreeMint = () => {
  const [connectedAccount, setConnectedAccount] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [totalSupply, setTotalSupply] = useState(0);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3.eth.getAccounts();
          setConnectedAccount(accounts[0]);
          setWeb3(web3);
  
          // Check if the connected network matches the expected network ID for Flare
          const networkId = await web3.eth.net.getId();
          const expectedNetworkId = 14; //  network ID for Flare Network
          if (networkId === expectedNetworkId) {
            const contractInstance = new web3.eth.Contract(contractAbi, contractAddress);
            setContractInstance(contractInstance);
          } else {
            console.error('Connected to a different network. FreeMint is only available on Flare Network.');
          }
        } catch (error) {
          console.error('Error connecting to Web3', error);
        }
      } else {
        console.error('Web3 not found');
      }
    };
    initWeb3();

    const fetchContractData = async () => {
      if (contractInstance) {
        try {
          const totalSupply = await contractInstance.methods.totalSupply().call();
          setTotalSupply(parseInt(totalSupply));
        } catch (error) {
          console.error('Error fetching contract data:', error);
        }
      }
    };

    fetchContractData();
  }, [contractInstance]);

  const handleMint = async () => {
    try {
      setIsMinting(true);
  
      if (!web3) {
        throw new Error('Web3 not initialized');
      }
  
      if (!connectedAccount) {
        throw new Error('No connected account found');
      }
  
      // Fetch tokens and cost value
      const tokens = await contractInstance.methods.AllowedCrypto(pid).call();
      const paytokenAddress = tokens.paytoken;
      const paytoken = new web3.eth.Contract(tokenAbi, paytokenAddress);
      const costval = tokens.costvalue;
  
      // Check total supply and mint amount
      const totalSupply = await contractInstance.methods.totalSupply().call();
      if (!totalSupply) {
        throw new Error('Error getting total supply');
      }
      if (totalSupply + mintAmount > maxSupply) {
        throw new Error('Mint amount exceeds max supply');
      }
  
      // Transfer tokens and mint
      const transferResult = await paytoken.methods
        .transferFrom(connectedAccount, contractAddress, costval)
        .send({ from: connectedAccount });
  
      if (transferResult.status) {
        for (let i = 1; i <= mintAmount; i++) {
          const mintResult = await contractInstance.methods
            .mintpid(connectedAccount, i, pid)
            .send({ from: connectedAccount });
          console.log('Minting result:', mintResult);
        }
  
        // Transaction successful, provide user feedback here
        Swal.fire({
          icon: 'success',
          title: 'Congratulaions! Your Free Minting was Successful!',
          text: 'Your NFTs have been minted.',
        });
      }
    } catch (error) {
      console.error('Error while minting:', error);
      // Provide user-friendly error feedback here
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while minting. Please try again later.',
      });
    } finally {
      setIsMinting(false);
    }
  };
  
  return (
    <div className="free-mint-container">
            <img src={exampleGif} alt="Example GIF" /> {/* Display the GIF */}

      <h1 className="free-mint-title">Free Mint</h1>
      <p className="free-mint-info">
        Total Supply: {totalSupply} / {maxSupply}
      </p>
      <p className="free-mint-info">
        Minting is completely free! You can mint your NFTs without any charges. The only cost involved is the gas fee required to process the transaction on the blockchain. Please make sure you are connected to Flare Networks to proceed with the minting process.
      </p>
      <button
        onClick={handleMint}
        disabled={isMinting}
        className={`free-mint-button ${isMinting ? 'disabled' : ''}`}
      >
        {isMinting ? 'Minting...' : 'Mint'}
      </button>
    </div>
  );
};

export default FreeMint;



