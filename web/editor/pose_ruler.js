// The perspective ruler (パース定規) and the box guide (index.html, loaded after pose_solids.js).
// The vanishing points come from the editor's camera, so the ruler always has the same
// perspective as the figure. The ruler stands level on the floor, so its eye level is the
// floor's; the modes differ in which lines are drawn:
//   1点透視: the ruler faces the camera; depth lines meet at one point on the eye level.
//   2点透視: the ruler is turned by S.ruler.yaw (world); left-right and depth lines meet at two
//            points on the eye level.
//   3点透視: as 2点, and the verticals meet at a third point.
// A camera looking down or up really makes verticals meet (the figure and the box are drawn so);
// for a strict 1- or 2-point picture the camera height is 0°, and the panel says so.
// Handles: in the 配置 mode the camera stays and a vanishing point turns the ruler, the box guide
// is dragged like a solid; in the パース mode a vanishing point or the eye level moves the camera.
// Shown in the editor only; "定規の画像" saves it as a transparent PNG at the export size.
//
// S.ruler: {on, n: 1 | 2 | 3, yaw (degrees, world), lines, cube (the box guide shown),
//           box: [w, h, d] cm, pos: [x, y, z] (the middle of the box's base)}
const RULER_COLORS = ["#e0605a", "#55b86a", "#4c9be8"];       // left-right, vertical, depth
const HORIZON_COLOR = "#e8a33c";
const RULER_DEFAULT = fresh().ruler;
function rulerState(){                        // S.ruler itself (handles keep it), with defaults filled in
  const r = S.ruler = S.ruler || {};
  if (r.size && !r.box) r.box = [r.size, r.size, r.size];                 // the first version's cube
  for (const [k, v] of Object.entries(RULER_DEFAULT)) if (r[k] === undefined) r[k] = Array.isArray(v) ? v.slice() : v;
  return r;
}
const rulerYaw = () => { const r = rulerState(); return r.n === 1 ? S.cam.yaw : r.yaw; };

