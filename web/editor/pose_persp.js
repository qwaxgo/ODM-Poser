// パースの誇張 (index.html, loaded after pose_objects.js): apart from the lens, while the camera is
// locked, the perspective is pushed further about one pivot point (a mark on screen, never in the
// pictures): what lies at the pivot's depth keeps its size, farther shrinks fast toward the pivot,
// nearer grows out of it (a figure bursting out of a far carp streamer, a hero rushing at the
// camera). One strength for everything, drawn by one camera moved toward the pivot (pose_main.js:
// PX, pxNow), so lines stay straight, things that touch still touch, and the ruler follows.
// The camera can be moved for a while to place the pivot in depth (S.camPeek: the locked camera
// kept, the exaggeration resting; back with the button, and on a reload, a file or an export).
//
// S.persp: {pivot: {mode: "free", at [x, y, z] cm | mode: "attach", key "f<id>" | "s<k>" | "i<n>",
//           joint (a figure's), off [x, y, z] cm (a figure's: on the scene's axes; an object's: in
//           its own axes, null its middle)}, k: % (0 to 100)}
(() => {
const $ = id => document.getElementById(id);
const esc2 = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
function persp(){
  if (!S.persp || typeof S.persp !== "object") S.persp = {k: 0};
  const P = S.persp;                                            // the same object (callers keep it)
  if (!P.pivot || typeof P.pivot !== "object") P.pivot = {};
  const pv = P.pivot;
  if (!pv.mode) pv.mode = pv.key ? "attach" : "free";            // an older file: the pivot on a part or an object
  if (pv.mode === "free" && !Array.isArray(pv.at)) pv.at = S.P[IX.chest].map(v => Math.round(v));
  return P;
}

// ---- drawing and pressing: the figures by the same camera -------------------------------------------
// (the figure's drawing and OpenPose are in pose_main.js; the things in pose_scene.js / pose_solids.js)
for (const name of ["pick", "dragPose", "dragIK", "dragPair", "dragBody", "dragMidPinned", "handPoints"]){
  const fn = window[name]; if (typeof fn !== "function") continue;
  window[name] = function(){ const a = arguments; return withPX(figPX(), () => fn.apply(this, a)); };
}
for (const name of ["drawRuler", "guideEdges", "vanish", "horizonLine"]){
  const fn = window[name]; if (typeof fn !== "function") continue;
  window[name] = function(){ const a = arguments; return withPX(rulerPX(), () => fn.apply(this, a)); };
}

// ---- the camera moved for a while (the lock kept) --------------------------------------------------------
const peeking = () => !!(S.camLock && S.camPeek);
const SID = Math.random().toString(36).slice(2);             // this page's: a peek from a reload or a file ends
const unpeek = st => { const pk = st.camPeek; delete st.camPeek; if (pk && pk.cam) st.cam = pk.cam; if (pk && Array.isArray(pk.center)) st.center = pk.center; };
function peekStart(){
  if (!S.camLock || S.camPeek) return;
  S.camPeek = {cam: JSON.parse(JSON.stringify(S.cam)), center: S.center.slice(), sid: SID};
  camLockUI(); syncUI(); draw();
  say("固定したカメラを記憶したまま、一時的にカメラを動かせます（誇張は止まります）。「固定したカメラに戻る」で戻ります。");
}
function peekEnd(){
  if (!S.camPeek) return;
  unpeek(S); camLockUI(); syncUI(); draw();
  say("固定したカメラに戻りました。");
}
// the camera and its sliders move meanwhile
{ const h0 = camHeld; camHeld = function(){ return peeking() ? false : h0.apply(this, arguments); }; }
{ const u0 = camLockUI; camLockUI = function(){ u0.apply(this, arguments);
    if (!peeking()) return;
    for (const id of ["lens", "yaw", "pitch", "roll"]) { $(id).disabled = false; $(id + "V").disabled = false; }
    for (const id of [...CAM_P, ...CAM_T, "camReset"]) $(id).disabled = false; }; }
// the lock switched by hand: the camera stays where it is now
if ($("camLock")) $("camLock").addEventListener("change", () => { if (S.camPeek){ delete S.camPeek; camLockUI(); } draw(); });
// the pictures are the locked camera's (everything is drawn right after exportCanvas, in the same task)
{ const e0 = exportCanvas; exportCanvas = function(){
    const out = e0.apply(this, arguments);
    if (peeking()){ const pk = S.camPeek, cam = S.cam, center = S.center; unpeek(S);
      queueMicrotask(() => { S.camPeek = pk; S.cam = cam; S.center = center; }); }
    return out; }; }
// a file, a reload: on the locked camera
{ const u0 = upgradeState; upgradeState = function(st){ const r = u0.apply(this, arguments); if (st && st.camPeek && st.camPeek.sid !== SID) unpeek(st); return r; }; }
if (S.camPeek && S.camPeek.sid !== SID) unpeek(S);

// ---- the pivot's mark: shown while this panel is open or the camera moved for a while -------------------
const markOn = () => sec.classList.contains("active") || peeking();
const markAt = (W, H) => project(exPivot(), W, H);            // the same with or without the exaggeration
function drawMark(ctx, W, H){
  const p = markAt(W, H), u = devicePixelRatio || 1, r = 9 * u, c = "#ff5bd1";
  ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 2 * u; ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath();
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ ctx.moveTo(p.x + dx * r * 0.4, p.y + dy * r * 0.4); ctx.lineTo(p.x + dx * r * 2, p.y + dy * r * 2); }
  ctx.stroke();
  ctx.fillStyle = c; ctx.font = `${12 * u}px sans-serif`; ctx.fillText("誇張の支点", p.x + r * 1.3, p.y - r * 1.3);
  ctx.restore();
}
{ const d0 = drawAtari; drawAtari = function(ctx, W, H, opts){ const r = d0.apply(this, arguments);
    if (!(opts && opts.export) && ctx.canvas === front && markOn()) drawMark(ctx, W, H);
    return r; }; }
// an object's offset (its own axes) for a world point: its axes found from toWorld
function objOff(key, w){
  const o = ODMObj.toWorld(key, [0, 0, 0]); if (!o) return null;
  const ax = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map(e => sub(ODMObj.toWorld(key, e), o)), d = sub(w, o);
  return ax.map(a => dot(d, a) / (dot(a, a) || 1));
}
// the pivot to a world point: a free point there; an attached one's offset changes
function placePivot(w){
  const P = persp(), pv = P.pivot; w = w.map(v => Math.round(v * 10) / 10);
  if (pv.mode !== "attach"){ P.pivot = Object.assign({}, pv, {at: w}); return; }
  const key = pivKey();
  if (isObjKey(key)){ const off = objOff(key, w); if (off) P.pivot = Object.assign({}, pv, {key, off: off.map(v => Math.round(v * 10) / 10)}); return; }
  P.pivot = Object.assign({}, pv, {key, off: null});
  const base = exPivot();
  P.pivot.off = sub(w, base).map(v => Math.round(v * 10) / 10);
}
// the pivot selected (a press on its mark, or 3軸ハンドルで動かす): the 3-axis handles' move arrows move it
// along the scene's X, Y, Z (pose_gizmo.js); a click elsewhere, or the tab closed, lets it go
let pxSel = false;
// (with the handles on it, only the middle: the arrows start close by)
const handlesOn = () => pxSel && $("gizmoOn") && $("gizmoOn").checked;
const nearMark = (x, y) => { const p = markAt(front.width, front.height);
  return Math.hypot(x - p.x, y - p.y) <= (handlesOn() ? 6 : 16) * pointerScale() * (devicePixelRatio || 1); };
function selectPivot(){
  pxSel = true;
  if (window.ODMGizmo){ ODMGizmo.prefer("move"); ODMGizmo.show(); }
  draw();
}
(window.ODMGizmoTargets || []).push(() => {
  if (!pxSel) return null;
  if (!markOn()){ pxSel = false; return null; }
  const c = exPivot().slice();
  return {c, ax: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], pivot: c, rings: [], sc: [], lacks: ["rotate", "scale"], px: true,
    save: () => ({p: c.slice()}),
    move: (s0, d) => { placePivot(add(s0.p, d)); if (typeof afterEdit === "function") afterEdit(); }};
});
// an empty click with the pivot selected only lets it go (no switch to カメラ by the automatic mode)
{ const e0 = emptyClick; emptyClick = function(){ if (pxSel && markOn()){ pxSel = false; draw(); return; } return e0 ? e0.apply(this, arguments) : undefined; }; }
{ const t0 = tapClick; tapClick = function(t){
    if (pxSel && !(t && t.at && nearMark(t.at[0], t.at[1]))){ pxSel = false; draw(); }
    return t0 ? t0.apply(this, arguments) : undefined; }; }
