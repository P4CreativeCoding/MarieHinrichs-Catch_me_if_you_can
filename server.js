// server.js
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = 3000;
const MAX_PLAYERS = 20; // Ändere die maximale Spielerzahl

app.use(express.static(__dirname + "/public"));

let players = [];
let catcher = null;

function getRandomColor() {
  const colors = ["red", "blue", "green", "yellow", "orange", "purple"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function selectCatcher() {
  if (players.length >= 2 && catcher === null) {
    const randomIndex = Math.floor(Math.random() * players.length);
    catcher = players[randomIndex].id;
    io.emit("catcherSelected", catcher);
  } else if (players.length < 2 && catcher !== null) {
    players.forEach((player) => {
      if (player.id === catcher) {
        catcher = null;
        io.emit("catcherLeft");
      }
    });
  }
}

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join", () => {
    if (players.length < MAX_PLAYERS) {
      const player = {
        id: socket.id,
        isCatcher: false,
        position: {
          x: Math.floor(Math.random() * 760) + 20, // Begrenze die Position auf das Spielfeld
          y: Math.floor(Math.random() * 560) + 20,
        },
        color: getRandomColor(),
      };

      players.push(player);
      socket.emit("playerData", player);
      io.emit("playerJoined", players);
      selectCatcher(); // Überprüfe, ob ein Fänger ausgewählt werden kann
    } else {
      socket.emit("gameFull");
    }
  });

  socket.on("move", (movement) => {
    const player = players.find((p) => p.id === socket.id);
    if (player) {
      const newX = player.position.x + movement.x;
      const newY = player.position.y + movement.y;
      // Überprüfe, ob die neue Position innerhalb des Spielfelds liegt
      if (newX >= 20 && newX <= 780 && newY >= 20 && newY <= 580) {
        player.position.x = newX;
        player.position.y = newY;
        io.emit("playerMoved", player);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    players = players.filter((p) => p.id !== socket.id);

    if (catcher === socket.id) {
      catcher = null;
      io.emit("catcherLeft");
    }

    io.emit("playerLeft", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
