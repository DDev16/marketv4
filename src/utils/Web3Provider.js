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
          } else if (networkId === 5) {
            // Goerli Test network
            contractAddress = '0xEd5bc9165bd0602daf166D1f7cf8B9D001a189be';
            marketplaceAddress = '0xCAb7Cf9AA9aFD7E3d3B0c70F302454fc09D68dC6';
          }
          
          else if (networkId === 31337) {
            // Hardhat network
            contractAddress = '0xbdEd0D2bf404bdcBa897a74E6657f1f12e5C6fb6';
            marketplaceAddress = '0x4A679253410272dd5232B3Ff7cF5dbB88f295319';
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
