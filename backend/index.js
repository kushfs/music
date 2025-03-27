const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); // Enable CORS for frontend-backend communication

const app = express();
app.use(cors()); // Enable CORS
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Allow frontend to connect
    methods: ['GET', 'POST'],
  },
});

const rooms = {};

io.on('connection', (socket) => {
  console.log('a user connected');

  // Create a room
  socket.on('createRoom', (username) => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    rooms[roomCode] = {
      host: username,
      players: [{ username, score: 0 }],
      settings: { genre: '', language: '', playerLimit: 4 },
      currentSingerIndex: 0, // Track the current singer
      gameStarted: false, // Track if the game has started
    };
    socket.join(roomCode);
    socket.emit('roomCreated', roomCode);
    console.log(`Room created: ${roomCode} by ${username}`);
  });

  // Join a room
  socket.on('joinRoom', (roomCode, username) => {
    if (rooms[roomCode]) {
      if (rooms[roomCode].players.length >= rooms[roomCode].settings.playerLimit) {
        socket.emit('roomFull'); // Notify if the room is full
        return;
      }
      rooms[roomCode].players.push({ username, score: 0 });
      socket.join(roomCode);
      io.to(roomCode).emit('playerJoined', rooms[roomCode].players);
      console.log(`${username} joined room: ${roomCode}`);
    } else {
      socket.emit('invalidRoom'); // Notify if the room doesn't exist
    }
  });

  socket.on('joinRoom', (roomCode, username) => {
    if (rooms[roomCode]) {
      if (rooms[roomCode].players.length >= rooms[roomCode].settings.playerLimit) {
        socket.emit('roomFull'); // Notify if the room is full
        return;
      }
      rooms[roomCode].players.push({ username, score: 0 });
      socket.join(roomCode);
      io.to(roomCode).emit('playerJoined', rooms[roomCode].players); // Emit updated player list
      console.log(`${username} joined room: ${roomCode}`);
    } else {
      socket.emit('invalidRoom'); // Notify if the room doesn't exist
    }
  });

  // Update settings (genre, language, player limit)
  socket.on('updateSettings', (roomCode, settings) => {
    if (rooms[roomCode]) {
      rooms[roomCode].settings = settings;
      io.to(roomCode).emit('settingsUpdated', settings);
      console.log(`Settings updated for room: ${roomCode}`);
    }
  });

  // Start the game
  socket.on('startGame', (roomCode) => {
    if (rooms[roomCode]) {
      const room = rooms[roomCode];
      room.gameStarted = true;
      const firstSinger = room.players[room.currentSingerIndex].username;
      io.to(roomCode).emit('gameStarted', firstSinger);
      console.log(`Game started in room: ${roomCode}`);
    }
  });
  
  // Handle ratings
  socket.on('submitRating', (roomCode, username, rating) => {
    if (rooms[roomCode]) {
      const player = rooms[roomCode].players.find((p) => p.username === username);
      if (player) {
        player.score += rating;
        io.to(roomCode).emit('scoreUpdated', rooms[roomCode].players);
        console.log(`${username} received a rating of ${rating}`);
      }
    }
  });

  // Move to the next singer
  socket.on('nextSinger', (roomCode) => {
    if (rooms[roomCode]) {
      const room = rooms[roomCode];
      room.currentSingerIndex = (room.currentSingerIndex + 1) % room.players.length; // Loop through players
      const nextSinger = room.players[room.currentSingerIndex].username;
      io.to(roomCode).emit('newSinger', nextSinger);
      console.log(`Next singer in room ${roomCode}: ${nextSinger}`);
    }
  });

  // Remove a player (host-only)
 // backend/index.js
socket.on('removePlayer', (roomCode, playerUsername) => {
    if (rooms[roomCode]) {
      // Find the socket ID of the player to be removed
      const playerSocket = Object.keys(io.sockets.sockets).find(
        (socketId) => io.sockets.sockets[socketId].username === playerUsername
      );
  
      if (playerSocket) {
        // Emit a 'playerKicked' event to the removed player
        io.to(playerSocket).emit('playerKicked', 'You have been removed from the room by the host.');
  
        // Remove the player from the room
        rooms[roomCode].players = rooms[roomCode].players.filter(
          (player) => player.username !== playerUsername
        );
  
        // Notify all players in the room about the updated player list
        io.to(roomCode).emit('playerRemoved', rooms[roomCode].players);
        console.log(`Player removed: ${playerUsername} from room: ${roomCode}`);
      }
    }
  });

  // End game and declare winner
  socket.on('endGame', (roomCode) => {
    if (rooms[roomCode]) {
      const winner = rooms[roomCode].players.reduce((prev, current) =>
        prev.score > current.score ? prev : current
      );
      io.to(roomCode).emit('gameEnded', winner);
      console.log(`Game ended in room ${roomCode}. Winner: ${winner.username}`);
      delete rooms[roomCode]; // Clean up room
    }
  });

  // Handle player disconnection
  socket.on('disconnect', () => {
    console.log('user disconnected');
    // Optional: Handle player leaving the room
  });
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});