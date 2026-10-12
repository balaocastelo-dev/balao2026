"""Adereços da reunião no cineminha (à noite)."""
import math

import numpy as np

import base as B
from base import TAU


def puff():
    """Pufe saco (pera): gomos costurados, topo caído para trás e a marca funda do assento na frente."""
    n = 48
    perfil = [(0.0, 0.0), (0.30, 0.0), (0.41, 0.03), (0.46, 0.10), (0.47, 0.20), (0.45, 0.31), (0.40, 0.43),
              (0.33, 0.54), (0.25, 0.64), (0.16, 0.71), (0.08, 0.75), (0.0, 0.765)]
    p = np.array(perfil)
    s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(p, axis=0), axis=1))])
    ss = np.linspace(0, s[-1], 24)
    p2 = np.column_stack([np.interp(ss, s, p[:, 0]), np.interp(ss, s, p[:, 1])])
    p2[0] = (0, 0)
    p2[-1] = (0, 0.765)
    ob = B.torno('pufe', [tuple(x) for x in p2], n=n, mat='tecido_pufe', suave=True)

    def forma(v):
        x, y, z = v[:, 0], v[:, 1], v[:, 2]
        a = np.arctan2(y, x)
        r = np.hypot(x, y)
        k = np.clip(z / 0.765, 0, 1)
        # gomos: costura funda e pano estufado entre elas
        g = np.angle(np.exp(1j * (a * 8)))
        gomo = -0.011 * np.exp(-(g / 0.16) ** 2) + 0.008 * np.cos(g / 2) ** 2
        gomo *= (z > 0.03) * (k < 0.93)
        ruga = 0.01 * B.ruido3(v, 8, 3) + 0.004 * B.ruido3(v, 22, 4)
        esc = 1 + (gomo + ruga) / np.maximum(r, 0.04)
        x2, y2 = x * esc, y * esc
        # o topo cai para trás (+Y) e a frente afunda (assento)
        y2 = y2 + 0.16 * k ** 1.7
        z2 = z - 0.06 * k ** 2
        d2 = (x2 / 0.26) ** 2 + ((y2 + 0.06) / 0.25) ** 2 + ((z2 - 0.66) / 0.24) ** 2
        cav = 0.24 * np.exp(-d2 * 1.4)
        z2 = z2 - cav * (z > 0.25)
        y2 = y2 + 0.4 * cav * (y2 < 0.1) * 0.5
        # rugas radiais em volta da marca do assento
        z2 = z2 - 0.012 * np.sin(np.arctan2(y2 + 0.06, x2) * 9) * np.exp(-((np.sqrt(d2) - 1.0) / 0.35) ** 2) * (z > 0.3)
        return np.column_stack([x2, y2, np.maximum(z2, 0.0)])
    B.deformar(ob, forma)
    B.uv_cilindrico(ob, tile_u=0.03, tile_v=0.03)
    # alça de tecido atrás, no alto
    t = np.linspace(0, 1, 8)
    al = np.column_stack([0.06 * (t - 0.5) * 2, 0.27 + 0.045 * np.sin(t * math.pi), 0.62 + 0.03 * np.sin(t * math.pi)])
    alca = B.fita('alca', al, 0.035, espessura=0.006, mat='tecido_pufe', cima=(0, 1, 0.5))
    B.uv_projetar(alca, tile=0.03)
    return B.juntar('puff', [ob, alca])


def _sarrafo(nome, p0, p1, larg, esp, mat='madeira_clara', cima=(0, 0, 1)):
    """Peça de madeira retangular entre dois pontos (chanfrada)."""
    p0, p1 = np.array(p0, float), np.array(p1, float)
    L = np.linalg.norm(p1 - p0)
    ob = B.caixa(nome, larg, esp, L, mat=mat, chanfro=min(0.003, larg * 0.2), seg=1, base=True)
    B.orientar(ob, tuple(p0), tuple(p1 - p0))
    return ob


