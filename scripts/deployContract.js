// deployContract.js
const { ethers } = require('ethers');
const fs = require('fs');

async function main() {
    let provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
    let signer = provider.getSigner();

    const artifact = require('./artifacts/contracts/MyToken.sol/MyToken.json');
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);

    let contract = await factory.deploy();
    console.log("Contract deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
