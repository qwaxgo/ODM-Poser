// The service worker of the installed app (PWA): every GET of the editor, its mods and its
// presets goes to the network first (so an update or a new mod shows at once) and is kept; with
// no network, the kept copy is used, so the editor also opens offline.
const CACHE = "odm-poser-editor-v3";
const SHELL = ["./", "./index.html", "./i18n.js", "./pose_props.js", "./pose_props_more.js", "./pose_main.js", "./pose_scene.js",
  "./pose_cast.js", "./pose_solids.js", "./pose_style.js", "./pose_ruler.js", "./pose_api.js", "./pose_share.js", "./ui.css", "./ui.js",
  "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png",
  "./favicon-32.png", "./icon.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.allSettled(SHELL.map(u => c.add(new Request(u, {cache: "reload"})))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => (k.startsWith("odm-poser-editor-") || k.startsWith("symbolic-pose-editor-")) && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  // the network is asked each time whether the file changed (not the browser's own copy, which a
  // site may keep for hours); kept once per file, without the build's ?v= mark
  e.respondWith(fetch(req, {cache: "no-cache"}).then(res => {
    const key = url.search && /\.(js|css)$/.test(url.pathname) ? url.origin + url.pathname : req;
    if (res.ok && res.type === "basic") { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)); }
    return res;
  }).catch(() => caches.match(req, {ignoreSearch: true})
    .then(hit => hit || (req.mode === "navigate" ? caches.match("./index.html") : Response.error()))));
});
