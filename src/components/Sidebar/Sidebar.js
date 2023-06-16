import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Sidebar.css';

const Sidebar = ({ children, sidebarClass = '', buttonClass = '' }) => {
  // Start with the sidebar not visible
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="sidebar-container">
      <div className={`sidebar-content ${sidebarClass}`} style={{transform: isSidebarVisible ? 'translateX(0)' : 'translateX(-100%)'}}>
        {children}
      </div>
      <button 
        onClick={toggleSidebar} 
        className={`sidebar-button ${buttonClass}`}
        aria-label={isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}>
        {isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
      </button>
    </div>
  );
};

Sidebar.propTypes = {
  children: PropTypes.node.isRequired,
  sidebarClass: PropTypes.string,
  buttonClass: PropTypes.string,
};

export default Sidebar;
