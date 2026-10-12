"""Núcleo da pintura procedural da folhagem.

Funções básicas usadas por todos os geradores de textura de folhas e cascas:
cores, transições suaves, ruídos (comum e periódico, para emendar sem costura),
células de Voronoi, linhas desenhadas por campo de fase, redução de
superamostragem, sangria de cor nos pixels transparentes e gravação dos
arquivos (PNG/WebP/JPEG).

Convenção de eixos dentro do código: as imagens são arrays numpy com a linha 0
no TOPO (como o arquivo final). Quando um cálculo usa "y para cima", isso está
dito no próprio trecho.
"""
import os
import numpy as np
import cv2
from scipy import ndimage
from scipy.spatial import cKDTree
from PIL import Image, ImageFile

ImageFile.MAXBLOCK = 1 << 24      # JPEG otimizado de imagem grande precisa de buffer maior

cv2.setNumThreads(2)


# ------------------------------------------------------------------ cores
def cor(hexa):
    """'#RRGGBB' -> array float32 sRGB 0..1."""
    hexa = hexa.lstrip('#')
    return np.array([int(hexa[i:i + 2], 16) / 255.0 for i in (0, 2, 4)], np.float32)


def misturar(a, b, t):
    """Interpola a -> b; t pode ser escalar ou array (H,W) (vira (H,W,1))."""
    t = np.asarray(t, np.float32)
    if t.ndim == 2:
        t = t[..., None]
    return a + (b - a) * t


def suave(e0, e1, x):
    """smoothstep: 0 em e0, 1 em e1 (aceita e0 > e1)."""
    t = np.clip((np.asarray(x, np.float32) - e0) / (e1 - e0 + 1e-12), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def variar_cor(c, rng, dh=0.0, ds=0.0, dv=0.0):
    """Varia matiz (graus), saturação e valor (fatores) de uma cor sRGB 0..1."""
    c = np.asarray(c, np.float32).reshape(1, 1, 3)
    hsv = cv2.cvtColor(c, cv2.COLOR_RGB2HSV)
    hsv[..., 0] = (hsv[..., 0] + rng.uniform(-dh, dh)) % 360.0
    hsv[..., 1] = np.clip(hsv[..., 1] * (1 + rng.uniform(-ds, ds)), 0, 1)
    hsv[..., 2] = np.clip(hsv[..., 2] * (1 + rng.uniform(-dv, dv)), 0, 1)
    return cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB).reshape(3)


def srgb_para_linear(c):
    c = np.asarray(c, np.float32)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def linear_para_srgb(c):
    c = np.clip(np.asarray(c, np.float32), 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - 0.055)


# ------------------------------------------------------------------ ruídos
def ruido_fractal(rng, h, w, escala, oitavas=4, persistencia=0.5, aniso=(1.0, 1.0)):
    """Ruído de valor fractal (não periódico), média 0 e desvio ~1.

    escala: tamanho em pixels da maior "mancha"; aniso=(fy, fx) estica a
    mancha nas linhas/colunas (fator > 1 estica).
    """
    total = np.zeros((h, w), np.float32)
    amp, soma = 1.0, 0.0
    for o in range(oitavas):
        cy = max(1.5, escala * aniso[0] / 2 ** o)
        cx = max(1.5, escala * aniso[1] / 2 ** o)
        gh, gw = int(h / cy) + 4, int(w / cx) + 4
        g = rng.standard_normal((gh, gw)).astype(np.float32)
        H, W = int(gh * cy), int(gw * cx)
        up = cv2.resize(g, (W, H), interpolation=cv2.INTER_CUBIC)
        oy = int(rng.integers(0, max(1, H - h - int(cy) * 2))) + int(cy)
        ox = int(rng.integers(0, max(1, W - w - int(cx) * 2))) + int(cx)
        total += amp * up[oy:oy + h, ox:ox + w]
        soma += amp * amp
        amp *= persistencia
    total /= np.sqrt(soma) + 1e-9
    return total / (total.std() + 1e-9)


