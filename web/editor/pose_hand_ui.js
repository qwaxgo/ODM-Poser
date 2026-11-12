// The fingers by hand (src/pages/editor/index.astro, loaded after pose_sideview.js): the hand's model is
// pose_hand.js. In ポーズ, with a hand selected (its wrist or its hand; pressing its fingers selects it),
// its 15 finger joints show as small circles: one pressed is selected (fingerSel) and dragged to bend
// it (the root also spreads); with the 3-axis handles on, the rotate rings bend it (red) and spread
// it (green, the root); the joint panel sets it in numbers. A hand's shape: one of the named shapes, or
// its own joints (S.fingers), which can be kept by name (KEY-handsets, this browser) and called back on
// either hand. 体格: the hands' size (both alike: the hand bone's length) and each finger's length.
(() => {
const $ = id => document.getElementById(id);
const SETS_KEY = KEY + "-handsets";
// the loupe (below): on at first, kept in this browser
let loupeOn = true; try { const v = localStorage.getItem(KEY + "-loupe"); if (v !== null) loupeOn = v === "1"; } catch (e) {}
const sideOf = i => J[i] === "r_hand" || J[i] === "r_wrist" ? "r" : J[i] === "l_hand" || J[i] === "l_wrist" ? "l" : "";
const copy = v => JSON.parse(JSON.stringify(v));
const r1 = v => Math.round(v * 10) / 10;

// ---- the own shapes kept in this browser ----------------------------------------------------------
let sets = [];
try { const v = JSON.parse(localStorage.getItem(SETS_KEY) || "[]"); if (Array.isArray(v)) sets = v.filter(s => s && typeof s.name === "string" && Array.isArray(s.a) && s.a.length === 5); } catch (e) {}
const keepSets = () => { try { localStorage.setItem(SETS_KEY, JSON.stringify(sets)); } catch (e) {} };
const escH = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
// the shape list: the named shapes, then the own ones ("u:<name>")
function selHTML(){
  const named = Object.keys(HANDS).map(k => `<option value="${k}">${HAND_JA[k] || k}（${k}）</option>`).join("");
  return named + (sets.length ? `<optgroup label="自分の形">${sets.map(s => `<option value="u:${escH(s.name)}">${escH(s.name)}</option>`).join("")}</optgroup>` : "");
}
window.ODMHand = {selHTML};
function fillSel(){ const el = $("handSel"), v = el.value; el.innerHTML = selHTML(); if ([...el.options].some(o => o.value === v)) el.value = v; }

// ---- the panel: under the hand's shape in the joint's section --------------------------------------
const box = document.createElement("div");
box.id = "fgBox"; box.style.display = "none";
const range = (id, lab, unit) => `<label for="${id}">${lab}</label><div class="row"><input type="range" id="${id}" step="1"><input type="number" class="num" id="${id}N" step="1"><span class="unit">${unit}</span></div>`;
box.innerHTML = `<div class="hint" id="fgState"></div>
  <div class="grid2"><div><label for="fgFinger">指</label><select id="fgFinger">${FINGER_JA.map((t, n) => `<option value="${n}">${t}</option>`).join("")}</select></div>
    <div><label for="fgJoint">関節</label><select id="fgJoint"></select></div></div>
  ${range("fgBend", "曲げ（＋手のひらへ）", "°")}
  <div id="fgSpreadRow">${range("fgSpread", "開き（付け根、＋外へ）", "°")}</div>
  <div class="btns"><button type="button" id="fgStraight">この指をまっすぐ</button><button type="button" id="fgOther" title="反対の手を、この手と同じ指の形にする">反対の手も同じ形に</button>
    <button type="button" id="fgBack" title="指の調整をやめて、選んでいる手の形に戻す">↺ 手の形に戻す</button></div>
  <label for="fgName">自分の手の形</label>
  <div class="row"><input type="text" id="fgName" placeholder="名前（例：ペンを持つ）"><button type="button" id="fgSave">記憶</button></div>
  <div class="btns"><button type="button" id="fgDel" title="上の一覧で選んでいる自分の形を、このブラウザから消す">選んだ自分の形を削除</button></div>
  <label title="手を選んでいる間、図の上に手を大きく出す。ルーペの中の丸を押して曲げられる"><input type="checkbox" id="loupeOn" checked> ルーペを出す（手を選んでいる間）</label>
  <div class="hint">手を選ぶと、指の関節が小さな丸で出ます。丸をドラッグする（付け根は開きも）か、3軸ハンドルの回転（赤：曲げ、緑：開き）で曲げます。タッチでは、丸をタップしてからドラッグします。</div>`;
$("handRow").after(box);
fillSel();

const curSide = () => sideOf(sel);
// the joint the panel works on: the selected one on this hand, else the panel's own choice
function curJoint(){
  const s = curSide(); if (!s) return null;
  const fs = fingerSelOf(s);
  return fs || {side: s, n: +$("fgFinger").value || 0, j: +$("fgJoint").value || 0};
}
function fillJoints(n){ const el = $("fgJoint"), v = el.value;
  el.innerHTML = FINGER_JOINT_JA[n === 0 ? 0 : 1].map((t, j) => `<option value="${j}">${t}</option>`).join("");
  el.value = v || "0"; }
fillJoints(0);
function put(id, v, lo, hi){ const r = $(id), n = $(id + "N"); r.min = lo; r.max = hi; n.min = lo; n.max = hi;
  if (rangeHeld !== r) r.value = v; if (document.activeElement !== n) n.value = r1(v); }
function sync(){
  const s = sideOf(sel);
  box.style.display = s ? "" : "none";
  if (!s) return;
  const own = S.fingers && S.fingers[s], name = S.hands[s], h = heldOf(s);
  const made = h ? !!(h.it.handPose && h.it.handPose[h.role]) : !!(own && own.from === name);
  // a held thing's hand: its own (in the thing), else the one it brings
  $("fgState").textContent = h ? `持ち物「${itemName(h.it)}」の握り（${made ? "調整あり" : "持ち物の手の形"}）`
    : made ? (own.name ? `自分の形「${own.name}」（もと：${HAND_JA[name] || name}）` : `指を調整しています（もと：${HAND_JA[name] || name}）`)
    : `手の形：${HAND_JA[name] || name}`;
  $("loupeOn").checked = loupeOn;
  if (!h && made && own.name && document.activeElement !== $("handSel") && [...$("handSel").options].some(o => o.value === "u:" + own.name)) $("handSel").value = "u:" + own.name;
  const c = curJoint(), A = handAngles(s)[c.n], L = FINGER_LIM[c.n];
  if (document.activeElement !== $("fgFinger")) $("fgFinger").value = c.n;
  if ($("fgJoint").options.length !== 3 || $("fgJoint").dataset.n !== String(c.n)){ fillJoints(c.n); $("fgJoint").dataset.n = String(c.n); }
  if (document.activeElement !== $("fgJoint")) $("fgJoint").value = c.j;
  put("fgBend", A[1 + c.j], L.bend[c.j][0], L.bend[c.j][1]);
  $("fgSpreadRow").style.display = c.j === 0 ? "" : "none";
  if (c.j === 0) put("fgSpread", A[0], L.spread[0], L.spread[1]);
  $("fgBack").disabled = !made;
  $("fgDel").disabled = !!h || !(made && own.name && sets.some(x => x.name === own.name));
}
function itemName(it){ const d = (window.PROPS || {})[it.key] || {}; return d.ja || it.key; }
// the joint panel's own sync (showSelected, pose_main.js) brings this along
{ const s0 = showSelected; showSelected = function(){ s0.apply(this, arguments); sync(); }; }

const edited = msg => { draw(); if (msg) say(msg); };
for (const id of ["fgFinger", "fgJoint"]) $(id).addEventListener("change", () => {
  const s = curSide(); if (!s) return;
  const n = +$("fgFinger").value; if (id === "fgFinger") fillJoints(n);
  fingerSel = {side: s, n, j: Math.min(2, +$("fgJoint").value || 0)}; draw(); });
const setFrom = (kind, v) => { const c = curJoint(); if (!c || !isFinite(v)) return;
  // the panel's choice becomes the selected joint, so the circle shows which one
  fingerSel = {side: c.side, n: c.n, j: c.j};
  if (kind === "bend") setFingerJoint(c.side, c.n, c.j, v); else setFingerJoint(c.side, c.n, 0, undefined, v);
  draw(); };
$("fgBend").addEventListener("input", e => setFrom("bend", +e.target.value));
$("fgSpread").addEventListener("input", e => setFrom("spread", +e.target.value));
$("fgBendN").addEventListener("change", e => { remember(); setFrom("bend", +e.target.value); });
$("fgSpreadN").addEventListener("change", e => { remember(); setFrom("spread", +e.target.value); });
$("fgStraight").addEventListener("click", () => { const c = curJoint(); if (!c) return; remember();
  ownAngles(c.side)[c.n] = [0, 0, 0, 0]; if (!heldOf(c.side) && S.fingers[c.side]) delete S.fingers[c.side].name; edited(`${FINGER_JA[c.n]}をまっすぐにしました。`); });
$("fgBack").addEventListener("click", () => { const s = curSide(); if (!s) return; const h = heldOf(s);
  if (h){ if (!h.it.handPose || !h.it.handPose[h.role]) return; remember(); delete h.it.handPose[h.role];
    if (!Object.keys(h.it.handPose).length) delete h.it.handPose; edited(`持ち物「${itemName(h.it)}」の手の形に戻しました。`); return; }
  if (!S.fingers || !S.fingers[s]) return; remember();
  delete S.fingers[s]; edited(`${HAND_JA[S.hands[s]] || S.hands[s]}の形に戻しました。`); });
$("fgOther").addEventListener("click", () => { const s = curSide(); if (!s) return; const o = s === "r" ? "l" : "r"; remember();
  const a = handAngles(s), ho = heldOf(o);
  // the other hand holds a thing: its grip takes the joints; else the hand gets this hand's shape and joints
  if (ho){ ho.it.handPose = ho.it.handPose || {}; ho.it.handPose[ho.role] = a; }
  else { S.hands[o] = S.hands[s]; S.fingers = S.fingers || {}; S.fingers[o] = {from: S.hands[o], a}; }
  edited(`${o === "r" ? "右手" : "左手"}も同じ形にしました。`); });
$("fgSave").addEventListener("click", () => {
  const s = curSide(), name = $("fgName").value.trim().slice(0, 40);
  if (!s) return;
  if (!name){ say("自分の手の形の名前を入れてください。", true); $("fgName").focus(); return; }
  const a = handAngles(s);
  sets = sets.filter(x => x.name !== name).concat([{name, a}]); keepSets(); fillSel();
  remember(); ownAngles(s); if (!heldOf(s)) S.fingers[s].name = name; $("fgName").value = "";
  edited(`自分の手の形「${name}」を記憶しました（どちらの手でも「この腕の手の形」から呼び出せます）。`);
});
$("fgDel").addEventListener("click", () => {
  const s = curSide(), own = s && S.fingers && S.fingers[s]; if (!own || !own.name) return;
  const name = own.name; sets = sets.filter(x => x.name !== name); keepSets(); fillSel();
  delete own.name; edited(`自分の手の形「${name}」を削除しました（今の手の形はそのままです）。`);
});
// the shape list: a named shape (the own joints let go) or an own one (on the shape the hand has)
$("handSel").addEventListener("change", e => {
  const s = curSide(); if (!s) return; remember();
  const v = e.target.value, h = heldOf(s);
  // a held thing's hand: the shape chosen goes into the thing's grip (it keeps holding)
  if (h){ const d = v.startsWith("u:") ? sets.find(x => x.name === v.slice(2)) : null;
    const a = d ? d.a.map((f, n) => clampFinger(n, f)) : HANDS[v] ? shapeAngles(v) : null; if (!a) return;
    h.it.handPose = h.it.handPose || {}; h.it.handPose[h.role] = a; $("handSel").value = S.hands[s];
    edited(`持ち物「${itemName(h.it)}」の握りを「${d ? d.name : HAND_JA[v] || v}」の形にしました。`); return; }
  if (v.startsWith("u:")){ const d = sets.find(x => x.name === v.slice(2)); if (!d) return;
    S.fingers = S.fingers || {}; S.fingers[s] = {from: S.hands[s], a: d.a.map((f, n) => clampFinger(n, f)), name: d.name};
    edited(`自分の手の形「${d.name}」にしました。`); return; }
  S.hands[s] = v; if (S.fingers) delete S.fingers[s];
  edited(`${s === "r" ? "右手" : "左手"}を「${HAND_JA[v] || v}」にしました。`);
});

// ---- on the front view: the circles pressed and dragged --------------------------------------------
const PXN = () => (typeof figPX === "function" ? figPX() : null);
const screenOf = (p, W, H) => withPX(PXN(), () => project(p, W, H));
// the finger joint under the pointer, on the selected hand
function fingerAt(x, y){
  const s = sideOf(sel); if (!s || mode !== "pose") return null;
  const W = front.width, H = front.height, sh = handShape3D(s), lim = 7 * (devicePixelRatio || 1) * Math.min(1.4, pointerScale());
  let best = null, bd = lim;
  for (let n = 0; n < 5; n++) for (let j = 0; j < 3; j++){
    const q = screenOf(sh.pts[1 + 4 * n + j], W, H), d = Math.hypot(q.x - x, q.y - y);
    if (d < bd){ bd = d; best = {side: s, n, j}; }
  }
  return best;
}
// a hand whose fingers are under the pointer (to select it: its circles then show)
function handNear(x, y){
  const W = front.width, H = front.height, lim = 10 * (devicePixelRatio || 1) * pointerScale();
  for (const s of ["r", "l"]) for (const p of handPoints3D(s)){ const q = screenOf(p, W, H); if (Math.hypot(q.x - x, q.y - y) < lim) return s; }
  return "";
}
// the drag: the joint's bone (and the root's spread) turned so its end comes as near the pointer as it can
function dragFinger(fs){
  const W = front.width, H = front.height, L = FINGER_LIM[fs.n], i = 2 + 4 * fs.n + fs.j;
  const a = ownAngles(fs.side); if (!heldOf(fs.side) && S.fingers[fs.side]) delete S.fingers[fs.side].name;
  const cost = (sp, b, x, y) => { a[fs.n] = clampFinger(fs.n, Object.assign(a[fs.n].slice(), {0: sp, [1 + fs.j]: b}));
    const q = screenOf(handShape3D(fs.side).pts[i], W, H); return Math.hypot(q.x - x, q.y - y); };
  return {move(x, y){
    const f0 = a[fs.n].slice(), spreads = fs.j === 0 ? [] : [f0[0]];
    if (fs.j === 0) for (let v = L.spread[0]; v <= L.spread[1]; v += 3) spreads.push(v);
    let best = [f0[0], f0[1 + fs.j]], bc = Infinity;
    for (const sp of spreads) for (let b = L.bend[fs.j][0]; b <= L.bend[fs.j][1]; b += 4){
      const c = cost(sp, b, x, y); if (c < bc){ bc = c; best = [sp, b]; } }
    // finer, round the best
    const [s1, b1] = best;
    for (let ds = fs.j === 0 ? -3 : 0; ds <= (fs.j === 0 ? 3 : 0); ds += 1) for (let db = -4; db <= 4; db += 1){
      const c = cost(s1 + ds, b1 + db, x, y); if (c < bc){ bc = c; best = [s1 + ds, b1 + db]; } }
    a[fs.n] = clampFinger(fs.n, Object.assign(f0, {0: best[0], [1 + fs.j]: best[1]}));
  }};
}
// before the joints, the automatic mode switch and the 3-axis handles' own hook: a finger circle pressed
// (closely: the circles are small) is the finger's, even inside the handles' rings (on a phone the
// hand's rings cover the whole hand); a press between the circles goes on to the handles
const fingerDown = (cv, x, y, e) => {
  if (cv !== front || mode !== "pose") return null;
  const hit = fingerAt(x, y);
  if (!hit){
    fingerSel = null;
    // a hand not selected: pressing its fingers (no joint there) selects it
    if (!gizmoHolds() && pick(cv, x, y) < 0){ const s = handNear(x, y); if (s && !sideOf(sel)){ sel = IX[s + "_hand"]; draw(); return {move(){}}; } }
    return null;
  }
  const same = fingerSel && fingerSel.side === hit.side && fingerSel.n === hit.n && fingerSel.j === hit.j;
  fingerSel = hit; sel = IX[hit.side + "_hand"]; draw();
  // the handles show (they do the turning) or a finger's first tap: selected only
  if (gizmoHolds() || (e && e.pointerType === "touch" && !same)) return {move(){}};
  return dragFinger(hit);
};
{ const gi = window.ODMGizmo && ODMGizmo.downHook ? DOWN_HOOKS.indexOf(ODMGizmo.downHook) : -1;
  DOWN_HOOKS.splice(Math.max(0, gi), 0, fingerDown); }

// ---- the 3-axis handles: the rotate rings on the selected finger joint ----------------------------
window.ODMGizmoTargets.push(() => {
  if (mode !== "pose") return null;
  const fs = fingerSelOf(sideOf(sel)); if (!fs) return null;
  const fj = fingerJoint(fs.side, fs.n, fs.j);
  return {c: fj.p, ax: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], pivot: fj.p, rings: fs.j === 0 ? [0, 1] : [0], ringAx: [fj.bendAx, fj.spreadAx, fj.d],
    sc: [], lacks: ["move", "scale"],
    save: () => ({f: handAngles(fs.side)[fs.n]}),
    turn: (s0, k, dg) => { if (k === 0) setFingerJoint(fs.side, fs.n, fs.j, s0.f[1 + fs.j] + dg);
      else setFingerJoint(fs.side, fs.n, 0, undefined, s0.f[0] + dg); }};
});


// ---- the loupe: the selected hand enlarged over the front view (on at first; a phone shows a hand at a
// few dozen pixels). Drawn from the front view's own picture of the hand, scaled about the hand, so it
// looks the same way; its finger circles are pressed and dragged there (the scale is kept while dragging)
const loupe = $("handLoupe");
$("loupeOn").checked = loupeOn;
$("loupeOn").addEventListener("change", e => { loupeOn = e.target.checked; try { localStorage.setItem(KEY + "-loupe", loupeOn ? "1" : "0"); } catch (err) {} draw(); });
let lDrag = null, lMap = null;
const loupeShows = () => loupeOn && mode === "pose" && !!sideOf(sel) && !!loupe;
// front-view pixels -> loupe pixels, about the hand (from the wrist to the fingertips)
function loupeMap(s){
  const W = front.width, H = front.height, sh = handShape3D(s), P = [...sh.pts, ...sh.heel].map(p => screenOf(p, W, H));
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const q of P){ x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); }
  const L = loupe.width, m = Math.min(40, L * 0.8 / Math.max(x1 - x0, y1 - y0, 1));
  return {s, c: [(x0 + x1) / 2, (y0 + y1) / 2], m, L};
}
const toLoupe = (M, q) => [(q.x - M.c[0]) * M.m + M.L / 2, (q.y - M.c[1]) * M.m + M.L / 2];
// for the tests (tests/test_hands.py, test_mobile.py): where a point shows in the loupe
window.loupeMapForTest = () => lMap; window.toLoupeForTest = (M, p) => toLoupe(M, screenOf(p, front.width, front.height));
const fromLoupe = (M, x, y) => [(x - M.L / 2) / M.m + M.c[0], (y - M.L / 2) / M.m + M.c[1]];
function drawLoupe(){
  if (!loupe) return;
  const on = loupeShows(); loupe.hidden = !on; if (!on){ lMap = null; return; }
  const dpr = devicePixelRatio || 1, px = Math.round(loupe.clientWidth * dpr) || Math.round(168 * dpr);
  if (loupe.width !== px){ loupe.width = px; loupe.height = px; }
  const s = sideOf(sel), M = lDrag ? lDrag.M : loupeMap(s); lMap = M;
  const ctx = loupe.getContext("2d"), W = front.width, H = front.height, L = M.L, sh = handShape3D(s);
  ctx.clearRect(0, 0, L, L); ctx.fillStyle = cssVar("--stage"); ctx.fillRect(0, 0, L, L);
  const P = [...sh.pts, ...sh.heel].map(p => toLoupe(M, screenOf(p, W, H)));
  const ink = partColor(s + "_hand") || cssVar("--figure"), lw = Math.max(1.5, L / 110);
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  // the forearm, toward the elbow, for the way the hand goes
  { const w = toLoupe(M, screenOf(S.P[IX[s + "_wrist"]], W, H)), e = toLoupe(M, screenOf(S.P[IX[s + "_elbow"]], W, H));
    ctx.strokeStyle = cssVar("--far"); ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(w[0], w[1]); ctx.lineTo(e[0], e[1]); ctx.stroke(); }
  ctx.strokeStyle = ink; ctx.lineWidth = lw;
  const line = idx => { ctx.beginPath(); idx.forEach((i, k) => k ? ctx.lineTo(P[i][0], P[i][1]) : ctx.moveTo(P[i][0], P[i][1])); ctx.stroke(); };
  line([22, 17, 13, 9, 5, 1, 21, 22]);
  for (let n = 0; n < 5; n++){ const b = 1 + 4 * n; line([b, b + 1, b + 2, b + 3]); }
  const fs = fingerSelOf(s), r = Math.max(5 * dpr, L / 26);
  for (let n = 0; n < 5; n++) for (let j = 0; j < 3; j++){
    const q = P[1 + 4 * n + j], me = fs && fs.n === n && fs.j === j;
    ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, 2 * Math.PI);
    ctx.fillStyle = me ? cssVar("--sel") : cssVar("--stage"); ctx.fill();
    ctx.strokeStyle = me ? cssVar("--sel") : cssVar("--far"); ctx.lineWidth = Math.max(1, lw * 0.7); ctx.stroke();
  }
  ctx.fillStyle = cssVar("--sub"); ctx.font = `${Math.round(10 * dpr)}px sans-serif`;
  ctx.fillText(s === "r" ? "右手" : "左手", 6 * dpr, 14 * dpr);
}
function loupeHit(x, y){
  if (!lMap) return null;
  const W = front.width, H = front.height, sh = handShape3D(lMap.s), lim = 16 * (devicePixelRatio || 1);
  let best = null, bd = lim;
  for (let n = 0; n < 5; n++) for (let j = 0; j < 3; j++){
    const q = toLoupe(lMap, screenOf(sh.pts[1 + 4 * n + j], W, H)), d = Math.hypot(q[0] - x, q[1] - y);
    if (d < bd){ bd = d; best = {side: lMap.s, n, j}; }
  }
  return best;
}
if (loupe){
  const at = e => { const r = loupe.getBoundingClientRect(), k = loupe.width / (r.width || 1); return [(e.clientX - r.left) * k, (e.clientY - r.top) * k]; };
  loupe.addEventListener("pointerdown", e => {
    e.preventDefault(); const [x, y] = at(e), hit = loupeHit(x, y); if (!hit) return;
    fingerSel = hit; sel = IX[hit.side + "_hand"];
    // pressed in the loupe: bent at once, mouse or finger (the circles are big there)
    remember(); lDrag = {M: lMap, d: dragFinger(hit)};
    try { loupe.setPointerCapture(e.pointerId); } catch (err) {}
    draw();
  });
  loupe.addEventListener("pointermove", e => { if (!lDrag) return; const [x, y] = at(e), f = fromLoupe(lDrag.M, x, y); lDrag.d.move(f[0], f[1]); drawSoon(); });
  const end = () => { if (!lDrag) return; lDrag = null; draw(); };
  loupe.addEventListener("pointerup", end); loupe.addEventListener("pointercancel", end);
}

