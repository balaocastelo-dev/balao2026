"""Os visuais (corpo + roupa + cabelo + calçado numa malha só) de cada pessoa."""
import numpy as np

import malha as M
import ossos as O
import roupas as R
from roupas import CIMA, BAIXO, PELE, CABELO, ACESS

I = O.INDICE


# ---------------------------------------------------------------------------
# campos das peças (f > 0 dentro)
# ---------------------------------------------------------------------------
def bracidade(b, W):
    return b.peso(W, ['braco_e', 'antebraco_e', 'mao_e', 'braco_d', 'antebraco_d', 'mao_d'])


def pernidade(b, W, l):
    return b.peso(W, ['coxa' + l, 'canela' + l, 'pe' + l, 'dedos_pe' + l])


def f_decote(b, P, frente, costas, largura=0.0, v=0.0):
    """Decote: elipse em volta do pescoço (no plano XZ), maior na frente; abaixo dela
    um plano inclinado limita a profundidade (frente mais baixa que as costas).
    `largura` abre para os lados (canoa), `v` aprofunda no meio da frente (decote em V)."""
    k, J = b.k, b.J
    yp, zc = J['pescoco'][1], J['pescoco'][2]
    a = (0.068 + largura) * k                      # meia largura
    cf = (0.075 + frente * 0.55) * k               # para a frente
    cb = (0.060 + costas * 0.3) * k                # para trás
    dz = P[:, 2] - zc
    c = np.where(dz > 0, cf, cb)
    e = np.sqrt((P[:, 0] / a) ** 2 + (dz / c) ** 2)
    f_el = (e - 1.0) * 0.06 * k
    # só vale perto da base do pescoço; abaixo do plano tudo é coberto
    zf, zb = zc + 0.07 * k, zc - 0.05 * k
    t = np.clip((P[:, 2] - zb) / (zf - zb), 0, 1)
    y_pl = (yp - costas * k) + ((costas - frente) * k) * t
    y_pl = y_pl - v * k * np.clip(1 - np.abs(P[:, 0]) / (0.05 * k), 0, 1) * (dz > 0)
    f_pl = y_pl - P[:, 1]
    f_cima = (yp + 0.02 * k) - P[:, 1]
    return np.minimum(np.maximum(f_el, f_pl), f_cima)


def f_manga(b, P, W, t_fim, l, ante=False):
    """Manga até t_fim do braço (ou do antebraço, se ante)."""
    if ante:
        t, r, L = b.eixo(P, 'antebraco' + l, 'mao' + l)
    else:
        t, r, L = b.eixo(P, 'braco' + l, 'antebraco' + l)
    br = b.peso(W, ['braco' + l, 'antebraco' + l, 'mao' + l])
    f = (t_fim - t) * L
    return np.where(br > 0.5, f, np.maximum(f, (0.5 - br) * 0.4))


def f_perna(b, P, W, t_fim, l, canela=False):
    if canela:
        t, r, L = b.eixo(P, 'canela' + l, 'pe' + l)
    else:
        t, r, L = b.eixo(P, 'coxa' + l, 'canela' + l)
    pr = pernidade(b, W, l)
    f = (t_fim - t) * L
    return np.where(pr > 0.5, f, np.maximum(f, (0.5 - pr) * 0.4))


def sem_bracos(b, W):
    return (0.5 - bracidade(b, W)) * 0.5


def sem_pernas(b, W):
    return (0.5 - np.maximum(pernidade(b, W, '_e'), pernidade(b, W, '_d'))) * 0.5


def sem_cabeca(b, W):
    return (0.5 - W[:, I['cabeca']]) * 0.3


def f_camiseta(b, P, W, manga=0.42, barra=0.03, frente=0.075, costas=0.025, largura=0.0, manga_ante=False):
    k, J = b.k, b.J
    f = [f_decote(b, P, frente, costas, largura), P[:, 1] - (J['coxa_e'][1] + barra * k), sem_cabeca(b, W)]
    for l in ('_e', '_d'):
        f.append(f_manga(b, P, W, manga, l, ante=manga_ante))
    return np.minimum.reduce(f)


