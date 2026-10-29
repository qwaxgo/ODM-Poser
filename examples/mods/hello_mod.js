// An example mod for the Symbolic Pose Editor (copy it into mods/ to try it).
// It adds a category with a wand and a halo, a solid kind, an aura kind and an aura part, a hand
// shape, a built-in pose, English words, and a panel that turns on a plumb line drawn from the head.
// The API: docs/MODDING.md.
SymbolicPose.registerMod({
  id: "hello",
  name: "Hello MOD",
  version: "1.0.0",
  api: 1,
  init(api){
    const {C, SP, T, K, L, pair, handle} = api.shapes;

    // ---- a category and two props: held in the hand, worn on the head
    api.props.addCategory("hello", "ハローMOD", "Hello MOD");
    api.props.add("hello:star_wand", {
      ja: "星の杖", en: "Star wand", cat: "hello", place: "hand", pose: "grip",
      note: "先端に星", noteEn: "a star on the tip",
      parts: [handle(-6, 34, 0.8), ...[0, 1, 2, 3, 4].map(i => {      // five points of a star
        const a = Math.PI / 2 + i * 2 * Math.PI / 5, b = a + 2 * Math.PI / 5 * 2;
        return L([[0, 42 + 8 * Math.sin(a), 8 * Math.cos(a)], [0, 42 + 8 * Math.sin(b), 8 * Math.cos(b)]]); })],
    });
    api.props.add("hello:halo", {
      ja: "天使の輪", en: "Halo", cat: "hello", place: "wear", at: "head",   // units of the head's radius
      parts: [T(0, 1.45, -0.1, 0, 1, 0.15, 0.75, 0.04)],
    });
    api.props.add("hello:horns", {
      ja: "悪魔の角", en: "Devil horns", cat: "hello", place: "wear", at: "head",
      parts: pair(s => [K(0.45 * s, 0.85, 0.15, 0.7 * s, 1.5, 0.35, 0.16)]),
    });

    // ---- a solid kind: an eight-sided pillar
    api.solids.addKind("hello:pillar", {ja: "八角柱", en: "Octagonal pillar", shape: "prism", sides: 8, size: [50, 240, 50], at: [-80, 0, -40]});

    // ---- an aura kind: rings round the outline (drawn behind the figure)
    api.auras.addKind("hello:rings", {
      ja: "光の輪（MOD）", en: "Rings of light (MOD)", color: "#ffe680",
      draw(ctx, {points, size, lineWidth}){
        for (const grow of [0, 0.35, 0.7]){
          ctx.globalAlpha = 0.8 - grow * 0.8; ctx.lineWidth = lineWidth * 1.4; ctx.setLineDash([lineWidth * 6, lineWidth * 4]);
          ctx.beginPath();
          points.forEach((p, i) => { const x = p.x + p.nx * size * grow, y = p.y + p.ny * size * grow; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
          ctx.closePath(); ctx.stroke();
        }
      },
    });
    api.auras.addPart("hello:feet", {ja: "両足（MOD）", en: "Both feet (MOD)", chains: [["r_ankle", "r_toe"], ["l_ankle", "l_toe"]]});

    // ---- a hand shape and a pose
    api.hands.add("hello_three", {ja: "三本指", en: "Three fingers", curl: [0.9, 0, 0, 0, 1]});
    api.poses.add("手を振る（MOD）", {en: "Waving (MOD)", turns: [["r_elbow", "z", -150], ["r_wrist", "z", 40]]});

    // ---- words for English mode
    api.i18n.add({"重心線を表示する": "Show a plumb line from the head", "書き出しにも描く": "Draw it in the export too",
      "頭から床へ下ろした鉛直線です。体の傾きやバランスを見るのに使います。": "A vertical line from the head to the floor, to judge balance."});

    // ---- a panel: a plumb line from the head, kept in the pose (api.data() is saved and undone)
    const sec = api.ui.addSection({title: "重心線（MOD）", titleEn: "Plumb line (MOD)", html: `
      <label><input type="checkbox" id="hello-plumb"> 重心線を表示する</label>
      <label><input type="checkbox" id="hello-plumb-export"> 書き出しにも描く</label>
      <div class="hint">頭から床へ下ろした鉛直線です。体の傾きやバランスを見るのに使います。</div>`});
    const sync = () => { const d = api.data(); sec.querySelector("#hello-plumb").checked = !!d.plumb;
      sec.querySelector("#hello-plumb-export").checked = !!d.plumbExport; };
    sec.querySelector("#hello-plumb").addEventListener("change", e => api.edit(() => { api.data().plumb = e.target.checked; }));
    sec.querySelector("#hello-plumb-export").addEventListener("change", e => api.edit(() => { api.data().plumbExport = e.target.checked; }));
    api.on("sync", sync);                                  // after undo / loading a pose
    sync();

    api.on("draw", (ctx, W, H, opts) => {                  // over the figure, in the front view and the export
      const d = api.data();
      if (!d.plumb || (opts.export && !d.plumbExport)) return;
      const S = api.state(), head = S.P[api.joints.index.head], floor = [head[0], 0, head[2]];
      const a = api.view.project(head, W, H), b = api.view.project(floor, W, H);
      ctx.strokeStyle = "#e0605a"; ctx.lineWidth = Math.max(1, W / 500); ctx.setLineDash([8, 6]);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    });
  },
});
