import React, { Component } from 'react';
import Web3 from 'web3';
import { IERC721_ABI } from '../../../abi/Auction.js'; // Assuming the ABI is correctly imported from the path
import './Auction.css';

const CONTRACT_ADDRESS = '0x0165878A594ca255338adfa4d48449f69242Eb8F';

class Auction extends Component {
  async componentDidMount() {
    // Load web3
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

    // Load blockchain data
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    // Create JavaScript version of the contract
    const auction = new web3.eth.Contract(IERC721_ABI, CONTRACT_ADDRESS);
    this.setState({ auction });
  }

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      auction: null,
      nftAddress: '',
      nftId: '',
      startPrice: '',
      reservePrice: '',
      buyNowPrice: '',
      bidIncrement: '',
      auctionDuration: '',
      auctionIndex: '',
      bidAmount: '',
      auctionIndexEnd: '',
      royaltyFee: '', // New field for royalty fee
      royaltyRecipient: '', // New field for royalty recipient
    };
  }

  getERC721Contract = async (nftAddress) => {
    const web3 = window.web3;
    const erc721Contract = new web3.eth.Contract(IERC721_ABI, nftAddress);
    return erc721Contract;
  };

  approveTransfer = async (nftContract, nftId) => {
    const { account } = this.state;
    await nftContract.methods.setApprovalForAll(CONTRACT_ADDRESS, nftId).send({ from: account });
  };

  createAuction = async (event) => {
    event.preventDefault();
    const {
      account,
      auction,
      nftAddress,
      nftId,
      startPrice,
      reservePrice,
      buyNowPrice,
      bidIncrement,
      auctionDuration,
      royaltyFee,
      royaltyRecipient,
    } = this.state;

    const nftContract = await this.getERC721Contract(nftAddress);

    // Approve the transfer
    await this.approveTransfer(nftContract, nftId);

    // Create the auction
    await auction.methods
      .createAuction(
        nftContract.address,
        [nftId],
        startPrice,
        reservePrice,
        buyNowPrice,
        bidIncrement,
        auctionDuration,
        royaltyFee,
        royaltyRecipient
      )
      .send({ from: account });
  };

  bid = async (event) => {
    event.preventDefault();
    const { account, auction, auctionIndex, bidAmount } = this.state;
    await auction.methods.bid(auctionIndex).send({ from: account, value: bidAmount });
  };

  endAuction = async (event) => {
    event.preventDefault();
    const { account, auction, auctionIndexEnd } = this.state;
    await auction.methods.endAuction(auctionIndexEnd).send({ from: account });
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };
  
  render() {
    return (
      <div className="auction-container">
        <h1 className="title">OpenAuction</h1>
        <div className="section">
          <h2 className="section-title">Create Auction</h2>
          <form className="form" onSubmit={this.createAuction}>
            <label className="label">
              NFT Address:
              <input
                className="input"
                type="text"
                name="nftAddress"
                value={this.state.nftAddress}
                onChange={this.handleChange}
              />
            </label>
            <label className="label">
              NFT ID:
              <input
                className="input"
                type="text"
                name="nftId"
                value={this.state.nftId}
                onChange={this.handleChange}
              />
            </label>
            <label className="label">
              Start Price:
              <input
                className="input"
                type="text"
                name="startPrice"
                value={this.state.startPrice}
                onChange={this.handleChange}
              />
            </label>
            <label className="label">
              Reserve Price:
              <input
                className="input"
                type="text"
                name="reservePrice"
                value={this.state.reservePrice}
                onChange={this.handleChange}
              />
            </label>
            <label className="label">
              Buy Now Price:
              <input
                className="input"
                type="text"
                name="buyNowPrice"
                value={this.state.buyNowPrice}
                onChange={this.handleChange}
              />
            </label>
            <label className="label">
              Bid Increment:
              <input
                className="input"
                type="text"
                name="bidIncrement"
                value={this.state.bidIncrement}
                onChange={this.handleChange}
              />
            </label>
            <label className="label">
              Auction Duration:
              <input
                className="input"
                type="text"
                name="auctionDuration"
                value={this.state.auctionDuration}
                onChange={this.handleChange}
              />
            </label>
            <label className="label">
              Royalty Fee:
              <input
                className="input"
                type="text"
                name="royaltyFee"
                value={this.state.royaltyFee}
                onChange={this.handleChange}
              />
            </label>
            <label className="label">
              Royalty Recipient:
              <input
                className="input"
                type="text"
                name="royaltyRecipient"
                value={this.state.royaltyRecipient}
                onChange={this.handleChange}
              />
            </label>
            <button className="button" type="submit">
              Create Auction
            </button>
          </form>
        </div>
        <div className="section">
          <h2 className="section-title">Place Bid</h2>
          <form className="form" onSubmit={this.bid}>
            <label className="label">
              Auction Index:
              <input
                className="input"
                type="text"
                name="auctionIndex"
                value={this.state.auctionIndex}
                onChange={this.handleChange}
              />
            </label>
            <label className="label">
              Bid Amount:
              <input
                className="input"
                type="text"
                name="bidAmount"
                value={this.state.bidAmount}
                onChange={this.handleChange}
              />
            </label>
            <button className="button" type="submit">
              Bid
            </button>
          </form>
        </div>
        <div className="section">
          <h2 className="section-title">End Auction</h2>
          <form className="form" onSubmit={this.endAuction}>
            <label className="label">
              Auction Index:
              <input
                className="input"
                type="text"
                name="auctionIndexEnd"
                value={this.state.auctionIndexEnd}
                onChange={this.handleChange}
              />
            </label>
            <button className="button" type="submit">
              End Auction
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default Auction;