// the ruler's own axes in world space: [left-right, up, depth]
function rulerAxes(){
  const Y = [0, 1, 0], a = deg(rulerYaw());
  return [rotAxis([1, 0, 0], Y, a), Y, rotAxis([0, 0, 1], Y, a)];
}
// where lines along the world direction a meet on screen: {x, y}, or {dx, dy} when they stay parallel
function vanish(a, W, H){
  const q = camRot(a), f = lensF(W, H);
  if (Math.abs(q[2]) > 1e-6){
    const x = W/2 - f*q[0]/q[2], y = H/2 + f*q[1]/q[2];
    if (Math.hypot(x - W/2, y - H/2) < 60 * Math.max(W, H)) return {x, y};
  }
  const l = Math.hypot(q[0], q[1]) || 1;
  return {dx: q[0]/l, dy: -q[1]/l};
}
// the eye level: the screen line where the ruler's horizontal planes vanish
function horizonLine(up, W, H){
  const n = camRot(up), f = lensF(W, H), cx = W/2, cy = H/2;
  // a pixel's ray ((x-cx)/f, -(y-cy)/f, -1) is perpendicular to n
  if (Math.abs(n[1]) >= Math.abs(n[0])){
    if (Math.abs(n[1]) < 1e-9) return null;
    const y = x => cy + (n[0]*(x - cx) - n[2]*f) / n[1];
    return [0, y(0), W, y(W)];
  }
  const x = y => cx + (n[1]*(y - cy) + n[2]*f) / n[0];
  return [x(0), 0, x(H), H];
}
// the lines toward one vanishing point, spread evenly over the picture
function fan(ctx, v, W, H, n){
  const cx = W/2, cy = H/2, diag = Math.hypot(W, H), far = diag * 4;
  const line = (x, y, dx, dy) => { ctx.moveTo(x - dx*far, y - dy*far); ctx.lineTo(x + dx*far, y + dy*far); };
  const finite = v.x !== undefined;
  ctx.beginPath();
  if (finite && Math.hypot(v.x - cx, v.y - cy) < diag * 0.5){          // a point in the picture: a star
    for (let k = 0; k < n; k++){ const a = Math.PI * k / n; line(v.x, v.y, Math.cos(a), Math.sin(a)); }
  } else {                                                             // far away: evenly across the picture
    let ux = v.dx, uy = v.dy;
    if (finite){ const l = Math.hypot(v.x - cx, v.y - cy); ux = (v.x - cx) / l; uy = (v.y - cy) / l; }
    const px = -uy, py = ux, span = diag * 0.75;
    for (let k = 0; k <= n; k++){
      const s = -span + 2 * span * k / n, ax = cx + px*s, ay = cy + py*s;
      if (finite){ const dx = v.x - ax, dy = v.y - ay, l = Math.hypot(dx, dy) || 1; line(ax, ay, dx/l, dy/l); }
      else line(ax, ay, ux, uy);
    }
  }
  ctx.stroke();
}
const rulerFamilies = () => { const n = rulerState().n; return n === 1 ? [2] : n === 2 ? [0, 2] : [0, 1, 2]; };
const guideSolid = () => { const r = rulerState(); return {kind: "box", pos: r.pos, size: r.box, yaw: rulerYaw()}; };
function boxCorners(ax){
  const r = rulerState(), [w, h, d] = r.box, out = [];
  for (const sx of [-1, 1]) for (const sy of [0, 1]) for (const sz of [-1, 1])
    out.push(add(add(add(r.pos, mul(ax[0], sx*w/2)), mul(ax[1], sy*h)), mul(ax[2], sz*d/2)));
  return out;                                    // index = sx*4 + sy*2 + sz (0 = minus, 1 = plus)
}
function drawRuler(ctx, W, H, opts = {}){
  const r = rulerState();
  if (!r.on && !opts.force) return;
  const ax = rulerAxes(), lw = Math.max(1, W / 900);
  ctx.save(); ctx.lineCap = "round";
  const vps = [];
  for (const k of rulerFamilies()){
    const v = vanish(ax[k], W, H);
    ctx.strokeStyle = RULER_COLORS[k]; ctx.globalAlpha = opts.export ? 0.6 : 0.35; ctx.lineWidth = lw;
    fan(ctx, v, W, H, r.lines);
    if (v.x !== undefined) vps.push([v, k]);
  }
  ctx.globalAlpha = 1;
  const hz = horizonLine(ax[1], W, H);
  if (hz){
    ctx.strokeStyle = HORIZON_COLOR; ctx.lineWidth = lw * 2;
    ctx.beginPath(); ctx.moveTo(hz[0], hz[1]); ctx.lineTo(hz[2], hz[3]); ctx.stroke();
    const y0 = hz[1], y1 = hz[3];
    if (Math.abs(hz[2] - W) < 1e-6 && Math.min(y0, y1) > -H && Math.max(y0, y1) < 2 * H){
      const yl = y0 + (y1 - y0) * 0.02;
      if (yl > 12 && yl < H - 4){
        ctx.fillStyle = HORIZON_COLOR; ctx.font = `${Math.round(Math.max(11, W / 70))}px sans-serif`;
        ctx.fillText("アイレベル", 6, yl - 5);
      }
    }
  }
  const handle = !opts.export && (mode === "place" || mode === "persp");
  for (const [v, k] of vps){
    if (v.x < -20 || v.x > W + 20 || v.y < -20 || v.y > H + 20) continue;
    const rad = Math.max(5, W / 120) * (handle ? 1.6 : 1);
    ctx.strokeStyle = RULER_COLORS[k]; ctx.lineWidth = lw * 2;
    ctx.beginPath(); ctx.arc(v.x, v.y, rad, 0, 2 * Math.PI); ctx.stroke();
    if (handle){ ctx.fillStyle = RULER_COLORS[k]; ctx.globalAlpha = 0.35; ctx.fill(); ctx.globalAlpha = 1; }
  }
  if (r.cube){
    const C = boxCorners(ax), D = camDist(W, H);
    const P = C.map(p => project(p, W, H)), ok = C.map(p => toCam(p)[2] < D - 1);
    ctx.lineWidth = lw * 2.2;
    for (let i = 0; i < 8; i++) for (const [bit, k] of [[4, 0], [2, 1], [1, 2]]){
      if (i & bit) continue;
      const j = i | bit;
      if (!ok[i] || !ok[j]) continue;
      ctx.strokeStyle = RULER_COLORS[k];
      ctx.beginPath(); ctx.moveTo(P[i].x, P[i].y); ctx.lineTo(P[j].x, P[j].y); ctx.stroke();
    }
  }
  ctx.restore();
}
// under the figure (and the solids) in the editor's front view
{ const atari0 = drawAtari;
  drawAtari = function(ctx, W, H, opts = {}){
    if (!opts.export && ctx.canvas === front) drawRuler(ctx, W, H);
    atari0(ctx, W, H, opts);
  };
}

