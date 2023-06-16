import React from 'react';
import brand from '../../assets/logo.png'; // Update this with your actual logo file path
import '../Loading/loading.css';



const MintingLoading = () => (
  <div className="loading-container">
    <img src={brand} alt="Logo" style={{ ...styles.logo, ...styles.spinAnimation }} />
    <p className="loading-text">Minting...</p>
  </div>
);


const spinAnimation = {
    animation: 'spin 5s linear infinite',
    transformStyle: 'preserve-3d'
  };
  
  
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#282c34',
    },
  
    logo: {
      width: '400px',
      marginBottom: '16px',
    },
    spinAnimation,
    
  
  };
  

export default MintingLoading;
