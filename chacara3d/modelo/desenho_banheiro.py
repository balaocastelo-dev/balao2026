"""Planta baixa do estudo do banheiro duplo externo (medidas no banheiro.py).

    python3 desenho_banheiro.py PASTA        (grava PASTA/banheiro-planta.png e .pdf)

Na folha, o muro de arrimo fica em cima e o quintal embaixo; da esquerda para a direita, da escada ao muro lateral.
"""
import os, sys, math, datetime
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Polygon, Circle, Ellipse, Arc

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import obra as O
import banheiro as B

SAIDA = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'desenhos')
os.makedirs(SAIDA, exist_ok=True)
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 9, 'hatch.linewidth': 0.5})
PAREDE, PEDRA, VERDE, PISO, LAJE, MADEIRA = '#4a4a4a', '#d9c7a8', '#cfe7c4', '#ece6da', '#eeeeee', '#c9a16b'


def br(v, casas=2):
    return f'{v:.{casas}f}'.replace('.', ',')


def P(x, y):
    """Do modelo (x, y) para a folha (h, v): y vira horizontal e x vertical, com o muro em cima."""
    return (y, -(x - O.EDGE))


def ret(ax, x0, x1, y0, y1, **kw):
    (h0, v0), (h1, v1) = P(x0, y0), P(x1, y1)
    ax.add_patch(Rectangle((min(h0, h1), min(v0, v1)), abs(h1 - h0), abs(v1 - v0), **kw))


def cota(ax, p0, p1, off, txt=None, g=0.10, tick=0.05, fs=8.5, cor='#222'):
    p0, p1 = np.asarray(p0, float), np.asarray(p1, float)
    d = p1 - p0; L = float(np.linalg.norm(d)); t = d / L; n = np.array([-t[1], t[0]])
    a, b = p0 + n * off, p1 + n * off
    s = 1.0 if off >= 0 else -1.0
    for p, q in ((p0, a), (p1, b)):
        ax.plot([p[0] + n[0] * s * 0.03, q[0] + n[0] * s * 0.06], [p[1] + n[1] * s * 0.03, q[1] + n[1] * s * 0.06], color=cor, lw=0.45)
    ax.plot([a[0], b[0]], [a[1], b[1]], color=cor, lw=0.7)
    for q in (a, b):
        k = (t + n) / math.sqrt(2) * tick
        ax.plot([q[0] - k[0], q[0] + k[0]], [q[1] - k[1], q[1] + k[1]], color=cor, lw=1.3)
    m = (a + b) / 2 + n * s * g
    ang = math.degrees(math.atan2(t[1], t[0]))
    if ang > 90.5 or ang <= -89.5:
        ang -= 180
    ax.text(m[0], m[1], txt if txt is not None else br(L), rotation=ang, ha='center', va='center', fontsize=fs, color=cor,
            bbox=dict(fc='white', ec='none', pad=0.6))


def rotulo(ax, xy, txt, xyt, fs=8.5, ha='left', va='center', peso='normal', cor='#222'):
    ax.annotate(txt, xy=xy, xytext=xyt, fontsize=fs, color=cor, ha=ha, va=va, fontweight=peso, zorder=30,
                arrowprops=dict(arrowstyle='-', color=cor, lw=0.6, shrinkA=0, shrinkB=1),
                bbox=dict(fc='white', ec='none', pad=0.8, alpha=0.92))


fig = plt.figure(figsize=(16.54, 11.69))                # A3 deitada
fig.add_artist(Rectangle((0.012, 0.015), 0.976, 0.97, transform=fig.transFigure, fill=False, lw=1.4, ec='#222'))
fig.add_artist(Rectangle((0.012, 0.015), 0.976, 0.075, transform=fig.transFigure, fill=False, lw=1.0, ec='#222'))
fig.text(0.022, 0.066, 'Banheiro duplo externo — estudo 1', fontsize=15, fontweight='bold', va='center')
fig.text(0.022, 0.034, 'Planta baixa: 2 banheiros com a pia lavabo central, do lado de fora (nicho aberto)', fontsize=10, va='center', color='#333')
fig.text(0.62, 0.066, 'Quintal de baixo — ao lado da escada que sobe para a churrasqueira', fontsize=10, va='center')
fig.text(0.62, 0.034, f'Medidas em metros · largura a confirmar no local · {datetime.date.today():%d/%m/%Y}', fontsize=8.5, va='center', color='#333')

