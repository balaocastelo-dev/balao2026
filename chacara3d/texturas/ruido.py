# -*- coding: utf-8 -*-
"""Ferramentas de base para as texturas procedurais da Chácara 3D.

Tudo aqui é periódico: o fim da imagem emenda no começo, nos dois sentidos,
para a textura repetir sem costura. Por isso:

- o ruído é sintetizado no espectro (FFT), que já é periódico por natureza;
- desfoque, deformação e derivadas "dão a volta" na borda;
- as peças (pedras, seixos, folhas) são carimbadas com índice módulo N;
- o Voronoi usa as sementes repetidas 3 × 3 vezes.

As medidas são sempre em metros. A classe `Grade` guarda o tamanho físico
da textura e quantos metros cada pixel cobre, para que os elementos saiam
com o tamanho real (um tijolo de 21 cm tem 21 cm, seja qual for a resolução).
"""
from __future__ import annotations

import numpy as np
import cv2
from scipy.spatial import cKDTree

F32 = np.float32


# ---------------------------------------------------------------- grade física
class Grade:
    """Grade de pixels com tamanho físico (metros)."""

    def __init__(self, largura_px: int, altura_px: int, largura_m: float, altura_m: float):
        self.w = int(largura_px)
        self.h = int(altura_px)
        self.lm = float(largura_m)
        self.am = float(altura_m)
        self.dx = self.lm / self.w   # metros por pixel no sentido u (colunas)
        self.dy = self.am / self.h   # metros por pixel no sentido v (linhas)

    @property
    def forma(self):
        return (self.h, self.w)

    def coords(self):
        """X (para a direita) e Y (para baixo, sentido das linhas) em metros."""
        x = ((np.arange(self.w, dtype=F32) + 0.5) * self.dx).astype(F32)
        y = ((np.arange(self.h, dtype=F32) + 0.5) * self.dy).astype(F32)
        return np.meshgrid(x, y)

    def px(self, metros: float) -> float:
        """Quantos pixels (média dos dois eixos) cabem em `metros`."""
        return metros / (0.5 * (self.dx + self.dy))

    def frequencias(self):
        """Frequências (ciclos por metro) do espectro rfft2."""
        fy = np.fft.fftfreq(self.h, d=self.dy).astype(F32)[:, None]
        fx = np.fft.rfftfreq(self.w, d=self.dx).astype(F32)[None, :]
        return fx, fy


# ---------------------------------------------------------------- utilidades
def gerador(semente: int):
    return np.random.default_rng(semente)


def suave(a, b, x):
    """smoothstep de a até b."""
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def normalizar(a):
    """Média zero e desvio 1."""
    a = a - a.mean()
    s = a.std()
    return (a / (s if s > 1e-12 else 1.0)).astype(F32)


def faixa01(a, baixo=0.0, alto=1.0):
    """Reescala para [baixo, alto] usando mínimo e máximo."""
    mn, mx = float(a.min()), float(a.max())
    return (baixo + (a - mn) / max(mx - mn, 1e-12) * (alto - baixo)).astype(F32)


# ---------------------------------------------------------------- cor
def hex_lin(cor: str):
    """'#rrggbb' (sRGB) -> rgb linear (float32)."""
    cor = cor.lstrip('#')
    s = np.array([int(cor[i:i + 2], 16) / 255.0 for i in (0, 2, 4)], dtype=F32)
    return srgb_para_lin(s)


def srgb_para_lin(s):
    s = np.asarray(s, dtype=F32)
    return np.where(s <= 0.04045, s / 12.92, ((s + 0.055) / 1.055) ** 2.4).astype(F32)


def lin_para_srgb(l):
    l = np.clip(np.asarray(l, dtype=F32), 0.0, 1.0)
    return np.where(l <= 0.0031308, l * 12.92, 1.055 * np.power(l, 1 / 2.4) - 0.055).astype(F32)


def luminancia(rgb):
    return (rgb[..., 0] * 0.2126 + rgb[..., 1] * 0.7152 + rgb[..., 2] * 0.0722).astype(F32)


