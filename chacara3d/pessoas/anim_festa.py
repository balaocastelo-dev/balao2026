"""Danças, pulos de rave, DJ e parabéns (feitas por código, no tempo da música)."""
import numpy as np

import humano as HU
import pose as PZ
from animacoes import FPS, quadro_mao, quadro_vertical
from humano import ruido, suave, suave5, sinal
from pose import norm

X, Y, Z = np.eye(3)


def onda(fase, atraso=0.0):
    """Seno no ciclo (fase em ciclos)."""
    return np.sin(2 * np.pi * (fase - atraso))


def bate(fase, largura=0.18, atraso=0.0):
    """Pulso logo depois de cada batida (0..1): a descida do joelho no tempo."""
    f = (fase - atraso) % 1.0
    return np.exp(-0.5 * (f / largura) ** 2) + np.exp(-0.5 * ((f - 1) / largura) ** 2)


def passo(t, t0, dur, de, para, altura):
    """Pé indo de `de` para `para` entre t0 e t0+dur, com arco de `altura`."""
    x = np.clip((t - t0) / dur, 0, 1)
    w = suave5(x)
    p = np.asarray(de, float) * (1 - w) + np.asarray(para, float) * w
    lev = altura * np.sin(np.pi * x) if 0 < x < 1 else 0.0
    return p, lev, x


# ---------------------------------------------------------------------------
def dancando_1(ctx):
    """Balanço de um lado para o outro com passos (passo e toque), 120 bpm, 2 compassos."""
    h = ctx.h
    bpm = 120.0
    bat = 60.0 / bpm
    nb = 8
    T = nb * bat
    n = int(round(T * FPS))
    k, a = h.k, h.amp
    J = h.J
    D = 0.075 * k * a          # meio deslocamento do centro
    w = 0.085 * k              # meia distância entre os pés
    # posição x de cada tornozelo no fim de cada tempo (passo dir., fecha esq., passo esq., fecha dir.)
    fim_e = [D + w, -D + w, D + w, D + w] * 2
    fim_d = [-D - w, -D - w, -D - w, D - w] * 2
    peso_fim = [-1, -1, 1, 1] * 2          # -1: peso no pé direito, +1: no esquerdo
    out = []
    for i in range(n):
        t = i / FPS
        fase = t / bat
        bi = int(np.floor(fase)) % nb
        fb = fase - np.floor(fase)
        ant = (bi - 1) % nb
        x = np.clip(fb / 0.6, 0, 1)
        m = suave5(x)
        xe = fim_e[ant] + (fim_e[bi] - fim_e[ant]) * m
        xd = fim_d[ant] + (fim_d[bi] - fim_d[ant]) * m
        mov_e = abs(fim_e[bi] - fim_e[ant]) > 1e-9
        mov_d = abs(fim_d[bi] - fim_d[ant]) > 1e-9
        peso = peso_fim[ant] + (peso_fim[bi] - peso_fim[ant]) * suave(fb / 0.5)
        b = h.nova()
        cx = 0.5 * (xe + xd) + peso * 0.025 * k
        quica = 0.018 * k * a * bate(fase, 0.2, 0.08)
        ondinha = onda(fase / 4, 0.1)        # balanço lento de um compasso
        b.quadril(desl=(cx, -0.008 * k - quica, 0.01), flexao=3, lado=-5 * a * peso, giro=7 * a * ondinha)
        b.coluna(flexao=4 + 2 * bate(fase, 0.2, 0.12), lado=6 * a * peso * 0.8 + 2 * ondinha, giro=-5 * a * ondinha)
        b.cabeca(flexao=-2 + 4 * a * bate(fase, 0.15, 0.14), lado=-3 * a * peso, giro=ruido(t, T, 101, (1, 2), 8))
        for l, xx, mov in (('_e', xe, mov_e), ('_d', xd, mov_d)):
            s = sinal(l)
            lev = (0.045 * k * np.sin(np.pi * x)) if mov else 0.0
            calc = (20 * np.sin(np.pi * x)) if mov else 0.0
            b.pe_no_chao(l, x=xx, altura=lev, calcanhar=calc, giro=s * 8 + 5 * ondinha)
        for l in ('_e', '_d'):
            s = sinal(l)
            bal = -peso
            b.clavicula(l, elevacao=2 + 3 * bate(fase, 0.2, 0.15))
            # cotovelos dobrados, mãos soltas com o polegar para cima (sem "patinha" de palma para baixo)
            b.braco_fk(l, flexao=26 + 12 * a * s * bal + 6 * bate(fase, 0.2, 0.2), abducao=12 + 5 * s * bal,
                       rotacao=15, cotovelo=80 + 12 * bate(fase, 0.2, 0.22), prono=-25 + 10 * s * bal, punho=-8)
        out.append(b.fim())
    return dict(poses=out, notas='passo e toque para os lados com balanço do quadril, 120 bpm, 2 compassos (8 tempos)',
                bpm=bpm)


