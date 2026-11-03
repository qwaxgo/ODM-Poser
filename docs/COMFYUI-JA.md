# ComfyUI で使う

[ODM-Poser-ComfyUIBridge](https://github.com/qwaxgo/ODM-Poser-ComfyUIBridge) を入れると、立体人形装置を ComfyUI の
ノードとして使えます。ComfyUI の中でエディタを開き、作ったポーズの画像をそのまま次のノードへ渡せます。

English: [COMFYUI.md](COMFYUI.md)

## 入れ方

必要なのは ComfyUI と git です。追加の Python パッケージは要りません。

```
cd ComfyUI/custom_nodes
git clone --recursive https://github.com/qwaxgo/ODM-Poser-ComfyUIBridge
```

そのあと ComfyUI を再起動します。ComfyUI-Manager の「Install via Git URL」に同じ URL を入れても入ります。
くわしい手順と、うまくいかないときの対処は、ブリッジのリポジトリの説明にあります。

## 使い方

1. キャンバスにノード「ODM Poser」を置き、「Open ODM Poser」を押す。ComfyUI の中でエディタが開きます。
2. ポーズを作る。書き出しの「幅」「高さ」が、ノードが出す画像の大きさになります
   （[EXPORT-JA.md](EXPORT-JA.md)）。
3. 右の欄のいちばん上の「確定して閉じる」を押す（「閉じる」は渡さずに閉じます）。
4. ノードの出力を、ほかのノードにつなぐ。

次に開くと、前に確定したポーズから続けて編集できます（ワークフローに保存されます）。

| 出力 | 中身 | つなぐ先の例 |
|------|------|------------|
| `openpose` | OpenPose の画像（体 18 点＋両手 21 点ずつ、黒地） | ControlNet（OpenPose） |
| `atari` | アタリ画像（白地に線と丸、小物も簡単な形で） | 下描き、img2img |
| `pose_json` | 人物（関節の位置、体の向き、手の形、カメラなど。複数の人物も） | 自分のノードで使う |
| `scene_json` | 小物、床・壁・天井、ワイヤー、物体 | 自分のノードで使う |
| `width`、`height` | エディタで決めた書き出しの大きさ | 空の潜在画像の大きさ |

## プリセットと MOD

- ブリッジの `user_presets/` に置いたポーズ集（`*.json`）は、エディタの「ユーザープリセット」に自動で並びます。
  ファイルの形は [POSES-JA.md](POSES-JA.md) と同じです。
- ブリッジの `mods/` に置いた MOD は、エディタで読み込まれます（[MODDING-JA.md](MODDING-JA.md)）。

## 更新

```
cd ComfyUI/custom_nodes/ODM-Poser-ComfyUIBridge
git pull
git submodule update --init --recursive
```

そのあと ComfyUI を再起動します。エディタの新しい版に追いつくまで、ブリッジの中のエディタは少し前の版のことがあります。
