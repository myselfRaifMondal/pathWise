import os


def _origins():
    raw = os.getenv("CORS_ORIGINS", "")
    return [o.strip() for o in raw.split(",") if o.strip()]


def _database_url():
    url = os.getenv("DATABASE_URL", "sqlite:///pathwise.db")
    # Neon and Heroku hand out postgres:// which SQLAlchemy 2 no longer accepts.
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    SQLALCHEMY_DATABASE_URI = _database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY", "dev-secret")
    JWT_ACCESS_TOKEN_EXPIRES = 60 * 60          # 1 hour
    JWT_REFRESH_TOKEN_EXPIRES = 60 * 60 * 24 * 30  # 30 days

    CORS_ORIGINS = _origins()
    APP_BASE_URL = os.getenv("APP_BASE_URL", "http://localhost:8081")
    RESEND_API_KEY = os.getenv("RESEND_API_KEY")
    RESEND_FROM = os.getenv("RESEND_FROM", "PathWise <noreply@pathwise.lol>")

    # Serverless connections die between invocations; recycle rather than reuse stale ones.
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True, "pool_recycle": 280}


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False
