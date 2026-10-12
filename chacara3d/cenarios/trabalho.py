"""Adereços dos trabalhadores: limpar a chácara, colher frutas e cortar grama."""
import math

import numpy as np

import base as B
from base import TAU


# ----------------------------------------------------------------- peças comuns

def _roda(r, larg, n=24, mat_pneu='borracha', mat_cubo='plastico_cinza', cravos=True, raios=0):
    """Roda com eixo em X, centro na origem: pneu com banda de rodagem e cubo."""
    w = larg / 2
    perfil = [(r * 0.62, -w * 0.92), (r * 0.80, -w), (r * 0.94, -w * 0.96), (r, -w * 0.62), (r, w * 0.62),
              (r * 0.94, w * 0.96), (r * 0.80, w), (r * 0.62, w * 0.92)]
    pneu = B.torno('pneu', perfil, n=n * 2, mat=mat_pneu, suave=45)
    if cravos:
        def banda(v):
            a = np.arctan2(v[:, 1], v[:, 0])
            rr = np.hypot(v[:, 0], v[:, 1])
            sobe = (rr > r * 0.97) & (np.abs(v[:, 2]) < w * 0.7)
            k = (np.cos(a * n + np.sign(v[:, 2]) * 0.8) > 0.2)
            esc = 1 + 0.035 * (sobe & k)
            return np.column_stack([v[:, 0] * esc, v[:, 1] * esc, v[:, 2]])
        B.deformar(pneu, banda)
    cubo = B.torno('cubo', [(0, -w * 0.75), (r * 0.62, -w * 0.88), (r * 0.6, -w * 0.5), (r * 0.3, -w * 0.45), (r * 0.18, -w * 1.05),
                            (0, -w * 1.08)], n=n, mat=mat_cubo, suave=40)
    cubo2 = B.copiar(cubo)
    B.escalar(cubo2, (1, 1, -1))
    pc = [pneu, cubo, cubo2]
    ob = B.juntar('roda', pc)
    B.girar(ob, (0, 90, 0))
    return ob


# ----------------------------------------------------------------- cortador de grama

def _casco_contorno(s, zf):
    """Contorno do casco (retângulo arredondado) escalado por s."""
    a, b = 0.255 * s, 0.30 * s
    rc = 0.11 * s
    P, N, _ = _ret(a, b, rc)
    return P


def _ret(a, b, rc, nl=6, nc=6):
    pts, nrm = [], []
    cs = [(a - rc, b - rc, 0), (-(a - rc), b - rc, 90), (-(a - rc), -(b - rc), 180), (a - rc, -(b - rc), 270)]
    lados = [((a, -(b - rc)), (a, b - rc), (1, 0)), ((a - rc, b), (-(a - rc), b), (0, 1)),
             ((-a, b - rc), (-a, -(b - rc)), (-1, 0)), ((-(a - rc), -b), (a - rc, -b), (0, -1))]
    for k in range(4):
        p0, p1, nv = lados[k]
        for t in np.linspace(0, 1, nl, endpoint=False):
            pts.append((p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t))
            nrm.append(nv)
        cx, cy, ang = cs[k]
        for t in np.linspace(0, 90, nc, endpoint=False):
            r = math.radians(ang + t)
            pts.append((cx + rc * math.cos(r), cy + rc * math.sin(r)))
            nrm.append((math.cos(r), math.sin(r)))
    return np.array(pts), np.array(nrm), None


