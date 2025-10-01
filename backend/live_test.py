import socket
import threading
import time
import requests
from werkzeug.serving import make_server
from app import create_app

# Find a free port
s = socket.socket()
s.bind(('127.0.0.1', 0))
port = s.getsockname()[1]
s.close()

app = create_app({'SQLALCHEMY_DATABASE_URI': 'sqlite:///dev_live.db'})

class ServerThread(threading.Thread):
    def __init__(self, app, host, port):
        threading.Thread.__init__(self)
        self.srv = make_server(host, port, app)
        self.ctx = app.app_context()
        self.ctx.push()
        self.daemon = True

    def run(self):
        print(f"Starting WSGI server on http://127.0.0.1:{port}")
        self.srv.serve_forever()

    def shutdown(self):
        self.srv.shutdown()

server = ServerThread(app, '127.0.0.1', port)
server.start()

# Give server a moment to start
time.sleep(0.5)

url = f'http://127.0.0.1:{port}/api/signup'
print('Posting to', url)
try:
    r = requests.post(url, json={'email': 'live-inproc@example.com', 'password': 'pwd12345'}, timeout=10)
    print('Client response status:', r.status_code)
    print('Client response body:', r.text)
except Exception as e:
    print('Client request error:', e)

# Shutdown server
server.shutdown()
print('Server shutdown')