ax = fig.add_axes([0.03, 0.30, 0.94, 0.67])
ax.set_aspect('equal'); ax.axis('off')
H0, H1 = 3.55, 11.15
V0, V1 = -4.15, 0.95
ax.set_xlim(H0, H1); ax.set_ylim(V0, V1)

# laje de cima (churrasqueira) e muro lateral
ax.add_patch(Rectangle((H0, 0), H1 - H0, V1, fc=LAJE, ec='none', zorder=0))
ax.text(H0 + 0.15, 0.72, 'LAJE DA CHURRASQUEIRA  ·  1,00 m acima do quintal', ha='left', va='center', fontsize=10, color='#777')
ret(ax, O.EDGE - 1.2, O.EDGE + 6.0, O.LARGURA, O.LARGURA + 0.15, fc='#9a958c', ec='#555', lw=0.6, zorder=3)
ax.text(O.LARGURA + 0.30, P(O.EDGE + 3.55, 0)[1], 'muro lateral do terreno', rotation=90, ha='center', va='center', fontsize=8.5, color='#555')
# muro de arrimo de pedra (todo o comprimento) e a escada
ret(ax, O.EDGE, O.FACE, O.ESCADA_Y1, O.LARGURA, fc=PEDRA, ec='#7a6a50', lw=0.6, hatch='oo', zorder=2)
ret(ax, O.EDGE, O.FACE, H0, O.ESCADA_Y0, fc=PEDRA, ec='#7a6a50', lw=0.6, hatch='oo', zorder=2)
ex0, ex1 = O.ESCADA_X0, O.ESCADA_X0 + O.ESCADA_N * O.ESCADA_PISO
ret(ax, O.EDGE, ex1, O.ESCADA_Y0, O.ESCADA_Y1, fc='#f4f1ea', ec='#555', lw=0.8, zorder=3)
for k in range(1, O.ESCADA_N + 1):
    ax.plot([O.ESCADA_Y0, O.ESCADA_Y1], [P(ex0 + k * O.ESCADA_PISO, 0)[1]] * 2, color='#777', lw=0.5, zorder=4)
ax.text((O.ESCADA_Y0 + O.ESCADA_Y1) / 2, P((O.EDGE + ex1) / 2, 0)[1], 'escada\n(sobe para a\nchurrasqueira)', ha='center', va='center', fontsize=8.5, zorder=5)
h, v = P(*O.POCO)
ax.add_patch(Circle((O.POCO[1], v), O.POCO_R, fc='#f4f1ea', ec='#555', lw=0.8, zorder=3))
ax.text(O.POCO[1], v, 'poço', ha='center', va='center', fontsize=8.5, zorder=5)

# piso do nicho e da entrada, canteiros, projeção da laje com a jardineira
ret(ax, B.X0, B.X1 + 1.00, B.YN0 - 0.15, B.YN1 + 0.15, fc=PISO, ec='#999', lw=0.5, zorder=1)
for ya, yb in ((B.Y0, B.YN0 - 0.15), (B.YN1 + 0.15, B.Y1)):
    ret(ax, B.X1, B.X1 + B.CANTEIRO, ya, yb, fc=VERDE, ec='#6a8f5a', lw=0.6, zorder=1)
    ax.text((ya + yb) / 2, P(B.X1 + B.CANTEIRO / 2, 0)[1], 'canteiro', ha='center', va='center', fontsize=7.5, color='#3d6b2f', zorder=5)
ret(ax, B.X0, B.X1 + B.MARQUISE, B.Y0, B.Y1, fill=False, ec='#555', lw=0.8, ls=(0, (6, 4)), zorder=6)

