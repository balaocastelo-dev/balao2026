# -*- coding: utf-8 -*-
"""Texturas PBR procedurais e repetíveis da Chácara 3D (passeio em three.js).

Uso:
    python3 superficies.py                 # gera todas as texturas e o manifesto
    python3 superficies.py caco telha      # só as citadas (o manifesto é mesclado)
    python3 superficies.py --revisao PASTA # também grava as pranchas de conferência

Cada textura <nome> gera, em public/chacara3d/tex/:
    <nome>_c.jpg    cor (albedo) em sRGB
    <nome>_n.jpg    normal no espaço tangente, convenção OpenGL (+Y = topo da imagem)
    <nome>_orm.jpg  R = oclusão, G = rugosidade, B = metalicidade (0)
e uma entrada em superficies.json com o tamanho real (metros) de uma repetição.

Cada material nasce de um mapa de altura em metros e de uma cor desenhados
juntos; normal e oclusão saem da altura. Todas as sementes são fixas.
"""
from __future__ import annotations

import json
import os
import sys
import time
import zlib

import numpy as np
import cv2
from PIL import Image, ImageFile

# o JPEG otimizado de imagem muito detalhada precisa de um buffer maior
ImageFile.MAXBLOCK = 1 << 25

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)

from ruido import (F32, Grade, gerador, suave, normalizar, faixa01, hex_lin, srgb_para_lin,  # noqa: E402
                   lin_para_srgb, luminancia, misturar, ruido, fbm, cristas, desfocar,
                   deformar, reamostrar, rolar, voronoi, pontos_poisson, lloyd, Tela,
                   normal_de_altura, oclusao, cavidade, elipse_patch)

SAIDA = os.path.normpath(os.path.join(AQUI, '..', '..', 'public', 'chacara3d', 'tex'))
MANIFESTO = os.path.join(SAIDA, 'superficies.json')

MATERIAIS = {}


def material(nome, tamanho_m, px, desc, camera=1.6):
    """Registra a função geradora de um material."""
    def dec(f):
        MATERIAIS[nome] = dict(func=f, tamanho_m=tamanho_m, px=px, desc=desc, camera=camera)
        return f
    return dec


class Resultado:
    """O que cada gerador devolve, na grade em que foi desenhado."""

    def __init__(self, g, cor_lin, altura_m, rugosidade, forca_normal=1.0, raio_ao=0.01,
                 forca_ao=1.0, sujeira_cavidade=0.0, ao_extra=None, suavizar_normal=0.0,
                 tamanho_m=None):
        self.g = g
        self.cor = cor_lin
        self.alt = altura_m
        self.rug = rugosidade
        self.forca_normal = forca_normal
        self.raio_ao = raio_ao
        self.forca_ao = forca_ao
        self.sujeira = sujeira_cavidade
        self.ao_extra = ao_extra
        self.suavizar_normal = suavizar_normal
        self.tamanho_m = tamanho_m


def gravar_jpg(caminho, img01, qualidade, subamostragem):
    """Grava com pontilhado de meio nível (evita degraus/curvas de nível em relevos suaves)."""
    rng = gerador(zlib.crc32(os.path.basename(caminho).encode()))
    pont = rng.random(img01.shape, dtype=F32) - 0.5
    a = np.clip(np.floor(np.clip(img01, 0, 1) * 255 + 0.5 + pont), 0, 255).astype(np.uint8)
    Image.fromarray(a).save(caminho, quality=qualidade, subsampling=subamostragem, optimize=True)


def finalizar(nome, info, res: Resultado):
    """Passa para a resolução final, deriva normal e oclusão e grava os JPEGs."""
    N = info['px']
    g0 = res.g
    lm, am = res.tamanho_m or (g0.lm, g0.am)
    g = Grade(N, N, lm, am)
    cor = reamostrar(res.cor, N, N)
    alt = reamostrar(res.alt, N, N)
    rug = reamostrar(res.rug, N, N)
    alt_n = desfocar(alt, g, res.suavizar_normal) if res.suavizar_normal > 0 else alt
    nrm = normal_de_altura(alt_n, g, res.forca_normal)
    ao = oclusao(alt, g, res.raio_ao, forca=res.forca_ao)
    if res.ao_extra is not None:
        ao = ao * reamostrar(res.ao_extra, N, N)
    ao = np.clip(ao, 0.0, 1.0)
    if res.sujeira > 0:
        cor = cor * (1.0 - res.sujeira * (1.0 - ao))[..., None]
    cor = np.clip(cor, 0.004, 0.9)
    gravar_jpg(os.path.join(SAIDA, f'{nome}_c.jpg'), lin_para_srgb(cor), 88, 0)
    gravar_jpg(os.path.join(SAIDA, f'{nome}_n.jpg'), nrm * 0.5 + 0.5, 92, 0)
    orm = np.stack([ao, np.clip(rug, 0.02, 1.0), np.zeros_like(ao)], axis=-1)
    gravar_jpg(os.path.join(SAIDA, f'{nome}_orm.jpg'), orm, 88, 0)
    return alt, (round(lm, 4), round(am, 4))


# =====================================================================
# Pedra: quartzito (pedra São Tomé / pedra mineira)
# =====================================================================
PALETA_QUARTZITO = [  # (cor sRGB, peso)
    ('#d8cbb0', 0.26),   # creme
    ('#dbd5c7', 0.15),   # quase branco
    ('#cfbfa0', 0.20),   # bege claro
    ('#d5c299', 0.14),   # amarelo pálido
    ('#d2b6a3', 0.14),   # salmão claro / rosado
    ('#c3bfb7', 0.11),   # cinza claro
]


def cores_pecas(rng, n, paleta, variacao=0.05):
    """Cor base (linear) de cada peça, sorteada da paleta com pequenas misturas."""
    cores = np.array([hex_lin(c) for c, _ in paleta])
    pesos = np.array([p for _, p in paleta])
    esc = rng.choice(len(paleta), size=n, p=pesos / pesos.sum())
    base = cores[esc]
    outra = cores[rng.choice(len(paleta), size=n, p=pesos / pesos.sum())]
    base = base + (outra - base) * rng.random((n, 1)) * 0.35
    base *= (1.0 + rng.normal(0, variacao, (n, 1)))
    return base.astype(F32)


def campo_por_peca(ids, campos, esc):
    """Para cada peça usa um dos campos (ex.: veios em ângulos diferentes)."""
    out = np.zeros(ids.shape, F32)
    e = esc[ids]
    for k, c in enumerate(campos):
        m = e == k
        out[m] = c[m]
    return out


def textura_quartzito(g: Grade, semente: int, ids=None, n_pecas=1, cores=None,
                      intensidade_veio=1.0, rng=None, paleta=PALETA_QUARTZITO, angulos=None,
                      relevo=1.0):
    """Cor (linear) e relevo (m) da face de quartzito, peça a peça.

    ids: peça de cada pixel (None = peça única). cores: (n, 3) linear por peça.
    Devolve cor, relevo, mica (palhetas claras/brilhantes) e manchas.
    """
    rng = rng if rng is not None else gerador(semente)
    n = max(n_pecas, 1)
    if ids is None:
        ids = np.zeros(g.forma, np.int32)
    s = semente
    if cores is None:
        cores = cores_pecas(rng, n, paleta)
    # segunda cor por peça: a pedra varia de um tom a outro em manchas largas
    cores2 = cores_pecas(rng, n, paleta, 0.04)
    cores2 = cores + (cores2 - cores) * 0.6
    mancha = suave(-0.9, 1.1, fbm(g, s + 1, 0.22, 0.012, 0.5))
    cor = misturar(cores[ids], cores2[ids], mancha * rng.uniform(0.3, 1.0, n)[ids])
    # manchas de ferro (ocre / rosado) com borda difusa, em parte das peças
    ferro = suave(0.6, 2.4, fbm(g, s + 3, 0.18, 0.006, 0.55))
    tem_ferro = (rng.random(n) < 0.45).astype(F32)
    tom = np.where((rng.random(n) < 0.5)[:, None], hex_lin('#c9a06e'), hex_lin('#c99a86'))
    cor = misturar(cor, tom[ids] * 1.05, ferro * tem_ferro[ids] * 0.5)
    # variação de brilho em várias escalas
    m1 = fbm(g, s + 4, 0.25, 0.008, 0.55)
    fino = ruido(g, s + 5, 0.008, 0.0012, beta=0.6)
    # veios em camadas: bandas finas alongadas, em ângulos diferentes por peça
    if angulos is None:
        angulos = [np.pi * k / 6 + 0.2 for k in range(6)]
    esc = rng.integers(0, len(angulos), n)
    veios = [ruido(g, s + 10 + k, 0.06, 0.003, beta=0.8, alongamento=8.0, angulo=a)
             for k, a in enumerate(angulos)]
    veio = campo_por_peca(ids, veios, esc)
    del veios
    lum = 1.0 + 0.05 * m1 + 0.04 * intensidade_veio * veio + 0.02 * fino
    cor = cor * lum[..., None]
    # grão mineral: pontinhos escuros e palhetas de mica (claras e mais lisas)
    escuros = suave(2.4, 3.3, ruido(g, s + 20, 0.004, 0.0012, beta=0.3))
    mica = suave(2.3, 3.2, ruido(g, s + 21, 0.004, 0.0012, beta=0.2))
    cor = misturar(cor, cor * 0.66, escuros * 0.5)
    cor = misturar(cor, np.minimum(cor * 1.10 + 0.03, 0.85), mica * 0.55)
    # relevo: face de clivagem ondulada com degraus de lasca
    rel = fbm(g, s + 30, 0.12, 0.002, 0.5) * 0.00040
    deg_n = fbm(g, s + 31, 0.10, 0.008, 0.45)
    degraus = desfocar(np.floor(deg_n * 1.5) / 1.5, g, 0.0010)
    rel = (rel + degraus * 0.00030 + veio * 0.00010) * relevo
    return cor.astype(F32), rel.astype(F32), mica.astype(F32), ferro.astype(F32)


def cortar_pecas(v, rng, n, diam_max, frac_extra=0.25):
    """Corta as células grandes por uma reta (pedra quebrada fica angulosa).

    Atualiza id e borda de v. Devolve o novo número de peças.
    """
    ids = v['id']
    area = np.bincount(ids.ravel(), minlength=n).astype(np.float64)
    cx = np.bincount(ids.ravel(), weights=v['lx'].ravel(), minlength=n) / np.maximum(area, 1)
    cy = np.bincount(ids.ravel(), weights=v['ly'].ravel(), minlength=n) / np.maximum(area, 1)
    px_area = area / area.sum()            # fração da área total
    diam = 2 * np.sqrt(px_area * v['_area_total'] / np.pi)
    cortar = (diam > diam_max) | (rng.random(n) < frac_extra)
    ang = rng.random(n) * np.pi
    nx, ny = np.cos(ang), np.sin(ang)
    off = rng.normal(0, 0.18, n) * diam
    s = ((v['lx'] - cx[ids]) * nx[ids] + (v['ly'] - cy[ids]) * ny[ids] - off[ids]).astype(F32)
    corta = cortar[ids]
    v['borda'] = np.where(corta, np.minimum(v['borda'], np.abs(s)), v['borda']).astype(F32)
    v['id'] = np.where(corta & (s > 0), ids + n, ids).astype(np.int32)
    return 2 * n


@material('caco', (2.0, 2.0), 2048,
          'Caco de pedra mineira (quartzito São Tomé) com rejunte de cimento; peças de 15 a 40 cm',
          camera=1.6)
def gerar_caco(info):
    g = Grade(2048, 2048, 2.0, 2.0)
    rng = gerador(101)
    # sementes de tamanhos variados (raio ~ metade da peça)
    raios = rng.uniform(0.07, 0.20, 400)
    pts, rs = pontos_poisson(rng, g.lm, g.am, raios, fator=0.95, tentativas=150)
    n = len(pts)
    # bordas quase retas: deformação leve + serrilhado discreto
    dx = fbm(g, 102, 0.25, 0.02, 0.5) * 0.0022 + ruido(g, 103, 0.02, 0.003, 0.7) * 0.0005
    dy = fbm(g, 104, 0.25, 0.02, 0.5) * 0.0022 + ruido(g, 105, 0.02, 0.003, 0.7) * 0.0005
    v = voronoi(g, pts, pesos=(rs ** 2) * 0.8, k=10, desvio=(dx, dy))
    v['_area_total'] = g.lm * g.am
    n = cortar_pecas(v, rng, n, diam_max=0.30, frac_extra=0.22)
    ids, borda = v['id'], v['borda']
    # meia largura do rejunte: 5 a 9 mm (juntas de 1 a 2 cm)
    meia = np.clip(0.0062 + fbm(g, 106, 0.4, 0.05, 0.4) * 0.0015, 0.0048, 0.009)
    # lascas: entalhes discretos na quina da pedra
    lasca_n = ruido(g, 107, 0.025, 0.003, beta=0.8)
    lasca_w = suave(1.0, 2.6, lasca_n) * 0.006 + 0.0006
    dentro = borda - meia
    pedra = dentro > 0

    cores = cores_pecas(rng, n, PALETA_QUARTZITO, 0.045)
    cor_p, rel_p, mica, ferro = textura_quartzito(g, 110, ids, n, cores, rng=rng)

    # cada peça com nível e inclinação próprios (assentada à mão)
    nivel = rng.normal(0, 0.0009, n).astype(F32)
    incl = rng.normal(0, 0.005, (n, 2)).astype(F32)
    alt_p = nivel[ids] + incl[ids, 0] * v['lx'] + incl[ids, 1] * v['ly'] + rel_p
    queda = 1.0 - suave(0.0, 1.0, dentro / lasca_w)
    alt_p = alt_p - queda * (0.0007 + 0.0018 * suave(1.0, 2.6, lasca_n))
    # rejunte rebaixado ~4 mm, sobe junto às pedras (menisco), areia fina
    menisco = suave(0.0, 1.0, 1.0 - borda / np.maximum(meia, 1e-4))
    areia = ruido(g, 113, 0.004, 0.0012, beta=0.4)
    alt_r = (-0.0040 + menisco * 0.0012 + areia * 0.00010
             + fbm(g, 114, 0.2, 0.01, 0.5) * 0.0003)
    # transição suave de ~1 px entre pedra e rejunte (sem serrilhado)
    a = suave(-0.0008, 0.0008, dentro)
    alt = (alt_r + (alt_p - alt_r) * a).astype(F32)

    # rejunte cinza-bege com areia e sujeira
    suj = suave(-0.4, 1.8, fbm(g, 115, 0.3, 0.01, 0.6))
    cor_r = hex_lin('#b4ad9e') * (1.0 + 0.06 * areia + 0.05 * fbm(g, 116, 0.05, 0.003, 0.5))[..., None]
    cor_r = misturar(cor_r, hex_lin('#7a7264'), 0.45 * suj)
    mofo = suave(1.6, 2.8, ruido(g, 119, 0.03, 0.003, beta=0.7)) * suave(0.2, 1.0, suj)
    cor_r = misturar(cor_r, hex_lin('#4a4a3e'), 0.5 * mofo)
    # lascas recentes mais claras; pedra junto ao rejunte um pouco suja
    cor_p = misturar(cor_p, np.minimum(cor_p * 1.06, 0.85), queda * 0.5)
    perto = 1.0 - suave(0.0, 0.012, dentro)
    cor_p = cor_p * (1.0 - 0.10 * perto * (0.4 + suj))[..., None]
    # sujeira de uso/chuva em manchas largas sobre tudo
    tempo = suave(0.0, 2.2, fbm(g, 117, 0.6, 0.015, 0.55))
    cor_p = cor_p * (1.0 - 0.06 * tempo)[..., None]
    cor_r = cor_r * (1.0 - 0.12 * tempo)[..., None]
    cor = misturar(cor_r, cor_p, a)

    rug_p = 0.74 + 0.05 * fbm(g, 118, 0.1, 0.004, 0.5) - 0.25 * mica
    rug_r = 0.93 + 0.02 * areia
    rug = (rug_r + (rug_p - rug_r) * a).astype(F32)
    return Resultado(g, cor, alt, np.clip(rug, 0.3, 1.0), forca_normal=1.0, raio_ao=0.02,
                     forca_ao=1.0, sujeira_cavidade=0.22, suavizar_normal=0.0007)


