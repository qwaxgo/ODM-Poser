// The perspective ruler (パース定規) and the cube guide (index.html, loaded after the editor's own
// script). The vanishing points come from the editor's camera, so the ruler always has the same
// perspective as the figure. The ruler stands level on the floor, so its eye level is the
// floor's; the modes differ in which lines are drawn:
//   1点透視: the ruler faces the camera; depth lines meet at one point on the eye level.
//   2点透視: the ruler is turned by S.ruler.yaw from the camera; left-right and depth lines meet
//            at two points on the eye level.
//   3点透視: as 2点, and the verticals meet at a third point.
// A camera looking down or up really makes verticals meet (the figure and the cube are drawn
// so); for a strict 1- or 2-point picture the camera height is 0°, and the panel says so.
// Shown in the editor only; "定規の画像" saves it as a transparent PNG at the export size.
//
// S.ruler: {on, n: 1 | 2 | 3, yaw (degrees), lines, cube, size (cm), off: [x, y, z] cm in the
//           ruler's own axes from the camera's target}
const RULER_COLORS = ["#e0605a", "#55b86a", "#4c9be8"];       // left-right, vertical, depth
const HORIZON_COLOR = "#e8a33c";
function rulerState(){ return S.ruler || (S.ruler = fresh().ruler); }

// the ruler's own axes in world space: [left-right, up, depth]
function rulerAxes(){
  const r = rulerState(), Y = [0, 1, 0], a = deg(S.cam.yaw + (r.n === 1 ? 0 : r.yaw));
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
function cubeCorners(ax){
  const r = rulerState(), h = r.size / 2, o = r.off || [0, 0, 0];
  const c = add(add(add(S.center, mul(ax[0], o[0])), mul(ax[1], o[1])), mul(ax[2], o[2]));
  const out = [];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1])
    out.push(add(add(add(c, mul(ax[0], sx*h)), mul(ax[1], sy*h)), mul(ax[2], sz*h)));
  return out;                                    // index = sx*4 + sy*2 + sz (0 = minus, 1 = plus)
}
function drawRuler(ctx, W, H, opts = {}){
  const r = rulerState();
  if (!r.on && !opts.force) return;
  const ax = rulerAxes(), lw = Math.max(1, W / 900);
  ctx.save(); ctx.lineCap = "round";
  // the families that meet at a point: 1点 depth, 2点 + left-right, 3点 + vertical
  const fams = r.n === 1 ? [2] : r.n === 2 ? [0, 2] : [0, 1, 2];
  const vps = [];
  for (const k of fams){
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
  for (const [v, k] of vps){
    if (v.x < -20 || v.x > W + 20 || v.y < -20 || v.y > H + 20) continue;
    ctx.strokeStyle = RULER_COLORS[k]; ctx.lineWidth = lw * 2;
    ctx.beginPath(); ctx.arc(v.x, v.y, Math.max(5, W / 120), 0, 2 * Math.PI); ctx.stroke();
  }
  if (r.cube){
    const C = cubeCorners(ax), D = camDist(W, H);
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
// under the figure in the editor's front view
{ const atari0 = drawAtari;
  drawAtari = function(ctx, W, H, opts = {}){
    if (!opts.export && ctx.canvas === front) drawRuler(ctx, W, H);
    atari0(ctx, W, H, opts);
  };
}

// ---- the panel ------------------------------------------------------------------------------------
const RULER_HINTS = {
  1: "奥行きの線がアイレベル上の1点に集まります（カメラの正面に向けた定規）。",
  2: "左右と奥行きの線がアイレベル上の2点に集まります。",
  3: "縦の線も3つ目の点に集まります（カメラの高さが0°のときは平行）。"};
const RULER_TILT = "カメラが俯瞰・あおりなので、縦の線は実際にはわずかに集まります（人物と立方体はそのとおりに描かれます）。厳密な1点・2点透視にするには、カメラの高さを0°にします。";
function syncRuler(){
  const r = rulerState();
  $("rulerOn").checked = !!r.on; $("rulerCtl").style.display = r.on ? "" : "none";
  $("rulerN").value = String(r.n);
  $("rulerYawRow").style.display = r.n === 1 ? "none" : "";
  $("rulerYaw").value = r.yaw; if (document.activeElement !== $("rulerYawV")) $("rulerYawV").value = r.yaw;
  $("rulerLines").value = r.lines; $("rulerLinesV").textContent = r.lines;
  $("cubeOn").checked = !!r.cube; $("cubeCtl").style.display = r.cube ? "" : "none";
  const o = r.off || [0, 0, 0];
  for (const [id, v] of [["cubeSize", r.size], ["cubeX", o[0]], ["cubeY", o[1]], ["cubeZ", o[2]]])
    if (document.activeElement !== $(id)) $(id).value = Math.round(v);
  $("rulerHint").textContent = RULER_HINTS[r.n];
  const tilt = r.n < 3 && Math.abs(S.cam.pitch) >= 3;
  $("rulerWarn").textContent = tilt ? RULER_TILT : ""; $("rulerWarn").style.display = tilt ? "" : "none";
}
{ const sync0 = syncUI; syncUI = function(){ sync0(); syncRuler(); }; }
{ const set = fn => e => { fn(rulerState(), e.target); syncRuler(); draw(); };
  $("rulerOn").addEventListener("change", set((r, t) => { r.on = t.checked; }));
  $("rulerN").addEventListener("change", set((r, t) => { r.n = +t.value; }));
  $("rulerYaw").addEventListener("input", set((r, t) => { r.yaw = +t.value; }));
  $("rulerYawV").addEventListener("change", set((r, t) => { if (isFinite(+t.value)) r.yaw = Math.max(-89, Math.min(89, +t.value)); }));
  $("rulerLines").addEventListener("input", set((r, t) => { r.lines = +t.value; }));
  $("cubeOn").addEventListener("change", set((r, t) => { r.cube = t.checked; }));
  $("cubeSize").addEventListener("change", set((r, t) => { if (+t.value > 0) r.size = Math.min(2000, +t.value); }));
  ["cubeX", "cubeY", "cubeZ"].forEach((id, k) => $(id).addEventListener("change", set((r, t) => {
    if (!isFinite(+t.value)) return; r.off = (r.off || [0, 0, 0]).slice(); r.off[k] = +t.value; })));
  $("saveRuler").addEventListener("click", () => {
    const [W, H] = exportSize(), cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    drawRuler(cv.getContext("2d"), W, H, {export: true, force: true});
    download(cv.toDataURL("image/png"), `perspective_${stamp()}.png`); say("パース定規の画像を保存しました。");
  });
}
syncRuler(); draw();
