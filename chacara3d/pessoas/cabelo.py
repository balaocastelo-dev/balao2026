"""Cabelos (casca opaca com relevo de mechas), boné e chapéu de palha.

O couro cabeludo é recortado na linha do cabelo (definida em ângulos em volta do
centro do crânio), subdividido e afastado da pele com relevo de mechas. Cabelo longo,
rabo de cavalo e coque são malhas a mais, presas à cabeça (o comprido vai passando o
peso para o pescoço e o peito, para cair nas costas).
"""
import numpy as np

import malha as M
import ossos as O
import roupas as R
from roupas import CABELO, ACESS, norm_linhas

I = O.INDICE


# ---------------------------------------------------------------------------
# ruído suave 3D (valor, interpolação cúbica) para o relevo
# ---------------------------------------------------------------------------
def _hash(i, j, k, s):
    h = (i * 374761393 + j * 668265263 + k * 2147483647 + s * 1274126177) & 0xFFFFFFFF
    h = ((h ^ (h >> 13)) * 1274126177) & 0xFFFFFFFF
    return (h & 0xFFFF) / 65535.0


def ruido3(P, escala, semente=0):
    Q = np.asarray(P) / escala
    i0 = np.floor(Q).astype(np.int64)
    f = Q - i0
    w = f * f * (3 - 2 * f)
    out = np.zeros(len(Q))
    for dx in (0, 1):
        for dy in (0, 1):
            for dz in (0, 1):
                h = _hash(i0[:, 0] + dx, i0[:, 1] + dy, i0[:, 2] + dz, semente)
                wx = w[:, 0] if dx else 1 - w[:, 0]
                wy = w[:, 1] if dy else 1 - w[:, 1]
                wz = w[:, 2] if dz else 1 - w[:, 2]
                out += h * wx * wy * wz
    return out * 2 - 1


class Cabeca:
    """Medidas da cabeça para cabelos e chapéus."""

    def __init__(self, base):
        self.b = base
        k = base.k
        V, W = base.Vfino, base.Wfino
        olhos = base.marcos['olhos']
        cab = W[:, I['cabeca']] > 0.9
        H = V[cab & (V[:, 1] > olhos[1])]
        self.topo = H[:, 1].max()
        self.C = np.array([0.0, 0.5 * (self.topo + olhos[1]) - 0.005 * k, 0.5 * (H[:, 2].max() + H[:, 2].min()) - 0.012 * k])
        Hc = V[cab]
        i = np.argmax(Hc[:, 0])
        self.orelha = Hc[i] * np.array([1, 1, 1])
        self.olhos = olhos
        self.k = k

    def angulos(self, P):
        d = norm_linhas(np.asarray(P) - self.C)
        el = np.degrees(np.arcsin(np.clip(d[:, 1], -1, 1)))
        az = np.degrees(np.arctan2(d[:, 0], d[:, 2]))
        return el, az

    def linha(self, az, tabela):
        """Elevação limite da linha do cabelo por azimute (tabela [(|az|, el)])."""
        a = np.abs(az)
        xs = [t[0] for t in tabela]
        ys = [t[1] for t in tabela]
        return np.interp(a, xs, ys)


# linhas do cabelo (|azimute| em graus a partir da frente, elevação mínima)
LINHA_CURTA = [(0, 24), (25, 22), (45, 10), (62, 0), (72, -6), (80, -10), (92, -4), (110, -22), (140, -45), (180, -58)]
LINHA_LONGA = [(0, 31), (25, 28), (45, 16), (62, 3), (72, -8), (80, -12), (92, -6), (110, -26), (140, -48), (180, -60)]
LINHA_BONE = [(0, 22), (40, 16), (75, 2), (95, -2), (130, -16), (180, -26)]
LINHA_CHAPEU = [(0, 12), (40, 10), (75, 6), (95, 5), (130, 2), (180, 0)]


def f_cabelo(cb, P, W, tabela, folga_orelha=0.03):
    el, az = cb.angulos(P)
    f = (el - cb.linha(az, tabela)) * 0.0015       # graus -> ~metros na cabeça
    # não cobre as orelhas
    s = np.sign(P[:, 0])
    oc = cb.orelha * np.array([1, 1, 1])
    centro = np.stack([s * oc[0], np.full(len(P), oc[1] + 0.004), np.full(len(P), oc[2])], axis=1)
    d = np.linalg.norm(P - centro, axis=1) - folga_orelha * cb.k
    f = np.minimum(f, d)
    cab = cb.b.peso(W, ['cabeca', 'pescoco'])
    return np.minimum(f, (cab - 0.5) * 0.3)