def grade_retangular(X, Y, mod_x, mod_y, desloc_linha=0.5, n_x=None, n_y=None, desloc_fixos=None):
    """Assentamento em fiadas: devolve id da peça, coordenadas locais (m, centro) e fiada.

    desloc_linha: fração do módulo que cada fiada anda em relação à anterior (0.5 = meia peça).
    desloc_fixos: lista de deslocamentos (m) por fiada, no lugar do padrão.
    """
    fiada = np.floor(Y / mod_y).astype(np.int32)
    if desloc_fixos is not None:
        off = np.asarray(desloc_fixos, F32)[fiada % len(desloc_fixos)]
    else:
        off = ((fiada * desloc_linha) % 1.0) * mod_x
    xs = X - off
    col = np.floor(xs / mod_x).astype(np.int32)
    if n_x is not None:
        col = col % n_x
    lx = (xs - (np.floor(xs / mod_x) + 0.5) * mod_x).astype(F32)
    ly = (Y - (fiada + 0.5) * mod_y).astype(F32)
    ident = fiada * (n_x or 1000) + col
    return ident.astype(np.int32), lx, ly, fiada


def caixa_arredondada(lx, ly, bx, by, raio):
    """Distância com sinal até um retângulo de cantos arredondados (negativo = dentro)."""
    qx = np.abs(lx) - bx + raio
    qy = np.abs(ly) - by + raio
    fora = np.sqrt(np.maximum(qx, 0) ** 2 + np.maximum(qy, 0) ** 2)
    return (fora + np.minimum(np.maximum(qx, qy), 0) - raio).astype(F32)


@material('pedra_reta', (1.208, 1.216), 1024,
          'Quartzito São Tomé serrado e apicoado, placas de 60 x 30 cm em amarração, junta de 4 mm',
          camera=1.4)
def gerar_pedra_reta(info):
    g = Grade(1024, 1024, 1.208, 1.216)
    rng = gerador(201)
    X, Y = g.coords()
    ids, lx, ly, fiada = grade_retangular(X, Y, 0.604, 0.304, 0.5, n_x=2)
    n = int(ids.max()) + 1
    ids = ids.astype(np.int32)
    paleta = [('#d8cbb0', 0.35), ('#d2c2a2', 0.25), ('#dad2c0', 0.2), ('#d5c39c', 0.2)]
    cores = cores_pecas(rng, n, paleta, 0.035)
    cor, rel, mica, ferro = textura_quartzito(g, 210, ids, n, cores, rng=rng, relevo=0.35,
                                              intensidade_veio=0.8)
    # face apicoada: crateras finas de 1 a 3 mm
    pic = ruido(g, 211, 0.004, 0.0012, beta=0.3)
    crateras = -np.maximum(pic - 0.3, 0) * 0.00035 + ruido(g, 212, 0.002, 0.0011, 0.3) * 0.00005
    cor = cor * (1.0 + 0.035 * np.maximum(pic - 0.3, 0))[..., None]
    dentro = -caixa_arredondada(lx, ly, 0.300, 0.150, 0.0015)
    nivel = rng.normal(0, 0.0005, n).astype(F32)
    incl = rng.normal(0, 0.0015, (n, 2)).astype(F32)
    alt_p = nivel[ids] + incl[ids, 0] * lx + incl[ids, 1] * ly + rel + crateras
    # quina boleada de ~2 mm
    alt_p = alt_p - 0.0013 * (1.0 - suave(0.0, 0.0022, dentro)) ** 1.5
    areia = ruido(g, 213, 0.003, 0.0012, beta=0.4)
    alt_r = -0.0018 + areia * 0.00008
    a = suave(-0.0006, 0.0006, dentro)
    alt = alt_r + (alt_p - alt_r) * a
    cor_r = hex_lin('#b1a999') * (1.0 + 0.05 * areia)[..., None]
    tempo = suave(0.0, 2.2, fbm(g, 214, 0.5, 0.02, 0.55))
    cor = cor * (1.0 - 0.05 * tempo)[..., None]
    cor = misturar(cor_r * (1.0 - 0.1 * tempo)[..., None], cor, a)
    rug_p = 0.80 + 0.04 * fbm(g, 215, 0.1, 0.004, 0.5) - 0.2 * mica
    rug = 0.93 + (rug_p - 0.93) * a
    return Resultado(g, cor, alt.astype(F32), rug.astype(F32), raio_ao=0.008, sujeira_cavidade=0.2,
                     suavizar_normal=0.0005)


@material('pedra_natural', (1.0, 1.0), 1024,
          'Quartzito São Tomé natural (face de clivagem), sem juntas: pisantes e blocos', camera=1.2)
def gerar_pedra_natural(info):
    g = Grade(1024, 1024, 1.0, 1.0)
    rng = gerador(301)
    base = hex_lin('#d8cbb0')
    ang = 0.35
    cor, rel, mica, ferro = textura_quartzito(g, 310, None, 1, base[None, :], rng=rng,
                                              relevo=0.8, intensidade_veio=1.3, angulos=[ang])
    # zonas de cor que se fundem: creme, amarelado, rosado leve, quase branco
    zonas = ['#dccfb3', '#dcc493', '#d9bca6', '#ddd6c6']
    pesos = [np.exp(2.6 * fbm(g, 320 + k, 0.5, 0.03, 0.45, alongamento=2.0, angulo=ang))
             for k in range(len(zonas))]
    soma = sum(pesos)
    alvo = sum(hex_lin(c)[None, None, :] * (p / soma)[..., None] for c, p in zip(zonas, pesos))
    cor = cor * (alvo / base)
    # clivagem em camadas: poucos degraus largos, de borda quebrada, seguindo o acamamento
    wx = ruido(g, 334, 0.03, 0.006, beta=0.8) * 0.0025 + fbm(g, 336, 0.4, 0.05, 0.5) * 0.02
    wy = ruido(g, 335, 0.03, 0.006, beta=0.8) * 0.0025 + fbm(g, 337, 0.4, 0.05, 0.5) * 0.02
    deg = deformar(fbm(g, 330, 0.7, 0.05, 0.4, alongamento=3.0, angulo=ang), wx, wy, g)
    # limpa ilhotas menores que ~3 mm (degrau de verdade é contínuo)
    nivel_deg = np.round(desfocar(np.floor(deg * 1.15), g, 0.0025))
    degraus = desfocar(nivel_deg, g, 0.0004)
    alt = rel + degraus * 0.0016 + fbm(g, 331, 0.5, 0.02, 0.4) * 0.0010
    # cada camada com tom ligeiramente diferente; pé do degrau um pouco sujo
    tom = (np.sin(nivel_deg * 2.4 + 1.0) * 0.03).astype(F32)
    cor = cor * (1.0 + tom)[..., None]
    gx = np.abs(rolar(degraus, 0, -1) - rolar(degraus, 0, 1))
    gy = np.abs(rolar(degraus, -1, 0) - rolar(degraus, 1, 0))
    quina = desfocar(np.clip((gx + gy) * 1.5, 0, 1), g, 0.0007)
    cor = cor * (1.0 - 0.06 * quina)[..., None]
    tempo = suave(0.0, 2.2, fbm(g, 332, 0.5, 0.02, 0.55))
    cor = cor * (1.0 - 0.05 * tempo)[..., None]
    rug = (0.76 + 0.05 * fbm(g, 333, 0.1, 0.004, 0.5) - 0.22 * mica).astype(F32)
    return Resultado(g, cor, alt.astype(F32), rug, raio_ao=0.015, sujeira_cavidade=0.3,
                     suavizar_normal=0.0005)


PALETA_TIJOLO = [
    ('#b5623c', 0.22),   # laranja
    ('#a9563a', 0.20),   # laranja-avermelhado
    ('#9c4b33', 0.18),   # vermelho-tijolo
    ('#c0744a', 0.14),   # laranja claro
    ('#8b4631', 0.16),   # marrom-avermelhado
    ('#6c3628', 0.10),   # queimado escuro
]


@material('tijolinho', (1.10, 1.04), 1024,
          'Tijolinho aparente (tijolo maciço) 21 x 5,5 cm em amarração, junta de 1 cm rebaixada; '
          '5 tijolos x 16 fiadas por repetição', camera=1.5)
def gerar_tijolinho(info):
    g = Grade(1024, 1024, 1.10, 1.04)
    rng = gerador(401)
    X, Y = g.coords()
    # bordas levemente tortas
    wx = fbm(g, 402, 0.05, 0.004, 0.5) * 0.0006
    wy = fbm(g, 403, 0.05, 0.004, 0.5) * 0.0006
    ids, lx, ly, fiada = grade_retangular(X, Y, 0.22, 0.065, 0.5, n_x=5)
    n = 5 * 16
    ids = (fiada % 16) * 5 + (ids % 5)
    jx = rng.normal(0, 0.0008, n).astype(F32)
    jy = rng.normal(0, 0.0005, n).astype(F32)
    rot = rng.normal(0, 0.004, n).astype(F32)
    lxr = lx + wx + rot[ids] * ly
    lyr = ly + wy - rot[ids] * lx
    sdf = caixa_arredondada(lxr, lyr, 0.105 + jx[ids], 0.0275 + jy[ids], 0.0022)
    # lascas na quina
    lasca = suave(1.3, 2.6, ruido(g, 404, 0.03, 0.003, beta=0.8)) * 0.003
    dentro = -sdf - lasca
    cores = cores_pecas(rng, n, PALETA_TIJOLO, 0.06)
    # variação dentro do tijolo
    m1 = fbm(g, 405, 0.08, 0.004, 0.55)
    m2 = fbm(g, 406, 0.02, 0.0015, 0.6)
    cor = cores[ids] * (1.0 + 0.07 * m1 + 0.04 * m2)[..., None]
    # uma ponta mais queimada (chama do forno)
    ponta = rng.uniform(-1, 1, n).astype(F32)
    queima = np.clip(ponta[ids] * lx / 0.105, 0, 1) ** 2 * rng.uniform(0, 0.35, n).astype(F32)[ids]
    cor = cor * (1.0 - queima)[..., None]
    # areia de moldagem clara e grãos escuros
    claros = suave(2.2, 3.2, ruido(g, 407, 0.003, 0.0011, beta=0.3))
    escuros = suave(2.4, 3.4, ruido(g, 408, 0.003, 0.0011, beta=0.3))
    cor = misturar(cor, hex_lin('#d7a57c'), claros * 0.5)
    cor = misturar(cor, cor * 0.45, escuros * 0.6)
    # furinhos (bolhas de ar do barro)
    furo_n = ruido(g, 409, 0.004, 0.0012, beta=0.4)
    furos = suave(2.6, 3.3, furo_n)
    nivel = rng.normal(0, 0.0007, n).astype(F32)
    rel = (fbm(g, 410, 0.06, 0.0015, 0.55) * 0.0003 + m2 * 0.0001 - furos * 0.0008)
    abaul = (1.0 - (lx / 0.11) ** 2) * 0.0004
    alt_t = nivel[ids] + rel + abaul - 0.0018 * (1.0 - suave(0.0, 0.0025, dentro)) ** 1.4
    cor = cor * (1.0 - 0.35 * furos)[..., None]
    # argamassa cinza-clara rebaixada ~5 mm, áspera
    areia = ruido(g, 411, 0.003, 0.0011, beta=0.3)
    arg_m = fbm(g, 412, 0.1, 0.004, 0.5)
    alt_a = -0.0050 + areia * 0.00025 + arg_m * 0.0004
    cor_a = hex_lin('#aaa59c') * (1.0 + 0.07 * areia + 0.05 * arg_m)[..., None]
    cor_a = misturar(cor_a, hex_lin('#8d8478'), suave(0.0, 2.0, fbm(g, 413, 0.3, 0.01, 0.5)) * 0.5)
    a = suave(-0.0006, 0.0006, dentro)
    alt = alt_a + (alt_t - alt_a) * a
    cor = misturar(cor_a, cor, a)
    rug = 0.95 + (0.86 + 0.04 * m1 - 0.0 - 0.95) * a
    return Resultado(g, cor, alt.astype(F32), rug.astype(F32), raio_ao=0.012, sujeira_cavidade=0.2,
                     suavizar_normal=0.0005)


PALETA_FILETE = [
    ('#c8b38f', 0.24),   # bege
    ('#b8925e', 0.18),   # ocre
    ('#8f6d4c', 0.15),   # marrom
    ('#9b958a', 0.15),   # cinza
    ('#d2c3a3', 0.16),   # bege claro
    ('#a37853', 0.12),   # ferrugem
]


def fileiras(rng, total, minimo, maximo, viés=None):
    """Sorteia medidas entre mínimo e máximo até cobrir `total` e reescala para fechar exato."""
    v = []
    while sum(v) < total:
        v.append(rng.uniform(minimo, maximo) if viés is None else viés(rng))
    v = np.array(v)
    if len(v) > 1 and (sum(v) - total) > 0.5 * v[-1]:
        v = v[:-1]
    return v * (total / v.sum())


@material('filete', (1.0, 1.0), 1024,
          'Filete de pedra (tiras de 2 a 6 cm de altura e 15 a 50 cm de comprimento) para '
          'revestimento de parede, juntas fundas e escuras', camera=1.0)
