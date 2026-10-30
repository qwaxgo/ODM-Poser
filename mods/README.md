# mods

Put mod files (`*.js`) here, or clone a repository of mods into a folder here: `*.js` here and at
the top of each folder load in path order when the editor starts. This folder's contents are not
committed (see `.gitignore`), except this file.

- Opened from disk (`web/editor/index.html`): run `python tools/make_mods_list.py` once after
  adding or removing a mod, so the editor knows the file names. (In ComfyUI the node lists them:
  reopen the editor. See `docs/COMFYUI.md`.)
- A file or folder whose name starts with `_` or `.` is skipped (a quick way to turn a mod off).
- Add `?nomods` to the editor's address to start without mods.

How to write a mod: `docs/MODDING.md` (日本語: `docs/MODDING-JA.md`).

MOD は `*.js` をここに置くか、MOD のリポジトリをここに clone すると、エディタの起動時に名前順で読み込まれます。直接開くときは
`python tools/make_mods_list.py` を一度実行してください（ComfyUI では不要：`docs/COMFYUI-JA.md`）。MOD はエディタの中で自由に動くプログラムなので、
信頼できるものだけを入れてください。
