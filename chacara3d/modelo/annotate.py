import sys
from PIL import Image, ImageDraw, ImageFont
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB'); W, H = im.size
ppm = W / 64.0
M = [(1, 1.3, 4.7), (2, 2.9, 8.7), (3, 5.5, 1.4), (3, 17.1, 1.4), (3, 11.3, 8.6), (4, 11.3, 2.3), (5, 16.9, 8.0), (6, 20.6, 6.2),
     (7, 23.7, 8.7), (8, 29.2, 3.3), (9, 33.1, 2.2), (10, 36.6, 0.75), (11, 38.6, 3.0), (12, 40.0, 8.2), (13, 45.3, 0.75),
     (14, 47.6, 4.7), (15, 49.6, 0.6), (16, 51.9, 6.3), (17, 54.0, 2.2), (18, 55.5, 8.5), (19, 58.9, 5.1)]
d = ImageDraw.Draw(im)
r = max(11, int(W / 2304 * 30))
f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', int(r * 1.0))
def dashed(cx, cy, rad, n=44):
    import math
    for k in range(n):
        if k % 2:
            continue
        a0 = 2 * math.pi * k / n; a1 = 2 * math.pi * (k + 1) / n
        pts = [((cx + rad * math.cos(a0 + (a1 - a0) * t / 6) - 30) * ppm + W / 2, H / 2 - (cy + rad * math.sin(a0 + (a1 - a0) * t / 6) - 5) * ppm) for t in range(7)]
        d.line(pts, fill=(255, 255, 255), width=max(2, int(W / 2304 * 4)))
if len(sys.argv) > 3:
    dashed(30.4, 2.5, 5.0); dashed(47.7, 1.7, 4.4)
for n, x, y in M:
    px = (x - 30) * ppm + W / 2; py = H / 2 - (y - 5) * ppm
    d.ellipse([px - r, py - r, px + r, py + r], fill=(255, 255, 255), outline=(21, 36, 26), width=3)
    t = str(n); bb = d.textbbox((0, 0), t, font=f)
    d.text((px - (bb[2] + bb[0]) / 2, py - (bb[3] + bb[1]) / 2), t, fill=(21, 36, 26), font=f)
im.save(dst, quality=88)
print(im.size)
