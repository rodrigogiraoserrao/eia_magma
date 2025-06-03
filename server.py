from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import os
from threading import Lock
from time import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

# Keep track of connected players and their data
connected_players = {}
thread = None
thread_lock = Lock()

def background_task():
    """Background task that emits new_obstacle event every 3 seconds."""
    while True:
        socketio.emit('new_obstacle', {'timestamp': time()})
        socketio.sleep(3)

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect(auth):
    global thread
    player_id = request.sid
    # Add player to connected players with initial position
    connected_players[player_id] = {
        'id': player_id,
        'x': 100,  # Fixed x position for all players
        'y': 0     # y position will be updated during jumps
    }
    
    # Send existing players to the new player
    existing_players = [player for pid, player in connected_players.items() if pid != player_id]
    emit('existing_players', {'players': existing_players})
    
    # Notify other players about the new player
    emit('player_joined', {'player': connected_players[player_id]}, broadcast=True, include_self=False)
    
    # Update player count
    emit('player_count_update', {'count': len(connected_players)}, broadcast=True)
    
    # Start background task only if it hasn't been started
    with thread_lock:
        if thread is None:
            thread = socketio.start_background_task(background_task)

@socketio.on('player_jump')
def handle_jump():
    player_id = request.sid
    if player_id in connected_players:
        # Broadcast jump event to other players
        emit('player_jumped', {'player_id': player_id}, broadcast=True, include_self=False)

@socketio.on('disconnect')
def handle_disconnect():
    player_id = request.sid
    if player_id in connected_players:
        del connected_players[player_id]
        emit('player_left', {'player_id': player_id}, broadcast=True)
        emit('player_count_update', {'count': len(connected_players)}, broadcast=True)

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    if not os.path.exists('templates'):
        os.makedirs('templates')
    # Create static directory if it doesn't exist
    if not os.path.exists('static'):
        os.makedirs('static')
    socketio.run(app, debug=False, use_reloader=False, host='0.0.0.0', port=int(os.environ.get('PORT', 10000)))
