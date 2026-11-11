# Handoff: ODM Poser / 立体人形装置 (for the next Claude session)

ODM Poser = Omni-Directional Mannequin Poser; the Japanese name on screen and in Japanese docs is
立体人形装置. Repository `ODM-Poser`; the owner's working copy
is `C:\AI\ODM-Poser`. Related public repository: `ODM-Poser-SampleMods`. Both state that they were
implemented with Claude Code.

Read this first when you pick the project up in a new thread. It says what exists, how it fits
together, the owner's rules, and what is still open.

## What it is

A pseudo-3D stick-and-circle pose editor ("atari" = a rough of lines and circles): a web page
on a static site (GitHub Pages, built with Astro) that also installs as an app (PWA). The owner (qwaxgo, an illustrator) publishes it under MIT; what it exports is CC0 1.0 (docs/LICENSE*.md: commercial and AI use, credit optional). It started
as a tool inside a private project and was split out on 2026-10-19 with no git history and
nothing third-party: keep it that way.

## Owner's rules (do not break)

- **Nothing with someone else's rights goes in**: no pictures, poses read from bought pose
  packs, names of those packs or their files, fonts, icons or code copied from elsewhere. Props
  and shapes are hand-made primitives. If you borrow an *idea* from another project, write the
  code yourself and do not copy text.
- **Built-in poses**: only the 11 written by hand as joint turns (`PRESETS` in pose_main.js:
  nothing traced from pictures). Other poses come from the user's own preset files (loaded in
  the editor, or added by a host through a mod). The public repos must not reveal
  what the owner keeps there: describe the feature generically.
