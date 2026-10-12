"""Animações do cachorro, todas no lugar (o motor é quem anda com o bicho).

Cada função devolve (lista de parâmetros por quadro, repete?, velocidade m/s).
As passadas são feitas com o pé preso ao chão: na fase de apoio a pata anda
para trás exatamente na velocidade de deslocamento, então não escorrega.
"""
import copy
import numpy as np
from cachorro_forma import P
from esqueleto import suave, mistura, FPS

TAU = 2 * np.pi


def onda(x):
    return np.sin(TAU * x)


def lombada(w, pico=0.4):
    """Lombada de 0 a 1 a 0 com o máximo em `pico`."""
    w = np.clip(w, 0.0, 1.0)
    e = np.log(0.5) / np.log(pico)
    return np.sin(np.pi * w ** e)


def misturar(a, b, t):
    """Mistura dois conjuntos de parâmetros (números, tuplas, listas, dicionários, arrays)."""
    if isinstance(a, dict):
        return {k: misturar(a[k], b[k], t) for k in a}
    if isinstance(a, (list, tuple)):
        r = [misturar(x, y, t) for x, y in zip(a, b)]
        return type(a)(r) if isinstance(a, tuple) else r
    if a is None:
        return None
    if isinstance(a, np.ndarray):
        return a + (np.asarray(b) - a) * t
    if isinstance(a, (int, float, np.floating)):
        return a + (b - a) * t
    return a if t < 0.5 else b


def norm_(v):
    return v / np.linalg.norm(v)


def curva_s(t):
    t = np.clip(t, 0, 1)
    return t * t * t * (t * (6 * t - 15) + 10)


class Pata:
    """Configuração de uma pata dentro de uma marcha."""

    def __init__(self, nome, toque, f0, l0, ergue, flexao, frente):
        self.nome = nome          # 'fe', 'fd', 'te', 'td'
        self.toque = toque        # fase do toque no chão (0-1)
        self.f0 = f0              # posição neutra da junta da pata (para a frente)
        self.l0 = l0              # posição lateral
        self.ergue = ergue        # altura máxima no voo
        self.flexao = flexao      # dobra do carpo/jarrete no voo (graus)
        self.frente = frente


def ciclo_pata(pc, pt, fase, duty, T, v, u_chao, rolar=0.20, ret=0.5):
    """Alvo da pata (f, l, u), delta kappa e ângulo dos dedos numa fase do ciclo."""
    L = v * duty * T
    k0 = pc.kappa_carpo if pt.frente else pc.kappa_jarrete
    d0 = pc.dedos_f if pt.frente else pc.dedos_t
    lp = pc.e.comp['dedos_fe'] if pt.frente else pc.e.comp['dedos_te']
    fl = (fase - pt.toque) % 1.0

    def apoio(s):
        f = pt.f0 + L / 2 - L * s
        u = u_chao
        dedos = d0
        # rola sobre a ponta dos dedos no fim do apoio
        r = suave(1 - rolar, 1.0, s)
        if r > 0:
            ang = d0 + (68.0 - d0) * r
            a0, a1 = np.radians(d0), np.radians(ang)
            # ponta fixa no chão: a junta sobe e recua
            ponta_f = f + lp * np.cos(a0)
            ponta_u = u - lp * np.sin(a0)
            f = ponta_f - lp * np.cos(a1)
            u = ponta_u + lp * np.sin(a1)
            dedos = ang
        # carga: o carpo cede um pouco, o jarrete dobra e depois empurra
        if pt.frente:
            dk = 6.0 * np.sin(np.pi * s) - 4.0 * r
        else:
            dk = 6.0 * np.sin(np.pi * s) - 14.0 * r
        return f, u, dk, dedos

    if fl < duty:
        f, u, dk, dedos = apoio(fl / duty)
    else:
        w = (fl - duty) / (1 - duty)
        f0_, u0_, dk0, de0 = apoio(1.0)
        f1_, u1_, dk1, de1 = apoio(0.0)
        # Hermite: sai e chega com a velocidade do chão (retração antes do toque)
        m = -v * (1 - duty) * T * ret
        h00, h10, h01, h11 = 2 * w ** 3 - 3 * w ** 2 + 1, w ** 3 - 2 * w ** 2 + w, -2 * w ** 3 + 3 * w ** 2, w ** 3 - w ** 2
        f = h00 * f0_ + h10 * m + h01 * f1_ + h11 * m
        u = mistura(u0_, u1_, suave(0, 1, w)) + pt.ergue * lombada(w, 0.42)
        flex = pt.flexao * lombada(w, 0.40)
        if pt.frente:
            dk = mistura(dk0, dk1, w) - flex
            dedos = mistura(de0, de1, suave(0.6, 1.0, w)) + 0.55 * flex * (1 - suave(0.55, 0.95, w))
        else:
            dk = mistura(dk0, dk1, w) + flex
            dedos = mistura(de0, de1, suave(0.5, 1.0, w)) + 0.4 * flex * (1 - suave(0.55, 0.95, w))
    return P(f, pt.l0, u), k0 + dk, dedos


