import React, { useContext, useState, useEffect } from 'react';
import { Web3Context } from '../../utils/Web3Provider';
import { NFTStorage, File } from 'nft.storage';
import '../Mint/Mint.css';
import Swal from 'sweetalert2';

const client = new NFTStorage({
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDdGOTA4QjNBRDJGMDFGNjE2MjU1MTA0ODIwNjFmNTY5Mzc2QTg3MjYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY3OTI5MDE5ODQyMCwibmFtZSI6Ik5FV0VTVCJ9.FGtIrIhKhgSx-10iVlI4sM_78o7jSghZsG5BpqZ4xfA', // Replace with your NFT Storage token
});

const Mint = () => {
  const { web3, contract } = useContext(Web3Context);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [uri, setUri] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 
  const [imagePreview, setImagePreview] = useState('');
  const [formError, setFormError] = useState('');
  const [freeMints, setFreeMints] = useState(0);
  const mintingFee = 50;
  const [videoPreview, setVideoPreview] = useState('');
  const [imageOnly, setImageOnly] = useState(true);
  const [nftLink, setNftLink] = useState('');
  const [royaltyRecipient, setRoyaltyRecipient] = useState('');
  const [royaltyBasisPoints, setRoyaltyBasisPoints] = useState('');

  useEffect(() => {
    const fetchFreeMints = async () => {
      try {
        if (web3 && contract) {
          const accounts = await web3.eth.getAccounts();
          const user = accounts[0];
          const numFreeMints = await contract.methods.getRemainingFreeMints(user).call();
          setFreeMints(numFreeMints);
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchFreeMints();
  }, [web3, contract]);
  

  const handleFileUpload = async (e) => {
    try {
      const file = e.target.files[0];
      setIsUploading(true); // Start uploading

      if (imageOnly) {
        setImagePreview(URL.createObjectURL(file));
        const metadata = await client.store({
          name: name,
          description: description,
          image: new File([file], file.name, { type: file.type }),
        });
        setUri(metadata.url);
        setNftLink(metadata.url);
      } else {
        setVideoPreview(URL.createObjectURL(file));
        const metadata = await client.store({
          name: name,
          description: description,
          image: new File([file], file.name, { type: file.type }),
        });
        setUri(metadata.url);
        setNftLink(metadata.url);
      }

      setIsUploading(false); // Upload complete
    } catch (error) {
      console.error(error);
      setFormError(`An error occurred while uploading the file: ${error.message}`);
      setIsUploading(false);
    }
  };
  

  const mintToken = async (e) => {
    e.preventDefault();
    try {
      setIsMinting(true);
      const accounts = await web3.eth.getAccounts();
      const user = accounts[0];
  
      if (freeMints > 0) {
        await contract.methods.mint(name, description, uri, royaltyRecipient, royaltyBasisPoints).send({ from: user });
        setFreeMints((prevFreeMints) => prevFreeMints - 1);
      } else {
        const weiAmount = web3.utils.toWei(mintingFee.toString(), 'ether');
        const transaction = contract.methods.mint(name, description, uri, royaltyRecipient, royaltyBasisPoints);
        const gas = await transaction.estimateGas({ from: user, value: weiAmount });
        await transaction.send({ from: user, value: weiAmount, gas });
      }
  
      setIsMinting(false);
      setFormError('');
      
      // Add the sweet alert here
      Swal.fire(
        'Success!',
        'Your token was minted successfully.',
        'success'
      );
    } catch (error) {
      console.error(error);
      setIsMinting(false);
      setFormError(`An error occurred while minting the token: ${error.message}`);
      // Add a sweet alert for errors
      Swal.fire(
        'Error!',
        `An error occurred while minting the token: ${error.message}`,
        'error'
      );
    }
  };
  
  

  return (
    <div className="background">
      <div className="mint-container">
        <h1 className="mint-title">
          Mint Your NFT
        </h1>
        <form className="mint-form" onSubmit={mintToken}>
          <label htmlFor="name" className="mint-label">
            Name:
          </label>
          <input
            type="text"
            id="name"
            className="mint-input"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label htmlFor="description" className="mint-label">
            Description:
          </label>
          <input
            type="text"
            id="description"
            className="mint-input"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label htmlFor="royaltyRecipient" className="mint-label">
            Royalty Recipient:
          </label>
          <input
            type="text"
            id="royaltyRecipient"
            className="mint-input"
            placeholder="Royalty Recipient"
            value={royaltyRecipient}
            onChange={(e) => setRoyaltyRecipient(e.target.value)}
          />
          <label htmlFor="royaltyBasisPoints" className="mint-label">
  Royalty Basis Points:
</label>
<input
  type="number"
  id="royaltyBasisPoints"
  className="mint-input"
  placeholder="Royalty Basis Points"
  value={royaltyBasisPoints}
  onChange={(e) => setRoyaltyBasisPoints(e.target.value)}
/>
          <label htmlFor="file" className="mint-label">
            {imageOnly ? 'Image' : 'Video'}:
          </label>
          <input
            type="file"
            id="file"
            className="mint-input"
            accept={imageOnly ? '.png,.jpg,.gif' : '.mp4'}
            onChange={handleFileUpload}
          />
          <button type="button" onClick={() => setImageOnly(!imageOnly)}>
            Switch to {imageOnly ? 'Video' : 'Image'}
          </button>
          {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview" />
            </div>
          )}
          {videoPreview && (
            <div className="video-preview-container">
              <video src={videoPreview} alt="Preview" className="video-preview" controls />
            </div>
          )}
          {formError && <div className="form-error">{formError}</div>}
          <div>
            <label className="mint-label mint-label-free">Remaining Free Mints: {freeMints}</label>
          </div>
          <div className="mint-fee">Minting Fee: {mintingFee} ETH</div>
          {isUploading && <div className="loading-message">Uploading NFT...</div>}
          {!isUploading && nftLink && <div className="completion-message">NFT is ready to mint.</div>}
          <button
            type="submit"
            className="mint-button"
            disabled={isMinting || isUploading} // Disable mint button while uploading or minting
          >
            {isMinting ? 'Minting...' : 'Mint'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Mint;