def gerar_filete(info):
    g = Grade(1024, 1024, 1.0, 1.0)
    rng = gerador(501)
    X, Y = g.coords()
    alturas = fileiras(rng, 1.0, 0.02, 0.06, lambda r: float(np.clip(r.normal(0.037, 0.011), 0.02, 0.06)))
    cy = np.concatenate([[0], np.cumsum(alturas)])
    # bordas tortas: deformação suave
    wx = fbm(g, 502, 0.1, 0.006, 0.5) * 0.0016
    wy = fbm(g, 503, 0.1, 0.006, 0.5) * 0.0016
    Xw = (X + wx) % 1.0
    Yw = (Y + wy) % 1.0
    fil = np.clip(np.searchsorted(cy, Yw, side='right') - 1, 0, len(alturas) - 1)
    d_v = np.minimum(Yw - cy[fil], cy[fil + 1] - Yw).astype(F32)
    ids = np.zeros(g.forma, np.int32)
    d_h = np.zeros(g.forma, F32)
    lx = np.zeros(g.forma, F32)
    meia_h = []
    n = 0
    for r in range(len(alturas)):
        comp = fileiras(rng, 1.0, 0.15, 0.50)
        cx = np.concatenate([[0], np.cumsum(comp)])
        off = rng.random()
        m = fil == r
        xs = (Xw[m] + off) % 1.0
        k = np.clip(np.searchsorted(cx, xs, side='right') - 1, 0, len(comp) - 1)
        ids[m] = n + k
        d_h[m] = np.minimum(xs - cx[k], cx[k + 1] - xs)
        lx[m] = xs - 0.5 * (cx[k] + cx[k + 1])
        n += len(comp)
    # folgas: entre fiadas 3 a 8 mm, entre peças 2 a 7 mm (por peça)
    folga_v = np.clip(0.0026 + fbm(g, 504, 0.2, 0.01, 0.5) * 0.0011, 0.0012, 0.0045)
    folga_h = rng.uniform(0.001, 0.0035, n).astype(F32)[ids]
    dentro = np.minimum(d_v - folga_v, d_h - folga_h)
    cores = cores_pecas(rng, n, PALETA_FILETE, 0.07)
    cor, rel, mica, ferro = textura_quartzito(g, 510, ids, n, cores, rng=rng, relevo=1.0,
                                              angulos=[0.0, 0.03, -0.03, 0.06, -0.05],
                                              intensidade_veio=1.4)
    # cada tira sai mais ou menos da parede e tem face quebrada
    saliencia = rng.uniform(0.0, 0.010, n).astype(F32)
    incl = rng.normal(0, 0.03, n).astype(F32)
    ly = (Yw - 0.5 * (cy[fil] + cy[fil + 1])).astype(F32)
    camadas = fbm(g, 512, 0.12, 0.006, 0.5, alongamento=4.0)
    face = (fbm(g, 511, 0.10, 0.004, 0.5) * 0.0008
            + desfocar(np.floor(camadas * 1.8) / 1.8, g, 0.0006) * 0.0016)
    queb = np.clip(0.004 + fbm(g, 513, 0.04, 0.003, 0.5) * 0.0025, 0.0015, 0.008)
    borda = (1.0 - suave(0.0, 1.0, dentro / queb)) ** 1.3
    alt_p = 0.012 + saliencia[ids] + incl[ids] * ly + face + rel - borda * 0.006
    # fundo: argamassa escura e funda
    alt_f = -0.012 + fbm(g, 514, 0.05, 0.003, 0.5) * 0.002
    a = suave(-0.0005, 0.0005, dentro)
    alt = alt_f + (alt_p - alt_f) * a
    cor = cor * (1.0 - 0.08 * borda)[..., None]
    cor_f = hex_lin('#3b3631') * (1.0 + 0.1 * fbm(g, 515, 0.02, 0.002, 0.5))[..., None]
    cor = misturar(cor_f, cor, a)
    rug = 0.95 + (0.80 - 0.15 * mica - 0.95) * a
    return Resultado(g, cor, alt.astype(F32), rug.astype(F32), raio_ao=0.03, forca_ao=1.0,
                     sujeira_cavidade=0.35, suavizar_normal=0.0009)


# =====================================================================
# Barro cozido, madeira, reboco e concreto
# =====================================================================
@material('telha', (0.5, 0.5), 1024,
          'Superfície de telha cerâmica laranja (barro cozido), manchada e envelhecida, sem desenho de telha',
          camera=0.9)
def gerar_telha(info):
    g = Grade(1024, 1024, 0.5, 0.5)
    rng = gerador(601)
    base = hex_lin('#bd6a40')
    m1 = fbm(g, 602, 0.25, 0.01, 0.5)
    m2 = fbm(g, 603, 0.06, 0.003, 0.6)
    # manchas de queima: mais clara (amarelada) e mais escura (avermelhada)
    claro = suave(0.3, 1.8, fbm(g, 604, 0.2, 0.01, 0.5))
    escuro = suave(0.5, 2.0, fbm(g, 605, 0.15, 0.008, 0.55))
    cor = base * (1.0 + 0.08 * m1 + 0.04 * m2)[..., None]
    cor = misturar(cor, hex_lin('#cf8a58'), claro * 0.45)
    cor = misturar(cor, hex_lin('#93462c'), escuro * 0.45)
    # intempérie: manchas acinzentadas/escuras de sujeira e água
    tempo = suave(0.2, 2.0, fbm(g, 606, 0.3, 0.006, 0.6))
    cor = misturar(cor, hex_lin('#6e5546'), tempo * 0.5)
    # pontinhos de mofo preto e liquens (rosetas cinza-esverdeadas)
    mofo = suave(2.3, 3.0, ruido(g, 607, 0.004, 0.0006, beta=0.4)) * suave(-0.5, 1.0, fbm(g, 608, 0.2, 0.02, 0.5))
    cor = misturar(cor, hex_lin('#2c2824'), mofo * 0.8)
    # liquens: rosetas irregulares (contorno deformado), em pequenos grupos
    X, Y = g.coords()
    wx = ruido(g, 614, 0.01, 0.0015, beta=0.7) * 0.0015
    wy = ruido(g, 615, 0.01, 0.0015, beta=0.7) * 0.0015
    liq = np.zeros(g.forma, F32)
    centros = []
    for _ in range(6):
        c0 = rng.random(2) * 0.5
        for _ in range(int(rng.integers(1, 5))):
            centros.append((c0 + rng.normal(0, 0.012, 2), rng.uniform(0.0015, 0.006)))
    for (px_, py_), r in centros:
        dx = (X + wx - px_ + 0.25) % 0.5 - 0.25
        dy = (Y + wy - py_ + 0.25) % 0.5 - 0.25
        d = np.sqrt(dx * dx + dy * dy) / r
        liq = np.maximum(liq, 1.0 - suave(0.75, 1.0, d))
    liq = liq * suave(-1.2, 0.3, ruido(g, 610, 0.003, 0.0006, beta=0.4))
    cor = misturar(cor, hex_lin('#a7a78f'), liq * 0.75)
    # grãos de areia e chamote
    grao = ruido(g, 611, 0.002, 0.0005, beta=0.3)
    cor = cor * (1.0 + 0.05 * grao)[..., None]
    cor = misturar(cor, hex_lin('#e0b089'), suave(2.4, 3.2, grao) * 0.5)
    alt = (fbm(g, 612, 0.1, 0.0015, 0.55) * 0.00025 + grao * 0.00004
           - suave(2.2, 3.0, ruido(g, 613, 0.003, 0.0006, beta=0.4)) * 0.00025 + liq * 0.0002)
    rug = (0.86 + 0.04 * m2 + 0.05 * tempo - 0.06 * claro).astype(F32)
    return Resultado(g, cor, alt.astype(F32), rug, raio_ao=0.004, sujeira_cavidade=0.25,
                     suavizar_normal=0.0003)


def perfil_linhas(rng, g: Grade, comp, linhas_por_m, larguras, amostras=16384):
    """Perfil 1-D periódico (comprimento comp) com linhas finas gaussianas em posições sorteadas.

    Passa por um filtro do tamanho do pixel para não serrilhar.
    """
    x = np.arange(amostras) / amostras * comp
    p = np.zeros(amostras)
    n = int(linhas_por_m * comp)
    pos = rng.random(n) * comp
    lar = rng.uniform(larguras[0], larguras[1], n)
    amp = rng.uniform(0.3, 1.0, n)
    for k in range(n):
        d = (x - pos[k] + comp / 2) % comp - comp / 2
        m = np.abs(d) < 4 * lar[k]
        p[m] += amp[k] * np.exp(-(d[m] / lar[k]) ** 2)
    f = np.fft.rfftfreq(amostras, d=comp / amostras)
    sig = 0.5 * max(g.dy, g.dx)
    p = np.fft.irfft(np.fft.rfft(p) * np.exp(-2 * (np.pi * sig * f) ** 2), n=amostras)
    return x, p


def perfil_ruido(rng, comp, maior, menor, beta=1.0, amostras=16384):
    """Ruído 1-D periódico com detalhes entre menor e maior (m), normalizado."""
    f = np.fft.rfftfreq(amostras, d=comp / amostras)
    F = np.fft.rfft(rng.standard_normal(amostras))
    fs = np.where(f > 0, f, 1.0)
    amp = fs ** (-beta) * (1 - np.exp(-(f * maior) ** 2)) * np.exp(-(f * menor) ** 2)
    amp[0] = 0
    p = np.fft.irfft(F * amp, n=amostras)
    return (p - p.mean()) / (p.std() + 1e-12)


def campo_madeira_reta(g: Grade, s: int):
    """Campos da madeira de fio reto ao longo de u, feitos a partir de perfis 1-D
    avaliados numa coordenada v deformada (as linhas atravessam a tábua inteira):
    claro (parênquima), escuro (vasos/veios), banda, tom, fita e poros."""
    rng = gerador(s)
    X, Y = g.coords()
    # o fio ondula devagar e muda de inclinação (fio entrecruzado)
    wy = (fbm(g, s + 1, 1.0, 0.06, 0.4) * 0.0035
          + fbm(g, s + 2, 0.25, 0.03, 0.5, alongamento=3.0) * 0.0012)
    yw = (Y + wy) % g.am
    xs, pc = perfil_linhas(rng, g, g.am, 520, (0.00012, 0.00035))
    _, pe = perfil_linhas(rng, g, g.am, 180, (0.0002, 0.0008))
    claro = np.interp(yw, xs, pc, period=g.am).astype(F32)
    escuro = np.interp(yw, xs, pe, period=g.am).astype(F32)
    banda = np.interp(yw, xs, perfil_ruido(rng, g.am, 0.02, 0.002, 0.8), period=g.am).astype(F32)
    tom1 = np.interp(yw, xs, perfil_ruido(rng, g.am, 0.15, 0.006, 1.2), period=g.am).astype(F32)
    tom = (0.8 * tom1 + 0.5 * fbm(g, s + 3, 0.6, 0.05, 0.5, alongamento=4.0)).astype(F32)
    # as linhas somem e aparecem ao longo do comprimento
    vive = suave(-1.2, 1.0, fbm(g, s + 4, 0.4, 0.04, 0.5, alongamento=4.0))
    claro *= 0.5 + 0.5 * vive
    escuro *= 0.6 + 0.4 * (1 - vive)
    # fita: faixas de 1 a 3 cm que alternam claro/escuro ao longo da tábua
    faixa = np.interp(yw, xs, perfil_ruido(rng, g.am, 0.04, 0.008, 0.6), period=g.am).astype(F32)
    fita = faixa * fbm(g, s + 5, 0.5, 0.08, 0.4, alongamento=2.0)
    zeros = np.zeros(g.forma, F32)
    poros = suave(2.1, 3.0, deformar(ruido(g, s + 6, 0.003, 0.0004, beta=0.3, alongamento=6.0),
                                     zeros, wy, g))
    return claro, escuro, banda, tom, fita, poros


def cor_cumaru(claro, escuro, banda, tom, fita, poros):
    vermelho = hex_lin('#76402a')
    dourado = hex_lin('#9b6536')
    cor = misturar(vermelho, dourado, suave(-1.8, 1.8, tom))
    lum = 1.0 + 0.06 * banda + 0.10 * claro - 0.20 * escuro + 0.05 * fita
    cor = cor * lum[..., None]
    cor = misturar(cor, cor * 0.55, poros * 0.6)
    return cor


@material('madeira', (1.0, 1.0), 1024,
          'Cumaru (madeira maciça) com fio ao longo de u, sem emendas, acabamento oleado', camera=1.0)
def gerar_madeira(info):
    g = Grade(1024, 1024, 1.0, 1.0)
    claro, escuro, banda, tom, fita, poros = campo_madeira_reta(g, 700)
    cor = cor_cumaru(claro, escuro, banda, tom, fita, poros)
    alt = (claro * 0.00002 - escuro * 0.00004 - poros * 0.00012 + banda * 0.00002)
    rug = (0.44 + 0.04 * fita + 0.18 * poros + 0.05 * escuro).astype(F32)
    return Resultado(g, cor, alt.astype(F32), rug, raio_ao=0.003, sujeira_cavidade=0.15)


@material('deck', (2.0, 2.03), 1024,
          'Deck de cumaru: réguas de 14 cm ao longo de u com frestas de 5 mm, emendas alternadas '
          'sobre os barrotes (a cada 50 cm) e parafusos inox; 14 réguas por repetição', camera=1.6)
def gerar_deck(info):
    g = Grade(1024, 1024, 2.0, 2.03)
    rng = gerador(801)
    X, Y = g.coords()
    mod = 0.145
    fiada = np.floor(Y / mod).astype(np.int32)
    ly = (Y - (fiada + 0.5) * mod).astype(F32)
    barrotes = 0.25 + 0.5 * np.arange(4)
    juntas = []
    for r in range(14):
        k = rng.integers(0, 4)
        if rng.random() < 0.5:
            juntas.append([barrotes[k]])
        else:
            juntas.append(sorted([barrotes[k], barrotes[(k + 2) % 4]]))
    # segmento (régua) de cada pixel e distância às pontas
    seg = np.zeros(g.forma, np.int32)
    d_ponta = np.full(g.forma, 9.0, F32)
    for r in range(14):
        m = fiada == r
        xs = X[m]
        js = np.array(juntas[r])
        # índice do trecho entre juntas (com volta)
        k = np.searchsorted(js, xs) % len(js)
        seg[m] = r * 3 + k
        d = np.min(np.abs(((xs[:, None] - js[None, :]) + 1.0) % 2.0 - 1.0), axis=1)
        d_ponta[m] = d
    nseg = 14 * 3
    # madeira: um campo só, deslocado por régua
    campos = campo_madeira_reta(g, 810)
    di = rng.integers(0, g.h, nseg)
    dj = rng.integers(0, g.w, nseg)
    ii, jj = np.meshgrid(np.arange(g.h), np.arange(g.w), indexing='ij')
    si = (ii + di[seg]) % g.h
    sj = (jj + dj[seg]) % g.w
    claro, escuro, banda, tom, fita, poros = (a[si, sj] for a in campos)
    del campos
    tom = tom + rng.normal(0, 0.9, nseg).astype(F32)[seg]
    cor = cor_cumaru(claro, escuro, banda, tom, fita, poros)
    cor = cor * (1.0 + rng.normal(0, 0.06, nseg).astype(F32)[seg])[..., None]
    # perfil: cantos arredondados, leve abaulamento, frestas de 5 mm e topos de 2 mm
    d_lado = 0.070 - np.abs(ly)
    dentro = np.minimum(d_lado, d_ponta - 0.001)
    canto = (1.0 - suave(0.0, 0.003, dentro)) ** 2
    alt_r = (-(ly / 0.07) ** 2 * 0.0004 - canto * 0.002 - escuro * 0.00003 - poros * 0.00008
             + rng.normal(0, 0.0004, nseg).astype(F32)[seg])
    a = suave(-0.0005, 0.0005, dentro)
    alt_f = np.full(g.forma, -0.025, F32)
    alt = alt_f + (alt_r - alt_f) * a
    # parafusos: dois por régua em cada barrote; nas emendas, um par de cada lado
    pos = []
    for r in range(14):
        yc = (r + 0.5) * mod
        for b in barrotes:
            xs_ = [b - 0.025, b + 0.025] if b in juntas[r] else [b]
            for xp in xs_:
                for dy_ in (-0.045, 0.045):
                    pos.append((xp, yc + dy_))
    pos = np.array(pos)
    desl = np.array([(a_ * 2.0, b_ * 2.03) for a_ in (-1, 0, 1) for b_ in (-1, 0, 1)])
    from scipy.spatial import cKDTree
    arv = cKDTree((pos[None] + desl[:, None]).reshape(-1, 2))
    dpar, _ = arv.query(np.stack([X.ravel(), Y.ravel()], 1))
    dpar = dpar.reshape(g.forma).astype(F32)
    cabeca = 1.0 - suave(0.0025, 0.0032, dpar)
    aro = (1.0 - suave(0.003, 0.0055, dpar)) * (1.0 - cabeca)
    cor = misturar(cor, cor * 0.7, aro * 0.6)
    cor = misturar(cor, hex_lin('#5d5a55'), cabeca)
    alt = alt - cabeca * 0.0006 - aro * 0.0002
    # manchas de água/uso
    tempo = suave(0.3, 2.2, fbm(g, 811, 0.5, 0.02, 0.5))
    cor = cor * (1.0 - 0.10 * tempo)[..., None]
    cor = misturar(hex_lin('#1d1712'), cor, a)
    rug = 0.48 + 0.05 * fita + 0.15 * poros + 0.06 * tempo
    rug = np.where(cabeca > 0.5, 0.45, rug)
    rug = 0.9 + (rug - 0.9) * a
    return Resultado(g, cor, alt.astype(F32), rug.astype(F32), raio_ao=0.02, forca_ao=1.0,
                     sujeira_cavidade=0.2, suavizar_normal=0.0)


