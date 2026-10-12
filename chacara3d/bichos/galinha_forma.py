"""Anatomia da galinha caipira e do galo: juntas, volumes do corpo (SDF) e as peças
feitas à mão por código (pernas, dedos, asas, cauda, foices, capa do pescoço,
crista, barbelas, bico e olhos).

Mesmas coordenadas do cachorro: (f, l, u) = (frente, esquerda, cima), e no
Blender (x, y, z) = (l, -f, u).
"""
import numpy as np
from sdf import Forma, Elipsoide, Cone, base_de, normalizar, rot_x


def P(f, l, u):
    return np.array([l, -f, u], dtype=float)


def inclina(graus):
    return rot_x(-graus)


def suave(a, b, x):
    t = np.clip((np.asarray(x, dtype=float) - a) / (b - a), 0.0, 1.0)
    return t * t * (3 - 2 * t)


# ---------------------------------------------------------------------------
# medidas das duas aves
# ---------------------------------------------------------------------------
GALINHA = dict(
    nome='galinha',
    juntas={
        'corpo': (-0.030, 0.0, 0.226), 'corpo_frente': (0.050, 0.0, 0.250),
        'pescoco_0': (0.010, 0.0, 0.245), 'pescoco_1': (0.062, 0.0, 0.262), 'pescoco_2': (0.058, 0.0, 0.306),
        'forma_pescoco_0': (0.052, 0.0, 0.262), 'forma_pescoco_1': (0.066, 0.0, 0.294),
        'forma_pescoco_2': (0.076, 0.0, 0.322),
        'cabeca': (0.084, 0.0, 0.346), 'bico_ponta': (0.140, 0.0, 0.342),
        'mandibula': (0.112, 0.0, 0.340), 'mandibula_ponta': (0.135, 0.0, 0.338),
        'cauda': (-0.124, 0.0, 0.286), 'cauda_meio': (-0.157, 0.0, 0.318), 'cauda_fim': (-0.190, 0.0, 0.352),
        'ombro': (0.030, 0.058, 0.256), 'pulso': (-0.040, 0.072, 0.256), 'asa_fim': (-0.142, 0.058, 0.240),
        'anca': (-0.040, 0.038, 0.212), 'joelho': (0.016, 0.048, 0.170), 'jarrete': (-0.018, 0.038, 0.086),
        'pe': (0.008, 0.034, 0.0105),
    },
    corpo_c=(-0.020, 0.0, 0.226), corpo_s=(0.126, 0.079, 0.070), corpo_incl=10.0,
    cabeca_esc=1.12, crista_alt=0.010, crista_comp=0.032, crista_pontas=5,
    barbela=(0.0055, 0.0030, 0.0075), pernas_r=0.0062, dedos=(0.052, 0.042, 0.040, 0.022),
    galo=False,
)

GALO = dict(
    nome='galo',
    juntas={
        'corpo': (-0.030, 0.0, 0.318), 'corpo_frente': (0.055, 0.0, 0.352),
        'pescoco_0': (0.012, 0.0, 0.322), 'pescoco_1': (0.075, 0.0, 0.352), 'pescoco_2': (0.072, 0.0, 0.410),
        'forma_pescoco_0': (0.056, 0.0, 0.370), 'forma_pescoco_1': (0.077, 0.0, 0.410),
        'forma_pescoco_2': (0.091, 0.0, 0.446),
        'cabeca': (0.100, 0.0, 0.474), 'bico_ponta': (0.163, 0.0, 0.470),
        'mandibula': (0.130, 0.0, 0.468), 'mandibula_ponta': (0.157, 0.0, 0.465),
        'cauda': (-0.128, 0.0, 0.384), 'cauda_meio': (-0.160, 0.0, 0.432), 'cauda_fim': (-0.190, 0.0, 0.482),
        'ombro': (0.048, 0.066, 0.360), 'pulso': (-0.036, 0.080, 0.358), 'asa_fim': (-0.152, 0.066, 0.330),
        'anca': (-0.045, 0.045, 0.300), 'joelho': (0.024, 0.056, 0.246), 'jarrete': (-0.026, 0.046, 0.126),
        'pe': (0.010, 0.042, 0.0125),
    },
    corpo_c=(-0.012, 0.0, 0.318), corpo_s=(0.122, 0.090, 0.088), corpo_incl=22.0,
    cabeca_esc=1.18, crista_alt=0.038, crista_comp=0.072, crista_pontas=5,
    barbela=(0.010, 0.0040, 0.022), pernas_r=0.0078, dedos=(0.060, 0.050, 0.046, 0.026),
    galo=True,
)


def J(ave, nome, lado=1):
    f, l, u = ave['juntas'][nome]
    return P(f, l * lado, u)


