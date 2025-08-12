import { placeBackground } from "../utils.js";

placeBackground();

const authContainer = document.getElementById('auth-container');
const salasContainer = document.getElementById('salas-container');
const loginForm = document.getElementById('login-form');
const submitBtn = document.getElementById('btn-confirmar')
const registerBtn = document.getElementById('btn-registrar');
const title = document.getElementById('title');
const btnVoltar = document.getElementById('btn-voltar');
const btnDeslogar = document.getElementById('btn-deslogadr');
let isLogin = true

const existingToken = localStorage.getItem('token');
if (existingToken) {
  showSalas();

}


loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (isLogin) {
    login()
  } else {
    register()
  }


});

registerBtn.addEventListener('click', () => {

  if (isLogin) {

    const div = document.createElement('div');
    div.className = 'form-group';
    div.id = 'confirm-password-group'

    const label = document.createElement('label');
    label.setAttribute('for', 'confirm-password');
    label.textContent = 'Confirmar Senha';

    const input = document.createElement('input');
    input.type = 'password';
    input.id = 'confirm-password';
    input.name = 'confirm-password';
    input.placeholder = 'Digite a senha novamente';
    input.required = true;

    div.appendChild(label);
    div.appendChild(input);

    loginForm.insertBefore(div, loginForm.querySelector('.btn-confirmar'));
    registerBtn.textContent = "Entrar"
    submitBtn.textContent = "Criar conta"
    title.textContent = 'Registre-se'


  } else {
    document.getElementById('confirm-password-group').remove();
    registerBtn.textContent = "Registre-se"
    submitBtn.textContent = "Entrar"
    title.textContent = 'Acesse sua Conta'

  }

  isLogin = !isLogin


});

function login() {

  const username = loginForm.username.value.trim();
  const password = loginForm.password.value;

  if (!username || !password) {
    alert('Por favor, preencha usuário e senha.');
    return;
  }

  fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
    .then(response => {
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      return response.json();
    })
    .then(data => {
      localStorage.setItem('username', data.username);
      localStorage.setItem('token', data.token);
      showSalas();
    })
    .catch(err => {
      console.error(err);
      alert('Falha ao fazer login. Verifique suas credenciais.');
    });
}

function register() {
  const username = loginForm.username.value.trim();
  const password = loginForm.password.value;
  const confirmPassword = loginForm['confirm-password']?.value;


  if (!username || !password) {
    alert('Para registrar, preencha usuário e senha.');
    return;
  }

  if (confirmPassword != password) {
    alert('Para registrar, as senhas devem ser iguais.');
    return;
  }

  fetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
    .then(response => {
      if (!response.ok)
        throw new Error(`Erro ${response.status}`);
      return response.json();
    })
    .then(data => {
      localStorage.setItem('username', data.username);
      localStorage.setItem('token', data.token);
      showSalas();
    })
    .catch(err => {
      console.error(err);
      alert('Falha ao registrar. Tente novamente.');
    });
}




function showSalas() {

  authContainer.style.display = 'none';
  salasContainer.style.display = 'block';
  carregarSalasDisponiveis();

}

function carregarSalasDisponiveis() {
  const token = localStorage.getItem('token');

  fetch('/room/availables', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(response => {
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      return response.json();
    })
    .then(dados => {
      const lista = document.querySelector('.lista-salas');
      lista.innerHTML = '';

      if (dados.availables && dados.availables.length) {
        dados.availables.forEach(sala => {
          const item = document.createElement('li');
          item.className = 'sala';
          item.addEventListener('click', () => {
            window.location.href = `/pages/waitingRoom.html?id=${sala.id}`;
          });
          item.innerHTML = `
            <div>${sala.name}</div>
            <div>${sala.playerCount}/${sala.playerLimit} jogadores</div>
          `;
          lista.appendChild(item);
        });
      } else {
        const vazio = document.createElement('li');
        vazio.className = 'sala';
        vazio.textContent = 'Nenhuma sala disponível no momento.';
        lista.appendChild(vazio);
      }
    })
    .catch(err => {
      console.error('Erro ao carregar as salas:', err);
      alert('Não foi possível carregar salas.');
    });
}


document.querySelector('.btn-criar-sala').addEventListener('click', () => {
  window.location.href = '/pages/createRoom.html';
});

btnVoltar.addEventListener('click', () => {
  window.location.href = '../index.html';
});

btnDeslogar.addEventListener('click', () => {
  localStorage.clear()
  window.location.href = '../index.html';
});