def arcos_desempenadeira(g: Grade, rng, n, raio=(0.12, 0.4), largura=(0.03, 0.08)):
    """Faixas em arco deixadas pela desempenadeira/colher (0..1), periódicas."""
    X, Y = g.coords()
    out = np.zeros(g.forma, F32)
    for _ in range(n):
        cx, cy = rng.random() * g.lm, rng.random() * g.am
        R = rng.uniform(*raio)
        w = rng.uniform(*largura)
        a0 = rng.random() * 2 * np.pi
        span = rng.uniform(0.6, 1.8)
        dx = (X - cx + g.lm / 2) % g.lm - g.lm / 2
        dy = (Y - cy + g.am / 2) % g.am - g.am / 2
        r = np.sqrt(dx * dx + dy * dy)
        th = (np.arctan2(dy, dx) - a0) % (2 * np.pi)
        setor = suave(0.0, 0.3, th) * (1.0 - suave(span - 0.3, span, th))
        faixa = np.exp(-((r - R) / w) ** 2) * setor * rng.uniform(0.5, 1.0)
        out = np.maximum(out, faixa.astype(F32))
    return out


@material('reboco', (2.0, 2.0), 1024,
          'Reboco pintado / caiado quase branco e neutro (tingir na cena): ondas de desempenadeira, '
          'areia fina e manchas muito leves', camera=1.6)
def gerar_reboco(info):
    g = Grade(1024, 1024, 2.0, 2.0)
    rng = gerador(900)
    # ondas largas do sarrafeado/desempeno
    ondas = sum(fbm(g, 901 + k, 0.5, 0.05, 0.4, alongamento=2.5, angulo=a) * 0.0004
                for k, a in enumerate((0.3, 1.4, 2.4)))
    # arcos da desempenadeira: textura da areia "arrastada" mais lisa nas faixas
    arcos = arcos_desempenadeira(g, rng, 70, (0.08, 0.3), (0.02, 0.05))
    arcos = arcos * suave(-1.0, 1.0, fbm(g, 904, 0.3, 0.03, 0.5))
    areia = ruido(g, 907, 0.004, 0.0015, beta=0.2)
    grossos = suave(1.8, 2.8, ruido(g, 908, 0.006, 0.0018, beta=0.2))
    bolhas = suave(2.7, 3.3, ruido(g, 909, 0.005, 0.0018, beta=0.2))
    rugos = 1.0 - 0.6 * arcos
    alt = (ondas + arcos * 0.0002 + (areia * 0.00012 + grossos * 0.0003) * rugos - bolhas * 0.0004)
    base = hex_lin('#e8e6e1')
    lum = (1.0 + 0.012 * fbm(g, 910, 0.6, 0.02, 0.5) + 0.015 * areia * rugos - 0.012 * arcos
           - 0.05 * bolhas)
    cor = base * lum[..., None]
    # manchas muito leves (umidade, sujeira de chuva)
    mancha = suave(0.8, 2.6, fbm(g, 911, 0.8, 0.03, 0.55))
    cor = misturar(cor, hex_lin('#d5d1c7'), mancha * 0.45)
    rug = (0.92 + 0.02 * areia - 0.08 * arcos).astype(F32)
    return Resultado(g, cor, alt.astype(F32), np.clip(rug, 0.75, 1.0), raio_ao=0.005,
                     sujeira_cavidade=0.12, suavizar_normal=0.0006)


@material('concreto', (1.0, 1.0), 1024,
          'Concreto moldado e desempenado, cinza médio, poros finos e manchas leves', camera=1.4)
def gerar_concreto(info):
    g = Grade(1024, 1024, 1.0, 1.0)
    rng = gerador(1000)
    base = hex_lin('#8e8c87')
    m1 = fbm(g, 1001, 0.6, 0.015, 0.6)
    m2 = fbm(g, 1002, 0.06, 0.003, 0.6)
    nuvem = deformar(fbm(g, 1010, 0.3, 0.01, 0.55), fbm(g, 1011, 0.3, 0.05, 0.5) * 0.03,
                     fbm(g, 1012, 0.3, 0.05, 0.5) * 0.03, g)
    quente = fbm(g, 1003, 0.4, 0.03, 0.5)
    cor = base * (1.0 + 0.06 * m1 + 0.05 * nuvem + 0.025 * m2)[..., None]
    cor = cor * (1.0 + np.array([0.02, 0.0, -0.025], F32)[None, None, :] * quente[..., None])
    # nata de cimento mais clara em placas
    nata = suave(0.6, 2.2, fbm(g, 1013, 0.25, 0.01, 0.6))
    cor = misturar(cor, hex_lin('#a9a7a1'), nata * 0.35)
    # arcos da desempenadeira de aço: mais lisos e mais escuros (queimados)
    arcos = arcos_desempenadeira(g, rng, 55, (0.1, 0.35), (0.02, 0.06))
    arcos = arcos * suave(-1.2, 1.2, fbm(g, 1004, 0.3, 0.02, 0.5))
    cor = cor * (1.0 - 0.07 * arcos)[..., None]
    # poros (bolhas de ar) de tamanhos variados, cinza-escuros, e grãos de areia
    poros = suave(2.6, 3.3, ruido(g, 1006, 0.003, 0.0008, beta=0.2))
    grande = suave(3.0, 3.5, ruido(g, 1007, 0.006, 0.0015, beta=0.2))
    areia = ruido(g, 1008, 0.0025, 0.0008, beta=0.2)
    claros = suave(2.6, 3.4, ruido(g, 1014, 0.003, 0.0008, beta=0.2))
    cor = cor * (1.0 + 0.03 * areia - 0.30 * poros - 0.35 * grande + 0.12 * claros)[..., None]
    # fissuras finas de retração (rede esparsa, interrompida)
    fis_n = fbm(g, 1015, 0.35, 0.02, 0.5)
    fis = suave(0.985, 0.998, cristas(fis_n * 2.5)) * suave(0.4, 1.4, fbm(g, 1016, 0.3, 0.03, 0.5))
    cor = cor * (1.0 - 0.35 * fis)[..., None]
    alt = (fbm(g, 1009, 0.4, 0.01, 0.4) * 0.0003 + arcos * 0.00006 + areia * 0.00004
           - poros * 0.0004 - grande * 0.001 - fis * 0.0003)
    rug = (0.80 - 0.16 * arcos + 0.04 * m2 + 0.1 * poros - 0.04 * nata).astype(F32)
    return Resultado(g, cor, alt.astype(F32), np.clip(rug, 0.5, 1.0), raio_ao=0.004,
                     sujeira_cavidade=0.2, suavizar_normal=0.0003)


# =====================================================================
# Revestimentos: pastilha, ladrilho hidráulico, granito, barro
# =====================================================================
@material('pastilha', (0.486, 0.486), 1024,
          'Pastilha de vidro 2,5 x 2,5 cm (mescla de azuis) com rejunte branco de 2 mm, para o '
          'revestimento interno da piscina; 18 x 18 pastilhas por repetição', camera=0.9)
def gerar_pastilha(info):
    g = Grade(1024, 1024, 0.486, 0.486)
    rng = gerador(1101)
    X, Y = g.coords()
    ids, lx, ly, fiada = grade_retangular(X, Y, 0.027, 0.027, 0.0, n_x=18)
    ids = (fiada % 18) * 18 + (ids % 18)
    n = 18 * 18
    # a tela de pastilhas nunca é perfeita: pequenos desvios de posição e giro
    ox, oy = rng.normal(0, 0.00025, (2, n)).astype(F32)
    rot = rng.normal(0, 0.012, n).astype(F32)
    lxr = lx - ox[ids] + rot[ids] * ly
    lyr = ly - oy[ids] - rot[ids] * lx
    dentro = -caixa_arredondada(lxr, lyr, 0.0125, 0.0125, 0.0012)
    paleta = [('#6cb2cf', 0.24), ('#3f8cbd', 0.20), ('#33a5b5', 0.18), ('#2a6da3', 0.14),
              ('#a8d3e0', 0.12), ('#5aa7c6', 0.12)]
    cores = cores_pecas(rng, n, paleta, 0.05)
    # vidro: nuvens internas, centro um pouco mais claro, bolhinhas
    nuvem = fbm(g, 1102, 0.02, 0.0015, 0.5)
    r_rel = np.clip(np.maximum(np.abs(lxr), np.abs(lyr)) / 0.0125, 0, 1)
    cor = cores[ids] * (1.0 + 0.07 * nuvem + 0.06 * (1 - r_rel ** 2))[..., None]
    bolhas = suave(2.6, 3.3, ruido(g, 1103, 0.0015, 0.0003, beta=0.2))
    cor = misturar(cor, np.minimum(cor * 1.5 + 0.05, 0.85), bolhas * 0.5)
    nivel = rng.normal(0, 0.0002, n).astype(F32)
    alt_p = nivel[ids] - 0.0012 * (1.0 - suave(0.0, 0.0018, dentro)) ** 2 + nuvem * 0.00001
    areia = ruido(g, 1104, 0.0015, 0.0004, beta=0.3)
    alt_r = -0.0016 + areia * 0.00006
    cor_r = hex_lin('#e4e2db') * (1.0 + 0.04 * areia)[..., None]
    cor_r = misturar(cor_r, hex_lin('#b9b8b0'), suave(0.5, 2.0, fbm(g, 1105, 0.2, 0.01, 0.5)) * 0.4)
    a = suave(-0.0003, 0.0003, dentro)
    alt = alt_r + (alt_p - alt_r) * a
    cor = misturar(cor_r, cor, a)
    rug_p = 0.10 + 0.02 * fbm(g, 1106, 0.05, 0.003, 0.5)
    rug = 0.85 + (rug_p - 0.85) * a
    return Resultado(g, cor, alt.astype(F32), np.clip(rug, 0.05, 1.0).astype(F32), raio_ao=0.004,
                     sujeira_cavidade=0.1)


@material('ladrilho', (0.6045, 0.6045), 1024,
          'Ladrilho hidráulico 20 x 20 cm, desenho geométrico/floral em azul profundo, creme e '
          'verde-azulado, fosco e levemente gasto; 3 x 3 ladrilhos por repetição', camera=1.2)
