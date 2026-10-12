"""Textura de detalhe (atlas 1024², sRGB) e textura dos olhos.

A textura multiplica a cor que o motor mistura pelas máscaras. Valor guardado ~0,90
(sRGB, ~0,79 linear) nas áreas lisas; mais escuro em dobras, costuras, cavidades,
sobrancelhas e mechas; os lábios ficam levemente mais rosados. A pele é neutra (sem
tom), para servir a todos os tons de pele.

Regiões (ver roupas.REG): pele e tecido usam o mapa do MakeHuman (cada texel sabe a
posição 3D do corpo em repouso, por rasterização), o resto é desenhado direto no UV.
"""
import io

import numpy as np
from PIL import Image

import ossos as O
import roupas as R

I = O.INDICE
TAM = 1024
LISO = 0.90


# ---------------------------------------------------------------------------
# rasterização no espaço UV
# ---------------------------------------------------------------------------
def rasterizar(UVpix, atrib, tam):
    """UVpix (m,3,2) em pixels; atrib (m,3,c). Devolve imagem (h,w,c) e máscara."""
    h, w = tam
    c = atrib.shape[-1]
    img = np.zeros((h, w, c), np.float32)
    msk = np.zeros((h, w), bool)
    for t in range(len(UVpix)):
        p = UVpix[t]
        x0, x1 = int(max(np.floor(p[:, 0].min()), 0)), int(min(np.ceil(p[:, 0].max()), w - 1))
        y0, y1 = int(max(np.floor(p[:, 1].min()), 0)), int(min(np.ceil(p[:, 1].max()), h - 1))
        if x1 < x0 or y1 < y0:
            continue
        xs, ys = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
        a, b, cc = p
        den = (b[1] - cc[1]) * (a[0] - cc[0]) + (cc[0] - b[0]) * (a[1] - cc[1])
        if abs(den) < 1e-12:
            continue
        l0 = ((b[1] - cc[1]) * (xs - cc[0]) + (cc[0] - b[0]) * (ys - cc[1])) / den
        l1 = ((cc[1] - a[1]) * (xs - cc[0]) + (a[0] - cc[0]) * (ys - cc[1])) / den
        l2 = 1 - l0 - l1
        m = (l0 >= -0.02) & (l1 >= -0.02) & (l2 >= -0.02)
        if not m.any():
            continue
        v = l0[m, None] * atrib[t, 0] + l1[m, None] * atrib[t, 1] + l2[m, None] * atrib[t, 2]
        yy, xx = (ys[m] - 0.5).astype(int), (xs[m] - 0.5).astype(int)
        img[yy, xx] = v
        msk[yy, xx] = True
    return img, msk


def dilatar(img, msk, passos=6):
    """Espalha a cor para fora das ilhas (evita costura escura no mipmap)."""
    img = img.copy()
    msk = msk.copy()
    for _ in range(passos):
        soma = np.zeros_like(img)
        cont = np.zeros(msk.shape, np.float32)
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            sm = np.roll(np.roll(msk, dy, 0), dx, 1)
            si = np.roll(np.roll(img, dy, 0), dx, 1)
            soma += si * sm[..., None]
            cont += sm
        novo = (~msk) & (cont > 0)
        img[novo] = soma[novo] / cont[novo, None]
        msk = msk | novo
    return img, msk


