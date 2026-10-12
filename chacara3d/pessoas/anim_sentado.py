"""Animações sentadas e deitada (feitas por código).

A altura do quadril é calibrada para cada pessoa: a pele das nádegas/coxas (skinning
linear do corpo) encosta no assento.
"""
import numpy as np

import humano as HU
import pose as PZ
from animacoes import FPS, quadro_mao, boca
from humano import ruido, suave, sinal
from pose import norm

X, Y, Z = np.eye(3)


# ---------------------------------------------------------------------------
# corpo sentado
# ---------------------------------------------------------------------------
def montar_sentado(ctx, b, y_q, z_q=0.0, pelve=-10.0, tronco=12.0, lado=0.0, giro=0.0, abrir=0.07,
                   pes_frente=0.0, balanco=(0.0, 0.0), giro_pe=8.0):
    """Quadril em (0, y_q, z_q), coxas para a frente, pés no chão (ou pendurados)."""
    h = ctx.h
    J = h.J
    b.quadril(pos=(0.0, y_q, z_q), flexao=pelve, lado=lado * 0.4, giro=giro * 0.3)
    b.coluna(flexao=tronco, lado=lado * 0.6, giro=giro * 0.7)
    P = b.P()
    for i, l in enumerate(('_e', '_d')):
        s = sinal(l)
        H = P['coxa' + l]
        l1, l2 = ctx.esq.comp['coxa' + l], ctx.esq.comp['canela' + l]
        # joelho: coxa quase horizontal, um pouco aberta
        dk = norm(np.array([s * abrir, -0.09, 1.0]))
        K = H + dk * l1
        y_tor = h.y_tornozelo
        dy = K[1] - y_tor
        if dy < l2 * 0.999:
            ang = np.arccos(np.clip(dy / l2, -1, 1)) + np.radians(pes_frente)
            A = K + l2 * np.array([s * 0.02, -np.cos(ang), np.sin(ang)])
            A[1] = max(A[1], y_tor)
            Rpe = PZ.Ry(s * giro_pe)
        else:
            # pés pendurados (criança): canela quase vertical, ponta do pé para baixo
            sw = balanco[i]
            A = K + l2 * norm(np.array([s * 0.02, -1.0, 0.18 + sw]))
            Rpe = PZ.Ry(s * giro_pe) @ PZ.Rx(22 + 10 * sw)
        b.perna_ik(l, A, Rpe, polo=K - H)
    return b


def calibrar_sentado(ctx, y_assento, cfg, z_q=0.0, regiao='nadegas'):
    """Altura do quadril para a pele encostar no assento (y_assento)."""
    k = ('sent', y_assento, tuple(sorted(cfg.items())), z_q, regiao)
    if k in ctx._cache:
        return ctx._cache[k]
    import ossos as O
    I = O.INDICE
    W = ctx.W
    sel = (W[:, I['quadril']] + W[:, I['coxa_e']] + W[:, I['coxa_d']]) > 0.6
    y = ctx.esq.J['coxa_e'][1] - 0.35
    y_q = y_assento + 0.1
    for _ in range(4):
        b = ctx.h.nova()
        montar_sentado(ctx, b, y_q, z_q, **cfg)
        Rw, pq = b.fim()
        Vd = PZ.pele(ctx.V, W, ctx.esq, Rw, pq)
        P = ctx.esq.fk(Rw, pq)
        # só a parte de baixo das nádegas e das coxas, atrás do joelho
        zk = min(P['canela_e'][2], P['canela_d'][2])
        m = sel & (Vd[:, 2] < zk - 0.12)
        baixo = Vd[m, 1].min()
        y_q += (y_assento - baixo)
    _ = y
    ctx._cache[k] = y_q
    return y_q


def maos_nas_coxas(ctx, b, recuo=(0.45, 0.45), lev=(0.0, 0.0), extra=None):
    """Mãos apoiadas em cima das coxas (palma para baixo, dedos para a frente)."""
    P = b.P()
    for i, l in enumerate(('_e', '_d')):
        s = sinal(l)
        H, K = P['coxa' + l], P['canela' + l]
        sup = H + (K - H) * recuo[i]
        # em cima da coxa
        cima = b.Rw['coxa' + l] @ np.array([0, 0, 1.0])
        topo = sup + np.array([0, 0.075 * ctx.h.k + lev[i], 0])
        dedos = norm(K - H + np.array([-s * 0.25, -0.15, 0]))
        Q = quadro_mao(l, dedos, np.array([s * 0.25, -1.0, 0]))
        alvo = topo + dedos * 0.02
        if extra and l in extra:
            alvo = alvo + extra[l]
        b.braco_ik(l, pega=alvo, quadro=Q, polo=b.Rw['quadril'] @ np.array([s * 0.9, -0.2, -0.5]))
        _ = cima
    return b


