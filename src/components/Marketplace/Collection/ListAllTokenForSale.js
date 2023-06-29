import React, { useState, useContext, useEffect } from 'react';
import { Web3Context } from '../../../utils/Web3Provider';
import '../../../components/Marketplace/Collection/ListAllTokens.css'

const ListAll = () => {
  const { web3, marketplaceContract } = useContext(Web3Context);
  const [collectionDetails, setCollectionDetails] = useState({
    collectionId: '',
    price: ''
  });
  const [tokenOwner, setTokenOwner] = useState('');
  const [currentAccount, setCurrentAccount] = useState('');
  const [showReassurance, setShowReassurance] = useState(false);

  useEffect(() => {
    const loadOwner = async () => {
      if (web3 && collectionDetails.collectionId) {
        const accounts = await web3.eth.getAccounts();
        setCurrentAccount(accounts[0]);
  
        const owner = await marketplaceContract.methods.getCollectionOwner(collectionDetails.collectionId).call();
        setTokenOwner(owner);
      }
    };
  
    loadOwner();
  }, [web3, collectionDetails.collectionId, marketplaceContract]);

  const handleChange = (e) => {
    setCollectionDetails({ ...collectionDetails, [e.target.name]: e.target.value });
  };

  const approveMarketplaceForAllTokens = async (collectionId) => {
    const tokens = await marketplaceContract.methods.getCollectionTokens(collectionId).call();

    // Set to track the contracts that have already been approved
    const approvedContracts = new Set();

    for (const token of tokens) {
      // If we haven't approved this contract yet, approve it
      if (!approvedContracts.has(token.contractAddress)) {
        const tokenContract = new web3.eth.Contract(
            // assuming ERC721 ABI
            [
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
            token.contractAddress
        );

        await tokenContract.methods.setApprovalForAll(
            marketplaceContract.options.address, 
            true
        ).send({ from: currentAccount });

        // Add the contract to the approvedContracts Set
        approvedContracts.add(token.contractAddress);
      }
    }

    alert('Marketplace approved successfully for all tokens!');
};


  const listCollection = async (e) => {
    e.preventDefault();
    const { collectionId, price } = collectionDetails;

    if (currentAccount !== tokenOwner) {
      alert('You are not the owner of this collection.');
      return;
    }

    if (!price) {
      alert('Please specify a price.');
      return;
    }

    const listingFee = web3.utils.toWei('0.21', 'ether'); // hardcoded listing fee

    try {
      await approveMarketplaceForAllTokens(collectionId);

      await marketplaceContract.methods.listCollectionForSale(
        collectionId, 
        web3.utils.toWei(price.toString(), 'ether')
      ).send({ from: currentAccount, value: listingFee });

      alert('Collection listed successfully!');
    } catch (err) {
      console.error(err);
      alert('An error occurred while listing the collection.');
    }
  };

  const handleReassuranceClick = () => {
    setShowReassurance(true);
  };

  return (
    <form onSubmit={listCollection} className="my-form">
      <input
        name="collectionId"
        placeholder="Collection ID"
        onChange={handleChange}
        required
        className="my-input"
      />
      <input
        name="price"
        placeholder="Price in Ether"
        onChange={handleChange}
        required
        className="my-input"
      />

      {currentAccount && tokenOwner && currentAccount !== tokenOwner && (
        <p className="my-paragraph">You are not the owner of this collection.</p>
      )}

      {!showReassurance && (
        <div>
          <p className="my-paragraph">
            By clicking "List Collection," you are giving permission to the Marketplace to manage your tokens on your behalf. This is required for the tokens to be listed and sold. Rest assured, this action is safe and your ownership rights will be protected.
          </p>
          <p className="my-paragraph">
            We prioritize the security and integrity of your assets. The Marketplace implements industry-standard security measures and follows best practices to ensure the safety of your tokens. If you have any concerns or questions, please don't hesitate to <button onClick={handleReassuranceClick} className="my-button">contact us</button>.
          </p>
        </div>
      )}
      {showReassurance && (
        <div>
          <p className="my-paragraph">
            Here is some more information about why it's necessary to approve the Marketplace and how it ensures the safety of your tokens:
          </p>
          <ul>
            <li>Explanation of the approval process</li>
            <li>Details about the security measures in place</li>
            <li>Contact information for support or inquiries</li>
          </ul>
        </div>
      )}
      <button type="submit" className="my-button">List Collection</button>
    </form>
  );
};

export default ListAll;
