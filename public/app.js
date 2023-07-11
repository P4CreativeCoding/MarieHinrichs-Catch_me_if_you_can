const socket = io();
let waldoPosition = { x: 0, y: 0 };
let playerId; // playerId initialisieren

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

  gameAreaElement.addEventListener("click", handleWaldoClick);

  socket.on("waldoMoved", (position) => {
    waldoPosition = position;
    renderWaldo();
  });

  socket.on("waldoFound", (playerId) => {
    if (playerId === socket.id) {
      // Spieler hat Walter gefunden
      socket.emit("waldoReset");
    }
  });

  renderWaldo();
}

function renderWaldo() {
  const gameAreaElement = document.getElementById("game-area");
  const waldoElement = document.getElementById("waldo");

  if (waldoElement) {
    waldoElement.style.left = waldoPosition.x + "px";
    waldoElement.style.top = waldoPosition.y + "px";
  } else {
    const newWaldoElement = document.createElement("div");
    newWaldoElement.id = "waldo";
    newWaldoElement.classList.add("waldo");
    newWaldoElement.style.left = waldoPosition.x + "px";
    newWaldoElement.style.top = waldoPosition.y + "px";

    gameAreaElement.appendChild(newWaldoElement);
  }
}

function handleWaldoClick(event) {
  const waldoElement = document.getElementById("waldo");

  if (waldoElement) {
    const waldoRect = waldoElement.getBoundingClientRect();
    const clickX = event.clientX;
    const clickY = event.clientY;

    if (
      clickX >= waldoRect.left &&
      clickX <= waldoRect.right &&
      clickY >= waldoRect.top &&
      clickY <= waldoRect.bottom
    ) {
      socket.emit("waldoFound", socket.id);
    }
  }
}

socket.on("connect", () => {
  console.log("Connected to server");
  initGame();
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