def casca_cabelo(base, cb, pedaco, espessura, relevo=0.0025, escala_relevo=0.018, cachos=0.0, subdiv=1, semente=1):
    """Casca do cabelo: subdivide, afasta, alisa e põe relevo de mechas."""
    m = pedaco.copia()
    for _ in range(subdiv):
        m = R.subdividir(m)
    N = m.normais()
    el, az = cb.angulos(m.V)
    t = espessura(el, az) if callable(espessura) else np.full(m.n, espessura)
    # afina perto da linha do cabelo (sem degrau na testa e na nuca)
    bd = np.zeros(m.n)
    for laco in m.bordas():
        bd[laco] = 1.0
    bd = m.suavizar_campo(bd, iteracoes=4, alfa=0.6)
    t = t * (1 - 0.8 * np.clip(bd * 2.5, 0, 1))
    P = m.V + N * t[:, None]
    for _ in range(4):
        P = m.suavizar_campo(P, iteracoes=1, alfa=0.5)
        P = base.afastar_da_pele(P, t * 0.7)
    # relevo: mechas alongadas no sentido do penteado (de cima para baixo / para trás)
    d = norm_linhas(P - cb.C)
    Pr = P.copy()
    # comprime no sentido da mecha (ruído estica ao longo dela)
    Pr[:, 1] *= 0.35
    rel = ruido3(Pr, escala_relevo, semente) * 0.6 + ruido3(Pr, escala_relevo * 0.45, semente + 7) * 0.4
    if cachos:
        rel = rel * (1 - cachos) + cachos * (ruido3(P, escala_relevo * 0.7, semente + 3) * 0.7 +
                                             ruido3(P, escala_relevo * 0.3, semente + 5) * 0.3)
    borda = np.zeros(m.n)
    for laco in m.bordas():
        borda[laco] = 1.0
    borda = m.suavizar_campo(borda, iteracoes=3, alfa=0.5)
    P = P + d * ((0.5 + 0.5 * rel) * relevo * (1 - np.clip(borda * 2, 0, 1)))[:, None]
    m.V = P
    m.A['mascara'] = np.tile(CABELO, (m.n, 1))
    return m


def uv_esferico(cb, m, reg='cabelo'):
    """UV pela direção em volta do centro do crânio (u = azimute, v = elevação)."""
    el, az = cb.angulos(m.V)
    u = (az + 180) / 360.0
    v = np.clip((90 - el) / 150.0, 0, 1)
    UVc = np.stack([u, v], axis=1)[m.F]
    for f in range(len(UVc)):
        us = UVc[f, :, 0]
        if us.max() - us.min() > 0.5:
            UVc[f, :, 0] = np.where(us < 0.5, us + 1.0, us)
    UVc[..., 0] = UVc[..., 0] / 2.0          # 0..1 (com a volta) -> 0..1
    m.UV = R.na_regiao(UVc, reg)
    return m


def fechar_borda(m, espessura_func, mascara):
    """Faixa da borda da casca até a pele (esconde a borda fina)."""
    N = m.normais()
    pecas = []
    for laco in m.bordas():
        idx = np.array(laco)
        if len(idx) < 3:
            continue
        P = m.V[idx]
        n = N[idx]
        t = m.A['afast'][idx, 0] if 'afast' in m.A else np.full(len(idx), 0.006)
        P2 = P - n * (t * 1.05)[:, None]
        nl = len(idx)
        Vn = np.vstack([P, P2])
        Wn = np.vstack([m.W[idx], m.W[idx]])
        F, UV = [], []
        uv0 = m.UV.reshape(-1, 2).mean(0)
        for i in range(nl):
            j = (i + 1) % nl
            F.append([i, nl + j, j])
            F.append([i, nl + i, nl + j])
            UV += [[uv0] * 3, [uv0] * 3]
        mm = M.Malha(Vn, np.array(F), np.array(UV), Wn, {'mascara': np.tile(mascara, (len(Vn), 1))})
        pecas.append(mm)
    return pecas


# ---------------------------------------------------------------------------
def cortar_couro(base, cb, tabela, margem=0.012):
    """Corta o corpo na linha do cabelo; devolve (corpo cortado, pedaço do couro, f)."""
    m = base.m.copia()
    f = f_cabelo(cb, m.V, m.W, tabela)
    m2, _ = m.cortar(f)
    f2 = f_cabelo(cb, m2.V, m2.W, tabela)
    return m2, f2


def cabelo_simples(base, corpo_m, cb, tabela, espessura, **kw):
    f = f_cabelo(cb, corpo_m.V, corpo_m.W, tabela)
    dentro = (f[corpo_m.F] > -1e-7).all(1)
    ped = corpo_m.sub(dentro)
    ped.A = {}
    c = casca_cabelo(base, cb, ped, espessura, **kw)
    t_fn = espessura
    c.A['afast'] = (t_fn(*cb.angulos(c.V)) if callable(t_fn) else np.full(c.n, t_fn))[:, None]
    c = M.reduzir_interno(c, int(len(c.F) * 0.65))
    # a redução corta as curvas por dentro: empurra de volta para fora da pele
    el, az = cb.angulos(c.V)
    tmin = (espessura(el, az) if callable(espessura) else np.full(c.n, espessura)) * 0.35
    c.V = base.afastar_da_pele(c.V, np.maximum(tmin, 0.0015))
    uv_esferico(cb, c)
    # sem faixa na borda: a pele embaixo da linha do cabelo já tem a cor do cabelo (máscara A)
    return [c], f


def esp_curto(k, topo=0.010, lado=0.006, nuca=0.004):
    def e(el, az):
        a = np.abs(az)
        base = np.where(el > 35, topo, lado + (topo - lado) * np.clip((el - 5) / 30, 0, 1))
        return (base * np.where(a > 130, 1 - 0.4 * np.clip((25 - el) / 40, 0, 1), 1.0)) * k + np.where(
            a > 150, -(lado - nuca) * k * np.clip((-el) / 40, 0, 1), 0.0)
    return e