def f_regata(b, P, W, barra=0.03, frente=0.12, costas=0.07, alca=0.12):
    """Regata: cavas fundas, alças sobre os ombros."""
    k, J = b.k, b.J
    y_ax = J['braco_e'][1] - 0.11 * k
    u = np.clip((y_ax + 0.05 * k - P[:, 1]) / (0.10 * k), 0, 1)
    x_lim = alca * k + 0.25 * k * (1 - np.sqrt(np.clip(1 - u * u, 0, 1)))
    f = [f_decote(b, P, frente, costas, 0.02), P[:, 1] - (J['coxa_e'][1] + barra * k), x_lim - np.abs(P[:, 0]),
         sem_bracos(b, W)]
    return np.minimum.reduce(f)


def f_cintura_para_baixo(b, P, W, cintura=0.10, perna=0.85, canela=False):
    k, J = b.k, b.J
    f = [(J['coxa_e'][1] + cintura * k) - P[:, 1], sem_bracos(b, W)]
    for l in ('_e', '_d'):
        f.append(f_perna(b, P, W, perna, l, canela=canela))
    return np.minimum.reduce(f)


def f_calca(b, P, W, cintura=0.10, barra=0.095):
    k, J = b.k, b.J
    f = [(J['coxa_e'][1] + cintura * k) - P[:, 1], sem_bracos(b, W), P[:, 1] - barra * k]
    return np.minimum.reduce(f)


def y_virilha(b):
    """Altura da virilha (ponto mais baixo do tronco entre as pernas)."""
    if not hasattr(b, '_virilha'):
        V, W = b.Vfino, b.Wfino
        sel = (np.abs(V[:, 0]) < 0.012 * b.k) & (V[:, 1] < b.J['coxa_e'][1]) & (V[:, 1] > b.J['coxa_e'][1] - 0.25 * b.k)
        b._virilha = V[sel, 1].min() if sel.any() else b.J['coxa_e'][1] - 0.09 * b.k
    return b._virilha


def f_cueca(b, P, W, cintura=0.03, lado_alto=0.0, corte_fora=None, corte_dentro=None):
    """Sunga / calcinha / parte de baixo do maiô: cintura em y (relativa ao quadril) e cava
    de cada perna por um plano que passa no lado do quadril (altura `lado_alto`) e na
    virilha na frente e atrás (cobre as nádegas)."""
    k, J = b.k, b.J
    yq = J['coxa_e'][1]
    yv = y_virilha(b)
    zq = J['quadril'][2]
    f = [(yq + cintura * k) - P[:, 1], sem_bracos(b, W)]
    umbigo = np.array([0.0, yq + 0.1 * k, zq + 0.1 * k])
    for l in ('_e', '_d'):
        s = 1.0 if l == '_e' else -1.0
        H = J['coxa' + l]
        Lp = np.array([s * (abs(H[0]) + 0.075 * k), yq + lado_alto * k, H[2] - 0.01 * k])
        Cf = np.array([s * 0.028 * k, yv + 0.012 * k, zq + 0.065 * k])
        Cb = np.array([s * 0.028 * k, yv - 0.004 * k, zq - 0.075 * k])
        n = np.cross(Cf - Lp, Cb - Lp)
        n /= np.linalg.norm(n)
        if np.dot(umbigo - Lp, n) < 0:
            n = -n
        f.append((P - Lp) @ n)
    return np.minimum.reduce(f)


def f_pe(b, P, W, altura):
    """Calçado: o pé abaixo de `altura` (m, já em escala)."""
    pe = b.peso(W, ['pe_e', 'pe_d', 'dedos_pe_e', 'dedos_pe_d', 'canela_e', 'canela_d'])
    return np.minimum(altura - P[:, 1], (pe - 0.5) * 0.5)


# ---------------------------------------------------------------------------
def f_aberta(b, P, largura_cima=0.045, largura_baixo=0.085):
    """Abertura da frente (camisa aberta): fora da peça numa faixa no meio da frente."""
    k, J = b.k, b.J
    y0, y1 = J['pescoco'][1], J['coxa_e'][1]
    t = np.clip((y0 - P[:, 1]) / (y0 - y1), 0, 1)
    w = (largura_cima + (largura_baixo - largura_cima) * t) * k
    frente = P[:, 2] > J['coluna_2'][2] + 0.02 * k
    return np.where(frente, np.abs(P[:, 0]) - w, 1.0)


