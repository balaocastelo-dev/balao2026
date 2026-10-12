"""Animações da galinha e do galo (no lugar; o motor desloca a ave).

Andando, a cabeça fica parada no mundo enquanto o corpo passa por baixo e depois
dá o bote para a frente (o "balanço de cabeça" das galinhas). As barbelas, a
crista e a ponta da cauda têm movimento secundário (mola amortecida).
"""
import copy
import numpy as np
from esqueleto import suave, mistura, FPS
from cachorro_anim import onda, lombada, curva_s, misturar, quadros, TAU
from galinha_forma import P

PES = ('e', 'd')


def config(pa):
    g = pa.galo
    return dict(
        v_andar=0.30 if g else 0.26, n_andar=22 if g else 20,
        v_correr=1.8 if g else 1.6, n_correr=10 if g else 9,
        ergue=0.040 if g else 0.034, ergue_corre=0.065 if g else 0.058,
        esc=1.25 if g else 1.0,
    )


def alvo_cabeca(pa, df=0.0, dl=0.0, du=0.0):
    return pa.cabeca_repouso + P(df, dl, du)


def ciclo_pe(pa, s, fase, toque, duty, T, v, f0, l0, ergue, flex=38.0, curva=95.0):
    """Pé no chão andando para trás na velocidade v (apoio) e voo com os dedos encolhidos."""
    L = v * duty * T
    u0 = pa.u_pe
    fl = (fase - toque) % 1.0
    if fl < duty:
        sa = fl / duty
        f = f0 + L / 2 - L * sa
        u = u0 + 0.006 * suave(0.85, 1.0, sa)
        dk = 4.0 * np.sin(np.pi * sa) - 6.0 * suave(0.7, 1.0, sa)
        cv = -6.0 * suave(0.75, 1.0, sa)
    else:
        w = (fl - duty) / (1 - duty)
        m = -v * (1 - duty) * T * 0.4
        h00, h10, h01, h11 = 2 * w ** 3 - 3 * w ** 2 + 1, w ** 3 - 2 * w ** 2 + w, -2 * w ** 3 + 3 * w ** 2, w ** 3 - w ** 2
        f = h00 * (f0 - L / 2) + h10 * m + h01 * (f0 + L / 2) + h11 * m
        u = u0 + 0.006 * (1 - suave(0.0, 0.3, w)) + ergue * lombada(w, 0.45)
        dk = -6.0 * (1 - suave(0, 0.2, w)) + flex * lombada(w, 0.45)
        cv = curva * lombada(w, 0.40) * (1 - suave(0.8, 1.0, w))
    return P(f, l0, u), pa.kappa + dk, cv


def pes_parados(pa, p):
    for s in PES:
        p['patas'][s]['alvo'] = pa.e.cau[f'canela_{s}'].copy()


def mola(entrada, k=180.0, c=9.0, ciclos=3, repete=True):
    """Resposta de uma mola amortecida a uma entrada (aceleração), quadro a quadro."""
    n = len(entrada)
    dt = 1.0 / FPS
    x, vel = 0.0, 0.0
    saida = np.zeros(n)
    voltas = ciclos if repete else 1
    for vlt in range(voltas):
        for i in range(n):
            a = -k * x - c * vel + entrada[i]
            vel += a * dt
            x += vel * dt
            saida[i] = x
    if repete:
        # fecha o laço sem pulo
        d = saida[-1] - saida[0]
        saida = saida - d * np.linspace(0, 1, n)
    return saida


def segunda_derivada(x):
    x = np.asarray(x, dtype=float)
    d = np.zeros_like(x)
    d[1:-1] = (x[2:] - 2 * x[1:-1] + x[:-2]) * FPS * FPS
    d[0], d[-1] = d[1], d[-2]
    return d


