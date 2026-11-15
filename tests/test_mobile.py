"""A phone: the hand selected by a tap, the loupe shown at first, a finger bent in the loupe."""


def touch(pg, x, y, dx=0, dy=0):
    cdp = pg.context.new_cdp_session(pg)
    cdp.send("Input.dispatchTouchEvent", {"type": "touchStart", "touchPoints": [{"x": x, "y": y}]})
    for k in range(1, 6):
        cdp.send("Input.dispatchTouchEvent", {"type": "touchMove", "touchPoints": [{"x": x + dx * k / 5, "y": y + dy * k / 5}]})
    cdp.send("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []})
    pg.wait_for_timeout(150)


def test_phone_fingers(ed):
    pg = ed.page(phone=True)
    x, y = pg.E("(() => { const r = front.getBoundingClientRect(), s = project(S.P[IX.r_hand], front.width, front.height), k = r.width / front.width; return [r.left + s.x * k, r.top + s.y * k]; })()")
    touch(pg, x, y)
    check(pg.E("J[sel]") in ("r_hand", "r_wrist"), f"the tap selects the hand: {pg.E('J[sel]')}")
    check(pg.E("!document.getElementById('handLoupe').hidden"), "the loupe shows at first on a phone")
    p = pg.E("""(() => { const sh = handShape3D('r'), M = loupeMapForTest(), q = toLoupeForTest(M, sh.pts[10]), r = handLoupe.getBoundingClientRect(), k = r.width / handLoupe.width;
      return [r.left + q[0] * k, r.top + q[1] * k]; })()""")
    touch(pg, p[0], p[1], 25, 25)
    check(pg.E("fingerSel && [fingerSel.n, fingerSel.j]") == [2, 1], "the loupe picks the middle finger's joint")
    check(pg.E("!!(S.fingers && S.fingers.r)"), "and bends it with one touch")


def test_phone_handles(ed):
    """The handles are grabbed by a finger: the hand's own rings on the view, a finger joint's in the loupe."""
    pg = ed.page(phone=True)
    pg.E("document.querySelector('#modes [data-mode=pose]').click(); sel = IX.r_elbow; draw(); 0")
    pg.E("document.querySelector('#ovGizmo [data-gz=rotate]').click(); 0")
    pt = """(([pts, id]) => { const c = document.getElementById(id), r = c.getBoundingClientRect(), k = r.width / c.width;
      for (let m = 4; m < pts.length - 4; m += 2){ const x = r.left + pts[m][0] * k, y = r.top + pts[m][1] * k;
        if (document.elementFromPoint(x, y) === c) return [x, y, (pts[m + 2][0] - pts[m - 2][0]) * k * 2, (pts[m + 2][1] - pts[m - 2][1]) * k * 2]; }
      return null; })"""
    g = pg.E("ODMGizmo.layoutForTest().rings.map(r => r.pts.map(q => [q.x, q.y]))")
    p = pg.E(pt, [g[2], "front"])
    check(p, "the elbow's blue ring shows")
    a0 = pg.E("JSON.stringify(S.P[IX.r_wrist])")
    touch(pg, *p)
    check(pg.E("JSON.stringify(S.P[IX.r_wrist])") != a0, "a finger on the elbow's ring turns the forearm")
    # a finger joint: its ring in the loupe
    pg.E("sel = IX.r_hand; fingerSel = {side: 'r', n: 1, j: 1}; draw(); 0")
    rings = pg.E("loupeRingsForTest()")
    check(len(rings) == 1, "the loupe shows the joint's ring")
    b0 = pg.E("handAngles('r')[1][2]")
    p = pg.E(pt, [rings[0]["pts"], "handLoupe"])
    check(p, "a point of the loupe's ring")
    touch(pg, *p)
    check(abs(pg.E("handAngles('r')[1][2]") - b0) > 3, "a finger on the loupe's ring bends the joint")
