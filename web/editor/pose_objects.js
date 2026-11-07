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
// "gs" / "gi": the ghost of 設置 (the solid or thing about to be put, pose_place.js)
const ghostOf = k => { const g = window.ODMGhost ? ODMGhost() : null; return g && g.key === k ? g.o : null; };
const solidOfKey = k => k === "gs" ? ghostOf(k) : k && k[0] === "s" ? (S.solids || [])[+k.slice(1)] || null : null;
const itemOfKey = k => k === "gi" ? ghostOf(k) : k && k[0] === "i" ? (S.items || [])[+k.slice(1)] || null : null;
const loose = it => !!(it && it.base && typeof movable === "function" && movable(it));
const isObj = k => !!(solidOfKey(k) || loose(itemOfKey(k)));
// a figure in the selection: "f2" is the figure whose figId is 2 (the one edited, or one in S.others)
const activeKey = () => "f" + (S.figId || 1);
const isFig = k => typeof k === "string" && k[0] === "f";
const otherOf = k => (S.others || []).find(f => "f" + (f.figId || 1) === k);
const figExists = k => isFig(k) && (k === activeKey() || !!otherOf(k));
const exists = k => isObj(k) || figExists(k);
// fn with that figure in S (another figure is swapped in, and what fn changed is kept)
function onFig(k, fn){
  if (k === activeKey()) return fn();
  const f = otherOf(k); if (!f) return undefined;
  return withFigure(f, () => { const r = fn(); Object.assign(f, takeFigure()); return r; });
}
const figKeys = () => [activeKey(), ...(S.others || []).map(f => "f" + (f.figId || 1))];
const midOf = ps => ps.reduce((a, p) => add(a, p), [0, 0, 0]).map(v => v / Math.max(1, ps.length));
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
function pivWorld(k){ if (isFig(k)) return onFig(k, () => S.P[IX.pelvis].slice()); return add(origin(k), rotOf(k)(pivRel(k))); }
function setPivRel(k, rel){ objOf(k).piv = rel.map(v => Math.round(v * 100) / 100); }
function setPivAbs(k, p){ setPivRel(k, rotOf(k, true)(sub(p, origin(k)))); }
function resetPiv(k, where){ const o = objOf(k); if (where === "bottom") o.piv = pivDefault(k, "bottom"); else delete o.piv; }
// a turn by dg degrees about the world's axis k (0 x, 1 y, 2 z) on top of [yaw, pitch, roll] (the solids'
// order: roll, pitch, then yaw; a thing's yaw + rot[1], rot[0], rot[2] are the same), as [yaw, pitch, roll]
const SY = rotY(Z, deg(30))[0] > 0 ? 1 : -1, SP = rotAxis(Z, X, deg(30))[1] > 0 ? 1 : -1, SR = rotAxis(X, Z, deg(30))[1] > 0 ? 1 : -1;
function worldTurn(ang, k, dg){
  const R = solidR({yaw: ang[0], pitch: ang[1], roll: ang[2]}), w = v => rotAxis(v, [X, Y, Z][k], deg(dg));
  const vz = w(R(Z)), vx = w(R(X));
  const a = Math.atan2(SY * vz[0], vz[2]), p = Math.atan2(SP * vz[1], Math.hypot(vz[0], vz[2]));
  const q = rotAxis(rotY(vx, -a), X, -p), r = Math.atan2(SR * q[1], q[0]);
  const d = v => Math.round(v * 1800 / Math.PI) / 10;
  return [d(a), d(p), d(r)];
}
// the object's own axes in the world (a solid's width, height, depth; a thing's x, y, z)
const axesOf = k => [X, Y, Z].map(rotOf(k));
// fn changes the object's turn; the object then shifts so its pivot stays where it was
function keepPivot(k, fn){
  if (!exists(k)){ fn(); return; }
  const p0 = pivWorld(k); fn(); const d = sub(p0, pivWorld(k));
  const o = solidOfKey(k); if (o) o.pos = add(o.pos, d); else { const it = itemOfKey(k); it.base = add(it.base, d); }
}

