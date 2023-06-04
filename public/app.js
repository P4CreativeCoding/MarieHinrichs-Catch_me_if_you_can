const socket = io();

function init() {
  const playerElement = document.getElementById("player");

  function handlePlayerMovement(event) {
    let movement = { x: 0, y: 0 };

    if (event.key === "ArrowUp") {
      movement.y = -10;
    } else if (event.key === "ArrowDown") {
      movement.y = 10;
    } else if (event.key === "ArrowLeft") {
      movement.x = -10;
    } else if (event.key === "ArrowRight") {
      movement.x = 10;
    }

    socket.emit("move", movement);
  }

  document.addEventListener("keydown", handlePlayerMovement);

  socket.on("playerData", (players) => {
    if (Array.isArray(players)) {
      players.forEach((player) => {
        if (player.id === socket.id) {
          renderPlayer(player);
        }
      });
    } else {
      console.log("Invalid player data received:", players);
    }
  });

  socket.on("catcherSelected", (catcherId) => {
    // Catcher selected
    console.log(`Catcher selected: ${catcherId}`);
  });

  socket.on("playerJoined", (players) => {
    // New player joined
    console.log("Player joined:", players);
  });

  socket.on("gameFull", () => {
    // Game is already full
    console.log("Game is already full");
  });

  socket.on("playerMoved", (player) => {
    // Player movement update
    console.log("Player moved:", player);
    renderPlayer(player);
  });

  socket.on("catcherLeft", () => {
    // Catcher left the game
    console.log("Catcher left the game");
  });

  socket.on("playerLeft", (playerId) => {
    // Player left the game
    console.log(`Player left: ${playerId}`);
  });

  function renderPlayer(player) {
    playerElement.style.left = player.position.x + "px";
    playerElement.style.top = player.position.y + "px";
    playerElement.style.backgroundColor = player.color;
  }

  socket.on("connect", () => {
    socket.emit("join");
  });
}

document.addEventListener("DOMContentLoaded", init);
