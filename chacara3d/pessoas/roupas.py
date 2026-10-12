"""Roupas, cabelos e calçados montados sobre o corpo (a mesma malha, cortada e afastada).

Cada peça é definida por um campo f(P, W) no corpo em repouso: f > 0 dentro da peça.
O corpo é cortado na isolinha f = 0 (borda limpa), as faces de dentro viram a casca da
roupa (afastada da pele, alisada, com caimento) e ganham uma barra com espessura; a pele
que fica bem dentro da roupa é apagada (não atravessa na animação: a casca usa os mesmos
pesos da pele de onde saiu).

Coordenadas de textura em espaço de imagem (u para a direita, v para baixo), no atlas
de 1024² (ver textura.py): pele e tecido usam o mapa do MakeHuman em quadrantes.
"""
import numpy as np
from scipy.spatial import cKDTree

import malha as M
import ossos as O

I = O.INDICE

# regiões do atlas (u0, v0, u1, v1) em espaço de imagem
REG = {
    'pele': (0.0, 0.0, 0.5, 0.5),
    'tecido': (0.5, 0.0, 1.0, 0.5),
    'cabelo': (0.0, 0.5, 0.5, 1.0),
    'barra': (0.5, 0.5, 1.0, 0.625),
    'saia': (0.5, 0.625, 0.75, 0.875),
    'sola': (0.75, 0.625, 1.0, 0.75),
    'tira': (0.75, 0.75, 1.0, 0.875),
    'chapeu': (0.5, 0.875, 0.75, 1.0),
    'bone': (0.75, 0.875, 1.0, 1.0),
}


def na_regiao(uv, reg):
    u0, v0, u1, v1 = REG[reg]
    uv = np.asarray(uv, float)
    return np.stack([u0 + uv[..., 0] * (u1 - u0), v0 + uv[..., 1] * (v1 - v0)], axis=-1)


def de_regiao(uv, reg):
    u0, v0, u1, v1 = REG[reg]
    return np.stack([(uv[..., 0] - u0) / (u1 - u0), (uv[..., 1] - v0) / (v1 - v0)], axis=-1)


# máscaras (R cima, G baixo, B pele, A cabelo; zero = calçado/acessório)
CIMA = np.array([1.0, 0, 0, 0])
BAIXO = np.array([0, 1.0, 0, 0])
PELE = np.array([0, 0, 1.0, 0])
CABELO = np.array([0, 0, 0, 1.0])
ACESS = np.zeros(4)


def norm_linhas(v):
    return v / np.maximum(np.linalg.norm(v, axis=-1, keepdims=True), 1e-12)


class Base:
    """O corpo de uma pessoa preparado para vestir."""

    def __init__(self, d, tipo):
        self.tipo = tipo
        self.k = {'homem': 1.0, 'mulher': 1.63 / 1.76, 'crianca': 1.30 / 1.76}[tipo]
        self.J = {k: np.asarray(v, float) for k, v in d['juntas'].items()}
        self.cab = d['cab']
        self.cau = d['cau']
        self.marcos = d['marcos']
        UV = np.asarray(d['UV'], float).copy()
        UV[..., 1] = 1.0 - UV[..., 1]
        self.m = M.Malha(d['V'], d['F'], na_regiao(UV, 'pele'), d['W'])
        # superfície fina (antes da redução) para afastar as roupas da pele
        Vf = np.asarray(d['Vfull'], float)
        Fq = np.asarray(d['Fq'])
        Ff = np.concatenate([Fq[:, [0, 1, 2]], Fq[:, [0, 2, 3]]])
        mf = M.Malha(Vf, Ff)
        self.Vfino = Vf
        self.Nfino = mf.normais()
        self.arvore = cKDTree(Vf)
        self.Wfino = np.asarray(d['Wfull'], float)

    # ------------------------------------------------------------------ parâmetros do corpo
    def eixo(self, P, a, b):
        """t ao longo do segmento a->b (0 em a, 1 em b) e distância radial."""
        A, B = self.J[a], self.J[b]
        d = B - A
        L = np.linalg.norm(d)
        u = d / L
        q = P - A
        t = q @ u / L
        r = np.linalg.norm(q - np.outer(q @ u, u), axis=1)
        return t, r, L

    def peso(self, W, ossos):
        return sum(W[:, I[o]] for o in ossos)

    def afastar_da_pele(self, P, minimo):
        """Garante que cada ponto fique pelo menos `minimo` fora da pele (pela normal)."""
        dist, idx = self.arvore.query(P, k=4)
        b = self.Vfino[idx]
        n = self.Nfino[idx]
        prof = np.einsum('nkj,nkj->nk', P[:, None, :] - b, n)        # altura acima de cada vizinho
        w = 1.0 / np.maximum(dist, 1e-4)
        h = (prof * w).sum(1) / w.sum(1)
        nm = norm_linhas((n * w[..., None]).sum(1))
        falta = np.asarray(minimo) - h
        P = P + nm * np.maximum(falta, 0)[:, None]
        return P


