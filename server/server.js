import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import words from './data.json' assert { type: 'json' };

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Nouvelle connexion');

  socket.on('fetchRandomWords', () => {
    socket.emit('randomWords', words);
  });

  socket.on('disconnect', () => {
    console.log('Déconnexion');
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
