"""Cachorro vira-lata caramelo: malha, máscaras de cor, esqueleto, pesos e animações."""
import numpy as np
import bpy
import bmesh

import sdf
import cena
import cachorro_forma as cf
from cachorro_forma import P, junta, C, matriz_cranio, _suave

ORCAMENTO_TRIS = 9000
TRIS_CORPO = 8380

# cores de base (sRGB) — o motor pode trocar pelas máscaras
COR_PELO = (0.78, 0.52, 0.27)      # caramelo
COR_CLARO = (0.93, 0.83, 0.66)     # creme
COR_PELE = (0.16, 0.11, 0.10)      # trufa, almofadas, lábios
COR_OLHO = (0.10, 0.055, 0.03)
COR_LINGUA = (0.80, 0.38, 0.42)


def para_anatomico(v):
    """Blender -> (f, l, u)."""
    return np.stack([-v[:, 1], v[:, 0], v[:, 2]], axis=1)


def para_cranio(v):
    """Blender -> referencial do crânio (x, l, z)."""
    M = matriz_cranio()
    return (v - junta('occipital')[None]) @ M


def normais_vertice(ob):
    me = ob.data
    n = np.zeros(len(me.vertices) * 3)
    me.vertices.foreach_get('normal', n)
    return n.reshape(-1, 3)


def mascaras_corpo(v, n, F):
    """RGBA por vértice do corpo: R pelo principal, G claro, B pele, A comprimento do pelo."""
    a = para_anatomico(v)
    f, l, u = a[:, 0], a[:, 1], a[:, 2]
    h = para_cranio(v)
    xh, zh = h[:, 0], h[:, 2]
    reg = F.distancias_por_regiao(v)
    nz = n[:, 2]
    nl = n[:, 0]

    def perto(nome, larg=0.004):
        return _suave(larg, 0.0, reg[nome]) if nome in reg else np.zeros(len(v))

    # quanto cada vértice pertence à cabeça / patas (para o comprimento do pelo)
    na_cabeca = _suave(0.30, 0.36, f) * _suave(0.50, 0.56, u)
    G = np.zeros(len(v))
    # focinho: metade de baixo e lábios, queixo
    G = np.maximum(G, _suave(0.100, 0.135, xh) * _suave(0.020, -0.004, zh) * na_cabeca)
    # mandíbula, garganta e parte de baixo do pescoço
    eixo_a, eixo_b = P(0.200, 0, 0.432), P(0.322, 0, 0.574)
    d = eixo_b - eixo_a
    t = np.clip(((v - eixo_a) @ d) / (d @ d), 0, 1.3)
    proj = eixo_a[None] + t[:, None] * d[None]
    ventral = normalizar_l(np.array([0.0, -0.75, -0.66]))  # para baixo e para a frente
    vv = ((v - proj) @ ventral) / 0.06
    lat = np.abs(v[:, 0]) / 0.07
    tl = ((v - eixo_a) @ d) / (d @ d)
    no_pescoco = _suave(1.25, 1.0, tl) * _suave(0.01, 0.0, reg['pescoco'] - 0.004)
    G = np.maximum(G, _suave(0.15, 0.7, vv) * _suave(0.95, 0.45, lat) * _suave(0.17, 0.25, f) * no_pescoco)
    G = np.maximum(G, _suave(-0.012, -0.03, zh) * _suave(0.02, 0.07, xh) * na_cabeca)
    # peito entre as patas da frente
    G = np.maximum(G, _suave(0.20, 0.26, f) * _suave(0.42, 0.34, u) * _suave(0.07, 0.035, np.abs(l)))
    # barriga (normal para baixo, no tronco)
    no_tronco = _suave(-0.20, -0.12, f) * _suave(0.30, 0.22, f)
    G = np.maximum(G, _suave(-0.35, -0.75, nz) * no_tronco * _suave(0.42, 0.36, u))
    # parte de dentro das patas (normal apontando para o meio)
    for nome, lado in (('pata_fe', 1), ('pata_fd', -1), ('pata_te', 1), ('pata_td', -1),
                       ('coxa_e', 1), ('coxa_d', -1)):
        dono = perto(nome, 0.006)
        dentro = _suave(-0.15, -0.6, nl * lado)
        G = np.maximum(G, dono * dentro * _suave(0.36, 0.28, u))
    # patas (meias claras)
    G = np.maximum(G, _suave(0.075, 0.040, u))
    # ponta da cauda e embaixo dela
    pc = cf.pontos_cauda()
    comp = np.cumsum([0] + [np.linalg.norm(pc[i + 1] - pc[i]) for i in range(len(pc) - 1)])
    tcauda = parametro_polilinha(v, pc, comp / comp[-1])
    na_cauda = perto('cauda', 0.006)
    G = np.maximum(G, na_cauda * _suave(0.74, 0.86, tcauda))
    G = np.maximum(G, na_cauda * 0.6 * _suave(-0.3, -0.7, nz) * _suave(0.15, 0.3, tcauda))
    G = np.clip(G, 0, 1)

    B = np.zeros(len(v))
    # trufa
    B = np.maximum(B, _suave(0.0040, 0.0008, reg['nariz']) * _suave(0.180, 0.188, xh))
    # boca e lábios (borda da fenda)
    B = np.maximum(B, _suave(0.0125, 0.0080, np.abs(zh + 0.0255)) * _suave(0.100, 0.116, xh) * na_cabeca)
    # pálpebras (dentro da órbita)
    for lado in (1, -1):
        c, R = cf.olho_frame(lado)
        q = (v - c[None]) @ R
        s = np.array(cf.OLHO_SEMI) * np.array([1.25, 1.6, 1.35])
        B = np.maximum(B, _suave(1.15, 0.95, np.linalg.norm(q / s, axis=1)))
    # almofadas das patas
    B = np.maximum(B, _suave(0.010, 0.004, u) * _suave(-0.3, -0.7, nz))
    B = np.clip(B, 0, 1)

    R_ = (1 - G) * (1 - B)
    G_ = G * (1 - B)
    # comprimento do pelo: 1 no corpo, ~0.4 na cabeça e nas patas, 0 na pele
    perna_baixa = _suave(0.30, 0.22, u) * (1 - perto('tronco', 0.01))
    curto = np.maximum(na_cabeca * _suave(0.0, 0.03, f - 0.33), perna_baixa)
    A = (1 - 0.6 * curto) * (1 - B)
    return np.stack([R_, G_, B, A], axis=1)


