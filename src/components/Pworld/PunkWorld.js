import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import contractABI from '../../abi/Pworld.js';
import ProgressBar from './ProgressBar';
import './PunkWorld.css'; // Import your custom CSS for styling
import punk2Gif from '../../assets/punk2.gif'; // Update the file path accordingly

const contractAddress = '0x193521C8934bCF3473453AF4321911E7A89E0E12';
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
  
      // Handle the success of the transaction
      if (tx.status) {
        setSuccessMessage(`Successfully minted ${mintAmount} NFT(s)`);
  
        if (tx.events && tx.events.ExtraNFTReceived) {
          // Reset the extraNFTsRewards to an empty array before adding new rewards
          setExtraNFTRewards([]);
  
          const newExtraNFTRewards = tx.events.ExtraNFTReceived;
          if (Array.isArray(newExtraNFTRewards)) {
            // Multiple extra NFTs received
            setExtraNFTRewards((prevRewards) => [...prevRewards, ...newExtraNFTRewards.map((event) => event.returnValues.tokenId)]);
          } else {
            // Only 1 extra NFT received
            setExtraNFTRewards((prevRewards) => [...prevRewards, newExtraNFTRewards.returnValues.tokenId]);
          }
        }
  
        // Update total supply and remaining supply
        await Promise.all([getTotalSupply(), fetchExtraNFTsRemaining()]);
      } else {
        setError('Transaction failed. Please try again.');
      }
    } catch (error) {
      setError(getMintErrorMessage(error.message));
    }
  
    setIsMinting(false);
  }
  
  
  
  useEffect(() => {
    async function initWeb3() {
      if (window.ethereum) {
        try {
          await window.ethereum.enable();
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
  

  return (
    <div className="punk-world-container">
      <h1>Voxel Vandals of PunkWorld</h1>

      {error && <p className="error-message">{error}</p>}
      {isLoading ? <p>Loading...</p> : (
        <>
          <p>Connected account: {account}</p>
          <p>Total Supply: {totalSupply}/{maxSupply} NFTs</p>
          <p>Remaining Supply: {getRemainingSupply()} NFTs</p>
          <p>Remaining Extra Rewards NFTs: {extraNFTsRemaining}</p>

          <p>Minting fees: {fees} FLR</p>
          <p>
            Each Voxel Vandal NFT is a unique collectible that comes with exclusive features and benefits ie; Early Access to Punk world Metaverse, Airdrops, Staking and more. Mint your own
            Voxel Vandal NFT and join a community of passionate collectors!
          </p>
          <p>
            Theres a Random Extra NFT rewards mechanism built in, there is a 75% chance you get rewarded an Extra NFT when minting!          </p>
          {/* <p>
            Voxel Vandal holders will recieve 5% of Marketplace fees for 6 months, paid on a monthly basis!
          </p> */}
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
          {successMessage && <p className="success-message">{successMessage}</p>}

          {extraNFTRewards.length > 0 &&  (
   <div >
    <p>Congratulations! You received the following extra NFTs:</p>
    <ul className="mint-form">
      {extraNFTRewards.map((tokenId) => (
        <li  key={tokenId}>Token ID: {tokenId} </li>
      ))}
    </ul>
  </div>
)}

          <div className="progress-bar-container">
            <ProgressBar value={totalSupply} max={maxSupply} />
          </div>
          <img src={punk2Gif} alt="Punk2 GIF" className="punk-gif" />

        </>
      )}
    </div>
  );
}

export default PunkWorld;