# ---------------------------------------------------------------------------
# casca da roupa
# ---------------------------------------------------------------------------
def casca(base, pedaco, espessura, alisar=6, folga_min=0.6):
    """Afasta o pedaço de pele (Malha) pela normal, alisa e não deixa entrar na pele."""
    m = pedaco.copia()
    # normal da pele fina (mais confiável que a da malha reduzida, sobretudo na borda)
    dist, idx = base.arvore.query(m.V, k=6)
    w = 1.0 / np.maximum(dist, 1e-4)
    N = norm_linhas((base.Nfino[idx] * w[..., None]).sum(1))
    t = espessura(m.V, m.W) if callable(espessura) else np.full(m.n, espessura)
    P = m.V + N * t[:, None]
    bordas = set(v for laco in m.bordas() for v in laco)
    fix = np.zeros(m.n, bool)
    if bordas:
        fix[list(bordas)] = False
    # alisa a forma (tira umbigo, mamilos, vincos), mantendo o afastamento mínimo
    for _ in range(alisar):
        P = m.suavizar_campo(P, iteracoes=1, alfa=0.5)
        P = base.afastar_da_pele(P, t * folga_min)
    m.V = P
    m.A['afast'] = t[:, None]
    return m


def pendurar_tronco(base, m, y_topo, sel=None, inclinacao=0.12, centro_z=None, folga=0.0):
    """Caimento: abaixo de `y_topo` o raio (em volta do eixo vertical do tronco) não
    diminui mais que `inclinacao` por metro descendo (camiseta cai do peito/omoplatas)."""
    P = m.V.copy()
    cz = base.J['coluna_2'][2] if centro_z is None else centro_z
    if sel is None:
        br = sum(m.W[:, I[o + l]] for o in ('braco', 'antebraco', 'mao') for l in ('_e', '_d'))
        sel = br < 0.3
    if not sel.any():
        return m
    ang = np.arctan2(P[:, 0], P[:, 2] - cz)
    r = np.hypot(P[:, 0], P[:, 2] - cz)
    nb_a, dy = 48, 0.015
    ia = ((ang + np.pi) / (2 * np.pi) * nb_a).astype(int) % nb_a
    y0 = P[sel, 1].min() - dy
    iy = np.floor((P[:, 1] - y0) / dy).astype(int)
    ny = iy[sel].max() + 2
    R = np.zeros((nb_a, ny))
    for a_, y_, r_, s_ in zip(ia, iy, r, sel):
        if s_ and 0 <= y_ < ny:
            R[a_, y_] = max(R[a_, y_], r_)
    # suaviza em ângulo
    R = np.maximum(R, 0.5 * (np.roll(R, 1, 0) + np.roll(R, -1, 0)) * 0.98)
    jt = int(np.floor((y_topo - y0) / dy))
    for j in range(min(jt, ny - 1) - 1, -1, -1):
        R[:, j] = np.maximum(R[:, j], R[:, j + 1] - inclinacao * dy)
    alvo = R[ia, np.clip(iy, 0, ny - 1)] + folga
    abaixo = sel & (P[:, 1] < y_topo)
    novo_r = np.where(abaixo, np.maximum(r, alvo), r)
    esc = novo_r / np.maximum(r, 1e-9)
    P[:, 0] *= esc
    P[:, 2] = cz + (P[:, 2] - cz) * esc
    m.V = P
    return m


