"""The app's icons (src-tauri/icons/) from the editor's icon (web/editor/icon-512.png). Run again
after changing that icon (tools/make_icons.py draws it).

    python tools/make_app_icons.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "web" / "editor" / "icon-512.png"
OUT = ROOT / "src-tauri" / "icons"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    im = Image.open(SRC).convert("RGBA")
    for name, size in (("32x32.png", 32), ("128x128.png", 128), ("128x128@2x.png", 256), ("icon.png", 512)):
        im.resize((size, size), Image.LANCZOS).save(OUT / name)
    im.save(OUT / "icon.ico", sizes=[(s, s) for s in (16, 24, 32, 48, 64, 128, 256)])
    print("wrote", ", ".join(sorted(p.name for p in OUT.iterdir())))


if __name__ == "__main__":
    main()