- **Where it runs** (owner's decisions, 2026-11-02): the editor is a page of the Astro site; the
  repository has no plain HTML file to open from disk. Standalone use comes from GitHub Releases
  (tags `v0.x.y`; v0.1.0 published 2026-11-02 with all three files below except the APK):
  - an HTML build: a zip whose editor opens from disk (file://), so *the editor's scripts must keep
    working from file://* (no ES modules, no fetch of its own files); the user's mods go in the
    `mods/` folder next to it, listed by a line in its `mods.js`, or the folder picked in the editor
    (both ways); the docs are a link to the site, not shipped;
  - an executable (Tauri): a Linux AppImage, and a Windows zip (the exe, no installer) cross-built
    in the build container; mods in a `mods/` folder next to it; not code-signed (docs/DOWNLOAD.md
    explains the Windows warning);
  - an APK (Tauri's Android build): a future plan, not now.
  The Tauri builds get their own build container, apart from the Astro one.
- **ComfyUI**: the bridge is the owner's public repo `qwaxgo/ODM-Poser-ComfyUIBridge` (a release's
  HTML build in its `editor_html/`, since 2026-11-03; see Open items). It is worked on in another
  environment; its outputs stay as they are. Here: keep what it relies on (see Hosts); how it
  builds or gets the editor is the bridge's own choice.
- The owner commits and pushes. Do not commit unless asked; finish a batch with ready-to-paste
  commit / push commands. Reports to the owner are in Japanese.
- **Patch notes with every commit** (owner, 2026-11-02): each change adds lines (Japanese and
  English) under the top version of CHANGELOG.md, which is the next release (= package.json's
  version, shown in the editor's header). The release draft takes that part as its notes.
- Heavy GPU runs are not needed for this project.

## Layout

```
src/pages/editor/index.astro     the editor's page; its markup in src/components/editor/*.astro (plain HTML)
web/editor/pose_main.js          the editor core (plain JS, Canvas 2D), loaded by the page as a classic script
web/editor/ui.js, ui.src.css     the look after melta UI (design/melta-ui); ui.css is generated (npm run css); see AGENTS.md
web/editor/pose_props*.js        window.PROP_CATS / window.PROPS: the props as primitives
web/editor/pose_scene.js         floor / walls / ceiling, holding, wearing, carrying, mounting, grabbing, wire
web/editor/pose_solids.js        solids; pose_style.js line colours and auras; pose_ruler.js the ruler
web/editor/pose_cast.js          more than one figure; pose_sets.js the saved poses (pose + things + place) and bodies
web/editor/pose_gizmo.js         the 3-axis handles (tools per mode); ui-figure.js the body map and 人物の管理 under it; its 付随物 block is in the リセット tab (PanelReset.astro holds the other resets)
web/editor/pose_place.js         設置: one list to put shapes / slabs / things and one list of what is out, with place, turn (XYZ: a solid's pitch / yaw / roll, a thing's rot[0] / yaw / rot[2]) and size; the older 物体 / 小物を単体で置く sections stay hidden (data-menu "old-place")
web/editor/pose_objects.js       the objects as one selection (ODMObj): picks of "sN"/"iN" (box from an empty place with the drag cursor, Ctrl+click), Delete, Ctrl+X/C/V (KEY-clip), the drag / hand cursor (handHook / emptyDrag / emptyClick in pose_main.js), pivots (o.piv: relative, in the object's turned axes; keepPivot turns about it)
web/editor/pose_persp.js         パースの誇張 while the camera is locked: one camera for everything moved toward one pivot point (S.persp.pivot: a free point or on a part / object) with the lens widened and shifted (PX, pxNow, withPX in pose_main.js); one strength S.persp.k; the pivot's mark (on the front and side views unless S.persp.mark is false; dragged on either, ODMPxMark.sideDown for the side view; pressed, it takes the 3-axis handles' move arrows through window.ODMGizmoTargets in pose_gizmo.js); S.camPeek: the camera moved for a while with the lock kept
web/editor/pose_sideview.js      側面図's own camera (S.sideView: from r / l, centre key + joint, yaw, pitch, zoom, pan; the projection sideView / sideBasis / sideProject / sideUnproject in pose_main.js); 見る › 視点 › 側面図; drags where there is no joint, the middle button, the wheel and two fingers (its own touch listeners) on the side view; 90° and ↺ (#svBack90View, #svResetView in .sv-tools, Stage.astro)
web/editor/ui-pane.js            the grip between the views and the panel (--aside-w, --split-k, --split-aside-user), the modes' two columns, the switches' ▲ ▼
web/editor/ui-sheet.js           the phone (bottom bar and sheets) and the tall layout (body.sheet-tall: the views 50-85 % (--tall-k, the edge in ui-pane.js: tb / tt); from the screen edge: the bar, the categories' row, the tabs' row (#asideHead, fixed), the controls side by side (aside); body.bar-top puts them at the top); the phone: full-screen views, the category bar, the translucent sheets (aside.sheet-panel), the simplified view (#sheetMini), the About sheet (#aboutSheet). Upright and narrow only (`(max-width: 900px) and (orientation: portrait)`); sideways and computers keep the panel as before
web/editor/i18n.js               Japanese / English (exists only in this repo; see below)
web/editor/pose_api.js           the MOD API and the mod loader (docs/MODDING.md)
web/editor/pose_share.js         posting (X, Bluesky, Misskey, Mastodon, share menu) and #pose= links;
                                 only the official mods (qwaxgo on GitHub) travel; opened links are sanitised
mods/                            the user's mods and cloned mod repositories (README.md only is tracked),
                                 e.g. ODM-Poser-SampleMods
tools/make_mods_list.py          web/mods.js: the list of mods/ for npm run dev and tools/serve.py (both serve mods/ at <base>/mods/)
tools/serve.py                   builds the site and serves dist/ (localhost / --lan) so the editor installs as an app
tools/dist_server.py             builds and serves dist/ at /ODM-Poser/ for serve.py, lint_ui.py, make_card.py
src-tauri/                       the app (Tauri 2): src/main.rs (window, odmmods:// protocol for the mods folder, save_file
                                 dialog), src/mods.rs (listing / serving mods, unit-tested), tauri.conf.json, icons/
tools/make_app_web.py            app/web: the editor for the app (docs link to the site, no mods.js script)
tools/build_app.sh               builds the AppImage and the Windows zip inside docker-compose.tauri.yml's container
                                 (build/tauri/Dockerfile: Ubuntu 22.04, Rust, Node, cargo-xwin); tools/make_app_zip.py zips the exe
tools/make_release_html.py       release/: the HTML release zip (parts in tools/html_release/) and its notes;
                                 .github/workflows/release.yml runs it on a pushed tag v<version> (a draft)
CHANGELOG.md                     patch notes (ja / en), the top version is the next release
astro.config.mjs, src/pages/    the site (Astro): src/pages makes the editor, the docs and the site root (link card);
                                 web/ goes out as it is (publicDir); npm run build -> dist/, which the Pages workflow publishes
src/pages/docs/, src/lib/docs.ts the docs: docs/{DOWNLOAD,APP,EXPORT,POSES,PROPS,MODDING,COMFYUI}(-JA).md
                                 (listed in src/content.config.ts, ordered by PAGES in src/lib/docs.ts) as pages, ja / en
.devcontainer/, docker-compose*.yml   the development container (open it from WSL2); compose: dev, preview, serve;
                                 docker-compose.test.yml: lint-ui, syntax, build
tools/make_icons.py              draws the app icons (web/editor/icon-*.png, apple-touch-icon, favicon, icon.svg)
web/editor/manifest.webmanifest, sw.js   the app (PWA): network first, the kept copy offline (docs/APP.md)
docs/HANDOFF.md                  this file; docs/MODDING.md (-JA) the MOD API
docs/ARCHITECTURE.md (-JA)       the design document for refactoring: load order, wrapping chains, state, flows, promises, debt
```

## Hosts

A page that hosts the editor talks to it only through a mod (MOD API: `api.io`, `api.ui`,
`api.presets`) and the list of mods it serves at `../mods.js`; keep the API stable for hosts:
state format `version: 3`, `window.ODMPoser` (old alias `window.SymbolicPose`).

## The editor in brief (web/editor/pose_main.js)

- State `S`: `P` 21 joints (the hands r_hand / l_hand last, so older 19-joint poses upgrade by appending) (cm, y up, the figure faces +z; order in `J`), `R` circle radii,
  `hands {r,l}`, `cam`, `body` (whole-body turn), `twist` per joint, `pins {joint: [x,y,z]}`,
  `items`, `env`, `wire`, `center` (view centre), `shape` (optional: the shoulders' and thigh
  roots' own standing directions, kept by `keepTorsoShape()` when their width / height / depth is
  changed, so 関節の限界 does not pull them back; `restDir(i)`).
- The shoulders and thigh roots (`TORSO_PAIR`) are resized along the torso's own axes (`torsoAxes`,
  `movePair`): body-mode drags lock to the axis first dragged along; サイズ and the 3-axis handles
  set width, height and depth apart. Saved JSON has `version: 3`; `migrate()` reads
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
- Props: `place` = `hand` (hand frame: z along the hand, y toward the thumb, x out of the palm;
  `grip2` for the other hand), `body` (in front of the chest; `mount` for both hands), `world` (on
  the floor; `mount` seats the pelvis and puts hands / feet), `grab` (`grab` = the lines a hand or
  foot takes hold of).
- Held things: `gripFrame(side)` puts the frame's origin on the hand shape's grip point
  (`GRIP_AT` in pose_main.js: inside the curled fingers, at the palm, between the fingertips;
  shapes not listed = fist); the thing's own grip point (`gripPoint` in pose_scene.js) goes there:
  its origin, or by its `pose` (cup: the side toward the palm; pinch: nearest its origin), or
  `def.grip`. `aimOtherHand` puts the other hand's grip point on `grip2` the same way.
- Item sizes: `it.stretch [x, y, z]` along its own axes (`stretchOf` also reads the older
  `len` / `thick`; `foldStretch` converts on edit); round parts' radii follow (`radK`).
- Checking the phone view from VS Code's browser (which does not emulate devices): `npm run dev`, then open
  http://localhost:4321/ODM-Poser/dev/phone/ (or /dev/tablet/); src/pages/dev/[device].astro, dev only (no pages in the build).
- Views' corners: #ovModes / #ovOpts are children of .views (over the front and the side view together); the touch keys
  (#vShift, #vAlt) sit in #ovTouch under the handles' tools, #vPad among the switches; the old #touchBar is gone. On a
  phone the side view takes sidePos like a computer (hidden until asked for); a side view under 420px folds its picker.
- Item sections: `def.segs` ([id, from, to] along `segAxis`, about `segAnchor`) and `it.segs {id: factor}`;
  pose_scene.js `segMap` stretches the axis piece by piece, `segParts` (in `partsOf` / `partSets`) and `segPoint`
  (grip, grip2, bayonet, mount, grab) apply it before the stretch. Built-in sections: `SEGS` at the end of
  pose_props.js; the panel is in pose_size.js (`segSel` draws the chosen one heavier).
- Modes and tools: ポーズ rotates (3-axis rotate turns what lies beyond the selected joint about it)
  and moves only arm / leg joints (`LIMB` in pose_gizmo.js); 体格 only scales; 配置 moves objects,
  things, the ruler box and the whole figure by its hips. `tools()` greys out the rest and the tool in
  use falls back to one the mode has (the chosen one, `pref`, comes back). While the handles show,
  `gizmoHolds()` makes a direct drag select only. A drag on empty space turns the camera (mouse too).
- Body sizes: `fromBottom(fn)` keeps the lowest point where it was (height, legs, sex, body presets);
  `withNeck(fn)` takes the neck and head along when the shoulders' middle goes up or down (the neck
  is drawn from there); `thickJoints(j)` gives an arm's / leg's circles together unless
  `#thickLink` is off. `S.sex` remembers 女性 / 男性 for `resetToSex()`.
- Presets: pose presets keep the body (`posePreset`); pose_sets.js keeps saved poses and bodies in
  localStorage (`KEY-posesets`, `KEY-bodysets`), apart from each other.
- Hanging (pose_scene.js): `hangFrom(joint)` straightens the holding arm (or leg), turns the body
  about the hold until its centre is under it and lets the free arms hang; the wire does it when a
  wrist / ankle / the rope is chosen (`#scWirePose`), and 「ぶら下がる」 with one hand or one foot
  pinned. `wire.joint === "rope"`: the right wrist is held, the left one kept 14 cm down the rope.
- More than one figure (pose_cast.js): things put down / placed on their own (`movable`) stay
  with the figure being edited (`passLoose`), so 配置 mode reaches them; each figure has its own
  position / direction controls (`placeFigure`); the pictures can show one figure
  (`#castExport`, `onlyFigure`).

## Language (web/editor/i18n.js)

The page is written in Japanese. `i18n.js` translates every text node, placeholder and title
(and what the editor adds later, through a MutationObserver) with a table (`T`), joint names
(`JOINT`) and rules for the messages built at run time (`RULES`, e.g. "<joint>を固定しました。"),
and patches `CanvasRenderingContext2D.fillText` for canvas labels. Prop names come from
`PROPS[key].en`; "ja / en" option texts show the English part. When you add Japanese UI text,
add its English to `T` (or a rule) -- the check below lists what is left untranslated.

## Checking changes

- JS syntax: `python -c "import esprima, glob; [esprima.parseScript(open(f, encoding='utf-8').read()) for f in sorted(glob.glob('web/editor/*.js'))]"`
  (esprima knows no `?.` or `??`: keep those out of the editor files).
- Browsers: Playwright (for Python) drives Edge (`channel="msedge"`),
  WebKit and Firefox, with device emulation for phones and tablets; the headless Edge command
  line can hang while a newer Edge waits to install.

## Open items

- The app (src-tauri), 2026-11-02. Built by the owner in WSL2 (not in this dev container, which has no
  Docker): `HOST_UID=$(id -u) HOST_GID=$(id -g) docker compose -f docker-compose.tauri.yml run --rm tauri [linux|windows|all]`
  (the Windows link prints many harmless LNK4099 "PDB not found" warnings). Design: mods = `mods/` next to
  the AppImage ($APPIMAGE) or the exe, listed at start (restart to add), served by the odmmods:// protocol
  (plain *.js, `_`/`.` names skipped, no `..`, no links out); saving = `window.ODM_APP_SAVE` (set by the
  app) -> `save_file` command (asks where; the page cannot choose the path); links to other sites open in
  the browser (opener plugin). The bundle category must be one Tauri knows (`GraphicsAndDesign`).
  Built and released as v0.1.0 (AppImage, Windows zip); the owner checked that it starts. Not checked:
  window.open for the share buttons (pose_share.js), dragging files, mods/ next to the app.
  Tauri's version follows package.json; Cargo.toml's `version` is kept by hand.
- Releases (see "Where it runs"): v0.1.0 is out; the next is package.json's version (CHANGELOG's top);
  the MOD panel's "フォルダから" loads a picked mods folder (kept in Chrome / Edge; the
  re-permission button "読み込む" was not tested by automation: it needs a real click). Tauri next. The site itself
  is deployed by .github/workflows/static.yml (GitHub Pages on push to main, shown at
  apps.qwaxgo.com/ODM-Poser/).
