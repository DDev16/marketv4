import React, { useState, useContext, useEffect } from 'react';
import { Web3Context } from '../../../utils/Web3Provider';
import '../../../components/Marketplace/Collection/ListAllTokens.css';

const ListAll = () => {
  const { web3, marketplaceContract } = useContext(Web3Context);
  const [collectionDetails, setCollectionDetails] = useState({
    collectionId: '',
    price: '',
  });
  const [tokenOwner, setTokenOwner] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // fetch the current owner and update state on component mount
  useEffect(() => {
    const fetchTokenOwner = async () => {
      const owner = await marketplaceContract.methods.owner().call();
      setTokenOwner(owner);
    };
    fetchTokenOwner();
  }, [marketplaceContract.methods]);

 // submit the form to list all tokens for sale
 const handleSubmit = async (event) => {
  event.preventDefault();

  try {
    setLoading(true);
    const accounts = await web3.eth.getAccounts();

    // check if the user is the owner
    if (accounts[0] !== tokenOwner) {
      throw new Error('You are not the owner of these tokens.');
    }

    // Convert price from Ether to Wei
    const priceInWei = web3.utils.toWei(collectionDetails.price, 'ether');

    await marketplaceContract.methods
      .listCollectionForSale(collectionDetails.collectionId, priceInWei)
      .send({ from: accounts[0] });

    // if successful, show success message and reset form
    setCollectionDetails({ collectionId: '', price: '' });
    setSuccess(true);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  // update the state when inputs change
  const handleChange = (event) => {
    setCollectionDetails({
      ...collectionDetails,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <div className="ListAllTokens">
      <h2>Owner: {tokenOwner}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="collectionId"
          placeholder="Collection ID"
          onChange={handleChange}
          value={collectionDetails.collectionId}
          required
        />
        <input
          type="text"
          name="price"
          placeholder="Price"
          onChange={handleChange}
          value={collectionDetails.price}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'List All Tokens for Sale'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Tokens listed successfully!</p>}
    </div>
  );
};

export default ListAll;