def ruido_periodico(rng, h, w, expoente=2.0, fmin=1.0, fmax=None, aniso=(1.0, 1.0)):
    """Ruído espectral periódico (emenda sem costura nos dois sentidos).

    expoente: inclinação do espectro de potência (2 = "nuvem", 1 = mais granulado).
    fmin/fmax: ciclos por ladrilho. aniso=(fy, fx): fy > 1 estica as manchas na
    vertical (veios/fibras verticais), fx > 1 estica na horizontal.
    """
    ky = np.fft.fftfreq(h) * h
    kx = np.fft.rfftfreq(w) * w
    K = np.sqrt((ky[:, None] * aniso[0]) ** 2 + (kx[None, :] * aniso[1]) ** 2)
    amp = np.where(K > 0, K, 1.0) ** (-expoente / 2.0)
    amp[K < fmin] = 0.0
    if fmax is not None:
        amp *= np.exp(-(K / fmax) ** 4)
    fase = rng.standard_normal(amp.shape) + 1j * rng.standard_normal(amp.shape)
    n = np.fft.irfft2(fase * amp, s=(h, w)).astype(np.float32)
    n -= n.mean()
    return n / (n.std() + 1e-9)


def celulas(pontos, ys, xs, periodo=None, k=2):
    """Distâncias às k sementes mais próximas (Voronoi/Worley).

    pontos: (n,2) em (y, x) pixels; ys, xs: grades de coordenadas.
    periodo=(H, W) torna o padrão periódico. Devolve (dist (…,k), índices (…,k)).
    """
    p = np.asarray(pontos, np.float64)
    ids = np.arange(len(p))
    if periodo is not None:
        H, W = periodo
        cop, cid = [], []
        for dy in (-H, 0, H):
            for dx in (-W, 0, W):
                cop.append(p + [dy, dx])
                cid.append(ids)
        p = np.concatenate(cop)
        ids = np.concatenate(cid)
    arv = cKDTree(p)
    q = np.stack([np.ravel(ys), np.ravel(xs)], -1)
    d, i = arv.query(q, k=k, workers=2)
    forma = np.shape(ys) + (k,)
    return d.reshape(forma).astype(np.float32), ids[i].reshape(forma)


# ------------------------------------------------------------------ linhas e bordas
def linha_fase(fase, meia_larg_px, grad=None):
    """Máscara anti-serrilhada das linhas onde 'fase' é inteira.

    meia_larg_px pode ser array. O gradiente em pixels converte a distância
    em fase para distância em pixels.
    """
    if grad is None:
        gy, gx = np.gradient(fase)
        grad = np.sqrt(gx * gx + gy * gy) + 1e-6
    d = np.abs(fase - np.round(fase)) / grad
    return suave(meia_larg_px + 0.6, meia_larg_px - 0.6, d), d


def borda_suave(dist_assinada, px_por_unidade=1.0):
    """Alfa anti-serrilhado a partir de uma distância assinada (positiva dentro).

    A distância é normalizada pelo próprio gradiente, assim funciona mesmo
    quando a função não é uma distância exata.
    """
    gy, gx = np.gradient(dist_assinada)
    g = np.sqrt(gx * gx + gy * gy) + 1e-9
    return np.clip(0.5 + dist_assinada / g, 0.0, 1.0)


