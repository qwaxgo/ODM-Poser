// The scene around the figure (index.html, loaded after the editor's own script):
// floor / wall / ceiling and grounding, things held in the hand or both hands, chairs and rides
// the body is put on, things to grab (vines, branches, bars), and the wire of a wire action.
// Shapes come from pose_props.js. The editor calls drawScene() while drawing and
// sceneAfterEdit() after every edit (before the pins are held).
//
// S.items: {key, hand: "r" | "l" (held), base: [x, y, z], yaw (world / grab: where it was put),
//           off: [x, y, z] cm, rot: [x, y, z] degrees, scale: 1}
// S.env:   floor, floorY, ground ("off" | "nopen" | "stick"), wall, wallZ, wallX, wallYaw, ceiling,
//          ceilingY, show (draw floor / wall in the exported atari too)
// S.wire:  {on, joint, anchor: [x, y, z], length}
const PROPS_ = window.PROPS || {}, CATS_ = window.PROP_CATS || [];

// ---- frames ------------------------------------------------------------------------------------
function rotY(v, a){ const c = Math.cos(a), s = Math.sin(a); return [c*v[0] + s*v[2], v[1], -s*v[0] + c*v[2]]; }
function itemLocal(it, p){                    // the item's own size and turn, before its frame
  let q = mul(p, it.scale || 1);
  const r = it.rot || [0, 0, 0];
  q = rotAxis(q, [0, 0, 1], deg(r[2])); q = rotAxis(q, [1, 0, 0], deg(r[0])); q = rotAxis(q, [0, 1, 0], deg(r[1]));
  return add(q, it.off || [0, 0, 0]);
}
// the fist: origin in the middle of the fist, z along the forearm, y toward the thumb
function handFrame(side){
  const el = S.P[IX[side + "_elbow"]], wr = S.P[IX[side + "_wrist"]];
  const z = norm(sub(wr, el));
  const ref = add(bodyFront(), mul(bodyRot([0, 1, 0]), 0.4));
  let y = sub(ref, mul(z, dot(ref, z)));
  if (len(y) < 1e-4) y = cross(z, [1, 0, 0]);
  y = rotAxis(norm(y), z, deg(S.twist[IX[side + "_wrist"]] || 0) * (side === "r" ? 1 : -1));
  const x = mul(norm(cross(y, z)), side === "r" ? 1 : -1);
  return {o: add(wr, mul(z, 7)), x, y, z};
}
function chestFrame(){
  const P = S.P, x = norm(sub(P[IX.l_shoulder], P[IX.r_shoulder]));
  let y = sub(P[IX.neck], P[IX.waist]); y = norm(sub(y, mul(x, dot(y, x))));
  return {o: P[IX.chest], x, y, z: cross(x, y)};
}
function worldFrame(it){
  const a = deg(it.yaw || 0);
  return {o: it.base || [0, 0, 0], x: rotY([1, 0, 0], a), y: [0, 1, 0], z: rotY([0, 0, 1], a)};
}
function frameOf(it){
  const def = PROPS_[it.key] || {};
  return def.place === "hand" ? handFrame(it.hand || "r") : def.place === "body" ? chestFrame() : worldFrame(it);
}
const inFrame = (f, p) => add(f.o, add(add(mul(f.x, p[0]), mul(f.y, p[1])), mul(f.z, p[2])));
function itemToWorld(it, p, f){ return inFrame(f || frameOf(it), itemLocal(it, p)); }
const dirToWorld = (f, it, v) => { const a = itemToWorld(it, [0, 0, 0], f), b = itemToWorld(it, v, f); return sub(b, a); };

