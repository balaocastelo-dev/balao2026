"""Formas por campo de distância (SDF) e extração da superfície por "surface nets".

Só usa numpy. Cada bicho é descrito como uma lista de primitivas (elipsoides e
cones arredondados) juntadas com união suave; a superfície é extraída numa
grade fina, os vértices são projetados de volta na superfície exata e depois o
Blender reduz a malha para o orçamento de triângulos.

Cada primitiva leva uma `regiao`, usada depois para calcular os pesos da pele
(qual grupo de ossos manda naquela parte do corpo).
"""
import numpy as np

F32 = np.float32


def normalizar(v):
    v = np.asarray(v, dtype=float)
    return v / np.linalg.norm(v)


def base_de(eixo_y, referencia_z=(0.0, 0.0, 1.0)):
    """Matriz 3x3 (colunas = eixos locais X, Y, Z) com Y ao longo de `eixo_y`."""
    y = normalizar(eixo_y)
    z = np.asarray(referencia_z, dtype=float)
    z = z - y * np.dot(z, y)
    if np.linalg.norm(z) < 1e-6:
        z = np.array([1.0, 0.0, 0.0]) - y * y[0]
    z = normalizar(z)
    x = np.cross(y, z)
    return np.stack([x, y, z], axis=1)


def rot_x(graus):
    a = np.radians(graus)
    c, s = np.cos(a), np.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]], dtype=float)


def rot_y(graus):
    a = np.radians(graus)
    c, s = np.cos(a), np.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]], dtype=float)


def rot_z(graus):
    a = np.radians(graus)
    c, s = np.cos(a), np.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]], dtype=float)


class Primitiva:
    """Base: guarda região, modo (união/subtração), suavidade e esfera envolvente."""

    def __init__(self, regiao, k=0.01, subtrai=False):
        self.regiao = regiao
        self.k = float(k)
        self.subtrai = subtrai
        self.centro_env = np.zeros(3)
        self.raio_env = 1.0

    def limite_inferior(self, cmin, cmax):
        """Menor distância possível da primitiva a uma caixa (para pular trechos longe)."""
        q = np.maximum(np.maximum(cmin - self.centro_env, self.centro_env - cmax), 0.0)
        return np.linalg.norm(q) - self.raio_env

    def dist(self, p):
        raise NotImplementedError


class Elipsoide(Primitiva):
    def __init__(self, centro, semi, rot=None, regiao='corpo', k=0.01, subtrai=False):
        super().__init__(regiao, k, subtrai)
        self.c = np.asarray(centro, dtype=float)
        self.s = np.asarray(semi, dtype=float)
        self.R = np.eye(3) if rot is None else np.asarray(rot, dtype=float)
        self.centro_env = self.c
        self.raio_env = float(self.s.max())

    def dist(self, p):
        q = (p - self.c.astype(F32)) @ self.R.astype(F32)  # coordenadas locais
        s = self.s.astype(F32)
        k0 = np.linalg.norm(q / s, axis=1)
        k1 = np.linalg.norm(q / (s * s), axis=1)
        return k0 * (k0 - 1.0) / np.maximum(k1, 1e-9)


