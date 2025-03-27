// components/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const styles = {
    container: {
      background: 'linear-gradient(135deg, #1a1a1a 25%, transparent 25%) -10px 0/ 20px 20px, linear-gradient(225deg, #1a1a1a 25%, transparent 25%) -10px 0/ 20px 20px, linear-gradient(315deg, #1a1a1a 25%, transparent 25%) 0px 0/ 20px 20px, linear-gradient(45deg, #1a1a1a 25%, #000000 25%) 0px 0/ 20px 20px',
      minHeight: '100vh',
      color: '#fff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif',
    },
    home: {
      textAlign: 'center',
    },
    title: {
      fontSize: '3rem',
      color: '#ff8c42',
      marginBottom: '2rem',
    },
    cardContainer: {
      display: 'flex',
      gap: '2rem',
    },
    card: {
      background: '#333',
      padding: '2rem',
      borderRadius: '10px',
      width: '200px',
      cursor: 'pointer',
      transition: 'transform 0.3s ease',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.home}>
        <h1 style={styles.title}>Karaoke Night</h1>
        <div style={styles.cardContainer}>
          <div
            style={styles.card}
            onClick={() => navigate('/join')}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <h2>Join Room</h2>
            <p>Enter a room code to join an existing game.</p>
          </div>
          <div
            style={styles.card}
            onClick={() => navigate('/create')}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <h2>Create Room</h2>
            <p>Start a new game and invite your friends.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;