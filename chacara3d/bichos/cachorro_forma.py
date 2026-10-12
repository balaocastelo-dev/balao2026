"""Anatomia do cachorro (vira-lata caramelo médio): juntas do esqueleto e volumes.

Coordenadas anatômicas (f, l, u) em metros: f = para a frente (rumo ao focinho),
l = para a esquerda do bicho, u = para cima. No Blender isso vira
(x, y, z) = (l, -f, u): o bicho olha para -Y, que o exportador transforma em +Z
do glTF. A origem fica no chão, no meio entre as patas da frente e as de trás.
"""
import numpy as np
from sdf import Forma, Elipsoide, Cone, base_de, normalizar, rot_x, rot_y, rot_z


def P(f, l, u):
    """Ponto anatômico -> coordenada do Blender."""
    return np.array([l, -f, u], dtype=float)


def inclina(graus):
    """Rotação que levanta a frente da peça em `graus` (gira em torno do eixo lateral)."""
    return rot_x(-graus)


# ---------------------------------------------------------------------------
# juntas (lado esquerdo; o direito é espelhado em l)
# ---------------------------------------------------------------------------
INCLINACAO_CABECA = 18.0  # focinho abaixo da horizontal, cachorro em pé relaxado

JUNTAS = {
    # linha do corpo (no meio)
    'quadril': (-0.200, 0.0, 0.452),
    'lombo': (-0.095, 0.0, 0.472),
    'torax': (0.040, 0.0, 0.476),
    'cernelha': (0.150, 0.0, 0.468),
    'pescoco_base': (0.215, 0.0, 0.445),
    'pescoco_meio': (0.285, 0.0, 0.525),
    'occipital': (0.328, 0.0, 0.603),
    'cauda_base': (-0.262, 0.0, 0.468),
    # pata da frente
    'escapula_topo': (0.172, 0.046, 0.492),
    'ombro': (0.272, 0.071, 0.378),
    'cotovelo': (0.182, 0.068, 0.262),
    'carpo': (0.190, 0.062, 0.096),
    'mcp_f': (0.211, 0.061, 0.030),
    'dedo_f': (0.250, 0.061, 0.011),
    # pata de trás
    'anca': (-0.205, 0.058, 0.414),
    'joelho': (-0.132, 0.072, 0.266),
    'jarrete': (-0.252, 0.066, 0.124),
    'mtp_t': (-0.233, 0.064, 0.030),
    'dedo_t': (-0.195, 0.064, 0.011),
}

# segmentos da cauda: (comprimento, ângulo acima da horizontal para trás)
CAUDA = [(0.080, 2.0), (0.075, 12.0), (0.070, 24.0), (0.065, 36.0), (0.060, 46.0)]
RAIOS_CAUDA = [0.027, 0.020, 0.0165, 0.013, 0.0098, 0.0072]


def junta(nome, lado=1):
    f, l, u = JUNTAS[nome]
    return P(f, l * lado, u)


def pontos_cauda():
    f, l, u = JUNTAS['cauda_base']
    pts = [np.array([f, u])]
    for comp, ang in CAUDA:
        a = np.radians(ang)
        pts.append(pts[-1] + comp * np.array([-np.cos(a), np.sin(a)]))
    return [P(p[0], 0.0, p[1]) for p in pts]


# ---------------------------------------------------------------------------
# referencial do crânio: x para a frente ao longo do focinho, z para cima
# ---------------------------------------------------------------------------
def matriz_cranio():
    """Rotação crânio -> Blender (colunas: frente, lado, cima do crânio)."""
    a = np.radians(INCLINACAO_CABECA)
    frente = P(np.cos(a), 0.0, -np.sin(a))
    cima = P(np.sin(a), 0.0, np.cos(a))
    lado = P(0.0, 1.0, 0.0)
    return np.stack([frente, lado, cima], axis=1)


def C(x, l, z):
    """Ponto no referencial do crânio -> Blender."""
    return junta('occipital') + matriz_cranio() @ np.array([x, l, z], dtype=float)


def rot_cranio(R_local=None):
    """Rotação de uma peça definida no crânio: colunas (lado, -frente, cima) como no mundo."""
    M = matriz_cranio()
    base = np.stack([M[:, 1], -M[:, 0], M[:, 2]], axis=1)
    return base if R_local is None else base @ R_local


