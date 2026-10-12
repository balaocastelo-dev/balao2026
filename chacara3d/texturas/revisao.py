# -*- coding: utf-8 -*-
"""Imagens de conferência das texturas (não vão para o site).

Para cada textura monta uma prancha com:
  (a) cor 2 × 2 (mostra se há costura), (b) mapa normal, (c) ORM,
  (d) cor iluminada por um sol rasante, (e) recorte 1:1 iluminado,
  (f) vista em perspectiva do chão (ou parede) com a textura repetida,
      como se vê no passeio — com mipmaps, sol, sombra do relevo e reflexo do céu.
A iluminação é feita em numpy, a partir dos JPEGs já gravados (confere o que vai para o site).
"""
from __future__ import annotations

import os
import numpy as np
import cv2
from PIL import Image

from ruido import F32, srgb_para_lin, lin_para_srgb, rolar

FONTE = cv2.FONT_HERSHEY_SIMPLEX


def ler_mapas(pasta, nome):
    def ler(suf):
        return np.asarray(Image.open(os.path.join(pasta, f'{nome}_{suf}.jpg')).convert('RGB'),
                          dtype=F32) / 255.0
    cor = ler('c')
    nrm = ler('n') * 2.0 - 1.0
    nrm /= np.linalg.norm(nrm, axis=-1, keepdims=True) + 1e-6
    orm = ler('orm')
    return cor, nrm, orm


def _ggx(n_h, n_l, n_v, rug):
    a = np.maximum(rug, 0.03) ** 2
    a2 = a * a
    d = a2 / (np.pi * (n_h * n_h * (a2 - 1) + 1) ** 2)
    k = a / 2
    gv = n_v / (n_v * (1 - k) + k)
    gl = n_l / (n_l * (1 - k) + k)
    return d * gv * gl / np.maximum(4 * n_l * n_v, 1e-4)


def sombra_relevo(alt_px, L, comprimento=48):
    """Sombra do relevo (alt em pixels) para luz L=(x, y-para-cima, z)."""
    if alt_px is None:
        return np.ones((1, 1), F32)
    horiz = np.hypot(L[0], L[1])
    if horiz < 1e-4:
        return np.ones_like(alt_px)
    dj, di = L[0] / horiz, -L[1] / horiz          # passo em colunas/linhas da imagem
    sobe = L[2] / horiz                             # subida por pixel andado
    ocl = np.zeros_like(alt_px)
    for t in np.unique(np.round(np.geomspace(1, comprimento, 22)).astype(int)):
        a = rolar(alt_px, -int(round(t * di)), -int(round(t * dj)))
        ocl = np.maximum(ocl, (a - alt_px - t * sobe) / (0.6 + 0.08 * t))
    return np.clip(1.0 - ocl, 0.0, 1.0).astype(F32)


def ceu(rz):
    """Brilho do 'céu' refletido conforme a componente z do raio refletido."""
    return (0.10 + 0.95 * np.clip(rz, 0, 1) ** 0.6).astype(F32)


def iluminar(cor_srgb, nrm, orm, L, V, alt_px=None, sol=2.4, amb=0.55, sombra=None):
    """Radiância linear de cada texel, sol direcional + céu + reflexo."""
    alb = srgb_para_lin(cor_srgb)
    ao = orm[..., 0]
    rug = np.clip(orm[..., 1], 0.02, 1.0)
    L = np.asarray(L, F32) / np.linalg.norm(L)
    V = np.asarray(V, F32) / np.linalg.norm(V)
    Hh = (L + V) / np.linalg.norm(L + V)
    n_l = np.clip((nrm * L).sum(-1), 0, 1)
    n_v = np.clip((nrm * V).sum(-1), 1e-3, 1)
    n_h = np.clip((nrm * Hh).sum(-1), 0, 1)
    if sombra is not None:
        sh = sombra
    else:
        sh = sombra_relevo(alt_px, L) if alt_px is not None else 1.0
    f0 = 0.04
    fres = f0 + (1 - f0) * (1 - n_v) ** 5
    espec = _ggx(n_h, n_l, n_v, rug) * (f0 + (1 - f0) * (1 - np.clip((V * Hh).sum(), 0, 1)) ** 5)
    difuso = alb * (sol * n_l * sh)[..., None] / np.pi * np.pi * 0.42 + alb * (amb * ao)[..., None]
    # reflexo do céu: raio refletido; quanto mais áspero, mais "cinza médio"
    R = 2 * (nrm * V).sum(-1, keepdims=True) * nrm - V
    env = ceu(R[..., 2])
    env = env + (0.45 - env) * np.clip(rug * 1.4, 0, 1)
    f_env = f0 + (1 - f0) * (1 - n_v) ** 5 * (1 - rug) ** 2
    reflexo = (f_env * env * ao)[..., None] * 1.0
    brilho = (espec * sol * n_l * sh)[..., None] * 0.42
    return (difuso * (1 - f_env[..., None]) + reflexo + brilho).astype(F32)


