"""Todas as animações das pessoas (os nomes são os que o motor usa).

Cada função recebe o contexto da pessoa (esqueleto, medidas, tipo) e devolve um
dicionário com as poses (uma por quadro, 30 qps, laço sem o quadro repetido no fim),
`repete`, `velocidade_m_s` (quando anda) e `notas` para o pessoas.json.
"""
import numpy as np

import captura as CP
import humano as HU
import pose as PZ
from humano import ruido, suave, sinal
from pose import norm, rot

FPS = 30


class Ctx:
    def __init__(self, tipo, esq, pe, marcos, V=None, W=None):
        self.V, self.W = V, W
        self.tipo = tipo
        self.esq = esq
        self.pe = pe
        self.marcos = marcos
        self.h = HU.Humano(esq, pe, tipo)
        self.h.marcos = marcos
        self._cache = {}

    def captura(self, nome, a, b, mistura=10, modo='parado', inverter=False, suavizar=1):
        k = (nome, a, b, mistura, modo, inverter, suavizar)
        if k not in self._cache:
            self._cache[k] = CP.de_captura(self, nome, a, b, mistura=mistura, modo=modo, inverter=inverter,
                                           suavizar=suavizar)
        p, v = self._cache[k]
        return [(dict(Rw), pq.copy()) for Rw, pq in p], v


# ---------------------------------------------------------------------------
# utilidades
# ---------------------------------------------------------------------------
def reamostrar_tempo(poses, fator):
    """Muda a velocidade (fator > 1 acelera), mantendo o laço: n novo = round(n / fator)."""
    n = len(poses)
    m = max(2, int(round(n / fator)))
    out = []
    for i in range(m):
        t = i * n / m
        a = int(np.floor(t)) % n
        b = (a + 1) % n
        w = t - np.floor(t)
        out.append(HU.misturar_poses(poses[a], poses[b], w))
    return out


def repetir_ate(poses, n):
    return [poses[i % len(poses)] for i in range(n)]


def boca(ctx, P, Rw):
    """Boca no mundo para a pose."""
    J = ctx.esq.J
    return P['cabeca'] + Rw['cabeca'] @ (ctx.marcos['boca'] - J['cabeca'])


def quadro_vertical(frente, cima=(0, 1, 0)):
    """Quadro da pega com Y para `cima` e Z (dedos) para `frente`."""
    y = norm(cima)
    z = np.asarray(frente, float) - y * np.dot(frente, y)
    z = norm(z)
    x = np.cross(y, z)
    return np.stack([x, y, z], axis=1)


def quadro_mao(l, dedos, palma):
    """Quadro da pega a partir da direção dos dedos (Z) e da normal da palma."""
    z = norm(dedos)
    n = np.asarray(palma, float) - z * np.dot(palma, z)
    n = norm(n)
    x = n if l == '_d' else -n
    y = np.cross(z, x)
    return np.stack([x, y, z], axis=1)


def meia_largura(ctx, y):
    p = ctx.marcos['perfil']
    return float(np.interp(y, p[:, 0], p[:, 1]))


def frente_corpo(ctx, y):
    p = ctx.marcos['perfil']
    return float(np.interp(y, p[:, 0], p[:, 2]))


def base_parado(ctx, n=None, variante=0):
    """Pé parado (captura 18_08, trecho calmo), opcionalmente repetido até n quadros."""
    p, _ = ctx.captura('18_08', 70, 246, mistura=14, inverter=(variante != 0))
    # o ator olha um pouco para cima (para o colega mais alto): cabeça mais reta
    p = [HU.de_pose(ctx.h, Rw, pq).somar_cabeca(flexao=6).fim() for Rw, pq in p]
    if n is not None:
        p = repetir_ate(p, n)
    return p


# ---------------------------------------------------------------------------
# básicas
# ---------------------------------------------------------------------------
def parado(ctx):
    p = base_parado(ctx)
    return dict(poses=p, notas='em pé, respiração e troca de apoio (captura CMU 18_08)')


def parado_2(ctx):
    """Mãos na cintura, sobre o parado espelhado."""
    base = base_parado(ctx, variante=1)
    h = ctx.h
    n = len(base)
    T = n / FPS
    out = []
    for i, (Rw, pq) in enumerate(base):
        t = i / FPS
        b = HU.de_pose(h, Rw, pq)
        P = b.P()
        Rq = Rw['quadril']
        y_cint = h.J['coxa_e'][1] + 0.13 * h.k
        mw = meia_largura(ctx, y_cint)
        for l in ('_e', '_d'):
            s = sinal(l)
            # punho na lateral da cintura, dedos para a frente e para baixo
            alvo_punho = pq + Rq @ (np.array([s * (mw + 0.025 * h.k), y_cint - pq[1] + 0.02 * h.k, -0.025 * h.k]))
            Q = Rq @ quadro_vertical(norm([0.0, -0.6, 0.8]), norm([0.0, 0.8, 0.6]))
            b.clavicula(l, elevacao=3 + ruido(t, T, 3 + (l == '_e'), amp=1.5), protracao=-4)
            polo = Rq @ np.array([s * 1.0, 0.0, -0.6])
            Rm = Q @ ctx.esq.P_pega['pega' + l].T
            pega = alvo_punho + Rm @ (h.J['pega' + l] - h.J['mao' + l])
            b.braco_ik(l, pega=pega, quadro=Q, polo=polo)
        out.append(b.fim())
    return dict(poses=out, notas='mãos na cintura, apoio trocando (base: captura CMU 18_08 espelhada)')


