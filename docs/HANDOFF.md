# Handoff: ComfyUI-SymbolicPoseEditor (for the next Claude session)

Read this first when you pick the project up in a new thread. It says what exists, how it fits
together, the owner's rules, and what is still open.

## What it is

A pseudo-3D stick-and-circle pose editor ("atari" = a rough of lines and circles), packaged as a
ComfyUI custom node. The owner (qwaxgo, an illustrator) will publish it under MIT. It started
as a tool inside a private project and was split out on 2026-10-19 with no git history and
nothing third-party: keep it that way.

## Owner's rules (do not break)

- **Nothing with someone else's rights goes in**: no pictures, poses read from bought pose
  packs, names of those packs or their files, fonts, icons or code copied from elsewhere. Props
  and shapes are hand-made primitives. If you borrow an *idea* from another project, write the
  code yourself and do not copy text.
- **Built-in poses**: only the 11 written by hand as joint turns (`PRESETS` in index.html:
  nothing traced from pictures). Other poses come from the user's own files in
  `user_presets/` (git-ignored). The public repo must not reveal what the owner keeps there:
  describe the feature generically.
- **Standalone**: it must work with ComfyUI alone (no other custom node pack) and as a plain
  HTML page opened from disk.
- The owner commits and pushes. Do not commit unless asked; finish a batch with ready-to-paste
  commit / push commands. Reports to the owner are in Japanese.
- Heavy GPU runs are not needed for this project.

## Layout

```
__init__.py          node mappings, WEB_DIRECTORY = web/js, imports routes
nodes.py             SymbolicPoseEditor node: hidden values -> outputs
routes.py            /symbolic_pose/editor/{index.html,pose_props.js,pose_scene.js}
                     /symbolic_pose/user_presets.js  (user_presets/*.json -> window.USER_POSE_PRESETS)
web/js/symbolic_pose_editor.js   node widget: button, modal iframe, postMessage hand-over
web/editor/index.html            the editor (single file, plain JS, Canvas 2D)
web/editor/pose_props.js         window.PROP_CATS / window.PROPS: the props as primitives
web/editor/pose_scene.js         floor / walls / ceiling, holding, mounting, grabbing, wire
web/editor/i18n.js               Japanese / English (exists only in this repo; see below)
user_presets/                    the user's preset files (README.md only is tracked)
docs/HANDOFF.md                  this file
```

## How the node and the editor talk

1. The widget opens `/symbolic_pose/editor/index.html?node_id=<id>` in an iframe modal.
2. The editor posts `{type: "symbolic-pose-ready", node_id}`; the widget answers
   `{type: "symbolic-pose-load", pose_json}` with what the node holds (so it reopens on it).
3. "確定して閉じる / Confirm" posts `{type: "symbolic-pose-confirmed", node_id, pose_json,
   scene_json, openpose, atari, width, height}` (pictures as PNG data URLs). The widget stores
   them in the node's hidden widgets `pose_json`, `scene_json`, `openpose_image`,
   `atari_image` (serialized with the workflow) and closes the modal. Cancel posts
   `symbolic-pose-cancelled`.
4. On queue, `nodes.SymbolicPoseEditor.run` decodes the pictures and returns `pose_json`,
   `scene_json`, `openpose`, `atari`, `width`, `height`. It raises a clear error when nothing
   was confirmed. All messages are checked against `location.origin`.

## The editor in brief (web/editor/index.html)

- State `S`: `P` 19 joints (cm, y up, the figure faces +z; order in `J`), `R` circle radii,
  `hands {r,l}`, `cam`, `body` (whole-body turn), `twist` per joint, `pins {joint: [x,y,z]}`,
  `items`, `env`, `wire`, `center` (view centre). Saved JSON has `version: 3`; `migrate()` reads
  older files (18 joints; `head.yaw`).
- Classic scripts share one global scope: `pose_scene.js` (loaded after the main script) uses
  `S`, `J`, `IX`, `solveIK`, `rotateSubtree`, `afterEdit`, ... and defines `drawScene()` and
  `sceneAfterEdit()`, which the main script calls through `typeof` checks. Do not use names that
  collide (an earlier `norm` clash stopped the whole editor).
- Edit pipeline: every edit ends in `afterEdit(moved)` = joint limits -> `sceneAfterEdit` ->
  `holdPins` (pinned wrists / ankles by two-bone IK) -> update the moved joint's pin.
- Search: `WORDS` (Japanese / English word groups) + `foldText` (kana, width and case folded),
  exact match first, then prefix.
- OpenPose export is COCO-18 + 2 x 21 hand points drawn in 2D from the hand shape table.
- Props: `place` = `hand` (fist frame: z along the forearm, y toward the thumb; `grip2` for the
  other hand), `body` (in front of the chest; `mount` for both hands), `world` (on the floor;
  `mount` seats the pelvis and puts hands / feet), `grab` (`grab` = the lines a hand or foot
  takes hold of).

## Language (web/editor/i18n.js)

The page is written in Japanese. `i18n.js` translates every text node, placeholder and title
(and what the editor adds later, through a MutationObserver) with a table (`T`), joint names
(`JOINT`) and rules for the messages built at run time (`RULES`, e.g. "<joint>を固定しました。"),
and patches `CanvasRenderingContext2D.fillText` for canvas labels. Prop names come from
`PROPS[key].en`; "ja / en" option texts show the English part. When you add Japanese UI text,
add its English to `T` (or a rule) -- the check below lists what is left untranslated.

## Checking changes

- JS syntax: `python -c "import esprima, re; [esprima.parseScript(m) for m in re.findall(r'<script>(.*?)</script>', open('web/editor/index.html', encoding='utf-8').read(), re.S)]"`
  (esprima knows no `?.` or `??`: keep those out of the editor files; the widget file uses `?.`
  and is checked in the browser).
- Headless Edge works with `--headless=new` (`--screenshot` or `--dump-dom`,
  `--virtual-time-budget`, a fresh `--user-data-dir` per run). To test the node hand-over,
  serve a small same-origin host page that iframes the editor with `?node_id=` and listens
  for the messages (put it temporarily under `web/js/`, it is served at
  `/extensions/ComfyUI-SymbolicPoseEditor/`; delete it afterwards).
- Node: queue a prompt with `SymbolicPoseEditor` inputs `pose_json`, `scene_json`,
  `openpose_image`, `atari_image` (data URLs) and preview the outputs.

## Open items

- English UI done (2026-10-19). To find untranslated text: open the editor headless with
  `?lang=en`, step through the modes, joints and props, and list text nodes that still hold
  Japanese (only the "日本語" switch and the search example should remain).
- Real mouse use in ComfyUI (the modal, wheel, drag) has been checked by automation only.
- Prop shapes and grip positions are estimates; the owner will report the ones that look off.
- The owner's private project keeps its own copy of the editor (it embeds it elsewhere).
  Changes made there are copied here with a sync script that lives in that project (it
  rewrites index.html, pose_props.js and pose_scene.js; i18n.js, the node and the docs are this
  repo's own). Keep the two compatible (same state format, same message names) or note the
  difference here.
