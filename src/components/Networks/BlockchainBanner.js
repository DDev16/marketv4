import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import blockchains from '../../components/Networks/Blockchains.js';
import '../../components/Networks/Blockchains.css';

const BlockchainBanner = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 1500,
    slidesToShow: 3, // Show 3 logos at a time on mobile
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: 'linear',
    variableWidth: true,
    swipeToSlide: true,
    focusOnSelect: true,
    responsive: [
      {
        breakpoint: 767, // Breakpoint for mobile devices
        settings: {
          slidesToShow: 1, // Show 1 logo at a time on mobile
        },
      },
    ],
  };

  // Duplicate the blockchains array to create a seamless loop effect
  const duplicatedBlockchains = [...blockchains, ...blockchains, ...blockchains];

  return (
    <div className="blockchain-banner">
      <h2>Supported Blockchains</h2>
      {/* Add custom CSS class to the Slider component */}
      <Slider className="custom-slider" {...settings}>
        {duplicatedBlockchains.map((blockchain, index) => (
          <div key={index} className="blockchain-slide">
            <img src={blockchain.logo} alt={blockchain.name} />
            <p>{blockchain.name}</p>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default BlockchainBanner;