def cadeira_dobravel():
    """Cadeira de diretor: madeira clara, assento e encosto de lona."""
    pc = []
    W, D = 0.54, 0.46
    hs = 0.45
    xs = W / 2 - 0.02
    yf, yt = -D / 2 + 0.02, D / 2 - 0.02
    for sx in (-1, 1):
        # montante da frente até o braço, de trás até o encosto
        pc.append(_sarrafo('mf', (sx * xs, yf, 0), (sx * xs, yf + 0.01, 0.66), 0.032, 0.032))
        pc.append(_sarrafo('mt', (sx * xs, yt, 0), (sx * xs, yt + 0.035, 0.9), 0.032, 0.032))
        # travessa do assento (onde a lona prende) e travessa baixa
        pc.append(_sarrafo('ta', (sx * (xs - 0.002), yf - 0.016, hs - 0.02), (sx * (xs - 0.002), yt + 0.03, hs - 0.02), 0.03, 0.045))
        pc.append(_sarrafo('tb', (sx * xs, yf - 0.016, 0.07), (sx * xs, yt + 0.016, 0.07), 0.028, 0.03))
        # braço
        br = B.caixa('braco', 0.055, D + 0.06, 0.022, mat='madeira_clara', chanfro=0.008, seg=2, centro=(sx * xs, 0.0, 0.66))
        pc.append(br)
    # X da frente e de trás (a cadeira fecha para os lados)
    for y in (yf, yt):
        pc.append(_sarrafo('x1', (-xs + 0.02, y, 0.08), (xs - 0.02, y, hs - 0.04), 0.024, 0.02))
        pc.append(_sarrafo('x2', (xs - 0.02, y + 0.022, 0.08), (-xs + 0.02, y + 0.022, hs - 0.04), 0.024, 0.02))
        pc.append(B.cilindro('pino', 0.007, 0.06, n=8, mat='aco_inox', centro=(0, y - 0.019, 0.265)))
        B.girar(pc[-1], (-90, 0, 0), centro=(0, y - 0.019, 0.265))
    # assento de lona (faz barriga)
    nx, ny = 10, 8
    P = np.zeros((ny, nx, 3))
    for j in range(ny):
        for i in range(nx):
            u, v = i / (nx - 1), j / (ny - 1)
            x = -xs + 0.02 + u * (2 * xs - 0.04)
            y = yf - 0.01 + v * (yt - yf + 0.03)
            z = hs + 0.004 - 0.035 * math.sin(u * math.pi) ** 0.8 * (0.6 + 0.4 * math.sin(v * math.pi))
            P[j, i] = (x, y, z)
    pc.append(B.grade('assento', P, mat='lona_cadeira', suave=True))
    # encosto de lona: faixa entre os montantes de trás
    P = np.zeros((5, nx, 3))
    for j in range(5):
        for i in range(nx):
            u, v = i / (nx - 1), j / 4
            x = -xs + u * 2 * xs
            z = 0.66 + v * 0.22
            y = yt + 0.012 + 0.026 * (z - 0.0) / 0.9 + 0.03 * math.sin(u * math.pi)
            P[j, i] = (x, y, z)
    pc.append(B.grade('encosto', P, mat='lona_cadeira', suave=True))
    return B.juntar('cadeira_dobravel', pc)


