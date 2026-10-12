"""Malha triangular em numpy: atributos por vértice e por canto, corte por isolinha,
bordas, suavização. É a base para montar roupas e cabelos sobre o corpo.

Malha:
  V   (n, 3)      posições (metros, repouso)
  F   (m, 3)      triângulos
  UV  (m, 3, 2)   coordenadas de textura por canto
  W   (n, 25)     pesos dos ossos (ordem de ossos.NOMES)
  A   dict nome -> (n, k) outros atributos por vértice (máscara, origem, ...)
"""
import numpy as np


class Malha:
    def __init__(self, V, F, UV=None, W=None, A=None):
        self.V = np.asarray(V, float)
        self.F = np.asarray(F, np.int64).reshape(-1, 3)
        self.UV = np.zeros((len(self.F), 3, 2)) if UV is None else np.asarray(UV, float)
        self.W = np.zeros((len(self.V), 25)) if W is None else np.asarray(W, float)
        self.A = {} if A is None else {k: np.asarray(v, float) for k, v in A.items()}

    def copia(self):
        return Malha(self.V.copy(), self.F.copy(), self.UV.copy(), self.W.copy(), {k: v.copy() for k, v in self.A.items()})

    @property
    def n(self):
        return len(self.V)

    # ------------------------------------------------------------------ geometria
    def normais_faces(self):
        T = self.V[self.F]
        n = np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0])
        return n  # tamanho = 2 * área

    def normais(self):
        nf = self.normais_faces()
        N = np.zeros_like(self.V)
        for k in range(3):
            np.add.at(N, self.F[:, k], nf)
        return N / np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-12)

    def arestas(self):
        a = np.concatenate([self.F[:, [0, 1]], self.F[:, [1, 2]], self.F[:, [2, 0]]])
        a.sort(axis=1)
        return np.unique(a, axis=0)

    def vizinhos(self):
        a = self.arestas()
        viz = [[] for _ in range(self.n)]
        for i, j in a:
            viz[i].append(j)
            viz[j].append(i)
        return viz

    def suavizar_campo(self, X, iteracoes=5, alfa=0.5, fixos=None):
        """Média com os vizinhos (pelas arestas), `fixos` não muda."""
        a = self.arestas()
        grau = np.bincount(a.ravel(), minlength=self.n).astype(float)
        X = np.array(X, float)
        um = X.ndim == 1
        if um:
            X = X[:, None]
        for _ in range(iteracoes):
            s = np.zeros_like(X)
            np.add.at(s, a[:, 0], X[a[:, 1]])
            np.add.at(s, a[:, 1], X[a[:, 0]])
            m = s / np.maximum(grau, 1)[:, None]
            novo = (1 - alfa) * X + alfa * m
            if fixos is not None:
                novo[fixos] = X[fixos]
            X = novo
        return X[:, 0] if um else X

    # ------------------------------------------------------------------ seleção
    def sub(self, faces):
        """Nova malha só com as faces dadas (máscara booleana ou índices)."""
        faces = np.asarray(faces)
        if faces.dtype == bool:
            faces = np.nonzero(faces)[0]
        F = self.F[faces]
        usados = np.unique(F.ravel())
        novo = -np.ones(self.n, np.int64)
        novo[usados] = np.arange(len(usados))
        m = Malha(self.V[usados], novo[F], self.UV[faces], self.W[usados],
                  {k: v[usados] for k, v in self.A.items()})
        m.origem = usados
        return m

    def bordas(self, com_abertos=False):
        """Laços de borda (listas de vértices em ordem, seguindo a orientação das faces).
        Vértices com mais de uma aresta de borda saindo (beliscões) são resolvidos
        consumindo as arestas; laços que não fecham são devolvidos como abertos."""
        a = np.concatenate([self.F[:, [0, 1]], self.F[:, [1, 2]], self.F[:, [2, 0]]])
        cont = {}
        for i, j in a:
            cont[(int(i), int(j))] = cont.get((int(i), int(j)), 0) + 1
        saidas = {}
        for (i, j) in cont:
            if (j, i) not in cont:
                saidas.setdefault(i, []).append(j)
        lacos, abertos = [], []
        while saidas:
            ini = next(iter(saidas))
            laco = [ini]
            v = ini
            fechou = False
            while True:
                lst = saidas.get(v)
                if not lst:
                    break
                w = lst.pop()
                if not lst:
                    del saidas[v]
                if w == ini:
                    fechou = True
                    break
                laco.append(w)
                v = w
                if len(laco) > 100000:
                    break
            if fechou and len(laco) >= 3:
                lacos.append(laco)
            elif len(laco) >= 2:
                abertos.append(laco)
        return (lacos, abertos) if com_abertos else lacos

    # ------------------------------------------------------------------ corte por isolinha
    def cortar(self, f, atribs_func=None):
        """Corta a malha na isolinha f = 0 (f por vértice). Novos vértices nas arestas
        cruzadas (posição, pesos, atributos e UV interpolados). Devolve a nova malha e o
        valor de f nos vértices novos (0)."""
        f = np.asarray(f, float).copy()
        f[np.abs(f) < 1e-7] = 1e-7      # evita vértices exatamente na linha
        V, F, UV, W = self.V, self.F, self.UV, self.W
        novosV, novosW, novosA, novosf = [], [], {k: [] for k in self.A}, []
        mapa = {}

        def ponto(i, j):
            k = (min(i, j), max(i, j))
            if k in mapa:
                return mapa[k]
            t = f[i] / (f[i] - f[j])
            idx = len(V) + len(novosV)
            novosV.append(V[i] + t * (V[j] - V[i]))
            novosW.append(W[i] + t * (W[j] - W[i]))
            for kk in self.A:
                novosA[kk].append(self.A[kk][i] + t * (self.A[kk][j] - self.A[kk][i]))
            novosf.append(0.0)
            mapa[k] = idx
            return idx

        sinal = f > 0
        nf, nuv = [], []
        for fi, tri in enumerate(F):
            s = sinal[tri]
            if s.all() or (~s).all():
                nf.append(tri)
                nuv.append(UV[fi])
                continue
            # vértice isolado (sinal diferente dos outros dois)
            k = 0 if s[0] != s[1] and s[0] != s[2] else (1 if s[1] != s[0] and s[1] != s[2] else 2)
            a, b, c = tri[k], tri[(k + 1) % 3], tri[(k + 2) % 3]
            ua, ub, uc = UV[fi][k], UV[fi][(k + 1) % 3], UV[fi][(k + 2) % 3]
            pab = ponto(a, b)
            pac = ponto(a, c)
            tab = f[a] / (f[a] - f[b])
            tac = f[a] / (f[a] - f[c])
            uab = ua + tab * (ub - ua)
            uac = ua + tac * (uc - ua)
            nf.append([a, pab, pac])
            nuv.append([ua, uab, uac])
            nf.append([pab, b, c])
            nuv.append([uab, ub, uc])
            nf.append([pab, c, pac])
            nuv.append([uab, uc, uac])
        if novosV:
            V2 = np.vstack([V, np.array(novosV)])
            W2 = np.vstack([W, np.array(novosW)])
            A2 = {k: np.vstack([self.A[k], np.array(novosA[k]).reshape(len(novosV), -1)]) for k in self.A}
            f2 = np.concatenate([f, np.array(novosf)])
        else:
            V2, W2, A2, f2 = V, W, self.A, f
        m = Malha(V2, np.array(nf), np.array(nuv), W2, A2)
        return m, f2


