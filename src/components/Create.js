// components/Create.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

const Create = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [settings, setSettings] = useState({
    genre: '',
    language: '',
    playerLimit: 4,
  });
  const [isHost, setIsHost] = useState(false); // Track if the current user is the host

  // Handle room creation
  const handleCreateRoom = () => {
    if (username) {
      socket.emit('createRoom', username);
      setIsHost(true); // Set the current user as the host
      socket.on('roomCreated', (code) => {
        setRoomCode(code);
      });
    }
  };

  // Handle starting the game
  const handleStartGame = () => {
    socket.emit('startGame', roomCode);
    navigate('/game');
  };

  // Handle ending the game
  const handleEndGame = () => {
    socket.emit('endGame', roomCode);
    navigate('/'); // Redirect to the home page
  };

  // Handle removing a player (host-only)
  const handleRemovePlayer = (playerUsername) => {
    socket.emit('removePlayer', roomCode, playerUsername);
  };

  // Listen for player updates
  useEffect(() => {
    socket.on('playerJoined', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on('playerRemoved', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    // Listen for 'playerKicked' event
    socket.on('playerKicked', (message) => {
      alert(message); // Notify the player
      navigate('/'); // Redirect to the home page
    });

    return () => {
      socket.off('playerJoined');
      socket.off('playerRemoved');
      socket.off('playerKicked');
    };
  }, [navigate]);

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
      width: '400px',
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
    playerBox: {
      background: '#444',
      padding: '1rem',
      borderRadius: '5px',
      margin: '0.5rem 0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    removeButton: {
      background: '#ff4d4d',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      padding: '0.25rem 0.5rem',
      cursor: 'pointer',
    },
    hostBadge: {
      background: '#4CAF50', // Green color for host badge
      color: '#fff',
      padding: '0.25rem 0.5rem',
      borderRadius: '5px',
      fontSize: '0.8rem',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.form}>
        <h2>Create Room</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleCreateRoom} style={styles.button}>
          Create Room
        </button>
        {roomCode && (
          <div>
            <h3>Room Code: {roomCode}</h3>
            <h4>Settings</h4>
            <select
              value={settings.genre}
              onChange={(e) => setSettings({ ...settings, genre: e.target.value })}
              style={styles.input}
            >
              <option value="">Select Genre</option>
              <option value="pop">Pop</option>
              <option value="rock">Rock</option>
              <option value="hiphop">Hip Hop</option>
            </select>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              style={styles.input}
            >
              <option value="">Select Language</option>
              <option value="english">English</option>
              <option value="spanish">Spanish</option>
              <option value="hindi">Hindi</option>
            </select>
            <input
              type="number"
              placeholder="Player Limit"
              value={settings.playerLimit}
              onChange={(e) => setSettings({ ...settings, playerLimit: e.target.value })}
              style={styles.input}
            />
            <h4>Players</h4>
            {players.map((player, index) => (
              <div key={index} style={styles.playerBox}>
                <span>{player.username}</span>
                {player.username === username && isHost ? ( // Show "Host" badge for the host
                  <span style={styles.hostBadge}>Host</span>
                ) : isHost ? ( // Show remove button for other players (host-only)
                  <button
                    onClick={() => handleRemovePlayer(player.username)}
                    style={styles.removeButton}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            ))}
            <button onClick={handleStartGame} style={styles.button}>
              Start Game
            </button>
            <button onClick={handleEndGame} style={styles.button}>
              End Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Create;