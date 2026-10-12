"""Adereços da festa na piscina com churrasco."""
import math

import numpy as np

import base as B
from base import TAU

PALETA_CONFEITOS = np.array([(0.95, 0.85, 0.1), (0.1, 0.55, 0.9), (0.95, 0.95, 0.95), (0.2, 0.75, 0.3), (0.95, 0.4, 0.1), (0.6, 0.3, 0.85)])


def boia_rosquinha():
    """Boia de rosquinha: massa dourada, cobertura rosa com granulado colorido."""
    R, r = 0.36, 0.14
    pc = []
    base = B.toro('massa', R, r, nu=44, nv=16, mat='vinil_creme', centro=(0, 0, r))
    pc.append(base)
    # cobertura: pedaço do toro por cima, com beira ondulada (escorrida)
    rng = B.rng(3)
    nu = 64
    us = np.arange(nu) / nu * TAU
    f1, f2 = rng.uniform(0, TAU, 2)
    ext = -0.32 - 0.16 * (0.5 + 0.5 * np.sin(us * 7 + f1)) ** 2 - 0.08 * np.sin(us * 3 + f2)
    inn = math.pi + 0.28 + 0.12 * (0.5 + 0.5 * np.sin(us * 6 + f2)) ** 2
    nv = 12
    P = np.zeros((nv, nu, 3))
    for i in range(nv):
        t = i / (nv - 1)
        b = ext + (inn - ext) * t
        rr = r * 1.035
        # beiras arredondadas (a cobertura tem espessura)
        if i == 0 or i == nv - 1:
            rr = r * 1.004
        P[i, :, 0] = (R + rr * np.cos(b)) * np.cos(us)
        P[i, :, 1] = (R + rr * np.cos(b)) * np.sin(us)
        P[i, :, 2] = r + rr * np.sin(b)
    cob = B.grade('cobertura', P, fechar_u=True, mat='vinil_rosa', suave=True)
    pc.append(cob)
    # granulado (bastõezinhos coloridos)
    conf = []
    for k in range(70):
        u = rng.uniform(0, TAU)
        b = rng.uniform(0.15, math.pi - 0.2)
        rr = r * 1.04
        p = np.array([(R + rr * math.cos(b)) * math.cos(u), (R + rr * math.cos(b)) * math.sin(u), r + rr * math.sin(b)])
        nrm = np.array([math.cos(b) * math.cos(u), math.cos(b) * math.sin(u), math.sin(b)])
        c = B.caixa('conf', 0.008, 0.032, 0.007, mat='confeitos', chanfro=0.0025, seg=1, base=False)
        B.girar(c, (0, 0, rng.uniform(0, 180)))
        B.orientar(c, tuple(p), tuple(nrm), 0)
        B.definir_cores(c, PALETA_CONFEITOS[rng.integers(len(PALETA_CONFEITOS))])
        conf.append(c)
    pc.append(B.juntar('confeitos', conf))
    # válvula por baixo, do lado de dentro
    v = B.cilindro('valvula', 0.012, 0.016, n=10, mat='vinil_branco', chanfro=0.003)
    B.orientar(v, (R - r * 0.7, 0, r * 0.3), (-1, 0, -0.6))
    pc.append(v)
    return B.juntar('boia_rosquinha', pc)


