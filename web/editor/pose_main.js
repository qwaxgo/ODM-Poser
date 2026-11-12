// The editor's own script (src/pages/editor/index.astro, loaded after pose_props_more.js): the figure,
// its state S, the views, the edit pipeline and the panel. The modules after it (pose_scene.js, ...)
// share its global names.
"use strict";
// ---- the figure: joints in world space (cm, y up, the figure faces +z) -------------------
// The figure's own right is screen left when it faces the camera (x < 0).
// r_hand / l_hand: the hand from the wrist to the knuckles, so the wrist bends. They come last, so
// a pose saved with the first 19 joints keeps its numbers (upgradeState() adds the hands to it).
const J = ["pelvis","waist","chest","neck","head","r_shoulder","r_elbow","r_wrist","l_shoulder",
           "l_elbow","l_wrist","r_hip","r_knee","r_ankle","r_toe","l_hip","l_knee","l_ankle","l_toe",
           "r_hand","l_hand"];
const J_JA = {pelvis:"腰（全体）", waist:"ウエスト", chest:"胸", neck:"首", head:"頭", r_shoulder:"右肩",
  r_elbow:"右肘", r_wrist:"右手首", l_shoulder:"左肩", l_elbow:"左肘", l_wrist:"左手首", r_hip:"右股",
  r_knee:"右膝", r_ankle:"右足首", r_toe:"右つま先", l_hip:"左股", l_knee:"左膝", l_ankle:"左足首", l_toe:"左つま先",
  r_hand:"右手", l_hand:"左手"};
const IX = Object.fromEntries(J.map((n, i) => [n, i]));
const PARENT = [-1, 0, 1, 2, 3, 2, 5, 6, 2, 8, 9, 0, 11, 12, 13, 0, 15, 16, 17, 7, 10];
const MIRROR = J.map(n => IX[n.startsWith("r_") ? "l_" + n.slice(2) : n.startsWith("l_") ? "r_" + n.slice(2) : n]);
const REST = [
  [0, 95, 0], [0, 111, 0], [0, 130, 0], [0, 145, 0], [0, 158, 0],
  [-18, 142, 0], [-21, 114, 0], [-23, 88, 0], [18, 142, 0], [21, 114, 0], [23, 88, 0],
  [-10, 92, 0], [-11, 50, 0], [-12, 9, 0], [-12, 2, 13], [10, 92, 0], [11, 50, 0], [12, 9, 0], [12, 2, 13],
  [-23.6, 80, 0], [23.6, 80, 0]];
// the waist's "radius" is half the waist's width (the torso is drawn as two trapezoids:
// shoulders -> waist and waist -> the thigh roots); pelvis, waist and chest show small handles
const REST_R = [3, 12, 3, 4, 11, 4.5, 4, 5, 4.5, 4, 5, 6, 4.5, 4, 3, 6, 4.5, 4, 3, 3, 3];
// small grey handles, for the editor only: pelvis, waist, chest, and the hands (the fingers show them)
const HANDLE = new Set([0, 1, 2, 19, 20]);
const HAND_J = new Set([19, 20]);
const HAND_LEN = 8;                          // wrist -> knuckles, cm
// a pose from before the hands (19 joints): each hand goes on along its forearm
function upgradeState(st){
  if (!st) return;
  const one = f => {
    if (!f || !Array.isArray(f.P)) return;
    if (f.P.length < J.length){
      for (const s of ["r", "l"]){ const w = f.P[IX[s + "_wrist"]], e = f.P[IX[s + "_elbow"]];
        if (w && e) f.P.push(add(w, mul(norm(sub(w, e)), HAND_LEN))); }
      if (Array.isArray(f.R)) while (f.R.length < J.length) f.R.push(REST_R[f.R.length]);
      if (Array.isArray(f.twist)) while (f.twist.length < J.length) f.twist.push(0);
    }
    // a hand twist kept from before goes to the forearm (the palm stays where it is)
    if (Array.isArray(f.twist)) for (const s of ["r", "l"]){ const h = IX[s + "_hand"], w = IX[s + "_wrist"];
      if (f.twist[h]){ f.twist[w] = (f.twist[w] || 0) + f.twist[h]; f.twist[h] = 0; } }
  };
  one(st); (st.others || []).forEach(one);
}
const handleR = i => HANDLE.has(i) ? 3.2 : S.R[i];
const KIDS = J.map((_, i) => J.map((__, k) => k).filter(k => PARENT[k] === i));
function subtree(i){ const out = [i]; for (let k = 0; k < out.length; k++) out.push(...KIDS[out[k]]); return out; }


// ---- state -------------------------------------------------------------------------------
let S = fresh();
function fresh(){
  return {P: REST.map(p => p.slice()), R: REST_R.slice(), hands: {r: "relaxed", l: "relaxed"},
          head: {yaw: 0, pitch: 0}, cam: {lens: 50, yaw: 0, pitch: 0, roll: 0, zoom: 1},
          body: {yaw: 0, pitch: 0, roll: 0}, twist: REST.map(() => 0),
          pins: {}, items: [], env: {floor: true, floorY: 0, ground: "nopen", wall: false, wallZ: -40,
          wallX: 0, wallYaw: 0, ceiling: false, ceilingY: 230, attach: true}, wire: {on: false, joint: "chest", height: 300},
          center: [0, 90, 0], cams: [], camLock: false, scale: {all: 100, head: 100, thick: 100}, hiddenDashed: false, torso3d: true, solids: [], auras: [], colors: {parts: {}}, others: [], figId: 1, figName: "1人目",
          fingers: {}, fingerLen: [1, 1, 1, 1, 1],
          ruler: {on: false, n: 2, yaw: 30, pitch: 0, roll: 0, lines: 20, cube: false, box: [60, 60, 60], pos: [70, 0, 0], extend: true, snap: true, snapTurn: false, grid: false}};
}
// undo / redo: remember() keeps the state before an edit. A step remembered when nothing changed
// after it (a slider only touched) is skipped; an edit after an undo drops what could be redone.
const history = [], future = [];
let futureAt = "";
function remember(){ const t = JSON.stringify(S); if (history[history.length - 1] === t) return;
  history.push(t); if (history.length > 80) history.shift(); }
function restore(text){
  const a = document.activeElement; if (a && a.type === "range") a.blur();
  S = JSON.parse(text); syncUI(); draw(); futureAt = JSON.stringify(S);
}
function undo(){
  const now = JSON.stringify(S);
  while (history.length && history[history.length - 1] === now) history.pop();
  if (!history.length) return;
  if (now !== futureAt) future.length = 0;
  future.push(now); restore(history.pop());
}
function redo(){
  const now = JSON.stringify(S);
  if (!future.length || now !== futureAt){ future.length = 0; return; }
  if (history[history.length - 1] !== now) history.push(now);
  restore(future.pop());
}

