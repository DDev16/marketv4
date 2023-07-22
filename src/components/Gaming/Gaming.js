// Importing necessary libraries and dependencies
import React from 'react';
import '../../components/Gaming/gaminghub.css';
import BeastyBuddiesImage from '../../assets/BABY (33).png'; // Correct path depending on the location of the image

// Sample data of games
const games = [
  {
    id: 1,
    title: 'Beasty Buddies',
    description: 'Dive into the realm of Beasty Buddies, a captivating NFT game based on the Ethereum blockchain that combines the thrill of virtual pet rearing with the excitement of cryptocurrency. Anchored on a smart contract known as TamagotchiNFT, Beasty Buddies amalgamates elements from several powerful blockchain features. Each player becomes a proud owner of an endearing virtual pet, with its unique set of attributes. The game allows interaction with pets, changing happiness and hunger levels and contributing to growth. The process of evolution lets your pet ascend to higher levels, with each stage enhancing happiness and reducing hunger. Upon reaching level 50, your pet matures into its adult form, and you receive a reward in tokens for this achievement. Beasty Buddies offers a fun introduction to advanced Solidity concepts, prepare for an exciting journey of nurturing and evolving your pet in the fantastic world of Beasty Buddies!',
    thumbnail: BeastyBuddiesImage,
    link: 'https://beasty-buddies-w8g5.vercel.app/'
    },
  {
    id: 2,
    title: 'Game 2',
    description: 'This is game 2',
    thumbnail: 'https://source.unsplash.com/random/450x200?gaming',
    link: 'https://link-to-game2.com'
  },
  {
    id: 3,
    title: 'Game 3',
    description: 'This is game 3',
    thumbnail: 'https://source.unsplash.com/random/450x200?mandlebulb',
    link: 'https://beasty-buddies-w8g5.vercel.app/'
    },
  {
    id: 4,
    title: 'Game 4',
    description: 'This is game 2',
    thumbnail: 'https://source.unsplash.com/random/450x200?videogame',
    link: 'https://link-to-game2.com'
  },
  // More games can be added here
];

const GamingHub = () => {
  return (
    <div className="gaming-hub">
      <h1>Gaming Hub</h1>
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
