import React from 'react';
import styles from '../../../components/Marketplace/Collection/Preview.module.css';

// Import mock NFT card images
import mockCard1 from '../../../assets/mock.png';
import mockCard2 from '../../../assets/mock.png';
import mockCard3 from '../../../assets/mock.png';
import mockCard4 from '../../../assets/mock.png';
import mockCard5 from '../../../assets/mock.png';
import mockCard6 from '../../../assets/mock.png';
import mockCard7 from '../../../assets/mock.png';
import mockCard8 from '../../../assets/mock.png';
import mockCard9 from '../../../assets/mock.png';
import mockCard10 from '../../../assets/mock.png';
import mockCard11 from '../../../assets/mock.png';
import mockCard12 from '../../../assets/mock.png';

const cardData = [
  {
    image: mockCard1,
    tokenId: 1,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    contractAddress: '0x123456789abcdef',
  },
  {
    image: mockCard2,
    tokenId: 2,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    contractAddress: '0x23456789abcdef0',
  },
  {
    image: mockCard3,
    tokenId: 3,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    contractAddress: '0x123456789abcdef',
  },
  {
    image: mockCard4,
    tokenId: 4,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    contractAddress: '0x23456789abcdef0',
  },
  {
    image: mockCard5,
    tokenId: 5,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    contractAddress: '0x123456789abcdef',
  },
  {
    image: mockCard6,
    tokenId: 6,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    contractAddress: '0x23456789abcdef0',
  },
  {
    image: mockCard7,
    tokenId: 7,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    contractAddress: '0x123456789abcdef',
  },
  {
    image: mockCard8,
    tokenId: 8,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    contractAddress: '0x23456789abcdef0',
  },
  {
    image: mockCard9,
    tokenId: 9,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    contractAddress: '0x123456789abcdef',
  },
  {
    image: mockCard10,
    tokenId: 10,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    contractAddress: '0x23456789abcdef0',
  },
  {
    image: mockCard11,
    tokenId: 11,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    contractAddress: '0x123456789abcdef',
  },
  {
    image: mockCard12,
    tokenId: 12,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    contractAddress: '0x23456789abcdef0',
  },
  // Add more card objects as needed
];

const Preview = ({ name, logo, banner, description, category }) => {
  return (
    <div className={styles.previewContainer}>
      <h2>Preview</h2>
      <div className={styles.logo}>
        {logo && <img src={URL.createObjectURL(logo)} alt="Logo" />}
      </div>
      <h1 className={styles.title}>{name}</h1>
      <div className={styles.banner}>
        {banner && <img src={URL.createObjectURL(banner)} alt="Banner" />}
      </div>
      <p className={styles.description}>{description}</p>
      <p className={styles.category}>{category}</p>

      {/* Add mock NFT card images */}
      <div className={styles.cardContainer}>
        {cardData.map((card, index) => (
          <div className={styles.card} key={index}>
            <img src={card.image} alt={`NFT Card ${index + 1}`} />
            <p>Token ID: {card.tokenId}</p>
            <p>Description: {card.description}</p>
            <p>Contract Address: {card.contractAddress}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Preview;