// ---- handles ------------------------------------------------------------------------------------
const wrap180 = a => ((a % 360) + 540) % 360 - 180;
// the camera turned (yaw, pitch) so that the vanishing point of family k lands on (x, y):
// damped Gauss-Newton on the two angles, with numeric derivatives
function cameraToVanish(k, x, y, W, H){
  const c = S.cam, err = () => { const v = vanish(rulerAxes()[k], W, H); return v.x === undefined ? null : [v.x - x, v.y - y]; };
  for (let it = 0; it < 15; it++){
    const e0 = err(); if (!e0 || Math.hypot(e0[0], e0[1]) < 0.5) break;
    const Jc = [];
    for (const key of ["yaw", "pitch"]){
      const v0 = c[key]; c[key] = v0 + 0.05; const e1 = err(); c[key] = v0;
      Jc.push(e1 ? [(e1[0] - e0[0]) / 0.05, (e1[1] - e0[1]) / 0.05] : [0, 0]);
    }
    const [a, b] = Jc, A11 = a[0]*a[0] + a[1]*a[1], A22 = b[0]*b[0] + b[1]*b[1], A12 = a[0]*b[0] + a[1]*b[1];
    const lam = 0.01 * (A11 + A22) / 2 + 1e-9, B11 = A11 + lam, B22 = A22 + lam, det = B11 * B22 - A12 * A12;
    if (!(Math.abs(det) > 1e-12)) break;
    const g1 = a[0]*e0[0] + a[1]*e0[1], g2 = b[0]*e0[0] + b[1]*e0[1];
    const dy = Math.max(-10, Math.min(10, -(B22*g1 - A12*g2) / det)), dp = Math.max(-10, Math.min(10, -(B11*g2 - A12*g1) / det));
    c.yaw = wrap180(c.yaw + dy); c.pitch = Math.max(-80, Math.min(80, c.pitch + dp));
  }
}
// the camera's height (pitch) so that the eye level passes through (x, y)
function cameraToHorizon(x, y, W, H){
  const c = S.cam, at = () => { const h = horizonLine(rulerAxes()[1], W, H); if (!h) return null;
    return h[0] === 0 && h[2] === W ? h[1] + (h[3] - h[1]) * x / W - y : null; };
  for (let it = 0; it < 12; it++){
    const e0 = at(); if (e0 === null || Math.abs(e0) < 0.5) break;
    const p0 = c.pitch; c.pitch = p0 + 0.05; const e1 = at(); c.pitch = p0;
    if (e1 === null || Math.abs(e1 - e0) < 1e-9) break;
    c.pitch = Math.max(-80, Math.min(80, p0 - Math.max(-10, Math.min(10, e0 * 0.05 / (e1 - e0)))));
  }
}
DOWN_HOOKS.unshift((cv, x, y) => {
  const r = rulerState();
  if (!r.on || cv !== front || (mode !== "place" && mode !== "persp")) return null;
  const W = cv.width, H = cv.height, reach = 16 * pointerScale() * (devicePixelRatio || 1), ax = rulerAxes();
  let hit = -1;
  for (const k of rulerFamilies()){ const v = vanish(ax[k], W, H);
    if (v.x !== undefined && Math.hypot(v.x - x, v.y - y) < reach) hit = k; }
  if (hit < 0 && mode === "persp"){                    // the eye level line
    const h = horizonLine(ax[1], W, H);
    if (h && h[0] === 0 && h[2] === W && Math.abs(h[1] + (h[3] - h[1]) * x / W - y) < reach * 0.6)
      return {move(mx, my){ cameraToHorizon(mx, my, W, H); syncUI(); }};
    return null;
  }
  if (hit < 0) return null;
  if (mode === "persp") return {move(mx, my){ cameraToVanish(hit, mx, my, W, H); syncUI(); }};
  if (hit === 1 || r.n === 1){
    say(hit === 1 ? "縦の消失点はカメラの高さで決まります。パースモードでつかむとカメラが動きます。"
                  : "1点透視の消失点は、パースモードでつかむとカメラが動きます。", true);
    return {move(){}};
  }
  // 配置: the camera stays; the ruler turns so that its vanishing point follows the mouse on the eye level
  return {move(mx, my){
    const d = pixelRay(mx, my, W, H).dir;
    if (Math.hypot(d[0], d[2]) < 1e-6) return;
    const a = hit === 2 ? Math.atan2(d[0], d[2]) : Math.atan2(-d[2], d[0]);
    let yaw = a * 180 / Math.PI;
    if (Math.abs(wrap180(yaw + 180 - r.yaw)) < Math.abs(wrap180(yaw - r.yaw))) yaw += 180;   // the nearer of the two
    r.yaw = Math.round(wrap180(yaw) * 10) / 10; syncRuler();
  }};
});
DOWN_HOOKS.push((cv, x, y) => {                        // the box guide, after the solids
  const r = rulerState();
  if (!r.on || !r.cube || mode !== "place" || cv !== front || pick(cv, x, y) >= 0) return null;
  const ray = pixelRay(x, y, cv.width, cv.height), t = rayHit(solidMesh(guideSolid()), ray);
  if (t === null) return null;
  return dragFrom(add(ray.o, mul(ray.dir, t)), cv.width, cv.height, dlt => { r.pos = add(r.pos, dlt); syncRuler(); });
});
WHEEL_HOOKS.push((x, y, step, e) => {
  const r = rulerState();
  if (!r.on || !r.cube || mode !== "place" || r.n === 1) return false;
  if (rayHit(solidMesh(guideSolid()), pixelRay(x, y, front.width, front.height)) === null) return false;
  remember(); r.yaw = wrap180(r.yaw + step * (e.shiftKey ? 15 : 5)); syncRuler(); return true;
});

