import pytest
from backend.src import create_app
from backend.src.extensions import db
from backend.src.models.doubt import Doubt
from backend.src.models.user import User
from backend.src.models.session import ClassroomSession

@pytest.fixture
def app():
    app = create_app('testing')
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'JWT_SECRET_KEY': 'test-secret-key-that-is-at-least-32-bytes-long-for-jwt'
    })

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_legacy_home(client):
    """Test legacy GET / endpoint returns original string."""
    response = client.get('/')
    assert response.status_code == 200
    assert response.data.decode('utf-8') == "Doubt Queue System Running!"

def test_legacy_add(client):
    """Test legacy GET /add?name=...&doubt=... preserves exact contract."""
    response = client.get('/add?name=Alice&doubt=How+do+I+use+useState%3F')
    assert response.status_code == 200
    assert response.data.decode('utf-8') == "Doubt Added Successfully!"

    # Verify doubt exists in database with status QUEUED
    doubt = Doubt.query.filter_by(student_name='Alice').first()
    assert doubt is not None
    assert doubt.doubt == 'How do I use useState?'
    assert doubt.status == 'QUEUED'
    assert doubt.category is not None

def test_auth_workflow(client):
    """Test teacher registration, login, and token generation."""
    reg_res = client.post('/api/v1/auth/register', json={
        'email': 'prof.satyam@university.edu',
        'password': 'SecurePassword123!',
        'full_name': 'Prof. Satyam Kumar',
        'role': 'teacher'
    })
    assert reg_res.status_code == 201
    token = reg_res.json['token']
    assert token is not None

    # Login
    login_res = client.post('/api/v1/auth/login', json={
        'email': 'prof.satyam@university.edu',
        'password': 'SecurePassword123!'
    })
    assert login_res.status_code == 200
    assert login_res.json['user']['role'] == 'teacher'

    # Get /me
    me_res = client.get('/api/v1/auth/me', headers={'Authorization': f'Bearer {token}'})
    assert me_res.status_code == 200
    assert me_res.json['user']['email'] == 'prof.satyam@university.edu'

def test_session_and_doubt_queue_workflow(client):
    """Test session creation, doubt submission, queue positioning, and resolution."""
    # 1. Register teacher
    reg_res = client.post('/api/v1/auth/register', json={
        'email': 'teacher@doubtx.ai',
        'password': 'Password123!',
        'full_name': 'Dr. Teacher',
        'role': 'teacher'
    })
    token = reg_res.json['token']

    # 2. Create session
    sess_res = client.post('/api/v1/sessions', json={
        'title': 'Advanced Data Structures & Algorithms',
        'session_code': 'DSA-2026'
    }, headers={'Authorization': f'Bearer {token}'})
    assert sess_res.status_code == 201
    session_id = sess_res.json['session']['id']

    # 3. Student submits doubt 1
    d1_res = client.post('/api/v1/doubts', json={
        'session_id': session_id,
        'student_name': 'Bob Smith',
        'doubt': 'Why is my binary search getting into an infinite loop?'
    })
    assert d1_res.status_code == 201
    d1_id = d1_res.json['doubt']['id']
    assert d1_res.json['doubt']['queue_position'] == 1

    # 4. Student submits doubt 2
    d2_res = client.post('/api/v1/doubts', json={
        'session_id': session_id,
        'student_name': 'Carol Danvers',
        'doubt': 'How does Dijkstra handle negative edge weights?'
    })
    assert d2_res.status_code == 201
    assert d2_res.json['doubt']['queue_position'] == 2

    # 5. Teacher lists doubts for the session
    list_res = client.get(f'/api/v1/doubts?session_id={session_id}')
    assert list_res.status_code == 200
    assert len(list_res.json['doubts']) == 2
    assert list_res.json['stats']['queued'] == 2

    # 6. Teacher claims doubt 1
    claim_res = client.post(f'/api/v1/doubts/{d1_id}/claim', headers={'Authorization': f'Bearer {token}'})
    assert claim_res.status_code == 200
    assert claim_res.json['doubt']['status'] == 'IN_PROGRESS'

    # 7. Teacher resolves doubt 1
    resolve_res = client.patch(f'/api/v1/doubts/{d1_id}/status', json={
        'status': 'RESOLVED',
        'resolution_notes': 'Fixed boundary condition in while low <= high loop.'
    }, headers={'Authorization': f'Bearer {token}'})
    assert resolve_res.status_code == 200
    assert resolve_res.json['doubt']['status'] == 'RESOLVED'

    # 8. Check queue position of doubt 2 is now 1
    d2_check = client.get(f'/api/v1/doubts/{d2_res.json["doubt"]["id"]}')
    assert d2_check.json['doubt']['queue_position'] == 1

