"""Web routes: the editor's files, and the user's preset files merged into one script.

    /symbolic_pose/editor/            the editor (web/editor/index.html and its scripts)
    /symbolic_pose/user_presets.js    window.USER_POSE_PRESETS from user_presets/*.json
"""

from __future__ import annotations

import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
EDITOR = HERE / "web" / "editor"
USER_PRESETS = HERE / "user_presets"


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

    @routes.get("/symbolic_pose/editor/{name}")
    async def _editor_file(request):
        name = request.match_info["name"]
        if name not in ("index.html", "pose_props.js", "pose_scene.js", "pose_solids.js", "pose_ruler.js", "i18n.js"):
            raise web.HTTPNotFound()
        kind = "text/html" if name.endswith(".html") else "application/javascript"
        return web.Response(text=(EDITOR / name).read_text(encoding="utf-8"), content_type=kind)
except Exception as exc:            # outside ComfyUI (tests, a plain import)
    print(f"[SymbolicPose] web routes not registered: {exc}")
