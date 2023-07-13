// CollectionTools.js
import { styled } from '@mui/system';
import React from 'react';
import styles from '../../../components/Marketplace/Collection/MyCollections.module.css';

const StyledImage = styled('img')`
  width: 15%;
  height: 150px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
  }
`;

const CollectionTools = () => (
  <div className={styles.collectionTools}>
    <h1>Collection Tools</h1>
    <StyledImage src="https://cdn-icons-png.flaticon.com/128/1416/1416681.png" alt="A psychedelic image" />
  </div>
);

export default CollectionTools;