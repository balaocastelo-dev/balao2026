"""Calçados: tênis, sapatênis, botina/bota (casca do pé com sola), chinelo e sandália
(sola recortada no contorno do pé com tiras) e o pé descalço (a planta desce até o chão).

No repouso a sola do pé descalço fica a FOLGA_SOLA (1,2 cm) do chão; os calçados ocupam
essa folga (e um pouco mais, subindo pelos lados como uma entressola de verdade).
"""
import numpy as np
from scipy.spatial import ConvexHull

import malha as M
import ossos as O
import roupas as R
from roupas import ACESS, norm_linhas
from corpo import FOLGA_SOLA

I = O.INDICE

TIPOS = {
    # colarinho (m, homem), espessura, altura da sola, achata a ponta
    'tenis': dict(colar=0.095, esp=0.007, sola=0.030, alisar=14),
    'sapatenis': dict(colar=0.078, esp=0.006, sola=0.022, alisar=14),
    'botina': dict(colar=0.165, esp=0.009, sola=0.034, alisar=14),
    'bota': dict(colar=0.20, esp=0.008, sola=0.030, alisar=14),
}


def f_sapato(b, P, W, colar):
    k = b.k
    pe = b.peso(W, ['pe_e', 'pe_d', 'dedos_pe_e', 'dedos_pe_d', 'canela_e', 'canela_d'])
    # colarinho um pouco mais alto atrás (calcanhar) e na frente (lingueta)
    rel_z = np.zeros(len(P))
    for l in ('_e', '_d'):
        lado = np.sign(P[:, 0]) == (1 if l == '_e' else -1)
        rel_z = np.where(lado, P[:, 2] - b.J['pe' + l][2], rel_z)
    y_col = colar * k + 0.012 * k * np.clip(-rel_z / (0.05 * k), 0, 1) + 0.008 * k * np.clip(rel_z / (0.06 * k), 0, 1)
    return np.minimum(y_col - P[:, 1], (pe - 0.5) * 0.5)


def sapato(base, m_corpo, tipo):
    """Casca do calçado: alisada (sem dedos), com sola achatada no chão e mais larga."""
    cfg = TIPOS[tipo]
    k = base.k

    def campo(P, W):
        return f_sapato(base, P, W, cfg['colar'])
    m, _ = m_corpo.cortar(campo(m_corpo.V, m_corpo.W))
    f = campo(m.V, m.W)
    ped = m.sub((f[m.F] > -1e-7).all(1))
    ped.A = {}
    c = R.casca(base, ped, cfg['esp'] * k ** 0.5, alisar=cfg['alisar'])
    # sola: o que estiver abaixo da sola vai para o chão, e a borda abre um pouco
    sola = cfg['sola'] * k ** 0.6
    y = c.V[:, 1]
    ymin = y.min()
    baixo = y < sola
    t = np.clip((y - ymin) / (sola - ymin), 0, 1)
    c.V[:, 1] = np.where(baixo, t * sola, y)
    # entressola mais larga (para fora, no plano)
    for l in ('_e', '_d'):
        lado = (c.V[:, 0] > 0) if l == '_e' else (c.V[:, 0] < 0)
        cx = base.J['pe' + l][0]
        cz = np.mean(c.V[lado, 2])
        d = np.c_[c.V[:, 0] - cx, np.zeros(c.n), (c.V[:, 2] - cz) * 0.5]
        d = norm_linhas(d)
        abre = 0.004 * k * np.clip(1 - c.V[:, 1] / sola, 0, 1) * (c.V[:, 1] < sola)
        c.V += d * (abre * lado)[:, None]
    c.A = {'mascara': np.tile(ACESS, (c.n, 1)), 'afast': np.full((c.n, 1), cfg['esp'])}
    c.UV = R.na_regiao(R.de_regiao(c.UV, 'pele'), 'tecido')
    # o sapato liso não precisa dos triângulos dos dedos
    c = M.reduzir_interno(c, max(160, int(len(c.F) * 0.45)))
    partes = [c] + R.barra(base, c, comprimento=0.006, abre=0.002, espessura=0.006, mascara=ACESS)
    return m, f, partes


