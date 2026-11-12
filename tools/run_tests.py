"""The editor's behaviour tests (tests/test_*.py): builds the site once (--no-build: uses dist/), serves it
(tools/dist_server.py) and opens the editor in Chromium through Playwright for each test, each in a new
browser context (its own localStorage). A test is a function test_<name>(ed) in a tests/test_*.py file;
ed.page(...) opens the editor and gives a Page with .E (page.evaluate) and the page's errors in .errs.

  python tools/run_tests.py              all tests
  python tools/run_tests.py hands file   only the files whose names hold one of these words
  python tools/run_tests.py --no-build   without building first

The refactoring's safety net (docs/ARCHITECTURE.md, 10.3): run it before and after each step.
"""

from __future__ import annotations

import importlib.util
import sys
import time
import traceback
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from dist_server import editor  # noqa: E402

from playwright.sync_api import sync_playwright  # noqa: E402


class Editor:
    def __init__(self, browser, url):
        self.browser, self.url, self.pages = browser, url, []

    def page(self, query: str = "", phone: bool = False, clipboard: bool = False, **kw):
        opts = dict(viewport={"width": 1400, "height": 900})
        if phone:
            opts = dict(viewport={"width": 390, "height": 844}, device_scale_factor=3, is_mobile=True, has_touch=True)
        if clipboard:
            opts["permissions"] = ["clipboard-read", "clipboard-write"]
        opts.update(kw)
        ctx = self.browser.new_context(**opts)
        pg = ctx.new_page()
        pg.errs = []
        pg.on("pageerror", lambda e: pg.errs.append(str(e)))
        pg.goto(self.url + query)
        pg.wait_for_function("typeof S === 'object' && typeof draw === 'function' && !!window.ODMPoser")
        pg.wait_for_timeout(300)
        pg.E = pg.evaluate
        self.pages.append(ctx)
        return pg

    def close(self):
        for c in self.pages:
            c.close()
        self.pages = []


def check(cond, msg="check failed"):
    if not cond:
        raise AssertionError(msg)


def main(argv):
    build = "--no-build" not in argv
    words = [a for a in argv if not a.startswith("--")]
    files = sorted((ROOT / "tests").glob("test_*.py"))
    if words:
        files = [f for f in files if any(w in f.stem for w in words)]
    tests = []
    for f in files:
        spec = importlib.util.spec_from_file_location(f.stem, f)
        mod = importlib.util.module_from_spec(spec)
        mod.check = check
        spec.loader.exec_module(mod)
        tests += [(f.stem, n, getattr(mod, n)) for n in dir(mod) if n.startswith("test_") and callable(getattr(mod, n))]
    failed = 0
    with editor(build_first=build) as url, sync_playwright() as p:
        browser = p.chromium.launch()
        for stem, name, fn in tests:
            ed = Editor(browser, url)
            t0 = time.time()
            try:
                fn(ed)
                for c in ed.pages:
                    for pg in c.pages:
                        check(not getattr(pg, "errs", []), f"page errors: {pg.errs}")
                print(f"ok    {stem}.{name} ({time.time() - t0:.1f}s)")
            except Exception:
                failed += 1
                print(f"FAIL  {stem}.{name}")
                traceback.print_exc()
            finally:
                ed.close()
        browser.close()
    print(f"{len(tests) - failed} passed, {failed} failed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
