import React, { useState, useContext, useEffect } from 'react';
import { Web3Context } from '../../../utils/Web3Provider';
import '../../../components/Marketplace/Collection/ListAllTokens.css';
import Swal from 'sweetalert2';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import { styled } from '@mui/system';
import ERC721ABI from '../../../abi/ERC721.js';

const CustomTypography = styled(Typography)({
  color: 'black',
  backgroundColor: 'white',
  padding: '10px',
});

const CustomButton = styled('button')({
  backgroundColor: '#3f51b5',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '10px',
  '&:disabled': {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
});

const StyledImage = styled('img')`
  width: 25%;
  height: 300px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
  }
`;

const ListAll = () => {
  const { web3, marketplaceContract } = useContext(Web3Context);
  const [collectionDetails, setCollectionDetails] = useState({
    collectionId: '',
    price: '',
  });
  const [tokenOwner, setTokenOwner] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTokenOwner = async () => {
      if(marketplaceContract) {
        const owner = await marketplaceContract.methods.owner().call();
        setTokenOwner(owner);
      }
    };
    fetchTokenOwner();

    if (collectionDetails.collectionId !== '') {
      setApprovalForAllTokens();
    }
  }, [marketplaceContract, collectionDetails.collectionId]);

  const setApprovalForAllTokens = async () => {
    if (marketplaceContract && collectionDetails.collectionId) {
      const accounts = await web3.eth.getAccounts();
      const owner = accounts[0];

      const tokens = await marketplaceContract.methods.getCollectionTokens(collectionDetails.collectionId).call();
      console.log('Tokens: ', tokens);
            
      for(let i = 0; i < tokens.length; i++) {
        const tokenContract = new web3.eth.Contract(ERC721ABI, tokens[i][0]);
        
        const isApproved = await tokenContract.methods.isApprovedForAll(owner, marketplaceContract._address).call();
        
        if (!isApproved) {
          await tokenContract.methods.setApprovalForAll(marketplaceContract._address, true).send({ from: owner });
        }
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      Swal.fire({
        title: 'Processing',
        html: 'Please wait...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading()
        },
      });

      setLoading(true);
      const accounts = await web3.eth.getAccounts();

      if (accounts[0] !== tokenOwner) {
        throw new Error('You are not the owner of these tokens.');
      }

      if (!collectionDetails.collectionId) {
        throw new Error('Collection ID must be provided');
      }

      if (!collectionDetails.price) {
        throw new Error('Price must be provided');
      }
    
      const priceInWei = web3.utils.toWei(collectionDetails.price, 'ether');
    
      await marketplaceContract.methods
        .listCollectionForSale(collectionDetails.collectionId, priceInWei)
        .send({ from: accounts[0] });

      await setApprovalForAllTokens();

      setCollectionDetails({ collectionId: '', price: '' });
      Swal.close();
      Swal.fire('Success!', 'Tokens listed successfully!', 'success');
    } catch (err) {
      Swal.close();
      Swal.fire('Error!', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (event) => {
    setCollectionDetails({
      ...collectionDetails,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <div className="bulk-add-to-collection">
       <h2>List All Tokens For Sale In a Collection</h2>
    <Box sx={{ width: '100%', padding: '20px', backgroundColor: '#f5f5f5' }} className="ListAllTokens">
      
           
      <StyledImage src="https://cdn-icons-png.flaticon.com/128/4843/4843057.png" alt="A psychedelic image" />

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
        >
          <CustomTypography>
            This form allows you to list all tokens in a collection for sale. Click for more info.
          </CustomTypography>
        </AccordionSummary>
        <AccordionDetails>
          <p>
            Please take note of the following:
          </p>

          <ul>
          <li>
             Before using this function you must have created collection, minted NFTs,and added those nfts to the specifed collection.
            </li>
            <li>
              You will need to enter the Collection ID and the Price (in Native Token). Make sure you own all the tokens in the specified collection.
            </li>
            <li>
              The specified price will apply uniformly to all tokens within the collection.
            </li>
            <li>
              Ideally, this action should be performed once when you first create a collection and are still the sole owner of all the NFTs within.
            </li>
            <li>
              Attempting to list all tokens for a second time after some have been sold will result in an error, since you will no longer be the owner of all tokens in the collection.
            </li>
          </ul>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="collectionId"
              placeholder="Enter Collection ID here"
              onChange={handleChange}
              value={collectionDetails.collectionId}
              required
            />
            <input
              type="text"
              name="price"
              placeholder="Enter Price here"
              onChange={handleChange}
              value={collectionDetails.price}
              required
            />
            <CustomButton type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'List All Tokens for Sale'}
            </CustomButton>
          </form>
        </AccordionDetails>
      </Accordion>
    </Box>
    </div>
  );
};

export default ListAll;
