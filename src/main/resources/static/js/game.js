import { pieces } from "./pieces.js";
import { gameRolling, gravityForce, resetGravityTimer, showGame, starGame } from "./gameLogic.js";
import { drawGridOtherGame, drawNextGridOtherGame, drawHoldGridOtherGame } from "./render.js";
import { createGridGames, gameUpdateSubscrible, linesSend, sendEliminated, startPlayersCount } from "./onlineMatchCommunicator.js";
import { placeBackground } from "./utils.js";

export const canvas = document.getElementById('tetris');
export const context = canvas.getContext('2d');

export const canvasNext = document.getElementById("next")
export const contextNext = canvasNext.getContext('2d');

export const canvasHold = document.getElementById("hold")
export const contextHold = canvasHold.getContext('2d');

export const initialGravity = 1200

const otherGamesDiv = document.getElementById("other-games");
let players = JSON.parse(localStorage.getItem("playerNamesList"))

const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('id')

let increaseSpeedFactor = 8
let rebuildOtherGames = false

let fastBattleMusicStarted = false
export const audioBattleMusic = new Audio('/audio/battleMusic.mp3');
audioBattleMusic.volume = 0.12
audioBattleMusic.loop = true

const audioBattleFastMusic = new Audio('/audio/battleFastMusic.mp3');
audioBattleFastMusic.loop = true
audioBattleFastMusic.volume = 0.11

const audioEliminatedPlayer = new Audio('/audio/eliminatedPlayer.wav');

const audioGameOver = new Audio('/audio/gameOver.wav');
audioGameOver.volume = 0.3



export const colors = [
    getCssVar('--tetris-black'),
    getCssVar('--tetris-cyan'),
    getCssVar('--tetris-blue'),
    getCssVar('--tetris-orange'),
    getCssVar('--tetris-yellow'),
    getCssVar('--tetris-green'),
    getCssVar('--tetris-purple'),
    getCssVar('--tetris-red'),
    getCssVar('--tetris-gray'),
    getCssVar('--tetris-light'),
    getCssVar('--tetris-next'),
    getCssVar('--tetris-block'),

];

export let rows = 23;
export let cols = 10;

export let cellSize
export let otherGamesCellSize = 10

export let grid
export let gridNext
export let gridHold

export let biggerX

placeBackground()
startCountdown()
prepareGame()

if (roomId) {
    prepareOtherGames()
    gameUpdateSubscrible(roomId)

    if (performance.navigation.type === 1) {

        triggerGameOverEffect()

        setTimeout(() => {
            sendEliminated(localStorage.getItem("username"), roomId)
        }, 500);

    }
} else {
    setTimeout(() => {
        showGame()
    }, 100);

    setTimeout(() => {
        starGame()
        audioBattleMusic.play()
    }, 3000);
}

export function prepareGame() {

    otherGamesDiv.innerHTML = ""
    gravityForce.force = initialGravity
    fastBattleMusicStarted = false

    cellSize = (window.innerHeight / (rows)) - 4;
    grid = Array.from({ length: rows }, () => Array(cols).fill(0));

    prepareGameGrid(grid)

    biggerX = getXBigger()

    canvasNext.width = (biggerX + 1) * cellSize
    canvasNext.height = rows * cellSize

    canvas.width = cols * cellSize
    canvas.height = rows * cellSize

    canvasHold.width = (biggerX + 1) * cellSize
    canvasHold.height = (biggerX + 1) * cellSize

    gridNext = Array.from({ length: rows - 1 }, () => Array(biggerX).fill(0));

    for (let i = 0; i < gridNext.length; i++) {
        for (let j = 0; j < gridNext[0].length; j++) {
            gridNext[i][j] = 10
        }

    }

    gridHold = Array.from({ length: biggerX }, () => Array(biggerX).fill(0));

    for (let i = 0; i < gridHold.length; i++) {
        for (let j = 0; j < gridHold[0].length; j++) {
            gridHold[i][j] = 10
        }

    }

}

export function prepareGameGrid(grid) {



    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            grid[i][j] = 8
        }

    }

}

export function removeOtherGame(eliminatedPlayer) {
    audioEliminatedPlayer.currentTime = 0
    audioEliminatedPlayer.play()
    removeWithBoom(eliminatedPlayer)

    players = players.filter(p => p.name !== eliminatedPlayer);

    rebuildOtherGames = true



}

