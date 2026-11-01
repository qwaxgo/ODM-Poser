// 操作のヒント (index.html, loaded after ui-menu.js): the ? button on the view (or the ? key) opens
// #helpDlg. Two tables, one for a mouse and keyboard (key | what it does) and one for touch
// (finger | where | what it does); the one for this device comes first. Each text is [ja, en].
(() => {
const MODE_JA = {pose: "ポーズ", body: "体格", persp: "パース", place: "配置"};
const PC = [
  {title: ["カメラ（どのモードでも）", "Camera (in every mode)"], rows: [
    [["中ボタンでドラッグ", "Middle-button drag"], ["カメラを回す", "Orbit the camera"]],
    [["Shift＋中ボタンでドラッグ", "Shift + middle-button drag"], ["カメラを動かす", "Pan the camera"]],
    [["Ctrl＋中ボタンでドラッグ／ホイール", "Ctrl + middle-button drag / wheel"], ["拡大・縮小", "Zoom"]],
    [["Alt＋何もない所をドラッグ", "Alt + drag on empty space"], ["カメラを回す（中ボタンのないマウス・トラックパッド）", "Orbit (a mouse or trackpad without a middle button)"]],
    [["テンキー 1・3・7", "Numpad 1, 3, 7"], ["正面・右から・上から（Ctrl で反対側）", "Front, right, top (Ctrl: the other side)"]],
    [["テンキー 2・4・6・8", "Numpad 2, 4, 6, 8"], ["15°ずつ回す（Ctrl で動かす）", "Turn by 15° (Ctrl: pan)"]],
    [["テンキー 9", "Numpad 9"], ["裏へ回る", "Go round to the back"]],
    [["テンキー ＋・－", "Numpad + / −"], ["拡大・縮小", "Zoom"]],
    [["テンキー .", "Numpad ."], ["選んだ関節を中心に", "Centre on the selected joint"]],
    [["Home", "Home"], ["人物を中心に", "Centre on the figure"]],
    [["Ctrl＋Z ／ Ctrl＋Y", "Ctrl + Z / Ctrl + Y"], ["元に戻す／やり直す", "Undo / redo"]],
    [["?", "?"], ["このヒントを開く", "Open these hints"]]]},
  {mode: "pose", title: ["ポーズモード", "Pose mode"], rows: [
    [["丸をドラッグ", "Drag a circle"], ["関節を動かす（骨の長さは保つ。寄せた分だけ手前・奥へ傾く）", "Move the joint (bone lengths kept; it leans toward / away as you bring it in)"]],
    [["Shift＋ドラッグ（手首・足首）", "Shift + drag (wrist, ankle)"], ["その骨だけ動かす（ふだんは腕・脚ごと届く）", "Move only that bone (otherwise the whole arm / leg reaches)"]],
    [["ダブルクリック", "Double-click"], ["その骨の手前と奥を入れ替える", "Flip the bone toward / away"]],
    [["Alt＋クリック", "Alt + click"], ["関節を固定する（ピン）", "Pin the joint"]],
    [["腰の丸をドラッグ", "Drag the hips' circle"], ["人物全体を動かす", "Move the whole figure"]],
    [["横の図でドラッグ", "Drag in the side view"], ["奥行きを直接動かす", "Move the depth directly"]],
    [["G・R・S キー（または 移動・回転・変形 ボタン）", "G, R, S keys (or the Move / Rotate / Scale buttons)"], ["3軸ハンドルの操作を切り替える", "Switch the 3-axis handles' tool"]],
    [["選んだ関節の矢印（X・Y・Z）をドラッグ", "Drag an arrow (X, Y, Z) on the selected joint"], ["その軸の向きにだけ動かす（移動）", "Move it along that axis only (Move)"]],
    [["輪（X・Y・Z）をドラッグ", "Drag a ring (X, Y, Z)"], ["その軸のまわりに骨を回す（回転）", "Turn the bone about that axis (Rotate)"]],
    [["四角をドラッグ", "Drag a square"], ["骨の長さ・丸の太さを変える（変形）", "Change the bone's length or the circle's thickness (Scale)"]]]},
  {mode: "body", title: ["体格モード", "Body mode"], rows: [
    [["丸をドラッグ", "Drag a circle"], ["その骨を伸ばす・縮める（先の部分ごと）", "Lengthen / shorten the bone (with what lies beyond)"]],
    [["丸の上でホイール", "Wheel over a circle"], ["丸（太さ）を大きく・小さく", "Make the circle (thickness) bigger / smaller"]]]},
  {mode: "persp", title: ["パースモード", "Perspective mode"], rows: [
    [["ドラッグ", "Drag"], ["カメラを回す（左右＝向き、上下＝高さ）", "Turn the camera (sideways: direction, up-down: height)"]],
    [["Shift＋ドラッグ", "Shift + drag"], ["カメラを傾ける", "Tilt the camera"]],
    [["ホイール", "Wheel"], ["レンズ（広角ほどパースが強い）", "Lens (wider: stronger perspective)"]],
    [["消失点・アイレベルをドラッグ", "Drag a vanishing point / the eye level"], ["そこに合うようにカメラが動く", "The camera moves to fit"]],
    [["定規の太い線をドラッグ（立方体がないときは細い線）", "Drag a strong ruler line (the thin ones without the box)"],
     ["その線の消失点がドラッグした分だけ動き、カメラの向きと高さが変わる（画面の外の消失点も）", "Its vanishing point moves as far as you drag, turning and raising the camera (also a point off the picture)"]]]},
  {mode: "place", title: ["配置モード", "Place mode"], rows: [
    [["物体・小物をドラッグ", "Drag an object / a thing"], ["床の上で動かす（カメラは動かない）", "Move it over the floor (the camera stays)"]],
    [["Shift＋ドラッグ", "Shift + drag"], ["上下に動かす", "Move it up and down"]],
    [["物体の上でホイール", "Wheel over an object"], ["向きを回す（スナップ中は定規の向きへ 90°ずつ）", "Turn it (with snapping: 90° at a time, along the ruler)"]],
    [["消失点をドラッグ", "Drag a vanishing point"], ["定規の向きを変える", "Turn the ruler"]],
    [["丸をクリック", "Click a circle"], ["関節を選ぶ（物体に着ける用）", "Select a joint (to put it on an object)"]],
    [["矢印・輪・四角をドラッグ（G・R・S で切り替え）", "Drag an arrow, the ring or a square (G, R, S switch)"], ["選んだ物体を軸に沿って動かす・回す・伸ばす（3軸ハンドル）", "Move, turn or stretch the selected object along an axis (3-axis handles)"]]]}];
const TOUCH = [
  {title: ["人物と関節", "The figure and its joints"], rows: [
    [["1本指でタップ", "Tap with one finger"], ["丸", "A circle"], ["関節を選ぶ", "Select the joint"]],
    [["1本指でドラッグ", "Drag with one finger"], ["選んだ丸", "The selected circle"], ["関節を動かす（モードに合わせて）", "Move the joint (as the mode does)"]],
    [["ダブルタップ", "Double-tap"], ["丸", "A circle"], ["骨の手前と奥を入れ替える", "Flip the bone toward / away"]],
    [["「Shift」を押してから操作", "Press “Shift”, then work"], ["上のボタン", "The keys above"], ["その骨だけ・上下に動かす", "Only that bone / up and down"]],
    [["「固定」を押してから丸をタップ", "Press “Pin”, then tap a circle"], ["上のボタン", "The keys above"], ["関節を固定する（ピン）", "Pin the joint"]]]},
  {title: ["カメラ", "Camera"], rows: [
    [["1本指でスワイプ", "Swipe with one finger"], ["丸のない所", "Where there is no circle"], ["カメラを回す", "Orbit the camera"]],
    [["2本指でつまむ・広げる", "Pinch / spread two fingers"], ["画面のどこでも", "Anywhere on the view"], ["拡大・縮小（パースモードではレンズ）", "Zoom (the lens in the perspective mode)"]],
    [["2本指でそのまま動かす", "Move two fingers together"], ["画面のどこでも", "Anywhere on the view"], ["カメラを動かす（ポーズ・体格モード）", "Pan the camera (pose and build modes)"]],
    [["左のスティックを倒す", "Push the left stick"], ["カメラパッド（左下）", "Camera pad (bottom left)"], ["カメラを回す", "Orbit the camera"]],
    [["右のスティックを倒す", "Push the right stick"], ["カメラパッド（右下）", "Camera pad (bottom right)"], ["カメラを動かす", "Pan the camera"]],
    [["右端のスライダーを上下", "Slide the right edge up / down"], ["カメラパッド（右端）", "Camera pad (right edge)"], ["拡大・縮小", "Zoom"]]]},
  {title: ["物体（配置モード）", "Objects (place mode)"], rows: [
    [["1本指でドラッグ", "Drag with one finger"], ["物体・小物", "An object / a thing"], ["床の上で動かす", "Move it over the floor"]],
    [["2本指でつまむ・広げる", "Pinch / spread two fingers"], ["物体・小物の上", "Over an object / a thing"], ["向きを回す（スナップ中は 90°ずつ）", "Turn it (with snapping: 90° at a time)"]]]},
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
