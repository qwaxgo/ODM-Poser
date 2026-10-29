// Solids around the figure (index.html, loaded after pose_scene.js): boxes standing for floors,
// walls, buildings and steps, and prisms, cylinders, pyramids, cones and poles. The figure stands
// on their tops when grounding is on (pose_scene.js asks solidTopsAt), and a selected joint can be
// put on their faces and pinned there. In the 配置 mode they are dragged on the floor (Shift: up
// and down) and turned with the wheel; the camera stays where it is.
//
// S.solids: {kind, pos: [x, y, z] (the middle of the base), size: [w, h, d] cm, yaw (degrees),
//            sides (prisms and pyramids)}
const SOLID_KINDS = {
  box:      {ja: "直方体（箱・台）", en: "Box", shape: "box", size: [100, 60, 60], at: [90, 0, 0]},
  floor:    {ja: "床（板）", en: "Floor slab", shape: "box", size: [300, 10, 300], at: [0, -10, 0]},
  wall:     {ja: "壁（板）", en: "Wall slab", shape: "box", size: [300, 250, 12], at: [0, 0, -80]},
  building: {ja: "建物", en: "Building", shape: "box", size: [400, 900, 400], at: [0, 0, -600]},
  step:     {ja: "段差", en: "Step", shape: "box", size: [120, 20, 40], at: [0, 0, 50]},
  prism:    {ja: "角柱", en: "Prism", shape: "prism", size: [60, 120, 60], sides: 6, at: [90, 0, 0]},
  cylinder: {ja: "円柱", en: "Cylinder", shape: "cyl", size: [60, 120, 60], at: [90, 0, 0]},
  pyramid:  {ja: "角錐", en: "Pyramid", shape: "pyr", size: [80, 100, 80], sides: 4, at: [100, 0, 0]},
  cone:     {ja: "円錐", en: "Cone", shape: "cone", size: [60, 100, 60], at: [90, 0, 0]},
  pole:     {ja: "支柱", en: "Pole", shape: "cyl", size: [10, 250, 10], at: [50, 0, 0]},
};
const solidKind = o => SOLID_KINDS[o.kind] || SOLID_KINDS.box;
let soSel = -1;

