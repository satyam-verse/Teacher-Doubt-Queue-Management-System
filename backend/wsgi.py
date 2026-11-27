import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.src import create_app
from backend.src.extensions import socketio

app = create_app(os.environ.get('FLASK_ENV', 'production'))

if __name__ == '__main__':
    socketio.run(app)
