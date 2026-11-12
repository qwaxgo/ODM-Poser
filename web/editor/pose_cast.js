// The second figure and more (index.html, loaded after pose_scene.js). The figure being edited
// lives in S itself (P, R, hands, ...), so every tool works on it unchanged; the others wait in
// S.others with the same fields and are swapped in to be drawn. Clicking another figure's circle
// (or picking it in the list) makes it the one being edited. The floor, walls, solids, ruler and
// camera are shared; each figure has its own pose, body, hands, pins, things, auras and wire.
// Things put down (or placed on their own) stand apart: they stay with the figure being edited, so
// 配置 mode moves them whoever is edited. Each figure can be moved and turned as a whole, and the
// pictures can show everyone or one figure (書き出す人物).
//
// S.others: [{P, R, hands, fingers, fingerLen, head, body, twist, pins, items, auras, wire, scale, shape, sex, figId, figName, torso3d}]
// 胴体を立体 (torso3d) is each figure's own; a figure from before it was takes the one edited then
const FIG_KEYS = ["P", "R", "hands", "fingers", "fingerLen", "handApart", "head", "body", "twist", "pins", "items", "auras", "wire", "scale", "shape", "sex", "figId", "figName", "torso3d", "stand"];
function takeFigure(){ const f = {}; for (const k of FIG_KEYS) f[k] = S[k]; return f; }
function putFigure(f){ const d = fresh(), keep = S.torso3d;
  for (const k of FIG_KEYS) S[k] = f[k] !== undefined ? f[k] : k === "torso3d" && keep !== undefined ? keep : d[k]; }
function withFigure(f, fn){ const keep = takeFigure(); putFigure(f); try { return fn(); } finally { putFigure(keep); } }
// every figure, the farthest first: fn(active, first)
function everyFigure(fn){
  const others = S.others || [];
  if (!others.length) return fn(true, true);
  const depth = P => toCam(P[IX.pelvis])[2];
  const list = [{f: null, z: depth(S.P)}, ...others.map(f => ({f, z: depth(f.P)}))].sort((a, b) => a.z - b.z);
  list.forEach((e, i) => (e.f ? withFigure(e.f, () => fn(false, i === 0)) : fn(true, i === 0)));
}

// one figure alone (S.figId id), as if the others were not there; a figure gone: everyone
function onlyFigure(id, fn){
  const others = S.others || [], f = (S.figId || 1) === id ? null : others.find(o => (o.figId || 1) === id);
  if (f === undefined) return fn();
  const keep = takeFigure(); S.others = [];
  try { if (f) putFigure(f); return fn(); } finally { putFigure(keep); S.others = others; }
}
// 書き出す人物: "all" or a figure's id
const exportWho = () => { const v = $("castExport") ? $("castExport").value : "all"; return v === "all" ? "all" : +v; };

// ---- drawing: the others lighter in the editor, all alike in the export; the floor once ---------
{ const core = drawAtari;
  drawAtari = function(ctx, W, H, opts = {}){
    if (opts.export && exportWho() !== "all") return onlyFigure(exportWho(), () => core(ctx, W, H, opts));
    // the bodies that hide lines: all figures, taken before they are swapped in one by one
    occFrozen = S.hiddenDashed ? occluders(W, H) : null;
    try {
      everyFigure((active, first) => core(ctx, W, H, Object.assign({}, opts, first ? {} : {noEnv: true},
        active || opts.export ? {} : {sel: -1, ink: cssVar("--far")})));
    } finally { occFrozen = null; }
  };
}
{ const op = drawOpenpose;                    // OpenPose: one person each, one background
  drawOpenpose = function(ctx, W, H, noBg){
    if (exportWho() !== "all") return onlyFigure(exportWho(), () => op(ctx, W, H, noBg));
    everyFigure((active, first) => op(ctx, W, H, noBg || !first)); };
}
{ const ap = applyPreset;                     // a preset keeps where the figure stands
  applyPreset = function(name){
    const c = S.P[IX.pelvis].slice(); ap(name);
    const n = S.P[IX.pelvis], d = [c[0] - n[0], 0, c[2] - n[2]];
    S.P = S.P.map(p => add(p, d));
  };
}