# ---------------------------------------------------------------------------
# corpo, pescoço, cabeça e coxas (SDF)
# ---------------------------------------------------------------------------
def forma(ave):
    F = Forma()
    E, K = Elipsoide, Cone
    g = ave['galo']

    def el(c, s, rot=None, **kw):
        cf, cl, cu = c
        sf, sl, su = s
        return F.adicionar(E(P(cf, cl, cu), (sl, sf, su), rot, **kw))

    cf_, cl_, cu_ = ave['corpo_c']
    sf, sl, su = ave['corpo_s']
    inc = ave['corpo_incl']
    el((cf_, 0, cu_), (sf, sl, su), inclina(inc), regiao='corpo', k=0.0)
    # peito cheio na frente
    el((cf_ + 0.080, 0, cu_ - 0.004 + (0.012 if g else 0.0)), (0.052, 0.060, 0.062 if not g else 0.074),
       inclina(inc), regiao='corpo', k=0.04)
    # barriga fofa embaixo e atrás
    el((cf_ - 0.030, 0, cu_ - 0.036), (0.076, 0.064, 0.045), inclina(inc * 0.5), regiao='corpo', k=0.04)
    # dorso descendo para a cauda e o uropígio
    el((cf_ - 0.085, 0, cu_ + 0.006 + (0.01 if g else 0.0)), (0.075, 0.052, 0.042), inclina(-24), regiao='corpo', k=0.04)
    c = J(ave, 'cauda')
    F.adicionar(E(c + P(0.008, 0, -0.004), (0.036, 0.034, 0.032), inclina(-40), regiao='corpo', k=0.03))
    # pescoço (com a base mais grossa da capa)
    p0, p1, p2, pc = (J(ave, n) for n in ('forma_pescoco_0', 'forma_pescoco_1', 'forma_pescoco_2', 'cabeca'))
    esc = 1.12 if g else 1.0
    F.adicionar(K(p0 + P(-0.010, 0, -0.008), p1, 0.037 * esc, 0.026 * esc, regiao='pescoco', k=0.035))
    F.adicionar(K(p1, p2, 0.026 * esc, 0.020 * esc, regiao='pescoco', k=0.02))
    F.adicionar(K(p2, pc + P(0.004, 0, 0.002), 0.021 * esc, 0.0175 * esc, regiao='pescoco', k=0.012))
    # cabeça
    s = ave['cabeca_esc']
    ch = pc + P(0.017, 0, 0.006) * s
    F.adicionar(E(ch, np.array([0.0165, 0.0225, 0.0185]) * s, None, regiao='cabeca', k=0.012))
    # face (pele nua em volta do olho, levemente achatada)
    for lado in (1, -1):
        F.adicionar(E(ch + P(0.006, 0.006 * lado, -0.002) * s, np.array([0.011, 0.015, 0.013]) * s, None,
                regiao='cabeca', k=0.01))
    # coxas emplumadas ("calças")
    for lado, sx in ((1, 'e'), (-1, 'd')):
        jo, ja, an = J(ave, 'joelho', lado), J(ave, 'jarrete', lado), J(ave, 'anca', lado)
        fim = ja + (jo - ja) * 0.17
        F.adicionar(K(jo + P(0.0, 0.004 * lado, 0.006), fim, 0.034 if not g else 0.037, 0.0150 if not g else 0.0165,
                regiao='perna_' + sx, k=0.025))
        F.adicionar(E((an + jo) / 2 + P(0.0, 0.006 * lado, -0.004), (0.026, 0.050, 0.040) if not g else (0.030, 0.056, 0.046),
                inclina(25), regiao='coxa_' + sx, k=0.03))
    return F


def caixa(ave):
    if ave['galo']:
        return np.array([-0.16, -0.20, 0.08]), np.array([0.16, 0.23, 0.53])
    return np.array([-0.13, -0.16, 0.08]), np.array([0.13, 0.19, 0.40])


