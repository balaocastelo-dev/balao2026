"""Pintura de UMA folha plana (desenrolada), usada pelos cachos e pelas tiras.

A folha é descrita em "unidades de folha": s vai da base da lâmina (0) à
ponta (1) ao longo da nervura central e x é a distância lateral (assinada,
mesma unidade, x > 0 à esquerda de quem olha da base para a ponta). O
contorno é a união de lobos (folha simples = 1 lobo; cordiforme = lobo
central + 2 lobos basais; maracujá = 3 lobos), mais o pecíolo.

`pintar_superficie` recebe grades S e X (qualquer amostragem: quadrada nos
cachos, esticada nas tiras) e devolve cor da face de cima, cor da face de
baixo, alfa (recortes) e altura (relevo das nervuras, para o mapa normal).
"""
from dataclasses import dataclass, field
import math
import numpy as np
import cv2
from folhagem_nucleo import (cor, misturar, suave, ruido_fractal, celulas, linha_fase, borda_suave, variar_cor)


@dataclass
class Lobo:
    angulo: float = 0.0        # graus em relação à nervura central (0 = o próprio eixo)
    comp: float = 1.0          # comprimento relativo ao da folha
    larg: float = 0.3          # largura máxima / comprimento do lobo
    a: float = 0.8             # expoente da base (1 = cuneada, 0,5 = arredondada)
    b: float = 1.0             # expoente da ponta (>1 acuminada, 0,5 = arredondada)
    serra: tuple = None        # (dentes ao longo do lobo, amplitude relativa à meia-largura)
    ondula: float = 0.0        # ondulação da margem (fração da meia-largura)
    nerv_n: int = 14           # pares de nervuras laterais
    nerv_ang: float = 55.0     # ângulo das laterais com a central (graus)
    nerv_curva: float = 0.6    # quanto as laterais sobem perto da margem
    principal: bool = True     # tem nervura central própria
    cordado: tuple = None      # (quanto a lâmina desce abaixo do pecíolo, abertura do recorte em graus)
    perfil: object = None      # função sk -> meia-largura (substitui a forma a/b; usada nas tiras)


@dataclass
class Especie:
    nome: str
    lobos: list
    peciolo: tuple = (0.08, 0.010)     # (comprimento, meia-largura) em unidades de folha
    asa: float = 0.0                   # meia-largura da asa do pecíolo (citros)
    larg_central: float = 0.008        # meia-largura da nervura central na base
    larg_lat: float = 0.0028           # meia-largura das laterais junto à central
    intramarginal: float = 0.0         # distância da nervura marginal (0 = não tem)
    terciarias: float = 0.5            # intensidade da rede fina
    relevo_central: float = 0.002      # + saliente em cima, - afundada
    relevo_lat: float = -0.0008
    bulado: float = 0.0                # "acolchoado" entre nervuras (goiaba)
    paralelas: tuple = None            # (nervuras longitudinais na largura toda, intensidade) — folhas em fita
    paleta: dict = field(default_factory=dict)


# ------------------------------------------------------------------ contorno
def perfil_lobo(sk, lobo):
    """Meia-largura do lobo (em unidades do lobo) ao longo de sk ∈ [0,1]."""
    if lobo.perfil is not None:
        return lobo.perfil(sk)
    a, b = lobo.a, lobo.b
    m = a / (a + b)
    s = np.clip(sk, 1e-6, 1 - 1e-6)
    f = (s ** a) * ((1 - s) ** b) / ((m ** a) * ((1 - m) ** b))
    f = np.where((sk > 0) & (sk < 1), f, 0.0)
    return 0.5 * lobo.larg * f


def coordenadas_lobo(S, X, lobo):
    th = math.radians(lobo.angulo)
    c, s = math.cos(th), math.sin(th)
    sk = (S * c + X * s) / lobo.comp
    xk = (-S * s + X * c) / lobo.comp
    return sk, xk


