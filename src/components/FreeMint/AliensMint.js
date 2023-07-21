import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import AliensABI from '../../abi/ERC721.js';

const CONTRACT_ADDRESS = '0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575';

export class AliensMint {
  constructor() {
    this.web3 = null;
    this.account = null;
    this.AliensContract = null;
    this.initialize();
  }

  initialize = async () => {
    const provider = await detectEthereumProvider();

    if (provider) {
      try {
        // Request account access if needed
        await provider.request({ method: 'eth_requestAccounts' });
        // Accounts now exposed
        this.web3 = new Web3(provider);
        this.account = (await this.web3.eth.getAccounts())[0];
        this.AliensContract = new this.web3.eth.Contract(AliensABI, CONTRACT_ADDRESS);
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
    } else {
      console.log('Please install MetaMask!');
    }
  };

  mintAlien = async (mintAmount) => {
    try {
      const gasPrice = await this.web3.eth.getGasPrice();
      const gasEstimate = await this.AliensContract.methods.mint(mintAmount).estimateGas({ from: this.account });

      const result = await this.AliensContract.methods.mint(mintAmount).send({
        from: this.account,
        gas: gasEstimate,
        gasPrice: gasPrice,
      });

      return result;
    } catch (error) {
      console.error("Error executing transaction", error);
      throw error;
    }
  };
}

export default AliensMint;