def f_biquini_cima(b, P, W):
    """Parte de cima do biquíni: dois triângulos no peito, faixa nas costas e alças no pescoço."""
    k, J, cab, cau = b.k, b.J, b.cab, b.cau
    f = []
    y_inf = cau['breast.L'][1] - 0.055 * k
    for l, L in (('_e', '.L'), ('_d', '.R')):
        ap = cau['breast' + L]                       # bico
        s = 1.0 if l == '_e' else -1.0
        dx = (P[:, 0] - ap[0]) * s
        # triângulo: topo acima do bico, base na linha de baixo do peito
        h = (P[:, 1] - y_inf) / (ap[1] + 0.065 * k - y_inf)
        meia = (0.075 * k) * np.clip(1 - h, 0, 1) + 0.008 * k
        f.append(np.minimum.reduce([P[:, 1] - y_inf, meia - np.abs(dx + 0.006 * k * h), P[:, 2] - (J['peito'][2] + 0.05 * k)]))
    # faixa embaixo (volta pelas costas)
    faixa = np.minimum(P[:, 1] - y_inf, (y_inf + 0.028 * k) - P[:, 1])
    # alças: do alto de cada triângulo até a nuca
    alcas = []
    for l, L in (('_e', '.L'), ('_d', '.R')):
        ap = cau['breast' + L]
        a = np.array([ap[0], ap[1] + 0.06 * k, ap[2] - 0.01 * k])
        c = np.array([0.025 * k * np.sign(ap[0]), J['pescoco'][1] + 0.01 * k, J['pescoco'][2] - 0.03 * k])
        d = c - a
        t = np.clip((P - a) @ d / (d @ d), 0, 1)
        q = a + t[:, None] * d
        alcas.append(0.009 * k - np.linalg.norm(P - q, axis=1))
    tudo = np.maximum.reduce(f + [faixa] + alcas)
    return np.minimum(tudo, sem_bracos(b, W))


def f_maio(b, P, W):
    k, J = b.k, b.J
    y_ax = J['braco_e'][1] - 0.09 * k
    u = np.clip((y_ax + 0.04 * k - P[:, 1]) / (0.10 * k), 0, 1)
    x_lim = 0.10 * k + 0.25 * k * (1 - np.sqrt(np.clip(1 - u * u, 0, 1)))
    f = [f_decote(b, P, 0.13, 0.12, largura=0.015), x_lim - np.abs(P[:, 0]), sem_bracos(b, W),
         f_cueca(b, P, W, cintura=0.6, lado_alto=0.05)]
    return np.minimum.reduce(f)


class Peca:
    def __init__(self, nome, campo, espessura=0.007, mascara=CIMA, margem=0.016, alisar=6, barra=None,
                 pendurar=None, membros=(), camada=0.0, regiao='tecido', remove_pele=True, pos=None, sobre=(),
                 construir=None, cortar=True, reduzir=0.6):
        self.nome = nome
        self.campo = campo
        self.espessura = espessura
        self.mascara = np.asarray(mascara, float)
        self.margem = margem
        self.alisar = alisar
        self.barra = barra if barra is not None else dict()
        self.pendurar = pendurar          # dict(y_topo=..., inclinacao=...)
        self.membros = membros            # [(a, b, t_ini, inclinacao, folga)]
        self.camada = camada
        self.regiao = regiao
        self.remove_pele = remove_pele
        self.pos = pos                    # função(base, malha) -> malha (ajustes finais)
        self.sobre = sobre                # peças que ficam por baixo desta (afasta mais onde elas existem)
        self.construir = construir        # função(base, m_cortado, f) -> [Malha] (no lugar da casca padrão)
        self.cortar = cortar
        self.reduzir = reduzir


def espessura_de(p, P, W):
    return p.espessura(P, W) if callable(p.espessura) else np.full(len(P), p.espessura)


