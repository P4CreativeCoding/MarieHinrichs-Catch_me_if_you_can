const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = 3000;
const MAX_PLAYERS = 3;

app.use(express.static(__dirname + "/public"));

let players = [];
let catcher = null;

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join", () => {
    if (players.length < MAX_PLAYERS) {
      const player = {
        id: socket.id,
        isCatcher: false,
        position: {
          x: Math.floor(Math.random() * 800),
          y: Math.floor(Math.random() * 600),
        },
      };

      players.push(player);
      socket.emit("playerData", player);

      if (players.length === MAX_PLAYERS && catcher === null) {
        // Wähle einen zufälligen Spieler als Fänger aus
        const randomIndex = Math.floor(Math.random() * players.length);
        players[randomIndex].isCatcher = true;
        catcher = players[randomIndex].id;
        io.emit("catcherSelected", catcher);
      }

      io.emit("playerJoined", players);
    } else {
      socket.emit("gameFull");
    }
  });

  socket.on("playerMoved", (position) => {
    const player = players.find((p) => p.id === socket.id);
    if (player) {
      player.position = position;
      io.emit("playerMoved", player);
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
