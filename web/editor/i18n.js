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
    "丸をドラッグ：関節を動かす（骨の長さは保たれ、寄せた分だけ手前／奥へ傾く）。手首・足首は腕・脚ごと届く（Shift＋ドラッグでその骨だけ）。ダブルクリック：その骨の手前と奥を入れ替える。Alt＋クリック：その関節を固定（ピン。固定した手足は他を動かしても動かない）。腰の丸：全体を動かす。横の図でドラッグ：奥行きを直接動かす。ホイール：拡大縮小。Ctrl+Z：元に戻す、Ctrl+Y：やり直す。":
      "Drag a circle: move the joint (bone lengths are kept; pulling it in tilts the bone toward or away from you). A wrist or ankle brings its whole arm or leg (Shift+drag: that bone only). Double-click: flip the bone toward / away from the camera. Alt+click: pin the joint (a pinned hand or foot stays when the rest moves). The hip circle moves the whole figure. Drag in the side view: move depth directly. Wheel: zoom. Ctrl+Z: undo, Ctrl+Y: redo.",
    "丸をドラッグ：その骨を伸ばす／縮める（先の部分ごと動く）。丸の上でホイール：丸（太さ）を大きく／小さく。左右対称にチェックすると反対側も同じに変わります。":
      "Drag a circle: lengthen / shorten that bone (what follows moves with it). Wheel over a circle: make it (the thickness) bigger / smaller. With symmetry on, the other side changes too.",
    // presets
    "プリセット": "Presets", "読み込む": "Load", "左右反転": "Mirror",
    "右の手足を左へ写す": "Copy right limbs to left", "左の手足を右へ写す": "Copy left limbs to right",
    "右の手足を左へ写しました。": "Copied the right arm and leg to the left.",
    "左の手足を右へ写しました。": "Copied the left arm and leg to the right.",
    "反対側をこの形にそろえる": "Make the other side match", "この関節だけ": "This joint only",
    "ここから先まとめて": "From here on",
    "SNS に投稿": "Post to social media", "ひとこと（なくても可）": "A few words (optional)",
    "編集データを入れたリンクにする（開くと同じ人物・小物・カメラになります）": "Link with the editing data (opening it gives the same figures, props and camera)",
    "X に投稿": "Post to X", "ほかのアプリ（共有メニュー）": "Other apps (share menu)", "リンクをコピー": "Copy the link",
    "そのほかの SNS・チャット": "More networks and chats", "Reddit（英文）": "Reddit (in English)", "オープンチャット": "LINE OpenChat",
    "カカオトーク": "KakaoTalk",
    "Misskey・Mastodon のサーバー": "Misskey / Mastodon server", "その他（自分で入力）": "Other (type it in)",
    "みすてむず（misskey.systems）": "Misskey.systems", "サーバーのアドレスを入れてください（例：example.com）。": "Type the server's address (e.g. example.com).", "リンクを開く前の編集に戻す": "Back to the editing before the link",
    "公式 MOD を追加して開き直す": "Add the official mods and open again",
    "投稿には #ODMPoser #立体人形装置 とリンクが付き、リンクは「立体人形装置」の画像付きカードで表示されます。リンクに入る MOD は公式（GitHub の qwaxgo）のものだけで、ほかの MOD の小物・物体は単純な図形や棒になります。":
      "A post gets #ODMPoser #立体人形装置 and the link, shown as a card with the ODM Poser picture. A link carries only the official mods (qwaxgo's on GitHub); props and solids of other mods become plain shapes and rods.",
    "投稿画面を開きました。": "Opened the post window.",
    "この端末には共有メニューがないため、投稿の文をコピーしました。": "This device has no share menu: the post's text is copied.",
    "リンクの編集データを読めませんでした（壊れているか、このブラウザが対応していません）。": "Could not read the link's editing data (it is broken, or this browser cannot).",
    "リンクを開く前の編集に戻しました（元に戻すで、リンクの編集データに戻れます）。": "Back to the editing before the link (Undo goes back to the link's).",
    "胴体を立体に": "Solid torso", "胴体を立体（厚みのある台形）で描きます。": "The torso is drawn as solid blocks.",
    "胴体を平らな台形で描きます。": "The torso is drawn as flat trapezoids.",
    "右手": "Right hand", "左手": "Left hand",
    "手首の曲げ（＋前へ）": "Bend the wrist (+ forward)", "手首の左右（＋外へ）": "Wrist sideways (+ outward)",
    "手のひらの向き（前腕のひねり）": "Palm direction (the forearm's twist)",
    "GitHub リポジトリ": "GitHub repository", "意見箱": "Feedback", "使い方": "Guide",
    "使い方・アプリとして使う・MOD の作り方": "How to use it, install it as an app, write mods",
    "不具合の報告・要望・感想を GitHub の Issues に書けます（GitHub のアカウントが要ります）":
      "Report a bug, ask for a feature or say what you think, in the GitHub Issues (a GitHub account is needed)",
    "カメラの固定と記憶": "Camera lock and memory", "カメラを固定する": "Lock the camera", "カメラパッドを表示": "Show the camera pad",
    "記憶したカメラ（": "Remembered cameras (", "今のカメラを記憶": "Remember this camera", "呼び出す": "Recall",
    "カメラを固定しました。": "Locked the camera.", "カメラの固定を外しました。": "Unlocked the camera.",
    "カメラは固定中です（「カメラの固定と記憶」で外せます）。": "The camera is locked (unlock it in \"Camera lock and memory\").",
    "固定すると、ドラッグ・スワイプ・2本指・ホイール・テンキー・カメラパッドではカメラが動きません（パースのスライダーと「呼び出す」は効きます）。記憶するのは向き・高さ・傾き・レンズ・拡大・中心で、ポーズと一緒に保存されます。一覧はダブルクリックでも呼び出せます。":
      "Locked, the camera does not move with drags, swipes, two fingers, the wheel, the keypad or the camera pad (the Perspective sliders and Recall still set it). A remembered camera keeps the direction, height, roll, lens, zoom and centre and is saved with the pose. Double-click the list to recall too.",
    "分割表示：オン": "Split screen: on", "分割表示：オフ": "Split screen: off",
    "カメラパッド": "Camera pad", "操作欄を隠す": "Hide panels", "操作欄を出す": "Show panels",
    "回す": "Turn", "動かす": "Move", "拡大": "Zoom",
    "タッチ：丸をタップして選び、選んだ丸をドラッグして動かす。それ以外の所を1本指でスワイプ：カメラを回す。2本指：つまんで拡大縮小、そのまま動かして移動（パース・配置モードはレンズ・物体のまま）。カメラパッド：左のスティックで回す、右のスティックで動かす、右端のスライダーで拡大（上の「カメラパッド」で隠せます）。ダブルタップで骨の手前と奥を入れ替え。Shift・固定は上のボタンで。ペンはマウスと同じく丸を直接ドラッグ（サイドボタンは Shift、消しゴム側は固定）。":
      "Touch: tap a circle to pick it, then drag the picked circle. Swipe anywhere else with one finger: turn the camera. Two fingers: pinch to zoom, move them to move the view (the Perspective and Place modes keep the lens and objects). Camera pad: the left stick turns, the right stick moves, the slider at the right zooms (hide it with \"Camera pad\" above). Double-tap flips a bone toward / away from you. Shift and pin: the keys above. A pen drags circles directly, like a mouse (barrel button: Shift, eraser: pin).",
    "カメラ（どのモードでも。レンズはそのまま）：中ボタンでドラッグして回す、Shift＋中ボタンで動かす、Ctrl＋中ボタン（またはホイール）で拡大縮小。中ボタンのないマウスやトラックパッドは、何もない所を Alt＋ドラッグ。テンキー：1 正面、3 右から、7 上から（Ctrl で反対側）、2・4・6・8 で15°ずつ回す（Ctrl で動かす）、9 裏へ回る、＋－ 拡大縮小、. 選んだ関節を中心に、Home 人物を中心に。":
      "Camera (any mode; the lens stays): middle-button drag turns it, Shift+middle button moves it, Ctrl+middle button (or the wheel) zooms. Without a middle button: Alt+drag where there is no joint. Numeric keypad: 1 front, 3 from the right, 7 from above (Ctrl: the other side), 2 4 6 8 turn by 15° (Ctrl: move), 9 round to the back, + - zoom, . the selected joint to the middle, Home the figure to the middle.",
    "左右同時に動かす（片方の手足を動かすと、反対側も同じ形に）": "Move both sides (the other arm or leg takes the same pose)", "反対側をそろえました。": "Matched the other side.", "元に戻す": "Undo", "やり直す": "Redo",
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
    "mods フォルダ（とその中のフォルダ）の *.js を起動時に読み込みます（ディスクから開いたときは mods.js に書いたものだけです。「フォルダから」で mods フォルダを選ぶと中の MOD をまとめて読み込めて、Chrome と Edge ではそのフォルダを覚えます）。「ファイルから入れる」と「URLから追加」の MOD はこのブラウザに保存され、毎回読み込まれます（mods フォルダのないサイトやスマホでも使えます。URL の MOD は毎回新しい版を読み、オフラインでは前回のものを使います）。MOD はエディタの中で自由に動くプログラムなので、信頼できるものだけを入れてください。アドレスの末尾に ?nomods を付けると MOD なしで開きます。":
      "The *.js files in mods/ (and its folders) load at start (opened from disk, only those listed in mods.js; “From a folder” picks the mods folder and loads every mod in it, and Chrome and Edge remember that folder). Mods installed from a file or added by URL are kept in this browser and load every time (also on a site without a mods folder, or on a phone; a URL mod is read fresh each time and its last copy is used offline). A mod is a program that can do anything inside the editor: install only mods you trust. Add ?nomods to the address to start without mods.",
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
    "フォルダから": "From a folder", "mods フォルダを選んで、中の MOD を読み込む": "Pick the mods folder and load the mods in it",
    "このフォルダの MOD を読み込む（読み取りの許可を聞かれます）": "Load the mods of this folder (the browser asks to allow reading it)",
    "フォルダの MOD を読み込みました。": "Loaded the folder's mods.",
    "フォルダの MOD を読み込みました。次からはこのフォルダも読み込みます（読み取りの許可を聞かれたら「読み込む」を押します）。":
      "Loaded the folder's mods. From now on this folder loads too (if the browser asks to allow reading it, press “Load”).",
    "フォルダの MOD を読み込みました（このブラウザでは今回だけです）。": "Loaded the folder's mods (this browser: for this session only).",
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
    "操作のヒント": "How to use",
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
    "ドラッグではカメラは動きません（中ボタン・テンキー・カメラパッドでは動きます）。消失点をドラッグ：定規の向きを変える。直方体のガイドや物体をドラッグ：床の上で動かす（Shift＋ドラッグで上下）。その上でホイール：向きを回す。丸をクリック：関節を選ぶ（「物体に着ける」用）。":
      "Dragging does not move the camera (the middle button, the keypad and the camera pad do). Drag a vanishing point: turn the ruler. Drag the box guide or an object: move it over the floor (Shift+drag: up and down). Wheel over it: turn it. Click a circle: select the joint (for \"put the joint on it\").",
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
    "レンズ": "Lens", "保存する画像のプレビュー": "Preview of the picture to save",
    "カメラの位置 上下": "Camera position: up / down", "カメラの位置 前後": "Camera position: forward / back",
    "カメラの位置 左右": "Camera position: left / right", "見る点 上下": "Look-at point: up / down",
    "見る点 前後": "Look-at point: forward / back", "見る点 左右": "Look-at point: left / right",
    "サイトのリンク": "Site links", "シーンにある物": "Things in the scene", "元に戻す・やり直す": "Undo / redo",
    "分類": "Categories", "大きな分類": "Main categories", "表示の切り替え": "View switches", "モード": "Modes",
    "すべての部位が固定されています。": "Every part is locked.",
    "頭を固定しているので、頭身は保てません。": "The head is locked, so the heads count cannot be kept.",
    "頭を固定しているので、頭身は変えられません。": "The head is locked, so the heads count cannot change.",
    "頭を固定しているので、頭身を保ったまま身長は変えられません（頭の固定を外してください）。":
      "The head is locked, so the height cannot change with the heads count kept (unlock the head).",
    "この文をコピーしてください": "Copy this text", "このリンクをコピーしてください": "Copy this link",
    // short button names (the longer wording is their title)
    "編集データ入りのリンク": "Link with the editing data", "開くと同じ人物・小物・カメラになります": "Opening it gives the same figures, props and camera",
    "どの角度でも同じ幅": "Same width from every side", "公式 MOD を追加": "Add the official mods", "アタリにも描く": "Also in the rough",
    "ファイルから": "From a file", "↺ 戻す": "↺ Reset", "立方体に": "Cube", "ほかのアプリ": "Other apps", "↺ 初期値に": "↺ Defaults",
    "体ごと寄せる": "Move the body", "↶ 前の編集へ": "↶ Previous editing", "プレビュー": "Preview", "壁を定規に": "Wall to the ruler",
    "位置・向き・大きさを戻す": "Default place, turn and size", "床・壁・天井を初期値に": "Floor, wall and ceiling to the defaults",
    "大きさ・向きを戻す": "Default size and turn",
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
    // the side panel as the menu splits it (melta UI), and the view's corners
    "↶ 元に戻す": "↶ Undo", "↷ やり直す": "↷ Redo", "正面（カメラ）": "Front (camera)",
    "関節の限界": "Joint limits", "隠れ線を破線": "Hidden lines dashed", "胴体を立体": "Solid torso",
    "人間として無理な曲がり方をしない": "No bends a human cannot do", "物陰に隠れた線を破線で描く（書き出しにも）": "Draw hidden lines dashed (also when exporting)",
    "胴体を厚みのある台形で描く": "Draw the torso as thick trapezoids", "編集モード": "Editing mode",
    "部位ごとの縦幅・横幅、小物の長さ・太さはここに入ります（準備中）。今は、選んだ関節の太さ・長さを下の欄で変えられます。":
      "Each part's height and width, and the length and thickness of things, will come here (in preparation). For now, change the selected joint's size and length below.",
    "このポーズにする": "Use this pose", "検索（例：キック / kick）": "Search (e.g. kick)",
    "骨の向きだけを取り込み、体格はそのままです。一覧はダブルクリックでも読み込めます。": "Only the bones' directions are taken; the build stays. Double-click in the list to load too.",
    "左右": "Left and right", "⇋ 左右反転": "⇋ Mirror", "右→左へ写す": "Copy right → left", "左→右へ写す": "Copy left → right",
    "ポーズを戻す": "Reset the pose", "↺ 立ちポーズに戻す": "↺ Back to standing", "体格（骨の長さ・太さ）と位置はそのままです。": "The build (bone lengths, thickness) and the place stay.",
    "左右同時に動かす": "Move both sides together", "この関節を固定": "Pin this joint",
    "関節の固定（ピン）とは同時に使えません": "Cannot be used together with pins", "左右同時に動かすとは同時に使えません": "Cannot be used together with moving both sides",
    "「左右同時に動かす」がオンの間は関節を固定できません。": "Joints cannot be pinned while “Move both sides together” is on.",
    "関節を固定している間は「左右同時に動かす」を使えません（固定をすべて外すと使えます）。": "“Move both sides together” is off while joints are pinned (unpin them all to use it).",
    "「左右同時に動かす」がオンの間は固定できません。": "Cannot pin while “Move both sides together” is on.",
    "反対側をこの形に": "Make the other side like this", "ここから先": "This and beyond", "ドラッグ結果がここに反映されます": "What you drag shows here",
    "女性": "Female", "男性": "Male", "身長": "Height", "全体サイズ": "Overall size", "太さ": "Thickness",
    "↺ 体格を初期値に": "↺ Default build", "骨の長さ・丸の太さ・大きさを初期値にします。ポーズ（骨の向き）はそのままです。": "Bone lengths, circle sizes and scale go back to the defaults; the pose (the bones' directions) stays.",
    "カメラの位置（左右・上下・前後）": "Camera position (left-right, up-down, front-back)", "見る点（左右・上下・前後）": "Looks at (left-right, up-down, front-back)",
    "床の中心が 0。前後は人物の正面側が＋。位置を変えると、見る点を向いたまま向き・高さ・拡大が決まります（傾きはそのまま）。":
      "0 is the middle of the floor; front-back is + toward the figure's front. A new position keeps looking at the point and sets the direction, height and zoom (the tilt stays).",
    "↺ リセット": "↺ Reset", "固定と記憶": "Lock and memory", "カメラを固定": "Lock the camera", "パッドを表示": "Show the pad",
    "記憶したカメラ（": "Remembered cameras (", "記憶": "Remember", "呼出": "Recall", "削除": "Delete",
    "カメラを固定しました（スライダー・座標も動きません。「呼出」は使えます）。": "Camera locked (sliders and coordinates too; Recall still works).",
    "カメラが見る点に近すぎます。": "The camera is too close to the point it looks at.",
    "パース定規を表示": "Show the perspective ruler", "透視": "Perspective", "1点": "1-point", "2点": "2-point", "3点": "3-point",
    "線の数": "Lines", "ガイド立方体": "Box guide", "奥行": "Depth", "前後": "Front-back", "上下": "Up-down", "立方体": "Cube",
    "↺ 定規を初期値に": "↺ Default ruler", "定規を初期値に戻しました。": "Ruler back to the defaults.",
    "ポーズのファイルを開く": "Open a pose file", "「書き出し」で保存したポーズ（.json）を開きます。人物・小物・物体・カメラも戻ります。":
      "Opens a pose (.json) saved with Export; figures, things, objects and the camera come back too.",
    "長辺": "Long side", "アタリ画像": "Rough picture", "ポーズ（.json）": "Pose (.json)", "画像は保存する前に全体を確認できます。": "You see a picture whole before it is saved.",
    "構図の画像に含める": "In the composition picture", "環境": "Surroundings", "白": "White", "透明": "Transparent", "テーマ": "Theme", "構図の画像": "Composition picture",
    "保存する画像": "The picture to save", "やめる": "Cancel", "保存する": "Save", "保存をやめました。": "Not saved.",
    "人物の位置と向き": "The figure's place and direction", "左右（＋人物の左）": "Left-right (+ the figure's left)", "前後（＋前）": "Front-back (+ front)",
    "向き": "Direction", "前後の傾き（＋前へ）": "Lean forward-back (+ forward)", "左右の傾き": "Lean sideways", "↺ 位置と向きを戻す": "↺ Default place and direction",
    "選んでいる人物を、ポーズを保ったまま動かし・回します（固定した関節も一緒に動きます）。床と関係なく傾けられます。「配置」タブの接地が「いつも床・物体の上に着ける」のときは、上下は床に戻ります。":
      "Moves and turns the selected figure, keeping its pose (pinned joints go along). It can lean whatever the floor. With grounding set to “always on the floor / objects” (Place tab), up-down goes back to the floor.",
    "人物の位置と向きを戻しました。": "The figure's place and direction were reset.",
    "初期状態に戻す": "Back to the start", "↺ この人物を初期状態に": "↺ Reset this figure", "↺ すべて最初の状態に": "↺ Reset everything",
    "「この人物」はポーズ・体格・位置を新しい人物と同じにします（持ち物とオーラはそのまま）。「すべて」は人物・小物・物体・床と壁・定規・カメラを最初の状態にします（記憶したカメラは残ります）。どちらも「元に戻す」で取り消せます。":
      "“This figure” gives it a new figure's pose, build and place (its things and auras stay). “Everything” resets figures, things, objects, floor and walls, ruler and camera (remembered cameras stay). Undo takes either back.",
    "人物・小物・物体・床と壁・定規・カメラを、すべて最初の状態に戻します（「元に戻す」で取り消せます）。": "Reset figures, things, objects, floor and walls, ruler and camera? (Undo takes it back.)",
    "すべて最初の状態に戻しました（記憶したカメラは残しました）。": "Everything was reset (remembered cameras were kept).",
    "この人物を初期状態に戻しました（持ち物とオーラはそのまま）。": "This figure was reset (its things and auras stay).",
    "立ちポーズに戻しました（体格はそのまま）。": "Back to standing (the build stays).", "体格を初期値に戻しました（ポーズはそのまま）。": "Default build (the pose stays).",
    "↺ 位置・向き・大きさを戻す": "↺ Default place, turn and size", "小物の位置・向き・大きさを戻しました。": "The thing's place, turn and size were reset.",
    "↺ 床・壁・天井を初期値に": "↺ Default floor, wall, ceiling", "床・壁・天井を初期値に戻しました。": "Floor, wall and ceiling back to the defaults.",
    "↺ 大きさ・向きを戻す": "↺ Default size and turn",
    "横の図": "Side view", "右": "Right", "左": "Left", "上": "Top", "下": "Bottom", "隠す": "Hide",
    "横から（奥行き）の図の置き場所": "Where the side (depth) view goes",
    "操作欄": "Panel", "操作欄をしまう": "Hide the panel", "操作欄を出す": "Show the panel", "操作欄をしまう・出す": "Hide / show the panel",
    "横から（奥行き）の図を出す・隠す": "Show / hide the side (depth) view", "横の図を出す・隠す": "Show / hide the side view",
    "横の図を出しました。": "The side view is shown.", "横の図を隠しました。": "The side view is hidden.",
    "置き場所": "Place", "操作欄の位置": "Panel", "分割表示": "Split screen", "操作欄をしまいました。": "The panel is put away.", "操作欄を出しました。": "The panel is shown.",
    "横から（奥行き）の図を出す・隠す（置き場所は横の図の右下で）": "Show / hide the side (depth) view (where it goes: on the side view, bottom right)",
    "操作欄を出す・しまう（置き場所は操作欄の上で）": "Show / put away the panel (where it goes: at the top of the panel)",
    "図と操作欄を画面の半分ずつに分ける（スマホ・タブレット）": "The views and the panel on half the screen each (phones, tablets)",
    "表示の明るさ（押すたびに 自動 → ライト → ダーク）": "Light or dark (each press: auto → light → dark)", "操作欄を上・下に置いたとき、メニューを置く側": "With the panel above / below: the side the menu goes on",
    "画面の設定（操作欄の位置・分割表示・表示の色・言語）": "Screen settings (where the panel goes, split screen, theme, language)", "画面の設定": "Screen settings",
    "操作欄を上・下に置いたとき、メニューとタブを縦に積む側": "With the panel above / below: the side the menu and tabs stack on", "操作欄（メニューと各欄）を画面のどこに置くか": "Where the panel (the menu and its sections) goes",
    "人間として無理な曲がり方をしない": "No bending a human body cannot do",
    "画面右上の「関節の限界」と同じスイッチです。これからの操作に効きます。": "The same switch as “Joint limits” at the view's top right. It works on what you do from now on.",
    "作業ログ（どの時点にも戻せる）": "History (go back to any point)",
    "元に戻す（Ctrl+Z）": "Undo (Ctrl+Z)", "やり直す（Ctrl+Y）": "Redo (Ctrl+Y)", "操作のヒント（?キー）": "Hints (? key)",
    "辺を消失点まで延ばす": "Edges to the vanishing points", "位置：左右": "Place: left-right", "位置：上下": "Place: up-down",
    "位置：前後": "Place: front-back", "立方体にする（幅にそろえる）": "Make it a cube (the width)", "スナップ": "Snapping",
    "物体を定規にスナップ": "Snap objects to the ruler", "壁を定規の向きにそろえる": "Turn the wall like the ruler",
    "壁を定規の向きにそろえました。": "The wall now turns like the ruler.",
    "配置モードで物体・小物を動かすと、向きが定規の向きにそろいます（ホイールで 90°ずつ回ります）。物体は床・天井と、定規の向きにそろえた壁（床板・壁板の物体も）に近づくと、面に吸い付きます。":
      "Objects and things moved in the place mode turn to the ruler's directions (the wheel turns them 90° at a time). Objects stick to the floor, the ceiling and walls turned like the ruler (floor and wall slabs too) when they come near.",
    "シーンの一覧": "In the scene", "開く": "Open", "↺ 初期状態に": "↺ Reset",
    "行を選んでから押します（ダブルクリックで開く）。持ち物・オーラは人物の下に、置いた物・物体・床と壁・定規の立方体は外側に並びます。":
      "Pick a row, then press (double-click opens it). Things held and auras sit under their figure; things put down, objects, floor and walls and the ruler's box stand outside.",
    "人物と持ち物": "Figures and what they have", "置いた物・場所": "Put down, and places", "まだありません": "Nothing yet", "編集中": "editing",
    "背中": "back", "左手": "left hand", "右手": "right hand", "身に着ける": "worn", "構える": "held", "床": "Floor", "壁": "Wall", "天井": "Ceiling",
    "定規の立方体": "The ruler's box", "オーラの大きさ・色を戻しました。": "The aura's size and colour were reset.",
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
  const name = s => T[s] || propEn(s) || s;                     // a word of the tables, else a prop's English name
  const figEn = n => n.replace(/^(\d+)人目$/, "Figure $1").replace(/^カメラ(\d+)$/, "Camera $1");
  const RULES = [
    [/^([A-Za-z][\w .]*)（([\w.-]+)）$/, m => `${m[1]} (${m[2]})`],                     // "Pawoo（pawoo.net）"
    [/^カメラ(\d+)$/, m => `Camera ${m[1]}`],
    [/^(.+)に体を合わせて、合わせた関節を固定しました。$/, m => `Fitted the body to the ${name(m[1]).toLowerCase()} and pinned the fitted joints.`],
    [/^(.+)を(.+)に着けて固定しました。$/, m => SURFACE[m[2]] ? null : `Put the ${joint(m[1])} on the ${name(m[2]).toLowerCase()} and pinned it.`],
    [/^(.+)を固定しました（身長・頭身を変えても、長さと太さはそのまま）。$/,
      m => `Locked: ${name(m[1]).toLowerCase()} (changing the height or heads leaves their lengths and thickness).`],
    [/^(.+)を固定から外しました。$/, m => `Unlocked: ${name(m[1]).toLowerCase()}.`],
    [/^(選んだ小物|小物|物体|オーラ)：(.+)$/, m => ({"選んだ小物": "Selected prop", "小物": "Prop", "物体": "Object", "オーラ": "Aura"})[m[1]]
      + ": " + m[2].split(/・(?![^（]*）)/).map(name).join(", ")],                       // "全身・気（炎…）": split outside the brackets
    [/^(.*?)\s*「(.+)」の時点に戻しました。$/, m => `Back to "${tr(m[2]) || m[2]}"${m[1] ? " (" + m[1] + ")" : ""}.`],
    [/^このアドレスの MOD を、エディタを開くたびに読み込んで実行します。信頼できるものだけを追加してください。\n\n([\s\S]+)$/,
      m => `The mod at this address is loaded and run each time the editor opens. Add only mods you trust.\n\n${m[1]}`],
    [/^「(.+)」をこの端末から外しますか？$/, m => `Remove "${m[1]}" from this device?`],
    [/^保存できませんでした：(.*)$/, m => `Could not save: ${m[1]}`],
    [/^フォルダ: (.+)$/, m => `Folder: ${m[1]}`],
    [/^この端末では (\d+)×(\d+) を描けないため、(\d+)×(\d+) にしました。$/, m => `This device cannot draw ${m[1]} × ${m[2]}: saved at ${m[3]} × ${m[4]}.`],
    // posting and links (pose_share.js)
    [/^投稿の文をコピーしました。(.+)に貼り付けてください。$/, m => `Copied the post's text: paste it into ${m[1].replace("カカオトーク", "KakaoTalk")}.`],
    [/^(.+)には、この文を貼り付けてください：([\s\S]+)$/, m => `Paste this into ${m[1].replace("カカオトーク", "KakaoTalk")}: ${m[2]}`],
    [/^(.+)は文字数の上限があるため、編集データの入らないサイトのリンクにしました。$/, m => `${m[1]} allows only so many characters: the post has the site's link without the editing data.`],
    [/^(.+)の投稿画面を開き、ひとことをコピーしました（貼り付けて使えます）。$/, m => `Opened ${m[1]}'s post page and copied your words (paste them there).`],
    [/^リンクの編集データを開きました。(.*)$/, m => "Opened the link's editing data." + (m[1] ? " The editing before it: \"Previous editing\"." : "")],
    [/^リンクをコピーしました（(\d+) 文字）。$/, m => `Copied the link (${m[1]} characters).`],
    [/^このポーズは公式 MOD（GitHub の qwaxgo）を使っています。[^：]*：\n([\s\S]*)$/,
      m => `This pose uses official mods (qwaxgo's on GitHub). Add them to see their props too (plain shapes for now):\n${m[1]}`],
    [/^追加できなかった MOD があります：(.+)$/, m => `Some mods could not be added: ${m[1]}`],
    // remembered cameras: "カメラ2（向き 30°・高さ 10°・50mm・×1.2）"
    [/^カメラ(\d+)（向き (-?\d+)°・高さ (-?\d+)°・(\d+)mm・×([\d.]+)）$/,
      m => `Camera ${m[1]} (direction ${m[2]}°, height ${m[3]}°, ${m[4]} mm, ×${m[5]})`],
    [/^カメラ(\d+)として記憶しました。$/, m => `Remembered as Camera ${m[1]}.`],
    [/^(.+)を呼び出しました。$/, m => `Recalled ${figEn(m[1])}.`],
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
    [/^(.+)の大きさ・向きを戻しました。$/, m => `${T[m[1]] || m[1]}: size and turn reset.`],
    [/^(床|壁|天井)を初期値に戻しました。$/, m => `${T[m[1]]} back to the defaults.`],
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
  // the tables of the files loaded before this one (pose_size.js, pose_style.js, ...)
  (window.ODMPoserI18nEarly || []).forEach(t => Object.assign(T, t));
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
    for (const a of ["placeholder", "title", "aria-label", "alt"]) {
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
  // the browser's own dialogs (confirm, prompt, alert)
  for (const f of ["alert", "confirm", "prompt"]) {
    const o = window[f];
    window[f] = function (msg, ...rest) {
      if (lang === "en" && typeof msg === "string") { const r = tr(msg); if (r !== null) msg = r; }
      return o.call(window, msg, ...rest);
    };
  }
  // the switch: among the view's switches (an icon and its name), else in the header
  const btn = document.createElement("button");
  btn.type = "button";
  const opts = document.getElementById("viewOpts");
  if (opts){ btn.className = "ov-item"; btn.dataset.icon = "lang"; btn.title = "日本語 / English"; btn.appendChild(document.createElement("span")); }
  else btn.style.cssText = "position:absolute;top:12px;right:16px";
  const label = () => { (btn.querySelector("span") || btn).textContent = lang === "en" ? "日本語" : "English"; };
  btn.addEventListener("click", () => {
    lang = lang === "en" ? "ja" : "en";
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    document.documentElement.lang = lang;
    walk(document.body); label();
    if (typeof draw === "function") draw();
  });
  const header = document.querySelector("header");
  if (opts) opts.insertBefore(btn, document.getElementById("helpBtn"));
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
