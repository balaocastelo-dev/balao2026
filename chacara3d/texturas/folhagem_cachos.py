"""Cachos de folhas (tipo "cacho"): um raminho por carta quadrada 1024 x 1024.

A base do raminho entra pelo meio da borda de baixo (u = 0,5, v = 0) e as
folhas ocupam a carta deixando cantos e vãos transparentes. Cada espécie tem
a sua folha (Especie) e o seu jeito de montar o raminho (função cacho_*).
"""
import math
import numpy as np
from folhagem_nucleo import cor, variar_cor, misturar
from folhagem_folha import Especie, Lobo, folha_plana
from folhagem_carta import Carta


# ================================================================== espécies
MANGA = Especie(
    'manga', [Lobo(0, 1.0, 0.26, a=0.95, b=1.3, ondula=0.015, nerv_n=24, nerv_ang=64, nerv_curva=0.45)],
    peciolo=(0.10, 0.0065), larg_central=0.0050, larg_lat=0.0015, terciarias=0.45,
    relevo_central=0.0016, relevo_lat=0.00035,
    paleta=dict(sup=cor('#2c4520'), inf=cor('#56693a'), nervura=cor('#98a060'), nervura_inf=cor('#a9ad78'),
                peciolo=cor('#6f7a3c'), lat=0.24, central=0.65, margem=-0.05))
MANGA_NOVA = dict(sup=cor('#6e3524'), inf=cor('#80503e'), nervura=cor('#9a5a3c'), nervura_inf=cor('#a0705a'),
                  peciolo=cor('#7a4030'), lat=0.18, central=0.5, amarelado=cor('#7a4a2a'), variacao=0.05)
MANGA_BRONZE = dict(sup=cor('#6a5428'), inf=cor('#7a6a40'), nervura=cor('#8f7a48'), nervura_inf=cor('#a09060'),
                    peciolo=cor('#706036'), lat=0.2, central=0.55, amarelado=cor('#6e6a30'))

AMENDOEIRA = Especie(
    'amendoeira', [Lobo(0, 1.0, 0.54, a=1.15, b=0.48, ondula=0.012, nerv_n=10, nerv_ang=58, nerv_curva=0.9)],
    peciolo=(0.06, 0.012), larg_central=0.0085, larg_lat=0.0030, terciarias=0.6,
    relevo_central=0.0018, relevo_lat=-0.0004,
    paleta=dict(sup=cor('#355a22'), inf=cor('#74884c'), nervura=cor('#a9b46c'), nervura_inf=cor('#c2c690'),
                peciolo=cor('#6a6a34'), lat=0.42, central=0.7, margem=-0.04))
AMENDOEIRA_OUTONO = dict(gradiente=[cor('#4a6a26'), cor('#9a9a30'), cor('#d0a028'), cor('#d06a20'), cor('#b8321c'),
                                    cor('#8a2418'), cor('#6a3a22')],
                         nervura=cor('#d8a050'), nervura_inf=cor('#e0b070'), inf=cor('#c08a50'),
                         peciolo=cor('#8a3a20'), lat=0.28, central=0.6)

JABUTICABA = Especie(
    'jabuticaba', [Lobo(0, 1.0, 0.30, a=0.85, b=1.35, ondula=0.01, nerv_n=17, nerv_ang=68, nerv_curva=0.25)],
    peciolo=(0.06, 0.010), larg_central=0.010, larg_lat=0.0030, intramarginal=0.014, terciarias=0.4,
    relevo_central=-0.0012, relevo_lat=0.0003,
    paleta=dict(sup=cor('#28411c'), inf=cor('#5f7440'), nervura=cor('#6f8a3e'), nervura_inf=cor('#a8b07a'),
                peciolo=cor('#5a4a2a'), lat=0.18, central=0.55, margem=-0.04))
JABUTICABA_NOVA = dict(sup=cor('#c87a62'), inf=cor('#cf9584'), nervura=cor('#b86a58'), nervura_inf=cor('#d4a090'),
                       peciolo=cor('#a05a48'), lat=0.15, central=0.4, amarelado=cor('#c89060'), variacao=0.05)

GOIABA = Especie(
    'goiaba', [Lobo(0, 1.0, 0.47, a=0.62, b=0.62, ondula=0.008, nerv_n=15, nerv_ang=63, nerv_curva=0.35)],
    peciolo=(0.05, 0.012), larg_central=0.010, larg_lat=0.0048, intramarginal=0.012, terciarias=0.7,
    relevo_central=-0.0015, relevo_lat=-0.0026, bulado=0.0013,
    paleta=dict(sup=cor('#4d6b2f'), inf=cor('#7d9062'), nervura=cor('#a6b46a'), nervura_inf=cor('#b8c092'),
                peciolo=cor('#7a7a46'), lat=0.75, central=0.8, margem=0.03, cavidade=0.22, ter=0.08))