BRACOS = ('clavicula_e', 'braco_e', 'antebraco_e', 'mao_e', 'pega_e',
          'clavicula_d', 'braco_d', 'antebraco_d', 'mao_d', 'pega_d')


def atenuar_bracos(poses, base, w):
    """Puxa os braços de `poses` para os da `base` (w = quanto da base): gestos menores
    no mesmo tempo. O quadril e o resto do corpo ficam como em `poses`."""
    out = []
    for i, p in enumerate(poses):
        Rw, _ = HU.misturar_poses(p, base[i % len(base)], w, BRACOS)
        out.append((Rw, p[1].copy()))
    return out


# gestos de conversa: (tempo em fração do laço, peso do gesto, alvo da mão no quadro do peito [x, y, z] (m, homem))
GESTOS_D = [(0.00, 0.0, [-0.20, -0.30, 0.18]), (0.10, 1.0, [-0.20, -0.22, 0.28]), (0.23, 1.0, [-0.13, -0.16, 0.32]),
            (0.33, 1.0, [-0.24, -0.21, 0.27]), (0.43, 1.0, [-0.18, -0.18, 0.30]), (0.53, 0.25, [-0.20, -0.28, 0.20]),
            (0.66, 1.0, [-0.15, -0.15, 0.31]), (0.78, 1.0, [-0.25, -0.22, 0.26]), (0.88, 1.0, [-0.16, -0.19, 0.30])]
GESTOS_E = [(0.00, 0.0, [0.20, -0.30, 0.18]), (0.20, 0.0, [0.20, -0.30, 0.18]), (0.30, 1.0, [0.19, -0.20, 0.28]),
            (0.40, 1.0, [0.14, -0.17, 0.31]), (0.50, 1.0, [0.22, -0.21, 0.27]), (0.58, 0.0, [0.20, -0.30, 0.18]),
            (0.80, 0.0, [0.20, -0.30, 0.18])]


