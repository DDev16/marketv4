import React, { useState, useContext, useEffect } from 'react';
import { Web3Context } from '../../../utils/Web3Provider';
import '../../../components/Marketplace/Collection/ListAllTokens.css';
import Swal from 'sweetalert2';

const ListAll = () => {
  const { web3, marketplaceContract } = useContext(Web3Context);
  const [collectionDetails, setCollectionDetails] = useState({
    collectionId: '',
    price: '',
  });
  const [tokenOwner, setTokenOwner] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTokenOwner = async () => {
      const owner = await marketplaceContract.methods.owner().call();
      setTokenOwner(owner);
    };
    fetchTokenOwner();
  }, [marketplaceContract.methods]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const accounts = await web3.eth.getAccounts();

      if (accounts[0] !== tokenOwner) {
        throw new Error('You are not the owner of these tokens.');
      }

      const priceInWei = web3.utils.toWei(collectionDetails.price, 'ether');

      await marketplaceContract.methods
        .listCollectionForSale(collectionDetails.collectionId, priceInWei)
        .send({ from: accounts[0] });

      setCollectionDetails({ collectionId: '', price: '' });
      Swal.fire('Success!', 'Tokens listed successfully!', 'success');
    } catch (err) {
      Swal.fire('Error!', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setCollectionDetails({
      ...collectionDetails,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <div className="ListAllTokens">
      <h2>List All Tokens in a Collection</h2>

      <p>
        To list all tokens in a collection for sale, please enter the Collection ID and the Price (in ETH). 
        You must be the owner of these tokens. The price will apply to all tokens in the collection.
      </p>

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
    </div>
  );
};

export default ListAll;
