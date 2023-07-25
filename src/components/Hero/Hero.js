import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import videoSource from '../../assets/Ecommerce-Video-1.mp4'; // adjust the path accordingly
// Styled Components
const Wrapper = styled.section`
  position: absolute;
  top: 0px;
  left: 0;
  width: 100%;
  height: 110vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  overflow: hidden;
  z-index: 5;


  @media (max-width: 768px) {
    height: 100%;
    top: 145px;
  }
`;


const VideoBackground = styled.video`
position: absolute;
top: 50%;
left: 50%;
width: 100%;
height: 100%;
object-fit: cover;
z-index: -2;
transform: translate(-50%, -50%);
`;


// Keyframes
const typing = keyframes`
  from { width: 0; }
  to { width: 100%; }
  z-index:150;

`;

const blinkCaret = keyframes`
  50% { border-color: transparent; }
  z-index:150;

`;

const Heading = styled.h1`
  font-size: 4em;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.6);
  margin-top: 350px;
  font-weight: bold;
  line-height: 1.3;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 4px;
  border-right: .15em solid orange;
  overflow: hidden;
  white-space: nowrap;
  z-index:100;
  

  @media (min-width: 601px) {
    animation: ${typing} 3.5s steps(40, end), ${blinkCaret} .75s step-end infinite;
    z-index:150;
    margin-top:550px;


    width: ${({ textLength }) => textLength}ch; // ch unit is relative to the width of the "0" (zero)
  }

  @media (max-width: 600px) {
    font-size: 2.5em;
    width: 100%; // allow the text to take up the full width of its container
    white-space: normal; // allow the text to wrap onto the next line
    z-index:159;
    margin-top:550px;

    animation: none; // remove the typing animation
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

        
        
      
        <Heading key={index} textLength={phrases[index].length}>{phrases[index]}</Heading>

      </Wrapper>
      
    );
};







export default Hero;
