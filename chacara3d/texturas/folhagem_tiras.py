"""Folhas em tira (tipo "tira"): a folha desenrolada num retângulo.

u atravessa a folha (u = 0 margem esquerda, u = 0,5 nervura central, u = 1
margem direita) e v vai da base (v = 0, embaixo) à ponta (v = 1, em cima). O
contorno é dado pela geometria; aqui a imagem inteira é superfície de folha,
só com recortes onde a folha real tem rasgos, dentes ou vãos.

Para as nervuras ficarem no ângulo certo depois de montadas, o desenho é
feito em coordenadas físicas: supõe-se a forma da tira usada no modelo
(paddle, strap, lance ou heart, as mesmas de plants.paddle) e a razão
largura/comprimento típica da espécie.
"""
import math
import dataclasses
import numpy as np
import cv2
from folhagem_nucleo import (cor, misturar, suave, ruido_fractal, linha_fase, borda_suave, variar_cor)
from folhagem_folha import Especie, Lobo, pintar_superficie

FORMAS = {
    'paddle': lambda t: np.sin(math.pi * np.clip(t, 0, 1) ** 0.75) ** 0.55,
    'strap': lambda t: np.sqrt(np.clip(1 - np.clip(t, 0, 1) ** 2.2, 0, 1)) * np.minimum(1.0, 0.35 + np.clip(t, 0, 1) * 5),
    'heart': lambda t: np.sin(math.pi * np.clip(t, 0, 1) ** 0.45) ** 0.7,
    'lance': lambda t: np.sin(math.pi * np.clip(t, 0, 1)) ** 0.8,
}


class Tira:
    """Grade da tira com as coordenadas físicas de cada pixel."""

    def __init__(self, w, h, forma, razao, piso=0.3):
        self.w, self.h, self.forma, self.razao = w, h, forma, razao
        lin, col = np.mgrid[0:h, 0:w].astype(np.float32)
        self.u = (col + 0.5) / w
        self.v = 1.0 - (lin + 0.5) / h
        f = FORMAS[forma]
        self.perfil = lambda sk: (0.5 * razao * np.maximum(f(sk), piso)).astype(np.float32)
        self.meia = self.perfil(self.v)
        self.S = self.v
        self.X = (self.u - 0.5) * 2 * self.meia
        self.Pu = w / (2 * self.meia)
        self.Pv = float(h)

    def pintar(self, esp, rng, paleta=None, idade=0.3, extras=None):
        lobo = dataclasses.replace(esp.lobos[0], perfil=self.perfil, comp=1.0, angulo=0.0)
        e2 = dataclasses.replace(esp, lobos=[lobo], peciolo=(0.0, 0.0), asa=0.0)
        return pintar_superficie(self.S, self.X, e2, rng, self.Pv, paleta=paleta, idade=idade, extras=extras,
                                 recortar=False, escala=(self.Pu, self.Pv))

    def normal(self, alt, forca=1.0):
        """Normal OpenGL (y para o topo) a partir da altura em unidades de folha."""
        gl, gc = np.gradient(alt)
        dhdx = gc * self.Pu          # por unidade de folha, na largura
        dhds = -gl * self.Pv         # por unidade de folha, para cima
        n = np.stack([-dhdx * forca, -dhds * forca, np.ones_like(alt)], -1)
        return n / np.linalg.norm(n, axis=-1, keepdims=True)