class Cone(Primitiva):
    """Cone arredondado (cápsula afunilada) de `a` (raio ra) até `b` (raio rb).

    `achata` = (fator lateral, fator vertical) da seção, aplicados no referencial
    da peça (X local = lado, Z local = `cima`)."""

    def __init__(self, a, b, ra, rb, regiao='corpo', k=0.01, subtrai=False,
                 achata=(1.0, 1.0), cima=(0.0, 0.0, 1.0)):
        super().__init__(regiao, k, subtrai)
        self.a = np.asarray(a, dtype=float)
        self.b = np.asarray(b, dtype=float)
        self.ra, self.rb = float(ra), float(rb)
        self.achata = np.array([achata[0], 1.0, achata[1]], dtype=float)
        self.R = base_de(self.b - self.a, cima)
        self.comp = float(np.linalg.norm(self.b - self.a))
        self.centro_env = (self.a + self.b) / 2
        self.raio_env = self.comp / 2 + max(self.ra, self.rb) * max(1.0, self.achata.max())

    def dist(self, p):
        q = (p - self.a.astype(F32)) @ self.R.astype(F32)
        q = q / self.achata.astype(F32)
        # cone arredondado de Inigo Quilez com o eixo em Y local, de 0 a comp
        h = self.comp
        r1, r2 = self.ra, self.rb
        x = np.sqrt(q[:, 0] ** 2 + q[:, 2] ** 2)
        y = q[:, 1]
        b = (r1 - r2) / h
        a = np.sqrt(max(1.0 - b * b, 1e-9))
        k = x * (-b) + y * a  # dot(q, (-b, a))
        d1 = np.sqrt(x * x + y * y) - r1
        d2 = np.sqrt(x * x + (y - h) ** 2) - r2
        d3 = x * a + y * b - r1  # dot(q, (a, b)) - r1
        d = np.where(k < 0.0, d1, np.where(k > a * h, d2, d3))
        return d * F32(min(self.achata[0], self.achata[2]))


def uniao_suave(a, b, k):
    if k <= 0:
        return np.minimum(a, b)
    h = np.maximum(k - np.abs(a - b), 0.0) / k
    return np.minimum(a, b) - h * h * k * 0.25


def subtracao_suave(a, b, k):
    """Tira `b` de `a`."""
    if k <= 0:
        return np.maximum(a, -b)
    h = np.maximum(k - np.abs(a + b), 0.0) / k
    return np.maximum(a, -b) + h * h * k * 0.25


class Forma:
    """Lista ordenada de primitivas que compõem um corpo."""

    def __init__(self):
        self.prims = []

    def adicionar(self, prim):
        self.prims.append(prim)
        return prim

    def avaliar(self, p, faixa=None, cmin=None, cmax=None):
        p = np.asarray(p, dtype=F32)
        d = np.full(len(p), 10.0, dtype=F32)
        for pr in self.prims:
            if faixa is not None:
                lb = pr.limite_inferior(cmin, cmax)
                if lb > faixa + pr.k + 0.002:
                    continue
            dp = pr.dist(p)
            if pr.subtrai:
                d = subtracao_suave(d, dp, pr.k)
            else:
                d = uniao_suave(d, dp, pr.k)
        return d

    def gradiente(self, p, eps=2e-4):
        p = np.asarray(p, dtype=F32)
        g = np.zeros_like(p)
        for i in range(3):
            dp = np.zeros(3, dtype=F32)
            dp[i] = eps
            g[:, i] = (self.avaliar(p + dp) - self.avaliar(p - dp)) / (2 * eps)
        return g

    def distancias_por_regiao(self, p):
        """Para cada região, a menor distância das primitivas (de união) dela."""
        p = np.asarray(p, dtype=F32)
        out = {}
        for pr in self.prims:
            if pr.subtrai:
                continue
            d = pr.dist(p)
            out[pr.regiao] = np.minimum(out[pr.regiao], d) if pr.regiao in out else d
        return out


