# Modding the Symbolic Pose Editor

A mod is a JavaScript file that the editor loads at start. Through the **MOD API** (`window.SymbolicPose`,
`web/editor/pose_api.js`) it can add:

- props: things held, worn, ridden, put on the floor or grabbed, and new prop categories
- solid kinds (boxes, prisms, cylinders, pyramids, cones of a given size)
- aura kinds (its own drawing) and aura parts (which joints an aura surrounds)
- hand shapes, built-in poses and user presets
- English words for its Japanese labels (and the other way round)
- panels in the side bar, and hooks into drawing, editing, undo / load, the mode and the mouse

API version: **1.1.0**. 日本語の説明: [MODDING-JA.md](MODDING-JA.md).

> **Safety.** A mod is a program that runs inside the editor page with the same rights as the
> editor itself. Install only mods you trust. Add `?nomods` to the editor's address to start
> without any mod (for example when a mod breaks the editor).

## Quick start

1. Save the file under *A mod file* below as `mods/mymod.js` (or clone a repository of mods into
   `mods/`, see the end of this page).
2. Inside ComfyUI: open (or reload) the editor. Opened from disk (`web/editor/index.html`):
   run `python tools/make_mods_list.py` first, then reload.
3. The **MOD** panel at the bottom of the side bar lists every mod: ✓ loaded, ✗ with the error.

The **MOD** panel also has *Load mod files (this session only)*: it runs the chosen `.js` files
now, without copying them anywhere. That is the quickest way to try a mod while writing it.

`mods/*.js` and `mods/<folder>/*.js` load in path order. A file or folder whose name starts with
`_` or `.` is skipped (a way to switch a mod off). `mods/` is git-ignored, so your mods stay on
your machine.

**Built-in mods.** Inside ComfyUI the node first loads its own mods from `builtin_mods/`
(listed as `_builtin/<name>`): `comfyui.js` is the node's hand-off (the Confirm / Cancel section,
the pose the node had, the user presets of `user_presets/`). The editor opened from disk does not
load them, and `?nomods` keeps them (it skips only your mods). They are ordinary mods written with
this API, so they are also examples of `api.io` and `api.ui`.

## A mod file

```js
SymbolicPose.registerMod({
  id: "mymod",                 // lower case letters, digits, _ and -; unique
  name: "My mod",              // shown in the MOD panel
  version: "1.0.0",
  api: 1,                      // the API major version the mod is written for
  init(api){
    api.props.addCategory("mymod", "マイMOD", "My mod");
    api.props.add("mymod:club", {
      ja: "こん棒", en: "Club", cat: "mymod", place: "hand", pose: "grip",
      parts: [api.shapes.handle(-8, 30, 2), api.shapes.C(0, 30, 0, 0, 60, 0, 5)],
    });
  },
});
```

`init(api)` runs once, right after the file is loaded. If it throws, the mod is marked ✗ with the
message, and the editor goes on without it. Errors later, in a hook, mark the mod ✗ too; the hook
that failed is skipped for that call.

**Keys.** Give everything you add a key that starts with your mod's id, like `mymod:club`
(hand shapes: `mymod_fist`, since their keys are plain words). Adding a key that exists is an error
unless the definition says `replace: true`.

## Units and axes

The world is in **centimetres**, **y up**, the floor at y = 0. The figure faces **+z**; its right
side is at x < 0 (screen left when it faces the camera). It is about 168 cm tall in the rest pose.

The 19 joints (`api.joints.names`, index = position in this list):

```text
 0 pelvis   1 waist   2 chest   3 neck   4 head
 5 r_shoulder  6 r_elbow  7 r_wrist     8 l_shoulder  9 l_elbow 10 l_wrist
11 r_hip  12 r_knee  13 r_ankle  14 r_toe      15 l_hip  16 l_knee  17 l_ankle  18 l_toe
```

`api.joints.parent[i]` is the index of the joint's parent (−1 for the pelvis).

## Props

A prop is drawn from simple **shapes** in its own frame. The frame depends on `place`:

