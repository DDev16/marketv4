
import Loading from '../Loading/Loading';
import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Web3Context } from '../../utils/Web3Provider';
import '../../components/MyNFTs/MyToken.css';
import { styled } from '@mui/system';
import Swal from 'sweetalert2';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import PaginationItem from '@mui/material/PaginationItem';
import { Link as MaterialUILink } from '@mui/material';



const StyledImage = styled('img')`
  width: 25%;
  height: 350px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
  }
`;

const MyTokens = () => {
  const { web3, contract, marketplaceContract } = useContext(Web3Context);
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef();
  const [tokenPrices, setTokenPrices] = useState({});
  const [tokenStatuses, setTokenStatuses] = useState({});
  const [searchName, setSearchName] = useState('');
  const [searchId, setSearchId] = useState('');
  const [isListedFilter, setIsListedFilter] = useState('none');  // 'none' means no filter, 'true' means listed, 'false' means not listed
  const [currentPage, setCurrentPage] = useState(1);
  const tokensPerPage = 100; // Number of tokens to display per page
 // Define the filteredTokens function before using it
 const filteredTokens = () => {
  return tokens.filter((token) => {
    const matchesName = searchName === '' || token.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesId = searchId === '' || token.id.toString() === searchId;
    const matchesListedFilter = 
      isListedFilter === 'none' 
        ? true 
        : (isListedFilter === 'true' ? tokenStatuses[token.id] : !tokenStatuses[token.id]);

    return matchesName && matchesId && matchesListedFilter;
  });
};

const indexOfLastToken = currentPage * tokensPerPage;
const indexOfFirstToken = indexOfLastToken - tokensPerPage;
const currentTokens = filteredTokens().slice(indexOfFirstToken, indexOfLastToken);

const totalPages = Math.ceil(filteredTokens().length / tokensPerPage);


  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

 
  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };
  const updateTokenStatus = async (contractAddress, tokenId) => {
    try {
      const forSale = await marketplaceContract.methods
        .isTokenForSale(contractAddress, tokenId)
        .call();

      setTokenStatuses(prev => ({ ...prev, [tokenId]: forSale }));
    } catch (error) {
      console.error('An error occurred while checking if the token is for sale:', error);
    }
  };

  


  const isAllTokensApproved = async () => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
  
    const isApproved = await contract.methods.isApprovedForAll(account, marketplaceContract._address).call();
    return isApproved;
  };
  
  const approveAllTokens = async () => {
    try {
      const allTokensApproved = await isAllTokensApproved();
  
      if (!allTokensApproved) {
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        
        // Approve all tokens for marketplace contract
        await contract.methods.setApprovalForAll(marketplaceContract._address, true)
          .send({ from: account });
        
        Swal.fire('Success', 'All tokens approved for marketplace', 'success');
      } 
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
  
      Swal.fire('Success', 'Token listed successfully', 'success');
  
      // Clear the price input
      setTokenPrices({ ...tokenPrices, [tokenId]: '' });
  
      // Refetch tokens
      fetchTokens();
    } catch (error) {
      console.error('An error occurred while listing the token:', error);
    }
  };

  const cancelListing = async (contractAddress, tokenId) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      await marketplaceContract.methods
        .cancelListing(contractAddress, tokenId)
        .send({ from: account });

      Swal.fire('Success', 'Listing cancelled successfully', 'success');

      // Update token status
      updateTokenStatus(contractAddress, tokenId);
    } catch (error) {
      console.error('An error occurred while cancelling the token listing:', error);
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
      
          const metadataUri = tokenInfo.uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
          const response = await fetch(metadataUri);
          const metadata = await response.json();
      
          if (!metadata.image) {
            console.error(`Metadata image does not exist for token ID ${tokenId}`);
            return null;
          }
      
          const imageUrl = `https://ipfs.io/ipfs/${metadata.image.replace('ipfs://', '')}`;
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

  useEffect(() => {
    if (tokens.length > 0) {
      tokens.forEach(token => updateTokenStatus(token.contractAddress, token.id));
    }
  }, [tokens]);


  return (
<div className="pageBackground">
     <div className="bulk-add-to-collection">
            <h2><Typography fontSize="28px">Welcome to your NFT Dashboard</Typography></h2>
            <StyledImage src="https://cdn-icons-png.flaticon.com/128/6564/6564757.png" alt="A psychedelic image" />

      <header className="header">
       
        <Typography variant="body1" color="white">
          Here is where your minted NFTs are stored, you can manage, list, and interact with your NFTs. Use the accordion below to see more information.
        </Typography>
      </header>

      <Accordion defaultExpanded={false} >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
 <Grid container justifyContent="center" >
      <Typography variant="h5">Click Here to view NFTs </Typography>
    </Grid>
         </AccordionSummary>
      <AccordionDetails>
        <Box className="my-tokens-container">
          <Typography variant="h2" className="tokens-heading">Here are your tokens:</Typography>
          <Typography variant="body1" className="tokens-intro">
            You can refresh your tokens, search them by name or token ID, list them for sale, or cancel their listing.
          </Typography>
          <button
            onClick={fetchTokens}
            onError={(e) => console.error(e)}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh Tokens'}
          </button>
          <input
            type="text"
            placeholder="Search by name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="search-bar__input"
          />
          <input
            type="text"
            placeholder="Search by token ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="search-bar__input"
          />
          <select
            value={isListedFilter}
            onChange={(e) => setIsListedFilter(e.target.value)}
            className="search-bar__select"
          >
            <option value="none">Show all</option>
            <option value="true">Show only listed tokens</option>
            <option value="false">Show only unlisted tokens</option>
          </select>
          <Stack spacing={2} direction="row" justifyContent="center" alignItems="center" className="pagination-container">
        <IconButton
    className="pagination-icon-button"
    onClick={handleFirstPage}
    disabled={currentPage === 1}
  >
    <FirstPageIcon />
  </IconButton>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handleChangePage}
          shape="rounded"
          boundaryCount={2} // Show "First" and "Last" buttons
          renderItem={(item) => (
            <PaginationItem
              component={MaterialUILink}
              to="#"
              {...item}
            />
          )}
        />
        <IconButton className="pagination-icon-button" onClick={handleLastPage} disabled={currentPage === totalPages} >
          <LastPageIcon />
        </IconButton>
      </Stack>

          <div className="token-list">
            {isLoading ? (
              <Loading />
            ) : (
              currentTokens.map((token) => {
                const tokenForSale = tokenStatuses[token.id];
                return (
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
                        placeholder="Enter price in Native Token"
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
                      {tokenForSale && (
                        <button
                          onClick={() =>
                            cancelListing(token.contractAddress, token.id)
                          }
                        >
                          Cancel Listing
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Box>
      </AccordionDetails>
    </Accordion>
    </div>
    </div>
  );
            };








export default MyTokens;