def misturar(a, b, t):
    """Interpolação linear; t pode ser 2-D e a/b cores ou imagens."""
    t = np.asarray(t, dtype=F32)
    if t.ndim == 2 and (np.ndim(a) == 3 or np.ndim(b) == 3 or np.ndim(a) == 1 or np.ndim(b) == 1):
        t = t[..., None]
    return (a + (b - a) * t).astype(F32)


def ajustar_hsv(rgb_lin, matiz=0.0, sat=1.0, val=1.0):
    """Ajuste simples de matiz (graus), saturação e valor sobre rgb linear."""
    s = lin_para_srgb(rgb_lin)
    hsv = cv2.cvtColor(s.astype(F32), cv2.COLOR_RGB2HSV)
    hsv[..., 0] = (hsv[..., 0] + matiz) % 360.0
    hsv[..., 1] = np.clip(hsv[..., 1] * sat, 0, 1)
    hsv[..., 2] = np.clip(hsv[..., 2] * val, 0, 1)
    return srgb_para_lin(cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB))


# ---------------------------------------------------------------- ruído espectral
def ruido(g: Grade, semente: int, maior: float, menor: float, beta: float = 1.0,
          alongamento: float = 1.0, angulo: float = 0.0, rng=None):
    """Ruído gaussiano periódico com detalhes entre `menor` e `maior` metros.

    beta: expoente da amplitude (1 = cada oitava com peso parecido; 2 = mais liso).
    alongamento > 1 estica os detalhes no sentido `angulo` (radianos, 0 = eixo u).
    """
    r = rng if rng is not None else gerador(semente)
    branco = r.standard_normal(g.forma).astype(F32)
    F = np.fft.rfft2(branco)
    fx, fy = g.frequencias()
    c, s = np.cos(angulo), np.sin(angulo)
    u = fx * c + fy * s
    v = -fx * s + fy * c
    f = np.sqrt((u * alongamento) ** 2 + v ** 2)
    fmin, fmax = 1.0 / maior, 1.0 / menor
    f_seg = np.where(f > 0, f, 1.0)
    amp = f_seg ** (-beta)
    amp *= (1.0 - np.exp(-(f / fmin) ** 2)) * np.exp(-(f / fmax) ** 2)
    amp[0, 0] = 0.0
    out = np.fft.irfft2(F * amp, s=g.forma).astype(F32)
    return normalizar(out)


def fbm(g: Grade, semente: int, maior: float, menor: float, rugosidade: float = 0.55,
        alongamento: float = 1.0, angulo: float = 0.0):
    """Atalho: ruído com espectro do tipo fBm, rugosidade 0..1 (0.5 = natural)."""
    beta = 2.0 - 2.0 * np.clip(rugosidade, 0.0, 1.0) + 0.3
    return ruido(g, semente, maior, menor, beta=beta, alongamento=alongamento, angulo=angulo)


def cristas(n):
    """Ruído de cristas (ridged) a partir de ruído gaussiano normalizado."""
    return (1.0 - np.abs(np.tanh(n * 0.8))).astype(F32)


# ---------------------------------------------------------------- filtros periódicos
def desfocar(img, g: Grade, sigma_m: float):
    """Desfoque gaussiano periódico (sigma em metros) feito no espectro."""
    if sigma_m <= 0:
        return img.astype(F32)
    fx, fy = g.frequencias()
    G = np.exp(-2.0 * (np.pi ** 2) * (sigma_m ** 2) * (fx ** 2 + fy ** 2)).astype(F32)
    if img.ndim == 2:
        return np.fft.irfft2(np.fft.rfft2(img) * G, s=g.forma).astype(F32)
    return np.stack([np.fft.irfft2(np.fft.rfft2(img[..., k]) * G, s=g.forma)
                     for k in range(img.shape[2])], axis=-1).astype(F32)


def deformar(img, dx_m, dy_m, g: Grade, interp=cv2.INTER_LINEAR):
    """Amostra img em (x + dx, y + dy) — deformação de domínio periódica."""
    jj, ii = np.meshgrid(np.arange(g.w, dtype=F32), np.arange(g.h, dtype=F32))
    mx = (jj + dx_m / g.dx).astype(F32)
    my = (ii + dy_m / g.dy).astype(F32)
    return cv2.remap(img.astype(F32), mx, my, interp, borderMode=cv2.BORDER_WRAP)