def cortador_grama():
    pc = []
    # casco (deck): saia vertical, ombro arredondado, topo abaulado
    linhas = [(1.0, 0.045), (1.0, 0.11), (0.985, 0.135), (0.95, 0.16), (0.88, 0.185), (0.78, 0.203),
              (0.62, 0.215), (0.45, 0.22)]
    P = []
    for s, z in linhas:
        c = _casco_contorno(s, z)
        P.append(np.column_stack([c[:, 0], c[:, 1] - 0.0, np.full(len(c), z)]))
    # lábio virado para dentro embaixo
    c = _casco_contorno(0.96, 0.04)
    P.insert(0, np.column_stack([c[:, 0], c[:, 1], np.full(len(c), 0.042)]))
    P = np.array(P)
    casco = B.grade('casco', P, fechar_u=True, tampa_fim=True, mat='aco_verde', suave=50)
    pc.append(casco)
    # descarga traseira (boca para o coletor)
    pc.append(B.caixa('boca', 0.3, 0.06, 0.11, mat='aco_verde', chanfro=0.015, seg=2, centro=(0, 0.3, 0.06)))
    # rodas: dianteiras menores
    for sx in (-1, 1):
        rf = _roda(0.09, 0.045, n=20)
        B.mover(rf, (sx * 0.28, -0.2, 0.09))
        rt = _roda(0.11, 0.05, n=22)
        B.mover(rt, (sx * 0.285, 0.21, 0.11))
        pc += [rf, rt]
        # eixos e alavancas de altura
        pc.append(B.cilindro('eixo', 0.009, 0.03, n=8, mat='aco_inox', centro=(0, 0, 0)))
        B.girar(pc[-1], (0, 90, 0))
        B.mover(pc[-1], (sx * 0.255, -0.2, 0.09))
        pc.append(B.caixa('alav', 0.012, 0.03, 0.09, mat='plastico_preto', chanfro=0.004, seg=1, centro=(sx * 0.262, 0.17, 0.11)))
        B.girar(pc[-1], (-25, 0, 0), centro=(sx * 0.262, 0.17, 0.11))
    # motor: bloco de alumínio, capa preta, partida retrátil, tanque, filtro, escape
    zb = 0.215
    pc.append(B.caixa('bloco', 0.22, 0.2, 0.075, mat='motor_cinza', chanfro=0.014, seg=2, centro=(0, 0.02, zb)))
    for k in range(6):
        pc.append(B.caixa('aleta', 0.004, 0.12, 0.09, mat='motor_cinza', chanfro=0.0015, seg=1, centro=(0.115 + k * 0.009, -0.005, zb + 0.03)))
    capa = B.caixa('capa', 0.27, 0.25, 0.13, mat='plastico_preto', chanfro=0.045, seg=3, centro=(-0.01, 0.03, zb + 0.07))
    pc.append(capa)
    pc.append(B.cilindro('partida', 0.07, 0.03, n=28, mat='plastico_preto', chanfro=0.008, centro=(-0.01, 0.03, zb + 0.195)))
    for k in range(10):
        a = k / 10 * TAU
        pc.append(B.caixa('nerv', 0.006, 0.05, 0.004, mat='plastico_preto_fosco', centro=(-0.01 + 0.035 * math.cos(a), 0.03 + 0.035 * math.sin(a), zb + 0.224)))
        B.girar(pc[-1], (0, 0, math.degrees(a) + 90), centro=(-0.01 + 0.035 * math.cos(a), 0.03 + 0.035 * math.sin(a), zb + 0.224))
    # tanque e tampa vermelha
    pc.append(B.caixa('tanque', 0.13, 0.09, 0.07, mat='plastico_preto_fosco', chanfro=0.025, seg=2, centro=(-0.075, -0.095, zb + 0.08)))
    pc.append(B.cilindro('tampa_tanque', 0.022, 0.022, n=16, mat='plastico_vermelho', chanfro=0.004, centro=(-0.075, -0.1, zb + 0.145)))
    # filtro de ar (lado esquerdo), vela e cachimbo, tampa do óleo
    pc.append(B.caixa('filtro', 0.07, 0.11, 0.1, mat='plastico_preto_fosco', chanfro=0.015, seg=2, centro=(-0.16, 0.0, zb + 0.02)))
    pc.append(B.cilindro('cachimbo', 0.012, 0.05, n=10, mat='borracha', chanfro=0.003, centro=(0.07, -0.11, zb + 0.06)))
    B.girar(pc[-1], (60, 0, 0), centro=(0.07, -0.11, zb + 0.06))
    pc.append(B.cilindro('oleo', 0.015, 0.03, n=12, mat='plastico_amarelo', chanfro=0.003, centro=(0.1, -0.12, zb - 0.0)))
    # escapamento com protetor
    pc.append(B.caixa('escape', 0.07, 0.14, 0.07, mat='metal_preto', chanfro=0.012, seg=2, centro=(0.175, 0.07, zb + 0.005)))
    for k in range(5):
        pc.append(B.caixa('fresta', 0.002, 0.11, 0.006, mat='plastico_preto', centro=(0.211, 0.07, zb + 0.015 + k * 0.011)))
    # alça (guidão): dois tubos que sobem da traseira até a barra de pegar (0,95 m)
    yb, zb2 = 0.27, 0.17
    yt, zt = 0.86, 0.95
    xg = 0.215
    raio_canto = 0.06

    def lado(sx):
        return [(sx * 0.2, yb, zb2), (sx * 0.205, yb + 0.15, zb2 + 0.2), (sx * 0.21, 0.6, 0.6), (sx * xg, yt - 0.02, zt - 0.06)]
    caminho = []
    esq = lado(-1)
    dir_ = lado(1)
    caminho += esq
    for t in np.linspace(0, math.pi / 2, 5)[1:]:
        caminho.append((-xg + raio_canto * (1 - math.cos(t)), yt - 0.02 + 0.02 * math.sin(t), zt - 0.06 + raio_canto * math.sin(t)))
    for t in np.linspace(0, math.pi / 2, 5)[:-1][::-1]:
        caminho.append((xg - raio_canto * (1 - math.cos(t)), yt - 0.02 + 0.02 * math.sin(t), zt - 0.06 + raio_canto * math.sin(t)))
    caminho += dir_[::-1]
    caminho = np.array(caminho)
    # reamostra suave
    s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(caminho, axis=0), axis=1))])
    ss = np.linspace(0, s[-1], 60)
    cam = np.column_stack([np.interp(ss, s, caminho[:, i]) for i in range(3)])
    pc.append(B.tubo('guidao', cam, 0.0125, n=10, mat='metal_preto'))
    # manopla de espuma na barra de cima
    xs = np.linspace(-xg + raio_canto, xg - raio_canto, 8)
    pc.append(B.tubo('manopla', np.column_stack([xs, np.full(8, yt), np.full(8, zt)]), 0.017, n=12, mat='borracha'))
    # alavanca de segurança (vermelha), presa um pouco abaixo e à frente da barra
    al = [(-xg + 0.005, yt - 0.03, zt - 0.08), (-xg + 0.02, yt - 0.065, zt - 0.02), (-0.15, yt - 0.075, zt - 0.005),
          (0.15, yt - 0.075, zt - 0.005), (xg - 0.02, yt - 0.065, zt - 0.02), (xg - 0.005, yt - 0.03, zt - 0.08)]
    pc.append(B.tubo('alavanca', al, 0.0065, n=8, mat='aco_vermelho'))
    # borboletas que unem as duas partes da alça
    for sx in (-1, 1):
        pc.append(B.cilindro('borb', 0.018, 0.022, n=12, mat='plastico_preto', chanfro=0.004))
        B.girar(pc[-1], (0, 90, 0))
        B.mover(pc[-1], (sx * 0.235, 0.6, 0.6))
    # cabo do acelerador e corda da partida
    cab = np.array([(xg, yt - 0.04, zt - 0.09), (0.2, 0.62, 0.58), (0.17, 0.3, 0.3), (0.12, 0.1, 0.27)])
    pc.append(B.tubo('cabo', cab, 0.003, n=5, mat='plastico_preto'))
    pc.append(B.caixa('puxador', 0.08, 0.02, 0.022, mat='plastico_preto', chanfro=0.008, seg=2, centro=(0.205, 0.6, 0.63)))
    # coletor de grama atrás: armação e saco de lona
    nx, ny, nz = 8, 8, 6
    cx = 0.0
    W, Lc, Hc = 0.36, 0.44, 0.3
    y0 = 0.33
    caixa = B.caixa('coletor', W, Lc, Hc, mat='lona_coletor', chanfro=0.07, seg=3, centro=(0, y0 + Lc / 2, 0.05))
    B.deformar(caixa, lambda v: np.column_stack([v[:, 0] * (1 + 0.06 * np.sin((v[:, 1] - y0) / Lc * math.pi)),
                                                 v[:, 1],
                                                 v[:, 2] - 0.05 * ((v[:, 1] - y0) / Lc) ** 2 * (v[:, 2] < 0.2) + 0.006 * B.ruido3(v, 25, 2)]))
    pc.append(caixa)
    tampa = B.caixa('tampa_col', W + 0.02, 0.2, 0.03, mat='plastico_preto', chanfro=0.012, seg=2, centro=(0, y0 + 0.1, 0.34))
    pc.append(tampa)
    pc.append(B.tubo('alca_col', [(-0.08, y0 + 0.12, 0.37), (-0.06, y0 + 0.12, 0.41), (0.06, y0 + 0.12, 0.41), (0.08, y0 + 0.12, 0.37)], 0.008, n=8, mat='plastico_preto'))
    ob = B.juntar('cortador_grama', pc)
    # quem empurra fica atrás (+Y no Blender = -Z no glTF) olhando para a frente: mão direita em -X
    B.vazio('pega_d', (-0.13, yt, zt), pai=ob)
    B.vazio('pega_e', (0.13, yt, zt), pai=ob)
    return ob


