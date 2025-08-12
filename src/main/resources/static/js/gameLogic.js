import { grid, gridNext, gridHold, triggerGameOverEffect, initialGravity, prepareGame } from './game.js'
import { pieces } from './pieces.js'
import { drawGrid, drawNextGrid, drawNextHold } from './render.js'
import { sendGame, sendAttack, sendEliminated } from './onlineMatchCommunicator.js'

export let gameRolling = {
    rolling: false
}

let currentPieceLocation = []

let gridCopy
let gridNextCopy
let gridHoldCopy

let currentPreviewPosition = []
let currentPiece
let piecesQueue = []
let pieceHold
let holdEnabled = true

export let gravityForce = {
    force: 9999
}

let timerId = null;
let startTime = null;


export const attackToReceive = {
    lines: 0
}

let combo = 0

const rotateTry = [
    [{ x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 1 }, { x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: -2 }
        , { x: -2, y: 1 }, { x: 4, y: 0 }, { x: -2, y: -2 }, { x: 0, y: 2 }],
    [{ x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: -2 }
        , { x: 2, y: 1 }, { x: -4, y: 0 }, { x: 2, y: -2 }, { x: 0, y: 2 }]
]

const audioMove = new Audio('/audio/move.wav');
audioMove.volume = 0.3
const audioRotate = new Audio('/audio/rotate.wav')
audioRotate.volume = 0.5
const audioBreakOne = new Audio('/audio/breakOne.wav')
audioBreakOne.volume = 0.4
const audioBreakTwo = new Audio('/audio/breakTwo.wav')
audioBreakTwo.volume = 0.4
const audioBreakThree = new Audio('/audio/breakThree.wav')
audioBreakThree.volume = 0.4
const audioBreakFor = new Audio('/audio/breakFor.wav')
audioBreakFor.volume = 0.4
const audioGameEnd = new Audio('/audio/gameEnd.mp3')
const audioHold = new Audio('/audio/hold.wav')
audioHold.volume = 0.5
const audioHardDrop = new Audio('/audio/harddrop.wav')
audioHardDrop.volume = 0.5

const audioAttackLow = new Audio('/audio/attackLow.wav')
audioAttackLow.volume = 0.7

const audioAttackHard = new Audio('/audio/attackHard.wav')
audioAttackHard.volume = 0.7

const audiosCombo = loadComboSounds()
const comboFail = new Audio('/audio/comboFail.mp3')
comboFail.volume = 0.6

const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('id')


function endGame() {
    gameRolling.rolling = false

    if (timerId !== null) {
        clearInterval(timerId);
    }

    timerId = null
    startTime = null;
    currentPieceLocation = []
    piecesQueue = []

    triggerGameOverEffect();
    audioGameEnd.currentTime = 0
    audioGameEnd.volume = 0.1
    audioGameEnd.play()

    setTimeout(() => {
        if (roomId) {
            sendEliminated(localStorage.getItem("username"), roomId)
        } else {
            prepareGame()
            starGame()
        }

    }, 1000);


}

export function starGame() {

    showGame()
    gravityForce.force = initialGravity
    resetGravityTimer()
    gameRolling.rolling = true

}

export function showGame() {

    fillPiecesQueue()
    pieceHold = null

    if (currentPieceLocation.length == 0) {
        placePieceInGrid()
    }

    updateNext()
    updateHold()
    drawGrid(gridCopy)
    sendGame(gridCopy, gridHoldCopy, gridNextCopy, roomId, localStorage.getItem("username"))

}

function fillPiecesQueue() {
    if (piecesQueue.length == 0) {
        for (let i = 0; i < Math.min((grid.length / 4), 4); i++) {
            piecesQueue.push(pieces[Math.floor(Math.random() * pieces.length)])
        }
    }
}

function updateHold() {

    if (pieceHold) {
        gridHoldCopy = structuredClone(gridHold)

        for (let i = 0; i < pieceHold.length; i++) {
            for (let j = 0; j < pieceHold[0].length; j++) {
                gridHoldCopy[i][pieceHold[0].length - j] = pieceHold[i][j]

            }

        }

        drawNextHold(gridHoldCopy)
    }


}

function gravity() {
    movePiece(0, 1, true, false, false)
}

export function resetGravityTimer() {
    if (timerId !== null) {
        clearInterval(timerId);
    }
    timerId = setInterval(gravity, gravityForce.force);
}

