"""Na piscina: em pé com água pelo peito e boiando na vertical (feitas por código)."""
import numpy as np

import pose as PZ
from animacoes import FPS, quadro_mao
from humano import ruido, sinal
from pose import norm

X, Y, Z = np.eye(3)


def na_agua(ctx):
    """Em pé dentro da água (linha d'água no peito), braços mexendo na superfície."""
    h = ctx.h
    n = 240
    T = n / FPS
    k = h.k
    J = h.J
    # linha d'água: um pouco abaixo das axilas
    y_agua = J['braco_e'][1] - 0.12 * k
    out = []
    for i in range(n):
        t = i / FPS
        b = h.nova()
        # corpo balança devagar, como empurrado pela água
        bx = ruido(t, T, 201, (1, 2), 0.02 * k)
        bz = ruido(t, T, 202, (1, 2), 0.02 * k)
        b.quadril(desl=(bx, -0.01 * k, bz), flexao=2 + ruido(t, T, 203, (1,), 2), lado=ruido(t, T, 204, (1, 2), 2.5),
                  giro=ruido(t, T, 205, (1, 2), 10))
        b.coluna(flexao=4 + ruido(t, T, 206, (1, 2), 2), lado=ruido(t, T, 207, (1, 2), 3), giro=ruido(t, T, 208, (1,), 6))
        b.cabeca(flexao=4 + ruido(t, T, 209, (1, 2), 4), giro=ruido(t, T, 210, (1, 2), 18))
        for l in ('_e', '_d'):
            s = sinal(l)
            # pés no fundo, um pouco mais abertos; tornozelos mexem devagar
            b.pe_no_chao(l, x=J['pe' + l][0] + s * 0.03 * k + ruido(t, T, 211 + (l == '_e'), (1,), 0.015),
                         z=J['pe' + l][2] + ruido(t, T, 213 + (l == '_e'), (1,), 0.03), giro=s * 10)
        P = b.P()
        Rq = b.Rw['quadril']
        for l in ('_e', '_d'):
            s = sinal(l)
            # mão varre a superfície da água: arco para a frente e para o lado
            ph = 2 * np.pi * (2 * t / T) + (0 if l == '_d' else np.pi * 0.85)
            lado = 0.26 * k + 0.09 * k * np.cos(ph)
            frente = 0.26 * k + 0.12 * k * np.sin(ph)
            alvo = P['peito'] * np.array([1, 0, 1]) + Rq @ np.array([s * lado, 0, frente])
            alvo[1] = y_agua - 0.06 * k + 0.02 * k * np.sin(ph + 1.0)
            dedos = Rq @ norm(np.array([s * 0.35, -0.15, 1.0]))
            palma = np.array([np.cos(ph) * 0.5 * -s, -1.0, 0.0])
            Q = quadro_mao(l, dedos, palma)
            # cotovelos para baixo e para fora (boiando), não para cima
            b.braco_ik(l, pega=alvo, quadro=Q, polo=Rq @ np.array([s * 0.6, -1.0, -0.2]))
        out.append(b.fim())
    return dict(poses=out, notas=f'em pé dentro da água: linha d\'água em y={y_agua:.2f} m acima da sola dos pés '
                                 '(pés no fundo); mãos mexendo logo abaixo da superfície',
                linha_dagua_m=round(float(y_agua), 3), previa=dict(cenario='agua', cenario_k=round(float(y_agua), 3)))


def nadando_parado(ctx):
    """Boiando na vertical (pedalando), cabeça para fora da água."""
    h = ctx.h
    n = 120
    T = n / FPS
    k = h.k
    J = h.J
    # linha d'água logo abaixo do queixo; o corpo fica com os pés a ~0,15 m acima da posição de pé
    y_agua = ctx.marcos['queixo'][1] - 0.03 * k
    out = []
    ciclo = 2                # duas pedaladas por laço (2 s cada)
    for i in range(n):
        t = i / FPS
        f = t / T * ciclo
        b = h.nova()
        sob = 0.02 * k * np.sin(2 * np.pi * 2 * f)            # sobe e desce a cada braçada
        b.quadril(desl=(ruido(t, T, 221, (1,), 0.02), sob, -0.04 * k), flexao=10, lado=ruido(t, T, 222, (1,), 3),
                  giro=ruido(t, T, 223, (1,), 8))
        b.coluna(flexao=-6, lado=ruido(t, T, 224, (1,), 2))
        b.cabeca(flexao=-12 + ruido(t, T, 225, (1,), 3), giro=ruido(t, T, 226, (1,), 15))
        P = b.P()
        Rq = b.Rw['quadril']
        for l in ('_e', '_d'):
            s = sinal(l)
            # pedalada (bicicleta): pé faz um círculo na frente/abaixo do quadril
            ph = 2 * np.pi * f + (0 if l == '_e' else np.pi)
            H = P['coxa' + l]
            tor = H + Rq @ np.array([s * 0.06 * k, -0.62 * k + 0.12 * k * np.cos(ph), 0.10 * k + 0.14 * k * np.sin(ph)])
            Rpe = Rq @ PZ.Ry(s * 12) @ PZ.Rx(35 + 15 * np.sin(ph))
            b.perna_ik(l, tor, Rpe, polo=Rq @ np.array([s * 0.2, 0.2, 1.0]))
        for l in ('_e', '_d'):
            s = sinal(l)
            # braços abertos fazendo o "oito" na horizontal, mãos abaixo da superfície
            ph = 2 * np.pi * 2 * f + (0 if l == '_e' else 0.3)
            lado = 0.42 * k + 0.08 * k * np.cos(ph)
            frente = 0.18 * k + 0.12 * k * np.sin(ph)
            alvo = P['peito'] * np.array([1, 0, 1]) + Rq @ np.array([s * lado, 0, frente])
            alvo[1] = y_agua - 0.12 * k + 0.02 * k * np.sin(2 * ph)
            dedos = Rq @ norm(np.array([s * 0.6, 0, 1.0]))
            palma = np.array([-s * 0.8 * np.cos(ph), -0.6, 0.0])
            Q = quadro_mao(l, dedos, palma)
            b.braco_ik(l, pega=alvo, quadro=Q, polo=Rq @ np.array([s * 0.6, -0.8, -0.4]))
        out.append(b.fim())
    return dict(poses=out, notas=f'boiando na vertical, pedalando: linha d\'água em y={y_agua:.2f} m (logo abaixo do '
                                 'queixo) no referencial da pessoa; os pés não tocam o fundo',
                linha_dagua_m=round(float(y_agua), 3), previa=dict(cenario='agua', cenario_k=round(float(y_agua), 3)))


AGUA = [('na_agua', na_agua), ('nadando_parado', nadando_parado)]