def conversando(ctx):
    """Explicando: corpo do parado (captura CMU 18_08, outro trecho do laço) e gestos
    feitos por código, mãos na frente entre a cintura e o peito, palmas para cima e
    batidas pequenas no ritmo da fala; a mão direita gesticula mais."""
    base = base_parado(ctx)
    n = len(base)
    base = base[n // 2:] + base[:n // 2]          # outro momento do laço (não fica igual ao parado)
    h = ctx.h
    k, a = h.k, h.amp
    T = n / FPS
    out = []
    for i, (Rw, pq) in enumerate(base):
        t = i / FPS
        f = t / T
        b = HU.de_pose(h, Rw, pq)
        # cabeça: acompanha a fala com pequenos acenos e olha para quem ouve
        b.somar_cabeca(flexao=2 + 2.5 * np.sin(2 * np.pi * 3 * f) * np.sin(np.pi * f) ** 2 + ruido(t, T, 23, (1, 2), 1.5),
                       giro=ruido(t, T, 24, (1, 2), 6), lado=ruido(t, T, 25, (1,), 3))
        pose_base = b.fim()
        Rp = b.Rw['peito']
        P = b.P()
        ik = HU.de_pose(h, *pose_base)
        pesos = {}
        for l, chaves in (('_d', GESTOS_D), ('_e', GESTOS_E)):
            s = sinal(l)
            ch_w = [(c[0] * T, [c[1]]) for c in chaves]
            ch_p = [(c[0] * T, c[2]) for c in chaves]
            w = float(HU.interp_chaves(ch_w, t, T)[0])
            alvo_l = HU.interp_chaves(ch_p, t, T) * np.array([k, k, k])
            alvo_l = alvo_l * np.array([a + (1 - a) * 0.6, 1, 1])
            # batidas no ritmo da fala (sílabas fortes), só quando o gesto está ativo
            alvo_l[1] += 0.022 * k * a * w * np.sin(2 * np.pi * 7 * f + (0 if l == '_d' else 1.3)) ** 3
            alvo = P['peito'] + Rp @ alvo_l
            dedos = Rp @ norm(np.array([-s * 0.35, 0.15, 1.0]))
            palma = Rp @ np.array([-s * 0.55, 0.85, 0.1])
            ik.braco_ik(l, pega=alvo, quadro=quadro_mao(l, dedos, palma), polo=Rp @ np.array([s * 0.6, -1.0, -0.3]))
            pesos[l] = w
        Rw2 = dict(pose_base[0])
        for l, w in pesos.items():
            ossos = [o + l for o in ('braco', 'antebraco', 'mao', 'pega')]
            Rm, _ = HU.misturar_poses(pose_base, ik.fim(), w, ossos)
            for o in ossos:
                Rw2[o] = Rm[o]
        out.append((Rw2, pose_base[1].copy()))
    return dict(poses=out, notas='conversando: gestos de explicação na frente do corpo (mão direita mais ativa), palmas '
                                 'para cima, cabeça acompanhando; corpo da captura CMU 18_08')


def ouvindo(ctx):
    """Parado espelhado, mãos juntas na frente e cabeça concordando de vez em quando."""
    base = base_parado(ctx, variante=1)
    h = ctx.h
    n = len(base)
    T = n / FPS
    out = []
    acenos = [1.2, 3.6]          # começo de cada "sim" com a cabeça (s)
    for i, (Rw, pq) in enumerate(base):
        t = i / FPS
        b = HU.de_pose(h, Rw, pq)
        # cabeça: leve inclinação e acenos
        ac = 0.0
        for a in acenos:
            x = (t - a) / 1.1
            if 0 <= x <= 1:
                ac += np.sin(x * 2 * np.pi * 2) * np.sin(np.pi * x) * 7
        b.somar_cabeca(flexao=ac + 4, lado=4 + ruido(t, T, 7, amp=2))
        # mãos juntas na frente do corpo (uma segura o punho da outra)
        Rq = Rw['quadril']
        y_m = h.J['coxa_e'][1] + 0.09 * h.k          # mãos na altura da barriga (abaixo do umbigo)
        frente = frente_corpo(ctx, y_m) + 0.035 * h.k
        centro = pq + Rq @ np.array([0.0, y_m - pq[1], frente - pq[2] + 0.01])
        centro = centro + Rq @ np.array([ruido(t, T, 11, amp=0.006), ruido(t, T, 12, amp=0.006), 0])
        for l in ('_e', '_d'):
            s = sinal(l)
            alvo = centro + Rq @ np.array([s * 0.035 * h.k, 0.0 if l == '_d' else -0.025 * h.k, 0])
            fr = Rq @ norm(np.array([-s * 0.8, -0.55, 0.25]))
            cima = Rq @ np.array([0, 0.3, 1.0])
            Q = quadro_vertical(fr, cima)
            b.braco_ik(l, pega=alvo, quadro=Q, polo=Rq @ np.array([s * 0.5, -0.2, -1.0]))
        out.append(b.fim())
    return dict(poses=out, notas='escutando: mãos juntas na frente, cabeça inclinada que concorda de vez em quando')


def andando(ctx):
    p, v = ctx.captura('35_01', 13, 81, mistura=10, modo='velocidade')
    return dict(poses=p, velocidade=v, notas='duas passadas (captura CMU 35_01)')


def andando_devagar(ctx):
    p, v = ctx.captura('07_04', 27, 70, mistura=10, modo='velocidade')
    return dict(poses=p, velocidade=v, notas='passada lenta (captura CMU 07_04)')


def correndo(ctx):
    p, v = ctx.captura('35_17', 14, 37, mistura=8, modo='velocidade')
    if ctx.tipo == 'crianca' and v < 2.8:
        # criança: passada mais curta e cadência maior
        f = 2.9 / v
        p = reamostrar_tempo(p, f)
        v = v * f
    return dict(poses=p, velocidade=v, notas='corrida (captura CMU 35_17)')


def acenando(ctx):
    """Base parada e o braço direito do aceno da captura 111_37."""
    onda, _ = ctx.captura('111_37', 19, 56, mistura=8)
    n = len(onda) * 2
    base = base_parado(ctx, n)
    out = []
    ossos = ('clavicula_d', 'braco_d', 'antebraco_d', 'mao_d', 'pega_d')
    for i in range(n):
        Rw, pq = HU.sobrepor_locais(base[i], onda[i % len(onda)], ossos)
        b = HU.de_pose(ctx.h, Rw, pq)
        t = i / FPS
        # olha para quem cumprimenta (à frente, um pouco à direita) e sorri com a cabeça
        b.somar_cabeca(flexao=-3 + ruido(t, n / FPS, 5, amp=2), giro=-8, lado=-3)
        out.append(b.fim())
    return dict(poses=out, notas='acenando com a mão direita (braço da captura CMU 111_37 sobre o parado)')


def rindo(ctx):
    p, _ = ctx.captura('80_44', 58, 202, mistura=14)
    return dict(poses=p, notas='rindo, mão na barriga (captura CMU 80_44)')


def batendo_palmas(ctx):
    h = ctx.h
    n = 120                        # 4 s; palmas a 2,25 por segundo = 9 palmas
    base = base_parado(ctx, n)
    T = n / FPS
    palmas = 9
    out = []
    for i, (Rw, pq) in enumerate(base):
        t = i / FPS
        b = HU.de_pose(h, Rw, pq)
        fase = t * palmas / T
        f = fase % 1.0
        # abertura: fecha rápido (bate), abre devagar
        ab = 1 - np.exp(-((f - 0.0) / 0.12) ** 2) - np.exp(-((f - 1.0) / 0.12) ** 2)
        ab = np.clip(ab, 0, 1)
        Rp = Rw['peito']
        P = b.P()
        centro = P['peito'] + Rp @ np.array([0.0, 0.03 * h.k + 0.01 * np.sin(2 * np.pi * fase), 0.33 * h.k])
        meia = 0.035 + 0.11 * h.k * ab
        for l in ('_e', '_d'):
            s = sinal(l)
            alvo = centro + Rp @ np.array([s * meia, 0.0, 0.0])
            Q = Rp @ quadro_vertical(norm([0, 0.55, 0.85]), norm([0, 0.85, -0.5]))
            b.braco_ik(l, pega=alvo, quadro=Q, polo=Rp @ np.array([s * 0.8, -0.6, -0.4]))
        b.somar_cabeca(flexao=-2 + 1.5 * np.sin(2 * np.pi * fase), giro=ruido(t, T, 4, amp=6))
        out.append(b.fim())
    return dict(poses=out, notas='palmas na frente do peito, ~2,25 por segundo')


def bebendo(ctx):
    """Copo na mão direita (pega_d, eixo do copo = +Y da pega); leva à boca a cada ciclo."""
    h = ctx.h
    n = 165                         # 5,5 s
    base = base_parado(ctx, n)
    T = n / FPS
    out = []
    for i, (Rw, pq) in enumerate(base):
        t = i / FPS
        b = HU.de_pose(h, Rw, pq)
        Rq = Rw['quadril']
        Rp = Rw['peito']
        P = b.P()
        # segurando: copo na altura da cintura, à frente e à direita
        segura = pq + Rq @ np.array([-0.17 * h.k, 0.12 * h.k, 0.24 * h.k])
        # na boca: borda do copo nos lábios
        bc = boca(ctx, P, Rw)
        w = suave((t - 1.3) / 0.9) * suave((4.2 - t) / 0.9)
        incl = 45 * suave((t - 2.0) / 0.5) * suave((3.6 - t) / 0.5)    # inclina o copo para beber
        cabeca_tras = 10 * suave((t - 2.0) / 0.5) * suave((3.6 - t) / 0.5)
        b.somar_cabeca(flexao=-cabeca_tras + ruido(t, T, 9, amp=2), giro=ruido(t, T, 8, amp=4) * (1 - w))
        P = b.P()
        bc = boca(ctx, P, b.Rw)
        frente_cab = b.Rw['cabeca'] @ np.array([0, 0, 1.0])
        Qs = Rq @ quadro_vertical(norm([-0.2, 0.0, 1.0]))
        Qb = rot(Rq @ np.array([1.0, 0, 0]), -incl) @ (Rq @ quadro_vertical(norm([0.35, 0.0, 1.0])))
        Q = PZ.slerp_R(Qs, Qb, w)
        # a borda (5 cm acima da pega, no eixo Y do copo) encosta na boca
        na_boca = bc + frente_cab * 0.04 - Qb[:, 1] * 0.055
        alvo = (1 - w) * segura + w * na_boca
        b.braco_ik('_d', pega=alvo, quadro=Q, polo=Rq @ np.array([-0.6, -0.5, -0.6]))
        out.append(b.fim())
    return dict(poses=out, notas='copo na mão direita: segura na altura da cintura e leva à boca entre 1,3 s e 4,2 s '
                                 '(inclina 45° para beber)')


BASICAS = [
    ('parado', parado), ('parado_2', parado_2), ('conversando', conversando), ('ouvindo', ouvindo),
    ('andando', andando), ('andando_devagar', andando_devagar), ('correndo', correndo), ('acenando', acenando),
    ('batendo_palmas', batendo_palmas), ('rindo', rindo), ('bebendo', bebendo),
]


def todas():
    """Lista (nome, função) na ordem do pessoas.json."""
    import importlib
    lista = list(BASICAS)
    for mod, attr in (('anim_sentado', 'SENTADO'), ('anim_festa', 'FESTA'), ('anim_agua', 'AGUA'),
                      ('anim_trabalho', 'TRABALHO')):
        lista += getattr(importlib.import_module(mod), attr)
    return lista
