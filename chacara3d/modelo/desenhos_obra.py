"""Folhas com medidas do deck e do laguinho para o pedreiro: planta de locação, cortes do lago e estrutura do deck.

    python3 desenhos_obra.py PASTA

Lê tudo do obra.py (as mesmas medidas da maquete 3D). No terreno, as medidas partem de duas referências: a beira
da laje (nível da piscina) e o muro lateral do lado da amendoeira. Níveis: chão do quintal de baixo = 0,00 (a laje
da piscina e o topo do deck ficam no nível do desnível, +1,00).
Gera PASTA/folha1-locacao.png, PASTA/folha2-cortes.png, PASTA/folha3-deck.png e PASTA/deck-laguinho.pdf.
"""
import os, sys, math, datetime
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Circle, Polygon
from matplotlib.backends.backend_pdf import PdfPages

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import obra as O

SAIDA = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'desenhos')
os.makedirs(SAIDA, exist_ok=True)
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 9, 'hatch.linewidth': 0.5})

AZUL, AZUL_F, VERDE, TERRA, PEDRA, MADEIRA, VERMELHO = '#cfe6f3', '#7fb5d6', '#cfe7c4', '#d9c7a8', '#9a958c', '#c9a16b', '#c0392b'
A = O.EDGE and (0.0 - O.LOW)                   # desnível: da laje ao chão do quintal de baixo
N_FOLHAS = 3


def br(v, casas=2):
    return f'{v:.{casas}f}'.replace('.', ',').replace('-', '−')


def nivel(z):
    """Nível a partir do chão do quintal de baixo, com sinal (+1,00 / 0,00 / −1,06)."""
    v = z - O.LOW
    return ('+' if v > 0.004 else '') + br(v) if abs(v) > 0.004 else '0,00'


def U(x):
    return x - O.EDGE                           # distância a partir da beira da laje


def cota(ax, p0, p1, off, txt=None, g=0.10, tick=0.05, fs=8.5, cor='#222', ext=True):
    """Linha de cota de p0 a p1, deslocada `off` para o lado esquerdo do sentido p0→p1 (texto do lado de fora)."""
    p0, p1 = np.asarray(p0, float), np.asarray(p1, float)
    d = p1 - p0; L = float(np.linalg.norm(d)); t = d / L; n = np.array([-t[1], t[0]])
    a, b = p0 + n * off, p1 + n * off
    s = 1.0 if off >= 0 else -1.0
    if ext and abs(off) > 1e-6:
        for p, q in ((p0, a), (p1, b)):
            ax.plot([p[0] + n[0] * s * g * 0.3, q[0] + n[0] * s * g * 0.6], [p[1] + n[1] * s * g * 0.3, q[1] + n[1] * s * g * 0.6],
                    color=cor, lw=0.45)
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


def rotulo(ax, xy, txt, xyt, fs=8.5, cor='#222', ha='left', va='center', peso='normal'):
    ax.annotate(txt, xy=xy, xytext=xyt, fontsize=fs, color=cor, ha=ha, va=va, fontweight=peso,
                arrowprops=dict(arrowstyle='-', color=cor, lw=0.6, shrinkA=0, shrinkB=1),
                bbox=dict(fc='white', ec='none', pad=0.8, alpha=0.9))


def folha(n, titulo, subtitulo):
    fig = plt.figure(figsize=(16.54, 11.69))       # A3 deitada
    fig.patch.set_facecolor('white')
    fig.add_artist(Rectangle((0.012, 0.015), 0.976, 0.97, transform=fig.transFigure, fill=False, lw=1.4, ec='#222'))
    fig.add_artist(Rectangle((0.012, 0.015), 0.976, 0.075, transform=fig.transFigure, fill=False, lw=1.0, ec='#222'))
    fig.text(0.022, 0.066, titulo, fontsize=15, fontweight='bold', va='center')
    fig.text(0.022, 0.034, subtitulo, fontsize=10, va='center', color='#333')
    fig.text(0.70, 0.066, 'Quintal de baixo — deck e laguinho de carpas', fontsize=10, va='center')
    fig.text(0.70, 0.034, f'Medidas em metros · níveis a partir do chão do quintal de baixo (0,00) · {datetime.date.today():%d/%m/%Y}',
             fontsize=8.5, va='center', color='#333')
    fig.text(0.975, 0.066, f'FOLHA {n}/{N_FOLHAS}', fontsize=13, fontweight='bold', va='center', ha='right')
    return fig


def lago_pts_regulares(passo=0.8):
    """Pontos de marcação (piquetes) a cada ~`passo` metros ao longo da linha d'água."""
    L = O.LAGO; seg = np.sqrt(((np.roll(L, -1, axis=0) - L) ** 2).sum(axis=1)); s = np.concatenate([[0], np.cumsum(seg)])
    per = s[-1]; n = int(round(per / passo)); out = []
    # começa no ponto mais perto do muro lateral do lado da amendoeira (menor y) para a numeração ficar fácil de achar
    k0 = int(np.argmin(L[:, 1])); s0 = s[k0]
    for i in range(n):
        si = (s0 + i * per / n) % per
        k = min(int(np.searchsorted(s, si, side='right') - 1), len(L) - 1)
        t = (si - s[k]) / seg[k]
        out.append(L[k] + (L[(k + 1) % len(L)] - L[k]) * t)
    return np.array(out), per


