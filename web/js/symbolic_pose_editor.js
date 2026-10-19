// Symbolic Pose Editor: the node's button opens the editor in a modal; "Confirm" in the
// editor sends the pose, the scene and the two pictures back into the node's hidden values.
import { app } from "../../scripts/app.js";

const NODE = "SymbolicPoseEditor";
const EDITOR = "/symbolic_pose/editor/index.html";
const MODAL = "symbolic-pose-editor-modal";
const VALUES = ["pose_json", "scene_json", "openpose_image", "atari_image"];

function hiddenValue(node, name) {
  let w = node.widgets?.find((x) => x.name === name);
  if (!w) w = node.addWidget("text", name, "", () => {}, { serialize: true });
  w.type = "hidden";
  w.serialize = true;
  w.computeSize = () => [0, -4];
  w.draw = () => {};
  return w;
}

function statusText(node) {
  const pose = node.__spe.pose_json.value || "";
  if (!pose) return "(未確定 / not confirmed)";
  try {
    JSON.parse(pose);
    const items = JSON.parse(node.__spe.scene_json.value || "{}").items || [];
    return `確定済み / confirmed${items.length ? ` · ${items.length} props` : ""}`;
  } catch (e) {
    return "confirmed";
  }
}

function setup(node) {
  if (node.__spe) return;
  node.__spe = {};
  for (const name of VALUES) node.__spe[name] = hiddenValue(node, name);
  const status = node.addWidget("text", "status", "", () => {}, { serialize: false });
  status.disabled = true;
  node.__spe.status = status;
  node.addWidget("button", "Open Symbolic Pose Editor", null, () => openEditor(node));
  node.__spe.refresh = () => {
    status.value = statusText(node);
    node.setDirtyCanvas?.(true, true);
  };
  node.__spe.refresh();
  const configure = node.onConfigure;
  node.onConfigure = function () {
    const r = configure?.apply(this, arguments);
    node.__spe.refresh();
    return r;
  };
  if (node.size?.[0] < 260) node.size[0] = 280;
}

function styles() {
  if (document.getElementById("spe-styles")) return;
  const s = document.createElement("style");
  s.id = "spe-styles";
  s.textContent = `
.spe-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center}
.spe-frame{position:relative;width:96vw;height:94vh;background:#1e1e1e;border:1px solid #444;border-radius:8px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.7)}
.spe-frame>iframe{width:100%;height:100%;border:0;display:block}
.spe-close{position:absolute;top:6px;right:8px;z-index:2;width:28px;height:28px;border:0;border-radius:4px;background:rgba(0,0,0,.45);color:#ddd;font-size:18px;cursor:pointer}
.spe-close:hover{background:rgba(255,80,80,.7);color:#fff}`;
  document.head.appendChild(s);
}

function closeEditor() {
  document.getElementById(MODAL)?.remove();
}

function openEditor(node) {
  styles();
  closeEditor();
  const back = document.createElement("div");
  back.className = "spe-backdrop";
  back.id = MODAL;
  back.innerHTML = `<div class="spe-frame"><button class="spe-close" title="Close (Esc)">×</button>
    <iframe src="${EDITOR}?node_id=${encodeURIComponent(node.id)}&_t=${Date.now()}"></iframe></div>`;
  back.querySelector(".spe-close").addEventListener("click", closeEditor);
  back.addEventListener("keydown", (e) => { if (e.key === "Escape") closeEditor(); });
  document.body.appendChild(back);
  back.tabIndex = -1;
  back.focus();
}

window.addEventListener("message", (e) => {
  const d = e.data || {};
  if (e.origin !== window.location.origin || typeof d.type !== "string" || !d.type.startsWith("symbolic-pose-")) return;
  const node = app.graph?.getNodeById?.(Number(d.node_id));
  if (!node || node.comfyClass !== NODE || !node.__spe) return;
  if (d.type === "symbolic-pose-ready") {
    // open on what was confirmed last time
    const frame = document.querySelector(`#${MODAL} iframe`);
    frame?.contentWindow?.postMessage({ type: "symbolic-pose-load",
      pose_json: node.__spe.pose_json.value || "" }, window.location.origin);
    return;
  }
  if (d.type === "symbolic-pose-cancelled") { closeEditor(); return; }
  if (d.type !== "symbolic-pose-confirmed" || typeof d.pose_json !== "string") return;
  node.__spe.pose_json.value = d.pose_json;
  node.__spe.scene_json.value = d.scene_json || "{}";
  node.__spe.openpose_image.value = d.openpose || "";
  node.__spe.atari_image.value = d.atari || "";
  node.__spe.refresh();
  app.graph?.setDirtyCanvas?.(true, true);
  closeEditor();
});

app.registerExtension({
  name: "SymbolicPoseEditor.node",
  async nodeCreated(node) {
    if (node.comfyClass === NODE) setup(node);
  },
  async loadedGraphNode(node) {
    if (node.comfyClass === NODE) {
      setup(node);
      node.__spe.refresh();
    }
  },
});
