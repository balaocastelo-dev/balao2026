"""Materiais dos adereços (PBR simples) e as poucas texturas, desenhadas por código.

Cada material tem nome claro; os emissivos que o motor acende têm o nome combinado
(`chama`, `led_som`, `led_cabine`, `lente_movel`, `tela_led`, `neon`).
Cores em sRGB (como se escolhe), convertidas para linear no Blender.
Só recursos do MeshStandardMaterial do three.js (sem verniz, brilho de tecido ou
transmissão), para não multiplicar programas de sombreamento no motor.
"""
import math
import os
import tempfile

import bpy
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

PASTA_TEX = None

# nome: cor (sRGB), rug (rugosidade), met (metálico), emis (cor da emissão), forca,
# tex (textura de cor), norm (textura de normal), alfa (0..1, mistura), mascara (recorte pela textura),
# dupla (dupla face), corte (alphaCutoff)
DEF = {
    # ---------------------------------------------------------------- comuns
    'plastico_preto': dict(cor='#1c1c1e', rug=0.45),
    'plastico_preto_fosco': dict(cor='#202022', rug=0.75),
    'plastico_branco': dict(cor='#f1f0ec', rug=0.32),
    'plastico_cinza': dict(cor='#8d9195', rug=0.5),
    'borracha': dict(cor='#161616', rug=0.88),
    'aluminio': dict(cor='#c8cbce', rug=0.32, met=1.0),
    'aluminio_escovado': dict(cor='#b9bcbf', rug=0.45, met=1.0),
    'aco_inox': dict(cor='#d2d4d6', rug=0.22, met=1.0),
    'aco_galvanizado': dict(cor='#a9adb0', rug=0.5, met=0.9),
    'metal_preto': dict(cor='#1d1d1f', rug=0.5, met=0.6),
    'madeira_cabo': dict(cor='#c49562', rug=0.55),
    'madeira_clara': dict(cor='#b9875a', rug=0.55),
    'madeira_escura': dict(cor='#5e3e26', rug=0.5),
    'madeira_cumaru': dict(cor='#8a5534', rug=0.55),
    'madeira_tabua': dict(cor='#b88452', rug=0.6),
    # ---------------------------------------------------------------- aniversário
    'toalha_branca': dict(cor='#f3f1ec', rug=0.85, norm='tecido_n', dupla=True),
    'cobertura_rosa': dict(cor='#f0b3c4', rug=0.55),
    'cobertura_branca': dict(cor='#f7f0e6', rug=0.5),
    'bolo_massa': dict(cor='#e9c98f', rug=0.85),
    'recheio_chocolate': dict(cor='#4a2414', rug=0.45),
    'morango': dict(cor='#c4162a', rug=0.3),
    'folha_morango': dict(cor='#3f7a2a', rug=0.5, dupla=True),
    'confeitos': dict(cor='#ffffff', rug=0.4),
    'vela': dict(cor='#ffffff', rug=0.45),
    'pavio': dict(cor='#1e1a17', rug=0.9),
    'chama': dict(cor='#ffd27a', rug=1.0, emis='#ffb347', forca=6.0),
    'porcelana': dict(cor='#f6f5f1', rug=0.12),
    'bandeja_prata': dict(cor='#dcdcdc', rug=0.22, met=1.0),
    'brigadeiro': dict(cor='#ffffff', rug=0.6, tex='granulado'),
    'beijinho': dict(cor='#f1ebe0', rug=0.85),
    'cravo': dict(cor='#2b1a10', rug=0.7),
    'forminha_rosa': dict(cor='#e45d8c', rug=0.45, dupla=True),
    'forminha_dourada': dict(cor='#d8ac52', rug=0.3, met=0.75, dupla=True),
    'papel_bolinhas': dict(cor='#ffffff', rug=0.45, tex='papel_bolinhas'),
    'papel_listras': dict(cor='#ffffff', rug=0.45, tex='papel_listras'),
    'papel_vermelho': dict(cor='#c21f2f', rug=0.4),
    'papel_verde': dict(cor='#2e7d55', rug=0.42),
    'papel_dourado': dict(cor='#d8b462', rug=0.32, met=0.65),
    'fita_dourada': dict(cor='#e2bd5c', rug=0.3, met=0.55),
    'fita_branca': dict(cor='#f6f4f0', rug=0.35),
    'fita_vermelha': dict(cor='#b3131d', rug=0.35),
    'fita_balao': dict(cor='#e6e6e8', rug=0.25, met=0.4, dupla=True),
    'balao_vermelho': dict(cor='#d3192b', rug=0.3),
    'balao_rosa': dict(cor='#f27fae', rug=0.3),
    'balao_branco': dict(cor='#f3f0ea', rug=0.3),
    'balao_dourado': dict(cor='#dcb35c', rug=0.22, met=0.85),
    'balao_azul': dict(cor='#2a66d8', rug=0.3),
    'balao_amarelo': dict(cor='#f6c51b', rug=0.3),
    'balao_lilas': dict(cor='#b58ad9', rug=0.3),
    'peso_balao': dict(cor='#c9c9d1', rug=0.25, met=0.9),
    'faixa_letras': dict(cor='#ffffff', rug=0.6, tex='faixa_letras'),
    'faixa_verso': dict(cor='#eee6d6', rug=0.7),
    'cordao': dict(cor='#e6dcc4', rug=0.9),
    'almofada_branca': dict(cor='#efede7', rug=0.8),
    'chapeu_listras': dict(cor='#ffffff', rug=0.45, tex='chapeu_listras', dupla=True),
    'pompom_dourado': dict(cor='#e6c35f', rug=0.55, met=0.6),
    'elastico': dict(cor='#f0f0f0', rug=0.6),
    'copo_bolinhas': dict(cor='#ffffff', rug=0.5, tex='copo_bolinhas', dupla=True),
    'refrigerante': dict(cor='#4a200c', rug=0.08),
    'prato_festa': dict(cor='#f5a9c2', rug=0.45, dupla=True),
    # ---------------------------------------------------------------- cinema
    'tecido_pufe': dict(cor='#c08a33', rug=0.92, norm='tecido_n'),
    'lona_cadeira': dict(cor='#24304a', rug=0.9, dupla=True),
    'manta_xadrez': dict(cor='#ffffff', rug=0.95, tex='manta_xadrez', dupla=True),
    'balde_vermelho': dict(cor='#c8142c', rug=0.55),
    'balde_branco': dict(cor='#f5f1e8', rug=0.6),
    'pipoca': dict(cor='#ffffff', rug=0.85),
    'projetor_corpo': dict(cor='#e8e8e6', rug=0.38),
    'lente_projetor': dict(cor='#0b1622', rug=0.05, met=0.3, emis='#d8e6ff', forca=1.5),
    'cooler_azul': dict(cor='#1d5ea8', rug=0.38),
    'cooler_branco': dict(cor='#f1f1ed', rug=0.4),
    # ---------------------------------------------------------------- trabalho
    'aco_verde': dict(cor='#2f5a33', rug=0.38, met=0.4),
    'motor_cinza': dict(cor='#9c9fa3', rug=0.45, met=0.7),
    'plastico_vermelho': dict(cor='#b52222', rug=0.4),
    'plastico_amarelo': dict(cor='#f0b81c', rug=0.4),
    'plastico_laranja': dict(cor='#e0651c', rug=0.42),
    'aco_vermelho': dict(cor='#a8261e', rug=0.4, met=0.35),
    'folhas_secas': dict(cor='#ffffff', rug=0.85, tex='folhas_secas', mascara=True, dupla=True, corte=0.5),
    'folhas_monte': dict(cor='#ffffff', rug=0.95, tex='folhas_monte'),
    'vime': dict(cor='#ffffff', rug=0.7, tex='vime', norm='vime_n'),
    'manga': dict(cor='#ffffff', rug=0.38),
    'goiaba': dict(cor='#ffffff', rug=0.55),
    'folha_verde': dict(cor='#3c6b2a', rug=0.5, dupla=True),
    'tela_peneira': dict(cor='#e8edf2', rug=0.6, tex='tela_peneira', mascara=True, dupla=True, corte=0.5),
    'plastico_azul': dict(cor='#2361b8', rug=0.4),
    'mangueira_verde': dict(cor='#2f8a3c', rug=0.42),
    'plastico_verde_escuro': dict(cor='#1f4d2b', rug=0.45),
    'saco_verde': dict(cor='#2b6a33', rug=0.3),
    'lona_coletor': dict(cor='#3a4038', rug=0.9),
    # ---------------------------------------------------------------- piscina e churrasco
    'vinil_rosa': dict(cor='#f48ab6', rug=0.22),
    'vinil_creme': dict(cor='#efcf97', rug=0.25),
    'vinil_branco': dict(cor='#f6f6f4', rug=0.22),
    'vinil_azul': dict(cor='#24a1d9', rug=0.22),
    'vinil_vermelho': dict(cor='#d8202c', rug=0.25),
    'vinil_amarelo': dict(cor='#f7c81c', rug=0.25),
    'vinil_verde': dict(cor='#2fae4a', rug=0.25),
    'vinil_laranja': dict(cor='#f27a1a', rug=0.25),
    'vinil_flamingo': dict(cor='#ff86b2', rug=0.22),
    'bico_preto': dict(cor='#1a1a1a', rug=0.3),
    'lona_branca': dict(cor='#f2efe6', rug=0.85, dupla=True),
    'lona_azul': dict(cor='#1c5d9e', rug=0.85, dupla=True),
    'base_concreto': dict(cor='#6f6d68', rug=0.9),
    'tecido_espreguicadeira': dict(cor='#efe9dc', rug=0.9),
    'toalha_listrada': dict(cor='#ffffff', rug=0.95, tex='toalha_listrada'),
    'grelha_som': dict(cor='#ffffff', rug=0.6, met=0.4, tex='grelha_som'),
    'led_som': dict(cor='#6fc8ff', rug=0.4, emis='#3fa9ff', forca=4.0),
    'lata_pintura': dict(cor='#c7262c', rug=0.3, met=0.65),
    'lata_aluminio': dict(cor='#d4d6d8', rug=0.25, met=1.0),
    'lata_faixa': dict(cor='#f1ece2', rug=0.3, met=0.4),
    'vidro': dict(cor='#e8f2f2', rug=0.05, alfa=0.22, dupla=False),
    'bebida_laranja': dict(cor='#f07d1c', rug=0.1, alfa=0.9),
    'gelo': dict(cor='#eef6fa', rug=0.08, alfa=0.55),
    'canudo': dict(cor='#e83a7a', rug=0.35),
    'limao_casca': dict(cor='#6fa52f', rug=0.45),
    'limao_polpa': dict(cor='#d9ea8e', rug=0.4),
    'carne_tostada': dict(cor='#ffffff', rug=0.6),
    'carne_ponto': dict(cor='#b9534c', rug=0.5),
    'gordura_tostada': dict(cor='#e7c78a', rug=0.45),
    'linguica': dict(cor='#ffffff', rug=0.35),
    # ---------------------------------------------------------------- rave
    'madeira_preta': dict(cor='#141414', rug=0.6),
    'tela_cdj': dict(cor='#0a1220', rug=0.1, emis='#5fb0ff', forca=1.2),
    'tela_notebook': dict(cor='#0a0f18', rug=0.08, emis='#8ab4ff', forca=1.0),
    'led_cabine': dict(cor='#ff4ad8', rug=0.4, emis='#ff2fd0', forca=5.0),
    'caixa_preta': dict(cor='#1a1a1b', rug=0.82),
    'lente_movel': dict(cor='#f4f6ff', rug=0.1, emis='#ffffff', forca=6.0),
    'tela_led': dict(cor='#050505', rug=0.25, emis='#ffffff', forca=1.0),
    'abertura_laser': dict(cor='#06140a', rug=0.04, met=0.3, emis='#1f8f3a', forca=1.0),
    'neon': dict(cor='#a8ffb0', rug=0.3, emis='#39ff14', forca=5.0),
}