// ---- shape: corners, faces with outward planes (n . p <= d inside) ----------------------------------
function solidMesh(o){
  const k = solidKind(o), [w, h, d] = o.size.map(v => Math.max(1, +v || 1));
  const smooth = k.shape === "cyl" || k.shape === "cone", apex = k.shape === "pyr" || k.shape === "cone";
  const n = k.shape === "box" ? 4 : smooth ? 32 : Math.max(3, Math.min(24, Math.round(o.sides || k.sides || 6)));
  const ring = [];
  for (let i = 0; i < n; i++){
    if (n === 4 && !smooth) ring.push([[-1, 1, 1, -1][i] * w/2, [-1, -1, 1, 1][i] * d/2]);
    else { const a = 2 * Math.PI * i / n + Math.PI / 2; ring.push([Math.cos(a) * w/2, Math.sin(a) * d/2]); }
  }
  const a = deg(o.yaw || 0), at = (x, y, z) => add(o.pos, rotY([x, y, z], a));
  const V = ring.map(([x, z]) => at(x, 0, z));
  if (apex) V.push(at(0, h, 0)); else ring.forEach(([x, z]) => V.push(at(x, h, z)));
  const faces = [{v: ring.map((_, i) => i)}];
  if (!apex) faces.push({v: ring.map((_, i) => n + i)});
  const s0 = faces.length;
  for (let i = 0; i < n; i++){ const j = (i + 1) % n; faces.push({v: apex ? [i, j, n] : [i, j, n + j, n + i]}); }
  const c = mul(V.reduce((s, p) => add(s, p), [0, 0, 0]), 1 / V.length);
  for (const f of faces){
    const p = f.v.map(i => V[i]);
    let nn = norm(cross(sub(p[1], p[0]), sub(p[2], p[0])));
    if (dot(nn, sub(c, p[0])) > 0) nn = mul(nn, -1);
    f.n = nn; f.d = dot(nn, p[0]);
  }
  // edges with the two faces they join; the many sides of a round thing show only at its outline
  const edges = [];
  for (let i = 0; i < n; i++){
    const j = (i + 1) % n, side = s0 + i, prev = s0 + (i + n - 1) % n;
    edges.push({a: i, b: j, f: [0, side]});
    if (!apex) edges.push({a: n + i, b: n + j, f: [1, side]});
    edges.push({a: i, b: apex ? n : n + i, f: [prev, side], outline: smooth});
  }
  return {V, faces, edges};
}
// heights of the tops (or slopes) of the solids straight above / below p
function solidTopsAt(p){
  const out = [];
  for (const o of S.solids || []){
    let hi = Infinity, lo = -Infinity, inside = true;
    for (const f of solidMesh(o).faces){
      const ny = f.n[1], rest = f.d - f.n[0] * p[0] - f.n[2] * p[2];
      if (ny > 1e-6) hi = Math.min(hi, rest / ny);
      else if (ny < -1e-6) lo = Math.max(lo, rest / ny);
      else if (rest < -1e-6){ inside = false; break; }
    }
    if (inside && isFinite(hi) && hi >= lo - 1e-6) out.push(hi);
  }
  return out;
}
// the nearest point on a solid's surface, and that face's outward normal
function closestOnSolid(m, q){
  let best = null;
  for (const f of m.faces){
    const P = f.v.map(i => m.V[i]);
    let p = sub(q, mul(f.n, dot(f.n, q) - f.d));
    let pos = 0, neg = 0;
    for (let i = 0; i < P.length; i++){
      const s = dot(cross(sub(P[(i + 1) % P.length], P[i]), sub(p, P[i])), f.n);
      if (s > 1e-9) pos++; else if (s < -1e-9) neg++;
    }
    if (pos && neg){                          // outside the face: the nearest point on its rim
      let bd = Infinity, bp = p;
      for (let i = 0; i < P.length; i++){
        const a = P[i], ab = sub(P[(i + 1) % P.length], a);
        const t = Math.max(0, Math.min(1, dot(sub(q, a), ab) / (dot(ab, ab) || 1))), c = add(a, mul(ab, t));
        const dd = len(sub(c, q)); if (dd < bd){ bd = dd; bp = c; }
      }
      p = bp;
    }
    const dd = len(sub(p, q));
    if (!best || dd < best.d) best = {p, n: f.n, d: dd};
  }
  return best;
}

// ---- the camera's ray through a pixel of the front view ----------------------------------------
function pixelRay(x, y, W, H){
  const f = lensF(W, H), D = camDist(W, H);
  return {o: add(camRotInv([0, 0, D]), S.center), dir: camRotInv(norm([(x - W/2) / f, -(y - H/2) / f, -1]))};
}
function rayHit(m, r){                        // distance to where the ray enters the solid, or null
  let t0 = 0, t1 = Infinity;
  for (const f of m.faces){
    const dn = dot(f.n, r.dir), dist = f.d - dot(f.n, r.o);
    if (Math.abs(dn) < 1e-12){ if (dist < 0) return null; continue; }
    const t = dist / dn;
    if (dn < 0) t0 = Math.max(t0, t); else t1 = Math.min(t1, t);
    if (t0 > t1) return null;
  }
  return t0;
}
// dragging a thing by the point that was grabbed: over the floor, or up and down with Shift
function dragFrom(hit, W, H, apply){
  let last = hit.slice();
  return {move(x, y, e){
    const r = pixelRay(x, y, W, H);
    if (e.shiftKey){
      const nrm = norm([r.dir[0], 0, r.dir[2]]), dn = dot(nrm, r.dir);
      if (Math.abs(dn) < 1e-6) return;
      const t = dot(nrm, sub(last, r.o)) / dn, p = add(r.o, mul(r.dir, t));
      if (t <= 0) return;
      apply([0, p[1] - last[1], 0]); last = [last[0], p[1], last[2]];
    } else {
      if (Math.abs(r.dir[1]) < 1e-6) return;
      const t = (last[1] - r.o[1]) / r.dir[1];
      if (t <= 0 || t > 20000) return;
      const p = add(r.o, mul(r.dir, t));
      apply([p[0] - last[0], 0, p[2] - last[2]]); last = p;
    }
  }};
}

