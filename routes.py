"""Web routes: the editor's files, and the user's preset files merged into one script.

    /symbolic_pose/editor/            the editor (web/editor/index.html and its scripts)
    /symbolic_pose/user_presets.js    window.USER_POSE_PRESETS from user_presets/*.json
    /symbolic_pose/mods.js            window.SYMBOLIC_POSE_MODS: the built-in mods (builtin_mods/*.js,
                                      as "_builtin/<name>"), then mods/*.js and mods/<folder>/*.js
    /symbolic_pose/mods/{path}        one mod file (docs/MODDING.md)
"""

from __future__ import annotations

import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
EDITOR = HERE / "web" / "editor"
USER_PRESETS = HERE / "user_presets"
MODS = HERE / "mods"
BUILTIN_MODS = HERE / "builtin_mods"         # shipped with the node: the ComfyUI hand-off
MOD_PART = re.compile(r"^[\w.-]+$")


def user_presets():
    """Every preset of user_presets/*.json: each file is a list of {group, name, P} or
    {"presets": [...]}; a file's name becomes the group when a preset has none."""
    out = []
    for f in sorted(USER_PRESETS.glob("*.json")):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
        except (OSError, ValueError) as exc:
            print(f"[SymbolicPose] skipped {f.name}: {exc}")
            continue
        items = data.get("presets", []) if isinstance(data, dict) else data
        for p in items if isinstance(items, list) else []:
            if isinstance(p, dict) and isinstance(p.get("P"), list):
                out.append({"group": str(p.get("group") or f.stem), "name": str(p.get("name") or ""),
                            "P": p["P"]})
    return out


def mod_files():
    """The mods to load, in path order: mods/*.js, and mods/<folder>/*.js for a repository of mods
    cloned into mods/. A file or folder whose name starts with "_" or "." is left out."""
    if not MODS.is_dir():
        return []
    out = []
    for f in MODS.rglob("*.js"):
        parts = f.relative_to(MODS).parts
        if len(parts) <= 2 and all(MOD_PART.match(p) and not p.startswith(("_", ".")) for p in parts):
            out.append("/".join(parts))
    return sorted(out)


def served_mods():
    """What the editor inside ComfyUI loads: the built-in mods first, then the user's."""
    builtin = sorted(f.name for f in BUILTIN_MODS.glob("*.js") if MOD_PART.match(f.name)) if BUILTIN_MODS.is_dir() else []
    return ["_builtin/" + n for n in builtin] + mod_files()


try:
    from aiohttp import web
    from server import PromptServer

    routes = PromptServer.instance.routes

    @routes.get("/symbolic_pose/user_presets.js")
    async def _user_presets(request):
        body = "window.USER_POSE_PRESETS = " + json.dumps(user_presets(), ensure_ascii=False,
                                                          separators=(",", ":")) + ";\n"
        return web.Response(text=body, content_type="application/javascript")

    @routes.get("/symbolic_pose/editor")
    async def _editor_root(request):
        raise web.HTTPFound("/symbolic_pose/editor/index.html" + (f"?{request.query_string}"
                                                                  if request.query_string else ""))

    EDITOR_FILES = ("index.html", "pose_props.js", "pose_props_more.js", "pose_scene.js", "pose_solids.js",
                    "pose_style.js", "pose_ruler.js", "i18n.js", "pose_api.js")

    @routes.get("/symbolic_pose/mods.js")
    async def _mods_list(request):
        body = "window.SYMBOLIC_POSE_MODS = " + json.dumps(served_mods()) + ";\n"
        return web.Response(text=body, content_type="application/javascript")

    @routes.get("/symbolic_pose/mods/{path:.+}")
    async def _mod_file(request):
        path = request.match_info["path"]
        if path not in served_mods():             # only the listed files, nothing else
            raise web.HTTPNotFound()
        file = BUILTIN_MODS / path[len("_builtin/"):] if path.startswith("_builtin/") else MODS / path
        return web.Response(text=file.read_text(encoding="utf-8"), content_type="application/javascript")

    @routes.get("/symbolic_pose/editor/{name}")
    async def _editor_file(request):
        name = request.match_info["name"]
        if name not in EDITOR_FILES:
            raise web.HTTPNotFound()
        kind = "text/html" if name.endswith(".html") else "application/javascript"
        return web.Response(text=(EDITOR / name).read_text(encoding="utf-8"), content_type=kind)
except Exception as exc:            # outside ComfyUI (tests, a plain import)
    print(f"[SymbolicPose] web routes not registered: {exc}")
