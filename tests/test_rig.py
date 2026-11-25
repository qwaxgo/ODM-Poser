"""The rig branch with ODM-Rig (mods/ODM-Rig, private): attachments (place, following the body, drag,
joint limits, rings, mirror, undo, kept poses, export) and figures whose human legs are hidden (not
picked, not in OpenPose, sitting height, resets on the floor, copying and removing figures).
Without mods/ODM-Rig/odm_rig.js every test here says so and passes (docs/ARCHITECTURE.md, 11.4)."""

import math
from pathlib import Path

MOD = Path(__file__).resolve().parent.parent / "mods" / "ODM-Rig" / "odm_rig.js"
ATT = "(((S.mods['odm-rig'] || {}).att || {})[String(S.figId || 1)] || [])"
WING = f"({ATT}.find(e => e.key === 'angel/r_wing_feather') || {{}}).a"
HOOF = "+Math.min(...ODMRigAttach.now.places().map(q => q.w[1])).toFixed(1)"
PELVIS = "+S.P[IX.pelvis][1].toFixed(1)"
# a point in the chest's frame (side, up, forward), from the chest joint
IN_CHEST = """(w => { const P = S.P, up = norm(sub(P[IX.neck], P[IX.chest])), acr = sub(P[IX.l_shoulder], P[IX.r_shoulder]);
  const side = norm(sub(acr, mul(up, dot(acr, up)))), fwd = cross(side, up), v = sub(w, P[IX.chest]);
  return [dot(v, side), dot(v, up), dot(v, fwd)]; })"""


def rig_page(ed, build=None, lang="ja"):
    """The editor with ODM-Rig loaded (and a build applied), or None without the mod."""
    if not MOD.is_file():
        print(f"      (no {MOD.relative_to(MOD.parents[2])}: skipped)")
        return None
    for _ in range(3):           # the local server now and then drops a file (11.4): open it again
        pg = ed.page(f"?lang={lang}")
        pg.E("ODMPoser.modsReady")
        status = pg.E("(ODMPoser.mods().find(m => m.id === 'odm-rig') || {}).status")
        if status:
            break
    check(status == "ok", f"ODM-Rig loads: {status}")
    if build:
        pg.E("ODMUI.showMenu('odm-rig:rig'); 0")
        pg.select_option("#odm-rig-build", build)
        pg.click("#odm-rig-apply")
    return pg


def screen(pg, w):
    """A world point -> page coordinates on the front view."""
    return pg.E("""w => { const q = project(w, front.width, front.height), r = front.getBoundingClientRect(), k = r.width / front.width;
      return [r.left + q.x * k, r.top + q.y * k]; }""", w)


def set_number(pg, v):
    pg.E(f"(() => {{ const n = document.querySelector('#odm-rig-att-nums input'); n.value = {v}; n.dispatchEvent(new Event('change')); }})()")


def test_rig_wings_at_rest_and_following(ed):
    pg = rig_page(ed, "angel")
    if not pg:
        return
    check(pg.E(f"{ATT}.map(e => e.key)") == ["angel/r_wing_feather", "angel/l_wing_feather"], "the angel has two wings")
    pg.E("(() => { const f = fresh(); S.P = withBoneLengths(f.P, S.P); S.twist = S.twist.map(() => 0); S.body = f.body; afterEdit(); draw(); })()")
    worst = pg.E("""(() => { const r = ODMRig.resolve(ODM_RIG_DATA.rigs.angel, ODM_RIG_DATA), rest = Object.fromEntries(r.joints.map(j => [j.id, j.pos]));
      const c = S.P[IX.chest], c0 = rest.chest; let w = 0;
      for (const q of ODMRigAttach.now.places()) for (let n = 0; n < 3; n++) w = Math.max(w, Math.abs((q.w[n] - c[n]) - (rest[q.id][n] - c0[n])));
      return w; })()""")
    check(worst < 0.01, f"at rest the wings sit where the rig puts them: {worst:.3f} cm off")
    tip = f"{IN_CHEST}(ODMRigAttach.now.places().find(q => q.id === 'r_wing_hand').w)"
    before = pg.E(tip)
    pg.E("(() => { const c = S.P[IX.waist]; for (const k of subtree(IX.chest)) S.P[k] = add(c, rotAxis(rotAxis(sub(S.P[k], c), [0, 1, 0], deg(40)), [1, 0, 0], deg(20))); draw(); })()")
    after = pg.E(tip)
    check(max(abs(a - b) for a, b in zip(before, after)) < 0.01, f"the wing keeps its place on the turned chest: {before} -> {after}")


