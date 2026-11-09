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
// Guide shapes: solids with o.guide (any kind, any number, put in 設置), kept turned to the ruler and
// drawn in its colours, their edges carried on to the vanishing points; moved and stretched like
// solids (the 3-axis handles go along the guide's own edges; 変形 lengthens the side pulled).
// Turning a guide turns the ruler with it (and so every guide): the ruler may lean (S.ruler.pitch,
// roll), and its vanishing points then leave the eye level, as a box tipped over is drawn.
// The floor grid turns with the ruler (pose_scene.js envLines). S.ruler.grid: the guides' corners keep
// to the grid's points. Each guide keeps its own turn about the ruler's up (any angle).
// Handles: in the 配置 mode the camera stays and a vanishing point turns the ruler; in the パース mode a vanishing point, the eye level or a ruler line (its
// vanishing point follows the drag) moves the camera.
// Shown in the editor only; "定規の画像" saves it as a transparent PNG at the export size.
//
// S.ruler: {on, n: 1 | 2 | 3, yaw (degrees, world), lines, extend, snap; cube / box / pos: the
//           one box guide of before, made a guide solid when a file opens}
const RULER_COLORS = ["#e0605a", "#55b86a", "#4c9be8"];       // left-right, vertical, depth
const HORIZON_COLOR = "#e8a33c";
const RULER_DEFAULT = fresh().ruler;
function rulerState(){                        // S.ruler itself (handles keep it), with defaults filled in
  const r = S.ruler = S.ruler || {};
  if (r.size && !r.box) r.box = [r.size, r.size, r.size];                 // the first version's cube
  for (const [k, v] of Object.entries(RULER_DEFAULT)) if (r[k] === undefined) r[k] = Array.isArray(v) ? v.slice() : v;
  if (r.cube){                                   // the box guide of before: a guide solid now
    r.cube = false;
    if (r.on){ S.solids = S.solids || [];
      S.solids.push({kind: "box", pos: r.pos.slice(), size: r.box.slice(), yaw: r.n === 1 ? S.cam.yaw : r.yaw, guide: true}); }
  }
  return r;
}
// ---- turns: {yaw, pitch, roll} in the solids' order (roll about z, pitch about x, then yaw about up)
const X3 = [1, 0, 0], Y3 = [0, 1, 0], Z3 = [0, 0, 1];
const turnOf = o => v => rotY(rotAxis(rotAxis(v, Z3, deg(o.roll || 0)), X3, deg(o.pitch || 0)), deg(o.yaw || 0));
const TURN_S = [rotY(Z3, deg(30))[0] > 0 ? 1 : -1, rotAxis(Z3, X3, deg(30))[1] > 0 ? 1 : -1, rotAxis(X3, Z3, deg(30))[1] > 0 ? 1 : -1];
// back from where the x and z axes point to {yaw, pitch, roll} (0.1° steps)
function turnAngles(vx, vz){
  const a = Math.atan2(TURN_S[0] * vz[0], vz[2]), p = Math.atan2(TURN_S[1] * vz[1], Math.hypot(vz[0], vz[2]));
  const q = rotAxis(rotY(vx, -a), X3, -p), r = Math.atan2(TURN_S[2] * q[1], q[0]);
  const d = v => Math.round(v * 1800 / Math.PI) / 10;
  return {yaw: d(a), pitch: d(p), roll: d(r)};
}
// the ruler's turn: its direction (in 1点透視 the camera's) and its lean (0, 0: standing on the floor)
function rulerTurn(){ const r = rulerState(); return {yaw: rulerYaw(), pitch: +r.pitch || 0, roll: +r.roll || 0}; }
const rulerTilted = () => { const r = rulerState(); return Math.abs(+r.pitch || 0) >= 0.05 || Math.abs(+r.roll || 0) >= 0.05; };
// 定規を床のグリッドにスナップ: the guides' corners to the grid (which turns with the ruler)
const gridOn = () => !!rulerState().grid;
function setRulerTurn(t){
  const r = rulerState();
  if (r.n !== 1) r.yaw = Math.round(wrap180(t.yaw) * 10) / 10;
  r.pitch = t.pitch; r.roll = t.roll;
  if (!r.pitch) r.pitch = 0; if (!r.roll) r.roll = 0;           // no -0
}