def reamostrar(img, w_novo: int, h_novo: int):
    """Muda a resolução mantendo a periodicidade."""
    h, w = img.shape[:2]
    if (w_novo, h_novo) == (w, h):
        return img.astype(F32)
    if w % w_novo == 0 and h % h_novo == 0:
        fx, fy = w // w_novo, h // h_novo
        if img.ndim == 2:
            return img.reshape(h_novo, fy, w_novo, fx).mean(axis=(1, 3)).astype(F32)
        return img.reshape(h_novo, fy, w_novo, fx, img.shape[2]).mean(axis=(1, 3)).astype(F32)
    # fator não inteiro: pré-desfoque (se for reduzir) e remap com volta
    escala = max(w / w_novo, h / h_novo)
    src = img.astype(F32)
    if escala > 1.2:
        gtmp = Grade(w, h, w, h)
        src = desfocar(src, gtmp, 0.45 * escala)
    jj, ii = np.meshgrid(np.arange(w_novo, dtype=F32), np.arange(h_novo, dtype=F32))
    mx = ((jj + 0.5) * (w / w_novo) - 0.5).astype(F32)
    my = ((ii + 0.5) * (h / h_novo) - 0.5).astype(F32)
    return cv2.remap(src, mx, my, cv2.INTER_CUBIC, borderMode=cv2.BORDER_WRAP)


def rolar(a, di, dj):
    return np.roll(np.roll(a, di, axis=0), dj, axis=1)


# ---------------------------------------------------------------- Voronoi periódico
def voronoi(g: Grade, pontos, pesos=None, k: int = 8, desvio=None, bloco: int = 128):
    """Voronoi (ou diagrama de potência, se houver pesos) periódico.

    pontos: (n, 2) em metros (x, y). pesos: (n,) em m² (células maiores com peso maior).
    desvio: (dx, dy) em metros somados à posição de consulta (bordas irregulares).
    Devolve dict com:
      id     célula de cada pixel (int32)
      borda  distância (m) até a borda mais próxima da célula
      lx, ly posição do pixel relativa à semente da célula (m)
      viz    célula vizinha mais próxima (do outro lado da borda)
    """
    pontos = np.asarray(pontos, dtype=np.float64)
    n = len(pontos)
    desl = np.array([(a * g.lm, b * g.am) for a in (-1, 0, 1) for b in (-1, 0, 1)])
    todos = (pontos[None, :, :] + desl[:, None, :]).reshape(-1, 2)
    idx_base = np.tile(np.arange(n), 9)
    w_todos = np.zeros(len(todos)) if pesos is None else np.tile(np.asarray(pesos, np.float64), 9)
    arvore = cKDTree(todos)
    X, Y = g.coords()
    if desvio is not None:
        X = X + desvio[0]
        Y = Y + desvio[1]
    ids = np.empty(g.forma, np.int32)
    viz = np.empty(g.forma, np.int32)
    borda = np.empty(g.forma, F32)
    lx = np.empty(g.forma, F32)
    ly = np.empty(g.forma, F32)
    k = min(k, len(todos))
    for i0 in range(0, g.h, bloco):
        i1 = min(g.h, i0 + bloco)
        q = np.stack([X[i0:i1].ravel(), Y[i0:i1].ravel()], axis=1).astype(np.float64)
        d, nn = arvore.query(q, k=k)
        pd = d ** 2 - w_todos[nn]
        o = np.argmin(pd, axis=1)
        linhas = np.arange(len(q))
        ni = nn[linhas, o]
        pi = todos[ni]
        pdi = pd[linhas, o]
        pj = todos[nn]                      # (m, k, 2)
        sep = np.linalg.norm(pj - pi[:, None, :], axis=2)
        with np.errstate(divide='ignore', invalid='ignore'):
            db = (pd - pdi[:, None]) / (2.0 * sep)
        db[linhas, o] = np.inf
        db[sep < 1e-9] = np.inf
        oj = np.argmin(db, axis=1)
        ids[i0:i1] = idx_base[ni].reshape(i1 - i0, g.w)
        viz[i0:i1] = idx_base[nn[linhas, oj]].reshape(i1 - i0, g.w)
        borda[i0:i1] = db[linhas, oj].reshape(i1 - i0, g.w)
        lx[i0:i1] = (q[:, 0] - pi[:, 0]).reshape(i1 - i0, g.w)
        ly[i0:i1] = (q[:, 1] - pi[:, 1]).reshape(i1 - i0, g.w)
    return {'id': ids, 'borda': borda, 'lx': lx, 'ly': ly, 'viz': viz}


