"""Monta a chácara pronta (terreno de 60 x 10 m) como maquete 3D e salva chacara.blend."""
import bpy, sys, os, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import numpy as np

bpy.ops.wm.read_factory_settings(use_empty=True)

import geo
from geo import (G, GS, box, obox, quad, beam, tube, ellipsoid, cyl, annulus, disc, tile_roof, rotz, rotx,
                 m_plain, m_leaf, m_tile, m_water, m_caco, m_brick, m_wood, m_grass, m_gravel, BOXF)
import plants as P

rng = np.random.default_rng(11)

# ------------------------------------------------------------------ materiais
m_tile('tile', stops=[(0.0, (0.04, 0.22, 0.48)), (0.3, (0.09, 0.38, 0.62)), (0.6, (0.20, 0.55, 0.76)), (0.85, (0.44, 0.72, 0.82)), (1.0, (0.66, 0.84, 0.86))])
m_tile('ladrilho', stops=[(0.0, (0.05, 0.20, 0.42)), (0.5, (0.85, 0.85, 0.80)), (0.75, (0.12, 0.42, 0.55))], scale=6.6667,
       grout=(0.8, 0.8, 0.78), gw=0.04, rough=0.3)
m_water('water')
m_water('water_pond', tint=(0.62, 0.88, 0.80), ripple=0.05, scale=4.0)
m_plain('stream', (0.9, 0.97, 1.0), 0.15, **{'Emission Color': (0.8, 0.93, 1.0, 1), 'Emission Strength': 0.6})
m_caco('caco')
m_brick('stone_cut', (0.74, 0.66, 0.46), (0.82, 0.76, 0.58), (0.50, 0.47, 0.42), bw=0.6, rh=0.3, ms=0.006, mode='floor', rough=0.6, bump=0.15)
m_brick('filete', (0.60, 0.50, 0.34), (0.80, 0.72, 0.54), (0.30, 0.27, 0.23), bw=0.36, rh=0.045, ms=0.004, mode='wall', rough=0.75, bump=0.8)
m_brick('brick', (0.50, 0.17, 0.08), (0.64, 0.26, 0.12), (0.72, 0.68, 0.62))
m_wood('wood_x', 0); m_wood('wood_y', 1); m_wood('wood_z', 2)
m_wood('log', 1, (0.35, 0.22, 0.12), (0.62, 0.45, 0.28))
m_plain('rooftile', (0.66, 0.25, 0.10), 0.75, noise=0.35, nscale=2.5)
m_plain('wall_sand', (0.66, 0.56, 0.41), 0.9, noise=0.06, nscale=1.5, bump=0.08)
m_plain('wall_moss', (0.10, 0.185, 0.10), 0.9, noise=0.10, nscale=2.0, bump=0.08)
m_plain('wall_white', (0.86, 0.83, 0.76), 0.9, noise=0.04, nscale=2.0)
m_plain('wall_out', (0.40, 0.38, 0.35), 0.9, noise=0.08, nscale=1.0)
m_grass('grass')
m_gravel('pedrisco', (0.42, 0.35, 0.26), (0.66, 0.58, 0.45), 85)
m_gravel('seixo', (0.66, 0.58, 0.46), (0.92, 0.88, 0.78), 38)
m_plain('mulch', (0.15, 0.085, 0.05), 0.95, noise=0.35, nscale=25, bump=0.5)
m_plain('terrain', (0.20, 0.23, 0.09), 0.95, noise=0.45, nscale=0.12)
m_plain('street', (0.45, 0.24, 0.14), 0.95, noise=0.2, nscale=0.6)
m_plain('gate_green', (0.03, 0.20, 0.09), 0.45)
m_plain('metal_dark', (0.03, 0.03, 0.03), 0.4, **{'Metallic': 1.0})
m_plain('inox', (0.78, 0.78, 0.78), 0.25, **{'Metallic': 1.0})
m_plain('copper', (0.72, 0.36, 0.18), 0.3, **{'Metallic': 1.0})
m_plain('granite', (0.025, 0.025, 0.03), 0.2)
m_plain('concrete', (0.55, 0.54, 0.51), 0.85, noise=0.1, nscale=3)
m_plain('cushion', (0.86, 0.82, 0.72), 0.95)
m_plain('cushion_teal', (0.06, 0.30, 0.33), 0.95)
m_plain('screen', (0.94, 0.94, 0.93), 0.95)
m_plain('soot', (0.015, 0.014, 0.013), 0.95)
m_plain('ember', (0.9, 0.25, 0.03), 0.8, **{'Emission Color': (1.0, 0.25, 0.02, 1), 'Emission Strength': 2.0})
m_plain('clay_dome', (0.80, 0.66, 0.52), 0.9, noise=0.1, nscale=5)
m_plain('stone_step', (0.72, 0.64, 0.46), 0.7, noise=0.22, nscale=9, bump=0.15)
m_plain('pond_floor', (0.09, 0.12, 0.12), 0.9, noise=0.3, nscale=6)
m_plain('mesh', (0.35, 0.36, 0.34), 0.5, **{'Alpha': 0.22})
m_plain('white', (0.9, 0.9, 0.88), 0.5)
m_plain('bark_dark', (0.11, 0.085, 0.065), 0.95, noise=0.4, nscale=14, bump=0.6)
m_plain('bark_palm', (0.42, 0.37, 0.30), 0.95, noise=0.3, nscale=10, bump=0.5)
m_plain('bark_jabu', (0.58, 0.46, 0.34), 0.8, noise=0.35, nscale=22)
m_plain('bark_goiaba', (0.52, 0.34, 0.22), 0.7, noise=0.4, nscale=16)
m_plain('bark_cane', (0.34, 0.30, 0.20), 0.8, noise=0.25, nscale=30)
m_plain('leaf_core', (0.010, 0.035, 0.010), 1.0)
m_plain('leaf_core_big', (0.010, 0.035, 0.010), 1.0)
m_leaf('leaf_mango', (0.015, 0.075, 0.015), (0.075, 0.21, 0.035))
m_leaf('leaf_amend', (0.05, 0.19, 0.025), (0.19, 0.40, 0.06))
m_leaf('leaf_amend_red', (0.45, 0.07, 0.02), (0.80, 0.32, 0.04))
m_leaf('leaf_jabu', (0.025, 0.11, 0.02), (0.10, 0.27, 0.05))
m_leaf('leaf_goiaba', (0.07, 0.19, 0.05), (0.20, 0.34, 0.10), rough=0.7)
m_leaf('leaf_citrus', (0.015, 0.09, 0.02), (0.06, 0.20, 0.04), rough=0.3)
m_leaf('leaf_bg', (0.03, 0.11, 0.025), (0.12, 0.25, 0.06), rough=0.7)
m_leaf('leaf_palm', (0.045, 0.16, 0.03), (0.15, 0.31, 0.06), rough=0.4)
m_plain('leaf_palm_base', (0.28, 0.30, 0.12), 0.7)
m_plain('leaf_palm_rachis', (0.22, 0.30, 0.09), 0.6)
m_leaf('leaf_banana', (0.09, 0.27, 0.04), (0.24, 0.46, 0.08), rough=0.4)
m_plain('stem_banana', (0.30, 0.36, 0.14), 0.6, noise=0.2, nscale=8)
m_leaf('leaf_trop', (0.025, 0.15, 0.03), (0.10, 0.30, 0.06), rough=0.3)
m_leaf('leaf_trop2', (0.035, 0.19, 0.04), (0.13, 0.36, 0.08), rough=0.3)
m_leaf('leaf_lime', (0.20, 0.40, 0.06), (0.40, 0.60, 0.12), rough=0.4)
m_leaf('leaf_dracena', (0.05, 0.20, 0.04), (0.26, 0.43, 0.10), rough=0.35)
m_leaf('leaf_rafis', (0.02, 0.11, 0.03), (0.06, 0.22, 0.05), rough=0.3)
m_leaf('leaf_strap', (0.05, 0.18, 0.05), (0.13, 0.30, 0.08))
m_leaf('leaf_black', (0.008, 0.02, 0.012), (0.03, 0.05, 0.03))
m_leaf('leaf_purple', (0.045, 0.02, 0.05), (0.13, 0.05, 0.11), rough=0.35)
m_leaf('leaf_brom', (0.08, 0.25, 0.06), (0.26, 0.42, 0.10), rough=0.3)
m_leaf('leaf_fern', (0.10, 0.30, 0.05), (0.24, 0.50, 0.10))
m_leaf('leaf_vine', (0.02, 0.10, 0.02), (0.08, 0.23, 0.05))
m_leaf('leaf_vine_light', (0.06, 0.20, 0.03), (0.16, 0.36, 0.07))
m_plain('stem_green', (0.12, 0.30, 0.08), 0.6)
m_plain('stem_purple', (0.14, 0.04, 0.11), 0.6)
m_leaf('flower_red', (0.65, 0.015, 0.015), (0.95, 0.22, 0.03), rough=0.4, trans=0.1)
m_leaf('flower_orange', (0.85, 0.25, 0.02), (1.0, 0.55, 0.05), rough=0.4, trans=0.1)
m_plain('fruit_black', (0.012, 0.006, 0.018), 0.22)
m_leaf('fruit_mango', (0.25, 0.42, 0.06), (0.85, 0.35, 0.06), rough=0.35, trans=0.0)
m_leaf('fruit_goiaba', (0.40, 0.55, 0.14), (0.80, 0.78, 0.25), rough=0.5, trans=0.0)
m_leaf('fruit_orange', (0.85, 0.32, 0.01), (0.95, 0.52, 0.03), rough=0.4, trans=0.0)
m_leaf('fruit_lemon', (0.22, 0.42, 0.04), (0.50, 0.62, 0.08), rough=0.4, trans=0.0)
m_plain('fruit_red', (0.70, 0.02, 0.03), 0.3)
m_leaf('fruit_banana', (0.30, 0.48, 0.08), (0.62, 0.66, 0.14), rough=0.5, trans=0.0)
m_leaf('coconut', (0.28, 0.42, 0.07), (0.62, 0.60, 0.14), rough=0.45, trans=0.0)
m_plain('pot_clay', (0.56, 0.25, 0.13), 0.8)
m_plain('pot_fiber', (0.52, 0.40, 0.24), 0.9, noise=0.2, nscale=40, bump=0.5)
m_plain('rope', (0.62, 0.52, 0.36), 0.9)
m_plain('koi_o', (0.95, 0.30, 0.02), 0.35); m_plain('koi_w', (0.92, 0.90, 0.85), 0.35); m_plain('koi_k', (0.04, 0.04, 0.05), 0.35)
m_plain('bulb', (1.0, 0.78, 0.45), 0.3, **{'Emission Color': (1.0, 0.62, 0.25, 1), 'Emission Strength': 1.6})
m_plain('house_white', (0.90, 0.87, 0.79), 0.9, noise=0.04, nscale=2.0, bump=0.06)
m_plain('glass_dark', (0.03, 0.07, 0.09), 0.04)
m_plain('acc_blue', (0.035, 0.19, 0.44), 0.55); m_plain('acc_yellow', (0.80, 0.48, 0.05), 0.55); m_plain('acc_green', (0.06, 0.34, 0.27), 0.55)
m_plain('hen_w', (0.9, 0.88, 0.82), 0.9); m_plain('hen_b', (0.42, 0.22, 0.10), 0.9)
m_plain('crista', (0.70, 0.02, 0.03), 0.3)
# interior das tiny houses
m_plain('piso_madeira', (0.45, 0.32, 0.20), 0.35, noise=0.1, nscale=4)
m_plain('azulejo', (0.90, 0.90, 0.88), 0.1)
m_plain('forro', (0.62, 0.45, 0.25), 0.6, noise=0.15, nscale=8)
m_plain('louca', (0.92, 0.92, 0.90), 0.08)
m_plain('espelho', (0.90, 0.90, 0.90), 0.02, **{'Metallic': 1.0})
m_plain('vidro', (0.80, 0.90, 0.90), 0.02, **{'Alpha': 0.15})
m_plain('armario', (0.85, 0.84, 0.80), 0.4)
m_plain('tecido_branco', (0.85, 0.84, 0.80), 0.95)
m_plain('tecido_cinza', (0.35, 0.35, 0.36), 0.95)
m_plain('tecido_terra', (0.50, 0.25, 0.14), 0.95)
m_plain('tecido_azul', (0.12, 0.22, 0.40), 0.95)
m_plain('tecido_amarelo', (0.75, 0.55, 0.15), 0.95)
m_plain('tecido_verde', (0.20, 0.38, 0.28), 0.95)
m_plain('cortina', (0.85, 0.82, 0.74), 0.95)
m_plain('abajur', (0.95, 0.88, 0.72), 0.9)
m_plain('quadro', (0.35, 0.45, 0.30), 0.6)

