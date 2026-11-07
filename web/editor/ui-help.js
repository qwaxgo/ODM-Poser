// 操作のヒント (index.html, loaded after ui-menu.js): the ? button on the view (or the ? key) opens
// #helpDlg. Two tables, one for a mouse and keyboard (key | what it does) and one for touch
// (finger | where | what it does); the one for this device comes first. Each text is [ja, en].
(() => {
const MODE_JA = {pose: "ポーズ", body: "体格", persp: "カメラ", place: "配置"};
const PC = [
  {title: ["カメラ（どのモードでも）", "Camera (in every mode)"], rows: [
    [["中ボタンでドラッグ", "Middle-button drag"], ["カメラを回す", "Orbit the camera"]],
    [["Shift＋中ボタンでドラッグ", "Shift + middle-button drag"], ["カメラを動かす", "Pan the camera"]],
    [["Ctrl＋中ボタンでドラッグ／ホイール", "Ctrl + middle-button drag / wheel"], ["拡大・縮小", "Zoom"]],
    [["Ctrl＋Alt＋ホイール", "Ctrl + Alt + wheel"], ["レンズ（広角ほどパースが強い）", "Lens (wider: stronger perspective)"]],
    [["Alt＋何もない所をドラッグ", "Alt + drag on empty space"], ["カメラを回す（Shift＋で動かす）", "Orbit the camera (Shift: pan)"]],
    [["H キー（ハンド）で、どこでもドラッグ", "H key (Hand), then drag anywhere"], ["カメラを回す（Shift＋で動かす）。V キーでドラッグに戻る", "Orbit the camera (Shift: pan). V goes back to Drag"]],
    [["何もない所をクリック（ポーズ・体格）", "Click empty space (Pose, Body)"], ["カメラモードへ（自動切り替えがオンのとき）", "To Camera mode (with automatic switching on)"]],
    [["テンキー 1・3・7", "Numpad 1, 3, 7"], ["正面・右から・上から（Ctrl で反対側）", "Front, right, top (Ctrl: the other side)"]],
    [["テンキー 2・4・6・8", "Numpad 2, 4, 6, 8"], ["15°ずつ回す（Ctrl で動かす）", "Turn by 15° (Ctrl: pan)"]],
    [["テンキー 9", "Numpad 9"], ["裏へ回る", "Go round to the back"]],
    [["テンキー ＋・－", "Numpad + / −"], ["拡大・縮小", "Zoom"]],
    [["テンキー .", "Numpad ."], ["選んだ関節を中心に", "Centre on the selected joint"]],
    [["Home", "Home"], ["人物を中心に", "Centre on the figure"]],
    [["Ctrl＋Z ／ Ctrl＋Y", "Ctrl + Z / Ctrl + Y"], ["元に戻す／やり直す", "Undo / redo"]],
    [["何もない所からドラッグ（V キー：ドラッグ）", "Drag from empty space (V key: Drag)"], ["囲んだ物体・小物を選ぶ（Shift＋で足す）", "Box-select objects and things (Shift: add)"]],
    [["?", "?"], ["このヒントを開く", "Open these hints"]]]},
  {title: ["選ぶ・モードの自動切り替え（どのモードでも）", "Selecting, switching modes (in every mode)"], rows: [
    [["関節の丸をクリック", "Click a joint's circle"], ["関節を選ぶ（配置・カメラからはポーズモードへ）", "Select the joint (from Place or Camera: to Pose mode)"]],
    [["Shift＋関節の丸をクリック", "Shift + click a joint's circle"], ["体格モードへ（ポーズ⇄体格を切り替える）", "To Body mode (Pose ⇄ Body)"]],
    [["物体・小物をクリック", "Click an object / a thing"], ["物を選ぶ（配置モードへ）", "Select it (to Place mode)"]],
    [["何もない所をクリック", "Click empty space"], ["ポーズ・体格からはカメラモードへ、配置では物の選択を外す", "From Pose or Body: to Camera mode; in Place: let the objects go"]],
    [["（切り替えたくないとき）", "(To keep the mode)"], ["ポーズのタブの「クリックで自動的にモードを切り替える」を外す", "Turn off 'Switch modes by what is clicked' in the Pose tab"]],
    [["V ／ H キー（図の左の「ドラッグ」「ハンド」）", "V / H keys (Drag / Hand on the view's left)"], ["何もない所からのドラッグを、範囲選択（人物も）にする／カメラを回すにする", "A drag from empty space box-selects (figures too) / turns the camera"]],
    [["図の左の「3軸ハンドル」／「解除」", "3-axis handles / Off on the view's left"], ["3軸ハンドルを出す／隠す（掴んだハンドル以外は薄くなる）", "Show / hide the 3-axis handles (the others fade while one is held)"]]]},
  {title: ["画面とメニュー", "The screen and the menus"], rows: [
    [["図と操作欄の境目をドラッグ", "Drag the edge between the views and the panel"], ["図と操作欄の広さを変える（ダブルクリックで戻す、矢印キーでも）", "Give the views or the panel more room (double-click: back; arrow keys too)"]],
    [["操作欄の上の「操作欄」「メニュー」のボタン", "The Panel / Menu buttons over the panel"], ["操作欄・メニューを右・左・上・下へ（縦画面と横画面で別々に覚える）", "Put the panel and the menu right, left, top or bottom (kept apart for upright and sideways)"]],
    [["分類バーの「⇅ 上下」（縦長の画面）", "⇅ on the category bar (a tall screen)"], ["分類バーとメニューを画面の上・下へ", "The category bar and the menu to the top / bottom"]],
    [["図の右上のボタン", "The buttons at the view's top right"], ["側面図・操作欄・分割表示・明るさ・言語などを切り替える", "Side view, panel, split screen, theme, language ..."]],
    [["リセットのタブ", "The Reset tab"], ["カメラ・人物・色などを初期状態に戻す", "Put the camera, figure, colours ... back to the start"]]]},
  {mode: "pose", title: ["ポーズモード", "Pose mode"], rows: [
    [["丸をドラッグ（3軸ハンドルを隠したとき）", "Drag a circle (with the 3-axis handles hidden)"], ["関節を動かす（骨の長さは保つ。寄せた分だけ手前・奥へ傾く）", "Move the joint (bone lengths kept; it leans toward / away as you bring it in)"]],
    [["Shift＋ドラッグ（手首・足首）", "Shift + drag (wrist, ankle)"], ["その骨だけ動かす（ふだんは腕・脚ごと届く）", "Move only that bone (otherwise the whole arm / leg reaches)"]],
    [["ダブルクリック", "Double-click"], ["その骨の手前と奥を入れ替える", "Flip the bone toward / away"]],
    [["Alt＋クリック", "Alt + click"], ["関節を固定する（ピン）", "Pin the joint"]],
    [["側面図でドラッグ", "Drag in the side view"], ["奥行きを直接動かす", "Move the depth directly"]],
    [["G・R・S キー（または 移動・回転・変形 ボタン）", "G, R, S keys (or the Move / Rotate / Scale buttons)"], ["3軸ハンドルの操作を切り替える", "Switch the 3-axis handles' tool"]],
    [["輪（X・Y・Z）をドラッグ", "Drag a ring (X, Y, Z)"], ["選んだ関節で、その先を軸のまわりに回す（回転）", "Turn what lies beyond the selected joint about that axis (Rotate)"]],
    [["手足の関節の矢印（X・Y・Z）をドラッグ", "Drag an arrow (X, Y, Z) on an arm or leg joint"], ["その軸の向きに動かす（移動。手足だけ）", "Move it along that axis (Move; arms and legs only)"]],
    [["3軸ハンドルを出しているとき", "While the 3-axis handles show"], ["丸のドラッグは選ぶだけ。動かすのはハンドルで（変形は体格モードで）", "Dragging a circle only selects it; the handles move it (Scale is in Body mode)"]]]},
  {mode: "body", title: ["体格モード", "Body mode"], rows: [
    [["丸をドラッグ", "Drag a circle"], ["その骨を伸ばす・縮める（先の部分ごと）", "Lengthen / shorten the bone (with what lies beyond)"]],
    [["丸の上でホイール（丸の外では拡大・縮小）", "Wheel over a circle (elsewhere: zoom)"], ["丸（太さ）を大きく・小さく（腕・脚はまとめて）", "Make the circle (thickness) bigger / smaller (an arm or a leg together)"]],
    [["四角をドラッグ（3軸ハンドル：変形）", "Drag a square (3-axis handles: Scale)"], ["骨の長さ・丸の太さ、肩・股の幅・高さ・前後を変える", "Change a bone's length, a circle's thickness, a shoulder's or thigh root's width, height, depth"]]]},
  {mode: "persp", title: ["カメラモード", "Camera mode"], rows: [
    [["（カーソルはいつもハンド）クリック", "(Always the hand) Click"], ["関節ならポーズモード（Shift＋で体格）、物なら配置モードへ", "A joint: to Pose mode (Shift: Body); a thing: to Place mode"]],
    [["ドラッグ", "Drag"], ["カメラを回す（左右＝向き、上下＝高さ）", "Turn the camera (sideways: direction, up-down: height)"]],
    [["Shift＋ドラッグ", "Shift + drag"], ["カメラを傾ける", "Tilt the camera"]],
    [["ホイール ／ Ctrl＋Alt＋ホイール", "Wheel / Ctrl + Alt + wheel"], ["拡大・縮小 ／ レンズ（広角ほどパースが強い）", "Zoom / lens (wider: stronger perspective)"]],
    [["消失点・アイレベルをドラッグ", "Drag a vanishing point / the eye level"], ["そこに合うようにカメラが動く", "The camera moves to fit"]],
    [["定規の太い線をドラッグ（ガイド図形がないときは細い線）", "Drag a strong ruler line (the thin ones without a guide shape)"],
     ["その線の消失点がドラッグした分だけ動き、カメラの向きと高さが変わる（画面の外の消失点も）", "Its vanishing point moves as far as you drag, turning and raising the camera (also a point off the picture)"]]]},
  {mode: "place", title: ["配置モード", "Place mode"], rows: [
    [["物体・小物をドラッグ", "Drag an object / a thing"], ["床の上で動かす（カメラは動かない）", "Move it over the floor (the camera stays)"]],
    [["Shift＋ドラッグ", "Shift + drag"], ["上下に動かす", "Move it up and down"]],
    [["消失点をドラッグ", "Drag a vanishing point"], ["定規の向きを変える", "Turn the ruler"]],
    [["設置のタブで種類を選び、物は選ばずに3軸ハンドル", "The 3-axis handles with a kind chosen and nothing selected (Objects tab)"], ["置く前の物（プレビュー）を動かす・回す・変形・支点を動かす。「置く」でそのとおりに置く", "Move, turn, stretch or re-pivot the thing about to be put (the preview); Put puts it just so"]],
    [["ガイド図形の矢印・四角をドラッグ", "Drag a guide shape's arrow or square"], ["辺の向き（消失点の方）に動かす・引いた側の辺だけ延ばす", "Move it along its edges (toward the vanishing points) / lengthen only the side pulled"]],
    [["ガイド図形の輪をドラッグ", "Drag a guide shape's ring"], ["パース定規とほかのガイドも一緒に回す（倒すと消失点がアイレベルから外れる）", "Turn the perspective ruler and the other guides with it (tipped, the vanishing points leave the eye level)"]],
    [["丸をクリック", "Click a circle"], ["関節を選ぶ（物体に着ける用）", "Select a joint (to put it on an object)"]],
    [["腰の真ん中をクリック（Shift＋クリック）", "Click the hips' middle (Shift + click)"], ["配置モードで人体を動かす（ポーズモードで体ごと回す）", "Move the figure in Place mode (turn the whole body in Pose mode)"]],
    [["腰を壁・天井・斜面・物体の面に近づける", "Bring the hips near a wall, ceiling, slope or object face"], ["その面に体ごと合わせて立つ（面に沿ってドラッグ、離すと外れる）", "Stand on it, the whole body turned to it (drag along it; pull away to let go)"]],
    [["腰の丸をドラッグ（または選んで矢印・輪）", "Drag the hips' circle (or select it: arrows, ring)"], ["人物全体を動かす・回す", "Move / turn the whole figure"]],
    [["矢印・輪・四角をドラッグ（G・R・S で切り替え）", "Drag an arrow, the ring or a square (G, R, S switch)"], ["選んだ物体を X・Y・Z（場面の軸。物の向きによらない）に沿って動かす・回す・伸ばす（3軸ハンドル）", "Move, turn or stretch the selected object along X, Y, Z (the scene's axes, however it is turned; 3-axis handles)"]],
    [["Ctrl＋クリック", "Ctrl + click"], ["人物・物体・小物を選ぶ物に足す・外す（いくつか選ぶと、最後に足した物の支点（人物は腰）を中心に、3軸ハンドルでまとめて動かす・回す）", "Add a figure, object or thing to the selection or take it out (several move and turn together with the 3-axis handles, about the pivot of the last one added; a figure's is its hips)"]],
    [["Ctrl＋Shift＋クリック（選んだ物の上）", "Ctrl + Shift + click (on one selected)"], ["まとめて回す中心をその物の支点にする", "Turn the group about this one's pivot"]],
    [["Ctrl＋人体をクリック・ドラッグ（何も選んでいないとき）", "Ctrl + click / drag the body (nothing selected)"], ["腰を選んで人物全体を動かす", "Take the figure by its hips and move it"]],
    [["Delete（Backspace）", "Delete (Backspace)"], ["選んだ物を外す", "Take the selected away"]],
    [["Ctrl＋X ／ Ctrl＋C ／ Ctrl＋V", "Ctrl + X / Ctrl + C / Ctrl + V"], ["選んだ物を切り取る／コピー／貼り付ける", "Cut / copy / paste the selected"]],
    [["3軸ハンドルの「支点」", "The handles' Pivot button"], ["回転の中心を移動ハンドルで動かす（数値は設置のタブ）", "Move what it turns about with the move handles (numbers in the Objects tab)"]],
    [["何もない所をクリック", "Click empty space"], ["物の選択を外す", "Let the objects go"]]]}];
const TOUCH = [
  {title: ["人物と関節", "The figure and its joints"], rows: [
    [["1本指でタップ", "Tap with one finger"], ["丸", "A circle"], ["関節を選ぶ", "Select the joint"]],
    [["1本指でドラッグ", "Drag with one finger"], ["選んだ丸", "The selected circle"], ["関節を動かす（モードに合わせて）", "Move the joint (as the mode does)"]],
    [["ダブルタップ", "Double-tap"], ["丸", "A circle"], ["骨の手前と奥を入れ替える", "Flip the bone toward / away"]],
    [["「Shift」を押してから操作", "Press “Shift”, then work"], ["図の左（モードの下）", "The view's left (under the modes)"], ["その骨だけ・上下に動かす", "Only that bone / up and down"]],
    [["「固定」を押してから丸をタップ", "Press “Pin”, then tap a circle"], ["図の左（モードの下）", "The view's left (under the modes)"], ["関節を固定する（ピン）", "Pin the joint"]],
    [["境目のつまみをドラッグ", "Drag the grip on the edge"], ["図と操作欄の間", "Between the views and the panel"], ["図と操作欄の広さを変える（ダブルタップで戻す）", "Give the views or the panel more room (double-tap: back)"]],
    [["1本指でタップ", "Tap with one finger"], ["物体・小物", "An object / a thing"], ["物を選ぶ（配置モードへ）", "Select it (to Place mode)"]],
    [["「3軸ハンドル」を押してから矢印・輪をドラッグ", "Press “3-axis handles”, then drag an arrow or a ring"], ["図の左（モードの下）", "The view's left (under the modes)"], ["選んだ関節・物を動かす・回す（掴んだもの以外は薄くなる）", "Move or turn the selected joint or thing (the others fade)"]]]},
  {title: ["スマホ・縦の画面のメニュー", "The menus on a phone and a tall screen"], rows: [
    [["分類（作る・見る・出す）をタップ", "Tap a category (Make, View, Output)"], ["下の分類バー", "The bar at the bottom"], ["メニューを開く（もう一度で閉じる）", "Open its menu (again: close)"]],
    [["つまみを下へドラッグ・タップ", "Drag the grip down / tap it"], ["スマホのメニューの上", "The top of a phone's menu"], ["メニューを閉じる", "Close the menu"]],
    [["「⇅ 上下」をタップ", "Tap ⇅"], ["分類バーの右（タブレット・縦モニター）", "The bar's right end (tablet, tall monitor)"], ["分類バーとメニューを上・下へ", "The bar and the menu to the top / bottom"]],
    [["境目をドラッグ", "Drag the edge"], ["図とメニューの間（縦の画面）", "Between the view and the menu (tall screen)"], ["図の高さを変える（50〜85%）", "The view's height (50–85 %)"]]]},
  {title: ["カメラ", "Camera"], rows: [
    [["1本指でスワイプ（ハンド）", "Swipe with one finger (Hand)"], ["どこでも", "Anywhere"], ["カメラを回す", "Orbit the camera"]],
    [["1本指でスワイプ（ドラッグ）", "Swipe with one finger (Drag)"], ["丸・物のない所", "Where there is no circle or object"], ["囲んだ物体・小物を選ぶ", "Box-select objects and things"]],
    [["タップ（ポーズ・体格）", "Tap (Pose, Body)"], ["何もない所", "Empty space"], ["カメラモードへ（そこでスワイプでカメラを回す）", "To Camera mode (swipe there to turn the camera)"]],
    [["タップ（カメラモード）", "Tap (Camera mode)"], ["丸・物", "A circle / a thing"], ["関節ならポーズ（「Shift」を押してからなら体格）、物なら配置モードへ", "A joint: to Pose (with “Shift” on: Body); a thing: to Place mode"]],
    [["2本指でつまむ・広げる", "Pinch / spread two fingers"], ["画面のどこでも", "Anywhere on the view"], ["拡大・縮小（カメラモードではレンズ）", "Zoom (the lens in the perspective mode)"]],
    [["2本指でそのまま動かす", "Move two fingers together"], ["画面のどこでも", "Anywhere on the view"], ["カメラを動かす（ポーズ・体格モード）", "Pan the camera (pose and build modes)"]],
    [["左のスティックを倒す", "Push the left stick"], ["カメラパッド（左下）", "Camera pad (bottom left)"], ["カメラを回す", "Orbit the camera"]],
    [["右のスティックを倒す", "Push the right stick"], ["カメラパッド（右下）", "Camera pad (bottom right)"], ["カメラを動かす", "Pan the camera"]],
    [["右端のスライダーを上下", "Slide the right edge up / down"], ["カメラパッド（右端）", "Camera pad (right edge)"], ["拡大・縮小", "Zoom"]]]},
  {title: ["物体（配置モード）", "Objects (place mode)"], rows: [
    [["1本指でドラッグ", "Drag with one finger"], ["物体・小物", "An object / a thing"], ["床の上で動かす", "Move it over the floor"]],
    [["2本指でつまむ・広げる", "Pinch / spread two fingers"], ["画面のどこでも", "Anywhere on the view"], ["拡大・縮小（回すのは3軸ハンドル）", "Zoom (the 3-axis handles turn things)"]]]},
  {title: ["ペン", "Pen"], rows: [
    [["ペン先でドラッグ", "Drag with the tip"], ["丸", "A circle"], ["マウスと同じく関節を動かす", "Move the joint, as with a mouse"]],
    [["サイドボタン＋ドラッグ", "Side button + drag"], ["丸", "A circle"], ["Shift と同じ", "Same as Shift"]],
    [["消しゴム側でタップ", "Tap with the eraser end"], ["丸", "A circle"], ["関節を固定する", "Pin the joint"]]]}];

const dlg = document.getElementById("helpDlg"), btn = document.getElementById("helpBtn");
const en = () => !!(window.ODMPoserI18n && window.ODMPoserI18n.lang === "en");
const t = pair => pair[en() ? 1 : 0];
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
let view = null;                               // "pc" | "touch"
function table(group, cols){
  const box = el("section", "help-group" + (group.mode && group.mode === mode ? " now" : ""));
  const h = el("h3", "", t(group.title));
  if (group.mode && group.mode === mode) h.appendChild(el("span", "help-now", en() ? "now" : "いまのモード"));
  box.appendChild(h);
  const tb = el("table", "help-table"), head = el("tr");
  for (const c of cols) head.appendChild(el("th", "", t(c)));
  const thead = el("thead"); thead.appendChild(head); tb.appendChild(thead);
  const body = el("tbody");
  for (const r of group.rows){ const tr = el("tr");
    r.forEach((c, i) => { const td = el("td", i === 0 ? "help-key" : "", ""); if (i === 0) td.appendChild(el("kbd", "", t(c))); else td.textContent = t(c); tr.appendChild(td); });
    body.appendChild(tr); }
  tb.appendChild(body); box.appendChild(tb); return box;
}
function render(){
  dlg.replaceChildren();
  const top = el("div", "help-top");
  const title = el("h2", "", en() ? "Hints" : "操作のヒント"); title.id = "helpTitle"; top.appendChild(title);
  const tabs = el("div", "help-tabs"); tabs.setAttribute("role", "group");
  for (const [v, ja, e] of [["pc", "マウス・キーボード", "Mouse & keyboard"], ["touch", "タッチ（スマホ・タブレット）", "Touch (phone, tablet)"]]){
    const b = el("button", "help-tab" + (view === v ? " on" : ""), en() ? e : ja); b.type = "button";
    b.setAttribute("aria-pressed", String(view === v)); b.addEventListener("click", () => { view = v; render(); }); tabs.appendChild(b); }
  top.appendChild(tabs);
  const close = el("button", "help-close"); close.type = "button"; close.setAttribute("aria-label", en() ? "Close" : "閉じる");
  close.innerHTML = window.ODMICONS ? window.ODMICONS.svg("Close") : "×"; close.addEventListener("click", () => dlg.close()); top.appendChild(close);
  dlg.appendChild(top);
  const body = el("div", "help-body");
  if (view === "pc"){
    const cols = [["キー・マウス", "Key / mouse"], ["すること", "What it does"]];
    // the camera first, then the mode you are in, then the other modes
    const list = [PC[0], ...PC.slice(1).filter(g => g.mode === mode), ...PC.slice(1).filter(g => g.mode !== mode)];
    list.forEach(g => body.appendChild(table(g, cols)));
  } else {
    const cols = [["指の動き", "Finger"], ["どこで", "Where"], ["すること", "What it does"]];
    body.appendChild(el("p", "help-note", en() ? `The mode is chosen with the buttons at the view's top left (now: ${mode}).`
      : `モードは画面左上のボタンで選びます（いま：${MODE_JA[mode] || mode}）。`));
    TOUCH.forEach(g => body.appendChild(table(g, cols)));
  }
  dlg.appendChild(body);
}
function open(){
  view = document.body.classList.contains("touch") || matchMedia("(pointer: coarse)").matches ? "touch" : "pc";
  render(); dlg.showModal();
}
btn.addEventListener("click", open);
dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });          // a click on the backdrop
document.addEventListener("keydown", e => {
  if (e.key !== "?" || e.ctrlKey || e.metaKey || e.altKey) return;
  const a = document.activeElement; if (a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.tagName === "SELECT" || a.isContentEditable)) return;
  if (dlg.open) dlg.close(); else open();
  e.preventDefault();
});
})();
