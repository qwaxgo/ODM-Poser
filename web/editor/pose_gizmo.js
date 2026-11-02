// 3軸の操作ハンドル (index.html, loaded after pose_preview.js), like Blender's: one tool at a time,
// chosen with 移動 / 回転 / 変形 (on the view under the modes, in the joint's and the objects'
// sections, or the keys G / R / S):
//  - 移動: three arrows (X red, Y green, Z blue) move it along one axis.
//  - 回転: rings turn it about an axis. A joint swings its bone about the joint before it (the hips:
//    the whole figure), as dragging the joint does; objects, things and the ruler turn about up.
//  - 変形: squares stretch it. An object: its width / height / depth; a joint: its bone's length
//    (along the bone) and its circle's thickness, as in 体格 mode (左右対称 follows).
// ポーズ mode: the selected joint (関節の限界 applies). 配置 mode: the selected object, a thing put
// down, or the ruler's box while the 定規 tab shows. The 3軸ハンドル switch hides them.
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
let tool = "move";
try { const v = localStorage.getItem(KEY + "-gizmotool"); if (TOOLS.some(t => t[0] === v)) tool = v; } catch (e) {}
const bars = [];
function bar(cls){
  const d = document.createElement("div");
  d.className = "gz-tools " + cls; d.setAttribute("role", "group"); d.setAttribute("aria-label", "3軸ハンドルの操作"); d.dataset.ui = "skip";
  for (const [id, name, icon, key] of TOOLS){
    const b = document.createElement("button"); b.type = "button"; b.dataset.gz = id; b.title = `${name}（${key}キー）`;
    b.dataset.gzicon = icon; b.innerHTML = `<span>${name}</span>`;
    b.addEventListener("click", () => setTool(id, true));
    d.appendChild(b);
  }
  bars.push(d); return d;
}
// the icons (ui-icons.js loads after this file)
function icons(){ if (!window.ODMICONS) return;
  for (const d of bars) d.querySelectorAll("button[data-gzicon]").forEach(b => { if (!b.querySelector("svg")) b.insertAdjacentHTML("afterbegin", ODMICONS.svg(b.dataset.gzicon)); }); }
