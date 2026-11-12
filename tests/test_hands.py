"""Hands and fingers: joints by the panel, the 3-axis handles, own shapes, held things' grips, sizes, the loupe."""


def hand(pg, side="r"):
    pg.E(f"document.querySelector('#modes [data-mode=pose]').click(); sel = IX.{side}_hand; ODMUI.showMenu('pose'); draw(); 0")


def test_finger_panel_and_handles(ed):
    pg = ed.page()
    hand(pg)
    check(pg.E("document.getElementById('fgBox').style.display") == "", "the finger panel shows for the hand")
    pg.E("sel = IX.r_wrist; draw(); 0")
    check(pg.E("document.getElementById('fgBox').style.display") == "", "and for the wrist")
    pg.E("""(() => { const f = document.getElementById('fgFinger'); f.value = 1; f.dispatchEvent(new Event('change'));
      const r = document.getElementById('fgBend'); r.value = 60; r.dispatchEvent(new Event('input')); })()""")
    check(round(pg.E("handAngles('r')[1][1]")) == 60, "the panel bends the index finger's root")
    check(pg.E("S.fingers.r.from") == "relaxed", "made from the shape it had")
    t = pg.E("(() => { const g = ODMGizmoTargets.map(f => f()).find(Boolean); const s0 = g.save(); g.turn(s0, 1, 10); return [g.rings, Math.round(handAngles('r')[1][0])]; })()")
    check(t == [[0, 1], 10], f"the handles spread the root: {t}")
    check(pg.E("(() => { S.hands.r = 'fist'; const a = handAngles('r')[1][1]; S.hands.r = 'relaxed'; return [a, handAngles('r')[1][1]]; })()") == [80, 60],
          "another shape takes over; the own joints come back")


def test_own_shapes(ed):
    pg = ed.page()
    hand(pg)
    pg.E("setFingerJoint('r', 2, 1, 45); document.getElementById('fgName').value = 'test'; document.getElementById('fgSave').click(); 0")
    pg.E("sel = IX.l_hand; draw(); const h = document.getElementById('handSel'); h.value = 'u:test'; h.dispatchEvent(new Event('change')); 0")
    check(round(pg.E("handAngles('l')[2][2]")) == 45, "the own shape on the other hand")


def test_held_thing_grip(ed):
    pg = ed.page()
    pg.E("addItem('katana', 'r'); afterEdit(); draw(); 0")
    check(pg.E("!!heldOf('r') && heldOf('r').role") == "main", "the katana holds the right hand")
    check(pg.E("heldOf('l') && heldOf('l').role") == "other", "and the left (two-handed)")
    hand(pg)
    pg.E("setFingerJoint('r', 1, 0, 30); draw(); 0")
    check(pg.E("Math.round(S.items[0].handPose.main[1][1])") == 30, "the grip's fingers stay in the thing")
    check(not pg.E("S.fingers && S.fingers.r"), "not in the hand's own")
    o0 = pg.E("gripFrame('r').o")
    pg.E("scSel = 0; ODMUI.showMenu('equip'); draw(); const r = document.getElementById('gpZ'); r.value = 3; r.dispatchEvent(new Event('input')); 0")
    check(pg.E("S.items[0].gripOff.main[2]") == 3, "the place in the hand is kept in the thing")
    check(pg.E(f"len(sub(gripFrame('r').o, {o0}))") > 1, "the grip moved")
    # put down and held again: the grip comes back
    pg.E("S.hands.r = 'relaxed'; S.hands.l = 'relaxed'; draw(); 0")
    check(round(pg.E("handAngles('r')[1][1]")) != 30, "let go: the hand's own")
    pg.E("S.hands.r = 'grip'; S.hands.l = 'grip'; draw(); 0")
    check(round(pg.E("handAngles('r')[1][1]")) == 30, "held again: the same grip")
    pg.E("document.getElementById('gpReset').click(); 0")
    check(not pg.E("S.items[0].handPose || S.items[0].gripOff"), "reset")


def test_hand_sizes(ed):
    pg = ed.page()
    pg.E("ODMUI.showMenu('body'); draw(); 0")
    pg.E("const r = document.getElementById('hdLen'); r.value = 20; r.dispatchEvent(new Event('input')); 0")
    check(pg.E("[handLength('r').toFixed(1), handLength('l').toFixed(1)]") == ["20.0", "20.0"], "both alike")
    pg.E("const c = document.getElementById('hdSame'); c.checked = false; c.dispatchEvent(new Event('change')); const r = document.getElementById('hdLenL'); r.value = 18; r.dispatchEvent(new Event('input')); 0")
    check(pg.E("[handLength('r').toFixed(1), handLength('l').toFixed(1), !!S.handApart]") == ["20.0", "18.0", True], "apart")
    pg.E("const c = document.getElementById('hdSame'); c.checked = true; c.dispatchEvent(new Event('change')); 0")
    check(pg.E("handLength('l').toFixed(1)") == "20.0", "alike again: the left takes the right's")


def test_loupe_desktop(ed):
    pg = ed.page()
    pg.E("document.getElementById('gizmoOn').checked = false; document.getElementById('gizmoOn').dispatchEvent(new Event('change')); 0")
    hand(pg)
    check(pg.E("!document.getElementById('handLoupe').hidden"), "the loupe shows with a hand selected")
    p = pg.E("""(() => { const sh = handShape3D('r'), M = loupeMapForTest(), q = toLoupeForTest(M, sh.pts[6]), r = handLoupe.getBoundingClientRect(), k = r.width / handLoupe.width;
      return [r.left + q[0] * k, r.top + q[1] * k]; })()""")
    pg.mouse.move(p[0], p[1]); pg.mouse.down(); pg.mouse.move(p[0] + 30, p[1] + 30, steps=4); pg.mouse.up()
    check(pg.E("fingerSel && [fingerSel.n, fingerSel.j]") == [1, 1], "the loupe picks the index finger's middle joint")
    check(pg.E("!!(S.fingers && S.fingers.r)"), "and bends it")
    pg.E("sel = IX.chest; draw(); 0")
    check(pg.E("document.getElementById('handLoupe').hidden"), "hidden without a hand")
