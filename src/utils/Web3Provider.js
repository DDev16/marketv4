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
            contractAddress = '0xEe2d1f6D5C8d71e8c97CAA4A80fF9eD87dbB9C34';
            marketplaceAddress = '0xc7095B03A1c6b50B4f8B2E6D8c87CBddD188640A';
          } else if (networkId === 14) {
            // Flare network
            contractAddress = '0x8d1A663F84c5a7cf0c0458848089783d0a0A3b6A';
            marketplaceAddress = '0x73710334E4E5CA4482F5526faBEa45bce503BD98';
          } else if (networkId === 5) {
            // Goerli Test network
            contractAddress = '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0';
            marketplaceAddress = '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82';
          }
          
          else if (networkId === 31337) {
            // Hardhat network
            contractAddress = '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0';
            marketplaceAddress = '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82';
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
