from flask import session, render_template, redirect, url_for, request, flash, jsonify
from app import db, login_manager

from flask_login import login_user, login_required, logout_user, current_user

def register_routes(app):
    # Import models inside the function to ensure correct app context
    # Do not import models here; import inside each route function
    # --- API AUTH ENDPOINTS ---
    @app.route('/api/signup', methods=['POST'])
    def api_signup():
        from app.models import User
        data = request.get_json()
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
        login_user(user)
        return jsonify({'msg': 'Signup successful', 'user': {'id': user.id, 'email': user.email}}), 201

    @app.route('/api/login', methods=['POST'])
    def api_login():
        from app.models import User
        data = request.get_json()
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
        from app.models import User
        if current_user.is_authenticated:
            return jsonify({'authenticated': True, 'user': {'id': current_user.id, 'email': current_user.email}})
        return jsonify({'authenticated': False}), 200

    @app.route('/signup', methods=['GET', 'POST'])
    def signup():
    from app.models import User
        if request.method == 'POST':
            email = request.form['email']
            pwd = request.form['password']
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
            email = request.form['email']
            pwd = request.form['password']
            user = User.query.filter_by(email=email).first()
            if user and user.check_password(pwd):
                login_user(user)
                return redirect(url_for('dashboard'))
            flash('Invalid credentials')
        return render_template('login.html')

    @app.route('/logout')
    @login_required
    def logout():
    from app.models import User
    logout_user()
    return redirect(url_for('login'))

    @app.route('/dashboard')
    @login_required
    def dashboard():
    from app.models import User
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
