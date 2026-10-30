# Using it in ComfyUI (install guide)

How to use the Symbolic Pose Editor as a ComfyUI node. 日本語: [COMFYUI-JA.md](COMFYUI-JA.md)

## What you install (two parts)

| part | what it does | where it goes |
|------|--------------|---------------|
| **ComfyUI-SymbolicPoseEditor** (this repository) | the node "Symbolic Pose Editor" and the pose editor itself | `ComfyUI/custom_nodes/` |
| **SymbolicPoseEditor-ComfyUIBridge** (private repository) | the piece (a mod) that connects the editor to the node: it adds the Confirm button and sends the pose to the node | `mods/` inside the folder above |

The editor itself does not depend on ComfyUI; everything about talking to the node is in the
second part. Without it the editor opens from the node, but has no Confirm button and cannot hand
the pose back.

You need ComfyUI, git, and access to the private repository on GitHub (an SSH key registered).
No extra Python packages (only what ComfyUI has: numpy, torch, Pillow, aiohttp).

## Install

1. The node and the editor:
   ```
   cd ComfyUI/custom_nodes
   git clone https://github.com/qwaxgo/ComfyUI-SymbolicPoseEditor
   ```
2. The bridge, into that folder's `mods/`:
   ```
   cd ComfyUI-SymbolicPoseEditor/mods
   git clone git@github.com:qwaxgo/SymbolicPoseEditor-ComfyUIBridge.git
   ```
   ```
   ComfyUI/custom_nodes/ComfyUI-SymbolicPoseEditor/mods/SymbolicPoseEditor-ComfyUIBridge/comfyui.js
   ```
3. Restart ComfyUI once.

## Check

1. ComfyUI's console at start does **not** say
   `[SymbolicPose] the ComfyUI bridge mod (comfyui.js) is not in mods/ ...` (if it does, step 2 is missing).
2. Add the node: right-click the canvas → Add Node → SymbolicPose → Symbolic Pose Editor.
3. Press **Open Symbolic Pose Editor**: the side bar starts with a "ComfyUI" section (Confirm /
   Cancel), and the MOD panel at the bottom says "✓ ComfyUI bridge".

## Use

Open the editor from the node, pose the figure (the export width and height are the size of the
pictures the node outputs), press **確定して閉じる / Confirm**. The node keeps it in the workflow and
reopens on it next time.

| output | type | what it is |
|--------|------|------------|
| `pose_json` | STRING | the figure: 19 joints (cm), body turn, twists, hand shapes, pins, camera |
| `scene_json` | STRING | props, floor / walls / ceiling, wire, solids |
| `openpose` | IMAGE | COCO-18 body + 2 × 21 hand points, standard colours, black background (ControlNet OpenPose) |
| `atari` | IMAGE | the rough: lines and circles on white, props as simple shapes |
| `width`, `height` | INT | the export size set in the editor |

`scene_json` is `{"items": [...], "env": {...}, "wire": {...}, "solids": [...]}`; an item is
`{"key", "hand" | "base" + "yaw", "off": [x, y, z], "rot": [x, y, z], "scale"}` (cm, degrees); the
shapes are in `web/editor/pose_props.js`.

**User presets**: files in `user_presets/` (format: `user_presets/README.md`) show up in the editor
opened from the node; reopen the editor after adding some. **Other mods** in `mods/` load there too
([MODDING.md](MODDING.md)).

## Update

`git pull` in both folders, then restart ComfyUI.

## Troubleshooting

| symptom | cause and fix |
|---------|---------------|
| no Confirm button in the editor | the bridge is missing: check `mods/SymbolicPoseEditor-ComfyUIBridge/comfyui.js`; names starting with `_` or `.` are skipped; `?nomods` in the address turns all mods off |
| `Permission denied (publickey)` / `Repository not found` when cloning the bridge | no access to the private repository, or no SSH key on GitHub |
| the node is not in the list | restart ComfyUI; look for an import error in the console |
| "no pose yet" when the workflow runs | the editor was never confirmed: open it and press Confirm |
| ✗ in the MOD panel | that mod has an error; the line says which |

## Without ComfyUI

Open `web/editor/index.html` in a browser: the editor alone (the bridge does nothing there). Save
pictures and poses with the export buttons.
