# 立体人形装置の MOD

MOD は、エディタの起動時に読み込まれる JavaScript のファイルです。**MOD API**（`window.ODMPoser`、
`web/editor/pose_api.js`）を通して、次のものを追加できます。

- 小物（手に持つ・身に着ける・乗る・床に置く・つかまる物）と、その分類
- 物体の種類（大きさを決めた直方体・角柱・円柱・角錐・円錐）
- オーラの種類（描き方を自分で書く）と、オーラをまとう部位
- 手の形、組み込みポーズ、ユーザープリセット
- 日本語の表示に対する英語（英語表示のとき）
- 横の欄に出す自分の欄、描画・編集・元に戻す／読み込み・モード・マウスへのフック

API の版：**1.2.0**。English: [MODDING.md](MODDING.md)（こちらが正式な説明で、内容は同じです）。

> **安全のために。** MOD はエディタのページの中で、エディタと同じ権限で動くプログラムです。信頼できる MOD だけを
> 入れてください。エディタのアドレスの末尾に `?nomods` を付けると、MOD なしで開きます（MOD のせいで動かなくなったときなど）。

## まず試す

1. 下の「MOD のファイル」の例を `mods/mymod.js` として保存します（または MOD のリポジトリを `mods/` に clone。このページの最後）。
2. `web/editor/index.html` を直接開くときは、`python tools/make_mods_list.py` を実行してから開き直します
   （エディタを載せているページが一覧を用意する場合は、開き直すだけ）。
3. 横の欄のいちばん下の **MOD** 欄に、読み込んだ MOD が並びます（✓ 読み込み済み、✗ はエラーの内容つき）。

MOD 欄では、`mods/` フォルダがない場所（GitHub Pages などのサイト、アプリとして追加したもの、スマホ・タブレット）でも MOD を使えます。

- **ファイルから入れる（この端末）**：選んだ MOD をこのブラウザに保存し（IndexedDB）、毎回読み込みます。同じ名前のファイルを入れると入れ替わります。非公開の MOD も端末の外には出ません。
- **URLから追加**：アドレスを覚え、開くたびに新しい版を読みます。オフラインでは前回読んだものを使います。GitHub のファイルのページ（`github.com/…/blob/…`）も使えます。公開されているアドレスにしてください（非公開リポジトリのファイルはページから読めません）。
- **今回だけ読み込む**：選んだ `.js` をその場で動かし、保存はしません。MOD を作っている途中で試すのにいちばん手早い方法です。

ブラウザに保存した MOD は、同じ欄で無効にしたり外したりできます（エディタを開き直すと反映）。`mods/` フォルダの MOD のあとに読み込まれ、`?nomods` を付けるとこれも読み込みません。

`mods/*.js` と `mods/<フォルダ>/*.js` を、パスの順に読み込みます。名前が `_` か `.` で始まるファイルやフォルダは読み込みません（MOD を一時的に止めるのに使えます）。

`mods/` の中身は git に入りません。

## MOD のファイル

```js
ODMPoser.registerMod({
  id: "mymod",                 // 小文字・数字・_ と -。ほかの MOD と重ならない名前
  name: "My mod",              // MOD 欄に出る名前
  version: "1.0.0",
  api: 1,                      // この MOD が前提にする API の版（メジャー番号）
  init(api){
    api.props.addCategory("mymod", "マイMOD", "My mod");
    api.props.add("mymod:club", {
      ja: "こん棒", en: "Club", cat: "mymod", place: "hand", pose: "grip",
      parts: [api.shapes.handle(-8, 30, 2), api.shapes.C(0, 30, 0, 0, 60, 0, 5)],
    });
  },
});
```

`init(api)` は読み込みの直後に一度だけ呼ばれます。中でエラーが起きると、その MOD は ✗ になってエラーの内容が出ますが、
エディタはその MOD なしで動き続けます。あとでフックの中でエラーが起きたときも ✗ になり、その回のフックだけ飛ばします。

**キーの付け方。** 追加する物には、MOD の id で始まるキーを付けてください（例：`mymod:club`。手の形のキーは
英小文字と _ だけなので `mymod_fist`）。すでにあるキーを追加するとエラーです（定義に `replace: true` があれば置き換え）。

