import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Web3Context } from '../../../utils/Web3Provider.js';
import styles from '../../../components/Marketplace/Collection/CollectionPage.modules.css';

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
  // Add more functions if needed
];

const CollectionPage = () => {
  const { collectionId } = useParams();
  const { web3, marketplaceContract } = useContext(Web3Context);
  const [collection, setCollection] = useState(null);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        if (!web3) {
          console.error('Web3 object is not initialized');
          return;
        }

        const accounts = await web3.eth.getAccounts();
        const ownerAddress = accounts[0];

        const fetchedCollection = await marketplaceContract.methods
          .getSpecificCollection(collectionId)
          .call({ from: ownerAddress });

        if (fetchedCollection) {
          console.log('Fetched Collection:', fetchedCollection);

          const collectionData = {
            name: fetchedCollection.name,
            logoIPFS: fetchedCollection.logoIPFS,
            bannerIPFS: fetchedCollection.bannerIPFS,
            description: fetchedCollection.description,
            contractAddresses: fetchedCollection.contractAddresses,
            tokenIds: fetchedCollection.tokenIds,
          };

          console.log('Collection Data:', collectionData);
          setCollection(collectionData);

          const fetchedCards = await Promise.all(
            fetchedCollection.tokenIds.map(async (tokenId, index) => {
              const contractAddress = fetchedCollection.contractAddresses[index];
              const contract = new web3.eth.Contract(ERC721_ABI, contractAddress);
              const tokenURI = await contract.methods.tokenURI(tokenId).call({ from: ownerAddress });
              const ipfsUrl = tokenURI.replace('ipfs://', '');
              console.log(`Fetching IPFS data from: https://ipfs.io/ipfs/${ipfsUrl}`);
              const cardDetailsResponse = await fetch(`https://ipfs.io/ipfs/${ipfsUrl}`);
              const cardDetails = await cardDetailsResponse.json();
              cardDetails.image = cardDetails.image || cardDetails.imageUrl;

              const { name, description } = cardDetails;
              console.log('Card Details:', cardDetails);
              return {
                tokenId,
                contractAddress,
                tokenURI,
                name,
                description,
                ...cardDetails,
              };
            })
          );

          console.log('Fetched Cards:', fetchedCards);
          setCards(fetchedCards);
        } else {
          console.error('Collection not found');
        }
      } catch (error) {
        console.error('Error fetching collection:', error);
      }
    };

    if (web3 && marketplaceContract) {
      fetchCollection();
    }
  }, [web3, marketplaceContract, collectionId]);

  if (!collection) {
    return <div>Loading...</div>;
  }

  return (
    <div className="collectionPage">
      <h1>{collection.name}</h1>
      
      <div className="collectionlogo">
        <img src={`https://ipfs.io/ipfs/${collection.logoIPFS}`} alt="Logo" />
      </div>
      <div className="banner">
        <img src={`https://ipfs.io/ipfs/${collection.bannerIPFS}`} alt="Banner" />
      </div>
      <p className="description">{collection.description}</p>

      <div className="cardContainer">
        {cards.map((card, index) => (
          <div className="card" key={index}>
            {card.image.toLowerCase().endsWith('.mp4') ? (
              <video controls src={`https://ipfs.io/ipfs/${card.image.replace(/ipfs:\/\//g, '')}`} alt={`NFT Card ${index + 1}`} />
            ) : (
              <img src={`https://ipfs.io/ipfs/${card.image.replace(/ipfs:\/\//g, '')}`} alt={`NFT Card ${index + 1}`} />
            )}

            <p>Token ID: {card.tokenId}</p>
            <p>Name: {card.name}</p>
            <p>Description: {card.description}</p>
            <p>Contract Address: {card.contractAddress}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollectionPage;