def normalizar_l(v):
    return v / np.linalg.norm(v)


def parametro_polilinha(v, pts, ts):
    """Parâmetro (0-1) do ponto mais próximo numa polilinha."""
    melhor = np.full(len(v), np.inf)
    par = np.zeros(len(v))
    for i in range(len(pts) - 1):
        a, b = pts[i], pts[i + 1]
        d = b - a
        t = np.clip(((v - a) @ d) / (d @ d), 0, 1)
        q = a[None] + t[:, None] * d[None]
        dist = np.linalg.norm(v - q, axis=1)
        m = dist < melhor
        melhor[m] = dist[m]
        par[m] = ts[i] + t[m] * (ts[i + 1] - ts[i])
    return par


def construir(passo=0.0028):
    """Gera corpo, orelhas, olhos e língua, o esqueleto e os pesos. Devolve (malha, armadura)."""
    import esqueleto as E
    F = cf.forma()
    cmin, cmax = cf.caixa()
    v, q = sdf.extrair(F, cmin, cmax, passo)
    corpo = cena.malha_rapida('cachorro', v, q)
    g = corpo.vertex_groups.new(name='protege')
    w = protecao(v)
    for i in np.nonzero(w > 0.01)[0]:
        g.add([int(i)], float(w[i]), 'REPLACE')
    cena.reduzir(corpo, TRIS_CORPO, grupo='protege', fator_grupo=FATOR_PROTECAO)
    corpo.vertex_groups.clear()
    # melhora os triângulos (deslizando na superfície) e desfaz dobras da redução
    tris, arestas = cena.tris_e_arestas(corpo)
    vr = cena.coords(corpo)
    vr = sdf.relaxar(F, vr, arestas, iteracoes=2, lam=0.25, travados=_suave(0.4, 0.8, protecao(vr)))
    cena.por_coords(corpo, vr)
    cena.limpar_dobras(corpo, F)
    cena.sombrear_suave(corpo)
    # normais exatas da forma (gradiente da SDF) para o sombreado ficar liso
    cena.normais_personalizadas(corpo, F.gradiente(cena.coords(corpo)))

    arm = E.criar_armadura('cachorro_esqueleto', lista_ossos())
    esq = E.Esqueleto(arm)
    seg = {n: (esq.cab[n], esq.cau[n]) for n in esq.nomes}

    partes, cores, pesos = [], [], []
    # corpo
    vc = cena.coords(corpo)
    nc = normais_vertice(corpo)
    cores.append(mascaras_corpo(vc, nc, F))
    partes.append(corpo)
    dist = F.distancias_por_regiao(vc)
    nomes, W = E.pesos_regioes(vc, dist, ossos_por_regiao(), seg, tau=0.006, potencia=4.0)
    W = E.suavizar_pesos(corpo, W, iteracoes=3, alfa=0.5)
    W = dividir_mandibula(vc, nomes, W)
    pesos.append((nomes, W))
    # orelhas
    for s, lado in LADOS:
        ov, of, ou, pele = cf.orelha_malha(lado, nu=8, nv=6)
        ob = cena.malha('orelha', ov, of)
        acertar_normais(ob)
        cena.sombrear_suave(ob)
        A = (1 - pele) * 0.5
        # dentro da orelha: pele rosada com pelo claro ralo (metade pele, metade creme)
        cores.append(np.stack([1 - pele, 0.45 * pele, 0.55 * pele, A], axis=1))
        partes.append(ob)
        w_cab = _suave(0.14, 0.02, ou)
        w_ponta = _suave(cf.ORELHA_DOBRA - 0.10, cf.ORELHA_DOBRA + 0.08, ou)
        w_or = np.clip(1 - w_cab - w_ponta, 0, 1)
        pesos.append((['cabeca', f'orelha_{s}', f'orelha_{s}_ponta'], np.stack([w_cab, w_or, w_ponta], axis=1)))
    # olhos
    especiais = {}
    for s, lado in LADOS:
        c, R = cf.olho_frame(lado)
        ev, efc = cf.esfera(c, R, np.array(cf.OLHO_SEMI) * 0.97, seg=8, aneis=6)
        ob = cena.malha('olho', ev, efc)
        acertar_normais(ob)
        cena.sombrear_suave(ob)
        cores.append(np.zeros((len(ev), 4)))
        partes.append(ob)
        especiais[ob.name] = 'olho'
        pesos.append((['cabeca'], np.ones((len(ev), 1))))
    # língua
    lv, lfc = lingua_malha()
    ob = cena.malha('lingua', lv, lfc)
    acertar_normais(ob)
    cena.sombrear_suave(ob)
    cores.append(np.tile([0.0, 0.0, 1.0, 0.0], (len(lv), 1)))
    partes.append(ob)
    especiais[ob.name] = 'lingua'
    pesos.append((['lingua'], np.ones((len(lv), 1))))

    mats = {'pelo': cena.material('pelo', cena.lin_srgb(COR_PELO), 0.85),
            'olho': cena.material('olho', cena.lin_srgb(COR_OLHO), 0.08, especular=0.8),
            'lingua': cena.material('lingua', cena.lin_srgb(COR_LINGUA), 0.45)}
    for m in mats.values():
        m.use_backface_culling = True     # malhas fechadas: um lado só
    for ob, rgba, (nomes_p, Wp) in zip(partes, cores, pesos):
        ob.data.materials.clear()
        ob.data.materials.append(mats[especiais.get(ob.name, 'pelo')])
        cena.cor_vertice(ob, rgba)
        Wl = E.limitar_pesos(Wp, 4)
        E.aplicar_pesos(ob, nomes_p, Wl)
    final = cena.juntar(partes, 'cachorro')
    E.ligar_armadura(final, arm)
    return final, arm, F


