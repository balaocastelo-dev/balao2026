"""Conferência rápida das casas container no terreno.json exportado (não precisa do Blender).

    python teste_casas.py [caminho/do/terreno.json]

Confere, para cada casa:
- a escada de fora: degraus em sequência, espelho <= 0,20, do chão até o patamar no nível do terraço,
  cada degrau encostado no seguinte e o último encostado no patamar;
- o caminho da porta até a sala, a cozinha, o banheiro e o quarto, e do pé da escada até o meio do terraço
  e a mesa, numa grade de 5 cm com o raio de 0,27 do passeio (0,20 dentro de casa): um colisor barra quando
  cruza a faixa [pé + 0,35; pé + 1,7]; o chão em cada ponto é o piso mais alto que não passe de pé + 0,5.
"""
import json, math, os, sys
from collections import deque
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
ARQ = sys.argv[1] if len(sys.argv) > 1 else os.path.join(AQUI, '..', '..', 'public', 'chacara3d', 'dados', 'terreno.json')
E = json.load(open(ARQ, encoding='utf-8'))['extra']
R, PASSO, SOBE = 0.27, 0.05, 0.5
RDENTRO = 0.20
COL = np.array(E['colisores'], float)
PISOS = np.array(E['pisos'], float)
falhas = []


def confere(ok, msg):
    print(('  ok   ' if ok else '  FALHA ') + msg)
    if not ok:
        falhas.append(msg)


def dentro(p, x0, x1, y0, y1, folga=0.0):
    return p[0] >= x0 - folga and p[1] <= x1 + folga and p[2] >= y0 - folga and p[3] <= y1 + folga


def sobrepoe(a, b):
    return min(a[1], b[1]) - max(a[0], b[0]) > 1e-3 and min(a[3], b[3]) - max(a[2], b[2]) > 1e-3


def encosta(a, b, tol=0.02):
    return min(a[1], b[1]) - max(a[0], b[0]) > -tol and min(a[3], b[3]) - max(a[2], b[2]) > -tol


def caminhos(casa, alvos, inicio, R=R):
    """Busca em largura na grade de 5 cm, como o passeio anda (raio 0,27, faixa de altura, degrau de até 0,5)."""
    x0, x1 = casa['x'][0] - 1.6, casa['x'][1] + 1.6
    y0, y1 = casa['y'][0] - 1.6, casa['y'][1] + 1.6
    xs = np.arange(math.floor(x0 / PASSO) * PASSO, x1, PASSO)
    ys = np.arange(math.floor(y0 / PASSO) * PASSO, y1, PASSO)
    X, Y = np.meshgrid(xs, ys, indexing='ij')
    perto = (COL[:, 1] > x0 - 1) & (COL[:, 0] < x1 + 1) & (COL[:, 3] > y0 - 1) & (COL[:, 2] < y1 + 1)
    C = COL[perto]
    pz = (PISOS[:, 1] > x0) & (PISOS[:, 0] < x1) & (PISOS[:, 3] > y0) & (PISOS[:, 2] < y1)
    PS = PISOS[pz]
    niveis = sorted(set([0.0] + [round(v, 3) for v in PS[:, 4]]))
    fora = (X < 0.32) | (X > 59.72) | (Y < 0.32) | (Y > 9.68)
    barra, chao = {}, {}
    for pe in niveis:
        sel = C[(pe + 1.7 > C[:, 4]) & (pe + 0.35 < C[:, 5])]
        b = fora.copy()
        for c in sel:
            b |= (X > c[0] - R) & (X < c[1] + R) & (Y > c[2] - R) & (Y < c[3] + R)
        barra[pe] = b
        g = np.zeros_like(X)
        for p in PS[PS[:, 4] <= pe + SOBE + 1e-6]:
            m = (X >= p[0]) & (X <= p[1]) & (Y >= p[2]) & (Y <= p[3])
            g = np.where(m, np.maximum(g, p[4]), g)
        chao[pe] = np.round(g, 3)
    i0 = int(round((inicio[0] - xs[0]) / PASSO)); j0 = int(round((inicio[1] - ys[0]) / PASSO))
    pe0 = chao[min(niveis, key=lambda v: abs(v - inicio[2]))][i0, j0]
    vis = {(i0, j0, pe0)}
    fila = deque([(i0, j0, pe0)])
    while fila:
        i, j, pe = fila.popleft()
        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            a, b = i + di, j + dj
            if not (0 <= a < len(xs) and 0 <= b < len(ys)) or barra[pe][a, b]:
                continue
            q = (a, b, float(chao[pe][a, b]))
            if q not in vis:
                vis.add(q); fila.append(q)
    res = {}
    for nome, (tx, ty, tz) in alvos.items():
        res[nome] = any(abs(xs[i] - tx) <= 0.08 and abs(ys[j] - ty) <= 0.08 and abs(pe - tz) < 0.06 for i, j, pe in vis)
    return res