def pendurar_membro(base, m, a, b, t_ini, sel, inclinacao=0.05, folga=0.0, nb_a=24, t_fim=1.02):
    """Caimento ao longo de um membro (manga, perna da calça): a partir de t_ini o raio em
    volta do eixo a->b não diminui mais que `inclinacao` por metro."""
    P = m.V.copy()
    A, B = base.J[a], base.J[b]
    L = np.linalg.norm(B - A)
    u = (B - A) / L
    ref = np.cross(u, [0, 0, 1.0])
    if np.linalg.norm(ref) < 1e-6:
        ref = np.cross(u, [1.0, 0, 0])
    e1 = ref / np.linalg.norm(ref)
    e2 = np.cross(u, e1)
    q = P - A
    t = q @ u
    sel = sel & (t / L > -0.05) & (t / L < t_fim)
    rad = q - np.outer(t, u)
    r = np.linalg.norm(rad, axis=1)
    ang = np.arctan2(rad @ e2, rad @ e1)
    ia = ((ang + np.pi) / (2 * np.pi) * nb_a).astype(int) % nb_a
    dt = 0.015
    it = np.floor(t / dt).astype(int)
    i0 = int(np.floor(t_ini * L / dt))
    if not sel.any():
        return m
    i1 = it[sel].max() + 1
    Rm = np.zeros((nb_a, i1 + 2))
    for a_, t_, r_, s_ in zip(ia, it, r, sel):
        if s_ and 0 <= t_ <= i1:
            Rm[a_, t_] = max(Rm[a_, t_], r_)
    Rm = np.maximum(Rm, 0.5 * (np.roll(Rm, 1, 0) + np.roll(Rm, -1, 0)) * 0.97)
    for j in range(max(i0, 0) + 1, i1 + 1):
        Rm[:, j] = np.maximum(Rm[:, j], Rm[:, j - 1] - inclinacao * dt)
    alvo = Rm[ia, np.clip(it, 0, i1 + 1)] + folga * np.clip((t / L - t_ini) / max(1 - t_ini, 1e-3), 0, 1)
    ok = sel & (t / L > t_ini)
    novo = np.where(ok, np.maximum(r, alvo), r)
    P = A + np.outer(t, u) + rad * (novo / np.maximum(r, 1e-9))[:, None]
    m.V = P
    return m


