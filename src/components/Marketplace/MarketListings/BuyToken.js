import { useContext } from 'react';
import { Web3Context } from '../../../utils/Web3Provider.js';

const BuyToken = () => {
  const { web3, marketplaceContract } = useContext(Web3Context);

  const buyToken = async (contractAddress, tokenId) => {
    if (web3 && marketplaceContract) {
      const accounts = await web3.eth.getAccounts();
      if (accounts && accounts.length > 0) {
        const listing = await marketplaceContract.methods.listings(contractAddress, tokenId).call();
        if (listing && listing.isActive) {
          const ethPrice = 2; // Change this to the desired token price in ETH
          const valueToSend = web3.utils.toBN(ethPrice * 1e18); // Convert ETH to wei

          await marketplaceContract.methods.buyToken(contractAddress, tokenId)
            .send({ from: accounts[0], value: valueToSend })
            .on('transactionHash', (hash) => {
              console.log(`Transaction hash: ${hash}`);
            })
            .on('receipt', (receipt) => {
              console.log(`Receipt: ${receipt}`);
            })
            .on('error', (error) => {
              console.error(`Error: ${error}`);
            });
        } else {
          console.error("Token is not for sale");
        }
      } else {
        console.error("No accounts detected");
      }
    } else {
      console.error("Web3 or marketplaceContract is not initialized");
    }
  };

  return [buyToken];
};

export default BuyToken;
