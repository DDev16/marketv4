import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Web3Context } from '../../../utils/Web3Provider.js';
import styles from '../../../components/Marketplace/Collection/CollectionPage.modules.css';
import QRCode from 'qrcode.react';
import 'canvas-toBlob';

const ERC721_ABI = [
  {
    constant: true,
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  // Add more functions if needed
];

const CollectionPage = () => {
  const { collectionId } = useParams();
  const { web3, marketplaceContract } = useContext(Web3Context);
  const [collection, setCollection] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [qrCodeUrl, setQRCodeUrl] = useState('');

  const qrRef = useRef();

  const downloadQRCode = () => {
    const canvas = qrRef.current.querySelector('canvas');
    canvas.toBlob((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'qr_code.png';
      link.click();
      URL.revokeObjectURL(link.href);
    });
  };

  useEffect(() => {
    const fetchCollectionDetails = async () => {
      try {
        if (!web3) {
          console.error('Web3 object is not initialized');
          return;
        }
    
        const accounts = await web3.eth.getAccounts();
        const ownerAddress = accounts[0];
    
        const collectionDetails = await marketplaceContract.methods
          .getCollectionDetails(collectionId)
          .call({ from: ownerAddress });
    
        const fetchedCollection = collectionDetails[0];
        const fetchedTokens = collectionDetails[1];
    
        if (fetchedCollection) {
          console.log('Fetched Collection:', fetchedCollection);

          const collectionData = {
            name: fetchedCollection.name,
            logoIPFS: fetchedCollection.logoIPFS,
            bannerIPFS: fetchedCollection.bannerIPFS,
            description: fetchedCollection.description,
            owner: fetchedCollection.owner,
          };
          

          console.log('Collection Data:', collectionData);
          setCollection(collectionData);

          const fetchedCards = await Promise.all(
            fetchedTokens.map(async ([contractAddress, tokenId]) => {
              const contract = new web3.eth.Contract(ERC721_ABI, contractAddress);
              const tokenURI = await contract.methods.tokenURI(tokenId).call({ from: ownerAddress });
              const ipfsUrl = tokenURI.replace('ipfs://', '');
              console.log(`Fetching IPFS data from: https://ipfs.io/ipfs/${ipfsUrl}`);
              const cardDetailsResponse = await fetch(`https://ipfs.io/ipfs/${ipfsUrl}`);
              const cardDetails = await cardDetailsResponse.json();
              cardDetails.image = cardDetails.image || cardDetails.imageUrl;

              const { name, description } = cardDetails;
              console.log('Card Details:', cardDetails);
              return {
                tokenId,
                contractAddress,
                tokenURI,
                name,
                description,
                ...cardDetails,
              };
            })
          );

          console.log('Fetched Cards:', fetchedCards);
          setTokens(fetchedCards);
        } else {
          console.error('Collection not found');
        }
      } catch (error) {
        console.error('Error fetching collection:', error);
      }
    };

    if (web3 && marketplaceContract) {
      fetchCollectionDetails();
    }
  }, [web3, marketplaceContract, collectionId]);

  const generateQRCodeUrl = () => {
    const baseUrl = 'http://localhost:3000/collections/';
    const collectionUrl = `${baseUrl}${collectionId}`;
    setQRCodeUrl(collectionUrl);
  };

  useEffect(() => {
    if (collection) {
      generateQRCodeUrl();
    }
  }, [collection]);

  if (!collection) {
    return <div>Loading...</div>;
  }

  return (
    <div className="collectionPage">
      <h1>{collection.name}</h1>
      <p className="owner">Owned by: {collection.owner}</p>

      <div className="collectionlogo">
        <img src={`https://ipfs.io/ipfs/${collection.logoIPFS}`} alt="Logo" />
      </div>
      <div className="banner">
        <img src={`https://ipfs.io/ipfs/${collection.bannerIPFS}`} alt="Banner" />
      </div>
      <p className="description">{collection.description}</p>
  
      <div className="qrCode" ref={qrRef}>
        {qrCodeUrl && <QRCode value={qrCodeUrl} />}
        <button onClick={downloadQRCode}>Download QR Code</button>
      </div>
  
      <div className="cardContainer">
        {tokens.map((token, index) => (
          <div className="card" key={index}>
            {token.image.toLowerCase().endsWith('.mp4') ? (
              <video controls src={`https://ipfs.io/ipfs/${token.image.replace(/ipfs:\/\//g, '')}`} alt={`NFT Card ${index + 1}`} />
            ) : (
              <img src={`https://ipfs.io/ipfs/${token.image.replace(/ipfs:\/\//g, '')}`} alt={`NFT Card ${index + 1}`} />
            )}
  
            <p>Token ID: {token.tokenId}</p>
            <p>Name: {token.name}</p>
            <p>Description: {token.description}</p>
            <p>Contract Address: {token.contractAddress}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollectionPage;