def esp_volumoso(k, topo=0.040, lado=0.026, nuca=0.014):
    def e(el, az):
        a = np.abs(az)
        base = lado + (topo - lado) * np.clip((el + 10) / 60, 0, 1)
        base = np.where(a > 120, base - (lado - nuca) * np.clip((10 - el) / 40, 0, 1), base)
        # menos volume na testa (não cobre os olhos)
        base = np.where(a < 40, base * (0.55 + 0.45 * np.clip((el - 30) / 25, 0, 1)), base)
        return base * k
    return e


# ---------------------------------------------------------------------------
# peças a mais: comprido solto, rabo de cavalo, coque
# ---------------------------------------------------------------------------
def pesos_cabelo(base, P, y_pescoco_alto, y_ombro):
    """Peso: cabeça em cima, pescoço na nuca, peito/costas embaixo."""
    W = np.zeros((len(P), len(O.NOMES)))
    y = P[:, 1]
    a = np.clip((y_pescoco_alto - y) / max(y_pescoco_alto - y_ombro, 1e-3), 0, 1)
    wc = 1 - a
    wp = a * (1 - a) * 2
    wb = a * a
    W[:, I['cabeca']] = wc
    W[:, I['pescoco']] = wp
    W[:, I['peito']] = wb
    return W / W.sum(1, keepdims=True)


def cabelo_comprido(base, cb, comprimento=0.20, espessura=0.018, semente=3, lados=11, aneis=12):
    """Cabelo comprido solto: volume que sai da cabeça (atrás das orelhas), cai reto da
    nuca (não acompanha o pescoço para dentro) e termina nas costas, `comprimento` abaixo
    da base do pescoço. Superfície de revolução em volta do eixo vertical da cabeça."""
    k = base.k
    J = base.J
    Vf, Wf = base.Vfino, base.Wfino
    br = sum(Wf[:, I[o + l]] for o in ('braco', 'antebraco', 'mao') for l in ('_e', '_d'))
    Vb = Vf[br < 0.3]
    cx, cz = 0.0, cb.C[2]
    y_top = cb.C[1] + 0.035 * k
    y_fim = J['pescoco'][1] - comprimento * k
    ys = np.linspace(y_top, y_fim, aneis)
    ang_b = np.arctan2(Vb[:, 0] - cx, -(Vb[:, 2] - cz))          # 0 = para trás
    rad_b = np.hypot(Vb[:, 0] - cx, Vb[:, 2] - cz)
    y_orelha = cb.orelha[1]
    out = np.zeros((aneis, lados))
    ths = np.zeros((aneis, lados))
    for i, y in enumerate(ys):
        # abertura: larga na cabeça (atrás das orelhas), estreita nas costas
        h = np.clip((y - (J['pescoco'][1] - 0.02 * k)) / (y_orelha - J['pescoco'][1] + 0.02 * k), 0, 1)
        acima = np.clip((y - y_orelha) / max(y_top - y_orelha, 1e-6), 0, 1)     # 0 na orelha, 1 no topo
        tmax = np.radians(62 + 50 * h - 40 * acima)
        th = np.linspace(-tmax, tmax, lados)
        ths[i] = th
        sel = np.abs(Vb[:, 1] - y) < 0.018 * k
        a, r = ang_b[sel], rad_b[sel]
        for j, t in enumerate(th):
            d = np.abs((a - t + np.pi) % (2 * np.pi) - np.pi)
            m = d < np.radians(9)
            rs = r[m].max() if m.any() else 0.05 * k
            gap = (0.012 + 0.006 * h) * k
            afina = 1 - 0.85 * acima ** 0.7          # em cima, só um pouco acima da casca
            out[i, j] = rs + (gap + espessura * k) * afina
        if i > 0:
            # cai: o raio só diminui devagar descendo (fica longe da nuca)
            prev = np.interp(th, ths[i - 1], out[i - 1])
            out[i] = np.maximum(out[i], prev - 0.25 * (ys[i - 1] - ys[i]))
    # superfícies de fora e de dentro
    Po = np.zeros((aneis, lados, 3))
    Pi = np.zeros((aneis, lados, 3))
    r = np.random.default_rng(semente)
    for i, y in enumerate(ys):
        th = ths[i]
        ro = out[i]
        ri = np.maximum(ro - espessura * k * (0.7 + 0.3 * np.cos(th)), ro * 0.75)
        Po[i] = np.c_[cx + np.sin(th) * ro, np.full(lados, y), cz - np.cos(th) * ro]
        Pi[i] = np.c_[cx + np.sin(th) * ri, np.full(lados, y), cz - np.cos(th) * ri]
    # pontas irregulares
    desl = r.uniform(-0.02, 0.02, lados) * k
    desl[[0, -1]] = 0.015 * k
    Po[-1, :, 1] += desl
    Pi[-1, :, 1] += desl + 0.012 * k
    for _ in range(2):
        Po[1:-1] = 0.5 * Po[1:-1] + 0.25 * (Po[:-2] + Po[2:])
    V = np.concatenate([Po.reshape(-1, 3), Pi.reshape(-1, 3)])
    nv = aneis * lados
    F, UV = [], []

    def q(a_, b_, c_, d_, ua, ub, va, vb):
        F.append([a_, b_, c_])
        UV.append([[ua, va], [ua, vb], [ub, vb]])
        F.append([a_, c_, d_])
        UV.append([[ua, va], [ub, vb], [ub, va]])

    for i in range(aneis - 1):
        va, vb = i / (aneis - 1), (i + 1) / (aneis - 1)
        for j in range(lados - 1):
            a_, b_, c_, d_ = i * lados + j, (i + 1) * lados + j, (i + 1) * lados + j + 1, i * lados + j + 1
            ua, ub = j / (lados - 1), (j + 1) / (lados - 1)
            q(a_, b_, c_, d_, ua, ub, va, vb)
            q(nv + d_, nv + c_, nv + b_, nv + a_, ub, ua, va, vb)
        # laterais
        a_, b_ = i * lados, (i + 1) * lados
        q(nv + a_, nv + b_, b_, a_, 0.0, 0.03, va, vb)
        a_, b_ = i * lados + lados - 1, (i + 1) * lados + lados - 1
        q(a_, b_, nv + b_, nv + a_, 0.97, 1.0, va, vb)
    i = aneis - 1
    for j in range(lados - 1):
        a_, d_ = i * lados + j, i * lados + j + 1
        q(a_, nv + a_, nv + d_, d_, j / (lados - 1), (j + 1) / (lados - 1), 0.97, 1.0)
    F = np.array(F)
    UV = np.array(UV)
    mm = M.Malha(V, F, np.zeros((len(F), 3, 2)), np.zeros((len(V), len(O.NOMES))))
    # orientação: normal de fora para trás/fora
    nf = mm.normais_faces()
    cen = V[F].mean(1)
    fora = np.c_[cen[:, 0] - cx, np.zeros(len(F)), cen[:, 2] - cz]
    n_o = (aneis - 1) * (lados - 1) * 2
    if np.mean(np.einsum('ij,ij->i', nf[:n_o:2], fora[:n_o:2])) < 0:
        F = F[:, [0, 2, 1]]
        UV = UV[:, [0, 2, 1]]
    UV2 = np.stack([0.5 + UV[..., 0] * 0.5, 0.4 + UV[..., 1] * 0.6], axis=-1)
    Wc = pesos_cabelo(base, V, J['pescoco'][1] + 0.05 * k, J['pescoco'][1] - 0.10 * k)
    mm = M.Malha(V, F, R.na_regiao(UV2, 'cabelo'), Wc, {'mascara': np.tile(CABELO, (len(V), 1))})
    # relevo de mechas (sulcos verticais)
    ang = np.arctan2(V[:, 0] - cx, -(V[:, 2] - cz))
    rel = (ruido3(np.c_[ang * 0.15, V[:, 1] * 0.08, np.zeros(len(V))], 0.012, semente) * 0.6 +
           ruido3(np.c_[ang * 0.15, V[:, 1] * 0.08, np.ones(len(V))], 0.005, semente + 1) * 0.4) * 0.004 * k
    dirr = norm_linhas(np.c_[V[:, 0] - cx, np.zeros(len(V)), V[:, 2] - cz])
    mm.V = V + dirr * rel[:, None]
    return mm


