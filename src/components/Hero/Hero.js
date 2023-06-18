import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaFire } from 'react-icons/fa';
import videoSource from '../../assets/Ecommerce-Video-1.mp4'; // adjust the path accordingly

// Styled Components
const Wrapper = styled.section`
  position: relative;
  width: 120%;
  height: 175vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  overflow: hidden;
`;

const VideoBackground = styled.video`
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 120%;
  min-height: 50%;
  width: auto;
  height: auto;
  z-index: 0;
  transform: translateX(-50%) translateY(-50%);
`;


// Keyframes
const typing = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

const blinkCaret = keyframes`
  50% { border-color: transparent; }
`;

const Heading = styled.h1`
  font-size: 4em;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.6);
  z-index: 0;
  margin-top: -50px;
  font-weight: bold;
  line-height: 1.3;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 4px;
  border-right: .15em solid orange;
  overflow: hidden;
  white-space: nowrap;

  @media (min-width: 601px) {
    animation: ${typing} 3.5s steps(40, end), ${blinkCaret} .75s step-end infinite;
    width: ${({ textLength }) => textLength}ch; // ch unit is relative to the width of the "0" (zero)
  }

  @media (max-width: 600px) {
    font-size: 2.5em;
    width: 100%; // allow the text to take up the full width of its container
    white-space: normal; // allow the text to wrap onto the next line
    animation: none; // remove the typing animation
  }
`;

// Keyframes
const glow = keyframes`
  0% {
    box-shadow: 0 0 5px #ff4d4d, 0 0 10px #ff4d4d, 0 0 15px #ff4d4d, 0 0 20px #ff4d4d;
  }
  100% {
    box-shadow: 0 0 10px #ff4d4d, 0 0 20px #ff4d4d, 0 0 30px #ff4d4d, 0 0 40px #ff4d4d;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  margin: 20px;
  margin-bottom: 100px;
    border-radius: 50%;
  z-index: 0;
  padding: 70px;
  transition: transform 0.3s ease-in-out;
  animation: ${glow} 2s infinite;
  color: #ff4d4d;

  &:hover {
    transform: scale(1.1);
  }

  @media (max-width: 600px) {
    font-size: 1.5em;
  }
`;

// Hero Component
const Hero = () => {
    const phrases = ['Welcome to Flare Fire Tools', 'Providing the Best Tools', 'Quality You Can Trust']; // add more phrases if needed
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex(prevIndex => (prevIndex + 1) % phrases.length);
        }, 6000); // 6000 = fadeIn (2000ms) + display (2000ms) + fadeOut (2000ms)
        return () => clearInterval(interval);
    }, []);

    return (
      <Wrapper>
        <VideoBackground autoPlay loop muted playsInline src={videoSource} type="video/mp4" />
        <IconWrapper aria-label="Fire Icon">
          <FaFire />
        </IconWrapper>
        <Heading key={index} textLength={phrases[index].length}>{phrases[index]}</Heading>
      </Wrapper>
    );
};

export default Hero;