def extrair(forma, cmin, cmax, passo, iter_proj=3):
    """Extrai a superfície de nível zero com "surface nets".

    Devolve (vertices Nx3 float64, quads Mx4 int) com normais para fora."""
    cmin = np.asarray(cmin, dtype=float)
    cmax = np.asarray(cmax, dtype=float)
    n = np.ceil((cmax - cmin) / passo).astype(int) + 1
    nx, ny, nz = (int(v) for v in n)
    ys = (cmin[1] + np.arange(ny) * passo).astype(F32)
    zs = (cmin[2] + np.arange(nz) * passo).astype(F32)
    f = np.empty((nx, ny, nz), dtype=F32)
    faixa = 3 * passo
    bloco = 6
    YY, ZZ = np.meshgrid(ys, zs, indexing='ij')
    for i0 in range(0, nx, bloco):
        i1 = min(nx, i0 + bloco)
        xs = (cmin[0] + np.arange(i0, i1) * passo).astype(F32)
        pts = np.empty((i1 - i0, ny, nz, 3), dtype=F32)
        pts[..., 0] = xs[:, None, None]
        pts[..., 1] = YY[None]
        pts[..., 2] = ZZ[None]
        bmin = np.array([xs[0], ys[0], zs[0]], dtype=float)
        bmax = np.array([xs[-1], ys[-1], zs[-1]], dtype=float)
        f[i0:i1] = forma.avaliar(pts.reshape(-1, 3), faixa, bmin, bmax).reshape(i1 - i0, ny, nz)
    dentro = f < 0
    # células ativas: cantos com sinais diferentes
    soma = np.zeros((nx - 1, ny - 1, nz - 1), dtype=np.uint8)
    cantos = [(i, j, k) for i in (0, 1) for j in (0, 1) for k in (0, 1)]
    for (i, j, k) in cantos:
        soma += dentro[i:nx - 1 + i, j:ny - 1 + j, k:nz - 1 + k]
    ativa = (soma > 0) & (soma < 8)
    del soma
    idx = np.argwhere(ativa)
    mapa = np.full(ativa.shape, -1, dtype=np.int32)
    mapa[idx[:, 0], idx[:, 1], idx[:, 2]] = np.arange(len(idx), dtype=np.int32)
    # posição de cada vértice: média dos cruzamentos nas 12 arestas da célula
    arestas = [((0, 0, 0), (1, 0, 0)), ((0, 1, 0), (1, 1, 0)), ((0, 0, 1), (1, 0, 1)), ((0, 1, 1), (1, 1, 1)),
               ((0, 0, 0), (0, 1, 0)), ((1, 0, 0), (1, 1, 0)), ((0, 0, 1), (0, 1, 1)), ((1, 0, 1), (1, 1, 1)),
               ((0, 0, 0), (0, 0, 1)), ((1, 0, 0), (1, 0, 1)), ((0, 1, 0), (0, 1, 1)), ((1, 1, 0), (1, 1, 1))]
    acum = np.zeros((len(idx), 3), dtype=np.float64)
    cont = np.zeros(len(idx), dtype=np.float64)
    for (o1, o2) in arestas:
        v1 = f[idx[:, 0] + o1[0], idx[:, 1] + o1[1], idx[:, 2] + o1[2]].astype(np.float64)
        v2 = f[idx[:, 0] + o2[0], idx[:, 1] + o2[1], idx[:, 2] + o2[2]].astype(np.float64)
        cruza = (v1 < 0) != (v2 < 0)
        t = np.where(cruza, v1 / np.where(cruza, v1 - v2, 1.0), 0.0)
        pos = np.array(o1, dtype=float)[None] + t[:, None] * (np.array(o2, dtype=float) - np.array(o1, dtype=float))[None]
        acum += np.where(cruza[:, None], pos, 0.0)
        cont += cruza
    verts = cmin[None] + (idx + acum / np.maximum(cont, 1)[:, None]) * passo
    # quads: uma por aresta da grade com troca de sinal
    quads = []
    normais_esp = []
    # aresta em X entre (i,j,k) e (i+1,j,k): células (i,j-1,k-1),(i,j,k-1),(i,j,k),(i,j-1,k)
    for eixo in range(3):
        if eixo == 0:
            troca = dentro[:-1, 1:-1, 1:-1] != dentro[1:, 1:-1, 1:-1]
            e = np.argwhere(troca)
            i, j, k = e[:, 0], e[:, 1] + 1, e[:, 2] + 1
            c = [mapa[i, j - 1, k - 1], mapa[i, j, k - 1], mapa[i, j, k], mapa[i, j - 1, k]]
            sentido = dentro[i, j, k]
        elif eixo == 1:
            troca = dentro[1:-1, :-1, 1:-1] != dentro[1:-1, 1:, 1:-1]
            e = np.argwhere(troca)
            i, j, k = e[:, 0] + 1, e[:, 1], e[:, 2] + 1
            c = [mapa[i - 1, j, k - 1], mapa[i - 1, j, k], mapa[i, j, k], mapa[i, j, k - 1]]
            sentido = dentro[i, j, k]
        else:
            troca = dentro[1:-1, 1:-1, :-1] != dentro[1:-1, 1:-1, 1:]
            e = np.argwhere(troca)
            i, j, k = e[:, 0] + 1, e[:, 1] + 1, e[:, 2]
            c = [mapa[i - 1, j - 1, k], mapa[i, j - 1, k], mapa[i, j, k], mapa[i - 1, j, k]]
            sentido = dentro[i, j, k]
        q = np.stack(c, axis=1)
        esp = np.zeros((len(q), 3))
        esp[:, eixo] = np.where(sentido, 1.0, -1.0)  # dentro embaixo -> normal para +eixo
        quads.append(q)
        normais_esp.append(esp)
    quads = np.concatenate(quads)
    esp = np.concatenate(normais_esp)
    ok = (quads >= 0).all(axis=1)
    quads, esp = quads[ok], esp[ok]
    # orienta cada quad conforme a normal esperada
    p0, p1, p2, p3 = (verts[quads[:, t]] for t in range(4))
    nq = np.cross(p2 - p0, p3 - p1)
    vira = (nq * esp).sum(axis=1) < 0
    quads[vira] = quads[vira][:, ::-1]
    del f, dentro, mapa
    # projeta os vértices na superfície exata (Newton com gradiente numérico)
    for _ in range(iter_proj):
        d = forma.avaliar(verts).astype(np.float64)
        g = forma.gradiente(verts).astype(np.float64)
        g2 = np.maximum((g * g).sum(axis=1), 1e-8)
        passo_n = (d / g2)[:, None] * g
        # não deixa andar mais que uma célula
        lim = np.linalg.norm(passo_n, axis=1)
        escala = np.minimum(1.0, passo / np.maximum(lim, 1e-12))
        verts = verts - passo_n * escala[:, None]
    return verts, quads


