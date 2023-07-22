import React, { useState } from 'react';
import styled from 'styled-components';

import feelgood from '../../assets/feelgood.mp3'
const PlayerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f2f2f2;
  padding: 15px;
  border-radius: 10px;
  width: 300px;
  box-shadow: 0px 3px 15px rgba(0,0,0,0.2);
  height:50px;
  background-color: linear-gradient(to right, #2b5876, #4e4376);

`;

const SongSelect = styled.select`
  padding: 5px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
`;

const AudioControl = styled.audio`
  width: 200px;
  height:40px;


`;


const MusicPlayer = () => {
  const songs = [
   
    { name: 'Why We Lose', url: feelgood }, // Added local song
    // Add more songs here...
  ];

  const [currentSong, setCurrentSong] = useState(songs[0].url);

  const handleSongChange = (e) => {
    setCurrentSong(e.target.value);
  }

  return (
    <PlayerWrapper>
      <SongSelect onChange={handleSongChange}>
        {songs.map((song, index) => (
          <option key={index} value={song.url}>{song.name}</option>
        ))}
      </SongSelect>

      <AudioControl key={currentSong} controls>
  <source src={currentSong} type="audio/mpeg" />
  Your browser does not support the audio element.
</AudioControl>

    </PlayerWrapper>
  );
};

export default MusicPlayer;