// ---- drawing: under the figure in the front view, in the side view with the scene --------------
function drawSolids(ctx, W, H, opts, proj, lw, toViewer){
  const list = S.solids || [];
  if (!list.length) return;
  ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
  list.forEach((o, k) => {
    const m = solidMesh(o), P = m.V.map(p => proj(p, W, H));
    const seen = m.faces.map(f => dot(f.n, toViewer(m.V[f.v[0]])) > 0);
    const color = !opts.export && k === soSel && mode === "place" ? cssVar("--sel") : o.color || (opts.export ? "#8a8a8a" : cssVar("--accent"));
    for (const hidden of [true, false]){
      if (hidden && opts.export) continue;
      ctx.strokeStyle = color; ctx.lineWidth = hidden ? Math.max(1, lw * 0.5) : lw * 0.9;
      ctx.globalAlpha = hidden ? 0.3 : 0.9; ctx.setLineDash(hidden ? [lw * 3, lw * 3] : []);
      ctx.beginPath();
      for (const e of m.edges){
        const v0 = seen[e.f[0]], v1 = seen[e.f[1]];
        if (e.outline && v0 === v1) continue;
        if ((v0 || v1) === hidden) continue;
        ctx.moveTo(P[e.a].x, P[e.a].y); ctx.lineTo(P[e.b].x, P[e.b].y);
      }
      ctx.stroke();
    }
  });
  ctx.restore();
}
function eyePoint(W, H){ return add(camRotInv([0, 0, camDist(W, H)]), S.center); }
{ const atari0 = drawAtari;
  drawAtari = function(ctx, W, H, opts = {}){
    if (!opts.export || (S.env && S.env.show)){
      const eye = eyePoint(W, H);
      drawSolids(ctx, W, H, opts, project, Math.max(1.5, W / 540), p => sub(eye, p));
    }
    atari0(ctx, W, H, opts);
  };
}
{ const scene0 = drawScene;
  drawScene = function(ctx, W, H, opts, proj, ink, far, lw){
    if (opts.side){ const right = camRotInv([1, 0, 0]); drawSolids(ctx, W, H, opts, proj, lw, () => right); }
    scene0(ctx, W, H, opts, proj, ink, far, lw);
  };
}

// ---- 配置 mode: grab a solid (the joints' circles come first), the wheel turns it ----------------
function solidUnder(x, y){
  const r = pixelRay(x, y, front.width, front.height);
  let best = -1, bt = Infinity;
  (S.solids || []).forEach((o, k) => { const t = rayHit(solidMesh(o), r); if (t !== null && t < bt){ bt = t; best = k; } });
  return best < 0 ? null : {k: best, hit: add(r.o, mul(r.dir, bt))};
}
DOWN_HOOKS.push((cv, x, y) => {
  if (mode !== "place" || cv !== front || pick(cv, x, y) >= 0) return null;
  const u = solidUnder(x, y); if (!u) return null;
  soSel = u.k; syncSolids();
  return dragFrom(u.hit, cv.width, cv.height, dlt => {
    const o = S.solids[u.k]; o.pos = add(o.pos, dlt); afterEdit(); syncSolids(); });
});
WHEEL_HOOKS.push((x, y, step, e) => {
  if (mode !== "place") return false;
  const u = solidUnder(x, y); if (!u) return false;
  remember(); soSel = u.k;
  const o = S.solids[u.k]; o.yaw = (((o.yaw || 0) + step * (e.shiftKey ? 15 : 5)) + 540) % 360 - 180;
  afterEdit(); syncSolids(); return true;
});