# ---------------------------------------------------------------------------
def sentado(ctx):
    h = ctx.h
    n = 180
    T = n / FPS
    cfg = dict(pelve=-10.0, tronco=12.0)
    y_q = calibrar_sentado(ctx, 0.45, cfg)
    out = []
    for i in range(n):
        t = i / FPS
        b = h.nova()
        resp = np.sin(2 * np.pi * 2 * t / T)
        lado = ruido(t, T, 21, (1, 2), 1.8)
        giro = ruido(t, T, 22, (1, 2), 4)
        bal = (0.15 * np.sin(2 * np.pi * 3 * t / T), 0.15 * np.sin(2 * np.pi * 3 * t / T + 2))
        montar_sentado(ctx, b, y_q, tronco=12 + 1.2 * resp, lado=lado, giro=giro, balanco=bal, **{'pelve': -10.0})
        b.clavicula('_e', elevacao=1.5 * resp)
        b.clavicula('_d', elevacao=1.5 * resp)
        # a mão direita ajeita na coxa entre 3,4 s e 4,4 s
        aj = HU.janela(t, 3.4, 4.4, 0.35)
        maos_nas_coxas(ctx, b, recuo=(0.48, 0.5 - 0.12 * aj), lev=(0.0, 0.03 * aj))
        b.cabeca(flexao=4 + ruido(t, T, 23, (1, 2, 3), 4), giro=ruido(t, T, 24, (1, 2), 16), lado=ruido(t, T, 25, (1, 2), 3))
        out.append(b.fim())
    pend = ' Criança: na cadeira de adulto os pés ficam pendurados (~10 cm do chão), balançando.' \
        if ctx.tipo == 'crianca' else ''
    return dict(poses=out, notas=f'assento a 0,45 m (nádegas encostam); quadril (articulação) em y={y_q:.3f}, z=0: '
                                 'a origem fica no chão debaixo dos ísquios, ~0,12 m à frente do encosto.' + pend,
                assento_m=0.45, previa=dict(cenario='cadeira'))


def sentado_conversando(ctx):
    h = ctx.h
    n = 240
    T = n / FPS
    cfg = dict(pelve=-8.0, tronco=16.0)
    y_q = calibrar_sentado(ctx, 0.45, cfg)
    out = []
    # gestos: (início, fim, mão, intensidade)
    gestos = [(0.8, 2.8, '_d', 1.0), (3.3, 4.4, '_e', 0.7), (5.0, 7.2, '_d', 0.8)]
    acenos = [2.9, 6.0]
    for i in range(n):
        t = i / FPS
        b = h.nova()
        resp = np.sin(2 * np.pi * 3 * t / T)
        lado = ruido(t, T, 31, (1, 2), 1.5)
        montar_sentado(ctx, b, y_q, tronco=16 + resp, lado=lado, giro=-6 + ruido(t, T, 32, (1, 2), 3), pelve=-8.0)
        maos_nas_coxas(ctx, b, recuo=(0.5, 0.5))
        Rp = b.Rw['peito']
        P = b.P()
        for (a, z, l, it) in gestos:
            w = HU.janela(t, a, z, 0.45)
            if w <= 0:
                continue
            s = sinal(l)
            # mão sobe na frente do peito, palma para cima e para dentro, com batidas
            batida = np.sin(2 * np.pi * 1.8 * (t - a)) * 0.025 * it
            alvo_g = P['peito'] + Rp @ np.array([s * 0.13 * h.k, -0.12 * h.k + batida, 0.36 * h.k])
            atual = b.esq.fk(b.Rw, b.pq)['pega' + l]
            alvo = atual + (alvo_g - atual) * w * it
            dedos = Rp @ norm(np.array([-s * 0.35, 0.1, 1.0]))
            palma = Rp @ norm(np.array([-s * 0.6, 1.0, 0.0]))
            Qg = quadro_mao(l, dedos, palma)
            Qa = b.Rw['mao' + l] @ ctx.esq.P_pega['pega' + l]
            Q = PZ.slerp_R(Qa, Qg, w)
            b.braco_ik(l, pega=alvo, quadro=Q, polo=b.Rw['quadril'] @ np.array([s * 0.8, -0.6, -0.3]))
        ac = 0.0
        for a in acenos:
            x = (t - a) / 1.0
            if 0 <= x <= 1:
                ac += np.sin(x * 2 * np.pi * 2) * np.sin(np.pi * x) * 6
        b.cabeca(flexao=2 + ac + ruido(t, T, 33, (1, 2), 3), giro=-20 + ruido(t, T, 34, (1, 2), 8), lado=-3)
        out.append(b.fim())
    return dict(poses=out, notas='sentado (assento 0,45 m) conversando com alguém à direita: gestos e acenos de cabeça',
                assento_m=0.45, previa=dict(cenario='cadeira'))


