import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { useContext, useState } from 'react';
import { Web3Context } from '../../utils/Web3Provider';
import './BatchTransfer.css';

const BatchTransfer = () => {
  const { web3, contract } = useContext(Web3Context);
  const [recipient, setRecipient] = useState('');
  const [tokenIds, setTokenIds] = useState('');

  const handleRecipientChange = (e) => {
    setRecipient(e.target.value);
  };

  const handleTokenIdsInput = (e) => {
    setTokenIds(e.target.value);
  };

  const handleBatchTransfer = async () => {
    try {
      // Split the input string to extract individual token IDs
      const tokenIdsArray = tokenIds
        .split(/[\s,]+/)
        .map((tokenId) => tokenId.trim())
        .filter((tokenId) => tokenId !== '');

      // Validate recipient address
      if (!recipient) {
        console.error('Recipient address cannot be empty');
        return;
      }

      // Validate token IDs
      if (tokenIdsArray.length === 0) {
        console.error('Token IDs cannot be empty');
        return;
      }

      const isValidTokenIds = tokenIdsArray.every(
        (tokenId) => !isNaN(tokenId) && Number.isInteger(Number(tokenId))
      );
      if (!isValidTokenIds) {
        console.error('Invalid token IDs. Please enter valid integers separated by commas, spaces, or new lines.');
        return;
      }

      const accounts = await web3.eth.getAccounts();
      const fromAddress = accounts[0];

      await contract.methods.batchTransfer(recipient, tokenIdsArray).send({ from: fromAddress });

      // Successful batch transfer
      console.log('Batch transfer successful');
    } catch (error) {
      // Error occurred during batch transfer
      console.error('Batch transfer error:', error);
    }
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Batch Transfer</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <div className="batch-transfer">
          <div className="recipient">
            <label htmlFor="recipient">Recipient Address:</label>
            <input
              id="recipient"
              type="text"
              value={recipient}
              onChange={handleRecipientChange}
              placeholder="Enter the recipient's address"
            />
          </div>
          <div className="token-ids">
            <label>Token IDs:</label>
            <textarea
              value={tokenIds}
              onChange={handleTokenIdsInput}
              placeholder="Enter or paste token IDs separated by commas"
            />
            <p className="info">
              For example: 1, 45, 78
            </p>
          </div>
          <button className="batch-transfer-button" onClick={handleBatchTransfer}>
            Batch Transfer
          </button>
        </div>
      </AccordionDetails>
    </Accordion>
  );
};

export default BatchTransfer;