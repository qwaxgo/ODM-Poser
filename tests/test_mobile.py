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
