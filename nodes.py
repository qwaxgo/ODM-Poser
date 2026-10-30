"""The ODM Poser node: what the editor confirmed, as JSON and pictures."""

from __future__ import annotations

import base64
import io
import json

import numpy as np
import torch
from PIL import Image


def _picture(data_url: str) -> torch.Tensor:
    """A data-URL PNG as a ComfyUI IMAGE (1, H, W, 3); a 64 x 64 white picture when empty."""
    if not data_url:
        return torch.ones(1, 64, 64, 3, dtype=torch.float32)
    raw = base64.b64decode(data_url.split(",", 1)[-1])
    img = Image.open(io.BytesIO(raw)).convert("RGB")
    return torch.from_numpy(np.asarray(img, dtype=np.float32) / 255.0)[None]


class ODMPoser:
    """Open the editor with the node's button, pose the figure, press "Confirm"."""

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {},
            "hidden": {
                "node_id": "UNIQUE_ID",
                "pose_json": ("STRING", {"default": ""}),
                "scene_json": ("STRING", {"default": ""}),
                "openpose_image": ("STRING", {"default": ""}),
                "atari_image": ("STRING", {"default": ""}),
            },
        }

    RETURN_TYPES = ("STRING", "STRING", "IMAGE", "IMAGE", "INT", "INT")
    RETURN_NAMES = ("pose_json", "scene_json", "openpose", "atari", "width", "height")
    FUNCTION = "run"
    CATEGORY = "ODM Poser"
    OUTPUT_NODE = False

    @classmethod
    def IS_CHANGED(cls, pose_json="", scene_json="", openpose_image="", atari_image="", **_):
        return f"{len(pose_json)}:{hash(pose_json)}:{hash(scene_json)}:{len(openpose_image)}:{len(atari_image)}"

    def run(self, node_id="", pose_json="", scene_json="", openpose_image="", atari_image="", **_):
        if not pose_json:
            raise RuntimeError(
                "ODM Poser: no pose yet. Press 'Open ODM Poser' on the "
                "node, pose the figure and press 'Confirm'.\n"
                "ポーズがまだありません。ノードの『Open ODM Poser』でエディタを開き、"
                "『確定して閉じる』を押してください。")
        json.loads(pose_json)                     # a broken widget value fails here, not later
        openpose, atari = _picture(openpose_image), _picture(atari_image)
        h, w = int(openpose.shape[1]), int(openpose.shape[2])
        return (pose_json, scene_json or "{}", openpose, atari, w, h)


# "SymbolicPoseEditor" is the node's old name: workflows saved with it still load and run
NODE_CLASS_MAPPINGS = {"ODMPoser": ODMPoser, "SymbolicPoseEditor": ODMPoser}
NODE_DISPLAY_NAME_MAPPINGS = {"ODMPoser": "ODM Poser", "SymbolicPoseEditor": "ODM Poser (old name)"}
