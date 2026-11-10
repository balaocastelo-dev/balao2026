"""Folhas com medidas do laguinho para o pedreiro: planta de locação, cortes e detalhes (versão de 10/11/2026, o
lago redesenhado pelas fotos de referência do Thiago, com o muro de pedras empilhadas e a cascata de uma queda só).

    python3 desenhos_obra.py PASTA

Lê tudo do obra.py (as mesmas medidas da maquete 3D) e os números do quantidades_lago.py. No terreno, as medidas
partem de duas referências: a beira da laje (nível da piscina) e o muro lateral do lado da amendoeira. Níveis: chão
do quintal de baixo = 0,00 (o piso da laje fica em +1,00).
Gera PASTA/folha1-locacao.png, PASTA/folha2-cortes.png, PASTA/folha3-detalhes.png e PASTA/laguinho.pdf.
"""
import os, sys, math, datetime
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Circle, Polygon, Ellipse
from matplotlib.backends.backend_pdf import PdfPages

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import obra as O
from quantidades_lago import numeros

SAIDA = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'desenhos')
os.makedirs(SAIDA, exist_ok=True)
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 9, 'hatch.linewidth': 0.5})

AZUL, AZUL_F, VERDE, TERRA, PEDRA, MADEIRA, VERMELHO = '#cfe6f3', '#7fb5d6', '#d5ead0', '#d9c7a8', '#a7a196', '#c9a16b', '#c0392b'
PEDRAS_COR = ('#b9b2a4', '#a29c90', '#c4b49a', '#8f9484', '#b7a58c')
MARROM, CANO, LADRAO, LUZ = '#6b4f2a', '#1f5f8b', '#8a5a2b', '#d38b00'
A = 0.0 - O.LOW                                 # desnível: da laje ao chão do quintal de baixo (1,00)
TOPO = O.MURO_TOPO - O.LOW                      # topo das pedras do muro (0,96)
N_FOLHAS = 3
NUM = numeros()


def br(v, casas=2):
    return f'{v:.{casas}f}'.replace('.', ',').replace('-', '−')


def U(x):
    return x - O.EDGE                           # distância a partir da beira da laje


def cota(ax, p0, p1, off, txt=None, g=0.10, tick=0.05, fs=8.5, cor='#222', ext=True):
    """Linha de cota de p0 a p1, deslocada `off` para o lado esquerdo do sentido p0→p1."""
    p0, p1 = np.asarray(p0, float), np.asarray(p1, float)
    d = p1 - p0; L = float(np.linalg.norm(d)); t = d / L; n = np.array([-t[1], t[0]])
    a, b = p0 + n * off, p1 + n * off
    s = 1.0 if off >= 0 else -1.0
    if ext and abs(off) > 1e-6:
        for p, q in ((p0, a), (p1, b)):
            ax.plot([p[0] + n[0] * s * g * 0.3, q[0] + n[0] * s * g * 0.6], [p[1] + n[1] * s * g * 0.3, q[1] + n[1] * s * g * 0.6],
                    color=cor, lw=0.45, zorder=20)
    ax.plot([a[0], b[0]], [a[1], b[1]], color=cor, lw=0.7, zorder=20)
    for q in (a, b):
        k = (t + n) / math.sqrt(2) * tick
        ax.plot([q[0] - k[0], q[0] + k[0]], [q[1] - k[1], q[1] + k[1]], color=cor, lw=1.3, zorder=20)
    m = (a + b) / 2 + n * s * g
    ang = math.degrees(math.atan2(t[1], t[0]))
    if ang > 90.5 or ang <= -89.5:
        ang -= 180
    ax.text(m[0], m[1], txt if txt is not None else br(L), rotation=ang, ha='center', va='center', fontsize=fs, color=cor,
            bbox=dict(fc='white', ec='none', pad=0.6), zorder=21)


def rotulo(ax, xy, txt, xyt, fs=8.5, cor='#222', ha='left', va='center', peso='normal'):
    ax.annotate(txt, xy=xy, xytext=xyt, fontsize=fs, color=cor, ha=ha, va=va, fontweight=peso, zorder=30,
                arrowprops=dict(arrowstyle='-', color=cor, lw=0.6, shrinkA=0, shrinkB=1),
                bbox=dict(fc='white', ec='none', pad=0.8, alpha=0.92))


def nv(ax, s, z, txt, lado=1, fs=8.5):
    ax.plot([s - 0.12, s + 0.12], [z, z], color='#222', lw=0.8, zorder=22)
    ax.plot([s, s - 0.06, s + 0.06, s], [z, z + 0.08, z + 0.08, z], color='#222', lw=0.8, zorder=22)
    ax.text(s + 0.16 * lado, z + 0.04, txt, fontsize=fs, ha='left' if lado > 0 else 'right', va='bottom', zorder=22,
            bbox=dict(fc='white', ec='none', pad=0.5, alpha=0.85))


def folha(n, titulo, subtitulo):
    fig = plt.figure(figsize=(16.54, 11.69))       # A3 deitada
    fig.patch.set_facecolor('white')
    fig.add_artist(Rectangle((0.012, 0.015), 0.976, 0.97, transform=fig.transFigure, fill=False, lw=1.4, ec='#222'))
    fig.add_artist(Rectangle((0.012, 0.015), 0.976, 0.075, transform=fig.transFigure, fill=False, lw=1.0, ec='#222'))
    fig.text(0.022, 0.066, titulo, fontsize=15, fontweight='bold', va='center')
    fig.text(0.022, 0.034, subtitulo, fontsize=10, va='center', color='#333')
    fig.text(0.66, 0.066, 'Quintal de baixo — laguinho, muro de pedras e cascata', fontsize=10, va='center')
    fig.text(0.66, 0.034, f'Medidas em metros · níveis a partir do chão do quintal de baixo (0,00) · {datetime.date.today():%d/%m/%Y}',
             fontsize=8.5, va='center', color='#333')
    fig.text(0.975, 0.066, f'FOLHA {n}/{N_FOLHAS}', fontsize=13, fontweight='bold', va='center', ha='right')
    return fig


def lago_pts_regulares(passo=0.75):
    """Pontos de marcação (piquetes) a cada ~`passo` metros ao longo da linha d'água, começando junto ao muro da
    amendoeira, perto da laje, e seguindo para o portão."""
    L = O.LAGO; seg = np.sqrt(((np.roll(L, -1, axis=0) - L) ** 2).sum(axis=1)); s = np.concatenate([[0], np.cumsum(seg)])
    per = s[-1]; n = int(round(per / passo)); out = []
    k0 = int(np.argmin(L[:, 0] + 3 * L[:, 1])); s0 = s[k0]
    sentido = 1 if L[(k0 + 3) % len(L), 1] < L[k0, 1] + 0.2 and L[(k0 + 3) % len(L), 0] > L[k0, 0] else -1
    for i in range(n):
        si = (s0 + sentido * i * per / n) % per
        k = min(int(np.searchsorted(s, si, side='right') - 1), len(L) - 1)
        t = (si - s[k]) / seg[k]
        out.append(L[k] + (L[(k + 1) % len(L)] - L[k]) * t)
    return np.array(out), per


