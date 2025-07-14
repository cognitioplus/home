// main.js
const socket = io();

// Chat feature
function sendChat() {
  const input = document.getElementById('chatInput');
  if (input.value.trim()) {
    socket.emit('chatMessage', input.value);
    input.value = '';
  }
}

socket.on('chatMessage', (msg) => {
  const messages = document.getElementById('messages');
  const div = document.createElement('div');
  div.textContent = msg;
  messages.appendChild(div);
});

// Resilience status feature
function sendStatusUpdate() {
  const status = {
    info: 'Resilience protocol updated at ' + new Date().toLocaleTimeString()
  };
  socket.emit('statusUpdate', status);
}

socket.on('statusUpdate', (data) => {
  document.getElementById('status-info').textContent = data.info;
});
