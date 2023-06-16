import React, { useState } from 'react';
import AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { FaPlay, FaPause, FaSpinner } from 'react-icons/fa';
import song1 from '../../assets/song1.mp3';
import song1Cover from '../../assets/logo.png';
import '../../components/Music/Music.css';

const songs = [
  {
    name: 'Song 1',
    src: song1,
    cover: song1Cover,
  },
  // other songs here
];

export default function MusicPlayer() {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleSongChange = (index) => {
    setCurrentSongIndex(index);
  };

  return (
    <div className="music-player-container">
      <h2>Now Playing: {songs[currentSongIndex].name}</h2>
      <img src={songs[currentSongIndex].cover} alt={songs[currentSongIndex].name} className="cover-art" />
      <div className="song-list">
        {songs.map((song, index) => (
          <div key={index} className={`song-item ${index === currentSongIndex ? 'active' : ''}`} onClick={() => handleSongChange(index)}>
            {song.name}
          </div>
        ))}
      </div>
      <div className="audio-player">
        <AudioPlayer
          autoPlayAfterSrcChange={false}
          src={songs[currentSongIndex].src}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          customProgressBarSection={[RHAP_UI.PROGRESS_BAR]}
          customControlsSection={[
            RHAP_UI.MAIN_CONTROLS,
            <div className="rhap_time">
              <div className="rhap_current-time">{isLoading ? 'Loading...' : <span>{new Date().toISOString().substr(14, 5)}</span>}</div>
              <div className="rhap_duration">{isLoading ? 'Loading...' : <span>{new Date().toISOString().substr(14, 5)}</span>}</div>
            </div>,
            RHAP_UI.VOLUME_CONTROLS
          ]}
          customIcons={{
            play: isPlaying ? <FaPause /> : <FaPlay />,
            loading: <FaSpinner />
          }}
          onCanPlay={() => setIsLoading(false)}
          onAbort={() => setIsLoading(true)}
        />
      </div>
    </div>
  );
}

