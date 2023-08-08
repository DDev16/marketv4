import React, { useState, useEffect, createContext } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import Auction from '../abi/Auction.js'

const myNFTAbi = JSON.parse(process.env.REACT_APP_MY_NFT_ABI);
const MarketplaceAbi = JSON.parse(process.env.REACT_APP_MARKETPLACE_ABI);

export const Web3Context = createContext();

const contractAddresses = {
  19: {
    contract: process.env.REACT_APP_CONTRACT_ADDRESS_19,
    marketplace: process.env.REACT_APP_MARKETPLACE_ADDRESS_19,
  },
  14: {
    contract: process.env.REACT_APP_CONTRACT_ADDRESS_14,
    marketplace: process.env.REACT_APP_MARKETPLACE_ADDRESS_14,
  },
  5: {
    contract: process.env.REACT_APP_CONTRACT_ADDRESS_5,
    marketplace: process.env.REACT_APP_MARKETPLACE_ADDRESS_5,
  },
  31337: {
    contract: process.env.REACT_APP_CONTRACT_ADDRESS_31337,
    marketplace: process.env.REACT_APP_MARKETPLACE_ADDRESS_31337,
    auction: process.env.REACT_APP_AUCTION_ADDRESS_31337,
  },
};

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

          if (networkId in contractAddresses) {
            const { contract: contractAddress, marketplace: marketplaceAddress, auction: auctionAddress } = contractAddresses[networkId];

            const contractInstance = new web3Instance.eth.Contract(
              myNFTAbi,
              contractAddress
            );

            const marketplaceInstance = new web3Instance.eth.Contract(
              MarketplaceAbi,
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
          } else {
            window.alert('Unsupported network');
          }
        } catch (error) {
          window.alert('Failed to connect to MetaMask');
        }

        const handleNetworkChange = () => {
          setInitialized(false);
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