DOWN_HOOKS.unshift((cv, x, y) => {
  if (cv !== front || !markOn()) return null;
  const W = cv.width, H = cv.height, p = markAt(W, H);
  if (!nearMark(x, y)) return null;
  if (!pxSel){ pxSel = true; if (window.ODMGizmo) ODMGizmo.prefer("move"); }
  const depth = withPX(null, () => toCam(exPivot())[2]), dx = x - p.x, dy = y - p.y;
  return {move(mx, my){
    // across the view at the same depth (the mark's place does not depend on the exaggeration)
    const w = withPX(null, () => { const D = camDist(W, H), dir = pixDir(mx - dx, my - dy, W, H), t = (depth - D) / dir[2];
      return add(camRotInv(add([0, 0, D], mul(dir, t))), S.center); });
    placePivot(w); if (typeof afterEdit === "function") afterEdit();
  }};
});

// ---- the panel: 見る › 視点 › パース ------------------------------------------------------------------
const row = (id, label, min, max, step, unit, title) => `<div id="${id}Box"><label${title ? ` title="${title}"` : ""}>${label}</label><div class="row">` +
  `<input type="range" id="${id}R" min="${min}" max="${max}" step="${step}" value="0"><input type="number" class="num" id="${id}" step="${step}" value="0"><span class="unit">${unit}</span></div></div>`;
const sec = document.createElement("section");
sec.dataset.menu = "persp";                 // 見る › 視点 › パース (ui-menu.js)
sec.innerHTML = `<h2>パースの誇張</h2>
  <div class="hint" id="pxState"></div>
  ${row("pxK", "誇張の強さ", 0, 100, 1, "%", "0 で誇張なし。大きいほど、支点より奥は支点に向かって急に縮み、手前は支点から飛び出すように大きくなる")}
  <label title="この点と同じ奥行きの物は大きさが変わらない">支点（大きさが変わらない所）</label>
  <select id="pxMode"><option value="free">自由な点</option><option value="attach">部位・物体に付ける</option></select>
  <div id="pxAttachBox"><label>付ける物</label><select id="pxKey"></select>
    <div id="pxJointBox"><label>部位</label><select id="pxJoint">${J.map(n => `<option value="${n}">${esc2(J_JA[n] || n)}</option>`).join("")}</select></div></div>
  <div class="hint" id="pxOffHint"></div>
  ${row("pxOX", "支点の位置 X", -500, 500, 1, "cm")}${row("pxOY", "支点の位置 Y", -500, 500, 1, "cm")}${row("pxOZ", "支点の位置 Z", -500, 500, 1, "cm")}
  <div class="btns" style="margin-top:6px"><button type="button" id="pxGizmo" title="支点に3軸ハンドルの移動の矢印を出し、X・Y・Z の方向に動かす">3軸ハンドルで動かす</button>
    <button type="button" id="pxToSel" title="支点を、選んでいる関節・物体の所に移す">選んだ所に移す</button>
    <button type="button" id="pxOffReset" title="付けた部位・物体の所（物体ならその真ん中）に戻す">↺ ずれをなくす</button></div>
  <div class="btns" style="margin-top:10px"><button type="button" id="pxPeek" title="固定したカメラを記憶したまま、カメラを回して支点の奥行きを確かめる">カメラを一時的に動かす</button></div>
  <div class="hint">支点の印（ピンクの十字）は画面でドラッグして動かせます（今の奥行きのまま）。印を押すか「3軸ハンドルで動かす」で、3軸ハンドルの矢印でも X・Y・Z の方向に動かせます。奥行きは、カメラを一時的に動かして横から合わせられます。印は書き出す画像には出ません。</div>
  <div class="hint">人物・図形・小物・ガイド図形・パース定規・床に、同じ強さで掛かります。書き出す画像（アタリ・OpenPose・定規）にも入ります。</div>`;
{ const lock = $("camLock") && $("camLock").closest("section"); if (lock) lock.after(sec); else document.querySelector("aside").appendChild(sec); }

