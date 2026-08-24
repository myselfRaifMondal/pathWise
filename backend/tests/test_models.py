from datetime import date

from app.models import Application, User


def test_password_is_hashed_not_stored(app):
    user = User(email="a@b.com")
    user.set_password("correct-horse")
    assert user.password_hash != "correct-horse"
    assert user.check_password("correct-horse")
    assert not user.check_password("wrong-horse")


def test_to_dict_shapes_contact_as_nested_object_or_none(app):
    bare = Application(role="SWE Intern", company="Stripe", stage="Applied")
    assert bare.to_dict()["contact"] is None

    with_contact = Application(
        role="Frontend Engineer",
        company="Vercel",
        stage="Screening",
        deadline=date(2026, 8, 28),
        contact_name="Dana Wells",
        contact_title="Talent partner",
        contact_email="dana@example.com",
    )
    payload = with_contact.to_dict()
    assert payload["contact"] == {
        "name": "Dana Wells",
        "title": "Talent partner",
        "email": "dana@example.com",
    }
    assert payload["deadline"] == "2026-08-28"
