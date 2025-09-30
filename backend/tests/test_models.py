import pytest
from app import db
from app.models import User, Application

def test_user_password_hashing(app):
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