# materiais que o motor acende (para o json)
EMISSIVOS_COMBINADOS = ('chama', 'led_som', 'led_cabine', 'lente_movel', 'tela_led', 'neon')


def srgb_linear(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)


def material(nome):
    m = bpy.data.materials.get(nome)
    if m is not None:
        return m
    d = DEF[nome]
    m = bpy.data.materials.new(nome)
    nt = m.node_tree
    b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    cor = srgb_linear(d.get('cor', '#ffffff'))
    b.inputs['Base Color'].default_value = (*cor, 1)
    b.inputs['Roughness'].default_value = d.get('rug', 0.5)
    b.inputs['Metallic'].default_value = d.get('met', 0.0)
    b.inputs['IOR'].default_value = 1.5
    if 'emis' in d:
        b.inputs['Emission Color'].default_value = (*srgb_linear(d['emis']), 1)
        b.inputs['Emission Strength'].default_value = d.get('forca', 1.0)
    if 'tex' in d:
        im = imagem(d['tex'])
        no = nt.nodes.new('ShaderNodeTexImage')
        no.image = im
        if any(abs(c - 1) > 1e-3 for c in cor):
            mix = nt.nodes.new('ShaderNodeMix')
            mix.data_type = 'RGBA'
            mix.blend_type = 'MULTIPLY'
            mix.inputs['Factor'].default_value = 1.0
            nt.links.new(no.outputs['Color'], mix.inputs['A'])
            mix.inputs['B'].default_value = (*cor, 1)
            nt.links.new(mix.outputs['Result'], b.inputs['Base Color'])
        else:
            nt.links.new(no.outputs['Color'], b.inputs['Base Color'])
        if d.get('mascara'):
            nt.links.new(no.outputs['Alpha'], b.inputs['Alpha'])
    if 'norm' in d:
        im = imagem(d['norm'], dados=True)
        no = nt.nodes.new('ShaderNodeTexImage')
        no.image = im
        nm = nt.nodes.new('ShaderNodeNormalMap')
        nm.inputs['Strength'].default_value = d.get('norm_forca', 1.0)
        nt.links.new(no.outputs['Color'], nm.inputs['Color'])
        nt.links.new(nm.outputs['Normal'], b.inputs['Normal'])
    if 'alfa' in d:
        b.inputs['Alpha'].default_value = d['alfa']
    m.use_backface_culling = not d.get('dupla', False)
    return m