def dancando_2(ctx):
    """Molejo de axé: joelhos alternando, quadril solto e braços girando, 120 bpm."""
    h = ctx.h
    bpm = 120.0
    bat = 60.0 / bpm
    T = 8 * bat
    n = int(round(T * FPS))
    k, a = h.k, h.amp
    J = h.J
    out = []
    for i in range(n):
        t = i / FPS
        fase = t / bat
        b = h.nova()
        alt = onda(fase / 2)                     # alterna o joelho a cada batida
        quica = 0.018 * k * a * (0.5 + 0.5 * np.cos(2 * np.pi * fase))
        segundo = HU.janela(t, 2.0, 4.0, 0.4) + HU.janela(t, -1, 0.0, 0.4)   # 2º compasso mais solto
        b.quadril(desl=(0.03 * k * a * alt, -0.012 * k - quica, 0.0), flexao=5, lado=-9 * a * alt,
                  giro=10 * a * onda(fase / 2, 0.2))
        b.coluna(flexao=6, lado=8 * a * onda(fase / 2, 0.2), giro=-12 * a * onda(fase / 2, 0.15))
        b.cabeca(flexao=4 * bate(fase, 0.15, 0.1), lado=-5 * a * onda(fase / 2, 0.35), giro=ruido(t, T, 111, (1, 2), 10))
        for l in ('_e', '_d'):
            s = sinal(l)
            # joelho do lado que desce dobra mais e o calcanhar levanta
            dob = 0.5 + 0.5 * s * alt
            b.pe_no_chao(l, x=J['pe' + l][0] + s * 0.04 * k, calcanhar=14 * dob * a, giro=s * 10)
        # braços: as duas mãos balançam juntas de um lado para o outro na frente do corpo
        # (um lado a cada 2 tempos); no 2º compasso sobem até a altura do peito e abrem mais
        P = b.P()
        Rq = PZ.Ry(np.degrees(np.arctan2(b.Rw['quadril'][0, 2], b.Rw['quadril'][2, 2])))   # só o rumo
        bal = onda(fase / 2, 0.1)
        y_m = J['coxa_e'][1] + (0.12 + 0.14 * segundo) * k
        for l in ('_e', '_d'):
            s = sinal(l)
            # a mão do lado para onde o balanço vai fica mais aberta e mais baixa
            lado_mao = (0.20 + 0.06 * segundo) * k + 0.07 * k * s * bal
            alvo = np.array([0.16 * k * bal * a + s * lado_mao, y_m + 0.04 * k * s * bal - 0.03 * k * bate(fase, 0.2, 0.1),
                             0.28 * k + 0.05 * k * abs(bal)])
            alvo = P['quadril'] * np.array([1, 0, 1]) + Rq @ (alvo * np.array([1, 0, 1])) + np.array([0, alvo[1], 0])
            dedos = Rq @ norm(np.array([s * 0.35 + 0.2 * bal, 0.25, 1.0]))
            palma = Rq @ np.array([-s, -0.3, 0.0])
            b.clavicula(l, elevacao=2 + 3 * segundo)
            b.braco_ik(l, pega=alvo, quadro=quadro_mao(l, dedos, palma), polo=Rq @ np.array([s * 0.9, -0.7, -0.4]))
        out.append(b.fim())
    return dict(poses=out, notas='molejo de axé/samba: joelhos alternando, quadril e braços girando, 120 bpm, 2 compassos',
                bpm=bpm)


