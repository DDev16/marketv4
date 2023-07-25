

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
            contractAddress = '0xbdEd0D2bf404bdcBa897a74E6657f1f12e5C6fb6';
             marketplaceAddress = '0x2910E325cf29dd912E3476B61ef12F49cb931096';
             auctionAddress = '0xB35D3C9b9f2Fd72FAAb282E8Dd56da31FAA30E3d';
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







////windows.etheruem wasnt working in mobile i think, i switched to metamask detect provider


// import React, { useState, useEffect, createContext } from 'react';
// import Web3 from 'web3';
// import MyNFT from '../abi/MyNFT.js'; 
// import Marketplace from '../abi/Marketplace.js';

// export const Web3Context = createContext();

// const Web3Provider = ({ children }) => {
//   const [web3, setWeb3] = useState(null);
//   const [contract, setContract] = useState(null);
//   const [marketplaceContract, setMarketplaceContract] = useState(null);
//   const [initialized, setInitialized] = useState(false);
//   const [connected, setConnected] = useState(false);

//   useEffect(() => {
//     const initializeWeb3 = async () => {
//       if (window.ethereum) {
//         try {
//           // Request account access
//           await window.ethereum.request({ method: 'eth_requestAccounts' });
//           setConnected(true);

//           const web3Instance = new Web3(window.ethereum);
//           setWeb3(web3Instance);
          
//           const networkId = await web3Instance.eth.net.getId();
//           let contractAddress = '';
//           let marketplaceAddress = '';

//           if (networkId === 19) {
//             // Songbird network
//             contractAddress = '0xEe2d1f6D5C8d71e8c97CAA4A80fF9eD87dbB9C34';
//             marketplaceAddress = '0xc7095B03A1c6b50B4f8B2E6D8c87CBddD188640A';
//           } else if (networkId === 14) {
//             // Flare network
//             contractAddress = '0x8d1A663F84c5a7cf0c0458848089783d0a0A3b6A';
//             marketplaceAddress = '0x73710334E4E5CA4482F5526faBEa45bce503BD98';
//           } else if (networkId === 5) {
//             // Goerli Test network
//             contractAddress = '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0';
//             marketplaceAddress = '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82';
//           }
          
//           else if (networkId === 31337) {
//             // Hardhat network
//             contractAddress = '0xbdEd0D2bf404bdcBa897a74E6657f1f12e5C6fb6';
//             marketplaceAddress = '0x51A1c8956c038699423ab7A0726d7311c81f6F8f';
//           } 
          

//           const contractInstance = new web3Instance.eth.Contract(
//             MyNFT.abi,
//             contractAddress
//           );
//           const marketplaceInstance = new web3Instance.eth.Contract(
//             Marketplace.abi,
//             marketplaceAddress
//           );
//           setContract(contractInstance);
//           setMarketplaceContract(marketplaceInstance);
//           setInitialized(true);
//         } catch (error) {
//           window.alert('Failed to connect to MetaMask');
//         }

//         const handleNetworkChange = () => {
//           setInitialized(false);  // Will cause the useEffect hook to re-run and re-initialize everything
//           initializeWeb3();
//         };
        

//         window.ethereum.on('chainChanged', handleNetworkChange);
//       } else {
//         window.alert('You need to install MetaMask!');
//       }
//     };

//     initializeWeb3();
//   }, [initialized]);

//   const handleConnectDisconnect = async () => {
//     if (window.ethereum) {
//       if (connected) {
//         window.ethereum.removeAllListeners('chainChanged');
//         setContract(null);
//         setMarketplaceContract(null);
//         setConnected(false);
//       } else {
//         await window.ethereum.request({ method: 'eth_requestAccounts' });
//         setConnected(true);
//       }
//     }
//   };

//   return (
//     <Web3Context.Provider value={{ web3, contract, marketplaceContract, disconnect: handleConnectDisconnect }}>
//       {children}
//     </Web3Context.Provider>
//   );
// };

// export default Web3Provider;

