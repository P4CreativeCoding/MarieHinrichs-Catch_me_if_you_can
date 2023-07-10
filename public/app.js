const socket = io();
let playerId;

function login(event) {
  event.preventDefault();
  const password = document.getElementById("password").value;

  // Senden der Login-Daten an den Server
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "Login erfolgreich") {
        playerId = socket.id;
        document.getElementById("login-container").style.display = "none";
        document.getElementById("game-area").style.display = "block";
        initGame();
      } else {
        document.getElementById("login-error").textContent =
          "Ungültige Anmeldeinformationen";
      }
    });
}

function initGame() {
  const gameAreaElement = document.getElementById("game-area");

  document.addEventListener("keydown", handlePlayerMovement);

  socket.emit("join", playerId);

  socket.on("playerData", (players) => {
    players.forEach((player) => {
      createPlayerElement(player);
    });
  });

  socket.on("playerJoined", (player) => {
    createPlayerElement(player);
  });

  socket.on("playerMoved", (player) => {
    renderPlayer(player);
  });

  socket.on("playerLeft", (playerId) => {
    removePlayerElement(playerId);
  });

  function createPlayerElement(player) {
    const playerElement = document.createElement("div");
    playerElement.id = player.id;
    playerElement.classList.add("player");
    playerElement.style.top = player.position.y + "px";
    playerElement.style.left = player.position.x + "px";

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
      movement.y = -20;
    } else if (event.key === "ArrowDown") {
      movement.y = 20;
    } else if (event.key === "ArrowLeft") {
      movement.x = -20;
    } else if (event.key === "ArrowRight") {
      movement.x = 20;
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
}

document.getElementById("login-form").addEventListener("submit", login);