def _rasgos(t, fase, n, rng, s_lim=(0.12, 0.9), prof=(0.3, 0.95), boca=(3.0, 14.0), lado=None):
    """Rasgos de vento ao longo das nervuras laterais, da margem para a nervura central.

    Devolve (alfa, borda) — borda é a faixa junto ao rasgo (para secar).
    """
    alfa = np.ones_like(t.u)
    borda = np.zeros_like(t.u)
    gr, gc = np.gradient(fase)
    gpx = np.sqrt(gr * gr + gc * gc) + 1e-6
    rel = np.abs(t.u - 0.5) * 2
    for _ in range(n):
        s0 = rng.uniform(*s_lim)
        sg = lado if lado is not None else rng.choice([-1, 1])
        lin = int((1 - s0) * t.h)
        col = int(t.w * (0.5 + sg * 0.45))
        k = np.round(fase[np.clip(lin, 0, t.h - 1), np.clip(col, 0, t.w - 1)])
        p = rng.uniform(*prof)
        larg_boca = rng.uniform(*boca)
        d = np.abs(fase - k) / gpx                                        # px até a nervura do rasgo
        lado_ok = (np.sign(t.u - 0.5) == sg)
        ao_longo = np.clip((rel - (1 - p)) / p, 0, 1)                    # 0 no fim do rasgo, 1 na margem
        abertura = larg_boca * ao_longo ** 1.6 + 0.35
        corte = suave(abertura - 0.5, abertura + 0.5, d)
        corte = np.where(lado_ok & (rel > 1 - p), corte, 1.0)
        alfa = alfa * corte
        borda = np.maximum(borda, (lado_ok & (rel > 1 - p)) * suave(abertura + 6, abertura + 0.5, d))
    return alfa, borda


def _acabar(r, alfa=None):
    rgb = r['sup']
    a = np.ones(rgb.shape[:2], np.float32) if alfa is None else alfa.astype(np.float32)
    return rgb, a


# ------------------------------------------------------------------ bananeira
BANANA = Especie(
    'banana', [Lobo(nerv_n=120, nerv_ang=76, nerv_curva=0.08)],
    larg_central=0.0072, larg_lat=0.00045, terciarias=0.0,
    relevo_central=0.004, relevo_lat=-0.00025,
    paleta=dict(sup=cor('#4a7d2a'), inf=cor('#7f9a6a'), nervura=cor('#b5c08a'), lat=0.55, central=0.95,
                margem=-0.04, variacao=0.08, desigual=1.3, seco=cor('#8a7448'), halo=cor('#a8a648')))


