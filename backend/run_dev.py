"""Local development server. Uses a throwaway SQLite file unless DATABASE_URL is set."""
import os

from app import create_app

if __name__ == "__main__":
    overrides = {}
    if not os.getenv("DATABASE_URL"):
        overrides["SQLALCHEMY_DATABASE_URI"] = "sqlite:///dev.db"
    app = create_app(overrides)
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", 5001)), debug=True)
