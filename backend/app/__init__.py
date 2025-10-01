__all__ = ["db", "login_manager", "create_app"]
from flask import Flask
from dotenv import load_dotenv
import os
from flask import Flask
from dotenv import load_dotenv
import os
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + '/..'))
from config import DevelopmentConfig
from flask_cors import CORS

db = SQLAlchemy()
login_manager = LoginManager()
migrate = Migrate()

def create_app(config_override=None):
    # Load environment variables from .env file
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env')
    load_dotenv(env_path)
    app = Flask(__name__)
    # ensure debug logging is visible for troubleshooting
    import logging
    app.logger.setLevel(logging.DEBUG)
    app.config.from_object(DevelopmentConfig)
    if config_override:
        app.config.update(config_override)
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    login_manager.login_view = 'login'
    # Enable CORS for frontend requests
    CORS(app, supports_credentials=True)

    # Import models and routes
    with app.app_context():
        from app.admin import init_admin
        init_admin(app)
        from app.routes import register_routes
        register_routes(app)
        from app import models  # Import models to register them with SQLAlchemy
        # Register user loader after models are imported
        from app.models import User
        @login_manager.user_loader
        def load_user(user_id):
            return User.query.get(int(user_id))
    # Ensure tables are created for the correct app context
    if not app.config.get('TESTING', False):
        with app.app_context():
            db.create_all()
            print("Tables created:", list(db.metadata.tables.keys()))
    return app