def aplicar_patas(pc, p, patas, fase, duty, T, v, u_chao_f=None, u_chao_t=None, **kw):
    for pt in patas:
        uc = (u_chao_f if pt.frente else u_chao_t)
        if uc is None:
            uc = pc.e.cau['metacarpo_fe'][2] if pt.frente else pc.e.cau['metatarso_te'][2]
        alvo, kappa, dedos = ciclo_pata(pc, pt, fase, duty, T, v, uc, **kw)
        p['patas'][pt.nome].update(alvo=alvo, kappa=kappa, dedos=dedos, dir3=None)


def cauda_onda(amp_g, fase, atraso=0.08, base=(0.0, 0.0, 0.0), curva=(0.0,) * 5, amp_a=0.0, fase_a=0.0):
    """Cauda balançando: cada segmento atrasado em relação ao anterior."""
    r = []
    for i in range(5):
        g = amp_g * (0.55 + 0.15 * i) * onda(fase - atraso * i)
        a = curva[i] + amp_a * onda(fase_a - atraso * i)
        if i == 0:
            r.append((base[0] + a, base[1] + g, base[2]))
        else:
            r.append((a, g, 0.0))
    return r


def quadros(n):
    """Fases 0..1 para um ciclo de n quadros (inclui o último igual ao primeiro)."""
    return [i / n for i in range(n + 1)]


# ---------------------------------------------------------------------------
# marchas
# ---------------------------------------------------------------------------
def andando(pc):
    T, v, duty = 0.70, 0.95, 0.62
    n = int(round(T * FPS))
    T = n / FPS
    cf_, ct_ = pc.e.cau['metacarpo_fe'], pc.e.cau['metatarso_te']
    f_f, f_t = -cf_[1] + 0.012, -ct_[1] - 0.004
    patas = [Pata('te', 0.00, f_t, 0.060, 0.050, 32.0, False),
             Pata('fe', 0.25, f_f, 0.057, 0.060, 72.0, True),
             Pata('td', 0.50, f_t, -0.060, 0.050, 32.0, False),
             Pata('fd', 0.75, f_f, -0.057, 0.060, 72.0, True)]
    out = []
    for fase in quadros(n):
        p = pc.repouso()
        aplicar_patas(pc, p, patas, fase, duty, T, v)
        bob = 0.006 * np.cos(2 * TAU * (fase - 0.12))
        p['corpo'] = (0.004 * onda(2 * fase), 0.004 * onda(fase - 0.1), -0.004 + bob)
        p['corpo_rot'] = (0.8 * onda(2 * fase + 0.1), 2.0 * onda(fase + 0.05), 2.0 * onda(fase - 0.06))
        p['coluna'] = [(0.0, -1.6 * onda(fase + 0.05), -0.8 * onda(fase - 0.06)),
                       (0.3 * onda(2 * fase), -1.2 * onda(fase), 0.0),
                       (0.0, 1.0 * onda(fase - 0.2), 1.2 * onda(fase - 0.3))]
        p['pescoco'] = [(-4.0 + 1.6 * onda(2 * fase - 0.15), 1.2 * onda(fase - 0.3), 0.0),
                        (-2.0 + 1.0 * onda(2 * fase - 0.2), 0.8 * onda(fase - 0.35), 0.0)]
        p['cabeca'] = (-1.2 * onda(2 * fase - 0.25), -1.2 * onda(fase - 0.35), 0.0)
        p['cauda'] = cauda_onda(9.0, fase + 0.1, base=(-12.0, 0, 0), curva=(0, -4, -4, -3, -2),
                                amp_a=2.0, fase_a=2 * fase)
        e = 3.0 * onda(2 * fase - 0.3)
        p['orelhas'] = {'e': (0.0, 0.0, 0.0, e), 'd': (0.0, 0.0, 0.0, e)}
        p['escapula'] = {'e': 4.0 * onda(fase - 0.25 + 0.1), 'd': 4.0 * onda(fase - 0.75 + 0.1)}
        out.append(p)
    return out, True, v


