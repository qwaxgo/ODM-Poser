// The panel's controls in pairs (index.html, loaded last): a label and the slider / field row under
// it go into one <div class="ctl">, so with the panel above or below the views (a strip, see
// ui.src.css) each pair stands as one upright column. In the usual panel nothing changes. Sections
// built or rebuilt later (modules, mods) are paired as they come.
(() => {
const aside = document.querySelector("aside");
const field = el => el && (el.classList.contains("row") ||
  (/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) && el.type !== "checkbox" && el.type !== "radio"));
function pair(root){
  for (const lab of root.querySelectorAll("label")){
    if (lab.parentElement.classList.contains("ctl") || lab.querySelector("input, select, textarea")) continue;
    const next = lab.nextElementSibling;
    if (!field(next)) continue;
    const box = document.createElement("div");
    box.className = "ctl";
    lab.before(box); box.append(lab, next);
  }
}
// the panel's buttons get an icon before their name (Charcoal, ui-icons.js); a name that starts
// with its own sign (↺ ↶ ↷ ⇋) keeps that instead
const DEL = "Close", OUT = "DownloadAlt", IN = "Upload";
const ICON = {applyPreset: "Pose", tcApply: "Pose", tcRandom: "Collection", tcLoadFile: IN, loadJson: IN, modInstall: IN, modFolder: IN, modLoad: IN,
  saveAtari: OUT, saveComp: OUT, saveJson: OUT, saveOpenpose: OUT, saveRuler: "ruler", spSave: OUT, spCancel: DEL,
  auAdd: "Glow", castAdd: "Users", castDup: "Users", camSave: "Camera", camLoad: "Camera", scAddR: "Fashion", scAddL: "Fashion",
  scHold: "Fashion", scBack: "Fashion", scGrab: "Fashion", scHang: "Fashion", scMount: "Body", scWorld: "Home", scView: "Fov",
  scToFloor: "Move1", scToWall: "Move1", scToCeil: "Move1", soTouch: "Move1", soStand: "Move1", soAdd: "AddModel", soDup: "AddModel",
  treeOpen: "ViewList", shCopy: "ShareAndroid", shOther: "ShareAndroid", sexF: "Body", sexM: "Body", boxCube: "ruler",
  symJoint: "Pose", symLimb: "Pose", symToL: "Pose", symToR: "Pose", scFlip: "Pose",
  auDel: DEL, camDel: DEL, castDel: DEL, scDel: DEL, soDel: DEL, treeDel: DEL};
function iconize(root){
  if (!window.ODMICONS) return;
  for (const [id, name] of Object.entries(ICON)){
    const b = root.querySelector ? root.querySelector("#" + id) : null;
    if (!b || b.dataset.iconed || !ODMICONS[name] || /^[↺↶↷⇋]/.test(b.textContent.trim())) continue;
    b.dataset.iconed = "1"; b.insertAdjacentHTML("afterbegin", ODMICONS.svg(name, "btn-icon"));
  }
}
// where things go on screen (側面図の置き場所, 操作欄の位置, メニューの側): a row of small pictures
// of the screen instead of a drop-down; the select stays (hidden) and the code still reads it
const FRAME = '<rect x="2.5" y="4.5" width="19" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/>';
const BLOCK = {right: [14, 6, 6, 12], left: [4, 6, 6, 12], top: [4, 6, 16, 4.5], bottom: [4, 13.5, 16, 4.5]};
function placeSvg(kind, v){
  let inner = FRAME;
  if (kind === "menu"){                         // the strip below, the menu at its left or right
    inner += '<rect x="4" y="12.5" width="16" height="5.5" rx="1" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".6"/>'
      + `<rect x="${v === "right" ? 15 : 4}" y="12.5" width="5" height="5.5" rx="1" fill="currentColor"/>`;
  } else if (v === "hide") inner += '<path d="M5 17L19 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>';
  else { const [x, y, w, h] = BLOCK[v]; inner += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1" fill="currentColor"/>`; }
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${inner}</svg>`;
}
const pickers = [];
// the names in Japanese, as the page is written: in English the options are already translated
// here, and i18n.js turns these back when the language is switched
const NAME = {right: "右", left: "左", top: "上", bottom: "下", hide: "隠す"};
function picker(id, kind){
  const sel = document.getElementById(id); if (!sel || sel.dataset.picker) return;
  sel.dataset.picker = "1"; sel.hidden = true;
  const box = document.createElement("span"); box.className = "place-pick"; box.setAttribute("role", "group");
  for (const o of sel.options){
    const name = NAME[o.value] || o.textContent;
    const b = document.createElement("button"); b.type = "button"; b.dataset.v = o.value; b.title = name;
    b.setAttribute("aria-label", name); b.innerHTML = placeSvg(kind, o.value);
    // a narrow side view shows the chosen place only: a tap on it opens the others
    b.addEventListener("click", e => { e.preventDefault(); const lab = box.closest(".view-place");
      if (sel.value === o.value){ if (lab) lab.classList.toggle("open"); return; }
      if (lab) lab.classList.remove("open");
      sel.value = o.value; sel.dispatchEvent(new Event("change", {bubbles: true})); sync(); });
    box.appendChild(b);
  }
  sel.after(box); pickers.push([sel, box]);
}
function sync(){
  for (const [sel, box] of pickers) box.querySelectorAll("button").forEach(b => {
    const on = b.dataset.v === sel.value; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
  const vp = document.querySelector(".view-place"), sv = vp && vp.closest(".view");
  if (sv) vp.classList.toggle("narrow", sv.clientWidth < 420);
  shownIcons();
}
// the switches 操作欄 and 分割表示: a picture of where things are on this screen now (the panel
// below on a phone held upright, beside it held sideways, or where 操作欄の位置 puts it; split
// screen into top and bottom halves, or left and right)
const ONE_COL = "(max-width:900px), (orientation:portrait) and (max-aspect-ratio:4/5)";
let iconKey = "";
function shownIcons(){
  const bc = document.body.classList, wide = innerWidth > innerHeight;
  const where = bc.contains("split") ? (wide ? "right" : "bottom")
    : matchMedia(ONE_COL).matches ? "bottom" : (document.getElementById("asidePos") || {}).value || "right";
  const k = where + "|" + wide; if (k === iconKey) return; iconKey = k;
  const half = wide ? '<path d="M12 4.5v15" stroke="currentColor" stroke-width="1.6"/>' : '<path d="M2.5 12h19" stroke="currentColor" stroke-width="1.6"/>';
  const put = (id, svg) => { const b = document.getElementById(id), old = b && b.querySelector("svg"); if (old) old.outerHTML = svg; };
  put("ovAside", placeSvg("place", where));
  put("splitBtn", `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${FRAME}${half}</svg>`);
}
picker("sidePos", "place"); picker("asidePos", "place"); picker("menuSide", "menu"); sync();
// the code also sets them itself (the 側面図 switch, a saved choice): the pictures follow at each drawing
{ const d0 = draw; draw = function(){ d0.apply(this, arguments); sync(); }; }

aside.querySelectorAll(":scope > section").forEach(pair);
iconize(document);
let queued = false;
new MutationObserver(() => { if (queued) return; queued = true;
  requestAnimationFrame(() => { queued = false; aside.querySelectorAll(":scope > section").forEach(pair); iconize(document); });
}).observe(aside, {childList: true, subtree: true});
})();

// a number field that also has a slider beside it (ui-layout.js, last): the number stays the one the
// code reads; the slider writes it and follows it. A slider's drag is one undo step (remember is
// held back while it moves)
(() => {
const PAIRS = [["scFloorY", -100, 400, 1], ["scCeilY", 0, 500, 1], ["scWallZ", -600, 600, 1], ["scWallYaw", -180, 180, 1],
  ["scWireH", 0, 600, 10], ["castX", -600, 600, 5], ["castZ", -600, 600, 5], ["auSize", 4, 80, 1]];
let dragging = false;
const r0 = remember;
remember = function(){ if (dragging) return; return r0.apply(this, arguments); };
for (const [id, min, max, step] of PAIRS){
  const n = document.getElementById(id); if (!n || n.dataset.paired) continue; n.dataset.paired = "1";
  const r = document.createElement("input"); r.type = "range"; r.id = id + "R"; r.min = min; r.max = max; r.step = step;
  r.setAttribute("aria-label", n.getAttribute("aria-label") || (n.previousElementSibling && n.previousElementSibling.textContent) || id);
  n.before(r);
  r.addEventListener("pointerdown", () => remember());
  r.addEventListener("input", () => { n.value = r.value; dragging = true; n.dispatchEvent(new Event("change")); dragging = false; });
  n.addEventListener("input", () => { r.value = n.value; });
  n.addEventListener("change", () => { r.value = n.value; });
  r.value = n.value;
}
const syncPairs = () => { for (const [id] of PAIRS){ const n = document.getElementById(id), r = document.getElementById(id + "R");
  if (n && r && document.activeElement !== r && document.activeElement !== n) r.value = n.value; } };
{ const d0 = draw; draw = function(){ d0.apply(this, arguments); syncPairs(); }; }
})();
