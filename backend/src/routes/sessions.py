import string
import random
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.src.extensions import db
from backend.src.models.session import ClassroomSession
from backend.src.utils.decorators import role_required

sessions_bp = Blueprint('sessions', __name__, url_prefix='/api/v1/sessions')

def generate_session_code():
    chars = string.ascii_uppercase + string.digits
    for _ in range(10):
        code = 'DX-' + ''.join(random.choices(chars, k=6))
        if not ClassroomSession.query.filter_by(session_code=code).first():
            return code
    return 'DX-' + str(random.randint(100000, 999999))

@sessions_bp.route('', methods=['GET'])
def list_sessions():
    sessions = ClassroomSession.query.filter_by(is_active=True).order_by(ClassroomSession.created_at.desc()).all()
    return jsonify({'sessions': [s.to_dict() for s in sessions]}), 200

@sessions_bp.route('', methods=['POST'])
@jwt_required()
@role_required('teacher', 'admin')
def create_session():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    session_code = data.get('session_code', '').strip().upper()

    if not title:
        return jsonify({'error': 'Session title is required'}), 400

    if not session_code:
        session_code = generate_session_code()
    else:
        if ClassroomSession.query.filter_by(session_code=session_code).first():
            return jsonify({'error': f'Session code {session_code} is already in use'}), 409

    teacher_id = int(get_jwt_identity())
    session = ClassroomSession(
        session_code=session_code,
        title=title,
        teacher_id=teacher_id,
        is_active=True
    )
    db.session.add(session)
    db.session.commit()

    return jsonify({'message': 'Session created successfully', 'session': session.to_dict()}), 201

@sessions_bp.route('/<code>', methods=['GET'])
def get_session(code):
    session = ClassroomSession.query.filter_by(session_code=code.upper()).first()
    if not session:
        return jsonify({'error': 'Classroom session not found'}), 404
    return jsonify({'session': session.to_dict()}), 200
