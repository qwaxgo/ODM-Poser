// 置く前のプレビュー (index.html, loaded after pose_style.js): while the 装備 or 設置 tab shows, the
// thing or object chosen in its list is drawn faintly where it would go, at the size set beside it,
// before 持つ・置く is pressed. The size set there is what it then gets (the thing's whole size and
// its three axes; the object's width, height and depth).
(() => {
const $ = id => document.getElementById(id);
const ctl = (id, label, min, max, step, unit, val) => `<label>${label}</label><div class="row"><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}">` +
  `<input type="number" class="num" id="${id}N" step="${step}" value="${val}"><span class="unit">${unit}</span></div>`;
const linkRange = id => { $(id).addEventListener("input", () => { $(id + "N").value = $(id).value; draw(); });
  $(id + "N").addEventListener("change", () => { $(id).value = $(id + "N").value; draw(); }); };

// ---- things (装備) ------------------------------------------------------------------------------------
const scBox = document.createElement("div");
scBox.className = "pv-box";
scBox.innerHTML = `<label title="持つ・置く前にプレビュー"><input type="checkbox" id="scPrevOn" checked> プレビュー</label>` +
  ctl("scPreSize", "大きさ（いちばん長い辺）", 1, 300, 0.5, "cm", 20) +
  ctl("scPreX", "X 方向（赤）", 1, 300, 0.5, "cm", 20) + ctl("scPreY", "Y 方向（緑）", 1, 300, 0.5, "cm", 20) + ctl("scPreZ", "Z 方向（青）", 1, 300, 0.5, "cm", 20) +
  `<div id="scPreSegs"></div>`;
$("scAddR").closest(".btns").before(scBox);
$("scPrevOn").addEventListener("change", draw);
// the sizes in cm (the file keeps the size and the stretch: pose_scene.js itemCm). The rows are what the
// thing will measure: the longest side scales all of them; an axis, or a section (柄・刀身 ...) along
// the sections' axis, moves the others that go with it
const XYZ = ["scPreX", "scPreY", "scPreZ"], cm1 = v => Math.round(v * 10) / 10;
const num = id => +$(id + "N").value;
const setRow = (id, v) => { v = cm1(v); $(id).value = v; $(id + "N").value = v; };
const segIds = () => [...$("scPreSegs").querySelectorAll("input[type=range]")].map(r => r.id);
const segAxis = () => { const sg = typeof segsOf === "function" ? segsOf(PROPS_[$("scKey").value]) : null; return sg ? sg.axis : -1; };
function rowChanged(id){
  if (id === "scPreSize"){ const L0 = Math.max(...XYZ.map(num)), k = L0 > 0 ? num(id) / L0 : 1;
    for (const r of [...XYZ, ...segIds()]) setRow(r, num(r) * k); }
  else if (XYZ.includes(id)){
    if (XYZ.indexOf(id) === segAxis() && +$(id).dataset.was > 0){ const k = num(id) / +$(id).dataset.was; for (const r of segIds()) setRow(r, num(r) * k); }
    setRow("scPreSize", Math.max(...XYZ.map(num))); }
  else if (+$(id).dataset.was > 0){ const a = XYZ[segAxis()]; if (a) setRow(a, num(a) + num(id) - +$(id).dataset.was); setRow("scPreSize", Math.max(...XYZ.map(num))); }
  for (const r of [...XYZ, ...segIds()]) $(r).dataset.was = num(r);
  draw();
}
const linkRow = id => { $(id).addEventListener("input", () => { $(id + "N").value = $(id).value; rowChanged(id); });
  $(id + "N").addEventListener("change", () => { $(id).value = $(id + "N").value; rowChanged(id); }); };
for (const id of ["scPreSize", ...XYZ]) linkRow(id);
// a kind chosen: its own sizes, the sliders from 0.2 to 4 times them
let segKey = "";
function segRows(){
  const key = $("scKey").value; if (key === segKey) return; segKey = key;
  const def = PROPS_[key], sg = def && typeof segsOf === "function" ? segsOf(def) : null;
  $("scPreSegs").innerHTML = sg ? sg.list.map(g => ctl("scPreSeg_" + g.id, `部位の長さ：${g.ja}`, 1, 300, 0.5, "cm", cm1(g.hi - g.lo))).join("") : "";
  if (sg) for (const g of sg.list) linkRow("scPreSeg_" + g.id);
  if (!def) return;
  const b = itemBase({key, scale: 1, off: [0, 0, 0], rot: [0, 0, 0]});
  const ends = (id, v) => { $(id).min = cm1(v * 0.2); $(id).max = cm1(v * 4); setRow(id, v); $(id).dataset.was = cm1(v); };
  ends("scPreSize", Math.max(...b)); XYZ.forEach((id, a) => ends(id, b[a]));
  if (sg) for (const g of sg.list) ends("scPreSeg_" + g.id, g.hi - g.lo);
}
// ニュートラル: no kind, no sizes to set
const scShow = () => { scBox.style.display = $("scKey").value ? "" : "none"; };
$("scKey").addEventListener("change", () => { scShow(); segRows(); draw(); });
$("scCat").addEventListener("change", scShow); scShow();
function sized(it){                            // the sizes set before, on a new thing (in cm)
  const sg = typeof segsOf === "function" ? segsOf(PROPS_[it.key]) : null, want = XYZ.map(num);
  it.scale = 1; delete it.stretch; delete it.segs;
  // the sections' lengths and the size hang on each other: a few rounds settle them
  for (let n = 0; n < 4; n++){
    if (sg){ const st = stretchOf(it) || [1, 1, 1], segs = {};
      for (const g of sg.list){ const v = num("scPreSeg_" + g.id), base = g.hi - g.lo, f = v / (base * (it.scale || 1) * st[sg.axis]);
        if (v > 0 && Math.abs(f - 1) > 1e-3) segs[g.id] = Math.max(0.05, f); }
      if (Object.keys(segs).length) it.segs = segs; else delete it.segs; }
    const b = itemBase(it);
    if (!want.every(v => v > 0)) break;
    it.scale = Math.max(0.2, Math.max(...want) / Math.max(...b));
    const st = want.map((v, a) => Math.max(0.2, v / (b[a] * it.scale)));
    if (st.some(v => Math.abs(v - 1) > 1e-3)) it.stretch = st; else delete it.stretch;
    if (!sg) break;
  }
  return it;
}
segRows();
function ghostItem(hand){
  segRows();                                   // the list was refilled (another category)
  const key = $("scKey").value, def = PROPS_[key]; if (!def) return null;
  const it = sized({key, off: [0, 0, 0], rot: [0, 0, 0], scale: 1});
  if (def.place === "hand") it.hand = hand;
  else if (!["body", "wear"].includes(def.place)){
    const c = S.P[IX.pelvis]; it.yaw = facingYaw(); it.base = [c[0], +(S.env && S.env.floorY) || 0, c[2]];
    if (def.mount && def.mount.pelvis){ const m = rotY(def.mount.pelvis, deg(it.yaw)); it.base = [c[0] - m[0], it.base[1], c[2] - m[2]]; }
  }
  return it;
}
{ const sizeNew = (fn) => function(key, hand){ const n = (S.items || []).length; fn(key, hand);
    const it = S.items && S.items[scSel];
    if (it && it.key === key && S.items.length >= n){ sized(it); if (it.grounded && typeof groundItem === "function") groundItem(it);
      afterEdit(); fillItemList(); draw(); } };
  addItem = sizeNew(addItem);
}

// ---- objects (設置) ---------------------------------------------------------------------------------
const soBox = document.createElement("div");
soBox.className = "pv-box";
soBox.innerHTML = `<label title="置く前にプレビュー"><input type="checkbox" id="soPrevOn" checked> プレビュー</label>` +
  ctl("soPreW", "幅", 5, 600, 1, "cm", 100) + ctl("soPreH", "高さ", 1, 400, 1, "cm", 100) + ctl("soPreD", "奥行き", 1, 600, 1, "cm", 100);
$("soAdd").closest(".btns").before(soBox);
const fillSolidSize = () => { const k = SOLID_KINDS[$("soKind").value]; if (!k) return;
  ["soPreW", "soPreH", "soPreD"].forEach((id, i) => { $(id).value = $(id + "N").value = k.size[i]; }); draw(); };
$("soKind").addEventListener("change", fillSolidSize);
for (const id of ["soPreW", "soPreH", "soPreD"]) linkRange(id);
$("soPrevOn").addEventListener("change", draw);
fillSolidSize();
const preSize = () => ["soPreW", "soPreH", "soPreD"].map(id => Math.max(1, +$(id + "N").value || 1));
function ghostSolid(){
  const kind = $("soKind").value, k = SOLID_KINDS[kind]; if (!k) return null;
  const c = S.P[IX.pelvis], fy = S.env && S.env.floor ? +S.env.floorY || 0 : 0;
  const o = {kind, pos: [Math.round(c[0] + k.at[0]), fy + k.at[1], Math.round(c[2] + k.at[2])], size: preSize(), yaw: 0};
  if (k.sides) o.sides = k.sides;
  if (typeof snapSolid === "function") snapSolid(o);
  return o;
}
{ const a0 = addSolid;
  addSolid = function(kind){ const n = (S.solids || []).length; a0(kind);
    const o = S.solids && S.solids[n]; if (!o) return;
    o.size = preSize(); if (typeof snapSolid === "function") snapSolid(o); afterEdit(); syncSolids(); draw(); };
}

// ---- the ghosts: faint, dashed, in the selection colour, front view only ----------------------------------
const showing = el => { const s = el.closest("section"); return !!(s && s.classList.contains("active")); };
{ const atari0 = drawAtari;
  drawAtari = function(ctx, W, H, opts = {}){
    atari0(ctx, W, H, opts);
    if (opts.export || ctx.canvas !== front) return;
    const lw = Math.max(1.5, W / 540), P = q => project(q, W, H);
    ctx.save(); ctx.strokeStyle = cssVar("--sel"); ctx.globalAlpha = 0.6; ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (showing($("scKey")) && $("scPrevOn").checked){
      const it = ghostItem("r");
      if (it){ const hd = S.hiddenDashed; S.hiddenDashed = false;
        try { ctx.setLineDash([lw * 3, lw * 2]); ctx.lineWidth = lw;
          for (const {f, parts} of partSets(it)) for (const sh of parts) drawShape(ctx, sh, it, f, P, lw); }
        finally { S.hiddenDashed = hd; } }
    }
    if (showing($("soKind")) && $("soPrevOn").checked){
      const o = ghostSolid();
      if (o){ const m = solidMesh(o), V = m.V.map(P);
        ctx.setLineDash([lw * 3, lw * 2]); ctx.lineWidth = lw; ctx.beginPath();
        for (const e of m.edges){ ctx.moveTo(V[e.a].x, V[e.a].y); ctx.lineTo(V[e.b].x, V[e.b].y); }
        ctx.stroke(); }
    }
    ctx.restore();
  };
}
// a tab switch shows / hides the ghost
{ const aside = document.querySelector("aside");
  new MutationObserver(list => { if (list.some(m => m.target.parentNode === aside && m.target.tagName === "SECTION")) draw(); })
    .observe(aside, {subtree: true, attributes: true, attributeFilter: ["class"]}); }

// i18n.js loads after this file: the table waits for it (ODMPoserI18nEarly)
(window.ODMPoserI18n || {add: t => (window.ODMPoserI18nEarly = window.ODMPoserI18nEarly || []).push(t)}).add({"持つ・置く前にプレビュー": "Preview before holding / putting", "置く前にプレビュー": "Preview before putting",
  "大きさ": "Size", "大きさ（いちばん長い辺）": "Size (longest side)", "X 方向（赤）": "X (red)", "Y 方向（緑）": "Y (green)", "Z 方向（青）": "Z (blue)", "幅": "Width", "高さ": "Height", "奥行き": "Depth"});
draw();
})();
