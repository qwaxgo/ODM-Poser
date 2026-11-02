"""The web folder of the app (src-tauri/tauri.conf.json: frontendDist = app/web): the editor as the
HTML release has it (its guide link goes to the site's docs), without the mods.js script: the app
puts the list of mods in the page itself (src-tauri/src/main.rs).

    python tools/make_app_web.py [--no-build]
"""

from __future__ import annotations

import argparse
import shutil

import dist_server
import make_release_html as rel

OUT = rel.ROOT / "app" / "web"


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--no-build", action="store_true", help="use dist/ as it is")
    args = ap.parse_args()
    if not args.no_build:
        dist_server.build()
    shutil.rmtree(OUT, ignore_errors=True)
    editor = dist_server.DIST / "editor"
    for f in sorted(editor.rglob("*")):
        rel_path = f.relative_to(editor).as_posix()
        if f.is_dir() or rel_path in rel.SKIP:
            continue
        to = OUT / "editor" / rel_path
        to.parent.mkdir(parents=True, exist_ok=True)
        if rel_path == "index.html":
            to.write_bytes(rel.editor_page(app=True))
        else:
            shutil.copyfile(f, to)
    shutil.copyfile(rel.PARTS / "index.html", OUT / "index.html")
    print(f"{OUT.relative_to(rel.ROOT)}  ({sum(1 for _ in OUT.rglob('*') if _.is_file())} files)")


if __name__ == "__main__":
    main()
