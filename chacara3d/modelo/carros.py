"""Carros de referência no estacionamento do quintal de baixo (pedido do Thiago em 10/11/2026: "dois carros na garagem,
um deles caminhonete e outro carro normal, para ter uma noção real do tamanho do espaço").

Medidas de mercado (arredondadas): carro normal = sedã/hatch médio de 4,30 x 1,75 x 1,47 m; caminhonete = picape média
de cabine dupla (tipo Hilux/S10/Ranger) de 5,33 x 1,86 x 1,81 m. Os dois ficam ao longo de x com a frente virada para
a beira da laje (x menor). Só caixas, cilindros e materiais que o passeio já conhece.
"""
import numpy as np

TIPOS = {
    # comprimento, largura, altura, raio da roda, entre-eixos, balanço da frente, cor
    'carro': {'C': 4.30, 'L': 1.75, 'H': 1.47, 'r': 0.31, 'eixos': 2.60, 'frente': 0.85, 'cor': 'pintura_marinho'},
    'caminhonete': {'C': 5.33, 'L': 1.86, 'H': 1.81, 'r': 0.38, 'eixos': 3.09, 'frente': 0.90, 'cor': 'white'},
}


def carro(geo, tipo, x_nariz, yc, z0):
    """Põe um carro com o para-choque da frente em x_nariz, centrado em yc, rodas no chão z0. Devolve (x0, x1, y0, y1)."""
    T = TIPOS[tipo]; box, tube = geo.box, geo.tube
    C, L, H, r = T['C'], T['L'], T['H'], T['r']
    x0, x1, y0, y1 = x_nariz, x_nariz + C, yc - L / 2, yc + L / 2
    cor, vidro, preto = T['cor'], 'aluminio_preto', 'metal_dark'
    xe = (x0 + T['frente'], x0 + T['frente'] + T['eixos'])                       # eixos da frente e de trás
    zb = z0 + r * 0.55                                                           # embaixo da carroceria
    if tipo == 'carro':
        zc = z0 + 0.88                                                           # linha da cintura
        box(cor, x0 + 0.05, x1 - 0.05, y0, y1, zb, zc)                           # carroceria
        box(preto, x0, x0 + 0.06, y0 + 0.08, y1 - 0.08, zb, zb + 0.30)           # para-choques
        box(preto, x1 - 0.06, x1, y0 + 0.08, y1 - 0.08, zb, zb + 0.30)
        ca, cb = x0 + 1.25, x1 - 0.85                                            # cabine
        box(vidro, ca + 0.10, cb - 0.05, y0 + 0.10, y1 - 0.10, zc, z0 + H - 0.06)
        box(cor, ca + 0.30, cb - 0.15, y0 + 0.14, y1 - 0.14, z0 + H - 0.06, z0 + H)   # teto
        box(cor, x0 + 0.05, ca + 0.12, y0 + 0.04, y1 - 0.04, zc, zc + 0.04)      # capô
    else:
        zc = z0 + 1.08
        box(cor, x0 + 0.05, x1 - 0.05, y0, y1, zb, zc - 0.10)                    # chassi e laterais
        box(cor, x0 + 0.05, x0 + 1.45, y0, y1, zc - 0.10, zc)                    # capô
        box(preto, x0, x0 + 0.08, y0 + 0.05, y1 - 0.05, zb, zb + 0.40)           # para-choque e grade
        box('inox', x1 - 0.06, x1, y0 + 0.10, y1 - 0.10, zb, zb + 0.20)          # para-choque de trás
        ca, cb = x0 + 1.45, x0 + 3.45                                            # cabine dupla
        box(cor, ca, cb, y0, y1, zc - 0.10, zc)
        box(vidro, ca + 0.15, cb - 0.05, y0 + 0.08, y1 - 0.08, zc, z0 + H - 0.07)
        box(cor, ca + 0.40, cb - 0.10, y0 + 0.12, y1 - 0.12, z0 + H - 0.07, z0 + H)    # teto
        zf = zc - 0.25                                                           # caçamba aberta
        box(cor, cb + 0.02, x1 - 0.05, y0, y0 + 0.06, zc - 0.10, zc + 0.18)
        box(cor, cb + 0.02, x1 - 0.05, y1 - 0.06, y1, zc - 0.10, zc + 0.18)
        box(cor, x1 - 0.11, x1 - 0.05, y0 + 0.06, y1 - 0.06, zc - 0.10, zc + 0.18)  # tampa
        box(preto, cb + 0.02, x1 - 0.11, y0 + 0.06, y1 - 0.06, zf, zf + 0.03)     # piso da caçamba
    for xx in (x0 + 0.02, ):                                                     # faróis
        box('bulb', xx, xx + 0.03, y0 + 0.12, y0 + 0.40, zc - 0.22, zc - 0.10)
        box('bulb', xx, xx + 0.03, y1 - 0.40, y1 - 0.12, zc - 0.22, zc - 0.10)
    for xw in xe:                                                                # rodas com calota
        for ya, yb in ((y0 - 0.01, y0 + 0.22), (y1 - 0.22, y1 + 0.01)):
            tube(preto, [(xw, ya, z0 + r), (xw, yb, z0 + r)], r, seg=18, smooth=True, cap=True)
            yo = ya - 0.005 if ya < yc else yb + 0.005
            yi = ya + 0.02 if ya < yc else yb - 0.02
            tube('inox', [(xw, yo, z0 + r), (xw, yi, z0 + r)], r * 0.58, seg=14, smooth=True, cap=True)
    return x0, x1, y0, y1
