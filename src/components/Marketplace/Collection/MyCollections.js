import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Web3Context } from '../../../utils/Web3Provider.js';
import styles from '../../../components/Marketplace/Collection/MyCollections.module.css';
import AddToCollection from '../../../components/Marketplace/Collection/AddToCollection.js';
import { useNavigate } from 'react-router-dom';
import { Alert, Spinner } from 'react-bootstrap';
import BulkAddToCollection from './BulkAdd/BulkAddToCollection.js';
import MyTokens from '../../../components/MyNFTs/MyTokens.js'
import ListAllTokens from '../Collection/ListAllTokenForSale';
import '../../../components/Marketplace/Collection/MyCollections.module.css';
import { styled } from '@mui/system';

const StyledImage = styled('img')`
  width: 15%;
  height: 150px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
  }
`;

const CollectionCard = React.memo(({ collection, navigateToCollectionPage }) => {
  const handleClick = useCallback(() => navigateToCollectionPage(collection.id), [navigateToCollectionPage, collection.id]);

  return (
    <div className={styles.collectionCard} onClick={handleClick}>
      <p className={styles.collectionID}>Collection ID: {collection.id}</p>
      <h2 className={styles.collectionName}>{collection.name}</h2>
      <img src={`https://ipfs.io/ipfs/${collection.logoIPFS}`} alt="Logo" className={styles.collectionLogo} />
      <img src={`https://ipfs.io/ipfs/${collection.bannerIPFS}`} alt="Banner" className={styles.collectionBanner} />
      <p className={styles.collectionDescription}>{collection.description}</p>
      <button className={styles.collectionButton} onClick={handleClick}>View Collection</button>
    </div>
  );
});

CollectionCard.propTypes = {
  collection: PropTypes.object.isRequired,
  navigateToCollectionPage: PropTypes.func.isRequired,
};

const MyCollections = () => {
  const { web3, marketplaceContract } = useContext(Web3Context);
  const [collections, setCollections] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [isWeb3Ready, setIsWeb3Ready] = useState(false); // new state to track Web3 readiness

  const navigateToCollectionPage = useCallback((collectionId) => {
    navigate(`/collections/${collectionId}`);
  }, [navigate]);

  useEffect(() => {
    if (web3 && marketplaceContract) {
      setIsWeb3Ready(true); // set readiness to true when web3 and contract are available
    }
  }, [web3, marketplaceContract]);

  useEffect(() => {
    const fetchCollections = async () => {
      if (!isWeb3Ready) {
        console.error('Web3 or contract object is not initialized');
        return;
      }

      try {
        setIsLoading(true);

        const accounts = await web3.eth.getAccounts();
        const ownerAddress = accounts[0];
        const fetchedCollections = await marketplaceContract.methods.getCollectionsByOwner(ownerAddress).call();
        const collectionsWithId = fetchedCollections.map((collection) => ({
          ...collection,
          id: collection.collectionId, // change index to collection.collectionId
        }));

        setCollections(collectionsWithId);
      } catch (fetchError) {
        console.error('Error fetching collections:', fetchError);
        setError(fetchError.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (isWeb3Ready) {
      fetchCollections();
    }
  }, [isWeb3Ready, web3, marketplaceContract]);
  const renderCollections = useMemo(() => {
    if (collections.length === 0) {
      return <p>No collections found.</p>;
    }

    return collections.map((collection) => (
      <CollectionCard
        key={collection.id}
        collection={collection}
        navigateToCollectionPage={navigateToCollectionPage}
      />
    ));
  }, [collections, navigateToCollectionPage]);

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (isLoading) {
    return <Spinner animation="border" />;
  }

  return (
    
    <div className={styles.background}>
<div className={styles.collectionTools}>
            <h1>Collection Tools</h1>
            <StyledImage src="https://cdn-icons-png.flaticon.com/128/1416/1416681.png" alt="A psychedelic image" />

            </div>
      <AddToCollection />
      <BulkAddToCollection />
      <ListAllTokens />

      <div className={styles.collectionsContainer}>
        <h1 className={styles.title}>My Collections</h1>
        <div className={styles.cardsContainer}>
          {renderCollections}
        </div>
      </div>
      <MyTokens />
    </div>
    
  );
};

export default MyCollections;
