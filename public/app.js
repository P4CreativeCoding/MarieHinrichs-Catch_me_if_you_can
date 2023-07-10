const socket = io();

function init() {
  const gameAreaElement = document.getElementById("game-area");

  setInterval(() => {
    const randomColor = getRandomColor();
    gameAreaElement.style.borderColor = randomColor;
  }, 1000);

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  socket.emit("join");

  socket.on("playerData", (player) => {
    renderPlayer(player);
  });

  socket.on("playerJoined", (players, catcherId) => {
    gameAreaElement.innerHTML = "";
    players.forEach((player) => {
      createPlayerElement(player);
    });

    setPlayerAsCatcher(catcherId); // Setze den Fänger für den neuen Spieler
  });

  socket.on("playerMoved", (player) => {
    renderPlayer(player);
    checkCollision(player);
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

    const playerNameElement = document.createElement("div");
    playerNameElement.innerText = player.name; // Zeige den Spielernamen an
    playerNameElement.classList.add("player-name");

    playerElement.appendChild(playerNameElement);

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
    const playerElements = document.querySelectorAll(".player");
    playerElements.forEach((element) => {
      element.classList.remove("catcher");
      if (element.id === catcherId) {
        element.classList.add("catcher");
      }
    });
  }

  function checkCollision(catcher) {
    const catcherElement = document.getElementById(catcher.id);
    const playerElements = document.querySelectorAll(".player");

    playerElements.forEach((playerElement) => {
      if (
        playerElement.id !== catcherElement.id &&
        isColliding(catcherElement, playerElement)
      ) {
        const playerId = playerElement.id;
        socket.emit("catcherCollision", playerId);
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

  document.addEventListener("keydown", handlePlayerMovement);

  socket.on("connect", () => {
    socket.emit("join");
  });
}

function login(event) {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Senden der Login-Daten an den Server
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "Login erfolgreich") {
        // Login erfolgreich, das Spiel anzeigen
        document.getElementById("login-form").style.display = "none";
        document.getElementById("game-container").style.display = "block";
      } else {
        // Fehler beim Login, Fehlermeldung anzeigen
        document.getElementById("login-error").textContent =
          "Ungültige Anmeldeinformationen";
      }
    });
}
document.addEventListener("DOMContentLoaded", init);
