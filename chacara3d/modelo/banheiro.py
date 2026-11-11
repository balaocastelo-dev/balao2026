"""Banheiro duplo externo do quintal de baixo: modelo 2 encostado no muro do barracão, logo depois da escada e perto do
poço, com a vaga do carro ao lado (do lado do portão) debaixo do mesmo telhado de uma água só.

Histórico: no estudo 3 o Thiago viu 5 modelos com a mesma planta e escolheu o 2 (tijolinho e telha), pedindo chuveiro
nos banheiros e o banheiro emendado na garagem, debaixo de um telhado só (estudo 4, 08/11/2026). Em 10/11/2026 ele
aprovou o modelo 2 ("já coloca o banheiro também, aprovo o 2") e o banheiro entrou no lugar do barracão, de 6,04 a 12,06 m
da beira, com um telhado de duas águas que cobria a vaga na frente. No mesmo dia ele corrigiu: o banheiro vai mais para
o lado da churrasqueira, perto do poço (a pitangueira sai), sem tomar o lugar do estacionamento, e banheiro e
estacionamento ficam debaixo de um telhado só, de uma água só, caindo para o quintal (parte alta no muro do barracão).
Os outros modelos continuam aqui como alternativa (com a cobertura deles).

Às 23h do mesmo dia ele pediu o banheiro menor, de tamanho padrão, sem acessibilidade para cadeirante, e mais longe do
poço: banheiros de 1,30 x 2,00 m livres com box de 0,90 x 0,85 e vaso, portas de 0,70, nicho da pia de 1,50 m com
bancada de 2 cubas a 0,90 m; o conjunto foi para 4,20 m da beira da laje, deixando o poço livre na frente do vão entre
a escada e o banheiro (um canteiro junto ao muro). Fonte única
das medidas para o build.py (maquete e passeio), o render_banheiro.py (fotos) e o desenho_banheiro.py (planta).

Eixos e níveis como no obra.py (x saindo da beira da laje para o portão, y do muro da amendoeira ao muro do barracão);
a fachada fica ao longo de x, olhando para -y (para o poço e o meio do quintal).
"""
import math
import numpy as np
from obra import EDGE, FACE, LOW, LARGURA, POCO, POCO_R