# ------------------------------------------------------------------ constantes
WH = 2.3                      # altura do muro
PX0, PX1, PY0, PY1, PD = 34.2, 44.0, 1.1, 4.7, 1.4   # piscina
LOW = -1.0                    # nível do quintal de baixo (x > 46)
EDGE = 46.0


def roofz(y, zh=3.75, yh=10.0, s=0.27):
    return zh - s * (yh - y)


# ------------------------------------------------------------------ terreno e fechamento
# terreno do entorno (fica fora do lote em si para a piscina / o laguinho continuarem ocos)
for a in ((-70, EDGE, -70, -0.15, -0.045), (-70, EDGE, 10.15, 80, -0.045), (-70, -0.15, -0.15, 10.15, -0.045),
          (EDGE, 130, -70, -0.15, LOW - 0.045), (EDGE, 130, 10.15, 80, LOW - 0.045), (60.15, 130, -0.15, 10.15, LOW - 0.045)):
    box('terrain', a[0], a[1], a[2], a[3], -3, a[4])
box('pond_floor', -1, 61, -1, 11, -3.2, -2.6)
box('street', -9, -0.4, -30, 40, -3, -0.03)
box('street', 60.4, 69, -30, 40, -3, LOW - 0.03)

box('grass', 0, 31.6, 0, 10, -0.04, 0.0)
box('pedrisco', 0, 28.6, 0, 0.32, -0.03, 0.012)
box('pedrisco', 0, 31.6, 9.68, 10, -0.03, 0.012)
box('stone_cut', 31.5, 31.62, 0, 10, -0.04, 0.02)

T = 0.15
# muros compridos: (x0, x1, base, topo, material do lado de dentro)
for x0, x1, mat in ((0, 31.0, 'wall_sand'), (31.0, EDGE, 'wall_moss')):
    box(mat, x0, x1, -T, 0, -0.04, WH)
box('wall_sand', EDGE, 60, -T, 0, LOW - 0.04, LOW + WH)
for x0, x1, mat in ((0, 35.0, 'wall_sand'), (35.0, 45.2, 'wall_white'), (45.2, EDGE, 'wall_sand')):
    box(mat, x0, x1, 10, 10 + T, -0.04, WH)
box('wall_sand', EDGE, 60, 10, 10 + T, LOW - 0.04, LOW + WH)


def gate(x, y0, y1, zb, outward):
    """Portão verde de correr com pilares de tijolo e um telhadinho de telhas de barro (como no local)."""
    for a, b in ((y0 - 0.45, y0), (y1, y1 + 0.45)):
        box('brick', x - 0.3, x + 0.15, a, b, zb, zb + 2.75)
    box('gate_green', x - 0.05, x, y0, y1, zb + 0.06, zb + 2.05)
    for k in range(int((y1 - y0) / 0.16)):
        yy = y0 + 0.08 + k * 0.16
        box('gate_green', x - 0.075, x + 0.025, yy - 0.02, yy + 0.02, zb + 0.06, zb + 2.05)
    for k in range(4):
        box('gate_green', x - 0.04, x - 0.01, y0, y1, zb + 2.12 + k * 0.12, zb + 2.17 + k * 0.12)
    box('gate_green', x - 0.06, x + 0.01, y0, y1, zb + 2.02, zb + 2.08)
    box('wood_y', x - 0.9, x - 0.78, y0 - 0.7, y1 + 0.7, zb + 2.75, zb + 2.9)
    box('wood_y', x + 0.63, x + 0.75, y0 - 0.7, y1 + 0.7, zb + 2.75, zb + 2.9)
    box('wood_y', x - 0.12, x - 0.02, y0 - 0.7, y1 + 0.7, zb + 3.25, zb + 3.4)
    zr = zb + 3.47
    for sgn in (1, -1):
        v = np.array([sgn * 0.95, 0, -0.5]); L = np.linalg.norm(v); v = v / L
        tile_roof('rooftile', (x - 0.07, y0 - 0.78, zr), (0, 1, 0), v, (y1 - y0) + 1.56, L)
        for yy in np.arange(y0 - 0.6, y1 + 0.7, 0.6):
            beam('wood_x', (x - 0.07, yy, zr - 0.07), (x - 0.07 + sgn * 0.9, yy, zr - 0.07 - 0.474), 0.05, 0.08)


# muros das extremidades, com os portões
box('wall_sand', -T, 0, -T, 2.55, -0.04, WH); box('wall_sand', -T, 0, 6.85, 10 + T, -0.04, WH)
gate(0.0, 3.0, 6.4, 0.0, -1)
box('wall_sand', 60, 60 + T, -T, 2.75, LOW - 0.04, LOW + WH); box('wall_sand', 60, 60 + T, 7.45, 10 + T, LOW - 0.04, LOW + WH)
gate(60.1, 3.2, 7.0, LOW, 1)

# ------------------------------------------------------------------ piscina, hidro, piso
quad('tile', (PX0, PY0, -PD), (PX1, PY0, -PD), (PX1, PY1, -PD), (PX0, PY1, -PD))
quad('tile', (PX0, PY0, -PD), (PX1, PY0, -PD), (PX1, PY0, 0), (PX0, PY0, 0))
quad('tile', (PX0, PY1, -PD), (PX1, PY1, -PD), (PX1, PY1, 0), (PX0, PY1, 0))
quad('tile', (PX0, PY0, -PD), (PX0, PY1, -PD), (PX0, PY1, 0), (PX0, PY0, 0))
quad('tile', (PX1, PY0, -PD), (PX1, PY1, -PD), (PX1, PY1, 0), (PX1, PY0, 0))
box('tile', 41.5, PX1 + 0.05, PY0 - 0.05, 3.4, -PD - 0.05, -0.38)                    # prainha
for i, zt in enumerate((-0.25, -0.55, -0.85, -1.15)):            # degraus
    box('tile', PX1 - 0.6 * (i + 1), PX1 - 0.6 * i + (0.05 if i == 0 else 0.0), 3.4, PY1 + 0.05, -PD - 0.05, zt)
quad('water', (PX0, PY0, -0.07), (PX1, PY0, -0.07), (PX1, PY1, -0.07), (PX0, PY1, -0.07))
for a in ((33.9, 44.3, 0.8, 1.1), (33.9, 44.3, 4.7, 5.0), (44.0, 44.3, 1.1, 4.7), (33.9, 34.2, 3.3, 4.7), (31.6, 33.9, 0.8, 1.1)):
    box('stone_cut', a[0], a[1], a[2], a[3], 0.0, 0.035)
# painel da cascata
box('tile', 38.6, 40.2, 0.82, 1.1, 0.0, 1.7)
box('stone_cut', 38.55, 40.25, 0.78, 1.14, 1.7, 1.74)
for xs in (39.0, 39.8):
    box('inox', xs - 0.07, xs + 0.07, 1.1, 1.3, 1.26, 1.29)
    pts = [(xs, 1.3 + 0.55 * t, 1.27 - 1.34 * t * t) for t in np.linspace(0, 1, 9)]
    for dx in (-0.04, 0, 0.04):
        tube('stream', [(p[0] + dx, p[1], p[2]) for p in pts], 0.008, seg=5)
# hidro
HX0, HX1, HY0, HY1, HZ = 32.0, 34.2, 1.1, 3.3, 0.5
for a in ((HX0, HX0 + 0.22, HY0, HY1), (HX1 - 0.22, HX1, HY0, HY1), (HX0 + 0.22, HX1 - 0.22, HY1 - 0.22, HY1), (HX0 + 0.22, HX1 - 0.22, HY0, HY0 + 0.22)):
    box('tile', a[0], a[1], a[2], a[3], 0.0, HZ)
    box('stone_cut', a[0] - (0.015 if a[0] == HX0 else 0), a[1] + (0.015 if a[1] == HX1 else 0), a[2] - (0.015 if a[2] == HY0 else 0),
        a[3] + (0.015 if a[3] == HY1 else 0), HZ, HZ + 0.035)
ix0, ix1, iy0, iy1 = HX0 + 0.22, HX1 - 0.22, HY0 + 0.22, HY1 - 0.22
quad('tile', (ix0, iy0, -0.34), (ix1, iy0, -0.34), (ix1, iy0, 0), (ix0, iy0, 0)); quad('tile', (ix0, iy1, -0.34), (ix1, iy1, -0.34), (ix1, iy1, 0), (ix0, iy1, 0))
quad('tile', (ix0, iy0, -0.34), (ix0, iy1, -0.34), (ix0, iy1, 0), (ix0, iy0, 0)); quad('tile', (ix1, iy0, -0.34), (ix1, iy1, -0.34), (ix1, iy1, 0), (ix1, iy0, 0))
box('filete', HX0 - 0.035, HX0, HY0, HY1 + 0.035, 0, HZ)
box('filete', HX0, HX1 - 0.22, HY1, HY1 + 0.035, 0, HZ)
quad('tile', (ix0, iy0, -0.34), (ix1, iy0, -0.34), (ix1, iy1, -0.34), (ix0, iy1, -0.34))
quad('water', (HX0 + .22, HY0 + .22, 0.42), (HX1 - .22, HY0 + .22, 0.42), (HX1 - .22, HY1 - .22, 0.42), (HX0 + .22, HY1 - .22, 0.42))
for jx in (32.6, 33.1, 33.6):
    box('inox', jx - 0.03, jx + 0.03, HY0 + 0.21, HY0 + 0.225, 0.2, 0.26)
# piso (caco de pedra mineira)
for a in ((31.6, EDGE, 5.0, 10.0), (44.3, EDGE, 0.0, 5.0), (31.6, 34.2, 3.3, 5.0), (31.6, 32.0, 1.1, 3.3)):
    box('caco', a[0], a[1], a[2], a[3], -0.04, 0.0)
box('seixo', 31.6, 44.3, 0.0, 0.8, -0.04, -0.012)               # o canteiro tropical de 80 cm
box('stone_cut', 44.3, 44.36, 0.0, 0.8, -0.03, 0.03)

# ------------------------------------------------------------------ churrasqueira coberta
CX0, CX1, CYF = 35.0, 45.2, 6.5
for xc in (35.21, 38.5, 41.8, 45.0):                            # pilares de tijolinho aparente
    box('brick', xc - 0.21, xc + 0.21, CYF - 0.21, CYF + 0.21, 0, 2.455)
    box('concrete', xc - 0.25, xc + 0.25, CYF - 0.25, CYF + 0.25, 0, 0.06)
