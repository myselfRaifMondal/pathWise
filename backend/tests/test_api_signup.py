import json


def test_api_signup_creates_user(client, app):
    payload = {'email': 'apitest@example.com', 'password': 'secret123'}
    resp = client.post('/api/signup', data=json.dumps(payload), content_type='application/json')
    assert resp.status_code == 201
    data = resp.get_json()
    assert data['msg'] == 'Signup successful'
    # verify user exists in DB
    from app.models import User
    user = User.query.filter_by(email='apitest@example.com').first()
    assert user is not None