def tira_banana(rng):
    t = Tira(1024, 2048, 'paddle', 0.30)
    r = t.pintar(BANANA, rng, idade=0.6, extras=dict(manchas=0.0, borda_seca=0.0, ponta_seca=0.0))
    rgb = r['sup']
    fase = r['fase_lat']
    # estrias de sigatoka: riscos marrons alongados na direção das nervuras, mais perto das margens
    gr, gc = np.gradient(fase)
    norma = np.sqrt(gr * gr + gc * gc) + 1e-6
    for _ in range(int(rng.integers(14, 24))):
        s0 = rng.uniform(0.15, 0.92)
        u0 = 0.5 + rng.choice([-1, 1]) * rng.uniform(0.12, 0.47)
        lin, col = int((1 - s0) * t.h), int(u0 * t.w)
        dlin = (np.arange(t.h)[:, None] - lin).astype(np.float32)
        dcol = (np.arange(t.w)[None, :] - col).astype(np.float32)
        ny, nx = gr[lin, col] / norma[lin, col], gc[lin, col] / norma[lin, col]
        ao_longo = dcol * ny - dlin * nx
        trans = dcol * nx + dlin * ny
        comp, larg = rng.uniform(12, 45), rng.uniform(1.2, 3.0)
        d = np.sqrt((ao_longo / comp) ** 2 + (trans / larg) ** 2)
        rgb = misturar(rgb, cor('#9a9a3a'), suave(2.2, 1.0, d) * 0.35)
        rgb = misturar(rgb, cor('#4a3420'), suave(1.0, 0.6, d) * 0.85)
    # nervuras finas intermediárias (3 entre cada par de principais)
    mf, _ = linha_fase(fase * 4, 0.35)
    fora_central = suave(0.03, 0.05, np.abs(t.u - 0.5))
    rgb = misturar(rgb, rgb * 1.10, mf * 0.35 * fora_central)
    # pregas entre nervuras: faixas levemente mais claras/escuras
    prega = np.sin(2 * math.pi * fase) * fora_central
    rgb = rgb * (1 + 0.035 * prega)[..., None]
    # nervura central: canal mais claro e amarelado com as bordas marcadas
    dc = np.abs(t.u - 0.5) * t.w
    wc = 0.0072 * t.Pu[:, :1] * (1 - 0.7 * t.v[:, :1])
    canal = suave(wc * 0.55, wc * 0.15, dc)
    rgb = misturar(rgb, cor('#c8d098'), canal * 0.35)
    # rasgos de vento
    n_r = int(rng.integers(8, 12))
    a_r, borda_r = _rasgos(t, fase, n_r, rng, prof=(0.35, 1.0), boca=(3.0, 26.0))
    # margens secas e marrons em trechos (a bananeira rasga e seca nas bordas)
    rel = np.abs(t.u - 0.5) * 2
    ruido = ruido_fractal(rng, t.h, t.w, 60, oitavas=4, aniso=(2.0, 1.0))
    trecho = suave(0.2, 0.7, ruido_fractal(rng, t.h, t.w, 300, oitavas=2))
    seco = np.clip(suave(np.minimum(0.93 - 0.04 * np.clip(ruido, -2, 2), 0.975), 0.985, rel) * trecho
                   + borda_r * 0.8 * trecho, 0, 1)
    c_seco = misturar(cor('#8e7a4c'), cor('#6e5a38'), suave(-1, 1, ruido))
    rgb = misturar(rgb, c_seco, seco * 0.9)
    rgb = misturar(rgb, rgb * 0.75, suave(0.4, 0.6, seco) * (1 - suave(0.6, 0.95, seco)) * 0.5)
    # ponta seca/rasgada
    ponta = suave(0.95, 0.99, t.v + 0.01 * ruido)
    rgb = misturar(rgb, c_seco, ponta)
    alfa = a_r
    # pequenos cortes na margem (ponta rasgada)
    alfa = alfa * (1 - suave(0.985, 0.995, t.v) * suave(0.2, 0.6, ruido_fractal(rng, t.h, t.w, 20, oitavas=2)))
    # relevo: central saliente, pregas
    alt = r['alt'] + 0.0006 * prega
    n = t.normal(alt, forca=0.7)
    return np.clip(rgb, 0, 1), alfa, n


# ------------------------------------------------------------------ helicônia / estrelítzia
TROP_LARGA = Especie(
    'tropical_larga', [Lobo(nerv_n=70, nerv_ang=60, nerv_curva=0.15)],
    larg_central=0.0060, larg_lat=0.0006, terciarias=0.0,
    relevo_central=0.003, relevo_lat=-0.0003,
    paleta=dict(sup=cor('#2f5622'), inf=cor('#6a8458'), nervura=cor('#a6b47a'), lat=0.40, central=0.9,
                margem=-0.05, variacao=0.07))


def tira_tropical_larga(rng):
    t = Tira(512, 1024, 'paddle', 0.30)
    r = t.pintar(TROP_LARGA, rng, idade=0.4, extras=dict(manchas=0.0, borda_seca=0.0, ponta_seca=0.0))
    rgb = r['sup']
    fase = r['fase_lat']
    mf, _ = linha_fase(fase * 3, 0.3)
    fora = suave(0.03, 0.05, np.abs(t.u - 0.5))
    rgb = misturar(rgb, rgb * 1.08, mf * 0.3 * fora)
    prega = np.sin(2 * math.pi * fase) * fora
    rgb = rgb * (1 + 0.02 * prega)[..., None]
    a_r, borda_r = _rasgos(t, fase, 3, rng, prof=(0.08, 0.3), boca=(1.5, 5.0), s_lim=(0.3, 0.85))
    rgb = misturar(rgb, cor('#7a6a40'), borda_r * 0.5)
    n = t.normal(r['alt'] + 0.0003 * prega, forca=0.8)
    return np.clip(rgb, 0, 1), a_r, n