def trotando(pc):
    T, v, duty = 0.50, 2.2, 0.40
    n = int(round(T * FPS))
    T = n / FPS
    cf_, ct_ = pc.e.cau['metacarpo_fe'], pc.e.cau['metatarso_te']
    f_f, f_t = -cf_[1] + 0.035, -ct_[1] + 0.012
    patas = [Pata('te', 0.00, f_t, 0.052, 0.075, 48.0, False),
             Pata('fd', 0.02, f_f, -0.045, 0.085, 100.0, True),
             Pata('td', 0.50, f_t, -0.052, 0.075, 48.0, False),
             Pata('fe', 0.52, f_f, 0.045, 0.085, 100.0, True)]
    out = []
    for fase in quadros(n):
        p = pc.repouso()
        aplicar_patas(pc, p, patas, fase, duty, T, v, ret=0.25)
        bob = -0.011 * np.cos(2 * TAU * (fase - 0.22))
        p['corpo'] = (0.0, 0.0, -0.016 + bob)
        p['corpo_rot'] = (-1.0 + 0.8 * onda(2 * fase + 0.05), 1.2 * onda(fase), 1.2 * onda(fase - 0.1))
        p['coluna'] = [(0.4 * onda(2 * fase), -1.0 * onda(fase), 0.0), (0.0, -0.8 * onda(fase), 0.0),
                       (0.0, 0.6 * onda(fase - 0.2), 0.0)]
        p['pescoco'] = [(-10.0 + 1.2 * onda(2 * fase - 0.25), 0.0, 0.0), (-3.0, 0.0, 0.0)]
        p['cabeca'] = (2.0 - 1.4 * onda(2 * fase - 0.3), 0.0, 0.0)
        p['boca'] = 4.0
        p['cauda'] = cauda_onda(6.0, fase, base=(-4.0, 0, 0), curva=(0, -6, -6, -4, -2),
                                amp_a=4.0, fase_a=2 * fase - 0.1)
        e = 7.0 * onda(2 * fase - 0.35)
        p['orelhas'] = {'e': (-8.0, 0.0, 0.0, 6.0 + e), 'd': (-8.0, 0.0, 0.0, 6.0 + e)}
        p['escapula'] = {'e': 7.0 * onda(fase - 0.52 + 0.12), 'd': 7.0 * onda(fase - 0.02 + 0.12)}
        out.append(p)
    return out, True, v


