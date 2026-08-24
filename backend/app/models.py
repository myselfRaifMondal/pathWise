from datetime import datetime, timezone

from werkzeug.security import check_password_hash, generate_password_hash

from app import db

# Order matters: the board renders columns in this sequence and the funnel
# treats it as the progression from saved through to a decision.
STAGES = ("Saved", "Applied", "Screening", "Interview", "Offer", "Rejected")

# Fixed vocabularies for the application profile, validated the same way stages
# are. Kept deliberately short — these become filters for job suggestions.
SENIORITIES = ("Intern", "Entry", "Junior", "Mid", "Senior", "Lead")
WORK_TYPES = ("Remote", "Hybrid", "Onsite", "Any")


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
    profile = db.relationship(
        "Profile", back_populates="user", cascade="all, delete-orphan", uselist=False
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


def _split(value):
    """Comma-separated text -> list, so the client gets arrays without a JSON column."""
    if not value:
        return []
    return [part.strip() for part in value.split(",") if part.strip()]


def _join(value):
    """List (or already-joined text) -> comma-separated text for storage."""
    if value is None:
        return None
    if isinstance(value, str):
        value = value.split(",")
    cleaned = [str(part).strip() for part in value if str(part).strip()]
    return ", ".join(cleaned) or None


class Profile(db.Model):
    """The details a job application or portal asks for, kept once and reused.

    Separate from User so that table stays about authentication. One row per
    user; deleting the account removes it via the cascade above.
    """

    __tablename__ = "profile"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    # Application basics
    full_name = db.Column(db.String(200))
    phone = db.Column(db.String(40))
    current_location = db.Column(db.String(200))
    resume_url = db.Column(db.String(500))
    notice_period = db.Column(db.String(80))
    work_authorization = db.Column(db.String(200))

    # What they are looking for
    target_roles = db.Column(db.Text)
    seniority = db.Column(db.String(20))
    preferred_locations = db.Column(db.Text)
    work_type = db.Column(db.String(20))

    # Fit
    skills = db.Column(db.Text)
    years_experience = db.Column(db.Integer)
    education = db.Column(db.String(300))

    # Compensation and links
    expected_salary_min = db.Column(db.Integer)
    salary_currency = db.Column(db.String(8), default="INR")
    portfolio_url = db.Column(db.String(500))
    linkedin_url = db.Column(db.String(500))
    github_url = db.Column(db.String(500))

    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = db.Column(
        db.DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow
    )

    user = db.relationship("User", back_populates="profile")

    #: Everything a client may send. Lists are stored joined, ints coerced.
    TEXT_FIELDS = (
        "full_name", "phone", "current_location", "resume_url", "notice_period",
        "work_authorization", "seniority", "work_type", "education",
        "salary_currency", "portfolio_url", "linkedin_url", "github_url",
    )
    LIST_FIELDS = ("target_roles", "preferred_locations", "skills")
    INT_FIELDS = ("years_experience", "expected_salary_min")

    def to_dict(self):
        return {
            "fullName": self.full_name,
            "phone": self.phone,
            "currentLocation": self.current_location,
            "resumeUrl": self.resume_url,
            "noticePeriod": self.notice_period,
            "workAuthorization": self.work_authorization,
            "targetRoles": _split(self.target_roles),
            "seniority": self.seniority,
            "preferredLocations": _split(self.preferred_locations),
            "workType": self.work_type,
            "skills": _split(self.skills),
            "yearsExperience": self.years_experience,
            "education": self.education,
            "expectedSalaryMin": self.expected_salary_min,
            "salaryCurrency": self.salary_currency or "INR",
            "portfolioUrl": self.portfolio_url,
            "linkedinUrl": self.linkedin_url,
            "githubUrl": self.github_url,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }

    @staticmethod
    def empty_dict():
        """Shape returned before a profile exists, so the form always renders."""
        return Profile().to_dict()
