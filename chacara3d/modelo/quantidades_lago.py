"""Números e quantidades do laguinho para a ficha técnica do pedreiro, tirados do obra.py.

    python3 quantidades_lago.py          # imprime tudo
    from quantidades_lago import numeros # dicionário (usado pelo desenhos_obra.py)

Medidas em metros a partir da beira da laje (u) e do muro lateral do lado da amendoeira (v). As quantidades de
material são estimativas para compra, com folga; o pedreiro e o engenheiro fecham.
"""
import math
import numpy as np
import obra as O

PASSO = 0.01


def _grade():
    xs = np.arange(O.LAGO[:, 0].min() - 0.02, O.LAGO[:, 0].max() + 0.02, PASSO)
    ys = np.arange(O.LAGO[:, 1].min() - 0.02, O.LAGO[:, 1].max() + 0.02, PASSO)
    X, Y = np.meshgrid(xs, ys)
    D = O.dentro_lago(X, Y)
    P = np.where(D, O.prof_lago(X, Y), 0.0)
    return X, Y, D, P


def _comprimento(pts):
    return float(np.sqrt(((np.diff(pts, axis=0)) ** 2).sum(axis=1)).sum())


def numeros():
    n = {}
    X, Y, D, P = _grade()
    a = PASSO * PASSO
    n['area'] = D.sum() * a
    n['volume'] = (P * D).sum() * a
    n['fundo_area'] = ((P > O.PROF - 0.03) & D).sum() * a
    n['perimetro'] = _comprimento(np.vstack([O.LAGO, O.LAGO[:1]]))
    n['u0'], n['u1'] = float(O.LAGO[:, 0].min() - O.EDGE), float(O.LAGO[:, 0].max() - O.EDGE)
    n['v0'], n['v1'] = float(O.LAGO[:, 1].min()), float(O.LAGO[:, 1].max())
    # comprimento no eixo maior (como se mede com trena de ponta a ponta)
    c = O.LAGO - O.LAGO.mean(axis=0); w, V = np.linalg.eigh(np.cov(c.T)); eixo = V[:, np.argmax(w)]
    pr = c @ eixo; n['comprimento'] = float(pr.max() - pr.min())
    pr2 = c @ np.array([-eixo[1], eixo[0]]); n['largura_max'] = float(pr2.max() - pr2.min())
    # escavação: água + 6 cm (nível da água abaixo do chão) + 6 cm (areia e mantas)
    n['escavacao'] = ((P + 0.12) * D).sum() * a
    n['escavacao_solta'] = n['escavacao'] * 1.3
    # folgas
    dpoco = np.hypot(O.LAGO[:, 0] - O.POCO[0], O.LAGO[:, 1] - O.POCO[1]) - O.POCO_R
    dtronco = np.hypot(O.LAGO[:, 0] - O.ARVORE[0], O.LAGO[:, 1] - O.ARVORE[1])
    n['folga_poco'] = float(dpoco.min())
    n['folga_tronco'] = float(dtronco.min())
    n['folga_muro_pe'] = float(min(x - O.EDGE - O.muro_pe(y) for x, y in O.LAGO))
    n['folga_pergolado'] = float(O.PERGOLADO_X0 + 0.05 - O.LAGO[:, 0].max())
    n['folga_muro_lateral'] = n['v0']
    n['folga_escada'] = float(O.ESCADA_Y0 - O.LAGO[:, 1].max())
    # zonas rasas
    n['raso_tronco_ate'] = O.ARVORE_RASO
    n['rampa_tronco_ate'] = O.ARVORE_RAMPA
    n['raso_muro_ate_u'] = float(O.FACE - O.EDGE + O.ARRIMO_RASO)
    n['rampa_muro_ate_u'] = float(O.FACE - O.EDGE + O.ARRIMO_RAMPA)
    zona_t = D & (np.hypot(X - O.ARVORE[0], Y - O.ARVORE[1]) < O.ARVORE_RAMPA)
    n['area_perto_tronco'] = zona_t.sum() * a
    # manta: retângulo que cobre o lago + 2 vezes a escavação mais funda + 30 cm de cada lado para prender atrás das
    # pedras + 1 m no lado da cascata (a manta sobe pelo barranco até a laje da cascata)
    pmax = float(P.max()) + 0.12
    n['manta_c'] = (n['u1'] - n['u0']) + 2 * pmax + 0.6 + 1.0
    n['manta_l'] = (n['v1'] - n['v0']) + 2 * pmax + 0.6
    n['areia'] = n['area'] * 1.25 * 0.05
    # muro de pedras empilhadas: do muro da amendoeira até a escada
    vs = np.linspace(0.0, O.ESCADA_Y0, 400)
    pe = np.array([O.muro_pe(v) for v in vs])
    n['muro_pe_comprimento'] = _comprimento(np.c_[pe, vs])
    alt = O.MURO_TOPO - O.LOW
    topo = np.maximum(0.15, pe - O.TOPO_RECUO)
    incl = np.hypot(alt, pe - topo)
    passo_v = vs[1] - vs[0]
    n['muro_altura'] = alt
    n['muro_face'] = float((incl * np.hypot(1, np.gradient(pe, vs))).sum() * passo_v)
    # volume de pedra: no trecho reto uma fiada de ~30 cm de fundo na frente do barranco; na barriga da amendoeira as
    # pedras vão da frente até a beira da laje (menos o tronco, que fica livre num raio de 30 cm)
    vol = 0.0
    zs = np.linspace(O.LOW, O.MURO_TOPO, 40); dz = zs[1] - zs[0]
    for v in vs:
        for z in zs:
            f = float(O.muro_frente(v, z))
            if O.muro_pe(v) < 0.6:
                fundo = 0.30
            else:
                fundo = max(0.30, f - 0.05)
                d_t = abs(v - O.ARVORE[1])
                if d_t < 0.30:
                    fundo -= 2 * math.sqrt(max(0.0, 0.30 ** 2 - d_t ** 2)) * 0.5
            vol += fundo * dz * passo_v
    n['muro_pedra_m3'] = vol
    n['muro_pedra_t'] = vol * 1.6                     # pedra arredondada empilhada (com os vãos): ~1,6 t/m³
    n['muro_brita_m3'] = n['muro_face'] * 0.10        # camada de 10 cm de brita atrás das pedras (onde for barranco)
    # borda do lago: pedras de 20 a 45 cm encostadas; ~0,33 m de contorno por pedra, mais um quarto de segundo nível
    n['borda_pedras'] = int(round(n['perimetro'] / 0.33 * 1.25 / 5.0) * 5)
    n['borda_t'] = n['borda_pedras'] * 0.015 * 2.65    # ~15 litros de pedra maciça por peça (uns 40 kg)
    # canteiro em volta (sem a água)
    cx = O.CANTEIRO
    area_c = 0.5 * abs(np.dot(cx[:, 0], np.roll(cx[:, 1], 1)) - np.dot(cx[:, 1], np.roll(cx[:, 0], 1)))
    n['canteiro_area'] = float(area_c - n['area'])
    # guarda-corpo no trecho do lago: piso da laje, 10 cm antes da beira, do muro da amendoeira até a escada, contornando
    # o tronco da amendoeira (obra.GUARDA_LINHA); postes a cada 1,25 no máximo e balaústres com vão de até 9 cm
    gl = np.array(O.GUARDA_LINHA, float); segs = np.sqrt((np.diff(gl, axis=0) ** 2).sum(axis=1))
    n['guarda_comp'] = float(segs.sum())
    n['guarda_postes'] = int(sum(max(1, round(L / 1.25)) for L in segs) + 1)
    n['guarda_balaustres'] = int(sum(math.ceil(L / 0.115) - 1 for L in segs))
    n['guarda_vao_postes'] = float(segs[0] / max(1, round(segs[0] / 1.25)))
    n['guarda_espaco'] = float(segs[0] / math.ceil(segs[0] / 0.115))
    n['guarda_desvio_u'] = float(gl[:, 0].min())
    # cascata
    co = O.CASCATA['origem']; w2 = O.CASCATA['largura'] / 2
    n['cascata_v0'], n['cascata_v1'] = co[1] - w2, co[1] + w2
    av, zt = O.CASCATA['lajes'][0]
    n['cascata_topo'] = zt - O.LOW
    n['cascata_avanco'] = av
    n['cascata_frente_u'] = float(O.muro_frente(co[1], zt) + av)
    n['cascata_trecho_manta'] = (co[1] - 0.60, co[1] + 0.60)
    # hidráulica e elétrica
    cf, sm, tm = O.CAIXA_FILTRO, O.SUMIDOURO, O.TOMADA
    n['filtro'] = (cf[0] - O.EDGE, cf[1]); n['sumidouro'] = (sm[0] - O.EDGE, sm[1]); n['tomada'] = (tm[0] - O.EDGE, tm[1])
    n['filtro_agua'] = float(O.dist_borda(cf[0], cf[1])) - 0.20
    n['sumidouro_agua'] = float(O.dist_borda(sm[0], sm[1])) - 0.30
    n['tomada_agua'] = float(O.dist_borda(tm[0], tm[1]))
    n['sumidouro_poco'] = float(math.hypot(sm[0] - O.POCO[0], sm[1] - O.POCO[1]) - O.POCO_R - 0.30)
    # cano da cascata: da bomba (parte funda, perto da ponta) até a caixa do filtro, do filtro ao longo do muro lateral
    # até o canto com o muro de pedras e de lá subindo atrás das pedras até a cascata
    k = np.unravel_index(np.argmax(np.where(D, P - 0.001 * np.hypot(X - cf[0], Y - cf[1]), -1)), P.shape)
    bomba = (float(X[k]), float(Y[k]))
    n['bomba'] = (bomba[0] - O.EDGE, bomba[1])
    c1 = math.hypot(cf[0] - bomba[0], cf[1] - bomba[1]) + 0.6
    c2 = (cf[0] - O.EDGE - 0.35) + (co[1] - 0.12) + 1.0
    n['cano_cascata'] = c1 + c2
    n['cano_ladrao'] = float(math.hypot(sm[0] - O.LAGO[:, 0].max(), sm[1] - 1.6)) + 0.5
    n['eletroduto'] = (tm[0] - cf[0]) + 1.5
    return n


def br(v, c=2):
    return f'{v:.{c}f}'.replace('.', ',')


if __name__ == '__main__':
    for k, v in numeros().items():
        if isinstance(v, tuple):
            print(f'{k:22s}', ' / '.join(br(x) for x in v))
        else:
            print(f'{k:22s}', br(v) if isinstance(v, float) else v)
