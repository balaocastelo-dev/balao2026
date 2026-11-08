"""Medidas da obra do quintal de baixo: deck, laguinho, cascata, poço, escada e amendoeira.

Fonte única para o build.py (maquete e passeio) e para o desenhos_obra.py (folhas com medidas para o pedreiro).
Só numpy: roda no Python do Blender e no Python comum.

Eixos do modelo: x ao longo do terreno (a beira da laje do nível da piscina fica em x = EDGE e o quintal de baixo
vai até x = 60), y de um muro lateral ao outro (y = 0 é o muro do lado da amendoeira, y = 10 o do outro lado).
Medidas em metros; níveis com o piso da piscina = 0,00.
"""
import math
import numpy as np

EDGE = 46.0                       # beira da laje (nível da piscina)
LOW = -1.0                        # chão do quintal de baixo
LARGURA = 10.0                    # de muro a muro

# ------------------------------------------------------------------ muro de arrimo novo (revisão de 08/11/2026)
# O muro fica NA FRENTE da beira da laje: a face de trás do bloco no prumo da beira (não se escava embaixo da laje),
# bloco de 19 cm e revestimento de pedra de uns 14 cm; a face da pedra fica a 0,33 m da beira.
BLOCO, REVEST = 0.19, 0.14
FACE = EDGE + BLOCO + REVEST      # face da pedra do muro novo
SAPATA = {'u0': -0.15, 'u1': 0.60, 'topo': 0.80, 'fundo': 1.00}   # da beira da laje (m) e abaixo do chão de baixo (m)
CAPA = 0.36                       # capa de pedra lisa no topo: da beira da laje até 3 cm além da face da pedra
GUARDA_U = BLOCO / 2 + 0.005      # postes do guarda-corpo no meio do bloco, presos com barra roscada grauteada

# ------------------------------------------------------------------ o que já existe no quintal de baixo
# medido pelo Thiago em 19/10/2026 com tijolinhos de 18 cm enfileirados no chão:
#   beira da laje até a ponta da escada 1,60; da ponta da escada até o poço 6 tijolinhos (1,08);
#   do poço até o muro do lado da amendoeira 23 tijolinhos (4,14); do tronco da amendoeira até o poço 13 (2,34);
#   largura da escada 1,40. Diâmetro do poço, lado da escada e posição do tronco: estimados pelas fotos (conferir).
POCO_R = 0.63                     # raio por fora da boca do poço (diâmetro estimado 1,25)
POCO = (EDGE + 1.60 + 1.08 + POCO_R, 4.14 + POCO_R)                 # centro do poço
ARVORE = (EDGE + 0.80, 1.60)      # centro do tronco da amendoeira (estimado)
ESCADA_Y0, ESCADA_Y1 = POCO[1] - 0.70, POCO[1] + 0.70              # escada de 1,40 de largura, de frente para o poço (estimado)
ESCADA_X0 = EDGE + 0.08          # pé do primeiro degrau (a escada já existe)
ESCADA_N, ESCADA_PISO = 5, round((1.60 - (ESCADA_X0 - EDGE)) / 5, 3)    # cinco degraus até 1,60 da beira da laje

# ------------------------------------------------------------------ guarda-corpo na beira da laje
# (19/10/2026: o Thiago tirou o deck; fica só o guarda-corpo protegendo a laje de cima do lago)
GUARDA_H = 1.10                                  # altura do guarda-corpo (vão entre balaústres até 9 cm)