# ------------------------------------------------------------------ alpínia / xanadu
TROPICAL = Especie(
    'tropical', [Lobo(nerv_n=16, nerv_ang=48, nerv_curva=1.3)],
    larg_central=0.0065, larg_lat=0.0018, terciarias=0.35,
    relevo_central=0.0025, relevo_lat=-0.0007, bulado=0.0003,
    paleta=dict(sup=cor('#3f6c2a'), inf=cor('#6f8a50'), nervura=cor('#8aa65a'), lat=0.35, central=0.75,
                margem=-0.05))


def tira_tropical(rng):
    t = Tira(512, 1024, 'paddle', 0.32)
    r = t.pintar(TROPICAL, rng, idade=0.4, extras=dict(manchas=0.0, borda_seca=0.0, ponta_seca=0.0))
    rgb, alfa = _acabar(r)
    return np.clip(rgb, 0, 1), alfa, t.normal(r['alt'], forca=0.8)


# ------------------------------------------------------------------ dracena
DRACENA = Especie(
    'dracena', [Lobo(nerv_n=0)], larg_central=0.0012, larg_lat=0.0008, terciarias=0.0,
    relevo_central=0.0006, relevo_lat=-0.0002, paralelas=(46, 0.45),
    paleta=dict(sup=cor('#2f5a22'), inf=cor('#4f7a38'), nervura=cor('#5c8a3a'), lat=0.3, central=0.3,
                margem=-0.12, variacao=0.05, desigual=0.4))


def tira_dracena(rng):
    t = Tira(512, 1024, 'strap', 0.14)
    r = t.pintar(DRACENA, rng, idade=0.25, extras=dict(manchas=0.0, borda_seca=0.0, ponta_seca=0.0))
    rgb = r['sup']
    # faixa central amarelo-esverdeada com bordas em estrias ao longo da folha
    estria = ruido_fractal(rng, t.h, t.w, 40, oitavas=3, aniso=(6.0, 0.25))
    larg = 0.15 + 0.025 * np.sin(t.v * 6 + 1.3) + 0.02 * estria
    faixa = suave(larg + 0.025, larg - 0.025, np.abs(t.u - 0.5)) * suave(0.0, 0.06, t.v)
    listra_fina = suave(0.4, 1.0, estria) * suave(larg + 0.10, larg + 0.02, np.abs(t.u - 0.5)) * (1 - faixa)
    amarelo = misturar(cor('#8fa23e'), cor('#a8b04c'), suave(-1, 1, estria))
    rgb = misturar(rgb, amarelo, faixa * 0.9)
    rgb = misturar(rgb, cor('#6a8a34'), listra_fina * 0.45)
    # base mais clara (bainha) e ponta seca
    rgb = misturar(rgb, cor('#9aa070'), suave(0.06, 0.0, t.v) * 0.6)
    n = t.normal(r['alt'], forca=0.6)
    return np.clip(rgb, 0, 1), np.ones_like(t.u), n


# ------------------------------------------------------------------ ráfis
RAFIS = Especie(
    'rafis', [Lobo(nerv_n=0)], larg_central=0.0018, larg_lat=0.0010, terciarias=0.0,
    relevo_central=0.0015, relevo_lat=0.0004, paralelas=(26, 0.35),
    paleta=dict(sup=cor('#22421b'), inf=cor('#3e5e2c'), nervura=cor('#3f6a2c'), lat=0.35, central=0.45,
                margem=-0.05, variacao=0.06))