def tubo(caminho, raios, lados=8, achatar=1.0, semente=0):
    """Tubo fechado ao longo de uma curva (lista de pontos)."""
    caminho = np.asarray(caminho, float)
    n = len(caminho)
    T = np.gradient(caminho, axis=0)
    T = norm_linhas(T)
    ref = np.array([1.0, 0, 0])
    V, F, UV = [], [], []
    for i in range(n):
        t = T[i]
        a = np.cross(t, ref)
        if np.linalg.norm(a) < 1e-6:
            a = np.cross(t, [0, 0, 1.0])
        a = a / np.linalg.norm(a)
        b = np.cross(t, a)
        for j in range(lados):
            th = 2 * np.pi * j / lados
            V.append(caminho[i] + raios[i] * (np.cos(th) * a * achatar + np.sin(th) * b))
    for i in range(n - 1):
        for j in range(lados):
            a, b = i * lados + j, i * lados + (j + 1) % lados
            c, d = (i + 1) * lados + (j + 1) % lados, (i + 1) * lados + j
            F += [[a, b, c], [a, c, d]]
            u0, u1 = j / lados, (j + 1) / lados
            v0, v1 = i / (n - 1), (i + 1) / (n - 1)
            UV += [[[u0, v0], [u1, v0], [u1, v1]], [[u0, v0], [u1, v1], [u0, v1]]]
    # tampa da ponta
    ci = len(V)
    V.append(caminho[-1] + T[-1] * raios[-1] * 0.6)
    for j in range(lados):
        a, b = (n - 1) * lados + j, (n - 1) * lados + (j + 1) % lados
        F.append([a, b, ci])
        UV.append([[j / lados, 1.0], [(j + 1) / lados, 1.0], [(j + 0.5) / lados, 1.0]])
    return np.array(V), np.array(F), np.array(UV)