# ------------------------------------------------------------------ laguinho (opção A, sem deck)
# no pé do muro de arrimo, entre a amendoeira e a escada, abrindo para o quintal do lado da amendoeira; com 1,50 de
# folga da boca do poço e a pelo menos 1,20 do centro do tronco
ZAGUA = LOW - 0.06                # nível d'água (6 cm abaixo do chão do quintal de baixo)
PROF = 0.90                       # lâmina d'água no meio
# revisão de 08/11/2026: a água fica a 0,30 m da face da pedra do muro (lugar das pedras da borda e da manta) e a
# 0,45 m da escada; para perder pouca área, o lago cresce para o lado do poço (sempre a 1,50 m da boca)
_LAGO_UV = [(0.67, 2.95), (0.64, 3.25), (0.71, 3.52), (0.95, 3.62), (1.30, 3.50), (1.55, 3.22), (1.85, 2.92), (2.30, 2.74),
            (2.90, 2.60), (3.55, 2.62), (4.15, 2.72), (4.65, 2.55), (4.92, 2.10), (4.98, 1.45), (4.75, 1.00), (4.20, 0.80),
            (3.60, 0.66), (3.00, 0.70), (2.60, 1.05), (2.40, 1.55), (2.20, 2.05), (1.85, 2.42), (1.45, 2.68), (0.95, 2.82)]
LAGO_CTRL = [(EDGE + u, v) for u, v in _LAGO_UV]
# fundo: beira de 12 cm para as pedras (10 a 25 cm de água), prateleira de plantas a 25 cm até 35 cm da beira,
# parede inclinada até 55 cm da beira e o fundo com 90 cm. Perto do muro: até 0,55 m da face da pedra no máximo
# 50 cm de água (a escavação fica 18 cm acima do topo da sapata) e o fundo cheio só a 0,95 m da face, mais de 0,6 m
# além da ponta da sapata. Escavação = água + 6 cm (nível da água) + 6 cm (5 cm de areia e as mantas).
BEIRA, PRAT_FIM, PAREDE_FIM, PRAT_PROF = 0.12, 0.35, 0.55, 0.25
ARRIMO_RASO, ARRIMO_RAMPA, ARRIMO_PROF = 0.55, 0.95, 0.50
ESC_EXTRA = 0.06


def catmull(pts, n_por=10):
    """Curva fechada (Catmull-Rom) passando pelos pontos de controle."""
    P_ = np.array(pts, float); m = len(P_); out = []
    for i in range(m):
        p0, p1, p2, p3 = P_[(i - 1) % m], P_[i], P_[(i + 1) % m], P_[(i + 2) % m]
        for t in np.linspace(0, 1, n_por, endpoint=False):
            t2, t3 = t * t, t * t * t
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    return np.array(out)


LAGO = catmull(LAGO_CTRL)         # contorno da água (fechado, ~190 pontos)


def dentro_lago(X, Y, poli=None):
    poli = LAGO if poli is None else poli
    x0, y0 = poli[:, 0], poli[:, 1]; x1, y1 = np.roll(x0, -1), np.roll(y0, -1)
    X = np.asarray(X, float)[..., None]; Y = np.asarray(Y, float)[..., None]
    cruza = ((y0 > Y) != (y1 > Y)) & (X < (x1 - x0) * (Y - y0) / (y1 - y0 + 1e-12) + x0)
    return cruza.sum(axis=-1) % 2 == 1


def dist_borda(X, Y):
    a = LAGO; b = np.roll(LAGO, -1, axis=0)
    X = np.asarray(X, float)[..., None]; Y = np.asarray(Y, float)[..., None]
    ab = b - a; L2 = (ab ** 2).sum(axis=1)
    t = np.clip(((X - a[:, 0]) * ab[:, 0] + (Y - a[:, 1]) * ab[:, 1]) / L2, 0, 1)
    px, py = a[:, 0] + t * ab[:, 0], a[:, 1] + t * ab[:, 1]
    return np.sqrt((X - px) ** 2 + (Y - py) ** 2).min(axis=-1)


def prof_lago(X, Y):
    """Profundidade da água (m) num ponto de dentro do lago."""
    d = dist_borda(X, Y)
    p = np.where(d < BEIRA, 0.10 + d / BEIRA * (PRAT_PROF - 0.10), np.where(d < PRAT_FIM, PRAT_PROF,
                 np.where(d < PAREDE_FIM, PRAT_PROF + (d - PRAT_FIM) / (PAREDE_FIM - PRAT_FIM) * (PROF - PRAT_PROF), PROF)))
    dm = np.asarray(X, float) - FACE                  # perto do muro de arrimo: raso, para não cavar junto ao pé do muro
    lim = np.where(dm < ARRIMO_RASO, ARRIMO_PROF,
                   np.where(dm < ARRIMO_RAMPA, ARRIMO_PROF + (dm - ARRIMO_RASO) / (ARRIMO_RAMPA - ARRIMO_RASO) * (PROF - ARRIMO_PROF), PROF))
    return np.minimum(p, lim)


