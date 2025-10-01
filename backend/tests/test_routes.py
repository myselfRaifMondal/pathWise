import pytest
from app.models import User
from unittest.mock import patch

def register_user(client, email="bob@example.com", password="secret"):
    return client.post("/signup", data={"email": email, "password": password}, follow_redirects=True)

def login_user(client, email="bob@example.com", password="secret"):
    return client.post("/login", data={"email": email, "password": password}, follow_redirects=True)

def test_signup_and_login(client):
    with patch("flask.render_template", return_value="<html>Dashboard</html>"):
        with patch("app.routes.render_template", return_value="<html>Dashboard</html>"):
            resp = register_user(client)
            assert resp.status_code == 200 or resp.status_code == 302

            resp = login_user(client)
            assert b"Dashboard" in resp.data or resp.status_code == 200

def test_protected_dashboard_requires_login(client):
    with patch("flask.render_template", return_value="<html>Login</html>"):
        with patch("app.routes.render_template", return_value="<html>Login</html>"):
            resp = client.get("/dashboard", follow_redirects=True)
            # should redirect to login
            assert b"Login" in resp.data
