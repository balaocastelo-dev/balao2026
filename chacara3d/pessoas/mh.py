"""Leitura dos dados do MakeHuman (CC0): malha base, alvos macro, esqueleto, pesos e olhos.

Os arquivos ficam em `makehuman/` (cópia dos que usamos, comprimidos com gzip para o
repositório não pesar). Unidades do MakeHuman: decímetro, Y para cima, frente +Z,
esquerda do boneco = +X (igual ao glTF, só a escala muda).

Os alvos macro são combinados como no MakeHuman (`apps/human.py` e `humanmodifier.py`):
cada arquivo pesa o produto dos valores das variáveis que aparecem no nome
(gênero × idade × músculo × peso × altura × etnia).
"""
import gzip
import json
import os

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
PASTA_MH = os.environ.get('MH_DADOS', os.path.join(AQUI, 'makehuman'))


def abrir(rel):
    """Abre um arquivo de `makehuman/` (aceita a versão .gz)."""
    c = os.path.join(PASTA_MH, rel)
    if os.path.exists(c + '.gz'):
        return gzip.open(c + '.gz', 'rt', encoding='utf-8')
    return open(c, encoding='utf-8')


# ---------------------------------------------------------------------------
# malha base
# ---------------------------------------------------------------------------
class Base:
    """base.obj: vértices (19158), coordenadas de textura e quads com o grupo de cada um."""

    def __init__(self):
        V, VT, F, FT, G = [], [], [], [], []
        g = None
        with abrir('3dobjs/base.obj') as f:
            for l in f:
                if l.startswith('v '):
                    V.append([float(x) for x in l.split()[1:4]])
                elif l.startswith('vt '):
                    VT.append([float(x) for x in l.split()[1:3]])
                elif l.startswith('g '):
                    g = l.split()[1]
                elif l.startswith('f '):
                    ps = [x.split('/') for x in l.split()[1:]]
                    F.append([int(p[0]) - 1 for p in ps])
                    FT.append([int(p[1]) - 1 for p in ps])
                    G.append(g)
        self.V = np.array(V)
        self.VT = np.array(VT)
        self.F = np.array(F)          # todos quads
        self.FT = np.array(FT)
        self.grupo = np.array(G)

    def faces_do_grupo(self, nome):
        return np.nonzero(self.grupo == nome)[0]


# ---------------------------------------------------------------------------
# alvos macro
# ---------------------------------------------------------------------------
def ler_alvo(rel, n):
    d = np.zeros((n, 3))
    with abrir('targets/' + rel) as f:
        for l in f:
            if not l.strip() or l[0] == '#':
                continue
            p = l.split()
            d[int(p[0])] = (float(p[1]), float(p[2]), float(p[3]))
    return d


def valores_macro(genero, idade, musculo, peso, altura, proporcao=0.5, etnias=(1 / 3, 1 / 3, 1 / 3)):
    """Valores das variáveis como o MakeHuman calcula (human.py, _set*Vals)."""
    v = {}
    v['male'], v['female'] = genero, 1 - genero
    if idade < 0.5:
        v['old'] = 0.0
        v['baby'] = max(0.0, 1 - idade * 5.333)
        v['young'] = max(0.0, (idade - 0.1875) * 3.2)
        v['child'] = max(0.0, min(1.0, 5.333 * idade) - v['young'])
    else:
        v['child'] = v['baby'] = 0.0
        v['old'] = max(0.0, idade * 2 - 1)
        v['young'] = 1 - v['old']
    v['maxweight'] = max(0.0, peso * 2 - 1)
    v['minweight'] = max(0.0, 1 - peso * 2)
    v['averageweight'] = 1 - (v['maxweight'] + v['minweight'])
    v['maxmuscle'] = max(0.0, musculo * 2 - 1)
    v['minmuscle'] = max(0.0, 1 - musculo * 2)
    v['averagemuscle'] = 1 - (v['maxmuscle'] + v['minmuscle'])
    v['maxheight'] = max(0.0, altura * 2 - 1)
    v['minheight'] = max(0.0, 1 - altura * 2)
    v['idealproportions'] = max(0.0, proporcao * 2 - 1)
    v['uncommonproportions'] = max(0.0, 1 - proporcao * 2)
    v['african'], v['asian'], v['caucasian'] = etnias
    return v


