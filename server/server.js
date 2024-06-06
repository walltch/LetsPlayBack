import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import words from './data.json' assert { type: 'json' };

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware to set CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

io.on('connection', (socket) => {
  console.log('Nouvelle connexion');

  socket.on('fetchRandomWords', () => {
    const randomIndex = Math.floor(Math.random() * words.length);
    const randomWord = words[randomIndex];
    socket.emit('randomWords', randomWord);
  });

  socket.on('disconnect', () => {
    console.log('Déconnexion');
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