def info_gltf(nome):
    """O que o pós-processamento força no material do glTF."""
    d = DEF[nome]
    r = {'doubleSided': bool(d.get('dupla', False))}
    if d.get('mascara'):
        r['alphaMode'] = 'MASK'
        r['alphaCutoff'] = d.get('corte', 0.5)
    elif 'alfa' in d:
        r['alphaMode'] = 'BLEND'
    else:
        r['alphaMode'] = 'OPAQUE'
    return r


# ----------------------------------------------------------------- texturas

def pasta():
    global PASTA_TEX
    if PASTA_TEX is None:
        PASTA_TEX = tempfile.mkdtemp(prefix='aderecos_tex_')
    return PASTA_TEX


def imagem(nome, dados=False):
    im = bpy.data.images.get(nome)
    if im is not None:
        return im
    caminho = TEXTURAS[nome]()
    im = bpy.data.images.load(caminho)
    im.name = nome
    if dados:
        im.colorspace_settings.name = 'Non-Color'
    return im


def _salvar(nome, arr, alfa=False, qualidade=88):
    arr = np.clip(arr, 0, 255).astype(np.uint8)
    if alfa:
        caminho = os.path.join(pasta(), nome + '.png')
        Image.fromarray(arr, 'RGBA').save(caminho, optimize=True)
    else:
        caminho = os.path.join(pasta(), nome + '.jpg')
        Image.fromarray(arr[..., :3], 'RGB').save(caminho, quality=qualidade, optimize=True)
    return caminho


