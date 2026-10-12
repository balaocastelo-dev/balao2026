"""Corpo base de cada pessoa a partir do MakeHuman.

1. malha base + alvos macro (gênero, idade, músculo, peso) no espaço do MakeHuman;
2. dedos levemente dobrados (mão relaxada), com os ossos dos dedos e os pesos do MakeHuman;
3. só o grupo `body` (sem os ajudantes `helper-*` e `joint-*`), em metros, pé no chão;
4. esqueleto reduzido (ossos.py) com os pesos somados;
5. redução da malha no Blender, poupando rosto, mãos e pés;
6. olhos do proxy low-poly do MakeHuman.
"""
import numpy as np

import mh
import ossos as O

TIPOS = {
    # altura: do chão (sola descalça) ao alto da cabeça, já contando a folga da sola
    'homem': dict(macro=dict(genero=1.0, idade=0.5, musculo=0.5, peso=0.5, altura=0.5), altura=1.76, tris=6300),
    'mulher': dict(macro=dict(genero=0.0, idade=0.5, musculo=0.5, peso=0.5, altura=0.5), altura=1.63, tris=5750),
    'crianca': dict(macro=dict(genero=0.5, idade=1 / 5.333, musculo=0.5, peso=0.5, altura=0.5), altura=1.30, tris=4400),
}

# folga entre o chão e a sola do pé no repouso (os calçados ocupam essa folga; no pé
# descalço a planta desce até o chão)
FOLGA_SOLA = 0.012

# dobra dos dedos (graus) por falange: indicador, médio, anelar, mínimo
DOBRA = {2: (16, 26, 14), 3: (20, 30, 16), 4: (24, 33, 18), 5: (28, 36, 20)}
DOBRA_POLEGAR = (12, 10, 14)


def _rot(eixo, graus):
    e = np.asarray(eixo, float)
    e = e / np.linalg.norm(e)
    a = np.radians(graus)
    K = np.array([[0, -e[2], e[1]], [e[2], 0, -e[0]], [-e[1], e[0], 0]])
    return np.eye(3) + np.sin(a) * K + (1 - np.cos(a)) * K @ K


def normal_palma(cab, L):
    """Normal saindo da palma (lado palmar)."""
    nos = np.array([cab[f'finger{i}-1' + L] for i in range(2, 6)])
    punho = cab['wrist' + L]
    ao_longo = nos.mean(0) - punho
    atraves = nos[0] - nos[3]              # do mínimo para o indicador
    n = np.cross(atraves, ao_longo)
    n /= np.linalg.norm(n)
    medial = np.array([-1.0, 0, 0]) if L == '.L' else np.array([1.0, 0, 0])
    if n @ medial < 0:
        n = -n
    return n


def dobrar_dedos(V, esq, cab, cau, fator=1.0):
    """Dobra os dedos com skinning linear (ossos e pesos dos dedos do MakeHuman)."""
    T = {}
    ossos = esq.ossos

    def transf(nome):
        if nome in T:
            return T[nome]
        pai = ossos[nome]['parent']
        Tp = transf(pai) if pai else np.eye(4)
        T[nome] = Tp
        return Tp

    rot_local = {}
    for L in ('.L', '.R'):
        n = normal_palma(cab, L)
        for i in range(1, 6):
            angs = DOBRA_POLEGAR if i == 1 else DOBRA[i]
            for k in range(1, 4):
                nome = f'finger{i}-{k}' + L
                d = cau[nome] - cab[nome]
                d /= np.linalg.norm(d)
                if i == 1:
                    # polegar: fecha em direção à palma e ao indicador
                    alvo = 0.7 * n + 0.3 * (cab['finger2-1' + L] - cab[nome]) / np.linalg.norm(cab['finger2-1' + L] - cab[nome])
                    eixo = np.cross(d, alvo)
                else:
                    eixo = np.cross(d, n)
                rot_local[nome] = (_rot(eixo, angs[k - 1] * fator), cab[nome])
    # compõe pela hierarquia
    T.clear()

    def tf(nome):
        if nome in T:
            return T[nome]
        pai = ossos[nome]['parent']
        Tp = tf(pai) if pai else np.eye(4)
        if nome in rot_local:
            R, c = rot_local[nome]
            M = np.eye(4)
            M[:3, :3] = R
            M[:3, 3] = c - R @ c
            # a rotação é dada no repouso; levada pela pose do pai
            T[nome] = Tp @ M
        else:
            T[nome] = Tp
        return T[nome]

    nomes, W = esq.matriz_pesos(len(V))
    W = W / np.maximum(W.sum(1, keepdims=True), 1e-9)
    Vh = np.c_[V, np.ones(len(V))]
    out = np.zeros_like(V)
    for j, nm in enumerate(nomes):
        w = W[:, j]
        idx = np.nonzero(w > 0)[0]
        if len(idx) == 0:
            continue
        M = tf(nm)
        out[idx] += w[idx, None] * (Vh[idx] @ M.T)[:, :3]
    soma = W.sum(1)
    sem = soma < 1e-6
    out[sem] = V[sem]
    return out