def manta():
    """Manta xadrez estendida no chão (1,8 x 1,4 m) com ondulações e franjas nas pontas."""
    nx, ny = 34, 27
    rng = B.rng(8)
    Lx, Ly = 1.8, 1.4
    xs = np.linspace(-Lx / 2, Lx / 2, nx)
    ys = np.linspace(-Ly / 2, Ly / 2, ny)
    X, Y = np.meshgrid(xs, ys)
    pts = np.column_stack([X.ravel(), Y.ravel(), np.zeros(X.size)])
    h = 0.012 * (B.ruido3(pts, 3.0, 2) + 0.9) + 0.008 * np.clip(B.ruido3(pts, 7.0, 5), 0, None)
    # uma dobra larga atravessada e a beira levantadinha
    h += 0.03 * np.exp(-((pts[:, 0] * 0.6 + pts[:, 1] * 0.8 - 0.25) / 0.06) ** 2) * np.clip(0.4 - pts[:, 0] * 0.3, 0, 1)
    borda = np.minimum(Lx / 2 - np.abs(pts[:, 0]), Ly / 2 - np.abs(pts[:, 1]))
    h += 0.01 * np.exp(-borda / 0.03)
    Z = np.maximum(h, 0.002).reshape(X.shape)
    # encolhe um pouco onde ondula (pano não estica)
    P = np.stack([X * (1 - 0.6 * Z), Y * (1 - 0.6 * Z), Z], axis=-1)
    UV = np.stack([X / 0.36, Y / 0.36], axis=-1)
    ob = B.grade('manta', P, mat='manta_xadrez', uv=UV, suave=True)
    # franjas nas pontas curtas (tiras finas)
    fr = []
    for sx in (-1, 1):
        x0 = P[:, 0 if sx < 0 else -1, :]
        for j in range(0, ny, 1):
            p = x0[j]
            L = 0.05 + 0.01 * rng.uniform()
            pts = np.array([p, p + (sx * L * 0.5, 0.004 * rng.normal(), 0.0), p + (sx * L, 0.008 * rng.normal(), -p[2] + 0.002)])
            pts[:, 2] = np.maximum(pts[:, 2], 0.0015)
            fr.append(B.fita('franja', pts, 0.018, mat='manta_xadrez', cima=(0, 0, 1)))
    fr = B.juntar('franjas', fr)
    B.uv_projetar(fr, tile=0.36, modo='plano', eixo='z')
    return B.juntar('manta', [ob, fr])


def balde_pipoca():
    """Balde de papel listrado (vermelho e branco) cheio de pipoca."""
    pc = []
    h, rb, rt = 0.215, 0.07, 0.1
    n_listras = 14
    for k in range(n_listras):
        a0 = k / n_listras * TAU
        a1 = (k + 1) / n_listras * TAU
        mat = 'balde_vermelho' if k % 2 == 0 else 'balde_branco'
        pc.append(B.torno('listra', [(rb, 0.006), (rt, h)], n=4, a0=a0, a1=a1, mat=mat, suave=True))
        pc.append(B.torno('listra_d', [(rt - 0.0015, h), (rb - 0.0015, 0.012)], n=4, a0=a0, a1=a1, mat=mat, suave=True))
    pc.append(B.torno('fundo', [(0, 0), (rb - 0.004, 0), (rb, 0.006), (rb - 0.0015, 0.012), (0, 0.012)], n=28, mat='balde_branco', suave=40))
    pc.append(B.toro('borda', rt + 0.0005, 0.003, nu=56, nv=6, mat='balde_branco', centro=(0, 0, h)))
    # monte de pipoca: domo calombento + pipocas soltas (cada uma com 3 ou 4 gomos estourados)
    rng = B.rng(19)
    dom = B.esfera('domo', rt - 0.003, nu=30, nv=12, mat='pipoca', esc=(1, 1, 0.55))
    B.deformar(dom, lambda v: np.column_stack([v[:, 0], v[:, 1], np.maximum(v[:, 2], -0.004)]) *
               (1 + 0.09 * np.abs(B.ruido3(v, 150, 4)) + 0.06 * np.abs(B.ruido3(v, 330, 6)))[:, None])
    B.mover(dom, (0, 0, h - 0.004))
    vv = B.verts(dom)
    mancha = B.ruido3(vv, 400, 9)
    cor = np.where((mancha > 0.55)[:, None], np.array([0.62, 0.42, 0.16]), np.array([0.93, 0.86, 0.64]))
    B.definir_cores(dom, cor)
    pc.append(dom)
    for i in range(30):
        a = rng.uniform(0, TAU)
        r = rt * math.sqrt(rng.uniform(0.0, 1.05))
        z = h + 0.05 * max(0.0, 1 - (r / rt) ** 2) ** 0.5 + rng.uniform(-0.002, 0.008)
        k = B.esfera('pipoca', 0.0085 * rng.uniform(0.85, 1.2), nu=8, nv=6, mat='pipoca')
        lobos = rng.normal(size=(4, 3))
        lobos /= np.linalg.norm(lobos, axis=1, keepdims=True)

        def estoura(v, lobos=lobos):
            u = v / (np.linalg.norm(v, axis=1, keepdims=True) + 1e-9)
            ganho = np.max(np.clip(u @ lobos.T, 0, 1) ** 3, axis=1)
            return v * (1 + 0.75 * ganho)[:, None]
        B.deformar(k, estoura)
        vk = B.verts(k)
        casca = (vk @ lobos[0] < -0.004)
        c = np.where(casca[:, None], np.array([0.6, 0.38, 0.12]), np.array([0.97, 0.93, 0.78]))
        B.definir_cores(k, c)
        B.girar(k, tuple(rng.uniform(0, 360, 3)))
        B.mover(k, (r * math.cos(a), r * math.sin(a), z))
        pc.append(k)
    return B.juntar('balde_pipoca', pc)


