"""Poses do esqueleto das pessoas: rotações no mundo, FK, IK de braço e perna.

Uma pose é um dicionário osso -> rotação no mundo (3x3, relativa ao repouso, que é
identidade em todos os ossos) mais a posição do quadril. Como o repouso é identidade,
a rotação local de cada osso é simplesmente R_pai^T @ R_osso.
"""
import numpy as np

import ossos as O


# ---------------------------------------------------------------------------
# rotações
# ---------------------------------------------------------------------------
def rot(eixo, graus):
    e = np.asarray(eixo, float)
    n = np.linalg.norm(e)
    if n < 1e-12 or abs(graus) < 1e-12:
        return np.eye(3)
    e = e / n
    a = np.radians(graus)
    K = np.array([[0, -e[2], e[1]], [e[2], 0, -e[0]], [-e[1], e[0], 0]])
    return np.eye(3) + np.sin(a) * K + (1 - np.cos(a)) * K @ K


X, Y, Z = np.eye(3)


def Rx(g):
    return rot(X, g)


def Ry(g):
    return rot(Y, g)


def Rz(g):
    return rot(Z, g)


def norm(v):
    v = np.asarray(v, float)
    n = np.linalg.norm(v)
    return v / n if n > 1e-12 else v


def quadro(d, p):
    """Base ortonormal com o 1º eixo em `d` e o 2º perto de `p`."""
    d = norm(d)
    p = np.asarray(p, float) - d * (np.dot(p, d))
    p = norm(p)
    return np.stack([d, p, np.cross(d, p)], axis=1)


def alinhar(d0, p0, d, p):
    """Rotação que leva o quadro (d0, p0) ao quadro (d, p)."""
    return quadro(d, p) @ quadro(d0, p0).T


def minima(a, b):
    """Menor rotação que leva a direção a para b."""
    a, b = norm(a), norm(b)
    c = np.cross(a, b)
    s = np.linalg.norm(c)
    d = float(np.clip(np.dot(a, b), -1, 1))
    if s < 1e-9:
        if d > 0:
            return np.eye(3)
        q = np.cross(a, X if abs(a[0]) < 0.9 else Y)
        return rot(q, 180)
    return rot(c, np.degrees(np.arctan2(s, d)))


def angulo_eixo(R):
    """Rotação -> (eixo, graus)."""
    c = np.clip((np.trace(R) - 1) / 2, -1, 1)
    a = np.arccos(c)
    if a < 1e-9:
        return np.array([0, 1.0, 0]), 0.0
    e = np.array([R[2, 1] - R[1, 2], R[0, 2] - R[2, 0], R[1, 0] - R[0, 1]])
    n = np.linalg.norm(e)
    if n < 1e-9:   # 180 graus
        w, v = np.linalg.eigh((R + np.eye(3)) / 2)
        e = v[:, -1]
    else:
        e = e / n
    return e, np.degrees(a)


def slerp_R(R0, R1, t):
    e, a = angulo_eixo(R0.T @ R1)
    return R0 @ rot(e, a * t)


def torcao(R, eixo):
    """Parte de R que gira em volta de `eixo` (decomposição balanço-torção), em graus."""
    from gltf import quat_de_matriz
    q = quat_de_matriz(R)
    e = norm(eixo)
    p = np.dot(q[:3], e)
    tw = np.array([*(e * p), q[3]])
    n = np.linalg.norm(tw)
    if n < 1e-9:
        return 0.0
    tw /= n
    ang = 2 * np.degrees(np.arctan2(np.dot(tw[:3], e), tw[3]))
    if ang > 180:
        ang -= 360
    if ang < -180:
        ang += 360
    return ang


