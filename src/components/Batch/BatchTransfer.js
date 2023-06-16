import React, { useContext, useState } from 'react';
import { Web3Context } from '../../utils/Web3Provider';
import './BatchTransfer.css';

const BatchTransfer = () => {
  const { web3, contract } = useContext(Web3Context);
  const [recipient, setRecipient] = useState('');
  const [tokenIds, setTokenIds] = useState([]);

  const handleRecipientChange = (e) => {
    setRecipient(e.target.value);
  };

  const handleTokenIdChange = (e, index) => {
    const newTokenIds = [...tokenIds];
    newTokenIds[index] = e.target.value;
    setTokenIds(newTokenIds);
  };

  const handleAddTokenId = () => {
    setTokenIds([...tokenIds, '']);
  };

  const handleRemoveTokenId = (index) => {
    const newTokenIds = [...tokenIds];
    newTokenIds.splice(index, 1);
    setTokenIds(newTokenIds);
  };

  const handleBatchTransfer = async () => {
    try {
      // Validate token IDs
      const isValidTokenIds = tokenIds.every((tokenId) => !isNaN(tokenId) && Number.isInteger(Number(tokenId)));
      if (!isValidTokenIds) {
        console.error('Invalid token IDs');
        return;
      }
  
      const accounts = await web3.eth.getAccounts();
      const fromAddress = accounts[0];
  
      await contract.methods.batchTransfer(recipient, tokenIds).send({ from: fromAddress });
  
      // Successful batch transfer
      console.log('Batch transfer successful');
    } catch (error) {
      // Error occurred during batch transfer
      console.error('Batch transfer error:', error);
    }
  };
  
  

  return (
    <div className="batch-transfer">
      <h2>Batch Transfer</h2>
      <div className="recipient">
        <label htmlFor="recipient">Recipient:</label>
        <input id="recipient" type="text" value={recipient} onChange={handleRecipientChange} />
      </div>
      <div className="token-ids">
        <label>Token IDs:</label>
        {tokenIds.map((tokenId, index) => (
          <div className="token-id" key={index}>
            <input type="text" value={tokenId} onChange={(e) => handleTokenIdChange(e, index)} />
            <button className="remove-button" onClick={() => handleRemoveTokenId(index)}>Remove</button>
          </div>
        ))}
        <button className="add-button" onClick={handleAddTokenId}>Add Token ID</button>
      </div>
      <button className="batch-transfer-button" onClick={handleBatchTransfer}>Batch Transfer</button>
    </div>
  );
};

export default BatchTransfer;