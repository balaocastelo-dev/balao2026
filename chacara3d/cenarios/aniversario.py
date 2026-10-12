"""Adereços da festa de aniversário."""
import math

import numpy as np

import base as B
from base import TAU


# ----------------------------------------------------------------- toalhas

def _ret_arredondado(a, b, rc, n_lado_a, n_lado_b, n_canto):
    """Contorno de retângulo de cantos redondos (meias medidas a, b), anti-horário, começando em +X.

    Devolve pontos (N,2), normais para fora (N,2) e o "peso de canto" (0 no meio do lado, 1 no canto).
    """
    pts, nrm, canto = [], [], []

    def lado(p0, p1, nv, n):
        for t in np.linspace(0, 1, n, endpoint=False):
            p = p0 + (p1 - p0) * t
            pts.append(p)
            nrm.append(nv)
            canto.append(0.0)
    cs = [(a - rc, b - rc, 0), (-(a - rc), b - rc, 90), (-(a - rc), -(b - rc), 180), (a - rc, -(b - rc), 270)]
    # lado direito (+X) de baixo para cima até o canto 0, etc.
    seq = []
    for k, (cx, cy, ang) in enumerate(cs):
        seq.append((cx, cy, ang))
    for k, (cx, cy, ang) in enumerate(seq):
        # lado antes do canto k
        if k == 0:
            lado(np.array([a, -(b - rc)]), np.array([a, b - rc]), np.array([1.0, 0]), n_lado_b)
        elif k == 1:
            lado(np.array([a - rc, b]), np.array([-(a - rc), b]), np.array([0, 1.0]), n_lado_a)
        elif k == 2:
            lado(np.array([-a, b - rc]), np.array([-a, -(b - rc)]), np.array([-1.0, 0]), n_lado_b)
        else:
            lado(np.array([-(a - rc), -b]), np.array([a - rc, -b]), np.array([0, -1.0]), n_lado_a)
        for t in np.linspace(0, 90, n_canto, endpoint=False):
            r = math.radians(ang + t)
            nv = np.array([math.cos(r), math.sin(r)])
            pts.append(np.array([cx, cy]) + rc * nv)
            nrm.append(nv)
            canto.append(math.sin(math.radians(t * 2)) ** 0.5)
    return np.array(pts), np.array(nrm), np.array(canto)


def _toalha_retangular(a, b, h, chao=0.006, semente=1):
    """Toalha até o chão sobre mesa retangular (meias medidas a, b; altura h)."""
    rng = B.rng(semente)
    tile = 0.04
    na, nb, nc = 30, 14, 9
    rb = 0.012                    # raio da borda do tampo
    linhas = []
    # 1) borda: quarto de círculo saindo do tampo
    for t in np.linspace(0, math.pi / 2, 4):
        linhas.append(('borda', rb * math.sin(t), h - rb * (1 - math.cos(t)), 0.0))
    # 2) queda
    nq = 11
    for i in range(1, nq + 1):
        s = i / nq
        z = (h - rb) * (1 - s) + chao * s
        linhas.append(('queda', rb, z, s))
    # 3) bainha virada para dentro
    linhas.append(('bainha', rb - 0.008, chao + 0.004, 1.0))
    P0, N0, C0 = _ret_arredondado(a, b, 0.03, na, nb, nc)
    ncol = len(P0)
    # dobras ao longo do contorno: senos de vários comprimentos + cascatas nos cantos
    arco = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(P0, axis=0), axis=1))])
    fase1, fase2 = rng.uniform(0, TAU, 2)
    ondas = 0.6 * np.sin(arco / 0.21 * TAU / 2 + fase1) + 0.4 * np.sin(arco / 0.13 * TAU / 2 + fase2)
    P = np.zeros((len(linhas), ncol, 3))
    UV = np.zeros((len(linhas), ncol, 2))
    comp = 0.0
    for i, (tipo, off, z, s) in enumerate(linhas):
        if tipo == 'queda':
            # o pano abre um pouco embaixo e o canto vira um cone (sobra de tecido)
            abre = 0.012 * s ** 1.5
            amp = (0.006 + 0.018 * s ** 1.4)
            canto = C0 * (0.03 + 0.06 * s ** 1.2)
            desloc = off + abre + amp * ondas * (1 - 0.6 * C0) + canto
            # pregas de canto: duas dobras fundas
            desloc += C0 * s ** 1.3 * 0.03 * np.sin(np.clip(C0, 0, 1) * math.pi * 2.0)
        elif tipo == 'bainha':
            s = 1.0
            abre = 0.012
            amp = 0.024
            canto = C0 * 0.09
            desloc = off + abre + amp * ondas * (1 - 0.6 * C0) + canto
        else:
            desloc = np.full(ncol, off)
        xy = P0 + N0 * desloc[:, None]
        P[i, :, 0] = xy[:, 0]
        P[i, :, 1] = xy[:, 1]
        P[i, :, 2] = z + (0.004 * np.sin(arco * 9.0) * s if tipo != 'borda' else 0)
        if i > 0:
            comp += float(np.mean(np.linalg.norm(P[i] - P[i - 1], axis=1)))
        UV[i, :, 0] = arco / tile
        UV[i, :, 1] = comp / tile
    saia = B.grade('saia', P, fechar_u=True, mat='toalha_branca', uv=UV, suave=True)
    # tampo
    topo = P[0]
    vs = [tuple(p) for p in topo]
    tampo = B.malha('tampo', vs, [list(range(len(vs)))], mat='toalha_branca',
                    uv=np.array([(p[0] / tile, p[1] / tile) for p in vs]), suave=True)
    return [saia, tampo]


