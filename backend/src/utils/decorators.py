from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request
from backend.src.extensions import db
from backend.src.models.user import User

def role_required(*allowed_roles):
    """
    Decorator to restrict access to users having specific roles.
    Checks the real-time role in the database to prevent stale token elevation.
    Example: @role_required('teacher', 'admin')
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = db.session.get(User, int(user_id)) if user_id else None
            user_role = (user.role if user else get_jwt().get('role', 'student')).lower()
            allowed = [r.lower() for r in allowed_roles]

            if user_role not in allowed:
                return jsonify({
                    'error': 'Forbidden',
                    'message': f"Access restricted to roles: {', '.join(allowed_roles)}"
                }), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator
