// 3軸の操作ハンドル (index.html, loaded after pose_preview.js), like Blender's: one tool at a time,
// chosen with 移動 / 回転 / 変形 (on the view under the modes, in the joint's and the objects'
// sections, or the keys G / R / S). Each mode has its own tools; the others are greyed out and the
// tool switches to one the mode has. The arrows (移動) keep to the scene's X, Y, Z wherever the thing is;
// the rings (回転) and squares (変形) keep to its own axes: a joint's (Y along its bone), an object's (as
// it is turned). Several objects at once: the scene's axes.
//  - ポーズ: 回転 turns what hangs on the selected joint about it (the elbow: the forearm; the hips:
//    the whole figure; a hand, a toe or the head, having nothing after them: their own bone about
//    the joint before). 移動 only for the arms and legs (elbow, wrist, knee, ankle ...: they reach).
//  - 体格: 変形 only. A shoulder or a thigh root: the width, height and how far forward along the
//    torso's axes; another joint: its bone's length (along the bone) and its circle's thickness
//    (an arm's or a leg's circles together, unless 太さを部位ごとに連動 is off; 左右対称 follows).
//  - 配置: an object, a thing put down, the ruler's box (while the 定規 tab shows), or the figure by
//    its hips: 移動, 回転 about up, 変形 (its width / height / depth; not the figure).
// While the handles show (3軸ハンドル / 解除 in the menu on the left), dragging a joint or a thing only
// selects it. 支点: the move handles move the selected object's pivot (pose_objects.js); several objects
// selected move together and turn together about up.
(() => {
const $ = id => document.getElementById(id);
const COL = ["#e5484d", "#30a46c", "#3e63dd"], ARROW_PX = 64, RING_PX = 52;
// the switch, among the view's switches
{ const lab = document.createElement("label");
  lab.className = "ov-item"; lab.dataset.icon = "axes";
  lab.title = "選んだ関節・物体に、移動・回転・変形の3軸ハンドルを出す";
  lab.innerHTML = `<input type="checkbox" id="gizmoOn" checked><span>3軸ハンドル</span>`;
  // the menu on the left (3軸ハンドル / 解除) turns them on and off; the switch keeps the state, unseen
  lab.hidden = true;
  $("viewOpts").insertBefore(lab, $("ovSide"));
  try { const v = localStorage.getItem(KEY + "-gizmo"); if (v !== null) $("gizmoOn").checked = v === "1"; } catch (e) {}
  $("gizmoOn").addEventListener("change", e => { try { localStorage.setItem(KEY + "-gizmo", e.target.checked ? "1" : "0"); } catch (err) {}
    syncBars(); draw(); toast(e.target.checked ? "3軸ハンドルを出します。" : "3軸ハンドルを隠しました。"); }); }

// the tool: 移動 / 回転 / 変形 (kept in this browser)
const TOOLS = [["move", "移動", "Move1", "G"], ["rotate", "回転", "rotate", "R"], ["scale", "変形", "FrameSize", "S"]];
let pref = "move", tool = "move";          // the tool chosen; the tool in use (one the mode has)
try { const v = localStorage.getItem(KEY + "-gizmotool"); if (TOOLS.some(t => t[0] === v)) pref = tool = v; } catch (e) {}
gizmoHolds = () => $("gizmoOn").checked && mode !== "persp";
const bars = [];
// the handles on or off (the switch in the views' corner, the 3軸ハンドル button and 解除)
function setOn(on){ const c = $("gizmoOn"); if (c.checked === on) return; c.checked = on; c.dispatchEvent(new Event("change")); }
let pivEdit = false;                          // 支点 on: the move handles move the pivot
const OBJ = () => window.ODMObj || null;      // pose_objects.js: the objects' selection and pivots
function setPiv(on){
  const o = OBJ(); if (on && !(mode === "place" && o && (o.key() || ghostNow()))){ toast("配置モードで物体を1つ選ぶと、支点を動かせます。", true); return; }
  pivEdit = on; if (on) setOn(true); barKey = ""; syncBars(); draw();
  toast(on ? "支点を動かします（移動ハンドル）。もう一度押すと戻ります。" : "支点の移動を終えました。");
}
let gzDrag = -1, gzRing = -1;                 // the axis / the ring being dragged (drawn heavier; the others fade)
// the handles' size for the screen: a phone half again as big as at first, a tablet 1.5 times, a large
// screen 1.75 times (a finger needs room, a large view needs them to show)
function gzScale(){
  const short = Math.min(innerWidth, innerHeight);
  return short <= 520 ? 1.35 : short >= 900 ? 1.75 : 1.5;
}
function bar(cls){
  const d = document.createElement("div");
  d.className = "gz-tools " + cls; d.setAttribute("role", "group"); d.setAttribute("aria-label", "3軸ハンドルの操作"); d.dataset.ui = "skip";
  // off: one button turns the handles on (and shows the tools); on: the tools and 解除 (off again)
  const on = document.createElement("button"); on.type = "button"; on.className = "gz-on"; on.dataset.gzicon = "axes";
  on.title = "3軸ハンドルを出す"; on.innerHTML = "<span>3軸ハンドル</span>"; on.addEventListener("click", () => setOn(true));
  const off = document.createElement("button"); off.type = "button"; off.className = "gz-off"; off.title = "3軸ハンドルを隠す";
  off.innerHTML = "<span>解除</span>"; off.addEventListener("click", () => setOn(false));
  d.append(on);
  for (const [id, name, icon, key] of TOOLS){
    const b = document.createElement("button"); b.type = "button"; b.dataset.gz = id; b.title = `${name}（${key}キー）`;
    b.dataset.gzicon = icon; b.innerHTML = `<span>${name}</span>`;
    b.addEventListener("click", () => setTool(id, true));
    d.appendChild(b);
  }
  // 支点: while on, 移動 moves the selected object's pivot (what it turns about), not the object
  const pv = document.createElement("button"); pv.type = "button"; pv.className = "gz-piv"; pv.dataset.gzicon = "pivot";
  pv.title = "支点（回転の中心）を移動ハンドルで動かす"; pv.innerHTML = "<span>支点</span>"; pv.setAttribute("aria-pressed", "false");
  pv.addEventListener("click", () => setPiv(!pivEdit));
  d.appendChild(pv);
  d.appendChild(off);
  bars.push(d); return d;
}
// the icons (ui-icons.js loads after this file)
function icons(){ if (!window.ODMICONS) return;
  for (const d of bars) d.querySelectorAll("button[data-gzicon]").forEach(b => { if (!b.querySelector("svg")) b.insertAdjacentHTML("afterbegin", ODMICONS.svg(b.dataset.gzicon)); }); }
addEventListener("DOMContentLoaded", icons);
// the tools the mode (and what is selected) has
const LIMB = new Set(["elbow", "wrist", "hand", "knee", "ankle", "toe"].flatMap(n => ["r_" + n, "l_" + n]));
function tools(){
  if (mode === "pose") return sel >= 0 && LIMB.has(J[sel]) ? ["move", "rotate"] : ["rotate"];
  if (mode === "body") return ["scale"];
  if (mode === "place" && pivEdit) return ["move"];
  if (mode === "place"){ const t = target(true); return t ? TOOLS.map(x => x[0]).filter(id => !t.lacks || !t.lacks.includes(id)) : ["move", "rotate", "scale"]; }
  return [];
}
let barKey = "";
function syncBars(){
  icons();
  const on = $("gizmoOn").checked, can = tools();
  tool = can.includes(pref) ? pref : can[0] || pref;
  // 支点 ends with 配置 or with nothing (or several things) selected
  if (pivEdit && !(mode === "place" && OBJ() && (OBJ().key() || ghostNow()))) pivEdit = false;
  const k = [on, tool, can.join(), pivEdit, mode === "place"].join("|"); if (k === barKey) return; barKey = k;
  for (const d of bars){ d.classList.toggle("off", !on);
    d.querySelectorAll("button[data-gz]").forEach(b => { const me = b.dataset.gz === tool && can.includes(tool);
      b.disabled = !can.includes(b.dataset.gz); b.classList.toggle("on", me); b.setAttribute("aria-pressed", String(me)); });
    const pv = d.querySelector(".gz-piv"); if (pv){ pv.classList.toggle("on", pivEdit); pv.setAttribute("aria-pressed", String(pivEdit));
      pv.disabled = mode !== "place"; } }
}
function setTool(id, tell){
  if (!tools().includes(id)){ if (tell) toast(`${modeName()}では「${TOOLS.find(t => t[0] === id)[1]}」は使えません。`, true); return; }
  pref = id; try { localStorage.setItem(KEY + "-gizmotool", id); } catch (e) {}
  if (!$("gizmoOn").checked){ $("gizmoOn").checked = true; $("gizmoOn").dispatchEvent(new Event("change")); }
  syncBars(); draw();
  if (tell) toast(`3軸ハンドル：${TOOLS.find(t => t[0] === id)[1]}`);
}
// the tool to show when the handles are on (the hips clicked, pose_objects.js); they are not turned on
window.ODMGizmo = {prefer(id){ pref = id; try { localStorage.setItem(KEY + "-gizmotool", id); } catch (e) {} syncBars(); draw(); }};
const modeName = () => ({pose: "ポーズ", body: "体格", persp: "カメラ", place: "配置"})[mode] || mode;
// on the view, under the modes; in the joint's section (ポーズ) and the objects' (設置)
{ const ov = document.createElement("div"); ov.className = "ov-body ov-row"; ov.id = "ovGizmo"; ov.appendChild(bar("gz-ov"));
  $("modes").after(ov);
  // the handles' menu is on the left (here) only; the copies in the panel's sections are gone
  syncBars(); }
// G / R / S as in Blender (not while typing)
document.addEventListener("keydown", e => {
  if (e.ctrlKey || e.metaKey || e.altKey || (e.target && e.target.closest && e.target.closest("input, select, textarea, [contenteditable]"))) return;
  const t = TOOLS.find(t => t[3] === e.key.toUpperCase()); if (!t) return;
  e.preventDefault(); setTool(t[0], true);
});

const tabOn = id => { const el = $(id), s = el && el.closest("section"); return !!(s && s.classList.contains("active")); };
const UP = [0, 1, 0], WORLD = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
// two directions across u (for a ring about u, and the joint's thickness)
function across(u){ const r = Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], a = norm(cross(r, u)); return [a, norm(cross(u, a))]; }
// what the handles act on: {c: centre, ax: the move axes, rings: [axis index], pivot, sc: [[u, n, label]],
//  save(), move(s0, d), turn(s0, k, degrees), scale(s0, factor, n)}
function target(any){
  if (!$("gizmoOn").checked && !any) return null;
  const save = () => ({P: S.P.map(p => p.slice()), R: S.R.slice(), body: Object.assign({}, S.body), twist: (S.twist || []).slice(),
    fwd: headFrame().fwd});
  if (mode === "pose" && sel >= 0){
    // 回転: what hangs on the joint turns about it; a joint with nothing after it, its own bone
    const i = sel, par = PARENT[i], root = i === IX.pelvis || par === undefined || par < 0, own = !root && !KIDS[i].length;
    // the rings keep to the joint's own axes (jointFrame: Y along its bone); the arrows to the scene's X, Y, Z.
    // The green ring (Y) of every joint but the hips twists along its bone (ねじり in the joint panel: a
    // hand's is its wrist's, the forearm), so it turns about the axis it shows (the head turns left and
    // right where it is); the head's rings show round the head
    const tj = root ? -1 : twistJoint(i), fr = jointFrame(i), twists = tj >= 0;
    const pivot = i === IX.head ? S.P[i] : own ? S.P[par] : S.P[i];
    return {c: S.P[i], ax: WORLD, joint: i, pivot, rings: [0, 1, 2], ringAx: fr, sc: [], save,
      move: (s0, d) => { const t = add(s0.P[i], d);
        if (IK_END[J[i]]) solveIK(i, t);
        else { const p = S.P[par], L = len(sub(S.P[i], p)); rotateSubtree(i, add(p, mul(norm(sub(t, p)), L))); }
        afterEdit(i); },
      turn: (s0, k, dg) => { S.P = s0.P.map(p => p.slice());
        if (twists && k === 1){ S.twist = s0.twist.slice(); setTwist(tj, (s0.twist[tj] || 0) + dg); afterEdit(i); return; }
        const pv = own ? s0.P[par] : s0.P[i], who = root ? S.P.map((p, n) => n) : own ? subtree(i) : subtree(i).slice(1);
        for (const n of who) S.P[n] = add(pv, rotAxis(sub(s0.P[n], pv), fr[k], deg(dg)));
        // the hips: the body's turn goes with it, so the joints' angles and limits keep to the body
        if (root && typeof turnBody === "function"){ S.body = Object.assign({}, s0.body); turnBody(fr[k], deg(dg)); }
        // the neck or the head (or a joint below them) turned: the face turns as much (the turn about the
        // neck moves no joint; it is the neck's twist, or the head's when the head itself is turned)
        else if (who.includes(IX.head) || i === IX.head) faceTurn(s0, i === IX.head ? IX.head : IX.neck, fr[k], deg(dg));
        afterEdit(root || own ? i : KIDS[i][0]); }};
  }
  if (mode === "body" && sel > 0){
    const i = sel, par = PARENT[i], u = norm(sub(S.P[i], S.P[par])), [e1] = across(u);
    const mirror = () => $("sym") && $("sym").checked && MIRROR[i] !== i ? [i, MIRROR[i]] : [i];
    if (TORSO_PAIR[J[i]]){
      const ax = torsoAxes(i), out = J[i].startsWith("l_") ? 1 : -1;
      return {c: S.P[i], ax: WORLD, pivot: S.P[i], rings: [], pair: true,
        sc: [[mul(ax[0], out), 0, "幅"], [ax[1], 1, "高さ"], [ax[2], 2, "前後"]], save,
        scale: (s0, f, n, d) => { S.P = s0.P.map(p => p.slice()); fromBottom(() => movePair(i, n, d, $("sym").checked)); afterEdit(i); }};
    }
    return {c: S.P[i], ax: WORLD, joint: i, pivot: S.P[i], rings: [], sc: [[u, 0, "長さ"], [e1, 1, "太さ"]], save,
      scale: (s0, f, n) => { S.P = s0.P.map(p => p.slice()); S.R = s0.R.slice();
        fromBottom(() => { for (const j of mirror()){
          if (n === 0){ const v = sub(s0.P[j], s0.P[PARENT[j]]); moveSubtree(j, mul(v, Math.max(0.2, Math.min(4, f)) - 1)); }
          else for (const q of thickJoints(j, false)) S.R[q] = Math.max(0.5, s0.R[q] * f);
        } });
        afterEdit(i); }};
  }
  if (mode !== "place") return null;
  const O = OBJ(), group = O ? O.group() : [];
  // several selected (a box, or Ctrl+click; figures too): moved together, and turned together as one on
  // all three axes about the pivot of the one that leads (the last one clicked; Ctrl+Shift+click
  // changes it; a figure's is its hips)
  if (group.length > 1){
    const figs = group.filter(k => O.isFig(k)), objs = group.filter(k => !O.isFig(k));
    const ref = k => k[0] === "s" ? S.solids[+k.slice(1)] : S.items[+k.slice(1)];
    const at = k => { const r = ref(k); return k[0] === "s" ? r.pos : r.base; };
    const ang = k => { const r = ref(k), t = r.rot || [0, 0, 0];
      return k[0] === "s" ? [r.yaw || 0, r.pitch || 0, r.roll || 0] : [(r.yaw || 0) + (t[1] || 0), t[0] || 0, t[2] || 0]; };
    const c = O.pivWorld(O.lead() || group[0]);
    return {c, ax: WORLD, pivot: c, rings: [0, 1, 2], sc: [], lacks: ["scale"],
      save: () => Object.assign(objs.map(k => ({k, at: at(k).slice(), ang: ang(k)})), {figs: figs.map(k => ({k, s: O.figSave(k)}))}),
      move: (s0, d) => { for (const e of s0){ const r = ref(e.k), p = add(e.at, d);
          if (e.k[0] === "s"){ r.pos = p; if (r.ground && typeof groundSolid === "function") groundSolid(r); }
          else { r.base = p; if (d[1]) r.grounded = false; else if (r.grounded) groundItem(r); } }
        for (const e of s0.figs) O.figMove(e.k, e.s, d);
        afterEdit(); if (typeof syncSolids === "function") syncSolids(); },
      turn: (s0, k, dg) => { for (const e of s0){ const r = ref(e.k), p = add(c, rotAxis(sub(e.at, c), WORLD[k], deg(dg)));
          const [a, pp, rr] = O.worldTurn(e.ang, k, dg);
          if (e.k[0] === "s" && r.guide) r.pos = e.at.slice();      // a guide keeps to the ruler: it stays when the group turns
          else if (e.k[0] === "s"){ r.pos = p; r.yaw = a; r.pitch = pp; r.roll = rr; }
          else { r.base = p; r.yaw = a; r.rot = [pp, 0, rr]; r.grounded = false; } }
        for (const e of s0.figs) O.figTurn(e.k, e.s, c, WORLD[k], deg(dg));
        afterEdit(); if (typeof syncSolids === "function") syncSolids(); }};
  }
  // 配置: the figure by its hips (moved along with its pins and wire; turned about up)
  if (mode === "place" && sel === IX.pelvis){
    const c = S.P[IX.pelvis];
    return {c, ax: WORLD, pivot: c, rings: [1], sc: [], lacks: ["scale"],
      save: () => Object.assign(save(), {pins: JSON.parse(JSON.stringify(S.pins || {})), anchor: S.wire && S.wire.anchor ? S.wire.anchor.slice() : null}),
      move: (s0, d) => { const m = sub(add(s0.P[IX.pelvis], d), S.P[IX.pelvis]); moveAll(m, false);
        for (const k of Object.keys(S.pins || {})) S.pins[k] = add(S.pins[k], m);
        if (S.wire && S.wire.anchor) S.wire.anchor = add(S.wire.anchor, m);
        afterEdit(IX.pelvis); },
      turn: (s0, k, dg) => { S.P = s0.P.map(p => p.slice()); S.body = Object.assign({}, s0.body); S.pins = JSON.parse(JSON.stringify(s0.pins));
        if (S.wire && s0.anchor) S.wire.anchor = s0.anchor.slice();
        placeFigure([0, 0, 0], dg); afterEdit(IX.pelvis); }};
  }
  // 支点: the move handles move the selected object's pivot, the object stays
  const pk = O ? O.key() || (ghostNow() ? ghostNow().key : "") : "";
  if (pivEdit && pk){
    const c = O.pivWorld(pk);
    return {c, ax: WORLD, pivot: c, rings: [], sc: [], lacks: ["rotate", "scale"], piv: true,
      save: () => ({p: c.slice()}),
      move: (s0, d) => { O.setPivAbs(pk, add(s0.p, d)); if (pk[0] !== "g") afterEdit(); }};
  }
  // what the handles act on: a selected solid or thing, else (nothing selected, the 設置 tab's preview
  // showing) the one about to be put (its ghost: moved, turned, stretched, its pivot moved before 置く)
  const so = S.solids && S.solids[soSel];
  if (so) return solidTarget(so, "s" + soSel, O, false);
  const it = S.items && S.items[scSel];
  if (it && it.base && (it.where === "world" || (PROPS_[it.key] || {}).place === "world" || (PROPS_[it.key] || {}).place === "grab"))
    return itemTarget(it, "i" + scSel, O, false);
  const G = ghostNow();
  if (G) return G.key === "gs" ? solidTarget(G.o, "gs", O, true) : itemTarget(G.o, "gi", O, true);
  return null;
}
// a joint's own axes [x, y, z]: y along its bone (the hips: the body's), z toward the body's front across
// the bone, turned by the bone's twist, x across both
function jointFrame(i){
  if (i === IX.pelvis || PARENT[i] < 0) return [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map(v => norm(bodyRot(v)));
  const tj = twistJoint(i), b = sub(S.P[tj], S.P[PARENT[tj]]);
  if (len(b) < 1e-6) return WORLD;
  const u = norm(b);
  let f = bodyRot([0, 0, 1]); f = sub(f, mul(u, dot(f, u)));
  if (len(f) < 1e-3){ f = bodyRot([0, 1, 0]); f = sub(f, mul(u, dot(f, u))); }
  f = rotAxis(norm(f), u, deg(S.twist[tj] || 0));
  return [norm(cross(u, f)), u, f];
}
// the face (headFrame, pose_main.js) turned by ang about axis from where it looked (s0.fwd): the twist of
// joint j makes up what the joints' new places do not
function faceTurn(s0, j, axis, ang){
  S.twist = s0.twist.slice();
  const h = headFrame(), want = rotAxis(s0.fwd, axis, ang);
  const w = sub(want, mul(h.up, dot(want, h.up))); if (len(w) < 1e-4) return;
  const d = Math.atan2(dot(cross(h.fwd, norm(w)), h.up), dot(h.fwd, norm(w))) * 180 / Math.PI;
  const v = ((S.twist[j] || 0) + d + 540) % 360 - 180;
  S.twist[j] = typeof clampTwist === "function" ? clampTwist(j, v) : v;
}
// the ghost of 設置 (pose_place.js) when nothing is selected: {key: "gs" | "gi", o}
function ghostNow(){
  const O = OBJ(); if (mode !== "place" || !window.ODMGhost || (O && O.selected().length) || sel === IX.pelvis) return null;
  return ODMGhost();
}
function solidTarget(so, key, O, ghost){
  const done = () => { if (!ghost){ afterEdit(); if (typeof syncSolids === "function") syncSolids(); } };
  // a guide shape of the perspective ruler: its handles go along its own edges (toward the vanishing
  // points); 変形 lengthens only the side pulled (the other side stays), on all three edges. Turned
  // about the world's X, Y, Z through its pivot, it turns the ruler with it (and the other guides)
  if (so.guide && typeof rulerAxes === "function"){
    const R = turnOf(so), ax = [R(X3), R(Y3), R(Z3)], c = solidMid(so);
    return {c, ax, pivot: O ? O.pivWorld(key) : c, rings: [0, 1, 2], ringAx: ax, sc: ax.map((u, n) => [u, n, "XYZ"[n]]),
      save: () => ({pos: so.pos.slice(), size: so.size.slice(), yaw: so.yaw || 0, pitch: so.pitch || 0, roll: so.roll || 0, q: guideQuarter(so)}),
      move: (s0, d) => { so.pos = add(s0.pos, d); snapGuideGrid(so); done(); },
      scale: (s0, f, n, d) => { const v = Math.max(1, Math.round(s0.size[n] + d));
        so.size[n] = v; so.pos = n === 1 ? s0.pos.slice() : add(s0.pos, mul(ax[n], (v - s0.size[n]) / 2)); done(); },
      turn: (s0, k, dg) => { so.pos = s0.pos.slice(); so.yaw = s0.yaw; so.pitch = s0.pitch; so.roll = s0.roll;
        const set = () => { const t = O.axisTurn([s0.yaw, s0.pitch, s0.roll], ax[k], dg); so.yaw = t[0]; so.pitch = t[1]; so.roll = t[2]; };
        O.keepPivot(key, set);
        rulerFromGuide(so, s0.q);
        O.keepPivot(key, () => guideToRuler(so, s0.q));          // as the ruler allows (1点: its direction is the camera's; the grid: quarter turns)
        if (!ghost) alignGuides(); done(); }};
  }
  const fin = () => { if (typeof snapSolid === "function") snapSolid(so, true); done(); };
  const c = solidMid(so), own = O ? O.axesOf(key) : WORLD;
  // moved along the scene's X, Y, Z; turned about its own axes through its pivot (支点; the middle unless
  // moved) and stretched along them (its width, height, depth)
  return {c, ax: WORLD, pivot: O ? O.pivWorld(key) : c, rings: [0, 1, 2], ringAx: own, sc: own.map((u, n) => [u, n, "XYZ"[n]]),
    save: () => ({pos: so.pos.slice(), size: so.size.slice(), yaw: so.yaw || 0, pitch: so.pitch || 0, roll: so.roll || 0}),
    move: (s0, d) => { so.pos = add(s0.pos, d); fin(); },
    scale: (s0, f, n) => { so.size[n] = Math.max(1, Math.round(s0.size[n] * f)); fin(); },
    turn: (s0, k, dg) => { so.pos = s0.pos.slice(); so.yaw = s0.yaw; so.pitch = s0.pitch; so.roll = s0.roll;
      const set = () => { if (!O){ so.yaw = s0.yaw + (k === 1 ? dg : 0); return; }
        const [a, p, r] = O.axisTurn([s0.yaw, s0.pitch, s0.roll], own[k], dg); so.yaw = a; so.pitch = p; so.roll = r;
        // upright, turned about up: near the ruler's direction it sticks
        if (k === 1 && !s0.pitch && !s0.roll && typeof magnetYaw === "function") so.yaw = magnetYaw(so.yaw); };
      if (O) O.keepPivot(key, set); else set(); fin(); }};
}
function itemTarget(it, key, O, ghost){
  const done = () => { if (!ghost) afterEdit(); };
  const a = deg(it.yaw || 0), f0 = frameOf(it);
  // stretched along its own axes (as turned), each on its own
  const own = [0, 1, 2].map(n => { const e = [0, 0, 0]; e[n] = 1; const v = dirToWorld(f0, it, e); return len(v) > 1e-6 ? norm(v) : rotY(WORLD[n], a); });
  // moved along the scene's X, Y, Z; turned about its own axes through its pivot (kept as yaw and its own
  // turn, it.rot) and stretched along them
  const ra = O ? O.axesOf(key) : own;
  return {c: it.base, ax: WORLD, pivot: O ? O.pivWorld(key) : it.base, rings: [0, 1, 2], ringAx: ra, sc: own.map((u, n) => [u, n, "XYZ"[n]]),
    save: () => ({base: it.base.slice(), st: (stretchOf(it) || [1, 1, 1]).slice(), yaw: it.yaw || 0, rot: (it.rot || [0, 0, 0]).slice()}),
    move: (s0, d) => { it.base = add(s0.base, d); if (typeof snapItem === "function") snapItem(it); done(); },
    scale: (s0, f, n) => { foldStretch(it)[n] = Math.max(0.05, Math.round(s0.st[n] * f * 100) / 100); done(); },
    turn: (s0, k, dg) => { const w = v => ((v + 540) % 360) - 180;
      it.base = s0.base.slice(); it.yaw = s0.yaw; it.rot = s0.rot.slice();
      const set = () => { if (!O){ if (k === 1) it.yaw = w(s0.yaw + dg); return; }
        const [ya, p, r] = O.axisTurn([s0.yaw + (s0.rot[1] || 0), s0.rot[0] || 0, s0.rot[2] || 0], ra[k], dg); it.yaw = ya; it.rot = [p, 0, r];
        if (k === 1 && !s0.rot[0] && !s0.rot[2] && typeof magnetYaw === "function") it.yaw = magnetYaw(it.yaw); };
      if (O) O.keepPivot(key, set); else set();
      if (it.grounded) groundItem(it); done(); }};
}
// on screen, for the tool chosen: the handles as lines (from the centre to an end), rings as
// point lists; L: the handle's length in cm (ARROW_PX on screen)
function layout(t, W, H){
  syncBars();
  const dpr = devicePixelRatio || 1, k = gzScale(), c = project(t.c, W, H), L = ARROW_PX * k * dpr / Math.max(1e-6, c.s);
  const out = {c, L, dpr, lines: [], rings: []};
  if (tool === "move") t.ax.forEach((u, k) => out.lines.push({k, u, n: k, col: COL[k], label: "XYZ"[k], e: project(add(t.c, mul(u, L)), W, H)}));
  else if (tool === "scale") t.sc.forEach(([u, n, label], k) => out.lines.push({k, u, n, col: t.joint !== undefined ? (n ? "#f5a524" : "#8e4ec6") : COL[k], label,
    e: project(add(t.c, mul(u, L)), W, H)}));
  else {
    const pc = project(t.pivot, W, H), R = RING_PX * k * dpr / Math.max(1e-6, pc.s);
    out.pc = pc;
    for (const k of t.rings){
      const [a, b] = across(t.ringAx ? t.ringAx[k] : WORLD[k]), pts = [];
      for (let m = 0; m <= 64; m++){ const q = 2 * Math.PI * m / 64; pts.push(project(add(t.pivot, add(mul(a, R * Math.cos(q)), mul(b, R * Math.sin(q)))), W, H)); }
      out.rings.push({k, pts, a, b, R, u: t.ringAx ? t.ringAx[k] : WORLD[k]});
    }
  }
  return out;
}
function draw3(ctx, W, H){
  const t = target(); if (!t) return;
  const sk = gzScale(), g = layout(t, W, H), lw = 2 * g.dpr * Math.sqrt(sk);
  // while one is held, the others fade (the one held is drawn heavier)
  const holding = gzDrag >= 0 || gzRing >= 0, FADE = 0.2;
  ctx.save(); ctx.lineCap = "round"; ctx.setLineDash([]); ctx.globalAlpha = 0.95;
  ctx.font = `${Math.round(11 * g.dpr * Math.sqrt(sk))}px sans-serif`;
  for (const r of g.rings){
    ctx.globalAlpha = holding && gzRing !== r.k ? FADE : 0.95;
    ctx.strokeStyle = COL[r.k]; ctx.lineWidth = lw * (gzRing === r.k ? 3 : 1.2); ctx.beginPath();
    r.pts.forEach((q, m) => m ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.stroke();
  }
  for (const h of g.lines){
    ctx.globalAlpha = holding && gzDrag !== h.k ? FADE : 0.95;
    const e = h.e; ctx.strokeStyle = ctx.fillStyle = h.col; ctx.lineWidth = lw * (gzDrag === h.k ? 3.4 : 1.2);
    ctx.beginPath(); ctx.moveTo(g.c.x, g.c.y); ctx.lineTo(e.x, e.y); ctx.stroke();
    const dx = e.x - g.c.x, dy = e.y - g.c.y, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, s = 9 * g.dpr * sk;
    if (tool === "scale") ctx.fillRect(e.x - s / 2, e.y - s / 2, s, s);
    else { ctx.beginPath(); ctx.moveTo(e.x + ux * s, e.y + uy * s); ctx.lineTo(e.x - uy * s * 0.5, e.y + ux * s * 0.5);
      ctx.lineTo(e.x + uy * s * 0.5, e.y - ux * s * 0.5); ctx.closePath(); ctx.fill(); }
    ctx.fillText(h.label, e.x + ux * s * 1.6 - 4 * g.dpr, e.y + uy * s * 1.6 + 4 * g.dpr);
  }
  const mid = g.pc || g.c;
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#333"; ctx.lineWidth = g.dpr;
  ctx.beginPath(); ctx.arc(mid.x, mid.y, 3.5 * g.dpr, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
  ctx.restore();
}
{ const atari0 = drawAtari;
  drawAtari = function(ctx, W, H, opts = {}){ atari0(ctx, W, H, opts); if (!opts.export && ctx.canvas === front) draw3(ctx, W, H); };
}
const segDist = (x, y, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / l2)); return Math.hypot(x - a.x - dx * t, y - a.y - dy * t); };
// a press on a handle starts its drag (before the joints and objects under it)
DOWN_HOOKS.unshift((cv, x, y) => {
  if (cv !== front) return null;
  const t = target(); if (!t) return null;
  const W = cv.width, H = cv.height, g = layout(t, W, H), near = 9 * g.dpr * gzScale() * (typeof pointerScale === "function" ? pointerScale() : 1);
  const s0 = t.save(), x0 = x, y0 = y;
  // a ring: the drag along the ring's direction on screen where it was taken turns it. The ring nearest
  // to the press is taken (rings cross and, along an axis, lie on each other: then the green one, a
  // joint's twist along its bone)
  let hitR = null, hitM = 0, hd = near;
  for (const r of g.rings) for (let m = 1; m < r.pts.length; m++){
    const dd = segDist(x, y, r.pts[m - 1], r.pts[m]) - (r.k === 1 ? 1.5 * g.dpr : 0);
    if (dd < hd){ hd = dd; hitR = r; hitM = m; }
  }
  if (hitR){
    { const r = hitR, m = hitM;
      const tx = (r.pts[m].x - r.pts[m - 1].x) / (2 * Math.PI / 64), ty = (r.pts[m].y - r.pts[m - 1].y) / (2 * Math.PI / 64);
      const t2 = Math.max(tx * tx + ty * ty, (24 * g.dpr) ** 2);     // a ring seen edge-on does not spin wildly
      // which way the ring's own angle turns the thing about its axis (a, b, axis: right-handed or not)
      const sgn = Math.sign(dot(cross(r.a, r.b), r.u)) || 1;
      gzRing = r.k; draw();
      addEventListener("pointerup", () => { gzRing = -1; draw(); }, {once: true});
      addEventListener("pointercancel", () => { gzRing = -1; draw(); }, {once: true});
      return {move(mx, my){ t.turn(s0, r.k, sgn * ((mx - x0) * tx + (my - y0) * ty) / t2 * 180 / Math.PI); }};
    }
  }
  let hit = null;
  for (const h of g.lines){
    if (tool === "scale" ? Math.hypot(x - h.e.x, y - h.e.y) < near * 1.2 || segDist(x, y, g.c, h.e) < near * 0.6
        : segDist(x, y, g.c, h.e) < near && Math.hypot(x - g.c.x, y - g.c.y) > 5 * g.dpr){ hit = h; break; }
  }
  if (!hit) return null;
  // the axis taken is drawn heavier until the press is let go; the drag moves along that axis only
  gzDrag = hit.k; draw();
  addEventListener("pointerup", () => { gzDrag = -1; draw(); }, {once: true});
  addEventListener("pointercancel", () => { gzDrag = -1; draw(); }, {once: true});
  const vx = hit.e.x - g.c.x, vy = hit.e.y - g.c.y, v2 = vx * vx + vy * vy || 1;
  return {move(mx, my){
    const f = ((mx - x0) * vx + (my - y0) * vy) / v2;            // in handle lengths
    if (tool === "scale") t.scale(s0, Math.max(0.05, 1 + f), hit.n, f * g.L);
    else t.move(s0, mul(hit.u, f * g.L));
  }};
});

// i18n.js loads after this file: the table waits for it (ODMPoserI18nEarly)
(window.ODMPoserI18n || {add: t => (window.ODMPoserI18nEarly = window.ODMPoserI18nEarly || []).push(t)}).add({"3軸ハンドル": "3-axis handles",
  "選んだ関節・物体に、移動・回転・変形の3軸ハンドルを出す": "Show move / rotate / scale handles on the selected joint or object",
  "3軸ハンドルを出します。": "Showing the 3-axis handles.", "3軸ハンドルを隠しました。": "The 3-axis handles are hidden.",
  "移動": "Move", "回転": "Rotate", "変形": "Scale", "移動（Gキー）": "Move (G)", "回転（Rキー）": "Rotate (R)", "変形（Sキー）": "Scale (S)",
  "3軸ハンドルの操作": "3-axis handle tool", "3軸ハンドル：移動": "3-axis handles: move", "3軸ハンドル：回転": "3-axis handles: rotate",
  "3軸ハンドル：変形": "3-axis handles: scale", "長さ": "Length", "太さ": "Thickness", "大きさ": "Size", "幅": "Width", "高さ": "Height", "前後": "Front / back",
  "解除": "Off", "3軸ハンドルを隠す": "Hide the 3-axis handles", "3軸ハンドルを出す": "Show the 3-axis handles",
  "支点": "Pivot", "支点（回転の中心）を移動ハンドルで動かす": "Move the pivot (what it turns about) with the move handles",
  "配置モードで物体を1つ選ぶと、支点を動かせます。": "Select one object in Place mode to move its pivot.",
  "支点を動かします（移動ハンドル）。もう一度押すと戻ります。": "Moving the pivot (move handles). Press again to go back.",
  "支点の移動を終えました。": "Done moving the pivot."});
draw();
})();
