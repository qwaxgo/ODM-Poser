// Line colours and auras (index.html, loaded after pose_solids.js).
// S.colors: {parts: {head, torso, r_arm, l_arm, r_hand, l_hand, r_leg, l_leg: "#rrggbb"}, env, wire}
//   a part without a colour keeps the editor's ink (drawAtari asks partColor); things and solids
//   keep their own colour (it.color, o.color, set in their panels).
// S.auras: [{part, kind: "flame" | "glow" | "plasma", size (cm), color}]: an aura around the whole
//   body or some of its parts, drawn as a screen-space hull of the joints' circles; flames and glow
//   lie behind the figure, plasma crackles in front. Drawn in the exported rough too.
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

let flatAura = false;                         // lines only (the composition on a clear background)
function drawAura(ctx, a, idx, W, H, front){
  const kind = AURA_KINDS[a.kind] ? a.kind : "flame", col = a.color || AURA_KINDS[kind][1];
  const extra = AURA_KINDS[kind][2] || {};    // a mod's kind: {front, draw, margin} (pose_api.js)
  if ((kind === "plasma" || !!extra.front) !== front) return;
  const chains = (AURA_PARTS[a.part] || AURA_PARTS.body)[1], lw = Math.max(1.2, W / 600);
  const sPx = project(S.P[IX.chest], W, H).s, size = (+a.size || 14) * sPx;
  chains.forEach((chain, ci) => {
    const margin = extra.draw ? extra.margin : kind === "plasma" ? 0.4 : 0.6;
    const hull = auraHull(chain, (+a.size || 14) * margin, W, H);
    if (hull.length < 3) return;
    const rnd = seeded(idx * 31 + ci), pts = resample(hull, kind === "flame" ? 56 : 72);
    if (extra.draw){
      ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineJoin = "round"; ctx.lineCap = "round";
      extra.draw(ctx, {points: pts, hull, size, color: col, lineWidth: lw, random: rnd, W, H});
      ctx.restore(); return;
    }
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineJoin = "round"; ctx.lineCap = "round";
    if (kind === "flame"){
      // tongues: long where the outline faces up, leaning upward; two layers
      for (const [k, alpha, fill] of [[1, 0.9, 0.16], [0.55, 0.6, 0.1]]){
        ctx.beginPath();
        pts.forEach((p, i) => {
          const up = Math.max(0, -p.ny), tip = i % 2 === 0;
          const h = tip ? size * k * (0.35 + 1.5 * up * up) * (0.6 + 0.6 * rnd()) : size * k * 0.12;
          const x = p.x + p.nx * h * 0.6, y = p.y + p.ny * h * 0.6 - (tip ? h * up * 0.9 : 0);
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        });
        ctx.closePath(); if (!flatAura){ ctx.globalAlpha = fill; ctx.fill(); } ctx.globalAlpha = alpha; ctx.lineWidth = lw * 1.3; ctx.stroke();
      }
    } else if (kind === "glow"){
      for (const [grow, alpha, w] of [[0, 0.85, 1.4], [size * 0.18, 0.4, 2.5], [size * 0.36, 0.18, 4]]){
        ctx.beginPath();
        pts.forEach((p, i) => { const x = p.x + p.nx * grow, y = p.y + p.ny * grow; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
        ctx.closePath(); ctx.globalAlpha = alpha; ctx.lineWidth = lw * w; ctx.stroke();
      }
      if (!flatAura){ ctx.globalAlpha = 0.1; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath(); ctx.fill(); }
    } else {
      // plasma: bolts that jump along and across the outline
      const bolts = 6 + Math.round(chains.length > 1 ? 4 : 10 * Math.min(1, chain.length / 8));
      for (let b = 0; b < bolts; b++){
        const i = Math.floor(rnd() * pts.length), j = (i + 2 + Math.floor(rnd() * 8)) % pts.length;
        const A = pts[i], Bp = pts[j], steps = 7;
        ctx.beginPath();
        for (let s = 0; s <= steps; s++){
          const t = s / steps, jit = s && s < steps ? (rnd() - 0.5) * size * 0.7 : 0, bulge = Math.sin(Math.PI * t) * size * 0.35;
          const nx = (A.nx + Bp.nx) / 2, ny = (A.ny + Bp.ny) / 2;
          const x = A.x + (Bp.x - A.x) * t + nx * bulge + jit, y = A.y + (Bp.y - A.y) * t + ny * bulge + jit * 0.7;
          s ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.globalAlpha = 0.25; ctx.lineWidth = lw * 4; ctx.stroke();
        ctx.globalAlpha = 0.95; ctx.lineWidth = lw * 1.1; ctx.stroke();
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
const colorRow = (id, label) => `<div class="row" style="margin-top:4px"><label style="margin:0;flex:1"><input type="checkbox" id="${id}On"> ${label}</label>
  <input type="color" id="${id}" value="#e0605a" style="width:52px;height:24px;padding:0;border:none;background:none"></div>`;
function buildStylePanel(){
  const sec = document.createElement("section");
  sec.innerHTML = `<h2>線の色</h2>
    <div class="grid2">${PART_NAMES.map(([k, ja]) => `<div>${colorRow("pc_" + k, ja)}</div>`).join("")}</div>
    ${colorRow("pc_env", "床・壁・天井")}${colorRow("pc_wire", "ワイヤー")}
    <div class="btns" style="margin-top:6px"><button id="pcReset">すべて既定の色に戻す</button></div>
    <div class="hint">チェックした部位だけ色が変わります（書き出すアタリ画像にも）。小物と物体の色は、それぞれの欄で変えます。</div>
    <h2 style="margin-top:14px">オーラ・気をまとう</h2>
    <div class="grid2">
      <div><label>部位</label><select id="auPart">${Object.entries(AURA_PARTS).map(([k, [ja]]) => `<option value="${k}">${ja}</option>`).join("")}</select></div>
      <div><label>種類</label><select id="auKind">${Object.entries(AURA_KINDS).map(([k, [ja]]) => `<option value="${k}">${ja}</option>`).join("")}</select></div>
      <div><label>大きさ</label><div class="row"><input type="number" class="num" id="auSize" value="14" min="2" max="80" step="1"><span class="unit">cm</span></div></div>
      <div><label>色</label><input type="color" id="auColor" value="#ffd84a" style="width:100%;height:28px;padding:0;border:none;background:none"></div>
    </div>
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
    $(id).addEventListener("input", () => { $(id + "On").checked = true; apply(); });
  };
  for (const [k] of PART_NAMES) bind("pc_" + k, () => colors().parts[k], v => { if (v) colors().parts[k] = v; else delete colors().parts[k]; });
  bind("pc_env", () => colors().env, v => { colors().env = v; });
  bind("pc_wire", () => colors().wire, v => { colors().wire = v; });
  $("pcReset").addEventListener("click", () => { remember(); S.colors = {parts: {}}; syncStyle(); draw(); });
  // auras
  const auSel = () => +$("auList").value;
  $("auKind").addEventListener("change", () => { $("auColor").value = AURA_KINDS[$("auKind").value][1]; editAura(); });
  const editAura = () => { const a = (S.auras || [])[auSel()]; if (!a) return; remember();
    Object.assign(a, {part: $("auPart").value, kind: $("auKind").value, size: +$("auSize").value || 14, color: $("auColor").value});
    syncStyle(); draw(); };
  for (const id of ["auPart", "auSize"]) $(id).addEventListener("change", editAura);
  $("auColor").addEventListener("input", editAura);
  $("auAdd").addEventListener("click", () => { remember(); S.auras = S.auras || [];
    S.auras.push({part: $("auPart").value, kind: $("auKind").value, size: +$("auSize").value || 14, color: $("auColor").value});
    syncStyle(); $("auList").value = String(S.auras.length - 1); draw();
    say(`${AURA_PARTS[$("auPart").value][0]}に${AURA_KINDS[$("auKind").value][0]}をまといました。`); });
  $("auDel").addEventListener("click", () => { const i = auSel(); if (!(S.auras || [])[i]) return; remember(); S.auras.splice(i, 1); syncStyle(); draw(); });
  $("auList").addEventListener("change", () => { const a = S.auras[auSel()]; if (!a) return;
    $("auPart").value = a.part; $("auKind").value = a.kind; $("auSize").value = a.size; $("auColor").value = a.color || AURA_KINDS[a.kind][1]; });
}
function syncStyle(){
  const c = S.colors = Object.assign({parts: {}}, S.colors || {}); c.parts = c.parts || {};
  // a colour that is not set shows the picker's own starting colour
  const show = (id, v) => { $(id + "On").checked = !!v; $(id).value = v || $(id).defaultValue; };
  for (const [k] of PART_NAMES) show("pc_" + k, c.parts[k]);
  show("pc_env", c.env); show("pc_wire", c.wire);
  const list = S.auras = S.auras || [], cur = $("auList").value;
  $("auList").innerHTML = list.map((a, i) => `<option value="${i}">${i + 1}. ${(AURA_PARTS[a.part] || AURA_PARTS.body)[0]}：${(AURA_KINDS[a.kind] || AURA_KINDS.flame)[0]}</option>`).join("");
  if (cur !== "" && list[+cur]) $("auList").value = cur;
  // the fields above the list show the chosen aura (after undo, redo, loading)
  const a = list[+$("auList").value];
  if ($("auList").value !== "" && a){ $("auPart").value = a.part; $("auKind").value = a.kind; $("auSize").value = a.size;
    $("auColor").value = a.color || AURA_KINDS[a.kind][1]; }
}
buildStylePanel();
syncStyle();
{ const sync0 = syncUI; syncUI = function(){ sync0(); syncStyle(); }; }
draw();
