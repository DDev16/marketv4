import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Card } from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { useSpring, animated } from 'react-spring';

// Enhanced Box style
const StyledBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  textAlign: 'center',
  gap: '2rem',
  backgroundImage:
    'url(https://img.freepik.com/free-vector/geometric-background-with-polygonal-lines_1017-6448.jpg?size=626&ext=jpg&ga=GA1.2.1715257389.1688125620&semt=ais)',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  padding: '1rem',
});

// Enhanced Countdown Card style
const CountdownCard = styled(animated(Card))({
  padding: '2rem',
  margin: '1rem',
  backgroundColor: '#fff',
  borderRadius: '10px',
  boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.2)',
  },
});

const Countdown = ({ launchDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(`${launchDate}`) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const countdown = Object.entries(timeLeft).map(([unit, value]) => (
    <CountdownCard key={unit}>
      <Typography variant="h5">{value}</Typography>
      <Typography variant="subtitle1">{unit}</Typography>
    </CountdownCard>
  ));

  return <Box sx={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>{countdown}</Box>;
};

const RotatingEmoji = styled(Typography)(({ theme }) => ({
  fontSize: '3rem',
  animation: 'spin 2s linear infinite',
  '@keyframes spin': {
    '0%': { transform: 'rotateY(0deg)' },
    '100%': { transform: 'rotateY(360deg)' },
  },
}));

const EnhancedTitle = styled(Typography)(({ theme }) => ({
  fontSize: '3.5rem',
  fontWeight: 'bold',
  marginRight: '20px',
  textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  transform: 'perspective(1000px) rotateX(-20deg)',
  '-webkit-text-stroke': '1px rgba(255, 255, 255, 0.5)',
  '-webkit-text-fill-color': 'rgba(255, 255, 255, 1)',
  position: 'relative',
  animation: 'glow 2s ease-in-out infinite',
  '@keyframes glow': {
    '0%': { filter: 'brightness(100%)', transform: 'scale(1)' },
    '50%': { filter: 'brightness(150%)', transform: 'scale(1.1)' },
    '100%': { filter: 'brightness(100%)', transform: 'scale(1)' },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    background: 'linear-gradient(45deg, #ff6a00, #ee0979, #ff6a00)',
    borderRadius: '10px',
    opacity: 0.7,
    animation: 'pulse 3s ease-in-out infinite',
    transform: 'scale(1.1)',
    animationDelay: '0.5s',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -2,
    background: 'linear-gradient(45deg, #ff6a00, #ee0979, #ff6a00)',
    borderRadius: '10px',
    opacity: 0.5,
    animation: 'pulse 3s ease-in-out infinite',
    transform: 'scale(1.2)',
    animationDelay: '1s',
  },
  '@keyframes pulse': {
    '0%': { opacity: 0.7, transform: 'scale(1)' },
    '50%': { opacity: 0.4, transform: 'scale(1.05)' },
    '100%': { opacity: 0.7, transform: 'scale(1)' },
  },
}));

const Auction = () => {
  const launchDate = '2023-8-14'; // set your launch date here
  const navigate = useNavigate();
  const springProps = useSpring({ opacity: 1, from: { opacity: 0 } });

  return (
    <animated.div style={springProps}>
      <StyledBox>
        <RotatingEmoji variant="h1">🚧</RotatingEmoji>
        <EnhancedTitle variant="h2">Auction Page</EnhancedTitle>
        <Typography variant="h4">Under Construction</Typography>
        <Typography variant="body1" sx={{ maxWidth: '600px', margin: '0 auto' }}>
          We're working hard to give you the best auction experience. Stay tuned!
        </Typography>
        <Countdown launchDate={launchDate} />
        <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </StyledBox>
    </animated.div>
  );
};

export default Auction;