// ---- 装備: where a held thing sits in its hand (and the other hand's grip of a two-handed one) -------
// it.gripOff {main, other}: [x, y, z] cm in the hand's frame, from the place the hand shape gives
const gbox = document.createElement("div");
gbox.id = "gripBox";
const GRIP_AX = [["gpX", "手のひらから外へ"], ["gpY", "親指の方へ"], ["gpZ", "指先の方へ"]];
gbox.innerHTML = `<label for="gpRole">手の中の位置</label><select id="gpRole"><option value="main">持つ手（利き手）</option><option value="other">もう片方の手（両手持ち）</option></select>
  ${GRIP_AX.map(([id, t]) => range(id, t, "cm").replace('step="1"', 'step="0.1"').replace('step="1"', 'step="0.1"')).join("")}
  <div class="btns"><button type="button" id="gpHand" title="この持ち物を握る手を選び、指の関節を出す（ポーズモード）">握る手の形を調整</button><button type="button" id="gpReset" title="手の中の位置と握る手の形を、この持ち物の初期値に戻す">↺ 位置と手の形を戻す</button></div>
  <div class="hint">持ち物は手の形（握り）を持っていて、指を調整するとその持ち物に残ります。外して持ち直しても、同じ握りになります。</div>`;
{ const at = $("scGripReset") && $("scGripReset").closest(".btns"); if (at) at.after(gbox); }
const heldItem = () => { const it = typeof scSel === "number" ? S.items[scSel] : null; const d = it && (window.PROPS || {})[it.key];
  return it && d && !it.where && d.place === "hand" ? it : null; };