# ----------------------------------------------------------------- ferramentas de cabo

def _cabo(z0, z1, r=0.0145, mat='madeira_cabo'):
    pts = np.column_stack([np.zeros(6), np.zeros(6), np.linspace(z0, z1, 6)])
    c = B.tubo('cabo', pts, r, n=10, mat=mat, tampas=True)
    tp = B.esfera('ponta', r * 1.02, nu=10, nv=4, mat=mat, centro=(0, 0, z1), esc=(1, 1, 0.5))
    return [c, tp]


def rastelo():
    """Rastelo (ancinho de dentes retos) de 1,6 m; os dentes apontam para -Z (glTF)."""
    pc = []
    zc = -1.0                       # ponta de baixo do cabo
    pc += _cabo(zc + 0.08, 0.6)
    # bocal (encaixe do cabo) e pescoço
    pc.append(B.cilindro('bocal', 0.018, 0.13, n=10, mat='metal_preto', r2=0.016, centro=(0, 0, zc - 0.03)))
    pc.append(B.tubo('pescoco', [(0, 0, zc - 0.02), (0, 0.004, zc - 0.06), (0, 0.012, zc - 0.085)], 0.011, n=8, mat='metal_preto'))
    # travessa e dentes (curvados para +Y no Blender)
    zt = zc - 0.09
    pc.append(B.caixa('travessa', 0.37, 0.022, 0.012, mat='metal_preto', chanfro=0.003, seg=1, centro=(0, 0.012, zt - 0.006)))
    n = 14
    for k in range(n):
        x = -0.17 + k * 0.34 / (n - 1)
        t = np.linspace(0, 1, 6)
        pts = np.column_stack([np.full(6, x), 0.012 + 0.075 * t ** 1.2, zt - 0.002 - 0.018 * t ** 2.2])
        pc.append(B.tubo('dente', pts, np.linspace(0.0042, 0.0028, 6), n=5, mat='metal_preto'))
    ob = B.juntar('rastelo', pc)
    B.vazio('pega_d', (0, 0, 0), pai=ob)
    B.vazio('pega_e', (0, 0, 0.5), pai=ob)
    return ob


def vassoura():
    """Vassoura de jardim (leque de lâminas de aço), cabo de madeira; as pontas curvam para -Z (glTF)."""
    pc = []
    zc = -0.72
    pc += _cabo(zc, 0.5)
    pc.append(B.cilindro('virola', 0.017, 0.09, n=10, mat='aco_galvanizado', r2=0.016, centro=(0, 0, zc - 0.06)))
    n = 20
    L = 0.46
    for k in range(n):
        u = k / (n - 1) - 0.5
        ang = u * math.radians(62)
        t = np.linspace(0, 1, 7)
        r = 0.02 + L * t
        x = np.sin(ang) * r * (1 + 0.08 * t)
        z = zc - 0.06 - np.cos(ang) * r
        y = 0.0 + 0.05 * np.clip((t - 0.82) / 0.18, 0, 1) ** 1.5 + 0.004 * t
        pts = np.column_stack([x, y, z])
        pc.append(B.fita('lamina', pts, 0.009, espessura=0.0012, mat='aco_galvanizado', cima=(0, 1, 0)))
    # arame que amarra as lâminas
    ts = np.linspace(-0.5, 0.5, 20)
    arame = []
    for u in ts:
        ang = u * math.radians(62)
        r = 0.02 + L * 0.42
        arame.append((math.sin(ang) * r * 1.034, 0.003, zc - 0.06 - math.cos(ang) * r))
    pc.append(B.tubo('arame', arame, 0.0022, n=5, mat='aco_galvanizado'))
    # placa de fixação das lâminas no cabo
    pc.append(B.caixa('placa', 0.07, 0.012, 0.05, mat='aco_galvanizado', chanfro=0.003, seg=1, centro=(0, 0, zc - 0.11)))
    ob = B.juntar('vassoura', pc)
    B.vazio('pega_d', (0, 0, 0), pai=ob)
    B.vazio('pega_e', (0, 0, 0.42), pai=ob)
    return ob