def _toalha_redonda(R, h, chao=0.006, ndobras=15, semente=2):
    rng = B.rng(semente)
    tile = 0.04
    n = 84
    ang = np.arange(n) / n * TAU
    fases = rng.uniform(0, TAU, 3)
    irreg = 1 + 0.35 * np.sin(ang * 3 + fases[0]) + 0.2 * np.sin(ang * 5 + fases[1])
    dob = np.sin(ang * ndobras + 0.4 * np.sin(ang * 4 + fases[2]))
    rb = 0.012
    linhas = []
    for t in np.linspace(0, math.pi / 2, 4):
        linhas.append((R + rb * math.sin(t), h - rb * (1 - math.cos(t)), 0.0))
    nq = 11
    for i in range(1, nq + 1):
        s = i / nq
        linhas.append((R + rb, (h - rb) * (1 - s) + chao * s, s))
    P = np.zeros((len(linhas) + 1, n, 3))
    UV = np.zeros((len(linhas) + 1, n, 2))
    comp = 0.0
    for i, (r, z, s) in enumerate(linhas):
        rr = r + 0.03 * s ** 1.3 + (0.004 + 0.032 * s ** 1.5) * dob * irreg
        P[i, :, 0] = rr * np.cos(ang)
        P[i, :, 1] = rr * np.sin(ang)
        P[i, :, 2] = z + 0.004 * s * np.sin(ang * 7 + fases[1])
        if i > 0:
            comp += float(np.mean(np.linalg.norm(P[i] - P[i - 1], axis=1)))
        UV[i, :, 0] = ang * R / tile
        UV[i, :, 1] = comp / tile
    # bainha para dentro
    rr = np.hypot(P[-2, :, 0], P[-2, :, 1]) - 0.008
    P[-1, :, 0] = rr * np.cos(ang)
    P[-1, :, 1] = rr * np.sin(ang)
    P[-1, :, 2] = chao + 0.004
    UV[-1] = UV[-2] + np.array([0, 0.2])
    saia = B.grade('saia', P, fechar_u=True, mat='toalha_branca', uv=UV, suave=True)
    vs = [tuple(p) for p in P[0]]
    tampo = B.malha('tampo', vs, [list(range(len(vs)))], mat='toalha_branca',
                    uv=np.array([(p[0] / tile, p[1] / tile) for p in vs]), suave=True)
    return [saia, tampo]


def mesa_bolo():
    return B.juntar('mesa_bolo', _toalha_retangular(0.9, 0.4, 0.76))


def mesa_redonda_festa():
    return B.juntar('mesa_redonda_festa', _toalha_redonda(0.6, 0.76))


# ----------------------------------------------------------------- bolo

def _borda_conchas(R, z, r, n_conchas, mat):
    """Borda de chantilly em conchinhas (toro com raio que pulsa)."""
    nu = n_conchas * 3
    ob = B.toro('borda', R, r, nu=nu, nv=6, mat=mat,
                raio_v=lambda a: r * (0.45 + 0.55 * abs(math.sin(a * n_conchas / 2)) ** 0.6))
    # achata um pouco e torce as conchas (aparência de bico de confeitar)
    B.deformar(ob, lambda v: np.column_stack([v[:, 0], v[:, 1], v[:, 2] * 0.85]))
    B.mover(ob, (0, 0, z))
    return ob


def _morango(p, ang):
    perfil = [(0, 0), (0.006, 0.003), (0.010, 0.009), (0.011, 0.015), (0.009, 0.020), (0.0, 0.022)]
    m = B.torno('morango', perfil, n=8, mat='morango')
    B.deformar(m, lambda v: v + np.column_stack([np.zeros(len(v)), np.zeros(len(v)), 0.0006 * np.sin(v[:, 0] * 900) * np.cos(v[:, 1] * 900)]))
    # coroa de folhinhas
    fol = []
    for k in range(5):
        a = k / 5 * TAU
        fol.append((0, 0, 0.022))
        fol.append((0.009 * math.cos(a - 0.25), 0.009 * math.sin(a - 0.25), 0.0205))
        fol.append((0.011 * math.cos(a), 0.011 * math.sin(a), 0.0185))
        fol.append((0.009 * math.cos(a + 0.25), 0.009 * math.sin(a + 0.25), 0.0205))
    faces = [[4 * k, 4 * k + 1, 4 * k + 2, 4 * k + 3] for k in range(5)]
    f = B.malha('folhas', fol, faces, mat='folha_morango', suave=True)
    ob = B.juntar('morango', [m, f])
    B.girar(ob, (180 + 25, 0, 0))     # deitado, ponta para fora
    B.girar(ob, (0, 0, math.degrees(ang) - 90))
    B.mover(ob, p)
    return ob


def _vela(p, cor_faixa, semente):
    rng = B.rng(semente)
    h = 0.065
    r = 0.0042
    n = 8
    zs = np.linspace(0, h, 9)
    perfil = [(0, 0)] + [(r, z) for z in zs] + [(0, h)]
    v = B.torno('vela', perfil, n=n, mat='vela', suave=True)
    # faixas em espiral pela cor de vértice
    vv = B.verts(v)
    a = np.arctan2(vv[:, 1], vv[:, 0])
    faixa = (np.sin(a + vv[:, 2] / h * TAU * 2.5) > 0)
    branco = np.array([0.95, 0.95, 0.95])
    cor = np.where(faixa[:, None], np.array(cor_faixa), branco)
    B.definir_cores(v, cor)
    pav = B.cilindro('pavio', 0.0007, 0.008, n=4, mat='pavio', centro=(0, 0, h))
    B.definir_cores(pav, (1, 1, 1))
    ch = B.torno('chama', [(0, 0), (0.0022, 0.003), (0.0032, 0.008), (0.0024, 0.013), (0.0010, 0.018), (0, 0.022)],
                 n=8, mat='chama')
    B.escalar(ch, (1, 0.9, 1))
    B.mover(ch, (0, 0, h + 0.004))
    B.definir_cores(ch, (1, 1, 1))
    ob = B.juntar('vela', [v, pav, ch])
    B.girar(ob, (rng.uniform(-3, 3), rng.uniform(-3, 3), rng.uniform(0, 360)))
    B.mover(ob, p)
    return ob


