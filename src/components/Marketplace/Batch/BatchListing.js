import React, { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../../../utils/Web3Provider.js';
import '../Batch/Batchlisting.css';

const BatchListing = () => {
  const { web3, marketplaceContract } = useContext(Web3Context);
  const [tokenDetails, setTokenDetails] = useState([
    {
      contractAddress: '',
      tokenId: '',
      price: ''
    }
  ]);
  const [currentAccount, setCurrentAccount] = useState('');
  const [tokenOwners, setTokenOwners] = useState([]);

  useEffect(() => {
    const loadAccount = async () => {
      if (web3) {
        const accounts = await web3.eth.getAccounts();
        setCurrentAccount(accounts[0]);
      }
    };
    loadAccount();
  }, [web3]);

  useEffect(() => {
    const loadOwners = async () => {
      if (web3 && tokenDetails.length > 0) {
        const owners = await Promise.all(
          tokenDetails.map(async (token) => {
            if (token.contractAddress && token.tokenId) {
              const tokenContract = new web3.eth.Contract(
                // assuming ERC721 ABI
                [
                  {
                    constant: true,
                    inputs: [{ name: 'tokenId', type: 'uint256' }],
                    name: 'ownerOf',
                    outputs: [{ name: '', type: 'address' }],
                    payable: false,
                    stateMutability: 'view',
                    type: 'function',
                  },
                ],
                token.contractAddress
              );
              const owner = await tokenContract.methods.ownerOf(token.tokenId).call();
              return owner;
            } else {
              return '';
            }
          })
        );
        setTokenOwners(owners);
      }
    };

    loadOwners();
  }, [web3, tokenDetails]);

  const handleChange = (index, event) => {
    const values = [...tokenDetails];
    values[index][event.target.name] = event.target.value;
    setTokenDetails(values);
  };

  const handleAddFields = () => {
    setTokenDetails([
      ...tokenDetails,
      { contractAddress: '', tokenId: '', price: '' },
    ]);
  };

  const handleRemoveFields = (index) => {
    const values = [...tokenDetails];
    values.splice(index, 1);
    setTokenDetails(values);
  };

  const approveMarketplace = async (contractAddress, tokenId) => {
    const tokenContract = new web3.eth.Contract(
      // assuming ERC721 ABI
      [
        // ... other functions ...
        {
          constant: false,
          inputs: [
            { name: 'to', type: 'address' },
            { name: 'approved', type: 'bool' },
          ],
          name: 'setApprovalForAll',
          outputs: [],
          payable: false,
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      contractAddress
    );

    try {
      await tokenContract.methods
        .setApprovalForAll(marketplaceContract.options.address, true)
        .send({ from: currentAccount });
      console.log(`Marketplace approved for token ${tokenId}`);
    } catch (err) {
      console.error(err);
      alert('An error occurred while approving the marketplace.');
    }
  };

  const handleBatchListTokens = async (event) => {
    event.preventDefault();
  
    const listingFeePerToken = web3.utils.toWei('0.21', 'ether'); // Assuming a fixed listing fee per token
    const totalListingFee = web3.utils.toBN(listingFeePerToken).muln(tokenDetails.length);
  
    try {
      await Promise.all(
        tokenDetails.map(async (token, index) => {
          const { contractAddress, tokenId, price } = token;
          const tokenOwner = tokenOwners[index];
  
          if (!contractAddress || !tokenId || !price) {
            console.log(`Incomplete details for token ${tokenId}`);
            return;
          }
  
          if (currentAccount !== tokenOwner) {
            console.log(`You are not the owner of token ${tokenId}`);
            return;
          }
  
          await approveMarketplace(contractAddress, tokenId);
  
          return marketplaceContract.methods.listToken(
            contractAddress,
            tokenId,
            web3.utils.toWei(price.toString(), 'ether')
          ).send({ from: currentAccount, value: totalListingFee.toString() }); // Use the total listing fee here
        })
      );
  
      alert('Tokens listed successfully!');
    } catch (err) {
      console.error(err);
      alert('An error occurred while listing the tokens.');
    }
  };
  

  return (
    <div className="batch-listing-container">
      <div>
        {tokenDetails.map((token, index) => (
          <div key={`${token}-${index}`}>
            <label>
              Contract Address:
              <input
                type="text"
                name="contractAddress"
                value={token.contractAddress}
                onChange={(event) => handleChange(index, event)}
              />
            </label>
            <label>
              Token ID:
              <input
                type="text"
                name="tokenId"
                value={token.tokenId}
                onChange={(event) => handleChange(index, event)}
              />
            </label>
            <label>
              Price:
              <input
                type="text"
                name="price"
                value={token.price}
                onChange={(event) => handleChange(index, event)}
              />
            </label>
            <button onClick={() => handleRemoveFields(index)}>Remove</button>
          </div>
        ))}
        <button onClick={handleAddFields}>Add</button>
        <button onClick={handleBatchListTokens}>List Tokens</button>
      </div>
    </div>
  );
};

export default BatchListing;
