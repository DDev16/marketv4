import React, { useState, useContext } from 'react';
import { Web3Context } from '../../../../utils/Web3Provider.js';
import './BulkAddToCollection.css';
import Swal from 'sweetalert2';
import { styled } from '@mui/system';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';

const StyledImage = styled('img')`
  width: 25%;
  height: 350px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
  }
`;

const styles = (theme) => ({
  subtitle: {
    fontSize: '1.125rem',
    fontWeight: 500,
    lineHeight: 1.6,
    marginBottom: '8px',
    color: '#333',
  },
  textareaContainer: {
    position: 'relative',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    color: '#333',
    resize: 'vertical',
    minHeight: '200px',
    fontSize: '1rem',
    lineHeight: 1.6,
    '&::placeholder': {
      color: '#999',
    },
  },
});

const BulkAddToCollection = () => {
  const { web3, marketplaceContract, contract } = useContext(Web3Context);
  const [collectionId, setCollectionId] = useState('');
  const [tokenData, setTokenData] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const parseTokenData = () => {
    const tokens = tokenData.split('\n').map(token => {
      const tokenId = token.trim();
      return { contractAddress: contract.options.address, tokenId };
    });

    return tokens.filter(token => token.tokenId !== '');
  };

  const bulkAddToCollection = async () => {
    try {
      setIsLoading(true);
      const accounts = await web3.eth.getAccounts();
      const tokens = parseTokenData();
      const contractAddresses = tokens.map(token => token.contractAddress);
      const tokenIds = tokens.map(token => Number(token.tokenId));
  
      await marketplaceContract.methods.BulkAddToCollection(
        collectionId,
        contractAddresses,
        tokenIds
      ).send({ from: accounts[0] });
  
      Swal.fire('Success!', 'Tokens successfully added to the collection!', 'success');
      setTokenData('');
      setCollectionId('');
    } catch (error) {
      console.error("An error occurred while adding the tokens to the collection:", error);
  
      // Display the error message in the Swal alert
      Swal.fire('Error!', error.message, 'error');
  
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="bulk-add-to-collection">
      <h2>Bulk Add To Collection</h2>
      <StyledImage src="https://cdn-icons-png.flaticon.com/128/2181/2181596.png" alt="A psychedelic image" />

      <p>
        This form allows you to bulk add tokens to a collection. Provide the collection ID and token data, following the given format.
        Click on the title below to access the form.
      </p>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>
            Bulk Add To Collection Form: Input the Collection ID and Token Data
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box component="div">
            <Typography variant="subtitle1">Collection ID:</Typography>
            <input
              type="text"
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              placeholder="Enter the collection ID"
            />

            <Typography variant="subtitle1">Bulk Add Tokens:</Typography>
            <textarea
              value={tokenData}
              onChange={(e) => setTokenData(e.target.value)}
              placeholder="Example:
                            1
                            2
                            3"
            />

            <Typography variant="subtitle1">Instructions:</Typography>
            <ul>
              <li>Input should consist of token IDs, each on a new line.</li>
              <li>Each token ID should be entered on a new line, like so:</li>
              <li>To streamline the process you can use Chat Gpt for large amounts <a href="https://chat.openai.com/" target="_blank" rel="noopener noreferrer">Link here</a> </li>
            </ul>
            <pre>
              <code>
                1
                <br />
                2
                <br />
                3
              </code>
            </pre>
            <p>When you're done entering all token IDs, click on the "Add To Collection" button to process them.</p>
            <button disabled={isLoading} onClick={bulkAddToCollection}>
              {isLoading ? "Processing..." : "Add To Collection"}
            </button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default BulkAddToCollection;
