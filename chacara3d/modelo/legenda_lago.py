"""Põe os números e a legenda na foto do lago vazio (vista "estrutura" do render_deck.py).

    python3 legenda_lago.py PASTA      (lê PASTA/estrutura.jpg e PASTA/estrutura_pontos.json, grava PASTA/estrutura_legenda.jpg)
"""
import sys, os, json
from PIL import Image, ImageDraw, ImageFont

pasta = sys.argv[1]
im = Image.open(os.path.join(pasta, 'estrutura.jpg')).convert('RGB'); W, H = im.size
pts = json.load(open(os.path.join(pasta, 'estrutura_pontos.json'), encoding='utf-8'))
fonte = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
r = max(14, W // 70)
fb = ImageFont.truetype(fonte, int(r * 1.05)); ft = ImageFont.truetype(fonte.replace('-Bold', ''), max(16, W // 62))
linha = int(ft.size * 1.55)
_med = ImageDraw.Draw(im)
_larg = max(_med.textlength(p['texto'], font=ft) for p in pts) + 2 * r + 60
n_col = 2 if _larg < W / 2 else 1                     # textos compridos: uma coluna só, sem encavalar
n_lin = (len(pts) + n_col - 1) // n_col
out = Image.new('RGB', (W, H + linha * n_lin + 40), 'white'); out.paste(im, (0, 0))
d = ImageDraw.Draw(out)
for p in pts:
    x, y = p['x'] * W, p['y'] * H
    if not (0 <= x <= W and 0 <= y <= H):
        continue
    d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255), outline=(21, 36, 26), width=3)
    t = str(p['n']); bb = d.textbbox((0, 0), t, font=fb)
    d.text((x - (bb[2] + bb[0]) / 2, y - (bb[3] + bb[1]) / 2), t, fill=(21, 36, 26), font=fb)
for i, p in enumerate(pts):
    c, l = divmod(i, n_lin)
    x0, y0 = 30 + c * W // n_col, H + 20 + l * linha
    d.ellipse([x0, y0, x0 + 2 * r * 0.8, y0 + 2 * r * 0.8], fill=(255, 255, 255), outline=(21, 36, 26), width=2)
    t = str(p['n']); bb = d.textbbox((0, 0), t, font=ft)
    d.text((x0 + r * 0.8 - (bb[2] + bb[0]) / 2, y0 + r * 0.8 - (bb[3] + bb[1]) / 2), t, fill=(21, 36, 26), font=ft)
    d.text((x0 + 2 * r * 0.8 + 12, y0 + r * 0.8 - ft.size * 0.6), p['texto'], fill=(30, 30, 30), font=ft)
out.save(os.path.join(pasta, 'estrutura_legenda.jpg'), quality=90)
print(out.size)