// ---- small vector helpers ----------------------------------------------------------------
const sub = (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
const add = (a, b) => [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
const mul = (a, s) => [a[0]*s, a[1]*s, a[2]*s];
const dot = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const len = a => Math.hypot(a[0], a[1], a[2]);
const norm = a => { const l = len(a) || 1; return [a[0]/l, a[1]/l, a[2]/l]; };
function rotAxis(v, axis, ang){            // Rodrigues
  const k = norm(axis), c = Math.cos(ang), s = Math.sin(ang);
  return add(add(mul(v, c), mul(cross(k, v), s)), mul(k, dot(k, v) * (1 - c)));
}
function rotBetween(v, a, b){              // rotate v by the rotation taking a to b
  const na = norm(a), nb = norm(b), ax = cross(na, nb), s = len(ax), c = dot(na, nb);
  if (s < 1e-9) return c > 0 ? v.slice() : rotAxis(v, Math.abs(na[0]) < .9 ? cross(na, [1,0,0]) : cross(na, [0,1,0]), Math.PI);
  return rotAxis(v, ax, Math.atan2(s, c));
}
const deg = d => d * Math.PI / 180;

// ---- camera: world -> camera space -> screen ------------------------------------------------
// camera space: x right, y up, z toward the viewer; the camera sits at z = D looking down -z.
function camRot(v){
  const c = S.cam;
  let p = rotAxis(v, [0, 1, 0], deg(-c.yaw));
  p = rotAxis(p, [1, 0, 0], deg(c.pitch));
  return rotAxis(p, [0, 0, 1], deg(c.roll));
}
function camRotInv(v){
  const c = S.cam;
  let p = rotAxis(v, [0, 0, 1], deg(-c.roll));
  p = rotAxis(p, [1, 0, 0], deg(-c.pitch));
  return rotAxis(p, [0, 1, 0], deg(c.yaw));
}
// the picture's frame in a canvas of W x H: the largest rectangle of the picture's shape (the
// export's width and height), centred. The front view fills its box, wider or taller than the
// picture; the camera frames the picture in it just as in the file, and the rest shows around it.
let frameAspect = 0;
function frameWH(W, H){
  if (!frameAspect){ const [EW, EH] = exportSize(); frameAspect = EW / EH; }
  return W / H > frameAspect ? [H * frameAspect, H] : [W, W / frameAspect];
}
// パースの誇張 (pose_persp.js): while PX is set ({k, qz, cw, o}), what is drawn is seen by a camera moved
// k of the way toward the pivot point (along its ray: qz its depth, cw the sideways step in world cm),
// its lens widened as much and shifted (o) so the pivot stays where it was on screen: at the pivot's
// depth the size stays, farther shrinks fast toward the pivot, nearer grows out of it. One camera for
// everything, so lines stay straight, things that touch still touch, and the vanishing points and the
// eye level (vanish, horizonLine) follow: the ruler matches. withPX moves S.center by cw meanwhile.
let PX = null;
// The lens is taken on the picture's height (36 mm to the height): the camera's distance (camDist,
// cm) then never depends on the picture's ratio or size, so changing them leaves the camera where
// it is and only crops or widens the picture's sides (190 cm still fills 86 % of the height).
function lensF(W, H){ const h = frameWH(W, H)[1]; return S.cam.lens / 36 * h * (PX ? 1 - PX.k : 1); }
function camDist(W, H){ const D = S.cam.lens / 36 * 190 / 0.86 / S.cam.zoom;
  return PX ? D - PX.k * (D - PX.qz) : D; }
// the picture's centre of projection (moved by the lens shift of パースの誇張)
function cxOf(W, H){ return PX ? W/2 + PX.o[0] * lensF(W, H) / (1 - PX.k) : W/2; }
function cyOf(W, H){ return PX ? H/2 - PX.o[1] * lensF(W, H) / (1 - PX.k) : H/2; }
// the camera's direction (its own axes) through a pixel
function pixDir(x, y, W, H){ const f = lensF(W, H); return norm([(x - cxOf(W, H)) / f, -(y - cyOf(W, H)) / f, -1]); }
function toCam(p){ return camRot(sub(p, S.center)); }
function project(p, W, H){
  const q = toCam(p), f = lensF(W, H), D = camDist(W, H), d = Math.max(D - q[2], 1);
  return {x: cxOf(W, H) + f*q[0]/d, y: cyOf(W, H) - f*q[1]/d, s: f/d, z: q[2]};
}
// パースの誇張 (pose_persp.js): only while the camera is locked (and not turned for a while: S.camPeek).
// S.persp {pivot: {mode: "free" (at [x, y, z] in the scene) | "attach" (key "f<id>" with a joint and an
// offset on the scene's axes, or "s<k>" / "i<n>" with an offset in its own axes, its middle at first)},
// k: the strength in % (0 to 100), the same for everything}
// the strength felt evenly: each step brings the camera the same share closer (100 %: 4 % of the way left)
const EX_K = 0.96, exK = pct => 1 - Math.pow(1 - EX_K, Math.max(0, Math.min(100, pct)) / 100);
function exPivot(){
  const pv = (S.persp && S.persp.pivot) || {};
  if (pv.mode !== "attach") return Array.isArray(pv.at) ? pv.at : S.P[IX.pelvis];
  const key = pv.key || "", off = Array.isArray(pv.off) ? pv.off : null;
  if (/^[si]\d+$/.test(key) && window.ODMObj && ODMObj.toWorld){ const w = ODMObj.toWorld(key, off); if (w) return w; }
  let P = S.P;
  if (/^f\d+$/.test(key) && +key.slice(1) !== (S.figId || 1)){ const f = (S.others || []).find(o => (o.figId || 1) === +key.slice(1)); if (f) P = f.P; }
  const j = IX[pv.joint] !== undefined ? IX[pv.joint] : IX.pelvis;
  return add(P[j], off && !/^[si]/.test(key) ? off : [0, 0, 0]);
}
// the exaggeration now (null: none, the camera is free or turned for a while)
function pxNow(){
  const pct = +((S.persp || {}).k); if (!S.camLock || S.camPeek || !pct || !isFinite(pct)) return null;
  return withPX(null, () => {
    const k = exK(pct), q = toCam(exPivot()), [EW, EH] = exportSize();
    const d = Math.max(camDist(EW, EH) - q[2], 1);
    return {k, qz: q[2], cw: camRotInv([k * q[0], k * q[1], 0]), o: [k * q[0] / d, k * q[1] / d]};
  });
}
const pxOf = () => pxNow();
// a segment cut just before the camera (null: all behind it); a far-reaching thing under a strong
// パースの誇張 reaches behind the camera, and its lines would cross the picture
function clipNear(a, b, W, H, near = 5){
  const D = camDist(W, H), da = D - toCam(a)[2], db = D - toCam(b)[2];
  if (da < near && db < near) return null;
  if (da < near) a = add(a, mul(sub(b, a), (near - da) / (db - da))); else if (db < near) b = add(b, mul(sub(a, b), (near - db) / (da - db)));
  return [a, b];
}
function withPX(px, fn){
  const keep = PX, c0 = S.center, base = PX ? sub(S.center, PX.cw) : S.center;
  PX = px; S.center = px ? add(base, px.cw) : base;
  try { return fn(); } finally { PX = keep; S.center = c0; }
}
// (one strength for all: these stay for the callers)
const figPX = () => pxNow(), pxOfKey = k => k ? pxNow() : null, pxOfItem = () => pxNow(), rulerPX = () => pxNow();

// the head's frame, for the face direction and the OpenPose nose / eyes / ears
function headFrame(){
  const P = S.P, up = norm(sub(P[IX.head], P[IX.neck]));
  const across = norm(sub(P[IX.l_shoulder], P[IX.r_shoulder]));     // toward the figure's left
  let fwd = norm(cross(across, up));
  fwd = sub(fwd, mul(up, dot(fwd, up)));
  // where the face looks: the neck's and the head's twist (左右を向く in the joint panel);
  // nodding and tilting are the head bone's own 前後 / 左右
  fwd = rotAxis(norm(fwd), up, deg((S.twist[IX.neck] || 0) + (S.twist[IX.head] || 0)));
  const side = norm(cross(up, fwd));                                    // the figure's left
  const up2 = norm(cross(fwd, side));
  return {fwd, side, up: up2, r: S.R[IX.head]};
}
// the head's shape (サイズ › 頭の形): S.headShape {x, y, z, mode}: the width (x), the height (y) and the
// depth (z) each a share of the head's size; mode "ball" stretches the ball, "cyl" joins the stretched
// ends with a cylinder of the head's width (drawn in headOutline)
const headShaped = () => { const h = S.headShape; return !!h && (h.x !== 1 || h.y !== 1 || h.z !== 1); };
function headOutline(ctx, p, r, side){
  const hs = S.headShape, sx = hs.x || 1, sy = hs.y || 1, sz = hs.z || 1;
  const w = r * (side ? sz : sx), v = r * sy;                 // the drawn width and height in px
  if (hs.mode !== "cyl" || sy <= 1){
    ctx.beginPath(); ctx.ellipse(p.x, p.y, w, v, 0, 0, 2 * Math.PI); ctx.stroke(); return;
  }
  // the cylinder: a half-ball at each end, the sides joining them (screen up = the head's up)
  const L = v - w;                                            // how far each end is drawn out from the centre
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - L, w, w, 0, Math.PI, 2 * Math.PI);
  ctx.ellipse(p.x, p.y + L, w, w, 0, 0, Math.PI);
  ctx.moveTo(p.x - w, p.y - L); ctx.lineTo(p.x - w, p.y + L);
  ctx.moveTo(p.x + w, p.y - L); ctx.lineTo(p.x + w, p.y + L);
  ctx.stroke();
}
// the head as its stretched ball seen (S.headShape: x across, y up, z forward, in the head's own frame):
// the outline of that ellipsoid on the picture, through project (front view, camera)
// the head's shape set (hs, or null: a ball again), stretched from where the neck meets it: its bottom
// stays, so its centre (the head joint, and with it the face, OpenPose's points, what it wears) moves
// along its up by as much as its height changes
function headShapeTo(hs){
  const y0 = (S.headShape && S.headShape.y) || 1, y1 = (hs && hs.y) || 1, d = handleR(IX.head) * (y1 - y0);
  if (Math.abs(d) > 1e-9) S.P[IX.head] = add(S.P[IX.head], mul(headFrame().up, d));
  if (hs) S.headShape = hs; else delete S.headShape;
}
function headRadii(){ const hs = S.headShape || {}, r = handleR(IX.head); return [r * (hs.x || 1), r * (hs.y || 1), r * (hs.z || 1)]; }
function headEllipse(ctx, W, H, proj){
  const h = headFrame(), [rx, ry, rz] = headRadii(), c = S.P[IX.head], pc = proj(c, W, H);
  let a = 0, b = 0, d = 0;
  for (const v of [mul(h.side, rx), mul(h.up, ry), mul(h.fwd, rz)]){
    const q = proj(add(c, v), W, H), x = q.x - pc.x, y = q.y - pc.y; a += x * x; b += x * y; d += y * y; }
  const m = (a + d) / 2, s = Math.sqrt(((a - d) / 2) ** 2 + b * b);
  ctx.beginPath(); ctx.ellipse(pc.x, pc.y, Math.sqrt(m + s), Math.sqrt(Math.max(0, m - s)), 0.5 * Math.atan2(2 * b, a - d), 0, 2 * Math.PI); ctx.stroke();
}
function facePoints(){
  const h = headFrame(), c = S.P[IX.head], r = h.r;
  const at = (f, s, u) => add(add(add(c, mul(h.fwd, f*r)), mul(h.side, s*r)), mul(h.up, u*r));
  return {nose: at(0.95, 0, -0.2), r_eye: at(0.8, -0.35, 0.15), l_eye: at(0.8, 0.35, 0.15),
          r_ear: at(0, -1.0, 0), l_ear: at(0, 1.0, 0)};
}

// ---- drawing: the アタリ (lines and circles) ----------------------------------------------
const BONES = PARENT.map((p, i) => [p, i]).filter(([p]) => p >= 0);
function cssVar(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
// the body's parts for line colours: a bone takes its child joint's part
const PART_OF = {pelvis: "torso", waist: "torso", chest: "torso", r_shoulder: "torso", l_shoulder: "torso",
  r_hip: "torso", l_hip: "torso", neck: "head", head: "head", r_elbow: "r_arm", r_wrist: "r_arm",
  l_elbow: "l_arm", l_wrist: "l_arm", r_knee: "r_leg", r_ankle: "r_leg", r_toe: "r_leg",
  l_knee: "l_leg", l_ankle: "l_leg", l_toe: "l_leg", r_hand: "r_hand", l_hand: "l_hand"};
const partColor = g => (S.colors && S.colors.parts && S.colors.parts[g]) || "";
// ---- hidden lines (S.hiddenDashed): what lies behind a body or a solid is drawn dashed ---------------
// The bodies are spheres along the bones (the joints' circles as their thickness), the torso along
// the spine, the head; the solids are their meshes (pose_solids.js). A point is hidden when the
// camera's ray to it meets one of them first. Each figure's own neighbouring parts do not hide it.
const TORSO_JOINTS = new Set([IX.pelvis, IX.waist, IX.chest, IX.neck, IX.r_shoulder, IX.l_shoulder, IX.r_hip, IX.l_hip]);
let occMemo = {key: "", occ: null}, occFrozen = null;   // frozen while the figures are swapped in to be drawn
function bodySpheres(fig){                    // the figure in S now
  const out = [], P = S.P, R = S.R;
  const put = (a, b, r, bone) => { const d = sub(b, a), L = len(d), n = Math.max(1, Math.ceil(L / Math.max(2, r)));
    for (let k = 0; k <= n; k++) out.push({c: add(a, mul(d, k / n)), r, fig, bone}); };
  BONES.forEach(([a, b]) => {
    if (b === IX.head) return;
    const r = TORSO_JOINTS.has(a) && TORSO_JOINTS.has(b) && (b === IX.waist || b === IX.chest || b === IX.neck)
      ? R[IX.waist] * 0.8 : Math.max(2.5, Math.min(R[a] || 4, R[b] || 4) * 0.9);
    put(P[a], P[b], r, b);
  });
  out.push({c: P[IX.head], r: R[IX.head], fig, bone: IX.head});
  return out;
}
function occluders(W, H){
  if (occFrozen) return occFrozen;
  const figs = [S.P, ...(S.others || []).map(f => f.P)];
  const key = [W, H, JSON.stringify(S.cam), JSON.stringify(S.center), JSON.stringify(figs), JSON.stringify(S.solids || [])].join("|");
  if (occMemo.key === key) return occMemo.occ;
  const spheres = bodySpheres(S.figId || 1);
  for (const f of S.others || []){
    if (typeof withFigure === "function") withFigure(f, () => spheres.push(...bodySpheres(f.figId || 0)));
  }
  // the ruler's guide shapes (o.guide) hide nothing
  const meshes = typeof solidMesh === "function" ? (S.solids || []).map((o, k) => o.guide ? null : {mesh: solidMesh(o), solid: k}).filter(Boolean) : [];
  const occ = {eye: add(camRotInv([0, 0, camDist(W, H)]), S.center), spheres, meshes};
  occMemo = {key, occ};
  return occ;
}
// the joints a bone (its child joint b) touches, and one step further
function boneNear(b){ const s = new Set([b, PARENT[b]]); if (PARENT[b] >= 0) s.add(PARENT[PARENT[b]]); KIDS[b].forEach(k => s.add(k)); return s; }
function jointNear(j){ const s = new Set([j, PARENT[j]]); KIDS[j].forEach(k => s.add(k)); return s; }
const boneTouches = (bone, near) => near.has(bone) || near.has(PARENT[bone]);
// skip rules: this figure's bones near a bone / a joint, its torso, or one solid
const skipBone = b => { const near = boneNear(b), fig = S.figId || 1; return o => o.fig === fig && boneTouches(o.bone, near); };
const skipJoint = j => { const near = jointNear(j), fig = S.figId || 1; return o => o.fig === fig && boneTouches(o.bone, near); };
const skipTorso = () => { const fig = S.figId || 1; return o => o.fig === fig && (TORSO_JOINTS.has(o.bone) || TORSO_JOINTS.has(PARENT[o.bone])); };
function hiddenAt(q, W, H, skip){
  const o = occluders(W, H), d = sub(q, o.eye), dist = len(d);
  if (dist < 1) return false;
  const dir = mul(d, 1 / dist), limit = dist - 1.5;
  for (const s of o.spheres){
    if (skip && skip(s)) continue;
    const oc = sub(o.eye, s.c), b = dot(oc, dir), c = dot(oc, oc) - s.r * s.r, disc = b * b - c;
    if (disc < 0) continue;
    const t = -b - Math.sqrt(disc);
    if (t > 0 && t < limit) return true;
  }
  if (typeof rayHit === "function") for (const m of o.meshes){
    if (skip && skip(m)) continue;
    const t = rayHit(m.mesh, {o: o.eye, dir});
    if (t !== null && t > 0 && t < limit) return true;
  }
  return false;
}
// a 3D segment: solid where it is seen, dashed where it is hidden (just solid when the switch is off)
// (seenWH: the size of the view the hiding is judged in; the side view asks about the front one)
function strokeSeen(ctx, a, b, W, H, skip, proj = project, seenWH = [W, H]){
  const pa = proj(a, W, H), pb = proj(b, W, H);
  if (!S.hiddenDashed){ ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke(); return; }
  const n = Math.max(1, Math.min(14, Math.ceil(Math.hypot(pb.x - pa.x, pb.y - pa.y) / (10 * (devicePixelRatio || 1)))));
  const lw = ctx.lineWidth, dash = [lw * 3, lw * 2.5];
  let start = 0, prev = null;
  const flush = (k0, k1, hid) => {
    const p = proj(add(a, mul(sub(b, a), k0 / n)), W, H), q = proj(add(a, mul(sub(b, a), k1 / n)), W, H);
    ctx.setLineDash(hid ? dash : []); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
  };
  for (let k = 0; k < n; k++){
    const hid = hiddenAt(add(a, mul(sub(b, a), (k + 0.5) / n)), seenWH[0], seenWH[1], skip);
    if (prev !== null && hid !== prev){ flush(start, k, prev); start = k; }
    prev = hid;
  }
  flush(start, n, prev);
  ctx.setLineDash([]);
}
function drawAtari(ctx, W, H, opts = {}){ return withPX(figPX(), () => drawFigure(ctx, W, H, opts)); }
function drawFigure(ctx, W, H, opts){
  if (S.P.length < J.length) upgradeState(S);
  const P = S.P.map(p => project(p, W, H));
  const ink = opts.ink || cssVar("--figure"), far = opts.far || cssVar("--far");
  const lw = Math.max(1.5, W / 540);
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  // far things first: bones and circles sorted by depth, farther drawn lighter in the editor
  const items = [];
  const tp = torsoParts();
  if (S.torso3d) for (const c of torsoBoxes()){
    const pp = c.map(q => project(q, W, H));
    items.push({z: pp.reduce((m, q) => m + q.z, 0) / pp.length - 0.5, kind: "box", pp, q3: c});
  }
  else for (const poly of tp.blocks){
    const pp = poly.map(q => project(q, W, H));
    items.push({z: pp.reduce((m, q) => m + q.z, 0) / pp.length - 0.5, kind: "poly", pp, q3: poly});
  }
  const wl = tp.waistLine.map(q => project(q, W, H));
  items.push({z: wl[1].z - 0.4, kind: "line", pp: wl, q3: tp.waistLine});
  BONES.forEach(([a, b]) => { if (!TORSO_BONES.has(b) && !HAND_J.has(b)) items.push({z: (P[a].z + P[b].z)/2, kind: "bone", a, b}); });
  J.forEach((_, i) => items.push({z: P[i].z + 0.01, kind: "joint", i}));
  items.sort((u, v) => u.z - v.z);
  // what lies well behind the body's middle (10 cm and more) is drawn lighter
  const zs = P.map(p => p.z).sort((a, b) => a - b), zmid = zs[Math.floor(zs.length / 2)];
  // a part's own line colour (S.colors.parts, pose_style.js) is kept behind the body, only fainter
  const isFar = z => !(opts.flat || z > zmid - 10);
  const shade = (z, g) => { const c = partColor(g);
    ctx.globalAlpha = c && isFar(z) ? 0.55 : 1; return c || (isFar(z) ? far : ink); };
  if (!opts.noFigure) for (const it of items){
    if (it.kind === "line"){
      ctx.strokeStyle = shade(it.z, "torso"); ctx.lineWidth = lw * 1.6;
      for (let k = 1; k < it.q3.length; k++) strokeSeen(ctx, it.q3[k - 1], it.q3[k], W, H, skipTorso());
      continue;
    }
    if (it.kind === "box"){
      // the faces turned to the camera are filled and outlined; the edges behind the box are left
      // out, or dashed with 隠れた線を破線に
      const see = boxFacing(it.q3, add(camRotInv([0, 0, camDist(W, H)]), S.center));
      if (!opts.flat){ ctx.fillStyle = opts.bg || cssVar("--stage"); ctx.globalAlpha = 0.55;
        BOX_FACES.forEach((f, k) => { if (!see[k]) return; ctx.beginPath();
          f.forEach((i, n) => n ? ctx.lineTo(it.pp[i].x, it.pp[i].y) : ctx.moveTo(it.pp[i].x, it.pp[i].y)); ctx.closePath(); ctx.fill(); });
        ctx.globalAlpha = 1; }
      ctx.strokeStyle = shade(it.z, "torso"); ctx.lineWidth = lw * 1.6;
      for (const [a, b, f1, f2] of BOX_EDGES){
        if (see[f1] || see[f2]) strokeSeen(ctx, it.q3[a], it.q3[b], W, H, skipTorso());
        else if (S.hiddenDashed){ ctx.setLineDash([ctx.lineWidth * 3, ctx.lineWidth * 2.5]); ctx.beginPath();
          ctx.moveTo(it.pp[a].x, it.pp[a].y); ctx.lineTo(it.pp[b].x, it.pp[b].y); ctx.stroke(); ctx.setLineDash([]); }
      }
      continue;
    }
    if (it.kind === "poly"){
      ctx.beginPath(); it.pp.forEach((q, k) => k ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.closePath();
      if (!opts.flat){ ctx.fillStyle = opts.bg || cssVar("--stage"); ctx.globalAlpha = 0.55; ctx.fill(); ctx.globalAlpha = 1; }
      ctx.strokeStyle = shade(it.z, "torso"); ctx.lineWidth = lw * 1.6;
      it.q3.forEach((q, k) => strokeSeen(ctx, q, it.q3[(k + 1) % it.q3.length], W, H, skipTorso()));
      continue;
    }
    if (it.kind === "bone"){
      ctx.strokeStyle = shade(it.z, PART_OF[J[it.b]]); ctx.lineWidth = lw * 1.4;
      // the neck from the shoulders' top face (their middle), not from inside the chest
      strokeSeen(ctx, it.b === IX.neck ? shoulderMid() : S.P[it.a], S.P[it.b], W, H, skipBone(it.b));
    } else {
      const i = it.i, p = P[i], r = handleR(i) * p.s;
      if (HANDLE.has(i) && opts.export) continue;           // handles are for the editor only
      ctx.strokeStyle = HANDLE.has(i) ? far : shade(it.z, PART_OF[J[i]]); ctx.lineWidth = lw * (i === IX.head ? 1.6 : 1.1);
      if (!opts.flat){ ctx.fillStyle = opts.bg || cssVar("--stage"); ctx.globalAlpha = 0.55;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 2*Math.PI); ctx.fill(); ctx.globalAlpha = 1; }
      const hid = S.hiddenDashed && hiddenAt(S.P[i], W, H, skipJoint(i));
      if (hid) ctx.setLineDash([ctx.lineWidth * 3, ctx.lineWidth * 2.5]);
      if (i === IX.head && headShaped()){ if ((S.headShape.mode || "ball") === "ball") headEllipse(ctx, W, H, project); else headOutline(ctx, p, r, opts.side); }
      else { ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 2*Math.PI); ctx.stroke(); }
      ctx.setLineDash([]);
      if (opts.sel === i){ ctx.strokeStyle = cssVar("--sel"); ctx.lineWidth = lw * 2;
        ctx.beginPath(); ctx.arc(p.x, p.y, r + 3*lw, 0, 2*Math.PI); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
  }
  // the face's centre lines (where the head looks), like a Loomis cross
  if (!opts.noFigure){
  const h = headFrame(), c = S.P[IX.head], [rx, ry, rz] = headRadii();
  ctx.strokeStyle = partColor("head") || ink; ctx.lineWidth = lw;
  if (S.hiddenDashed && hiddenAt(c, W, H, skipJoint(IX.head))) ctx.setLineDash([lw * 3, lw * 2.5]);
  const arc = (fn) => { ctx.beginPath(); for (let k = 0; k <= 24; k++){
      const t = -Math.PI/2 + Math.PI * k/24, q = project(fn(t), W, H);
      k ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); } ctx.stroke(); };
  // on the head as stretched (頭の形)
  arc(t => add(c, add(mul(h.fwd, rz*Math.cos(t)), mul(h.up, ry*Math.sin(t)))));      // vertical
  arc(t => add(c, add(mul(h.fwd, rz*Math.cos(t)), mul(h.side, rx*Math.sin(t)))));    // eye line
  ctx.setLineDash([]);
  // pinned joints: a small filled square (editor only)
  if (!opts.export) for (const k of Object.keys(S.pins || {})){
    const q = P[+k]; ctx.fillStyle = cssVar("--sel"); ctx.fillRect(q.x - 3*lw, q.y - 3*lw, 6*lw, 6*lw);
  }
  }
  // the scene: floor, walls, things held and placed (pose_scene.js)
  if (typeof drawScene === "function") withPX(null, () => drawScene(ctx, W, H, opts, project, ink, far, lw));   // each thing its own (pose_scene.js)
  // hands: the palm's outline and the fingers (pose_hand.js)
  if (!opts.noFigure) for (const side of ["r", "l"]) drawHand(ctx, side, W, H, opts, ink, lw);
  ctx.setLineDash([]);
}

// the torso as a mannequin draws it: the chest block (shoulder line -> under the ribs) and the
// pelvis block (its top -> the thigh roots, crotch level) are two separate trapezoids; the
// waist between them is a line through the waist joint, where the body bends
const TORSO_BONES = new Set([IX.waist, IX.chest, IX.r_shoulder, IX.l_shoulder, IX.r_hip, IX.l_hip]);
const GAP = 0.45;                       // how far toward the waist each block stops (0..1)
function torsoParts(){
  const P = S.P, R = S.R, w = P[IX.waist];
  const acrossChest = norm(sub(P[IX.l_shoulder], P[IX.r_shoulder]));
  const acrossHips = norm(sub(P[IX.l_hip], P[IX.r_hip]));
  const ribs = add(w, mul(sub(P[IX.chest], w), GAP));         // under the chest block
  const pelvisTop = add(w, mul(sub(P[IX.pelvis], w), GAP));   // top of the pelvis block
  const half = R[IX.waist];
  const hipOut = side => { const h = P[IX[side + "_hip"]];
    return add(h, mul(acrossHips, (side === "l" ? 1 : -1) * R[IX[side + "_hip"]] * 0.9)); };
  const chestBlock = [P[IX.r_shoulder], P[IX.l_shoulder],
                      add(ribs, mul(acrossChest, half)), add(ribs, mul(acrossChest, -half))];
  const pelvisBlock = [add(pelvisTop, mul(acrossHips, -half * 1.05)), add(pelvisTop, mul(acrossHips, half * 1.05)),
                       hipOut("l"), hipOut("r")];
  return {blocks: [chestBlock, pelvisBlock], waistLine: [ribs, w, pelvisTop]};
}
function torso(){ return torsoParts().blocks; }
// 胴体を立体に (S.torso3d, on by default): each trapezoid becomes a box along the body's front, its
// front and back faces the trapezoid moved forward and back. The ribcage is deepest at the
// shoulders, the pelvis at the hips. Faces: [corner indices], corners 0-3 front, 4-7 back.
const BOX_FACES = [[0, 1, 2, 3], [7, 6, 5, 4], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]];
const BOX_EDGES = [[0, 1, 0, 2], [1, 2, 0, 3], [2, 3, 0, 4], [3, 0, 0, 5], [4, 5, 1, 2], [5, 6, 1, 3], [6, 7, 1, 4],
                   [7, 4, 1, 5], [0, 4, 2, 5], [1, 5, 2, 3], [2, 6, 3, 4], [3, 7, 4, 5]];   // [a, b, face, face]
function torsoBoxes(){
  const P = S.P, half = S.R[IX.waist], tp = torsoParts();
  const box = (quad, across, up, [dTop, dBottom]) => {
    let u = sub(up, mul(across, dot(up, across))); u = norm(u);
    const fwd = norm(cross(across, u)), d = [dTop, dTop, dBottom, dBottom].map(k => k * half);
    return [...quad.map((q, k) => add(q, mul(fwd, d[k]))), ...quad.map((q, k) => add(q, mul(fwd, -d[k])))];
  };
  return [box(tp.blocks[0], norm(sub(P[IX.l_shoulder], P[IX.r_shoulder])), sub(P[IX.neck], P[IX.waist]), [0.75, 0.68]),
          box(tp.blocks[1], norm(sub(P[IX.l_hip], P[IX.r_hip])), sub(P[IX.waist], P[IX.pelvis]), [0.62, 0.8])];
}
// which faces of a box look at the camera
function boxFacing(c, eye){
  const mid = mul(c.reduce((m, q) => add(m, q), [0, 0, 0]), 1 / c.length);
  return BOX_FACES.map(f => { const q = f.map(i => c[i]), fc = mul(add(add(q[0], q[1]), add(q[2], q[3])), 0.25);
    let n = cross(sub(q[1], q[0]), sub(q[3], q[0])); if (dot(n, sub(fc, mid)) < 0) n = mul(n, -1);
    return dot(n, sub(eye, fc)) > 0; });
}

// ---- hands: the shapes, the fingers' joints, the 21 points and the drawing are in pose_hand.js ----

// ---- OpenPose picture -----------------------------------------------------------------------
const OP_COLORS = [[255,0,0],[255,85,0],[255,170,0],[255,255,0],[170,255,0],[85,255,0],[0,255,0],
  [0,255,85],[0,255,170],[0,255,255],[0,170,255],[0,85,255],[0,0,255],[85,0,255],[170,0,255],
  [255,0,255],[255,0,170],[255,0,85]];
const OP_LIMBS = [[1,2],[1,5],[2,3],[3,4],[5,6],[6,7],[1,8],[8,9],[9,10],[1,11],[11,12],[12,13],
                  [1,0],[0,14],[14,16],[0,15],[15,17]];
function openposePoints(W, H){
  const f = facePoints(), P = S.P;
  const neck = P[IX.neck];
  const order = [f.nose, neck, P[IX.r_shoulder], P[IX.r_elbow], P[IX.r_wrist], P[IX.l_shoulder],
                 P[IX.l_elbow], P[IX.l_wrist], P[IX.r_hip], P[IX.r_knee], P[IX.r_ankle],
                 P[IX.l_hip], P[IX.l_knee], P[IX.l_ankle], f.r_eye, f.l_eye, f.r_ear, f.l_ear];
  return order.map(p => project(p, W, H));
}
function drawOpenpose(ctx, W, H, noBg){ return withPX(figPX(), () => drawOpenpose0(ctx, W, H, noBg)); }   // パースの誇張: the figure's own
function drawOpenpose0(ctx, W, H, noBg){
  if (!noBg){ ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H); }
  const K = openposePoints(W, H), sw = Math.max(2, Math.round(4 * Math.max(W, H) / 1024));
  OP_LIMBS.forEach(([a, b], i) => {
    const pa = K[a], pb = K[b], mx = (pa.x + pb.x)/2, my = (pa.y + pb.y)/2;
    const l = Math.hypot(pa.x - pb.x, pa.y - pb.y), ang = Math.atan2(pa.y - pb.y, pa.x - pb.x);
    ctx.fillStyle = `rgba(${OP_COLORS[i].join(",")},0.6)`;
    ctx.beginPath(); ctx.ellipse(mx, my, l/2, sw, ang, 0, 2*Math.PI); ctx.fill();
  });
  K.forEach((p, i) => { ctx.fillStyle = `rgb(${OP_COLORS[i].join(",")})`;
    ctx.beginPath(); ctx.arc(p.x, p.y, sw, 0, 2*Math.PI); ctx.fill(); });
  for (const side of ["r", "l"]){
    const pts = handPoints(side, W, H), hw = Math.max(1, sw * 0.5);
    HAND_EDGES.forEach(([a, b], i) => {
      const hsv = i / HAND_EDGES.length, c = hsvToRgb(hsv, 1, 1);
      ctx.strokeStyle = `rgb(${c.join(",")})`; ctx.lineWidth = hw * 2; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(pts[a][0], pts[a][1]); ctx.lineTo(pts[b][0], pts[b][1]); ctx.stroke();
    });
    pts.forEach(p => { ctx.fillStyle = "rgb(0,0,255)"; ctx.beginPath(); ctx.arc(p[0], p[1], hw * 1.4, 0, 2*Math.PI); ctx.fill(); });
  }
}
function hsvToRgb(h, s, v){
  const i = Math.floor(h * 6), f = h * 6 - i, p = v*(1-s), q = v*(1-f*s), t = v*(1-(1-f)*s);
  const [r, g, b] = [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]][i % 6];
  return [r, g, b].map(x => Math.round(x * 255));
}

