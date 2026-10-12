"""Trabalho na chácara: cortar grama, rastelar, varrer, colher, carregar cesto,
limpar a piscina e grelhar.

Ferramentas de cabo (rastelo, vassoura, peneira de piscina) e o pegador: o objeto fica
preso na `pega_d` com o cabo no eixo +Y da pega, que aponta da mão direita para a mão
esquerda (o motor só precisa prender o objeto na pega_d; a mão esquerda já está sobre a
linha do cabo, à distância documentada nas notas).
"""
import numpy as np

import humano as HU
import pose as PZ
from animacoes import FPS, quadro_mao, reamostrar_tempo
from humano import ruido, suave, suave5, sinal
from pose import norm, rot

X, Y, Z = np.eye(3)


def quadro_cabo(eixo, palma, l):
    """Quadro da pega segurando um cabo: Y = `eixo` (para o lado do polegar), X da palma."""
    y = norm(eixo)
    n = np.asarray(palma, float) - y * np.dot(palma, y)
    n = norm(n)
    x = n if l == '_d' else -n
    z = np.cross(x, y)
    return np.stack([x, y, z], axis=1)


def andar_base(ctx, velocidade):
    p, v = ctx.captura('07_04', 27, 70, mistura=10, modo='velocidade')
    f = velocidade / v
    p = reamostrar_tempo(p, f)
    return p, v * f


# ---------------------------------------------------------------------------
def cortando_grama(ctx):
    h = ctx.h
    k = h.k if ctx.tipo == 'crianca' else 1.0
    base, v = andar_base(ctx, 0.8)
    base = base + base           # duas voltas
    n = len(base)
    T = n / FPS
    y_g, z_g, meio = 0.95 * k, 0.45 * k, 0.22 * h.k
    out = []
    for i, (Rw, pq) in enumerate(base):
        t = i / FPS
        b = HU.de_pose(h, Rw, pq)
        # tronco um pouco para a frente, empurrando
        b.somar_coluna(flexao=12)
        b.somar_cabeca(flexao=8 + ruido(t, T, 302, (1, 2), 3), giro=ruido(t, T, 303, (1,), 6))
        vib = 0.004 * np.sin(2 * np.pi * 9 * t / T * 4)
        for l in ('_e', '_d'):
            s = sinal(l)
            alvo = np.array([s * meio, y_g + vib, z_g])
            Q = quadro_cabo(np.array([-s, 0, 0.0]), np.array([0, -0.85, -0.5]), l)
            b.braco_ik(l, pega=alvo, quadro=Q, polo=np.array([s * 0.7, -0.6, -0.5]))
        out.append(b.fim())
    return dict(poses=out, velocidade=v, notas=f'empurrando o cortador a {v:.2f} m/s: as duas mãos no guidão a '
                                               f'{y_g:.2f} m de altura e {z_g:.2f} m à frente da origem, a ±{meio:.2f} m '
                                               '(guidão horizontal, no eixo X)',
                guidao_m=dict(altura=round(y_g, 3), frente=round(z_g, 3), meia_largura=round(meio, 3)))


def carregando_cesto(ctx):
    h = ctx.h
    k = h.k
    base, v = andar_base(ctx, 1.0)
    base = base + base
    n = len(base)
    T = n / FPS
    centro = np.array([0.0, 0.93 * k, 0.33 * k])
    meio = 0.19 * k
    out = []
    for i, (Rw, pq) in enumerate(base):
        t = i / FPS
        b = HU.de_pose(h, Rw, pq)
        b.somar_coluna(flexao=-6)
        b.somar_cabeca(flexao=8 + ruido(t, T, 312, (1, 2), 3), giro=ruido(t, T, 313, (1,), 5))
        # o cesto balança com a passada (sobe e desce com o quadril)
        sob = (pq[1] - h.J['quadril'][1]) * 0.6
        for l in ('_e', '_d'):
            s = sinal(l)
            alvo = centro + np.array([s * meio, sob, 0.0])
            Q = quadro_mao(l, norm([0, -0.45, 0.9]), np.array([-s, 0.15, 0.0]))
            b.braco_ik(l, pega=alvo, quadro=Q, polo=np.array([s * 0.9, -0.5, -0.3]))
        out.append(b.fim())
    return dict(poses=out, velocidade=v, notas=f'andando a {v:.2f} m/s com um cesto na frente: centro do cesto em '
                                               f'(0, {centro[1]:.2f}, {centro[2]:.2f}) m (sobe e desce com o quadril), '
                                               f'mãos nas alças laterais a ±{meio:.2f} m',
                cesto_m=[round(float(x), 3) for x in centro])