def tira_rafis(rng):
    t = Tira(512, 1024, 'strap', 0.18)
    r = t.pintar(RAFIS, rng, idade=0.4, extras=dict(manchas=0.0, borda_seca=0.0, ponta_seca=0.0))
    rgb = r['sup']
    # dobras (plissado) do segmento: algumas costelas fortes
    fase = (t.u - 0.5) * 2 * 2.5
    costela, dcost = linha_fase(fase, 1.2)
    rgb = misturar(rgb, rgb * 1.25, costela * 0.5)
    vale = np.cos(math.pi * 2 * fase)
    rgb = rgb * (1 + 0.04 * vale)[..., None]
    # ponta truncada e dentada
    dentes = np.abs(np.mod(t.u * 9 + 0.3 * ruido_fractal(rng, t.h, t.w, 30, oitavas=2), 1.0) - 0.5) * 2
    limite = 0.975 - 0.02 * dentes
    alfa = suave(limite + 1.0 / t.h, limite - 1.0 / t.h, t.v)
    rgb = misturar(rgb, cor('#7a6a44'), suave(limite - 0.03, limite, t.v) * 0.6)
    alt = r['alt'] + 0.0012 * vale
    return np.clip(rgb, 0, 1), alfa, t.normal(alt, forca=0.6)


# ------------------------------------------------------------------ capim / moreia
CAPIM = Especie(
    'capim', [Lobo(nerv_n=0)], larg_central=0.0004, larg_lat=0.0003, terciarias=0.0,
    relevo_central=0.0002, relevo_lat=-0.0001, paralelas=(16, 0.45),
    paleta=dict(sup=cor('#4d7040'), inf=cor('#6a8a5c'), nervura=cor('#6e9050'), lat=0.4, central=0.5,
                margem=-0.08, variacao=0.05, desigual=0.5, amarelado=cor('#7a8a48')))


def _base_e_ponta(t, rgb, rng, c_base, c_ponta, ponta=0.95):
    rgb = misturar(rgb, rgb * c_base, suave(0.22, 0.0, t.v))
    rgb = misturar(rgb, c_ponta, 0.7 * suave(ponta, 1.0, t.v + 0.012 * np.clip(ruido_fractal(rng, t.h, t.w, 30, oitavas=2), -2, 2)))
    return rgb


def tira_capim(rng):
    t = Tira(512, 1024, 'strap', 0.04, piso=0.5)
    r = t.pintar(CAPIM, rng, idade=0.3, extras=dict(manchas=0.0, borda_seca=0.0, ponta_seca=0.0))
    rgb = r['sup']
    cinza = ruido_fractal(rng, t.h, t.w, 60, oitavas=3, aniso=(8.0, 0.5))
    rgb = misturar(rgb, cor('#647e66'), suave(-1.0, 1.5, cinza) * 0.35)
    rgb = _base_e_ponta(t, rgb, rng, np.array([0.70, 0.66, 0.55], np.float32), cor('#a09a62'))
    return np.clip(rgb, 0, 1), np.ones_like(t.u), None


GRAMA_PRETA = Especie(
    'grama_preta', [Lobo(nerv_n=0)], larg_central=0.0005, larg_lat=0.0003, terciarias=0.0,
    paralelas=(10, 0.4),
    paleta=dict(sup=cor('#1a2516'), inf=cor('#2c3a24'), nervura=cor('#2c3e24'), lat=0.5, central=0.6,
                margem=-0.08, variacao=0.06, amarelado=cor('#262e18')))


def tira_grama_preta(rng):
    t = Tira(512, 1024, 'strap', 0.06, piso=0.5)
    r = t.pintar(GRAMA_PRETA, rng, idade=0.2, extras=dict(manchas=0.0, borda_seca=0.0, ponta_seca=0.0))
    rgb = _base_e_ponta(t, r['sup'], rng, np.array([0.8, 0.75, 0.7], np.float32), cor('#4a4a30'), ponta=0.965)
    return np.clip(rgb, 0, 1), np.ones_like(t.u), None


