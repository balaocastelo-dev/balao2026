"""Banheiro duplo externo do quintal de baixo: estudo 1 (08/11/2026).

Pedido do Thiago: dois banheiros com a pia lavabo central do lado de fora, do outro lado da escada que sobe para a
churrasqueira, encostado no muro de arrimo de pedra. Fonte única das medidas para o render_banheiro.py (fotos) e o
desenho_banheiro.py (planta baixa). A largura (da escada ao muro lateral) ainda não foi medida no local.

Arranjo: um nicho aberto no meio, com a bancada da pia no fundo (contra o muro de pedra) e as portas dos dois
banheiros nas paredes do nicho, uma de frente para a outra: as portas não ficam viradas para o quintal.
Eixos e níveis como no obra.py (x saindo do muro para o quintal, y de um muro lateral ao outro).
"""
import math
import numpy as np
from obra import EDGE, FACE, LOW, ESCADA_Y1, LARGURA

X0 = FACE                          # fundo: face da pedra do muro de arrimo
FUNDO = 2.00
X1 = X0 + FUNDO                    # fachada para o quintal
Y0 = ESCADA_Y1 + 0.25              # 25 cm da lateral da escada
Y1 = LARGURA                       # muro lateral do terreno
PE, PI = 0.14, 0.12                # paredes de fora e de dentro (bloco rebocado)
NICHO = 1.40                       # largura livre do nicho da pia
CAB = round((Y1 - Y0 - 2 * PE - 2 * PI - NICHO) / 2, 3)       # largura livre de cada banheiro
YA0 = Y0 + PE; YA1 = YA0 + CAB     # banheiro 1 (lado da escada)
YN0 = YA1 + PI; YN1 = YN0 + NICHO  # nicho da pia
YB0 = YN1 + PI; YB1 = YB0 + CAB    # banheiro 2 (lado do muro lateral)
PD = 2.30                          # pé-direito
LAJE = 0.12
ZT = LOW + PD + LAJE               # topo da laje (fica ZT acima do piso da churrasqueira, que é o 0,00)
MARQUISE = 0.35                    # a laje avança na frente, sobre a entrada do nicho
PORTA_L, PORTA_H = 0.70, 2.10
PORTA_X = (X0 + 1.02, X0 + 1.02 + PORTA_L)                    # portas nas paredes do nicho, perto da frente
JAN_L, JAN_H, JAN_Z = 0.60, 0.40, LOW + 1.75                  # basculante no alto da fachada de cada banheiro
BANC_P, BANC_Z = 0.55, LOW + 0.90                             # bancada da pia: profundidade e altura
CUBA = (X0 + 0.30, (YN0 + YN1) / 2)
VASO_X = X0 + 0.10                                            # vaso encostado no fundo, no meio do banheiro
CANTEIRO = 0.45                                               # canteiro na frente dos banheiros
JARDINEIRA = 0.40                                             # jardineira de pendentes na frente da laje


