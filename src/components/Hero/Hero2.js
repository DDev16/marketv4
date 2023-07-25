import React from 'react';
import videoSource from '../../assets/FlyIn Fire Logo_free (1).mp4'; // adjust the path accordingly
import styled, { keyframes } from 'styled-components';

// Styled Component
const Wrapper = styled.div`
  position: relative;
  width: 2000px;
  height: 100vh; // this will take the full height of the viewport
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-align: center;
  overflow: hidden; // to ensure no scroll
`;

const VideoBackground = styled.video`
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  z-index: 1000;
  transform: translate(-50%, -50%);
  object-fit: cover; // to ensure video covers full area
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 500;
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;
const textGlow = keyframes`
  0%, 100% { text-shadow: 0 0 .5em #ff3, 0 0 .5em #ff3, 0 0 .5em #ff3, 0 0 .5em #ff3; }
  30% { text-shadow: 0 0 .5em #f33, 0 0 2em #f33, 0 0 3em #f33, 0 0 4em #f33; }
  60% { text-shadow: 0 0 .5em #ff3, 0 0 2em #ff3, 0 0 3em #ff3, 0 0 4em #ff3; }
`;

const Title = styled.h1`
  font-size: 4em;
  color: #fff;
  text-transform: uppercase;
  margin-bottom: 0.5em;
  animation: ${textGlow} 2s ease-in-out infinite;
  transition: transform 0.3s;
  text-shadow: 0px 0px 5px #ff3, 0px 0px 15px #ff3, 0px 0px 30px #ff3, 0px 0px 60px #ff3;
  transform: perspective(1px) translateZ(0);

  &:hover {
    transform: scale(1.05) translateZ(0);
  }

  @media (max-width: 768px) {
    font-size: 2em;
  }
`;

const Subtitle = styled.p`
  font-size: 1.5em;
  color: #fff;
  margin-bottom: 1em;
  animation: ${textGlow} 2s ease-in-out infinite;
  transition: transform 0.3s;
  text-shadow: 0px 0px 5px #ff3, 0px 0px 15px #ff3, 0px 0px 30px #ff3, 0px 0px 60px #ff3;
  transform: perspective(1px) translateZ(0);

  &:hover {
    transform: scale(1.05) translateZ(0);
  }

  @media (max-width: 768px) {
    font-size: 1em;
  }
`;

const scrollPulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
`;

const ScrollIcon = styled.div`
  position: absolute;
  bottom: 10%;
  height: 60px; // Increase size
  width: 36px;  // Increase size
  border: 3px solid #fff; // Increase border thickness
  border-radius: 18px;  // Increase border radius
  opacity: 0.75;
  animation: ${scrollPulse} 1s infinite;  // Add pulse effect

  &:before {
    content: "";
    position: absolute;
    top: 15px;  // Adjust according to new size
    left: 50%;
    width: 12px;  // Increase size
    height: 12px;  // Increase size
    background-color: #fff;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: ${props => (props.animation ? props.animation : null)} 1.5s infinite;
  }
`;

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scrollBounce = keyframes`
  0% { transform: translateY(0); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(15px); opacity: 0; }
`;


// Hero Component
const Hero2 = () => {
    return (
      <Wrapper>
        <VideoBackground autoPlay loop muted playsInline src={videoSource} type="video/mp4" />
        <Overlay />
        <HeroContent>
          <Title animation={fadeIn}>Adventure Awaits</Title>
          <Subtitle animation={fadeIn}>Explore the world of Blockchain with us</Subtitle>
          <ScrollIcon animation={scrollBounce} />
        </HeroContent>
      </Wrapper>
    );
};

export default Hero2;