export function removeGame() {

    removeWithBoom("my-game")


}

function prepareOtherGames() {

    otherGamesDiv.innerHTML = ''

    const otherGames = createGridGames(players)

    if (otherGames.length == 0) {
        return
    }

    console.log(players)

    const divisorFactor = otherGames.length < 2 ? 1 : otherGames.length < 5 ? 2 : otherGames.length < 10 ? 3 : 4

    setGridColumns(divisorFactor)

    otherGamesCellSize = (cellSize / divisorFactor)

    const otherGameCanvaWidth = (canvas.width / divisorFactor)
    const otherGameCanvaHeight = (canvas.height / divisorFactor)

    const otherGameNextCanvaWidth = (canvasNext.width / divisorFactor)
    const otherGameNextCanvaHeight = (canvasNext.height / divisorFactor)

    const otherGameHoldCanvaWidth = (canvasHold.width / divisorFactor)
    const otherGameHoldCanvaHeight = (canvasHold.height / divisorFactor)

    for (let i = 0; i < otherGames.length; i++) {

        const newDivPlayer = document.createElement("div")
        newDivPlayer.classList = 'div-player'
        newDivPlayer.id = otherGames[i].player.name

        const newDivUsername = document.createElement("div")
        newDivUsername.classList = "new-div-username"

        const usernameP = document.createElement("p")
        usernameP.textContent = otherGames[i].player.name

        const newDivGame = document.createElement("div")
        newDivGame.classList = "game"

        const newCanvasHold = document.createElement("canvas");
        newCanvasHold.id = "hold" + otherGames[i].player.name
        newCanvasHold.className = "hold";
        newCanvasHold.width = otherGameHoldCanvaWidth
        newCanvasHold.height = otherGameHoldCanvaHeight

        newDivGame.appendChild(newCanvasHold)

        const newCanvas = document.createElement("canvas");
        newCanvas.id = "game" + otherGames[i].player.name
        newCanvas.className = "tetris";
        newCanvas.width = otherGameCanvaWidth
        newCanvas.height = otherGameCanvaHeight

        newDivGame.appendChild(newCanvas)

        const newCanvasNext = document.createElement("canvas");
        newCanvasNext.id = "next" + otherGames[i].player.name
        newCanvasNext.className = "next";
        newCanvasNext.width = otherGameNextCanvaWidth
        newCanvasNext.height = otherGameNextCanvaHeight

        newDivGame.appendChild(newCanvasNext)

        newDivPlayer.appendChild(newDivGame)

        newDivUsername.appendChild(usernameP)

        newDivPlayer.appendChild(newDivUsername)

        newDivUsername.style.width = (otherGameCanvaWidth + otherGameNextCanvaWidth) + "px"

        otherGamesDiv.appendChild(newDivPlayer);

        drawGridOtherGame(otherGames[i].grid, newCanvas)

        drawNextGridOtherGame(otherGames[i].gridNext, newCanvasNext)

        drawHoldGridOtherGame(otherGames[i].gridHold, newCanvasHold)



    }

}

function ajustMusic(playerObject) {

    gravityForce.force -= Math.max(0, increaseSpeedFactor / startPlayersCount)

    if (playerObject.increaseSpeed) {

        if (gravityForce.force < 200) {

            if (!fastBattleMusicStarted) {

                gravityForce.force -= 100
                resetGravityTimer()
                audioBattleMusic.volume = 0;
                audioBattleFastMusic.currentTime = 0
                audioBattleFastMusic.play()
                increaseSpeedFactor = increaseSpeedFactor / 16
                fastBattleMusicStarted = true
            }

            const rate = parseFloat(Math.min(2, ((initialGravity + ((initialGravity - gravityForce.force)) / 3) / initialGravity)).toFixed(2))
            if (audioBattleFastMusic.playbackRate != rate) audioBattleFastMusic.playbackRate = rate

        } else {

            const rate = parseFloat((((initialGravity + ((initialGravity - gravityForce.force)) / 4) / initialGravity)).toFixed(2))
            if (audioBattleMusic.playbackRate != rate) audioBattleMusic.playbackRate = rate
        }

        console.log(gravityForce.force)

    }

}