def gerar_ladrilho(info):
    g = Grade(1024, 1024, 0.6045, 0.6045)
    rng = gerador(1201)
    X, Y = g.coords()
    ids, lx, ly, fiada = grade_retangular(X, Y, 0.2015, 0.2015, 0.0, n_x=3)
    ids = (fiada % 3) * 3 + (ids % 3)
    n = 9
    # a tinta do ladrilho tem borda irregular (o pigmento escorre na fôrma)
    wx = ruido(g, 1202, 0.03, 0.005, beta=0.8) * 0.00025
    wy = ruido(g, 1203, 0.03, 0.005, beta=0.8) * 0.00025
    u = (lx + wx) / 0.1
    v = (ly + wy) / 0.1
    px = g.dx / 0.1
    au, av = np.abs(u), np.abs(v)

    def dentro_de(d):          # d < 0 dentro; borda suave de ~1 px
        return 1.0 - suave(-0.7 * px, 0.7 * px, d)
    azul = hex_lin('#233e6b')
    creme = hex_lin('#e1d6bd')
    verde = hex_lin('#2d7671')
    cor = np.broadcast_to(creme, g.forma + (3,)).astype(F32).copy()

    def pintar(mascara, c):
        nonlocal cor
        cor = misturar(cor, c, mascara)
    # rosetas nos cantos (formam círculos com os ladrilhos vizinhos)
    dc = np.sqrt((1 - au) ** 2 + (1 - av) ** 2)
    pintar(dentro_de(dc - 0.52), azul)
    pintar(dentro_de(dc - 0.42), creme)
    pintar(dentro_de(dc - 0.33), verde)
    pintar(dentro_de(dc - 0.20), creme)
    pintar(dentro_de(dc - 0.11), azul)
    # meias-luas no meio das bordas
    dm = np.minimum(np.sqrt((1 - au) ** 2 + v ** 2), np.sqrt(u ** 2 + (1 - av) ** 2))
    pintar(dentro_de(dm - 0.20), verde)
    pintar(dentro_de(dm - 0.12), creme)
    # losango fino ligando as meias-luas (vira uma treliça diagonal no piso)
    los = np.abs(au + av - 1.0) / 1.4142 - 0.016
    pintar(dentro_de(los) * suave(0.53, 0.57, dc) * suave(0.21, 0.25, dm), verde)
    # moldura fina interrompida pelas rosetas
    quadro = np.abs(np.maximum(au, av) - 0.80) - 0.022
    pintar(dentro_de(quadro) * suave(0.58, 0.62, dc) * suave(0.26, 0.30, dm), azul)
    # flor central: quatro pétalas azuis nos eixos e quatro folhas verdes nas diagonais
    r = np.sqrt(u * u + v * v)
    th = np.arctan2(v, u)
    pet = np.ones(g.forma, F32) * 9
    for k in range(4):
        a = k * np.pi / 2
        rr = u * np.cos(a) + v * np.sin(a)
        tt = -u * np.sin(a) + v * np.cos(a)
        pet = np.minimum(pet, np.sqrt(((rr - 0.36) / 0.25) ** 2 + (tt / 0.12) ** 2) - 1.0)
    pintar(dentro_de(pet * 0.12), azul)
    fol = np.ones(g.forma, F32) * 9
    for k in range(4):
        a = np.pi / 4 + k * np.pi / 2
        rr = u * np.cos(a) + v * np.sin(a)
        tt = -u * np.sin(a) + v * np.cos(a)
        fol = np.minimum(fol, np.sqrt(((rr - 0.42) / 0.17) ** 2 + (tt / 0.065) ** 2) - 1.0)
    pintar(dentro_de(fol * 0.065), verde)
    # nervura creme nas pétalas
    nerv = np.minimum(au, av)            # distância à linha do eixo (meio da pétala)
    pintar(dentro_de(np.where(r > 0.17, nerv - 0.012, 9)) * suave(0.0, -0.15, pet), creme)
    pintar(dentro_de(r - 0.15), creme)
    pintar(dentro_de(r - 0.09), verde)
    pintar(dentro_de(r - 0.035), creme)
    # o pigmento "sangra" um pouco na fôrma: borda macia de ~0,3 mm
    cor = desfocar(cor, g, 0.0003)
    # pigmento manchado (cimento colorido) e desgaste
    mancha = fbm(g, 1204, 0.05, 0.002, 0.55)
    cor = cor * (1.0 + 0.05 * mancha + 0.02 * ruido(g, 1205, 0.002, 0.0005, 0.3))[..., None]
    desg = suave(0.4, 2.0, fbm(g, 1206, 0.3, 0.01, 0.6))
    gasto = misturar(cor, hex_lin('#c9c2b2'), 0.35)
    cor = misturar(cor, gasto, desg * 0.45)
    # riscos finos claros
    ris = suave(0.992, 0.999, cristas(ruido(g, 1207, 0.08, 0.004, beta=0.8, alongamento=6.0,
                                               angulo=0.7) * 2.5))
    cor = misturar(cor, hex_lin('#cfc8b8'), ris * 0.35 * suave(-0.5, 1.0, fbm(g, 1208, 0.2, 0.02, 0.5)))
    tom_ladrilho = 1.0 + rng.normal(0, 0.03, n).astype(F32)
    cor = cor * tom_ladrilho[ids][..., None]
    # relevo: ladrilhos com níveis um pouco diferentes, quinas lascadas, junta seca rebaixada
    dentro = -caixa_arredondada(lx, ly, 0.10, 0.10, 0.0008)
    lasca = suave(1.6, 2.8, ruido(g, 1209, 0.02, 0.002, beta=0.8)) * 0.002
    dentro = dentro - lasca
    nivel = rng.normal(0, 0.0003, n).astype(F32)
    poros = suave(2.6, 3.3, ruido(g, 1210, 0.002, 0.0005, beta=0.3))
    alt_p = (nivel[ids] + fbm(g, 1211, 0.1, 0.004, 0.5) * 0.00008 - poros * 0.00015
             - 0.0006 * (1 - suave(0.0, 0.0012, dentro)) ** 2 - ris * 0.00003)
    cor = cor * (1.0 - 0.3 * poros)[..., None]
    cor = misturar(cor, hex_lin('#9d978b'), (1 - suave(0.0, 0.001, dentro)) * suave(0.0, 0.001, lasca))
    alt_r = np.full(g.forma, -0.0012, F32)
    a = suave(-0.0003, 0.0003, dentro)
    alt = alt_r + (alt_p - alt_r) * a
    cor = misturar(hex_lin('#8f897e'), cor, a)
    rug = 0.9 + (0.62 + 0.08 * desg + 0.03 * mancha - 0.9) * a
    return Resultado(g, cor, alt.astype(F32), rug.astype(F32), raio_ao=0.004, sujeira_cavidade=0.2)


@material('granito', (0.6, 0.6), 1024,
          'Granito preto São Gabriel polido: quase preto com cristais cinza e pontinhos claros',
          camera=1.0)
def gerar_granito(info):
    g = Grade(1024, 1024, 0.6, 0.6)
    rng = gerador(1301)
    n = 52000
    pts = rng.random((n, 2)) * (0.6, 0.6)
    dx = fbm(g, 1302, 0.05, 0.003, 0.5) * 0.0006
    dy = fbm(g, 1303, 0.05, 0.003, 0.5) * 0.0006
    v = voronoi(g, pts, k=4, desvio=(dx, dy))
    ids = v['id']
    sorteio = rng.random(n)
    # fração de cristais: preto, cinza escuro, cinza médio, claro
    val = np.where(sorteio < 0.66, rng.uniform(0.010, 0.016, n),
                   np.where(sorteio < 0.90, rng.uniform(0.020, 0.040, n),
                            np.where(sorteio < 0.975, rng.uniform(0.06, 0.11, n),
                                     rng.uniform(0.18, 0.32, n)))).astype(F32)
    tinta = np.stack([np.ones(n), 1.0 + rng.normal(0.0, 0.03, n),
                      1.0 + rng.normal(0.02, 0.04, n)], axis=1).astype(F32)
    cor = (val[:, None] * tinta)[ids]
    # aglomerados: os cristais claros se juntam em nuvens
    agl = suave(-0.5, 1.5, fbm(g, 1304, 0.06, 0.006, 0.5))
    cor = cor * (0.85 + 0.3 * agl)[..., None]
    cor = cor * (1.0 + 0.08 * ruido(g, 1305, 0.002, 0.0005, beta=0.3))[..., None]
    # micro-poros nos contornos de alguns cristais (polimento não fecha tudo)
    contorno = 1.0 - suave(0.0, 0.0004, v['borda'])
    poro = contorno * (rng.random(n) < 0.12)[ids]
    alt = -poro * 0.00003 + fbm(g, 1306, 0.3, 0.02, 0.5) * 0.00002
    rug = (0.09 + 0.02 * fbm(g, 1307, 0.1, 0.005, 0.5) + 0.25 * poro).astype(F32)
    return Resultado(g, cor.astype(F32), alt.astype(F32), np.clip(rug, 0.05, 1.0), raio_ao=0.002,
                     sujeira_cavidade=0.0)


@material('barro', (0.5, 0.5), 1024,
          'Terracota sem esmalte de vaso de barro: laranja-amarronzado, pintas minerais e leve '
          'eflorescência branca (u = volta do vaso)', camera=0.9)
def gerar_barro(info):
    g = Grade(1024, 1024, 0.5, 0.5)
    X, Y = g.coords()
    base = hex_lin('#b0643f')
    m1 = fbm(g, 1401, 0.3, 0.01, 0.5)
    m2 = fbm(g, 1402, 0.05, 0.002, 0.6)
    cor = base * (1.0 + 0.07 * m1 + 0.04 * m2)[..., None]
    cor = misturar(cor, hex_lin('#9a5236'), suave(0.5, 2.0, fbm(g, 1403, 0.2, 0.01, 0.5)) * 0.4)
    # pintas: grãos escuros (ferro) e claros (chamote)
    esc = suave(2.4, 3.2, ruido(g, 1404, 0.0025, 0.0005, beta=0.2))
    cla = suave(2.4, 3.2, ruido(g, 1405, 0.0025, 0.0005, beta=0.2))
    cor = misturar(cor, cor * 0.45, esc * 0.7)
    cor = misturar(cor, hex_lin('#dcae86'), cla * 0.6)
    # eflorescência (sal) esbranquiçada, em véus irregulares e pulverulentos
    sal_m = suave(-0.2, 2.4, fbm(g, 1406, 0.5, 0.03, 0.4))
    veu = suave(-0.8, 1.5, fbm(g, 1411, 0.12, 0.006, 0.5, alongamento=3.0, angulo=np.pi / 2))
    po = suave(-1.0, 1.5, ruido(g, 1407, 0.004, 0.0006, beta=0.4))
    sal = sal_m * (0.3 + 0.45 * veu + 0.25 * po)
    cor = misturar(cor, hex_lin('#d9d2c6'), sal * 0.22)
    # marcas do torno: anéis rasos ao longo de u
    anel = perfil_ruido(gerador(1408), g.am, 0.012, 0.002, 0.7)
    anel = np.interp((Y + fbm(g, 1409, 0.4, 0.05, 0.5) * 0.002) % g.am,
                     np.arange(len(anel)) / len(anel) * g.am, anel, period=g.am).astype(F32)
    alt = (anel * 0.00006 + fbm(g, 1410, 0.08, 0.0015, 0.55) * 0.00008 - esc * 0.00004
           + sal * 0.00003)
    cor = cor * (1.0 + 0.015 * anel)[..., None]
    rug = (0.86 + 0.03 * m2 + 0.08 * sal).astype(F32)
    return Resultado(g, cor, alt.astype(F32), np.clip(rug, 0.6, 1.0), raio_ao=0.003,
                     sujeira_cavidade=0.15, suavizar_normal=0.0002)


# =====================================================================
# Pisos e forros de interior
# =====================================================================
def aneis_crescimento(xl, yl, prof, medula_y, espac, deform):
    """Anéis de crescimento cortados por um plano (tábua tangencial: desenho de 'catedral').

    xl, yl: coordenadas na tábua (m); prof: profundidade da medula sob a face (m, por pixel);
    medula_y: posição da medula atravessada na tábua; espac: espaçamento dos anéis (m).
    Devolve (lenho tardio 0..1, fase t 0..1).
    """
    r = np.sqrt((yl - medula_y) ** 2 + prof ** 2) + deform
    t = (r / espac) % 1.0
    tardio = suave(0.50, 0.82, t) * (1.0 - suave(0.90, 1.0, t))
    return tardio.astype(F32), t.astype(F32)


@material('porcelanato_madeira', (2.404, 2.424), 1024,
          'Porcelanato amadeirado (carvalho claro-médio), réguas de 20 x 120 cm ao longo de u, '
          'juntas desencontradas, rejunte de 2 mm, acetinado; 2 x 12 réguas por repetição',
          camera=1.6)
def gerar_porcelanato_madeira(info):
    g = Grade(1024, 1024, 2.404, 2.424)
    rng = gerador(1701)
    X, Y = g.coords()
    mx, my = 1.202, 0.202
    desloc = [0.0]
    for _ in range(11):
        op = [d for d in (0.0, mx / 3, 2 * mx / 3) if abs(d - desloc[-1]) > 1e-6]
        desloc.append(op[rng.integers(0, len(op))])
    ids, lx, ly, fiada = grade_retangular(X, Y, mx, my, desloc_fixos=desloc, n_x=2)
    ids = (fiada % 12) * 2 + (ids % 2)
    n = 24
    # parâmetros do desenho de cada régua (o porcelanato repete poucas "faces")
    prof0 = rng.uniform(0.004, 0.03, n).astype(F32)
    incl = rng.uniform(-0.04, 0.04, n).astype(F32)
    amp = rng.uniform(0.0, 0.03, n).astype(F32)
    ciclos = rng.uniform(0.6, 1.6, n).astype(F32)
    fase = rng.uniform(0, 2 * np.pi, n).astype(F32)
    medula = rng.uniform(-0.12, 0.12, n).astype(F32)
    espac = rng.uniform(0.006, 0.011, n).astype(F32)
    prof0 = prof0 * 2.0
    amp = amp * 2.0
    prof = np.abs(prof0[ids] + incl[ids] * lx + amp[ids] * np.sin(2 * np.pi * ciclos[ids] * lx + fase[ids]))
    deform = fbm(g, 1702, 0.3, 0.006, 0.5, alongamento=8.0) * 0.003
    tardio, t = aneis_crescimento(lx, ly, prof, medula[ids], espac[ids], deform)
    # fio fino e poros do carvalho (tracinhos ao longo do comprimento)
    fio = ruido(g, 1703, 0.01, 0.0012, beta=0.7, alongamento=30.0)
    poros = suave(2.0, 2.9, ruido(g, 1704, 0.004, 0.0012, beta=0.3, alongamento=8.0))
    base = hex_lin('#b48d65')
    tom = (1.0 + rng.normal(0, 0.08, n)).astype(F32)[ids]
    quente = rng.normal(0, 0.06, n).astype(F32)[ids]
    cor = base * tom[..., None] * (1.0 + 0.05 * fio)[..., None]
    cor = cor * (1.0 + np.array([0.6, 0.0, -0.8], F32) * quente[..., None])
    cor = misturar(cor, cor * np.array([0.70, 0.62, 0.55], F32), tardio * 0.75)
    cor = misturar(cor, cor * 0.7, poros * 0.5)
    cor = cor * (1.0 + 0.05 * fbm(g, 1705, 0.4, 0.03, 0.5, alongamento=4.0))[..., None]
    # face: textura sincronizada bem rasa, microbisotê nas bordas, rejunte de 2 mm
    dentro = -caixa_arredondada(lx, ly, 0.600, 0.100, 0.0005)
    alt_p = (tardio * 0.00003 - poros * 0.00003 + rng.normal(0, 0.00015, n).astype(F32)[ids]
             - 0.0005 * (1.0 - suave(0.0, 0.0012, dentro)))
    alt_r = np.full(g.forma, -0.0012, F32) + ruido(g, 1706, 0.003, 0.001, 0.3) * 0.00005
    a = suave(-0.0004, 0.0004, dentro)
    alt = alt_r + (alt_p - alt_r) * a
    cor = misturar(hex_lin('#85786a'), cor, a)
    rug_p = 0.35 + 0.05 * tardio + 0.03 * fbm(g, 1707, 0.2, 0.01, 0.5)
    rug = 0.9 + (rug_p - 0.9) * a
    return Resultado(g, cor, alt.astype(F32), rug.astype(F32), raio_ao=0.004, sujeira_cavidade=0.1)


@material('azulejo_banho', (1.204, 1.208), 1024,
          'Azulejo/porcelanato branco brilhante 30 x 60 cm deitado, em amarração, rejunte cinza-claro '
          'de 2 mm; 2 x 4 peças por repetição', camera=1.2)
def gerar_azulejo_banho(info):
    g = Grade(1024, 1024, 1.204, 1.208)
    rng = gerador(1801)
    X, Y = g.coords()
    ids, lx, ly, fiada = grade_retangular(X, Y, 0.602, 0.302, 0.5, n_x=2)
    ids = (fiada % 4) * 2 + (ids % 2)
    n = 8
    dentro = -caixa_arredondada(lx, ly, 0.300, 0.150, 0.001)
    tom = (1.0 + rng.normal(0, 0.008, n)).astype(F32)[ids]
    cor = hex_lin('#e9e8e4') * tom[..., None]
    cor = cor * (1.0 + 0.006 * fbm(g, 1802, 0.3, 0.01, 0.5))[..., None]
    # esmalte: ondulação leve (casca de laranja) e peças levemente desniveladas
    casca = fbm(g, 1803, 0.08, 0.004, 0.5) * 0.00003
    inc = rng.normal(0, 0.0006, (n, 2)).astype(F32)
    alt_p = (inc[ids, 0] * lx + inc[ids, 1] * ly + casca
             - 0.0008 * (1.0 - suave(0.0, 0.0015, dentro)) ** 2)
    areia = ruido(g, 1804, 0.003, 0.001, beta=0.3)
    alt_r = -0.0012 + areia * 0.00004
    cor_r = hex_lin('#c6c5bf') * (1.0 + 0.04 * areia)[..., None]
    a = suave(-0.0004, 0.0004, dentro)
    alt = alt_r + (alt_p - alt_r) * a
    cor = misturar(cor_r, cor, a)
    rug = 0.85 + (0.06 + 0.01 * fbm(g, 1805, 0.2, 0.01, 0.5) - 0.85) * a
    return Resultado(g, cor, alt.astype(F32), np.clip(rug, 0.03, 1).astype(F32), raio_ao=0.004,
                     sujeira_cavidade=0.1)