// ---- the panel ------------------------------------------------------------------------------------
const RULER_HINTS = {
  1: "奥行きの線がアイレベル上の1点に集まります（カメラの正面に向けた定規）。",
  2: "左右と奥行きの線がアイレベル上の2点に集まります。",
  3: "縦の線も3つ目の点に集まります（カメラの高さが0°のときは平行）。"};
const RULER_TILT = "カメラが俯瞰・あおりなので、縦の線は実際にはわずかに集まります（人物と直方体はそのとおりに描かれます）。厳密な1点・2点透視にするには、カメラの高さを0°にします。";
const BOX_CTL = [["boxW", "box", 0], ["boxH", "box", 1], ["boxD", "box", 2], ["boxX", "pos", 0], ["boxY", "pos", 1], ["boxZ", "pos", 2]];
function syncRuler(){
  const r = rulerState();
  $("rulerOn").checked = !!r.on; $("rulerCtl").style.display = r.on ? "" : "none";
  $("rulerN").value = String(r.n);
  $("rulerYawRow").style.display = r.n === 1 ? "none" : "";
  $("rulerYaw").value = r.yaw; if (document.activeElement !== $("rulerYawV")) $("rulerYawV").value = Math.round(r.yaw);
  $("rulerLines").value = r.lines; $("rulerLinesV").textContent = r.lines;
  $("cubeOn").checked = !!r.cube; $("cubeCtl").style.display = r.cube ? "" : "none";
  for (const [id, key, k] of BOX_CTL) if (document.activeElement !== $(id)) $(id).value = Math.round(r[key][k]);
  $("rulerHint").textContent = RULER_HINTS[r.n];
  const tilt = r.n < 3 && Math.abs(S.cam.pitch) >= 3;
  $("rulerWarn").textContent = tilt ? RULER_TILT : ""; $("rulerWarn").style.display = tilt ? "" : "none";
}
{ const sync0 = syncUI; syncUI = function(){ sync0(); syncRuler(); }; }
{ const set = fn => e => { if (e.type !== "input") remember(); fn(rulerState(), e.target); syncRuler(); draw(); };
  $("rulerOn").addEventListener("change", set((r, t) => { r.on = t.checked; }));
  $("rulerN").addEventListener("change", set((r, t) => { r.n = +t.value; }));
  $("rulerYaw").addEventListener("input", set((r, t) => { r.yaw = +t.value; }));
  $("rulerYawV").addEventListener("change", set((r, t) => { if (isFinite(+t.value)) r.yaw = wrap180(+t.value); }));
  $("rulerLines").addEventListener("input", set((r, t) => { r.lines = +t.value; }));
  $("cubeOn").addEventListener("change", set((r, t) => { r.cube = t.checked; }));
  for (const [id, key, k] of BOX_CTL)
    $(id).addEventListener("change", set((r, t) => { const v = +t.value; if (!isFinite(v)) return;
      r[key] = r[key].slice(); r[key][k] = key === "box" ? Math.max(1, Math.min(5000, v)) : v; }));
  $("boxCube").addEventListener("click", set(r => { r.box = [r.box[0], r.box[0], r.box[0]]; }));
  $("saveRuler").addEventListener("click", () => {
    const [cv, W, H] = exportCanvas();
    drawRuler(cv.getContext("2d"), W, H, {export: true, force: true});
    download(cv.toDataURL("image/png"), `perspective_${stamp()}.png`); say("パース定規の画像を保存しました。");
  });
}
syncRuler(); draw();