# paredes (bloco rebocado; a da frente com filete de pedra)
paredes = [(B.X0, B.X1, B.Y0, B.YA0), (B.X0, B.X1, B.YB1, B.Y1),
           (B.X1 - B.PE, B.X1, B.Y0, B.YN0), (B.X1 - B.PE, B.X1, B.YN1, B.Y1)]
for ya, yb in ((B.YA1, B.YN0), (B.YN1, B.YB0)):
    paredes += [(B.X0, B.PORTA_X[0], ya, yb), (B.PORTA_X[1], B.X1 - B.PE, ya, yb)]
for x0, x1, y0, y1 in paredes:
    ret(ax, x0, x1, y0, y1, fc=PAREDE, ec=PAREDE, lw=0.4, zorder=8)
# janelas basculantes na fachada
for yc in ((B.YA0 + B.YA1) / 2, (B.YB0 + B.YB1) / 2):
    ret(ax, B.X1 - B.PE, B.X1, yc - B.JAN_L / 2, yc + B.JAN_L / 2, fc='white', ec=PAREDE, lw=0.6, zorder=9)
    for f in (0.35, 0.65):
        ax.plot([yc - B.JAN_L / 2, yc + B.JAN_L / 2], [P(B.X1 - B.PE * f, 0)[1]] * 2, color=PAREDE, lw=0.6, zorder=10)
# portas: abrem para dentro de cada banheiro, com a dobradiça do lado da fachada
for yf, s in ((B.YA1, -1), (B.YN1 + B.PI, 1)):
    hx, hy = P(B.PORTA_X[1], yf)
    tip = (yf + s * B.PORTA_L, hy)
    ax.plot([hx, tip[0]], [hy, tip[1]], color=MADEIRA, lw=2.2, zorder=11)
    ax.add_patch(Arc((hx, hy), 2 * B.PORTA_L, 2 * B.PORTA_L, theta1=(0 if s > 0 else 90), theta2=(90 if s > 0 else 180),
                     color='#888', lw=0.7, ls=(0, (3, 2)), zorder=11))
# vasos sanitários e bancada com a cuba
for yc in ((B.YA0 + B.YA1) / 2, (B.YB0 + B.YB1) / 2):
    ret(ax, B.X0, B.X0 + 0.18, yc - 0.20, yc + 0.20, fc='white', ec='#333', lw=0.8, zorder=9)
    hc, vc = P(B.X0 + 0.44, yc)
    ax.add_patch(Ellipse((hc, vc), 0.38, 0.52, fc='white', ec='#333', lw=0.8, zorder=9))
    ax.add_patch(Ellipse((hc, vc - 0.02), 0.24, 0.34, fill=False, ec='#333', lw=0.6, zorder=10))
ret(ax, B.X0, B.X0 + B.BANC_P, B.YN0, B.YN1, fc='white', ec='#333', lw=0.8, zorder=9)
ax.add_patch(Circle(P(*B.CUBA), 0.19, fc='white', ec='#333', lw=0.8, zorder=10))
ax.add_patch(Circle(P(*B.CUBA), 0.025, fc='#333', ec='none', zorder=11))

# nomes
for yc, nome in (((B.YA0 + B.YA1) / 2, 'BANHEIRO 1'), ((B.YB0 + B.YB1) / 2, 'BANHEIRO 2')):
    ax.text(yc, P(B.X0 + 1.30, 0)[1], nome, ha='center', va='center', fontsize=11, fontweight='bold', zorder=12)
ax.text((B.YN0 + B.YN1) / 2, P(B.X0 + 0.80, 0)[1], 'NICHO DA PIA\n(aberto, coberto)', ha='center', va='center', fontsize=9.5,
        fontweight='bold', zorder=12)

# cotas
yb = P(B.X1 + B.CANTEIRO, 0)[1]
cadeia = [B.Y0, B.YA0, B.YA1, B.YN0, B.YN1, B.YB0, B.YB1, B.Y1]
for a, b in zip(cadeia[:-1], cadeia[1:]):
    if b - a > 0.3:
        cota(ax, (a, yb), (b, yb), -0.28, fs=9)
