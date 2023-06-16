import React, { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../../../utils/Web3Provider';
import './MarketListings.css';
import Loading from '../../Loading/Loading';


const ERC721_ABI = [
  {
    constant: true,
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: '_baseTokenURI',
    outputs: [{ name: '', type: 'string' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
];

const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  // add more gateways if you want
];

async function fetchImageFromIpfs(url) {
  // Replace the Pinata gateway URL with the ipfs.io gateway
  url = url.replace('https://gateway.pinata.cloud/ipfs/', 'https://ipfs.io/ipfs/');

  try {
    const response = await fetch(url);
    if (response.ok) {
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
  } catch (error) {
    console.error(`Error fetching from gateway ${url}:`, error);
  }

  throw new Error('All IPFS gateways failed');
}

const MarketListings = () => {
  const { web3, contract, marketplaceContract } = useContext(Web3Context);
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [failedImages, setFailedImages] = useState([]);
  const [account, setAccount] = useState(null); // Add a state for the account
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);


  const buyToken = async (contractAddress, tokenId, price) => {
    try {
      // Call the buyToken function on the marketplaceContract
      await marketplaceContract.methods.buyToken(contractAddress, tokenId).send({ value: price, from: account });
      setPurchaseSuccess(true); // Set purchase success flag to display success message
      // Perform any additional actions after a successful purchase
    } catch (error) {
      console.error('Error buying token:', error);
    }
  };
  // Load the current account when the component mounts
  useEffect(() => {
    const loadAccount = async () => {
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    };

    if (web3) {
      loadAccount();
    }
  }, [web3]);

  useEffect(() => {
    const fetchTokensForSale = async () => {
      try {
        if (marketplaceContract) {
          const tokens = await marketplaceContract.methods.getAllTokensForSale().call();

          const tokensData = await Promise.all(
            tokens.map(async (token) => {
              const tokenContract = new web3.eth.Contract(ERC721_ABI, token.contractAddress);

              let tokenUri;
              if (tokenContract.methods.tokenURI) {
                tokenUri = await tokenContract.methods.tokenURI(token.tokenId).call();
              } else if (tokenContract.methods._baseURI) {
                const baseUri = await tokenContract.methods._baseURI().call();
                tokenUri = `${baseUri}${token.tokenId}`;
              } else {
                return null;
              }

              let metadataUri;
              if (tokenUri.startsWith('https://')) {
                metadataUri = tokenUri;
              } else if (tokenUri.startsWith('ipfs://')) {
                metadataUri = `https://ipfs.io/ipfs/${tokenUri.replace('ipfs://', '')}`;
              } else {
                return null;
              }

              let metadata;

              try {
                const response = await fetch(metadataUri);
                metadata = await response.json();

                if (!metadata.image) {
                  return null;
                }
              } catch (error) {
                console.error(`Error fetching metadata for token ID ${token.tokenId}:`, error);
                return null;
              }

              const isVideo = metadata.image.endsWith('.mp4');

              let imageUrl;
              if (isVideo) {
                imageUrl = metadata.image.startsWith('https://')
                  ? metadata.image
                  : `https://ipfs.io/ipfs/${metadata.image.replace('ipfs://', '')}`;
              } else if (metadata.image.startsWith('ipfs://')) {
                const ipfsHash = metadata.image.replace('ipfs://', '');
                try {
                  imageUrl = await fetchImageFromIpfs(`https://ipfs.io/ipfs/${ipfsHash}`);
                } catch (error) {
                  console.error('All IPFS gateways failed for token ID ' + token.tokenId, error);
                  setFailedImages((failedImages) => [...failedImages, token.tokenId]);
                  return null;
                }
              } else if (metadata.image.startsWith('https://')) {
                try {
                  imageUrl = await fetchImageFromIpfs(metadata.image);
                } catch (error) {
                  console.error('Failed to fetch image for token ID ' + token.tokenId, error);
                  return null;
                }
              } else {
                imageUrl = metadata.image;
              }


              const { contractAddress, tokenId, price, seller } = token;
              const royalty = await contract.methods.royaltyInfo(tokenId, price).call(); // Fetch royalty info from the smart contract
              const royaltyReceiver = royalty[0];
              const royaltyAmount = royalty[1]

              return {
                contractAddress,
                tokenId,
                price,
                seller,
                imageUrl,
                metadata,
                isVideo,
                royaltyReceiver,
                royaltyAmount,
              };
            })
          );

          setTokens(tokensData);
        }
      } catch (error) {
        console.error('Error fetching tokens for sale:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokensForSale();
  }, [web3, contract, marketplaceContract]);

 
  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="marketListings">
      {tokens.map((token, index) => (
        <div key={index} className="marketListings__token">
          {failedImages.includes(token.tokenId) ? (
            <p>Failed to load image for this token</p>
          ) : token.isVideo ? (
            <video className="marketListings__tokenImage" src={token.imageUrl} alt={`Token ${token.tokenId}`} controls />
          ) : (
            <img className="marketListings__tokenImage" src={token.imageUrl} alt={`Token ${token.tokenId}`} />
          )}
          <p className="marketListings__tokenInfo">Name: {token.metadata.name}</p>
          <p className="marketListings__tokenInfo">Description: {token.metadata.description}</p>
          <p className="marketListings__tokenInfo">Contract Address: {token.contractAddress}</p>
          <p className="marketListings__tokenInfo">Token ID: {token.tokenId}</p>
          <p className="marketListings__tokenInfo">Price: {parseFloat(web3.utils.fromWei(token.price, 'ether')).toFixed(2)} ETH</p>
          <p className="marketListings__tokenInfo">Royalty: {web3.utils.fromWei(token.royaltyAmount, 'ether')} ETH</p>
          <p className="marketListings__tokenInfo">Seller: {token.seller}</p>
          <button onClick={() => buyToken(token.contractAddress, token.tokenId, token.price)} className="buyButton">
            Buy
          </button>
        </div>
      ))}
      {purchaseSuccess && <p className="successMessage">Purchase successful!</p>}
    </div>
    
  );
};

export default MarketListings;