function pivotKeys(){
  const out = [["f" + (S.figId || 1), `人物：${S.figName || "1人目"}（編集中）`]];
  for (const f of S.others || []) out.push(["f" + (f.figId || 1), `人物：${f.figName || ""}`]);
  (S.solids || []).forEach((o, k) => out.push(["s" + k, `${o.guide ? "ガイド" : "図形"}：${typeof solidName === "function" ? solidName(o) : o.kind}`]));
  (S.items || []).forEach((it, n) => { if (typeof movable === "function" && movable(it)) out.push(["i" + n, `小物：${(PROPS_[it.key] || {}).ja || it.key}`]); });
  return out;
}
const pivKey = () => { const k = persp().pivot.key; return k || "f" + (S.figId || 1); };
const isObjKey = k => /^[si]\d+$/.test(k);
// the numbers shown: a free point's place in the scene; an attached one's offset
function offNow(){
  const pv = persp().pivot, k = pivKey();
  if (pv.mode !== "attach") return pv.at;
  if (Array.isArray(pv.off)) return pv.off;
  return isObjKey(k) && window.ODMObj ? (ODMObj.midRel(k) || [0, 0, 0]) : [0, 0, 0];
}
let listKey = "";
function sync(){
  const P = persp(), keys = pivotKeys(), lk = JSON.stringify(keys), att = P.pivot.mode === "attach";
  if (lk !== listKey){ listKey = lk; $("pxKey").innerHTML = keys.map(([k, n]) => `<option value="${k}">${esc2(n)}</option>`).join(""); }
  const k = keys.some(([x]) => x === pivKey()) ? pivKey() : keys[0][0];
  $("pxMode").value = att ? "attach" : "free";
  $("pxAttachBox").style.display = att ? "" : "none";
  $("pxKey").value = k;
  $("pxJointBox").style.display = isObjKey(k) ? "none" : "";
  if (!isObjKey(k)) $("pxJoint").value = P.pivot.joint || "pelvis";
  $("pxOffHint").textContent = !att ? "支点の位置は、場面の座標（X・Y・Z）です。ほかの物とは一緒に動きません。"
    : isObjKey(k) ? "支点の位置は、その物体の座標（物体の向きに沿った X・Y・Z）です。物体と一緒に動きます。" : "支点の位置は、選んだ部位からのずれ（場面の X・Y・Z）です。人物と一緒に動きます。";
  $("pxOffReset").style.display = att ? "" : "none";
  $("pxState").textContent = peeking() ? "カメラを一時的に動かしています（誇張は止まっています）。"
    : S.camLock ? "カメラを固定しているので、誇張が効いています。" : "カメラを固定しているときだけ効きます（固定と記憶の「カメラを固定」）。";
  $("pxGizmo").classList.toggle("primary", !!handlesOn()); $("pxGizmo").setAttribute("aria-pressed", String(!!handlesOn()));
  $("pxPeek").textContent = peeking() ? "固定したカメラに戻る" : "カメラを一時的に動かす";
  $("pxPeek").disabled = !S.camLock;
  $("pxPeek").classList.toggle("primary", peeking());
  const put = (id, v) => { v = Math.round(v * 10) / 10; if (document.activeElement !== $(id)) $(id).value = v; if (document.activeElement !== $(id + "R")) $(id + "R").value = v; };
  offNow().forEach((v, i) => put(["pxOX", "pxOY", "pxOZ"][i], v));
  put("pxK", +P.k || 0);
}
{ const d0 = draw; draw = function(){ d0.apply(this, arguments); if (sec.classList.contains("active")) sync(); }; }