function gsync(){
  const it = heldItem(); gbox.style.display = it ? "" : "none"; if (!it) return;
  const d = PROPS[it.key], two = !!(d.grip2 && it.both !== false);
  $("gpRole").querySelector('option[value="other"]').disabled = !two; if (!two) $("gpRole").value = "main";
  const off = (it.gripOff && it.gripOff[$("gpRole").value]) || [0, 0, 0];
  GRIP_AX.forEach(([id], k) => put(id, off[k] || 0, -6, 6));
}
{ const d0 = draw; draw = function(){ d0.apply(this, arguments); gsync(); drawLoupe(); }; }
GRIP_AX.forEach(([id], k) => {
  const set = v => { const it = heldItem(); if (!it || !isFinite(v)) return; const role = $("gpRole").value;
    it.gripOff = it.gripOff || {}; const o = (it.gripOff[role] || [0, 0, 0]).slice(); o[k] = Math.max(-6, Math.min(6, v));
    if (o.every(x => !x)) delete it.gripOff[role]; else it.gripOff[role] = o;
    if (!Object.keys(it.gripOff).length) delete it.gripOff;
    afterEdit(); draw(); };
  $(id).addEventListener("input", e => set(+e.target.value));
  $(id + "N").addEventListener("change", e => { remember(); set(+e.target.value); });
});
$("gpRole").addEventListener("change", () => draw());
$("gpHand").addEventListener("click", () => { const it = heldItem(); if (!it) return;
  const main = it.hand === "l" ? "l" : "r", side = $("gpRole").value === "other" ? (main === "r" ? "l" : "r") : main;
  if (window.ODMUI && ODMUI.showMenu) ODMUI.showMenu("pose");
  const b = document.querySelector('#modes [data-mode="pose"]'); if (b && mode !== "pose") b.click();
  sel = IX[side + "_hand"]; fingerSel = null; draw();
  say(`${side === "r" ? "右手" : "左手"}を選びました。指の関節の丸（ルーペの中でも）を動かすと、持ち物の握りが変わります。`); });