addEventListener("DOMContentLoaded", icons);
function syncBars(){
  icons();
  const on = $("gizmoOn").checked;
  for (const d of bars){ d.classList.toggle("off", !on);
    d.querySelectorAll("button").forEach(b => { const me = b.dataset.gz === tool; b.classList.toggle("on", me); b.setAttribute("aria-pressed", String(me)); }); }
}
function setTool(id, tell){
  tool = id; try { localStorage.setItem(KEY + "-gizmotool", id); } catch (e) {}
  if (!$("gizmoOn").checked){ $("gizmoOn").checked = true; $("gizmoOn").dispatchEvent(new Event("change")); }
  syncBars(); draw();
  if (tell) toast(`3軸ハンドル：${TOOLS.find(t => t[0] === id)[1]}`);
}
// on the view, under the modes; in the joint's section (ポーズ) and the objects' (設置)
{ const ov = document.createElement("div"); ov.className = "ov-body ov-row"; ov.id = "ovGizmo"; ov.appendChild(bar("gz-ov"));
  $("modes").after(ov);
  const h = $("selName") && $("selName").closest("h2"); if (h) h.after(bar("gz-panel"));
  const so = $("soKind") && $("soKind").closest("section"); if (so){ const h2 = so.querySelector("h2"); (h2 ? h2.after.bind(h2) : so.prepend.bind(so))(bar("gz-panel")); }
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
function target(){
  if (!$("gizmoOn").checked) return null;
  if (mode === "pose" && sel >= 0){
    const i = sel, par = PARENT[i], root = i === IX.pelvis || par === undefined || par < 0;
    const pivot = root ? S.P[i] : S.P[par], u = root ? UP : norm(sub(S.P[i], S.P[par])), [e1] = across(u);
    const mirror = () => $("sym") && $("sym").checked && MIRROR[i] !== i ? [i, MIRROR[i]] : [i];
    return {c: S.P[i], ax: WORLD, joint: i, pivot, rings: [0, 1, 2],
      sc: root ? [[e1, 1, "太さ"]] : [[u, 0, "長さ"], [e1, 1, "太さ"]],
      save: () => ({P: S.P.map(p => p.slice()), R: S.R.slice(), body: Object.assign({}, S.body)}),
      move: (s0, d) => { const t = add(s0.P[i], d);
        if (i === IX.pelvis) moveAll(sub(t, S.P[i]), false);
        else if (IK_END[J[i]]) solveIK(i, t);
        else { const p = S.P[par], L = len(sub(S.P[i], p)); rotateSubtree(i, add(p, mul(norm(sub(t, p)), L))); }
        afterEdit(i); },
      turn: (s0, k, dg) => { S.P = s0.P.map(p => p.slice());
        const pv = root ? s0.P[i] : s0.P[par], who = root ? S.P.map((p, n) => n) : subtree(i);
        for (const n of who) S.P[n] = add(pv, rotAxis(sub(s0.P[n], pv), WORLD[k], deg(dg)));
        // the hips: the body's turn goes with it, so the joints' angles and limits keep to the body
        if (root && typeof turnBody === "function"){ S.body = Object.assign({}, s0.body); turnBody(WORLD[k], deg(dg)); }
        afterEdit(i); },
      scale: (s0, f, n) => { S.P = s0.P.map(p => p.slice()); S.R = s0.R.slice();
        for (const j of mirror()){
          if (n === 0){ const v = sub(s0.P[j], s0.P[PARENT[j]]); moveSubtree(j, mul(v, Math.max(0.2, Math.min(4, f)) - 1)); }
          else S.R[j] = Math.max(0.5, s0.R[j] * f);
        }
        afterEdit(i); }};
  }
  if (mode !== "place") return null;
  const so = S.solids && S.solids[soSel];
  if (so){
    const a = deg(so.yaw || 0), ax = [rotY([1, 0, 0], a), [0, 1, 0], rotY([0, 0, 1], a)];
    const fin = () => { if (typeof snapSolid === "function") snapSolid(so); afterEdit(); if (typeof syncSolids === "function") syncSolids(); };
    const c = add(so.pos, [0, so.size[1] / 2, 0]);
    return {c, ax, pivot: c, rings: [1], sc: ax.map((u, n) => [u, n, "XYZ"[n]]),
      save: () => ({pos: so.pos.slice(), size: so.size.slice(), yaw: so.yaw || 0}),
      move: (s0, d) => { so.pos = add(s0.pos, d); fin(); },
      scale: (s0, f, n) => { so.size[n] = Math.max(1, Math.round(s0.size[n] * f)); fin(); },
      turn: (s0, k, dg) => { so.yaw = Math.round(((s0.yaw + dg) + 540) % 360 - 180); fin(); }};
  }
  const it = S.items && S.items[scSel];
  if (it && it.base && (it.where === "world" || (PROPS_[it.key] || {}).place === "world" || (PROPS_[it.key] || {}).place === "grab")){
    const a = deg(it.yaw || 0), ax = [rotY([1, 0, 0], a), [0, 1, 0], rotY([0, 0, 1], a)];
    return {c: it.base, ax, pivot: it.base, rings: [1], sc: [[ax[0], 0, "大きさ"]],
      save: () => ({base: it.base.slice(), scale: it.scale || 1, yaw: it.yaw || 0}),
      move: (s0, d) => { it.base = add(s0.base, d); if (typeof snapItem === "function") snapItem(it); afterEdit(); },
      scale: (s0, f) => { it.scale = Math.max(0.1, s0.scale * f); afterEdit(); },
      turn: (s0, k, dg) => { it.yaw = ((s0.yaw + dg) + 540) % 360 - 180; afterEdit(); }};
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
    const e = h.e; ctx.strokeStyle = ctx.fillStyle = h.col; ctx.lineWidth = lw * 1.2;
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
  const vx = hit.e.x - g.c.x, vy = hit.e.y - g.c.y, v2 = vx * vx + vy * vy || 1;
  return {move(mx, my){
    const f = ((mx - x0) * vx + (my - y0) * vy) / v2;            // in handle lengths
    if (tool === "scale") t.scale(s0, Math.max(0.05, 1 + f), hit.n);
    else t.move(s0, mul(hit.u, f * g.L));
  }};
});

// i18n.js loads after this file: the table waits for it (ODMPoserI18nEarly)
(window.ODMPoserI18n || {add: t => (window.ODMPoserI18nEarly = window.ODMPoserI18nEarly || []).push(t)}).add({"3軸ハンドル": "3-axis handles",
  "選んだ関節・物体に、移動・回転・変形の3軸ハンドルを出す": "Show move / rotate / scale handles on the selected joint or object",
  "3軸ハンドルを出します。": "Showing the 3-axis handles.", "3軸ハンドルを隠しました。": "The 3-axis handles are hidden.",
  "移動": "Move", "回転": "Rotate", "変形": "Scale", "移動（Gキー）": "Move (G)", "回転（Rキー）": "Rotate (R)", "変形（Sキー）": "Scale (S)",
  "3軸ハンドルの操作": "3-axis handle tool", "3軸ハンドル：移動": "3-axis handles: move", "3軸ハンドル：回転": "3-axis handles: rotate",
  "3軸ハンドル：変形": "3-axis handles: scale", "長さ": "Length", "太さ": "Thickness", "大きさ": "Size"});
draw();
})();
