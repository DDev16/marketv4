import React from 'react';
import '../../index.css';
import MarketListings from '../Marketplace/MarketListings/MarketListings';
import Hero from '../Hero/Hero';
import AllCollections from '../../components/Marketplace/Collection/GetAllCollections.js'
import HottestCollections from '../../components/Marketplace/Collection/Hot/HottestCollections.js'
import PunkWorld from '../Pworld/PunkWorld';
import GetAllAuctions from '../../components/Marketplace/Auction/GetAllAuctions.js';
import brand from '../../assets/logo.png';
import '../../components/Home/styles.css'; // Import the CSS file

const Home = () => {
  return (
    
    <div style={styles.container}>
            <Hero />
        <img src={brand} alt="Logo" style={{ ...styles.logo, ...styles.spinAnimation }} />

      <h1 style={styles.heading}>Empowering Innovation: Building Robust Dapps for the Community</h1>

      <p style={styles.description}>Our digital hub is your comprehensive gateway for seamless NFT creation and collection building, using the Ethereum Virtual Machine's capabilities. Our platform, tailored for artists, collectors, and blockchain enthusiasts, provides intuitive tools to mint unique NFTs, curate diverse collections, and enrich personal portfolios without any coding prerequisites. Firmly established in the Songbird/Flare Networks community, we bridge the gap between your artistic ambition and a global audience, acting not just as a toolset, but a creative catalyst in the thriving NFT market. We invite you to join us in pushing the limits of what decentralized applications (Dapps) can achieve on the EVM, committed to constant growth and exploration in a dynamic blockchain environment.</p>
      <p style={{ ...styles.descriptionText, ...styles.fireAnimation }}>Jumpstart your digital art journey with us! Enjoy 2 Free mints on us!</p>
      <button style={{ ...styles.button, ...styles.popButton }}>
        <a href="/mint" style={styles.buttonLink}>Click here to begin your creative expedition here</a>
      </button>
   
      <PunkWorld />
      <HottestCollections />
      <AllCollections />
  <MarketListings />
  <GetAllAuctions />
  
    </div>
  );
};

const spinAnimation = {
  animation: 'spin 5s linear infinite',
  transformStyle: 'preserve-3d'
};

const fireAnimation = {
  animation: 'fire 2s linear infinite',
};


const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px', // Reduce padding for smaller screens
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#282c34',
  },
  logo: {
    width: '300px',
    zIndex: "11",
    marginTop: '350px', // Default margin for desktop

    // Media query for mobile
    '@media (max-width: 768px)': {
      width: '200px', // Adjust the width for mobile
      marginTop: '350px', // Adjust margin for mobile
    },
  },
  heading: {
    fontSize: '36px', // Reduce font size for smaller screens
    fontWeight: 'bold',
    marginBottom: '0px',
    textAlign: 'center',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
    marginTop: '0px',
    zIndex:"99",
    marginTop:"150px",


    // Media query for mobile
    '@media (max-width: 668px)': {
      marginTop: '0px', // Adjust margin for mobile
      fontSize: '24px', // Adjust font size for mobile
    },
  },
  description: {
    fontSize: '20px', // Reduce font size for smaller screens
    marginTop: '80px',
    textAlign: 'center',
    lineHeight: '1.5',
    color: 'white',
    zIndex:"11",
  },
  descriptionText: {
    fontSize: '24px', // Increase font size for smaller screens
    marginBottom: '32px',
    textAlign: 'center',
    lineHeight: '1.5',
    zIndex:"11",
    marginTop: '80px',

  },
  popText: {
    fontSize: '36px', // Reduce font size for smaller screens
    fontWeight: 'bold',
    color: '#61dafb',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
    animation: 'popText 0.5s infinite alternate',
    marginTop: '80px',

  },
  button: {
    padding: '10px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    marginBottom: '32px',
  },
  buttonLink: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#61dafb',
    color: '#282c34',
    fontSize: '18px', // Reduce font size for smaller screens
    fontWeight: 'bold',
    textDecoration: 'none',
    borderRadius: '8px',
    transition: 'transform 0.3s ease-in-out',
  },
  popButton: {
    transform: 'scale(1.1)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  },
  spinAnimation,
  fireAnimation,
  
};



export default Home;
