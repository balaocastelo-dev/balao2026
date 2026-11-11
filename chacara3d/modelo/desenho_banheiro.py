"""Planta baixa do banheiro duplo externo (medidas no banheiro.py): modelo 2 encostado no muro do barracão, logo depois
da escada e perto do poço, com o estacionamento ao lado debaixo do mesmo telhado de uma água (10/11/2026).

    python3 desenho_banheiro.py PASTA        (grava PASTA/banheiro-planta.png e .pdf)

Vista de cima com o muro do barracão no alto da folha: a escada à esquerda, o portão de baixo à direita e o pergolado
do cineminha embaixo. Medidas a partir da beira da laje e do muro do barracão (o banheiro encosta nele).
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
fig.text(0.022, 0.066, 'Banheiro duplo externo — modelo 2, tamanho padrão, com o estacionamento ao lado', fontsize=15, fontweight='bold', va='center')
fig.text(0.022, 0.034, 'Planta baixa: banheiros padrão com box, nicho da pia de 1,50 m, estacionamento ao lado e um telhado só de uma água',
         fontsize=10, va='center', color='#333')
fig.text(0.66, 0.066, 'Quintal de baixo — junto ao muro do barracão', fontsize=10, va='center')
fig.text(0.66, 0.034, f'Medidas em metros · conferir no local antes de marcar · {datetime.date.today():%d/%m/%Y}', fontsize=8.5, va='center', color='#333')

ax = fig.add_axes([0.012, 0.33, 0.976, 0.655])
ax.set_aspect('equal'); ax.axis('off')
H0, H1 = 45.55, 60.75
V0, V1 = 3.05, 11.35
ax.set_xlim(H0, H1); ax.set_ylim(V0, V1)
YM = O.LARGURA                                     # muro do barracão (y = 10 no modelo)
PORTAO = (YM - 2.82 - 4.04, YM - 2.82)            # portão de baixo: começa a 2,82 do muro do barracão, vão de 4,04

# laje (pedaço), escada, poço, pitangueira, laguinho (ponta), muros e portão
ax.add_patch(Rectangle((H0, V0), O.EDGE - H0, V1 - V0, fc=LAJE, ec='none', zorder=0))
ax.text((H0 + O.EDGE) / 2, 6.9, 'LAJE (+1,00)', rotation=90, ha='center', va='center', fontsize=9, color='#777')
ex1 = O.ESCADA_X0 + O.ESCADA_N * O.ESCADA_PISO
ret(ax, O.EDGE, ex1, O.ESCADA_Y0, O.ESCADA_Y1, fc='#f4f1ea', ec='#555', lw=0.8, zorder=3)
for k in range(1, O.ESCADA_N):
    xx = O.ESCADA_X0 + k * O.ESCADA_PISO
    ax.plot([xx, xx], [O.ESCADA_Y0, O.ESCADA_Y1], color='#777', lw=0.5, zorder=4)
ax.text((O.EDGE + ex1) / 2, (O.ESCADA_Y0 + O.ESCADA_Y1) / 2, 'escada', ha='center', va='center', fontsize=8.5, zorder=5,
        bbox=dict(fc='#f4f1ea', ec='none', pad=0.5))
ax.add_patch(Polygon(O.LAGO, closed=True, fc=AGUA, ec='#4a7fa0', lw=0.8, zorder=2))
ax.text(48.6, 3.55, 'laguinho', ha='center', va='center', fontsize=8.5, color='#2d5f80', zorder=5)
ax.add_patch(Circle(O.POCO, O.POCO_R, fc='#f4f1ea', ec='#555', lw=0.9, zorder=3))
ax.text(O.POCO[0], O.POCO[1], 'poço', ha='center', va='center', fontsize=9, zorder=5)
ret(ax, H0, 60.15, YM, YM + 0.15, fc='#9a958c', ec='#555', lw=0.6, zorder=3)
ax.text(H0 + 0.1, YM + 1.1, 'muro do barracão (o barracão de madeira e a pitangueira saem)', ha='left', va='center', fontsize=8.5, color='#555')
for a_, b_ in ((V0, PORTAO[0]), (PORTAO[1], YM + 0.15)):
    ret(ax, 60.0, 60.15, a_, b_, fc='#9a958c', ec='#555', lw=0.6, zorder=3)
ax.plot([60.07, 60.07], PORTAO, color='#2e7d32', lw=3.0, zorder=4)
ax.text(60.3, (PORTAO[0] + PORTAO[1]) / 2, f'portão de baixo ({br(PORTAO[1] - PORTAO[0])})', rotation=90, ha='center', va='center',
        fontsize=8.5, color='#2e7d32')
# pergolado do cineminha (pedaço) e o piso da vaga
px0 = O.PERGOLADO_X0 + 0.05
ax.add_patch(Rectangle((px0, V0), 5.2, 4.4 - V0, fc='#f3ece0', ec='#8a6d45', lw=0.8, ls='--', zorder=1))
ax.text(px0 + 2.6, 3.65, 'pergolado do cineminha', ha='center', va='center', fontsize=8.5, color='#8a6d45', zorder=5)
ret(ax, B.GARAGEM[0], B.GARAGEM[1], B.GARAGEM[2], B.GARAGEM[3], fc='#efede8', ec='#aaa', lw=0.5, zorder=1)

# piso da entrada, canteiros
ret(ax, B.XN0 - 0.15, B.XN1 + 0.15, B.YB0 - B.PISO_FRENTE, B.YI1, fc=PISO, ec='#999', lw=0.5, zorder=1.5)
for lado, (xa, xb) in enumerate(((B.XB0, B.XN0 - 0.15), (B.XN1 + 0.15, B.XB1))):
    if not B.CANTEIRO_LADOS[lado]:
        continue
    ret(ax, xa, xb, B.YB0 - B.CANTEIRO, B.YB0, fc=VERDE, ec='#6a8f5a', lw=0.6, zorder=1.5)
    ax.text((xa + xb) / 2, B.YB0 - B.CANTEIRO / 2 - 0.02, 'canteiro', ha='center', va='center', fontsize=7.5, color='#3d6b2f', zorder=5)
_cx0, _cx1 = ex1 + 0.35, B.XB0 - 0.30                 # canteiro no vão entre a escada e o banheiro (build.py)
ret(ax, _cx0, _cx1, 8.45, YM, fc=VERDE, ec='#6a8f5a', lw=0.6, zorder=1.5)
# telhado de uma água (tracejado), caimento para o quintal, calha na frente, vigas e pilares do estacionamento
TL = '#8a4b2a'
ax.plot([B.T_X0, B.T_X1, B.T_X1, B.T_X0, B.T_X0], [B.T_YF, B.T_YF, B.T_YT, B.T_YT, B.T_YF], color=TL, lw=1.0, ls=(0, (7, 4)), zorder=6)
for xa in (B.T_X0 + 0.45, B.XB1 + 0.8, B.T_X1 - 0.45):
    ax.annotate('', xy=(xa, B.T_YF + 0.25), xytext=(xa, B.T_YT - 0.3), arrowprops=dict(arrowstyle='->', color=TL, lw=1.0), zorder=7)
ax.plot([B.T_X0, B.T_X1], [B.T_YF + 0.07] * 2, color='#555', lw=2.0, zorder=7)
ax.plot([B.XB1, B.T_X1], [B.T_YP] * 2, color=MADEIRA, lw=1.4, zorder=6)
ax.plot([B.XB1, B.T_X1], [B.T_YT - 0.10] * 2, color=MADEIRA, lw=1.4, zorder=6)
for xx in B.T_PILARES:
    ret(ax, xx - 0.08, xx + 0.08, B.T_YP - 0.08, B.T_YP + 0.08, fc=MADEIRA, ec='#6b4a22', lw=0.6, zorder=9)
for xx in B.T_PILARES_MURO:
    ret(ax, xx - 0.08, xx + 0.08, B.T_YT - 0.18, B.T_YT - 0.02, fc=MADEIRA, ec='#6b4a22', lw=0.6, zorder=9)
for c_, txt_ in ((B.CARRO, 'carro normal\n4,30 × 1,75'), (B.CAMINHONETE, 'caminhonete\n5,33 × 1,86')):   # os dois carros
    ax.add_patch(Rectangle((c_[0], c_[2]), c_[1] - c_[0], c_[3] - c_[2], fc='#f4f4f4', ec='#555', lw=0.9, ls=(0, (4, 3)), zorder=8))
    ax.text((c_[0] + c_[1]) / 2, (c_[2] + c_[3]) / 2, txt_, ha='center', va='center', fontsize=8.5, color='#444', zorder=8)
ax.text((B.XB1 + B.T_X1) / 2, B.T_YP + 0.28, 'ESTACIONAMENTO', ha='center', va='center', fontsize=10, fontweight='bold', color='#555', zorder=8)

# paredes
paredes = [(B.XB0, B.XB1, B.YI1, B.YB1), (B.XB0, B.XA0, B.YI0, B.YI1), (B.XC1, B.XB1, B.YI0, B.YI1),
           (B.XB0, B.XN0, B.YB0, B.YI0), (B.XN1, B.XB1, B.YB0, B.YI0)]
for xa, xb in ((B.XA1, B.XN0), (B.XN1, B.XC0)):
    paredes += [(xa, xb, B.YI0, B.PORTA_Y[0]), (xa, xb, B.PORTA_Y[1], B.YI1)]
for x0, x1, y0, y1 in paredes:
    ret(ax, x0, x1, y0, y1, fc='#a5533a', ec='#6e3322', lw=0.4, zorder=8)
for xc in ((B.XA0 + B.XA1) / 2, (B.XC0 + B.XC1) / 2):                       # basculantes na fachada
    ret(ax, xc - B.JAN_L / 2, xc + B.JAN_L / 2, B.YB0, B.YI0, fc='white', ec='#6e3322', lw=0.6, zorder=9)
    for f in (0.35, 0.65):
        ax.plot([xc - B.JAN_L / 2, xc + B.JAN_L / 2], [B.YB0 + B.PE * f] * 2, color='#6e3322', lw=0.6, zorder=10)
# portas de 0,70 abrindo para fora (para o nicho), dobradiça do lado da fachada
for xf, s in ((B.XN0, 1), (B.XN1, -1)):
    hy = B.PORTA_Y[0]
    ax.plot([xf, xf + s * B.PORTA_L], [hy, hy], color=MADEIRA, lw=2.2, zorder=11)
    ax.add_patch(Arc((xf, hy), 2 * B.PORTA_L, 2 * B.PORTA_L, theta1=(0 if s > 0 else 90), theta2=(90 if s > 0 else 180),
                     color='#888', lw=0.7, ls=(0, (3, 2)), zorder=11))
# banheiros padrão: box do chuveiro no canto da frente, vaso no canto do fundo
for xw, s in ((B.XA0, 1), (B.XC1, -1)):
    ret(ax, xw, xw + s * B.CHUV_X, B.YI0, B.YI0 + B.CHUV_Y, fc='#e3f0f8', ec='none', zorder=8.5)
    ax.plot([xw + s * B.CHUV_X] * 2 + [xw], [B.YI0, B.YI0 + B.CHUV_Y, B.YI0 + B.CHUV_Y], color='#5b8fb9', lw=1.0, zorder=10)
    ax.add_patch(Circle((xw + s * B.CHUV_X / 2, B.YI0 + B.CHUV_Y / 2), 0.05, fc='white', ec='#333', lw=0.6, zorder=10))   # ralo
    ax.add_patch(Circle((xw + s * 0.05, B.YI0 + B.CHUV_Y / 2), 0.045, fc='#5b8fb9', ec='none', zorder=11))                # ducha
    yv = B.YI1 - B.VASO_EIXO
    ret(ax, xw, xw + s * 0.18, yv - 0.20, yv + 0.20, fc='white', ec='#333', lw=0.8, zorder=9)
    ax.add_patch(Ellipse((xw + s * 0.45, yv), 0.54, 0.38, fc='white', ec='#333', lw=0.8, zorder=9))
    ax.add_patch(Ellipse((xw + s * 0.47, yv), 0.34, 0.24, fill=False, ec='#333', lw=0.6, zorder=10))
AZ_AC = '#2a6fb0'
# bancada com duas cubas
ret(ax, B.XN0, B.XN1, B.YI1 - B.BANC_P, B.YI1, fc='white', ec='#333', lw=0.8, zorder=9)
for c in B.CUBAS:
    ax.add_patch(Circle(c, 0.19, fc='white', ec='#333', lw=0.8, zorder=10))
    ax.add_patch(Circle(c, 0.025, fc='#333', ec='none', zorder=11))
for xc, nome in (((B.XA0 + B.XA1) / 2, 'BANHEIRO 1'), ((B.XC0 + B.XC1) / 2, 'BANHEIRO 2')):
    ax.text(xc, B.YI0 + 1.30, nome, ha='center', va='center', fontsize=10, fontweight='bold', zorder=12,
            bbox=dict(fc='white', ec='none', pad=0.4, alpha=0.85))
ax.text((B.XN0 + B.XN1) / 2, B.YI0 + 0.40, 'NICHO DA PIA', ha='center', va='center', fontsize=10, fontweight='bold', zorder=12)
ax.text((B.XN0 + B.XN1) / 2, B.YB0 - 0.25, 'entrada', ha='center', va='center', fontsize=8.5, color='#555', zorder=12)

# cotas
yc_ = YM + 0.42                                   # cotas em cima do muro do barracão
for a, b in ((B.XA0, B.XA1), (B.XN0, B.XN1), (B.XC0, B.XC1)):
    cota(ax, (a, yc_), (b, yc_), 0.0, fs=9)
cota(ax, (B.XB0, yc_ + 0.38), (B.XB1, yc_ + 0.38), 0.0, txt=br(B.LARG), fs=9.5)
for xx in (B.XB0, B.XB1):
    ax.plot([xx, xx], [YM + 0.15, yc_ + 0.45], color='#222', lw=0.45)
cota(ax, (O.EDGE, yc_ + 0.38), (B.XB0, yc_ + 0.38), 0.0, txt=f'{br(B.DA_BEIRA)} da beira', fs=9)
cota(ax, (B.XB1, yc_ + 0.38), (B.T_X1, yc_ + 0.38), 0.0, txt=f'estacionamento {br(B.VAGA[0])}', fs=9)
cota(ax, (59.35, B.T_YF), (59.35, B.T_YT), 0.0, txt=f'{br(B.T_YT - B.T_YF)} coberto', fs=8.5)
cota(ax, (B.XB0 - 0.35, B.YB0), (B.XB0 - 0.35, B.YB1), 0.0, g=-0.16, fs=9)
cota(ax, (B.XC1 - 0.10, B.YI0 + B.CHUV_Y), (B.XC1 - 0.10, B.YI1), 0.0, txt='', fs=8.5)
cota(ax, (B.XC0 + 0.12, B.YI0), (B.XC0 + 0.12, B.YI1), 0.0, fs=8.5)
cota(ax, (ex1, O.ESCADA_Y1 - 0.12), (B.XB0, O.ESCADA_Y1 - 0.12), 0.0, g=-0.13, tick=0.035, txt=br(B.ATE_ESCADA), fs=8)
_d = np.array([B.XB0 - O.POCO[0], B.YB0 - O.POCO[1]]); _d /= np.linalg.norm(_d)
cota(ax, np.array(O.POCO) + _d * O.POCO_R, (B.XB0, B.YB0), 0.0, g=-0.15, tick=0.035, txt=br(B.ATE_POCO), fs=8.5)

# rótulos
rotulo(ax, (B.CUBAS[1][0] + 0.3, B.YI1 - 0.15), 'bancada de granito com 2 cubas a 0,90 m do chão,\nespelhos e pendentes', (51.2, 5.05), fs=8.5)
rotulo(ax, (B.XN0 + 0.5, B.PORTA_Y[0] + 0.02), 'portas de 0,70 abrindo para fora,\nviradas uma para a outra', (51.2, 5.85), fs=8.5)
rotulo(ax, (B.XA0 + 0.35, B.YI0 + 0.35), f'box do chuveiro\n{br(B.CHUV_X)} × {br(B.CHUV_Y)}', (50.25, 6.55), fs=8.5, cor='#3b6f99')
rotulo(ax, ((_cx0 + _cx1) / 2, 9.2), 'canteiro junto ao muro\n(o poço fica livre)', (46.1, 9.9), fs=8.5, cor='#3d6b2f')
rotulo(ax, (B.T_PILARES[0], B.T_YP), 'pilares e vigas de madeira na frente e\nencostados no muro (o engenheiro dimensiona)', (46.1, 4.6), fs=8.5, cor='#6b4a22')
rotulo(ax, (B.XB1 + 0.8, (B.T_YF + B.T_YT) / 2 + 0.3), f'uma água só: {br(B.z_telhado(B.T_YT) - O.LOW)} m no muro,\n{br(B.z_telhado(B.T_YF) - O.LOW)} m no beiral da frente', (46.1, 5.3), fs=8.5, cor=TL)
rotulo(ax, (B.T_X1 - 0.6, B.T_YF + 0.07), 'calha na frente', (59.1, 6.95), fs=8.5, cor='#444', ha='right')

# notas, embaixo da planta
R = B.resumo(); T = R['telhado']
notas_e = [
    ('Como fica (modelo 2: tijolinho e telha)', True),
    (f'•  Dois banheiros de tamanho padrão, {br(B.CAB)} × {br(B.LIVRE)} m (livre), com box de {br(B.CHUV_X)} × {br(B.CHUV_Y)} e vaso.', False),
    (f'•  Nicho da pia de {br(B.NICHO)} m, aberto e coberto, bancada de granito, 2 cubas a 0,90 m.', False),
    (f'•  Portas de {br(B.PORTA_L)} nas paredes do nicho, abrindo para fora.', False),
    (f'•  {br(B.LARG)} × {br(B.FUNDO)} m encostado no muro do barracão, de {br(B.DA_BEIRA)} a {br(B.DA_BEIRA + B.LARG)} m da beira da laje;', False),
    (f'    {br(B.ATE_POCO)} m da boca do poço: o poço fica livre, na frente do canteiro entre a escada e o banheiro.', False),
    ('•  A pitangueira e o barracão de madeira saem.', False),
    ('•  Tijolo aparente como os pilares da churrasqueira, forro de madeira, basculante no alto.', False),
]
notas_d = [
    ('Telhado e estacionamento', True),
    (f'•  Um telhado só, de uma água, de telha de barro com {round(B.T_S * 100)}%: alto no muro do barracão', False),
    (f'    ({br(T["alto"])} m), cai para o quintal até o beiral da frente ({br(T["beiral"])} m), com calha.', False),
    (f'•  {br(T["x"][1] - T["x"][0])} m de comprimento, da ponta da escada até o muro do portão, e {br(T["do_muro"])} m de fundo.', False),
    (f'•  Estacionamento coberto ao lado dos banheiros: {br(B.VAGA[0])} × {br(B.VAGA[1])} m, cabe o carro normal', False),
    ('    (4,30 m). A caminhonete (5,33 m) não cabe ali: fica na linha do portão, descoberta.', False),
    ('•  No muro o telhado fica 1,1 m acima dele: viga em pilares encostados no muro.', False),
    ('', False),
    ('A decidir', True),
    ('•  água quente: chuveiro elétrico (circuito próprio com DR) ou aquecedor a gás/solar;', False),
    ('•  de que calçada é a rede de esgoto (cano de 100 mm com 1% até a caixa de inspeção);', False),
    ('•  piso antiderrapante e revestimento dentro dos banheiros.', False),
]
for col, notas in ((0.02, notas_e), (0.51, notas_d)):
    for i, (t_, negrito) in enumerate(notas):
        fig.text(col, 0.315 - i * 0.0185, t_, fontsize=10.5 if negrito else 9.2, fontweight='bold' if negrito else 'normal', va='top', color='#222')
for ext in ('png', 'pdf'):
    fig.savefig(os.path.join(SAIDA, f'banheiro-planta.{ext}'), dpi=150 if ext == 'png' else None)
print('ok', SAIDA)