// ---- the two views ------------------------------------------------------------------------
const front = document.getElementById("front"), side = document.getElementById("side");
let sel = -1, mode = "pose";
function exportSize(){ return [Math.max(256, +$("W").value || 1080), Math.max(256, +$("H").value || 1920)]; }
// the height of what sits around the views in their panel (modes, keys, hints), measured again
// when the window, the mode or the layout changes
let chromeKey = "", chromeH = 160;
function viewChrome(){
  const views = front.closest(".views");
  // the views' box as a whole is left out (with the side view under the front one it is part of it)
  const sec = front.closest("section"), key = [innerWidth, innerHeight, document.body.className, views.className].join("|");
  if (sec && key !== chromeKey){ chromeKey = key; chromeH = Math.max(0, sec.offsetHeight - views.offsetHeight); }
  return chromeH;
}
// the side view above or below the front one (側面図の置き場所; on a phone too)
const PHONE = "(max-width:700px)";
function sideStacked(){
  if (!side.parentElement.getClientRects().length) return false;
  return /\bside-(top|bottom)\b/.test(front.closest(".views").className);
}
const ONE_COLUMN = "(max-width:900px), (orientation:portrait) and (max-aspect-ratio:4/5)";
// The views' height (maxH) and whether they have a room of their own (room: beside the panel, a
// strip, split screen, put away), else (one column, the page scrolls) a view is as tall as the
// picture's shape asks, up to its share of the window.
function viewsRoom(){
  // the phone's sheet layout (ui-sheet.js): the front view takes the whole screen
  // (the tall layout: the views' own part on top, its height set by the grip; ui-sheet.js)
  if (document.body.classList.contains("sheet")){
    const st = document.getElementById("stage");
    return {maxH: Math.round(document.body.classList.contains("sheet-tall") ? st.clientHeight : innerHeight), room: true};
  }
  // the views stay on screen as the page scrolls: beside the panels they may take the window's
  // height, above them (one column) part of it, so the panels show underneath
  const short = innerHeight <= 520 && innerWidth >= 700;          // a phone held sideways: panels beside
  // the panel above or below the views (操作欄の位置): a strip, the views take the rest; put away
  // (しまう): the views take the whole height
  const bc = document.body.classList, own = !bc.contains("split"), off = own && bc.contains("aside-off");
  const stackedPanel = own && !off && (bc.contains("aside-top") || bc.contains("aside-bottom"));
  const strip = stackedPanel ? document.querySelector("aside").offsetHeight + document.querySelector(".app-header").offsetHeight + 40 : 0;
  const share = stackedPanel ? Math.max(0.3, 1 - strip / (innerHeight || 800))
    : off || short || !matchMedia(ONE_COLUMN).matches ? 1 : innerWidth <= 700 ? 0.8 : 0.7;
  // split screen: the views' own half of the screen
  const st = document.body.classList.contains("split") ? document.getElementById("stage") : null;
  const maxH = st ? Math.max(120, st.clientHeight - viewChrome() - 10)
    : Math.max(200, Math.round((window.innerHeight || 800) * share - viewChrome() - 18));
  return {maxH, room: !!(st || stackedPanel || off || short || !matchMedia(ONE_COLUMN).matches)};
}
// A view fills its box's width. fixedH: the side view above or below the front one keeps to that
// height; reserve: what that side view takes of the front one's height (with the gap).
function fitCanvas(cv, aspect, fixedH, reserve = 0){
  const dpr = window.devicePixelRatio || 1;
  let w = cv.parentElement.clientWidth, h = Math.round(w / aspect);
  const r = fixedH ? {maxH: fixedH, room: true} : viewsRoom(), maxH = Math.max(80, r.maxH - reserve);
  h = r.room ? maxH : Math.min(h, maxH);
  cv.width = Math.max(1, Math.round(w * dpr)); cv.height = Math.max(1, Math.round(h * dpr));
  cv.style.width = w + "px"; cv.style.height = h + "px";
}
// the side view (側面図, pose_sideview.js): orthographic, from the camera's right (or left: S.sideView.from
// "l"), level: 90° from the camera's direction (its yaw only) unless turned (yaw, pitch: degrees on top),
// round a centre (the camera's look-at point, or a figure's joint / an object: key, joint), moved (pan,
// world cm) and zoomed. ex / ey: the screen's right and up, ez: toward the viewer (world), k: px per cm
function sideView(){ return Object.assign({from: "r", key: "", joint: "pelvis", yaw: 0, pitch: 0, zoom: 1, pan: [0, 0, 0]}, S.sideView || {}); }
function sideCentre(v){
  v = v || sideView(); const key = v.key || "";
  if (/^[si]\d+$/.test(key) && window.ODMObj && ODMObj.toWorld){ const w = ODMObj.toWorld(key, null); if (w) return w; }
  if (/^f\d+$/.test(key)){
    let P = S.P; if (+key.slice(1) !== (S.figId || 1)){ const f = (S.others || []).find(o => (o.figId || 1) === +key.slice(1)); P = f ? f.P : null; }
    if (P){ const j = IX[v.joint] !== undefined ? IX[v.joint] : IX.pelvis; if (P[j]) return P[j]; }
  }
  return S.center;
}
function sideBasis(W, H){
  const v = sideView(), Y = deg(S.cam.yaw + (+v.yaw || 0)), b = deg(+v.pitch || 0), up = [0, 1, 0];
  const qz = rotAxis([0, 0, 1], up, Y), qx = rotAxis([1, 0, 0], up, Y), l = v.from === "l";
  const ex = l ? qz : mul(qz, -1), ez0 = l ? mul(qx, -1) : qx;
  const ey = sub(mul(up, Math.cos(b)), mul(ez0, Math.sin(b))), ez = add(mul(up, Math.sin(b)), mul(ez0, Math.cos(b)));
  const pan = Array.isArray(v.pan) ? v.pan : [0, 0, 0];
  return {c: add(sideCentre(v), pan), ex, ey, ez, k: 0.86 * H / 190 * Math.max(0.05, +v.zoom || 1)};
}
function sideProject(p, W, H){
  const B = sideBasis(W, H), d = sub(p, B.c);
  return {x: W/2 + dot(d, B.ex) * B.k, y: H/2 - dot(d, B.ey) * B.k, s: B.k};
}
// a pixel of the side view at the depth (toward the viewer) of p
function sideUnproject(x, y, W, H, p){
  const B = sideBasis(W, H);
  return add(add(B.c, add(mul(B.ex, (x - W/2) / B.k), mul(B.ey, (H/2 - y) / B.k))), mul(B.ez, dot(sub(p, B.c), B.ez)));
}
function draw(){
  const [EW, EH] = exportSize();
  frameAspect = EW / EH;
  // the side view above or below: its own height, out of the views' (up to 4 parts of 10; on a
  // wider screen also up to about a quarter of the window)
  let sideH = 0, gap = 0;
  if (sideStacked()){
    gap = parseFloat(getComputedStyle(front.closest(".views")).rowGap) || 0;
    const cap = matchMedia(PHONE).matches ? Infinity : Math.max(100, (innerHeight || 800) * 0.26);
    sideH = Math.max(80, Math.round(Math.min(cap, (viewsRoom().maxH - gap) * 0.4)));
  }
  fitCanvas(front, EW / EH, 0, sideH ? sideH + gap : 0); fitCanvas(side, EW / EH, sideH); zoomThumb();
  let ctx = front.getContext("2d"), W = front.width, H = front.height;
  ctx.fillStyle = cssVar("--stage"); ctx.fillRect(0, 0, W, H);
  // outside the picture's frame: a light shade and the frame's edge (not in the file)
  { const [fw, fh] = frameWH(W, H), fx = (W - fw) / 2, fy = (H - fh) / 2;
    if (fx > 1 || fy > 1){ ctx.save(); ctx.fillStyle = cssVar("--far"); ctx.globalAlpha = 0.08;
      ctx.fillRect(0, 0, W, fy); ctx.fillRect(0, fy + fh, W, H - fy - fh); ctx.fillRect(0, fy, fx, fh); ctx.fillRect(fx + fw, fy, W - fx - fw, fh);
      ctx.globalAlpha = 0.7; ctx.strokeStyle = cssVar("--far"); ctx.lineWidth = devicePixelRatio || 1; ctx.setLineDash([6, 4].map(v => v * (devicePixelRatio || 1)));
      ctx.strokeRect(fx + 0.5, fy + 0.5, fw - 1, fh - 1); ctx.restore(); } }
  drawAtari(ctx, W, H, {sel});
  // side view
  ctx = side.getContext("2d"); W = side.width; H = side.height;
  ctx.fillStyle = cssVar("--stage"); ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = cssVar("--line"); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W/2, 0); ctx.lineTo(W/2, H); ctx.stroke();
  ctx.fillStyle = cssVar("--sub"); ctx.font = `${Math.round(11 * (devicePixelRatio || 1))}px sans-serif`;
  // where the camera is: to the left or right of the side view, or (turned round) near or far
  { const B = sideBasis(W, H), cb = camRotInv([0, 0, 1]), sx = dot(cb, B.ex), y = H - 38 * (devicePixelRatio || 1);
    if (sx > 0.3){ ctx.textAlign = "right"; ctx.fillText("カメラ側 →", W - 6, y); ctx.textAlign = "left"; }
    else if (sx < -0.3) ctx.fillText("← カメラ側", 6, y);
    else ctx.fillText(dot(cb, B.ez) > 0 ? "カメラ側：手前" : "カメラ側：奥", 6, y); }
  // the parts' line colours, and the lines hidden from the camera dashed, as in the front view
  const FW = front.width, FH = front.height, seen = [FW, FH];
  const sideFigure = (active, first) => {
    const P = S.P.map(p => sideProject(p, W, H)), ink = cssVar(active ? "--figure" : "--far");
    const col = g => partColor(g) || ink;
    ctx.lineWidth = Math.max(1.2, W / 260);
    BONES.forEach(([a, b]) => { if (HAND_J.has(b)) return; ctx.strokeStyle = col(PART_OF[J[b]]);
      strokeSeen(ctx, S.P[a], S.P[b], W, H, skipBone(b), sideProject, seen); });
    const tps = torsoParts();
    ctx.strokeStyle = col("torso");
    if (S.torso3d) for (const c of torsoBoxes()) for (const [a, b] of BOX_EDGES) strokeSeen(ctx, c[a], c[b], W, H, skipTorso(), sideProject, seen);
    else for (const poly of tps.blocks) poly.forEach((q, k) => strokeSeen(ctx, q, poly[(k + 1) % poly.length], W, H, skipTorso(), sideProject, seen));
    for (let k = 1; k < tps.waistLine.length; k++) strokeSeen(ctx, tps.waistLine[k - 1], tps.waistLine[k], W, H, skipTorso(), sideProject, seen);
    P.forEach((p, i) => {
      ctx.strokeStyle = active && i === sel ? cssVar("--sel") : HANDLE.has(i) ? cssVar("--far") : col(PART_OF[J[i]]);
      if (S.hiddenDashed && hiddenAt(S.P[i], FW, FH, skipJoint(i))) ctx.setLineDash([ctx.lineWidth * 3, ctx.lineWidth * 2.5]);
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(2, handleR(i) * p.s), 0, 2*Math.PI); ctx.stroke(); ctx.setLineDash([]); });
    if (typeof drawScene === "function")
      drawScene(ctx, W, H, {side: true, noEnv: !first}, sideProject, ink, cssVar("--far"), Math.max(1, W / 360));
  };
  occFrozen = S.hiddenDashed ? occluders(FW, FH) : null;
  try { if (typeof everyFigure === "function") everyFigure(sideFigure); else sideFigure(true, true); }
  finally { occFrozen = null; }
  const hgt = standingHeight();
  $("heightP").textContent = `${hgt.toFixed(1)} cm（${(hgt / (2 * S.R[IX.head])).toFixed(1)} 頭身）`;
  showSelected(); camCoords(); figCoords();
}
// standing height from the bone lengths (whatever the pose): crown to the floor
const bl = (a, b) => len(sub(S.P[IX[a]], S.P[IX[b]]));
function standingHeight(){
  const upper = S.R[IX.head] + bl("head", "neck") + bl("neck", "chest") + bl("chest", "waist") + bl("waist", "pelvis");
  const leg = s => bl(s + "_hip", "pelvis") * 0.29 + bl(s + "_knee", s + "_hip") + bl(s + "_ankle", s + "_knee")
    + bl(s + "_toe", s + "_ankle") * 0.55;
  return upper + (leg("r") + leg("l")) / 2;
}
function headsCount(){ return standingHeight() / (2 * S.R[IX.head]); }

// ---- picking and dragging ------------------------------------------------------------------
function evPos(cv, e){ const r = cv.getBoundingClientRect(), k = cv.width / r.width;
  return [(e.clientX - r.left) * k, (e.clientY - r.top) * k]; }
function pick(cv, x, y){
  const W = cv.width, H = cv.height, isSide = cv === side;
  let best = -1, bd = 1e9;
  S.P.forEach((p, i) => {
    const q = isSide ? sideProject(p, W, H) : project(p, W, H);
    const d = Math.hypot(q.x - x, q.y - y) - Math.max(8, handleR(i) * q.s);
    if (d < bd){ bd = d; best = i; }
  });
  return bd < 14 * pointerScale() * (devicePixelRatio || 1) ? best : -1;
}
function rotateSubtree(i, newPos){            // turn the bone parent->i so i lands on newPos
  const p = S.P[PARENT[i]], a = sub(S.P[i], p), b = sub(newPos, p);
  for (const k of subtree(i)) S.P[k] = add(p, rotBetween(sub(S.P[k], p), a, b));
}
function moveSubtree(i, delta){ for (const k of subtree(i)) S.P[k] = add(S.P[k], delta); }

