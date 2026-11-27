from flask import Blueprint, request
from backend.src.extensions import db
from backend.src.models.doubt import Doubt
from backend.src.services.ai_service import AIService
from backend.src.services.socket_service import SocketService
from backend.src.services.queue_service import QueueService

legacy_bp = Blueprint('legacy', __name__)

@legacy_bp.route('/')
def home():
    """Preserves legacy GET / health check endpoint."""
    return "Doubt Queue System Running!"

@legacy_bp.route('/add')
def add():
    """
    Preserves exact legacy endpoint contract:
    GET /add?name=YourName&doubt=YourDoubt -> "Doubt Added Successfully!"
    Upgrades execution to save through ORM, run AI analysis, and broadcast real-time events.
    """
    name = request.args.get('name', 'Anonymous Student')
    doubt_text = request.args.get('doubt', 'No question details provided')

    ai_result = AIService.analyze_doubt(doubt_text)

    doubt = Doubt(
        student_name=name,
        doubt=doubt_text,
        category=ai_result.get('category', 'General'),
        priority=ai_result.get('priority', 'MEDIUM'),
        status='QUEUED',
        ai_hint=ai_result.get('ai_hint'),
        ai_suggested_solution=ai_result.get('ai_suggested_solution')
    )

    db.session.add(doubt)
    db.session.commit()

    doubt_dict = doubt.to_dict()
    doubt_dict['queue_position'] = QueueService.get_queue_position(doubt)
    doubt_dict['estimated_wait_minutes'] = QueueService.get_estimated_wait_time(doubt_dict['queue_position'])

    # Real-time WebSocket emission to all active teacher dashboards
    SocketService.emit_doubt_created(doubt_dict)

    return "Doubt Added Successfully!"