// a figure moved or turned with a group: its joints, pins, wire, the face it stands on and its body's
// turn (s0: figSave's); tr moves a point, dir a direction; the figures not edited settle at once
function figSave(k){
  return onFig(k, () => ({P: S.P.map(p => p.slice()), body: Object.assign({}, S.body), pins: JSON.parse(JSON.stringify(S.pins || {})),
    anchor: S.wire && S.wire.anchor ? S.wire.anchor.slice() : null, stand: S.stand ? JSON.parse(JSON.stringify(S.stand)) : null}));
}
function figPut(k, s0, tr, dir, axis, ang){
  onFig(k, () => {
    S.P = s0.P.map(tr); S.body = Object.assign({}, s0.body);
    S.pins = {}; for (const n of Object.keys(s0.pins)) S.pins[n] = tr(s0.pins[n]);
    if (S.wire && s0.anchor) S.wire.anchor = tr(s0.anchor);
    if (s0.stand) S.stand = {p: tr(s0.stand.p), n: dir(s0.stand.n)};
    if (axis && typeof turnBody === "function") turnBody(axis, ang);
    if (k !== activeKey()) afterEdit();
  });
}
const figMove = (k, s0, d) => figPut(k, s0, p => add(p, d), v => v);
const figTurn = (k, s0, c, axis, ang) => figPut(k, s0, p => add(c, rotAxis(sub(p, c), axis, ang)), v => rotAxis(v, axis, ang), axis, ang);

// ---- the selection --------------------------------------------------------------------------------------
let picks = [];                               // two or more selected together; else the one in soSel / scSel
function primary(){
  if (typeof soSel === "number" && solidOfKey("s" + soSel)) return "s" + soSel;
  if (typeof scSel === "number" && loose(itemOfKey("i" + scSel))) return "i" + scSel;
  return "";
}
// a group led by a figure has no object in soSel / scSel
function group(){
  picks = picks.filter(exists);
  const p = primary();
  if (picks.length < 2 || (p ? !picks.includes(p) : !isFig(picks[0]))) picks = [];
  return picks.slice();
}
const lead = () => { const g = group(); return g.length && isFig(g[0]) ? g[0] : primary(); };
// what Ctrl+click adds to: the selection, or in 配置 the figure taken by its hips
function current(){ const s = selected(); return s.length ? s : mode === "place" && sel === IX.pelvis ? [activeKey()] : []; }
const selected = () => { const g = group(); if (g.length) return g; const p = primary(); return p ? [p] : []; };
const single = () => group().length ? "" : primary();
function setSel(keys){
  keys = keys.filter(exists);
  picks = keys.length > 1 ? keys.slice() : [];
  const k = keys[0] || "";
  if (keys.length > 1) sel = -1;              // a group: no joint (the hips' handles would take the group's place)
  if (isFig(k) && keys.length === 1){         // one figure alone: it is edited, taken by its hips
    const n = (S.others || []).indexOf(otherOf(k)); if (n >= 0) switchFigure(n);
    sel = IX.pelvis; soSel = -1; if (loose(itemOfKey("i" + scSel))) scSel = -1;
  } else if (isFig(k)){ soSel = -1; if (loose(itemOfKey("i" + scSel))) scSel = -1; }
  else if (k[0] === "s"){ soSel = +k.slice(1); if (loose(itemOfKey("i" + scSel))) scSel = -1; }
  else if (k[0] === "i"){ scSel = +k.slice(1); soSel = -1; }
  else { soSel = -1; if (loose(itemOfKey("i" + scSel))) scSel = -1; }
  if (typeof syncSolids === "function") syncSolids();
  if (typeof fillItemList === "function") fillItemList();
  draw();
}
window.objPicked = k => picks.length > 1 && picks.includes(k);

