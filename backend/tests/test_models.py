# tests/test_models.py
import pytest
from app import create_app, db
from app.models import User, Application

@pytest.fixture
def app():
    app = create_app({
        "TESTING": True,
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

def test_user_password_hashing(app):
    with app.app_context():
        user = User(email="test@example.com")
        user.set_password("password123")
        assert user.check_password("password123") is True
        assert user.check_password("wrong") is False

def test_application_relationship(app):
    with app.app_context():
        user = User(email="alice@example.com")
        user.set_password("secret")
        db.session.add(user)
        db.session.commit()

        app_obj = Application(title="Internship", company="ACME Corp", user=user)
        db.session.add(app_obj)
        db.session.commit()

        assert app_obj.user == user
        assert user.applications[0].title == "Internship"
