// Connect to the Socket.IO server
const socket = io();

// Get DOM elements
const playerCountElement = document.getElementById('count');

// Socket event handlers
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

socket.on('player_count_update', (data) => {
    console.log('Player count updated:', data.count);
    playerCountElement.textContent = data.count;
}); 