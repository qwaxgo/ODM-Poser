# 更新履歴 / Changelog

立体人形装置（ODM Poser）の変更点です。いちばん上の版が次のリリースで、変更のたびにそこへ書き足します。
リリースするときは、`package.json` の version とこの見出しの版を揃えてタグ `v<version>` を push します
（GitHub Actions がこの版の部分をリリースの説明にします）。

The changes to ODM Poser. The top version is the next release; each change adds a line to it. To
release, tag `v<version>` (the version of `package.json` and of the heading) and push the tag
(GitHub Actions takes that version's part as the release notes).

## v0.2.0

### 日本語

- 肩幅・腰幅を変えても肩・股が上に広がらないように修正：体格モードで肩・股をドラッグすると、最初に動かした向き（左右・上下・前後）だけに動きます。関節の限界もその人物の肩・股の位置を基準にするので、広げた肩がポーズを動かしたときに戻りません
- サイズのタブに「肩の高さ」「肩の前後」「股の高さ」「股の前後」を追加。3軸ハンドルの「変形」でも、肩・股は幅・高さ・前後を別々に変えられます
- 小物の大きさを X・Y・Z の3軸で別々に変えられるように（サイズのタブ、置く前のプレビュー、置いた物の3軸ハンドル）。前の「長さ・太さ」で保存したファイルもそのまま開けます
- 手に持つ物の位置を手の形に合わせるように修正：握る形では柄が指の輪の中に、包む形では掌に、つまむ形では指先の間に来ます。両手持ちのもう片方の手も同じです
- 小物を「単体で置く」：誰にも持たせず、人物の前の床に置けます。床に置いた物はどの人物を編集していても配置モードで動かせます
- 人物ごとに位置（左右・前後）と向きを数値で変えられるように。書き出しで「書き出す人物」を選ぶと、アタリ・OpenPose・構図の画像をその人物だけで書き出せます
- ドキュメントに「ダウンロード」「書き出し」「ポーズを足す」「小物・物体を足す」「ComfyUI で使う」のページを追加。MOD の説明に、手に持つ物の持つ所（`grip`）を追加

### English

- Widening the shoulders or hips no longer lifts them: in Body mode a shoulder or a thigh root moves only the way it was first dragged (across, up / down or forward / back). Joint limits measure from where this figure's shoulders and thigh roots sit, so widened shoulders stay when the pose changes
- Sizes: shoulder height, shoulders forward / back, thigh roots' height and forward / back. With the 3-axis handles' Scale, a shoulder or a thigh root has its width, height and forward / back apart
- A thing's size on its X, Y and Z axes, each on its own (Sizes, the preview before placing, the 3-axis handles of a thing put down). Files saved with the old length / thickness open as before
- Held things sit where the hand shape holds them: a handle inside the curled fingers, a cupped thing against the palm, a pinched thing between the fingertips; the other hand of a two-handed thing too
- "Place on its own": put a thing on the floor in front of the figure, held by no one. Things put down move in Place mode whichever figure is being edited
- Each figure's position (across, forward / back) and direction as numbers. "Figures in the picture" in Export saves the rough, OpenPose and composition pictures with one figure only
- Docs pages: Download, Export, Adding poses, Adding props and objects, Using it in ComfyUI. The mod docs describe where a held prop is held (`grip`)

## v0.1.0

最初のリリースです。 / The first release.

### 日本語

- HTML 版を配布：zip を展開して `index.html` を開くだけで、サーバーなしで使えます。MOD は隣の `mods` フォルダに入れます
- MOD の欄に「フォルダから」：mods フォルダを選ぶと、中の MOD をまとめて読み込みます（Chrome と Edge はフォルダを覚えます）
- アプリ版（Tauri）：Linux は AppImage、Windows は zip（インストール不要）。MOD は実行ファイルの隣の `mods` フォルダに入れ、書き出しは「名前を付けて保存」で保存します
- エディタのヘッダーに版を表示
- ドキュメントのページ（日本語・英語）：アプリとして使う・MOD の作り方。エディタの「使い方」から開けます
- エディタのページを Astro で作るように変更（見た目と動きは同じです）

### English

- The HTML release: unzip it and open `index.html`, no server needed. Mods go in the `mods` folder next to it
- "From a folder" in the MOD panel: pick the mods folder and every mod in it loads (Chrome and Edge remember the folder)
- The app (Tauri): an AppImage for Linux, a zip for Windows (nothing to install). Mods go in the `mods` folder next to the executable; exports are saved through a "save as" dialog
- The editor's header shows its version
- Docs pages (Japanese, English): installing it as an app, writing mods. The editor's "Guide" link opens them
- The editor's page is made with Astro (it looks and works the same)