FATOR_PROTECAO = 2.5


def protecao(v):
    """Peso (0-1) dos vértices que a redução deve poupar: boca, olhos, trufa e juntas."""
    h = para_cranio(v)
    xh, zh = h[:, 0], h[:, 2]
    w = np.zeros(len(v))
    na_cabeca = (np.abs(h[:, 1]) < 0.07) * _suave(-0.03, 0.0, xh)
    w = np.maximum(w, na_cabeca * _suave(0.016, 0.008, np.abs(zh + 0.0255)) * _suave(0.085, 0.10, xh))
    for lado in (1, -1):
        c, R = cf.olho_frame(lado)
        w = np.maximum(w, _suave(0.024, 0.012, np.linalg.norm(v - c[None], axis=1)))
    w = np.maximum(w, na_cabeca * _suave(0.17, 0.19, xh) * 0.7)
    # a cabeça inteira ganha mais triângulos (é o que mais se olha)
    w = np.maximum(w, 0.5 * _suave(0.11, 0.08, np.linalg.norm(h - np.array([0.08, 0.0, 0.01]), axis=1)))
    for nome in ('cotovelo', 'carpo', 'joelho', 'jarrete'):
        for lado in (1, -1):
            w = np.maximum(w, 0.35 * _suave(0.045, 0.02, np.linalg.norm(v - junta(nome, lado)[None], axis=1)))
    return w


