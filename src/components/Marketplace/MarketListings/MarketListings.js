import React, { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../../../utils/Web3Provider';
import './MarketListings.css';
import Loading from '../../Loading/Loading';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import 'animate.css';
import Confetti from 'react-confetti'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/system';
import Pagination from '@mui/material/Pagination';



const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between', // to separate the icon and text
  alignItems: 'center', 
  padding: theme.spacing(1),// decrease padding to reduce size

}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  
  padding: theme.spacing(1),// decrease padding to reduce size
  borderRadius:'5px',
}));


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
    inputs: [],
    name: '_baseTokenURI',
    outputs: [{ name: '', type: 'string' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
];



async function fetchImageFromIpfs(url) {
  // Replace the Pinata gateway URL with the ipfs.io gateway
  url = url.replace('https://gateway.pinata.cloud/ipfs/', 'https://ipfs.io/ipfs/');

  try {
    const response = await fetch(url);
    if (response.ok) {
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
  } catch (error) {
    console.error(`Error fetching from gateway ${url}:`, error);
  }

  throw new Error('All IPFS gateways failed');
}

const MarketListings = () => {
  const { web3, contract, marketplaceContract } = useContext(Web3Context);
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [failedImages, setFailedImages] = useState([]);
  const [account, setAccount] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTokens, setFilteredTokens] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [sortType, setSortType] = useState('lowToHigh'); // initial value
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
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

  useEffect(() => {
    // First, filter by the search query
    let filtered = tokens.filter((token) => {
      const { metadata, contractAddress, tokenId, price } = token;
      const lowercaseQuery = searchQuery.toLowerCase();
  
      // Convert price to Ether for comparison
      const priceNum = parseFloat(web3.utils.fromWei(price, 'ether'));
  
      // Check if the token matches the search query
      return (
        metadata.name.toLowerCase().includes(lowercaseQuery) ||
        contractAddress.toLowerCase().includes(lowercaseQuery) ||
        tokenId.toString().includes(searchQuery) ||
        price.toString().toLowerCase().includes(lowercaseQuery)
      );
    });
  
    // Apply additional filters for min and max price
    filtered = filtered.filter((token) => {
      const priceNum = parseFloat(web3.utils.fromWei(token.price, 'ether'));
      const withinMinPrice = minPrice === '' || priceNum >= parseFloat(minPrice);
      const withinMaxPrice = maxPrice === '' || priceNum <= parseFloat(maxPrice);
      return withinMinPrice && withinMaxPrice;
    });
  
    // Then sort the filtered tokens
    if (sortType === 'lowToHigh') {
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortType === 'highToLow') {
      filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }
  
    setFilteredTokens(filtered);
  }, [tokens, searchQuery, minPrice, maxPrice, sortType]); // Remove currentPage from this dependency array
  
  

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedImage('');
    setIsModalOpen(false);
  };

 const buyToken = async (contractAddress, tokenId, price) => {
  setIsBuying(true); // Set buying state to true when the purchase begins
  try {
    Swal.fire({
      title: 'Processing',
      text: 'Transaction in progress. Please wait...',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    await marketplaceContract.methods.buyToken(contractAddress, tokenId).send({ value: price, from: account });
    const tokenData = tokens.find(token => token.tokenId === tokenId);
      setPurchaseSuccess(true);
      
      

      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      
      Swal.fire({
        title: `Congratulations!`,
        text: `You're now the proud owner of the "${tokenData.metadata.name}" NFT!`,
        imageUrl: tokenData.imageUrl,
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
        timer: 5000,
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
        timer: 5000,
        timerProgressBar: true,
        footer: '<a href>Contact Support</a>',
      })
    }
  };
  
  
  

  useEffect(() => {
    const loadAccount = async () => {
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    };

    if (web3) {
      loadAccount();
    }
  }, [web3]);

  useEffect(() => {
    const fetchTokensForSale = async () => {
      try {
        if (marketplaceContract) {
          const tokens = await marketplaceContract.methods.getAllTokensForSale().call();

          const tokensData = await Promise.all(
            tokens.map(async (token) => {
              const tokenContract = new web3.eth.Contract(ERC721_ABI, token.contractAddress);

              let tokenUri;
              if (tokenContract.methods.tokenURI) {
                tokenUri = await tokenContract.methods.tokenURI(token.tokenId).call();
              } else if (tokenContract.methods._baseURI) {
                const baseUri = await tokenContract.methods._baseURI().call();
                tokenUri = `${baseUri}${token.tokenId}`;
              } else {
                return null;
              }

              let metadataUri;
              if (tokenUri.startsWith('https://')) {
                metadataUri = tokenUri;
              } else if (tokenUri.startsWith('ipfs://')) {
                metadataUri = `https://ipfs.io/ipfs/${tokenUri.replace('ipfs://', '')}`;
              } else {
                return null;
              }

              let metadata;

              try {
                const response = await fetch(metadataUri);
                metadata = await response.json();

                if (!metadata.image) {
                  return null;
                }
              } catch (error) {
                console.error(`Error fetching metadata for token ID ${token.tokenId}:`, error);
                return null;
              }

              const isVideo = metadata.image.endsWith('.mp4');

              let imageUrl;
              if (isVideo) {
                imageUrl = metadata.image.startsWith('https://')
                  ? metadata.image
                  : `https://ipfs.io/ipfs/${metadata.image.replace('ipfs://', '')}`;
              } else if (metadata.image.startsWith('ipfs://')) {
                const ipfsHash = metadata.image.replace('ipfs://', '');
                try {
                  imageUrl = await fetchImageFromIpfs(`https://ipfs.io/ipfs/${ipfsHash}`);
                } catch (error) {
                  console.error('All IPFS gateways failed for token ID ' + token.tokenId, error);
                  setFailedImages((failedImages) => [...failedImages, token.tokenId]);
                  return null;
                }
              } else if (metadata.image.startsWith('https://')) {
                try {
                  imageUrl = await fetchImageFromIpfs(metadata.image);
                } catch (error) {
                  console.error('Failed to fetch image for token ID ' + token.tokenId, error);
                  return null;
                }
              } else {
                imageUrl = metadata.image;
              }

              const { contractAddress, tokenId, price, seller } = token;
              const royalty = await contract.methods.royaltyInfo(tokenId, price).call();
              const royaltyReceiver = royalty[0];
              const royaltyAmount = royalty[1];

              return {
                contractAddress,
                tokenId,
                price,
                seller,
                imageUrl,
                metadata,
                isVideo,
                royaltyReceiver,
                royaltyAmount,
              };
            })
          );

          setTokens(tokensData);
        }
      } catch (error) {
        console.error('Error fetching tokens for sale:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokensForSale();
  }, [web3, contract, marketplaceContract]);

  
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const pageCount = Math.ceil(filteredTokens.length / itemsPerPage);

  // Calculate the index range for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;

  // Get the tokens for the current page directly from the filteredTokens array
  const paginatedTokens = filteredTokens.slice(startIndex, endIndex);
  if (isLoading) {
    return <Loading />;
  }

  return (
  <div className="market">
    <div className="marketListings">
      {showConfetti && (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 999 }}>
          <Confetti numberOfPieces={400} />
          <p>Confetti effect indicates a successful purchase.</p>
        </div>
      )}
      <div className="marketTitle">
        <p>NFT's For Sale</p>
      </div>

      <StyledAccordion style={{width: "100%", margin: "0 auto"}} defaultExpanded={true}>
        <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Listings</Typography>
        </StyledAccordionSummary>
        <p>Please ensure both minimum and maximum values are set for effective price range filtering.</p>
        <AccordionDetails>
          <div>
            <label htmlFor="minPrice">Min price:</label>
            <input
              id="minPrice"
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min price"
            />
            <p>Use this to set the minimum price for the NFTs you want to see.</p>
          </div>
          <div>
            <label htmlFor="maxPrice">Max price:</label>
            <input
              id="maxPrice"
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max price"
            />
            <p>Use this to set the maximum price for the NFTs you want to see.</p>
          </div>
          <div>
            <label htmlFor="sortType">Sort by price:</label>
            <select
              id="sortType"
              value={sortType}
              onChange={(e) => {
                console.log('New sortType:', e.target.value);
                setSortType(e.target.value);
              }}
            >
              <option value="lowToHigh">Low to High</option>
              <option value="highToLow">High to Low</option>
            </select>
            <p>Use this to sort the displayed NFTs by price.</p>
          </div>
          
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, contract address, token ID, or price"
          />
          <p>Use this to search for NFTs by their name, contract address, token ID, or price.</p>
          <div className="pagination">
            <Pagination 
              count={pageCount} 
              page={currentPage} 
              onChange={handlePageChange}
              boundaryCount={1}
              siblingCount={1} 
              showFirstButton 
              showLastButton
              variant="outlined"
              shape="rounded"
              color="primary" 
            />
          </div>
          <p>Click on the image to see it in full size. Click 'Back' to return to the listings.</p>

          <div className="marketListings">
          {paginatedTokens.map((token, index) => (
        <div key={index} className="marketListings__token">
          {failedImages.includes(token.tokenId) ? (
            <p>Failed to load image for this token</p>
          ) : token.isVideo ? (
            <video
              className="marketListings__tokenImage"
              src={token.imageUrl}
              alt={`Token ${token.tokenId}`}
              controls
            />
          ) : (
            <img
              className="marketListings__tokenImage"
              src={token.imageUrl}
              alt={`Token ${token.tokenId}`}
              onClick={() => openImageModal(token.imageUrl)}
            />
          )}
          <p className="marketListings__tokenInfo">Name: {token.metadata.name}</p>
          <div className="descriptionContainer">
            <p className="marketListings__tokenInfo">Description: {token.metadata.description}</p>
          </div>
          <p className="marketListings__tokenInfo">
    Contract Address: {token.contractAddress}
</p>
<p className="marketListings__tokenInfo">Token ID: {token.tokenId}</p>
<p className="marketListings__tokenInfo">
Price: {parseFloat(web3.utils.fromWei(token.price, 'ether')).toFixed(2)} {getCurrencySymbol()}
</p>

<p className="marketListings__tokenInfo">Royalty: {web3.utils.fromWei(token.royaltyAmount, 'ether')} {getCurrencySymbol()}</p>
<p className="marketListings__tokenInfo">Royalty Receiver: {token.royaltyReceiver}</p>

<p className="marketListings__tokenInfo">
    Seller: {token.seller}
</p>

          
          <button onClick={() => buyToken(token.contractAddress, token.tokenId, token.price)} className="buyButton">
  {isBuying ? 'Buying...' : 'Buy'}
</button>
        </div>
      ))}

            <Modal
              isOpen={isModalOpen}
              onRequestClose={closeModal}
              contentLabel="Token Image"
              className="imageModal"
              shouldCloseOnOverlayClick={true}
              shouldCloseOnEsc={true}
              ariaHideApp={false}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                {selectedImage && <img className="modalImage" src={selectedImage} alt="Token" />}
                <button onClick={closeModal} style={{ marginTop: '10px' }}>Back</button>
              </div>
            </Modal>
          </div>
        </AccordionDetails>
      </StyledAccordion>
    </div>
  </div>
);
          };

export default MarketListings;