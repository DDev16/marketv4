import { useState, useContext } from 'react';
import { Web3Context } from '../../utils/Web3Provider';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { Box } from '@mui/system';

const BatchTransfer = () => {
  const { web3, contract } = useContext(Web3Context);
  const [recipient, setRecipient] = useState('');
  const [tokenIds, setTokenIds] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRecipientChange = (e) => setRecipient(e.target.value);

  const handleTokenIdsInput = (e) => setTokenIds(e.target.value);

  const isValidInput = (recipient, tokenIdsArray) => {
    if (!recipient) {
      setError('Recipient address cannot be empty');
      return false;
    }
    if (tokenIdsArray.length === 0) {
      setError('Token IDs cannot be empty');
      return false;
    }
    const isValidTokenIds = tokenIdsArray.every((tokenId) => !isNaN(tokenId) && Number.isInteger(Number(tokenId)));
    if (!isValidTokenIds) {
      setError('Invalid token IDs. Please enter valid integers separated by commas, spaces, or new lines.');
      return false;
    }
    return true;
  };

  const handleBatchTransfer = async () => {
    const tokenIdsArray = tokenIds.split(/[\s,]+/).filter((tokenId) => tokenId !== '');
    if (!isValidInput(recipient, tokenIdsArray)) return;
    
    setIsLoading(true);

    try {
      const accounts = await web3.eth.getAccounts();
      const fromAddress = accounts[0];

      await contract.methods.batchTransfer(recipient, tokenIdsArray).send({ from: fromAddress });

      setRecipient('');
      setTokenIds('');
      setError('');
      console.log('Batch transfer successful');
    } catch (error) {
      setError('Batch transfer error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Batch Transfer</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Recipient Address"
            value={recipient}
            onChange={handleRecipientChange}
            fullWidth
            variant="outlined"
          />
          <TextField
            label="Token IDs"
            value={tokenIds}
            onChange={handleTokenIdsInput}
            fullWidth
            variant="outlined"
            multiline
            helperText="Enter or paste token IDs separated by commas. For example: 1,45,78"
          />
          <Button onClick={handleBatchTransfer} disabled={isLoading} variant="contained">
            Batch Transfer
          </Button>
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default BatchTransfer;