// the guide shapes: [solid, index]; always turned like the ruler, each by its own angle about its up
const guides = () => (S.solids || []).map((o, k) => [o, k]).filter(([o]) => o.guide);
// the guide's turn about the ruler's up (degrees, any angle; 0: along the ruler): kept on it (o.gq), so
// it turns with the ruler; a guide from before: as it is turned now
const guideQuarter = o => typeof o.gq === "number" ? o.gq : guideMeasure(o);
// as it is turned now (when it was turned on its own: put, its 向き, the one about to be put)
function guideMeasure(o){
  const R = turnOf(rulerTurn()), x = turnOf(o)(X3), u = R(Y3);
  const v = sub(x, mul(u, dot(x, u))); if (len(v) < 1e-6) return 0;
  const a = Math.atan2(dot(v, R(rotY(X3, Math.PI / 2))), dot(v, R(X3))) * 180 / Math.PI;
  return Math.round(a * 10) / 10;
}
// the guide turned like the ruler (by its angle q about the ruler's up, degrees), about its middle
function guideToRuler(o, q){
  o.gq = Math.round((q || 0) * 10) / 10;
  const R = turnOf(rulerTurn()), a = deg(q || 0), t = turnAngles(R(rotY(X3, a)), R(rotY(Z3, a)));
  if (["yaw", "pitch", "roll"].every(k => Math.abs(wrap180((o[k] || 0) - t[k])) < 0.05)) return;
  const mid = add(o.pos, mul(turnOf(o)(Y3), o.size[1] / 2));
  o.yaw = t.yaw; o.pitch = t.pitch || 0; o.roll = t.roll || 0;
  o.pos = sub(mid, mul(turnOf(o)(Y3), o.size[1] / 2));
}
function alignGuides(){
  for (const [o] of guides()) guideToRuler(o, guideQuarter(o));
  const g = window.ODMGhost ? ODMGhost() : null;                 // the one about to be put, as a guide
  if (g && g.o && g.o.guide) guideToRuler(g.o, guideMeasure(g.o));     // being set: as it is turned
}
// a guide was turned (its angle q taken before): the ruler turns with it (the guides follow it)
function rulerFromGuide(o, q){
  const G = turnOf(o), a = -deg(q || 0);
  setRulerTurn(turnAngles(G(rotY(X3, a)), G(rotY(Z3, a))));
  syncRuler();
}
// 床のグリッドに合わせる: the guide's corners (a round one's middle) to the floor grid's lines, across and
// in depth each on its own, its bottom to the floor, when near
const GRID_STEP = 40;
// the floor grid's lines across and in depth: turned with the ruler while it shows
function gridAxes(){ const a = rulerState().on ? deg(rulerYaw()) : 0; return [rotY(X3, a), rotY(Z3, a)]; }
function snapGuideGrid(o){
  if (!gridOn() || !o) return;
  const m = solidMesh(o), sh = solidKind(o).shape, fy = +((S.env || {}).floorY) || 0;
  const pts = sh === "cyl" || sh === "cone" ? [o.pos] : m.V, [gu, gw] = gridAxes();
  const near = ax => { let best = null;
    for (const p of pts){ const s = dot(p, ax), d = Math.round(s / GRID_STEP) * GRID_STEP - s; if (best === null || Math.abs(d) < Math.abs(best)) best = d; }
    return best !== null && Math.abs(best) < SNAP_CM ? best : 0; };
  const lo = Math.min(...m.V.map(p => p[1]));
  o.pos = add(add(o.pos, add(mul(gu, near(gu)), mul(gw, near(gw)))), [0, Math.abs(lo - fy) < SNAP_CM ? fy - lo : 0, 0]);
}
// a guide edge's ruler family (0 left-right, 1 up, 2 depth), or -1
function edgeFamily(V, e, ax){
  const d = sub(V[e.b], V[e.a]), l = len(d); if (l < 1e-6) return -1;
  for (let k = 0; k < 3; k++) if (Math.abs(dot(d, ax[k])) / l > 0.999) return k;
  return -1;
}
// the guides' edges as drawn: {a, b (screen), k (family), carried (on to its vanishing point)}
function guideEdges(W, H){
  const ax = rulerAxes(), fams = rulerFamilies(), D = camDist(W, H), eye = eyePoint(W, H), out = [];
  for (const [o, n] of guides()){
    const m = solidMesh(o), ok = m.V.map(p => toCam(p)[2] < D - 1), P = m.V.map(p => project(p, W, H));
    const seen = m.faces.map(f => dot(f.n, sub(eye, m.V[f.v[0]])) > 0);
    for (const e of m.edges){
      if (!ok[e.a] || !ok[e.b]) continue;
      if (e.outline && seen[e.f[0]] === seen[e.f[1]]) continue;      // a curved side's line where it is not the outline
      const k = edgeFamily(m.V, e, ax);
      out.push({a: P[e.a], b: P[e.b], k, n, carried: k >= 0 && fams.includes(k)});
    }
  }
  return out;
}
const rulerYaw = () => { const r = rulerState(); return r.n === 1 ? S.cam.yaw : r.yaw; };

