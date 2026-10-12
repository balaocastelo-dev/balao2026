"""Cascas de tronco (tipo "casca"): materiais PBR sem emenda nos dois sentidos.

u dá a volta no tronco e v sobe ao longo dele. Tudo é feito sobre um toro
(ruído espectral periódico, células de Voronoi com cópias periódicas e anéis
com número inteiro de repetições), então a imagem emenda nas bordas.

Cada casca devolve: cor (albedo sRGB), altura em metros (vira o mapa normal),
oclusão (AO) e rugosidade.
"""
import math
import numpy as np
import cv2
from folhagem_nucleo import cor, misturar, suave, ruido_periodico, celulas, normal_de_altura


def desfoque_per(img, sigma):
    """Desfoque gaussiano que respeita a periodicidade."""
    p = int(3 * sigma) + 2
    if img.ndim == 2:
        g = np.pad(img, p, mode='wrap')
    else:
        g = np.pad(img, ((p, p), (p, p), (0, 0)), mode='wrap')
    g = cv2.GaussianBlur(g, (0, 0), sigma)
    return g[p:-p, p:-p]


def oclusao(alt_px, raios=(4, 12, 32), pesos=(0.5, 0.35, 0.25), escala=10.0):
    """AO aproximada pela concavidade em várias escalas (altura em pixels)."""
    ao = np.zeros_like(alt_px)
    for r, w in zip(raios, pesos):
        cav = desfoque_per(alt_px, r) - alt_px
        ao += w * np.clip(cav / escala, 0, 1)
    return np.clip(1 - ao, 0.25, 1).astype(np.float32)


def _grade(n):
    lin, col = np.mgrid[0:n, 0:n].astype(np.float32)
    return lin, col


def _voronoi_per(rng, n, n_pontos, ay=1.0, ax=1.0, desloc=None):
    """Voronoi periódico anisotrópico. ay < 1 estica as células na vertical."""
    pts = np.stack([rng.uniform(0, n, n_pontos), rng.uniform(0, n, n_pontos)], -1)
    lin, col = _grade(n)
    if desloc is not None:
        lin = lin + desloc[0]; col = col + desloc[1]
    lin = np.mod(lin, n); col = np.mod(col, n)
    d, i = celulas(pts * [ay, ax], lin * ay, col * ax, periodo=(n * ay, n * ax), k=2)
    return d, i


def _finalizar(cor_img, alt_m, tamanho_m, n, ao_extra=None, rug=None, forca=1.0, ao_escala_mm=4.0):
    px_m = tamanho_m / n
    alt_px = alt_m / px_m
    nrm = normal_de_altura(alt_px, forca, periodico=True)
    ao = oclusao(alt_px, escala=ao_escala_mm / 1000.0 / px_m)
    if ao_extra is not None:
        ao = ao * ao_extra
    return dict(cor=np.clip(cor_img, 0, 1).astype(np.float32), normal=nrm.astype(np.float32),
                ao=ao, rug=np.clip(rug, 0, 1).astype(np.float32))


