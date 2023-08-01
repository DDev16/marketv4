import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaWallet, FaFolder, FaCog, FaPlus, FaBox, FaGavel } from 'react-icons/fa'; // Import unique icons
import '../Dashboard/UserDash.css';

const UserDashboard = ({ user, signOutUser }) => {
  const [showMenu, setShowMenu] = useState(false);
  
  if (!user) {
    return null;
  }

  return (
    <div className="navbar-topbar-wrapper">
      <div className="header">
        <h1 className="welcome-text">Welcome, {user.email}!</h1>
        <button className="sign-out-button" onClick={signOutUser}>
          Sign Out
        </button>
        <div className="dropdown">
          <button className="sidebar-toggle" onClick={() => setShowMenu(!showMenu)}>Dashboard</button>
          {showMenu && (
            <div className="sidebar">
            <NavLink exact="true" to="/token-list" activeclassname="active" className="nav-link">
  <FaWallet className="nav-icon" /> Wallet
</NavLink>
<NavLink exact="true" to="/my-tokens" activeclassname="active" className="nav-link">
  <FaFolder className="nav-icon" /> My NFTs
</NavLink>
<NavLink exact="true" to="/profile-settings" activeclassname="active" className="nav-link">
  <FaCog className="nav-icon" /> Profile Settings
</NavLink>
<NavLink exact="true" to="/create-collection" activeclassname="active" className="nav-link">
  <FaPlus className="nav-icon" /> Create Collection
</NavLink>
<NavLink exact="true" to="/my-collections" activeclassname="active" className="nav-link">
  <FaBox className="nav-icon" /> My Collections
</NavLink>
<NavLink exact="true" to="/my-auctions" activeclassname="active" className="nav-link">
  <FaGavel className="nav-icon" /> My Auctions
</NavLink>

              
          
            
            </div>
            
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