# ---------------------------------------------------------------------------
def contorno_pe(base, l, folga=0.006):
    """Contorno (x, z) da planta do pé e pesos médios, do corpo fino."""
    V, W = base.Vfino, base.Wfino
    pe = W[:, I['pe' + l]] + W[:, I['dedos_pe' + l]]
    sel = (pe > 0.5) & (V[:, 1] < FOLGA_SOLA + 0.02)
    P = V[sel][:, [0, 2]]
    h = ConvexHull(P)
    pol = P[h.vertices]
    c = pol.mean(0)
    d = pol - c
    pol = pol + d / np.linalg.norm(d, axis=1, keepdims=True) * folga
    # reamostra o contorno em ~28 pontos
    seg = np.r_[0, np.cumsum(np.linalg.norm(np.diff(np.vstack([pol, pol[:1]]), axis=0), axis=1))]
    s = np.linspace(0, seg[-1], 29)[:-1]
    xs = np.interp(s, seg, np.r_[pol[:, 0], pol[0, 0]])
    zs = np.interp(s, seg, np.r_[pol[:, 1], pol[0, 1]])
    return np.c_[xs, zs], c


def pesos_perto(base, P, k=6):
    d, idx = base.arvore.query(P, k=k)
    w = 1.0 / np.maximum(d, 1e-4)
    W = (base.Wfino[idx] * w[..., None]).sum(1) / w.sum(1, keepdims=True)
    return O.limitar(W, 4)


def sola_recortada(base, l, altura=FOLGA_SOLA):
    """Laje da sola do chinelo/sandália, no contorno do pé, do chão até a planta."""
    cont, c = contorno_pe(base, l)
    n = len(cont)
    top = np.c_[cont[:, 0], np.full(n, altura), cont[:, 1]]
    bot = np.c_[cont[:, 0], np.zeros(n), cont[:, 1]]
    ct = np.array([c[0], altura, c[1]])
    cbm = np.array([c[0], 0.0, c[1]])
    V = np.vstack([top, bot, ct, cbm])
    F, UV = [], []
    it, ib = 2 * n, 2 * n + 1
    for i in range(n):
        j = (i + 1) % n
        F += [[it, j, i], [ib, n + i, n + j], [i, j, n + j], [i, n + j, n + i]]
        u0, u1 = i / n, (i + 1) / n
        UV += [[[0.5, 0.5], [u1, 0.0], [u0, 0.0]], [[0.5, 0.5], [u0, 1.0], [u1, 1.0]],
               [[u0, 0.3], [u1, 0.3], [u1, 0.7]], [[u0, 0.3], [u1, 0.7], [u0, 0.7]]]
    F = np.array(F)
    # confere a orientação (normal de cima para cima)
    mm = M.Malha(V, F, R.na_regiao(np.array(UV), 'sola'), pesos_perto(base, V), {'mascara': np.tile(ACESS, (len(V), 1))})
    nf = mm.normais_faces()
    if nf[0, 1] < 0:
        mm.F = mm.F[:, [0, 2, 1]]
        mm.UV = mm.UV[:, [0, 2, 1]]
    return mm


def tira(base, pontos, raio=0.004, altura_min=None, lados=5):
    """Tira (tubo achatado) passando por cima da pele pelos pontos dados."""
    from cabelo import tubo
    from scipy.interpolate import make_interp_spline
    pts = np.asarray(pontos, float)
    s = np.linspace(0, 1, len(pts))
    sp = make_interp_spline(s, pts, k=min(3, len(pts) - 1))
    cam = sp(np.linspace(0, 1, 8))
    # afasta da pele
    cam = base.afastar_da_pele(cam, np.full(len(cam), raio * 1.3))
    V, F, UV = tubo(cam, np.full(len(cam), raio), lados=lados, achatar=1.8)
    W = pesos_perto(base, V)
    return M.Malha(V, F, R.na_regiao(UV, 'tira'), W, {'mascara': np.tile(ACESS, (len(V), 1))})


