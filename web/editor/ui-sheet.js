// The phone's and tablet's layout, upright (index.html, loaded last): the views fill the screen, the
// categories (作る / 見る / 出す / ODM-Poserについて) sit in a bar at the bottom, and a tab chosen
// opens its controls as a translucent sheet that rises from the bar, with a simplified view of the
// figure at its top. Upright only: sideways, and on a computer, the panel stays where 操作欄の位置 puts it.
// The corner controls on the views (modes, switches) are not changed here.
(() => {
const $ = id => document.getElementById(id);
const body = document.body, aside = document.querySelector("aside"), header = document.querySelector(".app-header");
// upright: the phone (the sheet from the bar) and the upright tablet / monitor (the tall layout: the
// categories and tabs in a column at the left, the controls beside them, scrolling sideways)
const SHEET = matchMedia("(orientation: portrait)");
const TALL = matchMedia("(min-width: 701px) and (orientation: portrait)");
const IC = window.ODMICONS || {svg: () => ""};

// the sheet's parts, in the panel: a grip (drag it down to close, up to open wider) and the simplified view
const grab = document.createElement("div");
grab.className = "sheet-grab";
grab.innerHTML = `<button type="button" id="sheetGrab" aria-label="操作欄を閉じる（下へドラッグでも閉じられます）" title="下へドラッグ・タップで閉じる"><i></i></button>`;
const view = document.createElement("div");
view.id = "sheetView";
view.innerHTML = `<canvas id="sheetMini" aria-label="人物の簡略表示" role="img"></canvas>`;
aside.classList.add("sheet-panel");
aside.prepend(view);
aside.prepend(grab);

// the bottom bar: the categories, and 「ODM-Poserについて」
const GROUPS = [["make", "作る", "PencilDraw"], ["look", "見る", "View"], ["out", "出す", "Send"], ["about", "ODM-Poserについて", "Question"]];
const bar = document.createElement("nav");
bar.id = "sheetBar"; bar.setAttribute("aria-label", "分類"); bar.dataset.ui = "skip";
bar.innerHTML = GROUPS.map(([id, name, ic]) => `<button type="button" data-g="${id}" aria-pressed="false" title="${name}">${IC.svg(ic)}<span>${name.replace("について", " について")}</span></button>`).join("");
// the tall layout (an upright tablet or monitor): the bar goes below or above (kept in this browser)
bar.insertAdjacentHTML("beforeend", `<button type="button" data-g="flip" class="bar-flip" title="分類バーとメニューを画面の上へ・下へ"><span>⇅ 上下</span></button>`);
const BAR_KEY = KEY + "-barpos";
const barTop = () => { try { return localStorage.getItem(BAR_KEY) === "top"; } catch (e) { return false; } };
document.getElementById("stage").after(bar);

// the about sheet: the page's header (title, version, links), kept out of the way on phones
const about = document.createElement("div");
about.id = "aboutSheet"; about.className = "sheet-panel"; about.dataset.ui = "skip";
about.setAttribute("role", "dialog"); about.setAttribute("aria-label", "ODM-Poserについて");
const head = header ? header.cloneNode(true) : document.createElement("div");
head.removeAttribute("id"); head.querySelectorAll("[id]").forEach(el => el.removeAttribute("id"));
about.innerHTML = `<div class="sheet-grab"><button type="button" class="sheet-close" aria-label="閉じる"><i></i></button></div>`;
about.appendChild(head);
document.body.appendChild(about);

function open(on){
  body.classList.toggle("sheet-open", on);
  if (on) body.classList.remove("about-open");
  $("sheetGrab").setAttribute("aria-expanded", String(on));
  syncBar(); draw();
}
function syncBar(){
  const g = (body.classList.contains("sheet-open") || body.classList.contains("sheet-tall")) && !body.classList.contains("about-open") ? ODMUI.groupOf() : "";
  const ab = body.classList.contains("about-open");
  bar.querySelectorAll("button").forEach(b => { const on = b.dataset.g === "about" ? ab : b.dataset.g === g;
    b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
}
function aboutOpen(on){
  body.classList.toggle("about-open", on);
  if (on) body.classList.remove("sheet-open");
  syncBar();
}

bar.addEventListener("click", e => {
  const b = e.target.closest("button[data-g]"); if (!b) return;
  if (b.dataset.g === "about"){ aboutOpen(!body.classList.contains("about-open")); return; }
  if (b.dataset.g === "flip"){ const top = !body.classList.contains("bar-top"); body.classList.toggle("bar-top", top);
    try { localStorage.setItem(BAR_KEY, top ? "top" : "bottom"); } catch (err) {} chromeKey = ""; draw(); chromeKey = ""; draw(); return; }
  // the tall layout keeps its menu in sight: a category only switches it
  if (body.classList.contains("sheet-tall")){ body.classList.remove("about-open"); ODMUI.showGroup(b.dataset.g); syncBar(); return; }
  const on = body.classList.contains("sheet-open") && ODMUI.groupOf() === b.dataset.g;
  if (on){ open(false); return; }
  ODMUI.showGroup(b.dataset.g);            // opens the sheet (ui-menu.js choose)
  syncBar();
});

// the grip: a drag down or a tap closes the sheet (the sheet fills the screen above the bar)
let g0 = null;
grab.addEventListener("pointerdown", e => {
  const b = e.target.closest("button"); if (!b) return;
  g0 = {y: e.clientY, id: e.pointerId, moved: false}; b.setPointerCapture(e.pointerId);
});
grab.addEventListener("pointermove", e => { if (g0) g0.moved = g0.moved || Math.abs(e.clientY - g0.y) > 8; });
grab.addEventListener("pointerup", e => {
  if (!g0) return; const d = e.clientY - g0.y, moved = g0.moved; g0 = null;
  if (!moved || d > 40) open(false);
});
grab.addEventListener("pointercancel", () => { g0 = null; });
about.querySelector(".sheet-close").addEventListener("click", () => aboutOpen(false));

// the simplified view: the front picture of the figure, drawn at the sheet's width
function drawMini(){
  const cv = $("sheetMini"), box = view; if (!cv || !box.getClientRects().length) return;
  const dpr = devicePixelRatio || 1, w = Math.max(1, cv.clientWidth), h = Math.max(1, cv.clientHeight);
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)){ cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
  const ctx = cv.getContext("2d");
  ctx.fillStyle = cssVar("--stage"); ctx.fillRect(0, 0, cv.width, cv.height);
  drawAtari(ctx, cv.width, cv.height, {sel});
}
{ const d0 = draw; draw = function(){ d0.apply(this, arguments); drawMini(); }; }

// the layout follows the window: upright and narrow is the sheet; the split screen is not used there
function sync(){
  const on = SHEET.matches;
  body.classList.toggle("sheet", on);
  body.classList.toggle("sheet-tall", on && TALL.matches);
  body.classList.toggle("bar-top", on && TALL.matches && barTop());
  if (on){ body.classList.remove("split", "full"); }
  if (!on){ body.classList.remove("sheet-open", "about-open"); }
  syncBar(); draw();
}
SHEET.addEventListener("change", sync);
TALL.addEventListener("change", sync);
if (SHEET.matches) sync(); else syncBar();
})();
