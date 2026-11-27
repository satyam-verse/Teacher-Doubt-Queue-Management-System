import os
from datetime import timedelta
from dotenv import load_dotenv

# Load .env file from project root, backend directory, and user home if present
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
backend_dir = os.path.dirname(__file__)
user_home = os.path.expanduser('~')

load_dotenv(os.path.join(project_root, '.env'), override=False)
load_dotenv(os.path.join(backend_dir, '.env'), override=False)
load_dotenv(os.path.join(user_home, '.env'), override=False)

class Config:
    """Base Configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'doubtx-dev-secret-key-replace-in-prod')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'doubtx-jwt-secret-replace-in-prod')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        seconds=int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES', 86400))
    )
    
    # Database Configuration (defaults to local SQLite for instant testing, MySQL in prod)
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        db_path = os.path.join(project_root, 'doubtx_dev.db').replace('\\', '/')
        db_url = f"sqlite:///{db_path}"
    
    SQLALCHEMY_DATABASE_URI = db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # File Upload Limits
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB maximum upload payload

    # Connection pool tuning for MySQL RDS reliability
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 1800,
    }
    # Pool size is only applicable for non-SQLite databases
    if not db_url.startswith('sqlite'):
        SQLALCHEMY_ENGINE_OPTIONS['pool_size'] = 10
        SQLALCHEMY_ENGINE_OPTIONS['max_overflow'] = 20

    # CORS
    cors_raw = os.environ.get('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000')
    CORS_ORIGINS = [origin.strip() for origin in cors_raw.split(',') if origin.strip()]

    # Google Gemini API
    _raw_gemini_key = (os.environ.get('GEMINI_API_KEY') or '').strip(' \'"\t\r\n')
    GEMINI_API_KEY = '' if _raw_gemini_key in ('your_gemini_api_key_here', 'None', '') else _raw_gemini_key
    GEMINI_MODEL = (os.environ.get('GEMINI_MODEL') or 'gemini-3.8-flash').strip(' \'"\t\r\n') or 'gemini-3.8-flash'

    # AWS Configuration
    AWS_REGION = os.environ.get('AWS_REGION', 'us-east-1')
    AWS_S3_BUCKET = os.environ.get('AWS_S3_BUCKET', 'doubtx-attachments')
    AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID', '')
    AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY', '')


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False

    @classmethod
    def validate_production_env(cls):
        """Enforces that non-default, high-entropy secrets are configured in production."""
        secret = os.environ.get('SECRET_KEY', '').strip()
        jwt_secret = os.environ.get('JWT_SECRET_KEY', '').strip()

        is_insecure_secret = (
            not secret
            or any(pat in secret.lower() for pat in ['replace-in-prod', 'change-in-prod', 'dev'])
            or len(secret) < 32
        )
        if is_insecure_secret:
            raise ValueError("SECURITY ALERT: Production environment requires a strong, non-default SECRET_KEY (at least 32 chars, cannot contain dev/change-in-prod placeholders).")

        is_insecure_jwt = (
            not jwt_secret
            or any(pat in jwt_secret.lower() for pat in ['replace-in-prod', 'change-in-prod', 'dev'])
            or len(jwt_secret) < 32
        )
        if is_insecure_jwt:
            raise ValueError("SECURITY ALERT: Production environment requires a strong, non-default JWT_SECRET_KEY (at least 32 chars, cannot contain dev/change-in-prod placeholders).")


class TestingConfig(Config):
    TESTING = True
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    JWT_SECRET_KEY = 'test-secret-key-that-is-at-least-32-bytes-long-for-jwt'


config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