@material('forro_madeira', (1.0, 1.0), 1024,
          'Forro de pinus macho-e-fêmea: tábuas de 10 cm ao longo de u, cor de mel, frisos em V e '
          'alguns nós; 10 tábuas por repetição', camera=0.9)
def gerar_forro_madeira(info):
    g = Grade(1024, 1024, 1.0, 1.0)
    rng = gerador(1901)
    X, Y = g.coords()
    tab = np.floor(Y / 0.1).astype(np.int32) % 10
    ly = (Y - (np.floor(Y / 0.1) + 0.5) * 0.1).astype(F32)
    n = 10
    prof0 = rng.uniform(0.012, 0.03, n).astype(F32)
    amp = rng.uniform(0.008, 0.022, n).astype(F32)
    ciclos = rng.integers(1, 3, n).astype(F32)
    fase = rng.uniform(0, 2 * np.pi, n).astype(F32)
    medula = rng.uniform(-0.05, 0.05, n).astype(F32)
    espac = rng.uniform(0.004, 0.007, n).astype(F32)
    prof = prof0[tab] + amp[tab] * np.sin(2 * np.pi * ciclos[tab] * X + fase[tab])
    prof = np.abs(prof + fbm(g, 1902, 0.5, 0.05, 0.5) * 0.002)
    deform = fbm(g, 1903, 0.3, 0.004, 0.5, alongamento=6.0) * 0.0012
    # nós: desviam os anéis em volta e ficam escuros
    nos = []
    for _ in range(4):
        nos.append((rng.random() * 1.0, rng.integers(0, 10) * 0.1 + 0.05 + rng.normal(0, 0.015),
                    rng.uniform(0.009, 0.016)))
    nos_m = np.zeros(g.forma, F32)
    anel_no = np.zeros(g.forma, F32)
    for (nx_, ny_, nr) in nos:
        dx = (X - nx_ + 0.5) % 1.0 - 0.5
        dy = (Y - ny_ + 0.5) % 1.0 - 0.5
        d = np.sqrt((dx / 1.3) ** 2 + dy ** 2)
        deform = deform + 0.012 * np.exp(-(d / (3.0 * nr)) ** 2)
        nos_m = np.maximum(nos_m, 1.0 - suave(0.8 * nr, nr, d))
        anel_no = np.maximum(anel_no, np.exp(-((d - 0.85 * nr) / (0.25 * nr)) ** 2))
    tardio, t = aneis_crescimento(X, ly, prof, medula[tab], espac[tab], deform)
    fio = ruido(g, 1904, 0.01, 0.0012, beta=0.7, alongamento=30.0)
    base = hex_lin('#d8b27d')
    tom = (1.0 + rng.normal(0, 0.07, n)).astype(F32)[tab]
    laranja = rng.normal(0, 0.05, n).astype(F32)[tab]
    cor = base * tom[..., None] * (1.0 + 0.04 * fio)[..., None]
    cor = cor * (1.0 + np.array([0.5, 0.0, -0.9], F32) * laranja[..., None])
    cor = misturar(cor, cor * np.array([0.78, 0.66, 0.55], F32), tardio * 0.6)
    cor = misturar(cor, hex_lin('#7b4a27'), nos_m * 0.85)
    cor = misturar(cor, hex_lin('#55331c'), anel_no * 0.6)
    # perfil: face plana, chanfro em V de 3 mm nas bordas e fresta funda
    d_borda = 0.05 - np.abs(ly)
    chanfro = np.clip(0.003 - d_borda, 0, 0.003)
    alt = (-chanfro + tardio * 0.00002 - nos_m * 0.0001
           + rng.normal(0, 0.0002, n).astype(F32)[tab])
    fresta = suave(0.0006, 0.0, d_borda)
    alt = alt - fresta * 0.006
    cor = misturar(cor, cor * 0.75, suave(0.003, 0.0, d_borda) * 0.4)
    cor = misturar(cor, hex_lin('#2c1f14'), fresta)
    rug = (0.42 + 0.05 * tardio + 0.1 * nos_m + 0.4 * fresta).astype(F32)
    return Resultado(g, cor, alt.astype(F32), rug, raio_ao=0.008, sujeira_cavidade=0.15)


# =====================================================================
# Chão solto: seixos, pedrisco, fundo do lago, terra com casca
# =====================================================================
def recorte_local(cx_px, cy_px, R):
    """Recorte quadrado em volta de (cx, cy) em pixels: canto (r0, c0) e offsets do centro."""
    r0 = int(np.floor(cy_px)) - R
    c0 = int(np.floor(cx_px)) - R
    yy, xx = np.mgrid[0:2 * R + 1, 0:2 * R + 1].astype(F32)
    xx = xx + c0 + 0.5 - cx_px
    yy = yy + r0 + 0.5 - cy_px
    return r0, c0, xx, yy


def forma_seixo(rng, xx, yy, a, b, ang, p=2.2, harm=0.06):
    """Raio normalizado (1 = borda) de um seixo: superelipse com ondulação no contorno."""
    c, s = np.cos(ang), np.sin(ang)
    u = (xx * c + yy * s) / a
    v = (-xx * s + yy * c) / b
    th = np.arctan2(v, u)
    onda = 1.0
    for k in (2, 3, 5):
        onda = onda + harm / k * rng.normal() * np.cos(k * th + rng.random() * 6.283)
    r = (np.abs(u) ** p + np.abs(v) ** p) ** (1.0 / p) / onda
    return r.astype(F32), u, v


def espalhar_seixos(g: Grade, tela: Tela, rng, lista, campos, cor_func, rug_func, ident0=0):
    """Carimba seixos arredondados. lista: (x, y, a, b, c, ang, base) em metros."""
    for k, (x, y, a, b, c, ang, base) in enumerate(lista):
        ap, bp = a / g.dx, b / g.dx
        R = int(np.ceil(max(ap, bp) * 1.15)) + 2
        r0, c0, xx, yy = recorte_local(x / g.dx, y / g.dy, R)
        r, u, v = forma_seixo(rng, xx, yy, ap, bp, ang, p=rng.uniform(2.0, 2.6),
                              harm=rng.uniform(0.03, 0.10))
        dentro = r < 1.0
        if not dentro.any():
            continue
        perfil = np.sqrt(np.clip(1.0 - r * r, 0, 1)) ** rng.uniform(0.5, 0.8)
        linhas = (r0 + np.arange(2 * R + 1)) % g.h
        cols = (c0 + np.arange(2 * R + 1)) % g.w
        loc = {nm: f[np.ix_(linhas, cols)] for nm, f in campos.items()}
        alt = base + c * perfil + loc['rel'] * 0.00015 * perfil
        cor = cor_func(k, loc, r, u, v)
        rug = rug_func(k, loc, r)
        borda = suave(0.93, 1.0, r)
        alt = np.where(dentro, alt, -1.0).astype(F32)
        tela.carimbar(r0, c0, alt, {'cor': cor, 'rug': rug, 'borda': borda}, mascara=dentro,
                      ident=ident0 + k)


def lista_seixos(rng, lm, am, diam, aspecto, altura, base, fator, tentativas=80, n=4000):
    """Sorteia seixos por arremesso (sem sobrepor demais). diam: (min, max) em m."""
    diams = rng.uniform(diam[0], diam[1], n)
    pts, rs = pontos_poisson(rng, lm, am, diams / 2, fator=fator, tentativas=tentativas)
    out = []
    for (x, y), rr in zip(pts, rs):
        asp = rng.uniform(*aspecto)
        a = rr * rng.uniform(1.0, 1.12)
        b = a * asp
        out.append((x, y, a, b, b * rng.uniform(*altura), rng.random() * np.pi,
                    rng.uniform(*base)))
    return out


@material('seixo', (0.6, 0.6), 1024,
          'Seixo rolado branco de 2 a 5 cm, bem juntinho, com sombras fundas entre as pedras',
          camera=1.3)
def gerar_seixo(info):
    g = Grade(1024, 1024, 0.6, 0.6)
    rng = gerador(2001)
    areia = ruido(g, 2002, 0.004, 0.0008, beta=0.3)
    fundo_cor = hex_lin('#55504a') * (1.0 + 0.15 * areia)[..., None]
    tela = Tela(g, np.full(g.forma, -0.012, F32) + areia * 0.0003,
                {'cor': fundo_cor, 'rug': np.full(g.forma, 0.95, F32),
                 'borda': np.ones(g.forma, F32)})
    campos = {'rel': fbm(g, 2003, 0.02, 0.0015, 0.5),
              'mancha': fbm(g, 2004, 0.03, 0.002, 0.5),
              'veio': ruido(g, 2005, 0.02, 0.001, beta=0.8, alongamento=6.0, angulo=0.8),
              'pinta': ruido(g, 2006, 0.002, 0.0006, beta=0.2)}
    paleta = [('#e2dfd7', 0.30), ('#d8d4ca', 0.22), ('#e4ddcd', 0.18), ('#cdcbc5', 0.12),
              ('#dad0be', 0.10), ('#c4beb2', 0.08)]
    camadas = [((0.032, 0.05), (-0.004, -0.001), 0.80),   # seixos grandes por cima
               ((0.022, 0.034), (-0.008, -0.004), 0.70),  # médios entre eles
               ((0.014, 0.022), (-0.011, -0.007), 0.55)]  # pequenos no fundo
    todos = []
    for diam, base, fator in camadas:
        todos += lista_seixos(rng, 0.6, 0.6, diam, (0.6, 0.95), (0.45, 0.7), base, fator,
                              tentativas=60, n=1500)
    cores = cores_pecas(rng, len(todos), paleta, 0.04)
    tem_veio = rng.random(len(todos)) < 0.25
    ferro = rng.random(len(todos)) < 0.15

    def cor_f(k, loc, r, u, v):
        c = cores[k] * (1.0 + 0.05 * loc['mancha'] + 0.03 * loc['pinta'])[..., None]
        if tem_veio[k]:
            c = misturar(c, c * 0.8, suave(1.2, 2.2, loc['veio']))
        if ferro[k]:
            c = misturar(c, hex_lin('#c9ad85'), suave(0.0, 1.8, loc['mancha']) * 0.5)
        c = misturar(c, c * 0.62, suave(0.75, 1.0, r) * 0.5)        # terra na base do seixo
        return c

    def rug_f(k, loc, r):
        return (0.45 + 0.08 * loc['mancha'] + 0.3 * suave(0.85, 1.0, r)).astype(F32)
    espalhar_seixos(g, tela, rng, todos, campos, cor_f, rug_f)
    return Resultado(g, tela.cam['cor'], tela.alt, tela.cam['rug'], raio_ao=0.02, forca_ao=1.0,
                     sujeira_cavidade=0.25, suavizar_normal=0.0004)


def espalhar_britas(g: Grade, tela: Tela, rng, lista, campos, cores, rug_base=0.82):
    """Carimba pedras britadas (angulosas): interseção de facetas planas inclinadas."""
    for k, (x, y, r, c, base) in enumerate(lista):
        rp = r / g.dx
        R = int(np.ceil(rp * 1.35)) + 2
        r0, c0, xx, yy = recorte_local(x / g.dx, y / g.dy, R)
        nf = int(rng.integers(5, 9))
        angs = np.linspace(0, 2 * np.pi, nf, endpoint=False) + rng.random() * 6.283
        angs = angs + rng.normal(0, 0.25, nf)
        facetas = []
        for a in angs:
            rk = rp * rng.uniform(0.7, 1.3)
            inc = (c / g.dx) / rk * rng.uniform(0.8, 2.0)          # subida por pixel (em px)
            facetas.append((rk - (xx * np.cos(a) + yy * np.sin(a))) * inc)
        facetas = np.stack(facetas)
        qual = np.argmin(facetas, axis=0)
        h = facetas.min(axis=0)
        tx, ty = rng.normal(0, 0.25, 2)
        topo = (c / g.dx) * rng.uniform(0.55, 0.85) + tx * xx + ty * yy
        no_topo = topo < h
        h = np.minimum(h, topo)
        dentro = h > 0
        if not dentro.any():
            continue
        alt = (base + h * g.dx).astype(F32)
        linhas = (r0 + np.arange(2 * R + 1)) % g.h
        cols = (c0 + np.arange(2 * R + 1)) % g.w
        loc = {nm: f[np.ix_(linhas, cols)] for nm, f in campos.items()}
        tom_f = (1.0 + rng.normal(0, 0.05, nf + 1)).astype(F32)
        fac = np.where(no_topo, nf, qual)
        cor = cores[k] * (tom_f[fac] * (1.0 + 0.06 * loc['mancha'] + 0.05 * loc['pinta']))[..., None]
        cor = misturar(cor, cor * 0.5, suave(2.0, 3.0, loc['pinta']) * 0.6)
        alt = alt + loc['rel'] * 0.00006
        rug = (rug_base + 0.05 * loc['mancha']).astype(F32)
        tela.carimbar(r0, c0, np.where(dentro, alt, -1.0).astype(F32), {'cor': cor, 'rug': rug},
                      mascara=dentro, ident=k)


@material('pedrisco', (0.6, 0.6), 1024,
          'Pedrisco / brita fina bege, pedras angulosas de 5 a 15 mm', camera=1.3)
def gerar_pedrisco(info):
    g = Grade(1024, 1024, 0.6, 0.6)
    rng = gerador(2101)
    areia = ruido(g, 2102, 0.003, 0.0006, beta=0.3)
    po = hex_lin('#a3937a') * (1.0 + 0.12 * areia + 0.06 * fbm(g, 2103, 0.1, 0.005, 0.5))[..., None]
    tela = Tela(g, np.full(g.forma, -0.008, F32) + areia * 0.0003,
                {'cor': po, 'rug': np.full(g.forma, 0.95, F32)})
    campos = {'rel': fbm(g, 2104, 0.01, 0.0008, 0.6),
              'mancha': fbm(g, 2105, 0.015, 0.001, 0.5),
              'pinta': ruido(g, 2106, 0.0015, 0.0006, beta=0.2)}
    paleta = [('#c9b693', 0.28), ('#d6c7a5', 0.2), ('#b8a786', 0.18), ('#c6ab90', 0.12),
              ('#a8946f', 0.12), ('#ddd3bd', 0.10)]
    lista = []
    for n, rmin, rmax, base in ((1900, 0.0045, 0.0075, (-0.003, 0.0)),
                                (2600, 0.0032, 0.0055, (-0.0055, -0.002)),
                                (2600, 0.0025, 0.0040, (-0.008, -0.005))):
        for _ in range(n):
            r = rng.uniform(rmin, rmax)
            lista.append((rng.random() * 0.6, rng.random() * 0.6, r, r * rng.uniform(0.6, 1.0),
                          rng.uniform(*base)))
    # as menores primeiro (ficam por baixo); o z-buffer resolve as sobreposições
    lista.sort(key=lambda t: t[4])
    cores = cores_pecas(rng, len(lista), paleta, 0.05)
    espalhar_britas(g, tela, rng, lista, campos, cores)
    return Resultado(g, tela.cam['cor'], tela.alt, tela.cam['rug'], raio_ao=0.008, forca_ao=1.0,
                     sujeira_cavidade=0.3, suavizar_normal=0.0003)


