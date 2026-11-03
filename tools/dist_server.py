"""The built site for the tools (serve.py, lint_ui.py, make_card.py): `npm run build` makes dist/,
and this serves it at /ODM-Poser/ as the site is (the base in astro.config.mjs: the docs link with
it), with /ODM-Poser/mods/ from the mods/ folder (where the editor, ../mods/ in web/mods.js, looks
for your mods). The editor is at /ODM-Poser/editor/index.html; / goes there.
"""

from __future__ import annotations

import contextlib
import functools
import http.server
import posixpath
import shutil
import subprocess
import threading
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
BASE = "/ODM-Poser"                                      # astro.config.mjs: base


def build() -> None:
    subprocess.run([shutil.which("npm") or "npm", "run", "build"], cwd=ROOT, check=True)


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      ".js": "application/javascript", ".webmanifest": "application/manifest+json",
                      ".svg": "image/svg+xml", ".json": "application/json"}

    def do_GET(self):
        if urllib.parse.urlsplit(self.path).path == "/":
            self.send_response(302)
            self.send_header("Location", f"{BASE}/editor/")
            self.end_headers()
            return
        super().do_GET()

    def translate_path(self, path):
        # the site under BASE; mods/... from the repository's mods/ (".." is folded first, so
        # nothing outside it)
        clean = posixpath.normpath(urllib.parse.unquote(urllib.parse.urlsplit(path).path))
        if not clean.startswith(BASE + "/"):
            return str(DIST / "-")                                       # nothing there: 404
        path = path[len(BASE):]
        if clean.startswith(BASE + "/mods/"):
            return super().translate_path(path).replace(str(DIST), str(ROOT), 1)
        return super().translate_path(path)

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")            # the service worker keeps its own copy
        super().end_headers()

    def log_message(self, fmt, *args):
        pass


def server(host: str, port: int) -> http.server.ThreadingHTTPServer:
    return http.server.ThreadingHTTPServer((host, port), functools.partial(Handler, directory=str(DIST)))


@contextlib.contextmanager
def editor(build_first: bool = True):
    """Build, serve dist/ on a free port of this computer for the time of the with block, and give
    the editor's address."""
    if build_first:
        build()
    s = server("127.0.0.1", 0)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    try:
        yield f"http://127.0.0.1:{s.server_address[1]}{BASE}/editor/index.html"
    finally:
        s.shutdown()
