import React, { useState, useContext, useEffect } from 'react';
import { Web3Context } from '../../../utils/Web3Provider.js';
import { useNavigate } from 'react-router-dom';
import styles from '../../../components/Marketplace/Collection/GetAllCollections.module.css';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/system';
import Grid from '@mui/material/Grid'

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between', // to separate the icon and text
  alignItems: 'center', 
  padding: theme.spacing(1),// decrease padding to reduce size
  

}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  
  padding: theme.spacing(1),// decrease padding to reduce size
  borderRadius:'5px',
}));

const CollectionCard = ({ collection, navigateToCollectionPage }) => {
  return (
    <div className={styles.collectionCard} onClick={() => navigateToCollectionPage(collection.collectionId)}>
      <p className={styles.collectionID}>Collection ID: {collection.collectionId}</p>
      <h2 className={styles.collectionName}>{collection.name}</h2>
      <img src={`https://ipfs.io/ipfs/${collection.logoIPFS}`} alt="Logo" className="logo" />
      <p className={styles.collectionDescription}>{collection.description}</p>
      <p className={styles.collectionCategory}>Category: {collection.category}</p>
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
  const collectionsPerPage = 50;
  const navigate = useNavigate();
  const paginationSpread = 2; // Determines how many page buttons to display before and after the current page
// Pagination logic
const firstPage = Math.max(1, currentPage - paginationSpread);
const lastPage = Math.min(maxPage, currentPage + paginationSpread);
const [searchCategory, setSearchCategory] = useState(''); // new state for category

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
            collectionId: collection.collectionId,
            category: collection.category // ensure your contract returns this field
          };
        });
        

        const filteredCollections = flattenedCollections.filter(collection => {
          const nameMatch = collection.name.toLowerCase().includes(searchName.toLowerCase());
          const idMatch = collection.collectionId.includes(searchCollectionId);
          const categoryMatch = searchCategory === '' || collection.category === searchCategory; // added check for category
          return nameMatch && idMatch && categoryMatch;
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
  }, [web3, marketplaceContract, currentPage, searchName, searchCollectionId, searchCategory]); // Added searchCategory

  const handleCategoryChange = (event) => {
    setSearchCategory(event.target.value); // new handler for category change
  };


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

  const handlePageChange = (event, value) => { // New handler for page change
    setCurrentPage(value);
  };

  return (
    <>
        <div className="market">

        <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 1440 320" 
    class="wave"
    role="img" 
    aria-label="Wave graphic"
    preserveAspectRatio="xMidYMid meet">
  

  <defs>
    <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="0">
      <stop offset="5%"  stop-color="#2b5876" /> 
      <stop offset="50%" stop-color="#4e4376" /> 
      <stop offset="70%" stop-color="#ef5350" /> 
      <stop offset="95%" stop-color="#202020" /> 
    </linearGradient>
  </defs>

  <path 
  fillOpacity='.5'
    fill="url(#waveGradient)"  
    d="M0,96L80,122.7C160,149,320,203,480,192C640,181,800,107,960,80C1120,53,1280,75,1360,85.3L1440,96L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z">
    
  
    <animate
        repeatCount="indefinite"
        fill="freeze"
        attributeName="d"
        dur="10s"
        values="
          M0,96L80,122.7C160,149,320,203,480,192C640,181,800,107,960,80C1120,53,1280,75,1360,85.3L1440,96L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z;
          M0,96L80,107C160,117,320,139,480,149C640,159,800,169,960,179C1120,189,1280,199,1360,209L1440,219L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z;
          M0,96L80,122.7C160,149,320,203,480,192C640,181,800,107,960,80C1120,53,1280,75,1360,85.3L1440,96L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z;"
      />
  </path>
</svg>



      <h1 className={styles.myCollectionsTitle}>Collections</h1>
      <StyledAccordion defaultExpanded={true}>
      <StyledAccordionSummary
  expandIcon={<ExpandMoreIcon />}
  aria-controls="panel1a-content"
  id="panel1a-header"
>
<Grid container justifyContent="center" style={styles.CenteredDiv}>
      <Typography variant="h5">Community Collections Tab </Typography>
    </Grid>
</StyledAccordionSummary>
        <AccordionDetails>
          <div className={styles.myCollectionsContainer}>
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: 3 }}>
  <Pagination 
    count={maxPage} 
    page={currentPage} 
    onChange={handlePageChange} 
    variant="outlined" 
    shape="rounded" 
    color="primary"
    boundaryCount={2} // Number of pages at the start and end
    siblingCount={1} // Number of pages before and after the current page
    showFirstButton // Show button for first page
    showLastButton // Show button for last page
  />
</Box>

            <div className={styles.searchContainer}>
            <select 
                value={searchCategory}
                onChange={handleCategoryChange}
                className={styles.searchInput}
              >
                <option value="">All Categories</option>
                <option value="Arts">Arts</option>
                <option value="Metaverse">Metaverse</option>
                <option value="Utility">Utility</option>
                <option value="Collectibles">Collectibles</option>
                <option value="Gaming">Gaming</option>
                <option value="Music">Music</option>
                <option value="Sports">Sports</option>
                <option value="Virtual Real Estate">Virtual Real Estate</option>
                <option value="Fashion">Fashion</option>
                <option value="Celebrity/Influencer">Celebrity/Influencer</option>
                <option value="Memes">Memes</option>
              </select>
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
        </AccordionDetails>
      </StyledAccordion>
                </div>

    </>
  );
};

export default MyCollections;
