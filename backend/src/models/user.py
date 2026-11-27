import re
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from backend.src.extensions import db

def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validates that password meets institutional security criteria:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit or special symbol
    """
    if not password or len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter."
    if not re.search(r"[0-9!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]", password):
        return False, "Password must contain at least one number or special symbol."
    return True, ""

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(191), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student', index=True)  # student, teacher, admin
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    subscription_tier = db.Column(db.String(20), nullable=False, default='free')  # free, pro, campus
    daily_ai_query_count = db.Column(db.Integer, nullable=False, default=0)
    last_query_reset_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    subscription_status = db.Column(db.String(20), nullable=False, default='active')  # active, trialing, cancelled

    # Relationships
    sessions_taught = db.relationship('ClassroomSession', backref='teacher', lazy='dynamic', foreign_keys='ClassroomSession.teacher_id')
    doubts_raised = db.relationship('Doubt', backref='student', lazy='dynamic', foreign_keys='Doubt.student_id')
    doubts_resolved = db.relationship('Doubt', backref='resolver', lazy='dynamic', foreign_keys='Doubt.resolved_by_id')

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def get_query_quota(self) -> int:
        if self.subscription_tier == 'pro':
            return 500  # Generous daily quota for Pro
        elif self.subscription_tier == 'campus':
            return 2000  # High departmental quota
        return 20  # Free tier default: 20 queries/day

    def can_ask_ai(self) -> bool:
        # Reset count if last reset was on a previous day
        now = datetime.now(timezone.utc)
        if self.last_query_reset_at and self.last_query_reset_at.date() < now.date():
            self.daily_ai_query_count = 0
            self.last_query_reset_at = now
            db.session.commit()

        return self.daily_ai_query_count < self.get_query_quota()

    def record_ai_query(self) -> None:
        now = datetime.now(timezone.utc)
        if self.last_query_reset_at and self.last_query_reset_at.date() < now.date():
            self.daily_ai_query_count = 1
            self.last_query_reset_at = now
        else:
            self.daily_ai_query_count += 1
        db.session.commit()

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role,
            'subscription_tier': self.subscription_tier,
            'subscription_status': self.subscription_status,
            'daily_ai_query_count': self.daily_ai_query_count,
            'daily_ai_query_quota': self.get_query_quota(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
