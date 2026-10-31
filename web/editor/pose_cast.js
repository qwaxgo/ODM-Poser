// The second figure and more (index.html, loaded after pose_scene.js). The figure being edited
// lives in S itself (P, R, hands, ...), so every tool works on it unchanged; the others wait in
// S.others with the same fields and are swapped in to be drawn. Clicking another figure's circle
// (or picking it in the list) makes it the one being edited. The floor, walls, solids, ruler and
// camera are shared; each figure has its own pose, body, hands, pins, things, auras and wire.
//
// S.others: [{P, R, hands, head, body, twist, pins, items, auras, wire, figId, figName}]
const FIG_KEYS = ["P", "R", "hands", "head", "body", "twist", "pins", "items", "auras", "wire", "scale", "figId", "figName"];
function takeFigure(){ const f = {}; for (const k of FIG_KEYS) f[k] = S[k]; return f; }
function putFigure(f){ const d = fresh(); for (const k of FIG_KEYS) S[k] = f[k] !== undefined ? f[k] : d[k]; }
function withFigure(f, fn){ const keep = takeFigure(); putFigure(f); try { return fn(); } finally { putFigure(keep); } }
// every figure, the farthest first: fn(active, first)
function everyFigure(fn){
  const others = S.others || [];
  if (!others.length) return fn(true, true);
  const depth = P => toCam(P[IX.pelvis])[2];
  const list = [{f: null, z: depth(S.P)}, ...others.map(f => ({f, z: depth(f.P)}))].sort((a, b) => a.z - b.z);
  list.forEach((e, i) => (e.f ? withFigure(e.f, () => fn(false, i === 0)) : fn(true, i === 0)));
}

// ---- drawing: the others lighter in the editor, all alike in the export; the floor once ---------
{ const core = drawAtari;
  drawAtari = function(ctx, W, H, opts = {}){
    // the bodies that hide lines: all figures, taken before they are swapped in one by one
    occFrozen = S.hiddenDashed ? occluders(W, H) : null;
    try {
      everyFigure((active, first) => core(ctx, W, H, Object.assign({}, opts, first ? {} : {noEnv: true},
        active || opts.export ? {} : {sel: -1, ink: cssVar("--far")})));
    } finally { occFrozen = null; }
  };
}
{ const op = drawOpenpose;                    // OpenPose: one person each, one background
  drawOpenpose = function(ctx, W, H, noBg){ everyFigure((active, first) => op(ctx, W, H, noBg || !first)); };
}
{ const ap = applyPreset;                     // a preset keeps where the figure stands
  applyPreset = function(name){
    const c = S.P[IX.pelvis].slice(); ap(name);
    const n = S.P[IX.pelvis], d = [c[0] - n[0], 0, c[2] - n[2]];
    S.P = S.P.map(p => add(p, d));
  };
}

// ---- switching, adding, removing ---------------------------------------------------------------
function switchFigure(k){
  const f = (S.others || [])[k]; if (!f) return;
  S.others[k] = takeFigure(); putFigure(f); sel = -1;
  syncUI(); draw();
}
function newFigureId(){ return Math.max(S.figId || 1, ...(S.others || []).map(f => f.figId || 1)) + 1; }
function addFigure(copy){
  remember();
  let f;
  if (copy) f = JSON.parse(JSON.stringify(takeFigure()));
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
  S.others.push(takeFigure()); putFigure(f); sel = -1;
  afterEdit(); syncUI(); draw();
  say(`${f.figName}を${copy ? "複製して" : ""}追加しました。いま編集しているのは${f.figName}です。`);
}
function removeFigure(){
  const others = S.others || [];
  if (!others.length){ say("人物が1人のときは削除できません。", true); return; }
  remember();
  const gone = S.figName;
  let k = 0; others.forEach((f, i) => { if ((f.figId || 0) < (others[k].figId || 0)) k = i; });
  putFigure(others.splice(k, 1)[0]); sel = -1;
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
    <div class="hint">ポーズ・体格・小物・オーラは、選んだ人物だけに効きます（ほかの人物は薄く表示）。ほかの人物の丸をクリックしても切り替わります。床・壁・物体・定規・カメラはみんなで共通です。</div>`;
  const presets = $("preset").closest("section");
  presets.parentNode.insertBefore(sec, presets.nextSibling);
  $("castAdd").addEventListener("click", () => addFigure(false));
  $("castDup").addEventListener("click", () => addFigure(true));
  $("castDel").addEventListener("click", removeFigure);
  $("castList").addEventListener("change", e => { const v = e.target.value; if (v !== "active") switchFigure(+v); });
  $("castName").addEventListener("change", e => { remember(); S.figName = e.target.value.trim() || `${S.figId || 1}人目`; syncCast(); });
}
function syncCast(){
  const list = [{v: "active", id: S.figId || 1, name: S.figName || "1人目", active: true},
    ...(S.others || []).map((f, k) => ({v: String(k), id: f.figId || 1, name: f.figName || `${f.figId || k + 2}人目`}))].sort((a, b) => a.id - b.id);
  $("castList").innerHTML = list.map(e => `<option value="${e.v}">${e.name.replace(/&/g, "&amp;").replace(/</g, "&lt;")}${e.active ? "（編集中）" : ""}</option>`).join("");
  $("castList").value = "active";
  if (document.activeElement !== $("castName")) $("castName").value = S.figName || "1人目";
  $("castDel").disabled = !(S.others || []).length;
}
buildCastPanel();
syncCast();
{ const sync0 = syncUI; syncUI = function(){ sync0(); syncCast(); }; }
