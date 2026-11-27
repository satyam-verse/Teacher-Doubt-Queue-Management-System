from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from backend.src.extensions import db
from backend.src.models.conversation import Conversation, ConversationMessage
from backend.src.models.doubt import Doubt
from backend.src.models.user import User
from backend.src.services.ai_service import AIService

ai_bp = Blueprint('ai', __name__, url_prefix='/api/v1/ai')

def _get_current_user_id() -> int | None:
    """Safely retrieves current user ID if JWT is present, or returns None."""
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        return int(identity) if identity else None
    except Exception:
        return None

def _check_conversation_access(conversation: Conversation, user_id: int | None) -> bool:
    """
    Guarantees user conversation privacy:
    If a conversation belongs to a registered user, only that user (or an institutional admin) can access/modify it.
    """
    if conversation.user_id is None:
        return True
    if user_id is None:
        return False
    if conversation.user_id == user_id:
        return True
    user = db.session.get(User, user_id)
    return bool(user and user.role == 'admin')

# ==================== Health & Connection Status ====================

@ai_bp.route('/health', methods=['GET'])
def ai_health():
    """Returns the live connection status and model details of Google Gemini."""
    status_info = AIService.check_gemini_health()
    return jsonify(status_info), 200

# ==================== Conversations CRUD ====================

@ai_bp.route('/conversations', methods=['GET'])
def list_conversations():
    """Lists conversations owned by the caller (or unowned guest conversations for anonymous users)."""
    user_id = _get_current_user_id()
    query = Conversation.query
    if user_id:
        query = query.filter_by(user_id=user_id)
    else:
        # Strictly restrict anonymous callers to unauthenticated conversations
        query = query.filter(Conversation.user_id.is_(None))
    
    # Optional search query filter
    q = request.args.get('q', '').strip()
    if q:
        query = query.filter(Conversation.title.ilike(f'%{q}%'))

    conversations = query.order_by(Conversation.is_pinned.desc(), Conversation.updated_at.desc()).all()
    return jsonify({
        'conversations': [c.to_dict(include_messages=False) for c in conversations]
    }), 200

@ai_bp.route('/conversations', methods=['POST'])
def create_conversation():
    data = request.get_json() or {}
    title = data.get('title', 'New Discussion').strip()
    explanation_level = data.get('explanation_level', 'intermediate').strip().lower()
    if explanation_level not in ['beginner', 'intermediate', 'advanced']:
        explanation_level = 'intermediate'

    user_id = _get_current_user_id()

    conversation = Conversation(
        user_id=user_id,
        title=title,
        explanation_level=explanation_level
    )
    db.session.add(conversation)
    db.session.commit()

    return jsonify({
        'message': 'Conversation created successfully',
        'conversation': conversation.to_dict(include_messages=True)
    }), 201

@ai_bp.route('/conversations/<int:conv_id>', methods=['GET'])
def get_conversation(conv_id):
    conversation = db.session.get(Conversation, conv_id)
    if not conversation:
        return jsonify({'error': 'Conversation not found'}), 404

    user_id = _get_current_user_id()
    if not _check_conversation_access(conversation, user_id):
        return jsonify({'error': 'Forbidden', 'message': 'You do not have permission to access this conversation.'}), 403

    return jsonify({
        'conversation': conversation.to_dict(include_messages=True)
    }), 200

@ai_bp.route('/conversations/<int:conv_id>', methods=['PATCH'])
def rename_conversation(conv_id):
    conversation = db.session.get(Conversation, conv_id)
    if not conversation:
        return jsonify({'error': 'Conversation not found'}), 404

    user_id = _get_current_user_id()
    if not _check_conversation_access(conversation, user_id):
        return jsonify({'error': 'Forbidden', 'message': 'You do not have permission to modify this conversation.'}), 403

    data = request.get_json() or {}
    new_title = data.get('title', '').strip()
    if not new_title:
        return jsonify({'error': 'Title cannot be empty'}), 400

    conversation.title = new_title[:80]
    conversation.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify({
        'message': 'Conversation renamed successfully',
        'conversation': conversation.to_dict(include_messages=False)
    }), 200

@ai_bp.route('/conversations/<int:conv_id>', methods=['DELETE'])
def delete_conversation(conv_id):
    conversation = db.session.get(Conversation, conv_id)
    if not conversation:
        return jsonify({'error': 'Conversation not found'}), 404

    user_id = _get_current_user_id()
    if not _check_conversation_access(conversation, user_id):
        return jsonify({'error': 'Forbidden', 'message': 'You do not have permission to delete this conversation.'}), 403

    db.session.delete(conversation)
    db.session.commit()

    return jsonify({'message': 'Conversation deleted successfully', 'id': conv_id}), 200

@ai_bp.route('/conversations/<int:conv_id>/pin', methods=['PATCH'])
def toggle_pin_conversation(conv_id):
    conversation = db.session.get(Conversation, conv_id)
    if not conversation:
        return jsonify({'error': 'Conversation not found'}), 404

    user_id = _get_current_user_id()
    if not _check_conversation_access(conversation, user_id):
        return jsonify({'error': 'Forbidden', 'message': 'You do not have permission to pin this conversation.'}), 403

    conversation.is_pinned = not conversation.is_pinned
    db.session.commit()

    return jsonify({
        'message': f"Conversation {'pinned' if conversation.is_pinned else 'unpinned'} successfully",
        'conversation': conversation.to_dict(include_messages=False)
    }), 200

# ==================== Conversation Messages & Gemini ====================

