// MyCollections.js
import React, { useState, useContext, useEffect } from 'react';
import { Web3Context } from '../../../utils/Web3Provider.js';
import styles from '../../../components/Marketplace/Collection/MyCollections.module.css';
import AddToCollection from '../../../components/Marketplace/Collection/AddToCollection.js';
import { useNavigate } from 'react-router-dom';


const CollectionCard = ({ collection, navigateToCollectionPage }) => {
  return (
    <div className={styles.collectionCard} onClick={() => navigateToCollectionPage(collection.id)}>
      <p className={styles.collectionID}>Collection ID: {collection.id}</p>
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
  const navigate = useNavigate();

  const navigateToCollectionPage = (collectionId) => {
    navigate(`/collections/${collectionId}`);
  };

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        if (!web3) {
          console.error('Web3 object is not initialized');
          return;
        }

        const accounts = await web3.eth.getAccounts();
        const ownerAddress = accounts[0];
        const fetchedCollections = await marketplaceContract.methods.getCollectionsByOwner(ownerAddress).call();
        const collectionsWithId = fetchedCollections.map((collection, index) => ({
  ...collection,
  id: index, // changed from index + 1
}));

        setCollections(collectionsWithId);
        
      } catch (error) {
        console.error('Error fetching collections:', error);
      }
    };
  
    if (web3 && marketplaceContract) {
      fetchCollections();
    }
  }, [web3, marketplaceContract]);

  const renderCollections = () => {
    if (collections.length === 0) {
      return <p>No collections found.</p>;
    }
  
    return collections.map((collection, index) => {
      const key = `collection-${collection.id}`; // Use the collection ID as the key
      return (
        <CollectionCard
          key={key}
          collection={collection}
          navigateToCollectionPage={navigateToCollectionPage}
        />
      );
    });
  };
  

  return (
    <>
      <AddToCollection />
      <div className={styles.collectionsContainer}>
        <h1 className={styles.title}>My Collections</h1>
        <div className={styles.cardsContainer}>
          {renderCollections()}
        </div>
      </div>
    </>
  );
};

export default MyCollections;
