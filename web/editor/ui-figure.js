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

// 人物の管理, under the map: every figure (a press edits it), add / copy / delete the one edited
// (pose_cast.js), and what it holds and wears: open it in 装備, or take it off (×). The same is in
// 見る › 管理 and 物と場所 › 装備.
const cast = document.createElement("div");
cast.id = "figCast";
cast.innerHTML = `<div class="ctx-name">人物の管理</div><div class="ctx-btns" id="fcList" role="group" aria-label="人物の一覧"></div>
  <div class="ctx-btns"><button type="button" class="ctx-btn" id="fcAdd">＋ 人物を追加</button><button type="button" class="ctx-btn" id="fcDup">複製</button>
    <button type="button" class="ctx-btn" id="fcDel" title="編集している人物を削除">削除</button></div>
  <div class="ctx-name">持ち物・身に着けた物</div><div class="ctx-btns" id="fcItems"></div>
  <div class="ctx-name">付随物のリセット</div>
  <div class="ctx-btns fc-pick" role="group" aria-label="リセットするもの"><label><input type="checkbox" data-fr="items" checked> 持ち物・身に着けた物</label>
    <label><input type="checkbox" data-fr="auras" checked> オーラ</label><label><input type="checkbox" data-fr="wire" checked> ワイヤー</label>
    <label><input type="checkbox" data-fr="pins" checked> 関節の固定</label></div>
  <div class="ctx-btns"><button type="button" class="ctx-btn" id="frStrip" title="チェックしたものを、この人物からすべて外す">↺ 外す</button>
    <button type="button" class="ctx-btn" id="frTune" title="付けたまま、大きさ・色・向き・位置・ワイヤーの高さを初期値に戻す">↺ 大きさ・色などを戻す</button></div>
  <div class="hint">チェックしたものだけに効きます（関節の固定は「外す」だけ）。床に単体で置いた物は含みません。</div>`;
box.appendChild(cast);
const fcBtn = (label, cls, fn, title) => { const b = document.createElement("button"); b.type = "button"; b.className = "ctx-btn" + (cls ? " " + cls : "");
  b.textContent = label; if (title){ b.title = title; b.setAttribute("aria-label", title); } b.addEventListener("click", fn); return b; };