# =================================================================== folha 1 — planta de locação
def folha1():
    fig = folha(1, 'Planta de locação (vista de cima)', 'Marcar a linha d\'água com piquetes nos pontos P1…; ligar os pontos com uma mangueira deitada no chão, em curva.')
    ax = fig.add_axes([0.03, 0.105, 0.60, 0.87])
    ax.set_aspect('equal'); ax.axis('off')
    u_max = max(U(O.POCO[0]) + O.POCO_R + 0.6, U(O.GRAMA[:, 0].max()) + 0.5)
    # malha de 50 cm
    for u in np.arange(0, u_max + 0.01, 0.5):
        ax.plot([u, u], [0, O.LARGURA], color='#e3e3e3', lw=0.5 if u % 1 else 0.9, zorder=0)
    for v in np.arange(0, O.LARGURA + 0.01, 0.5):
        ax.plot([0, u_max], [v, v], color='#e3e3e3', lw=0.5 if v % 1 else 0.9, zorder=0)
    for u in range(0, int(u_max) + 1):
        ax.text(u, -0.55, br(u, 0 if u == 0 else 1) if u else '0', ha='center', va='top', fontsize=8, color='#777')
    for v in range(0, int(O.LARGURA) + 1):
        ax.text(u_max + 0.15, v, br(v, 1) if v else '0', ha='left', va='center', fontsize=8, color='#777')
    ax.text(u_max / 2, -0.95, 'distância a partir da beira da laje (m)', ha='center', va='top', fontsize=8.5, color='#555')
    ax.text(u_max + 0.75, O.LARGURA / 2, 'distância a partir do muro lateral do lado da amendoeira (m)', rotation=90, ha='center',
            va='center', fontsize=8.5, color='#555')
    # laje, beira e muros
    ax.add_patch(Rectangle((-1.4, 0), 1.4, O.LARGURA, fc='#ecebe7', ec='none', hatch='..', zorder=1))
    ax.text(-0.7, O.LARGURA / 2, f'LAJE DA PISCINA  ·  nível +{br(A)}', rotation=90, ha='center', va='center', fontsize=11, color='#666')
    ax.plot([0, 0], [0, O.LARGURA], color='#6b4a2b', lw=2.6, zorder=6)
    rotulo(ax, (0, 0.55), 'beira da laje\n(referência 1)', (-1.3, -0.75), fs=8.5, cor='#6b4a2b')
    for v0, v1 in ((-0.18, 0), (O.LARGURA, O.LARGURA + 0.18)):
        ax.add_patch(Rectangle((-1.4, v0), u_max + 1.4, v1 - v0, fc='#888', ec='none', zorder=6))
    ax.text(u_max - 0.1, -0.32, 'muro lateral do lado da amendoeira (referência 2)', ha='right', va='top', fontsize=8.5, color='#333')
    ax.text(u_max - 0.1, O.LARGURA + 0.3, 'muro lateral do outro lado', ha='right', va='bottom', fontsize=8.5, color='#333')
    # grama, lago, fundo
    ax.add_patch(Polygon(np.c_[U(O.GRAMA[:, 0]), O.GRAMA[:, 1]], fc=VERDE, ec='#6aa35a', lw=0.8, ls='--', zorder=2))
    ax.add_patch(Polygon(np.c_[U(O.LAGO[:, 0]), O.LAGO[:, 1]], fc=AZUL, ec='#1f5f8b', lw=1.8, zorder=3))
    xs = np.linspace(O.LAGO[:, 0].min(), O.LAGO[:, 0].max(), 260); ys = np.linspace(O.LAGO[:, 1].min(), O.LAGO[:, 1].max(), 300)
    X, Y = np.meshgrid(xs, ys); D = O.dentro_lago(X, Y); P = np.where(D, O.prof_lago(X, Y), np.nan)
    ax.contourf(U(X), Y, P, levels=[0.95, 2], colors=[AZUL_F], zorder=3)
    ax.contour(U(X), Y, P, levels=[O.PRAT_PROF - 0.005, 0.95], colors=['#1f5f8b'], linewidths=[0.6, 0.8], linestyles=[':', '-'], zorder=3)
    # cascata
    ax.add_patch(Rectangle((U(O.FACE), O.CY0), O.LAJES[-1][0], O.CY1 - O.CY0, fc='#b9b4aa', ec='#555', lw=0.8, hatch='////', zorder=4))
    # escada, árvore, poço
    e_u1 = U(O.FACE) + O.ESCADA_N * O.ESCADA_PISO
    ax.add_patch(Rectangle((0, O.ESCADA_Y0), e_u1, O.ESCADA_Y1 - O.ESCADA_Y0, fc='#e2d5c3', ec='#555', lw=0.8, zorder=4))
    for i in range(1, O.ESCADA_N):
        uu = U(O.FACE) + i * O.ESCADA_PISO
        ax.plot([uu, uu], [O.ESCADA_Y0, O.ESCADA_Y1], color='#777', lw=0.6, zorder=4)
    ax.text(e_u1 / 2, (O.ESCADA_Y0 + O.ESCADA_Y1) / 2, 'escada', ha='center', va='center', fontsize=8.5, zorder=5)
    ax.add_patch(Circle((U(O.ARVORE[0]), O.ARVORE[1]), 0.25, fc='#6b4f2a', ec='k', lw=0.8, zorder=5))
    ax.add_patch(Circle((U(O.ARVORE[0]), O.ARVORE[1]), 2.2, fc='none', ec='#6b4f2a', lw=0.6, ls=(0, (2, 3)), zorder=5))
    rotulo(ax, (U(O.ARVORE[0]) + 0.2, O.ARVORE[1] - 0.15), 'amendoeira\n(tracejado: copa)', (U(O.ARVORE[0]) + 1.0, 0.45), fs=8)
    ax.add_patch(Circle((U(O.POCO[0]), O.POCO[1]), O.POCO_R, fc='#d6d6d6', ec='k', lw=0.9, zorder=5))
    ax.text(U(O.POCO[0]), O.POCO[1], 'poço', ha='center', va='center', fontsize=9, zorder=6)
    # deck (por cima, tracejado) com pilares e sapatas
    ax.add_patch(Rectangle((U(O.DX0), O.DY0), O.DX1 - O.DX0, O.DY1 - O.DY0, fc=MADEIRA, alpha=0.35, ec='#7a5326', lw=1.4, ls='--', zorder=7))
    for (px, py) in O.PILARES:
        ax.add_patch(Rectangle((U(px) - 0.20, py - 0.20), 0.40, 0.40, fc='none', ec='#555', lw=0.7, ls=':', zorder=8))
        ax.add_patch(Rectangle((U(px) - 0.06, py - 0.06), 0.12, 0.12, fc='#5a3a17', ec='k', lw=0.6, zorder=8))
    ax.text(U((O.DX0 + O.DX1) / 2), (O.DY0 + O.DY1) / 2, 'DECK\n(por cima do lago)\ntopo +' + br(A), ha='center', va='center',
            fontsize=9, fontweight='bold', color='#5a3a17', zorder=9)
    # piquetes
    pts, per = lago_pts_regulares()
    for i, (x, y) in enumerate(pts):
        c = np.array([U(x), y]); cc = np.array([U(O.C_LAGO[0]), O.C_LAGO[1]]); dd = c - cc; dd /= np.linalg.norm(dd)
        ax.plot(*c, marker='o', ms=4.5, color=VERMELHO, zorder=10)
        ax.text(*(c + dd * 0.28), f'P{i + 1}', ha='center', va='center', fontsize=8, color=VERMELHO, fontweight='bold', zorder=10)
    # cotas do deck
    cota(ax, (U(O.DX0), O.DY1), (U(O.DX1), O.DY1), 0.0, txt=None, g=0.13) if False else None
    cota(ax, (U(O.DX1), O.DY0), (U(O.DX1), O.DY1), -0.0, txt='') if False else None
    cota(ax, (U(O.DX0), O.DY0), (U(O.DX1), O.DY0), -0.35, g=0.14)
    cota(ax, (U(O.DX0), O.DY0), (U(O.DX0), O.DY1), 0.0001, txt='') if False else None
    cota(ax, (-0.25, 0), (-0.25, O.DY0), 0.0, g=0.15) if False else None
    cota(ax, (0.0, 0.0), (0.0, O.DY0), 0.0001, txt='') if False else None
    ax.text(U(O.DX1) + 0.12, (O.DY0 + O.DY1) / 2, '', fontsize=8)
    cota(ax, (U(O.DX1) + 0.0, O.DY0), (U(O.DX1) + 0.0, O.DY1), -0.45, g=0.14)
    cota(ax, (-0.15, 0), (-0.15, O.DY0), 0.0, g=-0.16, txt=br(O.DY0))
    cota(ax, (-0.15, O.DY1), (-0.15, O.ESCADA_Y0), 0.0, g=-0.16, txt=br(O.ESCADA_Y0 - O.DY1))
    # medidas gerais do lago
    lu0, lu1 = U(O.LAGO[:, 0].min()), U(O.LAGO[:, 0].max()); lv0, lv1 = O.LAGO[:, 1].min(), O.LAGO[:, 1].max()
    cota(ax, (lu0, lv0), (lu1, lv0), -0.75, g=0.14, txt=f'lago: {br(lu1 - lu0)} de fundo')
    cota(ax, (lu1, lv0), (lu1, lv1), -0.55, g=0.14, txt=f'lago: {br(lv1 - lv0)} de comprimento')
    # distâncias de segurança
    d_poco = float(np.min(np.hypot(O.LAGO[:, 0] - O.POCO[0], O.LAGO[:, 1] - O.POCO[1]))) - O.POCO_R
    d_arv = float(np.min(np.hypot(O.LAGO[:, 0] - O.ARVORE[0], O.LAGO[:, 1] - O.ARVORE[1]))) - 0.25
    k = int(np.argmin(np.hypot(O.LAGO[:, 0] - O.POCO[0], O.LAGO[:, 1] - O.POCO[1]))); q = O.LAGO[k]
    w = np.array(O.POCO) + (q - np.array(O.POCO)) / np.linalg.norm(q - np.array(O.POCO)) * O.POCO_R
    ax.plot([U(q[0]), U(w[0])], [q[1], w[1]], color=VERMELHO, lw=1.0, ls='--', zorder=9)
    rotulo(ax, (U((q[0] + w[0]) / 2), (q[1] + w[1]) / 2), f'lago → poço: {br(d_poco)}', (U(w[0]) + 0.4, w[1] - 1.3), fs=8.5, cor=VERMELHO)
    k = int(np.argmin(np.hypot(O.LAGO[:, 0] - O.ARVORE[0], O.LAGO[:, 1] - O.ARVORE[1]))); q = O.LAGO[k]
    w = np.array(O.ARVORE) + (q - np.array(O.ARVORE)) / np.linalg.norm(q - np.array(O.ARVORE)) * 0.25
    ax.plot([U(q[0]), U(w[0])], [q[1], w[1]], color=VERMELHO, lw=1.0, ls='--', zorder=9)
    rotulo(ax, (U((q[0] + w[0]) / 2), (q[1] + w[1]) / 2), f'lago → tronco: {br(d_arv)}', (U(q[0]) + 1.2, (q[1] + w[1]) / 2 - 0.2), fs=8.5, cor=VERMELHO)
    # linhas dos cortes
    vA, uB = CORTE_A_V, CORTE_B_U
    for (p0, p1, nome) in (((-1.3, vA), (u_max - 0.1, vA), 'A'), ((uB, 0.05), (uB, O.LARGURA - 0.05), 'B')):
        ax.plot([p0[0], p1[0]], [p0[1], p1[1]], color='#333', lw=1.0, ls=(0, (8, 3, 2, 3)), zorder=11)
        for p in (p0, p1):
            ax.text(p[0], p[1], nome, ha='center', va='center', fontsize=10, fontweight='bold', zorder=12,
                    bbox=dict(boxstyle='circle,pad=0.25', fc='white', ec='#333', lw=1.0))
    ax.set_xlim(-1.5, u_max + 1.0); ax.set_ylim(-1.2, O.LARGURA + 0.7)

    # ---- quadro dos piquetes e legenda
    tx = fig.add_axes([0.655, 0.105, 0.33, 0.87]); tx.axis('off'); tx.set_xlim(0, 1); tx.set_ylim(0, 1)
    tx.text(0, 0.985, 'Pontos da linha d\'água (piquetes)', fontsize=11.5, fontweight='bold', va='top')
    tx.text(0, 0.955, 'a = da beira da laje   ·   b = do muro lateral do lado da amendoeira', fontsize=8.5, va='top', color='#444')
    lin = 0.925; meio = (len(pts) + 1) // 2
    for col in range(2):
        x0 = 0.0 + col * 0.5
        tx.text(x0 + 0.02, lin, 'ponto', fontsize=8.5, fontweight='bold', va='top'); tx.text(x0 + 0.17, lin, 'a', fontsize=8.5, fontweight='bold', va='top')
        tx.text(x0 + 0.31, lin, 'b', fontsize=8.5, fontweight='bold', va='top')
        for j, i in enumerate(range(col * meio, min(len(pts), (col + 1) * meio))):
            yy = lin - 0.026 * (j + 1)
            tx.text(x0 + 0.02, yy, f'P{i + 1}', fontsize=9, color=VERMELHO, fontweight='bold', va='top')
            tx.text(x0 + 0.17, yy, br(U(pts[i][0])), fontsize=9, va='top'); tx.text(x0 + 0.31, yy, br(pts[i][1]), fontsize=9, va='top')
    y_leg = lin - 0.026 * (meio + 1) - 0.03
    tx.text(0, y_leg, 'Legenda', fontsize=11.5, fontweight='bold', va='top')
    itens = [(AZUL, '#1f5f8b', '', 'água (linha cheia = linha d\'água, a borda da escavação)'),
             (AZUL_F, '#1f5f8b', '', 'fundo com 1,00 m de água (parte das carpas)'),
             ('white', '#1f5f8b', '', 'pontilhado: fim da prateleira de plantas (30 cm de água)'),
             (VERDE, '#6aa35a', '', 'grama em volta do lago'),
             ('#b9b4aa', '#555', '////', 'cascata de lajes de pedra'),
             (MADEIRA, '#7a5326', '', 'deck (por cima do lago)'),
             ('#5a3a17', 'k', '', 'pilar 12 x 12 cm; pontilhado: sapata 40 x 40 cm')]
    for k, (fc, ec, h, t) in enumerate(itens):
        yy = y_leg - 0.04 - 0.032 * k
        tx.add_patch(Rectangle((0.0, yy - 0.012), 0.06, 0.022, fc=fc, ec=ec, hatch=h, lw=0.8, alpha=0.9 if fc != MADEIRA else 0.5))
        tx.text(0.08, yy, t, fontsize=8.8, va='center')
    yy = y_leg - 0.04 - 0.032 * len(itens) - 0.02
    tx.text(0, yy, 'Números do lago', fontsize=11.5, fontweight='bold', va='top')
    xs = np.arange(O.LAGO[:, 0].min(), O.LAGO[:, 0].max(), 0.02); ys = np.arange(O.LAGO[:, 1].min(), O.LAGO[:, 1].max(), 0.02)
    X, Y = np.meshgrid(xs, ys); D = O.dentro_lago(X, Y); P = O.prof_lago(X, Y)
    area = D.sum() * 0.0004; vol = (P * D).sum() * 0.0004; fundo = ((P > 0.95) & D).sum() * 0.0004
    txt = (f'área da água: {br(area, 1)} m²   ·   contorno: {br(per, 1)} m\n'
           f'volume: cerca de {br(vol, 1)} m³ ({int(round(vol * 1000, -2)):,} litros)\n'.replace(',', '.') +
           f'parte funda (1,00 m): {br(fundo, 1)} m²\n'
           f'nível da água: {br(O.ZAGUA - O.LOW)} (6 cm abaixo do chão)\n'
           f'perto do barranco/muro: no máximo {br(O.ARRIMO_PROF)} de água\n'
           f'até {br(O.ARRIMO_RASO)} dele, para não cavar junto ao pé')
    tx.text(0, yy - 0.035, txt, fontsize=9, va='top', linespacing=1.5)
    tx.text(0, 0.0, 'Posições do poço, da escada e da amendoeira: conferir com trena antes de marcar.',
            fontsize=8.5, color=VERMELHO, va='bottom')
    return fig


