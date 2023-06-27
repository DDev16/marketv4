import React, { useState, useContext } from 'react';
import { Web3Context } from '../../../utils/Web3Provider.js';
import './AddToCollection.css';

const AddToCollection = () => {
  const { web3, marketplaceContract } = useContext(Web3Context);
  const [collectionId, setCollectionId] = useState(0);
  const [contractAddress, setContractAddress] = useState('');
  const [tokenId, setTokenId] = useState(0);

  const handleCollectionIdChange = (event) => {
    setCollectionId(event.target.value);
  };

  const handleContractAddressChange = (event) => {
    setContractAddress(event.target.value);
  };

  const handleTokenIdChange = (event) => {
    setTokenId(event.target.value);
  };

  const addToCollection = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      await marketplaceContract.methods.addTokenToCollection(collectionId, contractAddress, tokenId).send({ from: accounts[0] });
      console.log('Token added to the collection successfully');
    } catch (error) {
      console.error('An error occurred while adding the token to the collection:', error);
    }
  };

  return (
    <div className="container">
      <h2 className="title">Add To Collection</h2>
      <div className="input-container">
        <label htmlFor="collectionId">Collection ID:</label>
        <input type="number" id="collectionId" value={collectionId} onChange={handleCollectionIdChange} placeholder="Enter Collection ID" />
        <small>Select a Collection ID from your collections.</small>
      </div>
      <div className="input-container">
        <label htmlFor="contractAddress">Contract Address:</label>
        <input type="text" id="contractAddress" value={contractAddress} onChange={handleContractAddressChange} placeholder="Enter Contract Address" />
        <small>Input the Contract Address of the NFT you want to add.</small>
      </div>
      <div className="input-container">
        <label htmlFor="tokenId">Token ID:</label>
        <input type="number" id="tokenId" value={tokenId} onChange={handleTokenIdChange} placeholder="Enter Token ID" />
        <small>Enter the Token ID of the NFT you want to add.</small>
      </div>
      <div className="button-container">
        <button onClick={addToCollection}>Add to Collection</button>
      </div>
    </div>
  );
  
  
};

export default AddToCollection;
