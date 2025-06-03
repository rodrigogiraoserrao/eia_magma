from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

# Keep track of connected players
connected_players = 0

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    global connected_players
    connected_players += 1
    # Broadcast to all clients the new player count
    emit('player_count_update', {'count': connected_players}, broadcast=True)
    print(f"Player connected. Total players: {connected_players}")

@socketio.on('disconnect')
def handle_disconnect():
    global connected_players
    connected_players -= 1
    # Broadcast to all clients the new player count
    emit('player_count_update', {'count': connected_players}, broadcast=True)
    print(f"Player disconnected. Total players: {connected_players}")

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5001) 