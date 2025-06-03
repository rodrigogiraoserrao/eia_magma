// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 300;
const OBSTACLE_WIDTH = 50;
const OBSTACLE_HEIGHT = 100;
const OBSTACLE_SPEED = CANVAS_WIDTH / 2; // 400 pixels per second (to cross in 2s)

// Game state
const obstacles = [];

// Get DOM elements
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const playerCountElement = document.getElementById('count');

// Connect to Socket.IO server
const socket = io();

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

socket.on('new_obstacle', (data) => {
    // Create new obstacle at the right edge of the canvas
    obstacles.push({
        x: CANVAS_WIDTH,
        y: (CANVAS_HEIGHT - OBSTACLE_HEIGHT) / 2,
        width: OBSTACLE_WIDTH,
        height: OBSTACLE_HEIGHT
    });
});

// Game loop
let lastTime = performance.now();

function gameLoop(currentTime) {
    // Calculate delta time in seconds
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Update and draw obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        
        // Update obstacle position
        obstacle.x -= OBSTACLE_SPEED * deltaTime;

        // Remove obstacle if it's off screen
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1);
            continue;
        }

        // Draw obstacle
        ctx.fillStyle = 'red';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }

    // Request next frame
    requestAnimationFrame(gameLoop);
}

// Start game loop
requestAnimationFrame(gameLoop); 