def vestir(base, pecas, extras=(), mascara_pele=None, pos_corpo=None):
    """Corta o corpo pelas peças, monta as cascas e as barras e junta tudo."""
    m = base.m.copia()
    m.A['mascara'] = np.tile(PELE, (m.n, 1))
    for p in pecas:
        if p.campo is not None and p.cortar:
            m, _ = m.cortar(p.campo(m.V, m.W))
    fs = {p.nome: (p.campo(m.V, m.W) if p.campo is not None else None) for p in pecas}
    partes = []
    remover = np.zeros(len(m.F), bool)
    for p in pecas:
        f = fs[p.nome]
        if p.construir is not None:
            partes += p.construir(base, m, f)
        else:
            dentro = (f[m.F] > -1e-7).all(1)
            if not dentro.any():
                continue
            ped = m.sub(dentro)
            ped.A = {}
            por_baixo = [q for q in pecas if q.nome in p.sobre]

            def esp(P, W, p=p, pb=por_baixo):
                t = espessura_de(p, P, W) + p.camada
                for q in pb:
                    fq = q.campo(P, W)
                    t = t + np.clip((fq + 0.035) / 0.03, 0, 1) * (espessura_de(q, P, W) + 0.008)
                return t
            c = R.casca(base, ped, esp, alisar=p.alisar)
            if p.pendurar:
                R.pendurar_tronco(base, c, **p.pendurar)
            for (a, bb, t0, inc, folga) in p.membros:
                lado = a[-2:]
                if bb.startswith('pe'):
                    pr = c.W[:, I['coxa' + lado]] + c.W[:, I['canela' + lado]] + c.W[:, I['pe' + lado]]
                else:
                    pr = c.W[:, I[a]] + c.W[:, I[bb]]
                R.pendurar_membro(base, c, a, bb, t0, sel=pr > 0.3, inclinacao=inc, folga=folga)
            if p.pos:
                c = p.pos(base, c)
            # casca lisa: menos triângulos que a pele (a borda fica)
            c = M.reduzir_interno(c, int(len(c.F) * p.reduzir)) if p.reduzir < 1 else c
            if p.regiao != 'pele':
                c.UV = R.na_regiao(R.de_regiao(c.UV, 'pele'), p.regiao)
            c.A['mascara'] = np.tile(p.mascara, (c.n, 1))
            partes.append(c)
            if p.barra is not False:
                partes += R.barra(base, c, mascara=p.mascara, **p.barra)
        if p.remove_pele and f is not None:
            remover |= (f[m.F] > p.margem).all(1)
    corpo = m.sub(~remover)
    corpo.A['mascara'] = np.tile(PELE, (corpo.n, 1))
    if pos_corpo is not None:
        corpo = pos_corpo(base, corpo)
    partes = [corpo] + partes + list(extras)
    out = M.juntar(partes)
    for k_ in list(out.A):
        if k_ != 'mascara':
            del out.A[k_]
    return out


# ---------------------------------------------------------------------------
# peças prontas (fábricas que dependem da pessoa)
# ---------------------------------------------------------------------------
import cabelo as CB      # noqa: E402
import calcado as CA     # noqa: E402


def membros_braco(t0=0.1, inc=0.0, folga=0.012):
    return [('braco_e', 'antebraco_e', t0, inc, folga), ('braco_d', 'antebraco_d', t0, inc, folga)]


def membros_antebraco(t0=0.0, inc=0.0, folga=0.01):
    return [('antebraco_e', 'mao_e', t0, inc, folga), ('antebraco_d', 'mao_d', t0, inc, folga)]


def membros_perna(t0=0.25, inc=0.0, folga=0.02):
    return [('coxa_e', 'canela_e', t0, inc, folga), ('coxa_d', 'canela_d', t0, inc, folga)]


def membros_canela(t0=0.0, inc=0.0, folga=0.012):
    return [('canela_e', 'pe_e', t0, inc, folga), ('canela_d', 'pe_d', t0, inc, folga)]


def gola(b, alto=0.028, abre=0.012):
    """Barra que vira gola na borda do pescoço (laço mais alto que os ombros)."""
    y_ombro = b.J['braco_e'][1]

    def por_laco(P):
        if P[:, 1].mean() > y_ombro - 0.02 * b.k and np.ptp(P[:, 1]) < 0.12 * b.k:
            return dict(comprimento=alto * b.k, abre=abre * b.k)
        return None
    return por_laco


def cos(b, cintura):
    """Barra da cintura (cós) mais justa que a das pernas."""
    y = b.J['coxa_e'][1] + cintura * b.k

    def por_laco(P):
        if abs(P[:, 1].mean() - y) < 0.03 * b.k:
            return dict(comprimento=0.012 * b.k, abre=0.001, espessura=0.006)
        return None
    return por_laco