# ---------------------------------------------------------------------------
def ferramenta_duas_maos(b, ctx, mao_d, eixo, dist_e, palma_d, palma_e, polo_d, polo_e):
    """Mão direita em `mao_d`, cabo na direção `eixo` (para a mão esquerda), mão esquerda a
    `dist_e` ao longo do cabo, ou no ponto alcançável do cabo mais perto disso (a mão
    escorrega no cabo como na vida real). Devolve a distância usada."""
    u = norm(eixo)
    Qd = quadro_cabo(u, palma_d, '_d')
    b.braco_ik('_d', pega=mao_d, quadro=Qd, polo=polo_d)
    # o cabo vai onde a mão direita chegou de fato (se o alvo ficou um pouco longe)
    mao_d = b.P()['pega_d']
    u = (b.Rw['mao_d'] @ ctx.esq.P_pega['pega_d'])[:, 1]
    # alcance: o punho esquerdo (pega menos a mão, com a mão já na orientação do cabo) tem de
    # ficar a menos do comprimento do braço do ombro esquerdo
    esq = ctx.esq
    S = b.P()['braco_e']
    Qe = quadro_cabo(-u, palma_e, '_e')
    c = (Qe @ esq.P_pega['pega_e'].T) @ (esq.J['pega_e'] - esq.J['mao_e'])
    R = 0.985 * (esq.comp['braco_e'] + esq.comp['antebraco_e'])
    v = np.asarray(mao_d) - c - S
    vu = v @ u
    disc = vu * vu - v @ v + R * R
    if disc > 0:
        t1, t2 = -vu - np.sqrt(disc), -vu + np.sqrt(disc)
        d = float(np.clip(dist_e, max(t1, 0.12 * ctx.h.k), t2)) if t2 > 0.12 * ctx.h.k else max(t2, 0.10)
    else:
        d = max(-vu, 0.12 * ctx.h.k)
    mao_e = mao_d + u * d
    b.braco_ik('_e', pega=mao_e, quadro=Qe, polo=polo_e)
    return d