class Corpo:
    pass


def construir(tipo, decimar=True):
    cfg = TIPOS[tipo]
    base = mh.Base()
    esq = mh.EsqueletoMH()
    V, usados = mh.corpo(base, cfg['macro'])
    cab, cau = esq.posicoes(V)
    V = dobrar_dedos(V, esq, cab, cau)
    cab, cau = esq.posicoes(V)

    # só o corpo
    fb = base.faces_do_grupo('body')
    Fq = base.F[fb]
    FTq = base.FT[fb]
    usados_v = np.unique(Fq.ravel())
    novo = -np.ones(len(V), int)
    novo[usados_v] = np.arange(len(usados_v))

    # escala e posição: pé descalço no chão, centro no meio dos tornozelos
    Vb = V[usados_v]
    pe_min = Vb[:, 1].min()
    topo = Vb[:, 1].max()
    s = (cfg['altura'] - FOLGA_SOLA) / (topo - pe_min)
    tornozelo_z = 0.5 * (cab['foot.L'][2] + cab['foot.R'][2])
    desl = np.array([0.0, -pe_min, -tornozelo_z])

    def m(p):
        return (np.asarray(p) + desl) * s + np.array([0, FOLGA_SOLA, 0])

    C = Corpo()
    C.tipo = tipo
    C.alvos_usados = usados
    C.escala_mh = s
    C.V = m(Vb)
    C.Fq = novo[Fq]
    C.UVq = base.VT[FTq]                      # (nq, 4, 2)
    C.cab = {k: m(v) for k, v in cab.items()}
    C.cau = {k: m(v) for k, v in cau.items()}
    nomes_mh, Wmh = esq.matriz_pesos(len(V))
    C.W = O.reduzir_pesos(nomes_mh, Wmh[usados_v])
    C.juntas = {k: m(v) for k, v in O.juntas_de_mh(cab, cau).items()}
    C.juntas['raiz'] = np.zeros(3)
    # pegas
    for l, L in (('_e', '.L'), ('_d', '.R')):
        C.juntas['pega' + l], C.__dict__['quadro_pega' + l] = ponto_pega(C, L)
    # olhos
    idx, VT, F, FT = mh.olhos()
    C.olho_V = m(V[idx])
    C.olho_F = [list(f) for f in F]
    C.olho_UV = [[VT[t] for t in ft] for ft in FT]
    C.mh_base = base
    return C


def ponto_pega(C, L):
    """Ponto e quadro da pegada: no meio do anel formado pelos dedos dobrados."""
    cab, cau = C.cab, C.cau
    punho = cab['wrist' + L]
    nos = np.mean([cab[f'finger{i}-1' + L] for i in range(2, 6)], axis=0)
    R = O.quadro_pega(cab['finger2-1' + L], cab['finger5-1' + L], punho, nos)
    # anel do dedo médio: nó, juntas e ponta; centro = ponto médio entre a palma e a ponta
    pts = np.array([cab['finger3-1' + L], cab['finger3-2' + L], cab['finger3-3' + L], cau['finger3-3' + L]])
    n = normal_palma({k: v for k, v in cab.items()}, L)
    centro = 0.5 * (pts[0] + pts[3])
    # um pouco para dentro da mão, na direção da palma
    centro = centro + n * 0.004
    return centro, R


