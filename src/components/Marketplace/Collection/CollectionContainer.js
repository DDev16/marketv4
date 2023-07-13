// CollectionsContainer.js
import React, { useMemo } from 'react';
import styles from '../../../components/Marketplace/Collection/MyCollections.module.css';
import CollectionCard from './CollectionCard';

const CollectionsContainer = ({ collections, navigateToCollectionPage }) => {
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

  return (
    <div className={styles.collectionsContainer}>
      <h1 className={styles.title}>My Collections</h1>
      <div className={styles.cardsContainer}>
        {renderCollections}
      </div>
    </div>
  );
};

export default CollectionsContainer;
