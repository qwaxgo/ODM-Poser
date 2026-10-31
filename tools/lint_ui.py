"""Check the editor's UI against melta UI (design/melta-ui) as it is drawn: the page is opened in a
browser (Playwright), every panel built by the modules is there, and the whole page goes through
melta-lint (the same check as melta's MCP check_html and CI). Needs `npm install` (package.json)
and Playwright for Python (pip install playwright; it uses Edge, or `playwright install chromium`).

    python tools/lint_ui.py [--keep out.html]
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "web" / "editor" / "index.html"


def rendered_html() -> str:
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(channel="msedge")
        except Exception:
            browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 1000})
        page.goto(PAGE.as_uri() + "?nomods")
        page.wait_for_timeout(1500)
        # the page as drawn; the scripts are left out (their source is not the UI)
        html = page.evaluate("""() => { const d = document.documentElement.cloneNode(true);
          d.querySelectorAll('script').forEach(s => s.remove()); return '<!doctype html>\\n' + d.outerHTML; }""")
        browser.close()
    return html


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--keep", type=Path, help="also save the drawn page here")
    args = ap.parse_args()
    html = rendered_html()
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "editor-rendered.html"
        out.write_text(html, encoding="utf-8")
        if args.keep:
            shutil.copy(out, args.keep)
        lint = ROOT / "node_modules" / ".bin" / ("melta-lint.cmd" if sys.platform == "win32" else "melta-lint")
        return subprocess.call([str(lint), str(out)], shell=sys.platform == "win32")


if __name__ == "__main__":
    sys.exit(main())
