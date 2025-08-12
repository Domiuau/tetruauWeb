import { test, lockPiece, movePiece, rotatePieceClock, rotatePieceAntiClock, gameRolling, holdPiece } from './gameLogic.js'
import { stompClient } from './stompClient.js';

document.addEventListener("keydown", (event) => {

  if (event.ctrlKey) {
    rotatePieceAntiClock();
    return;
  }

    if (event.shiftKey) {
    holdPiece();
    return;
  }

  switch (event.key) {
    case " ":
      if (gameRolling.rolling) lockPiece();
      break;
    case "a":
      if (gameRolling.rolling) lockPiece();
      break;
    case "ArrowLeft":
      if (gameRolling.rolling) movePiece(-1, 0)
      break;
    case "ArrowRight":
      if (gameRolling.rolling) movePiece(1, 0)
      break;
    case "ArrowUp":
      if (gameRolling.rolling) rotatePieceClock()
      break;
    case "ArrowDown":
      if (gameRolling.rolling) movePiece(0, 1)
      break;
    case "w":
      if (gameRolling.rolling) movePiece(0, -1)
      break;
    case "q":
      if (gameRolling.rolling) test()
      break;

  }
});
