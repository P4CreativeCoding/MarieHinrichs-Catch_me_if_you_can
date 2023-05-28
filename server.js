const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3000;

const game = require("./public/app.js");
game(io);

app.use(express.static(__dirname + "/public"));

server.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