function updateNext() {

    gridNextCopy = structuredClone(gridNext)

    let gridLenght = 0

    for (let i = 0; i < piecesQueue.length; i++) {

        for (let k = 0; k < piecesQueue[i].next.length; k++) {
            for (let j = 0; j < piecesQueue[i].next[k].length; j++) {

                gridNextCopy[k + gridLenght][j] = piecesQueue[i].next[k][j]

            }

        }

        gridLenght += piecesQueue[i].next.length + 1


    }

    drawNextGrid(gridNextCopy)

}

function placePieceInGrid(pieceHold = false) {

    let piece

    if (!pieceHold) {
        piece = piecesQueue.shift().game
        currentPiece = piece
        piecesQueue.push(pieces[Math.floor(Math.random() * pieces.length)])
    } else {
        piece = currentPiece
    }

    updateNext()

    currentPieceLocation = []
    gridCopy = structuredClone(grid);

    for (let i = 0; i < piece.length; i++) {

        let xLocations = []

        for (let j = 0; j < piece[0].length; j++) {
            const initialXPoint = j + (gridCopy[0].length / 2) - Math.ceil(piece[0].length / 2)

            gridCopy[i][initialXPoint] = piece[i][j] != 0 ? piece[i][j] : gridCopy[i][initialXPoint]
            xLocations.push({ i: i, j: initialXPoint, color: piece[i][j] })

        }

        currentPieceLocation.push(xLocations)
        xLocations = []


    }


    previewPosition(currentPieceLocation)
    drawGrid(gridCopy)
    movePiece(0, 1)

}

export function holdPiece() {

    if (holdEnabled) {

        holdEnabled = false

        if (!pieceHold) {
            pieceHold = currentPiece
            placePieceInGrid()

        } else {

            const temp = pieceHold
            pieceHold = currentPiece
            currentPiece = temp
            placePieceInGrid(true)
        }

        audioHold.currentTime = 0
        audioHold.play()
        updateHold()

        sendGame(gridCopy, gridHoldCopy, gridNextCopy, roomId, localStorage.getItem("username"))

    }

}

export function movePiece(x, y, print = true, forced = false, sound = true) {

    let moveX = forced ? true : x != 0 ? !hasXColision(x) : true
    let moveY = forced ? true : y != 0 ? !hasYColision(y) : true


    if (moveX && moveY) {

        gridCopy = structuredClone(grid);

        for (let i = 0; i < currentPieceLocation.length; i++) {
            for (let j = 0; j < currentPieceLocation[0].length; j++) {

                currentPieceLocation[i][j].i += y
                currentPieceLocation[i][j].j += x

                if (currentPieceLocation[i][j].color != 0 && print) {

                    gridCopy[currentPieceLocation[i][j].i][currentPieceLocation[i][j].j] = currentPieceLocation[i][j].color

                }


            }

        }

        if (print) {
            previewPosition(currentPieceLocation)
            sendGame(gridCopy, gridHoldCopy, gridNextCopy, roomId, localStorage.getItem("username"))
        }

        if (sound) {
            audioMove.currentTime = 0;
            audioMove.play()
        }

    } else if (!forced && !moveY) {

        if (!startTime) {
            startTime = Date.now();
        }

        if (Date.now() - startTime > 3000) {
            lockPiece()
            startTime = null
        } else {
            sendGame(gridCopy, gridHoldCopy, gridNextCopy, roomId, localStorage.getItem("username"))
        }




    }

}

function hasYColision(y) {
    let isUp = y < 0

    for (let j = 0; j < currentPieceLocation.length; j++) {

        for (
            let i = isUp ? 0 : currentPieceLocation.length - 1; isUp ? i < currentPieceLocation.length : i >= 0; i += isUp ? 1 : -1
        ) {
            if (currentPieceLocation[i][j].color != 0) {
                const newI = currentPieceLocation[i][j].i + y

                if ((isUp ? (newI < 0) : (newI >= gridCopy.length)) ||

                    (gridCopy[newI][currentPieceLocation[i][j].j] != 0 &&
                        gridCopy[newI][currentPieceLocation[i][j].j] != 8 &&
                        gridCopy[newI][currentPieceLocation[i][j].j] != 9)
                ) {
                    return true
                }

                break
            }
        }
    }

    return false;
}


function hasXColision(x) {

    let isLeft = x < 0

    for (let i = currentPieceLocation.length - 1; i >= 0; i--) {

        for (let j = isLeft ? 0 : currentPieceLocation.length - 1; isLeft ? j < currentPieceLocation.length : j >= 0; j += isLeft ? 1 : -1) {

            if (currentPieceLocation[i][j].color != 0) {

                if ((isLeft ? (currentPieceLocation[i][j].j + x < 0) : (currentPieceLocation[i][j].j + x >= gridCopy[0].length)) ||

                    (gridCopy[currentPieceLocation[i][j].i][currentPieceLocation[i][j].j + x] != 0 &&
                        gridCopy[currentPieceLocation[i][j].i][currentPieceLocation[i][j].j + x] != 8 &&
                        gridCopy[currentPieceLocation[i][j].i][currentPieceLocation[i][j].j + x] != 9
                    )) {
                    return true


                }

                break
            }

        }

    }

    return false;

}