## 単位と向き

世界の単位は **cm**、**y が上**、床が y = 0 です。人物は **+z** を向き、人物の右側が x < 0（カメラと向き合うと画面の左）。
立った姿勢で身長は約 168 cm です。

関節は 19 個です（`api.joints.names`、番号はこの並び）。

```text
 0 pelvis 腰   1 waist ウエスト   2 chest 胸   3 neck 首   4 head 頭
 5 r_shoulder 右肩  6 r_elbow 右肘  7 r_wrist 右手首     8 l_shoulder 左肩  9 l_elbow 左肘 10 l_wrist 左手首
11 r_hip 右股関節  12 r_knee 右膝  13 r_ankle 右足首  14 r_toe 右つま先
15 l_hip 左股関節  16 l_knee 左膝  17 l_ankle 左足首  18 l_toe 左つま先
```

`api.joints.parent[i]` はその関節の親の番号です（腰は −1）。

## 小物

小物は、それぞれの座標系の中に簡単な**形**を並べて描きます。座標系は `place` で決まります。

| place | どこにあるか | 軸（原点） |
|-------|------------|-----------|
| `hand` | 手に持つ | 原点 = 握り拳の中心。**+y** = 握りに沿って親指の方（剣の刃）、**+z** = 前腕の向き（銃身）、**+x** = 手のひらから外へ |
| `body` | 胸の前に構える（楽器など） | 原点 = 胸の関節。+x 人物の左、+y 上、+z 前 |
| `world` | 床に置く（椅子・乗り物） | 原点 = 床。+y 上、+z = 使うときに人物が向く方 |
| `grab` | つかまる物（蔓・鉄棒） | `world` と同じ。`grab` に手足がつかむ線を書く |
| `wear` | 身に着ける | 下の `at` |

身に着ける物（`place: "wear"`）は `at` で場所を決めます。

| at | 原点と軸 | 単位 |
|----|---------|------|
| `head` | 頭の中心。+x 人物の左、+y 上、+z 顔の向き | **頭の半径**（1 = 半径。頭身が変わっても合う） |
| `chest` | 胸の関節。+x 左、+y 上、+z 前 | cm |
| `back` | `chest` と同じ（z < 0 を使う） | cm |
| `waist` | 腰の関節。+x 左、+y 上、+z 前 | cm |
| `feet` | 両足それぞれ（同じ形を片足ずつ）。原点 = 足首、+z 足裏に沿ってつま先へ、+y 上、**+x 外側** | cm |
| `hands` | 両手それぞれ。`hand` と同じ座標系 | cm |

何か所にも着ける物は、`at` と `parts` の代わりに `sets` を使います。
`sets: [["feet", [...板]], ["hands", [...ストック]]]`（ほかに `"r_foot"`、`"l_foot"`、`"r_hand"`、`"l_hand"`）。

### 形

形はキーが一つのオブジェクトです（`api.shapes` に作る関数があります）。

| 形 | 数値 | 関数 |
|----|------|------|
| 円柱 | `c: [x1,y1,z1, x2,y2,z2, r]` | `C(...)`、`handle(lo, hi, r)`（y に沿った握り） |
| 箱（座標系の軸に沿う） | `b: [cx,cy,cz, sx,sy,sz]` | `B(...)` |
| 球 | `s: [cx,cy,cz, r]` | `SP(...)` |
| 円盤 | `d: [cx,cy,cz, nx,ny,nz, r]`（中心・法線・半径） | `D(...)` |
| 円錐 | `k: [bx,by,bz, ax,ay,az, r]`（底の中心・頂点・底の半径） | `K(...)` |
| 輪 | `t: [cx,cy,cz, nx,ny,nz, R, r]`（輪の半径 R、太さ r） | `T(...)` |
| ドーム | `h: [cx,cy,cz, nx,ny,nz, r]`（n の側の半球） | `H(...)` |
| 線 | `l: [[x,y,z], [x,y,z], ...]`（輪郭・稲妻など） | `L(点の並び)`、`ellipse(cx,cy,cz, rx,ry)` |