// pose mode, front view: keep the bone's length, solve the depth along the view ray
function dragPose(i, x, y, W, H){
  if (i === IX.pelvis){                       // the whole figure, in the picture plane
    const q = project(S.P[i], W, H), dW = camRotInv([(x - q.x) / q.s, -(y - q.y) / q.s, 0]);
    S.P = S.P.map(p => add(p, dW)); return;
  }
  const par = PARENT[i], L = len(sub(S.P[i], S.P[par]));
  const f = lensF(W, H), D = camDist(W, H);
  const pc = toCam(S.P[par]), ic = toCam(S.P[i]);
  const dir = pixDir(x, y, W, H), O = [0, 0, D];
  const op = sub(O, pc), bq = dot(dir, op), cq = dot(op, op) - L*L, disc = bq*bq - cq;
  let target;
  if (disc >= 0){
    const t1 = -bq - Math.sqrt(disc), t2 = -bq + Math.sqrt(disc);
    const c1 = add(O, mul(dir, t1)), c2 = add(O, mul(dir, t2));
    // keep the side (toward the camera or away) the bone was on
    const was = ic[2] - pc[2];
    target = Math.abs((c1[2] - pc[2]) - was) <= Math.abs((c2[2] - pc[2]) - was) ? c1 : c2;
  } else {                                    // out of reach: the bone points at the mouse
    const t = -bq, close = add(O, mul(dir, t));
    target = add(pc, mul(norm(sub(close, pc)), L));
  }
  rotateSubtree(i, add(camRotInv(target), S.center));
}
// wrists and ankles: the whole limb reaches (two-bone IK), the elbow / knee bends the way it
// already bends; the hand stays at its depth from the camera
const IK_END = {r_wrist: 1, l_wrist: 1, r_ankle: 1, l_ankle: 1};
function dragIK(i, x, y, W, H){
  const mid = PARENT[i], root = PARENT[mid];
  const f = lensF(W, H), D = camDist(W, H);
  const ec = toCam(S.P[i]), dir = pixDir(x, y, W, H);
  const t = (ec[2] - D) / dir[2], T = add([0, 0, D], mul(dir, t));          // same depth
  const rc = toCam(S.P[root]), mc = toCam(S.P[mid]);
  const L1 = len(sub(mc, rc)), L2 = len(sub(ec, mc));
  let toT = sub(T, rc); let c = len(toT);
  c = Math.max(Math.abs(L1 - L2) + 1e-3, Math.min(L1 + L2 - 1e-3, c));
  const dT = norm(toT);
  let pole = sub(mc, rc); pole = sub(pole, mul(dT, dot(pole, dT)));
  if (len(pole) < 0.15 * L1){
    // a straight limb has no bend to keep: knees bend forward, elbows backward
    const across = norm(sub(S.P[IX.l_shoulder], S.P[IX.r_shoulder]));
    const fwd = camRot(norm(cross(across, [0, 1, 0])));
    pole = mul(fwd, J[i].endsWith("ankle") ? 1 : -1);
    pole = sub(pole, mul(dT, dot(pole, dT)));
    if (len(pole) < 1e-6) pole = cross(dT, [0, 0, 1]);
  }
  const pn = norm(pole);
  const cosA = Math.max(-1, Math.min(1, (L1*L1 + c*c - L2*L2) / (2 * L1 * c)));
  const elbow = add(rc, add(mul(dT, L1 * cosA), mul(pn, L1 * Math.sqrt(1 - cosA*cosA))));
  rotateSubtree(mid, add(camRotInv(elbow), S.center));
  const end = add(rc, mul(dT, c));
  rotateSubtree(i, add(camRotInv(end), S.center));
}
// side view: depth and height of the camera space, the bone's length kept
function dragSide(i, x, y, W, H){
  if (i === IX.pelvis) return;
  const par = PARENT[i], L = len(sub(S.P[i], S.P[par]));
  const want = sideUnproject(x, y, W, H, S.P[i]), v = norm(sub(want, S.P[par]));
  rotateSubtree(i, add(S.P[par], mul(v, L)));
}
// the shoulders and the thigh roots sit on the torso: they move along its own axes, one at a time
// (x: apart / together, y: up / down, z: forward / back), so widening the shoulders does not lift
// them along the bone from the chest. 左右対称: the other side too (mirrored across).
const TORSO_PAIR = {r_shoulder: 1, l_shoulder: 1, r_hip: 1, l_hip: 1};
function torsoAxes(i){
  const n = J[i].slice(2), r = S.P[IX["r_" + n]], l = S.P[IX["l_" + n]], P = S.P;
  const x = norm(sub(l, r));
  let y = n === "shoulder" ? sub(P[IX.neck], P[IX.waist]) : sub(P[IX.waist], P[IX.pelvis]);
  y = norm(sub(y, mul(x, dot(y, x))));
  return [x, y, cross(x, y)];
}
// move a shoulder / thigh root by t cm along torso axis a (0 x, 1 y, 2 z); x: outward is +t
function movePair(i, a, t, sym){
  const ax = torsoAxes(i)[a], out = J[i].startsWith("l_") ? 1 : -1;
  const d = mul(ax, a === 0 ? t * out : t);
  withNeck(() => { moveSubtree(i, d); if (sym) moveSubtree(MIRROR[i], a === 0 ? mul(d, -1) : d); });
  keepTorsoShape();
}
// the neck starts on the shoulders' top face: when the shoulders go up or down (their middle along
// the torso's up), the neck and the head go with them
const shoulderMid = () => mul(add(S.P[IX.r_shoulder], S.P[IX.l_shoulder]), 0.5);
function withNeck(fn){
  const m0 = shoulderMid(), up = torsoAxes(IX.r_shoulder)[1];
  fn();
  const d = dot(sub(shoulderMid(), m0), up);
  if (Math.abs(d) > 1e-9) moveSubtree(IX.neck, mul(up, d));
}
// a change of the body's sizes grows from the bottom: the lowest point stays where it was (the
// feet stay on the floor when the legs or the height change)
function fromBottom(fn){
  const low = () => Math.min(...S.P.map(p => p[1])), y0 = low();
  fn();
  const d = y0 - low();
  if (Math.abs(d) > 1e-9) S.P = S.P.map(p => [p[0], p[1] + d, p[2]]);
}
// an arm's circles (shoulder, elbow, wrist) or a leg's (thigh root, knee, ankle) are made thicker
// together unless 太さを部位ごとに連動 is off; mirror: the other side too (左右対称)
const LIMB_THICK = {arm: ["shoulder", "elbow", "wrist"], leg: ["hip", "knee", "ankle"]};
function thickJoints(j, mirror){
  const n = J[j].slice(2), side = J[j][0], link = !$("thickLink") || $("thickLink").checked;
  const g = (side === "r" || side === "l") && Object.values(LIMB_THICK).find(list => list.includes(n));
  const out = link && g ? g.map(m => IX[side + "_" + m]) : [j];
  return mirror && $("sym").checked && MIRROR[j] !== j ? [...out, ...out.map(q => MIRROR[q])] : out;
}
function dragPair(i, x, y, W, H){
  const q = project(S.P[i], W, H), axes = torsoAxes(i);
  const scr = axes.map(u => { const e = project(add(S.P[i], u), W, H); return [e.x - q.x, e.y - q.y]; });
  if (drag && drag.axis === undefined){       // the axis: the one the drag first goes along
    if (Math.hypot(x - q.x, y - q.y) < 6 * (devicePixelRatio || 1)) return;
    let best = 0, bv = -1;
    scr.forEach(([sx, sy], a) => { const l = Math.hypot(sx, sy) || 1, v = Math.abs(((x - q.x) * sx + (y - q.y) * sy) / l) * (l > 0.05 * q.s ? 1 : 0);
      if (v > bv){ bv = v; best = a; } });
    drag.axis = best;
  }
  const a = drag ? drag.axis : 0, [sx, sy] = scr[a], l2 = sx * sx + sy * sy;
  if (l2 < 1e-6) return;
  let t = ((x - q.x) * sx + (y - q.y) * sy) / l2;
  if (a === 0) t *= J[i].startsWith("l_") ? 1 : -1;
  movePair(i, a, t, $("sym").checked);
}
// body mode: stretch the bone parent->i toward the mouse (the rest of the limb comes along)
function dragBody(i, x, y, W, H){
  if (i === IX.pelvis) return;
  if (TORSO_PAIR[J[i]]) return dragPair(i, x, y, W, H);
  const par = PARENT[i], a = project(S.P[par], W, H), b = project(S.P[i], W, H);
  const sl = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const along = ((x - a.x) * (b.x - a.x) + (y - a.y) * (b.y - a.y)) / sl;
  const ratio = Math.max(0.2, Math.min(4, along / sl));
  const apply = j => { const pj = PARENT[j], v = sub(S.P[j], S.P[pj]);
    moveSubtree(j, mul(v, ratio - 1)); };
  apply(i);
  if ($("sym").checked && MIRROR[i] !== i) apply(MIRROR[i]);
}
let drag = null;
let rangeHeld = null;                 // the slider being held (see the panel's pointer events)
// handles added by pose_solids.js / pose_ruler.js: a down hook returns a drag {move(x, y, e)} or
// null; a wheel hook returns true when it used the wheel. Hooks run first in the order added.
const DOWN_HOOKS = [], WHEEL_HOOKS = [];
// ---- one input for mouse, touch and pens (pointer events) -----------------------------------
// Keys a touch screen has not: the on-screen 「Shift」「固定」 toggles stand for Shift and Alt; a
// pen's barrel button and the mouse's right button act as Shift, a pen's eraser end as Alt. The
// hooks get the same view of the event: {shiftKey, altKey, ctrlKey, metaKey, pointerType,
// clientX, clientY, ..., original (the PointerEvent)}.
const VMOD = {shift: false, alt: false};
let lastPointer = "mouse";
const pointerScale = () => (lastPointer === "touch" ? 1.9 : lastPointer === "pen" ? 1.25 : 1);
function evMods(e){
  const b = e.buttons || 0;
  return {shiftKey: !!(e.shiftKey || VMOD.shift || (b & 2) || e.button === 2),
          altKey: !!(e.altKey || VMOD.alt || (b & 32) || e.button === 5),
          ctrlKey: !!e.ctrlKey, metaKey: !!e.metaKey, pointerType: e.pointerType || "mouse",
          pointerId: e.pointerId, button: e.button, buttons: b, pressure: e.pressure,
          clientX: e.clientX, clientY: e.clientY, preventDefault: () => e.preventDefault(), original: e};
}
// draw at most once a frame while dragging (phones and tablets send many moves)
let drawQueued = false;
function drawSoon(){ if (drawQueued) return; drawQueued = true; requestAnimationFrame(() => { drawQueued = false; draw(); }); }
function down(cv, e){
  const [x, y] = evPos(cv, e);
  // the camera as in Blender: the middle button turns the view (Shift: moves it, Ctrl: zooms);
  // Alt+drag where there is no joint does the same (a mouse or trackpad without a middle button)
  if (cv === front && e.pointerType !== "touch" && (e.button === 1 || (e.altKey && pick(cv, x, y) < 0))){
    if (camHeld()) return;
    remember(); drag = {nav: e.ctrlKey ? "zoom" : e.shiftKey ? "pan" : "orbit", lx: x, ly: y}; return; }
  if (e.altKey){ const i = pick(cv, x, y); if (i >= 0){ remember(); sel = i; togglePin(i); draw(); } return; }
  // the hand cursor (pose_objects.js): every drag on the front view moves the camera; a click still picks
  if (cv === front && handHook){ const d = handHook(cv, x, y, e); if (d){ drag = d; return; } }
  for (const h of DOWN_HOOKS){
    const d = h(cv, x, y, e);
    if (d){ remember(); drag = d; draw(); return; }
  }
  if (mode === "persp" && cv === front){
    if (camHeld()) return;
    drag = {cam: true, roll: e.shiftKey, x, y, yaw: S.cam.yaw, pitch: S.cam.pitch, roll0: S.cam.roll}; remember(); return; }
  const i = pick(cv, x, y);
  // 配置: the hips move the whole figure along the floor (Shift: up and down); other joints are only picked
  // (across the picture: across; up the picture: away from the camera, on the floor; Shift: up and down)
  if (mode === "place" && i === IX.pelvis && cv === front && !gizmoHolds()){
    sel = i; remember(); draw();
    const W = cv.width, H = cv.height, flat = v => norm([v[0], 0, v[2]]);
    const right = flat(camRotInv([1, 0, 0])), away = flat(camRotInv([0, 0, -1]));
    let lx = x, ly = y;
    drag = {move(mx, my, ev){
      const k = 1 / Math.max(1e-6, project(S.P[IX.pelvis], W, H).s), dx = (mx - lx) * k, dy = (ly - my) * k;
      let d = ev && ev.shiftKey ? [0, dy, 0] : add(mul(right, dx), mul(away, dy));
      // standing on a wall, a ceiling or a slope (S.stand, pose_scene.js): along that face, under the pointer
      if (S.stand && !(ev && ev.shiftKey) && typeof pixelRay === "function"){
        const n = S.stand.n, pv = S.P[IX.pelvis], hit = (X, Y) => { const r = pixelRay(X, Y, W, H), dn = dot(r.dir, n);
          return Math.abs(dn) < 1e-6 ? null : add(r.o, mul(r.dir, dot(sub(pv, r.o), n) / dn)); };
        const a = hit(lx, ly), b = hit(mx, my); d = a && b ? sub(b, a) : [0, 0, 0];
      }
      lx = mx; ly = my;
      moveAll(d, false);
      for (const n of Object.keys(S.pins || {})) S.pins[n] = add(S.pins[n], d);
      if (S.wire && S.wire.anchor) S.wire.anchor = add(S.wire.anchor, d);
      afterEdit(IX.pelvis); }};
    return;
  }
  // a joint is dragged (a finger: the one already picked) unless: 配置 (picked only), the 3-axis
  // handles show (they do the moving), or ポーズ's hips (moving the figure is 配置's)
  const drags = i >= 0 && mode !== "place" && !gizmoHolds() && !(mode === "pose" && i === IX.pelvis);
  // the drag cursor (pose_objects.js): a drag from an empty place draws a box that selects the objects in it
  if (i < 0 && cv === front && emptyDrag){ const d = emptyDrag(cv, x, y, e); if (d){ drag = d; return; } }
  if (e.pointerType === "touch"){
    if (drags && i === sel){ remember(); drag = {cv, i, single: e.shiftKey}; }
    else drag = {tapPick: i, cv, x, y};
    return;
  }
  // the mouse: a joint is picked at once; a drag from an empty place turns the camera (Shift: moves it)
  if (i < 0){ drag = {tapPick: -1, cv, x, y, pan: e.shiftKey}; return; }
  sel = i; draw();
  if (drags){ remember(); drag = {cv, i, single: e.shiftKey}; }
}
// 3軸ハンドル (pose_gizmo.js): while they show, joints and things are moved by the handles only
let gizmoHolds = () => false;
// the cursor's tools (pose_objects.js): the hand's press, the drag cursor's press on an empty place,
// and a click on an empty place (配置: the objects let go; ポーズ・体格: カメラ, when switching is on)
let handHook = null, emptyDrag = null, emptyClick = null, tapClick = null;
function move(cv, e){
  if (!drag) return;
  const [x, y] = evPos(cv, e), W = cv.width, H = cv.height;
  if (drag.move){ drag.move(x, y, e); drawSoon(); return; }
  if (drag.nav){
    const dx = x - drag.lx, dy = y - drag.ly; drag.lx = x; drag.ly = y;
    if (drag.nav === "orbit") camOrbit(-dx * 240 / W, dy * 180 / H);
    else if (drag.nav === "pan") camPan(dx, dy, W, H);
    else camZoom(Math.exp(-dy * 3 / H));
    camSync(); drawSoon(); return;
  }
  if (drag.tapPick !== undefined){
    if (Math.hypot(x - drag.x, y - drag.y) < 12 * (devicePixelRatio || 1)) return;
    if (cv === front && !camHeld()){ remember(); drag = {nav: drag.pan ? "pan" : "orbit", lx: drag.x, ly: drag.y}; move(cv, e); } else drag = null;
    return;
  }
  if (drag.cam && drag.roll){
    S.cam.roll = Math.max(-90, Math.min(90, drag.roll0 + (x - drag.x) * 90 / W));
    syncUI();
  } else if (drag.cam){
    S.cam.yaw = Math.max(-180, Math.min(180, drag.yaw + (x - drag.x) * 180 / W));
    S.cam.pitch = Math.max(-80, Math.min(80, drag.pitch + (y - drag.y) * 120 / H));
    syncUI();
  } else if (cv === side){ if (mode !== "body"){ dragSide(drag.i, x, y, W, H); afterEdit(drag.i); } }
  else if (mode === "pose"){
    const i = drag.i, pinnedKid = KIDS[i].some(k => S.pins && S.pins[k]);
    if (i === IX.pelvis && S.pins && S.pins[i]) { /* pinned: the whole figure does not move */ }
    else if (pinnedKid && !drag.single && dragMidPinned(i, x, y, W, H)) { /* the hand / foot stays */ }
    else if (IK_END[J[i]] && !drag.single) dragIK(i, x, y, W, H);
    else dragPose(i, x, y, W, H);
    afterEdit(i);
  }
  else if (mode === "body") fromBottom(() => dragBody(drag.i, x, y, W, H));
  drawSoon();
}
function up(){
  if (drag && drag.end){ const d = drag; drag = null; d.end(); return; }
  if (drag && drag.tapPick === -1 && drag.cv === front && emptyClick) emptyClick();
  if (drag && drag.tapPick !== undefined && !(mode === "place" && drag.cv === side)){ sel = drag.tapPick; draw(); }
  if (drag && drag.nav) syncUI();
  drag = null;
}
// ---- the camera without the Camera mode: turn, move, zoom (the lens stays) -------------
function zoomSpan(){ return [0.3, 4]; }
// 「カメラを固定する」: free moves (drags, swipes, pinches, the wheel, the keypad, the pad) are
// refused with a word; the Perspective sliders and a remembered camera still set it
function camHeld(){ if (!S.camLock) return false; say("カメラは固定中です（「カメラの固定と記憶」で外せます）。", true); return true; }
function camWrap(a){ return ((a + 180) % 360 + 360) % 360 - 180; }
function camOrbit(dyaw, dpitch){
  S.cam.yaw = camWrap(S.cam.yaw + dyaw);
  S.cam.pitch = Math.max(-80, Math.min(80, S.cam.pitch + dpitch));
}
function camPan(dx, dy, W, H){                // the picture follows the pointer (pixels of a W x H view)
  const s = lensF(W, H) / camDist(W, H);
  S.center = add(S.center, camRotInv([-dx / s, dy / s, 0]));
}
function camZoom(k){ const [a, b] = zoomSpan(); S.cam.zoom = Math.max(a, Math.min(b, S.cam.zoom * k)); }
// while dragging: only the camera's own sliders (the full syncUI runs when the drag ends)
function camSync(){
  for (const id of ["yaw", "pitch", "roll"]){ const v = Math.round(S.cam[id]); $(id).value = v;
    if (document.activeElement !== $(id + "V")) $(id + "V").value = v; }
}
// the camera as coordinates (cm): where it is (camPos). The panel's direction turns it where it
// stands and its position moves it as it faces: the point it looks at (S.center, what the view's
// drags orbit) goes along. CAM_T (the look point's own numbers) is no longer on the panel.
const CAM_P = ["camPX", "camPY", "camPZ"], CAM_T = [];
function camDist1(){ const [W, H] = exportSize(); return camDist(W, H) * S.cam.zoom; }   // at zoom 1
function camPos(){
  const p = deg(S.cam.pitch), y = deg(S.cam.yaw), D = camDist1() / S.cam.zoom;
  return add(S.center, mul([Math.cos(p) * Math.sin(y), Math.sin(p), Math.cos(p) * Math.cos(y)], D));
}
function setCamPos(pos){
  const d = sub(pos, S.center), L = len(d); if (L < 1) return false;
  const [a, b] = zoomSpan();
  S.cam.pitch = Math.max(-80, Math.min(80, Math.asin(d[1] / L) * 180 / Math.PI));
  if (Math.hypot(d[0], d[2]) > 1e-6) S.cam.yaw = Math.atan2(d[0], d[2]) * 180 / Math.PI;
  S.cam.zoom = Math.max(a, Math.min(b, camDist1() / L));
  return true;
}
function camCoords(){
  const show = (ids, v) => ids.forEach((id, k) => { const el = $(id); if (el && document.activeElement !== el) el.value = Math.round(v[k]); });
  show(CAM_P, camPos()); show(CAM_T, S.center);
}
function camLockUI(){
  const on = !!S.camLock;
  for (const id of ["lens", "yaw", "pitch", "roll"]) { $(id).disabled = on; $(id + "V").disabled = on; }
  for (const id of [...CAM_P, ...CAM_T, "camReset"]) $(id).disabled = on;
}
function zoomThumb(){
  const z = document.getElementById("zoomer"); if (!z) return;
  const [a, b] = zoomSpan(), k = 1 - Math.log(S.cam.zoom / a) / Math.log(b / a);
  z.firstElementChild.style.top = `calc(3px + (100% - 26px) * ${Math.max(0, Math.min(1, k)).toFixed(3)})`;
}
// flip the bone toward / away from the camera (double-click, double-tap)
function flipAt(x, y){
  if (mode !== "pose") return;
  const i = pick(front, x, y);
  if (i <= 0) return;
  remember();
  const par = PARENT[i], pc = toCam(S.P[par]), ic = toCam(S.P[i]);
  const flipped = [ic[0], ic[1], pc[2] - (ic[2] - pc[2])];
  rotateSubtree(i, add(camRotInv(flipped), S.center)); afterEdit(i); draw();
}
// the wheel, a trackpad, two fingers: one "step" each (in or out)
// a run of wheel notches (or pinch steps) on the camera is one undo step
let wheelMem = 0;
function wheelStep(x, y, step, e){
  if (WHEEL_HOOKS.some(h => h(x, y, step, e))){ draw(); return; }
  if (mode !== "body" && !S.camLock){ const t = performance.now(); if (t - wheelMem > 800) remember(); wheelMem = t; }
  // Ctrl+Alt+wheel: the lens (パース, as Blender's focal length); the wheel alone zooms the camera
  // (as Blender's view zoom). In body mode over a part, the wheel changes that part's thickness
  if (e && e.ctrlKey && e.altKey){ if (camHeld()) return; S.cam.lens = Math.max(14, Math.min(200, S.cam.lens * (step > 0 ? 1.1 : 1/1.1))); syncUI(); }
  else if (mode === "body" && pick(front, x, y) >= 0){ const i = pick(front, x, y);
    remember(); const k = step > 0 ? 1.08 : 1/1.08; for (const q of thickJoints(i, true)) S.R[q] *= k; }
  else { if (camHeld()) return; S.cam.zoom = Math.max(0.3, Math.min(4, S.cam.zoom * (step > 0 ? 1.1 : 1/1.1))); }
  draw();
}
// pointers on a canvas: one drags; a second finger turns it into a pinch (no drag)
const touches = new Map();
let pinch = null, tap = null;
for (const cv of [front, side]){
  cv.addEventListener("pointerdown", e => {
    lastPointer = e.pointerType || "mouse";
    // the on-screen keys appear after this touch (showing them now would move the view under the finger)
    if (e.pointerType === "touch" && !document.body.classList.contains("touch"))
      setTimeout(() => { document.body.classList.add("touch"); draw(); }, 0);
    if (e.button === 1) e.preventDefault();                              // the middle button: the camera, not autoscroll
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    if (e.pointerType === "touch"){
      // the first finger of a new touch: fingers whose lifting was never told (a system gesture, a
      // lost capture) are forgotten, else they made every later touch a pinch and the camera stuck
      if (e.isPrimary){ touches.clear(); pinch = null; }
      touches.set(e.pointerId, evPos(cv, e));
      if (touches.size === 2 && cv === front){                          // a pinch: forget the drag
        drag = null; tap = null;
        const [a, b] = [...touches.values()];
        // pose and body modes: the camera zooms and moves; the others keep their wheel (lens, objects)
        pinch = {d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, m: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2],
                 cam: mode === "pose" || mode === "body", held: mode !== "place" && camHeld()};
        if (pinch.cam && !pinch.held) remember();
        return;
      }
      if (touches.size > 2 || pinch) return;
    }
    tap = {cv, x: e.clientX, y: e.clientY, t: performance.now(), type: e.pointerType, mode, shift: evMods(e).shiftKey, ctrl: !!(e.ctrlKey || e.metaKey), at: evPos(cv, e)};
    down(cv, evMods(e));
  });
  cv.addEventListener("pointermove", e => {
    if (e.pointerType === "touch" && touches.has(e.pointerId)) touches.set(e.pointerId, evPos(cv, e));
    if (pinch && touches.size >= 2){
      const [a, b] = [...touches.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1;
      if (pinch.held) return;
      if (pinch.cam){ const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        camZoom(d / pinch.d); camPan(m[0] - pinch.m[0], m[1] - pinch.m[1], front.width, front.height);
        pinch.d = d; pinch.m = m; camSync(); drawSoon(); return; }
      const r = d / pinch.d;
      if (r > 1.12 || r < 1 / 1.12){ wheelStep((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, r > 1 ? 1 : -1, evMods(e)); pinch.d = d; }
      return;
    }
    if (tap && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) > 10) tap = null;
    move(cv, evMods(e));
  });
  const end = e => {
    touches.delete(e.pointerId);
    if (pinch){ if (touches.size === 0){ if (pinch.cam) syncUI(); pinch = null; } return; }
    up();
    // a click (no drag) on the front view: the mode follows what was clicked (pose_objects.js)
    if (e.type === "pointerup" && tap && tap.cv === front && tapClick) tapClick(tap);
    // a double tap (finger or pen) flips the bone, as a double-click does
    if (e.type === "pointerup" && tap && tap.cv === front && tap.type !== "mouse" && performance.now() - tap.t < 300){
      const now = {x: e.clientX, y: e.clientY, t: performance.now()};
      if (lastTap && now.t - lastTap.t < 400 && Math.hypot(now.x - lastTap.x, now.y - lastTap.y) < 30){
        const [x, y] = evPos(front, e); lastTap = null; flipAt(x, y);
      } else lastTap = now;
    }
    tap = null;
  };
  cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
  cv.addEventListener("lostpointercapture", e => { if (touches.has(e.pointerId) || drag) end(e); });
  cv.addEventListener("contextmenu", e => e.preventDefault());           // right button, pen button, long press
}
let lastTap = null;
front.addEventListener("dblclick", e => { if (lastPointer === "mouse"){ const [x, y] = evPos(front, e); flipAt(x, y); } });
// the wheel: a mouse notch is one step; small trackpad deltas add up first
let wheelAcc = 0;
front.addEventListener("wheel", e => {
  e.preventDefault();
  const dy = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaMode === 2 ? e.deltaY * 600 : e.deltaY;
  const [x, y] = evPos(front, e);
  if (Math.abs(dy) >= 40){ wheelAcc = 0; wheelStep(x, y, dy < 0 ? 1 : -1, evMods(e)); return; }
  wheelAcc += dy;
  if (Math.abs(wheelAcc) >= 40){ const step = wheelAcc < 0 ? 1 : -1; wheelAcc = 0; wheelStep(x, y, step, evMods(e)); }
}, {passive: false});
// Safari's trackpad pinch (gesture events) zooms the view, not the page
{ let g = 1;
  front.addEventListener("gesturestart", e => { e.preventDefault(); g = 1; });
  front.addEventListener("gesturechange", e => { e.preventDefault();
    const r = e.scale / g; if (r > 1.12 || r < 1 / 1.12){ g = e.scale;
      const [x, y] = evPos(front, e); wheelStep(x, y, r > 1 ? 1 : -1, evMods(e)); } });
}
// Ctrl+Z undoes; Ctrl+Y or Ctrl+Shift+Z redoes (⌘ on a Mac). Typing in a field, they undo the typing.
document.addEventListener("keydown", e => {
  if (!(e.ctrlKey || e.metaKey)) return;
  if (e.target && e.target.matches && e.target.matches("textarea, input:not([type=range]):not([type=checkbox]):not([type=color])")) return;
  const k = e.key.toLowerCase();
  if (k === "z" && !e.shiftKey){ e.preventDefault(); undo(); }
  else if (k === "y" || (k === "z" && e.shiftKey)){ e.preventDefault(); redo(); }
});
// the numeric keypad as in Blender: 1 front, 3 from the figure's right, 7 from above (Ctrl: the
// other side), 2 4 6 8 turn by 15° (Ctrl: move), 9 round to the back, + - zoom, . the selected
// joint to the middle; Home: the figure to the middle
document.addEventListener("keydown", e => {
  if (e.target && e.target.closest && e.target.closest("input, select, textarea")) return;
  const c = S.cam, ctl = e.ctrlKey || e.metaKey, W = front.width, H = front.height, step = H * 0.1;
  const act = {
    Numpad1: () => Object.assign(c, {yaw: ctl ? 180 : 0, pitch: 0, roll: 0}),
    Numpad3: () => Object.assign(c, {yaw: ctl ? 90 : -90, pitch: 0, roll: 0}),
    Numpad7: () => Object.assign(c, {yaw: 0, pitch: ctl ? -80 : 80, roll: 0}),
    Numpad9: () => { c.yaw = camWrap(c.yaw + 180); },
    Numpad4: () => ctl ? camPan(step, 0, W, H) : camOrbit(15, 0),
    Numpad6: () => ctl ? camPan(-step, 0, W, H) : camOrbit(-15, 0),
    Numpad8: () => ctl ? camPan(0, step, W, H) : camOrbit(0, 15),
    Numpad2: () => ctl ? camPan(0, -step, W, H) : camOrbit(0, -15),
    NumpadAdd: () => camZoom(1.15), NumpadSubtract: () => camZoom(1 / 1.15),
    NumpadDecimal: () => { if (sel >= 0) S.center = S.P[sel].slice(); },
    Home: () => { const p = S.P[IX.pelvis]; S.center = [p[0], p[1] - 5, p[2]]; c.zoom = 1; },
  }[e.code];
  if (!act) return;
  e.preventDefault(); if (camHeld()) return;
  remember(); act(); syncUI(); draw();
});