def secundarios(pa, qs, repete=True, ganho=1.0):
    """Barbelas, crista e ponta da cauda balançando com a cabeça e o corpo."""
    fwd = np.array([(q['cabeca_alvo'] if q['cabeca_alvo'] is not None else pa.cabeca_repouso)[1] * -1 for q in qs])
    alt = np.array([(q['cabeca_alvo'] if q['cabeca_alvo'] is not None else pa.cabeca_repouso)[2] for q in qs])
    gir = np.array([(q['cabeca_mundo'] or (0, 0, 0))[1] + q['corpo_rot'][1] for q in qs])
    rol = np.array([(q['cabeca_mundo'] or (0, 0, 0))[2] for q in qs])
    corpo_u = np.array([q['corpo'][2] for q in qs])
    b_p = mola(-segunda_derivada(fwd) * 260.0 * ganho, repete=repete)
    b_r = mola(-segunda_derivada(gir) * 0.10 * ganho - segunda_derivada(rol) * 0.08 * ganho, repete=repete)
    c_r = mola(-segunda_derivada(gir) * 0.05 * ganho - segunda_derivada(rol) * 0.06 * ganho, k=260.0, c=10.0, repete=repete)
    t_p = mola(-segunda_derivada(corpo_u) * 300.0 * ganho, k=150.0, c=8.0, repete=repete)
    for i, q in enumerate(qs):
        q['barbela'] = (q['barbela'][0] + np.clip(b_p[i], -35, 35), q['barbela'][1] + np.clip(b_r[i], -30, 30))
        q['crista'] = (q['crista'][0], q['crista'][1] + np.clip(c_r[i], -12, 12) * (1.0 if pa.galo else 0.4))
        q['cauda_ponta'] = (q['cauda_ponta'][0] + np.clip(t_p[i], -12, 12), q['cauda_ponta'][1])
    return qs


# ---------------------------------------------------------------------------
def andando(pa):
    c = config(pa)
    n, v, duty = c['n_andar'], c['v_andar'], 0.60
    T = n / FPS
    out = []
    pe0 = {s: pa.e.cau[f'canela_{s}'] for s in PES}
    for fase in quadros(n):
        p = pa.repouso()
        for s, toque in (('e', 0.0), ('d', 0.5)):
            f0 = -pe0[s][1] + 0.006
            l0 = pe0[s][0] * 0.85
            alvo, kap, cv = ciclo_pe(pa, s, fase, toque, duty, T, v, f0, l0, c['ergue'])
            p['patas'][s].update(alvo=alvo, kappa=kap, curva=cv, guinada=4.0 * (1 if s == 'e' else -1))
        # corpo: gingado para o lado do pé de apoio
        lado = np.cos(TAU * (fase - 0.30))
        p['corpo'] = (0.0, 0.006 * c['esc'] * lado, -0.003 + 0.0035 * np.cos(2 * TAU * (fase - 0.30)))
        p['corpo_rot'] = (1.5 * np.cos(2 * TAU * (fase - 0.1)), 4.0 * onda(fase - 0.05), -3.0 * lado)
        # cabeça: parada no mundo e depois o bote (um por passo)
        fs = (2 * fase) % 1.0
        A = v * 0.68 * (T / 2)
        if fs < 0.68:
            df = A / 2 - A * fs / 0.68
            du = 0.0
        else:
            w = (fs - 0.68) / 0.32
            df = -A / 2 + A * curva_s(w)
            du = -0.004 * c['esc'] * np.sin(np.pi * w)
        p['cabeca_alvo'] = alvo_cabeca(pa, df + 0.008, 0.0, du)
        p['cabeca_mundo'] = (2.0 * (1 - abs(fs - 0.84) / 0.16) * (fs > 0.68), 0.0, 0.0)
        p['cauda'] = (2.0 * np.cos(2 * TAU * fase), -5.0 * onda(fase - 0.15), 2.0 * lado)
        p['asas'] = {'e': (1.5 + 1.5 * lado, 0.0, 0.0), 'd': (1.5 - 1.5 * lado, 0.0, 0.0)}
        out.append(p)
    return secundarios(pa, out), True, v


