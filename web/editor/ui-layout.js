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
const ICON = {applyPreset: "Pose", tcApply: "Pose", tcRandom: "Collection", tcLoadFile: IN, loadJson: IN, modInstall: IN, modLoad: IN,
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
aside.querySelectorAll(":scope > section").forEach(pair);
iconize(document);
let queued = false;
new MutationObserver(() => { if (queued) return; queued = true;
  requestAnimationFrame(() => { queued = false; aside.querySelectorAll(":scope > section").forEach(pair); iconize(document); });
}).observe(aside, {childList: true, subtree: true});
})();