- ComfyUI bridge (reworked in its own repo, 2026-11-03): it no longer has this repository as a
  submodule. It carries a release's HTML build in `editor_html/` (its `tools/update_editor.py
  <version>`), and its config.json can name a built editor (a checkout's `dist`). Still relied on:
  the HTML release's layout (`editor/` beside `mods.js`), relative links in the page, `../mods.js`,
  `../mods/`, the MOD API, the state format.
- Docs pages: download, app, export, poses, props, modding, comfyui (2026-11-02). A new page = a
  docs/NAME.md + NAME-JA.md pair, in src/content.config.ts and src/lib/docs.ts PAGES. COMFYUI*.md
  follows the bridge's README: update it when the bridge's rework changes how it is installed.
- English UI done (2026-10-19). To find untranslated text: open the editor headless with
  `?lang=en`, step through the modes, joints and props, and list text nodes that still hold
  Japanese (only the "日本語" switch and the search example should remain).
- Real mouse, touch and pen use has been checked by automation only.
- Prop shapes are estimates; grip positions now follow GRIP_AT (worked out from the finger
  geometry, checked from above and the side); the owner will report the ones that look off.
- The owner's private project keeps its own copy of the editor (it embeds it elsewhere).
  Changes made there are copied here with a sync script that lives in that project (it
  is now retired: this repository has moved far past that copy). Keep the state format readable
  by both, or note the difference here.