export function updatePlayer(playerObject) {

    if (rebuildOtherGames) {
        prepareOtherGames()
        rebuildOtherGames = false
    }

    if (playerObject.increaseSpeed) {
        ajustMusic(playerObject)
    }

    if (localStorage.getItem("username") == playerObject.from) return;

    const playerCanvas = document.getElementById("game" + playerObject.from)
    const playerCanvasHold = document.getElementById("hold" + playerObject.from)
    const playerCanvasNext = document.getElementById("next" + playerObject.from)

    drawGridOtherGame(playerObject.grid, playerCanvas)
    drawNextGridOtherGame(playerObject.gridNext, playerCanvasNext)

    if (playerObject.gridHold) {
        drawHoldGridOtherGame(playerObject.gridHold, playerCanvasHold)

    }

}

function getXBigger() {

    let bigger = 0

    for (let i = 0; i < pieces.length; i++) {
        bigger = Math.max(pieces[i].next[0].length, bigger)

    }

    return bigger


}

function getCssVar(name) {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
}

function setGridColumns(cols) {
    const otherGamesDiv = document.getElementById("other-games");
    otherGamesDiv.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
}

export function triggerGameOverEffect() {

    const gameDiv = document.querySelector('.my-game');

    gameDiv.classList.add('shake');

    setTimeout(() => {
        gameDiv.classList.remove('shake');
    }, 500);
}

export function endGame(endGameData) {

    gameRolling.rolling = false
    audioBattleFastMusic.volume = 0.01
    audioBattleMusic.volume = 0.01
    audioGameOver.play()
    gravityForce.force = 99999
    resetGravityTimer()

    showWinner(endGameData)
}

const popup = document.getElementById('winner-popup');
const winnerNameEl = document.getElementById('winner-name');
const timerEl = document.getElementById('timer');

function showWinner(endGameData) {

    winnerNameEl.textContent = `${endGameData.winner} venceu! 🎉`;
    popup.classList.add('show');

    const content = popup.querySelector('.popup-content');

    let playersContainer = content.querySelector('#players-container');
    const ul = playersContainer.querySelector('.players-list');
    ul.innerHTML = '';

    endGameData.players.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="player-name">${p.name}</span>
            <span class="player-score">Lines send: ${p.linesSend}</span>
        `;
        ul.appendChild(li);
    });

    const duration = 10 * initialGravity;
    const animationEnd = Date.now() + duration;
    const defaults = { origin: { y: 0.6 } };

    timerEl.textContent = `Voltando para sala em ${Math.ceil(duration / initialGravity)}s`;

    const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
            clearInterval(interval);
            timerEl.textContent = `0s`;
            popup.classList.remove('show');
            window.location.href = `/pages/waitingRoom.html?id=${roomId}`;
            return;
        }

        timerEl.textContent = `Voltando para sala em ${Math.ceil(timeLeft / initialGravity)}s`;
        const particleCount = 150 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, {
            particleCount,
            startVelocity: 15,
            spread: 6000,
            origin: { x: Math.random(), y: Math.random() }
        }));
    }, 250);
}

function removeWithBoom(id) {
    const el = document.getElementById(id);

    el.classList.add('explode');

    el.addEventListener('animationend', () => {
        el.remove();
    }, { once: true });

    if (typeof confetti === 'function') {
        confetti({
            particleCount: 40,
            spread: 60,
            origin: {
                x: el.getBoundingClientRect().left / window.innerWidth,
                y: el.getBoundingClientRect().top / window.innerHeight
            }
        });
    }
}

function startCountdown() {

    const audioGameCount = new Audio('/audio/gameCount.wav');
    audioGameCount.volume = 0.5
    const audioGameStart = new Audio('/audio/gameStart.wav');
    audioGameStart.volume = 0.5
    const overlay = document.getElementById('countdown-overlay');
    const countEl = overlay.querySelector('.count');
    const sequence = ['3', '2', '1', 'GO!'];
    let idx = 0;

    overlay.style.display = 'flex';

    const tick = () => {
        countEl.textContent = sequence[idx];
        idx++;
        if (idx < sequence.length) {
            audioGameCount.currentTime = 0
            audioGameCount.play()
            setTimeout(tick, 1000);
        } else if (idx == sequence.length) {
            audioGameStart.play()
            overlay.style.background = 'none'
            setTimeout(tick, 1000);
        } else {
            overlay.style.display = 'none';
        }
    };

    tick();
}

















