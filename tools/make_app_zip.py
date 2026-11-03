"""The Windows app's zip: the exe, a mods/ folder with its README, the notes and the licence.

    python tools/make_app_zip.py <path to ODM-Poser.exe>

Writes release/ODM-Poser-v<version>-windows-x64.zip (tools/build_app.sh runs it after the cross build).
"""

from __future__ import annotations

import sys
import zipfile
from pathlib import Path

import make_release_html as rel

PARTS = Path(__file__).resolve().parent / "app_release"


def main() -> None:
    if len(sys.argv) != 2 or not Path(sys.argv[1]).is_file():
        sys.exit("usage: make_app_zip.py <path to ODM-Poser.exe>")
    ver = rel.version()
    top = f"ODM-Poser-v{ver}"
    rel.OUT.mkdir(exist_ok=True)
    zpath = rel.OUT / f"{top}-windows-x64.zip"
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        z.write(sys.argv[1], f"{top}/ODM-Poser.exe")
        z.write(PARTS / "README-windows.txt", f"{top}/README.txt")
        z.write(PARTS / "mods" / "README.txt", f"{top}/mods/README.txt")
        z.write(rel.ROOT / "LICENSE", f"{top}/LICENSE")
    print(f"{zpath.relative_to(rel.ROOT)}  ({zpath.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
