import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

import SupporterFont from '../../components/Hero/FlamesItalicPersonalUseBoldItalic-rgAWK.ttf';
import { createGlobalStyle } from 'styled-components';

import videoSource from '../../assets/FlyIn Fire Logo_free (1).mp4'; // adjust the path accordingly

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Supporter Font';
    src: url(${SupporterFont}) format('truetype');
    font-weight: normal;
    font-style: normal;
  }
`;

const Wrapper = styled.div`
  position: relative;
  width: 99vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-align: center;
  overflow: hidden;

  @media (max-width: 768px) {
    height: 100vh;
    flex-direction: column;
    justify-content: space-around;
    width: 100%;
  }
`;

const VideoBackground = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  object-fit: cover;

  @media (max-width: 768px) {
    position: relative;
    width: 360px;
    height: 100%;
  }
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
  font-size: 8em;
  color: #fff;
  font-family: 'Supporter Font', sans-serif;
  margin-top: 0;
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
    font-size: 4em;
    margin-top: 0;
  }
`;

const Subtitle = styled.p`
  font-size: 4em;
  color: #fff;
  font-family: 'Supporter Font', sans-serif;
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
  height: 60px;
  width: 36px;
  border: 3px solid #fff;
  border-radius: 18px;
  opacity: 0.75;
  animation: ${scrollPulse} 1s infinite;

  &:before {
    content: "";
    position: absolute;
    top: 15px;
    left: 50%;
    width: 12px;
    height: 12px;
    background-color: #fff;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: ${props => (props.animation ? props.animation : null)} 1.5s infinite;
  }

  @media (max-width: 768px) {
    font-size: 1em;
    bottom: 7px;
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
const LazyVideoBackground = () => {
  return <VideoBackground autoPlay loop muted playsInline preload="metadata" src={videoSource} type="video/mp4" />;
};

const Hero2 = () => {
  const [isScrollIconVisible, setScrollIconVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollIconElement = document.getElementById('scrollIcon');
      if (!scrollIconElement) return;

      const scrollIconRect = scrollIconElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      setScrollIconVisible(scrollIconRect.top < windowHeight);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div>
      <Wrapper>
        <LazyVideoBackground />
        <HeroContent>
          <Title animation={fadeIn}>Adventure Awaits</Title>
          <Subtitle animation={fadeIn}>Explore the world of Blockchain with us</Subtitle>
          <GlobalStyle />
          <ScrollIcon id="scrollIcon" animation={scrollBounce} />
        </HeroContent>
      </Wrapper>
    </div>
  );
};

export default Hero2;