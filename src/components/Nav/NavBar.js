import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiMenu, FiX } from 'react-icons/fi';
import { FaDatabase, FaWallet, FaRegLightbulb, FaGamepad, FaGavel, FaStore, FaPlusCircle, FaExchangeAlt } from 'react-icons/fa';
import { Web3Context } from '../../utils/Web3Provider.js';
import songbirdLogo from '../../assets/songbird-logo.png';
import flareLogo from '../../assets/flarelogo.png';
import '../../components/Nav/nav.css';
import Music from '../../components/Music/MusicPlayer.js'

const NavBar = () => {
  const { web3 } = useContext(Web3Context);
  const [currentNetworkId, setCurrentNetworkId] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [account, setAccount] = useState('');
  const [isNavOpen, setIsNavOpen] = useState(false); // Track whether the mobile menu is open or closed

  const handleNetworkChange = async (e) => {
    const networkId = parseInt(e.target.value, 10);
    if (web3) { // Changed from web3.currentProvider.isMetaMask
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${networkId.toString(16)}` }],
        });
        if (networkId === 19) {
          setSelectedNetwork(songbirdLogo);
        } else if (networkId === 14) {
          setSelectedNetwork(flareLogo);
        } else if (networkId === 5) {
          setSelectedNetwork(null);
        } else if (networkId === 31337) {
          setSelectedNetwork(null);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const toggleNav = () => {
    setIsNavOpen((prevState) => !prevState);
  };

  useEffect(() => {
    const getCurrentNetworkId = async () => {
      if (web3) { // Changed from web3.currentProvider.isMetaMask
        try {
          const networkId = await web3.eth.net.getId();
          setCurrentNetworkId(networkId.toString());
          if (networkId === 19) {
            setSelectedNetwork(songbirdLogo);
          } else if (networkId === 14) {
            setSelectedNetwork(flareLogo);
          } else if (networkId === 5) {
            setSelectedNetwork(null);
          } else if (networkId === 31337) {
            setSelectedNetwork(null);
          }

          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);
        } catch (error) {
          console.error(error);
        }
      }
    };

    getCurrentNetworkId();
  }, [web3, isNavOpen]);

  function shortenAddress(address, frontChars = 6, backChars = 4) {
    if (!address) return '';
    const length = address.length;
    if (length < frontChars + backChars) return address;
    return address.substring(0, frontChars) + '...' + address.substring(length - backChars);
  }

  return (
    <nav className="navbar">
      <div className="logo">
        <img src={require('../../assets/logo.png')} alt="Logo" />
       
        <span className="app-name">Flare Fire</span>
        
      </div>
      <Music />
      <div>
        <select className="network-select" value={currentNetworkId} onChange={handleNetworkChange}>
          <option className="options" value="14">Flare</option>
          <option className="options" value="19">Songbird</option>
          <option className="options" value="5">Goerli</option>
          <option className="options" value="31337">Localhost</option>
        </select>
        {selectedNetwork && <img className="logo-image" src={selectedNetwork} alt="Network logo" />}
      </div>
      <span>{shortenAddress(account)}</span>
      <button className={`menu-button${isNavOpen ? ' open' : ''}`} onClick={toggleNav}>
        {isNavOpen ? <FiX /> : <FiMenu />}
      </button>
      {isNavOpen && (
        <ul className="nav-links">
          <li>
            <Link to="/" onClick={toggleNav}>
              <FiHome className="nav-icon" />
              Home
            </Link>
          </li>
          <li>
            <Link to="/sign-in" onClick={toggleNav}>
              <FaWallet className="nav-icon" />
              Sign-In
            </Link>
          </li>
          <li>
            <Link to="/mint" onClick={toggleNav}>
              <FaPlusCircle className="nav-icon" />
              Mint
            </Link>
          </li>
          <li>
            <Link to="/batch-mint" onClick={toggleNav}>
              <FaPlusCircle className="nav-icon" />
              Batch Mint
            </Link>
          </li>
          <li>
            <Link to="/all-collections" onClick={toggleNav}>
              <FaDatabase className="nav-icon" />
              All Collections
            </Link>
          </li>
          <li>
            <Link to="/marketListings" onClick={toggleNav}>
              <FaStore className="nav-icon" />
              NFTs For Sale
            </Link>
          </li>
          <li>
            <Link to="/create-auction" onClick={toggleNav}>
              <FaGavel className="nav-icon" />
             Create Auction
            </Link>
          </li>
          <li>
            <Link to="/all-auctions" onClick={toggleNav}>
            <FaGavel className="nav-icon" />
             Auction
            </Link>
          </li>
          <li>
            <Link to="/swap-meet" onClick={toggleNav}>
              <FaExchangeAlt className="nav-icon" />
              Swap Meet
            </Link>
          </li>
          <li>
            <Link to="/learning" onClick={toggleNav}>
              <FaRegLightbulb className="nav-icon" />
              Learning 
            </Link>
          </li>
          <li>
            <Link to="/gaming" onClick={toggleNav}>
              <FaGamepad className="nav-icon" />
              Gaming Hub
            </Link>
          </li>
          
          
        </ul>
        
      )}
     
    </nav>
    
  );
};

export default NavBar;