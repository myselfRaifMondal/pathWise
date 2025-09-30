from flask import Flask
from dotenv import load_dotenv
import os
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from config import DevelopmentConfig
from flask_cors import CORS


db = SQLAlchemy()
login_manager = LoginManager()
migrate = Migrate()

def create_app():
    # Load environment variables from .env file
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env')
    load_dotenv(env_path)
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
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
        from app import routes  # register routes
        from app import models
        db.create_all()
    return app