def correndo(pa):
    c = config(pa)
    n, v, duty = c['n_correr'], c['v_correr'], 0.34
    T = n / FPS
    out = []
    pe0 = {s: pa.e.cau[f'canela_{s}'] for s in PES}
    for fase in quadros(n):
        p = pa.repouso()
        for s, toque in (('e', 0.0), ('d', 0.5)):
            f0 = -pe0[s][1] + 0.034
            l0 = pe0[s][0] * 0.75
            alvo, kap, cv = ciclo_pe(pa, s, fase, toque, duty, T, v, f0, l0, c['ergue_corre'], flex=55.0, curva=105.0)
            p['patas'][s].update(alvo=alvo, kappa=kap, curva=cv)
        lado = np.cos(TAU * (fase - 0.2))
        p['corpo'] = (0.0, 0.004 * lado, -0.022 * c['esc'] + 0.008 * np.cos(2 * TAU * (fase - 0.25)))
        p['corpo_rot'] = (-16.0 + 2.0 * np.cos(2 * TAU * fase), 3.0 * onda(fase), -3.0 * lado)
        p['cabeca_alvo'] = alvo_cabeca(pa, 0.038 * c['esc'], 0.0, -0.040 * c['esc'] + 0.003 * np.cos(2 * TAU * fase))
        p['cabeca_mundo'] = (6.0, 0.0, 0.0)
        p['pescoco'] = [(-20.0, 0.0, 0.0), (10.0, 0.0, 0.0), (10.0, 0.0, 0.0)]
        bate = onda(2 * fase)
        p['asas'] = {s: (22.0, 14.0 + 12.0 * bate, 18.0 + 6.0 * bate) for s in PES}
        p['cauda'] = (-12.0 + 3.0 * np.cos(2 * TAU * fase), 3.0 * onda(fase), 0.0)
        p['boca'] = 6.0
        out.append(p)
    return secundarios(pa, out), True, v


def parada(pa):
    """Parada, com as olhadas rápidas de cabeça (troca de pose em ~0,06 s e pausa)."""
    n = 120
    chaves = [  # (tempo, guinada, arfagem, rolagem, df, du)
        (0.00, 0, 0, 0, 0.000, 0.000), (0.09, 0, 0, 0, 0.000, 0.000),
        (0.11, 32, 4, 0, -0.004, 0.004), (0.24, 32, 4, 0, -0.004, 0.004),
        (0.26, 30, 14, 26, -0.004, 0.006), (0.36, 30, 14, 26, -0.004, 0.006),
        (0.38, -8, -6, 0, 0.004, 0.000), (0.47, -8, -6, 0, 0.004, 0.000),
        (0.49, -38, 0, -8, 0.000, 0.004), (0.60, -38, 0, -8, 0.000, 0.004),
        (0.62, -30, -24, 0, 0.010, -0.010), (0.72, -30, -24, 0, 0.010, -0.010),
        (0.74, 0, 2, 0, 0.000, 0.010), (0.86, 0, 2, 0, 0.000, 0.010),
        (0.88, 14, 0, 12, 0.000, 0.004), (0.97, 14, 0, 12, 0.000, 0.004),
        (1.00, 0, 0, 0, 0.000, 0.000)]
    ts = np.array([k[0] for k in chaves])
    vals = np.array([k[1:] for k in chaves])
    c = config(pa)
    out = []
    for i in range(n + 1):
        t = i / n
        j = np.searchsorted(ts, t, side='right') - 1
        j = min(j, len(ts) - 2)
        w = curva_s((t - ts[j]) / max(ts[j + 1] - ts[j], 1e-6))
        g, a, r, df, du = vals[j] + (vals[j + 1] - vals[j]) * w
        p = pa.repouso()
        resp = onda(2 * t)
        p['corpo'] = (0.0, 0.002 * onda(t), 0.0012 * resp)
        p['corpo_rot'] = (0.6 * resp, 1.5 * onda(t + 0.2), 0.8 * onda(t))
        p['cabeca_alvo'] = alvo_cabeca(pa, df * c['esc'] + 0.002 * onda(t), 0.0, du * c['esc'])
        p['cabeca_mundo'] = (a, g, r)
        p['pescoco'] = [(0.0, 0.25 * g, 0.0), (0.0, 0.25 * g, 0.0), (0.0, 0.3 * g, 0.0)]
        abana = lombada(np.clip((t - 0.52) / 0.08, 0, 1), 0.4)
        p['cauda'] = (2.0 * abana, 10.0 * abana * onda(np.clip((t - 0.52) / 0.08, 0, 1) * 2), 0.0)
        p['asas'] = {s: (1.0 + 0.5 * resp, 0.0, 0.0) for s in PES}
        out.append(p)
    return secundarios(pa, out), True, 0.0