# ---------------------------------------------------------------------------
# utilidades de malha
# ---------------------------------------------------------------------------
def tubo(pontos, raios, lados=6, cima=(0.0, 0.0, 1.0), achata=1.0, tampa_ini=True, tampa_fim=True):
    """Tubo por uma polilinha, com anéis de `lados` vértices. Devolve (verts, faces, t por vértice)."""
    pontos = np.asarray(pontos, dtype=float)
    n = len(pontos)
    verts, ts = [], []
    comp = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(pontos, axis=0), axis=1))])
    comp = comp / max(comp[-1], 1e-9)
    cima = np.asarray(cima, dtype=float)
    for i in range(n):
        d = pontos[min(i + 1, n - 1)] - pontos[max(i - 1, 0)]
        d = d / np.linalg.norm(d)
        x = np.cross(d, cima)
        if np.linalg.norm(x) < 1e-6:
            x = np.cross(d, np.array([0.0, 1.0, 0.0]))
        x = x / np.linalg.norm(x)
        y = np.cross(x, d)
        for k in range(lados):
            a = 2 * np.pi * k / lados
            verts.append(pontos[i] + raios[i] * (np.cos(a) * x + achata * np.sin(a) * y))
            ts.append(comp[i])
    faces = []
    for i in range(n - 1):
        for k in range(lados):
            a, b = i * lados + k, i * lados + (k + 1) % lados
            faces.append([a, b, b + lados, a + lados])
    if tampa_ini:
        c = len(verts)
        verts.append(pontos[0] - (pontos[1] - pontos[0]) / np.linalg.norm(pontos[1] - pontos[0]) * raios[0] * 0.6)
        ts.append(0.0)
        for k in range(lados):
            faces.append([c, (k + 1) % lados, k])
    if tampa_fim:
        c = len(verts)
        dd = pontos[-1] - pontos[-2]
        verts.append(pontos[-1] + dd / np.linalg.norm(dd) * raios[-1] * 0.8)
        ts.append(1.0)
        b = (n - 1) * lados
        for k in range(lados):
            faces.append([b + k, b + (k + 1) % lados, c])
    return np.array(verts), faces, np.array(ts)


def folha(grade):
    """Superfície de uma grade (nu, nv, 3) -> (verts, quads)."""
    nu, nv, _ = grade.shape
    verts = grade.reshape(-1, 3)
    faces = []
    for i in range(nu - 1):
        for j in range(nv - 1):
            a = i * nv + j
            faces.append([a, a + 1, a + nv + 1, a + nv])
    return verts, faces


def elipsoide_malha(centro, semi, R=None, seg=8, aneis=6):
    verts = [np.array([0.0, 0.0, -1.0])]
    for i in range(1, aneis):
        th = np.pi * i / aneis - np.pi / 2
        for j in range(seg):
            ph = 2 * np.pi * j / seg
            verts.append(np.array([np.cos(th) * np.cos(ph), np.cos(th) * np.sin(ph), np.sin(th)]))
    verts.append(np.array([0.0, 0.0, 1.0]))
    faces = []
    for j in range(seg):
        faces.append([0, 1 + (j + 1) % seg, 1 + j])
    for i in range(aneis - 2):
        a0 = 1 + i * seg
        for j in range(seg):
            faces.append([a0 + j, a0 + (j + 1) % seg, a0 + seg + (j + 1) % seg, a0 + seg + j])
    topo = len(verts) - 1
    a0 = 1 + (aneis - 2) * seg
    for j in range(seg):
        faces.append([a0 + j, a0 + (j + 1) % seg, topo])
    V = np.array(verts) * np.asarray(semi)[None]
    if R is not None:
        V = V @ np.asarray(R).T
    return V + np.asarray(centro)[None], faces


def superficie_lateral(F, f, u, lado, l_max=0.2):
    """Onde a superfície do corpo está, andando de fora para dentro em l (bisseção)."""
    f = np.asarray(f, dtype=float)
    u = np.asarray(u, dtype=float)
    lo = np.zeros_like(f)
    hi = np.full_like(f, l_max)
    for _ in range(30):
        m = (lo + hi) / 2
        p = np.stack([m * lado, -f, u], axis=1)
        dentro = F.avaliar(p) < 0
        lo = np.where(dentro, m, lo)
        hi = np.where(dentro, hi, m)
    return (lo + hi) / 2


def superficie_raio(F, origem, direcoes, r_max=0.15):
    """Distância da superfície ao longo de raios saindo de dentro (bisseção)."""
    lo = np.zeros(len(direcoes))
    hi = np.full(len(direcoes), r_max)
    for _ in range(30):
        m = (lo + hi) / 2
        p = origem[None] + direcoes * m[:, None]
        dentro = F.avaliar(p) < 0
        lo = np.where(dentro, m, lo)
        hi = np.where(dentro, hi, m)
    return (lo + hi) / 2


# ---------------------------------------------------------------------------
# pernas e dedos (amarelos)
# ---------------------------------------------------------------------------
DEDOS = ('meio', 'ext', 'int', 'tras')
DEDOS_GUINADA = {'meio': 6.0, 'ext': 40.0, 'int': -24.0, 'tras': 196.0}   # + = para fora


def direcao_dedo(nome, lado, desce=6.0):
    a = np.radians(DEDOS_GUINADA[nome])
    d = P(np.cos(a), np.sin(a) * lado, 0.0)
    b = np.radians(desce)
    d = d * np.cos(b) + np.array([0, 0, -1.0]) * np.sin(b)
    return d / np.linalg.norm(d)