def juntar(malhas):
    V, F, UV, W = [], [], [], []
    chaves = set()
    for m in malhas:
        chaves |= set(m.A)
    A = {k: [] for k in chaves}
    base = 0
    for m in malhas:
        V.append(m.V)
        F.append(m.F + base)
        UV.append(m.UV)
        W.append(m.W)
        for k in chaves:
            if k in m.A:
                A[k].append(m.A[k])
            else:
                dim = next(mm.A[k].shape[1] for mm in malhas if k in mm.A)
                A[k].append(np.zeros((m.n, dim)))
        base += m.n
    return Malha(np.vstack(V), np.vstack(F), np.concatenate(UV), np.vstack(W), {k: np.vstack(v) for k, v in A.items()})


def separar_por_uv(V, F, UV, N, extras):
    """Converte para vértices únicos por (vértice, UV) — o formato do glTF."""
    chaves = {}
    idx_v, idx_uv = [], []
    Fn = np.zeros_like(F)
    uvq = np.round(UV * 1e5).astype(np.int64)
    for fi in range(len(F)):
        for k in range(3):
            v = int(F[fi, k])
            key = (v, int(uvq[fi, k, 0]), int(uvq[fi, k, 1]))
            j = chaves.get(key)
            if j is None:
                j = len(idx_v)
                chaves[key] = j
                idx_v.append(v)
                idx_uv.append(UV[fi, k])
            Fn[fi, k] = j
    idx_v = np.array(idx_v)
    return (V[idx_v], Fn, np.array(idx_uv), N[idx_v], {k: e[idx_v] for k, e in extras.items()}, idx_v)