# ------------------------------------------------------------------ casca escura (manga, amendoeira, citros)
def casca_escura(rng, n=1024, tamanho_m=0.6):
    """Casca cinza-marrom escura, áspera, com fissuras verticais e placas que soltam."""
    px = tamanho_m / n
    # deformação das coordenadas (fissuras sinuosas)
    wy = ruido_periodico(rng, n, n, 2.2, fmin=2, fmax=24) * 6
    wx = ruido_periodico(rng, n, n, 2.2, fmin=2, fmax=24, aniso=(2.5, 1.0)) * 11
    d, idx = _voronoi_per(rng, n, 110, ay=0.17, ax=1.0, desloc=(wy, wx))
    borda = (d[..., 1] - d[..., 0]) * 0.5                     # distância (escala anisotrópica) até a fissura
    # fissura: largura variável ao longo
    larg = 5.0 + 3.5 * ruido_periodico(rng, n, n, 2.0, fmin=2, fmax=30, aniso=(3.0, 1.0))
    larg = np.clip(larg, 1.5, 12)
    fissura = suave(larg, 0.0, borda)                          # 1 no fundo da fissura
    # placas: altura própria, levemente abauladas, com escamas finas
    rnd = rng.uniform(0, 1, idx.max() + 1).astype(np.float32)
    placa_h = rnd[idx[..., 0]]
    abaulado = np.clip(borda / 40.0, 0, 1) ** 0.5
    fibras = ruido_periodico(rng, n, n, 1.6, fmin=4, fmax=200, aniso=(8.0, 1.0))
    granulo = ruido_periodico(rng, n, n, 1.2, fmin=20, fmax=400)
    # escamas soltas: sub-células pequenas dentro das placas
    d2, idx2 = _voronoi_per(rng, n, 700, ay=0.40, ax=1.0, desloc=(wy * 0.5, wx * 0.5))
    b2 = (d2[..., 1] - d2[..., 0]) * 0.5
    rnd2 = rng.uniform(0, 1, idx2.max() + 1).astype(np.float32)
    escama = rnd2[idx2[..., 0]]
    racha = suave(2.0, 0.0, b2) * (escama > 0.35)
    alt = (0.006 * abaulado + 0.003 * placa_h + 0.0012 * escama * suave(0, 6, b2)
           + 0.0008 * fibras + 0.0003 * granulo - 0.012 * fissura - 0.0015 * racha)
    # cor
    base = cor('#554b42')
    c = np.broadcast_to(base, (n, n, 3)).astype(np.float32).copy()
    c = c * (1 + 0.10 * (placa_h - 0.5)[..., None] + 0.06 * fibras[..., None] + 0.04 * granulo[..., None])
    cinza = suave(0.2, 1.4, ruido_periodico(rng, n, n, 2.4, fmin=2, fmax=40))
    c = misturar(c, cor('#706a65'), cinza * 0.5)                              # superfície intemperizada
    liquen = suave(1.0, 2.0, ruido_periodico(rng, n, n, 2.2, fmin=3, fmax=60)) * (1 - fissura)
    c = misturar(c, cor('#8a8f72'), liquen * 0.35)
    c = misturar(c, cor('#6e5040'), (escama > 0.8) * suave(0, 4, b2) * 0.35 * (1 - fissura))   # escama recém-solta
    c = misturar(c, cor('#2e2620'), fissura * 0.7)
    c = misturar(c, cor('#5a3a2a'), fissura * suave(0.5, 1.5, ruido_periodico(rng, n, n, 2.0, fmin=3, fmax=40)) * 0.5)
    c = c * (1 - 0.15 * racha)[..., None]
    rug = 0.88 + 0.06 * fissura - 0.04 * liquen + 0.02 * granulo
    return _finalizar(c, alt, tamanho_m, n, rug=rug, forca=0.8, ao_escala_mm=5.0)