POSTURA_BICAR = {
    # corpo (desce, arfagem), cabeça pairando (f, u) e na bicada (f, u) — no espaço da armadura
    False: dict(desce=-0.048, arfagem=-36.0, paira=(0.088, 0.100), bica=(0.084, 0.050), jarrete=24.0),
    True: dict(desce=-0.080, arfagem=-36.0, paira=(0.106, 0.135), bica=(0.100, 0.066), jarrete=36.0),
}


def postura_bicar(pa, p, dd, olhar=0.0, inclina_cab=0.0):
    """Corpo abaixado e cabeça indo do ponto de pairar até o chão (dd de 0 a 1)."""
    b = POSTURA_BICAR[pa.galo]
    pf, pu = b['paira']
    bf, bu = b['bica']
    p['cabeca_alvo'] = P(pf + (bf - pf) * dd, 0.0, pu + (bu - pu) * dd)
    p['cabeca_mundo'] = (-60.0 - 18.0 * dd, olhar * (1 - dd), inclina_cab * (1 - dd))
    p['pescoco'] = [(-8.0, 0.0, 0.0), (-38.0, 0.0, 0.0), (-30.0, 0.0, 0.0)]
    return b


def bicando(pa):
    """Bicando o chão: corpo inclinado, a cabeça desce rápido e volta um pouco."""
    n = 60
    bicadas = (0.12, 0.33, 0.56, 0.76)
    out = []
    for i in range(n + 1):
        t = i / n
        p = pa.repouso()
        dd = 0.0
        for b in bicadas:
            w = (t - b) / 0.10
            if 0 <= w <= 1:
                dd = max(dd, lombada(w, 0.35))
        b = postura_bicar(pa, p, dd, olhar=10.0 * onda(t * 2 + 0.1), inclina_cab=12.0 * onda(t + 0.3))
        for s_ in PES:
            p['patas'][s_]['kappa'] = pa.kappa + b['jarrete']
        p['corpo'] = (0.0, 0.0, b['desce'])
        p['corpo_rot'] = (b['arfagem'], 2.0 * onda(t), 0.0)
        p['cabeca_alvo'] = p['cabeca_alvo'] + P(0.0, 0.004 * onda(t), 0.0)
        p['cauda'] = (14.0, 0.0, 0.0)
        p['boca'] = 8.0 * dd
        out.append(p)
    return secundarios(pa, out), True, 0.0