def ponta_dedo(ave, nome, lado):
    comp = dict(zip(DEDOS, ave['dedos']))[nome]
    return J(ave, 'pe', lado) + direcao_dedo(nome, lado) * comp


def perna_malha(ave, lado, s):
    """Canela + dedos (+ esporão no galo). Pesos por osso."""
    ja, pe = J(ave, 'jarrete', lado), J(ave, 'pe', lado)
    jo = J(ave, 'joelho', lado)
    r = ave['pernas_r']
    verts, faces, pesos = [], [], []

    def junta_(v, f, w):
        off = len(verts)
        verts.extend(v)
        faces.extend([[i + off for i in fc] for fc in f])
        pesos.extend(w)
    # canela: começa um pouco acima do jarrete (dentro das penas) e vai até o pé
    ini = ja + (jo - ja) * 0.28
    pts = [ini, ja + (jo - ja) * 0.10, ja, ja + (pe - ja) * 0.33, ja + (pe - ja) * 0.66, pe]
    rs = [r * 1.25, r * 1.30, r * 1.30, r * 1.0, r * 0.95, r * 1.05]
    v, f, t = tubo(pts, rs, lados=6, cima=P(1, 0, 0), achata=0.85, tampa_ini=False, tampa_fim=False)
    w = []
    for p in v:
        dj = np.dot(p - ja, normalizar(pe - ja))
        wp = suave(-0.012, 0.010, dj)          # 0 = perna (tibiotarso), 1 = canela
        w.append({f'perna_{s}': 1 - wp, f'canela_{s}': wp})
    junta_(v, f, w)
    # dedos
    for nome in DEDOS:
        comp = dict(zip(DEDOS, ave['dedos']))[nome]
        d = direcao_dedo(nome, lado)
        pts = [pe + d * comp * x + np.array([0, 0, -0.004]) * np.sin(np.pi * x) * (x < 0.9) for x in (0.0, 0.3, 0.62, 0.9, 1.0)]
        pts[0] = pe - d * 0.004
        r0 = r * (0.72 if nome != 'tras' else 0.62)
        rs = [r0, r0 * 0.9, r0 * 0.78, r0 * 0.55, r0 * 0.25]
        v, f, t = tubo(pts, rs, lados=5, cima=(0, 0, 1), achata=0.8, tampa_ini=False, tampa_fim=True)
        w = [{f'canela_{s}': 1 - suave(0.0, 0.18, tt), f'dedo_{s}_{nome}': suave(0.0, 0.18, tt)} for tt in t]
        junta_(v, f, w)
    # esporão do galo (atrás e por dentro da canela)
    if ave['galo']:
        base = ja + (pe - ja) * 0.55 + P(-0.006, -0.002 * lado, 0)
        d = normalizar(P(-0.8, -0.25 * lado, 0.35))
        pts = [base, base + d * 0.010, base + d * 0.018 + np.array([0, 0, 0.003])]
        v, f, t = tubo(pts, [0.0042, 0.0030, 0.0012], lados=5, cima=(0, 0, 1), tampa_ini=False, tampa_fim=True)
        junta_(v, f, [{f'canela_{s}': 1.0}] * len(v))
    return np.array(verts), faces, pesos


# ---------------------------------------------------------------------------
# bico, olhos, crista, barbelas e orelhas
# ---------------------------------------------------------------------------
def cabeca_centro(ave):
    s = ave['cabeca_esc']
    return J(ave, 'cabeca') + P(0.017, 0, 0.006) * s


def bico_malha(ave):
    """Bico de cima (cabeça) e de baixo (mandíbula): cones curvos achatados."""
    s = ave['cabeca_esc']
    base = J(ave, 'cabeca') + P(0.030, 0, 0.004) * s
    ponta = J(ave, 'bico_ponta')
    verts, faces, pesos = [], [], []
    comp = np.linalg.norm(ponta - base)
    pts = []
    for x in np.linspace(0, 1, 5):
        p = base + (ponta - base) * x + np.array([0, 0, 0.004 * s]) * np.sin(np.pi * x * 0.8) - np.array([0, 0, 0.004 * s]) * x ** 3
        pts.append(p)
    rs = np.array([0.0075, 0.0062, 0.0045, 0.0026, 0.0008]) * s
    v, f, t = tubo(pts, rs, lados=6, cima=(0, 0, 1), achata=1.0, tampa_ini=False, tampa_fim=True)
    # achata para os lados (bico é mais alto que largo)
    v = v.copy()
    eixo = normalizar(ponta - base)
    for i in range(len(v)):
        q = v[i] - pts[0]
        lat = q[0]
        v[i][0] = pts[0][0] + lat * 0.82
    verts.extend(v)
    faces.extend(f)
    pesos.extend([{'cabeca': 1.0}] * len(v))
    # de baixo
    mb = J(ave, 'mandibula') + P(0.004, 0, -0.002) * s
    mp = J(ave, 'mandibula_ponta')
    pts = [mb + (mp - mb) * x for x in np.linspace(0, 1, 4)]
    rs = np.array([0.0052, 0.0042, 0.0028, 0.0008]) * s
    v, f, t = tubo(pts, rs, lados=5, cima=(0, 0, 1), achata=0.7, tampa_ini=False, tampa_fim=True)
    off = len(verts)
    verts.extend(v)
    faces.extend([[i + off for i in fc] for fc in f])
    pesos.extend([{'mandibula': 1.0}] * len(v))
    return np.array(verts), faces, pesos