def muro_pts():
    """Piquetes do pé do muro de pedras: os pontos de controle do MURO_PE (u da beira da laje, v do muro)."""
    return np.array([(u, v) for u, v in O.MURO_PE])


# =================================================================== desenho comum: a área do lago vista de cima
def base_planta(ax, u_max, v0=0.0, v1=None, grade=True, canos=True):
    v1 = O.LARGURA if v1 is None else v1
    if grade:
        for u in np.arange(0, u_max + 0.01, 0.5):
            ax.plot([u, u], [v0, v1], color='#e6e6e6', lw=0.5 if u % 1 else 0.9, zorder=0)
        for v in np.arange(math.ceil(v0 * 2) / 2, v1 + 0.01, 0.5):
            ax.plot([0, u_max], [v, v], color='#e6e6e6', lw=0.5 if v % 1 else 0.9, zorder=0)
    ax.add_patch(Rectangle((-1.4, v0), 1.4, v1 - v0, fc='#ecebe7', ec='none', hatch='..', zorder=1))
    ax.plot([0, 0], [v0, v1], color='#6b4a2b', lw=1.6, zorder=7)
    # piso futuro do pergolado do cineminha
    px0 = U(O.PERGOLADO_X0 + 0.05)
    ax.add_patch(Rectangle((px0, 0.0), min(5.2, u_max - px0), 4.4, fc='#f3ece0', ec='#8a6d45', lw=0.8, ls='--', zorder=1))
    # muro de pedras empilhadas: entre o pé (no chão) e a frente do topo
    vs = np.linspace(0.0, O.ESCADA_Y0, 160)
    pe = np.array([float(O.muro_pe(v)) for v in vs]); tp = np.array([float(O.muro_frente(v, O.MURO_TOPO)) for v in vs])
    ax.add_patch(Polygon(np.r_[np.c_[np.zeros_like(vs), vs], np.c_[pe, vs][::-1]], fc='#ece6da', ec='none', zorder=4))
    ax.add_patch(Polygon(np.r_[np.c_[tp, vs], np.c_[pe, vs][::-1]], fc=PEDRA, ec='#555', lw=0.7, hatch='oo', zorder=5))
    ax.plot(pe, vs, color='#333', lw=1.4, zorder=6)
    # muro de arrimo reto (só do outro lado da escada; fica para a obra do banheiro)
    for a_, b_ in O.MURO_TRECHOS:
        a_, b_ = max(a_, v0), min(b_, v1)
        if b_ > a_:
            ax.add_patch(Rectangle((0, a_), O.BLOCO, b_ - a_, fc='#bdbdbd', ec='#555', lw=0.6, hatch='xx', zorder=6))
            ax.add_patch(Rectangle((O.BLOCO, a_), O.REVEST, b_ - a_, fc='#cfcac0', ec='#555', lw=0.6, hatch='oo', zorder=6))
    # guarda-corpo no piso da laje, 10 cm antes da beira, contornando o tronco da amendoeira
    gl = np.array(O.GUARDA_LINHA, float)
    ax.plot(gl[:, 0], gl[:, 1], color='#7a5326', lw=3.0, zorder=8, solid_capstyle='butt', solid_joinstyle='miter')
    for p0, p1 in zip(gl[:-1], gl[1:]):
        nn = max(1, round(float(np.linalg.norm(p1 - p0)) / 1.25))
        for k in range(nn + 1):
            q = p0 + (p1 - p0) * k / nn
            ax.add_patch(Rectangle((q[0] - 0.0375, q[1] - 0.0375), 0.075, 0.075, fc='#5a3a17', ec='none', zorder=9))
    # escada, poço, amendoeira
    e_u1 = U(O.ESCADA_X0) + O.ESCADA_N * O.ESCADA_PISO
    if O.ESCADA_Y1 > v0 and O.ESCADA_Y0 < v1:
        ax.add_patch(Rectangle((U(O.ESCADA_X0), O.ESCADA_Y0), e_u1 - U(O.ESCADA_X0), O.ESCADA_Y1 - O.ESCADA_Y0, fc='#e2d5c3', ec='#555', lw=0.8, zorder=6))
        for i in range(1, O.ESCADA_N):
            uu = U(O.ESCADA_X0) + i * O.ESCADA_PISO
            ax.plot([uu, uu], [O.ESCADA_Y0, O.ESCADA_Y1], color='#777', lw=0.6, zorder=6)
        ax.text(e_u1 / 2, (O.ESCADA_Y0 + O.ESCADA_Y1) / 2, 'escada', ha='center', va='center', fontsize=8.5, zorder=7)
    ax.add_patch(Circle((U(O.POCO[0]), O.POCO[1]), O.POCO_R, fc='#d6d6d6', ec='k', lw=0.9, zorder=6))
    ax.text(U(O.POCO[0]), O.POCO[1], 'poço', ha='center', va='center', fontsize=9, zorder=7)
    ax.add_patch(Circle((U(O.POCO[0]), O.POCO[1]), O.POCO_R + 1.5, fc='none', ec=VERMELHO, lw=0.8, ls='--', zorder=5))
    at = (U(O.ARVORE[0]), O.ARVORE[1])
    ax.add_patch(Circle(at, O.ARVORE_RASO, fc='none', ec=MARROM, lw=0.9, ls=(0, (2, 2)), zorder=6))
    ax.add_patch(Circle(at, 0.30, fc='#6b4f2a', ec='k', lw=0.8, zorder=9))
    # canteiro e lago
    ax.add_patch(Polygon(np.c_[U(O.CANTEIRO[:, 0]), O.CANTEIRO[:, 1]], fc=VERDE, ec='#6aa35a', lw=0.8, ls='--', zorder=2))
    ax.add_patch(Polygon(np.c_[U(O.LAGO[:, 0]), O.LAGO[:, 1]], fc=AZUL, ec=CANO, lw=1.8, zorder=3))
    xs = np.linspace(O.LAGO[:, 0].min(), O.LAGO[:, 0].max(), 260); ys = np.linspace(O.LAGO[:, 1].min(), O.LAGO[:, 1].max(), 260)
    X, Y = np.meshgrid(xs, ys); D = O.dentro_lago(X, Y); P = np.where(D, O.prof_lago(X, Y), np.nan)
    ax.contourf(U(X), Y, P, levels=[O.PROF - 0.03, 2], colors=[AZUL_F], zorder=3)
    ax.contour(U(X), Y, P, levels=[O.PRAT_PROF + 0.005], colors=[CANO], linewidths=[0.6], linestyles=[':'], zorder=3)
    ax.contour(U(X), Y, P, levels=[O.ARVORE_PROF + 0.01], colors=[MARROM], linewidths=[0.7], linestyles=['--'], zorder=3)
    # cascata (laje de pedra)
    co = O.CASCATA['origem']; w2 = O.CASCATA['largura'] / 2 + 0.05
    u_tr = float(O.muro_frente(co[1], O.MURO_TOPO)) - 0.05
    ax.add_patch(Rectangle((u_tr, co[1] - w2), NUM['cascata_frente_u'] - u_tr, 2 * w2, fc='#9e9a92', ec='#333', lw=0.9, hatch='////', zorder=8))
    if canos:
        cf, sm = NUM['filtro'], NUM['sumidouro']; b = NUM['bomba']
        ax.plot([b[0], cf[0] - 0.25], [b[1], cf[1]], color=CANO, lw=1.2, ls=(0, (4, 2)), zorder=9)
        ax.plot([cf[0] - 0.25, 0.32, 0.20, 0.20], [cf[1] - 0.12, 0.18, 0.18, co[1] - 0.05], color=CANO, lw=1.2, ls=(0, (4, 2)), zorder=9)
        ax.plot([b[0]], [b[1]], marker='s', ms=6, color=CANO, zorder=10)
        lad = (NUM['u1'] - 0.12, 1.75)
        ax.plot([lad[0], sm[0] - 0.3], [lad[1], sm[1] + 0.12], color=LADRAO, lw=1.2, ls=(0, (1, 1.5)), zorder=9)
        ax.add_patch(Rectangle((cf[0] - 0.25, cf[1] - 0.20), 0.50, 0.40, fc='#e8e8e8', ec='#222', lw=0.9, zorder=10))
        ax.add_patch(Rectangle((sm[0] - 0.30, sm[1] - 0.30), 0.60, 0.60, fc='#e9e6df', ec=LADRAO, lw=0.9, hatch='..', ls='--', zorder=10))
        tu = NUM['tomada'][0]
        ax.plot([cf[0] + 0.25, min(tu, u_max)], [0.06, 0.06], color=LUZ, lw=1.2, ls=(0, (6, 2)), zorder=9)
        if tu <= u_max:
            ax.add_patch(Rectangle((tu - 0.08, 0.0), 0.16, 0.10, fc='#ffd54a', ec='#222', lw=0.9, zorder=10))