# geometria dos olhos (no referencial do crânio)
OLHO_CENTRO = (0.1035, 0.0305, 0.0285)
OLHO_OLHAR = 27.0      # graus para fora
OLHO_INCLINA = 12.0    # canto de fora mais alto (amendoado)
OLHO_SEMI = (0.0118, 0.0102, 0.0078)  # (ao longo da fenda, profundidade, altura)


def olho_frame(lado):
    """Centro e rotação (colunas: fenda, olhar, altura) do olho em Blender."""
    a = np.radians(OLHO_OLHAR)
    x, l, z = OLHO_CENTRO
    centro = C(x, l * lado, z)
    M = matriz_cranio()
    olhar = normalizar(M @ np.array([np.cos(a), lado * np.sin(a), 0.04]))
    cima = M[:, 2]
    fenda = normalizar(np.cross(olhar, cima)) * (-lado)  # aponta para o canto de fora/trás
    cima = np.cross(fenda, olhar) * (-lado)
    # gira a fenda em torno do olhar: canto de fora sobe
    b = np.radians(OLHO_INCLINA)
    f2 = fenda * np.cos(b) + cima * np.sin(b)
    c2 = -fenda * np.sin(b) + cima * np.cos(b)
    R = np.stack([f2, olhar, c2], axis=1)
    return centro, R