cast.querySelector("#fcAdd").addEventListener("click", () => addFigure(false));
cast.querySelector("#fcDup").addEventListener("click", () => addFigure(true));
cast.querySelector("#fcDel").addEventListener("click", () => removeFigure());
// 付随物のリセット: what the figure has besides its body (held / worn things, auras, the wire, pins),
// the kinds ticked: take them all off, or keep them and put their size, colour, turn, place and the
// wire's height back
const mineOf = () => (S.items || []).map((it, n) => [it, n]).filter(([it]) => !(typeof loose === "function" && loose(it)));
const picked = () => { const o = {}; cast.querySelectorAll("[data-fr]").forEach(c => { o[c.dataset.fr] = c.checked; }); return o; };
function hasExtra(k, tune){
  return k.items && mineOf().length > 0 || k.auras && (S.auras || []).length > 0 || k.wire && !!(S.wire && S.wire.on) ||
    !tune && k.pins && Object.keys(S.pins || {}).length > 0;
}
function stripFigure(){
  const k = picked(); if (!hasExtra(k, false)) return;
  remember();
  if (k.items){ const mine = mineOf().map(([it]) => it); mine.forEach(freeHands);
    S.items = S.items.filter(it => mine.indexOf(it) < 0); scSel = -1; }
  if (k.auras) S.auras = [];
  if (k.wire && S.wire) S.wire.on = false;
  if (k.pins) S.pins = {};
  afterEdit(); fillItemList(); if (typeof syncStyle === "function") syncStyle(); if (typeof syncScene === "function") syncScene(); draw();
  say("この人物の付随物を外しました（元に戻すで戻せます）。");
}
function tuneFigure(){
  const k = picked(); if (!hasExtra(k, true)) return;
  remember();
  if (k.items) mineOf().forEach(([it]) => { it.off = [0, 0, 0]; it.rot = [0, 0, 0]; it.scale = 1; delete it.color;
    delete it.dims; delete it.len; delete it.thick; delete it.stretch; });
  if (k.auras) (S.auras || []).forEach(a => { a.size = 14; a.color = (AURA_KINDS[a.kind] || AURA_KINDS.flame)[1];
    for (const kk of ["even", "sharp", "round", "angle", "height", "thick", "fine", "spread", "density"]) delete a[kk]; });
  if (k.wire && S.wire && S.wire.on){ S.wire.height = 300; if (typeof syncScene === "function") syncScene(); setWire(false); }
  afterEdit(); fillItemList(); if (typeof syncStyle === "function") syncStyle(); draw();
  say("この人物の付随物の大きさ・色などを初期値に戻しました。");
}
cast.querySelector("#frStrip").addEventListener("click", stripFigure);
cast.querySelector("#frTune").addEventListener("click", tuneFigure);
cast.querySelectorAll("[data-fr]").forEach(c => c.addEventListener("change", () => { castKey = ""; updateCast(); }));
let castKey = "";
function updateCast(){
  if (typeof takeFigure !== "function") return;
  const figs = [{k: -1, id: S.figId || 1, name: S.figName || "1人目"}, ...(S.others || []).map((f, k) => ({k, id: f.figId || k + 2, name: f.figName || `${f.figId || k + 2}人目`}))]
    .sort((a, b) => a.id - b.id);
  const mine = mineOf(), pk = picked();
  cast.querySelector("#frStrip").disabled = !hasExtra(pk, false);
  cast.querySelector("#frTune").disabled = !hasExtra(pk, true);
  const k = JSON.stringify([figs, mine.map(([it, n]) => [it.key, n, it.where || "", it.hand || ""]), typeof scSel === "number" ? scSel : -1]);
  if (k === castKey) return; castKey = k;
  const list = cast.querySelector("#fcList"), items = cast.querySelector("#fcItems");
  list.replaceChildren(...figs.map(f => { const b = fcBtn(f.name, f.k < 0 ? "on" : "", () => { if (f.k >= 0) switchFigure(f.k); });
    b.setAttribute("aria-pressed", String(f.k < 0)); return b; }));
  cast.querySelector("#fcDel").disabled = !(S.others || []).length;
  const P = window.PROPS || {}, open = n => () => { scSel = n; if (typeof fillItemList === "function") fillItemList(); if (window.ODMUI && ODMUI.showMenu) ODMUI.showMenu("equip"); draw(); };
  items.replaceChildren(...mine.flatMap(([it, n]) => { const d = P[it.key] || {};
    const where = it.where === "back" ? "背中" : d.place === "hand" ? (it.hand === "l" ? "左手" : "右手") : d.place === "wear" ? "着用" : d.place === "body" ? "構え" : "";
    const name = `${d.ja || it.key}${where ? "（" + where + "）" : ""}`;
    return [fcBtn(name, n === scSel ? "on" : "", open(n), ""), fcBtn("×", "x", () => removeItem(n), `${d.ja || it.key}を外す`)]; }),
    fcBtn("＋ 持たせる・着ける", "", () => { if (window.ODMUI && ODMUI.showMenu) ODMUI.showMenu("equip"); }));
}
{ const d0 = draw; draw = function(){ d0.apply(this, arguments); update(); updateCast(); }; }
if (window.ODMPoserI18n) window.ODMPoserI18n.add({"全身図（どこを編集しているか）": "Body map (what is being edited)",
  "部位を選ぶ：図か人形の丸をタップ": "Pick a part: tap the map or a circle on the figure", "固定を外す": "Unpin", "固定": "Pin",
  "持たせる": "Hold", "頭に着ける": "Put on the head", "床に着ける": "Onto the floor", "線の色": "Line colour",
  "人物の管理": "Figures", "人物の一覧": "The figures", "＋ 人物を追加": "+ Add a figure", "複製": "Copy", "削除": "Delete",
  "編集している人物を削除": "Delete the figure being edited", "持ち物・身に着けた物": "Held and worn", "＋ 持たせる・着ける": "+ Hold / wear",
  "背中": "back", "着用": "worn", "構え": "held ready",
  "付随物のリセット": "Reset what the figure has", "リセットするもの": "What to reset", "関節の固定": "Pinned joints",
  "↺ 外す": "↺ Take off", "↺ 大きさ・色などを戻す": "↺ Size, colour ... back",
  "チェックしたものを、この人物からすべて外す": "Take everything ticked off this figure",
  "付けたまま、大きさ・色・向き・位置・ワイヤーの高さを初期値に戻す": "Keep them on; put their size, colour, turn, place and the wire's height back",
  "チェックしたものだけに効きます（関節の固定は「外す」だけ）。床に単体で置いた物は含みません。":
    "Works on what is ticked (pinned joints: Take off only). Things put on the floor on their own are left alone.",
  "頭": "Head", "胴体": "Torso", "右腕": "Right arm", "左腕": "Left arm", "右脚": "Right leg", "左脚": "Left leg", "右手": "Right hand", "左手": "Left hand"});
update(); updateCast();
})();
