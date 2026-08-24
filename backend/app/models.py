from datetime import datetime, timezone

from werkzeug.security import check_password_hash, generate_password_hash

from app import db

# Order matters: the board renders columns in this sequence and the funnel
# treats it as the progression from saved through to a decision.
STAGES = ("Saved", "Applied", "Screening", "Interview", "Offer", "Rejected")


def _utcnow():
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(120))
    role = db.Column(db.String(50), nullable=False, default="user")
    theme_preference = db.Column(db.String(10), nullable=False, default="dark")
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)

    applications = db.relationship(
        "Application", back_populates="user", cascade="all, delete-orphan", lazy="dynamic"
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "themePreference": self.theme_preference,
        }


class Application(db.Model):
    __tablename__ = "application"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True
    )

    role = db.Column(db.String(200), nullable=False)
    company = db.Column(db.String(200), nullable=False)
    stage = db.Column(db.String(50), nullable=False, default="Applied")

    applied = db.Column(db.Date)
    deadline = db.Column(db.Date)
    # Free-text label for what the deadline is: "Onsite loop", "Take-home due", ...
    kind = db.Column(db.String(120))
    location = db.Column(db.String(200))
    note = db.Column(db.Text)

    contact_name = db.Column(db.String(200))
    contact_title = db.Column(db.String(200))
    contact_email = db.Column(db.String(255))

    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = db.Column(
        db.DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow
    )

    user = db.relationship("User", back_populates="applications")

    def to_dict(self):
        contact = None
        if self.contact_name or self.contact_email:
            contact = {
                "name": self.contact_name,
                "title": self.contact_title,
                "email": self.contact_email,
            }
        return {
            "id": self.id,
            "role": self.role,
            "company": self.company,
            "stage": self.stage,
            "applied": self.applied.isoformat() if self.applied else None,
            "deadline": self.deadline.isoformat() if self.deadline else None,
            "kind": self.kind,
            "location": self.location,
            "note": self.note,
            "contact": contact,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
