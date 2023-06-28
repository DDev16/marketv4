import React, { useState, useEffect, createContext } from 'react';
import Web3 from 'web3';
import MyNFT from '../abi/MyNFT.js'; 
import Marketplace from '../abi/Marketplace.js';

export const Web3Context = createContext();

const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [marketplaceContract, setMarketplaceContract] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (window.ethereum) {
        try {
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          setConnected(true);

          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          
          const networkId = await web3Instance.eth.net.getId();
          let contractAddress = '';
          let marketplaceAddress = '';

          if (networkId === 19) {
            // Songbird network
            contractAddress = '0xcd61F8F6E215CE93F7724a6BB4F5641b108D0276';
            marketplaceAddress = '0xA5Fc39c439746AED8db3bb57CdEA9FB446A54694';
          } else if (networkId === 14) {
            // Flare network
            contractAddress = '0x8d1A663F84c5a7cf0c0458848089783d0a0A3b6A';
            marketplaceAddress = '0x73710334E4E5CA4482F5526faBEa45bce503BD98';
          } else if (networkId === 31337) {
            // Hardhat network
            contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
            marketplaceAddress = '0x3857C14Ec0C727ac2aEcD5016283C76c6b5C860e';
          }
          

          const contractInstance = new web3Instance.eth.Contract(
            MyNFT.abi,
            contractAddress
          );
          const marketplaceInstance = new web3Instance.eth.Contract(
            Marketplace.abi,
            marketplaceAddress
          );
          setContract(contractInstance);
          setMarketplaceContract(marketplaceInstance);
          setInitialized(true);
        } catch (error) {
          window.alert('Failed to connect to MetaMask');
        }

        const handleNetworkChange = () => {
          setInitialized(false);  // Will cause the useEffect hook to re-run and re-initialize everything
          initializeWeb3();
        };
        

        window.ethereum.on('chainChanged', handleNetworkChange);
      } else {
        window.alert('You need to install MetaMask!');
      }
    };

    initializeWeb3();
  }, [initialized]);

  const handleConnectDisconnect = async () => {
    if (window.ethereum) {
      if (connected) {
        window.ethereum.removeAllListeners('chainChanged');
        setContract(null);
        setMarketplaceContract(null);
        setConnected(false);
      } else {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setConnected(true);
      }
    }
  };

  return (
    <Web3Context.Provider value={{ web3, contract, marketplaceContract, disconnect: handleConnectDisconnect }}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Provider;
