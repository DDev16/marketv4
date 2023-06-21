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
            contractAddress = '0xcE925a80BD00882bF50A16207B2fD4d9B76a5521';
            marketplaceAddress = '0x902Eca4dA5342120DC4f64b106c5518eC83751DA';
          } else if (networkId === 14) {
            // Flare network
            contractAddress = '0x92Dd5BF315b84F1fA0fB9865ca9130a45f99e117';
            marketplaceAddress = '0xbdEd0D2bf404bdcBa897a74E6657f1f12e5C6fb6';
          } else if (networkId === 31337) {
            // Hardhat network
            contractAddress = '0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E';
            marketplaceAddress = '0x6447dF3D871432e42D9516113dc9065A8101bc63';
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
