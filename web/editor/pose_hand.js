// The hand's model (src/pages/editor/index.astro, loaded before pose_main.js): its shapes, its fingers'
// joints, where its 21 points are, and how it is drawn. Nothing here runs at load; the functions are
// called once pose_main.js has made S and the helpers they use (add, mul, norm, rotAxis, bodyFront,
// bodyRot, project, cssVar, partColor, hiddenAt, skipJoint, IX, HAND_LEN ...).
//
// A hand has 15 joints: each finger's root (the knuckle; the thumb's: where it leaves the wrist, CM),
// its middle and its last joint. Each finger keeps [spread, bend0, bend1, bend2] in degrees: spread is
// at the root only (+: away from the middle finger; the middle finger's +: toward the index; the
// thumb's +: away from the hand), the bends toward the palm (the thumb's toward the palm and across it).
//
// S.hands {r, l}: the named shape (HANDS) as before (held things, mods and older files set it).
// S.fingers {r, l}: a hand's own joints, {from, a: [[spread, b0, b1, b2] x 5], name}, used while
//   S.hands of that side is still `from` (the shape it was made from): whatever sets another shape
//   (taking a sword: "grip") takes over, and setting `from` again brings the own joints back.
// S.fingerLen [thumb, index, middle, ring, little]: each finger's length as a share (0.85 .. 1.15),
//   both hands alike; the hand's size is the hand bone's length (wrist -> knuckles, HAND_LEN at 1).
"use strict";

// the named shapes: a curl per finger (thumb, index, middle, ring, little; 0 straight, 1 closed), as
// the editor and its mods have always written them, or {a: the joints} (a mod's own angles)
const HANDS = {
  relaxed:[.25,.3,.35,.4,.45], open:[0,0,0,0,0], fist:[.75,1,1,1,1], peace:[.9,0,0,1,1],
  point:[.7,0,1,1,1], thumbs_up:[0,1,1,1,1], ok:[.55,.6,0,0,0], gun:[.15,0,1,1,1],
  rock:[.9,0,1,1,0], grip:[.6,.75,.8,.8,.8], claw:[.5,.7,.7,.7,.7],
  pinch:[.55,.6,.9,.95,.95], cup:[.35,.45,.5,.55,.6], trigger:[.6,.25,1,1,1]};
const HAND_JA = {relaxed:"自然", open:"パー", fist:"グー", peace:"ピース", point:"指差し",
  thumbs_up:"サムズアップ", ok:"OK", gun:"指鉄砲", rock:"ロック", grip:"握り込む", claw:"かぎ爪",
  pinch:"つまむ（ペン）", cup:"包む（カップ・ボール）", trigger:"引き金"};
// OpenPose's 21 points: the wrist, then thumb, index, middle, ring and little finger, root -> tip
const HAND_EDGES = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[0,9],[9,10],[10,11],[11,12],
                    [0,13],[13,14],[14,15],[15,16],[0,17],[17,18],[18,19],[19,20]];
const FINGER_JA = ["親指", "人差し指", "中指", "薬指", "小指"];
const FINGER_JOINT_JA = [["付け根（CM）", "中（MP）", "先（IP）"], ["付け根", "第2関節", "第1関節"]];
// the fingers in the hand's frame for an 8 cm hand (wrist -> knuckles): root [x, y, z] cm, the
// direction it starts in (deg toward the thumb across the palm; the thumb also toward the palm), its
// three bones (cm), how far each joint bends at a full curl of the named shapes (deg), and how much
// its knuckle sinks toward the palm as the fingers close (the palm's arch)
const FINGERS = [
  {root: [0.6, 2.2, 1.4], spread: 55, palm: 0.35, segs: [3.6, 3.0, 2.5], bend: [30, 55, 70], thumb: true, arch: 0},
  {root: [0, 3.0, 8.0], spread: 7, segs: [4.0, 2.5, 2.0], bend: [80, 100, 70], arch: 0},
  {root: [0, 1.0, 8.3], spread: 0, segs: [4.5, 2.8, 2.2], bend: [80, 100, 70], arch: 0.15},
  {root: [0, -1.0, 8.0], spread: -6, segs: [4.2, 2.6, 2.0], bend: [80, 100, 70], arch: 0.4},
  {root: [0, -2.8, 7.3], spread: -13, segs: [3.3, 2.0, 1.8], bend: [80, 100, 70], arch: 0.7}];
