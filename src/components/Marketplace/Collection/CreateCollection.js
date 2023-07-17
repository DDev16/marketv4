import React, { useState, useContext, useEffect } from 'react';
import { Web3Context } from '../../../utils/Web3Provider.js';
import { NFTStorage, File } from 'nft.storage';
import '../../../components/Marketplace/Collection/CreateCollection.css';
import Preview from './Preview';
import Loading from '../../../components/Loading/Loading';
import Swal from 'sweetalert2';


// Instantiate the NFTStorage client
const client = new NFTStorage({
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDdGOTA4QjNBRDJGMDFGNjE2MjU1MTA0ODIwNjFmNTY5Mzc2QTg3MjYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY3OTI5MDE5ODQyMCwibmFtZSI6Ik5FV0VTVCJ9.FGtIrIhKhgSx-10iVlI4sM_78o7jSghZsG5BpqZ4xfA',
});

const CreateCollection = () => {
  const { web3, marketplaceContract } = useContext(Web3Context);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const getAccount = async () => {
      if (web3 && web3.eth) {
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
      } else {
        console.error('Web3 is not connected.');
      }
    };

    getAccount();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0]);
      });
    }

    const nameInput = document.getElementById('name');
    if (nameInput) {
      nameInput.focus();
    }
  }, [web3]);

  const handleCreateCollection = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setSuccess(false);

      const logoIPFS = await uploadToIPFS(logo);
      const bannerIPFS = await uploadToIPFS(banner);

      await marketplaceContract.methods
        .createCollection(name, logoIPFS, bannerIPFS, description, category)
        .send({ from: account });

      Swal.fire('Success', 'Collection created successfully', 'success');
      setSuccess(true);
    } catch (error) {
      Swal.fire('Error', 'Failed to create collection: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const uploadToIPFS = async (file) => {
    try {
      const content = new File([file], file.name, { type: file.type });
      const cid = await client.storeBlob(content);
      return cid;
    } catch (error) {
      console.error('Failed to upload to IPFS:', error);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogo(file);
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    setBanner(file);
  };

  return (
    <div className="create-collection-form">
      <form onSubmit={handleCreateCollection}>
        <h2>Create Collection</h2>
        <div>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="logo">Logo:</label>
          <input type="file" id="logo" accept="image/*" onChange={handleLogoChange} required />
        </div>
        <div>
          <label htmlFor="banner">Banner:</label>
          <input type="file" id="banner" accept="image/*" onChange={handleBannerChange} required />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          
            <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="custom-textarea" // Add a custom class
            placeholder="Enter your collection description" 
          />
        </div>
        <div>
          <label htmlFor="category">Category:</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="">Select category</option>
            <option value="Arts">Arts</option>
            <option value="Metaverse">Metaverse</option>
            <option value="Utility">Utility</option>
            <option value="Collectibles">Collectibles</option>
            <option value="Gaming">Gaming</option>
            <option value="Music">Music</option>
            <option value="Sports">Sports</option>
            <option value="Virtual Real Estate">Virtual Real Estate</option>
            <option value="Fashion">Fashion</option>
            <option value="Celebrity/Influencer">Celebrity/Influencer</option>
            <option value="Memes">Memes</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create'}
        </button>
        {success && <p className="success-message">Collection created successfully!</p>}
        {loading && <Loading />}
      </form>
      <Preview
        name={name}
        logo={logo}
        banner={banner}
        description={description}
        category={category}
      />
    </div>
  );
};

export default CreateCollection;