def barra(base, m, comprimento=0.015, abre=0.004, espessura=0.006, reg_uv='barra', mascara=None, v_uv=(0.0, 1.0),
          direcao=None, so_lacos=None, por_laco=None):
    """Acrescenta a barra (aba com espessura) em cada borda da casca: a aba continua
    para fora da peça e dobra para dentro, escondendo a borda fina."""
    lacos = m.bordas()
    if so_lacos is not None:
        lacos = [l for l in lacos if so_lacos(m.V[l])]
    N = m.normais()
    novos = []
    for laco in lacos:
        if len(laco) < 3:
            continue
        idx = np.array(laco)
        P = m.V[idx]
        if np.linalg.norm(np.diff(np.vstack([P, P[:1]]), axis=0), axis=1).sum() < 0.04 * base.k:
            continue          # buraquinho: sem barra
        n = N[idx]
        comprimento_l, abre_l, espessura_l = comprimento, abre, espessura
        if por_laco is not None:
            o = por_laco(P) or {}
            comprimento_l = o.get('comprimento', comprimento)
            abre_l = o.get('abre', abre)
            espessura_l = o.get('espessura', espessura)
        # direção "para fora da peça" ao longo da superfície: média das arestas que saem da borda
        prox = np.roll(P, -1, 0) - np.roll(P, 1, 0)
        fora = np.cross(prox, n)              # a borda segue a orientação das faces: fora = tangente x normal
        fora = norm_linhas(fora)
        if direcao is not None:
            d = np.asarray(direcao(P, fora), float)
            fora = norm_linhas(d)
        L = np.r_[0, np.cumsum(np.linalg.norm(np.diff(np.vstack([P, P[:1]]), axis=0), axis=1))]
        # reamostra o laço (pontos a ~1,5 cm), a barra é uma peça à parte
        passo = 0.022 * base.k
        nl = max(8, int(round(L[-1] / passo)))
        s_ = np.linspace(0, L[-1], nl, endpoint=False)
        Wl = m.W[idx]

        def rea(X):
            Xc = np.vstack([X, X[:1]])
            return np.stack([np.interp(s_, L, Xc[:, c]) for c in range(X.shape[1])], axis=1)
        P, n, fora, Wl = rea(P), norm_linhas(rea(n)), norm_linhas(rea(fora)), rea(Wl)
        # o primeiro anel entra um pouco por baixo da borda da casca (não deixa fresta)
        P0 = P - fora * 0.003 - n * 0.0015
        u = s_ / max(L[-1], 1e-9)
        L = np.r_[s_, L[-1]]
        # anéis: borda, aba externa, aba interna
        a1 = P + fora * comprimento_l + n * abre_l
        a2 = P + fora * comprimento_l + n * (abre_l - espessura_l)
        aneis = [P0, a1, a2]
        Vn = np.vstack(aneis)
        Wn = np.vstack([Wl] * 3)
        Fn, UVn = [], []
        vs = np.linspace(v_uv[0], v_uv[0] + (v_uv[1] - v_uv[0]) * 2 / 3, 3)
        for k in range(2):
            for i in range(nl):
                j = (i + 1) % nl
                a, b = k * nl + i, k * nl + j
                c, d = (k + 1) * nl + j, (k + 1) * nl + i
                ui, uj = u[i] * L[-1] * 4, (u[i] * L[-1] + np.linalg.norm(P[j] - P[i])) * 4
                Fn.append([a, c, b])
                UVn.append([[ui, vs[k]], [uj, vs[k + 1]], [uj, vs[k]]])
                Fn.append([a, d, c])
                UVn.append([[ui, vs[k]], [ui, vs[k + 1]], [uj, vs[k + 1]]])
        UVn = np.array(UVn)
        UVn[..., 0] = UVn[..., 0] % 1.0
        # evita a costura do u dar a volta dentro de um triângulo
        for f in range(len(UVn)):
            us = UVn[f, :, 0]
            if us.max() - us.min() > 0.5:
                UVn[f, :, 0] = np.where(us < 0.5, us + 1.0, us)
        UVn[..., 0] = np.clip(UVn[..., 0], 0, 1.999) * 0.5
        mm = M.Malha(Vn, np.array(Fn), na_regiao(UVn, reg_uv), Wn)
        if mascara is not None:
            mm.A['mascara'] = np.tile(mascara, (len(Vn), 1))
        novos.append(mm)
    return novos


def subdividir(m):
    """Divide cada triângulo em 4 (pontos médios), levando UV, pesos e atributos."""
    F = m.F
    mapa = {}
    novosV, novosW, novosA = [], [], {k: [] for k in m.A}

    def meio(i, j):
        k = (min(i, j), max(i, j))
        if k not in mapa:
            mapa[k] = m.n + len(novosV)
            novosV.append(0.5 * (m.V[i] + m.V[j]))
            novosW.append(0.5 * (m.W[i] + m.W[j]))
            for kk in m.A:
                novosA[kk].append(0.5 * (m.A[kk][i] + m.A[kk][j]))
        return mapa[k]

    nf, nuv = [], []
    for fi, (a, b, c) in enumerate(F):
        ab, bc, ca = meio(a, b), meio(b, c), meio(c, a)
        ua, ub, uc = m.UV[fi]
        uab, ubc, uca = 0.5 * (ua + ub), 0.5 * (ub + uc), 0.5 * (uc + ua)
        nf += [[a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca]]
        nuv += [[ua, uab, uca], [uab, ub, ubc], [uca, ubc, uc], [uab, ubc, uca]]
    V = np.vstack([m.V, np.array(novosV)])
    W = np.vstack([m.W, np.array(novosW)])
    A = {k: np.vstack([m.A[k], np.array(v)]) for k, v in novosA.items()}
    return M.Malha(V, np.array(nf), np.array(nuv), W, A)


