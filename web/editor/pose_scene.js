// The scene around the figure (index.html, loaded after the editor's own script):
// floor / wall / ceiling and grounding, things held in the hand or both hands, chairs and rides
// the body is put on, things to grab (vines, branches, bars), and the wire of a wire action.
// Shapes come from pose_props.js. The editor calls drawScene() while drawing and
// sceneAfterEdit() after every edit (before the pins are held).
//
// S.items: {key, hand: "r" | "l" (held), base: [x, y, z], yaw (world / grab: where it was put),
//           off: [x, y, z] cm, rot: [x, y, z] degrees, scale: 1, where: "back" | "world" (carried on
//           the back / put down instead of held or worn), grounded (stays on the floor / a top),
//           color (its line colour), bayonet (on a rifle), dims (sizes of a simple solid)}
// S.env:   floor, floorY, ground ("off" | "nopen" | "stick"), wall, wallZ, wallX, wallYaw, ceiling,
//          ceilingY, show (draw floor / wall in the exported atari too)
// S.wire:  {on, joint, anchor: [x, y, z], length}
const PROPS_ = window.PROPS || {}, CATS_ = window.PROP_CATS || [];

// ---- frames ------------------------------------------------------------------------------------
function rotY(v, a){ const c = Math.cos(a), s = Math.sin(a); return [c*v[0] + s*v[2], v[1], -s*v[0] + c*v[2]]; }
// it.stretch [x, y, z] (サイズ, pose_size.js): each of the item's own axes stretched on its own,
// about the item's grip (a held thing's root stays, the tip moves). Older files have it.len (the
// long side) and it.thick (the other two): they count as the same.
function longAxis(it){
  const {lo, hi} = localExtent(partsOf(it)), e = [0, 1, 2].map(i => hi[i] - lo[i]);
  return e.indexOf(Math.max(...e));
}
function stretchOf(it){
  let st = Array.isArray(it.stretch) ? [0, 1, 2].map(i => +it.stretch[i] || 1) : null;
  if ((it.len && it.len !== 1) || (it.thick && it.thick !== 1)){
    const a = longAxis(it), old = [0, 1, 2].map(i => i === a ? it.len || 1 : it.thick || 1);
    st = st ? st.map((v, i) => v * old[i]) : old;
  }
  return st && st.some(v => v !== 1) ? st : null;
}
// it.segs {id: factor} (サイズ › 部位ごとの長さ): a prop's sections along one of its axes
// (def.segs: a sword's grip and blade, a gun's stock and barrel ...) each lengthened on its own. The
// axis is stretched piece by piece: inside a section by its factor, elsewhere not at all, about
// def.segAnchor (0: a held thing's fist), so what lies beyond a section moves along (the blade
// rides on a longer grip) and round parts keep their size. Points the prop names (grip, grip2,
// bayonet, mount, grab) go the same way.
const SEG_NAMES = {grip: ["柄", "Grip"], blade: ["刀身", "Blade"], head: ["頭", "Head"], stock: ["銃床", "Stock"],
  barrel: ["銃身", "Barrel"], claw: ["爪", "Claws"], tip: ["穂先", "Tip"], tube: ["筒", "Tube"]};
const SEG_AXES = {x: 0, y: 1, z: 2};
const segMemo = new WeakMap();
// def.segs as [{id, ja, en, lo, hi}] and the axis (an index); [id, from, to(, ja, en)] or {id, from, to, ja, en}
function segsOf(def){
  if (!def || !Array.isArray(def.segs) || !def.segs.length) return null;
  let s = segMemo.get(def);
  if (!s){
    const list = def.segs.map(g => Array.isArray(g) ? {id: g[0], from: g[1], to: g[2], ja: g[3], en: g[4]} : g)
      .map(g => { const n = SEG_NAMES[g.id] || [g.id, g.id]; return {id: String(g.id), ja: g.ja || n[0], en: g.en || g.ja || n[1],
        lo: Math.min(+g.from, +g.to), hi: Math.max(+g.from, +g.to)}; });
    s = {axis: SEG_AXES[def.segAxis] !== undefined ? SEG_AXES[def.segAxis] : 1, anchor: +def.segAnchor || 0, list};
    segMemo.set(def, s);
  }
  return s;
}
// the axis's new place for t, or null when no section is changed
function segMap(it){
  const sg = segsOf(PROPS_[it.key]); if (!sg || !it.segs) return null;
  const k = sg.list.map(g => Math.max(0.05, +it.segs[g.id] || 1));
  if (k.every(v => v === 1)) return null;
  const t0 = sg.anchor;
  return t => { let out = t;                   // t + the extra length of each section between t0 and t
    sg.list.forEach((g, i) => { const a = Math.max(g.lo, Math.min(t0, t)), b = Math.min(g.hi, Math.max(t0, t));
      if (b > a) out += (k[i] - 1) * (b - a) * (t >= t0 ? 1 : -1); });
    return out; };
}
function segPoint(it, p){
  const m = segMap(it); if (!m || !p) return p;
  const a = segsOf(PROPS_[it.key]).axis, q = p.slice(); q[a] = m(p[a]); return q;
}
function segParts(it, parts){
  const m = segMap(it); if (!m) return parts;
  const a = segsOf(PROPS_[it.key]).axis, P = (arr, at) => { const q = arr.slice(); q[at + a] = m(arr[at + a]); return q; };
  return parts.map(sh => {
    if (sh.c) return {c: P(P(sh.c, 0), 3)};
    if (sh.k) return {k: P(P(sh.k, 0), 3)};
    if (sh.b){ const q = sh.b.slice(), lo = m(q[a] - q[3 + a] / 2), hi = m(q[a] + q[3 + a] / 2);
      q[a] = (lo + hi) / 2; q[3 + a] = hi - lo; return {b: q}; }
    for (const t of ["s", "d", "t", "h"]) if (sh[t]) return {[t]: P(sh[t], 0)};
    if (sh.l) return {l: sh.l.map(q => P(q, 0))};
    return sh;
  });
}
// a section's length now (cm, before the item's own size) and as made
function segLength(it, id){
  const sg = segsOf(PROPS_[it.key]), g = sg && sg.list.find(x => x.id === id); if (!g) return null;
  return {base: g.hi - g.lo, now: (g.hi - g.lo) * Math.max(0.05, +(it.segs || {})[id] || 1)};
}
// the section a shape (as drawn, sections lengthened) lies in, by its middle along the axis
let segSel = "";                              // the section chosen in サイズ (of the selected thing), drawn heavier
function segOfShape(it, sh){
  const sg = segsOf(PROPS_[it.key]); if (!sg) return null;
  const pts = shapePoints(sh); if (!pts.length) return null;
  const m = segMap(it) || (t => t), t = pts.reduce((v, [q]) => v + q[sg.axis], 0) / pts.length;
  const g = sg.list.find(x => t >= m(x.lo) - 0.01 && t <= m(x.hi) + 0.01);
  return g ? g.id : null;
}
function foldStretch(it){ it.stretch = stretchOf(it) || [1, 1, 1]; delete it.len; delete it.thick; return it.stretch; }
// a thing's size in cm (the panels show cm, the file keeps scale and stretch): itemBase is its own
// X, Y, Z length before its size and stretch (dims and sections in), itemCm as it is now
function itemBase(it){ const {lo, hi} = localExtent(partsOf(it)); return [0, 1, 2].map(i => Math.max(0.1, hi[i] - lo[i])); }
function itemCm(it){ const b = itemBase(it), st = stretchOf(it) || [1, 1, 1], k = it.scale || 1; return b.map((v, i) => v * k * st[i]); }
function setItemCm(it, a, v){ if (!(v > 0)) return; const b = itemBase(it); foldStretch(it)[a] = Math.max(0.2, v / (b[a] * (it.scale || 1))); }
const itemLongCm = it => Math.max(...itemCm(it));
function setItemLongCm(it, v){ if (!(v > 0)) return; it.scale = Math.max(0.2, (it.scale || 1) * v / itemLongCm(it)); }
// a round part's radius under a stretch: the mean of the axes across its own axis d (a cylinder's,
// a disc's normal); a ball (no d) the mean of all three
function radK(it, d){
  const st = stretchOf(it); if (!st) return 1;
  if (!d) return (st[0] + st[1] + st[2]) / 3;
  const l = len(d) || 1, w = d.map(v => 1 - (v / l) ** 2), sw = w[0] + w[1] + w[2] || 1;
  return (st[0] * w[0] + st[1] * w[1] + st[2] * w[2]) / sw;
}
// a held thing's own grip point, which goes on the hand's (gripFrame, by the hand's shape): its
// origin for handles (swords, guns, ...); for things held in a cupped hand the middle of its side
// toward the palm; for things pinched the bit nearest its origin (across a thin part: its middle)
const heldInHand = it => !it.where && (PROPS_[it.key] || {}).place === "hand";
const gripMemo = new Map();
function gripBase(it){
  const def = PROPS_[it.key] || {};
  if (def.grip) return segPoint(it, def.grip);
  if (def.pose !== "cup" && def.pose !== "pinch") return [0, 0, 0];
  const key = it.key + "|" + (it.dims || "") + "|" + !!it.bayonet + "|" + JSON.stringify(it.segs || {});
  let g = gripMemo.get(key);
  if (!g){
    const {lo, hi} = localExtent(partsOf(it)), mid = i => (lo[i] + hi[i]) / 2;
    g = def.pose === "cup" ? [lo[0], mid(1), mid(2)]
      : [0, 1, 2].map(i => hi[i] - lo[i] < 9 ? mid(i) : Math.max(lo[i], Math.min(hi[i], 0)));
    gripMemo.set(key, g);
  }
  return g;
}
// the point the hand holds: the item's own grip, moved along its long axis by 持つ位置 (it.gripAt, cm)
function gripPoint(it){
  const base = gripBase(it).slice();
  if (!it.gripAt) return base;
  base[longAxis(it)] += +it.gripAt;
  return base;
}
// 持ち方 of a held thing: "grip" or "couch" (it.hold; else the item's own default, def.couch)
function holdOf(it){ const d = PROPS_[it.key] || {}; return it.hold || (d.couch ? "couch" : "grip"); }
// the holding arm to the default place for a grip: out in front of the chest, at shoulder height
function gripHold(side){
  const s = side === "l" ? "l" : "r", wi = IX[s + "_wrist"], cf = chestFrame(), sx = s === "l" ? 1 : -1;
  reachWith(wi, add(add(cf.o, mul(bodyFront(), 28)), add(mul(cf.x, sx * 14), [0, -8, 0])), false);
}
// change the 持ち方 of a held thing; the arm moves only when the way of holding changes
function setHold(it, mode){
  const was = holdOf(it);
  freeHands(it); it.hold = mode;
  if (mode === "couch") it.both = false; else delete it.both;
  holdHands(it);
  if (holdOf(it) !== was) (mode === "couch" ? couchHold : gripHold)(it.hand);
}
// back to the item's own defaults: the grip, the place on it, the way of holding
function resetGrip(it){
  const was = holdOf(it);
  freeHands(it); delete it.gripAt; delete it.hold; delete it.both;
  if (holdOf(it) === "couch") it.both = false;
  holdHands(it);
  if (holdOf(it) !== was) (holdOf(it) === "couch" ? couchHold : gripHold)(it.hand);
}
function itemLocal(it, p, k = 1){             // the item's own size and turn, before its frame
  if (heldInHand(it)) p = sub(p, gripPoint(it));
  let q = mul(p, (it.scale || 1) * k);
  const st = stretchOf(it); if (st) q = [q[0] * st[0], q[1] * st[1], q[2] * st[2]];
  const r = it.rot || [0, 0, 0];
  q = rotAxis(q, [0, 0, 1], deg(r[2])); q = rotAxis(q, [1, 0, 0], deg(r[0])); q = rotAxis(q, [0, 1, 0], deg(r[1]));
  return add(q, it.off || [0, 0, 0]);
}
// handFrame(side): the hand's frame, in pose_main.js (the fingers are drawn from it too)
function chestFrame(){
  const P = S.P, x = norm(sub(P[IX.l_shoulder], P[IX.r_shoulder]));
  let y = sub(P[IX.neck], P[IX.waist]); y = norm(sub(y, mul(x, dot(y, x))));
  return {o: P[IX.chest], x, y, z: cross(x, y)};
}
function waistFrame(){
  const P = S.P, x = norm(sub(P[IX.l_hip], P[IX.r_hip]));
  let y = sub(P[IX.waist], P[IX.pelvis]); y = norm(sub(y, mul(x, dot(y, x))));
  return {o: P[IX.pelvis], x, y, z: cross(x, y)};
}
// a foot: origin the ankle, z toward the toe along the sole, y up from the sole, x outward
const SOLE_TILT = Math.atan2(7, 13);          // the rest foot: the toe is 7 cm below the ankle, 13 cm ahead
function footFrame(side){
  const a = S.P[IX[side + "_ankle"]], z0 = norm(sub(S.P[IX[side + "_toe"]], a));
  let y0 = sub(S.P[IX[side + "_knee"]], a); y0 = sub(y0, mul(z0, dot(y0, z0)));
  y0 = len(y0) > 1e-6 ? norm(y0) : [0, 1, 0];
  const c = Math.cos(SOLE_TILT), s = Math.sin(SOLE_TILT);
  const z = add(mul(z0, c), mul(y0, s)), y = sub(mul(y0, c), mul(z0, s));
  return {o: a, x: mul(cross(y, z), side === "r" ? -1 : 1), y, z};
}
// things worn: the head in units of its radius, the chest / back, the waist, the feet, the hands
function wearFrame(at){
  if (at === "head"){ const h = headFrame(); return {o: S.P[IX.head], x: h.side, y: h.up, z: h.fwd, k: h.r}; }
  if (at === "waist") return waistFrame();
  if (at === "r_foot" || at === "l_foot") return footFrame(at[0]);
  if (at === "r_hand" || at === "l_hand") return handFrame(at[0]);
  return chestFrame();
}
function worldFrame(it, k = 1, dx = 0){
  const a = deg(it.yaw || 0);
  return {o: add(it.base || [0, 0, 0], rotY([dx, 0, 0], a)), x: rotY([1, 0, 0], a), y: [0, 1, 0], z: rotY([0, 0, 1], a), k};
}
const itemDims = it => { const d = PROPS_[it.key] || {}; return (d.dims || []).map(([, v], i) => (it.dims && +it.dims[i]) || v); };
function partsOf(it){                         // the shapes, with a simple solid's sizes and a bayonet
  const def = PROPS_[it.key] || {}, parts = segParts(it, def.make ? def.make(itemDims(it)) : def.parts || []);
  if (!(it.bayonet && def.bayonet)) return parts;
  const [x, y, z] = segPoint(it, def.bayonet);
  return [...parts, {t: [x, y, z - 3, 0, 0, 1, 1.6, 0.4]}, {b: [x, y - 1.2, z + 12, 0.5, 2.6, 24]},
          {k: [x, y - 1.2, z + 24, x, y - 1.2, z + 31, 1.3]}];
}
// every place an item is drawn: [{f: frame, parts}] (a pair of skates is two)
function partSets(it){
  const def = PROPS_[it.key] || {};
  const sets = (def.sets ? def.sets.map(([at, parts]) => [at, segParts(it, parts)]) : [[def.at, partsOf(it)]]).flatMap(([at, parts]) =>
    at === "feet" ? [["r_foot", parts], ["l_foot", parts]] : at === "hands" ? [["r_hand", parts], ["l_hand", parts]] : [[at, parts]]);
  if (it.where === "world"){
    const k = def.at === "head" ? S.R[IX.head] : 1;
    return sets.map(([, parts], i) => ({f: worldFrame(it, k, (i - (sets.length - 1) / 2) * 30), parts}));
  }
  if (it.where === "back") return [{f: backFrame(it), parts: sets[0][1]}];
  if (def.place === "wear") return sets.map(([at, parts]) => ({f: wearFrame(at), parts}));
  const f = def.place === "hand" ? gripFrame(it.hand || "r") : def.place === "body" ? chestFrame() : worldFrame(it);
  return [{f, parts: sets[0][1]}];
}
function frameOf(it){ return partSets(it)[0].f; }
const inFrame = (f, p) => add(f.o, add(add(mul(f.x, p[0]), mul(f.y, p[1])), mul(f.z, p[2])));
function itemToWorld(it, p, f){ f = f || frameOf(it); return inFrame(f, itemLocal(it, p, f.k || 1)); }
// a few points (with a radius) of a shape in its own axes, for its extent
function shapePoints(sh){
  if (sh.c) return [[sh.c.slice(0, 3), sh.c[6]], [sh.c.slice(3, 6), sh.c[6]]];
  if (sh.b){ const [cx, cy, cz, sx, sy, sz] = sh.b; return [[[cx - sx/2, cy - sy/2, cz - sz/2], 0], [[cx + sx/2, cy + sy/2, cz + sz/2], 0]]; }
  if (sh.s) return [[sh.s.slice(0, 3), sh.s[3]]];
  if (sh.d || sh.h) return [[(sh.d || sh.h).slice(0, 3), (sh.d || sh.h)[6]]];
  if (sh.k) return [[sh.k.slice(0, 3), sh.k[6]], [sh.k.slice(3, 6), 0]];
  if (sh.t) return [[sh.t.slice(0, 3), sh.t[6] + sh.t[7]]];
  if (sh.l) return sh.l.map(q => [q, 0]);
  return [];
}
function localExtent(parts){
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (const sh of parts) for (const [q, r] of shapePoints(sh))
    for (let i = 0; i < 3; i++){ lo[i] = Math.min(lo[i], q[i] - r); hi[i] = Math.max(hi[i], q[i] + r); }
  return {lo, hi};
}
// carried on the back: the long side slants from the right hip up to the left shoulder, flat on the
// back. A second thing on the back slants the other way (two swords as an X), a little further out;
// a third and more take turns, each further out again
function backFrame(it){
  const def = PROPS_[it.key] || {}, cf = chestFrame(), out = mul(cf.z, -1);
  const k = Math.max(0, (S.items || []).filter(o => o.where === "back" && (PROPS_[o.key] || {}).place !== "body").indexOf(it));
  const slant = v => rotAxis(v, out, deg(k % 2 ? 28 : -28));
  const lift = 3 * k;
  if (def.place === "body") return {o: add(cf.o, mul(out, 26)), x: slant(mul(cf.x, -1)), y: slant(cf.y), z: out};
  const {lo, hi} = localExtent(partsOf(it)), sc = it.scale || 1;
  const ext = [0, 1, 2].map(i => hi[i] - lo[i]), mid = [0, 1, 2].map(i => (hi[i] + lo[i]) / 2 * sc);
  const d = slant(cf.y), x = out;
  let y, z;
  if (ext[1] >= ext[2]){ y = d; z = cross(x, y); } else { z = d; y = cross(z, x); }
  // on the back, just off the spine (the chest's half depth), its middle level with the chest
  const centre = add(cf.o, add(mul(out, 9 + lift + ext[0] * sc / 2), mul(cf.y, 0)));
  return {o: sub(centre, add(add(mul(x, mid[0]), mul(y, mid[1])), mul(z, mid[2]))), x, y, z};
}
const dirToWorld = (f, it, v) => { const a = itemToWorld(it, [0, 0, 0], f), b = itemToWorld(it, v, f); return sub(b, a); };