# ------------------------------------------------------------------ grama em volta do lago
# o contorno de fora sai de um raio medido do centro do lago (largura de 0,65 a 1,45 m, variando em volta), limitado
# pelo pé do muro de arrimo, pelos muros laterais e pela boca do poço
C_LAGO = LAGO.mean(axis=0)
_ang = np.linspace(0, 2 * math.pi, 144, endpoint=False)
_larg = 1.00 + 0.35 * np.sin(3 * _ang + 0.7) + 0.12 * np.sin(7 * _ang)
_rr = np.arange(0.2, 4.2, 0.02)
_PX = C_LAGO[0] + np.cos(_ang)[:, None] * _rr[None, :]; _PY = C_LAGO[1] + np.sin(_ang)[:, None] * _rr[None, :]
_cobre = dentro_lago(_PX, _PY) | (dist_borda(_PX, _PY) < _larg[:, None])
_livre = ((_PX > FACE + 0.05) & (_PY > 0.25) & (_PY < LARGURA - 0.25) & (np.hypot(_PX - POCO[0], _PY - POCO[1]) > POCO_R + 0.07)
          & ~((_PX > 51.3) & (_PY < 4.5)))          # piso do pergolado do cineminha
_r_max = np.array([_rr[np.argmin(l)] if not l.all() else _rr[-1] for l in _livre])
_r_out = np.minimum(np.array([_rr[np.nonzero(l)[0].max()] for l in _cobre]), _r_max)
_r_out = np.minimum(np.convolve(np.concatenate([_r_out[-3:], _r_out, _r_out[:3]]), np.ones(7) / 7, mode='valid'), _r_max)
GRAMA = np.stack([C_LAGO[0] + np.cos(_ang) * _r_out, C_LAGO[1] + np.sin(_ang) * _r_out], axis=1)

# ------------------------------------------------------------------ cascata de lajes de pedra
# descendo do alto do muro para dentro do lago, em três quedas. Revisão de 08/11/2026: lajes 10 cm mais baixas (a de
# cima fica abaixo da capa, com espaço para a água sair) e mais curtas; a de baixo também se apoia num pilar de pedras
# assentado no vão entre o muro e a água, e a ponta dela fica 25 cm para dentro da água.
CASCATA = {'origem': (FACE, 3.22),               # face da pedra, no meio da cascata
           'ang': 0.0, 'largura': 0.60,           # a água corre para o quintal (+x)
           'lajes': [(0.22, -0.16), (0.38, -0.50), (0.55, -0.84)],   # (avanço a partir da face da pedra, topo da laje)
           'monte': False, 'pilar': True}

# ------------------------------------------------------------------ hidráulica e elétrica (revisão de 08/11/2026)
# caixa do filtro (50 x 40 cm) e sumidouro (60 x 60 cm) na faixa entre o lago e o muro lateral, do lado oposto ao
# poço e antes do piso do pergolado; tomada no muro lateral, embaixo do pergolado, a mais de 2 m da água (NBR 5410)
CAIXA_FILTRO = (EDGE + 4.45, 0.25)
SUMIDOURO = (EDGE + 5.10, 0.33)
TOMADA = (EDGE + 6.90, 0.03)

# ------------------------------------------------------------------ muro de arrimo revestido de pedra na beira da laje
# (aprovado pelo Thiago em 19/10/2026: hoje a beira é barranco de terra). Trechos ao longo do muro, sem a escada.
MURO_TRECHOS = [(0.0, ESCADA_Y0), (ESCADA_Y1, LARGURA)]
MURO_CINTA = 0.06                 # capa de pedra lisa no topo do muro (fica no nível do piso da laje)

