// プリセットの記憶 (index.html, loaded after pose_cast.js): two kinds, kept apart and in this browser,
// so one never brings the other back with it:
//  - ポーズ・小物・位置: the figure's pose (its bones' directions, its turn, twists, hands and each finger's joints (S.fingers), head),
//    what it holds and wears, and where it stands. Put on another body, that body keeps its own
//    lengths and thicknesses.
//  - 体格: the bones' lengths, the circles' thicknesses, the shoulders' and thigh roots' places, the fingers' lengths (S.fingerLen) and
//    the sex. The pose stays; the body grows from its lowest point (fromBottom). Built in: 標準,
//    女性, 男性.
// The ポーズのプリセット above (the editor's own poses and the user presets) keep the body too.
(() => {
const $ = id => document.getElementById(id);
const LS = {pose: KEY + "-posesets", body: KEY + "-bodysets"};
function load(k){ try { const v = JSON.parse(localStorage.getItem(LS[k]) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
function store(k, list){
  try { localStorage.setItem(LS[k], JSON.stringify(list)); return true; }
  catch (e) { say("このブラウザには記憶できませんでした（容量か設定のため）。", true); return false; }
}
const esc = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const r2 = v => Math.round(v * 100) / 100;
const copy = v => JSON.parse(JSON.stringify(v));

// ---- ポーズ・小物・位置 ----------------------------------------------------------------------------
const held = () => (S.items || []).filter(it => !(typeof loose === "function" && loose(it)));
function takePose(name){
  return {name, P: S.P.map(p => p.map(r2)), body: copy(S.body), twist: S.twist.slice(), hands: copy(S.hands), fingers: copy(S.fingers || {}),
    head: copy(S.head || {}), items: copy(held())};
}
function putPose(d){
  const cur = S.P.map(p => p.slice()), out = [d.P[0].slice()];
  for (let i = 1; i < J.length; i++){ const p = PARENT[i];
    out[i] = add(out[p], mul(norm(sub(d.P[i], d.P[p])), len(sub(cur[i], cur[p])))); }
  // as high above the floor as it was saved (a pose standing stands, one in the air stays in the air)
  const lift = Math.min(...d.P.map(p => p[1])) - Math.min(...out.map(p => p[1]));
  S.P = out.map(p => [p[0], p[1] + lift, p[2]]); S.body = copy(d.body || fresh().body); S.twist = (d.twist || []).slice(0, J.length);
  while (S.twist.length < J.length) S.twist.push(0);
  S.hands = Object.assign(fresh().hands, d.hands); S.fingers = copy(d.fingers || {}); S.head = Object.assign(fresh().head, d.head);
  S.items = [...(S.items || []).filter(it => typeof loose === "function" && loose(it)), ...copy(d.items || [])];
  S.pins = {};
  if (typeof scSel === "number") scSel = -1;
}

// ---- 体格 --------------------------------------------------------------------------------------
function takeBody(name){
  return {name, len: J.map((_, i) => i ? r2(len(sub(S.P[i], S.P[PARENT[i]]))) : 0), R: S.R.map(r2),
    shape: S.shape ? copy(S.shape) : null, scale: copy(S.scale || fresh().scale), sex: S.sex || null, fingerLen: fingerLens()};
}
function putBody(d){
  fromBottom(() => {
    const old = S.P.map(p => p.slice()), out = [old[0].slice()];
    for (let i = 1; i < J.length; i++){ const p = PARENT[i], L = +d.len[i] || len(sub(old[i], old[p]));
      out[i] = add(out[p], mul(norm(sub(old[i], old[p])), L)); }
    S.P = out; S.R = d.R.slice(0, J.length);
    if (d.shape) S.shape = copy(d.shape); else delete S.shape;
    S.scale = Object.assign(fresh().scale, d.scale);
    if (d.sex) S.sex = d.sex; else delete S.sex;
    S.fingerLen = Array.isArray(d.fingerLen) ? d.fingerLen.slice(0, 5) : fresh().fingerLen;
  });
}
// built in: the standard body, and 女性 / 男性 on it
function builtBody(kind){
  fromBottom(() => { S.P = withBoneLengths(S.P, REST); S.R = REST_R.slice(); S.scale = fresh().scale; S.fingerLen = fresh().fingerLen; delete S.shape; delete S.sex; });
  if (kind !== "std") applySex(kind);
}
const BUILT = [["std", "標準"], ["female", "女性"], ["male", "男性"]];

// ---- the panel ----------------------------------------------------------------------------------
const presets = $("preset").closest("section");
const poseSec = document.createElement("section");
poseSec.dataset.menu = "preset";
poseSec.innerHTML = `<h2>ポーズ・小物・位置の記憶</h2>
  <div class="row"><input type="text" id="psName" placeholder="名前（例：剣を構える）"><button type="button" id="psSave">記憶</button></div>
  <select id="psList" size="4"></select>
  <div class="btns"><button type="button" id="psLoad">呼び出す</button><button type="button" id="psDel">削除</button></div>
  <div class="hint">いまの人物のポーズ・持ち物・身に着けた物・位置を記憶します。呼び出しても体格（骨の長さ・太さ）はその人物のままです。このブラウザに残ります。</div>`;
const bodySec = document.createElement("section");
bodySec.dataset.menu = "preset body";
bodySec.innerHTML = `<h2>体格プリセット</h2>
  <select id="bsList" size="5"></select>
  <div class="btns"><button type="button" id="bsLoad">この体格にする</button><button type="button" id="bsDel">削除</button></div>
  <div class="row"><input type="text" id="bsName" placeholder="名前（例：大柄な男性）"><button type="button" id="bsSave">いまの体格を記憶</button></div>
  <div class="hint">骨の長さ・太さ・肩と股の位置・性別だけを変えます。ポーズ・持ち物・位置はそのままで、足元は動きません。記憶した体格はこのブラウザに残ります。</div>`;
presets.after(poseSec, bodySec);

function fill(){
  const ps = load("pose"), bs = load("body");
  $("psList").innerHTML = ps.map((d, k) => `<option value="${k}">${esc(d.name)}</option>`).join("");
  $("bsList").innerHTML = BUILT.map(([k, n]) => `<option value="b:${k}">${n}（組み込み）</option>`).join("") +
    bs.map((d, k) => `<option value="u:${k}">${esc(d.name)}</option>`).join("");
  $("psLoad").disabled = $("psDel").disabled = !ps.length;
}
const nameOf = (id, base, list) => ($(id).value.trim() || `${base}${list.length + 1}`).slice(0, 60);
$("psSave").addEventListener("click", () => {
  const list = load("pose"), name = nameOf("psName", "ポーズ", list), at = list.findIndex(d => d.name === name);
  const d = takePose(name); if (at >= 0) list[at] = d; else list.push(d);
  if (store("pose", list)){ $("psName").value = ""; fill(); $("psList").value = String(at >= 0 ? at : list.length - 1);
    say(`「${name}」を記憶しました（ポーズ・小物・位置）。`); }
});
const psLoad = () => { const d = load("pose")[+$("psList").value]; if (!d || !Array.isArray(d.P) || d.P.length !== J.length) return;
  remember(); putPose(d); afterEdit(); syncUI(); draw(); say(`「${d.name}」を呼び出しました（体格はそのまま）。`); };
$("psLoad").addEventListener("click", psLoad);
$("psList").addEventListener("dblclick", psLoad);
$("psDel").addEventListener("click", () => { const list = load("pose"), k = +$("psList").value; if (!list[k]) return;
  const [d] = list.splice(k, 1); if (store("pose", list)){ fill(); say(`「${d.name}」を削除しました。`); } });
$("bsSave").addEventListener("click", () => {
  const list = load("body"), name = nameOf("bsName", "体格", list), at = list.findIndex(d => d.name === name);
  const d = takeBody(name); if (at >= 0) list[at] = d; else list.push(d);
  if (store("body", list)){ $("bsName").value = ""; fill(); $("bsList").value = "u:" + (at >= 0 ? at : list.length - 1);
    say(`体格「${name}」を記憶しました。`); }
});
const bsLoad = () => {
  const v = $("bsList").value || "", k = v.slice(2);
  if (v.startsWith("b:")){ remember(); builtBody(k); afterEdit(); syncUI(); draw();
    say(`${BUILT.find(b => b[0] === k)[1]}の体格にしました（ポーズはそのまま）。`); return; }
  const d = load("body")[+k]; if (!d || !Array.isArray(d.len) || d.len.length !== J.length || !Array.isArray(d.R)) return;
  remember(); putBody(d); afterEdit(); syncUI(); draw(); say(`体格「${d.name}」にしました（ポーズはそのまま）。`);
};
$("bsLoad").addEventListener("click", bsLoad);
$("bsList").addEventListener("dblclick", bsLoad);
$("bsList").addEventListener("change", () => { $("bsDel").disabled = !($("bsList").value || "").startsWith("u:"); });
$("bsDel").addEventListener("click", () => { const v = $("bsList").value || ""; if (!v.startsWith("u:")) return;
  const list = load("body"), [d] = list.splice(+v.slice(2), 1); if (d && store("body", list)){ fill(); say(`体格「${d.name}」を削除しました。`); } });
fill(); $("bsDel").disabled = true;

// i18n.js loads after this file: the table waits for it (ODMPoserI18nEarly)
(window.ODMPoserI18n || {add: t => (window.ODMPoserI18nEarly = window.ODMPoserI18nEarly || []).push(t)}).add({
  "ポーズ・小物・位置の記憶": "Pose, things and place: saved", "名前（例：剣を構える）": "Name (e.g. sword ready)", "記憶": "Save",
  "呼び出す": "Load", "削除": "Delete",
  "いまの人物のポーズ・持ち物・身に着けた物・位置を記憶します。呼び出しても体格（骨の長さ・太さ）はその人物のままです。このブラウザに残ります。":
    "Saves this figure's pose, what it holds and wears, and where it stands. Loaded, the figure keeps its own body (bone lengths, thickness). Kept in this browser.",
  "体格プリセット": "Body presets", "この体格にする": "Use this body", "名前（例：大柄な男性）": "Name (e.g. big man)", "いまの体格を記憶": "Save this body",
  "骨の長さ・太さ・肩と股の位置・性別だけを変えます。ポーズ・持ち物・位置はそのままで、足元は動きません。記憶した体格はこのブラウザに残ります。":
    "Changes only the bone lengths, thickness, the shoulders' and thigh roots' places and the sex. The pose, things and place stay, and so do the feet. Saved bodies are kept in this browser.",
  "標準（組み込み）": "Standard (built in)", "女性（組み込み）": "Female (built in)", "男性（組み込み）": "Male (built in)",
  "このブラウザには記憶できませんでした（容量か設定のため）。": "This browser could not save it (space or settings)."});
})();