def correndo(pc):
    """Galope rotativo com flexão e extensão da coluna."""
    T, v, duty = 0.40, 5.0, 0.22
    n = int(round(T * FPS))
    T = n / FPS
    cf_, ct_ = pc.e.cau['metacarpo_fe'], pc.e.cau['metatarso_te']
    f_f, f_t = -cf_[1] + 0.028, -ct_[1] + 0.045
    patas = [Pata('te', 0.00, f_t, 0.055, 0.11, 60.0, False),
             Pata('td', 0.09, f_t, -0.055, 0.11, 60.0, False),
             Pata('fd', 0.40, f_f, -0.048, 0.13, 125.0, True),
             Pata('fe', 0.49, f_f, 0.048, 0.13, 125.0, True)]
    out = []
    for fase in quadros(n):
        p = pc.repouso()
        aplicar_patas(pc, p, patas, fase, duty, T, v, rolar=0.25, ret=0.2)
        flex = np.cos(TAU * (fase - 0.97))          # 1 = coluna curvada (reunida)
        p['corpo'] = (0.0, 0.0, -0.035 + 0.022 * np.cos(TAU * (fase - 0.86)))
        p['corpo_rot'] = (5.0 * np.cos(TAU * (fase - 0.12)), 0.0, 0.0)
        p['coluna'] = [(-7.5 * flex, 0.0, 0.0), (-6.0 * flex, 0.0, 0.0), (-3.0 * flex, 0.0, 0.0)]
        p['pescoco'] = [(-8.0 + 6.0 * flex - 4.0 * np.cos(TAU * (fase - 0.12)), 0.0, 0.0), (-2.0 + 2.0 * flex, 0.0, 0.0)]
        p['cabeca'] = (3.0 - 3.0 * flex, 0.0, 0.0)
        p['boca'] = 9.0 + 2.0 * onda(fase)
        p['lingua'] = (0.010, -8.0, 0.002)
        p['cauda'] = [(-6.0 + 10.0 * flex, 0, 0), (-10.0 + 4.0 * flex, 0, 0), (-10.0 + 3 * onda(fase - 0.2), 0, 0),
                      (-8.0 + 4 * onda(fase - 0.3), 0, 0), (-6.0 + 5 * onda(fase - 0.4), 0, 0)]
        e = 10.0 * onda(fase - 0.3)
        p['orelhas'] = {'e': (-32.0, 0.0, -6.0, 20.0 + e), 'd': (-32.0, 0.0, 6.0, 20.0 + e)}
        p['escapula'] = {'e': 16.0 * np.cos(TAU * (fase - 0.36)), 'd': 16.0 * np.cos(TAU * (fase - 0.27))}
        out.append(p)
    return out, True, v


def farejando(pc):
    """Andar lento com o focinho no chão, varrendo de um lado para o outro."""
    Tp, v, duty = 1.2, 0.40, 0.72
    n_p = int(round(Tp * FPS))
    Tp = n_p / FPS
    n = 2 * n_p
    cf_, ct_ = pc.e.cau['metacarpo_fe'], pc.e.cau['metatarso_te']
    f_f, f_t = -cf_[1] + 0.0, -ct_[1] + 0.01
    patas = [Pata('te', 0.00, f_t, 0.060, 0.040, 26.0, False),
             Pata('fe', 0.25, f_f, 0.056, 0.045, 60.0, True),
             Pata('td', 0.50, f_t, -0.060, 0.040, 26.0, False),
             Pata('fd', 0.75, f_f, -0.056, 0.045, 60.0, True)]
    out = []
    for i in range(n + 1):
        fl = i / n               # fase do laço (2 passadas)
        fase = (2 * fl) % 1.0    # fase da passada
        p = pc.repouso()
        aplicar_patas(pc, p, patas, fase, duty, Tp, v)
        p['corpo'] = (0.0, 0.003 * onda(fase), -0.020 + 0.004 * np.cos(2 * TAU * fase))
        p['corpo_rot'] = (-11.0, 1.5 * onda(fase), 1.5 * onda(fase - 0.06))
        p['coluna'] = [(0.0, -1.2 * onda(fase), 0.0), (-1.0, -1.0 * onda(fase), 0.0), (-3.0, 0.0, 0.0)]
        varre = 14.0 * onda(fl - 0.1)
        # fungadas: pequenas batidas rápidas da cabeça
        fung = 1.3 * onda(12 * fl) * (0.5 + 0.5 * np.cos(TAU * 2 * fl))
        p['pescoco'] = [(-52.0, 0.4 * varre, 0.0), (-12.0, 0.5 * varre, 0.0)]
        p['cabeca'] = (24.0 + fung, 0.5 * varre, 0.0)
        p['boca'] = 1.0 + 0.8 * onda(12 * fl + 0.2)
        p['cauda'] = cauda_onda(10.0, fl * 2, base=(-14.0, 0, 0), curva=(0, -2, -3, -2, 0))
        p['orelhas'] = {'e': (6.0, 0.0, 0.0, 10.0), 'd': (6.0, 0.0, 0.0, 10.0)}
        p['escapula'] = {'e': 3.0 * onda(fase - 0.15), 'd': 3.0 * onda(fase - 0.65)}
        out.append(p)
    return out, True, v


