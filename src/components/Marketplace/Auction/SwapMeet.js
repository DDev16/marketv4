import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import FlipMove from 'react-flip-move';
import Web3 from 'web3';
import '../../../components/Marketplace/Auction/swap.css';

const SwapMeet = () => {
  const [confetti, setConfetti] = useState(false);
  const [account, setAccount] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');

  useEffect(() => {
    web3.eth.getAccounts().then(accounts => {
      setAccount(accounts[0]);
    });
  }, [web3.eth]);

  const calculateTimeLeft = () => {
    const difference = +new Date('2023-8-14') - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [year] = useState(new Date().getFullYear());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  const initialScore = localStorage.getItem(account) || 0;
  const [score, setScore] = useState(Number(initialScore));

  const [leaderBoard, setLeaderBoard] = useState(
    JSON.parse(localStorage.getItem('leaderBoard')) || []
  );

  useEffect(() => {
    if (confetti) {
      const timer = setTimeout(() => {
        setConfetti(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [confetti]);

  const handleCoinClick = () => {
    const lastClaimTime = localStorage.getItem(`lastClaim-${account}`);
    const now = Date.now();

    if (lastClaimTime && now - lastClaimTime < 24 * 60 * 60 * 1000) {
      setErrorMessage('You can only claim tokens once a day');
      return;
    }

    setErrorMessage(null);

    const point = 1; // Fixed number of points per click

    const newScore = score + point;
    setScore(newScore);
    localStorage.setItem(account, newScore);
    updateLeaderBoard(account, newScore);

    localStorage.setItem(`lastClaim-${account}`, now);
  };

  const updateLeaderBoard = (user, score) => {
    const newLeaderBoard = [...leaderBoard];
    const existingUserIndex = newLeaderBoard.findIndex(item => item.user === user);
    if (existingUserIndex !== -1) {
      newLeaderBoard[existingUserIndex].score += score;
    } else {
      newLeaderBoard.push({ user, score });
    }
    newLeaderBoard.sort((a, b) => b.score - a.score);

    // Assign ranks to leaderboard items
    const leaderboardWithRanks = newLeaderBoard.map((item, index) => ({
      ...item,
      rank: index + 1
    }));

    setLeaderBoard(leaderboardWithRanks.slice(0, 10)); // Show top 10 scores
    localStorage.setItem('leaderBoard', JSON.stringify(leaderboardWithRanks));
  };

  const clearLeaderBoard = () => {
    localStorage.removeItem('leaderBoard');
    leaderBoard.forEach(({ user }) => localStorage.removeItem(user));
    setLeaderBoard([]);
    setAccount(null);
  };

  return (
    <div className="swap-meet">
      <h1>Our NFT Swap Meet is Under Construction!</h1>
      <h3>Launching on 14th August, {year}</h3>
      <div>
        Countdown: {timeLeft.days} days {timeLeft.hours} hours {timeLeft.minutes} minutes{' '}
        {timeLeft.seconds} seconds
      </div>
      <p>But don't worry, we've got something fun for you in the meantime!</p>
      <div className="coin-game">
        <h2>Click the coin to earn virtual points!</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <p>Score: {score}</p>
        <button onClick={handleCoinClick} className="coin-button">
          {confetti && <Confetti />}
          💰
        </button>
      </div>
      <div className="leaderboard">
        <h2>Leaderboard</h2>
        {/* <button onClick={clearLeaderBoard} className="clear-leaderboard">
          Clear Leaderboard
        </button> */}

        <div className="flip-move">
          {leaderBoard.map(({ user, score, rank }) => (
            <div
              key={user}
              className={`leaderboard-item ${user === account ? 'user' : ''} ${
                user === account ? 'you' : ''
              }`}
            >
              <span className="user-rank">{rank}</span>
              <span className="user-name">{user === account ? `${user} (You)` : user}</span>
              <span className="score">{score}</span>
            </div>
          ))}
        </div>
      </div>
      <p>
        We're working hard to bring you the best NFT Swap Meet. Your virtual score might be worth
        something special when we launch. Stay tuned!
      </p>
    </div>
  );
};

export default SwapMeet;
