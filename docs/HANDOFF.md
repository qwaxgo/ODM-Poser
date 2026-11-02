# Handoff: ODM Poser / 立体人形装置 (for the next Claude session)

ODM Poser = Omni-Directional Mannequin Poser; the Japanese name on screen and in Japanese docs is
立体人形装置. Repository `ODM-Poser`; the owner's working copy
is `C:\AI\ODM-Poser`. Related public repository: `ODM-Poser-SampleMods`. Both state that they were
implemented with Claude Code.

Read this first when you pick the project up in a new thread. It says what exists, how it fits
together, the owner's rules, and what is still open.

## What it is

A pseudo-3D stick-and-circle pose editor ("atari" = a rough of lines and circles): a web page
on a static site (GitHub Pages, built with Astro) that also installs as an app (PWA). The owner (qwaxgo, an illustrator) publishes it under MIT. It started
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
  (tags `v0.x.y`), none built yet:
  - an HTML build: a zip whose editor opens from disk (file://), so *the editor's scripts must keep
    working from file://* (no ES modules, no fetch of its own files); the user's mods go in the
    `mods/` folder next to it, listed by a line in its `mods.js`, or the folder picked in the editor
    (both ways); the docs are a link to the site, not shipped;
  - an executable (Tauri), for the platforms this machine can build: Linux, and Windows cross-built
    in the build container (NSIS installer), or on the Windows host if that fails; mods in a `mods/` folder next to it; not code-signed (the docs explain
    the Windows warning);
  - an APK (Tauri's Android build): a future plan, not now.
  The Tauri builds get their own build container, apart from the Astro one.
- **ComfyUI**: the bridge is the owner's public repo `qwaxgo/ODM-Poser-ComfyUIBridge` (editor as
  its git submodule, served from `web/editor/`). It is reworked on its own branch, in another
  environment, to follow this branch; its outputs stay as they are. Here: keep what it relies on
  (see Hosts) and give it a built editor to serve.
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
src/pages/docs/, src/lib/docs.ts the docs: docs/APP*.md and docs/MODDING*.md (src/content.config.ts) as pages, ja / en
.devcontainer/, docker-compose*.yml   the development container (open it from WSL2); compose: dev, preview, serve;
                                 docker-compose.test.yml: lint-ui, syntax, build
tools/make_icons.py              draws the app icons (web/editor/icon-*.png, apple-touch-icon, favicon, icon.svg)
web/editor/manifest.webmanifest, sw.js   the app (PWA): network first, the kept copy offline (docs/APP.md)
docs/HANDOFF.md                  this file; docs/MODDING.md (-JA) the MOD API
```

## Hosts

A page that hosts the editor talks to it only through a mod (MOD API: `api.io`, `api.ui`,
`api.presets`) and the list of mods it serves at `../mods.js`; keep the API stable for hosts:
state format `version: 3`, `window.ODMPoser` (old alias `window.SymbolicPose`).

## The editor in brief (web/editor/pose_main.js)

- State `S`: `P` 21 joints (the hands r_hand / l_hand last, so older 19-joint poses upgrade by appending) (cm, y up, the figure faces +z; order in `J`), `R` circle radii,
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

- JS syntax: `python -c "import esprima, glob; [esprima.parseScript(open(f, encoding='utf-8').read()) for f in sorted(glob.glob('web/editor/*.js'))]"`
  (esprima knows no `?.` or `??`: keep those out of the editor files).
- Browsers: Playwright (for Python) drives Edge (`channel="msedge"`),
  WebKit and Firefox, with device emulation for phones and tablets; the headless Edge command
  line can hang while a newer Edge waits to install.

## Open items

- The app (src-tauri), written 2026-11-02, NOT built yet (this container has no Docker or Rust toolchain
  for linking; the Rust type-checks against Tauri 2 for a macOS target with stubbed C tools, and
  mods.rs's unit tests pass; the page side was tested with a simulated init script). Owner runs, in WSL2:
  `HOST_UID=$(id -u) HOST_GID=$(id -g) docker compose -f docker-compose.tauri.yml run --rm tauri [linux|windows|all]`
  and pastes errors. Expected trouble: the image's llvm-rc link, cargo-xwin's first run, linuxdeploy in
  the AppImage step, Windows needs WebView2. Design: mods = `mods/` next to the AppImage ($APPIMAGE) or the
  exe, listed at start (restart to add), served by the odmmods:// protocol (plain *.js, `_`/`.` names
  skipped, no `..`, no links out); saving = `window.ODM_APP_SAVE` (set by the app) -> `save_file` command
  (asks where; the page cannot choose the path); links to other sites open in the browser (opener plugin).
  Not tested on a real window: window.open for the share buttons (pose_share.js), dragging files.
  Tauri's version follows package.json; Cargo.toml's `version` is kept by hand.
- Releases (see "Where it runs"): the HTML zip is made (v0.1.0 not tagged yet: merge astro into main
  first); the MOD panel's "フォルダから" loads a picked mods folder (kept in Chrome / Edge; the
  re-permission button "読み込む" was not tested by automation: it needs a real click). Tauri next. The site itself
  is deployed by .github/workflows/static.yml (GitHub Pages on push to main, shown at
  apps.qwaxgo.com/ODM-Poser/).
- ComfyUI bridge (note for its rework, done in its own repo): since 2026-11-02 the editor's page
  is built (dist/editor/), not in the repo, so the bridge's submodule no longer has
  web/editor/index.html. Unchanged and still relied on: `../mods.js`, `../mods/`, the MOD API, the
  state format. Ways to give it a built editor (not decided): (a) CI pushes the same build as the
  HTML zip to a branch of this repo (e.g. `editor-build`) and the submodule follows that branch, so
  the bridge needs no Node.js; (b) the bridge fetches the Release zip.
- Docs pages still to write (owner wants all of them; src/lib/docs.ts PAGES, a docs/NAME.md +
  NAME-JA.md pair each, added to src/content.config.ts): exporting (pictures, OpenPose, the pose
  file), adding poses (user presets, described generically), adding props / assets, download (the
  Releases, the unsigned-app warning), using it in ComfyUI (the bridge).
- English UI done (2026-10-19). To find untranslated text: open the editor headless with
  `?lang=en`, step through the modes, joints and props, and list text nodes that still hold
  Japanese (only the "日本語" switch and the search example should remain).
- Real mouse, touch and pen use has been checked by automation only.
- Prop shapes and grip positions are estimates; the owner will report the ones that look off.
- The owner's private project keeps its own copy of the editor (it embeds it elsewhere).
  Changes made there are copied here with a sync script that lives in that project (it
  is now retired: this repository has moved far past that copy). Keep the state format readable
  by both, or note the difference here.