// which way +spread turns each finger (toward the thumb's side +1)
const FINGER_SIDE = [1, 1, 1, -1, -1];
// a human hand's range (deg): the root's spread, each joint's bend (a little back, far forward)
const FINGER_LIM = FINGERS.map((g, n) => g.thumb
  ? {spread: [-15, 45], bend: [[-20, 70], [-10, 80], [-20, 90]]}
  : {spread: n === 2 ? [-12, 12] : [-10, 22], bend: [[-25, 95], [-5, 115], [-10, 90]]});
const FINGER_LEN_LIM = [0.85, 1.15];          // a finger's length, as a share of the usual (people differ)
const HAND_K_LIM = [0.75, 1.35];              // the hand's size, as a share of the usual (8 cm palm)
// the selected finger joint {side, n (finger), j (joint)}, while that hand's joint is selected
let fingerSel = null;

// ---- the joints -------------------------------------------------------------------------------------
const clampTo = (v, [lo, hi]) => Math.max(lo, Math.min(hi, v));
// a named shape's joints
function shapeAngles(name){
  const h = HANDS[name] || HANDS.relaxed;
  if (h && Array.isArray(h.a)) return h.a.map(f => f.slice());
  return FINGERS.map((g, n) => [0, ...g.bend.map(b => (+h[n] || 0) * b)]);
}
// the joints a hand has now: its own (S.fingers) while made from the shape it has, else the shape's
function handAngles(side, st){
  st = st || S;
  const own = st.fingers && st.fingers[side], name = (st.hands && st.hands[side]) || "relaxed";
  if (own && own.from === name && Array.isArray(own.a) && own.a.length === 5) return own.a.map(f => f.slice());
  return shapeAngles(name);
}
// the hand's own joints from now on (made from the shape it has), for an edit
function ownAngles(side){
  S.fingers = S.fingers || {};
  const name = S.hands[side] || "relaxed", own = S.fingers[side];
  if (!(own && own.from === name)) S.fingers[side] = {from: name, a: handAngles(side)};
  return S.fingers[side].a;
}
function clampFinger(n, f){
  const L = FINGER_LIM[n];
  return [clampTo(+f[0] || 0, L.spread), ...[1, 2, 3].map(j => clampTo(+f[j] || 0, L.bend[j - 1]))];
}
// one joint's bend (and the root's spread) set; limits kept
function setFingerJoint(side, n, j, bend, spread){
  const a = ownAngles(side), f = a[n].slice();
  if (bend !== undefined) f[1 + j] = bend;
  if (j === 0 && spread !== undefined) f[0] = spread;
  a[n] = clampFinger(n, f);
  delete S.fingers[side].name;
}
const fingerLens = st => { const v = (st || S).fingerLen; return [0, 1, 2, 3, 4].map(n => clampTo(Array.isArray(v) && +v[n] ? +v[n] : 1, FINGER_LEN_LIM)); };
// the hand's size: its bone (wrist -> knuckles) against the usual 8 cm
function handK(side){
  const wr = S.P[IX[side + "_wrist"]], hd = S.P[IX[side + "_hand"]];
  return (hd ? len(sub(hd, wr)) : HAND_LEN) / HAND_LEN;
}
// a hand's length (wrist -> the middle finger's tip, straight), cm
const handLength = side => handK(side) * (HAND_LEN + 0.3 + FINGERS[2].segs.reduce((s, v) => s + v, 0) * fingerLens()[2]);