def _normal_de_altura(h, forca=2.0):
    """Mapa de normais (tangente, OpenGL/glTF: Y para cima) a partir de altura (0..1), periódico."""
    dx = (np.roll(h, -1, axis=1) - np.roll(h, 1, axis=1)) * 0.5 * forca
    dy = (np.roll(h, -1, axis=0) - np.roll(h, 1, axis=0)) * 0.5 * forca
    # linha 0 da imagem é o topo (v = 1): derivada em v tem o sinal trocado
    n = np.stack([-dx, dy, np.ones_like(h)], axis=-1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    return (n * 0.5 + 0.5) * 255


def _hex(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=float)


def tex_tecido_n():
    """Trama de tecido (tafetá) periódica, 256²; cada fio ocupa 8 px."""
    n = 256
    y, x = np.mgrid[0:n, 0:n].astype(float)
    p = 8.0
    fx = (x % p) / p
    fy = (y % p) / p
    cx = (x // p).astype(int)
    cy = (y // p).astype(int)
    trama = ((cx + cy) % 2 == 0)
    urdume = np.sin(fx * math.pi) ** 0.7
    tr = np.sin(fy * math.pi) ** 0.7
    h = np.where(trama, 0.55 + 0.45 * urdume * (0.6 + 0.4 * np.sin(fy * math.pi)),
                 0.55 + 0.45 * tr * (0.6 + 0.4 * np.sin(fx * math.pi)))
    rng = np.random.default_rng(3)
    h += rng.normal(0, 0.03, h.shape)
    return _salvar('tecido_n', _normal_de_altura(h, 1.2))


def tex_faixa_letras():
    """Atlas 512² com 16 bandeirolas (4 x 4): fundo colorido e uma letra de FELIZ ANIVERSÁRIO."""
    letras = list('FELIZ') + list('ANIVERSÁRIO')
    cores = ['#e53950', '#f4b400', '#2b7de9', '#33a852', '#ef6fb0', '#f57c1f', '#8e5bd6', '#14a3a8']
    im = Image.new('RGBA', (512, 512), (255, 255, 255, 255))
    d = ImageDraw.Draw(im)
    fonte = ImageFont.truetype('/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf', 84)
    for i, L in enumerate(letras):
        cx, cy = (i % 4) * 128, (i // 4) * 128
        cor = tuple(int(c) for c in _hex(cores[i % len(cores)]))
        d.rectangle([cx, cy, cx + 127, cy + 127], fill=cor + (255,))
        # bolinhas claras no fundo
        for k in range(14):
            bx = cx + 10 + (k * 37) % 108
            by = cy + 6 + (k * 53) % 116
            d.ellipse([bx - 4, by - 4, bx + 4, by + 4], fill=tuple(min(255, c + 45) for c in cor) + (255,))
        # borda
        d.rectangle([cx + 4, cy + 4, cx + 123, cy + 123], outline=(255, 255, 255, 255), width=3)
        caixa = d.textbbox((0, 0), L, font=fonte)
        w, h = caixa[2] - caixa[0], caixa[3] - caixa[1]
        x = cx + 64 - w / 2 - caixa[0]
        y = cy + 50 - h / 2 - caixa[1]
        d.text((x + 3, y + 3), L, font=fonte, fill=(0, 0, 0, 90))
        d.text((x, y), L, font=fonte, fill=(255, 255, 255, 255), stroke_width=2, stroke_fill=tuple(max(0, c - 70) for c in cor) + (255,))
    return _salvar('faixa_letras', np.array(im))


def tex_papel_bolinhas():
    n = 128
    im = Image.new('RGB', (n, n), tuple(int(c) for c in _hex('#e2508a')))
    d = ImageDraw.Draw(im)
    for (x, y) in [(32, 32), (96, 96), (96, 32), (32, 96), (0, 64), (64, 0), (128, 64), (64, 128), (0, 0), (128, 0), (0, 128), (128, 128), (64, 64)]:
        r = 9 if (x + y) % 64 == 0 else 7
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 250, 245))
    return _salvar('papel_bolinhas', np.array(im))


def tex_copo_bolinhas():
    n = 128
    im = Image.new('RGB', (n, n), (255, 255, 255))
    d = ImageDraw.Draw(im)
    cores = ['#f4b400', '#2b7de9', '#e53950', '#33a852']
    k = 0
    for y in range(0, 129, 32):
        for x in range((y // 32 % 2) * 16, 129, 32):
            c = tuple(int(v) for v in _hex(cores[k % 4]))
            k += 1
            d.ellipse([x - 7, y - 7, x + 7, y + 7], fill=c)
    return _salvar('copo_bolinhas', np.array(im))


def tex_papel_listras():
    n = 128
    y, x = np.mgrid[0:n, 0:n]
    a = _hex('#2f6fd6')
    b = _hex('#f5f7fb')
    faixa = ((x + y) // 16) % 2 == 0
    arr = np.where(faixa[..., None], a, b)
    fino = ((x + y) % 16 < 2)
    arr = np.where(fino[..., None], _hex('#f4c542'), arr)
    return _salvar('papel_listras', arr)


def tex_chapeu_listras():
    n = 128
    y, x = np.mgrid[0:n, 0:n]
    cores = [_hex('#ef4b7d'), _hex('#ffffff'), _hex('#22a6e0'), _hex('#ffffff'), _hex('#f8c21a'), _hex('#ffffff')]
    k = ((x * 2 + y) // 22) % len(cores)
    arr = np.zeros((n, n, 3))
    for i, c in enumerate(cores):
        arr[k == i] = c
    # pontinhos dourados nas faixas brancas
    pts = ((x % 16 - 8) ** 2 + (y % 16 - 8) ** 2 < 5) & (k % 2 == 1)
    arr[pts] = _hex('#e2b54a')
    return _salvar('chapeu_listras', arr)


def tex_granulado():
    """Granulado de chocolate sobre o brigadeiro, 128²."""
    n = 128
    rng = np.random.default_rng(7)
    im = Image.new('RGB', (n, n), (52, 30, 18))
    d = ImageDraw.Draw(im)
    for _ in range(420):
        x, y = rng.uniform(0, n, 2)
        a = rng.uniform(0, math.pi)
        L = rng.uniform(3, 6)
        c = int(rng.uniform(22, 70))
        cor = (c + 14, int(c * 0.6), int(c * 0.35))
        for ox in (-n, 0, n):
            for oy in (-n, 0, n):
                d.line([(x + ox - L * math.cos(a), y + oy - L * math.sin(a)),
                        (x + ox + L * math.cos(a), y + oy + L * math.sin(a))], fill=cor, width=2)
    im = im.filter(ImageFilter.SMOOTH)
    return _salvar('granulado', np.array(im))


def tex_manta_xadrez():
    """Xadrez escocês (manta), 256², periódico."""
    n = 256
    i = np.arange(n)
    # sequência de faixas (largura em px, cor)
    seq = [(36, '#a8323a'), (6, '#2b3a5c'), (14, '#a8323a'), (4, '#f0d58a'), (14, '#a8323a'), (6, '#2b3a5c'),
           (36, '#a8323a'), (40, '#3f5f42'), (8, '#2b3a5c'), (40, '#3f5f42'), (18, '#e9dfc8')]
    tot = sum(s for s, _ in seq)
    cor_px = np.zeros((tot, 3))
    p = 0
    for s, c in seq:
        cor_px[p:p + s] = _hex(c)
        p += s
    idx = (i * tot // n)
    linha = cor_px[idx]
    y, x = np.mgrid[0:n, 0:n]
    sarja = ((x + y) % 4 < 2)
    arr = np.where(sarja[..., None], linha[x], linha[y])
    arr = 0.55 * arr + 0.45 * (linha[x] + linha[y]) / 2
    rng = np.random.default_rng(11)
    arr *= (1 + rng.normal(0, 0.04, (n, n, 1)))
    return _salvar('manta_xadrez', arr)


def tex_toalha_listrada():
    n = 128
    y, x = np.mgrid[0:n, 0:n]
    seq = [(20, '#f6f3ea'), (6, '#2a8fc9'), (4, '#f6f3ea'), (14, '#2a8fc9'), (4, '#f6f3ea'), (6, '#2a8fc9'),
           (20, '#f6f3ea'), (18, '#f2a83a'), (18, '#f6f3ea'), (18, '#2a8fc9')]
    tot = sum(s for s, _ in seq)
    cor = np.zeros((tot, 3))
    p = 0
    for s, c in seq:
        cor[p:p + s] = _hex(c)
        p += s
    arr = cor[(x * tot // n)]
    rng = np.random.default_rng(5)
    felpa = rng.normal(0, 1, (n, n))
    felpa = (felpa + np.roll(felpa, 1, 0) + np.roll(felpa, 1, 1)) / 3
    arr = arr * (1 + 0.07 * felpa[..., None])
    return _salvar('toalha_listrada', arr)


def _folha_contorno(cx, cy, comp, larg, ang, rng, pontas=1):
    pts = []
    for t in np.linspace(0, math.pi, 14):
        s = math.sin(t)
        r = larg * s ** 0.9 * (1 + 0.15 * math.sin(3 * t) * (pontas - 1))
        pts.append((-comp / 2 + comp * (1 - math.cos(t)) / 2, r))
    for t in np.linspace(math.pi, 0, 14)[1:-1]:
        s = math.sin(t)
        r = larg * s ** 0.9
        pts.append((-comp / 2 + comp * (1 - math.cos(t)) / 2, -r * (0.85 + 0.15 * rng.uniform())))
    c, s = math.cos(ang), math.sin(ang)
    return [(cx + x * c - y * s, cy + x * s + y * c) for x, y in pts]


def tex_folhas_secas():
    """Atlas 256² (2 x 2) de folhas secas com recorte (alfa). Cada célula, uma folha."""
    n = 256
    im = Image.new('RGBA', (n, n), (90, 70, 40, 0))
    d = ImageDraw.Draw(im)
    rng = np.random.default_rng(21)
    cores = [('#8a5a2b', '#5e3b1a'), ('#a87a3a', '#6b4a22'), ('#7c6a2e', '#4d4018'), ('#b0662a', '#6e3c16')]
    for k in range(4):
        cx, cy = (k % 2) * 128 + 64, (k // 2) * 128 + 64
        base, veia = cores[k]
        cont = _folha_contorno(cx, cy, 112, 34 + 8 * (k % 2), math.radians(90), rng)
        d.polygon(cont, fill=tuple(int(v) for v in _hex(base)) + (255,))
        cv = tuple(int(v) for v in _hex(veia)) + (255,)
        d.line([(cx, cy - 56), (cx, cy + 60)], fill=cv, width=3)
        for j in range(5):
            yy = cy - 40 + j * 18
            d.line([(cx, yy), (cx - 22, yy - 14)], fill=cv, width=1)
            d.line([(cx, yy), (cx + 22, yy - 14)], fill=cv, width=1)
    arr = np.array(im).astype(float)
    manchas = rng.normal(0, 1, (n, n))
    for _ in range(3):
        manchas = (manchas + np.roll(manchas, 1, 0) + np.roll(manchas, 1, 1) + np.roll(manchas, -1, 0)) / 4
    arr[..., :3] *= (1 + 0.5 * manchas[..., None])
    return _salvar('folhas_secas', arr, alfa=True)


def tex_folhas_monte():
    """Cor do monte de folhas (opaco), 256², periódico: folhas sobrepostas."""
    n = 256
    rng = np.random.default_rng(31)
    im = Image.new('RGB', (n, n), (70, 48, 24))
    d = ImageDraw.Draw(im)
    cores = ['#8a5a2b', '#a87a3a', '#7c6a2e', '#b0662a', '#6d4a22', '#93723a', '#5d6a2c']
    for _ in range(170):
        cx, cy = rng.uniform(0, n, 2)
        ang = rng.uniform(0, 2 * math.pi)
        cont = _folha_contorno(0, 0, rng.uniform(26, 44), rng.uniform(8, 13), ang, rng)
        cor = tuple(int(v * rng.uniform(0.8, 1.1)) for v in _hex(cores[rng.integers(len(cores))]))
        for ox in (-n, 0, n):
            for oy in (-n, 0, n):
                d.polygon([(x + cx + ox, y + cy + oy) for x, y in cont], fill=cor, outline=(50, 34, 16))
    return _salvar('folhas_monte', np.array(im))


def tex_vime():
    """Trançado de vime: cor e normal, 256², periódico."""
    n = 256
    y, x = np.mgrid[0:n, 0:n].astype(float)
    p = 16.0
    fx = (x % p) / p
    fy = (y % p) / p
    cx = (x // p).astype(int)
    cy = (y // (p / 2)).astype(int)
    # fios horizontais (trama) cruzando varetas verticais
    fio = np.sin(((y % (p / 2)) / (p / 2)) * math.pi)
    sobe = ((cx + cy) % 2 == 0)
    h = fio * (0.6 + 0.4 * np.where(sobe, np.sin(fx * math.pi), 1 - np.sin(fx * math.pi)))
    rng = np.random.default_rng(9)
    var = rng.normal(0, 1, (n // 8, 1))
    var = np.repeat(var, 8, axis=0)
    base = _hex('#b8915a')
    cor = base[None, None, :] * (0.72 + 0.35 * h[..., None]) * (1 + 0.08 * var[..., None])
    cor = cor * (1 + rng.normal(0, 0.03, (n, n, 1)))
    _salvar('vime_n', _normal_de_altura(h, 3.0))
    return _salvar('vime', cor)


def tex_vime_n():
    tex_vime()
    return os.path.join(pasta(), 'vime_n.jpg')


def tex_tela_peneira():
    n = 64
    y, x = np.mgrid[0:n, 0:n]
    fio = ((x % 8) < 2) | ((y % 8) < 2)
    arr = np.zeros((n, n, 4))
    arr[..., :3] = 235
    arr[..., 3] = np.where(fio, 255, 0)
    return _salvar('tela_peneira', arr, alfa=True)


def tex_grelha_som():
    n = 64
    y, x = np.mgrid[0:n, 0:n].astype(float)
    arr = np.zeros((n, n, 3)) + 62
    # furos em quincôncio (escuros) com borda clara
    for ox, oy in ((0, 0), (8, 8)):
        d = ((x - ox) % 16 - 8) ** 2 + ((y - oy) % 16 - 8) ** 2
        arr[(d < 20) & (d >= 13)] = 84
        arr[d < 13] = 6
    return _salvar('grelha_som', arr)


TEXTURAS = {
    'tecido_n': tex_tecido_n,
    'faixa_letras': tex_faixa_letras,
    'papel_bolinhas': tex_papel_bolinhas,
    'copo_bolinhas': tex_copo_bolinhas,
    'papel_listras': tex_papel_listras,
    'chapeu_listras': tex_chapeu_listras,
    'granulado': tex_granulado,
    'manta_xadrez': tex_manta_xadrez,
    'toalha_listrada': tex_toalha_listrada,
    'folhas_secas': tex_folhas_secas,
    'folhas_monte': tex_folhas_monte,
    'vime': tex_vime,
    'vime_n': tex_vime_n,
    'tela_peneira': tex_tela_peneira,
    'grelha_som': tex_grelha_som,
}