def peneira_piscina():
    """Vara telescópica de alumínio (~3 m) com peneira de folhas na ponta."""
    pc = []
    z_baixo = -2.18
    z_cima = 0.8
    meio = -0.7
    # seção grossa embaixo, fina em cima (encaixada), com trava azul no meio
    pc.append(B.cilindro('vara1', 0.016, meio - z_baixo, n=12, mat='aluminio', centro=(0, 0, z_baixo)))
    pc.append(B.cilindro('vara2', 0.0135, z_cima - meio, n=12, mat='aluminio', centro=(0, 0, meio)))
    pc.append(B.cilindro('trava', 0.021, 0.07, n=14, mat='plastico_azul', chanfro=0.006, centro=(0, 0, meio - 0.05)))
    pc.append(B.cilindro('tampa', 0.0155, 0.04, n=12, mat='plastico_azul', chanfro=0.004, centro=(0, 0, z_cima - 0.03)))
    # cabeça da peneira: aro plano no plano XZ, saindo da ponta de baixo
    zp = z_baixo - 0.06
    pc.append(B.cilindro('encaixe', 0.021, 0.12, n=12, mat='plastico_azul', chanfro=0.005, centro=(0, 0, zp)))
    a = np.linspace(0, TAU, 40, endpoint=False)
    w, L = 0.22, 0.2
    # aro em "D": reto perto do encaixe, arredondado na ponta
    aro = []
    for t in a:
        x = w * math.cos(t)
        z = L * math.sin(t)
        if z > 0:
            z *= 0.25
        aro.append((x, 0.0, zp - 0.02 - L * 0.25 + z - 0.0))
    aro = np.array(aro)
    aro[:, 2] = np.minimum(aro[:, 2], zp - 0.02)
    pc.append(B.tubo('aro', aro, 0.009, n=8, mat='plastico_azul', fechado=True))
    # rede: bolsa rasa
    nr = 6
    P = []
    cz = aro[:, 2].mean()
    for i in range(nr):
        s = 1 - i / (nr - 1) * 0.98
        fundo = 0.06 * (1 - s ** 2)
        P.append(np.column_stack([aro[:, 0] * s, np.full(len(aro), fundo), cz + (aro[:, 2] - cz) * s]))
    P = np.array(P)
    rede = B.grade('rede', P, fechar_u=True, mat='tela_peneira', suave=True)
    B.uv_projetar(rede, tile=0.05, modo='plano', eixo='y')
    pc.append(rede)
    ob = B.juntar('peneira_piscina', pc)
    B.vazio('pega_d', (0, 0, 0), pai=ob)
    B.vazio('pega_e', (0, 0, 0.6), pai=ob)
    return ob


# ----------------------------------------------------------------- carrinho de mão

