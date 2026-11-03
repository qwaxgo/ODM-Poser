"""Serve the editor from this computer, so it can be installed as an app (PWA):

    python tools/serve.py            http://localhost:8765/ODM-Poser/editor/  (this computer)
    python tools/serve.py --lan      also to other devices on the same network (see below)
    python tools/serve.py --port 9000
    python tools/serve.py --no-build serve dist/ as it was last built

The list of mods (web/mods.js) is written and the site is built (npm run build -> dist/) first;
your mods are served from mods/. The docs are at /ODM-Poser/docs/. A browser installs an app only from https or
from localhost, so on this computer it can be added at once; a phone or tablet on the network
opens the editor, but adding it as an app needs the editor on an https site (docs/APP-JA.md).
"""

from __future__ import annotations

import argparse
import socket
import subprocess
import sys

import dist_server
from dist_server import ROOT


def lan_address() -> str:
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
        try:
            s.connect(("192.0.2.1", 9))                          # no packet is sent; it picks the interface
            return s.getsockname()[0]
        except OSError:
            return "127.0.0.1"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--port", type=int, default=8765)
    ap.add_argument("--lan", action="store_true", help="also serve to other devices on this network")
    ap.add_argument("--no-build", action="store_true", help="serve dist/ as it was last built")
    a = ap.parse_args()
    subprocess.run([sys.executable, str(ROOT / "tools" / "make_mods_list.py")], check=False)
    if not a.no_build:
        dist_server.build()
    host = "0.0.0.0" if a.lan else "127.0.0.1"
    server = dist_server.server(host, a.port)
    print(f"ODM Poser: http://localhost:{a.port}{dist_server.BASE}/editor/")
    if a.lan:
        print(f"  other devices on this network: http://{lan_address()}:{a.port}{dist_server.BASE}/editor/ "
              "(opens there; adding as an app needs https)")
    print("Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