def decimar(m, alvo_tris, proteger_borda=True, base=0.4, fator=40.0):
    """Reduz uma malha no Blender (colapso com custo pelo comprimento das arestas),
    levando UV por canto, pesos e atributos por vértice. A borda fica fora da redução."""
    import bpy
    import ossos as O
    if len(m.F) <= alvo_tris:
        return m
    nome = 'tmp_decimar'
    for ob in [o for o in bpy.data.objects if o.name.startswith(nome)]:
        bpy.data.objects.remove(ob)
    me = bpy.data.meshes.new(nome)
    me.vertices.add(m.n)
    me.vertices.foreach_set('co', m.V.astype(np.float32).ravel())
    me.loops.add(m.F.size)
    me.loops.foreach_set('vertex_index', m.F.astype(np.int32).ravel())
    me.polygons.add(len(m.F))
    me.polygons.foreach_set('loop_start', np.arange(0, m.F.size, 3, dtype=np.int32))
    me.update(calc_edges=True)
    uv = me.uv_layers.new(name='UV')
    uv.data.foreach_set('uv', m.UV.reshape(-1, 2).astype(np.float32).ravel())
    atrs = {}
    for k, v in m.A.items():
        v = np.asarray(v, float)
        for c in range(v.shape[1]):
            a = me.attributes.new(f'{k}_{c}', 'FLOAT', 'POINT')
            a.data.foreach_set('value', v[:, c].astype(np.float32))
            atrs[(k, c)] = a.name
    ob = bpy.data.objects.new(nome, me)
    bpy.context.scene.collection.objects.link(ob)
    usados = np.nonzero(m.W.sum(0) > 0)[0]
    for j in usados:
        g = ob.vertex_groups.new(name=O.NOMES[j])
        for i in np.nonzero(m.W[:, j] > 0)[0]:
            g.add([int(i)], float(m.W[i, j]), 'REPLACE')
    pr = np.full(m.n, base)
    if proteger_borda:
        for laco in m.bordas():
            pr[laco] = 1.0
    g = ob.vertex_groups.new(name='proteger')
    for i in range(m.n):
        g.add([i], float(pr[i]), 'REPLACE')
    md = ob.modifiers.new('reduzir', 'DECIMATE')
    md.decimate_type = 'COLLAPSE'
    md.ratio = alvo_tris / len(m.F)
    md.use_collapse_triangulate = True
    md.vertex_group = 'proteger'
    md.vertex_group_factor = fator
    md.invert_vertex_group = True
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    dg.update()
    novo = bpy.data.meshes.new_from_object(ob.evaluated_get(dg), preserve_all_data_layers=True, depsgraph=dg)
    novo.calc_loop_triangles()
    nv = len(novo.vertices)
    V = np.zeros(nv * 3)
    novo.vertices.foreach_get('co', V)
    nt = len(novo.loop_triangles)
    F = np.zeros(nt * 3, dtype=np.int64)
    novo.loop_triangles.foreach_get('vertices', F)
    L = np.zeros(nt * 3, dtype=np.int64)
    novo.loop_triangles.foreach_get('loops', L)
    uvs = np.zeros(len(novo.loops) * 2)
    novo.uv_layers[0].data.foreach_get('uv', uvs)
    UV = uvs.reshape(-1, 2)[L].reshape(-1, 3, 2)
    A = {}
    for (k, c), nm in atrs.items():
        v = np.zeros(nv)
        novo.attributes[nm].data.foreach_get('value', v)
        A.setdefault(k, []).append(v)
    A = {k: np.stack(v, axis=1) for k, v in A.items()}
    W = np.zeros((nv, m.W.shape[1]))
    inv = {g.index: g.name for g in ob.vertex_groups}
    for v in novo.vertices:
        for ge in v.groups:
            nm = inv.get(ge.group)
            if nm in O.INDICE:
                W[v.index, O.INDICE[nm]] = ge.weight
    W /= np.maximum(W.sum(1, keepdims=True), 1e-9)
    bpy.data.objects.remove(ob)
    bpy.data.meshes.remove(novo)
    return Malha(V.reshape(-1, 3), F.reshape(-1, 3), UV, W, A)