def sentado_comendo(ctx):
    """Balde de pipoca no colo; a mão direita vai do balde à boca a cada 3 s."""
    h = ctx.h
    n = 180
    T = n / FPS
    cfg = dict(pelve=-12.0, tronco=12.0)
    y_q = calibrar_sentado(ctx, 0.45, cfg)
    out = []
    balde = None
    for i in range(n):
        t = i / FPS
        b = h.nova()
        resp = np.sin(2 * np.pi * 2 * t / T)
        montar_sentado(ctx, b, y_q, tronco=12 + resp, lado=ruido(t, T, 41, (1, 2), 1.0), pelve=-12.0, abrir=0.1)
        P = b.P()
        Rq = b.Rw['quadril']
        if balde is None:
            # balde no meio das coxas (posição do repouso sentado, fixa no referencial da pessoa)
            meio = 0.5 * (P['coxa_e'] + P['canela_e'] + P['coxa_d'] + P['canela_d']) / 2
            balde = meio + np.array([0, 0.07 * h.k + 0.06, -0.02])
        # mão esquerda segura a borda do balde do lado esquerdo
        borda_e = balde + np.array([0.085, 0.08, 0.0])
        Qe = quadro_mao('_e', norm([-0.6, -0.4, 0.7]), norm([-1.0, -0.2, 0.0]))
        b.braco_ik('_e', pega=borda_e, quadro=Qe, polo=Rq @ np.array([0.9, -0.3, -0.4]))
        # mão direita: no balde -> boca -> balde (ciclo de 3 s)
        f = (t % 3.0) / 3.0
        sobe = suave((f - 0.18) / 0.22) * suave((0.78 - f) / 0.22)
        b.cabeca(flexao=3 - 6 * sobe + ruido(t, T, 42, (1, 2), 2), giro=ruido(t, T, 43, (1, 2), 6))
        P = b.P()
        bc = boca(ctx, P, b.Rw)
        fr_cab = b.Rw['cabeca'] @ Z
        no_balde = balde + np.array([-0.02, 0.05 + 0.02 * np.sin(2 * np.pi * f * 2), 0.01])
        na_boca = bc + fr_cab * 0.05 - b.Rw['cabeca'] @ np.array([0, 0.03, 0])
        alvo = no_balde + (na_boca - no_balde) * sobe
        Qb = quadro_mao('_d', norm([0.1, -1.0, 0.25]), norm([0.0, 0.0, -1.0]))
        Qm = quadro_mao('_d', norm(b.Rw['cabeca'] @ np.array([0.5, 0.6, -0.3])), -fr_cab)
        Q = PZ.slerp_R(Qb, Qm, sobe)
        b.braco_ik('_d', pega=alvo, quadro=Q, polo=Rq @ np.array([-0.8, -0.6, -0.3]))
        # mastigando: cabeça mexe de leve depois de levar à boca
        mast = suave((f - 0.7) / 0.1) * np.sin(2 * np.pi * 3 * t) * 1.2
        b.somar_cabeca(flexao=mast)
        out.append(b.fim())
    return dict(poses=out, notas=f'balde de pipoca no colo: centro da boca do balde em ({balde[0]:.2f}, {balde[1]:.2f}, '
                                 f'{balde[2]:.2f}) m no referencial da pessoa; mão esquerda na borda esquerda, mão '
                                 'direita pega e leva à boca a cada 3 s', assento_m=0.45,
                balde_m=[round(float(x), 3) for x in balde], previa=dict(cenario='cadeira'))