def peca_camiseta(b, nome='camiseta', mascara=CIMA, manga=0.42, barra_y=0.03, frente=0.075, costas=0.025,
                  largura=0.0, solta=0.08, esp=0.007, sobre=('baixo',), gola_alta=None, manga_ante=False, aberta=None,
                  camada=0.0, folga_manga=0.012, so_faixa=None):
    J = b.J
    if so_faixa:
        def campo(P, W):
            f = f_camiseta(b, P, W, manga, barra_y, frente, costas, largura, manga_ante)
            return np.minimum(f, -f_aberta(b, P, *so_faixa))
    elif aberta:
        def campo(P, W):
            return np.minimum(f_camiseta(b, P, W, manga, barra_y, frente, costas, largura, manga_ante), f_aberta(b, P, *aberta))
    else:
        def campo(P, W):
            return f_camiseta(b, P, W, manga, barra_y, frente, costas, largura, manga_ante)
    br = dict(comprimento=0.012 * b.k, abre=0.004)
    if gola_alta:
        br['por_laco'] = gola(b, *gola_alta)
    if so_faixa:
        y_ombro = J['braco_e'][1]
        br['so_lacos'] = lambda P: P[:, 1].mean() > y_ombro - 0.02 * b.k and np.ptp(P[:, 1]) < 0.12 * b.k
    mb = membros_antebraco() + membros_braco(0.1, 0.0, 0.006) if manga_ante else membros_braco(folga=folga_manga)
    return Peca(nome, campo, espessura=esp, mascara=mascara, pendurar=dict(y_topo=J['peito'][1] - 0.01 * b.k,
                inclinacao=solta), membros=mb, barra=br, sobre=sobre, camada=camada)


def peca_regata(b, mascara=CIMA):
    J = b.J
    return Peca('regata', lambda P, W: f_regata(b, P, W), espessura=0.006, mascara=mascara, reduzir=0.5,
                pendurar=dict(y_topo=J['peito'][1] - 0.01 * b.k, inclinacao=0.10), barra=dict(comprimento=0.01, abre=0.003),
                sobre=('baixo',))


def peca_bermuda(b, nome='baixo', perna=0.85, cintura=0.10, esp=0.010, folga=0.02, mascara=BAIXO):
    return Peca(nome, lambda P, W: f_cintura_para_baixo(b, P, W, cintura=cintura, perna=perna), espessura=esp,
                mascara=mascara, membros=membros_perna(0.25, 0.0, folga),
                barra=dict(comprimento=0.015 * b.k, abre=0.006, por_laco=cos(b, cintura)))


def peca_calca(b, nome='baixo', cintura=0.10, barra_y=0.085, esp=0.008, folga=0.012, mascara=BAIXO):
    # caimento numa linha só, do quadril ao tornozelo (perna da calça reta, afinando de leve)
    mb = [('coxa_e', 'pe_e', 0.35, 0.06, folga), ('coxa_d', 'pe_d', 0.35, 0.06, folga)]
    return Peca(nome, lambda P, W: f_calca(b, P, W, cintura=cintura, barra=barra_y), espessura=esp, mascara=mascara,
                membros=mb, reduzir=0.5,
                barra=dict(comprimento=0.012 * b.k, abre=0.004, por_laco=cos(b, cintura)), sobre=('calcado',))


def peca_cueca(b, nome='baixo', cintura=0.03, lado=0.0, mascara=BAIXO, esp=0.004, barra=True, fora=None, dentro=None):
    br = dict(comprimento=0.004, abre=0.001, espessura=0.004) if barra else False
    return Peca(nome, lambda P, W: f_cueca(b, P, W, cintura=cintura, lado_alto=lado),
                espessura=esp, mascara=mascara, alisar=0, margem=0.012, barra=br, reduzir=1.0)


def peca_calcado(b, tipo):
    def construir(base, m, f):
        _m, _f, partes = CA.sapato(base, m, tipo)
        return partes
    cfg = CA.TIPOS[tipo]
    return Peca('calcado', lambda P, W: CA.f_sapato(b, P, W, cfg['colar']), espessura=cfg['esp'], mascara=ACESS,
                margem=0.004, construir=construir)


def peca_sandalia(b, tipo):
    def construir(base, m, f):
        return CA.chinelo(base) if tipo == 'chinelo' else CA.sandalia(base)
    return Peca('calcado', None, construir=construir, remove_pele=False)


