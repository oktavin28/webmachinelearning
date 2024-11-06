from http.server import HTTPServer, SimpleHTTPRequestHandler
import sys

class CustomHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.extensions_map.update({
            '.json': 'application/json',
            '.bin': 'application/octet-stream'
        })

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

port = 8000
handler = CustomHandler

try:
    server = HTTPServer(('localhost', port), handler)
    print(f'Server started at http://localhost:{port}')
    server.serve_forever()
except KeyboardInterrupt:
    print('\nShutting down server')
    server.socket.close()
    sys.exit(0)