// ---- the frames and the points ----------------------------------------------------------------------
// the hand's frame: origin in the middle of the fist, z along the hand (wrist -> knuckles), y toward
// the thumb, x toward the palm. The forearm's frame (its twist) is carried over the wrist's bend,
// so a bent wrist turns the fingers and what the hand holds (pose_scene.js).
function handFrame(side){
  const el = S.P[IX[side + "_elbow"]], wr = S.P[IX[side + "_wrist"]], hd = S.P[IX[side + "_hand"]];
  const z0 = norm(sub(wr, el)), z = hd ? norm(sub(hd, wr)) : z0;
  const ref = add(bodyFront(), mul(bodyRot([0, 1, 0]), 0.4));
  let y = sub(ref, mul(z0, dot(ref, z0)));
  if (len(y) < 1e-4) y = cross(z0, [1, 0, 0]);
  const tw = (S.twist[IX[side + "_wrist"]] || 0) + (S.twist[IX[side + "_hand"]] || 0);
  y = rotAxis(norm(y), z0, deg(tw));       // the same way as setTwist turns the bones (mirrored twists mirror)
  y = norm(rotBetween(y, z0, z));
  const x = mul(norm(cross(y, z)), side === "r" ? 1 : -1);
  return {o: add(wr, mul(z, 7)), x, y, z};
}
// where a held thing sits in each hand shape, in the hand's frame from the wrist (cm for an 8 cm
// hand; it grows with the hand): in the hole the curled fingers make (the middle of a handle),
// against the palm (cup, open, relaxed) or between the thumb's and the index finger's tips (pinch,
// ok). Shapes not listed curl the last fingers as a fist does. pose_scene.js puts the thing's own
// grip point here (gripPoint). A hand's own joints (S.fingers) keep the grip of the shape they came from.
const GRIP_AT = {fist: [2.2, 0, 7.4], grip: [2.6, 0, 7.8], claw: [3, 0, 8.4],
  cup: [1, 1, 7], relaxed: [1, 1, 6], open: [0.8, 1, 5.5], pinch: [7, 3.4, 8], ok: [7, 3.4, 8]};
function gripFrame(side){
  const f = handFrame(side), wr = S.P[IX[side + "_wrist"]], k = handK(side), g = GRIP_AT[S.hands[side]] || GRIP_AT.fist;
  return {o: add(wr, mul(add(add(mul(f.x, g[0]), mul(f.y, g[1])), mul(f.z, g[2])), k)), x: f.x, y: f.y, z: f.z};
}
// the hand in the world: the 21 points (OpenPose's order) and the heel of the palm on the thumb's and
// the little finger's side. A finger starts from its knuckle, turned by its spread about the palm's
// normal (the fingers come together as they close, as a hand's do), and bends toward the palm at each
// joint; the knuckles of the ring and little fingers sink as the hand closes (the palm's arch).
function handShape3D(side){
  const f = handFrame(side), wr = S.P[IX[side + "_wrist"]], k = handK(side), A = handAngles(side), FL = fingerLens();
  const at = v => add(wr, mul(add(add(mul(f.x, v[0]), mul(f.y, v[1])), mul(f.z, v[2])), k));
  const close = A.slice(1).reduce((s, g) => s + Math.max(0, Math.min(1, g[1] / 90)), 0) / 4;
  const pts = [wr];
  FINGERS.forEach((g, n) => {
    const a = A[n], b0 = Math.max(0, Math.min(1, a[1] / 90));
    const sp = deg((g.thumb ? g.spread : g.spread * (1 - 0.5 * b0)) + FINGER_SIDE[n] * a[0]);
    let d = add(mul(f.z, Math.cos(sp)), mul(f.y, Math.sin(sp)));
    if (g.palm) d = add(d, mul(f.x, g.palm));
    d = norm(d);
    // the way it bends: toward the palm (the thumb: toward the palm and across it)
    const toward = g.thumb ? norm(sub(mul(f.x, 0.75), mul(f.y, 0.65))) : f.x;
    let p = at(add(g.root, [g.arch * close, 0, 0])); pts.push(p);
    g.segs.forEach((L, s) => {
      const t = sub(toward, mul(d, dot(toward, d)));
      if (len(t) > 1e-6){ const b = deg(a[1 + s]); d = norm(add(mul(d, Math.cos(b)), mul(norm(t), Math.sin(b)))); }
      p = add(p, mul(d, L * FL[n] * k)); pts.push(p);
    });
  });
  return {pts, heel: [at([0.4, 2.0, 0.6]), at([0.4, -2.4, 0.9])], frame: f, k};
}
function handPoints3D(side){ return handShape3D(side).pts; }
function handPoints(side, W, H){
  return handPoints3D(side).map(p => { const q = project(p, W, H); return [q.x, q.y]; });
}
// a finger joint's place (j 0..2) and the axes it turns about: bend (+: toward the palm), spread
// (the root: +, as FINGER_SIDE says)
function fingerJoint(side, n, j){
  const sh = handShape3D(side), i = 1 + 4 * n + j, p = sh.pts[i], d = norm(sub(sh.pts[i + 1], p)), f = sh.frame;
  const toward = FINGERS[n].thumb ? norm(sub(mul(f.x, 0.75), mul(f.y, 0.65))) : f.x;
  let bendAx = cross(d, sub(toward, mul(d, dot(toward, d))));
  bendAx = len(bendAx) > 1e-6 ? norm(bendAx) : norm(cross(d, f.x));
  // spread: about the palm's normal, the way that turns z toward y (the thumb's side) for FINGER_SIDE +1
  const spreadAx = mul(norm(cross(f.z, f.y)), FINGER_SIDE[n]);
  return {p, d, bendAx, spreadAx, k: sh.k};
}

