"""Leitura de BVH (captura de movimento da CMU e do MakeHuman) e cinemática direta.

Resultado por quadro: rotação no mundo (3x3) e posição de cada junta, nos eixos do
arquivo (os BVH da CMU convertidos por B. Hahne: Y para cima, olhando para +Z, quadro
0 em pose T).
"""
import gzip

import numpy as np


def _R(eixo, graus):
    a = np.radians(graus)
    c, s = np.cos(a), np.sin(a)
    if eixo == 'X':
        return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
    if eixo == 'Y':
        return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])


def _R_vet(eixo, graus):
    a = np.radians(graus)
    c, s = np.cos(a), np.sin(a)
    n = len(a)
    R = np.zeros((n, 3, 3))
    if eixo == 'X':
        R[:, 0, 0] = 1
        R[:, 1, 1], R[:, 1, 2], R[:, 2, 1], R[:, 2, 2] = c, -s, s, c
    elif eixo == 'Y':
        R[:, 1, 1] = 1
        R[:, 0, 0], R[:, 0, 2], R[:, 2, 0], R[:, 2, 2] = c, s, -s, c
    else:
        R[:, 2, 2] = 1
        R[:, 0, 0], R[:, 0, 1], R[:, 1, 0], R[:, 1, 1] = c, -s, s, c
    return R


class BVH:
    def __init__(self, caminho):
        abre = gzip.open if caminho.endswith('.gz') else open
        with abre(caminho, 'rt') as f:
            texto = f.read().split()
        self.nomes, self.pai, self.offset, self.canais = [], [], [], []
        self.fim = {}
        i = 0
        pilha = []
        atual = None
        assert texto[i] == 'HIERARCHY'
        i += 1
        while texto[i] != 'MOTION':
            t = texto[i]
            if t in ('ROOT', 'JOINT'):
                nome = texto[i + 1]
                self.nomes.append(nome)
                self.pai.append(pilha[-1] if pilha else -1)
                self.offset.append(None)
                self.canais.append([])
                atual = len(self.nomes) - 1
                i += 2
            elif t == 'End':
                # End Site { OFFSET x y z }
                j = texto.index('OFFSET', i)
                self.fim[pilha[-1] if texto[i + 2] == '{' else atual] = np.array([float(x) for x in texto[j + 1:j + 4]])
                k = texto.index('}', j)
                i = k + 1
                continue
            elif t == '{':
                pilha.append(atual)
                i += 1
            elif t == '}':
                pilha.pop()
                i += 1
            elif t == 'OFFSET':
                self.offset[atual] = np.array([float(x) for x in texto[i + 1:i + 4]])
                i += 4
            elif t == 'CHANNELS':
                n = int(texto[i + 1])
                self.canais[atual] = texto[i + 2:i + 2 + n]
                i += 2 + n
            else:
                i += 1
        i += 1
        assert texto[i] == 'Frames:'
        self.n = int(texto[i + 1])
        assert texto[i + 2] == 'Frame' and texto[i + 3] == 'Time:'
        self.dt = float(texto[i + 4])
        dados = np.array(texto[i + 5:], dtype=float)
        nc = sum(len(c) for c in self.canais)
        self.dados = dados[:self.n * nc].reshape(self.n, nc)
        self.idx = {n: k for k, n in enumerate(self.nomes)}
        self.offset = np.array(self.offset)

    def fk(self, quadros=None):
        """Rotações no mundo (n, J, 3, 3) e posições (n, J, 3) das juntas."""
        D = self.dados if quadros is None else self.dados[quadros]
        n = len(D)
        J = len(self.nomes)
        G = np.zeros((n, J, 3, 3))
        P = np.zeros((n, J, 3))
        col = 0
        for j in range(J):
            R = np.repeat(np.eye(3)[None], n, axis=0)
            pos = np.repeat(self.offset[j][None], n, axis=0)
            for c in self.canais[j]:
                v = D[:, col]
                col += 1
                if c.endswith('position'):
                    pos = pos.copy()
                    pos[:, 'XYZ'.index(c[0])] = v if self.pai[j] < 0 else pos[:, 'XYZ'.index(c[0])] + v
                else:
                    R = R @ _R_vet(c[0], v)
            p = self.pai[j]
            if p < 0:
                G[:, j] = R
                P[:, j] = pos
            else:
                G[:, j] = G[:, p] @ R
                P[:, j] = P[:, p] + np.einsum('nij,nj->ni', G[:, p], pos)
        return G, P

    def ponta(self, G, P, nome):
        """Posição do fim (End Site) de uma junta."""
        j = self.idx[nome]
        return P[:, j] + np.einsum('nij,j->ni', G[:, j], self.fim[j])


def reamostrar(G, P, dt, fps=30):
    """Reamostra para `fps` (interpolação linear de posições, slerp aproximado nas rotações)."""
    n = G.shape[0]
    dur = (n - 1) * dt
    m = int(np.floor(dur * fps + 1e-6)) + 1
    t = np.arange(m) / fps / dt
    i0 = np.clip(np.floor(t).astype(int), 0, n - 1)
    i1 = np.clip(i0 + 1, 0, n - 1)
    a = (t - i0)[:, None, None]
    P2 = P[i0] * (1 - a) + P[i1] * a
    G2 = G[i0] * (1 - a[..., None]) + G[i1] * a[..., None]
    # ortonormaliza
    U, _, Vt = np.linalg.svd(G2)
    G2 = U @ Vt
    return G2, P2
