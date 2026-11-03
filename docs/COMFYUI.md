# Using it in ComfyUI

With [ODM-Poser-ComfyUIBridge](https://github.com/qwaxgo/ODM-Poser-ComfyUIBridge), ODM Poser is a ComfyUI
node: open the editor inside ComfyUI and hand the pictures of your pose straight to the next nodes.

日本語: [COMFYUI-JA.md](COMFYUI-JA.md)

## Installing

You need ComfyUI and git; no extra Python packages.

```
cd ComfyUI/custom_nodes
git clone https://github.com/qwaxgo/ODM-Poser-ComfyUIBridge
```

Then restart ComfyUI. ComfyUI-Manager's **Install via Git URL** with the same URL works too. The
editor comes with the bridge (a release of it, the HTML build); nothing else to fetch. The
bridge's own README has the steps in full and what to do when something goes wrong.

## Using it

1. Put an **ODM Poser** node on the canvas and press **Open ODM Poser**: the editor opens inside ComfyUI.
2. Make the pose. The export's width and height are the size of the node's pictures ([EXPORT.md](EXPORT.md)).
3. Press **Confirm** (確定して閉じる) at the top of the panel (**Cancel** closes without handing anything on).
4. Connect the node's outputs to other nodes.

Open it again and you go on from the pose last confirmed (it is saved in the workflow).

| Output | What it holds | Connect it to, e.g. |
|--------|---------------|---------------------|
| `openpose` | The OpenPose picture (the body's 18 points, 21 for each hand, on black) | ControlNet (OpenPose) |
| `atari` | The rough picture (lines and circles on white, props as simple shapes) | Sketches, img2img |
| `pose_json` | The figures (joint positions, body turn, hand shapes, camera, ...; more than one figure too) | Your own nodes |
| `scene_json` | Props, floor / walls / ceiling, the wire, objects | Your own nodes |
| `width`, `height` | The export size set in the editor | An empty latent's size |

## Presets and mods

- Pose sets (`*.json`) in the bridge's `user_presets/` are listed under the editor's **User presets** by
  themselves; the file is as in [POSES.md](POSES.md).
- Mods in the bridge's `mods/` load in the editor ([MODDING.md](MODDING.md)).

## Updating

```
cd ComfyUI/custom_nodes/ODM-Poser-ComfyUIBridge
git pull
```

Then restart ComfyUI. Until the bridge catches up with a new version of the editor, the editor inside
it may be a little older.