| place   | where it is                      | its axes (origin) |
|---------|----------------------------------|-------------------|
| `hand`  | held in a hand                   | origin = the middle of the fist; **+y** along the grip toward the thumb (a sword's blade); **+z** the way the forearm points (a gun's barrel); **+x** out of the palm |
| `body`  | held in front of the chest (instruments) | origin = the chest joint; +x the figure's left, +y up, +z front |
| `world` | stands on the floor (chairs, rides) | origin on the floor; +y up; +z where the figure faces when using it |
| `grab`  | something to hang on (vines, bars) | as `world`; `grab` lists the lines a hand or foot takes hold of |
| `wear`  | worn on the body                 | see `at` below |

Worn things (`place: "wear"`) say where with `at`:

| at      | origin and axes | units |
|---------|-----------------|-------|
| `head`  | the head's centre; +x the figure's left, +y up, +z where the face looks | **the head's radius** (1 = the radius, so it fits any head size) |
| `chest` | the chest joint; +x left, +y up, +z front | cm |
| `back`  | the same frame as `chest` (use z < 0) | cm |
| `waist` | the pelvis joint; +x left, +y up, +z front | cm |
| `feet`  | each foot (one copy per foot): the ankle; +z toward the toe along the sole, +y up, **+x outward** | cm |
| `hands` | each hand (one copy per hand), the `hand` frame | cm |

A thing worn in more than one place uses `sets` instead of `at` and `parts`:
`sets: [["feet", [...skis]], ["hands", [...poles]]]` (also `"r_foot"`, `"l_foot"`, `"r_hand"`, `"l_hand"`).

### Shapes

Each shape is an object with one key (helpers in `api.shapes`):