def tonemap(x, expo=1.0):
    x = x * expo
    y = x * (1 + x / 4.0) / (1 + x)       # Reinhard estendido
    return (np.clip(lin_para_srgb(y), 0, 1) * 255 + 0.5).astype(np.uint8)


def piramide(img):
    nivs = [img]
    while min(nivs[-1].shape[:2]) > 4:
        a = nivs[-1]
        h, w = a.shape[:2]
        nivs.append(a.reshape(h // 2, 2, w // 2, 2, -1).mean(axis=(1, 3)))
    return nivs


def perspectiva(lit, tamanho_m, altura_cam=1.6, inclinacao=24.0, saida=(1024, 512), fov=62.0,
                desloc=(0.0, 0.0)):
    """Vista em perspectiva de um chão infinito com a textura (radiância) repetida."""
    Wo, Ho = saida[0] * 2, saida[1] * 2          # superamostragem 2×
    H, W = lit.shape[:2]
    lm, am = tamanho_m
    ph = np.radians(inclinacao)
    fw = np.array([0, np.cos(ph), -np.sin(ph)])
    up = np.array([0, np.sin(ph), np.cos(ph)])
    rt = np.array([1.0, 0, 0])
    t = np.tan(np.radians(fov) / 2)
    xs = (np.arange(Wo) + 0.5) / Wo * 2 - 1
    ys = 1 - (np.arange(Ho) + 0.5) / Ho * 2
    XX, YY = np.meshgrid(xs * t, ys * t * Ho / Wo)
    d = fw[None, None] + XX[..., None] * rt + YY[..., None] * up
    dz = d[..., 2]
    chao = dz < -1e-4
    tt = np.where(chao, altura_cam / np.maximum(-dz, 1e-4), 0)
    wx = d[..., 0] * tt + desloc[0]
    wy = d[..., 1] * tt + desloc[1]
    col = (wx / lm * W) % W
    lin = (-wy / am * H) % H
    # pegada (texels por pixel) para escolher o nível do mipmap
    dcx = np.abs(np.gradient(wx / lm * W, axis=1)) + np.abs(np.gradient(-wy / am * H, axis=1))
    dcy = np.abs(np.gradient(wx / lm * W, axis=0)) + np.abs(np.gradient(-wy / am * H, axis=0))
    maior = np.maximum(dcx, dcy)
    menor = np.minimum(dcx, dcy)
    pegada = np.maximum(menor, maior / 6.0)       # imita filtro anisotrópico
    nivel = np.clip(np.log2(np.maximum(pegada, 1e-3)), 0, None)
    nivs = piramide(lit)
    out = np.zeros((Ho, Wo, 3), F32)
    n0 = np.floor(nivel).astype(int)
    fr = (nivel - n0)[..., None]
    cache = {}

    def amostra(k):
        if k not in cache:
            k2 = min(k, len(nivs) - 1)
            a = nivs[k2]
            esc = a.shape[1] / W
            mx = (col * esc - 0.5).astype(F32)
            my = (lin * esc - 0.5).astype(F32)
            cache[k] = cv2.remap(a.astype(F32), mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_WRAP)
        return cache[k]

    for k in np.unique(n0[chao]):
        m = (n0 == k) & chao
        a0, a1 = amostra(k), amostra(k + 1)
        out[m] = (a0 * (1 - fr) + a1 * fr)[m]
    # neblina leve na distância e céu acima do horizonte
    dist = np.where(chao, tt, 1e3)
    nev = (1 - np.exp(-dist / 80.0))[..., None]
    out = out * (1 - nev) + np.array([0.55, 0.62, 0.70], F32) * 0.55 * nev
    out[~chao] = np.array([0.55, 0.62, 0.70], F32) * 0.55
    return cv2.resize(out, saida, interpolation=cv2.INTER_AREA)


def rotulo(img, texto, x=8, y=22, esc=0.6):
    cv2.putText(img, texto, (x, y), FONTE, esc, (0, 0, 0), 3, cv2.LINE_AA)
    cv2.putText(img, texto, (x, y), FONTE, esc, (255, 255, 255), 1, cv2.LINE_AA)
    return img


def prancha(pasta_tex, pasta_rev, nome, tamanho_m, alt_m=None, altura_cam=1.6, desc=''):
    """Grava <nome>_rev.jpg (prancha) e devolve a vista em perspectiva (uint8)."""
    cor, nrm, orm = ler_mapas(pasta_tex, nome)
    H, W = cor.shape[:2]
    el = np.radians(32)
    L1 = (-np.cos(el) * 0.7071, np.cos(el) * 0.7071, np.sin(el))   # sol rasante, alto à esquerda
    L2 = (-0.55, 0.70, 0.45)                                        # perspectiva: à frente e à esquerda
    ph = np.radians(24)
    V2 = (0, -np.cos(ph), np.sin(ph))
    # recorte 1:1 na emenda (resolução cheia)
    R = 300

    def emenda(a):
        t = np.concatenate([a[-R:], a[:R]], axis=0)
        return np.concatenate([t[:, -R:], t[:, :R]], axis=1)
    alt_px = None if alt_m is None else (alt_m / (tamanho_m[0] / W)).astype(F32)
    L1n = np.asarray(L1) / np.linalg.norm(L1)
    sh_c = None if alt_px is None else emenda(sombra_relevo(alt_px, L1n))
    rc = tonemap(iluminar(emenda(cor), emenda(nrm), emenda(orm), L1, (0, 0, 1), sombra=sh_c))
    rc = rotulo(rc.copy(), 'recorte 1:1 na emenda')
    # o resto em no máximo 1024 px (memória)
    if W > 1024:
        f = W // 1024
        red = lambda a: a.reshape(H // f, f, W // f, f, -1).mean(axis=(1, 3))
        cor, orm = red(cor), red(orm)
        nrm = red(nrm)
        nrm /= np.linalg.norm(nrm, axis=-1, keepdims=True)
        if alt_m is not None:
            alt_px = red(alt_px[..., None])[..., 0] / f
        H, W = cor.shape[:2]
    lit1 = iluminar(cor, nrm, orm, L1, (0, 0, 1), alt_px)
    lit2 = iluminar(cor, nrm, orm, L2, V2, alt_px)
    P = 400

    def pequeno(a):
        return cv2.resize(a, (P, P), interpolation=cv2.INTER_AREA)
    c8 = (cor * 255).astype(np.uint8)
    painel_a = pequeno(np.tile(c8, (2, 2, 1)))
    painel_b = pequeno(((nrm * 0.5 + 0.5) * 255).astype(np.uint8))
    painel_c = pequeno((orm * 255).astype(np.uint8))
    t1 = tonemap(lit1)
    painel_d = pequeno(np.tile(t1, (2, 2, 1)))
    linha1 = np.concatenate([rotulo(painel_a, 'cor 2x2'), rotulo(painel_b, 'normal'),
                             rotulo(painel_c, 'ORM'), rotulo(painel_d, 'sol rasante 2x2')], axis=1)
    vista = tonemap(perspectiva(lit2, tamanho_m, altura_cam=altura_cam), expo=1.0)
    vista_r = cv2.resize(vista, (1000, 500), interpolation=cv2.INTER_AREA)
    vista_r = rotulo(vista_r.copy(), f'{nome}  ({tamanho_m[0]:.3f} x {tamanho_m[1]:.3f} m)')
    linha2 = np.zeros((600, 1600, 3), np.uint8)
    linha2[:600, :600] = rc
    linha2[50:550, 600:1600] = vista_r
    pr = np.concatenate([linha1, linha2], axis=0)
    os.makedirs(pasta_rev, exist_ok=True)
    Image.fromarray(pr).save(os.path.join(pasta_rev, f'{nome}_rev.jpg'), quality=88)
    return vista


def folha_contato(vistas: dict, caminho):
    """Junta as vistas em perspectiva de todas as texturas numa folha só."""
    nomes = list(vistas)
    col = 5
    lin = int(np.ceil(len(nomes) / col))
    tw, th = 512, 256
    folha = np.full((lin * th, col * tw, 3), 20, np.uint8)
    for k, n in enumerate(nomes):
        v = cv2.resize(vistas[n], (tw, th), interpolation=cv2.INTER_AREA)
        v = rotulo(v.copy(), n, esc=0.7, y=26)
        r, c = divmod(k, col)
        folha[r * th:(r + 1) * th, c * tw:(c + 1) * tw] = v
    Image.fromarray(folha).save(caminho, quality=90)