def rabo_de_cavalo(base, cb, comprimento=0.24, raio=0.028, alto=0.0, semente=5):
    k = base.k
    J = base.J
    C = cb.C
    A = C + np.array([0, (0.03 + alto) * k, -0.088 * k])
    pts = [A, A + np.array([0, -0.005, -0.035]) * k, A + np.array([0, -0.05, -0.055]) * k,
           A + np.array([0, -0.11, -0.05]) * k, A + np.array([0, -0.17, -0.04]) * k,
           A + np.array([0, -(comprimento - 0.02), -0.03]) * k, A + np.array([0, -comprimento, -0.025]) * k]
    # garante que fica fora das costas/pescoço
    pts = np.array(pts)
    dist, idx = base.arvore.query(pts)
    for i in range(2, len(pts)):
        b = base.Vfino[idx[i]]
        if pts[i, 2] > b[2] - 0.035 * k:
            pts[i, 2] = b[2] - 0.035 * k
    # curva suave
    from scipy.interpolate import make_interp_spline
    s = np.linspace(0, 1, len(pts))
    sp = make_interp_spline(s, pts, k=3)
    cam = sp(np.linspace(0, 1, 10))
    rs = raio * k * np.array([0.75, 1.0, 1.0, 0.95, 0.85, 0.75, 0.65, 0.55, 0.42, 0.25])
    V, F, UV = tubo(cam, rs, lados=8, achatar=0.85)
    rel = ruido3(np.c_[V[:, 0] * 2, V[:, 1] * 0.4, V[:, 2] * 2], 0.02, semente) * 0.004 * k
    V[:, 2] -= rel
    W = pesos_cabelo(base, V, A[1] - 0.02 * k, A[1] - 0.22 * k)
    UV2 = np.stack([0.5 + UV[..., 0] * 0.5, UV[..., 1] * 0.4], axis=-1)
    mm = M.Malha(V, F, R.na_regiao(UV2, 'cabelo'), W, {'mascara': np.tile(CABELO, (len(V), 1))})
    # elástico (acessório) na raiz
    Ve, Fe, UVe = tubo(np.array([A + np.array([0, 0, -0.012]) * k, A + np.array([0, -0.002, -0.026]) * k]),
                       np.array([raio * 0.8, raio * 0.8]) * k, lados=8)
    We = np.zeros((len(Ve), len(O.NOMES)))
    We[:, I['cabeca']] = 1
    el = M.Malha(Ve, Fe, R.na_regiao(UVe * 0.1, 'sola'), We, {'mascara': np.tile(ACESS, (len(Ve), 1))})
    return [mm, el]


def coque(base, cb, raio=0.045, semente=7):
    k = base.k
    C = cb.C
    centro = C + np.array([0, 0.045 * k, -0.105 * k])
    nu, nv = 12, 8
    V, F, UV = [], [], []
    for i in range(nv + 1):
        th = np.pi * i / nv
        for j in range(nu):
            ph = 2 * np.pi * j / nu
            d = np.array([np.sin(th) * np.cos(ph), np.cos(th), np.sin(th) * np.sin(ph)])
            r = raio * k * (1 + 0.08 * np.sin(3 * ph + th * 2))
            V.append(centro + d * r * np.array([1.0, 0.8, 0.85]))
    for i in range(nv):
        for j in range(nu):
            a, b = i * nu + j, i * nu + (j + 1) % nu
            c, d = (i + 1) * nu + (j + 1) % nu, (i + 1) * nu + j
            F += [[a, c, b], [a, d, c]]
            u0, u1 = j / nu, (j + 1) / nu
            v0, v1 = i / nv, (i + 1) / nv
            UV += [[[u0, v0], [u1, v1], [u1, v0]], [[u0, v0], [u0, v1], [u1, v1]]]
    V = np.array(V)
    W = np.zeros((len(V), len(O.NOMES)))
    W[:, I['cabeca']] = 1
    UV = np.array(UV)
    UV2 = np.stack([0.5 + UV[..., 0] * 0.5, UV[..., 1] * 0.4], axis=-1)
    return [M.Malha(V, np.array(F), R.na_regiao(UV2, 'cabelo'), W, {'mascara': np.tile(CABELO, (len(V), 1))})]


