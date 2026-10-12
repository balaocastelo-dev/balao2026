"""Adereços da rave à noite."""
import math

import numpy as np

import base as B
from base import TAU


# ----------------------------------------------------------------- cabine do DJ

def _botoes(lista, mat='plastico_cinza', r=0.006, h=0.006, n=10):
    return [B.cilindro('bt', r, h, n=n, mat=mat, chanfro=min(0.0015, r * 0.3), centro=p) for p in lista]


def _toca_discos(cx, z0):
    """Player (CDJ genérico) com o DJ do lado +Y: prato, tela inclinada, botões e pitch."""
    pc = []
    W, D, H = 0.32, 0.41, 0.105
    corpo = B.caixa('cdj', W, D, H, mat='metal_preto', chanfro=0.012, seg=2, centro=(cx, 0, z0))
    # tampo levemente inclinado para o DJ
    B.deformar(corpo, lambda v: np.column_stack([v[:, 0], v[:, 1], v[:, 2] - 0.02 * (v[:, 1] / D + 0.5) * (v[:, 2] > z0 + 0.05)]))
    pc.append(corpo)
    zt = lambda y: z0 + H - 0.02 * (y / D + 0.5)
    yj = 0.04
    # prato (jog): anel metálico, disco escuro, miolo com tela
    pc.append(B.cilindro('jog_aro', 0.104, 0.012, n=40, mat='aluminio_escovado', chanfro=0.003, centro=(cx, yj, zt(yj) - 0.004)))
    pc.append(B.cilindro('jog', 0.094, 0.016, n=40, mat='plastico_preto', chanfro=0.003, centro=(cx, yj, zt(yj) - 0.003)))
    pc.append(B.cilindro('jog_tela', 0.03, 0.017, n=24, mat='tela_cdj', centro=(cx, yj, zt(yj) - 0.003)))
    # tela inclinada no fundo (-Y), virada para o DJ
    tela = B.caixa('moldura', 0.17, 0.012, 0.085, mat='plastico_preto', chanfro=0.004, seg=1)
    vidro = B.caixa('tela', 0.155, 0.002, 0.07, mat='tela_cdj', centro=(0, 0.006, 0.0075))
    t = B.juntar('tela_cdj', [tela, vidro])
    B.girar(t, (-62, 0, 0))
    B.mover(t, (cx, -0.165, zt(-0.165) - 0.01))
    pc.append(t)
    # botões play/cue (perto do DJ, à esquerda dele) e fileiras de botões
    lado = -1
    pc += _botoes([(cx + lado * -0.115, 0.165, zt(0.165)), (cx + lado * -0.115, 0.118, zt(0.118))], mat='plastico_cinza', r=0.014, h=0.006, n=16)
    pc += _botoes([(cx - 0.12 + k * 0.03, -0.085, zt(-0.085)) for k in range(9)], r=0.0055)
    # pitch (fenda + cursor) à direita do DJ
    pc.append(B.caixa('fenda', 0.008, 0.15, 0.002, mat='plastico_preto_fosco', centro=(cx + 0.13, 0.05, zt(0.05))))
    pc.append(B.caixa('cursor', 0.022, 0.012, 0.012, mat='plastico_cinza', chanfro=0.002, seg=1, centro=(cx + 0.13, 0.04, zt(0.04))))
    return pc