`pair(s => [...])` は左右両方の形を返します（`s` が +1 = 人物の左、−1 = 右）。

### 小物の項目

| 項目 | 意味 |
|------|------|
| `ja`、`en` | 名前（必須） |
| `cat` | 分類のキー（必須。自分の分類は `props.addCategory` で追加） |
| `place` | `hand`・`body`・`world`・`grab`・`wear`（必須） |
| `parts` | 形の並び（または `make`／`sets`） |
| `pose` | 持ったときの手の形（`grip`・`trigger`・`pinch`・`cup`・`fist`・`open` など、または MOD が追加した形） |
| `grip2`、`pose2` | 両手持ち：もう片方の手が持つ所（小物の座標で [x, y, z]）と、その手の形 |
| `mount` | `world`／`body`：関節を合わせる所 `{pelvis: [x,y,z], r_wrist: [...], l_ankle: [...]}`（座面・ハンドル・ペダル） |
| `hands` | 着けたとき・構えたときの手の形 `{r: "grip", l: "claw"}` |
| `at`、`sets` | `wear`：着ける場所（上の表） |
| `grab` | `grab`：つかむ線 `[[[x,y,z], [x,y,z]], ...]` |
| `bayonet` | 銃口 [x, y, z]：「銃剣を付ける」が出ます（刃は +z の向き） |
| `glow`、`color` | この色で光って描く（エフェクト） |
| `dims`、`make` | cm で大きさを決める：`dims: [["幅", 20], ["高さ", 30]]`、`make: ([w, h]) => [形の並び]` |
| `scalable` | 大きさのスライダーで大きさを変える物 |
| `note`、`noteEn` | 一覧の下に出る説明と、その英語 |

持つ・着ける・合わせると、小物が求める手の形に自動で変わり、外すと戻ります。手に持つ物と構える物は背負え、
どの小物も床や物体の上に置けます。

## api オブジェクト

`init(api)` が受け取るオブジェクトです。ここに書いていないものは内部の物で、版によって変わることがあります。

### 状態

| 呼び出し | すること |
|---------|---------|
| `api.state()` | エディタの状態 `S`（元に戻す・読み込みで入れ替わるので、毎回呼んで取る） |
| `api.data()` | **この MOD 専用のデータ** `S.mods[id]`。ポーズの JSON に保存され、Ctrl+Z で戻る |
| `api.edit(fn, メッセージ?)` | 変更はこれで：元に戻す用に覚え、`fn(S)` を実行し、シミュレーション・欄の更新・再描画 |
| `api.redraw()` | 描き直す（元に戻す対象にしない） |
| `api.say(メッセージ, 警告?)` | 下の状態表示に出す |
| `api.mode()` | `"pose"`・`"body"`・`"persp"`・`"place"` |
| `api.selectedJoint()` | 選んでいる関節の名前（なければ `null`） |

MOD が読める（`api.edit` の中で変えてよい）`S` の項目：`P`（19 関節の [x, y, z] cm）、`R`（関節の丸の半径）、
`hands`（`{r, l}` 手の形）、`cam`（`lens` mm、`yaw`・`pitch`・`roll` 度、`zoom`）、`pins`（固定した関節）、
`items`（出ている小物）、`solids`、`auras`、`colors`、`env`（床・壁・天井・接地）、`wire`、`ruler`。

### 関節・計算・画面

| 呼び出し | 返すもの |
|---------|---------|
| `api.joints.names`・`.index`・`.parent`・`.ja` | 関節の並び、名前→番号、親、日本語名 |
| `api.math.add / sub / mul / dot / cross / len / norm` | `[x, y, z]` の 3D ベクトル計算 |
| `api.math.rotAxis(v, 軸, ラジアン)`、`api.math.deg(度)` | ベクトルを回す、度→ラジアン |
| `api.view.project(p, W, H)` | 世界の点 → 正面の図のピクセル `{x, y, s（1 cm あたりのピクセル）, z}`（W × H のキャンバス） |
| `api.view.sideProject(p, W, H)` | 横の図で同じこと |
| `api.view.ray(x, y, W, H)` | 正面の図のピクセル → カメラからの光線 `{o, dir}`（世界の座標） |
| `api.view.camera()` | カメラの設定のコピー |
| `api.view.front()`、`api.view.side()` | 二つのキャンバス |

