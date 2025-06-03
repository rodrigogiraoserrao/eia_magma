// Socket.io setup
const socket = io();

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add a simple cube to visualize the 3D scene
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// UI elements
const playerCounter = document.getElementById('player-counter');
const notifications = document.getElementById('notifications');

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Socket event handlers
socket.on('player_count_update', (data) => {
    playerCounter.textContent = `Players: ${data.count}`;
});

socket.on('player_joined', (data) => {
    showNotification(data.message);
});

socket.on('player_left', (data) => {
    showNotification(data.message);
});

// Helper function to show notifications
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    notification.style.padding = '10px';
    notification.style.marginTop = '5px';
    notification.style.borderRadius = '5px';
    notifications.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notifications.removeChild(notification);
    }, 3000);
} 