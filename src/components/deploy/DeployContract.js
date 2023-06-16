import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import MyTokenContract from "../deploy/ERC721Contract/NFT.json";

const Deploy = () => {
const [contractAddresses, setContractAddresses] = useState([]);
const [selectedContractAddress, setSelectedContractAddress] = useState("");
const [walletAddress, setWalletAddress] = useState("");
const [deployed, setDeployed] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [name, setName] = useState("");
const [symbol, setSymbol] = useState("");
const [initBaseURI, setInitBaseURI] = useState("");
const [initNotRevealedURI, setInitNotRevealedURI] = useState("");
const [contractType, setContractType] = useState("ERC721");

useEffect(() => {
// Load contract addresses from local storage on component mount
const storedContractAddresses = localStorage.getItem("contractAddresses");
if (storedContractAddresses) {
setContractAddresses(JSON.parse(storedContractAddresses));
}
}, []);

const handleDeploy = async () => {
try {
setLoading(true);
setError("");

  // Connect to the local Ethereum development network (e.g., Hardhat or Ganache)
  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
  const signer = provider.getSigner();
  const walletAddress = await signer.getAddress();

  const ContractFactory = ethers.ContractFactory.fromSolidity(
    MyTokenContract,
    signer
  );

  let deployedContract;
  if (contractType === "ERC721") {
    deployedContract = await ContractFactory.deploy(name, symbol, initBaseURI, initNotRevealedURI);
  } else if (contractType === "ERC1155") {
    // Handle deployment logic for ERC1155 contract
    // ...
  }

  await deployedContract.deployed();

  const newContractAddress = deployedContract.address;
  const updatedContractAddresses = [...contractAddresses, newContractAddress];
  setContractAddresses(updatedContractAddresses);
  setSelectedContractAddress(newContractAddress); // Set the selected contract address
  setWalletAddress(walletAddress);
  setDeployed(true);

  // Store contract addresses in local storage
  localStorage.setItem("contractAddresses", JSON.stringify(updatedContractAddresses));

  // Retrieve contract details
  const contractName = await deployedContract.name();
  const contractSymbol = await deployedContract.symbol();
  const contractInitBaseURI = await deployedContract.baseURI();
  const contractInitNotRevealedURI = await deployedContract.notRevealedURI();

  setName(contractName);
  setSymbol(contractSymbol);
  setInitBaseURI(contractInitBaseURI);
  setInitNotRevealedURI(contractInitNotRevealedURI);
} catch (err) {
  setError("Failed to deploy the contract.");
  console.error(err);
} finally {
  setLoading(false);
}
};

return (
<div>
<select
value={selectedContractAddress}
onChange={(e) => setSelectedContractAddress(e.target.value)}
>
{contractAddresses.map((address, index) => (
<option key={index} value={address}>
{address}
</option>
))}
</select>
<br />
<input
type="text"
placeholder="Name"
value={name}
onChange={(e) => setName(e.target.value)}
/>
<input
type="text"
placeholder="Symbol"
value={symbol}
onChange={(e) => setSymbol(e.target.value)}
/>
<input
type="text"
placeholder="Initial Base URI"
value={initBaseURI}
onChange={(e) => setInitBaseURI(e.target.value)}
/>
<input
type="text"
placeholder="Initial Not Revealed URI"
value={initNotRevealedURI}
onChange={(e) => setInitNotRevealedURI(e.target.value)}
/>
<br />
<button onClick={handleDeploy} disabled={loading}>
{loading ? "Deploying..." : "Deploy Contract"}
</button>
{deployed && (
<div>
<p>Contract successfully deployed at address: {selectedContractAddress}</p>
<p>Deployed to wallet address: {walletAddress}</p>
<p>Contract Name: {name}</p>
<p>Contract Symbol: {symbol}</p>
<p>Initial Base URI: {initBaseURI}</p>
<p>Initial Not Revealed URI: {initNotRevealedURI}</p>
</div>
)}
{error && <p>{error}</p>}
<br />
<h3>Deployed Contracts:</h3>
{contractAddresses.map((address, index) => (
<p key={index}>{address}</p>
))}
</div>
);
};

export default Deploy;