// the ruler's own axes in world space: [left-right, up, depth]
function rulerAxes(){ const R = turnOf(rulerTurn()); return [R(X3), R(Y3), R(Z3)]; }
// where lines along the world direction a meet on screen: {x, y}, or {dx, dy} when they stay parallel
function vanish(a, W, H){
  const q = camRot(a), f = lensF(W, H);
  if (Math.abs(q[2]) > 1e-6){
    const x = cxOf(W, H) - f*q[0]/q[2], y = cyOf(W, H) + f*q[1]/q[2];
    if (Math.hypot(x - W/2, y - H/2) < 60 * Math.max(W, H)) return {x, y};
  }
  const l = Math.hypot(q[0], q[1]) || 1;
  return {dx: q[0]/l, dy: -q[1]/l};
}
// the eye level: the screen line where the ruler's horizontal planes vanish
function horizonLine(up, W, H){
  const n = camRot(up), f = lensF(W, H), cx = cxOf(W, H), cy = cyOf(W, H);
  // a pixel's ray ((x-cx)/f, -(y-cy)/f, -1) is perpendicular to n
  if (Math.abs(n[1]) >= Math.abs(n[0])){
    if (Math.abs(n[1]) < 1e-9) return null;
    const y = x => cy + (n[0]*(x - cx) - n[2]*f) / n[1];
    return [0, y(0), W, y(W)];
  }
  const x = y => cx + (n[1]*(y - cy) + n[2]*f) / n[0];
  return [x(0), 0, x(H), H];
}
// the lines toward one vanishing point, spread evenly over the picture: [x, y, dx, dy] each
function fanLines(v, W, H, n){
  const cx = W/2, cy = H/2, diag = Math.hypot(W, H), out = [];
  const finite = v.x !== undefined;
  if (finite && Math.hypot(v.x - cx, v.y - cy) < diag * 0.5){          // a point in the picture: a star
    for (let k = 0; k < n; k++){ const a = Math.PI * k / n; out.push([v.x, v.y, Math.cos(a), Math.sin(a)]); }
  } else {                                                             // far away: evenly across the picture
    let ux = v.dx, uy = v.dy;
    if (finite){ const l = Math.hypot(v.x - cx, v.y - cy); ux = (v.x - cx) / l; uy = (v.y - cy) / l; }
    const px = -uy, py = ux, span = diag * 0.75;
    for (let k = 0; k <= n; k++){
      const s = -span + 2 * span * k / n, ax = cx + px*s, ay = cy + py*s;
      if (finite){ const dx = v.x - ax, dy = v.y - ay, l = Math.hypot(dx, dy) || 1; out.push([ax, ay, dx/l, dy/l]); }
      else out.push([ax, ay, ux, uy]);
    }
  }
  return out;
}
function fan(ctx, v, W, H, n){
  const far = Math.hypot(W, H) * 4;
  ctx.beginPath();
  for (const [x, y, dx, dy] of fanLines(v, W, H, n)){ ctx.moveTo(x - dx*far, y - dy*far); ctx.lineTo(x + dx*far, y + dy*far); }
  ctx.stroke();
}
const rulerFamilies = () => { const n = rulerState().n; return n === 1 ? [2] : n === 2 ? [0, 2] : [0, 1, 2]; };
// 辺を消失点まで延ばす: the guides' edges that have a vanishing point, as lines across the picture,
// [x, y, dx, dy, family] each
function edgeLines(W, H){
  const out = [];
  for (const e of guideEdges(W, H)){ if (!e.carried) continue;
    const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y, l = Math.hypot(dx, dy); if (l < 1e-6) continue;
    out.push([e.a.x, e.a.y, dx / l, dy / l, e.k]); }
  return out;
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
      if (yl > 12 && yl < H - 4 && !rulerTilted()){             // a leaning ruler's line is not the eye level
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
  alignGuides();
  if (guides().length){
    const edges = guideEdges(W, H);
    // 辺を消失点まで延ばす: each edge's line across the picture (it runs through its vanishing point),
    // stronger than the fan, under the box's own edges. Only the edges whose direction has a
    // vanishing point in this ruler (1点: depth, 2点: + left-right, 3点: + up), 4 lines each
    if (r.extend !== false){
      const far = Math.hypot(W, H) * 4;
      ctx.lineWidth = lw * 1.5; ctx.globalAlpha = opts.export ? 0.9 : 0.75;
      for (const [x, y, ux, uy, k] of edgeLines(W, H)){
        ctx.strokeStyle = RULER_COLORS[k];
        ctx.beginPath(); ctx.moveTo(x - ux * far, y - uy * far); ctx.lineTo(x + ux * far, y + uy * far); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    // the guides' own edges: the ruler's colours (others grey); the selected one heavier
    const chosen = n => !opts.export && mode === "place" && (n === soSel || (typeof objPicked === "function" && objPicked("s" + n)));
    for (const e of edges){
      ctx.strokeStyle = e.k >= 0 ? RULER_COLORS[e.k] : "#8a8a8a"; ctx.lineWidth = lw * (chosen(e.n) ? 3.6 : 2.2);
      ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); ctx.stroke();
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
    // a ruler line: its vanishing point moves as far as the line is dragged (also one off the picture).
    // The strong lines (the box's edges carried on) when they show, else the thin ones: an empty
    // place still turns the camera
    if (camHeld()) return null;
    const lines = guides().length && r.extend !== false ? edgeLines(W, H)
      : rulerFamilies().flatMap(k => { const v = vanish(ax[k], W, H); return v.x === undefined ? [] : fanLines(v, W, H, r.lines).map(l => [...l, k]); });
    const near = lines.find(([lx, ly, dx, dy]) => Math.abs((x - lx) * dy - (y - ly) * dx) < reach * 0.5);
    if (!near) return null;
    const k = near[4], v = vanish(ax[k], W, H); if (v.x === undefined) return null;
    return {move(mx, my){ cameraToVanish(k, v.x + mx - x, v.y + my - y, W, H); syncUI(); }};
  }
  if (hit < 0) return null;
  if (mode === "persp") return {move(mx, my){ cameraToVanish(hit, mx, my, W, H); syncUI(); }};
  if (hit === 1 || r.n === 1){
    say(hit === 1 ? "縦の消失点はカメラの高さで決まります。カメラモードでつかむとカメラが動きます。"
                  : "1点透視の消失点は、カメラモードでつかむとカメラが動きます。", true);
    return {move(){}};
  }
  // 配置: the camera stays; the ruler turns about its up so that its vanishing point follows the mouse
  // along its eye level
  return {move(mx, my){
    const A = rulerAxes(), up = A[1], d0 = pixelRay(mx, my, W, H).dir, p = sub(d0, mul(up, dot(d0, up)));
    if (len(p) < 1e-6) return;
    const d = norm(p), cur = A[hit];
    let a = Math.atan2(dot(cross(cur, d), up), dot(cur, d));
    if (Math.abs(a) > Math.PI / 2) a -= Math.sign(a) * Math.PI;                 // the nearer of the two
    const R = v => rotAxis(v, up, a);
    setRulerTurn(turnAngles(R(A[0]), R(A[2]))); syncRuler();
  }};
});
// ---- snapping (S.ruler.snap, while the ruler shows) -------------------------------------------------
// Objects and things turn freely; with 回転も定規の向きに吸い付く (off at first), turned to within ±5° of
// one of the ruler's directions (a quarter turn apart), they stick to it. A solid also sticks to the planes set to the ruler: the floor, the
// ceiling, the wall when it is turned like the ruler, and the faces of floor / wall slabs turned like it.
const SNAP_CM = 12, SNAP_DEG = 5;
const snapOn = () => { const r = rulerState(); return !!(r.on && r.snap); };
// 回転も定規の向きに吸い付く (S.ruler.snapTurn, off at first): the ±5° magnet on the turn
const turnSnapOn = () => { const r = rulerState(); return !!(r.on && r.snapTurn); };
const yawOff = y => { const d = wrap180((y || 0) - rulerYaw()); return ((d % 90) + 135) % 90 - 45; };   // -45 .. 45
const alignedYaw = y => wrap180((y || 0) - yawOff(y));
const isAligned = y => Math.abs(yawOff(y)) < 0.5;
// a facing near the ruler's (a leaning ruler has none on the floor): the ruler's, else as it is
const magnetYaw = y => turnSnapOn() && !rulerTilted() && Math.abs(yawOff(y)) < SNAP_DEG ? Math.round(alignedYaw(y) * 10) / 10 : y;
// half of a solid's size along the direction n (as turned)
function halfAlong(o, n){
  const R = turnOf(o);
  return [X3, Y3, Z3].reduce((s, u, i) => s + Math.abs(dot(n, R(u))) * o.size[i] / 2, 0);
}
const solidMid = o => add(o.pos, mul(turnOf(o)(Y3), o.size[1] / 2));
const upright = o => Math.abs(o.pitch || 0) < 0.05 && Math.abs(o.roll || 0) < 0.05;
// planes {p, n (outward, toward where things stand), near(c, o): whether o at its middle c is beside it}
function snapPlanes(except){
  const E = S.env || {}, out = [];
  if (E.floor) out.push({p: [0, +E.floorY || 0, 0], n: [0, 1, 0]});
  if (E.ceiling) out.push({p: [0, +E.ceilingY || 230, 0], n: [0, -1, 0]});
  if (E.wall && isAligned(+E.wallYaw || 0)) out.push({p: [+E.wallX || 0, 0, +E.wallZ || -40], n: rotY([0, 0, 1], deg(+E.wallYaw || 0))});
  (S.solids || []).forEach(o => {
    if (o === except || o.guide || (o.kind !== "floor" && o.kind !== "wall") || !isAligned(o.yaw) || !upright(o)) return;
    const a = deg(o.yaw || 0), c = add(o.pos, [0, o.size[1] / 2, 0]);
    const axes = [rotY([1, 0, 0], a), [0, 1, 0], rotY([0, 0, 1], a)], half = [o.size[0] / 2, o.size[1] / 2, o.size[2] / 2];
    const thin = o.kind === "floor" ? 1 : 2;                // the slab's thin direction: its faces
    for (const s of [1, -1]){
      const n = mul(axes[thin], s);
      out.push({p: add(c, mul(n, half[thin])), n, near: (q, x) => [0, 1, 2].every(i => i === thin ||
        Math.abs(dot(sub(q, c), axes[i])) <= half[i] + halfAlong(x, axes[i]) + 1)});
    }
  });
  return out;
}
// keepTurn: only the place sticks (while it is turned about the floor's axes)
function snapSolid(o, keepTurn){
  if (!snapOn() || !o || o.guide) return;
  if (!keepTurn) o.yaw = magnetYaw(o.yaw);
  for (const pl of snapPlanes(o)){
    const c = solidMid(o);
    if (pl.near && !pl.near(c, o)) continue;
    const s = dot(pl.n, sub(c, pl.p)) - halfAlong(o, pl.n);
    if (Math.abs(s) < SNAP_CM) o.pos = sub(o.pos, mul(pl.n, s));
  }
}
// a thing put down: its turn, and it sticks to the upright planes (the wall, slabs' sides) by its
// nearest point; the floor and the tops of solids are the grounding's (pose_scene.js)
function snapItem(it){
  if (!snapOn() || !it) return;
  it.yaw = magnetYaw(it.yaw);
  if (!it.base || typeof worldSamples !== "function") return;
  const pts = worldSamples(it); if (!pts.length) return;
  const c = mul(pts.reduce((a, q) => add(a, q), [0, 0, 0]), 1 / pts.length), dot0 = {pos: c, size: [0, 0, 0], yaw: 0};
  for (const pl of snapPlanes()){
    if (Math.abs(pl.n[1]) > 0.5 || (pl.near && !pl.near(c, dot0))) continue;
    const s = Math.min(...pts.map(q => dot(pl.n, sub(q, pl.p))));
    if (Math.abs(s) < SNAP_CM){ const d = mul(pl.n, -s); it.base = add(it.base, d); pts.forEach((q, i) => { pts[i] = add(q, d); }); }
  }
}

// ---- the panel ------------------------------------------------------------------------------------
const RULER_HINTS = {
  1: "奥行きの線がアイレベル上の1点に集まります（カメラの正面に向けた定規）。",
  2: "左右と奥行きの線がアイレベル上の2点に集まります。",
  3: "縦の線も3つ目の点に集まります（カメラの高さが0°のときは平行）。"};
const RULER_TILT = "カメラが俯瞰・あおりなので、縦の線は実際にはわずかに集まります（人物と直方体はそのとおりに描かれます）。厳密な1点・2点透視にするには、カメラの高さを0°にします。";
function syncRuler(){
  const r = rulerState();
  $("rulerOn").checked = !!r.on; $("rulerCtl").style.display = r.on ? "" : "none";
  $("rulerN").value = String(r.n);
  $("rulerYawRow").style.display = r.n === 1 ? "none" : "";
  $("rulerYaw").value = r.yaw; if (document.activeElement !== $("rulerYawV")) $("rulerYawV").value = Math.round(r.yaw);
  $("rulerLines").value = r.lines; $("rulerLinesV").textContent = r.lines;
  $("cubeExtend").checked = r.extend !== false; $("rulerSnap").checked = !!r.snap;
  $("rulerHint").textContent = RULER_HINTS[r.n];
  const lean = rulerTilted(), tilt = r.n < 3 && (lean || Math.abs(S.cam.pitch) >= 3);
  $("rulerWarn").textContent = tilt ? (lean ? RULER_LEAN : RULER_TILT) : ""; $("rulerWarn").style.display = tilt ? "" : "none";
  $("rulerLeanRow").style.display = lean ? "" : "none";
  $("rulerLeanV").textContent = `前後 ${Math.round(+r.pitch || 0)}°・横 ${Math.round(+r.roll || 0)}°`;
  $("rulerGrid").checked = !!r.grid; $("rulerSnapTurn").checked = !!r.snapTurn;
}
const RULER_LEAN = "定規が倒れているので、縦の線も実際には集まります（3点透視で見えます）。";
{ const sync0 = syncUI; syncUI = function(){ sync0(); syncRuler(); }; }
{ const set = fn => e => { if (e.type !== "input") remember(); fn(rulerState(), e.target); syncRuler(); draw(); };
  $("rulerOn").addEventListener("change", set((r, t) => { r.on = t.checked; }));
  $("rulerN").addEventListener("change", set((r, t) => { r.n = +t.value; }));
  $("rulerYaw").addEventListener("input", set((r, t) => { r.yaw = +t.value; }));
  $("rulerYawV").addEventListener("change", set((r, t) => { if (isFinite(+t.value)) r.yaw = wrap180(+t.value); }));
  // 定規を床に立てる: no lean (the direction stays)
  $("rulerUpright").addEventListener("click", set(r => { r.pitch = 0; r.roll = 0; }));
  // 定規を床のグリッドにスナップ: the guides' corners to the grid's points now (the grid turns with the ruler)
  $("rulerGrid").addEventListener("change", set((r, t) => { r.grid = t.checked;
    if (r.grid) for (const [o] of guides()) snapGuideGrid(o); }));
  $("rulerSnapTurn").addEventListener("change", set((r, t) => { r.snapTurn = t.checked; }));
  $("rulerLines").addEventListener("input", set((r, t) => { r.lines = +t.value; }));
  // ガイドを置く: the 設置 tab, its shapes, as a guide
  $("rulerGuideAdd").addEventListener("click", () => { if (window.ODMPlaceGuide) ODMPlaceGuide(); });
  $("cubeExtend").addEventListener("change", set((r, t) => { r.extend = t.checked; }));
  $("rulerSnap").addEventListener("change", set((r, t) => { r.snap = t.checked; }));
  $("wallToRuler").addEventListener("click", () => {
    const E = S.env = Object.assign(fresh().env, S.env || {});
    remember(); E.wall = true; E.wallYaw = Math.round(alignedYaw(+E.wallYaw || 0) * 10) / 10;
    if (typeof syncScene === "function") syncScene(); draw(); say("壁を定規の向きにそろえました。");
  });
  $("saveRuler").addEventListener("click", () => {
    const [cv, W, H] = exportCanvas();
    drawRuler(cv.getContext("2d"), W, H, {export: true, force: true});
    download(cv.toDataURL("image/png"), `perspective_${stamp()}.png`); say("パース定規の画像を保存しました。");
  });
}
syncRuler(); draw();
