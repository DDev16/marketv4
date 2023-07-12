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
      if(marketplaceContract) {  // Check if marketplaceContract is not null
        const owner = await marketplaceContract.methods.owner().call();
        setTokenOwner(owner);
      }
    };
    fetchTokenOwner();
  }, [marketplaceContract]); 


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
        This form allows you to list all tokens in a collection for sale. Please take note of the following:
      </p>

      <ul>
        <li>
          You will need to enter the Collection ID and the Price (in ETH). Make sure you own all the tokens in the specified collection.
        </li>
        <li>
          The specified price will apply uniformly to all tokens within the collection.
        </li>
        <li>
          Ideally, this action should be performed once when you first create a collection and are still the sole owner of all the NFTs within.
        </li>
        <li>
          Attempting to list all tokens for a second time after some have been sold will result in an error, since you will no longer be the owner of all tokens in the collection.
        </li>
      </ul>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="collectionId"
          placeholder="Enter Collection ID here"
          onChange={handleChange}
          value={collectionDetails.collectionId}
          required
        />
        <input
          type="text"
          name="price"
          placeholder="Enter Price in ETH here"
          onChange={handleChange}
          value={collectionDetails.price}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'List All Tokens for Sale'}
        </button>
      </form>
      <p>
        The 'List All Tokens for Sale' button will be disabled during the processing period. Once complete, the button will be re-enabled.
      </p>
    </div>
  );
};

export default ListAll;

