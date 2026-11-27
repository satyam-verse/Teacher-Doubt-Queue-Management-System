from datetime import datetime, timezone
from backend.src.extensions import db

class Doubt(db.Model):
    __tablename__ = 'doubts'

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('classroom_sessions.id'), nullable=True, index=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    
    # Preserved original columns from legacy schema
    student_name = db.Column(db.String(120), nullable=False)
    doubt = db.Column(db.Text, nullable=False)
    
    # Upgraded enterprise fields
    category = db.Column(db.String(64), default='General', index=True)
    priority = db.Column(db.String(20), default='MEDIUM', index=True)  # LOW, MEDIUM, HIGH, URGENT
    status = db.Column(db.String(20), default='QUEUED', index=True)    # QUEUED, IN_PROGRESS, RESOLVED, CANCELLED
    attachment_url = db.Column(db.String(512), nullable=True)
    
    # AI-powered assistance fields
    ai_hint = db.Column(db.Text, nullable=True)
    ai_suggested_solution = db.Column(db.Text, nullable=True)
    
    # Resolution fields
    resolved_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    resolution_notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    resolved_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'session_id': self.session_id,
            'session_code': self.session.session_code if self.session else None,
            'student_id': self.student_id,
            'student_name': self.student_name,
            'doubt': self.doubt,
            'category': self.category,
            'priority': self.priority,
            'status': self.status,
            'attachment_url': self.attachment_url,
            'ai_hint': self.ai_hint,
            'ai_suggested_solution': self.ai_suggested_solution,
            'resolved_by_id': self.resolved_by_id,
            'resolver_name': self.resolver.full_name if self.resolver else None,
            'resolution_notes': self.resolution_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None
        }