// ---- drawing ------------------------------------------------------------------------------------------
// the palm's outline (the heel on the little finger's side, the knuckles, the thumb's root, the heel on
// the thumb's side) and the fingers as lines; the fingers' joints as small circles in the editor while
// that hand is selected (opts.sel: its wrist or its hand)
const handActive = (side, i) => i === IX[side + "_wrist"] || i === IX[side + "_hand"];
const fingerSelOf = side => fingerSel && fingerSel.side === side && handActive(side, sel) ? fingerSel : null;
function drawHand(ctx, side, W, H, opts, ink, lw){
  const sh = handShape3D(side), P = [...sh.pts, ...sh.heel].map(p => project(p, W, H));
  const hu = 22, hr = 21;                                 // the heels' places in P
  ctx.strokeStyle = partColor(side + "_hand") || ink; ctx.lineWidth = lw * 0.9;
  const hw = IX[side + "_wrist"];
  ctx.setLineDash(S.hiddenDashed && hiddenAt(S.P[hw], W, H, skipJoint(hw)) ? [lw * 2.5, lw * 2] : []);
  const line = idx => { ctx.beginPath(); idx.forEach((i, m) => m ? ctx.lineTo(P[i].x, P[i].y) : ctx.moveTo(P[i].x, P[i].y)); ctx.stroke(); };
  line([hu, 17, 13, 9, 5, 1, hr, hu]);
  for (let n = 0; n < 5; n++){ const b = 1 + 4 * n; line([b, b + 1, b + 2, b + 3]); }
  ctx.setLineDash([]);
  if (opts.export || mode !== "pose" || !handActive(side, opts.sel)) return;
  const fs = fingerSelOf(side);
  for (let n = 0; n < 5; n++) for (let j = 0; j < 3; j++){
    const q = P[1 + 4 * n + j], r = Math.max(2.5 * lw * 0.6, 0.55 * sh.k * q.s), me = fs && fs.n === n && fs.j === j;
    ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, 2 * Math.PI);
    if (me){ ctx.fillStyle = cssVar("--sel"); ctx.fill(); }
    ctx.strokeStyle = me ? cssVar("--sel") : cssVar("--far"); ctx.lineWidth = Math.max(1, lw * 0.6); ctx.stroke();
  }
}