// ---- body mode sliders: whole-body scale, head, thickness (relative to the slider's last value,
// kept in S.scale so undo and each figure bring their sliders back)
function scaleAbout(k){
  const c = S.P[IX.pelvis]; S.P = S.P.map(p => add(c, mul(sub(p, c), k))); S.R = S.R.map(r => r * k);
}
// 全身の太さ (体格): the thigh root's circle's diameter in cm, the measure of every circle's thickness
const thickCm = raw => { const v = 2 * S.R[IX.r_hip]; return raw ? v : Math.round(v * 10) / 10; };
function scaleHead(k){
  const n = S.P[IX.neck], v = sub(S.P[IX.head], n);
  S.P[IX.head] = add(n, mul(v, k)); S.R[IX.head] *= k;
}

// ---- body by sex: bone lengths (cm, from the parent) and widths; the pose's directions kept
const SEX_BODY = {
  female: {height: 158, head: 10.8, waistR: 11, hipR: 7,
           len: {waist: 13, chest: 18, neck: 13, head: 11, r_shoulder: 17.5, r_elbow: 26, r_wrist: 22,
                 r_hip: 10.5, r_knee: 41, r_ankle: 39, r_toe: 13}},
  male:   {height: 171, head: 11.25, waistR: 13.5, hipR: 6,
           len: {waist: 14, chest: 20, neck: 14, head: 11.5, r_shoulder: 21, r_elbow: 29, r_wrist: 25,
                 r_hip: 9.5, r_knee: 45, r_ankle: 42, r_toe: 14.5}},
};
function setLengths(lengths){                 // keep every bone's direction, change its length
  const old = S.P.map(p => p.slice()), out = S.P.map(p => p.slice());
  for (const i of subtree(0).slice(1)){
    const p = PARENT[i], name = J[i].startsWith("l_") ? "r_" + J[i].slice(2) : J[i];
    const L = name in lengths ? lengths[name] : len(sub(old[i], old[p]));
    out[i] = add(out[p], mul(norm(sub(old[i], old[p])), L));
  }
  S.P = out;
}
function applySex(sex){
  const b = SEX_BODY[sex];
  S.sex = sex;
  fromBottom(() => {
    setLengths(b.len);
    S.R[IX.head] = b.head; S.R[IX.waist] = b.waistR; S.R[IX.r_hip] = S.R[IX.l_hip] = b.hipR;
    scaleAbout(b.height / standingHeight());
  });
}
// the standard body (no sex chosen) as a SEX_BODY entry, from REST
function sexBase(sex){
  if (SEX_BODY[sex]) return SEX_BODY[sex];
  const P0 = S.P, R0 = S.R; S.P = REST.map(p => p.slice()); S.R = REST_R.slice();
  const lenOf = n => len(sub(REST[IX[n]], REST[PARENT[IX[n]]]));
  const out = {height: standingHeight(), head: REST_R[IX.head], waistR: REST_R[IX.waist], hipR: REST_R[IX.r_hip],
    len: Object.fromEntries(Object.keys(SEX_BODY.female.len).map(n => [n, lenOf(n)]))};
  S.P = P0; S.R = R0;
  return out;
}
// 女性 / 男性 in 体格: the body changes by the two sexes' difference (each bone and width times their
// ratio, the height too), so what was adjusted (sizes, one side's length, thickness) stays
function switchSex(sex){
  const from = sexBase(S.sex), to = SEX_BODY[sex]; if (!to || S.sex === sex) return;
  S.sex = sex;
  fromBottom(() => {
    const h0 = standingHeight(), old = S.P.map(p => p.slice()), out = S.P.map(p => p.slice());
    for (const i of subtree(0).slice(1)){
      const p = PARENT[i], name = J[i].startsWith("l_") ? "r_" + J[i].slice(2) : J[i];
      const k = name in to.len && from.len[name] ? to.len[name] / from.len[name] : 1;
      out[i] = add(out[p], mul(sub(old[i], old[p]), k));
    }
    S.P = out;
    S.R[IX.head] *= to.head / from.head; S.R[IX.waist] *= to.waistR / from.waistR;
    S.R[IX.r_hip] *= to.hipR / from.hipR; S.R[IX.l_hip] *= to.hipR / from.hipR;
    scaleAbout(h0 * (to.height / from.height) / standingHeight());
  });
}
// The body's own frame: the whole figure's turn (S.body), so a bone's angles stay the same
// when the whole figure is turned. Bone angles are measured from the bone's rest direction:
// 前後 toward the figure's front, 左右 outward (for the middle of the body: toward its left).
function bodyRot(v, inv){
  const b = S.body, steps = [[[0, 0, 1], b.roll], [[1, 0, 0], b.pitch], [[0, 1, 0], b.yaw]];
  if (inv){ steps.reverse(); for (const st of steps) v = rotAxis(v, st[0], -deg(st[1])); return v; }
  for (const st of steps) v = rotAxis(v, st[0], deg(st[1]));
  return v;
}
// a bone's direction standing: REST's, or for the shoulders and the thigh roots the figure's own
// (S.shape, kept when its width, height or depth is changed), so 関節の限界 measures a shrug from
// where this figure's shoulders sit and does not pull widened shoulders back up
function restDir(i){
  const own = S.shape && S.shape[J[i]];
  return Array.isArray(own) && own.length === 3 ? norm(own) : norm(sub(REST[i], REST[PARENT[i]]));
}
function keepTorsoShape(){
  S.shape = S.shape || {};
  for (const n of Object.keys(TORSO_PAIR)){
    const i = IX[n], p = PARENT[i], pp = PARENT[p];
    let v = bodyRot(sub(S.P[i], S.P[p]), true);
    if (pp >= 0) v = rotBetween(v, bodyRot(sub(S.P[p], S.P[pp]), true), sub(REST[p], REST[pp]));
    S.shape[n] = norm(v).map(c => Math.round(c * 1e4) / 1e4);
  }
}
function restFrame(i){
  const e1 = restDir(i);
  const ref = Math.abs(e1[2]) < 0.9 ? [0, 0, 1] : [0, 1, 0];
  const ef = norm(sub(ref, mul(e1, dot(ref, e1))));
  let es = cross(e1, ef);
  if (J[i].startsWith("l_")) es = mul(es, -1);       // + = outward on both sides
  return [e1, ef, es];
}
function boneAngles(i){
  const v = norm(bodyRot(sub(S.P[i], S.P[PARENT[i]]), true));
  const [e1, ef, es] = restFrame(i), a = dot(v, e1), b = dot(v, ef), c = dot(v, es);
  return {fwd: Math.atan2(b, a) * 180 / Math.PI,
          side: Math.atan2(c, Math.hypot(a, b)) * 180 / Math.PI};
}
function setBoneAngles(i, fwd, side){
  const [e1, ef, es] = restFrame(i), L = len(sub(S.P[i], S.P[PARENT[i]]));
  const f = deg(fwd), sd = deg(side);
  const vb = add(mul(add(mul(e1, Math.cos(f)), mul(ef, Math.sin(f))), Math.cos(sd)), mul(es, Math.sin(sd)));
  rotateSubtree(i, add(S.P[PARENT[i]], mul(bodyRot(vb), L)));
}
function setTwist(i, v){
  v = clampTwist(i, v);
  const p = PARENT[i], axis = sub(S.P[i], S.P[p]), d = deg(v - (S.twist[i] || 0));
  for (const k of subtree(i)) S.P[k] = add(S.P[p], rotAxis(sub(S.P[k], S.P[p]), axis, d));
  S.twist[i] = v;
}
// ---- left-right symmetry: the other side takes a joint's pose, mirrored in the body's frame
// (so both sides then read the same 前後 / 左右 / ねじり); each side keeps its own bone lengths
function mirroredBone(k){
  const m = MIRROR[k], v = bodyRot(sub(S.P[k], S.P[PARENT[k]]), true);
  return mul(norm(bodyRot([-v[0], v[1], v[2]])), len(sub(S.P[m], S.P[PARENT[m]])));
}
// whole: the joint and everything after it; else this bone only (what hangs on it follows)
function symmetrize(i, whole){
  const m = MIRROR[i]; if (m === i) return [];
  const moved = subtree(m);
  if (whole){
    for (const k of subtree(i)){ const o = MIRROR[k];
      const d = add(S.P[PARENT[o]], mirroredBone(k)), shift = sub(d, S.P[o]);
      S.P[o] = d; for (const q of subtree(o).slice(1)) S.P[q] = add(S.P[q], shift);
      S.twist[o] = -(S.twist[k] || 0); }
    const side = J[i][0], other = J[m][0];
    if (subtree(i).some(k => /_wrist$/.test(J[k]))){ S.hands[other] = S.hands[side];
      S.fingers = S.fingers || {}; if (S.fingers[side]) S.fingers[other] = JSON.parse(JSON.stringify(S.fingers[side])); else delete S.fingers[other]; }
  } else if (HAND_J.has(i)){
    setTwist(twistJoint(m), -(S.twist[twistJoint(i)] || 0));
    rotateSubtree(m, add(S.P[PARENT[m]], mirroredBone(i)));
  } else {
    rotateSubtree(m, add(S.P[PARENT[m]], mirroredBone(i)));
    setTwist(m, -(S.twist[i] || 0));
  }
  // a pinned joint on the other side stays where the copy put it
  for (const k of moved) if (S.pins && S.pins[k]) S.pins[k] = S.P[k].slice();
  return moved;
}
function symmetrizeLimbs(from){
  remember();
  for (const n of ["shoulder", "hip"]) symmetrize(IX[`${from}_${n}`], true);
  afterEdit(); draw();
  say(from === "r" ? "右の手足を左へ写しました。" : "左の手足を右へ写しました。");
}
// the whole figure turned about a world axis (the 3軸ハンドル's rings on the hips): S.body takes the
// turn, as yaw / pitch / roll in bodyRot's order (M = Ry(yaw) Rx(pitch) Rz(roll)); the joints are turned by the caller
function turnBody(axis, ang){
  const f = v => rotAxis(bodyRot(v), axis, ang), ex = f([1, 0, 0]), ey = f([0, 1, 0]), ez = f([0, 0, 1]);
  const pitch = Math.asin(Math.max(-1, Math.min(1, -ez[1]))), r2d = 180 / Math.PI;
  let yaw, roll;
  if (Math.cos(pitch) < 1e-6){ yaw = Math.atan2(-ex[2], ex[0]); roll = 0; }      // straight up or down
  else { yaw = Math.atan2(ez[0], ez[2]); roll = Math.atan2(ex[1], ey[1]); }
  S.body = Object.assign({}, S.body, {yaw: yaw * r2d, pitch: pitch * r2d, roll: roll * r2d});
}
function setBodyTurn(key, v){
  const c = S.P[IX.pelvis], old = S.P.map(q => bodyRot(sub(q, c), true));
  S.body[key] = v;
  S.P = old.map(q => add(c, bodyRot(q)));
}
// [id, label, min, max, step, unit, kind: bone | any | root]
const JOINT_CTL = [
  ["jFwd", "前後（＋前へ）", -180, 180, 1, "°", "bone"],
  ["jSide", "左右（＋外へ、胴・首・頭は人物の左へ）", -90, 90, 1, "°", "bone"],
  ["jTwist", "ねじり（骨を軸に先を回す）", -180, 180, 1, "°", "bone"],
  ["jLen", "骨の長さ", 1, 120, 0.5, "cm", "bone"],
  ["jRad", "丸の大きさ（半径）", 0.5, 40, 0.5, "cm", "any"],
  ["pX", "位置：左右（＋人物の左）", -300, 300, 1, "cm", "root"],
  ["pY", "位置：上下", -100, 300, 1, "cm", "root"],
  ["pZ", "位置：前後（＋前）", -300, 300, 1, "cm", "root"],
  ["bYaw", "体の向き", -180, 180, 1, "°", "root"],
  ["bPitch", "体の前後の傾き（＋前へ）", -90, 90, 1, "°", "root"],
  ["bRoll", "体の左右の傾き", -90, 90, 1, "°", "root"],
];
// what the three angles mean at each joint (all joints turn about three axes: 前後, 左右, ねじり)
const AXIS_NAMES = {
  head: ["うなずく（＋下を向く）", "首をかしげる（＋人物の左へ）", "左右を向く（＋人物の左を向く）"],
  neck: ["首の前後（＋前へ）", "首の左右の傾き", "首のひねり（顔も回る）"],
  chest: ["胸の前屈・後屈（＋前へ）", "胸の横への傾き", "胸のひねり"],
  waist: ["腰の前屈・後屈（＋前へ）", "腰の横への傾き", "腰のひねり"],
  r_shoulder: ["肩を前へ・後ろへ", "肩をすくめる・下げる", "肩のひねり"],
  r_elbow: ["腕を前・上へ上げる（＋前へ）", "腕を横へ上げる（＋外へ）", "腕のひねり（内・外へ回す）"],
  r_wrist: ["肘の曲げ（前腕の前後）", "前腕の左右", "前腕のひねり（手のひらの向き）"],
  r_hip: ["股の位置（前後）", "股の位置（左右）", "骨盤のひねり"],
  r_knee: ["脚を前・後ろへ（＋前へ）", "脚を横へ開く（＋外へ）", "脚のひねり（つま先の向き）"],
  r_ankle: ["膝の曲げ（すねの前後）", "すねの左右", "すねのひねり"],
  r_toe: ["足首の上下（つま先）", "足首の左右", "足のひねり"],
  r_hand: ["手首の曲げ（＋前へ）", "手首の左右（＋外へ）", "手のひらの向き（前腕のひねり）"],
};
function axisNames(i){
  const n = J[i].startsWith("l_") ? "r_" + J[i].slice(2) : J[i];
  return AXIS_NAMES[n] || ["前後（＋前へ）", "左右（＋外へ）", "ねじり（骨を軸に先を回す）"];
}
// the hand's twist is the forearm's (the palm turns with the forearm): kept on the wrist joint
const twistJoint = i => HAND_J.has(i) ? IX[J[i][0] + "_wrist"] : i;
function jointValue(id){
  const i = sel;
  if (id === "jFwd") return boneAngles(i).fwd;
  if (id === "jSide") return boneAngles(i).side;
  if (id === "jTwist") return S.twist[twistJoint(i)] || 0;
  if (id === "jLen") return len(sub(S.P[i], S.P[PARENT[i]]));
  if (id === "jRad") return S.R[i];
  if (id === "pX") return S.P[IX.pelvis][0];
  if (id === "pY") return S.P[IX.pelvis][1];
  if (id === "pZ") return S.P[IX.pelvis][2];
  return S.body[{bYaw: "yaw", bPitch: "pitch", bRoll: "roll"}[id]];
}
function setJointValue(id, v){
  const i = sel, sym = $("sym").checked && MIRROR[i] !== i;
  const both = fn => { fn(i); if (sym) fn(MIRROR[i]); };
  if (id === "jFwd" || id === "jSide"){
    const a = boneAngles(i), fwd = id === "jFwd" ? v : a.fwd, side = id === "jSide" ? v : a.side;
    setBoneAngles(i, fwd, side);
  } else if (id === "jTwist") setTwist(twistJoint(i), v);
  else if (id === "jLen") both(j => { const d = sub(S.P[j], S.P[PARENT[j]]); moveSubtree(j, mul(norm(d), v - len(d))); });
  else if (id === "jRad") both(j => { S.R[j] = v; });
  else if (id[0] === "p"){ const k = {pX: 0, pY: 1, pZ: 2}[id], d = [0, 0, 0];
    d[k] = v - S.P[IX.pelvis][k]; S.P = S.P.map(q => add(q, d)); }
  else setBodyTurn({bYaw: "yaw", bPitch: "pitch", bRoll: "roll"}[id], v);
}
// ---- human joint limits (degrees) ---------------------------------------------------------------
// Ball joints: the bone's 前後 / 左右 in the body's frame (see boneAngles). Hinges (elbow, knee):
// the bend from the upper bone, one way only. Ankle: the angle between the shin and the foot.
const BALL = {
  waist: {fwd: [-30, 45], side: [-30, 30]},       // the lower back: bend forward / back, sideways
  chest: {fwd: [-25, 40], side: [-25, 25]},
  neck: {fwd: [-15, 25], side: [-15, 15]},
  head: {fwd: [-60, 70], side: [-45, 45]},
  r_shoulder: {fwd: [-20, 20], side: [-15, 30]},  // the shoulder girdle: shrug, forward / back
  r_elbow: {fwd: [-70, 180], side: [-40, 90]},    // the upper arm at the shoulder
  r_hip: {fwd: [-10, 10], side: [-10, 10]},       // the pelvis' own width: barely moves
  r_knee: {fwd: [-40, 125], side: [-30, 50]},     // the thigh at the hip
  r_hand: {fwd: [-85, 85], side: [-35, 40]},      // the wrist: bent toward the palm / the back, sideways
};
const HINGE = {r_wrist: {max: 150, way: 1, tol: 0.35}, r_ankle: {max: 150, way: -1, tol: 0.2}};   // elbow: not far backward; knee: not forward
const FOOT = {r_toe: [70, 140]};                   // angle between the shin and the foot
const TWIST = {r_elbow: 90, r_wrist: 80, r_knee: 45, r_ankle: 30, waist: 40, chest: 40, neck: 50, head: 80, r_hand: 20};
const limitsOn = () => $("limits").checked;
const sideName = n => n.startsWith("l_") ? "r_" + n.slice(2) : n;
const clampV = (v, [a, b]) => Math.max(a, Math.min(b, v));
function bodyFront(){ return bodyRot([0, 0, 1]); }
function enforceLimits(){
  if (!limitsOn()) return;
  for (const i of subtree(0).slice(1)){
    const name = sideName(J[i]), p = PARENT[i];
    if (BALL[name]){
      // measured from the parent bone (the chest leaning back does not count as the neck's
      // bend): the parent's swing from standing is taken out first
      const lim = BALL[name], pp = PARENT[p];
      let v = bodyRot(sub(S.P[i], S.P[p]), true);
      const L = len(v);
      let pc = null, pr = null;
      if (pp >= 0){ pc = bodyRot(sub(S.P[p], S.P[pp]), true); pr = sub(REST[p], REST[pp]); v = rotBetween(v, pc, pr); }
      const [e1, ef, es] = restFrame(i), d = norm(v);
      const a = dot(d, e1), b = dot(d, ef), c = dot(d, es);
      const fwd = Math.atan2(b, a) * 180 / Math.PI, side = Math.atan2(c, Math.hypot(a, b)) * 180 / Math.PI;
      const f = clampV(fwd, lim.fwd), sd = clampV(side, lim.side);
      if (Math.abs(f - fwd) > 1e-6 || Math.abs(sd - side) > 1e-6){
        const fr = deg(f), sr = deg(sd);
        let vb = add(mul(add(mul(e1, Math.cos(fr)), mul(ef, Math.sin(fr))), Math.cos(sr)), mul(es, Math.sin(sr)));
        if (pp >= 0) vb = rotBetween(vb, pr, pc);
        rotateSubtree(i, add(S.P[p], mul(bodyRot(norm(vb)), L)));
      }
    } else if (HINGE[name]){
      // the bend is at most `max` degrees, and not the wrong way: an elbow does not fold
      // backward, a knee not forward. Sideways is allowed (the upper bone's own twist, which
      // the figure does not track, decides that: a hand on the hip bends the elbow inward).
      const g = PARENT[p], up = norm(sub(S.P[p], S.P[g])), v = sub(S.P[i], S.P[p]), L = len(v);
      // the upper bone's own front: the body's front, turned the way the upper bone turned
      // from standing (a thigh raised forward has its front facing up)
      const upRest = bodyRot(norm(sub(REST[p], REST[g])));
      let front = rotBetween(bodyFront(), upRest, up);
      front = sub(front, mul(up, dot(front, up)));
      if (len(front) < 1e-3) front = sub(bodyRot([0, 1, 0]), mul(up, dot(bodyRot([0, 1, 0]), up)));
      front = mul(norm(front), HINGE[name].way);
      const d = norm(v), along = dot(d, up);
      let w = sub(d, mul(up, along));
      const wl = len(w);
      let bend = Math.atan2(wl, along) * 180 / Math.PI;
      let dir = wl > 1e-6 ? mul(w, 1 / wl) : front;
      const tol = HINGE[name].tol;
      if (dot(dir, front) < -tol && bend > 5){
        // turn the bend's direction back to the edge of what is allowed
        const side = norm(sub(dir, mul(front, dot(dir, front))));
        const c = -tol, sn = Math.sqrt(1 - c * c);
        dir = len(side) > 1e-6 ? add(mul(front, c), mul(side, sn)) : front;
      }
      bend = Math.max(0, Math.min(HINGE[name].max, bend));
      const nd = add(mul(up, Math.cos(deg(bend))), mul(dir, Math.sin(deg(bend))));
      if (len(sub(nd, d)) > 1e-4) rotateSubtree(i, add(S.P[p], mul(nd, L)));
    } else if (FOOT[name]){
      const shin = norm(sub(S.P[p], S.P[PARENT[p]])), v = sub(S.P[i], S.P[p]), L = len(v), d = norm(v);
      const ang = Math.acos(Math.max(-1, Math.min(1, dot(mul(shin, -1), d)))) * 180 / Math.PI;
      const want = clampV(ang, FOOT[name]);
      if (Math.abs(want - ang) > 1e-3){
        let axis = cross(mul(shin, -1), d); if (len(axis) < 1e-6) axis = cross(shin, bodyFront());
        const nd = rotAxis(mul(shin, -1), axis, deg(want));
        rotateSubtree(i, add(S.P[p], mul(norm(nd), L)));
      }
    }
  }
}
// pins: a pinned wrist / ankle stays where it was pinned (two-bone IK from the shoulder / hip);
// a pinned elbow / knee keeps the upper bone's end; the pinned pelvis does not move
function solveIK(i, target){
  const mid = PARENT[i], root = PARENT[mid];
  const r = S.P[root], m = S.P[mid], e = S.P[i];
  const L1 = len(sub(m, r)), L2 = len(sub(e, m));
  let c = len(sub(target, r));
  c = Math.max(Math.abs(L1 - L2) + 1e-3, Math.min(L1 + L2 - 1e-3, c));
  const dT = norm(sub(target, r));
  let pole = sub(sub(m, r), mul(dT, dot(sub(m, r), dT)));
  if (len(pole) < 0.15 * L1){
    pole = mul(bodyFront(), J[i].endsWith("ankle") ? 1 : -1);
    pole = sub(pole, mul(dT, dot(pole, dT)));
    if (len(pole) < 1e-6) pole = cross(dT, [0, 0, 1]);
  }
  const pn = norm(pole);
  const cosA = Math.max(-1, Math.min(1, (L1*L1 + c*c - L2*L2) / (2 * L1 * c)));
  rotateSubtree(mid, add(r, add(mul(dT, L1 * cosA), mul(pn, L1 * Math.sqrt(1 - cosA*cosA)))));
  rotateSubtree(i, add(r, mul(dT, c)));
}
const PINNABLE = new Set(["pelvis", "r_wrist", "l_wrist", "r_ankle", "l_ankle", "r_elbow", "l_elbow", "r_knee", "l_knee"]);
function holdPins(except){
  for (const [k, pos] of Object.entries(S.pins || {})){
    const i = +k; if (i === except) continue;
    if (len(sub(S.P[i], pos)) < 1e-3) continue;
    if (i === IX.pelvis){ const d = sub(pos, S.P[i]); S.P = S.P.map(q => add(q, d)); continue; }
    if (IK_END[J[i]]) solveIK(i, pos);
    else rotateSubtree(i, add(S.P[PARENT[i]], mul(norm(sub(pos, S.P[PARENT[i]])), len(sub(S.P[i], S.P[PARENT[i]])))));
  }
}
// a joint of an arm or leg -> the first joint of that limb (shoulder / hip)
function limbRoot(i){ while (PARENT[i] >= 0 && MIRROR[PARENT[i]] !== PARENT[i]) i = PARENT[i]; return i; }
function afterEdit(moved){
  enforceLimits();
  // 左右同時に動かす: the other arm or leg follows (pose mode; the body mode has its own 左右対称)
  const sp = document.getElementById("symPose");
  if (sp && sp.checked && mode === "pose" && moved >= 0 && MIRROR[moved] !== moved) symmetrize(limbRoot(moved), true);
  if (typeof sceneAfterEdit === "function") sceneAfterEdit(moved);
  holdPins(moved);
  if (moved !== undefined && S.pins && S.pins[moved]) S.pins[moved] = S.P[moved].slice();
}
function togglePin(i){
  if (!PINNABLE.has(J[i])) { say("固定できるのは腰・肘・手首・膝・足首です。", true); return; }
  S.pins = S.pins || {};
  // 左右同時に動かす moves the other limb after a pin is held, so the two are not on together
  if (!S.pins[i] && $("symPose").checked){ say("「左右同時に動かす」がオンの間は固定できません。", true); return; }
  if (S.pins[i]) delete S.pins[i]; else S.pins[i] = S.P[i].slice();
  say(S.pins[i] ? `${J_JA[J[i]]}を固定しました。` : `${J_JA[J[i]]}の固定を外しました。`);
}
// dragging an elbow / knee whose hand / foot is pinned: the joint slides on the circle where
// both bones still reach (the hand / foot stays)
function dragMidPinned(i, x, y, W, H){
  const end = KIDS[i].find(k => S.pins && S.pins[k]), root = PARENT[i];
  const r = S.P[root], e = S.pins[end], L1 = len(sub(S.P[i], r)), L2 = len(sub(S.P[end], S.P[i]));
  const d = len(sub(e, r)); if (d < 1e-3 || d > L1 + L2) return false;
  const u = norm(sub(e, r)), a = (L1*L1 - L2*L2 + d*d) / (2*d), h = Math.sqrt(Math.max(0, L1*L1 - a*a));
  const c = add(r, mul(u, a));
  const f = lensF(W, H), D = camDist(W, H), mc = toCam(S.P[i]);
  const dir = pixDir(x, y, W, H), t = (mc[2] - D) / dir[2];
  const T = add(camRotInv(add([0, 0, D], mul(dir, t))), S.center);
  let v = sub(T, c); v = sub(v, mul(u, dot(v, u)));
  if (len(v) < 1e-6) return false;
  rotateSubtree(i, add(c, mul(norm(v), h)));
  rotateSubtree(end, e);
  return true;
}