### 追加する

| 呼び出し | 追加するもの |
|---------|-------------|
| `api.props.addCategory(key, ja, en)` | 小物の分類 |
| `api.props.add(key, def)` | 小物（中身を確かめ、間違いがあれば項目名つきのエラー） |
| `api.props.get(key)`、`.keys()`、`.categories()` | 小物を調べる |
| `api.items.add(key, hand?)` | 小物を出す（欄のボタンと同じ。`hand` は `"r"` か `"l"`） |
| `api.solids.addKind(key, {ja, en, shape, size, sides?, at?})` | 物体の種類。`shape`：`box`・`prism`・`cyl`・`pyr`・`cone`、`size`：[幅, 高さ, 奥行き] cm、`at`：置く位置（腰から） |
| `api.solids.add(kind)` | 物体を置く |
| `api.auras.addKind(key, {ja, en, color, front?, margin?, draw})` | オーラの種類（下で説明） |
| `api.auras.addPart(key, {ja, en, chains})` | オーラが囲む関節：`chains: [["r_shoulder", "r_elbow", "r_wrist", "r_hand"], ...]`（`r_hand`／`l_hand` は拳の中心。chain ごとに輪郭が一つ） |
| `api.hands.add(key, {ja, en, curl})` | 手の形。`curl` は指ごと（親指・人差し指・中指・薬指・小指）の曲がり、0 伸ばす … 1 握る |
| `api.hands.set(side, key)`、`api.hands.shapes()` | 手の形を変える、手の形の一覧 |
| `api.poses.add(name, {en, turns})` | 組み込みポーズ。`turns: [[関節, "x" \| "y" \| "z", 度], ...]`（立った姿勢からその関節の骨を回す） |
| `api.poses.apply(name)` | そのポーズにする |
| `api.presets.add(list)` | ユーザープリセット `{group, name, P}`（P は 19 関節の cm。骨の向きだけを使います） |

### ファイル（API 1.1）

| 呼び出し | すること |
|---------|---------|
| `api.io.render("atari" \| "openpose")` | 書き出しの画像を PNG のデータ URL で（書き出しの大きさ） |
| `api.io.exportSize()`、`api.io.setExportSize(W, H)` | 書き出しの大きさ（ピクセル） |
| `api.io.poseJSON()` | 保存するときと同じポーズ（`version: 3` と状態すべて。`S.mods` も） |
| `api.io.sceneJSON()` | 環境だけ：小物・床と壁・ワイヤー・物体 |
| `api.io.loadPose(pose)` | ポーズを読み込む（オブジェクトか JSON の文字列）。ポーズでなければ false |

**オーラの種類。** `draw(ctx, info)` は輪郭ごとに一度呼ばれます（キャンバスの色はオーラの色に設定済み）。
`info.points` は輪郭を等間隔にたどる点 `{x, y, nx, ny}`（ピクセルと外向きの法線）、`info.size` はオーラの大きさ（ピクセル）、
`info.lineWidth` はこのキャンバスに合う線の太さ、`info.random()` は描き直しても同じになる 0〜1 の乱数、
`info.hull` は輪郭の角、`info.W`・`info.H` はキャンバスの大きさです。`front: true` で人物の前に描きます（既定は後ろ）。
`margin`（既定 0.6）は関節から輪郭までの距離（大きさに対する割合）。

### 翻訳

ページは日本語で書かれていて、英語表示のときに一つずつ英語を探します。

| 呼び出し | すること |
|---------|---------|
| `api.i18n.add({"日本語": "English", ...})` | 単語や文（文全体で一致） |
| `api.i18n.addRule(正規表現, fn)` | 中身が変わる文のための規則（下の例） |
| `api.i18n.lang()` | `"ja"` か `"en"` |

