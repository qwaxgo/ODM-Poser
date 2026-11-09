// 側面図 (index.html, loaded after pose_persp.js): the side view's own camera, 見る › 視点 › 側面図. It looks
// from the camera's right or left, 90° from the camera's direction, and follows the camera's turn; on
// top of that it can be turned round (yaw) and tilted (pitch), zoomed and moved, round a centre: the
// camera's look-at point, or a figure's joint or an object (it follows them). On the side view itself:
// the wheel zooms, the middle button (or Alt + a drag where there is no joint) turns it, with Shift
// moves it. The projection is in pose_main.js (sideView, sideBasis, sideProject).
//
// S.sideView: {from: "r" | "l", key: "" | "f<id>" | "s<k>" | "i<n>", joint, yaw, pitch (degrees),
//              zoom, pan [x, y, z] cm}
(() => {
const $ = id => document.getElementById(id);
const esc2 = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const SV = () => (S.sideView = Object.assign(sideView(), S.sideView || {}));
const isObj = k => /^[si]\d+$/.test(k);

// ---- on the side view: the wheel, the middle button, Alt + drag --------------------------------------
side.addEventListener("wheel", e => {
  e.preventDefault();
  const dy = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaMode === 2 ? e.deltaY * 600 : e.deltaY;
  if (!dy) return;
  const v = SV(); v.zoom = Math.max(0.25, Math.min(6, (+v.zoom || 1) * Math.exp(-dy / 500)));
  drawSoon(); syncSoon();
}, {passive: false});
{ const d0 = down; down = function(cv, e){
    if (cv === side && e.pointerType !== "touch" && (e.button === 1 || (e.altKey && pick(cv, ...evPos(cv, e)) < 0))){
      const [x, y] = evPos(cv, e), pan = !!e.shiftKey; remember();
      let lx = x, ly = y;
      drag = {move(mx, my){
        const v = SV(), W = side.width, H = side.height, dx = mx - lx, dy = my - ly; lx = mx; ly = my;
        if (pan){ const B = sideBasis(W, H); v.pan = add(Array.isArray(v.pan) ? v.pan : [0, 0, 0], add(mul(B.ex, -dx / B.k), mul(B.ey, dy / B.k))); }
        else { v.yaw = wrap((+v.yaw || 0) + dx * 240 / W); v.pitch = Math.max(-80, Math.min(80, (+v.pitch || 0) + dy * 180 / H)); }
        syncSoon(); }, end(){ sync(); draw(); }};
      return;
    }
    return d0.apply(this, arguments); }; }
const wrap = a => ((a + 180) % 360 + 360) % 360 - 180;
let syncQ = false;
function syncSoon(){ if (syncQ) return; syncQ = true; requestAnimationFrame(() => { syncQ = false; if (sec.classList.contains("active")) sync(); }); }

// ---- the panel: 見る › 視点 › 側面図 --------------------------------------------------------------------
const row = (id, label, min, max, step, unit) => `<div><label>${label}</label><div class="row">` +
  `<input type="range" id="${id}R" min="${min}" max="${max}" step="${step}" value="0"><input type="number" class="num" id="${id}" step="${step}" value="0"><span class="unit">${unit}</span></div></div>`;
const sec = document.createElement("section");
sec.dataset.menu = "sideview";              // 見る › 視点 › 側面図 (ui-menu.js)
sec.innerHTML = `<h2>側面図のカメラ</h2>
  <label>見る向き</label>
  <select id="svFrom"><option value="r">右から（カメラの右側）</option><option value="l">左から（カメラの左側）</option></select>
  <label title="側面図はこの点を真ん中にして回る（人物・物体を選ぶと、それに付いていく）">中心（支点）</label><select id="svKey"></select>
  <div id="svJointBox"><label>部位</label><select id="svJoint">${J.map(n => `<option value="${n}">${esc2(J_JA[n] || n)}</option>`).join("")}</select></div>
  ${row("svYaw", "回転（左右）", -180, 180, 1, "°")}${row("svPitch", "見下ろす角度（上下）", -80, 80, 1, "°")}${row("svZoom", "拡大", 25, 600, 1, "%")}
  <div class="btns" style="margin-top:6px"><button type="button" id="svToSel" title="選んでいる関節・物体を側面図の中心にする">選んだ物を中心に</button>
    <button type="button" id="svReset" title="回転・見下ろす角度・拡大・ずらした分を戻す（カメラから90°・水平）">↺ 角度と拡大を戻す</button></div>
  <div class="hint">回転が 0° なら、カメラの向きから90°横（水平）で、カメラを回すと付いてきます。側面図の上で、ホイールで拡大、中ボタン（または Alt＋何もない所のドラッグ）で回転、Shift を足すと移動します。</div>`;
{ const after = document.querySelector('section[data-menu="persp"]') || ($("camLock") && $("camLock").closest("section"));
  if (after) after.after(sec); else document.querySelector("aside").appendChild(sec); }

function keys(){
  const out = [["", "カメラの注視点（今まで通り）"], ["f" + (S.figId || 1), `人物：${S.figName || "1人目"}（編集中）`]];
  for (const f of S.others || []) out.push(["f" + (f.figId || 1), `人物：${f.figName || ""}`]);
  (S.solids || []).forEach((o, k) => out.push(["s" + k, `${o.guide ? "ガイド" : "図形"}：${typeof solidName === "function" ? solidName(o) : o.kind}`]));
  (S.items || []).forEach((it, n) => { if (typeof movable === "function" && movable(it)) out.push(["i" + n, `小物：${(PROPS_[it.key] || {}).ja || it.key}`]); });
  return out;
}
let listKey = "";
function sync(){
  const v = SV(), ks = keys(), lk = JSON.stringify(ks);
  if (lk !== listKey){ listKey = lk; $("svKey").innerHTML = ks.map(([k, n]) => `<option value="${k}">${esc2(n)}</option>`).join(""); }
  const k = ks.some(([x]) => x === (v.key || "")) ? v.key || "" : "";
  $("svFrom").value = v.from === "l" ? "l" : "r"; $("svKey").value = k;
  $("svJointBox").style.display = /^f\d+$/.test(k) ? "" : "none"; $("svJoint").value = v.joint || "pelvis";
  const put = (id, x) => { x = Math.round(x); if (document.activeElement !== $(id)) $(id).value = x; if (document.activeElement !== $(id + "R")) $(id + "R").value = x; };
  put("svYaw", +v.yaw || 0); put("svPitch", +v.pitch || 0); put("svZoom", (+v.zoom || 1) * 100);
}
{ const d0 = draw; draw = function(){ d0.apply(this, arguments); if (sec.classList.contains("active")) sync(); }; }
function setVal(id, x){
  const v = SV();
  if (id === "svYaw") v.yaw = wrap(x); else if (id === "svPitch") v.pitch = Math.max(-80, Math.min(80, x));
  else if (id === "svZoom") v.zoom = Math.max(0.25, Math.min(6, x / 100));
  draw();
}
for (const id of ["svYaw", "svPitch", "svZoom"]){
  const r = $(id + "R"), n = $(id);
  r.addEventListener("input", () => { n.value = r.value; setVal(id, +r.value); });
  n.addEventListener("change", () => { const x = +n.value; if (!isFinite(x)) return; remember(); r.value = x; setVal(id, x); });
}
$("svFrom").addEventListener("change", () => { remember(); SV().from = $("svFrom").value === "l" ? "l" : "r"; draw(); });
// a new centre: what was moved off it starts again from it
$("svKey").addEventListener("change", () => { remember(); const v = SV(); v.key = $("svKey").value; v.pan = [0, 0, 0]; draw(); });
$("svJoint").addEventListener("change", () => { remember(); const v = SV(); v.joint = $("svJoint").value; v.pan = [0, 0, 0]; draw(); });
$("svReset").addEventListener("click", () => { remember(); Object.assign(SV(), {yaw: 0, pitch: 0, zoom: 1, pan: [0, 0, 0]}); draw(); say("側面図の角度と拡大を戻しました（カメラから90°・水平）。"); });
$("svToSel").addEventListener("click", () => {
  const O = window.ODMObj, k = O && O.key ? O.key() : "", v = SV();
  if (k && isObj(k)){ remember(); Object.assign(v, {key: k, pan: [0, 0, 0]}); draw(); say("選んだ物体を側面図の中心にしました。"); return; }
  if (sel >= 0){ remember(); Object.assign(v, {key: "f" + (S.figId || 1), joint: J[sel], pan: [0, 0, 0]}); draw(); say("選んだ関節を側面図の中心にしました。"); return; }
  say("関節か物体を選んでから押してください。", true);
});
sync();

// i18n.js loads after this file: the table waits for it (ODMPoserI18nEarly)
(window.ODMPoserI18n || {add: t => (window.ODMPoserI18nEarly = window.ODMPoserI18nEarly || []).push(t)}).add({
  "側面図のカメラ": "The side view's camera", "見る向き": "Seen from", "右から（カメラの右側）": "The right (the camera's right)", "左から（カメラの左側）": "The left (the camera's left)",
  "中心（支点）": "Centre (pivot)", "側面図はこの点を真ん中にして回る（人物・物体を選ぶと、それに付いていく）": "The side view turns round this point (a figure or an object: it follows it)",
  "カメラの注視点（今まで通り）": "The camera's look-at point (as before)",
  "回転（左右）": "Turn (left / right)", "見下ろす角度（上下）": "Looking down (up / down)", "拡大": "Zoom",
  "選んだ物を中心に": "Centre on the selected", "選んでいる関節・物体を側面図の中心にする": "Make the selected joint or object the side view's centre",
  "↺ 角度と拡大を戻す": "↺ Angle and zoom back", "回転・見下ろす角度・拡大・ずらした分を戻す（カメラから90°・水平）": "Turn, tilt, zoom and moves back (90° from the camera, level)",
  "回転が 0° なら、カメラの向きから90°横（水平）で、カメラを回すと付いてきます。側面図の上で、ホイールで拡大、中ボタン（または Alt＋何もない所のドラッグ）で回転、Shift を足すと移動します。":
    "At 0° it looks 90° from the camera's direction, level, and follows the camera. On the side view: the wheel zooms, the middle button (or Alt + a drag where there is nothing) turns it, with Shift it moves.",
  "側面図の角度と拡大を戻しました（カメラから90°・水平）。": "The side view's angle and zoom are back (90° from the camera, level).",
  "選んだ物体を側面図の中心にしました。": "The selected object is the side view's centre.", "選んだ関節を側面図の中心にしました。": "The selected joint is the side view's centre.",
  "カメラ側 →": "camera side →"});
})();
