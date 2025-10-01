# Repo-root shim to make `import app` work for tests and scripts
from backend.app import create_app, db, login_manager  # re-export for tests

# Provide an app instance for flask CLI when running from repo root
try:
    app = create_app()
except Exception:
    # defer to tests or manual runners to configure app
    app = None