function clampTwist(i, v){
  const t = TWIST[sideName(J[i])];
  return limitsOn() && t ? Math.max(-t, Math.min(t, v)) : v;
}

function buildJointPanel(){
  $("jointCtl").innerHTML = JOINT_CTL.map(([id, label, mn, mx, st, unit, kind]) => `
    <div data-kind="${kind}" id="${id}Row"><label>${label}</label>
      <div class="row"><input type="range" id="${id}" min="${mn}" max="${mx}" step="${st}">
        <input type="number" class="num" id="${id}N" step="${st}"><span class="unit">${unit}</span></div></div>`).join("");
  for (const [id] of JOINT_CTL){
    const r = $(id), n = $(id + "N");
    r.addEventListener("pointerdown", remember);
    r.addEventListener("input", () => { if (sel < 0) return; setJointValue(id, +r.value); afterEdit(sel); draw(); });
    n.addEventListener("change", () => { const v = +n.value; if (sel < 0 || !isFinite(v)) return;
      remember(); setJointValue(id, v); afterEdit(sel); draw(); });
  }
}
function showSelected(){
  const ok = sel >= 0, root = sel === IX.pelvis;
  $("selName").textContent = ok ? J_JA[J[sel]] : "（丸をクリック）";
  // the three axes named for this joint
  if (ok && !root){ const nm = axisNames(sel);
    [["jFwd", 0], ["jSide", 1], ["jTwist", 2]].forEach(([id, k]) => { $(id + "Row").querySelector("label").textContent = nm[k]; }); }
  // pin and hand shape
  $("pinRow").style.display = ok && PINNABLE.has(J[sel]) ? "" : "none";
  $("pin").checked = !!(ok && S.pins && S.pins[sel]);
  $("symRow").style.display = ok && MIRROR[sel] !== sel ? "" : "none";
  const arm = ok && /_(hand|wrist)$/.test(J[sel]) ? J[sel][0] : null;     // the hand's shape: on the hand joint or the wrist
  $("handRow").style.display = arm ? "" : "none";
  if (arm){ $("handRow").querySelector("label").textContent = (arm === "r" ? "右手" : "左手") + "の形";
    if (document.activeElement !== $("handSel")) $("handSel").value = S.hands[arm]; }
  const np = Object.keys(S.pins || {}).length;
  $("pinInfo").textContent = np ? `固定中の関節：${Object.keys(S.pins).map(k => J_JA[J[+k]]).join("・")}` : "";
  // either 左右同時に動かす or pins: the one that is off cannot be switched on (what is on can be switched off)
  const symOn = $("symPose").checked;
  $("symPose").disabled = !symOn && np > 0;
  $("pin").disabled = symOn && !$("pin").checked;
  $("symPinNote").style.display = $("symPose").disabled || $("pin").disabled ? "" : "none";
  $("symPinNote").textContent = symOn ? "「左右同時に動かす」がオンの間は関節を固定できません。"
    : np ? "関節を固定している間は「左右同時に動かす」を使えません（固定をすべて外すと使えます）。" : "";
  for (const [id, , mn, mx, , , kind] of JOINT_CTL){
    // the wrist joint shows the elbow's bend and the forearm; its twist is the hand joint's
    const show = ok && (kind === "any" || (kind === "root") === root) && !(id === "jTwist" && /_wrist$/.test(J[sel]));
    $(id + "Row").style.display = show ? "" : "none";
    if (!show) continue;
    const v = jointValue(id), r = $(id), n = $(id + "N");
    if (rangeHeld !== r) r.value = v;
    if (document.activeElement !== n) n.value = Math.round(v * 10) / 10;
  }
}

// ---- presets: bends of the standing figure ----------------------------------------------------
// [joint, axis, degrees]: the joint's own bone and everything after it turn about its parent.
const PRESETS = {
  "立ち（標準）": [],
  "Aポーズ": [["r_elbow","z",-35],["l_elbow","z",35]],
  "Tポーズ": [["r_elbow","z",-90],["l_elbow","z",90]],
  "コントラポスト": [["l_knee","x",-12],["l_ankle","x",22],["r_elbow","z",-8],["l_elbow","x",-15],["l_wrist","x",-60],["chest","z",-4]],
  "歩く": [["r_knee","x",-25],["r_ankle","x",15],["l_knee","x",20],["l_ankle","x",25],["r_elbow","x",20],["l_elbow","x",-22],["l_wrist","x",-30]],
  "走る": [["r_knee","x",-55],["r_ankle","x",70],["l_knee","x",35],["l_ankle","x",60],["r_elbow","x",45],["r_wrist","x",-90],["l_elbow","x",-50],["l_wrist","x",-80],["chest","x",-10]],
  "椅子に座る": [["r_knee","x",-90],["r_ankle","x",90],["l_knee","x",-90],["l_ankle","x",90],["r_wrist","x",-60],["l_wrist","x",-60]],
  "しゃがむ": [["r_knee","x",-120],["r_ankle","x",145],["l_knee","x",-120],["l_ankle","x",145],["chest","x",-25],["r_wrist","x",-70],["l_wrist","x",-70]],
  "ジャンプ（バンザイ）": [["r_elbow","z",-160],["l_elbow","z",160],["r_knee","x",-30],["r_ankle","x",55],["l_knee","x",-30],["l_ankle","x",55]],
  "ファイティングポーズ": [["r_knee","z",-12],["l_knee","z",12],["l_knee","x",-15],["r_elbow","x",-45],["r_wrist","x",-110],["l_elbow","x",-60],["l_wrist","x",-115]],
  "腰に手": [["r_elbow","z",-35],["r_wrist","z",95],["l_elbow","z",35],["l_wrist","z",-95]],
  "ロープにつかまる（ターザン）": [["r_elbow","z",-172],["l_elbow","z",165],["l_wrist","z",-12],["r_knee","x",-35],["r_ankle","x",50],["l_knee","x",-10],["l_ankle","x",25]],
};
const AXES = {x: [1,0,0], y: [0,1,0], z: [0,0,1]};
function applyPreset(name){
  S.P = REST.map(p => p.slice()); S.body = {yaw: 0, pitch: 0, roll: 0}; delete S.stand; S.twist = REST.map(() => 0); delete S.shape;
  for (const [joint, ax, d] of PRESETS[name]){
    const i = IX[joint], par = PARENT[i], p = S.P[par];
    for (const k of subtree(i)) S.P[k] = add(p, rotAxis(sub(S.P[k], p), AXES[ax], deg(d)));
  }
  // stand on the ground: the lowest point back at the floor
  const low = Math.min(...S.P.map(p => p[1]));
  if (low > 0) S.P = S.P.map(p => [p[0], p[1] - low + 2, p[2]]);
}

// ---- UI wiring ---------------------------------------------------------------------------
const $ = id => document.getElementById(id);
// settings this browser kept under the old name (before ODM Poser): carried over once
try { for (const k of ["theme", "lang", "editor-v1", "editor-v1-limits"]){
  const o = localStorage.getItem("symbolic-pose-" + k);
  if (o !== null && localStorage.getItem("odm-poser-" + k) === null) localStorage.setItem("odm-poser-" + k, o);
} } catch (e) {}
// the hints under the views: open where there is room (two columns, a tall window)
// the keys a keyboard would give (touch screens: on the view under the modes), on until pressed again
for (const [id, key] of [["vShift", "shift"], ["vAlt", "alt"]])
  $(id).addEventListener("click", () => { VMOD[key] = !VMOD[key]; $(id).setAttribute("aria-pressed", String(VMOD[key])); $(id).classList.toggle("on", VMOD[key]); });
if (navigator.maxTouchPoints > 0 || "ontouchstart" in window || matchMedia("(any-pointer: coarse)").matches)
  document.body.classList.add("touch");
const UNITS = {scaleThick: 1, lens: 1, yaw: 1, pitch: 1, roll: 1};
const TC = [];                        // user presets: from files (the button below) or from a mod
$("preset").innerHTML = Object.keys(PRESETS).map(n => `<option>${n}</option>`).join("");
// user presets: possibly thousands, so a group, a search and a list
const esc = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
function setUserPresets(list){
  TC.splice(0, TC.length, ...list);
  $("tcCount").textContent = TC.length;
  const groups = [...new Set(TC.map(t => t.group))].sort();
  $("tcGroup").innerHTML = `<option value="">すべての分類</option>` + groups.map(g =>
    `<option value="${esc(g)}">${esc(g)}（${TC.filter(t => t.group === g).length}）</option>`).join("");
  tcFilter();
}
// Search in Japanese or English: preset names may mix languages and spellings
// sitting ...), so each word of the query is looked up in a small two-language word list and
// matches any of the forms (ひらがな = カタカナ, 全角 = 半角, 大文字 = 小文字 are folded too).
const WORDS = [
  ["座る 座り すわる suwari sit sitting seat seated", "座"], ["立つ 立ち たつ tachi stand standing", "立"],
  ["寝る 寝ころび 寝転び 寝そべる ねる sleep sleeping lie lying laying reclining", "寝"],
  ["走る 走り はしる run running dash ダッシュ", "走"], ["歩く 歩き walk walking", "歩"],
  ["ジャンプ 跳ぶ jump jumping leap", "跳"], ["構え かまえ kamae stance ready standby スタンバイ guard", "構"],
  ["抜刀 ばっとう battou battō draw iai 居合", "抜"], ["袈裟斬り けさぎり kesa kesagiri diagonal slash", "袈裟"],
  ["逆袈裟斬り 逆袈裟 gyakukesa gyakukes reverse upward diagonal slash", "逆袈裟"],
  ["突き つき tsuki thrust stab lunge", "突"], ["横薙ぎ 横なぎ yokonagi horizontal sweep slash", "横薙"],
  ["斬り上げ 切り上げ kiriage upward upslash", "上げ"], ["斬り下ろし 切り下ろし kiriorosh downward downslash", "下ろし"],
  ["日本刀 刀 かたな katana", "刀"], ["剣 けん ソード ロングソード sword longsword", "剣"],
  ["銃 じゅう ガン ハンドガン ピストル gun handgun pistol firearm shooting shoot", "銃"],
  ["膝射 ニーリング ニーリングポジション kneeling kneel knee knees", "膝"],
  ["伏射 プローン プローンポジション prone lying-prone", "伏"],
  ["キック 蹴り 蹴る kick kicking", "蹴"], ["パンチ 殴る 拳 punch fist fists boxing", "パンチ"],
  ["手 ハンド hand hands gesture hyoujou", "手"], ["顔 表情 ひょうじょう face expression facial hyoujou", "顔"],
  ["スーツ すーつ suit suits business", "スーツ"], ["アクション action", "アクション"],
  ["戦う バトル 戦闘 battle fight fighting combat", "戦"], ["女性 女 女の子 少女 female woman girl", "女"],
  ["男性 男 男の子 少年 male man boy", "男"], ["正面 front frontal", "正面"], ["背面 後ろ 背中 back rear behind", "背面"],
  ["右 みぎ right", "右"], ["左 ひだり left", "左"], ["奥 深い far back deep", "奥"],
  ["アオリ あおり 煽り 見上げ low-angle lowangle below worm", "アオリ"],
  ["フカン 俯瞰 ふかん high-angle highangle above bird", "フカン"],
  ["クローズアップ アップ close closeup close-up", "アップ"], ["水平 eyelevel level", "水平"],
  ["かわいい 可愛い カワイイ kawaii cute pretty", "かわいい"], ["かっこいい カッコイイ kakkoii cool", "かっこいい"],
  ["セクシー sexy", "セクシー"], ["マッチョ macho muscle muscular", "マッチョ"], ["ヒーロー hero", "ヒーロー"],
  ["コミカル comical funny", "コミカル"], ["クール petitcool cool", "クール"], ["悪役 ヴィラン villain", "悪役"],
  ["椅子 いす イス chair", "椅子"], ["ソファ ソファー couch sofa", "ソファ"], ["音楽 楽器 music instrument", "音楽"],
  ["スポーツ sports sport", "スポーツ"], ["振り返る 振り向き turn turning looking-back", "振り"],
  ["日常 life everyday daily", "日常"], ["魔法 magic", "魔法"], ["忍者 ninja", "忍者"], ["侍 samurai", "侍"],
  ["片手 onehand one-hand single-hand", "片手"], ["両手 twohand two-hand both-hands", "両手"],
  ["溜め ため charge tame windup", "溜"], ["インパクト impact hit", "インパクト"], ["武器 weapon weapons", "武器"],
  ["盾 たて shield", "盾"], ["杖 つえ staff", "杖"], ["弓 ゆみ bow archery", "弓"], ["槍 やり spear lance", "槍"],
  ["グリップ grip", "グリップ"], ["クランプ clamp", "クランプ"], ["体勢 姿勢 pose posture", "ポーズ"],
  ["ポーズ pose poses", "ポーズ"], ["アニメ anime", "アニメ"], ["衣装 ファッション fashion clothing clothes", "ファッション"],
  ["背負う バックパック backpack", "背負"], ["ダンス 踊る dance dancing", "踊"], ["飛ぶ 落ちる fly flying fall falling", "飛"],
  ["チビ ちび chibi deformed", "チビ"], ["小道具 props prop", "小道具"], ["武術 martial", "武術"],
];
const foldText = t => t.normalize("NFKC").toLowerCase().replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const WORD_FORMS = WORDS.map(([forms]) => forms.split(/\s+/).map(foldText));
const STOP = new Set(["angle", "view", "shot", "up", "of", "the", "and", "a", "in"]);   // not searched for
function alternatives(token){
  const cjk = /[^\u0000-\u007f]/.test(token);
  const exact = WORD_FORMS.filter(forms => forms.includes(token));
  // an exact word wins ("stand" is not "standby"); otherwise a prefix either way
  // ("sit" -> sitting, "sitting" -> sit; "female" must not pull in "male")
  const pool = exact.length ? exact : WORD_FORMS.filter(forms => (token.length >= 2 || cjk) &&
    forms.some(f => f.startsWith(token) || (f.length >= 3 && token.startsWith(f))));
  const alts = new Set([token]);
  pool.forEach(forms => forms.forEach(f => alts.add(f)));
  return [...alts];
}
function tcFilter(){
  const g = $("tcGroup").value, q = foldText($("tcSearch").value.trim());
  const tokens = q ? q.split(/\s+/).filter(w => w && !STOP.has(w)).map(alternatives) : [];
  const hits = [];
  TC.forEach((t, i) => {
    if (g && t.group !== g) return;
    if (tokens.length){
      const hay = t.hay || (t.hay = foldText(t.group + " " + t.name));
      if (!tokens.every(alts => alts.some(a => hay.includes(a)))) return;
    }
    hits.push(i);
  });
  $("tcList").innerHTML = hits.slice(0, 500).map(i => `<option value="${i}">${esc(t2label(TC[i]))}</option>`).join("")
    + (hits.length > 500 ? `<option disabled>…ほか ${hits.length - 500} 件（絞り込んでください）</option>` : "");
}
const t2label = t => $("tcGroup").value ? t.name : `${t.group}｜${t.name}`;
function tcApply(i){
  if (!(i >= 0)) return;
  remember(); applyUserPreset(TC[i]); draw(); say(`読み込みました：${TC[i].name}`);
}
$("tcGroup").addEventListener("change", tcFilter);
$("tcSearch").addEventListener("input", tcFilter);
$("tcApply").addEventListener("click", () => tcApply(+$("tcList").value));
$("tcList").addEventListener("dblclick", () => tcApply(+$("tcList").value));
$("tcRandom").addEventListener("click", () => {
  const opts = [...$("tcList").options].filter(o => !o.disabled);
  if (!opts.length) return;
  const o = opts[Math.floor(Math.random() * opts.length)]; $("tcList").value = o.value; tcApply(+o.value);
});
setUserPresets(TC);
// the user picks their preset files (a mod can add presets too)
$("tcLoadFile").addEventListener("click", () => $("tcFile").click());
$("tcFile").addEventListener("change", async e => {
  const files = [...e.target.files];
  e.target.value = "";
  const list = [];
  for (const f of files){
    let items;
    try { const data = JSON.parse(await f.text()); items = data && data.presets ? data.presets : data; }
    catch (err) { say(`読めないファイル：${f.name}`, true); return; }
    for (const p of Array.isArray(items) ? items : [])
      if (p && Array.isArray(p.P)) list.push({group: String(p.group || f.name.replace(/\.json$/i, "")), name: String(p.name || ""), P: p.P});
  }
  setUserPresets(list); say(`ユーザープリセットを ${list.length} 件読み込みました。`);
});
// a pose read from a picture: only its bones' directions; the body (lengths, sizes) stays
function applyUserPreset(t){
  const q = {P: t.P.map(p => p.slice())}; upgradeState(q);
  const cur = S.P.map(p => p.slice()), out = S.P.map(p => p.slice()), Q = q.P;
  for (const i of subtree(0).slice(1)){
    const p = PARENT[i], L = len(sub(cur[i], cur[p]));
    out[i] = add(out[p], mul(norm(sub(Q[i], Q[p])), L));
  }
  S.P = out; S.body = {yaw: 0, pitch: 0, roll: 0}; delete S.stand; S.twist = REST.map(() => 0); S.pins = {};
  if (typeof sceneAfterEdit === "function") sceneAfterEdit();
}
function syncUI(){
  upgradeState(S);
  $("hiddenDashed").checked = !!S.hiddenDashed;
  $("torso3d").checked = S.torso3d !== false;
  for (const [id, v] of [["lens", Math.round(S.cam.lens)], ["yaw", Math.round(S.cam.yaw)],
      ["pitch", Math.round(S.cam.pitch)], ["roll", Math.round(S.cam.roll)]]){
    $(id).value = v; if (document.activeElement !== $(id + "V")) $(id + "V").value = v;
  }
  const sc = Object.assign(fresh().scale, S.scale);
  // 全身の太さ in cm: the thigh root's diameter (全体サイズ and 頭 are 身長 and 頭の大きさ in cm, pose_size.js)
  { const r = $("scaleThick"), v = thickCm(); r.min = Math.min(+r.min, Math.floor(v)); r.max = Math.max(+r.max, Math.ceil(v));
    if (rangeHeld !== r) r.value = v; if (document.activeElement !== $("scaleThickV")) $("scaleThickV").value = v; }
}
// any slider in the side panel: one undo step per drag or key press (the camera's, the ruler's,
// a mod's ...); remember() skips a step that changed nothing
document.addEventListener("pointerdown", e => { if (e.target.matches && e.target.matches("aside input[type=range]")) remember(); }, true);
// the slider under a finger or the mouse is not set back while it moves (draw() refreshes the panel)
document.addEventListener("pointerdown", e => { if (e.target.matches && e.target.matches("input[type=range]")) rangeHeld = e.target; }, true);
for (const t of ["pointerup", "pointercancel"]) document.addEventListener(t, () => { rangeHeld = null; }, true);
document.addEventListener("keydown", e => { if (e.target.matches && e.target.matches("aside input[type=range]")
  && /^(Arrow|Page|Home|End)/.test(e.key)) remember(); }, true);
