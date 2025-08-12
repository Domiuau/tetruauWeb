import { placeBackground } from "../utils.js";


placeBackground();

const singleplayerButton = document.getElementById("singleplayer");
const multiplayerButton = document.getElementById("multiplayer");

singleplayerButton.addEventListener("click", () => {
  window.location.href = "/pages/game.html";
});

multiplayerButton.addEventListener("click", () => {
  window.location.href = "/pages/availableRooms.html";
});