# =================================================================== folha 1 — planta de locação
def folha1():
    fig = folha(1, 'Planta de locação (vista de cima)',
                'Marcar o pé do muro de pedras (M1…M11) e a linha d\'água (P1…); ligar os pontos com mangueira deitada no chão, em curva suave.')
    ax = fig.add_axes([0.025, 0.105, 0.615, 0.87])
    ax.set_aspect('equal'); ax.axis('off')
    u_max = 8.6
    v_top = O.ESCADA_Y1 + 0.55
    base_planta(ax, u_max, 0.0, v_top)
    for u in range(0, int(u_max) + 1):
        ax.text(u, -0.42, br(u, 0) if u else '0', ha='center', va='top', fontsize=8, color='#777')
    for v in range(0, int(v_top) + 1):
        ax.text(u_max + 0.15, v, br(v, 0) if v else '0', ha='left', va='center', fontsize=8, color='#777')
    ax.text(u_max / 2, -0.78, 'distância a partir da beira da laje (m)', ha='center', va='top', fontsize=8.5, color='#555')
    ax.text(u_max + 0.65, v_top / 2, 'distância a partir do muro lateral do lado da amendoeira (m)', rotation=90, ha='center',
            va='center', fontsize=8.5, color='#555')
    ax.add_patch(Rectangle((-1.4, -0.18), u_max + 1.4, 0.18, fc='#888', ec='none', zorder=6))
    ax.text(-1.35, -0.24, 'muro lateral do lado da amendoeira (referência 2)', ha='left', va='top', fontsize=8.5, color='#333')
    ax.text(-1.0, 6.75, f'LAJE DA PISCINA  ·  piso +{br(A)}', rotation=90, ha='center', va='center', fontsize=11, color='#666')
    rotulo(ax, (0, v_top - 0.3), 'beira da laje\n(referência 1)', (-1.35, v_top + 0.3), fs=8.5, cor='#6b4a2b')
    rotulo(ax, (O.GUARDA_U, 1.32), f'guarda-corpo {br(O.GUARDA_H)} m\nno piso da laje,\n10 cm da beira', (-1.35, 1.0), fs=7.8, cor='#7a5326')
    cf, sm, tm = NUM['filtro'], NUM['sumidouro'], NUM['tomada']
    rotulo(ax, (cf[0], cf[1] + 0.2), 'caixa do filtro UV', (cf[0] - 0.4, -0.6), fs=7.8, ha='right')
    rotulo(ax, (sm[0], sm[1] + 0.3), 'sumidouro (debaixo do\nfuturo piso do pergolado)', (sm[0] + 0.05, 1.25), fs=7.8)
    ax.annotate('', xy=(u_max + 0.05, 0.06), xytext=(u_max - 0.5, 0.06), arrowprops=dict(arrowstyle='->', color=LUZ, lw=1.2), zorder=12)
    rotulo(ax, (u_max - 0.1, 0.07), f'eletroduto até a tomada com DR,\nno muro a {br(tm[0])} da beira →', (u_max - 0.05, 3.35), fs=7.8,
           cor='#7a5200', ha='right')
    rotulo(ax, (NUM['bomba'][0], NUM['bomba'][1]), 'bomba', (NUM['bomba'][0] + 0.25, 0.55), fs=7.8, cor=CANO)
    co = O.CASCATA['origem']
    rotulo(ax, (0.45, co[1] + 0.2), 'cascata\n(laje de pedra)', (1.35, co[1] + 0.95), fs=8.5)
    rotulo(ax, (0.30, 3.1), 'muro de pedras\nempilhadas', (-1.35, 3.95), fs=8.5)
    rotulo(ax, (U(O.ARVORE[0]) + 0.28, O.ARVORE[1] + 0.05), 'amendoeira: tronco na beira da laje;\nsem vala nem fundação perto dela',
           (2.05, 5.0), fs=8, cor=MARROM)
    rotulo(ax, (U(O.ARVORE[0]) + O.ARVORE_RASO * 0.71, O.ARVORE[1] - O.ARVORE_RASO * 0.71),
           f'raio de {br(O.ARVORE_RASO)} do tronco:\nlago raso (30 cm), cavar à mão', (2.2, 4.55), fs=7.8, cor=MARROM)
    rotulo(ax, (U(O.POCO[0]) + (O.POCO_R + 1.5) * 0.7, O.POCO[1] + (O.POCO_R + 1.5) * 0.7), '1,50 de folga do poço',
           (U(O.POCO[0]) + 1.75, O.POCO[1] + 1.35), fs=8, cor=VERMELHO)
    rotulo(ax, (7.2, 3.6), 'piso do pergolado do\ncineminha (futuro)', (7.0, 5.0), fs=7.8, cor='#8a6d45')
    rotulo(ax, (4.3, 4.0), 'canteiro em volta\n(plantas e casca)', (4.6, 4.75), fs=7.8, cor='#3d7a33')
    # piquetes
    pts, per = lago_pts_regulares(0.75)
    cc = np.array([U(O.C_LAGO[0]), O.C_LAGO[1]])
    for i, (x, y) in enumerate(pts):
        c = np.array([U(x), y]); dd = c - cc; dd /= np.linalg.norm(dd)
        ax.plot(*c, marker='o', ms=4.5, color=VERMELHO, zorder=12)
        ax.text(*(c - dd * 0.27), f'P{i + 1}', ha='center', va='center', fontsize=7.5, color=VERMELHO, fontweight='bold', zorder=12)
    mp = muro_pts()
    for i, (u, v) in enumerate(mp):
        ax.plot(u, v, marker='D', ms=4.2, color='#2c3e50', zorder=12)
        ax.text(u + 0.24, v - 0.05, f'M{i + 1}', ha='left', va='center', fontsize=7.3, color='#2c3e50', fontweight='bold', zorder=12,
                bbox=dict(fc='white', ec='none', pad=0.3, alpha=0.8))
    # medidas
    cota(ax, (NUM['u0'], 0.52), (NUM['u1'], 0.52), 0.0, g=0.13, fs=8, txt=f'lago: {br(NUM["u1"] - NUM["u0"])} de ponta a ponta')
    cota(ax, (6.45, 0.0), (6.45, NUM['v0']), 0.0, g=-0.16, tick=0.035, fs=7.5)
    cota(ax, (6.45, NUM['v0']), (6.45, NUM['v1']), 0.0, g=-0.16, tick=0.035, fs=7.5, txt=f'até {br(NUM["v1"])} do muro')
    e_u1 = U(O.ESCADA_X0) + O.ESCADA_N * O.ESCADA_PISO
    cota(ax, (e_u1, O.ESCADA_Y1 + 0.25), (0, O.ESCADA_Y1 + 0.25), 0.0, g=0.15)
    cota(ax, (e_u1, O.POCO[1]), (U(O.POCO[0]) - O.POCO_R, O.POCO[1]), 0.0, g=0.15, tick=0.035, fs=7.8)
    # linhas dos cortes
    for (p0, p1, nome) in (((-1.3, CORTE_A_V), (u_max - 0.1, CORTE_A_V), 'A'), ((CORTE_B_U, 0.05), (CORTE_B_U, v_top - 0.1), 'B'),
                           ((-1.3, CORTE_C_V), (1.65, CORTE_C_V), 'C')):
        ax.plot([p0[0], p1[0]], [p0[1], p1[1]], color='#333', lw=1.0, ls=(0, (8, 3, 2, 3)), zorder=11)
        for p in (p0, p1):
            ax.text(p[0], p[1], nome, ha='center', va='center', fontsize=10, fontweight='bold', zorder=13,
                    bbox=dict(boxstyle='circle,pad=0.25', fc='white', ec='#333', lw=1.0))
    ax.set_xlim(-1.5, u_max + 0.9); ax.set_ylim(-1.0, v_top + 0.65)

    # ---- quadro dos piquetes, legenda e números
    tx = fig.add_axes([0.655, 0.105, 0.33, 0.87]); tx.axis('off'); tx.set_xlim(0, 1); tx.set_ylim(0, 1)
    tx.text(0, 0.99, 'Piquetes', fontsize=11.5, fontweight='bold', va='top')
    tx.text(0, 0.965, 'a = da beira da laje (no esquadro)  ·  b = do muro lateral do lado da amendoeira', fontsize=8.2, va='top', color='#444')
    lin = 0.94; h = 0.0205
    cols = [('Linha d\'água do lago', [(f'P{i + 1}', U(p[0]), p[1]) for i, p in enumerate(pts)], VERMELHO),
            ('Pé do muro de pedras', [(f'M{i + 1}', u, v) for i, (u, v) in enumerate(mp)], '#2c3e50')]
    for col, (tit, linhas, cor) in enumerate(cols):
        x0 = col * 0.52
        tx.text(x0, lin, tit, fontsize=8.8, fontweight='bold', va='top', color=cor)
        tx.text(x0 + 0.02, lin - h, 'ponto', fontsize=8.2, fontweight='bold', va='top'); tx.text(x0 + 0.17, lin - h, 'a', fontsize=8.2, fontweight='bold', va='top')
        tx.text(x0 + 0.31, lin - h, 'b', fontsize=8.2, fontweight='bold', va='top')
        for j, (nome, a_, b_) in enumerate(linhas):
            yy = lin - h * (j + 2)
            tx.text(x0 + 0.02, yy, nome, fontsize=8.6, color=cor, fontweight='bold', va='top')
            tx.text(x0 + 0.17, yy, br(a_), fontsize=8.6, va='top'); tx.text(x0 + 0.31, yy, br(b_), fontsize=8.6, va='top')
    y_leg = lin - h * (max(len(pts), len(mp)) + 2) - 0.02
    tx.text(0, y_leg, 'Legenda', fontsize=11.5, fontweight='bold', va='top')
    itens = [(AZUL, CANO, '', 'água (linha cheia = linha d\'água, a borda da escavação)'),
             (AZUL_F, CANO, '', f'parte funda, {br(O.PROF)} m de água'),
             ('white', CANO, '', f'pontilhado azul: fim da prateleira de plantas ({round(O.PRAT_PROF * 100)} cm de água)'),
             ('white', MARROM, '', f'tracejado marrom: perto da amendoeira, só {round(O.ARVORE_PROF * 100)} cm de água'),
             (VERDE, '#6aa35a', '', 'canteiro de plantas em volta do lago'),
             (PEDRA, '#555', 'oo', 'muro de pedras empilhadas (do pé no chão até o topo)'),
             ('#9e9a92', '#333', '////', 'laje de pedra da cascata'),
             ('white', CANO, '', 'tracejado azul: cano da bomba ao filtro e à cascata'),
             ('white', LADRAO, '', 'pontilhado marrom: ladrão até o sumidouro'),
             ('white', LUZ, '', 'tracejado laranja: eletroduto até a tomada')]
    for k, (fc, ec, hh, t) in enumerate(itens):
        yy = y_leg - 0.035 - 0.026 * k
        tx.add_patch(Rectangle((0.0, yy - 0.010), 0.06, 0.019, fc=fc, ec=ec, hatch=hh, lw=0.9))
        tx.text(0.08, yy, t, fontsize=8.4, va='center')
    yy = y_leg - 0.035 - 0.026 * len(itens) - 0.012
    tx.text(0, yy, 'Números do lago', fontsize=11.5, fontweight='bold', va='top')
    litros = f'{int(round(NUM["volume"] * 1000, -2)):,}'.replace(',', '.')
    txt = (f'água: {br(NUM["area"], 1)} m²  ·  contorno {br(NUM["perimetro"], 1)} m  ·  uns {litros} litros\n'
           f'parte funda ({br(O.PROF)} m): {br(NUM["fundo_area"], 1)} m²  ·  nível da água 6 cm abaixo do chão\n'
           f'folgas: {br(NUM["folga_poco"])} da boca do poço · {br(NUM["folga_tronco"])} do centro do tronco\n'
           f'muro de pedras: {br(NUM["muro_pe_comprimento"], 1)} m de pé, {br(TOPO)} de altura\n'
           f'cascata: lâmina de {round(O.CASCATA["largura"] * 100)} cm, de {br(NUM["cascata_v0"])} a {br(NUM["cascata_v1"])} do muro, '
           f'topo +{br(NUM["cascata_topo"])}')
    tx.text(0, yy - 0.03, txt, fontsize=8.6, va='top', linespacing=1.45)
    tx.text(0, 0.0, 'CONFERIR ANTES DE MARCAR: a distância do muro da amendoeira até o centro\ndo tronco (projeto 5,20; trena deu 5,04; '
            'pelas fotos parece 3 a 4 m),\no diâmetro e o centro do poço. Se mudar, o desenho é refeito antes de cavar.',
            fontsize=8.4, color=VERMELHO, va='bottom', fontweight='bold')
    return fig