DA_BEIRA = 4.20                    # da beira da laje até o banheiro: o poço fica livre, na frente do vão escada-banheiro
PE, PI = 0.14, 0.12                # paredes de fora e de dentro (bloco rebocado)
NICHO = 1.50                       # largura livre do nicho da pia (2 cubas)
CAB = 1.30                         # largura livre de cada banheiro (padrão, sem acessibilidade): box e vaso
LIVRE = 2.00                       # fundo livre: box na frente, porta no meio, vaso no canto do fundo
LARG = 2 * PE + 2 * PI + NICHO + 2 * CAB                      # 4,62 ao longo da fachada
FUNDO = LIVRE + 2 * PE             # 2,28
XB0 = EDGE + DA_BEIRA              # lado da escada
XB1 = XB0 + LARG                   # lado do portão
YB1 = LARGURA                      # costas no muro do barracão
YB0 = YB1 - FUNDO                  # fachada, de frente para o poço e o meio do quintal
YI0, YI1 = YB0 + PE, YB1 - PE      # faces de dentro da frente e do fundo
XA0 = XB0 + PE; XA1 = XA0 + CAB    # banheiro 1 (lado do muro de pedra)
XN0 = XA1 + PI; XN1 = XN0 + NICHO  # nicho da pia
XC0 = XN1 + PI; XC1 = XC0 + CAB    # banheiro 2 (lado da garagem)
PD = 2.30                          # pé-direito
LAJE = 0.12
ZT = LOW + PD + LAJE               # topo da laje plana (modelos 1, 3 e 4), acima do 0,00 da churrasqueira
PORTA_L, PORTA_H = 0.70, 2.10      # porta padrão de 0,70, abrindo para fora, para o nicho
PORTA_Y = (YI0 + 0.92, YI0 + 0.92 + PORTA_L)                  # atrás do box, antes da bancada
JAN_L, JAN_H, JAN_Z = 0.60, 0.40, LOW + 1.75                  # basculante no alto da fachada de cada banheiro
BANC_P, BANC_Z = 0.50, LOW + 0.90                             # bancada padrão: 0,90 de altura
CUBAS = [(XN0 + NICHO * 0.27, YI1 - 0.26), (XN1 - NICHO * 0.27, YI1 - 0.26)]   # duas cubas na bancada de 1,50
CANTEIRO = 0.45
CHUV_X, CHUV_Y = 0.90, 0.85        # box do chuveiro no canto da frente, do lado da parede de fora
BANCO = (0.70, 0.45, 0.46)         # banco articulado do chuveiro: comprimento, profundidade, altura
# telhado único de uma água só, banheiros + estacionamento (10/11/2026, pedido do Thiago): parte alta no muro do
# barracão, a água cai para o quintal (calha na frente). Telha de barro: 35% de caimento. Do lado do estacionamento a
# parte de trás apoia numa viga com pilares encostados no muro (o muro tem 2,30 e o telhado chega a 3,40 ali).
T_S = 0.35                         # caimento
T_YF = YB0 - 0.45                  # beiral da frente (passa 45 cm da fachada)
T_YT = YB1 - 0.02                  # lado alto, encostado no muro do barracão
T_ZF = LOW + 2.32                  # face de baixo da telha no beiral da frente, 2,32 acima do chão
T_X0, T_X1 = XB0 - 0.25, 59.85     # do lado da escada até o muro do portão
T_YP = T_YF + 0.12                 # viga e pilares da frente (só no trecho do estacionamento)
T_PILARES = (XB1 + 0.15, T_X1 - 0.12)                         # pilares da frente: a frente do estacionamento fica aberta
T_PILARES_MURO = (XB1 + 0.15, (XB1 + T_X1) / 2, T_X1 - 0.12)  # pilares encostados no muro do barracão
GARAGEM = (XB1, T_X1, T_YF, T_YT)                             # piso do estacionamento, ao lado dos banheiros
CARRO = (XB1 + 0.30, XB1 + 0.30 + 4.30, 7.85, 7.85 + 1.75)   # carro normal (carros.py): 4,30 x 1,75, coberto, de frente p/ banheiros
CAMINHONETE = (59.75 - 5.33, 59.75, 5.50 - 0.93, 5.50 + 0.93)  # caminhonete de 5,33 x 1,86 na linha do portão: não cabe na coberta
CANTEIRO_LADOS = (True, True)                                 # canteiro na frente dos dois banheiros


def z_telhado(y):
    """Altura da face de baixo das telhas na posição y (sobe do beiral da frente até o muro)."""
    return T_ZF + T_S * (y - T_YF)


VASO_EIXO = 0.40                   # eixo do vaso a 0,40 da parede de trás, vaso encostado na parede lateral de fora
PISO_FRENTE = 0.90                                            # piso de pedra na frente do nicho (até perto dos pisantes)
MARQUISE = 0.35                                               # avanço da laje do modelo 1 na frente (a jardineira)
_px = min(max(POCO[0], XB0), XB1)                           # ponto da fachada mais perto do poço
ATE_POCO = float(np.hypot(_px - POCO[0], YB0 - POCO[1]) - POCO_R)   # da fachada até a boca do poço
ATE_ESCADA = DA_BEIRA - 1.60                                  # do pé da escada até o banheiro
VAGA = (T_X1 - XB1, T_YT - T_YF)                              # estacionamento: comprimento ao longo do muro e fundo coberto

