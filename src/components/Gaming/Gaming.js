// Importing necessary libraries and dependencies
import React, { useState } from 'react';
import '../../components/Gaming/gaminghub.css';
import ReactPlayer from 'react-player'; // For video trailers
import StarRatings from 'react-star-ratings'; // For star ratings
import BeastyBuddiesImage from '../../assets/BABY (33).png'; // Correct path depending on the location of the image

const games = [
  {
    id: 1,
    title: 'Beasty Buddies',
    description: 'Dive into the realm of Beasty Buddies...',
    thumbnail: BeastyBuddiesImage,
    trailerLink: 'https://www.youtube.com/watch?v=nS8kLjC57oE', // replace with actual trailer link
    link: 'https://beasty-buddies-w8g5.vercel.app/',
    category: 'Evolution/Battle',
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
    .filter(game => game.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (category === 'All' || game.category === category))
    .sort((a, b) => a[sortKey] > b[sortKey] ? 1 : -1);

  return (
    <div className="gaming-hub">
      <h1>Gaming Hub</h1>

      <input 
        type="text" 
        placeholder="Search for a game..." 
        value={searchTerm} 
        onChange={handleSearch}
      />

      <select onChange={handleSort}>
        <option value='title'>Alphabetical</option>
        <option value='releaseDate'>Release Date</option>
        <option value='rating'>Rating</option>
      </select>

      <select onChange={handleCategory}>
        <option value='All'>All Categories</option>
        <option value='RPG'>RPG</option>
        <option value='Shooter'>Shooter</option>
        <option value='Strategy'>Strategy</option>
        {/* More categories */}
      </select>

      <div className="game-list">
        {sortedAndFilteredGames.map(game => (
          <div key={game.id} className="game-card">
            <img src={game.thumbnail} alt={game.title} />
            <h2>{game.title}</h2>
            <p>{game.description}</p>

            <ReactPlayer url={game.trailerLink} width='100%' height='200px' />

            <StarRatings
              rating={game.rating}
              starRatedColor="gold"
              numberOfStars={5}
              name='rating'
              starDimension="20px"
              starSpacing="2px"
            />

            <p>Category: {game.category}</p>
            <p>Release Date: {game.releaseDate}</p>
            {game.isAvailable ? 
              (<a href={game.link} target="_blank" rel="noopener noreferrer">Play Now</a>) : 
              (<span>Coming Soon</span>)
            }
          </div>
        ))}
      </div>
    </div>
  );
}

export default GamingHub;