def bolo():
    partes = []
    # boleira de porcelana
    perfil = [(0, 0), (0.085, 0), (0.088, 0.004), (0.085, 0.011), (0.06, 0.016), (0.03, 0.026),
              (0.022, 0.05), (0.024, 0.075), (0.04, 0.086), (0.168, 0.09), (0.172, 0.096), (0.168, 0.101),
              (0.15, 0.1), (0, 0.1)]
    boleira = B.torno('boleira', perfil, n=40, mat='porcelana', suave=40)
    partes.append(boleira)
    z0 = 0.1
    # andar de baixo (rosa)
    r1, h1 = 0.14, 0.115
    c = 0.012
    perf1 = [(0, z0), (r1, z0)] + [(r1 - c + c * math.cos(t), z0 + h1 - c + c * math.sin(t)) for t in np.linspace(0, math.pi / 2, 4)] + [(0, z0 + h1)]
    t1 = B.torno('andar1', perf1, n=48, mat='cobertura_rosa', suave=50)
    B.deformar(t1, lambda v: v + np.column_stack([v[:, 0], v[:, 1], np.zeros(len(v))]) * 0.012 * B.ruido3(v, 30, 1)[:, None] * (v[:, 2] < z0 + h1 - 0.004)[:, None])
    partes.append(t1)
    partes.append(_borda_conchas(r1 + 0.001, z0 + 0.007, 0.0085, 26, 'cobertura_branca'))
    partes.append(_borda_conchas(r1 - 0.012, z0 + h1 + 0.002, 0.0075, 24, 'cobertura_branca'))
    # morangos na beira do andar de baixo
    for k in range(9):
        a = k / 9 * TAU + 0.2
        rr = 0.115
        partes.append(_morango((rr * math.cos(a), rr * math.sin(a), z0 + h1 + 0.004), a))
    # andar de cima (branco) com escorrido rosa
    z1 = z0 + h1
    r2, h2 = 0.09, 0.095
    perf2 = [(0, z1), (r2, z1)] + [(r2 - c + c * math.cos(t), z1 + h2 - c + c * math.sin(t)) for t in np.linspace(0, math.pi / 2, 4)] + [(0, z1 + h2)]
    t2 = B.torno('andar2', perf2, n=40, mat='cobertura_branca', suave=50)
    partes.append(t2)
    # escorrido: faixa por fora do andar de cima, com pingos de comprimentos variados
    rng = B.rng(4)
    n = 80
    ang = np.arange(n) / n * TAU
    gotas = np.zeros(n)
    for k in range(16):
        centro = k / 16 * TAU + rng.uniform(-0.08, 0.08)
        L = rng.uniform(0.012, 0.045)
        d = np.angle(np.exp(1j * (ang - centro)))
        gotas = np.maximum(gotas, L * np.clip(1 - (d / 0.11) ** 2, 0, 1) ** 0.5)
    ztopo = z1 + h2
    linhas = []
    for t in np.linspace(0, math.pi / 2, 4):
        linhas.append((r2 - c + (c + 0.0025) * math.sin(t), ztopo - c + (c + 0.0025) * math.cos(t) - (0 if t < 1e-6 else 0)))
    P = []
    for (rr, zz) in linhas:
        P.append(np.column_stack([rr * np.cos(ang), rr * np.sin(ang), np.full(n, zz)]))
    base_esc = ztopo - c
    for s in (0.35, 0.7, 0.92, 1.0):
        zz = base_esc - (0.006 + gotas) * s
        rr = r2 + 0.0025 + 0.0018 * (s > 0.9) * (gotas > 0.004)
        if s == 1.0:
            rr = r2 + 0.0008
            zz = zz + 0.0015
        P.append(np.column_stack([rr * np.cos(ang), rr * np.sin(ang), zz]))
    P = np.array(P)
    esc = B.grade('escorrido', P, fechar_u=True, mat='cobertura_rosa', suave=True, inverter=True)
    tampa = B.malha('tampa_rosa', [tuple(p) for p in P[0]], [list(range(n))], mat='cobertura_rosa', suave=True)
    B.mover(tampa, (0, 0, 0.0001))
    partes += [esc, tampa]
    # velinhas
    cores = [(0.9, 0.25, 0.45), (0.2, 0.55, 0.9), (0.95, 0.75, 0.15), (0.3, 0.75, 0.4), (0.7, 0.4, 0.9), (0.9, 0.25, 0.45)]
    pos = [(0, 0)] + [(0.045 * math.cos(k / 5 * TAU + 0.3), 0.045 * math.sin(k / 5 * TAU + 0.3)) for k in range(5)]
    for i, (x, y) in enumerate(pos):
        partes.append(_vela((x, y, ztopo + 0.0015), cores[i], 10 + i))
    ob = B.juntar('bolo', partes)
    return ob


# ----------------------------------------------------------------- doces

def bandeja_doces():
    partes = []
    sx, sy = 0.36, 0.26
    fundo = B.caixa('fundo', sx, sy, 0.006, mat='bandeja_prata', chanfro=0.002, seg=1)
    partes.append(fundo)
    # borda vazada em perfil
    contorno = []
    a, b, rc = sx / 2, sy / 2, 0.03
    pts, nrm, _ = _ret_arredondado(a, b, rc, 6, 4, 4)
    pts = np.vstack([pts, pts[:1]])
    perfil = [(0.0, 0.0), (0.004, 0.0), (0.012, 0.016), (0.016, 0.02), (0.013, 0.022), (0.008, 0.018), (0.0, 0.006)]
    P = np.zeros((len(pts) - 1, len(perfil), 3))
    nrm = np.vstack([nrm])
    for i in range(len(pts) - 1):
        for j, (d, z) in enumerate(perfil):
            P[i, j] = (pts[i, 0] + nrm[i, 0] * (d - 0.004), pts[i, 1] + nrm[i, 1] * (d - 0.004), z + 0.004)
    borda = B.grade('borda', np.transpose(P, (1, 0, 2)), fechar_u=True, mat='bandeja_prata', suave=40)
    partes.append(borda)
    k = 0
    for i in range(5):
        for j in range(3):
            x = (i - 2) * 0.063
            y = (j - 1) * 0.066
            brig = (i + j) % 2 == 0
            partes += _docinho((x, y, 0.006), brig, k)
            k += 1
    return B.juntar('bandeja_doces', partes)


