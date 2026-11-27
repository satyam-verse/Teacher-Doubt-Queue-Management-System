import os
import uuid
from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from backend.src.services.s3_service import S3Service

uploads_bp = Blueprint('uploads', __name__, url_prefix='/api/v1/uploads')

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'uploads'))
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif', 'pdf', 'txt', 'py', 'cpp', 'java', 'sql', 'json', 'md'}

def _allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@uploads_bp.route('/direct', methods=['POST'])
@jwt_required()
def direct_upload():
    """Direct multipart upload for authenticated users. Enforces 16MB limit and whitelisted extensions."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400

    file = request.files['file']
    if not file or file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if not _allowed_file(file.filename):
        return jsonify({
            'error': 'Unsupported file type',
            'message': f"Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS)).upper()}"
        }), 400

    user_id = get_jwt_identity()
    orig_name = secure_filename(file.filename)
    ext = orig_name.rsplit('.', 1)[1].lower() if '.' in orig_name else 'bin'
    unique_name = f"u{user_id}_{uuid.uuid4().hex[:12]}_{orig_name}"
    save_path = os.path.join(UPLOAD_DIR, unique_name)

    # Check file size before saving (16MB hard ceiling)
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)

    if file_size > 16 * 1024 * 1024:
        return jsonify({'error': 'Payload Too Large', 'message': 'File size exceeds 16 MB maximum limit.'}), 413

    file.save(save_path)
    content_type = file.content_type or ('application/pdf' if ext == 'pdf' else f'image/{ext}')

    file_url = f"/api/v1/uploads/files/{unique_name}"
    return jsonify({
        'filename': orig_name,
        'unique_filename': unique_name,
        'file_url': file_url,
        'local_path': save_path,
        'content_type': content_type,
        'size_bytes': file_size
    }), 201

@uploads_bp.route('/files/<filename>', methods=['GET'])
def get_uploaded_file(filename):
    """Safely serves uploaded static attachments."""
    safe_name = secure_filename(filename)
    return send_from_directory(UPLOAD_DIR, safe_name)

@uploads_bp.route('/presigned-url', methods=['POST'])
@jwt_required()
def get_presigned_url():
    """Generates an authenticated S3 presigned upload URL with strict type validation."""
    data = request.get_json() or {}
    raw_filename = data.get('filename', 'attachment.png').strip()
    clean_filename = secure_filename(raw_filename)

    if not clean_filename or not _allowed_file(clean_filename):
        return jsonify({
            'error': 'Unsupported file type',
            'message': f"Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS)).upper()}"
        }), 400

    content_type = data.get('content_type', 'image/png').strip()

    try:
        result = S3Service.generate_presigned_upload_url(clean_filename, content_type)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@uploads_bp.route('/mock-s3/<path:key>', methods=['PUT'])
def mock_upload(key):
    """Local development mock S3 upload endpoint."""
    return jsonify({'message': f'Mock S3 upload successful for {key}'}), 200
