# user_presets

Put your own pose preset files here (`*.json`). They are listed in the editor under
"ユーザープリセット / User presets" and are never committed (see `.gitignore`).

A file is either a list of presets or `{"presets": [...]}`. A preset:

```json
{"group": "Standing", "name": "contrapposto 01", "P": [[0, 95, 0], [0, 111, 0], ...]}
```

`P` holds the 19 joints in centimetres (y up, the figure faces +z), in this order:
pelvis, waist, chest, neck, head, r_shoulder, r_elbow, r_wrist, l_shoulder, l_elbow, l_wrist,
r_hip, r_knee, r_ankle, r_toe, l_hip, l_knee, l_ankle, l_toe. Only the bones' directions are
taken from a preset; the figure keeps its own body. `group` defaults to the file name.

ここに自分のポーズプリセット（`*.json`）を置くと、エディタの「ユーザープリセット」に並びます。
このフォルダの中身は git に入りません。
