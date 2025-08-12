import { canvas, context, cellSize, colors, canvasNext, canvasHold, contextNext, contextHold, otherGamesCellSize } from './game.js'

export function drawGrid(grid) {

  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      context.fillStyle = colors[grid[row][col]];
      context.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      context.strokeStyle = "#1f1f1f";
      context.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);

    }

  }
}

export function drawNextGrid(grid) {

  contextNext.clearRect(0, 0, canvasNext.width, canvasNext.height);

  const gridWidth = grid[0].length * cellSize;
  const gridHeight = grid.length * cellSize;

  const offsetX = (canvasNext.width - gridWidth) / 2;
  const offsetY = (canvasNext.height - gridHeight) / 2;

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const x = offsetX + col * cellSize;
      const y = offsetY + row * cellSize;

      contextNext.fillStyle = colors[grid[row][col] != 0 ? grid[row][col] : 10];
      contextNext.fillRect(x, y, cellSize, cellSize);

      if (grid[row][col] !== 10 && grid[row][col] !== 0) {
        contextNext.strokeStyle = "#1f1f1f";
        contextNext.strokeRect(x, y, cellSize, cellSize);
      }
    }
  }
}

export function drawNextHold(grid) {

  contextHold.clearRect(0, 0, canvasHold.width, canvasHold.height);

  const gridWidth = grid[0].length * cellSize;
  const gridHeight = grid.length * cellSize;

  const offsetX = (canvasHold.width - gridWidth) / 2;
  const offsetY = (canvasHold.height - gridHeight) / 2;

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const x = offsetX + col * cellSize - (cellSize / 2);
      const y = offsetY + row * cellSize;

      contextHold.fillStyle = colors[grid[row][col] != 0 ? grid[row][col] : 10];
      contextHold.fillRect(x, y, cellSize, cellSize);

      if (grid[row][col] !== 10 && grid[row][col] !== 0) {
        contextHold.strokeStyle = "#1f1f1f";
        contextHold.strokeRect(x, y, cellSize, cellSize);
      }
    }
  }
}

export function drawGridOtherGame(grid, canvaOtherGame) {

  const context = canvaOtherGame.getContext("2d");

  context.clearRect(0, 0, canvaOtherGame.width, canvaOtherGame.height);

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      context.fillStyle = colors[grid[row][col]];
      context.fillRect(col * otherGamesCellSize, row * otherGamesCellSize, otherGamesCellSize, otherGamesCellSize);
      context.strokeStyle = "#1f1f1f";
      context.strokeRect(col * otherGamesCellSize, row * otherGamesCellSize, otherGamesCellSize, otherGamesCellSize);

    }

  }
}

export function drawNextGridOtherGame(grid, canvaOtherGameNext) {

  const context = canvaOtherGameNext.getContext("2d")

  context.clearRect(0, 0, canvaOtherGameNext.width, canvaOtherGameNext.height);

  const gridWidth = grid[0].length * otherGamesCellSize;
  const gridHeight = grid.length * otherGamesCellSize;

  const offsetX = (canvaOtherGameNext.width - gridWidth) / 2;
  const offsetY = (canvaOtherGameNext.height - gridHeight) / 2;

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const x = offsetX + col * otherGamesCellSize;
      const y = offsetY + row * otherGamesCellSize;

      context.fillStyle = colors[grid[row][col] != 0 ? grid[row][col] : 10];
      context.fillRect(x, y, otherGamesCellSize, otherGamesCellSize);

      if (grid[row][col] !== 10 && grid[row][col] !== 0) {
        context.strokeStyle = "#1f1f1f";
        context.strokeRect(x, y, otherGamesCellSize, otherGamesCellSize);
      }
    }
  }
}

export function drawHoldGridOtherGame(grid, canvaOtherGameHold) {

  const context = canvaOtherGameHold.getContext("2d")

  context.clearRect(0, 0, canvaOtherGameHold.width, canvaOtherGameHold.height);

  const gridWidth = grid[0].length * otherGamesCellSize;
  const gridHeight = grid.length * otherGamesCellSize;

  const offsetX = (canvaOtherGameHold.width - gridWidth) / 2;
  const offsetY = (canvaOtherGameHold.height - gridHeight) / 2;

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const x = offsetX + col * otherGamesCellSize - (otherGamesCellSize / 2);
      const y = offsetY + row * otherGamesCellSize;

      context.fillStyle = colors[grid[row][col] != 0 ? grid[row][col] : 10];
      context.fillRect(x, y, otherGamesCellSize, otherGamesCellSize);

      if (grid[row][col] !== 10 && grid[row][col] !== 0) {
        context.strokeStyle = "#1f1f1f";
        context.strokeRect(x, y, otherGamesCellSize, otherGamesCellSize);
      }
    }
  }
}
