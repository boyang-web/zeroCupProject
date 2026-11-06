"""Serve the ready-to-play build; no dependency installation needed for viewing."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import argparse, webbrowser

root = Path(__file__).resolve().parent.parent / 'dist'
parser = argparse.ArgumentParser()
parser.add_argument('--no-open', action='store_true')
args = parser.parse_args()
if not (root / 'index.html').is_file():
    raise SystemExit('Build missing. Run npm ci and npm run build in the project root first.')
handler = partial(SimpleHTTPRequestHandler, directory=str(root))
server = None
for port in range(8780,8790):
    try:
        server = ThreadingHTTPServer(('127.0.0.1',port),handler)
        break
    except OSError:
        continue
if server is None: raise SystemExit('Ports 8780-8789 are busy.')
url = f'http://127.0.0.1:{server.server_port}'
print(f'Baiwei / Local preview: {url}',flush=True)
print('Keep this window open. Ctrl+C stops the preview.',flush=True)
if not args.no_open: webbrowser.open(url)
try: server.serve_forever()
except KeyboardInterrupt: pass
finally: server.server_close()