// ---- adding, contact, standing on top -----------------------------------------------------------
function solidName(o){ return solidKind(o).ja.replace(/（.*$/, ""); }
function addSolid(kind){
  const k = SOLID_KINDS[kind]; if (!k) return;
  remember();
  const c = S.P[IX.pelvis], fy = S.env && S.env.floor ? +S.env.floorY || 0 : 0;
  const o = {kind, pos: [Math.round(c[0] + k.at[0]), fy + k.at[1], Math.round(c[2] + k.at[2])], size: k.size.slice(), yaw: 0};
  if (k.sides) o.sides = k.sides;
  S.solids = S.solids || []; S.solids.push(o); soSel = S.solids.length - 1;
  afterEdit(); syncSolids(); draw();
  say(`${k.ja}を置きました。配置モードでドラッグして動かせます。`);
}
function targetSolid(q){                      // the selected solid, else the one nearest to q
  const list = S.solids || [];
  if (soSel >= 0 && list[soSel]) return {k: soSel, c: closestOnSolid(solidMesh(list[soSel]), q)};
  let best = null;
  list.forEach((o, k) => { const c = closestOnSolid(solidMesh(o), q); if (c && (!best || c.d < best.c.d)) best = {k, c}; });
  return best;
}
function touchSolid(){
  const i = sel;
  if (i < 0 || !PINNABLE.has(J[i])) { say("先に手首・足首・膝・肘・腰のどれかを選んでください。", true); return; }
  if (!(S.solids || []).length) { say("物体を先に置いてください。", true); return; }
  const t = targetSolid(S.P[i]); if (!t || !t.c) return;
  remember();
  const off = CONTACT[J[i]] || 3, cur = S.P[i], target = add(t.c.p, mul(t.c.n, off));
  if (i === IX.pelvis) moveAll(sub(target, cur), true);
  else if (IK_END[J[i]]) reachWith(i, target, $("scPull").checked);
  else rotateSubtree(i, add(S.P[PARENT[i]], mul(norm(sub(target, S.P[PARENT[i]])), len(sub(cur, S.P[PARENT[i]])))));
  if (/ankle/.test(J[i]) && t.c.n[1] > 0.7) flatFoot(J[i][0], target[1] - off);
  if (/wrist/.test(J[i])) S.hands[J[i][0]] = "open";
  S.pins = S.pins || {}; S.pins[i] = S.P[i].slice();
  afterEdit(i); draw();
  say(`${J_JA[J[i]]}を${solidName(S.solids[t.k])}に着けて固定しました。`);
}
function standOnSolid(){
  const list = S.solids || [];
  const o = list[soSel]; if (!o) { say("物体を一覧かドラッグで選んでください。", true); return; }
  const tops = solidTopsAt(o.pos); if (!tops.length) return;
  remember();
  S.pins = {};
  const c = S.P[IX.pelvis];
  moveAll([o.pos[0] - c[0], 0, o.pos[2] - c[2]], true);
  moveAll([0, Math.max(...tops) - lowest(), 0], true);
  afterEdit(); draw();
  say(`${solidName(o)}の上に立たせました（関節の固定は外しました）。`);
}

// ---- the panel ------------------------------------------------------------------------------------
const SOLID_CTL = [["soW", "幅", 0], ["soH", "高さ", 1], ["soD", "奥行き", 2], ["soSides", "角の数"],
  ["soX", "位置（左右）", 0], ["soY", "位置（上下）", 1], ["soZ", "位置（前後）", 2], ["soYaw", "向き"]];