def reduzir_interno(m, alvo_tris, angulo_max=25.0):
    """Redução por colapso de arestas internas no ponto médio (as mais curtas primeiro).
    Não mexe na borda nem nas costuras do UV, não deixa face virar, mantém a malha
    manifold. Bom para cascas lisas (roupas): a borda limpa fica exatamente onde estava."""
    import heapq
    V = m.V.copy()
    W = m.W.copy()
    A = {k: v.copy() for k, v in m.A.items()}
    F = [list(f) for f in m.F]
    UV = [np.array(u) for u in m.UV]
    vivo = [True] * len(F)
    n = len(V)
    faces_v = [set() for _ in range(n)]
    for fi, f in enumerate(F):
        for v in f:
            faces_v[v].add(fi)
    # borda e costura de UV
    cont = {}
    for f in F:
        for a, b in ((f[0], f[1]), (f[1], f[2]), (f[2], f[0])):
            k = (min(a, b), max(a, b))
            cont[k] = cont.get(k, 0) + 1
    travado = np.zeros(n, bool)
    for (a, b), c in cont.items():
        if c != 2:
            travado[a] = travado[b] = True
    uv_v = {}
    for fi, f in enumerate(F):
        for j, v in enumerate(f):
            u = tuple(np.round(UV[fi][j], 5))
            uv_v.setdefault(v, set()).add(u)
    for v, s in uv_v.items():
        if len(s) > 1:
            travado[v] = True
    uvv = np.zeros((n, 2))
    for v, s in uv_v.items():
        uvv[v] = np.array(next(iter(s)))
    vizinhos = [set() for _ in range(n)]
    for (a, b) in cont:
        vizinhos[a].add(b)
        vizinhos[b].add(a)
    heap = [(np.linalg.norm(V[a] - V[b]), a, b) for (a, b) in cont if not travado[a] and not travado[b]]
    heapq.heapify(heap)
    nf = len(F)
    removido = np.zeros(n, bool)
    cosmax = np.cos(np.radians(angulo_max))

    def normal(f, P):
        a, b, c = P[f[0]], P[f[1]], P[f[2]]
        nn = np.cross(b - a, c - a)
        L = np.linalg.norm(nn)
        return nn / L if L > 1e-15 else nn

    while nf > alvo_tris and heap:
        L, a, b = heapq.heappop(heap)
        if removido[a] or removido[b] or b not in vizinhos[a]:
            continue
        if abs(np.linalg.norm(V[a] - V[b]) - L) > 1e-9:
            continue
        comuns = vizinhos[a] & vizinhos[b]
        if len(comuns) != 2:
            continue
        novo = 0.5 * (V[a] + V[b])
        ok = True
        Vt = V
        for fi in (faces_v[a] | faces_v[b]):
            f = F[fi]
            if a in f and b in f:
                continue
            g = [a if v == b else v for v in f]
            antes = normal(f, Vt)
            P2 = {v: Vt[v] for v in g}
            P2[a] = novo
            depois = np.cross(P2[g[1]] - P2[g[0]], P2[g[2]] - P2[g[0]])
            Ld = np.linalg.norm(depois)
            if Ld < 1e-14 or np.dot(depois / Ld, antes) < cosmax:
                ok = False
                break
        if not ok:
            continue
        # colapsa b em a
        for fi in list(faces_v[b]):
            f = F[fi]
            if a in f:
                vivo[fi] = False
                for v in f:
                    faces_v[v].discard(fi)
                nf -= 1
            else:
                F[fi] = [a if v == b else v for v in f]
                faces_v[a].add(fi)
        faces_v[b] = set()
        V[a] = novo
        W[a] = 0.5 * (W[a] + W[b])
        for k in A:
            A[k][a] = 0.5 * (A[k][a] + A[k][b])
        uvv[a] = 0.5 * (uvv[a] + uvv[b])
        for v in vizinhos[b]:
            if v != a:
                vizinhos[v].discard(b)
                vizinhos[v].add(a)
                vizinhos[a].add(v)
        vizinhos[a].discard(b)
        vizinhos[b] = set()
        removido[b] = True
        for v in vizinhos[a]:
            if not travado[v]:
                heapq.heappush(heap, (np.linalg.norm(V[a] - V[v]), min(a, v), max(a, v)))
    # UV: vértices travados mantêm a UV do canto original; os outros, a UV única (média)
    Fv, UVv = [], []
    for fi in range(len(F)):
        if not vivo[fi]:
            continue
        f = F[fi]
        orig = list(m.F[fi])
        cantos = []
        for v in f:
            if travado[v] and v in orig:
                cantos.append(m.UV[fi][orig.index(v)])
            else:
                cantos.append(uvv[v])
        Fv.append(f)
        UVv.append(cantos)
    out = Malha(V, np.array(Fv), np.array(UVv), W, A)
    return out.sub(np.ones(len(out.F), bool))