def test_rig_drag_limits_undo(ed):
    pg = rig_page(ed, "angel")
    if not pg:
        return
    pg.E("document.getElementById('gizmoOn').checked = false; document.getElementById('gizmoOn').dispatchEvent(new Event('change')); 0")
    x, y = screen(pg, pg.E("ODMRigAttach.now.places().find(q => q.id === 'r_wing_elbow').w"))
    pg.mouse.move(x, y)
    pg.mouse.down()
    pg.mouse.move(x, y - 40, steps=4)
    pg.mouse.move(x, y - 80, steps=4)
    pg.mouse.up()
    b = pg.E(f"({WING}.r_wing_elbow || {{}}).b")
    check(b is not None and abs(b) > 1, f"dragging the elbow bends it: {b}")
    check("右羽の翼1" in pg.inner_text("#odm-rig-att-sel"), "and selects it")
    set_number(pg, 200)
    check(pg.E(f"{WING}.r_wing_elbow.b") == 150, "the joint limits stop the hinge at 150")
    pg.E("document.getElementById('limits').click(); 0")
    set_number(pg, 200)
    check(pg.E(f"{WING}.r_wing_elbow.b") == 200, "without the limits it goes on")
    pg.E("document.getElementById('limits').click(); 0")
    pg.keyboard.press("Control+z")
    check(pg.E(f"{WING}.r_wing_elbow.b") == 150, "undo goes back a step")


def test_rig_ring_and_mirror(ed):
    pg = rig_page(ed, "angel")
    if not pg:
        return
    pg.E("ODMRigAttach.now.select(0, 'r_wing_root'); 0")
    tools = pg.E("[...document.querySelectorAll('#ovGizmo button[data-gz]')].filter(b => !b.disabled && !b.hidden).map(b => b.dataset.gz)")
    check(tools == ["rotate"], f"the wing root has only the rotate tool: {tools}")
    cx, cy = screen(pg, pg.E("S.P[IX.chest]"))
    hit = None
    for rr in range(20, 120, 2):
        for t in range(0, 360, 10):
            px, py = cx + rr * math.cos(math.radians(t)), cy + rr * math.sin(math.radians(t))
            if pg.E(f"""(() => {{ const r = front.getBoundingClientRect(), k = front.width / r.width;
                return !!ODMGizmo.downHook(front, ({px} - r.left) * k, ({py} - r.top) * k, {{}}); }})()"""):
                hit = (px, py)
                break
        if hit:
            break
    check(hit is not None, "a ring of the wing root is on the view")
    pg.mouse.move(*hit)
    pg.mouse.down()
    pg.mouse.move(hit[0] + 30, hit[1] + 30, steps=5)
    pg.mouse.up()
    root = pg.E(f"{WING}.r_wing_root")
    check(root and any(abs(v) > 1 for v in root.values()), f"dragging the ring turns the root: {root}")
    right = pg.E(f"JSON.stringify({WING})")
    pg.E("ODMUI.showMenu('pose'); 0")
    pg.click("#mirror")
    left = pg.E(f"JSON.stringify({ATT}.find(e => e.key === 'angel/l_wing_feather').a)")
    check(left == right.replace("r_wing", "l_wing"), f"mirroring gives the left wing the right one's angles: {right} / {left}")
    pg.keyboard.press("Control+z")
    check(pg.E(f"JSON.stringify({ATT}.find(e => e.key === 'angel/l_wing_feather').a)") == "{}", "undo takes it back")


def test_rig_kept_pose_and_export(ed):
    pg = rig_page(ed, "angel")
    if not pg:
        return
    pg.on("dialog", lambda d: d.accept("wings"))
    pg.E("ODMRigAttach.now.select(0, 'r_wing_root'); 0")
    set_number(pg, 30)
    pg.E("ODMUI.showMenu(document.getElementById('psSave').closest('section').dataset.menu); 0")
    if pg.locator("#psName").count():
        pg.fill("#psName", "wings")
    pg.click("#psSave")
    check(any("odmRig" in (v or "") for v in pg.E("Object.keys(localStorage).filter(k => /posesets/.test(k)).map(k => localStorage.getItem(k))")),
          "the kept pose has the wings")
    set_number(pg, -20)
    pg.E("(() => { const l = document.getElementById('psList'); l.selectedIndex = l.options.length - 1; l.dispatchEvent(new Event('change')); })()")
    pg.click("#psLoad")
    check(pg.E(f"{WING}.r_wing_root.f") == 30, "loading it puts the wing back")
    pg.keyboard.press("Control+z")
    check(pg.E(f"{WING}.r_wing_root.f") == -20, "undo the load")
    with_w = pg.E("render('atari').length")
    pg.E("S.mods['odm-rig'].att[String(S.figId || 1)] = []; draw(); 0")
    check(with_w > pg.E("render('atari').length") * 1.05, "the wings are drawn in the exported picture")


