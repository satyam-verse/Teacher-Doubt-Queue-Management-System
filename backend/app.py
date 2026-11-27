import os
import sys

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.src import create_app
from backend.src.extensions import socketio

app = create_app(os.environ.get('FLASK_ENV', 'development'))

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    print(f"[DoubtX AI] Backend running on http://{host}:{port}")
    socketio.run(app, host=host, port=port, debug=app.config.get('DEBUG', False), allow_unsafe_werkzeug=True)