$("gpReset").addEventListener("click", () => { const it = heldItem(); if (!it) return; remember();
  delete it.gripOff; delete it.handPose; afterEdit(); draw(); say("手の中の位置と握る手の形を戻しました。"); });
// the item's grip comes back too with ↺ 持ち方と持つ位置を戻す
if ($("scGripReset")) $("scGripReset").addEventListener("click", () => { const it = heldItem(); if (!it) return; delete it.gripOff; delete it.handPose; afterEdit(); draw(); });

// ---- 体格: the hands' size and the fingers' lengths ---------------------------------------------------
const bsec = document.createElement("section");
bsec.dataset.menu = "body";
bsec.innerHTML = `<h2>手の大きさ・指の長さ</h2>
  <label title="外すと、右手と左手の大きさを別々に決める"><input type="checkbox" id="hdSame" checked> 左右の手を同じ大きさにする</label>
  ${range("hdLen", "手の長さ（手首〜中指の先）", "cm").replace('step="1"', 'step="0.1"').replace('step="1"', 'step="0.1"')}
  <div id="hdLRow">${range("hdLenL", "左手の長さ", "cm").replace('step="1"', 'step="0.1"').replace('step="1"', 'step="0.1"')}</div>
  ${FINGER_JA.map((t, n) => range("fgLen" + n, t + "の長さ", "%")).join("")}
  <div class="btns"><button type="button" id="hdReset" title="手の大きさを身長に合った大きさに、指の長さを標準に戻す">↺ 手と指の大きさを戻す</button></div>
  <div class="hint">指の長さは両手共通で、人による違いの範囲（85〜115%）で変えられます。</div>`;
{ const after = document.querySelector('aside > section[data-menu="body"]');
  if (after) after.after(bsec); else document.querySelector("aside").appendChild(bsec); }