| shape | numbers | helper |
|-------|---------|--------|
| cylinder | `c: [x1,y1,z1, x2,y2,z2, r]` | `C(...)`, `handle(lo, hi, r)` (along y) |
| box (along the frame's axes) | `b: [cx,cy,cz, sx,sy,sz]` | `B(...)` |
| sphere | `s: [cx,cy,cz, r]` | `SP(...)` |
| disc | `d: [cx,cy,cz, nx,ny,nz, r]` (centre, normal, radius) | `D(...)` |
| cone | `k: [bx,by,bz, ax,ay,az, r]` (base centre, apex, base radius) | `K(...)` |
| ring | `t: [cx,cy,cz, nx,ny,nz, R, r]` (radius R, tube r) | `T(...)` |
| dome | `h: [cx,cy,cz, nx,ny,nz, r]` (half sphere toward n) | `H(...)` |
| line | `l: [[x,y,z], [x,y,z], ...]` (an outline, a bolt) | `L(points)`, `ellipse(cx,cy,cz, rx,ry)` |

`pair(s => [...])` returns the shapes for both sides: `s` is +1 (the figure's left) and −1.

### Prop fields

| field | meaning |
|-------|---------|
| `ja`, `en` | the names (required) |
| `cat` | the category key (required; add your own with `props.addCategory`) |
| `place` | `hand`, `body`, `world`, `grab` or `wear` (required) |
| `parts` | the shapes (or `make` / `sets`) |
| `pose` | the hand shape while held (`grip`, `trigger`, `pinch`, `cup`, `fist`, `open`, ... or one a mod added) |
| `grip2`, `pose2` | two-handed: where the other hand holds ([x, y, z] in the prop's frame) and its shape |
| `mount` | `world` / `body`: where joints go, `{pelvis: [x,y,z], r_wrist: [...], l_ankle: [...]}` (seats, handlebars, pedals) |
| `hands` | the hand shapes it sets, `{r: "grip", l: "claw"}` (body, wear) |
| `at`, `sets` | `wear`: where (see above) |
| `grab` | `grab`: the lines to take hold of, `[[[x,y,z], [x,y,z]], ...]` |
| `bayonet` | the muzzle [x, y, z]: offers "fix a bayonet" (the blade goes along +z) |
| `glow`, `color` | drawn glowing in this colour (effects) |
| `dims`, `make` | a size set in cm: `dims: [["幅", 20], ["高さ", 30]]`, `make: ([w, h]) => [shapes]` |
| `scalable` | the size slider is meant for it |
| `note`, `noteEn` | a hint shown under the list, and its English |

Holding, wearing or mounting a prop sets the hand shapes it asks for; letting go gives them back.
Every prop can be carried on the back (hand and body props) and put down on the floor or an object.

## The api object

`init(api)` gets this object. Everything not listed here is internal and may change.

### State

| call | does |
|------|------|
| `api.state()` | the editor's state `S` (ask each time: undo and loading replace it) |
| `api.data()` | **your mod's own data**, `S.mods[id]`: saved in the pose JSON, undone with Ctrl+Z |
| `api.edit(fn, message?)` | the way to change things: remembers for undo, runs `fn(S)`, then the simulation, the panels and a redraw |
| `api.redraw()` | draw again (no undo step) |
| `api.say(message, warn?)` | the status line |
| `api.mode()` | `"pose"`, `"body"`, `"persp"` or `"place"` |
| `api.selectedJoint()` | the selected joint's name, or `null` |

Fields of `S` a mod may read (and change inside `api.edit`): `P` (19 joints, [x, y, z] cm),
`R` (joint radii), `hands` (`{r, l}` hand shapes), `cam` (`lens` mm, `yaw`, `pitch`, `roll` degrees,
`zoom`), `pins` (pinned joints), `items` (props in the scene), `solids`, `auras`, `colors`, `env`
(floor, walls, ceiling, grounding), `wire`, `ruler`.

### Joints, maths and the view

| call | gives |
|------|-------|
| `api.joints.names`, `.index`, `.parent`, `.ja` | the joint list, name → index, parents, Japanese names |
| `api.math.add / sub / mul / dot / cross / len / norm` | 3D vectors as `[x, y, z]` |
| `api.math.rotAxis(v, axis, radians)`, `api.math.deg(d)` | rotate a vector; degrees → radians |
| `api.view.project(p, W, H)` | a world point → front-view pixels `{x, y, s (pixels per cm), z}` for a canvas W × H |
| `api.view.sideProject(p, W, H)` | the same for the side view |
| `api.view.ray(x, y, W, H)` | a front-view pixel → the camera's ray `{o, dir}` in the world |
| `api.view.camera()` | a copy of the camera |
| `api.view.front()`, `api.view.side()` | the two canvases |

### Adding things

| call | adds |
|------|------|
| `api.props.addCategory(key, ja, en)` | a prop category |
| `api.props.add(key, def)` | a prop (checked: a mistake throws with the field's name) |
| `api.props.get(key)`, `.keys()`, `.categories()` | look up props |
| `api.items.add(key, hand?)` | put a prop in the scene, as the panel's button does (`hand`: `"r"` or `"l"`) |
| `api.solids.addKind(key, {ja, en, shape, size, sides?, at?})` | a solid kind; `shape`: `box`, `prism`, `cyl`, `pyr`, `cone`; `size`: [w, h, d] cm; `at`: where it is placed, from the hips |
| `api.solids.add(kind)` | place a solid |
| `api.auras.addKind(key, {ja, en, color, front?, margin?, draw})` | an aura kind (see below) |
| `api.auras.addPart(key, {ja, en, chains})` | which joints an aura surrounds: `chains: [["r_shoulder", "r_elbow", "r_wrist", "r_hand"], ...]` (`r_hand` / `l_hand` = the middle of the fist; one outline per chain) |
| `api.hands.add(key, {ja, en, curl})` | a hand shape: `curl` per finger (thumb, index, middle, ring, pinky), 0 straight … 1 closed |
| `api.hands.set(side, key)`, `api.hands.shapes()` | set a hand's shape; the shape keys |
| `api.poses.add(name, {en, turns})` | a built-in pose: `turns: [[joint, "x" \| "y" \| "z", degrees], ...]`, each a turn of that joint's bone from the standing pose |
| `api.poses.apply(name)` | put the figure in that pose |
| `api.presets.add(list)` | user presets `{group, name, P}` (P: 19 joints in cm; only the bones' directions are used) |

### Files (API 1.1)

| call | does |
|------|------|
| `api.io.render("atari" \| "openpose")` | the exported picture as a PNG data URL, at the export size |
| `api.io.exportSize()`, `api.io.setExportSize(W, H)` | the export size in pixels |
| `api.io.poseJSON()` | the pose as saved (`version: 3` and the whole state, with `S.mods`) |
| `api.io.sceneJSON()` | the scene alone: things, floor and walls, wire, solids |
| `api.io.loadPose(pose)` | load a pose (object or JSON text); returns false when it is not one |

**Aura kinds.** `draw(ctx, info)` is called once per outline, with the canvas already set to the
aura's colour. `info.points` walks the outline at an even step: `{x, y, nx, ny}` (pixels, outward
normal). `info.size` is the aura's size in pixels, `info.lineWidth` a line width for this canvas,
`info.random()` a random number 0..1 that is the same on every redraw, `info.hull` the outline's
corners, `info.W`, `info.H` the canvas. `front: true` draws it over the figure (default: behind).
`margin` (default 0.6) is how far the outline lies from the joints, as a share of the size.

### Translations

The page is written in Japanese; in English mode every text is looked up.

| call | does |
|------|------|
| `api.i18n.add({"日本語": "English", ...})` | words and sentences (whole texts) |
| `api.i18n.addRule(regexp, fn)` | a rule for texts with parts in them (example below) |
| `api.i18n.lang()` | `"ja"` or `"en"` |

```js
api.i18n.addRule(/^(.+)を投げました。$/, m => `Threw the ${m[1]}.`);   // a message your mod shows with api.say
```

Most `add` calls take an `en` field (props, solids, auras, hands, poses) and register it for you.

### Panels

`api.ui.addSection({title, titleEn?, html, at?})` adds a section to the side bar (above the MOD panel;
`at: "top"` puts it first, API 1.1) and returns it. Write the labels in Japanese and add their English with `api.i18n.add`, or write them in
English only. Prefix your element ids with your mod's id. `api.ui.$(id)` is `document.getElementById`.

### Events

`api.on(event, fn)`:

| event | fn gets | notes |
|-------|---------|-------|
| `drawBehind` | `ctx, W, H, opts` | before everything in the front view and the export |
| `draw` | `ctx, W, H, opts` | after everything (over the figure); `opts.export` is true while exporting the rough picture |
| `drawSide` | `ctx, W, H, opts` | the side view, after the scene |
| `afterEdit` | `moved` (a joint index or −1) | after every edit, once the simulation ran |
| `sync` | — | after undo, loading a pose, a preset: refresh your panel from `api.data()` here |
| `mode` | the new mode | the mode buttons |
| `pointerDown` | `canvas, x, y, event` | return `{move(x, y, event)}` to take the drag, or nothing; x, y in canvas pixels; the editor remembers for undo first |
| `wheel` | `x, y, step, event` | return `true` when you used it (step: +1 / −1) |

The canvas state (`ctx`) is saved and restored around each drawing hook.

## Saving and compatibility

- Your data in `api.data()` and the props, solids and auras you added are saved in the pose JSON
  (also in what the ComfyUI node outputs). Opened without your mod, they stay in the file; props and
  aura kinds the editor does not know are skipped when drawing, unknown solid kinds draw as boxes.
- The API follows semantic versioning: 1.x adds things and keeps what is here working (1.1 added
  `api.io` and `addSection({at})`). A mod with
  `api: 2` does not load in an editor with API 1.
- Only what this page describes is the API. The editor's other functions and globals can change
  between versions.

## A repository of mods

Mods can live in their own git repository: clone it into `mods/`, and every `*.js` at its top level
loads (deeper folders are not read, so a repository can keep notes, assets and tests there).

```
cd ComfyUI/custom_nodes/ComfyUI-SymbolicPoseEditor/mods
git clone <your mods repository>
```

Update it with `git pull` in that folder, then reload the editor (opened from disk: run
`tools/make_mods_list.py` again when files were added or removed). Because `mods/` is git-ignored,
the cloned repository does not mix with the editor's own.