MODELOS = {
    1: {'nome': 'Pedra clara e jardineira',
        'desc': 'Fachada em filete de pedra clara, nicho branco, portas de madeira, laje reta com jardineira de pendentes.',
        'parede': 'house_white', 'fachada': 'filete', 'fundo': 'filete', 'porta': 'wood_z', 'bancada': 'quartzo',
        'cobertura': 'laje_jardineira', 'luz': 'arandela', 'barrado': None, 'ripado': False},
    2: {'nome': 'Tijolinho e telha',
        'desc': 'Tijolo como os pilares da churrasqueira, um telhado só de uma água com o estacionamento ao lado, banheiros padrão com box.',
        'parede': 'brick', 'fachada': 'brick', 'fundo': 'brick', 'porta': 'wood_z', 'bancada': 'granite',
        'cobertura': 'telha_garagem', 'luz': 'arandela', 'barrado': None, 'ripado': False},
    3: {'nome': 'Tropical ripado',
        'desc': 'Paredes verde-musgo, ripado de madeira na fachada, pergolado de madeira com trepadeira florida e teto-jardim.',
        'parede': 'chapa_verde', 'fachada': 'chapa_verde', 'fundo': 'filete', 'porta': 'wood_z', 'bancada': 'quartzo',
        'cobertura': 'pergolado', 'luz': 'arandela', 'barrado': None, 'ripado': True},
    4: {'nome': 'Moderno de cimento queimado',
        'desc': 'Cimento queimado, portas e esquadrias pretas, marquise fina com fita de luz, bancada de granito preto.',
        'parede': 'cimento_queimado', 'fachada': 'cimento_queimado', 'fundo': 'laca_grafite', 'porta': 'aluminio_preto', 'bancada': 'granite',
        'cobertura': 'laje_platibanda', 'luz': 'fita', 'barrado': None, 'ripado': False},
    5: {'nome': 'Fazenda',
        'desc': 'Parede branca com barrado de pedra, telhado de duas águas de telha colonial (como o do poço), portas azul-marinho e lampiões.',
        'parede': 'house_white', 'fachada': 'house_white', 'fundo': 'house_white', 'porta': 'pintura_marinho',
        'bancada': 'stone_cut', 'cobertura': 'telha_duas_aguas', 'luz': 'lampiao', 'barrado': ('filete', 0.60), 'ripado': False},
}


