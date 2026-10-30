# Using it as an app (PWA)

The editor can be installed from the browser as an app (a PWA): it gets an icon (home screen,
Start menu, Dock), opens in its own window, opens offline after the first time (with the mods and
presets it last read), and updates itself the next time it opens online. 日本語: [APP-JA.md](APP-JA.md)

**Condition**: the editor must be opened from an **https site** or from **this computer
(localhost)**. Opened as a file (`web/editor/index.html`) it is not installable (it still works).

## Computers (Windows, macOS, Linux)

- **With ComfyUI**: open `http://127.0.0.1:8188/symbolic_pose/editor/index.html` in a browser tab
  (not the node's window) and press **Install as an app** (or the install icon in the address bar).
- **Without ComfyUI**: run `python tools/serve.py`, open `http://localhost:8765/web/editor/`, press
  **Install as an app**. Once installed, the app opens without the server (run it again to update).

| browser | how |
|---------|-----|
| Chrome, Edge, Vivaldi, Brave | the **Install as an app** button or the address bar's install icon |
| Safari (Mac) | File → Add to Dock (the button explains it) |
| Firefox | no app install; use it in a tab |

## Phones and tablets (iPhone, iPad, Android, Kindle)

They need the editor on an **https site**:

1. Put the `web` folder (and `mods` for mods; run `python tools/make_mods_list.py` first) on an
   https static host such as GitHub Pages, Cloudflare Pages or Netlify; the editor is at
   `https://<site>/web/editor/`. What you upload is public on that site, private mods included.
   GitHub Pages serves private repositories only on paid plans.
2. Open that address and install: **iPhone / iPad** (Safari): Share (□↑) → Add to Home Screen;
   **Android** (Chrome, Edge, Samsung Internet): the button, or menu → Install app / Add to Home
   screen; **Kindle** (Silk): menu → Add to Home Screen where the Silk version offers it.

`python tools/serve.py --lan` lets a phone on the same network open the editor in its browser;
without https it cannot be installed there.

## Updates and offline

On each start the app reads the editor, the mods and the presets from the network and keeps them;
offline it opens with what it kept. A new version shows the next time it opens online.

## Troubleshooting

| symptom | cause and fix |
|---------|---------------|
| no **Install as an app** button | opened as a file (use https or localhost), already installed, Firefox, or inside the node's window |
| cannot install on a phone | not https: put the editor on an https site |
| no update | open the app again while online |
| no mods | upload `mods/` and `web/mods.js` (`tools/make_mods_list.py`) |