# ---------------------------------------------------------------------------
# redução da malha (Blender)
# ---------------------------------------------------------------------------
def protecao(C):
    """0..1: quanto poupar cada vértice na redução (rosto, mãos, pés)."""
    W = C.W
    I = O.INDICE
    cab = W[:, I['cabeca']]
    mao = W[:, I['mao_e']] + W[:, I['mao_d']]
    pe = W[:, I['dedos_pe_e']] + W[:, I['dedos_pe_d']] + 0.5 * (W[:, I['pe_e']] + W[:, I['pe_d']])
    centro = C.juntas['cabeca']
    frente = np.clip((C.V[:, 2] - centro[2] + 0.02) / 0.06, 0, 1)        # rosto (frente da cabeça)
    abaixo_testa = np.clip((C.juntas['cabeca'][1] + 0.16 - C.V[:, 1]) / 0.03, 0, 1)
    rosto = cab * frente * abaixo_testa
    orelha = cab * np.clip((np.abs(C.V[:, 0]) - 0.055) / 0.015, 0, 1)
    p = np.clip(np.maximum.reduce([rosto, 0.9 * mao, 0.5 * pe, 0.6 * orelha]), 0, 1)
    # No colapso do Blender, peso 1 no grupo invertido tira o vértice da redução e
    # pesos parciais somam ao custo um termo proporcional ao comprimento da aresta.
    # Base 0,4 em todo o corpo deixa os triângulos parecidos em tamanho (bom para
    # dobrar nas juntas) e o rosto/mãos pesam mais.
    return 0.4 + (0.99 - 0.4) * p


def decimar(C, alvo_tris, fator=40.0):
    """Reduz a malha no Blender (colapso de arestas com simetria em X), levando
    coordenadas de textura e pesos. Devolve V, F (triângulos), UV por canto, W."""
    import bpy
    for col in (bpy.data.objects, bpy.data.meshes):
        for it in list(col):
            col.remove(it)
    me = bpy.data.meshes.new('corpo')
    V, Fq = C.V, C.Fq
    me.vertices.add(len(V))
    me.vertices.foreach_set('co', V.astype(np.float32).ravel())
    me.loops.add(Fq.size)
    me.loops.foreach_set('vertex_index', Fq.astype(np.int32).ravel())
    me.polygons.add(len(Fq))
    me.polygons.foreach_set('loop_start', np.arange(0, Fq.size, 4, dtype=np.int32))
    me.update(calc_edges=True)
    uv = me.uv_layers.new(name='UV')
    uv.data.foreach_set('uv', C.UVq.reshape(-1, 2).astype(np.float32).ravel())
    ob = bpy.data.objects.new('corpo', me)
    bpy.context.scene.collection.objects.link(ob)
    # pesos como grupos de vértices
    for j, nome in enumerate(O.NOMES):
        g = ob.vertex_groups.new(name=nome)
        idx = np.nonzero(C.W[:, j] > 0)[0]
        for i in idx:
            g.add([int(i)], float(C.W[i, j]), 'REPLACE')
    pr = protecao(C)
    g = ob.vertex_groups.new(name='proteger')
    for i in np.nonzero(pr > 0)[0]:
        g.add([int(i)], float(pr[i]), 'REPLACE')
    atual = 2 * len(Fq)
    m = ob.modifiers.new('reduzir', 'DECIMATE')
    m.decimate_type = 'COLLAPSE'
    m.ratio = alvo_tris / atual
    m.use_collapse_triangulate = True
    m.use_symmetry = True
    m.symmetry_axis = 'X'
    m.vertex_group = 'proteger'
    m.vertex_group_factor = fator
    m.invert_vertex_group = True
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    dg.update()
    ev = ob.evaluated_get(dg)
    novo = bpy.data.meshes.new_from_object(ev, preserve_all_data_layers=True, depsgraph=dg)
    novo.calc_loop_triangles()
    nv = len(novo.vertices)
    Vn = np.zeros(nv * 3)
    novo.vertices.foreach_get('co', Vn)
    Vn = Vn.reshape(-1, 3)
    nt = len(novo.loop_triangles)
    Ft = np.zeros(nt * 3, dtype=np.int64)
    novo.loop_triangles.foreach_get('vertices', Ft)
    Lt = np.zeros(nt * 3, dtype=np.int64)
    novo.loop_triangles.foreach_get('loops', Lt)
    uvs = np.zeros(len(novo.loops) * 2)
    novo.uv_layers[0].data.foreach_get('uv', uvs)
    uvs = uvs.reshape(-1, 2)
    UV = uvs[Lt].reshape(-1, 3, 2)
    # pesos
    Wn = np.zeros((nv, len(O.NOMES)))
    gi = {g.name: g.index for g in ob.vertex_groups}
    inv = {v: k for k, v in gi.items()}
    for v in novo.vertices:
        for ge in v.groups:
            nome = inv.get(ge.group)
            if nome in O.INDICE:
                Wn[v.index, O.INDICE[nome]] = ge.weight
    Wn /= np.maximum(Wn.sum(1, keepdims=True), 1e-9)
    return Vn, Ft.reshape(-1, 3), UV, Wn