box('brick', 44.79, 45.21, 9.58, 10.0, 0, 3.5)
# parede da ponta, do lado do gramado (tijolinho aparente, acompanha o caimento do telhado)
za, zb = roofz(CYF + 0.21) - 0.16, roofz(10.0) - 0.16
G['brick'].add([[35.0, 6.71, 0], [35.2, 6.71, 0], [35.2, 10, 0], [35.0, 10, 0],
                [35.0, 6.71, za], [35.2, 6.71, za], [35.2, 10, zb], [35.0, 10, zb]], BOXF)
box('brick', 35.0, 35.42, CYF - 0.21, CYF + 0.21, 2.455, roofz(CYF) - 0.16)
box('wall_white', CX0, CX1, 10, 10 + T, WH, 3.62)
box('wall_white', 35.2, CX1, 9.985, 10.0, 0, 3.6)
# telhado: estrutura de cumaru + telhas de barro
vdn = np.array([0, -1, -0.27]); vdn = vdn / np.linalg.norm(vdn)
tile_roof('rooftile', (34.6, 10.0, 3.75), (1, 0, 0), vdn, 11.0, (10.0 - 5.85) * math.sqrt(1 + 0.27 ** 2))
for xr in np.arange(34.75, 45.5, 0.535):
    beam('wood_y', (xr, 9.98, roofz(9.98) - 0.09), (xr, 5.9, roofz(5.9) - 0.09), 0.06, 0.12)
box('wood_x', 34.7, 45.5, CYF - 0.1, CYF + 0.1, 2.455, 2.655)
box('wood_x', 35.0, CX1, 9.88, 9.985, 3.42, 3.6)
box('wood_x', 34.6, 45.6, 5.86, 5.9, roofz(5.88) - 0.16, roofz(5.88) - 0.02)   # testeira
for yb in np.arange(6.1, 9.9, 0.4):
    box('wood_x', 34.65, 45.55, yb - 0.025, yb + 0.025, roofz(yb) - 0.032, roofz(yb) - 0.005)
# bancada da pia
box('wall_white', 35.25, 37.0, 9.35, 10, 0, 0.86)
box('granite', 35.2, 37.05, 9.28, 10, 0.86, 0.90)
box('inox', 35.75, 36.4, 9.45, 9.85, 0.898, 0.906)
tube('inox', [(36.07, 9.93, 0.9), (36.07, 9.93, 1.18), (36.07, 9.72, 1.2), (36.07, 9.7, 1.12)], 0.012, seg=6)
box('ladrilho', 35.2, 37.05, 9.975, 9.99, 0.9, 1.65)
box('wood_x', 35.25, 37.0, 9.78, 9.98, 1.85, 1.89)                 # prateleira
for i, xx in enumerate((35.5, 35.85, 36.2, 36.6)):
    cyl('pot_clay' if i % 2 else 'copper', (xx, 9.86, 1.89), 0.09, 0.16, seg=10)
# churrasqueira
box('brick', 37.25, 38.75, 9.2, 10, 0, 0.85)
box('brick', 37.25, 37.42, 9.2, 10, 0.85, 1.6); box('brick', 38.58, 38.75, 9.2, 10, 0.85, 1.6)
box('soot', 37.42, 38.58, 9.9, 9.97, 0.85, 1.6); box('soot', 37.42, 38.58, 9.22, 9.9, 0.85, 0.87)
box('ember', 37.6, 38.4, 9.4, 9.8, 0.87, 0.9)
box('inox', 37.42, 38.58, 9.25, 9.88, 1.06, 1.075)
G['brick'].add([[37.25, 9.2, 1.6], [38.75, 9.2, 1.6], [38.75, 10, 1.6], [37.25, 10, 1.6],
                [37.7, 9.5, 2.45], [38.3, 9.5, 2.45], [38.3, 10, 2.45], [37.7, 10, 2.45]], BOXF)
box('brick', 37.7, 38.3, 9.5, 10, 2.45, 4.45); box('concrete', 37.62, 38.38, 9.42, 10.08, 4.45, 4.5)
box('rooftile', 37.6, 38.4, 9.4, 10.1, 4.62, 4.66)
for a, b in ((37.66, 9.46), (38.28, 9.46), (37.66, 10.0), (38.28, 10.0)):
    box('brick', a, a + 0.06, b, b + 0.06, 4.5, 4.62)
# forno de pão a lenha
box('brick', 39.0, 40.5, 9.0, 10, 0, 0.9)
box('soot', 39.25, 40.25, 8.985, 9.0, 0.12, 0.62)
for i in range(7):
    lx = 39.36 + 0.13 * (i % 7); lz = 0.2 + 0.13 * (i % 3)
    tube('log', [(lx, 8.97, lz), (lx, 9.3, lz)], 0.06, seg=7, cap=True)
box('stone_cut', 38.97, 40.53, 8.9, 10, 0.9, 0.94)
ellipsoid('clay_dome', (39.75, 9.5, 0.94), (0.72, 0.48, 0.66), seg=20, rings=10, zmin=0.0)
box('brick', 39.45, 40.05, 8.96, 9.1, 0.94, 1.36); box('soot', 39.55, 39.95, 8.95, 8.965, 0.94, 1.26)
box('brick', 39.6, 39.9, 9.72, 10, 1.3, 4.3); box('concrete', 39.55, 39.95, 9.67, 10.05, 4.3, 4.34)
# fogão a lenha
box('brick', 40.8, 42.9, 9.15, 10, 0, 0.82)
box('metal_dark', 40.84, 42.5, 9.19, 9.96, 0.82, 0.85)
for xx in (41.2, 41.75, 42.25):
    cyl('soot', (xx, 9.56, 0.851), 0.15, 0.004, seg=16)
box('metal_dark', 41.0, 41.36, 9.135, 9.15, 0.32, 0.62)
box('soot', 41.6, 42.6, 9.135, 9.15, 0.08, 0.5)
for i in range(6):
    tube('log', [(41.7 + 0.15 * i, 9.12, 0.16 + 0.12 * (i % 2)), (41.7 + 0.15 * i, 9.4, 0.16 + 0.12 * (i % 2))], 0.055, seg=7, cap=True)
box('brick', 42.52, 42.9, 9.62, 10, 0.82, 4.3); box('concrete', 42.47, 42.95, 9.57, 10.05, 4.3, 4.34)
cyl('metal_dark', (41.2, 9.56, 0.855), 0.17, 0.2, seg=14); cyl('copper', (41.75, 9.56, 0.855), 0.14, 0.13, seg=14)
cyl('metal_dark', (42.25, 9.56, 0.855), 0.12, 0.09, seg=14)
# balcão de frente para a piscina, banquetas do lado de dentro
box('brick', 35.6, 41.5, 6.42, 6.72, 0, 1.02)
box('wood_x', 35.5, 41.6, 6.3, 7.02, 1.02, 1.085)


def stool(x, y, h=0.74):
    cyl('wood_x', (x, y, h - 0.04), 0.17, 0.04, seg=14)
    for a in range(4):
        an = math.pi / 4 + a * math.pi / 2
        tube('metal_dark', [(x + 0.11 * math.cos(an), y + 0.11 * math.sin(an), h - 0.04), (x + 0.2 * math.cos(an), y + 0.2 * math.sin(an), 0)], 0.012, seg=5)
    cyl('metal_dark', (x, y, 0.25), 0.17, 0.012, seg=14, cap=False)


for xs in (36.3, 37.3, 39.3, 40.3, 41.1):
    stool(xs, 7.28)
# sem mesa de jantar aqui: o trecho entre o fogão a lenha e o desnível (x 42,9 a 46) fica livre,
# porque é a passagem para a escada. Quem senta, senta nas banquetas do balcão.
for xp in (36.6, 38.9, 40.9):                                    # pendentes sobre o balcão
    tube('rope', [(xp, 6.75, 2.45), (xp, 6.75, 2.0)], 0.004, seg=3)
    ellipsoid('pot_fiber', (xp, 6.75, 1.86), (0.19, 0.19, 0.17), seg=12, rings=6, zmin=-0.2)
for xf in (36.85, 40.15, 43.4):                                  # samambaias penduradas na viga da frente
    P.fern_hanging((xf, 6.2, 1.95), rng)
# canteiro de temperos do lado de fora da parede da ponta
box('brick', 33.75, 34.98, 7.0, 9.8, 0, 0.45)
box('mulch', 33.85, 34.9, 7.1, 9.7, 0.44, 0.47)
for i, yy in enumerate(np.arange(7.3, 9.7, 0.34)):
    P.herbs((34.37 + 0.2 * (i % 2 - 0.5), yy, 0.47), rng, kind=i % 4)

# ------------------------------------------------------------------ canto do chuveirão
box('filete', 44.6, 45.95, 0.0, 0.06, 0, WH)
tube('copper', [(45.27, 0.09, 0.0), (45.27, 0.09, 2.2), (45.27, 0.14, 2.24), (45.27, 0.5, 2.24)], 0.022, seg=7)
cyl('copper', (45.27, 0.5, 2.18), 0.19, 0.04, seg=16)
cyl('copper', (45.27, 0.09, 1.1), 0.035, 0.02, seg=8)
for i in range(9):
    box('wood_y', 44.72 + i * 0.125, 44.72 + i * 0.125 + 0.105, 0.1, 1.05, 0.0, 0.035)
for k in range(14):
    a = k * 2.4; rr = 0.03 + 0.012 * k
    sx, sy = 45.27 + rr * math.cos(a), 0.5 + rr * math.sin(a)
    tube('stream', [(sx, sy, 2.17), (sx + 0.3 * rr * math.cos(a), sy + 0.3 * rr * math.sin(a), 0.05)], 0.004, seg=4)
box('wood_x', 44.7, 45.0, 0.08, 0.36, 0.43, 0.47)
for xx in (44.72, 44.93):
    box('wood_z', xx, xx + 0.05, 0.1, 0.34, 0, 0.43)


# ------------------------------------------------------------------ guarda-corpos
_posts = set()
_rail_n = [0]


def guarda(p0, p1, zb, h=1.1, mat_long='wood_x'):
    p0 = np.array([p0[0], p0[1], zb], float); p1 = np.array([p1[0], p1[1], zb], float)
    L = np.linalg.norm(p1 - p0); d = (p1 - p0) / L
    along_x = abs(d[0]) > abs(d[1])
    ml = 'wood_x' if along_x else 'wood_y'
    _rail_n[0] += 1
    dz = 0.0017 * (_rail_n[0] % 5)            # evita que guarda-corpos que se cruzam fiquem coplanares
    n = max(1, int(round(L / 1.25)))
    for i in range(n + 1):
        c = p0 + d * (L * i / n)
        key = (round(c[0], 2), round(c[1], 2), round(zb, 2))
        if key in _posts:
            continue
        _posts.add(key)
        obox('wood_z', c + np.array([0, 0, h / 2]), (0.075, 0.075, h - 0.02))
    beam(ml, p0 + np.array([0, 0, h + dz]), p1 + np.array([0, 0, h + dz]), 0.10, 0.045)
    beam(ml, p0 + np.array([0, 0, 0.1 + dz]), p1 + np.array([0, 0, 0.1 + dz]), 0.045, 0.05)
    beam(ml, p0 + np.array([0, 0, h - 0.1 + dz]), p1 + np.array([0, 0, h - 0.1 + dz]), 0.045, 0.05)
    m = int(L / 0.115)
    for i in range(1, m):
        c = p0 + d * (L * i / m)
        obox('wood_z', c + np.array([0, 0, 0.1 + (h - 0.2) / 2]), (0.028, 0.028, h - 0.25))