def rastelando(ctx):
    h = ctx.h
    k = h.k
    J = h.J
    n = 96                          # 3,2 s: duas puxadas
    T = n / FPS
    d_cabeca = 1.05 * k             # da mão direita até a cabeça do rastelo
    d_esq = 0.40 * k
    usados = []
    out = []
    for i in range(n):
        t = i / FPS
        f = (t / (T / 2)) % 1.0
        j = int(t // (T / 2))
        # puxada (0..0.6): a mão vem para perto do corpo; volta (0.6..1): levanta e estica
        if f < 0.6:
            w = suave(f / 0.6)
            lev = 0.0
        else:
            w = 1 - suave5((f - 0.6) / 0.4)
            lev = 0.06 * k * np.sin(np.pi * (f - 0.6) / 0.4)
        lado = (-0.05 if j == 0 else 0.06) * k
        flex = 32 - 12 * w
        b = h.nova()
        b.quadril(desl=(0.0, -0.035 * k, -0.02 * k + 0.04 * k * (1 - w)), flexao=10 - 4 * w, giro=-10,
                  lado=ruido(t, T, 321, (1,), 1.5))
        b.coluna(flexao=flex, giro=-6 + 4 * w)
        b.cabeca(flexao=18 - 4 * w, giro=4)
        # pés: esquerdo à frente, direito atrás
        b.pe_no_chao('_e', x=J['pe_e'][0] - 0.02, z=0.16 * k, giro=-5)
        b.pe_no_chao('_d', x=J['pe_d'][0] - 0.03, z=-0.12 * k, giro=-25, calcanhar=4 * (1 - w))
        mao = np.array([-0.10 * k + lado, 0.0, 0.34 * k - 0.18 * k * w])
        y_cab = 0.025 + lev
        # altura da mão: o cabo desce até o chão à frente
        elev = np.radians(52 + 10 * w)
        mao[1] = y_cab + d_cabeca * np.sin(elev)
        cab = mao + np.array([0.06 * k, 0, d_cabeca * np.cos(elev)])
        cab[1] = y_cab
        eixo = mao - cab
        usados.append(ferramenta_duas_maos(b, ctx, mao, eixo, d_esq, np.array([0.2, 1.0, 0.3]), np.array([0, 1.0, 0]),
                             polo_d=np.array([-0.8, -0.5, -0.3]), polo_e=np.array([0.7, -0.8, -0.2])))
        out.append(b.fim())
    return dict(poses=out, notas=f'rastelando no lugar (duas puxadas em 3,2 s). Rastelo preso na pega_d com o cabo em +Y '
                                 f'(+Y aponta da mão direita para a esquerda); a cabeça do rastelo fica em −Y a '
                                 f'{d_cabeca:.2f} m e encosta no chão; a mão esquerda segura em +Y entre '
                                 f'{min(usados):.2f} e {max(usados):.2f} m (escorrega no cabo)',
                ferramenta=dict(osso='pega_d', cabeca_em_y=-round(d_cabeca, 3), mao_esquerda_em_y=round(max(usados), 3),
                                mao_esquerda_faixa_y=[round(min(usados), 3), round(max(usados), 3)]))


def varrendo(ctx):
    h = ctx.h
    k = h.k
    J = h.J
    n = 96                           # 3,2 s: quatro varridas
    T = n / FPS
    d_cabeca = 0.95 * k              # da mão direita até a vassoura (no chão)
    d_esq = 0.42 * k
    usados = []
    out = []
    for i in range(n):
        t = i / FPS
        f = (t / (T / 4)) % 1.0
        # varrida da direita para a esquerda (0..0.55), volta levantando (0.55..1)
        if f < 0.55:
            w = suave(f / 0.55)
            lev = 0.0
        else:
            w = 1 - suave5((f - 0.55) / 0.45)
            lev = 0.04 * k * np.sin(np.pi * (f - 0.55) / 0.45)
        b = h.nova()
        b.quadril(desl=(0.015 * k * (w - 0.5), -0.03 * k, 0.0), flexao=8, giro=-8 + 10 * w)
        b.coluna(flexao=18, giro=-8 + 14 * w, lado=2 * (w - 0.5))
        b.cabeca(flexao=20, giro=-5 + 10 * w)
        b.pe_no_chao('_e', x=J['pe_e'][0] + 0.03, z=0.08 * k, giro=-2)
        b.pe_no_chao('_d', x=J['pe_d'][0] - 0.04, z=-0.10 * k, giro=-20)
        # vassoura no chão: vai de x=-0.35 a +0.15, à frente
        cab = np.array([(-0.35 + 0.5 * w) * k, 0.02 + lev, 0.55 * k + 0.05 * k * np.sin(np.pi * w)])
        mao = np.array([-0.12 * k + 0.08 * k * (w - 0.5), 0.0, 0.30 * k])
        mao[1] = 0.80 * k
        eixo = mao - cab
        eixo = eixo / np.linalg.norm(eixo)
        mao = cab + eixo * d_cabeca
        usados.append(ferramenta_duas_maos(b, ctx, mao, eixo, d_esq, np.array([0.5, 0.6, 0.5]), np.array([0, 1.0, 0.3]),
                             polo_d=np.array([-0.8, -0.5, -0.4]), polo_e=np.array([0.7, -0.8, -0.2])))
        out.append(b.fim())
    return dict(poses=out, notas=f'varrendo (quatro varridas em 3,2 s, da direita para a esquerda). Vassoura presa na '
                                 f'pega_d com o cabo em +Y; a palha fica em −Y a {d_cabeca:.2f} m (encosta no chão); a mão '
                                 f'esquerda segura em +Y entre {min(usados):.2f} e {max(usados):.2f} m',
                ferramenta=dict(osso='pega_d', cabeca_em_y=-round(d_cabeca, 3), mao_esquerda_em_y=round(max(usados), 3),
                                mao_esquerda_faixa_y=[round(min(usados), 3), round(max(usados), 3)]))


def limpando_piscina(ctx):
    h = ctx.h
    k = h.k
    J = h.J
    n = 120                           # 4 s: duas idas e voltas
    T = n / FPS
    usados = []
    out = []
    for i in range(n):
        t = i / FPS
        f = (t / (T / 2)) % 1.0
        w = 0.5 - 0.5 * np.cos(2 * np.pi * f)          # 0 = recolhido, 1 = esticado
        b = h.nova()
        b.quadril(desl=(0.0, -0.04 * k, -0.02 * k + 0.03 * k * w), flexao=12 + 6 * w, giro=-8)
        b.coluna(flexao=26 + 8 * w, giro=-6 + 3 * w)
        b.cabeca(flexao=24, giro=6)
        b.pe_no_chao('_e', x=J['pe_e'][0], z=0.15 * k, giro=-8)
        b.pe_no_chao('_d', x=J['pe_d'][0] - 0.02, z=-0.14 * k, giro=-30, calcanhar=6 * w)
        # mão direita atrás, perto do quadril; a esquerda na frente, mais baixa: o cabo desce
        # ~20° para a frente e um pouco para a esquerda, e as duas mãos empurram juntas
        mao = np.array([-0.17 * k, 0.96 * k, 0.10 * k]) + np.array([0.04, -0.05, 0.18]) * k * w
        frente = np.array([0.04 * k, 0.84 * k, 0.50 * k]) + np.array([0.06, -0.08, 0.24]) * k * w
        eixo = frente - mao
        usados.append(ferramenta_duas_maos(b, ctx, mao, eixo, float(np.linalg.norm(eixo)), np.array([0.6, 0.8, 0.0]),
                                           np.array([0, -1.0, 0.2]), polo_d=np.array([-0.9, -0.5, -0.2]),
                                           polo_e=np.array([0.7, -0.6, -0.3])))
        out.append(b.fim())
    return dict(poses=out, notas=f'limpando a piscina com a peneira de cabo comprido: vai e volta (duas vezes em 4 s). '
                                 f'Cabo preso na pega_d em +Y (para a frente, um pouco para a esquerda, ~20° abaixo da horizontal); a '
                                 f'mão esquerda segura em +Y entre {min(usados):.2f} e {max(usados):.2f} m (escorrega no '
                                 'cabo); a peneira fica em +Y a ~3 m',
                ferramenta=dict(osso='pega_d', mao_esquerda_em_y=round(max(usados), 3),
                                mao_esquerda_faixa_y=[round(min(usados), 3), round(max(usados), 3)], peneira_em_y=3.0))


def colhendo_alto(ctx):
    """Alcança frutas a ~2,1 m alternando as mãos e põe no cesto na cintura."""
    h = ctx.h
    k = h.k
    J = h.J
    n = 210                            # 7 s: direita, depois esquerda
    T = n / FPS
    # alcance da pega (centro da mão) na ponta dos pés: ombro + braço esticado + mão,
    # mais a subida da clavícula e do calcanhar
    alcance_max = (J['braco_e'][1] + h.braco * 0.99 + np.linalg.norm(h.mao_pega['_e']) + 0.075 * k)
    y_fruta = min(2.10, alcance_max)
    cesto = np.array([0.0, J['coxa_e'][1] + 0.06 * k, 0.26 * k])
    out = []
    for i in range(n):
        t = i / FPS
        lado_ativo = '_d' if t < T / 2 else '_e'
        tl = t % (T / 2)
        D = T / 2
        # fases: sobe (0-1.0), pega (1.0-1.6), desce até o cesto (1.6-2.5), solta (2.5-2.9), volta (2.9-3.5)
        sobe = suave5(tl / 1.0) * (1 - suave5((tl - 1.6) / 0.9))
        no_cesto = suave5((tl - 1.6) / 0.9) * (1 - suave5((tl - 2.9) / 0.6))
        b = h.nova()
        s_at = sinal(lado_ativo)
        b.quadril(desl=(s_at * 0.03 * k * sobe, 0.06 * k * sobe - 0.01 * k * no_cesto, 0.0), flexao=-3 * sobe + 6 * no_cesto,
                  lado=s_at * 4 * sobe, giro=ruido(t, T, 341, (1,), 4))
        b.coluna(flexao=-8 * sobe + 14 * no_cesto, lado=-s_at * 6 * sobe)
        alvo_f = np.array([s_at * 0.12 * k + (0.05 if lado_ativo == '_d' else -0.04), y_fruta, 0.32 * k])
        P0 = b.P()
        b.olhar_para(alvo_f * sobe + cesto * no_cesto + (1 - sobe - no_cesto) * (P0['cabeca'] + np.array([0, -0.2, 1.0])),
                     peso=0.85)
        ponta = 24 * sobe
        for l in ('_e', '_d'):
            b.pe_no_chao(l, x=J['pe' + l][0] - sinal(l) * 0.02, calcanhar=ponta, giro=sinal(l) * 8)
        # braço ativo (o ombro sobe junto para alcançar)
        b.clavicula(lado_ativo, elevacao=24 * sobe)
        for l in ('_e', '_d'):
            s = sinal(l)
            P = b.P()
            if l == lado_ativo:
                repouso = P['coxa' + l] + np.array([s * 0.12 * k, -0.18 * k, 0.12 * k])
                ponto_cesto = cesto + np.array([s * 0.05, 0.06, 0.0])
                if tl < 1.6:
                    alvo = repouso + (alvo_f - repouso) * sobe
                    Q = quadro_mao(l, norm([0, 1.0, 0.25]) if sobe > 0.5 else norm([0, -1.0, 0.3]), np.array([0, 0, 1.0]))
                else:
                    alvo = alvo_f + (ponto_cesto - alvo_f) * suave5((tl - 1.6) / 0.9)
                    if tl > 2.9:
                        alvo = ponto_cesto + (repouso - ponto_cesto) * suave5((tl - 2.9) / 0.6)
                    Q = quadro_mao(l, norm([0, -0.6, 0.8]), np.array([0, 0, -1.0]))
                Q0 = quadro_mao(l, norm([0, -1.0, 0.3]), np.array([-s, 0, 0]))
                Q = PZ.slerp_R(Q0, Q, max(sobe, no_cesto))
                b.braco_ik(l, pega=alvo, quadro=Q, polo=np.array([s * 0.9, -0.6, -0.3]))
            else:
                # a outra mão segura a borda do cesto
                borda = cesto + np.array([s * 0.13 * k, 0.07 * k, 0.0])
                Q = quadro_mao(l, norm([-s * 0.3, -0.6, 0.8]), np.array([-s, -0.2, 0]))
                b.braco_ik(l, pega=borda, quadro=Q, polo=np.array([s * 0.9, -0.5, -0.4]))
        out.append(b.fim())
    # altura que a pega alcança de fato (se o braço não chega no alvo, vale o alcance real)
    alto = max(max(ctx.esq.fk(Rw, pq)['pega_d'][1], ctx.esq.fk(Rw, pq)['pega_e'][1]) for Rw, pq in out)
    y_fruta = min(y_fruta, float(alto))
    return dict(poses=out, notas=f'colhendo no alto: a mão direita e depois a esquerda alcançam a fruta a {y_fruta:.2f} m '
                                 f'(na ponta dos pés) e põem no cesto na cintura, centro em (0, {cesto[1]:.2f}, '
                                 f'{cesto[2]:.2f}) m; a outra mão segura a borda do cesto',
                fruta_m=round(float(y_fruta), 3), cesto_m=[round(float(x), 3) for x in cesto])


def grelhando(ctx):
    """Na bancada de 0,9 m: vira a carne com o pegador na mão direita."""
    h = ctx.h
    k = h.k
    J = h.J
    n = 150                     # 5 s
    T = n / FPS
    y_b = 0.90
    grelha = np.array([-0.05, y_b + 0.05, 0.50])
    d_pegador = 0.26 * k        # do punho às pontas do pegador (em +Y)
    out = []
    for i in range(n):
        t = i / FPS
        # vai até a carne (0.6-1.3), pega e levanta (1.3-1.7), vira (1.7-2.3), assenta (2.3-2.7), volta (2.7-3.4)
        vai = suave5((t - 0.6) / 0.7) * (1 - suave5((t - 2.7) / 0.7))
        lev = suave5((t - 1.3) / 0.4) * (1 - suave5((t - 2.3) / 0.4))
        vira = suave5((t - 1.7) / 0.6)
        b = h.nova()
        b.quadril(desl=(0.0, -0.01 * k, 0.0), flexao=6 + 4 * vai, giro=-4)
        b.coluna(flexao=14 + 6 * vai, giro=-4 - 4 * vai, lado=ruido(t, T, 361, (1,), 1.5))
        b.olhar_para(grelha + np.array([0, 0, 0.0]), peso=0.8)
        for l in ('_e', '_d'):
            b.pe_no_chao(l, x=J['pe' + l][0] - sinal(l) * 0.02, giro=sinal(l) * 8,
                         calcanhar=4 * ruido(t, T, 362 + (l == '_e'), (1,), 1) ** 2)
        P = b.P()
        # mão esquerda apoiada na beira da bancada
        borda = np.array([0.22 * k, y_b + 0.035, 0.36])
        Qe = quadro_mao('_e', norm([-0.2, -0.3, 1.0]), np.array([0, -1.0, 0]))
        b.braco_ik('_e', pega=borda, quadro=Qe, polo=np.array([0.9, -0.4, -0.4]))
        # pegador: pontas descem até a carne; o punho gira para virar
        descanso = np.array([-0.20 * k, y_b + 0.12, 0.30])
        ponta_alvo = grelha + np.array([0.04 * np.sin(np.pi * vira), 0.10 * lev, 0.0])
        eixo = norm(np.array([0.15, -0.55, 1.0]))
        eixo = rot(np.array([0, 0, 1.0]), 0) @ eixo
        mao_na_carne = ponta_alvo - eixo * d_pegador
        mao = descanso + (mao_na_carne - descanso) * vai
        palma = rot(eixo, -170 * vira) @ np.array([0.4, 1.0, 0.1])
        Qd = quadro_cabo(eixo, palma, '_d')
        b.braco_ik('_d', pega=mao, quadro=Qd, polo=np.array([-0.9, -0.5, -0.3]), torcer=0.7)
        out.append(b.fim())
    return dict(poses=out, notas=f'grelhando numa bancada de {y_b:.2f} m (frente em z≈0,30 m, carne em '
                                 f'({grelha[0]:.2f}, {grelha[1]:.2f}, {grelha[2]:.2f})): pegador preso na pega_d, '
                                 f'pontas em +Y a {d_pegador:.2f} m; vira a carne entre 1,7 s e 2,3 s; mão esquerda '
                                 'apoiada na beira da bancada',
                ferramenta=dict(osso='pega_d', pontas_em_y=round(d_pegador, 3)), bancada_m=y_b,
                previa=dict(cenario='bancada'))


TRABALHO = [
    ('cortando_grama', cortando_grama), ('rastelando', rastelando), ('varrendo', varrendo),
    ('colhendo_alto', colhendo_alto), ('carregando_cesto', carregando_cesto), ('limpando_piscina', limpando_piscina),
    ('grelhando', grelhando),
]
