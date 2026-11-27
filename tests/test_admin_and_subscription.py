import json
import pytest
from backend.src import create_app
from backend.src.extensions import db
from backend.src.models.user import User
from backend.src.models.conversation import Conversation

@pytest.fixture
def client():
    app = create_app('testing')
    with app.test_client() as test_client:
        with app.app_context():
            db.create_all()
            # Create student, teacher, admin
            s = User(email='test_student@doubtx.ai', full_name='Test Student', role='student', subscription_tier='free')
            s.set_password('Pass123!')
            t = User(email='test_teacher@doubtx.ai', full_name='Test Teacher', role='teacher', subscription_tier='pro')
            t.set_password('Pass123!')
            a = User(email='test_admin@doubtx.ai', full_name='Test Admin', role='admin', subscription_tier='campus')
            a.set_password('Pass123!')
            db.session.add_all([s, t, a])
            db.session.commit()
            yield test_client
            db.session.remove()
            db.drop_all()

def _login(client, email, password='Pass123!'):
    res = client.post('/api/v1/auth/login', json={'email': email, 'password': password})
    return res.get_json()['token']

def test_admin_rbac_and_stats(client):
    student_token = _login(client, 'test_student@doubtx.ai')
    admin_token = _login(client, 'test_admin@doubtx.ai')

    # Student cannot access admin stats
    res = client.get('/api/v1/admin/stats', headers={'Authorization': f'Bearer {student_token}'})
    assert res.status_code == 403

    # Admin can access admin stats
    res = client.get('/api/v1/admin/stats', headers={'Authorization': f'Bearer {admin_token}'})
    assert res.status_code == 200
    data = res.get_json()
    assert 'users' in data
    assert data['users']['total'] >= 3
    assert 'doubts' in data
    assert 'ai_workspace' in data

def test_admin_user_management(client):
    admin_token = _login(client, 'test_admin@doubtx.ai')
    student_token = _login(client, 'test_student@doubtx.ai')

    # List users
    res = client.get('/api/v1/admin/users?role=student', headers={'Authorization': f'Bearer {admin_token}'})
    assert res.status_code == 200
    data = res.get_json()
    assert len(data['users']) >= 1
    target_student_id = data['users'][0]['id']

    # Update role to teacher
    res = client.patch(
        f'/api/v1/admin/users/{target_student_id}/role',
        json={'role': 'teacher'},
        headers={'Authorization': f'Bearer {admin_token}'}
    )
    assert res.status_code == 200
    assert res.get_json()['user']['role'] == 'teacher'

    # Update tier to pro
    res = client.patch(
        f'/api/v1/admin/users/{target_student_id}/tier',
        json={'tier': 'pro'},
        headers={'Authorization': f'Bearer {admin_token}'}
    )
    assert res.status_code == 200
    assert res.get_json()['user']['subscription_tier'] == 'pro'

def test_subscription_workflow(client, monkeypatch):
    student_token = _login(client, 'test_student@doubtx.ai')

    # Check subscription
    res = client.get('/api/v1/auth/subscription', headers={'Authorization': f'Bearer {student_token}'})
    assert res.status_code == 200
    data = res.get_json()['subscription']
    assert data['tier'] == 'free'
    assert data['daily_quota'] == 20

    # 1. Direct unverified upgrade to pro must be blocked with 402 Payment Required
    unverified_res = client.post(
        '/api/v1/auth/subscription/upgrade',
        json={'tier': 'pro'},
        headers={'Authorization': f'Bearer {student_token}'}
    )
    assert unverified_res.status_code == 402
    assert unverified_res.get_json()['status'] == 'checkout_required'

    # 2. Upgrade with verified institutional license key succeeds
    monkeypatch.setenv('PRO_LICENSE_KEY', 'PRO-SECURE-KEY-2026')
    licensed_res = client.post(
        '/api/v1/auth/subscription/upgrade',
        json={'tier': 'pro', 'license_key': 'PRO-SECURE-KEY-2026'},
        headers={'Authorization': f'Bearer {student_token}'}
    )
    assert licensed_res.status_code == 200
    assert licensed_res.get_json()['user']['subscription_tier'] == 'pro'

    # 3. Downgrade to free is always permitted
    downgrade_res = client.post(
        '/api/v1/auth/subscription/upgrade',
        json={'tier': 'free'},
        headers={'Authorization': f'Bearer {student_token}'}
    )
    assert downgrade_res.status_code == 200
    assert downgrade_res.get_json()['user']['subscription_tier'] == 'free'

def test_conversation_pinning(client):
    student_token = _login(client, 'test_student@doubtx.ai')

    # Create conversation
    res = client.post(
        '/api/v1/ai/conversations',
        json={'title': 'Calculus Derivatives'},
        headers={'Authorization': f'Bearer {student_token}'}
    )
    conv_id = res.get_json()['conversation']['id']

    # 1. Unauthenticated toggle pin is blocked by privacy check (403)
    unauth_res = client.patch(f'/api/v1/ai/conversations/{conv_id}/pin')
    assert unauth_res.status_code == 403

    # 2. Authenticated owner can toggle pin
    res = client.patch(f'/api/v1/ai/conversations/{conv_id}/pin', headers={'Authorization': f'Bearer {student_token}'})
    assert res.status_code == 200
    assert res.get_json()['conversation']['is_pinned'] is True

    # 3. Authenticated owner can toggle unpin
    res = client.patch(f'/api/v1/ai/conversations/{conv_id}/pin', headers={'Authorization': f'Bearer {student_token}'})
    assert res.status_code == 200
    assert res.get_json()['conversation']['is_pinned'] is False
