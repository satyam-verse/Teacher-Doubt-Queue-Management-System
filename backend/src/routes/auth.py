import os
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from backend.src.extensions import db
from backend.src.models.user import User, validate_password_strength

auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()
    requested_role = data.get('role', 'student').strip().lower()

    if not email or not password or not full_name:
        return jsonify({'error': 'Missing required fields: email, password, full_name'}), 400

    # 1. Enforce password complexity criteria
    is_valid, msg = validate_password_strength(password)
    if not is_valid:
        return jsonify({'error': 'Weak Password', 'message': msg}), 400

    # 2. Strict privilege escalation prevention
    if requested_role == 'admin':
        return jsonify({'error': 'Forbidden', 'message': 'Administrator accounts cannot be self-registered.'}), 403
    elif requested_role == 'teacher':
        required_invite = os.environ.get('TEACHER_INVITE_CODE')
        invite_code = data.get('invite_code', '').strip()
        if required_invite and invite_code != required_invite:
            return jsonify({'error': 'Forbidden', 'message': 'A valid institutional teacher invite code is required.'}), 403
        role = 'teacher'
    else:
        role = 'student'

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'An account with this email already exists'}), 409

    user = User(
        email=email,
        full_name=full_name,
        role=role,
        subscription_tier='free',
        subscription_status='active'
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role, 'email': user.email, 'full_name': user.full_name}
    )

    return jsonify({
        'message': 'User registered successfully',
        'token': token,
        'user': user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role, 'email': user.email, 'full_name': user.full_name}
    )

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()}), 200

@auth_bp.route('/subscription', methods=['GET'])
@jwt_required()
def get_subscription():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'subscription': {
            'tier': user.subscription_tier,
            'status': user.subscription_status,
            'daily_queries_used': user.daily_ai_query_count,
            'daily_quota': user.get_query_quota(),
            'features': {
                'unlimited_queries': user.subscription_tier in ['pro', 'campus'],
                'multimodal_pdf_images': True,
                'latex_katex_export': True,
                'priority_live_queue': user.subscription_tier in ['pro', 'campus'],
                'department_analytics': user.subscription_tier == 'campus'
            }
        }
    }), 200

@auth_bp.route('/subscription/upgrade', methods=['POST'])
@jwt_required()
def upgrade_subscription():
    """
    Subscription upgrade endpoint.
    Prevents unauthorized self-elevation to paid Pro/Campus tiers without authorized licensing or payment confirmation.
    """
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    tier = data.get('tier', 'pro').strip().lower()
    if tier not in ['pro', 'campus', 'free']:
        return jsonify({'error': 'Invalid subscription tier. Choose free, pro, or campus.'}), 400

    # Free tier downgrade/reset is always permitted
    if tier == 'free':
        user.subscription_tier = 'free'
        user.subscription_status = 'active'
        db.session.commit()
        return jsonify({
            'message': 'Subscription updated to Free tier.',
            'user': user.to_dict()
        }), 200

    # Authorized licensing check
    license_key = data.get('license_key', '').strip()
    campus_license = os.environ.get('CAMPUS_LICENSE_KEY')
    pro_license = os.environ.get('PRO_LICENSE_KEY')

    if tier == 'campus' and campus_license and license_key == campus_license:
        user.subscription_tier = 'campus'
        user.subscription_status = 'active'
        db.session.commit()
        return jsonify({
            'message': 'Institutional Campus license verified and activated!',
            'user': user.to_dict()
        }), 200
    elif tier == 'pro' and pro_license and license_key == pro_license:
        user.subscription_tier = 'pro'
        user.subscription_status = 'active'
        db.session.commit()
        return jsonify({
            'message': 'Pro license key verified and activated!',
            'user': user.to_dict()
        }), 200

    # Direct unverified self-upgrades are disabled until payment gateway integration is approved
    return jsonify({
        'error': 'Payment Required',
        'status': 'checkout_required',
        'tier': tier,
        'message': f'Self-upgrading to {tier.title()} requires institutional admin licensing or payment verification. Online checkout is currently disabled. Please contact your campus administrator.'
    }), 402
