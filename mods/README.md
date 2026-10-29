# mods

Put mod files (`*.js`) here. The editor loads them in name order when it starts. This folder's
contents are not committed (see `.gitignore`), except this file.

- Inside ComfyUI: they are served by the node; reload the editor after adding one.
- Opened from disk (`web/editor/index.html`): run `python tools/make_mods_list.py` once after
  adding or removing a mod, so the editor knows the file names.
- A file whose name starts with `_` is skipped (a quick way to turn a mod off).
- Add `?nomods` to the editor's address to start without mods.

How to write a mod: `docs/MODDING.md` (日本語: `docs/MODDING-JA.md`). An example to copy here:
`examples/mods/hello_mod.js`.

MOD は `*.js` をここに置くと、エディタの起動時に名前順で読み込まれます。ComfyUI なしで開くときは
`python tools/make_mods_list.py` を一度実行してください。MOD はエディタの中で自由に動くプログラムなので、
信頼できるものだけを入れてください。
