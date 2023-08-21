import React, { useState, useEffect } from 'react';
import '../../components/Countdown/Countdown.css'; // Import the CSS file for styling
import logoImage from '../../assets/logo.png'; // Import the image

function Countdown({ launchReleaseDate }) {
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      const now = new Date();
      const timeDifference = launchReleaseDate - now;
      const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
    };
  }, [launchReleaseDate]);

  return (
    <div className="countdown-container">
      <div className="countdown-content">
        <h1 className="countdown-title">Get Ready for the Multichain NFT Marketplace Launch!</h1>
        <p className="countdown-description">
          We're thrilled to announce the upcoming launch of our cutting-edge Multichain NFT Marketplace. Join us as we revolutionize the NFT space and deliver an unparalleled experience!
        </p>
        {countdown && (
          <div className="countdown-timer">
            <div className="countdown-item">
              <span className="countdown-value">{countdown.days}</span>
              <p className="countdown-label">Days</p>
            </div>
            <div className="countdown-item">
              <span className="countdown-value">{countdown.hours}</span>
              <p className="countdown-label">Hours</p>
            </div>
            <div className="countdown-item">
              <span className="countdown-value">{countdown.minutes}</span>
              <p className="countdown-label">Minutes</p>
            </div>
            <div className="countdown-item">
              <span className="countdown-value">{countdown.seconds}</span>
              <p className="countdown-label">Seconds</p>
            </div>
          </div>
          
        )}
        <div className="countdown-image">
        <img src={logoImage} alt="Launch Logo" className="logo-image1" />
      </div>
        <p className="countdown-note">
          Don't miss out on the excitement. Get ready to explore and trade your favorite NFTs like never before!
        </p>
        <p className="countdown-chains">
          Supported Chains: Ethereum, Binance, Songbird, Flare, Polygon, Avalanche, and Base Network. More to be integrated! 
        </p>
        <p className="countdown-features">
          Create your own art and turn them into NFTs, build collections, buy, sell, auction and trade across multiple networks.
        </p>
      </div>
      
    </div>
  );
}

export default Countdown;
