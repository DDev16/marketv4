import React from 'react';
import brand from '../../assets/logo.png';
import '../../index.css';
import MarketListings from '../Marketplace/MarketListings/MarketListings';
import Hero from '../Hero/Hero';

const Home = () => {
  return (
    
    <div style={styles.container}>
            <Hero />

      <img src={brand} alt="Logo" style={{ ...styles.logo, ...styles.spinAnimation }} />
      <h1 style={styles.heading}>Empowering Innovation: Building Robust Dapps for the Community</h1>
<p style={styles.description}>In the era of digital renaissance, we are dedicated to fostering innovation and pushing the boundaries of what's possible. Welcome to our platform, an all-encompassing hub for decentralized applications (Dapps) meticulously designed for the thriving EVM (Ethereum Virtual Machine) community.</p>
<p style={styles.description}>We offer you the opportunity to create unique, vibrant NFTs without any prior coding knowledge. Our tools are not just about technological prowess, they are about unlocking your creative potential and letting it shine in the vast expanse of the digital world.</p>
<p style={styles.description}>Our platform is more than a Dapp, it's a creative companion meticulously curated for you. We've seamlessly integrated cutting-edge features to simplify the process of minting NFTs and interacting with them. Whether you are an artist, a collector, or a digital enthusiast seeking to explore the transformative blockchain landscape, our platform has been designed with you in mind.</p>
<p style={styles.description}>Our genesis is rooted in the profound respect for the Songbird/Flare Networks community. Our platform serves as a conduit, bridging the gap between your artistic vision and the global audience. We are not just a toolset, but a catalyst that fosters creativity and propels innovation in the thriving NFT marketplace.</p>
<p style={styles.description}>In an ever-evolving blockchain world, we are committed to consistently pushing the boundaries of what Dapps can achieve on the EVM. With a fervent commitment to continuous growth and evolution, we aspire to explore uncharted territories and redefine the standards of building on the EVM.</p>
<p style={{ ...styles.descriptionText, ...styles.fireAnimation }}>Jumpstart your digital art journey with us! Enjoy 2 Free mints on us!</p>
      <button style={{ ...styles.button, ...styles.popButton }}>
        <a href="/mint" style={styles.buttonLink}>Begin your creative expedition here</a>
      </button>
      {/* Add more information or features of the dapp */}
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
  heading: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '0px',
    textAlign: 'center',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
  },
  description: {
    fontSize: '24px',
    marginBottom: '32px',
    textAlign: 'center',
    lineHeight: '1.5',
    color: 'white',
  },
  descriptionText: {
    fontSize: '60px',
    marginBottom: '32px',
    textAlign: 'center',
    lineHeight: '1.5',
  },
  popText: {
    fontSize: '48px',
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
    fontSize: '18px',
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