def _docinho(p, brigadeiro, semente):
    rng = B.rng(100 + semente)
    n = 12
    ang = np.arange(n * 2) / (n * 2) * TAU
    # forminha plissada
    linhas = []
    for (r, z) in [(0.0, 0.0005), (0.015, 0.0005), (0.017, 0.006), (0.021, 0.015)]:
        rr = r * (1 + 0.06 * np.cos(ang * n) * (r > 0.016))
        linhas.append(np.column_stack([rr * np.cos(ang), rr * np.sin(ang), np.full(len(ang), z)]))
    form = B.grade('forminha', np.array(linhas), fechar_u=True, mat='forminha_dourada' if brigadeiro else 'forminha_rosa', suave=60)
    r = 0.0145
    if brigadeiro:
        bola = B.torno('bola', [(0, -r)] + [(r * math.cos(t), r * math.sin(t)) for t in np.linspace(-math.pi / 2 + 0.3, math.pi / 2 - 0.3, 6)] + [(0, r)],
                       n=10, mat='brigadeiro', uv='grade')
        B.escalar(bola, (1, 1, 0.92))
        partes = [form, bola]
    else:
        bola = B.esfera('bola', r, nu=10, nv=7, mat='beijinho')
        B.deformar(bola, lambda v: v * (1 + 0.06 * B.ruido3(v, 400, semente))[:, None])
        B.escalar(bola, (1, 1, 0.9))
        cravo = B.cilindro('cravo', 0.0012, 0.006, n=5, mat='cravo', centro=(0, 0, r * 0.88))
        cab = B.esfera('cabeca', 0.0022, nu=5, nv=3, mat='cravo', centro=(0, 0, r * 0.9 + 0.006))
        partes = [form, bola, cravo, cab]
    for o in partes[1:]:
        B.mover(o, (0, 0, r * 0.95))
    ob = B.juntar('docinho', partes)
    B.girar(ob, (0, 0, rng.uniform(0, 360)))
    B.mover(ob, p)
    return [ob]


# ----------------------------------------------------------------- presentes

def _laco(p, larg, mat, giro, esc=1.0):
    """Laço de fita: duas alças, duas pontas e o nó."""
    partes = []
    w = 0.026 * esc
    for lado in (-1, 1):
        t = np.linspace(0, TAU, 22)
        # alça em gota, inclinada para fora
        L = 0.055 * esc
        x = lado * (L * (1 - np.cos(t)) / 2) * 1.0
        z = 0.022 * esc * np.sin(t) + 0.018 * esc * (1 - np.cos(t)) / 2
        y = 0.004 * np.sin(t)
        pts = np.column_stack([x, y, z])
        partes.append(B.fita('alca', pts, w, espessura=0.0015, mat=mat, cima=(0, 1, 0)))
        # ponta caída
        s = np.linspace(0, 1, 6)
        pts = np.column_stack([lado * (0.006 + 0.035 * s) * esc, -0.01 * s * esc + 0.02 * s, -0.0 * s + 0.002 + 0.0 * s])
        pts[:, 2] = 0.0015
        partes.append(B.fita('ponta', pts, w * 0.9, espessura=0.0015, mat=mat, cima=(0, 0, 1)))
    no = B.esfera('no', 0.012 * esc, nu=8, nv=5, mat=mat, esc=(1.0, 0.8, 0.7), centro=(0, 0, 0.008 * esc))
    partes.append(no)
    ob = B.juntar('laco', partes)
    B.girar(ob, (0, 0, giro))
    B.mover(ob, p)
    return ob


def _presente(sx, sy, sz, papel, fita, centro, giro, laco=True, esc_laco=1.0):
    partes = []
    cx = B.caixa('caixa', sx, sy, sz, mat=papel, chanfro=0.004, seg=2)
    if papel in ('papel_bolinhas', 'papel_listras'):
        B.uv_projetar(cx, tile=0.12)
    partes.append(cx)
    w = 0.03
    f1 = B.caixa('fita1', sx + 0.003, w, sz + 0.003, mat=fita, chanfro=0.001, seg=1, centro=(0, 0, -0.0015))
    f2 = B.caixa('fita2', w, sy + 0.003, sz + 0.003, mat=fita, chanfro=0.001, seg=1, centro=(0, 0, -0.0015))
    for f in (f1, f2):
        # tira a face de baixo não faz falta; mantém fechada (simples)
        pass
    partes += [f1, f2]
    if laco:
        partes.append(_laco((0, 0, sz + 0.0015), w, fita, 30, esc_laco))
    ob = B.juntar('presente', partes)
    B.girar(ob, (0, 0, giro))
    B.mover(ob, centro)
    return ob


def presentes():
    p = []
    p.append(_presente(0.40, 0.32, 0.26, 'papel_listras', 'fita_dourada', (0, 0, 0), 4, laco=False))
    p.append(_presente(0.28, 0.24, 0.19, 'papel_vermelho', 'fita_branca', (0.01, 0.0, 0.2615), 18, laco=False))
    p.append(_presente(0.16, 0.16, 0.13, 'papel_dourado', 'fita_vermelha', (0.0, 0.01, 0.453), -12, esc_laco=0.9))
    p.append(_presente(0.30, 0.22, 0.15, 'papel_bolinhas', 'fita_branca', (0.37, -0.12, 0), -20, esc_laco=1.1))
    p.append(_presente(0.18, 0.18, 0.21, 'papel_verde', 'fita_dourada', (-0.32, -0.14, 0), 12, esc_laco=0.85))
    ob = B.juntar('presentes', p)
    # recentra a pilha na origem (centro da base)
    v = B.verts(ob)
    c = (v[:, :2].min(axis=0) + v[:, :2].max(axis=0)) / 2
    B.mover(ob, (-c[0], -c[1], 0))
    return ob


