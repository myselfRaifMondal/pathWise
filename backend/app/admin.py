# app/admin.py
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_login import current_user
from flask import redirect, url_for, request
from app import db
from app.models import User, Application

class SecureModelView(ModelView):
    def is_accessible(self):
        return current_user.is_authenticated and current_user.role == "admin"

    def inaccessible_callback(self, name, **kwargs):
        # Redirect non-admin users to login page
        return redirect(url_for("login", next=request.url))

def init_admin(app):
    admin = Admin(app, name="PathWise Admin", template_mode="bootstrap4")
    admin.add_view(SecureModelView(User, db.session))
    admin.add_view(SecureModelView(Application, db.session))
    return admin