document.querySelectorAll("#modes button").forEach(b => b.addEventListener("click", () => {
  mode = b.dataset.mode;
  document.body.className = document.body.className.replace(/\bmode-\S+/, "").trim() + " mode-" + mode;   // keep touch, split ...
  document.querySelectorAll("#modes button").forEach(x => x.classList.toggle("on", x === b)); draw();
}));
// a preset pose on this figure's own body: the preset's bone directions with this figure's
// lengths, thicknesses and shoulders (体格 is kept; 体格プリセット are apart, pose_sets.js)
function posePreset(name){
  const old = S.P.map(p => p.slice()), c = old[IX.pelvis], shape = S.shape;
  applyPreset(name); S.shape = shape; S.P = withBoneLengths(S.P, old);
  // the shoulders and the thigh roots where this figure's own sit (S.shape)
  for (const n of Object.keys(TORSO_PAIR)){ const i = IX[n], p = PARENT[i];
    moveSubtree(i, sub(add(S.P[p], mul(restDir(i), len(sub(old[i], old[p])))), S.P[i])); }
  withNeck(() => {});
  standOnFloor(c[0], c[2]); S.pins = {};
}
$("applyPreset").addEventListener("click", () => {
  const v = $("preset").value;
  remember(); posePreset(v);
  afterEdit(); syncUI(); draw(); say(`ポーズ「${v}」にしました（体格はそのまま）。`);
});
$("mirror").addEventListener("click", () => {
  remember();
  const P = S.P.map(p => [-p[0], p[1], p[2]]);
  S.P = J.map((_, i) => P[MIRROR[i]]); S.R = J.map((_, i) => S.R[MIRROR[i]]);
  S.hands = {r: S.hands.l, l: S.hands.r};
  { const f = S.fingers || {}; S.fingers = {}; if (f.l) S.fingers.r = f.l; if (f.r) S.fingers.l = f.r; }
  S.pins = Object.fromEntries(Object.entries(S.pins || {}).map(([k, q]) => [MIRROR[+k], [-q[0], q[1], q[2]]]));
  S.body = {yaw: -S.body.yaw, pitch: S.body.pitch, roll: -S.body.roll};
  S.twist = J.map((_, i) => -(S.twist[MIRROR[i]] || 0));
  (S.items || []).forEach(it => { if (it.hand) it.hand = it.hand === "r" ? "l" : "r";
    if (it.base) it.base = [-it.base[0], it.base[1], it.base[2]]; if (it.yaw) it.yaw = -it.yaw; });
  if (S.wire && S.wire.anchor) S.wire.anchor = [-S.wire.anchor[0], S.wire.anchor[1], S.wire.anchor[2]];
  (S.solids || []).forEach(o => { o.pos = [-o.pos[0], o.pos[1], o.pos[2]]; o.yaw = -(o.yaw || 0); });
  syncUI(); draw();
});
$("undo").addEventListener("click", undo);
$("redo").addEventListener("click", redo);

// ---- back to the defaults, and the figure moved / turned as a whole --------------------------------
// the joints laid out along dirsFrom's bones with lengthsFrom's lengths (J: a parent comes before its child)
function withBoneLengths(dirsFrom, lengthsFrom){
  const out = [dirsFrom[0].slice()];
  for (let i = 1; i < J.length; i++){ const p = PARENT[i];
    out[i] = add(out[p], mul(norm(sub(dirsFrom[i], dirsFrom[p])), len(sub(lengthsFrom[i], lengthsFrom[p])))); }
  return out;
}
const floorY = () => (S.env && S.env.floor ? +S.env.floorY || 0 : 0);
function standOnFloor(x, z){                  // the pelvis over (x, z), the lowest point on the floor
  const P = S.P, low = Math.min(...P.map(p => p[1])), c = P[IX.pelvis];
  S.P = P.map(p => [p[0] - c[0] + x, p[1] - low + floorY() + 2, p[2] - c[2] + z]);
}
$("poseReset").addEventListener("click", () => {
  remember(); posePreset("立ち（標準）");
  afterEdit(); syncUI(); draw(); say("立ちポーズに戻しました（体格はそのまま）。");
});
$("bodyReset").addEventListener("click", () => {
  remember();
  fromBottom(() => { S.P = withBoneLengths(S.P, REST); S.R = REST_R.slice(); S.scale = fresh().scale; S.fingerLen = fresh().fingerLen; delete S.handApart; delete S.shape; delete S.sex; });
  afterEdit(); syncUI(); draw(); say("体格を初期値に戻しました（ポーズはそのまま）。");
});
// the figure being edited, all of it (pose, body, hands, turn, pins) back to the default of its sex
// (女性 / 男性 as last chosen; else the standard body); where it stands and what it holds stay
function resetToSex(){
  remember();
  const c = S.P[IX.pelvis].slice(), sex = S.sex, f = fresh();
  for (const k of ["P", "R", "hands", "fingers", "fingerLen", "handApart", "head", "body", "twist", "pins", "scale"]) S[k] = f[k];
  delete S.shape; delete S.sex; delete S.stand;
  if (SEX_BODY[sex]) applySex(sex);
  standOnFloor(c[0], c[2]);
  afterEdit(); syncUI(); draw();
  say(`${S.figName || "この人物"}を${sex === "female" ? "女性" : sex === "male" ? "男性" : "標準"}の初期状態に戻しました（位置と持ち物はそのまま）。`);
}
$("sexReset").addEventListener("click", resetToSex);
// the 管理 tab's 位置と向き: the hips' own controls (setJointValue pX ... bRoll), pins carried along
const FIG_CTL = [["figX", "pX"], ["figY", "pY"], ["figZ", "pZ"], ["figYaw", "bYaw"], ["figPitch", "bPitch"], ["figRoll", "bRoll"]];
function setFigure(key, v){
  setJointValue(key, v);
  for (const k of Object.keys(S.pins || {})) S.pins[k] = S.P[+k].slice();
  afterEdit(IX.pelvis);
}
function figCoords(){
  for (const [id, key] of FIG_CTL){ const v = jointValue(key), r = $(id), n = $(id + "N");
    if (rangeHeld !== r) r.value = v; if (document.activeElement !== n) n.value = Math.round(v); }
}
for (const [id, key] of FIG_CTL){
  const r = $(id), n = $(id + "N");
  r.addEventListener("input", () => { setFigure(key, +r.value); draw(); });
  n.addEventListener("change", () => { const v = +n.value; if (!isFinite(v)) return; remember(); setFigure(key, v); draw(); });
}
$("figResetPos").addEventListener("click", () => {
  remember();
  for (const k of ["bYaw", "bPitch", "bRoll"]) setJointValue(k, 0);
  standOnFloor(0, 0);
  for (const k of Object.keys(S.pins || {})) S.pins[k] = S.P[+k].slice();
  afterEdit(IX.pelvis); draw(); say("人物の位置と向きを戻しました。");
});
$("resetFigure").addEventListener("click", () => {
  remember();
  const f = fresh();
  for (const k of ["P", "R", "hands", "fingers", "fingerLen", "handApart", "head", "body", "twist", "pins", "scale"]) S[k] = f[k];
  afterEdit(); syncUI(); draw(); say("この人物を初期状態に戻しました（持ち物とオーラはそのまま）。");
});
$("resetAll").addEventListener("click", () => {
  if (!confirm("人物・小物・物体・床と壁・定規・カメラを、すべて最初の状態に戻します（「元に戻す」で取り消せます）。")) return;
  remember();
  const cams = S.cams;
  S = fresh(); S.cams = Array.isArray(cams) ? cams : [];
  syncUI(); draw(); say("すべて最初の状態に戻しました（記憶したカメラは残しました）。");
});
$("rulerReset").addEventListener("click", () => {
  remember();
  const on = !!(S.ruler && S.ruler.on);
  S.ruler = Object.assign(JSON.parse(JSON.stringify(fresh().ruler)), {on});
  syncUI(); draw(); say("定規を初期値に戻しました。");
});
$("symToL").addEventListener("click", () => symmetrizeLimbs("r"));
$("symToR").addEventListener("click", () => symmetrizeLimbs("l"));
for (const [id, whole] of [["symJoint", false], ["symLimb", true]])
  $(id).addEventListener("click", () => { if (sel < 0 || MIRROR[sel] === sel) return;
    remember(); symmetrize(sel, whole); afterEdit(); draw(); say("反対側をそろえました。"); });
for (const [id, set] of [["lens", v => S.cam.lens = v], ["yaw", v => S.cam.yaw = v], ["pitch", v => S.cam.pitch = v],
    ["roll", v => S.cam.roll = v]]){
  // カメラの向き: turned where it stands (the camera stays put, what it looks at moves)
  $(id).addEventListener("input", e => { const pos = camPos(); set(+e.target.value);
    if (id === "yaw" || id === "pitch") S.center = add(S.center, sub(pos, camPos()));
    syncUI(); draw(); });
}
$("camReset").addEventListener("click", () => { remember(); S.cam = fresh().cam; syncUI(); draw(); });
// the same reset in the リセット tab: the camera back to its first place (saved cameras and the lock stay)
$("resetCam").addEventListener("click", () => { remember(); const f = fresh(); S.cam = f.cam; S.center = f.center.slice(); syncUI(); draw(); say("カメラを初期状態に戻しました。"); });
$("scaleThick").addEventListener("pointerdown", remember);
$("scaleThick").addEventListener("input", e => {
  const v = +e.target.value; if (!(v > 0)) return;
  const sc = S.scale = Object.assign(fresh().scale, S.scale), k = v / thickCm(true);
  fromBottom(() => { S.R = S.R.map(r => r * k); }); sc.thick = Math.round(sc.thick * k * 10) / 10;   // the old share, kept in files
  if (document.activeElement !== $("scaleThickV")) $("scaleThickV").value = v; draw();
});
// a number typed next to a slider moves the slider (beyond its ends too, for the scales)
for (const id of Object.keys(UNITS)){
  $(id + "V").addEventListener("change", e => {
    const v = +e.target.value; if (!isFinite(v)) return;
    remember(); const r = $(id);
    if (id.startsWith("scale")){ r.min = Math.min(+r.min, v); r.max = Math.max(+r.max, v); }
    r.value = v; r.dispatchEvent(new Event("input"));
  });
}
buildJointPanel();
$("handSel").innerHTML = Object.keys(HANDS).map(k => `<option value="${k}">${HAND_JA[k]}（${k}）</option>`).join("");   // own shapes too: pose_hand_ui.js (ODMHand.selHTML)
$("pin").addEventListener("change", () => { if (sel < 0) return; remember(); togglePin(sel); draw(); });
// the adjustments stay (switchSex); 体格プリセット and リセット put the sex's own body
$("sexF").addEventListener("click", () => { remember(); switchSex("female"); draw(); say("女性の体格にしました（調整はそのままです）。"); });
$("sexM").addEventListener("click", () => { remember(); switchSex("male"); draw(); say("男性の体格にしました（調整はそのままです）。"); });
for (const id of ["W", "H"]) $(id).addEventListener("change", draw);
window.addEventListener("resize", draw);

// ---- files ------------------------------------------------------------------------------
// the largest canvas this device draws (iOS / iPadOS: about 16.7 megapixels; others vary): the
// picture keeps its ratio and gets smaller, and the status line says so
function exportCanvas(){
  let [W, H] = exportSize();
  const cv = document.createElement("canvas");
  for (let k = 0; k < 8; k++){
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d");
    if (ctx){ ctx.fillStyle = "#000"; ctx.fillRect(W - 1, H - 1, 1, 1);
      try { if (ctx.getImageData(W - 1, H - 1, 1, 1).data[3] === 255) break; } catch (e) {} }
    W = Math.floor(W * 0.8); H = Math.floor(H * 0.8);
  }
  const [W0, H0] = exportSize(); frameAspect = W0 / H0;
  if (W !== W0) setTimeout(() => say(`この端末では ${W0}×${H0} を描けないため、${W}×${H} にしました。`, true), 0);
  cv.getContext("2d").clearRect(0, 0, W, H);
  return [cv, W, H];
}
function render(kind){
  const [cv, W, H] = exportCanvas();
  const ctx = cv.getContext("2d");
  if (kind === "openpose") drawOpenpose(ctx, W, H);
  else { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
    // 構図 (atariMode "comp"): the scene too, as the 構図の画像's checks say (without the ruler)
    const comp = $("atariMode").value !== "figure", on = id => $(id).checked;
    drawAtari(ctx, W, H, Object.assign({ink: "#1a1a1a", far: "#8a8a8a", bg: "#ffffff", export: true}, comp ?
      {noFigure: !on("cmFigure"), noItems: !on("cmItems"), noSolids: !on("cmSolids"), noAuras: !on("cmAuras"),
       showEnv: on("cmEnv"), showSolids: on("cmSolids")} : {})); }
  return cv.toDataURL("image/png");
}
// the composition as seen in the front view, at the export size: the chosen parts, the ruler
// (pose_ruler.js) and a white, clear or screen-coloured background
function renderComposition(){ return compCanvas().toDataURL("image/png"); }
function compCanvas(){
  const [cv, W, H] = exportCanvas();
  const ctx = cv.getContext("2d"), bg = $("cmBg").value, on = id => $(id).checked;
  const theme = bg === "theme";
  if (bg !== "clear"){ ctx.fillStyle = theme ? cssVar("--stage") : "#ffffff"; ctx.fillRect(0, 0, W, H); }
  if (on("cmRuler") && typeof drawRuler === "function") drawRuler(ctx, W, H, {export: true, force: true});
  drawAtari(ctx, W, H, Object.assign(theme ? {} : {ink: "#1a1a1a", far: "#8a8a8a", bg: "#ffffff"},
    {export: true, noFigure: !on("cmFigure"), noItems: !on("cmItems"), noSolids: !on("cmSolids"), noAuras: !on("cmAuras"),
     showEnv: on("cmEnv"), showSolids: on("cmSolids"), flat: bg === "clear"}));
  return cv;
}
// the export size from a ratio ("3:4") and the long side
function applyRatio(){
  const r = $("ratio").value;
  $("ratioCustom").style.display = r === "custom" ? "" : "none";
  if (!r) return;
  const [a, b] = r === "custom" ? [+$("ratioW").value, +$("ratioH").value] : r.split(":").map(Number);
  if (!(a > 0 && b > 0)) return;
  const L = Math.max(256, Math.min(8192, +$("longSide").value || 1920));
  const w = a >= b ? L : L * a / b, h = a >= b ? L * b / a : L;
  $("W").value = Math.max(64, Math.round(w)); $("H").value = Math.max(64, Math.round(h)); draw();
}
for (const id of ["ratio", "longSide", "ratioW", "ratioH"]) $(id).addEventListener("change", applyRatio);
for (const id of ["W", "H"]) $(id).addEventListener("input", () => { $("ratio").value = ""; $("ratioCustom").style.display = "none"; });
// saving: a blob link (big data URLs fail in some browsers); iOS / iPadOS show it to save or share
// a picture is shown whole first (#savePreview) and saved only when 保存する is pressed
function download(url, name){
  if (/\.png$/i.test(name) && !download.sure){
    const dlg = $("savePreview"), img = $("spImg");
    img.src = url; $("spInfo").textContent = name;
    img.onload = () => { $("spInfo").textContent = `${name}（${img.naturalWidth}×${img.naturalHeight}）`; };
    const done = save => { dlg.close(); $("spSave").onclick = $("spCancel").onclick = null;
      if (save){ download.sure = true; try { download(url, name); } finally { download.sure = false; } }
      else say("保存をやめました。"); };
    $("spSave").onclick = () => done(true); $("spCancel").onclick = () => done(false);
    dlg.oncancel = e => { e.preventDefault(); done(false); };
    dlg.showModal(); $("spSave").focus();
    return;
  }
  // the app (src-tauri) has no download links: it gives the bytes to its "save as" dialog (ODM_APP_SAVE)
  if (window.ODM_APP_SAVE){
    fetch(url).then(r => r.blob()).then(b => window.ODM_APP_SAVE(b, name))
      .then(saved => { if (!saved) say("保存をやめました。"); })
      .catch(err => say("保存できませんでした：" + (err && err.message || err), true))
      .finally(() => { if (!url.startsWith("data:")) setTimeout(() => URL.revokeObjectURL(url), 60000); });
    return;
  }
  const go = href => { const a = document.createElement("a"); a.href = href; a.download = name; a.rel = "noopener";
    document.body.appendChild(a); a.click(); a.remove(); };
  if (!url.startsWith("data:")){ go(url); setTimeout(() => URL.revokeObjectURL(url), 60000); return; }
  fetch(url).then(r => r.blob()).then(b => { const u = URL.createObjectURL(b); go(u); setTimeout(() => URL.revokeObjectURL(u), 60000); })
    .catch(() => go(url));
}
const stamp = () => new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
$("saveAtari").addEventListener("click", () => { download(render("atari"), `atari_${stamp()}.png`); say("アタリ画像を保存しました。"); });
$("saveOpenpose").addEventListener("click", () => { download(render("openpose"), `openpose_${stamp()}.png`); say("OpenPose 画像を保存しました。"); });
$("saveComp").addEventListener("click", () => {
  const url = renderComposition(), [W, H] = exportSize();
  download(url, `composition_${W}x${H}_${stamp()}.png`); say(`構図を ${W}×${H} で保存しました。`); });
$("saveJson").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify({version: 3, ...S}, null, 1)], {type: "application/json"});
  download(URL.createObjectURL(blob), `pose_${stamp()}.json`); say("ポーズを保存しました。");
});
$("loadJson").addEventListener("click", () => $("file").click());
// opening a file: the pose (.json) or the edit data (.json / .odmposer) is pose_project.js's (openEditFile)
$("file").addEventListener("change", async e => {
  const f = e.target.files[0]; if (!f) return;
  try { await openEditFile(f); } catch (err) { say("読み込めませんでした：" + err.message, true); }
  e.target.value = "";
});
function migrate(d){                  // version 1 had no waist joint (18 joints)
  if (Array.isArray(d.P) && d.P.length === 18){
    d.P.splice(1, 0, mul(add(d.P[0], d.P[1]), 0.5));
    if (Array.isArray(d.R)) d.R.splice(1, 0, 12);
    if (Array.isArray(d.twist)) d.twist.splice(1, 0, 0);
  }
  // version 2 kept the face's turn apart (head.yaw); now it is the head joint's twist
  if (d.head && d.head.yaw){ d.twist = d.twist || REST.map(() => 0); d.twist[4] = (d.twist[4] || 0) + d.head.yaw; d.head.yaw = 0; }
  // 19 joints: from before the hands
  upgradeState(d);
}
function say(msg, warn){ $("status").textContent = msg; $("status").style.color = warn ? "var(--warn)" : ""; }