function previewPosition(location) {

    const down = downAsPossible(location);
    currentPreviewPosition = []

    for (let i = 0; i < location.length; i++) {
        for (let j = 0; j < location.length; j++) {

            currentPreviewPosition.push(
                {
                    i: location[i][j].i + down,
                    j: location[i][j].j,
                    color: location[i][j].color
                }
            )

            if (location[i][j].color != 0 && (gridCopy[location[i][j].i + down][location[i][j].j] == 0 || (gridCopy[location[i][j].i + down][location[i][j].j] == 8))) {
                gridCopy[location[i][j].i + down][location[i][j].j] = 9

            }

        }
    }




    drawGrid(gridCopy)




}



function downAsPossible(location) {

    let possible = 0;
    let realY = realYPositionPiece(location)

    for (let k = 1; k < gridCopy.length - realY; k++, possible++) {

        for (let j = 0; j < location[0].length; j++) {
            for (let i = location.length - 1; i >= 0; i--) {

                if (location[i][j].color != 0) {
                    if ((location[i][j].i + k) >= gridCopy.length ||
                        gridCopy[location[i][j].i + k][location[i][j].j] != 0 && gridCopy[location[i][j].i + k][location[i][j].j] != 8) {
                        return possible;
                    }



                    break
                }




            }

        }

    }


    return possible;

}

function hasColision(location) {

    for (let i = 0; i < location.length; i++) {
        for (let j = 0; j < location[0].length; j++) {

            if (location[i][j].color != 0) {

                if (location[i][j].i >= gridCopy.length ||
                    location[i][j].i < 0 ||
                    location[i][j].j >= gridCopy[0].length ||
                    location[i][j].j < 0 ||
                    (gridCopy[location[i][j].i][location[i][j].j] != 0 &&
                        gridCopy[location[i][j].i][location[i][j].j] != 8 &&
                        gridCopy[location[i][j].i][location[i][j].j] != 9)) {
                    return true
                }


            }

        }

    }

    return false

}

function rotatePiece(location, clock, rotateIndexTry = 0) {

    const rotated = structuredClone(location);

    for (let r = 0; r < location.length; r++) {
        for (let c = 0; c < location[0].length; c++) {
            if (clock) {
                rotated[c][location.length - 1 - r].color = location[r][c].color;
            } else {
                rotated[location.length - 1 - c][r].color = location[r][c].color;
            }
        }
    }


    if (rotateIndexTry == 0) {

        for (let i = 0; i < location.length; i++) {
            for (let j = 0; j < location.length; j++) {
                if (location[i][j].color != 0) {
                    gridCopy[location[i][j].i][location[i][j].j] = 0
                }
            }

        }
    }

    if (rotateIndexTry >= rotateTry[Number(clock)].length) {

        for (let i = 0; i < location.length; i++) {
            for (let j = 0; j < location.length; j++) {
                if (location[i][j].color != 0) {
                    gridCopy[location[i][j].i][location[i][j].j] = location[i][j].color
                }
            }

        }
        previewPosition(location)
        return
    }

    if (hasColision(rotated)) {

        movePiece(rotateTry[Number(clock)][rotateIndexTry].x, rotateTry[Number(clock)][rotateIndexTry].y, false, true)
        rotateIndexTry++;
        rotatePiece(location, clock, rotateIndexTry)

    } else {
        gridCopy = structuredClone(grid);

        for (let i = 0; i < rotated.length; i++) {
            for (let j = 0; j < rotated[0].length; j++) {
                if (rotated[i][j].color != 0) {
                    gridCopy[rotated[i][j].i][rotated[i][j].j] = rotated[i][j].color
                }
            }

        }

        currentPieceLocation = rotated
        previewPosition(rotated)
        sendGame(gridCopy, gridHoldCopy, gridNextCopy, roomId, localStorage.getItem("username"))
        audioRotate.currentTime = 0
        audioRotate.play()
    }



}

export function rotatePieceClock() {

    rotatePiece(currentPieceLocation, true)

}

export function rotatePieceAntiClock() {

    rotatePiece(currentPieceLocation, false)

}

export function test() {

    attackToReceive.lines += 2

}



function realYPositionPiece(location) {

    for (let i = location.length - 1; i > 0; i--) {
        for (let j = 0; j < location[0].length; j++) {

            if (location[i][j].color != 0 && location[i][j].color != 8) {
                return i;
            }

        }

    }

    return -1;

}