# ---------------------------------------------------------------------------
# IK de dois ossos
# ---------------------------------------------------------------------------
def ik_dois(a, alvo, l1, l2, polo):
    """Posição da junta do meio. `polo`: direção para onde a junta do meio deve apontar."""
    d = alvo - a
    dist = np.linalg.norm(d)
    dist_c = np.clip(dist, abs(l1 - l2) + 1e-4, (l1 + l2) * 0.9999)
    u = d / max(dist, 1e-9)
    v = np.asarray(polo, float) - u * np.dot(polo, u)
    if np.linalg.norm(v) < 1e-6:
        v = np.cross(u, X if abs(u[0]) < 0.9 else Z)
    v = norm(v)
    ca = (l1 * l1 + dist_c * dist_c - l2 * l2) / (2 * l1 * dist_c)
    ang = np.arccos(np.clip(ca, -1, 1))
    return a + l1 * (np.cos(ang) * u + np.sin(ang) * v)


# ---------------------------------------------------------------------------
# esqueleto
# ---------------------------------------------------------------------------
class Esqueleto:
    def __init__(self, juntas, quadro_pega_e, quadro_pega_d):
        self.J = {k: np.asarray(v, float) for k, v in juntas.items()}
        self.pai = O.PAIS
        self.P_pega = {'pega_e': quadro_pega_e, 'pega_d': quadro_pega_d}
        self.comp = {}
        filhos = {'braco_e': 'antebraco_e', 'antebraco_e': 'mao_e', 'braco_d': 'antebraco_d', 'antebraco_d': 'mao_d',
                  'coxa_e': 'canela_e', 'canela_e': 'pe_e', 'coxa_d': 'canela_d', 'canela_d': 'pe_d',
                  'pe_e': 'dedos_pe_e', 'pe_d': 'dedos_pe_d', 'clavicula_e': 'braco_e', 'clavicula_d': 'braco_d',
                  'mao_e': 'pega_e', 'mao_d': 'pega_d'}
        self.filho = filhos
        for o, f in filhos.items():
            self.comp[o] = np.linalg.norm(self.J[f] - self.J[o])
        # eixo de dobra do cotovelo no repouso (o antebraço do MakeHuman já vem dobrado para a frente)
        self.dobra_cotovelo0 = {}
        for l in ('_e', '_d'):
            s, c, m = self.J['braco' + l], self.J['antebraco' + l], self.J['mao' + l]
            self.dobra_cotovelo0[l] = norm(np.cross(c - s, m - c))
        # altura do quadril, comprimento das pernas
        self.perna = self.comp['coxa_e'] + self.comp['canela_e']

    def rel(self, osso):
        """Vetor do pai até o osso, no repouso."""
        p = self.pai[osso]
        return self.J[osso] - (self.J[p] if p else 0)

    def fk(self, Rw, pos_quadril):
        """Posições das cabeças dos ossos no mundo."""
        P = {'raiz': np.zeros(3), 'quadril': np.asarray(pos_quadril, float)}
        for o in O.NOMES:
            if o in P:
                continue
            p = self.pai[o]
            P[o] = P[p] + Rw[p] @ self.rel(o)
        return P

    def locais(self, Rw):
        L = {}
        for o in O.NOMES:
            p = self.pai[o]
            if o.startswith('pega'):
                L[o] = self.P_pega[o]
            elif p is None:
                L[o] = Rw.get(o, np.eye(3))
            else:
                L[o] = Rw[p].T @ Rw[o]
        return L

    def mundo_pega(self, Rw, P, lado):
        """Quadro (3x3) e posição da pega no mundo."""
        R = Rw['mao' + lado] @ self.P_pega['pega' + lado]
        return R, P['pega' + lado]


def pele(V, W, esq, Rw, pq):
    """Skinning linear (só para medir contatos e conferir): vértices deformados."""
    import ossos as O
    P = esq.fk(Rw, pq)
    out = np.zeros_like(V)
    for j, o in enumerate(O.NOMES):
        w = W[:, j]
        idx = np.nonzero(w > 0)[0]
        if len(idx) == 0:
            continue
        R = Rw[o] if not o.startswith('pega') else Rw['mao' + o[-2:]]
        if o.startswith('pega'):
            continue
        out[idx] += w[idx, None] * ((V[idx] - esq.J[o]) @ R.T + P[o])
    return out
