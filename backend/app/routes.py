from datetime import date, datetime

from flask import current_app, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
)
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from app import db
from app.mail import send_reset_email
from app.models import SENIORITIES, STAGES, WORK_TYPES, Application, Profile, User

RESET_SALT = "pathwise-password-reset"
RESET_MAX_AGE = 3600  # seconds

# Fields a client may set directly, mapped to their model column.
WRITABLE = {
    "role": "role",
    "company": "company",
    "stage": "stage",
    "kind": "kind",
    "location": "location",
    "note": "note",
}
DATE_FIELDS = ("applied", "deadline")


def _serializer():
    return URLSafeTimedSerializer(current_app.config["SECRET_KEY"], salt=RESET_SALT)


def _parse_date(value, field):
    if value in (None, ""):
        return None
    if isinstance(value, date):
        return value
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        raise ValueError(f"{field} must be an ISO date (YYYY-MM-DD)")


def _current_user():
    return db.session.get(User, int(get_jwt_identity()))


def _tokens_for(user):
    identity = str(user.id)
    return {
        "accessToken": create_access_token(identity=identity),
        "refreshToken": create_refresh_token(identity=identity),
        "user": user.to_dict(),
    }


def _apply_payload(application, data):
    """Copy a request body onto an Application. Raises ValueError on bad input."""
    for key, column in WRITABLE.items():
        if key in data:
            setattr(application, column, data[key])

    for field in DATE_FIELDS:
        if field in data:
            setattr(application, field, _parse_date(data[field], field))

    if "contact" in data:
        contact = data["contact"] or {}
        if not isinstance(contact, dict):
            raise ValueError("contact must be an object or null")
        application.contact_name = contact.get("name")
        application.contact_title = contact.get("title")
        application.contact_email = contact.get("email")

    if application.stage not in STAGES:
        raise ValueError(f"stage must be one of: {', '.join(STAGES)}")


