import React, { useState, useContext, useEffect } from 'react';
import { Web3Context } from '../../utils/Web3Provider';
import './Listing.css';
import MarketListings from './MarketListings/MarketListings';
import BatchListing from './Batch/BatchListing';
const MarketList = () => {
  const { web3, marketplaceContract } = useContext(Web3Context);
  const [tokenDetails, setTokenDetails] = useState({
    contractAddress: '',
    tokenId: '',
    price: ''
  });
  const [tokenOwner, setTokenOwner] = useState('');
  const [currentAccount, setCurrentAccount] = useState('');
  const [showReassurance, setShowReassurance] = useState(false); // New state for reassurance message

  useEffect(() => {
    const loadOwner = async () => {
      if (web3 && tokenDetails.contractAddress && tokenDetails.tokenId) {
        const accounts = await web3.eth.getAccounts();
        setCurrentAccount(accounts[0]);

        const tokenContract = new web3.eth.Contract(
          // assuming ERC721 ABI
          [{ 
            constant: true,
            inputs: [{ name: 'tokenId', type: 'uint256' }],
            name: 'ownerOf',
            outputs: [{ name: '', type: 'address' }],
            payable: false,
            stateMutability: 'view',
            type: 'function',
          }],
          tokenDetails.contractAddress
        );
        const owner = await tokenContract.methods.ownerOf(tokenDetails.tokenId).call();
        setTokenOwner(owner);
      }
    };

    loadOwner();
  }, [web3, tokenDetails.contractAddress, tokenDetails.tokenId]);

  const handleChange = (e) => {
    setTokenDetails({ ...tokenDetails, [e.target.name]: e.target.value });
  };

  const approveMarketplace = async () => {
    const tokenContract = new web3.eth.Contract(
      // assuming ERC721 ABI
      [
        // ... other functions ...
        {
          constant: false,
          inputs: [
            { name: 'to', type: 'address' },
            { name: 'approved', type: 'bool' }
          ],
          name: 'setApprovalForAll',
          outputs: [],
          payable: false,
          stateMutability: 'nonpayable',
          type: 'function',
        }
      ],
      tokenDetails.contractAddress
    );

    try {
      await tokenContract.methods.setApprovalForAll(
        marketplaceContract.options.address, 
        true
      ).send({ from: currentAccount });
      alert('Marketplace approved successfully!');
    } catch (err) {
      console.error(err);
      alert('An error occurred while approving the marketplace.');
    }
  };

  const listToken = async (e) => {
    e.preventDefault();
    const { contractAddress, tokenId, price } = tokenDetails;

    if (currentAccount !== tokenOwner) {
      alert('You are not the owner of this token.');
      return;
    }

    if (!price) {
      alert('Please specify a price.');
      return;
    }

    const listingFee = web3.utils.toWei('0.21', 'ether'); // hardcoded listing fee

    try {
      await approveMarketplace();

      await marketplaceContract.methods.listToken(
        contractAddress, 
        tokenId, 
        web3.utils.toWei(price.toString(), 'ether')
      ).send({ from: currentAccount, value: listingFee });

      alert('Token listed successfully!');
    } catch (err) {
      console.error(err);
      alert('An error occurred while listing the token.');
    }
  };

  const handleReassuranceClick = () => {
    setShowReassurance(true);
  };

  return (
    <form onSubmit={listToken}>
      <input
        name="contractAddress"
        placeholder="Token Contract Address"
        onChange={handleChange}
        required
      />
      <input
        name="tokenId"
        placeholder="Token ID"
        onChange={handleChange}
        required
      />
      <input
        name="price"
        placeholder="Price in Ether"
        onChange={handleChange}
        required
      />
      
      {currentAccount && tokenOwner && currentAccount !== tokenOwner && (
        <p className="error-message">You are not the owner of this token.</p>
      )}
      {!showReassurance && (
        <div>
          <p>
            By clicking "List Token," you are giving permission to the Marketplace to manage your token on your behalf. This is required for the token to be listed and sold. Rest assured, this action is safe and your ownership rights will be protected.
          </p>
          <p>
            We prioritize the security and integrity of your assets. The Marketplace implements industry-standard security measures and follows best practices to ensure the safety of your token. If you have any concerns or questions, please don't hesitate to <button onClick={handleReassuranceClick}>contact us</button>.
          </p>
        </div>
      )}
      {showReassurance && (
        <div>
          <p>
            Here is some more information about why it's necessary to approve the Marketplace and how it ensures the safety of your token:
          </p>
          <ul>
            <li>Explanation of the approval process</li>
            <li>Details about the security measures in place</li>
            <li>Contact information for support or inquiries</li>
          </ul>
        </div>
      )}
      <button type="submit" className="list-token-button">List Token</button>
      <BatchListing />
      <MarketListings />
      
    </form>
    
   
  );
};

export default MarketList;