def _folhas_soltas(n, centro, raio, z_de, semente, esc=1.0, espalhar=0.0):
    """Folhas secas (cartões com recorte) espalhadas sobre uma superfície z_de(x, y)."""
    rng = B.rng(semente)
    vs, fs, uvs = [], [], []
    for i in range(n):
        r = raio * math.sqrt(rng.uniform(0, 1)) * (1 + espalhar)
        a = rng.uniform(0, TAU)
        x = centro[0] + r * math.cos(a) * (1.0 if not isinstance(raio, tuple) else 1)
        y = centro[1] + r * math.sin(a)
        z = z_de(x, y) + 0.004
        L = rng.uniform(0.07, 0.11) * esc
        Wd = L * 0.45
        cel = rng.integers(4)
        u0, v0 = (cel % 2) * 0.5, (cel // 2) * 0.5
        rot = rng.uniform(0, TAU)
        incl = rng.normal(0, 0.25, 2)
        curva = rng.uniform(0.005, 0.02)
        base = len(vs)
        # folha dobrada na nervura: 2 x 3 vértices
        for j, tl in enumerate((-0.5, 0.0, 0.5)):
            for k, tw in enumerate((-0.5, 0.0, 0.5)):
                px = tl * L
                py = tw * Wd
                pz = curva * (abs(tw) * 2) + curva * 0.5 * (tl * 2) ** 2
                c, s = math.cos(rot), math.sin(rot)
                X = x + px * c - py * s
                Y = y + px * s + py * c
                Z = z + pz + incl[0] * px + incl[1] * py
                vs.append((X, Y, Z))
                # a folha no atlas está em pé (comprimento em v)
                uvs.append((u0 + 0.5 * (0.5 + tw * 0.62), v0 + 0.5 * (0.5 + tl * 0.92)))
        for j in range(2):
            for k in range(2):
                a0 = base + j * 3 + k
                fs.append([a0, a0 + 1, a0 + 4, a0 + 3])
    return B.malha('folhas', vs, fs, mat='folhas_secas', uv=np.array(uvs), suave=True)


def _monte(rx, ry, h, z0, semente, n=28, nr=9):
    """Monte de folhas (domo calombento) com textura de folhas."""
    P = np.zeros((nr, n, 3))
    a = np.arange(n) / n * TAU
    for i in range(nr):
        s = 1 - i / (nr - 1)
        P[i, :, 0] = rx * s * np.cos(a)
        P[i, :, 1] = ry * s * np.sin(a)
        P[i, :, 2] = z0 + h * (1 - s ** 2) ** 0.8
    P[-1, :, :2] = 0
    ob = B.grade('monte', P, fechar_u=True, mat='folhas_monte', suave=True)
    B.deformar(ob, lambda v: v + np.column_stack([np.zeros(len(v)), np.zeros(len(v)),
                                                  (0.25 * h * B.ruido3(v, 6, semente) + 0.12 * h * B.ruido3(v, 15, semente + 1)) * ((v[:, 2] - z0) > 0.01)]))
    B.uv_projetar(ob, tile=0.3, modo='plano', eixo='z')
    return ob


def carrinho_mao():
    pc = []
    # caçamba: do fundo (pequeno, baixo) até a boca (larga), frente avançando sobre a roda
    def ret(a, b, y0, z, rc):
        P, N, _ = _ret(a, b, rc, nl=5, nc=5)
        return np.column_stack([P[:, 0], P[:, 1] + y0, np.full(len(P), z)])
    fundo = ret(0.17, 0.25, 0.02, 0.33, 0.12)
    boca = ret(0.31, 0.45, -0.07, 0.63, 0.2)
    linhas = []
    for t in np.linspace(0, 1, 6):
        c = fundo * (1 - t) + boca * t
        # bojo: parede abaulada
        c[:, :2] = c[:, :2] + (c[:, :2] - np.array([0, -0.025])) * 0.05 * math.sin(t * math.pi)
        linhas.append(c)
    linhas = np.array(linhas)
    cacamba = B.grade('cacamba', linhas, fechar_u=True, tampa_ini=True, mat='aco_galvanizado', suave=50)
    pc.append(cacamba)
    # parede de dentro (espessura) e borda enrolada
    dentro = B.grade('dentro', linhas[::-1] * np.array([0.985, 0.985, 1]) + np.array([0, -0.0005, 0.0]), fechar_u=True, mat='aco_galvanizado', suave=50)
    pc.append(dentro)
    bd = np.vstack([boca, boca[:1]])
    pc.append(B.tubo('borda', boca, 0.009, n=8, mat='aco_galvanizado', fechado=True))
    # chassi: dois tubos da roda até as manoplas, com pés
    yr, zr = -0.66, 0.19
    for sx in (-1, 1):
        cam = [(sx * 0.04, yr, zr), (sx * 0.12, yr + 0.22, 0.32), (sx * 0.2, 0.0, 0.33), (sx * 0.25, 0.45, 0.43), (sx * 0.28, 0.82, 0.53)]
        cam = np.array(cam)
        s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(cam, axis=0), axis=1))])
        ss = np.linspace(0, s[-1], 20)
        cam = np.column_stack([np.interp(ss, s, cam[:, i]) for i in range(3)])
        pc.append(B.tubo('chassi', cam, 0.0165, n=10, mat='metal_preto'))
        # manopla de borracha
        m = np.array([(sx * 0.272, 0.68, 0.505), (sx * 0.282, 0.84, 0.535)])
        pc.append(B.tubo('manopla', m, 0.021, n=12, mat='borracha'))
        # pé
        pe = [(sx * 0.215, 0.18, 0.37), (sx * 0.235, 0.2, 0.16), (sx * 0.25, 0.22, 0.02), (sx * 0.25, 0.3, 0.02)]
        pc.append(B.tubo('pe', pe, 0.014, n=8, mat='metal_preto'))
        pc.append(B.caixa('sapata', 0.04, 0.1, 0.012, mat='borracha', chanfro=0.004, seg=1, centro=(sx * 0.25, 0.26, 0.0)))
        # garfo da roda
        pc.append(B.tubo('garfo', [(sx * 0.045, yr, zr), (sx * 0.06, yr + 0.12, 0.28)], 0.011, n=8, mat='metal_preto'))
    # travessas sob a caçamba
    pc.append(B.tubo('trav', [(-0.2, 0.0, 0.33), (0.2, 0.0, 0.33)], 0.012, n=8, mat='metal_preto'))
    pc.append(B.tubo('trav', [(-0.25, 0.45, 0.43), (0.25, 0.45, 0.43)], 0.012, n=8, mat='metal_preto'))
    # roda com pneu
    roda = _roda(0.19, 0.085, n=24, mat_cubo='aco_vermelho')
    B.mover(roda, (0, yr, zr))
    pc.append(roda)
    pc.append(B.cilindro('eixo', 0.01, 0.11, n=8, mat='aco_inox'))
    B.girar(pc[-1], (0, 90, 0))
    B.mover(pc[-1], (-0.055, yr, zr))
    # folhas dentro: monte e folhas soltas por cima
    monte = _monte(0.29, 0.42, 0.11, 0.6, 5, n=26, nr=7)
    B.mover(monte, (0, -0.07, 0))
    pc.append(monte)

    def zf(x, y):
        s2 = (x / 0.29) ** 2 + ((y + 0.07) / 0.42) ** 2
        return 0.6 + 0.11 * max(0.0, 1 - s2) ** 0.8
    pc.append(_folhas_soltas(26, (0, -0.07), 0.3, zf, 12))
    ob = B.juntar('carrinho_mao', pc)
    # origem no centro da base (entre a roda e os pés)
    v = B.verts(ob)
    cy = (yr + 0.3) / 2 - 0.0
    B.mover(ob, (0, -cy, 0))
    B.vazio('pega_d', (-0.278, 0.77 - cy, 0.525), pai=ob)
    B.vazio('pega_e', (0.278, 0.77 - cy, 0.525), pai=ob)
    return ob


# ----------------------------------------------------------------- escada

