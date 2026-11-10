// Japanese / English for the editor. The page is written in Japanese; in English mode every
// text node, placeholder and title (also the ones the editor adds later) and the canvas
// labels are shown through this table and the rules below. The choice is kept in this browser.
(() => {
  const KEY = "odm-poser-lang";
  const T = {
    // added later (the tall layout, head shape, colours, auras, the ruler's guide shapes ...)
    "⇅ 上下": "⇅ Top / bottom", "分類バーとメニューを画面の上へ・下へ": "The category bar and the menu to the top / bottom of the screen",
    "下へドラッグ・タップで閉じる": "Drag down or tap to close", "操作欄を閉じる（下へドラッグでも閉じられます）": "Close the panel (dragging it down closes it too)",
    "頭の形": "Head shape", "幅（左右）": "Width (left-right)", "高さ（上下）": "Height (up-down)", "奥行き（前後）": "Depth (front-back)",
    "伸ばした形": "When stretched", "球のまま伸ばす": "Stretch the ball", "円柱でつなぐ": "Join with a cylinder", "↺ 頭の形を戻す": "↺ Default head shape",
    "頭の大きさ（頭身）は変わりません。見た目の形だけを変えます。": "The head's size (heads tall) stays; only its shape changes.",
    "↺ カメラを初期状態に": "↺ Reset the camera", "カメラを初期状態に戻しました。": "The camera is back to the start.", "頭の形を戻しました。": "Head shape reset.",
    "カメラの向き（左右・上下・傾き）・レンズ・位置を、最初のカメラに戻します（記憶したカメラと固定は残ります）。":
      "Puts the camera's direction (left-right, up-down, roll), lens and position back to the first camera (remembered cameras and the lock stay).",
    "「カメラの向き」はその場でカメラの角度を変え、「カメラの位置」は角度を変えずにカメラを動かします。位置は床の中心が 0、前後は人物の正面側が＋です。":
      "Camera direction turns the camera where it stands; Camera position moves it without turning it. Positions: 0 is the middle of the floor, front-back is + toward the figure's front.",
    "利き手（両手持ちの主に持つ手）": "Main hand (the one that holds a two-handed thing)",
    "対象": "Target", "人物（体の部位）": "Figure (body parts)",
    "対象（人物・床・物・オーラなど）を選び、色を変えるものにチェックを入れて色を選ぶか、#rrggbb のコードを入力します。チェックしていないものは既定の色のままです（書き出すアタリ画像にも反映）。":
      "Pick a target (figure, floor, things, auras ...), tick what to recolour and choose a colour or type a #rrggbb code. What is not ticked keeps its default colour (the exported rough picture too).",
    "頭の色": "Head colour", "頭の色コード": "Head colour code", "胴体の色": "Torso colour", "胴体の色コード": "Torso colour code",
    "右腕の色": "Right arm colour", "右腕の色コード": "Right arm colour code", "左腕の色": "Left arm colour", "左腕の色コード": "Left arm colour code",
    "右手の色": "Right hand colour", "右手の色コード": "Right hand colour code", "左手の色": "Left hand colour", "左手の色コード": "Left hand colour code",
    "右脚の色": "Right leg colour", "右脚の色コード": "Right leg colour code", "左脚の色": "Left leg colour", "左脚の色コード": "Left leg colour code",
    "放物線（炎の先が根元の中心から放射状に）": "Parabola (the flame's tips fan out from the root's middle)",
    "放物線の原点の高さ（根元の底辺から）": "Parabola origin height (from the root's base)",
    "炎の先が、根元の底辺中心を原点として放射状に出て、長さが左右の端へ向けて放物線状に短くなる":
      "The flame's tips fan out from the middle of the root's base and get shorter toward the sides along a parabola",
    "ガイド図形": "Guide shapes", "ガイドの辺を消失点まで延ばす": "Carry the guides' edges on to the vanishing points", "ガイドを置く": "Put a guide",
    "設置のタブを「ガイドとして置く」で開く": "Open the Objects tab with “Put as a guide”",
    "直方体・円柱・角柱・角錐など、設置のタブの図形を、定規の向きにそろえたガイドとしていくつでも置けます。ガイドは定規を出しているときだけ見え、アタリ画像には入らず、定規の画像に入ります。3軸ハンドルの「変形」では、引いた側の辺だけが延びます。ガイドを「回転」で回すと、パース定規とほかのガイドも一緒に回ります（前後・横に倒すと、消失点がアイレベルから外れます）。置く前のガイドを回したときと、設置のタブの「回転（向き・Y）」では、そのガイドだけが好きな角度に回ります（定規とずれた角度では、辺は消失点に向かいません）。":
      "Put the Objects tab's shapes (boxes, cylinders, prisms, pyramids ...) as guides turned to the ruler, as many as you like. Guides show only while the ruler does; they are not in the rough picture but are in the ruler picture. The 3-axis handles' Scale lengthens only the side pulled. Turning a guide with Rotate turns the perspective ruler and the other guides with it (tipped forward or sideways, the vanishing points leave the eye level). A guide about to be put, turned, and \"Turn (facing, Y)\" in the Objects tab turn that guide alone, to any angle (at an angle off the ruler its edges do not go to the vanishing points).",
    "面に立つ・貼り付く": "Stand on a face", "腰を動かすと近くの面に立つ": "Stand on a near face when the hips move",
    "配置モードで腰を動かして面に近づけると、その面に立つ（壁・天井・斜面では体ごと面に合わせる）": "In Place mode, hips brought near a face stand the figure on it (on a wall, a ceiling or a slope the whole body turns to it)",
    "面をクリックして立つ": "Click a face to stand on", "体をまっすぐに戻す": "Stand upright again",
    "次にクリックした面（床・壁・天井・物体の面）に立たせる": "Stand the figure on the face clicked next (floor, wall, ceiling or an object's face)",
    "面に合わせて傾いた体を、まっすぐに戻す": "Turn a body tilted to a face upright again",
    "床・壁・天井と、置いた物体の面（斜面も）に立たせます。壁では横向きに、天井では逆さに、斜面では面に垂直に、体ごと面に合わせます。面に着くのは、体のいちばん近い所・低い所です（ポーズによって足の裏・膝・手・頭など）。物体・壁・天井の面では、ポーズを変えてもいちばん低い所が面に着いたままです（床では上の「接地」の設定のとおり）。配置モードで体を面に近づける（15cm 以内）か、ボタンを押して面をクリックします。立っている面に沿って腰をドラッグでき、面から離すと貼り付きが外れます。":
      "Stand the figure on the floor, a wall, the ceiling or a face of an object put (slopes too). The whole body turns to the face: sideways on a wall, upside down on a ceiling, square to a slope. What touches the face is the body's nearest, lowest point (by the pose: the soles, a knee, a hand, the head ...). On an object's face, a wall or the ceiling, the lowest point stays on the face however the pose changes (on the floor, as the Grounding setting above says). Bring the body near a face in Place mode (within 15 cm), or press the button and click a face. Dragging the hips moves the figure along the face it stands on; pulled away from it, the figure lets go.",
    "逆さ・裏向きになる面にも立つ": "Also stand on faces that turn the body over",
    "腰を動かして近づけたとき、天井や物体の下側のように、体が逆さ・裏向きになる面にも立つ（オフでは、面をクリックしたときだけ）": "When the hips bring the body near, also stand on faces that turn it upside down or over, like a ceiling or an object's underside (off: only by clicking the face)",
    "近い面に立つ": "Stand on the near face", "この物体の、人物の体にいちばん近い面に、いちばん近い所を着けて立たせる（壁のような面では体ごと面に合わせる）": "Stand the figure on this object's face nearest to its body, its nearest point on it (on a wall-like face the whole body turns to it)",
    "立たせる面（床・壁・天井・物体の面）をクリックしてください。Esc でやめます。": "Click the face to stand on (floor, wall, ceiling or an object's face). Esc stops.",
    "面のクリックをやめました。": "Stopped picking a face.", "クリックした面に立たせました。": "Stood the figure on the face clicked.",
    "クリックした面に、面に合わせて立たせました（関節の固定は外しました）。": "Stood the figure on the face clicked, turned to it (pins removed).",
    "そこには面がありません。床・壁・天井か、置いた物体の面をクリックしてください。": "No face there. Click the floor, a wall, the ceiling or a face of an object put.",
    "体をまっすぐに戻しました。": "The body is upright again.",
    "ニュートラル（何も選ばない）": "Neutral (nothing chosen)", "持つ・置く": "Hold / put",
    "定規の倒れ": "Ruler lean", "定規を床に立てる": "Stand the ruler on the floor",
    "倒れをなくして、定規を床に立てる（向きはそのまま）": "Take away the lean and stand the ruler on the floor (its direction stays)",
    "定規が倒れているので、縦の線も実際には集まります（3点透視で見えます）。": "The ruler leans, so its verticals really meet too (3-point shows them).",
    "定規を床のグリッドにスナップ": "Snap the ruler to the floor grid",
    "床のグリッドは定規の向きに合わせて回ります（定規を出しているとき）。オンにすると、ガイドを動かしたとき、角がグリッドの交点（40cm おき）に、底が床に吸い付きます。":
      "The floor grid turns with the ruler (while the ruler shows). On: a guide moved sticks by its corner to the grid's points (every 40 cm) and by its bottom to the floor.",
    "地面と接地": "The ground and grounding", "壁と天井は、設置タブで物体（板）として置きます（いくつでも置け、3軸で回転できます）。": "Walls and ceilings are put in the Objects tab as slabs (as many as you like, turned on all three axes).",
    "選んだ物を接地させる": "Put the chosen thing on the ground", "接地させる物を、下の「出ている物」の一覧から選んでください。": "Choose the thing to put on the ground from the list of things out.", "接地させました。": "Put on the ground.",
    "色は #rrggbb の形で入れてください（例：#e0605a）。": "Type the colour as #rrggbb (e.g. #e0605a).",
    "持ち方": "Way of holding", "握る": "Grip", "カウチ（脇に挟む）": "Couched (under the arm)", "持つ位置（長い方向）": "Where it is held (along its length)",
    "↺ 持ち方と持つ位置を戻す": "↺ Way of holding and place to the start", "持ち方と持つ位置を戻しました。": "The way of holding and the place are back to the start.",
    "持ち方と持つ位置を、この小物の初期値に戻す": "Back to this thing's own start", "棒（ただの棒）": "Plain stick", "何の変哲もない棒。握るか、カウチで持つ": "A plain stick. Grip it, or hold it couched.",
    "↺ 色を初期状態に": "↺ Colours to the start", "線・床・壁・ワイヤー・小物・物体・オーラの色を、最初の色に戻す": "Back to the first colours: lines, floor, walls, wire, things, solids and auras",
    "線・床・壁・天井・ワイヤー・小物・物体・オーラの色を、最初の色に戻します（「元に戻す」で取り消せます）。": "Puts the colours of the lines, floor, walls, ceiling, wire, things, solids and auras back to the first ones (Undo takes it back).",
    "色の記憶": "Saved colours", "名前（例：夜の色）": "Name (e.g. night colours)",
    "いまの線の色（人物・床・壁・天井・ワイヤー）を名前をつけて記憶し、呼び出せます。小物・物体・オーラの色は含みません。このブラウザに残ります。": "Saves the current line colours (figures, floor, walls, ceiling, wire) under a name, to load again. Things, solids and auras keep their own colours out of it. Kept in this browser.",
    "ODM-Poserについて": "About ODM-Poser", "ODM-Poser について": "About ODM-Poser", "分類": "Categories",
    "人物の簡略表示": "The figure, simplified", "操作欄を閉じる・広げる（下へドラッグで閉じる）": "Close or widen the panel (drag down to close)",
    "下へドラッグで閉じる・タップで広げる": "Drag down to close, tap to widen", "閉じる": "Close",
    "リセット": "Reset", "人体のリセットを一箇所に（全部・ポーズ・体格・性別・位置・付随物）": "All resets for the figure in one place (all, pose, body, sex, place, attached things)",
    "この人物を戻す": "Put this figure back", "↺ 全部を初期状態に": "↺ All to the start",
    "ポーズ・体格・位置・向き・手の形を、新しい人物と同じにします（持ち物・オーラはそのまま）。": "Pose, body, place, turn and hands go to a new figure's (things and auras stay).",
    "↺ 性別の初期値に": "↺ To the sex's default",
    "女性・男性（最後に選んだ方）の初期状態に戻します。位置と持ち物はそのままです。": "Back to the female or male start (the one chosen last). Place and things stay.",
    "↺ ポーズだけ": "↺ Pose only", "立ちポーズに戻します。体格（骨の長さ・太さ）と位置はそのままです。": "Back to the standing pose. Body (bone lengths, thickness) and place stay.",
    "↺ 体格だけ": "↺ Body only", "骨の長さ・丸の太さ・大きさを初期値にします。ポーズ（骨の向き）と位置はそのままです。身長や脚の長さを変えても、足元は動きません。":
      "Bone lengths, circle thickness and size go to the start. Pose (bone directions) and place stay. The feet stay on the floor when height or leg length changes.",
    "↺ 位置と向きだけ": "↺ Place and turn only", "人物を床の中央に立て、向きと傾きを0に戻します。ポーズと体格はそのままです。": "Stands the figure at the floor's centre, turn and tilt to 0. Pose and body stay.",
    "すべて": "All", "↺ すべて最初の状態に": "↺ Everything to the start",
    "人物・小物・物体・床と壁・定規・カメラを、最初の状態に戻します（記憶したカメラは残ります）。「元に戻す」で取り消せます。":
      "Figures, things, objects, floor and walls, ruler and camera go to the start (saved cameras stay). Undo reverts it.",
    "付随物（持ち物・オーラ・ワイヤー・固定）": "Attached (things, auras, wire, pins)",
    // header, modes, views
    "立体人形装置": "",                         // the header shows "ODM Poser — Omni-Directional Mannequin Poser" after it
    "線と丸の全身アタリを、疑似3Dで動かします。アタリ画像・OpenPose 画像・ポーズ（JSON）を書き出せます。":
      "Pose a full-body rough of lines and circles in pseudo 3D. Export the rough, an OpenPose picture and the pose (JSON).",
    "ポーズ（骨の長さを保つ）": "Pose (bone lengths kept)",
    "体格（長さ・太さを変える）": "Body (lengths and thickness)",
    "パース（カメラとレンズ）": "Perspective (camera and lens)",
    "人間の関節の限界": "Human joint limits",
    "正面（カメラ）": "Front (camera)",
    "側面図（奥行き）": "Side (depth)",
    "身長": "Height",
    "丸をドラッグ：関節を動かす（骨の長さは保たれ、寄せた分だけ手前／奥へ傾く）。手首・足首は腕・脚ごと届く（Shift＋ドラッグでその骨だけ）。ダブルクリック：その骨の手前と奥を入れ替える。Alt＋クリック：その関節を固定（ピン。固定した手足は他を動かしても動かない）。腰の丸：全体を動かす。側面図でドラッグ：奥行きを直接動かす。ホイール：拡大縮小。Ctrl+Z：元に戻す、Ctrl+Y：やり直す。":
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
    "この端末には共有メニューがないため、構図の画像と投稿の文をコピーしました。": "This device has no share menu: the composition picture and the post's text are copied.",
    "構図の画像を付ける": "Attach the composition picture", "書き出しの「構図の画像」と同じ画像（白い背景）": "The same picture as Export's composition picture (on white)",
    "投稿には #ODMPoser #立体人形装置 とリンクが付き、リンクは「立体人形装置」の画像付きカードで表示されます。構図の画像は、スマホでは共有メニューに文と一緒に渡し、パソコンではコピーするので、投稿欄に貼り付けてください（Ctrl＋V・⌘V）。リンクに入る MOD は公式（GitHub の qwaxgo）のものだけで、ほかの MOD の小物・物体は単純な図形や棒になります。":
      "A post gets #ODMPoser #立体人形装置 and the link, shown as a card with the ODM Poser picture. The composition picture goes to the share menu with the words on a phone; on a computer it is copied: paste it into the post box (Ctrl+V / ⌘V). A link carries only the official mods (qwaxgo's on GitHub); props and solids of other mods become plain shapes and rods.",
    "リンクの編集データを読めませんでした（壊れているか、このブラウザが対応していません）。": "Could not read the link's editing data (it is broken, or this browser cannot).",
    "リンクを開く前の編集に戻しました（元に戻すで、リンクの編集データに戻れます）。": "Back to the editing before the link (Undo goes back to the link's).",
    "胴体を立体に": "Solid torso", "胴体を立体（厚みのある台形）で描きます。": "The torso is drawn as solid blocks.",
    "胴体を平らな台形で描きます。": "The torso is drawn as flat trapezoids.",
    "編集中の人物の胴体を立体（厚みのある台形）で描きます。": "This figure's torso is drawn as solid blocks.",
    "編集中の人物の胴体を平らな台形で描きます。": "This figure's torso is drawn as flat trapezoids.",
    "編集中の人物の胴体を厚みのある台形で描く（人物ごとに切り替え）": "Draw this figure's torso as thick trapezoids (each figure its own)",
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
    "オンにした時の位置の真上に支点ができます。手・足首・ロープで吊ると、その腕を上げる・逆さになるなど、ぶら下がれるポーズになります（体の重さが支点の真下に来る向き）。配置モードで腰をドラッグすると、ワイヤーの長さを保ったまま振れます。":
      "The anchor is set straight above where the figure is when you turn this on. Hung by a hand, an ankle or the rope, the body takes a pose it could hang in (that arm up, upside down ...; its weight right under the anchor). Dragging the hips in Place mode swings the figure on the wire.",
    "左足首（逆さ吊り）": "Left ankle (upside down)", "両手でロープ（ターザン）": "Both hands on a rope (Tarzan)",
    "ぶら下がるポーズにする": "Take a hanging pose", "手で吊ると腕を上げ、足首で吊ると逆さになるなど、吊った所に合わせて体を動かす":
      "Hung by a hand the arm goes up, by an ankle the body turns upside down: the body follows where it hangs",
    "片手でぶら下がるポーズにしました（腕を上げ、体を真下に）。": "Hanging by one hand (the arm up, the body right under it).",
    "片足でぶら下がるポーズにしました（逆さ吊り）。": "Hanging by one foot (upside down).",
    "両手でロープにつかまりました（ターザン）。配置モードで腰をドラッグすると振れます。": "Holding the rope with both hands (Tarzan). Drag the hips in Place mode to swing.",
    "ロープにつかまる（ターザン）": "Holding a rope (Tarzan)",
    "小物を単体で置く": "Things on their own", "単体で置いた物": "Things put on their own", "いまの人物に持たせる": "Give to this figure",
    "武器・道具・帽子なども、誰にも持たせずに床（物体の上）に置けます。配置モードでドラッグして動かせます（Shift＋ドラッグで上下、回すのは3軸ハンドル）。人物に持たせた物は「装備」で扱います。":
      "Weapons, tools, hats and the like can lie on the floor (or an object) held by no one. Drag them in Place mode (Shift + drag: up / down, the 3-axis handles turn it). What a figure holds is in Equip.",
    "いまの人物に持たせました（手の形も合わせました）。": "Given to this figure (its hand shape set too).",
    "腕・脚の太さを部位ごとに連動": "Arm and leg thickness as a whole limb",
    "肩・肘・手首、股・膝・足首の丸をまとめて太く・細くする（外すと関節ごと）": "Shoulder, elbow, wrist (thigh root, knee, ankle) grow thicker or thinner together (off: joint by joint)",
    "骨の長さ・丸の太さ・大きさを初期値にします。ポーズ（骨の向き）はそのままです。身長や脚の長さを変えても、足元（いちばん低い所）は動きません。":
      "Bone lengths, circle sizes and scales back to default. The pose (bone directions) stays. Changing the height or the legs' length, the feet (the lowest point) stay where they are.",
    "↺ この人物を性別の初期値に戻す": "↺ This figure back to its sex's default",
    "選んでいる人物のポーズ・体格・手の形・向きを、女性・男性（最後に選んだ方）の初期状態に戻す": "The selected figure's pose, body, hands and turn back to the default of its sex (female / male, as last chosen)",
    "ポーズも体格もすべて戻します。位置と持ち物はそのままです。": "Both the pose and the body go back. Where it stands and what it holds stay.",
    "腕・脚の太さを部位ごとにまとめて変えます。": "Arms and legs change thickness as a whole.", "太さを関節ごとに変えます。": "Thickness changes joint by joint.",
    "ポーズのプリセット": "Pose presets",
    "骨の向きだけが変わり、体格（骨の長さ・太さ）と位置はそのままです。体格は下の「体格プリセット」で。":
      "Only the bones' directions change; the body (bone lengths, thickness) and the place stay. Bodies are in Body presets below.",
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
    "置いた物は配置モードでドラッグして動かせます（Shift＋ドラッグで上下、回すのは3軸ハンドル）。":
      "Things put down can be dragged in the Place mode (Shift+drag: up and down, the 3-axis handles turn it).",
    "背負いました。": "Carried on the back.", "床・物体の上に置きました。配置モードでドラッグして動かせます。":
      "Put down on the floor / an object. Drag it in the Place mode.", "持たせました（手の形も合わせました）。": "Held again (the hand shape follows).",
    "接地させました。": "Grounded.", "直径": "Diameter", "長さ": "Length", "底の直径": "Base diameter", "底の一辺": "Base side",
    "外径": "Outer diameter", "太さ": "Thickness",
    "カウチ（脇に挟んで前へ突き出す）で持つ。柄は細く、先に槍身": "Held couched (under the arm, thrust forward). Thin shaft, the lance head at the end",
    "銃剣を付けた銃の形。カウチ（脇に挟んで前へ突き出す）で持つ": "A rifle with a bayonet fixed. Held couched (under the arm, thrust forward)",
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
    "ポーズ・体格・小物・オーラは、選んだ人物だけに効きます（ほかの人物は薄く表示）。ほかの人物の丸をクリックしても切り替わります。床・壁・物体・定規・カメラと、床に置いた物はみんなで共通です。位置と向きは編集中の人物を丸ごと動かします。":
      "Pose, body, props and auras apply to the selected figure only (the others are drawn lighter). Clicking another figure's circle switches too. Floor, walls, objects, the ruler, the camera and things put down are shared. Position and direction move the whole figure being edited.",
    "書き出す人物": "Figures in the picture", "全員": "Everyone",
    "単体で置く": "Place on its own", "誰にも持たせず、人物の前の床に置く": "Held by no one: put on the floor in front of the figure",
    "単体で置きました。配置モードでドラッグして動かせます（Shift＋ドラッグで上下、回すのは3軸ハンドル）。":
      "Placed on its own. Drag it in Place mode (Shift + drag: up / down, the 3-axis handles turn it).",
    // touch, pens, phones (index.html)
    "固定": "Pin", "タッチ用のキー": "Touch keys", "その骨だけ・上下に動かす（もう一度押すまで）": "Only that bone / up and down (till pressed again)", "丸をタップして関節を固定する（もう一度押すまで）": "Tap a circle to pin its joint (till pressed again)", "カメラを回す・動かすスティックと拡大のスライダー": "Sticks to orbit and pan the camera, a slider to zoom", "側面図": "Side view",
    "タッチ・ペン：1本指（ペン）でドラッグ、2本指でつまんで拡大縮小（カメラモードはレンズ）、ダブルタップで骨の手前と奥を入れ替え。Shift・固定は上のボタンで（ペンのサイドボタンは Shift、消しゴム側は固定）。":
      "Touch and pen: drag with one finger (or the pen), pinch with two to zoom (the lens in the Camera mode), double-tap to flip a bone toward / away. Shift and Pin are the buttons above (a pen's side button is Shift, its eraser end pins).",
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
    "消失点はカメラ（パース）から決まるので、人物と同じパースになります。カメラモードで消失点やアイレベルをつかむとカメラが動き、配置モードで消失点をつかむとカメラはそのままで定規が回ります。直方体のガイドは配置モードでドラッグして動かせます。定規はアタリ画像には入りません（「定規の画像」で透明な PNG を保存）。":
      "The vanishing points come from the camera, so the ruler has the figure's perspective. In the Camera mode, grabbing a vanishing point or the eye level moves the camera; in the Place mode, grabbing a vanishing point turns the ruler and the camera stays. Drag the box guide in the Place mode. The ruler is not in the rough picture (\"Ruler picture\" saves a transparent PNG).",
    "縦の消失点はカメラの高さで決まります。カメラモードでつかむとカメラが動きます。":
      "The vertical vanishing point follows the camera height. Grab it in the Camera mode to move the camera.",
    "1点透視の消失点は、カメラモードでつかむとカメラが動きます。": "Grab the 1-point vanishing point in the Camera mode to move the camera.",
    // place mode, solids (pose_solids.js)
    "配置（定規・物体）": "Place (ruler, objects)",
    "ドラッグ：カメラを回す（左右＝向き、上下＝高さ）。Shift＋ドラッグ：カメラを傾ける（水平でなくする）。ホイール：レンズ（広角ほどパースが強い）。人物の大きさは画面に合わせて保たれます。パース定規の消失点やアイレベルをつかむと、そこに合うようにカメラが動きます。":
      "Drag: orbit the camera (sideways = direction, up and down = height). Shift+drag: tilt the camera (off level). Wheel: lens (the wider, the stronger the perspective). The figure keeps its size on screen. Grabbing a vanishing point or the eye level of the ruler moves the camera to match.",
    "ドラッグではカメラは動きません（中ボタン・テンキー・カメラパッドでは動きます）。消失点をドラッグ：定規の向きを変える。直方体のガイドや物体をドラッグ：床の上で動かす（Shift＋ドラッグで上下）。その上でホイール：向きを回す。丸をクリック：関節を選ぶ（「物体に着ける」用）。":
      "Dragging does not move the camera (the middle button, the keypad and the camera pad do). Drag a vanishing point: turn the ruler. Drag the box guide or an object: move it over the floor (Shift+drag: up and down). Wheel over it: turn it. Click a circle: select the joint (for \"put the joint on it\").",
    "物体（床・壁・建物・柱など）": "Objects (floors, walls, buildings, poles ...)",
    "直方体（箱・台）": "Box (crate, stand)", "床（板）": "Floor slab", "壁（板）": "Wall slab", "建物": "Building", "段差": "Step",
    "角柱": "Prism", "円柱": "Cylinder", "円柱（太い・柱や建物）": "Cylinder (thick: columns, buildings)", "棒（細い円柱）": "Rod (thin cylinder)", "角錐": "Pyramid", "円錐": "Cone", "支柱": "Pole", "直方体": "Box",
    "置いた物体": "Objects in the scene", "複製": "Duplicate", "角の数": "Sides", "向き": "Turn",
    "選んだ関節を着ける": "Put the selected joint on it", "この上に立つ": "Stand on it",
    "配置モードで物体をドラッグすると床の上で動きます（Shift＋ドラッグで上下、回すのは3軸ハンドル）。「接地」をオンにすると物体の上にも立ちます（40cm までの段は乗り上げます）。「選んだ関節を着ける」は、選んだ物体（選んでいなければ一番近い物体）の面に関節を着けて固定します。書き出すアタリに描くかは「書き出すアタリにも床・壁を描く」に従います。":
      "In the Place mode, drag an object to move it over the floor (Shift+drag: up and down, the 3-axis handles turn it). With grounding on, the figure stands on objects too (it steps up to 40 cm). \"Put the selected joint on it\" puts the joint on a face of the selected object (or the nearest one) and pins it. Objects are in the exported rough when \"Draw floor and walls in the exported rough\" is on.",
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
    "女性の体格にしました。": "Female build applied.", "男性の体格にしました。": "Male build applied.", "女性の体格にしました（調整はそのままです）。": "Female build applied (your adjustments stay).", "男性の体格にしました（調整はそのままです）。": "Male build applied (your adjustments stay).", "体格・サイズ": "Body & sizes",
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
    "女性": "Female", "男性": "Male", "身長": "Height", "全体サイズ": "Overall size", "全身の太さ（太ももの付け根の直径）": "Whole-body thickness (thigh root diameter)", "全身の丸（頭・胴の幅・腕・脚）を同じ割合で太く・細くする。数字は太ももの付け根の丸の直径": "Makes every circle (head, torso width, arms, legs) thicker or thinner alike. The number is the thigh root circle's diameter", "大きさ（いちばん長い辺）": "Size (longest side)", "天面の幅": "Top width", "太さ": "Thickness",
    "↺ 体格を初期値に": "↺ Default build", "骨の長さ・丸の太さ・大きさを初期値にします。ポーズ（骨の向き）はそのままです。": "Bone lengths, circle sizes and scale go back to the defaults; the pose (the bones' directions) stays.",
    "カメラの位置（左右・上下・前後）": "Camera position (left-right, up-down, front-back)", "見る点（左右・上下・前後）": "Looks at (left-right, up-down, front-back)",
    "床の中心が 0。前後は人物の正面側が＋。位置を変えると、見る点を向いたまま向き（左右・上下）と拡大が決まります（傾きはそのまま）。":
      "0 is the middle of the floor; front-back is + toward the figure's front. A new position keeps looking at the point and sets the direction (left-right, up-down) and zoom (the tilt stays).",
    "カメラの向き": "Camera direction", "カメラの位置": "Camera position", "見る点": "Looks at",
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
    "書き出したファイルは、商用・AI の学習も含めて自由に使えます。クレジットは任意です。": "Exported files are free to use, commercially and with AI too. Credit is optional.",
    "利用条件（CC0 1.0）": "Terms (CC0 1.0)",
    "アタリ画像の内容": "What the rough picture shows", "構図（人物・小物・物体・環境）": "Composition (figures, things, objects, surroundings)",
    "人物と小物だけ": "Figures and things only",
    "構図では、下の「構図の画像に含める」のチェック（定規を除く）のとおりに、物体や環境も白い背景に描きます。":
      "Composition also draws objects and the surroundings on white, as the “In the composition picture” checks below say (without the ruler).",
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
    "側面図": "Side view", "右": "Right", "左": "Left", "上": "Top", "下": "Bottom", "隠す": "Hide",
    "側面図の置き場所": "Where the side (depth) view goes",
    "操作欄": "Panel", "操作欄をしまう": "Hide the panel", "操作欄を出す": "Show the panel", "操作欄をしまう・出す": "Hide / show the panel",
    "側面図を出す・隠す": "Show / hide the side view",
    "側面図を出しました（置き場所は側面図の隅で）。": "The side view is shown (where it goes: on the side view's corner).", "側面図を隠しました。": "The side view is hidden.",
    "置き場所": "Place", "操作欄の位置": "Panel", "分割表示": "Split screen", "操作欄をしまいました。": "The panel is put away.", "操作欄を出しました。": "The panel is shown.",
    "側面図を出す・隠す（置き場所は側面図の隅で）": "Show / hide the side (depth) view (where it goes: on the side view's corner)",
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
    "物体は床・天井と、定規の向きにそろえた壁（床板・壁板の物体も）に近づくと、面に吸い付きます。「回転も定規の向きに吸い付く」をオンにすると、物体・小物を回して定規の向き（90° ごと）から ±5° 以内に来たとき、その向きに吸い付きます。":
      "Objects stick to the floor, the ceiling and walls turned like the ruler (floor and wall slabs too) when they come near. With \"Turns stick to the ruler too\" on, objects and things turned to within ±5° of a ruler direction (every 90°) stick to it.",
    "回転も定規の向きに吸い付く（90° ごと）": "Turns stick to the ruler too (every 90°)",
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
    [/^ガイド：(.+)$/, m => `Guide: ${T[m[1]] || m[1]}`],
    [/^部位の長さ：(.+)$/, m => `Section length: ${T[m[1]] || m[1]}`],
    [/^(.+)に体を合わせて、合わせた関節を固定しました。$/, m => `Fitted the body to the ${name(m[1]).toLowerCase()} and pinned the fitted joints.`],
    [/^(.+)を(.+)に着けて固定しました。$/, m => SURFACE[m[2]] ? null : `Put the ${joint(m[1])} on the ${name(m[2]).toLowerCase()} and pinned it.`],
    [/^(.+)を固定しました（身長・頭身を変えても、長さと太さはそのまま）。$/,
      m => `Locked: ${name(m[1]).toLowerCase()} (changing the height or heads leaves their lengths and thickness).`],
    [/^(.+)を固定から外しました。$/, m => `Unlocked: ${name(m[1]).toLowerCase()}.`],
    [/^(選んだ小物|小物|物体|図形|オーラ)：(.+)$/, m => ({"選んだ小物": "Selected prop", "小物": "Prop", "物体": "Object", "図形": "Shape", "オーラ": "Aura"})[m[1]]
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
    [/^クリックした面に、いちばん平行な面を合わせて接地させました（(\d+)° 回しました）。$/, m => `Put its most nearly parallel face flat on the clicked face (turned ${m[1]}°).`],
    [/^構図の画像と投稿の文を共有メニューに渡しました。(.+)を選んでください。$/, m => `Handed the composition picture and the post's text to the share menu: pick ${m[1].replace("カカオトーク", "KakaoTalk").replace("オープンチャット", "LINE OpenChat")}.`],
    [/^(投稿画面を開き、)?構図の画像(と投稿の文)?をコピーしました。(.+)の投稿欄に貼り付けてください（Ctrl＋V・⌘V）。(文字数の上限があるため、リンクは編集データの入らないサイトのリンクです。)?$/,
      m => `${m[1] ? "Opened the post page and copied" : "Copied"} the composition picture${m[2] ? " and the post's text" : ""}: paste it into ${m[3].replace("カカオトーク", "KakaoTalk").replace("オープンチャット", "LINE OpenChat")}'s post box (Ctrl+V / ⌘V).${m[4] ? " The link is the site's own, without the editing data (the network's length limit)." : ""}`],
    [/^この端末では画像をコピーできないため、構図の画像を保存してから(.+)に添付してください。$/, m => `This device cannot copy pictures: save the composition picture, then attach it on ${m[1].replace("カカオトーク", "KakaoTalk").replace("オープンチャット", "LINE OpenChat")}.`],
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
    [/^(.+)の近い面に立たせました。$/, m => `Stood the figure on the near face of the ${(T[m[1]] || m[1]).toLowerCase()}.`],
    [/^(\d+)人目$/, m => `Figure ${m[1]}`],
    [/^前後 (-?\d+)°・横 (-?\d+)°$/, m => `Forward ${m[1]}° · sideways ${m[2]}°`],
    [/^(.+)（編集中）$/, m => `${figEn(m[1])} (editing)`],
    [/^(.+)を(複製して)?追加しました。いま編集しているのは(.+)です。$/,
      m => `Added ${figEn(m[1])}${m[2] ? " (a copy)" : ""}; now editing ${figEn(m[3])}.`],
    [/^(.+)を削除しました。$/, m => `Deleted ${figEn(m[1])}.`],
    [/^(.+)を編集しています。$/, m => `Editing ${figEn(m[1])}.`],
    [/^構図を (\d+)×(\d+) で保存しました。$/, m => `Composition saved at ${m[1]} × ${m[2]}.`],
    // objects (pose_solids.js); before the general rules below
    [/^(\d+)個を選んでいます（人物と物）。$/, m => `${m[1]} selected (figures and objects).`],
    [/^(\d+)個を選びました（人物(\d+)人）。$/, m => `Selected ${m[1]} (${m[2]} figure${m[2] === "1" ? "" : "s"}).`],
    [/^(\d+)個の物を(外しました|切り取りました|コピーしました|貼り付けました|選びました)。$/, m => `${{外しました: "Took away", 切り取りました: "Cut", コピーしました: "Copied", 貼り付けました: "Pasted", 選びました: "Selected"}[m[2]]} ${m[1]} objects.`],
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
