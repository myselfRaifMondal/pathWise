# tests/test_routes.py
import pytest
from app import create_app, db
from app.models import User

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "WTF_CSRF_ENABLED": False,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"
    })
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def register_user(client, email="bob@example.com", password="secret"):
    return client.post("/signup", data={"email": email, "password": password}, follow_redirects=True)

def login_user(client, email="bob@example.com", password="secret"):
    return client.post("/login", data={"email": email, "password": password}, follow_redirects=True)

def test_signup_and_login(client):
    resp = register_user(client)
    assert resp.status_code == 200 or resp.status_code == 302

    resp = login_user(client)
    assert b"Dashboard" in resp.data or resp.status_code == 200

def test_protected_dashboard_requires_login(client):
    resp = client.get("/dashboard", follow_redirects=True)
    # should redirect to login
    assert b"Login" in resp.data