GOIABA_NOVA = dict(sup=cor('#62803a'), inf=cor('#8aa06a'), nervura=cor('#a0b070'), lat=0.5)

CITRICO = Especie(
    'citrico', [Lobo(0, 1.0, 0.46, a=0.78, b=1.0, ondula=0.012, nerv_n=11, nerv_ang=57, nerv_curva=0.7)],
    peciolo=(0.16, 0.007), asa=0.032, larg_central=0.0062, larg_lat=0.0018, terciarias=0.3,
    relevo_central=0.0010, relevo_lat=0.0002,
    paleta=dict(sup=cor('#27461b'), inf=cor('#64803a'), nervura=cor('#6a8a3a'), nervura_inf=cor('#93ab5e'),
                peciolo=cor('#4f6e2a'), lat=0.16, central=0.55, margem=-0.03))

FUNDO_A = Especie(
    'fundo', [Lobo(0, 1.0, 0.42, a=0.8, b=1.0, nerv_n=9, nerv_ang=55)],
    peciolo=(0.08, 0.012), larg_central=0.012, larg_lat=0.004, terciarias=0.2,
    paleta=dict(sup=cor('#26391b'), inf=cor('#4f6234'), nervura=cor('#4e6a2e'), lat=0.12, central=0.4))
FUNDO_B = Especie(
    'fundo_b', [Lobo(0, 1.0, 0.30, a=0.9, b=1.3, nerv_n=10, nerv_ang=60)],
    peciolo=(0.08, 0.012), larg_central=0.012, larg_lat=0.004, terciarias=0.2,
    paleta=dict(sup=cor('#2e4320'), inf=cor('#56693a'), nervura=cor('#536e30'), lat=0.12, central=0.4))

TREPADEIRA = Especie(
    'trepadeira', [Lobo(0, 1.0, 0.66, a=0.55, b=0.95, nerv_n=5, nerv_ang=50, nerv_curva=0.9, cordado=(0.16, 32))],
    peciolo=(0.14, 0.022), larg_central=0.016, larg_lat=0.006, terciarias=0.5,
    relevo_central=-0.002, relevo_lat=-0.0012, bulado=0.001,
    paleta=dict(sup=cor('#2a4a1e'), inf=cor('#5c7440'), nervura=cor('#5f7d38'), nervura_inf=cor('#9aac74'),
                peciolo=cor('#56602e'), lat=0.3, central=0.5, cavidade=0.12))
TREPADEIRA_NOVA = dict(sup=cor('#4f7a2a'), inf=cor('#7a9658'), nervura=cor('#78944a'))

MARACUJA = Especie(
    'maracuja', [Lobo(0, 1.0, 0.44, a=0.70, b=0.95, serra=(30, 0.035), nerv_n=13, nerv_ang=58),
                 Lobo(46, 0.84, 0.46, a=0.70, b=0.95, serra=(26, 0.035), nerv_n=11, nerv_ang=58),
                 Lobo(-46, 0.84, 0.46, a=0.70, b=0.95, serra=(26, 0.035), nerv_n=11, nerv_ang=58)],
    peciolo=(0.16, 0.012), larg_central=0.009, larg_lat=0.003, terciarias=0.5,
    relevo_central=-0.0012, relevo_lat=-0.0005,
    paleta=dict(sup=cor('#30551e'), inf=cor('#64804a'), nervura=cor('#7f9a4c'), nervura_inf=cor('#a2b47a'),
                peciolo=cor('#5d7d2e'), lat=0.3, central=0.65, margem=-0.03))


# ================================================================== montagem
def _clamp_rho(rho):
    """Evita folhas de perfil (que sumiriam)."""
    r = (rho + 180) % 360 - 180
    if 60 < abs(r) < 120:
        r = math.copysign(60 if abs(r) < 90 else 120, r)
    return r


class Montador:
    """Ajuda a pôr folhas na carta sem passar da borda."""

    def __init__(self, carta, rng):
        self.carta = carta
        self.rng = rng

    def plana(self, esp, L, paleta=None, idade=0.3, extras=None, variar=(5, 0.10, 0.10)):
        rng = self.rng
        pal = dict(esp.paleta)
        if paleta:
            pal.update(paleta)
        dh, ds, dv = variar
        for k in ('sup', 'inf'):
            pal[k] = variar_cor(pal[k], rng, dh, ds, dv)
        P = min(1100.0, max(160.0, L * self.carta.N * 1.05))
        extras = dict(extras or {})
        return folha_plana(esp, rng, P, paleta=pal, idade=idade, extras=extras)

    def por(self, fp, B, phi, beta, rho, dobra, L, cn=0.0, cs=0.0, z_extra=0.0, **kw):
        rho = _clamp_rho(rho)
        c = self.carta
        cx, cy = 0.5 - B[0], 0.55 - B[1]
        alvo = math.degrees(math.atan2(cy, cx))
        for _ in range(30):
            if c.cabe(fp, B, phi, beta, rho, 1.0 * dobra, L, cn, cs):
                break
            L *= 0.96
            dif = (alvo - phi + 180) % 360 - 180
            phi += 0.05 * dif
        else:
            return False
        c.folha(fp, B, phi, beta, rho, dobra, L, cn, cs, z_extra=z_extra, **kw)
        return True


