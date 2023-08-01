import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
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
  {
    constant: true,
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'value', type: 'uint256' } // this input could be different based on your implementation
    ],
    name: 'royaltyInfo',
    outputs: [
      { name: '', type: 'address' },
      { name: '', type: 'uint256' }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  }
  
];

const CollectionPage = () => {
  const { collectionId } = useParams();
  const { web3, contract, marketplaceContract } = useContext(Web3Context);
  const [collection, setCollection] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [qrCodeUrl, setQRCodeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Add a state for loading status

  const qrRef = useRef();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
 // Add a state for sorting order
 const [sortOrder, setSortOrder] = useState('asc'); // 'asc' for ascending, 'desc' for descending

 // Add a state for sorting by listed status
 const [sortByListed, setSortByListed] = useState('all'); // 'all' for both listed and unlisted, 'listed' for listed only, 'unlisted' for unlisted only

  const downloadQRCode = () => {
    const canvas = qrRef.current.querySelector('canvas');
    const dataUrl = canvas.toDataURL('image/png');
    
    // For some browsers, `blob:` is needed:
    let isAndroid = /Android/i.test(navigator.userAgent);
    if (isAndroid && !dataUrl.startsWith('blob:')) {
      dataUrl = 'blob:' + dataUrl;
    }
  
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'qr_code.png';
    link.click();
  };

  const sortTokensByName = (tokensToSort, sortOrder) => {
    const sortedTokens = [...tokensToSort].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
  
      if (sortOrder === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
  
    return sortedTokens;
  };
  
  const sortTokensByListedStatus = (tokensToSort, sortByListed) => {
    const sortedTokens = [...tokensToSort].sort((a, b) => {
      if (sortByListed === 'listed') {
        return a.isForSale === b.isForSale ? 0 : a.isForSale ? -1 : 1;
      } else if (sortByListed === 'unlisted') {
        return a.isForSale === b.isForSale ? 0 : a.isForSale ? 1 : -1;
      } else {
        return 0;
      }
    });
  
    return sortedTokens;
  };
  

  // Call the sorting functions when sortOrder or sortByListed changes, or tokens are fetched
  const sortedTokens = useMemo(() => {
    let filteredTokens = tokens;
    if (sortByListed !== 'all') {
      filteredTokens = filteredTokens.filter((token) => {
        return sortByListed === 'listed' ? token.isForSale : !token.isForSale;
      });
    }
  
    if (sortOrder === 'asc') {
      return sortTokensByName(filteredTokens, sortOrder);
    } else {
      return sortTokensByName(filteredTokens, sortOrder).reverse();
    }
  }, [tokens, sortOrder, sortByListed]);
  

  useEffect(() => {
    const fetchCollectionDetails = async () => {
      setIsLoading(true); // Set loading status to true before fetching data

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


 const highestSalePrice = await marketplaceContract.methods
      .getHighestSalePrice(collectionId)
      .call({ from: ownerAddress });

    const floorPrice = await marketplaceContract.methods
      .getFloorPrice(collectionId)
      .call({ from: ownerAddress });

    const marketCap = await marketplaceContract.methods
      .getMarketCap(collectionId)
      .call({ from: ownerAddress });

    const itemsCount = await marketplaceContract.methods
      .getItemsCount(collectionId)
      .call({ from: ownerAddress });

    const ownersCount = await marketplaceContract.methods
      .getOwnersCount(collectionId)
      .call({ from: ownerAddress });

    const totalVolume = await marketplaceContract.methods
      .getTotalVolume(collectionId)
      .call({ from: ownerAddress });

    const collectionData = {
      name: fetchedCollection.name,
      logoIPFS: fetchedCollection.logoIPFS,
      bannerIPFS: fetchedCollection.bannerIPFS,
      description: fetchedCollection.description,
      owner: fetchedCollection.owner,
      highestSalePrice,
      floorPrice,
      marketCap,
      itemsCount,
      ownersCount,
      totalVolume,
    };
          

          console.log('Collection Data:', collectionData);
          setCollection(collectionData);

          const fetchedCards = await Promise.all(
            fetchedTokens.map(async ([contractAddress, tokenId]) => {
              const contract = new web3.eth.Contract(ERC721_ABI, contractAddress);
              
              const tokenURI = await contract.methods.tokenURI(tokenId).call({ from: ownerAddress });
              const tokenOwner = await contract.methods.ownerOf(tokenId).call({ from: ownerAddress });

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

              // Fetch royalty information
              let royaltyReceiver = null;
              let royaltyAmount = null;
              if (tokenPrice) {
                const royaltyInfo = await contract.methods.royaltyInfo(tokenId, tokenPrice).call();
                royaltyReceiver = royaltyInfo[0];
                royaltyAmount = royaltyInfo[1];
              }

              return {
                tokenId,
                contractAddress,
                tokenURI,
                name,
                description,
                isForSale,
                tokenPrice,
                tokenOwner,
                royaltyReceiver,
                royaltyAmount,
                ...cardDetails,
              };
            })
          );

          console.log('Fetched Cards:', fetchedCards);
          setTokens(fetchedCards);
          setIsLoading(false);

        } else {
          console.error('Collection not found');
          setIsLoading(false); // Set loading status to false if there's an error

        }
      } catch (error) {
        console.error('Error fetching collection:', error);
        setIsLoading(false); // Set loading status to false if there's an error

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
      Swal.fire({
        title: 'Processing',
        html: 'Please wait...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading()
        },
      });

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
  
      Swal.close();
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
      Swal.close();
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!collection) {
    return <div>Loading...</div>;
  }

  const getFilteredTokens = () => {
    if (sortByListed === 'all') {
      return tokens; // Return all tokens
    } else if (sortByListed === 'listed') {
      return tokens.filter((token) => token.isForSale); // Return only listed tokens
    } else {
      return tokens.filter((token) => !token.isForSale); // Return only unlisted tokens
    }
  };
  
  return (
    <div className="collectionPage">
       {showConfetti && (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 999 }}>
        <Confetti numberOfPieces={400} />
      </div>
    )}
      <h1>{collection.name}</h1>

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
      <p className="owner">Collection owned by: {collection.owner}</p>
      <section className="collectionStatistics">
  <article>
    <h3>Highest Sale Price: <span>{web3.utils.fromWei(collection.highestSalePrice.toString(), 'ether')} Native Token</span></h3>
  </article>
  <article>
    <h3>Floor Price: <span>{web3.utils.fromWei(collection.floorPrice.toString(), 'ether')} Native Token</span></h3>
  </article>
  <article>
    <h3>Market Cap: <span>{web3.utils.fromWei(collection.marketCap.toString(), 'ether')} Native Token</span></h3>
  </article>
  <article>
    <h3>Items Count: {collection.itemsCount}</h3>
  </article>
  <article>
    <h3>Owners Count: {collection.ownersCount}</h3>
  </article>
  <article>
    <h3>Total Volume: <span>{web3.utils.fromWei(collection.totalVolume.toString(), 'ether')} Native Token</span></h3>
  </article>
</section>
<div>
      <button onClick={() => setSortOrder('asc')}>Sort A-Z</button>
      <button onClick={() => setSortOrder('desc')}>Sort Z-A</button>
    </div>
    <div>
      <button onClick={() => setSortByListed('all')}>All Tokens</button>
      <button onClick={() => setSortByListed('listed')}>Listed Only</button>
      <button onClick={() => setSortByListed('unlisted')}>Unlisted Only</button>
    </div>


    <div className="cardContainer">
      {sortedTokens.map((token, index) => (
          <div className="card" key={index}>
            {token.image.toLowerCase().endsWith('.mp4') ? (
              <video controls src={`https://ipfs.io/ipfs/${token.image.replace(/ipfs:\/\//g, '')}`} alt={`NFT Card ${index + 1}`} />
            ) : (
              <img src={`https://ipfs.io/ipfs/${token.image.replace(/ipfs:\/\//g, '')}`} alt={`NFT Card ${index + 1}`} />
            )}
  
  <div className="token-info">
    <p><span className="token-label">Token ID:</span> {token.tokenId}</p>
    <p><span className="token-label">Name:</span> {token.name}</p>
    <p><span className="token-label">Description:</span> {token.description}</p>
    <p><span className="token-label">Contract Address:</span> {token.contractAddress}</p>
    <p><span className="token-label">Token Owner:</span> {token.tokenOwner}</p>
    <p className={token.tokenPrice !== null ? "for-sale" : "not-for-sale"}>
    Token Price: {token.tokenPrice ? web3.utils.fromWei(token.tokenPrice.toString(), 'ether') : 'Not for sale'}
</p>

<p> <span className="token-label">Royalty:</span>  {token.royaltyAmount ? web3.utils.fromWei(token.royaltyAmount.toString(), 'ether') : '0'} In Native Token</p>
<p> <span className="token-label">Royalty Receiver:</span>  {token.royaltyReceiver}</p>
</div>


            {token.isForSale && (
  <button className="buy-button" onClick={() => buyToken(token.contractAddress, token.tokenId)}>
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