# ---------------------------------------------------------------------------
# boné e chapéu
# ---------------------------------------------------------------------------
def bone(base, cb, corpo_m, sobre_cabelo=0.008):
    k = base.k
    f = f_cabelo(cb, corpo_m.V, corpo_m.W, LINHA_BONE, folga_orelha=0.0)
    m, _ = corpo_m.copia().cortar(f)
    f = f_cabelo(cb, m.V, m.W, LINHA_BONE, folga_orelha=0.0)
    ped = m.sub((f[m.F] > -1e-7).all(1))
    ped.A = {}
    copa = R.casca(base, ped, sobre_cabelo + 0.006 * k, alisar=8, folga_min=0.95)
    # arredonda a copa (fica mais alta e lisa)
    d = copa.V - cb.C
    r = np.linalg.norm(d, axis=1)
    copa.V = cb.C + d * (np.maximum(r, np.percentile(r, 40)) / r)[:, None]
    copa.V = copa.suavizar_campo(copa.V, iteracoes=4, alfa=0.5)
    W = np.zeros((copa.n, len(O.NOMES)))
    W[:, I['cabeca']] = 1
    copa.W = W
    copa.A = {'mascara': np.tile(ACESS, (copa.n, 1)), 'afast': np.full((copa.n, 1), 0.006)}
    uv_esferico(cb, copa, 'bone')
    partes = [copa] + fechar_borda(copa, None, ACESS)
    for p in partes[1:]:
        p.W = np.tile(W[:1], (p.n, 1))
        uv_esferico(cb, p, 'bone')
    # aba: da borda da frente, para a frente e um pouco para baixo
    laco = max(copa.bordas(), key=len)
    idx = np.array(laco)
    P = copa.V[idx]
    el, az = cb.angulos(P)
    frente = np.abs(az) < 72
    # ordena os pontos da frente pelo azimute
    sel = idx[frente]
    ordem = np.argsort(az[frente])
    Pf = copa.V[sel[ordem]]
    azf = az[frente][ordem]
    n = len(Pf)
    larg = np.cos(np.radians(azf / 72 * 90)) ** 0.6
    dirf = norm_linhas(np.c_[(Pf[:, 0] - cb.C[0]) * 0.5, np.zeros(n), Pf[:, 2] - cb.C[2]])
    ext = (0.075 * k) * larg
    Pa = Pf + dirf * ext[:, None] + np.array([0, -0.012 * k, 0]) * larg[:, None]
    Pa[:, 1] -= 0.01 * k * (Pa[:, 0] / (0.08 * k)) ** 2
    e = 0.004 * k
    V = np.vstack([Pf + [0, 0.002, 0], Pa + [0, 0.002, 0], Pf - [0, e, 0], Pa - [0, e, 0]])
    F, UV = [], []
    for i in range(n - 1):
        a, b, c, d = i, i + 1, n + i + 1, n + i
        F += [[a, b, c], [a, c, d]]
        a2, b2, c2, d2 = 2 * n + i, 2 * n + i + 1, 3 * n + i + 1, 3 * n + i
        F += [[a2, c2, b2], [a2, d2, c2]]
        a3, b3 = n + i, n + i + 1
        F += [[a3, b3, 3 * n + i + 1], [a3, 3 * n + i + 1, 3 * n + i]]
        UV += [[[i / n, 0], [(i + 1) / n, 0], [(i + 1) / n, 1]]] * 6
    W2 = np.tile(W[:1], (len(V), 1))
    aba = M.Malha(V, np.array(F), R.na_regiao(np.array(UV) * [1, 0.3] + [0, 0.7], 'bone'), W2,
                  {'mascara': np.tile(ACESS, (len(V), 1))})
    return partes + [aba], f


def chapeu_palha(base, cb, corpo_m, aba=0.15, altura=0.10):
    k = base.k
    f = f_cabelo(cb, corpo_m.V, corpo_m.W, LINHA_CHAPEU, folga_orelha=0.0)
    m, _ = corpo_m.copia().cortar(f)
    f = f_cabelo(cb, m.V, m.W, LINHA_CHAPEU, folga_orelha=0.0)
    ped = m.sub((f[m.F] > -1e-7).all(1))
    ped.A = {}
    copa = R.casca(base, ped, 0.018 * k, alisar=8, folga_min=0.95)
    # borda da copa num plano (a aba sai reta)
    bd = np.array(sorted(set(v for l in copa.bordas() for v in l)))
    y_borda = copa.V[bd, 1].mean()
    perto = np.clip(1 - (copa.V[:, 1] - y_borda) / (0.03 * k), 0, 1)
    copa.V[:, 1] = copa.V[:, 1] * (1 - perto) + y_borda * perto
    copa.V[bd, 1] = y_borda
    # copa: sobe e achata em cima
    y0 = copa.V[:, 1].min()
    alt = copa.V[:, 1] - y0
    topo = y0 + altura * k
    copa.V[:, 1] = y0 + alt * (altura * k / max(alt.max(), 1e-6))
    copa.V[:, 1] = np.minimum(copa.V[:, 1], topo - 0.01 * k)
    # copa quase cilíndrica (não afunila em ponta)
    cx, cz = cb.C[0], cb.C[2] - 0.005 * k
    dx, dz = copa.V[:, 0] - cx, copa.V[:, 2] - cz
    r = np.hypot(dx, dz)
    bd = np.array(sorted(set(v for l in copa.bordas() for v in l)))
    R0 = r[bd].mean()
    h = (copa.V[:, 1] - y_borda) / max(altura * k, 1e-6)
    rmin = R0 * (0.97 - 0.12 * h)
    esc = np.where(r < rmin, rmin / np.maximum(r, 1e-6), 1.0)
    copa.V[:, 0] = cx + dx * esc
    copa.V[:, 2] = cz + dz * esc
    W = np.zeros((copa.n, len(O.NOMES)))
    W[:, I['cabeca']] = 1
    copa.W = W
    copa.A = {'mascara': np.tile(ACESS, (copa.n, 1))}
    uv_esferico(cb, copa, 'chapeu')
    # aba: anel a partir da borda da copa
    laco = max(copa.bordas(), key=len)
    idx = np.array(laco)
    P = copa.V[idx]
    ang = np.arctan2(P[:, 0] - cb.C[0], P[:, 2] - cb.C[2])
    ordem = np.argsort(ang)
    P = P[ordem]
    ang = ang[ordem]
    n = len(P)
    dirh = np.c_[np.sin(ang), np.zeros(n), np.cos(ang)]
    Pe = P + dirh * aba * k + np.array([0, -0.025 * k, 0])
    Pm = P + dirh * aba * k * 0.5 + np.array([0, -0.008 * k, 0])
    e = 0.005 * k
    aneis = [P, Pm, Pe, Pe - [0, e, 0], Pm - [0, e, 0], P - [0, e, 0]]
    V = np.vstack(aneis)
    F, UV = [], []
    for r in range(len(aneis) - 1):
        for i in range(n):
            j = (i + 1) % n
            a, b, c, d = r * n + i, r * n + j, (r + 1) * n + j, (r + 1) * n + i
            F += [[a, b, c], [a, c, d]]
            UV += [[[i / n, r / 5], [j / n, r / 5], [j / n, (r + 1) / 5]],
                   [[i / n, r / 5], [j / n, (r + 1) / 5], [i / n, (r + 1) / 5]]]
    UV = np.array(UV)
    UV[..., 0] = np.clip(UV[..., 0], 0, 1)
    W2 = np.tile(W[:1], (len(V), 1))
    abam = M.Malha(V, np.array(F), R.na_regiao(UV, 'chapeu'), W2, {'mascara': np.tile(ACESS, (len(V), 1))})
    # a aba gira para fora (as faces de baixo e de cima ficam certas pela ordem)
    return [copa, abam], f


