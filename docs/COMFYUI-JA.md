# ComfyUI で使う（導入ガイド）

立体人形装置を ComfyUI のノードとして使うための手順です。English: [COMFYUI.md](COMFYUI.md)

## 必要なもの（2つ）

ComfyUI で使うには、次の 2 つを入れます。

| 入れるもの | 何をするものか | 入れる場所 |
|-----------|---------------|-----------|
| **ODM-Poser**（このリポジトリ） | ノード「ODM Poser」と、ポーズエディタ本体 | `ComfyUI/custom_nodes/` |
| **ODM-Poser-ComfyUIBridge**（非公開リポジトリ） | エディタとノードをつなぐ部品（MOD）。エディタに「確定して閉じる」ボタンを出し、作ったポーズをノードに送ります | 上のフォルダの中の `mods/` |

ポーズエディタ本体は ComfyUI に依存しない単体の道具です。ComfyUI とのやりとりは、2 つめの部品がすべて受け持ちます。
2 つめを入れないと、ノードからエディタは開きますが、「確定して閉じる」ボタンが出ず、ポーズをノードに渡せません。

前もって必要なもの：

- ComfyUI（Windows ポータブル版など）
- git
- 非公開リポジトリを clone できる GitHub の設定（そのリポジトリへのアクセス権と、SSH 鍵の登録）

追加の Python パッケージは要りません（ComfyUI に入っている numpy・torch・Pillow・aiohttp だけを使います）。

## 入れ方

### 1. ノードとエディタを入れる

```
cd ComfyUI/custom_nodes
git clone https://github.com/qwaxgo/ODM-Poser
```

Windows ポータブル版なら、たとえば `C:\AI\ComfyUI_windows_portable\ComfyUI\custom_nodes` で実行します。

### 2. つなぐ部品（MOD）を入れる

手順 1 でできたフォルダの中の `mods` フォルダに clone します。

```
cd ODM-Poser/mods
git clone git@github.com:qwaxgo/ODM-Poser-ComfyUIBridge.git
```

入れたあとのフォルダはこうなります。

```
ComfyUI/custom_nodes/
  ODM-Poser/
    mods/
      ODM-Poser-ComfyUIBridge/
        comfyui.js
```

### 3. ComfyUI を再起動する

ComfyUI を一度再起動します（新しいノードを読み込むため）。

## 入ったか確かめる

1. ComfyUI の起動時のコンソールに、次の行が**出ていない**こと。出ていたら手順 2 ができていません。
   ```
   [ODM Poser] the ComfyUI bridge mod (comfyui.js) is not in mods/ ...
   ```
2. ノードを置く：キャンバスを右クリック →「Add Node」→「ODM Poser」→「ODM Poser」
   （キャンバスのダブルクリックで「ODM Poser」を検索しても置けます）。
3. ノードの「Open ODM Poser」を押すと、エディタが開きます。右側の欄のいちばん上に「ComfyUI」の欄
   （「確定して閉じる」「閉じる」）があり、いちばん下の「MOD」欄に「✓ ComfyUI bridge」と出ていれば完了です。

## 使い方

1. ノード「ODM Poser」を置き、「Open ODM Poser」を押す。
2. エディタでポーズを作る。書き出しの「幅」「高さ」が、ノードが出す画像の大きさになります。
3. 「確定して閉じる」を押す。ポーズ・画像・大きさがノードに渡り、エディタが閉じます（「閉じる」は渡さずに閉じます）。
4. ノードの出力を、ほかのノードにつなぐ。

| 出力 | 型 | 中身 |
|------|----|------|
| `pose_json` | STRING | 人物（19 関節の位置 cm、体の向き、ひねり、手の形、固定、カメラなど） |
| `scene_json` | STRING | 小物、床・壁・天井、ワイヤー、物体の設定 |
| `openpose` | IMAGE | OpenPose の画像（体 18 点＋両手 21 点ずつ、標準の色、黒い背景）。ControlNet（OpenPose）に |
| `atari` | IMAGE | アタリ画像（白地に線と丸、小物も簡単な形で）。下描きや img2img に |
| `width`、`height` | INT | エディタで決めた書き出しの大きさ |

確定した内容はワークフローに保存されます。次に「Open ODM Poser」を押すと、そのポーズから続けて編集できます。

`scene_json` は `{"items": [...], "env": {...}, "wire": {...}, "solids": [...]}` です。小物は
`{"key", "hand" または "base"＋"yaw", "off": [x, y, z], "rot": [x, y, z], "scale"}`（cm・度）、形の一覧は
`web/editor/pose_props.js` にあります。

## ユーザープリセット

`ODM-Poser/user_presets/` に自分のプリセット（`*.json`、形式は `user_presets/README.md`）を置くと、
ノードから開いたエディタの「ユーザープリセット」に自動で並びます（つなぐ部品が読み込みます）。
置いたあとはエディタを開き直すだけで、ComfyUI の再起動は要りません。

## ほかの MOD

`mods/` に置いた MOD（`*.js`、または MOD のリポジトリを clone したフォルダ）も、ノードから開いたエディタで読み込まれます。
置いたあとはエディタを開き直すだけです。MOD の作り方は [MODDING-JA.md](MODDING-JA.md)。

## 更新する

2 つのフォルダでそれぞれ `git pull` してから、ComfyUI を再起動します。

```
cd ComfyUI/custom_nodes/ODM-Poser
git pull
cd mods/ODM-Poser-ComfyUIBridge
git pull
```

## うまくいかないとき

| 症状 | 原因と対処 |
|------|-----------|
| エディタに「確定して閉じる」が出ない | つなぐ部品がありません。`mods/ODM-Poser-ComfyUIBridge/comfyui.js` があるか確かめる。フォルダ名やファイル名が `_` や `.` で始まっていると読み込まれません。エディタのアドレスに `?nomods` が付いていると MOD をすべて止めます |
| 手順 2 の clone で `Permission denied (publickey)` や `Repository not found` | 非公開リポジトリへのアクセス権か SSH 鍵の設定がありません。GitHub で権限と鍵を確かめる |
| ノードの一覧に「ODM Poser」がない | ComfyUI を再起動する。コンソールに読み込みのエラーが出ていないか確かめる |
| 実行すると「ポーズがまだありません」 | エディタで一度も「確定して閉じる」を押していません。エディタを開いて確定する |
| MOD 欄に ✗ が出る | その MOD にエラーがあります。✗ の行に理由が出ます |

## ComfyUI なしで使う

`ODM-Poser/web/editor/index.html` をブラウザで開くと、エディタだけで使えます
（つなぐ部品は何もしません）。画像やポーズは「書き出し」のボタンでファイルに保存します。
