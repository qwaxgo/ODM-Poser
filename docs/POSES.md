# Adding poses (presets)

Besides dragging the joints, a pose can start from a preset.

日本語: [POSES-JA.md](POSES-JA.md)

## Built-in presets

**Pose presets** under **Presets** in the menu lists basic poses made by hand: standing, A pose, T pose,
holding a rope (Tarzan) and more. Pick one and press **Use this pose**. The body (bone lengths,
thickness) and where the figure stands stay as they are.

## Saved poses and body presets

Poses and bodies are saved and loaded apart: loading one never changes the other. Both are kept in this
browser.

- **Pose, things and place: saved** keeps the figure's pose (its bones' directions, its turn, its hands),
  what it holds and wears, and where it stands, under a name. Loaded on a figure with another body, that
  figure keeps its own body.
- **Body presets** keep the bone lengths, thickness, the shoulders' and thigh roots' places and the sex,
  besides the built-in Standard, Female and Male. Loaded, the pose, things and place stay, and so do the
  feet (the lowest point).

## User presets (your own pose sets)

Load pose files of your own and they are listed under **User presets**. Even thousands are easy to find
by group and search.

1. Press **Load from files** under **Presets** and choose the pose set's `.json` (as many as you like).
2. Pick a group, or type a name in the search box (kana, width and letter case do not matter).
3. Pick one in the list and press **Use this pose** (or double-click it). **Random** picks one.

A user preset gives **only the bones' directions**: the body stays the figure's own, so a pose set
made for any body fits.

### The file

A list of poses in JSON (`{"presets": [...]}` does too):

```json
[
  {"group": "Standing", "name": "Arms folded", "P": [[0, 95, 0], [0, 111, 0], ...]},
  {"group": "Sitting", "name": "Hugging the knees", "P": [...]}
]
```

| Field | Meaning |
|-------|---------|
| `group` | The group (the file name without it) |
| `name` | The name (searched) |
| `P` | The joints' positions [x, y, z] (cm, y up, the figure faces +z): 21 joints, or the first 19 without the hands |

The joints in order: pelvis, waist, chest, neck, head, right shoulder, right elbow, right wrist, left
shoulder, left elbow, left wrist, right hip, right knee, right ankle, right toe, left hip, left knee,
left ankle, left toe, right hand, left hand. An exported pose file (.json) has its `P` in the same form,
so poses you made can be gathered into a set.

## From a mod

A mod can add built-in poses (`api.poses.add`: how far each joint turns from standing) and user presets
(`api.presets.add`). A pose set you always use loads by itself as a mod. See [MODDING.md](MODDING.md).
In ComfyUI, pose sets in a set folder are listed by themselves ([COMFYUI.md](COMFYUI.md)).

Using someone else's pose set, follow its terms.