def olho_centro(ave, lado):
    s = ave['cabeca_esc']
    return cabeca_centro(ave) + P(0.006, 0.0128 * lado, 0.004) * s


def crista_malha(ave):
    """Crista simples serrilhada: lâmina fina com pontas, da base do bico até a nuca."""
    s = ave['cabeca_esc']
    ch = cabeca_centro(ave)
    n = ave['crista_pontas']
    comp = ave['crista_comp']
    alt = ave['crista_alt']
    g = ave['galo']
    ini = ch + P(0.022, 0, 0.010) * s          # perto do bico
    amostras = 4 * n + 1
    base, topo = [], []
    for i in range(amostras):
        x = i / (amostras - 1)
        # a base acompanha o alto da cabeça (arco) e, no galo, a lâmina passa da nuca
        f = 0.022 * s - comp * x
        u_base = 0.010 * s + 0.0115 * s * np.sin(np.pi * min(x * 1.25, 1.0)) - (0.012 * s * max(0, x - 0.75) / 0.25 if g else 0)
        b = ch + P(f, 0, u_base)
        # contorno: pontas arredondadas, as do meio mais altas
        env = np.sin(np.pi * (0.12 + 0.82 * x)) ** 0.7
        fase = (x * n) % 1.0
        dente = 0.55 + 0.45 * np.cos(2 * np.pi * (fase - 0.5)) ** 2 if True else 1
        tri = 0.5 + 0.5 * np.cos(2 * np.pi * (fase - 0.5))
        dente = (0.50 + 0.50 * tri ** 0.7) if g else (0.62 + 0.38 * tri)
        h = alt * env * dente
        if g and x > 0.8:
            h *= 1.0 + 0.6 * (x - 0.8) / 0.2   # lâmina de trás do galo mais alta
        base.append(b - np.array([0, 0, 0.004 * s]))
        topo.append(b + np.array([0, 0, h]) + P(-0.10 * h * (x - 0.5), 0, 0))
    esp = 0.0016 * s if not g else 0.0026
    verts, faces, pesos = [], [], []
    for lado in (1, -1):
        for i in range(amostras):
            for k, p in enumerate((base[i], (base[i] + topo[i]) / 2, topo[i])):
                e = esp * (1.0 if k < 2 else 0.45)
                verts.append(p + np.array([e * lado, 0, 0]))
                pesos.append({'cabeca': 1.0 - [0.0, 0.7, 1.0][k] * (1 if g else 0.5),
                              'crista': [0.0, 0.7, 1.0][k] * (1 if g else 0.5)})
    m = amostras * 3

    def ix(lado_i, i, k):
        return lado_i * m + i * 3 + k
    for i in range(amostras - 1):
        for k in range(2):
            faces.append([ix(0, i, k), ix(0, i + 1, k), ix(0, i + 1, k + 1), ix(0, i, k + 1)])
            faces.append([ix(1, i, k), ix(1, i, k + 1), ix(1, i + 1, k + 1), ix(1, i + 1, k)])
        faces.append([ix(0, i, 2), ix(0, i + 1, 2), ix(1, i + 1, 2), ix(1, i, 2)])
        faces.append([ix(0, i, 0), ix(1, i, 0), ix(1, i + 1, 0), ix(0, i + 1, 0)])
    for i in (0, amostras - 1):
        for k in range(2):
            if i == 0:
                faces.append([ix(0, i, k), ix(0, i, k + 1), ix(1, i, k + 1), ix(1, i, k)])
            else:
                faces.append([ix(0, i, k), ix(1, i, k), ix(1, i, k + 1), ix(0, i, k + 1)])
    return np.array(verts), faces, pesos


