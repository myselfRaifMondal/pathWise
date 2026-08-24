def test_health_lists_the_board_stages(client):
    body = client.get("/api/health").get_json()
    assert body["status"] == "ok"
    assert body["stages"][0] == "Saved"
    assert body["stages"][-1] == "Rejected"


def test_signup_returns_tokens_and_normalises_email(client):
    response = client.post(
        "/api/auth/signup", json={"email": "  Mixed@Case.COM ", "password": "correct-horse"}
    )
    assert response.status_code == 201
    body = response.get_json()
    assert body["user"]["email"] == "mixed@case.com"
    assert body["accessToken"] and body["refreshToken"]


def test_signup_rejects_short_passwords_and_duplicate_emails(client):
    assert client.post(
        "/api/auth/signup", json={"email": "a@b.com", "password": "short"}
    ).status_code == 400

    client.post("/api/auth/signup", json={"email": "a@b.com", "password": "correct-horse"})
    assert client.post(
        "/api/auth/signup", json={"email": "a@b.com", "password": "correct-horse"}
    ).status_code == 409


def test_login_rejects_a_wrong_password(client, register):
    register(email="a@b.com", password="correct-horse")
    assert client.post(
        "/api/auth/login", json={"email": "a@b.com", "password": "wrong-horse"}
    ).status_code == 401


def test_protected_routes_require_a_token(client):
    assert client.get("/api/applications").status_code == 401
    assert client.get("/api/auth/me").status_code == 401


def test_refresh_token_mints_a_new_access_token(client, register):
    _, body = register()
    response = client.post(
        "/api/auth/refresh", headers={"Authorization": f"Bearer {body['refreshToken']}"}
    )
    assert response.status_code == 200
    assert response.get_json()["accessToken"]


def test_access_token_is_not_accepted_where_a_refresh_token_is_required(client, register):
    headers, _ = register()
    assert client.post("/api/auth/refresh", headers=headers).status_code == 422


def test_profile_can_be_updated_and_theme_is_validated(client, register):
    headers, _ = register()
    response = client.patch(
        "/api/auth/me", headers=headers, json={"name": "Raif", "themePreference": "light"}
    )
    assert response.get_json() == {
        "id": 1,
        "email": "user@example.com",
        "name": "Raif",
        "themePreference": "light",
    }
    assert client.patch(
        "/api/auth/me", headers=headers, json={"themePreference": "neon"}
    ).status_code == 400


def test_forgot_password_answers_identically_for_unknown_addresses(client, register):
    register(email="known@example.com")
    known = client.post("/api/auth/forgot", json={"email": "known@example.com"})
    unknown = client.post("/api/auth/forgot", json={"email": "nobody@example.com"})
    assert known.status_code == unknown.status_code == 200
    assert known.get_json() == unknown.get_json()


def test_reset_with_a_valid_token_changes_the_password(client, app, register):
    from app.routes import _serializer

    register(email="a@b.com", password="correct-horse")
    with app.test_request_context():
        token = _serializer().dumps(1)

    assert client.post(
        "/api/auth/reset", json={"token": token, "password": "brand-new-passphrase"}
    ).status_code == 200
    assert client.post(
        "/api/auth/login", json={"email": "a@b.com", "password": "brand-new-passphrase"}
    ).status_code == 200
    assert client.post(
        "/api/auth/login", json={"email": "a@b.com", "password": "correct-horse"}
    ).status_code == 401


def test_reset_rejects_a_forged_token(client, register):
    register()
    assert client.post(
        "/api/auth/reset", json={"token": "not-a-real-token", "password": "brand-new-pass"}
    ).status_code == 400


def test_deleting_an_account_removes_its_applications(client, app, register):
    from app.models import Application

    headers, _ = register()
    client.post("/api/applications", headers=headers, json={"role": "SWE", "company": "Stripe"})

    assert client.delete("/api/auth/account", headers=headers).status_code == 200
    assert client.get("/api/auth/me", headers=headers).status_code == 401
    with app.app_context():
        assert Application.query.count() == 0
