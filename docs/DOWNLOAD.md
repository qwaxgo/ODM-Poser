# Download (use it without a server)

ODM Poser works in the browser at https://apps.qwaxgo.com/ODM-Poser/. To use it on a computer
that is not online, or to keep a copy, download one of these from the
[Releases](https://github.com/qwaxgo/ODM-Poser/releases).

日本語: [DOWNLOAD-JA.md](DOWNLOAD-JA.md)

| File | What it is | Good for |
|------|-----------|----------|
| `ODM-Poser-v(version)-html.zip` | The HTML build: unzip it and open `index.html` | Any OS, in the browser |
| `ODM-Poser-v(version)-windows-x64.zip` | The app for Windows (nothing to install) | Its own window on Windows |
| `ODM-Poser-v(version)-linux-x86_64.AppImage` | The app for Linux (one file) | Its own window on Linux |

The editor inside is the same in all of them. Each release lists its changes, as does
[CHANGELOG.md](https://github.com/qwaxgo/ODM-Poser/blob/main/CHANGELOG.md). To install it from the
browser as an app (PWA), see [APP.md](APP.md).

## The HTML build

1. Unzip it.
2. Double-click `index.html` inside: it opens in your browser.

No server and nothing to install. The **Guide** link opens these pages on the site.

**Mods.** Either:

- put the mod's `.js` in the `mods` folder next to it and list it in `mods.js`, one line each (`mods.js`
  says how), or
- press **From a folder** in the editor's MOD panel and pick the `mods` folder (Chrome and Edge remember
  it: next time press **Load**).

## The Windows app

1. Unzip it.
2. Double-click `ODM-Poser.exe`.

- **It is not code-signed.** On its first start Windows may say it protected your PC: press **More info**,
  then **Run anyway**.
- It draws its window with the **WebView2 runtime**, which Windows 11 and recent Windows 10 have. If it
  does not start, install Microsoft's WebView2 Runtime (Evergreen).
- Exported pictures and poses are saved through a "save as" window, where you choose the place.
- Mods go in the `mods` folder next to the exe; open the app again to load them.

## The Linux app (AppImage)

1. Make it runnable: `chmod +x ODM-Poser-v(version)-linux-x86_64.AppImage`
2. Double-click it, or start it from a terminal.

- Mods go in a `mods` folder next to the AppImage; open the app again to load them.
- If it does not start, check that FUSE (`libfuse2`) is installed. Without it, start it with
  `--appimage-extract-and-run`.

## About mods

A mod is a program that runs freely inside the editor: add only the ones you trust. How to write one:
[MODDING.md](MODDING.md).