def escada_aluminio():
    """Escada de abrir de alumínio (1,8 m aberta), cinco degraus e plataforma de topo."""
    pc = []
    H = 1.78
    yf, yt = -0.42, 0.4

    def perfil_trilho(p0, p1, larg=0.065, esp=0.022):
        return B.caixa('trilho', esp, larg, np.linalg.norm(np.array(p1) - np.array(p0)), mat='aluminio', chanfro=0.003, seg=1)

    for sx in (-1, 1):
        # trilho da frente (degraus) e de trás
        for (p0, p1) in (((sx * 0.25, yf, 0.0), (sx * 0.2, -0.02, H - 0.08)), ((sx * 0.24, yt, 0.0), (sx * 0.2, 0.06, H - 0.1))):
            t = perfil_trilho(p0, p1)
            B.orientar(t, p0, tuple(np.array(p1) - np.array(p0)), 0)
            pc.append(t)
            pc.append(B.caixa('sapata', 0.05, 0.085, 0.03, mat='borracha', chanfro=0.006, seg=1, centro=(p0[0], p0[1], 0.0)))
        # abridor (barra articulada entre a frente e as costas)
        y1 = yf + (0.0 - yf) * 0.36
        y2 = yt + (0.06 - yt) * 0.36
        pc.append(B.caixa('abridor', 0.006, abs(y2 - y1), 0.022, mat='aco_galvanizado', chanfro=0.002, seg=1, centro=(sx * 0.255, (y1 + y2) / 2 - 0.0, 0.62)))
        pc.append(B.cilindro('rebite', 0.007, 0.012, n=8, mat='aco_inox'))
        B.girar(pc[-1], (0, 90, 0))
        B.mover(pc[-1], (sx * 0.25, (y1 + y2) / 2, 0.632))
    # degraus: plano de pisar com estrias
    for k in range(5):
        z = 0.3 + k * 0.29
        t = z / (H - 0.08)
        y = yf + (-0.02 - yf) * t
        x = 0.25 + (0.2 - 0.25) * t
        pc.append(B.caixa('degrau', 2 * x - 0.02, 0.085, 0.03, mat='aluminio_escovado', chanfro=0.004, seg=1, centro=(0, y + 0.01, z - 0.03)))
        for e in range(4):
            pc.append(B.caixa('estria', 2 * x - 0.05, 0.006, 0.004, mat='aluminio', centro=(0, y - 0.022 + e * 0.017, z)))
    # travessas de trás
    for z in (0.25, 0.9):
        t = z / (H - 0.1)
        y = yt + (0.06 - yt) * t
        x = 0.24 + (0.2 - 0.24) * t
        pc.append(B.caixa('trav', 2 * x - 0.02, 0.03, 0.022, mat='aluminio', chanfro=0.003, seg=1, centro=(0, y, z)))
    # plataforma de topo (plástico) com bandeja de ferramentas
    topo = B.caixa('topo', 0.48, 0.3, 0.06, mat='plastico_cinza', chanfro=0.015, seg=2, centro=(0, 0.02, H - 0.06))
    pc.append(topo)
    pc.append(B.caixa('bandeja', 0.36, 0.18, 0.02, mat='plastico_preto_fosco', chanfro=0.004, seg=1, centro=(0, 0.02, H - 0.012)))
    ob = B.juntar('escada_aluminio', pc)
    v = B.verts(ob)
    B.mover(ob, (0, -(v[:, 1].min() + v[:, 1].max()) / 2, 0))
    return ob


# ----------------------------------------------------------------- frutas

def _manga(rng, semente):
    L, D = 0.12, 0.08
    perfil = [(0, 0)]
    for t in np.linspace(0.05, 0.95, 8):
        r = D / 2 * math.sin(t * math.pi) ** 0.75 * (1 + 0.12 * (t - 0.4))
        perfil.append((r, L * t))
    perfil.append((0, L))
    m = B.torno('manga', perfil, n=12, mat='manga', suave=True)
    B.escalar(m, (1, 0.82, 1))
    # curva de rim (corcunda)
    B.deformar(m, lambda v: np.column_stack([v[:, 0] + 0.012 * np.sin(v[:, 2] / L * math.pi), v[:, 1], v[:, 2]]))
    v = B.verts(m)
    t = v[:, 2] / L
    lado = (v[:, 0] > 0).astype(float)
    verde = np.array([0.07, 0.2, 0.025])
    amarelo = np.array([0.72, 0.38, 0.02])
    vermelho = np.array([0.42, 0.035, 0.025])
    k = np.clip(t * 1.2 + rng.uniform(-0.2, 0.2), 0, 1)[:, None]
    cor = verde * (1 - k) + amarelo * k
    rubor = np.clip((t - 0.35) * 2.2, 0, 1) * lado * rng.uniform(0.5, 1.0)
    cor = cor * (1 - rubor[:, None]) + vermelho * rubor[:, None]
    B.definir_cores(m, cor)
    B.mover(m, (0, 0, -L / 2))
    return m


def _goiaba(rng):
    r = 0.034 * rng.uniform(0.9, 1.1)
    perfil = [(0, -r)] + [(r * math.cos(t) * (1 - 0.12 * max(0, math.sin(t))), r * math.sin(t) * 1.1) for t in np.linspace(-1.3, 1.3, 6)] + [(0, r * 1.15)]
    g = B.torno('goiaba', perfil, n=10, mat='goiaba', suave=True)
    v = B.verts(g)
    cor = np.array([0.24, 0.42, 0.06]) * (1 + 0.18 * B.ruido3(v, 120, int(rng.integers(100)))[:, None])
    cor = cor + np.array([0.3, 0.12, -0.02]) * np.clip(v[:, 2] / r, 0, 1)[:, None] * rng.uniform(0, 1)
    B.definir_cores(g, np.clip(cor, 0, 1))
    return g


