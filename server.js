// server.js
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = 3000;
const MAX_PLAYERS = 20;

app.use(express.static(__dirname + "/public"));
app.use(express.json()); // Middleware zum Parsen des Anfragekörpers als JSON

let players = [];
let catchers = [];

function getRandomColor() {
  const colors = ["red", "blue", "green", "yellow", "orange", "purple"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function selectCatchers() {
  if (players.length >= 2 && catchers.length < Math.ceil(players.length / 2)) {
    const availablePlayers = players.filter(
      (player) => !catchers.includes(player.id)
    );
    const randomIndex = Math.floor(Math.random() * availablePlayers.length);
    const selectedPlayer = availablePlayers[randomIndex];
    catchers.push(selectedPlayer.id);
    io.emit("catcherSelected", selectedPlayer.id);
  } else if (players.length < 2 && catchers.length > 0) {
    catchers = [];
    io.emit("catcherLeft");
  }
}

function checkCollision() {
  catchers.forEach((catcherId) => {
    const catcherPlayer = players.find((player) => player.id === catcherId);
    if (catcherPlayer) {
      players.forEach((player) => {
        if (
          player.id !== catcherPlayer.id &&
          arePointsColliding(catcherPlayer.position, player.position)
        ) {
          catchers.push(player.id);
          io.emit("catcherSelected", player.id);
        }
      });
    }
  });
}

function arePointsColliding(point1, point2) {
  const distance = Math.sqrt(
    (point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2
  );
  return distance <= 20; // Adjust the collision radius as needed
}

// Login-Routen
app.post("/login", function (req, res) {
  // Benutzername und Passwort aus dem Anfragekörper erhalten
  const { username, password } = req.body;

  // Überprüfen, ob Benutzername und Passwort korrekt sind
  if (
    username === process.env.VALID_USERNAME &&
    password === process.env.VALID_PASSWORD
  ) {
    // Erfolgreiche Authentifizierung
    res.status(200).json({ message: "Login erfolgreich" });
  } else {
    // Fehlgeschlagene Authentifizierung
    res.status(401).json({ message: "Ungültige Anmeldeinformationen" });
  }
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join", (playerName) => {
    if (players.length < MAX_PLAYERS) {
      const player = {
        id: socket.id,
        name: playerName.slice(0, 6), // Begrenze den Spielernamen auf maximal 6 Zeichen
        position: {
          x: Math.floor(Math.random() * 760) + 20,
          y: Math.floor(Math.random() * 560) + 20,
        },
        color: getRandomColor(),
      };

      players.push(player);
      socket.emit("playerData", player);
      io.emit("playerJoined", players, catchers);
      selectCatchers();
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
        checkCollision(); // Überprüfe Kollision nach jedem Spielerbewegung
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    players = players.filter((p) => p.id !== socket.id);

    if (catchers.includes(socket.id)) {
      catchers = catchers.filter((id) => id !== socket.id);
      io.emit("catcherLeft");
    }

    io.emit("playerLeft", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
