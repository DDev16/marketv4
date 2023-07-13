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

const BulkAddToCollection = () => {
    const { web3, marketplaceContract } = useContext(Web3Context);
    const [collectionId, setCollectionId] = useState('');
    const [tokenData, setTokenData] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const parseTokenData = () => {
        const tokens = tokenData.split('\n').map(token => {
            const splitToken = token.split(',');
            if (splitToken.length !== 2) {
                console.error("Invalid token format: ", token);
                return null;
            }
            const [contractAddress, tokenId] = splitToken;
            return { contractAddress: contractAddress.trim(), tokenId: tokenId.trim() };
        });
    
        return tokens.filter(Boolean);
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
            Swal.fire('Error!', 'There was an error while adding the tokens to the collection. Please check console for more details.', 'error');
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
                            0x1234...abcd,1
                            0x5678...efgh,2
                            0x9abc...def0,3"
                        />

                        <Typography variant="subtitle1">Instructions:</Typography>
                        <ul>
                            <li>Input should consist of pairs of Contract Addresses and Token IDs. </li>
                            <li>Each pair should be written as <code>ContractAddress,TokenID</code>, with a comma separating the Contract Address and Token ID.</li>
                            <li>Each pair should be entered on a new line. Do not put spaces between the pairs, or between the Contract Address and Token ID within a pair.</li>
                            <li>If you have multiple pairs to enter, simply place each pair on a new line, like so:</li>
                        </ul>
                        <pre>
                            <code>
                                0x1234...abcd,1
                                <br/>
                                0x5678...efgh,2
                                <br/>
                                0x9abc...def0,3
                            </code>
                        </pre>
                        <p>When you're done entering all pairs, click on the "Add To Collection" button to process them.</p>
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