// the controls: one undo step per drag (the slider's pointerdown: pose_main.js), one per typed number
function setVal(id, v){
  const P = persp();
  if (id === "pxK") P.k = Math.max(0, Math.min(100, v));
  else { const n = ["pxOX", "pxOY", "pxOZ"].indexOf(id); if (n < 0) return; const o = offNow().slice(); o[n] = v;
    P.pivot = Object.assign({}, P.pivot, P.pivot.mode === "attach" ? {key: pivKey(), off: o} : {at: o}); }
  if (typeof afterEdit === "function") afterEdit(); draw();
}
for (const id of ["pxOX", "pxOY", "pxOZ", "pxK"]){
  const r = $(id + "R"), n = $(id);
  r.addEventListener("input", () => { n.value = r.value; setVal(id, +r.value); });
  n.addEventListener("change", () => { const v = +n.value; if (!isFinite(v)) return; remember(); r.value = v; setVal(id, v); });
}
// free / attached: the pivot stays where it is
$("pxMode").addEventListener("change", () => {
  remember(); const w = exPivot().slice(), P = persp();
  P.pivot = Object.assign({}, P.pivot, {mode: $("pxMode").value === "attach" ? "attach" : "free"});
  if (P.pivot.mode === "attach" && !P.pivot.key) P.pivot.key = pivKey();
  placePivot(w); if (typeof afterEdit === "function") afterEdit(); draw(); });
$("pxKey").addEventListener("change", () => { remember(); const P = persp(), k = $("pxKey").value;
  P.pivot = Object.assign({}, P.pivot, {key: k, joint: isObjKey(k) ? undefined : (P.pivot.joint || "pelvis"), off: null}); draw(); });
$("pxJoint").addEventListener("change", () => { remember(); const P = persp(); P.pivot = Object.assign({}, P.pivot, {key: pivKey(), joint: $("pxJoint").value, off: null}); draw(); });
$("pxOffReset").addEventListener("click", () => { remember(); const P = persp(); P.pivot = Object.assign({}, P.pivot, {off: null}); draw(); });
// 選んだ所に移す: the object chosen (its middle) or the joint picked; attached, the pivot goes onto it
$("pxToSel").addEventListener("click", () => {
  const O = window.ODMObj, k = O && O.key ? O.key() : "", P = persp(), att = P.pivot.mode === "attach";
  let w = null;
  if (k && isObjKey(k)){
    if (att){ remember(); P.pivot = Object.assign({}, P.pivot, {key: k, off: null}); draw(); say("支点を選んだ物体に付けました。"); return; }
    w = O.toWorld(k, null);
  } else if (sel >= 0 && S.P[sel]){
    if (att){ remember(); P.pivot = Object.assign({}, P.pivot, {key: "f" + (S.figId || 1), joint: J[sel], off: null}); draw(); say("支点を選んだ関節に付けました。"); return; }
    w = S.P[sel];
  }
  if (!w){ say("関節か物体を選んでから押してください。", true); return; }
  remember(); placePivot(w.slice()); if (typeof afterEdit === "function") afterEdit(); draw(); say("支点を選んだ所に移しました。");
});
$("pxGizmo").addEventListener("click", () => { selectPivot(); say("支点に3軸ハンドルを出しました（矢印で X・Y・Z に動かせます）。ほかの所をクリックすると外れます。"); });
$("pxPeek").addEventListener("click", () => { if (S.camPeek) peekEnd(); else peekStart(); });
sync();