def contorno(S, X, esp, rng_fases):
    """Distância assinada aproximada (unidades de folha, + dentro), lobo dono e dados por lobo."""
    D = np.full(S.shape, -1.0, np.float32)
    dono = np.zeros(S.shape, np.int16)
    dados = []
    for k, lobo in enumerate(esp.lobos):
        sk, xk = coordenadas_lobo(S, X, lobo)
        if lobo.cordado:
            prof = lobo.cordado[0]
            hw = perfil_lobo((sk + prof) / (1 + prof), lobo) * (1 + prof)
        else:
            hw = perfil_lobo(sk, lobo)
        if lobo.ondula:
            on = (np.sin(2 * math.pi * (sk * 4.3 + rng_fases[k])) + 0.6 * np.sin(2 * math.pi * (sk * 9.1 + rng_fases[k + 1])))
            hw = hw * (1 + lobo.ondula * on * np.sin(math.pi * np.clip(sk, 0, 1)))
        hw_liso = hw
        if lobo.serra:
            n, amp = lobo.serra
            t = sk * n + rng_fases[k] * 0.3
            dente = np.mod(t, 1.0)
            hw = hw - amp * hw_liso.max() * (1 - dente ** 1.8) * suave(0.0, 0.12, sk) * suave(1.0, 0.9, sk)
        Dk = (hw - np.abs(xk)) * lobo.comp
        if lobo.cordado:
            ab = math.radians(lobo.cordado[1])
            entalhe = (np.abs(xk) - np.maximum(-sk, 0) * math.tan(ab)) * math.cos(ab) * lobo.comp
            Dk = np.where(sk < 0.02, np.minimum(Dk, np.maximum(entalhe, sk * lobo.comp * 0.5 + 0.0)), Dk)
        else:
            Dk = np.where(sk < 0, np.minimum(Dk, sk * lobo.comp), Dk)
        melhor = Dk > D
        dono = np.where(melhor, k, dono)
        D = np.maximum(D, Dk)
        dados.append((sk, xk, hw_liso))
    # pecíolo (e asa)
    comp_p, larg_p = esp.peciolo
    dp = np.minimum(larg_p - np.abs(X), np.minimum(S + comp_p, 0.04 - S))
    if esp.asa > 0:
        t = np.clip((S + comp_p) / comp_p, 0, 1)
        hw_asa = esp.asa * np.clip(t, 0, 1) ** 1.3 * np.clip((1.0 - t) / 0.12, 0, 1) ** 0.5
        da = np.minimum(hw_asa - np.abs(X), np.minimum(S + comp_p * 0.9, 0.02 - S))
        dp = np.maximum(dp, da)
    pec = dp > D
    D = np.maximum(D, dp)
    return D, dono, dados, pec


