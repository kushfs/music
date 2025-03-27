// RoomPage.js
import React, { useState, useEffect } from 'react';

const RoomPage = ({ roomCode, username, socket, startGame }) => {
  const [players, setPlayers] = useState([]);
  const [settings, setSettings] = useState({ genre: '', language: '' });
  const isHost = players[0]?.username === username;

  useEffect(() => {
    socket.on('playerJoined', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on('settingsUpdated', (updatedSettings) => {
      setSettings(updatedSettings);
    });

    return () => {
      socket.off('playerJoined');
      socket.off('settingsUpdated');
    };
  }, [socket]);

  const handleUpdateSettings = () => {
    socket.emit('updateSettings', roomCode, settings);
  };

  return (
    <div>
      <h2>Room Code: {roomCode}</h2>
      <h3>Players:</h3>
      <ul>
        {players.map((player, index) => (
          <li key={index}>{player.username}</li>
        ))}
      </ul>

      {isHost && (
        <div>
          <h3>Settings</h3>
          <select
            value={settings.genre}
            onChange={(e) => setSettings({ ...settings, genre: e.target.value })}
          >
            <option value="">Select Genre</option>
            <option value="pop">Pop</option>
            <option value="rock">Rock</option>
            <option value="hiphop">Hip Hop</option>
          </select>
          <select
            value={settings.language}
            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
          >
            <option value="">Select Language</option>
            <option value="english">English</option>
            <option value="spanish">Spanish</option>
            <option value="hindi">Hindi</option>
          </select>
          <button onClick={handleUpdateSettings}>Update Settings</button>
          <button onClick={startGame}>Start Game</button>
        </div>
      )}
    </div>
  );
};

export default RoomPage;