def forma():
    """Volumes do corpo (sem orelhas, olhos e língua, que são malhas à parte)."""
    F = Forma()
    E, K = Elipsoide, Cone

    def el(c, s, rot=None, **kw):
        # c e s em (f, l, u); a rotação já em Blender
        cf, cl, cu = c
        sf, sl, su = s
        return F.adicionar(E(P(cf, cl, cu), (sl, sf, su), rot, **kw))

    def par(fn):
        for lado in (1, -1):
            fn(lado, 'e' if lado > 0 else 'd')

    # ---- tronco
    el((0.100, 0.0, 0.388), (0.165, 0.088, 0.118), regiao='tronco', k=0.0)
    el((0.125, 0.0, 0.318), (0.125, 0.060, 0.056), regiao='tronco', k=0.045)
    F.adicionar(K(P(0.020, 0, 0.436), P(-0.150, 0, 0.446), 0.082, 0.073, regiao='tronco', k=0.05, achata=(0.80, 1.0)))
    el((-0.205, 0.0, 0.448), (0.092, 0.068, 0.056), inclina(-8), regiao='tronco', k=0.04)
    # cernelha e base do pescoço
    el((0.205, 0.0, 0.468), (0.080, 0.064, 0.058), regiao='pescoco', k=0.045)
    # peito (prosterno) entre as patas
    el((0.258, 0.0, 0.336), (0.048, 0.066, 0.068), regiao='tronco', k=0.04)

    # ---- pescoço
    F.adicionar(K(P(0.200, 0, 0.432), P(0.322, 0, 0.574), 0.084, 0.052, regiao='pescoco', k=0.05, achata=(0.86, 1.0),
            cima=P(-0.6, 0, 0.8)))
    el((0.285, 0.0, 0.503), (0.055, 0.048, 0.050), regiao='pescoco', k=0.04)

    def pata(c, lado, reg):
        """Pata com almofada principal e quatro dedos na frente."""
        F.adicionar(E(c + P(-0.004, 0, 0.0), (0.024, 0.026, 0.0185), None, regiao=reg, k=0.014))
        for (df, dl, dz) in ((0.017, 0.0085, -0.0085), (0.017, -0.0085, -0.0085),
                             (0.008, 0.0215, -0.0095), (0.008, -0.0215, -0.0095)):
            F.adicionar(E(c + P(df, dl, dz), (0.0105, 0.0125, 0.0115), None, regiao=reg, k=0.008))

    # ---- patas da frente
    def pata_frente(lado, s):
        reg = 'pata_f' + s
        topo, ombro, cot = junta('escapula_topo', lado), junta('ombro', lado), junta('cotovelo', lado)
        carpo, mcp, dedo = junta('carpo', lado), junta('mcp_f', lado), junta('dedo_f', lado)
        fora = np.array([lado, 0, 0], dtype=float)
        # musculatura da escápula
        dirs = normalizar(ombro - topo)
        c = topo + 0.50 * (ombro - topo) + fora * 0.004
        F.adicionar(E(c, (0.026, 0.085, 0.050), base_de(dirs, fora)[:, [2, 1, 0]], regiao='ombro' + s, k=0.05))
        # ponta do ombro
        F.adicionar(E(ombro + P(0.004, -0.006 * lado, 0.0), (0.026, 0.032, 0.034), None, regiao='ombro' + s, k=0.04))
        # braço (tríceps atrás do úmero)
        dirb = normalizar(cot - ombro)
        tras = P(-1, 0, 0)
        c = ombro + 0.55 * (cot - ombro) + tras * 0.018
        F.adicionar(E(c, (0.029, 0.060, 0.038), base_de(dirb, fora)[:, [2, 1, 0]], regiao=reg, k=0.05))
        # olécrano (ponta do cotovelo)
        F.adicionar(E(cot + P(-0.018, 0, 0.008), (0.018, 0.018, 0.020), None, regiao=reg, k=0.03))
        # antebraço
        F.adicionar(K(cot + P(0, 0, 0.006), carpo, 0.027, 0.0175, regiao=reg, k=0.02))
        c = cot + 0.30 * (carpo - cot) + P(0.007, 0, 0)
        F.adicionar(E(c, (0.022, 0.022, 0.050), None, regiao=reg, k=0.025))
        # carpo, metacarpo e pata
        F.adicionar(E(carpo, (0.019, 0.019, 0.019), None, regiao=reg, k=0.010))
        F.adicionar(K(carpo, mcp, 0.0175, 0.0155, regiao=reg, k=0.010))
        pata((mcp + dedo) / 2, lado, reg)
    par(pata_frente)

    # ---- patas de trás
    def pata_tras(lado, s):
        reg = 'pata_t' + s
        anca, joelho, jar = junta('anca', lado), junta('joelho', lado), junta('jarrete', lado)
        mtp, dedo = junta('mtp_t', lado), junta('dedo_t', lado)
        fora = np.array([lado, 0, 0], dtype=float)
        # coxa: massa larga e achatada que afunila até o joelho
        F.adicionar(K(P(-0.215, 0.060 * lado, 0.388), joelho + P(-0.012, 0, 0.014), 0.078, 0.036, regiao='coxa' + s,
                k=0.035, achata=(0.58, 1.0), cima=P(1, 0, 0)))
        # posterior da coxa (do ísquio para a panturrilha)
        F.adicionar(K(P(-0.262, 0.050 * lado, 0.405), P(-0.200, 0.066 * lado, 0.236), 0.048, 0.026, regiao='coxa' + s,
                k=0.03, achata=(0.75, 1.0), cima=P(1, 0, 0)))
        # joelho
        F.adicionar(E(joelho + P(0.002, 0, 0.006), (0.024, 0.023, 0.028), None, regiao=reg, k=0.03))
        # segunda coxa (perna) com a panturrilha atrás
        F.adicionar(K(joelho, jar, 0.030, 0.017, regiao=reg, k=0.025))
        dirt = normalizar(jar - joelho)
        trasp = normalizar(np.cross(dirt, fora)) * 1.0
        if trasp[1] < 0:  # precisa apontar para trás (+Y no Blender)
            trasp = -trasp
        c = joelho + 0.36 * (jar - joelho) + trasp * 0.014
        F.adicionar(E(c, (0.025, 0.058, 0.028), base_de(dirt, fora)[:, [2, 1, 0]], regiao=reg, k=0.02))
        # tendão de Aquiles até a ponta do jarrete
        a = joelho + 0.42 * (jar - joelho) + trasp * 0.024
        b = jar + P(-0.019, 0, 0.004)
        F.adicionar(K(a, b, 0.0105, 0.0105, regiao=reg, k=0.016))
        F.adicionar(E(jar + P(-0.015, 0, 0.002), (0.016, 0.014, 0.016), None, regiao=reg, k=0.012))
        # metatarso e pata
        F.adicionar(K(jar, mtp, 0.0175, 0.0150, regiao=reg, k=0.012))
        pata((mtp + dedo) / 2, lado, reg)
    par(pata_tras)

    # ---- cabeça (referencial do crânio)
    def cr(c, s, rot=None, **kw):
        return F.adicionar(E(C(*c), s, rot_cranio(rot), **kw))

    # semieixos no referencial do crânio, ordem (lado, frente, cima) como no mundo
    cr((0.058, 0.0, 0.034), (0.050, 0.066, 0.046), regiao='cabeca', k=0.0)
    cr((0.014, 0.0, 0.028), (0.040, 0.040, 0.040), regiao='cabeca', k=0.03)
    cr((0.090, 0.0, 0.044), (0.033, 0.030, 0.024), regiao='cabeca', k=0.02)
    for lado in (1, -1):
        # arco zigomático (bochecha) e masseter
        cr((0.074, 0.034 * lado, 0.006), (0.028, 0.044, 0.030), regiao='cabeca', k=0.025)
        cr((0.058, 0.030 * lado, -0.018), (0.020, 0.030, 0.024), regiao='cabeca', k=0.02)
        # sobrancelha
        cr((0.098, 0.027 * lado, 0.045), (0.016, 0.022, 0.011), regiao='cabeca', k=0.015)
        # lábio de cima, caindo um pouco dos lados do focinho
        cr((0.156, 0.015 * lado, -0.020), (0.0115, 0.042, 0.0125), regiao='cabeca', k=0.016)
    F.adicionar(K(C(0.105, 0, 0.006), C(0.184, 0, -0.001), 0.031, 0.0205, regiao='cabeca', k=0.03,
            achata=(0.90, 1.0), cima=matriz_cranio()[:, 2]))
    # trufa (nariz)
    cr((0.197, 0.0, 0.007), (0.0175, 0.0155, 0.0145), regiao='nariz', k=0.006)
    # mandíbula
    F.adicionar(K(C(0.070, 0, -0.031), C(0.176, 0, -0.032), 0.019, 0.0115, regiao='mandibula', k=0.02,
            cima=matriz_cranio()[:, 2]))
    for lado in (1, -1):
        F.adicionar(K(C(0.045, 0.032 * lado, -0.019), C(0.160, 0.011 * lado, -0.032), 0.013, 0.0095,
                regiao='mandibula', k=0.02))
    # garganta
    cr((0.030, 0.0, -0.034), (0.034, 0.052, 0.030), regiao='pescoco', k=0.035)
    # boca: fenda entre o lábio e a mandíbula
    cr((0.158, 0.0, -0.0255), (0.040, 0.058, 0.0030), regiao="boca", k=0.0025, subtrai=True)
    # órbitas
    for lado in (1, -1):
        c, R = olho_frame(lado)
        sx, sy, sz = OLHO_SEMI
        F.adicionar(Elipsoide(c + R[:, 1] * 0.0045, (sx * 1.04, sy * 1.15, sz * 1.0), R, regiao='cabeca', k=0.004,
                        subtrai=True))

    # ---- cauda
    pc = pontos_cauda()
    for i in range(len(pc) - 1):
        F.adicionar(K(pc[i], pc[i + 1], RAIOS_CAUDA[i], RAIOS_CAUDA[i + 1], regiao='cauda',
                k=0.035 if i == 0 else 0.006, achata=(0.92, 1.0)))
    return F