def pontos_poisson(rng, lm, am, raios, fator=1.0, tentativas=60):
    """Distribui discos de raios dados (do maior ao menor) sem sobreposição, periódico.

    Devolve (pontos (m, 2), raios aceitos (m,)).
    """
    raios = np.sort(np.asarray(raios, dtype=np.float64))[::-1]
    pts = np.zeros((len(raios), 2))
    rs = np.zeros(len(raios))
    m = 0
    for r in raios:
        for _ in range(tentativas):
            p = rng.random(2) * (lm, am)
            if m:
                d = np.abs(pts[:m] - p)
                d[:, 0] = np.minimum(d[:, 0], lm - d[:, 0])
                d[:, 1] = np.minimum(d[:, 1], am - d[:, 1])
                if np.any(np.hypot(d[:, 0], d[:, 1]) < fator * (rs[:m] + r)):
                    continue
            pts[m] = p
            rs[m] = r
            m += 1
            break
    return pts[:m], rs[:m]


def lloyd(g: Grade, pontos, passos=1, pesos=None):
    """Relaxamento de Lloyd periódico (células mais regulares)."""
    pts = np.array(pontos, dtype=np.float64)
    gg = Grade(max(64, g.w // 8), max(64, g.h // 8), g.lm, g.am)
    for _ in range(passos):
        v = voronoi(gg, pts, pesos=pesos, k=6)
        X, Y = gg.coords()
        for j in range(len(pts)):
            sel = v['id'] == j
            if not np.any(sel):
                continue
            pts[j, 0] = (pts[j, 0] + v['lx'][sel].mean()) % g.lm
            pts[j, 1] = (pts[j, 1] + v['ly'][sel].mean()) % g.am
    return pts


# ---------------------------------------------------------------- carimbos periódicos
class Tela:
    """Acumula elementos (pedras, folhas…) num mapa de altura com z-buffer.

    Cada carimbo traz altura e quaisquer outras camadas (cor, rugosidade…);
    onde a altura nova é maior, o elemento novo fica por cima.
    """

    def __init__(self, g: Grade, base_altura, camadas: dict):
        self.g = g
        self.alt = base_altura.astype(F32).copy()
        self.cam = {k: v.astype(F32).copy() for k, v in camadas.items()}
        self.ident = np.full(g.forma, -1, np.int32)

    def carimbar(self, r0: int, c0: int, alt, camadas: dict, mascara=None, ident: int = 0,
                 modo='max'):
        hp, wp = alt.shape
        linhas = (r0 + np.arange(hp)) % self.g.h
        colunas = (c0 + np.arange(wp)) % self.g.w
        ix = np.ix_(linhas, colunas)
        atual = self.alt[ix]
        if modo == 'max':
            vence = alt > atual
        else:                       # 'sobre': sempre por cima onde há máscara
            vence = np.ones_like(atual, bool)
        if mascara is not None:
            vence &= mascara
        self.alt[ix] = np.where(vence, alt, atual)
        for k, v in camadas.items():
            dst = self.cam[k]
            cur = dst[ix]
            if cur.ndim == 3:
                dst[ix] = np.where(vence[..., None], v, cur)
            else:
                dst[ix] = np.where(vence, v, cur)
        self.ident[ix] = np.where(vence, ident, self.ident[ix])
        return vence


# ---------------------------------------------------------------- mapas derivados
def normal_de_altura(alt_m, g: Grade, forca: float = 1.0):
    """Mapa normal (convenção OpenGL: +X direita, +Y topo da imagem) a partir da altura.

    Usa Sobel periódico; `forca` multiplica o relevo.
    """
    a = alt_m.astype(np.float64)
    # Sobel: derivada em x suavizada em y, e vice-versa
    sx = (rolar(a, 1, -1) + 2 * rolar(a, 0, -1) + rolar(a, -1, -1)
          - rolar(a, 1, 1) - 2 * rolar(a, 0, 1) - rolar(a, -1, 1)) / (8.0 * g.dx)
    sy = (rolar(a, -1, 1) + 2 * rolar(a, -1, 0) + rolar(a, -1, -1)
          - rolar(a, 1, 1) - 2 * rolar(a, 1, 0) - rolar(a, 1, -1)) / (8.0 * g.dy)
    # sx = dh/dx (x para a direita); sy = dh/d(linha) (para baixo)
    nx = -sx * forca
    ny = sy * forca           # y da imagem cresce para baixo; +Y do mapa é para cima
    nz = np.ones_like(nx)
    inv = 1.0 / np.sqrt(nx * nx + ny * ny + nz * nz)
    return np.stack([nx * inv, ny * inv, nz * inv], axis=-1).astype(F32)


def oclusao(alt_m, g: Grade, raio_m: float, direcoes: int = 12, passos: int = 10,
            forca: float = 1.0):
    """Oclusão ambiente pelo horizonte do mapa de altura (periódica).

    Para cada direção acha o maior ângulo de elevação até `raio_m` e soma a
    parte do céu visível ponderada pelo cosseno (cos² da elevação).
    """
    a = alt_m.astype(F32)
    raio_px = max(2.0, raio_m / min(g.dx, g.dy))
    dists = np.unique(np.round(np.geomspace(1.0, raio_px, passos)).astype(int))
    vis = np.zeros(g.forma, F32)
    for kdir in range(direcoes):
        th = 2 * np.pi * (kdir + 0.5) / direcoes
        tmax = np.zeros(g.forma, F32)
        vistos = set()
        for s in dists:
            dj = int(round(s * np.cos(th)))
            di = int(round(s * np.sin(th)))
            if (di, dj) in vistos or (di == 0 and dj == 0):
                continue
            vistos.add((di, dj))
            dist = np.hypot(dj * g.dx, di * g.dy)
            t = (rolar(a, -di, -dj) - a) / dist
            np.maximum(tmax, t, out=tmax)
        vis += 1.0 / (1.0 + (tmax * forca) ** 2)
    return (vis / direcoes).astype(F32)


def cavidade(alt_m, g: Grade, sigma_m: float):
    """Diferença entre a altura e a média local (negativo = buraco)."""
    return (alt_m - desfocar(alt_m, g, sigma_m)).astype(F32)


# ---------------------------------------------------------------- formas úteis
def elipse_patch(a_px, b_px, angulo, pad=2):
    """Coordenadas locais normalizadas de uma elipse girada num recorte quadrado.

    Devolve (u, v, r) onde r = 1 na borda da elipse; e o tamanho do recorte.
    """
    R = int(np.ceil(max(a_px, b_px))) + pad
    yy, xx = np.mgrid[-R:R + 1, -R:R + 1].astype(F32)
    c, s = np.cos(angulo), np.sin(angulo)
    u = (xx * c + yy * s) / max(a_px, 1e-3)
    v = (-xx * s + yy * c) / max(b_px, 1e-3)
    return u, v, np.sqrt(u * u + v * v), R


def poligono_aleatorio(rng, nvert, irregular=0.35):
    """Ângulos e raios de um polígono convexo-ish aleatório (raio médio 1)."""
    ang = np.sort(rng.random(nvert) * 2 * np.pi)
    # espalha ângulos para não ficarem colados
    ang = (np.linspace(0, 2 * np.pi, nvert, endpoint=False) + rng.random() * 2 * np.pi
           + (ang - np.linspace(0, 2 * np.pi, nvert, endpoint=False)) * 0.25)
    raios = 1.0 + (rng.random(nvert) - 0.5) * 2 * irregular
    return ang, raios