# =================================================================== folha 2 — cortes do lago
def perfil_lago(xs, ys):
    """Profundidade e se está dentro, ao longo de uma linha."""
    D = O.dentro_lago(xs, ys); P = np.where(D, O.prof_lago(xs, ys), 0.0)
    return D, P


def desenha_corte(ax, s, xs, ys, titulo, eixo_lbl, laje_s=None):
    zA = O.ZAGUA - O.LOW; D, P = perfil_lago(xs, ys)
    z_fundo = np.where(D, zA - P, 0.0)
    # terra
    s0, s1 = s[0], s[-1]
    base = -1.6
    terra = np.r_[z_fundo]
    if laje_s is not None:
        terra = np.where(s < laje_s, A, terra)
    ax.fill_between(s, base, terra, color=TERRA, zorder=1, lw=0)
    ax.fill_between(s, base, terra, facecolor='none', hatch='..', edgecolor='#b59f7c', zorder=1, lw=0)
    # areia + manta embaixo do lago
    dentro = D.copy()
    if dentro.any():
        ss = s[dentro]
        ax.fill_between(s, np.where(D, z_fundo - 0.05, np.nan), np.where(D, z_fundo, np.nan), color='#efe3c2', zorder=2, lw=0)
        ax.plot(s, np.where(D, z_fundo, np.nan), color='#111', lw=2.0, zorder=4)
        # água
        ax.fill_between(s, np.where(D, z_fundo, np.nan), np.where(D, zA, np.nan), color=AZUL, zorder=3, lw=0)
        ax.plot(s, np.where(D, zA, np.nan), color='#1f5f8b', lw=1.0, zorder=4)
        # pedras da borda nas pontas
        idx = np.nonzero(np.diff(D.astype(int)))[0]
        for i in idx:
            sc = (s[i] + s[i + 1]) / 2
            ax.add_patch(Circle((sc, 0.02), 0.20, fc=PEDRA, ec='#555', lw=0.8, zorder=6))
            ax.plot([sc - 0.45 if D[i + 1] else sc - 0.05, sc + 0.05 if D[i + 1] else sc + 0.45], [0.0, 0.0], color='#111', lw=2.0, zorder=5)
    if laje_s is not None:
        ax.add_patch(Rectangle((s0, A - 0.12), laje_s - s0, 0.12, fc='#cfcfcf', ec='#555', lw=0.8, hatch='////', zorder=5))
        ax.plot([laje_s, laje_s], [0, A - 0.12], color='#6b4a2b', lw=1.0, zorder=5)
    ax.plot(s, np.where(D, np.nan, terra), color='#5b4a33', lw=1.2, zorder=4)
    ax.set_title(titulo, fontsize=12, fontweight='bold', loc='left')
    ax.set_xlabel(eixo_lbl, fontsize=8.5, color='#555')
    return D, z_fundo


