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
        document.getElementById("game-container").style.display = "block";
        initGame();
      } else {
        document.getElementById("login-error").textContent =
          "Ungültige Anmeldeinformationen";
      }
    });
}

function initGame() {
  const gameAreaElement = document.getElementById("game-area");
  const scoreboardElement = document.getElementById("scoreboard");

  document.addEventListener("keydown", handlePlayerMovement);

  socket.emit("join", playerId);

  socket.on("playerData", (players) => {
    clearGameArea(); // Alle Spieler-Elemente entfernen
    players.forEach((player) => {
      if (player.id === playerId) {
        createPlayerElement(player);
      } else {
        createOpponentElement(player);
      }
    });
  });

  socket.on("playerMoved", (player) => {
    renderPlayer(player);
    checkCollision(player);
  });

  socket.on("playerLeft", (playerId) => {
    removePlayerElement(playerId);
  });

  socket.on("squareEaten", (playerId) => {
    if (playerId === playerId) {
      score++;
      scoreboardElement.textContent = `Score: ${score}`;
      if (score === MAX_SCORE) {
        announceWinner();
      }
    }
  });

  socket.on("squareCreated", (square) => {
    createSquareElement(square);
  });

  function createPlayerElement(player) {
    const playerElement = document.createElement("div");
    playerElement.id = player.id;
    playerElement.classList.add("player");
    playerElement.style.top = player.position.y + "px";
    playerElement.style.left = player.position.x + "px";

    gameAreaElement.appendChild(playerElement);
  }

  function createOpponentElement(player) {
    const opponentElement = document.createElement("div");
    opponentElement.id = player.id;
    opponentElement.classList.add("opponent");
    opponentElement.style.top = player.position.y + "px";
    opponentElement.style.left = player.position.x + "px";

    gameAreaElement.appendChild(opponentElement);
  }

  function createSquareElement(square) {
    const squareElement = document.createElement("div");
    squareElement.id = `square-${square.id}`;
    squareElement.classList.add("square");
    squareElement.style.top = square.position.y + "px";
    squareElement.style.left = square.position.x + "px";

    gameAreaElement.appendChild(squareElement);
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

  function checkCollision(player) {
    const playerElement = document.getElementById(player.id);
    const squares = document.querySelectorAll(".square");

    squares.forEach((square) => {
      if (isColliding(playerElement, square)) {
        const squareId = square.id.replace("square-", "");
        square.remove();
        socket.emit("squareEaten", playerId, squareId);
      }
    });
  }

  function isColliding(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  }
}

function clearGameArea() {
  const gameAreaElement = document.getElementById("game-area");
  while (gameAreaElement.firstChild) {
    gameAreaElement.firstChild.remove();
  }
}

document.getElementById("login-form").addEventListener("submit", login);
