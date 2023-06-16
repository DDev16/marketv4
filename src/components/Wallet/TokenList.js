import React, { useEffect, useState, useCallback} from 'react';
import axios from 'axios';
import TokenCard from './TokenCard.js';
import './NFTCard.css';
import Loading from '../Loading/Loading.js';
import Web3 from 'web3';

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
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
];


const NFTList = () => {
  // Component state variables
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [selectedToken, setSelectedToken] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amountToSend, setAmountToSend] = useState('');
  const [tokenURI, setTokenURI] = useState('');
  const [imageData, setImageData] = useState(null);

  const web3 = new Web3(window.ethereum);


  const fetchTokenIds = useCallback(async (contractAddress, ownerAddress) => {
    const nftContract = new Web3.eth.Contract(ERC721_ABI, contractAddress);
    const balanceOf = await nftContract.methods.balanceOf(ownerAddress).call();
    const tokenIds = [];
    for (let i = 0; i < balanceOf; i++) {
      const tokenId = await nftContract.methods.tokenOfOwnerByIndex(ownerAddress, i).call();
      console.log('Fetched Token ID:', tokenId);
      tokenIds.push(tokenId);
    }
    return tokenIds;
}, []);

  useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      try {
        let accounts;
        try {
          accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
          if (error.code === 4001) {
            setError('User rejected account access');
            setLoading(false);
            return;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
          accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        }
        const address = accounts[0];
        setUserAddress(address);

        let apiUrl;
        const chainId = Number.parseInt(window.ethereum.chainId, 16);  // Convert to Number
        if (chainId === 14) {
          // Flare Chain
          apiUrl = 'https://flare-explorer.flare.network/api';
        } else if (chainId === 19) {
          // Songbird
          apiUrl = 'https://songbird-explorer.flare.network/api';
        } else if (chainId === 31337) {  // Compare with 31337 directly
          // Hardhat
          apiUrl = 'http://localhost:8545'; 
        } else {
          setError('Unsupported network');
          setLoading(false);
          return;
        }

        const result = await axios.get(`${apiUrl}?module=account&action=tokenlist&address=${address}`);
        console.log('API Response:', result.data);
  
        if (result.data.result && Array.isArray(result.data.result)) {
          const nftData = await Promise.all(result.data.result.map(async (nft) => {
            const txHistory = await fetchTokenTransactionHistory(nft.contractAddress, address, apiUrl);
            let tokenIds = [];
            if (nft.type === 'ERC721') {
              tokenIds = await fetchTokenIds(nft.contractAddress, address);
            }
            return { ...nft, txHistory, tokenIds };
          }));
  
          setNfts(nftData);
        } else {
          setError("API didn't return a valid array.");
        }
      } catch (error) {
        setError('Error fetching data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [fetchTokenIds]);

  const fetchTokenTransactionHistory = async (contractAddress, address, apiUrl) => {
    const result = await axios.get(`${apiUrl}?module=account&action=tokentx&contractaddress=${contractAddress}&address=${address}`);
    console.log('Token Transaction History:', result.data);

    return result.data.result || [];
  };

  const handleTokenChange = (event) => {
    setSelectedToken(event.target.value);
  };

  const handleRecipientAddressChange = (event) => {
    setRecipientAddress(event.target.value);
  };

  const handleAmountChange = (event) => {
    setAmountToSend(event.target.value);
  };

  const handleSend = async () => {
    try {
      const selectedNFT = nfts.find((nft) => nft.name === selectedToken);
  
      if (!selectedNFT) {
        setError('Selected token not found.');
        return;
      }
  
      const tokenContractAddress = selectedNFT.contractAddress;
      const recipient = recipientAddress.toLowerCase();
      const accounts = await web3.eth.requestAccounts();
      const senderAddress = accounts[0];
  
      // Handle sending ERC20 tokens
      if (!recipientAddress || !amountToSend) {
        setError('Please provide recipient address and amount');
        return;
      }

      const txData = {
        to: tokenContractAddress,
        from: senderAddress,
        value: '0x0',
        data: `0xa9059cbb000000000000000000000000${recipient.replace('0x', '').toLowerCase()}${parseInt(amountToSend).toString(16).padStart(64, '0')}`,
      };

      const result = await web3.eth.sendTransaction(txData);
      console.log('Transaction Result:', result);
    } catch (error) {
      console.error('Error sending transaction:', error);
    }
  };

  useEffect(() => {
    // Fetch token URI and image data
    const fetchTokenURI = async () => {
      if (selectedToken) {
        const selectedNFT = nfts.find((nft) => nft.name === selectedToken);

        // Make sure the token type is ERC721 before attempting to fetch the tokenURI
        if (selectedNFT.type === 'ERC721') {
          const contract = new web3.eth.Contract(ERC721_ABI, selectedNFT.contractAddress);

          try {
            const tokenId = selectedNFT.tokenId;
            console.log('Selected Token ID:', tokenId);
            const uri = await contract.methods.tokenURI(tokenId).call();
            console.log('Token URI:', uri);
            setTokenURI(uri);

            // Fetch image data from the URI
            const response = await axios.get(uri, { responseType: 'arraybuffer' });
            const imageData = Buffer.from(response.data, 'binary').toString('base64');
            setImageData(imageData);
          } catch (error) {
            console.error('Error fetching token URI:', error);
          }
        }
      }
    };

    fetchTokenURI();
  }, [selectedToken, nfts, web3.eth.Contract]);

  


  if (loading) {
    return <Loading />;
  }
  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (nfts.length === 0) {
    return <div className="no-results">No NFTs found for address: {userAddress}</div>;
  }

  const selectedNFT = nfts.find((nft) => nft.name === selectedToken);

  return (
    <div className="nft-list">
      <select className="token-select" value={selectedToken} onChange={handleTokenChange}>
        <option value="">--Select a token--</option>
        {nfts.map((nft, index) => (
          <option key={index} value={nft.name}>
            {nft.name}
          </option>
        ))}
      </select>
      {selectedToken && selectedNFT.type === 'ERC-20' && (
        <div className="input-group">
          <input
            type="text"
            placeholder="Recipient Address"
            value={recipientAddress}
            onChange={handleRecipientAddressChange}
          />
  
          <input
            className='amount-input'
            type="number"
            placeholder="Amount to Send"
            value={amountToSend}
            onChange={handleAmountChange}
          />
          <button className="send-button" onClick={handleSend}>
            Send
          </button>
        </div>
      )}
      {selectedNFT && (
        <TokenCard nft={selectedNFT} />
      )}
      {tokenURI && (
        <div>
          <div>Token URI: {tokenURI}</div>
          {imageData ? (
            <img src={`data:image/png;base64,${imageData}`} alt="Token" />
          ) : (
            <Loading /> // Display a loading indicator while fetching image data
          )}
        </div>
      )}
  
      {/* Render TokenCard for selected ERC721 token */}
      {selectedNFT && selectedNFT.type === 'ERC721' && (
        <div>
          <TokenCard nft={selectedNFT} imageData={imageData} />
          {selectedNFT.tokenIds && selectedNFT.tokenIds.map((tokenId, idIndex) => (
            <div key={idIndex}>Token ID: {tokenId}</div>
          ))}
        </div>
      )}
    </div>
  );
  
};

export default NFTList;