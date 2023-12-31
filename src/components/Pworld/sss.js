import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import ProgressBar from './ProgressBar';
import './PunkWorld.css'; // Import your custom CSS for styling
import punk2Gif from '../../assets/punk2.gif'; // Update the file path accordingly
import Swal from 'sweetalert2';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { v4 as uuidv4 } from 'uuid';


const contractABI = JSON.parse(process.env.REACT_APP_PWOLRD_ABI);
const contractAddress = '0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE';
const maxSupply = 486;

function PunkWorld() {
  const [web3, setWeb3] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [account, setAccount] = useState(null);
  const [mintAmount, setMintAmount] = useState(1);
  const [fees, setFees] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [numMinted, setNumMinted] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [extraNFTsRemaining, setExtraNFTsRemaining] = useState(0);
  const [extraNFTRewards, setExtraNFTRewards] = useState([]);
const [showSuccessAlert, setShowSuccessAlert] = useState(false);
const [showExtraNFTAlert, setShowExtraNFTAlert] = useState(false);

  useEffect(() => {
    async function fetchExtraNFTsRemaining() {
      if (contractInstance) {
        try {
          const remainingExtraNFTs = await contractInstance.methods.getExtraNFTsRemaining().call();
          setExtraNFTsRemaining(parseInt(remainingExtraNFTs));
        } catch (error) {
          setError('Error fetching remaining extra NFTs');
        }
      }
    }
  
    fetchExtraNFTsRemaining(); // Move the function call here
  
  }, [contractInstance]);

  // Helper function to get remaining supply
  function getRemainingSupply() {
    return maxSupply - totalSupply;
  }


  // Define the fetchExtraNFTsRemaining function
  async function fetchExtraNFTsRemaining() {
    if (contractInstance) {
      try {
        const remainingExtraNFTs = await contractInstance.methods.getExtraNFTsRemaining().call();
        setExtraNFTsRemaining(parseInt(remainingExtraNFTs));
      } catch (error) {
        setError('Error fetching remaining extra NFTs');
      }
    }
  }

  async function getTotalSupply() {
    if (contractInstance) {
      try {
        const supply = await contractInstance.methods.totalSupply().call();
        setTotalSupply(parseInt(supply));
      } catch (error) {
        setError('Error fetching total supply');
      }
      setIsLoading(false);
    }
  }

  getTotalSupply();

  // Minting error messages
  const getMintErrorMessage = (error) => {
    switch (error) {
      case 'insufficient_balance':
        return 'Insufficient balance to mint NFTs.';
      case 'transaction_failed':
        return 'Transaction failed. Please try again.';
      default:
        return 'Error minting NFTs.';
    }
  };

  // Minting status
  const [isMinting, setIsMinting] = useState(false);

  async function handleMint() {
    if (!contractInstance || !account) {
      setError('Please connect your wallet');
      return;
    }
  
    setIsMinting(true);
  
    try {
      // Convert mintAmount to BigNumber to ensure proper formatting
      const mintAmountBN = web3.utils.toBN(mintAmount);
  
      // Call the smart contract's mint function
      const gasLimit = 2000000; // Adjust this value based on your needs
      const tx = await contractInstance.methods.mint(mintAmountBN).send({
        from: account,
        gas: gasLimit,
        value: web3.utils.toWei((fees * mintAmount).toString(), 'ether'), // Pay the minting fees in Ether
      });
  
      if (tx.status) {
        setSuccessMessage(`Successfully minted ${mintAmount} Voxel Vandal NFT(s)`);
  
        if (tx.events && tx.events.ExtraNFTReceived) {
          // Reset the extraNFTsRewards to an empty array before adding new rewards
          setExtraNFTRewards([]);
  
          const newExtraNFTRewards = Array.isArray(tx.events.ExtraNFTReceived)
            ? tx.events.ExtraNFTReceived
            : [tx.events.ExtraNFTReceived];
  
          setExtraNFTRewards((prevRewards) => [
            ...prevRewards,
            ...newExtraNFTRewards.map((event) => event.returnValues.tokenId),
          ]);
  
          setShowExtraNFTAlert(true);
        }
  
        setShowSuccessAlert(true);
  
        // Update total supply and remaining supply
        await Promise.all([getTotalSupply(), fetchExtraNFTsRemaining()]);
      } else {
        throw new Error('Transaction failed.');
      }
    } catch (error) {
      setError(getMintErrorMessage(error.message));
    } finally {
      setIsMinting(false);
    }
  }
  
   
  const paypalOptions = {
    "client-id": "ARcPYWTEtikp22Axh7RuCAa48VmJx0qbaHj1I67pRINmmC0uN5J7Mye0yB7NENMWvDjuRLYWIwkq0fDy",
    currency: "USD",
    intent: "capture",
    "data-order-id": uuidv4(),
  };

  async function createOrder(data, actions) {
    console.log("createOrder started");
    if (mintAmount <= 0) {
      // Handle the error or prevent order creation
    }
  
 
  
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: 75.00 * mintAmount,
          },
        },
      ],
    });
  }


  async function onApprove(data, actions) {
    const nonce = Math.floor(Math.random() * 1000000);
    const timestamp = Math.floor(Date.now() / 1000);
    
    const message = web3.utils.soliditySha3(account, nonce, timestamp);
    const signature = await web3.eth.personal.sign(message, account);
    
    const order = await actions.order.capture();
    
    if (order.status === 'COMPLETED') {
        console.log("PayPal payment completed");
        
        console.log("Front-End Data: account:", account, "nonce:", nonce, "timestamp:", timestamp);
        console.log("Generated Message:", message);
        console.log("Generated Signature:", signature);
        
        try {
            console.log("Values before verifying PayPal payment: account:", account, "nonce:", nonce, "timestamp:", timestamp, "signature:", signature);
            
            const txVerify = await contractInstance.methods.verifyPayPalPayment(account, nonce, timestamp, signature).send({ from: account });
            console.log("Verified PayPal payment:", txVerify);
        } catch (error) {
            console.error("Error verifying PayPal payment:", error);
        }
        
        try {
            console.log("Values before minting: mintAmount:", mintAmount, "nonce:", nonce, "timestamp:", timestamp, "signature:", signature);
            
            const txMint = await contractInstance.methods.payPalMint(mintAmount, nonce, timestamp, signature).send({ from: account });
            console.log("Minting transaction:", txMint);
        } catch (error) {
            console.error("Error minting NFT:", error);
        }
    } else {
        console.log("PayPal payment not completed");
    }
}

  
  
  useEffect(() => {
    async function initWeb3() {
      if (window.ethereum) {
        try {
          await ethereum.request({ method: 'eth_requestAccounts' });
          setWeb3(new Web3(window.ethereum));
        } catch (error) {
          setError('User denied account access');
        }
      } else if (window.web3) {
        setWeb3(new Web3(window.web3.currentProvider));
      } else {
        setError('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }
    }

    initWeb3();
  }, []);

  
  useEffect(() => {
    if (web3) {
      setContractInstance(new web3.eth.Contract(contractABI, contractAddress));
    }
  }, [web3]);

  useEffect(() => {
    async function getAccount() {
      if (web3) {
        try {
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);
        } catch (error) {
          setError('Error fetching accounts');
        }
      }
    }

    getAccount();
  }, [web3]);

  useEffect(() => {
    async function getFees() {
      if (contractInstance && web3) {
        try {
          const feesInWei = await contractInstance.methods.cost().call();
          const feesInEth = web3.utils.fromWei(feesInWei, 'ether');
          setFees(parseFloat(feesInEth));
        } catch (error) {
          setError('Error fetching fees');
        }
      }
    }

 
    getFees();
  }, [contractInstance, web3]);

 

  useEffect(() => {
    async function getNumMinted() {
      if (contractInstance) {
        try {
          const numMinted = await contractInstance.methods.balanceOf(account).call();
          setNumMinted(parseInt(numMinted));
        } catch (error) {
          setError('Error fetching minted NFTs');
        }
      }
    }

    if (account) {
      getNumMinted();
    }
  }, [contractInstance, account]);
  

  useEffect(() => {
    // Show the success message in a Swal alert
    if (showSuccessAlert) {
      Swal.fire({
        icon: 'success',
        title: successMessage,
        showConfirmButton: false,
        timer: 2000,
      }).then(() => setShowSuccessAlert(false));
    }
  
    // Show the extra NFT rewards in a Swal alert
    if (showExtraNFTAlert) {
      Swal.fire({
        title: 'Congratulations! You received the following extra NFTs:',
        text: 'You received the following extra NFTs:',
        html: extraNFTRewards.map((tokenId) => `<p>Token ID: ${tokenId}</p>`).join(''),
        icon: 'success',
      }).then(() => setShowExtraNFTAlert(false));
    }
  }, [showSuccessAlert, showExtraNFTAlert, successMessage, extraNFTRewards]);

  function formatAddress(address) {
    const start = address.slice(0, 6);
    const end = address.slice(-4);
    return `${start}...${end}`;
  }

     // Define the function to handle the link click
     function handleEnterPunkWorldClick() {
      window.open('https://punkworld.vercel.app/', '_blank');
    }
  

  return (
    <PayPalScriptProvider options={{ "client-id": "ARcPYWTEtikp22Axh7RuCAa48VmJx0qbaHj1I67pRINmmC0uN5J7Mye0yB7NENMWvDjuRLYWIwkq0fDy" }}>

    <div className="punk-world-container">
      <h1>Voxel Vandals of PunkWorld</h1>
  
      {error && <p className="error-message">{error}</p>}
      {isLoading ? <p>Loading...</p> : (
        <>
          <p className="connected-account">Connected account: {formatAddress(account)}</p>
          <p>Total Supply: {totalSupply}/{maxSupply} NFTs</p>
          <p>Remaining Supply: {getRemainingSupply()} NFTs</p>
          <p>Remaining Extra Rewards NFTs: {extraNFTsRemaining}</p>
  
          <p>Minting fees: {fees} FLR</p>
          <p>
            Each Voxel Vandal NFT is a unique collectible that comes with exclusive features and benefits ie; Early Access to Punk world Metaverse, Airdrops, Staking and more. Mint your own
            Voxel Vandal NFT and join a community of passionate collectors!
          </p>
          <p>
            Theres a Random Extra NFT rewards mechanism built in, there is a 75% chance you get rewarded an Extra NFT when minting!
          </p>
          <p> Please make sure you are connected to Flare Networks before minting, Happy Minting! 🥳 </p>
  
          <div className="mint-form">
            <input
              type="number"
              value={mintAmount}
              onChange={(e) => setMintAmount(parseInt(e.target.value))}
              min={1}
              max={Math.min(getRemainingSupply(), 10)} // Limit the max mint to remaining supply or 10, whichever is lower
            />
            <button onClick={handleMint} disabled={!account || isMinting || getRemainingSupply() < mintAmount}>
              {isMinting ? 'Minting...' : `Mint ${mintAmount} NFT(s)`}
            </button>
          </div>
          <PayPalButtons
          style={{
            color: "silver",
            shape: "pill"
          }}
        createOrder={(data, actions) => createOrder(data, actions)}
        onApprove={(data, actions) => onApprove(data, actions)}
        options={paypalOptions}
      />
        <button onClick={handleEnterPunkWorldClick}>Enter Punk World</button>
          
          <div className="progress-bar-container">
            <ProgressBar value={totalSupply} max={maxSupply} />
          </div>
          <img src={punk2Gif} alt="Punk2 GIF" className="punk-gif" />
        </>
      )}
    </div>
    </PayPalScriptProvider>

  );
  
}

export default PunkWorld;