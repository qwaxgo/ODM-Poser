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
- 頭の形：サイズのタブの「頭の形」で、幅・高さ・奥行きを伸び縮み（頭身は変わらず）。伸ばした形は「球のまま伸ばす」か「円柱でつなぐ」を選べます
- 角柱・角錐の天面の大きさ（底面に対する %）。角錐を 0% にすると頂点になります
- オーラの「放物線」：炎の先が、根元の底辺中心を原点として放射状に出て、長さが両端へ向けて放物線状に短くなります。原点の高さはスライダーで調整（既定は底辺の中心）
- カメラを初期状態に戻すボタンを、リセットタブにも追加（記憶したカメラと固定は残ります）
- 線の色の欄を作り直し：対象（人物の部位・床・壁・天井・ワイヤー・小物・物体・オーラ）を一覧から選び、色を変えるものにチェックを入れて、色を選ぶか #rrggbb のコードを入力します。固定の色の一覧はなくなりました
- 「クリックで自動的にモードを切り替える」（ポーズの欄）：物を押すと配置モード、人体の関節を押すとポーズモード（配置・カメラから。体格は残す）。このブラウザに残ります
- 物（設置物）の幅・高さ・奥行き・角の数・位置・向き、床と天井の高さ、壁の位置と向き、ワイヤーの支点、人物の位置（castX/Z）、オーラの大きさにもスライダーを付けました（数値欄と連動、ドラッグは取り消し1回分）
- カメラの位置と見る点を、XYZ それぞれスライダーと数値欄で調整できるように（スライダーを動かしても取り消し履歴は1回分）
- スライダーが動かせなかった（幅がなかった）不具合を修正：物体の大きさ・位置・向き・角の数・天面、持つ位置、オーラの大きさ、床・天井・壁・ワイヤー、人物の位置。2列の欄の中のスライダーは2列分の幅を使います
- 公開サイトを更新したとき、ブラウザに残った古いスクリプト・CSS が使われないように：読み込みにビルドごとの印を付け、アプリ（PWA）のサービスワーカーは毎回サーバーで新しさを確かめます（オフラインでは今までどおり開けます）
- 操作欄の位置・メニューの側・操作欄をしまう設定を、縦画面と横画面で別々に覚えるように。画面の向きを変えると、その向きの設定（初めては初期値）に切り替わります
- 縦のタブレットと PC の縦モニター：キャンバスを画面の 50〜85%（既定 60%、境目のドラッグで調整）に取り、残りに、画面の端から順に分類バー（作る・見る・出す・ODM-Poser について）、カテゴリーの行、タブの行、選んだタブの欄（横に並べてスクロール、スライダーは縦型）を置きます。分類バーとメニューは、バーの「⇅ 上下」で画面の下か上かを切り替えられます（このブラウザに残ります）
- 両手持ちの武器：利き手（右手・左手）を装備の欄で切り替えられます。持つ手を動かしても武器が手を支点に回らず、もう片方の手が向きを保って付いてくるように
- 3軸ハンドル：左側のメニューの「3軸ハンドル」を押すと出て、「解除」で隠します（右側の欄のコピーは削除）。掴んだ軸は太く強調され、ドラッグはその軸だけに動きます
- 身長と頭身の欄を体格タブにも出しました（頭身は直接入力可）
- 線の色は、色見本の横に #rrggbb の色コードを入力できるように
- 出ている小物を設置タブの「選んだ物を接地させる」で接地（持っている物は床に置く）
- 武器を背負ったときの位置を直しました：背中の中心線の近くに、肩から腰にかけて収まるように（以前は腰の下へ垂れ、背中から離れていました）
- マウスホイールは既定でカメラの拡大縮小に（人体の部位の上での体格モードは従来どおり太さ）。パース（レンズ）の変更は Ctrl＋Alt＋ホイール
- SNS 投稿欄：Misskey.io と Misskey.dev のボタンを追加（Misskey.io を既定に）。Facebook・Instagram・LINE・Discord・Reddit を主要ボタンに
- 長柄（槍・薙刀・ハルバード・棍）と棒は、装備の「持ち方」で握るかカウチ（脇に挟む）を選べます。手で持つ小物はすべて、「持つ位置」で握る場所を柄に沿ってずらせて、「↺ 持ち方と持つ位置を戻す」で初期値に戻せます。「棒（ただの棒）」を追加
- 大型ランスとガンランスを直しました：柄を細く（太さ 10cm → 4.4cm）、持たせると脇に挟んで前へ突き出す構え（カウチ）に。ガンランスは銃剣を付けた銃の形に（銃床・銃身・銃剣、片手で持つ）
- 色を初期状態に戻すボタン（「色」のタブの上）と、色の記憶（名前をつけて保存・呼び出し・削除。このブラウザに残ります）を追加。記憶するのは線・床・壁・天井・ワイヤーの色で、小物・物体・オーラの色は含みません
- スマホ・縦のタブレットの画面を作り直し：キャンバスを画面いっぱいに出し、下の分類バー（作る・見る・出す・ODM-Poser について）から、タブを選ぶと操作の欄が画面いっぱいのシートで立ち上がり、その上に人物の簡略表示が固定されて出ます（操作の欄だけがスクロールします）。つまみを下へドラッグするかタップすると閉じます。タイトル・版・リンクは「ODM-Poser について」へ。横画面とPCは今のまま
- 開発用の端末表示（`npm run dev` の /ODM-Poser/dev/phone/ と /dev/tablet/）：VS Code のブラウザの中で、スマホ・タブレットの枠に編集画面を入れて確かめられます（本番サイトには出ません）
- 人体のリセットを「作る › 人物 › リセット」に一箇所にまとめました：この人物を全部・性別の初期値・ポーズだけ・体格だけ・位置と向きだけ、付随物、すべて。ポーズ・体格・位置・性別の各タブの同じボタンは外しました
- 「人物の管理」に「付随物のリセット」：持ち物・身に着けた物、オーラ、ワイヤー、関節の固定のうちチェックしたものを、まとめて外すか、付けたまま大きさ・色・向き・位置・ワイヤーの高さを初期値に戻せます
- 「ComfyUI で使う」のページを新しいブリッジに合わせて更新：エディタ本体（HTML 版）がブリッジに同梱されるので、入れるときと更新するときにサブモジュールの手順は要りません
- 書き出したファイル（画像・ポーズのファイル）の利用条件を CC0 1.0 に：商用・加工・AI の学習や生成への利用も自由で、クレジットは任意です。ドキュメントに「ライセンス・利用条件」のページを追加し、書き出しのタブ・ドキュメントの下・README・リリースの zip にも載せました（ツール自体は今までどおり MIT）
- 小物の部位ごとの長さ：剣の柄と刀身、斧の柄と頭、銃の銃床と銃身など、部位を選んでその長さだけを変えられます（「サイズ」のタブの「小物の部位ごとの長さ」。選んだ部位は図で太く表示）。部位を伸ばすとその先も一緒に動き、持つ所・両手持ちのもう片方の手・銃剣も合わせて動きます。組み込みの武器 32 種に部位を付け、MOD の小物も `segs`・`segAxis`・`segAnchor` で部位を持てます
- スマホの図の上にあった「Shift・固定・元に戻す・やり直す・側面図・カメラパッド」の列をなくし、PC と同じ場所に：元に戻す・やり直すは図の左上、側面図・カメラパッドは図の右上の切り替え、Shift・固定は図の左（3軸ハンドルの下）のアイコンに
- 図の左の列が図の高さに入りきらないとき（スマホの分割表示など）、3軸ハンドルの切り替えと Shift・固定を2列目に並べるように
- 図の右上の切り替えがスクロールするとき、上下の端に ▲ ▼ を出すように（押すとスクロール）
- 図の左上・右上のボタンを、正面の図だけでなく側面図も含めた図全体の角に置くように（PC・スマホとも）
- 図と操作欄の境目のつまみをドラッグして、広さを変えられるように（PC の横並び、スマホの分割表示の縦・横。ダブルクリックで戻す。このブラウザに残ります）
- スマホでも側面図を上・下・左・右に置けるように（幅が狭いときは置き場所のボタンを1つにまとめ、押すとほかが開く）
- 「操作欄」「分割表示」のアイコンを、いまの画面で操作欄が出る場所（縦のスマホなら下）・分ける向きの絵に

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
- The head's shape: width, height and depth stretch (the head count stays); the stretched shape is a ball or a cylinder joining the ends
- A prism's or pyramid's top size (a share of the base); a pyramid at 0% is a point
- The aura's parabola: the flame tips point away from the bottom centre of the base, and their length falls off in a parabola toward the ends; the origin height is a slider (default: the base's centre)
- A "Camera to the start" button in the Reset tab too (saved cameras and the lock stay)
- The line colours: pick the object from a list (the figure's parts, floor, walls, ceiling, wire, things, solids, auras), check what to change, then pick a colour or type #rrggbb. The fixed list is gone
- Click to switch mode (in the Pose tab): a press on a thing goes to Place, a press on the body to Pose (from Place or Camera; Body stays). Kept in this browser
- Sliders beside the numbers of objects (size, sides, position, turn), the floor and ceiling heights, the wall, the wire's height, the figure's place and the aura size (linked with the number; a drag is one undo step)
- The camera's position and look point: X, Y and Z each with a slider and a number (a slider drag is one undo step)
- Sliders that could not move (no width) fixed: the objects' size, place, turn, sides and top, where a thing is held, the aura size, the floor, ceiling, wall and wire, the figure's place. A slider in a two-column grid takes both columns
- After the site is updated, browsers no longer run older kept scripts and styles: each load carries the build's mark, and the app's (PWA) service worker asks the server each time (offline it still opens)
- The panel's place, the menu's side and the panel put away are kept apart for an upright and a sideways screen: turning the screen brings that way's own (the defaults the first time)
- Upright tablets and tall monitors: the views take 50-85 % of the height (60 % by default, set by dragging the edge); the rest, from the screen's edge inward, holds the category bar (Make, View, Output, About ODM-Poser), the categories' row, the tabs' row and the tab's controls side by side (scrolling sideways, sliders upright). The bar and the menu go at the bottom or the top (the bar's ⇅ button; kept in this browser)
- Two-handed weapons: the main hand (right or left) is chosen in the Equip tab. Moving the holding hand no longer swings the weapon about it: the other hand follows and the weapon keeps its direction
- The 3-axis handles: the 3軸ハンドル button on the left turns them on and 解除 off (the copies in the panel are gone). The axis taken is drawn heavier, and a drag moves along that axis only
- The height and heads are in the Body tab too (heads can be typed)
- The line colours take a #rrggbb code beside each colour
- The things out: 選んだ物を接地させる in the Objects tab puts the chosen one on the ground (a held one is put on the floor)
- A weapon carried on the back sits just off the spine, from the shoulders to the hips (it used to hang below the hips, away from the back)
- The mouse wheel zooms the camera by default (in body mode over a part it still changes that part's thickness); the lens (perspective) is Ctrl + Alt + wheel
- Share panel: Misskey.io and Misskey.dev buttons (Misskey.io by default); Facebook, Instagram, LINE, Discord and Reddit are main buttons
- Long weapons (spears, polearms, staffs) and sticks: a choice of Grip or Couched in the Equip tab (Way of holding). Every thing held: its grip can slide along it (Where it is held), and ↺ Way of holding and place to the start puts both back. A plain stick is added
- Huge lance and gun lance: the shaft is thinner (10 cm to 4.4 cm across) and held couched by default (under the arm, thrust forward). The gun lance is now a rifle with a bayonet fixed (stock, barrel, blade; held one-handed)
- A "Colours to the start" button at the top of the Colours tab, and saved colours (save under a name, load, delete; kept in this browser). They keep the lines, floor, walls, ceiling and wire; things, solids and auras keep their own colours out of them
- Phones and upright tablets get a new layout: the views fill the screen, a bar at the bottom (Make, View, Output, About ODM-Poser) opens a tab's controls as a full-screen sheet with a simplified view of the figure fixed at its top (only the controls scroll). Drag the grip down or tap it to close. The title, version and links are under About ODM-Poser. Sideways and on computers, the layout is as before
- A development device frame (`npm run dev`, /ODM-Poser/dev/phone/ and /dev/tablet/): the editor in a phone or tablet frame, to look at the phone layout in VS Code's browser (not in the site)
- All the figure's resets are in one tab, Reset (Figure menu): the whole figure, its sex's default, its pose only, its body only, its place and turn only, the attached things, and everything. The same buttons in the Pose, Body and Place tabs are gone
- "Reset what the figure has" in Figures: for the kinds ticked (held and worn things, auras, the wire, pinned joints), take them all off, or keep them and put their size, colour, turn, place and the wire's height back
- The "Using it in ComfyUI" page follows the reworked bridge: the editor (its HTML build) comes inside the bridge, so installing and updating need no submodule steps
- Exported files (pictures and pose files) are under CC0 1.0: use them commercially, change them, use them with AI for training or generation; credit is optional. A "License and terms of use" docs page, linked from the Export tab, the docs' footer, the README and the release zips (the tool itself stays MIT)
- A thing's sections, each its length: a sword's grip and blade, an axe's grip and head, a gun's stock and barrel ... choose a section and change its length alone (Sizes › A thing's sections, each its length; the chosen one is drawn heavier). What lies beyond moves along, and so do the grip, the other hand of a two-handed thing and a bayonet. 32 built-in weapons have sections; a mod's props can have them with `segs`, `segAxis` and `segAnchor`
- The row of keys above the view on phones (Shift, Pin, Undo, Redo, Side view, Camera pad) is gone, each where the computer has it: Undo and Redo at the view's top left, Side view and Camera pad among the switches at the top right, Shift and Pin as icons on the left under the 3-axis handles' tools
- When the left column does not fit the view's height (a phone's split screen ...), the handles' tools and Shift / Pin go to a second column
- When the switches at the top right scroll, ▲ ▼ show at their ends (a tap scrolls)
- The buttons on the top corners sit on the corners of the views as a whole, the side view included (computers and phones)
- Drag the grip on the edge between the views and the panel to give either more room (side by side on a computer, a phone's split screen upright or sideways; a double click puts it back; kept in this browser)
- The side view can go above, below, left or right on a phone too (narrow, its place buttons fold into one that opens the others)
- The "Panel" and "Split screen" icons picture where the panel comes out on this screen (below on an upright phone) and the way the screen splits

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
