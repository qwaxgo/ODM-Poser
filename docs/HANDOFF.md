# Handoff: SymbolicPoseEditor (for the next Claude session)

Read this first when you pick the project up in a new thread. It says what exists, how it fits
together, the owner's rules, and what is still open.

## What it is

A pseudo-3D stick-and-circle pose editor ("atari" = a rough of lines and circles): a web page.
The owner (qwaxgo, an illustrator) will publish it under MIT. It started
as a tool inside a private project and was split out on 2026-10-19 with no git history and
nothing third-party: keep it that way.

## Owner's rules (do not break)

- **Nothing with someone else's rights goes in**: no pictures, poses read from bought pose
  packs, names of those packs or their files, fonts, icons or code copied from elsewhere. Props
  and shapes are hand-made primitives. If you borrow an *idea* from another project, write the
  code yourself and do not copy text.
- **No built-in poses for now** (the owner removed the original 11 too). Only "reset to
  standing". Poses come from the user's own preset files. The public
  repo must not reveal what the owner keeps there: describe the feature generically.
- **Standalone**: it must work as a plain HTML page opened from disk.
- The owner commits and pushes. Do not commit unless asked; finish a batch with ready-to-paste
  commit / push commands. Reports to the owner are in Japanese.
- Heavy GPU runs are not needed for this project.

## Layout

```
web/editor/index.html            the editor (single file, plain JS, Canvas 2D)
web/editor/pose_props.js         window.PROP_CATS / window.PROPS: the props as primitives
web/editor/pose_scene.js         floor / walls / ceiling, holding, mounting, grabbing, wire
docs/HANDOFF.md                  this file
```

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

## Checking changes

- JS syntax: `python -c "import esprima, re; [esprima.parseScript(m) for m in re.findall(r'<script>(.*?)</script>', open('web/editor/index.html', encoding='utf-8').read(), re.S)]"`
  (esprima knows no `?.` or `??`: keep those out of the editor files).

## Open items

- The UI is Japanese only; an English UI (language toggle) is wanted before publishing.
- Prop shapes and grip positions are estimates; the owner will report the ones that look off.
- The owner's private project keeps its own copy of the editor (it embeds it elsewhere).
  Changes made there are copied here with a sync script that lives in that project; keep the
  two compatible (same state format, same message names) or note the difference here.
