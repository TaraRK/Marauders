const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Frontend URL
    methods: ["GET", "POST"]
  }
});

// In-memory storage for user locations
let userLocations = {};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle user joining with a username
  socket.on('join', (username) => {
    socket.username = username;
    userLocations[socket.id] = { username, coords: null };
    io.emit('updateLocations', userLocations);
  });

  // Handle location updates
  socket.on('locationUpdate', (coords) => {
    if (userLocations[socket.id]) {
      userLocations[socket.id].coords = coords;
      io.emit('updateLocations', userLocations);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    delete userLocations[socket.id];
    io.emit('updateLocations', userLocations);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
