"""The HTML release: a zip whose editor opens from disk (no server, nothing to install).

    python tools/make_release_html.py [--tag v0.1.0] [--no-build]

Builds the site (npm run build) and writes to release/:
    ODM-Poser-v<version>-html.zip   ODM-Poser-v<version>/ with
        index.html     opens the editor (tools/html_release/index.html)
        editor/        dist/editor/ (its "使い方" link goes to the site's docs: the zip has none)
        mods.js        the mods to load, written by the user (tools/html_release/mods.js)
        mods/          the user's mods (tools/html_release/mods/README.txt)
        LICENSE
    notes.md        the release notes: the "## v<version>" part of CHANGELOG.md

The version is package.json's; --tag (the pushed tag, in .github/workflows/release.yml) must match it.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import zipfile
from pathlib import Path

import dist_server

ROOT = dist_server.ROOT
OUT = ROOT / "release"
PARTS = Path(__file__).resolve().parent / "html_release"
DOCS = "https://apps.qwaxgo.com/ODM-Poser/docs/"
SKIP = {"ui.src.css"}                                    # the editor's CSS source (ui.css goes)


def version() -> str:
    return json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["version"]


def notes(ver: str) -> str:
    """The CHANGELOG.md part under "## v<ver>" (up to the next "## ")."""
    text = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")
    m = re.search(rf"^## v{re.escape(ver)}\b[^\n]*\n(.*?)(?=^## |\Z)", text, re.M | re.S)
    if not m or not m.group(1).strip():
        sys.exit(f"CHANGELOG.md has no notes under \"## v{ver}\"")
    return m.group(1).strip() + "\n"


def editor_page() -> bytes:
    page = (dist_server.DIST / "editor" / "index.html").read_text(encoding="utf-8")
    link = 'href="../docs/"'
    if page.count(link) != 1:
        sys.exit(f"dist/editor/index.html: expected one {link}")
    return page.replace(link, f'href="{DOCS}" target="_blank" rel="noopener"').encode("utf-8")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--tag", help="the release's tag (v<version>); must match package.json")
    ap.add_argument("--no-build", action="store_true", help="use dist/ as it is")
    args = ap.parse_args()

    ver = version()
    if args.tag and args.tag != f"v{ver}":
        sys.exit(f"the tag {args.tag} is not v{ver} (package.json)")
    text = notes(ver)
    if not args.no_build:
        dist_server.build()

    OUT.mkdir(exist_ok=True)
    top = f"ODM-Poser-v{ver}"
    zpath = OUT / f"{top}-html.zip"
    editor = dist_server.DIST / "editor"
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        z.write(PARTS / "index.html", f"{top}/index.html")
        z.write(PARTS / "mods.js", f"{top}/mods.js")
        z.write(PARTS / "mods" / "README.txt", f"{top}/mods/README.txt")
        z.write(ROOT / "LICENSE", f"{top}/LICENSE")
        for f in sorted(editor.rglob("*")):
            rel = f.relative_to(editor).as_posix()
            if f.is_dir() or rel in SKIP:
                continue
            if rel == "index.html":
                z.writestr(f"{top}/editor/index.html", editor_page())
            else:
                z.write(f, f"{top}/editor/{rel}")
    (OUT / "notes.md").write_text(text, encoding="utf-8")
    print(f"{zpath.relative_to(ROOT)}  ({zpath.stat().st_size // 1024} KB)")
    print(f"{(OUT / 'notes.md').relative_to(ROOT)}")


if __name__ == "__main__":
    main()