def construir(geo, P, rng):
    """Põe o banheiro no modelo (geo.box etc.). Chamar depois de tirar o que estava no lugar."""
    box, obox, tube, cyl, ellipsoid = geo.box, geo.obox, geo.tube, geo.cyl, geo.ellipsoid
    zp = LOW + PD
    # paredes laterais e as do nicho (com as portas), brancas
    # (as paredes param na face de dentro da fachada: faces coincidentes saem pretas no Cycles)
    box('house_white', X0, X1 - PE, Y0, YA0, LOW, zp)
    box('house_white', X0, X1 - PE, YB1, Y1, LOW, zp)
    for ya, yb in ((YA1, YN0), (YN1, YB0)):
        box('house_white', X0, PORTA_X[0], ya, yb, LOW, zp)
        box('house_white', PORTA_X[1], X1 - PE, ya, yb, LOW, zp)
        box('house_white', PORTA_X[0], PORTA_X[1], ya, yb, LOW + PORTA_H, zp)
    # portas de madeira (fechadas), rentes à parede do lado do nicho, com puxador
    for yf, s in ((YN0, -1), (YN1, 1)):
        y0_, y1_ = sorted((yf + s * 0.005, yf + s * 0.04))
        box('wood_z', PORTA_X[0] + 0.01, PORTA_X[1] - 0.01, y0_, y1_, LOW + 0.01, LOW + PORTA_H - 0.01)
        yp = yf - s * 0.03
        box('inox', PORTA_X[1] - 0.12, PORTA_X[1] - 0.10, min(yp, yf) - 0.01, max(yp, yf) + 0.01, LOW + 0.95, LOW + 1.12)
    # fachada dos dois banheiros, revestida de filete de pedra, com o basculante no alto
    for ya, yb, yc in ((Y0, YN0, (YA0 + YA1) / 2), (YN1, Y1, (YB0 + YB1) / 2)):
        x0_, x1_ = X1 - PE, X1
        j0, j1 = yc - JAN_L / 2, yc + JAN_L / 2
        box('filete', x0_, x1_, ya, j0, LOW, zp); box('filete', x0_, x1_, j1, yb, LOW, zp)
        box('filete', x0_, x1_, j0, j1, LOW, JAN_Z); box('filete', x0_, x1_, j0, j1, JAN_Z + JAN_H, zp)
        box('stone_cut', x1_, x1_ + 0.04, j0 - 0.03, j1 + 0.03, JAN_Z - 0.03, JAN_Z)          # peitoril
        for a, b, c, d in ((j0, j0 + 0.03, JAN_Z, JAN_Z + JAN_H), (j1 - 0.03, j1, JAN_Z, JAN_Z + JAN_H),
                           (j0, j1, JAN_Z, JAN_Z + 0.03), (j0, j1, JAN_Z + JAN_H - 0.03, JAN_Z + JAN_H)):
            box('esquadria_branca', x0_ + 0.06, x0_ + 0.10, a, b, c, d)
        box('vidro_jateado', x0_ + 0.075, x0_ + 0.085, j0 + 0.03, j1 - 0.03, JAN_Z + 0.03, JAN_Z + JAN_H - 0.03)
    # parede de trás, em cima do muro de arrimo: vira o parapeito da laje de cima neste trecho (vai da escada ao muro)
    box('filete', EDGE + 0.04, X0, ESCADA_Y1, Y1, 0.0, ZT)
    box('stone_cut', EDGE + 0.01, X0 + 0.01, ESCADA_Y1, Y1, ZT, ZT + 0.03)
    # laje com marquise, borda com pingadeira
    box('house_white', X0, X1 + MARQUISE, Y0, Y1, zp, ZT)
    box('stone_cut', X1 + MARQUISE - 0.005, X1 + MARQUISE + 0.02, Y0, Y1, ZT - 0.05, ZT + 0.03)
    # jardineira de pendentes na frente da laje (aspargo e samambaia caindo sobre a fachada)
    jx0 = X1 + MARQUISE - JARDINEIRA
    box('concrete', jx0, X1 + MARQUISE, Y0, Y1, ZT, ZT + 0.32)
    box('mulch', jx0 + 0.04, X1 + MARQUISE - 0.04, Y0 + 0.04, Y1 - 0.04, ZT + 0.30, ZT + 0.31)
    geo_rng = rng
    P.vine_top('leaf_vine_light', X1 + MARQUISE - 0.10, X1 + MARQUISE + 0.06, Y0 + 0.05, Y1 - 0.05, ZT + 0.30, geo_rng,
               density=520, leaf=0.07, hang=0.75)
    for yy in np.arange(Y0 + 0.35, Y1 - 0.2, 0.62):
        P.mound('leaf_fern', (jx0 + 0.20, yy + rng.uniform(-0.08, 0.08), ZT + 0.31), rng, n=18, L=0.5, W=0.1, e=(0.0, 1.1), droop=1.1, r0=0.05)
    # nicho da pia: piso de pedra, bancada contra o muro, cuba de apoio, torneira de parede, espelho e pendente
    box('stone_cut', X0, X1 + 1.00, YN0 - 0.15, YN1 + 0.15, LOW, LOW + 0.025)
    box('quartzo', X0, X0 + BANC_P, YN0, YN1, BANC_Z - 0.04, BANC_Z)
    box('madeira_clara', X0 + 0.05, X0 + BANC_P - 0.03, YN0 + 0.02, YN1 - 0.02, BANC_Z - 0.20, BANC_Z - 0.04)  # gaveteiro
    cyl('louca', (CUBA[0], CUBA[1], BANC_Z), 0.17, 0.13, seg=28, r_top=0.2)
    cyl('pond_floor', (CUBA[0], CUBA[1], BANC_Z + 0.125), 0.16, 0.006, seg=28)
    tube('inox', [(X0 + 0.005, CUBA[1], BANC_Z + 0.36), (CUBA[0] - 0.06, CUBA[1], BANC_Z + 0.36), (CUBA[0] - 0.06, CUBA[1], BANC_Z + 0.32)], 0.012, seg=10)
    box('wood_x', X0 + 0.005, X0 + 0.025, CUBA[1] - 0.33, CUBA[1] + 0.33, BANC_Z + 0.45, BANC_Z + 1.25)
    box('espelho', X0 + 0.025, X0 + 0.032, CUBA[1] - 0.30, CUBA[1] + 0.30, BANC_Z + 0.48, BANC_Z + 1.22)
    tube('metal_dark', [(X0 + 0.80, CUBA[1], zp), (X0 + 0.80, CUBA[1], LOW + 2.0)], 0.005, seg=4)
    cyl('metal_dark', (X0 + 0.80, CUBA[1], LOW + 1.88), 0.12, 0.12, seg=18, r_top=0.03, cap=False)
    ellipsoid('bulb', (X0 + 0.80, CUBA[1], LOW + 1.90), (0.05, 0.05, 0.06), seg=10, rings=6)
    # arandelas dos dois lados da entrada do nicho
    for yy in (YN0 - 0.22, YN1 + 0.22):
        box('metal_dark', X1, X1 + 0.07, yy - 0.05, yy + 0.05, LOW + 1.80, LOW + 2.02)
        box('bulb', X1 + 0.07, X1 + 0.08, yy - 0.035, yy + 0.035, LOW + 1.84, LOW + 1.98)
    # canteiros na frente dos dois banheiros
    for ya, yb in ((Y0, YN0 - 0.15), (YN1 + 0.15, Y1)):
        box('stone_cut', X1, X1 + CANTEIRO, ya, ya + 0.04, LOW, LOW + 0.12)
        box('stone_cut', X1, X1 + CANTEIRO, yb - 0.04, yb, LOW, LOW + 0.12)
        box('stone_cut', X1 + CANTEIRO - 0.04, X1 + CANTEIRO, ya, yb, LOW, LOW + 0.12)
        box('mulch', X1, X1 + CANTEIRO - 0.04, ya + 0.04, yb - 0.04, LOW, LOW + 0.09)
        n = max(2, int((yb - ya) / 0.42))
        for k, yy in enumerate(np.linspace(ya + 0.22, yb - 0.22, n)):
            c = (X1 + CANTEIRO / 2 - 0.02, yy, LOW + 0.09)
            (P.moreia if k % 2 == 0 else P.xanadu)(c, rng, 0.85 if k % 2 == 0 else 0.7)


def resumo():
    return {'largura': Y1 - Y0, 'fundo': FUNDO, 'banheiro': (CAB, FUNDO - PE), 'nicho': NICHO, 'pe_direito': PD,
            'acima_da_laje': ZT}


if __name__ == '__main__':
    for k, v in resumo().items():
        print(k, v)
