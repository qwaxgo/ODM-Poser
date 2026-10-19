# ComfyUI-SymbolicPoseEditor

A stick-and-circle pose editor for ComfyUI (pseudo 3D). Pose a simple figure — circles for the
joints, lines for the bones, two blocks for the torso — then hand it to your workflow as an
OpenPose picture, a line-and-circle rough ("atari"), and JSON.

[日本語は下にあります](#日本語)

## Install

Clone into `ComfyUI/custom_nodes/` and restart ComfyUI. No extra Python packages are needed
beyond what ComfyUI already has (numpy, torch, Pillow, aiohttp).

```
cd ComfyUI/custom_nodes
git clone https://github.com/qwaxgo/ComfyUI-SymbolicPoseEditor
```

## The node: Symbolic Pose Editor

Add **Symbolic Pose Editor** (category `SymbolicPose`), press **Open Symbolic Pose Editor**, pose
the figure, press **確定して閉じる / Confirm**. The node keeps what you confirmed in the workflow
and opens on it next time.

| Output | Type | What it is |
|---|---|---|
| `pose_json` | STRING | The figure: 19 joints (cm), body turn, twists, hand shapes, pins, camera |
| `scene_json` | STRING | Props, floor / wall / ceiling settings and the wire (see below) |
| `openpose` | IMAGE | COCO-18 body + 2 x 21 hand points, standard colours, black background |
| `atari` | IMAGE | The rough: lines and circles on white, props drawn as simple shapes |
| `width`, `height` | INT | The export size set in the editor |

The editor also works without ComfyUI: open `web/editor/index.html` in a browser (files are
saved with the export buttons instead).

## Editing

- **Pose mode**: drag a joint (bone lengths are kept; dragging toward you tilts the bone toward
  you). A hand or foot drags its whole arm or leg (two-bone IK); Shift drags that bone only.
  Double-click flips a bone toward / away from the camera. The side view moves depth directly.
- **Every joint turns on three axes** in the "selected joint" panel (forward / sideways / twist;
  the head: nod, tilt, turn left and right — the face cross follows).
- **Pins**: tick "fix this joint" or Alt+click. A pinned hand or foot stays where it is while
  the rest moves; dragging the elbow / knee of a pinned limb swings it around.
- **Hand shapes** are picked in the arm's joint panel (open, fist, peace, point, grip, pinch,
  cup, trigger, ...).
- **Body mode**: bone lengths, joint sizes, head size, whole-body scale, height in cm, female /
  male builds, left-right symmetry.
- **Perspective mode**: camera direction, height, roll, and lens (wide angle = strong
  perspective).
- **Human joint limits** (on by default) keep knees, elbows, neck and so on in a human range.

## Props and scene

About 130 things as simple shapes (cylinders, boxes, spheres, discs, cones, rings): one- and
two-handed weapons, polearms, guns, bow and shield, staff and grimoire, instruments and mic,
stationery and books, tableware, food and drinks, fruit and vegetables, flowers, daily items,
laptop and controllers, lab glassware, sports gear and a ball of any size, chairs and desks,
skateboard / unicycle / bicycle / motorbike, and things to grab (vines, branches, trees, poles,
bars, ladders).

- Held things follow the wrist; two-handed things bring the other hand to the grip.
- Chairs and rides seat the figure and put hands and feet on handles and pedals.
- Floor, wall and ceiling; grounding (free / no sinking into the floor / always on the floor);
  put the selected hand or foot on a surface; grab the nearest thing; hang from it.
- Wire action: hang the figure from a point above by the chest, hips, a hand or an ankle.

`scene_json` is `{"items": [...], "env": {...}, "wire": {...}}`; each item is
`{"key", "hand" | "base" + "yaw", "off": [x, y, z], "rot": [x, y, z], "scale"}` (cm, degrees).
The shapes are listed in `web/editor/pose_props.js`.

## Language

The editor follows the browser's language (Japanese or English); the button at the top right
switches it and the choice is remembered. `?lang=en` or `?lang=ja` in the address forces one.

## Built-in poses

Eleven simple poses written as joint turns (standing, A-pose, T-pose, contrapposto, walking,
running, sitting on a chair, squatting, jump, fighting stance, hands on hips). Loading one keeps
the figure's body.

## User presets

Put your own preset files in `user_presets/` (format in `user_presets/README.md`). They show
up in the editor under "ユーザープリセット / User presets" with a group filter and a
Japanese / English search. That folder is not committed.

## License

MIT, (c) 2026 qwaxgo. All shapes and code are original to this project.

---

## 日本語

線と丸の全身アタリを疑似3Dで動かす、ComfyUI 用のポーズエディタです。OpenPose 画像・アタリ画像・
JSON としてワークフローに渡せます。

- **入れ方**：`ComfyUI/custom_nodes/` に clone して ComfyUI を再起動。追加の Python パッケージは不要です。
- **ノード**：**Symbolic Pose Editor**（分類 `SymbolicPose`）を置き、「Open Symbolic Pose Editor」でエディタを
  開き、ポーズを作って「確定して閉じる」。出力は `pose_json`・`scene_json`・`openpose`・`atari`・`width`・`height`。
  確定した内容はワークフローに保存され、次に開くとその続きから編集できます。
- **単体でも動きます**：`web/editor/index.html` をブラウザで開く（書き出しボタンでファイルに保存）。
- **操作**：丸をドラッグ（骨の長さは保たれる）。手首・足首は腕・脚ごと（Shift でその骨だけ）。ダブルクリックで
  手前と奥を入れ替え。横図で奥行き。すべての関節を3軸（前後・左右・ねじり。頭はうなずく・かしげる・左右を向く）で
  回せます。関節の固定（ピン、Alt＋クリック）、腕の欄で手の形、体格モード、パースモード、人間の関節の限界。
- **小物・環境**：約130種の小物を簡単な形で（武器・銃・弓・盾・杖・楽器・文房具・食器・食べ物・花・日用品・
  コントローラー・スポーツ用具・椅子・机・乗り物・蔓や枝や鉄棒など）。床・壁・天井と接地、面に手足を着ける、
  つかまる、ぶら下がる、ワイヤーで吊る。
- **言語**：ブラウザの言語に合わせて日本語／英語。右上のボタンで切り替え（覚えます）。`?lang=en` でも指定できます。
- **組み込みポーズ**：11種（立ち・Aポーズ・Tポーズ・コントラポスト・歩く・走る・椅子に座る・しゃがむ・ジャンプ・ファイティングポーズ・腰に手）。関節の角度で作ったもので、体格はそのまま。
- **ユーザープリセット**：`user_presets/` に自分のプリセット（JSON）を置くと一覧に出ます（git には入りません）。
- **ライセンス**：MIT（c）2026 qwaxgo。
