from flask import render_template, redirect, url_for, request, flash, jsonify
from app import create_app, db, login_manager
from app.models import User, Application
from flask_login import login_user, login_required, logout_user, current_user

app = create_app()

@app.route('/signup', methods=['GET','POST'])
def signup():
    if request.method == 'POST':
        # create new user
        email = request.form['email']
        pwd = request.form['password']
        if User.query.filter_by(email=email).first():
            flash('Email already registered')
        else:
            user = User(email=email)
            user.set_password(pwd)  # hash password
            db.session.add(user)
            db.session.commit()
            login_user(user)
            return redirect(url_for('dashboard'))
    return render_template('signup.html')

@app.route('/login', methods=['GET','POST'])
def login():
    if request.method == 'POST':
        user = User.query.filter_by(email=request.form['email']).first()
        if user and user.check_password(request.form['password']):
            login_user(user)
            return redirect(url_for('dashboard'))
        flash('Invalid credentials')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

# Protected dashboard
@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

# CRUD for Applications
@app.route('/applications', methods=['GET','POST'])
@login_required
def applications():
    if request.method == 'POST':
        data = request.get_json()
        app_item = Application(
            title=data['title'],
            description=data.get('description'),
            company=data.get('company'),
            status='pending',
            user=current_user
        )
        db.session.add(app_item)
        db.session.commit()
        return jsonify({'msg': 'Created'}), 201
    else:
        # List all applications for current user
        apps = Application.query.filter_by(user_id=current_user.id).all()
        return jsonify([{'id': a.id, 'title': a.title, 'status': a.status} for a in apps])

@app.route('/applications/<int:app_id>', methods=['PUT','DELETE'])
@login_required
def modify_application(app_id):
    app_item = Application.query.get_or_404(app_id)
    if app_item.user_id != current_user.id:
        return jsonify({'msg': 'Forbidden'}), 403
    if request.method == 'PUT':
        data = request.get_json()
        app_item.title = data.get('title', app_item.title)
        app_item.status = data.get('status', app_item.status)
        db.session.commit()
        return jsonify({'msg': 'Updated'}), 200
    else:
        db.session.delete(app_item)
        db.session.commit()
        return jsonify({'msg': 'Deleted'}), 200

# Admin routes (example: list users)
@app.route('/admin/users')
@login_required
def admin_users():
    if current_user.role != 'admin':
        return redirect(url_for('dashboard'))
    users = User.query.all()
    return render_template('admin_users.html', users=users)
