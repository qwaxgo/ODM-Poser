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
- 肩の高さを変えると首と頭も一緒に上下するように。首は肩の上面（両肩の真ん中）から描きます
- 「この人物を性別の初期値に戻す」（体格）：編集している人物のポーズ・体格・手の形・向きを、女性・男性（最後に選んだ方）の初期状態に戻します。位置と持ち物はそのままです
- モードごとに使える操作を分けました：ポーズでは「回転」と手足の「移動」だけ、体格では「変形」だけ（ドラッグ・タッチ・3軸ハンドルとも）。使えないボタンは灰色になり、使える操作に切り替わります。人物全体を動かす・回すのは配置モードで腰から
- 3軸ハンドルの「回転」を、選んだ関節を中心にその先を回すように修正（肘なら前腕）。輪も選んだ関節に出ます
- 3軸ハンドルを出しているときは、関節や物をドラッグしても動かず選ぶだけに（動かすのはハンドル）
- 図の左上のモード「パース」を「カメラ」に、「横の図」を「側面図」に名前を変更
- 腕・脚の太さを部位ごとに連動（肩〜手首、股〜足首をまとめて）。体格の「腕・脚の太さを部位ごとに連動」で関節ごとにもできます
- ポーズのプリセットで体格が元に戻らないように。「ポーズ・小物・位置の記憶」と「体格プリセット」（標準・女性・男性と、自分で記憶した体格）を別々に記憶・呼び出しできます
- 身長・脚の長さなど体の大きさを変えたとき、足元（いちばん低い所）を支点に伸び縮みするように
- 小物の「単体で置く」を「設置」のタブ（小物を単体で置く）へ移動。単体で置いた物の一覧から外す・持たせることもできます
- ワイヤーで手・足首を吊ると、腕を上げる・逆さになるなど、ぶら下がれるポーズに自動でなるように（「ぶら下がるポーズにする」）。蔓などに片手・片足でつかまって「ぶら下がる」を押したときも同じです
- ワイヤーの「両手でロープ（ターザン）」と、ポーズのプリセット「ロープにつかまる（ターザン）」を追加
- カメラが時々動かなくなる不具合を修正：タッチの指が離れたことが伝わらないと、それ以後のタッチがすべて2本指の操作になっていました。マウスでも、何もない所をドラッグするとカメラが回るように（Shift＋ドラッグで動かす）
- 図の右上の「操作欄」ボタンが分割表示で効かなかったのを修正し、左上の「操作欄を隠す」ボタンを削除
- 「人物」のメニューの全身図の下に「人物の管理」：人物の切り替え・追加・複製・削除と、持ち物・身に着けた物の一覧（装備のタブを開く・外す）
- 「人物の管理」に「付随物のリセット」：持ち物・身に着けた物、オーラ、ワイヤー、関節の固定のうちチェックしたものを、まとめて外すか、付けたまま大きさ・色・向き・位置・ワイヤーの高さを初期値に戻せます
- 「ComfyUI で使う」のページを新しいブリッジに合わせて更新：エディタ本体（HTML 版）がブリッジに同梱されるので、入れるときと更新するときにサブモジュールの手順は要りません

### English

- Widening the shoulders or hips no longer lifts them: in Body mode a shoulder or a thigh root moves only the way it was first dragged (across, up / down or forward / back). Joint limits measure from where this figure's shoulders and thigh roots sit, so widened shoulders stay when the pose changes
- Sizes: shoulder height, shoulders forward / back, thigh roots' height and forward / back. With the 3-axis handles' Scale, a shoulder or a thigh root has its width, height and forward / back apart
- A thing's size on its X, Y and Z axes, each on its own (Sizes, the preview before placing, the 3-axis handles of a thing put down). Files saved with the old length / thickness open as before
- Held things sit where the hand shape holds them: a handle inside the curled fingers, a cupped thing against the palm, a pinched thing between the fingertips; the other hand of a two-handed thing too
- "Place on its own": put a thing on the floor in front of the figure, held by no one. Things put down move in Place mode whichever figure is being edited
- Each figure's position (across, forward / back) and direction as numbers. "Figures in the picture" in Export saves the rough, OpenPose and composition pictures with one figure only
- Docs pages: Download, Export, Adding poses, Adding props and objects, Using it in ComfyUI. The mod docs describe where a held prop is held (`grip`)
- Raising or lowering the shoulders takes the neck and head with them; the neck is drawn from the shoulders' top (their middle)
- "This figure back to its sex's default" (Body): the figure being edited gets the default pose, body, hands and turn of its sex (female / male, as last chosen); where it stands and what it holds stay
- Each mode has its own tools: Pose has Rotate and Move for the arms and legs only, Body has Scale only (dragging, touch and the 3-axis handles alike). The other buttons are greyed out and the tool switches to one the mode has. The whole figure is moved and turned by its hips in Place mode
- The 3-axis handles' Rotate turns what lies beyond the selected joint about it (the elbow: the forearm), its rings on that joint
- While the 3-axis handles show, dragging a joint or a thing only selects it (the handles move it)
- The views' modes: "Perspective" is now "Camera"; the "side view" is named 側面図 in Japanese
- Thickness of an arm (shoulder to wrist) or a leg (thigh root to ankle) changes as a whole; "Arm and leg thickness as a whole limb" in Body turns it off
- A pose preset no longer resets the body. "Pose, things and place: saved" and "Body presets" (Standard, Female, Male and your own) are saved and loaded apart
- Changing the height, the legs' length and other sizes grows the body from its lowest point (the feet stay)
- "Place on its own" moved to the Objects tab (Things on their own), with a list to take them away or give them to the figure
- Hung from the wire by a hand or an ankle, the body takes a pose it could hang in (the arm up, upside down ...; "Take a hanging pose"); so does "Hang" when one hand or one foot holds a vine or the like
- The wire's "Both hands on a rope (Tarzan)" and the pose preset "Holding a rope (Tarzan)"
- The camera sometimes stopped responding: a finger whose lifting was never told made every later touch a two-finger gesture. A mouse drag on empty space now turns the camera too (Shift: pans)
- The "Panel" button at the view's top right works in split screen; the "Hide the panel" key at the top left is gone
- "Figures" under the body map in the Figure menu: switch, add, copy and delete figures, and what the figure holds and wears (open it in Equip, take it off)
- "Reset what the figure has" in Figures: for the kinds ticked (held and worn things, auras, the wire, pinned joints), take them all off, or keep them and put their size, colour, turn, place and the wire's height back
- The "Using it in ComfyUI" page follows the reworked bridge: the editor (its HTML build) comes inside the bridge, so installing and updating need no submodule steps

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