def _mixer(z0):
    pc = []
    W, D, H = 0.33, 0.41, 0.1
    pc.append(B.caixa('mixer', W, D, H, mat='metal_preto', chanfro=0.01, seg=2, centro=(0, 0, z0)))
    zt = z0 + H
    pc.append(B.caixa('painel', W - 0.02, D - 0.02, 0.002, mat='plastico_preto_fosco', centro=(0, 0, zt - 0.001)))
    # botões giratórios: 4 canais x 6 linhas
    for i in range(4):
        x = -0.105 + i * 0.07
        for j in range(5):
            y = -0.16 + j * 0.04
            pc.append(B.cilindro('knob', 0.009, 0.014, n=8, mat='plastico_cinza', chanfro=0.002, seg=1, centro=(x, y, zt)))
        # fader de canal
        pc.append(B.caixa('fenda', 0.004, 0.07, 0.002, mat='plastico_preto', centro=(x, 0.1, zt)))
        pc.append(B.caixa('fader', 0.012, 0.02, 0.016, mat='plastico_cinza', chanfro=0.003, seg=1, centro=(x, 0.085 + 0.02 * ((i * 7) % 3) / 2, zt)))
    # crossfader
    pc.append(B.caixa('fenda_x', 0.11, 0.004, 0.002, mat='plastico_preto', centro=(0, 0.175, zt)))
    pc.append(B.caixa('cross', 0.02, 0.012, 0.016, mat='plastico_cinza', chanfro=0.003, seg=1, centro=(0.01, 0.175, zt)))
    # medidores de nível (LEDs) e tela
    pc.append(B.caixa('nivel', 0.05, 0.004, 0.003, mat='led_cabine', centro=(0, -0.185, zt)))
    pc.append(B.caixa('tela_mix', 0.08, 0.035, 0.002, mat='tela_cdj', centro=(0, 0.02, zt)))
    return pc


def _notebook(cx, z0):
    pc = []
    # suporte de alumínio inclinado
    sup = B.caixa('suporte', 0.26, 0.24, 0.008, mat='aluminio', chanfro=0.002, seg=1)
    B.girar(sup, (-14, 0, 0))
    pc.append(B.juntar('sup', [sup]))
    B.mover(pc[-1], (cx, 0.0, z0 + 0.12))
    for sx in (-1, 1):
        pc.append(B.caixa('pe_sup', 0.012, 0.03, 0.15, mat='aluminio', chanfro=0.002, seg=1, centro=(cx + sx * 0.11, -0.08, z0)))
        pc.append(B.caixa('pe_sup2', 0.012, 0.03, 0.09, mat='aluminio', chanfro=0.002, seg=1, centro=(cx + sx * 0.11, 0.08, z0)))
    # notebook: base e tela aberta virada para +Y (DJ)
    base = B.caixa('nb_base', 0.32, 0.22, 0.016, mat='aluminio_escovado', chanfro=0.004, seg=1)
    tecl = B.caixa('teclado', 0.28, 0.1, 0.001, mat='plastico_preto', centro=(0, 0.015, 0.016))
    nb = B.juntar('nb', [base, tecl])
    B.girar(nb, (-14, 0, 0))
    B.mover(nb, (cx, 0.0, z0 + 0.13))
    pc.append(nb)
    tampa = B.caixa('nb_tampa', 0.32, 0.008, 0.21, mat='aluminio_escovado', chanfro=0.003, seg=1)
    tela = B.caixa('nb_tela', 0.29, 0.002, 0.18, mat='tela_notebook', centro=(0, 0.005, 0.015))
    tp = B.juntar('nb_t', [tampa, tela])
    B.girar(tp, (-18, 0, 0))
    B.mover(tp, (cx, -0.105, z0 + 0.155))
    pc.append(tp)
    return pc


