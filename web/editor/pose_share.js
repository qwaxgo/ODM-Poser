// Posting a pose (index.html, loaded after pose_api.js): X first, then the other networks (NETS).
// Where a network has a post page that takes words from an address, it opens with them; where it
// has none (Instagram, TikTok, KakaoTalk, Discord, Slack, Yay!), a phone hands the post to its share
// menu and a computer copies the words and opens the network. A post is words, #ODMPoser
// #立体人形装置 and a link (Reddit: an English title and the link); the network shows the link as a
// card with the site's picture (web/editor/og-card.png,
// from the page's Open Graph tags: a card cannot show each pose's own picture without a server).
// The link carries the editing state after "#pose=" (the part of an address a server never sees):
// only what differs from a new figure, numbers to 0.1, deflated, base64url. Of the mods only the
// official ones (qwaxgo's, on GitHub) travel: their kinds stay and the link names their GitHub
// files, which whoever opens it may add with one click (never by the link alone). What any other
// mod added becomes a plain shape (a prop: a rod in the hand, a box where it stood; a solid: one of
// the same form), its aura, aura part or hand shape the editor's own, its data is left out; and a
// link that is opened is taken the same way.
// Opening a link keeps what that browser had first (localStorage: a cookie is too small and goes
// to the server) and can bring it back.
(() => {
const SITE = "https://apps.qwaxgo.com/ODM-Poser/editor/";
const TAGS = "#ODMPoser #立体人形装置";
const BACKUP = KEY + "-before-link", HOSTS = KEY + "-share-hosts";
const own = ODMPoser.builtin;

// ---- what can travel: the editor's own kinds and the official mods' ----------------------------------
const SOLID_OF = {box: "box", prism: "prism", cyl: "cylinder", pyr: "pyramid", cone: "cone"};
const officialIds = () => new Set(ODMPoser.officialMods().map(m => m.id));
let used = new Set();                         // the official mods a link being made uses
const keep = (kind, key, ids) => { if (own[kind].has(key)) return true;
  const m = ODMPoser.origin(kind, key); if (m && ids.has(m)){ used.add(m); return true; } return false; };
function plainFigure(f, ids){
  if (f.hands) for (const s of ["r", "l"]) if (!keep("hands", f.hands[s], ids)) f.hands[s] = "relaxed";
  if (Array.isArray(f.items)) f.items = f.items.filter(it => it && typeof it === "object").map(it => {
    if (keep("props", it.key, ids)) return it;
    const d = PROPS[it.key];                  // a mod's prop here; unknown (from a link): left out
    const placed = it.where === "world" || (d && (d.place === "world" || d.place === "grab"));
    if (!d || (!placed && d.place !== "hand")) return null;
    const out = Object.assign({}, it, {key: placed ? "prim_box" : "prim_cylinder"});
    delete out.dims; delete out.bayonet;
    if (placed) out.where = "world";
    return out;
  }).filter(Boolean);
  if (Array.isArray(f.auras)) f.auras = f.auras.filter(a => a && typeof a === "object").map(a => Object.assign({}, a, {
    kind: keep("auras", a.kind, ids) ? a.kind : "glow", part: keep("parts", a.part, ids) ? a.part : "body",
    color: /^#[0-9a-fA-F]{6}$/.test(a.color) ? a.color : undefined}));
  if (typeof f.figName === "string") f.figName = f.figName.slice(0, 40);
}
function plain(st){
  const s = JSON.parse(JSON.stringify(st)), ids = officialIds();
  used = new Set();
  // a mod's own data: the official mods' only
  if (s.mods && typeof s.mods === "object") for (const k of Object.keys(s.mods)) if (ids.has(k)) used.add(k); else delete s.mods[k];
  plainFigure(s, ids); (s.others || []).forEach(f => plainFigure(f, ids));
  if (Array.isArray(s.solids)) s.solids = s.solids.filter(o => o && typeof o === "object").map(o => {
    if (keep("solids", o.kind, ids)) return o;
    const k = SOLID_KINDS[o.kind];
    return Object.assign({}, o, {kind: (k && SOLID_OF[k.shape]) || "box"});
  });
  return s;
}

// ---- the state as text for an address -------------------------------------------------------------
const toB64u = bytes => { let s = ""; for (let k = 0; k < bytes.length; k += 0x8000) s += String.fromCharCode(...bytes.subarray(k, k + 0x8000));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
const fromB64u = t => { const s = atob(t.replace(/-/g, "+").replace(/_/g, "/")); const b = new Uint8Array(s.length);
  for (let k = 0; k < s.length; k++) b[k] = s.charCodeAt(k); return b; };
async function pack(obj){
  const text = JSON.stringify(obj, (k, v) => typeof v === "number" ? Math.round(v * 10) / 10 : v);
  if (typeof CompressionStream !== "function") return "j" + toB64u(new TextEncoder().encode(text));
  const z = new Blob([text]).stream().pipeThrough(new CompressionStream("deflate-raw"));
  return "z" + toB64u(new Uint8Array(await new Response(z).arrayBuffer()));
}
async function unpack(code){
  const bytes = fromB64u(code.slice(1));
  if (code[0] === "j") return JSON.parse(new TextDecoder().decode(bytes));
  const z = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return JSON.parse(await new Response(z).text());
}
// only what differs from a new figure (a link should stay short: some networks count it in full)
async function poseLink(){
  const s = plain(S), base = fresh(), diff = {};
  for (const k of Object.keys(s)) if (JSON.stringify(s[k]) !== JSON.stringify(base[k])) diff[k] = s[k];
  const mods = ODMPoser.officialMods().filter(m => used.has(m.id)).map(m => m.url);
  return SITE + "#pose=" + await pack(mods.length ? {v: 1, s: diff, mods} : {v: 1, s: diff});
}

// ---- the panel -------------------------------------------------------------------------------------
const field = "width:100%;background:var(--field);color:var(--ink);border:1px solid var(--line);border-radius:6px;padding:5px 7px;font:inherit;font-size:13px";
const sec = document.createElement("section");
sec.innerHTML = `<h2>SNS に投稿</h2>
  <label style="margin-top:0">ひとこと（なくても可）</label>
  <textarea id="shText" rows="2" style="${field};resize:vertical"></textarea>
  <label><input type="checkbox" id="shLink" checked> 編集データを入れたリンクにする（開くと同じ人物・小物・カメラになります）</label>
  <div class="btns" id="shMain" style="margin-top:6px"></div>
  <details style="margin-top:6px"><summary class="hint" style="cursor:pointer">そのほかの SNS・チャット</summary>
    <div class="btns" id="shMore" style="margin-top:6px"></div></details>
  <div class="btns" style="margin-top:6px"><button id="shOther">ほかのアプリ（共有メニュー）</button><button id="shCopy">リンクをコピー</button></div>
  <details style="margin-top:6px"><summary class="hint" style="cursor:pointer">Misskey・Mastodon のサーバー</summary>
    <div class="grid2"><div><label>Misskey</label><select id="shSrvMisskey"></select>
        <input type="text" id="shHostMisskey" placeholder="example.com" inputmode="url" style="${field};margin-top:4px;display:none"></div>
      <div><label>Mastodon</label><select id="shSrvMastodon"></select>
        <input type="text" id="shHostMastodon" placeholder="example.com" inputmode="url" style="${field};margin-top:4px;display:none"></div></div></details>
  <div id="shMods" style="display:none;margin-top:8px"><div id="shModList" class="hint" style="white-space:pre-wrap"></div>
    <div class="btns" style="margin-top:4px"><button id="shModAdd">公式 MOD を追加して開き直す</button></div></div>
  <div id="shBack" class="btns" style="display:none;margin-top:8px"><button id="shRestore">リンクを開く前の編集に戻す</button></div>
  <div class="hint">投稿には ${TAGS} とリンクが付き、リンクは「立体人形装置」の画像付きカードで表示されます。リンクに入る MOD は公式（GitHub の qwaxgo）のものだけで、ほかの MOD の小物・物体は単純な図形や棒になります。</div>`;
const exportSec = $("saveAtari").closest("section");
exportSec.parentNode.insertBefore(sec, exportSec.nextSibling);

// the networks: url(post, server) opens a page with the post; app: no such page (the share menu on
// a phone; on a computer the words are copied and `open` is opened); copy: the words are copied as
// well (the page takes the link only); max: the network's length (over it, the plain site link)
const enc = encodeURIComponent;
const english = w => w && /^[\x20-\x7E]+$/.test(w) ? w : "Made a pose with ODM Poser, a free pseudo-3D pose editor";
const NETS = [
  {id: "x", name: "X に投稿", main: true, url: p => "https://x.com/intent/post?text=" + enc(p.text)},
  {id: "bsky", name: "Bluesky", main: true, url: p => "https://bsky.app/intent/compose?text=" + enc(p.text)},
  {id: "threads", name: "Threads", main: true, max: 500, url: p => "https://www.threads.net/intent/post?text=" + enc(p.text)},
  {id: "misskey", name: "Misskey", main: true, server: true, url: (p, h) => `https://${h}/share?text=` + enc(p.text)},
  {id: "mastodon", name: "Mastodon", main: true, server: true, url: (p, h) => `https://${h}/share?text=` + enc(p.text)},
  {id: "facebook", name: "Facebook", copy: true, url: p => "https://www.facebook.com/sharer/sharer.php?u=" + enc(p.link)},
  {id: "reddit", name: "Reddit（英文）", url: p => "https://www.reddit.com/submit?url=" + enc(p.link) + "&title=" + enc(english(p.words))},
  {id: "line", name: "LINE", url: p => document.body.classList.contains("touch")
    ? "https://line.me/R/share?text=" + enc(p.text) : "https://social-plugins.line.me/lineit/share?url=" + enc(p.link)},
  {id: "openchat", name: "オープンチャット", url: p => "https://line.me/R/share?text=" + enc(p.text)},
  {id: "teams", name: "Teams", url: p => "https://teams.microsoft.com/share?href=" + enc(p.link) + "&msgText=" + enc(p.head)},
  {id: "pinterest", name: "Pinterest", url: p => "https://www.pinterest.com/pin/create/button/?url=" + enc(p.link)
    + "&media=" + enc(SITE + "og-card.png") + "&description=" + enc(p.head)},
  {id: "instagram", name: "Instagram", app: true, open: "https://www.instagram.com/"},
  {id: "tiktok", name: "TikTok", app: true, open: "https://www.tiktok.com/"},
  {id: "kakao", name: "カカオトーク", app: true},
  {id: "discord", name: "Discord", app: true, open: "https://discord.com/app"},
  {id: "slack", name: "Slack", app: true, open: "https://app.slack.com/client"},
  {id: "yay", name: "Yay!", app: true, open: "https://yay.space/"},
];
const netId = n => ({x: "shX", bsky: "shBsky", misskey: "shMisskey", mastodon: "shMastodon"})[n.id] || "sh_" + n.id;
for (const n of NETS){
  const b = document.createElement("button"); b.id = netId(n); b.textContent = n.name;
  if (n.id === "x") b.className = "primary";
  $(n.main ? "shMain" : "shMore").appendChild(b);
}

// Misskey and Mastodon: a few servers to pick, or one's own typed in (kept in this browser)
const SERVERS = {
  misskey: [["misskey.io", "misskey.io"], ["misskey.dev", "misskey.dev"], ["misskey.systems", "みすてむず（misskey.systems）"]],
  mastodon: [["pawoo.net", "Pawoo（pawoo.net）"], ["mstdn.jp", "mstdn.jp"], ["fedibird.com", "Fedibird（fedibird.com）"]],
};
const NAME = {misskey: "Misskey", mastodon: "Mastodon"};
let hosts = {}; try { hosts = JSON.parse(localStorage.getItem(HOSTS) || "{}") || {}; } catch (e) {}
const cleanHost = t => String(t || "").trim().replace(/^https?:\/\//i, "").replace(/[/?#].*$/, "").toLowerCase();
const okHost = h => /^[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?$/.test(h);
function keepHosts(){ try { localStorage.setItem(HOSTS, JSON.stringify(hosts)); } catch (e) {} }
const host = net => okHost(hosts[net] || "") ? hosts[net] : SERVERS[net][0][0];
function showHosts(){
  for (const net of ["misskey", "mastodon"]){
    const cap = NAME[net][0].toUpperCase() + NAME[net].slice(1), sel = $("shSrv" + cap), own = $("shHost" + cap), h = host(net);
    const listed = SERVERS[net].some(([v]) => v === h);
    sel.value = listed ? h : "own";
    own.style.display = listed ? "none" : ""; if (!listed) own.value = h;
    $("sh" + cap).textContent = `${NAME[net]}（${h}）`;
  }
}
for (const net of ["misskey", "mastodon"]){
  const cap = NAME[net][0].toUpperCase() + NAME[net].slice(1), sel = $("shSrv" + cap), own = $("shHost" + cap);
  sel.innerHTML = SERVERS[net].map(([v, t]) => `<option value="${v}">${t}</option>`).join("") + `<option value="own">その他（自分で入力）</option>`;
  sel.addEventListener("change", () => {
    // one's own: the field opens; the server counts once a valid address is typed
    if (sel.value === "own"){ own.style.display = ""; own.focus();
      if (okHost(cleanHost(own.value))){ hosts[net] = cleanHost(own.value); keepHosts(); showHosts(); } return; }
    hosts[net] = sel.value; keepHosts(); showHosts();
  });
  own.addEventListener("change", () => { const h = cleanHost(own.value); own.value = h;
    if (okHost(h)){ hosts[net] = h; keepHosts(); showHosts(); } else say("サーバーのアドレスを入れてください（例：example.com）。", true); });
}
showHosts();

// the post: words, the tags (head) and the link; siteOnly: the plain site link
async function postText(siteOnly){
  const words = $("shText").value.trim(), head = (words ? words + "\n" : "") + TAGS;
  const link = $("shLink").checked && !siteOnly ? await poseLink() : SITE;
  return {words, head, link, text: head + "\n" + link};
}
async function copyText(t){ try { await navigator.clipboard.writeText(t); return true; } catch (e) { return false; } }
for (const n of NETS) $(netId(n)).addEventListener("click", async () => {
  const touch = document.body.classList.contains("touch"), label = n.name.replace(/（.*$/, "").replace(/ に投稿$/, "");
  if (n.app && touch && navigator.share){        // a phone: the share menu, where the app is
    const p = await postText();
    try { await navigator.share({text: p.head, url: p.link}); return; } catch (e) { if (e && e.name === "AbortError") return; }
  }
  // a page opened now, while the click counts (one opened later may be blocked)
  const win = n.url || n.open ? window.open("", "_blank") : null;
  if (win) win.opener = null;
  let p = await postText(), short = false;
  if (n.max && p.text.length > n.max){ p = await postText(true); short = true; }
  const url = n.url ? n.url(p, n.server ? host(n.id) : null) : n.open;
  const copied = (n.app || n.copy) ? await copyText(n.app ? p.text : p.head) : false;
  if (url){ if (win) win.location.href = url; else window.open(url, "_blank", "noopener"); } else if (win) win.close();
  say(n.app ? (copied ? `投稿の文をコピーしました。${label}に貼り付けてください。` : `${label}には、この文を貼り付けてください：${p.text}`)
    : short ? `${label}は文字数の上限があるため、編集データの入らないサイトのリンクにしました。`
    : n.copy && copied ? `${label}の投稿画面を開き、ひとことをコピーしました（貼り付けて使えます）。` : "投稿画面を開きました。");
});
$("shOther").addEventListener("click", async () => {
  const {words, link, text} = await postText();
  if (navigator.share){
    try { await navigator.share({text: (words ? words + "\n" : "") + TAGS, url: link}); return; }
    catch (e) { if (e && e.name === "AbortError") return; }
  }
  try { await navigator.clipboard.writeText(text); say("この端末には共有メニューがないため、投稿の文をコピーしました。"); }
  catch (e) { prompt("この文をコピーしてください", text); }
});
$("shCopy").addEventListener("click", async () => {
  const link = $("shLink").checked ? await poseLink() : SITE;
  try { await navigator.clipboard.writeText(link); say(`リンクをコピーしました（${link.length} 文字）。`); }
  catch (e) { prompt("このリンクをコピーしてください", link); }
});

// ---- opening a link -------------------------------------------------------------------------------
function showBackup(){ let has = false; try { has = !!localStorage.getItem(BACKUP); } catch (e) {} $("shBack").style.display = has ? "" : "none"; }
let linkData = null;                          // the link opened last (taken again once its mods are added)
async function openLink(){
  const m = location.hash.match(/^#pose=([jz][A-Za-z0-9_-]+)$/);
  if (!m) return;
  window.history.replaceState(null, "", location.pathname + location.search);   // a reload keeps later edits ("history" is the undo list)
  const bad = () => say("リンクの編集データを読めませんでした（壊れているか、このブラウザが対応していません）。", true);
  let d; try { d = await unpack(m[1]); } catch (e) { bad(); return; }
  if (!d || typeof d.s !== "object" || !d.s || Array.isArray(d.s)) { bad(); return; }
  if (ODMPoser.modsReady) await ODMPoser.modsReady;   // mods this browser has already: their kinds count
  if (!apply(d, true)) { bad(); return; }
  linkData = d;
  // official mods the pose uses that this browser has not: offered, added only on the click
  const have = new Set(ODMPoser.officialMods().map(x => x.url));
  const missing = (Array.isArray(d.mods) ? d.mods : []).filter(u => typeof u === "string" && ODMPoser.isOfficial(u) && !have.has(u));
  $("shMods").style.display = missing.length ? "" : "none";
  if (missing.length){
    $("shModList").textContent = "このポーズは公式 MOD（GitHub の qwaxgo）を使っています。追加すると MOD の小物なども再現されます（今は単純な図形で表示しています）：\n" + missing.join("\n");
    $("shModAdd").dataset.urls = JSON.stringify(missing);
    sec.scrollIntoView({block: "nearest"});
  }
}
function apply(d, first){
  let st;
  try { st = plain(Object.assign(fresh(), d.s)); migrate(st); } catch (e) { return false; }
  if (!Array.isArray(st.P) || st.P.length !== J.length || !st.P.every(p => Array.isArray(p) && p.length === 3 && p.every(Number.isFinite))) return false;
  // what this browser had: kept, to bring back (not when it is the untouched figure)
  const base = fresh();
  if (first && (JSON.stringify(S.P) !== JSON.stringify(base.P) || (S.items || []).length || (S.solids || []).length || (S.others || []).length)){
    try { localStorage.setItem(BACKUP, JSON.stringify({at: Date.now(), s: S})); } catch (e) {}
  }
  remember(); S = st; syncUI(); draw(); showBackup();
  say("リンクの編集データを開きました。" + ($("shBack").style.display === "none" ? "" : "前の編集は「リンクを開く前の編集に戻す」で戻せます。"));
  return true;
}
$("shModAdd").addEventListener("click", async () => {
  let urls = []; try { urls = JSON.parse($("shModAdd").dataset.urls || "[]"); } catch (e) {}
  const failed = [];
  for (const u of urls) if (!(await ODMPoser.addOfficialMod(u))) failed.push(u);
  if (linkData) apply(linkData, false);
  $("shMods").style.display = failed.length ? "" : "none";
  if (failed.length) say("追加できなかった MOD があります：" + failed.join("、"), true);
});
$("shRestore").addEventListener("click", () => {
  let b = null; try { b = JSON.parse(localStorage.getItem(BACKUP) || "null"); } catch (e) {}
  if (!b || !b.s) return;
  migrate(b.s); remember(); S = Object.assign(fresh(), b.s); syncUI(); draw();
  try { localStorage.removeItem(BACKUP); } catch (e) {}
  showBackup(); say("リンクを開く前の編集に戻しました（元に戻すで、リンクの編集データに戻れます）。");
});
showBackup();
openLink();
addEventListener("hashchange", openLink);
})();
