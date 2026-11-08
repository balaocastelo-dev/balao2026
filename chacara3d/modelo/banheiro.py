"""Banheiro duplo externo do quintal de baixo: estudo 4, o modelo 2 com chuveiro e um telhado só com a garagem (08/11/2026).

Histórico: no estudo 3 o Thiago viu 5 modelos com a mesma planta e escolheu o 2 (tijolinho e telha), pedindo chuveiro
nos banheiros e o banheiro emendado na garagem, debaixo de um telhado só. Com o chuveiro, os banheiros para
cadeirante cresceram para 1,70 x 2,30 m livres. Os outros modelos continuam aqui como alternativa.

Pedidos do Thiago: dois banheiros com a pia lavabo central do lado de fora, do outro lado da escada que sobe para a
churrasqueira; de frente para o poço, a 1 m do muro de pedra da churrasqueira, com as costas no muro lateral. No
estudo 3 ele escolheu o "meio-termo": nicho da pia 50% maior (2,10 m) e banheiros acessíveis para cadeirante (1,50 m
livres por dentro, NBR 9050); o banheiro passa 0,65 m da linha da cobertura da garagem, que encolhe. O formato é
o mesmo nos 5 modelos; muda o estilo (MODELOS). Fonte única das medidas para o render_banheiro.py (fotos) e o
desenho_banheiro.py (planta).

Eixos e níveis como no obra.py (x saindo do muro de pedra para o quintal, y de um muro lateral ao outro); a
fachada fica ao longo de x, olhando para -y (para o poço).
"""
import math
import numpy as np
from obra import EDGE, FACE, LOW, LARGURA, POCO, POCO_R

AFASTAMENTO = 1.00                 # do muro de pedra (face da pedra) até o banheiro
PE, PI = 0.14, 0.12                # paredes de fora e de dentro (bloco rebocado)
NICHO = 2.10                       # largura livre do nicho da pia (meio-termo: 50% maior que no estudo 1)
CAB = 1.70                         # largura livre de cada banheiro: vaso, chuveiro e giro de 1,50 da cadeira de rodas
LIVRE = 2.30                       # fundo livre: chuveiro na frente, vaso no canto do fundo, giro de 1,50 sem pegar no vaso
LARG = 2 * PE + 2 * PI + NICHO + 2 * CAB                      # 5,62 ao longo da fachada
FUNDO = LIVRE + 2 * PE             # 2,14
XB0 = FACE + AFASTAMENTO           # lado do muro de pedra
XB1 = XB0 + LARG                   # lado da garagem
YB1 = LARGURA                      # costas no muro lateral do terreno
YB0 = YB1 - FUNDO                  # fachada, de frente para o poço
YI0, YI1 = YB0 + PE, YB1 - PE      # faces de dentro da frente e do fundo
XA0 = XB0 + PE; XA1 = XA0 + CAB    # banheiro 1 (lado do muro de pedra)
XN0 = XA1 + PI; XN1 = XN0 + NICHO  # nicho da pia
XC0 = XN1 + PI; XC1 = XC0 + CAB    # banheiro 2 (lado da garagem)
PD = 2.30                          # pé-direito
LAJE = 0.12
ZT = LOW + PD + LAJE               # topo da laje plana (modelos 1, 3 e 4), acima do 0,00 da churrasqueira
PORTA_L, PORTA_H = 0.90, 2.10      # folha de 0,90 (vão livre de 0,80 ou mais), abrindo para fora, para o nicho
PORTA_Y = (YI0 + 0.80, YI0 + 0.80 + PORTA_L)                  # atrás do chuveiro, antes da bancada
JAN_L, JAN_H, JAN_Z = 0.60, 0.40, LOW + 1.75                  # basculante no alto da fachada de cada banheiro
BANC_P, BANC_Z = 0.55, LOW + 0.80                             # bancada acessível: 0,80 de altura, livre embaixo
CUBAS = [(XN0 + NICHO * 0.27, YI1 - 0.28), (XN1 - NICHO * 0.27, YI1 - 0.28)]   # duas cubas na bancada de 2,10
CANTEIRO = 0.45
CHUV_X, CHUV_Y = 1.00, 0.95        # chuveiro sem degrau no canto da frente, do lado da parede de fora (mínimo 0,90 x 0,95)
BANCO = (0.70, 0.45, 0.46)         # banco articulado do chuveiro: comprimento, profundidade, altura
# telhado único com a garagem: o mesmo plano da cobertura de hoje (build.py: GZH, GS_ e 3,3 m de comprimento)
GZH, GS, G_COMP, G_FIM = 2.3, 0.212, 3.3, 58.7


def z_telhado(y):
    """Altura (acima do 0,00 da churrasqueira) da face de cima do telhado único, que cai do muro lateral para o poço."""
    return GZH - GS * (YB1 - y)