const palmSum = () => HAND_LEN + 0.3 + FINGERS[2].segs.reduce((s, v) => s + v, 0) * fingerLens()[2];
function setHandK(k, only){
  k = Math.max(HAND_K_LIM[0], Math.min(HAND_K_LIM[1], k));
  for (const s of only ? [only] : ["r", "l"]){ const w = S.P[IX[s + "_wrist"]], h = IX[s + "_hand"], d = norm(sub(S.P[h], w));
    S.P[h] = add(w, mul(d, HAND_LEN * k)); }
}
// the usual size for this body: as the standard body's hand to its height
let restHeight = 0;
function usualK(){
  if (!restHeight){ const P0 = S.P; S.P = REST.map(p => p.slice()); try { restHeight = standingHeight(); } finally { S.P = P0; } }
  return standingHeight() / restHeight;
}
function bsync(){
  if (!bsec.classList.contains("active")) return;
  const base = palmSum(), apart = !!S.handApart;
  $("hdSame").checked = !apart; $("hdLRow").style.display = apart ? "" : "none";
  bsec.querySelector('label[for="hdLen"]').textContent = apart ? "右手の長さ（手首〜中指の先）" : "手の長さ（手首〜中指の先）";
  put("hdLen", handLength("r"), r1(base * HAND_K_LIM[0]), r1(base * HAND_K_LIM[1]));
  if (apart) put("hdLenL", handLength("l"), r1(base * HAND_K_LIM[0]), r1(base * HAND_K_LIM[1]));
  const FL = fingerLens(); for (let n = 0; n < 5; n++) put("fgLen" + n, Math.round(FL[n] * 100), FINGER_LEN_LIM[0] * 100, FINGER_LEN_LIM[1] * 100);
}
{ const d0 = draw; draw = function(){ d0.apply(this, arguments); bsync(); }; }
const setLen = (v, only) => { if (!isFinite(v)) return; setHandK(v / palmSum(), only); afterEdit(); draw(); };
$("hdLen").addEventListener("input", e => setLen(+e.target.value, S.handApart ? "r" : ""));
$("hdLenN").addEventListener("change", e => { remember(); setLen(+e.target.value, S.handApart ? "r" : ""); });
$("hdLenL").addEventListener("input", e => setLen(+e.target.value, "l"));
$("hdLenLN").addEventListener("change", e => { remember(); setLen(+e.target.value, "l"); });
// both alike again: the left takes the right's size
$("hdSame").addEventListener("change", e => { remember();
  if (e.target.checked){ delete S.handApart; setHandK(handK("r"), "l"); afterEdit(); say("左右の手を同じ大きさにしました（右手に合わせました）。"); }
  else { S.handApart = true; say("右手と左手の大きさを別々に決めます。"); }
  draw(); });
