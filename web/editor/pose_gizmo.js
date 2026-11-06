// 3軸の操作ハンドル (index.html, loaded after pose_preview.js), like Blender's: one tool at a time,
// chosen with 移動 / 回転 / 変形 (on the view under the modes, in the joint's and the objects'
// sections, or the keys G / R / S). Each mode has its own tools; the others are greyed out and the
// tool switches to one the mode has:
//  - ポーズ: 回転 turns what hangs on the selected joint about it (the elbow: the forearm; the hips:
//    the whole figure; a hand, a toe or the head, having nothing after them: their own bone about
//    the joint before). 移動 only for the arms and legs (elbow, wrist, knee, ankle ...: they reach).
//  - 体格: 変形 only. A shoulder or a thigh root: the width, height and how far forward along the
//    torso's axes; another joint: its bone's length (along the bone) and its circle's thickness
//    (an arm's or a leg's circles together, unless 太さを部位ごとに連動 is off; 左右対称 follows).
//  - 配置: an object, a thing put down, the ruler's box (while the 定規 tab shows), or the figure by
//    its hips: 移動, 回転 about up, 変形 (its width / height / depth; not the figure).
// While the handles show (the 3軸ハンドル switch), dragging a joint or a thing only selects it.
(() => {
const $ = id => document.getElementById(id);
const COL = ["#e5484d", "#30a46c", "#3e63dd"], ARROW_PX = 64, RING_PX = 52;
// the switch, among the view's switches
{ const lab = document.createElement("label");
  lab.className = "ov-item"; lab.dataset.icon = "axes";
  lab.title = "選んだ関節・物体に、移動・回転・変形の3軸ハンドルを出す";
  lab.innerHTML = `<input type="checkbox" id="gizmoOn" checked><span>3軸ハンドル</span>`;
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
let gzDrag = -1;                              // the axis being dragged (drawn heavier)
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
  if (mode === "place"){ const t = target(true); return t ? TOOLS.map(x => x[0]).filter(id => !t.lacks || !t.lacks.includes(id)) : ["move", "rotate", "scale"]; }
  return [];
}
let barKey = "";
function syncBars(){
  icons();
  const on = $("gizmoOn").checked, can = tools();
  tool = can.includes(pref) ? pref : can[0] || pref;
  const k = [on, tool, can.join()].join("|"); if (k === barKey) return; barKey = k;
  for (const d of bars){ d.classList.toggle("off", !on);
    d.querySelectorAll("button[data-gz]").forEach(b => { const me = b.dataset.gz === tool && can.includes(tool);
      b.disabled = !can.includes(b.dataset.gz); b.classList.toggle("on", me); b.setAttribute("aria-pressed", String(me)); }); }
}
function setTool(id, tell){
  if (!tools().includes(id)){ if (tell) toast(`${modeName()}では「${TOOLS.find(t => t[0] === id)[1]}」は使えません。`, true); return; }
  pref = id; try { localStorage.setItem(KEY + "-gizmotool", id); } catch (e) {}
  if (!$("gizmoOn").checked){ $("gizmoOn").checked = true; $("gizmoOn").dispatchEvent(new Event("change")); }
  syncBars(); draw();
  if (tell) toast(`3軸ハンドル：${TOOLS.find(t => t[0] === id)[1]}`);
}
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
  const save = () => ({P: S.P.map(p => p.slice()), R: S.R.slice(), body: Object.assign({}, S.body)});
  if (mode === "pose" && sel >= 0){
    // 回転: what hangs on the joint turns about it; a joint with nothing after it, its own bone
    const i = sel, par = PARENT[i], root = i === IX.pelvis || par === undefined || par < 0, own = !root && !KIDS[i].length;
    const pivot = own ? S.P[par] : S.P[i];
    return {c: S.P[i], ax: WORLD, joint: i, pivot, rings: [0, 1, 2], sc: [], save,
      move: (s0, d) => { const t = add(s0.P[i], d);
        if (IK_END[J[i]]) solveIK(i, t);
        else { const p = S.P[par], L = len(sub(S.P[i], p)); rotateSubtree(i, add(p, mul(norm(sub(t, p)), L))); }
        afterEdit(i); },
      turn: (s0, k, dg) => { S.P = s0.P.map(p => p.slice());
        const pv = own ? s0.P[par] : s0.P[i], who = root ? S.P.map((p, n) => n) : own ? subtree(i) : subtree(i).slice(1);
        for (const n of who) S.P[n] = add(pv, rotAxis(sub(s0.P[n], pv), WORLD[k], deg(dg)));
        // the hips: the body's turn goes with it, so the joints' angles and limits keep to the body
        if (root && typeof turnBody === "function"){ S.body = Object.assign({}, s0.body); turnBody(WORLD[k], deg(dg)); }
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
  if (mode !== "place") return null;
  const so = S.solids && S.solids[soSel];
  if (so){
    const a = deg(so.yaw || 0), ax = [rotY([1, 0, 0], a), [0, 1, 0], rotY([0, 0, 1], a)];
    const fin = () => { if (typeof snapSolid === "function") snapSolid(so); afterEdit(); if (typeof syncSolids === "function") syncSolids(); };
    const c = add(so.pos, [0, so.size[1] / 2, 0]);
    // turned on all three: the ring about up its yaw, those about x and z its pitch and roll
    const wrap = v => Math.round(((v + 540) % 360) - 180);
    return {c, ax, pivot: c, rings: [0, 1, 2], sc: ax.map((u, n) => [u, n, "XYZ"[n]]),
      save: () => ({pos: so.pos.slice(), size: so.size.slice(), yaw: so.yaw || 0, pitch: so.pitch || 0, roll: so.roll || 0}),
      move: (s0, d) => { so.pos = add(s0.pos, d); fin(); },
      scale: (s0, f, n) => { so.size[n] = Math.max(1, Math.round(s0.size[n] * f)); fin(); },
      turn: (s0, k, dg) => { if (k === 1) so.yaw = wrap(s0.yaw + dg); else if (k === 0) so.pitch = wrap(s0.pitch + dg); else so.roll = wrap(s0.roll + dg); fin(); }};
  }
  const it = S.items && S.items[scSel];
  if (it && it.base && (it.where === "world" || (PROPS_[it.key] || {}).place === "world" || (PROPS_[it.key] || {}).place === "grab")){
    const a = deg(it.yaw || 0), ax = [rotY([1, 0, 0], a), [0, 1, 0], rotY([0, 0, 1], a)], f0 = frameOf(it);
    // stretched along its own axes (as turned), each on its own
    const own = [0, 1, 2].map(n => { const e = [0, 0, 0]; e[n] = 1; const v = dirToWorld(f0, it, e); return len(v) > 1e-6 ? norm(v) : ax[n]; });
    // turned on all three, as when held: about up its yaw, about x and z its own turn (it.rot)
    return {c: it.base, ax, pivot: it.base, rings: [0, 1, 2], sc: own.map((u, n) => [u, n, "XYZ"[n]]),
      save: () => ({base: it.base.slice(), st: (stretchOf(it) || [1, 1, 1]).slice(), yaw: it.yaw || 0, rot: (it.rot || [0, 0, 0]).slice()}),
      move: (s0, d) => { it.base = add(s0.base, d); if (typeof snapItem === "function") snapItem(it); afterEdit(); },
      scale: (s0, f, n) => { foldStretch(it)[n] = Math.max(0.05, Math.round(s0.st[n] * f * 100) / 100); afterEdit(); },
      turn: (s0, k, dg) => { const w = v => ((v + 540) % 360) - 180;
        if (k === 1) it.yaw = w(s0.yaw + dg); else { it.rot = s0.rot.slice(); it.rot[k] = Math.round(w(s0.rot[k] + dg)); }
        if (it.grounded) groundItem(it); afterEdit(); }};
  }
  const r = typeof rulerState === "function" ? rulerState() : null;
  if (r && r.on && r.cube && tabOn("rulerN")){
    const ax = rulerAxes(), c = add(r.pos, [0, r.box[1] / 2, 0]), sync = () => { if (typeof syncRuler === "function") syncRuler(); };
    return {c, ax, pivot: c, rings: r.n === 1 ? [] : [1], sc: ax.map((u, n) => [u, n, "XYZ"[n]]), ruler: true,
      save: () => ({pos: r.pos.slice(), box: r.box.slice(), yaw: r.yaw || 0}),
      move: (s0, d) => { r.pos = add(s0.pos, d); sync(); },
      scale: (s0, f, n) => { r.box[n] = Math.max(5, Math.round(s0.box[n] * f)); sync(); },
      turn: (s0, k, dg) => { r.yaw = ((s0.yaw + dg) + 540) % 360 - 180; sync(); }};
  }
  return null;
}
// on screen, for the tool chosen: the handles as lines (from the centre to an end), rings as
// point lists; L: the handle's length in cm (ARROW_PX on screen)
function layout(t, W, H){
  syncBars();
  const dpr = devicePixelRatio || 1, c = project(t.c, W, H), L = ARROW_PX * dpr / Math.max(1e-6, c.s);
  const out = {c, L, dpr, lines: [], rings: []};
  if (tool === "move") t.ax.forEach((u, k) => out.lines.push({k, u, n: k, col: COL[k], label: "XYZ"[k], e: project(add(t.c, mul(u, L)), W, H)}));
  else if (tool === "scale") t.sc.forEach(([u, n, label], k) => out.lines.push({k, u, n, col: t.joint !== undefined ? (n ? "#f5a524" : "#8e4ec6") : COL[n], label,
    e: project(add(t.c, mul(u, L)), W, H)}));
  else {
    const pc = project(t.pivot, W, H), R = RING_PX * dpr / Math.max(1e-6, pc.s);
    out.pc = pc;
    for (const k of t.rings){
      const [a, b] = across(WORLD[k]), pts = [];
      for (let m = 0; m <= 64; m++){ const q = 2 * Math.PI * m / 64; pts.push(project(add(t.pivot, add(mul(a, R * Math.cos(q)), mul(b, R * Math.sin(q)))), W, H)); }
      out.rings.push({k, pts, a, b, R});
    }
  }
  return out;
}
function draw3(ctx, W, H){
  const t = target(); if (!t) return;
  const g = layout(t, W, H), lw = 2 * g.dpr;
  ctx.save(); ctx.lineCap = "round"; ctx.setLineDash([]); ctx.globalAlpha = 0.95;
  ctx.font = `${Math.round(11 * g.dpr)}px sans-serif`;
  for (const r of g.rings){
    ctx.strokeStyle = COL[r.k]; ctx.lineWidth = lw * 1.2; ctx.beginPath();
    r.pts.forEach((q, m) => m ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.stroke();
  }
  for (const h of g.lines){
    const e = h.e; ctx.strokeStyle = ctx.fillStyle = h.col; ctx.lineWidth = lw * (gzDrag === h.k ? 3.4 : 1.2);
    ctx.beginPath(); ctx.moveTo(g.c.x, g.c.y); ctx.lineTo(e.x, e.y); ctx.stroke();
    const dx = e.x - g.c.x, dy = e.y - g.c.y, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, s = 9 * g.dpr;
    if (tool === "scale") ctx.fillRect(e.x - s / 2, e.y - s / 2, s, s);
    else { ctx.beginPath(); ctx.moveTo(e.x + ux * s, e.y + uy * s); ctx.lineTo(e.x - uy * s * 0.5, e.y + ux * s * 0.5);
      ctx.lineTo(e.x + uy * s * 0.5, e.y - ux * s * 0.5); ctx.closePath(); ctx.fill(); }
    ctx.fillText(h.label, e.x + ux * s * 1.6 - 4 * g.dpr, e.y + uy * s * 1.6 + 4 * g.dpr);
  }
  const mid = g.pc || g.c;
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
  const W = cv.width, H = cv.height, g = layout(t, W, H), near = 9 * g.dpr * (typeof pointerScale === "function" ? pointerScale() : 1);
  const s0 = t.save(), x0 = x, y0 = y;
  // a ring: the drag along the ring's direction on screen where it was taken turns it
  for (const r of g.rings){
    for (let m = 1; m < r.pts.length; m++){
      if (segDist(x, y, r.pts[m - 1], r.pts[m]) >= near) continue;
      const tx = (r.pts[m].x - r.pts[m - 1].x) / (2 * Math.PI / 64), ty = (r.pts[m].y - r.pts[m - 1].y) / (2 * Math.PI / 64);
      const t2 = Math.max(tx * tx + ty * ty, (24 * g.dpr) ** 2);     // a ring seen edge-on does not spin wildly
      // which way the ring's own angle turns the thing about its axis (a, b, axis: right-handed or not)
      const sgn = Math.sign(dot(cross(r.a, r.b), WORLD[r.k])) || 1;
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
  "3軸ハンドル：変形": "3-axis handles: scale", "長さ": "Length", "太さ": "Thickness", "大きさ": "Size", "幅": "Width", "高さ": "Height", "前後": "Front / back"});
draw();
})();