def pontos_do_pe(C):
    """Calcanhar, bola e ponta de cada pé no repouso (para o contato com o chão)."""
    out = {}
    I = O.INDICE
    for l in ('_e', '_d'):
        w = C.W[:, I['pe' + l]] + C.W[:, I['dedos_pe' + l]]
        sel = w > 0.5
        P = C.V[sel]
        baixo = P[P[:, 1] < P[:, 1].min() + 0.012]
        sola = P[P[:, 1] < P[:, 1].min() + 0.0025]
        cal = sola[np.argmin(sola[:, 2])]
        pon = P[np.argmax(P[:, 2])]
        bola = C.juntas['dedos_pe' + l].copy()
        bola[1] = baixo[:, 1].min()
        out['calcanhar' + l] = np.array([C.juntas['pe' + l][0], cal[1], cal[2]])
        out['bola' + l] = bola
        out['ponta' + l] = np.array([pon[0], baixo[:, 1].min(), pon[2]])
    return out


def marcos(C):
    """Pontos de referência no repouso (metros): boca, olhos, topo da cabeça, perfil do tronco."""
    cab = C.cab
    m = {}
    m['boca'] = 0.5 * (cab['oris01'] + cab['oris05']) if 'oris05' in cab else cab['oris01']
    m['olhos'] = 0.5 * (cab['eye.L'] + cab['eye.R'])
    m['topo'] = np.array([0, C.V[:, 1].max(), C.juntas['cabeca'][2]])
    m['queixo'] = cab['special04'] if 'special04' in cab else cab['jaw']
    # meia largura e profundidade do tronco por altura (sem braços)
    I = O.INDICE
    braco = sum(C.W[:, I[o + l]] for o in ('braco', 'antebraco', 'mao') for l in ('_e', '_d'))
    tronco = C.V[braco < 0.2]
    alturas = np.arange(0.0, C.V[:, 1].max(), 0.02)
    perfil = []
    for y in alturas:
        s = tronco[np.abs(tronco[:, 1] - y) < 0.012]
        if len(s) < 3:
            perfil.append((y, 0, 0, 0))
            continue
        perfil.append((y, np.abs(s[:, 0]).max(), s[:, 2].max(), s[:, 2].min()))
    m['perfil'] = np.array(perfil)     # y, meia-largura, frente (z max), costas (z min)
    return m