def _mesinha_quadrada(L=0.42, h=0.55, nome='mesinha'):
    pc = []
    pc.append(B.caixa('tampo', L, L, 0.025, mat='madeira_escura', chanfro=0.006, seg=2, centro=(0, 0, h - 0.025)))
    pc.append(B.caixa('prateleira', L - 0.06, L - 0.06, 0.018, mat='madeira_escura', chanfro=0.004, seg=1, centro=(0, 0, 0.14)))
    for sx in (-1, 1):
        for sy in (-1, 1):
            pc.append(B.caixa('perna', 0.03, 0.03, h - 0.025, mat='madeira_escura', chanfro=0.004, seg=1,
                              centro=(sx * (L / 2 - 0.035), sy * (L / 2 - 0.035), 0)))
    return pc


def projetor():
    """Projetor branco sobre mesinha de madeira; a lente olha para +Z (frente)."""
    pc = _mesinha_quadrada()
    h0 = 0.55
    W, D, H = 0.31, 0.235, 0.095
    zc = h0 + 0.012
    corpo = B.caixa('corpo', W, D, H, mat='projetor_corpo', chanfro=0.016, seg=3, centro=(0, 0.02, zc))
    pc.append(corpo)
    # faixa escura de ventilação na frente e nos lados
    for sx in (-1, 1):
        for k in range(6):
            pc.append(B.caixa('vent', 0.004, 0.02, 0.05, mat='plastico_preto', centro=(sx * (W / 2 + 0.0005), 0.07 + k * 0.012, zc + 0.022)))
    for k in range(7):
        pc.append(B.caixa('grade', 0.012, 0.004, 0.05, mat='plastico_preto', centro=(0.04 + k * 0.016, 0.02 - D / 2 - 0.0005, zc + 0.022)))
    # lente: aro preto saliente e vidro
    xl = -0.07
    yl = 0.02 - D / 2
    zl = zc + H * 0.5
    aro = B.torno('aro', [(0.0, 0.0), (0.042, 0.0), (0.042, 0.012), (0.038, 0.022), (0.031, 0.024), (0.029, 0.018)], n=28, mat='plastico_preto', suave=40)
    vidro = B.torno('vidro', [(0.029, 0.018), (0.02, 0.02), (0.0, 0.021)], n=28, mat='lente_projetor', suave=True)
    lente = B.juntar('lente_p', [aro, vidro])
    B.girar(lente, (90, 0, 0))
    B.mover(lente, (xl, yl + 0.004, zl))
    pc.append(lente)
    # teclado e anel de foco em cima
    pc.append(B.caixa('painel', 0.08, 0.05, 0.003, mat='plastico_cinza', chanfro=0.001, seg=1, centro=(0.07, 0.06, zc + H - 0.001)))
    for k in range(4):
        pc.append(B.cilindro('botao', 0.005, 0.003, n=10, mat='plastico_preto', centro=(0.045 + k * 0.017, 0.06, zc + H + 0.001)))
    pc.append(B.cilindro('foco', 0.012, 0.004, n=16, mat='plastico_preto', chanfro=0.001, centro=(xl, -0.04, zc + H - 0.001)))
    # pés
    for (x, y) in ((-0.12, -0.06), (0.12, -0.06), (0.0, 0.11)):
        pc.append(B.cilindro('pe', 0.012, 0.012, n=10, mat='borracha', centro=(x, y + 0.02, h0)))
    # traseira: tomada e cabo descendo até o chão
    pc.append(B.caixa('tomada', 0.03, 0.006, 0.02, mat='plastico_preto', centro=(0.1, 0.02 + D / 2 + 0.002, zc + 0.03)))
    t = np.linspace(0, 1, 18)
    cabo = np.column_stack([0.1 + 0.05 * t, 0.02 + D / 2 + 0.01 + 0.12 * t ** 0.7, zc + 0.04 - (zc + 0.04) * t ** 1.6 + 0.04 * np.sin(t * math.pi)])
    cabo[:, 2] = np.maximum(cabo[:, 2], 0.004)
    pc.append(B.tubo('cabo', cabo, 0.0035, n=6, mat='plastico_preto'))
    ob = B.juntar('projetor', pc)
    B.vazio('lente', (xl, yl - 0.022, zl), pai=ob)
    return ob


