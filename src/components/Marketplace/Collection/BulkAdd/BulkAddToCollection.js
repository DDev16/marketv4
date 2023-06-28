import React, { useState, useContext } from 'react';
import { Web3Context } from '../../../../utils/Web3Provider.js';
import './BulkAddToCollection.css';
import { Breadcrumb } from 'react-bootstrap';

const BulkAddToCollection = () => {
    const { web3, marketplaceContract } = useContext(Web3Context);
    const [collectionId, setCollectionId] = useState('');
    const [tokenData, setTokenData] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const parseTokenData = () => {
        const tokens = tokenData.split('\n').map(token => {
            const splitToken = token.split(',');
            if (splitToken.length !== 2) {
                console.error("Invalid token format: ", token);
                return null;
            }
            const [contractAddress, tokenId] = splitToken;
            return { contractAddress: contractAddress.trim(), tokenId: tokenId.trim() };
        });
    
        return tokens.filter(Boolean);
    };
    

    const bulkAddToCollection = async () => {
        try {
            setIsLoading(true);
            const accounts = await web3.eth.getAccounts();
            const tokens = parseTokenData();
            const contractAddresses = tokens.map(token => token.contractAddress);
            const tokenIds = tokens.map(token => Number(token.tokenId));

            await marketplaceContract.methods.BulkAddToCollection(
                collectionId,
                contractAddresses,
                tokenIds
            ).send({ from: accounts[0] });

            alert("Tokens successfully added to the collection!");
            setTokenData('');
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
            <input 
                type="text" 
                value={collectionId} 
                onChange={(e) => setCollectionId(e.target.value)} 
                placeholder="Enter the collection ID"
            />

            <label>Bulk Add Tokens:</label>
            <textarea 
                value={tokenData} 
                onChange={(e) => setTokenData(e.target.value)} 
                placeholder="Example:
                0x1234...abcd,1
                0x5678...efgh,2
                0x9abc...def0,3"
            />

            <p>
              <strong>Instructions:</strong>
            </p>

            <ul>
              <li>Input should consist of pairs of Contract Addresses and Token IDs. </li>
              <li>Each pair should be written as <code>ContractAddress,TokenID</code>, with a comma separating the Contract Address and Token ID.</li>
              <li>Each pair should be entered on a new line. Do not put spaces between the pairs, or between the Contract Address and Token ID within a pair.</li>
              <li>If you have multiple pairs to enter, simply place each pair on a new line, like so:</li>
            </ul>

            <pre>
              <code>
                0x1234...abcd,1
                <Breadcrumb></Breadcrumb>
                0x5678...efgh,2
                <Breadcrumb></Breadcrumb>
                0x9abc...def0,3
              </code>
            </pre>

            <p>When you're done entering all pairs, click on the "Add To Collection" button to process them.</p>

            <button disabled={isLoading} onClick={bulkAddToCollection}>
                {isLoading ? "Processing..." : "Add To Collection"}
            </button>
        </div>
    );
};

export default BulkAddToCollection;