function buildSolidPanel(){
  const sec = document.createElement("section");
  const unit = id => id === "soSides" ? "" : id === "soYaw" ? "°" : "cm";
  sec.innerHTML = `<h2>物体（床・壁・建物・柱など）</h2>
    <select id="soKind">${Object.entries(SOLID_KINDS).map(([k, d]) => `<option value="${k}">${d.ja}</option>`).join("")}</select>
    <div class="btns" style="margin-top:6px"><button id="soAdd">置く</button></div>
    <label style="margin-top:10px">置いた物体</label>
    <select id="soList" size="4"></select>
    <div class="btns" style="margin-top:6px"><button id="soDel">外す</button><button id="soDup">複製</button></div>
    <div id="soCtl" class="grid2" style="margin-top:6px">${SOLID_CTL.map(([id, label]) =>
      `<div id="${id}Box"><label>${label}</label><div class="row"><input type="number" id="${id}" step="${id === "soSides" ? 1 : 5}"><span class="unit">${unit(id)}</span></div></div>`).join("")}</div>
    <div class="row" id="soColorRow" style="margin-top:6px"><label style="margin:0;flex:1"><input type="checkbox" id="soColorOn"> 線の色を変える</label>
      <input type="color" id="soColor" value="#e0605a" style="width:52px;height:24px;padding:0;border:none;background:none"></div>
    <div class="btns" style="margin-top:8px"><button id="soTouch">選んだ関節を着ける</button><button id="soStand">この上に立つ</button></div>
    <div class="hint">配置モードで物体をドラッグすると床の上で動きます（Shift＋ドラッグで上下、ホイールで向き）。「接地」をオンにすると物体の上にも立ちます（40cm までの段は乗り上げます）。「選んだ関節を着ける」は、選んだ物体（選んでいなければ一番近い物体）の面に関節を着けて固定します。書き出すアタリに描くかは「書き出すアタリにも床・壁を描く」に従います。</div>`;
  const scene = $("scCat").closest("section");
  scene.parentNode.insertBefore(sec, scene.nextSibling);
  $("soAdd").addEventListener("click", () => addSolid($("soKind").value));
  $("soList").addEventListener("change", () => { soSel = +$("soList").value; syncSolids(); draw(); });
  $("soDel").addEventListener("click", () => { if (!S.solids || !S.solids[soSel]) return; remember();
    S.solids.splice(soSel, 1); soSel = Math.min(soSel, S.solids.length - 1); afterEdit(); syncSolids(); draw(); });
  $("soDup").addEventListener("click", () => { const o = S.solids && S.solids[soSel]; if (!o) return; remember();
    const c = JSON.parse(JSON.stringify(o)); c.pos = add(c.pos, [o.size[0] + 20, 0, 0]);
    S.solids.push(c); soSel = S.solids.length - 1; afterEdit(); syncSolids(); draw(); });
  for (const [id, , k] of SOLID_CTL){
    $(id).addEventListener("change", e => {
      const o = S.solids && S.solids[soSel], v = +e.target.value; if (!o || !isFinite(v)) return;
      remember();
      if (id === "soW" || id === "soH" || id === "soD") o.size[k] = Math.max(1, v);
      else if (id === "soSides") o.sides = Math.max(3, Math.min(24, Math.round(v)));
      else if (id === "soYaw") o.yaw = v;
      else { o.pos = o.pos.slice(); o.pos[k] = v; }
      afterEdit(); syncSolids(); draw();
    });
  }
  const setColor = () => { const o = S.solids && S.solids[soSel]; if (!o) return; remember();
    o.color = $("soColorOn").checked ? $("soColor").value : undefined; draw(); };
  $("soColorOn").addEventListener("change", setColor);
  $("soColor").addEventListener("input", () => { $("soColorOn").checked = true; setColor(); });
  $("soTouch").addEventListener("click", touchSolid);
  $("soStand").addEventListener("click", standOnSolid);
}
function syncSolids(){
  const list = S.solids = S.solids || [];
  if (soSel >= list.length) soSel = list.length - 1;
  $("soList").innerHTML = list.map((o, k) => `<option value="${k}">${k + 1}. ${solidKind(o).ja}</option>`).join("");
  if (soSel >= 0) $("soList").value = String(soSel);
  const o = list[soSel];
  $("soCtl").style.display = $("soColorRow").style.display = o ? "" : "none";
  if (!o) return;
  $("soColorOn").checked = !!o.color; if (o.color) $("soColor").value = o.color;
  const sh = solidKind(o).shape;
  $("soSidesBox").style.display = sh === "prism" || sh === "pyr" ? "" : "none";
  const vals = {soW: o.size[0], soH: o.size[1], soD: o.size[2], soSides: o.sides || solidKind(o).sides || 4,
    soX: o.pos[0], soY: o.pos[1], soZ: o.pos[2], soYaw: o.yaw || 0};
  for (const [id, v] of Object.entries(vals)) if (document.activeElement !== $(id)) $(id).value = Math.round(v);
}
buildSolidPanel();
syncSolids();
{ const sync0 = syncUI; syncUI = function(){ sync0(); syncSolids(); }; }
