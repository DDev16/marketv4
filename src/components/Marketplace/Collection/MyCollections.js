







import React, { useState, useContext, useEffect } from 'react';
import { Web3Context } from '../../../utils/Web3Provider.js';
import styles from '../../../components/Marketplace/Collection/MyCollections.module.css';
import AddToCollection from '../../../components/Marketplace/Collection/AddToCollection.js';


const CollectionCard = ({ collection, index, navigateToCollectionPage }) => {
    return (
      <div className={styles.collectionCard} onClick={() => navigateToCollectionPage(collection.id)}>
        <p className={styles.collectionID}>Collection ID: {index}</p>
  
        <h2 className={styles.collectionName}>{collection.name}</h2>
        <img src={`https://ipfs.io/ipfs/${collection.logoIPFS}`} alt="Logo" className={styles.collectionLogo} />
        <img src={`https://ipfs.io/ipfs/${collection.bannerIPFS}`} alt="Banner" className={styles.collectionBanner} />
        <p className={styles.collectionDescription}>{collection.description}</p>
  
        <button className={styles.collectionButton} onClick={() => navigateToCollectionPage(collection.id)}>View Collection</button>
      </div>
    );
  };
  
  

const MyCollections = () => {
  const { web3, marketplaceContract } = useContext(Web3Context);
  const [collections, setCollections] = useState([]);

  const navigateToCollectionPage = (collectionId) => {
    // Implement navigation to collection page here
  }

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        if (!web3) {
          // Web3 object is not initialized, handle the error or show a message
          console.error('Web3 object is not initialized');
          return;
        }
  
        const accounts = await web3.eth.getAccounts();
        const ownerAddress = accounts[0];
        const fetchedCollections = await marketplaceContract.methods.getCollectionsByOwner(ownerAddress).call();
        setCollections(fetchedCollections);
      } catch (error) {
        console.error('Error fetching collections:', error);
      }
    };
  
    // Check if web3 is initialized before fetching collections
    if (web3 && marketplaceContract) {
      fetchCollections();
    }
  }, [web3, marketplaceContract]);
  

  const renderCollections = () => {
    if (collections.length === 0) {
      return <p>No collections found.</p>;
    }
  
    return collections.map((collection, index) => {
      const key = `collection-${index + 1}`; // Add an offset of 1 to the index
      return (
        <CollectionCard
          key={key}
          collection={collection}
          navigateToCollectionPage={navigateToCollectionPage}
          index={index}
        />
      );
    });
  };
  

  return (
    <><AddToCollection /><div className={styles.collectionsContainer}>
          <h1 className={styles.title}>My Collections</h1>
          <div className={styles.cardsContainer}>
              {renderCollections()}
          </div>
      </div></>
  );
};

export default MyCollections;