def boia_colchao():
    """Colchão inflável de piscina com gomos, travesseiro e solda em volta."""
    L, W = 1.82, 0.72
    nx, nt = 66, 18
    xs = np.linspace(-L / 2, L / 2, nx)
    ts = np.arange(nt) / nt * TAU
    gomo = 0.165
    P = np.zeros((nx, nt, 3))
    for i, x in enumerate(xs):
        # pontas arredondadas
        d = (L / 2 - abs(x)) / 0.09
        fim = math.sqrt(max(0.0, min(1.0, d) * (2 - min(1.0, d)))) if d < 1 else 1.0
        trav = x > L / 2 - 0.36          # travesseiro na cabeceira (+X)
        hh = 0.065 if not trav else 0.098
        # vale das soldas entre gomos
        fase = ((x + L / 2 - 0.02) % gomo) / gomo
        vale = 1 - 0.28 * math.exp(-((fase - 0.0) / 0.12) ** 2) - 0.28 * math.exp(-((fase - 1.0) / 0.12) ** 2)
        if trav:
            vale = 1 - 0.25 * math.exp(-((x - (L / 2 - 0.36)) / 0.03) ** 2)
        w = W / 2 * (0.97 + 0.03 * vale) * fim ** 0.6
        h = hh * (0.55 + 0.45 * vale) * fim ** 0.5 + 0.004
        for j, t in enumerate(ts):
            c, s = math.cos(t), math.sin(t)
            y = w * np.sign(c) * abs(c) ** 0.45
            z = h * np.sign(s) * abs(s) ** 0.75
            P[i, j] = (x, y, z)
    # fecha as pontas
    P[0, :, 1:] *= 0.0
    P[-1, :, 1:] *= 0.0
    ob = B.grade('colchao', P, fechar_u=True, mat='vinil_azul', suave=True)
    # parte de baixo branca
    me = ob.data
    import materiais as M
    me.materials.append(M.material('vinil_branco'))
    cz = np.zeros(len(me.polygons) * 3)
    me.polygons.foreach_get('center', cz)
    cz = cz.reshape(-1, 3)
    idx = (cz[:, 2] < -0.004).astype(np.int32)
    me.polygons.foreach_set('material_index', idx)
    pc = [ob]
    # solda em volta (aba fina na meia altura)
    borda = []
    for i, x in enumerate(xs):
        borda.append(P[i, 0])
    for i, x in enumerate(xs[::-1]):
        borda.append(P[nx - 1 - i, nt // 2])
    borda = np.array(borda)
    # aba: tira plana horizontal para fora
    aba = []
    c = borda.mean(axis=0)
    for p in borda:
        d = p[:2] - c[:2]
        d = d / (np.linalg.norm(d) + 1e-9)
        aba.append([p, p + np.array([d[0] * 0.012, d[1] * 0.012, 0])])
    aba = np.array(aba).transpose(1, 0, 2)
    ab = B.grade('aba', aba, fechar_u=True, mat='vinil_branco', suave=True)
    pc.append(ab)
    v = B.cilindro('valvula', 0.012, 0.02, n=10, mat='vinil_branco', chanfro=0.004)
    B.mover(v, (L / 2 - 0.18, W * 0.3, 0.085))
    pc.append(v)
    ob = B.juntar('boia_colchao', pc)
    vv = B.verts(ob)
    B.mover(ob, (0, 0, -vv[:, 2].min()))
    B.girar(ob, (0, 0, 90))      # comprimento em Y (cabeceira para +Y = -Z no glTF)
    return ob


def boia_flamingo():
    """Boia de flamingo (genérica): anel do corpo, asas, rabo, pescoço em S, cabeça e bico."""
    pc = []
    # corpo: anel oval com o tubo mais grosso atrás
    nu, nv = 44, 14
    us = np.arange(nu) / nu * TAU
    vs = np.arange(nv) / nv * TAU
    P = np.zeros((nu, nv, 3))
    for i, u in enumerate(us):
        cx, cy = 0.5 * math.cos(u), 0.55 * math.sin(u)
        atras = max(0.0, math.sin(u))           # +Y = traseira (rabo)
        r = 0.17 + 0.04 * atras ** 2
        nrm = np.array([math.cos(u) / 0.5, math.sin(u) / 0.55, 0])
        nrm /= np.linalg.norm(nrm)
        for j, v in enumerate(vs):
            P[i, j] = (cx + nrm[0] * r * math.cos(v), cy + nrm[1] * r * math.cos(v), r * math.sin(v) * 0.92)
    corpo = B.grade('corpo', P, fechar_u=True, fechar_v=True, mat='vinil_flamingo', suave=True, inverter=True)
    B.mover(corpo, (0, 0, 0.17))
    pc.append(corpo)
    # rabo: cunha inflada que sobe atrás
    rabo = B.esfera('rabo', 0.2, nu=16, nv=10, mat='vinil_flamingo', esc=(1.0, 0.75, 1.1))
    B.deformar(rabo, lambda v: np.column_stack([v[:, 0] * (1 - 0.6 * np.clip(v[:, 2] / 0.22, 0, 1)), v[:, 1] + 0.25 * np.clip(v[:, 2] / 0.22, 0, 1) * 0.3, v[:, 2]]))
    B.girar(rabo, (-35, 0, 0))
    B.mover(rabo, (0, 0.55, 0.36))
    pc.append(rabo)
    # asas: lóbulos achatados nos lados, levantados para trás
    for sx in (-1, 1):
        a = B.esfera('asa', 0.25, nu=16, nv=8, mat='vinil_flamingo', esc=(0.45, 1.0, 0.22))
        B.deformar(a, lambda v: np.column_stack([v[:, 0], v[:, 1], v[:, 2] + 0.12 * np.clip(v[:, 1] / 0.25, -1, 1) ** 2 * (v[:, 1] > 0)]))
        B.girar(a, (12, sx * -18, sx * -12))
        B.mover(a, (sx * 0.58, 0.12, 0.3))
        pc.append(a)
    # pescoço em S saindo da frente (-Y)
    t = np.linspace(0, 1, 24)
    y = -0.5 - 0.08 * np.sin(t * math.pi) + 0.16 * t ** 2
    z = 0.28 + 0.95 * t
    y = y - 0.1 * np.sin(t * TAU) * (1 - t)
    pesc = np.column_stack([np.zeros_like(t), y, z])
    raio = 0.1 - 0.035 * t + 0.025 * np.exp(-((t - 0.0) / 0.1) ** 2)
    pc.append(B.tubo('pescoco', pesc, raio, n=12, mat='vinil_flamingo'))
    topo = pesc[-1]
    cab = B.esfera('cabeca', 0.09, nu=14, nv=10, mat='vinil_flamingo', esc=(0.85, 1.15, 0.95), centro=tuple(topo + np.array([0, -0.03, 0.04])))
    pc.append(cab)
    # bico: branco e ponta preta, curvado para baixo, apontando para a frente
    s = np.linspace(0, 1, 8)
    bico = np.column_stack([np.zeros_like(s), topo[1] - 0.09 - 0.17 * s, topo[2] + 0.03 - 0.12 * s ** 1.6])
    rb = 0.042 * (1 - s) ** 0.8 + 0.006
    b1 = B.tubo('bico', bico[:5], rb[:5], n=10, mat='vinil_branco', tampas=False)
    b2 = B.tubo('ponta', bico[4:], rb[4:], n=10, mat='bico_preto')
    pc += [b1, b2]
    for sx in (-1, 1):
        o = B.esfera('olho', 0.022, nu=10, nv=6, mat='vinil_branco', esc=(0.4, 1, 1), centro=(sx * 0.072, topo[1] - 0.06, topo[2] + 0.07))
        p = B.esfera('pupila', 0.011, nu=8, nv=5, mat='bico_preto', esc=(0.4, 1, 1), centro=(sx * 0.08, topo[1] - 0.066, topo[2] + 0.072))
        pc += [o, p]
    return B.juntar('boia_flamingo', pc)


def bola_praia():
    """Bola de praia de vinil (Ø 0,5 m) com seis gomos coloridos e tampas brancas."""
    r = 0.25
    cores = ['vinil_vermelho', 'vinil_amarelo', 'vinil_azul', 'vinil_branco', 'vinil_verde', 'vinil_laranja']
    pc = []
    lat = np.linspace(-math.pi / 2 + 0.33, math.pi / 2 - 0.33, 11)
    for k in range(6):
        a0, a1 = k / 6 * TAU, (k + 1) / 6 * TAU
        perfil = [(r * math.cos(t), r * math.sin(t)) for t in lat]
        g = B.torno('gomo', perfil, n=5, a0=a0, a1=a1, mat=cores[k], suave=True)
        # gomo levemente estufado no meio
        B.deformar(g, lambda v, a0=a0, a1=a1: v * (1 + 0.025 * np.sin((((np.arctan2(v[:, 1], v[:, 0]) - a0) % TAU) / (a1 - a0)) * math.pi))[:, None])
        pc.append(g)
    for s in (-1, 1):
        lat2 = np.linspace(math.pi / 2 - 0.33, math.pi / 2, 4)
        perfil = [(r * math.cos(t), s * r * math.sin(t)) for t in lat2]
        if s < 0:
            perfil = perfil[::-1]
        perfil = [p if abs(p[0]) > 1e-6 else (0.0, p[1]) for p in perfil]
        pc.append(B.torno('tampa', perfil, n=30, mat='vinil_branco', suave=True))
    pc.append(B.cilindro('valvula', 0.008, 0.012, n=8, mat='vinil_branco', chanfro=0.003, centro=(r * 0.98, 0, 0)))
    B.girar(pc[-1], (0, 90, 0), centro=(r * 0.98, 0, 0))
    ob = B.juntar('bola_praia', pc)
    B.girar(ob, (70, 0, 20))
    B.mover(ob, (0, 0, r))
    return ob


def guarda_sol():
    """Guarda-sol de piscina aberto (~2,4 m), oito gomos brancos e azuis com babado, base redonda."""
    pc = []
    H = 2.4
    R = 1.12
    zh = 2.3          # cubo das varetas
    ze = 1.96         # beira da lona
    n_gom = 8
    cols = 6
    linhas = 7
    for k in range(n_gom):
        a0 = k / n_gom * TAU
        P = np.zeros((linhas, cols + 1, 3))
        for i in range(linhas):
            s = i / (linhas - 1)
            for j in range(cols + 1):
                u = j / cols
                a = a0 + u * TAU / n_gom
                # entre varetas a lona cede (mais na beira)
                ced = math.sin(u * math.pi) * (0.05 * s ** 1.2)
                rr = (0.03 + (R - 0.03) * s) * (1 - 0.03 * math.sin(u * math.pi) * s)
                z = zh + 0.06 - (zh + 0.06 - ze) * s ** 1.15 - ced + 0.04 * math.sin(s * math.pi) * 0
                # perfil levemente abaulado
                z += 0.08 * math.sin(s * math.pi * 0.9) * (1 - 0.3 * math.sin(u * math.pi))
                P[i, j] = (rr * math.cos(a), rr * math.sin(a), z)
        mat = 'lona_branca' if k % 2 == 0 else 'lona_azul'
        pc.append(B.grade('gomo', P, mat=mat, suave=True, inverter=True))
        # babado recortado (dois arcos por gomo)
        Q = np.zeros((2, cols + 1, 3))
        for j in range(cols + 1):
            u = j / cols
            a = a0 + u * TAU / n_gom
            Q[0, j] = P[-1, j]
            rr = np.hypot(P[-1, j, 0], P[-1, j, 1]) + 0.004
            q = 0.11 - 0.035 * abs(math.sin(u * TAU))
            Q[1, j] = (rr * math.cos(a), rr * math.sin(a), P[-1, j, 2] - q)
        pc.append(B.grade('babado', Q, mat=mat, suave=True, inverter=True))
        # vareta por baixo
        a = a0
        vt = []
        for i in range(linhas):
            vt.append(P[i, 0] - np.array([0, 0, 0.012]))
        pc.append(B.tubo('vareta', np.array(vt), 0.0055, n=5, mat='aluminio'))
        # tirante (do corredor no mastro até o meio da vareta)
        pc.append(B.tubo('tirante', [(0.025 * math.cos(a), 0.025 * math.sin(a), 1.82), tuple(P[3, 0] - np.array([0, 0, 0.015]))], 0.004, n=5, mat='aluminio'))
    # mastro, cubo, ponteira, corredor e base
    pc.append(B.cilindro('mastro', 0.019, zh + 0.04, n=14, mat='aluminio'))
    pc.append(B.cilindro('cubo', 0.04, 0.05, n=14, mat='plastico_branco', chanfro=0.008, centro=(0, 0, zh - 0.03)))
    pc.append(B.cilindro('corredor', 0.033, 0.07, n=14, mat='plastico_branco', chanfro=0.008, centro=(0, 0, 1.79)))
    tampa = B.torno('ponteira', [(0, zh + 0.06), (0.1, zh + 0.05), (0.09, zh + 0.07), (0.03, zh + 0.1), (0.012, H - 0.01), (0, H)], n=16, mat='lona_azul', suave=45)
    pc.append(tampa)
    pc.append(B.torno('base', [(0, 0), (0.24, 0), (0.25, 0.012), (0.24, 0.05), (0.16, 0.075), (0.05, 0.085), (0.045, 0.2), (0, 0.2)], n=32, mat='base_concreto', suave=40))
    pc.append(B.cilindro('borboleta', 0.03, 0.04, n=10, mat='plastico_preto', chanfro=0.005, centro=(0.05, 0, 0.14)))
    B.girar(pc[-1], (0, 90, 0), centro=(0.05, 0, 0.16))
    return B.juntar('guarda_sol', pc)


def espreguicadeira():
    """Espreguiçadeira de madeira (cumaru) com encosto levantado e rodinhas na cabeceira."""
    pc = []
    L, Wd = 1.95, 0.66
    zt = 0.34
    yf, yb = -L / 2, L / 2
    yh = 0.32                 # dobradiça do encosto
    # longarinas laterais
    for sx in (-1, 1):
        pc.append(B.caixa('long', 0.035, L, 0.1, mat='madeira_cumaru', chanfro=0.006, seg=2, centro=(sx * (Wd / 2 - 0.0175), 0, zt - 0.1)))
        # pés da frente e rodas atrás
        pc.append(B.caixa('pe', 0.05, 0.06, zt - 0.1, mat='madeira_cumaru', chanfro=0.005, seg=1, centro=(sx * (Wd / 2 - 0.06), yf + 0.08, 0)))
        roda = B.cilindro('roda', 0.075, 0.03, n=20, mat='borracha', chanfro=0.006)
        B.girar(roda, (0, 90, 0))
        B.mover(roda, (sx * (Wd / 2 + 0.003) - (0.03 if sx > 0 else 0), yb - 0.1, 0.075))
        pc.append(roda)
        pc.append(B.caixa('apoio_roda', 0.035, 0.12, 0.17, mat='madeira_cumaru', chanfro=0.005, seg=1, centro=(sx * (Wd / 2 - 0.0175), yb - 0.1, 0.075)))
    for y in (yf + 0.08, yb - 0.25):
        pc.append(B.caixa('trav', Wd - 0.07, 0.05, 0.05, mat='madeira_cumaru', chanfro=0.004, seg=1, centro=(0, y, zt - 0.1)))
    # ripas do assento
    n = 15
    for k in range(n):
        y = yf + 0.06 + k * (yh - yf - 0.08) / (n - 1)
        pc.append(B.caixa('ripa', Wd - 0.03, 0.058, 0.02, mat='madeira_cumaru', chanfro=0.004, seg=1, centro=(0, y, zt)))
    # encosto inclinado (~50°) sobre dois montantes
    ang = 50
    Le = 0.78
    enc = []
    for sx in (-1, 1):
        enc.append(B.caixa('mont', 0.032, Le, 0.035, mat='madeira_cumaru', chanfro=0.005, seg=1, centro=(sx * (Wd / 2 - 0.07), Le / 2, -0.035)))
    for k in range(10):
        y = 0.04 + k * (Le - 0.08) / 9
        enc.append(B.caixa('ripa_e', Wd - 0.11, 0.058, 0.02, mat='madeira_cumaru', chanfro=0.004, seg=1, centro=(0, y, 0)))
    encosto = B.juntar('encosto', enc)
    B.girar(encosto, (ang, 0, 0))
    B.mover(encosto, (0, yh, zt + 0.0))
    pc.append(encosto)
    # escora do encosto
    for sx in (-1, 1):
        pc.append(B.caixa('escora', 0.025, 0.035, 0.42, mat='madeira_cumaru', chanfro=0.004, seg=1, centro=(sx * (Wd / 2 - 0.1), 0.0, 0.0)))
        B.girar(pc[-1], (-28, 0, 0))
        B.mover(pc[-1], (0, yh + 0.47, zt - 0.06))
    return B.juntar('espreguicadeira', pc)


def toalha():
    """Toalha de praia listrada, dobrada em três (pilha macia)."""
    pc = []
    Lx, Ly = 0.36, 0.24
    cam = 3
    e = 0.022
    for k in range(cam):
        c = B.caixa('camada', Lx, Ly, e, mat='toalha_listrada', chanfro=0.0105, seg=3, centro=(0.004 * (k % 2), 0.003 * k, k * (e - 0.002)))
        B.deformar(c, lambda v, k=k: v + np.column_stack([np.zeros(len(v)), np.zeros(len(v)), 0.003 * B.ruido3(v, 18, k) * (v[:, 2] > k * (e - 0.002) + 0.004)]))
        B.uv_projetar(c, tile=0.36)
        pc.append(c)
    return B.juntar('toalha', pc)


def caixa_som():
    """Caixa de som portátil de festa: corpo preto, grade, anel de LED em volta do alto-falante e alça em cima."""
    pc = []
    W, D, H = 0.3, 0.26, 0.52
    corpo = B.caixa('corpo', W, D, H, mat='plastico_preto', chanfro=0.04, seg=3, centro=(0, 0, 0.012))
    pc.append(corpo)
    # grade na frente (-Y)
    g = B.caixa('grade', W - 0.05, 0.01, H - 0.09, mat='grelha_som', chanfro=0.008, seg=2, centro=(0, -D / 2 + 0.002, 0.045))
    B.uv_projetar(g, tile=0.032)
    pc.append(g)
    # anéis de LED (alto-falante grande e o de agudos)
    for (z, R, r) in ((0.2, 0.095, 0.007), (0.41, 0.042, 0.005)):
        a = B.toro('led', R, r, nu=40, nv=6, mat='led_som')
        B.girar(a, (90, 0, 0))
        B.mover(a, (0, -D / 2 - 0.005, z))
        pc.append(a)
        moldura = B.toro('moldura', R + r + 0.004, 0.004, nu=40, nv=5, mat='plastico_preto')
        B.girar(moldura, (90, 0, 0))
        B.mover(moldura, (0, -D / 2 - 0.004, z))
        pc.append(moldura)
    # alça em cima
    pc.append(B.tubo('alca', [(-0.1, 0.0, H + 0.0), (-0.09, 0.0, H + 0.05), (0.09, 0.0, H + 0.05), (0.1, 0.0, H + 0.0)], 0.016, n=10, mat='plastico_preto_fosco'))
    # painel de botões
    pc.append(B.caixa('painel', 0.16, 0.05, 0.004, mat='plastico_cinza', chanfro=0.002, seg=1, centro=(0, -0.08, H + 0.01)))
    for k in range(5):
        pc.append(B.cilindro('botao', 0.007, 0.004, n=10, mat='plastico_preto', centro=(-0.06 + k * 0.03, -0.08, H + 0.013)))
    # pés
    for sx in (-1, 1):
        for sy in (-1, 1):
            pc.append(B.cilindro('pe', 0.018, 0.012, n=10, mat='borracha', chanfro=0.003, centro=(sx * 0.1, sy * 0.08, 0)))
    return B.juntar('caixa_som', pc)


def lata():
    """Lata de bebida de 350 ml, sem marca: pintura de uma cor com faixa clara; origem na mão."""
    h = 0.122
    r = 0.033
    pc = []
    pc.append(B.torno('fundo', [(0, 0.008), (0.022, 0.003), (0.026, 0.0), (0.029, 0.002), (r, 0.012)], n=22, mat='lata_aluminio', suave=40))
    pc.append(B.torno('corpo1', [(r, 0.012), (r, 0.055)], n=22, mat='lata_pintura', suave=True))
    pc.append(B.torno('faixa', [(r, 0.055), (r, 0.068)], n=22, mat='lata_faixa', suave=True))
    pc.append(B.torno('corpo2', [(r, 0.068), (r, 0.106)], n=22, mat='lata_pintura', suave=True))
    pc.append(B.torno('ombro', [(r, 0.106), (0.031, 0.112), (0.027, 0.118), (0.027, 0.121), (0.0285, h), (0.026, h + 0.0005),
                                (0.025, h - 0.006), (0, h - 0.006)], n=22, mat='lata_aluminio', suave=40))
    # anel de abrir
    anel = B.caixa('anel', 0.012, 0.024, 0.0012, mat='lata_aluminio', chanfro=0.0005, seg=1, centro=(0, 0.004, h - 0.0055))
    pc.append(anel)
    ob = B.juntar('lata', pc)
    B.mover(ob, (0, 0, -0.06))
    B.vazio('apoio', (0, 0, -0.06), pai=ob)
    return ob


def copo_drink():
    """Copo longo de vidro com drinque de laranja, gelo, canudo e rodela de fruta; origem na mão."""
    pc = []
    h = 0.15
    r0, r1 = 0.032, 0.036
    fora = B.torno('vidro_f', [(0, 0), (r0, 0), (r0 + 0.001, 0.003), (r1, h)], n=18, mat='vidro', suave=40)
    dentro = B.torno('vidro_d', [(r1 - 0.0025, h), (r0 - 0.0025, 0.016), (0, 0.016)], n=18, mat='vidro', suave=40)
    borda = B.toro('borda', r1 - 0.00125, 0.00125, nu=18, nv=4, mat='vidro', centro=(0, 0, h))
    pc += [fora, dentro, borda]
    liq = B.torno('drinque', [(0, 0.0165), (r0 - 0.003, 0.0165), (r0 + (r1 - r0) * 0.8 - 0.003, 0.12), (0, 0.12)], n=18, mat='bebida_laranja', suave=40)
    pc.append(liq)
    rng = B.rng(9)
    for k, (x, y, z) in enumerate(((-0.008, 0.006, 0.112), (0.012, -0.006, 0.108), (0.0, -0.01, 0.085))):
        c = B.caixa('gelo', 0.024, 0.024, 0.022, mat='gelo', chanfro=0.004, seg=1, base=False)
        B.girar(c, tuple(rng.uniform(-25, 25, 3)))
        B.mover(c, (x, y, z))
        pc.append(c)
    # canudo inclinado
    pc.append(B.tubo('canudo', [(0.006, 0.004, 0.02), (-0.03, 0.012, 0.215)], 0.0032, n=8, mat='canudo', tampas=False))
    # rodela de laranja/limão encaixada na borda
    rod = B.cilindro('rodela', 0.028, 0.007, n=20, mat='limao_casca', chanfro=0.002)
    polpa = []
    for s in (-1, 1):
        p = B.cilindro('polpa', 0.026, 0.0008, n=20, mat='limao_polpa', centro=(0, 0, 0.0035 + s * 0.0032 - 0.0004))
        polpa.append(p)
    rodela = B.juntar('rodela', [rod] + polpa)
    B.mover(rodela, (0, 0, -0.0035))
    B.girar(rodela, (90, 0, 25))
    B.mover(rodela, (0.026, -0.012, h + 0.008))
    pc.append(rodela)
    ob = B.juntar('copo_drink', pc)
    B.mover(ob, (0, 0, -0.07))
    B.vazio('apoio', (0, 0, -0.07), pai=ob)
    return ob


def _espeto(L, cabo=0.13, chato=True):
    """Espeto: cabo de madeira (origem no meio do cabo) e lâmina de aço ao longo de +Z."""
    pc = []
    pc.append(B.cilindro('cabo', 0.016, cabo, n=12, mat='madeira_escura', chanfro=0.005, centro=(0, 0, -cabo / 2), r2=0.014))
    pc.append(B.cilindro('virola', 0.0155, 0.02, n=12, mat='aco_inox', chanfro=0.002, centro=(0, 0, cabo / 2 - 0.004)))
    if chato:
        lam = B.caixa('lamina', 0.012, 0.003, L, mat='aco_inox', chanfro=0.001, seg=1, centro=(0, 0, cabo / 2 + 0.01))
        B.deformar(lam, lambda v: np.column_stack([v[:, 0] * np.clip((cabo / 2 + 0.01 + L - v[:, 2]) / 0.04, 0.1, 1), v[:, 1], v[:, 2]]))
    else:
        lam = B.cilindro('vara', 0.0035, L, n=8, mat='aco_inox', centro=(0, 0, cabo / 2 + 0.01))
    pc.append(lam)
    return pc


def _tostado(ob, base, semente, marcas=True):
    v = B.verts(ob)
    k = 0.75 + 0.25 * B.ruido3(v, 80, semente)[:, None]
    cor = np.array(base) * k
    if marcas:
        listra = (np.sin(v[:, 2] * 260 + v[:, 0] * 120) > 0.75)[:, None]
        cor = np.where(listra, cor * 0.45, cor)
    B.definir_cores(ob, np.clip(cor, 0, 1))
    return ob


def _secao_arredondada(a, b, n=10, k=0.35):
    """Contorno de "retângulo inflado" (superelipse) com meias medidas a (N) e b (B)."""
    t = np.arange(n) / n * TAU
    c, s = np.cos(t), np.sin(t)
    return np.column_stack([a * np.sign(c) * np.abs(c) ** k, b * np.sign(s) * np.abs(s) ** k])


def espeto_carne():
    """Espeto de picanha: três fatias grossas dobradas em C, tostadas, com a capa de gordura para fora."""
    pc = _espeto(0.62)
    rng = B.rng(31)
    for k, z in enumerate((0.31, 0.445, 0.58)):
        ang = np.linspace(-math.pi / 2 - 0.35, math.pi / 2 + 0.35, 12)
        Rc = 0.036
        arco = np.column_stack([Rc * np.cos(ang) + 0.004, np.zeros_like(ang), z + Rc * np.sin(ang) * 1.08])
        # espessura que afina nas pontas (onde o espeto atravessa)
        u = np.linspace(-1, 1, len(ang))
        fator = 0.75 + 0.25 * np.cos(u * math.pi / 2)
        sec = _secao_arredondada(0.5, 0.95, n=8, k=0.4)
        P = []
        T, N, Bv = B.quadros_transporte(arco, (0, 0, 1))
        for i in range(len(arco)):
            P.append([arco[i] + 0.034 * fator[i] * (pn * N[i] + pb * Bv[i]) for pn, pb in sec])
        carne = B.grade('carne', np.array(P), fechar_u=True, tampa_ini=True, tampa_fim=True, mat='carne_tostada', suave=True)
        _tostado(carne, (0.15, 0.055, 0.022), k)
        # capa de gordura do lado de fora da dobra
        sec_g = [(-0.5 - 0.22 * math.cos(t), 0.85 * math.sin(t)) for t in np.linspace(-math.pi / 2, math.pi / 2, 7)]
        sec_g = np.array(sec_g)
        sec_g = np.vstack([sec_g, sec_g[::-1][1:-1] * np.array([0, 1]) + np.array([-0.45, 0])])
        G = []
        for i in range(len(arco)):
            G.append([arco[i] + 0.034 * fator[i] * (pn * N[i] + pb * Bv[i]) for pn, pb in sec_g])
        gord = B.grade('gordura', np.array(G), fechar_u=True, tampa_ini=True, tampa_fim=True, mat='gordura_tostada', suave=True)
        _tostado(gord, (0.82, 0.55, 0.22), k + 7)
        peca = B.juntar('peca', [carne, gord])
        c = np.array([0.03, 0.0, z])
        B.deformar(peca, lambda v, k=k, c=c: c + (v - c) * (1 + 0.07 * B.ruido3(v, 40, k))[:, None])
        B.girar(peca, (0, 0, rng.uniform(-12, 12)), centro=(0, 0, z))
        pc.append(peca)
    return B.juntar('espeto_carne', pc)


def espeto_linguica():
    """Espeto com quatro linguiças atravessadas pelo meio, douradas da grelha."""
    pc = _espeto(0.6, chato=False)
    rng = B.rng(14)
    for k, z in enumerate((0.25, 0.34, 0.43, 0.52)):
        L = 0.13
        t = np.linspace(-0.5, 0.5, 12)
        pts = np.column_stack([t * L, 0.012 * np.cos(t * math.pi) * 0, z + 0.015 * (1 - (2 * t) ** 2) + rng.uniform(-0.004, 0.004)])
        raio = 0.016 * np.clip(1 - (2 * np.abs(t)) ** 8, 0.12, 1) ** 0.4
        lg = B.tubo('linguica', pts, raio, n=10, mat='linguica', suave=True)
        _tostado(lg, (0.36, 0.13, 0.05), k + 20)
        B.girar(lg, (0, 0, rng.uniform(-15, 15) + 90 * (k % 2) * 0), centro=(0, 0, z))
        pc.append(lg)
    return B.juntar('espeto_linguica', pc)


def _fatia(rng, k):
    """Fatia de picanha (contorno no plano XZ, espessura em Y): miolo rosado, borda tostada e capa de gordura."""
    contorno = []
    for t in np.linspace(0, math.pi, 12):
        contorno.append((0.052 * math.cos(t), 0.004 + 0.036 * math.sin(t) ** 0.8))
    c = np.array(contorno)
    n = len(c)
    e = 0.013 * rng.uniform(0.9, 1.1)
    centro = np.array([0.0, 0.016])
    dentro = centro + (c - centro) * 0.6
    partes = []
    for lado in (-1, 1):
        y = lado * e / 2
        vs = [(centro[0], y, centro[1])] + [(x, y, z) for x, z in dentro] + [(x, y, z) for x, z in c]
        fs = []
        for i in range(n - 1):
            fs.append([0, 1 + i, 2 + i])
            fs.append([1 + i, 1 + n + i, 2 + n + i, 2 + i])
        fs.append([0, n, 1])
        fs.append([n, 2 * n, 1 + n, 1])
        if lado > 0:
            fs = [f[::-1] for f in fs]
        f = B.malha('corte', vs, fs, mat='carne_ponto', suave=True)
        rosa = np.array([1.0, 1.0, 1.0])
        borda = np.array([0.3, 0.17, 0.12])
        cores = np.array([rosa] * (1 + n) + [borda] * n)
        B.definir_cores(f, cores)
        partes.append(f)
    verts = [(x, -e / 2, z) for x, z in c] + [(x, e / 2, z) for x, z in c]
    lados = B.malha('lado', verts, [[i, (i + 1) % n, n + (i + 1) % n, n + i] for i in range(n)], mat='carne_tostada', suave=None)
    _tostado(lados, (0.15, 0.055, 0.022), k, marcas=False)
    partes.append(lados)
    gord = B.caixa('gord', 0.106, e * 1.02, 0.008, mat='gordura_tostada', chanfro=0.0028, seg=1, centro=(0, 0, -0.004))
    B.definir_cores(gord, (0.95, 0.85, 0.7))
    partes.append(gord)
    fa = B.juntar('fatia', partes)
    B.suavizar(fa, 40)
    return fa


def travessa_carne():
    """Tábua de madeira com picanha fatiada em leque (fatias em pé, encostadas umas nas outras)."""
    pc = []
    tab = B.caixa('tabua', 0.42, 0.27, 0.024, mat='madeira_tabua', chanfro=0.008, seg=2)
    pc.append(tab)
    pega = B.caixa('pega', 0.09, 0.08, 0.024, mat='madeira_tabua', chanfro=0.008, seg=2, centro=(0.24, 0, 0))
    pc.append(pega)
    pc.append(B.cilindro('furo', 0.016, 0.026, n=14, mat='madeira_escura', centro=(0.255, 0, -0.001)))
    rng = B.rng(2)
    for k in range(9):
        f = _fatia(rng, k)
        B.girar(f, (180, 0, 0))           # capa de gordura em cima, atrás
        B.girar(f, (-62 + rng.uniform(-6, 6), rng.uniform(-4, 4), 0))
        B.mover(f, (-0.03 + 0.004 * k + rng.uniform(-0.004, 0.004), -0.1 + k * 0.024, 0.024 + 0.036))
        B.girar(f, (0, 0, -14 + k * 3.5 + rng.uniform(-3, 3)), centro=(0.05, -0.1, 0))
        pc.append(f)
    ob = B.juntar('travessa_carne', pc)
    v = B.verts(ob)
    B.mover(ob, (-(v[:, 0].min() + v[:, 0].max()) / 2, 0, -v[:, 2].min()))
    return ob


def pegador():
    """Pegador de churrasco de inox (~0,33 m), aberto; origem na mão, pontas em +Y (glTF)."""
    pc = []
    z0, z1 = -0.1, 0.23
    for s in (-1, 1):
        t = np.linspace(0, 1, 10)
        x = s * (0.006 + 0.03 * t ** 1.3)
        z = z0 + (z1 - z0) * t
        pts = np.column_stack([x, np.zeros_like(t), z])
        pc.append(B.fita('braco', pts, 0.019 - 0.004 * t, espessura=0.0016, mat='aco_inox', cima=(0, 0, 1) if False else None, normal0=(1, 0, 0)))
        # ponta em concha (serrilhada)
        cs = B.caixa('concha', 0.0016, 0.026, 0.045, mat='aco_inox', chanfro=0.0006, seg=1, centro=(s * 0.0375, 0, z1 - 0.005))
        B.deformar(cs, lambda v, s=s: np.column_stack([v[:, 0] + s * 0.004 * np.sin(np.clip((v[:, 1]) / 0.013, -1, 1) * math.pi / 2) ** 2 * -1, v[:, 1], v[:, 2]]))
        pc.append(cs)
        # capa de silicone preta no cabo
        pc.append(B.caixa('capa', 0.004, 0.021, 0.09, mat='borracha', chanfro=0.0015, seg=1, centro=(s * 0.009, 0, -0.08)))
    # mola/argola na ponta de trás
    t = np.linspace(-math.pi / 2, math.pi / 2, 10)
    arg = np.column_stack([0.009 * np.sin(t), np.zeros_like(t), z0 - 0.012 * np.cos(t) + 0.0])
    pc.append(B.tubo('argola', arg, 0.0026, n=6, mat='aco_inox'))
    return B.juntar('pegador', pc)


ADERECOS = [
    ('boia_rosquinha', boia_rosquinha, 'Boia de rosquinha (Ø ~1,0 m): massa dourada e cobertura rosa com granulado colorido.',
     'origem embaixo, no centro; na água, a linha d\'água fica por volta de y = 0,08'),
    ('boia_colchao', boia_colchao, 'Colchão inflável de piscina (1,8 x 0,7 m) azul por cima e branco por baixo, com gomos e travesseiro.',
     'travesseiro (cabeceira) do lado -Z'),
    ('boia_flamingo', boia_flamingo, 'Boia genérica em forma de flamingo rosa (~1,3 m de altura): anel do corpo, asas, rabo e pescoço com cabeça.',
     'a cabeça olha para +Z'),
    ('bola_praia', bola_praia, 'Bola de praia de vinil (Ø 0,5 m) com seis gomos coloridos e tampas brancas.'),
    ('guarda_sol', guarda_sol, 'Guarda-sol aberto de 2,4 m (Ø 2,2 m), gomos brancos e azuis com babado, base redonda.'),
    ('espreguicadeira', espreguicadeira, 'Espreguiçadeira de madeira (1,95 x 0,66 m) com encosto levantado e rodinhas na cabeceira.',
     'os pés de quem deita ficam para +Z, o encosto em -Z'),
    ('toalha', toalha, 'Toalha de praia listrada (azul, laranja e branco) dobrada.'),
    ('caixa_som', caixa_som, 'Caixa de som portátil de festa (~0,57 m) com grade, alça e anéis de LED em volta dos alto-falantes.',
     'o alto-falante olha para +Z; anéis em led_som (emissivo)'),
    ('lata', lata, 'Lata de bebida de 350 ml, sem marca (vermelha com faixa clara).',
     'origem no ponto da mão (meio da lata), eixo +Y; filho apoio no fundo; a cor está no material lata_pintura'),
    ('copo_drink', copo_drink, 'Copo longo de vidro com drinque de laranja, gelo, canudo e rodela de fruta na borda.',
     'origem no ponto da mão, eixo +Y; filho apoio no fundo; vidro, gelo e bebida com mistura (BLEND)'),
    ('espeto_carne', espeto_carne, 'Espeto de picanha: três fatias dobradas em C, tostadas, com a capa de gordura para fora.',
     'origem no meio do cabo (mão), espeto ao longo de +Y'),
    ('espeto_linguica', espeto_linguica, 'Espeto com quatro linguiças douradas da grelha.',
     'origem no meio do cabo (mão), espeto ao longo de +Y'),
    ('travessa_carne', travessa_carne, 'Tábua de madeira com picanha fatiada em leque.'),
    ('pegador', pegador, 'Pegador de churrasco de inox com capa preta no cabo.',
     'origem no ponto da mão, pontas em +Y'),
]
