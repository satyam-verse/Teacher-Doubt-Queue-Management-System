"""
DoubtX AI - Upgraded Real-Time Classroom Doubt Queue System
Maintained backward compatibility with existing routes:
  - GET /      -> Returns "Doubt Queue System Running!"
  - GET /add   -> Inserts doubt, analyzes via Gemini AI, emits WebSocket event, returns "Doubt Added Successfully!"
"""
import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.src import create_app
from backend.src.extensions import socketio

app = create_app(os.environ.get('FLASK_ENV', 'development'))

if __name__ == '__main__':
    # Default to 5000 for standard unprivileged development, or env PORT (e.g. 80 in prod)
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    print(f"[DoubtX AI] Server running on http://{host}:{port}")
    socketio.run(
        app,
        host=host,
        port=port,
        debug=app.config.get('DEBUG', False),
        allow_unsafe_werkzeug=True
    )