def ponto_pele(base, alvo):
    """Ponto da pele (corpo fino) mais perto de `alvo`."""
    d, i = base.arvore.query(np.asarray(alvo)[None])
    return base.Vfino[i[0]]


def chinelo(base):
    k = base.k
    partes = []
    for l in ('_e', '_d'):
        s = 1.0 if l == '_e' else -1.0
        partes.append(sola_recortada(base, l))
        J = base.J
        dedos = J['dedos_pe' + l]
        tor = J['pe' + l]
        # entre o dedão e o segundo dedo
        poste = np.array([dedos[0] - s * 0.018 * k, FOLGA_SOLA + 0.002, dedos[2] + 0.035 * k])
        peito_pe = ponto_pele(base, [tor[0] - s * 0.005, tor[1] - 0.01 * k, tor[2] + 0.075 * k]) + [0, 0.006, 0]
        for lado in (1, -1):
            borda = np.array([tor[0] + lado * 0.042 * k, FOLGA_SOLA + 0.003, tor[2] + 0.055 * k])
            meio = 0.5 * (peito_pe + borda) + np.array([lado * 0.01, 0.012 * k, 0])
            partes.append(tira(base, [poste, 0.5 * (poste + peito_pe) + [0, 0.012 * k, 0], peito_pe if lado > 0 else peito_pe, meio, borda], raio=0.0045 * k))
    return partes


def sandalia(base):
    k = base.k
    partes = []
    for l in ('_e', '_d'):
        s = 1.0 if l == '_e' else -1.0
        partes.append(sola_recortada(base, l))
        J = base.J
        dedos = J['dedos_pe' + l]
        tor = J['pe' + l]
        # tira da frente (por cima da base dos dedos)
        a = np.array([dedos[0] + 0.045 * k, FOLGA_SOLA + 0.003, dedos[2] - 0.01 * k])
        b = np.array([dedos[0] - 0.045 * k, FOLGA_SOLA + 0.003, dedos[2] - 0.005 * k])
        topo = ponto_pele(base, [dedos[0], dedos[1] + 0.03, dedos[2] - 0.015]) + [0, 0.006, 0]
        partes.append(tira(base, [a, 0.5 * (a + topo) + [0, 0.01, 0], topo, 0.5 * (b + topo) + [0, 0.01, 0], b],
                           raio=0.006 * k))
        # tira do tornozelo (anel acima do calcanhar)
        anel = []
        for th in np.linspace(0, 2 * np.pi, 7):
            p = tor + np.array([np.sin(th) * 0.045 * k, -0.005 * k, np.cos(th) * 0.045 * k - 0.005 * k])
            anel.append(ponto_pele(base, p) + 0.0 * p)
        anel = np.array(anel)
        partes.append(tira(base, anel, raio=0.004 * k))
        # tira de trás ligando a sola ao anel
        tras = np.array([tor[0], FOLGA_SOLA + 0.002, tor[2] - 0.055 * k])
        partes.append(tira(base, [tras, tras + [0, 0.025 * k, 0.004], anel[4]], raio=0.0045 * k))
    return partes


def descalco(base, m):
    """A planta do pé desce até o chão (a folga da sola some) com transição suave."""
    pe = m.W[:, I['pe_e']] + m.W[:, I['pe_d']] + m.W[:, I['dedos_pe_e']] + m.W[:, I['dedos_pe_d']]
    y = m.V[:, 1]
    desce = FOLGA_SOLA * np.clip(1 - (y - FOLGA_SOLA) / 0.03, 0, 1) * np.clip(pe * 2, 0, 1)
    m.V[:, 1] = y - desce
    return m
