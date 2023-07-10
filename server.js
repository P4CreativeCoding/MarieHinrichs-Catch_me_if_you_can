const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Statische Dateien bereitstellen
app.use(express.static(__dirname + "/public"));

const PORT = 3000;
const MAX_PLAYERS = 20;

app.use(express.static(__dirname + "/public"));
app.use(express.json()); // Middleware zum Parsen des Anfragekörpers als JSON

let players = [];
let squares = [];

function getRandomPosition() {
  const position = {
    x: Math.floor(Math.random() * 760) + 20,
    y: Math.floor(Math.random() * 560) + 20,
  };
  return position;
}

function createSquare() {
  const square = {
    id: squares.length + 1,
    position: getRandomPosition(),
  };
  squares.push(square);
  return square;
}

function removeSquare(squareId) {
  squares = squares.filter((square) => square.id !== squareId);
}

app.post("/login", function (req, res) {
  const { password } = req.body;

  if (password === process.env.VALID_PASSWORD) {
    res.status(200).json({ message: "Login erfolgreich" });
  } else {
    res.status(401).json({ message: "Ungültige Anmeldeinformationen" });
  }
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join", () => {
    if (players.length < MAX_PLAYERS) {
      const player = {
        id: socket.id,
        position: getRandomPosition(),
      };

      players.push(player);
      socket.emit("playerData", players);
      socket.broadcast.emit("playerJoined", player);

      if (squares.length === 0) {
        const square = createSquare();
        io.emit("squareCreated", square);
      }
    } else {
      socket.emit("gameFull");
    }
  });

  socket.on("move", (movement) => {
    const player = players.find((p) => p.id === socket.id);
    if (player) {
      const newX = player.position.x + movement.x;
      const newY = player.position.y + movement.y;
      if (newX >= 0 && newX <= 780 && newY >= 0 && newY <= 580) {
        player.position.x = newX;
        player.position.y = newY;
        io.emit("playerMoved", player);
      }
    }
  });

  socket.on("squareEaten", (playerId) => {
    const player = players.find((p) => p.id === playerId);
    if (player) {
      const square = squares.find(
        (square) =>
          square.position.x === player.position.x &&
          square.position.y === player.position.y
      );

      if (square) {
        removeSquare(square.id);
        io.emit("squareEaten", playerId);
        const newSquare = createSquare();
        io.emit("squareCreated", newSquare);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    players = players.filter((p) => p.id !== socket.id);
    io.emit("playerLeft", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