CAIXA = (P(0.62, 0.15, -0.01), P(-0.52, -0.15, 0.72))


def caixa():
    a, b = CAIXA
    return np.minimum(a, b), np.maximum(a, b)


# ---------------------------------------------------------------------------
# orelhas (semieretas, com a ponta dobrada para a frente)
# ---------------------------------------------------------------------------
ORELHA_BASE = (0.034, 0.041, 0.056)   # no crânio (x, l, z), lado esquerdo
ORELHA_ALTURA = 0.080
ORELHA_LARGURA = 0.056
ORELHA_DOBRA = 0.60                    # fração da altura onde a ponta dobra
ORELHA_ANG_DOBRA = 78.0                # quanto a ponta cai para a frente


def _suave(a, b, x):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def orelha_eixos(lado):
    """Eixos da orelha no Blender: (cima, largura, frente/normal) e a base."""
    M = matriz_cranio()
    cima = normalizar(M @ np.array([-0.18, 0.36 * lado, 0.92]))
    frente = M @ np.array([1.0, 0.55 * lado, 0.0])
    frente = normalizar(frente - cima * np.dot(frente, cima))
    largura = np.cross(cima, frente)
    base = C(ORELHA_BASE[0], ORELHA_BASE[1] * lado, ORELHA_BASE[2])
    return base, cima, largura, frente


