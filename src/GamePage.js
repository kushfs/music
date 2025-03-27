// GamePage.js
import React, { useState, useEffect } from 'react';

const GamePage = ({ roomCode, username, socket, endGame }) => {
  const [players, setPlayers] = useState([]);
  const [currentSinger, setCurrentSinger] = useState('');
  const [rating, setRating] = useState(0);

  useEffect(() => {
    socket.on('scoreUpdated', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on('newSinger', (singer) => {
      setCurrentSinger(singer);
    });

    return () => {
      socket.off('scoreUpdated');
      socket.off('newSinger');
    };
  }, [socket]);

  const handleSubmitRating = () => {
    if (rating > 0 && currentSinger) {
      socket.emit('submitRating', roomCode, currentSinger, rating);
      setRating(0); // Reset rating
    }
  };

  return (
    <div>
      <h2>Room Code: {roomCode}</h2>
      <h3>Current Singer: {currentSinger}</h3>
      <h3>Players:</h3>
      <ul>
        {players.map((player, index) => (
          <li key={index}>
            {player.username} - {player.score} points
          </li>
        ))}
      </ul>

      {username !== currentSinger && (
        <div>
          <h3>Rate {currentSinger}</h3>
          <input
            type="number"
            min="1"
            max="10"
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
          />
          <button onClick={handleSubmitRating}>Submit Rating</button>
        </div>
      )}

      <button onClick={endGame}>End Game</button>
    </div>
  );
};

export default GamePage;