def ciscando(pa):
    """Cisca para trás duas vezes com cada pé e depois olha e bica o lugar."""
    n = 96
    c = config(pa)
    esc = c['esc']
    pe0 = {s: pa.e.cau[f'canela_{s}'] for s in PES}
    golpes = {'e': (0.04, 0.17), 'd': (0.30, 0.43)}
    dur = 0.12
    out = []
    for i in range(n + 1):
        t = i / n
        p = pa.repouso()
        apoio_lado = 0.0
        for s in PES:
            alvo = pe0[s].copy()
            kap, cv = pa.kappa, 0.0
            for g0 in golpes[s]:
                w = (t - g0) / dur
                if 0 <= w <= 1:
                    # levanta à frente (0-0,3), raspa para trás no chão (0,3-0,7), volta pelo ar (0,7-1)
                    if w < 0.3:
                        k = curva_s(w / 0.3)
                        alvo = pe0[s] + P(0.028 * k * esc, 0, 0.022 * np.sin(np.pi * k * 0.5) * esc)
                        cv = 30.0 * k
                        kap += 25.0 * k
                    elif w < 0.7:
                        k = (w - 0.3) / 0.4
                        alvo = pe0[s] + P((0.028 - 0.11 * k) * esc, 0, 0.022 * esc * (1 - suave(0, 0.25, k)) + 0.002)
                        cv = -8.0
                        kap += 25.0 - 45.0 * k
                    else:
                        k = curva_s((w - 0.7) / 0.3)
                        alvo = pe0[s] + P((-0.082 + 0.082 * k) * esc, 0, 0.03 * esc * np.sin(np.pi * k))
                        cv = 60.0 * np.sin(np.pi * k)
                        kap += -20.0 + 20.0 * k + 30.0 * np.sin(np.pi * k)
                    apoio_lado = -1.0 if s == 'e' else 1.0
            p['patas'][s].update(alvo=alvo, kappa=kap, curva=cv)
        # peso no pé de apoio (suave)
        ativo = max(lombada(np.clip((t - 0.02) / 0.30, 0, 1), 0.5) * -1.0,
                    -1.0) if t < 0.29 else lombada(np.clip((t - 0.28) / 0.30, 0, 1), 0.5)
        p['corpo'] = (-0.004 * esc, -0.008 * ativo * esc * -1, -0.006 * esc)
        p['corpo_rot'] = (-10.0 - 6.0 * suave(0.6, 0.7, t) * (1 - suave(0.92, 1.0, t)), 3.0 * ativo, -4.0 * ativo)
        # cabeça: atenta ao chão durante as ciscadas, depois abaixa, olha de lado e bica
        abaixa = suave(0.56, 0.68, t) * (1 - suave(0.92, 1.0, t))
        bic = 0.0
        for b0 in (0.74, 0.84):
            w = (t - b0) / 0.08
            if 0 <= w <= 1:
                bic = max(bic, lombada(w, 0.35))
        q = pa.repouso()
        bp = postura_bicar(pa, q, bic, olhar=12.0, inclina_cab=28.0)
        alvo_alto = alvo_cabeca(pa, 0.012 * esc, 0.0, -0.030 * esc)
        p['cabeca_alvo'] = alvo_alto + (q['cabeca_alvo'] - alvo_alto) * abaixa
        p['cabeca_mundo'] = tuple(np.array((-20.0, 0.0, 0.0)) + (np.array(q['cabeca_mundo']) - np.array((-20.0, 0.0, 0.0))) * abaixa)
        p['pescoco'] = [(-15.0 - 10.0 * abaixa, 0.0, 0.0), (-5.0 - 20.0 * abaixa, 0.0, 0.0), (-20.0 * abaixa, 0.0, 0.0)]
        cf_, cl_, cu_ = p['corpo']
        p['corpo'] = (cf_, cl_, cu_ + (bp['desce'] - cu_) * abaixa)
        for s_ in PES:
            p['patas'][s_]['kappa'] += bp['jarrete'] * abaixa
        a_, g_, r_ = p['corpo_rot']
        p['corpo_rot'] = (a_ + (bp['arfagem'] - a_) * abaixa, g_, r_)
        p['cauda'] = (6.0 + 8.0 * abaixa, 4.0 * ativo, 0.0)
        p['boca'] = 6.0 * bic
        out.append(p)
    return secundarios(pa, out), True, 0.0


