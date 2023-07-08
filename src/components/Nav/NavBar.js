import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiPlusCircle, FiFolder, FiMenu, FiX,  } from 'react-icons/fi';
import { FaDatabase, FaWallet } from 'react-icons/fa';
import { Web3Context } from '../../utils/Web3Provider.js';
import songbirdLogo from '../../assets/songbird-logo.png';
import flareLogo from '../../assets/flarelogo.png';
import '../../components/Nav/nav.css'

const NavBar = () => {
  const { web3 } = useContext(Web3Context);
  const [currentNetworkId, setCurrentNetworkId] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [account, setAccount] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleNetworkChange = async (e) => {
    const networkId = parseInt(e.target.value, 10);
    if (web3 && web3.currentProvider.isMetaMask) {
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

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const closeNav = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const getCurrentNetworkId = async () => {
      if (web3 && web3.currentProvider.isMetaMask) {
        try {
          const networkId = await web3.eth.net.getId();
          setCurrentNetworkId(networkId.toString());
          if (networkId === 19) {
            setSelectedNetwork(songbirdLogo);
          } else if (networkId === 14) {
            setSelectedNetwork(flareLogo);
            
          } 
          else if (networkId === 5) {
            setSelectedNetwork(null);
          } 
          
          else if (networkId === 31337) {
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
  }, [web3]);


  function shortenAddress(address, frontChars = 6, backChars = 4) {
    if (!address) return "";
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
      <div>
        <select className="network-select" value={currentNetworkId} onChange={handleNetworkChange}>
          <option value="14">Flare</option>
          <option value="19">Songbird</option>
          <option value="5">Goerli</option>
          <option value="31337">Localhost</option>
        </select>
        {selectedNetwork && <img className="logo-image" src={selectedNetwork} alt="Network logo" />}
      </div>
      <span>{shortenAddress(account)}</span>
      <button className="menu-button" onClick={handleToggle}>
        {isOpen ? <FiX /> : <FiMenu />}
      </button>
      <ul className={isOpen ? "nav-links open desktop-nav" : "nav-links desktop-nav"}>
        <li onClick={closeNav}>
          <Link to="/">
            <FiHome className="nav-icon" />
            Home
          </Link>
        </li>
        <li onClick={closeNav}>
          <Link to="/mint">
            <FiPlusCircle className="nav-icon" />
            Mint
          </Link>
        </li>
        <li onClick={closeNav}>
          <Link to="/batch-mint">
            <FiPlusCircle className="nav-icon" />
            Batch Mint
          </Link>
        </li>
        <li onClick={closeNav}>
          <Link to="/marketplace">
            <FaDatabase className="nav-icon" />
            Marketplace
          </Link>
        </li>
        <li onClick={closeNav}>
          <Link to="/all-collections">
            <FaDatabase className="nav-icon" />
            All Collections
          </Link>
        </li>
        <li onClick={closeNav}>
          <Link to="/sign-in">
            <FaWallet className="nav-icon" />
            Sign-In 
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;