def test_ai_analysis_endpoint(client):
    """Test AI endpoint responds with structured analysis."""
    response = client.post('/api/v1/ai/analyze', json={
        'text': 'SELECT * FROM users WHERE id = 1 gives SyntaxError unexpected token'
    })
    assert response.status_code == 200
    result = response.json['result']
    assert 'category' in result
    assert 'priority' in result
    assert 'ai_hint' in result

def test_s3_presigned_url_generation(client):
    """Test S3 presigned URL generation (verifies 401 unauthenticated, 200 authenticated)."""
    # 1. Unauthenticated attempt must fail with 401
    unauth_res = client.post('/api/v1/uploads/presigned-url', json={
        'filename': 'error_trace.png',
        'content_type': 'image/png'
    })
    assert unauth_res.status_code == 401

    # 2. Register user and test authenticated presigned URL generation
    reg_res = client.post('/api/v1/auth/register', json={
        'email': 'uploader@doubtx.ai',
        'password': 'SecurePass123!',
        'full_name': 'Uploader User',
        'role': 'student'
    })
    token = reg_res.json['token']

    auth_res = client.post('/api/v1/uploads/presigned-url', json={
        'filename': 'error_trace.png',
        'content_type': 'image/png'
    }, headers={'Authorization': f'Bearer {token}'})
    assert auth_res.status_code == 200
    assert 'upload_url' in auth_res.json
    assert 'object_key' in auth_res.json

def test_ai_conversations_workflow(client):
    """Test AI Doubt Solver multi-turn chat, level adaptation, and conversation lifecycle."""
    # 1. Create a new conversation in Beginner mode
    create_res = client.post('/api/v1/ai/conversations', json={
        'title': 'Python Loops Discussion',
        'explanation_level': 'beginner'
    })
    assert create_res.status_code == 201
    conv = create_res.json['conversation']
    conv_id = conv['id']
    assert conv['explanation_level'] == 'beginner'

    # 2. Send first user message
    msg1_res = client.post(f'/api/v1/ai/conversations/{conv_id}/messages', json={
        'content': 'How does a while loop work in Python?',
        'explanation_level': 'beginner'
    })
    assert msg1_res.status_code == 201
    assert 'user_message' in msg1_res.json
    assert 'assistant_message' in msg1_res.json
    ai_msg1 = msg1_res.json['assistant_message']['content']
    assert len(ai_msg1) > 20

    # 3. Send follow-up message in Advanced mode
    msg2_res = client.post(f'/api/v1/ai/conversations/{conv_id}/messages', json={
        'content': 'Can you optimize this with a generator expression instead?',
        'explanation_level': 'advanced'
    })
    assert msg2_res.status_code == 201
    assert msg2_res.json['conversation']['explanation_level'] == 'advanced'

    # 4. Fetch conversation detail with history
    detail_res = client.get(f'/api/v1/ai/conversations/{conv_id}')
    assert detail_res.status_code == 200
    assert len(detail_res.json['conversation']['messages']) == 4  # 2 user + 2 assistant

    # 5. Test rename conversation
    rename_res = client.patch(f'/api/v1/ai/conversations/{conv_id}', json={
        'title': 'Renamed Python Discussion'
    })
    assert rename_res.status_code == 200
    assert rename_res.json['conversation']['title'] == 'Renamed Python Discussion'

    # 6. Test regenerate last message
    regen_res = client.post(f'/api/v1/ai/conversations/{conv_id}/regenerate', json={
        'explanation_level': 'advanced'
    })
    assert regen_res.status_code in [200, 201]
    assert 'assistant_message' in regen_res.json

    # 7. Delete conversation
    del_res = client.delete(f'/api/v1/ai/conversations/{conv_id}')
    assert del_res.status_code == 200

    # 8. Verify deletion
    verify_del = client.get(f'/api/v1/ai/conversations/{conv_id}')
    assert verify_del.status_code == 404