@material('fundo_lago', (1.0, 1.0), 1024,
          'Fundo do laguinho das carpas: seixos e cascalho misturados sob uma película de alga '
          'verde-amarronzada (molhado)', camera=1.2)
def gerar_fundo_lago(info):
    g = Grade(1024, 1024, 1.0, 1.0)
    rng = gerador(2201)
    lodo = fbm(g, 2202, 0.05, 0.002, 0.6)
    tela = Tela(g, np.full(g.forma, -0.03, F32) + lodo * 0.001,
                {'cor': hex_lin('#3b3a2b') * (1.0 + 0.15 * lodo)[..., None],
                 'rug': np.full(g.forma, 0.6, F32), 'borda': np.ones(g.forma, F32)})
    campos = {'rel': fbm(g, 2203, 0.03, 0.002, 0.5),
              'mancha': fbm(g, 2204, 0.05, 0.003, 0.5),
              'veio': ruido(g, 2205, 0.03, 0.0015, beta=0.8, alongamento=5.0, angulo=0.3),
              'pinta': ruido(g, 2206, 0.003, 0.0008, beta=0.2)}
    paleta = [('#8a857a', 0.22), ('#7c6c58', 0.18), ('#9a8462', 0.14), ('#5d5a52', 0.16),
              ('#a39a88', 0.14), ('#7a5a48', 0.08), ('#b5ab98', 0.08)]
    lista = []
    paleta_miuda = [('#7d786d', 0.4), ('#6b5f4f', 0.3), ('#8a7a5e', 0.2), ('#55524b', 0.1)]
    # cascalho miúdo, espalhado ao acaso, por baixo
    for _ in range(5200):
        a = rng.uniform(0.003, 0.007)
        b = a * rng.uniform(0.6, 0.95)
        lista.append((rng.random(), rng.random(), a, b, b * rng.uniform(0.4, 0.7),
                      rng.random() * np.pi, rng.uniform(-0.028, -0.018)))
    lista += lista_seixos(rng, 1.0, 1.0, (0.02, 0.08), (0.55, 0.95), (0.35, 0.6),
                          (-0.03, -0.022), 0.75, tentativas=50, n=900)
    n_miudo = 5200
    cores = np.concatenate([cores_pecas(rng, n_miudo, paleta_miuda, 0.06),
                            cores_pecas(rng, len(lista) - n_miudo, paleta, 0.06)])

    def cor_f(k, loc, r, u, v):
        c = cores[k] * (1.0 + 0.07 * loc['mancha'] + 0.04 * loc['pinta'])[..., None]
        c = misturar(c, c * 0.75, suave(1.0, 2.2, loc['veio']) * 0.6)
        return c

    def rug_f(k, loc, r):
        return np.full(r.shape, 0.4, F32) + 0.05 * loc['mancha']
    espalhar_seixos(g, tela, rng, lista, campos, cor_f, rug_f)
    cor = tela.cam['cor']
    alt = tela.alt
    # molhado: mais escuro e saturado
    lum = luminancia(cor)[..., None]
    cor = (lum + (cor - lum) * 1.25) * 0.72
    # alga: película em manchas, mais grossa no alto das pedras e em zonas calmas
    alto = suave(-0.026, -0.008, alt)
    manto = suave(-1.0, 0.8, fbm(g, 2207, 0.3, 0.01, 0.5))
    fios = suave(0.5, 2.0, ruido(g, 2208, 0.02, 0.0008, beta=0.6, alongamento=4.0, angulo=1.0))
    cobre = np.clip(manto * (0.45 + 0.55 * alto) + 0.25 * fios * manto, 0, 1)
    alga = misturar(hex_lin('#4d5a2c'), hex_lin('#5e5634'), suave(-1, 1, fbm(g, 2209, 0.2, 0.01, 0.5)))
    alga = alga * (1.0 + 0.15 * fbm(g, 2210, 0.01, 0.001, 0.6))[..., None]
    cor = misturar(cor, alga, cobre * 0.8)
    alt = alt - cobre * 0.4 * (alt - desfocar(alt, g, 0.002)) + fios * manto * 0.0002
    rug = (tela.cam['rug'] * (1 - cobre) + 0.5 * cobre).astype(F32)
    return Resultado(g, cor, alt.astype(F32), rug, raio_ao=0.03, forca_ao=1.0,
                     sujeira_cavidade=0.3, suavizar_normal=0.0005)


def folha_seca(rng, g, tela, x, y, comp, larg, ang, base, ident, campos):
    """Carimba uma folha seca curvada (contorno, nervuras e cor manchada)."""
    a = comp / 2 / g.dx
    b = larg / 2 / g.dx
    R = int(np.ceil(a)) + 3
    r0, c0, xx, yy = recorte_local(x / g.dx, y / g.dy, R)
    c, s = np.cos(ang), np.sin(ang)
    u = (xx * c + yy * s) / a
    v = (-xx * s + yy * c) / b
    curva = rng.normal(0, 0.15)
    v = v - curva * (u ** 2 - 0.3)
    meia = np.clip(1 - u ** 2, 0, 1) ** 0.75 * (1.0 + 0.2 * u)
    dentro = (np.abs(u) < 1) & (np.abs(v) < meia)
    if not dentro.any():
        return
    linhas = (r0 + np.arange(2 * R + 1)) % g.h
    cols = (c0 + np.arange(2 * R + 1)) % g.w
    m = campos['mancha'][np.ix_(linhas, cols)]
    nerv = 1.0 - suave(0.0, 0.05, np.abs(v))
    lat = 1.0 - suave(0.0, 0.08, np.abs(((u * 4.0 - np.abs(v) * 3.0) % 1.0) - 0.5) * 2 - 0.85)
    cor0 = hex_lin(['#a17a4b', '#7c5432', '#8f7b5f', '#b08a55', '#6a4a30'][rng.integers(0, 5)])
    cor = cor0 * (1.0 + 0.12 * m)[..., None]
    cor = misturar(cor, cor * 0.7, np.clip(nerv + lat * 0.5, 0, 1) * 0.5)
    enrola = rng.uniform(0.002, 0.008)
    h = base + 0.0006 + enrola * (np.abs(v) / np.maximum(meia, 1e-3)) ** 2 + nerv * 0.0003
    tela.carimbar(r0, c0, np.where(dentro, h, -1).astype(F32),
                  {'cor': cor.astype(F32), 'rug': np.full(u.shape, 0.8, F32)},
                  mascara=dentro, ident=ident, modo='sobre')


@material('terra', (1.0, 1.0), 1024,
          'Canteiro: terra escura adubada com casca de pinus (cobertura morta) e algumas folhas secas',
          camera=1.4)
def gerar_terra(info):
    g = Grade(1024, 1024, 1.0, 1.0)
    rng = gerador(2301)
    # terra: torrões e grumos escuros
    gr = fbm(g, 2302, 0.012, 0.001, 0.6)
    torrao = cristas(fbm(g, 2303, 0.03, 0.003, 0.5))
    claros = suave(2.4, 3.2, ruido(g, 2304, 0.003, 0.0008, beta=0.2))
    cor_t = hex_lin('#3a2c22') * (1.0 + 0.18 * gr + 0.1 * torrao)[..., None]
    cor_t = misturar(cor_t, hex_lin('#7a6a55'), claros * 0.4)
    alt_t = gr * 0.0008 + torrao * 0.0012 + fbm(g, 2305, 0.2, 0.02, 0.5) * 0.003
    tela = Tela(g, alt_t, {'cor': cor_t, 'rug': np.full(g.forma, 0.95, F32)})
    campos = {'fibra': ruido(g, 2306, 0.002, 0.0006, beta=0.4),
              'mancha': fbm(g, 2307, 0.03, 0.003, 0.5)}
    paleta = [('#4d2f20', 0.24), ('#5c3826', 0.24), ('#3e271b', 0.18), ('#6a4430', 0.14),
              ('#2f1f16', 0.1), ('#7a5034', 0.1)]
    # a casca se acumula mais em umas partes do canteiro do que em outras
    densidade = suave(-1.2, 0.8, fbm(g, 2309, 0.4, 0.05, 0.5))
    n = 3200
    cores = cores_pecas(rng, n, paleta, 0.08)
    k = 0
    tent = 0
    while k < n and tent < 4 * n:
        tent += 1
        x, y = rng.random(), rng.random()
        if rng.random() > densidade[int(y / g.dy) % g.h, int(x / g.dx) % g.w]:
            continue
        comp = rng.uniform(0.012, 0.05)
        larg = comp * rng.uniform(0.35, 0.7)
        ang = rng.random() * np.pi
        esp = rng.uniform(0.003, 0.008)
        base = rng.uniform(0.0, 0.014)
        a, b = comp / 2 / g.dx, larg / 2 / g.dx
        R = int(np.ceil(a * 1.3)) + 2
        r0, c0, xx, yy = recorte_local(x / g.dx, y / g.dy, R)
        c, s = np.cos(ang), np.sin(ang)
        u = (xx * c + yy * s) / a
        v = (-xx * s + yy * c) / b
        # contorno anguloso: pedaço quebrado = polígono de 4 a 7 lados
        nl = int(rng.integers(4, 8))
        angs = np.linspace(0, 2 * np.pi, nl, endpoint=False) + rng.random() * 6.283 + rng.normal(0, 0.3, nl)
        dist = np.min(np.stack([rng.uniform(0.7, 1.15) - (u * np.cos(t) + v * np.sin(t))
                                for t in angs]), axis=0)
        dentro = dist > 0
        if not dentro.any():
            continue
        linhas = (r0 + np.arange(2 * R + 1)) % g.h
        cols = (c0 + np.arange(2 * R + 1)) % g.w
        fib = campos['fibra'][np.ix_(linhas, cols)]
        man = campos['mancha'][np.ix_(linhas, cols)]
        # sulcos da casca ao longo do comprimento
        estria = np.sin(v * b * g.dx / rng.uniform(0.0015, 0.003) * 6.283 + 2.0 * fib)
        sulco = suave(0.4, 1.0, estria)
        perfil = np.clip(dist * 4, 0, 1) ** 0.6
        inc = rng.normal(0, 0.08, 2)
        h = base + esp * perfil + (inc[0] * xx + inc[1] * yy) * g.dx - sulco * 0.0006 * perfil
        cor = cores[k] * (1.0 - 0.25 * sulco + 0.12 * man + 0.05 * fib)[..., None]
        cor = misturar(cor, cor * 1.25, (1 - suave(0.0, 0.12, dist)) * 0.5)   # quina lascada clara
        tela.carimbar(r0, c0, np.where(dentro, h, -1).astype(F32),
                      {'cor': cor.astype(F32), 'rug': (0.85 + 0.08 * sulco).astype(F32)},
                      mascara=dentro, ident=k)
        k += 1
    for k in range(9):
        folha_seca(rng, g, tela, rng.random(), rng.random(), rng.uniform(0.05, 0.09),
                   rng.uniform(0.025, 0.045), rng.random() * np.pi, 0.018, n + k, campos)
    return Resultado(g, tela.cam['cor'], tela.alt, tela.cam['rug'], raio_ao=0.015, forca_ao=1.0,
                     sujeira_cavidade=0.3, suavizar_normal=0.0005)


# =====================================================================
# Grama e chão de fora
# =====================================================================
def laminas_de_grama(rng, n, S, mpp, comp, larg, alt_ponta, alt_base, curva=0.6):
    """Gera os segmentos (3 por lâmina) de n lâminas de grama vistas de cima.

    S: lado da tela em pixels; mpp: metros por pixel. Medidas em metros.
    Devolve arrays: pontos (m, 4, 2) em px, altura (m,), t (posição ao longo da lâmina 0..1),
    lâmina (m,) — o índice da lâmina de cada segmento.
    """
    x0 = rng.random(n) * S
    y0 = rng.random(n) * S
    th = rng.random(n) * 2 * np.pi
    L = rng.uniform(*comp, n) / mpp
    w = rng.uniform(*larg, n) / mpp / 2
    kap = rng.normal(0, curva, n)
    hb = rng.uniform(*alt_base, n)
    ht = hb + rng.uniform(*alt_ponta, n)
    ts = np.array([0, 1 / 3, 2 / 3, 1.0])
    # pontos ao longo da lâmina (curvando aos poucos)
    P = np.zeros((n, 4, 2))
    P[:, 0, 0], P[:, 0, 1] = x0, y0
    for k in range(1, 4):
        tm = (ts[k - 1] + ts[k]) / 2
        ang = th + kap * tm
        P[:, k, 0] = P[:, k - 1, 0] + np.cos(ang) * L / 3
        P[:, k, 1] = P[:, k - 1, 1] + np.sin(ang) * L / 3
    segs, alts, tpos, lam = [], [], [], []
    for k in range(3):
        d = P[:, k + 1] - P[:, k]
        d = d / (np.linalg.norm(d, axis=1, keepdims=True) + 1e-9)
        perp = np.stack([-d[:, 1], d[:, 0]], 1)
        w0 = w * (1 - ts[k]) ** 0.6 + 0.25
        w1 = w * (1 - ts[k + 1]) ** 0.6 + 0.15
        quad = np.stack([P[:, k] + perp * w0[:, None], P[:, k + 1] + perp * w1[:, None],
                         P[:, k + 1] - perp * w1[:, None], P[:, k] - perp * w0[:, None]], 1)
        tm = (ts[k] + ts[k + 1]) / 2
        segs.append(quad)
        alts.append(hb + (ht - hb) * tm ** 0.8)
        tpos.append(np.full(n, tm))
        lam.append(np.arange(n))
    return (np.concatenate(segs), np.concatenate(alts), np.concatenate(tpos),
            np.concatenate(lam), (x0, y0))


def pintar_segmentos(img4, segs, alts, cores):
    """Desenha os quadriláteros do mais baixo para o mais alto (pintor), com volta nas bordas.

    img4: (S, S, 4) float32 — RGB linear + altura.
    """
    S = img4.shape[0]
    ordem = np.argsort(alts, kind='stable')
    esc = 16.0
    for i in ordem:
        q = segs[i]
        cor = (float(cores[i, 0]), float(cores[i, 1]), float(cores[i, 2]), float(alts[i]))
        mnx, mxx = q[:, 0].min(), q[:, 0].max()
        mny, mxy = q[:, 1].min(), q[:, 1].max()
        dxs = [0.0] + ([S] if mnx < 0 else []) + ([-S] if mxx >= S else [])
        dys = [0.0] + ([S] if mny < 0 else []) + ([-S] if mxy >= S else [])
        for ox in dxs:
            for oy in dys:
                p = np.round((q + (ox, oy)) * esc).astype(np.int32)
                cv2.fillConvexPoly(img4, p, cor, lineType=cv2.LINE_8, shift=4)


