// サイズ (index.html, loaded after pose_scene.js): the figure's sizes part by part, and a held
// thing's length and thickness.
//  - 身長 / 頭身, with what to keep: nothing (the head stays its size), the heads count (all grows
//    alike) or the height (the rest of the body makes up for the head)
//  - 部位の固定: locked parts (head, torso, arms, legs) keep their lengths and thicknesses when the
//    height or the heads count changes, or when another part's size does with 身長を保つ
//  - lengths (縦) and widths (横) one by one: the torso's shoulders, waist and hips apart, the neck,
//    the arms and legs bone by bone, their thickness; the head is a circle, one size
//  - the selected thing (装備): its length along its long side and its thickness, the hand's grip
//    staying where it is (the root holds, the tip moves)
(() => {
const $ = id => document.getElementById(id);
// the part each bone (its child joint) and each joint's circle belongs to
const GROUP = {waist: "torso", chest: "torso", r_shoulder: "torso", l_shoulder: "torso", r_hip: "torso", l_hip: "torso", pelvis: "torso",
  neck: "head", head: "head",
  r_elbow: "arms", r_wrist: "arms", r_hand: "arms", l_elbow: "arms", l_wrist: "arms", l_hand: "arms",
  r_knee: "legs", r_ankle: "legs", r_toe: "legs", l_knee: "legs", l_ankle: "legs", l_toe: "legs"};
const GROUP_JA = {head: "頭と首", torso: "胴体", arms: "腕", legs: "脚"};
// a circle's part: the shoulders' and hips' circles go with the arms and legs (their thickness)
const R_GROUP = Object.assign({}, GROUP, {r_shoulder: "arms", l_shoulder: "arms", r_hip: "legs", l_hip: "legs"});

const sec = (h, inner, menu = "size") => { const s = document.createElement("section"); s.dataset.menu = menu; s.innerHTML = `<h2>${h}</h2>` + inner; return s; };
const ctl = (id, label, min, max, step, unit) => `<label>${label}</label><div class="row"><input type="range" id="${id}" min="${min}" max="${max}" step="${step}">` +
  `<input type="number" class="num" id="${id}N" step="${step}"><span class="unit">${unit}</span></div>`;
const parts = [
  sec("身長と頭身", `<label>保つもの</label><select id="szKeep"><option value="none">なし（頭の大きさはそのまま）</option>
      <option value="heads">頭身を保つ（全身が同じ割合で）</option><option value="height">身長を保つ（残りの体で合わせる）</option></select>` +
    ctl("szHeight", "身長", 60, 240, 0.5, "cm") + ctl("szHeads", "頭身", 2, 10, 0.1, "頭身") +
    `<div class="hint">「身長を保つ」では、頭や体の各部を変えると、固定していない残りの部位の長さで身長を合わせます。</div>`),
  sec("部位の固定", `<label><input type="checkbox" id="szLock_head"> 頭と首</label><label><input type="checkbox" id="szLock_torso"> 胴体</label>
    <label><input type="checkbox" id="szLock_arms"> 腕</label><label><input type="checkbox" id="szLock_legs"> 脚</label>
    <div class="hint">固定した部位は、身長・頭身を変えても長さと太さが変わりません。</div>`),
  sec("頭と胴体（縦・横）", ctl("szHead", "頭の大きさ（直径）", 10, 40, 0.5, "cm") + ctl("szNeck", "首の長さ", 2, 30, 0.5, "cm") +
    ctl("szShoulder", "肩幅", 15, 70, 0.5, "cm") + ctl("szChest", "胸の長さ", 5, 40, 0.5, "cm") + ctl("szWaistW", "ウエスト幅", 8, 60, 0.5, "cm") +
    ctl("szBelly", "腹の長さ", 4, 35, 0.5, "cm") + ctl("szHip", "腰幅（股の間）", 8, 50, 0.5, "cm")),
  sec("腕と脚（縦・横）", `<label>どちら側</label><select id="szSide"><option value="both">左右とも</option><option value="r">右</option><option value="l">左</option></select>` +
    ctl("szUpper", "上腕", 10, 50, 0.5, "cm") + ctl("szFore", "前腕", 10, 50, 0.5, "cm") + ctl("szHand", "手", 4, 16, 0.5, "cm") +
    ctl("szArmT", "腕の太さ（肘）", 3, 24, 0.5, "cm") + ctl("szThigh", "太もも", 15, 70, 0.5, "cm") + ctl("szShin", "すね", 15, 70, 0.5, "cm") +
    ctl("szFoot", "足", 5, 25, 0.5, "cm") + ctl("szLegT", "脚の太さ（膝）", 4, 30, 0.5, "cm")),
  sec("小物の長さと太さ", `<div class="hint" id="szItemName">装備のタブで小物を選ぶと、ここで変えられます。</div>` +
    ctl("szLen", "長さ（長い向き）", 30, 300, 1, "%") + ctl("szThick", "太さ", 30, 300, 1, "%") +
    `<div class="btns"><button type="button" id="szItemReset">↺ 長さ・太さを戻す</button></div>
    <div class="hint">持つ所（握り）はそのままで、先の方が伸び縮みします。全体の大きさは装備のタブで変えます。</div>`)];
const old = document.querySelector('aside > section[data-menu="size"]');
old.replaceWith(...parts);

// ---- the body ----------------------------------------------------------------------------------
const bone = n => { const i = IX[n]; return len(sub(S.P[i], S.P[PARENT[i]])); };
function setBone(n, L){                       // the bone's direction kept, what hangs on it comes along
  const i = IX[n], p = S.P[PARENT[i]], v = sub(S.P[i], p), l = len(v); if (l < 1e-6) return;
  moveSubtree(i, mul(v, L / l - 1));
}
const across = (a, b) => norm(sub(S.P[IX[b]], S.P[IX[a]]));
const width = (a, b) => len(sub(S.P[IX[b]], S.P[IX[a]]));
function setWidth(a, b, W){                   // a pair (shoulders, hips) moved apart / together evenly
  const u = across(a, b), d = (W - width(a, b)) / 2;
  moveSubtree(IX[a], mul(u, -d)); moveSubtree(IX[b], mul(u, d));
}
const sides = () => ({both: ["r", "l"], r: ["r"], l: ["l"]})[$("szSide").value] || ["r", "l"];
const pick = () => sides()[0];
const LIMB_R = {arms: ["shoulder", "elbow", "wrist"], legs: ["hip", "knee", "ankle"]};
const SIZE = {
  szHead: [() => 2 * S.R[IX.head], v => scaleHead(v / (2 * S.R[IX.head])), "head"],
  szNeck: [() => bone("neck"), v => setBone("neck", v), "head"],
  szShoulder: [() => width("r_shoulder", "l_shoulder"), v => setWidth("r_shoulder", "l_shoulder", v), "torso"],
  szChest: [() => bone("chest"), v => setBone("chest", v), "torso"],
  szWaistW: [() => 2 * S.R[IX.waist], v => { S.R[IX.waist] = v / 2; }, "torso"],
  szBelly: [() => bone("waist"), v => setBone("waist", v), "torso"],
  szHip: [() => width("r_hip", "l_hip"), v => setWidth("r_hip", "l_hip", v), "torso"],
  szUpper: [() => bone(pick() + "_elbow"), v => sides().forEach(s => setBone(s + "_elbow", v)), "arms"],
  szFore: [() => bone(pick() + "_wrist"), v => sides().forEach(s => setBone(s + "_wrist", v)), "arms"],
  szHand: [() => bone(pick() + "_hand"), v => sides().forEach(s => setBone(s + "_hand", v)), "arms"],
  szArmT: [() => 2 * S.R[IX[pick() + "_elbow"]], v => thick("arms", v / (2 * S.R[IX[pick() + "_elbow"]])), "arms"],
  szThigh: [() => bone(pick() + "_knee"), v => sides().forEach(s => setBone(s + "_knee", v)), "legs"],
  szShin: [() => bone(pick() + "_ankle"), v => sides().forEach(s => setBone(s + "_ankle", v)), "legs"],
  szFoot: [() => bone(pick() + "_toe"), v => sides().forEach(s => setBone(s + "_toe", v)), "legs"],
  szLegT: [() => 2 * S.R[IX[pick() + "_knee"]], v => thick("legs", v / (2 * S.R[IX[pick() + "_knee"]])), "legs"]};
function thick(g, k){ for (const s of sides()) for (const n of LIMB_R[g]) S.R[IX[s + "_" + n]] *= k; }

// the whole body from a saved state, every bone of the free parts k times as long (and thick)
const snap = () => ({P: S.P.map(p => p.slice()), R: S.R.slice()});
function scaleFree(base, k, fixed){
  const out = base.P.map(p => p.slice());
  for (const i of subtree(0).slice(1)){
    const p = PARENT[i], f = fixed.has(GROUP[J[i]]) ? 1 : k;
    out[i] = add(out[p], mul(sub(base.P[i], base.P[p]), f));
  }
  S.P = out; S.R = base.R.map((r, i) => fixed.has(R_GROUP[J[i]]) ? r : r * k);
}
// the k (bisection) for which the free parts make the height h
function fitHeight(h, fixed){
  const base = snap(); let lo = 0.2, hi = 5;
  for (let n = 0; n < 40; n++){ const m = (lo + hi) / 2; scaleFree(base, m, fixed); if (standingHeight() < h) lo = m; else hi = m; }
  scaleFree(base, (lo + hi) / 2, fixed);
}
const locked = () => new Set(["head", "torso", "arms", "legs"].filter(g => $("szLock_" + g).checked));
const heads = () => standingHeight() / (2 * S.R[IX.head]);
function setHeads(H){                          // the head's size (with the neck kept), for H heads at this height
  for (let n = 0; n < 6; n++){ const want = standingHeight() / (2 * H); scaleHead(want / S.R[IX.head]); }
}
// after a change: hold what 保つもの keeps (the height h0 or the heads count n0)
function hold(h0, n0, changed){
  const keep = $("szKeep").value, fix = locked();
  if (keep === "height"){ fix.add("head"); if (changed) fix.add(changed); fitHeight(h0, fix); }
  else if (keep === "heads" && changed !== "head"){
    if (fix.has("head")) say("頭を固定しているので、頭身は保てません。", true); else setHeads(n0);
  }
}
function setHeight(h){
  const keep = $("szKeep").value, fix = locked();
  if (keep !== "heads") fix.add("head");
  else if (fix.has("head")){ say("頭を固定しているので、頭身を保ったまま身長は変えられません（頭の固定を外してください）。", true); return; }
  if (fix.size >= 4){ say("すべての部位が固定されています。", true); return; }
  const n0 = heads();
  fitHeight(h, fix);
  // 頭身を保つ with some parts locked: the head and the free parts settle the height and the count together
  if (keep === "heads" && fix.size) for (let n = 0; n < 8; n++){ setHeads(n0); fitHeight(h, new Set([...fix, "head"])); }
}
function setHeadsTo(H){
  if (locked().has("head")){ say("頭を固定しているので、頭身は変えられません。", true); return; }
  const h0 = standingHeight();
  if ($("szKeep").value === "height"){
    for (let n = 0; n < 5; n++){ scaleHead((h0 / (2 * H)) / S.R[IX.head]); const fix = locked(); fix.add("head"); fitHeight(h0, fix); }
  } else setHeads(H);
}

// ---- the selected thing (pose_scene.js: scSel, the long side and thickness in itemLocal) --------
const curItem = () => (typeof scSel === "number" && scSel >= 0 && S.items) ? S.items[scSel] : null;
const ITEM = {szLen: [it => Math.round((it.len || 1) * 100), (it, v) => { it.len = v / 100; }],
              szThick: [it => Math.round((it.thick || 1) * 100), (it, v) => { it.thick = v / 100; }]};

// ---- wiring --------------------------------------------------------------------------------------
const fmt = v => Math.round(v * 10) / 10;
function show(){
  const all = Object.assign({szHeight: [() => standingHeight()], szHeads: [heads]}, SIZE);
  for (const [id, [get]] of Object.entries(all)){
    const v = fmt(get()), r = $(id), n = $(id + "N");
    if (rangeHeld !== r) r.value = v;
    if (document.activeElement !== n) n.value = v;
  }
  const keep = $("szKeep").value;
  for (const id of ["szHeight", "szHeightN"]) $(id).disabled = keep === "height";
  for (const id of ["szHeads", "szHeadsN"]) $(id).disabled = keep === "heads";
  const it = curItem(), def = it && (window.PROPS || {})[it.key];
  $("szItemName").textContent = def ? `選んだ小物：${def.ja}` : "装備のタブで小物を選ぶと、ここで変えられます。";
  for (const [id, [get]] of Object.entries(ITEM)){
    const r = $(id), n = $(id + "N"); r.disabled = n.disabled = !it;
    if (it){ if (rangeHeld !== r) r.value = get(it); if (document.activeElement !== n) n.value = get(it); }
  }
  $("szItemReset").disabled = !it;
}
function apply(id, v){
  if (!isFinite(v)) return;
  const h0 = standingHeight(), n0 = heads();
  if (id === "szHeight") setHeight(v);
  else if (id === "szHeads") setHeadsTo(v);
  else if (ITEM[id]){ const it = curItem(); if (!it) return; ITEM[id][1](it, v); }
  else { SIZE[id][1](v); hold(h0, n0, SIZE[id][2]); }
  if (typeof afterEdit === "function") afterEdit();
  draw();
}
for (const id of ["szHeight", "szHeads", ...Object.keys(SIZE), ...Object.keys(ITEM)]){
  const r = $(id), n = $(id + "N");
  r.addEventListener("pointerdown", () => remember());
  r.addEventListener("keydown", () => remember());
  r.addEventListener("input", () => { apply(id, +r.value); n.value = r.value; });
  n.addEventListener("change", () => { remember(); apply(id, +n.value); });
}
$("szKeep").addEventListener("change", show);
$("szSide").addEventListener("change", show);
$("szItemReset").addEventListener("click", () => { const it = curItem(); if (!it) return;
  remember(); delete it.len; delete it.thick; if (typeof afterEdit === "function") afterEdit(); draw(); say("小物の長さ・太さを戻しました。"); });
for (const g of ["head", "torso", "arms", "legs"]) $("szLock_" + g).addEventListener("change", e =>
  say(`${GROUP_JA[g]}を${e.target.checked ? "固定しました（身長・頭身を変えても、長さと太さはそのまま）" : "固定から外しました"}。`));
// the numbers follow every edit (dragging in the body mode too), while the tab shows
{ const d0 = draw; draw = function(){ d0.apply(this, arguments);
    if (parts.some(s => s.classList.contains("active"))) show(); }; }

// i18n.js loads after this file: the table waits for it (ODMPoserI18nEarly)
(window.ODMPoserI18n || {add: t => (window.ODMPoserI18nEarly = window.ODMPoserI18nEarly || []).push(t)}).add({"身長と頭身": "Height and heads", "保つもの": "Keep",
  "なし（頭の大きさはそのまま）": "Nothing (the head keeps its size)", "頭身を保つ（全身が同じ割合で）": "The heads count (all alike)",
  "身長を保つ（残りの体で合わせる）": "The height (the rest of the body makes up)", "頭身": "Heads", "部位の固定": "Locked parts",
  "頭と首": "Head and neck", "胴体": "Torso", "腕": "Arms", "脚": "Legs", "頭と胴体（縦・横）": "Head and torso (lengths, widths)",
  "頭の大きさ（直径）": "Head size (diameter)", "首の長さ": "Neck length", "肩幅": "Shoulder width", "胸の長さ": "Chest length",
  "ウエスト幅": "Waist width", "腹の長さ": "Belly length", "腰幅（股の間）": "Hip width (between the thigh roots)",
  "腕と脚（縦・横）": "Arms and legs (lengths, thickness)", "どちら側": "Which side", "左右とも": "Both", "上腕": "Upper arm",
  "前腕": "Forearm", "手": "Hand", "腕の太さ（肘）": "Arm thickness (elbow)", "太もも": "Thigh", "すね": "Shin", "足": "Foot",
  "脚の太さ（膝）": "Leg thickness (knee)", "小物の長さと太さ": "A thing's length and thickness", "長さ（長い向き）": "Length (the long side)",
  "太さ": "Thickness", "↺ 長さ・太さを戻す": "↺ Default length and thickness",
  "装備のタブで小物を選ぶと、ここで変えられます。": "Select a thing in the Equip tab to change it here.",
  "持つ所（握り）はそのままで、先の方が伸び縮みします。全体の大きさは装備のタブで変えます。": "The grip stays where it is; the far end grows and shrinks. The whole size is in the Equip tab.",
  "固定した部位は、身長・頭身を変えても長さと太さが変わりません。": "Locked parts keep their lengths and thickness when the height or heads count changes.",
  "「身長を保つ」では、頭や体の各部を変えると、固定していない残りの部位の長さで身長を合わせます。": "With “The height”, changing the head or a part makes the other unlocked parts make up the height.",
  "小物の長さ・太さを戻しました。": "The thing's length and thickness are back to default."});
show();
})();