def saia(base, y_topo, y_barra, folga=0.012, abre=0.10, aneis=7, lados=24, mascara=None, aperto_topo=0.004,
         barra_dentro=0.012):
    """Saia (ou parte de baixo do vestido): tubo da cintura até a barra, que só abre
    descendo (caimento), com pesos tirados da pele mais próxima (coxas e quadril)."""
    k = base.k
    V, W = base.Vfino, base.Wfino
    br = sum(W[:, I[o + l]] for o in ('braco', 'antebraco', 'mao') for l in ('_e', '_d'))
    ok = br < 0.3
    Vb, Wb = V[ok], W[ok]
    cz = base.J['quadril'][2] + 0.005 * k
    ys = np.linspace(y_topo, y_barra, aneis)
    th = np.linspace(-np.pi, np.pi, lados, endpoint=False)
    Rr = np.zeros((aneis, lados))
    ang_b = np.arctan2(Vb[:, 0], Vb[:, 2] - cz)
    rad_b = np.hypot(Vb[:, 0], Vb[:, 2] - cz)
    for i, y in enumerate(ys):
        sel = np.abs(Vb[:, 1] - y) < 0.02 * k
        a, r = ang_b[sel], rad_b[sel]
        for j, t in enumerate(th):
            d = np.abs((a - t + np.pi) % (2 * np.pi) - np.pi)
            m = d < (np.pi / lados) * 1.6
            Rr[i, j] = r[m].max() if m.any() else 0.0
        # casco convexo em ângulo (vão entre as pernas fica coberto)
        for _ in range(3):
            Rr[i] = np.maximum(Rr[i], 0.5 * (np.roll(Rr[i], 1) + np.roll(Rr[i], -1)) * 0.995)
    out = np.zeros_like(Rr)
    for i in range(aneis):
        prof = (ys[0] - ys[i]) / max(ys[0] - ys[-1], 1e-6)
        base_r = Rr[i] + (aperto_topo if i == 0 else folga * min(1.0, prof * 3 + 0.3))
        if i == 0:
            out[i] = base_r
        else:
            out[i] = np.maximum(base_r, out[i - 1]) + abre * k * (ys[i - 1] - ys[i]) / max(ys[0] - ys[-1], 1e-6) * prof * 2
    P = np.zeros((aneis, lados, 3))
    for i in range(aneis):
        P[i, :, 0] = np.sin(th) * out[i]
        P[i, :, 2] = cz + np.cos(th) * out[i]
        P[i, :, 1] = ys[i]
    # barra levemente ondulada
    P[-1, :, 1] += 0.006 * k * np.sin(3 * th + 0.7)
    Vs = P.reshape(-1, 3)
    # dentro (dobra da barra)
    Pin = P[-1] + np.c_[-np.sin(th) * 0.004, np.full(lados, barra_dentro), -np.cos(th) * 0.004]
    Vs = np.vstack([Vs, Pin])
    F, UV = [], []
    for i in range(aneis):
        for j in range(lados):
            jn = (j + 1) % lados
            if i < aneis - 1:
                a, b_, c, d = i * lados + j, i * lados + jn, (i + 1) * lados + jn, (i + 1) * lados + j
                v0, v1 = i / (aneis), (i + 1) / (aneis)
            else:
                a, b_, c, d = i * lados + j, i * lados + jn, aneis * lados + jn, aneis * lados + j
                v0, v1 = (aneis - 1) / aneis, 1.0
            u0, u1 = j / lados, (j + 1) / lados
            F += [[a, c, b_], [a, d, c]]
            UV += [[[u0, v0], [u1, v1], [u1, v0]], [[u0, v0], [u0, v1], [u1, v1]]]
    F = np.array(F)
    # orientação: normal para fora
    mm = M.Malha(Vs, F, na_regiao(np.array(UV), 'saia'), np.zeros((len(Vs), len(O.NOMES))))
    nf = mm.normais_faces()
    cen = Vs[F].mean(1)
    fora = np.c_[cen[:, 0], np.zeros(len(F)), cen[:, 2] - cz]
    if np.mean(np.einsum('ij,ij->i', nf[: (aneis - 1) * lados * 2], fora[: (aneis - 1) * lados * 2])) < 0:
        mm.F = mm.F[:, [0, 2, 1]]
        mm.UV = mm.UV[:, [0, 2, 1]]
    # pesos: pele mais próxima
    arv = cKDTree(Vb)
    d, idx = arv.query(Vs, k=10)
    w = 1.0 / np.maximum(d, 0.01) ** 2
    Ws = (Wb[idx] * w[..., None]).sum(1) / w.sum(1, keepdims=True)
    # suaviza em volta de cada anel
    Wr = Ws[:aneis * lados].reshape(aneis, lados, -1)
    for _ in range(4):
        Wr = 0.5 * Wr + 0.25 * (np.roll(Wr, 1, axis=1) + np.roll(Wr, -1, axis=1))
    Ws[:aneis * lados] = Wr.reshape(-1, Ws.shape[1])
    Ws[aneis * lados:] = Wr[-1]
    # a parte de cima segue o quadril (pesos da pele); descendo, as coxas vão tomando conta,
    # repartidas pelo ângulo em volta do corpo: na frente e atrás meio a meio (a saia vira um
    # colo quando a pessoa senta, em vez de as coxas atravessarem o tecido), nos lados a coxa
    # daquele lado.
    J = base.J
    y_q = 0.5 * (J['coxa_e'][1] + J['coxa_d'][1])
    comp_coxa = np.linalg.norm(J['canela_e'] - J['coxa_e'])
    desce = (y_q + 0.04 * k - Vs[:, 1]) / comp_coxa
    wc = 0.92 * np.clip((desce + 0.10) / 0.45, 0, 1) ** 1.3
    ang = np.arctan2(Vs[:, 0], Vs[:, 2] - cz)
    fe = np.clip(0.5 + 1.2 * np.sin(ang), 0, 1)
    Wc = np.zeros_like(Ws)
    Wc[:, I['coxa_e']] = fe
    Wc[:, I['coxa_d']] = 1 - fe
    # o que sobra fica com o quadril (sem coluna/peito, que dobram o tecido para trás)
    Wq = np.zeros_like(Ws)
    Wq[:, I['quadril']] = 1.0
    tq = np.clip((desce + 0.15) / 0.15, 0, 1)[:, None]
    Wtopo = (1 - tq) * Ws + tq * Wq
    # perto do joelho o tecido vai para a canela: sentada, a barra fica na frente dos joelhos
    # (cai entre eles) em vez de formar um tubo aberto que desce por baixo do assento
    y_j = 0.5 * (J['canela_e'][1] + J['canela_d'][1])
    wj = np.clip(1 - (Vs[:, 1] - y_j) / (0.16 * k), 0, 1) ** 1.5 * 0.85
    Wj = np.zeros_like(Ws)
    Wj[:, I['canela_e']] = fe
    Wj[:, I['canela_d']] = 1 - fe
    Wc = (1 - wj)[:, None] * Wc + wj[:, None] * Wj
    Ws = (1 - wc)[:, None] * Wtopo + wc[:, None] * Wc
    mm.W = O.limitar(Ws, 4)
    if mascara is not None:
        mm.A['mascara'] = np.tile(mascara, (len(Vs), 1))
    return mm
