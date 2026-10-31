"""Draw the app icons (web/editor/icon-*.png, apple-touch-icon.png, favicon-32.png, icon.svg):
the editor's stick-and-circle figure, white on melta UI's primary blue. Run again after changing them.

    python tools/make_icons.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "web" / "editor"
GREEN, WHITE = (43, 112, 239, 255), (255, 255, 255, 255)   # melta primary-500 #2b70ef (the name kept)
# the figure on a 100 x 100 grid: circles (x, y, r) and bones
JOINTS = [(50, 20, 9), (35, 38, 4), (65, 38, 4), (28, 55, 3.5), (74, 26, 3.5), (42, 64, 4.5), (58, 64, 4.5),
          (38, 80, 3.5), (63, 79, 3.5)]
BONES = [((50, 29), (50, 50)), ((35, 38), (65, 38)), ((35, 38), (28, 55)), ((28, 55), (24, 70)),
         ((65, 38), (74, 26)), ((74, 26), (82, 14)), ((50, 50), (42, 64)), ((50, 50), (58, 64)),
         ((42, 64), (38, 80)), ((38, 80), (34, 94)), ((58, 64), (63, 79)), ((63, 79), (70, 93))]


def draw(size: int, pad: float, round_corners: bool) -> Image.Image:
    s = 4                                         # draw large, then shrink (smooth edges)
    big = size * s
    im = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if round_corners:
        d.rounded_rectangle([0, 0, big - 1, big - 1], radius=big * 0.22, fill=GREEN)
    else:
        d.rectangle([0, 0, big, big], fill=GREEN)
    k = big * (1 - 2 * pad) / 100
    off = big * pad
    at = lambda x, y: (off + x * k, off + y * k)
    w = max(2, round(4.2 * k))
    for a, b in BONES:
        d.line([at(*a), at(*b)], fill=WHITE, width=w)
    for x, y, r in JOINTS:
        cx, cy = at(x, y)
        d.ellipse([cx - r * k, cy - r * k, cx + r * k, cy + r * k], fill=GREEN, outline=WHITE, width=w)
    return im.resize((size, size), Image.LANCZOS)


def main():
    draw(192, 0.08, True).save(OUT / "icon-192.png")
    draw(512, 0.08, True).save(OUT / "icon-512.png")
    draw(512, 0.2, False).save(OUT / "icon-maskable-512.png")      # Android crops it to its own shape
    draw(180, 0.12, False).save(OUT / "apple-touch-icon.png")      # iOS rounds the corners itself
    draw(32, 0.04, True).save(OUT / "favicon-32.png")
    circles = "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#2b70ef" stroke="#fff" stroke-width="4.2"/>' for x, y, r in JOINTS)
    lines = "".join(f'<line x1="{a[0]}" y1="{a[1]}" x2="{b[0]}" y2="{b[1]}"/>' for a, b in BONES)
    (OUT / "icon.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 116 116"><rect x="-8" y="-8" width="116" height="116" rx="25" fill="#2b70ef"/>'
        f'<g stroke="#fff" stroke-width="4.2" stroke-linecap="round">{lines}</g>{circles}</svg>\n', encoding="utf-8")
    print("icons written to", OUT)


if __name__ == "__main__":
    main()
