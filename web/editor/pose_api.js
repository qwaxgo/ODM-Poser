// The MOD API (index.html, loaded last, after i18n.js). A mod is a script that calls
//   SymbolicPose.registerMod({id, name, version, api: 1, init(api){ ... }})
// and adds things through the api object it gets: props and their categories, solid kinds,
// aura kinds and parts, hand shapes, built-in poses, user presets, translations, panels, and
// hooks into drawing, editing and the mouse. See docs/MODDING.md.
//
// Mods are loaded from mods/*.js and mods/<folder>/*.js (a repository of mods cloned into mods/): inside ComfyUI the list comes from /symbolic_pose/mods.js,
// opened from disk from web/mods.js (written by tools/make_mods_list.py). The MOD panel can
// also run a file for this session only. ?nomods in the address starts without mods.
// A mod's own data lives in S.mods[id]: saved with the pose, undone with Ctrl+Z.
(() => {
const API_VERSION = "1.0.0", API_MAJOR = 1;
const mods = [];                              // {id, name, version, file, status: "ok" | "error", error}
const hooks = {drawBehind: [], draw: [], drawSide: [], afterEdit: [], sync: [], mode: []};
let currentFile = "";

// ---- reporting: a mod's error is shown in the MOD panel and the console, the editor goes on ------
function fail(mod, where, err){
  const msg = `${where}: ${err && err.message ? err.message : err}`;
  console.error(`[SymbolicPose MOD ${mod ? mod.id : "?"}] ${msg}`, err);
  if (mod){ mod.status = "error"; mod.error = mod.error ? mod.error : msg; }
  renderModList();
}
function guarded(mod, where, fn){
  return (...a) => { try { return fn(...a); } catch (e) { fail(mod, where, e); return undefined; } };
}

// ---- hooks into the editor ------------------------------------------------------------------------
{ const atari0 = drawAtari;
  drawAtari = function(ctx, W, H, opts = {}){
    for (const h of hooks.drawBehind) { ctx.save(); h(ctx, W, H, opts); ctx.restore(); }
    atari0(ctx, W, H, opts);
    for (const h of hooks.draw) { ctx.save(); h(ctx, W, H, opts); ctx.restore(); }
  };
}
{ const scene0 = drawScene;
  drawScene = function(ctx, W, H, opts, ...rest){
    scene0(ctx, W, H, opts, ...rest);
    if (opts && opts.side) for (const h of hooks.drawSide) { ctx.save(); h(ctx, W, H, opts); ctx.restore(); }
  };
}
{ const edit0 = afterEdit;
  afterEdit = function(moved){ edit0(moved); for (const h of hooks.afterEdit) h(moved === undefined ? -1 : moved); };
}
{ const sync0 = syncUI;
  syncUI = function(){ sync0(); for (const h of hooks.sync) h(); };
}
document.querySelectorAll("#modes button").forEach(b => b.addEventListener("click", () => { for (const h of hooks.mode) h(mode); }));

// ---- refreshing the panels after mods added things ----------------------------------------------
function refreshPanels(){
  const keep = (id, html) => { const el = $(id); if (!el) return; const v = el.value; el.innerHTML = html;
    if ([...el.options].some(o => o.value === v)) el.value = v; };
  keep("preset", Object.keys(PRESETS).map(n => `<option>${n}</option>`).join(""));
  keep("handSel", Object.keys(HANDS).map(k => `<option value="${k}">${HAND_JA[k] || k}（${k}）</option>`).join(""));
  keep("scCat", PROP_CATS.map(([k, ja, en]) => `<option value="${k}">${ja} / ${en}</option>`).join(""));
  if ($("scCat")) $("scCat").dispatchEvent(new Event("change"));
  keep("soKind", Object.entries(SOLID_KINDS).map(([k, d]) => `<option value="${k}">${d.ja}</option>`).join(""));
  keep("auKind", Object.entries(AURA_KINDS).map(([k, [ja]]) => `<option value="${k}">${ja}</option>`).join(""));
  keep("auPart", Object.entries(AURA_PARTS).map(([k, [ja]]) => `<option value="${k}">${ja}</option>`).join(""));
  syncUI(); draw();
}

// ---- checking what a mod adds ---------------------------------------------------------------------
const SHAPE_LEN = {c: 7, b: 6, s: 4, d: 7, k: 7, t: 8, h: 7};
const PLACES = new Set(["hand", "body", "world", "grab", "wear"]);
const WEAR_AT = new Set(["head", "chest", "back", "waist", "feet", "hands", "r_foot", "l_foot", "r_hand", "l_hand"]);
const isNum = v => typeof v === "number" && isFinite(v);
const isPoint = p => Array.isArray(p) && p.length === 3 && p.every(isNum);
function checkShapes(parts, where){
  if (!Array.isArray(parts)) throw new Error(`${where}: parts must be a list of shapes`);
  parts.forEach((sh, i) => {
    const keys = Object.keys(sh || {});
    if (keys.length !== 1) throw new Error(`${where}[${i}]: one shape per entry ({c: [...]} etc.)`);
    const k = keys[0], v = sh[k];
    if (k === "l"){ if (!Array.isArray(v) || v.length < 2 || !v.every(isPoint)) throw new Error(`${where}[${i}]: l needs two or more [x, y, z] points`); return; }
    if (!SHAPE_LEN[k]) throw new Error(`${where}[${i}]: unknown shape "${k}" (c b s d k t h l)`);
    if (!Array.isArray(v) || v.length !== SHAPE_LEN[k] || !v.every(isNum)) throw new Error(`${where}[${i}]: ${k} needs ${SHAPE_LEN[k]} numbers`);
  });
}
function checkProp(key, def){
  if (!/^[\w:.-]+$/.test(key)) throw new Error(`prop key "${key}": letters, digits, _ : . - only`);
  for (const f of ["ja", "en", "cat", "place"]) if (typeof def[f] !== "string" || !def[f]) throw new Error(`prop ${key}: "${f}" is required`);
  if (!PROP_CATS.some(c => c[0] === def.cat)) throw new Error(`prop ${key}: no category "${def.cat}" (add it first)`);
  if (!PLACES.has(def.place)) throw new Error(`prop ${key}: place must be one of ${[...PLACES].join(", ")}`);
  if (def.place === "wear" && !def.sets && !WEAR_AT.has(def.at)) throw new Error(`prop ${key}: a worn thing needs at (${[...WEAR_AT].join(", ")}) or sets`);
  if (def.pose && !HANDS[def.pose]) throw new Error(`prop ${key}: no hand shape "${def.pose}"`);
  if (def.pose2 && !HANDS[def.pose2]) throw new Error(`prop ${key}: no hand shape "${def.pose2}"`);
  for (const f of ["grip2", "bayonet"]) if (def[f] !== undefined && !isPoint(def[f])) throw new Error(`prop ${key}: ${f} must be [x, y, z]`);
  if (def.make){
    if (typeof def.make !== "function" || !Array.isArray(def.dims)) throw new Error(`prop ${key}: make needs dims [[label, cm], ...]`);
    checkShapes(def.make(def.dims.map(d => d[1])), `prop ${key} make()`);
  } else if (def.sets){
    def.sets.forEach(([at, parts], i) => { if (!WEAR_AT.has(at)) throw new Error(`prop ${key}: sets[${i}] at "${at}"`); checkShapes(parts, `prop ${key} sets[${i}]`); });
  } else checkShapes(def.parts, `prop ${key} parts`);
  if (def.mount) for (const [j, p] of Object.entries(def.mount)){
    if (IX[j] === undefined || !isPoint(p)) throw new Error(`prop ${key}: mount.${j} must be a joint name and [x, y, z]`); }
  if (def.grab && !(Array.isArray(def.grab) && def.grab.every(s => Array.isArray(s) && s.length === 2 && s.every(isPoint))))
    throw new Error(`prop ${key}: grab is a list of [[x, y, z], [x, y, z]] lines`);
}

// ---- shape helpers (the same as in pose_props.js) -------------------------------------------------
const SHAPES = {
  C: (...a) => ({c: a}), B: (...a) => ({b: a}), SP: (...a) => ({s: a}), D: (...a) => ({d: a}),
  K: (...a) => ({k: a}), T: (...a) => ({t: a}), H: (...a) => ({h: a}), L: pts => ({l: pts}),
  handle: (lo, hi, r = 1.6) => ({c: [0, lo, 0, 0, hi, 0, r]}),
  pair: f => [...f(1), ...f(-1)],
  ellipse: (cx, cy, cz, rx, ry, n = 24) => ({l: [...Array(n + 1)].map((_, i) => { const t = 2 * Math.PI * i / n;
    return [cx + rx * Math.cos(t), cy + ry * Math.sin(t), cz]; })}),
};

// ---- the api a mod gets -----------------------------------------------------------------------------
function makeApi(mod){
  const i18n = () => window.SymbolicPoseI18n;
  const tr = (ja, en) => { if (en) i18n() && i18n().add({[ja]: en}); };
  const api = {
    version: API_VERSION,
    mod: {id: mod.id, name: mod.name},
    // state: S is replaced on undo and load, so ask for it each time
    state: () => S,
    data: () => { S.mods = S.mods || {}; return S.mods[mod.id] = S.mods[mod.id] || {}; },
    edit(fn, message){ remember(); fn(S); afterEdit(); syncUI(); draw(); if (message) say(message); },
    redraw: () => draw(),
    say: (message, warn) => say(message, warn),
    mode: () => mode,
    selectedJoint: () => (sel >= 0 ? J[sel] : null),
    joints: {names: J.slice(), index: Object.assign({}, IX), parent: PARENT.slice(), ja: Object.assign({}, J_JA)},
    math: {add, sub, mul, dot, cross, len, norm, rotAxis, deg},
    view: {
      front: () => front, side: () => side,
      project: (p, W, H) => project(p, W, H),             // world cm -> front view pixels {x, y, s, z}
      sideProject: (p, W, H) => sideProject(p, W, H),
      ray: (x, y, W, H) => pixelRay(x, y, W, H),           // a pixel -> {o, dir} in the world
      camera: () => Object.assign({}, S.cam),
    },
    shapes: SHAPES,
    props: {
      addCategory(key, ja, en){
        if (!/^[\w:.-]+$/.test(key)) throw new Error(`category key "${key}"`);
        if (!PROP_CATS.some(c => c[0] === key)) PROP_CATS.push([key, ja, en || ja]);
      },
      add(key, def){
        if (PROPS[key] && !def.replace) throw new Error(`prop "${key}" exists (use a key like "${mod.id}:${key}", or replace: true)`);
        checkProp(key, def);
        PROPS[key] = Object.assign({}, def, {mod: mod.id}); delete PROPS[key].replace;
        tr(def.note, def.noteEn);
      },
      get: key => PROPS[key],
      keys: () => Object.keys(PROPS),
      categories: () => PROP_CATS.map(c => c.slice()),
    },
    items: {
      add: (key, hand) => { addItem(key, hand); },          // what the 置く / 持つ buttons do
      list: () => S.items || [],
    },
    solids: {
      addKind(key, def){
        if (SOLID_KINDS[key] && !def.replace) throw new Error(`solid kind "${key}" exists`);
        if (!["box", "prism", "cyl", "pyr", "cone"].includes(def.shape)) throw new Error(`solid ${key}: shape is box, prism, cyl, pyr or cone`);
        if (!(Array.isArray(def.size) && def.size.length === 3 && def.size.every(v => v > 0))) throw new Error(`solid ${key}: size [w, h, d] cm`);
        SOLID_KINDS[key] = {ja: def.ja || key, en: def.en || def.ja || key, shape: def.shape, size: def.size.slice(),
          sides: def.sides, at: isPoint(def.at) ? def.at.slice() : [90, 0, 0]};
        tr(def.ja, def.en);
      },
      add: kind => addSolid(kind),
      list: () => S.solids || [],
    },
    auras: {
      // draw(ctx, {points, hull, size, color, lineWidth, random, W, H}): points walk the outline
      // ({x, y, nx, ny}: position and outward normal, pixels); front: drawn over the figure
      addKind(key, def){
        if (AURA_KINDS[key] && !def.replace) throw new Error(`aura kind "${key}" exists`);
        if (typeof def.draw !== "function") throw new Error(`aura ${key}: draw(ctx, info) is required`);
        AURA_KINDS[key] = [def.ja || key, def.color || "#ffffff", {front: !!def.front, draw: guarded(mod, `aura ${key}`, def.draw),
          margin: isNum(def.margin) ? def.margin : 0.6}];
        tr(def.ja, def.en);
      },
      // chains: lists of joint names (and "r_hand" / "l_hand", the middle of the fist); one outline each
      addPart(key, def){
        if (!Array.isArray(def.chains) || !def.chains.every(c => Array.isArray(c) && c.every(n => IX[n] !== undefined || n === "r_hand" || n === "l_hand")))
          throw new Error(`aura part ${key}: chains of joint names`);
        AURA_PARTS[key] = [def.ja || key, def.chains];
        tr(def.ja, def.en);
      },
    },
    hands: {
      // curl per finger (thumb, index, middle, ring, pinky): 0 straight .. 1 closed
      add(key, def){
        if (!/^[a-z_][a-z0-9_]*$/.test(key)) throw new Error(`hand shape key "${key}": lower case, digits and _`);
        if (!(Array.isArray(def.curl) && def.curl.length === 5 && def.curl.every(isNum))) throw new Error(`hand ${key}: curl is five numbers`);
        HANDS[key] = def.curl.slice(); HAND_JA[key] = def.ja || key;
        tr(`${def.ja || key}（${key}）`, def.en);
      },
      set(side, key){ if (!HANDS[key]) throw new Error(`no hand shape "${key}"`); S.hands[side === "l" ? "l" : "r"] = key; },
      shapes: () => Object.keys(HANDS),
    },
    poses: {
      // turns: [[joint, "x" | "y" | "z", degrees], ...] from the standing pose (as PRESETS in index.html)
      add(name, def){
        if (!Array.isArray(def.turns) || !def.turns.every(t => IX[t[0]] !== undefined && "xyz".includes(t[1]) && isNum(t[2])))
          throw new Error(`pose ${name}: turns [[joint, axis, degrees], ...]`);
        PRESETS[name] = def.turns.map(t => t.slice());
        tr(name, def.en);
      },
      apply: name => { remember(); applyPreset(name); S.pins = {}; afterEdit(); syncUI(); draw(); },
    },
    presets: {
      // user presets {group, name, P (19 joints, cm)}, added to the list of user presets
      add(list){ if (!Array.isArray(list)) throw new Error("presets.add takes a list");
        setUserPresets(TC.concat(list.filter(p => p && Array.isArray(p.P) && p.P.length === J.length)
          .map(p => ({group: String(p.group || mod.name), name: String(p.name || ""), P: p.P})))); },
    },
    i18n: {
      add: table => i18n() && i18n().add(table),              // {"日本語": "English", ...}
      addRule: (re, fn) => i18n() && i18n().addRule(re, guarded(mod, "i18n rule", fn)),
      lang: () => (i18n() ? i18n().lang : "ja"),
    },
    ui: {
      // a section in the side panel; html is yours (ids: prefix them with the mod id)
      addSection({title, html = "", titleEn}){
        const sec = document.createElement("section");
        sec.dataset.mod = mod.id;
        sec.innerHTML = `<h2></h2>${html}`;
        sec.querySelector("h2").textContent = title || mod.name;
        tr(title, titleEn);
        $("modBox").closest("section").before(sec);
        return sec;
      },
      $: id => document.getElementById(id),
    },
    // events: drawBehind / draw (ctx, W, H, opts: export, side ...), drawSide, afterEdit (moved joint
    // index or -1), sync (after undo / load), mode (the new mode), pointerDown (canvas, x, y, event:
    // return {move(x, y, event)} to take the drag), wheel (x, y, step, event: return true when used)
    on(event, fn){
      if (typeof fn !== "function") throw new Error("on(event, fn)");
      if (event === "pointerDown"){ const g = guarded(mod, "pointerDown", fn);
        DOWN_HOOKS.splice(Math.max(0, DOWN_HOOKS.length - 1), 0, (cv, x, y, e) => { const d = g(cv, x, y, e);
          return d && typeof d.move === "function" ? {move: guarded(mod, "drag", d.move)} : null; }); return; }
      if (event === "wheel"){ const g = guarded(mod, "wheel", fn); WHEEL_HOOKS.push((x, y, step, e) => !!g(x, y, step, e)); return; }
      if (!hooks[event]) throw new Error(`no event "${event}" (${[...Object.keys(hooks), "pointerDown", "wheel"].join(", ")})`);
      hooks[event].push(guarded(mod, event, fn));
    },
  };
  return api;
}

// ---- registering ---------------------------------------------------------------------------------
window.SymbolicPose = {
  version: API_VERSION,
  registerMod(def){
    const mod = {id: def && def.id, name: (def && def.name) || (def && def.id) || currentFile, version: (def && def.version) || "",
      file: currentFile, status: "ok", error: ""};
    try {
      if (!def || typeof def.id !== "string" || !/^[a-z0-9][a-z0-9_-]*$/.test(def.id)) throw new Error("id: lower case letters, digits, _ and -");
      if (mods.some(m => m.id === def.id && m.status === "ok")) throw new Error(`a mod "${def.id}" is already loaded`);
      const need = +String(def.api || 1).split(".")[0];
      if (need > API_MAJOR) throw new Error(`needs API ${def.api}, this editor has ${API_VERSION}`);
      if (typeof def.init !== "function") throw new Error("init(api) is required");
      mods.push(mod);
      def.init(makeApi(mod));
    } catch (e) {
      if (!mods.includes(mod)) mods.push(mod);
      fail(mod, "init", e);
    }
    renderModList();
    if (!loading) refreshPanels();
  },
  mods: () => mods.map(m => Object.assign({}, m)),
};

// ---- the MOD panel ---------------------------------------------------------------------------------
{ const sec = document.createElement("section");
  sec.innerHTML = `<h2>MOD</h2>
    <div id="modBox" class="hint">読み込んだ MOD はありません。</div>
    <div class="btns" style="margin-top:6px"><button id="modLoad">MODファイルを読み込む（今回だけ）</button>
      <input type="file" id="modFile" accept=".js,text/javascript" multiple hidden></div>
    <div class="hint">mods フォルダ（とその中のフォルダ）の *.js を起動時に読み込みます（ComfyUI なしで開くときは tools/make_mods_list.py で一覧を作ります）。MOD はエディタの中で自由に動くプログラムなので、信頼できるものだけを入れてください。アドレスの末尾に ?nomods を付けると MOD なしで開きます。</div>`;
  document.querySelector("aside").appendChild(sec);
  $("modLoad").addEventListener("click", () => $("modFile").click());
  $("modFile").addEventListener("change", async e => {
    const files = [...e.target.files]; e.target.value = "";
    for (const f of files){
      const url = URL.createObjectURL(new Blob([await f.text()], {type: "text/javascript"}));
      await runScript(url, f.name);
      URL.revokeObjectURL(url);
    }
    refreshPanels();
  });
}
function renderModList(){
  const box = $("modBox"); if (!box) return;
  if (!mods.length){ box.textContent = "読み込んだ MOD はありません。"; return; }
  box.innerHTML = "";
  for (const m of mods){
    const row = document.createElement("div");
    row.textContent = `${m.status === "ok" ? "✓" : "✗"} ${m.name}${m.version ? " " + m.version : ""}${m.file ? " (" + m.file + ")" : ""}`;
    if (m.status !== "ok"){ row.style.color = "var(--warn)"; row.title = m.error; row.textContent += ": " + m.error; }
    box.appendChild(row);
  }
}

// ---- loading mods/*.js ----------------------------------------------------------------------------
let loading = false;
function runScript(src, file){
  return new Promise(done => {
    currentFile = file;
    const s = document.createElement("script");
    // a mistake in the file itself (a syntax error, an error before registerMod) is reported too
    const caught = e => { if (e.filename && e.filename.split("?")[0].endsWith(src.split("/").pop())){
      const m = {id: file, name: file, file, status: "error", error: ""}; mods.push(m); fail(m, "script", e.error || e.message); } };
    window.addEventListener("error", caught);
    const end = () => { window.removeEventListener("error", caught); currentFile = ""; done(); };
    s.src = src;
    s.onload = end;
    s.onerror = () => { const m = {id: file, name: file, file, status: "error", error: ""};
      mods.push(m); fail(m, "load", new Error("the file could not be read")); end(); };
    document.body.appendChild(s);
  });
}
async function loadMods(){
  const list = Array.isArray(window.SYMBOLIC_POSE_MODS) ? window.SYMBOLIC_POSE_MODS : [];
  if (new URLSearchParams(location.search).has("nomods") || !list.length) return;
  const base = location.protocol === "file:" ? "../../mods/" : "../mods/";
  loading = true;
  for (const name of list) if (/^([\w.-]+\/)?[\w.-]+\.js$/.test(name))
    await runScript(base + name.split("/").map(encodeURIComponent).join("/"), name);
  loading = false;
  refreshPanels();
}
loadMods();
})();
