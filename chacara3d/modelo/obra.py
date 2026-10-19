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
FACE = EDGE + 0.08                # face do muro de arrimo (revestimento)
LARGURA = 10.0                    # de muro a muro

# ------------------------------------------------------------------ o que já existe no quintal de baixo
ARVORE = (47.4, 1.5)              # centro do tronco da amendoeira
POCO = (51.9, 6.3)                # centro do poço
POCO_R = 0.97                     # raio por fora da boca do poço
ESCADA_Y0, ESCADA_Y1 = 7.7, 9.3   # laterais da escada que desce da laje
ESCADA_N, ESCADA_PISO = 5, 0.30   # degraus e profundidade de cada piso

# ------------------------------------------------------------------ deck de madeira
DX0, DX1, DY0, DY1 = EDGE, 48.0, 3.2, 6.2      # plataforma de 2,00 x 3,00, topo no nível do piso da piscina (0,00)
DTAB, DBAR = 0.025, 0.16                        # tábua e barrote (altura)
ZB0 = -DTAB                                     # topo dos barrotes
ZV0, ZV1 = ZB0 - DBAR - 0.20, ZB0 - DBAR        # viga de 12 x 20 embaixo dos barrotes
BARROTES = [DY0 + 0.03 + k * (DY1 - DY0 - 0.06) / 6 for k in range(7)]     # 7 barrotes, eixos a cada 0,49
VX0, VX1 = 47.79, 47.91                          # viga externa (12 cm)
PILARES = [((VX0 + VX1) / 2, DY0 + 0.06), ((VX0 + VX1) / 2, DY1 - 0.06)]   # pilares 12 x 12 nos cantos de fora
N_TABUAS = 19                                    # tábuas de 10 cm com junta de 5 mm
GUARDA_H = 1.10                                  # altura do guarda-corpo

# ------------------------------------------------------------------ laguinho
ZAGUA = LOW - 0.06                # nível d'água (6 cm abaixo do chão do quintal de baixo)
PROF = 1.00                       # lâmina d'água no meio
LAGO_CTRL = [(46.38, 3.75), (46.30, 4.80), (46.32, 5.90), (46.30, 6.70), (46.62, 7.26), (47.22, 7.28), (47.56, 6.82),
             (47.58, 6.10), (47.92, 5.74), (48.45, 6.06), (49.10, 6.52), (49.78, 6.22), (50.08, 5.20), (49.88, 4.08),
             (49.32, 3.22), (48.62, 2.92), (48.12, 3.56), (47.60, 3.62), (47.02, 3.36)]
# fundo: beira de 15 cm para as pedras (10 a 30 cm de água), prateleira de plantas a 30 cm até 40 cm da beira,
# parede inclinada até 62 cm da beira e o fundo com 1,00 m; perto do muro de arrimo no máximo 35 cm
BEIRA, PRAT_FIM, PAREDE_FIM, PRAT_PROF = 0.15, 0.40, 0.62, 0.30
ARRIMO_RASO, ARRIMO_RAMPA, ARRIMO_PROF = 0.75, 1.15, 0.35


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
_livre = (_PX > EDGE + 0.09) & (_PY > 0.25) & (_PY < LARGURA - 0.25) & (np.hypot(_PX - POCO[0], _PY - POCO[1]) > POCO_R + 0.07)
_r_max = np.array([_rr[np.argmin(l)] if not l.all() else _rr[-1] for l in _livre])
_r_out = np.minimum(np.array([_rr[np.nonzero(l)[0].max()] for l in _cobre]), _r_max)
_r_out = np.minimum(np.convolve(np.concatenate([_r_out[-3:], _r_out, _r_out[:3]]), np.ones(7) / 7, mode='valid'), _r_max)
GRAMA = np.stack([C_LAGO[0] + np.cos(_ang) * _r_out, C_LAGO[1] + np.sin(_ang) * _r_out], axis=1)

# ------------------------------------------------------------------ cascata de lajes de pedra junto ao muro de arrimo
CY0, CY1 = 6.42, 7.18                                            # largura da cascata (ao longo do muro)
LAJES = [(0.36, -0.06), (0.56, -0.42), (0.78, -0.78)]           # (avanço a partir do muro, topo da laje)
