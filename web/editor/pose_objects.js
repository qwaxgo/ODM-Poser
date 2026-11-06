// The objects put in the scene (S.solids and the things on their own in S.items), as one selection
// (index.html, loaded after pose_place.js):
//  - several at once: a box drawn from an empty place with the drag cursor, or Ctrl (⌘) + click in
//    配置; the 3-axis handles then move them together and turn them about up round their middle
//  - Delete (Backspace) takes them away; Ctrl+X / Ctrl+C / Ctrl+V cut, copy and paste them (⌘ on a
//    Mac; the copy is kept in this browser, so another tab can paste it)
//  - the cursor: ドラッグ (V; a drag from an empty place draws the box) or ハンド (H; every drag on the
//    front view turns the camera, Shift moves it; a click still picks)
//  - a click on an empty place: in 配置 the objects are let go; from ポーズ or 体格 the mode goes to
//    カメラ (with 「クリックで自動的にモードを切り替える」)
//  - each object's pivot (支点), what it turns about: kept relative to the object (in its own turned
//    axes, so it moves and turns with it), shown and set in world coordinates too. Unmoved, a solid's
//    is its middle and a thing's the middle of its extent.
// The keys are "s3" (S.solids[3]) and "i2" (S.items[2]) as in 設置 (pose_place.js).
(() => {
const $ = id => document.getElementById(id);
const solidOfKey = k => k && k[0] === "s" ? (S.solids || [])[+k.slice(1)] || null : null;
const itemOfKey = k => k && k[0] === "i" ? (S.items || [])[+k.slice(1)] || null : null;
const loose = it => !!(it && it.base && typeof movable === "function" && movable(it));
const exists = k => !!(solidOfKey(k) || loose(itemOfKey(k)));
const r1 = v => Math.round(v * 10) / 10;

// ---- turns and pivots ---------------------------------------------------------------------------------
const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];
// a solid: roll (z), then pitch (x), then yaw (up), as solidMesh draws it; inv: back again
function solidR(o, inv){
  const a = deg(o.yaw || 0), p = deg(o.pitch || 0), r = deg(o.roll || 0);
  return inv ? v => rotAxis(rotAxis(rotY(v, -a), X, -p), Z, -r) : v => rotY(rotAxis(rotAxis(v, Z, r), X, p), a);
}
// a thing: its own turn (it.rot: z, x, y), then its facing (yaw), as itemLocal and worldFrame draw it
function itemR(it, inv){
  const t = it.rot || [0, 0, 0], a = deg(it.yaw || 0);
  return inv ? v => rotAxis(rotAxis(rotAxis(rotY(v, -a), Y, -deg(t[1])), X, -deg(t[0])), Z, -deg(t[2]))
    : v => rotY(rotAxis(rotAxis(rotAxis(v, Z, deg(t[2])), X, deg(t[0])), Y, deg(t[1])), a);
}
// a thing's extent in its own axes, at its size and stretch
function itemBox(it){
  const {lo, hi} = localExtent(partsOf(it)), k = it.scale || 1, st = stretchOf(it) || [1, 1, 1];
  return {lo: lo.map((v, i) => v * k * st[i]), hi: hi.map((v, i) => v * k * st[i])};
}
// where the object's own axes start (a solid: the middle of its base; a thing: its base and offset)
const origin = k => { const o = solidOfKey(k); if (o) return o.pos;
  const it = itemOfKey(k); return add(it.base, rotY(it.off || [0, 0, 0], deg(it.yaw || 0))); };
function pivDefault(k, where){
  const o = solidOfKey(k);
  if (o) return where === "bottom" ? [0, 0, 0] : [0, o.size[1] / 2, 0];
  const b = itemBox(itemOfKey(k)), c = b.lo.map((v, i) => (v + b.hi[i]) / 2);
  return where === "bottom" ? [c[0], b.lo[1], c[2]] : c;
}
const objOf = k => solidOfKey(k) || itemOfKey(k);
const pivRel = k => { const p = objOf(k).piv; return p && p.length === 3 ? p.slice() : pivDefault(k); };
const rotOf = (k, inv) => solidOfKey(k) ? solidR(solidOfKey(k), inv) : itemR(itemOfKey(k), inv);
function pivWorld(k){ return add(origin(k), rotOf(k)(pivRel(k))); }
function setPivRel(k, rel){ objOf(k).piv = rel.map(v => Math.round(v * 100) / 100); }
function setPivAbs(k, p){ setPivRel(k, rotOf(k, true)(sub(p, origin(k)))); }
function resetPiv(k, where){ const o = objOf(k); if (where === "bottom") o.piv = pivDefault(k, "bottom"); else delete o.piv; }
// fn changes the object's turn; the object then shifts so its pivot stays where it was
function keepPivot(k, fn){
  if (!exists(k)){ fn(); return; }
  const p0 = pivWorld(k); fn(); const d = sub(p0, pivWorld(k));
  const o = solidOfKey(k); if (o) o.pos = add(o.pos, d); else { const it = itemOfKey(k); it.base = add(it.base, d); }
}

// ---- the selection --------------------------------------------------------------------------------------
let picks = [];                               // two or more selected together; else the one in soSel / scSel
function primary(){
  if (typeof soSel === "number" && solidOfKey("s" + soSel)) return "s" + soSel;
  if (typeof scSel === "number" && loose(itemOfKey("i" + scSel))) return "i" + scSel;
  return "";
}
function group(){
  picks = picks.filter(exists);
  if (picks.length < 2 || !picks.includes(primary())) picks = [];
  return picks.slice();
}
const selected = () => { const g = group(); if (g.length) return g; const p = primary(); return p ? [p] : []; };
const single = () => group().length ? "" : primary();
function setSel(keys){
  keys = keys.filter(exists);
  picks = keys.length > 1 ? keys.slice() : [];
  const k = keys[0] || "";
  if (k[0] === "s"){ soSel = +k.slice(1); if (loose(itemOfKey("i" + scSel))) scSel = -1; }
  else if (k[0] === "i"){ scSel = +k.slice(1); soSel = -1; }
  else { soSel = -1; if (loose(itemOfKey("i" + scSel))) scSel = -1; }
  if (typeof syncSolids === "function") syncSolids();
  if (typeof fillItemList === "function") fillItemList();
  draw();
}
window.objPicked = k => picks.length > 1 && picks.includes(k);

// ---- take away, cut, copy, paste ------------------------------------------------------------------------
function removeKeys(keys, quiet){
  keys = keys.filter(exists); if (!keys.length) return;
  remember();
  const idx = c => keys.filter(k => k[0] === c).map(k => +k.slice(1)).sort((a, b) => b - a);
  for (const n of idx("s")) S.solids.splice(n, 1);
  for (const n of idx("i")){ const it = S.items[n]; if (typeof freeHands === "function") freeHands(it); S.items.splice(n, 1); }
  picks = []; soSel = -1; scSel = -1;
  afterEdit(); if (typeof syncSolids === "function") syncSolids(); if (typeof fillItemList === "function") fillItemList(); draw();
  if (!quiet) say(keys.length > 1 ? `${keys.length}個の物を外しました。` : "選んだ物を外しました。");
}
const CLIP_KEY = KEY + "-clip";
let clip = null, pasted = 0;
function clipNow(){
  if (clip) return clip;
  try { const c = JSON.parse(localStorage.getItem(CLIP_KEY) || "null"); if (c && (c.solids || c.items)) clip = c; } catch (e) {}
  return clip;
}
function copyKeys(keys){
  keys = keys.filter(exists); if (!keys.length) return false;
  const deep = o => JSON.parse(JSON.stringify(o));
  clip = {solids: keys.filter(k => k[0] === "s").map(k => deep(solidOfKey(k))), items: keys.filter(k => k[0] === "i").map(k => deep(itemOfKey(k)))};
  pasted = 0;
  try { localStorage.setItem(CLIP_KEY, JSON.stringify(clip)); } catch (e) {}
  return true;
}
function paste(){
  const c = clipNow(); if (!c) return;
  remember(); pasted++;
  const d = [20 * pasted, 0, 20 * pasted], keys = [];       // each paste a little further along
  S.solids = S.solids || []; S.items = S.items || [];
  for (const o of c.solids || []){ const n = JSON.parse(JSON.stringify(o)); n.pos = add(n.pos, d); S.solids.push(n); keys.push("s" + (S.solids.length - 1)); }
  for (const it of c.items || []){ const n = JSON.parse(JSON.stringify(it)); n.where = "world"; n.base = add(n.base || [0, 0, 0], d);
    S.items.push(n); if (n.grounded) groundItem(n); keys.push("i" + (S.items.length - 1)); }
  afterEdit();
  if (mode !== "place" && typeof modeTo === "function") modeTo("place");
  setSel(keys);
  say(keys.length > 1 ? `${keys.length}個の物を貼り付けました。` : "貼り付けました。");
}
document.addEventListener("keydown", e => {
  if (e.altKey || (e.target && e.target.closest && e.target.closest("input, select, textarea, [contenteditable]"))) return;
  const ctl = e.ctrlKey || e.metaKey, k = e.key.toLowerCase(), keys = mode === "place" ? selected() : [];
  if (!ctl && (e.key === "Delete" || e.key === "Backspace")){ if (!keys.length) return; e.preventDefault(); removeKeys(keys); return; }
  if (!ctl && !e.shiftKey && (k === "v" || k === "h")){ e.preventDefault(); setCursor(k === "v" ? "drag" : "hand", true); return; }
  if (!ctl || e.shiftKey) return;
  if (k === "c" || k === "x"){
    if (!keys.length || String(window.getSelection ? getSelection() : "").trim()) return;
    e.preventDefault(); copyKeys(keys);
    if (k === "x"){ removeKeys(keys, true); say(keys.length > 1 ? `${keys.length}個の物を切り取りました。` : "切り取りました。"); }
    else say(keys.length > 1 ? `${keys.length}個の物をコピーしました。` : "コピーしました。");
  } else if (k === "v" && clipNow()){ e.preventDefault(); paste(); }
});

// ---- presses on the view ----------------------------------------------------------------------------------
function under(x, y){                         // the object under the pointer: its key, or ""
  const u = typeof solidUnder === "function" ? solidUnder(x, y) : null;
  const t = typeof itemUnder === "function" ? itemUnder(x, y) : null;
  if (u && t) return project(u.hit, front.width, front.height).s >= project(t.p, front.width, front.height).s ? "s" + u.k : "i" + t.n;
  return u ? "s" + u.k : t ? "i" + t.n : "";
}
// 配置: Ctrl (⌘) + click adds an object to the selection or takes it out; a joint lets the objects go
DOWN_HOOKS.unshift((cv, x, y, e) => {
  if (cv !== front || mode !== "place") return null;
  if (e && (e.ctrlKey || e.metaKey)){
    const k = under(x, y); if (!k) return null;
    const cur = selected(), next = cur.includes(k) ? cur.filter(c => c !== k) : [...cur, k];
    setSel(next.includes(k) ? [k, ...next.filter(c => c !== k)] : next);
    return {move(){}};
  }
  if (pick(cv, x, y) >= 0 && selected().length){ picks = []; soSel = -1; if (loose(itemOfKey("i" + scSel))) scSel = -1; }
  return null;
});
emptyClick = () => {
  if (mode === "place"){ if (selected().length) setSel([]); return; }
  if (autoMode && (mode === "pose" || mode === "body")) modeTo("persp");
};

// the cursor: ドラッグ or ハンド (kept in this browser)
const CUR_KEY = KEY + "-cursor";
let cursor = "drag";
try { if (localStorage.getItem(CUR_KEY) === "hand") cursor = "hand"; } catch (e) {}
let box = null;                               // the box being drawn: {x0, y0, x1, y1, add}
emptyDrag = (cv, x, y, e) => {
  if (cursor !== "drag" || mode === "persp") return null;
  const b = box = {x0: x, y0: y, x1: x, y1: y, add: !!(e && (e.shiftKey || e.ctrlKey || e.metaKey))};
  return {move(mx, my){ b.x1 = mx; b.y1 = my; }, end(){ box = null; finishBox(b); }};
};
function finishBox(b){
  const W = front.width, H = front.height, small = 8 * (devicePixelRatio || 1);
  if (Math.abs(b.x1 - b.x0) < small && Math.abs(b.y1 - b.y0) < small){ sel = -1; emptyClick(); draw(); return; }
  const [x0, x1] = [Math.min(b.x0, b.x1), Math.max(b.x0, b.x1)], [y0, y1] = [Math.min(b.y0, b.y1), Math.max(b.y0, b.y1)];
  const inside = p => { const s = project(p, W, H); return s.x >= x0 && s.x <= x1 && s.y >= y0 && s.y <= y1; };
  const mid = ps => ps.reduce((a, p) => add(a, p), [0, 0, 0]).map(v => v / Math.max(1, ps.length));
  const found = [];
  (S.solids || []).forEach((o, k) => { if (inside(mid(solidMesh(o).V))) found.push("s" + k); });
  (S.items || []).forEach((it, n) => { if (loose(it)){ const ps = worldSamples(it); if (ps.length && inside(mid(ps))) found.push("i" + n); } });
  const keys = b.add ? [...selected(), ...found.filter(k => !selected().includes(k))] : found;
  if (keys.length && autoMode && mode !== "place") modeTo("place");
  setSel(keys);
  if (found.length) toast(keys.length > 1 ? `${keys.length}個の物を選びました。` : "1個の物を選びました。");
}
handHook = (cv, x, y, e) => {
  if (cursor !== "hand" || mode === "persp") return null;
  const i = pick(cv, x, y);
  return {tapPick: i, cv, x, y, pan: !!(e && e.shiftKey), end(){ handClick(i, x, y); }};
};
function handClick(i, x, y){
  if (i >= 0){
    sel = i;
    if (mode === "place"){ picks = []; soSel = -1; if (loose(itemOfKey("i" + scSel))) scSel = -1; }
    if (autoMode && (mode === "place" || mode === "persp")) modeTo("pose");
    draw(); return;
  }
  const k = under(x, y);
  if (k){ if (autoMode && mode !== "place") modeTo("place"); setSel([k]); return; }
  sel = -1; emptyClick(); draw();
}

// ---- drawn on the front view: the box, and the selected object's pivot ---------------------------------
{ const d0 = draw; draw = function(){ d0.apply(this, arguments);
    if (!box) return;
    const ctx = front.getContext("2d"), dpr = devicePixelRatio || 1;
    ctx.save(); ctx.strokeStyle = cssVar("--sel"); ctx.fillStyle = cssVar("--sel"); ctx.lineWidth = dpr;
    ctx.setLineDash([4 * dpr, 3 * dpr]); ctx.globalAlpha = 0.12;
    const x = Math.min(box.x0, box.x1), y = Math.min(box.y0, box.y1), w = Math.abs(box.x1 - box.x0), h = Math.abs(box.y1 - box.y0);
    ctx.fillRect(x, y, w, h); ctx.globalAlpha = 0.9; ctx.strokeRect(x, y, w, h); ctx.restore(); }; }
{ const atari0 = drawAtari;
  drawAtari = function(ctx, W, H, opts = {}){
    atari0(ctx, W, H, opts);
    if (opts.export || ctx.canvas !== front || mode !== "place") return;
    const k = single(); if (!k) return;
    const s = project(pivWorld(k), W, H), dpr = devicePixelRatio || 1, r = 6 * dpr;
    ctx.save(); ctx.strokeStyle = "#f5a524"; ctx.lineWidth = 1.5 * dpr; ctx.setLineDash([]); ctx.globalAlpha = 0.95;
    ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, 2 * Math.PI);
    ctx.moveTo(s.x - r * 1.7, s.y); ctx.lineTo(s.x + r * 1.7, s.y); ctx.moveTo(s.x, s.y - r * 1.7); ctx.lineTo(s.x, s.y + r * 1.7);
    ctx.stroke(); ctx.restore();
  };
}