# =================================================================== cortes
def perfil_lago(xs, ys):
    zA = O.ZAGUA - O.LOW; D = O.dentro_lago(xs, ys); P = np.where(D, O.prof_lago(xs, ys), 0.0)
    return D, np.where(D, zA - P, 0.0)


def desenha_agua(ax, s, D, z_fundo, base=-1.5):
    zA = O.ZAGUA - O.LOW
    if not D.any():
        return
    ax.fill_between(s, np.where(D, z_fundo - 0.06, np.nan), np.where(D, z_fundo, np.nan), color='#efe3c2', zorder=3, lw=0)
    ax.plot(s, np.where(D, z_fundo, np.nan), color='#111', lw=2.0, zorder=5)
    ax.fill_between(s, np.where(D, z_fundo, np.nan), np.where(D, zA, np.nan), color=AZUL, zorder=4, lw=0)
    ax.plot(s, np.where(D, zA, np.nan), color=CANO, lw=1.0, zorder=5)
    idx = np.nonzero(np.diff(D.astype(int)))[0]
    for i in idx:
        sc = (s[i] + s[i + 1]) / 2
        ax.add_patch(Ellipse((sc + (0.08 if D[i + 1] else -0.08), 0.03), 0.38, 0.22, fc=PEDRA, ec='#555', lw=0.8, zorder=7))