// ---- drawing -----------------------------------------------------------------------------------
function circle3(c, n, r, k = 24){            // points of a circle about the normal n
  const nn = norm(n), ref = Math.abs(nn[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const u = norm(cross(nn, ref)), v = cross(nn, u), out = [];
  for (let i = 0; i <= k; i++){ const t = 2 * Math.PI * i / k;
    out.push(add(c, add(mul(u, r * Math.cos(t)), mul(v, r * Math.sin(t))))); }
  return out;
}
function drawShape(ctx, sh, it, f, P, lw){
  const W2 = q => itemToWorld(it, q, f), k = (it.scale || 1) * (f.k || 1);
  const line = pts => {
    if (S.hiddenDashed && typeof strokeSeen === "function" && !sceneSide){      // dashed where a body or a solid hides it
      const W = ctx.canvas.width, H = ctx.canvas.height;
      for (let i = 1; i < pts.length; i++) strokeSeen(ctx, pts[i - 1], pts[i], W, H, null, (q) => P(q));
      return;
    }
    ctx.beginPath(); pts.forEach((q, i) => { const s = P(q); i ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y); }); ctx.stroke(); };
  if (sh.c){
    const [x1, y1, z1, x2, y2, z2, r0] = sh.c, a = W2([x1, y1, z1]), b = W2([x2, y2, z2]), r = r0 * k * radK(it, [x2 - x1, y2 - y1, z2 - z1]);
    const pa = P(a), pb = P(b), wpx = 2 * r * Math.max(pa.s, pb.s);
    if (wpx < lw * 3){ ctx.save(); ctx.lineWidth = Math.max(lw, wpx); line([a, b]); ctx.restore(); return; }
    const ax = sub(b, a);
    let dx = pb.x - pa.x, dy = pb.y - pa.y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    for (const sgn of [1, -1]){ ctx.beginPath();
      ctx.moveTo(pa.x - dy * r * pa.s * sgn, pa.y + dx * r * pa.s * sgn);
      ctx.lineTo(pb.x - dy * r * pb.s * sgn, pb.y + dx * r * pb.s * sgn); ctx.stroke(); }
    line(circle3(a, ax, r)); line(circle3(b, ax, r));
  } else if (sh.b){
    const [cx, cy, cz, sx, sy, sz] = sh.b, h = [sx / 2, sy / 2, sz / 2];
    const V = [];
    for (const i of [-1, 1]) for (const j of [-1, 1]) for (const l of [-1, 1]) V.push(W2([cx + i*h[0], cy + j*h[1], cz + l*h[2]]));
    for (const [a, b] of [[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]]) line([V[a], V[b]]);
  } else if (sh.s){
    const [cx, cy, cz, r] = sh.s, c = P(W2([cx, cy, cz]));
    ctx.beginPath(); ctx.arc(c.x, c.y, Math.max(1, r * k * radK(it) * c.s), 0, 2 * Math.PI); ctx.stroke();
  } else if (sh.d){
    const [cx, cy, cz, nx, ny, nz, r] = sh.d, c = W2([cx, cy, cz]);
    line(circle3(c, dirToWorld(f, it, [nx, ny, nz]), r * k * radK(it, [nx, ny, nz])));
  } else if (sh.k){
    const [bx, by, bz, ax, ay, az, r] = sh.k, b = W2([bx, by, bz]), apex = W2([ax, ay, az]);
    const ring = circle3(b, sub(apex, b), r * k * radK(it, [ax - bx, ay - by, az - bz])), pa = P(apex), pr = ring.map(P);
    line(ring);
    let lo = 0, hi = 0, vlo = 1e9, vhi = -1e9;
    const pc = P(b), ux = pc.x - pa.x, uy = pc.y - pa.y;
    pr.forEach((q, i) => { const v = ux * (q.y - pa.y) - uy * (q.x - pa.x); if (v < vlo){ vlo = v; lo = i; } if (v > vhi){ vhi = v; hi = i; } });
    for (const i of [lo, hi]){ ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pr[i].x, pr[i].y); ctx.stroke(); }
  } else if (sh.t){
    const [cx, cy, cz, nx, ny, nz, R, r] = sh.t, c = W2([cx, cy, cz]), n = dirToWorld(f, it, [nx, ny, nz]);
    const rk = k * radK(it, [nx, ny, nz]);
    ctx.save(); ctx.lineWidth = Math.max(lw, 2 * r * rk * P(c).s * 0.8); line(circle3(c, n, R * rk)); ctx.restore();
  } else if (sh.h){                           // a dome: its rim and two arcs over the top
    const [cx, cy, cz, nx, ny, nz, r0] = sh.h, c = W2([cx, cy, cz]), n = norm(dirToWorld(f, it, [nx, ny, nz])), r = r0 * k * radK(it, [nx, ny, nz]);
    line(circle3(c, n, r));
    const u = norm(cross(n, Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])), v = cross(n, u);
    for (const w of [u, v]) line([...Array(17)].map((_, i) => { const t = Math.PI * i / 16;
      return add(c, add(mul(w, r * Math.cos(t)), mul(n, r * Math.sin(t)))); }));
  } else if (sh.l) line(sh.l.map(W2));
}
// points of an item in the world (for putting it on the floor and for grabbing it with the mouse)
function worldSamples(it){
  const out = [];
  for (const {f, parts} of partSets(it)){
    const k = (it.scale || 1) * (f.k || 1), W2 = q => itemToWorld(it, q, f);
    for (const sh of parts){
      if (sh.c){ const a = W2(sh.c.slice(0, 3)), b = W2(sh.c.slice(3, 6)), ax = sub(b, a), r = sh.c[6] * k * radK(it, sub(sh.c.slice(3, 6), sh.c.slice(0, 3)));
        out.push(...circle3(a, ax, r, 8), ...circle3(b, ax, r, 8)); }
      else if (sh.b){ const [cx, cy, cz, sx, sy, sz] = sh.b;
        for (const i of [-1, 1]) for (const j of [-1, 1]) for (const l of [-1, 1]) out.push(W2([cx + i*sx/2, cy + j*sy/2, cz + l*sz/2])); }
      else if (sh.s){ const c = W2(sh.s.slice(0, 3)), r = sh.s[3] * k * radK(it);
        for (const d of [[0, -r, 0], [0, r, 0], [r, 0, 0], [-r, 0, 0], [0, 0, r], [0, 0, -r]]) out.push(add(c, d)); }
      else if (sh.d || sh.h || sh.t){ const a = sh.d || sh.h || sh.t, c = W2(a.slice(0, 3)), n = dirToWorld(f, it, a.slice(3, 6));
        const r = (sh.t ? a[6] + a[7] : a[6]) * k * radK(it, a.slice(3, 6)); out.push(...circle3(c, n, r, 12)); if (sh.h) out.push(add(c, mul(norm(n), r))); }
      else if (sh.k){ const b = W2(sh.k.slice(0, 3)), ap = W2(sh.k.slice(3, 6)); out.push(...circle3(b, sub(ap, b), sh.k[6] * k * radK(it, sub(sh.k.slice(3, 6), sh.k.slice(0, 3))), 12), ap); }
      else if (sh.l) out.push(...sh.l.map(W2));
    }
  }
  return out;
}
// floor / wall / ceiling as 3D line segments [a, b, which]. The floor's and the ceiling's grids reach far
// (to 8 m round the figure) and turn with the perspective ruler while it shows (gridAxes, pose_ruler.js)
function envLines(){
  const E = S.env || {}, c = S.P[IX.pelvis], out = [];
  const [u, w] = typeof gridAxes === "function" ? gridAxes() : [[1, 0, 0], [0, 0, 1]];
  const grid = (y, which, n = 20, step = 40) => {
    const cu = Math.round(dot(c, u) / step) * step, cw = Math.round(dot(c, w) / step) * step;
    const at = (a, b) => add(add(mul(u, a), mul(w, b)), [0, y, 0]);
    for (let i = -n; i <= n; i++){
      out.push([at(cu + i*step, cw - n*step), at(cu + i*step, cw + n*step), which]);
      out.push([at(cu - n*step, cw + i*step), at(cu + n*step, cw + i*step), which]);
    }
  };
  if (E.floor) grid(+E.floorY || 0, "floor");
  if (E.ceiling) grid(+E.ceilingY || 230, "ceiling", 12);
  if (E.wall){
    const a = deg(+E.wallYaw || 0), o = [+E.wallX || 0, 0, +E.wallZ || -40], y0 = +E.floorY || 0;
    const at = (u, h) => add(o, add(rotY([u, 0, 0], a), [0, y0 + h, 0]));
    for (let u = -150; u <= 150; u += 50) out.push([at(u, 0), at(u, 250), "wall"]);
    for (let h = 0; h <= 250; h += 50) out.push([at(-150, h), at(150, h), "wall"]);
  }
  return out;
}
let sceneSide = false;                        // drawing the side view (no hidden lines there)
function drawScene(ctx, W, H, opts, proj, ink, far, lw){
  sceneSide = !!opts.side;
  const P = q => proj(q, W, H), E = S.env || {};
  ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
  if (!opts.noEnv && (!opts.export || E.show || opts.showEnv)){
    // each surface its own colour (S.colors.floor / wall / ceiling), else the one for all (env)
    const C = S.colors || {}, base = opts.export ? "#b0b0b0" : far;
    ctx.lineWidth = Math.max(1, lw * 0.6);
    ctx.globalAlpha = opts.export ? 1 : 0.55;
    // the camera's view: a line reaching behind the camera is cut just before it (it would cross the picture)
    const D = proj === project ? camDist(W, H) : 0, NEAR = 5, depth = v => D - toCam(v)[2];
    for (let [a, b, which] of envLines()){
      if (D){ const da = depth(a), db = depth(b); if (da < NEAR && db < NEAR) continue;
        if (da < NEAR) a = add(a, mul(sub(b, a), (NEAR - da) / (db - da))); else if (db < NEAR) b = add(b, mul(sub(a, b), (NEAR - db) / (da - db))); }
      const p = P(a), q = P(b); ctx.strokeStyle = C[which] || C.env || base;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  // the wire
  const w = S.wire;
  if (w && w.on && w.anchor){
    const hold = S.P[wireJoint(w)], a = P(w.anchor), b = P(hold);
    ctx.strokeStyle = (S.colors && S.colors.wire) || ink;
    if (w.joint === "rope"){                    // a rope: solid, on past the hands
      const e = P(add(hold, mul(norm(sub(hold, w.anchor)), ROPE_GAP + 70)));
      ctx.lineWidth = lw * 1.6; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(e.x, e.y); ctx.stroke();
    } else {
      ctx.lineWidth = lw; ctx.setLineDash([lw * 4, lw * 3]);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(a.x, a.y, lw * 3, 0, 2 * Math.PI); ctx.stroke();
  }
  // the things: their own colour (or an effect's), glowing effects drawn twice
  if (!opts.noItems) (S.items || []).forEach((it, n) => {
    const def = PROPS_[it.key]; if (!def) return;
    const col = it.color || def.color, sets = partSets(it);
    const picked = n === scSel || (mode === "place" && typeof objPicked === "function" && objPicked("i" + n));
    const stroke = opts.export ? col || ink : picked ? cssVar("--sel") : col || cssVar("--accent");
    for (const glow of def.glow ? [true, false] : [false]){
      ctx.strokeStyle = stroke; ctx.globalAlpha = glow ? 0.22 : 1;
      ctx.lineWidth = lw * (opts.side ? 0.9 : 1.1) * (glow ? 5 : 1);
      const lw0 = ctx.lineWidth, chosen = !opts.export && n === scSel && segSel;
      for (const {f, parts} of sets) for (const sh of parts){
        ctx.lineWidth = chosen && segOfShape(it, sh) === segSel ? lw0 * 2.4 : lw0;
        drawShape(ctx, sh, it, f, P, lw * (glow ? 5 : 1));
      }
    }
    ctx.globalAlpha = 1;
  });
  ctx.restore();
}

// ---- simulation after each edit ---------------------------------------------------------------
const CONTACT = {pelvis: 14, waist: 11, chest: 12, neck: 5, head: 11, r_shoulder: 6, l_shoulder: 6,
  r_elbow: 4, l_elbow: 4, r_wrist: 3, l_wrist: 3, r_hip: 10, l_hip: 10, r_knee: 5, l_knee: 5,
  r_ankle: 7, l_ankle: 7, r_toe: 2, l_toe: 2, r_hand: 3, l_hand: 3};
function lowest(){ let m = 1e9; J.forEach((n, i) => { m = Math.min(m, S.P[i][1] - (CONTACT[n] || 3)); }); return m; }
function moveAll(d, view){                    // view: the camera follows (for the buttons)
  S.P = S.P.map(q => add(q, d));
  if (view) S.center = add(S.center, d);
}
function wristTarget(side, grip){             // where the wrist goes so the fist's middle is at grip
  const el = S.P[IX[side + "_elbow"]];
  return add(grip, mul(norm(sub(grip, el)), -7));
}
// before IK, bend the knee forward, so the two-bone IK does not keep a backward bend that a big
// move of the body left behind (arms keep their own bend: the joint limits judge those)
function preBend(i, target){
  if (!/ankle/.test(J[i])) return;
  const mid = PARENT[i], root = PARENT[mid], r = S.P[root], L1 = len(sub(S.P[mid], r));
  rotateSubtree(mid, add(r, mul(norm(add(norm(sub(target, r)), mul(bodyFront(), 0.8))), L1)));
}
function reachWith(i, target, pull){          // IK; when out of reach, optionally bring the body
  const root = PARENT[PARENT[i]], L = len(sub(S.P[PARENT[i]], S.P[root])) + len(sub(S.P[i], S.P[PARENT[i]]));
  const d = sub(target, S.P[root]), dl = len(d);
  if (pull && dl > L * 0.98) moveAll(mul(norm(d), dl - L * 0.97), true);
  preBend(i, target); solveIK(i, target);
  return dl <= L * 0.98 || pull;
}
// the other hand of a two-handed thing: its fist's middle on grip2, the hand pointing across the
// handle, and turned about its length so its knuckle line lies along the handle (the thumb the same
// way as the holding hand's). The handle runs along the thing's y (swords, poles), or its z when
// grip2 lies ahead (guns: the hand under the barrel).
function aimOtherHand(side, it, g){
  const def = PROPS_[it.key], wi = IX[side + "_wrist"], hi = IX[side + "_hand"], f = frameOf(it);
  const [gx, gy, gz] = def.grip2.map(Math.abs);
  const a = norm(dirToWorld(f, it, gz > gy && gz > gx ? [0, 0, 1] : [0, 1, 0]));
  let d = sub(g, S.P[IX[side + "_elbow"]]); d = sub(d, mul(a, dot(d, a)));
  const z = len(d) > 1e-3 ? norm(d) : norm(sub(g, S.P[IX[side + "_elbow"]]));
  const t = sub(g, mul(z, 7));                 // first the hand's middle on it, then its grip point (gripFrame)
  solveIK(wi, t); solveIK(wi, t);
  const wr = S.P[wi];
  if (hi !== undefined && S.P[hi]) rotateSubtree(hi, add(wr, mul(norm(sub(g, wr)), len(sub(S.P[hi], wr)))));
  if (hi === undefined) return;
  const score = v => { S.twist[hi] = v; return dot(handFrame(side).y, a); };
  let best = 0, bs = -2;
  for (let v = -180; v < 180; v += 10){ const s = score(v); if (s > bs){ bs = s; best = v; } }
  for (let v = best - 9; v <= best + 9; v++){ const s = score(v); if (s > bs){ bs = s; best = v; } }
  S.twist[hi] = ((best + 540) % 360) - 180;
  for (let n = 0; n < 2; n++){                 // the hand's grip point (by its shape) onto grip2
    const d = sub(S.P[hi], S.P[wi]), w = add(S.P[wi], sub(g, gripFrame(side).o));
    solveIK(wi, w); rotateSubtree(hi, add(S.P[wi], d));
  }
}
// a two-handed thing keeps the way it points while its holding hand moves (no swinging about that
// hand): when only the hand moved, the thing's own turn is set back so the line from its grip to the
// other hand's grip keeps the direction it had; the other hand then follows along it. A turn made by
// the user (it.rot changed) sets the way anew instead.
const STAB = new WeakMap();
function stabilize(it){
  const def = PROPS_[it.key], main = it.hand === "l" ? "l" : "r", wr = S.P[IX[main + "_wrist"]];
  const dirNow = () => norm(sub(itemToWorld(it, segPoint(it, def.grip2)), itemToWorld(it, gripPoint(it))));
  const st = STAB.get(it), rotKey = JSON.stringify(it.rot || [0, 0, 0]);
  if (st && st.rot === rotKey && st.side === main && len(sub(wr, st.wrist)) > 0.05){
    const cost = () => 1 - dot(dirNow(), st.dir);
    let c = cost();
    for (let iter = 0; iter < 10 && c > 1e-4; iter++){
      let better = false;
      for (const ax of [0, 1, 2]) for (const dd of [6, -6, 1.5, -1.5]){
        it.rot = it.rot || [0, 0, 0];
        const old = it.rot[ax]; it.rot[ax] = old + dd;
        const c2 = cost();
        if (c2 < c - 1e-9){ c = c2; better = true; } else it.rot[ax] = old;
      }
      if (!better) break;
    }
  }
  STAB.set(it, {dir: dirNow(), rot: JSON.stringify(it.rot || [0, 0, 0]), side: main, wrist: wr.slice()});
}
function followItems(moved){
  for (const it of S.items || []){
    const def = PROPS_[it.key]; if (!def || it.where) continue;
    if (def.place === "hand" && def.grip2 && it.both !== false){
      const main = it.hand === "l" ? "l" : "r", other = main === "r" ? "l" : "r", wi = IX[other + "_wrist"];
      if (S.pins && S.pins[wi]) continue;
      // out of the other arm's reach (a thing held at the side): the holding hand comes in until
      // the other one reaches its grip
      const mw = IX[main + "_wrist"], sh = IX[other + "_shoulder"];
      const arm = len(sub(S.P[IX[other + "_elbow"]], S.P[sh])) + len(sub(S.P[wi], S.P[IX[other + "_elbow"]]));
      for (let k = 0; k < 8 && !(S.pins && S.pins[mw]); k++){
        const g = itemToWorld(it, segPoint(it, def.grip2)), d = sub(g, S.P[sh]);
        if (len(d) <= arm * 0.92) break;
        const want = add(S.P[sh], mul(norm(d), arm * 0.85));
        solveIK(mw, add(S.P[mw], sub(want, g)));
      }
      stabilize(it);
      aimOtherHand(other, it, itemToWorld(it, segPoint(it, def.grip2)));
    }
    if (def.place === "body" && def.mount){
      const f = chestFrame();
      for (const [jn, p] of Object.entries(def.mount)){
        const wi = IX[jn]; if (wi === undefined || (S.pins && S.pins[wi])) continue;
        solveIK(wi, itemToWorld(it, segPoint(it, p), f));
      }
    }
  }
}
function sceneAfterEdit(moved){
  if (!S.items) S.items = [];
  if (!S.env) S.env = fresh().env;
  followItems(moved);
  const w = S.wire;
  if (w && w.on && w.anchor){
    const ji = wireJoint(w), d = sub(S.P[ji], w.anchor);
    if (len(d) > w.length) moveAll(sub(add(w.anchor, mul(norm(d), w.length)), S.P[ji]));
    if (w.joint === "rope") ropeHands();
  }
  const E = S.env;
  // 配置: the hips moved near a face (a wall, a ceiling, a slope, a solid's side): the figure stands on it
  if (moved === IX.pelvis && mode === "place" && E.attach !== false && !(w && w.on)) attachNear();
  if (S.stand && !(w && w.on)) onPlane(S.stand.p, S.stand.n);       // stays on the face it stands on
  else if (E.ground && E.ground !== "off" && !(w && w.on)){
    const lift = groundLift(E.ground === "stick");
    if (lift) moveAll([0, lift, 0]);
  }
}
// grounding on the floor and on the tops of solids (pose_solids.js): a joint stands on the highest
// floor / top under it that is at most STEP_UP above its lowest point (higher ones are walls to it)
const STEP_UP = 40;
function supportUnder(p, bottom){
  const E = S.env || {};
  let s = E.floor ? +E.floorY || 0 : -Infinity;
  if (typeof solidTopsAt === "function") for (const t of solidTopsAt(p)) if (t <= bottom + STEP_UP) s = Math.max(s, t);
  return s;
}
function groundLift(stick){                   // how far to move the figure up (+) or down (-)
  let gap = Infinity;
  J.forEach((n, i) => { const b = S.P[i][1] - (CONTACT[n] || 3); gap = Math.min(gap, b - supportUnder(S.P[i], b)); });
  if (!isFinite(gap)) return 0;
  return stick ? -gap : Math.max(0, -gap);
}

// ---- standing on any face: the floor, a wall, the ceiling, a solid's face (a slope too) ----------------
// The whole figure turns about its hips so its up is the face's outward normal (on a wall it stands
// sideways, on a ceiling upside down), its lowest point toward the face on it: a sole, or as posed a knee,
// a hand, the head. S.stand = {p, n}: the plane of the face (any but the scene's floor, whose grounding
// is the 接地 setting's), which the figure then keeps to instead of the grounding: its lowest point stays
// on it however it is posed.
const ATTACH_CM = 15;
const figUp = () => norm(bodyRot([0, 1, 0]));
function soleAlong(n){ let m = Infinity; J.forEach((nm, i) => { m = Math.min(m, dot(S.P[i], n) - (CONTACT[nm] || 3)); }); return m; }
function turnFigureUp(n){                      // its facing kept as far as can be; false: it already was
  const up = figUp(), ax = cross(up, n), s = len(ax), c = dot(up, n);
  if (s < 1e-6 && c > 0) return false;
  const axis = s < 1e-6 ? bodyRot([0, 0, 1]) : ax, ang = Math.atan2(s, c), pv = S.P[IX.pelvis].slice();
  S.P = S.P.map(q => add(pv, rotAxis(sub(q, pv), axis, ang)));
  turnBody(axis, ang); S.pins = {};
  return true;
}
// the body's lowest point toward a face (n: the face's normal): whatever the pose puts there (a sole, a
// knee, a hand, the head ...), at its circle's edge
function lowPoint(n){
  let best = null, m = Infinity;
  J.forEach((nm, i) => { const v = dot(S.P[i], n) - (CONTACT[nm] || 3); if (v < m){ m = v; best = sub(S.P[i], mul(n, CONTACT[nm] || 3)); } });
  return best;
}
// kept on the plane: the lowest point along n touches it
function onPlane(p, n){ const g = soleAlong(n) - dot(p, n); if (Math.abs(g) > 1e-6) moveAll(mul(n, -g)); }
// the scene's floor (not a solid's top): the grounding (接地) setting looks after it
const isFloor = (p, n) => { const E = S.env || {}; return !!E.floor && n[1] > 0.9999 && Math.abs(p[1] - (+E.floorY || 0)) < 0.5; };
// slide: moved along the face too, so its lowest point comes to p. On any face but the scene's floor the
// figure keeps to it (S.stand): however it is posed, its lowest point stays on the face
function standOnFace(p, n, slide){
  turnFigureUp(n);
  if (slide){ const d = sub(p, lowPoint(n)); moveAll(sub(d, mul(n, dot(d, n))), true); }
  onPlane(p, n);
  if (isFloor(p, n)) delete S.stand; else S.stand = {p: p.map(v => Math.round(v * 100) / 100), n: n.map(v => Math.round(v * 1e5) / 1e5)};
}
// the face nearest to the body (any joint's circle, as posed): {c: the face's point, gap}, or null.
// ok(c): which faces may be taken
function nearestContact(ok){
  let best = null;
  J.forEach((nm, i) => { const r = CONTACT[nm] || 3;
    for (const c of standFaces(S.P[i])){
      if (ok && !ok(c)) continue;
      if (dot(sub(S.P[i], c.p), c.n) < -r - 3) continue;          // behind the face (inside the solid, past the wall)
      const gap = c.d - r; if (!best || gap < best.gap) best = {c, gap};
    } });
  return best;
}
// the nearest point of every face to q: [{p, n, d}] (the floor, the ceiling, the wall, the solids' faces)
function standFaces(q){
  const E = S.env || {}, out = [];
  const plane = (p0, n) => { const p = sub(q, mul(n, dot(sub(q, p0), n))); out.push({p, n, d: len(sub(p, q))}); };
  if (E.floor) plane([0, +E.floorY || 0, 0], [0, 1, 0]);
  if (E.ceiling) plane([0, +E.ceilingY || 230, 0], [0, -1, 0]);
  if (E.wall) plane([+E.wallX || 0, 0, +E.wallZ || -40], rotY([0, 0, 1], deg(+E.wallYaw || 0)));
  if (typeof solidMesh === "function") for (const o of S.solids || []) if (!o.guide){ const c = closestOnSolid(solidMesh(o), q); if (c && !buried(c)) out.push(c); }
  return out;
}
// a solid's face down on the floor (its bottom): not one to stand on
const buried = c => { const E = S.env || {}; return !!E.floor && c.n[1] < -0.97 && Math.abs(c.p[1] - (+E.floorY || 0)) < 1; };
// 近い面に立つ: the solid's face nearest to the body (any joint's circle, as posed) that it is in front of
function nearFace(o){
  const m = solidMesh(o);
  let best = null, bg = Infinity;
  for (const f of m.faces) J.forEach((nm, i) => {
    const q = S.P[i], c = closestOnSolid({V: m.V, faces: [f]}, q);
    if (!c || buried(c) || dot(sub(q, c.p), c.n) < 0) return;
    const g = c.d - (CONTACT[nm] || 3); if (g < bg){ bg = g; best = c; }
  });
  return best || closestOnSolid(m, S.P[IX.pelvis]);
}
// the hips moved: the figure stands on the face nearest to the body (its nearest point, as posed). It
// does not go through to a face's other side: pushed behind the face it stands on, it stays on it (and
// comes back to its side); a face with the hips well behind it is not taken; nor (unless 逆さ・裏向きの面にも
// is on) one that would turn the body over, more than a quarter turn from its up (a ceiling, a solid's
// underside). 面をクリックして立つ and 近い面に立つ take any face (asked for)
function attachNear(){
  const E = S.env || {};
  if (S.stand && soleAlong(S.stand.n) - dot(S.stand.p, S.stand.n) < -0.5) return;     // pushed in: back onto it (onPlane)
  const hips = S.P[IX.pelvis], up = figUp();
  // the hips a little in (sunk into a wall): that face, back out to its side; past it: not
  const ok = c => dot(sub(hips, c.p), c.n) > -ATTACH_CM && (E.under || dot(c.n, up) > -0.1);
  const b = nearestContact(ok), f = b && b.gap < ATTACH_CM ? b.c : null;
  if (!f){                                      // pulled away from the face: it lets go (stays turned)
    if (S.stand && soleAlong(S.stand.n) - dot(S.stand.p, S.stand.n) > ATTACH_CM) delete S.stand;
    return;
  }
  if (isFloor(f.p, f.n) && figUp()[1] > 0.97){ delete S.stand; return; }   // upright over the floor: the grounding's
  standOnFace(f.p, f.n, false);
}
// the face under a pixel of the front view: {p, n}, or null
function faceAt(x, y, W, H){
  const r = pixelRay(x, y, W, H), E = S.env || {};
  let best = null;
  const take = (t, n) => { if (t > 0 && (!best || t < best.t)) best = {t, p: add(r.o, mul(r.dir, t)), n}; };
  const plane = (p0, n) => { const dn = dot(r.dir, n); if (dn < -1e-6) take(dot(sub(p0, r.o), n) / dn, n); };
  if (E.floor) plane([0, +E.floorY || 0, 0], [0, 1, 0]);
  if (E.ceiling) plane([0, +E.ceilingY || 230, 0], [0, -1, 0]);
  if (E.wall) plane([+E.wallX || 0, 0, +E.wallZ || -40], rotY([0, 0, 1], deg(+E.wallYaw || 0)));
  for (const o of S.solids || []){ if (o.guide) continue;
    const m = solidMesh(o), t = rayHit(m, r); if (t === null || !(t > 0)) continue;
    const c = closestOnSolid(m, add(r.o, mul(r.dir, t))); if (c) take(t, c.n); }
  return best;
}
// 面をクリックして立つ: armed by the button, the next press on the front view picks the face
let facePick = false;
const faceHook = (cv, x, y) => {
  if (!facePick || cv !== front) return null;
  facePick = false; front.style.cursor = ""; unhook();
  const f = faceAt(x, y, cv.width, cv.height);
  if (!f){ say("そこには面がありません。床・壁・天井か、置いた物体の面をクリックしてください。", true); return {move(){}}; }
  remember(); standOnFace(f.p, f.n, true); afterEdit(); draw();
  say(f.n[1] > 0.97 ? "クリックした面に立たせました。" : "クリックした面に、面に合わせて立たせました（関節の固定は外しました）。");
  return {move(){}};
};
// first of the press hooks while armed (before selecting, the ruler, the handles)
const unhook = () => { const k = DOWN_HOOKS.indexOf(faceHook); if (k >= 0) DOWN_HOOKS.splice(k, 1); };
function armFacePick(){ unhook(); DOWN_HOOKS.unshift(faceHook); facePick = true; front.style.cursor = "crosshair";
  say("立たせる面（床・壁・天井・物体の面）をクリックしてください。Esc でやめます。"); }
addEventListener("keydown", e => { if (facePick && e.key === "Escape"){ facePick = false; unhook(); front.style.cursor = ""; say("面のクリックをやめました。"); } });
// 体をまっすぐに戻す: upright again (on the floor or what is under it, by the grounding)
function standUpright(){
  remember(); turnFigureUp([0, 1, 0]); delete S.stand; afterEdit(); draw(); say("体をまっすぐに戻しました。");
}

// ---- surfaces: put the selected hand / foot on the floor, a wall or the ceiling ------------------
function surfaces(){
  const E = S.env || {}, out = [];
  if (E.floor) out.push({name: "床", p: [0, +E.floorY || 0, 0], n: [0, 1, 0]});
  // the faces of the solids (walls and ceilings are solids, turned any way): an upright face is a 壁,
  // one facing down a 天井, one facing up a 床
  if (typeof solidMesh === "function") for (const o of S.solids || []) if (!o.guide) for (const f of solidMesh(o).faces){
    const ny = f.n[1], name = ny > 0.7 ? "床" : ny < -0.7 ? "天井" : Math.abs(ny) < 0.35 ? "壁" : null;
    if (name) out.push({name, p: mul(f.n, f.d), n: f.n});
  }
  return out;
}
function flatFoot(side, fy){                  // the toe on the floor too
  const a = S.P[IX[side + "_ankle"]], t = IX[side + "_toe"], L = len(sub(S.P[t], a));
  let h = sub(S.P[t], a); h = [h[0], 0, h[2]]; h = len(h) > 1e-3 ? norm(h) : bodyFront();
  const dy = fy + 2 - a[1];
  if (Math.abs(dy) < L) rotateSubtree(t, add(a, add(mul(h, Math.sqrt(L*L - dy*dy)), [0, dy, 0])));
}
function toSurface(which){
  const i = sel;
  if (i < 0 || !PINNABLE.has(J[i])) { say("先に手首・足首・膝・肘・腰のどれかを選んでください。", true); return; }
  const sf = surfaces().filter(s => !which || s.name === which);
  if (!sf.length) { say(`${which || "床・壁・天井"}を先にオンにしてください。`, true); return; }
  // the nearest enabled surface
  let best = null, bd = 1e9;
  for (const s of sf){ const d = Math.abs(dot(sub(S.P[i], s.p), s.n)); if (d < bd){ bd = d; best = s; } }
  remember();
  const off = CONTACT[J[i]] || 3, cur = S.P[i];
  const target = add(sub(cur, mul(best.n, dot(sub(cur, best.p), best.n))), mul(best.n, off));
  if (i === IX.pelvis) moveAll(sub(target, cur), true);
  else if (IK_END[J[i]]) reachWith(i, target, $("scPull").checked);
  else rotateSubtree(i, add(S.P[PARENT[i]], mul(norm(sub(target, S.P[PARENT[i]])), len(sub(cur, S.P[PARENT[i]])))));
  if (/ankle/.test(J[i]) && best.name === "床") flatFoot(J[i][0], target[1] - off);
  if (/wrist/.test(J[i])) S.hands[J[i][0]] = "open";
  S.pins = S.pins || {}; S.pins[i] = S.P[i].slice();
  afterEdit(i); draw();
  say(`${J_JA[J[i]]}を${best.name}に着けて固定しました。`);
}

// ---- grab the nearest thing (vine, branch, bar, ladder, chair back, handlebar ...) ----------------
function nearestOn(it, q){
  const def = PROPS_[it.key]; let best = null, bd = 1e9;
  for (const {f, parts} of partSets(it)) for (const sh of def.grab ? def.grab.map(([a, b]) => ({c: [...segPoint(it, a), ...segPoint(it, b), 0]})) : parts){
    let p = null;
    if (sh.c){ const a = itemToWorld(it, sh.c.slice(0, 3), f), b = itemToWorld(it, sh.c.slice(3, 6), f), ab = sub(b, a);
      const t = Math.max(0, Math.min(1, dot(sub(q, a), ab) / (dot(ab, ab) || 1))); p = add(a, mul(ab, t)); }
    else if (sh.s) p = itemToWorld(it, sh.s.slice(0, 3), f);
    else if (sh.b){ const [cx, cy, cz, sx, sy, sz] = sh.b;   // the nearest point on the box, in its own frame
      const o = itemToWorld(it, [cx, cy, cz], f), k = (it.scale || 1) * (f.k || 1);
      const ax = [dirToWorld(f, it, [1, 0, 0]), dirToWorld(f, it, [0, 1, 0]), dirToWorld(f, it, [0, 0, 1])].map(norm);
      const hs = [sx, sy, sz].map(v => v * k / 2);
      p = o; ax.forEach((u, m) => { p = add(p, mul(u, Math.max(-hs[m], Math.min(hs[m], dot(sub(q, o), u))))); }); }
    if (p){ const d = len(sub(p, q)); if (d < bd){ bd = d; best = p; } }
  }
  return best;
}
function grab(){
  let i = sel;
  if (i < 0 || !/_(wrist|ankle)$/.test(J[i])) i = IX.r_wrist;
  const things = (S.items || []).map((it, n) => [it, n]).filter(([it]) => PROPS_[it.key] &&
    (it.where === "world" || !["hand", "wear", "body"].includes(PROPS_[it.key].place)));
  if (!things.length) { say("つかまる物（蔓・枝・鉄棒など）を先に置いてください。", true); return; }
  let best = null, bd = 1e9;
  const from = S.P[PARENT[PARENT[i]]];
  for (const [it] of things){ const p = nearestOn(it, from); if (p && len(sub(p, from)) < bd){ bd = len(sub(p, from)); best = p; } }
  if (!best) return;
  remember();
  const side = J[i][0];
  if (/wrist/.test(J[i])){
    const pull = $("scPull").checked;
    reachWith(i, wristTarget(side, best), pull); solveIK(i, wristTarget(side, best));
    S.hands[side] = "grip";
  } else reachWith(i, add(best, [0, 7, 0]), $("scPull").checked);
  S.pins = S.pins || {}; S.pins[i] = S.P[i].slice();
  afterEdit(i); draw();
  say(`${J_JA[J[i]]}でつかまって固定しました。別の手足も選んで「つかまる」を押せます。`);
}
// hanging by one hand or one foot, as a body does: that arm straight up (or that leg straight, and
// the body upside down), the body turned about the hold until its weight is right under it, the
// hold kept where it was. legs(): an extra leg pose before the turn (the rope: swinging legs).
function bodyCentre(){ return mul(S.P.reduce((m, p) => add(m, p), [0, 0, 0]), 1 / S.P.length); }
function straighten(root, dir){               // root's limb (two bones and what hangs on them) along dir
  const mid = KIDS[root][0], end = KIDS[mid][0];
  rotateSubtree(mid, add(S.P[root], mul(dir, len(sub(S.P[mid], S.P[root])))));
  rotateSubtree(end, add(S.P[mid], mul(dir, len(sub(S.P[end], S.P[mid])))));
}
function hangFrom(ji, legs){
  const at = S.P[ji].slice(), name = J[ji], side = name[0];
  const up = norm(sub(S.P[IX.neck], S.P[IX.pelvis])), across = norm(sub(S.P[IX.l_shoulder], S.P[IX.r_shoulder]));
  const out = mul(across, side === "l" ? 1 : -1);
  if (/wrist$/.test(name)){
    const dir = norm(add(up, mul(out, 0.12)));           // the arm up, a little out
    straighten(IX[side + "_shoulder"], dir);
    const h = IX[side + "_hand"]; if (h !== undefined) rotateSubtree(h, add(S.P[ji], mul(dir, len(sub(S.P[h], S.P[ji])))));
    S.hands[side] = "grip";
  } else if (/ankle$/.test(name)) straighten(IX[side + "_hip"], norm(sub(mul(up, -1), mul(out, -0.05))));
  if (legs) legs();
  // the weight under the hold: the whole body turned about it (the body's turn goes with it)
  const v = sub(bodyCentre(), S.P[ji]), down = [0, -1, 0], ax = cross(v, down);
  if (len(ax) > 1e-6){
    const ang = Math.acos(Math.max(-1, Math.min(1, dot(norm(v), down)))), a = norm(ax), c = S.P[ji].slice();
    S.P = S.P.map(p => add(c, rotAxis(sub(p, c), a, ang)));
    if (typeof turnBody === "function") turnBody(a, ang);
  }
  // the free arms hang down (upside down too), a little away from the body
  for (const sd of ["r", "l"]){
    if (/wrist$/.test(name) && sd === side) continue;
    const sh = IX[sd + "_shoulder"], away = norm(sub(S.P[sh], S.P[IX.chest]));
    straighten(sh, norm(add([0, -1, 0], mul([away[0], 0, away[2]], 0.2))));
  }
  moveAll(sub(at, S.P[ji]));
}
// the rope (ターザン): both hands on it, the right above the left; the legs swing a little
const ROPE_GAP = 14;
function ropeLegs(){
  for (const [n, f] of [["r_knee", 35], ["r_ankle", -15], ["l_knee", 10], ["l_ankle", -22]]) setBoneAngles(IX[n], f, 0);
}
function ropeHands(){
  const w = S.wire, top = S.P[IX.r_wrist], d = norm(sub(top, w.anchor)), lw = IX.l_wrist;
  if (S.pins && S.pins[lw]) return;
  solveIK(lw, add(top, mul(d, ROPE_GAP))); solveIK(lw, add(top, mul(d, ROPE_GAP)));
  S.hands.l = S.hands.r = "grip";
}
function hang(){                              // let the body down until an arm that holds is straight
  const holds = ["r", "l"].filter(s => S.pins && S.pins[IX[s + "_wrist"]]);
  const feet = ["r", "l"].filter(s => S.pins && S.pins[IX[s + "_ankle"]]);
  // one hand (and no foot): that arm up, the body under it; one foot alone: upside down
  if ((holds.length === 1 && !feet.length) || (!holds.length && feet.length === 1)){
    const ji = holds.length ? IX[holds[0] + "_wrist"] : IX[feet[0] + "_ankle"];
    remember(); hangFrom(ji); S.pins[ji] = S.P[ji].slice(); afterEdit(ji); draw();
    say(holds.length ? "片手でぶら下がるポーズにしました（腕を上げ、体を真下に）。" : "片足でぶら下がるポーズにしました（逆さ吊り）。");
    return;
  }
  if (!holds.length) { say("先に手でつかまってください（固定された手首が必要です）。", true); return; }
  let dy = -1e9;
  for (const s of holds){
    const w = S.pins[IX[s + "_wrist"]], sh = S.P[IX[s + "_shoulder"]];
    const L = (len(sub(S.P[IX[s + "_elbow"]], sh)) + len(sub(S.P[IX[s + "_wrist"]], S.P[IX[s + "_elbow"]]))) * 0.97;
    const h = Math.hypot(w[0] - sh[0], w[2] - sh[2]); if (h >= L) continue;
    dy = Math.max(dy, w[1] - sh[1] - Math.sqrt(L*L - h*h));
  }
  if (dy < -1e8) return;
  remember();
  for (const n of ["r_ankle", "l_ankle"]) if (S.pins[IX[n]]) delete S.pins[IX[n]];
  moveAll([0, dy, 0], true); afterEdit(); draw();
  say("腕が伸びるまで体を下ろしました（足の固定は外しました）。");
}

// ---- wire action -----------------------------------------------------------------------------
// the joint the wire holds; "rope": both hands on a rope (ターザン), the right hand the one held
const wireJoint = w => IX[w.joint === "rope" ? "r_wrist" : w.joint] !== undefined ? IX[w.joint === "rope" ? "r_wrist" : w.joint] : IX.chest;
function setWire(posed){
  const w = S.wire = Object.assign({on: false, joint: "chest", height: 300}, S.wire || {});
  const was = w.on && w.joint;
  w.on = $("scWire").checked; w.joint = $("scWireJ").value; w.height = +$("scWireH").value || 300;
  if (w.on){
    const ji = wireJoint(w);
    // hung by a hand, a foot or the rope (as it is turned on or changed): a pose a body could hang in
    if (posed && was !== w.joint && $("scWirePose").checked && (w.joint === "rope" || /_(wrist|ankle)$/.test(w.joint))){
      delete (S.pins || {})[ji];
      hangFrom(ji, w.joint === "rope" ? ropeLegs : null);
      // hanging: the whole body clear of the floor (lifted, the hold with it)
      const E = S.env || {}, low = lowest();
      if (E.floor && low < (+E.floorY || 0) + 10) moveAll([0, (+E.floorY || 0) + 10 - low, 0]);
    }
    const p = S.P[ji];
    w.anchor = [p[0], Math.max(w.height, p[1] + 5), p[2]]; w.length = Math.max(5, w.anchor[1] - p[1]);
    if (w.joint === "rope") ropeHands();
  }
}

// ---- the hands an item takes: held -> its grip (both hands when two-handed), worn / mounted -> its hands
function handsOf(it){
  const def = PROPS_[it.key] || {}, out = {};
  if (it.where) return out;
  if (def.place === "hand"){
    out[it.hand === "l" ? "l" : "r"] = def.pose || "grip";
    if (def.grip2 && it.both !== false) out[it.hand === "l" ? "r" : "l"] = def.pose2 || def.pose || "grip";
  } else if (def.place === "body" || def.place === "wear"){
    Object.assign(out, def.hands || {});
    if (def.mount) for (const s of ["r", "l"]) if (def.mount[s + "_wrist"] && !out[s]) out[s] = def.pose || "grip";
  }
  return out;
}
const holdHands = it => Object.assign(S.hands, handsOf(it));
function freeHands(it){ for (const [s, h] of Object.entries(handsOf(it))) if (S.hands[s] === h) S.hands[s] = "relaxed"; }

// ---- put down, carry on the back, hold again ----------------------------------------------------
const movable = it => { const d = PROPS_[it.key] || {}; return it.where === "world" || d.place === "world" || d.place === "grab"; };
function groundItem(it){                      // onto the floor or the top of a solid under it
  const pts = worldSamples(it); if (!pts.length || !it.base) return;
  const low = Math.min(...pts.map(q => q[1])), sup = supportUnder(it.base, low);
  if (isFinite(sup)) it.base = add(it.base, [0, sup - low, 0]);
}
function putDown(it){
  const def = PROPS_[it.key] || {}, at = itemToWorld(it, [0, 0, 0]);
  freeHands(it);
  it.where = "world"; it.base = at.slice(); it.yaw = facingYaw(); it.grounded = true;
  if (def.place === "hand"){                  // lie flat: a long grip along the floor
    const {lo, hi} = localExtent(partsOf(it));
    it.rot = hi[1] - lo[1] > hi[2] - lo[2] ? [0, 0, 90] : [0, 0, 0];
  }
  groundItem(it);
}
function carryOnBack(it){ freeHands(it); it.where = "back"; it.rot = [0, 0, 0]; }
function holdAgain(it){
  it.where = undefined; it.rot = [0, 0, 0]; it.grounded = false;
  const def = PROPS_[it.key] || {};
  if (def.place === "hand")                   // one thing per hand
    S.items = S.items.filter(o => o === it || !(PROPS_[o.key] && PROPS_[o.key].place === "hand" && !o.where && o.hand === it.hand));
  holdHands(it);
}
// 配置 mode: drag what lies in the scene (Shift: up and down)
function itemUnder(x, y){
  const W = front.width, H = front.height, reach = 14 * pointerScale() * (devicePixelRatio || 1);
  let best = null, bd = reach;
  (S.items || []).forEach((it, n) => { if (!movable(it)) return;
    for (const q of worldSamples(it)){ const s = project(q, W, H), d = Math.hypot(s.x - x, s.y - y);
      if (d < bd){ bd = d; best = {n, p: q}; } } });
  return best;
}
DOWN_HOOKS.push((cv, x, y) => {
  if (mode !== "place" || cv !== front || pick(cv, x, y) >= 0) return null;
  const u = itemUnder(x, y); if (!u) return null;
  scSel = u.n; sel = -1; if (typeof soSel === "number") soSel = -1;     // one object selected: this one
  fillItemList();
  if (gizmoHolds()) return {move(){}};       // the 3-axis handles move it
  const it = S.items[u.n];
  return dragFrom(u.p, cv.width, cv.height, d => {
    it.base = add(it.base, d);
    if (typeof snapItem === "function") snapItem(it);
    if (d[1]) it.grounded = false; else if (it.grounded) groundItem(it);
    afterEdit(); showItem(); });
});
// the wheel over it zooms the camera, as everywhere (turning is the 3-axis handles' and the panel's)


// ---- adding things -----------------------------------------------------------------------------
function facingYaw(){ const f = bodyFront(); return Math.atan2(f[0], f[2]) * 180 / Math.PI; }
// a thing on its own, held and worn by no one: on the floor (or a solid) in front of the figure
// being edited, a held thing lying flat as when put down. It stands apart from the figures
// (pose_cast.js keeps it with whoever is edited), so 配置 mode moves it.
function placeAlone(key){
  const def = PROPS_[key]; if (!def) return;
  remember();
  const c = S.P[IX.pelvis], f = bodyFront(), fy = +(S.env && S.env.floorY) || 0;
  const it = {key, off: [0, 0, 0], rot: [0, 0, 0], scale: 1, where: "world", grounded: true,
    yaw: facingYaw(), base: [c[0] + f[0] * 60, fy, c[2] + f[2] * 60]};
  if (def.place === "hand"){ const {lo, hi} = localExtent(partsOf(it)); if (hi[1] - lo[1] > hi[2] - lo[2]) it.rot = [0, 0, 90]; }
  S.items = S.items || []; S.items.push(it); scSel = S.items.length - 1;
  groundItem(it);
  afterEdit(); fillItemList(); draw();
  say("単体で置きました。配置モードでドラッグして動かせます（Shift＋ドラッグで上下、回すのは3軸ハンドル）。");
}
// カウチ (def.couch: lances): the holding arm comes back to the hip, its hand low by the side, so the
// shaft lies along the forearm, forward and under the arm
function couchHold(side){
  const s = side === "l" ? "l" : "r", wi = IX[s + "_wrist"], cf = chestFrame(), P = S.P;
  const sx = s === "l" ? 1 : -1;
  const t = add(add(P[IX.pelvis], mul(bodyFront(), 30)), add(mul(cf.x, sx * 12), [0, 12, 0]));
  reachWith(wi, t, false);
}
function addItem(key, hand){
  const def = PROPS_[key]; if (!def) return;
  remember();
  const it = {key, off: [0, 0, 0], rot: [0, 0, 0], scale: 1};
  if (def.place === "hand"){
    it.hand = hand === "l" ? "l" : "r";
    // one thing per hand: a new one replaces what that hand held (things on the back or put down stay)
    S.items = (S.items || []).filter(o => !(PROPS_[o.key] && PROPS_[o.key].place === "hand" && !o.where && o.hand === it.hand));
    if (holdOf(it) === "couch") it.both = false;
    holdHands(it);
    if (holdOf(it) === "couch") couchHold(it.hand);
  } else if (def.place === "body"){
    S.items = (S.items || []).filter(o => !(PROPS_[o.key] && PROPS_[o.key].place === "body" && !o.where));
    holdHands(it);
  } else if (def.place === "wear"){
    holdHands(it);
  } else {
    const c = S.P[IX.pelvis], fy = +(S.env && S.env.floorY) || 0;
    it.yaw = facingYaw();
    it.base = [c[0], fy, c[2]];
    if (def.mount && def.mount.pelvis){         // the seat goes under the pelvis
      const m = rotY(def.mount.pelvis, deg(it.yaw)); it.base = [c[0] - m[0], fy, c[2] - m[2]];
    }
  }
  S.items.push(it); scSel = S.items.length - 1;
  if (def.place === "world" && def.mount) mountOn(it, true);
  afterEdit(); fillItemList(); draw();
  const where = def.place === "hand" ? (it.hand === "r" ? "右手に持たせました" : "左手に持たせました")
    : def.place === "wear" ? "身に着けました"
    : def.place === "grab" ? "置きました。手首か足首を選んで「つかまる」" : "置きました";
  say(`${def.ja}（${def.en}）を${where}。`);
}
function mountOn(it, quiet){                  // seat the pelvis, put the hands and feet on the mounts
  const def = PROPS_[it.key]; if (!def || !def.mount) return;
  if (!quiet) remember();
  const f = frameOf(it), m = {};
  for (const [jn, p] of Object.entries(def.mount)) m[jn] = segPoint(it, p);
  S.pins = S.pins || {};
  for (const jn of Object.keys(m)) delete S.pins[IX[jn]];
  if (m.pelvis) moveAll(sub(itemToWorld(it, m.pelvis, f), S.P[IX.pelvis]), true);
  for (const [jn, p] of Object.entries(m)){
    if (jn === "pelvis") continue;
    const i = IX[jn]; if (i === undefined) continue;
    const tg = itemToWorld(it, p, f);
    reachWith(i, tg, false);
    if (/ankle/.test(J[i])) flatFoot(J[i][0], tg[1] - CONTACT[J[i]]);
    if (def.place === "world") S.pins[i] = S.P[i].slice();
  }
  if (m.pelvis) S.pins[IX.pelvis] = S.P[IX.pelvis].slice();
  if (def.hands) Object.assign(S.hands, def.hands);
  else for (const s of ["r", "l"]) if (m[s + "_wrist"]) S.hands[s] = def.pose || "grip";
  if (!quiet){ afterEdit(); draw(); say(`${def.ja}に体を合わせて、合わせた関節を固定しました。`); }
}

// ---- the panel ---------------------------------------------------------------------------------
let scSel = -1;
const ITEM_CTL = [["scSize", "大きさ（いちばん長い辺）", 1, 300, 0.5, "cm"], ["scRx", "回転（前後に倒す）", -180, 180, 1, "°"],
  ["scRy", "回転（ひねる）", -180, 180, 1, "°"], ["scRz", "回転（横に倒す）", -180, 180, 1, "°"],
  ["scOx", "ずらす（左右）", -150, 150, 1, "cm"], ["scOy", "ずらす（上下）", -150, 150, 1, "cm"], ["scOz", "ずらす（前後）", -150, 150, 1, "cm"]];
function buildScenePanel(){
  const sec = document.createElement("section");
  const rng = ([id, label, mn, mx, st, unit]) => `<label>${label}</label><div class="row"><input type="range" id="${id}" min="${mn}" max="${mx}" step="${st}">
    <input type="number" class="num" id="${id}N" step="${st}"><span class="unit">${unit}</span></div>`;
  sec.innerHTML = `<h2>小物・環境（シミュレーション）</h2>
    <label>種類</label><select id="scCat">${CATS_.map(([k, ja, en]) => `<option value="${k}">${ja} / ${en}</option>`).join("")}</select>
    <select id="scKey" style="margin-top:6px"></select>
    <div class="btns" style="margin-top:6px"><button id="scAddR">右手に持つ・置く</button><button id="scAddL">左手に持つ</button></div>
    <div class="hint" id="scNote"></div>
    <label style="margin-top:10px">出ている物</label>
    <select id="scList" size="4"></select>
    <div class="btns" style="margin-top:6px"><button id="scDel">外す</button><button id="scMount">体を合わせる</button>
      <button id="scFlip">逆手にする</button><label style="display:inline;margin:0 0 0 4px"><input type="checkbox" id="scBoth" checked> 両手持ち</label></div>
    <div id="scItemMore">
      <div class="btns" style="margin-top:6px"><button id="scBack">背負う</button><button id="scWorld">床・物体に置く</button>
        <button id="scHold">手に持つ・身に着ける</button><button id="scGround2">接地させる</button></div>
      <div id="scHoldRow" class="grid2" style="margin-top:6px">
        <div><label id="scHoldLbl">持ち方</label><select id="scHoldSel"><option value="grip">握る</option><option value="couch">カウチ（脇に挟む）</option></select></div>
        <div><label>利き手（両手持ちの主に持つ手）</label><select id="scHandSel"><option value="r">右手</option><option value="l">左手</option></select></div>
        <div><label>持つ位置（長い方向）</label><div class="row"><input type="range" id="scGripAt" min="-80" max="80" step="1"><input type="number" class="num" id="scGripAtN" step="1"><span class="unit">cm</span></div></div>
      </div>
      <div class="btns"><button id="scGripReset" title="持ち方と持つ位置を、この小物の初期値に戻す">↺ 持ち方と持つ位置を戻す</button></div>
      <label id="scBayRow"><input type="checkbox" id="scBay"> 銃剣を付ける</label>
      <div id="scDims" class="grid2"></div>
      <div class="row" style="margin-top:6px"><label style="margin:0;flex:1"><input type="checkbox" id="scColorOn"> 線の色を変える</label>
        <input type="color" id="scColor" value="#e0605a" ></div>
      <div class="hint">置いた物は配置モードでドラッグして動かせます（Shift＋ドラッグで上下、回すのは3軸ハンドル）。</div>
    </div>
    <div id="scItemCtl">${ITEM_CTL.map(rng).join("")}
      <div class="btns" style="margin-top:6px"><button id="scReset" title="位置・向き・大きさを戻す">↺ 戻す</button></div></div>
    <h2 style="margin-top:14px">地面と接地</h2>
    <div class="hint">壁と天井は、設置タブで物体（板）として置きます（いくつでも置け、3軸で回転できます）。</div>
    <div class="grid2">
      <label><input type="checkbox" id="scFloor"> 床</label><div class="row"><input type="number" class="num" id="scFloorY" step="1"><span class="unit">cm</span></div>
      <label><input type="checkbox" id="scCeil"> 天井</label><div class="row"><input type="number" class="num" id="scCeilY" step="1"><span class="unit">cm</span></div>
      <label><input type="checkbox" id="scWall"> 壁（奥行き）</label><div class="row"><input type="number" class="num" id="scWallZ" step="1"><span class="unit">cm</span></div>
      <label>壁の向き</label><div class="row"><input type="number" class="num" id="scWallYaw" step="5"><span class="unit">°</span></div>
    </div>
    <label>接地</label><select id="scGround"><option value="off">しない（宙に浮ける）</option>
      <option value="nopen">床・物体の上にめり込まない</option><option value="stick">いつも床・物体の上に着ける（一番低い所）</option></select>
    <label title="書き出すアタリにも床・壁を描く"><input type="checkbox" id="scShow"> アタリにも描く</label>
    <div class="btns" style="margin-top:6px"><button id="scEnvReset" title="床・壁・天井を初期値に">↺ 初期値に</button></div>
    <div class="btns" style="margin-top:6px"><button id="scToFloor">床に着ける</button><button id="scToWall">壁に着ける</button>
      <button id="scToCeil">天井に着ける</button></div>
    <div class="btns" style="margin-top:6px"><button id="scGrab">近くの物につかまる</button><button id="scHang">ぶら下がる</button>
      <button id="scView">人物を画面の中心に</button></div>
    <label title="届かないときは体ごと寄せる"><input type="checkbox" id="scPull" checked> 体ごと寄せる</label>
    <h3>面に立つ・貼り付く</h3>
    <label title="配置モードで腰を動かして面に近づけると、その面に立つ（壁・天井・斜面では体ごと面に合わせる）"><input type="checkbox" id="scAttach" checked> 腰を動かすと近くの面に立つ</label>
    <label title="腰を動かして近づけたとき、天井や物体の下側のように、体が逆さ・裏向きになる面にも立つ（オフでは、面をクリックしたときだけ）"><input type="checkbox" id="scUnder"> 逆さ・裏向きになる面にも立つ</label>
    <div class="btns"><button id="scPickFace" title="次にクリックした面（床・壁・天井・物体の面）に立たせる">面をクリックして立つ</button><button id="scUpright" title="面に合わせて傾いた体を、まっすぐに戻す">体をまっすぐに戻す</button></div>
    <div class="hint">床・壁・天井と、置いた物体の面（斜面も）に立たせます。壁では横向きに、天井では逆さに、斜面では面に垂直に、体ごと面に合わせます。面に着くのは、体のいちばん近い所・低い所です（ポーズによって足の裏・膝・手・頭など）。物体・壁・天井の面では、ポーズを変えてもいちばん低い所が面に着いたままです（床では上の「接地」の設定のとおり）。配置モードで体を面に近づける（15cm 以内）か、ボタンを押して面をクリックします。立っている面に沿って腰をドラッグでき、面から離すと貼り付きが外れます。</div>
    <div class="hint">関節（手首・足首・膝・肘・腰）を選んでから押します。着けた所・つかんだ所は固定（ピン）になり、ほかを動かしても離れません。</div>
    <h2 style="margin-top:14px">ワイヤーアクション</h2>
    <label><input type="checkbox" id="scWire"> ワイヤーで吊る</label>
    <div class="grid2"><div><label>吊る所</label><select id="scWireJ">
      ${[["chest", "胸（ハーネス）"], ["pelvis", "腰"], ["r_wrist", "右手"], ["l_wrist", "左手"], ["r_ankle", "右足首（逆さ吊り）"], ["l_ankle", "左足首（逆さ吊り）"],
         ["rope", "両手でロープ（ターザン）"]]
        .map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select></div>
      <div><label>支点の高さ</label><div class="row"><input type="number" class="num" id="scWireH" step="10" value="300"><span class="unit">cm</span></div></div></div>
    <label title="手で吊ると腕を上げ、足首で吊ると逆さになるなど、吊った所に合わせて体を動かす"><input type="checkbox" id="scWirePose" checked> ぶら下がるポーズにする</label>
    <div class="hint">オンにした時の位置の真上に支点ができます。手・足首・ロープで吊ると、その腕を上げる・逆さになるなど、ぶら下がれるポーズになります（体の重さが支点の真下に来る向き）。配置モードで腰をドラッグすると、ワイヤーの長さを保ったまま振れます。</div>`;
  const cam = document.getElementById("camReset").closest("section");
  cam.parentNode.insertBefore(sec, cam);
  // ニュートラル ("") first: nothing to hold or put (no preview); the tab starts so and goes back to it
  // after 持つ・置く. A category chosen by hand picks its first kind
  const fillKeys = e => {
    const cat = $("scCat").value, k0 = $("scKey").value;
    $("scKey").innerHTML = `<option value="">ニュートラル（何も選ばない）</option>` + Object.entries(PROPS_).filter(([, d]) => d.cat === cat)
      .map(([k, d]) => `<option value="${k}">${d.ja} / ${d.en}</option>`).join("");
    const opts = [...$("scKey").options];
    $("scKey").value = e && e.detail !== "keep" && opts[1] ? opts[1].value : opts.some(o => o.value === k0) ? k0 : "";
    showNote();
  };
  const showNote = () => {
    const d = PROPS_[$("scKey").value];
    $("scAddR").disabled = !d;
    if (!d) { $("scNote").textContent = ""; $("scAddL").style.display = "none"; $("scAddR").textContent = "持つ・置く"; return; }
    const how = d.place === "hand" ? (d.grip2 ? "両手で持つ" : "片手で持つ") + "（手の形：" + (HAND_JA[d.pose] || d.pose) + "）"
      : d.place === "body" ? "体の前に構える（両手は自動で合わせる）" : d.place === "grab" ? "置いてから、手足でつかまる"
      : d.place === "wear" ? "身に着ける（" + ({head: "頭", chest: "胸・肩", back: "背中", waist: "腰", feet: "両足"}[d.at] || "両足と両手") + "）"
      : d.mount && Object.keys(d.mount).length ? "置くと体を合わせる（座る・乗る・手を置く）" : "床に置く";
    $("scNote").textContent = how + (d.note ? "。" + d.note : "");
    $("scAddL").style.display = d.place === "hand" ? "" : "none";
    $("scAddR").textContent = d.place === "hand" ? "右手に持つ" : d.place === "wear" ? "身に着ける" : "置く";
  };
  $("scCat").addEventListener("change", fillKeys);
  $("scKey").addEventListener("change", showNote);
  // after holding / putting: back to ニュートラル (the preview no longer in the way)
  const put = hand => { const k = $("scKey").value; if (!PROPS_[k]) return; addItem(k, hand);
    $("scKey").value = ""; $("scKey").dispatchEvent(new Event("change")); draw(); };
  $("scAddR").addEventListener("click", () => put("r"));
  $("scAddL").addEventListener("click", () => put("l"));
  $("scList").addEventListener("change", () => { scSel = +$("scList").value; showItem(); draw(); });
  $("scDel").addEventListener("click", () => removeItem(scSel));
  $("scMount").addEventListener("click", () => { const it = S.items[scSel]; if (it) mountOn(it); });
  $("scFlip").addEventListener("click", () => { const it = S.items[scSel]; if (!it) return; remember();
    it.rot[0] = ((it.rot[0] + 360) % 360) - 180; afterEdit(); showItem(); draw(); });
  $("scBoth").addEventListener("change", e => { const it = S.items[scSel]; if (!it) return; remember();
    freeHands(it); it.both = e.target.checked; holdHands(it); afterEdit(); draw(); });
  const onItem = (id, fn, msg) => $(id).addEventListener("click", () => { const it = S.items[scSel]; if (!it) return;
    remember(); fn(it); afterEdit(); fillItemList(); draw(); if (msg) say(msg); });
  onItem("scBack", carryOnBack, "背負いました。");
  onItem("scWorld", putDown, "床・物体の上に置きました。配置モードでドラッグして動かせます。");
  onItem("scHold", holdAgain, "持たせました（手の形も合わせました）。");
  onItem("scGround2", it => { it.grounded = true; groundItem(it); }, "接地させました。");
  $("scHoldSel").addEventListener("change", e => { const it = S.items[scSel]; if (!it) return; remember();
    setHold(it, e.target.value); afterEdit(); fillItemList(); draw(); });
  const setAt = v => { const it = S.items[scSel]; if (!it || !isFinite(v)) return; if (v === 0) delete it.gripAt; else it.gripAt = v; afterEdit(); draw(); };
  $("scGripAt").addEventListener("pointerdown", remember);
  $("scGripAt").addEventListener("input", e => { $("scGripAtN").value = e.target.value; setAt(+e.target.value); });
  $("scGripAtN").addEventListener("change", e => { remember(); $("scGripAt").value = e.target.value; setAt(+e.target.value); });
  // 利き手: a two-handed thing's main hand (the other hand takes the rest); the thing is held again
  $("scHandSel").addEventListener("change", e => { const it = S.items[scSel]; if (!it || it.where) return; remember();
    freeHands(it); it.hand = e.target.value === "l" ? "l" : "r"; holdHands(it); afterEdit(); fillItemList(); draw(); });
  $("scGripReset").addEventListener("click", () => { const it = S.items[scSel]; if (!it) return; remember();
    resetGrip(it); afterEdit(); fillItemList(); draw(); say("持ち方と持つ位置を戻しました。"); });
  $("scBay").addEventListener("change", e => { const it = S.items[scSel]; if (!it) return; remember(); it.bayonet = e.target.checked; draw(); });
  const setColor = () => { const it = S.items[scSel]; if (!it) return; remember();
    it.color = $("scColorOn").checked ? $("scColor").value : undefined; draw(); };
  $("scColorOn").addEventListener("change", setColor);
  $("scColor").addEventListener("input", () => { $("scColorOn").checked = true; setColor(); });
  const setters = {scSize: (it, v) => setItemLongCm(it, v), scRx: (it, v) => it.rot[0] = v, scRy: (it, v) => it.rot[1] = v,
    scRz: (it, v) => it.rot[2] = v, scOx: (it, v) => it.off[0] = v, scOy: (it, v) => it.off[1] = v, scOz: (it, v) => it.off[2] = v};
  for (const [id] of ITEM_CTL){
    const r = $(id), n = $(id + "N");
    const apply = v => { const it = S.items[scSel]; if (!it || !isFinite(v)) return; setters[id](it, v); afterEdit(); draw(); };
    r.addEventListener("pointerdown", remember);
    r.addEventListener("input", () => { n.value = r.value; apply(+r.value); });
    n.addEventListener("change", () => { remember(); r.value = n.value; apply(+n.value); });
  }
  $("scReset").addEventListener("click", () => { const it = S.items[scSel]; if (!it) return; remember();
    it.off = [0, 0, 0]; it.rot = [0, 0, 0]; it.scale = 1; delete it.dims; delete it.len; delete it.thick; delete it.stretch; delete it.segs; if (it.grounded) groundItem(it);
    afterEdit(); showItem(); draw(); say("小物の位置・向き・大きさを戻しました。"); });
  $("scEnvReset").addEventListener("click", () => { remember(); S.env = fresh().env;
    afterEdit(); syncScene(); draw(); say("床・壁・天井を初期値に戻しました。"); });
  // environment
  const env = () => { S.env = Object.assign(fresh().env, S.env || {}); return S.env; };
  for (const [id, key, num] of [["scFloor", "floor"], ["scCeil", "ceiling"], ["scWall", "wall"], ["scShow", "show"],
      ["scFloorY", "floorY", 1], ["scCeilY", "ceilingY", 1], ["scWallZ", "wallZ", 1], ["scWallYaw", "wallYaw", 1], ["scGround", "ground"]]){
    $(id).addEventListener("change", e => { remember(); const E = env();
      E[key] = num ? +e.target.value : e.target.type === "checkbox" ? e.target.checked : e.target.value;
      if (key === "ground" && E.ground !== "off" && !(S.solids || []).length) E.floor = true;
      afterEdit(); syncScene(); draw(); });
  }
  $("scAttach").addEventListener("change", e => { remember(); env().attach = e.target.checked; draw(); });
  $("scUnder").addEventListener("change", e => { remember(); env().under = e.target.checked; draw(); });
  $("scPickFace").addEventListener("click", armFacePick);
  $("scUpright").addEventListener("click", standUpright);
  $("scToFloor").addEventListener("click", () => toSurface("床"));
  $("scToWall").addEventListener("click", () => toSurface("壁"));
  $("scToCeil").addEventListener("click", () => toSurface("天井"));
  $("scGrab").addEventListener("click", grab);
  $("scHang").addEventListener("click", hang);
  $("scView").addEventListener("click", () => { const c = S.P[IX.pelvis]; S.center = [c[0], c[1] - 5, c[2]]; draw(); });
  for (const id of ["scWire", "scWireJ", "scWireH"])
    $(id).addEventListener("change", () => { remember(); setWire(id !== "scWireH"); afterEdit(); draw();
      say(!S.wire.on ? "ワイヤーを外しました。" : S.wire.joint === "rope" ? "両手でロープにつかまりました（ターザン）。配置モードで腰をドラッグすると振れます。"
        : `ワイヤーで${$("scWireJ").selectedOptions[0].textContent}を吊りました。`); });
  fillKeys();
}
// take a thing off / away (装備, 設置, and 人物の管理 under the map): its hands let go, its seat's pins go
function removeItem(n){
  const it = (S.items || [])[n]; if (!it) return;
  remember(); freeHands(it);
  S.items.splice(n, 1); const d = PROPS_[it.key];
  if (d && d.mount) for (const jn of Object.keys(d.mount)) if (S.pins) delete S.pins[IX[jn]];
  scSel = Math.min(scSel > n ? scSel - 1 : scSel, S.items.length - 1);
  afterEdit(); fillItemList(); draw(); say(`${(d && d.ja) || it.key}を外しました。`);
}
// 設置 › 小物を単体で置く: things to hold, wear or carry, put on the floor held by no one
const ALONE_OK = d => d && (d.place === "hand" || d.place === "body" || d.place === "wear");
function buildAlonePanel(){
  const sec = document.createElement("section");
  sec.dataset.menu = "objects";
  const cats = CATS_.filter(([k]) => Object.values(PROPS_).some(d => d.cat === k && ALONE_OK(d)));
  sec.innerHTML = `<h2>小物を単体で置く</h2>
    <label>種類</label><select id="alCat">${cats.map(([k, ja, en]) => `<option value="${k}">${ja} / ${en}</option>`).join("")}</select>
    <select id="alKey" style="margin-top:6px"></select>
    <div class="btns" style="margin-top:6px"><button id="alPut" title="誰にも持たせず、人物の前の床に置く">単体で置く</button></div>
    <label style="margin-top:10px">単体で置いた物</label>
    <select id="alList" size="4"></select>
    <div class="btns" style="margin-top:6px"><button id="alDel">外す</button><button id="alHold">いまの人物に持たせる</button></div>
    <div class="hint">武器・道具・帽子なども、誰にも持たせずに床（物体の上）に置けます。配置モードでドラッグして動かせます（Shift＋ドラッグで上下、回すのは3軸ハンドル）。人物に持たせた物は「装備」で扱います。</div>`;
  const cam = document.getElementById("camReset").closest("section");
  cam.parentNode.insertBefore(sec, cam);
  const fill = () => { $("alKey").innerHTML = Object.entries(PROPS_).filter(([, d]) => d.cat === $("alCat").value && ALONE_OK(d))
    .map(([k, d]) => `<option value="${k}">${d.ja} / ${d.en}</option>`).join(""); };
  $("alCat").addEventListener("change", fill);
  $("alPut").addEventListener("click", () => placeAlone($("alKey").value));
  // 接地 for the things already out (held ones are put down on the floor): the same as in 装備
  { const g = document.createElement("button"); g.id = "alGround"; g.type = "button"; g.textContent = "選んだ物を接地させる";
    g.title = "出ている物の一覧で選んだ小物を、床・物体の上に接地（持っている物は床に置く）";
    $("alPut").after(g);
    g.addEventListener("click", () => { const it = S.items[scSel];
      if (!it){ say("接地させる物を、下の「出ている物」の一覧から選んでください。", true); return; }
      remember(); if (it.where) { it.grounded = true; groundItem(it); } else putDown(it);
      afterEdit(); fillItemList(); draw(); say("接地させました。"); }); }
  $("alList").addEventListener("change", () => { scSel = +$("alList").value; fillItemList(); draw(); });
  $("alDel").addEventListener("click", () => removeItem(+$("alList").value));
  $("alHold").addEventListener("click", () => { const it = S.items[+$("alList").value]; if (!it) return;
    remember(); if ((PROPS_[it.key] || {}).place === "hand") it.hand = it.hand || "r"; holdAgain(it); afterEdit(); fillItemList(); draw();
    say("いまの人物に持たせました（手の形も合わせました）。"); });
  fill();
}
function fillAloneList(){
  const el = $("alList"); if (!el) return;
  const rows = (S.items || []).map((it, n) => [it, n]).filter(([it]) => it.where === "world" && ALONE_OK(PROPS_[it.key]));
  el.innerHTML = rows.map(([it, n]) => `<option value="${n}">${String((PROPS_[it.key] || {}).ja || it.key).replace(/&/g, "&amp;").replace(/</g, "&lt;")}</option>`).join("");
  if (rows.some(([, n]) => n === scSel)) el.value = String(scSel);
  $("alDel").disabled = $("alHold").disabled = !rows.length;
}
function fillItemList(){
  const items = S.items || [];
  $("scList").innerHTML = items.map((it, n) => { const d = PROPS_[it.key] || {};
    const where = it.where === "back" ? "背中" : it.where === "world" ? "置く" : d.place === "hand" ? (it.hand === "r" ? "右手" : "左手")
      : d.place === "body" ? "構える" : d.place === "wear" ? "身に着ける" : "置く";
    // a key no prop has (a pose from a file or a link) is shown as text, never as markup
    const nm = String(d.ja || it.key).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    return `<option value="${n}">${nm}（${where}）</option>`; }).join("");
  if (scSel >= items.length) scSel = items.length - 1;
  if (scSel >= 0) $("scList").value = String(scSel);
  fillAloneList();
  showItem();
}
function showItem(){
  const it = (S.items || [])[scSel], d = it && PROPS_[it.key];
  $("scItemCtl").style.display = it ? "" : "none";
  $("scItemMore").style.display = it ? "" : "none";
  if (it){
    const carryable = d && (d.place === "hand" || d.place === "body");
    $("scBack").style.display = carryable && it.where !== "back" ? "" : "none";
    $("scWorld").style.display = d && it.where !== "world" && d.place !== "world" && d.place !== "grab" ? "" : "none";
    $("scHold").style.display = it.where ? "" : "none";
    $("scGround2").style.display = movable(it) ? "" : "none";
    $("scBayRow").style.display = d && d.bayonet ? "" : "none"; $("scBay").checked = !!it.bayonet;
    $("scColorOn").checked = !!it.color; $("scColor").value = it.color || (d && d.color) || $("scColor").defaultValue;
    const dims = (d && d.dims) || [], vals = itemDims(it);
    $("scDims").innerHTML = dims.map(([label], i) => `<div><label>${label}</label><div class="row"><input type="number" class="num" data-dim="${i}" min="1" step="1" value="${+vals[i] || 1}"><span class="unit">cm</span></div></div>`).join("");
    $("scDims").querySelectorAll("input").forEach(inp => inp.addEventListener("change", () => {
      const v = +inp.value; if (!(v > 0)) return; remember();
      it.dims = itemDims(it); it.dims[+inp.dataset.dim] = v; if (it.grounded) groundItem(it); afterEdit(); draw(); }));
  }
  $("scMount").style.display = d && d.mount && d.place !== "hand" ? "" : "none";
  $("scFlip").style.display = d && d.place === "hand" ? "" : "none";
  $("scBoth").parentNode.style.display = d && d.grip2 ? "inline" : "none";
  if (!it) return;
  $("scBoth").checked = it.both !== false;
  const hand = d && d.place === "hand", ways = d && (d.couchable || d.couch);
  $("scHoldRow").style.display = hand ? "" : "none"; $("scGripReset").style.display = hand ? "" : "none";
  $("scHoldSel").parentNode.style.display = ways ? "" : "none";
  $("scHandSel").parentNode.style.display = d && d.grip2 ? "" : "none";
  $("scHandSel").value = it.hand === "l" ? "l" : "r";
  $("scHoldSel").value = holdOf(it);
  $("scGripAt").value = it.gripAt || 0; $("scGripAtN").value = it.gripAt || 0;
  // the size in cm: the slider from 0.3 to 3 times its first longest side (as 30–300 % were)
  { const L0 = Math.max(...itemBase(it)) * Math.max(...(stretchOf(it) || [1, 1, 1])), r = $("scSize");
    r.min = Math.round(L0 * 3) / 10; r.max = Math.round(L0 * 30) / 10; }
  const vals = {scSize: Math.round(itemLongCm(it) * 10) / 10, scRx: it.rot[0], scRy: it.rot[1], scRz: it.rot[2],
    scOx: it.off[0], scOy: it.off[1], scOz: it.off[2]};
  for (const [id, v] of Object.entries(vals)){ if (rangeHeld !== $(id)) $(id).value = v; if (document.activeElement !== $(id + "N")) $(id + "N").value = id === "scSize" ? v : Math.round(v); }
}
function syncScene(){
  const E = S.env = Object.assign(fresh().env, S.env || {});
  if (E.ground === true) E.ground = "stick"; else if (E.ground === false) E.ground = "off";
  $("scFloor").checked = !!E.floor; $("scCeil").checked = !!E.ceiling; $("scWall").checked = !!E.wall; $("scShow").checked = !!E.show;
  $("scFloorY").value = E.floorY; $("scCeilY").value = E.ceilingY; $("scWallZ").value = E.wallZ; $("scWallYaw").value = E.wallYaw;
  $("scGround").value = E.ground || "off"; $("scAttach").checked = E.attach !== false; $("scUnder").checked = !!E.under;
  const w = S.wire || {}; $("scWire").checked = !!w.on; $("scWireJ").value = w.joint || "chest"; $("scWireH").value = w.height || 300;
  fillItemList();
}
buildScenePanel();
buildAlonePanel();
syncScene();
// the editor's undo / load / presets replace S: keep the panel in step
{ const sync0 = syncUI; syncUI = function(){ sync0(); syncScene(); }; }
draw();