def alvos_macro(v, limiar=1e-6):
    """Lista (arquivo, peso) dos alvos macro com peso diferente de zero."""
    generos = ('female', 'male')
    idades = ('baby', 'child', 'young', 'old')
    musc = ('minmuscle', 'averagemuscle', 'maxmuscle')
    pesos = ('minweight', 'averageweight', 'maxweight')
    out = []
    for g in generos:
        for i in idades:
            for e in ('african', 'asian', 'caucasian'):
                w = v[e] * v[g] * v[i]
                if w > limiar:
                    out.append((f'macrodetails/{e}-{g}-{i}.target', w))
            for m in musc:
                for p in pesos:
                    base = v[g] * v[i] * v[m] * v[p]
                    if base <= limiar:
                        continue
                    out.append((f'macrodetails/universal-{g}-{i}-{m}-{p}.target', base))
                    for h in ('minheight', 'maxheight'):
                        w = base * v[h]
                        if w > limiar:
                            out.append((f'macrodetails/height/{g}-{i}-{m}-{p}-{h}.target', w))
                    for pr in ('idealproportions', 'uncommonproportions'):
                        w = base * v[pr]
                        if w > limiar:
                            out.append((f'macrodetails/proportions/{g}-{i}-{m}-{p}-{pr}.target', w))
    return out


def corpo(base, params):
    """Vértices da malha base com os alvos macro aplicados (decímetros)."""
    v = valores_macro(**params)
    V = base.V.copy()
    usados = []
    for rel, w in alvos_macro(v):
        V += w * ler_alvo(rel, len(V))
        usados.append(rel)
    return V, usados


# ---------------------------------------------------------------------------
# esqueleto e pesos
# ---------------------------------------------------------------------------
class EsqueletoMH:
    """default.mhskel: 163 ossos; cada ponta de osso é a média de alguns vértices."""

    def __init__(self):
        with abrir('rigs/default.mhskel') as f:
            d = json.load(f)
        self.ossos = d['bones']
        self.juntas = {k: np.array(v, dtype=int) for k, v in d['joints'].items()}
        with abrir('rigs/default_weights.mhw') as f:
            w = json.load(f)
        self.pesos = {k: (np.array([int(a) for a, _ in v]), np.array([float(b) for _, b in v]))
                      for k, v in w['weights'].items()}

    def posicoes(self, V):
        """Cabeça e cauda de cada osso para os vértices dados."""
        J = {k: V[idx].mean(axis=0) for k, idx in self.juntas.items()}
        cab = {n: J[o['head']] for n, o in self.ossos.items()}
        cau = {n: J[o['tail']] for n, o in self.ossos.items()}
        return cab, cau

    def matriz_pesos(self, n_vert):
        nomes = sorted(self.pesos)
        W = np.zeros((n_vert, len(nomes)))
        for j, nm in enumerate(nomes):
            idx, w = self.pesos[nm]
            W[idx, j] = w
        return nomes, W


# ---------------------------------------------------------------------------
# olhos (proxy low-poly do MakeHuman: cada vértice coincide com um vértice auxiliar)
# ---------------------------------------------------------------------------
def olhos():
    """Devolve (índices na malha base, coordenadas de textura por canto, faces)."""
    with abrir('eyes/low-poly/low-poly.mhclo') as f:
        linhas = f.read().splitlines()
    i = linhas.index('verts 0') + 1
    idx = []
    while i < len(linhas) and linhas[i].strip() and not linhas[i].startswith('#'):
        p = linhas[i].split()
        if len(p) != 1:
            break
        idx.append(int(p[0]))
        i += 1
    V, VT, F, FT = [], [], [], []
    with abrir('eyes/low-poly/low-poly.obj') as f:
        for l in f:
            if l.startswith('v '):
                V.append(1)
            elif l.startswith('vt '):
                VT.append([float(x) for x in l.split()[1:3]])
            elif l.startswith('f '):
                ps = [x.split('/') for x in l.split()[1:]]
                F.append([int(p[0]) - 1 for p in ps])
                FT.append([int(p[1]) - 1 for p in ps])
    assert len(idx) == len(V), (len(idx), len(V))
    return np.array(idx), np.array(VT), F, FT
