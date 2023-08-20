import React, { useState } from 'react';
import styled from 'styled-components';

import feelgood from '../../assets/feelgood.mp3'
const PlayerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f2f2f2;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.2);
  background-color: linear-gradient(to right, #2b5876, #4e4376);
  width: 100%;

  @media (min-width: 768px) {
    /* Adjust styles for tablets and larger screens */
    width: 350px;
    padding: 15px;
  }
`;
const SongSelect = styled.select`
  padding: 5px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
`;

const AudioControl = styled.audio`
  width: 100%;
  height:40px;


`;


const MusicPlayer = () => {
  const songs = [
   
    { name: 'CloZee - Microworlds', url: feelgood }, // Added local song
    // Add more songs here...
  ];

  const [currentSong, setCurrentSong] = useState(songs[0].url);

  const handleSongChange = (e) => {
    setCurrentSong(e.target.value);
  };

  return (
    <PlayerWrapper>
      <SongSelect onChange={handleSongChange}>
        {songs.map((song, index) => (
          <option key={index} value={song.url}>
            {song.name}
          </option>
        ))}
      </SongSelect>

      <AudioControl key={currentSong} controls controlsList="nodownload">
        <source src={currentSong} type="audio/mpeg" />
        Your browser does not support the audio element.
      </AudioControl>
    </PlayerWrapper>
  );
};

export default MusicPlayer;