# ---------------------------------------------------------------------------
# ruídos
# ---------------------------------------------------------------------------
def ruido2(shape, escala, semente=0, oitavas=3):
    """Ruído de valor 2D suave (0..1) em pixels."""
    rng = np.random.default_rng(semente)
    h, w = shape
    out = np.zeros(shape, np.float32)
    amp, tot = 1.0, 0.0
    for o in range(oitavas):
        s = max(1, int(escala / (2 ** o)))
        gh, gw = h // s + 2, w // s + 2
        g = rng.random((gh, gw)).astype(np.float32)
        ys = np.arange(h) / s
        xs = np.arange(w) / s
        y0 = np.floor(ys).astype(int)
        x0 = np.floor(xs).astype(int)
        fy = (ys - y0)[:, None]
        fx = (xs - x0)[None, :]
        fy = fy * fy * (3 - 2 * fy)
        fx = fx * fx * (3 - 2 * fx)
        a = g[y0][:, x0]
        b = g[y0][:, x0 + 1]
        c = g[y0 + 1][:, x0]
        d = g[y0 + 1][:, x0 + 1]
        out += amp * ((a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy)
        tot += amp
        amp *= 0.5
    return out / tot


def ruido3_pts(P, escala, semente=0):
    import cabelo
    return cabelo.ruido3(P, escala, semente)


# ---------------------------------------------------------------------------
# oclusão de ambiente por vértice (Blender BVH)
# ---------------------------------------------------------------------------
def oclusao(V, F, N, raios=24, dist=0.18, semente=1):
    import bpy  # noqa: F401  (o mathutils vem junto com o bpy)
    from mathutils.bvhtree import BVHTree
    from mathutils import Vector
    arv = BVHTree.FromPolygons([tuple(v) for v in V], [tuple(int(i) for i in f) for f in F])
    rng = np.random.default_rng(semente)
    # direções no hemisfério (cosseno)
    u1 = rng.random(raios)
    u2 = rng.random(raios)
    r = np.sqrt(u1)
    th = 2 * np.pi * u2
    loc = np.c_[r * np.cos(th), r * np.sin(th), np.sqrt(1 - u1)]
    ao = np.zeros(len(V))
    for i in range(len(V)):
        n = N[i]
        a = np.cross(n, [0, 1.0, 0]) if abs(n[1]) < 0.9 else np.cross(n, [1.0, 0, 0])
        a /= np.linalg.norm(a)
        b = np.cross(n, a)
        dirs = loc[:, 0:1] * a + loc[:, 1:2] * b + loc[:, 2:3] * n
        o = Vector(V[i] + n * 0.0015)
        hit = 0
        for d in dirs:
            res = arv.ray_cast(o, Vector(d), dist)
            if res[0] is not None:
                hit += 1
        ao[i] = 1 - hit / raios
    return ao


# ---------------------------------------------------------------------------
# a textura
# ---------------------------------------------------------------------------
class Pintor:
    def __init__(self, base, d, tipo):
        self.b = base
        self.tipo = tipo
        self.k = base.k
        self.img = np.full((TAM, TAM, 3), LISO, np.float32)
        # corpo fino com o UV do MakeHuman
        Vf = np.asarray(d['Vfull'], float)
        Fq = np.asarray(d['Fq'])
        UVq = np.asarray(d['UVq'], float).copy()
        UVq[..., 1] = 1 - UVq[..., 1]
        F = np.concatenate([Fq[:, [0, 1, 2]], Fq[:, [0, 2, 3]]])
        UV = np.concatenate([UVq[:, [0, 1, 2]], UVq[:, [0, 2, 3]]])
        self.Vf, self.Ff, self.UVf = Vf, F, UV
        import malha as M
        self.Nf = M.Malha(Vf, F).normais()
        self.Wf = np.asarray(d['Wfull'], float)

    def regiao_px(self, reg):
        u0, v0, u1, v1 = R.REG[reg]
        return int(u0 * TAM), int(v0 * TAM), int(u1 * TAM), int(v1 * TAM)

    # ---------------------------------------------------------------- corpo (pele e tecido)
    def info_corpo(self):
        """Por texel do quadrante (512²): posição 3D, normal, pesos de alguns ossos, AO."""
        if hasattr(self, '_info'):
            return self._info
        n = TAM // 2
        ao = oclusao(self.Vf, self.Ff, self.Nf)
        ossos = ['cabeca', 'mao_e', 'mao_d', 'pe_e', 'pe_d', 'dedos_pe_e', 'dedos_pe_d']
        Wsel = np.stack([self.Wf[:, I[o]] for o in ossos], axis=1)
        atr_v = np.c_[self.Vf, self.Nf, ao, Wsel]
        atr = atr_v[self.Ff]
        uvpix = self.UVf * n
        img, msk = rasterizar(uvpix, atr, (n, n))
        img, msk = dilatar(img, msk, 4)
        self._info = (img, msk, ossos)
        return self._info

    def pintar_pele(self):
        info, msk, ossos = self.info_corpo()
        k = self.k
        b = self.b
        P = info[..., 0:3]
        N = info[..., 3:6]
        ao = info[..., 6]
        W = {o: info[..., 7 + i] for i, o in enumerate(ossos)}
        n = info.shape[0]
        val = np.full((n, n, 3), LISO, np.float32)
        # cavidades: escurece onde a oclusão é alta (sem mudar o tom)
        ao_s = np.clip(ao, 0, 1)
        val *= (0.62 + 0.38 * ao_s ** 0.8)[..., None]
        # leve variação da pele (poros/manchas), neutra
        r = ruido2((n, n), 12, 3, 3)
        val *= (0.97 + 0.06 * r)[..., None]
        cab = W['cabeca']
        olhos = b.marcos['olhos']
        boca = b.marcos['boca']
        x, y, z = P[..., 0], P[..., 1], P[..., 2]
        rosto = (cab > 0.5) & (z > olhos[2] - 0.05 * k)
        # sobrancelhas: arco com fios
        ax = np.abs(x)
        xc = 0.033 * k
        y_arco = olhos[1] + 0.024 * k + 0.004 * k * (1 - ((ax - xc) / (0.03 * k)) ** 2) - 0.003 * k * ((ax - 0.01 * k) / (0.05 * k))
        dy = (y - y_arco) / (0.0045 * k)
        larg = np.clip(1 - np.abs(ax - 0.034 * k) / (0.027 * k), 0, 1) ** 0.5
        afina = 0.7 + 0.3 * np.clip((0.05 * k - ax) / (0.04 * k), 0, 1)
        sob = np.exp(-(dy / afina) ** 2) * larg * rosto * (ax > 0.009 * k)
        fios = ruido2((n, n), 2, 11, 2)
        sob = np.clip(sob * (0.75 + 0.5 * fios), 0, 1)
        val *= (1 - 0.62 * sob)[..., None]
        # contorno dos olhos (borda da pálpebra e cílios): perto da abertura dos olhos
        for s in (1, -1):
            c = np.array([s * abs(b.cab['eye.L'][0]) * (1 if s > 0 else 1), olhos[1], olhos[2]])
            c[0] = s * abs(b.cab['eye.L'][0])
            dx = (x - c[0]) / (0.017 * k)
            dyy = (y - c[1] + 0.001 * k) / (0.0085 * k)
            rr = np.sqrt(dx ** 2 + dyy ** 2)
            anel = np.exp(-((rr - 1.0) / 0.22) ** 2) * rosto * (z > c[2] - 0.02 * k)
            cima = 1.0 + 0.6 * (y > c[1])
            val *= (1 - 0.45 * np.clip(anel * cima, 0, 1))[..., None]
            # pálpebra de cima levemente mais escura (sombra)
            palp = np.exp(-(((y - c[1] - 0.008 * k) / (0.005 * k)) ** 2) - (dx / 1.1) ** 2) * rosto
            val *= (1 - 0.12 * palp)[..., None]
        # lábios: mais rosados e um pouco mais escuros; linha da boca escura
        lx = np.abs(x) / (0.024 * k)
        arco = 0.0016 * k * np.cos(np.clip(np.abs(x) / (0.011 * k), 0, 1) * np.pi)       # arco do cupido
        sup = (y >= boca[1]) & (y < boca[1] + 0.0085 * k * (1 - lx ** 2.2) + arco)
        inf = (y < boca[1]) & (y > boca[1] - 0.011 * k * (1 - lx ** 2))
        labio = ((sup | inf) & (lx < 1) & (z > boca[2] - 0.022 * k) & (cab > 0.5)).astype(np.float32)
        from scipy.ndimage import gaussian_filter
        labio = gaussian_filter(labio, 1.2)
        tom = np.array([0.86, 0.66, 0.68], np.float32)
        val = val * (1 - labio[..., None]) + val * tom * labio[..., None]
        linha = np.exp(-((y - boca[1] + 0.0005 * k) / (0.0012 * k)) ** 2) * (lx < 1.05) * (z > boca[2] - 0.02 * k) * (cab > 0.5)
        val *= (1 - 0.45 * np.clip(linha, 0, 1))[..., None]
        # narinas
        nariz = self.ponta_nariz()
        for s in (1, -1):
            c = nariz + np.array([s * 0.0085 * k, -0.011 * k, -0.012 * k])
            d = np.sqrt(((x - c[0]) / (0.0045 * k)) ** 2 + ((y - c[1]) / (0.0028 * k)) ** 2 + ((z - c[2]) / (0.006 * k)) ** 2)
            val *= (1 - 0.55 * np.exp(-d ** 2))[..., None]
        # unhas: pontas dos dedos das mãos, do lado de cima, mais claras e lisas
        for l in ('_e', '_d'):
            mao = W['mao' + l]
            dedo_ponta = mao > 0.9
            _ = dedo_ponta
        self.img_pele = val
        x0, y0, x1, y1 = self.regiao_px('pele')
        self.img[y0:y1, x0:x1] = np.where(msk[..., None], val, LISO)

    def ponta_nariz(self):
        V, W = self.Vf, self.Wf
        cab = W[:, I['cabeca']] > 0.9
        olhos = self.b.marcos['olhos']
        boca = self.b.marcos['boca']
        sel = cab & (V[:, 1] < olhos[1]) & (V[:, 1] > boca[1]) & (np.abs(V[:, 0]) < 0.01)
        i = np.argmax(np.where(sel, V[:, 2], -9))
        return V[i]

    def pintar_tecido(self):
        info, msk, ossos = self.info_corpo()
        k = self.k
        J = self.b.J
        P = info[..., 0:3]
        N = info[..., 3:6]
        ao = info[..., 6]
        n = info.shape[0]
        val = np.full((n, n), LISO, np.float32)
        # a roupa passa por cima das cavidades: oclusão bem mais fraca que na pele
        val *= 0.86 + 0.14 * np.clip(ao, 0, 1) ** 0.7
        # trama do tecido (fina) e manchinhas de uso
        val *= 0.965 + 0.05 * ruido2((n, n), 1.5, 21, 1)
        val *= 0.97 + 0.05 * ruido2((n, n), 24, 22, 3)
        x, y, z = P[..., 0], P[..., 1], P[..., 2]
        dobras = np.zeros((n, n), np.float32)

        def junta(nome_a, nome_b, raio, freq, intens, semente):
            A = J[nome_a]
            B = J[nome_b]
            u = (B - A) / np.linalg.norm(B - A)
            q = P - A
            t = q @ u
            r = np.linalg.norm(q - t[..., None] * u, axis=-1)
            perto = np.exp(-(t / raio) ** 2) * np.clip(1 - (r - 0.06 * k) / (0.03 * k), 0, 1)
            onda = np.sin(t * freq + 3 * ruido2((n, n), 18, semente, 2)) * 0.5 + 0.5
            return perto * onda ** 3 * intens

        for l in ('_e', '_d'):
            dobras += junta('antebraco' + l, 'mao' + l, 0.05 * k, 220 / k, 0.35, 31)        # cotovelo
            dobras += junta('braco' + l, 'antebraco' + l, 0.06 * k, 160 / k, 0.25, 32)       # cava
            dobras += junta('canela' + l, 'pe' + l, 0.06 * k, 170 / k, 0.35, 33)            # joelho
            dobras += junta('pe' + l, 'canela' + l, 0.07 * k, 140 / k, 0.30, 34)            # tornozelo (calça)
            dobras += junta('coxa' + l, 'canela' + l, 0.05 * k, 150 / k, 0.10, 35)          # virilha
        # cintura: dobras horizontais
        yc = J['coxa_e'][1] + 0.10 * k
        no_tronco = np.abs(x) < 0.2 * k
        dobras += no_tronco * np.exp(-((y - yc) / (0.05 * k)) ** 2) * (np.sin(y * 260 / k + 4 * ruido2((n, n), 30, 36, 2)) * 0.5 + 0.5) ** 3 * 0.22
        val *= 1 - np.clip(dobras, 0, 0.5)
        # costuras: laterais do tronco, ombros, entreperna e lado de fora das pernas
        tronco = (y > J['coxa_e'][1]) & (y < J['pescoco'][1])
        ang = np.degrees(np.arctan2(x, z - J['coluna_2'][2]))
        cost = tronco * np.exp(-((np.abs(ang) - 90) / 2.2) ** 2)
        for l in ('_e', '_d'):
            s = 1 if l == '_e' else -1
            A, B = J['coxa' + l], J['pe' + l]
            u = (B - A) / np.linalg.norm(B - A)
            q = P - A
            t = q @ u
            rad = q - t[..., None] * u
            a2 = np.degrees(np.arctan2(rad[..., 0] * s, rad[..., 2]))
            perna = (t > 0.05) & (t < np.linalg.norm(B - A))
            cost = np.maximum(cost, perna * np.exp(-((np.abs(a2) - 90) / 3.0) ** 2))
            # ombro: do pescoço ao ombro, por cima
            ombro = (np.abs(z - J['braco' + l][2]) < 0.006 * k) & (s * x > 0.05 * k) & (s * x < np.abs(J['braco' + l][0])) & (y > J['braco' + l][1] - 0.02 * k)
            cost = np.maximum(cost, ombro * 0.8)
        pontos = (np.sin((y + x * 0.3) * 1400 / k) > 0.2).astype(np.float32)
        val *= 1 - 0.28 * cost * (0.6 + 0.4 * pontos)
        # sapatos: na ilha dos pés, faixa da sola clara e cadarço em cima
        pe = sum(info[..., 7 + ossos.index(o)] for o in ('pe_e', 'pe_d', 'dedos_pe_e', 'dedos_pe_d'))
        e_pe = (pe > 0.3) & (y < 0.2 * k)
        sola = np.clip((0.034 * k - y) / (0.006 * k), 0, 1)
        sapato = np.full((n, n), 0.80, np.float32) * (0.9 + 0.1 * ruido2((n, n), 6, 41, 2))
        sapato = sapato * (1 - sola) + 0.98 * sola
        sapato *= 1 - 0.35 * np.exp(-((y - 0.036 * k) / (0.0025 * k)) ** 2)          # junção sola/cabedal
        for l in ('_e', '_d'):
            A = J['pe' + l]
            dx = x - A[0]
            topo = (y > A[1] - 0.02 * k) & (np.abs(dx) < 0.022 * k) & (z > A[2] + 0.01 * k) & (z < A[2] + 0.09 * k)
            cad = topo * ((np.sin(z * 900 / k) > 0.3).astype(np.float32))
            sapato *= 1 - 0.30 * cad
        val = np.where(e_pe, sapato * (0.75 + 0.25 * np.clip(ao, 0, 1)), val)
        x0, y0, x1, y1 = self.regiao_px('tecido')
        self.img[y0:y1, x0:x1] = np.where(msk[..., None], val[..., None], LISO)

    # ---------------------------------------------------------------- regiões desenhadas no UV
    def pintar_cabelo(self):
        x0, y0, x1, y1 = self.regiao_px('cabelo')
        w, h = x1 - x0, y1 - y0
        u = np.arange(w)[None, :] / w
        v = np.arange(h)[:, None] / h
        # mechas: listras no sentido de v com ruído alongado
        along = ruido2((h, w), 3, 51, 2)
        # estica o ruído em v (mechas compridas): reamostra
        mech = np.zeros((h, w), np.float32)
        rng = np.random.default_rng(52)
        for f, a in ((90, 0.5), (190, 0.3), (380, 0.2)):
            fase = rng.uniform(0, 2 * np.pi)
            onda = np.sin(2 * np.pi * f * u + 6 * ruido2((h, w), 40, int(f), 2) + fase)
            mech += a * onda
        val = 0.80 + 0.16 * mech + 0.06 * (along - 0.5)
        # raiz mais escura em cima da cabeça e pontas (v alto) um pouco mais claras
        val *= 0.88 + 0.12 * np.clip(v * 2, 0, 1)
        self.img[y0:y1, x0:x1] = np.clip(val, 0.3, 1.0)[..., None]

    def pintar_barra(self):
        x0, y0, x1, y1 = self.regiao_px('barra')
        w, h = x1 - x0, y1 - y0
        u = np.arange(w)[None, :] / w
        v = np.arange(h)[:, None] / h
        val = np.full((h, w), LISO * 0.97, np.float32)
        # pesponto a 1/3 da faixa externa, pontinhos ao longo de u
        ponto = (np.sin(2 * np.pi * u * 160) > 0.1).astype(np.float32)
        val *= 1 - 0.30 * np.exp(-((v - 0.17) / 0.025) ** 2) * ponto
        # dobra (v = 1/3) mais escura, parte de dentro mais escura
        val *= 1 - 0.25 * np.exp(-((v - 0.333) / 0.04) ** 2)
        val = np.where(v > 0.36, val * 0.72, val)
        val *= 0.97 + 0.05 * ruido2((h, w), 1.5, 61, 1)
        self.img[y0:y1, x0:x1] = val[..., None]

    def pintar_saia(self):
        x0, y0, x1, y1 = self.regiao_px('saia')
        w, h = x1 - x0, y1 - y0
        u = np.arange(w)[None, :] / w
        v = np.arange(h)[:, None] / h
        pregas = np.sin(2 * np.pi * u * 9 + 1.5 * np.sin(2 * np.pi * u * 2)) * 0.5 + 0.5
        val = LISO * (0.86 + 0.14 * pregas ** 0.7 * (0.4 + 0.6 * v))
        val = val * (0.97 + 0.05 * ruido2((h, w), 1.5, 71, 1))
        ponto = (np.sin(2 * np.pi * u * 120) > 0.1).astype(np.float32)
        val *= 1 - 0.25 * np.exp(-((v - 0.86) / 0.012) ** 2) * ponto
        val = np.where(v > 0.89, val * 0.75, val)              # dobra de dentro
        val *= 1 - 0.25 * np.exp(-(v / 0.04) ** 2)              # cós
        self.img[y0:y1, x0:x1] = val[..., None]

    def pintar_sola(self):
        x0, y0, x1, y1 = self.regiao_px('sola')
        w, h = x1 - x0, y1 - y0
        u = np.arange(w)[None, :] / w
        v = np.arange(h)[:, None] / h
        val = np.full((h, w), 0.92, np.float32)
        val = np.where(v < 0.25, 0.9 * (0.95 + 0.05 * ruido2((h, w), 3, 81, 2)), val)       # palmilha
        val = np.where(v > 0.75, 0.55 + 0.1 * (np.sin(2 * np.pi * u * 60) > 0), val)       # solado
        val *= 1 - 0.3 * np.exp(-((v - 0.5) / 0.03) ** 2)
        self.img[y0:y1, x0:x1] = val[..., None]

    def pintar_tira(self):
        x0, y0, x1, y1 = self.regiao_px('tira')
        w, h = x1 - x0, y1 - y0
        val = 0.86 * (0.96 + 0.06 * ruido2((h, w), 2, 91, 1))
        self.img[y0:y1, x0:x1] = val[..., None]

    def pintar_chapeu(self):
        x0, y0, x1, y1 = self.regiao_px('chapeu')
        w, h = x1 - x0, y1 - y0
        uu = np.arange(w)[None, :]
        vv = np.arange(h)[:, None]
        # palha trançada: tramas cruzadas
        a = np.sin((uu + vv) * 0.9) * np.sin((uu - vv) * 0.9)
        trama = np.where(a > 0, 0.95, 0.70)
        val = trama * (0.85 + 0.15 * ruido2((h, w), 2, 101, 2))
        val *= 1 - 0.2 * (np.sin(vv * 0.35) > 0.92)
        self.img[y0:y1, x0:x1] = val[..., None]

    def pintar_bone(self):
        x0, y0, x1, y1 = self.regiao_px('bone')
        w, h = x1 - x0, y1 - y0
        u = np.arange(w)[None, :] / w
        v = np.arange(h)[:, None] / h
        val = np.full((h, w), LISO, np.float32) * (0.97 + 0.05 * ruido2((h, w), 1.5, 111, 1))
        # gomos da copa (6 costuras saindo do topo) e pesponto da aba
        gomo = np.exp(-((((u * 12) % 2) - 1) / 0.06) ** 2) * (v < 0.6)
        val *= 1 - 0.3 * gomo
        aba = (v > 0.7)
        pesp = np.exp(-(((v - 0.7) % 0.06 - 0.03) / 0.006) ** 2) * aba
        val *= 1 - 0.25 * pesp
        self.img[y0:y1, x0:x1] = val[..., None]

    def tudo(self):
        self.pintar_pele()
        self.pintar_tecido()
        self.pintar_cabelo()
        self.pintar_barra()
        self.pintar_saia()
        self.pintar_sola()
        self.pintar_tira()
        self.pintar_chapeu()
        self.pintar_bone()
        return self.img


def para_jpeg(img, qualidade=88):
    a = (np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8)
    b = io.BytesIO()
    Image.fromarray(a).save(b, 'JPEG', quality=qualidade, optimize=True, progressive=False)
    return b.getvalue()


def olho_jpeg(caminho_png, tam=256, qualidade=90):
    im = Image.open(caminho_png).convert('RGB').resize((tam, tam), Image.LANCZOS)
    b = io.BytesIO()
    im.save(b, 'JPEG', quality=qualidade)
    return b.getvalue()