def cabine_dj():
    """Cabine de DJ: frente fechada com faixa de LED, dois players, mixer, notebook e fones."""
    pc = []
    W, D, H = 2.2, 0.75, 1.0
    # tampo e estrutura
    pc.append(B.caixa('tampo', W, D, 0.04, mat='madeira_preta', chanfro=0.008, seg=2, centro=(0, 0, H - 0.04)))
    pc.append(B.caixa('frente', W, 0.03, H - 0.04, mat='madeira_preta', chanfro=0.006, seg=1, centro=(0, -D / 2 + 0.015, 0)))
    for sx in (-1, 1):
        pc.append(B.caixa('lado', 0.03, D, H - 0.04, mat='madeira_preta', chanfro=0.006, seg=1, centro=(sx * (W / 2 - 0.015), 0, 0)))
    pc.append(B.caixa('prateleira', W - 0.06, D - 0.1, 0.025, mat='madeira_preta', chanfro=0.004, seg=1, centro=(0, 0.03, 0.45)))
    pc.append(B.caixa('rodape', W - 0.06, D - 0.08, 0.04, mat='madeira_preta', centro=(0, 0.02, 0.0)))
    # painel frontal com moldura e faixas de LED (em cima e embaixo)
    pc.append(B.caixa('painel', W - 0.16, 0.012, H - 0.22, mat='caixa_preta', chanfro=0.004, seg=1, centro=(0, -D / 2 - 0.006, 0.11)))
    for z in (H - 0.085, 0.055):
        pc.append(B.caixa('led', W - 0.1, 0.012, 0.026, mat='led_cabine', chanfro=0.004, seg=1, centro=(0, -D / 2 - 0.007, z)))
    for sx in (-1, 1):
        pc.append(B.caixa('led_v', 0.022, 0.012, H - 0.2, mat='led_cabine', chanfro=0.004, seg=1, centro=(sx * (W / 2 - 0.06), -D / 2 - 0.007, 0.1)))
    zt = H
    # equipamentos
    pc += _toca_discos(-0.36, zt)
    pc += _toca_discos(0.36, zt)
    pc += _mixer(zt)
    pc += _notebook(0.84, zt)
    # fone de ouvido sobre o tampo
    t = np.linspace(-math.pi / 2 - 0.3, math.pi / 2 + 0.3, 16)
    arco = np.column_stack([0.085 * np.sin(t) - 0.75, 0.13 + 0.0 * t, zt + 0.02 + 0.075 * np.cos(t) * 0.35 + 0.0])
    arco = np.column_stack([-0.78 + 0.085 * np.sin(t), 0.12 + 0.06 * np.cos(t), np.full_like(t, zt + 0.03)])
    pc.append(B.tubo('arco_fone', arco, 0.008, n=6, mat='plastico_preto'))
    for s in (-1, 1):
        conc = B.cilindro('concha', 0.042, 0.03, n=16, mat='plastico_preto', chanfro=0.008)
        B.mover(conc, (-0.78 + s * 0.095, 0.12, zt))
        pc.append(conc)
    # cabos
    cabos = [
        [(-0.36, -0.2, zt + 0.03), (-0.25, -0.26, zt + 0.005), (-0.08, -0.22, zt + 0.004), (-0.05, -0.205, zt + 0.03)],
        [(0.36, -0.2, zt + 0.03), (0.25, -0.26, zt + 0.005), (0.08, -0.22, zt + 0.004), (0.05, -0.205, zt + 0.03)],
        [(0.84, -0.14, zt + 0.12), (0.7, -0.26, zt + 0.005), (0.2, -0.3, zt + 0.004), (0.1, -0.206, zt + 0.04)],
        [(0.0, -0.2, zt + 0.03), (0.0, -0.33, zt + 0.004), (0.3, -0.355, zt), (0.6, -0.36, zt - 0.2)],
    ]
    for c in cabos:
        c = np.array(c)
        s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(c, axis=0), axis=1))])
        ss = np.linspace(0, s[-1], 14)
        cc = np.column_stack([np.interp(ss, s, c[:, i]) for i in range(3)])
        pc.append(B.tubo('cabo', cc, 0.0035, n=5, mat='plastico_preto'))
    return B.juntar('cabine_dj', pc)


# ----------------------------------------------------------------- caixas de som

def _gabinete(W, D, H, z0, falantes):
    pc = []
    pc.append(B.caixa('gab', W, D, H, mat='caixa_preta', chanfro=0.012, seg=2, centro=(0, 0, z0)))
    g = B.caixa('grade', W - 0.05, 0.012, H - 0.05, mat='grelha_som', chanfro=0.004, seg=1, centro=(0, -D / 2 - 0.002, z0 + 0.025))
    B.uv_projetar(g, tile=0.032)
    pc.append(g)
    # cantoneiras e alças embutidas
    for sx in (-1, 1):
        for sz in (0, 1):
            pc.append(B.caixa('canto', 0.05, 0.05, 0.05, mat='metal_preto', chanfro=0.008, seg=1,
                              centro=(sx * (W / 2 - 0.018), -D / 2 + 0.018, z0 + sz * (H - 0.05) - 0.002)))
        pc.append(B.caixa('alca', 0.012, 0.16, 0.06, mat='plastico_preto', chanfro=0.006, seg=1, centro=(sx * (W / 2 + 0.002), 0.05, z0 + H * 0.62)))
    return pc