guarda((EDGE - 0.04, 0.12), (EDGE - 0.04, 3.2), 0.0)
guarda((EDGE - 0.04, 6.2), (EDGE - 0.04, 7.7), 0.0)
guarda((EDGE - 0.04, 9.3), (EDGE - 0.04, 9.95), 0.0)
box('filete', EDGE, EDGE + 0.08, 0, 10, -1.47, 0.0)               # revestimento do muro de arrimo

# ------------------------------------------------------------------ deck de madeira sobre o laguinho das carpas
DX0, DX1, DY0, DY1 = EDGE, 48.0, 3.2, 6.2      # 2 m de fundo x 3 m de largura, 1 m acima do quintal de baixo
nb = 19
for i in range(nb):
    x0 = DX0 + i * (DX1 - DX0) / nb
    box('wood_y', x0 + 0.004, x0 + (DX1 - DX0) / nb - 0.004, DY0, DY1, -0.028, 0.004)
for yy in (3.28, 3.98, 4.7, 5.42, 6.12):
    box('wood_x', DX0, DX1, yy - 0.035, yy + 0.035, -0.19, -0.028)
box('wood_y', DX1 - 0.2, DX1 - 0.06, DY0, DY1, -0.38, -0.19)
for yy in (DY0, DY1 - 0.14):
    box('wood_z', DX1 - 0.19, DX1 - 0.07, yy + 0.01, yy + 0.13, -1.5, -0.38)
box('wood_y', DX1, DX1 + 0.03, DY0, DY1, -0.19, -0.002)
guarda((DX0, DY0 + 0.04), (DX1 - 0.04, DY0 + 0.04), 0.0)
guarda((DX1 - 0.04, DY0 + 0.04), (DX1 - 0.04, DY1 - 0.04), 0.0)
guarda((DX1 - 0.04, DY1 - 0.04), (DX0, DY1 - 0.04), 0.0)
# laguinho: metade sob o deck, metade aberta; borda de tijolo elevada, na altura de um banco
QX0, QX1, QY0, QY1 = EDGE + 0.08, 49.4, 2.95, 6.45
ZR = LOW + 0.45
box('brick', QX1 - 0.2, QX1, QY0, QY1, -1.47, ZR)
box('brick', QX0, QX1 - 0.2, QY0, QY0 + 0.2, -1.47, ZR)
box('brick', QX0, QX1 - 0.2, QY1 - 0.2, QY1, -1.47, ZR)
box('stone_cut', QX1 - 0.25, QX1 + 0.04, QY0 - 0.04, QY1 + 0.04, ZR, ZR + 0.035)
box('stone_cut', QX0, QX1 - 0.25, QY0 - 0.04, QY0 + 0.25, ZR, ZR + 0.035)
box('stone_cut', QX0, QX1 - 0.25, QY1 - 0.25, QY1 + 0.04, ZR, ZR + 0.035)
quad('pond_floor', (QX0, QY0, -1.46), (QX1, QY0, -1.46), (QX1, QY1, -1.46), (QX0, QY1, -1.46))
quad('water_pond', (QX0, QY0 + 0.2, ZR - 0.09), (QX1 - 0.2, QY0 + 0.2, ZR - 0.09), (QX1 - 0.2, QY1 - 0.2, ZR - 0.09), (QX0, QY1 - 0.2, ZR - 0.09))
koi = [(48.7, 4.2, 0.3, 'koi_o'), (48.4, 5.3, 2.2, 'koi_w'), (48.85, 5.6, 1.2, 'koi_o'), (47.9, 4.6, 4.0, 'koi_k'),
       (48.55, 3.75, 5.1, 'koi_w'), (47.5, 5.5, 0.9, 'koi_o'), (48.9, 4.85, 2.9, 'koi_o'), (47.2, 3.9, 3.5, 'koi_w')]
for kx, ky, ka, km in koi:
    R = rotz(ka)
    ellipsoid(km, (kx, ky, ZR - 0.17), (0.25, 0.07, 0.055), seg=10, rings=6, R=R)
    tail = np.array([kx, ky, ZR - 0.17]) - R @ np.array([0.3, 0, 0])
    ellipsoid(km, tail, (0.09, 0.015, 0.06), seg=6, rings=4, R=R)
    ellipsoid('koi_w' if km != 'koi_w' else 'koi_o', np.array([kx, ky, ZR - 0.135]) + R @ np.array([0.06, 0, 0]), (0.09, 0.05, 0.03), seg=7, rings=4, R=R)
# chão do quintal de baixo em volta do laguinho
for a in ((QX1, 60, 0, 10), (EDGE, QX1, 0, QY0), (EDGE, QX1, QY1, 10)):
    box('pedrisco', a[0], a[1], a[2], a[3], LOW - 0.04, LOW)
# escada
for i in range(5):
    box('stone_cut', EDGE + 0.08 + 0.3 * i, EDGE + 0.08 + 0.3 * (i + 1), 7.7, 9.3, LOW, -(i + 1) / 6.0 + 0.0)
box('stone_cut', EDGE - 0.3, EDGE + 0.08, 7.7, 9.3, -0.02, 0.02)
# plantas na beira do laguinho
P.papiro((49.0, 3.35, ZR - 0.1), rng); P.papiro((48.95, 6.05, ZR - 0.1), rng, n=10)
P.inhame((48.7, 3.42, ZR - 0.1), rng, n=7); P.inhame((48.62, 6.08, ZR - 0.1), rng, n=7)
P.pacova((48.7, 2.55, LOW), rng, 1.1); P.pacova((48.8, 6.85, LOW), rng, 1.1); P.moreia((49.6, 2.75, LOW), rng); P.moreia((49.65, 6.6, LOW), rng)
P.asplenio((46.5, 2.5, LOW), rng, 1.1); P.xanadu((47.3, 6.95, LOW), rng, 1.1); P.xanadu((46.6, 7.15, LOW), rng, 0.9)

# ------------------------------------------------------------------ poço antigo com cara de poço de fazenda
WC = (51.9, 6.3)
cyl('brick', (WC[0], WC[1], LOW), 0.92, 0.65, seg=28, cap=False)
annulus('stone_cut', WC, 0.66, 0.97, LOW + 0.65, seg=28)
disc('wood_x', WC, 0.66, LOW + 0.62, seg=28)
for sgn in (-1, 1):
    box('wood_z', WC[0] - 0.05, WC[0] + 0.05, WC[1] + sgn * 0.84 - 0.05, WC[1] + sgn * 0.84 + 0.05, LOW + 0.3, 1.02)
box('wood_y', WC[0] - 0.04, WC[0] + 0.04, WC[1] - 1.0, WC[1] + 1.0, 0.98, 1.06)
tube('wood_y', [(WC[0], WC[1] - 0.84, 0.55), (WC[0], WC[1] + 0.84, 0.55)], 0.045, seg=8)
for sgn in (1, -1):
    v = np.array([sgn * 0.72, 0, -0.42]); L = np.linalg.norm(v); v /= L
    tile_roof('rooftile', (WC[0], WC[1] - 1.08, 1.12), (0, 1, 0), v, 2.16, L)
tube('rope', [(WC[0], WC[1] + 0.2, 0.55), (WC[0], WC[1] + 0.2, -0.05)], 0.008, seg=4)
cyl('wood_z', (WC[0], WC[1] + 0.2, -0.3), 0.13, 0.26, seg=12, r_top=0.16)
for a in np.linspace(0, 2 * math.pi, 9)[:-1]:
    P.moreia((WC[0] + 1.12 * math.cos(a), WC[1] + 1.12 * math.sin(a), LOW), rng, 0.7)

# ------------------------------------------------------------------ cobertura da garagem (baixa, encostada no muro lateral)
GZH, GS_ = 2.3, 0.212
vg = np.array([0, -1, -GS_]); vg /= np.linalg.norm(vg)
tile_roof('rooftile', (52.3, 10.0, GZH), (1, 0, 0), vg, 6.4, 3.3 * math.sqrt(1 + GS_ ** 2))
for xr in np.arange(52.4, 58.75, 0.6):
    beam('wood_y', (xr, 9.98, GZH - 0.08), (xr, 6.72, GZH - GS_ * 3.28 - 0.08), 0.06, 0.1)
zbm = GZH - GS_ * 3.0 - 0.13
box('wood_x', 52.3, 58.7, 6.92, 7.08, zbm - 0.18, zbm)
box('wood_x', 52.3, 58.7, 9.9, 9.98, GZH - 0.32, GZH - 0.13)
for xx in (52.45, 55.5, 58.55):
    box('wood_z', xx - 0.08, xx + 0.08, 6.92, 7.08, LOW, zbm - 0.18)
    box('wood_z', xx - 0.06, xx + 0.06, 9.86, 9.98, LOW, GZH - 0.32)
box('stone_cut', 52.3, 58.7, 6.9, 9.98, LOW - 0.01, LOW + 0.012)

# ------------------------------------------------------------------ pergolado + cinema no muro
box('screen', 52.2, 55.8, 0.0, 0.025, -0.74, 1.27)
for a in ((52.1, 55.9, -0.84, -0.74), (52.1, 55.9, 1.27, 1.37)):
    box('wood_x', a[0], a[1], 0.0, 0.05, a[2], a[3])
for xx in (52.1, 55.8):
    box('wood_z', xx, xx + 0.1, 0.0, 0.05, -0.84, 1.37)
PZ = 1.55
for xx in (51.7, 56.3):
    for yy in (0.4, 4.0):
        box('wood_z', xx - 0.07, xx + 0.07, yy - 0.07, yy + 0.07, LOW, PZ)
for yy in (0.4, 4.0):
    box('wood_x', 51.35, 56.65, yy - 0.05, yy + 0.05, PZ, PZ + 0.18)
for xx in np.arange(51.5, 56.6, 0.42):
    box('wood_y', xx - 0.03, xx + 0.03, 0.06, 4.35, PZ + 0.18, PZ + 0.3)
P.vine_top('leaf_vine_light', 51.5, 56.5, 0.1, 4.3, PZ + 0.32, rng, density=120, flower='flower_red')
for xx, yy in ((51.7, 4.0), (56.3, 4.0), (56.3, 0.4)):
    tube('bark_cane', [(xx + 0.09, yy, LOW), (xx + 0.1, yy + 0.02, 0.3), (xx + 0.08, yy, PZ + 0.2)], 0.02, seg=5)
    P.vine_wall('leaf_vine_light', yy - 0.2, yy + 0.2, LOW + 0.2, PZ, xx + 0.1, 1, rng, density=120, cover=0.5, axis='x')
box('stone_cut', 51.4, 56.6, 0.0, 4.4, LOW - 0.01, LOW + 0.015)
# sofá de frente para a tela + pufes + mesa baixa
box('wood_x', 52.5, 55.5, 3.05, 3.85, LOW + 0.1, LOW + 0.3)
box('cushion', 52.52, 55.48, 3.07, 3.7, LOW + 0.3, LOW + 0.44)
box('wood_x', 52.5, 55.5, 3.72, 3.85, LOW + 0.3, LOW + 0.85)
for i in range(4):
    box('cushion' if i % 2 else 'cushion_teal', 52.6 + 0.72 * i, 53.25 + 0.72 * i, 3.52, 3.72, LOW + 0.44, LOW + 0.82)
for xx in (52.5, 55.38):
    box('wood_y', xx, xx + 0.12, 3.05, 3.85, LOW + 0.3, LOW + 0.62)
for xx, yy in ((53.0, 1.75), (55.0, 1.75)):
    cyl('cushion_teal', (xx, yy, LOW), 0.3, 0.4, seg=16)
box('wood_x', 53.55, 54.45, 1.9, 2.5, LOW + 0.3, LOW + 0.36)
for xx in (53.6, 54.35):
    box('wood_z', xx, xx + 0.05, 1.95, 2.45, LOW, LOW + 0.3)

