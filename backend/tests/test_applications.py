from datetime import date


def _payload(**overrides):
    body = {
        "role": "SWE Intern",
        "company": "Stripe",
        "stage": "Interview",
        "applied": "2026-08-03",
        "deadline": "2026-08-26",
        "kind": "Onsite loop",
        "location": "Bengaluru",
        "note": "Phone screen done.",
        "contact": {
            "name": "Priya Raman",
            "title": "University recruiter",
            "email": "priya@example.com",
        },
    }
    body.update(overrides)
    return body


def test_create_round_trips_every_field_the_design_uses(client, register):
    headers, _ = register()
    created = client.post("/api/applications", headers=headers, json=_payload())
    assert created.status_code == 201

    body = created.get_json()
    assert body["role"] == "SWE Intern"
    assert body["stage"] == "Interview"
    assert body["applied"] == "2026-08-03"
    assert body["deadline"] == "2026-08-26"
    assert body["kind"] == "Onsite loop"
    assert body["contact"]["name"] == "Priya Raman"

    listed = client.get("/api/applications", headers=headers).get_json()
    assert [row["id"] for row in listed] == [body["id"]]


def test_role_and_company_are_required(client, register):
    headers, _ = register()
    assert client.post(
        "/api/applications", headers=headers, json={"company": "Stripe"}
    ).status_code == 400
    assert client.post(
        "/api/applications", headers=headers, json={"role": " ", "company": "Stripe"}
    ).status_code == 400


def test_an_unknown_stage_is_rejected(client, register):
    headers, _ = register()
    response = client.post("/api/applications", headers=headers, json=_payload(stage="Ghosted"))
    assert response.status_code == 400
    assert "stage must be one of" in response.get_json()["error"]


def test_a_malformed_date_is_rejected(client, register):
    headers, _ = register()
    response = client.post(
        "/api/applications", headers=headers, json=_payload(deadline="26/08/2026")
    )
    assert response.status_code == 400
    assert "ISO date" in response.get_json()["error"]


def test_applied_defaults_to_today_but_stays_empty_for_saved(client, register):
    headers, _ = register()

    submitted = client.post(
        "/api/applications", headers=headers, json={"role": "SWE", "company": "Stripe"}
    ).get_json()
    assert submitted["applied"] == date.today().isoformat()

    saved = client.post(
        "/api/applications",
        headers=headers,
        json={"role": "Research Intern", "company": "D. E. Shaw", "stage": "Saved"},
    ).get_json()
    assert saved["applied"] is None


def test_patch_moves_the_stage_and_can_clear_a_contact(client, register):
    headers, _ = register()
    created = client.post("/api/applications", headers=headers, json=_payload()).get_json()

    moved = client.patch(
        f"/api/applications/{created['id']}", headers=headers, json={"stage": "Offer"}
    ).get_json()
    assert moved["stage"] == "Offer"
    assert moved["contact"]["name"] == "Priya Raman"

    cleared = client.patch(
        f"/api/applications/{created['id']}", headers=headers, json={"contact": None}
    ).get_json()
    assert cleared["contact"] is None


def test_delete_removes_the_row(client, register):
    headers, _ = register()
    created = client.post("/api/applications", headers=headers, json=_payload()).get_json()

    assert client.delete(f"/api/applications/{created['id']}", headers=headers).status_code == 200
    assert client.get("/api/applications", headers=headers).get_json() == []
    assert client.get(f"/api/applications/{created['id']}", headers=headers).status_code == 404


def test_one_user_cannot_read_or_change_another_users_application(client, register):
    owner_headers, _ = register(email="owner@example.com")
    other_headers, _ = register(email="other@example.com")

    created = client.post("/api/applications", headers=owner_headers, json=_payload()).get_json()

    assert client.get(f"/api/applications/{created['id']}", headers=other_headers).status_code == 403
    assert client.patch(
        f"/api/applications/{created['id']}", headers=other_headers, json={"stage": "Rejected"}
    ).status_code == 403
    assert (
        client.delete(f"/api/applications/{created['id']}", headers=other_headers).status_code == 403
    )
    assert client.get("/api/applications", headers=other_headers).get_json() == []