cota(ax, (B.Y0, yb), (B.Y1, yb), -0.62, txt=f'{br(B.Y1 - B.Y0)}  (da escada até o muro lateral: medir no local)', fs=9.5)
cota(ax, (O.ESCADA_Y1, yb), (B.Y0, yb), -0.28, fs=8)
hd = O.LARGURA + 0.15
cota(ax, (hd, P(B.X0, 0)[1]), (hd, P(B.X1, 0)[1]), 0.38, fs=9)
cota(ax, (hd, P(B.X1, 0)[1]), (hd, P(B.X1 + B.MARQUISE, 0)[1]), 0.38, fs=8)
cota(ax, (hd, P(O.EDGE, 0)[1]), (hd, P(B.X0, 0)[1]), 0.38, fs=8)
yi = (B.YB0 + B.YB1) / 2 + 0.38
cota(ax, (yi, P(B.X0, 0)[1]), (yi, P(B.X1 - B.PE, 0)[1]), 0.0, fs=8.5)

# rótulos
rotulo(ax, P(O.EDGE + 0.16, 9.2), 'parede de trás em cima do muro de pedra:\nvira o parapeito da laje neste trecho (sai o guarda-corpo)', (8.55, 0.42), fs=8.5)
rotulo(ax, P(B.X0 + 0.25, B.CUBA[1] - 0.45), 'bancada com cuba de apoio,\nespelho e luminária pendente', (6.05, 0.30), fs=8.5)
rotulo(ax, P(B.X1 + B.MARQUISE, 9.4), 'laje com marquise de 0,35 e\njardineira de pendentes na frente', (8.75, -3.72), fs=8.5)
rotulo(ax, P(B.X1 - 0.07, (B.YA0 + B.YA1) / 2 - 0.2), 'basculante\n0,60 × 0,40 no alto', (5.55, -3.72), fs=8.5)
rotulo(ax, P(B.X0 + 1.4, B.YN0 + 0.05), 'portas de 0,70 × 2,10 viradas uma\npara a outra: não abrem para o quintal', (6.65, -3.72), fs=8.5)
ax.text((B.YN0 + B.YN1) / 2, P(B.X1 + 0.45, 0)[1], 'entrada', ha='center', va='center', fontsize=8.5, color='#555', zorder=12)

# notas
notas = [
    'Como fica:',
    f'•  Dois banheiros de {br(B.CAB)} × {br(B.FUNDO - B.PE)} m (livre), cada um com vaso sanitário. A pia é uma só, no nicho do meio, do lado de fora.',
    f'•  Nicho aberto de {br(B.NICHO)} m de largura, coberto pela laje: a bancada fica no fundo, contra o muro de pedra, com espelho e luz pendente.',
    '•  As portas ficam nas paredes do nicho, uma de frente para a outra: quem está no quintal não vê as portas.',
    f'•  Pé-direito de {br(B.PD)} m. Com a laje, o banheiro sobe {br(B.ZT)} m acima do piso da churrasqueira: a parede de trás, de filete de pedra,',
    '    faz o parapeito daquele trecho da laje no lugar do guarda-corpo. Na frente, a laje avança 0,35 m e leva uma jardineira de pendentes.',
    '•  Fachada dos banheiros em filete de pedra clara, paredes do nicho rebocadas e brancas, portas de madeira e arandelas dos dois lados da entrada.',
    'A decidir:  largura real (da escada até o muro lateral)  ·  chuveiro dentro dos banheiros (para quem sai da piscina)  ·  revestimentos.',
]
for i, t in enumerate(notas):
    fig.text(0.03, 0.272 - i * 0.022, t, fontsize=10 if i == 0 else 9.5, fontweight='bold' if i in (0, len(notas) - 1) else 'normal',
             va='top', color='#222')
for ext in ('png', 'pdf'):
    fig.savefig(os.path.join(SAIDA, f'banheiro-planta.{ext}'), dpi=150 if ext == 'png' else None)
print('ok', SAIDA)
