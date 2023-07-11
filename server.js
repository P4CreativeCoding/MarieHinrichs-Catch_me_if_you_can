const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;
const PASSWORD = process.env.PASSWORD;

const GAME_WIDTH = 780;
const GAME_HEIGHT = 580;

function getRandomPosition() {
  const position = {
    x: Math.floor(Math.random() * GAME_WIDTH),
    y: Math.floor(Math.random() * GAME_HEIGHT),
  };
  return position;
}

function createWaldo() {
  return getRandomPosition();
}

app.use(express.static(__dirname + "/public"));
app.use(express.json());

app.post("/login", function (req, res) {
  const { password } = req.body;

  if (password === PASSWORD) {
    res.status(200).json({ message: "Login erfolgreich" });
  } else {
    res.status(401).json({ message: "Ungültige Anmeldeinformationen" });
  }
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("waldoFound", (playerId) => {
    io.emit("waldoFound", playerId);
  });

  socket.on("waldoReset", () => {
    const newWaldoPosition = createWaldo();
    io.emit("waldoMoved", newWaldoPosition);
  });

  const waldoPosition = createWaldo();
  socket.emit("waldoMoved", waldoPosition);

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
