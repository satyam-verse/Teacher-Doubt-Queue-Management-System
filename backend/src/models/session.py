from datetime import datetime, timezone
from backend.src.extensions import db

class ClassroomSession(db.Model):
    __tablename__ = 'classroom_sessions'

    id = db.Column(db.Integer, primary_key=True)
    session_code = db.Column(db.String(16), unique=True, nullable=False, index=True)
    title = db.Column(db.String(191), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    doubts = db.relationship('Doubt', backref='session', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'session_code': self.session_code,
            'title': self.title,
            'teacher_id': self.teacher_id,
            'teacher_name': self.teacher.full_name if self.teacher else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'queued_count': self.doubts.filter_by(status='QUEUED').count()
        }