def dancando_3(ctx):
    """Braços para cima balançando de um lado para o outro, joelhos no tempo, 120 bpm."""
    h = ctx.h
    bpm = 120.0
    bat = 60.0 / bpm
    T = 8 * bat
    n = int(round(T * FPS))
    k, a = h.k, h.amp
    J = h.J
    out = []
    for i in range(n):
        t = i / FPS
        fase = t / bat
        b = h.nova()
        bal = onda(fase / 2, 0.0)              # um balanço a cada 2 tempos
        quica = 0.025 * k * a * bate(fase, 0.22, 0.05)
        b.quadril(desl=(0.04 * k * a * bal, -0.01 * k - quica, 0.0), flexao=2, lado=-5 * a * bal, giro=4 * onda(fase / 4))
        b.coluna(flexao=-4, lado=9 * a * onda(fase / 2, 0.12), giro=-4 * onda(fase / 4, 0.1))
        b.cabeca(flexao=-8 + 5 * bate(fase, 0.15, 0.1), lado=6 * a * onda(fase / 2, 0.25), giro=ruido(t, T, 121, (1,), 6))
        for l in ('_e', '_d'):
            s = sinal(l)
            b.pe_no_chao(l, x=J['pe' + l][0] + s * 0.03 * k, calcanhar=8 * a * bate(fase, 0.25, 0.0), giro=s * 8)
        for l in ('_e', '_d'):
            s = sinal(l)
            sw = onda(fase / 2, 0.22)
            b.clavicula(l, elevacao=14 + 3 * bate(fase, 0.2, 0.1))
            b.braco_fk(l, flexao=150 - 10 * s * sw, abducao=35 + 18 * s * sw * a, rotacao=-10,
                       cotovelo=25 + 10 * bate(fase, 0.2, 0.15), prono=-40 + 30 * sw, punho=-10 + 15 * sw)
        out.append(b.fim())
    return dict(poses=out, notas='braços para cima balançando, joelhos no tempo, 120 bpm, 2 compassos', bpm=bpm)


