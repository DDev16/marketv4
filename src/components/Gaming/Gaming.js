// Importing necessary libraries and dependencies
import React from 'react';
import '../../components/Gaming/gaminghub.css';

// Sample data of games
const games = [
  {
    id: 1,
    title: 'Game 1',
    description: 'This is game 1',
    thumbnail: 'https://source.unsplash.com/random/450x200?gaming',
    link: 'https://link-to-game1.com'
  },
  {
    id: 2,
    title: 'Game 2',
    description: 'This is game 2',
    thumbnail: 'https://source.unsplash.com/random/450x200?gaming',
    link: 'https://link-to-game2.com'
  },
  // More games can be added here
];

const GamingHub = () => {
  return (
    <div className="gaming-hub">
      <h1>GamingHub</h1>
      <div className="game-list">
        {games.map(game => (
          <div key={game.id} className="game-card">
            <img src={game.thumbnail} alt={game.title} />
            <h2>{game.title}</h2>
            <p>{game.description}</p>
            <a href={game.link} target="_blank" rel="noopener noreferrer">Play Now</a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GamingHub;
