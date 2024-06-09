import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

app.use(cors());

let rooms = {};

const createEmptyBoard = () => {
  return Array(6).fill(null).map(() => Array(7).fill(null));
};

io.on("connection", (socket) => {
  socket.on("loginDetails", ({ pseudo, room }) => {
    if (!rooms[room]) {
      rooms[room] = {
        players: [],
        board: createEmptyBoard(),
        currentPlayer: "R",
      };
    }

    if (rooms[room].players.length < 2) {
      rooms[room].players.push({ id: socket.id, pseudo, color: rooms[room].players.length === 0 ? "red" : "yellow" });
      socket.room = room;
      socket.emit("myConnexion", pseudo, room, rooms[room].players[rooms[room].players.length - 1].color);
      socket.join(room);

      socket.broadcast.to(room).emit("newUser", socket.id, pseudo);

      if (rooms[room].players.length === 2) {
        io.in(room).emit("gameStart", rooms[room].players[0].color);
      }
    } else {
      socket.emit("roomFull", room);
    }

    if (rooms[room].players.length === 1) {
      socket.broadcast.to(room).emit("waiting", room);
    }
  });

  socket.on("sendMessage", (message) => {
    const room = socket.room;
    const sender = socket.id[0];
    socket.to(room).emit("message", { sender, message });
  });

  socket.on("playerMove", ({ rowIndex, colIndex }) => {
    const room = socket.room;
    if (rooms[room] && rooms[room].board[rowIndex][colIndex] === null) {
      const player = rooms[room].players.find(p => p.id === socket.id);
      if (player) {
        rooms[room].board[rowIndex][colIndex] = player.color;
        rooms[room].currentPlayer = player.color === "red" ? "yellow" : "red";
        io.in(room).emit("moveMade", { board: rooms[room].board, player: rooms[room].currentPlayer });
      }
    }
  });

  socket.on("disconnect", () => {
    for (const room in rooms) {
      rooms[room].players = rooms[room].players.filter((user) => user.id !== socket.id);
      if (rooms[room].players.length === 0) {
        delete rooms[room];
      }
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});