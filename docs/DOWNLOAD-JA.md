# ダウンロード（サーバーなしで使う）

立体人形装置は、ブラウザで https://apps.qwaxgo.com/ODM-Poser/ を開けば、そのまま使えます。
ネットにつながっていないパソコンで使いたいときや、手元に置いておきたいときは、
[Releases](https://github.com/qwaxgo/ODM-Poser/releases) から次のどれかをダウンロードします。

English: [DOWNLOAD.md](DOWNLOAD.md)

| ファイル | 中身 | 向いている使い方 |
|---------|------|----------------|
| `ODM-Poser-v（版）-html.zip` | HTML 版。展開して `index.html` を開くだけ | どの OS でも。ブラウザで使う |
| `ODM-Poser-v（版）-windows-x64.zip` | Windows のアプリ版（インストール不要） | Windows で自分の窓で使う |
| `ODM-Poser-v（版）-linux-x86_64.AppImage` | Linux のアプリ版（1ファイル） | Linux で自分の窓で使う |

どれも中身のエディタは同じです。変更点は各リリースの説明と [CHANGELOG.md](https://github.com/qwaxgo/ODM-Poser/blob/main/CHANGELOG.md) にあります。
ブラウザから「アプリとして追加」する方法（PWA）は [APP-JA.md](APP-JA.md) を見てください。

## HTML 版

1. zip を展開する。
2. 中の `index.html` をダブルクリックして、ブラウザで開く。

サーバーもインストールも要りません。使い方の説明（「使い方」のリンク）は、このサイトのページを開きます。

**MOD を入れる。** 次のどちらかです。

- 隣の `mods` フォルダに MOD の `.js` を入れ、`mods.js` に1行ずつ書く（書き方は `mods.js` の中にあります）
- エディタの MOD の欄で「フォルダから」を押し、`mods` フォルダを選ぶ（Chrome と Edge はフォルダを覚えます。
  次からは「読み込む」を押すだけです）

## Windows のアプリ版

1. zip を展開する。
2. `ODM-Poser.exe` をダブルクリックする。

- **署名のないアプリです。** 初めて起動するとき、Windows が「PC を保護しました」と出すことがあります。
  「詳細情報」を押してから「実行」を押すと起動します。
- 画面の表示に **WebView2 ランタイム** を使います。Windows 11 と新しい Windows 10 には入っています。
  起動しないときは、Microsoft の「WebView2 ランタイム（Evergreen）」を入れてください。
- 書き出した画像やポーズは「名前を付けて保存」の窓で保存先を選びます。
- MOD は exe の隣の `mods` フォルダに入れ、アプリを開き直します。

## Linux のアプリ版（AppImage）

1. 実行できるようにする：`chmod +x ODM-Poser-v（版）-linux-x86_64.AppImage`
2. ダブルクリックするか、端末から起動する。

- MOD は AppImage と同じ場所の `mods` フォルダに入れ、アプリを開き直します。
- 起動しないときは、FUSE（`libfuse2`）が入っているか確かめてください。
  入れられないときは `--appimage-extract-and-run` を付けて起動できます。

## MOD について

MOD はエディタの中で自由に動くプログラムです。信頼できるものだけを入れてください。
作り方は [MODDING-JA.md](MODDING-JA.md) にあります。
