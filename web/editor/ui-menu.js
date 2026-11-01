// The side panel's menu (#menuBar), three levels: a big group (作る / 見る / 出す), its categories,
// and the category's tabs. A tab shows its sections (aside > section[data-menu], a section may name
// several tabs). Sections the modules build are split at each heading (h2) and put under a tab by
// what they hold; the elements are moved, not copied, so their handlers stay. A tab also switches
// the editing mode it goes with (#modes), and a mode switch opens its tab.
// Mods add tabs with ODMUI.addMenu (pose_api.js: api.ui.addMenu), naming the group and category
// they go in (an existing one by its id, or a new one {id, title, icon}).
(() => {
  const aside = document.querySelector("aside"), nav = document.getElementById("menuBar");
  const IC = window.ODMICONS || {svg: () => ""};
  const leaf = (id, title, icon, tip) => ({id, title, icon, tip});
  const TREE = [
    {id: "make", title: "作る", icon: "PencilDraw", kids: [
      {id: "figure", title: "人物", icon: "Person", kids: [leaf("pose", "ポーズ", "Pose"), leaf("preset", "プリセット", "Collection"),
        leaf("body", "体格", "Body"), leaf("size", "サイズ", "FrameSize"), leaf("colors", "色", "Palette", "線の色（人物・物・床などをまとめて）")]},
      {id: "things", title: "物と場所", icon: "Home", kids: [leaf("equip", "装備", "Fashion", "選んだ人物に持たせる・身に着ける・まとう"),
        leaf("objects", "設置", "AddModel", "人物から離れた物体を置く"), leaf("place", "配置", "Move1", "床・壁・天井、つかまる、ワイヤー")]}]},
    {id: "look", title: "見る", icon: "View", kids: [
      {id: "scenes", title: "シーン", icon: "Users", kids: [leaf("scene", "管理", "ViewList", "出ている人物・物の管理"),
        leaf("log", "作業ログ", "Undo", "した操作の一覧。どの時点にも戻せる")]},
      {id: "viewpoint", title: "視点", icon: "Fov", kids: [leaf("camera", "カメラ", "Camera", "カメラとパース"), leaf("ruler", "定規", "ruler", "パース定規")]}]},
    {id: "out", title: "出す", icon: "Send", kids: [
      {id: "file", title: "ファイル", icon: "File", kids: [leaf("import", "読込", "Upload", "保存したポーズを開く"),
        leaf("export", "書き出し", "DownloadAlt", "画像・ポーズを書き出す"), leaf("share", "共有", "ShareAndroid", "SNS に投稿、リンクをコピー"),
        leaf("mod", "MOD", "Codes", "MOD の管理")]}]}];
  // a part of a module's panel -> its tab, by an element it holds
  const BY_ID = [["scCat", "equip"], ["auPart", "equip"], ["soKind", "objects"], ["castList", "scene"],
    ["scFloor", "place"], ["scWire", "place"], ["pc_head", "colors"], ["shText", "share"], ["modBox", "mod"]];
  const MODE_OF = {pose: "pose", body: "body", size: "body", camera: "persp", place: "place", objects: "place"};
  const MENU_OF = {pose: "pose", body: "body", persp: "camera", place: "objects"};
  // English (i18n.js translates the text as it is shown)
  const EN = {"作る": "Make", "見る": "View", "出す": "Output", "人物": "Figure", "物と場所": "Things & places", "シーン": "Scene",
    "視点": "Viewpoint", "ファイル": "File", "ポーズ": "Pose", "プリセット": "Presets", "体格": "Body", "サイズ": "Sizes", "色": "Colors",
    "装備": "Equip", "設置": "Objects", "配置": "Place", "管理": "Manage", "カメラ": "Camera", "定規": "Ruler", "読込": "Open",
    "書き出し": "Export", "共有": "Share", "パース": "Perspective", "›": "›", "メニュー": "Menu",
    "線の色（人物・物・床などをまとめて）": "Line colours (figures, things, floor ... in one place)",
    "選んだ人物に持たせる・身に着ける・まとう": "Give the selected figure something to hold, wear or be wrapped in",
    "人物から離れた物体を置く": "Put objects apart from the figure", "床・壁・天井、つかまる、ワイヤー": "Floor, wall, ceiling; grabbing; wire",
    "出ている人物・物の管理": "The figures and things in the scene", "カメラとパース": "Camera and perspective", "パース定規": "Perspective ruler",
    "保存したポーズを開く": "Open a saved pose", "画像・ポーズを書き出す": "Export pictures and poses", "SNS に投稿、リンクをコピー": "Post to social media, copy the link",
    "MOD の管理": "Manage mods", "した操作の一覧。どの時点にも戻せる": "What you did, step by step; go back to any point", "メニューを開く・閉じる": "Open / close the menu",
    "骨の長さを保って関節を動かす": "Move the joints, keeping the bone lengths", "骨の長さ・丸の太さを変える": "Change the bone lengths and the circles' sizes",
    "カメラとレンズ（パース）を動かす": "Move the camera and the lens (perspective)", "定規・物体を動かす（カメラは動かない）": "Move the ruler and objects (the camera stays)",
    "モードを隠す": "Hide the modes", "モードを出す": "Show the modes", "表示の切り替えを隠す": "Hide the switches", "表示の切り替えを出す": "Show the switches"};
  if (window.ODMPoserI18n) window.ODMPoserI18n.add(EN);
  const lastMid = {}, lastLeaf = {};
  let current = "", busy = false;

  const icon = name => typeof name === "string" && name.trim().startsWith("<svg") ? name : IC.svg(name) || IC.svg("Codes");
  function where(id){
    for (const t of TREE) for (const m of t.kids) for (const l of m.kids) if (l.id === id) return {t, m, l};
    return null;
  }
  function button(node, row, on){
    const b = document.createElement("button");
    b.type = "button"; b.className = "menu-btn" + (on ? " active" : ""); b.dataset.menu = node.id;
    b.setAttribute("aria-pressed", String(on)); if (node.tip) b.title = node.tip;
    b.innerHTML = icon(node.icon); const s = document.createElement("span"); s.textContent = node.title; b.appendChild(s);
    b.addEventListener("click", () => {
      if (row === "top"){ const m = node.kids.find(k => k.id === lastMid[node.id]) || node.kids[0]; choose(lastLeaf[m.id] || m.kids[0].id); }
      else if (row === "mid") choose(lastLeaf[node.id] || node.kids[0].id);
      else { choose(node.id); nav.classList.remove("open"); }
    });
    return b;
  }
  // phones (narrow or touch screens): the three rows fold under one ☰ button that shows where you are
  function burger(w){
    const b = document.createElement("button");
    b.type = "button"; b.className = "menu-btn menu-burger"; b.title = "メニューを開く・閉じる";
    b.setAttribute("aria-expanded", String(nav.classList.contains("open")));
    b.innerHTML = icon("Menu") + icon(w.l.icon);
    for (const t of [w.m.title, "›", w.l.title]){ const s = document.createElement("span"); s.textContent = t; b.appendChild(s); }
    b.addEventListener("click", () => { nav.classList.toggle("open"); b.setAttribute("aria-expanded", String(nav.classList.contains("open"))); });
    return b;
  }
  // the panel above or below the views: the menu is one column, a tree that opens under the
  // group and the category you are in (作る › 人物 › ポーズ ...)
  const strip = () => { const bc = document.body.classList; return !bc.contains("split") && (bc.contains("aside-top") || bc.contains("aside-bottom")); };
  // 全身図 (ui-figure.js) shows only under 人物
  const figure = () => document.getElementById("figCtx") || figure.el;
  function render(){
    const w = where(current); if (!w) return;
    const fig = figure(); if (fig) figure.el = fig;
    const row = (cls, label, nodes, onId, kind) => { const d = document.createElement("div");
      d.className = "menu-row " + cls; d.setAttribute("role", "group"); d.setAttribute("aria-label", label);
      nodes.forEach(n => d.appendChild(button(n, kind, n.id === onId))); return d; };
    const withFig = w.m.id === "figure" && fig ? [fig] : [];
    if (strip()){
      const d = document.createElement("div"); d.className = "menu-tree"; d.setAttribute("role", "group"); d.setAttribute("aria-label", "メニュー");
      for (const t of TREE){
        d.appendChild(button(t, "top", t === w.t)).classList.add("lv0");
        if (t !== w.t) continue;
        for (const m of t.kids){
          d.appendChild(button(m, "mid", m === w.m)).classList.add("lv1");
          if (m !== w.m) continue;
          for (const l of m.kids) d.appendChild(button(l, "leaf", l === w.l)).classList.add("lv2");
          d.append(...withFig);
        }
      }
      nav.replaceChildren(d);
    }
    else nav.replaceChildren(burger(w), row("menu-top", "大きな分類", TREE, w.t.id, "top"), row("menu-mid", "分類", w.t.kids, w.m.id, "mid"),
      row("menu-leaf", "メニュー", w.m.kids, w.l.id, "leaf"), ...withFig);
  }
  { let was = strip();                          // the panel moved: the menu takes its other shape
    new MutationObserver(() => { if (strip() !== was){ was = strip(); render(); } }).observe(document.body, {attributes: true, attributeFilter: ["class"]}); }
  function menuFor(sec){
    if (sec.dataset.mod) return "mod";
    for (const [id, m] of BY_ID) if (sec.querySelector("#" + CSS.escape(id))) return m;
    return "mod";
  }
  function split(sec){                          // one section per heading
    const heads = [...sec.children].filter(el => el.tagName === "H2");
    if (heads.length < 2) return [sec];
    const out = [sec];
    for (const h of heads.slice(1)){
      const part = document.createElement("section");
      h.style.marginTop = "";
      while (h.nextSibling) part.appendChild(h.nextSibling);
      part.prepend(h);
      out[out.length - 1].after(part);
      out.push(part);
    }
    return out;
  }
  function adopt(sec){
    if (sec.dataset.menu) return;
    for (const part of split(sec)) part.dataset.menu = menuFor(part);
  }
  function show(name){
    const w = where(name); if (!w) return;
    current = name; lastMid[w.t.id] = w.m.id; lastLeaf[w.m.id] = name;
    aside.querySelectorAll(":scope > section").forEach(s => { const m = (s.dataset.menu || "").split(" ");
      s.classList.toggle("active", m.includes(name) || m.includes("*")); });   // "*": in every tab (a mod's at: "top")
    render();
  }
  function choose(name){
    show(name);
    const mode = MODE_OF[name], btn = mode && document.querySelector(`#modes [data-mode="${mode}"]`);
    if (btn && !btn.classList.contains("on")){ busy = true; btn.click(); busy = false; }
  }
  // a tab of a mod's: {id, title, icon, tip, top: id | {id, title, icon}, mid: id | {id, title, icon}}
  function addMenu({id, title, icon, tip, top = "out", mid = "file"}){
    if (!id || where(id)) return false;
    const pick = (list, spec, withKids) => { const s = typeof spec === "string" ? {id: spec} : spec || {};
      let n = list.find(x => x.id === s.id);
      if (!n){ n = {id: s.id || ("m" + list.length), title: s.title || s.id, icon: s.icon || "Codes", kids: []}; list.push(n); }
      return n; };
    const t = pick(TREE, top), m = pick(t.kids, mid);
    m.kids.push(leaf(id, title || id, icon || "Codes", tip));
    if (current) render();
    return true;
  }
  (window.ODMUI = window.ODMUI || {}).addMenu = addMenu;
  window.ODMUI.showMenu = choose;
  window.ODMUI.renderMenu = render;
  window.ODMUI.hasMenu = id => !!where(id);

  // the mode buttons on the view: their icons; the corners fold away (kept in this browser)
  document.querySelectorAll(".ov [data-icon]").forEach(b => b.insertAdjacentHTML("afterbegin", icon(b.dataset.icon)));
  for (const [id, to] of [["ovUndo", "undo"], ["ovRedo", "redo"]]){ const b = document.getElementById(id), t = document.getElementById(to);
    if (b && t) b.addEventListener("click", () => t.click()); }
  document.querySelectorAll(".ov").forEach(ov => {
    const btn = ov.querySelector(".ov-fold"), key = "odm-poser-fold-" + ov.id, left = ov.classList.contains("ov-tl");
    const name = left ? "モード" : "表示の切り替え";
    const set = folded => { ov.classList.toggle("folded", folded); btn.setAttribute("aria-expanded", String(!folded));
      btn.textContent = folded === left ? "›" : "‹"; btn.title = `${name}を${folded ? "出す" : "隠す"}`; };
    // not chosen yet: on a phone the switches start folded, so the figure shows
    let folded = ov.id === "ovOpts" && matchMedia("(max-width: 700px), (max-height: 520px)").matches;
    try { const v = localStorage.getItem(key); if (v !== null) folded = v === "1"; } catch (e) {}
    set(folded);
    btn.addEventListener("click", () => { folded = !ov.classList.contains("folded"); set(folded);
      try { localStorage.setItem(key, folded ? "1" : "0"); } catch (e) {} });
  });
  aside.querySelectorAll(":scope > section").forEach(adopt);
  new MutationObserver(list => {                // sections added later (mods)
    for (const m of list) m.addedNodes.forEach(n => { if (n.nodeType === 1 && n.tagName === "SECTION" && n.parentNode === aside){ adopt(n); show(current); } });
  }).observe(aside, {childList: true});
  document.querySelectorAll("#modes [data-mode]").forEach(b => b.addEventListener("click", () => {
    if (!busy && MENU_OF[b.dataset.mode]) show(MENU_OF[b.dataset.mode]);
  }));
  show("pose");
})();