# ---------------------------------------------------------------------------
# poses paradas
# ---------------------------------------------------------------------------
def pose_sentado(pc):
    p = pc.repouso()
    p['corpo'] = (-0.045, 0.0, -0.293)
    p['corpo_rot'] = (41.0, 0.0, 0.0)
    p['coluna'] = [(-2.0, 0.0, 0.0), (0.0, 0.0, 0.0), (3.0, 0.0, 0.0)]
    p['pescoco'] = [(-12.0, 0.0, 0.0), (-10.0, 0.0, 0.0)]
    p['cabeca'] = (-15.0, 0.0, 0.0)
    p['cauda_modo'] = 'chao'
    p['cauda_chao'] = [0.0, 18.0, 22.0, 22.0, 18.0]
    for s, l in (('e', 1), ('d', -1)):
        p['patas']['f' + s].update(alvo=P(0.180, 0.060 * l, 0.030))
        p['patas']['t' + s].update(alvo=P(-0.165, 0.086 * l, 0.024), dir3=P(1, 0.10 * l, -0.05), dedos=8.0)
    return p


def pose_deitado(pc):
    p = pc.repouso()
    p['corpo'] = (0.0, 0.0, -0.279)
    p['corpo_rot'] = (2.0, 0.0, 0.0)
    p['coluna'] = [(0.0, 0.0, 0.0), (-1.0, 0.0, 0.0), (-1.0, 0.0, 0.0)]
    p['pescoco'] = [(-2.0, 0.0, 0.0), (-4.0, 0.0, 0.0)]
    p['cabeca'] = (-3.0, 0.0, 0.0)
    p['cauda_modo'] = 'chao'
    p['cauda_chao'] = [6.0, 22.0, 26.0, 24.0, 18.0]
    p['orelhas'] = {'e': (-6.0, 0.0, 0.0, 6.0), 'd': (-6.0, 0.0, 0.0, 6.0)}
    for s, l in (('e', 1), ('d', -1)):
        p['patas']['f' + s].update(alvo=P(0.392, 0.072 * l, 0.021), dir3=P(1, 0, -0.10), dedos=12.0)
        p['patas']['t' + s].update(alvo=P(-0.085, 0.108 * l, 0.022), dir3=P(1, 0.10 * l, -0.07), dedos=10.0)
    return p