def sentado_assistindo(ctx):
    h = ctx.h
    n = 240
    T = n / FPS
    cfg = dict(pelve=-16.0, tronco=8.0)
    y_q = calibrar_sentado(ctx, 0.45, cfg, z_q=-0.02)
    out = []
    for i in range(n):
        t = i / FPS
        b = h.nova()
        resp = np.sin(2 * np.pi * 3 * t / T)
        aj = HU.janela(t, 4.5, 6.0, 0.5)          # muda de posição de leve
        montar_sentado(ctx, b, y_q, z_q=-0.02, tronco=8 + 0.8 * resp + 2 * aj, lado=ruido(t, T, 51, (1,), 1.2) + 1.5 * aj,
                       pelve=-16.0, abrir=0.09)
        maos_nas_coxas(ctx, b, recuo=(0.35, 0.38 + 0.05 * aj))
        b.cabeca(flexao=-2 + ruido(t, T, 52, (1, 2), 1.5), giro=ruido(t, T, 53, (1,), 3),
                 lado=2 + ruido(t, T, 54, (1, 2), 2) + 2 * aj)
        out.append(b.fim())
    return dict(poses=out, notas='sentado (assento 0,45 m) assistindo, recostado, quase parado', assento_m=0.45, previa=dict(cenario='cadeira'))


# ---------------------------------------------------------------------------
def montar_chao(ctx, b, y_q, lado=0.0, tronco=14.0, giro=0.0, pe_y=0.0):
    """Sentado de pernas cruzadas no chão."""
    h = ctx.h
    b.quadril(pos=(0.0, y_q, 0.0), flexao=-14.0, lado=lado * 0.4, giro=giro * 0.3)
    b.coluna(flexao=tronco, lado=lado * 0.6, giro=giro * 0.7)
    P = b.P()
    kk = h.k
    for l in ('_e', '_d'):
        s = sinal(l)
        H = P['coxa' + l]
        # tornozelo cruzado na frente, debaixo da canela da outra perna
        A = np.array([-s * 0.13 * kk, 0.075 * kk, H[2] + 0.30 * kk + (0.03 if l == '_e' else -0.03)])
        # pe_y: folga calibrada para a pele do pé ficar a 2 cm do chão (a sola do calçado, de
        # lado com o pé deitado, ocupa essa folga)
        A[1] = 0.055 * kk + (0.03 * kk if l == '_d' else 0.0) + pe_y
        Rpe = PZ.Ry(-s * 75) @ PZ.Rz(s * 55)
        b.perna_ik(l, A, Rpe, polo=np.array([s * 1.0, 0.45, 0.4]))
    return b


def calibrar_chao(ctx):
    if 'chao' in ctx._cache:
        return ctx._cache['chao']
    import ossos as O
    I = O.INDICE
    W = ctx.W
    sel = (W[:, I['quadril']] + W[:, I['coxa_e']] + W[:, I['coxa_d']]) > 0.6
    y_q = 0.15
    for _ in range(4):
        b = ctx.h.nova()
        montar_chao(ctx, b, y_q)
        Rw, pq = b.fim()
        Vd = PZ.pele(ctx.V, W, ctx.esq, Rw, pq)
        m = sel & (Vd[:, 2] < pq[2] + 0.05)
        y_q += (0.008 - Vd[m, 1].min())          # pele a 8 mm: a roupa (bermuda, calça) encosta no chão
    # pés (altura própria em montar_chao) a 2 cm do chão e nada do resto abaixo do chão
    pe = sum(W[:, I[o + l]] for o in ('pe', 'dedos_pe') for l in ('_e', '_d')) > 0.5
    pe_y = 0.0
    for _ in range(3):
        b = ctx.h.nova()
        montar_chao(ctx, b, y_q, pe_y=pe_y)
        Rw, pq = b.fim()
        Vd = PZ.pele(ctx.V, W, ctx.esq, Rw, pq)
        pe_y += 0.02 - Vd[pe, 1].min()
        y_q += max(-0.002 - Vd[~pe, 1].min(), 0.0)
    ctx._cache['chao'] = (y_q, pe_y)
    return y_q, pe_y


