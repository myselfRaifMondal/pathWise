from app import create_app

if __name__ == '__main__':
    # Use a local sqlite file for quick development runs
    import os
    app = create_app({'SQLALCHEMY_DATABASE_URI': 'sqlite:///dev.db'})
    port = int(os.environ.get('PORT', 5001))
    app.run(host='127.0.0.1', port=port, debug=True)
