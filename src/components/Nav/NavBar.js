import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiMenu, FiX } from 'react-icons/fi';
import { FaDatabase, FaWallet, FaRegLightbulb, FaGamepad, FaGavel, FaStore, FaPlusCircle, FaExchangeAlt } from 'react-icons/fa';
import { Web3Context } from '../../utils/Web3Provider.js';
import songbirdLogo from '../../assets/songbird-logo.png';
import flareLogo from '../../assets/flarelogo.png';
import '../../components/Nav/nav.css';
import Music from '../../components/Music/MusicPlayer.js'
import Select from 'react-select';

const options= [
  { value: '14', label: 'Flare' },
  { value: '19', label: 'Songbird' },
  { value: '5', label: 'Goerli' },
  { value: '8453', label: 'Base (Coming Soon)', disabled: true },
  { value: '1', label: 'Ethereum (Coming Soon)', disabled: true },
  { value: '13', label: 'Binance (Coming Soon)', disabled: true },
  { value: '5', label: 'Polygon (Coming Soon)', disabled: true },
  { value: '5', label: 'Avalanche (Coming Soon)', disabled: true },

  { value: '31337', label: 'Localhost' },
];



const customStyles = {
  control: (provided) => ({
    ...provided,
    borderRadius: 5,
    width: '150px', // Increase the width of the control
    minHeight: '40px', // Increase the minimum height of the control
    border: '2px solid #ccc',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)', // Slightly reduce the box-shadow
    backgroundColor: '#f9f9f9', // Change the background color of the control
  }),
  option: (provided, state) => ({
    ...provided,
    padding: '8px 12px',
    backgroundImage: state.isSelected
      ? 'linear-gradient(to right, #2b5876, #4e4376)'
      : state.isFocused
      ? 'linear-gradient(to right, #f1f1f1, #f1f1f1)' // You can change the focused background color here
      : 'white',
    color: state.isSelected ? 'white' : '#333',
    cursor: 'pointer',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#333', // Change the text color of the selected value
  }),
  indicatorSeparator: () => ({
    display: '', // Hide the indicator separator line
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: '#333', // Change the color of the dropdown indicator arrow
    '&:hover': {
      color: '#ef5350', // Change the color on hover
      
    },
  }),
};

const NavBar = () => {
  const { web3 } = useContext(Web3Context);
  const [currentNetworkId, setCurrentNetworkId] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [account, setAccount] = useState('');
  const [isNavOpen, setIsNavOpen] = useState(false); // Track whether the mobile menu is open or closed

  const handleNetworkChange = async (selectedOption) => {
    const networkId = parseInt(selectedOption.value, 10);
    setCurrentNetworkId(networkId.toString());
    if (web3) { // Changed from web3.currentProvider.isMetaMask
      try {
        // Prevent the user from switching to disabled networks
        if (selectedOption.disabled) {
          console.log('This network is coming soon. Stay tuned!');
          return;
        }

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

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isNavOpen && !event.target.closest('.navbar')) {
        toggleNav();
      }
    };
  
    document.addEventListener('click', handleOutsideClick);
  
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isNavOpen]);
  

  const toggleNav = () => {
    setIsNavOpen((prevState) => !prevState);
  };

   // useEffect to fetch the initial network information when the component mounts
   useEffect(() => {
    const getCurrentNetworkId = async () => {
      if (web3) {
        try {
          const accounts = await web3.eth.getAccounts();
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
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
          } else {
            // If the wallet is not connected, you can handle this case here.
            // For example, you can show a message or set a default network logo.
            setSelectedNetwork(null);
            setCurrentNetworkId(''); // Reset the currentNetworkId to an empty string
          }
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
      <div className="music">

      <Music />
      </div>
      <div className="connected-account">
  Connected Account: <span>{shortenAddress(account)}</span>
</div>
<div className="network-select-container">
        <h2>Select Network</h2>
        <Select
          options={options}
          value={options.find((option) => parseInt(option.value, 10) === parseInt(currentNetworkId, 10))} // Convert both to numbers before comparison
          onChange={handleNetworkChange}
          styles={customStyles}
        />
        {selectedNetwork && <img className="logo-image" src={selectedNetwork} alt="Network logo" />}
      </div>


      <button
  className={`menu-button${isNavOpen ? ' open' : ''}`}
  onClick={(event) => {
    event.stopPropagation(); // Prevent the event from reaching the icon
    toggleNav();
  }}
>
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