def chao(ax, s, z_top, base=-1.5):
    ax.fill_between(s, base, z_top, color=TERRA, zorder=1, lw=0)
    ax.fill_between(s, base, z_top, facecolor='none', hatch='..', edgecolor='#b59f7c', zorder=1, lw=0)


def muro_pedras_corte(ax, v, cascata=False, rng_seed=5, s0=0.0):
    """Muro de pedras empilhadas num corte em u (distância da beira da laje), na posição v. Retorna a linha de trás."""
    rng = np.random.default_rng(rng_seed)
    pe = float(O.muro_pe(v)); barriga = pe >= 0.6
    zs = np.linspace(0, TOPO, 60)
    frente = np.array([float(O.muro_frente(v, z + O.LOW)) for z in zs])
    tras = np.maximum(0.03, frente - 0.32) if not barriga else np.full_like(frente, 0.03)
    # barranco (terra) atrás das pedras e por baixo da laje
    ax.add_patch(Polygon(np.r_[[(s0 - 3.4, -1.5), (s0 - 3.4, A - 0.12), (s0, A - 0.12)], np.c_[s0 + tras, zs][::-1], [(s0 + tras[0], -1.5)]],
                         fc=TERRA, ec='none', hatch='..', zorder=1))
    if not barriga:                                       # brita + bidim atrás das pedras
        ax.add_patch(Polygon(np.r_[np.c_[s0 + tras, zs], np.c_[s0 + tras - 0.10, zs][::-1]], fc='#d9d6cf', ec='none', hatch='oo', zorder=2))
        ax.plot(s0 + tras - 0.10, zs, color='#2e7d32', lw=1.4, zorder=3)
    if cascata:                                           # manta do lago subindo pelo barranco atrás das pedras
        zc = NUM['cascata_topo']
        m = zs <= zc - 0.07
        ax.plot(s0 + tras[m] - 0.01, zs[m], color='#111', lw=2.0, zorder=6)
    # pedras em fiadas
    z = -0.12
    while z < TOPO - 0.06:
        hh = min(rng.uniform(0.20, 0.27), TOPO + 0.02 - z)
        zc_ = z + hh / 2
        f = float(np.interp(zc_, zs, frente)); t = float(np.interp(zc_, zs, tras))
        u = f
        while u - t > 0.08:
            w = min(rng.uniform(0.24, 0.34), u - t + 0.04)
            ax.add_patch(Ellipse((s0 + u - w / 2, zc_), w, hh * 0.96, fc=PEDRA_COR[int(rng.integers(len(PEDRA_COR)))], ec='#555',
                                 lw=0.7, zorder=7))
            u -= w * 0.92
            if not barriga:
                break
        z += hh * 0.9
    # topo: terra com plantas
    ax.add_patch(Rectangle((s0, TOPO - 0.02), float(frente[-1]) - 0.02, 0.05, fc='#5b4a33', ec='none', zorder=8))
    return frente, tras, zs


PEDRA_COR = PEDRAS_COR


def laje_e_guarda(ax, s0=0.0, s_min=-3.4, gu=None):
    ax.add_patch(Rectangle((s_min, A - 0.12), s0 - s_min, 0.12, fc='#cfcfcf', ec='#555', lw=0.8, hatch='////', zorder=5))
    gx = s0 + (O.GUARDA_U if gu is None else gu)
    ax.add_patch(Rectangle((gx - 0.0375, A), 0.075, O.GUARDA_H, fc=MADEIRA, ec='#5a3a17', lw=0.7, zorder=8))
    ax.add_patch(Rectangle((gx - 0.06, A + O.GUARDA_H - 0.045), 0.12, 0.045, fc='#a37b46', ec='#5a3a17', lw=0.7, zorder=8))
    ax.add_patch(Rectangle((gx - 0.09, A), 0.15, 0.012, fc='#666', ec='#333', lw=0.6, zorder=9))       # chapa de base
    for dx in (-0.06, 0.04):
        ax.plot([gx + dx, gx + dx], [A - 0.09, A + 0.012], color='#333', lw=1.1, zorder=9)                # chumbador químico


def cascata_corte(ax, v, s0=0.0):
    zc = NUM['cascata_topo']; zA = O.ZAGUA - O.LOW
    f = float(O.muro_frente(v, zc + O.LOW)); ponta = f + NUM['cascata_avanco']
    ax.add_patch(Rectangle((s0 + f - 0.22, zc - 0.07), ponta - f + 0.22, 0.07, fc='#9e9a92', ec='#333', lw=0.9, zorder=9))
    ax.add_patch(Ellipse((s0 + f - 0.02, zc + 0.10), 0.40, 0.17, fc='#9a958c', ec='#333', lw=0.8, zorder=9))       # pedra de cima
    t = np.linspace(0, 1, 14)
    ax.plot(s0 + ponta + 0.02 + 0.10 * t, zc - (zc - zA) * t * t, color='#5aa0cf', lw=2.6, alpha=0.85, zorder=10)
    ax.plot([s0 + 0.05, s0 + 0.05, s0 + f - 0.12], [0.12, zc + 0.03, zc + 0.03], color=CANO, lw=2.2, zorder=9)  # cano
    return f, ponta


CORTE_A_V = round(O.CASCATA['origem'][1], 2)      # corte A–A: do alto da laje, pela cascata e pelo comprido do lago
CORTE_B_U = 3.00                                  # corte B–B: do muro lateral da amendoeira até o poço, pela parte funda
CORTE_C_V = O.ARVORE[1]                           # corte C–C: pelo tronco da amendoeira


