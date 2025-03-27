// components/Game.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

const Game = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomCode, username, players } = location.state || {};

  const [currentSinger, setCurrentSinger] = useState('');
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute countdown
  const [isSinging, setIsSinging] = useState(false);
  const audioRef = useRef(null); // For audio streaming

  // Start the game and assign the first singer
  useEffect(() => {
    if (roomCode) {
      socket.emit('startGame', roomCode);
    }
  }, [roomCode]);

  // Listen for the current singer
  useEffect(() => {
    socket.on('newSinger', (singer) => {
      setCurrentSinger(singer);
      setIsSinging(singer === username); // Check if it's the current user's turn
      setTimeLeft(60); // Reset the timer
    });

    return () => {
      socket.off('newSinger');
    };
  }, [username]);

  // Countdown timer
  useEffect(() => {
    if (isSinging && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      // Move to the next singer
      socket.emit('nextSinger', roomCode);
    }
  }, [isSinging, timeLeft, roomCode]);

  // Real-time audio streaming (basic setup)
  useEffect(() => {
    if (isSinging) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          if (audioRef.current) {
            audioRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error('Error accessing microphone:', err);
        });
    }
  }, [isSinging]);

  // Styles
  const styles = {
    container: {
      background: '#1a1a1a',
      minHeight: '100vh',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
    },
    countdown: {
      fontSize: '3rem',
      color: '#ff8c42',
      marginBottom: '2rem',
    },
    lyricsBox: {
      background: '#333',
      padding: '2rem',
      borderRadius: '10px',
      width: '80%',
      maxWidth: '600px',
      textAlign: 'center',
      marginBottom: '2rem',
    },
    lyricsText: {
      fontSize: '1.5rem',
      marginBottom: '1rem',
    },
    button: {
      padding: '0.5rem 1rem',
      borderRadius: '5px',
      border: 'none',
      background: '#ff8c42',
      color: '#fff',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.countdown}>{timeLeft}</h1>
      <div style={styles.lyricsBox}>
        <p style={styles.lyricsText}>Lyrics will appear here...</p>
        <button style={styles.button}>Play/Pause</button>
      </div>
      <audio ref={audioRef} autoPlay muted={!isSinging} />
      <p>Current Singer: {currentSinger}</p>
    </div>
  );
};

export default Game;