# ------------------------------------------------------------------ verde-limão (pacová, manjericão, asplênio)
LIMA = Especie(
    'lima', [Lobo(nerv_n=14, nerv_ang=55, nerv_curva=0.8)],
    larg_central=0.0055, larg_lat=0.0016, terciarias=0.3,
    relevo_central=0.002, relevo_lat=-0.0006,
    paleta=dict(sup=cor('#6c9a30'), inf=cor('#90ae5c'), nervura=cor('#b0c870'), lat=0.35, central=0.8,
                margem=-0.06, variacao=0.06, amarelado=cor('#8cac38')))


def tira_lima(rng):
    t = Tira(512, 1024, 'lance', 0.20)
    r = t.pintar(LIMA, rng, idade=0.25, extras=dict(manchas=0.0, borda_seca=0.0, ponta_seca=0.0))
    rgb, alfa = _acabar(r)
    return np.clip(rgb, 0, 1), alfa, t.normal(r['alt'], forca=0.8)


# ------------------------------------------------------------------ bromélia
BROMELIA = Especie(
    'bromelia', [Lobo(nerv_n=0)], larg_central=0.001, larg_lat=0.0006, terciarias=0.0,
    relevo_central=0.0006, paralelas=(22, 0.3),
    paleta=dict(sup=cor('#3f6a2c'), inf=cor('#5f7f48'), nervura=cor('#55803a'), lat=0.3, central=0.3,
                margem=-0.06, variacao=0.06))


def tira_bromelia(rng):
    t = Tira(512, 1024, 'strap', 0.20)
    r = t.pintar(BROMELIA, rng, idade=0.3, extras=dict(manchas=0.0, borda_seca=0.0, ponta_seca=0.0))
    rgb = r['sup']
    # faixas transversais prateadas, irregulares
    ond = ruido_fractal(rng, t.h, t.w, 80, oitavas=3, aniso=(0.5, 2.0))
    fase = t.v * 26 + 0.25 * ond + 0.08 * np.sin(t.u * 9)
    banda = np.clip(np.sin(2 * math.pi * fase) * 0.5 + 0.5, 0, 1) ** 3
    banda = banda * suave(0.08, 0.2, t.v) * suave(0.95, 0.8, t.v) * (0.6 + 0.4 * suave(-1, 1, ond))
    rgb = misturar(rgb, cor('#93a48c'), banda * 0.32)
    # base mais clara (bainha) avermelhada
    rgb = misturar(rgb, cor('#a8a070'), suave(0.10, 0.0, t.v) * 0.6)
    # espinhos miúdos na margem: dentes recortados
    passo = 22.0
    serra = np.mod((1 - t.v) * t.h / passo, 1.0)
    prof = 7.0 * (1 - serra) ** 1.5
    dist_margem = np.minimum(t.u, 1 - t.u) * t.w
    alfa = suave(prof - 0.6, prof + 0.6, dist_margem)
    ponta_esp = suave(prof + 3, prof, dist_margem) * suave(0.85, 1.0, 1 - serra)
    rgb = misturar(rgb, cor('#5a4630'), ponta_esp * 0.7)
    return np.clip(rgb, 0, 1), alfa, None


