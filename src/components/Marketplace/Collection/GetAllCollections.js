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
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [searchCollectionId, setSearchCollectionId] = useState('');
  const collectionsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    if (!web3 || !marketplaceContract) return;

    const fetchCollections = async () => {
      try {
        const accounts = await web3.eth.getAccounts();
        const totalCollections = await marketplaceContract.methods.getCollectionCount().call({ from: accounts[0] });
        const calculatedMaxPage = Math.ceil(totalCollections / collectionsPerPage);
        setMaxPage(calculatedMaxPage);

        const startIndex = (currentPage - 1) * collectionsPerPage;
        if (startIndex < 0 || startIndex >= totalCollections) {
          throw new Error("Start index out of range"); // throw error if start index is out of range
        }

        const allCollections = await marketplaceContract.methods.getAllCollections(startIndex, collectionsPerPage).call({ from: accounts[0] });
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

        const filteredCollections = flattenedCollections.filter(collection => {
          const nameMatch = collection.name.toLowerCase().includes(searchName.toLowerCase());
          const idMatch = collection.collectionId.includes(searchCollectionId);
          return nameMatch && idMatch;
        });

        setCollections(filteredCollections);
      } catch (error) {
        console.error(error);
        if (error.message === "Start index out of range") {
          // handle your error here
        }
      }
    };

    fetchCollections();
  }, [web3, marketplaceContract, currentPage, searchName, searchCollectionId]);

  const navigateToCollectionPage = (id) => {
    navigate(`/collections/${id}`);
  };

  // const nextPage = () => {
  //   if (currentPage < maxPage) {
  //     setCurrentPage(currentPage + 1);
  //   }
  // };

  // const prevPage = () => {
  //   if (currentPage > 1) {
  //     setCurrentPage(currentPage - 1);
  //   }
  // };

  const handleNameChange = (event) => {
    setSearchName(event.target.value);
  };

  const handleCollectionIdChange = (event) => {
    setSearchCollectionId(event.target.value);
  };

  return (
    
    <div className={styles.myCollectionsContainer}>
<svg className={styles.topDivider} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
  <path fillOpacity="1" d="M0,96L48,117.3C96,139,192,181,288,186.7C384,192,480,160,576,160C672,160,768,192,864,192C960,192,1056,160,1152,144C1248,128,1344,128,1392,128L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
</svg>
      <h1 className={styles.myCollectionsTitle}>Collections</h1>
      <div className={styles.paginationContainer}>
        {Array.from({ length: maxPage }, (_, i) => i + 1).map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => setCurrentPage(pageNumber)}
            disabled={pageNumber === currentPage}
            className={`${styles.pageButton} ${
              pageNumber === currentPage && styles.currentPageButton
            }`}
          >
            {pageNumber}
          </button>
        ))}
      </div>
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
        {collections.map((collection, index) => (
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