# ------------------------------------------------------------------ treliça no poste de luz, plantio do canto, caminho
tube('concrete', [(59.45, 2.3, LOW), (59.45, 2.3, 5.2)], [0.15, 0.09], seg=8)
box('wall_out', 59.33, 59.57, 2.14, 2.2, LOW + 1.0, LOW + 1.6)
P.vine_wall('leaf_vine', 0.2, 2.6, LOW + 0.1, LOW + WH, 59.99, -1, rng, density=260, cover=0.6, axis='x', seed=2.0)
P.vine_wall('white', 0.2, 2.6, LOW + 0.3, LOW + WH, 59.97, -1, rng, density=25, cover=0.5, axis='x', seed=2.0, leaf=0.035)
P.bananeira((59.0, 9.0, LOW), rng, stems=3, H=2.9)
P.bananeira((59.2, 7.75, LOW), rng, stems=2, H=2.2, bunch=False)
P.heliconia((58.95, 7.2, LOW), rng, n=8, H=1.7)
P.small_tree((50.2, 9.15, LOW), rng, fruit='fruit_red')          # pitangueira
disc('mulch', (50.2, 9.15), 0.8, LOW + 0.006)
for i in range(15):                                              # pisantes da escada até o portão
    t = i / 14
    px = 48.3 + (59.3 - 48.3) * t; py = 8.5 + (5.1 - 8.5) * (3 * t * t - 2 * t ** 3)
    obox('stone_step', (px, py, LOW + 0.012), (0.5, 0.85, 0.03), rotz(-0.3 * math.sin(math.pi * t)))

# ------------------------------------------------------------------ as árvores grandes
P.mangueira((30.3, 2.1, 0), rng)
disc('pedrisco', (30.3, 2.1), 1.28, 0.008, seg=40)
cyl('brick', (30.3, 2.1, 0), 1.1, 0.42, seg=32, cap=False)
cyl('brick', (30.3, 2.1, 0), 0.74, 0.42, seg=32, cap=False)
annulus('wood_x', (30.3, 2.1), 0.70, 1.16, 0.44, seg=40)
am = P.amendoeira((47.4, 1.5, LOW), rng)
disc('seixo', (47.4, 1.5), 1.25, LOW + 0.008, seg=36)
# balanço na amendoeira
P.limb('bark_dark', (47.7, 1.7, 2.3), (50.3, 1.9, 2.75), 0.13, 0.07, rng, bend=0.03)
for yy in (1.62, 2.12):
    tube('rope', [(50.0, yy, 2.72), (50.0, yy, LOW + 0.5)], 0.008, seg=4)
box('wood_y', 49.9, 50.1, 1.52, 2.22, LOW + 0.46, LOW + 0.5)

# ------------------------------------------------------------------ a faixa tropical de 80 cm ao longo do muro junto à piscina
P.vine_wall('leaf_vine', 31.0, EDGE, 0.05, WH, 0.0, 1, rng, density=420, cover=0.5, seed=1.3, leaf=0.07)
ZB = -0.012
back, front = 0.24, 0.58
P.dracena((32.35, back, ZB), rng, canes=3, H=2.3); P.pacova((32.9, front, ZB), rng)
P.rafis((33.45, back, ZB), rng, H=1.8); P.asplenio((33.95, front - 0.05, ZB), rng)
P.dracena((34.5, back, ZB), rng, canes=2, H=1.9); P.xanadu((35.0, front, ZB), rng, 0.85)
P.alpinia((35.55, back, ZB), rng, H=1.6); P.moreia((36.05, front, ZB), rng)
P.rafis((36.55, back, ZB), rng, H=1.7); P.xanadu((37.05, front, ZB), rng, 0.85)
P.heliconia((37.6, back, ZB), rng, n=8, H=1.8); P.moreia((38.1, front, ZB), rng, 0.8)
P.heliconia((38.95, 0.3, ZB), rng, n=8, H=2.2, flower='flower_orange'); P.heliconia((39.85, 0.3, ZB), rng, n=8, H=2.2)
P.alpinia((40.55, back, ZB), rng, H=1.7); P.xanadu((41.0, front, ZB), rng, 0.85)
P.heliconia((41.55, back, ZB), rng, n=8, H=1.9, flower='flower_orange'); P.moreia((42.05, front, ZB), rng)
P.alpinia((42.55, back, ZB), rng, H=1.6); P.xanadu((43.05, front, ZB), rng, 0.85)
P.heliconia((43.55, back, ZB), rng, n=7, H=1.8); P.asplenio((44.0, front - 0.1, ZB), rng, 0.9)
for xx in np.arange(31.8, 44.25, 0.27):
    P.grama_preta((xx, 0.74, ZB), rng)
for xx, zz in ((33.0, 1.5), (36.05, 1.75), (41.05, 1.65), (44.2, 1.7)):
    P.chifre((xx, 0.0, zz), 1, rng)
for xx, zz in ((34.6, 1.5), (37.2, 1.9), (42.4, 1.45)):
    box('wood_z', xx - 0.2, xx + 0.2, 0.0, 0.03, zz - 0.28, zz + 0.1)
    box('wood_x', xx - 0.22, xx + 0.22, 0.0, 0.16, zz - 0.3, zz - 0.27)
    P.bromelia((xx - 0.08, 0.09, zz - 0.26), rng, 0.8); P.bromelia((xx + 0.1, 0.1, zz - 0.26), rng, 0.65, red=False)
# em volta da hidro / do chuveirão
P.asplenio((45.75, 0.5, 0), rng, 0.9)

# ------------------------------------------------------------------ lado do gramado: pomar, coqueiros, galinheiro
P.coqueiro((26.4, 8.55, 0), 6.4, rng, lean_az=-1.9, lean=1.0)
P.coqueiro((23.7, 8.95, 0), 5.0, rng, lean_az=-1.2, lean=0.7)
P.coqueiro((21.2, 8.3, 0), 7.3, rng, lean_az=-2.4, lean=1.2)
P.jabuticabeira((11.3, 2.3, 0), rng)                              # centro da pracinha entre as casas
P.goiabeira((16.9, 8.0, 0), rng)
P.citrus((22.6, 1.9, 0), rng, fruit='fruit_lemon')
P.citrus((30.4, 8.75, 0), rng, fruit='fruit_lemon', R=0.95, n=22)
P.bananeira((6.9, 8.9, 0), rng, stems=3, H=2.8)
for c, r in (((26.4, 8.55), 0.8), ((23.7, 8.95), 0.7), ((21.2, 8.3), 0.8), ((11.3, 2.3), 1.15), ((16.9, 8.0), 1.1), ((22.6, 1.9), 0.9),
             ((30.4, 8.75), 0.75), ((6.9, 8.9), 0.9)):
    disc('mulch', c, r, 0.006, seg=28)
    for a in np.linspace(0, 2 * math.pi, int(r * 9))[:-1]:
        P.grama_preta((c[0] + r * math.cos(a), c[1] + r * math.sin(a), 0.0), rng)
for xx in np.arange(1.2, 31.4, 0.86):                            # pisantes ao longo da trilha batida
    yy = 4.9 + 0.85 * math.sin(xx / 4.6)
    obox('stone_step', (xx, yy, 0.012), (0.5, 0.85, 0.03), rotz(math.atan(0.85 / 4.6 * math.cos(xx / 4.6))))
P.vine_wall('leaf_vine_light', 8.3, 14.3, 0.3, 2.2, 0.0, 1, rng, density=150, cover=0.5, seed=4.0, leaf=0.11)   # maracujá
for i in range(14):
    ellipsoid('fruit_goiaba', (rng.uniform(8.5, 14.1), 0.07, rng.uniform(0.7, 1.9)), 0.04, seg=7, rings=5)
# galinheiro no canto junto ao portão do gramado
box('brick', 0.47, 2.18, 7.5, 7.62, 0, 1.9); box('brick', 0.35, 0.47, 7.5, 9.8, 0, 2.2); box('brick', 2.18, 2.3, 7.5, 9.8, 0, 2.2)
box('wood_z', 1.0, 1.65, 7.47, 7.5, 0.05, 1.6)
vh = np.array([0, -1, -0.3]); vh /= np.linalg.norm(vh)
tile_roof('rooftile', (0.15, 9.95, 2.72), (1, 0, 0), vh, 5.4, 2.85 * math.sqrt(1.09))
for xx in np.arange(0.3, 5.5, 0.62):
    beam('wood_y', (xx, 9.9, 2.66), (xx, 7.2, 2.66 - 0.3 * 2.7), 0.05, 0.08)
for xx in (2.3, 3.8, 5.3):
    box('wood_z', xx - 0.05, xx + 0.05, 7.49, 7.61, 0, 1.95); box('wood_z', xx - 0.05, xx + 0.05, 9.7, 9.8, 0, 2.55)
box('wood_x', 2.3, 5.35, 7.5, 7.6, 1.9, 2.0); box('brick', 2.3, 5.35, 7.5, 7.6, 0, 0.45); box('brick', 5.25, 5.35, 7.5, 9.8, 0, 0.45)
quad('mesh', (2.3, 7.55, 0.45), (5.3, 7.55, 0.45), (5.3, 7.55, 1.9), (2.3, 7.55, 1.9))
quad('mesh', (5.3, 7.55, 0.45), (5.3, 9.8, 0.45), (5.3, 9.8, 2.5), (5.3, 7.55, 1.9))
box('mulch', 2.3, 5.25, 7.6, 9.8, 0, 0.02)
for hx, hy, hm in ((3.2, 8.4, 'hen_w'), (4.3, 9.0, 'hen_b'), (4.6, 8.1, 'hen_b')):
    ellipsoid(hm, (hx, hy, 0.25), (0.17, 0.11, 0.13), seg=10, rings=6)
    ellipsoid(hm, (hx + 0.15, hy, 0.4), 0.06, seg=8, rings=5)
    ellipsoid('crista', (hx + 0.16, hy, 0.47), (0.03, 0.012, 0.025), seg=6, rings=4)


# ------------------------------------------------------------------ objetos de decoração
def lounger(x0, y0, zf):
    box('white', x0, x0 + 1.25, y0, y0 + 0.62, zf + 0.33, zf + 0.38)
    beam('white', (x0 + 1.25, y0 + 0.31, zf + 0.355), (x0 + 1.85, y0 + 0.31, zf + 0.78), 0.62, 0.05)
    for xx in (x0 + 0.08, x0 + 1.12, x0 + 1.75):
        for yy in (y0 + 0.04, y0 + 0.54):
            box('white', xx, xx + 0.04, yy, yy + 0.04, zf, zf + 0.34)


lounger(41.75, 1.32, -0.38); lounger(41.75, 2.3, -0.38)


def varal(p0, p1, sag, n=12):
    p0 = np.array(p0, float); p1 = np.array(p1, float)
    f = lambda t: p0 + (p1 - p0) * t - np.array([0, 0, sag * 4 * t * (1 - t)])
    tube('metal_dark', [f(t) for t in np.linspace(0, 1, 25)], 0.006, seg=4)
    for t in np.linspace(0.05, 0.95, n):
        ellipsoid('bulb', f(t) - np.array([0, 0, 0.055]), 0.038, seg=8, rings=6)


varal((34.65, 5.9, 2.5), (30.5, 2.5, 3.3), 0.45, 12)
varal((34.65, 9.7, 3.5), (26.9, 8.6, 4.6), 0.7, 16)
# fogueira com bancos de tora, longe das copas das árvores
FC = (20.6, 6.2)
cyl('filete', (FC[0], FC[1], 0), 0.62, 0.3, seg=24, cap=False); annulus('stone_cut', FC, 0.42, 0.66, 0.3, seg=24)
disc('soot', FC, 0.42, 0.2, seg=24); disc('pedrisco', FC, 1.7, 0.009, seg=40)
for a in (0.3, 1.5, 2.7):
    tube('log', [(FC[0] + 0.3 * math.cos(a), FC[1] + 0.3 * math.sin(a), 0.22), (FC[0] - 0.3 * math.cos(a), FC[1] - 0.3 * math.sin(a), 0.34)], 0.055, seg=7, cap=True)
for a in (0.5, 1.9, 3.3, 4.7):
    cyl('log', (FC[0] + 1.35 * math.cos(a), FC[1] + 1.35 * math.sin(a), 0), 0.21, 0.42, seg=12)
# balizadores baixos no caminho
for xx in np.arange(3.0, 30.0, 4.4):
    yy = 4.9 + 0.85 * math.sin(xx / 4.6) + 0.72
    cyl('metal_dark', (xx, yy, 0), 0.035, 0.42, seg=8); ellipsoid('bulb', (xx, yy, 0.45), 0.05, seg=8, rings=6)
# vasos grandes de barro
for vx, vy, kind in ((41.95, 5.9, 0), (44.72, 5.9, 1), (31.95, 5.55, 1), (0.75, 2.35, 2), (0.75, 7.05, 2), (45.55, 9.66, 0)):      # o último fica no canto, fora da boca da escada (y 7,7 a 9,3)
    top = P.pot((vx, vy, 0), 0.3, 0.6)
    if kind == 0:
        P.xanadu(top, rng, 0.9)
    elif kind == 1:
        P.moreia(top, rng, 1.0); P.bromelia(top, rng, 0.9)
    else:
        P.areca(top, rng, H=1.8, stems=5)
# casa na árvore na amendoeira + escada
TX0, TX1, TY0, TY1, TZ = 46.55, 48.75, 0.3, 2.65, 1.25
nbd = int((TY1 - TY0) / 0.12)
for i in range(nbd):
    box('wood_x', TX0, TX1, TY0 + i * (TY1 - TY0) / nbd + 0.004, TY0 + (i + 1) * (TY1 - TY0) / nbd - 0.004, TZ - 0.03, TZ)
for xx in (TX0 + 0.05, (TX0 + TX1) / 2 - 0.04, TX1 - 0.13):
    box('wood_y', xx, xx + 0.08, TY0, TY1, TZ - 0.19, TZ - 0.03)
for xx in (TX0 + 0.03, TX1 - 0.15):
    for yy in (TY0 + 0.03, TY1 - 0.15):
        box('wood_z', xx, xx + 0.12, yy, yy + 0.12, LOW, TZ - 0.03)
guarda((TX0 + 0.04, TY0 + 0.04), (TX1 - 0.04, TY0 + 0.04), TZ, h=0.95)
guarda((TX0 + 0.04, TY1 - 0.04), (TX1 - 0.04, TY1 - 0.04), TZ, h=0.95)
guarda((TX0 + 0.04, TY0 + 0.04), (TX0 + 0.04, TY1 - 0.04), TZ, h=0.95)
guarda((TX1 - 0.04, TY0 + 0.04), (TX1 - 0.04, 1.15), TZ, h=0.95)
guarda((TX1 - 0.04, 1.85), (TX1 - 0.04, TY1 - 0.04), TZ, h=0.95)
for yy in (1.22, 1.78):
    beam('wood_z', (TX1 + 0.75, yy, LOW), (TX1, yy, TZ + 0.02), 0.05, 0.09)
for k in range(1, 8):
    t = k / 8
    box('wood_y', TX1 + 0.75 * (1 - t) - 0.02, TX1 + 0.75 * (1 - t) + 0.02, 1.22, 1.78, LOW + (TZ - LOW) * t - 0.02, LOW + (TZ - LOW) * t + 0.02)
# mais verde nos muros do gramado e ao pé deles
P.vine_wall('leaf_vine', 22.0, 31.0, 0.05, WH, 0.0, 1, rng, density=200, cover=0.4, seed=7.7)
P.vine_wall('leaf_vine_light', 14.3, 20.0, 0.3, 2.25, 10.0, -1, rng, density=150, cover=0.5, seed=9.1, leaf=0.11)
for xx in np.arange(1.5, 28.0, 1.7):
    if not (2.6 < xx < 8.4) and not (14.2 < xx < 20.0) and abs(xx - 11.3) > 1.5 and abs(xx - 22.6) > 1.2:
        P.moreia((xx, 0.45, 0.0), rng, 0.8)
for xx in np.arange(7.8, 33.0, 1.7):
    if not (8.4 < xx < 14.2) and min(abs(xx - c) for c in (6.9, 16.9, 21.2, 23.7, 26.4, 30.4)) > 1.2:
        P.moreia((xx, 9.5, 0.0), rng, 0.8)
P.heliconia((1.0, 1.2, 0), rng, n=9, H=1.8, spread=0.3); P.heliconia((2.1, 0.9, 0), rng, n=7, H=1.5, flower='flower_orange', spread=0.3)


# ------------------------------------------------------------------ as três tiny houses (uma vilinha no gramado)
HD, HEAVE, HZH, HSL = 2.8, 0.7, 3.42, 0.27      # profundidade a partir do muro, beiral, altura do telhado junto ao muro, inclinação do telhado
rv = np.random.default_rng(23)


def path_y(x):
    return 4.9 + 0.85 * math.sin(x / 4.6)


class Casa:
    """Referência local de uma tiny house: u corre ao longo do muro a partir da ponta da porta
    (espelhado na casa azul), d é a distância a partir do muro de fundo (0) até a frente (HD)."""

    def __init__(self, x0, x1, side, espelho):
        self.x0, self.x1, self.side, self.esp = x0, x1, side, espelho
        self.sg = 1 if side == 0 else -1
        self.yr = 0.0 if side == 0 else 10.0

    def X(self, u):
        return self.x1 - u if self.esp else self.x0 + u

    def Y(self, d):
        return self.yr + self.sg * d

    def fx(self, ua, ub):
        a, b = self.X(ua), self.X(ub)
        return min(a, b), max(a, b)

    def fy(self, da, db):
        a, b = self.Y(da), self.Y(db)
        return min(a, b), max(a, b)

    def p(self, u, d, z):
        return (self.X(u), self.Y(d), z)

    def caixa(self, mat, ua, ub, da, db, z0, z1, col=False):
        xa, xb = self.fx(ua, ub); ya, yb = self.fy(da, db)
        box(mat, xa, xb, ya, yb, z0, z1)
        if col:
            colisor(xa, xb, ya, yb, z0, z1)

    def colide(self, ua, ub, da, db, z0, z1):
        xa, xb = self.fx(ua, ub); ya, yb = self.fy(da, db)
        colisor(xa, xb, ya, yb, z0, z1)

    def prisma(self, mat, ua, ub, da, db, z0, topo, col=False):
        """Caixa com o topo inclinado acompanhando o telhado (topo(d) dá a altura)."""
        xa, xb = self.fx(ua, ub)
        d0, d1 = (da, db) if self.Y(da) <= self.Y(db) else (db, da)
        y0, y1 = self.Y(d0), self.Y(d1)
        t0, t1 = topo(d0), topo(d1)
        G[mat].add([[xa, y0, z0], [xb, y0, z0], [xb, y1, z0], [xa, y1, z0],
                    [xa, y0, t0], [xb, y0, t0], [xb, y1, t1], [xa, y1, t1]], BOXF)
        if col:
            colisor(xa, xb, y0, y1, z0, max(t0, t1))

    def laje(self, mat, ua, ub, da, db, topo, esp):
        """Placa fina inclinada acompanhando o telhado (forro)."""
        xa, xb = self.fx(ua, ub)
        d0, d1 = (da, db) if self.Y(da) <= self.Y(db) else (db, da)
        y0, y1 = self.Y(d0), self.Y(d1)
        t0, t1 = topo(d0), topo(d1)
        G[mat].add([[xa, y0, t0 - esp], [xb, y0, t0 - esp], [xb, y1, t1 - esp], [xa, y1, t1 - esp],
                    [xa, y0, t0], [xb, y0, t0], [xb, y1, t1], [xa, y1, t1]], BOXF)

    def parede_u(self, mat, ua, ub, da, db, aberturas, topo):
        """Parede ao longo de u (frente ou fundo) com vãos [(u0, u1, z0, z1)]."""
        cortes = sorted(set([ua, ub] + [c for a in aberturas for c in a[:2] if ua < c < ub]))
        for a, b in zip(cortes[:-1], cortes[1:]):
            vaos = sorted([o for o in aberturas if o[0] <= a + 1e-6 and o[1] >= b - 1e-6], key=lambda o: o[2])
            z = 0.0
            for o in vaos:
                if o[2] - z > 1e-4:
                    self.caixa(mat, a, b, da, db, z, o[2], col=z < 1.9)
                z = o[3]
            self.prisma(mat, a, b, da, db, z, topo, col=z < 1.9)

    def parede_d(self, mat, ua, ub, da, db, aberturas, topo):
        """Parede ao longo de d (pontas da casa) com vãos [(d0, d1, z0, z1)]."""
        cortes = sorted(set([da, db] + [c for a in aberturas for c in a[:2] if da < c < db]))
        for a, b in zip(cortes[:-1], cortes[1:]):
            vaos = sorted([o for o in aberturas if o[0] <= a + 1e-6 and o[1] >= b - 1e-6], key=lambda o: o[2])
            z = 0.0
            for o in vaos:
                if o[2] - z > 1e-4:
                    self.caixa(mat, ua, ub, a, b, z, o[2], col=z < 1.9)
                z = o[3]
            self.prisma(mat, ua, ub, a, b, z, topo, col=z < 1.9)


EXTRA = {'colisores': [], 'pisos': [], 'portas': [], 'luzes': [], 'ventiladores': [], 'lugares': [], 'casas': []}


def colisor(x0, x1, y0, y1, z0, z1):
    EXTRA['colisores'].append([round(min(x0, x1), 3), round(max(x0, x1), 3), round(min(y0, y1), 3), round(max(y0, y1), 3),
                               round(z0, 3), round(z1, 3)])


TP = 0.12          # espessura das paredes das casinhas
PISO = 0.10        # o piso de dentro fica 10 cm acima do gramado


