// The editor's controls in melta UI's classes (design/melta-ui: DESIGN.md, the web recipes). The
// classes live here, once: each kind of control gets its recipe, whether it is in index.html or a
// panel a module (or a mod) builds later; a MutationObserver gives them to what is added. Tailwind
// reads this file (ui.src.css @source) to make ui.css. Sizes: melta's S on a mouse, M on a finger.
// Colours go through the semantic tokens (bg-bg-surface, text-text-default, ...), so the dark theme
// follows. An element marked data-ui="skip" keeps its own look.
(() => {
const focus = "focus:outline-none focus:ring-2 focus:ring-primary-500/50";
// a button shorter than 44px gets a taller hit area that does not show (melta BTN_MIN_TAP_TARGET)
const tap = "relative after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2";
const control = "text-sm leading-normal border border-input-border bg-input-bg text-text-default rounded-lg " + focus
  + " pointer-coarse:text-base";
const UI = window.ODMUI = {
  card: "bg-bg-surface rounded-xl border border-border-default p-5 shadow-sm",
  title: "text-sm font-semibold text-text-heading mt-0 mb-3",
  // buttons: outlined (sub), contained (the main action), lighted when switched on (class "on")
  button: "inline-flex items-center justify-center gap-1.5 h-8 px-3 text-[0.875rem] font-medium bg-bg-surface text-text-default "
    + "border border-border-default rounded-lg hover:bg-bg-page transition-colors cursor-pointer whitespace-nowrap " + focus
    + " pointer-coarse:h-10 pointer-coarse:px-4 disabled:opacity-50 disabled:cursor-not-allowed " + tap
    + " [&.on]:bg-primary-50 [&.on]:text-primary-600 [&.on]:border-primary-200"
    + " dark:[&.on]:bg-primary-500/15 dark:[&.on]:text-primary-300 dark:[&.on]:border-primary-500/40",
  primary: "inline-flex items-center justify-center gap-1.5 h-8 px-3 text-[0.875rem] font-medium bg-primary-500 text-white "
    + "rounded-lg hover:bg-primary-700 transition-colors cursor-pointer whitespace-nowrap " + focus + " pointer-coarse:h-10 pointer-coarse:px-4 " + tap,
  // the mode switch: underline tabs
  tabs: "flex flex-wrap items-end gap-1 border-b border-border-default mb-3",
  tab: "px-3 py-2 -mb-px text-sm font-medium text-text-muted border-b-2 border-transparent hover:text-text-default "
    + "cursor-pointer whitespace-nowrap " + focus + " [&.on]:text-primary-500 [&.on]:border-primary-500 [&.on]:font-semibold"
    + " dark:[&.on]:text-primary-400 dark:[&.on]:border-primary-400",
  select: "appearance-none w-full pl-3 pr-10 py-1.5 cursor-pointer pointer-coarse:py-2 " + control,
  listbox: "w-full px-2 py-1 " + control,
  selectWrap: "relative w-full",
  chevron: "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted",
  field: "w-full px-3 py-1.5 caret-primary-500 pointer-coarse:py-2 " + control,
  num: "w-20 flex-none text-right px-2 py-1.5 caret-primary-500 pointer-coarse:py-2 " + control,   // a number beside a slider
  check: "w-4 h-4 mt-1 flex-none accent-primary-500 cursor-pointer pointer-coarse:w-5 pointer-coarse:h-5 pointer-coarse:mt-0.5",
  range: "w-full flex-1 min-w-0 accent-primary-500 cursor-pointer pointer-coarse:h-8",
  color: "h-8 w-12 flex-none p-0.5 bg-input-bg border border-input-border rounded-lg cursor-pointer " + focus,
  label: "block text-sm font-medium text-text-default mt-3 mb-1 leading-normal",
  checkLabel: "flex items-start gap-2 text-sm text-text-default mt-2 leading-normal cursor-pointer",
  hint: "text-xs text-text-muted mt-2 leading-relaxed",
  row: "flex items-center gap-2",
  buttons: "flex flex-wrap gap-2",
  grid2: "grid grid-cols-2 gap-x-3 gap-y-1",
  unit: "text-xs text-text-muted min-w-5",
  value: "text-xs text-text-muted min-w-12 text-right tabular-nums",
  summary: "cursor-pointer text-sm font-medium text-text-muted hover:text-text-default select-none",
  link: "text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline underline-offset-2",
  viewTag: "text-xs text-text-muted",
  touchbar: "flex-wrap gap-2 mb-3",
  status: "text-sm text-text-default min-h-6 mt-2",
};
const CHEVRON = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>';
const add = (el, cls) => { for (const c of cls.split(/\s+/)) if (c) el.classList.add(c); };

function wrapSelect(sel){
  if (sel.parentElement && sel.parentElement.dataset.uiWrap) return;
  const wrap = document.createElement("div"); wrap.dataset.uiWrap = "1"; add(wrap, UI.selectWrap);
  // a select that sat in a row keeps its share of it
  if (sel.style.width) { wrap.style.width = sel.style.width; sel.style.width = ""; }
  if (sel.style.flex) { wrap.style.flex = sel.style.flex; sel.style.flex = ""; }
  if (sel.parentElement && sel.parentElement.classList.contains("row")) wrap.style.flex = wrap.style.flex || "1";
  sel.parentNode.insertBefore(wrap, sel); wrap.appendChild(sel);
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("fill", "none"); svg.setAttribute("stroke", "currentColor"); svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true"); svg.innerHTML = CHEVRON; svg.setAttribute("class", UI.chevron);
  wrap.appendChild(svg);
}
// one element: its recipe by what it is
function one(el){
  if (el.dataset.ui === "skip" || el.closest("[data-ui=skip]")) return;
  const tag = el.tagName, cls = el.classList;
  if (tag === "SECTION") add(el, UI.card);
  else if (tag === "H2" && el.parentElement && el.parentElement.tagName === "SECTION") add(el, UI.title);
  else if (tag === "BUTTON"){
    if (el.closest("#modes")) add(el, UI.tab);
    else add(el, cls.contains("primary") ? UI.primary : UI.button);
  }
  else if (tag === "SELECT"){
    if (el.size > 1 || el.multiple) add(el, UI.listbox);
    else { add(el, UI.select); wrapSelect(el); }
  }
  else if (tag === "TEXTAREA") add(el, UI.field);
  else if (tag === "INPUT"){
    const t = (el.getAttribute("type") || "text").toLowerCase();
    if (t === "checkbox" || t === "radio") add(el, UI.check);
    else if (t === "range") add(el, UI.range);
    else if (t === "color") add(el, UI.color);
    else if (t !== "file" && t !== "hidden") add(el, cls.contains("num") ? UI.num : UI.field);
  }
  else if (tag === "LABEL") add(el, el.querySelector("input[type=checkbox], input[type=radio]") ? UI.checkLabel : UI.label);
  else if (tag === "SUMMARY") add(el, UI.summary);
  if (cls.contains("hint")) add(el, UI.hint);
  if (cls.contains("row")) add(el, UI.row);
  if (cls.contains("btns")) add(el, UI.buttons);
  if (cls.contains("grid2")) add(el, UI.grid2);
  if (cls.contains("unit")) add(el, UI.unit);
  if (cls.contains("val")) add(el, UI.value);
  if (cls.contains("tag") && el.closest(".view")) add(el, UI.viewTag);
  if (cls.contains("touchbar")) add(el, UI.touchbar);
  if (el.id === "modes") add(el, UI.tabs);
  if (el.id === "status") add(el, UI.status);
  if (tag === "A" && el.closest(".app-header")) add(el, UI.link);
}
const TARGET = "section, h2, button, select, textarea, input, label, summary, .hint, .row, .btns, .grid2, .unit, .val, .tag, .touchbar, #modes, #status, a";
function decorate(root){
  if (!root || root.nodeType !== 1) return;
  if (root.matches(TARGET)) one(root);
  root.querySelectorAll(TARGET).forEach(one);
}
UI.decorate = decorate;
// added nodes get their classes; a button made disabled (or not) also says so to assistive
// technology (melta A11Y_DISABLED_REQUIRES_ARIA)
const ariaDisabled = el => { if (el.tagName === "BUTTON") el.setAttribute("aria-disabled", String(el.disabled)); };
new MutationObserver(list => { for (const m of list){
    if (m.type === "attributes") ariaDisabled(m.target);
    else m.addedNodes.forEach(n => { decorate(n); if (n.nodeType === 1){ if (n.disabled) ariaDisabled(n); n.querySelectorAll && n.querySelectorAll("button[disabled]").forEach(ariaDisabled); } });
  } })
  .observe(document.documentElement, {childList: true, subtree: true, attributes: true, attributeFilter: ["disabled"]});
document.addEventListener("DOMContentLoaded", () => decorate(document.body));
})();
