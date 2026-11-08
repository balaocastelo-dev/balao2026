"""Escreve os rótulos e as medidas nas fotos da área do banheiro (render_banheiro.py).

    python3 legenda_banheiro.py PASTA        (para cada PASTA/<vista>.jpg com <vista>_pontos.json grava PASTA/<vista>_legenda.jpg)
"""
import sys, os, json, glob
from PIL import Image, ImageDraw, ImageFont

pasta = sys.argv[1]
F = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'; FB = F.replace('.ttf', '-Bold.ttf')
LARANJA, ESCURO = (232, 98, 12), (28, 32, 30)


def br(v):
    return f'{v:.2f}'.replace('.', ',')


def caixa_texto(d, xy, linhas, fontes, cor_borda=ESCURO, ancora='lt', pad=10):
    """Desenha um bloco de linhas num retângulo branco; `ancora` diz qual canto fica em xy. Devolve o retângulo."""
    larg = max(d.textlength(t, font=f) for t, f in zip(linhas, fontes)); alt = sum(int(f.size * 1.3) for f in fontes)
    x, y = xy
    if ancora[0] == 'r':
        x -= larg + 2 * pad
    elif ancora[0] == 'm':
        x -= (larg + 2 * pad) / 2
    if ancora[1] == 'b':
        y -= alt + 2 * pad
    elif ancora[1] == 'm':
        y -= (alt + 2 * pad) / 2
    Wd, Hd = d.im.size
    x = min(max(x, 6), Wd - larg - 2 * pad - 6); y = min(max(y, 6), Hd - alt - 2 * pad - 6)    # não sai da foto
    ret = (x, y, x + larg + 2 * pad, y + alt + 2 * pad)
    d.rounded_rectangle(ret, radius=8, fill=(255, 255, 255), outline=cor_borda, width=2)
    yy = y + pad
    for t, f in zip(linhas, fontes):
        d.text((x + pad, yy), t, fill=ESCURO if cor_borda == ESCURO else cor_borda, font=f); yy += int(f.size * 1.3)
    return ret


def seta(d, a, b, cor, larg=3):
    d.line([a, b], fill=cor, width=larg)
    d.ellipse([b[0] - 5, b[1] - 5, b[0] + 5, b[1] + 5], fill=cor)


