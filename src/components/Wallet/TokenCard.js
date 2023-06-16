import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './NFTCard.css';

function NFTCard({ nft }) {
  const [isTxHistoryOpen, setIsTxHistoryOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [imageData, setImageData] = useState(null);

  const handleTxHistoryClick = () => {
    setIsTxHistoryOpen(!isTxHistoryOpen);
  };

  const handleTxClick = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp) * 1000);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  };
  useEffect(() => {
    const fetchImageData = async () => {
      if (nft.type === 'ERC721') {
        try {
          const response = await axios.get(nft.uri, { responseType: 'arraybuffer' });
          const imageData = Buffer.from(response.data, 'binary').toString('base64');
          setImageData(imageData);
        } catch (error) {
          console.error('Error fetching image data:', error);
        }
      }
    };
  
    fetchImageData();
  }, [nft.uri, nft.type]);

  return (
    <div className="nft-card">
      <img src={`data:image/png;base64,${imageData}`} alt="NFT" />

      <h3 className="nft-name">{nft.name}</h3>
      <p className="nft-description">{nft.description}</p>
      <div className="nft-details">
        <div className="nft-info">
        <span className="nft-field" role="heading" aria-level="2">Balance:</span>
          <span className="nft-value">{nft.balance}</span>
        </div>
        <div className="nft-info">
          <span className="nft-field">Contract Address:</span>
          <span className="nft-value contract-address">{nft.contractAddress}</span>
        </div>
        <div className="nft-info">
          <span className="nft-field">Decimals:</span>
          <span className="nft-value">{nft.decimals}</span>
        </div>
        <div className="nft-info">
          <span className="nft-field">Symbol:</span>
          <span className="nft-value">{nft.symbol}</span>
        </div>
        <div className="nft-info">
          <span className="nft-field">Type:</span>
          <span className="nft-value">{nft.type}</span>
        </div>
        <div className="nft-info">
      
        <span className="nft-field">Transaction History:</span>
        <div className="tx-summary" onClick={handleTxHistoryClick}>
            <span className="tx-field">Total Transactions:</span>
            <span className="tx-value">{nft.txHistory.length}</span>
          </div>
          {isTxHistoryOpen && nft.txHistory.map((tx, index) => (
            <div key={index} className="transaction">
              <div className="tx-summary" onClick={() => handleTxClick(index)}>
                <span className="tx-field">Block Hash:</span>
                <span className="block-hash">{tx.blockHash}</span>
                <span className="tx-field">Timestamp:</span>
                <span className="tx-value">{formatDate(tx.timeStamp)}</span>
              </div>
              {index === activeIndex && (
                <div className="tx-details">
                  <div className="tx-info">
                    <span className="tx-field">Block Number:</span>
                    <span className="tx-value">{tx.blockNumber}</span>
                  </div>
                  <div className="tx-info">
                    <span className="tx-field">Confirmations:</span>
                    <span className="tx-value">{tx.confirmations}</span>
                  </div>
                  <div className="tx-info">
                    <span className="tx-field">Contract Address:</span>
                    <span className="tx-value">{tx.contractAddress}</span>
                  </div>
                  <div className="tx-info">
                    <span className="tx-field">Cumulative Gas Used:</span>
                    <span className="tx-value">{tx.cumulativeGasUsed}</span>
                  </div>
                  <div className="tx-info">
                    <span className="tx-field">From:</span>
                    <span className="tx-value">{tx.from}</span>
                  </div>
                  <div className="tx-info">
                    <span className="tx-field">Gas:</span>
                    <span className="tx-value">{tx.gas}</span>
                  </div>
                  <div className="tx-info">
                    <span className="tx-field">Gas Price:</span>
                    <span className="tx-value">{tx.gasPrice}</span>
                  </div>
                  <div className="tx-info">
                    <span className="tx-field">Gas Used:</span>
                    <span className="tx-value">{tx.gasUsed}</span>
                  </div>
                  <div className="tx-info">
                    <span className="tx-field">Hash:</span>
                    <span className="tx-value">{tx.hash}</span>
                  </div>
                  <div className="tx-info">
                    <span className="tx-field">Log Index:</span>
                    <span className="tx-value">{tx.logIndex}</span>
                  </div>
                  <div className="tx-info">
                    <span className="tx-field">Nonce:</span>
                    <span className="tx-value">{tx.nonce}</span>
                  </div>
                  <div className="tx-info">
                    <span className="tx-field">To:</span>
                    <span className="tx-value">{tx.to}</span>
                  </div>
                  <div className="tx-info">
                    <span className="tx-field">Token Decimal:</span>
                    <span className="tx-value">{tx.tokenDecimal}</span>
                  </div>
                  <div className="tx-info">
                    <span className="tx-field">Token ID:</span>
                    <span className="tx-value">{tx.tokenID}</span>
                  </div>
                  <div className="tx-info">
                    <span className="tx-field">Token Name:</span>
                    <span className="tx-value">{tx.tokenName}</span>
                  </div>
                  <div className="tx-info">
                    <span className="tx-field">Token Symbol:</span>
                    <span className="tx-value">{tx.tokenSymbol}</span>
                  </div>
                  <div className="tx-info">
                    <span className="tx-field">Transaction Index:</span>
                    <span className="tx-value">{tx.transactionIndex}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NFTCard;