def cooler():
    """Caixa térmica (cooler) azul com tampa branca, alças e trava; sem marca."""
    pc = []
    L, W, Hc = 0.56, 0.36, 0.3
    corpo = B.caixa('corpo', L, W, Hc, mat='cooler_azul', chanfro=0.03, seg=3)
    B.deformar(corpo, lambda v: np.column_stack([v[:, 0] * (0.97 + 0.03 * v[:, 2] / Hc), v[:, 1] * (0.96 + 0.04 * v[:, 2] / Hc), v[:, 2]]))
    pc.append(corpo)
    # frisos horizontais
    for z in (0.08, 0.2):
        f = B.caixa('friso', L * 0.985, W * 0.97, 0.008, mat='cooler_azul', chanfro=0.003, seg=1, centro=(0, 0, z))
        B.deformar(f, lambda v: np.column_stack([v[:, 0] * (0.975 + 0.03 * v[:, 2] / Hc), v[:, 1] * (0.965 + 0.04 * v[:, 2] / Hc), v[:, 2]]))
        pc.append(f)
    tampa = B.caixa('tampa', L + 0.016, W + 0.016, 0.075, mat='cooler_branco', chanfro=0.03, seg=3, centro=(0, 0, Hc - 0.005))
    B.deformar(tampa, lambda v: np.column_stack([v[:, 0], v[:, 1], v[:, 2] + 0.012 * (1 - (v[:, 0] / (L / 2)) ** 2) * (1 - (v[:, 1] / (W / 2)) ** 2) * (v[:, 2] > Hc + 0.04)]))
    pc.append(tampa)
    # porta-copos na tampa
    for x in (-0.18, 0.18):
        pc.append(B.cilindro('copinho', 0.035, 0.006, n=20, mat='cooler_branco', chanfro=0.002, centro=(x, 0.06, Hc + 0.071)))
    # alças laterais (deitadas)
    for sx in (-1, 1):
        x = sx * (L / 2 + 0.008)
        al = [(x, -0.08, 0.22), (x + sx * 0.03, -0.075, 0.2), (x + sx * 0.034, 0.0, 0.198), (x + sx * 0.03, 0.075, 0.2), (x, 0.08, 0.22)]
        pc.append(B.tubo('alca', al, 0.007, n=8, mat='plastico_preto'))
        for y in (-0.08, 0.08):
            pc.append(B.cilindro('piv', 0.014, 0.012, n=12, mat='cooler_branco', centro=(0, 0, 0)))
            B.girar(pc[-1], (0, 90 * sx, 0))
            B.mover(pc[-1], (sx * (L / 2 - 0.006), y, 0.22))
    # trava da frente e dobradiça atrás
    pc.append(B.caixa('trava', 0.06, 0.015, 0.05, mat='cooler_branco', chanfro=0.004, seg=1, centro=(0, -W / 2 - 0.012, Hc - 0.03)))
    pc.append(B.cilindro('dobr', 0.008, L * 0.8, n=10, mat='cooler_branco'))
    B.girar(pc[-1], (0, 90, 0))
    B.mover(pc[-1], (-L * 0.4, W / 2 + 0.006, Hc))
    # bujão de dreno
    pc.append(B.cilindro('dreno', 0.012, 0.012, n=12, mat='plastico_preto', chanfro=0.002))
    B.girar(pc[-1], (90, 0, 0))
    B.mover(pc[-1], (0.2, -W / 2 + 0.004, 0.035))
    return B.juntar('cooler', pc)