# ------------------------------------------------------------------ coqueiro
def casca_coqueiro(rng, n=1024, tamanho_m=0.5):
    """Estipe do coqueiro: cinza-marrom com anéis de cicatriz de folha a cada 6-10 cm e fibras verticais."""
    lin, col = _grade(n)
    u = col / n
    v = 1 - lin / n
    n_aneis = 6
    centros = (np.arange(n_aneis) + rng.uniform(-0.18, 0.18, n_aneis)) / n_aneis
    alt = np.zeros((n, n), np.float32)
    cicatriz = np.zeros((n, n), np.float32)
    borda_sup = np.zeros((n, n), np.float32)
    for k, c0 in enumerate(centros):
        # anel ondulado (número inteiro de ondas na volta, para emendar)
        ond = (0.006 * np.sin(2 * math.pi * (u * rng.integers(1, 3) + rng.uniform(0, 1)))
               + 0.003 * np.sin(2 * math.pi * (u * rng.integers(3, 6) + rng.uniform(0, 1))))
        esp = rng.uniform(0.010, 0.016) * (1 + 0.25 * np.sin(2 * math.pi * (u * 2 + rng.uniform(0, 1))))
        dv = (v - c0 - ond + 0.5) % 1.0 - 0.5                 # distância periódica em v
        faixa = suave(esp, esp * 0.4, np.abs(dv))
        cicatriz = np.maximum(cicatriz, faixa)
        # lábio de cima saliente e degrau
        labio = np.exp(-((dv - esp * 1.1) / (esp * 0.5)) ** 2)
        borda_sup = np.maximum(borda_sup, labio)
        alt += -0.0022 * faixa + 0.0016 * labio
    fibras = ruido_periodico(rng, n, n, 1.5, fmin=6, fmax=300, aniso=(16.0, 1.0))
    fibras_g = ruido_periodico(rng, n, n, 2.0, fmin=2, fmax=60, aniso=(6.0, 1.0))
    # rachaduras verticais finas
    rach_f = ruido_periodico(rng, n, n, 1.8, fmin=6, fmax=120, aniso=(12.0, 1.0))
    racha = suave(0.25, 0.0, np.abs(rach_f)) * suave(0.8, 1.6, ruido_periodico(rng, n, n, 2.0, fmin=2, fmax=20, aniso=(3.0, 1.0)))
    alt += 0.00025 * fibras + 0.0006 * fibras_g - 0.0010 * racha
    base = cor('#7a7166')
    c = np.broadcast_to(base, (n, n, 3)).astype(np.float32).copy()
    c = c * (1 + 0.035 * fibras[..., None] + 0.05 * fibras_g[..., None])
    manchas = ruido_periodico(rng, n, n, 2.6, fmin=2, fmax=30)
    c = misturar(c, cor('#5e5044'), suave(0.3, 1.6, manchas) * 0.5)       # partes mais marrons
    c = misturar(c, cor('#9a958a'), suave(0.4, 1.8, -manchas) * 0.35)     # partes desbotadas
    c = misturar(c, cor('#4a3f36'), cicatriz * 0.55)
    c = misturar(c, cor('#8a8276'), borda_sup * 0.3)
    c = c * (1 - 0.35 * racha)[..., None]
    rug = 0.86 + 0.06 * cicatriz + 0.03 * fibras
    return _finalizar(c, alt, tamanho_m, n, rug=rug, forca=0.8, ao_escala_mm=3.0)


# ------------------------------------------------------------------ cascas lisas que descamam
def _descamada(rng, n, tamanho_m, cores, n_camadas, tam_mancha, alongar, rug_base, espessura=0.0007, borda_clara=0.25):
    """Casca lisa que solta em placas finas: várias camadas recortadas por ruído periódico."""
    lin, col = _grade(n)
    c = np.broadcast_to(cores[0], (n, n, 3)).astype(np.float32).copy()
    alt = np.zeros((n, n), np.float32)
    fino = ruido_periodico(rng, n, n, 1.4, fmin=20, fmax=400)
    var = ruido_periodico(rng, n, n, 2.4, fmin=2, fmax=40)
    c = c * (1 + 0.05 * var[..., None] + 0.012 * fino[..., None])
    nivel = 0.0
    for k in range(1, n_camadas + 1):
        fmax = n / tam_mancha
        campo = ruido_periodico(rng, n, n, 3.0, fmin=max(1, fmax / 6), fmax=fmax, aniso=(alongar, 1.0))
        campo += 0.18 * ruido_periodico(rng, n, n, 1.8, fmin=fmax, fmax=fmax * 6)
        limiar = rng.uniform(-0.2, 0.5)
        cobre = suave(limiar - 0.03, limiar + 0.03, campo)
        nivel += espessura
        ck = cores[k % len(cores)]
        tom = ck[None, None, :] * (1 + 0.06 * ruido_periodico(rng, n, n, 2.2, fmin=2, fmax=50)[..., None])
        c = misturar(c, tom, cobre)
        # borda da placa: aresta levemente clara (enrolada) e sombra fina por baixo
        aresta = suave(0.06, 0.0, np.abs(campo - limiar))
        c = misturar(c, c * 0.62, aresta * (campo < limiar) * 0.6)
        c = misturar(c, np.minimum(c * 1.25 + 0.03, 1), aresta * (campo >= limiar) * borda_clara)
        alt = alt * (1 - cobre) + (alt + espessura) * cobre
    alt += 0.00004 * fino + 0.0003 * var
    rug = rug_base + 0.05 * var
    return c, alt, rug


