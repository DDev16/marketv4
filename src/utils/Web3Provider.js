import React, { useState, useEffect, createContext } from 'react';
import Web3 from 'web3';
import MyNFT from '../abi/MyNFT.js'; 
import Marketplace from '../abi/Marketplace.js';
import AuctionContract from '../abi/Auction.js';
import detectEthereumProvider from '@metamask/detect-provider';

export const Web3Context = createContext();

const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [marketplaceContract, setMarketplaceContract] = useState(null);
  const [auctionContract, setAuctionContract] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

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
            contractAddress = '0xEe2d1f6D5C8d71e8c97CAA4A80fF9eD87dbB9C34';
            marketplaceAddress = '0xc7095B03A1c6b50B4f8B2E6D8c87CBddD188640A';
            auctionAddress = '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82';
          } else if (networkId === 14) {
            contractAddress = '0x8d1A663F84c5a7cf0c0458848089783d0a0A3b6A';
            marketplaceAddress = '0x73710334E4E5CA4482F5526faBEa45bce503BD98';
          } else if (networkId === 5) {
            contractAddress = '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0';
            marketplaceAddress = '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82';
          } else if (networkId === 31337) {
            contractAddress = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';
            marketplaceAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
            auctionAddress = '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82';
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
            AuctionContract.abi,
            auctionAddress
          );
          setContract(contractInstance);
          setMarketplaceContract(marketplaceInstance);
          setAuctionContract(auctionInstance);
          setInitialized(true);
        } catch (error) {
          console.error('Failed to connect to MetaMask:', error);
        }

        const handleNetworkChange = () => {
          setInitialized(false);
          initializeWeb3();
        };

        provider.on('chainChanged', handleNetworkChange);
      } else {
        console.error('Please install MetaMask!');
      }
    };

    initializeWeb3()
      .then(() => setLoading(false))
      .catch((error) => {
        console.error('Failed to initialize Web3:', error);
        setLoading(false);
      });
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
    <Web3Context.Provider
      value={{
        web3,
        contract,
        marketplaceContract,
        auctionContract,
        disconnect: handleConnectDisconnect
      }}
    >
      {loading ? (
        <div>Loading...</div>
      ) : (
        children
      )}
    </Web3Context.Provider>
  );
};

export default Web3Provider;