export function lockPiece() {

    startTime = null
    holdEnabled = true
    resetGravityTimer()


    for (let i = 0; i < currentPreviewPosition.length; i++) {
        if (currentPreviewPosition[i].color != 0) {
            grid[currentPreviewPosition[i].i][currentPreviewPosition[i].j] = currentPreviewPosition[i].color

        }


    }

    if (gameOver()) {
        endGame()
        return
    }

    audioHardDrop.currentTime = 0
    audioHardDrop.play()
    breakLine()
    sendGame(gridCopy, gridHoldCopy, gridNextCopy, roomId, localStorage.getItem("username"), true)


    if (gameOver()) {
        drawGrid(gridCopy)
        endGame()
        return
    }

    placePieceInGrid()


}

function gameOver() {

    for (let j = 0; j < grid[0].length; j++) {
        if (grid[1][j] != 8) {

            return true
        }

    }

    return false

}

function breakLine() {

    let linesBreak = 0

    for (let i = grid.length - 1; i >= 1;) {

        if (breakTheLine(i)) {

            for (let k = i; k >= 1; --k) {
                for (let j = 0; j < grid[0].length; j++) {
                    grid[k][j] = grid[k - 1][j]



                }


            }

            linesBreak++

        } else {
            i--
        }


    }

    if (linesBreak > 0) {

        if (linesBreak <= 2) {
            if (combo > 0) {
                sendAttack(roomId, 1)
            }

        } else if (linesBreak == 3) {
            sendAttack(roomId, 2)
        } else if (linesBreak == 4) {
            sendAttack(roomId, 4)
        } else {
            sendAttack(roomId, linesBreak)
        }

        if (combo > 0) {
            const index = Math.min(8, combo - 1)
            audiosCombo[index].currentTime = 0
            audiosCombo[index].play()

        }

        combo++

    } else {

        if (combo > 3) {
            comboFail.currentTime = 0
            comboFail.play()
        }

        combo = 0
        receiveAttack(attackToReceive.lines)

    }

    if (linesBreak > 0) {
        for (let j = 0; j < grid[0].length; j++) {
            grid[2][j] = 8

        }

        for (let i = 3; i < grid.length; i++) {
            for (let j = 0; j < grid[0].length; j++) {
                if (grid[i][j] == 8) {
                    grid[i][j] = 0
                }

            }


        }

    }


    switch (linesBreak) {
        case 0:
            break;
        case 1:
            audioBreakOne.currentTime = 0
            audioBreakOne.play()
            break;

        case 2:
            audioBreakTwo.currentTime = 0
            audioBreakTwo.play()
            break;

        case 3:
            audioBreakThree.currentTime = 0
            audioBreakThree.play()
            break;

        default:
            audioBreakFor.currentTime = 0
            audioBreakFor.play()
            break;
    }




}


function breakTheLine(i) {

    for (let j = 0; j < grid[0].length; j++) {
        if (grid[i][j] == 0 || grid[i][j] == 9 || grid[i][j] == 8) {
            return false
        }

    }

    return true


}

function receiveAttack(columns) {

    if (columns > 0) {

        let columnsToReceive
        let columnsToReceiveInNext = 0

        if (columns <= 8) {
            columnsToReceive = columns
        } else {
            columnsToReceive = 8
            columnsToReceiveInNext = columns - 8
        }

        if (columns < 4) {
            audioAttackLow.currentTime = 0
            audioAttackLow.play()
        } else {
            audioAttackHard.currentTime = 0
            audioAttackHard.play()
        }

        const randomRoleIndex = Math.floor(Math.random() * grid[0].length)

        for (let i = 0; i < grid.length; i++) {

            for (let j = 0; j < grid[0].length; j++) {

                if (i + columnsToReceive < grid.length) {

                    if (grid[i][j] != 8 || grid[i + columnsToReceive][j] != 0) {


                        grid[i][j] = grid[i + columnsToReceive][j]
                    }

                    if (grid[i][j] != 8) {
                        grid[i + columnsToReceive][j] = j != randomRoleIndex ? 11 : 0

                    }


                }

            }

        }

        gridCopy = structuredClone(grid)
        attackToReceive.lines = columnsToReceiveInNext

        if (gameOver()) {
            endGame()
        }

    }


}

function loadComboSounds() {

    const songs = []

    for (let i = 1; i <= 9; i++) {

        const comboAudio = new Audio('/audio/combo' + i + '.mp3')
        comboAudio.volume = 1
        songs.push(comboAudio)

    }

    return songs

}