def caixa_som_grande():
    """Torre de caixas de show (~1,9 m): subwoofer embaixo e duas caixas de médio/agudo em cima."""
    pc = []
    pc += _gabinete(0.64, 0.72, 0.62, 0.0, 1)
    pc += _gabinete(0.52, 0.5, 0.63, 0.625, 1)
    pc += _gabinete(0.52, 0.5, 0.63, 1.26, 1)
    # sapatas
    for sx in (-1, 1):
        for sy in (-1, 1):
            pc.append(B.cilindro('sapata', 0.025, 0.012, n=10, mat='borracha', centro=(sx * 0.27, sy * 0.3, -0.012)))
    ob = B.juntar('caixa_som_grande', pc)
    B.mover(ob, (0, 0, 0.012))
    return ob


# ----------------------------------------------------------------- treliça com cabeças móveis

def _tubo_reto(p0, p1, r, n, mat='aluminio'):
    return B.tubo('t', [p0, p1], r, n=n, mat=mat, tampas=False, suave=True)


def _modulo_trelica(p0, p1, lado=0.29, eixo_lateral=(0, 1, 0)):
    """Treliça quadrada (4 banzos + diagonais em zigue-zague) de p0 a p1."""
    p0, p1 = np.array(p0, float), np.array(p1, float)
    T = p1 - p0
    L = np.linalg.norm(T)
    T /= L
    U = np.array(eixo_lateral, float)
    U = U - T * np.dot(U, T)
    U /= np.linalg.norm(U)
    V = np.cross(T, U)
    m = lado / 2 - 0.025
    cantos = [(-m, -m), (m, -m), (m, m), (-m, m)]
    pc = []
    for (a, b) in cantos:
        o = U * a + V * b
        pc.append(_tubo_reto(p0 + o, p1 - 0 * T + o, 0.024, 8))
    nseg = max(1, int(round(L / 0.5)))
    for k in range(4):
        a0 = np.array(cantos[k])
        a1 = np.array(cantos[(k + 1) % 4])
        for s in range(nseg):
            t0 = s / nseg * L
            t1 = (s + 1) / nseg * L
            if s % 2:
                q0, q1 = a0, a1
            else:
                q0, q1 = a1, a0
            P0 = p0 + T * (t0 + 0.02) + U * q0[0] + V * q0[1]
            P1 = p0 + T * (t1 - 0.02) + U * q1[0] + V * q1[1]
            pc.append(_tubo_reto(P0, P1, 0.008, 5))
    return pc


def _cabeca_movel(i, x, z_pivo, pai):
    """Cabeça móvel pendurada: base fixa (fica na treliça) + garfo (nó cabeca_movel_i) + cabeça (nó inclina_i)."""
    fixo = []
    # suporte ômega preso nos banzos de baixo e corpo da base (de cabeça para baixo)
    fixo.append(B.caixa('omega', 0.32, 0.06, 0.012, mat='metal_preto', chanfro=0.002, seg=1, centro=(x, 0, z_pivo + 0.13)))
    for sy in (-1, 1):
        fixo.append(B.cilindro('grampo', 0.032, 0.05, n=12, mat='metal_preto', chanfro=0.004))
        B.girar(fixo[-1], (0, 90, 0))
        B.mover(fixo[-1], (x - 0.025, sy * 0.12, z_pivo + 0.16))
    fixo.append(B.caixa('base', 0.3, 0.24, 0.115, mat='plastico_preto', chanfro=0.02, seg=2, centro=(x, 0, z_pivo + 0.01)))
    fixo.append(B.caixa('visor', 0.08, 0.004, 0.03, mat='tela_cdj', centro=(x, -0.121, z_pivo + 0.05)))
    # garfo (gira em torno de Y no glTF): barra de cima e dois braços
    g = []
    g.append(B.cilindro('rolamento', 0.07, 0.02, n=20, mat='metal_preto', chanfro=0.004, centro=(0, 0, -0.01)))
    g.append(B.caixa('garfo_topo', 0.29, 0.09, 0.035, mat='plastico_preto', chanfro=0.012, seg=2, centro=(0, 0, -0.045)))
    for sx in (-1, 1):
        braco = B.caixa('braco', 0.035, 0.09, 0.25, mat='plastico_preto', chanfro=0.012, seg=2, centro=(sx * 0.128, 0, -0.285))
        g.append(braco)
    garfo = B.juntar(f'cabeca_movel_{i}', g)
    garfo.parent = pai
    garfo.location = (x, 0, z_pivo)
    # cabeça (inclina em torno de X): cilindro com a lente para baixo
    h = []
    h.append(B.torno('cabeca', [(0, 0.115), (0.075, 0.115), (0.092, 0.09), (0.098, 0.0), (0.09, -0.08), (0.085, -0.105), (0.0, -0.105)],
                     n=18, mat='plastico_preto', suave=40))
    h.append(B.torno('aro_lente', [(0.083, -0.1), (0.083, -0.115), (0.068, -0.118), (0.064, -0.112)], n=18, mat='metal_preto', suave=40))
    h.append(B.torno('lente', [(0.064, -0.112), (0.03, -0.119), (0, -0.12)], n=18, mat='lente_movel', suave=True))
    for sx in (-1, 1):
        h.append(B.cilindro('eixo', 0.03, 0.02, n=14, mat='metal_preto', chanfro=0.004))
        B.girar(h[-1], (0, 90, 0))
        B.mover(h[-1], (sx * 0.1 - (0.02 if sx > 0 else 0) + (0.02 if sx > 0 else 0) - (0.0 if sx > 0 else 0.02), 0, 0))
    cab = B.juntar(f'inclina_{i}', h)
    cab.parent = garfo
    cab.location = (0, 0, -0.235)
    return fixo