def folha2():
    fig = folha(2, 'Cortes do laguinho',
                'A–A passa pela cascata e pelo comprido do lago; B–B vai do muro lateral da amendoeira até o poço. Mesma escala, sem exagero.')
    zA = O.ZAGUA - O.LOW
    # ---- corte A–A
    ax = fig.add_axes([0.035, 0.535, 0.93, 0.42]); ax.set_aspect('equal')
    u = np.linspace(-2.6, NUM['u1'] + 0.9, 1800); x = u + O.EDGE; y = np.full_like(x, CORTE_A_V)
    D, zf = perfil_lago(x, y)
    pe = float(O.muro_pe(CORTE_A_V))
    chao(ax, u[u > 0.0], np.where(D, zf, 0.0)[u > 0.0])
    frente, tras, zs = muro_pedras_corte(ax, CORTE_A_V, cascata=True, rng_seed=11)
    laje_e_guarda(ax, 0.0, -2.6)
    desenha_agua(ax, u, D, zf)
    f, ponta = cascata_corte(ax, CORTE_A_V)
    ud = u[D]
    # manta do lago: do fundo sobe pela borda e, no trecho da cascata, segue atrás das pedras até a laje
    ax.plot([ud[0] - 0.06, pe - 0.02], [0.0, -0.02], color='#111', lw=2.0, zorder=6)
    nv(ax, -2.35, A, f'+{br(A)} piso da laje')
    nv(ax, u[-1] - 0.75, 0.0, '0,00 chão')
    nv(ax, ud[-1] - 0.35, zA, f'{br(zA)} água', lado=-1)
    k = int(np.argmin(zf)); nv(ax, u[k], zf[k], f'{br(zf[k])} fundo ({br(zA - zf[k])} de água)')
    nv(ax, ponta + 0.32, NUM['cascata_topo'], f'+{br(NUM["cascata_topo"])} laje da cascata', fs=8)
    cota(ax, (0, -0.32), (pe, -0.32), 0.0, g=-0.12, tick=0.035, fs=7.8)
    cota(ax, (pe, -0.32), (ud[0], -0.32), 0.0, g=-0.12, tick=0.035, fs=7.8)
    cota(ax, (f, NUM['cascata_topo'] + 0.32), (ponta, NUM['cascata_topo'] + 0.32), 0.0, g=0.11, tick=0.035, fs=7.8)
    rotulo(ax, (O.GUARDA_U, A + 0.8), 'guarda-corpo de madeira no piso da laje,\nchapa e chumbador químico (engenheiro confere)',
           (-0.9, A + 1.0), fs=8, ha='right')
    rotulo(ax, (0.35, 0.45), 'muro de pedras arredondadas empilhadas,\ninclinado (o topo fica 35 a 40 cm para trás)', (-0.9, 0.42), fs=8, ha='right')
    rotulo(ax, (0.02, 0.15), 'manta do lago sobe pelo barranco atrás\ndas pedras até a laje (só no trecho da cascata)', (-0.9, -0.15), fs=8, ha='right')
    rotulo(ax, (0.05, 0.6), 'cano da cascata atrás das pedras', (-0.9, 0.75), fs=8, ha='right', cor=CANO)
    rotulo(ax, (ponta - 0.15, NUM['cascata_topo'] - 0.04), 'laje de pedra da cascata (60 cm de largura),\nembutida 20 cm no muro, 1 cm de caimento',
           (1.5, A + 0.75), fs=8)
    rotulo(ax, (2.6, zf[int(np.searchsorted(u, 2.6))] - 0.02), 'manta EPDM sobre manta de proteção e 5 cm de areia\n(cavar 12 cm a mais que a água)',
           (2.9, -1.2), fs=8)
    ax.set_xlim(u[0], u[-1]); ax.set_ylim(-1.45, A + O.GUARDA_H + 0.28)
    ax.set_yticks([]); ax.tick_params(labelsize=8)
    ax.set_xlabel('distância a partir da beira da laje (m)', fontsize=8.5, color='#555')
    ax.set_title(f'Corte A–A (pela cascata, a {br(CORTE_A_V)} do muro da amendoeira)', fontsize=12, fontweight='bold', loc='left')
    for sp in ('top', 'right', 'left'):
        ax.spines[sp].set_visible(False)
    # ---- corte B–B
    ax = fig.add_axes([0.035, 0.11, 0.93, 0.37]); ax.set_aspect('equal')
    v_fim = O.POCO[1] + O.POCO_R + 0.6
    v = np.linspace(-0.15, v_fim, 1500); x = np.full_like(v, O.EDGE + CORTE_B_U)
    D, zf = perfil_lago(x, v)
    chao(ax, v, np.where(D, zf, 0.0))
    desenha_agua(ax, v, D, zf)
    ax.add_patch(Rectangle((-0.15, 0), 0.15, 2.0, fc='#999', ec='#555', lw=0.6, zorder=5))
    ax.text(-0.07, 2.05, 'muro', ha='center', va='bottom', fontsize=8)
    pc = float(np.sqrt(max(0.0, O.POCO_R ** 2 - (CORTE_B_U - U(O.POCO[0])) ** 2)))
    ax.add_patch(Rectangle((O.POCO[1] - pc, 0), 2 * pc, 0.45, fc='#ddd', ec='#555', lw=0.8, zorder=5))
    ax.text(O.POCO[1], 0.22, 'poço', ha='center', va='center', fontsize=8, zorder=6)
    vd = v[D]
    cota(ax, (vd[0], zA + 0.02), (vd[-1], zA + 0.02), 0.45, g=0.10, tick=0.04, txt=f'água: {br(vd[-1] - vd[0])}')
    cota(ax, (0, 0.1), (vd[0], 0.1), 0.0, g=0.12, tick=0.035, fs=7.8)
    cota(ax, (vd[-1], 0.1), (O.POCO[1] - pc, 0.1), 0.0, g=0.12, tick=0.035, fs=7.8, txt=f'{br(O.POCO[1] - pc - vd[-1])} até o poço')
    k = int(np.argmin(zf))
    nv(ax, v[k] + 0.25, zf[k], f'{br(zf[k])} fundo ({br(zA - zf[k])} de água)')
    nv(ax, vd[0] + 0.2, zA, f'{br(zA)} água')
    j0 = np.nonzero(D)[0][0]
    s1 = v[j0] + O.BEIRA; s2 = v[j0] + O.PRAT_FIM; s3 = v[j0] + O.PAREDE_FIM
    nv(ax, (s1 + s2) / 2, zA - O.PRAT_PROF, f'{br(zA - O.PRAT_PROF)} prateleira', lado=-1, fs=7.8)
    rotulo(ax, (v[j0] + 0.06, zA - 0.12), f'beira de {round(O.BEIRA * 100)} cm para as pedras', (vd[0] - 0.5, -0.5), fs=7.8, ha='right')
    rotulo(ax, ((s1 + s2) / 2, zA - O.PRAT_PROF - 0.02), f'prateleira de plantas: {round((O.PRAT_FIM - O.BEIRA) * 100)} cm',
           (vd[0] - 0.5, -0.85), fs=7.8, ha='right')
    rotulo(ax, ((s2 + s3) / 2, zA - (O.PRAT_PROF + O.PROF) / 2), f'talude: {round((O.PAREDE_FIM - O.PRAT_FIM) * 100)} cm',
           (vd[0] - 0.5, -1.2), fs=7.8, ha='right')
    ax.set_xlim(-2.3, v_fim + 0.2); ax.set_ylim(-1.5, 2.4)
    ax.set_yticks([]); ax.tick_params(labelsize=8)
    ax.set_xlabel('distância a partir do muro lateral do lado da amendoeira (m)', fontsize=8.5, color='#555')
    ax.set_title(f'Corte B–B (a {br(CORTE_B_U)} da beira da laje)', fontsize=12, fontweight='bold', loc='left')
    for sp in ('top', 'right', 'left'):
        ax.spines[sp].set_visible(False)
    return fig


