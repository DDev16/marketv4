import React, { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../../../utils/Web3Provider.js';
import '../Batch/Batchlisting.css';

const tokenContractABI = JSON.parse(process.env.REACT_APP_ERC721_ABI)


const BatchListing = () => {
  const { web3, marketplaceContract } = useContext(Web3Context);
  const [tokenDetails, setTokenDetails] = useState([]);
  const [currentAccount, setCurrentAccount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAccount = async () => {
      if (web3) {
        const accounts = await web3.eth.getAccounts();
        setCurrentAccount(accounts[0]);
      }
    };
    loadAccount();
  }, [web3]);

  const handleTextAreaChange = (event) => {
    const lines = event.target.value.split('\n');
    const tokens = lines.map(line => {
      const [contractAddress, tokenId, price] = line.split(',');
      if (contractAddress && tokenId && price) {
        return { contractAddress, tokenId, price: price.trim() };
      } else {
        setError('Each line should have a contract address, token ID, and price, separated by commas.');
      }
    });
    setTokenDetails(tokens);
  };

  const approveMarketplace = async (contractAddress) => {
    const tokenContract = new web3.eth.Contract(
      tokenContractABI,
      contractAddress
    );
  
    const isAlreadyApproved = await tokenContract.methods.isApprovedForAll(
      currentAccount,
      marketplaceContract.options.address
    ).call();
  
    if (!isAlreadyApproved) {
      try {
        await tokenContract.methods
          .setApprovalForAll(marketplaceContract.options.address, true)
          .send({ from: currentAccount });
        console.log(`Marketplace approved for contract ${contractAddress}`);
      } catch (err) {
        console.error(err);
        alert('An error occurred while approving the marketplace.');
      }
    }
  };

  const handleBatchListTokens = async (event) => {
    event.preventDefault();

    const listingFeePerToken = web3.utils.toWei('0.21', 'ether');
    const totalListingFee = web3.utils.toBN(listingFeePerToken).muln(tokenDetails.length);

    try {
      const contractAddresses = tokenDetails.map(token => token.contractAddress);
      const tokenIds = tokenDetails.map(token => token.tokenId);
      const prices = tokenDetails.map(token => web3.utils.toWei(token.price.toString(), 'ether'));
  
      for(let contractAddress of new Set(contractAddresses)) {
        await approveMarketplace(contractAddress);
      }
  
      await marketplaceContract.methods.listTokens(
        contractAddresses,
        tokenIds,
        prices
      ).send({ from: currentAccount, value: totalListingFee.toString() });
  
      alert('Tokens listed successfully!');
    } catch (err) {
      console.error(err);
      alert('An error occurred while listing the tokens.');
    }
  };

  return (
    <div className="batch-listing-container">
      <h1 className="batch-listing-heading">Batch Listing</h1>
      <div className="instruction-box">
        <p className="instruction-title"><strong>Instructions:</strong></p>
        <ul>
          <li>Please enter the details of each token you wish to list.</li>
          <li>Each detail should be on a new line in the following format: <code>Contract Address, Token ID, Price</code></li>
          <li>For example:
            <code>0x1234..., 1, 0.01</code>
            <code>0x5678..., 2, 0.02</code>
          </li>
          <li>The Contract Address is the address of the ERC721 contract of the token. Token ID is the unique identifier of your token within its contract. Price is the price at which you wish to list your token, in Native Token.</li>
          <li>To streamline the process you can use Chat Gpt for large amounts <a href="https://chat.openai.com/" target="_blank" rel="noopener noreferrer">Link here</a> </li>

        </ul>
      </div>
      <div className="input-field">
        <label htmlFor="tokenDetails">Enter token details:</label>
        <textarea
          id="tokenDetails"
          name="tokenDetails"
          rows="10"
          cols="50"
          onChange={handleTextAreaChange}
          placeholder="Example:
          0x1234...5678, 1, 1500  
          0x8910...6789, 2, 250"
        />
        {error && <p className="error">{error}</p>}
      </div>
      <button className="list-button" onClick={handleBatchListTokens}>List Tokens</button>
    </div>
  );
};
  export default BatchListing;
  