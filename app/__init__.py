"""Compatibility shim for tests & scripts.

This package mirrors the real `backend.app` package so tests that import
`app` or `app.models` continue to work when running pytest from the repo root.
"""
from importlib import import_module
import sys

# Import and re-export main objects from backend.app
backend_app = import_module('backend.app')
create_app = getattr(backend_app, 'create_app')
db = getattr(backend_app, 'db')
login_manager = getattr(backend_app, 'login_manager')

# Try to lazily load submodules like `app.models` and `app.routes` by aliasing
# them to their backend equivalents so `import app.models` works.
for sub in ('models', 'routes', 'admin'):
    try:
        mod = import_module(f'backend.app.{sub}')
        sys.modules[f'app.{sub}'] = mod
        setattr(sys.modules[__name__], sub, mod)
    except Exception:
        # ignore missing optional submodules; tests will import what they need
        pass

# Expose a default Flask app for convenience, but don't fail on import
try:
    app = create_app()
except Exception:
    app = None

__all__ = ['create_app', 'db', 'login_manager', 'app']