# ----------------------------------------------------------------- balões

def _perfil_balao(esc=1.0, linhas=None):
    perfil = [(0, 0), (0.0065, 0.004), (0.0042, 0.012), (0.02, 0.026), (0.07, 0.06), (0.115, 0.12),
              (0.14, 0.19), (0.126, 0.255), (0.08, 0.296), (0, 0.312)]
    if linhas == 'pouco':
        perfil = [(0, 0), (0.006, 0.006), (0.022, 0.026), (0.085, 0.07), (0.128, 0.135), (0.138, 0.2), (0.11, 0.268), (0.06, 0.302), (0, 0.312)]
    elif linhas == 'minimo':
        perfil = [(0, 0), (0.02, 0.026), (0.11, 0.1), (0.14, 0.19), (0.09, 0.29), (0, 0.312)]
    return [(r * esc, z * esc) for r, z in perfil]


def balao(cor, p, d, esc=1.0, n=12, linhas=None, rolagem=0.0, achatar=1.0):
    ob = B.torno('balao', _perfil_balao(esc, linhas), n=n, mat=cor, suave=True)
    if achatar != 1.0:
        B.escalar(ob, (1, achatar, 1))
    B.orientar(ob, p, d, rolagem)
    return ob


def cacho_baloes():
    rng = B.rng(41)
    partes = []
    # peso: saquinho de papel laminado amassado
    peso = B.torno('peso', [(0, 0), (0.042, 0), (0.046, 0.012), (0.044, 0.04), (0.03, 0.055), (0.012, 0.062), (0.006, 0.075), (0.012, 0.085), (0, 0.088)],
                   n=16, mat='peso_balao', suave=55)
    B.deformar(peso, lambda v: v + np.column_stack([v[:, 0], v[:, 1], np.zeros(len(v))]) * 0.12 * B.ruido3(v, 90, 3)[:, None])
    partes.append(peso)
    topo_peso = np.array([0, 0, 0.082])
    cores = ['balao_vermelho', 'balao_dourado', 'balao_azul', 'balao_amarelo', 'balao_rosa', 'balao_branco', 'balao_lilas']
    # posições dos nós (onde a fita prende) e direções
    alvo = []
    alvo.append((0.0, 0.0, 1.92))
    for k in range(6):
        a = k / 6 * TAU + rng.uniform(-0.2, 0.2)
        r = 0.2 + rng.uniform(-0.03, 0.03)
        alvo.append((r * math.cos(a), r * math.sin(a), 1.66 + rng.uniform(-0.06, 0.06)))
    for i, q in enumerate(alvo):
        q = np.array(q)
        d = q - topo_peso
        d = d / np.linalg.norm(d)
        d2 = d + np.array([q[0], q[1], 0]) * 1.4
        d2 /= np.linalg.norm(d2)
        partes.append(balao(cores[i], tuple(q), tuple(d2), esc=0.95 + 0.1 * rng.uniform(), rolagem=rng.uniform(0, 360)))
        # fita: curva leve, do peso até o nó
        s = np.linspace(0, 1, 18)
        meio = np.array([rng.uniform(-0.05, 0.05), rng.uniform(-0.05, 0.05), 0])
        pts = topo_peso[None, :] * (1 - s[:, None]) + q[None, :] * s[:, None] + meio[None, :] * np.sin(s * math.pi)[:, None]
        pts[:, 0] += 0.008 * np.sin(s * 23 + i)
        partes.append(B.fita('fita', pts, 0.005, mat='fita_balao', cima=(0, 0, 1) if i % 2 else (1, 0, 0)))
        # cachinho de fita enrolada pendurado no nó
        t = np.linspace(0, 1, 30)
        hel = np.column_stack([0.012 * np.cos(t * TAU * 4), 0.012 * np.sin(t * TAU * 4), -0.16 * t])
        partes.append(B.fita('cachinho', q[None, :] + hel + np.array([0.01, 0, -0.005]), 0.004, mat='fita_balao', cima=(0, 0, 1)))
    return B.juntar('cacho_baloes', partes)


def _superelipse(t, a, b, n):
    c, s = np.cos(t), np.sin(t)
    x = a * np.sign(c) * np.abs(c) ** (2 / n)
    z = b * np.abs(s) ** (2 / n)
    return x, z


