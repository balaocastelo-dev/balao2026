"""Rasterizador simples em numpy (só para conferência durante o desenvolvimento).

Desenha triângulos com z-buffer e luz difusa, numa câmera ortográfica. Serve para
olhar a malha, os pesos e as máscaras sem abrir o navegador. As folhas de contato
finais são feitas no Chromium com o three.js (ver `previa/`).
"""
import numpy as np


def camera_ortho(direcao, alvo, escala, tam, cima=(0, 1, 0)):
    """Matriz que leva pontos do mundo para (x_pix, y_pix, profundidade)."""
    d = np.asarray(direcao, float)
    d = d / np.linalg.norm(d)            # direção para onde a câmera olha
    c = np.asarray(cima, float)
    if abs(d @ c) > 0.99:
        c = np.array([0.0, 0.0, -1.0]) if d[1] < 0 else np.array([0.0, 0.0, 1.0])
    x = np.cross(d, c)
    x /= np.linalg.norm(x)
    y = np.cross(x, d)
    w, h = tam
    px = h / escala                       # pixels por metro (escala = altura visível)

    def proj(P):
        Q = np.asarray(P, float) - np.asarray(alvo, float)
        u = Q @ x * px + w / 2
        v = -(Q @ y) * px + h / 2
        z = Q @ d
        return np.stack([u, v, z], axis=1)
    return proj, d


def desenhar(V, F, cor, proj, d_cam, tam, luz=(0.4, 0.8, 0.6), fundo=(40, 44, 52), img=None, zbuf=None,
             dois_lados=True, ambiente=0.35):
    """`cor`: (n_vert,3) em 0..1 (interpolada) ou (n_faces,3)."""
    w, h = tam
    if img is None:
        img = np.empty((h, w, 3), float)
        img[:] = np.asarray(fundo, float) / 255.0
        zbuf = np.full((h, w), np.inf)
    P = proj(V)
    luz = np.asarray(luz, float)
    luz /= np.linalg.norm(luz)
    T = V[F]
    n = np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0])
    n /= np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)
    vira = (n @ d_cam) > 0
    if not dois_lados:
        F = F[~vira]
        n = n[~vira]
        vira = vira[~vira]
    n[vira] *= -1
    difu = np.clip(n @ luz, 0, 1)
    sh = ambiente + (1 - ambiente) * difu
    cor = np.asarray(cor, float)
    por_vert = cor.shape[0] == len(V) and cor.shape[0] != len(F)
    for i, f in enumerate(F):
        p = P[f]
        x0, x1 = int(max(np.floor(p[:, 0].min()), 0)), int(min(np.ceil(p[:, 0].max()), w - 1))
        y0, y1 = int(max(np.floor(p[:, 1].min()), 0)), int(min(np.ceil(p[:, 1].max()), h - 1))
        if x1 < x0 or y1 < y0:
            continue
        xs, ys = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
        a, b, c = p[0], p[1], p[2]
        den = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
        if abs(den) < 1e-12:
            continue
        l0 = ((b[1] - c[1]) * (xs - c[0]) + (c[0] - b[0]) * (ys - c[1])) / den
        l1 = ((c[1] - a[1]) * (xs - c[0]) + (a[0] - c[0]) * (ys - c[1])) / den
        l2 = 1 - l0 - l1
        m = (l0 >= -1e-6) & (l1 >= -1e-6) & (l2 >= -1e-6)
        if not m.any():
            continue
        z = l0 * a[2] + l1 * b[2] + l2 * c[2]
        yy, xx = (ys[m] - 0.5).astype(int), (xs[m] - 0.5).astype(int)
        zz = z[m]
        ok = zz < zbuf[yy, xx]
        if not ok.any():
            continue
        yy, xx, zz = yy[ok], xx[ok], zz[ok]
        zbuf[yy, xx] = zz
        if por_vert:
            cc = (l0[m][ok, None] * cor[f[0]] + l1[m][ok, None] * cor[f[1]] + l2[m][ok, None] * cor[f[2]])
        else:
            cc = np.broadcast_to(cor[i], (len(zz), 3))
        img[yy, xx] = cc * sh[i]
    return img, zbuf


def salvar(img, caminho):
    from PIL import Image
    Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).save(caminho)


def vistas(V, F, cor, caminho, alvo=None, escala=None, tam=(300, 520), direcoes=None, rotulos=None):
    """Frente, lado e costas lado a lado."""
    from PIL import Image, ImageDraw
    if alvo is None:
        alvo = (V.min(0) + V.max(0)) / 2
    if escala is None:
        escala = (V.max(0) - V.min(0))[1] * 1.08
    if direcoes is None:
        direcoes = [(0, 0, -1), (-1, 0, 0), (0, 0, 1)]   # frente (olhando para -Z), lado esquerdo, costas
    ims = []
    for d in direcoes:
        proj, dd = camera_ortho(d, alvo, escala, tam)
        im, _ = desenhar(V, F, cor, proj, dd, tam)
        ims.append(im)
    folha = np.concatenate(ims, axis=1)
    pil = Image.fromarray((np.clip(folha, 0, 1) * 255).astype(np.uint8))
    if rotulos:
        dr = ImageDraw.Draw(pil)
        for i, r in enumerate(rotulos):
            dr.text((i * tam[0] + 5, 5), r, fill=(255, 255, 255))
    pil.save(caminho)
    return caminho
