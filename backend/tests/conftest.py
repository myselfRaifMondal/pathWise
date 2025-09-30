import pytest
from app import create_app, db, login_manager
from app.models import User

@pytest.fixture(scope='function')
def app():
    app = create_app({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'WTF_CSRF_ENABLED': False,
        'SERVER_NAME': 'localhost.localdomain'
    })

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    ctx = app.app_context()
    ctx.push()
    db.create_all()
    yield app
    db.session.remove()
    db.drop_all()
    ctx.pop()



@pytest.fixture()
def client(app):
    return app.test_client()