def parado(pc):
    n = 120
    out = []
    for i in range(n + 1):
        t = i / n
        p = pc.repouso()
        resp = onda(2 * t)                      # duas respirações
        p['corpo'] = (0.0, 0.004 * onda(t + 0.1), 0.0015 * resp)
        p['corpo_rot'] = (0.3 * resp, 0.0, 0.8 * onda(t + 0.1))
        p['coluna'] = [(0.0, 0.0, 0.0), (0.5 * resp, 0.0, 0.0), (0.0, 0.0, 0.0)]
        # olhadas para os lados com paradas
        olhar = 16.0 * (suave(0.10, 0.22, t) - suave(0.38, 0.50, t)) - 12.0 * (suave(0.58, 0.70, t) - suave(0.84, 0.96, t))
        incl = 4.0 * (suave(0.12, 0.2, t) - suave(0.4, 0.48, t))
        p['pescoco'] = [(-1.0 + 0.6 * resp, 0.35 * olhar, 0.0), (0.0, 0.35 * olhar, 0.0)]
        p['cabeca'] = (0.0 + incl * 0.3, 0.3 * olhar, -incl)
        p['cauda'] = cauda_onda(7.0, 3 * t, base=(-10.0, 0, 0), curva=(0, -3, -3, -2, 0), atraso=0.10)
        # uma sacudida de orelha
        sac = lombada(np.clip((t - 0.62) / 0.06, 0, 1), 0.3) * 18.0 - lombada(np.clip((t - 0.68) / 0.05, 0, 1), 0.5) * 6.0
        p['orelhas'] = {'e': (sac * 0.4, 0.0, -sac * 0.5, sac), 'd': (0.0, 0.0, 0.0, 1.5 * resp)}
        out.append(p)
    return out, True, 0.0


def sentado(pc):
    n = 120
    base = pose_sentado(pc)
    out = []
    for i in range(n + 1):
        t = i / n
        p = copy.deepcopy(base)
        ofega = onda(10 * t)                     # 2,5 ofegadas por segundo
        p['corpo'] = (base['corpo'][0], base['corpo'][1], base['corpo'][2] + 0.0015 * ofega)
        p['coluna'] = [base['coluna'][0], (0.8 * ofega, 0.0, 0.0), base['coluna'][2]]
        olhar = 12.0 * (suave(0.15, 0.27, t) - suave(0.45, 0.57, t)) - 8.0 * (suave(0.66, 0.76, t) - suave(0.88, 0.98, t))
        p['pescoco'] = [(base['pescoco'][0][0], 0.35 * olhar, 0.0), (base['pescoco'][1][0], 0.35 * olhar, 0.0)]
        p['cabeca'] = (base['cabeca'][0] + 1.2 * ofega, 0.3 * olhar, 0.0)
        p['boca'] = 9.0 + 3.0 * ofega
        p['lingua'] = (0.024 + 0.003 * ofega, -24.0, 0.004)
        varre = 18.0 * onda(2 * t)
        # varre o chão com a cauda
        p['cauda_chao'] = [c + varre * (0.5 + 0.12 * k) for k, c in enumerate(base['cauda_chao'])]
        p['cauda_chao_alt'] = [0.0, 0.004 * abs(onda(2 * t)), 0.006 * abs(onda(2 * t)), 0.0, 0.0]
        p['orelhas'] = {'e': (-4.0, 0.0, 0.0, 4.0 + 1.5 * ofega), 'd': (-4.0, 0.0, 0.0, 4.0 + 1.5 * ofega)}
        out.append(p)
    return out, True, 0.0


def deitado(pc):
    n = 180
    base = pose_deitado(pc)
    out = []
    for i in range(n + 1):
        t = i / n
        p = copy.deepcopy(base)
        resp = onda(2 * t)
        p['corpo'] = (base['corpo'][0], base['corpo'][1], base['corpo'][2] + 0.002 * resp)
        p['coluna'] = [base['coluna'][0], (base['coluna'][1][0] + 0.8 * resp, 0.0, 0.0), base['coluna'][2]]
        olhar = 8.0 * (suave(0.2, 0.32, t) - suave(0.55, 0.68, t))
        p['pescoco'] = [(base['pescoco'][0][0] + 0.5 * resp, 0.4 * olhar, 0.0), (base['pescoco'][1][0], 0.3 * olhar, 0.0)]
        p['cabeca'] = (base['cabeca'][0], 0.3 * olhar, -2.0 * suave(0.2, 0.32, t) + 2.0 * suave(0.55, 0.68, t))
        sac = lombada(np.clip((t - 0.40) / 0.05, 0, 1), 0.3) * 20.0
        sac2 = lombada(np.clip((t - 0.80) / 0.04, 0, 1), 0.3) * 14.0
        p['orelhas'] = {'e': (-6.0 + sac * 0.5, 0.0, -sac * 0.4, 6.0 + sac),
                        'd': (-6.0 + sac2 * 0.5, 0.0, sac2 * 0.4, 6.0 + sac2)}
        bat = lombada(np.clip((t - 0.66) / 0.12, 0, 1), 0.35)
        # uma batida preguiçosa de cauda
        p['cauda_chao'] = [c - 16.0 * bat * onda(np.clip((t - 0.66) / 0.12, 0, 1)) * (0.6 + 0.2 * k)
                           for k, c in enumerate(base['cauda_chao'])]
        p['cauda_chao_alt'] = [0.0, 0.02 * bat, 0.03 * bat, 0.02 * bat, 0.0]
        out.append(p)
    return out, True, 0.0