def sacudindo(pa):
    """Sacode as penas: o corpo chacoalha, as asas abrem um pouco e a cauda treme."""
    n = 36
    c = config(pa)
    out = []
    for i in range(n + 1):
        t = i / n
        p = pa.repouso()
        env = suave(0.08, 0.22, t) * (1 - suave(0.62, 0.86, t))
        prep = lombada(np.clip(t / 0.25, 0, 1), 0.5)
        chac = onda(7.5 * t / (n / FPS) * (n / FPS))
        p['corpo'] = (0.0, 0.004 * env * onda(7.0 * t * 1.2), -0.006 * prep * c['esc'])
        p['corpo_rot'] = (2.0 * prep, 4.0 * env * onda(8.4 * t + 0.25), 16.0 * env * onda(8.4 * t))
        p['cabeca_alvo'] = alvo_cabeca(pa, -0.006 * c['esc'] * env, 0.0, -0.004 * prep)
        p['cabeca_mundo'] = (0.0, 24.0 * env * onda(10.5 * t + 0.1), 10.0 * env * onda(10.5 * t + 0.35))
        p['pescoco'] = [(0.0, 0.0, 0.0)] * 3
        abre = 4.0 * prep + 18.0 * env * (0.6 + 0.4 * onda(12 * t))
        p['asas'] = {s: (abre, 10.0 * env * (0.5 + 0.5 * onda(12 * t + 0.25)), 10.0 * env) for s in PES}
        p['cauda'] = (6.0 * env, 14.0 * env * onda(9.0 * t + 0.4), 14.0 * env * onda(9.0 * t))
        out.append(p)
    # o fim volta exatamente ao repouso
    return secundarios(pa, out, repete=False, ganho=1.4), False, 0.0


def cantando(pa):
    """Galo cantando: bate as asas, enche o peito, estica o pescoço e abre o bico."""
    n = 75
    out = []
    for i in range(n + 1):
        t = i / n
        p = pa.repouso()
        # batidas de asa no começo
        bat = suave(0.0, 0.04, t) * (1 - suave(0.24, 0.30, t))
        asa = bat * (0.5 - 0.5 * np.cos(TAU * 3 * np.clip(t / 0.28, 0, 1)))
        # enche o peito e estica
        enche = suave(0.26, 0.40, t) * (1 - suave(0.84, 0.98, t))
        canto = suave(0.38, 0.46, t) * (1 - suave(0.80, 0.90, t))
        treme = canto * onda(12.0 * t * 2.5)
        p['corpo'] = (0.0, 0.0, 0.010 * enche + 0.004 * asa)
        p['corpo_rot'] = (10.0 * enche + 6.0 * asa, 0.0, 0.0)
        p['cabeca_alvo'] = alvo_cabeca(pa, 0.004 - 0.018 * enche + 0.035 * canto, 0.0, 0.010 * enche + 0.040 * canto)
        p['cabeca_mundo'] = (8.0 * enche + 30.0 * canto + 1.5 * treme, 0.0, 0.0)
        p['pescoco'] = [(10.0, 0.0, 0.0), (5.0, 0.0, 0.0), (5.0, 0.0, 0.0)]
        p['boca'] = 30.0 * canto * (0.85 + 0.15 * onda(6.0 * t))
        p['asas'] = {s: (6.0 * asa + 3.0 * enche, 75.0 * asa, 25.0 * asa) for s in PES}
        p['cauda'] = (10.0 * enche, 0.0, 0.0)
        out.append(p)
    return secundarios(pa, out, repete=False), False, 0.0


def animacoes(galo):
    lista = [('parada', parada), ('andando', andando), ('bicando', bicando), ('ciscando', ciscando),
             ('correndo', correndo), ('sacudindo', sacudindo)]
    if galo:
        lista.append(('cantando', cantando))
    return lista
