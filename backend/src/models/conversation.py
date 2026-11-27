from datetime import datetime, timezone
from backend.src.extensions import db

class Conversation(db.Model):
    __tablename__ = 'conversations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    title = db.Column(db.String(191), nullable=False, default='New Discussion')
    explanation_level = db.Column(db.String(20), nullable=False, default='intermediate')  # beginner, intermediate, advanced
    is_pinned = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    # Relationships
    messages = db.relationship('ConversationMessage', backref='conversation', lazy='dynamic', cascade='all, delete-orphan', order_by='ConversationMessage.created_at.asc()')

    def to_dict(self, include_messages=False) -> dict:
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'explanation_level': self.explanation_level,
            'is_pinned': self.is_pinned,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'message_count': self.messages.count()
        }
        if include_messages:
            data['messages'] = [m.to_dict() for m in self.messages.all()]
        return data


class ConversationMessage(db.Model):
    __tablename__ = 'conversation_messages'

    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversations.id'), nullable=False, index=True)
    sender_type = db.Column(db.String(16), nullable=False)  # 'user' or 'assistant'
    content = db.Column(db.Text, nullable=False)
    attachment_url = db.Column(db.String(512), nullable=True)
    attachment_type = db.Column(db.String(64), nullable=True)  # 'image/png', 'text/plain', etc.
    language = db.Column(db.String(32), nullable=True)  # 'python', 'cpp', 'java', 'sql', etc.
    explanation_level = db.Column(db.String(20), nullable=True)  # 'beginner', 'intermediate', 'advanced'
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'sender_type': self.sender_type,
            'content': self.content,
            'attachment_url': self.attachment_url,
            'attachment_type': self.attachment_type,
            'language': self.language,
            'explanation_level': self.explanation_level,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