def abanando(pc):
    n = 60
    out = []
    for i in range(n + 1):
        t = i / n
        p = pc.repouso()
        w = 8 * t                                # 4 abanadas por segundo
        p['corpo'] = (0.0, -0.006 * onda(w), -0.008 + 0.003 * onda(2 * w))
        p['corpo_rot'] = (1.0, -4.0 * onda(w), 2.5 * onda(w))
        p['coluna'] = [(0.0, 2.5 * onda(w - 0.05), 0.0), (0.0, 1.5 * onda(w - 0.1), 0.0), (0.0, -1.0 * onda(w - 0.15), 0.0)]
        p['pescoco'] = [(-6.0, 1.0 * onda(w - 0.3), 0.0), (-2.0, 0.0, 0.0)]
        p['cabeca'] = (2.0 + 1.0 * onda(2 * w), -1.5 * onda(w - 0.3), 3.0 * onda(t * 2))
        p['boca'] = 9.0 + 2.0 * onda(2 * w)
        p['lingua'] = (0.016, -14.0, 0.003)
        p['cauda'] = cauda_onda(36.0, w, base=(18.0, 0.0, 0.0), curva=(0, 2, 4, 4, 2), atraso=0.07)
        p['orelhas'] = {'e': (-22.0, 0.0, -10.0, 14.0 + 3 * onda(w)), 'd': (-22.0, 0.0, 10.0, 14.0 - 3 * onda(w))}
        out.append(p)
    return out, True, 0.0


# ---------------------------------------------------------------------------
# transições (uma vez só)
# ---------------------------------------------------------------------------
def preencher_dir3(pc, p):
    """Resolve a pose e grava a direção do 3o osso de cada pata (para misturar sem pulo)."""
    pose, _ = pc.resolver(p)
    p = copy.deepcopy(p)
    for nome in p['patas']:
        o3 = ('metacarpo_' if nome[0] == 'f' else 'metatarso_') + nome
        p['patas'][nome]['dir3'] = pose[o3][:3, 1].copy()
    p['cauda_modo'] = 'mundo'
    p['cauda_dirs'] = pc.direcoes_cauda(pose)
    return p