def peca_cabelo(b, cb, estilo):
    """estilo: curto, crespo, longo, rabo, coque, raspado."""
    k = b.k
    if estilo == 'raspado':
        return None
    tabela = CB.LINHA_LONGA if estilo in ('longo', 'rabo', 'coque') else CB.LINHA_CURTA
    if estilo == 'curto':
        esp = CB.esp_curto(k)
        kw = dict(relevo=0.0025 * k, escala_relevo=0.02 * k)
    elif estilo == 'crespo':
        esp = CB.esp_volumoso(k)
        kw = dict(relevo=0.007 * k, escala_relevo=0.016 * k, cachos=0.85)
    elif estilo == 'longo':
        esp = CB.esp_curto(k, topo=0.012, lado=0.010, nuca=0.008)
        kw = dict(relevo=0.003 * k, escala_relevo=0.025 * k)
    else:   # rabo / coque: cabelo puxado, rente
        esp = CB.esp_curto(k, topo=0.007, lado=0.005, nuca=0.004)
        kw = dict(relevo=0.0015 * k, escala_relevo=0.03 * k)

    def construir(base, m, f, estilo=estilo):
        partes, _f = CB.cabelo_simples(base, m, cb, tabela, esp, **kw)
        if estilo == 'longo':
            partes.append(CB.cabelo_comprido(base, cb, comprimento=0.20))
        elif estilo == 'rabo':
            partes += CB.rabo_de_cavalo(base, cb, comprimento=0.22 if b.tipo != 'crianca' else 0.17)
        elif estilo == 'coque':
            partes += CB.coque(base, cb)
        return partes
    # a pele do couro cabeludo fica (com a cor do cabelo pela máscara): sem buracos se a casca encostar
    return Peca('cabelo', lambda P, W: CB.f_cabelo(cb, P, W, tabela), mascara=CABELO, remove_pele=False,
                construir=construir)


def peca_bone(b, cb):
    def construir(base, m, f):
        return CB.bone2(base, cb)
    return Peca('bone', None, construir=construir, remove_pele=False)


def peca_chapeu(b, cb):
    def construir(base, m, f):
        return CB.chapeu2(base, cb)
    return Peca('chapeu', None, construir=construir, remove_pele=False)


def peca_saia(b, nome, y_topo, y_barra, mascara, folga=0.012, abre=0.10):
    def construir(base, m, f):
        return [R.saia(base, y_topo, y_barra, folga=folga, abre=abre, mascara=mascara)]
    return Peca(nome, None, construir=construir, remove_pele=False)


# ---------------------------------------------------------------------------
# máscara da pele: sobrancelhas e linha do cabelo
# ---------------------------------------------------------------------------
def mascara_pele(b, cb, estilo, descalco=False):
    k = b.k
    olhos = b.marcos['olhos']
    J = b.J

    def pos(base, corpo):
        C = np.tile(PELE, (corpo.n, 1)).astype(float)
        P = corpo.V
        cab = corpo.W[:, I['cabeca']]
        # sobrancelhas: arco acima dos olhos
        x = np.abs(P[:, 0])
        xc = 0.033 * k
        y_arco = olhos[1] + 0.024 * k + 0.004 * k * (1 - ((x - xc) / (0.03 * k)) ** 2)
        dy = (P[:, 1] - y_arco) / (0.006 * k)
        dx = (x - xc) / (0.024 * k)
        frente = P[:, 2] > olhos[2] - 0.03 * k
        sob = np.exp(-(dy ** 2) - np.clip(np.abs(dx) - 0.6, 0, None) ** 2 * 6) * frente * (cab > 0.5) * (x > 0.008 * k)
        sob = np.clip(sob * 0.55, 0, 0.5)
        # couro cabeludo: cor do cabelo onde há cabelo (ou barba por fazer no raspado)
        tab = CB.LINHA_LONGA if estilo in ('longo', 'rabo', 'coque') else CB.LINHA_CURTA
        fc = CB.f_cabelo(cb, P, corpo.W, tab, folga_orelha=0.03)
        if estilo == 'raspado':
            cab_m = np.clip((fc + 0.004) / 0.012, 0, 1) * 0.6
        else:
            cab_m = np.clip((fc + 0.002) / 0.006, 0, 1)
        a = np.maximum(sob, cab_m)
        C[:, 3] = a
        C[:, 2] = 1 - a
        corpo.A['mascara'] = C
        if descalco:
            CA.descalco(base, corpo)
        return corpo
    return pos


# ---------------------------------------------------------------------------
# visuais de cada pessoa
# ---------------------------------------------------------------------------
def montar(b, pecas, estilo_cabelo, descalco=False):
    cb = CB.Cabeca(b)
    lista = [p(b, cb) if callable(p) else p for p in pecas]
    hc = peca_cabelo(b, cb, estilo_cabelo)
    if hc is not None:
        lista.append(hc)
    lista = [p for p in lista if p is not None]
    return vestir(b, lista, pos_corpo=mascara_pele(b, cb, estilo_cabelo, descalco))


DESCR = {}


