// 全身図 and the menu for the touched part (index.html, loaded after ui-menu.js), in the menu while
// 人物 is open (ui-menu.js puts it there): a small fixed figure (the rest pose, seen from the front)
// that shows which joint is being edited and the part it belongs to, pinned joints, and a tap on a
// joint selects it. Beside it, the selected part's name and the few things one does to that part,
// as buttons that open their tab (or do it at once: pin, put the foot on the floor).
(() => {
const head = document.getElementById("asideHead"), status = document.getElementById("status");
const box = document.createElement("div");
box.id = "figCtx"; box.setAttribute("data-ui", "skip");
const K = 0.56, X0 = 32, Y0 = 99;              // cm -> the drawing's units (viewBox 64 x 100)
const at = i => [X0 + REST[i][0] * K + (/toe/.test(J[i]) ? Math.sign(REST[i][0]) * 2.2 : 0), Y0 - REST[i][1] * K];
const GROUP_OF = i => PART_OF[J[i]] || "torso";
let svg = `<svg id="figMap" viewBox="0 0 64 100" role="group" aria-label="全身図（どこを編集しているか）">`;
BONES.forEach(([a, b]) => { const [x1, y1] = at(a), [x2, y2] = at(b);
  svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" data-g="${GROUP_OF(b)}"/>`; });
J.forEach((n, i) => { const [x, y] = at(i), r = i === IX.head ? 6.2 : HANDLE.has(i) ? 1.4 : 2;
  svg += `<circle cx="${x}" cy="${y}" r="${r}" data-i="${i}"${i === IX.head ? ' class="head"' : ""}><title>${J_JA[n]}</title></circle>`; });
svg += `</svg>`;
box.innerHTML = svg + `<div class="ctx-side"><div class="ctx-name" id="ctxName"></div><div class="ctx-btns" id="ctxBtns"></div></div>`;
status.before(box);
if (window.ODMUI && ODMUI.renderMenu) ODMUI.renderMenu();   // into the menu, under 人物
const map = box.querySelector("#figMap"), nameEl = box.querySelector("#ctxName"), btns = box.querySelector("#ctxBtns");

const PART_JA = {head: "頭", torso: "胴体", r_arm: "右腕", l_arm: "左腕", r_leg: "右脚", l_leg: "左脚", r_hand: "右手", l_hand: "左手"};
const go = id => () => { if (window.ODMUI && ODMUI.showMenu) ODMUI.showMenu(id); };
// the things one does to a part: [label, what, icon]
function actions(i){
  if (i < 0) return [["体格", go("body"), "Body"], ["サイズ", go("size"), "FrameSize"], ["色", go("colors"), "Palette"]];
  const g = GROUP_OF(i), side = J[i][0], out = [["ポーズ", go("pose"), "Pose"]];
  const sz = () => { const s = document.getElementById("szSide"); if (s && (side === "r" || side === "l")){ s.value = side; s.dispatchEvent(new Event("change")); } go("size")(); };
  out.push(["サイズ", sz, "FrameSize"]);
  if (PINNABLE.has(J[i])) out.push([S.pins && S.pins[i] ? "固定を外す" : "固定", () => { remember(); togglePin(i); afterEdit(); draw(); }, "Pin"]);
  if (/arm|hand/.test(g)) out.push(["持たせる", go("equip"), "Fashion"]);
  if (g === "head") out.push(["頭に着ける", go("equip"), "Fashion"]);
  if (/ankle|toe/.test(J[i]) && typeof toSurface === "function") out.push(["床に着ける", () => toSurface("床"), "Move1"]);
  if (g === "torso") out.push(["体格", go("body"), "Body"]);
  out.push(["線の色", go("colors"), "Palette"]);
  return out;
}
let key = "";
function update(){
  const i = typeof sel === "number" ? sel : -1, pins = Object.keys(S.pins || {}).join(","), k = [i, pins, S.figName || ""].join("|");
  if (k === key) return; key = k;
  const g = i >= 0 ? GROUP_OF(i) : null;
  map.querySelectorAll("circle").forEach(c => { const j = +c.dataset.i;
    c.classList.toggle("on", j === i); c.classList.toggle("pin", !!(S.pins && S.pins[j])); c.classList.toggle("part", g !== null && GROUP_OF(j) === g); });
  map.querySelectorAll("line").forEach(l => l.classList.toggle("part", l.dataset.g === g));
  nameEl.textContent = i >= 0 ? `${J_JA[J[i]]}（${PART_JA[g] || g}）` : "部位を選ぶ：図か人形の丸をタップ";
  btns.replaceChildren();
  for (const [label, fn, ic] of actions(i)){
    const b = document.createElement("button"); b.type = "button"; b.className = "ctx-btn";
    b.innerHTML = window.ODMICONS && ODMICONS[ic] ? ODMICONS.svg(ic) : "";
    const s = document.createElement("span"); s.textContent = label; b.appendChild(s);
    b.addEventListener("click", fn); btns.appendChild(b);
  }
}
map.addEventListener("click", e => { const c = e.target.closest("circle"); if (!c) return;
  sel = +c.dataset.i; draw(); });
{ const d0 = draw; draw = function(){ d0.apply(this, arguments); update(); }; }
if (window.ODMPoserI18n) window.ODMPoserI18n.add({"全身図（どこを編集しているか）": "Body map (what is being edited)",
  "部位を選ぶ：図か人形の丸をタップ": "Pick a part: tap the map or a circle on the figure", "固定を外す": "Unpin", "固定": "Pin",
  "持たせる": "Hold", "頭に着ける": "Put on the head", "床に着ける": "Onto the floor", "線の色": "Line colour",
  "頭": "Head", "胴体": "Torso", "右腕": "Right arm", "左腕": "Left arm", "右脚": "Right leg", "左脚": "Left leg", "右手": "Right hand", "左手": "Left hand"});
update();
})();