def projetar(forma, verts, iteracoes=3, limite=0.003):
    """Leva os vértices de volta para a superfície exata (Newton)."""
    v = np.asarray(verts, dtype=np.float64).copy()
    for _ in range(iteracoes):
        d = forma.avaliar(v).astype(np.float64)
        g = forma.gradiente(v).astype(np.float64)
        g2 = np.maximum((g * g).sum(axis=1), 1e-8)
        passo = (d / g2)[:, None] * g
        n = np.linalg.norm(passo, axis=1)
        passo *= np.minimum(1.0, limite / np.maximum(n, 1e-12))[:, None]
        v -= passo
    return v


def relaxar(forma, verts, arestas, iteracoes=4, lam=0.35, travados=None):
    """Alisamento só na tangente + reprojeção: melhora os triângulos sem mudar a forma."""
    v = np.asarray(verts, dtype=np.float64).copy()
    n = len(v)
    grau = np.bincount(arestas.ravel(), minlength=n).astype(np.float64)
    for _ in range(iteracoes):
        soma = np.zeros_like(v)
        np.add.at(soma, arestas[:, 0], v[arestas[:, 1]])
        np.add.at(soma, arestas[:, 1], v[arestas[:, 0]])
        media = soma / np.maximum(grau, 1)[:, None]
        g = forma.gradiente(v).astype(np.float64)
        g /= np.maximum(np.linalg.norm(g, axis=1, keepdims=True), 1e-12)
        d = media - v
        d -= g * (d * g).sum(axis=1, keepdims=True)
        if travados is not None:
            d *= (1.0 - travados)[:, None]
        v += lam * d
        v = projetar(forma, v, 2)
    return v


def faces_ruins(forma, verts, tris, limiar=0.1):
    """Índices das faces cuja normal discorda da forma (dobradas pela redução)."""
    a, b, c = verts[tris[:, 0]], verts[tris[:, 1]], verts[tris[:, 2]]
    nf = np.cross(b - a, c - a)
    area2 = np.linalg.norm(nf, axis=1)
    nf = nf / np.maximum(area2, 1e-15)[:, None]
    cen = (a + b + c) / 3
    g = forma.gradiente(cen).astype(np.float64)
    g /= np.maximum(np.linalg.norm(g, axis=1, keepdims=True), 1e-12)
    return np.nonzero(((nf * g).sum(axis=1) < limiar) | (area2 < 1e-10))[0]