def sentado_chao(ctx):
    h = ctx.h
    n = 180
    T = n / FPS
    y_q, pe_y = calibrar_chao(ctx)
    out = []
    for i in range(n):
        t = i / FPS
        b = h.nova()
        resp = np.sin(2 * np.pi * 2 * t / T)
        montar_chao(ctx, b, y_q, lado=ruido(t, T, 61, (1, 2), 2), tronco=14 + resp, giro=ruido(t, T, 62, (1,), 4),
                    pe_y=pe_y)
        P = b.P()
        for l in ('_e', '_d'):
            s = sinal(l)
            joelho = P['canela' + l]
            alvo = joelho + np.array([-s * 0.02, 0.07 * h.k, -0.04 * h.k])
            Q = quadro_mao(l, norm([s * 0.3, -0.5, 1.0]), np.array([0, -1.0, 0]))
            b.braco_ik(l, pega=alvo, quadro=Q, polo=np.array([s * 1.0, -0.3, -0.4]))
        b.cabeca(flexao=6 + ruido(t, T, 63, (1, 2), 4), giro=ruido(t, T, 64, (1, 2), 15))
        out.append(b.fim())
    return dict(poses=out, notas=f'sentado no chão de pernas cruzadas, mãos nos joelhos; quadril em y={y_q:.3f}')


# ---------------------------------------------------------------------------
def montar_borda(ctx, b, y_q, z_q, chute=(0.0, 0.0), recl=-6.0):
    h = ctx.h
    b.quadril(pos=(0.0, y_q, z_q), flexao=recl - 4, lado=0.0)
    b.coluna(flexao=4.0)
    P = b.P()
    for i, l in enumerate(('_e', '_d')):
        s = sinal(l)
        H = P['coxa' + l]
        l1, l2 = ctx.esq.comp['coxa' + l], ctx.esq.comp['canela' + l]
        K = H + l1 * norm(np.array([s * 0.06, -0.03, 1.0]))
        A = K + l2 * norm(np.array([s * 0.02, -1.0, 0.08 + chute[i]]))
        Rpe = PZ.Ry(s * 6) @ PZ.Rx(25 + 15 * chute[i])
        b.perna_ik(l, A, Rpe, polo=np.array([s * 0.2, 0.3, 1.0]))
    return b


def calibrar_borda(ctx):
    if 'borda' in ctx._cache:
        return ctx._cache['borda']
    import ossos as O
    I = O.INDICE
    W = ctx.W
    sel = (W[:, I['quadril']] + W[:, I['coxa_e']] + W[:, I['coxa_d']]) > 0.6
    h = ctx.h
    y_q, z_q = 0.1, -0.4
    for _ in range(5):
        b = h.nova()
        montar_borda(ctx, b, y_q, z_q)
        Rw, pq = b.fim()
        Vd = PZ.pele(ctx.V, W, ctx.esq, Rw, pq)
        m = sel & (Vd[:, 2] < 0.0)
        y_q += (0.0 - Vd[m, 1].min())
        # a parte de trás do joelho fica na borda (z = 0)
        P = ctx.esq.fk(Rw, pq)
        m2 = sel & (Vd[:, 1] < 0.04) & (np.abs(Vd[:, 0] - P['canela_e'][0]) < 0.08)
        z_frente = Vd[m2, 2].max() if m2.any() else P['canela_e'][2]
        z_q += (0.0 - z_frente) + 0.01
    ctx._cache['borda'] = (y_q, z_q)
    return y_q, z_q


def sentado_borda(ctx):
    h = ctx.h
    n = 180
    T = n / FPS
    y_q, z_q = calibrar_borda(ctx)
    out = []
    for i in range(n):
        t = i / FPS
        b = h.nova()
        ch = (0.18 * np.sin(2 * np.pi * 4 * t / T), 0.18 * np.sin(2 * np.pi * 4 * t / T + np.pi))
        montar_borda(ctx, b, y_q, z_q, chute=ch)
        b.coluna(flexao=4 + np.sin(2 * np.pi * 2 * t / T), lado=ruido(t, T, 71, (1,), 1.5))
        P = b.P()
        for l in ('_e', '_d'):
            s = sinal(l)
            # mãos no chão ao lado do quadril, um pouco para trás
            alvo = np.array([s * (0.24 * h.k), 0.035, P['coxa' + l][2] - 0.08 * h.k])
            Q = quadro_mao(l, norm([s * 0.15, 0, 1.0]), np.array([0, -1.0, 0]))
            b.braco_ik(l, pega=alvo, quadro=Q, polo=np.array([s * 0.3, 0.0, -1.0]))
        b.cabeca(flexao=8 + ruido(t, T, 72, (1, 2), 4), giro=ruido(t, T, 73, (1, 2), 14))
        out.append(b.fim())
    P0 = h.esq.fk(*out[0])
    pe_y = min(P0['pe_e'][1], P0['pe_d'][1])
    return dict(poses=out, notas=f'sentado na borda (y = 0) com a borda em z = 0; pernas pendem e batem na água; '
                                 f'tornozelos em y≈{pe_y:.2f} m', pes_m=round(float(pe_y), 3),
                previa=dict(cenario='borda', chao_y=-1.35))


