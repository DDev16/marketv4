import React, { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../../../utils/Web3Provider.js';
import '../Batch/Batchlisting.css';

const BatchListing = () => {
  const { web3, marketplaceContract } = useContext(Web3Context);
  const [tokenData, setTokenData] = useState('');
  const [currentAccount, setCurrentAccount] = useState('');
  const [approvalGiven, setApprovalGiven] = useState(false);

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
    const loadApprovalStatus = () => {
      const approvalStatus = localStorage.getItem('approvalGiven');
      setApprovalGiven(approvalStatus === 'true');
    };

    loadApprovalStatus();
  }, []);

  useEffect(() => {
    const saveApprovalStatus = () => {
      localStorage.setItem('approvalGiven', approvalGiven);
    };

    saveApprovalStatus();
  }, [approvalGiven]);

  const parseTokenData = () => {
    return tokenData.split('\n').map(line => {
      const [contractAddress, tokenId, price] = line.split(',');
      return { contractAddress, tokenId, price };
    });
  };

  const ownerOf = async (contractAddress, tokenId) => {
    const tokenContract = new web3.eth.Contract(
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
      contractAddress
    );
    return await tokenContract.methods.ownerOf(tokenId).call();
  };

  const approveMarketplace = async (contractAddress) => {
    const tokenContract = new web3.eth.Contract(
      [
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
      await tokenContract.methods.setApprovalForAll(marketplaceContract.options.address, true).send({ from: currentAccount });
      console.log(`Marketplace approved for token.`);
    } catch (err) {
      console.error(err);
      alert('An error occurred while approving the marketplace.');
    }
  };

  const handleBatchListTokens = async () => {
    const tokenDetails = parseTokenData();

    const listingFeePerToken = web3.utils.toWei('0.21', 'ether'); // Assuming a fixed listing fee per token
    const totalListingFee = web3.utils.toBN(listingFeePerToken).muln(tokenDetails.length);

    try {
      await Promise.all(
        tokenDetails.map(async (token) => {
          const { contractAddress, tokenId, price } = token;

          if (!contractAddress || !tokenId || !price) {
            console.log(`Incomplete details for token ${tokenId}`);
            return;
          }

          const owner = await ownerOf(contractAddress, tokenId);

          if (currentAccount !== owner) {
            console.log(`You are not the owner of token ${tokenId}`);
            return;
          }

          await approveMarketplace(contractAddress);

          return marketplaceContract.methods.listToken(
            contractAddress,
            tokenId,
            web3.utils.toWei(price, 'ether')
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
      <h1>Batch Listing of Tokens</h1>
      <p>
        Use this form to list multiple tokens at once. Please follow the example format:
        Each line should represent one token, and the line should be in the format of
        <code>contractAddress,tokenId,price</code>.
      </p>
      <p>
        Each value should be separated by a comma. Here's an example:
        <code>0x1234...abcd,1,1</code>
      </p>
      <div>
        <textarea
          value={tokenData}
          onChange={(e) => setTokenData(e.target.value)}
          placeholder="Example:
          0x1234...abcd,1,1
          0x5678...efgh,2,2
          0x9abc...def0,3,3"
        />
        <button onClick={handleBatchListTokens}>List Tokens</button>
      </div>
      <p>
        By clicking "List Tokens", you are confirming that you are the owner of these tokens and 
        you agree to list them for the specified prices. A fee of 0.21 Native Token per NFT is required for listing.
      </p>
    </div>
  );
};

export default BatchListing;
