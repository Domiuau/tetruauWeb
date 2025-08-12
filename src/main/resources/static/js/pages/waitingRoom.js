import { placeBackground } from "../utils.js";
import { stompClient } from "../stompClient.js";
placeBackground()

const listaJogadores = document.querySelector('.lista-jogadores');
const salaId = document.getElementById('sala-id-text')
const chatContainer = document.getElementById('chat-mensagens');
const chatInput = document.getElementById('chat-input');
const sendButton = document.querySelector('.btn-enviar');
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('id')

const audioMenuMusic = new Audio('/audio/menuMusic.mp3');
audioMenuMusic.volume = 0.08
audioMenuMusic.loop = true
audioMenuMusic.play()


console.log(roomId)

stompClient.onConnect = (frame) => {

    joinRoom()
    subscribleRoom()
    subscribeChat()
    subscribeStartGame()
};



function joinRoom() {

    const message = {
        roomId: roomId,
        playerName: localStorage.getItem("username")
    };

    stompClient.publish({
        destination: "/app/room",
        body: JSON.stringify(message)
    });

}

function subscribeStartGame() {

    stompClient.subscribe('/game/start/' + roomId, (startData) => {

        const startGame = JSON.parse(startData.body);
        localStorage.setItem('playerNamesList', JSON.stringify(startGame.players));
        window.location.href = `/pages/game.html?id=${roomId}`;

    });

}

function subscribeChat() {

    stompClient.subscribe('/room/chat/' + roomId, (messageData) => {

        const message = JSON.parse(messageData.body);

        recieveMessage(message.from, ': ' + message.message)


    });

}

function subscribleRoom() {
    stompClient.subscribe('/room/' + roomId, (room) => {
        console.log(room.body);

        const data = JSON.parse(room.body);

        listaJogadores.innerHTML = '';
        salaId.textContent = roomId

        data.players.forEach(player => {
            const li = document.createElement('li');
            li.classList.add('jogador');
            li.id = player.name

            const spanNome = document.createElement('span');
            spanNome.classList.add('jogador-nome');
            spanNome.textContent = player.name;

            const spanVitorias = document.createElement('span');
            spanVitorias.classList.add('jogador-vitorias');

            spanVitorias.textContent = `${player.wins} / ${data.matchesPlayed}`;

            li.appendChild(spanNome);
            li.appendChild(spanVitorias);

            listaJogadores.appendChild(li);
        });

        if (data.action == "JOIN") {
            recieveMessage(data.username, " entrou.", 'green')
           // localStorage.setItem('playerNamesList', JSON.stringify(data.players));

        } else {
            recieveMessage(data.username, " saiu.", 'red')
        }

    });
}

function recieveMessage(from, message, color = 'white') {
    const texto = message;
    if (!texto) return;

    const msgEl = document.createElement('div');
    msgEl.classList.add('chat-mensagem');

    const nomeEl = document.createElement('strong');
    nomeEl.textContent = from;

    const textoEl = document.createElement('span');
    textoEl.textContent = texto;

    if (color) {
        textoEl.style.color = color;
    }

    msgEl.appendChild(nomeEl);
    msgEl.appendChild(textoEl);

    chatContainer.appendChild(msgEl);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    chatInput.value = '';
    chatInput.focus();
}


function sendMessage(messageToSend) {

    const message = {
        message: messageToSend,
        room: roomId,
        from: localStorage.getItem("username")
    };

    stompClient.publish({
        destination: "/app/room/chat",
        body: JSON.stringify(message)
    });
}




document.querySelector('.btn-copiar-id').addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('sala-id-text').textContent)

});

document.querySelector('.btn-enviar').addEventListener('click', () => {
    sendMessage(chatInput.value)
});

document.querySelector('.btn-jogar').addEventListener('click', () => {
    
    const startGameData = {
        room: roomId,
        from: localStorage.getItem("username")
    };

    stompClient.publish({
        destination: "/app/game/start",
        body: JSON.stringify(startGameData)
    });


});

document.querySelector('.btn-sair').addEventListener('click', () => {
    window.location.href = '/';
});