// ---- take away, cut, copy, paste ------------------------------------------------------------------------
function removeKeys(keys, quiet){
  keys = keys.filter(isObj); if (!keys.length) return;
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
  keys = keys.filter(isObj); if (!keys.length) return false;
  const deep = o => JSON.parse(JSON.stringify(o));
  clip = {solids: keys.filter(k => k[0] === "s").map(k => deep(solidOfKey(k))), items: keys.filter(k => k[0] === "i").map(k => deep(itemOfKey(k)))};
  pasted = 0;
  try { localStorage.setItem(CLIP_KEY, JSON.stringify(clip)); } catch (e) {}
  draw();                                     // the paste button comes on
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
  const ctl = e.ctrlKey || e.metaKey, k = e.key.toLowerCase(), keys = mode === "place" ? selected().filter(isObj) : [];
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
// the figure under the pointer (the one edited first, then the nearest other): its key, or ""
function figUnder(cv, x, y){
  if (pick(cv, x, y) >= 0) return activeKey();
  const W = cv.width, H = cv.height; let best = "", bd = Infinity;
  for (const f of S.others || []) withFigure(f, () => {
    const j = pick(cv, x, y); if (j < 0) return;
    const q = project(S.P[j], W, H), dd = Math.hypot(q.x - x, q.y - y);
    if (dd < bd){ bd = dd; best = "f" + (f.figId || 1); }
  });
  return best;
}
// Ctrl (⌘) + click (any mode but カメラ's own drags: it goes to 配置) adds an object or a figure to the
// selection or takes it out (the one added leads: the group turns about its pivot, a figure's being its
// hips; Ctrl+Shift+click on one selected makes it lead). Ctrl + a figure with nothing selected takes it
// by its hips (a drag moves it)
DOWN_HOOKS.unshift((cv, x, y, e) => {
  if (cv !== front) return null;
  if (e && (e.ctrlKey || e.metaKey)){
    const f = figUnder(cv, x, y), k = f || under(x, y); if (!k) return null;
    if (mode !== "place") modeTo("place");
    const cur = current();
    if (f && !cur.length){ setSel([f]); return grabFigure(cv, x, y); }
    if (e.shiftKey && cur.includes(k)){ setSel([k, ...cur.filter(c => c !== k)]);
      toast(isFig(k) ? "この人物を中心にまとめて動かします。" : "この物を中心にまとめて動かします。"); return {move(){}}; }
    const next = cur.includes(k) ? cur.filter(c => c !== k) : [...cur, k];
    setSel(next.includes(k) ? [k, ...next.filter(c => c !== k)] : next);
    if (next.length > 1) toast(`${next.length}個を選んでいます（人物と物）。`);
    return {move(){}};
  }
  return null;
});
// after the 3-axis handles (a figure's are on its hips, over its joints)
DOWN_HOOKS.push((cv, x, y) => {
  if (cv === front && mode === "place" && pick(cv, x, y) >= 0 && selected().length){ picks = []; soSel = -1; if (loose(itemOfKey("i" + scSel))) scSel = -1; }
  return null;
});
// a click let go without a drag. カメラ (always the hand): a joint goes to ポーズ (Shift: 体格), an object
// to 配置. Elsewhere (the drag cursor): Shift + a joint goes between ポーズ and 体格 (配置: to 体格)
tapClick = t => {
  if (!autoMode || t.ctrl) return;            // Ctrl + click: the press did it
  const [x, y] = t.at, i = pick(front, x, y);
  if (i === IX.pelvis && (cursor !== "hand" || t.mode === "persp")){ hipsClick(t.shift); return; }   // the hand's click did it already
  if (t.mode === "persp"){
    if (i >= 0){ sel = i; modeTo(t.shift ? "body" : "pose"); draw(); return; }
    const k = under(x, y); if (k){ modeTo("place"); setSel([k]); }
    return;
  }
  if (cursor === "hand" || !t.shift || i < 0) return;           // the hand's click did it already
  if (t.mode === "pose") modeTo("body"); else if (t.mode === "body") modeTo("pose"); else if (t.mode === "place") modeTo("body");
};
// the figure by its hips: selected (the 3-axis handles move and turn it), or dragged along the floor
// as the hips are in 配置 (Shift: up and down)
function grabFigure(cv, x, y){
  picks = []; soSel = -1; if (loose(itemOfKey("i" + scSel))) scSel = -1;
  sel = IX.pelvis; draw(); toast("人物全体を動かします（腰）。");
  if (gizmoHolds()) return {move(){}};
  const W = cv.width, H = cv.height, flat = v => norm([v[0], 0, v[2]]);
  const right = flat(camRotInv([1, 0, 0])), away = flat(camRotInv([0, 0, -1]));
  let lx = x, ly = y;
  return {move(mx, my, ev){
    const k = 1 / Math.max(1e-6, project(S.P[IX.pelvis], W, H).s), dx = (mx - lx) * k, dy = (ly - my) * k; lx = mx; ly = my;
    const d = ev && ev.shiftKey ? [0, dy, 0] : add(mul(right, dx), mul(away, dy));
    moveAll(d, false);
    for (const n of Object.keys(S.pins || {})) S.pins[n] = add(S.pins[n], d);
    if (S.wire && S.wire.anchor) S.wire.anchor = add(S.wire.anchor, d);
    afterEdit(IX.pelvis); }};
}
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
  const mid = midOf, found = [];
  (S.solids || []).forEach((o, k) => { if (inside(mid(solidMesh(o).V))) found.push("s" + k); });
  (S.items || []).forEach((it, n) => { if (loose(it)){ const ps = worldSamples(it); if (ps.length && inside(mid(ps))) found.push("i" + n); } });
  // the figures: their joints' middle inside the box
  for (const f of figKeys()) if (onFig(f, () => inside(midOf(S.P)))) found.push(f);
  const keys = b.add ? [...selected(), ...found.filter(k => !selected().includes(k))] : found;
  if (keys.length && autoMode && mode !== "place") modeTo("place");
  setSel(keys);
  const figs = keys.filter(isFig).length;
  if (found.length) toast(keys.length > 1 ? (figs ? `${keys.length}個を選びました（人物${figs}人）。` : `${keys.length}個の物を選びました。`)
    : figs ? "人物を選びました（腰）。" : "1個の物を選びました。");
}
handHook = (cv, x, y, e) => {
  if (cursor !== "hand" || mode === "persp" || (e && (e.ctrlKey || e.metaKey))) return null;     // Ctrl + click: the selection
  const i = pick(cv, x, y);
  const shift = !!(e && e.shiftKey);
  return {tapPick: i, cv, x, y, pan: shift, end(){ handClick(i, x, y, shift); }};
};
// the hips' middle clicked: the figure moved in 配置 (the 3-axis handles' 移動); with Shift, turned in
// ポーズ (回転)
function hipsClick(shift){
  sel = IX.pelvis; picks = []; soSel = -1; if (loose(itemOfKey("i" + scSel))) scSel = -1;
  if (autoMode) modeTo(shift ? "pose" : "place");
  if (window.ODMGizmo) ODMGizmo.prefer(shift ? "rotate" : "move");
  draw();
}
// a joint clicked: ポーズ, or with Shift 体格 (from ポーズ or 体格, Shift goes to the other one)
function jointMode(shift){
  if (!autoMode) return;
  if (shift) modeTo(mode === "body" ? "pose" : "body");
  else if (mode === "place" || mode === "persp") modeTo("pose");
}
function handClick(i, x, y, shift){
  if (i === IX.pelvis){ hipsClick(shift); return; }
  if (i >= 0){
    sel = i;
    if (mode === "place"){ picks = []; soSel = -1; if (loose(itemOfKey("i" + scSel))) scSel = -1; }
    jointMode(shift);
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
    // a group: the one it turns about; nothing selected: the ghost about to be put
    const g = window.ODMGhost && !selected().length && sel !== IX.pelvis ? ODMGhost() : null;
    // the figures in a group: a dashed box round each
    for (const f of group().filter(isFig)){
      const q = onFig(f, () => S.P.map(p => project(p, W, H))), dp = devicePixelRatio || 1, m = 10 * dp;
      const xs = q.map(p => p.x), ys = q.map(p => p.y), x0 = Math.min(...xs) - m, y0 = Math.min(...ys) - m;
      ctx.save(); ctx.strokeStyle = cssVar("--sel"); ctx.lineWidth = 1.5 * dp; ctx.setLineDash([5 * dp, 4 * dp]); ctx.globalAlpha = 0.9;
      ctx.strokeRect(x0, y0, Math.max(...xs) + m - x0, Math.max(...ys) + m - y0); ctx.restore();
    }
    const k = single() || (group().length ? lead() : "") || (g ? g.key : ""); if (!k) return;
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
// カメラ mode is always the hand (a drag turns the camera); the buttons show it
let curKey = "";
function syncCursor(){
  const now = mode === "persp" ? "hand" : cursor; if (now + mode === curKey) return; curKey = now + mode;
  curBar.querySelectorAll("button[data-cur]").forEach(b => { const on = b.dataset.cur === now; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on));
    b.disabled = mode === "persp" && b.dataset.cur === "drag"; });
  front.classList.toggle("hand-cursor", now === "hand");
}
{ const d0 = draw; draw = function(){ d0.apply(this, arguments); syncCursor(); }; }
function setCursor(c, tell){
  cursor = c; try { localStorage.setItem(CUR_KEY, c); } catch (e) {}
  curKey = ""; syncCursor(); if (tell) toast(c === "hand" ? "ハンド：ドラッグでカメラを動かします。" : "ドラッグ：何もない所からドラッグで範囲選択します。");
}
addEventListener("DOMContentLoaded", () => { if (!window.ODMICONS) return;
  curBar.querySelectorAll("button[data-gzicon]").forEach(b => { if (!b.querySelector("svg")) b.insertAdjacentHTML("afterbegin", ODMICONS.svg(b.dataset.gzicon)); }); });
