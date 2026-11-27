import os
from flask import Flask, jsonify
from backend.config import config_by_name
from backend.src.extensions import db, migrate, jwt, cors, socketio

def create_app(config_name=None):
    if not config_name:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name['default']))

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Configure CORS using Config.CORS_ORIGINS
    cors_origins = app.config.get('CORS_ORIGINS', ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'])
    is_prod = (config_name == 'production' or os.environ.get('FLASK_ENV') == 'production')

    if is_prod:
        prod_cfg = config_by_name.get('production')
        if hasattr(prod_cfg, 'validate_production_env'):
            prod_cfg.validate_production_env()
        # In production, eliminate any wildcard origin
        cors_origins = [o for o in cors_origins if o != '*']
        if not cors_origins:
            cors_origins = ['https://doubtx.ai']

    cors.init_app(
        app,
        resources={
            r"/api/*": {"origins": cors_origins},
            r"/add*": {"origins": cors_origins},
            r"/": {"origins": cors_origins}
        },
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    )
    socketio.init_app(
        app,
        cors_allowed_origins=cors_origins if is_prod else "*",
        async_mode='threading',
        ping_timeout=20,
        ping_interval=10
    )

    # Register WebSocket room handlers
    with app.app_context():
        import backend.src.services.socket_service

    # Register blueprints
    from backend.src.routes.legacy import legacy_bp
    from backend.src.routes.auth import auth_bp
    from backend.src.routes.sessions import sessions_bp
    from backend.src.routes.doubts import doubts_bp
    from backend.src.routes.ai import ai_bp
    from backend.src.routes.uploads import uploads_bp
    from backend.src.routes.admin import admin_bp

    app.register_blueprint(legacy_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(sessions_bp)
    app.register_blueprint(doubts_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(uploads_bp)
    app.register_blueprint(admin_bp)

    # JWT Error handlers
    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({'error': 'Unauthorized', 'message': 'Missing or invalid authentication token'}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Unauthorized', 'message': 'Token has expired'}), 401

    # Generic error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Not Found', 'message': 'The requested resource was not found'}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'error': 'Internal Server Error', 'message': 'An unexpected error occurred'}), 500

    @app.errorhandler(413)
    def request_entity_too_large(e):
        return jsonify({'error': 'Payload Too Large', 'message': 'Uploaded file exceeds the maximum 16 MB limit.'}), 413

    # Auto-create tables and seed test accounts strictly in development mode
    with app.app_context():
        import backend.src.models
        db.create_all()
        flask_env = os.environ.get('FLASK_ENV', config_name).lower()
        if flask_env != 'production' and not app.config.get('TESTING', False) and (app.config.get('DEBUG', False) or flask_env in ('development', 'dev')):
            if os.environ.get('ENABLE_DEV_SEEDS', 'true').lower() in ('true', '1'):
                from backend.src.utils.seed_data import seed_development_database
                seed_development_database()

    return app
