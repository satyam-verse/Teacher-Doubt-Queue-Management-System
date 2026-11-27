import logging
from flask_socketio import join_room, leave_room, emit
from backend.src.extensions import socketio
from backend.src.models.session import ClassroomSession

logger = logging.getLogger(__name__)

# ==================== Socket.IO Event Handlers ====================

@socketio.on('connect')
def on_connect(auth=None):
    """Handles incoming WebSocket connection."""
    logger.info("WebSocket client connected")

@socketio.on('join_session')
def on_join_session(data):
    """
    Subscribes the socket client to a specific classroom session room.
    Validates that the target session exists and is active, preventing cross-classroom event leakage.
    """
    if not isinstance(data, dict):
        return

    session_id = data.get('session_id')
    session_code = data.get('session_code')

    session = None
    if session_id:
        session = ClassroomSession.query.filter_by(id=session_id, is_active=True).first()
    elif session_code:
        session = ClassroomSession.query.filter_by(session_code=str(session_code).strip().upper(), is_active=True).first()

    if session:
        room_name = f"session_{session.id}"
        join_room(room_name)
        logger.info(f"Socket successfully subscribed to room: {room_name}")
        emit('session:joined', {
            'session_id': session.id,
            'session_code': session.session_code,
            'title': session.title,
            'room': room_name
        })
    else:
        emit('session:error', {'message': 'Classroom session not found or inactive.'})

@socketio.on('leave_session')
def on_leave_session(data):
    """Unsubscribes the socket client from a classroom session room."""
    if not isinstance(data, dict):
        return
    session_id = data.get('session_id')
    if session_id:
        room_name = f"session_{session_id}"
        leave_room(room_name)
        emit('session:left', {'room': room_name})

# ==================== Isolated Emission Service ====================

class SocketService:
    @staticmethod
    def emit_doubt_created(doubt_data: dict) -> None:
        """Broadcast new doubt exclusively to the session room."""
        try:
            session_id = doubt_data.get('session_id')
            if session_id:
                socketio.emit('doubt:created', doubt_data, room=f"session_{session_id}")
            else:
                socketio.emit('doubt:created', doubt_data)
        except Exception as e:
            logger.error(f"Error emitting doubt:created: {e}")

    @staticmethod
    def emit_doubt_updated(doubt_data: dict) -> None:
        """Broadcast doubt update (IN_PROGRESS or RESOLVED) exclusively to the session room."""
        try:
            session_id = doubt_data.get('session_id')
            if session_id:
                socketio.emit('doubt:updated', doubt_data, room=f"session_{session_id}")
            else:
                socketio.emit('doubt:updated', doubt_data)
        except Exception as e:
            logger.error(f"Error emitting doubt:updated: {e}")

    @staticmethod
    def emit_doubt_resolved(doubt_data: dict) -> None:
        """Broadcast doubt resolution event exclusively to the session room."""
        try:
            session_id = doubt_data.get('session_id')
            if session_id:
                socketio.emit('doubt:resolved', doubt_data, room=f"session_{session_id}")
            else:
                socketio.emit('doubt:resolved', doubt_data)
        except Exception as e:
            logger.error(f"Error emitting doubt:resolved: {e}")

    @staticmethod
    def emit_stats_updated(session_id: int, stats: dict) -> None:
        """Broadcast queue statistics exclusively to the session room."""
        try:
            if session_id:
                socketio.emit('stats:updated', stats, room=f"session_{session_id}")
            else:
                socketio.emit('stats:updated', stats)
        except Exception as e:
            logger.error(f"Error emitting stats:updated: {e}")
