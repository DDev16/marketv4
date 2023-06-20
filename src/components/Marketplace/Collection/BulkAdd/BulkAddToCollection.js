import React, { useState, useContext } from 'react';
import { Web3Context } from '../../../../utils/Web3Provider.js';
import './BulkAddToCollection.css';

const BulkAddToCollection = () => {
    const { web3, marketplaceContract } = useContext(Web3Context);
    const [collectionId, setCollectionId] = useState('');
    const [tokens, setTokens] = useState([{ contractAddress: '', tokenId: '' }]);
    const [isLoading, setIsLoading] = useState(false);

    const addTokenField = () => {
        setTokens([...tokens, { contractAddress: '', tokenId: '' }]);
    };

    const removeTokenField = (index) => {
        const newTokens = [...tokens];
        newTokens.splice(index, 1);
        setTokens(newTokens);
    };

    const handleTokenChange = (index, name, value) => {
        const newTokens = [...tokens];
        newTokens[index][name] = value;
        setTokens(newTokens);
    };

    const bulkAddToCollection = async () => {
        try {
            setIsLoading(true);
            const accounts = await web3.eth.getAccounts();
            const contractAddresses = tokens.map(token => token.contractAddress);
            const tokenIds = tokens.map(token => Number(token.tokenId));
            
            await marketplaceContract.methods.bulkAddToCollection(
                collectionId,
                contractAddresses,
                tokenIds
            ).send({ from: accounts[0] });

            alert("Tokens successfully added to the collection!");
            setTokens([{ contractAddress: '', tokenId: '' }]);
            setCollectionId('');
        } catch (error) {
            console.error("An error occurred while adding the tokens to the collection:", error);
            alert("There was an error while adding the tokens to the collection. Please check console for more details.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bulk-add-to-collection">
            <h2>Bulk Add To Collection</h2>
            <label>Collection ID:</label>
            <input type="text" value={collectionId} onChange={(e) => setCollectionId(e.target.value)} />

            {tokens.map((token, index) => (
                <div key={index}>
                    <label>Contract Address:</label>
                    <input type="text" value={token.contractAddress} onChange={(e) => handleTokenChange(index, 'contractAddress', e.target.value)} />
                    <label>Token ID:</label>
                    <input type="text" value={token.tokenId} onChange={(e) => handleTokenChange(index, 'tokenId', e.target.value)} />
                    <button className="remove-token" onClick={() => removeTokenField(index)}>Remove</button>
                </div>
            ))}
            <button onClick={addTokenField}>Add More Token</button>

            <button disabled={isLoading} onClick={bulkAddToCollection}>
                {isLoading ? "Processing..." : "Add To Collection"}
            </button>
        </div>
    );
};

export default BulkAddToCollection;
