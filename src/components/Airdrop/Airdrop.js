import React, { useContext, useState, useEffect } from 'react';
import { Web3Context } from '../utils/Web3Provider';
import './Airdrop.css';

const Airdrop = () => {
  const { web3, contract } = useContext(Web3Context);
  const [recipients, setRecipients] = useState([]);
  const [tokenIds, setTokenIds] = useState([]);
  const [airdropFee, setAirdropFee] = useState(0);

  useEffect(() => {
    (async () => {
      const fee = await contract.methods.airdropFee().call();
      setAirdropFee(web3.utils.fromWei(fee, 'ether'));
    })();
  }, [contract.methods, web3.utils]);
  

  const handleRecipientChange = (event, index) => {
    const newRecipients = [...recipients];
    newRecipients[index] = event.target.value;
    setRecipients(newRecipients);
  };

  const handleTokenIdChange = (event, index) => {
    const newTokenIds = [...tokenIds];
    newTokenIds[index] = parseInt(event.target.value, 10);
    setTokenIds(newTokenIds);
  };

  const handleAirdrop = async () => {
    if (recipients.length !== tokenIds.length) {
      alert('Recipients and tokenIds arrays must have the same length.');
      return;
    }

    try {
      await contract.methods
        .airdropNFTs(recipients, tokenIds)
        .send({ from: web3.eth.defaultAccount, value: web3.utils.toWei(airdropFee, 'ether') });
      alert('Airdrop success!');
    } catch (err) {
      alert('An error occurred during the airdrop.');
      console.error(err);
    }
  };

  return (
    <div className="Airdrop">
      <h2>Airdrop NFTs</h2>
      {Array(5).fill().map((_, i) => (
        <div key={i}>
          <input
            type="text"
            placeholder="Recipient Address"
            onChange={(event) => handleRecipientChange(event, i)}
          />
          <input
            type="number"
            placeholder="Token ID"
            onChange={(event) => handleTokenIdChange(event, i)}
          />
        </div>
      ))}
      <button onClick={handleAirdrop}>Start Airdrop</button>
    </div>
  );
};

export default Airdrop;