// ---- things apart: with whoever is edited ------------------------------------------------------------
const loose = it => typeof movable === "function" && movable(it);
function passLoose(from, to){
  const go = (from.items || []).filter(loose); if (!go.length) return;
  from.items = from.items.filter(it => !loose(it)); to.items = [...(to.items || []), ...go];
}
function gatherLoose(){ for (const f of S.others || []) passLoose(f, S); }      // a file from before: into the one edited

// ---- switching, adding, removing ---------------------------------------------------------------
function switchFigure(k){
  const f = (S.others || [])[k]; if (!f) return;
  const cur = takeFigure(); passLoose(cur, f);
  S.others[k] = cur; putFigure(f); sel = -1;
  if (typeof scSel === "number") scSel = -1;
  syncUI(); draw();
}
// the figure being edited moved by d (x, z) and turned by yaw degrees about its hips; its pins and
// wire come along (the things it holds follow its hands; things put down stay)
function placeFigure(d, yaw){
  const c = S.P[IX.pelvis].slice(), a = deg(yaw || 0);
  const tr = p => add(add(c, rotY(sub(p, c), a)), d);
  S.P = S.P.map(tr);
  for (const k of Object.keys(S.pins || {})) S.pins[k] = tr(S.pins[k]);
  if (S.wire && S.wire.anchor) S.wire.anchor = tr(S.wire.anchor);
  if (yaw && typeof turnBody === "function") turnBody([0, 1, 0], a);
}
function newFigureId(){ return Math.max(S.figId || 1, ...(S.others || []).map(f => f.figId || 1)) + 1; }
function addFigure(copy){
  remember();
  let f;
  if (copy){ f = JSON.parse(JSON.stringify(takeFigure())); f.items = (f.items || []).filter(it => !loose(it)); }
  else { const d = fresh(); f = {}; for (const k of FIG_KEYS) f[k] = d[k]; }
  f.figId = newFigureId(); f.figName = `${f.figId}人目`; f.pins = {};
  // beside the one being edited (to the screen's right), on the same floor
  const right = camRotInv([1, 0, 0]), side = norm([right[0], 0, right[2]]);
  const c = S.P[IX.pelvis], b = f.P[IX.pelvis];
  const d = [c[0] - b[0] + side[0] * 60, 0, c[2] - b[2] + side[2] * 60];
  f.P = f.P.map(p => add(p, d));
  (f.items || []).forEach(it => { if (it.base) it.base = add(it.base, d); });
  if (f.wire && f.wire.anchor) f.wire.anchor = add(f.wire.anchor, d);
  S.others = S.others || [];
  const cur = takeFigure(); passLoose(cur, f);
  S.others.push(cur); putFigure(f); sel = -1;
  if (typeof scSel === "number") scSel = -1;
  afterEdit(); syncUI(); draw();
  say(`${f.figName}を${copy ? "複製して" : ""}追加しました。いま編集しているのは${f.figName}です。`);
}
function removeFigure(){
  const others = S.others || [];
  if (!others.length){ say("人物が1人のときは削除できません。", true); return; }
  remember();
  const gone = S.figName;
  let k = 0; others.forEach((f, i) => { if ((f.figId || 0) < (others[k].figId || 0)) k = i; });
  const next = others.splice(k, 1)[0]; passLoose(S, next);
  putFigure(next); sel = -1;
  if (typeof scSel === "number") scSel = -1;
  syncUI(); draw(); say(`${gone}を削除しました。`);
}
// clicking another figure's circle edits that figure (the click then goes on as usual)
DOWN_HOOKS.push((cv, x, y) => {
  if (cv !== front || !(S.others || []).length || pick(cv, x, y) >= 0) return null;
  const W = cv.width, H = cv.height;
  let best = -1, bd = Infinity;
  S.others.forEach((f, k) => withFigure(f, () => {
    const j = pick(cv, x, y); if (j < 0) return;
    const q = project(S.P[j], W, H), dd = Math.hypot(q.x - x, q.y - y);
    if (dd < bd){ bd = dd; best = k; }
  }));
  if (best >= 0){ switchFigure(best); say(`${S.figName}を編集しています。`); }
  return null;
});

