"""Folhas com medidas do laguinho para o pedreiro: planta de locação, cortes do lago e detalhes do muro e da cascata.

    python3 desenhos_obra.py PASTA

Lê tudo do obra.py (as mesmas medidas da maquete 3D). No terreno, as medidas partem de duas referências: a beira
da laje (nível da piscina) e o muro lateral do lado da amendoeira. Níveis: chão do quintal de baixo = 0,00 (a laje
da piscina fica no nível do desnível, +1,00).
Gera PASTA/folha1-locacao.png, PASTA/folha2-cortes.png, PASTA/folha3-detalhes.png e PASTA/laguinho.pdf.
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
    ax.annotate(txt, xy=xy, xytext=xyt, fontsize=fs, color=cor, ha=ha, va=va, fontweight=peso, zorder=30,
                arrowprops=dict(arrowstyle='-', color=cor, lw=0.6, shrinkA=0, shrinkB=1),
                bbox=dict(fc='white', ec='none', pad=0.8, alpha=0.92))


def folha(n, titulo, subtitulo):
    fig = plt.figure(figsize=(16.54, 11.69))       # A3 deitada
    fig.patch.set_facecolor('white')
    fig.add_artist(Rectangle((0.012, 0.015), 0.976, 0.97, transform=fig.transFigure, fill=False, lw=1.4, ec='#222'))
    fig.add_artist(Rectangle((0.012, 0.015), 0.976, 0.075, transform=fig.transFigure, fill=False, lw=1.0, ec='#222'))
    fig.text(0.022, 0.066, titulo, fontsize=15, fontweight='bold', va='center')
    fig.text(0.022, 0.034, subtitulo, fontsize=10, va='center', color='#333')
    fig.text(0.66, 0.066, 'Quintal de baixo — laguinho e muro de pedra', fontsize=10, va='center')
    fig.text(0.66, 0.034, f'Medidas em metros · níveis a partir do chão do quintal de baixo (0,00) · {datetime.date.today():%d/%m/%Y}',
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


# =================================================================== desenho comum: a área do lago vista de cima
def base_planta(ax, u_max, v0=0.0, v1=None, grade=True):
    v1 = O.LARGURA if v1 is None else v1
    if grade:
        for u in np.arange(0, u_max + 0.01, 0.5):
            ax.plot([u, u], [v0, v1], color='#e3e3e3', lw=0.5 if u % 1 else 0.9, zorder=0)
        for v in np.arange(math.ceil(v0 * 2) / 2, v1 + 0.01, 0.5):
            ax.plot([0, u_max], [v, v], color='#e3e3e3', lw=0.5 if v % 1 else 0.9, zorder=0)
    ax.add_patch(Rectangle((-1.4, v0), 1.4, v1 - v0, fc='#ecebe7', ec='none', hatch='..', zorder=1))
    # muro de arrimo de pedra (faixa de 20 cm na frente da beira da laje), sem a boca da escada
    for a_, b_ in O.MURO_TRECHOS:
        a_, b_ = max(a_, v0), min(b_, v1)
        if b_ > a_:
            ax.add_patch(Rectangle((0, a_), 0.20, b_ - a_, fc=PEDRA, ec='#555', lw=0.6, hatch='oo', zorder=6))
    ax.plot([0, 0], [v0, v1], color='#6b4a2b', lw=1.6, zorder=7)
    # guarda-corpo na laje
    for a_, b_ in ((0.12, O.ESCADA_Y0), (O.ESCADA_Y1, 9.95)):
        a_, b_ = max(a_, v0), min(b_, v1)
        if b_ > a_:
            ax.plot([-0.04, -0.04], [a_, b_], color='#7a5326', lw=3.0, zorder=8, solid_capstyle='butt')
    # escada, poço, amendoeira
    e_u1 = U(O.FACE) + O.ESCADA_N * O.ESCADA_PISO
    if O.ESCADA_Y1 > v0 and O.ESCADA_Y0 < v1:
        ax.add_patch(Rectangle((0, O.ESCADA_Y0), e_u1, O.ESCADA_Y1 - O.ESCADA_Y0, fc='#e2d5c3', ec='#555', lw=0.8, zorder=6))
        for i in range(1, O.ESCADA_N + 1):
            uu = U(O.FACE) + i * O.ESCADA_PISO
            ax.plot([uu, uu], [O.ESCADA_Y0, O.ESCADA_Y1], color='#777', lw=0.6, zorder=6)
        ax.text(e_u1 / 2, (O.ESCADA_Y0 + O.ESCADA_Y1) / 2, 'escada', ha='center', va='center', fontsize=8.5, zorder=7)
    ax.add_patch(Circle((U(O.POCO[0]), O.POCO[1]), O.POCO_R, fc='#d6d6d6', ec='k', lw=0.9, zorder=6))
    ax.text(U(O.POCO[0]), O.POCO[1], 'poço', ha='center', va='center', fontsize=9, zorder=7)
    ax.add_patch(Circle((U(O.POCO[0]), O.POCO[1]), O.POCO_R + 1.5, fc='none', ec=VERMELHO, lw=0.8, ls='--', zorder=5))
    ax.add_patch(Circle((U(O.ARVORE[0]), O.ARVORE[1]), 0.25, fc='#6b4f2a', ec='k', lw=0.8, zorder=6))
    ax.add_patch(Circle((U(O.ARVORE[0]), O.ARVORE[1]), 1.2, fc='none', ec='#6b4f2a', lw=0.7, ls=(0, (1.5, 2.5)), zorder=5))
    # grama e lago
    ax.add_patch(Polygon(np.c_[U(O.GRAMA[:, 0]), O.GRAMA[:, 1]], fc=VERDE, ec='#6aa35a', lw=0.8, ls='--', zorder=2))
    ax.add_patch(Polygon(np.c_[U(O.LAGO[:, 0]), O.LAGO[:, 1]], fc=AZUL, ec='#1f5f8b', lw=1.8, zorder=3))
    xs = np.linspace(O.LAGO[:, 0].min(), O.LAGO[:, 0].max(), 260); ys = np.linspace(O.LAGO[:, 1].min(), O.LAGO[:, 1].max(), 260)
    X, Y = np.meshgrid(xs, ys); D = O.dentro_lago(X, Y); P = np.where(D, O.prof_lago(X, Y), np.nan)
    ax.contourf(U(X), Y, P, levels=[O.PROF - 0.03, 2], colors=[AZUL_F], zorder=3)
    ax.contour(U(X), Y, P, levels=[O.PRAT_PROF + 0.005], colors=['#1f5f8b'], linewidths=[0.6], linestyles=[':'], zorder=3)
    # cascata
    co = np.array(O.CASCATA['origem']); cd = np.array([math.cos(O.CASCATA['ang']), math.sin(O.CASCATA['ang'])]); cl = np.array([-cd[1], cd[0]])
    w2 = O.CASCATA['largura'] / 2; av = O.CASCATA['lajes'][-1][0]
    q = [co + cl * w2, co + cl * w2 + cd * av, co - cl * w2 + cd * av, co - cl * w2]
    ax.add_patch(Polygon([(U(p[0]), p[1]) for p in q], fc='#b9b4aa', ec='#444', lw=0.9, hatch='////', zorder=8))


# =================================================================== folha 1 — planta de locação
def folha1():
    fig = folha(1, 'Planta de locação (vista de cima)', 'Marcar a linha d\'água com piquetes nos pontos P1…; ligar os pontos com uma mangueira deitada no chão, em curva.')
    ax = fig.add_axes([0.03, 0.105, 0.60, 0.87])
    ax.set_aspect('equal'); ax.axis('off')
    u_max = max(U(O.POCO[0]) + O.POCO_R + 1.0, U(O.LAGO[:, 0].max()) + 1.0)
    v_top = min(O.LARGURA, O.ESCADA_Y1 + 1.5)
    base_planta(ax, u_max, 0.0, v_top)
    for u in range(0, int(u_max) + 1):
        ax.text(u, -0.4, br(u, 0 if u == 0 else 1) if u else '0', ha='center', va='top', fontsize=8, color='#777')
    for v in range(0, int(v_top) + 1):
        ax.text(u_max + 0.15, v, br(v, 1) if v else '0', ha='left', va='center', fontsize=8, color='#777')
    ax.text(u_max / 2, -0.75, 'distância a partir da beira da laje (m)', ha='center', va='top', fontsize=8.5, color='#555')
    ax.text(u_max + 0.8, v_top / 2, 'distância a partir do muro lateral do lado da amendoeira (m)', rotation=90, ha='center',
            va='center', fontsize=8.5, color='#555')
    ax.add_patch(Rectangle((-1.4, -0.18), u_max + 1.4, 0.18, fc='#888', ec='none', zorder=6))
    ax.text(u_max - 0.1, -0.22, 'muro lateral do lado da amendoeira (referência 2)', ha='right', va='top', fontsize=8.5, color='#333')
    ax.text(-0.7, v_top / 2 + 0.6, f'LAJE DA PISCINA  ·  nível +{br(A)}', rotation=90, ha='center', va='center', fontsize=11, color='#666')
    rotulo(ax, (0, v_top - 0.4), 'beira da laje\n(referência 1)', (-1.35, v_top + 0.25), fs=8.5, cor='#6b4a2b')
    rotulo(ax, (-0.04, 1.0), f'guarda-corpo\n{br(O.GUARDA_H)} m', (-1.35, 0.55), fs=8, cor='#7a5326')
    rotulo(ax, (0.10, O.ESCADA_Y1 + 0.7), 'muro de arrimo\nde pedra (novo)', (0.6, v_top + 0.25), fs=8)
    co = O.CASCATA['origem']
    rotulo(ax, (U(co[0]) + 0.4, co[1] + 0.1), 'cascata', (U(co[0]) + 0.55, co[1] + 1.15), fs=8.5)
    rotulo(ax, (U(O.ARVORE[0]) + 0.18, O.ARVORE[1] - 0.1), 'amendoeira\n(pontilhado: 1,20\ndo tronco)', (U(O.ARVORE[0]) + 0.45, 1.05), fs=8)
    rotulo(ax, (U(O.POCO[0]) + O.POCO_R + 1.06, O.POCO[1] + 1.06), '1,50 de folga do poço', (U(O.POCO[0]) + 0.6, O.POCO[1] + 2.05), fs=8, cor=VERMELHO)
    # piquetes
    pts, per = lago_pts_regulares(0.7)
    cc = np.array([U(O.C_LAGO[0]), O.C_LAGO[1]])
    for i, (x, y) in enumerate(pts):
        c = np.array([U(x), y]); dd = c - cc; dd /= np.linalg.norm(dd)
        ax.plot(*c, marker='o', ms=4.5, color=VERMELHO, zorder=10)
        ax.text(*(c + dd * 0.28), f'P{i + 1}', ha='center', va='center', fontsize=8, color=VERMELHO, fontweight='bold', zorder=10)
    # medidas
    lu0, lu1 = U(O.LAGO[:, 0].min()), U(O.LAGO[:, 0].max()); lv0, lv1 = O.LAGO[:, 1].min(), O.LAGO[:, 1].max()
    cota(ax, (0, lv0), (lu1, lv0), -0.42, g=0.14, txt=f'{br(lu1)} até a ponta do lago')
    cota(ax, (lu1, 0), (lu1, lv0), -0.25, g=0.14)
    cota(ax, (lu1, lv0), (lu1, lv1), -0.6, g=0.14, txt=f'lago: {br(lv1 - lv0)}')
    w2 = O.CASCATA['largura'] / 2
    cota(ax, (0.9, co[1] - w2), (0.9, co[1] + w2), 0.0, g=-0.16, txt=br(2 * w2)) if False else None
    d_poco = float(np.min(np.hypot(O.LAGO[:, 0] - O.POCO[0], O.LAGO[:, 1] - O.POCO[1]))) - O.POCO_R
    d_arv = float(np.min(np.hypot(O.LAGO[:, 0] - O.ARVORE[0], O.LAGO[:, 1] - O.ARVORE[1])))
    cota(ax, (U(O.FACE) + O.ESCADA_N * O.ESCADA_PISO, O.POCO[1]), (U(O.POCO[0]) - O.POCO_R, O.POCO[1]), 0.0, g=0.15)
    cota(ax, (0, O.ESCADA_Y1 + 0.25), (U(O.FACE) + O.ESCADA_N * O.ESCADA_PISO, O.ESCADA_Y1 + 0.25), 0.0, g=0.15)
    cota(ax, (U(O.POCO[0]) + O.POCO_R + 0.35, 0), (U(O.POCO[0]) + O.POCO_R + 0.35, O.POCO[1] - O.POCO_R), 0.0, g=-0.16) if False else None
    # linhas dos cortes
    for (p0, p1, nome) in (((-1.3, CORTE_A_V), (u_max - 0.1, CORTE_A_V), 'A'), ((CORTE_B_U, 0.05), (CORTE_B_U, v_top - 0.05), 'B')):
        ax.plot([p0[0], p1[0]], [p0[1], p1[1]], color='#333', lw=1.0, ls=(0, (8, 3, 2, 3)), zorder=11)
        for p in (p0, p1):
            ax.text(p[0], p[1], nome, ha='center', va='center', fontsize=10, fontweight='bold', zorder=12,
                    bbox=dict(boxstyle='circle,pad=0.25', fc='white', ec='#333', lw=1.0))
    ax.set_xlim(-1.5, u_max + 1.1); ax.set_ylim(-1.0, v_top + 0.6)

    # ---- quadro dos piquetes, legenda e números
    tx = fig.add_axes([0.655, 0.105, 0.33, 0.87]); tx.axis('off'); tx.set_xlim(0, 1); tx.set_ylim(0, 1)
    tx.text(0, 0.985, 'Pontos da linha d\'água (piquetes)', fontsize=11.5, fontweight='bold', va='top')
    tx.text(0, 0.957, 'a = da beira da laje   ·   b = do muro lateral do lado da amendoeira', fontsize=8.5, va='top', color='#444')
    lin = 0.93; meio = (len(pts) + 1) // 2
    for col in range(2):
        x0 = col * 0.5
        tx.text(x0 + 0.02, lin, 'ponto', fontsize=8.5, fontweight='bold', va='top'); tx.text(x0 + 0.17, lin, 'a', fontsize=8.5, fontweight='bold', va='top')
        tx.text(x0 + 0.31, lin, 'b', fontsize=8.5, fontweight='bold', va='top')
        for j, i in enumerate(range(col * meio, min(len(pts), (col + 1) * meio))):
            yy = lin - 0.024 * (j + 1)
            tx.text(x0 + 0.02, yy, f'P{i + 1}', fontsize=9, color=VERMELHO, fontweight='bold', va='top')
            tx.text(x0 + 0.17, yy, br(U(pts[i][0])), fontsize=9, va='top'); tx.text(x0 + 0.31, yy, br(pts[i][1]), fontsize=9, va='top')
    y_leg = lin - 0.024 * (meio + 1) - 0.025
    tx.text(0, y_leg, 'Legenda', fontsize=11.5, fontweight='bold', va='top')
    itens = [(AZUL, '#1f5f8b', '', 'água (linha cheia = linha d\'água, a borda da escavação)'),
             (AZUL_F, '#1f5f8b', '', f'parte funda, {br(O.PROF)} m de água'),
             ('white', '#1f5f8b', '', f'pontilhado: fim da prateleira de plantas ({round(O.PRAT_PROF * 100)} cm de água)'),
             (VERDE, '#6aa35a', '', 'grama em volta do lago'),
             (PEDRA, '#555', 'oo', 'muro de arrimo novo, revestido de pedra'),
             ('#b9b4aa', '#444', '////', 'cascata de lajes de pedra (desce do alto do muro)'),
             ('#7a5326', '#7a5326', '', f'guarda-corpo de madeira de {br(O.GUARDA_H)} m na beira da laje')]
    for k, (fc, ec, h, t) in enumerate(itens):
        yy = y_leg - 0.04 - 0.03 * k
        tx.add_patch(Rectangle((0.0, yy - 0.011), 0.06, 0.021, fc=fc, ec=ec, hatch=h, lw=0.8))
        tx.text(0.08, yy, t, fontsize=8.8, va='center')
    yy = y_leg - 0.04 - 0.03 * len(itens) - 0.015
    tx.text(0, yy, 'Números do lago', fontsize=11.5, fontweight='bold', va='top')
    xs = np.arange(O.LAGO[:, 0].min(), O.LAGO[:, 0].max(), 0.02); ys = np.arange(O.LAGO[:, 1].min(), O.LAGO[:, 1].max(), 0.02)
    X, Y = np.meshgrid(xs, ys); D = O.dentro_lago(X, Y); P = O.prof_lago(X, Y)
    area = D.sum() * 0.0004; vol = (P * D).sum() * 0.0004; fundo = ((P > O.PROF - 0.03) & D).sum() * 0.0004
    litros = f'{int(round(vol * 1000, -2)):,}'.replace(',', '.')
    txt = (f'área da água: {br(area, 1)} m²   ·   contorno: {br(per, 1)} m\n'
           f'volume: cerca de {br(vol, 1)} m³ ({litros} litros)\n'
           f'parte funda ({br(O.PROF)} m): {br(fundo, 1)} m²\n'
           f'nível da água: 6 cm abaixo do chão do quintal\n'
           f'folga: {br(d_poco)} m da boca do poço · {br(d_arv)} m do centro do tronco\n'
           f'cascata: {round(O.CASCATA["largura"] * 100)} cm de largura, de {br(co[1] - w2)} a {br(co[1] + w2)} do muro da amendoeira')
    tx.text(0, yy - 0.032, txt, fontsize=9, va='top', linespacing=1.5)
    tx.text(0, 0.0, 'Posição da amendoeira, lado da escada e diâmetro do poço: estimados\npelas fotos. Conferir com trena antes de marcar.',
            fontsize=8.6, color=VERMELHO, va='bottom')
    return fig


# =================================================================== folha 2 — cortes do lago
def desenha_corte(ax, s, xs, ys, titulo, eixo_lbl, laje_s=None):
    zA = O.ZAGUA - O.LOW; D = O.dentro_lago(xs, ys); P = np.where(D, O.prof_lago(xs, ys), 0.0)
    z_fundo = np.where(D, zA - P, 0.0)
    base = -1.5
    terra = z_fundo.copy()
    if laje_s is not None:
        terra = np.where(s < laje_s, A, terra)
    ax.fill_between(s, base, terra, color=TERRA, zorder=1, lw=0)
    ax.fill_between(s, base, terra, facecolor='none', hatch='..', edgecolor='#b59f7c', zorder=1, lw=0)
    if D.any():
        ax.fill_between(s, np.where(D, z_fundo - 0.05, np.nan), np.where(D, z_fundo, np.nan), color='#efe3c2', zorder=2, lw=0)
        ax.plot(s, np.where(D, z_fundo, np.nan), color='#111', lw=2.0, zorder=4)
        ax.fill_between(s, np.where(D, z_fundo, np.nan), np.where(D, zA, np.nan), color=AZUL, zorder=3, lw=0)
        ax.plot(s, np.where(D, zA, np.nan), color='#1f5f8b', lw=1.0, zorder=4)
        idx = np.nonzero(np.diff(D.astype(int)))[0]
        for i in idx:
            sc = (s[i] + s[i + 1]) / 2
            ax.add_patch(Circle((sc, 0.02), 0.17, fc=PEDRA, ec='#555', lw=0.8, zorder=6))
            ax.plot([sc - 0.4 if D[i + 1] else sc - 0.05, sc + 0.05 if D[i + 1] else sc + 0.4], [0.0, 0.0], color='#111', lw=2.0, zorder=5)
    ax.plot(s, np.where(D, np.nan, terra), color='#5b4a33', lw=1.2, zorder=4)
    ax.set_title(titulo, fontsize=12, fontweight='bold', loc='left')
    ax.set_xlabel(eixo_lbl, fontsize=8.5, color='#555')
    return D, z_fundo


def nv(ax, s, z, txt, lado=1, fs=8.5):
    ax.plot([s - 0.12, s + 0.12], [z, z], color='#222', lw=0.8, zorder=9)
    ax.plot([s, s - 0.06, s + 0.06, s], [z, z + 0.08, z + 0.08, z], color='#222', lw=0.8, zorder=9)
    ax.text(s + 0.16 * lado, z + 0.04, txt, fontsize=fs, ha='left' if lado > 0 else 'right', va='bottom', zorder=9,
            bbox=dict(fc='white', ec='none', pad=0.5, alpha=0.85))


def muro_corte(ax, laje_s=0.0, com_cascata=True):
    """Muro de arrimo de pedra no corte (face na beira da laje), sapata, dreno, capa e guarda-corpo."""
    zA = O.ZAGUA - O.LOW
    ax.add_patch(Rectangle((laje_s - 3.3, A - 0.12), 3.3, 0.12, fc='#cfcfcf', ec='#555', lw=0.8, hatch='////', zorder=5))
    ax.add_patch(Rectangle((laje_s - 0.19, -0.75), 0.19, A - 0.12 + 0.75, fc='#bdbdbd', ec='#444', lw=0.8, hatch='xx', zorder=6))   # bloco grauteado
    ax.add_patch(Rectangle((laje_s, -0.62), 0.14, A - 0.06 + 0.62, fc=PEDRA, ec='#444', lw=0.8, hatch='oo', zorder=6))            # revestimento de pedra
    ax.add_patch(Rectangle((laje_s - 0.40, -0.95), 0.75, 0.20, fc='#cfcfcf', ec='#444', lw=0.8, hatch='////', zorder=6))            # sapata corrida
    ax.add_patch(Rectangle((laje_s - 0.19, A - 0.06), 0.36, 0.06, fc='#e8e2d4', ec='#444', lw=0.8, zorder=7))                     # capa de pedra
    ax.add_patch(Rectangle((laje_s - 0.55, -0.70), 0.34, A - 0.2 + 0.70, fc='#e9e6df', ec='#888', lw=0.6, hatch='..', zorder=5))   # brita do dreno
    ax.add_patch(Circle((laje_s - 0.38, -0.55), 0.05, fc='white', ec='#333', lw=0.8, zorder=7))
    # guarda-corpo
    gx = laje_s - 0.04
    ax.add_patch(Rectangle((gx - 0.0375, A), 0.075, O.GUARDA_H, fc=MADEIRA, ec='#5a3a17', lw=0.7, zorder=8))
    ax.add_patch(Rectangle((gx - 0.06, A + O.GUARDA_H - 0.045), 0.12, 0.045, fc='#a37b46', ec='#5a3a17', lw=0.7, zorder=8))
    if com_cascata:
        zt_prev = None
        for av, zt in O.CASCATA['lajes']:
            z_ = zt - O.LOW
            ax.add_patch(Rectangle((laje_s + 0.14, z_ - 0.08), av - 0.14 + 0.08, 0.08, fc='#9e9a92', ec='#333', lw=0.8, zorder=8))
        for k, (av, zt) in enumerate(O.CASCATA['lajes']):
            z0 = zt - O.LOW; z1 = (O.CASCATA['lajes'][k + 1][1] - O.LOW) if k + 1 < len(O.CASCATA['lajes']) else zA
            t = np.linspace(0, 1, 12)
            ax.plot(laje_s + av + 0.08 + 0.10 * t, z0 - (z0 - z1) * t * t, color='#5aa0cf', lw=2.2, alpha=0.8, zorder=9)


CORTE_A_V = round(O.CASCATA['origem'][1], 2)      # corte A–A: do alto da laje, passando pela cascata e pelo lago
CORTE_B_U = round(float(O.LAGO[:, 0].max() - O.EDGE) - 1.15, 2)   # corte B–B: de um muro lateral ao outro, pela parte funda


def folha2():
    fig = folha(2, 'Cortes do laguinho', 'A–A passa pela cascata, do alto da laje ao quintal; B–B vai do muro lateral da amendoeira até o poço. Mesma escala, sem exagero.')
    zA = O.ZAGUA - O.LOW
    # ---- corte A–A
    ax = fig.add_axes([0.04, 0.56, 0.92, 0.39]); ax.set_aspect('equal')
    u = np.linspace(-3.2, U(O.LAGO[:, 0].max()) + 0.6, 1600); x = u + O.EDGE; y = np.full_like(x, CORTE_A_V)
    D, zf = desenha_corte(ax, u, x, y, 'Corte A–A (pela cascata)', 'distância a partir da beira da laje (m)', laje_s=0.0)
    muro_corte(ax, 0.0, True)
    nv(ax, -2.9, A, f'+{br(A)} laje da piscina')
    nv(ax, u[-1] - 1.1, 0.0, '0,00 chão do quintal de baixo')
    if D.any():
        ud = u[D]; k = np.argmin(zf)
        nv(ax, ud[-1] - 0.5, zA, f'{br(zA)} nível da água')
        nv(ax, u[k] + 0.1, zA - float(O.prof_lago(x[k], y[k])), f'{br(zA - float(O.prof_lago(x[k], y[k])))} fundo')
    for k, (av, zt) in enumerate(O.CASCATA['lajes']):
        nv(ax, av + 0.42, zt - O.LOW, f'+{br(zt - O.LOW)} laje {k + 1}', fs=7.8)
    cota(ax, (-0.04 + 0.3, A), (-0.04 + 0.3, A + O.GUARDA_H), 0.0, g=-0.13, tick=0.035)
    rotulo(ax, (-0.04, A + 0.75), 'guarda-corpo de madeira\n(balaústres a cada 11,4 cm)', (-1.6, A + 1.0), fs=8, ha='right')
    rotulo(ax, (0.07, 0.62), 'revestimento de pedra\narredondada, com argamassa', (-1.6, 0.55), fs=8, ha='right')
    rotulo(ax, (-0.1, 0.25), 'bloco de concreto\ngrauteado com ferro', (-1.6, 0.15), fs=8, ha='right')
    rotulo(ax, (-0.38, -0.55), 'dreno: tubo furado\n+ brita atrás do muro', (-1.6, -0.45), fs=8, ha='right')
    rotulo(ax, (-0.05, -0.85), 'sapata corrida, abaixo\ndo fundo do lago', (-1.6, -1.05), fs=8, ha='right')
    rotulo(ax, (O.CASCATA['lajes'][0][0] - 0.1, O.CASCATA['lajes'][0][1] - O.LOW - 0.04), 'cascata: 3 lajes de pedra\n(a água sai atrás da laje de cima)',
           (1.9, A + 0.55), fs=8)
    ax.set_xlim(u[0], u[-1]); ax.set_ylim(-1.45, A + O.GUARDA_H + 0.3)
    ax.set_yticks([]); ax.tick_params(labelsize=8)
    for sp in ('top', 'right', 'left'):
        ax.spines[sp].set_visible(False)
    # ---- corte B–B
    ax = fig.add_axes([0.04, 0.115, 0.92, 0.39]); ax.set_aspect('equal')
    v_fim = min(O.LARGURA, O.POCO[1] + O.POCO_R + 0.8)
    v = np.linspace(-0.15, v_fim, 1400); x = np.full_like(v, O.EDGE + CORTE_B_U)
    D, zf = desenha_corte(ax, v, x, v, f'Corte B–B ({br(CORTE_B_U)} m da beira da laje)', 'distância a partir do muro lateral do lado da amendoeira (m)')
    ax.add_patch(Rectangle((-0.15, 0), 0.15, 2.2, fc='#999', ec='#555', lw=0.6, zorder=5))
    ax.text(-0.07, 2.25, 'muro', ha='center', va='bottom', fontsize=8)
    ax.add_patch(Rectangle((O.POCO[1] - O.POCO_R, 0), 2 * O.POCO_R, 0.4, fc='#ddd', ec='#555', lw=0.8, ls='--', zorder=5))
    ax.text(O.POCO[1], 0.2, 'poço (em vista)', ha='center', va='center', fontsize=8, zorder=6)
    if D.any():
        vd = v[D]
        cota(ax, (vd[0], zA + 0.02), (vd[-1], zA + 0.02), 0.5, g=0.10, tick=0.04, txt=f'água: {br(vd[-1] - vd[0])}')
        cota(ax, (vd[-1], 0.1), (O.POCO[1] - O.POCO_R, 0.1), 0.0, g=0.12, tick=0.035, txt=f'folga {br(O.POCO[1] - O.POCO_R - vd[-1])}')
        k = np.argmin(zf)
        nv(ax, v[k] + 0.25, zf[k], f'{br(zf[k])} fundo ({br(-zf[k] + zA)} de água)')
        nv(ax, vd[0] + 0.2, zA, f'{br(zA)} água')
        sh = D & (np.abs(zf - (zA - O.PRAT_PROF)) < 0.004)
        if sh.any():
            nv(ax, v[sh][0], zA - O.PRAT_PROF, f'{br(zA - O.PRAT_PROF)} prateleira')
        j0 = np.nonzero(D)[0][0]
        s1 = v[j0] + O.BEIRA; s2 = v[j0] + O.PRAT_FIM; s3 = v[j0] + O.PAREDE_FIM
        rotulo(ax, (v[j0] + 0.06, zA - 0.12), f'beira de {round(O.BEIRA * 100)} cm para as pedras', (vd[0] - 0.35, -0.45), fs=7.8, ha='right')
        rotulo(ax, ((s1 + s2) / 2, zA - O.PRAT_PROF), f'prateleira de plantas: {round((O.PRAT_FIM - O.BEIRA) * 100)} cm', (vd[0] - 0.35, -0.8), fs=7.8, ha='right')
        rotulo(ax, ((s2 + s3) / 2, zA - (O.PRAT_PROF + O.PROF) / 2), f'talude: {round((O.PAREDE_FIM - O.PRAT_FIM) * 100)} cm', (vd[0] - 0.35, -1.15), fs=7.8, ha='right')
        rotulo(ax, (v[k] + 0.2, zf[k] - 0.03), 'manta impermeável sobre manta de proteção\ne 5 cm de areia (cavar 8 cm a mais que o fundo)',
               (vd[-1] + 0.35, -1.3), fs=7.8)
    ax.set_xlim(-2.2, v_fim + 0.2); ax.set_ylim(-1.5, 2.6)
    ax.set_yticks([]); ax.tick_params(labelsize=8)
    for sp in ('top', 'right', 'left'):
        ax.spines[sp].set_visible(False)
    return fig


# =================================================================== folha 3 — detalhes: muro de pedra, cascata e guarda-corpo
def folha3():
    fig = folha(3, 'Detalhes: muro de arrimo de pedra, cascata e guarda-corpo',
                'Desenho de referência; estrutura do muro (ferro, sapata e graute) conferir com engenheiro antes de executar.')
    # ---- corte típico do muro
    ax = fig.add_axes([0.03, 0.12, 0.40, 0.82]); ax.set_aspect('equal'); ax.axis('off')
    ax.fill_between([-1.3, 0.0], [-1.1, -1.1], [A - 0.12, A - 0.12], color=TERRA, lw=0)
    ax.fill_between([0.0, 1.4], [-1.1, -1.1], [0, 0], color=TERRA, lw=0)
    muro_corte(ax, 0.0, False)
    ax.plot([0.14, 1.4], [0, 0], color='#5b4a33', lw=1.2)
    cota(ax, (0.6, 0), (0.6, A), 0.0, g=0.16, tick=0.035, txt=f'{br(A)} desnível')
    cota(ax, (-0.40, -1.05), (0.35, -1.05), -0.12, g=-0.1, tick=0.03, fs=7.5, txt='sapata 75 x 20')
    cota(ax, (0.9, -0.75), (0.9, 0.0), 0.0, g=-0.16, tick=0.035, txt='0,75 abaixo')
    cota(ax, (-0.04 - 0.35, A), (-0.04 - 0.35, A + O.GUARDA_H), 0.0, g=0.13, tick=0.035)
    rotulo(ax, (0.07, 0.25), 'pedra arredondada (seixo\ngrande / pedra de rio),\n10 a 15 cm, com argamassa', (0.75, 0.3), fs=8.5)
    rotulo(ax, (-0.1, 0.3), 'bloco de concreto\n19 cm, grauteado\ncom ferro', (-1.25, 0.6), fs=8.5)
    rotulo(ax, (-0.38, -0.55), 'dreno: tubo furado 100 mm\nem brita, com manta,\nsaindo nas pontas', (-1.25, -0.4), fs=8.5)
    rotulo(ax, (-0.02, -0.85), 'sapata corrida de\nconcreto armado', (0.5, -0.65), fs=8.5)
    rotulo(ax, (0.0, A - 0.03), 'capa de pedra lisa no\nnível do piso da laje', (0.45, A + 0.45), fs=8.5)
    ax.text(0.0, A + O.GUARDA_H + 0.45, 'Corte típico do muro de arrimo', ha='center', fontsize=12, fontweight='bold')
    ax.set_xlim(-1.35, 1.5); ax.set_ylim(-1.35, A + O.GUARDA_H + 0.6)
    # ---- guarda-corpo em vista
    ax = fig.add_axes([0.47, 0.56, 0.50, 0.38]); ax.set_aspect('equal'); ax.axis('off')
    L_ = 2.5
    ax.add_patch(Rectangle((0, -0.1), L_, 0.1, fc='#cfcfcf', ec='#555', lw=0.8, hatch='////'))
    for xx in (0.0, 1.25, 2.5):
        ax.add_patch(Rectangle((xx - 0.0375, 0), 0.075, O.GUARDA_H, fc=MADEIRA, ec='#5a3a17', lw=0.7))
    ax.add_patch(Rectangle((-0.05, O.GUARDA_H - 0.045), L_ + 0.1, 0.045, fc='#a37b46', ec='#5a3a17', lw=0.7))
    for zz in (0.1, O.GUARDA_H - 0.1):
        ax.add_patch(Rectangle((0, zz - 0.025), L_, 0.05, fc=MADEIRA, ec='#5a3a17', lw=0.5))
    m = round(1.25 / 0.115)
    for seg0 in (0.0, 1.25):
        for i in range(1, m):
            c = seg0 + 1.25 * i / m
            ax.add_patch(Rectangle((c - 0.014, 0.125), 0.028, O.GUARDA_H - 0.25, fc='#ddc39a', ec='#5a3a17', lw=0.4))
    cota(ax, (L_ + 0.25, 0), (L_ + 0.25, O.GUARDA_H), 0.0, g=-0.13, tick=0.035)
    cota(ax, (0, -0.25), (1.25, -0.25), 0.0, g=-0.1, tick=0.03, fs=8, txt='postes a cada 1,25')
    vao = 1.25 / m - 0.028
    rotulo(ax, (0.6, 0.6), f'balaústres 2,8 x 2,8 a cada {br(1.25 / m * 100, 1)} cm\n(vão de {br(vao * 100, 1)} cm: criança não passa)', (0.2, O.GUARDA_H + 0.3), fs=8.5)
    rotulo(ax, (1.25, 0.05), 'poste 7,5 x 7,5 chumbado na laje,\na 4 cm da beira (chapa e parabolt)', (1.55, -0.55), fs=8.5)
    ax.text(L_ / 2, O.GUARDA_H + 0.65, 'Guarda-corpo em vista (madeira tratada)', ha='center', fontsize=12, fontweight='bold')
    ax.set_xlim(-0.3, L_ + 0.7); ax.set_ylim(-0.85, O.GUARDA_H + 0.85)
    # ---- notas
    tx = fig.add_axes([0.47, 0.12, 0.50, 0.40]); tx.axis('off')
    lj = O.CASCATA['lajes']
    notas = ['Cascata e bomba',
             f'• Três lajes de pedra de {round(O.CASCATA["largura"] * 100)} cm de largura, saindo {", ".join(br(a) for a, _ in lj)} m da face do muro,',
             f'  com o topo a +{", +".join(br(z - O.LOW) for _, z in lj)} do chão do quintal; a de baixo cai direto na água.',
             '• A bomba fica no fundo, na parte funda do lado da amendoeira; o cano (PVC 25 mm) vai enterrado',
             '  até atrás do muro e sobe por dentro das pedras até a laje de cima, escondido.',
             '• Ladrão (saída da água que sobra) do lado do muro da amendoeira, longe do poço.',
             '• Tomada para a bomba com DR, no alto do muro, protegida da chuva.',
             '',
             'Ordem da obra',
             '1. Marcar os piquetes (folha 1) e conferir as folgas do poço e da amendoeira.',
             '2. Fazer o muro de arrimo com a sapata abaixo do fundo do lago no trecho do lago.',
             '3. Cavar o lago (à mão perto da árvore, sem cortar raiz grossa), areia, mantas.',
             '4. Assentar a borda de pedras e a cascata; encher e testar a bomba.',
             '5. Guarda-corpo na beira da laje antes de liberar a área de cima.']
    for k, t in enumerate(notas):
        bold = t in ('Cascata e bomba', 'Ordem da obra')
        tx.text(0, 1 - k * 0.07, t, fontsize=12 if bold else 9.3, fontweight='bold' if bold else 'normal', va='top', transform=tx.transAxes)
    return fig


if __name__ == '__main__':
    figs = [('folha1-locacao', folha1()), ('folha2-cortes', folha2()), ('folha3-detalhes', folha3())]
    with PdfPages(os.path.join(SAIDA, 'laguinho.pdf')) as pdf:
        for nome, f in figs:
            f.savefig(os.path.join(SAIDA, nome + '.png'), dpi=150)
            pdf.savefig(f)
            print('ok', nome)
