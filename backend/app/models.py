from app.__init__ import db, login_manager
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='user')  # e.g. 'admin' or 'user'

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)  # PBKDF2 hash:contentReference[oaicite:30]{index=30}

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))  # load user for session:contentReference[oaicite:31]{index=31}

class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    company = db.Column(db.String(150))
    status = db.Column(db.String(50))  # e.g. 'pending', 'accepted', etc.
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship('User', backref='applications')