const setFL = (n, v) => { if (!isFinite(v)) return; const FL = fingerLens(); FL[n] = Math.max(FINGER_LEN_LIM[0], Math.min(FINGER_LEN_LIM[1], v / 100)); S.fingerLen = FL; draw(); };
for (let n = 0; n < 5; n++){
  $("fgLen" + n).addEventListener("input", e => setFL(n, +e.target.value));
  $("fgLen" + n + "N").addEventListener("change", e => { remember(); setFL(n, +e.target.value); });
}
$("hdReset").addEventListener("click", () => { remember(); S.fingerLen = fresh().fingerLen; delete S.handApart; setHandK(usualK()); afterEdit(); draw();
  say("手と指の大きさを戻しました。"); });

// i18n.js loads after this file: the table waits for it (ODMPoserI18nEarly)
(window.ODMPoserI18n || {add: t => (window.ODMPoserI18nEarly = window.ODMPoserI18nEarly || []).push(t)}).add({
  "自分の形": "Own shapes", "指": "Finger", "関節": "Joint", "親指": "Thumb", "人差し指": "Index finger", "中指": "Middle finger", "薬指": "Ring finger", "小指": "Little finger",
  "付け根（CM）": "Root (CM)", "中（MP）": "Middle (MP)", "先（IP）": "Tip (IP)", "付け根": "Root", "第2関節": "Middle joint", "第1関節": "Last joint",
  "曲げ（＋手のひらへ）": "Bend (+ toward the palm)", "開き（付け根、＋外へ）": "Spread (root, + outward)",
  "この指をまっすぐ": "Straighten this finger", "反対の手も同じ形に": "Same shape on the other hand", "反対の手を、この手と同じ指の形にする": "Give the other hand this hand's fingers",
  "↺ 手の形に戻す": "↺ Back to the hand shape", "指の調整をやめて、選んでいる手の形に戻す": "Drop the finger changes and go back to the chosen hand shape",
  "自分の手の形": "Own hand shape", "名前（例：ペンを持つ）": "Name (e.g. holding a pen)", "記憶": "Save",
  "選んだ自分の形を削除": "Delete the chosen own shape", "上の一覧で選んでいる自分の形を、このブラウザから消す": "Remove the own shape chosen in the list above from this browser",
  "手を選ぶと、指の関節が小さな丸で出ます。丸をドラッグする（付け根は開きも）か、3軸ハンドルの回転（赤：曲げ、緑：開き）で曲げます。タッチでは、丸をタップしてからドラッグします。":
    "Select a hand and its finger joints show as small circles. Drag a circle (a root also spreads) or turn it with the 3-axis handles' rotate rings (red: bend, green: spread). On touch, tap a circle, then drag it.",
  "自分の手の形の名前を入れてください。": "Type a name for the hand shape.",
  "手の大きさ・指の長さ": "Hand size and finger lengths", "手の長さ（手首〜中指の先）": "Hand length (wrist to the middle fingertip)",
  "親指の長さ": "Thumb length", "人差し指の長さ": "Index finger length", "中指の長さ": "Middle finger length", "薬指の長さ": "Ring finger length", "小指の長さ": "Little finger length",
  "↺ 手と指の大きさを戻す": "↺ Default hand and finger sizes", "手の大きさを身長に合った大きさに、指の長さを標準に戻す": "The hands to the size that suits the height, the fingers to the usual lengths",
  "両手とも同じ大きさになります。指の長さは、人による違いの範囲（85〜115%）で変えられます。": "Both hands get the same size. Finger lengths change within how people differ (85–115 %).",
  "手と指の大きさを戻しました。": "Hand and finger sizes back to the defaults.",
  "ルーペを出す（手を選んでいる間）": "Show the loupe (while a hand is selected)", "手を選んでいる間、図の上に手を大きく出す。ルーペの中の丸を押して曲げられる": "While a hand is selected, show it enlarged over the view; press the circles there to bend them",
  "手のルーペ（指の関節を押して曲げる）": "Hand loupe (press a finger joint to bend it)",
  "手の中の位置": "Place in the hand", "持つ手（利き手）": "Holding hand (main)", "もう片方の手（両手持ち）": "Other hand (two-handed)",
  "手のひらから外へ": "Out of the palm", "親指の方へ": "Toward the thumb", "指先の方へ": "Toward the fingertips",
  "握る手の形を調整": "Adjust the gripping hand", "この持ち物を握る手を選び、指の関節を出す（ポーズモード）": "Select the hand holding this thing and show its finger joints (Pose mode)",
  "↺ 位置と手の形を戻す": "↺ Default place and hand", "手の中の位置と握る手の形を、この持ち物の初期値に戻す": "The place in the hand and the gripping hand back to this thing's own",
  "持ち物は手の形（握り）を持っていて、指を調整するとその持ち物に残ります。外して持ち直しても、同じ握りになります。": "A thing brings its own hand shape (grip); adjusted fingers stay with the thing, so holding it again gives the same grip.",
  "手の中の位置と握る手の形を戻しました。": "The place in the hand and the gripping hand are back to the defaults.",
  "左右の手を同じ大きさにする": "Both hands the same size", "外すと、右手と左手の大きさを別々に決める": "Off: the right and left hands' sizes are set apart",
  "左手の長さ": "Left hand length", "右手の長さ（手首〜中指の先）": "Right hand length (wrist to the middle fingertip)",
  "指の長さは両手共通で、人による違いの範囲（85〜115%）で変えられます。": "Finger lengths are shared by both hands and change within how people differ (85–115 %).",
  "左右の手を同じ大きさにしました（右手に合わせました）。": "Both hands the same size now (as the right hand).", "右手と左手の大きさを別々に決めます。": "The right and left hands' sizes are set apart."});
draw();
})();
