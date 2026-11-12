"""Start-up, undo / redo, the export's size and the camera, the English UI (tools/run_tests.py)."""


def test_startup(ed):
    pg = ed.page()
    check(pg.E("S.P.length") == 21, "21 joints")
    check(pg.E("ODMPoser.version").startswith("1."), "MOD API 1.x")
    check(pg.E("typeof handShape3D === 'function' && typeof openEditFile === 'function'"), "hand model and file opening loaded")


def test_undo_redo(ed):
    pg = ed.page()
    before = pg.E("JSON.stringify(S.P)")
    pg.E("remember(); rotateSubtree(IX.r_elbow, add(S.P[IX.r_shoulder], [-5, -10, 20])); afterEdit(IX.r_elbow); draw(); 0")
    moved = pg.E("JSON.stringify(S.P)")
    check(moved != before, "the edit moved the arm")
    pg.E("undo(); 0")
    check(pg.E("JSON.stringify(S.P)") == before, "undo brings it back")
    pg.E("redo(); 0")
    check(pg.E("JSON.stringify(S.P)") == moved, "redo goes forward again")


def test_export_size_keeps_camera(ed):
    pg = ed.page()
    cam = lambda: pg.E("camPos().map(v => Math.round(v))")
    c0 = cam()
    for r in ["16:9", "9:16", "1:1"]:
        pg.E(f"(() => {{ const e = document.getElementById('ratio'); e.value = '{r}'; e.dispatchEvent(new Event('change')); }})()")
        check(cam() == c0, f"camera stays at ratio {r}")
    w, h = pg.E("exportSize()")
    size = pg.E("(() => new Promise(r => { const i = new Image(); i.onload = () => r([i.width, i.height]); i.src = render('atari'); }))()")
    check(size == [w, h], f"the rough picture is {w}x{h}: {size}")


def test_english_panels(ed):
    pg = ed.page("?lang=en")
    pg.E("document.querySelector('#modes [data-mode=pose]').click(); sel = IX.r_hand; ODMUI.showMenu('pose'); draw(); 0")
    jp = pg.E("""(() => { const re = /[\\u3040-\\u30ff\\u3400-\\u9fff]/, out = [];
      for (const sel of ['#fgBox', '#handRow']){ const root = document.querySelector(sel); if (!root) continue;
        const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
        while ((n = w.nextNode())) if (re.test(n.nodeValue) && n.parentElement.offsetParent !== null) out.push(n.nodeValue.trim()); }
      return out; })()""")
    check(not jp, f"untranslated: {jp}")


def test_english_new_controls(ed):
    pg = ed.page("?lang=en")
    jp = pg.E("""(() => { const re = /[\\u3040-\\u30ff\\u3400-\\u9fff]/, out = [];
      for (const id of ['gripBox', 'saveProject', 'projFormat', 'loadJson', 'hdSame', 'handLoupe']){ const e = document.getElementById(id); if (!e) { out.push('missing ' + id); continue; }
        const root = e.closest('label') || e;
        for (const t of [root.textContent, e.getAttribute('aria-label') || '', e.title || '']) if (re.test(t)) out.push(id + ': ' + t.trim().slice(0, 40));
        if (id === 'gripBox') e.querySelectorAll('label, option, button, .hint').forEach(n => { if (re.test(n.textContent)) out.push(n.textContent.trim().slice(0, 40)); }); }
      return out; })()""")
    check(not jp, f"untranslated: {jp}")