syncCursor();

// ---- the objects' edit buttons (for touch, and the mouse too): under the cursor, while something is
// selected in 配置 or there is something to paste
const editBar = document.createElement("div");
editBar.className = "gz-tools edit-tools"; editBar.id = "ovEdit"; editBar.setAttribute("role", "group"); editBar.setAttribute("aria-label", "選んだ物の編集"); editBar.dataset.ui = "skip";
editBar.hidden = true;
editBar.innerHTML = [["del", "trash", "削除", "選んだ物を外す（Delete）"], ["cut", "cut", "切り取り", "選んだ物を切り取る（Ctrl+X）"],
  ["copy", "copy", "コピー", "選んだ物をコピーする（Ctrl+C）"], ["paste", "paste", "貼り付け", "コピーした物を貼り付ける（Ctrl+V）"]]
  .map(([id, ic, name, tip]) => `<button type="button" data-ed="${id}" data-gzicon="${ic}" title="${tip}"><span>${name}</span></button>`).join("");
curBar.after(editBar);
editBar.addEventListener("click", e => {
  const b = e.target.closest("button[data-ed]"); if (!b || b.disabled) return;
  const keys = mode === "place" ? selected().filter(isObj) : [], n = keys.length;      // figures stay
  if (b.dataset.ed === "del") removeKeys(keys);
  else if (b.dataset.ed === "cut"){ if (copyKeys(keys)){ removeKeys(keys, true); say(n > 1 ? `${n}個の物を切り取りました。` : "切り取りました。"); } }
  else if (b.dataset.ed === "copy"){ if (copyKeys(keys)) say(n > 1 ? `${n}個の物をコピーしました。` : "コピーしました。"); }
  else paste();
});
let editKey = "";
function syncEdit(){
  const n = mode === "place" ? selected().filter(isObj).length : 0, clip = mode === "place" && !!clipNow();
  const k = n + "|" + clip; if (k === editKey) return; editKey = k;
  editBar.hidden = !(n || clip);
  editBar.querySelectorAll("button[data-ed]").forEach(b => { b.disabled = b.dataset.ed === "paste" ? !clip : !n; });
}
{ const d0 = draw; draw = function(){ d0.apply(this, arguments); syncEdit(); }; }
addEventListener("DOMContentLoaded", () => { if (!window.ODMICONS) return;
  editBar.querySelectorAll("button[data-gzicon]").forEach(b => { if (!b.querySelector("svg")) b.insertAdjacentHTML("afterbegin", ODMICONS.svg(b.dataset.gzicon)); }); });