def orelha_linha_central(lado, nu=8):
    """Pontos da linha central (base -> ponta) e o ângulo de cada um."""
    base, cima, largura, frente = orelha_eixos(lado)
    us = np.linspace(0.0, 1.0, nu)
    ang = np.radians(6.0 + ORELHA_ANG_DOBRA * _suave(ORELHA_DOBRA - 0.07, ORELHA_DOBRA + 0.12, us))
    pts = [base - cima * 0.010]
    for i in range(1, nu):
        a = 0.5 * (ang[i] + ang[i - 1])
        d = (np.cos(a) * cima + np.sin(a) * frente) * (ORELHA_ALTURA + 0.010) / (nu - 1)
        pts.append(pts[-1] + d)
    return us, np.array(pts), ang


def orelha_malha(lado, nu=8, nv=6):
    """Casca fechada da orelha. Devolve (verts, faces, u por vértice, máscara de pele interna)."""
    base, cima, largura, frente = orelha_eixos(lado)
    us, linha, ang = orelha_linha_central(lado, nu)
    vs = np.linspace(-1.0, 1.0, nv)
    verts, u_v, pele = [], [], []
    for lado_folha in (1, -1):          # 1 = face da frente (concha), -1 = costas
        for i, u in enumerate(us):
            n = -np.sin(ang[i]) * cima + np.cos(ang[i]) * frente   # normal da folha
            w = 0.5 * ORELHA_LARGURA * max(1.0 - u ** 1.35, 0.035)
            concha = 0.011 * (1.0 - 0.75 * u)
            esp = 0.0045 * (1.0 - u) + 0.0016
            for v in vs:
                p = linha[i] + largura * (v * w) - n * concha * (1.0 - v * v) + n * esp * lado_folha
                verts.append(p)
                u_v.append(u)
                pele.append(float(lado_folha > 0) * _suave(0.92, 0.62, abs(v)) * _suave(0.9, 0.66, u)
                            * _suave(0.02, 0.12, u))
    faces = []
    nvv = nv
    off = nu * nvv

    def idx(folha, i, j):
        return folha * off + i * nvv + j
    for i in range(nu - 1):
        for j in range(nv - 1):
            faces.append([idx(0, i, j), idx(0, i, j + 1), idx(0, i + 1, j + 1), idx(0, i + 1, j)])
            faces.append([idx(1, i, j), idx(1, i + 1, j), idx(1, i + 1, j + 1), idx(1, i, j + 1)])
        # bordas laterais
        faces.append([idx(0, i, 0), idx(0, i + 1, 0), idx(1, i + 1, 0), idx(1, i, 0)])
        faces.append([idx(0, i, nv - 1), idx(1, i, nv - 1), idx(1, i + 1, nv - 1), idx(0, i + 1, nv - 1)])
    for j in range(nv - 1):
        # base e ponta
        faces.append([idx(0, 0, j), idx(1, 0, j), idx(1, 0, j + 1), idx(0, 0, j + 1)])
        faces.append([idx(0, nu - 1, j), idx(0, nu - 1, j + 1), idx(1, nu - 1, j + 1), idx(1, nu - 1, j)])
    return np.array(verts), faces, np.array(u_v), np.array(pele)


def esfera(centro, R, semi, seg=10, aneis=7):
    """Elipsoide de malha (para os olhos)."""
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
        a1 = a0 + seg
        for j in range(seg):
            faces.append([a0 + j, a0 + (j + 1) % seg, a1 + (j + 1) % seg, a1 + j])
    topo = len(verts) - 1
    a0 = 1 + (aneis - 2) * seg
    for j in range(seg):
        faces.append([a0 + j, a0 + (j + 1) % seg, topo])
    V = np.array(verts)
    # eixo z da esfera unitária = coluna "olhar" (1) do R para os polos ficarem na frente/trás
    loc = np.stack([V[:, 0] * semi[0], V[:, 2] * semi[1], V[:, 1] * semi[2]], axis=1)
    return centro[None] + loc @ R.T, faces
