# Handoff: ODM Poser / 立体人形装置 (for the next Claude session)

ODM Poser = Omni-Directional Mannequin Poser; the Japanese name on screen and in Japanese docs is
立体人形装置. Repository `ODM-Poser` (formerly ComfyUI-SymbolicPoseEditor); the owner's working copy
is `C:\AI\ODM-Poser` (outside ComfyUI). Related public repositories: `ODM-Poser-ComfyUIBridge`
(the ComfyUI custom node; it carries this editor as the git submodule `editor/`) and
`ODM-Poser-SampleMods`. All three state that they were implemented with Claude Code.

Read this first when you pick the project up in a new thread. It says what exists, how it fits
together, the owner's rules, and what is still open.

## What it is

A pseudo-3D stick-and-circle pose editor ("atari" = a rough of lines and circles): a web page
that runs from disk, from any static site (GitHub Pages) and as an installed app. The ComfyUI node
is a separate repository (ODM-Poser-ComfyUIBridge) that embeds this one; nothing about ComfyUI
lives here. The owner (qwaxgo, an illustrator) publishes it under MIT. It started
as a tool inside a private project and was split out on 2026-10-19 with no git history and
nothing third-party: keep it that way.

## Owner's rules (do not break)

- **Nothing with someone else's rights goes in**: no pictures, poses read from bought pose
  packs, names of those packs or their files, fonts, icons or code copied from elsewhere. Props
  and shapes are hand-made primitives. If you borrow an *idea* from another project, write the
  code yourself and do not copy text.
- **Built-in poses**: only the 11 written by hand as joint turns (`PRESETS` in index.html:
  nothing traced from pictures). Other poses come from the user's own preset files (loaded in
  the editor, or from the bridge's git-ignored `user_presets/`). The public repos must not reveal
  what the owner keeps there: describe the feature generically.
- **Standalone**: the editor must work as a plain HTML page opened from disk, with no server.
- The owner commits and pushes. Do not commit unless asked; finish a batch with ready-to-paste
  commit / push commands. Reports to the owner are in Japanese.
- Heavy GPU runs are not needed for this project.

## Layout

```
web/editor/index.html            the editor core (plain JS, Canvas 2D; no ComfyUI in it)
web/editor/pose_props*.js        window.PROP_CATS / window.PROPS: the props as primitives
web/editor/pose_scene.js         floor / walls / ceiling, holding, wearing, carrying, mounting, grabbing, wire
web/editor/pose_solids.js        solids; pose_style.js line colours and auras; pose_ruler.js the ruler
web/editor/i18n.js               Japanese / English (exists only in this repo; see below)
web/editor/pose_api.js           the MOD API and the mod loader (docs/MODDING.md)
web/editor/pose_share.js         posting (X, Bluesky, Misskey, Mastodon, share menu) and #pose= links;
                                 only the official mods (qwaxgo on GitHub) travel; opened links are sanitised
mods/                            the user's mods and cloned mod repositories (README.md only is tracked),
                                 e.g. ODM-Poser-SampleMods
tools/make_mods_list.py          web/mods.js for opening the editor from disk with mods
tools/serve.py                   a local server (localhost / --lan) so the editor installs as an app
tools/make_icons.py              draws the app icons (web/editor/icon-*.png, apple-touch-icon, favicon, icon.svg)
web/editor/manifest.webmanifest, sw.js   the app (PWA): network first, the kept copy offline (docs/APP.md)
docs/HANDOFF.md                  this file; docs/MODDING.md (-JA) the MOD API
```

## Hosts (ComfyUI and others)

A page that hosts the editor talks to it only through a mod (MOD API: `api.io`, `api.ui`,
`api.presets`) and the list of mods it serves at `../mods.js`. The ComfyUI bridge repository does
exactly that (its `mod/comfyui.js`, its own HANDOFF in its README); keep the API stable for it:
state format `version: 3`, message names `odm-poser-*`, `window.ODMPoser` (old alias
`window.SymbolicPose`).

## The editor in brief (web/editor/index.html)

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

- JS syntax: `python -c "import esprima, re; [esprima.parseScript(m) for m in re.findall(r'<script>(.*?)</script>', open('web/editor/index.html', encoding='utf-8').read(), re.S)]"`
  (esprima knows no `?.` or `??`: keep those out of the editor files; the widget file uses `?.`
  and is checked in the browser).
- Browsers: Playwright (installed in ComfyUI's python_embeded) drives Edge (`channel="msedge"`),
  WebKit and Firefox, with device emulation for phones and tablets; the headless Edge command
  line can hang while a newer Edge waits to install.

## Open items

- English UI done (2026-10-19). To find untranslated text: open the editor headless with
  `?lang=en`, step through the modes, joints and props, and list text nodes that still hold
  Japanese (only the "日本語" switch and the search example should remain).
- Real mouse, touch and pen use has been checked by automation only.
- Prop shapes and grip positions are estimates; the owner will report the ones that look off.
- The owner's private project keeps its own copy of the editor (it embeds it elsewhere).
  Changes made there are copied here with a sync script that lives in that project (it
  is now retired: this repository has moved far past that copy). Keep the state format readable
  by both, or note the difference here.
