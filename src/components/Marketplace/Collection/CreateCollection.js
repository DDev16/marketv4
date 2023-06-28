import React, { useState, useContext, useEffect } from 'react';
import { Web3Context } from '../../../utils/Web3Provider.js';
import { NFTStorage, File } from 'nft.storage';
import '../../../components/Marketplace/Collection/CreateCollection.css';
import Preview from './Preview'; // Import the Preview component

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
    const [account, setAccount] = useState(''); // new state variable to store the connected account
  
    // This effect runs once when the component mounts and then whenever `web3` changes
    useEffect(() => {
        const getAccount = async () => {
          // check if web3 instance is available
          if (web3 && web3.eth) {
            const accounts = await web3.eth.getAccounts();
            setAccount(accounts[0]);
          } else {
            console.error('Web3 is not connected.');
          }
        };
      
        getAccount();
      
        // Add event listener for account changes
        if (window.ethereum) {
          window.ethereum.on('accountsChanged', (accounts) => {
            setAccount(accounts[0]);
          });
        }
      }, [web3]);
      

  const handleCreateCollection = async (event) => {
    event.preventDefault(); // Prevents page refresh on form submission
    console.log('Form submitted'); // Log when form is submitted
    try {
      console.log('Uploading files to IPFS'); // Log before uploading files
      // Convert logo and banner images to IPFS and get their IPFS hashes
      const logoIPFS = await uploadToIPFS(logo);
      const bannerIPFS = await uploadToIPFS(banner);
  
      console.log('Files uploaded, creating collection on contract'); // Log after files are uploaded and before calling the contract
      await marketplaceContract.methods
  .createCollection(name, logoIPFS, bannerIPFS, description, category)
  .send({ from: account });

      console.log('Collection created successfully'); // Log after successful creation of the collection
    } catch (error) {
      console.error('Failed to create collection:', error); // Log any errors
    }
  };
  
  const uploadToIPFS = async (file) => {
    try {
      console.log('Starting upload for:', file.name); // Log the file that's being uploaded
      const content = new File([file], file.name, { type: file.type });
      const cid = await client.storeBlob(content);
      console.log('Upload successful, IPFS hash:', cid); // Log the IPFS hash of the uploaded file
      return cid;  // Returns the IPFS CID (Content Identifier)
    } catch (error) {
      console.error('Failed to upload to IPFS:', error); // Log any errors
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
    <div className="form-containers">
      <form onSubmit={handleCreateCollection}>
        <h2>Create Collection</h2>
        <div>
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Logo:</label>
          <input type="file" accept="image/*" onChange={handleLogoChange} required />
          <p>Recommended size: 200x200 pixels</p>
        </div>
        <div>
          <label>Banner:</label>
          <input type="file" accept="image/*" onChange={handleBannerChange} required />
          <p>Recommended size: 1200x300 pixels</p>
        </div>
        <div>
          <label>Description:</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label>Category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="">Select category</option>
            <option value="Arts">Arts</option>
            {/* Add more options if needed */}
          </select>
        </div>
        <button type="submit">Create</button>
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
