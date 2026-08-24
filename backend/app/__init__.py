import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

__all__ = ["db", "migrate", "jwt", "create_app"]


def create_app(config_override=None):
    load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env"))

    from config import DevelopmentConfig, ProductionConfig

    app = Flask(__name__)
    app.config.from_object(
        ProductionConfig if os.getenv("VERCEL") or os.getenv("FLASK_ENV") == "production"
        else DevelopmentConfig
    )
    if config_override:
        app.config.update(config_override)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    origins = app.config.get("CORS_ORIGINS") or ["*"]
    CORS(app, resources={r"/api/*": {"origins": origins}}, supports_credentials=False)

    from app import models  # noqa: F401  — registers the tables with SQLAlchemy
    from app.routes import register_routes

    register_routes(app)

    # Schema changes belong to Alembic. A serverless cold start must never touch DDL.
    @app.errorhandler(404)
    def _not_found(_):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(500)
    def _server_error(_):
        return jsonify({"error": "Internal server error"}), 500

    return app
