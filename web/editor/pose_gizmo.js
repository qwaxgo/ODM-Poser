// 3軸の操作ハンドル (index.html, loaded after pose_preview.js), like Blender's: on what is selected,
// three arrows (X red, Y green, Z blue) move it along one axis, the square at an arrow's end
// stretches it along that axis, and the ring turns it about the up axis.
//  - ポーズ mode: the selected joint (move only, in world axes). A wrist / ankle reaches there, the
//    hips carry the figure, other joints swing their bone toward it; 関節の限界 applies, and the
//    switch for it sits in the view's top right corner as before.
//  - 配置 mode: the selected object (its own axes: move, stretch its width / height / depth, turn),
//    a thing put down (move, turn, its size), or the ruler's box while the 定規 tab shows.
// The 3軸ハンドル switch (top right of the view) hides them.
(() => {
const $ = id => document.getElementById(id);
const COL = ["#e5484d", "#30a46c", "#3e63dd"], ARROW_PX = 64, RING_PX = 52;
// the switch, among the view's switches
{ const lab = document.createElement("label");
  lab.title = "選んだ関節・物体に、移動・伸縮・回転の3軸ハンドルを出す";
  lab.innerHTML = `<input type="checkbox" id="gizmoOn" checked> 3軸ハンドル`;
  $("viewOpts").insertBefore(lab, $("sidePos").closest("label"));
  try { const v = localStorage.getItem(KEY + "-gizmo"); if (v !== null) $("gizmoOn").checked = v === "1"; } catch (e) {}
  $("gizmoOn").addEventListener("change", e => { try { localStorage.setItem(KEY + "-gizmo", e.target.checked ? "1" : "0"); } catch (err) {}
    draw(); toast(e.target.checked ? "3軸ハンドルを出します。" : "3軸ハンドルを隠しました。"); }); }

const tabOn = id => { const el = $(id), s = el && el.closest("section"); return !!(s && s.classList.contains("active")); };
// what the handles act on: {c: centre, ax: [x, y, z] unit axes, move(d), scale(k, axis), turn(deg), snap()}
function target(){
  if (!$("gizmoOn").checked) return null;
  if (mode === "pose" && sel >= 0){
    const i = sel;
    return {c: S.P[i], ax: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], joint: i,
      save: () => S.P[i].slice(),
      move: (p0, d) => { const t = add(p0, d);
        if (i === IX.pelvis) moveAll(sub(t, S.P[i]), false);
        else if (IK_END[J[i]]) solveIK(i, t);
        else { const p = S.P[PARENT[i]], L = len(sub(S.P[i], p)); rotateSubtree(i, add(p, mul(norm(sub(t, p)), L))); }
        afterEdit(i); }};
  }
  if (mode !== "place") return null;
  const so = S.solids && S.solids[soSel];
  if (so){
    const a = deg(so.yaw || 0);
    const fin = () => { if (typeof snapSolid === "function") snapSolid(so); afterEdit(); if (typeof syncSolids === "function") syncSolids(); };
    return {c: add(so.pos, [0, so.size[1] / 2, 0]), ax: [rotY([1, 0, 0], a), [0, 1, 0], rotY([0, 0, 1], a)],
      save: () => ({pos: so.pos.slice(), size: so.size.slice(), yaw: so.yaw || 0}),
      move: (s0, d) => { so.pos = add(s0.pos, d); fin(); },
      scale: (s0, k, n) => { so.size[n] = Math.max(1, Math.round(s0.size[n] * k)); fin(); },
      turn: (s0, dg) => { so.yaw = Math.round(((s0.yaw + dg) + 540) % 360 - 180); fin(); }};
  }
  const it = S.items && S.items[scSel];
  if (it && it.base && (it.where === "world" || (PROPS_[it.key] || {}).place === "world" || (PROPS_[it.key] || {}).place === "grab")){
    const a = deg(it.yaw || 0);
    return {c: it.base, ax: [rotY([1, 0, 0], a), [0, 1, 0], rotY([0, 0, 1], a)],
      save: () => ({base: it.base.slice(), scale: it.scale || 1, yaw: it.yaw || 0}),
      move: (s0, d) => { it.base = add(s0.base, d); afterEdit(); },
      scale: (s0, k) => { it.scale = Math.max(0.1, s0.scale * k); afterEdit(); },
      turn: (s0, dg) => { it.yaw = ((s0.yaw + dg) + 540) % 360 - 180; afterEdit(); }};
  }
  const r = typeof rulerState === "function" ? rulerState() : null;
  if (r && r.on && r.cube && tabOn("rulerN")){
    const ax = rulerAxes();
    return {c: add(r.pos, [0, r.box[1] / 2, 0]), ax, ruler: true,
      save: () => ({pos: r.pos.slice(), box: r.box.slice(), yaw: r.yaw || 0}),
      move: (s0, d) => { r.pos = add(s0.pos, d); if (typeof syncRuler === "function") syncRuler(); },
      scale: (s0, k, n) => { r.box[n] = Math.max(5, Math.round(s0.box[n] * k)); if (typeof syncRuler === "function") syncRuler(); },
      turn: r.n === 1 ? null : (s0, dg) => { r.yaw = ((s0.yaw + dg) + 540) % 360 - 180; if (typeof syncRuler === "function") syncRuler(); }};
  }
  return null;
}
// on screen: the centre, each arrow's end (L cm long so it is ARROW_PX long), the ring
function layout(t, W, H){
  const dpr = devicePixelRatio || 1, c = project(t.c, W, H), L = ARROW_PX * dpr / Math.max(1e-6, c.s), R = RING_PX * dpr / Math.max(1e-6, c.s);
  const ends = t.ax.map(u => project(add(t.c, mul(u, L)), W, H));
  const ring = [];
  for (let k = 0; k <= 48; k++){ const a = 2 * Math.PI * k / 48; ring.push(project(add(t.c, [R * Math.cos(a), 0, R * Math.sin(a)]), W, H)); }
  return {c, ends, L, ring, dpr};
}
function draw3(ctx, W, H){
  const t = target(); if (!t) return;
  const g = layout(t, W, H), lw = 2 * g.dpr;
  ctx.save(); ctx.lineCap = "round"; ctx.setLineDash([]); ctx.globalAlpha = 0.95;
  if (t.turn){ ctx.strokeStyle = "#f5a524"; ctx.lineWidth = lw; ctx.beginPath();
    g.ring.forEach((q, k) => k ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.stroke(); }
  g.ends.forEach((e, k) => {
    ctx.strokeStyle = ctx.fillStyle = COL[k]; ctx.lineWidth = lw * 1.2;
    ctx.beginPath(); ctx.moveTo(g.c.x, g.c.y); ctx.lineTo(e.x, e.y); ctx.stroke();
    const dx = e.x - g.c.x, dy = e.y - g.c.y, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, h = 9 * g.dpr;
    if (t.scale){ ctx.fillRect(e.x - h / 2, e.y - h / 2, h, h); }
    else { ctx.beginPath(); ctx.moveTo(e.x + ux * h, e.y + uy * h); ctx.lineTo(e.x - uy * h * 0.5, e.y + ux * h * 0.5);
      ctx.lineTo(e.x + uy * h * 0.5, e.y - ux * h * 0.5); ctx.closePath(); ctx.fill(); }
    ctx.font = `${Math.round(11 * g.dpr)}px sans-serif`; ctx.fillText("XYZ"[k], e.x + ux * h * 1.6 - 4 * g.dpr, e.y + uy * h * 1.6 + 4 * g.dpr);
  });
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#333"; ctx.lineWidth = g.dpr;
  ctx.beginPath(); ctx.arc(g.c.x, g.c.y, 3.5 * g.dpr, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
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
  let hit = null;
  g.ends.forEach((e, k) => {
    if (t.scale && Math.hypot(x - e.x, y - e.y) < near * 1.2) hit = hit || {k, scale: true};
  });
  if (!hit) g.ends.forEach((e, k) => { if (!hit && segDist(x, y, g.c, e) < near && Math.hypot(x - g.c.x, y - g.c.y) > 5 * g.dpr) hit = {k}; });
  if (!hit && t.turn) for (let k = 1; k < g.ring.length; k++) if (segDist(x, y, g.ring[k - 1], g.ring[k]) < near){ hit = {turn: true}; break; }
  if (!hit) return null;
  const s0 = t.save(), x0 = x, y0 = y;
  if (hit.turn){
    // the sign: which way a small turn goes round on screen
    const a0 = Math.atan2(y - g.c.y, x - g.c.x), p1 = project(add(t.c, [g.L, 0, 0]), W, H), p2 = project(add(t.c, rotY([g.L, 0, 0], 0.1)), W, H);
    const sgn = Math.sign((p1.x - g.c.x) * (p2.y - g.c.y) - (p1.y - g.c.y) * (p2.x - g.c.x)) || 1;
    return {move(mx, my){ let d = Math.atan2(my - g.c.y, mx - g.c.x) - a0; d = Math.atan2(Math.sin(d), Math.cos(d));
      t.turn(s0, sgn * d * 180 / Math.PI); }};
  }
  const e = g.ends[hit.k], vx = e.x - g.c.x, vy = e.y - g.c.y, v2 = vx * vx + vy * vy || 1;
  return {move(mx, my){
    const f = ((mx - x0) * vx + (my - y0) * vy) / v2;            // in arrow lengths
    if (hit.scale) t.scale(s0, Math.max(0.05, 1 + f), hit.k);
    else t.move(s0, mul(t.ax[hit.k], f * g.L));
  }};
});

if (window.ODMPoserI18n) window.ODMPoserI18n.add({"3軸ハンドル": "3-axis handles",
  "選んだ関節・物体に、移動・伸縮・回転の3軸ハンドルを出す": "Show move / stretch / turn handles on the selected joint or object",
  "3軸ハンドルを出します。": "Showing the 3-axis handles.", "3軸ハンドルを隠しました。": "The 3-axis handles are hidden."});
draw();
})();
