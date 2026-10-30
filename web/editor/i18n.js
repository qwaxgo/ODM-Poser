// Japanese / English for the editor. The page is written in Japanese; in English mode every
// text node, placeholder and title (also the ones the editor adds later) and the canvas
// labels are shown through this table and the rules below. The choice is kept in this browser.
(() => {
  const KEY = "odm-poser-lang";
  const T = {
    // header, modes, views
    "立体人形装置": "",                         // the header shows "ODM Poser — Omni-Directional Mannequin Poser" after it
    "線と丸の全身アタリを、疑似3Dで動かします。アタリ画像・OpenPose 画像・ポーズ（JSON）を書き出せます。":
      "Pose a full-body rough of lines and circles in pseudo 3D. Export the rough, an OpenPose picture and the pose (JSON).",
    "ポーズ（骨の長さを保つ）": "Pose (bone lengths kept)",
    "体格（長さ・太さを変える）": "Body (lengths and thickness)",
    "パース（カメラとレンズ）": "Perspective (camera and lens)",
    "人間の関節の限界": "Human joint limits",
    "正面（カメラ）": "Front (camera)",
    "横から（奥行き）": "Side (depth)",
    "身長": "Height",
    "丸をドラッグ：関節を動かす（骨の長さは保たれ、寄せた分だけ手前／奥へ傾く）。手首・足首は腕・脚ごと届く（Shift＋ドラッグでその骨だけ）。ダブルクリック：その骨の手前と奥を入れ替える。Alt＋クリック：その関節を固定（ピン。固定した手足は他を動かしても動かない）。腰の丸：全体を動かす。横の図でドラッグ：奥行きを直接動かす。ホイール：拡大縮小。Ctrl+Z：元に戻す。":
      "Drag a circle: move the joint (bone lengths are kept; pulling it in tilts the bone toward or away from you). A wrist or ankle brings its whole arm or leg (Shift+drag: that bone only). Double-click: flip the bone toward / away from the camera. Alt+click: pin the joint (a pinned hand or foot stays when the rest moves). The hip circle moves the whole figure. Drag in the side view: move depth directly. Wheel: zoom. Ctrl+Z: undo.",
    "丸をドラッグ：その骨を伸ばす／縮める（先の部分ごと動く）。丸の上でホイール：丸（太さ）を大きく／小さく。左右対称にチェックすると反対側も同じに変わります。":
      "Drag a circle: lengthen / shorten that bone (what follows moves with it). Wheel over a circle: make it (the thickness) bigger / smaller. With symmetry on, the other side changes too.",
    // presets
    "プリセット": "Presets", "読み込む": "Load", "左右反転": "Mirror", "元に戻す": "Undo",
    "立ち（標準）": "Standing", "Aポーズ": "A-pose", "Tポーズ": "T-pose", "コントラポスト": "Contrapposto",
    "歩く": "Walking", "走る": "Running", "椅子に座る": "Sitting on a chair", "しゃがむ": "Squatting",
    "ジャンプ（バンザイ）": "Jump (arms up)", "ファイティングポーズ": "Fighting stance", "腰に手": "Hands on hips",
    "ユーザープリセット（": "User presets (", "）": ")", "このポーズにする": "Use this pose", "ランダム": "Random",
    "骨の向きだけを取り込み、体格はそのままです。一覧はダブルクリックでも読み込めます。ファイルから読むと、一覧は選んだファイルの内容に置き換わります（形式は README の「ユーザープリセット」）。":
      "Only the bones' directions are taken; the body stays as it is. Double-click a row to load it too. Loading from files replaces the list with the chosen files' contents (format: \"User presets\" in the README).",
    "ファイルから読込": "Load from files",
    "すべての分類": "All groups",
    "検索：日本語でも英語でも（例：キック / kick、座る / sit）": "Search in Japanese or English (e.g. kick / キック, sit / 座る)",
    // body
    "体格": "Body", "女性の体格": "Female build", "男性の体格": "Male build",
    "ポーズはそのままで、骨の長さ・肩幅・腰幅・ウエストを入れ替えます（女性 158cm／男性 171cm）。":
      "Keeps the pose and swaps bone lengths, shoulder, hip and waist widths (female 158 cm / male 171 cm).",
    "身長（立ったとき）": "Standing height", "左右対称": "Symmetric", "全体の大きさ": "Overall size",
    "頭の大きさ": "Head size", "太さ（丸の大きさ）": "Thickness (circle size)",
    // selected joint
    "選んだ関節：": "Selected joint: ", "（丸をクリック）": "(click a circle)",
    "この関節を固定する（ピン。Alt＋クリックでも）": "Pin this joint (or Alt+click)",
    "この腕の手の形": "Hand shape of this arm", "右手の形": "Right hand shape", "左手の形": "Left hand shape",
    "前後（＋前へ）": "Forward / back (+ forward)", "左右（＋外へ、胴・首・頭は人物の左へ）": "Sideways (+ outward; torso, neck, head: to the figure's left)",
    "左右（＋外へ）": "Sideways (+ outward)", "ねじり（骨を軸に先を回す）": "Twist (turns what follows about the bone)",
    "骨の長さ": "Bone length", "丸の大きさ（半径）": "Circle size (radius)",
    "位置：左右（＋人物の左）": "Position: sideways (+ figure's left)", "位置：上下": "Position: up / down",
    "位置：前後（＋前）": "Position: forward / back (+ forward)", "体の向き": "Body direction",
    "体の前後の傾き（＋前へ）": "Body lean forward / back (+ forward)", "体の左右の傾き": "Body lean sideways",
    "ドラッグした結果がここの数値になります。数値やバーで動かすこともできます。":
      "Dragging shows up here as numbers; the numbers and sliders move the joint too.",
    "腰の前屈・後屈（＋前へ）": "Waist bend (+ forward)", "腰の横への傾き": "Waist side bend", "腰のひねり": "Waist twist",
    "胸の前屈・後屈（＋前へ）": "Chest bend (+ forward)", "胸の横への傾き": "Chest side bend", "胸のひねり": "Chest twist",
    "首の前後（＋前へ）": "Neck forward / back (+ forward)", "首の左右の傾き": "Neck side tilt", "首のひねり（顔も回る）": "Neck twist (the face turns too)",
    "うなずく（＋下を向く）": "Nod (+ look down)", "首をかしげる（＋人物の左へ）": "Tilt the head (+ to the figure's left)",
    "左右を向く（＋人物の左を向く）": "Turn left / right (+ to the figure's left)",
    "肩を前へ・後ろへ": "Shoulder forward / back", "肩をすくめる・下げる": "Shrug / drop the shoulder", "肩のひねり": "Shoulder twist",
    "腕を前・上へ上げる（＋前へ）": "Raise the arm forward / up (+ forward)", "腕を横へ上げる（＋外へ）": "Raise the arm sideways (+ outward)",
    "腕のひねり（内・外へ回す）": "Arm twist (inward / outward)", "肘の曲げ（前腕の前後）": "Elbow bend (forearm forward / back)",
    "前腕の左右": "Forearm sideways", "前腕のひねり（手のひらの向き）": "Forearm twist (palm direction)",
    "股の位置（前後）": "Hip joint position (forward / back)", "股の位置（左右）": "Hip joint position (sideways)", "骨盤のひねり": "Pelvis twist",
    "脚を前・後ろへ（＋前へ）": "Leg forward / back (+ forward)", "脚を横へ開く（＋外へ）": "Open the leg sideways (+ outward)",
    "脚のひねり（つま先の向き）": "Leg twist (toe direction)", "膝の曲げ（すねの前後）": "Knee bend (shin forward / back)",
    "すねの左右": "Shin sideways", "すねのひねり": "Shin twist", "足首の上下（つま先）": "Ankle up / down (toes)",
    "足首の左右": "Ankle sideways", "足のひねり": "Foot twist",
    // props and scene
    "小物・環境（シミュレーション）": "Props and scene (simulation)", "種類": "Kind",
    "右手に持つ": "Hold in the right hand", "左手に持つ": "Hold in the left hand", "置く": "Place",
    "出ている物": "In the scene", "外す": "Remove", "体を合わせる": "Fit the body", "逆手にする": "Reverse grip",
    "両手持ち": "Both hands", "大きさ": "Size", "回転（前後に倒す）": "Rotate (tip forward / back)",
    "回転（ひねる）": "Rotate (twist)", "回転（横に倒す）": "Rotate (tip sideways)", "ずらす（左右）": "Shift (sideways)",
    "ずらす（上下）": "Shift (up / down)", "ずらす（前後）": "Shift (forward / back)",
    "床・壁・天井": "Floor, wall, ceiling", "床": "Floor", "天井": "Ceiling", "壁": "Wall", "壁（奥行き）": "Wall (depth)",
    "壁の向き": "Wall direction", "接地": "Grounding", "しない（宙に浮ける）": "Off (can float)",
    // (grounding options: see the solids block)
    "書き出すアタリにも床・壁を描く": "Draw floor and walls in the exported rough",
    "床に着ける": "Put on the floor", "壁に着ける": "Put on the wall", "天井に着ける": "Put on the ceiling",
    "近くの物につかまる": "Grab the nearest thing", "ぶら下がる": "Hang", "人物を画面の中心に": "Center the figure",
    "届かないときは体ごと寄せる": "Move the body when out of reach",
    "関節（手首・足首・膝・肘・腰）を選んでから押します。着けた所・つかんだ所は固定（ピン）になり、ほかを動かしても離れません。":
      "Select a joint (wrist, ankle, knee, elbow or hips) first. What is put or grabbed gets pinned and stays when the rest moves.",
    "ワイヤーアクション": "Wire action", "ワイヤーで吊る": "Hang from a wire", "吊る所": "Hanging point",
    "胸（ハーネス）": "Chest (harness)", "右足首（逆さ吊り）": "Right ankle (upside down)", "支点の高さ": "Anchor height",
    "オンにした時の位置の真上に支点ができます。腰をドラッグすると、ワイヤーの長さを保ったまま振れます。":
      "The anchor is set straight above where the figure is when you turn this on. Dragging the hips swings the figure on the wire.",
    "置くと体を合わせる（座る・乗る・手を置く）": "Placing it fits the body (sit, ride, rest the hands)",
    "置いてから、手足でつかまる": "Place it, then grab it with a hand or foot", "床に置く": "Placed on the floor",
    "体の前に構える（両手は自動で合わせる）": "Held in front of the chest (both hands follow)",
    "板は体の左右方向（横乗り）": "the board runs across the body (sideways stance)",
    "胸に構える。右手で弦、左手でネック": "held at the chest: right hand on the strings, left on the neck",
    "左肩にあご当て。右手で弓": "chin rest on the left shoulder; the right hand holds the bow",
    "口元から右へ": "from the mouth to the right",
    // things worn, carried, put down; effects and auras (pose_scene.js, pose_style.js)
    "背負う": "Carry on the back", "床・物体に置く": "Put down (floor / object)", "手に持つ・身に着ける": "Hold / wear again",
    "接地させる": "Ground it", "銃剣を付ける": "Fix a bayonet", "線の色を変える": "Own line colour", "身に着ける": "Wear",
    "置いた物は配置モードでドラッグして動かせます（Shift＋ドラッグで上下、ホイールで向き）。":
      "Things put down can be dragged in the Place mode (Shift+drag: up and down, wheel: turn).",
    "背負いました。": "Carried on the back.", "床・物体の上に置きました。配置モードでドラッグして動かせます。":
      "Put down on the floor / an object. Drag it in the Place mode.", "持たせました（手の形も合わせました）。": "Held again (the hand shape follows).",
    "接地させました。": "Grounded.", "直径": "Diameter", "長さ": "Length", "底の直径": "Base diameter", "底の一辺": "Base side",
    "外径": "Outer diameter", "太さ": "Thickness",
    "前腕の向きに突き出す（大盾と組み合わせる）": "thrust along the forearm (pair it with a great shield)",
    "前腕の向きに突き出す、銃身のある槍": "a lance with a gun barrel, thrust along the forearm",
    "身の丈ほどの、幅広く厚い刃": "a wide, thick blade as tall as a person",
    "腰だめに両手で持ち、左手は上の取っ手": "held at the hip with both hands, the left on the top handle",
    "前腕にはめる筒形の砲（手は中で握る）": "a cannon worn over the forearm (the hand grips inside)",
    "腰だめか、伏せて撃つ大きさ": "big enough to fire from the hip or lying down", "親指でボタンを押す": "the thumb presses the button",
    "指先の向きに伸びる光の刃": "a blade of light along the fingers", "伸ばした取っ手を持つ": "held by the pulled-out handle",
    "両手で左右の縁を持つ": "both hands hold the rims", "両足に板、両手にストック": "skis on both feet, poles in both hands",
    "線の色": "Line colours", "胴体": "Torso", "右腕": "Right arm", "左腕": "Left arm", "右脚": "Right leg", "左脚": "Left leg",
    "床・壁・天井": "Floor, walls, ceiling", "ワイヤー": "Wire", "すべて既定の色に戻す": "Reset all colours",
    "チェックした部位だけ色が変わります（書き出すアタリ画像にも）。小物と物体の色は、それぞれの欄で変えます。":
      "Only the ticked parts change colour (in the exported rough too). Props and objects have their own colour in their panels.",
    "オーラ・気をまとう": "Auras", "部位": "Part", "色": "Colour", "まとう": "Put on", "まとっているオーラ": "Auras worn",
    "選んだオーラは、上の欄（部位・種類・大きさ・色）を変えると変わります。炎と光は人物の後ろに、プラズマは前に描きます。":
      "Changing the fields above (part, kind, size, colour) changes the selected aura. Flames and glow are drawn behind the figure, plasma in front.",
    "全身": "Whole body", "上半身": "Upper body", "両腕": "Both arms", "両手（拳）": "Both hands (fists)", "右手（拳）": "Right hand (fist)",
    "左手（拳）": "Left hand (fist)", "両脚": "Both legs",
    "気（炎のように立ちのぼる）": "Ki (rising like flames)", "オーラ（なめらかな光）": "Aura (smooth glow)", "プラズマ（電撃）": "Plasma (lightning)",
    // the MOD panel (pose_api.js)
    "読み込んだ MOD はありません。": "No mods loaded.", "MODファイルを読み込む（今回だけ）": "Load mod files (this session only)",
    "mods フォルダ（とその中のフォルダ）の *.js を起動時に読み込みます（ブラウザで直接開くときは、tools/make_mods_list.py で一覧を作ります）。「ファイルから入れる」と「URLから追加」の MOD はこのブラウザに保存され、毎回読み込まれます（mods フォルダのないサイトやスマホでも使えます。URL の MOD は毎回新しい版を読み、オフラインでは前回のものを使います）。MOD はエディタの中で自由に動くプログラムなので、信頼できるものだけを入れてください。アドレスの末尾に ?nomods を付けると MOD なしで開きます。":
      "The *.js files in mods/ (and its folders) load at start (opened straight from disk, run tools/make_mods_list.py to list them). Mods installed from a file or added by URL are kept in this browser and load every time (also on a site without a mods folder, or on a phone; a URL mod is read fresh each time and its last copy is used offline). A mod is a program that can do anything inside the editor: install only mods you trust. Add ?nomods to the address to start without mods.",
    "この端末に入れた MOD": "Mods kept in this browser", "まだありません。": "None yet.", "ファイルから入れる（この端末）": "Install from a file (this device)",
    "今回だけ読み込む": "Load for this session only", "URLから追加": "Add by URL", "https://…/mod.js（GitHub のファイルのページでも可）": "https://…/mod.js (a GitHub file page works too)",
    "このブラウザには MOD を保存できません（今回だけ読み込みます）。": "This browser cannot keep mods (loaded for this session only).",
    "MOD を入れ替えました。開き直すと新しい版になります。": "Mod replaced; reopen the editor for the new version.",
    "MOD をこの端末に入れました。次からは自動で読み込みます。": "Mod installed on this device; it loads automatically from now on.",
    "https:// で始まる MOD のアドレスを入れてください。": "Enter a mod address starting with https://.",
    "このブラウザには MOD を保存できません。": "This browser cannot keep mods.", "MOD を追加しました。次からは自動で読み込みます。": "Mod added; it loads automatically from now on.",
    "このブラウザには保存できません。": "This browser cannot keep them.", "有効": "On",
    "有効にしました。開き直すと読み込みます。": "Turned on; it loads when the editor is reopened.",
    "無効にしました。開き直すと読み込まれません。": "Turned off; it will not load when the editor is reopened.",
    "外しました。開き直すと読み込まれません。": "Removed; it will not load when the editor is reopened.",
    // theme, the composition picture, figures (index.html, pose_cast.js)
    "表示：自動": "Theme: auto", "表示：ライト": "Theme: light", "表示：ダーク": "Theme: dark",
    "比率": "Aspect ratio", "自由（幅と高さを直接）": "Free (width and height)", "1:1（正方形）": "1:1 (square)",
    "3:4（縦）": "3:4 (portrait)", "4:3（横）": "4:3 (landscape)", "2:3（縦）": "2:3 (portrait)", "3:2（横）": "3:2 (landscape)",
    "9:16（縦・スマホ）": "9:16 (portrait, phone)", "16:9（横・動画）": "16:9 (landscape, video)",
    "A判・B判（縦）": "A / B paper (portrait)", "A判・B判（横）": "A / B paper (landscape)", "2.35:1（映画）": "2.35:1 (cinema)",
    "比率を指定": "Custom ratio", "長い辺": "Long side", "横の比": "Width part", "縦の比": "Height part",
    "構図の画像（この比率と大きさで）": "Composition picture (at this ratio and size)", "人物": "Figures", "小物": "Props",
    "物体": "Objects", "オーラ": "Auras", "背景": "Background", "白（黒い線）": "White (black lines)",
    "透明（黒い線）": "Transparent (black lines)", "画面と同じ色": "As on screen", "構図を保存": "Save composition",
    "人物を追加": "Add a figure", "削除": "Delete", "名前": "Name",
    "人物が1人のときは削除できません。": "There is only one figure: nothing to delete.",
    "ポーズ・体格・小物・オーラは、選んだ人物だけに効きます（ほかの人物は薄く表示）。ほかの人物の丸をクリックしても切り替わります。床・壁・物体・定規・カメラはみんなで共通です。":
      "Pose, body, props and auras apply to the selected figure only (the others are drawn lighter). Clicking another figure's circle switches too. Floor, walls, objects, the ruler and the camera are shared.",
    // touch, pens, phones (index.html)
    "Shift（その骨だけ・上下）": "Shift (that bone only / up-down)", "固定（ピン）": "Pin", "横の図": "Side view",
    "タッチ・ペン：1本指（ペン）でドラッグ、2本指でつまんで拡大縮小（パースモードはレンズ）、ダブルタップで骨の手前と奥を入れ替え。Shift・固定は上のボタンで（ペンのサイドボタンは Shift、消しゴム側は固定）。":
      "Touch and pen: drag with one finger (or the pen), pinch with two to zoom (the lens in the Perspective mode), double-tap to flip a bone toward / away. Shift and Pin are the buttons above (a pen's side button is Shift, its eraser end pins).",
    // the app (PWA, index.html)
    "アプリとして追加": "Install as an app", "アプリとして追加しました。": "Installed as an app.",
    "Safari の共有ボタン（□↑）→「ホーム画面に追加」で、アプリとして使えます。": "In Safari: the Share button (□↑) → \"Add to Home Screen\" installs it as an app.",
    "Safari のメニュー「ファイル」→「Dock に追加」で、アプリとして使えます。": "In Safari: File → \"Add to Dock\" installs it as an app.",
    // hidden lines (index.html)
    "隠れた線を破線に": "Hidden lines dashed", "物陰に隠れた線を破線で描きます（書き出しにも）。": "Lines hidden behind bodies and objects are drawn dashed (in exports too).",
    "隠れた線を破線にするのをやめました。": "Hidden lines are drawn solid again.",
    // camera and export
    "カメラ": "Camera", "レンズ（mm、小さいほど広角）": "Lens (mm, smaller = wider)", "向き（左右）": "Direction (left / right)",
    "高さ（俯瞰＋／あおり−）": "Height (+ from above / − from below)", "傾き": "Roll", "カメラを戻す": "Reset camera",
    // perspective ruler (pose_ruler.js)
    "パース定規": "Perspective ruler", "パース定規を表示": "Show the perspective ruler", "透視の種類": "Perspective",
    "1点透視": "1-point", "2点透視": "2-point", "3点透視": "3-point", "定規の向き": "Ruler turn",
    "線の数": "Lines", "直方体のガイド（向きは定規と同じ）": "Box guide (turned with the ruler)",
    "位置（左右）": "Position (left / right)", "位置（上下）": "Position (up / down)", "位置（前後）": "Position (front / back)",
    "奥行き": "Depth", "立方体にする（幅にそろえる）": "Make it a cube (all sides = width)",
    "定規の画像": "Ruler picture", "アイレベル": "Eye level", "パース定規の画像を保存しました。": "Ruler picture saved.",
    "奥行きの線がアイレベル上の1点に集まります（カメラの正面に向けた定規）。":
      "Depth lines meet at one point on the eye level (the ruler faces the camera).",
    "左右と奥行きの線がアイレベル上の2点に集まります。": "Left-right and depth lines meet at two points on the eye level.",
    "縦の線も3つ目の点に集まります（カメラの高さが0°のときは平行）。":
      "Verticals meet at a third point too (parallel when the camera height is 0°).",
    "カメラが俯瞰・あおりなので、縦の線は実際にはわずかに集まります（人物と直方体はそのとおりに描かれます）。厳密な1点・2点透視にするには、カメラの高さを0°にします。":
      "The camera looks down or up, so verticals really meet a little (the figure and the box are drawn that way). For a strict 1- or 2-point picture, set the camera height to 0°.",
    "消失点はカメラ（パース）から決まるので、人物と同じパースになります。パースモードで消失点やアイレベルをつかむとカメラが動き、配置モードで消失点をつかむとカメラはそのままで定規が回ります。直方体のガイドは配置モードでドラッグして動かせます。定規はアタリ画像には入りません（「定規の画像」で透明な PNG を保存）。":
      "The vanishing points come from the camera, so the ruler has the figure's perspective. In the Perspective mode, grabbing a vanishing point or the eye level moves the camera; in the Place mode, grabbing a vanishing point turns the ruler and the camera stays. Drag the box guide in the Place mode. The ruler is not in the rough picture (\"Ruler picture\" saves a transparent PNG).",
    "縦の消失点はカメラの高さで決まります。パースモードでつかむとカメラが動きます。":
      "The vertical vanishing point follows the camera height. Grab it in the Perspective mode to move the camera.",
    "1点透視の消失点は、パースモードでつかむとカメラが動きます。": "Grab the 1-point vanishing point in the Perspective mode to move the camera.",
    // place mode, solids (pose_solids.js)
    "配置（定規・物体）": "Place (ruler, objects)",
    "ドラッグ：カメラを回す（左右＝向き、上下＝高さ）。Shift＋ドラッグ：カメラを傾ける（水平でなくする）。ホイール：レンズ（広角ほどパースが強い）。人物の大きさは画面に合わせて保たれます。パース定規の消失点やアイレベルをつかむと、そこに合うようにカメラが動きます。":
      "Drag: orbit the camera (sideways = direction, up and down = height). Shift+drag: tilt the camera (off level). Wheel: lens (the wider, the stronger the perspective). The figure keeps its size on screen. Grabbing a vanishing point or the eye level of the ruler moves the camera to match.",
    "カメラは動きません。消失点をドラッグ：定規の向きを変える。直方体のガイドや物体をドラッグ：床の上で動かす（Shift＋ドラッグで上下）。その上でホイール：向きを回す。丸をクリック：関節を選ぶ（「物体に着ける」用）。":
      "The camera stays. Drag a vanishing point: turn the ruler. Drag the box guide or an object: move it over the floor (Shift+drag: up and down). Wheel over it: turn it. Click a circle: select the joint (for \"put the joint on it\").",
    "物体（床・壁・建物・柱など）": "Objects (floors, walls, buildings, poles ...)",
    "直方体（箱・台）": "Box (crate, stand)", "床（板）": "Floor slab", "壁（板）": "Wall slab", "建物": "Building", "段差": "Step",
    "角柱": "Prism", "円柱": "Cylinder", "角錐": "Pyramid", "円錐": "Cone", "支柱": "Pole", "直方体": "Box",
    "置いた物体": "Objects in the scene", "複製": "Duplicate", "角の数": "Sides", "向き": "Turn",
    "選んだ関節を着ける": "Put the selected joint on it", "この上に立つ": "Stand on it",
    "配置モードで物体をドラッグすると床の上で動きます（Shift＋ドラッグで上下、ホイールで向き）。「接地」をオンにすると物体の上にも立ちます（40cm までの段は乗り上げます）。「選んだ関節を着ける」は、選んだ物体（選んでいなければ一番近い物体）の面に関節を着けて固定します。書き出すアタリに描くかは「書き出すアタリにも床・壁を描く」に従います。":
      "In the Place mode, drag an object to move it over the floor (Shift+drag: up and down, wheel: turn). With grounding on, the figure stands on objects too (it steps up to 40 cm). \"Put the selected joint on it\" puts the joint on a face of the selected object (or the nearest one) and pins it. Objects are in the exported rough when \"Draw floor and walls in the exported rough\" is on.",
    "物体を先に置いてください。": "Place an object first.", "物体を一覧かドラッグで選んでください。": "Select an object in the list or by dragging it.",
    "床・物体の上にめり込まない": "No sinking into the floor or objects", "いつも床・物体の上に着ける（一番低い所）": "Always on the floor or an object (lowest point)",
    "書き出し": "Export", "幅": "Width", "高さ": "Height", "アタリ画像": "Rough picture", "OpenPose 画像": "OpenPose picture",
    "ポーズ保存": "Save pose", "ポーズ読込": "Load pose", "確定して閉じる / Confirm": "Confirm", "閉じる / Cancel": "Cancel",
    "OpenPose 画像は ControlNet（OpenPose）に、アタリ画像は下描きのレイヤーに使えます。":
      "Use the OpenPose picture with a ControlNet (OpenPose), the rough as a sketch layer.",
    "← カメラ側": "← camera side",
    // messages
    "固定できるのは腰・肘・手首・膝・足首です。": "Only the hips, elbows, wrists, knees and ankles can be pinned.",
    "女性の体格にしました。": "Female build applied.", "男性の体格にしました。": "Male build applied.",
    "アタリ画像を保存しました。": "Rough picture saved.", "OpenPose 画像を保存しました。": "OpenPose picture saved.",
    "ポーズを保存しました。": "Pose saved.", "ポーズを読み込みました。": "Pose loaded.", "形式が違います": "wrong format",
    "先に手首・足首・膝・肘・腰のどれかを選んでください。": "Select a wrist, ankle, knee, elbow or the hips first.",
    "つかまる物（蔓・枝・鉄棒など）を先に置いてください。": "Place something to grab first (a vine, a branch, a bar...).",
    "先に手でつかまってください（固定された手首が必要です）。": "Grab something with a hand first (a pinned wrist is needed).",
    "腕が伸びるまで体を下ろしました（足の固定は外しました）。": "Lowered the body until the arms are straight (the feet were unpinned).",
    "ワイヤーを外しました。": "Wire removed.",
    "関節の限界を有効にしました（これからの操作に効きます）。": "Joint limits on (they apply from the next edit).",
    "関節の限界を無効にしました。": "Joint limits off.",
  };
  const JOINT = {"腰（全体）": "hips (whole)", "ウエスト": "waist", "胸": "chest", "首": "neck", "頭": "head",
    "右肩": "right shoulder", "右肘": "right elbow", "右手首": "right wrist", "左肩": "left shoulder",
    "左肘": "left elbow", "左手首": "left wrist", "右股": "right hip", "右膝": "right knee", "右足首": "right ankle",
    "右つま先": "right toe", "左股": "left hip", "左膝": "left knee", "左足首": "left ankle", "左つま先": "left toe",
    "腰": "hips", "右手": "right hand", "左手": "left hand"};
  const SURFACE = {"床": "the floor", "壁": "the wall", "天井": "the ceiling", "床・壁・天井": "the floor, wall or ceiling"};
  const HAND = {relaxed: "relaxed", open: "open", fist: "fist", peace: "peace", point: "point", thumbs_up: "thumbs up",
    ok: "OK", gun: "finger gun", rock: "rock", grip: "grip", claw: "claw", pinch: "pinch (pen)", cup: "cup (cup / ball)",
    trigger: "trigger"};
  const HAND_JA = {"自然": "relaxed", "パー": "open", "グー": "fist", "ピース": "peace", "指差し": "point",
    "サムズアップ": "thumbs up", "OK": "OK", "指鉄砲": "finger gun", "ロック": "rock", "握り込む": "grip",
    "かぎ爪": "claw", "つまむ（ペン）": "pinch (pen)", "包む（カップ・ボール）": "cup (cup / ball)", "引き金": "trigger"};
  const jp = /[぀-ヿ㐀-鿿＀-￯]/;
  const propEn = ja => {
    const P = window.PROPS || {};
    for (const k in P) if (P[k].ja === ja) return P[k].en;
    return null;
  };
  const joint = s => JOINT[s] || s;
  const figEn = n => n.replace(/^(\d+)人目$/, "Figure $1");
  const RULES = [
    [/^この端末では (\d+)×(\d+) を描けないため、(\d+)×(\d+) にしました。$/, m => `This device cannot draw ${m[1]} × ${m[2]}: saved at ${m[3]} × ${m[4]}.`],
    // figures: "2人目" is "Figure 2" (pose_cast.js)
    [/^(\d+)人目$/, m => `Figure ${m[1]}`],
    [/^(.+)（編集中）$/, m => `${figEn(m[1])} (editing)`],
    [/^(.+)を(複製して)?追加しました。いま編集しているのは(.+)です。$/,
      m => `Added ${figEn(m[1])}${m[2] ? " (a copy)" : ""}; now editing ${figEn(m[3])}.`],
    [/^(.+)を削除しました。$/, m => `Deleted ${figEn(m[1])}.`],
    [/^(.+)を編集しています。$/, m => `Editing ${figEn(m[1])}.`],
    [/^構図を (\d+)×(\d+) で保存しました。$/, m => `Composition saved at ${m[1]} × ${m[2]}.`],
    // objects (pose_solids.js); before the general rules below
    [/^(.+)を置きました。配置モードでドラッグして動かせます。$/, m => `Placed: ${T[m[1]] || m[1]}. Drag it in the Place mode.`],
    [/^(.+)の上に立たせました（関節の固定は外しました）。$/, m => `Stood the figure on the ${(T[m[1]] || m[1]).toLowerCase()} (pins removed).`],
    [/^(.+)を(床|壁|天井)に着けて固定しました。$/, m => `Put the ${joint(m[1])} on ${SURFACE[m[2]]} and pinned it.`],
    [/^(.+)を(.+)に着けて固定しました。$/, m => `Put the ${joint(m[1])} on the ${(T[m[2]] || m[2]).toLowerCase()} and pinned it.`],
    [/^(\d+)\. (.+)$/, m => T[m[2]] ? `${m[1]}. ${T[m[2]]}` : null],
    [/^(.+) \/ ([^぀-鿿]+)$/, m => jp.test(m[1]) ? m[2] : null],               // "ダガー / Dagger"
    [/^([\d.]+) cm（([\d.]+) 頭身）$/, m => `${m[1]} cm (${m[2]} heads)`],
    [/^([\d.]+) 頭身$/, m => `${m[1]} heads`],
    [/^.+（([a-z_]+)）$/, m => HAND[m[1]] ? `${HAND[m[1]]}` : null],                    // hand shape options
    [/^(.+)を固定しました。$/, m => `Pinned the ${joint(m[1])}.`],
    [/^(.+)の固定を外しました。$/, m => `Unpinned the ${joint(m[1])}.`],
    [/^固定中の関節：(.+)$/, m => "Pinned: " + m[1].split("・").map(joint).join(", ")],
    [/^…ほか (\d+) 件（絞り込んでください）$/, m => `… ${m[1]} more (narrow the search)`],
    [/^読み込みました：(.+)$/, m => `Loaded: ${m[1]}`],
    [/^読み込めませんでした：(.*)$/, m => `Could not load: ${T[m[1]] || m[1]}`],
    [/^読めないファイル：(.*)$/, m => `Could not read: ${m[1]}`],
    [/^ユーザープリセットを (\d+) 件読み込みました。$/, m => `Loaded ${m[1]} user presets.`],
    [/^(.+)を先にオンにしてください。$/, m => `Turn on ${SURFACE[m[1]] || m[1]} first.`],
    [/^(.+)を(床|壁|天井)に着けて固定しました。$/, m => `Put the ${joint(m[1])} on ${SURFACE[m[2]]} and pinned it.`],
    [/^(.+)でつかまって固定しました。別の手足も選んで「つかまる」を押せます。$/,
      m => `Grabbed with the ${joint(m[1])} and pinned it. Select another hand or foot and grab again if you like.`],
    [/^.+（(.+)）を右手に持たせました。$/, m => `Put the ${m[1]} in the right hand.`],
    [/^.+（(.+)）を左手に持たせました。$/, m => `Put the ${m[1]} in the left hand.`],
    [/^.+（(.+)）を置きました。手首か足首を選んで「つかまる」。$/, m => `Placed the ${m[1]}. Select a wrist or ankle and press "Grab".`],
    [/^.+（(.+)）を置きました。$/, m => `Placed the ${m[1]}.`],
    [/^(.+)に体を合わせて、合わせた関節を固定しました。$/, m => `Fitted the body to the ${propEn(m[1]) || m[1]} and pinned the fitted joints.`],
    [/^ワイヤーで(.+)を吊りました。$/, m => `Hanging the ${joint((m[1] || "").replace(/（.*$/, ""))} from the wire.`],
    [/^(.+)（(右手|左手|置く|構える|背中|身に着ける)）$/, m => {                          // the scene list
      const en = propEn(m[1]); if (!en) return null;
      return `${en} (${{"右手": "right hand", "左手": "left hand", "置く": "placed", "構える": "held", "背中": "on the back",
        "身に着ける": "worn"}[m[2]]})`; }],
    [/^.+（(.+)）を身に着けました。$/, m => `Put on the ${m[1]}.`],
    [/^身に着ける（(.+)）(?:。(.+))?$/, m => `Worn (${{"頭": "head", "胸・肩": "chest / shoulder", "背中": "back", "腰": "waist",
      "両足": "both feet", "両足と両手": "feet and hands"}[m[1]] || m[1]})` + (m[2] ? ". " + (T[m[2]] || m[2]) : "")],
    [/^(.+?)に(.+)をまといました。$/, m => `Put on ${(T[m[2]] || m[2])}: ${(T[m[1]] || joint(m[1]))}.`],
    [/^(\d+)\. (.+)：(.+)$/, m => `${m[1]}. ${T[m[2]] || joint(m[2])}: ${T[m[3]] || m[3]}`],
    [/^(片手|両手)で持つ（手の形：(.+?)）(?:。(.+))?$/, m =>
      `Held in ${m[1] === "片手" ? "one hand" : "both hands"} (hand shape: ${HAND_JA[m[2]] || m[2]})` + (m[3] ? ". " + (T[m[3]] || m[3]) : "")],
    [/^(.+?)。(.+)$/, m => (T[m[1]] && T[m[2]] !== undefined) ? T[m[1]] + ". " + T[m[2]] : null],
  ];
  const tr = s => {
    const t = s.trim();
    if (!t || !jp.test(t)) return null;
    if (t in T) return s.replace(t, T[t]);
    if (t in JOINT) return s.replace(t, JOINT[t][0].toUpperCase() + JOINT[t].slice(1));
    for (const [re, fn] of RULES) { const m = t.match(re); if (m) { const r = fn(m); if (r !== null && r !== undefined) return s.replace(t, r); } }
    return null;
  };

  // ?lang=en|ja wins, then the last choice in this browser, then the browser's language
  let lang = new URLSearchParams(location.search).get("lang");
  if (lang !== "en" && lang !== "ja") { try { lang = localStorage.getItem(KEY); } catch (e) { lang = null; } }
  if (lang !== "en" && lang !== "ja") lang = (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
  const orig = new WeakMap(), shown = new WeakMap();
  const doText = n => {
    if (lang === "en") {
      if (shown.get(n) === n.nodeValue) return;                 // our own text
      const r = tr(n.nodeValue);
      if (r !== null) { orig.set(n, n.nodeValue); n.nodeValue = r; shown.set(n, r); }
    } else if (orig.has(n) && shown.get(n) === n.nodeValue) {
      n.nodeValue = orig.get(n); orig.delete(n); shown.delete(n);
    }
  };
  const doAttrs = el => {
    for (const a of ["placeholder", "title"]) {
      if (!el.hasAttribute || !el.hasAttribute(a)) continue;
      const keep = "data-ja-" + a;
      if (lang === "en") {
        const v = el.getAttribute(a);
        if (el.getAttribute(keep) !== null && el.getAttribute("data-en-" + a) === v) continue;
        const r = tr(v);
        if (r !== null) { el.setAttribute(keep, v); el.setAttribute(a, r); el.setAttribute("data-en-" + a, r); }
      } else if (el.getAttribute(keep) !== null) {
        el.setAttribute(a, el.getAttribute(keep)); el.removeAttribute(keep); el.removeAttribute("data-en-" + a);
      }
    }
  };
  const walk = root => {
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1 || root.tagName === "SCRIPT" || root.tagName === "STYLE") return;
    doAttrs(root);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) { if (!n.parentNode || n.parentNode.tagName !== "SCRIPT") doText(n); }
      else doAttrs(n);
    }
  };
  new MutationObserver(list => {
    for (const m of list) {
      if (m.type === "characterData") doText(m.target);
      else m.addedNodes.forEach(walk);
    }
  }).observe(document.body, {subtree: true, childList: true, characterData: true});
  // canvas labels
  const fill = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function (text, ...rest) {
    if (lang === "en" && typeof text === "string") { const r = tr(text); if (r !== null) text = r; }
    return fill.call(this, text, ...rest);
  };
  // the switch
  const btn = document.createElement("button");
  btn.type = "button";
  const tools = document.getElementById("headTools");
  if (!tools) btn.style.cssText = "position:absolute;top:12px;right:16px";
  const label = () => { btn.textContent = lang === "en" ? "日本語" : "English"; };
  btn.addEventListener("click", () => {
    lang = lang === "en" ? "ja" : "en";
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    document.documentElement.lang = lang;
    walk(document.body); label();
    if (typeof draw === "function") draw();
  });
  const header = document.querySelector("header");
  if (tools) tools.appendChild(btn);
  else if (header) { header.style.position = "relative"; header.appendChild(btn); }
  label();
  document.documentElement.lang = lang;
  if (lang === "en") { walk(document.body); if (typeof draw === "function") draw(); }
  // for mods (pose_api.js): more words and rules; what is on the page is translated again
  window.ODMPoserI18n = window.SymbolicPoseI18n = {
    get lang(){ return lang; },
    add(table){ Object.assign(T, table); if (lang === "en"){ walk(document.body); if (typeof draw === "function") draw(); } },
    addRule(re, fn){ RULES.unshift([re, fn]); if (lang === "en") walk(document.body); },
    tr: s => (lang === "en" ? tr(s) || s : s),
  };
})();