def trelica_luzes():
    """Pórtico de treliça de alumínio (6 m de vão x 3,5 m) com seis cabeças móveis penduradas."""
    pc = []
    Hh = 3.5
    lado = 0.29
    vao = 6.0
    xt = vao / 2
    zc = Hh - lado / 2
    for sx in (-1, 1):
        x = sx * xt
        pc += _modulo_trelica((x, 0, 0.03), (x, 0, zc - lado / 2), lado, eixo_lateral=(1, 0, 0))
        # base e cubo de canto
        pc.append(B.caixa('base', 0.6, 0.6, 0.012, mat='aco_galvanizado', chanfro=0.003, seg=1, centro=(x, 0, 0)))
        pc.append(B.caixa('pe', 0.29, 0.29, 0.02, mat='aluminio', chanfro=0.004, seg=1, centro=(x, 0, 0.012)))
        pc.append(B.caixa('canto', lado, lado, lado, mat='aluminio_escovado', chanfro=0.02, seg=2, centro=(x, 0, zc - lado / 2)))
    pc += _modulo_trelica((-xt + lado / 2, 0, zc), (xt - lado / 2, 0, zc), lado, eixo_lateral=(0, 1, 0))
    raiz = B.juntar('trelica_luzes', pc)
    z_pivo = zc - lado / 2 - 0.135
    fixos = []
    for i in range(6):
        x = -2.5 + i * 1.0
        fixos += _cabeca_movel(i + 1, x, z_pivo, raiz)
    base_fixa = B.juntar('fixos', fixos)
    # junta as partes fixas no nó raiz, preservando os filhos
    import bpy
    filhos = list(raiz.children)
    for f in filhos:
        f.parent = None
    raiz = B.juntar('trelica_luzes', [raiz, base_fixa])
    for f in filhos:
        f.parent = raiz
    return raiz


# ----------------------------------------------------------------- painel de LED

