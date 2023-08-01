import React, { useState, useContext } from 'react';
import { Web3Context } from '../../../utils/Web3Provider.js';
import './AddToCollection.css';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import { styled } from '@mui/system';
import Swal from 'sweetalert2';


const StyledImage = styled('img')`
  width: 25%;
  height: 350px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
  }
`;

const AddToCollection = () => {
  const { web3, marketplaceContract } = useContext(Web3Context);
  const [collectionId, setCollectionId] = useState(0);
  const [tokenId, setTokenId] = useState(0);

  const handleCollectionIdChange = (event) => {
    setCollectionId(event.target.value);
  };

  const handleTokenIdChange = (event) => {
    setTokenId(event.target.value);
  };

  // Hardcoded contract address
  const hardcodedContractAddress = '0xd9fEc8238711935D6c8d79Bef2B9546ef23FC046';

  const addToCollection = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      await marketplaceContract.methods.addTokenToCollection(collectionId, hardcodedContractAddress, tokenId).send({ from: accounts[0] });

      // Display success message with SweetAlert2
      Swal.fire({
        title: 'Success!',
        text: 'Token added to the collection successfully',
        icon: 'success',
        confirmButtonText: 'Cool'
      });
    } catch (error) {
      console.error('An error occurred while adding the token to the collection:', error);

      // Display error message with SweetAlert2
      Swal.fire({
        title: 'Error!',
        text: 'An error occurred while adding the token to the collection',
        icon: 'error',
        confirmButtonText: 'Try again'
      });
    }
  };

  return (

    <div className="bulk-add-to-collection">
      <h2>Add Single Token To Collection</h2>
      <StyledImage src="https://cdn-icons-png.flaticon.com/128/7116/7116141.png" alt="A psychedelic image" />

      <p>
        This form allows you to add a single token to a collection. Provide the collection ID and token data, following the given format.
        Click on the title below to access the form.
      </p>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Add To Collection</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box className="container">
            <Typography variant="subtitle1">Instructions:</Typography>
            <Typography variant="body1">
              Please follow the steps below to add a token to your collection:
            </Typography>
            <ol>
              <li>Select a Collection ID from your collections.</li>
              <li>Enter the Token ID of the NFT you want to add.</li>
              <li>Click the "Add to Collection" button to add the token.</li>
            </ol>
            <div className="input-container">
              <label htmlFor="collectionId">Collection ID:</label>
              <input type="number" id="collectionId" value={collectionId} onChange={handleCollectionIdChange} placeholder="Enter Collection ID" />
              <small>Select a Collection ID from your collections.</small>
            </div>
            <div className="input-container">
              <label htmlFor="tokenId">Token ID:</label>
              <input type="number" id="tokenId" value={tokenId} onChange={handleTokenIdChange} placeholder="Enter Token ID" />
              <small>Enter the Token ID of the NFT you want to add.</small>
            </div>
            <div className="button-container">
              <button onClick={addToCollection}>Add to Collection</button>
            </div>
          </Box>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default AddToCollection;