def cesto_frutas():
    """Cesto de vime com alça, cheio de mangas e goiabas."""
    pc = []
    rb, rt, h = 0.15, 0.21, 0.18
    fora = B.torno('fora', [(0, 0.0), (rb - 0.01, 0.0), (rb, 0.012), (rt, h)], n=36, mat='vime', suave=50)
    B.uv_cilindrico(fora, tile_u=0.06, tile_v=0.06)
    dentro = B.torno('dentro', [(rt - 0.008, h), (rb - 0.006, 0.02), (0, 0.02)], n=36, mat='vime', suave=50)
    B.uv_cilindrico(dentro, tile_u=0.06, tile_v=0.06)
    pc += [fora, dentro]
    # borda trançada (toro torcido) e base
    borda = B.toro('borda', rt - 0.002, 0.013, nu=64, nv=8, mat='vime',
                   raio_v=lambda a: 0.013 * (0.85 + 0.15 * abs(math.sin(a * 24))))
    B.mover(borda, (0, 0, h))
    B.uv_cilindrico(borda, tile_u=0.06, tile_v=0.06)
    pc.append(borda)
    pe = B.toro('pe', rb - 0.004, 0.009, nu=48, nv=6, mat='vime', centro=(0, 0, 0.009))
    B.uv_cilindrico(pe, tile_u=0.06, tile_v=0.06)
    pc.append(pe)
    # alça em arco (trançado)
    t = np.linspace(0, math.pi, 24)
    arco = np.column_stack([rt * 0.96 * np.cos(t), np.zeros_like(t), h + 0.25 * np.sin(t) ** 0.9])
    alca = B.tubo('alca', arco, 0.012, n=8, mat='vime', torcao=TAU * 10)
    B.uv_projetar(alca, tile=0.06)
    pc.append(alca)
    # frutas em monte
    rng = B.rng(51)
    pos = []
    for i in range(6):
        a = i / 6 * TAU + rng.uniform(-0.2, 0.2)
        pos.append(('manga', 0.11 * math.cos(a), 0.11 * math.sin(a), h - 0.005 + rng.uniform(0, 0.01), a))
    for i in range(5):
        a = i / 5 * TAU + 0.6
        pos.append(('goiaba', 0.06 * math.cos(a), 0.06 * math.sin(a), h + 0.035, a))
    pos.append(('manga', 0.0, 0.01, h + 0.075, 0.4))
    pos.append(('goiaba', 0.16, -0.05, h + 0.02, 0))
    pos.append(('goiaba', -0.15, 0.08, h + 0.02, 0))
    for k, (tipo, x, y, z, a) in enumerate(pos):
        if tipo == 'manga':
            f = _manga(rng, k)
            B.girar(f, (rng.uniform(70, 100), rng.uniform(-20, 20), math.degrees(a) + rng.uniform(60, 120)))
        else:
            f = _goiaba(rng)
            B.girar(f, tuple(rng.uniform(-40, 40, 2)) + (rng.uniform(0, 360),))
        B.mover(f, (x, y, z))
        pc.append(f)
    # folhas de manga
    for k in range(3):
        L = 0.13
        ts = np.linspace(0, 1, 6)
        a = rng.uniform(0, TAU)
        pts = np.column_stack([np.cos(a) * (0.06 + L * ts), np.sin(a) * (0.06 + L * ts), h + 0.05 - 0.04 * ts ** 2])
        pc.append(B.fita('folha', pts, 0.035 * np.sin(np.clip(ts, 0.05, 0.95) * math.pi) ** 0.7 + 0.002, mat='folha_verde', cima=(0, 0, 1)))
    return B.juntar('cesto_frutas', pc)


# ----------------------------------------------------------------- mangueira

def mangueira_enrolada():
    """Carretel de mangueira em pé (cavalete de plástico) com a mangueira verde enrolada e a ponta com esguicho."""
    pc = []
    zc = 0.32
    larg = 0.24
    # cavalete: duas laterais em A e alça em cima
    for sx in (-1, 1):
        x = sx * (larg / 2 + 0.035)
        for sy in (-1, 1):
            pc.append(B.tubo('perna', [(x, sy * 0.22, 0.0), (x, sy * 0.02, zc + 0.05), (x, 0.0, 0.7)], 0.016, n=10, mat='plastico_verde_escuro'))
        pc.append(B.caixa('pe', 0.05, 0.5, 0.03, mat='plastico_verde_escuro', chanfro=0.01, seg=2, centro=(x, 0, 0)))
        # disco do carretel
        d = B.cilindro('disco', 0.2, 0.012, n=36, mat='plastico_verde_escuro', chanfro=0.004)
        B.girar(d, (0, 90, 0))
        B.mover(d, (sx * (larg / 2 + 0.006) - 0.006, 0, zc))
        pc.append(d)
    pc.append(B.tubo('alca', [(-larg / 2 - 0.035, 0, 0.7), (-0.1, 0, 0.74), (0.1, 0, 0.74), (larg / 2 + 0.035, 0, 0.7)], 0.017, n=10, mat='plastico_verde_escuro'))
    # manivela
    xm = larg / 2 + 0.06
    pc.append(B.tubo('manivela', [(xm - 0.03, 0, zc), (xm, 0, zc), (xm, 0.0, zc + 0.12)], 0.009, n=8, mat='plastico_amarelo'))
    pc.append(B.cilindro('punho', 0.014, 0.07, n=10, mat='plastico_amarelo', chanfro=0.004))
    B.girar(pc[-1], (0, 90, 0))
    B.mover(pc[-1], (xm, 0, zc + 0.12))
    # enchimento (camadas de baixo) e espiral de fora
    pc.append(B.cilindro('miolo', 0.13, larg - 0.01, n=36, mat='mangueira_verde'))
    B.girar(pc[-1], (0, 90, 0))
    B.mover(pc[-1], (-(larg - 0.01) / 2, 0, zc))
    rh = 0.0105
    voltas = (larg - 0.02) / (2 * rh)
    t = np.linspace(0, 1, int(voltas * 16))
    ang = t * voltas * TAU
    R = 0.13 + rh
    hel = np.column_stack([-(larg - 0.02) / 2 + rh + t * (larg - 0.02 - 2 * rh), R * np.cos(ang), zc + R * np.sin(ang)])
    # ponta descendo até o chão e esguicho deitado
    a_fim = ang[-1]
    p_fim = hel[-1]
    s = np.linspace(0, 1, 14)[1:]
    desc = np.column_stack([p_fim[0] + 0.05 * s, p_fim[1] - 0.2 * s - 0.05 * s ** 2, np.maximum(p_fim[2] * (1 - s) ** 1.6, rh)])
    hel = np.vstack([hel, desc])
    pc.append(B.tubo('mangueira', hel, rh, n=6, mat='mangueira_verde'))
    p = desc[-1]
    esg = B.cilindro('esguicho', 0.014, 0.12, n=10, mat='plastico_amarelo', chanfro=0.004, r2=0.011)
    B.girar(esg, (90, 0, 0))
    B.mover(esg, (p[0], p[1] + 0.005, 0.016))
    pc.append(esg)
    gat = B.caixa('gatilho', 0.016, 0.06, 0.05, mat='plastico_preto', chanfro=0.006, seg=1)
    B.mover(gat, (p[0], p[1] - 0.05, 0.002))
    pc.append(gat)
    return B.juntar('mangueira_enrolada', pc)