def painel_led():
    """Painel de LED de 3 x 2 m (24 gabinetes de 0,5 m) em estrutura de chão; tela em tela_led com UV de 0 a 1."""
    pc = []
    Wp, Hp = 3.0, 2.0
    z0 = 0.62
    yf = 0.0
    # tela: um quadrilátero com UV de 0 a 1 (u da esquerda para a direita de quem olha, v de baixo para cima)
    nx, nz = 12, 8
    P = np.zeros((nz + 1, nx + 1, 3))
    UV = np.zeros((nz + 1, nx + 1, 2))
    for j in range(nz + 1):
        for i in range(nx + 1):
            P[j, i] = (-Wp / 2 + Wp * i / nx, yf - 0.006, z0 + Hp * j / nz)
            UV[j, i] = (i / nx, j / nz)
    tela = B.grade('tela', P, mat='tela_led', uv=UV, suave=True)
    pc.append(tela)
    # gabinetes atrás da tela
    for i in range(6):
        for j in range(4):
            x = -Wp / 2 + 0.25 + i * 0.5
            z = z0 + j * 0.5
            pc.append(B.caixa('gab', 0.494, 0.075, 0.494, mat='metal_preto', chanfro=0.006, seg=1, centro=(x, yf + 0.0575, z + 0.003)))
            pc.append(B.caixa('alca', 0.12, 0.02, 0.025, mat='plastico_preto', centro=(x, yf + 0.105, z + 0.4)))
    # moldura fina em volta
    for (cx, cz, sx, sz) in ((0, z0 - 0.02, Wp + 0.03, 0.023), (0, z0 + Hp - 0.003, Wp + 0.03, 0.045),
                             (-Wp / 2 - 0.008, z0, 0.015, Hp), (Wp / 2 + 0.008, z0, 0.015, Hp)):
        pc.append(B.caixa('moldura', sx, 0.1, sz, mat='metal_preto', chanfro=0.003, seg=1, centro=(cx, yf + 0.038, cz)))
    # estrutura: dois montantes, travessa de cima, pés com estabilizadores e mãos-francesas
    for sx in (-1, 1):
        x = sx * (Wp / 2 + 0.06)
        pc.append(B.caixa('montante', 0.08, 0.08, z0 + Hp + 0.12, mat='metal_preto', chanfro=0.006, seg=1, centro=(x, yf + 0.05, 0.0)))
        pc.append(B.caixa('pe', 0.08, 1.3, 0.06, mat='metal_preto', chanfro=0.006, seg=1, centro=(x, yf + 0.2, 0.0)))
        for sy in (-1, 1):
            pc.append(B.cilindro('sapata', 0.04, 0.012, n=10, mat='borracha', centro=(x, yf + 0.2 + sy * 0.6, -0.012)))
        p0 = np.array([x, yf + 0.8, 0.06])
        p1 = np.array([x, yf + 0.09, 1.6])
        br = B.caixa('mao_francesa', 0.05, 0.05, np.linalg.norm(p1 - p0), mat='metal_preto', chanfro=0.004, seg=1)
        B.orientar(br, tuple(p0), tuple(p1 - p0))
        pc.append(br)
    pc.append(B.caixa('travessa', Wp + 0.2, 0.08, 0.08, mat='metal_preto', chanfro=0.006, seg=1, centro=(0, yf + 0.05, z0 + Hp + 0.04)))
    pc.append(B.caixa('travessa_b', Wp + 0.2, 0.08, 0.06, mat='metal_preto', chanfro=0.006, seg=1, centro=(0, yf + 0.05, z0 - 0.08)))
    ob = B.juntar('painel_led', pc)
    B.mover(ob, (0, 0, 0.012))
    return ob


# ----------------------------------------------------------------- laser, fumaça, bastão

