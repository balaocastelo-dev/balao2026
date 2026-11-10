"""Medidas da obra do quintal de baixo: laguinho, muro de pedras, cascata, poço, escada e amendoeira.

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
GUARDA_U = -0.10                  # postes do guarda-corpo no piso da laje, 10 cm antes da beira (10/11/2026: no trecho do
                                  # lago o muro é de pedras empilhadas e não segura poste)

# ------------------------------------------------------------------ o que já existe no quintal de baixo
# medido pelo Thiago em 19/10/2026 com tijolinhos de 18 cm enfileirados no chão:
#   beira da laje até a ponta da escada 1,60; largura da escada 1,40; do tronco da amendoeira até o poço 13 (2,34).
# medido pelo Thiago em 10/11/2026 com a trena do celular:
#   da escada até o muro do lado da amendoeira 6,11 e até o muro do outro lado 2,71 (6,11 + 1,40 + 2,71 = 10,22);
#   do degrau de baixo até a boca do poço 1,11 (na frente da escada); do muro da amendoeira até o tronco 5,04; da
#   boca do poço até o pé do tronco 2,21; da beira da laje até o portão de baixo 13,88; de muro a muro no portão 10,24.
#   (Os 23 tijolinhos "do poço até o muro da amendoeira" de outubro só fecham se foram até o muro do outro lado.)
# Diâmetro do poço e a posição exata do centro dele e do tronco: estimados (conferir).
POCO_R = 0.63                     # raio por fora da boca do poço (diâmetro estimado 1,25)
POCO = (EDGE + 1.60 + 1.11 + POCO_R, 6.20)                         # centro do poço (na frente da escada)
ARVORE = (EDGE + 0.20, 5.20)      # centro do tronco da amendoeira: na beira da laje, ~1 m ao lado da escada
ESCADA_Y0, ESCADA_Y1 = 6.11, 7.51                                  # escada de 1,40 de largura
ESCADA_X0 = EDGE + 0.08          # pé do primeiro degrau (a escada já existe)
ESCADA_N, ESCADA_PISO = 5, round((1.60 - (ESCADA_X0 - EDGE)) / 5, 3)    # cinco degraus até 1,60 da beira da laje

# ------------------------------------------------------------------ guarda-corpo na beira da laje
# (19/10/2026: o Thiago tirou o deck; fica só o guarda-corpo protegendo a laje de cima do lago)
GUARDA_H = 1.10                                  # altura do guarda-corpo (vão entre balaústres até 9 cm)
# 10/11/2026: o tronco da amendoeira fica na beira da laje, bem na linha dos postes; o guarda-corpo contorna o tronco
# pelo lado da laje, a uns 35 cm da casca (deixa o tronco engrossar). Pontos (u da beira da laje, v do muro).
GUARDA_LINHA = [(GUARDA_U, 0.12), (GUARDA_U, ARVORE[1] - 0.60), (-0.45, ARVORE[1] - 0.30), (-0.45, ARVORE[1] + 0.30),
                (GUARDA_U, ARVORE[1] + 0.60), (GUARDA_U, ESCADA_Y0)]

# ------------------------------------------------------------------ muro de pedras empilhadas (10/11/2026)
# Pelas fotos de referência do Thiago: do muro da amendoeira até a escada, em vez do muro reto revestido, um muro de
# pedras arredondadas empilhadas, em curva, que abraça o pé da amendoeira. Inclinado: o pé do muro (no chão de baixo)
# segue MURO_PE; o topo fica a TOPO_RECUO do pé (no máximo), sem passar da beira da laje. Em volta do tronco não se
# abre vala: as pedras vão assentadas no barranco, sem fundação.
MURO_PE = [(0.52, 0.00), (0.50, 1.00), (0.50, 2.00), (0.52, 3.00), (0.56, 3.80), (0.80, 4.35), (1.05, 4.85), (1.12, 5.25),
           (1.00, 5.65), (0.78, 5.95), (0.62, ESCADA_Y0)]          # (u da beira da laje, v do muro da amendoeira)
MURO_TOPO = -0.04                 # topo das pedras (4 cm abaixo do piso da laje)
TOPO_RECUO = 0.40                 # o topo fica até 40 cm para trás do pé (muro inclinado)
_MP = np.array(MURO_PE, float)


def muro_pe(v):
    """u do pé do muro de pedras (da beira da laje) na posição v."""
    return np.interp(v, _MP[:, 1], _MP[:, 0])


def muro_frente(v, z):
    """u da frente das pedras na altura z (de LOW até MURO_TOPO)."""
    pe = muro_pe(v); topo = np.maximum(0.15, pe - TOPO_RECUO)
    t = np.clip((np.asarray(z, float) - LOW) / (MURO_TOPO - LOW), 0, 1)
    return pe + (topo - pe) * t


# ------------------------------------------------------------------ laguinho (redesenhado em 10/11/2026)
# Pelas fotos de referência: no pé do muro de pedras, entre o muro da amendoeira e a árvore, mais comprido (5,38 m de ponta a ponta),
# ao longo do muro lateral na direção do portão; 1,50 de folga da boca do poço e ~1,8 m do centro do tronco.
ZAGUA = LOW - 0.06                # nível d'água (6 cm abaixo do chão do quintal de baixo)
PROF = 0.90                       # lâmina d'água no meio
_LAGO_UV = [(0.82, 0.95), (0.76, 1.40), (0.66, 1.85), (0.64, 2.30), (0.68, 2.75), (0.86, 3.15), (1.10, 3.62), (1.48, 3.94),
            (1.98, 4.04), (2.52, 3.86), (3.08, 3.52), (3.70, 3.22), (4.32, 2.98), (4.95, 2.74), (5.48, 2.52), (5.88, 2.22),
            (6.02, 1.84), (5.90, 1.46), (5.55, 1.22), (5.02, 1.16), (4.45, 1.24), (3.95, 1.40), (3.45, 1.24), (2.90, 1.04),
            (2.25, 0.95), (1.55, 0.94), (1.08, 0.94)]
LAGO_CTRL = [(EDGE + u, v) for u, v in _LAGO_UV]
# perto da amendoeira só a prateleira rasa (não cavar fundo na zona das raízes)
ARVORE_RASO, ARVORE_RAMPA, ARVORE_PROF = 2.10, 2.70, 0.30
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
    dt = np.hypot(np.asarray(X, float) - ARVORE[0], np.asarray(Y, float) - ARVORE[1])     # perto da amendoeira: raso
    lim_t = np.where(dt < ARVORE_RASO, ARVORE_PROF,
                     np.where(dt < ARVORE_RAMPA, ARVORE_PROF + (dt - ARVORE_RASO) / (ARVORE_RAMPA - ARVORE_RASO) * (PROF - ARVORE_PROF), PROF))
    return np.minimum(np.minimum(p, lim), lim_t)


# ------------------------------------------------------------------ canteiro em volta do lago (10/11/2026)
# como nas fotos de referência: uma faixa de plantas em volta da água (0,45 a 0,95 m, variando), limitada pelo pé do
# muro de pedras, pela amendoeira, pelos muros laterais, pela escada, pela boca do poço e pelo piso do pergolado
PERGOLADO_DX = 1.20               # o pergolado do cineminha andou 1,20 m para o portão para caber o lago mais comprido
PERGOLADO_X0 = 51.35 + PERGOLADO_DX
C_LAGO = LAGO.mean(axis=0)
_ang = np.linspace(0, 2 * math.pi, 144, endpoint=False)
_larg = 0.70 + 0.22 * np.sin(3 * _ang + 0.7) + 0.08 * np.sin(7 * _ang)
_rr = np.arange(0.2, 4.6, 0.02)
_PX = C_LAGO[0] + np.cos(_ang)[:, None] * _rr[None, :]; _PY = C_LAGO[1] + np.sin(_ang)[:, None] * _rr[None, :]
_cobre = dentro_lago(_PX, _PY) | (dist_borda(_PX, _PY) < _larg[:, None])
_livre = ((_PX > EDGE + muro_pe(_PY) + 0.05) & (_PY > 0.25) & (_PY < LARGURA - 0.25)
          & (np.hypot(_PX - POCO[0], _PY - POCO[1]) > POCO_R + 0.25) & (np.hypot(_PX - ARVORE[0], _PY - ARVORE[1]) > 0.55)
          & ~((_PX < ESCADA_X0 + 1.75) & (_PY > ESCADA_Y0 - 0.1))
          & ~((_PX > PERGOLADO_X0 - 0.05) & (_PY < 4.5)))          # piso do pergolado do cineminha
_r_max = np.array([_rr[np.argmin(l)] if not l.all() else _rr[-1] for l in _livre])
_r_out = np.minimum(np.array([_rr[np.nonzero(l)[0].max()] for l in _cobre]), _r_max)
_r_out = np.minimum(np.convolve(np.concatenate([_r_out[-3:], _r_out, _r_out[:3]]), np.ones(7) / 7, mode='valid'), _r_max)
CANTEIRO = np.stack([C_LAGO[0] + np.cos(_ang) * _r_out, C_LAGO[1] + np.sin(_ang) * _r_out], axis=1)
GRAMA = CANTEIRO                  # nome antigo (desenhos_obra.py ainda usa; as folhas serão refeitas com o OK do Thiago)

# ------------------------------------------------------------------ cascata (10/11/2026: uma queda só, em lâmina)
# como nas fotos de referência: a água sai de uma laje de pedra encaixada no muro de pedras, à esquerda da amendoeira,
# e cai numa lâmina de 50 cm direto no lago (cano de 40 mm escondido atrás das pedras)
CASCATA = {'origem': (EDGE + 0.24, 2.25),        # frente das pedras na altura da laje, no meio da cascata
           'ang': 0.0, 'largura': 0.50,           # a água corre para o quintal (+x)
           'lajes': [(0.42, -0.20)],              # (avanço a partir da frente das pedras, topo da laje)
           'monte': False, 'pilar': False, 'flancos': False}

# ------------------------------------------------------------------ hidráulica e elétrica (revisão de 10/11/2026)
# caixa do filtro (50 x 40 cm) no canteiro junto ao muro lateral, depois da ponta do lago e antes do piso do pergolado
# (a 1 m da água); sumidouro (60 x 60 cm) enterrado com tampa de concreto debaixo do futuro piso do pergolado, a 1,6 m
# da água e 7 m do poço; tomada no muro lateral logo depois da tela do cineminha (a tela ocupa o muro de 7,30 a 11,10
# da beira), a mais de 2 m da água (NBR 5410), com eletroduto enterrado junto ao muro até a caixa do filtro.
# (revisão de 10/11/2026 à noite: antes a caixa e o sumidouro ficavam em 7,00 e 7,70 e a tomada em 8,70, tudo
# debaixo do pergolado que andou 1,20 m, e a tomada atrás da tela)
CAIXA_FILTRO = (EDGE + 6.05, 0.30)
SUMIDOURO = (EDGE + 7.70, 0.38)
TOMADA = (EDGE + 11.30, 0.03)

# ------------------------------------------------------------------ muro de arrimo revestido de pedra na beira da laje
# (aprovado pelo Thiago em 19/10/2026: hoje a beira é barranco de terra). Desde 10/11/2026 só do outro lado da escada:
# do muro da amendoeira até a escada fica o muro de pedras empilhadas (MURO_PE).
MURO_TRECHOS = [(ESCADA_Y1, LARGURA)]
MURO_CINTA = 0.06                 # capa de pedra lisa no topo do muro (fica no nível do piso da laje)