@material('grama_chao', (2.0, 2.0), 1024,
          'Gramado de grama-esmeralda (Zoysia japonica) bem cuidado visto de cima: lâminas finas '
          'sobrepostas, verdes variados, manchas amareladas e escuras, um pouco de terra', camera=1.6)
def gerar_grama_chao(info):
    S = 2048
    gS = Grade(S, S, 2.0, 2.0)
    mpp = 2.0 / S
    rng = gerador(2401)
    # terra por baixo
    terra = fbm(gS, 2402, 0.02, 0.002, 0.6)
    img = np.zeros((S, S, 4), F32)
    img[..., :3] = hex_lin('#4a3a2b') * (1.0 + 0.2 * terra)[..., None]
    img[..., 3] = terra * 0.001
    # manchas do gramado (mais amarelado / mais escuro), em escala de 10 a 60 cm
    mancha_am = suave(0.4, 2.0, fbm(gS, 2403, 0.6, 0.05, 0.5))
    mancha_esc = suave(0.3, 1.8, fbm(gS, 2404, 0.4, 0.04, 0.5))
    variacao = fbm(gS, 2405, 0.15, 0.01, 0.5)
    n = 150000
    segs, alts, tpos, lam, (x0, y0) = laminas_de_grama(
        rng, n, S, mpp, comp=(0.012, 0.035), larg=(0.0018, 0.003), alt_ponta=(0.01, 0.03),
        alt_base=(0.0, 0.015))
    paleta = [('#4f7d2c', 0.26), ('#5b8b33', 0.2), ('#3f6b25', 0.18), ('#6c993d', 0.14),
              ('#7c9a44', 0.1), ('#8e9850', 0.07), ('#a59a63', 0.05)]
    cl = cores_pecas(rng, n, paleta, 0.08)
    ix = np.clip(y0.astype(int), 0, S - 1), np.clip(x0.astype(int), 0, S - 1)
    am = mancha_am[ix][:, None]
    es = mancha_esc[ix][:, None]
    va = variacao[ix][:, None]
    cl = cl + (hex_lin('#9c9a55') - cl) * (am * 0.55)
    cl = cl * (1.0 - 0.3 * es) * (1.0 + 0.08 * va)
    # base da lâmina mais escura e amarelada, ponta mais clara
    t = tpos[:, None]
    cores = cl[lam] * (0.72 + 0.28 * t) * np.array([1.0, 0.97, 0.9], F32) ** (1 - t)
    pintar_segmentos(img, segs, alts, cores)
    cor = img[..., :3]
    alt = img[..., 3]
    rug = (0.72 - 0.08 * (alt > 0.002)).astype(F32)
    return Resultado(gS, cor, alt, rug, forca_normal=0.05, raio_ao=0.02, forca_ao=0.35,
                     sujeira_cavidade=0.15, suavizar_normal=0.001)


@material('chao_externo', (4.0, 4.0), 1024,
          'Chão do terreno vizinho visto de longe: grama irregular em touceiras misturada com '
          'terra roxa avermelhada', camera=1.6)
def gerar_chao_externo(info):
    S = 2048
    gS = Grade(S, S, 4.0, 4.0)
    mpp = 4.0 / S
    rng = gerador(2501)
    # cobertura de grama: manchas grandes de borda recortada
    w1 = fbm(gS, 2502, 1.5, 0.1, 0.5) * 0.25
    w2 = fbm(gS, 2503, 1.5, 0.1, 0.5) * 0.25
    base_c = deformar(fbm(gS, 2504, 2.5, 0.15, 0.45), w1, w2, gS)
    cob = base_c + 0.45 * fbm(gS, 2505, 0.3, 0.02, 0.6)
    grama = suave(-0.35, 0.35, cob)
    # terra roxa: torrões, umidade, pedrinhas e palha seca
    torrao = fbm(gS, 2506, 0.08, 0.004, 0.6)
    umida = suave(0.0, 1.5, fbm(gS, 2507, 0.8, 0.05, 0.5))
    cor_t = misturar(hex_lin('#8a4a2d'), hex_lin('#6a3220'), suave(-1.5, 1.5, fbm(gS, 2508, 0.5, 0.03, 0.5)))
    cor_t = cor_t * (1.0 + 0.15 * torrao)[..., None] * (1.0 - 0.18 * umida)[..., None]
    pedras = suave(2.4, 3.2, ruido(gS, 2509, 0.01, 0.003, beta=0.3))
    cor_t = misturar(cor_t, hex_lin('#b49a7e'), pedras * 0.6)
    img = np.zeros((S, S, 4), F32)
    img[..., :3] = cor_t
    img[..., 3] = torrao * 0.003 + pedras * 0.003
    # lâminas: muitas onde há grama, poucas (touceiras ralas) na terra
    n = 200000
    segs, alts, tpos, lam, (x0, y0) = laminas_de_grama(
        rng, n, S, mpp, comp=(0.02, 0.07), larg=(0.003, 0.006), alt_ponta=(0.01, 0.05),
        alt_base=(0.0, 0.02), curva=0.8)
    ix = np.clip(y0.astype(int), 0, S - 1), np.clip(x0.astype(int), 0, S - 1)
    fica = rng.random(n) < (0.04 + 0.96 * grama[ix])
    paleta = [('#5f7f32', 0.24), ('#4d6e29', 0.2), ('#7a8a3c', 0.16), ('#8e9148', 0.12),
              ('#a59a5c', 0.12), ('#6b8a38', 0.1), ('#b8a874', 0.06)]
    cl = cores_pecas(rng, n, paleta, 0.09)
    seco = suave(0.2, 1.6, fbm(gS, 2510, 0.8, 0.05, 0.5))[ix][:, None]
    cl = cl + (hex_lin('#a99a62') - cl) * (seco * 0.5)
    sel = fica[lam]
    t = tpos[:, None]
    cores = cl[lam] * (0.75 + 0.25 * t)
    pintar_segmentos(img, segs[sel], alts[sel], cores[sel])
    # palha seca solta por cima da terra
    m = 6000
    s2, a2, t2, l2, _ = laminas_de_grama(rng, m, S, mpp, comp=(0.03, 0.09), larg=(0.002, 0.004),
                                         alt_ponta=(0.0, 0.003), alt_base=(0.0, 0.002), curva=0.3)
    c2 = cores_pecas(rng, m, [('#b9a476', 0.5), ('#9c8a60', 0.5)], 0.08)[l2]
    pintar_segmentos(img, s2, a2, c2)
    cor = img[..., :3]
    alt = img[..., 3]
    rug = np.full((S, S), 0.93, F32) - 0.15 * (alt > 0.008)
    return Resultado(gS, cor, alt, rug.astype(F32), forca_normal=0.08, raio_ao=0.04, forca_ao=0.3,
                     sujeira_cavidade=0.15, suavizar_normal=0.002)


# =====================================================================
# Tramas: fibra natural e tecido
# =====================================================================
def trama(g: Grade, passo, meia_larg, coroa, ondula, s, irregular=0.0):
    """Tela simples (sobe-e-desce) com fios horizontais e verticais de passo `passo`.

    Devolve altura, máscara do fio horizontal/vertical (1 = fio horizontal por cima),
    coordenada ao longo do fio, índices dos fios e cobertura (0 = vão).
    """
    X, Y = g.coords()
    i = np.floor(Y / passo).astype(np.int32)
    j = np.floor(X / passo).astype(np.int32)
    dy = Y - (i + 0.5) * passo
    dx = X - (j + 0.5) * passo
    # largura irregular ao longo do fio (fio de linho/fibra tem "nós")
    larg_h = meia_larg * (1.0 + irregular * ruido(g, s, 0.4 * passo * 20, passo * 0.8, beta=0.6,
                                                  alongamento=20.0, angulo=0.0))
    larg_v = meia_larg * (1.0 + irregular * ruido(g, s + 1, 0.4 * passo * 20, passo * 0.8, beta=0.6,
                                                  alongamento=20.0, angulo=np.pi / 2))
    sinal_i = np.where(i % 2 == 0, 1.0, -1.0).astype(F32)
    sinal_j = np.where(j % 2 == 0, 1.0, -1.0).astype(F32)
    c_h = ondula * sinal_i * np.cos(np.pi * (X / passo - 0.5))
    c_v = -ondula * sinal_j * np.cos(np.pi * (Y / passo - 0.5))
    q_h = np.clip(1 - (dy / larg_h) ** 2, 0, 1)
    q_v = np.clip(1 - (dx / larg_v) ** 2, 0, 1)
    h_h = np.where(q_h > 0, c_h + coroa * np.sqrt(q_h), -9.0)
    h_v = np.where(q_v > 0, c_v + coroa * np.sqrt(q_v), -9.0)
    fundo = -ondula - coroa * 0.6
    alt = np.maximum(np.maximum(h_h, h_v), fundo).astype(F32)
    hor = (h_h >= h_v).astype(F32)
    cobertura = np.maximum(suave(0.0, 0.25, q_h), suave(0.0, 0.25, q_v)).astype(F32)
    # suaviza a quina onde um fio some debaixo do outro
    alt = desfocar(alt, g, passo * 0.04)
    return alt, hor, i, j, cobertura, q_h, q_v


@material('fibra', (0.3, 0.3), 1024,
          'Trama de fibra natural (rattan/vime) em tiras de 8 mm, sobe-e-desce; cestos e luminárias',
          camera=0.6)
def gerar_fibra(info):
    g = Grade(1024, 1024, 0.3, 0.3)
    rng = gerador(1501)
    passo = 0.010
    alt, hor, i, j, cob, q_h, q_v = trama(g, passo, 0.0041, 0.0011, 0.0011, 1502, irregular=0.05)
    nf = int(round(0.3 / passo))
    paleta = [('#c9a46a', 0.4), ('#b88f57', 0.3), ('#d5b47d', 0.2), ('#a87c48', 0.1)]
    c_h = cores_pecas(rng, nf, paleta, 0.06)
    c_v = cores_pecas(rng, nf, paleta, 0.06)
    # estrias da fibra ao longo de cada tira
    est_h = ruido(g, 1503, 0.05, 0.0004, beta=0.5, alongamento=25.0, angulo=0.0)
    est_v = ruido(g, 1504, 0.05, 0.0004, beta=0.5, alongamento=25.0, angulo=np.pi / 2)
    cor_h = c_h[i % nf] * (1.0 + 0.10 * est_h)[..., None]
    cor_v = c_v[j % nf] * (1.0 + 0.10 * est_v)[..., None]
    # pele da tira mais escura nas bordas (a tira é abaulada)
    cor_h = cor_h * (0.8 + 0.2 * np.sqrt(q_h))[..., None]
    cor_v = cor_v * (0.8 + 0.2 * np.sqrt(q_v))[..., None]
    cor = misturar(cor_v, cor_h, hor)
    cor = misturar(hex_lin('#3a2a1b'), cor, cob)
    alt = alt + (est_h * hor + est_v * (1 - hor)) * 0.00004
    rug = (0.58 + 0.06 * (est_h * hor + est_v * (1 - hor))).astype(F32)
    rug = 0.9 + (rug - 0.9) * cob
    return Resultado(g, cor, alt.astype(F32), rug.astype(F32), raio_ao=0.006, forca_ao=1.0,
                     sujeira_cavidade=0.25)


@material('tecido', (0.2, 0.2), 1024,
          'Tecido de linho/estofado em tela simples, fios de 1 mm; cor clara e neutra (tingir na cena)',
          camera=0.45)
def gerar_tecido(info):
    g = Grade(1024, 1024, 0.2, 0.2)
    rng = gerador(1601)
    passo = 0.001
    alt, hor, i, j, cob, q_h, q_v = trama(g, passo, 0.00049, 0.00012, 0.00008, 1602, irregular=0.06)
    nf = int(round(0.2 / passo))
    t_h = (1.0 + rng.normal(0, 0.035, nf)).astype(F32)
    t_v = (1.0 + rng.normal(0, 0.035, nf)).astype(F32)
    # nós e falhas do fio (linho): faixas mais claras/escuras ao longo de cada fio
    nos_h = ruido(g, 1603, 0.03, 0.001, beta=0.6, alongamento=30.0, angulo=0.0)
    nos_v = ruido(g, 1604, 0.03, 0.001, beta=0.6, alongamento=30.0, angulo=np.pi / 2)
    l_h = t_h[i % nf] * (1.0 + 0.06 * nos_h) * (0.88 + 0.12 * np.sqrt(q_h))
    l_v = t_v[j % nf] * (1.0 + 0.06 * nos_v) * (0.88 + 0.12 * np.sqrt(q_v))
    lum = l_v + (l_h - l_v) * hor
    base = hex_lin('#dcd8cf')
    cor = base * lum[..., None]
    cor = misturar(base * 0.8, cor, cob)
    cor = cor * (1.0 + 0.015 * fbm(g, 1605, 0.1, 0.005, 0.5))[..., None]
    rug = (0.9 + 0.04 * (1 - cob)).astype(F32)
    return Resultado(g, cor, alt.astype(F32), rug, raio_ao=0.0008, forca_ao=1.0,
                     sujeira_cavidade=0.15)


# =====================================================================
# execução
# =====================================================================
def principal(argv):
    pasta_rev = None
    nomes = []
    i = 0
    while i < len(argv):
        if argv[i] == '--revisao':
            pasta_rev = argv[i + 1]
            i += 2
            continue
        nomes.append(argv[i])
        i += 1
    if not nomes:
        nomes = list(MATERIAIS)
    os.makedirs(SAIDA, exist_ok=True)
    manifesto = {}
    if os.path.exists(MANIFESTO):
        with open(MANIFESTO, encoding='utf-8') as f:
            manifesto = json.load(f)
    vistas = {}
    for nome in nomes:
        info = MATERIAIS[nome]
        t0 = time.time()
        res = info['func'](info)
        alt, tam = finalizar(nome, info, res)
        manifesto[nome] = {'tamanho_m': list(tam), 'px': info['px'], 'desc': info['desc']}
        print(f'{nome}: {time.time() - t0:.1f} s', flush=True)
        if pasta_rev:
            import revisao
            vistas[nome] = revisao.prancha(SAIDA, pasta_rev, nome, tam, alt,
                                           altura_cam=info['camera'])
    ordem = {n: k for k, n in enumerate(MATERIAIS)}
    manifesto = dict(sorted(manifesto.items(), key=lambda kv: ordem.get(kv[0], 999)))
    with open(MANIFESTO, 'w', encoding='utf-8') as f:
        json.dump(manifesto, f, ensure_ascii=False, indent=2)
    if pasta_rev and len(vistas) == len(MATERIAIS):
        import revisao
        revisao.folha_contato(vistas, os.path.join(pasta_rev, 'contato.jpg'))


if __name__ == '__main__':
    principal(sys.argv[1:])