def mesinha_lateral():
    """Mesinha lateral redonda de madeira, três pés palito abertos."""
    pc = []
    h = 0.5
    pc.append(B.cilindro('tampo', 0.225, 0.024, n=40, mat='madeira_escura', chanfro=0.008, centro=(0, 0, h - 0.024)))
    pc.append(B.cilindro('base', 0.075, 0.025, n=24, mat='madeira_escura', chanfro=0.004, centro=(0, 0, h - 0.048)))
    for k in range(3):
        a = k / 3 * TAU + 0.5
        topo = np.array([0.055 * math.cos(a), 0.055 * math.sin(a), h - 0.035])
        pe = np.array([0.19 * math.cos(a), 0.19 * math.sin(a), 0.0])
        pts = np.array([pe, (pe + topo) / 2, topo])
        pc.append(B.tubo('pe', pts, [0.010, 0.0135, 0.016], n=10, mat='madeira_escura'))
        pc.append(B.cilindro('ponteira', 0.011, 0.02, n=10, mat='aco_inox', centro=tuple(pe)))
    return B.juntar('mesinha_lateral', pc)


ADERECOS = [
    ('puff', puff, 'Pufe saco (pera) de tecido verde-oliva, com a marca do assento, costuras e rugas.', 'quem senta olha para +Z'),
    ('cadeira_dobravel', cadeira_dobravel, 'Cadeira de diretor dobrável: madeira clara, assento e encosto de lona azul-marinho; assento a 0,45 m.', 'quem senta olha para +Z'),
    ('manta', manta, 'Manta xadrez estendida no chão (1,8 x 1,4 m) com ondulações e franjas nas pontas curtas.'),
    ('balde_pipoca', balde_pipoca, 'Balde de papel listrado vermelho e branco, cheio de pipoca.'),
    ('projetor', projetor, 'Projetor branco sobre mesinha de madeira (lente a ~0,62 m), com cabo até o chão.',
     'a lente olha para +Z; filho vazio lente na frente do vidro (ponto de onde sai a luz); vidro em lente_projetor (emissivo fraco, o motor pode acender)'),
    ('cooler', cooler, 'Caixa térmica (cooler) azul e branca de ~50 L, com alças, trava e porta-copos na tampa.'),
    ('mesinha_lateral', mesinha_lateral, 'Mesinha lateral redonda de madeira (Ø 0,45 m, 0,5 m de altura) com três pés abertos.'),
]
