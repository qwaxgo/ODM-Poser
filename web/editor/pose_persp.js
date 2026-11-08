// パースの誇張 (index.html, loaded after pose_objects.js): apart from the lens, while the camera is
// locked, each figure and object can have its perspective pushed further, about one pivot: what lies
// at the pivot's depth keeps its size, farther shrinks faster toward the vanishing points, nearer
// grows (a figure stands out while a mat under it and a pole behind it fall away fast). Each thing is
// drawn by its own camera, moved toward the pivot and its lens widened as much (pose_main.js: PX,
// pxOf), so its lines stay straight and its vanishing points move with it; the ruler and its guides
// share one strength, so the ruler's lines meet the guides' edges.
//
// S.persp: {pivot: {key: "f<id>" | "s<k>" | "i<n>", joint (a figure's), off [x, y, z] cm (a figure's:
//           on the scene's axes; an object's: in its own axes, null its middle)}, ruler: %}
// S.figExag (each figure's own, pose_cast.js), o.exag (a solid's or a thing's own): % (-100 to 100)
(() => {
const $ = id => document.getElementById(id);
const esc2 = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const persp = () => (S.persp = Object.assign({pivot: {key: "", joint: "pelvis", off: null}, ruler: 0}, S.persp || {}));

// ---- drawing and pressing: each figure by its own camera ----------------------------------------------
// (the figure's drawing and OpenPose are in pose_main.js; the things in pose_scene.js / pose_solids.js)
for (const name of ["pick", "dragPose", "dragIK", "dragPair", "dragBody", "dragMidPinned", "handPoints"]){
  const fn = window[name]; if (typeof fn !== "function") continue;
  window[name] = function(){ const a = arguments; return withPX(figPX(), () => fn.apply(this, a)); };
}
// the ruler and the guides: the ruler's strength (its vanishing points and eye level from the same lens)
for (const name of ["drawRuler", "guideEdges", "vanish", "horizonLine"]){
  const fn = window[name]; if (typeof fn !== "function") continue;
  window[name] = function(){ const a = arguments; return withPX(rulerPX(), () => fn.apply(this, a)); };
}

// ---- the panel: カメラ › パースの誇張 ------------------------------------------------------------------
const row = (id, label, min, max, step, unit, title) => `<div id="${id}Box"><label${title ? ` title="${title}"` : ""}>${label}</label><div class="row">` +
  `<input type="range" id="${id}R" min="${min}" max="${max}" step="${step}" value="0"><input type="number" class="num" id="${id}" step="${step}" value="0"><span class="unit">${unit}</span></div></div>`;
const sec = document.createElement("section");
sec.dataset.menu = "camera";
sec.innerHTML = `<h2>パースの誇張（物体ごと）</h2>
  <div class="hint" id="pxState"></div>
  <label title="この奥行きにある物は大きさが変わらず、奥ほど急に縮み、手前ほど大きくなる">支点（大きさが変わらない所）</label><select id="pxKey"></select>
  <div id="pxJointBox"><label>部位</label><select id="pxJoint">${J.map(n => `<option value="${n}">${esc2(J_JA[n] || n)}</option>`).join("")}</select></div>
  <div class="hint" id="pxOffHint"></div>
  ${row("pxOX", "支点の位置 X", -300, 300, 1, "cm")}${row("pxOY", "支点の位置 Y", -300, 300, 1, "cm")}${row("pxOZ", "支点の位置 Z", -300, 300, 1, "cm")}
  <div class="btns" style="margin-top:6px"><button type="button" id="pxOffReset" title="支点のずれをなくす（物体ならその真ん中）">↺ 支点の位置を戻す</button></div>
  ${row("pxFig", "編集中の人物の誇張", -100, 100, 1, "%", "0 で誇張なし。大きいほど、支点より奥が急に縮み、手前が大きくなる（マイナスは平らに）")}
  ${row("pxRuler", "パース定規・ガイド図形の誇張", -100, 100, 1, "%", "定規の線と消失点も、ガイド図形と同じ誇張に合わせる")}
  <div class="hint">物体（図形・小物）の誇張は、設置のタブで物ごとに決めます。手に持つ物・身に着ける物は、持っている人物と同じ誇張です。書き出す画像（アタリ・OpenPose・定規）にも入ります。</div>`;
{ const lock = $("camLock") && $("camLock").closest("section"); if (lock) lock.after(sec); else document.querySelector("aside").appendChild(sec); }

// 設置: the object's own strength (a guide's is the ruler's)
const plRow = document.createElement("div");
plRow.innerHTML = row("plEx", "パースの誇張", -100, 100, 1, "%", "カメラを固定しているとき、カメラ › パースの誇張の支点を中心に、この物だけパースを強める（奥ほど急に縮む）") +
  `<div class="hint" id="plExHint"></div>`;
{ const at = $("plPiv"); if (at) at.before(plRow); }

function pivotKeys(){
  const out = [["f" + (S.figId || 1), `人物：${S.figName || "1人目"}（編集中）`]];
  for (const f of S.others || []) out.push(["f" + (f.figId || 1), `人物：${f.figName || ""}`]);
  (S.solids || []).forEach((o, k) => out.push(["s" + k, `${o.guide ? "ガイド" : "図形"}：${typeof solidName === "function" ? solidName(o) : o.kind}`]));
  (S.items || []).forEach((it, n) => { if (typeof movable === "function" && movable(it)) out.push(["i" + n, `小物：${(PROPS_[it.key] || {}).ja || it.key}`]); });
  return out;
}
const pivKey = () => { const k = persp().pivot.key; return k || "f" + (S.figId || 1); };
const isObjKey = k => /^[si]\d+$/.test(k);
// the offset shown: a figure's as set; an object's in its own axes (its middle unless set)
function offNow(){
  const pv = persp().pivot, k = pivKey();
  if (Array.isArray(pv.off)) return pv.off;
  return isObjKey(k) && window.ODMObj ? (ODMObj.midRel(k) || [0, 0, 0]) : [0, 0, 0];
}
let listKey = "";
function sync(){
  const P = persp(), keys = pivotKeys(), lk = JSON.stringify(keys);
  if (lk !== listKey){ listKey = lk; $("pxKey").innerHTML = keys.map(([k, n]) => `<option value="${k}">${esc2(n)}</option>`).join(""); }
  const k = keys.some(([x]) => x === pivKey()) ? pivKey() : keys[0][0];
  $("pxKey").value = k;
  $("pxJointBox").style.display = isObjKey(k) ? "none" : "";
  if (!isObjKey(k)) $("pxJoint").value = P.pivot.joint || "pelvis";
  $("pxOffHint").textContent = isObjKey(k) ? "支点の位置は、その物体の座標（物体の向きに沿った X・Y・Z）です。" : "支点の位置は、選んだ部位からのずれ（場面の X・Y・Z）です。";
  $("pxState").textContent = S.camLock ? "カメラを固定しているので、誇張が効いています。" : "カメラを固定しているときだけ効きます（固定と記憶の「カメラを固定」）。";
  const put = (id, v) => { v = Math.round(v * 10) / 10; if (document.activeElement !== $(id)) $(id).value = v; if (document.activeElement !== $(id + "R")) $(id + "R").value = v; };
  offNow().forEach((v, i) => put(["pxOX", "pxOY", "pxOZ"][i], v));
  put("pxFig", +S.figExag || 0); put("pxRuler", +P.ruler || 0);
}
function syncPlace(){
  const k = window.ODMObj ? ODMObj.key() : "", o = /^s\d+$/.test(k) ? (S.solids || [])[+k.slice(1)] : null, it = /^i\d+$/.test(k) ? (S.items || [])[+k.slice(1)] : null;
  const guide = !!(o && o.guide);
  $("plExBox").style.display = (o || it) && !guide ? "" : "none";
  $("plExHint").textContent = guide ? "ガイド図形の誇張は、カメラ › パースの誇張の「パース定規・ガイド図形の誇張」で決めます。"
    : (o || it) && !S.camLock ? "誇張は、カメラを固定しているときだけ効きます。" : "";
  $("plExHint").style.display = $("plExHint").textContent ? "" : "none";
  const v = o ? +o.exag || 0 : it ? +it.exag || 0 : 0;
  if (document.activeElement !== $("plEx")) $("plEx").value = v; if (document.activeElement !== $("plExR")) $("plExR").value = v;
}
{ const d0 = draw; draw = function(){ d0.apply(this, arguments);
    if (sec.classList.contains("active")) sync();
    const pl = plRow.closest("section"); if (pl && pl.classList.contains("active")) syncPlace(); }; }

// the controls: one undo step per drag (the slider's pointerdown: pose_main.js), one per typed number
function setVal(id, v){
  const P = persp();
  if (id === "pxFig") S.figExag = v;
  else if (id === "pxRuler") P.ruler = v;
  else if (id === "plEx"){ const k = window.ODMObj ? ODMObj.key() : "", o = /^s\d+$/.test(k) ? S.solids[+k.slice(1)] : null, it = /^i\d+$/.test(k) ? S.items[+k.slice(1)] : null;
    const t = o || it; if (!t) return; if (v) t.exag = v; else delete t.exag; }
  else { const n = ["pxOX", "pxOY", "pxOZ"].indexOf(id); if (n < 0) return; const off = offNow().slice(); off[n] = v; P.pivot = Object.assign({}, P.pivot, {off}); }
  if (typeof afterEdit === "function") afterEdit(); draw();
}
for (const id of ["pxOX", "pxOY", "pxOZ", "pxFig", "pxRuler", "plEx"]){
  const r = $(id + "R"), n = $(id);
  r.addEventListener("input", () => { n.value = r.value; setVal(id, +r.value); });
  n.addEventListener("change", () => { const v = +n.value; if (!isFinite(v)) return; remember(); r.value = v; setVal(id, v); });
}
$("pxKey").addEventListener("change", () => { remember(); const P = persp(), k = $("pxKey").value;
  P.pivot = {key: k, joint: isObjKey(k) ? undefined : (P.pivot.joint || "pelvis"), off: null}; draw(); });
$("pxJoint").addEventListener("change", () => { remember(); const P = persp(); P.pivot = Object.assign({}, P.pivot, {key: pivKey(), joint: $("pxJoint").value}); draw(); });
$("pxOffReset").addEventListener("click", () => { remember(); const P = persp(); P.pivot = Object.assign({}, P.pivot, {off: null}); draw(); });
// the lock switched: the picture changes at once
if ($("camLock")) $("camLock").addEventListener("change", () => draw());
sync();

// i18n.js loads after this file: the table waits for it (ODMPoserI18nEarly)
(window.ODMPoserI18n || {add: t => (window.ODMPoserI18nEarly = window.ODMPoserI18nEarly || []).push(t)}).add({
  "パースの誇張（物体ごと）": "Exaggerated perspective (each thing)", "パースの誇張": "Exaggerated perspective",
  "支点（大きさが変わらない所）": "Pivot (where the size stays)",
  "この奥行きにある物は大きさが変わらず、奥ほど急に縮み、手前ほど大きくなる": "What lies at this depth keeps its size; farther shrinks faster, nearer grows",
  "部位": "Part", "支点の位置 X": "Pivot place X", "支点の位置 Y": "Pivot place Y", "支点の位置 Z": "Pivot place Z",
  "↺ 支点の位置を戻す": "↺ Pivot place back", "支点のずれをなくす（物体ならその真ん中）": "No offset (an object: its middle)",
  "編集中の人物の誇張": "The edited figure's exaggeration", "パース定規・ガイド図形の誇張": "The ruler's and guides' exaggeration",
  "0 で誇張なし。大きいほど、支点より奥が急に縮み、手前が大きくなる（マイナスは平らに）": "0: none. The more, the faster what lies behind the pivot shrinks and what is in front grows (below 0: flatter)",
  "定規の線と消失点も、ガイド図形と同じ誇張に合わせる": "The ruler's lines and vanishing points follow the guides' exaggeration",
  "物体（図形・小物）の誇張は、設置のタブで物ごとに決めます。手に持つ物・身に着ける物は、持っている人物と同じ誇張です。書き出す画像（アタリ・OpenPose・定規）にも入ります。":
    "Each object's (shapes, things) is set in the Objects tab. Things held or worn go with their figure. The exported pictures (rough, OpenPose, ruler) have it too.",
  "支点の位置は、その物体の座標（物体の向きに沿った X・Y・Z）です。": "The pivot's place is in the object's own coordinates (X, Y, Z along its turn).",
  "支点の位置は、選んだ部位からのずれ（場面の X・Y・Z）です。": "The pivot's place is an offset from the part (the scene's X, Y, Z).",
  "カメラを固定しているので、誇張が効いています。": "The camera is locked, so the exaggeration is on.",
  "カメラを固定しているときだけ効きます（固定と記憶の「カメラを固定」）。": "Works only while the camera is locked (\"Lock the camera\" under Lock and saved cameras).",
  "カメラを固定しているとき、カメラ › パースの誇張の支点を中心に、この物だけパースを強める（奥ほど急に縮む）":
    "While the camera is locked, this thing alone gets stronger perspective about the pivot in Camera › Exaggerated perspective (farther shrinks faster)",
  "ガイド図形の誇張は、カメラ › パースの誇張の「パース定規・ガイド図形の誇張」で決めます。": "A guide's is set by \"The ruler's and guides' exaggeration\" in Camera › Exaggerated perspective.",
  "誇張は、カメラを固定しているときだけ効きます。": "The exaggeration works only while the camera is locked."});
})();
