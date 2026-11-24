// The edit data (src/pages/editor/index.astro, loaded after pose_hand_ui.js): everything being edited,
// the figures and all that is not a figure (things, objects, floor and walls, ruler, camera, side view,
// exaggeration ...: S as a whole) and the export's settings (ratio, size, what the pictures show), saved
// as one file and opened again. Opening also takes a pose file ({version: 3, ...S}, 書き出し's ポーズ).
//
// The project: {format: "odm-poser-project", version: 1, app, saved, state: {version: 3, ...S}, picture}
//  .json      the project as text (indented)
//  .odmposer  "ODMPOSER" (8 bytes), the format's version (1 byte, 1), the packing (1 byte: 0 none,
//             1 deflate-raw), the text's length before packing (4 bytes, little-endian), then the
//             project's UTF-8 text, packed. A browser without CompressionStream writes it unpacked.
// The user's own presets (poses, bodies, hand shapes, object presets, colours) stay in the browser.
(() => {
const $ = id => document.getElementById(id);
const MAGIC = "ODMPOSER", FORMAT = "odm-poser-project", PROJ_V = 1;
const appVersion = () => { const v = $("appVersion"); return v ? v.textContent.trim() : ""; };

function project(){
  return {format: FORMAT, version: PROJ_V, app: appVersion(), saved: new Date().toISOString(),
    state: JSON.parse(JSON.stringify({version: 3, ...S})), picture: pictureSettings()};
}
async function packBytes(bytes){
  if (typeof CompressionStream !== "function") return {packed: false, bytes};
  const z = new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate-raw"));
  return {packed: true, bytes: new Uint8Array(await new Response(z).arrayBuffer())};
}
async function unpackBytes(bytes){
  if (typeof DecompressionStream !== "function") throw new Error("このブラウザは .odmposer を開けません（圧縮を解けません）");
  const z = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(z).arrayBuffer());
}
// a project -> the .odmposer file's bytes
async function toBinary(p){
  const text = new TextEncoder().encode(JSON.stringify(p)), {packed, bytes} = await packBytes(text);
  const out = new Uint8Array(14 + bytes.length);
  for (let i = 0; i < 8; i++) out[i] = MAGIC.charCodeAt(i);
  out[8] = PROJ_V; out[9] = packed ? 1 : 0;
  new DataView(out.buffer).setUint32(10, text.length, true);
  out.set(bytes, 14);
  return out;
}
// the bytes of a file -> a project or a pose (an object), or an error
async function readBytes(buf){
  const b = new Uint8Array(buf);
  if (b.length >= 14 && String.fromCharCode(...b.subarray(0, 8)) === MAGIC){
    if (b[8] > PROJ_V) throw new Error("新しい版のエディタで保存されたファイルです");
    const body = b.subarray(14), text = b[9] === 1 ? await unpackBytes(body) : body;
    return JSON.parse(new TextDecoder().decode(text));
  }
  return JSON.parse(new TextDecoder().decode(b));
}
// open: a project (S and the export's settings) or a pose file
function apply(d){
  const isProject = d && d.format === FORMAT && d.state && typeof d.state === "object";
  const st = isProject ? d.state : d;
  migrate(st);
  if (!Array.isArray(st.P) || st.P.length !== J.length) throw new Error("形式が違います");
  remember();
  S = Object.assign(fresh(), st); delete S.version;
  if (isProject) setPictureSettings(d.picture);
  syncUI(); draw();
  return isProject;
}
window.openEditFile = async function(f){
  const d = await readBytes(await f.arrayBuffer());
  say(apply(d) ? "編集データを開きました（書き出しの設定も戻しました）。" : "ポーズを読み込みました。");
};
$("saveProject").addEventListener("click", async () => {
  const p = project(), bin = $("projFormat").value !== "json";
  const blob = bin ? new Blob([await toBinary(p)], {type: "application/octet-stream"})
    : new Blob([JSON.stringify(p, null, 1)], {type: "application/json"});
  download(URL.createObjectURL(blob), `odm-poser_${stamp()}.${bin ? "odmposer" : "json"}`);
  say(`編集データを${bin ? " .odmposer" : " .json"} で保存しました。`);
});
// for the tests and mods that want the file's bytes (the same as the button writes)
window.ODMProject = {project, toBinary, readBytes, apply};

(window.ODMPoserI18n || {add: t => (window.ODMPoserI18nEarly = window.ODMPoserI18nEarly || []).push(t)}).add({
  "ファイルを開く": "Open a file",
  "「書き出し」で保存したポーズ（.json）か編集データ（.json・.odmposer）を開きます。人物・小物・物体・床と壁・定規・カメラが戻り、編集データなら書き出しの設定も戻ります。":
    "Opens a pose (.json) or edit data (.json, .odmposer) saved with Export: figures, things, objects, floor and walls, ruler and camera come back, and with edit data the export settings too.",
  "編集データ（人物・小物・物体・床と壁・定規・カメラ・書き出しの設定）": "Edit data (figures, things, objects, floor and walls, ruler, camera, export settings)",
  ".odmposer（圧縮した 1 つのファイル）": ".odmposer (one packed file)", ".json（テキスト）": ".json (text)", "編集データを保存": "Save the edit data",
  "「ファイルを開く」で、続きから編集できます。.odmposer は小さく、.json は中身を読めます。": "Open it with Open a file to go on editing. .odmposer is small; .json can be read as text.",
  "編集データを開きました（書き出しの設定も戻しました）。": "Opened the edit data (the export settings came back too).",
  "編集データを .odmposer で保存しました。": "Saved the edit data as .odmposer.", "編集データを .json で保存しました。": "Saved the edit data as .json.",
  "このブラウザは .odmposer を開けません（圧縮を解けません）": "This browser cannot open .odmposer (it cannot unpack it)",
  "新しい版のエディタで保存されたファイルです": "The file was saved by a newer editor"});
})();
