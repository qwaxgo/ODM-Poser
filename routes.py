"""Web routes: the editor's files, and the user's preset files merged into one script.

    /odm_poser/editor/            the editor (web/editor/index.html and its scripts)
    /odm_poser/user_presets.js    window.USER_POSE_PRESETS from user_presets/*.json
    /odm_poser/mods.js            window.ODM_POSER_MODS: mods/*.js and mods/<folder>/*.js
    /odm_poser/mods/{path}        one mod file (docs/MODDING.md)
"""

from __future__ import annotations

import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
EDITOR = HERE / "web" / "editor"
USER_PRESETS = HERE / "user_presets"
MODS = HERE / "mods"
MOD_PART = re.compile(r"^[\w.-]+$")


def user_presets():
    """Every preset of user_presets/*.json: each file is a list of {group, name, P} or
    {"presets": [...]}; a file's name becomes the group when a preset has none."""
    out = []
    for f in sorted(USER_PRESETS.glob("*.json")):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
        except (OSError, ValueError) as exc:
            print(f"[ODM Poser] skipped {f.name}: {exc}")
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


# the node's Confirm / Cancel live in the ComfyUI bridge mod (mods/<its repository>/comfyui.js)
if not any(m.rsplit("/", 1)[-1] == "comfyui.js" for m in mod_files()):
    print("[ODM Poser] the ComfyUI bridge mod (comfyui.js) is not in mods/: the editor opens, but "
          "cannot hand the pose back to the node. Clone ODM-Poser-ComfyUIBridge into mods/.")


try:
    from aiohttp import web
    from server import PromptServer

    routes = PromptServer.instance.routes

    @routes.get("/odm_poser/user_presets.js")
    async def _user_presets(request):
        body = "window.USER_POSE_PRESETS = " + json.dumps(user_presets(), ensure_ascii=False,
                                                          separators=(",", ":")) + ";\n"
        return web.Response(text=body, content_type="application/javascript")

    @routes.get("/odm_poser/editor")
    async def _editor_root(request):
        raise web.HTTPFound("/odm_poser/editor/index.html" + (f"?{request.query_string}"
                                                                  if request.query_string else ""))

    EDITOR_FILES = ("index.html", "pose_props.js", "pose_props_more.js", "pose_scene.js", "pose_solids.js",
                    "pose_style.js", "pose_ruler.js", "i18n.js", "pose_api.js", "pose_cast.js",
                    "manifest.webmanifest", "sw.js", "icon.svg", "icon-192.png", "icon-512.png",
                    "icon-maskable-512.png", "apple-touch-icon.png", "favicon-32.png")
    KINDS = {".html": "text/html", ".js": "application/javascript", ".webmanifest": "application/manifest+json",
             ".svg": "image/svg+xml"}

    @routes.get("/odm_poser/mods.js")
    async def _mods_list(request):
        body = "window.ODM_POSER_MODS = " + json.dumps(mod_files()) + ";\n"
        return web.Response(text=body, content_type="application/javascript")

    @routes.get("/odm_poser/mods/{path:.+}")
    async def _mod_file(request):
        path = request.match_info["path"]
        if path not in mod_files():               # only the listed files, nothing else under mods/
            raise web.HTTPNotFound()
        return web.Response(text=(MODS / path).read_text(encoding="utf-8"), content_type="application/javascript")

    @routes.get("/odm_poser/editor/{name}")
    async def _editor_file(request):
        name = request.match_info["name"]
        if name not in EDITOR_FILES:
            raise web.HTTPNotFound()
        if name.endswith(".png"):
            return web.FileResponse(EDITOR / name)
        kind = KINDS[Path(name).suffix]
        return web.Response(text=(EDITOR / name).read_text(encoding="utf-8"), content_type=kind)
except Exception as exc:            # outside ComfyUI (tests, a plain import)
    print(f"[ODM Poser] web routes not registered: {exc}")
