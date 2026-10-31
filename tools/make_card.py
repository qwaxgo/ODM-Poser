"""Make the link card (web/editor/og-card.png, 1200 x 630): the picture shown when the GitHub Pages
address is shared (Open Graph / X). The figure on it is drawn by the editor itself: this opens
web/editor/index.html in a browser, poses the figure, exports the composition and lays it out
beside the name. Run again after changing the look of the editor or the words below.

    pip install playwright        (then: playwright install chromium, unless Microsoft Edge is installed)
    python tools/make_card.py
"""

from __future__ import annotations

import base64
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
EDITOR = ROOT / "web" / "editor"
OUT = EDITOR / "og-card.png"

# the figure: a built-in pose, a camera a little from the side and above, the 2-point ruler
POSE = """async () => {
  $("preset").value = "コントラポスト"; $("applyPreset").click();
  Object.assign(S.cam, {yaw: -28, pitch: 10, roll: 0, lens: 35, zoom: 0.92});
  S.center = [18, 90, 12];
  S.ruler = {on: true, n: 2, yaw: 30, lines: 18, cube: true, box: [50, 50, 50], pos: [88, 0, -35]};
  $("W").value = 1040; $("H").value = 1120;
  $("cmBg").value = "clear";
  for (const [id, on] of [["cmFigure", 1], ["cmRuler", 1], ["cmEnv", 1], ["cmItems", 1], ["cmSolids", 1], ["cmAuras", 1]]) $(id).checked = !!on;
  syncUI(); draw();
  return renderComposition();
}"""

CARD = """<!doctype html><html lang="ja"><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;background:#f9fafb;color:#0f172a;
  font-family:"Yu Gothic UI","Yu Gothic","Hiragino Sans","Noto Sans JP",system-ui,sans-serif}
.text{position:absolute;left:70px;top:62px;width:560px}
.icon{width:84px;height:84px;border-radius:19px;display:block;margin-bottom:26px}
h1{font-size:68px;font-weight:800;letter-spacing:.04em;line-height:1.1}
h2{font-size:38px;font-weight:700;margin-top:8px;color:#2b70ef}
.full{font-size:20px;color:#64748b;margin-top:4px;letter-spacing:.02em}
p{font-size:25px;line-height:1.55;margin-top:26px}
.chips{position:absolute;left:70px;bottom:56px;display:flex;gap:8px;flex-wrap:nowrap;width:620px}
.chips span{font-size:15px;padding:6px 11px;white-space:nowrap;border-radius:999px;background:#fff;border:1.5px solid #e2e8f0;color:#334155}
.view{position:absolute;right:46px;top:40px;width:520px;height:560px;background:#fff;border:1.5px solid #e2e8f0;
  border-radius:18px;overflow:hidden;box-shadow:0 14px 30px -18px rgba(0,0,0,.35)}
.view img{width:520px;height:560px;display:block}
.tag{position:absolute;left:16px;top:12px;font-size:15px;color:#8a8a84}
</style><body>
<div class="text"><img class="icon" src="data:image/png;base64,{icon}">
<h1>立体人形装置</h1><h2>ODM Poser</h2><div class="full">Omni-Directional Mannequin Poser</div>
<p>線と丸の全身アタリを、疑似3Dで動かす<br>ポーズエディタ。ブラウザだけで動きます。</p></div>
<div class="chips"><span>インストール不要</span><span>PC・スマホ・タブレット</span><span>パース定規</span><span>OpenPose 書き出し</span></div>
<div class="view"><img src="{figure}"><div class="tag">正面（カメラ）</div></div>
</body></html>"""


def main() -> None:
    icon = base64.b64encode((EDITOR / "icon-192.png").read_bytes()).decode()
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(channel="msedge")
        except Exception:
            browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1400, "height": 1000})
        page.goto((EDITOR / "index.html").as_uri() + "?nomods&lang=ja")
        page.wait_for_timeout(1200)
        figure = page.evaluate(POSE)
        card = browser.new_page(viewport={"width": 1200, "height": 630})
        card.set_content(CARD.replace("{icon}", icon).replace("{figure}", figure))
        card.wait_for_timeout(300)
        card.screenshot(path=str(OUT))
        browser.close()
    print(f"wrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