# ------------------------------------------------------------------ samambaia
def tira_samambaia(rng):
    """Fronde de samambaia (Nephrolepis): ráquis no meio, folíolos dos dois lados; o resto é vão."""
    t = Tira(512, 1024, 'lance', 0.11, piso=0.25)
    S, X = t.S, t.X
    hw_rq = 0.0022
    D = (hw_rq * (1.25 - 0.5 * S)) - np.abs(X)
    cor_img = np.zeros(S.shape + (3,), np.float32)
    rgb_rq = cor('#5d6a34')
    dono = np.full(S.shape, -1, np.int32)
    passo = 0.0165
    folios = []
    s = 0.03
    i = 0
    while s < 0.985:
        for sg in (1, -1):
            s_i = s + (passo * 0.5 if sg < 0 else 0) + rng.normal(0, passo * 0.06)
            if s_i > 0.985:
                continue
            folios.append((s_i, sg, i))
            i += 1
        s += passo
    pinas = []
    for (s_i, sg, k) in folios:
        ang = math.radians(rng.uniform(68, 78))
        hw_i = float(t.perfil(np.array([s_i]))[0])
        Lp = hw_i * rng.uniform(0.93, 1.0) / math.sin(ang)
        w0 = min(0.0060, 0.32 * Lp) * rng.uniform(0.9, 1.1)
        # janela de linhas
        ext = Lp * math.cos(ang) + w0 * 2 + 0.01
        r0 = max(0, int((1 - (s_i + ext)) * t.h)); r1 = min(t.h, int((1 - (s_i - w0 * 2)) * t.h) + 2)
        if r1 <= r0:
            continue
        Sj, Xj = S[r0:r1], X[r0:r1]
        tt = (Sj - s_i) * math.cos(ang) + Xj * sg * math.sin(ang)
        nn = -(Sj - s_i) * math.sin(ang) + Xj * sg * math.cos(ang)
        q = np.clip(tt / Lp, 0, 1)
        nn = nn + 0.06 * Lp * q * q                      # folíolo curvado para a ponta da fronde
        forma = (np.clip(q, 1e-4, 1) ** 0.18) * (np.clip(1 - q, 0, 1) ** 0.75) / 0.70
        auricula = 1 + 0.25 * np.exp(-((q - 0.06) / 0.05) ** 2) * (nn > 0)
        crenado = 1 - 0.08 * np.abs(np.sin(q * Lp / 0.0035 * math.pi))
        larg = w0 * forma * auricula * crenado
        Di = np.where((tt > -0.002) & (tt < Lp), larg - np.abs(nn), -1.0)
        melhor = Di > D[r0:r1]
        D[r0:r1] = np.maximum(D[r0:r1], Di)
        dono[r0:r1] = np.where(melhor, k, dono[r0:r1])
        pinas.append((k, s_i, sg, ang, Lp, w0, r0, r1))
    # cores dos folíolos (os da base mais velhos/amarelados)
    mancha = ruido_fractal(rng, t.h, t.w, 60, oitavas=3)
    base_c = cor('#3f6c2a')
    for (k, s_i, sg, ang, Lp, w0, r0, r1) in pinas:
        c = variar_cor(base_c, rng, 5, 0.1, 0.10)
        if s_i < 0.15 and rng.random() < 0.5:
            c = misturar(c, cor('#8a8a40'), rng.uniform(0.3, 0.8))
        if rng.random() < 0.015:
            c = misturar(c, cor('#8a7040'), 0.6)
        sel = dono[r0:r1] == k
        Sj, Xj = S[r0:r1], X[r0:r1]
        tt = (Sj - s_i) * math.cos(ang) + Xj * sg * math.sin(ang)
        nn = -(Sj - s_i) * math.sin(ang) + Xj * sg * math.cos(ang) + 0.06 * Lp * np.clip(tt / Lp, 0, 1) ** 2
        nerv = suave(0.00045, 0.0002, np.abs(nn)) * (tt > 0) * (tt < Lp * 0.9)
        cc = c[None, None, :] * (1 + 0.06 * mancha[r0:r1, :, None])
        cc = misturar(cc, cc * 1.25 + 0.03, nerv * 0.6)
        ponta = suave(0.85, 1.0, tt / Lp) * (rng.random() < 0.15)
        cc = misturar(cc, cor('#7a6a3a'), ponta)
        cor_img[r0:r1] = np.where(sel[..., None], cc, cor_img[r0:r1])
    rq = dono == -1
    cor_img[rq] = rgb_rq * 1.0
    alfa = borda_suave(D)
    return np.clip(cor_img, 0, 1), alfa, None


