// Measure the editor's default bodies (standard, female, male) and compare them with usual human
// ratios (docs/ACCURACY-JA.md, chapter 1). The joints, the radii and the sexes' bone lengths are read
// from web/editor/pose_main.js itself (J, PARENT, REST, REST_R, SEX_BODY), and the bodies are built
// as applySex() builds them (setLengths, the widths, scaleAbout to standingHeight()), so the numbers
// follow the editor when those change. Nothing is written.
//
//     node tools/measure_body.mjs [--json]
//
// The ratios are to the crown's height (Drillis & Contini's body segment ratios): a yardstick, not
// a target; people and sources differ by a few cm.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("../web/editor/pose_main.js", import.meta.url));
const text = readFileSync(SRC, "utf8");

// `const NAME = <value>;` at the top level: the value up to its closing bracket
function constValue(name){
  const m = new RegExp(`^const ${name} = `, "m").exec(text);
  if (!m) throw new Error(`${name} not found in pose_main.js`);
  let i = m.index + m[0].length, depth = 0;
  const start = i;
  for (; i < text.length; i++){
    const c = text[i];
    if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}"){ depth--; if (depth === 0){ i++; break; } }
  }
  return Function(`"use strict"; return (${text.slice(start, i)});`)();
}
const J = constValue("J"), PARENT = constValue("PARENT"), REST = constValue("REST");
const REST_R = constValue("REST_R"), SEX_BODY = constValue("SEX_BODY");
const IX = Object.fromEntries(J.map((n, i) => [n, i]));

const sub = (a, b) => a.map((v, i) => v - b[i]), add = (a, b) => a.map((v, i) => v + b[i]);
const mul = (a, s) => a.map(v => v * s), len = a => Math.hypot(...a), norm = a => mul(a, 1 / (len(a) || 1));
const KIDS = J.map((_, i) => J.map((__, k) => k).filter(k => PARENT[k] === i));
function subtree(i){ const o = [i]; for (let k = 0; k < o.length; k++) o.push(...KIDS[o[k]]); return o; }

// the same as pose_main.js (standingHeight, setLengths, scaleAbout, applySex)
let S;
const bl = (a, b) => len(sub(S.P[IX[a]], S.P[IX[b]]));
function standingHeight(){
  const upper = S.R[IX.head] + bl("head", "neck") + bl("neck", "chest") + bl("chest", "waist") + bl("waist", "pelvis");
  const leg = s => bl(s + "_hip", "pelvis") * 0.29 + bl(s + "_knee", s + "_hip") + bl(s + "_ankle", s + "_knee")
    + bl(s + "_toe", s + "_ankle") * 0.55;
  return upper + (leg("r") + leg("l")) / 2;
}
function setLengths(L){
  const old = S.P.map(p => p.slice()), out = S.P.map(p => p.slice());
  for (const i of subtree(0).slice(1)){
    const p = PARENT[i], n = J[i].startsWith("l_") ? "r_" + J[i].slice(2) : J[i];
    out[i] = add(out[p], mul(norm(sub(old[i], old[p])), n in L ? L[n] : len(sub(old[i], old[p]))));
  }
  S.P = out;
}
function scaleAbout(k){ const c = S.P[IX.pelvis]; S.P = S.P.map(p => add(c, mul(sub(p, c), k))); S.R = S.R.map(r => r * k); }
function body(sex){
  S = {P: REST.map(p => p.slice()), R: REST_R.slice()};
  const b = SEX_BODY[sex];
  if (b){
    setLengths(b.len);
    S.R[IX.head] = b.head; S.R[IX.waist] = b.waistR; S.R[IX.r_hip] = S.R[IX.l_hip] = b.hipR;
    scaleAbout(b.height / standingHeight());
  }
  const low = Math.min(...S.P.map(p => p[1]));
  S.P = S.P.map(p => [p[0], p[1] - low, p[2]]);           // the lowest point on the floor
}

// the yardstick: share of the crown's height
const RATIO = {chin: 0.870, shoulder: 0.818, elbow: 0.630, wrist: 0.485, hip: 0.530, knee: 0.285,
  ankle: 0.039, upperArm: 0.186, forearm: 0.146, thigh: 0.245, shank: 0.246};
const NAMES = {chin: "あご（頭の球の下端）", shoulder: "肩の関節の高さ", elbow: "肘の高さ", wrist: "手首の高さ",
  hip: "股の高さ", knee: "膝の高さ", ankle: "足首の高さ", upperArm: "上腕", forearm: "前腕", thigh: "太もも", shank: "すね"};

function measure(sex){
  body(sex);
  const P = S.P, R = S.R, y = i => P[i][1], crown = y(IX.head) + R[IX.head];
  const parts = {chin: y(IX.head) - R[IX.head], shoulder: y(IX.r_shoulder), elbow: y(IX.r_elbow), wrist: y(IX.r_wrist),
    hip: y(IX.r_hip), knee: y(IX.r_knee), ankle: y(IX.r_ankle), upperArm: bl("r_elbow", "r_shoulder"),
    forearm: bl("r_wrist", "r_elbow"), thigh: bl("r_knee", "r_hip"), shank: bl("r_ankle", "r_knee")};
  return {
    body: sex || "standard",
    crown, shown: standingHeight(),
    ratios: Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, {cm: v, ratio: v / crown, want: RATIO[k], off: v - RATIO[k] * crown}])),
    headDiameter: 2 * R[IX.head], heads: crown / (2 * R[IX.head]),
    shoulderWidth: len(sub(P[IX.l_shoulder], P[IX.r_shoulder])), hipWidth: len(sub(P[IX.l_hip], P[IX.r_hip])),
    waistWidth: 2 * R[IX.waist], neckBone: bl("neck", "chest"),
    neckSeen: y(IX.head) - R[IX.head] - y(IX.r_shoulder), neckAboveShoulders: y(IX.neck) - y(IX.r_shoulder),
    palm: bl("r_hand", "r_wrist"),
  };
}

const all = [null, "female", "male"].map(measure);
if (process.argv.includes("--json")){ console.log(JSON.stringify(all, null, 2)); process.exit(0); }

const f = v => v.toFixed(1), sign = v => (v >= 0 ? "+" : "") + v.toFixed(1);
const head = ["", ...all.map(m => `${m.body}（${f(m.crown)}cm）`)];
const rows = [head, head.map(() => "---")];
for (const k of Object.keys(RATIO))
  rows.push([NAMES[k] + `（目安 ${RATIO[k].toFixed(3)}）`, ...all.map(m => { const r = m.ratios[k]; return `${f(r.cm)}cm ${r.ratio.toFixed(3)}（${sign(r.off)}）`; })]);
const more = [["表示される身長", m => f(m.shown)], ["頭の直径", m => f(m.headDiameter)], ["頭身", m => m.heads.toFixed(2)],
  ["肩幅（関節の間）", m => f(m.shoulderWidth)], ["股の幅（関節の間）", m => f(m.hipWidth)], ["ウエストの幅", m => f(m.waistWidth)],
  ["首の骨（胸 → 首）", m => f(m.neckBone)], ["見える首（肩 → 頭の球の下端）", m => f(m.neckSeen)],
  ["首の関節の肩からの高さ", m => f(m.neckAboveShoulders)], ["掌（手首 → 指の付け根）", m => f(m.palm)]];
for (const [label, fn] of more) rows.push([label, ...all.map(fn)]);
console.log(rows.map(r => `| ${r.join(" | ")} |`).join("\n"));
