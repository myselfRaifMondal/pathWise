from flask import session, render_template, redirect, url_for, request, flash, jsonify
from app import db, login_manager

from flask_login import login_user, login_required, logout_user, current_user
from flask_cors import cross_origin

def register_routes(app):
    # simple request logger for debugging
    @app.before_request
    def _log_request():
        app.logger.debug(f"Incoming request: {request.method} {request.path} from {request.remote_addr}")
        # log headers that may affect auth/CORS
        app.logger.debug(f"Headers: {dict(request.headers)}")
    # Import models inside the function to ensure correct app context
    # Do not import models here; import inside each route function
    # --- API AUTH ENDPOINTS ---
    @app.route('/api/signup', methods=['POST', 'OPTIONS'])
    @cross_origin(supports_credentials=True)
    def api_signup():
        from app.models import User
        app.logger.info("api_signup entered")
        # Handle CORS preflight
        if request.method == 'OPTIONS':
            return jsonify({'msg': 'ok'}), 200
        data = request.get_json(silent=True)
        if not data:
            app.logger.warning("api_signup: no JSON body received")
            return jsonify({'error': 'JSON body required'}), 400
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 409
        user = User(email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        # Do not call login_user for API signup; return created response
        return jsonify({'msg': 'Signup successful', 'user': {'id': user.id, 'email': user.email}}), 201

    @app.route('/api/login', methods=['POST'])
    def api_login():
        from app.models import User
        data = request.get_json(silent=True) or {}
        email = data.get('email')
        password = data.get('password')
        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            login_user(user)
            return jsonify({'msg': 'Login successful', 'user': {'id': user.id, 'email': user.email}})
        return jsonify({'error': 'Invalid credentials'}), 401

    @app.route('/api/logout', methods=['POST'])
    @login_required
    def api_logout():
        logout_user()
        return jsonify({'msg': 'Logged out'})

    @app.route('/api/session', methods=['GET'])
    def api_session():
        # session status
        if current_user.is_authenticated:
            return jsonify({'authenticated': True, 'user': {'id': current_user.id, 'email': current_user.email}})
        return jsonify({'authenticated': False}), 200

    @app.route('/signup', methods=['GET', 'POST'])
    def signup():
        from app.models import User
        if request.method == 'POST':
            email = request.form.get('email')
            pwd = request.form.get('password')
            if User.query.filter_by(email=email).first():
                flash('Email already registered')
                return redirect(url_for('signup'))
            user = User(email=email)
            user.set_password(pwd)
            db.session.add(user)
            db.session.commit()
            login_user(user)
            return redirect(url_for('dashboard'))
        return render_template('signup.html')

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        from app.models import User
        if request.method == 'POST':
            email = request.form.get('email')
            pwd = request.form.get('password')
            user = User.query.filter_by(email=email).first()
            if user and user.check_password(pwd):
                login_user(user)
                return redirect(url_for('dashboard'))
            flash('Invalid credentials')
        return render_template('login.html')

    @app.route('/logout')
    @login_required
    def logout():
        # No model import required here
        logout_user()
        return redirect(url_for('login'))

    @app.route('/dashboard')
    @login_required
    def dashboard():
        return render_template('dashboard.html')

    @app.route('/applications', methods=['GET', 'POST'])
    @login_required
    def applications():
        from app.models import Application
        if request.method == 'POST':
            data = request.get_json()
            app_obj = Application(
                title=data.get('title'),
                company=data.get('company'),
                status=data.get('status'),
                user_id=current_user.id
            )
            db.session.add(app_obj)
            db.session.commit()
            return jsonify({'msg': 'Created'}), 201
        apps = Application.query.filter_by(user_id=current_user.id).all()
        return jsonify([{'id': a.id, 'title': a.title, 'status': a.status} for a in apps])

    @app.route('/applications/<int:app_id>', methods=['PUT', 'DELETE'])
    @login_required
    def modify_application(app_id):
        from app.models import Application
        app_obj = Application.query.get_or_404(app_id)
        if app_obj.user_id != current_user.id:
            return jsonify({'msg': 'Forbidden'}), 403
        if request.method == 'PUT':
            data = request.get_json()
            app_obj.status = data.get('status', app_obj.status)
            db.session.commit()
            return jsonify({'msg': 'Updated'}), 200
        elif request.method == 'DELETE':
            db.session.delete(app_obj)
            db.session.commit()
            return jsonify({'msg': 'Deleted'}), 200

    @app.route('/admin/users')
    @login_required
    def admin_users():
        from app.models import User
        if current_user.role != 'admin':
            return redirect(url_for('dashboard'))
        users = User.query.all()
        return render_template('admin_users.html', users=users)
    # --- API AUTH ENDPOINTS ---
