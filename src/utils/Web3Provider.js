import React, { useState, useEffect, createContext } from 'react';
import Web3 from 'web3';
import MyNFT from '../abi/MyNFT.js'; 
import Marketplace from '../abi/Marketplace.js'; // import the Marketplace ABI

export const Web3Context = createContext();

const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [marketplaceContract, setMarketplaceContract] = useState(null); // new state for the Marketplace contract
  const [initialized, setInitialized] = useState(false);
  const [connected, setConnected] = useState(false); // state to track connection status

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);

        if (!initialized) {
          await window.ethereum.enable();
          setInitialized(true);
          setConnected(true); // set connection status to true on initialization
        }
        setWeb3(web3Instance);
        setContract(null); // Reset contract when network changes

        const handleNetworkChange = () => {
          window.location.reload(); // Reload the page on network change
        };

        window.ethereum.on('chainChanged', handleNetworkChange);

        const networkId = await web3Instance.eth.net.getId();
        let contractAddress = '';
        let marketplaceAddress = ''; 

        if (networkId === 19) {
          // Songbird network
          contractAddress = '0x3ED889c5E4e5251E48ceEE2C32b1e8dcC005D82E';
          marketplaceAddress = '0xc45b1866BCFaf694bcF53108B69beC496750941B'; // add the Marketplace contract address for Songbird
        } else if (networkId === 14) {
          // Flare network
          contractAddress = '0x92Dd5BF315b84F1fA0fB9865ca9130a45f99e117';
          marketplaceAddress = '0xbdEd0D2bf404bdcBa897a74E6657f1f12e5C6fb6'; // add the Marketplace contract address for Flare
        } 
        else if (networkId === 31337) {
          // Flare network
          contractAddress = '0x39eA0589139C1597A003d67b73b13006DfDB25A2';
          marketplaceAddress = '0xF2c15D5186E39F8899FE662cf795732A3108E28A'; // add the Marketplace contract address for HArdhatnode
        }else {
          // Add more conditions for other networks
          // ...
        }

        const contractInstance = new web3Instance.eth.Contract(
          MyNFT.abi,
          contractAddress
        );
        const marketplaceInstance = new web3Instance.eth.Contract(
          Marketplace.abi,
          marketplaceAddress
        ); // create instance of Marketplace contract
        setContract(contractInstance);
        setMarketplaceContract(marketplaceInstance); // store the instance of Marketplace contract
      } else {
        window.alert('You need to install MetaMask!');
      }
    };

    initializeWeb3();
  }, [initialized]);

  const handleConnectDisconnect = async () => {
    if (window.ethereum) {
      if (connected) {
        window.ethereum.removeAllListeners('chainChanged'); // Remove the network change listener
        setContract(null);
        setMarketplaceContract(null);
        setConnected(false); // set connection status to false on disconnect
      } else {
        await window.ethereum.enable();
        setConnected(true); // set connection status to true on connect
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