# ---------------------------------------------------------------------------
# boné e chapéu paramétricos (cúpula lisa ajustada à cabeça)
# ---------------------------------------------------------------------------
def raio_cabeca(base, cb, dirs, abertura=12.0):
    """Raio da pele da cabeça (a partir do centro do crânio) em cada direção."""
    V, W = base.Vfino, base.Wfino
    cab = (W[:, I['cabeca']] + W[:, I['pescoco']]) > 0.5
    P = V[cab] - cb.C
    r = np.linalg.norm(P, axis=1)
    u = P / r[:, None]
    cosmax = np.cos(np.radians(abertura))
    out = np.zeros(len(dirs))
    for i, d in enumerate(dirs):
        c = u @ d
        m = c > cosmax
        out[i] = np.percentile(r[m] * c[m], 85) if m.any() else 0.09 * base.k
    return out


def cupula(base, cb, linha, folga, n_az=24, n_el=7, topo_plano=None, reg='bone', altura=None):
    """Cúpula da linha `linha` (|az| -> elevação mínima) até o alto, afastada `folga` da pele."""
    k = base.k
    azs = np.radians(np.linspace(-180, 180, n_az, endpoint=False))
    V, UVs = [], []
    for j in range(n_el + 1):
        f = j / n_el
        for a in azs:
            el0 = np.radians(cb.linha(np.array([np.degrees(a)]), linha)[0])
            el = el0 + (np.radians(80) - el0) * f
            d = np.array([np.cos(el) * np.sin(a), np.sin(el), np.cos(el) * np.cos(a)])
            V.append(d)
            UVs.append(((a / np.pi + 1) / 2, f))
    D = np.array(V)
    # elipsoide ajustado à cabeça (meias medidas para os lados, para cima, frente e trás)
    Vf, Wf = base.Vfino, base.Wfino
    cab = Wf[:, I['cabeca']] > 0.9
    Q = Vf[cab] - cb.C
    Q = Q[Q[:, 1] > -0.01 * k]
    rx = np.abs(Q[:, 0]).max()
    ry = Q[:, 1].max()
    rzf = Q[:, 2].max()
    rzb = -Q[:, 2].min()
    rz = np.where(D[:, 2] > 0, rzf, rzb)
    r = 1.0 / np.sqrt((D[:, 0] / rx) ** 2 + (D[:, 1] / ry) ** 2 + (D[:, 2] / rz) ** 2) + folga
    # suaviza o raio em volta (tira calombos das orelhas e do pescoço)
    R2 = r.reshape(n_el + 1, n_az)
    for _ in range(4):
        R2 = 0.5 * R2 + 0.25 * (np.roll(R2, 1, 1) + np.roll(R2, -1, 1))
        R2[1:-1] = 0.5 * R2[1:-1] + 0.25 * (R2[:-2] + R2[2:])
    P = cb.C + D * R2.reshape(-1)[:, None]
    if altura is not None:
        # chapéu: copa quase cilíndrica com o alto achatado
        yb = P[:n_az, 1].mean()
        P[:n_az, 1] = yb
        for j in range(1, n_el + 1):
            f = j / n_el
            idx = slice(j * n_az, (j + 1) * n_az)
            base_r = np.hypot(P[:n_az, 0] - cb.C[0], P[:n_az, 2] - cb.C[2])
            rr = base_r * (1.0 - 0.10 * f) * (1 - 0.85 * max(0, f - 0.75) / 0.25)
            P[idx, 0] = cb.C[0] + np.sin(azs) * rr
            P[idx, 2] = cb.C[2] + np.cos(azs) * rr
            P[idx, 1] = yb + altura * k * min(1.0, f / 0.75)
    F, UV = [], []
    for j in range(n_el):
        for i in range(n_az):
            i2 = (i + 1) % n_az
            a, b_, c, d_ = j * n_az + i, j * n_az + i2, (j + 1) * n_az + i2, (j + 1) * n_az + i
            ua, ub = i / n_az, (i + 1) / n_az
            va, vb = j / n_el, (j + 1) / n_el
            F += [[a, b_, c], [a, c, d_]]
            UV += [[[ua, va], [ub, va], [ub, vb]], [[ua, va], [ub, vb], [ua, vb]]]
    # tampa no alto
    ct = len(P)
    anel = P[n_el * n_az:]
    topo = anel.mean(0) + np.array([0, 0.25 * np.ptp(anel[:, 0]) * np.tan(np.radians(10)), 0])
    if altura is not None:
        topo[1] = anel[:, 1].mean()
    P = np.vstack([P, topo])
    for i in range(n_az):
        a, b_ = n_el * n_az + i, n_el * n_az + (i + 1) % n_az
        F.append([a, b_, ct])
        UV.append([[i / n_az, 1.0], [(i + 1) / n_az, 1.0], [(i + 0.5) / n_az, 1.0]])
    F = np.array(F)
    mm = M.Malha(P, F, R.na_regiao(np.array(UV) * [1, 0.6], reg), np.zeros((len(P), len(O.NOMES))),
                 {'mascara': np.tile(ACESS, (len(P), 1))})
    nf = mm.normais_faces()
    cen = P[F].mean(1)
    if np.mean(np.einsum('ij,ij->i', nf, cen - cb.C)) < 0:
        mm.F = mm.F[:, [0, 2, 1]]
        mm.UV = mm.UV[:, [0, 2, 1]]
    mm.W[:, I['cabeca']] = 1.0
    return mm, n_az


