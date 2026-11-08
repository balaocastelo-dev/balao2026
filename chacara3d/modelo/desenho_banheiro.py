"""Planta baixa do estudo do banheiro duplo externo (medidas no banheiro.py).

    python3 desenho_banheiro.py PASTA        (grava PASTA/banheiro-planta.png e .pdf)

Vista de cima com o muro lateral no alto da folha: o muro de pedra da churrasqueira à esquerda, a garagem à
direita, o poço embaixo do banheiro (a fachada olha para ele) e um pedaço do laguinho no pé da folha. A planta é a
mesma nos 5 modelos do estudo 3; as notas trazem a altura de cada um.
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
PAREDE, PEDRA, VERDE, PISO, LAJE, MADEIRA, AGUA = '#4a4a4a', '#d9c7a8', '#cfe7c4', '#ece6da', '#eeeeee', '#c9a16b', '#cfe6f3'


def br(v, casas=2):
    return f'{v:.{casas}f}'.replace('.', ',')


def ret(ax, x0, x1, y0, y1, **kw):
    ax.add_patch(Rectangle((min(x0, x1), min(y0, y1)), abs(x1 - x0), abs(y1 - y0), **kw))


def cota(ax, p0, p1, off, txt=None, g=0.10, tick=0.05, fs=8.5, cor='#222'):
    """Linha de cota de p0 a p1, deslocada `off` para a esquerda do sentido p0→p1."""
    p0, p1 = np.asarray(p0, float), np.asarray(p1, float)
    d = p1 - p0; L = float(np.linalg.norm(d)); t = d / L; n = np.array([-t[1], t[0]])
    a, b = p0 + n * off, p1 + n * off
    s = 1.0 if off >= 0 else -1.0
    if abs(off) > 1e-6:
        for p, q in ((p0, a), (p1, b)):
            ax.plot([p[0] + n[0] * s * 0.03, q[0] + n[0] * s * 0.06], [p[1] + n[1] * s * 0.03, q[1] + n[1] * s * 0.06], color=cor, lw=0.45)
    ax.plot([a[0], b[0]], [a[1], b[1]], color=cor, lw=0.7, zorder=20)
    for q in (a, b):
        k = (t + n) / math.sqrt(2) * tick
        ax.plot([q[0] - k[0], q[0] + k[0]], [q[1] - k[1], q[1] + k[1]], color=cor, lw=1.3, zorder=20)
    if txt == '':
        return
    m = (a + b) / 2 + n * s * g
    ang = math.degrees(math.atan2(t[1], t[0]))
    if ang > 90.5 or ang <= -89.5:
        ang -= 180
    ax.text(m[0], m[1], txt if txt is not None else br(L), rotation=ang, ha='center', va='center', fontsize=fs, color=cor,
            bbox=dict(fc='white', ec='none', pad=0.6), zorder=21)


def rotulo(ax, xy, txt, xyt, fs=8.5, ha='left', va='center', cor='#222'):
    ax.annotate(txt, xy=xy, xytext=xyt, fontsize=fs, color=cor, ha=ha, va=va, zorder=30,
                arrowprops=dict(arrowstyle='-', color=cor, lw=0.6, shrinkA=0, shrinkB=1),
                bbox=dict(fc='white', ec='none', pad=0.8, alpha=0.92))


fig = plt.figure(figsize=(16.54, 11.69))                # A3 deitada
fig.add_artist(Rectangle((0.012, 0.015), 0.976, 0.97, transform=fig.transFigure, fill=False, lw=1.4, ec='#222'))
fig.add_artist(Rectangle((0.012, 0.015), 0.976, 0.075, transform=fig.transFigure, fill=False, lw=1.0, ec='#222'))
fig.text(0.022, 0.066, 'Banheiro duplo externo — estudo 3 (mesma planta nos 5 modelos)', fontsize=15, fontweight='bold', va='center')
fig.text(0.022, 0.034, 'Planta baixa: de frente para o poço, a 1 m do muro de pedra, nicho da pia de 2,10 m e banheiros para cadeirante',
         fontsize=10, va='center', color='#333')
fig.text(0.66, 0.066, 'Quintal de baixo — do outro lado da escada, junto ao muro lateral', fontsize=10, va='center')
fig.text(0.66, 0.034, f'Medidas em metros · conferir no local antes de marcar · {datetime.date.today():%d/%m/%Y}', fontsize=8.5, va='center', color='#333')

ax = fig.add_axes([0.015, 0.105, 0.64, 0.87])
ax.set_aspect('equal'); ax.axis('off')
H0, H1 = 44.55, 54.25
V0, V1 = 2.85, 10.55
ax.set_xlim(H0, H1); ax.set_ylim(V0, V1)

# laje de cima, muro de pedra, guarda-corpo, escada
ax.add_patch(Rectangle((H0, V0), O.EDGE - H0, V1 - V0, fc=LAJE, ec='none', zorder=0))
ax.text((H0 + O.EDGE) / 2, 4.75, 'LAJE DA CHURRASQUEIRA (+1,00)', rotation=90, ha='center', va='center', fontsize=10, color='#777')
for y0_, y1_ in ((V0, O.ESCADA_Y0), (O.ESCADA_Y1, O.LARGURA)):
    ret(ax, O.EDGE, O.FACE, y0_, y1_, fc=PEDRA, ec='#7a6a50', lw=0.6, hatch='oo', zorder=2)
    ax.plot([O.EDGE + O.GUARDA_U] * 2, [max(y0_, 0.12), min(y1_, 9.95)], color=MADEIRA, lw=2.4, zorder=4)
ax.text(O.FACE + 0.10, 9.8, 'muro de\npedra', ha='left', va='top', fontsize=8, color='#5a4a30', zorder=5)
ex1 = O.ESCADA_X0 + O.ESCADA_N * O.ESCADA_PISO
ret(ax, O.EDGE, ex1, O.ESCADA_Y0, O.ESCADA_Y1, fc='#f4f1ea', ec='#555', lw=0.8, zorder=3)
for k in range(1, O.ESCADA_N):
    xx = O.ESCADA_X0 + k * O.ESCADA_PISO
    ax.plot([xx, xx], [O.ESCADA_Y0, O.ESCADA_Y1], color='#777', lw=0.5, zorder=4)
ax.text((O.EDGE + ex1) / 2, (O.ESCADA_Y0 + O.ESCADA_Y1) / 2, 'escada', ha='center', va='center', fontsize=8.5, zorder=5,
        bbox=dict(fc='#f4f1ea', ec='none', pad=0.5))
# laguinho (pedaço), poço, muro lateral, garagem (encolhe até o banheiro)
ax.add_patch(Polygon(O.LAGO, closed=True, fc=AGUA, ec='#4a7fa0', lw=0.8, zorder=2))
ax.text(49.0, 3.05, 'laguinho', ha='center', va='center', fontsize=8.5, color='#2d5f80', zorder=5)
ax.add_patch(Circle(O.POCO, O.POCO_R, fc='#f4f1ea', ec='#555', lw=0.9, zorder=3))
ax.text(O.POCO[0], O.POCO[1], 'poço', ha='center', va='center', fontsize=9, zorder=5)
ret(ax, H0, H1, O.LARGURA, O.LARGURA + 0.15, fc='#9a958c', ec='#555', lw=0.6, zorder=3)
ax.text(H0 + 0.1, O.LARGURA + 0.3, 'muro lateral do terreno', ha='left', va='center', fontsize=8.5, color='#555')
GX = B.XB1 + 0.15
ret(ax, GX, H1, 6.9, O.LARGURA, fc='#f2f2f2', ec='#888', lw=0.6, hatch='//', zorder=1)
ax.text((GX + H1) / 2, 8.45, 'garagem\n(cobertura\nencolhe\n0,80)', ha='center', va='center', fontsize=8, color='#555', zorder=5,
        bbox=dict(fc='#f2f2f2', ec='none', pad=0.6))
ax.plot([B.GARAGEM_X, B.GARAGEM_X, GX], [B.YB0, 6.9, 6.9], color='#999', lw=0.8, ls=(0, (4, 3)), zorder=7)   # canto da cobertura de hoje

# piso da entrada, canteiros, beiral (linha tracejada: varia com o modelo)
ret(ax, B.XN0 - 0.15, B.XN1 + 0.15, B.YB0 - B.PISO_FRENTE, B.YI1, fc=PISO, ec='#999', lw=0.5, zorder=1)
for xa, xb in ((B.XB0, B.XN0 - 0.15), (B.XN1 + 0.15, B.XB1)):
    ret(ax, xa, xb, B.YB0 - B.CANTEIRO, B.YB0, fc=VERDE, ec='#6a8f5a', lw=0.6, zorder=1)
    ax.text((xa + xb) / 2, B.YB0 - B.CANTEIRO / 2, 'canteiro', ha='center', va='center', fontsize=7.5, color='#3d6b2f', zorder=5)
ret(ax, B.XB0, B.XB1, B.YB0 - B.MARQUISE, B.YB1, fill=False, ec='#555', lw=0.8, ls=(0, (6, 4)), zorder=6)

# paredes
paredes = [(B.XB0, B.XB1, B.YI1, B.YB1), (B.XB0, B.XA0, B.YI0, B.YI1), (B.XC1, B.XB1, B.YI0, B.YI1),
           (B.XB0, B.XN0, B.YB0, B.YI0), (B.XN1, B.XB1, B.YB0, B.YI0)]
for xa, xb in ((B.XA1, B.XN0), (B.XN1, B.XC0)):
    paredes += [(xa, xb, B.YI0, B.PORTA_Y[0]), (xa, xb, B.PORTA_Y[1], B.YI1)]
for x0, x1, y0, y1 in paredes:
    ret(ax, x0, x1, y0, y1, fc=PAREDE, ec=PAREDE, lw=0.4, zorder=8)
for xc in ((B.XA0 + B.XA1) / 2, (B.XC0 + B.XC1) / 2):                       # basculantes na fachada
    ret(ax, xc - B.JAN_L / 2, xc + B.JAN_L / 2, B.YB0, B.YI0, fc='white', ec=PAREDE, lw=0.6, zorder=9)
    for f in (0.35, 0.65):
        ax.plot([xc - B.JAN_L / 2, xc + B.JAN_L / 2], [B.YB0 + B.PE * f] * 2, color=PAREDE, lw=0.6, zorder=10)
# portas de 0,90 abrindo para fora (para o nicho), dobradiça do lado da fachada
for xf, s in ((B.XN0, 1), (B.XN1, -1)):
    hy = B.PORTA_Y[0]
    ax.plot([xf, xf + s * B.PORTA_L], [hy, hy], color=MADEIRA, lw=2.2, zorder=11)
    ax.add_patch(Arc((xf, hy), 2 * B.PORTA_L, 2 * B.PORTA_L, theta1=(0 if s > 0 else 90), theta2=(90 if s > 0 else 180),
                     color='#888', lw=0.7, ls=(0, (3, 2)), zorder=11))
# banheiros acessíveis: vaso encostado na parede de fora, barras de apoio, área de transferência e giro de 1,50
AZ_AC = '#2a6fb0'
for xw, s in ((B.XA0, 1), (B.XC1, -1)):
    yv = B.YI1 - B.VASO_EIXO
    ret(ax, xw, xw + s * 0.18, yv - 0.20, yv + 0.20, fc='white', ec='#333', lw=0.8, zorder=9)
    ax.add_patch(Ellipse((xw + s * 0.45, yv), 0.54, 0.38, fc='white', ec='#333', lw=0.8, zorder=9))
    ax.add_patch(Ellipse((xw + s * 0.47, yv), 0.34, 0.24, fill=False, ec='#333', lw=0.6, zorder=10))
    ax.plot([xw + s * 0.04] * 2, [yv - 0.50, yv + 0.30], color='#b03a2e', lw=2.6, zorder=12, solid_capstyle='butt')     # barra atrás do vaso
    ax.plot([xw + s * 0.25, xw + s * 1.05], [B.YI1 - 0.04] * 2, color='#b03a2e', lw=2.6, zorder=12, solid_capstyle='butt')  # barra lateral
    ret(ax, xw, xw + s * 1.20, yv - 0.20 - 0.80, yv - 0.20, fill=False, ec=AZ_AC, lw=0.8, ls=(0, (2, 2)), zorder=10)
    ax.add_patch(Circle((xw + s * 0.75, B.YI0 + 0.75), 0.75, fill=False, ec=AZ_AC, lw=0.9, ls=(0, (5, 3)), zorder=10))
# bancada acessível com duas cubas
ret(ax, B.XN0, B.XN1, B.YI1 - B.BANC_P, B.YI1, fc='white', ec='#333', lw=0.8, zorder=9)
for c in B.CUBAS:
    ax.add_patch(Circle(c, 0.19, fc='white', ec='#333', lw=0.8, zorder=10))
    ax.add_patch(Circle(c, 0.025, fc='#333', ec='none', zorder=11))
for xc, nome in (((B.XA0 + B.XA1) / 2, 'BANHEIRO 1'), ((B.XC0 + B.XC1) / 2, 'BANHEIRO 2')):
    ax.text(xc, B.YI0 + 0.75, nome, ha='center', va='center', fontsize=10, fontweight='bold', zorder=12,
            bbox=dict(fc='white', ec='none', pad=0.4, alpha=0.85))
ax.text((B.XN0 + B.XN1) / 2, B.YI0 + 1.05, 'NICHO DA PIA', ha='center', va='center', fontsize=10, fontweight='bold', zorder=12)
ax.text((B.XN0 + B.XN1) / 2, B.YB0 - 0.25, 'entrada', ha='center', va='center', fontsize=8.5, color='#555', zorder=12)

# cotas
yc_ = B.YB0 - B.CANTEIRO - 0.25
for a, b in ((B.XA0, B.XA1), (B.XN0, B.XN1), (B.XC0, B.XC1)):
    cota(ax, (a, yc_), (b, yc_), 0.0, fs=9)
cota(ax, (B.XB0, yc_ - 0.38), (B.XB1, yc_ - 0.38), 0.0, txt=br(B.LARG), fs=9.5)
for xx in (B.XB0, B.XB1):
    ax.plot([xx, xx], [yc_ - 0.45, B.YB0 - B.CANTEIRO], color='#222', lw=0.45)
cota(ax, (O.FACE, 9.2), (B.XB0, 9.2), 0.0, txt=br(B.AFASTAMENTO), fs=9.5)
cota(ax, (B.GARAGEM_X, 6.55), (B.XB1, 6.55), 0.0, txt=br(B.NA_GARAGEM), fs=8)
ax.text(B.XB1 + 0.12, 6.55, 'além da garagem de hoje', ha='left', va='center', fontsize=7.5, color='#555')
ax.plot([B.GARAGEM_X] * 2, [6.5, 6.9], color='#222', lw=0.45); ax.plot([B.XB1] * 2, [6.5, B.YB0], color='#222', lw=0.45)
cota(ax, (B.XB1, B.YB0), (B.XB1, B.YB1), -0.22, fs=9)
cota(ax, (B.XC1 - 0.12, B.YI0), (B.XC1 - 0.12, B.YI1), 0.0, fs=8.5)
xp = O.POCO[0] - 0.95
cota(ax, (xp, O.POCO[1] + O.POCO_R), (xp, B.YB0), 0.0, txt=br(B.ATE_POCO), fs=9)
ax.plot([xp - 0.05, O.POCO[0]], [O.POCO[1] + O.POCO_R] * 2, color='#222', lw=0.45)

# rótulos
rotulo(ax, (O.FACE + 0.5, 8.4), '1 m de corredor entre o\nbanheiro e o muro de pedra', (44.62, 7.45), fs=8.5)
rotulo(ax, (B.CUBAS[1][0] + 0.3, B.YI1 - 0.15), 'bancada com 2 cubas a 0,80 m do chão,\nlivre embaixo (cadeirante), espelhos e pendentes', (50.4, 10.36), fs=8.5)
rotulo(ax, (B.XN0 + 0.5, B.PORTA_Y[0] + 0.02), 'portas de 0,90 abrindo para fora,\nviradas uma para a outra, puxador horizontal', (49.95, 6.15), fs=8.5)
rotulo(ax, (B.XC1 - 0.75, B.YI0 + 0.02), 'giro de 1,50 da\ncadeira de rodas', (52.2, 5.55), fs=8.5, cor=AZ_AC)
rotulo(ax, (B.XC1 - 1.18, B.YI1 - 0.85), 'área de transferência\n0,80 × 1,20', (52.2, 4.9), fs=8.5, cor=AZ_AC)
rotulo(ax, (B.XC1 - 0.04, B.YI1 - 0.75), 'barras de apoio', (52.2, 4.35), fs=8.5, cor='#b03a2e')
rotulo(ax, (xp, (O.POCO[1] + O.POCO_R + B.YB0) / 2 - 0.3), 'da fachada até\na boca do poço', (46.55, 5.95), fs=8.5)

# notas, à direita da planta
notas = [
    ('Como fica (igual nos 5 modelos)', True),
    (f'•  Dois banheiros para cadeirante de {br(B.CAB)} × {br(B.LIVRE)} m (livre),', False),
    ('    com vaso, barras de apoio e giro de 1,50 da cadeira.', False),
    (f'•  Nicho da pia de {br(B.NICHO)} m, aberto e coberto, com bancada de', False),
    ('    2 cubas a 0,80 m, livre embaixo para a cadeira entrar.', False),
    ('•  Portas de 0,90 nas paredes do nicho, abrindo para fora.', False),
    ('•  De frente para o poço; costas no muro lateral.', False),
    (f'•  A {br(B.AFASTAMENTO)} m do muro de pedra (corredor) e o guarda-corpo', False),
    ('    da laje continua.', False),
    (f'•  Passa {br(B.NA_GARAGEM)} m da linha da garagem: a cobertura', False),
    ('    encolhe 0,80 m (vigas e pilares refeitos).', False),
    (f'•  Pé-direito {br(B.PD)} m. Altura no ponto mais alto, acima do', False),
    ('    piso da churrasqueira:', False),
]
for m, E in B.MODELOS.items():
    notas.append((f'      modelo {m} ({E["nome"].lower()}): {br(B.topo(m))} m', False))
notas += [
    ('', False),
    ('Os 5 modelos', True),
]
for m, E in B.MODELOS.items():
    notas.append((f'{m}.  {E["nome"]}', False))
for i, (t_, negrito) in enumerate(notas):
    fig.text(0.675, 0.955 - i * 0.0262, t_, fontsize=10.5 if negrito else 9.3, fontweight='bold' if negrito else 'normal', va='top', color='#222')
for ext in ('png', 'pdf'):
    fig.savefig(os.path.join(SAIDA, f'banheiro-planta.{ext}'), dpi=150 if ext == 'png' else None)
print('ok', SAIDA)
