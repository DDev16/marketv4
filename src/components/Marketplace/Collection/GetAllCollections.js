import React, { useState, useContext, useEffect } from 'react';
import { Web3Context } from '../../../utils/Web3Provider.js';
import { useNavigate } from 'react-router-dom';
import styles from '../../../components/Marketplace/Collection/GetAllCollections.module.css';

const CollectionCard = ({ collection, navigateToCollectionPage }) => {
  return (
    <div className={styles.collectionCard} onClick={() => navigateToCollectionPage(collection.collectionId)}>
      <p className={styles.collectionID}>Collection ID: {collection.collectionId}</p>
      <h2 className={styles.collectionName}>{collection.name}</h2>
      <img src={`https://ipfs.io/ipfs/${collection.logoIPFS}`} alt="Logo" className={styles.collectionLogo} />
      <img src={`https://ipfs.io/ipfs/${collection.bannerIPFS}`} alt="Banner" className={styles.collectionBanner} />
      <p className={styles.collectionDescription}>{collection.description}</p>
      <button className={styles.collectionButton} onClick={() => navigateToCollectionPage(collection.collectionId)}>View Collection</button>
    </div>
  );
};

const MyCollections = () => {
  const { web3, marketplaceContract } = useContext(Web3Context);
  const [collections, setCollections] = useState([]);
  const [currentPage, setCurrentPage] = useState(2);
  const [searchName, setSearchName] = useState('');
  const [searchCollectionId, setSearchCollectionId] = useState('');
  const collectionsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    if (!web3 || !marketplaceContract) return;

    const fetchCollections = async () => {
      const accounts = await web3.eth.getAccounts();
      const allCollections = await marketplaceContract.methods.getAllCollections(currentPage - 1, collectionsPerPage).call({ from: accounts[0] });

      const flattenedCollections = allCollections.map((collection, index) => {
        return {
          id: index,
          name: collection.name,
          logoIPFS: collection.logoIPFS,
          bannerIPFS: collection.bannerIPFS,
          description: collection.description,
          collectionId: collection.collectionId
        };
      });

      setCollections(flattenedCollections);
    };

    fetchCollections();
  }, [web3, marketplaceContract, currentPage]);

  const navigateToCollectionPage = (id) => {
    navigate(`/collections/${id}`);
  };

  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNameChange = (event) => {
    setSearchName(event.target.value);
  };

  const handleCollectionIdChange = (event) => {
    setSearchCollectionId(event.target.value);
  };

  const filterCollections = (collection) => {
    const nameMatch = collection.name.toLowerCase().includes(searchName.toLowerCase());
    const idMatch = collection.collectionId.includes(searchCollectionId);
    return nameMatch && idMatch;
  };

  const filteredCollections = collections.filter(filterCollections);

  return (
    <div className={styles.myCollectionsContainer}>
      <h1 className={styles.myCollectionsTitle}> Collections</h1>
      <button className={styles.myPageButton} onClick={prevPage}>Previous Page</button>
      <button className={styles.myPageButton} onClick={nextPage}>Next Page</button>
      <div className={styles.searchContainer}>
      <input
  type="text"
  placeholder="Search by name"
  value={searchName}
  onChange={handleNameChange}
  className={styles.searchInput}
/>

<input
  type="text"
  placeholder="Search by collection ID"
  value={searchCollectionId}
  onChange={handleCollectionIdChange}
  className={styles.searchInput}
/>

      </div>
      <div className={styles.myCollectionsList}>
        {filteredCollections.map((collection, index) => (
          <CollectionCard
            key={index}
            collection={collection}
            navigateToCollectionPage={navigateToCollectionPage}
          />
        ))}
      </div>

    </div>
  );
};

export default MyCollections;