@ai_bp.route('/conversations/<int:conv_id>/messages', methods=['POST'])
def send_message(conv_id):
    conversation = db.session.get(Conversation, conv_id)
    if not conversation:
        return jsonify({'error': 'Conversation not found'}), 404

    user_id = _get_current_user_id()
    if not _check_conversation_access(conversation, user_id):
        return jsonify({'error': 'Forbidden', 'message': 'You do not have permission to send messages in this conversation.'}), 403

    # Check user quota if authenticated
    user = db.session.get(User, user_id) if user_id else None
    if user and not user.can_ask_ai():
        return jsonify({
            'error': 'DAILY_QUOTA_EXCEEDED',
            'message': f'You have reached your daily limit of {user.get_query_quota()} queries on the {user.subscription_tier.title()} plan. Upgrade to DoubtX Pro for unlimited universal intelligence.',
            'daily_ai_query_count': user.daily_ai_query_count,
            'daily_ai_query_quota': user.get_query_quota()
        }), 429

    data = request.get_json() or {}
    content = data.get('content', '').strip()
    attachment_url = data.get('attachment_url')
    attachment_type = data.get('attachment_type')
    language = data.get('language')
    explanation_level = data.get('explanation_level', conversation.explanation_level).strip().lower()

    if explanation_level in ['beginner', 'intermediate', 'advanced']:
        conversation.explanation_level = explanation_level

    if not content and not attachment_url:
        return jsonify({'error': 'Message content or attachment is required'}), 400

    # Record AI query quota usage for user
    if user:
        user.record_ai_query()

    # 1. Save user message
    user_msg = ConversationMessage(
        conversation_id=conversation.id,
        sender_type='user',
        content=content or '[Attached Screenshot / File]',
        attachment_url=attachment_url,
        attachment_type=attachment_type,
        language=language,
        explanation_level=explanation_level
    )
    db.session.add(user_msg)
    db.session.commit()

    # 2. Gather conversation history
    history = [
        {'sender_type': m.sender_type, 'content': m.content}
        for m in conversation.messages.all()
    ]

    # 3. Call AI Service
    ai_response = AIService.generate_chat_response(
        history=history,
        user_message=content,
        explanation_level=explanation_level,
        attachment_url=attachment_url,
        attachment_type=attachment_type
    )

    # 4. Save AI assistant message
    ai_msg = ConversationMessage(
        conversation_id=conversation.id,
        sender_type='assistant',
        content=ai_response,
        language=language,
        explanation_level=explanation_level
    )
    db.session.add(ai_msg)

    # Auto-generate title from first user query if still generic
    if conversation.title in ['New Discussion', 'New Chat', ''] and content:
        clean_title = content[:38] + ('...' if len(content) > 38 else '')
        conversation.title = clean_title

    conversation.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify({
        'user_message': user_msg.to_dict(),
        'assistant_message': ai_msg.to_dict(),
        'conversation': conversation.to_dict(include_messages=False)
    }), 201

@ai_bp.route('/conversations/<int:conv_id>/regenerate', methods=['POST'])
def regenerate_last_message(conv_id):
    conversation = db.session.get(Conversation, conv_id)
    if not conversation:
        return jsonify({'error': 'Conversation not found'}), 404

    user_id = _get_current_user_id()
    if not _check_conversation_access(conversation, user_id):
        return jsonify({'error': 'Forbidden', 'message': 'You do not have permission to regenerate messages in this conversation.'}), 403

    messages = conversation.messages.all()
    if not messages:
        return jsonify({'error': 'No messages in conversation to regenerate'}), 400

    # Find last user message and last assistant message
    last_assistant_msg = messages[-1] if messages[-1].sender_type == 'assistant' else None
    user_messages = [m for m in messages if m.sender_type == 'user']
    if not user_messages:
        return jsonify({'error': 'No user prompt found to regenerate'}), 400

    last_user_msg = user_messages[-1]
    data = request.get_json() or {}
    explanation_level = data.get('explanation_level', conversation.explanation_level).strip().lower()

    # History up to the user message
    history_subset = []
    for m in messages:
        if m.id == last_user_msg.id:
            break
        history_subset.append({'sender_type': m.sender_type, 'content': m.content})

    new_ai_response = AIService.generate_chat_response(
        history=history_subset,
        user_message=last_user_msg.content,
        explanation_level=explanation_level,
        attachment_url=last_user_msg.attachment_url,
        attachment_type=last_user_msg.attachment_type
    )

    if last_assistant_msg:
        last_assistant_msg.content = new_ai_response
        last_assistant_msg.explanation_level = explanation_level
        db.session.commit()
        return jsonify({'assistant_message': last_assistant_msg.to_dict()}), 200
    else:
        new_ai_msg = ConversationMessage(
            conversation_id=conversation.id,
            sender_type='assistant',
            content=new_ai_response,
            explanation_level=explanation_level
        )
        db.session.add(new_ai_msg)
        db.session.commit()
        return jsonify({'assistant_message': new_ai_msg.to_dict()}), 201

# ==================== Legacy Queue Doubt AI Endpoints ====================

@ai_bp.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json() or {}
    text = data.get('text', '').strip()
    if not text:
        return jsonify({'error': 'text parameter is required'}), 400

    result = AIService.analyze_doubt(text)
    return jsonify({'result': result}), 200

@ai_bp.route('/hint/<int:doubt_id>', methods=['POST'])
def generate_hint(doubt_id):
    doubt = db.session.get(Doubt, doubt_id)
    if not doubt:
        return jsonify({'error': 'Doubt not found'}), 404

    analysis = AIService.analyze_doubt(doubt.doubt)
    doubt.ai_hint = analysis.get('ai_hint')
    doubt.ai_suggested_solution = analysis.get('ai_suggested_solution')
    db.session.commit()

    return jsonify({
        'ai_hint': doubt.ai_hint,
        'ai_suggested_solution': doubt.ai_suggested_solution
    }), 200