// ---- the cursor's buttons: under the 3-axis handles' menu, on the left of the view ---------------------
const curBar = document.createElement("div");
curBar.className = "gz-tools cur-tools"; curBar.id = "ovCursor"; curBar.setAttribute("role", "group"); curBar.setAttribute("aria-label", "カーソル"); curBar.dataset.ui = "skip";
curBar.innerHTML = `<button type="button" data-cur="drag" data-gzicon="cursor" title="ドラッグ：何もない所からドラッグで物を範囲選択（Vキー）"><span>ドラッグ</span></button>` +
  `<button type="button" data-cur="hand" data-gzicon="hand" title="ハンド：ドラッグでカメラを回す・Shift＋ドラッグで動かす（Hキー）"><span>ハンド</span></button>`;
($("ovGizmo") || $("modes")).appendChild(curBar);
curBar.addEventListener("click", e => { const b = e.target.closest("button[data-cur]"); if (b) setCursor(b.dataset.cur, true); });
function syncCursor(){
  curBar.querySelectorAll("button[data-cur]").forEach(b => { const on = b.dataset.cur === cursor; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
  front.classList.toggle("hand-cursor", cursor === "hand");
}
function setCursor(c, tell){
  cursor = c; try { localStorage.setItem(CUR_KEY, c); } catch (e) {}
  syncCursor(); if (tell) toast(c === "hand" ? "ハンド：ドラッグでカメラを動かします。" : "ドラッグ：何もない所からドラッグで範囲選択します。");
}
addEventListener("DOMContentLoaded", () => { if (!window.ODMICONS) return;
  curBar.querySelectorAll("button[data-gzicon]").forEach(b => { if (!b.querySelector("svg")) b.insertAdjacentHTML("afterbegin", ODMICONS.svg(b.dataset.gzicon)); }); });
syncCursor();

window.ODMObj = {key: single, group, selected, setSel, pivWorld, pivRel, setPivRel, setPivAbs, resetPiv, keepPivot,
  remove: removeKeys, copy: copyKeys, paste, hasClip: () => !!clipNow(), cursor: () => cursor, setCursor};

// i18n.js loads after this file: the table waits for it (ODMPoserI18nEarly)
(window.ODMPoserI18n || {add: t => (window.ODMPoserI18nEarly = window.ODMPoserI18nEarly || []).push(t)}).add({
  "カーソル": "Cursor", "ドラッグ": "Drag", "ハンド": "Hand",
  "ドラッグ：何もない所からドラッグで物を範囲選択（Vキー）": "Drag: drag from an empty place to box-select objects (V)",
  "ハンド：ドラッグでカメラを回す・Shift＋ドラッグで動かす（Hキー）": "Hand: drag to turn the camera, Shift+drag to move it (H)",
  "ハンド：ドラッグでカメラを動かします。": "Hand: dragging moves the camera.", "ドラッグ：何もない所からドラッグで範囲選択します。": "Drag: drag from an empty place to box-select.",
  "選んだ物を外しました。": "Took the selected one away.", "切り取りました。": "Cut.", "コピーしました。": "Copied.", "貼り付けました。": "Pasted.",
  "1個の物を選びました。": "Selected one object.",
  "クリックで自動的にモードを切り替える": "Switch modes by what is clicked",
  "物を押すと配置モード、関節を押すとポーズモード（配置・カメラから）、何もない所をクリックするとカメラモード（ポーズ・体格から）に切り替えます":
    "A thing: Place mode; a joint: Pose mode (from Place or Camera); an empty place: Camera mode (from Pose or Body)"});
})();
