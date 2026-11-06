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
  ["plSides", "角の数", 3, 24, 1, ""], ["plTop", "天面の大きさ（底面に対して）", 0, 200, 1, "%"]];
const ITEM_SIZE = [["plScale", "大きさ", 20, 400, 1, "%"], ["plSX", "X 方向", 20, 400, 1, "%"], ["plSY", "Y 方向", 20, 400, 1, "%"], ["plSZ", "Z 方向", 20, 400, 1, "%"]];
const ALL = [...POS, ...ROT, ...SOLID_SIZE, ...ITEM_SIZE];
const ctl = ([id, label, min, max, step, unit]) => `<div id="${id}Box"><label>${label}</label><div class="row"><input type="range" id="${id}R" min="${min}" max="${max}" step="${step}">` +
  `<input type="number" class="num" id="${id}" step="${step}"><span class="unit">${unit}</span></div></div>`;

const sec = document.createElement("section");
sec.dataset.menu = "objects";
sec.innerHTML = `<h2>設置（図形・床・壁・天井・小物）</h2>
  <label>置く物</label><select id="plCat"></select>
  <select id="plKey" style="margin-top:6px"></select>
  <div class="btns" style="margin-top:6px"><button id="plPut">置く</button></div>
  <label style="margin-top:10px">置いた物</label>
  <select id="plList" size="5"></select>
  <div class="btns" style="margin-top:6px"><button id="plDel">外す</button><button id="plDup">複製</button><button id="plGround" title="いちばん低い所で、床や下の物の上に着ける（回転していても）">接地させる</button></div>
  <div id="plCtl">
    ${POS.map(ctl).join("")}${ROT.map(ctl).join("")}${SOLID_SIZE.map(ctl).join("")}${ITEM_SIZE.map(ctl).join("")}
    <div class="btns" id="plItemBtns" style="margin-top:6px"><button id="plSegs">部位ごとの長さ（サイズのタブ）</button></div>
    <div class="btns" id="plSolidBtns" style="margin-top:6px"><button id="plTouch">選んだ関節を着ける</button><button id="plStand">この上に立つ</button></div>
  </div>
  <div class="hint">置いた物は、配置モードでドラッグ・3軸ハンドル（移動・回転・変形）でも動かせます。小物の大きさは、手に持つときと同じ決まりで変わります。</div>`;
(($("soKind") && $("soKind").closest("section")) || document.querySelector("aside > section:last-of-type")).after(sec);

// ---- the kinds to put
function fillKeys(){
  const c = $("plCat").value;
  $("plKey").innerHTML = c === SHAPES
    ? Object.entries(SOLID_KINDS).map(([k, d]) => `<option value="${k}">${d.ja}</option>`).join("")
    : Object.entries(PROPS_).filter(([, d]) => d.cat === c && ALONE_OK(d)).map(([k, d]) => `<option value="${k}">${d.ja} / ${d.en}</option>`).join("");
}
$("plCat").innerHTML = cats().map(([k, ja]) => `<option value="${k}">${ja}</option>`).join("");
$("plCat").addEventListener("change", fillKeys);
fillKeys();

