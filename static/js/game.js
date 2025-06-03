// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 300;
const OBSTACLE_WIDTH = 50;
const OBSTACLE_HEIGHT = 100;
const OBSTACLE_SPEED = CANVAS_WIDTH / 2; // 400 pixels per second (to cross in 2s)
const PLAYER_RADIUS = 20;
const GROUND_Y = CANVAS_HEIGHT - 20; // Ground level with small padding from bottom
const JUMP_INITIAL_VELOCITY = -500; // Negative because y-axis is inverted
const GRAVITY = 1200;

// Game state
const obstacles = [];
const otherPlayers = new Map(); // Map of player ID to player object
let localPlayer = {
    x: 100,
    y: 0,
    velocityY: 0,
    isJumping: false
};

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
    otherPlayers.clear();
});

socket.on('player_count_update', (data) => {
    playerCountElement.textContent = data.count;
});

socket.on('existing_players', (data) => {
    data.players.forEach(player => {
        if (player.id !== socket.id) {
            otherPlayers.set(player.id, {
                x: player.x,
                y: 0,
                velocityY: 0,
                isJumping: false
            });
        }
    });
});

socket.on('player_joined', (data) => {
    const newPlayer = data.player;
    if (newPlayer.id !== socket.id) {
        otherPlayers.set(newPlayer.id, {
            x: newPlayer.x,
            y: 0,
            velocityY: 0,
            isJumping: false
        });
    }
});

socket.on('player_left', (data) => {
    otherPlayers.delete(data.player_id);
});

socket.on('new_obstacle', (data) => {
    obstacles.push({
        x: CANVAS_WIDTH,
        y: GROUND_Y - OBSTACLE_HEIGHT, // Position obstacle on the ground
        width: OBSTACLE_WIDTH,
        height: OBSTACLE_HEIGHT
    });
});

socket.on('player_jumped', (data) => {
    const player = otherPlayers.get(data.player_id);
    if (player && !player.isJumping) {
        player.velocityY = JUMP_INITIAL_VELOCITY;
        player.isJumping = true;
    }
});

// Handle keyboard input
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !localPlayer.isJumping) {
        localPlayer.velocityY = JUMP_INITIAL_VELOCITY;
        localPlayer.isJumping = true;
        socket.emit('player_jump');
    }
});

// Game loop
let lastTime = performance.now();

function updatePlayer(player, deltaTime) {
    if (player.isJumping) {
        player.y += player.velocityY * deltaTime;
        player.velocityY += GRAVITY * deltaTime;

        // Check if player has landed
        if (player.y >= 0) {
            player.y = 0;
            player.velocityY = 0;
            player.isJumping = false;
        }
    }
}

function drawPlayer(x, y, color) {
    ctx.beginPath();
    // Draw player with bottom of circle touching the ground
    ctx.arc(x, GROUND_Y - PLAYER_RADIUS + y, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function gameLoop(currentTime) {
    // Calculate delta time in seconds
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw ground line
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.strokeStyle = 'black';
    ctx.stroke();

    // Update and draw obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.x -= OBSTACLE_SPEED * deltaTime;

        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1);
            continue;
        }

        ctx.fillStyle = 'red';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }

    // Update and draw local player
    updatePlayer(localPlayer, deltaTime);
    drawPlayer(localPlayer.x, localPlayer.y, 'green');

    // Update and draw other players
    otherPlayers.forEach((player) => {
        updatePlayer(player, deltaTime);
        drawPlayer(player.x, player.y, 'gray');
    });

    requestAnimationFrame(gameLoop);
}

// Start game loop
requestAnimationFrame(gameLoop); 