def arco_baloes():
    rng = B.rng(77)
    partes = []
    a, b, ex = 1.27, 2.13, 2.5
    # caminho por comprimento de arco
    t = np.linspace(0, math.pi, 600)
    x, z = _superelipse(t, a, b, ex)
    P = np.column_stack([x, np.zeros_like(x), z])
    s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))])
    L = s[-1]
    cores = ['balao_rosa', 'balao_branco', 'balao_dourado', 'balao_lilas']
    pesos = np.array([0.34, 0.3, 0.14, 0.22])
    passo = 0.26
    est = np.arange(0.12, L - 0.05, passo)
    for k, sk in enumerate(est):
        i = np.searchsorted(s, sk)
        c = P[min(i, len(P) - 1)]
        tg = P[min(i + 1, len(P) - 1)] - P[max(i - 1, 0)]
        tg /= np.linalg.norm(tg)
        nrm = np.array([tg[2], 0, -tg[0]])        # para fora do arco
        if nrm[2] < -0.5 and c[2] > 1.0:
            nrm = -nrm
        if np.dot(nrm, np.array([c[0], 0, c[2] - 0.8])) < 0:
            nrm = -nrm
        prof = np.array([0, 1.0, 0])
        # 3 balões grandes em volta do caminho (tipo trança) e 1-2 pequenos
        giro = k * 2.1
        for j in range(3):
            ang = giro + j * TAU / 3 + rng.uniform(-0.3, 0.3)
            dirr = nrm * math.cos(ang) + prof * math.sin(ang)
            gr = rng.choice([0.85, 1.0, 1.0, 1.25, 1.35])
            dist = 0.1 + 0.03 * gr
            centro = c + dirr * dist
            if centro[2] < 0.14 * gr:
                centro[2] = 0.14 * gr
            cor = rng.choice(cores, p=pesos)
            # o balão "olha" para fora (nó escondido para dentro)
            dd = dirr + rng.normal(0, 0.25, 3)
            dd /= np.linalg.norm(dd)
            hb = 0.17 * gr
            no = centro - dd * hb
            partes.append(balao(cor, tuple(no), tuple(dd), esc=gr, n=11, linhas='pouco',
                                rolagem=rng.uniform(0, 360), achatar=rng.uniform(0.85, 1.0)))
        for j in range(2 if k % 2 == 0 else 1):
            ang = rng.uniform(0, TAU)
            dirr = nrm * math.cos(ang) + prof * math.sin(ang)
            centro = c + dirr * 0.25 + tg * rng.uniform(-0.08, 0.08)
            if centro[2] < 0.06:
                continue
            dd = dirr / np.linalg.norm(dirr)
            cor = rng.choice(cores, p=pesos)
            gr = 0.42
            partes.append(balao(cor, tuple(centro - dd * 0.065), tuple(dd), esc=gr, n=8, linhas='minimo', rolagem=rng.uniform(0, 360)))
    ob = B.juntar('arco_baloes', partes)
    # encosta no chão
    v = B.verts(ob)
    B.mover(ob, (0, -0.0, -v[:, 2].min()))
    return ob


# ----------------------------------------------------------------- faixa

def faixa_parabens():
    partes = []
    letras = list('FELIZ') + [None] + list('ANIVERSÁRIO')
    meia = 1.25
    flecha = 0.11
    xs = []
    passo = 0.142
    total = passo * (len(letras) - 1)
    for i in range(len(letras)):
        xs.append(-total / 2 + i * passo)
    def cord_z(x):
        return -flecha * (1 - (x / meia) ** 2)
    # cordão
    xx = np.linspace(-meia, meia, 60)
    pts = np.column_stack([xx, np.zeros_like(xx), [cord_z(x) for x in xx]])
    partes.append(B.tubo('cordao', pts, 0.0022, n=5, mat='cordao', tampas=True))
    # laçadas nas pontas
    for sx in (-1, 1):
        t = np.linspace(0, TAU, 14)
        laco = np.column_stack([sx * meia + 0.012 * np.cos(t) * sx - 0.012 * sx, 0.0 * t, 0.012 * np.sin(t)])
        partes.append(B.tubo('laco', laco, 0.002, n=5, mat='cordao', fechado=True))
    w, h = 0.13, 0.175
    k = 0
    for i, L in enumerate(letras):
        if L is None:
            continue
        x = xs[i]
        z = cord_z(x)
        incl = math.degrees(math.atan(2 * flecha * x / meia ** 2))
        # bandeirola em ponta (pentágono), levemente curvada; frente para -Y
        cu, cv = (k % 4) / 4, 1 - (k // 4) / 4
        cols = 4
        verts, uvs = [], []
        for r in range(4):
            for c_ in range(cols + 1):
                u = c_ / cols
                v = r / 3
                # contorno: retângulo em cima e ponta embaixo
                vy = v
                px = (u - 0.5) * w
                pz = -vy * h * 0.72
                if r == 3:
                    pz = -h * 0.72 - (0.5 - abs(u - 0.5)) * 2 * h * 0.28
                py = -0.006 * math.sin(u * math.pi) - 0.003 * v
                verts.append((px, py, pz))
                tv = (-pz) / h
                uvs.append((cu + (0.04 + 0.92 * u) / 4, cv - (0.04 + 0.92 * tv) / 4))
        faces = []
        for r in range(3):
            for c_ in range(cols):
                a_ = r * (cols + 1) + c_
                faces.append([a_, a_ + 1, a_ + cols + 2, a_ + cols + 1][::-1])
        frente = B.malha('bandeirola', verts, faces, mat='faixa_letras', uv=np.array(uvs), suave=True)
        verso = B.malha('verso', [(px, py + 0.0008, pz) for (px, py, pz) in verts], [f[::-1] for f in faces], mat='faixa_verso', suave=True)
        # dobra sobre o cordão
        dob = B.malha('dobra', [(px, py + 0.0004, pz) for (px, py, pz) in verts[:cols + 1]] + [(px, 0.004, 0.006) for (px, py, pz) in verts[:cols + 1]],
                      [[c_, c_ + 1, c_ + cols + 2, c_ + cols + 1] for c_ in range(cols)], mat='faixa_verso', suave=True)
        band = B.juntar('band', [frente, verso, dob])
        B.girar(band, (0, -incl * 0.6, 0))
        B.mover(band, (x, 0, z - 0.004))
        partes.append(band)
        k += 1
    ob = B.juntar('faixa_parabens', partes)
    B.vazio('ponta_e', (-meia, 0, 0), pai=ob)
    B.vazio('ponta_d', (meia, 0, 0), pai=ob)
    return ob


# ----------------------------------------------------------------- cadeira, chapéu, copo, pratinho

def _perna(pts, r0, r1, aneis=(), n=8):
    """Perna torneada: amostra só onde precisa (pontas, curvas e anéis)."""
    pts = np.asarray(pts, dtype=float)
    s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(pts, axis=0), axis=1))])
    ts = set(np.round(s / s[-1], 4)) | {0.0, 1.0}
    for (ta, ra) in aneis:
        ts |= {round(ta - 0.035, 4), round(ta, 4), round(ta + 0.035, 4)}
    if len(pts) > 2:
        ts |= set(np.round(np.linspace(0, 1, 9), 4))
    t = np.array(sorted(x for x in ts if 0 <= x <= 1))
    ss = t * s[-1]
    P = np.column_stack([np.interp(ss, s, pts[:, i]) for i in range(3)])
    r = r0 + (r1 - r0) * t
    for (ta, ra) in aneis:
        r = r + ra * np.exp(-((t - ta) / 0.03) ** 2)
    return B.tubo('perna', P, r, n=n, mat='plastico_branco', suave=True)


