// Importing necessary libraries and dependencies
import React, { useState } from 'react';
import '../../components/Gaming/gaminghub.css';
import ReactPlayer from 'react-player'; // For video trailers
import StarRatings from 'react-star-ratings'; // For star ratings
import BeastyBuddiesImage from '../../assets/BABY (33).png'; // Correct path depending on the location of the image
import kids from '../../assets/kids.png'
const games = [
  {
    id: 1,
    title: 'Beasty Buddies',
    description: 'Welcome to the enchanting world of Beasty Buddies, where you can own and care for adorable pets known as Beasty Buddies in the form of non-fungible tokens (NFTs). Interact with your virtual pets, level them up, and watch them evolve into powerful creatures! Engage in thrilling battles in the Beasty Buddies Battle Arena, unleash elemental powers, collect epic items, and become a legendary Beasty Buddy trainer! Experience true ownership of your Beasty Buddies as unique NFTs on the blockchain. The ultimate evolutionary pet adventure awaits your arrival! 💫',
    thumbnail: BeastyBuddiesImage,
    trailerLink: '', // replace with actual trailer link
    link: 'https://beasty-buddies-w8g5.vercel.app/',
    category: 'Evolution/Battle',
    releaseDate: 'No release Date yet',
    rating: 4.5,
    isAvailable: false,
  },

  {
    id: 2,
    title: 'ColorStar Adventures: A Color-Matching Journey for Children Superstars! 🌈🌟',
    description: 'Welcome to the Colorful Adventure - Just for Children Superstars! 🌈 Are you ready for a super-fun game designed especially for awesome Children 5 and under to teach about blockchain technology? 🎨 Choose your favorite color from the rainbow and lets match colors together! Can you make a perfect match? Youre a color-matching genius! 🌟 Collect shiny stars! The more stars you get, the more surprises youll discover! 🏆 Score points like a champion and be the color-matching hero on our special scoreboard! 🎁 Visit the toy shop with your stars and get cute animals, fast cars, and more fantastic toys to play with! 👉 Join the fun and become part of our fantastic team! Lets have a colorful blast together! 🚀 Always ask your grown-up helper for permission. Lets go and have a fantastic time! 🎉',
    thumbnail: kids,
    trailerLink: '', // replace with actual trailer link
    link: 'https://beasty-buddies-w8g5.vercel.app/',
    category: 'Childrens Blockchain Game',
    releaseDate: 'No release Date yet',
    rating: 4.5,
    isAvailable: false,
  },
  //...more games
];

const GamingHub = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('title');
  const [category, setCategory] = useState('All');

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (event) => {
    setSortKey(event.target.value);
  };

  const handleCategory = (event) => {
    setCategory(event.target.value);
  };

  const sortedAndFilteredGames = games
    .filter(
      (game) =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (category === 'All' || game.category.includes(category))
    )
    .sort((a, b) => (a[sortKey] > b[sortKey] ? 1 : -1));

  return (
    <div className="gaming-hub">
      <h1>Gaming Hub</h1>

      <input
        type="text"
        placeholder="Search for a game..."
        value={searchTerm}
        onChange={handleSearch}
      />

      <select value={sortKey} onChange={handleSort}>
        <option value="title">Alphabetical</option>
        <option value="releaseDate">Release Date</option>
        <option value="rating">Rating</option>
      </select>

      <select value={category} onChange={handleCategory}>
        <option value="All">All Categories</option>
        <option value="Battle">Battle</option>
        <option value="Childrens">Childrens</option>
        <option value="Strategy">Strategy</option>
        {/* Add more categories here */}
      </select>

      <div className="game-list">
        {sortedAndFilteredGames.map((game) => (
          <div key={game.id} className="game-card">
            <img src={game.thumbnail} alt={game.title} />
            <h2>{game.title}</h2>
            <p>{game.description}</p>

            {game.trailerLink && (
              <ReactPlayer url={game.trailerLink} width="100%" height="200px" />
            )}

            <StarRatings
              rating={game.rating}
              starRatedColor="gold"
              numberOfStars={5}
              name="rating"
              starDimension="20px"
              starSpacing="2px"
            />

            <p>Category: {game.category}</p>
            <p>Release Date: {game.releaseDate}</p>
            {game.isAvailable ? (
              <a href={game.link} target="_blank" rel="noopener noreferrer">
                Play Now
              </a>
            ) : (
              <span>Coming Soon</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamingHub;