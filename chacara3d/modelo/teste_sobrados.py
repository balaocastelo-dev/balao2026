"""Conferência rápida dos sobrados no terreno.json exportado (não precisa do Blender).

    python teste_sobrados.py [caminho/do/terreno.json]

Confere, para cada casa:
- a escada de dentro: degraus em sequência, espelho <= 0,20, do piso do térreo até o piso de cima;
- os pisos de cima não cobrem o vão da escada (altura livre >= 1,90 sobre cada degrau);
- o caracol: o último degrau no nível do deck, apontando para a casa, o primeiro virado para o gramado,
  e um piso no nível do deck encostado na saída;
- o caminho porta -> sala -> escada -> hall -> quartos e banheiros, e do caracol ao meio do deck,
  numa grade de 5 cm com o raio de 0,27 do passeio: um colisor barra quando cruza a faixa
  [pé + 0,35; pé + 1,7]; o chão em cada ponto é o piso mais alto que não passe de pé + 0,5.
"""
import json, math, os, sys
from collections import deque
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
ARQ = sys.argv[1] if len(sys.argv) > 1 else os.path.join(AQUI, '..', '..', 'public', 'chacara3d', 'dados', 'terreno.json')
E = json.load(open(ARQ, encoding='utf-8'))['extra']
R, PASSO, SOBE = 0.27, 0.05, 0.5
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


def caminhos(casa, alvos, inicio):
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
    esp = [e for e in E['espirais'] if e['casa'] == nome][0]
    # lado do caracol: u cresce da ponta lisa para o caracol
    su = 1.0 if esp['cx'] > (cx0 + cx1) / 2 else -1.0
    xl = cx0 if su > 0 else cx1

    def mundo(iu, id_, z=0.0):
        return (xl + su * (iu + 0.12), (cy0 if sd > 0 else cy1) + sd * (id_ + 0.12), z)
    ps = [p for p in E['pisos'] if dentro(p, cx0, cx1, cy0, cy1, 0.05)]
    # ---- escada de dentro
    degraus = sorted([p for p in ps if casa['piso'] + 0.01 < p[4] < casa['z1'] - 0.01], key=lambda p: p[4])
    zs = [casa['piso']] + [p[4] for p in degraus] + [casa['z1']]
    esp_max = max(b - a for a, b in zip(zs[:-1], zs[1:]))
    confere(len(degraus) == 15, f'{len(degraus)} degraus + patamar (esperado 15 níveis entre {casa["piso"]} e {casa["z1"]})')
    confere(esp_max <= 0.2 + 1e-6 and min(b - a for a, b in zip(zs[:-1], zs[1:])) > 0.1, f'espelhos entre 0,10 e 0,20 (maior {esp_max:.3f})')
    confere(all(encosta(a, b) for a, b in zip(degraus[:-1], degraus[1:])), 'cada degrau encosta no seguinte')
    cima = [p for p in ps if abs(p[4] - casa['z1']) < 1e-3]
    confere(any(encosta(degraus[-1], p) for p in cima), 'o último degrau encosta no piso de cima')
    terreo = [p for p in ps if abs(p[4] - casa['piso']) < 1e-3]
    confere(any(encosta(degraus[0], p) for p in terreo), 'o primeiro degrau sai do piso do térreo')
    pior = min((2.72 - d[4] for d in degraus for p in cima if sobrepoe(d, p)), default=9)
    confere(pior >= 1.9 - 1e-6, f'piso de cima não cobre o vão (menor altura livre sobre degrau {pior:.2f} m)')
    # ---- caracol
    topo = esp['z0'] + esp['n'] * esp['espelho']
    confere(abs(topo - casa['deck']) < 2e-3, f'último degrau do caracol em {topo:.3f} = deck {casa["deck"]}')
    am_fim = esp['ang0'] + (esp['n'] - 0.5) * esp['passo']
    am_ini = esp['ang0'] + 0.5 * esp['passo']
    para_casa = math.atan2((cy0 + cy1) / 2 - esp['cy'], (cx0 + cx1) / 2 - esp['cx'])
    dif = abs((am_fim - para_casa + math.pi) % (2 * math.pi) - math.pi)
    confere(dif < math.radians(16), f'último degrau aponta para a casa (desvio {math.degrees(dif):.1f}°)')
    confere(math.sin(am_ini) * sd > 0.5, f'primeiro degrau virado para o gramado (componente {math.sin(am_ini) * sd:.2f})')
    sx, sy = esp['cx'] + esp['r1'] * math.cos(am_fim), esp['cy'] + esp['r1'] * math.sin(am_fim)
    confere(any(abs(p[4] - casa['deck']) < 1e-3 and p[0] - 0.03 <= sx <= p[1] + 0.03 and p[2] - 0.03 <= sy <= p[3] + 0.03 for p in E['pisos']),
            'piso no nível do deck encostado na saída do caracol')
    # ---- caminhos
    porta = [p for p in E['portas'] if p['casa'] == nome][0]
    fora = mundo(3.42, 3.45 - 0.12)
    alvos = {'sala': mundo(1.80, 1.30, casa['piso']), 'cozinha': mundo(5.60, 1.10, casa['piso']),
             'banheiro de baixo': mundo(3.85, 0.60, casa['piso']), 'patamar': mundo(0.42, 0.42, 1.50),
             'hall de cima': mundo(3.15, 0.55, casa['z1']), 'quarto da beliche': mundo(2.20, 1.60, casa['z1']),
             'banheiro de cima': mundo(3.16, 1.95, casa['z1']), 'casal (porta)': mundo(4.30, 1.05, casa['z1']),
             'casal (porta-janela)': mundo(5.50, 2.40, casa['z1'])}
    ok = caminhos(casa, alvos, (fora[0], fora[1], 0.10))
    for k, v in ok.items():
        confere(v, f'da porta até {k}')
    saida = (sx + 0.10 * math.cos(para_casa), sy + 0.10 * math.sin(para_casa), casa['deck'])
    ok = caminhos(casa, {'meio do deck': mundo(4.90, 1.25, casa['deck']), 'luneta': mundo(5.40, 2.15, casa['deck']),
                         'espreguiçadeiras': mundo(2.95, 1.20, casa['deck'])}, saida)
    for k, v in ok.items():
        confere(v, f'da saída do caracol até {k}')
    for l in E['lugares']:
        if nome.lower() in l[0].lower():
            confere(len(l) == 5, f'lugar "{l[0]}" com a altura do pé ({l[4] if len(l) > 4 else "?"})')

print('\n' + ('tudo certo' if not falhas else f'{len(falhas)} falha(s)'))
sys.exit(1 if falhas else 0)