// ---- what is out: "s3" (S.solids[3]) or "i2" (S.items[2], a thing on its own)
let sel = "", listKey = "";
const loose = it => it.where === "world" || (PROPS_[it.key] || {}).place === "world" || (PROPS_[it.key] || {}).place === "grab";
function entries(){
  const out = [];
  (S.solids || []).forEach((o, k) => out.push(["s" + k, `図形：${solidName(o)}`]));
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

$("plPut").addEventListener("click", () => {
  const c = $("plCat").value, key = $("plKey").value; if (!key) return;
  if (c === SHAPES){ addSolid(key); choose("s" + (S.solids.length - 1)); }
  else { placeAlone(key); choose("i" + (S.items.length - 1)); }
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
$("plSegs").addEventListener("click", () => { const it = itemOf(sel); if (!it) return; scSel = +sel.slice(1); if (window.ODMUI) ODMUI.showMenu("size"); draw(); });
$("plTouch").addEventListener("click", () => { if (solidOf(sel)) touchSolid(); });
$("plStand").addEventListener("click", () => { if (solidOf(sel)) standOnSolid(); });

// ---- one control: read from and written to the chosen one
const wrap = v => ((v + 540) % 360) - 180;
function value(id){
  const o = solidOf(sel), it = itemOf(sel);
  if (o){ const top = o.top == null ? 1 : o.top;
    return {plPX: o.pos[0], plPY: o.pos[1], plPZ: o.pos[2], plRX: o.pitch || 0, plRY: o.yaw || 0, plRZ: o.roll || 0,
      plW: o.size[0], plH: o.size[1], plD: o.size[2], plSides: o.sides || solidKind(o).sides || 4, plTop: top * 100}[id]; }
  if (it){ const st = stretchOf(it) || [1, 1, 1], b = it.base || [0, 0, 0], r = it.rot || [0, 0, 0];
    return {plPX: b[0], plPY: b[1], plPZ: b[2], plRX: r[0], plRY: it.yaw || 0, plRZ: r[2],
      plScale: (it.scale || 1) * 100, plSX: st[0] * 100, plSY: st[1] * 100, plSZ: st[2] * 100}[id]; }
}
function setValue(id, v){
  const o = solidOf(sel), it = itemOf(sel), a = {plPX: 0, plPY: 1, plPZ: 2}[id];
  if (o){
    if (a !== undefined){ o.pos = o.pos.slice(); o.pos[a] = v; }
    else if (id === "plRX") o.pitch = wrap(v); else if (id === "plRY") o.yaw = wrap(v); else if (id === "plRZ") o.roll = wrap(v);
    else if (id === "plW") o.size[0] = Math.max(1, v); else if (id === "plH") o.size[1] = Math.max(1, v); else if (id === "plD") o.size[2] = Math.max(1, v);
    else if (id === "plSides") o.sides = Math.max(3, Math.min(24, Math.round(v)));
    else if (id === "plTop") o.top = Math.max(0, Math.min(2, v / 100));
    if (o.ground) groundSolid(o);
    afterEdit(); if (typeof syncSolids === "function") syncSolids();
  } else if (it){
    if (a !== undefined){ it.base = (it.base || [0, 0, 0]).slice(); it.base[a] = v; if (a === 1) it.grounded = false; }
    else if (id === "plRX"){ it.rot = (it.rot || [0, 0, 0]).slice(); it.rot[0] = wrap(v); }
    else if (id === "plRY") it.yaw = wrap(v);
    else if (id === "plRZ"){ it.rot = (it.rot || [0, 0, 0]).slice(); it.rot[2] = wrap(v); }
    else if (id === "plScale") it.scale = Math.max(0.2, v / 100);
    else { const k = {plSX: 0, plSY: 1, plSZ: 2}[id]; if (k !== undefined) foldStretch(it)[k] = Math.max(0.2, v / 100); }
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
  $("plSolidBtns").style.display = o ? "" : "none";
  for (const [id] of ALL){ const v = value(id); if (v === undefined) continue;
    const r = $(id + "R"), n = $(id), shown = Math.round(v * 10) / 10;
    if (document.activeElement !== r) r.value = shown; if (document.activeElement !== n) n.value = shown; }
}
{ const d0 = draw; draw = function(){ d0.apply(this, arguments); if (sec.classList.contains("active")) sync(); }; }

// i18n.js loads after this file: the table waits for it (ODMPoserI18nEarly)
(window.ODMPoserI18n || {add: t => (window.ODMPoserI18nEarly = window.ODMPoserI18nEarly || []).push(t)}).add({
  "設置（図形・床・壁・天井・小物）": "Objects (shapes, floors, walls, ceilings, things)", "置く物": "What to put", "図形・床・壁・天井": "Shapes, floors, walls, ceilings",
  "置く": "Put", "置いた物": "Out in the scene", "外す": "Take away", "複製": "Copy", "接地させる": "Put on the ground",
  "いちばん低い所で、床や下の物の上に着ける（回転していても）": "Onto the ground or what is under it by the lowest point (turned or not)",
  "位置（左右）": "Place (left / right)", "位置（上下）": "Place (up / down)", "位置（前後）": "Place (front / back)",
  "回転（前後に倒す・X）": "Turn (tip forward / back, X)", "回転（向き・Y）": "Turn (facing, Y)", "回転（横に倒す・Z）": "Turn (tip sideways, Z)",
  "幅": "Width", "高さ": "Height", "奥行き": "Depth", "角の数": "Sides", "天面の大きさ（底面に対して）": "Top size (of the base)",
  "大きさ": "Size", "X 方向": "X", "Y 方向": "Y", "Z 方向": "Z", "部位ごとの長さ（サイズのタブ）": "Section lengths (Sizes tab)",
  "選んだ関節を着ける": "Put the selected joint on it", "この上に立つ": "Stand on it",
  "置いた物は、配置モードでドラッグ・3軸ハンドル（移動・回転・変形）でも動かせます。小物の大きさは、手に持つときと同じ決まりで変わります。":
    "In Place mode, things out are dragged or moved, turned and scaled with the 3-axis handles too. A thing's size changes as it does when held.",
  "接地させました（いちばん低い所で）。": "Put on the ground (by its lowest point).", "天井（板）": "Ceiling slab"});
})();