// the scene alone (things, floor and walls, wire, solids), for what reads the pose downstream
// (a mod hands it on with api.io.sceneJSON)
function sceneOnly(){ return {items: S.items || [], env: S.env || {}, wire: S.wire || {}, solids: S.solids || []}; }
const qs = new URLSearchParams(location.search);
// the picture's size: from the link (?w= &h=), else this screen's own resolution (in device pixels)
{ const px = v => Math.max(256, Math.min(8192, Math.round(v * (window.devicePixelRatio || 1))));
  const sw = screen.width > 0 ? px(screen.width) : 1080, sh = screen.height > 0 ? px(screen.height) : 1920;
  $("W").value = qs.get("w") || sw; $("H").value = qs.get("h") || sh;
  $("longSide").value = Math.max(+$("W").value, +$("H").value); }
// the picture's settings (its ratio and size: the camera's frame, so the composition; what the
// composition picture shows) are kept in this browser too; a link's ?w= &h= comes first
// pictureSettings() / setPictureSettings(o): the same settings as an object (the edit data file, pose_project.js)
const PICTURE_IDS = ["ratio", "longSide", "ratioW", "ratioH", "W", "H", "atariMode", "cmFigure", "cmItems", "cmSolids", "cmEnv", "cmRuler", "cmAuras", "cmBg"];
function pictureSettings(){ const o = {}; for (const id of PICTURE_IDS){ const e = $(id); if (e) o[id] = e.type === "checkbox" ? e.checked : e.value; } return o; }
function setPictureSettings(o){
  if (!o || typeof o !== "object") return;
  for (const id of PICTURE_IDS){ const e = $(id); if (!e || o[id] === undefined) continue; if (e.type === "checkbox") e.checked = !!o[id]; else e.value = o[id]; }
  if ($("ratioCustom")) $("ratioCustom").style.display = $("ratio").value === "custom" ? "" : "none";
  $("W").dispatchEvent(new Event("change"));                  // kept in this browser too
}
{ const PIC_KEY = "odm-poser-editor-v1-picture",   // (KEY is set further down)
   IDS = PICTURE_IDS;
  const keep = () => { try { localStorage.setItem(PIC_KEY, JSON.stringify(pictureSettings())); } catch (e) {} };
  let saved = null; try { saved = JSON.parse(localStorage.getItem(PIC_KEY) || "null"); } catch (e) {}
  if (saved && typeof saved === "object") for (const id of IDS){
    const e = $(id); if (!e || saved[id] === undefined || ((id === "W" || id === "H") && (qs.get("w") || qs.get("h")))) continue;
    if (e.type === "checkbox") e.checked = !!saved[id]; else e.value = saved[id]; }
  if ($("ratioCustom")) $("ratioCustom").style.display = $("ratio").value === "custom" ? "" : "none";
  for (const id of IDS) if ($(id)){ $(id).addEventListener("change", keep); $(id).addEventListener("input", keep); } }

// light / dark: auto follows the system; the choice is kept in this browser
{ const KEY_T = "odm-poser-theme", LABEL = {auto: "表示：自動", light: "表示：ライト", dark: "表示：ダーク"};
  const set = t => { if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
    else delete document.documentElement.dataset.theme;
    $("themeBtn").querySelector("span").textContent = LABEL[t] || LABEL.auto; draw(); };
  let theme = "auto"; try { theme = localStorage.getItem(KEY_T) || "auto"; } catch (e) {}
  $("themeBtn").addEventListener("click", () => {
    theme = {auto: "light", light: "dark", dark: "auto"}[theme] || "auto";
    try { localStorage.setItem(KEY_T, theme); } catch (e) {}
    set(theme); });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => draw());
  set(theme);
}
// the app (PWA): offline with a service worker, an "add as an app" button. Only over https or
// from this computer (localhost): opened as a file there is no app; inside another page's frame
// (a host page's window, such as a node editor's) neither.
{ const top = window.top === window, secure = window.isSecureContext && location.protocol !== "file:";
  const ua = navigator.userAgent, ios = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const macSafari = /Macintosh/.test(ua) && /Safari\//.test(ua) && !/Chrome|Chromium|Edg\/|Firefox|OPR\//.test(ua) && !ios;
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  if (top && secure && "serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  let prompt = null;
  addEventListener("beforeinstallprompt", e => { e.preventDefault(); prompt = e; if (top) $("installBtn").hidden = false; });
  addEventListener("appinstalled", () => { $("installBtn").hidden = true; say("アプリとして追加しました。"); });
  if (top && secure && !standalone && (ios || macSafari)) $("installBtn").hidden = false;
  $("installBtn").addEventListener("click", async () => {
    if (prompt){ prompt.prompt(); const r = await prompt.userChoice; prompt = null; if (r.outcome === "accepted") $("installBtn").hidden = true; }
    else if (ios) say("Safari の共有ボタン（□↑）→「ホーム画面に追加」で、アプリとして使えます。");
    else if (macSafari) say("Safari のメニュー「ファイル」→「Dock に追加」で、アプリとして使えます。");
  });
}
// remember the last pose in this browser only (a convenience; files are the real save)
const KEY = "odm-poser-editor-v1";
try { const l = localStorage.getItem(KEY + "-limits"); if (l !== null) $("limits").checked = l === "1"; } catch (e) {}
try { $("symPose").checked = localStorage.getItem(KEY + "-sympose") === "1"; } catch (e) {}
// 太さを部位ごとに連動 (体格): on unless switched off here
try { const v = localStorage.getItem(KEY + "-thicklink"); if (v !== null) $("thickLink").checked = v === "1"; } catch (e) {}
$("thickLink").addEventListener("change", e => { try { localStorage.setItem(KEY + "-thicklink", e.target.checked ? "1" : "0"); } catch (err) {}
  say(e.target.checked ? "腕・脚の太さを部位ごとにまとめて変えます。" : "太さを関節ごとに変えます。"); });
// the camera pad: the left stick turns the camera round the figure, the right one moves it (both
// as a game's camera: push right, the camera goes right), the slider zooms
function padStick(id, act){
  const el = $(id), knob = el.firstElementChild; let v = null, raf = 0, t0 = 0;
  const tick = t => { if (!v) return; const dt = Math.min(0.05, (t - t0) / 1000); t0 = t;
    act(v[0], v[1], dt); camSync(); draw(); raf = requestAnimationFrame(tick); };
  const set = e => { const r = el.getBoundingClientRect(), half = r.width / 2;
    let dx = (e.clientX - r.left - half) / half, dy = (e.clientY - r.top - half) / half; const m = Math.hypot(dx, dy);
    if (m > 1){ dx /= m; dy /= m; }
    v = [dx, dy]; knob.style.transform = `translate(${dx * half * 0.6}px, ${dy * half * 0.6}px)`; };
  el.addEventListener("pointerdown", e => { e.preventDefault(); if (camHeld()) return;
    try { el.setPointerCapture(e.pointerId); } catch (err) {}
    remember(); set(e); cancelAnimationFrame(raf); t0 = performance.now(); raf = requestAnimationFrame(tick); });
  el.addEventListener("pointermove", e => { if (v) set(e); });
  const end = () => { if (!v) return; v = null; knob.style.transform = ""; cancelAnimationFrame(raf); syncUI(); };
  el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
}
padStick("stickOrbit", (x, y, dt) => camOrbit(x * 120 * dt, -y * 90 * dt));
padStick("stickPan", (x, y, dt) => { const H = front.height; camPan(-x * 0.6 * H * dt, -y * 0.6 * H * dt, front.width, H); });
{ const z = $("zoomer"); let on = false;
  const set = e => { const r = z.getBoundingClientRect(), [a, b] = zoomSpan();
    const f = 1 - Math.max(0, Math.min(1, (e.clientY - r.top - 13) / Math.max(1, r.height - 26)));
    S.cam.zoom = a * Math.pow(b / a, f); drawSoon(); };
  z.addEventListener("pointerdown", e => { e.preventDefault(); if (camHeld()) return;
    try { z.setPointerCapture(e.pointerId); } catch (err) {}
    remember(); on = true; set(e); });
  z.addEventListener("pointermove", e => { if (on) set(e); });
  const end = () => { if (on){ on = false; syncUI(); } };
  z.addEventListener("pointerup", end); z.addEventListener("pointercancel", end);
}
// the pad: shown on touch screens unless switched off; on a computer when switched on
{ let pref = null; try { pref = localStorage.getItem(KEY + "-pad"); } catch (e) {}
  document.body.classList.toggle("pad", pref ? pref === "1" : document.body.classList.contains("touch")); }
const padKey = () => { const on = document.body.classList.contains("pad");
  $("vPad").setAttribute("aria-pressed", String(on)); $("vPad").classList.toggle("on", on); $("padOn").checked = on; };
const setPad = on => { document.body.classList.toggle("pad", on);
  try { localStorage.setItem(KEY + "-pad", on ? "1" : "0"); } catch (e) {} padKey(); };
padKey();
$("vPad").addEventListener("click", () => setPad(!document.body.classList.contains("pad")));
$("padOn").addEventListener("change", e => setPad(e.target.checked));
// remembered cameras (S.cams, saved with the pose and undone with it)
const camLabel = c => `${c.name}（向き ${Math.round(c.cam.yaw)}°・高さ ${Math.round(c.cam.pitch)}°・${Math.round(c.cam.lens)}mm・×${(+c.cam.zoom).toFixed(1)}）`;
function syncCams(){
  const list = S.cams = Array.isArray(S.cams) ? S.cams : [], el = $("camList"), keep = el.value;
  el.innerHTML = list.map((c, i) => `<option value="${i}">${esc(camLabel(c))}</option>`).join("");
  if (keep !== "" && +keep < list.length) el.value = keep;
  $("camCount").textContent = list.length; $("camLock").checked = !!S.camLock;
  for (const id of ["camLoad", "camDel"]) $(id).disabled = !list.length;
  camLockUI();
}
// the position and the look point: a slider (dragged, one step to the undo) and a number, each the other's
let camSlide = false;
for (const id of [...CAM_P, ...CAM_T]){
  const r = $(id + "R");
  if (r){
    r.addEventListener("pointerdown", () => remember());
    r.addEventListener("input", () => { $(id).value = r.value; camSlide = true; $(id).dispatchEvent(new Event("change")); camSlide = false; });
  }
}
for (const id of [...CAM_P, ...CAM_T]) $(id).addEventListener("change", () => {
  if (camHeld()) return;
  const v = ids => ids.map(k => +$(k).value);
  if (![...v(CAM_P), ...v(CAM_T)].every(isFinite)) return;
  if (!camSlide) remember();
  // カメラの位置: moved as it faces (the point it looks at goes along)
  S.center = add(S.center, sub(v(CAM_P), camPos()));
  syncUI(); draw();
});
{ const sync0 = syncUI; syncUI = function(){ sync0(); syncCams(); syncCamRanges(); }; }
// the sliders follow the numbers (the camera moved by the view, the lock, a saved camera)
function syncCamRanges(){ for (const id of [...CAM_P, ...CAM_T]){ const r = $(id + "R"); if (r && document.activeElement !== r) r.value = $(id).value; } }
$("camLock").addEventListener("change", e => { remember(); S.camLock = e.target.checked; camLockUI();
  say(S.camLock ? "カメラを固定しました（スライダー・座標も動きません。「呼出」は使えます）。" : "カメラの固定を外しました。"); });
$("camSave").addEventListener("click", () => {
  remember(); S.cams = Array.isArray(S.cams) ? S.cams : [];
  let n = S.cams.length + 1; while (S.cams.some(c => c.name === `カメラ${n}`)) n++;
  S.cams.push({name: `カメラ${n}`, cam: Object.assign({}, S.cam), center: S.center.slice()});
  syncCams(); $("camList").value = String(S.cams.length - 1); say(`カメラ${n}として記憶しました。`);
});
const camRecall = () => { const c = (S.cams || [])[+$("camList").value]; if (!c) return;
  remember(); S.cam = Object.assign({}, S.cam, c.cam); S.center = c.center.slice(); syncUI(); draw(); say(`${c.name}を呼び出しました。`); };
$("camLoad").addEventListener("click", camRecall);
$("camList").addEventListener("dblclick", camRecall);
$("camDel").addEventListener("click", () => { const i = +$("camList").value; if (!(S.cams || [])[i]) return;
  remember(); const [c] = S.cams.splice(i, 1); syncCams(); say(`${c.name}を削除しました。`); });
syncCams();
// the side view (横から): right (the default; hidden on a phone till asked for), left, above, below
// or hidden; kept in this browser. The button on the view (two panes) hides it and brings it back
// where it was.
{ const views = document.querySelector(".views"), el = $("sidePos"), btn = $("ovSide");
  const set = p => { views.classList.remove("side-left", "side-top", "side-bottom", "side-hide");
    if (p !== "right") views.classList.add("side-" + p); el.value = p;
    btn.setAttribute("aria-pressed", String(p !== "hide"));
    // twice: the front view's room is measured with the side view already at its new size
    chromeKey = ""; draw(); chromeKey = ""; draw(); };
  const get = (k, d) => { try { return localStorage.getItem(KEY + k) || d; } catch (e) { return d; } };
  const put = (k, v) => { try { localStorage.setItem(KEY + k, v); } catch (e) {} };
  const choose = v => { put("-side", v); if (v !== "hide") put("-sidelast", v); set(v); };
  el.addEventListener("change", () => choose(el.value));
  btn.addEventListener("click", () => {
    const show = el.value === "hide";
    // shown again where it was; a phone, the first time: under the front view
    choose(show ? get("-sidelast", matchMedia(PHONE).matches ? "bottom" : "right") : "hide");
    toast(show ? "側面図を出しました（置き場所は側面図の隅で）。" : "側面図を隠しました。"); });
  const p = get("-side", matchMedia(PHONE).matches ? "hide" : "right");
  set(["right", "left", "top", "bottom", "hide"].includes(p) ? p : "right");
}
// the panel (操作欄): right (the default), left, above or below the views; kept in this browser
// Above or below, the menu and tabs stack in a column on the left or right (メニュー) and the
// tab's controls run across, sliders upright. Any place: the panel can be put away (しまう).
// kept apart for an upright and a sideways screen: turning the screen brings that way's own settings
// (the defaults, the first time), so a place chosen for one does not carry over to the other
{ const el = $("asidePos"), side = $("menuSide"), all = ["right", "left", "top", "bottom"], bc = document.body.classList;
  const UPRIGHT = matchMedia("(orientation: portrait)"), way = () => UPRIGHT.matches ? "-p" : "-l";
  const get = (k, d) => { try { return localStorage.getItem(KEY + k + way()) || d; } catch (e) { return d; } };
  const put = (k, v) => { try { localStorage.setItem(KEY + k + way(), v); } catch (e) {} };
  const redraw = () => { chromeKey = ""; draw(); chromeKey = ""; draw(); };
  const set = p => { bc.remove("aside-left", "aside-top", "aside-bottom");
    if (p !== "right") bc.add("aside-" + p); el.value = p; redraw(); };
  const setSide = s => { bc.toggle("menu-right", s === "right"); side.value = s; redraw(); };
  const setOff = off => { bc.toggle("aside-off", off); $("ovAside").setAttribute("aria-pressed", String(!off)); redraw(); };
  el.addEventListener("change", () => { put("-aside", el.value); set(el.value); });
  side.addEventListener("change", () => { put("-menuside", side.value); setSide(side.value); });
  const flip = () => { const off = !bc.contains("aside-off"); put("-asideoff", off ? "1" : "0"); setOff(off); };
  // split screen: the panel's half is given to the views (full) instead
  $("ovAside").addEventListener("click", () => {
    if (bc.contains("split")){ const full = bc.toggle("full"); $("ovAside").setAttribute("aria-pressed", String(!full)); draw();
      toast(full ? "操作欄をしまいました。" : "操作欄を出しました。"); return; }
    flip(); toast(bc.contains("aside-off") ? "操作欄をしまいました。" : "操作欄を出しました。"); });
  const load = () => { const p = get("-aside", "right"); set(all.includes(p) ? p : "right");
    setSide(get("-menuside", "left") === "right" ? "right" : "left");
    setOff(get("-asideoff", "0") === "1"); };
  load();
  UPRIGHT.addEventListener("change", load);
}
// a message from the view's own switches: shown for a moment in the view's corner, not in the panel
let toastTimer = 0;
function toast(msg, warn){
  const t = $("ovToast"); t.textContent = msg; t.classList.toggle("warn", !!warn); t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}
// split screen: on by itself where a finger is the main pointer (phones, tablets), or as chosen
function setSplit(on){
  document.body.classList.toggle("split", on);
  document.body.classList.remove("full");
  $("ovAside").setAttribute("aria-pressed", String(!document.body.classList.contains(on ? "full" : "aside-off")));
  $("splitBtn").setAttribute("aria-pressed", String(on)); draw();
}
{ let pref = null; try { pref = localStorage.getItem(KEY + "-split"); } catch (e) {}
  setSplit(pref ? pref === "1" : matchMedia("(pointer: coarse)").matches); }
$("splitBtn").addEventListener("click", () => { const on = !document.body.classList.contains("split");
  try { localStorage.setItem(KEY + "-split", on ? "1" : "0"); } catch (e) {} setSplit(on); });
$("symPose").addEventListener("change", e => { try { localStorage.setItem(KEY + "-sympose", e.target.checked ? "1" : "0"); } catch (err) {}
  if (e.target.checked && sel >= 0 && MIRROR[sel] !== sel){ remember(); afterEdit(sel); draw(); say("反対側をそろえました。"); } });
$("torso3d").addEventListener("change", e => { remember(); S.torso3d = e.target.checked; draw();
  toast(e.target.checked ? "編集中の人物の胴体を立体（厚みのある台形）で描きます。" : "編集中の人物の胴体を平らな台形で描きます。"); });
$("hiddenDashed").addEventListener("change", e => { remember(); S.hiddenDashed = e.target.checked; draw();
  toast(e.target.checked ? "物陰に隠れた線を破線で描きます（書き出しにも）。" : "隠れた線を破線にするのをやめました。"); });
$("limits").addEventListener("change", e => { try { localStorage.setItem(KEY + "-limits", e.target.checked ? "1" : "0"); } catch (err) {}
  $("limitsSide").checked = e.target.checked;
  (e.isTrusted ? toast : say)(e.target.checked ? "関節の限界を有効にしました（これからの操作に効きます）。" : "関節の限界を無効にしました。"); });
// the same switch in the pose panel
$("limitsSide").checked = $("limits").checked;
$("limitsSide").addEventListener("change", e => { $("limits").checked = e.target.checked; $("limits").dispatchEvent(new Event("change")); });
// kept in this browser for a reload: the scene (S) and where the screen was (the mode, the menu's tab).
// Not only when the page goes (beforeunload is not sent everywhere: iOS Safari, an app's web view,
// a tab the browser closes), but also when it is hidden and a moment after each change
function saveLocal(){
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
  try { localStorage.setItem(KEY + "-view", JSON.stringify({mode, menu: window.ODMUI && ODMUI.current ? ODMUI.current() : ""})); } catch (e) {}
}
window.addEventListener("beforeunload", saveLocal);
window.addEventListener("pagehide", saveLocal);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") saveLocal(); });
{ let t = 0; const d0 = draw; draw = function(){ d0.apply(this, arguments); clearTimeout(t); t = setTimeout(saveLocal, 800); }; }
try { const d = JSON.parse(localStorage.getItem(KEY) || "null"); if (d && d.P){ migrate(d); if (d.P.length === J.length) S = Object.assign(fresh(), d); } } catch (e) {}
syncUI(); draw();
// the setting 「クリックで自動的にモードを切り替える」 (on at first, kept in this browser): a press on a
// thing goes to 配置 (where things move), a press on a joint to ポーズ (from 配置 or カメラ; 体格 keeps
// its joints), a click on an empty place to カメラ (from ポーズ or 体格; pose_objects.js)
const AUTO_KEY = KEY + "-automode";
let autoMode = true; try { autoMode = localStorage.getItem(AUTO_KEY) !== "0"; } catch (e) {}
function modeTo(m){ const b = document.querySelector(`#modes [data-mode="${m}"]`); if (b && mode !== m) b.click(); }
DOWN_HOOKS.unshift((cv, x, y) => {
  // カメラ: a drag turns the camera; a click switches (on letting go, pose_objects.js tapClick)
  if (!autoMode || cv !== front || mode === "persp") return null;
  // the hips' middle in 配置 stays (dragged, the figure moves; a click: pose_objects.js hipsClick)
  const pi = pick(cv, x, y);
  if (pi >= 0){ if ((mode === "place" && pi !== IX.pelvis) || mode === "persp") modeTo("pose"); return null; }
  if ((typeof solidUnder === "function" && solidUnder(x, y)) || (typeof itemUnder === "function" && itemUnder(x, y))) modeTo("place");
  return null;
});
document.getElementById("autoMode").checked = autoMode;
document.getElementById("autoMode").addEventListener("change", e => { autoMode = e.target.checked; try { localStorage.setItem(AUTO_KEY, autoMode ? "1" : "0"); } catch (err) {} });
