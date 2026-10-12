"""Monta o GLB de uma pessoa: esqueleto, visuais (uma malha com pele por visual,
com os olhos como segunda primitiva), materiais, texturas e animações."""
import numpy as np

import gltf
import malha as M
import ossos as O


def quatro_influencias(W):
    W = O.limitar(W, 4)
    ordem = np.argsort(-W, axis=1)[:, :4]
    J = ordem.astype(np.uint8)
    Wq = np.take_along_axis(W, ordem, axis=1)
    Wq /= np.maximum(Wq.sum(1, keepdims=True), 1e-12)
    # ossos sem peso: repete o primeiro (peso 0)
    J[Wq == 0] = J[:, :1].repeat(4, 1)[Wq == 0]
    return J, Wq


ESCALA_POS = 2.0   # posições quantizadas: P = 2 m × valor normalizado (a escala está nas IBM)


def exportar(caminho, nome, esq, visuais, olho, texturas, animacoes, gerador, extras=None, quantizar=True):
    """visuais: lista de (nome, Malha com A['mascara']); olho: Malha (UV da textura do olho).
    texturas: {'detalhe': (bytes, mime), 'olho': (bytes, mime)}.
    animacoes: lista de (nome, rot_locais dict osso->(n,3,3), trans_quadril (n,3))."""
    esc = gltf.Escritor()
    esc.js['asset']['generator'] = gerador
    # nós dos ossos
    nos = {}
    for o in O.NOMES:
        p = O.PAIS[o]
        t = esq.J[o] - (esq.J[p] if p else 0)
        k = {'name': o, 'translation': [float(x) for x in t]}
        if o.startswith('pega'):
            q = gltf.quat_de_matriz(esq.P_pega[o])
            k['rotation'] = [float(x) for x in q]
        nos[o] = esc.no(**k)
    for o in O.NOMES:
        filhos = [nos[f] for f in O.NOMES if O.PAIS[f] == o]
        if filhos:
            esc.js['nodes'][nos[o]]['children'] = filhos
    # pele
    ibm = []
    for o in O.NOMES:
        Mw = np.eye(4)
        Mw[:3, 3] = esq.J[o]
        if o.startswith('pega'):
            Mw[:3, :3] = esq.P_pega[o]
        Mi = np.linalg.inv(Mw)
        if quantizar:
            Mi = Mi @ np.diag([ESCALA_POS, ESCALA_POS, ESCALA_POS, 1.0])
        ibm.append(Mi.T.ravel())   # coluna principal
    ibm = np.array(ibm, np.float32)
    acc_ibm = esc.acessor(ibm, 'MAT4', 5126)
    esc.js['skins'].append({'name': nome, 'joints': [nos[o] for o in O.NOMES], 'inverseBindMatrices': acc_ibm,
                            'skeleton': nos['raiz']})
    # materiais
    tex_det = esc.imagem(*texturas['detalhe'])
    tex_olho = esc.imagem(*texturas['olho'])
    mat_pessoa = esc.material('pessoa', tex_det, rug=0.92)
    mat_olho = esc.material('olhos', tex_olho, rug=0.25)
    # olhos (iguais em todos os visuais)
    No = olho.normais()
    Vo, Fo, UVo, No2, ex, _ = M.separar_por_uv(olho.V, olho.F, olho.UV, No, {'W': olho.W})
    Jo, Wo = quatro_influencias(ex['W'])
    filhos_raiz = [nos['raiz']]
    info = []
    for nv, m in visuais:
        N = m.normais()
        if 'normal' in m.A:
            N = m.A['normal'] / np.maximum(np.linalg.norm(m.A['normal'], axis=1, keepdims=True), 1e-12)
        V2, F2, UV2, N2, ex, _ = M.separar_por_uv(m.V, m.F, m.UV, N, {'W': m.W, 'C': m.A['mascara']})
        J, Wq = quatro_influencias(ex['W'])
        eq = ESCALA_POS if quantizar else None
        prim = esc.primitiva(V2, N2, UV2, ex['C'], J, Wq, F2, mat_pessoa, escala_pos=eq)
        prim_o = esc.primitiva(Vo, No2, UVo, None, Jo, Wo, Fo, mat_olho, escala_pos=eq)
        mi = esc.malha(nv, [prim, prim_o])
        filhos_raiz.append(esc.no(name=nv, mesh=mi, skin=0))
        info.append(dict(nome=nv, triangulos=int(len(F2) + len(Fo)), triangulos_corpo=int(len(F2)), vertices=int(len(V2))))
    raiz_cena = esc.no(name=nome, children=filhos_raiz)
    esc.js['scenes'][0]['nodes'] = [raiz_cena]
    if extras:
        esc.js['scenes'][0]['extras'] = extras
    # animações
    for nome_a, rot_locais, trans in animacoes:
        gltf.gravar_animacao(esc, nome_a, nos, rot_locais, trans, nos['quadril'])
    tam = esc.gravar(caminho)
    return tam, info