# ------------------------------------------------------------------ superfície
def pintar_superficie(S, X, esp, rng, px_por_unidade, paleta=None, idade=0.3, extras=None, recortar=True, escala=None):
    """Pinta a folha nas grades (S, X).

    px_por_unidade: pixels por unidade de folha (escala média, para larguras de linha).
    paleta: sobrepõe cores da espécie (folha nova, folha de outono...).
    idade 0..1: mais manchas, bordas secas e furos nas folhas velhas.
    Devolve dict com 'sup', 'inf' (H,W,3), 'alfa', 'alt' (H,W) e 'dentro' (máscara da lâmina).
    """
    P = float(px_por_unidade)
    # pixels por unidade de folha na largura (Pu) e no comprimento (Pv); diferentes nas tiras
    Pu, Pv = escala if escala is not None else (P, P)
    pal = dict(esp.paleta)
    if paleta:
        pal.update(paleta)
    H, W = S.shape
    fases = rng.uniform(0, 1, 8)
    D, dono, dados, pec = contorno(S, X, esp, fases)

    # ---------------- nervuras (por lobo, cada pixel usa o lobo "dono")
    m_central = np.zeros((H, W), np.float32)
    sulco_central = np.zeros((H, W), np.float32)
    m_lat = np.zeros((H, W), np.float32)
    p_central = np.zeros((H, W), np.float32)
    p_lat = np.zeros((H, W), np.float32)
    bulho = np.zeros((H, W), np.float32)
    rel_margem = np.zeros((H, W), np.float32)
    s_lobo = np.zeros((H, W), np.float32)
    distorcao = ruido_fractal(rng, H, W, max(8.0, 0.08 * P), oitavas=3)
    fase_lat = None
    for k, lobo in enumerate(esp.lobos):
        sk, xk, hw = dados[k]
        sel = dono == k
        ax = np.abs(xk)
        rel = np.clip(ax / (hw + 1e-6), 0, 1.5)
        rel_margem = np.where(sel, rel, rel_margem)
        s_lobo = np.where(sel, sk, s_lobo)
        # central
        wc = (esp.larg_central * (1 - 0.78 * np.clip(sk, 0, 1)) + 0.0008) / lobo.comp
        if not lobo.principal:
            wc = wc * 0.55
        dc = ax * lobo.comp * Pu
        wc_px = wc * lobo.comp * Pu
        mc = suave(wc_px + 0.6, wc_px - 0.6, dc) * suave(0.995, 0.93, sk) * (sk > -0.02)
        mc = mc * (1 - 0.45 * np.clip(sk, 0, 1))
        pc = np.clip(1 - (dc / (wc_px + 1.2)) ** 2, 0, 1) * (sk > -0.02) * (sk < 0.985)
        sc = np.clip(suave(wc_px * 2.2 + 2.5, wc_px + 0.5, dc) - mc, 0, 1) * (sk > 0.0) * (sk < 0.9)
        sulco_central = np.where(sel, sc, sulco_central)
        m_central = np.where(sel, mc, m_central)
        p_central = np.where(sel, pc, p_central)
        # laterais
        if lobo.nerv_n <= 0:
            continue
        th = math.radians(lobo.nerv_ang)
        hmax = float(np.max(hw)) if lobo.perfil is not None else lobo.larg * 0.5
        sub = ax / math.tan(th) + lobo.nerv_curva * ax * ax / max(hmax, 1e-3) * 1.5
        lado = np.where(xk >= 0, 0.0, 0.5 + 0.12 * (fases[k + 1] - 0.5))
        n = lobo.nerv_n
        fase = n * (sk - sub) + lado + 0.10 * distorcao + 0.06 * np.sin(sk * 9.0 + fases[k] * 6)
        wl_u = esp.larg_lat * (1 - 0.65 * np.clip(rel, 0, 1))
        gr, gc = np.gradient(fase)
        g_px = np.sqrt(gr * gr + gc * gc) + 1e-6
        g_fis = np.sqrt((gr * Pv) ** 2 + (gc * Pu) ** 2) + 1e-6     # gradiente por unidade de folha
        p_perp = g_fis / g_px                                        # px por unidade na direção da linha
        wl = wl_u * p_perp
        ml, dl = linha_fase(fase, wl, grad=g_px)
        vale = suave(0.03, 0.10, sk - sub) * suave(0.97, 0.80, sk) * suave(1.0, 0.82, rel) * suave(0.0, 1.5 * wc_px, dc)
        ml = ml * vale
        pl = np.clip(1 - (dl / (wl + 1.5)) ** 2, 0, 1) * vale
        if k == 0:
            fase_lat = fase
        m_lat = np.where(sel, np.maximum(m_lat, ml), m_lat)
        p_lat = np.where(sel, np.maximum(p_lat, pl), p_lat)
        b = np.sin(math.pi * np.mod(fase, 1.0)) * suave(1.0, 0.75, rel) * suave(0.0, 0.25, rel)
        bulho = np.where(sel, b, bulho)
    # nervura marginal (Myrtaceae: jabuticaba e goiaba)
    m_marg = np.zeros((H, W), np.float32)
    if esp.intramarginal > 0:
        dm = np.abs(D - esp.intramarginal) * Pu
        m_marg = suave(esp.larg_lat * 0.6 * Pu + 0.6, esp.larg_lat * 0.6 * Pu - 0.6, dm) * (D > 0) * suave(0.02, 0.1, s_lobo) * suave(0.97, 0.88, s_lobo)
    # nervuras paralelas ao comprimento (fitas, capins, bromélias)
    if esp.paralelas:
        n_par, k_par = esp.paralelas
        sk0, xk0, hw0 = dados[0]
        urel = np.clip(xk0 / (hw0 + 1e-6), -1.2, 1.2)
        fase_p = urel * n_par * 0.5 + 0.04 * distorcao
        mp, dp_ = linha_fase(fase_p, 0.45)
        forte = (np.abs(np.round(fase_p)) % 4 == 0)
        m_lat = np.maximum(m_lat, mp * k_par * np.where(forte, 1.0, 0.55))
        p_lat = np.maximum(p_lat, np.clip(1 - (dp_ / 1.6) ** 2, 0, 1) * k_par)
        bulho = np.maximum(bulho, np.sin(math.pi * np.mod(fase_p, 1.0)) * 0.5)
    # rede terciária (Voronoi em pixels)
    tam = max(5.0, P * 0.35 / max(1, esp.lobos[0].nerv_n)) if esp.lobos[0].nerv_n > 0 else 9.0
    npts = int(H * W / (tam * tam)) + 8
    pts = np.stack([rng.uniform(0, H, npts), rng.uniform(0, W, npts)], -1)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    dist, _ = celulas(pts, yy, xx, k=2)
    borda_cel = (dist[..., 1] - dist[..., 0]) * 0.5
    m_ter = suave(1.1, 0.2, borda_cel) * suave(0.0, 0.03, D) * esp.terciarias
    del dist, yy, xx

    # ---------------- cores
    c_sup = np.asarray(pal['sup'], np.float32)
    c_inf = np.asarray(pal['inf'], np.float32)
    c_nerv = np.asarray(pal.get('nervura', c_sup * 1.4), np.float32)
    c_nerv_inf = np.asarray(pal.get('nervura_inf', c_inf * 1.15), np.float32)
    mancha = ruido_fractal(rng, H, W, max(10.0, 0.22 * P), oitavas=4)
    grao = ruido_fractal(rng, H, W, max(2.0, 0.012 * P), oitavas=2)
    var = pal.get('variacao', 0.07)
    sup = c_sup[None, None, :] * (1 + var * mancha[..., None] + 0.025 * grao[..., None])
    # matiz desigual: algumas regiões mais amareladas
    amar = np.asarray(pal.get('amarelado', c_sup * np.array([1.25, 1.12, 0.7])), np.float32)
    sup = misturar(sup, amar, np.clip(0.18 * ruido_fractal(rng, H, W, max(12.0, 0.3 * P), oitavas=2) + 0.05, 0, 0.4) * pal.get('desigual', 1.0))
    # margem e base
    sup = sup * (1 + pal.get('margem', -0.06) * suave(0.45, 1.0, rel_margem)[..., None])
    sup = misturar(sup, sup * np.array([1.08, 1.06, 0.92]), suave(0.12, 0.0, S) * 0.5)
    # cor de outono / transição por campo de ruído
    if 'gradiente' in pal:
        cs = [np.asarray(c, np.float32) for c in pal['gradiente']]
        grande = ruido_fractal(rng, H, W, max(16.0, 0.45 * P), oitavas=2)
        campo = np.clip(pal.get('estagio', 0.5) + pal.get('amp_estagio', 0.07) * grande + 0.03 * mancha
                        + 0.10 * (rel_margem - 0.5) + 0.10 * (S - 0.5), 0, 0.999)
        t = campo * (len(cs) - 1)
        i0 = np.floor(t).astype(np.int32)
        fr = (t - i0)[..., None]
        tabela = np.stack(cs)
        base_out = tabela[i0] * (1 - fr) + tabela[np.minimum(i0 + 1, len(cs) - 1)] * fr
        base_out = base_out * (1 + 0.05 * mancha[..., None] + 0.02 * grao[..., None])
        sup = base_out
    inf = c_inf[None, None, :] * (1 + 0.6 * var * mancha[..., None] + 0.02 * grao[..., None])
    if 'gradiente' in pal:
        inf = misturar(sup * 1.15 + 0.03, inf, 0.35)
    # nervuras (face de cima)
    k_lat = pal.get('lat', 0.35)
    sup = misturar(sup, misturar(sup, c_nerv, 0.45), m_lat * k_lat)
    sup = misturar(sup, c_nerv, m_marg * k_lat * 0.6)
    sup = sup * (1 - pal.get('ter', 0.05) * m_ter)[..., None]
    sup = sup * (1 - 0.10 * sulco_central)[..., None]
    sup = misturar(sup, c_nerv, m_central * pal.get('central', 0.85))
    # nervuras (face de baixo): mais salientes e claras
    inf = misturar(inf, c_nerv_inf, m_lat * min(1.0, k_lat * 1.7))
    inf = misturar(inf, c_nerv_inf, m_marg * 0.4)
    inf = inf * (1 - 0.6 * pal.get('ter', 0.05) * m_ter)[..., None]
    inf = misturar(inf, c_nerv_inf * 1.05, m_central)
    # pecíolo
    c_pec = np.asarray(pal.get('peciolo', c_nerv * 0.9), np.float32)
    sup = misturar(sup, c_pec, pec.astype(np.float32))
    inf = misturar(inf, c_pec, pec.astype(np.float32))

    alfa = borda_suave(D * P) if recortar else np.ones((H, W), np.float32)
    dentro = (D > 0) & ~pec

    # ---------------- defeitos naturais
    idade = float(idade)
    c_seco = np.asarray(pal.get('seco', cor('#7d6644')), np.float32)
    c_mancha = np.asarray(pal.get('mancha', cor('#6e4a26')), np.float32)
    c_halo = np.asarray(pal.get('halo', cor('#b8b04a')), np.float32)
    extras = extras or {}
    # manchas
    n_m = rng.poisson(extras.get('manchas', 3.0) * idade)
    for _ in range(n_m):
        k = rng.integers(len(esp.lobos)) if rng.random() < 0.4 else 0
        lobo = esp.lobos[k]
        sk0 = rng.uniform(0.12, 0.92)
        hw0 = float(perfil_lobo(np.array([sk0]), lobo)[0])
        xk0 = rng.uniform(-0.85, 0.85) * hw0
        th = math.radians(lobo.angulo)
        s0 = (sk0 * math.cos(th) - xk0 * math.sin(th)) * lobo.comp
        x0 = (sk0 * math.sin(th) + xk0 * math.cos(th)) * lobo.comp
        r = rng.uniform(0.006, 0.022) * extras.get('mancha_tam', 1.0)
        d = np.sqrt((S - s0) ** 2 + (X - x0) ** 2) / r + 0.35 * grao
        nucleo = suave(1.0, 0.6, d) * dentro
        halo = suave(2.2, 1.0, d) * dentro * (1 - nucleo)
        cm = variar_cor(c_mancha, rng, 10, 0.2, 0.25)
        sup = misturar(misturar(sup, c_halo, halo * 0.55), cm, nucleo * 0.9)
        inf = misturar(misturar(inf, c_halo * 1.1, halo * 0.4), cm * 1.2, nucleo * 0.8)
    # borda seca
    if rng.random() < extras.get('borda_seca', 0.35) * (0.4 + idade):
        s_ini = rng.uniform(0.15, 0.7)
        s_fim = min(1.02, s_ini + rng.uniform(0.15, 0.5))
        lado = rng.choice([-1, 1, 0])
        prof = rng.uniform(0.008, 0.03) * (1 + 0.6 * ruido_fractal(rng, H, W, max(6.0, 0.05 * P), oitavas=3))
        faixa = np.clip(np.sin(math.pi * np.clip((S - s_ini) / (s_fim - s_ini), 0, 1)), 0, 1) ** 0.7
        if lado != 0:
            faixa = faixa * (np.sign(X) == lado)
        prof = prof * faixa
        seca = suave(prof + 0.6 / Pu, prof - 0.6 / Pu, D) * (prof > 0.002) * dentro
        frente = np.clip(1 - np.abs(D - prof) * Pu / 1.8, 0, 1) * (prof > 0.002) * dentro
        sup = misturar(misturar(sup, c_seco, seca), c_seco * 0.45, frente * 0.6)
        inf = misturar(misturar(inf, c_seco * 1.1, seca), c_seco * 0.5, frente * 0.5)
    # ponta seca
    if rng.random() < extras.get('ponta_seca', 0.2) * (0.3 + idade):
        st = rng.uniform(0.86, 0.96) + 0.02 * grao
        seca = suave(st, st + 0.01, S) * dentro
        frente = np.clip(1 - np.abs(S - st) * Pv / 2.0, 0, 1) * dentro
        sup = misturar(misturar(sup, c_seco, seca), c_seco * 0.45, frente * 0.6)
        inf = misturar(inf, c_seco * 1.1, seca)
    # furos e mordidas (recortam o alfa)
    if recortar:
        n_f = rng.poisson(extras.get('furos', 0.6) * idade * 2)
        for _ in range(n_f):
            lobo = esp.lobos[0]
            sk0 = rng.uniform(0.2, 0.85)
            hw0 = float(perfil_lobo(np.array([sk0]), lobo)[0])
            if rng.random() < 0.5:
                xk0 = rng.choice([-1, 1]) * hw0 * rng.uniform(0.95, 1.1)      # mordida na margem
                r = rng.uniform(0.15, 0.35) * hw0
            else:
                xk0 = rng.uniform(0.25, 0.8) * hw0 * rng.choice([-1, 1])       # furo
                r = rng.uniform(0.04, 0.12) * hw0
            s0, x0 = sk0 * lobo.comp, xk0 * lobo.comp
            d = np.sqrt((S - s0) ** 2 + ((X - x0) * 1.15) ** 2) / r + 0.25 * grao + 0.12 * distorcao
            corte = suave(0.95, 1.05, d)
            anel = suave(1.5, 1.0, d) * (1 - suave(1.0, 0.95, d)) * dentro
            sup = misturar(sup, c_mancha * 0.9, anel * 0.7)
            inf = misturar(inf, c_mancha, anel * 0.6)
            alfa = alfa * corte

    # ---------------- relevo (face de cima)
    alt = (esp.relevo_central * p_central + esp.relevo_lat * p_lat
           + esp.bulado * bulho + esp.relevo_lat * 0.4 * m_marg - 0.00025 * m_ter * esp.terciarias)
    sup = np.clip(sup, 0, 1).astype(np.float32)
    inf = np.clip(inf, 0, 1).astype(np.float32)
    # leve oclusão nas nervuras afundadas (assada no albedo, bem fraca); só o relevo das nervuras conta
    if esp.relevo_lat < -0.0005 or esp.bulado > 0:
        cav = np.clip(-(alt - cv2.GaussianBlur(alt, (0, 0), max(1.0, 0.01 * P))) / (abs(esp.relevo_lat) + esp.bulado + 1e-6), 0, 1)
        cav = cav * (1 - np.maximum(m_lat, m_central))
        sup = sup * (1 - pal.get('cavidade', 0.12) * cav)[..., None]
    alt = alt + 0.00012 * grao
    return dict(sup=sup, inf=inf, alfa=alfa.astype(np.float32), alt=alt.astype(np.float32),
                dentro=dentro, D=D, rel_margem=rel_margem, m_central=m_central, m_lat=m_lat,
                fase_lat=fase_lat, grao=grao, mancha=mancha)


