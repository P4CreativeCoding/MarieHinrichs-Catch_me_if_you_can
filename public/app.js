const socket = io();

function init() {
  const playerElement = document.getElementById("player");

  // Spielerbewegung mit den Pfeiltasten
  const movement = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  function handlePlayerMovement(event) {
    const key = event.key;
    const isPressed = event.type === "keydown";

    switch (key) {
      case "ArrowLeft": // Links
        movement.left = isPressed;
        break;
      case "ArrowUp": // Oben
        movement.up = isPressed;
        break;
      case "ArrowRight": // Rechts
        movement.right = isPressed;
        break;
      case "ArrowDown": // Unten
        movement.down = isPressed;
        break;
    }

    const newPosition = {
      x: playerElement.offsetLeft,
      y: playerElement.offsetTop,
    };

    // Spielerbewegung an den Server senden
    socket.emit("playerMoved", newPosition);
  }

  // Spielerbewegung mit den Pfeiltasten
  document.addEventListener("keydown", handlePlayerMovement);
  document.addEventListener("keyup", handlePlayerMovement);

  socket.on("playerData", (players) => {
    if (Array.isArray(players)) {
      players.forEach((player) => {
        if (player.id === socket.id) {
          renderPlayer(player.position);
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
    renderPlayer(player.position);
  });

  socket.on("catcherLeft", () => {
    // Catcher left the game
    console.log("Catcher left the game");
  });

  socket.on("playerLeft", (playerId) => {
    // Player left the game
    console.log(`Player left: ${playerId}`);
  });

  function renderPlayer(position) {
    playerElement.style.left = position.x + "px";
    playerElement.style.top = position.y + "px";
  }

  socket.on("connect", () => {
    socket.emit("join");
  });
}

document.addEventListener("DOMContentLoaded", init);
