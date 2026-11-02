# 更新履歴 / Changelog

立体人形装置（ODM Poser）の変更点です。いちばん上の版が次のリリースで、変更のたびにそこへ書き足します。
リリースするときは、`package.json` の version とこの見出しの版を揃えてタグ `v<version>` を push します
（GitHub Actions がこの版の部分をリリースの説明にします）。

The changes to ODM Poser. The top version is the next release; each change adds a line to it. To
release, tag `v<version>` (the version of `package.json` and of the heading) and push the tag
(GitHub Actions takes that version's part as the release notes).

## v0.1.0

最初のリリースです。 / The first release.

### 日本語

- HTML 版を配布：zip を展開して `index.html` を開くだけで、サーバーなしで使えます。MOD は隣の `mods` フォルダに入れます
- MOD の欄に「フォルダから」：mods フォルダを選ぶと、中の MOD をまとめて読み込みます（Chrome と Edge はフォルダを覚えます）
- エディタのヘッダーに版を表示
- ドキュメントのページ（日本語・英語）：アプリとして使う・MOD の作り方。エディタの「使い方」から開けます
- エディタのページを Astro で作るように変更（見た目と動きは同じです）

### English

- The HTML release: unzip it and open `index.html`, no server needed. Mods go in the `mods` folder next to it
- "From a folder" in the MOD panel: pick the mods folder and every mod in it loads (Chrome and Edge remember the folder)
- The editor's header shows its version
- Docs pages (Japanese, English): installing it as an app, writing mods. The editor's "Guide" link opens them
- The editor's page is made with Astro (it looks and works the same)