def openpose_at(pg, joint):
    """The OpenPose picture's colour where a joint is (export size)."""
    return pg.E("""async j => { const url = render('openpose'), [W, H] = exportSize();
      const img = new Image(); img.src = url; await img.decode();
      const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
      const q = project(S.P[IX[j]], W, H); return [...x.getImageData(Math.round(q.x), Math.round(q.y), 1, 1).data].slice(0, 3); }""", joint)


def test_rig_hidden_legs(ed):
    pg = rig_page(ed)
    if not pg:
        return
    check(openpose_at(pg, "r_knee") != [0, 0, 0], "a human's knee is in OpenPose")
    pg.E("ODMUI.showMenu('odm-rig:rig'); 0")
    pg.select_option("#odm-rig-build", "centaur")
    pg.click("#odm-rig-apply")
    check(len(pg.E("S.hide")) == 8, "the centaur hides the human legs")
    check(pg.E(HOOF) == 2, f"and stands on its hooves: lowest point {pg.E(HOOF)}")
    check(pg.E("(() => { const q = project(S.P[IX.r_knee], front.width, front.height); return pick(front, q.x, q.y); })()") == -1, "a hidden knee is not picked")
    check(openpose_at(pg, "r_knee") == [0, 0, 0], "nor drawn in OpenPose")
    check(pg.inner_text("#heightL") == "座高" and "人間なら" in pg.inner_text("#heightP"), f"the status shows the sitting height: {pg.inner_text('#heightP')}")
    pg.E("ODMUI.showMenu('body'); 0")
    check(not pg.locator("#szHeight").is_visible() and pg.locator("#szSit").is_visible(), "体格 shows the sitting height, not the height")
    pg.select_option("#szKeep", "heads")
    n0 = pg.E("+headsCount().toFixed(2)")
    pg.fill("#szSitN", str(round(float(pg.input_value("#szSitN")) + 10, 1)))
    pg.press("#szSitN", "Enter")
    check(abs(pg.E("+headsCount().toFixed(2)") - n0) < 0.02, "a longer sitting height keeping the heads count keeps it")
    pg.E("document.getElementById('viewOpts').querySelector('[data-icon=lang]').click(); 0")
    pg.wait_for_timeout(200)
    check("as a human" in pg.inner_text("#heightP"), f"in English too: {pg.inner_text('#heightP')}")


def test_rig_resets_stay_on_hooves(ed):
    pg = rig_page(ed, "centaur")
    if not pg:
        return
    for bid in ["bodyReset", "sexReset", "figResetPos", "poseReset", "resetFigure"]:
        pg.E(f"document.getElementById('{bid}').click(); 0")
        check(pg.E(HOOF) == 2 and len(pg.E("S.hide || []")) == 8, f"{bid} keeps the centaur on its hooves: {pg.E(HOOF)}")
    pg.E("(() => { remember(); posePreset(Object.keys(PRESETS)[3]); afterEdit(); draw(); })()")
    check(pg.E(HOOF) == 2, "so does a pose preset")
    pg.E("ODMUI.showMenu('odm-rig:rig'); 0")
    pg.select_option("#odm-rig-build", "human")
    pg.click("#odm-rig-apply")
    check(not pg.E("S.hide") and pg.inner_text("#heightL") == "身長", "back to a human: legs shown, the height again")


def test_rig_figures(ed):
    pg = rig_page(ed, "centaur")
    if not pg:
        return
    n = pg.E(f"{ATT}.length")
    pg.E("document.getElementById('fcDup').click(); 0")
    check(pg.E("S.figId") == 2 and pg.E(f"{ATT}.length") == n and len(pg.E("S.hide || []")) == 8, "a copied figure has the centaur's parts and hidden legs")
    check(pg.E("(S.mods['odm-rig'].builds || {})['2']") == "centaur", "and its build")
    check("mod:odm-rig:att" in pg.E("[...document.querySelectorAll('#resetAttached [data-fr]')].map(c => c.dataset.fr)"), "the reset tab has the attachments' box")
    for k in ["items", "auras", "wire", "pins"]:
        pg.E(f"document.querySelector('#resetAttached [data-fr={k}]').checked = false; 0")
    pg.E("document.querySelector('#resetAttached [data-fr=\"mod:odm-rig:att\"]').dispatchEvent(new Event('change')); document.getElementById('frStrip').click(); 0")
    check(pg.E(f"{ATT}.length") == 0, "外す takes the attachments off")
    pg.keyboard.press("Control+z")
    check(pg.E(f"{ATT}.length") == n, "undo puts them back")
    pg.E("document.getElementById('fcDel').click(); 0")
    check(pg.E("S.figId") == 1 and not pg.E("!!(S.mods['odm-rig'].att || {})['2']"), "deleting the figure drops its record")
