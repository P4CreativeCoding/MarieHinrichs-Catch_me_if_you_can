// app.js
const socket = io();

socket.on("init", (data) => {
  const { players, tagger } = data;
  for (const player of players) {
    createPlayerElement(player, tagger);
  }
});

socket.on("update", (player) => {
  const playerElement = document.getElementById(player.id);
  if (playerElement) {
    playerElement.style.left = `${player.x}px`;
    playerElement.style.top = `${player.y}px`;
  }
});

socket.on("playerDisconnected", (playerId) => {
  const playerElement = document.getElementById(playerId);
  if (playerElement) {
    playerElement.remove();
  }
});

socket.on("taggerSelected", (taggerId) => {
  const previousTaggerElement = document.querySelector(".tagger");
  if (previousTaggerElement) {
    previousTaggerElement.classList.remove("tagger");
  }
  const newTaggerElement = document.getElementById(taggerId);
  if (newTaggerElement) {
    newTaggerElement.classList.add("tagger");
  }
});

function createPlayerElement(player, tagger) {
  const playerElement = document.createElement("div");
  playerElement.id = player.id;
  playerElement.className = "player";
  playerElement.style.backgroundColor = player.color;
  playerElement.style.left = `${player.x}px`;
  playerElement.style.top = `${player.y}px`;
  if (tagger === player.id) {
    playerElement.classList.add("tagger");
  }
  document.getElementById("game").appendChild(playerElement);
}

document.addEventListener("keydown", (event) => {
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
});