def casca_goiaba(rng, n=1024, tamanho_m=0.5):
    """Goiabeira: tronco liso que descasca em placas finas (bege, cinza-esverdeado e marrom-acobreado)."""
    cores = [cor('#b49c7c'), cor('#8e5c3c'), cor('#9a9a84'), cor('#7a4a30'), cor('#c2ae8c'), cor('#a06a46')]
    c, alt, rug = _descamada(rng, n, tamanho_m, cores, 6, tam_mancha=170, alongar=1.8, rug_base=0.62)
    return _finalizar(c, alt, tamanho_m, n, rug=rug, forca=1.0, ao_escala_mm=0.8)


def casca_jabuticaba(rng, n=1024, tamanho_m=0.5):
    """Jabuticabeira: lisa, manchada de bege, cinza e marrom claro (parece camuflagem), soltando lascas."""
    cores = [cor('#c4b49c'), cor('#9a9288'), cor('#a88a6a'), cor('#d2c4ac'), cor('#7e6650'), cor('#b0a690')]
    c, alt, rug = _descamada(rng, n, tamanho_m, cores, 7, tam_mancha=110, alongar=1.4, rug_base=0.6,
                             espessura=0.0005, borda_clara=0.2)
    return _finalizar(c, alt, tamanho_m, n, rug=rug, forca=1.0, ao_escala_mm=0.6)


# ------------------------------------------------------------------ cana (dracena)
def cana(rng, n=1024, tamanho_m=0.3):
    """Caule de dracena/cana: verde-amarronzado com cicatrizes de folha em anéis bem próximos."""
    lin, col = _grade(n)
    u = col / n
    v = 1 - lin / n
    n_aneis = 18
    alt = np.zeros((n, n), np.float32)
    anel_m = np.zeros((n, n), np.float32)
    for k in range(n_aneis):
        c0 = (k + rng.uniform(-0.2, 0.2)) / n_aneis
        ond = 0.004 * np.sin(2 * math.pi * (u * rng.integers(1, 3) + rng.uniform(0, 1)))
        # cicatriz: meia-lua que não dá a volta inteira com a mesma força
        forca_a = 0.6 + 0.4 * np.sin(2 * math.pi * (u + rng.uniform(0, 1))) ** 2
        dv = (v - c0 - ond + 0.5) % 1.0 - 0.5
        esp = 0.0040
        crista = np.exp(-((dv + esp * 0.8) / (esp * 1.1)) ** 2) * forca_a      # anel saliente
        vinco = np.exp(-((dv - esp * 0.6) / (esp * 0.35)) ** 2) * forca_a      # vinco fino logo acima
        anel_m = np.maximum(anel_m, crista)
        vinco_m = vinco if k == 0 else np.maximum(vinco_m, vinco)
        alt += 0.0005 * crista - 0.0003 * vinco
    estrias = ruido_periodico(rng, n, n, 1.6, fmin=8, fmax=300, aniso=(12.0, 1.0))
    mancha = ruido_periodico(rng, n, n, 2.5, fmin=2, fmax=30)
    alt += 0.00008 * estrias
    c = np.broadcast_to(cor('#6c6a48'), (n, n, 3)).astype(np.float32).copy()
    c = misturar(c, cor('#5e6a3a'), suave(-0.5, 1.5, mancha) * 0.6)       # partes mais verdes
    c = misturar(c, cor('#7a6a52'), suave(-0.5, 1.5, -mancha) * 0.5)      # partes amarronzadas
    c = c * (1 + 0.03 * estrias[..., None])
    c = misturar(c, cor('#8a8466'), anel_m * 0.45)
    c = misturar(c, cor('#3e3828'), vinco_m * 0.7)
    rug = 0.72 + 0.1 * anel_m + 0.03 * estrias
    return _finalizar(c, alt, tamanho_m, n, rug=rug, forca=1.0, ao_escala_mm=0.8)
