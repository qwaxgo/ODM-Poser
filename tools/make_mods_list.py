"""Write web/mods.js, the list of mods/*.js and mods/<folder>/*.js (a repository of mods cloned
into mods/), so the editor opened from disk (or from tools/serve.py) loads the mods too.

    python tools/make_mods_list.py

Run it again after adding or removing a mod. A file or folder whose name starts with "_" or "."
is left out.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MODS = ROOT / "mods"
OUT = ROOT / "web" / "mods.js"
MOD_PART = re.compile(r"^[\w.-]+$")              # the same rule as routes.py


def main():
    names = []
    for f in MODS.rglob("*.js") if MODS.is_dir() else []:
        parts = f.relative_to(MODS).parts
        if len(parts) <= 2 and all(MOD_PART.match(p) and not p.startswith(("_", ".")) for p in parts):
            names.append("/".join(parts))
    names.sort()
    OUT.write_text("// written by tools/make_mods_list.py: the mods the editor loads when opened from disk\n"
                   "// or from tools/serve.py (mods/ is two folders up from web/editor/)\n"
                   "window.ODM_POSER_MODS = " + json.dumps(names) + ";\n"
                   'window.ODM_POSER_MODS_BASE = "../../mods/";\n', encoding="utf-8")
    print(f"{OUT.relative_to(ROOT)}: {len(names)} mod(s)" + (": " + ", ".join(names) if names else ""))


if __name__ == "__main__":
    main()