```js
api.i18n.addRule(/^(.+)を投げました。$/, m => `Threw the ${m[1]}.`);   // api.say で出すメッセージの英語
```

小物・物体・オーラ・手の形・ポーズの追加は、`en` を書けば英語も登録されます。

### 自分の欄

`api.ui.addSection({title, titleEn?, html, at?})` で横の欄に自分の欄を追加します（MOD 欄の上。`at: "top"` でいちばん上、API 1.1）。戻り値はその要素です。
表示は日本語で書いて `api.i18n.add` で英語を足すか、英語だけで書きます。要素の id には MOD の id を頭に付けてください。
`api.ui.$(id)` は `document.getElementById` と同じです。

### イベント

`api.on(イベント, fn)`：

| イベント | fn が受け取るもの | 説明 |
|---------|-----------------|------|
| `drawBehind` | `ctx, W, H, opts` | 正面の図と書き出しで、すべての前（いちばん下）に描く |
| `draw` | `ctx, W, H, opts` | すべての後（人物の上）に描く。アタリ画像の書き出し中は `opts.export` が true |
| `drawSide` | `ctx, W, H, opts` | 横の図。環境のあとに描く |
| `afterEdit` | `moved`（関節の番号か −1） | 編集のたび、シミュレーションのあと |
| `sync` | なし | 元に戻す・ポーズの読み込み・プリセットのあと：ここで `api.data()` から自分の欄を更新する |
| `mode` | 新しいモード | モードのボタン |
| `pointerDown` | `canvas, x, y, event` | ドラッグを引き受けるなら `{move(x, y, event)}` を返す（何も返さなければ素通り）。x, y はキャンバスのピクセル。エディタが先に元に戻す用に覚えます |
| `wheel` | `x, y, step, event` | 使ったら `true` を返す（step は +1／−1） |

描画のフックの前後で、キャンバスの状態（`ctx`）は保存・復元されます。

**マウス・タッチ・ペン（API 1.2）。** `pointerDown`、ドラッグの `move`、`wheel` には、どの入力でも同じ形のイベントが渡ります：
`{shiftKey, altKey, ctrlKey, metaKey, pointerType（"mouse"・"touch"・"pen"）, pointerId, button, buttons, pressure, clientX, clientY, preventDefault(), original}`。
`shiftKey` と `altKey` には、タッチ画面の「Shift」「固定」ボタン、ペンのサイドボタンとマウスの右ボタン（Shift）、ペンの消しゴム側（Alt）も入ります。
`original` はブラウザのイベントそのものです。2本指のピンチ・トラックパッド・マウスホイールは、どれも `wheel` の 1 段として届きます（ポーズ・体格モードのピンチはカメラを動かし、`wheel` には届きません）。
一度書けば、マウス・指・Apple Pencil・S ペン・ワコムのペンのどれでも動きます。

## 保存と互換性

- `api.data()` の中身と、MOD が追加した小物・物体・オーラは、ポーズの JSON に保存されます（`api.io.poseJSON()` で渡すものにも入ります）。
  MOD なしで開いてもファイルには残り、エディタが知らない小物とオーラは描かず、知らない物体の種類は直方体として描きます。
- API はセマンティック バージョニングに従います。1.x では追加はあっても、ここに書いたものは動き続けます（1.2 でマウス・タッチ・ペンのイベントを統一、1.1 で `api.io` と `addSection({at})` を追加）。`api: 2` の MOD は
  API 1 のエディタでは読み込みません。
- API はこのページに書いたものだけです。エディタのほかの関数や変数は、版によって変わることがあります。

## MOD のリポジトリ

MOD は専用の git リポジトリに置けます。`mods/` に clone すると、その直下の `*.js` が読み込まれます（それより深いフォルダは
読まないので、メモや素材やテストを置けます）。

```
cd <エディタのフォルダ>/mods
git clone <MOD のリポジトリ>
```

更新はそのフォルダで `git pull` して、エディタを開き直します（直接開くときは、ファイルを増やしたり減らしたりしたら
`tools/make_mods_list.py` をもう一度実行）。`mods/` は git に入らないので、clone したリポジトリがエディタのリポジトリと混ざることはありません。
