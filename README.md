# ODM Poser（立体人形装置）

**ODM Poser** stands for **Omni-Directional Mannequin Poser**: a mannequin you pose and view from
any direction. Its Japanese name is 立体人形装置.

A stick-and-circle pose editor (pseudo 3D). Pose a simple figure — circles for the joints, lines
for the bones, two blocks for the torso — and export it as an OpenPose picture, a line-and-circle
rough ("atari"), and JSON.

[日本語は下にあります](#日本語)

## Use

Open `web/editor/index.html` in a browser. The export buttons save the pictures and the pose;
"ファイルから読込 / Load from files" in the user presets box loads your own presets.

To install it as an app (PC, phone, tablet; works offline), see **[docs/APP.md](docs/APP.md)**
(日本語: [docs/APP-JA.md](docs/APP-JA.md)); `python tools/serve.py` serves it on this computer.

To use it as a ComfyUI node, install [ODM-Poser-ComfyUIBridge](https://github.com/qwaxgo/ODM-Poser-ComfyUIBridge)
(that repository alone installs everything, this editor included).

## Editing

- **Pose mode**: drag a joint (bone lengths are kept; dragging toward you tilts the bone toward
  you). A hand or foot drags its whole arm or leg (two-bone IK); Shift drags that bone only.
  Double-click flips a bone toward / away from the camera. The side view moves depth directly.
- **Every joint turns on three axes** in the "selected joint" panel (forward / sideways / twist;
  the head: nod, tilt, turn left and right — the face cross follows).
- **Pins**: tick "fix this joint" or Alt+click. A pinned hand or foot stays where it is while
  the rest moves; dragging the elbow / knee of a pinned limb swings it around.
- **Hands**: select the small circle at the knuckles to bend the wrist, turn the palm (the
  forearm's twist) and pick the hand's shape; the fingers bend toward the palm, so a fist shows
  its knuckles and the hand reads from any side. Shapes: open, fist, peace, point, grip, pinch,
  cup, trigger and more.
- **Body mode**: bone lengths, joint sizes, head size, whole-body scale, height in cm, female /
  male builds, left-right symmetry.
- **Perspective mode**: camera direction, height, roll (Shift+drag tilts the camera off level),
  and lens (wide angle = strong perspective). Grabbing a vanishing point or the eye level of the
  ruler moves the camera to match.
- **Place mode**: the camera stays; drag a vanishing point to turn the ruler, drag the box guide
  and objects over the floor (Shift+drag: up and down, wheel: turn).
- **Perspective ruler**: 1-, 2- or 3-point guide lines, the eye level and a box guide (width,
  height, depth and position in cm). The vanishing points come from the camera, so the ruler has
  the figure's perspective. Editor only; "Ruler picture" saves it as a transparent PNG.
- **Human joint limits** (on by default) keep knees, elbows, neck and so on in a human range.
- **Several figures**: "Add a figure" / "Duplicate" in the Figures box. The one selected is edited
  (pose, body, props, auras, wire); the others are drawn lighter, and clicking one of their circles
  switches to it. Floor, walls, objects, the ruler and the camera are shared; the rough, the
  OpenPose picture (one person each) and the composition picture show everyone.
- **Export size**: an aspect ratio (1:1, 3:4, 16:9, A paper, 2.35:1 or your own) and the long side
  (up to 8192 px) set the width and height; the view keeps that ratio.
- **Composition picture**: "Save composition" saves what the front view shows at that size, with
  the parts you tick (figures, props, objects, floor and walls, the ruler, auras) on white, clear or
  the screen's background.
- **Solid torso** (a switch above the views, on by default): the chest and pelvis are drawn as
  blocks with depth; off, as flat trapezoids.
- **Hidden lines dashed** (a switch above the views): what lies behind a body or an object is drawn
  dashed, in the view and in every export. With a clear background the composition picture is lines
  only (auras as outlines).
- **Light / dark**: the button at the top right (auto follows the system).

## Props and scene

About 250 things as simple shapes (cylinders, boxes, spheres, discs, cones, rings, domes,
outlines): one- and two-handed weapons (huge slab sword, huge lance, gun lance, great axe ...),
polearms, guns (sniper rifle, shotgun, minigun, arm cannon, large crossbow guns; a bayonet on
rifles), grenades and dynamite, bow and shields, staff and grimoire, instruments and mic,
stationery and books, tableware, food and drinks, fruit and vegetables, flowers, daily items,
laptop and controllers, lab glassware, sports gear, chairs and desks, rides (skateboard, kick
scooter, scooter, moped, bicycle, motorbike, snowboard, surfboard ...), things to grab, effects
(energy ball, beam, hand blade, spinning saw disc, plasma ...), simple solids of any size in cm,
bags and baskets, and things worn on the head (hats, helmets, animal ears, glasses, goggles,
headphones ...), the torso, the waist, the back (backpack, cases) and the feet (skates, skis).

- Held things follow the wrist; two-handed things bring the other hand to the grip. Holding,
  wearing or mounting a thing sets the hand shapes it needs; letting go gives them back.
- Any held thing can be carried on the back, and any thing put down on the floor or an object
  (grounded); in the Place mode it is dragged (Shift: up and down) and turned with the wheel.
- Line colours per body part (head, torso, each arm, hand and leg), per thing and per object,
  for the floor / walls and the wire; they are kept in the exported rough too.
- Auras on the whole body or some parts: rising ki flames, a smooth glow, or crackling plasma.
- Chairs and rides seat the figure and put hands and feet on handles and pedals.
- Floor, wall and ceiling; grounding (free / no sinking into the floor / always on the floor);
  put the selected hand or foot on a surface; grab the nearest thing; hang from it.
- Objects: boxes (crate, floor slab, wall slab, building, step), prisms, cylinders, pyramids,
  cones and poles, sized in cm. With grounding on the figure stands on their tops (stepping up to
  40 cm); a selected joint can be put on a face and pinned; "Stand on it" puts the figure on top.
- Wire action: hang the figure from a point above by the chest, hips, a hand or an ankle.

The shapes are listed in `web/editor/pose_props.js` and `web/editor/pose_props_more.js`.

## Devices

Any current browser (Chrome, Edge, Safari, Firefox, Vivaldi, Brave, Samsung Internet, Silk) on
Windows, macOS, Linux (Ubuntu and others), iOS / iPadOS, Android and Fire OS. The layout follows
the screen: side by side on wide screens, one column with the panels in columns under the views on
upright monitors and tablets, the side view on request on phones, panels beside the view on phones
held sideways, and one screen each on dual-screen devices.

- **Camera without the Perspective mode** (the lens stays): as in Blender, middle-button drag
  turns the view, Shift+middle button moves it, Ctrl+middle button or the wheel zooms (Alt+drag on
  empty space without a middle button); the numeric keypad: 1 / 3 / 7 front, right, top (Ctrl: the
  other side), 2 4 6 8 turn by 15° (Ctrl: move), 9 round to the back, + − zoom, . the selected
  joint to the middle, Home the figure to the middle.
- **Camera lock and memory** (a panel in every mode): lock the camera so drags, swipes, pinches,
  the wheel, the keypad and the camera pad leave it; remember any number of cameras (direction,
  height, roll, lens, zoom, centre; saved with the pose) and recall them; show or hide the camera
  pad (on a computer too).
- **Touch**: tap a circle to pick it, then drag the picked circle; a one-finger swipe anywhere
  else turns the camera; two fingers pinch to zoom and move the view (the lens and the objects in
  the Perspective and Place modes); the camera pad on the front view (a stick to turn, a stick to
  move, a zoom slider); double-tap to flip a bone; the on-screen 「Shift」「固定」 keys stand for
  Shift and Alt.
- **Split screen** (on by itself on phones and tablets, "Split screen" at the top to switch): the
  views stay on the top half (the left half when held sideways) and the panels scroll on the other;
  "Hide panels" gives the views the whole screen.
- **Pens** (Apple Pencil, Galaxy S Pen, Wacom tablets and pen displays such as MovinkPad, on
  Windows, macOS and Linux): the tip drags, the barrel button is Shift, the eraser end pins.
- **Mac**: ⌘Z undoes; a trackpad pinch or scroll zooms smoothly.
- Big exports are kept within what the device can draw (iOS / iPadOS about 16.7 megapixels): the
  picture keeps its ratio and the status line says so.

## Language

The editor follows the browser's language (Japanese or English); the button at the top right
switches it and the choice is remembered. `?lang=en` or `?lang=ja` in the address forces one.

## Built-in poses

Eleven simple poses written as joint turns (standing, A-pose, T-pose, contrapposto, walking,
running, sitting on a chair, squatting, jump, fighting stance, hands on hips). Loading one keeps
the figure's body.

## User presets

Your own presets (JSON files) are loaded with "ファイルから読込 / Load from files" and listed under
"ユーザープリセット / User presets" with a group filter and a Japanese / English search; a mod can
add presets too. A file is a list of presets or `{"presets": [...]}`; a preset is

```json
{"group": "Standing", "name": "contrapposto 01", "P": [[0, 95, 0], [0, 111, 0], ...]}
```

`P` holds the 21 joints in centimetres (y up, the figure faces +z) in this order: pelvis, waist,
chest, neck, head, r_shoulder, r_elbow, r_wrist, l_shoulder, l_elbow, l_wrist, r_hip, r_knee,
r_ankle, r_toe, l_hip, l_knee, l_ankle, l_toe, r_hand, l_hand (the hands, wrist to knuckles; a
list of the first 19 also works, the hands then go on along the forearms). Only the bones' directions are taken; the figure
keeps its own body. `group` defaults to the file name.

## Mods

Mods add props, solid kinds, auras, hand shapes, poses, translations, panels and drawing / mouse
hooks without changing the editor: put `*.js` files in `mods/`, or clone a repository of mods into it.
Opened from disk, run `python tools/make_mods_list.py` first so the editor knows them. The API: [docs/MODDING.md](docs/MODDING.md) (日本語: [docs/MODDING-JA.md](docs/MODDING-JA.md)).
On a site without `mods/` (GitHub Pages, the installed app, a phone), install mods in the MOD panel from a
file or by URL; they are kept in the browser. Mods run with the editor's rights: install only mods you
trust; `?nomods` starts without them.

## Built with Claude Code

The code and documents of this repository were implemented by [Claude Code](https://claude.com/claude-code),
Anthropic's AI coding tool, under qwaxgo's design and direction.

## License

MIT, (c) 2026 qwaxgo. All shapes and code are original to this project.

---

## 日本語

**立体人形装置**（英語名 **ODM Poser**）は、線と丸の全身アタリを疑似3Dで動かすポーズエディタです。
ODM は **Omni-Directional Mannequin**（どの方向からでも見て動かせるマネキン人形）の略です。OpenPose 画像・アタリ画像・JSON として書き出せます。

- **使い方**：`web/editor/index.html` をブラウザで開く（書き出しボタンでファイルに保存、ユーザープリセットは「ファイルから読込」で選ぶ）。
- **アプリとして使う**：パソコン・スマホ・タブレットにアプリとして追加でき、オフラインでも開けます。方法は **[docs/APP-JA.md](docs/APP-JA.md)**（`python tools/serve.py` でこのパソコンから開けます）。
- **ComfyUI で使う**：[ODM-Poser-ComfyUIBridge](https://github.com/qwaxgo/ODM-Poser-ComfyUIBridge) を入れます（そのリポジトリだけで、このエディタも含めて導入できます）。
- **操作**：丸をドラッグ（骨の長さは保たれる）。手首・足首は腕・脚ごと（Shift でその骨だけ）。ダブルクリックで
  手前と奥を入れ替え。横図で奥行き。すべての関節を3軸（前後・左右・ねじり。頭はうなずく・かしげる・左右を向く）で
  回せます。関節の固定（ピン、Alt＋クリック）、手の関節（指の付け根の小さな丸）で手首の曲げ・手のひらの向き・手の形（指は手のひら側へ曲がって描かれ、どの向きからも手の向きが分かります）、体格モード、パースモード、人間の関節の限界。
- **小物・環境**：約250種の小物を簡単な形で（武器・銃・弓・盾・杖・楽器・文房具・食器・食べ物・花・日用品・
  コントローラー・スポーツ用具・椅子・机・乗り物・蔓や枝や鉄棒、エフェクト、大きさ自由の立体図形、手提げ・バッグ・かご、
  頭・胴体・腰・背中・脚に身に着ける物など）。床・壁・天井と接地、面に手足を着ける、つかまる、ぶら下がる、ワイヤーで吊る。
- **持つ・背負う・置く**：持たせると手の形が自動で握りに変わり、外すと戻ります。手に持つ物は背負え、どの小物も床や物体の上に置けます（接地）。置いた物は配置モードでドラッグ。ライフル類には銃剣を付けられます。
- **線の色**：頭・胴体・腕・手・脚ごと、小物・物体ごと、床と壁、ワイヤーの色を変えられます（書き出すアタリにも反映）。
- **オーラ**：全身や部位に、立ちのぼる気（炎）・なめらかな光・プラズマ（電撃）をまとえます。
- **パース定規**：1点・2点・3点透視の線、アイレベル、直方体のガイド（幅・高さ・奥行きと位置を cm で）。消失点はカメラから決まるので人物と同じパースになります。パースモードで消失点やアイレベルをつかむとカメラが動き、配置モードではカメラはそのままで消失点をつかむと定規が回ります。エディタ上だけの表示で、「定規の画像」で透明な PNG を保存できます。
- **カメラの傾き**：パースモードで Shift＋ドラッグ（または「傾き」）で水平でなくできます（±90°）。
- **物体**：直方体（箱・床・壁・建物・段差）、角柱、円柱、角錐、円錐、支柱を cm の大きさで置けます。配置モードでドラッグして動かし（Shift で上下、ホイールで向き）、接地をオンにすると上に立ちます（40cm までの段は乗り上げ）。選んだ関節を面に着けて固定する、上に立たせる、もできます。
- **複数の人物**：「人物」の欄の「人物を追加」「複製」。編集するのは選んだ人物だけ（ポーズ・体格・小物・オーラ・ワイヤー）で、ほかの人物は薄く表示され、その丸をクリックすると切り替わります。床・壁・物体・定規・カメラは共通。アタリ・OpenPose（1人ずつ）・構図の画像には全員が入ります。
- **書き出しの比率と解像度**：比率（1:1・3:4・16:9・A判・2.35:1・自分で指定）と長い辺（最大 8192 px）から幅と高さを決めます。画面の図もその比率になります。
- **構図の画像**：「構図を保存」で、正面の図をその大きさで保存。入れるもの（人物・小物・物体・床と壁・パース定規・オーラ）と背景（白・透明・画面と同じ色）を選べます。
- **胴体を立体に**（図の上のスイッチ、最初はオン）：胸と骨盤を厚みのある台形の箱で描きます。オフにすると平らな台形。
- **隠れた線を破線に**（図の上のスイッチ）：体や物体の陰に隠れた線を破線で描きます（画面と書き出しの両方）。構図の画像を背景「透明」で保存すると、線だけの透過画像になります（オーラも輪郭だけ）。
- **ライト／ダーク**：右上のボタンで切り替え（自動はシステムの設定に合わせる）。
- **端末**：Windows・macOS・Linux（Ubuntu など）・iOS／iPadOS・Android・Fire OS の今のブラウザ（Chrome・Edge・Safari・Firefox・Vivaldi・Brave・Samsung Internet・Silk）。画面に合わせて、横長は左右に、縦置きモニターとタブレットは図の下に欄を段組みで、スマホは横の図をボタンで、横向きのスマホは図の横に欄を、2画面の端末は画面ごとに並べます。
- **カメラ（パースモード以外でも。レンズはそのまま）**：Blender と同じく、中ボタンのドラッグで回す、Shift＋中ボタンで動かす、Ctrl＋中ボタンかホイールで拡大縮小（中ボタンがなければ何もない所を Alt＋ドラッグ）。テンキー：1・3・7 で正面・右・上（Ctrl で反対側）、2・4・6・8 で15°ずつ回す（Ctrl で動かす）、9 で裏へ、＋－ で拡大縮小、. で選んだ関節を中心に、Home で人物を中心に。
- **カメラの固定と記憶**（どのモードでも出る欄）：固定すると、ドラッグ・スワイプ・2本指・ホイール・テンキー・カメラパッドではカメラが動きません。今のカメラ（向き・高さ・傾き・レンズ・拡大・中心）をいくつでも記憶して呼び出せます（ポーズと一緒に保存）。カメラパッドの表示・非表示もここで（パソコンでも出せます）。
- **タッチ**：丸をタップして選び、選んだ丸をドラッグして動かす。それ以外の所を1本指でスワイプするとカメラが回り、2本指でつまむと拡大縮小、そのまま動かすと移動（パース・配置モードはレンズ・物体のまま）。正面の図のカメラパッド（回すスティック・動かすスティック・拡大のスライダー）でも動かせます。ダブルタップで骨の手前と奥を入れ替え。画面の「Shift」「固定」ボタンが Shift と Alt の代わり。
- **分割表示**（スマホ・タブレットでは自動でオン。上の「分割表示」で切り替え）：図を画面の上半分（横向きは左半分）に固定し、もう半分で操作欄をスクロール。「操作欄を隠す」で図を全画面に。
- **ペン**：Apple Pencil、Galaxy の S ペン、ワコムのペンタブレット・液晶ペンタブ（MovinkPad など。Windows・macOS・Linux）。ペン先でドラッグ、サイドボタンは Shift、消しゴム側は固定。
- **大きな書き出し**：端末が描ける大きさ（iOS／iPadOS は約 1670 万画素）を超えるときは、比率を保って小さくし、そのことを表示します。
- **言語**：ブラウザの言語に合わせて日本語／英語。右上のボタンで切り替え（覚えます）。`?lang=en` でも指定できます。
- **組み込みポーズ**：11種（立ち・Aポーズ・Tポーズ・コントラポスト・歩く・走る・椅子に座る・しゃがむ・ジャンプ・ファイティングポーズ・腰に手）。関節の角度で作ったもので、体格はそのまま。
- **ユーザープリセット**：自分のプリセット（JSON）を「ファイルから読込」で読むと一覧に出ます（形式は上の User presets）。MOD からも足せます。
- **MOD**：`mods/` に `*.js` を置くと、小物・物体・オーラ・手の形・ポーズ・翻訳・自分の欄・描画やマウスのフックを追加できます（MOD のリポジトリを `mods/` に clone しても可。説明：`docs/MODDING-JA.md`）。直接開くときは `python tools/make_mods_list.py` を先に実行。サイトやスマホでは MOD 欄の「ファイルから入れる」「URLから追加」で入れられます（ブラウザに保存）。信頼できる MOD だけを入れてください（`?nomods` で MOD なし）。
- **Claude Code での実装**：このリポジトリのコードとドキュメントは、qwaxgo の設計と指示のもとで、Anthropic の AI コーディングツール [Claude Code](https://claude.com/claude-code) が実装しました。
- **ライセンス**：MIT（c）2026 qwaxgo。
