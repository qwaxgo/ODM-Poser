"""Write web/mods.js, the list of mods/*.js, so the editor opened from disk (without ComfyUI)
loads the mods too. Inside ComfyUI the node serves the same list itself.

    python tools/make_mods_list.py

Run it again after adding or removing a mod. A file whose name starts with "_" is left out.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MODS = ROOT / "mods"
OUT = ROOT / "web" / "mods.js"
MOD_NAME = re.compile(r"^[\w.-]+\.js$")          # the same rule as routes.py


def main():
    names = sorted(f.name for f in MODS.glob("*.js")
                   if MOD_NAME.match(f.name) and not f.name.startswith("_")) if MODS.is_dir() else []
    OUT.write_text("// written by tools/make_mods_list.py: the mods the editor loads when opened from disk\n"
                   "window.SYMBOLIC_POSE_MODS = " + json.dumps(names) + ";\n", encoding="utf-8")
    print(f"{OUT.relative_to(ROOT)}: {len(names)} mod(s)" + (": " + ", ".join(names) if names else ""))


if __name__ == "__main__":
    main()
