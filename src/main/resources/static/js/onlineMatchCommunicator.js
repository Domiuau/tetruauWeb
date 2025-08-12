import { prepareGameGrid, rows, cols, biggerX, updatePlayer, removeGame, removeOtherGame, endGame, audioBattleMusic } from "./game.js"
import { attackToReceive, showGame, starGame } from "./gameLogic.js";
import { stompClient } from "./stompClient.js";

export let startPlayersCount = 0
export let linesSend = 0

export function createGridGames(players) {

    let grids = []
    linesSend = 0

    console.log(players)

    startPlayersCount = players.length

    for (let i = 0; i < players.length; i++) {

        if (players[i].name == localStorage.getItem("username")) continue;

        let grid = Array.from({ length: rows }, () => Array(cols).fill(0));
        prepareGameGrid(grid)

        let gridNext = Array.from({ length: rows - 1 }, () => Array(biggerX).fill(0));

        for (let i = 0; i < gridNext.length; i++) {
            for (let j = 0; j < gridNext[0].length; j++) {
                gridNext[i][j] = 10
            }

        }

        let gridHold = Array.from({ length: biggerX }, () => Array(biggerX).fill(0));

        for (let i = 0; i < gridHold.length; i++) {
            for (let j = 0; j < gridHold[0].length; j++) {
                gridHold[i][j] = 10
            }

        }

        grids.push({
            player: players[i],
            gridHold: gridHold,
            grid: grid,
            gridNext: gridNext
        })

    }

    return grids

}

export function sendAttack(roomId, lines) {

    if (attackToReceive.lines > lines) {
        attackToReceive.lines -= lines
        return
    } else {


        const realLineToSend = lines - attackToReceive.lines


        if (stompClient && stompClient.connected) {

            linesSend += realLineToSend

            const attack = {
                from: localStorage.getItem("username"),
                lines: realLineToSend,
                roomId: roomId,

            };

            stompClient.publish({
                destination: "/app/game/send-attack",
                body: JSON.stringify(attack)
            });
        }

        attackToReceive.lines = 0

    }



}

export function gameUpdateSubscrible(roomId) {
    stompClient.onConnect = (frame) => {

        stompClient.subscribe('/game/play/' + roomId, (data) => {

            updatePlayer(JSON.parse(data.body))

        });

        stompClient.subscribe('/game/receive-attack/' + roomId, (data) => {

            const attackData = JSON.parse(data.body)

            if (localStorage.getItem("username") == attackData.to) {
                attackToReceive.lines += attackData.lines
            }

        });

        stompClient.subscribe('/game/eliminate/' + roomId, (data) => {

            const eliminateData = JSON.parse(data.body)

            if (eliminateData.player == localStorage.getItem("username")) {
                removeGame()
            } else {
                removeOtherGame(eliminateData.player)
            }

        });

        stompClient.subscribe('/game/end/' + roomId, (data) => {

            const endGameData = JSON.parse(data.body)
            endGame(endGameData)

        });

        setTimeout(() => {
            showGame()
        }, 100);

        setTimeout(() => {
            starGame()
            audioBattleMusic.play()
        }, 3000);


    }
}

export function sendGame(grid, gridHold, gridNext, roomId, username, increaseSpeed = false) {
    if (stompClient && stompClient.connected) {
        const message = {
            grid: grid,
            gridHold: gridHold,
            gridNext: gridNext,
            room: roomId,
            from: username,
            increaseSpeed: increaseSpeed
        };

        stompClient.publish({
            destination: "/app/game",
            body: JSON.stringify(message)
        });
    }
}

export function sendEliminated(player, roomId) {
    if (stompClient && stompClient.connected) {
        const eliminated = {
            player: player,
            roomId: roomId,
            linesSend: linesSend

        };

        stompClient.publish({
            destination: "/app/game/eliminated",
            body: JSON.stringify(eliminated)
        });
    }
}