# ------------------------------------------------------------------ folha plana para os cachos
@dataclass
class FolhaPlana:
    sup: np.ndarray
    inf: np.ndarray
    alfa: np.ndarray
    alt: np.ndarray
    s0: float
    s1: float
    xmax: float
    P: float          # pixels por unidade de folha


def limites(esp):
    """Retângulo (s0, s1, xmax) que contém a folha inteira."""
    s0 = -esp.peciolo[0] - 0.01
    s1, xm = 0.0, esp.asa + 0.01
    for lobo in esp.lobos:
        th = math.radians(lobo.angulo)
        if lobo.cordado:
            sk = np.linspace(-lobo.cordado[0], 1, 240)
            hw = perfil_lobo((sk + lobo.cordado[0]) / (1 + lobo.cordado[0]), lobo) * (1 + lobo.cordado[0]) * 1.2
        else:
            sk = np.linspace(0, 1, 200)
            hw = perfil_lobo(sk, lobo) * 1.2
        for sg in (-1, 1):
            ss = (sk * math.cos(th) - sg * hw * math.sin(th)) * lobo.comp
            xx = (sk * math.sin(th) + sg * hw * math.cos(th)) * lobo.comp
            s0 = min(s0, ss.min()); s1 = max(s1, ss.max()); xm = max(xm, np.abs(xx).max())
    return s0 - 0.01, s1 + 0.01, xm + 0.01


def folha_plana(esp, rng, P, paleta=None, idade=0.3, extras=None):
    s0, s1, xm = limites(esp)
    H = int(math.ceil((s1 - s0) * P)) + 2
    W = int(math.ceil(2 * xm * P)) + 2
    lin, col = np.mgrid[0:H, 0:W].astype(np.float32)
    S = s1 - lin / P
    X = (col - W / 2.0) / P
    r = pintar_superficie(S, X, esp, rng, P, paleta=paleta, idade=idade, extras=extras)
    return FolhaPlana(r['sup'], r['inf'], r['alfa'], r['alt'], s0, s1, xm, P)
