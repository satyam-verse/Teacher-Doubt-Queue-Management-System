from functools import wraps
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from backend.src.extensions import db
from backend.src.models.user import User
from backend.src.models.doubt import Doubt
from backend.src.models.conversation import Conversation, ConversationMessage
from backend.src.models.session import ClassroomSession
from backend.src.services.ai_service import AIService

admin_bp = Blueprint('admin', __name__, url_prefix='/api/v1/admin')

def admin_required():
    """
    Strict decorator to verify that the authenticated user has an active 'admin' role in the database.
    Does not rely solely on JWT claims, mitigating stale privileges if an account is demoted or revoked.
    """
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            user_id = get_jwt_identity()
            if not user_id:
                return jsonify({'error': 'Unauthorized', 'message': 'Authentication required.'}), 401

            user = db.session.get(User, int(user_id))
            if not user or user.role != 'admin':
                return jsonify({'error': 'Forbidden', 'message': 'Institutional administrator privileges required.'}), 403

            return fn(*args, **kwargs)
        return decorator
    return wrapper

@admin_bp.route('/stats', methods=['GET'])
@admin_required()
def get_admin_stats():
    """Returns platform-wide metrics and institutional health indicators."""
    total_users = User.query.count()
    students_count = User.query.filter_by(role='student').count()
    teachers_count = User.query.filter_by(role='teacher').count()
    admins_count = User.query.filter_by(role='admin').count()

    total_doubts = Doubt.query.count()
    queued_doubts = Doubt.query.filter_by(status='QUEUED').count()
    in_progress_doubts = Doubt.query.filter_by(status='IN_PROGRESS').count()
    resolved_doubts = Doubt.query.filter_by(status='RESOLVED').count()

    total_conversations = Conversation.query.count()
    total_ai_messages = ConversationMessage.query.count()

    free_tier_count = User.query.filter_by(subscription_tier='free').count()
    pro_tier_count = User.query.filter_by(subscription_tier='pro').count()
    campus_tier_count = User.query.filter_by(subscription_tier='campus').count()

    # Calculate average resolution time for resolved doubts
    resolved_with_time = Doubt.query.filter(Doubt.status == 'RESOLVED', Doubt.resolved_at.isnot(None)).all()
    avg_resolution_minutes = 0.0
    if resolved_with_time:
        durations = [
            (d.resolved_at - d.created_at).total_seconds() / 60.0
            for d in resolved_with_time
            if d.resolved_at and d.created_at and d.resolved_at >= d.created_at
        ]
        if durations:
            avg_resolution_minutes = round(sum(durations) / len(durations), 1)

    return jsonify({
        'users': {
            'total': total_users,
            'students': students_count,
            'teachers': teachers_count,
            'admins': admins_count,
            'tier_distribution': {
                'free': free_tier_count,
                'pro': pro_tier_count,
                'campus': campus_tier_count
            }
        },
        'doubts': {
            'total': total_doubts,
            'queued': queued_doubts,
            'in_progress': in_progress_doubts,
            'resolved': resolved_doubts,
            'avg_resolution_minutes': avg_resolution_minutes
        },
        'ai_workspace': {
            'total_conversations': total_conversations,
            'total_messages_generated': total_ai_messages
        }
    }), 200

@admin_bp.route('/users', methods=['GET'])
@admin_required()
def list_users():
    """Lists users with optional filtering by role, tier, and search query."""
    q = request.args.get('q', '').strip()
    role_filter = request.args.get('role', '').strip().lower()
    tier_filter = request.args.get('tier', '').strip().lower()

    query = User.query

    if q:
        query = query.filter((User.full_name.ilike(f'%{q}%')) | (User.email.ilike(f'%{q}%')))

    if role_filter in ['student', 'teacher', 'admin']:
        query = query.filter_by(role=role_filter)

    if tier_filter in ['free', 'pro', 'campus']:
        query = query.filter_by(subscription_tier=tier_filter)

    users = query.order_by(User.created_at.desc()).limit(100).all()

    return jsonify({
        'users': [u.to_dict() for u in users],
        'count': len(users)
    }), 200

@admin_bp.route('/users/<int:user_id>/role', methods=['PATCH'])
@admin_required()
def update_user_role(user_id):
    current_admin_id = int(get_jwt_identity())
    if current_admin_id == user_id:
        return jsonify({'error': 'Bad Request', 'message': 'Administrators cannot modify their own role.'}), 400

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    new_role = data.get('role', '').strip().lower()
    if new_role not in ['student', 'teacher', 'admin']:
        return jsonify({'error': 'Invalid role. Choose student, teacher, or admin.'}), 400

    # Prevent demoting the last active administrator
    if user.role == 'admin' and new_role != 'admin':
        active_admins = User.query.filter_by(role='admin').count()
        if active_admins <= 1:
            return jsonify({'error': 'Bad Request', 'message': 'Cannot demote the sole remaining administrator.'}), 400

    user.role = new_role
    db.session.commit()

    return jsonify({
        'message': f"User role updated to '{new_role}'",
        'user': user.to_dict()
    }), 200

@admin_bp.route('/users/<int:user_id>/tier', methods=['PATCH'])
@admin_required()
def update_user_tier(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    new_tier = data.get('tier', '').strip().lower()
    if new_tier not in ['free', 'pro', 'campus']:
        return jsonify({'error': 'Invalid tier. Choose free, pro, or campus.'}), 400

    user.subscription_tier = new_tier
    db.session.commit()

    return jsonify({
        'message': f"User subscription tier updated to '{new_tier}'",
        'user': user.to_dict()
    }), 200

@admin_bp.route('/health', methods=['GET'])
@admin_required()
def get_system_health():
    """System diagnostic probe for administrators."""
    ai_status = AIService.check_gemini_health()

    # Check DB status
    db_status = 'connected'
    try:
        db.session.execute(db.text('SELECT 1'))
    except Exception as e:
        db_status = f'error: {str(e)}'

    return jsonify({
        'status': 'healthy' if db_status == 'connected' else 'degraded',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'services': {
            'database': {
                'status': db_status,
                'engine': db.engine.name
            },
            'gemini_ai': ai_status,
            'websocket': {
                'status': 'active',
                'protocol': 'socket.io v4'
            }
        }
    }), 200
