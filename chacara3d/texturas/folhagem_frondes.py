"""Frondes de palmeira (tipo "fronde"): um lado da folha em fita 2048 x 512.

u corre AO LONGO da fronde, da base (u = 0, esquerda) à ponta (u = 1,
direita); v vai da ráquis (v = 0, borda de baixo) até a ponta pendurada dos
folíolos (v = 1, em cima). Os folíolos nascem na borda de baixo, inclinados
para a ponta da fronde, curtos perto da base e da ponta e mais compridos no
meio. Fundo transparente. Cada folíolo é dobrado em V na nervura (como no
coqueiro de verdade): as duas metades recebem normais diferentes, o que dá o
jogo de claro/escuro típico da folha de coqueiro ao sol.
"""
import math
import numpy as np
import cv2
from folhagem_nucleo import cor, misturar, suave, ruido_fractal, variar_cor


def _norm(v):
    return v / (np.linalg.norm(v, axis=-1, keepdims=True) + 1e-12)


def fronde(rng, n_folios, cor_base, cor_nova, cor_seca, cor_raquis, ang=(55, 68), curva=0.06,
           larg_rel=0.034, alcance=None, dobra=28, p_seca=0.3, p_rasgo=0.07, p_corte=0.04, tam=(2048, 512), ss=2,
           sobreposicao=0.0):
    W, H = tam[0] * ss, tam[1] * ss
    A = np.zeros((H, W), np.float32)
    C = np.zeros((H, W, 3), np.float32)
    Nm = np.zeros((H, W, 3), np.float32)
    if alcance is None:
        alcance = lambda u: 0.36 + 0.60 * np.sin(math.pi * np.clip(u, 0, 1) ** 0.85) ** 1.1
    # posições dos folíolos ao longo da ráquis (mais juntos no meio)
    us = np.linspace(0.012, 0.985, n_folios) + rng.normal(0, 0.12 / n_folios, n_folios)
    k_fronde = curva * rng.uniform(0.9, 1.1)
    ordem = rng.permutation(n_folios) if sobreposicao else np.arange(n_folios)
    estrias_fundo = ruido_fractal(rng, 64, 4096, 12, oitavas=2)
    for i in ordem:
        u0 = float(np.clip(us[i], 0.004, 0.99))
        th = math.radians(ang[0] + (ang[1] - ang[0]) * u0 + rng.normal(0, 1.8))
        reach = float(alcance(u0)) * rng.uniform(0.9, 1.04)
        L = reach / math.sin(th) * H                                   # px
        # não passar da ponta da fronde nem da borda de cima
        L = min(L, (0.996 - u0) * W / max(math.cos(th), 0.05) * 0.98, 0.985 * H / math.sin(th))
        if L < 12 * ss:
            continue
        k = k_fronde * rng.uniform(0.8, 1.2)
        corte = rng.random() < p_corte
        if corte:
            L *= rng.uniform(0.55, 0.85)
        meia = 0.5 * larg_rel * L * rng.uniform(0.85, 1.15)
        meia = max(meia, 2.2 * ss)
        Ax, Ay = u0 * W, 0.0
        d = np.array([math.cos(th), math.sin(th)])
        n = np.array([-math.sin(th), math.cos(th)])                      # normal à esquerda (para a base)
        # caixa
        pts = [np.array([Ax, Ay]) + L * (t * d - k * t * t * n) + s * meia * n for t in np.linspace(0, 1, 12) for s in (-1.3, 1.3)]
        pts = np.array(pts)
        x0 = int(max(0, pts[:, 0].min() - 3)); x1 = int(min(W, pts[:, 0].max() + 3))
        y0 = int(max(0, pts[:, 1].min() - 3)); y1 = int(min(H, pts[:, 1].max() + 3))
        if x1 <= x0 or y1 <= y0:
            continue
        xs = np.arange(x0, x1, dtype=np.float32) + 0.5
        ys = np.arange(y0, y1, dtype=np.float32) + 0.5                    # y para cima (v)
        QX, QY = np.meshgrid(xs, ys)
        qx, qy = (QX - Ax) / L, (QY - Ay) / L
        t = qx * d[0] + qy * d[1]
        w = (qx * n[0] + qy * n[1]) + k * t * t                           # coordenada lateral (unid. de L)
        tc = np.clip(t, 0, 1)
        forma = np.clip(tc / 0.035, 0, 1) ** 0.5 * np.clip(1 - tc ** 2.3, 0, 1) ** 0.85
        hw = meia / L * forma
        # rasgo: a ponta do folíolo se divide em duas
        rasgo = rng.random() < p_rasgo
        if rasgo:
            ts = rng.uniform(0.45, 0.8)
            abre = np.clip((tc - ts) / (1 - ts), 0, 1)
            fenda = abre * hw * 0.5
            dist_fenda = (np.abs(w) - fenda) * L
        dist = (hw - np.abs(w)) * L
        dist = np.where((t >= -0.002) & (t <= 1.0), dist, -5)
        if corte:
            fim = 0.97 + 0.03 * np.sin(w * L * 0.9 + rng.uniform(0, 6))
            dist = np.minimum(dist, (fim - t) * L)
        if rasgo:
            dist = np.minimum(dist, np.where(tc > ts, dist_fenda, 1e3))
        alfa = np.clip(dist / ss + 0.5, 0, 1).astype(np.float32)
        if alfa.max() <= 0:
            continue
        # cor
        c0 = variar_cor(cor_base, rng, 6, 0.12, 0.12)
        nova = rng.random() < 0.15
        if nova:
            c0 = misturar(c0, cor_nova, rng.uniform(0.3, 0.7))
        col = np.broadcast_to(c0, alfa.shape + (3,)).astype(np.float32).copy()
        # estrias longitudinais finas (nervuras paralelas do folíolo)
        rel = np.clip(w / np.maximum(hw, 1e-6), -1.2, 1.2)
        fase = rel * 4.5 + 0.3 * math.sin(i)
        est = np.abs(fase - np.round(fase))
        col = col * (1 + 0.035 * suave(0.12, 0.0, est))[..., None]
        # variação ao longo do folíolo (base mais amarelada, ponta um pouco mais escura)
        col = misturar(col, col * np.array([1.12, 1.08, 0.85], np.float32), suave(0.25, 0.0, tc) * 0.6)
        col = col * (1 - 0.06 * tc)[..., None]
        # nervura central clara
        lw = (1.4 - 0.9 * tc) * ss
        nerv = suave(lw + 0.6, lw - 0.6, np.abs(w) * L)
        col = misturar(col, misturar(c0, cor('#d2cf96'), 0.6), nerv * 0.75)
        # metade "virada para cima" com leve brilho
        lado = np.sign(w)
        col = col * (1 + 0.035 * lado)[..., None]
        # ponta seca
        if rng.random() < p_seca or corte:
            tsec = rng.uniform(0.70, 0.94) if not corte else rng.uniform(0.85, 0.95)
            borda = tsec + 0.015 * np.sin(w * L * 0.7 + rng.uniform(0, 6))
            seca = suave(borda, borda + 0.015, tc)
            cs = variar_cor(cor_seca, rng, 8, 0.15, 0.15)
            col = misturar(col, cs, seca)
            col = misturar(col, cs * 0.6, np.clip(1 - np.abs(tc - borda) * L / (2.5 * ss), 0, 1) * 0.6)
        # margens com fio seco ocasional
        if rng.random() < 0.3:
            col = misturar(col, cor_seca, suave(1.6 * ss, 0.3 * ss, dist) * 0.5 * (tc > 0.3))
        # normal: duas metades da dobra em V (abrindo para cima), mais curvatura
        f = math.radians(dobra * rng.uniform(0.7, 1.2))
        n3 = np.array([n[0], n[1], 0.0])
        nl = np.array([-n3[0] * math.sin(f), -n3[1] * math.sin(f), math.cos(f)])
        nr = np.array([n3[0] * math.sin(f), n3[1] * math.sin(f), math.cos(f)])
        suaviza = np.clip(np.abs(w) * L / (1.5 * ss), 0, 1)[..., None]
        nn = np.where((w > 0)[..., None], nl, nr)
        nn = _norm(nn * suaviza + np.array([0, 0, 1.0]) * (1 - suaviza))
        # caimento ao longo do folíolo (a ponta pende para fora da fronde)
        incl = math.radians(18) * tc
        nn = _norm(nn + np.stack([d[0] * np.sin(incl), d[1] * np.sin(incl), np.zeros_like(tc)], -1) * 0.6)
        # compõe (sobre)
        rr0, rr1 = H - y1, H - y0
        al = alfa[::-1]; co = col[::-1]; nm = nn[::-1]
        Ab = A[rr0:rr1, x0:x1]
        C[rr0:rr1, x0:x1] = co * al[..., None] + C[rr0:rr1, x0:x1] * (1 - al[..., None])
        Nm[rr0:rr1, x0:x1] = nm * al[..., None] + Nm[rr0:rr1, x0:x1] * (1 - al[..., None])
        A[rr0:rr1, x0:x1] = al + Ab * (1 - al)
    # ráquis (faixa na borda de baixo)
    alt_rq = int(0.012 * H)
    xs = np.arange(W)
    uq = xs / W
    esp = (alt_rq * (1.0 - 0.6 * uq)).astype(np.int32)
    lin = np.arange(H)[:, None]
    rq = (lin >= H - esp[None, :]).astype(np.float32)
    crq = np.broadcast_to(cor_raquis, (H, W, 3)) * (1 + 0.05 * cv2.resize(estrias_fundo, (W, H))[..., None])
    C = C * (1 - rq[..., None]) + crq * rq[..., None]
    Nm = Nm * (1 - rq[..., None]) + np.array([0, -0.5, 0.86], np.float32) * rq[..., None]
    A = np.maximum(A, rq)
    # redução
    t = tam
    A2 = cv2.resize(A, t, interpolation=cv2.INTER_AREA)
    C2 = cv2.resize(C, t, interpolation=cv2.INTER_AREA)
    N2 = cv2.resize(Nm, t, interpolation=cv2.INTER_AREA)
    rgb = C2 / np.maximum(A2, 1e-6)[..., None]
    nrm = _norm(N2 + (1 - np.clip(A2, 0, 1))[..., None] * np.array([0, 0, 1], np.float32))
    return np.clip(rgb, 0, 1).astype(np.float32), np.clip(A2, 0, 1).astype(np.float32), nrm.astype(np.float32)


def fronde_coqueiro(rng):
    """Coqueiro (Cocos nucifera): folíolos longos e estreitos, verde-amarelado a verde médio."""
    return fronde(rng, 86, cor('#4c7226'), cor('#839a38'), cor('#8a7444'), cor('#a39a5a'),
                  ang=(70, 56), curva=0.05, larg_rel=0.027, dobra=30, p_seca=0.30, p_rasgo=0.07, p_corte=0.04)


def fronde_areca(rng):
    """Areca-bambu (Dypsis lutescens): mais clara, amarelo-esverdeada, folíolos mais arqueados e densos."""
    alc = lambda u: 0.34 + 0.62 * np.sin(math.pi * np.clip(u, 0, 1) ** 0.9) ** 1.0
    return fronde(rng, 94, cor('#759a32'), cor('#a2b448'), cor('#9a8a50'), cor('#c2b456'),
                  ang=(58, 46), curva=0.085, larg_rel=0.026, alcance=alc, dobra=22, p_seca=0.15, p_rasgo=0.03,
                  p_corte=0.02)
