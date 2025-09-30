
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
    with app.app_context():
        # Import all model classes to register them with SQLAlchemy
        from app.models import User, Application
        print("Registered models:", db.Model.__subclasses__())
        db.create_all()
        print("Tables created after create_all():", list(db.metadata.tables.keys()))
        login_manager.init_app(app)
        @login_manager.user_loader
        def load_user(user_id):
            return User.query.get(int(user_id))
        yield app
        db.session.remove()
        db.drop_all()



@pytest.fixture(scope='function')
def client(app):
    with app.app_context():
        yield app.test_client()
