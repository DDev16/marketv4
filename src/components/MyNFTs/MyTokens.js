import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Web3Context } from '../../utils/Web3Provider';
import '../../components/MyNFTs/MyToken.css';
import brand from '../../assets/logo.png';



const MyTokens = () => {
  const { web3, contract, marketplaceContract } = useContext(Web3Context);
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef();
  const [tokenPrices, setTokenPrices] = useState({});

  const approveAllTokens = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      
      // Approve all tokens for marketplace contract
      await contract.methods.setApprovalForAll(marketplaceContract._address, true)
        .send({ from: account });
      
      alert('All tokens approved for marketplace');
    } catch (error) {
      console.error('An error occurred while approving all tokens:', error);
    }
  };
  

  const handleListToken = async (contractAddress, tokenId, priceInWei) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      const listingFee = web3.utils.toWei('0.01', 'ether');  // Convert 0.01 Ether to wei
  
      
    // Approve all tokens for marketplace contract
    await approveAllTokens();


      // Call listToken method
      await marketplaceContract.methods
        .listToken(contractAddress, tokenId, priceInWei)
        .send({ from: account, value: listingFee });
  
      alert('Token listed successfully');
  
      // Clear the price input
      setTokenPrices({ ...tokenPrices, [tokenId]: '' });
  
      // Refetch tokens
      fetchTokens();
    } catch (error) {
      console.error('An error occurred while listing the token:', error);
    }
  };
  
  

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };
  const isImageFile = (url) => {
    const extension = url.split('.').pop().toLowerCase();
    return extension !== 'mp4';
  };
  
  const fetchTokens = useCallback(async () => {
    setIsLoading(true); // Set loading state to true

    if (web3 && contract) {
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
        
      const tokenIds = await contract.methods.tokensOfOwner(account).call();
      const tokensData = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const tokenInfo = await contract.methods
            .getTokenInfo(tokenId)
            .call({ from: account });
      
          const metadataUri = tokenInfo.uri.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/');
          const response = await fetch(metadataUri);
          const metadata = await response.json();
      
          if (!metadata.image) {
            console.error(`Metadata image does not exist for token ID ${tokenId}`);
            return null;
          }
      
          const imageUrl = `https://cloudflare-ipfs.com/ipfs/${metadata.image.replace('ipfs://', '')}`;
          const { name, description } = metadata;
      
          return { id: tokenId, imageUrl, name, description, contractAddress: contract.options.address, ...tokenInfo };
        })
      );
      
      setTokens(tokensData.filter(token => token !== null));
      setIsLoading(false); // Set loading state to false after tokens are fetched
    }
  }, [web3, contract]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  return (
    <div className="my-tokens-container">
      <h2 className="tokens-heading">My Tokens</h2>
      <button
  className={`refresh-button ${isLoading ? 'refresh-button-disabled' : ''}`}
  onClick={fetchTokens}
  onError={(e) => console.error(e)}
>
  Refresh Tokens
</button>

      <div className="token-list">
        {isLoading ? (
          <div className="loading-container">
            <img src={brand} alt="Logo" style={{ ...styles.logo, ...styles.spinAnimation }} />
            <p className="loading-text">Loading...</p>
          </div>
        ) : (
          tokens.map((token) => (
            <div key={token.id} className="token-card">
              <p className="token-id">ID: {token.id}</p>
              {isImageFile(token.imageUrl) ? (
                <img src={token.imageUrl} alt={token.name} className="token-image" />
              ) : (
                <video 
                  ref={videoRef}
                  src={token.imageUrl} 
                  alt={token.name} 
                  className="token-video" 
                  onClick={handleVideoClick} 
                  controls
                />
              )}
              <div className="token-info">
                <p className="token-name">{token.name}</p>
                <p className="token-description">{token.description}</p>
                <p className="contract-address"> Contract Address: {token.contractAddress}</p>
                <input
      type="number"
      placeholder="Enter price in ETH"
      value={tokenPrices[token.id] || ''}
      onChange={(e) =>
        setTokenPrices({ ...tokenPrices, [token.id]: e.target.value })
      }
    />
    <button
      onClick={() =>
        handleListToken(
          token.contractAddress,
          token.id,
          web3.utils.toWei(tokenPrices[token.id] || '0', 'ether')
        )
      }
    >
      List
    </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
  
};

const spinAnimation = {
  animation: 'spin 5s linear infinite',
  transformStyle: 'preserve-3d'
};

const fireAnimation = {
  animation: 'fire 2s linear infinite',
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#282c34',
  },

  logo: {
    width: '400px',
    marginBottom: '16px',
  },
  heading: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '16px',
    textAlign: 'center',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
  },
  description: {
    fontSize: '24px',
    marginBottom: '32px',
    textAlign: 'center',
    lineHeight: '1.5',
  },
  descriptionText: {
    fontSize: '60px',
    marginBottom: '32px',
    textAlign: 'center',
    lineHeight: '1.5',
  },
  popText: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#61dafb',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
    animation: 'popText 0.5s infinite alternate',
  },
  button: {
    padding: '0',
    border: 'none',
    backgroundColor: 'transparent',
  },
  buttonLink: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#61dafb',
    color: '#282c34',
    fontSize: '18px',
    fontWeight: 'bold',
    textDecoration: 'none',
    borderRadius: '8px',
    transition: 'transform 0.3s ease-in-out',
  },
  popButton: {
    transform: 'scale(1.1)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  },
  spinAnimation,
  fireAnimation,

};


export default MyTokens;