def barbelas_malha(ave):
    """Barbelas (debaixo do bico) e orelhas (lóbulos), todas vermelhas."""
    s = ave['cabeca_esc']
    ch = cabeca_centro(ave)
    sf, sl, su = ave['barbela']
    verts, faces, pesos = [], [], []
    for lado in (1, -1):
        c = ch + P(0.021 * s, 0.0029 * lado * s, -0.016 * s - su * 0.9)
        v, f = elipsoide_malha(c, (sl, sf, su), seg=7, aneis=5)
        topo = c[2] + su
        w = [{'cabeca': float(suave(-0.4, 0.1, (p[2] - topo) / su + 0.5)),
              'barbela': 1.0 - float(suave(-0.4, 0.1, (p[2] - topo) / su + 0.5))} for p in v]
        off = len(verts)
        verts.extend(v)
        faces.extend([[i + off for i in fc] for fc in f])
        pesos.extend(w)
        # lóbulo da orelha
        c = ch + P(-0.010, 0.0145 * lado, -0.006) * s
        v, f = elipsoide_malha(c, (0.0024 * s, 0.0052 * s, 0.0068 * s), seg=6, aneis=4)
        off = len(verts)
        verts.extend(v)
        faces.extend([[i + off for i in fc] for fc in f])
        pesos.extend([{'cabeca': 1.0}] * len(v))
    return np.array(verts), faces, pesos


# ---------------------------------------------------------------------------
# asas, cauda, foices e capa (folhas de penas, materiais de dois lados)
# ---------------------------------------------------------------------------
def eixo_corpo(ave, f):
    """Ponto da linha central do corpo (dentro dele) na posição f."""
    cf_, _, cu_ = ave['corpo_c']
    u = cu_ + np.tan(np.radians(ave['corpo_incl'])) * (f - cf_) * 0.6
    return P(f, 0.0, u)


def casca_por_raios(ave, F, lado, fs, thetas, offs):
    """Pontos sobre o corpo: para cada (f, ângulo em volta do eixo), acha a pele por um raio
    que sai da linha central e afasta `offs`. Ângulo 0 = lado, 90 = em cima."""
    pts = []
    for f, th, of in zip(fs, thetas, offs):
        c = eixo_corpo(ave, f)
        d = np.array([lado * np.cos(np.radians(th)), 0.0, np.sin(np.radians(th))])
        r = superficie_raio(F, c, d[None])[0]
        pts.append(c + d * (r + of))
    return np.array(pts)


def asa_malha(ave, F, lado, s):
    """Asa dobrada: folha que acompanha o flanco, com degraus das fileiras de penas e a
    borda de baixo/de trás recortada em pontas. Devolve verts, faces, pesos, máscara G."""
    g = ave['galo']
    om, fim = J(ave, 'ombro', lado), J(ave, 'asa_fim', lado)
    f_om, f_fim = -om[1], -fim[1]
    nu, nv = 9, 6
    fs, ths, ofs, xs, ys = [], [], [], [], []
    for i in range(nu):
        x = i / (nu - 1)                       # 0 = ombro, 1 = ponta
        f = f_om + (f_fim - f_om) * x
        # contorno de gota: estreita no ombro, larga a 1/3, pontuda atrás
        meio = 22.0 - 2.0 * x + (3.0 if g else 0.0)
        meia = 27.0 * (np.sin(np.pi * (0.22 + 0.78 * x)) ** 0.55) * (1.0 - 0.55 * suave(0.55, 1.0, x))
        th_top = meio + meia * 1.05
        th_bot = meio - meia
        for j in range(nv):
            y = j / (nv - 1)                   # 0 = borda de cima, 1 = borda de baixo
            th = th_top + (th_bot - th_top) * y
            if j == nv - 1 and i % 2 == 1:
                th -= 3.0                      # pontas das rêmiges
            # degraus: coberteiras -> secundárias -> primárias
            degrau = 0.0025 * np.floor(min(y, 0.999) * 3.0)
            of = 0.0008 + 0.0050 * suave(0.0, 0.35, y) - degrau * 0.6 + 0.002 * np.sin(np.pi * x)
            fs.append(f)
            ths.append(th)
            ofs.append(of)
            xs.append(x)
            ys.append(y)
    pts = casca_por_raios(ave, F, lado, fs, ths, ofs)
    v, f = folha(pts.reshape(nu, nv, 3))
    if lado < 0:
        f = [fc[::-1] for fc in f]
    xs, ys = np.array(xs), np.array(ys)
    if g:
        # galo: ombro vermelho-escuro (mistura) e rêmiges pretas
        G = np.maximum(0.45 * (1 - suave(0.40, 0.80, ys)), suave(0.40, 0.80, ys) * suave(0.10, 0.45, xs))
    else:
        G = suave(0.35, 0.75, ys)
    w = []
    for x in xs:
        wp = suave(0.35, 0.75, x)
        base = 0.25 * (1 - suave(0.0, 0.3, x))
        w.append({'corpo': base, f'asa_{s}': (1 - wp) * (1 - base), f'asa_{s}_ponta': wp * (1 - base)})
    return v, f, w, G


