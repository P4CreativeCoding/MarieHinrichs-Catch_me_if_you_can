module.exports = (io) => {
  const players = [];
  let tagger = null;

  io.on("connection", (socket) => {
    console.log("Neue Verbindung hergestellt:", socket.id);

    const player = {
      id: socket.id,
      x: Math.random() * 800,
      y: Math.random() * 600,
      color: "#" + ((Math.random() * 0xffffff) << 0).toString(16),
    };
    players.push(player);

    socket.emit("init", { players, tagger });

    socket.on("move", (movement) => {
      const { x, y } = movement;
      player.x += x; // Anstatt die Position zu ersetzen, füge die Bewegung zur aktuellen Position hinzu
      player.y += y;
      io.emit("update", player);
    });

    socket.on("disconnect", () => {
      const index = players.findIndex((p) => p.id === socket.id);
      if (index !== -1) {
        players.splice(index, 1);
        io.emit("playerDisconnected", socket.id);
        if (tagger === socket.id) {
          tagger = null;
        }
      }
    });

    if (players.length >= 2 && !tagger) {
      tagger = players[Math.floor(Math.random() * players.length)].id;
      io.emit("taggerSelected", tagger);
    }
  });
};