def monte_folhas():
    """Monte de folhas secas varridas (~1,2 x 0,9 x 0,3 m)."""
    pc = []
    m = _monte(0.6, 0.45, 0.3, 0.0, 3, n=30, nr=10)
    pc.append(m)

    def zf(x, y):
        s2 = (x / 0.6) ** 2 + (y / 0.45) ** 2
        return 0.3 * max(0.0, 1 - s2) ** 0.8 if s2 < 1 else 0.0
    pc.append(_folhas_soltas(70, (0, 0), 0.62, zf, 33, espalhar=0.25))
    return B.juntar('monte_folhas', pc)


def saco_lixo():
    """Saco de lixo verde cheio, amarrado em cima (orelhas do nó)."""
    perfil = [(0, 0), (0.17, 0.0), (0.23, 0.04), (0.25, 0.14), (0.24, 0.3), (0.2, 0.43), (0.13, 0.52), (0.05, 0.58),
              (0.022, 0.61), (0.02, 0.64), (0.0, 0.645)]
    p = np.array(perfil)
    s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(p, axis=0), axis=1))])
    ss = np.linspace(0, s[-1], 20)
    p2 = np.column_stack([np.interp(ss, s, p[:, 0]), np.interp(ss, s, p[:, 1])])
    ob = B.torno('saco', [tuple(x) for x in p2], n=36, mat='saco_verde', suave=True)

    def forma(v):
        x, y, z = v[:, 0], v[:, 1], v[:, 2]
        r = np.hypot(x, y)
        a = np.arctan2(y, x)
        # pregas do franzido perto do nó
        perto = np.clip((z - 0.4) / 0.2, 0, 1)
        prega = 0.02 * np.sin(a * 11) * perto * (z < 0.6)
        calombo = 0.03 * B.ruido3(v, 5, 7) * (z < 0.5) * (z > 0.01) + 0.012 * B.ruido3(v, 14, 8)
        esc = 1 + (prega + calombo) / np.maximum(r, 0.02)
        return np.column_stack([x * esc, y * esc * 0.9, np.maximum(z, 0)])
    B.deformar(ob, forma)
    pc = [ob]
    # orelhas do nó
    for sx in (-1, 1):
        t = np.linspace(0, 1, 6)
        pts = np.column_stack([sx * (0.01 + 0.07 * t), 0.006 * t, 0.635 + 0.06 * np.sin(t * 2.0) - 0.03 * t ** 2])
        pc.append(B.fita('orelha', pts, 0.045 * (1 - 0.5 * t) + 0.01, espessura=0.003, mat='saco_verde', cima=(0, 1, 0)))
    return B.juntar('saco_lixo', pc)


ADERECOS = [
    ('cortador_grama', cortador_grama, 'Cortador de grama a gasolina de empurrar: casco verde, motor com partida retrátil, rodas, guidão e coletor atrás.',
     'a frente (lâmina, rodas menores) olha para +Z; quem empurra fica em -Z; pega_d (-X) e pega_e (+X) na barra do guidão a 0,95 m'),
    ('rastelo', rastelo, 'Rastelo (ancinho de 14 dentes retos) com cabo de madeira, 1,6 m.',
     'origem na pega_d (mão de baixo), cabo em +Y; pega_e 0,5 m acima; cabeça em y = -1,1; os dentes apontam para -Z'),
    ('vassoura', vassoura, 'Vassoura de jardim (leque de 20 lâminas de aço) com cabo de madeira, 1,7 m.',
     'origem na pega_d, cabo em +Y; pega_e 0,42 m acima; leque para baixo; as pontas das lâminas curvam para -Z'),
    ('carrinho_mao', carrinho_mao, 'Carrinho de mão de caçamba galvanizada, chassi preto e pneu, cheio de folhas secas.',
     'a roda fica na frente (+Z); pega_d (-X) e pega_e (+X) nas manoplas; origem no meio entre o pneu e os pés'),
    ('escada_aluminio', escada_aluminio, 'Escada de abrir de alumínio de 1,8 m (aberta), com cinco degraus e plataforma de topo.',
     'os degraus ficam do lado +Z'),
    ('cesto_frutas', cesto_frutas, 'Cesto de vime com alça, cheio de mangas (verde, amarela e vermelha) e goiabas.',
     'as cores das frutas estão na cor de vértice (COLOR_0, multiplica a cor do material)'),
    ('peneira_piscina', peneira_piscina, 'Vara telescópica de alumínio (~3 m) com trava azul e peneira de folhas na ponta.',
     'origem na pega_d, vara em +Y; pega_e 0,6 m acima; a peneira (no plano XY) fica na ponta de baixo, até y = -2,48'),
    ('mangueira_enrolada', mangueira_enrolada, 'Carretel de mangueira em cavalete, com a mangueira verde enrolada e a ponta com esguicho no chão.'),
    ('monte_folhas', monte_folhas, 'Monte de folhas secas varridas (~1,2 x 0,9 x 0,3 m), com folhas soltas em volta.'),
    ('saco_lixo', saco_lixo, 'Saco de lixo verde cheio (~0,7 m), amarrado em cima.'),
]