def cadeira_festa():
    partes = []
    hz = 0.455
    # pernas da frente (frente = -Y)
    for sx in (-1, 1):
        partes.append(_perna([(sx * 0.185, -0.215, 0), (sx * 0.18, -0.2, hz - 0.01)], 0.0135, 0.016, aneis=[(0.3, 0.004), (0.62, 0.004), (0.9, 0.003)]))
        # traseiras contínuas até o encosto (levemente para trás)
        partes.append(_perna([(sx * 0.175, 0.235, 0), (sx * 0.178, 0.2, hz - 0.01), (sx * 0.172, 0.215, 0.7), (sx * 0.165, 0.245, 0.915)],
                             0.0135, 0.0125, aneis=[(0.17, 0.004), (0.36, 0.003)]))
    # travessas baixas
    for sx in (-1, 1):
        partes.append(B.tubo('trav', [(sx * 0.183, -0.207, 0.13), (sx * 0.176, 0.225, 0.13)], 0.0065, n=6, mat='plastico_branco'))
    partes.append(B.tubo('trav', [(-0.182, -0.207, 0.16), (0.182, -0.207, 0.16)], 0.0065, n=6, mat='plastico_branco'))
    partes.append(B.tubo('trav', [(-0.176, 0.226, 0.16), (0.176, 0.226, 0.16)], 0.0065, n=6, mat='plastico_branco'))
    # aro do assento
    contorno = [(-0.2, -0.215), (0.2, -0.215), (0.192, 0.205), (-0.192, 0.205)]
    aro = B.poligono_extrudado('assento', contorno, 0.035, mat='plastico_branco', chanfro=0.008, z0=hz - 0.035)
    partes.append(aro)
    # almofada
    alm = B.caixa('almofada', 0.37, 0.39, 0.045, mat='almofada_branca', chanfro=0.018, seg=2, centro=(0, -0.008, hz))
    B.deformar(alm, lambda v: np.column_stack([v[:, 0], v[:, 1], v[:, 2] + 0.006 * (1 - (v[:, 0] / 0.19) ** 2) * (1 - (v[:, 1] / 0.2) ** 2) * (v[:, 2] > hz + 0.02)]))
    partes.append(alm)
    # encosto: travessa de baixo, de cima e 4 balaústres
    def curva(z, y0):
        xs = np.linspace(-0.168, 0.168, 9)
        return np.column_stack([xs, y0 + 0.02 * (xs / 0.168) ** 2 * -1 + 0.02, np.full_like(xs, z)])
    partes.append(B.tubo('trav_enc', curva(0.6, 0.212), 0.0085, n=6, mat='plastico_branco'))
    partes.append(B.tubo('trav_enc', curva(0.905, 0.232), 0.012, n=8, mat='plastico_branco'))
    partes.append(B.tubo('trav_enc', curva(0.76, 0.222), 0.0065, n=6, mat='plastico_branco'))
    for xi in (-0.1, -0.034, 0.034, 0.1):
        yb = 0.212 + 0.02 - 0.02 * (xi / 0.168) ** 2
        yt = 0.232 + 0.02 - 0.02 * (xi / 0.168) ** 2
        partes.append(_perna([(xi, yb, 0.6), (xi, yt, 0.905)], 0.0065, 0.0065, aneis=[(0.22, 0.003), (0.53, 0.0035), (0.78, 0.003)], n=6))
    # pezinhos de borracha
    for (x, y) in ((-0.185, -0.215), (0.185, -0.215), (-0.175, 0.235), (0.175, 0.235)):
        partes.append(B.cilindro('pe', 0.0142, 0.006, n=8, mat='borracha', centro=(x, y, 0)))
    return B.juntar('cadeira_festa', partes)


def chapeu_festa():
    r, h = 0.065, 0.175
    perfil = [(r * (1 - t), h * t) for t in np.linspace(0, 1, 7)]
    cone = B.torno('cone', perfil, n=24, mat='chapeu_listras', uv='grade', suave=True)
    # franja de papel laminado na base e no topo
    aro = B.toro('aro', r + 0.001, 0.0035, nu=24, nv=5, mat='pompom_dourado', centro=(0, 0, 0.003))
    pom = B.esfera('pompom', 0.017, nu=10, nv=7, mat='pompom_dourado', centro=(0, 0, h + 0.008))
    B.deformar(pom, lambda v: (v - np.array([0, 0, h + 0.008])) * (1 + 0.18 * B.ruido3(v, 500, 5))[:, None] + np.array([0, 0, h + 0.008]))
    return B.juntar('chapeu_festa', [cone, aro, pom])


def copo_festa():
    h = 0.095
    pega = 0.045
    fora = B.torno('fora', [(0.026, 0), (0.037, h)], n=20, mat='copo_bolinhas', suave=True)
    B.uv_cilindrico(fora, tile_u=0.045, tile_v=0.045)
    B.deformar(fora, lambda v: v)
    dentro = B.torno('dentro', [(0.0355, h), (0.0248, 0.004), (0, 0.004)], n=20, mat='plastico_branco', suave=40)
    fundo = B.torno('fundo', [(0, 0.002), (0.026, 0.002), (0.026, 0)], n=20, mat='plastico_branco', suave=40)
    borda = B.toro('borda', 0.0368, 0.0018, nu=20, nv=5, mat='plastico_branco', centro=(0, 0, h))
    liq = B.torno('liquido', [(0, 0.075), (0.0335, 0.075)], n=20, mat='refrigerante', suave=True)
    ob = B.juntar('copo_festa', [fora, dentro, fundo, borda, liq])
    B.mover(ob, (0, 0, -pega))
    B.vazio('apoio', (0, 0, -pega), pai=ob)
    return ob