def dividir_mandibula(v, nomes, W):
    """Separa cabeça e mandíbula pela linha da boca (o resto da mistura fica igual)."""
    W = W.copy()
    if 'mandibula' not in nomes or 'cabeca' not in nomes:
        return W
    ic, im = nomes.index('cabeca'), nomes.index('mandibula')
    wh = W[:, ic] + W[:, im]
    h = para_cranio(v)
    xh, zh = h[:, 0], h[:, 2]
    linha = -0.0255
    delta = 0.010 + (0.0012 - 0.010) * _suave(0.090, 0.125, xh)
    abaixo = _suave(linha + delta, linha - delta, zh)
    alcance = _suave(0.035, 0.085, xh)
    j = abaixo * alcance
    W[:, im] = wh * j
    W[:, ic] = wh * (1 - j)
    return W


def acertar_normais(ob):
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(ob.data)
    bm.free()


# ---------------------------------------------------------------------------
# língua (escondida dentro da mandíbula; sai quando o cachorro ofega)
# ---------------------------------------------------------------------------
LINGUA_CENTRO = (0.124, 0.0, -0.0345)
LINGUA_SEMI = (0.0155, 0.046, 0.0052)


def lingua_malha():
    M = matriz_cranio()
    R = np.stack([M[:, 1], -M[:, 0], M[:, 2]], axis=1)  # (lado, trás, cima)
    # cf.esfera usa as colunas (fenda, olhar, altura)
    R2 = np.stack([R[:, 0], R[:, 1], R[:, 2]], axis=1)
    return cf.esfera(C(*LINGUA_CENTRO), R2, np.array(LINGUA_SEMI), seg=8, aneis=5)


# ---------------------------------------------------------------------------
# esqueleto
# ---------------------------------------------------------------------------
LADOS = (('e', 1), ('d', -1))


def lista_ossos():
    from esqueleto import Osso
    J = junta
    frente = P(1, 0, 0)
    cima = P(0, 0, 1)
    os_ = [Osso('raiz', None, P(0, 0, 0), P(0.15, 0, 0), cima, deforma=False),
           Osso('quadril', 'raiz', J('quadril'), J('lombo'), cima),
           Osso('coluna_1', 'quadril', J('lombo'), J('torax'), cima, conectado=True),
           Osso('coluna_2', 'coluna_1', J('torax'), J('cernelha'), cima, conectado=True),
           Osso('coluna_3', 'coluna_2', J('cernelha'), J('pescoco_base'), cima, conectado=True),
           Osso('pescoco_1', 'coluna_3', J('pescoco_base'), J('pescoco_meio'), cima, conectado=True),
           Osso('pescoco_2', 'pescoco_1', J('pescoco_meio'), J('occipital'), cima, conectado=True),
           Osso('cabeca', 'pescoco_2', J('occipital'), C(0.205, 0, 0.004), matriz_cranio()[:, 2], conectado=True),
           Osso('mandibula', 'cabeca', C(0.048, 0, -0.016), C(0.178, 0, -0.034), matriz_cranio()[:, 2]),
           Osso('lingua', 'mandibula', C(0.085, 0, -0.033), C(0.165, 0, -0.033), matriz_cranio()[:, 2])]
    for s, lado in LADOS:
        us, linha, ang = cf.orelha_linha_central(lado)
        i_dobra = int(np.argmin(np.abs(us - cf.ORELHA_DOBRA)))
        base, cima_o, larg, frente_o = cf.orelha_eixos(lado)
        os_.append(Osso(f'orelha_{s}', 'cabeca', linha[0], linha[i_dobra], frente_o))
        os_.append(Osso(f'orelha_{s}_ponta', f'orelha_{s}', linha[i_dobra], linha[-1], frente_o, conectado=True))
    pc = cf.pontos_cauda()
    for i in range(len(pc) - 1):
        os_.append(Osso(f'cauda_{i + 1}', 'quadril' if i == 0 else f'cauda_{i}', pc[i], pc[i + 1], cima,
                        conectado=i > 0))
    for s, lado in LADOS:
        os_ += [Osso(f'escapula_f{s}', 'coluna_2', J('escapula_topo', lado), J('ombro', lado), frente),
                Osso(f'braco_f{s}', f'escapula_f{s}', J('ombro', lado), J('cotovelo', lado), frente, conectado=True),
                Osso(f'antebraco_f{s}', f'braco_f{s}', J('cotovelo', lado), J('carpo', lado), frente, conectado=True),
                Osso(f'metacarpo_f{s}', f'antebraco_f{s}', J('carpo', lado), J('mcp_f', lado), frente, conectado=True),
                Osso(f'dedos_f{s}', f'metacarpo_f{s}', J('mcp_f', lado), J('dedo_f', lado), cima, conectado=True),
                Osso(f'coxa_t{s}', 'quadril', J('anca', lado), J('joelho', lado), frente),
                Osso(f'perna_t{s}', f'coxa_t{s}', J('joelho', lado), J('jarrete', lado), frente, conectado=True),
                Osso(f'metatarso_t{s}', f'perna_t{s}', J('jarrete', lado), J('mtp_t', lado), frente, conectado=True),
                Osso(f'dedos_t{s}', f'metatarso_t{s}', J('mtp_t', lado), J('dedo_t', lado), cima, conectado=True)]
    return os_