def pulando(ctx):
    """Pulos de rave no tempo (128 bpm, 2 compassos), braços batendo."""
    h = ctx.h
    bpm = 128.0
    bat = 60.0 / bpm
    T = 8 * bat
    n = int(round(T * FPS))
    k, a = h.k, h.amp
    J = h.J
    y_rep = J['quadril'][1]
    out = []
    apoio = 0.55                 # fração da batida com os pés no chão
    for i in range(n):
        t = i / FPS
        fase = t / bat
        bi = int(np.floor(fase)) % 8
        f = fase - np.floor(fase)
        b = h.nova()
        alt_pulo = 0.11 * k * a
        if f < apoio:
            x = f / apoio
            # aterrissa (0), afunda, empurra e sai do chão (1)
            dy = -0.075 * k * a * np.sin(np.pi * x) ** 1.2
            calc = 30 * suave((x - 0.55) / 0.45)
            no_ar = 0.0
        else:
            x = (f - apoio) / (1 - apoio)
            dy = alt_pulo * 4 * x * (1 - x)
            calc = 30 * (1 - suave(x / 0.5)) + 15 * suave((x - 0.5) / 0.5)
            no_ar = 1.0
        b.quadril(desl=(0.0, dy - 0.015 * k, 0.01), flexao=8 - 4 * no_ar + 6 * (dy < 0) * (-dy / (0.075 * k + 1e-9)),
                  lado=2 * onda(fase / 4), giro=5 * onda(fase / 8))
        b.coluna(flexao=6 + 6 * (dy < 0) * (-dy / (0.075 * k + 1e-9)), giro=-4 * onda(fase / 8, 0.1))
        b.cabeca(flexao=6 * bate(fase, 0.12, 0.05) - 4, giro=ruido(t, T, 131, (1,), 6))
        for l in ('_e', '_d'):
            s = sinal(l)
            if no_ar:
                # pés no ar: seguem o quadril, ponta para baixo
                alt = max(0.0, dy + 0.0) * 0.9
                b.pe_no_chao(l, x=J['pe' + l][0] + s * 0.02 * k, altura=alt, calcanhar=calc, giro=s * 8)
            else:
                b.pe_no_chao(l, x=J['pe' + l][0] + s * 0.02 * k, calcanhar=calc, giro=s * 8)
        # braços: 1º compasso só o direito soca para o alto; 2º os dois
        dois = 1.0 if bi >= 4 else 0.0
        soco = np.sin(np.pi * np.clip((f - 0.35) / 0.6, 0, 1))      # no alto quando está no ar
        for l in ('_e', '_d'):
            s = sinal(l)
            ativo = 1.0 if (l == '_d' or dois) else 0.0
            if ativo:
                b.clavicula(l, elevacao=10 + 8 * soco)
                # soco para o alto: o punho sai da frente do ombro e estica para cima no pulo
                b.braco_fk(l, flexao=70 + 85 * soco, abducao=22 + 8 * soco, rotacao=0, cotovelo=105 - 90 * soco,
                           prono=-40, punho=-5)
            else:
                b.clavicula(l, elevacao=4 * soco)
                b.braco_fk(l, flexao=30 + 15 * soco, abducao=16, rotacao=15, cotovelo=85 + 10 * soco, prono=-20)
        out.append(b.fim())
    return dict(poses=out, notas='pulos no tempo (128 bpm, 2 compassos = 3,75 s): no 1º compasso só o braço direito soca '
                                 'para o alto, no 2º os dois; pés saem ~10 cm do chão', bpm=bpm)


def dj(ctx):
    """DJ: mão esquerda no equipamento (mesa a 0,95 m), direita segurando o fone na orelha, 125 bpm."""
    h = ctx.h
    bpm = 125.0
    bat = 60.0 / bpm
    T = 8 * bat
    n = int(round(T * FPS))
    k, a = h.k, h.amp
    J = h.J
    y_mesa = 0.95 * (k if ctx.tipo == 'crianca' else 1.0)
    out = []
    for i in range(n):
        t = i / FPS
        fase = t / bat
        b = h.nova()
        quica = 0.025 * k * bate(fase, 0.2, 0.05)
        b.quadril(desl=(0.0, -0.01 * k - quica, 0.0), flexao=4, lado=2 * onda(fase / 2), giro=-6)
        b.coluna(flexao=6 + 3 * bate(fase, 0.2, 0.1), lado=-3, giro=4)
        # cabeça no tempo (olhando o equipamento), inclinada para o lado do fone
        b.cabeca(flexao=16 + 8 * bate(fase, 0.14, 0.08), lado=-10, giro=-6 + ruido(t, T, 141, (1,), 5))
        for l in ('_e', '_d'):
            s = sinal(l)
            b.pe_no_chao(l, x=J['pe' + l][0] + s * 0.05 * k, giro=s * 10, calcanhar=6 * bate(fase + (0.5 if l == '_e' else 0), 0.25))
        P = b.P()
        # mão esquerda no mixer: mexe o crossfader e, no 2º compasso, gira um botão
        ajuste = HU.janela(t, 2.1, 3.5, 0.3)
        mx = 0.06 * k * np.sin(2 * np.pi * t / T) + 0.05 * k * ajuste
        alvo_e = np.array([0.10 * k + mx, y_mesa + 0.05 * k + 0.03 * k * ajuste, 0.42 * k + 0.03 * k * ajuste])
        Qe = quadro_mao('_e', norm([-0.3, -0.6, 1.0]), np.array([0, -1.0, 0.1]))
        b.braco_ik('_e', pega=alvo_e, quadro=Qe, polo=np.array([0.8, -0.3, -0.6]))
        # mão direita segurando a concha do fone na orelha direita
        orelha = P['cabeca'] + b.Rw['cabeca'] @ np.array([-0.085 * k, 0.07 * k, -0.005])
        Qd = quadro_mao('_d', b.Rw['cabeca'] @ norm([0.2, 1.0, 0.3]), b.Rw['cabeca'] @ np.array([1.0, 0, 0]))
        alvo_d = orelha + b.Rw['cabeca'] @ np.array([-0.035 * k, -0.01, 0.0])
        b.braco_ik('_d', pega=alvo_d, quadro=Qd, polo=np.array([-1.0, -0.5, 0.2]))
        b.clavicula('_d', elevacao=6)
        b.braco_ik('_d', pega=alvo_d, quadro=Qd, polo=np.array([-1.0, -0.5, 0.2]))
        out.append(b.fim())
    return dict(poses=out, notas=f'DJ (125 bpm, 2 compassos): mesa com o tampo a {y_mesa:.2f} m e a frente em z≈0,30·k; '
                                 'mão esquerda no mixer (~0,42 m à frente), mão direita segurando o fone na orelha direita',
                bpm=bpm, mesa_m=y_mesa, previa=dict(cenario='mesa_dj'))