// ---- drawing -----------------------------------------------------------------------------------
function circle3(c, n, r, k = 24){            // points of a circle about the normal n
  const nn = norm(n), ref = Math.abs(nn[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const u = norm(cross(nn, ref)), v = cross(nn, u), out = [];
  for (let i = 0; i <= k; i++){ const t = 2 * Math.PI * i / k;
    out.push(add(c, add(mul(u, r * Math.cos(t)), mul(v, r * Math.sin(t))))); }
  return out;
}
function drawShape(ctx, sh, it, f, P, lw){
  const W2 = q => itemToWorld(it, q, f), k = it.scale || 1;
  const line = pts => { ctx.beginPath(); pts.forEach((q, i) => { const s = P(q); i ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y); }); ctx.stroke(); };
  if (sh.c){
    const [x1, y1, z1, x2, y2, z2, r0] = sh.c, a = W2([x1, y1, z1]), b = W2([x2, y2, z2]), r = r0 * k;
    const pa = P(a), pb = P(b), wpx = 2 * r * Math.max(pa.s, pb.s);
    if (wpx < lw * 3){ ctx.save(); ctx.lineWidth = Math.max(lw, wpx); line([a, b]); ctx.restore(); return; }
    const ax = sub(b, a);
    let dx = pb.x - pa.x, dy = pb.y - pa.y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    for (const sgn of [1, -1]){ ctx.beginPath();
      ctx.moveTo(pa.x - dy * r * pa.s * sgn, pa.y + dx * r * pa.s * sgn);
      ctx.lineTo(pb.x - dy * r * pb.s * sgn, pb.y + dx * r * pb.s * sgn); ctx.stroke(); }
    line(circle3(a, ax, r)); line(circle3(b, ax, r));
  } else if (sh.b){
    const [cx, cy, cz, sx, sy, sz] = sh.b, h = [sx / 2, sy / 2, sz / 2];
    const V = [];
    for (const i of [-1, 1]) for (const j of [-1, 1]) for (const l of [-1, 1]) V.push(W2([cx + i*h[0], cy + j*h[1], cz + l*h[2]]));
    for (const [a, b] of [[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]]) line([V[a], V[b]]);
  } else if (sh.s){
    const [cx, cy, cz, r] = sh.s, c = P(W2([cx, cy, cz]));
    ctx.beginPath(); ctx.arc(c.x, c.y, Math.max(1, r * k * c.s), 0, 2 * Math.PI); ctx.stroke();
  } else if (sh.d){
    const [cx, cy, cz, nx, ny, nz, r] = sh.d, c = W2([cx, cy, cz]);
    line(circle3(c, dirToWorld(f, it, [nx, ny, nz]), r * k));
  } else if (sh.k){
    const [bx, by, bz, ax, ay, az, r] = sh.k, b = W2([bx, by, bz]), apex = W2([ax, ay, az]);
    const ring = circle3(b, sub(apex, b), r * k), pa = P(apex), pr = ring.map(P);
    line(ring);
    let lo = 0, hi = 0, vlo = 1e9, vhi = -1e9;
    const pc = P(b), ux = pc.x - pa.x, uy = pc.y - pa.y;
    pr.forEach((q, i) => { const v = ux * (q.y - pa.y) - uy * (q.x - pa.x); if (v < vlo){ vlo = v; lo = i; } if (v > vhi){ vhi = v; hi = i; } });
    for (const i of [lo, hi]){ ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pr[i].x, pr[i].y); ctx.stroke(); }
  } else if (sh.t){
    const [cx, cy, cz, nx, ny, nz, R, r] = sh.t, c = W2([cx, cy, cz]), n = dirToWorld(f, it, [nx, ny, nz]);
    ctx.save(); ctx.lineWidth = Math.max(lw, 2 * r * k * P(c).s * 0.8); line(circle3(c, n, R * k)); ctx.restore();
  }
}
function envLines(){                          // floor / wall / ceiling as 3D line segments
  const E = S.env || {}, c = S.P[IX.pelvis], out = [];
  const grid = (y, n = 4, step = 40) => {
    const x0 = Math.round(c[0] / step) * step, z0 = Math.round(c[2] / step) * step;
    for (let i = -n; i <= n; i++){
      out.push([[x0 + i*step, y, z0 - n*step], [x0 + i*step, y, z0 + n*step]]);
      out.push([[x0 - n*step, y, z0 + i*step], [x0 + n*step, y, z0 + i*step]]);
    }
  };
  if (E.floor) grid(+E.floorY || 0);
  if (E.ceiling) grid(+E.ceilingY || 230, 3);
  if (E.wall){
    const a = deg(+E.wallYaw || 0), o = [+E.wallX || 0, 0, +E.wallZ || -40], y0 = +E.floorY || 0;
    const at = (u, h) => add(o, add(rotY([u, 0, 0], a), [0, y0 + h, 0]));
    for (let u = -150; u <= 150; u += 50) out.push([at(u, 0), at(u, 250)]);
    for (let h = 0; h <= 250; h += 50) out.push([at(-150, h), at(150, h)]);
  }
  return out;
}
function drawScene(ctx, W, H, opts, proj, ink, far, lw){
  const P = q => proj(q, W, H), E = S.env || {};
  ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
  if (!opts.export || E.show){
    ctx.strokeStyle = opts.export ? "#b0b0b0" : far; ctx.lineWidth = Math.max(1, lw * 0.6);
    ctx.globalAlpha = opts.export ? 1 : 0.55;
    for (const [a, b] of envLines()){ const p = P(a), q = P(b); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  // the wire
  const w = S.wire;
  if (w && w.on && w.anchor){
    const a = P(w.anchor), b = P(S.P[IX[w.joint] !== undefined ? IX[w.joint] : IX.chest]);
    ctx.strokeStyle = ink; ctx.lineWidth = lw; ctx.setLineDash([lw * 4, lw * 3]);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(a.x, a.y, lw * 3, 0, 2 * Math.PI); ctx.stroke();
  }
  // the things
  (S.items || []).forEach((it, n) => {
    const def = PROPS_[it.key]; if (!def) return;
    const f = frameOf(it);
    ctx.strokeStyle = opts.export ? ink : (n === scSel ? cssVar("--sel") : cssVar("--accent"));
    ctx.lineWidth = lw * (opts.side ? 0.9 : 1.1);
    for (const sh of def.parts) drawShape(ctx, sh, it, f, P, lw);
  });
  ctx.restore();
}

// ---- simulation after each edit ---------------------------------------------------------------
const CONTACT = {pelvis: 14, waist: 11, chest: 12, neck: 5, head: 11, r_shoulder: 6, l_shoulder: 6,
  r_elbow: 4, l_elbow: 4, r_wrist: 3, l_wrist: 3, r_hip: 10, l_hip: 10, r_knee: 5, l_knee: 5,
  r_ankle: 7, l_ankle: 7, r_toe: 2, l_toe: 2};
function lowest(){ let m = 1e9; J.forEach((n, i) => { m = Math.min(m, S.P[i][1] - (CONTACT[n] || 3)); }); return m; }
function moveAll(d, view){                    // view: the camera follows (for the buttons)
  S.P = S.P.map(q => add(q, d));
  if (view) S.center = add(S.center, d);
}
function wristTarget(side, grip){             // where the wrist goes so the fist's middle is at grip
  const el = S.P[IX[side + "_elbow"]];
  return add(grip, mul(norm(sub(grip, el)), -7));
}
// before IK, bend the knee forward, so the two-bone IK does not keep a backward bend that a big
// move of the body left behind (arms keep their own bend: the joint limits judge those)
function preBend(i, target){
  if (!/ankle/.test(J[i])) return;
  const mid = PARENT[i], root = PARENT[mid], r = S.P[root], L1 = len(sub(S.P[mid], r));
  rotateSubtree(mid, add(r, mul(norm(add(norm(sub(target, r)), mul(bodyFront(), 0.8))), L1)));
}
function reachWith(i, target, pull){          // IK; when out of reach, optionally bring the body
  const root = PARENT[PARENT[i]], L = len(sub(S.P[PARENT[i]], S.P[root])) + len(sub(S.P[i], S.P[PARENT[i]]));
  const d = sub(target, S.P[root]), dl = len(d);
  if (pull && dl > L * 0.98) moveAll(mul(norm(d), dl - L * 0.97), true);
  preBend(i, target); solveIK(i, target);
  return dl <= L * 0.98 || pull;
}
function followItems(moved){
  for (const it of S.items || []){
    const def = PROPS_[it.key]; if (!def) continue;
    if (def.place === "hand" && def.grip2 && it.both !== false){
      const other = it.hand === "r" ? "l" : "r", wi = IX[other + "_wrist"];
      if (S.pins && S.pins[wi]) continue;
      const g = itemToWorld(it, def.grip2);
      solveIK(wi, wristTarget(other, g)); solveIK(wi, wristTarget(other, g));
    }
    if (def.place === "body" && def.mount){
      const f = chestFrame();
      for (const [jn, p] of Object.entries(def.mount)){
        const wi = IX[jn]; if (wi === undefined || (S.pins && S.pins[wi])) continue;
        solveIK(wi, itemToWorld(it, p, f));
      }
    }
  }
}
function sceneAfterEdit(moved){
  if (!S.items) S.items = [];
  if (!S.env) S.env = fresh().env;
  followItems(moved);
  const w = S.wire;
  if (w && w.on && w.anchor){
    const ji = IX[w.joint] !== undefined ? IX[w.joint] : IX.chest, d = sub(S.P[ji], w.anchor);
    if (len(d) > w.length) moveAll(sub(add(w.anchor, mul(norm(d), w.length)), S.P[ji]));
  }
  const E = S.env;
  if (E.ground && E.ground !== "off" && !(w && w.on)){
    const lift = groundLift(E.ground === "stick");
    if (lift) moveAll([0, lift, 0]);
  }
}
// grounding on the floor and on the tops of solids (pose_solids.js): a joint stands on the highest
// floor / top under it that is at most STEP_UP above its lowest point (higher ones are walls to it)
const STEP_UP = 40;
function supportUnder(p, bottom){
  const E = S.env || {};
  let s = E.floor ? +E.floorY || 0 : -Infinity;
  if (typeof solidTopsAt === "function") for (const t of solidTopsAt(p)) if (t <= bottom + STEP_UP) s = Math.max(s, t);
  return s;
}
function groundLift(stick){                   // how far to move the figure up (+) or down (-)
  let gap = Infinity;
  J.forEach((n, i) => { const b = S.P[i][1] - (CONTACT[n] || 3); gap = Math.min(gap, b - supportUnder(S.P[i], b)); });
  if (!isFinite(gap)) return 0;
  return stick ? -gap : Math.max(0, -gap);
}

// ---- surfaces: put the selected hand / foot on the floor, a wall or the ceiling ------------------
function surfaces(){
  const E = S.env || {}, out = [];
  if (E.floor) out.push({name: "床", p: [0, +E.floorY || 0, 0], n: [0, 1, 0]});
  if (E.ceiling) out.push({name: "天井", p: [0, +E.ceilingY || 230, 0], n: [0, -1, 0]});
  if (E.wall){ const a = deg(+E.wallYaw || 0);
    out.push({name: "壁", p: [+E.wallX || 0, 0, +E.wallZ || -40], n: rotY([0, 0, 1], a)}); }
  return out;
}
function flatFoot(side, fy){                  // the toe on the floor too
  const a = S.P[IX[side + "_ankle"]], t = IX[side + "_toe"], L = len(sub(S.P[t], a));
  let h = sub(S.P[t], a); h = [h[0], 0, h[2]]; h = len(h) > 1e-3 ? norm(h) : bodyFront();
  const dy = fy + 2 - a[1];
  if (Math.abs(dy) < L) rotateSubtree(t, add(a, add(mul(h, Math.sqrt(L*L - dy*dy)), [0, dy, 0])));
}
function toSurface(which){
  const i = sel;
  if (i < 0 || !PINNABLE.has(J[i])) { say("先に手首・足首・膝・肘・腰のどれかを選んでください。", true); return; }
  const sf = surfaces().filter(s => !which || s.name === which);
  if (!sf.length) { say(`${which || "床・壁・天井"}を先にオンにしてください。`, true); return; }
  // the nearest enabled surface
  let best = null, bd = 1e9;
  for (const s of sf){ const d = Math.abs(dot(sub(S.P[i], s.p), s.n)); if (d < bd){ bd = d; best = s; } }
  remember();
  const off = CONTACT[J[i]] || 3, cur = S.P[i];
  const target = add(sub(cur, mul(best.n, dot(sub(cur, best.p), best.n))), mul(best.n, off));
  if (i === IX.pelvis) moveAll(sub(target, cur), true);
  else if (IK_END[J[i]]) reachWith(i, target, $("scPull").checked);
  else rotateSubtree(i, add(S.P[PARENT[i]], mul(norm(sub(target, S.P[PARENT[i]])), len(sub(cur, S.P[PARENT[i]])))));
  if (/ankle/.test(J[i]) && best.name === "床") flatFoot(J[i][0], target[1] - off);
  if (/wrist/.test(J[i])) S.hands[J[i][0]] = "open";
  S.pins = S.pins || {}; S.pins[i] = S.P[i].slice();
  afterEdit(i); draw();
  say(`${J_JA[J[i]]}を${best.name}に着けて固定しました。`);
}

// ---- grab the nearest thing (vine, branch, bar, ladder, chair back, handlebar ...) ----------------
function nearestOn(it, q){
  const def = PROPS_[it.key], f = frameOf(it); let best = null, bd = 1e9;
  for (const sh of def.grab ? def.grab.map(([a, b]) => ({c: [...a, ...b, 0]})) : def.parts){
    let p = null;
    if (sh.c){ const a = itemToWorld(it, sh.c.slice(0, 3), f), b = itemToWorld(it, sh.c.slice(3, 6), f), ab = sub(b, a);
      const t = Math.max(0, Math.min(1, dot(sub(q, a), ab) / (dot(ab, ab) || 1))); p = add(a, mul(ab, t)); }
    else if (sh.s) p = itemToWorld(it, sh.s.slice(0, 3), f);
    else if (sh.b){ const [cx, cy, cz, sx, sy, sz] = sh.b;   // the nearest point on the box, in its own frame
      const o = itemToWorld(it, [cx, cy, cz], f), k = it.scale || 1;
      const ax = [dirToWorld(f, it, [1, 0, 0]), dirToWorld(f, it, [0, 1, 0]), dirToWorld(f, it, [0, 0, 1])].map(norm);
      const hs = [sx, sy, sz].map(v => v * k / 2);
      p = o; ax.forEach((u, m) => { p = add(p, mul(u, Math.max(-hs[m], Math.min(hs[m], dot(sub(q, o), u))))); }); }
    if (p){ const d = len(sub(p, q)); if (d < bd){ bd = d; best = p; } }
  }
  return best;
}
function grab(){
  let i = sel;
  if (i < 0 || !/_(wrist|ankle)$/.test(J[i])) i = IX.r_wrist;
  const things = (S.items || []).map((it, n) => [it, n]).filter(([it]) => PROPS_[it.key] && PROPS_[it.key].place !== "hand");
  if (!things.length) { say("つかまる物（蔓・枝・鉄棒など）を先に置いてください。", true); return; }
  let best = null, bd = 1e9;
  const from = S.P[PARENT[PARENT[i]]];
  for (const [it] of things){ const p = nearestOn(it, from); if (p && len(sub(p, from)) < bd){ bd = len(sub(p, from)); best = p; } }
  if (!best) return;
  remember();
  const side = J[i][0];
  if (/wrist/.test(J[i])){
    const pull = $("scPull").checked;
    reachWith(i, wristTarget(side, best), pull); solveIK(i, wristTarget(side, best));
    S.hands[side] = "grip";
  } else reachWith(i, add(best, [0, 7, 0]), $("scPull").checked);
  S.pins = S.pins || {}; S.pins[i] = S.P[i].slice();
  afterEdit(i); draw();
  say(`${J_JA[J[i]]}でつかまって固定しました。別の手足も選んで「つかまる」を押せます。`);
}
function hang(){                              // let the body down until an arm that holds is straight
  const holds = ["r", "l"].filter(s => S.pins && S.pins[IX[s + "_wrist"]]);
  if (!holds.length) { say("先に手でつかまってください（固定された手首が必要です）。", true); return; }
  let dy = -1e9;
  for (const s of holds){
    const w = S.pins[IX[s + "_wrist"]], sh = S.P[IX[s + "_shoulder"]];
    const L = (len(sub(S.P[IX[s + "_elbow"]], sh)) + len(sub(S.P[IX[s + "_wrist"]], S.P[IX[s + "_elbow"]]))) * 0.97;
    const h = Math.hypot(w[0] - sh[0], w[2] - sh[2]); if (h >= L) continue;
    dy = Math.max(dy, w[1] - sh[1] - Math.sqrt(L*L - h*h));
  }
  if (dy < -1e8) return;
  remember();
  for (const n of ["r_ankle", "l_ankle"]) if (S.pins[IX[n]]) delete S.pins[IX[n]];
  moveAll([0, dy, 0], true); afterEdit(); draw();
  say("腕が伸びるまで体を下ろしました（足の固定は外しました）。");
}

// ---- wire action -----------------------------------------------------------------------------
function setWire(){
  const w = S.wire = Object.assign({on: false, joint: "chest", height: 300}, S.wire || {});
  w.on = $("scWire").checked; w.joint = $("scWireJ").value; w.height = +$("scWireH").value || 300;
  if (w.on){
    const p = S.P[IX[w.joint]];
    w.anchor = [p[0], w.height, p[2]]; w.length = Math.max(5, w.height - p[1]);
  }
}

// ---- adding things -----------------------------------------------------------------------------
function facingYaw(){ const f = bodyFront(); return Math.atan2(f[0], f[2]) * 180 / Math.PI; }
function addItem(key, hand){
  const def = PROPS_[key]; if (!def) return;
  remember();
  const it = {key, off: [0, 0, 0], rot: [0, 0, 0], scale: 1};
  if (def.place === "hand"){
    it.hand = hand === "l" ? "l" : "r";
    // one thing per hand: a new one replaces what that hand held
    S.items = (S.items || []).filter(o => !(PROPS_[o.key] && PROPS_[o.key].place === "hand" && o.hand === it.hand));
    S.hands[it.hand] = def.pose || "grip";
    if (def.grip2) S.hands[it.hand === "r" ? "l" : "r"] = def.pose2 || def.pose || "grip";
  } else if (def.place === "body"){
    S.items = (S.items || []).filter(o => !(PROPS_[o.key] && PROPS_[o.key].place === "body"));
    if (def.hands) Object.assign(S.hands, def.hands);
  } else {
    const c = S.P[IX.pelvis], fy = +(S.env && S.env.floorY) || 0;
    it.yaw = facingYaw();
    it.base = [c[0], fy, c[2]];
    if (def.mount && def.mount.pelvis){         // the seat goes under the pelvis
      const m = rotY(def.mount.pelvis, deg(it.yaw)); it.base = [c[0] - m[0], fy, c[2] - m[2]];
    }
  }
  S.items.push(it); scSel = S.items.length - 1;
  if (def.place === "world" && def.mount) mountOn(it, true);
  afterEdit(); fillItemList(); draw();
  const where = def.place === "hand" ? (it.hand === "r" ? "右手に持たせました" : "左手に持たせました")
    : def.place === "grab" ? "置きました。手首か足首を選んで「つかまる」" : "置きました";
  say(`${def.ja}（${def.en}）を${where}。`);
}
function mountOn(it, quiet){                  // seat the pelvis, put the hands and feet on the mounts
  const def = PROPS_[it.key]; if (!def || !def.mount) return;
  if (!quiet) remember();
  const f = frameOf(it), m = def.mount;
  S.pins = S.pins || {};
  for (const jn of Object.keys(m)) delete S.pins[IX[jn]];
  if (m.pelvis) moveAll(sub(itemToWorld(it, m.pelvis, f), S.P[IX.pelvis]), true);
  for (const [jn, p] of Object.entries(m)){
    if (jn === "pelvis") continue;
    const i = IX[jn]; if (i === undefined) continue;
    const tg = itemToWorld(it, p, f);
    reachWith(i, tg, false);
    if (/ankle/.test(J[i])) flatFoot(J[i][0], tg[1] - CONTACT[J[i]]);
    if (def.place === "world") S.pins[i] = S.P[i].slice();
  }
  if (m.pelvis) S.pins[IX.pelvis] = S.P[IX.pelvis].slice();
  if (def.hands) Object.assign(S.hands, def.hands);
  else if (def.pose) for (const s of ["r", "l"]) if (m[s + "_wrist"]) S.hands[s] = def.pose;
  if (!quiet){ afterEdit(); draw(); say(`${def.ja}に体を合わせて、合わせた関節を固定しました。`); }
}

// ---- the panel ---------------------------------------------------------------------------------
let scSel = -1;
const ITEM_CTL = [["scSize", "大きさ", 30, 300, 1, "%"], ["scRx", "回転（前後に倒す）", -180, 180, 1, "°"],
  ["scRy", "回転（ひねる）", -180, 180, 1, "°"], ["scRz", "回転（横に倒す）", -180, 180, 1, "°"],
  ["scOx", "ずらす（左右）", -150, 150, 1, "cm"], ["scOy", "ずらす（上下）", -150, 150, 1, "cm"], ["scOz", "ずらす（前後）", -150, 150, 1, "cm"]];
function buildScenePanel(){
  const sec = document.createElement("section");
  const rng = ([id, label, mn, mx, st, unit]) => `<label>${label}</label><div class="row"><input type="range" id="${id}" min="${mn}" max="${mx}" step="${st}">
    <input type="number" class="num" id="${id}N" step="${st}"><span class="unit">${unit}</span></div>`;
  sec.innerHTML = `<h2>小物・環境（シミュレーション）</h2>
    <label>種類</label><select id="scCat">${CATS_.map(([k, ja, en]) => `<option value="${k}">${ja} / ${en}</option>`).join("")}</select>
    <select id="scKey" style="margin-top:6px"></select>
    <div class="btns" style="margin-top:6px"><button id="scAddR">右手に持つ・置く</button><button id="scAddL">左手に持つ</button></div>
    <div class="hint" id="scNote"></div>
    <label style="margin-top:10px">出ている物</label>
    <select id="scList" size="4"></select>
    <div class="btns" style="margin-top:6px"><button id="scDel">外す</button><button id="scMount">体を合わせる</button>
      <button id="scFlip">逆手にする</button><label style="display:inline;margin:0 0 0 4px"><input type="checkbox" id="scBoth" checked> 両手持ち</label></div>
    <div id="scItemCtl">${ITEM_CTL.map(rng).join("")}</div>
    <h2 style="margin-top:14px">床・壁・天井</h2>
    <div class="grid2">
      <label><input type="checkbox" id="scFloor"> 床</label><div class="row"><input type="number" class="num" id="scFloorY" step="1"><span class="unit">cm</span></div>
      <label><input type="checkbox" id="scCeil"> 天井</label><div class="row"><input type="number" class="num" id="scCeilY" step="1"><span class="unit">cm</span></div>
      <label><input type="checkbox" id="scWall"> 壁（奥行き）</label><div class="row"><input type="number" class="num" id="scWallZ" step="1"><span class="unit">cm</span></div>
      <label>壁の向き</label><div class="row"><input type="number" class="num" id="scWallYaw" step="5"><span class="unit">°</span></div>
    </div>
    <label>接地</label><select id="scGround"><option value="off">しない（宙に浮ける）</option>
      <option value="nopen">床・物体の上にめり込まない</option><option value="stick">いつも床・物体の上に着ける（一番低い所）</option></select>
    <label><input type="checkbox" id="scShow"> 書き出すアタリにも床・壁を描く</label>
    <div class="btns" style="margin-top:6px"><button id="scToFloor">床に着ける</button><button id="scToWall">壁に着ける</button>
      <button id="scToCeil">天井に着ける</button></div>
    <div class="btns" style="margin-top:6px"><button id="scGrab">近くの物につかまる</button><button id="scHang">ぶら下がる</button>
      <button id="scView">人物を画面の中心に</button></div>
    <label><input type="checkbox" id="scPull" checked> 届かないときは体ごと寄せる</label>
    <div class="hint">関節（手首・足首・膝・肘・腰）を選んでから押します。着けた所・つかんだ所は固定（ピン）になり、ほかを動かしても離れません。</div>
    <h2 style="margin-top:14px">ワイヤーアクション</h2>
    <label><input type="checkbox" id="scWire"> ワイヤーで吊る</label>
    <div class="grid2"><div><label>吊る所</label><select id="scWireJ">
      ${[["chest", "胸（ハーネス）"], ["pelvis", "腰"], ["r_wrist", "右手"], ["l_wrist", "左手"], ["r_ankle", "右足首（逆さ吊り）"], ["l_ankle", "左足首"]]
        .map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select></div>
      <div><label>支点の高さ</label><div class="row"><input type="number" class="num" id="scWireH" step="10" value="300"><span class="unit">cm</span></div></div></div>
    <div class="hint">オンにした時の位置の真上に支点ができます。腰をドラッグすると、ワイヤーの長さを保ったまま振れます。</div>`;
  const cam = document.getElementById("camReset").closest("section");
  cam.parentNode.insertBefore(sec, cam);
  const fillKeys = () => {
    const cat = $("scCat").value;
    $("scKey").innerHTML = Object.entries(PROPS_).filter(([, d]) => d.cat === cat)
      .map(([k, d]) => `<option value="${k}">${d.ja} / ${d.en}</option>`).join("");
    showNote();
  };
  const showNote = () => {
    const d = PROPS_[$("scKey").value]; if (!d) { $("scNote").textContent = ""; return; }
    const how = d.place === "hand" ? (d.grip2 ? "両手で持つ" : "片手で持つ") + "（手の形：" + (HAND_JA[d.pose] || d.pose) + "）"
      : d.place === "body" ? "体の前に構える（両手は自動で合わせる）" : d.place === "grab" ? "置いてから、手足でつかまる"
      : d.mount && Object.keys(d.mount).length ? "置くと体を合わせる（座る・乗る・手を置く）" : "床に置く";
    $("scNote").textContent = how + (d.note ? "。" + d.note : "");
    $("scAddL").style.display = d.place === "hand" ? "" : "none";
    $("scAddR").textContent = d.place === "hand" ? "右手に持つ" : "置く";
  };
  $("scCat").addEventListener("change", fillKeys);
  $("scKey").addEventListener("change", showNote);
  $("scAddR").addEventListener("click", () => addItem($("scKey").value, "r"));
  $("scAddL").addEventListener("click", () => addItem($("scKey").value, "l"));
  $("scList").addEventListener("change", () => { scSel = +$("scList").value; showItem(); draw(); });
  $("scDel").addEventListener("click", () => { if (scSel < 0 || !S.items[scSel]) return; remember();
    const it = S.items.splice(scSel, 1)[0], d = PROPS_[it.key];
    if (d && d.mount) for (const jn of Object.keys(d.mount)) if (S.pins) delete S.pins[IX[jn]];
    scSel = Math.min(scSel, S.items.length - 1); fillItemList(); draw(); });
  $("scMount").addEventListener("click", () => { const it = S.items[scSel]; if (it) mountOn(it); });
  $("scFlip").addEventListener("click", () => { const it = S.items[scSel]; if (!it) return; remember();
    it.rot[0] = ((it.rot[0] + 360) % 360) - 180; afterEdit(); showItem(); draw(); });
  $("scBoth").addEventListener("change", e => { const it = S.items[scSel]; if (!it) return; it.both = e.target.checked; afterEdit(); draw(); });
  const setters = {scSize: (it, v) => it.scale = v / 100, scRx: (it, v) => it.rot[0] = v, scRy: (it, v) => it.rot[1] = v,
    scRz: (it, v) => it.rot[2] = v, scOx: (it, v) => it.off[0] = v, scOy: (it, v) => it.off[1] = v, scOz: (it, v) => it.off[2] = v};
  for (const [id] of ITEM_CTL){
    const r = $(id), n = $(id + "N");
    const apply = v => { const it = S.items[scSel]; if (!it || !isFinite(v)) return; setters[id](it, v); afterEdit(); draw(); };
    r.addEventListener("pointerdown", remember);
    r.addEventListener("input", () => { n.value = r.value; apply(+r.value); });
    n.addEventListener("change", () => { remember(); r.value = n.value; apply(+n.value); });
  }
  // environment
  const env = () => { S.env = Object.assign(fresh().env, S.env || {}); return S.env; };
  for (const [id, key, num] of [["scFloor", "floor"], ["scCeil", "ceiling"], ["scWall", "wall"], ["scShow", "show"],
      ["scFloorY", "floorY", 1], ["scCeilY", "ceilingY", 1], ["scWallZ", "wallZ", 1], ["scWallYaw", "wallYaw", 1], ["scGround", "ground"]]){
    $(id).addEventListener("change", e => { remember(); const E = env();
      E[key] = num ? +e.target.value : e.target.type === "checkbox" ? e.target.checked : e.target.value;
      if (key === "ground" && E.ground !== "off" && !(S.solids || []).length) E.floor = true;
      afterEdit(); syncScene(); draw(); });
  }
  $("scToFloor").addEventListener("click", () => toSurface("床"));
  $("scToWall").addEventListener("click", () => toSurface("壁"));
  $("scToCeil").addEventListener("click", () => toSurface("天井"));
  $("scGrab").addEventListener("click", grab);
  $("scHang").addEventListener("click", hang);
  $("scView").addEventListener("click", () => { const c = S.P[IX.pelvis]; S.center = [c[0], c[1] - 5, c[2]]; draw(); });
  for (const id of ["scWire", "scWireJ", "scWireH"])
    $(id).addEventListener("change", () => { remember(); setWire(); afterEdit(); draw();
      say(S.wire.on ? `ワイヤーで${$("scWireJ").selectedOptions[0].textContent}を吊りました。` : "ワイヤーを外しました。"); });
  fillKeys();
}
function fillItemList(){
  const items = S.items || [];
  $("scList").innerHTML = items.map((it, n) => { const d = PROPS_[it.key] || {};
    const where = d.place === "hand" ? (it.hand === "r" ? "右手" : "左手") : d.place === "body" ? "構える" : "置く";
    return `<option value="${n}">${d.ja || it.key}（${where}）</option>`; }).join("");
  if (scSel >= items.length) scSel = items.length - 1;
  if (scSel >= 0) $("scList").value = String(scSel);
  showItem();
}
function showItem(){
  const it = (S.items || [])[scSel], d = it && PROPS_[it.key];
  $("scItemCtl").style.display = it ? "" : "none";
  $("scMount").style.display = d && d.mount && d.place !== "hand" ? "" : "none";
  $("scFlip").style.display = d && d.place === "hand" ? "" : "none";
  $("scBoth").parentNode.style.display = d && d.grip2 ? "inline" : "none";
  if (!it) return;
  $("scBoth").checked = it.both !== false;
  const vals = {scSize: Math.round((it.scale || 1) * 100), scRx: it.rot[0], scRy: it.rot[1], scRz: it.rot[2],
    scOx: it.off[0], scOy: it.off[1], scOz: it.off[2]};
  for (const [id, v] of Object.entries(vals)){ $(id).value = v; $(id + "N").value = Math.round(v); }
}
function syncScene(){
  const E = S.env = Object.assign(fresh().env, S.env || {});
  if (E.ground === true) E.ground = "stick"; else if (E.ground === false) E.ground = "off";
  $("scFloor").checked = !!E.floor; $("scCeil").checked = !!E.ceiling; $("scWall").checked = !!E.wall; $("scShow").checked = !!E.show;
  $("scFloorY").value = E.floorY; $("scCeilY").value = E.ceilingY; $("scWallZ").value = E.wallZ; $("scWallYaw").value = E.wallYaw;
  $("scGround").value = E.ground || "off";
  const w = S.wire || {}; $("scWire").checked = !!w.on; $("scWireJ").value = w.joint || "chest"; $("scWireH").value = w.height || 300;
  fillItemList();
}
buildScenePanel();
syncScene();
// the editor's undo / load / presets replace S: keep the panel in step
{ const sync0 = syncUI; syncUI = function(){ sync0(); syncScene(); }; }
draw();