VASO_EIXO = 0.40                   # eixo do vaso a 0,40 da parede de trás, vaso encostado na parede lateral de fora
PISO_FRENTE = 0.90                                            # piso de pedra na frente do nicho (até perto dos pisantes)
MARQUISE = 0.35                                               # avanço da laje do modelo 1 na frente (a jardineira)
GARAGEM_X = 52.3                                              # começo da cobertura da garagem hoje (build.py)
ATE_POCO = YB0 - (POCO[1] + POCO_R)                           # da fachada até a boca do poço
NA_GARAGEM = XB1 - GARAGEM_X                                  # quanto o banheiro entra na linha da garagem

MODELOS = {
    1: {'nome': 'Pedra clara e jardineira',
        'desc': 'Fachada em filete de pedra clara, nicho branco, portas de madeira, laje reta com jardineira de pendentes.',
        'parede': 'house_white', 'fachada': 'filete', 'fundo': 'filete', 'porta': 'wood_z', 'bancada': 'quartzo',
        'cobertura': 'laje_jardineira', 'luz': 'arandela', 'barrado': None, 'ripado': False},
    2: {'nome': 'Tijolinho e telha',
        'desc': 'Tijolo como os pilares da churrasqueira, um telhado só com a garagem, varanda de madeira e chuveiro nos banheiros.',
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
        zr = lambda y: z_telhado(y) - 0.13                                                 # embaixo dos caibros
        box('forro', XB0, XB1, YB0, YB1 - 0.005, zp, zp + 0.06)
        box(E['fachada'], XB0, XB1, YB0, YI0, zp, zr(YB0))                                  # tijolo até o telhado
        box(E['parede'], XB0, XB1, YI1, YB1 - 0.005, zp, zr(YI1))
        zo = lambda y: z_telhado(y) - 0.03                                                 # oitões fecham até a telha
        for x0_, x1_ in ((XB0, XB0 + PE), (XB1 - PE, XB1)):                                # oitões das pontas
            for xq in (x0_, x1_):
                quad(E['parede'], (xq, YB0, zp), (xq, YB1 - 0.005, zp), (xq, YB1 - 0.005, zo(YB1)), (xq, YB0, zo(YB0)))
        beam('wood_y', (XB0 - 0.24, YB1, GZH - 0.07), (XB0 - 0.24, YB1 - 3.28, GZH - GS * 3.28 - 0.07), 0.03, 0.16)  # testeira da ponta
        vg = np.array([0, -1.0, -GS]); vg /= np.linalg.norm(vg)
        tile_roof('rooftile', (XB0 - 0.25, YB1, GZH), (1, 0, 0), vg, G_FIM - (XB0 - 0.25), G_COMP * math.sqrt(1 + GS * GS))
        for xr in np.arange(XB0 - 0.15, XB1 + 0.2, 0.6):                                   # caibros como os da garagem
            beam('wood_y', (xr, YB1 - 0.02, GZH - 0.08), (xr, YB1 - 3.28, GZH - GS * 3.28 - 0.08), 0.06, 0.1)
        zbm = GZH - GS * 3.0 - 0.13
        box('wood_x', XB0 - 0.25, G_FIM, 6.92, 7.08, zbm - 0.18, zbm)                     # viga da frente, uma só
        for xx in (XB0 - 0.10, XN0 - 0.10, XN1 + 0.10, XB1 + 0.10):                        # pilares da varanda
            box('wood_z', xx - 0.08, xx + 0.08, 6.92, 7.08, LOW, zbm - 0.18)
        box('wood_x', XB1, G_FIM, 9.9, 9.98, GZH - 0.32, GZH - 0.13)                       # viga do fundo da garagem
        box('stone_cut', XB1, G_FIM, 6.9, 9.98, LOW - 0.01, LOW + 0.012)                    # piso da garagem
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
    for xa, xb in ((XB0, XN0 - 0.15), (XN1 + 0.15, XB1)):
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
        return GZH + 0.05
    if cob == 'telha_uma_agua':
        return LOW + PD + 0.10 + 0.30 * (YB1 - (YB0 - 0.60))
    if cob == 'telha_duas_aguas':
        return LOW + PD + 0.10 + 0.27 * (LARG / 2 + 0.35)
    return ZT + (0.32 if cob == 'laje_jardineira' else 0.20 if cob == 'laje_platibanda' else 0.12)


def resumo():
    return {'largura': LARG, 'fundo': FUNDO, 'banheiro': (CAB, LIVRE), 'nicho': NICHO, 'pe_direito': PD, 'portas': PORTA_Y,
            'afastamento': AFASTAMENTO, 'ate_poco': ATE_POCO, 'na_garagem': NA_GARAGEM,
            'topos': {m: round(topo(m), 2) for m in MODELOS}, 'x': (XB0, XB1), 'y': (YB0, YB1)}


if __name__ == '__main__':
    for k, v in resumo().items():
        print(k, v)