for jp in sorted(glob.glob(os.path.join(pasta, '*_pontos.json'))):
    nome = os.path.basename(jp)[:-len('_pontos.json')]
    fj = os.path.join(pasta, nome + '.jpg')
    if not os.path.exists(fj):
        continue
    dado = json.load(open(jp, encoding='utf-8')); P = dado['pontos']; M = dado['medidas']
    im = Image.open(fj).convert('RGB'); W, H = im.size
    rod = int(H * 0.11)
    out = Image.new('RGB', (W, H + rod), 'white'); out.paste(im, (0, 0)); d = ImageDraw.Draw(out)
    s = W / 1600
    f1, f2, f3 = ImageFont.truetype(FB, int(30 * s) + 2), ImageFont.truetype(F, int(22 * s) + 2), ImageFont.truetype(F, int(19 * s) + 2)
    px = lambda p: (p[0] * W, p[1] * H)
    piso = [px(p) for p in P['piso']]; topo = [px(p) for p in P['topo']]
    titulo = ['BANHEIRO DUPLO EXTERNO', '2 banheiros, com a pia lavabo central', 'do lado de fora',
              f"área de uns {br(M['largura'])} x {br(M['fundo'])} m"]
    fontes = [f1, f2, f2, f2]
    if nome == 'planta':
        # medidas: largura (ao longo do muro de arrimo, na vertical da foto) do lado de fora da área, e fundo dentro dela
        xs = [p[0] for p in piso]; ys = [p[1] for p in piso]
        xd = max(xs) + 26 * s
        y0, y1 = min(ys), max(ys)
        d.line([(xd, y0), (xd, y1)], fill=LARANJA, width=3)
        for yy in (y0, y1):
            d.line([(max(xs) + 6 * s, yy), (xd + 12 * s, yy)], fill=LARANJA, width=2)
            d.line([(xd - 9, yy + 9), (xd + 9, yy - 9)], fill=LARANJA, width=4)
        caixa_texto(d, (xd + 14 * s, (y0 + y1) / 2), [br(M['largura']) + ' m', '(medir no local)'], [f1, f3], cor_borda=LARANJA, ancora='lm')
        yb = y1 - 40 * s; x0, x1 = min(xs), max(xs)
        d.line([(x0, yb), (x1, yb)], fill=(255, 255, 255), width=3)
        for xx in (x0, x1):
            d.line([(xx - 9, yb + 9), (xx + 9, yb - 9)], fill=(255, 255, 255), width=4)
        tb = br(M['fundo']) + ' m'; lt = d.textlength(tb, font=f1)
        d.text(((x0 + x1) / 2 - lt / 2, yb - f1.size * 1.35), tb, fill=(255, 255, 255), font=f1, stroke_width=2, stroke_fill=LARANJA)
        fg = ImageFont.truetype(FB, int(44 * s) + 2)
        tx = 'BANHEIRO DUPLO'; lt = int(d.textlength(tx, font=fg)) + 20
        tira = Image.new('RGBA', (lt, int(fg.size * 1.5)), (0, 0, 0, 0)); dt = ImageDraw.Draw(tira)
        dt.text((10, 4), tx, fill=(255, 255, 255), font=fg, stroke_width=3, stroke_fill=LARANJA)
        tira = tira.rotate(90, expand=True)
        out.paste(tira, (int((x0 + x1) / 2 - tira.size[0] / 2), int((y0 + y1) / 2 - 30 * s - tira.size[1] / 2)), tira)
    else:
        cx = sum(p[0] for p in topo) / 4; cy = min(p[1] for p in topo)
        r = caixa_texto(d, (min(max(cx + 40 * s, 20), W - 520 * s), max(cy - 190 * s, 15)), titulo, fontes, cor_borda=LARANJA)
        seta(d, ((r[0] + r[2]) / 2, r[3]), (cx, cy + 4), LARANJA)
    rotulos = {'escada': 'escada\n(sobe para a churrasqueira)', 'poco': 'poço', 'lago': 'laguinho', 'churrasqueira': 'churrasqueira'}
    desloc = {'planta': {'escada': (-60, 150), 'poco': (110, 30), 'lago': (80, 120), 'churrasqueira': (0, 0)},
              'quintal': {'escada': (80, 200), 'poco': (-20, -260), 'lago': (0, 0), 'churrasqueira': (-120, -60)},
              'laje': {'escada': (-120, 220), 'poco': (60, 230), 'lago': (0, 0), 'churrasqueira': (90, 60)}}.get(nome, {})
    for k, txt in rotulos.items():
        for p in P.get(k, []):
            x, y = px(p)
            if p[2] <= 0 or not (0 <= x <= W and 0 <= y <= H):
                continue
            dx, dy = desloc.get(k, (40, -40))
            ls = txt.split('\n'); fs = [f2] + [f3] * (len(ls) - 1)
            if (dx, dy) == (0, 0):
                caixa_texto(d, (x, y), ls, fs, ancora='mm')
                continue
            r = caixa_texto(d, (x + dx * s, y + dy * s), ls, fs, ancora=('r' if dx < 0 else 'l') + 'm')
            seta(d, ((r[2] if dx < 0 else r[0]), (r[1] + r[3]) / 2), (x, y), ESCURO, larg=2)
    # rodapé
    if nome == 'planta':
        d.text((24 * s, H + rod * 0.10), 'Banheiro duplo externo: 2 banheiros e a pia lavabo central do lado de fora', fill=ESCURO, font=f2)
        d.text((24 * s, H + rod * 0.40), f"Área ao lado da escada: uns {br(M['largura'])} x {br(M['fundo'])} m, encostada no muro de pedra.", fill=(70, 70, 70), font=f3)
        d.text((24 * s, H + rod * 0.66), 'A largura ainda precisa ser medida no local (da escada até o muro lateral).', fill=(70, 70, 70), font=f3)
    else:
        d.text((24 * s, H + rod * 0.16), 'Área do banheiro externo: quintal de baixo, ao lado da escada', fill=ESCURO, font=f1)
        d.text((24 * s, H + rod * 0.56), 'A caixa laranja tem 2,60 m de altura (1,60 m acima do piso da churrasqueira). '
               'A largura ainda precisa ser medida no local.', fill=(70, 70, 70), font=f3)
    out.save(os.path.join(pasta, nome + '_legenda.jpg'), quality=90)
    print(nome, out.size)
