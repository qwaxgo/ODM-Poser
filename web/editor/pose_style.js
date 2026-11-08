// Line colours and auras (index.html, loaded after pose_solids.js).
// S.colors: {parts: {head, torso, r_arm, l_arm, r_hand, l_hand, r_leg, l_leg: "#rrggbb"}, floor, wall,
//   ceiling, env (the three at once, older poses), wire}. A part without a colour keeps the editor's
//   ink (drawAtari asks partColor). Every line colour is set here, in one place: the figure's parts,
//   the floor / wall / ceiling, the wire, and each thing's, solid's and aura's own colour (it.color,
//   o.color, a.color), listed below them.
// S.auras: [{part, kind: "flame" | "glow" | "plasma", size (cm), color, even, sharp, round, angle,
//   height, thick, fine, spread, density}]: an aura around the whole body or some of its parts, drawn
//   as a screen-space hull of the joints' circles; flames and glow lie behind the figure, plasma
//   crackles in front. Drawn in the exported rough too. even (全身): a standing cylinder round the
//   body instead, so it is as wide from every side. The shape: sharp (the tongues' points), round
//   (toward an oval), angle (where the flames lean), height, thick (the lines); plasma: fine (the
//   bolts' zigzag), spread (how far they jump out), density (how many). Numbers in %, angle in deg.
const PART_NAMES = [["head", "頭"], ["torso", "胴体"], ["r_arm", "右腕"], ["l_arm", "左腕"], ["r_hand", "右手"],
  ["l_hand", "左手"], ["r_leg", "右脚"], ["l_leg", "左脚"]];
const AURA_PARTS = {
  body: ["全身", [["pelvis", "waist", "chest", "neck", "head", "r_shoulder", "r_elbow", "r_wrist", "l_shoulder", "l_elbow", "l_wrist",
    "r_hip", "r_knee", "r_ankle", "r_toe", "l_hip", "l_knee", "l_ankle", "l_toe", "r_hand", "l_hand"]]],
  upper: ["上半身", [["pelvis", "waist", "chest", "neck", "head", "r_shoulder", "r_elbow", "r_wrist", "l_shoulder", "l_elbow", "l_wrist", "r_hand", "l_hand"]]],
  head: ["頭", [["neck", "head"]]],
  arms: ["両腕", [["r_shoulder", "r_elbow", "r_wrist", "r_hand"], ["l_shoulder", "l_elbow", "l_wrist", "l_hand"]]],
  r_arm: ["右腕", [["r_shoulder", "r_elbow", "r_wrist", "r_hand"]]], l_arm: ["左腕", [["l_shoulder", "l_elbow", "l_wrist", "l_hand"]]],
  hands: ["両手（拳）", [["r_wrist", "r_hand"], ["l_wrist", "l_hand"]]],
  r_hand: ["右手（拳）", [["r_wrist", "r_hand"]]], l_hand: ["左手（拳）", [["l_wrist", "l_hand"]]],
  legs: ["両脚", [["r_hip", "r_knee", "r_ankle", "r_toe"], ["l_hip", "l_knee", "l_ankle", "l_toe"]]],
  r_leg: ["右脚", [["r_hip", "r_knee", "r_ankle", "r_toe"]]], l_leg: ["左脚", [["l_hip", "l_knee", "l_ankle", "l_toe"]]]};
const AURA_KINDS = {flame: ["気（炎のように立ちのぼる）", "#ffd84a"], glow: ["オーラ（なめらかな光）", "#7fd6ff"],
  plasma: ["プラズマ（電撃）", "#c38bff"]};