def cantando_parabens(ctx):
    """Palmas no ritmo do Parabéns (120 bpm) com leve balanço."""
    h = ctx.h
    bpm = 120.0
    bat = 60.0 / bpm
    T = 8 * bat
    n = int(round(T * FPS))
    k, a = h.k, h.amp
    J = h.J
    out = []
    for i in range(n):
        t = i / FPS
        fase = t / bat
        f = fase % 1.0
        b = h.nova()
        bal = onda(fase / 2, 0.0)
        b.quadril(desl=(0.025 * k * bal, -0.012 * k - 0.012 * k * bate(fase, 0.2), 0.0), lado=-4 * bal, giro=3 * onda(fase / 4))
        b.coluna(flexao=2, lado=5 * onda(fase / 2, 0.15), giro=-3 * onda(fase / 4, 0.1))
        b.cabeca(flexao=-4 + 3 * bate(fase, 0.15, 0.08), lado=-5 * onda(fase / 2, 0.3), giro=ruido(t, T, 151, (1, 2), 7))
        for l in ('_e', '_d'):
            s = sinal(l)
            b.pe_no_chao(l, x=J['pe' + l][0] + s * 0.01 * k, calcanhar=10 * max(0.0, -s * bal) ** 2, giro=s * 7)
        ab = 1 - np.exp(-((f - 0.0) / 0.13) ** 2) - np.exp(-((f - 1.0) / 0.13) ** 2)
        ab = np.clip(ab, 0, 1)
        P = b.P()
        Rp = b.Rw['peito']
        centro = P['peito'] + Rp @ np.array([0.0, 0.06 * k, 0.30 * k])
        meia = 0.035 + 0.10 * k * ab
        for l in ('_e', '_d'):
            s = sinal(l)
            alvo = centro + Rp @ np.array([s * meia, 0.0, 0.0])
            Q = Rp @ quadro_vertical(norm([0, 0.6, 0.8]), norm([0, 0.8, -0.6]))
            b.braco_ik(l, pega=alvo, quadro=Q, polo=Rp @ np.array([s * 0.8, -0.6, -0.4]))
        out.append(b.fim())
    return dict(poses=out, notas='palmas em todo tempo (120 bpm, 2 compassos) e balanço de um lado para o outro', bpm=bpm)


FESTA = [
    ('dancando_1', dancando_1), ('dancando_2', dancando_2), ('dancando_3', dancando_3), ('pulando', pulando),
    ('dj', dj), ('cantando_parabens', cantando_parabens),
]
