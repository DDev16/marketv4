import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import FreeMintABI from '../../abi/FreeMint.js';
import "../../components/FreeMint/FreeMint.css"

const contractAddress = '0x83F00B6578Ba7b3f39223A0e2Fe0d5dbF415E737';

const maxSupply = 1000; // Replace with the actual max supply limit

const YourComponent = () => {
  const [mintAmount, setMintAmount] = useState(0);
  const [transactionStatus, setTransactionStatus] = useState('');
  const [accountBalance, setAccountBalance] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [maxMintAmount, setMaxMintAmount] = useState(10); // Replace with the actual max mint amount
  const [loading, setLoading] = useState(false);

  // Define the cost per mint in ether or wei
  const cost = 0.01; // Replace with the actual cost per mint

  useEffect(() => {
    const fetchBlockchainData = async () => {
      try {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        const accounts = await web3.eth.getAccounts();
        const balance = await web3.eth.getBalance(accounts[0]);
        setAccountBalance(web3.utils.fromWei(balance, 'ether'));

        const contract = new web3.eth.Contract(FreeMintABI, contractAddress);
        const supply = await contract.methods.totalSupply().call();
        setTotalSupply(supply);

        const remainingTokens = maxSupply - parseInt(supply);
        setMaxMintAmount(remainingTokens < maxMintAmount ? remainingTokens : maxMintAmount);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBlockchainData();
  }, []);

  const handleMint = async () => {
    try {
      setLoading(true);

      const web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      const contract = new web3.eth.Contract(FreeMintABI, contractAddress);

      if (mintAmount <= 0) {
        setTransactionStatus('Please enter a valid mint amount.');
        setLoading(false);
        return;
      }

      const mintCost = mintAmount * cost;
      const userBalance = parseFloat(accountBalance);
      if (userBalance < mintCost) {
        setTransactionStatus('Insufficient balance. Please deposit enough funds to mint.');
        setLoading(false);
        return;
      }

      if (mintAmount > maxMintAmount) {
        setTransactionStatus(`Maximum mint amount exceeded. You can mint up to ${maxMintAmount} tokens in a single transaction.`);
        setLoading(false);
        return;
      }

      const result = await contract.methods.mint(mintAmount).send({
        from: web3.givenProvider.selectedAddress,
        value: web3.utils.toWei(mintCost.toString(), 'ether'),
      });

      setLoading(false);
      setTransactionStatus(`Transaction successful! Transaction hash: ${result.transactionHash}`);
      setTotalSupply(parseInt(totalSupply) + mintAmount);
      setMintAmount(0);
    } catch (error) {
      setLoading(false);
      console.error(error);

      if (error.code === 4001) {
        setTransactionStatus('Transaction rejected by the user.');
      } else if (error.code === -32603) {
        setTransactionStatus('Transaction reverted. This could be due to insufficient gas or other reasons.');
      } else {
        setTransactionStatus('Transaction failed.');
      }
    }
  };

  return (
    <div className="Free-Mint">
      <h1>Free Mint</h1>
      <p>Your Account Balance: {accountBalance} FLR</p>
      <p>Total Supply: {totalSupply} Tokens</p>
      <p>Remaining Tokens: {maxSupply - parseInt(totalSupply)} Tokens</p>
      <p>Maximum Supply Limit: {maxSupply} Tokens</p>
      <label>
        Mint Amount (Max {maxMintAmount}):
        <input type="number" value={mintAmount} onChange={(e) => setMintAmount(e.target.value)} />
      </label>
      <button
        onClick={handleMint}
        disabled={mintAmount <= 0 || parseFloat(accountBalance) < mintAmount * cost || loading || parseInt(totalSupply) >= maxSupply}
      >
        Mint
      </button>
      {loading && <p>Loading...</p>}
      <div>{transactionStatus}</div>
    </div>
  );
};

export default YourComponent;