# ---------------------------------------------------------------------------
ANG_ENCOSTO = 35.0      # graus acima da horizontal
Y_ESPREG = 0.32         # altura do assento da espreguiçadeira


def montar_deitado(ctx, b, y_q, resp=0.0):
    h = ctx.h
    # tronco inclinado: quadril gira para trás (flexão negativa)
    recl = -(90 - ANG_ENCOSTO)
    b.quadril(pos=(0.0, y_q, 0.0), flexao=recl * 0.55)
    b.coluna(flexao=recl * 0.45 + 2 * resp, pesos=(0.4, 0.35, 0.25))
    P = b.P()
    for l in ('_e', '_d'):
        s = sinal(l)
        H = P['coxa' + l]
        l1, l2 = ctx.esq.comp['coxa' + l], ctx.esq.comp['canela' + l]
        dirc = norm(np.array([s * 0.12, 0.06, 1.0]))
        K = H + dirc * l1
        A = K + l2 * norm(np.array([s * 0.05, -0.12, 1.0]))
        Rpe = PZ.Ry(s * 20) @ PZ.Rx(-80)
        b.perna_ik(l, A, Rpe, polo=np.array([s * 0.3, 1.0, 0.0]))
    return b


def calibrar_deitado(ctx):
    if 'deitado' in ctx._cache:
        return ctx._cache['deitado']
    import ossos as O
    I = O.INDICE
    W = ctx.W
    sel = (W[:, I['quadril']] + W[:, I['coxa_e']] + W[:, I['coxa_d']]) > 0.6
    y_q = 0.45
    for _ in range(4):
        b = ctx.h.nova()
        montar_deitado(ctx, b, y_q)
        Rw, pq = b.fim()
        Vd = PZ.pele(ctx.V, W, ctx.esq, Rw, pq)
        y_q += (Y_ESPREG - Vd[sel, 1].min())
    ctx._cache['deitado'] = y_q
    return y_q


def deitado(ctx):
    h = ctx.h
    n = 240
    T = n / FPS
    y_q = calibrar_deitado(ctx)
    out = []
    for i in range(n):
        t = i / FPS
        b = h.nova()
        resp = np.sin(2 * np.pi * 3 * t / T)
        montar_deitado(ctx, b, y_q, resp)
        P = b.P()
        Rp = b.Rw['peito']
        # braço direito atrás da cabeça, mão esquerda na barriga
        nuca = P['cabeca'] + Rp @ np.array([-0.02, 0.06 * h.k, -0.10 * h.k])
        Qd = quadro_mao('_d', Rp @ norm([1.0, 0.2, 0.0]), Rp @ np.array([0, 0, 1.0]))
        b.braco_ik('_d', pega=nuca, quadro=Qd, polo=Rp @ np.array([-1.0, 0.6, 0.0]))
        barriga = P['coluna_2'] + Rp @ np.array([0.02, 0.0, 0.17 * h.k]) + Rp @ np.array([0, 0, 0.01 * resp])
        Qe = quadro_mao('_e', Rp @ norm([-1.0, 0.1, 0.0]), Rp @ np.array([0, 0, -1.0]))
        b.braco_ik('_e', pega=barriga, quadro=Qe, polo=Rp @ np.array([1.0, -0.3, -0.4]))
        b.cabeca(flexao=22 + ruido(t, T, 81, (1, 2), 3), giro=ruido(t, T, 82, (1,), 8))
        out.append(b.fim())
    return dict(poses=out, notas=f'deitado de costas na espreguiçadeira: assento a {Y_ESPREG} m, encosto a '
                                 f'{ANG_ENCOSTO:.0f}° da horizontal começando no quadril (articulação em y={y_q:.3f}, z=0); '
                                 'pernas esticadas para +Z; braço direito atrás da cabeça',
                assento_m=Y_ESPREG, angulo_encosto_graus=ANG_ENCOSTO, previa=dict(cenario='espreguicadeira'))


SENTADO = [
    ('sentado', sentado), ('sentado_conversando', sentado_conversando), ('sentado_comendo', sentado_comendo),
    ('sentado_assistindo', sentado_assistindo), ('sentado_chao', sentado_chao), ('sentado_borda', sentado_borda),
    ('deitado', deitado),
]