def construir(geo, P, rng, modelo=1):
    """Põe o banheiro no modelo (geo.box etc.). Chamar depois de tirar o que estava no lugar."""
    E = MODELOS[modelo]
    if modelo == 4 and 'cimento_queimado' not in geo.MATS:
        geo.m_plain('cimento_queimado', (0.30, 0.30, 0.29), 0.35, noise=0.10, nscale=2.5)
    box, tube, cyl, ellipsoid, beam, quad, tile_roof = geo.box, geo.tube, geo.cyl, geo.ellipsoid, geo.beam, geo.quad, geo.tile_roof
    zp = LOW + PD

    def parede(mat, x0, x1, y0, y1, z0, z1):
        """Parede com barrado embaixo, se o modelo tiver (as duas caixas só se encostam: sem faces coincidentes)."""
        if E['barrado'] and z0 < LOW + E['barrado'][1] < z1:
            zb = LOW + E['barrado'][1]
            box(E['barrado'][0], x0, x1, y0, y1, z0, zb); box(mat, x0, x1, y0, y1, zb, z1)
        else:
            box(mat, x0, x1, y0, y1, z0, z1)

    # parede de trás (no muro lateral), laterais e paredes do nicho com as portas
    parede(E['parede'], XB0, XN0, YI1, YB1 - 0.005, LOW, zp)
    box(E['fundo'], XN0, XN1, YI1, YB1 - 0.005, LOW, zp)
    parede(E['parede'], XN1, XB1, YI1, YB1 - 0.005, LOW, zp)
    parede(E['parede'], XB0, XA0, YI0, YI1, LOW, zp)
    parede(E['parede'], XC1, XB1, YI0, YI1, LOW, zp)
    for xa, xb in ((XA1, XN0), (XN1, XC0)):
        parede(E['parede'], xa, xb, YI0, PORTA_Y[0], LOW, zp)
        parede(E['parede'], xa, xb, PORTA_Y[1], YI1, LOW, zp)
        box(E['parede'], xa, xb, PORTA_Y[0], PORTA_Y[1], LOW + PORTA_H, zp)
    # portas (fechadas), rentes à parede do lado do nicho, com puxador horizontal (acessível)
    for xf, s in ((XN0, -1), (XN1, 1)):
        x0_, x1_ = sorted((xf + s * 0.005, xf + s * 0.04))
        box(E['porta'], x0_, x1_, PORTA_Y[0] + 0.01, PORTA_Y[1] - 0.01, LOW + 0.01, LOW + PORTA_H - 0.01)
        xp = xf - s * 0.03
        box('inox', min(xp, xf) - 0.008, max(xp, xf) + 0.008, PORTA_Y[1] - 0.55, PORTA_Y[1] - 0.12, LOW + 0.93, LOW + 0.96)
        if modelo == 5:                                   # batentes brancos em volta da porta
            for a, b, c, d in ((PORTA_Y[0] - 0.06, PORTA_Y[0], LOW, LOW + PORTA_H + 0.06),
                               (PORTA_Y[1], PORTA_Y[1] + 0.06, LOW, LOW + PORTA_H + 0.06),
                               (PORTA_Y[0], PORTA_Y[1], LOW + PORTA_H, LOW + PORTA_H + 0.06)):
                xa_, xb_ = sorted((xf + s * 0.002, xf + s * 0.02))
                box('esquadria_branca', xa_, xb_, a, b, c, d)
    # fachada dos dois banheiros, com o basculante no alto
    for xa, xb, xc in ((XB0, XN0, (XA0 + XA1) / 2), (XN1, XB1, (XC0 + XC1) / 2)):
        y0_, y1_ = YB0, YI0
        j0, j1 = xc - JAN_L / 2, xc + JAN_L / 2
        parede(E['fachada'], xa, j0, y0_, y1_, LOW, zp); parede(E['fachada'], j1, xb, y0_, y1_, LOW, zp)
        parede(E['fachada'], j0, j1, y0_, y1_, LOW, JAN_Z); box(E['fachada'], j0, j1, y0_, y1_, JAN_Z + JAN_H, zp)
        box('stone_cut', j0 - 0.03, j1 + 0.03, y0_ - 0.04, y0_, JAN_Z - 0.03, JAN_Z)          # peitoril
        caix = 'aluminio_preto' if modelo == 4 else 'esquadria_branca'
        for a, b, c, d in ((j0, j0 + 0.03, JAN_Z, JAN_Z + JAN_H), (j1 - 0.03, j1, JAN_Z, JAN_Z + JAN_H),
                           (j0, j1, JAN_Z, JAN_Z + 0.03), (j0, j1, JAN_Z + JAN_H - 0.03, JAN_Z + JAN_H)):
            box(caix, a, b, y1_ - 0.10, y1_ - 0.06, c, d)
        box('vidro_jateado', j0 + 0.03, j1 - 0.03, y1_ - 0.085, y1_ - 0.075, JAN_Z + 0.03, JAN_Z + JAN_H - 0.03)
        if E['ripado']:                                   # ripado de madeira na frente da fachada
            for xx in np.arange(xa + 0.04, xb - 0.02, 0.085):
                box('wood_z', xx, xx + 0.045, y0_ - 0.04, y0_ - 0.008, LOW + 0.06, zp - 0.04)
            for zz in (LOW + 0.30, zp - 0.30):
                box('wood_x', xa + 0.02, xb - 0.02, y0_ - 0.006, y0_ - 0.001, zz, zz + 0.05)
    # cobertura
    cob = E['cobertura']
    if cob in ('laje_jardineira', 'pergolado', 'laje_platibanda'):
        marq = {'laje_jardineira': 0.35, 'pergolado': 0.15, 'laje_platibanda': 0.0}[cob]
        yf = YB0 - marq
        lmat = 'cimento_queimado' if cob == 'laje_platibanda' else 'house_white'
        box(lmat, XB0, XB1, yf, YB1 - 0.005, zp, ZT)
        if cob == 'laje_jardineira':
            box('stone_cut', XB0, XB1, yf - 0.02, yf + 0.005, ZT - 0.05, ZT + 0.03)
            box('concrete', XB0, XB1, yf, yf + 0.40, ZT, ZT + 0.32)
            box('mulch', XB0 + 0.04, XB1 - 0.04, yf + 0.04, yf + 0.36, ZT + 0.30, ZT + 0.31)
            P.vine_top('leaf_vine_light', XB0 + 0.05, XB1 - 0.05, yf - 0.06, yf + 0.10, ZT + 0.30, rng, density=520, leaf=0.07, hang=0.75)
            for xx in np.arange(XB0 + 0.35, XB1 - 0.2, 0.62):
                P.mound('leaf_fern', (xx + rng.uniform(-0.08, 0.08), yf + 0.20, ZT + 0.31), rng, n=18, L=0.5, W=0.1, e=(0.0, 1.1), droop=1.1, r0=0.05)
        elif cob == 'pergolado':
            box('wood_x', XB0 - 0.02, XB1 + 0.02, yf - 0.03, yf, zp, ZT)                     # testeira de madeira
            box('grass', XB0 + 0.08, XB1 - 0.08, yf + 0.08, YB1 - 0.08, ZT, ZT + 0.06)      # teto-jardim
            box('wood_x', XB0, XB1, yf - 0.03, yf + 0.06, ZT, ZT + 0.12)
            yp = YB0 - 1.25                                                                 # pergolado na frente
            for xx in (XN0 - 0.10, XN1 + 0.10):
                box('wood_z', xx - 0.06, xx + 0.06, yp - 0.06, yp + 0.06, LOW, zp + 0.05)
            box('wood_x', XN0 - 0.35, XN1 + 0.35, yp - 0.05, yp + 0.05, zp - 0.10, zp + 0.05)
            for xx in np.arange(XN0 - 0.30, XN1 + 0.31, 0.30):
                box('wood_y', xx - 0.025, xx + 0.025, yp - 0.20, yf, zp + 0.05, zp + 0.17)
            P.vine_top('leaf_vine', XN0 - 0.30, XN1 + 0.30, yp - 0.15, yf - 0.05, zp + 0.18, rng, density=150, leaf=0.11,
                       hang=0.55, flower='flower_red')
            for xx in (XN0 - 0.10, XN1 + 0.10):
                tube('bark_cane', [(xx + 0.08, yp, LOW), (xx + 0.09, yp + 0.02, LOW + 1.2), (xx + 0.07, yp, zp + 0.15)], 0.02, seg=5)
                P.vine_wall('leaf_vine', xx - 0.15, xx + 0.15, LOW + 0.2, zp, yp - 0.07, -1, rng, density=140, cover=0.5)
        else:                                                                               # platibanda e marquise fina
            for a, b, c, d in ((XB0, XB1, yf, yf + 0.10), (XB0, XB1, YB1 - 0.105, YB1 - 0.005),
                               (XB0, XB0 + 0.10, yf + 0.10, YB1 - 0.105), (XB1 - 0.10, XB1, yf + 0.10, YB1 - 0.105)):
                box('cimento_queimado', a, b, c, d, ZT, ZT + 0.20)
            box('cimento_queimado', XN0 - 0.45, XN1 + 0.45, YB0 - 0.90, YB0, zp + 0.02, zp + 0.10)  # lâmina sobre a entrada
            box('bulb', XN0 - 0.40, XN1 + 0.40, YB0 - 0.86, YB0 - 0.84, zp + 0.005, zp + 0.02)
    elif cob == 'telha_garagem':
        # uma água só, banheiros + estacionamento: alta no muro do barracão, cai para o quintal, calha na frente
        zr = lambda y: z_telhado(y) - 0.13                                                 # embaixo dos caibros
        box('forro', XB0, XB1, YB0, YB1 - 0.005, zp, zp + 0.06)
        box(E['fachada'], XB0, XB1, YB0, YI0, zp, zr(YB0))                                  # frente até o telhado
        box(E['parede'], XB0, XB1, YI1, YB1 - 0.005, zp, zr(YI1))                           # fundo até o telhado
        for xq in (XB0, XB0 + PE, XB1 - PE, XB1):                                           # oitões das pontas
            quad(E['parede'], (xq, YB0, zp), (xq, YB1 - 0.005, zp), (xq, YB1 - 0.005, zr(YB1 - 0.005) + 0.10), (xq, YB0, zr(YB0) + 0.10))
        v = np.array([0, -1.0, -T_S]); v /= np.linalg.norm(v)
        tile_roof('rooftile', (T_X0, T_YT, z_telhado(T_YT)), (1, 0, 0), v, T_X1 - T_X0, (T_YT - T_YF) * math.sqrt(1 + T_S * T_S))
        for xr in np.arange(T_X0 + 0.10, T_X1 - 0.05, 0.60):                                # caibros
            if XB0 + 0.05 < xr < XB1 - 0.05:                                                # dentro dos banheiros: só o beiral
                beam('wood_y', (xr, T_YF + 0.02, z_telhado(T_YF + 0.02) - 0.08), (xr, YB0, z_telhado(YB0) - 0.08), 0.06, 0.10)
            else:
                beam('wood_y', (xr, T_YF + 0.02, z_telhado(T_YF + 0.02) - 0.08), (xr, T_YT - 0.02, z_telhado(T_YT - 0.02) - 0.08), 0.06, 0.10)
        zf = zr(T_YP)                                                                       # estacionamento: viga e pilares da frente
        box('wood_x', XB1, T_X1, T_YP - 0.08, T_YP + 0.08, zf - 0.20, zf)
        for xx in T_PILARES:
            box('wood_z', xx - 0.08, xx + 0.08, T_YP - 0.08, T_YP + 0.08, LOW, zf - 0.20)
        zm = zr(T_YT - 0.10)                                                                # viga e pilares encostados no muro
        box('wood_x', XB1, T_X1, T_YT - 0.18, T_YT - 0.02, zm - 0.20, zm)
        for xx in T_PILARES_MURO:
            box('wood_z', xx - 0.08, xx + 0.08, T_YT - 0.18, T_YT - 0.02, LOW, zm - 0.20)
        box('wood_x', T_X0, T_X1, T_YF, T_YF + 0.03, z_telhado(T_YF) - 0.16, z_telhado(T_YF) - 0.01)   # testeira da frente
        for xq in (T_X0, T_X1):                                                             # testeiras das pontas
            beam('wood_y', (xq, T_YF, z_telhado(T_YF) - 0.07), (xq, T_YT, z_telhado(T_YT) - 0.07), 0.03, 0.16)
        zc_ = z_telhado(T_YF)                                                               # calha na frente e o cano
        box('metal_dark', T_X0, T_X1, T_YF - 0.15, T_YF, zc_ - 0.13, zc_ - 0.01)
        box('metal_dark', T_X1 - 0.30, T_X1 - 0.22, T_YF - 0.12, T_YF - 0.04, LOW, zc_ - 0.12)
        g = GARAGEM                                                                         # piso do estacionamento
        box('stone_cut', g[0], g[1], g[2], g[3], LOW - 0.01, LOW + 0.012)
    elif cob == 'telha_uma_agua':
        s = 0.30; ye = YB0 - 0.60; ze = zp + 0.10
        z = lambda y: ze + s * (y - ye)
        box('forro', XB0, XB1, YB0, YB1 - 0.005, zp, zp + 0.06)
        for xx in (XB0, XB1):                                                               # oitões de tijolo
            x0_, x1_ = (xx, xx + PE) if xx == XB0 else (xx - PE, xx)
            for xq in (x0_, x1_):
                quad('brick', (xq, YB0, zp), (xq, YB1 - 0.005, zp), (xq, YB1 - 0.005, z(YB1 - 0.005)), (xq, YB0, z(YB0)))
            quad('brick', (x0_, YB0, z(YB0)), (x1_, YB0, z(YB0)), (x1_, YB0, zp), (x0_, YB0, zp))
        box('brick', XB0, XB1, YB0, YI0, zp, z(YB0) - 0.02)                                 # frente até o telhado
        box('brick', XB0, XB1, YI1, YB1 - 0.005, zp, z(YI1) - 0.02)                         # fundo até o telhado
        for xx in np.arange(XB0 + 0.05, XB1, 0.48):                                         # caibros aparentes no beiral
            beam('wood_y', (xx, YB1 - 0.01, z(YB1 - 0.01) - 0.06), (xx, ye + 0.02, z(ye + 0.02) - 0.06), 0.05, 0.08)
        box('wood_x', XB0 - 0.25, XB1 + 0.25, ye, ye + 0.03, z(ye) - 0.14, z(ye) - 0.02)    # testeira
        v = np.array([0, -1.0, -s]); v /= np.linalg.norm(v)
        tile_roof('rooftile', (XB0 - 0.25, YB1 + 0.02, z(YB1 + 0.02)), (1, 0, 0), v, LARG + 0.5, (YB1 + 0.02 - ye) * math.sqrt(1 + s * s))
    elif cob == 'telha_duas_aguas':
        s = 0.27; ov = 0.35; xm = (XB0 + XB1) / 2
        zr = zp + 0.10 + s * (LARG / 2 + ov)                                                # cumeeira
        zx = lambda x: zr - s * abs(x - xm)
        box('forro', XB0, XB1, YB0, YB1 - 0.005, zp, zp + 0.06)
        for yy in (YB0, YB1 - 0.005):                                                       # oitões brancos (frente e fundo)
            quad('house_white', (XB0, yy, zp), (XB1, yy, zp), (xm, yy, zx(xm) - 0.04), (xm, yy, zx(xm) - 0.04))
        ya, yb = YB1 + 0.25, YB0 - 0.75
        for sgn in (1, -1):
            v = np.array([sgn * 1.0, 0, -s]); v /= np.linalg.norm(v)
            u = (0, -1, 0) if sgn > 0 else (0, 1, 0)
            p0 = (xm, ya, zr) if sgn > 0 else (xm, yb, zr)
            tile_roof('rooftile', p0, u, v, ya - yb, (LARG / 2 + ov) * math.sqrt(1 + s * s))
            for yy in np.arange(yb + 0.1, ya, 0.55):                                        # caibros
                beam('wood_y', (xm, yy, zr - 0.07), (xm + sgn * (LARG / 2 + ov - 0.05), yy, zx(xm + sgn * (LARG / 2 + ov - 0.05)) - 0.07), 0.05, 0.08)
        tube('rooftile', [(xm, yb, zr + 0.05), (xm, ya, zr + 0.05)], 0.07, seg=8)            # cumeeira
        for xx in (XN0 - 0.10, XN1 + 0.10):                                                 # mãos-francesas da varanda
            box('wood_z', xx - 0.06, xx + 0.06, yb + 0.25, yb + 0.37, LOW, zx(xx) - 0.12)
        box('wood_x', XN0 - 0.4, XN1 + 0.4, yb + 0.25, yb + 0.37, zx(XN0 - 0.4) - 0.24, zx(XN0 - 0.4) - 0.12)
    # nicho da pia: piso de pedra, bancada acessível com duas cubas, torneiras de alavanca, espelhos e pendentes
    box('stone_cut', XN0 - 0.15, XN1 + 0.15, YB0 - PISO_FRENTE, YI1, LOW, LOW + 0.025)
    box(E['bancada'], XN0, XN1, YI1 - BANC_P, YI1, BANC_Z - 0.04, BANC_Z)
    for cx, cy in CUBAS:
        cyl('louca', (cx, cy, BANC_Z - 0.10), 0.17, 0.14, seg=28, r_top=0.20)
        cyl('pond_floor', (cx, cy, BANC_Z + 0.035), 0.16, 0.006, seg=28)
        tube('inox', [(cx, YI1 - 0.005, BANC_Z + 0.30), (cx, cy + 0.07, BANC_Z + 0.30), (cx, cy + 0.07, BANC_Z + 0.25)], 0.012, seg=10)
        box('inox', cx - 0.005, cx + 0.005, YI1 - 0.06, YI1 - 0.005, BANC_Z + 0.33, BANC_Z + 0.35)
        fr = 'aluminio_preto' if modelo == 4 else 'wood_x'
        box(fr, cx - 0.30, cx + 0.30, YI1 - 0.025, YI1 - 0.005, LOW + 0.88, LOW + 1.80)
        box('espelho', cx - 0.27, cx + 0.27, YI1 - 0.032, YI1 - 0.025, LOW + 0.91, LOW + 1.77)
        yl = YI1 - 0.75
        tube('metal_dark', [(cx, yl, zp), (cx, yl, LOW + 2.0)], 0.005, seg=4)
        cyl('metal_dark', (cx, yl, LOW + 1.88), 0.12, 0.12, seg=18, r_top=0.03, cap=False)
        ellipsoid('bulb', (cx, yl, LOW + 1.90), (0.05, 0.05, 0.06), seg=10, rings=6)
    # luzes da fachada
    for xx in (XN0 - 0.25, XN1 + 0.25):
        if E['luz'] == 'arandela':
            box('metal_dark', xx - 0.05, xx + 0.05, YB0 - 0.07, YB0, LOW + 1.80, LOW + 2.02)
            box('bulb', xx - 0.035, xx + 0.035, YB0 - 0.08, YB0 - 0.07, LOW + 1.84, LOW + 1.98)
        elif E['luz'] == 'lampiao':
            tube('metal_dark', [(xx, YB0, LOW + 1.95), (xx, YB0 - 0.22, LOW + 1.95)], 0.012, seg=6)
            cyl('metal_dark', (xx, YB0 - 0.22, LOW + 1.62), 0.07, 0.03, seg=8)
            cyl('vidro', (xx, YB0 - 0.22, LOW + 1.65), 0.07, 0.20, seg=8, r_top=0.08)
            ellipsoid('bulb', (xx, YB0 - 0.22, LOW + 1.74), (0.035, 0.035, 0.05), seg=8, rings=5)
            cyl('metal_dark', (xx, YB0 - 0.22, LOW + 1.85), 0.10, 0.08, seg=8, r_top=0.02)
    # canteiros na frente dos dois banheiros
    for lado, (xa, xb) in enumerate(((XB0, XN0 - 0.15), (XN1 + 0.15, XB1))):
        if modelo == 2 and not CANTEIRO_LADOS[lado]:
            continue
        y0_ = YB0 - CANTEIRO
        box('stone_cut', xa, xa + 0.04, y0_, YB0 - 0.045, LOW, LOW + 0.12)
        box('stone_cut', xb - 0.04, xb, y0_, YB0 - 0.045, LOW, LOW + 0.12)
        box('stone_cut', xa, xb, y0_, y0_ + 0.04, LOW, LOW + 0.12)
        box('mulch', xa + 0.04, xb - 0.04, y0_ + 0.04, YB0 - 0.045, LOW, LOW + 0.09)
        n = max(2, int((xb - xa) / 0.42))
        for k, xx in enumerate(np.linspace(xa + 0.22, xb - 0.22, n)):
            c = (xx, YB0 - CANTEIRO / 2, LOW + 0.09)
            if modelo == 3:
                (P.pacova if k % 2 == 0 else P.moreia)(c, rng, 0.8)
            elif modelo == 4:
                P.mound('leaf_dracena', c, rng, n=10, L=0.55, W=0.05, shape='lance', e=(1.0, 1.4), droop=0.3)
            else:
                (P.moreia if k % 2 == 0 else P.xanadu)(c, rng, 0.85 if k % 2 == 0 else 0.7)


