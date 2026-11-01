// 置く前のプレビュー (index.html, loaded after pose_style.js): while the 装備 or 設置 tab shows, the
// thing or object chosen in its list is drawn faintly where it would go, at the size set beside it,
// before 持つ・置く is pressed. The size set there is what it then gets (the thing's whole size,
// length and thickness; the object's width, height and depth).
(() => {
const $ = id => document.getElementById(id);
const ctl = (id, label, min, max, step, unit, val) => `<label>${label}</label><div class="row"><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}">` +
  `<input type="number" class="num" id="${id}N" step="${step}" value="${val}"><span class="unit">${unit}</span></div>`;
const linkRange = id => { $(id).addEventListener("input", () => { $(id + "N").value = $(id).value; draw(); });
  $(id + "N").addEventListener("change", () => { $(id).value = $(id + "N").value; draw(); }); };

// ---- things (装備) ------------------------------------------------------------------------------------
const scBox = document.createElement("div");
scBox.className = "pv-box";
scBox.innerHTML = `<label title="持つ・置く前にプレビュー"><input type="checkbox" id="scPrevOn" checked> プレビュー</label>` +
  ctl("scPreSize", "大きさ", 30, 300, 1, "%", 100) + ctl("scPreLen", "長さ（長い向き）", 30, 300, 1, "%", 100) + ctl("scPreThick", "太さ", 30, 300, 1, "%", 100);
$("scAddR").closest(".btns").before(scBox);
for (const id of ["scPreSize", "scPreLen", "scPreThick"]) linkRange(id);
$("scPrevOn").addEventListener("change", draw);
$("scKey").addEventListener("change", draw);
const pre = id => (+$(id).value || 100) / 100;
function sized(it){                            // the sizes set before, on a new thing
  it.scale = pre("scPreSize");
  if (pre("scPreLen") !== 1) it.len = pre("scPreLen");
  if (pre("scPreThick") !== 1) it.thick = pre("scPreThick");
  return it;
}
function ghostItem(hand){
  const key = $("scKey").value, def = PROPS_[key]; if (!def) return null;
  const it = sized({key, off: [0, 0, 0], rot: [0, 0, 0], scale: 1});
  if (def.place === "hand") it.hand = hand;
  else if (!["body", "wear"].includes(def.place)){
    const c = S.P[IX.pelvis]; it.yaw = facingYaw(); it.base = [c[0], +(S.env && S.env.floorY) || 0, c[2]];
    if (def.mount && def.mount.pelvis){ const m = rotY(def.mount.pelvis, deg(it.yaw)); it.base = [c[0] - m[0], it.base[1], c[2] - m[2]]; }
  }
  return it;
}
{ const a0 = addItem;
  addItem = function(key, hand){ const n = (S.items || []).length; a0(key, hand);
    const it = S.items && S.items[scSel];
    if (it && it.key === key && S.items.length >= n){ sized(it); afterEdit(); fillItemList(); draw(); } };
}

// ---- objects (設置) ---------------------------------------------------------------------------------
const soBox = document.createElement("div");
soBox.className = "pv-box";
soBox.innerHTML = `<label title="置く前にプレビュー"><input type="checkbox" id="soPrevOn" checked> プレビュー</label>` +
  ctl("soPreW", "幅", 5, 600, 1, "cm", 100) + ctl("soPreH", "高さ", 1, 400, 1, "cm", 100) + ctl("soPreD", "奥行き", 1, 600, 1, "cm", 100);
$("soAdd").closest(".btns").before(soBox);
const fillSolidSize = () => { const k = SOLID_KINDS[$("soKind").value]; if (!k) return;
  ["soPreW", "soPreH", "soPreD"].forEach((id, i) => { $(id).value = $(id + "N").value = k.size[i]; }); draw(); };
$("soKind").addEventListener("change", fillSolidSize);
for (const id of ["soPreW", "soPreH", "soPreD"]) linkRange(id);
$("soPrevOn").addEventListener("change", draw);
fillSolidSize();
const preSize = () => ["soPreW", "soPreH", "soPreD"].map(id => Math.max(1, +$(id + "N").value || 1));
function ghostSolid(){
  const kind = $("soKind").value, k = SOLID_KINDS[kind]; if (!k) return null;
  const c = S.P[IX.pelvis], fy = S.env && S.env.floor ? +S.env.floorY || 0 : 0;
  const o = {kind, pos: [Math.round(c[0] + k.at[0]), fy + k.at[1], Math.round(c[2] + k.at[2])], size: preSize(), yaw: 0};
  if (k.sides) o.sides = k.sides;
  if (typeof snapSolid === "function") snapSolid(o);
  return o;
}
{ const a0 = addSolid;
  addSolid = function(kind){ const n = (S.solids || []).length; a0(kind);
    const o = S.solids && S.solids[n]; if (!o) return;
    o.size = preSize(); if (typeof snapSolid === "function") snapSolid(o); afterEdit(); syncSolids(); draw(); };
}

// ---- the ghosts: faint, dashed, in the selection colour, front view only ----------------------------------
const showing = el => { const s = el.closest("section"); return !!(s && s.classList.contains("active")); };
{ const atari0 = drawAtari;
  drawAtari = function(ctx, W, H, opts = {}){
    atari0(ctx, W, H, opts);
    if (opts.export || ctx.canvas !== front) return;
    const lw = Math.max(1.5, W / 540), P = q => project(q, W, H);
    ctx.save(); ctx.strokeStyle = cssVar("--sel"); ctx.globalAlpha = 0.6; ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (showing($("scKey")) && $("scPrevOn").checked){
      const it = ghostItem("r");
      if (it){ const hd = S.hiddenDashed; S.hiddenDashed = false;
        try { ctx.setLineDash([lw * 3, lw * 2]); ctx.lineWidth = lw;
          for (const {f, parts} of partSets(it)) for (const sh of parts) drawShape(ctx, sh, it, f, P, lw); }
        finally { S.hiddenDashed = hd; } }
    }
    if (showing($("soKind")) && $("soPrevOn").checked){
      const o = ghostSolid();
      if (o){ const m = solidMesh(o), V = m.V.map(P);
        ctx.setLineDash([lw * 3, lw * 2]); ctx.lineWidth = lw; ctx.beginPath();
        for (const e of m.edges){ ctx.moveTo(V[e.a].x, V[e.a].y); ctx.lineTo(V[e.b].x, V[e.b].y); }
        ctx.stroke(); }
    }
    ctx.restore();
  };
}
// a tab switch shows / hides the ghost
{ const aside = document.querySelector("aside");
  new MutationObserver(list => { if (list.some(m => m.target.parentNode === aside && m.target.tagName === "SECTION")) draw(); })
    .observe(aside, {subtree: true, attributes: true, attributeFilter: ["class"]}); }

// i18n.js loads after this file: the table waits for it (ODMPoserI18nEarly)
(window.ODMPoserI18n || {add: t => (window.ODMPoserI18nEarly = window.ODMPoserI18nEarly || []).push(t)}).add({"持つ・置く前にプレビュー": "Preview before holding / putting", "置く前にプレビュー": "Preview before putting",
  "大きさ": "Size", "長さ（長い向き）": "Length (the long side)", "太さ": "Thickness", "幅": "Width", "高さ": "Height", "奥行き": "Depth"});
draw();
})();
