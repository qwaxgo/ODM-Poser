// 作業ログ (index.html, loaded after ui-menu.js): every edit is written down with the time and what
// was done (the message the editor gave, else the mode), and any of them can be brought back, like
// a long undo that keeps going both ways: bringing one back is itself written down. The last
// LOG_MAX are kept in this browser, so the log is still there after a reload.
(() => {
const LOG_MAX = 100, LOG_KEY = KEY + "-log";
const HINT = `操作のたびに、時刻とした事を書き留めます（新しい ${LOG_MAX} 件、このブラウザに保存）。元に戻す・やり直すと違い、どの時点にも戻れます。戻したこと自体もログに残るので、戻す前にもまた戻れます。行はダブルクリックでも戻せます。`;
const MODE_JA = {pose: "ポーズの操作", body: "体格の操作", persp: "カメラ・パースの操作", place: "配置の操作"};
let log = [], pick = -1, pending = false, label = "", timer = 0, down = 0;
try { const d = JSON.parse(localStorage.getItem(LOG_KEY) || "[]"); if (Array.isArray(d)) log = d.filter(e => e && e.s && e.t); } catch (e) {}

const sec = document.createElement("section");
sec.dataset.menu = "log";
sec.innerHTML = `<h2>作業ログ</h2>
  <ol class="tree log" id="logList" tabindex="0" aria-label="作業ログ"></ol>
  <div class="btns"><button type="button" id="logBack">この時点に戻す</button><button type="button" id="logClear">ログを消す</button></div>
  <div class="hint">${HINT}</div>`;
document.querySelector("aside").appendChild(sec);
const list = sec.querySelector("#logList");

const two = n => String(n).padStart(2, "0");
function when(t){
  const d = new Date(t), now = new Date(), hm = `${two(d.getHours())}:${two(d.getMinutes())}:${two(d.getSeconds())}`;
  return d.toDateString() === now.toDateString() ? hm : `${d.getMonth() + 1}/${d.getDate()} ${hm}`;
}
function save(){
  for (let tries = 0; tries < 4; tries++){
    try { localStorage.setItem(LOG_KEY, JSON.stringify(log)); return; }
    catch (e) { if (log.length < 4) return; log = log.slice(Math.floor(log.length / 2)); }   // too big: keep the newer half
  }
}
function render(){
  if (!sec.classList.contains("active")) return;
  const now = JSON.stringify(S);
  list.replaceChildren();
  for (let k = log.length - 1; k >= 0; k--){
    const e = log[k], li = document.createElement("li");
    li.className = "tree-row" + (k === pick ? " on" : "") + (e.s === now ? " now" : "");
    li.dataset.k = k; li.title = e.s === now ? "いまの状態" : "";
    const t = document.createElement("span"); t.className = "log-time"; t.textContent = when(e.t);
    const n = document.createElement("span"); n.className = "log-what"; n.textContent = e.label;
    li.append(t, n); list.appendChild(li);
  }
  if (!log.length){ const li = document.createElement("li"); li.className = "tree-group"; li.textContent = "まだ何もありません。"; list.appendChild(li); }
  sec.querySelector("#logBack").disabled = !log[pick];
}
function add(what){
  const s = JSON.stringify(S);
  if (log.length && log[log.length - 1].s === s) return;
  log.push({t: Date.now(), label: what, s});
  if (log.length > LOG_MAX) log.splice(0, log.length - LOG_MAX);
  pick = -1; save(); render();
}
function commit(){
  if (down){ timer = setTimeout(commit, 400); return; }      // a drag goes on: wait for its end
  pending = false; add(label || MODE_JA[mode] || "操作");
}
// the editor's undo point marks an edit about to happen; its message (say / toast) names it
{ const rem = remember;
  remember = function(){ rem.apply(this, arguments); if (!pending) label = ""; pending = true; clearTimeout(timer); timer = setTimeout(commit, 700); };
  const sy = say;
  say = function(msg, warn){ sy.apply(this, arguments); if (pending && !warn && msg) label = String(msg); };
  if (typeof toast === "function"){ const ts = toast;
    toast = function(msg, warn){ ts.apply(this, arguments); if (pending && !warn && msg) label = String(msg); }; }
}
// a button held down (a drag): the log waits for it; a move with nothing held clears a lost release
addEventListener("pointerdown", e => { down = e.buttons || 1; }, true);
addEventListener("pointermove", e => { if (!e.buttons) down = 0; }, true);
for (const ev of ["pointerup", "pointercancel"]) addEventListener(ev, () => { down = 0; }, true);
addEventListener("blur", () => { down = 0; });

function back(k){
  const e = log[k]; if (!e) return;
  remember(); restore(e.s);
  say(`${when(e.t)}「${e.label}」の時点に戻しました。`);
}
// a click only moves the mark (the rows stay, so a double-click lands on the same one)
function mark(){ list.querySelectorAll("li[data-k]").forEach(li => li.classList.toggle("on", +li.dataset.k === pick));
  sec.querySelector("#logBack").disabled = !log[pick]; }
list.addEventListener("click", e => { const li = e.target.closest("li[data-k]"); if (!li) return; pick = +li.dataset.k; mark(); });
list.addEventListener("dblclick", e => { const li = e.target.closest("li[data-k]"); if (li) back(+li.dataset.k); });
list.addEventListener("keydown", e => {
  if (e.key === "Enter" && log[pick]){ back(pick); e.preventDefault(); return; }
  const d = e.key === "ArrowDown" ? -1 : e.key === "ArrowUp" ? 1 : 0; if (!d) return;   // the list is newest first
  pick = Math.max(0, Math.min(log.length - 1, (pick < 0 ? log.length : pick) + d)); mark(); e.preventDefault();
});
sec.querySelector("#logBack").addEventListener("click", () => back(pick));
sec.querySelector("#logClear").addEventListener("click", () => {
  if (!confirm("作業ログを消しますか？（いまの状態はそのままです）")) return;
  log = []; pick = -1; add("ログを消した時点"); say("作業ログを消しました。");
});
// shown again when its tab opens
new MutationObserver(render).observe(sec, {attributes: true, attributeFilter: ["class"]});
const ov = document.getElementById("ovLog");
if (ov) ov.addEventListener("click", () => { if (window.ODMUI && ODMUI.showMenu) ODMUI.showMenu("log");
  document.getElementById("logList").scrollIntoView({block: "nearest"}); });

if (window.ODMPoserI18n) window.ODMPoserI18n.add({"作業ログ": "History", "この時点に戻す": "Go back to this point", "ログを消す": "Clear the history",
  "まだ何もありません。": "Nothing yet.", "いまの状態": "The state now", "ポーズの操作": "Pose edit", "体格の操作": "Body edit",
  "カメラ・パースの操作": "Camera / perspective edit", "配置の操作": "Placing edit", "操作": "Edit", "開いた時の状態": "When opened",
  "ログを消した時点": "History cleared", "作業ログを消しました。": "The history was cleared.",
  "作業ログを消しますか？（いまの状態はそのままです）": "Clear the history? (The state now stays.)",
  [HINT]:
    `Each edit is written down with the time and what was done (the newest ${LOG_MAX}, kept in this browser). Unlike undo / redo you can go back to any point, and going back is written down too, so you can return to before it. Double-click a row to go back too.`});
add("開いた時の状態");
})();
