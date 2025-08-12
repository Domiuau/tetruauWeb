import { placeBackground } from "../utils.js";
const voltarBtn = document.getElementById('btn-voltar')
const name = document.getElementById('room-name');
const playerLimit = parseInt(document.getElementById('num-players').value, 10);
const usernameFromCreator = localStorage.getItem('username');

name.value = localStorage.getItem('username') + " room"


voltarBtn.addEventListener('click', () => {

    window.location.href = "/pages/availableRooms.html"

})

document.getElementById('btn-criar').addEventListener('click', () => {



    const payload = {
        name: name.value.trim(),
        playerLimit: playerLimit,
        usernameFromCreator: usernameFromCreator
    };

    fetch('/room/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Resposta do servidor:', data);
            window.location.href = `/pages/waitingRoom.html?id=${data.roomId}`
        })
        .catch(err => {
            console.error('Erro ao criar sala:', err);
        });
});


placeBackground();