# =================================================================== folha 3 — detalhes
def folha3():
    fig = folha(3, 'Detalhes: muro de pedras, amendoeira, cascata e guarda-corpo',
                'Desenho de referência. A fixação do guarda-corpo e o miolo do muro (pedra seca ou com argamassa) o engenheiro confere.')
    # ---- corte típico do muro (trecho reto)
    ax = fig.add_axes([0.02, 0.50, 0.30, 0.46]); ax.set_aspect('equal'); ax.axis('off')
    v = 1.0
    chao(ax, np.array([0.0, 1.75]), np.array([0.0, 0.0]))
    frente, tras, zs = muro_pedras_corte(ax, v, rng_seed=3)
    laje_e_guarda(ax, 0.0, -1.1)
    ax.add_patch(Rectangle((float(frente[0]) - 0.36, -0.15), 0.40, 0.08, fc='#dcdcd4', ec='#888', lw=0.6, hatch='..', zorder=6))
    pe = float(O.muro_pe(v)); tp = float(frente[-1])
    cota(ax, (1.6, 0), (1.6, TOPO), 0.0, g=-0.14, tick=0.035, fs=8)
    cota(ax, (0, -0.30), (pe, -0.30), 0.0, g=-0.11, tick=0.03, fs=7.8, txt=f'{br(pe)} pé')
    cota(ax, (0, TOPO + 0.18), (tp, TOPO + 0.18), 0.0, g=0.10, tick=0.03, fs=7.8, txt=br(tp))
    rotulo(ax, (pe - 0.12, 0.12), 'pedras arredondadas\nde 25 a 50 cm, as maiores\nembaixo, encaixadas', (0.68, 0.62), fs=8)
    rotulo(ax, (pe - 0.3, -0.11), 'primeira fiada 10 a 15 cm enterrada,\nnum berço de concreto magro\n(só fora da zona das raízes)', (0.55, -0.62), fs=8)
    rotulo(ax, (float(tras[20]) - 0.05, float(zs[20])), 'brita 1 (10 cm) e manta\nbidim contra o barranco', (-1.05, 0.25), fs=8)
    rotulo(ax, (0.06, TOPO + 0.01), f'terra e plantas no topo,\n{round((A - TOPO) * 100)} cm abaixo do piso', (-1.05, A + 0.45), fs=8)
    rotulo(ax, (O.GUARDA_U, A + 0.5), 'poste do guarda-corpo\n10 cm antes da beira', (0.35, A + 0.9), fs=8)
    ax.text(0.1, A + O.GUARDA_H + 0.25, 'Muro de pedras (trecho reto)', ha='center', fontsize=12, fontweight='bold')
    ax.set_xlim(-1.15, 1.8); ax.set_ylim(-0.8, A + O.GUARDA_H + 0.4)
    # ---- corte C–C pela amendoeira
    ax = fig.add_axes([0.335, 0.50, 0.33, 0.46]); ax.set_aspect('equal'); ax.axis('off')
    v = CORTE_C_V
    chao(ax, np.array([0.0, 2.2]), np.array([0.0, 0.0]))
    frente, tras, zs = muro_pedras_corte(ax, v, rng_seed=9)
    laje_e_guarda(ax, 0.0, -1.2, gu=NUM['guarda_desvio_u'])
    tx_ = U(O.ARVORE[0])
    ax.add_patch(Rectangle((tx_ - 0.30, A), 0.60, 1.25, fc='#7b5a35', ec='#4d371d', lw=0.9, zorder=9))
    rng = np.random.default_rng(4)
    for ang, comp in ((-0.35, 1.2), (-0.7, 0.95), (-1.05, 0.8), (-0.15, 1.6), (-0.5, 1.9)):
        p0 = np.array([tx_ + 0.15, A - 0.05]); d = np.array([math.cos(ang), math.sin(ang)])
        pts = [p0 + d * comp * t + np.array([0, -0.04 * math.sin(6 * t)]) for t in np.linspace(0, 1, 12)]
        ax.plot([p[0] for p in pts], [p[1] for p in pts], color='#7b5a35', lw=3.2 - 1.6 * comp / 1.9, alpha=0.9, zorder=8)
    pe = float(O.muro_pe(v))
    cota(ax, (0, -0.30), (pe, -0.30), 0.0, g=-0.11, tick=0.03, fs=7.8, txt=f'{br(pe)} na frente do tronco')
    rotulo(ax, (tx_, A + 0.9), 'amendoeira (tronco na beira da laje)', (0.55, A + 1.15), fs=8)
    rotulo(ax, (NUM['guarda_desvio_u'], A + 0.6), f'guarda-corpo contorna o tronco,\na {br(-NUM["guarda_desvio_u"])} da beira', (-1.15, A + 0.95), fs=8)
    rotulo(ax, (0.85, 0.35), 'pedras assentadas no barranco, sem\nvala e sem fundação; desviar das raízes', (1.0, 0.85), fs=8)
    rotulo(ax, (0.9, -0.12), 'raiz de mais de 5 cm não se corta;\nfina (até 3 cm), serrote limpo', (1.0, -0.55), fs=8, cor=MARROM)
    rotulo(ax, (pe + 0.25, 0.02), f'lago só raso a menos de\n{br(O.ARVORE_RASO)} do tronco; cavar à mão', (1.45, 0.35), fs=8, cor=MARROM)
    ax.text(0.5, A + O.GUARDA_H + 0.45, f'Corte C–C: muro na amendoeira (a {br(CORTE_C_V)} do muro)', ha='center', fontsize=12, fontweight='bold')
    ax.set_xlim(-1.25, 2.25); ax.set_ylim(-0.8, A + O.GUARDA_H + 0.6)
    # ---- cascata de perto (corte)
    ax = fig.add_axes([0.675, 0.50, 0.31, 0.46]); ax.set_aspect('equal'); ax.axis('off')
    v = CORTE_A_V; zA = O.ZAGUA - O.LOW
    s = np.linspace(0.0, 1.7, 300); xs = s + O.EDGE; ys = np.full_like(xs, v)
    D, zf = perfil_lago(xs, ys)
    chao(ax, s, np.where(D, zf, 0.0))
    frente, tras, zs = muro_pedras_corte(ax, v, cascata=True, rng_seed=21)
    laje_e_guarda(ax, 0.0, -0.7)
    desenha_agua(ax, s, D, zf)
    f, ponta = cascata_corte(ax, v)
    ax.plot([s[D][0] - 0.06, float(frente[0]) - 0.02], [0.0, -0.02], color='#111', lw=2.0, zorder=6)
    cota(ax, (f, NUM['cascata_topo'] + 0.30), (ponta, NUM['cascata_topo'] + 0.30), 0.0, g=0.10, tick=0.03, fs=7.8,
         txt=f'{br(NUM["cascata_avanco"])} para fora')
    cota(ax, (1.5, 0), (1.5, NUM['cascata_topo']), 0.0, g=-0.13, tick=0.03, fs=7.8)
    rotulo(ax, (f - 0.05, NUM['cascata_topo'] + 0.12), 'pedra por cima da laje,\nencaixada no muro', (-0.65, A + 0.55), fs=8)
    rotulo(ax, (0.05, 0.5), 'cano de 50 mm atrás\ndas pedras', (-0.65, 0.55), fs=8, cor=CANO)
    rotulo(ax, (float(tras[10]) - 0.01, float(zs[10])), 'manta do lago sobe atrás\ndas pedras (com bidim por\ncima) até embaixo da laje', (-0.65, -0.1), fs=8)
    rotulo(ax, (ponta - 0.1, NUM['cascata_topo'] - 0.035), 'laje 60 × 60, 5 a 8 cm,\n20 cm dentro do muro', (0.75, A + 0.45), fs=8)
    rotulo(ax, (ponta + 0.08, 0.35), f'lâmina de {round(O.CASCATA["largura"] * 100)} cm', (1.0, 0.55), fs=8, cor=CANO)
    ax.text(0.45, A + O.GUARDA_H + 0.3, 'Cascata (corte)', ha='center', fontsize=12, fontweight='bold')
    ax.set_xlim(-0.7, 1.7); ax.set_ylim(-0.7, A + O.GUARDA_H + 0.45)
    # ---- guarda-corpo em vista
    ax = fig.add_axes([0.02, 0.115, 0.42, 0.33]); ax.set_aspect('equal'); ax.axis('off')
    vao = NUM['guarda_vao_postes']; L_ = 2 * vao
    ax.add_patch(Rectangle((0, -0.1), L_, 0.1, fc='#cfcfcf', ec='#555', lw=0.8, hatch='////'))
    for xx in (0.0, vao, L_):
        ax.add_patch(Rectangle((xx - 0.0375, 0), 0.075, O.GUARDA_H, fc=MADEIRA, ec='#5a3a17', lw=0.7))
        ax.add_patch(Rectangle((xx - 0.09, 0), 0.18, 0.012, fc='#666', ec='#333', lw=0.6))
    ax.add_patch(Rectangle((-0.05, O.GUARDA_H - 0.045), L_ + 0.1, 0.045, fc='#a37b46', ec='#5a3a17', lw=0.7))
    for zz in (0.1, O.GUARDA_H - 0.1):
        ax.add_patch(Rectangle((0, zz - 0.025), L_, 0.05, fc=MADEIRA, ec='#5a3a17', lw=0.5))
    m = round(vao / NUM['guarda_espaco'])
    for seg0 in (0.0, vao):
        for i in range(1, m):
            c = seg0 + vao * i / m
            ax.add_patch(Rectangle((c - 0.014, 0.125), 0.028, O.GUARDA_H - 0.25, fc='#ddc39a', ec='#5a3a17', lw=0.4))
    cota(ax, (L_ + 0.22, 0), (L_ + 0.22, O.GUARDA_H), 0.0, g=-0.13, tick=0.035)
    cota(ax, (0, -0.25), (vao, -0.25), 0.0, g=-0.1, tick=0.03, fs=8, txt=f'postes a cada {br(vao)}')
    rotulo(ax, (0.55, 0.6), f'balaústres 2,8 × 2,8 a cada {br(NUM["guarda_espaco"] * 100, 1)} cm\n(vão de {br((NUM["guarda_espaco"] - 0.028) * 100, 1)} cm: criança não passa)',
           (0.15, O.GUARDA_H + 0.3), fs=8.5)
    rotulo(ax, (vao, 0.006), 'poste 7,5 × 7,5 com chapa de base no piso da laje,\n4 chumbadores químicos (engenheiro confere a beira)', (0.9, -0.55), fs=8.5)
    ax.text(L_ / 2, O.GUARDA_H + 0.62, f'Guarda-corpo em vista ({NUM["guarda_postes"]} postes em {br(NUM["guarda_comp"], 1)} m)', ha='center',
            fontsize=12, fontweight='bold')
    ax.set_xlim(-0.3, L_ + 0.6); ax.set_ylim(-0.85, O.GUARDA_H + 0.8)
    # ---- notas
    tx = fig.add_axes([0.47, 0.115, 0.51, 0.34]); tx.axis('off')
    sm, cf, tm = NUM['sumidouro'], NUM['filtro'], NUM['tomada']
    notas = ['Bomba, filtro e elétrica',
             '• Bomba submersa de lago que entregue uns 7.000 a 9.500 L/h a 2,5 m de altura total (curva do fabricante),',
             '  com registro para regular a lâmina. Fica na parte funda, perto da ponta do lago, em cima de dois tijolos.',
             f'• Filtro pressurizado com UV de 18 a 24 W (lago de uns {int(round(NUM["volume"], 0))} mil litros), numa caixa de 50 × 40 cm',
             f'  com tampa, a {br(cf[0])} da beira e {br(cf[1])} do muro. Cano de 50 mm até a cascata, atrás das pedras.',
             f'• Ladrão de 50 mm por cima da manta até o sumidouro (60 × 60, 1,5 m de fundo, brita e bidim), a {br(sm[0])} da beira,',
             f'  debaixo do futuro piso do pergolado e a {br(NUM["sumidouro_poco"], 1)} m do poço. Só água de chuva e do lago.',
             f'• Tomada externa IP65 com DR de 30 mA no muro lateral, a {br(tm[0])} da beira ({br(NUM["tomada_agua"], 1)} m da água;',
             '  o mínimo é 2 m), logo depois da tela do cineminha. Eletroduto enterrado junto ao muro até a caixa do filtro.',
             '',
             'Ordem da obra (resumo; o passo a passo está na ficha)',
             '1. Conferir as medidas, marcar as referências no muro lateral, guarda-corpo definitivo no piso da laje.',
             '2. Piquetes; muro de pedras, menos o trecho da cascata (1,65 a 2,85 do muro); à mão perto da árvore.',
             '3. Escavação do lago em degraus, valas, caixa do filtro, sumidouro e eletroduto.',
             '4. Areia, bidim e manta (sobe atrás das pedras na cascata); trecho da cascata do muro, laje e cano.',
             '5. Ladrão, encher, pedras da borda, bomba, filtro e tomada; plantas; peixes depois de 2 semanas.']
    for k, t in enumerate(notas):
        bold = t.startswith(('Bomba, filtro', 'Ordem da obra'))
        tx.text(0, 1 - k * 0.064, t, fontsize=11.5 if bold else 8.9, fontweight='bold' if bold else 'normal', va='top', transform=tx.transAxes)
    return fig


if __name__ == '__main__':
    figs = [('folha1-locacao', folha1()), ('folha2-cortes', folha2()), ('folha3-detalhes', folha3())]
    with PdfPages(os.path.join(SAIDA, 'laguinho.pdf')) as pdf:
        for nome, f in figs:
            f.savefig(os.path.join(SAIDA, nome + '.png'), dpi=150)
            pdf.savefig(f)
            print('ok', nome)