for casa in E['casas']:
    nome = casa['nome']
    print(nome)
    cx0, cx1 = casa['x']; cy0, cy1 = casa['y']
    frente = casa['frente']
    sd = 1.0 if frente > (cy0 + cy1) / 2 else -1.0
    esc = [e for e in E['escadas'] if e['casa'] == nome][0]
    su = 1.0 if (esc['x'][0] + esc['x'][1]) / 2 > (cx0 + cx1) / 2 else -1.0
    xl = cx0 if su > 0 else cx1
    yb = cy0 if sd > 0 else cy1

    def mundo(u, d, z=0.0):
        return (xl + su * u, yb + sd * d, z)
    # ---- escada de fora
    ex0, ex1 = esc['x']; ey0, ey1 = esc['y']
    ps = [p for p in E['pisos'] if dentro(p, ex0, ex1, ey0, ey1, 0.02)]
    degraus = sorted([p for p in ps if 0.01 < p[4] < casa['deck'] - 0.01], key=lambda p: p[4])
    patamar = [p for p in ps if abs(p[4] - casa['deck']) < 1e-3]
    zs = [0.0] + [p[4] for p in degraus] + [casa['deck']]
    esp_max = max(b - a for a, b in zip(zs[:-1], zs[1:]))
    confere(len(degraus) == 13, f'{len(degraus)} degraus (esperado 13 + o patamar)')
    confere(esp_max <= 0.2 + 1e-6 and min(b - a for a, b in zip(zs[:-1], zs[1:])) > 0.1, f'espelhos entre 0,10 e 0,20 (maior {esp_max:.3f})')
    confere(all(encosta(a, b) for a, b in zip(degraus[:-1], degraus[1:])), 'cada degrau encosta no seguinte')
    confere(bool(patamar) and encosta(degraus[-1], patamar[0]), 'o último degrau encosta no patamar')
    terraco = [p for p in E['pisos'] if abs(p[4] - casa['deck']) < 1e-3 and dentro(p, cx0, cx1, cy0, cy1, 0.02)]
    confere(bool(terraco) and encosta(patamar[0], terraco[0]), 'o patamar encosta no piso do terraço')
    # ---- caminhos (dentro de casa o passeio anda com raio 0,20)
    fora = mundo(3.22, 3.30)
    alvos = {'hall': mundo(3.15, 2.40, casa['piso']), 'sala': mundo(5.00, 1.10, casa['piso']),
             'cozinha': mundo(5.95, 1.40, casa['piso']), 'banheiro': mundo(3.12, 1.32, casa['piso']),
             'quarto': mundo(1.20, 2.40, casa['piso'])}
    ok = caminhos(casa, alvos, (fora[0], fora[1], 0.13), R=RDENTRO)
    for k, v in ok.items():
        confere(v, f'da porta até {k}')
    pe = mundo(7.42, 4.10)
    ok = caminhos(casa, {'patamar': mundo(7.42, 0.45, casa['deck']), 'meio do terraço': mundo(5.30, 1.50, casa['deck']),
                         'frente da mesa': mundo(3.30, 2.40, casa['deck'])}, (pe[0], pe[1], 0.0))
    for k, v in ok.items():
        confere(v, f'do pé da escada até {k}')
    for l in E['lugares']:
        if nome.lower() in l[0].lower():
            confere(len(l) == 5, f'lugar "{l[0]}" com a altura do pé ({l[4] if len(l) > 4 else "?"})')

print('\n' + ('tudo certo' if not falhas else f'{len(falhas)} falha(s)'))
sys.exit(1 if falhas else 0)
