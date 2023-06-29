import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiHome, FiPlusCircle, FiFolder, FiMenu, FiX,  } from 'react-icons/fi';
import { FaDatabase, FaWallet } from 'react-icons/fa';
import { Web3Context } from '../../utils/Web3Provider.js';
import songbirdLogo from '../../assets/songbird-logo.png';
import flareLogo from '../../assets/flarelogo.png';

const StyledNav = styled.nav`
  position: relative;
  background-color: #252525;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  z-index: 50;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  font-family: 'Roboto', sans-serif;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 10px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: 700;

  img {
    width: 60px;
    height: 60px;
    margin-right: 10px;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
  }

  .app-name {
    color: #ffffff;
    letter-spacing: 1px;
  }
`;

const NavLinks = styled.ul`
  display: flex;
  list-style: none;

  li {
    margin-right: 20px;
  }

  a {
    color: #ffffff;
    text-decoration: none;
    display: flex;
    align-items: center;
    font-size: 18px;
    transition: color 0.3s ease;

    .nav-icon {
      margin-right: 5px;
      color: #ffffff;
    }

    &:hover {
      color: #ffcc00;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    margin-top: 10px;
    transform: ${({ open }) => (open ? 'translateX(0)' : 'translateX(-100%)')};
    transition: transform 0.3s ease-in-out;
    position: absolute;
    background-color: #252525;
    top: 60px;
    left: 0;
    padding: 2rem;
    width: 100%;
    height: 100vh;

    li {
      margin-right: 0;
      margin-bottom: 10px;
    }
  }
`;

const MenuButton = styled.button`
  display: none;

  @media (max-width: 768px) {
    display: block;
    background: transparent;
    border: none;
    color: #ffffff;
    font-size: 2.5rem;
    cursor: pointer;
  }
`;

const NetworkSelect = styled.select`
  color: #ffffff;
  background-color: #252525;
  border: none;
  margin-right: 10px;
  padding: 10px;
  border-radius: 5px;
  font-size: 16px;
  outline: none;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #333333;
  }

  &:focus {
    background-color: #444444;
  }
`;

const LogoImage = styled.img`
  width: 60px;
  height: 60px;
  margin-right: 10px;
  border-radius: 50%;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  object-fit: cover;
  transform: scale(1);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

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

  return (
    <StyledNav>
      <Logo>
        <img src={require('../../assets/logo.png')} alt="Logo" />
        <span className="app-name">Flare Fire </span>
      </Logo>
      <div>
        <NetworkSelect value={currentNetworkId} onChange={handleNetworkChange}>
          <option value="14">Flare</option>
          <option value="19">Songbird</option>
          <option value="5">Goerli</option>
          <option value="31337">Localhost</option>
        </NetworkSelect>
        {selectedNetwork && <LogoImage src={selectedNetwork} alt="Network logo" />}
      </div>
      <span>{account}</span>

      <MenuButton onClick={handleToggle}>
        {isOpen ? <FiX /> : <FiMenu />}
      </MenuButton>
      <NavLinks open={isOpen}>
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
      </NavLinks>
    </StyledNav>
  );
};

export default NavBar;