def visuais(b):
    """Lista (nome, montador, descrição, categorias) da pessoa."""
    t = b.tipo
    k = b.k
    J = b.J
    L = []

    def add(nome, f, desc, cats):
        L.append((nome, f, desc, cats))

    if t == 'homem':
        add('casual', lambda: montar(b, [
            lambda b, cb: peca_camiseta(b),
            lambda b, cb: peca_bermuda(b),
            lambda b, cb: peca_calcado(b, 'tenis')], 'curto'),
            'camiseta, bermuda, tênis, cabelo curto', ['casual', 'festa'])
        add('camisa', lambda: montar(b, [
            lambda b, cb: peca_camiseta(b, nome='camiseta', mascara=ACESS, manga=0.36, barra_y=0.035, esp=0.005,
                                        folga_manga=0.0, solta=0.05, so_faixa=(0.10, 0.15)),
            lambda b, cb: peca_camiseta(b, nome='camisa', mascara=CIMA, manga=0.50, barra_y=0.0, frente=0.06,
                                        esp=0.008, sobre=('camiseta', 'baixo'), aberta=(0.05, 0.10), gola_alta=(0.03, 0.016),
                                        camada=0.004, folga_manga=0.018),
            lambda b, cb: peca_calca(b),
            lambda b, cb: peca_calcado(b, 'sapatenis')], 'curto'),
            'camisa de manga curta aberta sobre camiseta (camiseta no canal de acessório), calça, sapatênis',
            ['casual', 'festa', 'noite'])
        add('regata', lambda: montar(b, [
            lambda b, cb: peca_regata(b),
            lambda b, cb: peca_bermuda(b, perna=0.75, folga=0.025),
            lambda b, cb: peca_sandalia(b, 'chinelo'),
            lambda b, cb: peca_bone(b, cb)], 'curto'),
            'regata, bermuda, chinelo, boné', ['casual', 'piscina', 'festa'])
        add('praia', lambda: montar(b, [
            lambda b, cb: peca_cueca(b, cintura=0.04, lado=0.0),
            lambda b, cb: peca_sandalia(b, 'chinelo')], 'curto'),
            'sunga, sem camisa, chinelo', ['piscina'])
        add('praia_2', lambda: montar(b, [
            lambda b, cb: peca_bermuda(b, perna=0.68, cintura=0.07, esp=0.012, folga=0.03)], 'raspado', descalco=True),
            'bermuda de praia, sem camisa, descalço, cabelo raspado', ['piscina'])
        add('trabalho', lambda: montar(b, [
            lambda b, cb: peca_camiseta(b, nome='uniforme', manga=0.93, manga_ante=True, barra_y=0.04, frente=0.05,
                                        esp=0.008, gola_alta=(0.03, 0.016)),
            lambda b, cb: peca_calca(b, esp=0.010, folga=0.016),
            lambda b, cb: peca_calcado(b, 'botina'),
            lambda b, cb: peca_chapeu(b, cb)], 'curto'),
            'camisa de uniforme de manga comprida, calça de brim, botina, chapéu de palha', ['trabalho'])
        add('noite', lambda: montar(b, [
            lambda b, cb: peca_camiseta(b, manga=0.40),
            lambda b, cb: peca_calca(b, esp=0.007, folga=0.008),
            lambda b, cb: peca_calcado(b, 'tenis')], 'crespo'),
            'camiseta, calça jeans, tênis, cabelo crespo volumoso', ['noite', 'festa'])
    elif t == 'mulher':
        add('casual', lambda: montar(b, [
            lambda b, cb: peca_camiseta(b, nome='blusa', manga=0.22, barra_y=0.05, frente=0.10, largura=0.02, solta=0.05),
            lambda b, cb: peca_bermuda(b, perna=0.25, cintura=0.09, esp=0.006, folga=0.01),
            lambda b, cb: peca_calcado(b, 'tenis')], 'longo'),
            'blusa, short jeans, tênis, cabelo longo solto', ['casual', 'festa'])
        add('vestido', lambda: montar(b, [
            lambda b, cb: Peca('corpete', lambda P, W: np.minimum(f_regata(b, P, W, barra=0.06, frente=0.11, costas=0.09, alca=0.10),
                                                                  P[:, 1] - (J['coxa_e'][1] + 0.06 * k) + 0.0),
                               espessura=0.005, mascara=CIMA, barra=dict(comprimento=0.008, abre=0.002)),
            lambda b, cb: peca_cueca(b, nome='forro', cintura=0.04, mascara=CIMA, fora=0.0, dentro=0.12, barra=False),
            lambda b, cb: peca_saia(b, 'saia', J['coxa_e'][1] + 0.08 * k, J['canela_e'][1] + 0.02 * k, CIMA, abre=0.07),
            lambda b, cb: peca_sandalia(b, 'sandalia')], 'coque'),
            'vestido leve até o joelho, sandália, coque', ['festa', 'casual'])
        add('praia', lambda: montar(b, [
            lambda b, cb: Peca('biquini_cima', lambda P, W: f_biquini_cima(b, P, W), espessura=0.004, mascara=CIMA,
                               alisar=1, margem=0.012, reduzir=1.0, barra=dict(comprimento=0.003, abre=0.001, espessura=0.003)),
            lambda b, cb: peca_cueca(b, cintura=0.02, lado=0.03),
            lambda b, cb: peca_sandalia(b, 'chinelo')], 'rabo'),
            'biquíni, chinelo, rabo de cavalo', ['piscina'])
        add('praia_2', lambda: montar(b, [
            lambda b, cb: Peca('maio', lambda P, W: f_maio(b, P, W), espessura=0.004, mascara=CIMA, alisar=1, margem=0.012,
                               reduzir=0.8, barra=dict(comprimento=0.003, abre=0.001, espessura=0.003))], 'longo', descalco=True),
            'maiô, descalça, cabelo solto', ['piscina'])
        add('trabalho', lambda: montar(b, [
            lambda b, cb: peca_camiseta(b, nome='uniforme', manga=0.40, barra_y=0.04),
            lambda b, cb: peca_calca(b, esp=0.009, folga=0.014),
            lambda b, cb: peca_calcado(b, 'bota'),
            lambda b, cb: peca_bone(b, cb)], 'rabo'),
            'camiseta de uniforme, calça, bota, rabo de cavalo, boné', ['trabalho'])
        add('noite', lambda: montar(b, [
            lambda b, cb: Peca('top', lambda P, W: f_regata(b, P, W, barra=0.20, frente=0.10, costas=0.08, alca=0.11),
                               espessura=0.005, mascara=CIMA, barra=dict(comprimento=0.008, abre=0.003)),
            lambda b, cb: peca_cueca(b, nome='forro', cintura=0.05, mascara=BAIXO, fora=0.0, dentro=0.12, barra=False),
            lambda b, cb: peca_saia(b, 'saia', J['coxa_e'][1] + 0.07 * k, J['coxa_e'][1] - 0.24 * k, BAIXO, abre=0.06,
                                    folga=0.008),
            lambda b, cb: peca_calcado(b, 'tenis')], 'longo'),
            'top, saia curta, tênis, cabelo solto', ['noite', 'festa'])
    else:
        add('menino', lambda: montar(b, [
            lambda b, cb: peca_camiseta(b, manga=0.45),
            lambda b, cb: peca_bermuda(b, perna=0.55, esp=0.009),
            lambda b, cb: peca_calcado(b, 'tenis')], 'curto'),
            'camiseta, short, tênis, cabelo curto', ['casual', 'festa'])
        add('menina', lambda: montar(b, [
            lambda b, cb: peca_camiseta(b, nome='corpete', manga=0.30, barra_y=0.10, frente=0.08),
            lambda b, cb: peca_cueca(b, nome='forro', cintura=0.05, mascara=CIMA, fora=0.0, dentro=0.12, barra=False),
            lambda b, cb: peca_saia(b, 'saia', J['coxa_e'][1] + 0.10 * k, J['canela_e'][1] + 0.08 * k, CIMA, abre=0.08),
            lambda b, cb: peca_calcado(b, 'tenis')], 'rabo'),
            'vestidinho, tênis, rabo de cavalo', ['casual', 'festa'])
        add('praia_menino', lambda: montar(b, [
            lambda b, cb: peca_cueca(b, cintura=0.04, lado=0.0)], 'curto', descalco=True),
            'sunga, descalço', ['piscina'])
        add('praia_menina', lambda: montar(b, [
            lambda b, cb: Peca('maio', lambda P, W: f_maio(b, P, W), espessura=0.004, mascara=CIMA, alisar=1, margem=0.012,
                               reduzir=0.8, barra=dict(comprimento=0.003, abre=0.001, espessura=0.003))], 'rabo', descalco=True),
            'maiô, descalça, rabo de cavalo', ['piscina'])
    return L
