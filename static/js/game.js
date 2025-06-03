// Connect to the Socket.IO server
console.log('Initializing socket connection...');
const socket = io({
    transports: ['websocket'],
    upgrade: false
});

// Get DOM elements
const playerCountElement = document.getElementById('count');
console.log('Player count element:', playerCountElement);

// Socket event handlers
socket.on('connect', () => {
    console.log('Successfully connected to server');
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

socket.on('player_count_update', (data) => {
    console.log('Player count updated:', data.count);
    if (playerCountElement) {
        playerCountElement.textContent = data.count;
    } else {
        console.error('Could not find player count element');
    }
}); 