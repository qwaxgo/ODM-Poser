"""ODM-Poser: a stick-and-circle pose editor (pseudo 3D) as a ComfyUI node.

The node has a button that opens the editor in a modal; "Confirm" hands the pose back to the
node, which outputs it as JSON (the pose, and the scene: props, floor / walls, wire) and as two
pictures (OpenPose, and the line-and-circle rough). The editor also works on its own: open
web/editor/index.html in a browser.
"""

from .nodes import NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS
from . import routes  # noqa: F401  (registers the editor's web routes)

WEB_DIRECTORY = "./web/js"
__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