def test_ai_health_and_direct_uploads(client):
    """Test AI health check endpoint and authenticated direct file upload."""
    health_res = client.get('/api/v1/ai/health')
    assert health_res.status_code == 200
    assert 'status' in health_res.json
    assert 'model' in health_res.json

    import io
    data = {'file': (io.BytesIO(b'print("Hello DoubtX")'), 'test_snippet.py')}

    # 1. Unauthenticated direct upload must fail with 401
    unauth_res = client.post('/api/v1/uploads/direct', data=data, content_type='multipart/form-data')
    assert unauth_res.status_code == 401

    # 2. Authenticated direct upload succeeds with 201
    reg_res = client.post('/api/v1/auth/register', json={
        'email': 'direct.uploader@doubtx.ai',
        'password': 'SecurePass123!',
        'full_name': 'Direct Uploader',
        'role': 'student'
    })
    token = reg_res.json['token']

    data2 = {'file': (io.BytesIO(b'print("Hello DoubtX Authenticated")'), 'test_snippet.py')}
    upload_res = client.post('/api/v1/uploads/direct', data=data2, content_type='multipart/form-data', headers={'Authorization': f'Bearer {token}'})
    assert upload_res.status_code == 201
    assert 'file_url' in upload_res.json
    assert upload_res.json['filename'] == 'test_snippet.py'

def test_security_weak_password_rejection(client):
    """Verify registration rejects passwords shorter than 8 chars or lacking complexity."""
    res1 = client.post('/api/v1/auth/register', json={
        'email': 'weak1@doubtx.ai',
        'password': 'short',
        'full_name': 'Weak User'
    })
    assert res1.status_code == 400
    assert 'Weak Password' in res1.json['error']

    res2 = client.post('/api/v1/auth/register', json={
        'email': 'weak2@doubtx.ai',
        'password': 'alllowercase123',
        'full_name': 'Weak User'
    })
    assert res2.status_code == 400

def test_security_admin_privilege_escalation_blocked(client):
    """Verify public registration cannot self-assign the 'admin' role."""
    res = client.post('/api/v1/auth/register', json={
        'email': 'hacker@doubtx.ai',
        'password': 'HackerPassword123!',
        'full_name': 'Hacker',
        'role': 'admin'
    })
    assert res.status_code == 403
    assert 'Administrator accounts cannot be self-registered' in res.json['message']

def test_security_unverified_subscription_upgrade_blocked(client):
    """Verify normal students cannot self-upgrade to Pro or Campus without authorized payment/licensing."""
    reg_res = client.post('/api/v1/auth/register', json={
        'email': 'frugal.student@doubtx.ai',
        'password': 'StrongPassword123!',
        'full_name': 'Frugal Student',
        'role': 'student'
    })
    token = reg_res.json['token']

    # Attempt self-upgrade to 'campus'
    upgrade_res = client.post('/api/v1/auth/subscription/upgrade', json={
        'tier': 'campus'
    }, headers={'Authorization': f'Bearer {token}'})
    assert upgrade_res.status_code == 402
    assert upgrade_res.json['status'] == 'checkout_required'

    # Verify user tier in DB remains 'free'
    me_res = client.get('/api/v1/auth/me', headers={'Authorization': f'Bearer {token}'})
    assert me_res.json['user']['subscription_tier'] == 'free'

def test_security_admin_endpoints_authorization(client):
    """Verify students cannot access /api/v1/admin/* operations."""
    reg_res = client.post('/api/v1/auth/register', json={
        'email': 'normal.student@doubtx.ai',
        'password': 'StrongPassword123!',
        'full_name': 'Normal Student',
        'role': 'student'
    })
    token = reg_res.json['token']

    stats_res = client.get('/api/v1/admin/stats', headers={'Authorization': f'Bearer {token}'})
    assert stats_res.status_code == 403
    assert 'administrator privileges required' in stats_res.json['message'].lower()

    users_res = client.get('/api/v1/admin/users', headers={'Authorization': f'Bearer {token}'})
    assert users_res.status_code == 403

def test_security_conversation_isolation(client):
    """Verify User B cannot view, rename, or delete User A's private conversations."""
    # User A creates conversation
    reg_a = client.post('/api/v1/auth/register', json={
        'email': 'usera@doubtx.ai',
        'password': 'UserA_Password123!',
        'full_name': 'User Alpha'
    })
    token_a = reg_a.json['token']

    conv_res = client.post('/api/v1/ai/conversations', json={
        'title': 'Alpha Private Chat'
    }, headers={'Authorization': f'Bearer {token_a}'})
    conv_id = conv_res.json['conversation']['id']

    # User B registers
    reg_b = client.post('/api/v1/auth/register', json={
        'email': 'userb@doubtx.ai',
        'password': 'UserB_Password123!',
        'full_name': 'User Beta'
    })
    token_b = reg_b.json['token']

    # User B attempts to get User A's conversation
    get_res = client.get(f'/api/v1/ai/conversations/{conv_id}', headers={'Authorization': f'Bearer {token_b}'})
    assert get_res.status_code == 403

    # User B attempts to delete User A's conversation
    del_res = client.delete(f'/api/v1/ai/conversations/{conv_id}', headers={'Authorization': f'Bearer {token_b}'})
    assert del_res.status_code == 403