window.ODMObj = {key: single, group, selected, lead, isFig, figSave, figMove, figTurn, worldTurn, axesOf, setSel, pivWorld, pivRel, setPivRel, setPivAbs, resetPiv, keepPivot,
  remove: removeKeys, copy: copyKeys, paste, hasClip: () => !!clipNow(), cursor: () => cursor, setCursor};

// i18n.js loads after this file: the table waits for it (ODMPoserI18nEarly)
(window.ODMPoserI18n || {add: t => (window.ODMPoserI18nEarly = window.ODMPoserI18nEarly || []).push(t)}).add({
  "カーソル": "Cursor", "選んだ物の編集": "Edit the selected", "削除": "Delete", "切り取り": "Cut", "コピー": "Copy", "貼り付け": "Paste",
  "選んだ物を外す（Delete）": "Take the selected away (Delete)", "選んだ物を切り取る（Ctrl+X）": "Cut the selected (Ctrl+X)",
  "選んだ物をコピーする（Ctrl+C）": "Copy the selected (Ctrl+C)", "コピーした物を貼り付ける（Ctrl+V）": "Paste what was copied (Ctrl+V)", "ドラッグ": "Drag", "ハンド": "Hand",
  "ドラッグ：何もない所からドラッグで物を範囲選択（Vキー）": "Drag: drag from an empty place to box-select objects (V)",
  "ハンド：ドラッグでカメラを回す・Shift＋ドラッグで動かす（Hキー）": "Hand: drag to turn the camera, Shift+drag to move it (H)",
  "ハンド：ドラッグでカメラを動かします。": "Hand: dragging moves the camera.", "ドラッグ：何もない所からドラッグで範囲選択します。": "Drag: drag from an empty place to box-select.",
  "選んだ物を外しました。": "Took the selected one away.", "切り取りました。": "Cut.", "コピーしました。": "Copied.", "貼り付けました。": "Pasted.",
  "1個の物を選びました。": "Selected one object.", "この物を中心にまとめて動かします。": "The group now turns about this one.",
  "この人物を中心にまとめて動かします。": "The group now turns about this figure's hips.", "人物を選びました（腰）。": "Selected the figure (its hips).",
  "人物全体を動かします（腰）。": "Moving the whole figure (by the hips).",
  "クリックで自動的にモードを切り替える": "Switch modes by what is clicked",
  "物を押すと配置モード、関節を押すとポーズモード（配置・カメラから）、何もない所をクリックするとカメラモード（ポーズ・体格から）に切り替えます":
    "A thing: Place mode; a joint: Pose mode (from Place or Camera); an empty place: Camera mode (from Pose or Body)"});
})();
