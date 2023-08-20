import React, { useContext, useState, useEffect } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { File, NFTStorage } from 'nft.storage';
import Loading from '../Loading/Loading';
import { Web3Context } from '../../utils/Web3Provider';
import '../../components/Batch/BatchMint.css';
import MintingLoading from '../../components/Mint/MintingLoading.js';
import Swal from 'sweetalert2';

const BatchMint = () => {
  const { web3, contract } = useContext(Web3Context);
  const [mintData, setMintData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [useSharedData, setUseSharedData] = useState(false);
  const [allImagesUploaded, setAllImagesUploaded] = useState(false);
  const [allFieldsFilled, setAllFieldsFilled] = useState(false);


 // Additional state for royalty information
 const [royaltyRecipients, setRoyaltyRecipients] = useState([]);
 const [royaltyBPSs, setRoyaltyBPSs] = useState(new Array(mintData.length).fill(0));
  // State variable to hold the dynamic minting fee
  const [mintingFee, setMintingFee] = useState(0);
  const [networkId, setNetworkId] = useState(null);

  useEffect(() => {
    // Function to fetch the network ID
    const fetchNetworkId = async () => {
      try {
        const networkId = await web3.eth.net.getId();
        setNetworkId(networkId);
      } catch (error) {
        console.error('Error fetching network ID:', error);
      }
    };
  
    if (web3) {
      fetchNetworkId();
    }
  }, [web3]);
  
  // Function to get the appropriate currency symbol based on network ID
  const getCurrencySymbol = () => {
    switch (networkId) {
      case 1: // Mainnet
        return 'ETH';
      case 19: // songbird
        return 'SGB';
      case 14: // Flare
        return 'FLR';
      case 4: // Rinkeby
        return 'FLR';
      case 42: // Kovan
        return 'FLR';
      case 56: // Binance Smart Chain Mainnet
        return 'BNB';
      case 97: // Binance Smart Chain Testnet
        return 'BNB';
      case 100: // xDAI
        return 'DAI';
      case 31337: // Hardhat Network
        return 'HH';
      // Add more cases for other networks if needed
      default:
        return 'SGB'; // Default to Songbird (SGB) network
    }
  };
  // Function to fetch the minting fee from the contract
  const fetchMintingFee = async () => {
    try {
      const fee = await contract.methods.getMintingFee().call();
      setMintingFee(fee); // No need to convert since it's already in Wei
    } catch (error) {
      console.error('Error fetching minting fee:', error);
    }
  };

 // Fetch minting fee when the component mounts
 useEffect(() => {
  if (contract) {
    fetchMintingFee();
  }
}, [contract]);


  const nftStorageToken = process.env.REACT_APP_NFT_STORAGE;
  
  const client = new NFTStorage({ token: nftStorageToken });

  const handleChange = (index, event) => {
    const { name, value } = event.target;
  
    setMintData(prevState => {
      const newState = prevState.map((data, dataIndex) => {
        if (dataIndex === index) {
          return { ...data, [name]: value };
        }
        return data;
      });
  
      setAllFieldsFilled(newState.every(data => {
        if (useSharedData) {
          return newState[0].name && newState[0].description;
        }
        return data.name && data.description;
      }));
  
      if (name === "royaltyRecipient") {
        setRoyaltyRecipients(prevState => {
          const newRecipients = [...prevState];
          newRecipients[index] = value;
          return newRecipients;
        });
      } else if (name === "royaltyBPS") {
        setRoyaltyBPSs(prevState => {
          const newBPSs = [...prevState];
          newBPSs[index] = Number(value) || 0;
          return newBPSs;
        });
      }
  
      return newState;
    });
  };
  

  


  const handleFilesChange = (event) => {
    const files = [...event.target.files];
    const newMintData = files.map((file) => ({
      name: '',
      description: '',
      file: file,
      uri: '',
    }));
    setMintData((prevState) => [...prevState, ...newMintData]);
  };

  const handleImageUpload = async (index) => {
  try {
    const file = mintData[index].file;
    setUploading(true);
    
    const name = useSharedData ? mintData[0].name : mintData[index].name;
    const description = useSharedData ? mintData[0].description : mintData[index].description;

    const metadata = await client.store({
      name: name,
      description: description,
      image: new File([file], file.name, { type: file.type }),
    });

    setMintData((prevState) => {
      const newState = [...prevState];
      newState[index].uri = metadata.url;
      return newState;
    });

    setError(null);
  } catch (error) {
    console.error('Error while uploading image:', error);
    setError(`Error while uploading image: ${error.message}`);
    setAllImagesUploaded(false);

  } finally {
    setUploading(false);
  }
};


const handleAllImagesUpload = async () => {
  const allFieldsFilled = mintData.every((data, index) => {
    if (useSharedData) {
      return mintData[0].name && mintData[0].description;
    }
    return data.name && data.description;
  });

  if (allFieldsFilled) {
    for (let i = 0; i < mintData.length; i++) {
      if (mintData[i].file && !mintData[i].uri) {
        await handleImageUpload(i);
      }
    }
    // All images uploaded
    setAllImagesUploaded(true);
  }
};



  
  const handleRemoveFields = (index) => {
    setMintData((prevState) => {
      const newState = [...prevState];
      newState.splice(index, 1);
      return newState;
    });
  };

  const handleToggle = () => {
    setUseSharedData((prevState) => {
      // Calculate the new allFieldsFilled value based on the current state and useSharedData
      const newAllFieldsFilled = useSharedData
        ? mintData.every((data) => data.name && data.description)
        : mintData.every((data) => data.name && data.description) && mintData.length > 0;
  
      // Set the new allFieldsFilled state
      setAllFieldsFilled(newAllFieldsFilled);
  
      return !prevState;
    });
  };
  
  

  const handleBatchMint = async (event) => {
    event.preventDefault();
    setLoading(true);
  
    try {
      const accounts = await web3.eth.getAccounts();
      const names = useSharedData
        ? Array(mintData.length).fill(mintData[0].name)
        : mintData.map((data) => data.name);
      const descriptions = useSharedData
        ? Array(mintData.length).fill(mintData[0].description)
        : mintData.map((data) => data.description);
      const uris = mintData.map((data) => data.uri);
  
      const numNFTs = mintData.length;
      const calculatedFee = web3.utils.toWei((mintingFee * numNFTs).toString(), 'ether'); // Convert to Wei
      // Create an array of royalty recipients and BPS values
      const royaltyRecipientsArray = useSharedData
        ? Array(mintData.length).fill(royaltyRecipients[0])
        : royaltyRecipients;
      const royaltyBPSsArray = useSharedData
        ? Array(mintData.length).fill(royaltyBPSs[0])
        : royaltyBPSs;

        
  
      // Call the contract method to mint NFTs with the calculated fee
      await contract.methods
        .batchMint(names, descriptions, uris, royaltyRecipientsArray, royaltyBPSsArray)
        .send({ from: accounts[0], value: calculatedFee });
  
      setMintData([]);
      setMintSuccess(true);
      setError(null);
     // Show success message using SweetAlert2
     Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'Batch minting successful!',
    });
  } catch (error) {
    console.error('Error in batch minting:', error);
    setError(`Error in batch minting: ${error.message}`);
  } finally {
    setLoading(false);
  }
};


  // Calculate the cost
  const totalCost = mintingFee * mintData.length;

  
  // Helper function to convert basis points to percentage
  const basisPointsToPercentage = (basisPoints) => {
    return (basisPoints / 100).toFixed(2);
  };


  return (
    <div className="background">
      <div className="BatchMint">
        <div className="Batch-Title">
          <h1>Batch Minting</h1>
        </div>
        <p>
          Transform your collection of digital artworks into NFTs effortlessly using our Batch Minting feature. This powerful tool enables you to mint multiple pieces of art into individual NFTs all at once. Follow the instructions below to begin the batch minting process:
        </p>
        <p>
          To ensure uniformity across your minted NFTs, fill out the initial form completely. Once finished, toggle the 'Use Shared Data' option to automatically apply the same information to all the NFTs.
        </p>
        <p>
          If you wish to give each NFT unique details, simply disable the 'Use Shared Data' option and input distinct information for each artwork.
        </p>
        <p>To ensure Successful Batch Mint, We recommend Batch minting in batches of 10, Anything more it will throw a gas error.</p>
              
        <h2>Minting Fee: {mintingFee}{getCurrencySymbol()}</h2>
        <h2>Number of NFTs: {mintData.length}</h2>
        <h2>Total Cost: {totalCost} {getCurrencySymbol()}</h2>
        <form onSubmit={handleBatchMint}>
          <div className="shared-data-toggle">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="shared-data-tooltip">Input name/description then toggle to share data across all Minted NFTs</Tooltip>}
            >
              <label htmlFor="shared-data">Use Shared Data:</label>
            </OverlayTrigger>
            <input type="checkbox" id="shared-data" checked={useSharedData} onChange={handleToggle} />
          </div>
          <OverlayTrigger placement="top" overlay={<Tooltip id="file-input-tooltip">Upload up to 50 at once</Tooltip>}>
            <input
              type="file"
              name="file"
              onChange={handleFilesChange}
              accept="image/*"
              required
              multiple
              aria-label="Upload Image"
            />
          </OverlayTrigger>
          {mintData.length > 0 &&
            mintData.map((mintField, index) => (
              <div key={index} className="mint-field">
                {/* NFT Details */}
                <label htmlFor={`name-${index}`}>Token Name:</label>
                <input
                  type="text"
                  id={`name-${index}`}
                  name="name"
                  value={useSharedData ? mintData[0].name : mintField.name}
                  onChange={(event) => handleChange(index, event)}
                  placeholder="Token Name"
                  required
                  aria-label="Token Name"
                  disabled={useSharedData}
                />
                <label htmlFor={`description-${index}`}>Token Description:</label>
                <textarea
                  id={`description-${index}`}
                  name="description"
                  value={useSharedData ? mintData[0].description : mintField.description}
                  onChange={(event) => handleChange(index, event)}
                  placeholder="Token Description"
                  required
                  aria-label="Token Description"
                  disabled={useSharedData}
                />
                {/* Royalty Information */}
                <label htmlFor={`royaltyRecipient-${index}`}>Royalty Recipient:</label>
                <input
                  type="text"
                  id={`royaltyRecipient-${index}`}
                  name="royaltyRecipient"
                  value={useSharedData ? royaltyRecipients[0] : royaltyRecipients[index] || ''}
                  onChange={(event) => handleChange(index, event)}
                  placeholder="Royalty Recipient Address"
                  required
                  aria-label="Royalty Recipient Address"
                  disabled={useSharedData}
                />
                <label htmlFor={`royaltyBPS-${index}`}>Royalty Basis Points:</label>
                <input
                  type="number"
                  id={`royaltyBPS-${index}`}
                  name="royaltyBPS"
                  value={useSharedData ? royaltyBPSs[0] : royaltyBPSs[index] || ''}
                  onChange={(event) => handleChange(index, event)}
                  placeholder="Royalty Percentage in BPS"
                  required
                  aria-label="Royalty Percentage in BPS"
                  min={0}
                  max={10000}
                  disabled={useSharedData}
                />
                <div className="royalty-percentage">
  {royaltyBPSs[index] && `Royalty: ${basisPointsToPercentage(royaltyBPSs[index])}%`}
</div>
                {/* Image Upload */}
                {uploading ? <Loading /> : (
                  // Inside the render method
<button
  type="button"
  onClick={handleAllImagesUpload}
  disabled={(uploading || !allFieldsFilled) && !useSharedData}
>
  Upload All Images
</button>


                
                )}
                {mintField.file && (
                  <div>
                    <img
                      src={URL.createObjectURL(mintField.file)}
                      alt="Uploaded Token"
                      className="uploaded-image"
                    />
                  </div>
                )}
                {/* Token URI */}
                <input
                  type="text"
                  name="uri"
                  value={mintField.uri}
                  readOnly
                  placeholder="Token URI"
                  aria-label="Token URI"
                />
                {/* Remove Button */}
                <button type="button" onClick={() => handleRemoveFields(index)}>
                  Remove
                </button>
              </div>
            ))}
          {/* No Files Added */}
          {mintData.length === 0 && (
            <div className="mint-field">
              <p>No files added.</p>
            </div>
          )}
          {/* Batch Mint Button */}
          {loading ? <MintingLoading /> : (
            <button type="submit" disabled={!allImagesUploaded}>
              Batch Mint
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default BatchMint;
