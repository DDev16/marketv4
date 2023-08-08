import React, { useState, useEffect, useContext } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../../../../components/Marketplace/Collection/Hot/HottestCollections.modules.css';
import { Web3Context } from '../../../../utils/Web3Provider'; // Import the Web3Context from the correct path
import Web3 from 'web3';
import { useNavigate } from 'react-router-dom';

const formatTotalVolume = (totalVolume, currencySymbol) => {
  const million = 1000000;
  const billion = 1000000000;

  if (totalVolume >= billion) {
    return `${(totalVolume / billion).toFixed(1)} ${currencySymbol} bil`;
  } else if (totalVolume >= million) {
    return `${(totalVolume / million).toFixed(1)} ${currencySymbol} mil`;
  } else {
    return `${totalVolume} ${currencySymbol}`;
  }
};
  // Function to fetch the top 10 collections using the marketplaceContract
  const HottestCollection = ( ) => {
    const { web3, marketplaceContract } = useContext(Web3Context);
    const [carouselItems, setCarouselItems] = useState([]);
    const navigate = useNavigate();
 // State to hold the network ID
 const [networkId, setNetworkId] = useState(null);

 useEffect(() => {
  // Function to fetch the network ID
  const fetchNetworkId = async () => {
    try {
      const networkId = await web3.eth.net.getId();
      console.log('Network ID:', networkId); // Log the networkId to see its value
      setNetworkId(networkId);
    } catch (error) {
      console.error('Error fetching network ID:', error);
    }
  };

  if (web3) {
    fetchNetworkId();
  }
}, [web3]);


    const navigateToCollectionPage = (id) => {
      navigate(`/collections/${id}`);
    };

    // Function to fetch the top 10 collections using the marketplaceContract
    const getTop10Collections = async () => {
      try {
        const top10Collections = await marketplaceContract.methods.getTop10HottestCollections().call();
        // Now 'top10Collections' will contain an array of Collection objects with name and imageUrl properties
    
        // Fetch total volume for each collection and add it to the collection object
        const collectionsWithTotalVolume = await Promise.all(
          top10Collections.map(async (collection) => {
            const totalVolume = await marketplaceContract.methods.getTotalVolume(collection.collectionId).call();
            return { ...collection, totalVolume };
          })
        );
    
        console.log('Top 10 Collections:', collectionsWithTotalVolume); // Log the fetched data with total volume
        setCarouselItems(collectionsWithTotalVolume);
      } catch (error) {
        console.error('Error fetching top 10 collections:', error);
      }
    };
  
    useEffect(() => {
      if (marketplaceContract) {
        getTop10Collections();
      }
    }, [marketplaceContract]); 
    
  
  
    // Update carousel settings to show 10 slides at a time
    const carouselSettings = {
      dots: true,
      speed: 1000,
      slidesToShow: Math.min(10, carouselItems.length), // Show up to 10 slides if available
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3000,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 2,
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
          },
        },
      ],
    };

     // Function to get the appropriate currency symbol based on network ID
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
  
    return (
      <div className="hottest-collection">
        <h2>🔥 Top 10 Collections 🔥</h2>
        <Slider {...carouselSettings}>
          {carouselItems.map((collection) => (
            
            <div key={collection.collectionId} className="carousel-item" onClick={() => navigateToCollectionPage(collection.collectionId)}>
              {/* Construct the URL for the logo image using the IPFS gateway */}
              <img
                src={`https://ipfs.io/ipfs/${collection.logoIPFS}`}
                alt={`Item ${collection.collectionId}`}
              />
              <div className="collection-name">{collection.name}</div>
              <div className="total-volume">{`Total Volume: ${formatTotalVolume(
              web3.utils.fromWei(collection.totalVolume, 'ether'),
              getCurrencySymbol()
            )}`}</div>
            </div>
          ))}
        </Slider>
      </div>
    );
  };
  
  export default HottestCollection;