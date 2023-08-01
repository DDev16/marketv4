import React, { useState, useEffect, useContext } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import logoPlaceholder from '../../../../assets/punk2.gif';
import '../../../../components/Marketplace/Collection/Hot/HottestCollections.modules.css';
import { Web3Context } from '../../../../utils/Web3Provider'; // Import the Web3Context from the correct path
import Web3 from 'web3';

  // Function to fetch the top 10 collections using the marketplaceContract
  const HottestCollection = () => {
    const { marketplaceContract } = useContext(Web3Context);
    const [carouselItems, setCarouselItems] = useState([]);
    const web3 = new Web3();

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
      // Check if marketplaceContract is available
      if (marketplaceContract) {
        getTop10Collections();
      }
    }, [marketplaceContract]);
    
  
  
    // Update carousel settings to show 10 slides at a time
    const carouselSettings = {
      dots: true,
      infinite: true,
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
  
    return (
      <div className="hottest-collection">
        <h2>🔥 Top 10 Collections 🔥</h2>
        <Slider {...carouselSettings}>
          {carouselItems.map((collection) => (
            <div key={collection.collectionId} className="carousel-item">
              {/* Construct the URL for the logo image using the IPFS gateway */}
              <img
                src={`https://ipfs.io/ipfs/${collection.logoIPFS}`}
                alt={`Item ${collection.collectionId}`}
              />
              <div className="collection-name">{collection.name}</div>
              <div className="total-volume">{`Total Volume: ${web3.utils.fromWei(collection.totalVolume, 'ether')} ETH`}</div> {/* Updated to display the total volume in ETH */}

            </div>
          ))}
        </Slider>
      </div>
    );
  };
  
  export default HottestCollection;