from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from backend.src.extensions import db
from backend.src.models.doubt import Doubt
from backend.src.models.user import User
from backend.src.models.session import ClassroomSession
from backend.src.services.ai_service import AIService
from backend.src.services.socket_service import SocketService
from backend.src.services.queue_service import QueueService

doubts_bp = Blueprint('doubts', __name__, url_prefix='/api/v1/doubts')

@doubts_bp.route('', methods=['GET'])
def list_doubts():
    session_id = request.args.get('session_id', type=int)
    session_code = request.args.get('session_code')
    status = request.args.get('status')
    student_id = request.args.get('student_id', type=int)

    query = Doubt.query

    if session_code:
        sess = ClassroomSession.query.filter_by(session_code=session_code.upper()).first()
        if sess:
            query = query.filter(Doubt.session_id == sess.id)
    elif session_id:
        query = query.filter(Doubt.session_id == session_id)

    if status:
        query = query.filter(Doubt.status == status.upper())
    
    if student_id:
        query = query.filter(Doubt.student_id == student_id)

    # Order QUEUED by created_at asc (FIFO), others by updated/created_at desc
    doubts = query.order_by(Doubt.created_at.asc()).all()

    result = []
    for d in doubts:
        d_dict = d.to_dict()
        d_dict['queue_position'] = QueueService.get_queue_position(d)
        d_dict['estimated_wait_minutes'] = QueueService.get_estimated_wait_time(d_dict['queue_position'])
        result.append(d_dict)

    return jsonify({
        'doubts': result,
        'stats': QueueService.get_session_stats(session_id)
    }), 200

@doubts_bp.route('', methods=['POST'])
def create_doubt():
    data = request.get_json() or {}
    student_name = data.get('student_name', '').strip()
    doubt_text = data.get('doubt', '').strip()
    session_id = data.get('session_id')
    session_code = data.get('session_code')
    attachment_url = data.get('attachment_url')

    student_id = None
    # Optional JWT identity if student is logged in
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        if identity:
            student_id = int(identity)
            user = db.session.get(User, student_id)
            if user and not student_name:
                student_name = user.full_name
    except Exception:
        pass

    if not student_name:
        return jsonify({'error': 'student_name is required'}), 400
    if not doubt_text:
        return jsonify({'error': 'doubt text is required'}), 400

    # Resolve session_code if provided
    if session_code and not session_id:
        sess = ClassroomSession.query.filter_by(session_code=session_code.upper()).first()
        if sess:
            session_id = sess.id

    # Run AI Analysis (Gemini API with fallback)
    ai_result = AIService.analyze_doubt(doubt_text)

    doubt = Doubt(
        session_id=session_id,
        student_id=student_id,
        student_name=student_name,
        doubt=doubt_text,
        category=ai_result.get('category', 'General'),
        priority=ai_result.get('priority', 'MEDIUM'),
        status='QUEUED',
        attachment_url=attachment_url,
        ai_hint=ai_result.get('ai_hint'),
        ai_suggested_solution=ai_result.get('ai_suggested_solution')
    )

    db.session.add(doubt)
    db.session.commit()

    doubt_dict = doubt.to_dict()
    doubt_dict['queue_position'] = QueueService.get_queue_position(doubt)
    doubt_dict['estimated_wait_minutes'] = QueueService.get_estimated_wait_time(doubt_dict['queue_position'])

    # Real-time WebSocket notification
    SocketService.emit_doubt_created(doubt_dict)

    return jsonify({
        'message': 'Doubt added to queue successfully',
        'doubt': doubt_dict
    }), 201

@doubts_bp.route('/<int:doubt_id>', methods=['GET'])
def get_doubt(doubt_id):
    doubt = db.session.get(Doubt, doubt_id)
    if not doubt:
        return jsonify({'error': 'Doubt not found'}), 404

    d_dict = doubt.to_dict()
    d_dict['queue_position'] = QueueService.get_queue_position(doubt)
    d_dict['estimated_wait_minutes'] = QueueService.get_estimated_wait_time(d_dict['queue_position'])
    return jsonify({'doubt': d_dict}), 200

@doubts_bp.route('/<int:doubt_id>/claim', methods=['POST'])
@jwt_required()
def claim_doubt(doubt_id):
    teacher_id = int(get_jwt_identity())
    doubt = db.session.get(Doubt, doubt_id)
    if not doubt:
        return jsonify({'error': 'Doubt not found'}), 404

    doubt.status = 'IN_PROGRESS'
    doubt.resolved_by_id = teacher_id
    db.session.commit()

    d_dict = doubt.to_dict()
    SocketService.emit_doubt_updated(d_dict)

    return jsonify({'message': 'Doubt claimed and marked IN_PROGRESS', 'doubt': d_dict}), 200

@doubts_bp.route('/<int:doubt_id>/status', methods=['PATCH'])
@jwt_required()
def update_status(doubt_id):
    doubt = db.session.get(Doubt, doubt_id)
    if not doubt:
        return jsonify({'error': 'Doubt not found'}), 404

    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Enforce that only the assigned teacher, an admin, or the student who raised the doubt can change its status
    is_teacher_or_admin = user.role in ['teacher', 'admin']
    is_author = (doubt.student_id == user.id)
    if not (is_teacher_or_admin or is_author):
        return jsonify({'error': 'Forbidden', 'message': 'Only the assigned instructor or student author can modify doubt status.'}), 403

    data = request.get_json() or {}
    new_status = data.get('status', '').upper()
    notes = data.get('resolution_notes')

    if new_status not in ['QUEUED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED']:
        return jsonify({'error': 'Invalid status'}), 400

    doubt.status = new_status
    if notes:
        doubt.resolution_notes = notes

    if new_status == 'RESOLVED':
        doubt.resolved_at = datetime.now(timezone.utc)
        doubt.resolved_by_id = user.id

    db.session.commit()

    d_dict = doubt.to_dict()
    if new_status == 'RESOLVED':
        SocketService.emit_doubt_resolved(d_dict)
    else:
        SocketService.emit_doubt_updated(d_dict)

    return jsonify({'message': f'Doubt status updated to {new_status}', 'doubt': d_dict}), 200
