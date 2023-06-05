const socket = io();

function init() {
  const gameAreaElement = document.getElementById("game-area");

  socket.on("playerData", (player) => {
    renderPlayer(player);
  });

  socket.on("playerJoined", (players) => {
    gameAreaElement.innerHTML = "";
    players.forEach((player) => {
      createPlayerElement(player);
    });
  });

  socket.on("playerMoved", (player) => {
    renderPlayer(player);
  });

  socket.on("playerLeft", (playerId) => {
    removePlayerElement(playerId);
  });

  socket.on("catcherSelected", (catcherId) => {
    setPlayerAsCatcher(catcherId);
  });

  function createPlayerElement(player) {
    const playerElement = document.createElement("div");
    playerElement.id = player.id;
    playerElement.classList.add("player");
    playerElement.style.top = player.position.y + "px";
    playerElement.style.left = player.position.x + "px";
    playerElement.style.backgroundColor = player.color;

    gameAreaElement.appendChild(playerElement);
  }

  function removePlayerElement(playerId) {
    const playerElement = document.getElementById(playerId);
    if (playerElement) {
      playerElement.remove();
    }
  }

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

  function renderPlayer(player) {
    const playerElement = document.getElementById(player.id);
    if (playerElement) {
      playerElement.style.left = player.position.x + "px";
      playerElement.style.top = player.position.y + "px";
    }
  }

  function setPlayerAsCatcher(catcherId) {
    console.log("Catcher selected: ", catcherId);
    const playerElements = document.querySelectorAll(".player");
    console.log(playerElements);
    playerElements.forEach((element) => {
      element.classList.remove("catcher");
      if (element.id === catcherId) {
        element.classList.add("catcher");
      }
      element.style.backgroundColor = getRandomColor();
    });
  }

  function getRandomColor() {
    const colors = ["red", "blue", "green", "yellow", "orange", "purple"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  document.addEventListener("keydown", handlePlayerMovement);

  socket.on("connect", () => {
    socket.emit("join");
  });
}

document.addEventListener("DOMContentLoaded", init);