// ---- the hull: circles round the joints (and the middle of the fist), sampled on screen ------------
function auraPoint(name){                     // a joint, or "r_hand": the middle of the fist
  if (name.endsWith("_hand")){ const s = name[0], w = S.P[IX[s + "_wrist"]], h = S.P[IX[s + "_hand"]];
    return {p: add(w, mul(sub(h, w), 0.9)), r: 6}; }
  return {p: S.P[IX[name]], r: S.R[IX[name]] || 4};
}
function convexHull(pts){
  const q = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const p of q){ while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of q.reverse()){ while (hi.length > 1 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}
function auraHull(chain, margin, W, H){
  const pts = [], items = chain.map(auraPoint);
  const ring = (p, r) => { const s = project(p, W, H), R = (r + margin) * s.s;
    for (let k = 0; k < 16; k++){ const t = 2 * Math.PI * k / 16; pts.push([s.x + R * Math.cos(t), s.y + R * Math.sin(t)]); } };
  items.forEach((a, i) => { ring(a.p, a.r);
    const b = items[i + 1]; if (b) for (const t of [0.33, 0.66]) ring(add(a.p, mul(sub(b.p, a.p), t)), a.r + (b.r - a.r) * t); });
  return convexHull(pts);
}
// the hull walked at an even step: points with their outward normals
function resample(hull, n){
  const L = hull.map((p, i) => Math.hypot(hull[(i + 1) % hull.length][0] - p[0], hull[(i + 1) % hull.length][1] - p[1]));
  const total = L.reduce((a, b) => a + b, 0), out = [];
  let i = 0, acc = 0;
  for (let k = 0; k < n; k++){
    const d = total * k / n;
    while (acc + L[i] < d && i < hull.length - 1){ acc += L[i]; i++; }
    const a = hull[i], b = hull[(i + 1) % hull.length], t = L[i] ? (d - acc) / L[i] : 0;
    const dx = (b[0] - a[0]) / (L[i] || 1), dy = (b[1] - a[1]) / (L[i] || 1);
    out.push({x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, nx: dy, ny: -dx});
  }
  return out;
}
function seeded(n){ let s = 1234567 + n * 7919; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }

// 全身 as wide from every side: a standing cylinder round the body (its middle the pelvis, its
// radius the farthest joint across), from below the lowest joint to above the head, on screen
function evenHull(margin, W, H){
  const c = S.P[IX.pelvis]; let r = 0, lo = 1e9, hi = -1e9;
  S.P.forEach((p, i) => { r = Math.max(r, Math.hypot(p[0] - c[0], p[2] - c[2]) + (S.R[i] || 4) * 0.6);
    lo = Math.min(lo, p[1] - (S.R[i] || 4)); hi = Math.max(hi, p[1] + (S.R[i] || 4)); });
  r += margin; lo -= margin * 0.5; hi += margin;
  const pts = [];
  for (let k = 0; k <= 6; k++){ const y = lo + (hi - lo) * k / 6;
    for (let n = 0; n < 24; n++){ const t = 2 * Math.PI * n / 24, s = project([c[0] + r * Math.cos(t), y, c[2] + r * Math.sin(t)], W, H); pts.push([s.x, s.y]); } }
  return convexHull(pts);
}
// round: toward the oval that fits the outline; tall: stretched up from its bottom (1 = as is)
function shapeAura(pts, round, tall){
  if (!round && tall === 1) return pts;
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (const p of pts){ x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2 || 1, ry = (y1 - y0) / 2 || 1;
  return pts.map(p => {
    const t = Math.atan2((p.y - cy) / ry, (p.x - cx) / rx), ex = cx + rx * Math.cos(t), ey = cy + ry * Math.sin(t);
    const x = p.x + (ex - p.x) * round, y = y1 + (p.y + (ey - p.y) * round - y1) * tall;
    const nx = p.nx + (Math.cos(t) - p.nx) * round, ny = p.ny + (Math.sin(t) - p.ny) * round, l = Math.hypot(nx, ny) || 1;
    return {x, y, nx: nx / l, ny: ny / l};
  });
}
let flatAura = false;                         // lines only (the composition on a clear background)
function drawAura(ctx, a, idx, W, H, front){
  const kind = AURA_KINDS[a.kind] ? a.kind : "flame", col = a.color || AURA_KINDS[kind][1];
  const extra = AURA_KINDS[kind][2] || {};    // a mod's kind: {front, draw, margin} (pose_api.js)
  if ((kind === "plasma" || !!extra.front) !== front) return;
  const chains = (AURA_PARTS[a.part] || AURA_PARTS.body)[1], lw = Math.max(1.2, W / 600);
  const sPx = project(S.P[IX.chest], W, H).s, size = (+a.size || 14) * sPx;
  const P_ = (k, d) => (a[k] === undefined || a[k] === "" ? d : +a[k]) / 100;
  const sharp = P_("sharp", 50), round = P_("round", 0), tall = P_("height", 100), tw = P_("thick", 100);
  const fine = P_("fine", 50), spread = P_("spread", 50), dens = P_("density", 50), lean = deg(+a.angle || 0);
  const even = a.even && (a.part || "body") === "body";
  (even ? [null] : chains).forEach((chain, ci) => {
    const margin = extra.draw ? extra.margin : kind === "plasma" ? 0.4 : 0.6;
    const hull = even ? evenHull((+a.size || 14) * margin, W, H) : auraHull(chain, (+a.size || 14) * margin, W, H);
    if (hull.length < 3) return;
    const rnd = seeded(idx * 31 + ci), pts = shapeAura(resample(hull, kind === "flame" ? 56 : 72), round, tall);
    const lwA = lw * tw;
    if (extra.draw){
      ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineJoin = "round"; ctx.lineCap = "round";
      extra.draw(ctx, {points: pts, hull, size, color: col, lineWidth: lwA, random: rnd, W, H});
      ctx.restore(); return;
    }
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineJoin = "round"; ctx.lineCap = "round";
    if (kind === "flame"){
      // tongues: long where the outline faces the way they lean (up, turned by angle); two layers.
      // sharp: how far the outline dips between the tongues (0: a smooth swell, 100: thin points)
      const ux = Math.sin(lean), uy = -Math.cos(lean);
      ctx.lineJoin = sharp > 0.6 ? "miter" : "round";
      // 放物線: the origin is the bottom centre of the base (raised by origin, a share of the size); each
      // tongue points away from it, and its length falls off in a parabola toward the base's ends
      const xs = pts.map(q => q.x), ys = pts.map(q => q.y), half = Math.max(1, (Math.max(...xs) - Math.min(...xs)) / 2);
      const ox = (Math.max(...xs) + Math.min(...xs)) / 2, oy = Math.max(...ys) - (a.origin === undefined ? 0 : (+a.origin / 100)) * size;
      for (const [k, alpha, fill] of [[1, 0.9, 0.16], [0.55, 0.6, 0.1]]){
        ctx.beginPath();
        pts.forEach((p, i) => {
          const tip = i % 2 === 0;
          let x, y;
          if (a.para){
            const dx = p.x - ox, dy = p.y - oy, dl = Math.hypot(dx, dy) || 1, ex = dx / dl, ey = dy / dl;
            const t = Math.max(-1, Math.min(1, dx / half)), len = size * k * Math.max(0.15, 1 - 0.7 * t * t) * (tip ? 0.6 + 0.6 * rnd() : 0.15);
            x = p.x + ex * len; y = p.y + ey * len;
          } else {
          const up = Math.max(0, p.nx * ux + p.ny * uy), rise = 0.35 + 1.5 * up * up;
          const h = tip ? size * k * rise * (0.6 + 0.6 * rnd()) : size * k * (0.12 + (1 - sharp) * 0.6 * rise);
          x = p.x + p.nx * h * 0.6 + (tip ? h * up * 0.9 * ux : 0); y = p.y + p.ny * h * 0.6 + (tip ? h * up * 0.9 * uy : 0);
          }
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        });
        ctx.closePath(); if (!flatAura){ ctx.globalAlpha = fill; ctx.fill(); } ctx.globalAlpha = alpha; ctx.lineWidth = lwA * 1.3; ctx.stroke();
      }
    } else if (kind === "glow"){
      for (const [grow, alpha, w] of [[0, 0.85, 1.4], [size * 0.18, 0.4, 2.5], [size * 0.36, 0.18, 4]]){
        ctx.beginPath();
        pts.forEach((p, i) => { const x = p.x + p.nx * grow, y = p.y + p.ny * grow; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
        ctx.closePath(); ctx.globalAlpha = alpha; ctx.lineWidth = lwA * w; ctx.stroke();
      }
      if (!flatAura){ ctx.globalAlpha = 0.1; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath(); ctx.fill(); }
    } else {
      // plasma: bolts that jump along and across the outline
      // density: how many bolts; fine: more, smaller zigzags; spread: how far out they arc and jump
      const many = even || chains.length > 1 ? 4 : 10 * Math.min(1, chain.length / 8);
      const bolts = Math.max(1, Math.round((6 + many) * dens * 2));
      const steps = Math.max(3, Math.round(3 + fine * 8)), jitK = 0.7 * (1.4 - fine * 0.8), reach = Math.round(2 + spread * 12);
      for (let b = 0; b < bolts; b++){
        const i = Math.floor(rnd() * pts.length), j = (i + 2 + Math.floor(rnd() * reach)) % pts.length;
        const A = pts[i], Bp = pts[j];
        ctx.beginPath();
        for (let s = 0; s <= steps; s++){
          const t = s / steps, jit = s && s < steps ? (rnd() - 0.5) * size * jitK : 0, bulge = Math.sin(Math.PI * t) * size * 0.7 * spread;
          const nx = (A.nx + Bp.nx) / 2, ny = (A.ny + Bp.ny) / 2;
          const x = A.x + (Bp.x - A.x) * t + nx * bulge + jit, y = A.y + (Bp.y - A.y) * t + ny * bulge + jit * 0.7;
          s ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.globalAlpha = 0.25; ctx.lineWidth = lwA * 4; ctx.stroke();
        ctx.globalAlpha = 0.95; ctx.lineWidth = lwA * 1.1; ctx.stroke();
      }
    }
    ctx.restore();
  });
}
{ const atari0 = drawAtari;
  // every figure's auras (pose_cast.js swaps each one in); none when the composition leaves them out
  const each = fn => (typeof everyFigure === "function" ? everyFigure(fn) : fn(true, true));
  drawAtari = function(ctx, W, H, opts = {}){
    flatAura = !!opts.flat;
    if (!opts.noAuras) each(() => (S.auras || []).forEach((a, i) => drawAura(ctx, a, i, W, H, false)));
    atari0(ctx, W, H, opts);
    if (!opts.noAuras) each(() => (S.auras || []).forEach((a, i) => drawAura(ctx, a, i, W, H, true)));
  };
}

// ---- the panel ------------------------------------------------------------------------------------
// the aura's shape: [id, label, min, max, unit, default, the kinds it is for]
const AU_SHAPE = [["auOrigin", "放物線の原点の高さ（根元の底辺から）", -50, 150, "%", 0, "flame"], ["auSharp", "とがり（炎の先）", 0, 100, "%", 50, "flame"], ["auRound", "丸み（楕円に近づける）", 0, 100, "%", 0, ""],
  ["auAngle", "なびく向き（炎の傾き）", -60, 60, "°", 0, "flame"], ["auHeight", "高さ", 50, 250, "%", 100, ""], ["auThick", "線の太さ", 30, 300, "%", 100, ""],
  ["auFine", "細かさ（稲妻のギザギザ）", 0, 100, "%", 50, "plasma"], ["auSpread", "広がり（外へ飛ぶ量）", 0, 100, "%", 50, "plasma"],
  ["auDensity", "密度（稲妻の本数）", 10, 100, "%", 50, "plasma"]];
const AU_KEY = {auOrigin: "origin", auSharp: "sharp", auRound: "round", auAngle: "angle", auHeight: "height", auThick: "thick", auFine: "fine", auSpread: "spread", auDensity: "density"};
function auRead(){ const o = {even: $("auEven").checked, para: $("auPara").checked}; for (const [id] of AU_SHAPE) o[AU_KEY[id]] = +$(id).value; return o; }
function auWrite(a){ $("auEven").checked = !!a.even; $("auPara").checked = !!a.para;
  for (const [id, , , , , d] of AU_SHAPE){ const v = a[AU_KEY[id]] === undefined ? d : a[AU_KEY[id]]; $(id).value = v; $(id + "N").value = v; }
  auShow(); }
// only the controls for the kind chosen (炎: とがり・なびく向き; プラズマ: 細かさ・広がり・密度); 全身 for the even width
function auShow(){ const k = $("auKind").value;
  document.querySelectorAll("[data-au]").forEach(e => { e.style.display = e.dataset.au === k ? "" : "none"; });
  const ev = $("auEven").closest("label"); if (ev) ev.style.display = $("auPart").value === "body" ? "" : "none"; }
const colorRow = (id, label) => `<div class="row" style="margin-top:4px"><label style="margin:0;flex:1"><input type="checkbox" id="${id}On"> ${label}</label>
  <input type="color" id="${id}" value="#e0605a" ><input type="text" id="${id}Hex" class="hexin" maxlength="7" placeholder="#rrggbb" aria-label="${label}の色コード" inputmode="text"></div>`;
function buildStylePanel(){
  const sec = document.createElement("section");
  sec.innerHTML = `<h2>線の色</h2>
    <div class="btns"><button id="pcReset" title="線・床・壁・ワイヤー・小物・物体・オーラの色を、最初の色に戻す">↺ 色を初期状態に</button></div>
    <div class="hint">線・床・壁・天井・ワイヤー・小物・物体・オーラの色を、最初の色に戻します（「元に戻す」で取り消せます）。</div>
    <div class="row" style="margin-top:6px"><label style="margin:0;flex:1">対象</label><select id="clObj"></select></div>
    <div id="clRows" class="cl-rows"></div>
    <div class="hint">対象（人物・床・物・オーラなど）を選び、色を変えるものにチェックを入れて色を選ぶか、#rrggbb のコードを入力します。チェックしていないものは既定の色のままです（書き出すアタリ画像にも反映）。</div>
    <h2 style="margin-top:14px">オーラ・気をまとう</h2>
    <div class="grid2">
      <div><label>部位</label><select id="auPart">${Object.entries(AURA_PARTS).map(([k, [ja]]) => `<option value="${k}">${ja}</option>`).join("")}</select></div>
      <div><label>種類</label><select id="auKind">${Object.entries(AURA_KINDS).map(([k, [ja]]) => `<option value="${k}">${ja}</option>`).join("")}</select></div>
      <div><label>大きさ</label><div class="row"><input type="number" class="num" id="auSize" value="14" min="2" max="80" step="1"><span class="unit">cm</span></div></div>
      <div><label>色</label><input type="color" id="auColor" value="#ffd84a" style="width:100%"></div>
    </div>
    <label title="全身のときだけ。体を囲む立った円柱の形で描くので、横から見ても正面から見ても幅が同じ"><input type="checkbox" id="auEven"> どの角度でも同じ幅</label>
    <label data-au="flame" title="炎の先が、根元の底辺中心を原点として放射状に出て、長さが左右の端へ向けて放物線状に短くなる"><input type="checkbox" id="auPara"> 放物線（炎の先が根元の中心から放射状に）</label>
    ${AU_SHAPE.map(([id, ja, min, max, unit, , only]) => `<label${only ? ` data-au="${only}"` : ""}>${ja}</label>
      <div class="row"${only ? ` data-au="${only}"` : ""}><input type="range" id="${id}" min="${min}" max="${max}" step="1"><input type="number" class="num" id="${id}N" step="1"><span class="unit">${unit}</span></div>`).join("")}
    <div class="btns" style="margin-top:6px"><button id="auAdd">まとう</button></div>
    <label style="margin-top:8px">まとっているオーラ</label>
    <select id="auList" size="3"></select>
    <div class="btns" style="margin-top:6px"><button id="auDel">外す</button></div>
    <div class="hint">選んだオーラは、上の欄（部位・種類・大きさ・色）を変えると変わります。炎と光は人物の後ろに、プラズマは前に描きます。</div>`;
  const solids = $("soKind").closest("section");
  solids.parentNode.insertBefore(sec, solids.nextSibling);
  const colors = () => { S.colors = S.colors || {}; S.colors.parts = S.colors.parts || {}; return S.colors; };
  const bind = (id, get, set) => {
    const apply = () => { remember(); set($(id + "On").checked ? $(id).value : undefined); draw(); };
    $(id + "On").addEventListener("change", apply);
    $(id).addEventListener("input", () => { $(id + "On").checked = true; $(id + "Hex").value = $(id).value; apply(); });
    // the colour typed as #rrggbb (any case; a bad one is left alone)
    $(id + "Hex").addEventListener("change", () => { const v = $(id + "Hex").value.trim();
      if (!/^#[0-9a-f]{6}$/i.test(v)){ $(id + "Hex").value = $(id).value; say("色は #rrggbb の形で入れてください（例：#e0605a）。", true); return; }
      $(id).value = v.toLowerCase(); $(id + "On").checked = true; $(id + "Hex").value = $(id).value; apply(); });
  };
  $("pcReset").addEventListener("click", () => { remember(); S.colors = {parts: {}};
    for (const o of [...(S.items || []), ...(S.solids || [])]) delete o.color;
    for (const a of S.auras || []) delete a.color;
    syncStyle(); if (typeof syncUI === "function") syncUI(); draw(); });
  // the object picker and its rows (see renderCl): one delegated handler for the rows
  $("clObj").addEventListener("change", () => { clKey = $("clObj").value; clRowsKey = ""; renderCl(); });
  $("clRows").addEventListener("pointerdown", e => { if (e.target.type === "color") remember(); });
  $("clRows").addEventListener("input", e => { const t = e.target, k = t.dataset.cl || t.dataset.clhex; if (!k) return;
    if (t.type === "color"){ $("clRows").querySelector(`input[type=checkbox][data-cl="${k}"]`).checked = true; setClColor(k, t.value, true); } });
  $("clRows").addEventListener("change", e => { const t = e.target;
    if (t.type === "checkbox" && t.dataset.cl){ setClColor(t.dataset.cl, t.checked ? defClColor(t.dataset.cl) : undefined, false); return; }
    if (t.dataset.clhex){ const v = t.value.trim();
      if (!/^#[0-9a-f]{6}$/i.test(v)){ t.value = clColorOf(t.dataset.clhex) || defClColor(t.dataset.clhex); say("色は #rrggbb の形で入れてください（例：#e0605a）。", true); return; }
      setClColor(t.dataset.clhex, v.toLowerCase(), false); }
  });
  for (const [on] of [["scColorOn"], ["soColorOn"]]){ const row = $(on) && $(on).closest(".row"); if (!row) continue;
    row.style.display = "none";
    const go = document.createElement("div"); go.className = "btns";
    go.innerHTML = `<button type="button">線の色は「色」のタブで</button>`;
    go.firstChild.addEventListener("click", () => window.ODMUI && ODMUI.showMenu("colors")); row.after(go); }
  // auras
  const auSel = () => +$("auList").value;
  $("auKind").addEventListener("change", () => { $("auColor").value = AURA_KINDS[$("auKind").value][1]; editAura(); });
  const editAura = held => { auShow(); const a = (S.auras || [])[auSel()]; if (!a) return; if (!held) remember();
    Object.assign(a, {part: $("auPart").value, kind: $("auKind").value, size: +$("auSize").value || 14, color: $("auColor").value}, auRead());
    syncStyle(); draw(); };
  for (const id of ["auPart", "auSize", "auEven", "auPara"]) $(id).addEventListener("change", editAura);
  for (const [id] of AU_SHAPE){
    $(id).addEventListener("pointerdown", () => remember());
    $(id).addEventListener("input", () => { $(id + "N").value = $(id).value; editAura(true); });
    $(id + "N").addEventListener("change", () => { $(id).value = $(id + "N").value; editAura(); }); }
  $("auColor").addEventListener("input", editAura);
  $("auAdd").addEventListener("click", () => { remember(); S.auras = S.auras || [];
    S.auras.push(Object.assign({part: $("auPart").value, kind: $("auKind").value, size: +$("auSize").value || 14, color: $("auColor").value}, auRead()));
    syncStyle(); $("auList").value = String(S.auras.length - 1); draw();
    say(`${AURA_PARTS[$("auPart").value][0]}に${AURA_KINDS[$("auKind").value][0]}をまといました。`); });
  $("auDel").addEventListener("click", () => { const i = auSel(); if (!(S.auras || [])[i]) return; remember(); S.auras.splice(i, 1); syncStyle(); draw(); });
  $("auList").addEventListener("change", () => { const a = S.auras[auSel()]; if (!a) return;
    $("auPart").value = a.part; $("auKind").value = a.kind; $("auSize").value = a.size; $("auColor").value = a.color || AURA_KINDS[a.kind][1]; auWrite(a); });
  auWrite({});
}
// 色の記憶: the line colours (S.colors: the figures' parts, the floor, walls, ceiling and the wire)
// kept under a name in this browser; loaded, they replace the current ones (undo takes it back)
const CS_KEY = KEY + "-colorsets";
function loadColorSets(){ try { const v = JSON.parse(localStorage.getItem(CS_KEY) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
function storeColorSets(list){
  try { localStorage.setItem(CS_KEY, JSON.stringify(list)); return true; }
  catch (e) { say("このブラウザには記憶できませんでした（容量か設定のため）。", true); return false; }
}
function buildColorSets(){
  const sec = document.createElement("section");
  sec.dataset.menu = "colors";
  sec.innerHTML = `<h2>色の記憶</h2>
    <div class="row"><input type="text" id="csName" placeholder="名前（例：夜の色）"><button type="button" id="csSave">記憶</button></div>
    <select id="csList" size="4"></select>
    <div class="btns"><button type="button" id="csLoad">呼び出す</button><button type="button" id="csDel">削除</button></div>
    <div class="hint">いまの線の色（人物・床・壁・天井・ワイヤー）を名前をつけて記憶し、呼び出せます。小物・物体・オーラの色は含みません。このブラウザに残ります。</div>`;
  $("pcReset").closest("section").after(sec);
  const fill = () => { const list = loadColorSets();
    $("csList").innerHTML = list.map((d, k) => `<option value="${k}">${esc(d.name)}</option>`).join("");
    $("csLoad").disabled = $("csDel").disabled = !list.length; };
  const load = () => { const list = loadColorSets(), d = list[+$("csList").value]; if (!d) return;
    remember(); S.colors = JSON.parse(JSON.stringify(d.colors || {})); S.colors.parts = S.colors.parts || {};
    syncStyle(); if (typeof syncUI === "function") syncUI(); draw(); say(`色「${d.name}」を呼び出しました。`); };
  $("csSave").addEventListener("click", () => {
    const list = loadColorSets(), name = ($("csName").value.trim() || `色${list.length + 1}`).slice(0, 60);
    const at = list.findIndex(d => d.name === name), d = {name, colors: JSON.parse(JSON.stringify(S.colors || {parts: {}}))};
    if (at >= 0) list[at] = d; else list.push(d);
    if (storeColorSets(list)){ $("csName").value = ""; fill(); $("csList").value = String(at >= 0 ? at : list.length - 1);
      say(`色「${name}」を記憶しました。`); }
  });
  $("csLoad").addEventListener("click", load);
  $("csList").addEventListener("dblclick", load);
  $("csDel").addEventListener("click", () => { const list = loadColorSets(), k = +$("csList").value; if (!list[k]) return;
    const [d] = list.splice(k, 1); if (storeColorSets(list)){ fill(); say(`色「${d.name}」を削除しました。`); } });
  fill();
}
// the things with a colour of their own: "i3" (S.items[3]), "s0" (S.solids[0]), "a1" (S.auras[1])
function thingOf(k){ const n = +k.slice(1); return ({i: S.items, s: S.solids, a: S.auras}[k[0]] || [])[n]; }
// the line colours by object (the picker 対象): the figure's parts, the floor, walls, ceiling and the
// wire, and each thing, solid and aura (their own colour). A colour not set (no check) is the default.
let clKey = "body", clRowsKey = "", clObjKey = "";
const CL_ENV = [["floor", "床"], ["wall", "壁"], ["ceiling", "天井"], ["wire", "ワイヤー"]];
function clObjects(){
  const P = window.PROPS || {}, out = [["body", "人物（体の部位）"], ...CL_ENV.map(([k, ja]) => [k, ja])];
  (S.items || []).forEach((it, n) => { const d = P[it.key] || {}; out.push(["i" + n, `小物：${d.ja || it.key}`]); });
  (S.solids || []).forEach((o, n) => out.push(["s" + n, `物体：${typeof solidName === "function" ? solidName(o) : o.kind}`]));
  (S.auras || []).forEach((a, n) => out.push(["a" + n, `オーラ：${(AURA_PARTS[a.part] || AURA_PARTS.body)[0]}・${(AURA_KINDS[a.kind] || AURA_KINDS.flame)[0]}`]));
  return out;
}
function defClColor(k){
  if (k[0] === "i") return ((window.PROPS || {})[(S.items || [])[+k.slice(1)] && S.items[+k.slice(1)].key] || {}).color || "#e0605a";
  if (k[0] === "s") return "#8a8a8a";
  if (k[0] === "a") { const a = (S.auras || [])[+k.slice(1)]; return a ? (AURA_KINDS[a.kind] || AURA_KINDS.flame)[1] : "#7fd6ff"; }
  return "#e0605a";
}
// the colour of one row's key: a part (head ...), an environment surface (floor ...), or a thing ("i0" ...)
function clColorOf(k){
  const c = S.colors || {};
  if (k[0] === "i" || k[0] === "s" || k[0] === "a"){ const o = thingOf(k); return o && o.color; }
  if (k === "wire") return c.wire;
  if (CL_ENV.some(([e]) => e === k)) return c[k] || (c.env && k !== "wire" ? c.env : undefined);
  return (c.parts || {})[k];
}
function setClColor(k, v, slide){
  if (!slide) remember();
  if (k[0] === "i" || k[0] === "s" || k[0] === "a"){ const o = thingOf(k); if (o){ if (v) o.color = v; else delete o.color; } }
  else if (k === "wire") S.colors = Object.assign({parts: {}}, S.colors || {}, {wire: v});
  else if (CL_ENV.some(([e]) => e === k)){ const c = S.colors = Object.assign({parts: {}}, S.colors || {}); c[k] = v; delete c.env; }
  else { const c = S.colors = Object.assign({parts: {}}, S.colors || {}); c.parts = c.parts || {};
    if (v) c.parts[k] = v; else delete c.parts[k]; }
  draw();
}
function renderCl(){
  const box = $("clRows"), sel = $("clObj"); if (!box || !sel) return;
  const objs = clObjects(), okey = JSON.stringify(objs);
  if (okey !== clObjKey){ clObjKey = okey; sel.innerHTML = objs.map(([k, n]) => `<option value="${k}">${esc(n)}</option>`).join(""); }
  if (!objs.some(([k]) => k === clKey)) clKey = "body";
  sel.value = clKey;
  const rows = clKey === "body" ? PART_NAMES.map(([k, ja]) => [k, ja])
    : [[clKey, (objs.find(([k]) => k === clKey) || [clKey, clKey])[1]]];
  const state = JSON.stringify(rows.map(([k]) => [k, clColorOf(k) || null]));
  if (state === clRowsKey) return; clRowsKey = state;
  // the same rows: their values change in place (rebuilt, the colour picker open on one would close)
  const keys = JSON.stringify(rows.map(([k]) => k));
  if (keys === box.dataset.keys){
    for (const [k] of rows){ const c = clColorOf(k), v = c || defClColor(k);
      const cb = box.querySelector(`input[type=checkbox][data-cl="${k}"]`), pk = box.querySelector(`input[type=color][data-cl="${k}"]`), hx = box.querySelector(`input[data-clhex="${k}"]`);
      if (cb) cb.checked = !!c;
      if (pk && pk.value !== v && document.activeElement !== pk) pk.value = v;
      if (hx && document.activeElement !== hx) hx.value = v; }
    return;
  }
  box.dataset.keys = keys;
  box.innerHTML = rows.map(([k, name]) => {
    const c = clColorOf(k), v = c || defClColor(k);
    return `<div class="row cl-row"><label style="margin:0;flex:1"><input type="checkbox" data-cl="${k}"${c ? " checked" : ""}> ${esc(name)}</label>
      <input type="color" data-cl="${k}" value="${v}" aria-label="${esc(name)}の色"><input type="text" class="hexin" data-clhex="${k}" value="${v}" maxlength="7" aria-label="${esc(name)}の色コード"></div>`;
  }).join("");
}
function syncThings(){ renderCl(); }
function syncStyle(){
  const c = S.colors = Object.assign({parts: {}}, S.colors || {}); c.parts = c.parts || {};
  // a colour that is not set shows the picker's own starting colour
  syncThings();
  const list = S.auras = S.auras || [], cur = $("auList").value;
  $("auList").innerHTML = list.map((a, i) => `<option value="${i}">${i + 1}. ${(AURA_PARTS[a.part] || AURA_PARTS.body)[0]}：${(AURA_KINDS[a.kind] || AURA_KINDS.flame)[0]}</option>`).join("");
  if (cur !== "" && list[+cur]) $("auList").value = cur;
  // the fields above the list show the chosen aura (after undo, redo, loading)
  const a = list[+$("auList").value];
  if ($("auList").value !== "" && a){ $("auPart").value = a.part; $("auKind").value = a.kind; $("auSize").value = a.size;
    $("auColor").value = a.color || AURA_KINDS[a.kind][1]; auWrite(a); }
}
buildStylePanel();
buildColorSets();
syncStyle();
{ const d0 = draw; draw = function(){ d0.apply(this, arguments); syncThings(); }; }
{ const sync0 = syncUI; syncUI = function(){ sync0(); syncStyle(); }; }
draw();
// i18n.js loads after this file: the table waits for it (ODMPoserI18nEarly)
(window.ODMPoserI18n || {add: t => (window.ODMPoserI18nEarly = window.ODMPoserI18nEarly || []).push(t)}).add({"床": "Floor", "壁": "Wall", "天井": "Ceiling", "小物・物体・オーラ": "Things, objects, auras",
  "線の色はすべてここで変えます。チェックしたものだけ色が変わります（書き出すアタリ画像にも）。": "Every line colour is set here. Only what is ticked changes (in the exported rough too).",
  "線の色は「色」のタブで": "Line colour: in the Colours tab", "まだありません。": "None yet.",
  "全身を、どの角度から見ても同じ横幅に": "Whole body: as wide from every side",
  "全身のときだけ。体を囲む立った円柱の形で描くので、横から見ても正面から見ても幅が同じ": "Whole body only. Drawn as a standing cylinder round the body, so it is as wide from the side as from the front",
  "とがり（炎の先）": "Sharpness (the flames' tips)", "丸み（楕円に近づける）": "Roundness (toward an oval)", "なびく向き（炎の傾き）": "Lean (the flames' angle)",
  "高さ": "Height", "線の太さ": "Line thickness", "細かさ（稲妻のギザギザ）": "Fineness (the bolts' zigzag)",
  "広がり（外へ飛ぶ量）": "Spread (how far they jump out)", "密度（稲妻の本数）": "Density (how many bolts)"});