def pena(base, direcao, normal, comp, larg, curva=0.0, eixo_curva=None, enrola=0.0, segs=4, ponta=0.25, torcao=0.0):
    """Uma pena (folha estreita) de `base` na `direcao`; a face larga olha para `normal`.

    `curva` dobra a pena em torno de `eixo_curva` (graus no total); `enrola` dobra para fora do plano."""
    d = normalizar(direcao)
    nrm = normalizar(normal - d * np.dot(normal, d))
    eixo_c = normalizar(eixo_curva) if eixo_curva is not None else nrm
    verts, ts = [], []
    pos = np.array(base, dtype=float)
    dd = d.copy()
    for i in range(segs + 1):
        t = i / segs
        w = larg * (0.55 + 0.45 * np.sin(np.pi * min(1.0, 0.25 + t * 0.85))) * (1 - suave(1 - ponta, 1.0, t) * 0.92)
        n_t = normalizar(nrm - dd * np.dot(nrm, dd))
        lat = np.cross(dd, n_t)
        lt = lat * np.cos(torcao * t) + n_t * np.sin(torcao * t)
        for k in (-1, 0, 1):
            verts.append(pos + lt * w * 0.5 * k - n_t * abs(k) * 0.12 * w)
            ts.append(t)
        dd = _rot(eixo_c, curva / segs) @ dd
        if enrola:
            dd = _rot(np.cross(dd, n_t), enrola / segs) @ dd
        pos = pos + dd * comp / segs
    faces = []
    for i in range(segs):
        for k in range(2):
            a = i * 3 + k
            faces.append([a, a + 1, a + 4, a + 3])
    return np.array(verts), faces, np.array(ts)


def _rot(eixo, graus):
    e = normalizar(eixo)
    a = np.radians(graus)
    K = np.array([[0, -e[2], e[1]], [e[2], 0, -e[0]], [-e[1], e[0], 0]])
    return np.eye(3) + np.sin(a) * K + (1 - np.cos(a)) * K @ K


def cauda_malha(ave):
    """Leque da cauda (e as foices do galo). Pesos, máscara G e brilho A por pena."""
    g = ave['galo']
    c0, c1 = J(ave, 'cauda'), J(ave, 'cauda_meio')
    verts, faces, pesos, G, A = [], [], [], [], []

    def junta_(v, f, w, gm, am):
        off = len(verts)
        verts.extend(v)
        faces.extend([[i + off for i in fc] for fc in f])
        pesos.extend(w)
        G.extend(gm)
        A.extend(am)
    eixo = normalizar(c1 - c0)                    # sobe para trás
    cima = np.array([0, 0, 1.0])
    lateral = np.array([1.0, 0, 0])
    n_lado = 5 if not g else 5
    for lado in (1, -1):
        for k in range(n_lado):
            t = k / (n_lado - 1)
            # leque em V: as de fora abrem para o lado e descem um pouco
            abre = (6 + 26 * t) * lado
            desce = 4 + 18 * t
            d = _rot(cima, abre) @ eixo
            d = _rot(np.cross(d, cima), desce) @ d
            base = c0 + P(0.004, 0.008 * lado * (0.3 + t), 0.004)
            comp = (0.112 - 0.030 * t) if not g else (0.165 - 0.040 * t)
            larg = 0.044 if not g else 0.036
            nrm = normalizar(np.array([lado, 0, 0]) * 1.0 + cima * 0.15)
            v, f, ts = pena(base, d, nrm, comp, larg, curva=-(14 + 10 * t), eixo_curva=lateral, segs=4, ponta=0.3)
            w = [{'cauda': 1 - suave(0.25, 0.85, x), 'cauda_ponta': suave(0.25, 0.85, x)} for x in ts]
            junta_(v, f, w, [1.0] * len(v), [0.3 if not g else 0.8] * len(v))
    if g:
        # foices: sobem, arqueiam para trás e caem; as maiores por dentro
        for lado in (1, -1):
            for k, (comp, ab, ang, curv) in enumerate(((0.310, 3, 74, -200), (0.270, 9, 66, -178),
                                                       (0.225, 15, 56, -152), (0.180, 22, 44, -122))):
                d0 = normalizar(P(-np.cos(np.radians(ang)), 0, np.sin(np.radians(ang))))
                d = _rot(cima, -ab * lado) @ d0
                base = c0 + P(0.012 - 0.006 * k, 0.005 * lado * (1 + k), 0.012 + 0.003 * k)
                nrm = np.array([lado * 1.0, 0, 0.0])
                v, f, ts = pena(base, d, nrm, comp, 0.027 - 0.003 * k, curva=curv, eixo_curva=lateral, segs=8,
                                ponta=0.22, torcao=0.25 * lado)
                w = [{'cauda': 1 - suave(0.15, 0.7, x), 'cauda_ponta': suave(0.15, 0.7, x)} for x in ts]
                junta_(v, f, w, [1.0] * len(v), [1.0] * len(v))
    return np.array(verts), faces, pesos, np.array(G), np.array(A)


