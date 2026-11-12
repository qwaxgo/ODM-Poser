"""Files: the pose file, the edit data (.json and .odmposer) both ways, older files, the share link."""


def scene(pg):
    pg.E("""S.solids = [{kind: 'box', pos: [60, 0, -60], size: [40, 30, 20], yaw: 25}]; addItem('sword', 'r');
      S.ruler.on = true; S.cam.yaw = 20; afterEdit(); syncUI(); draw(); 0""")


def test_project_roundtrip(ed):
    pg = ed.page()
    scene(pg)
    pg.E("(() => { const e = document.getElementById('ratio'); e.value = '16:9'; e.dispatchEvent(new Event('change')); })()")
    want = pg.E("JSON.stringify({solids: S.solids, items: S.items.length, ruler: S.ruler.on, yaw: S.cam.yaw})")
    for kind in ["json", "binary"]:
        got = pg.E(f"""(async () => {{
          const p = ODMProject.project(), bytes = '{kind}' === 'json' ? new TextEncoder().encode(JSON.stringify(p)) : await ODMProject.toBinary(p);
          S = fresh(); document.getElementById('ratio').value = '1:1'; document.getElementById('ratio').dispatchEvent(new Event('change'));
          const d = await ODMProject.readBytes(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
          const isProj = ODMProject.apply(d);
          return [isProj, JSON.stringify({{solids: S.solids, items: S.items.length, ruler: S.ruler.on, yaw: S.cam.yaw}}), document.getElementById('ratio').value];
        }})()""")
        check(got[0], f"{kind}: read as edit data")
        check(got[1] == want, f"{kind}: the scene comes back: {got[1]} != {want}")
        check(got[2] == "16:9", f"{kind}: the export settings come back: {got[2]}")
    head = pg.E("(async () => { const b = await ODMProject.toBinary(ODMProject.project()); return String.fromCharCode(...b.subarray(0, 8)) + ':' + b[8]; })()")
    check(head == "ODMPOSER:1", f"the .odmposer header: {head}")


def test_pose_file_and_old_files(ed):
    pg = ed.page()
    scene(pg)
    # the pose file as 書き出し writes it
    r = pg.E("(() => { const t = JSON.stringify({version: 3, ...S}); S = fresh(); ODMProject.apply(JSON.parse(t)); return [S.solids.length, S.items.length]; })()")
    check(r == [1, 1], f"pose file: {r}")
    # 19 joints (before the hands), 18 joints (before the waist), no finger data
    r = pg.E("""(() => { const d = JSON.parse(JSON.stringify({version: 3, ...fresh()})); d.P = d.P.slice(0, 19); d.R = d.R.slice(0, 19); d.twist = d.twist.slice(0, 19);
      delete d.fingers; delete d.fingerLen; d.hands = {r: 'peace', l: 'fist'}; ODMProject.apply(d);
      const e = JSON.parse(JSON.stringify({version: 1, ...fresh()})); e.P = e.P.slice(0, 19); e.P.splice(1, 1); e.R = e.R.slice(0, 19); e.R.splice(1, 1); e.twist = e.twist.slice(0, 18);
      const a = S.P.length, h = handAngles('r')[1][1]; ODMProject.apply(e); return [a, h, S.P.length]; })()""")
    check(r == [21, 0, 21], f"older files: {r}")


def test_share_link(ed):
    pg = ed.page(clipboard=True)
    scene(pg)
    pg.E("ODMUI.showMenu('share'); 0")
    pg.click("#shCopy")
    pg.wait_for_timeout(500)
    link = pg.E("navigator.clipboard.readText()")
    check("#pose=" in link, f"a pose link: {link[:60]}")
    q = link.split("/editor/")[1]
    pg2 = ed.page(q)
    pg2.wait_for_timeout(500)
    check(pg2.E("[S.solids.length, S.items.length]") == [1, 1], "the link brings the scene")