def register_routes(app):
    # ---------- health ----------

    @app.get("/api/health")
    def health():
        return jsonify({
            "status": "ok",
            "stages": list(STAGES),
            "seniorities": list(SENIORITIES),
            "workTypes": list(WORK_TYPES),
        })

    # ---------- auth ----------

    @app.post("/api/auth/signup")
    def signup():
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        if len(password) < 8:
            return jsonify({"error": "Password must be at least 8 characters"}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "That email is already registered"}), 409

        user = User(email=email, name=(data.get("name") or "").strip() or None)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return jsonify(_tokens_for(user)), 201

    @app.post("/api/auth/login")
    def login():
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip().lower()
        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(data.get("password") or ""):
            return jsonify({"error": "Invalid email or password"}), 401
        return jsonify(_tokens_for(user))

    @app.post("/api/auth/refresh")
    @jwt_required(refresh=True)
    def refresh():
        user = _current_user()
        if not user:
            return jsonify({"error": "Account no longer exists"}), 401
        return jsonify({"accessToken": create_access_token(identity=str(user.id))})

    @app.get("/api/auth/me")
    @jwt_required()
    def me():
        user = _current_user()
        if not user:
            return jsonify({"error": "Account no longer exists"}), 401
        return jsonify(user.to_dict())

    @app.patch("/api/auth/me")
    @jwt_required()
    def update_me():
        user = _current_user()
        if not user:
            return jsonify({"error": "Account no longer exists"}), 401
        data = request.get_json(silent=True) or {}
        if "name" in data:
            user.name = (data.get("name") or "").strip() or None
        if "themePreference" in data:
            if data["themePreference"] not in ("dark", "light"):
                return jsonify({"error": "themePreference must be 'dark' or 'light'"}), 400
            user.theme_preference = data["themePreference"]
        db.session.commit()
        return jsonify(user.to_dict())

    @app.post("/api/auth/forgot")
    def forgot():
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip().lower()
        user = User.query.filter_by(email=email).first() if email else None
        if user:
            token = _serializer().dumps(user.id)
            send_reset_email(
                user.email,
                f"{current_app.config['APP_BASE_URL']}/reset?token={token}",
            )
        # Always the same response, so the endpoint cannot enumerate accounts.
        return jsonify({"message": "If the address exists, a reset link is on its way"})

    @app.post("/api/auth/reset")
    def reset():
        data = request.get_json(silent=True) or {}
        password = data.get("password") or ""
        if len(password) < 8:
            return jsonify({"error": "Password must be at least 8 characters"}), 400
        try:
            user_id = _serializer().loads(data.get("token") or "", max_age=RESET_MAX_AGE)
        except SignatureExpired:
            return jsonify({"error": "That reset link has expired"}), 400
        except BadSignature:
            return jsonify({"error": "That reset link is not valid"}), 400

        user = db.session.get(User, user_id)
        if not user:
            return jsonify({"error": "That reset link is not valid"}), 400
        user.set_password(password)
        db.session.commit()
        return jsonify(_tokens_for(user))

    @app.delete("/api/auth/account")
    @jwt_required()
    def delete_account():
        # Required by App Store guideline 5.1.1(v): an account created in the
        # app must be deletable from the app.
        user = _current_user()
        if not user:
            return jsonify({"error": "Account no longer exists"}), 401
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "Account deleted"})

    # ---------- application profile ----------

    @app.get("/api/profile")
    @jwt_required()
    def get_profile():
        row = Profile.query.filter_by(user_id=int(get_jwt_identity())).first()
        # Never 404: the form should render whether or not anything is saved.
        return jsonify(row.to_dict() if row else Profile.empty_dict())

    @app.put("/api/profile")
    @jwt_required()
    def save_profile():
        from app.models import _join

        data = request.get_json(silent=True) or {}
        user_id = int(get_jwt_identity())

        row = Profile.query.filter_by(user_id=user_id).first()
        if not row:
            row = Profile(user_id=user_id)
            db.session.add(row)

        # camelCase over the wire, snake_case in the column.
        def incoming(column):
            key = "".join(
                part if i == 0 else part.title() for i, part in enumerate(column.split("_"))
            )
            return key if key in data else None

        for column in Profile.TEXT_FIELDS:
            key = incoming(column)
            if key:
                value = data[key]
                setattr(row, column, (str(value).strip() or None) if value is not None else None)

        for column in Profile.LIST_FIELDS:
            key = incoming(column)
            if key:
                setattr(row, column, _join(data[key]))

        for column in Profile.INT_FIELDS:
            key = incoming(column)
            if key:
                value = data[key]
                if value in (None, ""):
                    setattr(row, column, None)
                else:
                    try:
                        setattr(row, column, int(value))
                    except (TypeError, ValueError):
                        return jsonify({"error": f"{key} must be a whole number"}), 400

        if row.seniority and row.seniority not in SENIORITIES:
            return jsonify({"error": f"seniority must be one of: {', '.join(SENIORITIES)}"}), 400
        if row.work_type and row.work_type not in WORK_TYPES:
            return jsonify({"error": f"workType must be one of: {', '.join(WORK_TYPES)}"}), 400

        db.session.commit()
        return jsonify(row.to_dict())

    # ---------- applications ----------

    @app.get("/api/applications")
    @jwt_required()
    def list_applications():
        rows = (
            Application.query.filter_by(user_id=int(get_jwt_identity()))
            .order_by(Application.applied.desc().nullslast(), Application.id.desc())
            .all()
        )
        return jsonify([row.to_dict() for row in rows])

    @app.post("/api/applications")
    @jwt_required()
    def create_application():
        data = request.get_json(silent=True) or {}
        if not (data.get("role") or "").strip() or not (data.get("company") or "").strip():
            return jsonify({"error": "role and company are required"}), 400

        application = Application(user_id=int(get_jwt_identity()), stage="Applied")
        try:
            _apply_payload(application, data)
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400

        # A saved-but-not-submitted application has no applied date by definition.
        if application.stage != "Saved" and application.applied is None:
            application.applied = date.today()

        db.session.add(application)
        db.session.commit()
        return jsonify(application.to_dict()), 201

    def _owned_or_error(app_id):
        application = db.session.get(Application, app_id)
        if not application:
            return None, (jsonify({"error": "Not found"}), 404)
        if application.user_id != int(get_jwt_identity()):
            return None, (jsonify({"error": "Forbidden"}), 403)
        return application, None

    @app.get("/api/applications/<int:app_id>")
    @jwt_required()
    def get_application(app_id):
        application, error = _owned_or_error(app_id)
        return error or jsonify(application.to_dict())

    @app.patch("/api/applications/<int:app_id>")
    @jwt_required()
    def update_application(app_id):
        application, error = _owned_or_error(app_id)
        if error:
            return error
        try:
            _apply_payload(application, request.get_json(silent=True) or {})
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400
        db.session.commit()
        return jsonify(application.to_dict())

    @app.delete("/api/applications/<int:app_id>")
    @jwt_required()
    def delete_application(app_id):
        application, error = _owned_or_error(app_id)
        if error:
            return error
        db.session.delete(application)
        db.session.commit()
        return jsonify({"message": "Deleted"})