def topo(modelo=1):
    """Ponto mais alto do banheiro, acima do 0,00 da churrasqueira."""
    cob = MODELOS[modelo]['cobertura']
    if cob == 'telha_garagem':
        return z_telhado(T_YT) + 0.15
    if cob == 'telha_uma_agua':
        return LOW + PD + 0.10 + 0.30 * (YB1 - (YB0 - 0.60))
    if cob == 'telha_duas_aguas':
        return LOW + PD + 0.10 + 0.27 * (LARG / 2 + 0.35)
    return ZT + (0.32 if cob == 'laje_jardineira' else 0.20 if cob == 'laje_platibanda' else 0.12)


def resumo():
    return {'largura': LARG, 'fundo': FUNDO, 'banheiro': (CAB, LIVRE), 'nicho': NICHO, 'pe_direito': PD, 'portas': PORTA_Y,
            'da_beira': (XB0 - EDGE, XB1 - EDGE), 'ate_poco': ATE_POCO, 'ate_escada': ATE_ESCADA, 'vaga': VAGA,
            'telhado': {'x': (T_X0 - EDGE, T_X1 - EDGE), 'do_muro': YB1 - T_YF, 'alto': z_telhado(T_YT) - LOW,
                        'beiral': z_telhado(T_YF) - LOW, 'caimento': T_S},
            'topos': {m: round(topo(m), 2) for m in MODELOS}, 'x': (XB0, XB1), 'y': (YB0, YB1)}


if __name__ == '__main__':
    for k, v in resumo().items():
        print(k, v)
