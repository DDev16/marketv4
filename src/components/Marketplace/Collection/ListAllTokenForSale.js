import React, { useState, useContext } from 'react';
import { Web3Context } from '../../../utils/Web3Provider';

const ListAll = () => {
  const { web3, marketplaceContract } = useContext(Web3Context);
  const [collectionId, setCollectionId] = useState('');
  const [price, setPrice] = useState('');

  const listAllTokensForSaleInCollection = async () => {
    try {
      const collectionIdBN = web3.utils.toBN(collectionId);
      const priceBN = web3.utils.toWei(price, 'ether'); 
      const receipt = await marketplaceContract.methods.listAllTokensForSaleInCollection(collectionIdBN, priceBN).send({ from: web3.currentProvider.selectedAddress });
      console.log(receipt);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <label>
        Collection ID:
        <input type="number" value={collectionId} onChange={e => setCollectionId(e.target.value)} />
      </label>
      <label>
        Price:
        <input type="number" value={price} onChange={e => setPrice(e.target.value)} />
      </label>
      <button type="button" onClick={listAllTokensForSaleInCollection}>List All Tokens for Sale</button>
    </div>
  )
}

export default ListAll;