def capa_malha(ave, F):
    """Capa de penas do pescoço (e do selim no galo), com a borda de baixo em pontas."""
    g = ave['galo']
    p0, p1, p2 = J(ave, 'forma_pescoco_0'), J(ave, 'forma_pescoco_1'), J(ave, 'forma_pescoco_2')
    verts, faces, pesos, G = [], [], [], []
    # pescoço: anéis em volta do eixo, do alto (perto da cabeça) até a base
    eixo_a = p2 + (J(ave, 'cabeca') - p2) * 0.75
    eixo_b = p0 + P(-0.018, 0, -0.016) if not g else p0 + P(-0.040, 0, -0.042)
    nn, na = 6, 14
    grade = np.zeros((nn, na, 3))
    wv = []
    for i in range(nn):
        t = i / (nn - 1)
        c = eixo_a + (eixo_b - eixo_a) * t
        d = normalizar(eixo_b - eixo_a)
        x = np.array([1.0, 0, 0])
        y = normalizar(np.cross(d, x))
        dirs = []
        for k in range(na):
            a = 2 * np.pi * k / na
            dirs.append(np.cos(a) * x + np.sin(a) * y)
        dirs = np.array(dirs)
        r = superficie_raio(F, c, dirs)
        for k in range(na):
            a = 2 * np.pi * k / na
            # na frente (garganta) a capa sobe: as penas cobrem as costas e os lados
            frente = max(0.0, -np.dot(dirs[k], P(1, 0, 0)))
            off = 0.0008 + 0.0028 * t
            p = c + dirs[k] * (r[k] + off)
            if i == nn - 1:
                # pontas das penas na borda de baixo
                p = p + d * (0.009 if k % 2 == 0 else -0.002) * (1.0 if not g else 1.6)
            p = p - d * frente * 0.022 * t
            grade[i, k] = p
    v = []
    f = []
    for i in range(nn):
        for k in range(na):
            v.append(grade[i, k])
    wv = pesos_pescoco(ave, np.array(v))
    for i in range(nn - 1):
        for k in range(na):
            a, b = i * na + k, i * na + (k + 1) % na
            f.append([a, b, b + na, a + na])
    gm = [1.0] * len(v)
    off = len(verts)
    verts.extend(v)
    faces.extend([[q + off for q in fc] for fc in f])
    pesos.extend(wv)
    G.extend(gm)
    return np.array(verts), faces, pesos, np.array(G)


def linha_pescoco(ave):
    """Linha central da forma do pescoço (base -> cabeça) e o comprimento acumulado (0-1)."""
    pts = [J(ave, n) for n in ('forma_pescoco_0', 'forma_pescoco_1', 'forma_pescoco_2', 'cabeca')]
    pts[0] = pts[0] + P(-0.010, 0, -0.008)
    c = np.concatenate([[0], np.cumsum([np.linalg.norm(pts[i + 1] - pts[i]) for i in range(3)])])
    return pts, c / c[-1]


def param_pescoco(ave, v):
    pts, ts = linha_pescoco(ave)
    melhor = np.full(len(v), np.inf)
    par = np.zeros(len(v))
    for i in range(3):
        a, b = pts[i], pts[i + 1]
        d = b - a
        t = np.clip(((v - a) @ d) / (d @ d), -0.5 if i == 0 else 0.0, 1.5 if i == 2 else 1.0)
        q = a[None] + t[:, None] * d[None]
        dist = np.linalg.norm(v - q, axis=1)
        m = dist < melhor
        melhor[m] = dist[m]
        par[m] = ts[i] + t[m] * (ts[i + 1] - ts[i])
    return par


def pesos_pescoco(ave, v):
    """Pesos ao longo do pescoço: corpo na base, depois os três ossos, cabeça no alto."""
    t = param_pescoco(ave, v)
    cortes = [(-1.0, 'corpo'), (0.26, 'pescoco_1'), (0.54, 'pescoco_2'), (0.80, 'pescoco_3'), (1.02, 'cabeca')]
    larg = 0.12
    out = []
    for x in t:
        w = {}
        for k in range(len(cortes)):
            ini = cortes[k][0]
            fim = cortes[k + 1][0] if k + 1 < len(cortes) else 9.0
            a = suave(ini - larg, ini + larg, x) if k > 0 else 1.0
            b = 1.0 - (suave(fim - larg, fim + larg, x) if k + 1 < len(cortes) else 0.0)
            val = float(max(0.0, min(a, b)))
            if val > 0:
                w[cortes[k][1]] = val
        out.append(w)
    return out
