import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Web3Context } from '../../../utils/Web3Provider.js';
import styles from '../../../components/Marketplace/Collection/CollectionPage.modules.css';
import QRCode from 'qrcode.react';
import 'canvas-toBlob';
import Confetti from 'react-confetti';
import Swal from 'sweetalert2';

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
  {
    constant: true,
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  // Add more functions if needed
];

const CollectionPage = () => {
  const { collectionId } = useParams();
  const { web3, marketplaceContract, contract } = useContext(Web3Context);
  const [collection, setCollection] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [qrCodeUrl, setQRCodeUrl] = useState('');
  const [tokenPrices, setTokenPrices] = useState({});

  const qrRef = useRef();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

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
              const tokenOwner = await contract.methods.ownerOf(tokenId).call({ from: ownerAddress });  // Added this line

              const ipfsUrl = tokenURI.replace('ipfs://', '');
              console.log(`Fetching IPFS data from: https://ipfs.io/ipfs/${ipfsUrl}`);
              const cardDetailsResponse = await fetch(`https://ipfs.io/ipfs/${ipfsUrl}`);
              const cardDetails = await cardDetailsResponse.json();
              cardDetails.image = cardDetails.image || cardDetails.imageUrl;

              const { name, description } = cardDetails;
              console.log('Card Details:', cardDetails);

            
              
              const isForSale = await marketplaceContract.methods.isTokenForSale(contractAddress, tokenId).call({ from: ownerAddress });
              
              // Only fetch token price if it is for sale
              let tokenPrice = null;
              if (isForSale) {
                tokenPrice = await marketplaceContract.methods.getTokenPrice(contractAddress, tokenId).call({ from: ownerAddress });
              }

              return {
                tokenId,
                contractAddress,
                tokenURI,
                name,
                description,
                isForSale,
                tokenPrice,
                tokenOwner,  // Ensure tokenOwner is included here



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

  const buyToken = async (contractAddress, tokenId) => {
    try {
      if (!web3) {
        console.error('Web3 object is not initialized');
        return;
      }
      const accounts = await web3.eth.getAccounts();
      const buyerAddress = accounts[0];
      const token = tokens.find((t) => t.tokenId === tokenId && t.contractAddress === contractAddress);
  
      // Check if the token exists
      if (!token) {
        console.error('Token is undefined:', token);
        return;
      }
  
      const tokenPriceWei = await marketplaceContract.methods.getTokenPrice(contractAddress, tokenId).call({ from: buyerAddress });
      const tokenPriceEther = web3.utils.fromWei(tokenPriceWei.toString(), 'ether');
      console.log('Token Price in Ether:', tokenPriceEther); // Log the price in Ether
      setIsBuying(true);
  
      await marketplaceContract.methods.buyToken(contractAddress, tokenId).send({ from: buyerAddress, value: tokenPriceWei });
      console.log('Token bought successfully!');
      
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000); // Show confetti for 5 seconds
  
      Swal.fire({
        title: `Congratulations!`,
        text: `You're now the proud owner of the "${token.name}" NFT!`,
        imageUrl: `https://ipfs.io/ipfs/${token.image.replace(/ipfs:\/\//g, '')}`,
        imageWidth: 200,
        imageHeight: 200,
        imageAlt: 'Custom image',
        icon: 'success',
        confirmButtonText: 'Awesome!',
        customClass: {
          container: 'my-swal',
        },
        showClass: {
          popup: 'animate__animated animate__zoomIn'
        },
        hideClass: {
          popup: 'animate__animated animate__zoomOut'
        },
        background: '#1e1e1e',
        iconColor: '#a9ff4d',
        timer: 7000,
        timerProgressBar: true,
        footer: '<a href>Why am I seeing this?</a>',
      })
      
      setShowConfetti(true);
      setIsBuying(false);

    } catch (error) {
      console.error('Error buying token:', error);
      setIsBuying(false); // If the purchase fails, reset the buying state

      Swal.fire({
        title: 'Error!',
        text: 'Something went wrong during your purchase. Please try again.',
        icon: 'error',
        confirmButtonText: 'Okay',
        customClass: {
          container: 'my-swal',
        },
        showClass: {
          popup: 'animate__animated animate__zoomIn'
        },
        hideClass: {
          popup: 'animate__animated animate__zoomOut'
        },
        background: '#1e1e1e',
        iconColor: '#ff4d4d',
        timer: 7000,
        timerProgressBar: true,
        footer: '<a href>Contact Support</a>',
      })
  
      setIsBuying(false); // Set buying state to false when an error occurs
    }
  };
  


  if (!collection) {
    return <div>Loading...</div>;
  }

  return (
    <div className="collectionPage">
      {showConfetti && (
      <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%'}}>
        <Confetti numberOfPieces={200} />
      </div>
    )}
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
  
  <div class="token-info">
    <p><span class="token-label">Token ID:</span> {token.tokenId}</p>
    <p><span class="token-label">Name:</span> {token.name}</p>
    <p><span class="token-label">Description:</span> {token.description}</p>
    <p><span class="token-label">Contract Address:</span> {token.contractAddress}</p>
    <p><span class="token-label">Token Owner:</span> {token.tokenOwner}</p>
    <p class={token.tokenPrice !== null ? "for-sale" : "not-for-sale"}>
  Token Price: {token.tokenPrice !== null ? web3.utils.fromWei(token.tokenPrice, 'ether') : 'Not for sale'}
</p>
</div>


            {token.isForSale && (
  <button onClick={() => buyToken(token.contractAddress, token.tokenId)}>
    Buy
  </button>
)}
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollectionPage;