from flask import Flask, render_template, send_from_directory
from flask_socketio import SocketIO, emit
import os
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_url_path='/static')
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*", logger=True, engineio_logger=True)

# Keep track of connected players
connected_players = 0

@app.route('/')
def index():
    logger.debug("Serving index.html")
    return render_template('index.html')

@app.route('/static/<path:path>')
def send_static(path):
    logger.debug(f"Serving static file: {path}")
    return send_from_directory('static', path)

@socketio.on('connect')
def handle_connect():
    global connected_players
    connected_players += 1
    logger.debug(f"Player connected. Total players: {connected_players}")
    # Broadcast to all clients the new player count
    emit('player_count_update', {'count': connected_players}, broadcast=True)

@socketio.on('disconnect')
def handle_disconnect():
    global connected_players
    connected_players -= 1
    logger.debug(f"Player disconnected. Total players: {connected_players}")
    # Broadcast to all clients the new player count
    emit('player_count_update', {'count': connected_players}, broadcast=True)

if __name__ == '__main__':
    logger.info("Starting server...")
    socketio.run(app, debug=True, host='0.0.0.0', port=5002)