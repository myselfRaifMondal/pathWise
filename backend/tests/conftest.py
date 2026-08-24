import pytest

from app import create_app, db


@pytest.fixture
def app():
    application = create_app(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "SECRET_KEY": "test-secret",
            "JWT_SECRET_KEY": "test-jwt-secret-at-least-32-bytes-long",
            "SQLALCHEMY_ENGINE_OPTIONS": {},
        }
    )
    with application.app_context():
        db.create_all()
        yield application
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def register(client):
    """Sign a user up and return (auth headers, signup payload)."""

    def _register(email="user@example.com", password="correct-horse"):
        response = client.post("/api/auth/signup", json={"email": email, "password": password})
        assert response.status_code == 201, response.get_json()
        body = response.get_json()
        return {"Authorization": f"Bearer {body['accessToken']}"}, body

    return _register