// ---- the panel ------------------------------------------------------------------------------------
function buildCastPanel(){
  const sec = document.createElement("section");
  sec.innerHTML = `<h2>人物</h2>
    <select id="castList" size="3"></select>
    <div class="btns" style="margin-top:6px"><button id="castAdd">人物を追加</button><button id="castDup">複製</button><button id="castDel">削除</button></div>
    <label>名前</label><input type="text" id="castName" >
    <div class="grid2"><div><label>位置（左右）</label><div class="row"><input type="number" class="num" id="castX" step="5"><span class="unit">cm</span></div></div>
      <div><label>位置（前後）</label><div class="row"><input type="number" class="num" id="castZ" step="5"><span class="unit">cm</span></div></div></div>
    <label>向き</label><div class="row"><input type="range" id="castYaw" min="-180" max="180" step="1"><input type="number" class="num" id="castYawN" step="1"><span class="unit">°</span></div>
    <div class="hint">ポーズ・体格・小物・オーラは、選んだ人物だけに効きます（ほかの人物は薄く表示）。ほかの人物の丸をクリックしても切り替わります。床・壁・物体・定規・カメラと、床に置いた物はみんなで共通です。位置と向きは編集中の人物を丸ごと動かします。</div>`;
  const presets = $("preset").closest("section");
  presets.parentNode.insertBefore(sec, presets.nextSibling);
  $("castAdd").addEventListener("click", () => addFigure(false));
  $("castDup").addEventListener("click", () => addFigure(true));
  $("castDel").addEventListener("click", removeFigure);
  $("castList").addEventListener("change", e => { const v = e.target.value; if (v !== "active") switchFigure(+v); });
  $("castName").addEventListener("change", e => { remember(); S.figName = e.target.value.trim() || `${S.figId || 1}人目`; syncCast(); });
  const at = () => S.P[IX.pelvis];
  const moveTo = (i, v) => { if (!isFinite(v)) return; remember(); const d = [0, 0, 0]; d[i] = v - at()[i]; placeFigure(d, 0); afterEdit(); draw(); syncCast(); };
  $("castX").addEventListener("change", e => moveTo(0, +e.target.value));
  $("castZ").addEventListener("change", e => moveTo(2, +e.target.value));
  const turnTo = v => { if (!isFinite(v)) return; placeFigure([0, 0, 0], v - facingYaw()); afterEdit(); draw(); };
  $("castYaw").addEventListener("pointerdown", remember);
  $("castYaw").addEventListener("keydown", remember);
  $("castYaw").addEventListener("input", e => { $("castYawN").value = e.target.value; turnTo(+e.target.value); });
  $("castYawN").addEventListener("change", e => { remember(); $("castYaw").value = e.target.value; turnTo(+e.target.value); syncCast(); });
  // 書き出し: who the pictures show
  const ex = document.createElement("div");
  ex.innerHTML = `<label>書き出す人物</label><select id="castExport"><option value="all">全員</option></select>`;
  $("saveAtari").closest(".btns").before(...ex.childNodes);
}
function syncCast(){
  const list = [{v: "active", id: S.figId || 1, name: S.figName || "1人目", active: true},
    ...(S.others || []).map((f, k) => ({v: String(k), id: f.figId || 1, name: f.figName || `${f.figId || k + 2}人目`}))].sort((a, b) => a.id - b.id);
  $("castList").innerHTML = list.map(e => `<option value="${e.v}">${e.name.replace(/&/g, "&amp;").replace(/</g, "&lt;")}${e.active ? "（編集中）" : ""}</option>`).join("");
  $("castList").value = "active";
  if (document.activeElement !== $("castName")) $("castName").value = S.figName || "1人目";
  $("castDel").disabled = !(S.others || []).length;
  const r = v => Math.round(v * 10) / 10, p = S.P[IX.pelvis];
  for (const [id, v] of [["castX", r(p[0])], ["castZ", r(p[2])]]) if (document.activeElement !== $(id)) $(id).value = v;
  const yaw = Math.round(facingYaw());
  if (rangeHeld !== $("castYaw")) $("castYaw").value = yaw;
  if (document.activeElement !== $("castYawN")) $("castYawN").value = yaw;
  // 書き出す人物: everyone, or one of them (kept while that figure is there)
  const ex = $("castExport"), was = ex.value;
  ex.innerHTML = `<option value="all">全員</option>` + list.map(e => `<option value="${e.id}">${e.name.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</option>`).join("");
  ex.value = list.some(e => String(e.id) === was) ? was : "all";
}
buildCastPanel();
syncCast();
{ const sync0 = syncUI; syncUI = function(){ gatherLoose(); sync0(); syncCast(); }; }