CORTE_A_V = 4.70          # corte A–A: ao longo do terreno, passando pelo deck e pelo meio do lago
CORTE_B_U = 2.90          # corte B–B: de um muro lateral ao outro, passando pela parte funda


def folha2():
    fig = folha(2, 'Cortes do laguinho', 'Corte A–A atravessa o deck e o lago; corte B–B vai de um muro lateral ao outro. Escala dos dois igual (sem exagero).')
    zA = O.ZAGUA - O.LOW
    # ---- corte A–A (ao longo de x, em y = CORTE_A_V)
    ax = fig.add_axes([0.04, 0.56, 0.92, 0.39]); ax.set_aspect('equal')
    u = np.linspace(-1.2, U(O.LAGO[:, 0].max()) + 1.3, 1200); x = u + O.EDGE; y = np.full_like(x, CORTE_A_V)
    D, zf = desenha_corte(ax, u, x, y, 'Corte A–A', 'distância a partir da beira da laje (m)', laje_s=0.0)
    # deck no corte
    if O.DY0 < CORTE_A_V < O.DY1:
        zt = A
        ax.add_patch(Rectangle((U(O.DX0), zt - O.DTAB), O.DX1 - O.DX0, O.DTAB, fc=MADEIRA, ec='#5a3a17', lw=0.7, zorder=7))
        ax.add_patch(Rectangle((U(O.DX0) + 0.08, zt - O.DTAB - O.DBAR), O.DX1 - O.DX0 - 0.08, O.DBAR, fc='#ddc39a', ec='#5a3a17', lw=0.7, zorder=7))
        ax.add_patch(Rectangle((U(O.VX0), zt + (O.ZV0 - 0)), O.VX1 - O.VX0, O.ZV1 - O.ZV0, fc=MADEIRA, ec='#5a3a17', lw=0.7, zorder=7))
        ax.add_patch(Rectangle((U(O.DX0) + 0.08, zt - O.DTAB - O.DBAR - 0.12), 0.12, 0.12, fc=MADEIRA, ec='#5a3a17', lw=0.7, zorder=7))
        # pilar em vista (atrás do corte)
        ax.add_patch(Rectangle((U(O.VX0), 0.05), O.VX1 - O.VX0, zt + O.ZV0 - 0.05, fc='none', ec='#5a3a17', lw=0.8, ls='--', zorder=6))
        ax.add_patch(Rectangle((U(O.VX0) - 0.14, -0.40), 0.40, 0.45, fc='none', ec='#666', lw=0.7, ls='--', zorder=6))
        # guarda-corpo em vista na ponta
        ax.add_patch(Rectangle((U(O.DX1) - 0.075, zt), 0.075, O.GUARDA_H, fc='none', ec='#5a3a17', lw=0.8, zorder=7))
        ax.plot([U(O.DX0), U(O.DX1)], [zt + O.GUARDA_H, zt + O.GUARDA_H], color='#5a3a17', lw=1.6, ls='--', zorder=7)
        cota(ax, (U(O.DX1) + 0.0, zt), (U(O.DX1), zt + O.GUARDA_H), -0.25, g=0.12, tick=0.04)
        cota(ax, (U(O.DX0), zt + O.GUARDA_H), (U(O.DX1), zt + O.GUARDA_H), 0.22, g=0.10, tick=0.04)
        rotulo(ax, (U(O.DX0) + 0.6, zt - 0.01), 'deck: tábua 10 x 2,5 + barrote 6 x 16', (U(O.DX0) + 0.15, zt + 0.55), fs=8)
        rotulo(ax, (U(O.VX0) + 0.06, zt + O.ZV0 + 0.05), 'viga 12 x 20', (U(O.VX1) + 0.5, zt - 0.05), fs=8)
        rotulo(ax, (U(O.VX0) + 0.06, 0.35), 'pilar 12 x 12 (atrás do corte,\nfora da água) e sapata', (U(O.VX1) + 0.5, 0.45), fs=8)
        rotulo(ax, (U(O.DX0) + 0.14, zt - O.DTAB - O.DBAR - 0.06), 'viga de apoio\n6 x 12 na beira', (-1.1, zt - 0.55), fs=8)
    # níveis
    def nv(s, z, txt, lado=1):
        ax.plot([s - 0.12, s + 0.12], [z, z], color='#222', lw=0.8, zorder=9)
        ax.plot([s, s - 0.06, s + 0.06, s], [z, z + 0.08, z + 0.08, z], color='#222', lw=0.8, zorder=9)
        ax.text(s + 0.16 * lado, z + 0.04, txt, fontsize=8.5, ha='left' if lado > 0 else 'right', va='bottom', zorder=9,
                bbox=dict(fc='white', ec='none', pad=0.5, alpha=0.85))
    u_fundo = u[D][np.argmin(zf[D])] if D.any() else 2.0
    s_lim = u[-1] - 0.2
    nv(-0.9, A, f'+{br(A)} laje da piscina = topo do deck')
    nv(s_lim - 0.9, 0.0, '0,00 chão do quintal de baixo')
    nv(u_fundo + 0.35, zA, f'{br(zA)} nível da água')
    nv(u_fundo + 0.35, zA - O.PROF, f'{br(zA - O.PROF)} fundo (1,00 m de água)')
    nv(u_fundo + 0.35, zA - O.PROF - 0.08, f'{br(zA - O.PROF - 0.08)} escavar (areia 5 cm + mantas)', lado=1) if False else None
    rotulo(ax, (u_fundo, zA - O.PROF - 0.03), 'manta impermeável sobre manta de proteção\ne 5 cm de areia (escavar até ' + br(zA - O.PROF - 0.08) + ')',
           (u_fundo + 0.9, zA - O.PROF - 0.35), fs=8)
    # prateleira: achar no perfil
    sh = D & (np.abs(zf - (zA - O.PRAT_PROF)) < 0.004)
    if sh.any():
        s_sh = u[sh][len(u[sh]) // 2]
        nv(s_sh, zA - O.PRAT_PROF, f'{br(zA - O.PRAT_PROF)} prateleira de plantas', lado=1)
    ax.set_xlim(u[0], u[-1]); ax.set_ylim(-1.45, A + O.GUARDA_H + 0.25)
    ax.set_yticks([]); ax.tick_params(labelsize=8)
    for sp in ('top', 'right', 'left'):
        ax.spines[sp].set_visible(False)

    # ---- corte B–B (ao longo de y, em x = EDGE + CORTE_B_U)
    ax = fig.add_axes([0.04, 0.115, 0.92, 0.39]); ax.set_aspect('equal')
    v = np.linspace(-0.05, O.LARGURA + 0.05, 1400); x = np.full_like(v, O.EDGE + CORTE_B_U)
    D, zf = desenha_corte(ax, v, x, v, 'Corte B–B', 'distância a partir do muro lateral do lado da amendoeira (m)')
    for vv in (0, O.LARGURA):
        ax.add_patch(Rectangle((vv - (0.15 if vv else 0.0) + (0.0 if vv else -0.15), 0), 0.15, 2.2, fc='#999', ec='#555', lw=0.6, zorder=5))
    # poço em vista se estiver perto
    if abs(O.POCO[0] - (O.EDGE + CORTE_B_U)) < O.POCO_R + 1.5:
        ax.add_patch(Rectangle((O.POCO[1] - O.POCO_R, 0), 2 * O.POCO_R, 0.65, fc='#ddd', ec='#555', lw=0.8, ls='--', zorder=5))
        ax.text(O.POCO[1], 0.32, 'poço (em vista)', ha='center', va='center', fontsize=8, zorder=6)
    if abs(O.ARVORE[0] - (O.EDGE + CORTE_B_U)) < 3.0:
        ax.add_patch(Rectangle((O.ARVORE[1] - 0.25, 0), 0.5, 2.2, fc='#8a6a45', ec='#555', lw=0.6, ls='--', alpha=0.6, zorder=5))
        ax.text(O.ARVORE[1], 2.3, 'amendoeira (em vista)', ha='center', va='bottom', fontsize=8)
    if D.any():
        vd = v[D]
        cota(ax, (vd[0], zA + 0.02), (vd[-1], zA + 0.02), 0.55, g=0.10, tick=0.04, txt=f'água: {br(vd[-1] - vd[0])}')
        k = np.argmin(zf)
        def nv2(s, z, txt):
            ax.plot([s - 0.12, s + 0.12], [z, z], color='#222', lw=0.8, zorder=9)
            ax.plot([s, s - 0.06, s + 0.06, s], [z, z + 0.08, z + 0.08, z], color='#222', lw=0.8, zorder=9)
            ax.text(s + 0.16, z + 0.04, txt, fontsize=8.5, ha='left', va='bottom', zorder=9, bbox=dict(fc='white', ec='none', pad=0.5, alpha=0.85))
        nv2(v[k], zA - O.PROF, f'{br(zA - O.PROF)} fundo')
        nv2(vd[0] + 0.25, zA, f'{br(zA)} água')
        sh = D & (np.abs(zf - (zA - O.PRAT_PROF)) < 0.004)
        if sh.any():
            nv2(v[sh][0], zA - O.PRAT_PROF, f'{br(zA - O.PRAT_PROF)} prateleira')
        # larguras das faixas do fundo (no lado de menor y)
        j0 = np.nonzero(D)[0][0]
        s_sh0 = v[j0] + O.BEIRA; s_sh1 = v[j0] + O.PRAT_FIM; s_w1 = v[j0] + O.PAREDE_FIM
        for a_, b_, t_ in ((v[j0], s_sh0, 'beira\n' + br(O.BEIRA)), (s_sh0, s_sh1, 'prateleira\n' + br(O.PRAT_FIM - O.BEIRA)),
                           (s_sh1, s_w1, 'talude\n' + br(O.PAREDE_FIM - O.PRAT_FIM))):
            cota(ax, (a_, zA - O.PROF - 0.18), (b_, zA - O.PROF - 0.18), 0.0, g=-0.16, tick=0.035, txt=t_, fs=7.5)
    nv_t = 0.0
    ax.plot([v[0], v[-1]], [nv_t, nv_t], color='#5b4a33', lw=0.0)
    ax.set_xlim(-0.3, O.LARGURA + 0.3); ax.set_ylim(-1.55, 2.6)
    ax.set_yticks([]); ax.tick_params(labelsize=8)
    for sp in ('top', 'right', 'left'):
        ax.spines[sp].set_visible(False)
    return fig


# =================================================================== folha 3 — deck
def folha3():
    fig = folha(3, 'Deck — estrutura', 'Madeira de lei (cumaru ou garapeira) tratada, parafusos e ferragens galvanizados ou inox. Conferir com engenheiro/carpinteiro.')
    L_ = O.DX1 - O.DX0; W_ = O.DY1 - O.DY0
    # ---- planta da estrutura (sem as tábuas): u para a direita, v para cima
    ax = fig.add_axes([0.03, 0.12, 0.42, 0.83]); ax.set_aspect('equal'); ax.axis('off')
    ax.add_patch(Rectangle((-0.6, -0.4), 0.6, W_ + 0.8, fc='#ecebe7', ec='none', hatch='..'))
    ax.text(-0.3, W_ / 2, 'LAJE', rotation=90, ha='center', va='center', fontsize=10, color='#777')
    ax.plot([0, 0], [-0.4, W_ + 0.4], color='#6b4a2b', lw=2.2)
    ax.add_patch(Rectangle((0.08, 0), 0.12, W_, fc=MADEIRA, ec='#5a3a17', lw=0.8))          # viga de apoio
    ax.add_patch(Rectangle((U(O.VX0), 0), O.VX1 - O.VX0, W_, fc=MADEIRA, ec='#5a3a17', lw=0.8))   # viga externa
    for yy in O.BARROTES:
        ax.add_patch(Rectangle((0.08, yy - O.DY0 - 0.03), L_ - 0.08, 0.06, fc='#ddc39a', ec='#5a3a17', lw=0.7))
    ax.add_patch(Rectangle((L_, 0), 0.025, W_, fc='#a37b46', ec='#5a3a17', lw=0.6))           # testeira
    for (px, py) in O.PILARES:
        ax.add_patch(Rectangle((U(px) - 0.20, py - O.DY0 - 0.20), 0.40, 0.40, fc='none', ec='#555', lw=0.8, ls=':'))
        ax.add_patch(Rectangle((U(px) - 0.06, py - O.DY0 - 0.06), 0.12, 0.12, fc='#5a3a17', ec='k', lw=0.6))
    # tábuas indicadas (só algumas, no canto)
    for i in range(4):
        x0 = i * L_ / O.N_TABUAS
        ax.add_patch(Rectangle((x0 + 0.0025, W_ - 0.9), L_ / O.N_TABUAS - 0.005, 0.9, fc=MADEIRA, ec='#5a3a17', lw=0.4, alpha=0.6))
    rotulo(ax, (0.2, W_ - 0.5), f'{O.N_TABUAS} tábuas 10 x 2,5 x {br(W_)}\njunta de 5 mm, na direção\ndo comprimento do deck', (0.55, W_ + 0.55), fs=8.5)
    rotulo(ax, (0.14, 0.4), 'viga de apoio 6 x 12\nna beira da laje', (-0.55, -0.85), fs=8.5)
    rotulo(ax, (U(O.VX0) + 0.06, 1.0), 'viga 12 x 20', (L_ + 0.35, 1.25), fs=8.5)
    rotulo(ax, (1.0, O.BARROTES[3] - O.DY0), f'{len(O.BARROTES)} barrotes 6 x 16', (L_ + 0.35, W_ / 2 + 0.25), fs=8.5)
    rotulo(ax, (L_ + 0.012, W_ - 0.3), 'testeira', (L_ + 0.35, W_ - 0.2), fs=8.5)
    rotulo(ax, (U(O.PILARES[0][0]) + 0.05, 0.07), 'pilar 12 x 12\nsapata 40 x 40 x 40', (L_ + 0.35, -0.35), fs=8.5)
    # cotas
    cota(ax, (0, 0), (L_, 0), -0.95, g=0.10, tick=0.04)
    cota(ax, (0, 0), (U(O.VX0), 0), -0.6, g=0.10, tick=0.04)
    cota(ax, (L_, 0), (L_, W_), -0.95, g=0.12, tick=0.04)
    for k in range(len(O.BARROTES) - 1):
        cota(ax, (L_ + 0.05, O.BARROTES[k] - O.DY0), (L_ + 0.05, O.BARROTES[k + 1] - O.DY0), -0.3, g=0.12, tick=0.03, fs=7.5,
             txt=br(O.BARROTES[k + 1] - O.BARROTES[k]), ext=False) if False else None
    for k in range(len(O.BARROTES) - 1):
        cota(ax, (-0.05, O.BARROTES[k] - O.DY0), (-0.05, O.BARROTES[k + 1] - O.DY0), 0.0, g=-0.14, tick=0.03, fs=7.5, ext=False)
    ax.text(L_ / 2, W_ + 1.05, 'Planta da estrutura (sem as tábuas)', ha='center', fontsize=12, fontweight='bold')
    ax.set_xlim(-0.9, L_ + 1.5); ax.set_ylim(-1.4, W_ + 1.3)

    # ---- vista lateral (corte no meio do deck)
    ax = fig.add_axes([0.48, 0.47, 0.50, 0.47]); ax.set_aspect('equal'); ax.axis('off')
    zt = A
    ax.add_patch(Rectangle((-0.7, zt - 0.12), 0.7, 0.12, fc='#cfcfcf', ec='#555', lw=0.8, hatch='////'))
    ax.fill_between([-0.7, 0.0], [-0.25, -0.25], [zt - 0.12, zt - 0.12], color=TERRA, lw=0)
    ax.fill_between([0.0, L_ + 0.6], [-0.25, -0.25], [0, 0], color=TERRA, lw=0)
    ax.plot([0, 0], [0, zt - 0.12], color='#6b4a2b', lw=1.2)
    ax.plot([0, L_ + 0.6], [0, 0], color='#5b4a33', lw=1.0)
    ax.add_patch(Rectangle((0, zt - O.DTAB), L_, O.DTAB, fc=MADEIRA, ec='#5a3a17', lw=0.7))
    ax.add_patch(Rectangle((0.08, zt - O.DTAB - O.DBAR), L_ - 0.08, O.DBAR, fc='#ddc39a', ec='#5a3a17', lw=0.7))
    ax.add_patch(Rectangle((0.08, zt - O.DTAB - O.DBAR - 0.12), 0.12, 0.12, fc=MADEIRA, ec='#5a3a17', lw=0.7))
    ax.add_patch(Rectangle((U(O.VX0), zt + O.ZV0), O.VX1 - O.VX0, O.ZV1 - O.ZV0, fc=MADEIRA, ec='#5a3a17', lw=0.7))
    ax.add_patch(Rectangle((U(O.VX0), 0.05), O.VX1 - O.VX0, zt + O.ZV0 - 0.05, fc=MADEIRA, ec='#5a3a17', lw=0.7))
    ax.add_patch(Rectangle((U(O.VX0) - 0.14, -0.40), 0.40, 0.45, fc='#cfcfcf', ec='#555', lw=0.7, hatch='xx'))
    ax.add_patch(Rectangle((L_, zt - O.DTAB - O.DBAR), 0.025, O.DBAR + O.DTAB, fc='#a37b46', ec='#5a3a17', lw=0.6))
    # guarda-corpo (vista)
    gx0, gx1 = 0.0, L_
    ax.add_patch(Rectangle((gx1 - 0.075, zt), 0.075, O.GUARDA_H, fc=MADEIRA, ec='#5a3a17', lw=0.7))
    ax.add_patch(Rectangle((gx0, zt + O.GUARDA_H - 0.045), gx1 - gx0, 0.045, fc=MADEIRA, ec='#5a3a17', lw=0.7))
    ax.add_patch(Rectangle((gx0, zt + 0.1 - 0.025), gx1 - gx0, 0.05, fc=MADEIRA, ec='#5a3a17', lw=0.5))
    ax.add_patch(Rectangle((gx0, zt + O.GUARDA_H - 0.1 - 0.025), gx1 - gx0, 0.05, fc=MADEIRA, ec='#5a3a17', lw=0.5))
    m = int(L_ / 0.115)
    for i in range(1, m):
        c = gx0 + (gx1 - gx0) * i / m
        ax.add_patch(Rectangle((c - 0.014, zt + 0.125), 0.028, O.GUARDA_H - 0.25, fc='#ddc39a', ec='#5a3a17', lw=0.4))
    # cotas de altura
    cota(ax, (L_ + 0.3, 0), (L_ + 0.3, zt), 0.0, g=-0.12, tick=0.035, txt=f'{br(zt)} (desnível)')
    cota(ax, (L_ + 0.1, zt), (L_ + 0.1, zt + O.GUARDA_H), 0.0, g=-0.12, tick=0.035)
    cota(ax, (U(O.VX1) + 0.12, 0.05), (U(O.VX1) + 0.12, zt + O.ZV0), 0.0, g=-0.12, tick=0.035, txt=f'pilar {br(zt + O.ZV0 - 0.05)}')
    cota(ax, (-0.1, zt), (-0.1, zt - O.DTAB - O.DBAR), 0.0, g=0.12, tick=0.03, txt=br(O.DTAB + O.DBAR), fs=7.5)
    cota(ax, (U(O.VX0) - 0.1, zt - O.DTAB - O.DBAR), (U(O.VX0) - 0.1, zt + O.ZV0), 0.0, g=0.12, tick=0.03, fs=7.5)
    cota(ax, (0, -0.55), (U(O.VX0), -0.55), 0.0, g=-0.1, tick=0.03, fs=7.5)
    cota(ax, (U(O.VX1), -0.55), (L_, -0.55), 0.0, g=-0.1, tick=0.03, fs=7.5, txt=br(L_ - U(O.VX1)))
    vao = (L_ / m) - 0.028
    rotulo(ax, (gx0 + (gx1 - gx0) * 3 / m, zt + 0.6), f'balaústres 2,8 x 2,8 a cada {br(L_ / m * 100, 1)} cm\n(vão de {br(vao * 100, 1)} cm: criança não passa)',
           (0.15, zt + O.GUARDA_H + 0.45), fs=8)
    rotulo(ax, (U(O.VX0) + 0.06, -0.2), 'sapata de concreto 40 x 40 x 40', (U(O.VX1) + 0.45, -0.35), fs=8)
    ax.text(L_ / 2, zt + O.GUARDA_H + 0.95, 'Vista lateral (cortado no meio do deck)', ha='center', fontsize=12, fontweight='bold')
    ax.set_xlim(-0.8, L_ + 1.2); ax.set_ylim(-0.75, zt + O.GUARDA_H + 1.1)

    # ---- notas
    tx = fig.add_axes([0.48, 0.12, 0.50, 0.32]); tx.axis('off')
    notas = [
        'Como montar',
        f'1. Sapatas de concreto 40 x 40 x 40 cm nos dois cantos de fora, no seco, fora da água do lago, com o pé do pilar',
        '    num suporte metálico (o pilar não encosta na terra nem no concreto).',
        f'2. Pilares 12 x 12 até a viga externa 12 x 20 ({br(W_)} m), presa no topo dos pilares com chapa e parafuso passante.',
        '3. Viga de apoio 6 x 12 na beira da laje, com chumbador a cada 50 cm (só se a beira tiver muro ou viga de concreto;',
        '    sem isso, mais dois pilares na beira, iguais aos de fora).',
        f'4. {len(O.BARROTES)} barrotes 6 x 16 a cada {br(O.BARROTES[1] - O.BARROTES[0])} m, apoiados na viga de apoio e na viga externa, com',
        f'    cantoneira galvanizada; passam {br(L_ - U(O.VX1))} da viga externa até a testeira.',
        f'5. {O.N_TABUAS} tábuas 10 x 2,5 de {br(W_)} m, junta de 5 mm, 2 parafusos inox por barrote.',
        f'6. Guarda-corpo de {br(O.GUARDA_H)} m nos três lados que dão para o quintal; o lado da piscina fica aberto.',
    ]
    for k, t in enumerate(notas):
        tx.text(0, 1 - k * 0.095, t, fontsize=12 if k == 0 else 9.3, fontweight='bold' if k == 0 else 'normal', va='top',
                transform=tx.transAxes)
    return fig


if __name__ == '__main__':
    figs = [('folha1-locacao', folha1()), ('folha2-cortes', folha2()), ('folha3-deck', folha3())]
    with PdfPages(os.path.join(SAIDA, 'deck-laguinho.pdf')) as pdf:
        for nome, f in figs:
            f.savefig(os.path.join(SAIDA, nome + '.png'), dpi=150)
            pdf.savefig(f)
            print('ok', nome)