def ossos_por_regiao():
    r = {
        'tronco': ['quadril', 'coluna_1', 'coluna_2', 'coluna_3'],
        'pescoco': ['coluna_3', 'pescoco_1', 'pescoco_2', 'cabeca'],
        'cabeca': ['cabeca'],
        'nariz': ['cabeca'],
        'mandibula': ['mandibula'],
        'cauda': ['quadril', 'cauda_1', 'cauda_2', 'cauda_3', 'cauda_4', 'cauda_5'],
    }
    for s, _ in LADOS:
        r[f'ombro_{s}'] = ['coluna_2', f'escapula_f{s}', f'braco_f{s}']
        r[f'pata_f{s}'] = [f'escapula_f{s}', f'braco_f{s}', f'antebraco_f{s}', f'metacarpo_f{s}', f'dedos_f{s}']
        r[f'coxa_{s}'] = ['quadril', f'coxa_t{s}', f'perna_t{s}']
        r[f'pata_t{s}'] = [f'coxa_t{s}', f'perna_t{s}', f'metatarso_t{s}', f'dedos_t{s}']
    return r


def _hex(c):
    return '#' + ''.join(f'{int(round(x * 255)):02x}' for x in c)


def descricao():
    """Texto do bichos.json sobre o cachorro."""
    return dict(
        descricao='cachorro vira-lata caramelo médio (cernelha ~0,53 m), pelo curto, orelhas semieretas',
        materiais_info={
            'pelo': {
                'COLOR_0': {
                    'R': 'pelo principal (caramelo)',
                    'G': 'pelo claro (creme): focinho de baixo, queixo, garganta, peito, barriga, '
                         'parte de dentro das patas, pés e ponta da cauda — transições suaves',
                    'B': 'pele sem pelo: trufa, almofadas das patas, lábios e boca, pálpebras; '
                         'dentro da orelha é metade pele, metade creme',
                    'A': 'comprimento do pelo: 1 no corpo, ~0,4 na cabeça e nas patas, 0 na pele',
                    'soma': 'R + G + B = 1 em todo vértice do pelo',
                },
            },
            'olho': 'olhos (malhas separadas presas ao osso cabeca), escuro e brilhante; COLOR_0 = 0',
            'lingua': 'língua (osso lingua, filho da mandibula), escondida na boca fechada; aparece ao ofegar',
        },
        cores_sugeridas_srgb={'principal': _hex(COR_PELO), 'secundaria': _hex(COR_CLARO), 'pele': _hex(COR_PELE),
                              'olho': _hex(COR_OLHO), 'lingua': _hex(COR_LINGUA)},
    )


def medidas(F):
    """Medidas tiradas da forma (em metros)."""
    import galinha_forma as gf
    def altura(f, l=0.0):
        lo, hi = 0.0, 1.0
        for _ in range(40):
            m = (lo + hi) / 2
            if F.avaliar(P(f, l, m)[None])[0] < 0:
                lo = m
            else:
                hi = m
        return lo
    # cernelha: ponto mais alto das escápulas, antes de a linha subir para o pescoço
    cernelha = max(altura(f) for f in np.linspace(0.12, 0.17, 6))
    pc = cf.pontos_cauda()
    nariz = -C(0.215, 0, 0.002)[1]
    base_cauda = -pc[0][1]
    comp_cauda = sum(np.linalg.norm(pc[i + 1] - pc[i]) for i in range(len(pc) - 1))
    return {'altura_cernelha': round(float(cernelha), 3), 'focinho_ate_base_da_cauda': round(float(nariz - base_cauda), 3),
            'cauda': round(float(comp_cauda), 3)}
