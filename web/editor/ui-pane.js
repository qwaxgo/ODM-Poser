// The views' room (index.html, loaded after ui-layout.js):
//  - the grip on the edge between the views and the panel: dragged (or with the arrow keys), it gives
//    one of them more room; a double click puts it back. Beside the panel (a computer): the panel's
//    width (--aside-w); split screen upright: the views' share of the height (--split-k), sideways:
//    the panel's width (--split-aside-user). Kept in this browser.
//  - the modes' column: when one column does not fit the views' height (a phone's split screen),
//    the handles' tools and the touch keys go to a second one (.two)
//  - the switches' column: when it scrolls, ▲ ▼ at its ends (a tap scrolls a page) and a shade
(() => {
const $ = id => document.getElementById(id);
const grip = $("paneGrip"), stage = $("stage"), main = document.querySelector(".app-main"), aside = document.querySelector("aside");
// tb / tt: the tall layout's edge under / over the views (bar below / above), its share in --tall-k
const bc = document.body.classList, KEYS = {r: "-panew", l: "-panew", b: "-splitk", s: "-splitw", tb: "-tallk", tt: "-tallk"};
const get = k => { try { return localStorage.getItem(KEY + k); } catch (e) { return null; } };
const put = (k, v) => { try { if (v === null) localStorage.removeItem(KEY + k); else localStorage.setItem(KEY + k, v); } catch (e) {} };
const relayout = () => { chromeKey = ""; draw(); chromeKey = ""; draw(); };

// which edge the grip is on: "b" (split, upright), "s" (split, sideways), "r" / "l" (the panel beside
// the views, right or left), "" (none: the panel above or below, put away, one column)
function side(){
  // the phone's sheet has no edge; the tall layout's is under the views (their height, as split upright)
  if (bc.contains("sheet")) return bc.contains("sheet-tall") ? (bc.contains("bar-top") ? "tt" : "tb") : "";
  if (bc.contains("split")) return bc.contains("full") ? "" : innerWidth > innerHeight ? "s" : "b";
  if (bc.contains("aside-off") || !aside.getClientRects().length) return "";
  const a = aside.getBoundingClientRect(), v = stage.getBoundingClientRect();
  if (a.left >= v.right - 1) return "r";
  if (a.right <= v.left + 1) return "l";
  return "";
}
// a value onto the page, kept to what leaves both sides usable
function apply(k, v){
  const W = innerWidth, H = innerHeight;
  if (k === "b"){ const f = Math.min(0.8, Math.max(0.25, v)); document.body.style.setProperty("--split-k", f.toFixed(3)); return f; }
  // the tall layout: the views keep at least half the height (up to 85 %)
  if (k === "tb" || k === "tt"){ const f = Math.min(0.85, Math.max(0.5, v)); document.body.style.setProperty("--tall-k", f.toFixed(3)); return f; }
  if (k === "s"){ const w = Math.round(Math.min(W - 260, Math.max(200, v))); document.body.style.setProperty("--split-aside-user", w + "px"); return w; }
  const w = Math.round(Math.min(Math.min(720, W - 420), Math.max(240, v)));
  main.style.setProperty("--aside-w", w + "px"); return w;
}
function restore(){
  for (const k of ["b", "s", "r", "tb"]){ const v = parseFloat(get(KEYS[k])); if (isFinite(v)) apply(k, v); }
}
function value(k, x, y){                       // the value for the pointer at x, y
  if (k === "b" || k === "tb") return y / innerHeight;
  if (k === "tt") return 1 - y / innerHeight;
  if (k === "s") return innerWidth - x;
  const m = main.getBoundingClientRect(), gap = parseFloat(getComputedStyle(main).columnGap) || 16;
  return k === "r" ? m.right - parseFloat(getComputedStyle(main).paddingRight) - x - gap / 2
    : x - m.left - parseFloat(getComputedStyle(main).paddingLeft) - gap / 2;
}
const now = k => k === "tb" || k === "tt" ? parseFloat(getComputedStyle(document.body).getPropertyValue("--tall-k")) || 0.6
  : k === "b" ? parseFloat(getComputedStyle(document.body).getPropertyValue("--split-k")) || 0.5
  : k === "s" ? (parseFloat(getComputedStyle(document.body).getPropertyValue("--split-aside")) || aside.offsetWidth)
  : aside.offsetWidth;
let held = null, queued = false;
grip.addEventListener("pointerdown", e => {
  const k = grip.dataset.side; if (!k) return;
  e.preventDefault(); grip.setPointerCapture(e.pointerId); grip.classList.add("held"); held = {k, x: e.clientX, y: e.clientY};
});
grip.addEventListener("pointermove", e => {
  if (!held) return; held.x = e.clientX; held.y = e.clientY;
  if (queued) return; queued = true;
  requestAnimationFrame(() => { queued = false; if (held){ apply(held.k, value(held.k, held.x, held.y)); relayout(); } });
});
const end = () => { if (!held) return;
  const k = held.k; held = null; grip.classList.remove("held");
  put(KEYS[k], String(k === "b" || k === "tb" || k === "tt" ? now(k) : Math.round(now(k)))); relayout(); };
grip.addEventListener("pointerup", end); grip.addEventListener("pointercancel", end); grip.addEventListener("lostpointercapture", end);
grip.addEventListener("dblclick", () => { const k = grip.dataset.side; if (!k) return;
  if (k === "b") document.body.style.removeProperty("--split-k");
  else if (k === "tb" || k === "tt") document.body.style.removeProperty("--tall-k");
  else if (k === "s") document.body.style.removeProperty("--split-aside-user");
  else main.style.removeProperty("--aside-w");
  put(KEYS[k], null); relayout(); });
grip.addEventListener("keydown", e => {
  const k = grip.dataset.side; if (!k) return;
  const d = {ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1}[e.key]; if (!d) return;
  e.preventDefault();
  // the arrow moves the edge: right / down gives the views more room
  const v = k === "b" || k === "tb" ? now(k) + d * 0.03 : k === "tt" ? now(k) - d * 0.03 : now(k) + (k === "l" ? d : -d) * 24;
  put(KEYS[k], String(apply(k, v))); relayout();
});

// the modes' column in one or two columns, and the switches' ▲ ▼
const stack = document.querySelector("#ovModes .ov-stack"), opts = $("viewOpts");
// two columns still too tall (a phone sideways): the second column folds; … switches it between the
// handles' tools and the cursor and the objects' edit buttons, and Shift / 固定 go under the modes
const moreBox = document.createElement("div");
moreBox.className = "gz-tools more-tools"; moreBox.dataset.ui = "skip";
moreBox.innerHTML = `<button type="button" id="ovMore" aria-expanded="false" title="カーソル・選んだ物の編集を出す">…</button>`;
($("ovGizmo") || stack).appendChild(moreBox);
$("ovMore").addEventListener("click", () => { const on = !stack.classList.contains("more-open");
  stack.classList.toggle("more-open", on); $("ovMore").setAttribute("aria-expanded", String(on));
  $("ovMore").textContent = on ? "‹" : "…"; $("ovMore").title = on ? "3軸ハンドルに戻す" : "カーソル・選んだ物の編集を出す"; });
function columns(){
  const room = stack.parentElement.clientHeight; if (!room) return;
  stack.classList.remove("tight");
  const kids = [...stack.children].filter(c => c.getClientRects().length);
  const one = kids.reduce((h, c) => h + c.offsetHeight, 0) + 4 * Math.max(0, kids.length - 1);
  const two = one > room + 1;
  stack.classList.toggle("two", two);
  const h = id => { const el = $(id); return el && el.getClientRects().length ? el.offsetHeight : 0; };
  const tight = two && h("ovUndoRow") + 4 + Math.max(h("modes"), h("ovGizmo") + 4 + h("ovTouch")) > room + 1;
  stack.classList.toggle("tight", tight);
  if (!tight) stack.classList.remove("more-open");
}
function more(){
  const top = opts.scrollTop, rest = opts.scrollHeight - opts.clientHeight - top;
  opts.classList.toggle("more-up", top > 2); opts.classList.toggle("more-down", rest > 2);
}
opts.addEventListener("scroll", more, {passive: true});
opts.querySelectorAll(".ov-more").forEach(b => b.addEventListener("click", () =>
  opts.scrollBy({top: (b.classList.contains("up") ? -1 : 1) * opts.clientHeight * 0.7, behavior: "smooth"})));

let key = "";
function update(){
  const k = side();
  if (k !== grip.dataset.side){ grip.dataset.side = k;
    grip.className = "pane-grip" + (k ? " " + ({s: "r", tb: "b", tt: "t"}[k] || k) : "");
    grip.setAttribute("aria-orientation", k === "b" || k === "tb" || k === "tt" ? "horizontal" : "vertical"); }
  // the groups shown come and go (the objects' edit buttons): the columns are measured again
  const s = [innerWidth, innerHeight, document.body.className, stage.offsetHeight, stack.querySelectorAll("[hidden]").length].join("|");
  if (s !== key){ key = s; columns(); }
  // folded: a dot on … while the objects' edit buttons wait there
  const ed = $("ovEdit"); $("ovMore").classList.toggle("has-edit", !!ed && !ed.hidden);
  more();
}
restore();
{ const d0 = draw; draw = function(){ d0.apply(this, arguments); update(); }; }
addEventListener("resize", () => { key = ""; });
if (window.ODMPoserI18n) ODMPoserI18n.add({"図と操作欄の境目（ドラッグで広さを変える）": "The edge between the views and the panel (drag it for more room)",
  "上へ": "Up", "下へ": "Down", "カーソル・選んだ物の編集を出す": "Show the cursor and the edit buttons", "3軸ハンドルに戻す": "Back to the 3-axis handles"});
relayout();
})();
