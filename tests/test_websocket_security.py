import pytest
from backend.src import create_app
from backend.src.extensions import socketio, db
from backend.src.models.session import ClassroomSession
from backend.src.models.user import User
from backend.src.services.socket_service import SocketService

@pytest.fixture
def ws_app():
    app = create_app('testing')
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'JWT_SECRET_KEY': 'test-secret-key-that-is-at-least-32-bytes-long-for-jwt'
    })
    with app.app_context():
        db.create_all()
        # Seed test teacher and session
        t = User(email='prof@doubtx.ai', full_name='Professor', role='teacher')
        t.set_password('StrongPass123!')
        db.session.add(t)
        db.session.commit()

        s1 = ClassroomSession(session_code='DX-ROOM1', title='Room 1', teacher_id=t.id, is_active=True)
        s2 = ClassroomSession(session_code='DX-ROOM2', title='Room 2', teacher_id=t.id, is_active=True)
        db.session.add_all([s1, s2])
        db.session.commit()
        yield app
        db.session.remove()
        db.drop_all()

def test_websocket_connection_and_session_join(ws_app):
    """Test socket connection and joining a valid classroom session."""
    client = socketio.test_client(ws_app)
    assert client.is_connected()

    # Join valid session
    client.emit('join_session', {'session_code': 'DX-ROOM1'})
    events = client.get_received()
    join_ev = next((e for e in events if e['name'] == 'session:joined'), None)
    assert join_ev is not None
    assert join_ev['args'][0]['session_code'] == 'DX-ROOM1'
    assert 'session_' in join_ev['args'][0]['room']

    # Join non-existent session
    client.emit('join_session', {'session_code': 'NON-EXISTENT'})
    events2 = client.get_received()
    err_ev = next((e for e in events2 if e['name'] == 'session:error'), None)
    assert err_ev is not None

def test_websocket_room_isolation_between_classrooms(ws_app):
    """
    Verify room boundary security:
    Client in Room 1 receives doubts from Room 1.
    Client in Room 2 (or not joined) DOES NOT receive doubts from Room 1.
    """
    client_room1 = socketio.test_client(ws_app)
    client_room2 = socketio.test_client(ws_app)

    # Client 1 joins DX-ROOM1
    client_room1.emit('join_session', {'session_code': 'DX-ROOM1'})
    client_room1.get_received()  # flush join event

    # Client 2 joins DX-ROOM2
    client_room2.emit('join_session', {'session_code': 'DX-ROOM2'})
    client_room2.get_received()  # flush join event

    with ws_app.app_context():
        s1 = ClassroomSession.query.filter_by(session_code='DX-ROOM1').first()
        s2 = ClassroomSession.query.filter_by(session_code='DX-ROOM2').first()
        s1_id = s1.id
        s2_id = s2.id

    # Emit doubt created in Room 1
    SocketService.emit_doubt_created({
        'id': 101,
        'session_id': s1_id,
        'student_name': 'Alice',
        'doubt': 'Question for Room 1'
    })

    # Client in Room 1 must receive it
    events_room1 = client_room1.get_received()
    assert any(e['name'] == 'doubt:created' and e['args'][0]['id'] == 101 for e in events_room1)

    # Client in Room 2 must NOT receive Room 1 doubt
    events_room2 = client_room2.get_received()
    assert not any(e['name'] == 'doubt:created' for e in events_room2)