def pratinho_bolo():
    partes = []
    # prato de papel (frisado)
    n = 48
    ang = np.arange(n) / n * TAU
    linhas = []
    for (r, z) in [(0.0, 0.002), (0.055, 0.002), (0.065, 0.006), (0.078, 0.014), (0.081, 0.0145)]:
        rr = r * (1 + 0.012 * np.cos(ang * 24) * (r > 0.06))
        linhas.append(np.column_stack([rr * np.cos(ang), rr * np.sin(ang), np.full(n, z)]))
    prato = B.grade('prato', np.array(linhas), fechar_u=True, mat='prato_festa', suave=50)
    partes.append(prato)
    # fatia de bolo (cunha de 40°): massa, recheio, massa, recheio, massa, cobertura
    a0, a1 = math.radians(-20), math.radians(20)
    R = 0.07
    camadas = [('bolo_massa', 0.016), ('recheio_chocolate', 0.006), ('bolo_massa', 0.016), ('recheio_chocolate', 0.006), ('bolo_massa', 0.014), ('cobertura_rosa', 0.006)]
    z = 0.0025
    for mat, e in camadas:
        k = 6
        angs = np.linspace(a0, a1, k)
        base = [(0, 0)] + [(R * math.cos(t), R * math.sin(t)) for t in angs]
        vs = [(x, y, z) for x, y in base] + [(x, y, z + e) for x, y in base]
        m = len(base)
        faces = [list(range(m))[::-1], list(range(m, 2 * m))]
        for i in range(m):
            j = (i + 1) % m
            faces.append([i, j, m + j, m + i])
        cam = B.malha('camada', vs, faces, mat=mat, suave=None)
        B.suavizar(cam, 30)
        partes.append(cam)
        z += e
    # cobertura também na parte de fora (arco)
    fatia = B.juntar('fatia', partes[1:])
    B.mover(fatia, (-0.035, 0, 0))
    B.girar(fatia, (0, 0, 180))
    B.mover(fatia, (0.0, 0.0, 0))
    # garfinho de plástico
    cabo = B.caixa('cabo', 0.006, 0.09, 0.0018, mat='plastico_branco', chanfro=0.0008, seg=1)
    cab = B.caixa('cabeca', 0.016, 0.03, 0.0018, mat='plastico_branco', chanfro=0.0008, seg=1, centro=(0, 0.058, 0))
    dentes = [B.caixa('dente', 0.0028, 0.022, 0.0016, mat='plastico_branco', centro=(dx, 0.081, 0)) for dx in (-0.0062, -0.002, 0.002, 0.0062)]
    garfo = B.juntar('garfo', [cabo, cab] + dentes)
    B.girar(garfo, (6, 0, -55))
    B.mover(garfo, (0.03, 0.005, 0.0035))
    ob = B.juntar('pratinho_bolo', [prato, fatia, garfo])
    return ob


ADERECOS = [
    ('mesa_bolo', mesa_bolo, 'Mesa retangular de 1,8 x 0,8 x 0,76 m coberta com toalha branca até o chão, com caimento e dobras nos cantos.'),
    ('bolo', bolo, 'Bolo de dois andares (rosa com conchinhas brancas e morangos; branco com escorrido rosa) sobre boleira de porcelana, com seis velinhas acesas.'),
    ('bandeja_doces', bandeja_doces, 'Bandeja prateada com 15 docinhos em forminhas: brigadeiros (granulado) e beijinhos (com cravo).'),
    ('presentes', presentes, 'Pilha de cinco presentes embrulhados em papéis variados, com fitas e laços.'),
    ('cacho_baloes', cacho_baloes, 'Cacho de 7 balões de látex em fitas, preso num peso de papel laminado no chão (~2,2 m).',
     'cada balão usa o material da sua cor (balao_*)'),
    ('arco_baloes', arco_baloes, 'Arco orgânico de balões (rosa, branco, dourado e lilás) de ~3,0 m de largura por 2,4 m de altura.',
     'frente e verso iguais; os pés do arco ficam em x = ±1,3 m'),
    ('faixa_parabens', faixa_parabens, 'Faixa de bandeirolas "FELIZ ANIVERSÁRIO" num cordão de 2,5 m, para pendurar entre dois pontos.',
     'origem no meio da linha entre as duas pontas do cordão (o cordão faz barriga para baixo); filhos ponta_e (x = -1,25) e ponta_d (x = +1,25), esquerda e direita de quem lê; as letras olham para +Z'),
    ('mesa_redonda_festa', mesa_redonda_festa, 'Mesa redonda de Ø 1,2 m (0,76 m de altura) com toalha branca até o chão.'),
    ('cadeira_festa', cadeira_festa, 'Cadeira de festa branca empilhável (estilo Tiffany, resina) com almofada; assento a 0,46 m.',
     'quem senta olha para +Z'),
    ('chapeu_festa', chapeu_festa, 'Chapeuzinho de festa em cone listrado com pompom dourado; origem no centro da base (encaixe na cabeça).'),
    ('copo_festa', copo_festa, 'Copo de papel de festa (bolinhas coloridas) com refrigerante.',
     'origem no ponto da mão (meio do copo), eixo +Y; filho apoio no fundo para pousar na mesa'),
    ('pratinho_bolo', pratinho_bolo, 'Pratinho de papel com fatia de bolo recheado e garfinho de plástico.',
     'origem no centro do fundo do prato (é onde a mão segura por baixo e onde ele apoia)'),
]
