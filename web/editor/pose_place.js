// 設置 (index.html, loaded after pose_gizmo.js): one place for everything put in the scene apart from
// the figures: the shapes, floor slabs, walls and ceilings (S.solids, pose_solids.js) and the things on
// their own (S.items put in the world, pose_scene.js). One list of kinds to put, one list of what is
// out, and for the one chosen: its place (X, Y, Z), its turn (X, Y, Z) and its size: a solid's width,
// height and depth (a prism's sides and top too); a thing's size and its stretch on three axes, as
// when it is held (its sections' lengths in the サイズ tab). 接地 puts it on the ground or on what is
// under it by its lowest point, turned or not. The older two sections (物体, 小物を単体で置く) are kept
// for the code that reads them, out of sight.
(() => {
const $ = id => document.getElementById(id);
const esc2 = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
// the older sections: out of every tab (ui-menu.js leaves a section that names its tab alone)
for (const id of ["soKind", "alCat"]){ const s = $(id) && $(id).closest("section"); if (s) s.dataset.menu = "old-place"; }
// 配置: the wall and the ceiling are solids now; the ground (床) stays there
for (const id of ["scCeil", "scWall"]){ const l = $(id) && $(id).closest("label"); if (l){ l.style.display = "none"; if (l.nextElementSibling) l.nextElementSibling.style.display = "none"; } }
{ const y = $("scWallYaw"); const r = y && y.closest(".row"); if (r){ r.style.display = "none"; if (r.previousElementSibling) r.previousElementSibling.style.display = "none"; } }

const SHAPES = "shapes";                                    // the kinds of solids, as one category
const cats = () => [[SHAPES, "図形・床・壁・天井"], ...CATS_.filter(([k]) => Object.values(PROPS_).some(d => d.cat === k && ALONE_OK(d))).map(([k, ja]) => [k, ja])];
// the controls: [id, label, min, max, step, unit]
const POS = [["plPX", "位置（左右）", -600, 600, 1, "cm"], ["plPY", "位置（上下）", -100, 500, 1, "cm"], ["plPZ", "位置（前後）", -600, 600, 1, "cm"]];
const ROT = [["plRX", "回転（前後に倒す・X）", -180, 180, 1, "°"], ["plRY", "回転（向き・Y）", -180, 180, 1, "°"], ["plRZ", "回転（横に倒す・Z）", -180, 180, 1, "°"]];
const SOLID_SIZE = [["plW", "幅", 1, 600, 1, "cm"], ["plH", "高さ", 1, 600, 1, "cm"], ["plD", "奥行き", 1, 600, 1, "cm"],
  ["plSides", "角の数", 3, 24, 1, ""], ["plTop", "天面の幅", 0, 600, 1, "cm"]];
// a thing's size in cm (the file keeps its scale and stretch: pose_scene.js itemCm); the sliders' ends
// follow the thing chosen (0.2 to 4 times its own size, as 20–400 % were)
const ITEM_SIZE = [["plScale", "大きさ（いちばん長い辺）", 1, 300, 0.5, "cm"], ["plSX", "X 方向", 1, 300, 0.5, "cm"], ["plSY", "Y 方向", 1, 300, 0.5, "cm"], ["plSZ", "Z 方向", 1, 300, 0.5, "cm"]];
// the pivot (支点, what it turns about): relative to the object (its own turned axes) or in the world
const PIV_REL = [["plVX", "支点（本体から）X", -300, 300, 1, "cm"], ["plVY", "支点（本体から）Y", -300, 300, 1, "cm"], ["plVZ", "支点（本体から）Z", -300, 300, 1, "cm"]];
const PIV_ABS = [["plAX", "支点（絶対座標）X", -600, 600, 1, "cm"], ["plAY", "支点（絶対座標）Y", -100, 500, 1, "cm"], ["plAZ", "支点（絶対座標）Z", -600, 600, 1, "cm"]];
const ALL = [...POS, ...ROT, ...PIV_REL, ...PIV_ABS, ...SOLID_SIZE, ...ITEM_SIZE];
const ctl = ([id, label, min, max, step, unit]) => `<div id="${id}Box"><label>${label}</label><div class="row"><input type="range" id="${id}R" min="${min}" max="${max}" step="${step}">` +
  `<input type="number" class="num" id="${id}" step="${step}"><span class="unit">${unit}</span></div></div>`;

const sec = document.createElement("section");
sec.dataset.menu = "objects";
sec.innerHTML = `<h2>設置（図形・床・壁・天井・小物）</h2>
  <label>置く物</label><select id="plCat"></select>
  <select id="plKey" style="margin-top:6px"></select>
  <label id="plGuideRow" title="パース定規の向きにそろえ、定規の色で描くガイドとして置く（アタリ画像には入らない）"><input type="checkbox" id="plGuide"> ガイドとして置く（パース定規）</label>
  <div id="plPre" class="pv-box"><label title="置く前に、置く所に薄く描く"><input type="checkbox" id="plPreOn" checked> 置く前のプレビュー</label><div id="plPreRows"></div>
    <div class="btns"><button id="plPreReset" title="大きさを、その種類の初めの大きさに戻す">↺ 大きさを戻す</button></div></div>
  <div class="btns" style="margin-top:6px"><button id="plPut">置く</button></div>
  <label style="margin-top:10px">置いた物</label>
  <select id="plList" size="5"></select>
  <div class="btns" style="margin-top:6px"><button id="plDel">外す</button><button id="plDup">複製</button><button id="plGround" title="いちばん低い所で、床や下の物の上に着ける（回転していても）">接地させる</button></div>
  <div id="plCtl">
    ${POS.map(ctl).join("")}${ROT.map(ctl).join("")}
    <details id="plPiv" style="margin-top:6px"><summary>支点（回転の中心）</summary>
      ${PIV_REL.map(ctl).join("")}${PIV_ABS.map(ctl).join("")}
      <div class="btns" style="margin-top:6px"><button id="plPivMid" title="支点を物の真ん中に戻す">中心に戻す</button><button id="plPivLow" title="支点を物の底の真ん中にする">底の中心に</button></div>
      <div class="hint">「本体から」は物と一緒に動き・回る位置、「絶対座標」は場面の中の位置です。3軸ハンドルの「支点」で動かすこともできます。</div>
    </details>
    ${SOLID_SIZE.map(ctl).join("")}${ITEM_SIZE.map(ctl).join("")}
    <div class="btns" id="plItemBtns" style="margin-top:6px"><button id="plSegs">部位ごとの長さ（下の欄）</button></div>
    <div class="btns" id="plSolidBtns" style="margin-top:6px"><button id="plTouch">選んだ関節を着ける</button><button id="plStand">この上に立つ</button><button id="plFace" title="この物体の、人物の体にいちばん近い面に、いちばん近い所を着けて立たせる（壁のような面では体ごと面に合わせる）">近い面に立つ</button><button id="plPickFace" title="次にクリックした面（床・壁・天井・物体の面）に立たせる">面をクリックして立つ</button></div>
  </div>
  <div class="hint">置いた物は、配置モードでドラッグ・3軸ハンドル（移動・回転・変形）でも動かせます。小物の大きさは、手に持つときと同じ決まりで変わります。</div>`;
(($("soKind") && $("soKind").closest("section")) || document.querySelector("aside > section:last-of-type")).after(sec);
// a thing's sizes (pose_size.js: 3 axes, each section's length), in this tab and 装備: after this section
sec.after(...document.querySelectorAll("aside > section[data-size-item]"));

// ---- the kinds to put: ニュートラル ("") first, nothing to put (no preview, no handles on it); the tab
// starts so and goes back to it after 置く, so the things put are easy to take and move
const NEUTRAL = `<option value="">ニュートラル（何も選ばない）</option>`;
function fillKeys(e){
  const c = $("plCat").value, k0 = $("plKey").value;
  $("plKey").innerHTML = NEUTRAL + (c === SHAPES
    ? Object.entries(SOLID_KINDS).map(([k, d]) => `<option value="${k}">${d.ja}</option>`).join("")
    : Object.entries(PROPS_).filter(([, d]) => d.cat === c && ALONE_OK(d)).map(([k, d]) => `<option value="${k}">${d.ja} / ${d.en}</option>`).join(""));
  // a category chosen by hand: its first kind (to put one); else as it was, if it is still there
  const opts = [...$("plKey").options];
  $("plKey").value = e && e.detail !== "keep" && opts[1] ? opts[1].value : opts.some(o => o.value === k0) ? k0 : "";
}
$("plCat").innerHTML = cats().map(([k, ja]) => `<option value="${k}">${ja}</option>`).join("");
$("plCat").addEventListener("change", fillKeys);
fillKeys();
const neutral = () => { $("plKey").value = ""; pend = null; preRows(); };

// ---- what is out: "s3" (S.solids[3]) or "i2" (S.items[2], a thing on its own)
let sel = "", listKey = "";
const loose = it => it.where === "world" || (PROPS_[it.key] || {}).place === "world" || (PROPS_[it.key] || {}).place === "grab";
function entries(){
  const out = [];
  (S.solids || []).forEach((o, k) => out.push(["s" + k, `${o.guide ? "ガイド" : "図形"}：${solidName(o)}`]));
  (S.items || []).forEach((it, n) => { if (loose(it)) out.push(["i" + n, `小物：${(PROPS_[it.key] || {}).ja || it.key}`]); });
  return out;
}
const solidOf = k => k[0] === "s" ? (S.solids || [])[+k.slice(1)] : null;
const itemOf = k => k[0] === "i" ? (S.items || [])[+k.slice(1)] : null;
// the editor's own selections follow: soSel for a solid, scSel for a thing (the 3-axis handles use them)
function choose(k){
  sel = k;
  if (k[0] === "s"){ soSel = +k.slice(1); scSel = -1; } else if (k[0] === "i"){ scSel = +k.slice(1); soSel = -1; }
  listKey = ""; sync(); draw();
}
$("plList").addEventListener("change", () => choose($("plList").value));

// 置く: the thing as its ghost is now (moved, turned, stretched, its pivot moved with the 3-axis handles,
// and the sizes above)
$("plPut").addEventListener("click", () => {
  const c = $("plCat").value, key = $("plKey").value; if (!key) return;
  const g = ghostNow(), copy = (to, from, keys) => { for (const k of keys) if (from[k] !== undefined) to[k] = JSON.parse(JSON.stringify(from[k])); else delete to[k]; };
  if (c === SHAPES){
    addSolid(key); const o = S.solids[S.solids.length - 1];
    if (g && g.o) copy(o, g.o, ["pos", "size", "yaw", "pitch", "roll", "sides", "top", "piv", "guide"]);
    if (o.guide){                              // a guide: turned to the ruler, which shows
      const r = rulerState(); guideToRuler(o, guideQuarter(o));
      if (!r.on){ r.on = true; if (typeof syncRuler === "function") syncRuler(); }
    }
    afterEdit(); syncSolids(); choose("s" + (S.solids.length - 1));
  } else { placeAlone(key); const it = S.items[S.items.length - 1];
    if (g && g.it) copy(it, g.it, ["base", "yaw", "rot", "scale", "stretch", "segs", "piv", "grounded"]);
    afterEdit(); choose("i" + (S.items.length - 1)); }
  neutral();                                    // back to ニュートラル: no preview in the way of what was put
  draw();
});
$("plDel").addEventListener("click", () => {
  const o = solidOf(sel), it = itemOf(sel);
  if (o){ remember(); S.solids.splice(+sel.slice(1), 1); soSel = -1; afterEdit(); syncSolids(); }
  else if (it) removeItem(+sel.slice(1));
  sel = ""; listKey = ""; sync(); draw();
});
$("plDup").addEventListener("click", () => {
  const o = solidOf(sel), it = itemOf(sel); if (!o && !it) return;
  remember();
  if (o){ const c = JSON.parse(JSON.stringify(o)); c.pos = add(c.pos, [o.size[0] + 20, 0, 0]); S.solids.push(c); afterEdit(); choose("s" + (S.solids.length - 1)); }
  else { const c = JSON.parse(JSON.stringify(it)); c.base = add(c.base || [0, 0, 0], [40, 0, 0]); S.items.push(c); afterEdit(); choose("i" + (S.items.length - 1)); }
});
$("plGround").addEventListener("click", () => {
  const o = solidOf(sel), it = itemOf(sel); if (!o && !it) return;
  remember();
  if (o) groundSolid(o); else { it.grounded = true; groundItem(it); }
  afterEdit(); sync(); draw(); say("接地させました（いちばん低い所で）。");
});
for (const [id, where] of [["plPivMid", "mid"], ["plPivLow", "bottom"]]) $(id).addEventListener("click", () => {
  if (!window.ODMObj || !(solidOf(sel) || itemOf(sel))) return;
  remember(); ODMObj.resetPiv(sel, where); afterEdit(); sync(); draw(); });
$("plSegs").addEventListener("click", () => { const it = itemOf(sel); if (!it) return; scSel = +sel.slice(1); draw();
  const s = $("szSeg") && $("szSeg").closest("section"); if (s) s.scrollIntoView({block: "start", behavior: "smooth"}); });
$("plTouch").addEventListener("click", () => { if (solidOf(sel)) touchSolid(); });
$("plStand").addEventListener("click", () => { if (solidOf(sel)) standOnSolid(); });
// the figure on this solid's face nearest to its body, turned to it (pose_scene.js: standOnFace)
$("plFace").addEventListener("click", () => { const o = solidOf(sel); if (!o || o.guide) return;
  const c = nearFace(o); if (!c) return;
  remember(); standOnFace(c.p, c.n, true); afterEdit(); draw();
  say(`${solidName(o)}の近い面に立たせました。`); });
$("plPickFace").addEventListener("click", armFacePick);

// ---- before putting: every size the thing will have, with its ghost drawn where it will go
// shapes: width, height, depth (a prism's or pyramid's sides and top); things: size, X / Y / Z and
// each section's length (as in サイズ)
let preKey = "";
function preRows(){
  const c = $("plCat").value, key = $("plKey").value, k = c + "|" + key;
  $("plGuideRow").style.display = c === SHAPES ? "" : "none";
  $("plPre").style.display = key ? "" : "none"; $("plPut").disabled = !key;
  if (k === preKey) return; preKey = k;
  let rows = [];
  if (c === SHAPES){ const d = SOLID_KINDS[key]; if (d){
    rows = [["ppW", "幅", 1, 600, 1, "cm", d.size[0]], ["ppH", "高さ", 1, 600, 1, "cm", d.size[1]], ["ppD", "奥行き", 1, 600, 1, "cm", d.size[2]]];
    if (d.shape === "prism" || d.shape === "pyr") rows.push(["ppSides", "角の数", 3, 24, 1, "", d.sides || 4], ["ppTop", "天面の幅", 0, 600, 1, "cm", d.shape === "pyr" ? 0 : d.size[0]]); } }
  else { const def = PROPS_[key]; if (def){
    // in cm: the kind's own sizes at first, the sliders from 0.2 to 4 times them
    const b = itemBase({key, scale: 1, off: [0, 0, 0], rot: [0, 0, 0]}).map(cm1), L = Math.max(...b);
    const row = (id, label, v) => [id, label, cm1(v * 0.2), cm1(v * 4), 0.5, "cm", v];
    rows = [row("ppScale", "大きさ（いちばん長い辺）", L), row("ppSX", "X 方向", b[0]), row("ppSY", "Y 方向", b[1]), row("ppSZ", "Z 方向", b[2])];
    const sg = typeof segsOf === "function" ? segsOf(def) : null;
    if (sg) for (const g of sg.list) rows.push(row("ppSeg_" + g.id, `部位の長さ：${g.ja}`, cm1(g.hi - g.lo))); } }
  $("plPreRows").innerHTML = rows.map(([id, label, min, max, step, unit, v]) =>
    `<div><label>${label}</label><div class="row"><input type="range" id="${id}R" min="${min}" max="${max}" step="${step}" value="${v}" data-v0="${v}">` +
    `<input type="number" class="num" id="${id}" step="${step}" value="${v}"><span class="unit">${unit}</span></div></div>`).join("");
  $("plPreRows").querySelectorAll("input[type=range]").forEach(r => { const n = $(r.id.slice(0, -1));
    r.addEventListener("input", () => { n.value = r.value; applyRows(n.id); });
    n.addEventListener("change", () => { r.value = n.value; applyRows(n.id); }); });
}
const pv = id => { const n = $(id); return n && isFinite(+n.value) ? +n.value : null; };
const cm1 = v => Math.round(v * 10) / 10;
// the top's width in cm, kept as a share of the base (o.top): a wider base widens the top too
const topCm = o => (o.top == null ? 1 : o.top) * o.size[0];
const setTopCm = (o, v) => { o.top = Math.max(0, Math.min(2, v / Math.max(1, o.size[0]))); };
// id: the row changed (only it is applied; the others follow the ghost); none: a fresh ghost, all of them
function preSolid(o, id){
  const w = pv("ppW"), h = pv("ppH"), d = pv("ppD");
  if (w) o.size = [Math.max(1, w), Math.max(1, h || o.size[1]), Math.max(1, d || o.size[2])];
  if (pv("ppSides") !== null) o.sides = Math.max(3, Math.min(24, Math.round(pv("ppSides"))));
  if (pv("ppTop") !== null && (!id || id === "ppTop" || o.top == null)) setTopCm(o, pv("ppTop"));
  return o;
}
const segRows = () => [...$("plPreRows").querySelectorAll("input[id^=ppSeg_]:not([type=range])")];
// a section's length in cm as seen (as in サイズ: its length times the size and the stretch along it)
function segCm(it, id){ const L = segLength(it, id), sg = segsOf(PROPS_[it.key]); if (!L) return null;
  return L.now * (it.scale || 1) * (stretchOf(it) || [1, 1, 1])[sg.axis]; }
function setSegCm(it, id, v){ const L = segLength(it, id), sg = segsOf(PROPS_[it.key]); if (!L || !(v > 0)) return;
  it.segs = Object.assign({}, it.segs);
  it.segs[id] = Math.max(0.05, v / (L.base * (it.scale || 1) * (stretchOf(it) || [1, 1, 1])[sg.axis]));
  if (Object.values(it.segs).every(k => k === 1)) delete it.segs; }
function preItem(it, id){
  const XYZ = ["ppSX", "ppSY", "ppSZ"];
  if (id){                                     // one row: in cm, as on a thing put
    const v = pv(id); if (!(v > 0)) return it;
    if (id === "ppScale") setItemLongCm(it, v);
    else if (XYZ.includes(id)) setItemCm(it, XYZ.indexOf(id), v);
    else if (id.startsWith("ppSeg_")) setSegCm(it, id.slice(6), v);
    if (it.stretch && it.stretch.every(k => k === 1)) delete it.stretch;
    return it;
  }
  // a fresh ghost: its sections, then its size (the longest side) and the stretch on each axis
  const segs = {}; delete it.segs; it.scale = 1; delete it.stretch;
  for (const n of segRows()){ const L = segLength(it, n.id.slice(6)), v = +n.value;
    if (L && v > 0 && Math.abs(v - L.base) > 0.05) segs[n.id.slice(6)] = Math.max(0.05, v / L.base); }
  if (Object.keys(segs).length) it.segs = segs;
  const b = itemBase(it), want = XYZ.map((r, a) => pv(r) > 0 ? pv(r) : b[a]);
  it.scale = Math.max(0.2, Math.max(...want) / Math.max(...b));
  const st = want.map((v, a) => Math.max(0.2, v / (b[a] * it.scale)));
  if (st.some(v => Math.abs(v - 1) > 1e-3)) it.stretch = st;
  return it;
}
// the ghost follows the sizes typed or slid; the sizes follow the ghost stretched by the handles
function applyRows(id){
  const g = ghostNow(); if (g){ if (g.o) preSolid(g.o, id); else { preItem(g.it, id); if (g.it.grounded) groundItem(g.it); } }
  draw();
}
function rowsFromGhost(){
  const g = pend; if (!g) return;
  const put = (id, v) => { const n = $(id), r = $(id + "R"); if (!n || v === undefined || v === null || !isFinite(v)) return; v = cm1(v);
    if (document.activeElement !== n) n.value = v; if (document.activeElement !== r) r.value = v; };
  if (g.o){ put("ppW", g.o.size[0]); put("ppH", g.o.size[1]); put("ppD", g.o.size[2]); if ($("ppTop")) put("ppTop", topCm(g.o)); }
  else { const c = itemCm(g.it); put("ppScale", Math.max(...c)); put("ppSX", c[0]); put("ppSY", c[1]); put("ppSZ", c[2]);
    for (const n of segRows()) put(n.id, segCm(g.it, n.id.slice(6))); }
}
$("plPreReset").addEventListener("click", () => { pend = null; $("plPreRows").querySelectorAll("input[type=range]").forEach(r => {
  r.value = r.dataset.v0; $(r.id.slice(0, -1)).value = r.dataset.v0; }); draw(); });
$("plCat").addEventListener("change", preRows); $("plKey").addEventListener("change", preRows);
$("plPreOn").addEventListener("change", draw); $("plGuide").addEventListener("change", draw);
preRows();
// the ghost: where 置く puts it, at the sizes above (a guide turned to the ruler). It stays (moved,
// turned, stretched with the 3-axis handles while nothing is selected) until it is put or the kind changes
let pend = null, pendKey = "";
function ghostNow(){
  const k = [$("plCat").value, $("plKey").value, $("plGuide").checked].join("|");
  if (k !== pendKey || !pend){ pendKey = k; pend = ghostFresh(); }
  return pend;
}
window.ODMGhost = () => {
  if (!sec.classList.contains("active") || !$("plPreOn").checked) return null;
  const g = ghostNow(); return !g ? null : g.o ? {key: "gs", o: g.o} : {key: "gi", o: g.it};
};
function ghostFresh(){
  const c = $("plCat").value, key = $("plKey").value, p = S.P[IX.pelvis];
  if (c === SHAPES){ const k = SOLID_KINDS[key]; if (!k) return null;
    const fy = S.env && S.env.floor ? +S.env.floorY || 0 : 0;
    const o = preSolid({kind: key, pos: [Math.round(p[0] + k.at[0]), fy + k.at[1], Math.round(p[2] + k.at[2])], size: k.size.slice(), yaw: 0});
    if (k.sides && !o.sides) o.sides = k.sides;
    // a guide starts along the ruler (turned on its own after, it keeps its angle: alignGuides)
    if ($("plGuide").checked){ o.guide = true; guideToRuler(o, 0); snapGuideGrid(o); } else if (typeof snapSolid === "function") snapSolid(o);
    return {o}; }
  const def = PROPS_[key]; if (!def) return null;
  const f = bodyFront(), fy = +(S.env && S.env.floorY) || 0;
  const it = preItem({key, off: [0, 0, 0], rot: [0, 0, 0], scale: 1, where: "world", grounded: true, yaw: facingYaw(), base: [p[0] + f[0] * 60, fy, p[2] + f[2] * 60]});
  if (def.place === "hand"){ const {lo, hi} = localExtent(partsOf(it)); if (hi[1] - lo[1] > hi[2] - lo[2]) it.rot = [0, 0, 90]; }
  groundItem(it);
  return {it};
}
{ const atari0 = drawAtari;
  drawAtari = function(ctx, W, H, opts = {}){
    atari0(ctx, W, H, opts);
    if (opts.export || ctx.canvas !== front || !sec.classList.contains("active") || !$("plPreOn").checked) return;
    const g = ghostNow(); if (!g) return; rowsFromGhost();
    const lw = Math.max(1.5, W / 540), P = q => project(q, W, H);
    ctx.save(); ctx.strokeStyle = cssVar("--sel"); ctx.globalAlpha = 0.6; ctx.lineCap = "round"; ctx.setLineDash([lw * 3, lw * 2]); ctx.lineWidth = lw;
    if (g.o){ const m = solidMesh(g.o), V = m.V.map(P); ctx.beginPath();
      for (const e of m.edges){ ctx.moveTo(V[e.a].x, V[e.a].y); ctx.lineTo(V[e.b].x, V[e.b].y); } ctx.stroke(); }
    else { const hd = S.hiddenDashed; S.hiddenDashed = false;
      try { for (const {f, parts} of partSets(g.it)) for (const sh of parts) drawShape(ctx, sh, g.it, f, P, lw); } finally { S.hiddenDashed = hd; } }
    ctx.restore();
  };
}
// 定規 › ガイドを置く: here, the shapes, as a guide
window.ODMPlaceGuide = () => {
  $("plCat").value = SHAPES; fillKeys(); if (!$("plKey").value) $("plKey").value = "box"; $("plGuide").checked = true; preRows();
  if (window.ODMUI && ODMUI.showMenu) ODMUI.showMenu("objects"); draw();
};

// ---- one control: read from and written to the chosen one
const wrap = v => ((v + 540) % 360) - 180;
function value(id){
  const o = solidOf(sel), it = itemOf(sel), O = window.ODMObj;
  if ((o || it) && O && /^pl[VA][XYZ]$/.test(id)){
    const p = id[2] === "V" ? O.pivRel(sel) : O.pivWorld(sel); return p["XYZ".indexOf(id[3])]; }
  if (o){ const top = o.top == null ? 1 : o.top;
    return {plPX: o.pos[0], plPY: o.pos[1], plPZ: o.pos[2], plRX: o.pitch || 0, plRY: o.yaw || 0, plRZ: o.roll || 0,
      plW: o.size[0], plH: o.size[1], plD: o.size[2], plSides: o.sides || solidKind(o).sides || 4, plTop: top * o.size[0]}[id]; }
  if (it){ const b = it.base || [0, 0, 0], r = it.rot || [0, 0, 0];
    if (id === "plScale") return itemLongCm(it);
    const a = {plSX: 0, plSY: 1, plSZ: 2}[id]; if (a !== undefined) return itemCm(it)[a];
    return {plPX: b[0], plPY: b[1], plPZ: b[2], plRX: r[0], plRY: it.yaw || 0, plRZ: r[2]}[id]; }
}
function setValue(id, v){
  const o = solidOf(sel), it = itemOf(sel), a = {plPX: 0, plPY: 1, plPZ: 2}[id], O = window.ODMObj;
  // the pivot: the object stays, its pivot moves
  if ((o || it) && O && /^pl[VA][XYZ]$/.test(id)){
    const n = "XYZ".indexOf(id[3]);
    if (id[2] === "V"){ const p = O.pivRel(sel); p[n] = v; O.setPivRel(sel, p); }
    else { const p = O.pivWorld(sel); p[n] = v; O.setPivAbs(sel, p); }
    afterEdit(); draw(); return;
  }
  // a turn: about the pivot (the object shifts so its pivot stays)
  // a guide's lean (X, Z) turns the ruler with it (and the other guides); its 向き (Y) turns it alone, to
  // any angle off the ruler
  const q0 = o && o.guide && typeof guideQuarter === "function" ? guideQuarter(o) : null;    // any angle (null: not a guide)
  const turn = fn => { if (O) O.keepPivot(sel, fn); else fn();
    if (q0 !== null && id === "plRY"){ const q = guideMeasure(o); if (O) O.keepPivot(sel, () => guideToRuler(o, q)); else guideToRuler(o, q); }
    else if (q0 !== null){ rulerFromGuide(o, q0); if (O) O.keepPivot(sel, () => guideToRuler(o, q0)); else guideToRuler(o, q0); alignGuides(); } };
  if (o){
    if (a !== undefined){ o.pos = o.pos.slice(); o.pos[a] = v; }
    else if (id === "plRX") turn(() => { o.pitch = wrap(v); }); else if (id === "plRY") turn(() => { o.yaw = wrap(v); }); else if (id === "plRZ") turn(() => { o.roll = wrap(v); });
    else if (id === "plW") o.size[0] = Math.max(1, v); else if (id === "plH") o.size[1] = Math.max(1, v); else if (id === "plD") o.size[2] = Math.max(1, v);
    else if (id === "plSides") o.sides = Math.max(3, Math.min(24, Math.round(v)));
    else if (id === "plTop") setTopCm(o, v);
    if (o.ground) groundSolid(o);
    afterEdit(); if (typeof syncSolids === "function") syncSolids();
  } else if (it){
    if (a !== undefined){ it.base = (it.base || [0, 0, 0]).slice(); it.base[a] = v; if (a === 1) it.grounded = false; }
    else if (id === "plRX") turn(() => { it.rot = (it.rot || [0, 0, 0]).slice(); it.rot[0] = wrap(v); });
    else if (id === "plRY") turn(() => { it.yaw = wrap(v); });
    else if (id === "plRZ") turn(() => { it.rot = (it.rot || [0, 0, 0]).slice(); it.rot[2] = wrap(v); });
    else if (id === "plScale") setItemLongCm(it, v);
    else { const k = {plSX: 0, plSY: 1, plSZ: 2}[id]; if (k !== undefined) setItemCm(it, k, v); }
    if (it.grounded && a !== 1) groundItem(it);
    afterEdit();
  }
  draw();
}
let sliding = false;
for (const [id] of ALL){
  const r = $(id + "R"), n = $(id);
  r.addEventListener("pointerdown", () => remember());
  r.addEventListener("input", () => { n.value = r.value; sliding = true; setValue(id, +r.value); sliding = false; });
  n.addEventListener("change", () => { const v = +n.value; if (!isFinite(v)) return; if (!sliding) remember(); r.value = v; setValue(id, v); });
}

// ---- the list and the controls follow the scene (every drawing, keyed)
function sync(){
  const list = entries(), key = JSON.stringify(list);
  // what is selected on the view (a click, a box, the handles) is the one shown here
  const onView = window.ODMObj ? ODMObj.key() : "";
  if (onView && list.some(([k]) => k === onView)) sel = onView;
  if (!list.some(([k]) => k === sel)) sel = soSel >= 0 && S.solids && S.solids[soSel] ? "s" + soSel : (scSel >= 0 && S.items && S.items[scSel] && loose(S.items[scSel]) ? "i" + scSel : (list[0] ? list[0][0] : ""));
  if (key !== listKey){ listKey = key; $("plList").innerHTML = list.map(([k, n]) => `<option value="${k}">${esc2(n)}</option>`).join(""); }
  $("plList").value = sel;
  const o = solidOf(sel), it = itemOf(sel), sh = o ? solidKind(o).shape : "";
  $("plCtl").style.display = o || it ? "" : "none";
  for (const [id] of SOLID_SIZE) $(id + "Box").style.display = o ? "" : "none";
  for (const [id] of ITEM_SIZE) $(id + "Box").style.display = it ? "" : "none";
  $("plSidesBox").style.display = o && (sh === "prism" || sh === "pyr") ? "" : "none";
  $("plTopBox").style.display = o && (sh === "prism" || sh === "pyr") ? "" : "none";
  $("plItemBtns").style.display = it && typeof segsOf === "function" && segsOf(PROPS_[it.key]) ? "" : "none";
  $("plSolidBtns").style.display = o && !o.guide ? "" : "none";
  // a thing's size: the sliders from 0.2 to 4 times its own size (at its stretch, for the longest side)
  if (it){ const c = itemCm(it), k = it.scale || 1, st = stretchOf(it) || [1, 1, 1];
    const ends = (id, v) => { const r = $(id + "R"); if (document.activeElement !== r){ r.min = cm1(v * 0.2); r.max = cm1(v * 4); } };
    ends("plScale", Math.max(...c) / k); c.forEach((v, a) => ends(["plSX", "plSY", "plSZ"][a], v / st[a])); }
  for (const [id] of ALL){ const v = value(id); if (v === undefined) continue;
    const r = $(id + "R"), n = $(id), shown = Math.round(v * 10) / 10;
    if (document.activeElement !== r) r.value = shown; if (document.activeElement !== n) n.value = shown; }
}
{ const d0 = draw; draw = function(){ d0.apply(this, arguments); if (sec.classList.contains("active")) sync(); }; }

// ---- 物体のプリセット: one object's make (its kind, size, turn, colour, exaggeration ...), named and kept
// in this browser, to put again as often as wanted (in front of the figure, on the ground)
const OP_KEY = (typeof KEY === "string" ? KEY : "odm-poser-editor-v1") + "-objpresets";
const SOLID_KEEP = ["kind", "size", "yaw", "pitch", "roll", "sides", "top", "color", "guide", "gq", "piv"];
const ITEM_KEEP = ["key", "rot", "yaw", "scale", "stretch", "segs", "dims", "len", "thick", "color", "piv", "bayonet"];
const opLoad = () => { try { const v = JSON.parse(localStorage.getItem(OP_KEY) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
const opSave = list => { try { localStorage.setItem(OP_KEY, JSON.stringify(list)); return true; } catch (e) { say("プリセットを保存できませんでした（ブラウザの保存領域）。", true); return false; } };
const pickKeys = (from, keys) => { const o = {}; for (const k of keys) if (from[k] !== undefined) o[k] = JSON.parse(JSON.stringify(from[k])); return o; };
const opKind = p => p.solid ? (SOLID_KINDS[p.solid.kind] || {}).ja || p.solid.kind : p.item ? (PROPS_[p.item.key] || {}).ja || p.item.key : "";
const opSec = document.createElement("section");
opSec.dataset.menu = "objects";
opSec.innerHTML = `<h2>物体のプリセット</h2>
  <select id="opList" size="5"></select>
  <div class="hint" id="opNone">まだありません。置いた物を選んで「記憶」を押すと、その種類・大きさ・向き・色・パースの誇張を、名前をつけて記憶します。</div>
  <label>名前</label><input type="text" id="opName" maxlength="40" placeholder="例：レジャーシート">
  <div class="btns" style="margin-top:6px"><button type="button" id="opSave" title="設置のタブで選んだ物を、この名前で記憶する（同じ名前は上書き）">記憶</button>
    <button type="button" id="opPut" title="選んだプリセットを、人物の前に置く">置く</button>
    <button type="button" id="opRename" title="選んだプリセットの名前を、上の名前に変える">名前を変える</button>
    <button type="button" id="opDel" title="選んだプリセットを消す">削除</button></div>
  <div class="hint">プリセットはこのブラウザに保存されます。置くと人物の前の床（または下の物の上）に置かれ、そのまま動かせます。</div>`;
sec.after(opSec);
function opFill(keep){
  const list = opLoad(), cur = keep !== undefined ? keep : $("opList").value;
  $("opList").innerHTML = list.map((p, i) => `<option value="${i}">${esc2(p.name)}（${esc2(opKind(p))}）</option>`).join("");
  $("opNone").style.display = list.length ? "none" : "";
  if (list[+cur]) $("opList").value = String(cur);
  for (const id of ["opPut", "opRename", "opDel"]) $(id).disabled = !list.length;
}
$("opList").addEventListener("change", () => { const p = opLoad()[+$("opList").value]; if (p) $("opName").value = p.name; });
$("opSave").addEventListener("click", () => {
  const o = solidOf(sel), it = itemOf(sel);
  if (!o && !it){ say("記憶する物を、置いた物の一覧か図で選んでください。", true); return; }
  const name = $("opName").value.trim() || (o ? solidName(o) : (PROPS_[it.key] || {}).ja || it.key);
  const p = o ? {name, solid: pickKeys(o, SOLID_KEEP)} : {name, item: pickKeys(it, ITEM_KEEP)};
  const list = opLoad(), at = list.findIndex(x => x.name === name);
  if (at >= 0) list[at] = p; else list.push(p);
  if (opSave(list)){ opFill(at >= 0 ? at : list.length - 1); $("opName").value = name; say(`「${name}」を記憶しました。`); }
});
$("opPut").addEventListener("click", () => {
  const p = opLoad()[+$("opList").value]; if (!p) return;
  if (p.solid && SOLID_KINDS[p.solid.kind]){
    addSolid(p.solid.kind); const o = S.solids[S.solids.length - 1];
    Object.assign(o, JSON.parse(JSON.stringify(p.solid)));
    if (o.guide){ guideToRuler(o, typeof o.gq === "number" ? o.gq : 0); const r = rulerState(); if (!r.on){ r.on = true; if (typeof syncRuler === "function") syncRuler(); } }
    else { if (typeof snapSolid === "function") snapSolid(o); groundSolid(o); }
    afterEdit(); syncSolids(); choose("s" + (S.solids.length - 1));
  } else if (p.item && PROPS_[p.item.key]){
    placeAlone(p.item.key); const it = S.items[S.items.length - 1];
    Object.assign(it, JSON.parse(JSON.stringify(p.item)));
    it.grounded = true; groundItem(it);
    afterEdit(); choose("i" + (S.items.length - 1));
  } else { say("このプリセットの種類が見つかりません。", true); return; }
  say(`「${p.name}」を置きました。`); draw();
});
$("opRename").addEventListener("click", () => {
  const list = opLoad(), i = +$("opList").value, name = $("opName").value.trim(); if (!list[i] || !name) return;
  if (list.some((x, n) => n !== i && x.name === name)){ say("同じ名前のプリセットがあります。", true); return; }
  list[i].name = name; if (opSave(list)) opFill(i);
});
$("opDel").addEventListener("click", () => {
  const list = opLoad(), i = +$("opList").value; if (!list[i]) return;
  const name = list[i].name; list.splice(i, 1); if (opSave(list)){ opFill(Math.max(0, i - 1)); say(`「${name}」を消しました。`); }
});
opFill();

// the categories' and sections' English (from the props' own tables)
{ const t = {}; for (const [, ja, en] of CATS_) if (en) t[ja] = en;
  for (const d of Object.values(PROPS_)){ const sg = typeof segsOf === "function" ? segsOf(d) : null; if (sg) for (const g of sg.list) t[g.ja] = g.en; }
  (window.ODMPoserI18n || {add: x => (window.ODMPoserI18nEarly = window.ODMPoserI18nEarly || []).push(x)}).add(t); }
// i18n.js loads after this file: the table waits for it (ODMPoserI18nEarly)
(window.ODMPoserI18n || {add: t => (window.ODMPoserI18nEarly = window.ODMPoserI18nEarly || []).push(t)}).add({
  "設置（図形・床・壁・天井・小物）": "Objects (shapes, floors, walls, ceilings, things)", "置く物": "What to put", "図形・床・壁・天井": "Shapes, floors, walls, ceilings",
  "置く": "Put", "置いた物": "Out in the scene", "外す": "Take away", "複製": "Copy", "接地させる": "Put on the ground",
  "いちばん低い所で、床や下の物の上に着ける（回転していても）": "Onto the ground or what is under it by the lowest point (turned or not)",
  "位置（左右）": "Place (left / right)", "位置（上下）": "Place (up / down)", "位置（前後）": "Place (front / back)",
  "回転（前後に倒す・X）": "Turn (tip forward / back, X)", "回転（向き・Y）": "Turn (facing, Y)", "回転（横に倒す・Z）": "Turn (tip sideways, Z)",
  "幅": "Width", "高さ": "Height", "奥行き": "Depth", "角の数": "Sides", "天面の大きさ（底面に対して）": "Top size (of the base)", "天面の幅": "Top width", "大きさ（いちばん長い辺）": "Size (longest side)",
  "大きさ": "Size", "X 方向": "X", "Y 方向": "Y", "Z 方向": "Z", "部位ごとの長さ（下の欄）": "Section lengths (below)",
  "選んだ関節を着ける": "Put the selected joint on it", "この上に立つ": "Stand on it",
  "置いた物は、配置モードでドラッグ・3軸ハンドル（移動・回転・変形）でも動かせます。小物の大きさは、手に持つときと同じ決まりで変わります。":
    "In Place mode, things out are dragged or moved, turned and scaled with the 3-axis handles too. A thing's size changes as it does when held.",
  "接地させました（いちばん低い所で）。": "Put on the ground (by its lowest point).",
  "ガイドとして置く（パース定規）": "Put as a guide (perspective ruler)",
  "パース定規の向きにそろえ、定規の色で描くガイドとして置く（アタリ画像には入らない）": "Put it as a guide turned to the perspective ruler and drawn in its colours (not in the rough picture)",
  "置く前のプレビュー": "Preview before putting", "置く前に、置く所に薄く描く": "Draw it faintly where it will go, before putting it",
  "↺ 大きさを戻す": "↺ Default sizes", "大きさを、その種類の初めの大きさに戻す": "The sizes back to the kind's own", "ガイド": "Guide", "図形": "Shape",
  "支点（回転の中心）": "Pivot (what it turns about)", "支点（本体から）X": "Pivot (from the object) X", "支点（本体から）Y": "Pivot (from the object) Y",
  "支点（本体から）Z": "Pivot (from the object) Z", "支点（絶対座標）X": "Pivot (world) X", "支点（絶対座標）Y": "Pivot (world) Y", "支点（絶対座標）Z": "Pivot (world) Z",
  "中心に戻す": "To the middle", "底の中心に": "To the bottom's middle", "支点を物の真ん中に戻す": "The pivot back to the object's middle",
  "支点を物の底の真ん中にする": "The pivot to the middle of the object's bottom",
  "物体のプリセット": "Object presets", "名前": "Name", "例：レジャーシート": "e.g. Picnic mat", "記憶": "Save", "名前を変える": "Rename", "削除": "Delete",
  "まだありません。置いた物を選んで「記憶」を押すと、その種類・大きさ・向き・色・パースの誇張を、名前をつけて記憶します。":
    "None yet. Select a thing put and press Save to keep its kind, size, turn, colour and exaggerated perspective under a name.",
  "設置のタブで選んだ物を、この名前で記憶する（同じ名前は上書き）": "Keep the thing selected in the Objects tab under this name (the same name is overwritten)",
  "選んだプリセットを、人物の前に置く": "Put the chosen preset in front of the figure", "選んだプリセットの名前を、上の名前に変える": "Rename the chosen preset to the name above",
  "選んだプリセットを消す": "Delete the chosen preset",
  "プリセットはこのブラウザに保存されます。置くと人物の前の床（または下の物の上）に置かれ、そのまま動かせます。":
    "Presets are kept in this browser. Put, one lands in front of the figure on the floor (or on what is under it), ready to move.",
  "記憶する物を、置いた物の一覧か図で選んでください。": "Select the thing to save in the list of things put or in the view.",
  "このプリセットの種類が見つかりません。": "This preset's kind is not found.", "同じ名前のプリセットがあります。": "A preset of that name exists.",
  "プリセットを保存できませんでした（ブラウザの保存領域）。": "The preset could not be saved (the browser's storage).",
  "「本体から」は物と一緒に動き・回る位置、「絶対座標」は場面の中の位置です。3軸ハンドルの「支点」で動かすこともできます。":
    "\"From the object\" moves and turns with it; \"world\" is the place in the scene. The 3-axis handles' Pivot button moves it too.", "天井（板）": "Ceiling slab"});
})();