def tiny_house(x0, x1, side, acc, tecido, nome, espelho=False, beliche=False):
    """Tiny house de 5 x 2,8 m encostada no muro, oca, com banheiro, cama e copa.
    Planta local: porta em u 0,85-1,75; janela da frente em u 2,75-4,05; copa na ponta da porta;
    cama no meio; banheiro no fundo da outra ponta, com a janelinha alta; mesinha na frente do banheiro."""
    c = Casa(x0, x1, side, espelho)
    zr = HZH - 0.16
    zf = HZH - HSL * HD - 0.16

    def topo(d):
        return zr + (zf - zr) * d / HD

    U1 = 5.0
    porta = (0.85, 1.75, PISO, 2.24)
    janela = (2.75, 4.05, 1.05, 2.05)
    janelinha = (0.25, 0.85, 1.69, 2.09)
    # --- paredes (o fundo encosta no muro do terreno)
    c.parede_u('house_white', 0.0, U1, HD - TP, HD, [porta, janela], topo)
    c.parede_u('house_white', 0.0, U1, 0.0, TP, [], topo)
    c.parede_d('house_white', 0.0, TP, TP, HD - TP, [], topo)
    c.parede_d('house_white', U1 - TP, U1, TP, HD - TP, [janelinha], topo)
    # --- piso, forro de madeira acompanhando o telhado, duas vigas aparentes
    c.caixa('piso_madeira', TP, U1 - TP, TP, HD - TP, 0.0, PISO)
    c.caixa('piso_madeira', porta[0], porta[1], HD - TP, HD, 0.0, PISO)
    xa, xb = c.fx(TP, U1 - TP)
    EXTRA['pisos'].append([round(xa, 3), round(xb, 3)] + [round(v, 3) for v in c.fy(TP, HD - TP)] + [PISO])
    EXTRA['pisos'].append([round(v, 3) for v in c.fx(porta[0], porta[1])] + [round(v, 3) for v in c.fy(HD - TP - 0.01, HD + 0.76)] + [PISO])
    c.laje('forro', TP, U1 - TP, TP, HD - TP, topo, 0.03)        # forro inclinado logo abaixo do telhado
    for d in (0.95, 1.85):
        zt = topo(d)
        c.caixa('wood_x', TP, U1 - TP, d - 0.05, d + 0.05, zt - 0.14, zt)
    # --- banheiro: divisórias, porta de correr aberta, revestimento
    c.parede_d('house_white', 3.25, 3.33, TP, 1.68, [], topo)
    c.parede_u('house_white', 3.33, U1 - TP, 1.60, 1.68, [(3.45, 4.05, PISO, 2.15)], topo)
    c.caixa('armario', 3.97, 4.67, 1.685, 1.72, PISO, 2.13)
    c.caixa('inox', 4.0, 4.04, 1.72, 1.735, 0.95, 1.25)
    c.caixa('azulejo', 3.33, U1 - TP, TP, 1.60, PISO, PISO + 0.004)
    c.caixa('azulejo', 3.33, U1 - TP, TP, TP + 0.006, PISO, 2.1)
    c.caixa('azulejo', U1 - TP - 0.006, U1 - TP, TP, 1.60, PISO, 2.1)
    c.caixa('azulejo', 3.33, 3.336, TP, 1.60, PISO, 2.1)
    for a, b in ((3.33, 3.45), (4.05, U1 - TP)):
        c.caixa('azulejo', a, b, 1.594, 1.60, PISO, 2.1)
    # box do chuveiro no canto do fundo
    c.caixa('vidro', 4.08, 4.09, TP, 0.92, PISO, 2.0, col=True)
    c.caixa('vidro', 4.08, 4.50, 0.915, 0.925, PISO, 2.0, col=True)
    c.caixa('inox', 4.08, 4.10, 0.905, 0.935, PISO, 2.0)
    tube('inox', [c.p(U1 - TP, 0.5, 2.02), c.p(4.62, 0.5, 2.02)], 0.012, seg=6)
    cyl('inox', c.p(4.62, 0.5, 1.98), 0.1, 0.03, seg=16)
    disc('granite', c.p(4.5, 0.5, 0.0)[:2], 0.05, PISO + 0.006, seg=12)
    # vaso sanitário com caixa acoplada
    c.caixa('louca', 3.53, 3.91, TP, 0.30, 0.42, 0.80)
    c.caixa('louca', 3.60, 3.84, 0.30, 0.62, PISO, 0.30)
    ellipsoid('louca', c.p(3.72, 0.55, 0.32), (0.18, 0.26, 0.12), seg=14, rings=8)
    ellipsoid('white', c.p(3.72, 0.56, 0.43), (0.18, 0.25, 0.012), seg=14, rings=4)
    c.colide(3.53, 3.91, TP, 0.82, PISO, 0.6)
    # gabinete com cuba e espelho na parede da ponta
    c.caixa('armario', 4.43, U1 - TP, 1.02, 1.57, PISO, 0.80, col=True)
    c.caixa('granite', 4.40, U1 - TP, 1.0, 1.59, 0.80, 0.83)
    ellipsoid('louca', c.p(4.62, 1.30, 0.86), (0.17, 0.2, 0.07), seg=14, rings=6, zmin=-0.4)
    tube('inox', [c.p(U1 - TP, 1.30, 0.95), c.p(4.78, 1.30, 1.02), c.p(4.70, 1.30, 0.98)], 0.01, seg=6)
    c.caixa('espelho', U1 - TP - 0.012, U1 - TP - 0.006, 1.05, 1.55, 1.1, 1.8)
    tube('inox', [c.p(3.40, 0.5, 1.2), c.p(3.40, 1.1, 1.2)], 0.01, seg=6)
    c.caixa('tecido_branco', 3.35, 3.42, 0.6, 1.0, 0.75, 1.2)
    # --- copa na ponta da porta
    c.caixa('armario', TP, 0.70, 0.20, 1.70, PISO, 0.86, col=True)
    c.caixa('granite', TP - 0.02, 0.72, 0.18, 1.72, 0.86, 0.89)
    c.caixa('ladrilho', TP, TP + 0.006, 0.18, 1.72, 0.89, 1.55)
    c.caixa('armario', TP, 0.47, 0.20, 1.70, 1.55, 2.15)
    for d in (0.45, 0.95, 1.45):
        c.caixa('inox', 0.70, 0.712, d - 0.08, d + 0.08, 0.74, 0.76)
        c.caixa('inox', 0.47, 0.482, d - 0.08, d + 0.08, 1.60, 1.62)
    c.caixa('inox', 0.25, 0.60, 0.35, 0.80, 0.885, 0.893)
    tube('inox', [c.p(0.17, 0.58, 0.89), c.p(0.17, 0.58, 1.17), c.p(0.36, 0.58, 1.2), c.p(0.40, 0.58, 1.1)], 0.011, seg=6)
    c.caixa('granite', 0.20, 0.64, 1.05, 1.60, 0.89, 0.896)
    for d in (1.18, 1.46):
        annulus('inox', c.p(0.42, d, 0)[:2], 0.06, 0.08, 0.897, seg=16)
    ellipsoid('inox', c.p(0.42, 1.18, 0.98), (0.08, 0.08, 0.09), seg=12, rings=6, zmin=-0.9)
    cyl('pot_fiber', c.p(0.4, 0.95, 0.89), 0.12, 0.07, seg=14)
    for k in range(4):
        ellipsoid('fruit_lemon' if k % 2 else 'fruit_red', c.p(0.36 + 0.06 * (k % 2), 0.9 + 0.05 * k, 0.98), 0.035, seg=8, rings=5)
    # --- cama
    if not beliche:
        c.caixa('tecido_cinza', 1.80, 3.24, TP, 0.20, PISO, 1.15, col=True)
        c.caixa('tecido_cinza', 1.87, 3.21, 0.20, 2.05, PISO + 0.05, 0.40)
        c.caixa('tecido_branco', 1.88, 3.20, 0.22, 2.03, 0.40, 0.62)
        c.caixa(tecido, 1.84, 3.24, 0.78, 2.08, 0.42, 0.66)
        c.caixa('tecido_terra', 1.83, 3.25, 1.72, 1.94, 0.45, 0.675)
        for u in (2.2, 2.88):
            ellipsoid('tecido_branco', c.p(u, 0.42, 0.70), (0.28, 0.15, 0.08), seg=12, rings=6)
        c.colide(1.80, 3.24, TP, 2.08, PISO, 0.66)
        # criado-mudo com abajur
        c.caixa('wood_x', 1.38, 1.76, 0.15, 0.53, PISO, 0.55, col=True)
        cyl('louca', c.p(1.57, 0.34, 0.55), 0.06, 0.18, seg=12)
        cyl('abajur', c.p(1.57, 0.34, 0.72), 0.13, 0.2, seg=16, r_top=0.09)
        EXTRA['luzes'].append({'p': [round(v, 3) for v in c.p(1.57, 0.34, 0.82)], 'cor': [1.0, 0.72, 0.42], 'forca': 0.5, 'alcance': 3.5, 'casa': nome})
    else:
        for u in (2.20, 3.12):
            for d in (0.16, 2.02):
                c.caixa('wood_z', u, u + 0.06, d, d + 0.06, PISO, 1.95)
        for zb in (0.20, 1.30):
            c.caixa('wood_x', 2.20, 3.18, 0.16, 2.08, zb, zb + 0.12)
            c.caixa('tecido_branco', 2.24, 3.14, 0.2, 2.04, zb + 0.12, zb + 0.27)
            c.caixa(tecido if zb < 1 else 'tecido_amarelo', 2.22, 3.16, 0.7, 2.06, zb + 0.15, zb + 0.30)
            ellipsoid('tecido_branco', c.p(2.68, 0.40, zb + 0.33), (0.3, 0.14, 0.07), seg=12, rings=6)
        c.caixa('wood_x', 2.20, 3.18, 0.16, 0.22, 1.42, 1.75)
        c.caixa('wood_x', 2.20, 3.18, 0.6, 2.08, 1.62, 1.68)
        for k in range(5):
            c.caixa('wood_x', 3.12, 3.18, 2.02, 2.08, 0.3 + k * 0.3, 0.34 + k * 0.3)
        c.colide(2.20, 3.18, 0.16, 2.08, PISO, 1.95)
        c.caixa('wood_x', 1.70, 2.12, 0.15, 0.53, PISO, 0.55, col=True)
        cyl('louca', c.p(1.91, 0.34, 0.55), 0.06, 0.18, seg=12)
        cyl('abajur', c.p(1.91, 0.34, 0.72), 0.13, 0.2, seg=16, r_top=0.09)
        EXTRA['luzes'].append({'p': [round(v, 3) for v in c.p(1.91, 0.34, 0.82)], 'cor': [1.0, 0.72, 0.42], 'forca': 0.5, 'alcance': 3.5, 'casa': nome})
        c.caixa('tecido_terra', 1.0, 2.1, 0.7, 1.9, PISO, PISO + 0.008)
    if not beliche:
        c.caixa('tecido_terra', 1.0, 1.8, 0.7, 1.9, PISO, PISO + 0.008)
    # quadro sobre a cabeceira e ar-condicionado
    uq = 2.52 if not beliche else 1.0
    c.caixa('wood_x', uq - 0.42, uq + 0.42, TP, TP + 0.03, 1.33, 1.87)
    c.caixa('quadro', uq - 0.38, uq + 0.38, TP + 0.03, TP + 0.035, 1.37, 1.83)
    c.caixa('white', 2.08, 2.98, TP, 0.33, 2.42, 2.72)
    c.caixa('granite', 2.12, 2.94, 0.33, 0.335, 2.45, 2.5)
    # --- mesinha redonda e duas cadeiras na frente do banheiro
    cyl('wood_z', c.p(4.2, 2.18, 0.72), 0.34, 0.035, seg=24)
    cyl('metal_dark', c.p(4.2, 2.18, PISO), 0.035, 0.62, seg=8)
    cyl('metal_dark', c.p(4.2, 2.18, PISO), 0.2, 0.02, seg=16)
    c.colide(3.86, 4.54, 1.84, 2.52, PISO, 0.76)
    for u, d in ((3.62, 2.18), (4.78, 2.22)):
        c.caixa('wood_x', u - 0.2, u + 0.2, d - 0.2, d + 0.2, 0.44, 0.48)
        for du in (-0.17, 0.15):
            for dd in (-0.17, 0.15):
                c.caixa('metal_dark', u + du, u + du + 0.02, d + dd, d + dd + 0.02, PISO, 0.44)
        ub = u - 0.19 if u < 4.2 else u + 0.17
        c.caixa('wood_x', ub, ub + 0.02, d - 0.2, d + 0.2, 0.48, 0.9)
    cyl('louca', c.p(4.2, 2.18, 0.755), 0.05, 0.12, seg=10)
    P.herbs(c.p(4.2, 2.18, 0.86), rv, kind=1)
    # cortinas na janela da frente
    for a, b in ((2.52, 2.74), (4.06, 4.28)):
        c.caixa('cortina', a, b, HD - TP - 0.05, HD - TP - 0.02, 0.95, 2.25)
    tube('metal_dark', [c.p(2.45, HD - TP - 0.035, 2.28), c.p(4.35, HD - TP - 0.035, 2.28)], 0.008, seg=5)
    # --- luzes de dentro e ventilador de teto
    dz = topo(1.35)
    EXTRA['ventiladores'].append({'p': [round(v, 3) for v in c.p(2.5, 1.35, dz - 0.42)], 'teto': round(dz, 3), 'casa': nome})
    EXTRA['luzes'].append({'p': [round(v, 3) for v in c.p(2.5, 1.35, dz - 0.6)], 'cor': [1.0, 0.8, 0.55], 'forca': 1.2, 'alcance': 6.5, 'casa': nome})
    zb = topo(0.86)
    cyl('bulb', c.p(4.1, 0.86, zb - 0.04), 0.13, 0.04, seg=16)
    EXTRA['luzes'].append({'p': [round(v, 3) for v in c.p(4.1, 0.86, zb - 0.12)], 'cor': [1.0, 0.86, 0.68], 'forca': 0.55, 'alcance': 3.0, 'casa': nome})

    # --- por fora: barrado colorido, batente da porta, janelas de vidro, venezianas, floreira
    def fbox(mat, ua, ub, e0, e1, z0, z1):
        c.caixa(mat, ua, ub, HD + e0, HD + e1, z0, z1)

    fbox(acc, -0.02, porta[0] - 0.1, 0.0, 0.02, 0.0, 0.55)
    fbox(acc, porta[1] + 0.1, U1 + 0.02, 0.0, 0.02, 0.0, 0.55)
    for ue in (-0.02, U1):
        c.caixa(acc, ue, ue + 0.02, 0.0, HD, 0.0, 0.55)
    fbox(acc, porta[0] - 0.1, porta[0], 0.0, 0.03, 0.0, porta[3] + 0.1)
    fbox(acc, porta[1], porta[1] + 0.1, 0.0, 0.03, 0.0, porta[3] + 0.1)
    fbox(acc, porta[0] - 0.1, porta[1] + 0.1, 0.0, 0.03, porta[3], porta[3] + 0.1)
    c.caixa('wood_x', porta[0], porta[1], HD - TP, HD - TP + 0.02, porta[3], porta[3] + 0.06)
    # janela da frente: moldura, montante, travessa, vidro, peitoril
    ua, ub, za, zb2 = janela
    fbox(acc, ua - 0.09, ua, 0.0, 0.03, za - 0.09, zb2 + 0.09)
    fbox(acc, ub, ub + 0.09, 0.0, 0.03, za - 0.09, zb2 + 0.09)
    fbox(acc, ua, ub, 0.0, 0.03, zb2, zb2 + 0.09)
    c.caixa(acc, (ua + ub) / 2 - 0.025, (ua + ub) / 2 + 0.025, HD - 0.075, HD - 0.035, za, zb2)
    c.caixa(acc, ua, ub, HD - 0.075, HD - 0.035, 1.53, 1.57)
    c.caixa('vidro', ua, ub, HD - 0.058, HD - 0.052, za, zb2)
    fbox('stone_cut', ua - 0.1, ub + 0.1, -0.02, 0.06, za - 0.05, za)
    for sx in (-1, 1):
        um = (ua + ub) / 2 + sx * 1.04
        fbox(acc, um - 0.27, um + 0.27, 0.02, 0.05, 1.0, 2.1)
        for k in range(9):
            fbox('house_white', um - 0.22, um + 0.22, 0.05, 0.054, 1.07 + k * 0.11, 1.09 + k * 0.11)
    fbox('wood_x', ua - 0.02, ub + 0.02, 0.03, 0.22, 0.72, 0.92)
    for k in range(7):
        pu = ua + 0.05 + k * 0.2
        P.mound('leaf_trop2', c.p(pu, HD + 0.125, 0.92), rv, n=9, L=0.17, W=0.07, e=(0.2, 1.3), droop=0.5, r0=0.03)
        for q in range(3):
            ellipsoid('flower_red' if (k + q) % 2 else 'flower_orange',
                      c.p(pu + rv.uniform(-0.07, 0.07), HD + 0.125 + rv.uniform(-0.05, 0.07), 1.0 + rv.uniform(0, 0.1)), 0.028, seg=6, rings=4)
    # janelinha alta do banheiro, na ponta
    j0, j1, jz0, jz1 = janelinha
    c.caixa(acc, U1, U1 + 0.035, j0 - 0.07, j1 + 0.07, jz0 - 0.07, jz0)
    for a, b, z0, z1 in ((j0 - 0.07, j0, jz0, jz1), (j1, j1 + 0.07, jz0, jz1), (j0 - 0.07, j1 + 0.07, jz1, jz1 + 0.07)):
        c.caixa(acc, U1, U1 + 0.035, a, b, z0, z1)
    c.caixa('vidro', U1 - 0.064, U1 - 0.058, j0, j1, jz0, jz1)
    # arandela ao lado da porta
    xd = c.X(1.3)
    fbox('metal_dark', 1.96, 2.04, 0.02, 0.12, 1.9, 1.96)
    ellipsoid('bulb', c.p(2.0, HD + 0.13, 1.83), 0.055, seg=8, rings=6)
    fbox('stone_cut', 0.4, 2.2, 0.0, 0.75, 0.0, 0.1)
    EXTRA['portas'].append({'casa': nome, 'cor': acc,
                            'dobradica': [round(v, 3) for v in c.p(porta[0] + 0.02, HD - 0.06, PISO)],
                            'fechada': [1.0 if c.X(porta[1]) > c.X(porta[0]) else -1.0, 0.0],
                            'para_dentro': [0.0, -c.sg], 'largura': 0.88, 'altura': round(porta[3] - PISO - 0.02, 3)})
    # telhado de telhas de barro com caimento para o gramado, caibros de cumaru aparentes sob o beiral
    v = np.array([0, c.sg, -HSL]); v = v / np.linalg.norm(v)
    tile_roof('rooftile', (x0 - 0.3, c.yr, HZH), (1, 0, 0), v, (x1 - x0) + 0.6, (HD + HEAVE) * math.sqrt(1 + HSL ** 2))
    for xr in np.arange(x0 - 0.22, x1 + 0.25, 0.6):
        beam('wood_y', (xr, c.yr + c.sg * 0.04, HZH - 0.09 - HSL * 0.04), (xr, c.Y(HD + HEAVE - 0.03), HZH - HSL * (HD + HEAVE - 0.03) - 0.09), 0.06, 0.11)
    zl = HZH - HSL * (HD + HEAVE)
    c.caixa('wood_x', -0.3, U1 + 0.3, HD + HEAVE - 0.035, HD + HEAVE, zl - 0.17, zl - 0.02)
    # vasos na porta, canteirinho sob a janela, pisantes até o caminho principal
    for su, kind in ((-0.72, 0), (0.72, 1)):
        top = P.pot(c.p(1.3 + su, HD + 0.42, 0.1), 0.19, 0.4)
        if kind == 0:
            P.bromelia(top, rv, 0.8)
        else:
            P.moreia(top, rv, 0.7)
    c.caixa('mulch', 2.25, U1, HD + 0.02, HD + 0.55, 0.0, 0.012)
    for k, pu in enumerate(np.arange(2.55, U1 - 0.1, 0.62)):
        if k % 3 == 0:
            P.xanadu(c.p(pu, HD + 0.3, 0.012), rv, 0.7)
        elif k % 3 == 1:
            P.moreia(c.p(pu, HD + 0.3, 0.012), rv, 0.7)
        else:
            P.alpinia(c.p(pu, HD + 0.25, 0.012), rv, n=5, H=1.0)
    y0p, y1p = c.Y(HD + 0.75 + 0.45), path_y(xd)
    npath = max(1, int(round(abs(y1p - y0p) / 0.8)))
    for k in range(npath):
        obox('stone_step', (xd, y0p + (y1p - y0p) * k / npath, 0.017), (0.8, 0.45, 0.03))
    # lugar para entrar: logo depois da porta, olhando para a cama
    ex, ey = c.X(1.3), c.Y(2.2)
    bx, by = c.X(2.6), c.Y(1.0)
    EXTRA['lugares'].append([nome, round(ex, 3), round(ey, 3), round(math.atan2(by - ey, bx - ex), 4)])
    EXTRA['casas'].append({'nome': nome, 'x': [x0, x1], 'y': sorted([c.Y(0), c.Y(HD)]), 'piso': PISO})
    return xd


