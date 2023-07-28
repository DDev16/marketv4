import React from 'react';
import brand from '../../assets/logo.png';
import '../../index.css';
import MarketListings from '../Marketplace/MarketListings/MarketListings';
import Hero from '../Hero/Hero';
import HottestCollections from '../Marketplace/Collection/Hot/HottestCollections';
import AllCollections from '../../components/Marketplace/Collection/GetAllCollections.js'
import PunkWorld from '../Pworld/PunkWorld';
import GetAllAuctions from '../../components/Marketplace/Auction/GetAllAuctions.js';

const Home = () => {

 
  return (
    
    <div style={styles.container}>
            <Hero />

      
      <img src={brand} alt="Logo" style={{ ...styles.logo, ...styles.spinAnimation }} />
      <pre>
          <code>
            IgnisLibertas
          </code>
        </pre>
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
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#282c34',
  },
  logo: {
    width: '300px', // Reduce the width for smaller screens
    marginBottom: '16px',
  },
  heading: {
    fontSize: '36px', // Reduce font size for smaller screens
    fontWeight: 'bold',
    marginBottom: '0px',
    textAlign: 'center',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
  },
  description: {
    fontSize: '20px', // Reduce font size for smaller screens
    marginBottom: '32px',
    textAlign: 'center',
    lineHeight: '1.5',
    color: 'white',
  },
  descriptionText: {
    fontSize: '24px', // Increase font size for smaller screens
    marginBottom: '32px',
    textAlign: 'center',
    lineHeight: '1.5',
  },
  popText: {
    fontSize: '36px', // Reduce font size for smaller screens
    fontWeight: 'bold',
    color: '#61dafb',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
    animation: 'popText 0.5s infinite alternate',
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
