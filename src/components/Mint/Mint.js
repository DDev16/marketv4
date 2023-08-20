import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Web3Context } from '../../utils/Web3Provider';
import { NFTStorage, File } from 'nft.storage';
import '../Mint/Mint.css';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const nftStorageToken = process.env.REACT_APP_NFT_STORAGE;

const client = new NFTStorage({
  token: nftStorageToken, 
});

const Mint = () => {
  const { web3, contract } = useContext(Web3Context);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [uri, setUri] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 
  const [imagePreview, setImagePreview] = useState('');
  const [formError, setFormError] = useState('');
  const [freeMints, setFreeMints] = useState(0);
  const [videoPreview, setVideoPreview] = useState('');
  const [imageOnly, setImageOnly] = useState(true);
  const [nftLink, setNftLink] = useState('');
  const [royaltyRecipient, setRoyaltyRecipient] = useState('');
  const [royaltyBasisPoints, setRoyaltyBasisPoints] = useState('');
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [mintingFee, setMintingFee] = useState(0);

  useEffect(() => {
    // Function to fetch the network ID
    const fetchNetworkId = async () => {
      try {
        const networkId = await web3.eth.net.getId();
        setNetworkId(networkId);
      } catch (error) {
        console.error('Error fetching network ID:', error);
      }
    };
  
    if (web3) {
      fetchNetworkId();
    }
  }, [web3]);
  
  // Function to get the appropriate currency symbol based on network ID
  const getCurrencySymbol = () => {
    switch (networkId) {
      case 1: // Mainnet
        return 'ETH';
      case 19: // songbird
        return 'SGB';
      case 14: // Flare
        return 'FLR';
      case 4: // Rinkeby
        return 'FLR';
      case 42: // Kovan
        return 'FLR';
      case 56: // Binance Smart Chain Mainnet
        return 'BNB';
      case 97: // Binance Smart Chain Testnet
        return 'BNB';
      case 100: // xDAI
        return 'DAI';
      case 31337: // Hardhat Network
        return 'HH';
      // Add more cases for other networks if needed
      default:
        return 'SGB'; // Default to Songbird (SGB) network
    }
  };
  // Function to fetch the minting fee from the contract
  const fetchMintingFee = useCallback(async () => {
    try {
      if (contract) {
        const fee = await contract.methods.getMintingFee().call();
        setMintingFee(fee); // No need to convert since it's already in Wei
      }
    } catch (error) {
      console.error('Error fetching minting fee:', error);
    }
  }, [contract]);

  useEffect(() => {
    fetchMintingFee();
  }, [fetchMintingFee]);

  useEffect(() => {
    async function getAccount() {
      if (web3) {
        try {
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);
        } catch (error) {
          console.error('Error fetching accounts:', error);
        }
      }
    }

    getAccount();
  }, [web3]);
  

  useEffect(() => {
    const fetchFreeMints = async () => {
      try {
        if (web3 && contract) {
          const accounts = await web3.eth.getAccounts();
          const user = accounts[0];
          const numFreeMints = await contract.methods.getRemainingFreeMints(user).call();
          setFreeMints(numFreeMints);
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchFreeMints();
  }, [web3, contract]);
  

  const handleFileUpload = async (e) => {
    try {
      const file = e.target.files[0];
      setIsUploading(true); // Start uploading

      if (imageOnly) {
        setImagePreview(URL.createObjectURL(file));
        const metadata = await client.store({
          name: name,
          description: description,
          image: new File([file], file.name, { type: file.type }),
        });
        setUri(metadata.url);
        setNftLink(metadata.url);
      } else {
        setVideoPreview(URL.createObjectURL(file));
        const metadata = await client.store({
          name: name,
          description: description,
          image: new File([file], file.name, { type: file.type }),
        });
        setUri(metadata.url);
        setNftLink(metadata.url);
      }

      setIsUploading(false); // Upload complete
    } catch (error) {
      console.error(error);
      setFormError(`An error occurred while uploading the file: ${error.message}`);
      setIsUploading(false);
    }
  };
  

  const mintToken = async (e) => {
    e.preventDefault();
    try {
      setIsMinting(true);
      const accounts = await web3.eth.getAccounts();
      const user = accounts[0];
  
      if (freeMints > 0) {
        await contract.methods.mint(name, description, uri, royaltyRecipient, royaltyBasisPoints).send({ from: user });
        setFreeMints((prevFreeMints) => prevFreeMints - 1);
      } else {
        const weiAmount = web3.utils.toWei(mintingFee.toString(), 'ether');
        const transaction = contract.methods.mint(name, description, uri, royaltyRecipient, royaltyBasisPoints);
        const gas = await transaction.estimateGas({ from: user, value: weiAmount });
        await transaction.send({ from: user, value: weiAmount, gas });
      }
  
      setIsMinting(false);
      setFormError('');
      
      Swal.fire(
        'Success!',
        'Your token was minted successfully, Sign-In to View Minted NFTs.',
        'success'
      ).then(() => {
        navigate('/sign-in'); // Navigate to /sign-in
      });
    } catch (error) {
      console.error(error);
      setIsMinting(false);
      setFormError(`An error occurred while minting the token: ${error.message}`);
      // Add a sweet alert for errors
      Swal.fire(
        'Error!',
        `An error occurred while minting the token: ${error.message}`,
        'error'
      );
    }
  };
  
  

  // Helper function to convert basis points to percentage
  const basisPointsToPercentage = (basisPoints) => {
    return (basisPoints / 100).toFixed(2);
  };

  return (
    <div className="background">
      <div className="mint-container">
        <h1 className="mint-title">
          Create and Mint Your Own NFT
        </h1>

        <div className="account-info">Connected Account: {account}</div>

        <p className="mint-description">
          Welcome to our NFT creation platform! Here, you can turn your digital creations into unique NFTs that can be bought, sold, and traded on various NFT marketplaces. Follow the steps below to get started:
        </p>

        <div className="mint-fee">Minting Fee: {mintingFee} {getCurrencySymbol()}</div>

            {/* Important Information */}
      <div className="important-info">
        <h2>Important Information</h2>
        <p>
          - Minting an NFT involves a one-time fee in the connected blockchains native token, which is shown above.
        </p>
        <p>
          - You have a limited number of free mints available. Keep an eye on the remaining count.
        </p>
        <p>
          - Make sure your uploaded content adheres to the platform's guidelines.
        </p>
        <p>
          - Once minted, your NFT will be available for trading on NFT marketplaces.
        </p>

      </div>
          
        <form className="mint-form" onSubmit={mintToken}>
          <label htmlFor="name" className="mint-label">
            Name:
          </label>
          <input
            type="text"
            id="name"
            className="mint-input"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label htmlFor="description" className="mint-label">
            Description:
          </label>
          <input
            type="text"
            id="description"
            className="mint-input"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label htmlFor="royaltyRecipient" className="mint-label">
            Royalty Recipient:
          </label>
          <input
            type="text"
            id="royaltyRecipient"
            className="mint-input"
            placeholder="Royalty Recipient"
            value={royaltyRecipient}
            onChange={(e) => setRoyaltyRecipient(e.target.value)}
          />
          <label htmlFor="royaltyBasisPoints" className="mint-label">
            Royalty Basis Points:
            <span className="explanation">(e.g., 100 basis points = 1% royalty)</span>
          </label>
          <input
            type="number"
            id="royaltyBasisPoints"
            className="mint-input"
            placeholder="Royalty Basis Points"
            value={royaltyBasisPoints}
            onChange={(e) => setRoyaltyBasisPoints(e.target.value)}
          />
          <div className="royalty-percentage">
            {royaltyBasisPoints && `Royalty: ${basisPointsToPercentage(royaltyBasisPoints)}%`}
          </div>
          <label htmlFor="file" className="mint-label">
            {imageOnly ? 'Image' : 'Video'}:
          </label>
          <input
            type="file"
            id="file"
            className="mint-input"
            accept={imageOnly ? '.png,.jpg,.gif' : '.mp4'}
            onChange={handleFileUpload}
          />
          <button type="button" onClick={() => setImageOnly(!imageOnly)}>
            Switch to {imageOnly ? 'Video' : 'Image'}
          </button>
          {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview" />
            </div>
          )}
          {videoPreview && (
            <div className="video-preview-container">
              <video src={videoPreview} alt="Preview" className="video-preview" controls />
            </div>
          )}
          {formError && <div className="form-error">{formError}</div>}
          <div>
            <label className="mint-label mint-label-free">Remaining Free Mints: {freeMints}</label>
          </div>
          {isUploading && <div className="loading-message">Uploading NFT...</div>}
          
          {!isUploading && nftLink && <div className="completion-message">NFT is ready to mint.</div>}
          
       
          <button
            type="submit"
            className="mint-button"
            disabled={isMinting || isUploading}
          >
            {isMinting ? 'Minting...' : 'Mint'}
          </button>
        </form>
      </div>
    </div>
  );
  
};

export default Mint;