def placa(base, borda_ext, borda_int, espessura, reg, uv_v=(0.7, 1.0)):
    """Placa fechada (aba): faixas de cima, de baixo e da borda, entre dois contornos."""
    n = len(borda_ext)
    e = np.array([0, espessura, 0])
    A, B = borda_int, borda_ext
    V = np.vstack([A, B, A - e, B - e])
    F, UV = [], []
    for i in range(n - 1):
        j = i + 1
        u0, u1 = i / (n - 1), j / (n - 1)
        a, b_, c, d_ = i, j, n + j, n + i
        F += [[a, c, b_], [a, d_, c]]
        a2, b2, c2, d2 = 2 * n + i, 2 * n + j, 3 * n + j, 3 * n + i
        F += [[a2, b2, c2], [a2, c2, d2]]
        F += [[n + i, n + j, 3 * n + j], [n + i, 3 * n + j, 3 * n + i]]
        UV += [[[u0, uv_v[0]], [u1, uv_v[1]], [u1, uv_v[0]]], [[u0, uv_v[0]], [u0, uv_v[1]], [u1, uv_v[1]]]] * 3
    return np.array(V), np.array(F), np.array(UV)


def bone2(base, cb, folga=0.018):
    """Boné: cúpula lisa + aba na frente."""
    k = base.k
    copa, n_az = cupula(base, cb, LINHA_BONE, folga * k, reg='bone')
    # aba: pontos da base da cúpula na frente
    P0 = copa.V[:n_az]
    az = np.degrees(np.arctan2(P0[:, 0] - cb.C[0], P0[:, 2] - cb.C[2]))
    sel = np.abs(az) <= 75
    ordem = np.argsort(az[sel])
    Pf = P0[sel][ordem]
    azf = az[sel][ordem]
    larg = np.cos(np.radians(azf / 80 * 90)) ** 0.7
    dirf = norm_linhas(np.c_[(Pf[:, 0] - cb.C[0]) * 0.6, np.zeros(len(Pf)), Pf[:, 2] - cb.C[2]])
    ext = 0.075 * k * larg + 0.004
    Pa = Pf + dirf * ext[:, None] + np.array([0, -0.010 * k, 0]) * larg[:, None]
    Pa[:, 1] -= 0.012 * k * (np.abs(Pa[:, 0]) / (0.08 * k)) ** 2
    Pi = Pf + np.array([0, 0.002, 0]) - dirf * 0.004
    V, F, UV = placa(base, Pa, Pi, 0.005 * k, 'bone')
    W = np.zeros((len(V), len(O.NOMES)))
    W[:, I['cabeca']] = 1.0
    aba = M.Malha(V, F, R.na_regiao(UV, 'bone'), W, {'mascara': np.tile(ACESS, (len(V), 1))})
    nf = aba.normais_faces()
    if nf[0, 1] < 0:
        aba.F = aba.F[:, [0, 2, 1]]
        aba.UV = aba.UV[:, [0, 2, 1]]
    return [copa, aba]


def chapeu2(base, cb, aba_m=0.13, altura=0.085, folga=0.022):
    k = base.k
    copa, n_az = cupula(base, cb, LINHA_CHAPEU, folga * k, reg='chapeu', altura=altura)
    P0 = copa.V[:n_az]
    ang = np.arctan2(P0[:, 0] - cb.C[0], P0[:, 2] - cb.C[2])
    n = n_az + 1
    Pb = np.vstack([P0, P0[:1]])
    angb = np.r_[ang, ang[0]]
    dirh = np.c_[np.sin(angb), np.zeros(n), np.cos(angb)]
    Pe = Pb + dirh * aba_m * k + np.array([0, -0.03 * k, 0])
    Pm = Pb + dirh * aba_m * k * 0.5 + np.array([0, -0.006 * k, 0])
    partes = []
    for a_, b_ in ((Pb - dirh * 0.004, Pm), (Pm, Pe)):
        V, F, UV = placa(base, b_, a_, 0.005 * k, 'chapeu', uv_v=(0.0, 1.0))
        W = np.zeros((len(V), len(O.NOMES)))
        W[:, I['cabeca']] = 1.0
        mm = M.Malha(V, F, R.na_regiao(UV, 'chapeu'), W, {'mascara': np.tile(ACESS, (len(V), 1))})
        nf = mm.normais_faces()
        if nf[0, 1] < 0:
            mm.F = mm.F[:, [0, 2, 1]]
            mm.UV = mm.UV[:, [0, 2, 1]]
        partes.append(mm)
    return [copa] + partes
