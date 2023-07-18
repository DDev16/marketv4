import React from 'react';
import brand from '../../assets/logo.png';
import '../../index.css';
import MarketListings from '../Marketplace/MarketListings/MarketListings';
import Hero from '../Hero/Hero';
import AllCollections from '../../components/Marketplace/Collection/GetAllCollections.js'
import HottestCollections from '../../components/Marketplace/Collection/Hot/HottestCollections.js'
import PunkWorld from '../Pworld/PunkWorld';
import Auction from '../Marketplace/Auction/Auction';

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

      <p style={styles.description}>Welcome to our digital hub, your gateway to effortless NFT creation and collection building. Harnessing the power of the Ethereum Virtual Machine, we offer intuitive tools for you to mint unique NFTs, create diverse NFT collections, and easily add your NFTs to your personal collection - all without needing any coding knowledge.</p>
      <p style={styles.description}>Whether you're an artist, a collector, or a blockchain enthusiast, our platform is designed with you in mind. We've integrated cutting-edge features that simplify your journey in the blockchain landscape. Our platform serves as more than just a set of tools; it's a creative companion meticulously curated for you.</p>
      <p style={styles.description}>Rooted deeply in the Songbird/Flare Networks community, we see ourselves as a conduit, bridging the gap between your artistic vision and the global audience. We're not just a toolset; we're a catalyst fostering creativity and propelling innovation in the bustling NFT market.</p>
      <p style={styles.description}>Join us in redefining what's possible on the EVM, as we consistently push the boundaries of what decentralized applications (Dapps) can achieve. We're committed to continual growth, evolution, and exploring uncharted territories in an ever-evolving blockchain world.</p><p style={{ ...styles.descriptionText, ...styles.fireAnimation }}>Jumpstart your digital art journey with us! Enjoy 2 Free mints on us!</p>
      <button style={{ ...styles.button, ...styles.popButton }}>
        <a href="/mint" style={styles.buttonLink}>Begin your creative expedition here</a>
      </button>
    <Auction />
      <PunkWorld />
      {/* Add more information or features of the dapp */}
      <HottestCollections />
      <AllCollections />
  <MarketListings />
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

// Media Query for smaller screens (up to 600px width)
const mediaQuery = `@media (max-width: 600px) {
  .container {
    padding: 10px;
  }
  .logo {
    width: 200px;
  }
  .heading {
    font-size: 24px;
  }
  .description {
    font-size: 16px;
  }
  .descriptionText {
    font-size: 20px;
  }
  .popText {
    font-size: 24px;
  }
  .buttonLink {
    font-size: 16px;
  }
}`;



export default Home;