def emissor_laser():
    """Projetor de laser compacto numa alça em U; a luz sai pela frente (+Z), no filho vazio saida."""
    pc = []
    W, D, H = 0.24, 0.2, 0.11
    zc = 0.11
    corpo = B.caixa('corpo', W, D, H, mat='metal_preto', chanfro=0.01, seg=2, centro=(0, 0, zc))
    pc.append(corpo)
    # aletas de dissipação atrás
    for k in range(9):
        pc.append(B.caixa('aleta', 0.004, 0.03, H - 0.02, mat='aluminio_escovado', chanfro=0.001, seg=1, centro=(-0.09 + k * 0.0225, D / 2 + 0.012, zc + 0.01)))
    # janela da saída na frente (-Y)
    pc.append(B.caixa('moldura', 0.06, 0.014, 0.036, mat='plastico_preto', chanfro=0.005, seg=1, centro=(0.0, -D / 2 - 0.005, zc + 0.034)))
    pc.append(B.caixa('janela', 0.032, 0.004, 0.014, mat='abertura_laser', chanfro=0.001, seg=1, centro=(0.0, -D / 2 - 0.011, zc + 0.045)))
    # LEDzinhos e botões
    pc += _botoes([(0.07 + k * 0.018, -D / 2 - 0.002, zc + 0.03) for k in range(3)], mat='plastico_cinza', r=0.004, h=0.004)
    for b in pc[-3:]:
        B.girar(b, (90, 0, 0), centro=tuple(B.verts(b).mean(axis=0)))
    # alça em U e base
    for sx in (-1, 1):
        pc.append(B.caixa('alca', 0.008, 0.06, 0.13, mat='metal_preto', chanfro=0.002, seg=1, centro=(sx * (W / 2 + 0.008), 0, 0.012)))
        pc.append(B.cilindro('manopla', 0.016, 0.018, n=12, mat='plastico_preto', chanfro=0.003))
        B.girar(pc[-1], (0, 90, 0))
        B.mover(pc[-1], (sx * (W / 2 + 0.012) + (0 if sx > 0 else -0.018), 0, zc + 0.055))
    pc.append(B.caixa('base', W + 0.03, 0.08, 0.012, mat='metal_preto', chanfro=0.003, seg=1, centro=(0, 0, 0)))
    ob = B.juntar('emissor_laser', pc)
    B.vazio('saida', (0.0, -D / 2 - 0.012, zc + 0.042), pai=ob)
    return ob


def maquina_fumaca():
    """Máquina de fumaça com bocal na frente (+Z), alça, frestas e galão de fluido ao lado."""
    pc = []
    L, W, H = 0.25, 0.42, 0.18
    zc = 0.015
    pc.append(B.caixa('corpo', L, W, H, mat='metal_preto', chanfro=0.012, seg=2, centro=(0, 0, zc)))
    for sx in (-1, 1):
        for k in range(8):
            pc.append(B.caixa('fresta', 0.003, 0.025, 0.08, mat='plastico_preto', centro=(sx * (L / 2 + 0.0005), -0.12 + k * 0.035, zc + 0.05)))
    # bocal
    pc.append(B.cilindro('bocal', 0.024, 0.05, n=16, mat='aluminio_escovado', chanfro=0.004, r2=0.02))
    B.girar(pc[-1], (90, 0, 0))
    B.mover(pc[-1], (0, -W / 2 + 0.005, zc + 0.09))
    pc.append(B.toro('saida_esc', 0.016, 0.005, nu=16, nv=6, mat='plastico_preto'))
    B.girar(pc[-1], (90, 0, 0))
    B.mover(pc[-1], (0, -W / 2 - 0.044, zc + 0.09))
    # alça
    pc.append(B.tubo('alca', [(0, -0.12, zc + H), (0, -0.1, zc + H + 0.05), (0, 0.1, zc + H + 0.05), (0, 0.12, zc + H)], 0.011, n=8, mat='plastico_preto'))
    # painel atrás e pés
    pc.append(B.caixa('painel', 0.12, 0.006, 0.06, mat='plastico_cinza', chanfro=0.002, seg=1, centro=(0, W / 2 + 0.002, zc + 0.06)))
    for sx in (-1, 1):
        for sy in (-1, 1):
            pc.append(B.cilindro('pe', 0.014, 0.015, n=10, mat='borracha', centro=(sx * 0.09, sy * 0.17, 0)))
    # galão de fluido e mangueirinha
    gal = B.caixa('galao', 0.11, 0.08, 0.2, mat='plastico_branco', chanfro=0.02, seg=2, centro=(0.2, 0.1, 0))
    pc.append(gal)
    pc.append(B.cilindro('tampa', 0.016, 0.02, n=12, mat='plastico_azul', chanfro=0.004, centro=(0.2, 0.1, 0.2)))
    pc.append(B.tubo('mang', [(0.2, 0.1, 0.22), (0.18, 0.12, 0.27), (0.1, 0.15, 0.25), (0.07, 0.15, 0.2)], 0.004, n=6, mat='plastico_branco'))
    ob = B.juntar('maquina_fumaca', pc)
    B.vazio('saida', (0, -W / 2 - 0.05, zc + 0.09), pai=ob)
    return ob