# ------------------------------------------------------------------ composição
def reduzir(premul, fator):
    """Reduz por média de área (fator inteiro)."""
    if fator == 1:
        return premul
    h, w = premul.shape[:2]
    return cv2.resize(premul, (w // fator, h // fator), interpolation=cv2.INTER_AREA)


def preencher_empurra_puxa(premul, alfa):
    """Preenchimento "push-pull": cor suave e contínua em toda a área transparente."""
    h, w = alfa.shape
    if min(h, w) <= 2:
        a = alfa.sum()
        m = premul.reshape(-1, 3).sum(0) / max(a, 1e-6)
        return np.broadcast_to(m, premul.shape).astype(np.float32).copy()
    p2 = cv2.resize(premul, (max(1, w // 2), max(1, h // 2)), interpolation=cv2.INTER_AREA)
    a2 = cv2.resize(alfa, (max(1, w // 2), max(1, h // 2)), interpolation=cv2.INTER_AREA)
    grossa = preencher_empurra_puxa(p2, a2)
    up = cv2.resize(grossa, (w, h), interpolation=cv2.INTER_LINEAR)
    a = np.clip(alfa, 0, 1)[..., None]
    return premul + (1 - a) * up


def sangrar(rgb, alfa, raio=12):
    """Espalha a cor das folhas para os pixels transparentes.

    Até 'raio' px da borda vale a cor do pixel opaco mais próximo (levemente
    suavizada); mais longe, um preenchimento contínuo (empurra-puxa). Assim o
    mipmap não puxa halo escuro nem branco.
    """
    alfa = alfa.astype(np.float32)
    solido = alfa > 0.35
    if not solido.any():
        return rgb
    d, ind = ndimage.distance_transform_edt(~solido, return_indices=True)
    perto = rgb[ind[0], ind[1]]
    perto = cv2.GaussianBlur(perto, (0, 0), 1.5)
    longe = preencher_empurra_puxa(rgb * alfa[..., None] * solido[..., None], alfa * solido)
    longe = cv2.GaussianBlur(longe, (0, 0), 3.0)
    t = suave(raio * 0.6, raio * 3.0, d)[..., None]
    fundo = perto * (1 - t) + longe * t
    k = suave(0.05, 0.6, alfa)[..., None]
    return (rgb * k + fundo * (1 - k)).astype(np.float32)


def normal_para_rgb(n):
    """Normal (H,W,3) em espaço tangente (x direita, y para o topo, z para fora) -> uint8."""
    n = n / (np.linalg.norm(n, axis=-1, keepdims=True) + 1e-9)
    return np.clip(np.round((n * 0.5 + 0.5) * 255), 0, 255).astype(np.uint8)


def normal_de_altura(alt, forca, periodico=True):
    """Normal (convenção OpenGL) a partir de um mapa de altura em pixels.

    'forca' multiplica as derivadas (altura em px de textura). Linha 0 = topo.
    """
    if periodico:
        dx = (np.roll(alt, -1, 1) - np.roll(alt, 1, 1)) * 0.5
        dyb = (np.roll(alt, -1, 0) - np.roll(alt, 1, 0)) * 0.5  # derivada para BAIXO
    else:
        dyb, dx = np.gradient(alt)
    dy = -dyb  # para cima
    n = np.stack([-dx * forca, -dy * forca, np.ones_like(alt)], -1)
    return n / np.linalg.norm(n, axis=-1, keepdims=True)


# ------------------------------------------------------------------ gravação
def u8(x):
    return np.clip(np.round(np.asarray(x) * 255.0), 0, 255).astype(np.uint8)


def gravar_rgba(caminho, rgb, alfa, webp_acima=1.5e6):
    """PNG RGBA (alfa reto). Se passar de ~1,5 MB grava também um .webp ao lado."""
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    img = np.dstack([u8(rgb), u8(alfa)])
    Image.fromarray(img, 'RGBA').save(caminho, optimize=True, compress_level=9)
    extras = []
    if os.path.getsize(caminho) > webp_acima:
        cw = caminho[:-4] + '.webp'
        Image.fromarray(img, 'RGBA').save(cw, quality=90, method=6, exact=True)
        extras.append(cw)
    return [caminho] + extras


def gravar_rgb_png(caminho, rgb8):
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    Image.fromarray(rgb8, 'RGB').save(caminho, optimize=True, compress_level=9)
    return caminho


def gravar_jpg(caminho, rgb8, qualidade):
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    Image.fromarray(rgb8, 'RGB').save(caminho, quality=qualidade, optimize=True, subsampling=0 if qualidade >= 90 else 2)
    return caminho
