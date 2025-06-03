from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

# Keep track of connected players
connected_players = set()

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect(auth):
    connected_players.add(request.sid)
    player_count = len(connected_players)
    emit('player_count_update', {'count': player_count}, broadcast=True)
    emit('player_joined', {'message': 'A new player has joined!'}, broadcast=True, include_self=False)

@socketio.on('disconnect')
def handle_disconnect():
    connected_players.remove(request.sid)
    player_count = len(connected_players)
    emit('player_count_update', {'count': player_count}, broadcast=True)
    emit('player_left', {'message': 'A player has left.'}, broadcast=True)

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    if not os.path.exists('templates'):
        os.makedirs('templates')
    # Create static directory if it doesn't exist
    if not os.path.exists('static'):
        os.makedirs('static')
    socketio.run(app, debug=True) 