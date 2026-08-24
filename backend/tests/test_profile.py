def test_profile_is_empty_but_present_before_anything_is_saved(client, register):
    headers, _ = register()
    response = client.get("/api/profile", headers=headers)
    assert response.status_code == 200
    body = response.get_json()
    assert body["fullName"] is None
    assert body["targetRoles"] == []
    assert body["salaryCurrency"] == "INR"


def test_profile_round_trips_every_group(client, register):
    headers, _ = register()
    payload = {
        "fullName": "Raif Mondal",
        "phone": "+911234567890",
        "currentLocation": "Bengaluru",
        "resumeUrl": "https://example.com/cv.pdf",
        "noticePeriod": "30 days",
        "workAuthorization": "Indian citizen",
        "targetRoles": ["Frontend Engineer", "Design Engineer"],
        "seniority": "Mid",
        "preferredLocations": ["Bengaluru", "Remote"],
        "workType": "Hybrid",
        "skills": ["TypeScript", "React Native", "Python"],
        "yearsExperience": 3,
        "education": "B.Tech, Computer Science",
        "expectedSalaryMin": 1800000,
        "salaryCurrency": "INR",
        "portfolioUrl": "https://example.com",
        "linkedinUrl": "https://linkedin.com/in/example",
        "githubUrl": "https://github.com/example",
    }
    saved = client.put("/api/profile", headers=headers, json=payload)
    assert saved.status_code == 200

    fetched = client.get("/api/profile", headers=headers).get_json()
    assert fetched["fullName"] == "Raif Mondal"
    assert fetched["targetRoles"] == ["Frontend Engineer", "Design Engineer"]
    assert fetched["skills"] == ["TypeScript", "React Native", "Python"]
    assert fetched["yearsExperience"] == 3
    assert fetched["expectedSalaryMin"] == 1800000
    assert fetched["workType"] == "Hybrid"


def test_put_upserts_rather_than_duplicating(client, app, register):
    from app.models import Profile

    headers, _ = register()
    client.put("/api/profile", headers=headers, json={"fullName": "First"})
    client.put("/api/profile", headers=headers, json={"fullName": "Second"})

    assert client.get("/api/profile", headers=headers).get_json()["fullName"] == "Second"
    with app.app_context():
        assert Profile.query.count() == 1


def test_partial_update_leaves_untouched_fields_alone(client, register):
    headers, _ = register()
    client.put("/api/profile", headers=headers, json={"fullName": "Raif", "workType": "Remote"})
    client.put("/api/profile", headers=headers, json={"phone": "+911234567890"})

    body = client.get("/api/profile", headers=headers).get_json()
    assert body["fullName"] == "Raif"
    assert body["workType"] == "Remote"
    assert body["phone"] == "+911234567890"


def test_vocabularies_are_validated(client, register):
    headers, _ = register()
    bad_seniority = client.put("/api/profile", headers=headers, json={"seniority": "Wizard"})
    assert bad_seniority.status_code == 400
    assert "seniority must be one of" in bad_seniority.get_json()["error"]

    bad_work = client.put("/api/profile", headers=headers, json={"workType": "Lunar"})
    assert bad_work.status_code == 400


def test_non_numeric_years_are_rejected(client, register):
    headers, _ = register()
    response = client.put("/api/profile", headers=headers, json={"yearsExperience": "three"})
    assert response.status_code == 400
    assert "whole number" in response.get_json()["error"]


def test_profile_requires_a_token(client):
    assert client.get("/api/profile").status_code == 401
    assert client.put("/api/profile", json={"fullName": "x"}).status_code == 401


def test_one_user_cannot_see_anothers_profile(client, register):
    owner, _ = register(email="owner@example.com")
    other, _ = register(email="other@example.com")

    client.put("/api/profile", headers=owner, json={"fullName": "Owner Only"})

    assert client.get("/api/profile", headers=other).get_json()["fullName"] is None


def test_deleting_the_account_removes_the_profile(client, app, register):
    from app.models import Profile

    headers, _ = register()
    client.put("/api/profile", headers=headers, json={"fullName": "Raif"})
    assert client.delete("/api/auth/account", headers=headers).status_code == 200

    with app.app_context():
        assert Profile.query.count() == 0


def test_health_publishes_the_profile_vocabularies(client):
    body = client.get("/api/health").get_json()
    assert "Mid" in body["seniorities"]
    assert "Remote" in body["workTypes"]