// i18n.js loads after this file: the table waits for it (ODMPoserI18nEarly)
(window.ODMPoserI18n || {add: t => (window.ODMPoserI18nEarly = window.ODMPoserI18nEarly || []).push(t)}).add({
  "パースの誇張": "Exaggerated perspective", "誇張の強さ": "Strength",
  "0 で誇張なし。大きいほど、支点より奥は支点に向かって急に縮み、手前は支点から飛び出すように大きくなる":
    "0: none. The more, the faster what lies behind the pivot shrinks toward it and what is in front bursts out of it",
  "支点（大きさが変わらない所）": "Pivot (where the size stays)", "この点と同じ奥行きの物は大きさが変わらない": "What lies at this point's depth keeps its size",
  "自由な点": "A free point", "部位・物体に付ける": "On a part or an object",
  "付ける物": "On", "部位": "Part", "支点の位置 X": "Pivot X", "支点の位置 Y": "Pivot Y", "支点の位置 Z": "Pivot Z",
  "選んだ所に移す": "To the selected", "支点を、選んでいる関節・物体の所に移す": "Move the pivot to the selected joint or object",
  "↺ ずれをなくす": "↺ No offset", "付けた部位・物体の所（物体ならその真ん中）に戻す": "Back onto the part or object (an object: its middle)",
  "カメラを一時的に動かす": "Move the camera for a while", "固定したカメラに戻る": "Back to the locked camera",
  "固定したカメラを記憶したまま、カメラを回して支点の奥行きを確かめる": "Turn the camera to check the pivot's depth; the locked camera is kept",
  "支点の印（ピンクの十字）は画面でドラッグして動かせます（今の奥行きのまま）。印を押すか「3軸ハンドルで動かす」で、3軸ハンドルの矢印でも X・Y・Z の方向に動かせます。奥行きは、カメラを一時的に動かして横から合わせられます。印は書き出す画像には出ません。":
    "Drag the pivot's mark (the pink cross) on the view (it keeps its depth). Press the mark or \"Move with the 3-axis handles\" to move it along X, Y, Z with the handles' arrows. Set the depth by moving the camera for a while and looking from the side. The mark is not in the exported pictures.",
  "3軸ハンドルで動かす": "Move with the 3-axis handles", "支点に3軸ハンドルの移動の矢印を出し、X・Y・Z の方向に動かす": "Show the move arrows on the pivot and move it along X, Y, Z",
  "支点に3軸ハンドルを出しました（矢印で X・Y・Z に動かせます）。ほかの所をクリックすると外れます。": "The 3-axis handles are on the pivot (move it along X, Y, Z with the arrows). Click elsewhere to let go.",
  "人物・図形・小物・ガイド図形・パース定規・床に、同じ強さで掛かります。書き出す画像（アタリ・OpenPose・定規）にも入ります。":
    "Figures, shapes, things, guides, the ruler and the floor all get the same. The exported pictures (rough, OpenPose, ruler) have it too.",
  "支点の位置は、場面の座標（X・Y・Z）です。ほかの物とは一緒に動きません。": "The pivot's place in the scene (X, Y, Z). It does not move with anything.",
  "支点の位置は、その物体の座標（物体の向きに沿った X・Y・Z）です。物体と一緒に動きます。": "The pivot's place in the object's own coordinates (X, Y, Z along its turn). It moves with the object.",
  "支点の位置は、選んだ部位からのずれ（場面の X・Y・Z）です。人物と一緒に動きます。": "An offset from the part (the scene's X, Y, Z). It moves with the figure.",
  "カメラを一時的に動かしています（誇張は止まっています）。": "The camera is moved for a while (the exaggeration rests).",
  "カメラを固定しているので、誇張が効いています。": "The camera is locked, so the exaggeration is on.",
  "カメラを固定しているときだけ効きます（固定と記憶の「カメラを固定」）。": "Works only while the camera is locked (\"Lock the camera\" under Lock and saved cameras).",
  "誇張の支点": "Pivot",
  "固定したカメラを記憶したまま、一時的にカメラを動かせます（誇張は止まります）。「固定したカメラに戻る」で戻ります。":
    "The locked camera is kept; move the camera for now (the exaggeration rests). \"Back to the locked camera\" returns.",
  "固定したカメラに戻りました。": "Back on the locked camera.", "支点を選んだ物体に付けました。": "The pivot is on the selected object.",
  "支点を選んだ関節に付けました。": "The pivot is on the selected joint.", "関節か物体を選んでから押してください。": "Select a joint or an object first.",
  "支点を選んだ所に移しました。": "The pivot moved to the selected."});
})();