def _pose(rng, beta_max=45, rho_max=40, p_avesso=0.12):
    beta = rng.uniform(-beta_max, beta_max)
    rho = rng.uniform(-rho_max, rho_max)
    if rng.random() < p_avesso:
        rho += 180
    return beta, rho


def _curva(p0, p1, p2, n=12):
    """Bézier quadrática (pontos em unidades de carta)."""
    t = np.linspace(0, 1, n)[:, None]
    p0, p1, p2 = map(np.asarray, (p0, p1, p2))
    return (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t * t * p2


def _ponto(curva, t):
    i = t * (len(curva) - 1)
    i0 = int(math.floor(i)); i1 = min(len(curva) - 1, i0 + 1)
    f = i - i0
    p = curva[i0] * (1 - f) + curva[i1] * f
    d = curva[i1] - curva[i0] if i1 > i0 else curva[i0] - curva[i0 - 1]
    return p, math.degrees(math.atan2(d[1], d[0]))


# ------------------------------------------------------------------ mangueira
def cacho_manga(rng):
    """Mangueira: folhas longas e coriáceas em verticilos nas pontas; um broto novo cor de cobre."""
    carta = Carta(oclusao=0.2)
    m = Montador(carta, rng)
    madeira, verde = cor('#5a4b38'), cor('#5f6a38')
    va = np.array([0.43, 0.43]) + rng.normal(0, 0.012, 2)     # verticilo de baixo
    vb = np.array([0.59, 0.57]) + rng.normal(0, 0.012, 2)     # verticilo da ponta
    tronco = _curva((0.5, -0.03), (0.50, 0.20), va)
    ramo = _curva(va, (0.53, 0.46), vb)
    carta.galho(tronco, np.linspace(0.0090, 0.0068, len(tronco)), madeira, cor('#5d4e3a'), rng=rng, z=0.0, nos=[0.55])
    carta.galho(ramo, np.linspace(0.0062, 0.0050, len(ramo)), cor('#5d4e3a'), verde, rng=rng, z=0.0)
    broto = _curva(vb, (0.60, 0.68), (0.54 + rng.normal(0, 0.02), 0.77))
    carta.galho(broto, np.linspace(0.0040, 0.003, len(broto)), cor('#66683a'), cor('#7a4a30'), rng=rng, z=0.01)
    # folhas velhas no caule
    for ang in (200, -20):
        p, _ = _ponto(tronco, rng.uniform(0.45, 0.7))
        L = rng.uniform(0.30, 0.36)
        fp = m.plana(MANGA, L, idade=rng.uniform(0.5, 0.9), extras=dict(manchas=1.5, borda_seca=0.3))
        b, r = _pose(rng, 30, 28, 0.2)
        m.por(fp, p, ang + rng.normal(0, 8), b, r, rng.uniform(10, 22), L, rng.uniform(-0.12, 0.05), rng.uniform(-0.08, 0.08))
    # dois verticilos densos
    for pt, (a0, a1), n in ((va, (90, 270), 7), (vb, (-80, 120), 8)):
        angs = np.linspace(a0, a1, n) + rng.normal(0, 8, n)
        for j, ang in enumerate(rng.permutation(angs)):
            L = rng.uniform(0.38, 0.50)
            fp = m.plana(MANGA, L, idade=rng.uniform(0.05, 0.7), extras=dict(manchas=1.0, borda_seca=0.25))
            b, r = _pose(rng, 38, 28, 0.15)
            m.por(fp, pt, ang, b, r, rng.uniform(12, 24), L, rng.uniform(-0.16, 0.05), rng.uniform(-0.1, 0.1),
                  z_extra=0.002 * j, brilho=0.03)
    # folhas novas (cobre/bronze), moles, do broto
    pt = broto[-1]
    for j, ang in enumerate((rng.uniform(120, 170), rng.uniform(20, 60))):
        L = rng.uniform(0.19, 0.24)
        pal = MANGA_NOVA if j % 2 == 0 else MANGA_BRONZE
        fp = m.plana(MANGA, L, paleta=pal, idade=0.03, variar=(8, 0.12, 0.12))
        b, r = _pose(rng, 35, 25, 0.1)
        m.por(fp, pt, ang + rng.normal(0, 12), b, r, rng.uniform(25, 40), L, rng.uniform(-0.22, -0.05),
              rng.uniform(-0.12, 0.12), z_extra=0.01)
    return carta.compor()


def _folhas_no(m, esp, curva, t, lados, div, L, rng, pal=None, idade=(0.1, 0.6), pose=(40, 30, 0.12),
               dobra=(8, 20), curv=(-0.15, 0.05), z_extra=0.0, extras=None, brilho=0.0):
    """Folhas num nó do raminho: lados=(+1,-1) para opostas, (+1,) ou (-1,) para alternas."""
    p, d = _ponto(curva, t)
    for k, lado in enumerate(lados):
        Lk = L * rng.uniform(0.88, 1.12)
        fp = m.plana(esp, Lk, paleta=pal, idade=rng.uniform(*idade), extras=extras)
        b, r = _pose(rng, *pose)
        m.por(fp, p, d + lado * div + rng.normal(0, 8), b, r, rng.uniform(*dobra), Lk, rng.uniform(*curv),
              rng.uniform(-0.1, 0.1), z_extra=z_extra + 0.001 * k, brilho=brilho)


# ------------------------------------------------------------------ amendoeira
def _amendoeira(rng, outono):
    carta = Carta(oclusao=0.2)
    m = Montador(carta, rng)
    r1 = np.array([0.47, 0.47]) + rng.normal(0, 0.012, 2)
    r2 = np.array([0.63, 0.66]) + rng.normal(0, 0.012, 2)
    tronco = _curva((0.5, -0.03), (0.46, 0.22), r1)
    ramo = _curva(r1, (0.58, 0.52), r2)
    casca = cor('#5e5446')
    carta.galho(tronco, np.linspace(0.012, 0.009, len(tronco)), casca, cor('#6a5e4a'), rng=rng, z=0.0, nos=[0.5, 0.8])
    carta.galho(ramo, np.linspace(0.008, 0.0065, len(ramo)), cor('#6a5e4a'), cor('#6e6448'), rng=rng, z=-0.01)

    def paleta_folha(i):
        if outono:
            est = rng.choice([0.30, 0.45, 0.58, 0.68, 0.76, 0.90], p=[0.07, 0.15, 0.22, 0.28, 0.18, 0.10])
            return dict(AMENDOEIRA_OUTONO, estagio=float(est + rng.normal(0, 0.04))), rng.uniform(0.3, 0.9)
        if i in vermelhas:
            return dict(AMENDOEIRA_OUTONO, estagio=float(rng.uniform(0.70, 0.80))), 0.7
        return None, rng.uniform(0.05, 0.65)
    vermelhas = set(rng.choice(np.arange(5), 1, replace=False).tolist())   # só uma, na roseta de trás
    i = 0
    for pt, (a0, a1), n, Lr, zx in ((r2, (-40, 220), 5, (0.24, 0.36), -0.02), (r1, (-80, 260), 7, (0.30, 0.46), 0.0)):
        angs = np.sort(rng.uniform(a0, a1, n))
        angs = 0.5 * angs + 0.5 * np.linspace(a0, a1, n)
        for j, ang in enumerate(rng.permutation(angs)):
            L = rng.uniform(*Lr)
            pal, idade = paleta_folha(i)
            fp = m.plana(AMENDOEIRA, L, paleta=pal, idade=idade, extras=dict(manchas=2.0, furos=0.8, borda_seca=0.3))
            b, r = _pose(rng, 45, 30, 0.12)
            m.por(fp, pt + rng.normal(0, 0.006, 2), ang, b, r, rng.uniform(4, 12), L, rng.uniform(-0.14, 0.08),
                  rng.uniform(-0.1, 0.1), z_extra=zx + 0.002 * j, brilho=0.03)
            i += 1
        # folhas novas, menores, no centro da roseta
        for j in range(2):
            L = rng.uniform(0.13, 0.19)
            pal = dict(sup=cor('#5a7d2c'), inf=cor('#83994e')) if not outono else dict(AMENDOEIRA_OUTONO, estagio=0.25)
            fp = m.plana(AMENDOEIRA, L, paleta=pal, idade=0.05)
            b, r = _pose(rng, 50, 30, 0.1)
            m.por(fp, pt, rng.uniform(30, 150), b, r, rng.uniform(10, 25), L, rng.uniform(-0.1, 0.1), 0.0, z_extra=zx + 0.03)
            i += 1
    return carta.compor()


def cacho_amendoeira(rng):
    """Amendoeira-da-praia: folhas grandes obovadas em roseta na ponta do ramo; uma ou duas avermelhando."""
    return _amendoeira(rng, False)


def cacho_amendoeira_vermelha(rng):
    """Amendoeira no "outono" tropical: folhas vermelhas, laranja e marrons."""
    return _amendoeira(rng, True)


# ------------------------------------------------------------------ jabuticabeira
def cacho_jabuticaba(rng):
    """Jabuticabeira: folhinhas opostas, lanceoladas, em raminhos finos e densos; pares novos cor de salmão."""
    carta = Carta(oclusao=0.2, raio_oclusao=0.008)
    m = Montador(carta, rng)
    casca, ponta = cor('#5a3e30'), cor('#7a5a3a')
    principal = _curva((0.5, -0.03), (0.54, 0.45), (0.48 + rng.normal(0, 0.02), 0.92))
    carta.galho(principal, np.linspace(0.0060, 0.0028, len(principal)), casca, ponta, rng=rng, z=0.0)
    ramos = [(principal, np.arange(0.22, 1.0, 0.075).tolist() + [0.995], 0.19)]
    for t0, lado, comp in ((0.18, -1, 0.42), (0.28, 1, 0.42), (0.42, -1, 0.36), (0.52, 1, 0.36), (0.66, -1, 0.26), (0.74, 1, 0.24)):
        p0, d = _ponto(principal, t0)
        a = math.radians(d + lado * rng.uniform(42, 58))
        fim = p0 + comp * np.array([math.cos(a), math.sin(a)])
        fim[1] = min(fim[1], 0.93)
        meio = (p0 + fim) / 2 + np.array([0, 0.04]) + rng.normal(0, 0.015, 2)
        c = _curva(p0, meio, fim)
        carta.galho(c, np.linspace(0.0036, 0.0020, len(c)), casca, ponta, rng=rng, z=0.0)
        ts = np.arange(0.18, 0.98, rng.uniform(0.15, 0.2)).tolist() + [0.995]
        ramos.append((c, ts, 0.185 if comp > 0.3 else 0.16))
    for curva, ts, Lb in ramos:
        for k, t in enumerate(ts):
            nova = k == len(ts) - 1
            div = 35 if nova else rng.uniform(45, 65)
            _folhas_no(m, JABUTICABA, curva, t, (1, -1), div, Lb * (0.7 if nova else 1.0), rng,
                       pal=JABUTICABA_NOVA if nova else None, idade=(0.0, 0.1) if nova else (0.1, 0.6),
                       pose=(50, 30, 0.14), dobra=(10, 25), extras=dict(manchas=1.0, furos=0.2), brilho=0.03,
                       z_extra=0.003 * k + rng.uniform(-0.01, 0.01))
    return carta.compor()


# ------------------------------------------------------------------ goiabeira
def cacho_goiaba(rng):
    """Goiabeira: folhas ovais foscas, opostas cruzadas, nervuras laterais paralelas bem marcadas."""
    carta = Carta(oclusao=0.2)
    m = Montador(carta, rng)
    casca, verde = cor('#6a5038'), cor('#6f7a40')
    principal = _curva((0.5, -0.03), (0.47, 0.45), (0.53 + rng.normal(0, 0.02), 0.80))
    lateral = _curva(_ponto(principal, 0.42)[0], (0.70, 0.45), (0.80, 0.58))
    lateral2 = _curva(_ponto(principal, 0.30)[0], (0.30, 0.36), (0.20, 0.50))
    carta.galho(principal, np.linspace(0.0080, 0.0040, len(principal)), casca, verde, rng=rng, z=0.0, nos=[0.3, 0.55])
    carta.galho(lateral, np.linspace(0.0050, 0.0035, len(lateral)), casca, verde, rng=rng, z=0.0)
    carta.galho(lateral2, np.linspace(0.0045, 0.0032, len(lateral2)), casca, verde, rng=rng, z=-0.01)
    for t in (0.6, 0.99):
        _folhas_no(m, GOIABA, lateral2, t, (1, -1), rng.uniform(50, 65), 0.27 if t < 0.9 else 0.17, rng,
                   pal=GOIABA_NOVA if t > 0.9 else None, idade=(0.2, 0.8), dobra=(10, 20),
                   extras=dict(manchas=3.0, furos=1.0), z_extra=-0.006)
    for k, t in enumerate((0.25, 0.47, 0.66, 0.83, 0.99)):
        nova = t > 0.95
        cruzado = k % 2 == 1
        pose = (60, 25, 0.1) if cruzado else (30, 25, 0.15)
        _folhas_no(m, GOIABA, principal, t, (1, -1), 30 if nova else rng.uniform(55, 72), 0.19 if nova else 0.33, rng,
                   pal=GOIABA_NOVA if nova else None, idade=(0.05, 0.2) if nova else (0.2, 0.8), pose=pose,
                   dobra=(10, 20), extras=dict(manchas=3.0, furos=1.0, borda_seca=0.4), z_extra=0.002 * k)
    for k, t in enumerate((0.55, 0.99)):
        _folhas_no(m, GOIABA, lateral, t, (1, -1), rng.uniform(50, 65), 0.29 if t < 0.9 else 0.18, rng,
                   pal=GOIABA_NOVA if t > 0.9 else None, idade=(0.2, 0.7), dobra=(10, 20),
                   extras=dict(manchas=3.0, furos=1.0), z_extra=-0.004)
    return carta.compor()


# ------------------------------------------------------------------ citros
def cacho_citrico(rng):
    """Limoeiro/laranjeira: folhas elípticas brilhantes, alternas, com pecíolo alado; ramo verde com espinhos."""
    carta = Carta(oclusao=0.2)
    m = Montador(carta, rng)
    verde, madeira = cor('#4c6a2a'), cor('#5a5a38')
    principal = _curva((0.5, -0.03), (0.42, 0.42), (0.40 + rng.normal(0, 0.02), 0.86))
    lateral = _curva(_ponto(principal, 0.38)[0], (0.66, 0.42), (0.78, 0.66))
    carta.galho(principal, np.linspace(0.0065, 0.0035, len(principal)), madeira, verde, rng=rng, z=0.0)
    carta.galho(lateral, np.linspace(0.0045, 0.0030, len(lateral)), verde, verde, rng=rng, z=0.0)
    lateral2 = _curva(_ponto(principal, 0.55)[0], (0.25, 0.62), (0.16, 0.74))
    carta.galho(lateral2, np.linspace(0.0040, 0.0028, len(lateral2)), verde, verde, rng=rng, z=0.0)
    for curva, ts, L0 in ((principal, (0.18, 0.28, 0.38, 0.48, 0.58, 0.68, 0.78, 0.88, 0.99), 0.31),
                          (lateral, (0.22, 0.40, 0.58, 0.75, 0.88, 0.99), 0.28), (lateral2, (0.30, 0.55, 0.78, 0.99), 0.26)):
        for k, t in enumerate(ts):
            lado = 1 if k % 2 == 0 else -1
            nova = t > 0.95
            _folhas_no(m, CITRICO, curva, t, (lado,), rng.uniform(40, 60), L0 * (0.7 if nova else 1.0), rng,
                       pal=dict(sup=cor('#456e26'), inf=cor('#6a8a40')) if nova else None, idade=(0.05, 0.6),
                       pose=(40, 28, 0.08), dobra=(6, 16), extras=dict(manchas=1.0), brilho=0.04, z_extra=0.002 * k)
            # espinho no nó
            p, d = _ponto(curva, t)
            a = math.radians(d - lado * 50)
            esp = [p, p + 0.018 * np.array([math.cos(a), math.sin(a)])]
            carta.galho(esp, [0.0018, 0.0003], cor('#5d6a34'), cor('#8a8a5a'), rng=rng, z=0.001)
    return carta.compor()


# ------------------------------------------------------------------ fundo (árvores ao longe)
def cacho_fundo(rng):
    """Massa de folhagem genérica para árvores longe (atrás dos muros): muitas folhinhas, mais escura."""
    carta = Carta(oclusao=0.30, raio_oclusao=0.02)
    m = Montador(carta, rng)
    casca = cor('#352d24')
    centro = np.array([0.5, 0.12])
    tronco = _curva((0.5, -0.03), (0.5, 0.05), centro)
    carta.galho(tronco, np.linspace(0.008, 0.007, len(tronco)), casca, casca, rng=rng, z=0.08)
    ramos = []
    for ang in np.linspace(12, 168, 8) + rng.normal(0, 5, 8):
        a = math.radians(ang)
        comp = rng.uniform(0.55, 0.75) * (1.12 - 0.35 * abs(math.cos(a)))
        fim = centro + comp * np.array([math.cos(a), math.sin(a)])
        fim = np.clip(fim, 0.12, 0.88)
        meio = centro + 0.5 * (fim - centro) + rng.normal(0, 0.03, 2)
        c = _curva(centro, meio, fim)
        ramos.append(c)
        carta.galho(c, np.linspace(0.005, 0.002, len(c)), casca, cor('#40382a'), rng=rng, z=0.08)
    pal_mistas = [None, None, dict(sup=cor('#34482a'), inf=cor('#5a6a42')), dict(sup=cor('#3e4d24'), inf=cor('#606a3a')),
                  dict(sup=cor('#22361c'), inf=cor('#46583a'))]
    for c in ramos:
        for k, t in enumerate(np.linspace(0.30, 1.0, 8)):
            esp = FUNDO_A if rng.random() < 0.55 else FUNDO_B
            pal = pal_mistas[rng.integers(len(pal_mistas))]
            _folhas_no(m, esp, c, t, (1, -1, 1) if rng.random() < 0.3 else (1, -1), rng.uniform(30, 75),
                       rng.uniform(0.11, 0.16), rng, pal=pal, idade=(0.0, 0.4), pose=(55, 40, 0.15), dobra=(5, 25),
                       extras=dict(manchas=0.5), z_extra=rng.uniform(-0.03, 0.03))
    return carta.compor()


# ------------------------------------------------------------------ trepadeira de muro
def cacho_trepadeira(rng):
    """Unha-de-gato (Ficus pumila): folhinhas cordiformes em hastes rasteiras, quase todas de frente."""
    carta = Carta(oclusao=0.22, raio_oclusao=0.008)
    m = Montador(carta, rng)
    haste = cor('#4e4632')
    hastes = []
    for x_fim, y_fim, cx in ((0.12, 0.78, 0.22), (0.34, 0.93, 0.40), (0.62, 0.94, 0.58), (0.88, 0.76, 0.80), (0.52, 0.62, 0.66)):
        ini = np.array([0.5 + rng.normal(0, 0.01), -0.03])
        ctrl = np.array([cx + rng.normal(0, 0.04), 0.35 + rng.normal(0, 0.05)])
        fim = np.array([x_fim, y_fim]) + rng.normal(0, 0.02, 2)
        c = _curva(ini, ctrl, fim, n=24)
        c[:, 0] += 0.018 * np.sin(np.linspace(0, 3 * math.pi, len(c)) + rng.uniform(0, 6))
        hastes.append(c)
        carta.galho(c, np.linspace(0.0030, 0.0018, len(c)), haste, cor('#5a5e34'), rng=rng, z=-0.05)
    for c in hastes:
        n = int(rng.integers(10, 13))
        for k, t in enumerate(np.linspace(0.12, 1.0, n)):
            lado = 1 if k % 2 == 0 else -1
            nova = t > 0.88
            _folhas_no(m, TREPADEIRA, c, t, (lado,), rng.uniform(40, 90), rng.uniform(0.10, 0.14) * (0.75 if nova else 1),
                       rng, pal=TREPADEIRA_NOVA if nova else None, idade=(0.0, 0.5), pose=(25, 22, 0.05),
                       dobra=(3, 12), curv=(-0.08, 0.04), extras=dict(manchas=0.6), z_extra=rng.uniform(-0.02, 0.02))
    return carta.compor()


# ------------------------------------------------------------------ maracujá
def _flor_maracuja(carta, centro, raio, inclina, giro, rng):
    """Flor do maracujá: 5 pétalas + 5 sépalas brancas, corona de filamentos roxo/branco, centro verde."""
    N = carta.N
    R = raio * N
    cx, cy = centro[0] * N, centro[1] * N
    r0, r1 = int(N - cy - R - 3), int(N - cy + R + 3)
    c0, c1 = int(cx - R - 3), int(cx + R + 3)
    ys = (N - np.arange(r0, r1) - 0.5)
    xs = np.arange(c0, c1) + 0.5
    QX, QY = np.meshgrid(xs, ys)
    g = math.radians(giro)
    dx, dy = QX - cx, QY - cy
    # disco inclinado: comprime um eixo
    u = (dx * math.cos(g) + dy * math.sin(g))
    v = (-dx * math.sin(g) + dy * math.cos(g)) / math.cos(math.radians(inclina))
    r = np.sqrt(u * u + v * v) / R
    th = np.arctan2(v, u)
    alfa = np.zeros(r.shape, np.float32)
    corimg = np.zeros(r.shape + (3,), np.float32)
    px = 1.0 / R

    def sobre(cor_c, a):
        nonlocal alfa, corimg
        a = np.clip(a, 0, 1).astype(np.float32)
        corimg = corimg * (1 - a[..., None]) + np.asarray(cor_c, np.float32) * a[..., None]
        alfa = alfa + a * (1 - alfa)
    # sépalas (verde-claras por fora, brancas) e pétalas
    for k, (fase, comp, larg, c) in enumerate(((0.0, 1.0, 0.36, cor('#e8ecd8')), (math.pi / 5, 0.93, 0.30, cor('#f4f2ee')))):
        for i in range(5):
            a = fase + i * 2 * math.pi / 5 + giro * 0.0
            dth = np.angle(np.exp(1j * (th - a)))
            larg_r = larg * np.sin(np.clip(r / comp, 0, 1) * math.pi) ** 0.6 + 0.05
            dentro = (np.abs(dth) * np.maximum(r, 0.05) < larg_r * 0.5) & (r < comp)
            borda = (larg_r * 0.5 - np.abs(dth) * np.maximum(r, 0.05)) / px
            borda = np.minimum(borda, (comp - r) / px)
            sobre(c * (0.92 + 0.08 * r)[..., None], np.clip(borda + 0.5, 0, 1))
    # corona: filamentos finos, anéis roxo / branco / roxo ondulado
    nfil = 90
    fil = np.abs(np.angle(np.exp(1j * (th * nfil / 1.0))) ) / math.pi
    ond = r + 0.025 * np.sin(th * 7)
    largura = 0.40 + 0.25 * (r < 0.45)
    m_fil = (fil < largura) & (r < 0.78) & (r > 0.16)
    c_fil = np.where((ond < 0.33)[..., None], cor('#3e1450'),
                     np.where((ond < 0.48)[..., None], cor('#f2eef0'),
                              np.where((ond < 0.60)[..., None], cor('#6a2a7a'), cor('#eee8f0'))))
    a_fil = m_fil * np.clip((0.78 - r) / px + 0.5, 0, 1)
    corimg = corimg * (1 - a_fil[..., None]) + c_fil * a_fil[..., None]
    alfa = alfa + a_fil * (1 - alfa)
    # androginóforo: centro verde-amarelado
    a_c = np.clip((0.15 - r) / px + 0.5, 0, 1)
    sobre(cor('#9aa24a'), a_c)
    a_e = np.clip((0.06 - np.abs(r - 0.10)) / px + 0.5, 0, 1) * (np.abs(np.angle(np.exp(1j * th * 5))) < 0.5)
    sobre(cor('#c8b040'), a_e)
    n = np.zeros(r.shape + (3,), np.float32); n[..., 2] = 1
    carta.camada_livre(r0, c0, alfa.astype(np.float32), corimg.astype(np.float32), n, z=0.4)


def _gavinha(carta, inicio, dirc, rng, cor_g):
    a = math.radians(dirc)
    reta = rng.uniform(0.06, 0.10)
    p1 = np.asarray(inicio) + reta * np.array([math.cos(a), math.sin(a)])
    voltas = rng.uniform(2.0, 3.2)
    t = np.linspace(0, 1, 60)
    sentido = rng.choice([-1, 1])
    r = 0.03 * (1 - 0.65 * t)
    ang = a + sentido * (math.pi / 2) + sentido * t * voltas * 2 * math.pi
    centro = p1 + 0.03 * np.array([math.cos(a + sentido * math.pi / 2), math.sin(a + sentido * math.pi / 2)]) * -1
    centro = p1 - 0.03 * np.array([math.cos(ang[0]), math.sin(ang[0])])
    esp = centro + r[:, None] * np.stack([np.cos(ang), np.sin(ang)], -1) + t[:, None] * 0.02 * np.array([math.cos(a), math.sin(a)])
    pts = np.concatenate([_curva(inicio, (np.asarray(inicio) + p1) / 2 + rng.normal(0, 0.01, 2), p1, n=10), esp])
    carta.galho(pts, np.linspace(0.0022, 0.0010, len(pts)), cor_g, cor_g * 1.05, rng=rng, z=0.02, rugoso=0.03)


def cacho_maracuja(rng):
    """Maracujazeiro: folhas trilobadas serrilhadas, gavinha enrolada e uma flor branca e roxa."""
    carta = Carta(oclusao=0.2)
    m = Montador(carta, rng)
    verde = cor('#557a2c')
    haste = _curva((0.5, -0.03), (0.30, 0.55), (0.62 + rng.normal(0, 0.02), 0.92), n=24)
    haste[:, 0] += 0.025 * np.sin(np.linspace(0, 2.5 * math.pi, len(haste)))
    carta.galho(haste, np.linspace(0.0060, 0.0035, len(haste)), cor('#5a6a30'), verde, rng=rng, z=0.0)
    nos = (0.16, 0.34, 0.52, 0.70, 0.86)
    for k, t in enumerate(nos):
        lado = 1 if k % 2 == 0 else -1
        _folhas_no(m, MARACUJA, haste, t, (lado,), rng.uniform(45, 70), rng.uniform(0.31, 0.37), rng,
                   idade=(0.1, 0.7), pose=(38, 25, 0.12), dobra=(4, 12), curv=(-0.08, 0.04),
                   extras=dict(manchas=1.5, furos=0.6, borda_seca=0.3), brilho=0.03, z_extra=0.002 * k)
        if k in (1, 3):
            p, d = _ponto(haste, t + 0.02)
            _gavinha(carta, p, d - lado * 70, rng, cor('#7f9a44'))
    p, d = _ponto(haste, 0.99)
    _folhas_no(m, MARACUJA, haste, 0.99, (1,), 20, 0.16, rng, pal=dict(sup=cor('#5f8a34')), idade=(0, 0.1))
    _flor_maracuja(carta, (0.26 + rng.normal(0, 0.02), 0.50), 0.088, 35, rng.uniform(0, 70), rng)
    return carta.compor()
