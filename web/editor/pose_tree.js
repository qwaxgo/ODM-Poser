// The 管理 tab's list of what is in the scene, like Blender's outliner (index.html, loaded after
// pose_ruler.js). Each figure comes with what it holds, wears and carries and the auras round it;
// then what stands apart: things put down, the solids, the floor / wall / ceiling, the ruler's box.
// Pick a row, then 開く (its tab), ↺ 初期状態に or 削除. The rows only point at what the other
// panels own (the figure's S, scSel, soSel, the aura list), so those panels do the work.
(() => {
let picked = null, shownKey = "";
const IC = window.ODMICONS || {svg: () => ""};
const PROPS_T = window.PROPS || {};
const TAB = {figure: "pose", item: "equip", aura: "equip", solid: "objects", env: "place", cube: "ruler"};
const ENV = [["floor", "床"], ["wall", "壁"], ["ceiling", "天井"]];
const nameOf = f => f.figName || `${f.figId || 1}人目`;
const sameRow = (a, b) => a && b && a.kind === b.kind && a.fig === b.fig && a.n === b.n;

function rows(){
  const figs = [{k: "active", f: S}, ...(S.others || []).map((f, k) => ({k, f}))].sort((a, b) => (a.f.figId || 1) - (b.f.figId || 1));
  const out = [], apart = [];
  for (const {k, f} of figs){
    out.push({kind: "figure", fig: k, depth: 0, name: nameOf(f), icon: "Person", note: k === "active" ? "編集中" : ""});
    (f.items || []).forEach((it, n) => {
      const d = PROPS_T[it.key] || {}, name = String(d.ja || it.key);
      if (it.where === "world" || d.place === "world" || d.place === "grab")
        apart.push({kind: "item", fig: k, n, depth: 0, name, icon: "AddModel", note: nameOf(f)});
      else out.push({kind: "item", fig: k, n, depth: 1, name, icon: "Fashion",
        note: it.where === "back" ? "背中" : d.place === "hand" ? (it.hand === "l" ? "左手" : "右手") : d.place === "wear" ? "身に着ける" : "構える"});
    });
    (f.auras || []).forEach((a, n) => out.push({kind: "aura", fig: k, n, depth: 1, icon: "Glow",
      name: (AURA_KINDS[a.kind] || AURA_KINDS.flame)[0].replace(/（.*$/, ""), note: (AURA_PARTS[a.part] || AURA_PARTS.body)[0]}));
  }
  (S.solids || []).forEach((o, n) => apart.push({kind: "solid", n, depth: 0, name: solidName(o), icon: "Home"}));
  const E = S.env || {};
  for (const [key, ja] of ENV) if (E[key]) apart.push({kind: "env", n: key, depth: 0, name: ja, icon: "FrameSize"});
  const r = S.ruler || {};
  if (r.on && r.cube) apart.push({kind: "cube", depth: 0, name: "定規の立方体", icon: "ruler"});
  return {figs: out, apart};
}
// the row's own figure becomes the one being edited, and its panel selects it
function focus(p){
  if (p.fig !== undefined && p.fig !== "active"){ switchFigure(p.fig); p.fig = "active"; }
  if (p.kind === "item"){ scSel = p.n; fillItemList(); }
  if (p.kind === "aura"){ $("auList").value = String(p.n); $("auList").dispatchEvent(new Event("change")); }
  if (p.kind === "solid"){ soSel = p.n; syncSolids(); }
}
function act(what){
  const p = picked; if (!p) return;
  focus(p);
  if (what === "open"){ if (window.ODMUI && ODMUI.showMenu) ODMUI.showMenu(TAB[p.kind]); render(true); return; }
  const E = () => (S.env = Object.assign(fresh().env, S.env || {}));
  if (what === "reset"){
    if (p.kind === "figure") $("resetFigure").click();
    else if (p.kind === "item") $("scReset").click();
    else if (p.kind === "solid") $("soReset").click();
    else if (p.kind === "cube") $("rulerReset").click();
    else if (p.kind === "aura"){ const a = (S.auras || [])[p.n]; if (!a) return; remember();
      a.size = 14; a.color = (AURA_KINDS[a.kind] || AURA_KINDS.flame)[1]; syncStyle(); draw(); say("オーラの大きさ・色を戻しました。"); }
    else if (p.kind === "env"){ remember(); const d = fresh().env, e = E();
      for (const k of {floor: ["floorY"], wall: ["wallZ", "wallX", "wallYaw"], ceiling: ["ceilingY"]}[p.n]) e[k] = d[k];
      afterEdit(); syncScene(); draw(); say(`${ENV.find(x => x[0] === p.n)[1]}を初期値に戻しました。`); }
  }
  if (what === "del"){
    if (p.kind === "figure") $("castDel").click();
    else if (p.kind === "item") $("scDel").click();
    else if (p.kind === "solid") $("soDel").click();
    else if (p.kind === "aura") $("auDel").click();
    else if (p.kind === "env"){ remember(); E()[p.n] = false; afterEdit(); syncScene(); draw(); }
    else if (p.kind === "cube"){ remember(); S.ruler.cube = false; syncUI(); draw(); }
    picked = null;
  }
  render(true);
}
function row(r){
  const li = document.createElement("li"), b = document.createElement("button");
  b.type = "button"; b.className = "tree-row d" + r.depth + (sameRow(r, picked) ? " on" : "");
  b.setAttribute("aria-pressed", String(sameRow(r, picked)));
  b.innerHTML = IC.svg(r.icon);
  const nm = document.createElement("span"); nm.textContent = r.name; b.appendChild(nm);
  if (r.note){ const s = document.createElement("span"); s.className = "tree-note"; s.textContent = r.note; b.appendChild(s); }
  b.addEventListener("click", () => { picked = {kind: r.kind, fig: r.fig, n: r.n}; render(true); });
  b.addEventListener("dblclick", () => { picked = {kind: r.kind, fig: r.fig, n: r.n}; act("open"); });
  li.appendChild(b); return li;
}
function render(force){
  const R = rows(), all = [...R.figs, ...R.apart];
  if (picked && !all.some(r => sameRow(r, picked))) picked = null;
  const key = JSON.stringify([all.map(r => [r.kind, r.fig, r.n, r.name, r.note]), picked]);
  if (!force && key === shownKey) return;
  shownKey = key;
  const ul = $("treeList"); ul.replaceChildren();
  const group = t => { const li = document.createElement("li"); li.className = "tree-group"; li.textContent = t; ul.appendChild(li); };
  group("人物と持ち物"); R.figs.forEach(r => ul.appendChild(row(r)));
  group("置いた物・場所"); if (R.apart.length) R.apart.forEach(r => ul.appendChild(row(r)));
  else { const li = document.createElement("li"); li.className = "tree-empty"; li.textContent = "まだありません"; ul.appendChild(li); }
  const k = picked && picked.kind;
  $("treeOpen").disabled = $("treeReset").disabled = !k;
  $("treeDel").disabled = !k || (k === "figure" && !(S.others || []).length);
}

const sec = document.createElement("section");
sec.dataset.menu = "scene";
sec.innerHTML = `<h2>シーンの一覧</h2>
  <ul class="tree" id="treeList" data-ui="skip" aria-label="シーンにある物"></ul>
  <div class="btns" style="margin-top:8px"><button id="treeOpen">開く</button><button id="treeReset">↺ 初期状態に</button><button id="treeDel">削除</button></div>
  <div class="hint">行を選んでから押します（ダブルクリックで開く）。持ち物・オーラは人物の下に、置いた物・物体・床と壁・定規の立方体は外側に並びます。</div>`;
$("castList").closest("section").before(sec);
$("treeOpen").addEventListener("click", () => act("open"));
$("treeReset").addEventListener("click", () => act("reset"));
$("treeDel").addEventListener("click", () => act("del"));
{ const sync0 = syncUI; syncUI = function(){ sync0(); render(); }; }
{ const draw0 = draw; draw = function(){ draw0(); render(); }; }
render(true);
})();