# ------------------------------------------------------------------ taioba roxa
TAIOBA = Especie(
    'taioba_roxa', [Lobo(nerv_n=9, nerv_ang=55, nerv_curva=1.1)],
    larg_central=0.006, larg_lat=0.0022, terciarias=0.4,
    relevo_central=-0.002, relevo_lat=-0.0012, bulado=0.0006,
    paleta=dict(sup=cor('#2c1a28'), inf=cor('#3e2a38'), nervura=cor('#1a0e18'), lat=0.6, central=0.8,
                margem=0.05, variacao=0.08, amarelado=cor('#3a2030'), ter=0.12, cavidade=0.1,
                mancha=cor('#4a2a2a'), halo=cor('#3a2a2a'), seco=cor('#4a3428')))


def tira_taioba_roxa(rng):
    t = Tira(512, 1024, 'heart', 0.74)
    r = t.pintar(TAIOBA, rng, idade=0.2, extras=dict(manchas=0.0, borda_seca=0.0, ponta_seca=0.0))
    rgb = r['sup']
    # nervuras principais para os lobos da base
    for sg in (-1, 1):
        x0, s0 = 0.0, 0.10
        x1, s1 = sg * 0.33, 0.0
        px_ = (t.X - x0); ps_ = (t.S - s0)
        dx, ds = x1 - x0, s1 - s0
        L2 = dx * dx + ds * ds
        q = np.clip((px_ * dx + ps_ * ds) / L2, 0, 1)
        d = np.hypot((px_ - q * dx) * t.Pu, (ps_ - q * ds) * t.Pv)
        lin = suave(3.0 * (1 - 0.6 * q) + 0.6, 3.0 * (1 - 0.6 * q) - 0.6, d)
        rgb = misturar(rgb, cor('#1a0e18'), lin * 0.8)
    # brilho aveludado (leve)
    vel = ruido_fractal(rng, t.h, t.w, 140, oitavas=3)
    rgb = misturar(rgb, cor('#4a3448'), suave(0.6, 2.0, vel) * 0.25)
    return np.clip(rgb, 0, 1), np.ones_like(t.u), t.normal(r['alt'], forca=0.7)


# ------------------------------------------------------------------ brácteas (flores)
def _bractea(rng, c_base, c_meio, c_borda, c_ponta, larg_borda=0.09):
    t = Tira(512, 1024, 'lance', 0.39)
    est = np.clip(ruido_fractal(rng, t.h, t.w, 50, oitavas=3, aniso=(5.0, 0.4)), -2.5, 2.5)
    larga = np.clip(ruido_fractal(rng, t.h, t.w, 200, oitavas=2), -2.5, 2.5)
    rgb = misturar(c_base, c_meio, suave(0.0, 0.40, t.v + 0.03 * larga))
    rgb = rgb * (1 + 0.012 * est[..., None] + 0.03 * larga[..., None])
    # cera: estrias longitudinais levemente mais claras
    rgb = misturar(rgb, rgb * 1.10 + 0.012, suave(1.2, 2.4, est) * 0.18)
    lb = larg_borda * (1 + 0.25 * np.clip(est, -1, 1))
    borda = suave(lb, lb * 0.25, np.minimum(t.u, 1 - t.u))
    rgb = misturar(rgb, c_borda, borda)
    ponta = suave(0.74, 0.97, t.v + 0.015 * est)
    rgb = misturar(rgb, c_ponta * (1 + 0.04 * est[..., None]), ponta)
    # quilha central levemente marcada
    rgb = rgb * (1 - 0.06 * suave(0.02, 0.0, np.abs(t.u - 0.5)))[..., None]
    return np.clip(rgb, 0, 1), np.ones_like(t.u), None


def tira_flor_vermelha(rng):
    """Bráctea de helicônia (bico-de-papagaio): vermelho cerado, borda e ponta verde-amareladas."""
    return _bractea(rng, cor('#8e0f17'), cor('#c8181e'), cor('#c4c040'), cor('#a8b83c'))


def tira_flor_laranja(rng):
    """Bráctea laranja (alpínia/helicônia): laranja com amarelo nas bordas e na ponta."""
    return _bractea(rng, cor('#c0401a'), cor('#ec6a1c'), cor('#f2b028'), cor('#f0c040'), larg_borda=0.12)