d1 = tiny_house(3.0, 8.0, 0, 'acc_blue', 'tecido_azul', 'Casa azul', espelho=True)      # porta voltada para a pracinha
d2 = tiny_house(14.6, 19.6, 0, 'acc_yellow', 'tecido_amarelo', 'Casa amarela')
d3 = tiny_house(8.8, 13.8, 1, 'acc_green', 'tecido_verde', 'Casa verde', beliche=True)
# banco na pracinha sob o muro do maracujá, e varal de luzes em zigue-zague entre as casas
box('wood_x', 12.6, 14.1, 0.2, 0.6, 0.41, 0.46)
for xx in (12.7, 13.95):
    box('wood_z', xx, xx + 0.06, 0.24, 0.56, 0, 0.41)
box('wood_x', 12.6, 14.1, 0.14, 0.2, 0.46, 0.85)
varal((8.2, HD + HEAVE - 0.03, 2.42), (8.9, 10 - HD - HEAVE + 0.03, 2.42), 0.22, 10)
varal((13.7, 10 - HD - HEAVE + 0.03, 2.42), (14.7, HD + HEAVE - 0.03, 2.42), 0.22, 10)

# ------------------------------------------------------------------ entorno além dos muros
r2 = np.random.default_rng(5)
for x, y, R, H in ((-14, -6, 3.5, 6), (6, -7, 3.2, 5.5), (17, -8, 4, 7), (27, -6.5, 3, 5.5), (38, -12, 4, 7), (52, -7, 3.5, 6),
                   (64, -8, 4, 7), (-12, 21, 4, 7), (4, 23, 3.5, 6), (15, 25, 3.2, 5.5), (25, 22, 4, 7), (49, 21, 3.8, 6.5),
                   (58, 24, 3.2, 5.5), (68, 20, 4, 7), (74, 4, 4.2, 6.5), (72, 11, 3.5, 6), (-16, 4, 4, 7), (-22, 12, 4.5, 7.5),
                   (88, -3, 5, 8), (-30, -4, 5, 8), (35, 30, 5, 8), (10, -18, 5, 8), (60, -20, 5, 8), (45, -16, 4.5, 7)):
    P.bg_tree((x, y, LOW if x > 46 else 0), r2, R=R, H=H)
P.coqueiro((64.5, -4.0, LOW), 7.5, r2, lean_az=0.6, lean=0.8, nuts=False)
P.coqueiro((66.0, 14.5, LOW), 6.5, r2, lean_az=-0.5, lean=0.6, nuts=False)
# vizinhos (mantidos neutros)
box('wall_out', 33.6, 41.0, 11.2, 18.0, 0, 5.9); box('rooftile', 33.3, 41.3, 10.9, 18.3, 5.9, 6.05)
box('wall_out', 41.0, 46.5, 11.5, 16.5, 0, 2.7)
box('wall_white', 38.5, 47.0, -9.0, -1.6, 0, 2.9)
for sgn in (1, -1):
    v = np.array([0, sgn * 3.9, -1.25]); L = np.linalg.norm(v); v /= L
    tile_roof('rooftile', (38.2, -5.3, 4.15), (1, 0, 0), v, 9.1, L)

objs = geo.build_objects()
print('objects', len(objs), 'polys', sum(len(o.data.polygons) for o in objs))
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'chacara.blend'))
