

import React, { useState, useEffect, createContext } from 'react';
import Web3 from 'web3';
import MyNFT from '../abi/MyNFT.js'; 
import Marketplace from '../abi/Marketplace.js';
import detectEthereumProvider from '@metamask/detect-provider';
import Auction from '../abi/Auction.js'
export const Web3Context = createContext();

const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [auction, setAuctionContract] = useState(null);
  const [marketplaceContract, setMarketplaceContract] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const initializeWeb3 = async () => {
      const provider = await detectEthereumProvider();

      if (provider) {
        try {
          await provider.request({ method: 'eth_requestAccounts' });
          setConnected(true);

          const web3Instance = new Web3(provider);
          setWeb3(web3Instance);
          
          const networkId = await web3Instance.eth.net.getId();
          let contractAddress = '';
          let marketplaceAddress = '';
          let auctionAddress = '';

          if (networkId === 19) {
            contractAddress = '0xa3e7F6e322281F945abE5cB82Fc2EbAd32756a87';
            marketplaceAddress = '0x529e76715e99D02a34EDACD7E47415297012c00f';
          } else if (networkId === 14) {
            contractAddress = '0x8d1A663F84c5a7cf0c0458848089783d0a0A3b6A';
            marketplaceAddress = '0x73710334E4E5CA4482F5526faBEa45bce503BD98';
          } else if (networkId === 5) {
            contractAddress = '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0';
            marketplaceAddress = '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82';
          } else if (networkId === 31337) {
            contractAddress = '0xd9fEc8238711935D6c8d79Bef2B9546ef23FC046';
             marketplaceAddress = '0x313F922BE1649cEc058EC0f076664500c78bdc0b';
             auctionAddress = '0x26B862f640357268Bd2d9E95bc81553a2Aa81D7E';
          } 

          const contractInstance = new web3Instance.eth.Contract(
            MyNFT.abi,
            contractAddress
          );
          const marketplaceInstance = new web3Instance.eth.Contract(
            Marketplace.abi,
            marketplaceAddress
          );
          const auctionInstance = new web3Instance.eth.Contract(
            Auction,
            auctionAddress
          );
          setContract(contractInstance);
          setMarketplaceContract(marketplaceInstance);
          setAuctionContract(auctionInstance);
          setInitialized(true);
        } catch (error) {
          window.alert('Failed to connect to MetaMask');
        }

        const handleNetworkChange = () => {
          setInitialized(false);  // Will cause the useEffect hook to re-run and re-initialize everything
          initializeWeb3();
        };

        provider.on('chainChanged', handleNetworkChange);
      } else {
        window.alert('Please install MetaMask!');
      }
    };

    initializeWeb3();
  }, [initialized]);

  const handleConnectDisconnect = async () => {
    const provider = await detectEthereumProvider();

    if (provider) {
      if (connected) {
        provider.removeAllListeners('chainChanged');
        setContract(null);
        
        setMarketplaceContract(null);
        setAuctionContract(null);
        setConnected(false);
      } else {
        await provider.request({ method: 'eth_requestAccounts' });
        setConnected(true);
      }
    }
  };

  return (
    <Web3Context.Provider value={{ web3, contract, marketplaceContract, auction, disconnect: handleConnectDisconnect }}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Provider;