def transicao(pc, p0, p1, n, atrasos=None, passo_alto=0.035):
    """Vai de p0 a p1 em n quadros (inclui os dois extremos).

    `atrasos` dá (início, fim) normalizados por grupo de parâmetros."""
    atrasos = atrasos or {}
    p0 = preencher_dir3(pc, p0)
    p1 = preencher_dir3(pc, p1)
    out = []
    for i in range(n + 1):
        t = i / n
        p = copy.deepcopy(p0)
        for chave in p0:
            if chave in ('patas', 'cauda_modo', 'cauda_chao', 'cauda_chao_alt'):
                continue
            if chave == 'cauda_dirs':
                a, b = atrasos.get('cauda', (0.0, 1.0))
                tt = curva_s((t - a) / (b - a))
                p[chave] = [norm_(d0 + (d1 - d0) * tt) for d0, d1 in zip(p0[chave], p1[chave])]
                continue
            a, b = atrasos.get(chave, (0.0, 1.0))
            p[chave] = misturar(p0[chave], p1[chave], curva_s((t - a) / (b - a)))
        for nome in p0['patas']:
            a, b = atrasos.get('pata_' + nome[0], atrasos.get('patas', (0.0, 1.0)))
            tl = np.clip((t - a) / (b - a), 0, 1)
            tt = curva_s(tl)
            s0, s1 = p0['patas'][nome], p1['patas'][nome]
            spec = {k: misturar(s0[k], s1[k], tt) for k in ('alvo', 'kappa', 'dedos')}
            d = s0['dir3'] + (s1['dir3'] - s0['dir3']) * tt
            spec['dir3'] = d / np.linalg.norm(d)
            desl = np.linalg.norm((s1['alvo'] - s0['alvo'])[:2])
            if desl > 0.015:
                # a pata muda de lugar: dá um passinho
                spec['alvo'] = spec['alvo'] + np.array([0, 0, passo_alto * min(1.0, desl / 0.06)]) * lombada(tl, 0.45)
            spec['frente'] = s0.get('frente', P(1, 0, 0))
            p['patas'][nome] = spec
        out.append(p)
    return out


def sentando(pc):
    q = transicao(pc, pc.repouso(), pose_sentado(pc), 24,
                  {'corpo': (0.0, 1.0), 'corpo_rot': (0.05, 1.0), 'coluna': (0.1, 1.0), 'pescoco': (0.1, 0.9),
                   'cabeca': (0.15, 0.95), 'cauda': (0.0, 0.75), 'pata_t': (0.0, 0.55), 'pata_f': (0.5, 1.0)})
    return q, False, 0.0


def levantando(pc):
    q = transicao(pc, pose_sentado(pc), pc.repouso(), 21,
                  {'corpo': (0.0, 0.9), 'corpo_rot': (0.0, 0.85), 'coluna': (0.0, 0.8), 'pescoco': (0.05, 0.9),
                   'cabeca': (0.1, 1.0), 'cauda': (0.3, 1.0), 'pata_f': (0.0, 0.45), 'pata_t': (0.45, 1.0)})
    return q, False, 0.0


def deitando(pc):
    """Senta primeiro e depois escorrega as patas da frente até deitar."""
    a = transicao(pc, pc.repouso(), pose_sentado(pc), 20,
                  {'corpo': (0.0, 1.0), 'corpo_rot': (0.05, 1.0), 'pata_t': (0.0, 0.55), 'pata_f': (0.5, 1.0),
                   'cauda': (0.0, 0.8)})
    b = transicao(pc, pose_sentado(pc), pose_deitado(pc), 22,
                  {'corpo': (0.15, 1.0), 'corpo_rot': (0.1, 0.95), 'pata_f': (0.0, 0.7), 'pata_t': (0.3, 1.0),
                   'pescoco': (0.2, 1.0), 'cabeca': (0.25, 1.0)})
    return a + b[1:], False, 0.0


def levantando_do_chao(pc):
    """Empurra com a frente (fica meio sentado) e depois ergue a traseira."""
    a = transicao(pc, pose_deitado(pc), pose_sentado(pc), 14,
                  {'corpo': (0.0, 1.0), 'corpo_rot': (0.0, 0.9), 'pata_f': (0.0, 0.8), 'pata_t': (0.2, 1.0)})
    b = transicao(pc, pose_sentado(pc), pc.repouso(), 16,
                  {'corpo': (0.0, 0.95), 'corpo_rot': (0.0, 0.9), 'pata_f': (0.0, 0.4), 'pata_t': (0.35, 1.0),
                   'cauda': (0.2, 1.0)})
    return a + b[1:], False, 0.0


ANIMACOES = [
    ('parado', parado), ('andando', andando), ('trotando', trotando), ('correndo', correndo),
    ('farejando', farejando), ('sentado', sentado), ('deitado', deitado), ('abanando', abanando),
    ('sentando', sentando), ('levantando', levantando), ('deitando', deitando),
    ('levantando_do_chao', levantando_do_chao),
]
