// components/Join.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

const Join = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isWaiting, setIsWaiting] = useState(false); // Track if waiting for host to start

  const handleJoinRoom = () => {
    if (username && roomCode) {
      socket.emit('joinRoom', roomCode, username);
      setIsWaiting(true); // Show waiting screen
    }
  };

  const handleLeaveGame = () => {
    socket.emit('leaveRoom', roomCode, username);
    navigate('/'); // Redirect to home page
  };

  // Listen for game start event
  useEffect(() => {
    socket.on('gameStarted', () => {
      navigate('/game', {
        state: {
          roomCode,
          username,
        },
      });
    });

    return () => {
      socket.off('gameStarted');
    };
  }, [navigate, roomCode, username]);

  // Styles
  const styles = {
    container: {
      background: '#1a1a1a',
      minHeight: '100vh',
      color: '#fff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif',
    },
    form: {
      background: '#333',
      padding: '2rem',
      borderRadius: '10px',
      textAlign: 'center',
    },
    input: {
      padding: '0.5rem',
      margin: '0.5rem 0',
      width: '100%',
      borderRadius: '5px',
      border: 'none',
    },
    button: {
      padding: '0.5rem 1rem',
      margin: '0.5rem',
      borderRadius: '5px',
      border: 'none',
      background: '#ff8c42',
      color: '#fff',
      cursor: 'pointer',
    },
    waitingScreen: {
      textAlign: 'center',
    },
  };

  return (
    <div style={styles.container}>
      {!isWaiting ? (
        <div style={styles.form}>
          <h2>Join Room</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleJoinRoom} style={styles.button}>
            Join
          </button>
          <button onClick={() => navigate('/')} style={styles.button}>
            Back
          </button>
        </div>
      ) : (
        <div style={styles.waitingScreen}>
          <h2>Waiting for host to start the game...</h2>
          <button onClick={handleLeaveGame} style={styles.button}>
            Leave Game
          </button>
        </div>
      )}
    </div>
  );
};

export default Join;