def bastao_neon():
    """Bastão de luz de segurar: cabo preto e tubo luminoso (material neon); origem na mão, luz em +Y."""
    pc = []
    cabo = B.torno('cabo', [(0, -0.07), (0.016, -0.07), (0.018, -0.065), (0.016, -0.03), (0.017, 0.03), (0.019, 0.05), (0.014, 0.055), (0.0, 0.055)],
                   n=16, mat='plastico_preto_fosco', suave=40)
    B.deformar(cabo, lambda v: v * (1 + 0.04 * (np.sin(v[:, 2] * 250) > 0.3) * (np.abs(v[:, 2]) < 0.03))[:, None] * np.array([1, 1, 0]) + np.column_stack([np.zeros(len(v)), np.zeros(len(v)), v[:, 2]]))
    pc.append(cabo)
    pc.append(B.cilindro('botao', 0.005, 0.006, n=8, mat='plastico_cinza', centro=(0.0, 0, 0)))
    B.girar(pc[-1], (90, 0, 0))
    B.mover(pc[-1], (0, -0.016, 0.02))
    perfil = [(0.0115, 0.05)] + [(0.0115, z) for z in np.linspace(0.07, 0.33, 5)] + [(0.0115 * math.cos(t), 0.33 + 0.0115 * math.sin(t)) for t in np.linspace(0.3, math.pi / 2, 4)]
    perfil[-1] = (0, perfil[-1][1])
    pc.append(B.torno('tubo', perfil, n=14, mat='neon', suave=True))
    return B.juntar('bastao_neon', pc)


ADERECOS = [
    ('cabine_dj', cabine_dj, 'Cabine de DJ (2,2 x 0,75 x 1,0 m): frente com faixas de LED (led_cabine), dois players, mixer, notebook no suporte, fones e cabos.',
     'a frente com o LED olha para +Z (público); o DJ fica em -Z; telas dos aparelhos em tela_cdj e tela_notebook (emissivos fracos)'),
    ('caixa_som_grande', caixa_som_grande, 'Torre de caixas de som de show (~1,9 m): subwoofer embaixo e duas caixas de médio/agudo em cima.',
     'os alto-falantes olham para +Z'),
    ('trelica_luzes', trelica_luzes, 'Pórtico de treliça de alumínio (6 m de vão entre as torres, 3,5 m de altura) com seis cabeças móveis penduradas.',
     'cabeca_movel_1..6: pivô no topo do garfo (sob a base presa na treliça); girar rotation.y para o pan. Cada uma tem o filho inclina_N (eixo da cabeça, entre os braços do garfo, 0,235 m abaixo do pivô): girar rotation.x para o tilt. Na posição neutra a lente (lente_movel) aponta para -Y; a face da lente fica 0,12 m abaixo do eixo do inclina_N. Se girar só o cabeca_movel_N em qualquer direção, garfo e cabeça giram juntos e a lente segue o -Y local'),
    ('painel_led', painel_led, 'Painel de LED de 3 x 2 m (24 gabinetes de 0,5 m) sobre estrutura de chão, tela de 0,63 a 2,63 m de altura.',
     'a tela (material tela_led, emissivo) é uma grade plana de 12 x 8 quadrados virada para +Z, com UV de 0 a 1 na tela inteira: no arquivo glTF v = 0 é a beira de cima (convenção do glTF), então uma textura de vídeo do three com flipY = false aparece em pé; u cresce da esquerda para a direita de quem olha'),
    ('emissor_laser', emissor_laser, 'Projetor de laser compacto (preto, com aletas) numa alça em U; janela de saída na frente.',
     'filho vazio saida no meio da janela; o feixe sai para +Z; a janela usa abertura_laser (emissivo)'),
    ('maquina_fumaca', maquina_fumaca, 'Máquina de fumaça com bocal na frente, alça e galão de fluido ao lado.',
     'filho vazio saida na ponta do bocal; a fumaça sai para +Z'),
    ('bastao_neon', bastao_neon, 'Bastão de luz de segurar (~0,4 m): cabo preto e tubo luminoso verde (material neon).',
     'origem no ponto da mão (meio do cabo), tubo luminoso em +Y'),
]
