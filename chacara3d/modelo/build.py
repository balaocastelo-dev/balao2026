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
# interior dos sobrados da vilinha
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
# sobrados da vilinha (acabamentos modernos)
m_plain('aluminio_preto', (0.022, 0.022, 0.024), 0.35, **{'Metallic': 0.6})     # caixilhos, caracol, pés de móveis
m_wood('deck_ipe', 0, (0.30, 0.15, 0.07), (0.48, 0.27, 0.13), rough=0.6)       # deck do mirante (réguas ao longo de x)
m_plain('corten', (0.34, 0.12, 0.04), 0.8, noise=0.35, nscale=9, bump=0.3)     # canteiros do teto verde
m_plain('gesso', (0.88, 0.87, 0.84), 0.9)                                      # forros
m_plain('porcelanato', (0.56, 0.55, 0.53), 0.3, noise=0.06, nscale=3)          # banheiros (piso e paredes)
m_wood('madeira_clara', 0, (0.50, 0.36, 0.22), (0.70, 0.55, 0.36))             # carvalho claro dos móveis
m_plain('laca_grafite', (0.055, 0.058, 0.062), 0.5)                            # armários sem puxador
m_plain('quartzo', (0.86, 0.85, 0.83), 0.18, noise=0.05, nscale=20)            # tampos
m_plain('tela_tv', (0.008, 0.009, 0.011), 0.06)                                # TV, forno, cooktop
m_plain('tecido_grafite', (0.16, 0.16, 0.17), 0.95)                            # sofá e cabeceira
m_plain('vidro_jateado', (0.80, 0.84, 0.84), 0.45, **{'Alpha': 0.7})           # janelinha do banheiro de cima
m_plain('tapete', (0.42, 0.40, 0.37), 0.98, noise=0.08, nscale=30)
m_plain('couro', (0.36, 0.17, 0.07), 0.5)                                      # cadeiras e pufes

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
JABU, GOIA, LIMAO = (14.0, 2.2), (19.2, 8.2), (27.2, 1.5)         # árvores do pomar que saíram do caminho dos sobrados
P.jabuticabeira((JABU[0], JABU[1], 0), rng)                       # centro da pracinha entre a casa azul e a amarela


def goiabeira_podada(pos, rng):
    """Goiabeira com a copa podada mais estreita em x: cabe entre o caracol da casa verde e o coqueiro de x 21,2."""
    blobs = [((0.0, 0.0, 3.0), (1.3, 1.4, 1.1)), ((0.35, -1.1, 2.6), (1.0, 1.0, 0.85)), ((-0.35, 0.9, 2.7), (1.0, 1.0, 0.85)),
             ((0.3, 0.3, 3.7), (0.9, 0.9, 0.75)), ((-0.3, -0.5, 3.6), (0.85, 0.85, 0.7))]
    wb = P.broadleaf(pos, 'bark_goiaba', 'leaf_goiaba', 'leaf_core', blobs, 0.95, 0.12, 95, 0.17, 0.085, 0.25, rng,
                     lean=(0.05, 0.0), branch_r=0.07, filler=0.5)
    P.fruits_in('fruit_goiaba', wb, 26, 0.042, rng, stretch=1.1)


goiabeira_podada((GOIA[0], GOIA[1], 0), rng)
P.citrus((LIMAO[0], LIMAO[1], 0), rng, fruit='fruit_lemon')
P.citrus((30.4, 8.75, 0), rng, fruit='fruit_lemon', R=0.95, n=22)
P.bananeira((6.9, 8.9, 0), rng, stems=3, H=2.8)
for c, r in (((26.4, 8.55), 0.8), ((23.7, 8.95), 0.7), ((21.2, 8.3), 0.8), (JABU, 1.15), (GOIA, 1.0), (LIMAO, 0.9),
             ((30.4, 8.75), 0.75), ((6.9, 8.9), 0.9)):
    disc('mulch', c, r, 0.006, seg=28)
    for a in np.linspace(0, 2 * math.pi, int(r * 9))[:-1]:
        P.grama_preta((c[0] + r * math.cos(a), c[1] + r * math.sin(a), 0.0), rng)
for xx in np.arange(1.2, 31.4, 0.86):                            # pisantes ao longo da trilha batida
    yy = 4.9 + 0.85 * math.sin(xx / 4.6)
    obox('stone_step', (xx, yy, 0.012), (0.5, 0.85, 0.03), rotz(math.atan(0.85 / 4.6 * math.cos(xx / 4.6))))
P.vine_wall('leaf_vine_light', 11.8, 16.2, 0.3, 2.2, 0.0, 1, rng, density=150, cover=0.5, seed=4.0, leaf=0.11)   # maracujá no muro da pracinha
for i in range(12):
    ellipsoid('fruit_goiaba', (rng.uniform(11.8, 16.2), 0.07, rng.uniform(0.95, 1.9)), 0.04, seg=7, rings=5)
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
P.vine_wall('leaf_vine', 26.0, 31.0, 0.05, WH, 0.0, 1, rng, density=200, cover=0.4, seed=7.7)
P.vine_wall('leaf_vine_light', 17.9, 20.5, 0.3, 2.25, 10.0, -1, rng, density=150, cover=0.5, seed=9.1, leaf=0.11)
# moreias ao pé dos muros, fora das casas, dos caracóis (com 0,4 m de folga), do banco e das árvores
for xx in np.arange(1.5, 28.0, 1.7):
    if not (1.2 < xx < 13.7) and not (16.0 < xx < 26.0) and abs(xx - JABU[0]) > 0.9 and abs(xx - LIMAO[0]) > 1.2:
        P.moreia((xx, 0.45, 0.0), rng, 0.8)
for xx in np.arange(7.8, 33.0, 1.7):
    if not (8.1 < xx < 18.2) and min(abs(xx - c) for c in (6.9, GOIA[0], 21.2, 23.7, 26.4, 30.4)) > 1.2:
        P.moreia((xx, 9.5, 0.0), rng, 0.8)
P.heliconia((1.0, 1.2, 0), rng, n=9, H=1.8, spread=0.3); P.heliconia((1.75, 0.55, 0), rng, n=7, H=1.5, flower='flower_orange', spread=0.3)


# ------------------------------------------------------------------ a vilinha: três sobrados ultramodernos com mirante no teto
# Cada casa tem 7 x 3 m em dois pisos (42 m²). Térreo: sala, cozinha e banheiro; em cima: quarto de casal, quarto
# da beliche e o banheiro dos dois. No lugar do telhado, um mirante (deck, teto verde, espreguiçadeiras e luneta)
# a que se chega pela escada caracol de fora. A ponta lisa (sem aberturas) de cada casa recebe projeção mapeada.
CL, CD = 7.0, 3.0                       # comprimento ao longo do muro e fundo
TP, TD = 0.12, 0.08                     # parede externa e divisória interna (drywall)
IU, ID = CL - 2 * TP, CD - 2 * TP       # medidas internas: 6,76 x 2,76
PISO, LAJE1, Z1 = 0.10, 2.72, 2.90      # piso do térreo, fundo da laje entre os pisos, piso de cima
FORRO, LAJE2, DECK = 5.45, 5.63, 5.75   # forro do andar de cima, topo da laje do teto, deck do mirante
PLAT, GUARDA = 5.90, 6.85               # topo da platibanda e do guarda-corpo de vidro (1,10 acima do deck)
ESP, PIS = 0.175, 0.264                 # escada de dentro: 16 espelhos de 0,10 a 2,90
NCAR, R0CAR, R1CAR = 33, 0.08, 0.98     # caracol: degraus e raios
ESPCAR = DECK / NCAR
CANT = 0.45                             # altura dos canteiros do teto verde
rv = np.random.default_rng(23)
LUZ_QUENTE, LUZ_LED = [1.0, 0.82, 0.62], [1.0, 0.72, 0.42]

EXTRA = {'colisores': [], 'pisos': [], 'portas': [], 'luzes': [], 'ventiladores': [], 'lugares': [], 'casas': [],
         'espirais': [], 'paredes_projecao': []}


def colisor(x0, x1, y0, y1, z0, z1):
    EXTRA['colisores'].append([round(min(x0, x1), 3), round(max(x0, x1), 3), round(min(y0, y1), 3), round(max(y0, y1), 3),
                               round(z0, 3), round(z1, 3)])


def path_y(x):
    return 4.9 + 0.85 * math.sin(x / 4.6)


def prisma_xy(mat, pts, z0, z1):
    """Prisma vertical de base poligonal convexa (pontos x, y em qualquer sentido)."""
    pts = [(float(a), float(b)) for a, b in pts]
    n = len(pts)
    area = sum(pts[i][0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * pts[i][1] for i in range(n))
    if area < 0:
        pts = pts[::-1]
    G[mat].add([[a, b, z0] for a, b in pts] + [[a, b, z1] for a, b in pts], [list(range(n))[::-1], list(range(n, 2 * n))])
    v, f = [], []
    for i in range(n):
        j = (i + 1) % n
        f.append([len(v), len(v) + 1, len(v) + 2, len(v) + 3])
        v += [[pts[i][0], pts[i][1], z0], [pts[j][0], pts[j][1], z0], [pts[j][0], pts[j][1], z1], [pts[i][0], pts[i][1], z1]]
    G[mat].add(v, f)


def solido(mat, verts, faces):
    """Sólido convexo com todas as faces viradas para fora (no passeio o material 'bulb' só aparece de um lado)."""
    v = np.asarray(verts, float)
    cen = v.mean(axis=0)
    por_lados = {}
    for f in faces:
        q = v[f]
        n = sum(np.cross(q[i], q[(i + 1) % len(f)]) for i in range(len(f)))
        if np.dot(n, q.mean(axis=0) - cen) < 0:
            f = f[::-1]
        por_lados.setdefault(len(f), []).append(list(f))
    for fs in por_lados.values():
        G[mat].add(v, fs)


class Casa:
    """Referência local de um sobrado: u corre ao longo do muro a partir da ponta lisa (u = 0) até a ponta do
    caracol (u = 7); d vai do muro de fundo (0) até a fachada (3). A casa azul é espelhada (X = x1 - u).
    Dentro, (iu, id) contam a partir das faces de dentro das paredes: u = iu + 0,12 e d = id + 0,12."""

    def __init__(self, x0, side, espelho):
        self.x0, self.x1 = x0, x0 + CL
        self.esp = espelho
        self.su = -1 if espelho else 1
        self.sd = 1 if side == 0 else -1
        self.yr = 0.0 if side == 0 else 10.0

    # ---- mundo
    def X(self, u):
        return self.x1 - u if self.esp else self.x0 + u

    def Y(self, d):
        return self.yr + self.sd * d

    def fx(self, ua, ub):
        a, b = self.X(ua), self.X(ub)
        return min(a, b), max(a, b)

    def fy(self, da, db):
        a, b = self.Y(da), self.Y(db)
        return min(a, b), max(a, b)

    def p(self, u, d, z):
        return (self.X(u), self.Y(d), z)

    def ang(self, a):
        """Ângulo local (medido de +u para +d) levado para o plano x, y do mundo."""
        return math.atan2(self.sd * math.sin(a), self.su * math.cos(a))

    # ---- geometria em coordenadas locais
    def caixa(self, mat, ua, ub, da, db, z0, z1, col=False):
        xa, xb = self.fx(ua, ub); ya, yb = self.fy(da, db)
        box(mat, xa, xb, ya, yb, z0, z1)
        if col:
            colisor(xa, xb, ya, yb, z0, z1)

    def colide(self, ua, ub, da, db, z0, z1):
        xa, xb = self.fx(ua, ub); ya, yb = self.fy(da, db)
        colisor(xa, xb, ya, yb, z0, z1)

    def piso(self, ua, ub, da, db, z):
        xa, xb = self.fx(ua, ub); ya, yb = self.fy(da, db)
        EXTRA['pisos'].append([round(xa, 3), round(xb, 3), round(ya, 3), round(yb, 3), round(z, 3)])

    def caixa_g(self, mat, c, tam, a=0.0):
        """Caixa girada: centro local (u, d, z); tamanho (no sentido a, de lado, altura); a = giro local."""
        obox(mat, self.p(*c), tam, rotz(self.ang(a)))

    def tubo(self, mat, pts, r, seg=8, cap=False):
        tube(mat, [self.p(*q) for q in pts], r, seg=seg, cap=cap)

    def cil(self, mat, c, r, h, seg=16, r_top=None, cap=True):
        cyl(mat, self.p(*c), r, h, seg=seg, r_top=r_top, cap=cap)

    def elip(self, mat, c, r, seg=12, rings=8, zmin=-1.0):
        ellipsoid(mat, self.p(*c), r, seg=seg, rings=rings, zmin=zmin)

    def disco(self, mat, u, d, r, z, seg=24):
        disc(mat, self.p(u, d, 0)[:2], r, z, seg=seg)

    def anel(self, mat, u, d, r0, r1, z, seg=24):
        annulus(mat, self.p(u, d, 0)[:2], r0, r1, z, seg=seg)

    def poli(self, mat, pts):
        """Face plana a partir de pontos locais (u, d, z)."""
        G[mat].add([self.p(*q) for q in pts], [list(range(len(pts)))])

    def prisma(self, mat, pts, z0, z1):
        prisma_xy(mat, [self.p(a, b, 0)[:2] for a, b in pts], z0, z1)

    def disco_v(self, mat, c, r, eixo, esp=0.006, seg=20):
        """Disco em pé (espelho redondo, arandela): a face olha para +-d (eixo 'd') ou para +-u (eixo 'u')."""
        t = np.linspace(0, 2 * math.pi, seg, endpoint=False)
        anel = []
        for s in (-esp / 2, esp / 2):
            for a in t:
                if eixo == 'd':
                    anel.append(self.p(c[0] + r * math.cos(a), c[1] + s, c[2] + r * math.sin(a)))
                else:
                    anel.append(self.p(c[0] + s, c[1] + r * math.cos(a), c[2] + r * math.sin(a)))
        solido(mat, anel, [list(range(seg)), list(range(seg, 2 * seg))] + [[i, (i + 1) % seg, seg + (i + 1) % seg, seg + i] for i in range(seg)])

    def parede(self, mat, eixo, a0, a1, b0, b1, z0, z1, vaos=(), col=True):
        """Parede de a0 a a1 ao longo do eixo ('u' ou 'd'), espessura de b0 a b1 no outro eixo, de z0 a z1,
        com vãos [(a_ini, a_fim, z_ini, z_fim)]. Cada pedaço vira um colisor com a sua faixa de altura."""
        cortes = sorted(set([a0, a1] + [q for v in vaos for q in v[:2] if a0 < q < a1]))
        for a, b in zip(cortes[:-1], cortes[1:]):
            vs = sorted([v for v in vaos if v[0] <= a + 1e-6 and v[1] >= b - 1e-6], key=lambda v: v[2])
            z = z0
            for v in vs:
                if v[2] - z > 1e-4:
                    self._peca(mat, eixo, a, b, b0, b1, z, v[2], col)
                z = max(z, v[3])
            if z1 - z > 1e-4:
                self._peca(mat, eixo, a, b, b0, b1, z, z1, col)

    def _peca(self, mat, eixo, a, b, b0, b1, za, zb, col=False):
        if eixo == 'u':
            self.caixa(mat, a, b, b0, b1, za, zb, col)
        else:
            self.caixa(mat, b0, b1, a, b, za, zb, col)

    def esquadria(self, eixo, a0, a1, z0, z1, bm, folhas=2, travessa=None, vidro='vidro', col=False, f=0.05):
        """Caixilho de alumínio preto com vidro, no meio da parede (bm = posição no outro eixo)."""
        pecas = [(a0, a0 + f, z0, z1), (a1 - f, a1, z0, z1), (a0 + f, a1 - f, z0, z0 + f), (a0 + f, a1 - f, z1 - f, z1)]
        for k in range(1, folhas):
            am = a0 + (a1 - a0) * k / folhas
            pecas.append((am - f / 2, am + f / 2, z0 + f, z1 - f))
        if travessa is not None:
            pecas.append((a0 + f, a1 - f, travessa - f / 2, travessa + f / 2))
        for a, b, za, zb in pecas:
            self._peca('aluminio_preto', eixo, a, b, bm - 0.03, bm + 0.03, za, zb)
        self._peca(vidro, eixo, a0 + f, a1 - f, bm - 0.004, bm + 0.004, z0 + f, z1 - f)
        if col:
            if eixo == 'u':
                self.colide(a0, a1, bm - 0.025, bm + 0.025, z0, z1)
            else:
                self.colide(bm - 0.025, bm + 0.025, a0, a1, z0, z1)

    # ---- coordenadas internas
    def i(self, mat, a0, a1, b0, b1, z0, z1, col=False):
        self.caixa(mat, a0 + TP, a1 + TP, b0 + TP, b1 + TP, z0, z1, col)

    def ip(self, iu, id_, z):
        return (iu + TP, id_ + TP, z)

    def ipiso(self, a0, a1, b0, b1, z):
        self.piso(a0 + TP, a1 + TP, b0 + TP, b1 + TP, z)

    def icol(self, a0, a1, b0, b1, z0, z1):
        self.colide(a0 + TP, a1 + TP, b0 + TP, b1 + TP, z0, z1)

    def iparede(self, mat, eixo, a0, a1, b0, b1, z0, z1, vaos=(), col=True):
        self.parede(mat, eixo, a0 + TP, a1 + TP, b0 + TP, b1 + TP, z0, z1, [(v[0] + TP, v[1] + TP, v[2], v[3]) for v in vaos], col)

    def luz(self, nome, iu, id_, z, cor, forca, alcance, andar, comodo):
        EXTRA['luzes'].append({'p': [round(v, 3) for v in self.p(iu + TP, id_ + TP, z)], 'cor': cor, 'forca': forca,
                               'alcance': alcance, 'casa': nome, 'andar': andar, 'comodo': comodo})


def cadeira(c, iu, id_, a, z=PISO, assento='couro'):
    """Cadeira de design: concha de uma peça e pés de aço preto. a = para onde olha quem senta (ângulo local)."""
    ca, sa = math.cos(a), math.sin(a)

    def L(fw, sd, zz):
        return (iu + TP + fw * ca - sd * sa, id_ + TP + fw * sa + sd * ca, zz)
    c.caixa_g(assento, L(0.0, 0.0, z + 0.44), (0.44, 0.44, 0.035), a)
    c.caixa_g(assento, L(-0.205, 0.0, z + 0.65), (0.03, 0.42, 0.40), a)
    for fw in (-0.17, 0.17):
        for sd in (-0.17, 0.17):
            c.tubo('aluminio_preto', [L(fw * 1.15, sd * 1.15, z), L(fw, sd, z + 0.43)], 0.011, seg=5)
    c.icol(iu - 0.23, iu + 0.23, id_ - 0.23, id_ + 0.23, z, z + 0.86)


def florzinhas(pos, rng, cor='flower_red'):
    """Touceira baixa de folhas miúdas com florzinhas (beijinho, onze-horas)."""
    P.mound('leaf_lime', pos, rng, n=26, L=0.13, W=0.06, e=(0.2, 1.2), droop=0.3, r0=0.12)
    for _ in range(9):
        a, r = rng.uniform(0, 2 * math.pi), rng.uniform(0.02, 0.14)
        ellipsoid(cor, (pos[0] + r * math.cos(a), pos[1] + r * math.sin(a), pos[2] + rng.uniform(0.07, 0.13)), 0.022, seg=6, rings=4)


def sobrado(x0, side, espelho, nome, acc, tecido):
    """Sobrado de 7 x 3 m encostado no muro, frente para o gramado, com mirante no teto e caracol na ponta u = 7."""
    c = Casa(x0, side, espelho)
    I = c.i
    sg = c.sd
    porta = (2.95, 3.90)                                  # vão da porta de entrada (iu)
    pu0, pu1 = porta[0] + TP, porta[1] + TP
    ZP = PISO + 2.25
    jan_sala = (1.45 + TP, 2.75 + TP, 0.95, 2.35)         # (u0, u1, z0, z1) na fachada
    jan_coz = (4.60 + TP, 5.90 + TP, 1.05, 2.35)
    jan_bel = (2.00 + TP, 2.62 + TP, Z1 + 0.95, Z1 + 2.30)
    jan_ban = (2.95 + TP, 3.45 + TP, Z1 + 1.65, Z1 + 2.25)
    pjan = (4.50 + TP, 6.40 + TP, Z1 + 0.02, Z1 + 2.35)   # porta-janela do casal
    jan_pcoz = (0.90 + TP, 1.80 + TP, 1.05, 2.15)        # (d0, d1, z0, z1) na ponta do caracol
    jan_pcas = (0.75 + TP, 1.55 + TP, Z1 + 0.90, Z1 + 2.25)
    vao_deck = (1.15, 1.85)                               # saída do caracol para o deck (d)
    BF = CD - TP / 2                                      # meio da parede da frente
    BP = CL - TP / 2                                      # meio da parede da ponta do caracol

    # ============================================================ estrutura: paredes, lajes, platibanda
    c.parede('house_white', 'u', 0.0, CL, CD - TP, CD, 0.0, PLAT, [(pu0, pu1, 0.0, ZP), jan_sala, jan_coz, jan_bel, jan_ban, pjan])
    c.parede('house_white', 'u', 0.0, CL, 0.0, TP, 0.0, PLAT)
    c.parede('house_white', 'd', TP, CD - TP, 0.0, TP, 0.0, PLAT)                          # ponta lisa (projeção)
    c.parede('house_white', 'd', TP, CD - TP, CL - TP, CL, 0.0, PLAT, [jan_pcoz, jan_pcas, (vao_deck[0], vao_deck[1], DECK, PLAT + 0.01)])
    I('piso_madeira', 0, IU, 0, ID, 0.0, PISO)
    c.ipiso(0, IU, 0, ID, PISO)
    c.caixa('stone_cut', pu0, pu1, CD - TP, CD, 0.0, PISO)                                # soleira
    c.caixa('stone_cut', pu0 - 0.27, pu1 + 0.27, CD, CD + 0.62, 0.0, PISO)              # patamar de pedra na porta
    c.piso(pu0, pu1, CD - TP - 0.01, CD, PISO)
    c.piso(pu0 - 0.27, pu1 + 0.27, CD, CD + 0.62, PISO)
    # laje entre os pisos (forro de gesso embaixo, porcelanato amadeirado em cima) com o vão da escada
    for a0, a1, b0, b1 in ((0.0, 0.85, 1.91, ID), (0.85, 2.70, 0.85, ID), (2.70, IU, 0.0, ID)):
        I('gesso', a0, a1, b0, b1, LAJE1, Z1 - 0.02)
        I('piso_madeira', a0, a1, b0, b1, Z1 - 0.02, Z1)
        c.ipiso(a0, a1, b0, b1, Z1)
    I('gesso', 0, IU, 0, ID, FORRO, LAJE2)                                              # forro de cima + laje do teto
    I('deck_ipe', 0, IU, 0, ID, LAJE2, DECK)                                            # deck do mirante
    c.ipiso(0, IU, 0, ID, DECK)
    c.caixa('deck_ipe', CL - TP, CL + 0.10, vao_deck[0], vao_deck[1], DECK - 0.05, DECK)   # passagem do caracol para o deck
    c.piso(CL - TP, CL + 0.10, vao_deck[0], vao_deck[1], DECK)
    # rufo de alumínio preto em cima da platibanda
    for ua, ub, da, db in ((0.0, CL, CD - TP - 0.01, CD + 0.02), (0.0, CL, -0.02, TP + 0.01), (-0.02, TP + 0.01, TP, CD - TP),
                           (CL - TP - 0.01, CL + 0.02, TP, vao_deck[0]), (CL - TP - 0.01, CL + 0.02, vao_deck[1], CD - TP)):
        c.caixa('aluminio_preto', ua, ub, da, db, PLAT, PLAT + 0.025)
    # friso preto marcando a laje na fachada
    c.caixa('aluminio_preto', 0.0, CL, CD, CD + 0.008, LAJE1 - 0.03, LAJE1 - 0.01)
    # guarda-corpo de vidro em volta do deck, corrimão de inox; vão só do lado do caracol
    zg0, zg1 = PLAT + 0.025, GUARDA - 0.035
    trechos = [((0.06, CD - 0.06), (CL - 0.06, CD - 0.06)), ((0.06, 0.06), (CL - 0.06, 0.06)), ((0.06, 0.06), (0.06, CD - 0.06)),
               ((CL - 0.06, 0.06), (CL - 0.06, vao_deck[0])), ((CL - 0.06, vao_deck[1]), (CL - 0.06, CD - 0.06))]
    for (ua, da), (ub, db) in trechos:
        c.poli('vidro', [(ua, da, zg0), (ub, db, zg0), (ub, db, zg1), (ua, da, zg1)])
        c.tubo('inox', [(ua, da, GUARDA - 0.02), (ub, db, GUARDA - 0.02)], 0.022, seg=8)
        Lt = math.hypot(ub - ua, db - da)
        for k in range(int(Lt / 0.9) + 1):
            t = k / max(1, int(Lt / 0.9))
            uu, dd = ua + (ub - ua) * t, da + (db - da) * t
            c.caixa('aluminio_preto', uu - 0.035, uu + 0.035, dd - 0.035, dd + 0.035, zg0 - 0.005, zg0 + 0.07)
            c.tubo('inox', [(uu, dd, zg1 - 0.01), (uu, dd, GUARDA - 0.03)], 0.012, seg=5)
        c.colide(min(ua, ub) - 0.025, max(ua, ub) + 0.025, min(da, db) - 0.025, max(da, db) + 0.025, DECK, GUARDA)

    # ============================================================ escada de dentro em L (degraus flutuantes de cumaru)
    for k in range(1, 8):                     # lance 1: junto à ponta lisa, sobe da frente para o fundo
        b0, b1 = 2.70 - PIS * k, 2.70 - PIS * (k - 1)
        zt = PISO + ESP * k
        if k == 1:                            # primeiro degrau maciço e mais comprido, para subir de lado pela sala
            I('wood_x', 0.0, 1.25, b0, b1, PISO, zt)
            c.ipiso(0.0, 1.25, b0, b1, zt)
        else:
            I('wood_x', 0.0, 0.85, b0, b1, zt - 0.05, zt)
            I('bulb', 0.01, 0.035, b0 + 0.03, b1 - 0.03, zt - 0.056, zt - 0.05)      # fita de LED sob o degrau
            c.ipiso(0.0, 0.85, b0, b1, zt)
    I('wood_x', 0.0, 0.85, 0.0, 0.85, 1.45, 1.50)                                       # patamar
    I('bulb', 0.01, 0.035, 0.03, 0.82, 1.444, 1.45)
    c.ipiso(0.0, 0.85, 0.0, 0.85, 1.50)
    for k in range(9, 16):                    # lance 2: junto ao fundo, sobe em +iu e chega ao piso de cima em iu 2,70
        a0, a1 = 0.85 + PIS * (k - 9), 0.85 + PIS * (k - 8)
        zt = PISO + ESP * k
        I('wood_y', a0, a1, 0.0, 0.85, zt - 0.05, zt)
        I('bulb', a0 + 0.03, a1 - 0.03, 0.01, 0.035, zt - 0.056, zt - 0.05)
        c.ipiso(a0, a1, 0.0, 0.85, zt)

    def zn1(d):                               # linha dos bocéis do lance 1
        return PISO + ESP * (1 + (2.70 - d) / PIS)

    def zn2(a):                               # linha dos bocéis do lance 2
        return PISO + ESP * (9 + (a - 0.85) / PIS)
    # guarda-corpo de vidro no lado aberto (rente à borda do vão da laje); o do lance 2 morre no forro da sala
    gu = 0.856 + TP
    c.poli('vidro', [(gu, 2.20 + TP, zn1(2.20) - 0.12), (gu, 0.85 + TP, 1.50 - 0.12), (gu, 0.85 + TP, 1.50 + 0.95), (gu, 2.20 + TP, zn1(2.20) + 0.95)])
    a_top = 0.85 + PIS * ((LAJE1 - 0.95 - PISO) / ESP - 9)
    a_bot = 0.85 + PIS * ((LAJE1 + 0.12 - PISO) / ESP - 9)
    gd = 0.856 + TP
    c.poli('vidro', [(0.85 + TP, gd, 1.555), (a_bot + TP, gd, LAJE1), (a_top + TP, gd, LAJE1), (0.85 + TP, gd, zn2(0.85) + 0.95)])
    for k in range(3, 8):
        b0, b1 = 2.70 - PIS * k, 2.70 - PIS * (k - 1)
        zt = PISO + ESP * k
        c.icol(0.831, 0.881, b0, b1, zt - 0.12, zt + 0.95)
    c.icol(0.831, 0.881, 0.80, 0.86, 1.38, 2.45)
    for k in range(9, 16):
        a0, a1 = 0.85 + PIS * (k - 9), 0.85 + PIS * (k - 8)
        zt = PISO + ESP * k
        c.icol(a0, a1, 0.831, 0.881, zt - 0.12, min(zt + 0.95, LAJE1))
    # corrimão de inox na parede (ponta lisa no lance 1, fundo no lance 2)
    c.tubo('inox', [c.ip(0.05, 2.45, zn1(2.45) + 0.88), c.ip(0.05, 0.85, 1.50 + 0.88), c.ip(0.05, 0.10, 1.50 + 0.88),
                    c.ip(0.10, 0.05, 1.50 + 0.88), c.ip(0.85, 0.05, zn2(0.85) + 0.88), c.ip(2.65, 0.05, zn2(2.65) + 0.88)], 0.02, seg=8)
    for b in (2.20, 1.30):                    # suportes na parede
        c.tubo('inox', [c.ip(0.0, b, zn1(b) + 0.88), c.ip(0.05, b, zn1(b) + 0.88)], 0.008, seg=4)
    for a in (1.30, 2.30):
        c.tubo('inox', [c.ip(a, 0.0, zn2(a) + 0.88), c.ip(a, 0.05, zn2(a) + 0.88)], 0.008, seg=4)
    # seixos e um vaso com planta debaixo do patamar e do lance 1
    I('seixo', 0.02, 0.83, 0.02, 2.40, PISO, PISO + 0.015)
    top = P.pot(c.p(*c.ip(0.42, 0.42, PISO)), 0.22, 0.42, mat='pot_fiber')
    P.xanadu(top, rv, 0.8)

    # ============================================================ térreo: sala
    for k in range(19):                      # painel ripado de cumaru atrás da TV, debaixo do lance 2
        a = 0.98 + k * 0.092
        I('wood_z', a, a + 0.055, 0.0, 0.025, 0.30, 1.60)
    I('aluminio_preto', 0.98, 2.72, 0.0, 0.012, 0.30, 1.60)
    I('tela_tv', 1.40, 2.70, 0.025, 0.06, 0.86, 1.58)                                    # TV de 58"
    I('aluminio_preto', 1.40, 2.70, 0.06, 0.062, 0.86, 0.875)
    I('laca_grafite', 1.05, 2.70, 0.0, 0.38, 0.34, 0.54, col=True)                       # rack suspenso
    I('aluminio_preto', 1.05, 2.70, 0.38, 0.382, 0.43, 0.44)
    I('bulb', 1.08, 2.67, 0.30, 0.36, 0.335, 0.34)                                       # LED embaixo do rack
    c.elip('louca', c.ip(1.35, 0.20, 0.62), (0.07, 0.07, 0.08), seg=10, rings=6)       # vasinho e livros no rack
    for k, m in enumerate(('quadro', 'cushion_teal', 'tecido_terra')):
        I(m, 2.20 + 0.035 * k, 2.23 + 0.035 * k, 0.08, 0.30, 0.54, 0.80 - 0.03 * k)
    # sofá compacto (1,37 x 0,72) sob a janela, de frente para a TV (deixa passar para o primeiro degrau)
    s0, s1, sd0 = 1.55, 2.92, 2.04
    I('aluminio_preto', s0 + 0.06, s1 - 0.06, sd0 + 0.06, ID - 0.04, PISO, PISO + 0.08)
    I('tecido_grafite', s0, s1, sd0, ID, PISO + 0.08, PISO + 0.30)
    for k in range(2):
        a = s0 + 0.10 + k * (s1 - s0 - 0.20) / 2
        I('tecido_grafite', a + 0.005, a + (s1 - s0 - 0.20) / 2 - 0.005, sd0 + 0.01, ID - 0.20, PISO + 0.30, PISO + 0.45)
        I('tecido_grafite', a + 0.005, a + (s1 - s0 - 0.20) / 2 - 0.005, ID - 0.21, ID - 0.02, PISO + 0.30, PISO + 0.78)
    for a in (s0, s1 - 0.10):
        I('tecido_grafite', a, a + 0.10, sd0, ID, PISO + 0.30, PISO + 0.60)
    c.icol(s0, s1, sd0, ID, PISO, PISO + 0.78)
    for k, (m, a) in enumerate(((tecido, 1.82), ('cushion', 2.18), ('tecido_terra', 2.55))):
        c.caixa_g(m, c.ip(a, ID - 0.30, PISO + 0.62), (0.13, 0.40, 0.38), math.pi / 2 + 0.25 * (k - 1))
    c.caixa_g('cushion', c.ip(2.40, ID - 0.40, PISO + 0.47), (0.60, 0.35, 0.03), 0.3)   # manta
    # mesa de centro baixa (não barra a passagem), tapete
    I('madeira_clara', 1.75, 2.50, 1.15, 1.60, PISO + 0.26, PISO + 0.30)
    for a, b in ((1.78, 1.18), (2.44, 1.18), (1.78, 1.54), (2.44, 1.54)):
        I('aluminio_preto', a, a + 0.03, b, b + 0.03, PISO, PISO + 0.26)
    c.elip('louca', c.ip(2.0, 1.38, PISO + 0.33), (0.13, 0.13, 0.04), seg=14, rings=5, zmin=-0.2)
    for k in range(3):
        I(('quadro', 'tecido_amarelo', 'cushion_teal')[k], 2.18, 2.42 - 0.03 * k, 1.25, 1.50 - 0.02 * k, PISO + 0.30 + 0.025 * k, PISO + 0.325 + 0.025 * k)
    I('tapete', 1.12, 2.74, 0.82, 2.30, PISO, PISO + 0.008)
    # luminária de piso em arco
    I('granite', 2.48, 2.76, 0.92, 1.20, PISO, PISO + 0.04)
    arco = [c.ip(2.62, 1.06, PISO + 0.04), c.ip(2.62, 1.06, 1.20), c.ip(2.56, 1.12, 1.80), c.ip(2.40, 1.28, 2.10),
            c.ip(2.20, 1.45, 2.12), c.ip(2.08, 1.55, 1.98)]
    c.tubo('inox', arco, 0.012, seg=6)
    c.elip('aluminio_preto', c.ip(2.06, 1.57, 1.90), (0.17, 0.17, 0.11), seg=14, rings=6, zmin=-0.05)
    c.elip('bulb', c.ip(2.06, 1.57, 1.86), (0.06, 0.06, 0.04), seg=8, rings=4)
    c.icol(2.60, 2.64, 1.04, 1.08, PISO, 2.0)
    # spots no forro
    for a, b in ((1.25, 1.30), (2.40, 1.30), (1.25, 2.30), (2.40, 2.30), (3.55, 2.05), (5.40, 1.20), (5.40, 2.20)):
        c.elip('bulb', c.ip(a, b, LAJE1 - 0.004), (0.045, 0.045, 0.006), seg=10, rings=3)
    c.luz(nome, 1.85, 1.60, LAJE1 - 0.15, LUZ_QUENTE, 1.0, 5.5, 0, 'sala')
    c.luz(nome, 0.40, 1.40, 1.0, LUZ_LED, 0.35, 3.0, 0, 'escada')
    EXTRA['ventiladores'].append({'p': [round(v, 3) for v in c.p(*c.ip(1.95, 1.75, LAJE1 - 0.32))], 'teto': LAJE1, 'casa': nome,
                                  'comodo': 'sala'})

    # ============================================================ térreo: banheiro (iu 2,86–4,20 x id 0–1,30)
    I('house_white', 2.78, 2.86, 0.0, 1.38, PISO, LAJE1, col=True)
    I('house_white', 4.20, 4.28, 0.0, 1.38, PISO, LAJE1, col=True)
    c.iparede('house_white', 'u', 2.86, 4.20, 1.30, 1.38, PISO, LAJE1, [(3.50, 4.20, PISO, PISO + 2.15)])
    I('aluminio_preto', 3.50, 4.20, 1.29, 1.39, PISO + 2.15, PISO + 2.17)
    I('porcelanato', 2.86, 4.20, 0.0, 1.30, PISO, PISO + 0.005)
    I('porcelanato', 2.86, 4.20, 0.0, 0.006, PISO, LAJE1)
    I('porcelanato', 2.86, 2.866, 0.0, 1.30, PISO, LAJE1)
    I('porcelanato', 4.194, 4.20, 0.0, 1.30, PISO, LAJE1)
    I('porcelanato', 2.86, 3.50, 1.294, 1.30, PISO, LAJE1)
    # porta de correr (aberta), do lado do hall
    I('madeira_clara', 2.80, 3.53, 1.385, 1.415, PISO + 0.01, PISO + 2.13)
    I('aluminio_preto', 3.47, 3.49, 1.415, 1.43, PISO + 0.9, PISO + 1.4)
    I('aluminio_preto', 2.78, 4.22, 1.38, 1.43, PISO + 2.15, PISO + 2.19)
    # box (iu 3,50–4,20 x id 0–0,85): vidro fixo com perfil preto, chuveiro de teto, nicho, ralo linear
    I('vidro', 3.488, 3.50, 0.006, 0.85, PISO + 0.01, PISO + 2.0, col=False)
    I('aluminio_preto', 3.485, 3.503, 0.006, 0.85, PISO + 2.0, PISO + 2.02)
    I('aluminio_preto', 3.485, 3.503, 0.83, 0.85, PISO, PISO + 2.0)
    c.icol(3.47, 3.52, 0.0, 0.85, PISO, PISO + 2.02)
    I('aluminio_preto', 3.70, 4.00, 0.27, 0.57, LAJE1 - 0.02, LAJE1)                   # chuveiro de teto quadrado
    I('aluminio_preto', 3.56, 4.15, 0.80, 0.84, PISO + 0.005, PISO + 0.008)            # ralo linear
    I('aluminio_preto', 3.80, 3.90, 0.006, 0.02, 1.05, 1.15)                           # misturador
    I('laca_grafite', 3.62, 4.08, 0.006, 0.012, 1.30, 1.62)                            # nicho
    I('porcelanato', 3.62, 4.08, 0.006, 0.10, 1.30, 1.32)
    # bacia suspensa com caixa embutida, cuba de apoio na bancada de madeira, espelho redondo com LED
    I('louca', 3.08, 3.40, 0.006, 0.20, PISO + 0.24, PISO + 0.40)
    c.elip('louca', c.ip(3.24, 0.36, PISO + 0.34), (0.17, 0.21, 0.07), seg=14, rings=6)
    c.elip('white', c.ip(3.24, 0.37, PISO + 0.405), (0.17, 0.20, 0.012), seg=14, rings=4)
    I('aluminio_preto', 3.15, 3.33, 0.006, 0.014, 1.05, 1.17)
    c.icol(3.06, 3.42, 0.0, 0.58, PISO, PISO + 0.42)
    I('madeira_clara', 2.866, 3.44, 0.98, 1.294, 0.80, 0.84)
    I('laca_grafite', 2.90, 3.42, 1.00, 1.294, 0.58, 0.80)
    c.icol(2.86, 3.44, 0.96, 1.30, 0.58, 0.84)
    c.cil('louca', c.ip(3.15, 1.14, 0.84), 0.16, 0.11, seg=18, r_top=0.19)
    c.cil('granite', c.ip(3.15, 1.14, 0.95), 0.17, 0.003, seg=18)
    c.tubo('aluminio_preto', [c.ip(3.15, 1.294, 1.08), c.ip(3.15, 1.15, 1.08), c.ip(3.15, 1.12, 1.05)], 0.011, seg=6)
    c.disco_v('bulb', c.ip(3.15, 1.290, 1.58), 0.31, 'd', esp=0.004)
    c.disco_v('espelho', c.ip(3.15, 1.282, 1.58), 0.29, 'd', esp=0.008)
    c.tubo('aluminio_preto', [c.ip(3.48, 0.95, 1.0), c.ip(3.48, 1.25, 1.0)], 0.009, seg=5)    # toalheiro
    c.caixa_g('tecido_branco', c.ip(3.465, 1.10, 0.86), (0.03, 0.26, 0.30))
    I('aluminio_preto', 2.95, 3.15, 0.40, 0.60, LAJE1 - 0.01, LAJE1)                   # exaustor
    c.elip('bulb', c.ip(3.60, 0.95, LAJE1 - 0.004), (0.05, 0.05, 0.006), seg=10, rings=3)
    c.luz(nome, 3.53, 0.65, LAJE1 - 0.12, LUZ_QUENTE, 0.55, 3.0, 0, 'banheiro')

    # ============================================================ térreo: cozinha e jantar (iu 4,28–6,76)
    I('laca_grafite', 4.29, 4.88, 0.0, 0.62, PISO, 2.40, col=True)                       # torre do forno e micro-ondas
    I('tela_tv', 4.33, 4.84, 0.62, 0.625, 0.92, 1.50)
    I('inox', 4.38, 4.79, 0.625, 0.645, 1.43, 1.445)
    I('tela_tv', 4.33, 4.84, 0.62, 0.625, 1.60, 1.95)
    I('aluminio_preto', 4.29, 4.88, 0.621, 0.623, 2.05, 2.06)
    # balcão em L sem puxador: rodapé recuado, gavetões de laca grafite com cava, tampo de quartzo branco
    I('aluminio_preto', 4.88, IU, 0.0, 0.54, PISO, 0.20)
    I('laca_grafite', 4.88, IU, 0.0, 0.60, 0.20, 0.88, col=True)
    I('quartzo', 4.88, IU, 0.0, 0.62, 0.88, 0.92)
    I('aluminio_preto', 6.22, IU, 0.54, 1.89, PISO, 0.20)
    I('laca_grafite', 6.16, IU, 0.60, 1.95, 0.20, 0.88, col=True)
    I('quartzo', 6.14, IU, 0.62, 1.95, 0.88, 0.92)
    for zc in (0.52, 0.86):                                                             # cavas dos gavetões
        I('aluminio_preto', 4.88, 6.16, 0.600, 0.602, zc - 0.012, zc)
        I('aluminio_preto', 6.158, 6.16, 0.62, 1.95, zc - 0.012, zc)
    for a in (5.52, 6.16):
        I('aluminio_preto', a - 0.002, a, 0.600, 0.602, 0.20, 0.88)
    I('quartzo', 4.88, IU, 0.0, 0.012, 0.92, 1.55)                                      # frontão de quartzo
    I('tela_tv', 5.25, 5.85, 0.05, 0.56, 0.92, 0.926)                                   # cooktop de vidro
    for a, b in ((5.40, 0.20), (5.70, 0.20), (5.40, 0.42), (5.70, 0.42)):
        c.anel('granite', a + TP, b + TP, 0.07, 0.085, 0.927, seg=16)
    I('aluminio_preto', 5.22, 5.88, 0.0, 0.46, 1.62, 1.74)                              # depurador embutido entre os aéreos
    I('bulb', 5.30, 5.80, 0.30, 0.40, 1.618, 1.62)
    # aéreos de carvalho com fita de LED embaixo
    for a0, a1 in ((4.88, 5.22), (5.88, IU)):
        I('madeira_clara', a0, a1, 0.0, 0.36, 1.55, 2.30)
        I('bulb', a0 + 0.02, a1 - 0.02, 0.30, 0.33, 1.545, 1.55)
        I('aluminio_preto', a0, a1, 0.36, 0.362, 1.55, 1.575)
    # cuba sob a janela da ponta, torneira gourmet preta
    I('inox', 6.26, 6.66, 1.08, 1.56, 0.915, 0.922)
    I('aluminio_preto', 6.30, 6.62, 1.12, 1.52, 0.921, 0.924)
    c.tubo('aluminio_preto', [c.ip(6.70, 1.32, 0.92), c.ip(6.70, 1.32, 1.30), c.ip(6.66, 1.32, 1.42), c.ip(6.52, 1.32, 1.44), c.ip(6.44, 1.32, 1.36)], 0.014, seg=6)
    c.tubo('aluminio_preto', [c.ip(6.70, 1.32, 1.02), c.ip(6.70, 1.32, 1.36)], 0.022, seg=6)    # mola
    # geladeira inox no canto da frente
    I('inox', 6.16, IU - 0.02, 1.98, 2.70, PISO, 1.95, col=True)
    I('aluminio_preto', 6.155, 6.16, 1.98, 2.70, 1.20, 1.205)
    I('aluminio_preto', 6.13, 6.15, 2.10, 2.13, 0.60, 1.10)
    I('aluminio_preto', 6.13, 6.15, 2.10, 2.13, 1.30, 1.80)
    # mesa redonda (Ø 0,90) com três cadeiras de design e pendente preto
    tu, td = 5.40, 2.05
    c.cil('madeira_clara', c.ip(tu, td, 0.725), 0.45, 0.035, seg=28)
    c.cil('aluminio_preto', c.ip(tu, td, PISO), 0.045, 0.63, seg=10)
    c.cil('aluminio_preto', c.ip(tu, td, PISO), 0.26, 0.02, seg=20)
    c.icol(tu - 0.45, tu + 0.45, td - 0.45, td + 0.45, PISO, 0.76)
    for a, b, ang_ in ((5.40, 2.50, -math.pi / 2), (5.88, 2.02, math.pi), (4.97, 2.38, -0.6)):
        cadeira(c, a, b, ang_)
    c.elip('louca', c.ip(tu - 0.05, td - 0.05, 0.76), (0.15, 0.15, 0.05), seg=14, rings=5, zmin=-0.3)
    for k in range(5):
        c.elip(('fruit_orange', 'fruit_lemon', 'fruit_red', 'fruit_orange', 'fruit_lemon')[k],
               c.ip(tu - 0.10 + 0.05 * (k % 3), td - 0.08 + 0.05 * (k // 3), 0.80), 0.035, seg=8, rings=5)
    c.tubo('aluminio_preto', [c.ip(tu, td, LAJE1), c.ip(tu, td, 1.64)], 0.004, seg=3)
    c.elip('aluminio_preto', c.ip(tu, td, 1.52), (0.20, 0.20, 0.13), seg=16, rings=6, zmin=-0.05)
    c.elip('bulb', c.ip(tu, td, 1.50), (0.07, 0.07, 0.05), seg=8, rings=4)
    c.luz(nome, tu, td, 1.40, LUZ_QUENTE, 0.8, 4.5, 0, 'cozinha')
    c.luz(nome, 5.60, 0.40, 1.45, LUZ_LED, 0.45, 3.0, 0, 'cozinha')
    c.luz(nome, 3.40, 2.10, LAJE1 - 0.15, LUZ_QUENTE, 0.55, 3.5, 0, 'hall')

    # ============================================================ andar de cima: paredes
    # fechamento do vão da escada (W1 e W2 de drywall, W3 de vidro fixo), hall, banheiro e casal
    I('house_white', 0.85, 2.70, 0.85, 0.93, Z1, FORRO, col=True)
    I('house_white', 0.85, 0.93, 0.93, 1.91, Z1, FORRO, col=True)
    I('vidro', 0.0, 0.85, 1.909, 1.921, Z1 + 0.04, FORRO - 0.04)
    for a0, a1, z0, z1 in ((0.0, 0.85, Z1, Z1 + 0.04), (0.0, 0.85, FORRO - 0.04, FORRO), (0.0, 0.04, Z1, FORRO), (0.81, 0.85, Z1, FORRO)):
        I('aluminio_preto', a0, a1, 1.895, 1.935, z0, z1)
    c.icol(0.0, 0.85, 1.89, 1.94, Z1, FORRO)
    c.iparede('house_white', 'd', 0.85, ID, 2.70, 2.78, Z1, FORRO, [(0.93, 1.55, Z1, Z1 + 2.15)])
    c.iparede('house_white', 'u', 2.78, 4.31, 1.55, 1.63, Z1, FORRO, [(2.84, 3.48, Z1, Z1 + 2.10)])
    I('house_white', 4.23, 4.31, 1.63, ID, Z1, FORRO, col=True)
    c.iparede('house_white', 'd', 0.0, 1.55, 3.58, 3.66, Z1, FORRO, [(0.72, 1.40, Z1, Z1 + 2.15)])
    # portas de dentro (abertas): beliche de correr do lado do quarto, casal de correr do lado do hall,
    # banheiro de correr embutida (só o batente e a borda da folha aparecem)
    I('madeira_clara', 2.655, 2.69, 1.53, 2.21, Z1 + 0.01, Z1 + 2.12)
    I('aluminio_preto', 2.64, 2.70, 0.90, 2.25, Z1 + 2.15, Z1 + 2.19)
    I('aluminio_preto', 2.645, 2.655, 1.58, 1.61, Z1 + 0.85, Z1 + 1.35)
    c.icol(2.65, 2.70, 1.53, 2.21, Z1, Z1 + 2.13)
    I('madeira_clara', 3.54, 3.575, 0.02, 0.76, Z1 + 0.01, Z1 + 2.12)
    I('aluminio_preto', 3.53, 3.58, 0.0, 1.45, Z1 + 2.15, Z1 + 2.19)
    I('aluminio_preto', 3.53, 3.54, 0.68, 0.71, Z1 + 0.85, Z1 + 1.35)
    c.icol(3.53, 3.58, 0.02, 0.76, Z1, Z1 + 2.13)
    for a0, a1 in ((2.84, 2.855), (3.465, 3.48)):
        I('aluminio_preto', a0, a1, 1.55, 1.63, Z1, Z1 + 2.10)
    I('aluminio_preto', 2.84, 3.48, 1.55, 1.63, Z1 + 2.10, Z1 + 2.115)
    I('madeira_clara', 3.42, 3.465, 1.575, 1.605, Z1 + 0.01, Z1 + 2.08)
    # forro: luminárias
    for a, b in ((1.75, 1.85), (3.18, 0.75), (3.50, 2.20), (5.55, 2.35)):
        c.elip('bulb', c.ip(a, b, FORRO - 0.004), (0.06, 0.06, 0.006), seg=12, rings=3)

    # ============================================================ quarto da beliche
    bz = Z1
    for a in (0.02, 1.93):                    # beliche de aço preto e carvalho (colchões de 0,78 x 1,88)
        for b in (1.94, 2.72):
            I('aluminio_preto', a, a + 0.04, b, b + 0.04, bz, bz + 1.78)
    for zb in (0.22, 1.20):
        I('madeira_clara', 0.06, 1.93, 1.98, 2.72, bz + zb, bz + zb + 0.03)
        I('aluminio_preto', 0.06, 1.93, 1.94, 1.98, bz + zb - 0.06, bz + zb + 0.03)
        I('tecido_branco', 0.06, 1.93, 1.97, 2.73, bz + zb + 0.03, bz + zb + 0.19)
        I(tecido if zb < 1 else 'tecido_cinza', 0.50, 1.95, 1.955, 2.745, bz + zb + 0.12, bz + zb + 0.22)
        c.elip('tecido_branco', c.ip(0.25, 2.35, bz + zb + 0.24), (0.15, 0.27, 0.06), seg=12, rings=5)
    for zr in (1.58, 1.74):
        I('aluminio_preto', 0.06, 1.40, 1.94, 1.97, bz + zr - 0.02, bz + zr)
    I('aluminio_preto', 0.06, 0.09, 1.94, 1.97, bz + 1.23, bz + 1.74)
    for a in (1.46, 1.86):                    # escadinha
        I('aluminio_preto', a, a + 0.03, 1.90, 1.94, bz, bz + 1.78)
    for zr in (0.50, 0.80, 1.10, 1.40):
        I('aluminio_preto', 1.46, 1.89, 1.90, 1.93, bz + zr - 0.015, bz + zr + 0.015)
    c.icol(0.02, 1.97, 1.90, ID, bz, bz + 1.78)
    I('madeira_clara', 0.95, 1.55, 0.93, 1.50, Z1, Z1 + 2.35, col=True)                 # guarda-roupa alto
    I('aluminio_preto', 1.248, 1.252, 1.50, 1.502, Z1 + 0.10, Z1 + 2.25)
    I('aluminio_preto', 0.95, 1.55, 1.50, 1.505, Z1 + 1.02, Z1 + 1.04)
    # escrivaninha suspensa sob a janela, cadeira, luminária, prateleira
    I('madeira_clara', 2.02, 2.66, 2.28, ID, Z1 + 0.72, Z1 + 0.75)
    I('madeira_clara', 2.02, 2.05, 2.28, ID, Z1 + 0.55, Z1 + 0.72)
    c.icol(2.02, 2.66, 2.28, ID, Z1 + 0.55, Z1 + 0.75)
    cadeira(c, 2.34, 2.20, math.pi / 2, z=Z1, assento=tecido if tecido != 'tecido_amarelo' else 'couro')
    c.tubo('aluminio_preto', [c.ip(2.58, 2.62, Z1 + 0.75), c.ip(2.58, 2.62, Z1 + 1.15), c.ip(2.48, 2.52, Z1 + 1.20)], 0.008, seg=5)
    c.elip('aluminio_preto', c.ip(2.46, 2.50, Z1 + 1.17), (0.07, 0.07, 0.05), seg=10, rings=5, zmin=-0.1)
    I('madeira_clara', 2.50, 2.70, 2.26, 2.72, Z1 + 1.55, Z1 + 1.58)
    for k in range(5):
        I(('quadro', 'tecido_azul', 'tecido_amarelo', 'cushion_teal', 'tecido_terra')[k], 2.53, 2.69, 2.30 + 0.04 * k, 2.33 + 0.04 * k, Z1 + 1.58, Z1 + 1.80 - 0.02 * k)
    I('tapete', 0.98, 2.60, 1.52, 1.90, Z1, Z1 + 0.008)
    c.luz(nome, 1.75, 1.85, FORRO - 0.15, LUZ_QUENTE, 0.7, 4.0, 1, 'quarto_beliche')

    # ============================================================ hall de cima
    c.tubo('aluminio_preto', [c.ip(3.18, 0.75, FORRO), c.ip(3.18, 0.75, Z1 + 2.05)], 0.004, seg=3)
    c.elip('bulb', c.ip(3.18, 0.75, Z1 + 1.96), (0.11, 0.11, 0.11), seg=12, rings=6)
    I('wood_x', 2.92, 3.42, 0.0, 0.025, Z1 + 1.30, Z1 + 1.90)
    I('quadro', 2.95, 3.39, 0.025, 0.03, Z1 + 1.33, Z1 + 1.87)
    c.luz(nome, 3.18, 0.75, Z1 + 1.85, LUZ_QUENTE, 0.45, 3.0, 1, 'hall')

    # ============================================================ banheiro de cima (iu 2,78–4,23 x id 1,63–2,76)
    I('porcelanato', 2.78, 4.23, 1.63, ID, Z1, Z1 + 0.005)
    I('porcelanato', 2.78, 2.786, 1.63, ID, Z1, FORRO)
    I('porcelanato', 4.224, 4.23, 1.63, ID, Z1, FORRO)
    I('porcelanato', 2.78, 2.84, 1.63, 1.636, Z1, FORRO)
    I('porcelanato', 3.48, 4.23, 1.63, 1.636, Z1, FORRO)
    I('porcelanato', 2.78, 4.23, ID - 0.006, ID, Z1, jan_ban[2])
    # box no canto da frente (iu 2,78–3,56 x id 2,06–2,76) com vidro fixo do lado da bacia
    I('vidro', 3.548, 3.56, 2.06, ID - 0.006, Z1 + 0.01, Z1 + 2.0)
    I('aluminio_preto', 3.545, 3.563, 2.06, ID - 0.006, Z1 + 2.0, Z1 + 2.02)
    I('aluminio_preto', 3.545, 3.563, 2.06, 2.08, Z1, Z1 + 2.0)
    c.icol(3.53, 3.58, 2.06, ID, Z1, Z1 + 2.02)
    I('aluminio_preto', 3.02, 3.32, 2.26, 2.56, FORRO - 0.02, FORRO)
    I('aluminio_preto', 2.84, 3.50, 2.08, 2.12, Z1 + 0.005, Z1 + 0.008)
    I('laca_grafite', 2.786, 2.792, 2.20, 2.60, Z1 + 1.20, Z1 + 1.50)
    I('porcelanato', 2.786, 2.88, 2.20, 2.60, Z1 + 1.20, Z1 + 1.22)
    I('aluminio_preto', 2.786, 2.80, 2.36, 2.46, Z1 + 1.05, Z1 + 1.15)
    # bacia suspensa na parede da frente, bancada suspensa na parede do casal com cuba e espelho
    I('louca', 3.64, 3.96, ID - 0.20, ID - 0.006, Z1 + 0.24, Z1 + 0.40)
    c.elip('louca', c.ip(3.80, ID - 0.36, Z1 + 0.34), (0.17, 0.21, 0.07), seg=14, rings=6)
    c.elip('white', c.ip(3.80, ID - 0.37, Z1 + 0.405), (0.17, 0.20, 0.012), seg=14, rings=4)
    c.icol(3.62, 3.98, ID - 0.58, ID, Z1, Z1 + 0.42)
    I('madeira_clara', 3.90, 4.224, 1.66, 2.12, Z1 + 0.80, Z1 + 0.84)
    I('laca_grafite', 3.92, 4.224, 1.68, 2.10, Z1 + 0.58, Z1 + 0.80)
    c.icol(3.88, 4.23, 1.66, 2.12, Z1 + 0.58, Z1 + 0.84)
    c.cil('louca', c.ip(4.06, 1.89, Z1 + 0.84), 0.14, 0.11, seg=18, r_top=0.165)
    c.cil('granite', c.ip(4.06, 1.89, Z1 + 0.95), 0.15, 0.003, seg=18)
    c.tubo('aluminio_preto', [c.ip(4.224, 1.89, Z1 + 1.08), c.ip(4.08, 1.89, Z1 + 1.08), c.ip(4.05, 1.89, Z1 + 1.05)], 0.011, seg=6)
    c.disco_v('bulb', c.ip(4.220, 1.89, Z1 + 1.60), 0.26, 'u', esp=0.004)
    c.disco_v('espelho', c.ip(4.212, 1.89, Z1 + 1.60), 0.24, 'u', esp=0.008)
    c.tubo('aluminio_preto', [c.ip(3.62, 1.645, Z1 + 1.05), c.ip(3.95, 1.645, Z1 + 1.05)], 0.009, seg=5)
    c.caixa_g('tecido_branco', c.ip(3.78, 1.655, Z1 + 0.90), (0.30, 0.03, 0.32))
    I('aluminio_preto', 3.70, 3.90, 1.80, 2.00, FORRO - 0.01, FORRO)
    c.luz(nome, 3.50, 2.20, FORRO - 0.12, LUZ_QUENTE, 0.5, 3.0, 1, 'banheiro')

    # ============================================================ quarto de casal
    # painel ripado de carvalho do piso ao forro atrás da cama, cabeceira estofada
    for k in range(21):
        a = 4.62 + k * 0.095
        I('madeira_clara', a, a + 0.06, 0.0, 0.03, Z1, FORRO)
    I('tecido_grafite', 4.86, 6.44, 0.03, 0.11, Z1 + 0.38, Z1 + 1.18)
    # cama: base de laca recuada, colchão de 1,38 x 1,88, edredom, travesseiros, manta
    cu0, cu1 = 4.97, 6.37
    I('laca_grafite', cu0 + 0.05, cu1 - 0.05, 0.13, 1.90, Z1, Z1 + 0.28)
    I('tecido_branco', cu0 + 0.02, cu1 - 0.02, 0.11, 1.99, Z1 + 0.28, Z1 + 0.50)
    I(tecido, cu0, cu1, 0.75, 2.01, Z1 + 0.44, Z1 + 0.54)
    I('tecido_terra', cu0 - 0.01, cu1 + 0.01, 1.60, 1.86, Z1 + 0.49, Z1 + 0.555)
    for a in (5.30, 6.00):
        c.elip('tecido_branco', c.ip(a, 0.32, Z1 + 0.58), (0.30, 0.15, 0.08), seg=12, rings=6)
    c.caixa_g('cushion', c.ip(5.65, 0.48, Z1 + 0.62), (0.40, 0.12, 0.26), 0.0)
    c.icol(cu0, cu1, 0.0, 2.01, Z1, Z1 + 0.56)
    # criados-mudos suspensos e pendentes
    for a0, a1 in ((4.47, 4.86), (6.42, 6.74)):
        I('madeira_clara', a0, a1, 0.03, 0.42, Z1 + 0.42, Z1 + 0.58, col=True)
        I('aluminio_preto', a0, a1, 0.42, 0.422, Z1 + 0.49, Z1 + 0.50)
        am = (a0 + a1) / 2
        c.tubo('aluminio_preto', [c.ip(am, 0.26, FORRO), c.ip(am, 0.26, Z1 + 1.12)], 0.004, seg=3)
        c.elip('bulb', c.ip(am, 0.26, Z1 + 1.05), (0.075, 0.075, 0.075), seg=10, rings=6)
        c.luz(nome, am, 0.26, Z1 + 1.0, LUZ_LED, 0.3, 2.5, 1, 'quarto_casal')
    c.elip('louca', c.ip(6.58, 0.22, Z1 + 0.63), (0.05, 0.05, 0.05), seg=8, rings=5)
    I('quadro', 4.55, 4.72, 0.10, 0.30, Z1 + 0.58, Z1 + 0.60)
    # ar-condicionado split acima da cabeceira
    I('white', 5.20, 6.10, 0.03, 0.24, Z1 + 2.05, Z1 + 2.33)
    I('aluminio_preto', 5.24, 6.06, 0.235, 0.24, Z1 + 2.07, Z1 + 2.10)
    # guarda-roupa junto ao fundo
    I('laca_grafite', 3.70, 4.35, 0.0, 0.60, Z1, Z1 + 2.40, col=True)
    I('aluminio_preto', 4.023, 4.027, 0.60, 0.602, Z1 + 0.10, Z1 + 2.30)
    # TV na parede do banheiro, quadro, tapete, cortinas na porta-janela
    I('tela_tv', 4.31, 4.345, 1.72, 2.62, Z1 + 1.05, Z1 + 1.58)
    I('wood_x', 3.72, 4.20, 1.52, 1.55, Z1 + 1.30, Z1 + 1.92)
    I('quadro', 3.75, 4.17, 1.515, 1.52, Z1 + 1.33, Z1 + 1.89)
    I('tapete', 4.55, 6.72, 0.55, 2.40, Z1, Z1 + 0.008)
    I('aluminio_preto', 4.33, IU - 0.02, ID - 0.10, ID - 0.06, FORRO - 0.05, FORRO - 0.02)
    for a0, a1 in ((4.34, 4.58), (6.40, 6.70)):
        for k in range(4):
            aa = a0 + (a1 - a0) * k / 4
            I('cortina', aa, aa + (a1 - a0) / 4 + 0.01, ID - 0.11 + 0.02 * (k % 2), ID - 0.08 + 0.02 * (k % 2), Z1 + 0.03, FORRO - 0.05)
    c.luz(nome, 5.60, 1.30, FORRO - 0.15, LUZ_QUENTE, 0.9, 5.0, 1, 'quarto_casal')
    EXTRA['ventiladores'].append({'p': [round(v, 3) for v in c.p(*c.ip(5.65, 1.10, FORRO - 0.36))], 'teto': FORRO, 'casa': nome,
                                  'comodo': 'quarto_casal'})

    # ============================================================ mirante: teto verde, espreguiçadeiras, luneta
    I('corten', 0.60, IU, 0.0, 0.55, DECK, DECK + CANT)
    I('corten', 0.0, 0.60, 0.0, ID, DECK, DECK + CANT)
    I('mulch', 0.63, IU - 0.03, 0.03, 0.52, DECK + CANT - 0.03, DECK + CANT + 0.004)
    I('mulch', 0.03, 0.57, 0.03, ID - 0.03, DECK + CANT - 0.03, DECK + CANT + 0.004)
    I('bulb', 0.62, IU, 0.55, 0.565, DECK + 0.02, DECK + 0.035)                         # LED na base dos canteiros
    I('bulb', 0.60, 0.615, 0.57, ID, DECK + 0.02, DECK + 0.035)
    c.icol(0.60, IU, 0.0, 0.55, DECK, DECK + CANT)
    c.icol(0.0, 0.60, 0.0, ID, DECK, DECK + CANT)
    zc = DECK + CANT
    k = 0
    for a in np.arange(0.95, IU - 0.2, 0.52):                                           # canteiro do fundo
        q = c.p(*c.ip(a, 0.26 + 0.05 * (k % 2), zc))
        tipo = k % 6
        if tipo == 0:
            P.moreia(q, rv, 0.75)
        elif tipo == 1:
            P.xanadu(q, rv, 0.7)
        elif tipo == 2:
            P.alpinia(q, rv, n=5, H=1.0)
        elif tipo == 3:
            florzinhas(q, rv, 'flower_red')
        elif tipo == 4:
            P.bromelia(q, rv, 0.75)
        else:
            P.grama_preta(q, rv); florzinhas((q[0], q[1], q[2]), rv, 'flower_orange')
        k += 1
    for b in np.arange(0.85, ID - 0.15, 0.50):                                          # canteiro da ponta lisa
        q = c.p(*c.ip(0.29, b, zc))
        tipo = k % 5
        if tipo == 0:
            P.xanadu(q, rv, 0.65)
        elif tipo == 1:
            P.moreia(q, rv, 0.7)
        elif tipo == 2:
            florzinhas(q, rv, 'flower_orange')
        elif tipo == 3:
            P.bromelia(q, rv, 0.7, red=False)
        else:
            P.alpinia(q, rv, n=4, H=0.9)
        k += 1
    # pendendo para fora da platibanda: na quina da frente e pelo fundo
    xa, xb = c.fx(0.10, 0.80)
    P.vine_wall('leaf_vine', xa, xb, DECK - 0.55, DECK + 0.30, c.Y(CD) + sg * 0.06, sg, rv, density=220, cover=0.6, seed=3.0 + x0)
    xa, xb = c.fx(0.9, CL - 0.4)
    P.vine_wall('leaf_vine', xa, xb, DECK - 0.75, DECK + 0.25, c.Y(0.0) - sg * 0.06, -sg, rv, density=160, cover=0.35, seed=5.0 + x0)
    # tapete externo, duas espreguiçadeiras reclináveis viradas para a frente, mesinha, pufes
    I('tapete', 0.85, 4.70, 0.75, 2.55, DECK, DECK + 0.008)
    for a0 in (0.95, 1.90):
        a1 = a0 + 0.62
        I('aluminio_preto', a0, a0 + 0.03, 0.70, 2.48, DECK, DECK + 0.30)
        I('aluminio_preto', a1 - 0.03, a1, 0.70, 2.48, DECK, DECK + 0.30)
        I('aluminio_preto', a0, a1, 2.45, 2.48, DECK, DECK + 0.30)
        I('cushion', a0 + 0.02, a1 - 0.02, 1.18, 2.47, DECK + 0.28, DECK + 0.38)
        q0, q1 = c.ip((a0 + a1) / 2, 1.20, DECK + 0.34), c.ip((a0 + a1) / 2, 0.70, DECK + 0.92)
        beam('cushion', c.p(*q0), c.p(*q1), 0.58, 0.09)
        beam('aluminio_preto', c.p(*c.ip(a0 + 0.015, 1.20, DECK + 0.30)), c.p(*c.ip(a0 + 0.015, 0.74, DECK + 0.82)), 0.03, 0.03)
        beam('aluminio_preto', c.p(*c.ip(a1 - 0.015, 1.20, DECK + 0.30)), c.p(*c.ip(a1 - 0.015, 0.74, DECK + 0.82)), 0.03, 0.03)
        c.caixa_g(tecido, c.ip((a0 + a1) / 2, 0.92, DECK + 0.72), (0.12, 0.40, 0.22), 0.0)
        c.icol(a0, a1, 0.62, 2.48, DECK, DECK + 0.95)
    c.cil('madeira_clara', c.ip(1.735, 0.95, DECK + 0.44), 0.15, 0.03, seg=18)
    c.cil('aluminio_preto', c.ip(1.735, 0.95, DECK), 0.02, 0.44, seg=6)
    c.cil('aluminio_preto', c.ip(1.735, 0.95, DECK), 0.11, 0.015, seg=14)
    c.elip('louca', c.ip(1.71, 0.93, DECK + 0.52), (0.04, 0.04, 0.05), seg=8, rings=5)
    for a, b, m in ((3.45, 2.15, 'couro'), (4.00, 1.85, 'cushion_teal')):
        c.cil(m, c.ip(a, b, DECK), 0.24, 0.40, seg=18)
        c.icol(a - 0.24, a + 0.24, b - 0.24, b + 0.24, DECK, DECK + 0.40)
    # luneta (telescópio) num tripé no canto da frente do lado do caracol, apontada para o céu
    lu, ld, lz = 6.25, 2.28, DECK + 1.05
    for a in (0.0, 2.1, 4.2):
        c.tubo('aluminio_preto', [c.ip(lu + 0.36 * math.cos(a), ld + 0.36 * math.sin(a), DECK), c.ip(lu, ld, lz - 0.05)], 0.014, seg=5)
    c.cil('aluminio_preto', c.ip(lu, ld, lz - 0.06), 0.05, 0.10, seg=12)
    d_ = np.array([0.0, math.cos(0.75), math.sin(0.75)])              # aponta para a frente e para o alto
    base_ = np.array(c.ip(lu, ld, lz + 0.06)) - d_ * 0.35
    ponta = base_ + d_ * 0.95
    c.tubo('white', [tuple(base_), tuple(ponta)], [0.065, 0.065], seg=14, cap=True)
    c.tubo('aluminio_preto', [tuple(ponta - d_ * 0.12), tuple(ponta + d_ * 0.02)], 0.072, seg=14, cap=True)
    c.tubo('aluminio_preto', [tuple(base_ + d_ * 0.05), tuple(base_ + d_ * 0.05 + np.array([0, -0.02, 0.10]))], 0.015, seg=6)
    c.icol(lu - 0.36, lu + 0.36, ld - 0.36, ld + 0.36, DECK, DECK + 1.6)
    c.luz(nome, 3.30, 0.75, DECK + 0.25, LUZ_LED, 0.5, 4.0, 2, 'mirante')
    c.luz(nome, 0.85, 1.60, DECK + 0.25, LUZ_LED, 0.35, 3.0, 2, 'mirante')

    # ============================================================ escada caracol de fora (aço preto e degraus de cumaru)
    cu, cdd = CL + 1.05, CD / 2
    a0l, pl = math.radians(75.0), math.radians(-30.0)     # sentido horário na casa amarela; nas espelhadas também espelha
    cx, cy = c.X(cu), c.Y(cdd)
    c.disco('concrete', cu, cdd, 1.06, 0.012, seg=36)
    c.cil('aluminio_preto', (cu, cdd, 0.0), 0.06, GUARDA + 0.05, seg=14)

    def ponto(r, a, z):
        return (cu + r * math.cos(a), cdd + r * math.sin(a), z)
    for i in range(NCAR):
        zt = ESPCAR * (i + 1)
        angs = [a0l + pl * (i + t) for t in np.linspace(0, 1, 4)]
        pts = [(cu + R1CAR * math.cos(a), cdd + R1CAR * math.sin(a)) for a in angs]
        pts += [(cu + R0CAR * math.cos(a), cdd + R0CAR * math.sin(a)) for a in (angs[-1], angs[0])]
        c.prisma('wood_x', pts, zt - 0.04, zt)
        am = a0l + pl * (i + 0.5)
        c.caixa_g('aluminio_preto', ponto(0.47, am, zt - 0.055), (0.84, 0.05, 0.03), am)
    # corrimão helicoidal por fora com balaústres; aberto só na entrada (degrau 0) e na saída (degrau 32)
    RC = 0.93

    def zcor(a):
        return ESPCAR * ((a0l - a) / -pl + 0.5) + 0.90
    angs = np.linspace(a0l + pl * 1, a0l + pl * (NCAR - 1), (NCAR - 2) * 4 + 1)
    c.tubo('aluminio_preto', [ponto(RC, a, zcor(a)) for a in angs], 0.024, seg=8)
    for i in range(1, NCAR - 1):
        zt = ESPCAR * (i + 1)
        for t in (0.0, 0.34, 0.67):
            a = a0l + pl * (i + t)
            c.tubo('aluminio_preto', [ponto(RC, a, zt), ponto(RC, a, zcor(a))], 0.009, seg=4)
    a_fim = a0l + pl * (NCAR - 1)
    c.tubo('aluminio_preto', [ponto(RC, a_fim, ESPCAR * NCAR), ponto(RC, a_fim, zcor(a_fim))], 0.016, seg=6)
    # guarda radial no fim do último degrau (para não cair no poço do caracol)
    a_g = a0l + pl * NCAR
    for zz in (DECK + 0.40, DECK + 0.75, GUARDA - 0.02):
        c.tubo('aluminio_preto', [ponto(0.06, a_g, zz), ponto(RC, a_g, zz)], 0.014 if zz < GUARDA - 0.1 else 0.022, seg=6)
    c.tubo('aluminio_preto', [ponto(RC, a_g, DECK - 0.04), ponto(RC, a_g, GUARDA - 0.02)], 0.018, seg=6)
    EXTRA['espirais'].append({'casa': nome, 'cx': round(cx, 3), 'cy': round(cy, 3), 'r0': R0CAR, 'r1': R1CAR, 'n': NCAR,
                              'espelho': round(ESPCAR, 5), 'z0': 0.0, 'ang0': round(c.ang(a0l), 5),
                              'passo': round(-pl if c.su * c.sd < 0 else pl, 5)})

    # ============================================================ fachadas
    # caixilhos pretos
    c.esquadria('u', *jan_sala, BF, folhas=2)
    c.esquadria('u', *jan_coz, BF, folhas=2)
    c.esquadria('u', *jan_bel, BF, folhas=1, travessa=Z1 + 1.75)
    c.esquadria('u', *jan_ban, BF, folhas=1, vidro='vidro_jateado')
    c.esquadria('u', *pjan, BF, folhas=3, col=True)
    c.esquadria('d', *jan_pcoz, BP, folhas=2)
    c.esquadria('d', *jan_pcas, BP, folhas=1, travessa=Z1 + 1.80)
    for ua, ub, za in (jan_sala[:3], jan_coz[:3], jan_bel[:3]):
        c.caixa('aluminio_preto', ua - 0.02, ub + 0.02, CD - 0.02, CD + 0.05, za - 0.025, za)
    for da, db, za in (jan_pcoz[:3], jan_pcas[:3]):
        c.caixa('aluminio_preto', CL - 0.02, CL + 0.05, da - 0.02, db + 0.02, za - 0.025, za)
    # pórtico na cor da casa em volta da porta pivotante (a folha é desenhada pelo passeio)
    for ua, ub in ((pu0 - 0.20, pu0 - 0.04), (pu1 + 0.04, pu1 + 0.20)):
        c.caixa(acc, ua, ub, CD, CD + 0.30, PISO, ZP + 0.20, col=True)
    c.caixa(acc, pu0 - 0.20, pu1 + 0.20, CD, CD + 0.30, ZP + 0.02, ZP + 0.20)
    c.caixa('aluminio_preto', pu0, pu1, CD - TP, CD - TP + 0.02, ZP, ZP + 0.03)
    # volume na cor da casa em volta da porta-janela do casal, com guarda-corpo de vidro (sacada francesa)
    fu0, fu1, fz0, fz1 = pjan[0] - 0.14, pjan[1] + 0.14, LAJE1 + 0.04, FORRO + 0.10
    c.caixa(acc, fu0, pjan[0], CD, CD + 0.32, fz0, fz1)
    c.caixa(acc, pjan[1], fu1, CD, CD + 0.32, fz0, fz1)
    c.caixa(acc, fu0, fu1, CD, CD + 0.32, fz1 - 0.14, fz1)
    c.caixa(acc, fu0, fu1, CD, CD + 0.32, fz0, Z1 + 0.02)
    c.caixa('vidro', pjan[0] + 0.02, pjan[1] - 0.02, CD + 0.19, CD + 0.20, Z1 + 0.06, Z1 + 1.10)
    c.tubo('inox', [(pjan[0] + 0.01, CD + 0.195, Z1 + 1.12), (pjan[1] - 0.01, CD + 0.195, Z1 + 1.12)], 0.018, seg=6)
    # brise de ripas de cumaru no andar de cima, na frente do quarto da beliche e do banheiro
    for k in range(int((4.25 - 0.32) / 0.085) + 1):
        a = 0.32 + k * 0.085
        c.caixa('wood_z', a, a + 0.04, CD + 0.06, CD + 0.11, Z1 + 0.05, FORRO - 0.10)
    for zz in (Z1 + 0.10, FORRO - 0.16):
        c.caixa('aluminio_preto', 0.30, 4.30, CD, CD + 0.06, zz - 0.02, zz + 0.02)
    # floreira de metal sob a janela da sala
    c.caixa('aluminio_preto', jan_sala[0] - 0.04, jan_sala[1] + 0.04, CD, CD + 0.26, 0.60, 0.88)
    c.caixa('mulch', jan_sala[0] - 0.02, jan_sala[1] + 0.02, CD + 0.02, CD + 0.24, 0.84, 0.885)
    for k, a in enumerate(np.arange(jan_sala[0] + 0.10, jan_sala[1] - 0.05, 0.24)):
        q = c.p(a, CD + 0.13, 0.885)
        if k % 2 == 0:
            P.mound('leaf_trop2', q, rv, n=9, L=0.18, W=0.07, e=(0.2, 1.3), droop=0.5, r0=0.03)
        else:
            florzinhas(q, rv, 'flower_red' if k % 4 == 1 else 'flower_orange')
    # arandela preta ao lado da porta (luz para cima e para baixo)
    c.cil('aluminio_preto', (pu1 + 0.42, CD + 0.08, 1.80), 0.045, 0.30, seg=12)
    c.caixa('aluminio_preto', pu1 + 0.40, pu1 + 0.44, CD, CD + 0.05, 1.92, 1.98)
    c.elip('bulb', (pu1 + 0.42, CD + 0.08, 1.797), (0.035, 0.035, 0.005), seg=10, rings=3)
    c.elip('bulb', (pu1 + 0.42, CD + 0.08, 2.103), (0.035, 0.035, 0.005), seg=10, rings=3)
    c.luz(nome, porta[1] + 0.42, CD - TP + 0.25, 1.95, LUZ_LED, 0.4, 3.5, 0, 'entrada')
    # canteiros ao pé da fachada, pisantes até o caminho
    for lado, (ua, ub) in enumerate(((0.18, pu0 - 0.40), (pu1 + 0.40, CL - 0.12))):
        c.caixa('mulch', ua, ub, CD, CD + 0.50, 0.0, 0.012)
        for k, a in enumerate(np.arange(ua + 0.25, ub - 0.1, 0.55)):
            q = c.p(a, CD + 0.27, 0.012)
            if k % 3 == 0:
                P.moreia(q, rv, 0.7)
            elif k % 3 == 1 or lado == 0:        # embaixo da floreira só planta baixa
                P.xanadu(q, rv, 0.65)
            else:
                P.bromelia(q, rv, 0.9)
    xd = c.X((pu0 + pu1) / 2)
    y0p, y1p = c.Y(CD + 0.62 + 0.40), path_y(xd)
    npath = max(1, int(round(abs(y1p - y0p) / 0.8)))
    for k in range(npath):
        obox('stone_step', (xd, y0p + (y1p - y0p) * k / npath, 0.017), (0.8, 0.45, 0.03))

    # ============================================================ dados para o passeio
    ah = porta[1] - 0.02 + TP                              # dobradiça do lado da cozinha
    EXTRA['portas'].append({'casa': nome, 'cor': acc,
                            'dobradica': [round(v, 3) for v in c.p(ah, CD - 0.06, PISO)],
                            'fechada': [1.0 if c.X(pu0) > c.X(ah) else -1.0, 0.0],
                            'para_dentro': [0.0, -float(sg)], 'largura': 0.93, 'altura': round(ZP - PISO - 0.02, 3)})
    ex, ey = c.p(*c.ip(3.42, 2.25, 0))[:2]
    bx, by = c.p(*c.ip(0.45, 2.05, 0))[:2]
    EXTRA['lugares'].append([nome, round(ex, 3), round(ey, 3), round(math.atan2(by - ey, bx - ex), 4), PISO])
    mx, my = c.p(*c.ip(5.10, 1.45, 0))[:2]
    EXTRA['lugares'].append(['Mirante da ' + nome.lower(), round(mx, 3), round(my, 3), round(c.ang(math.pi / 2), 4), DECK])
    EXTRA['casas'].append({'nome': nome, 'x': [round(c.x0, 3), round(c.x1, 3)], 'y': [round(v, 3) for v in c.fy(0.0, CD)],
                           'piso': PISO, 'z1': Z1, 'teto': FORRO, 'deck': DECK, 'frente': round(c.Y(CD), 3)})
    EXTRA['paredes_projecao'].append({'nome': 'Parede da ' + nome.lower(), 'x0': round(c.X(0.0), 3), 'x1': round(c.X(0.0), 3),
                                      'y0': round(c.fy(0.0, CD)[0], 3), 'y1': round(c.fy(0.0, CD)[1], 3), 'z0': 0.0, 'z1': PLAT,
                                      'normal': [float(-c.su), 0.0]})
    return c


CASAS = [sobrado(4.5, 0, True, 'Casa azul', 'acc_blue', 'tecido_azul'),        # caracol a oeste, ponta lisa para a pracinha
         sobrado(16.5, 0, False, 'Casa amarela', 'acc_yellow', 'tecido_amarelo'),
         sobrado(8.5, 1, False, 'Casa verde', 'acc_green', 'tecido_verde')]
# pracinha entre a azul e a amarela: banco de cumaru encostado no muro, à esquerda da jabuticabeira
box('wood_x', 11.95, 13.45, 0.20, 0.60, 0.41, 0.46)
for xx in (12.05, 13.29):
    box('aluminio_preto', xx, xx + 0.06, 0.24, 0.56, 0, 0.41)
box('wood_x', 11.95, 13.45, 0.14, 0.20, 0.46, 0.85)
colisor(11.95, 13.45, 0.14, 0.60, 0.0, 0.85)
for (tx, ty), rr in ((JABU, 0.12), (GOIA, 0.12), (LIMAO, 0.08)):                   # troncos das árvores que mudaram de lugar
    colisor(tx - rr, tx + rr, ty - rr, ty + rr, 0.0, 2.0)
# varal de luzes em zigue-zague entre as fachadas (2,6 m, preso entre os pisos, sem cruzar janelas)
YA, YV = CD + 0.06, 10.0 - CD - 0.06
for p0, p1 in (((6.4, YA), (9.6, YV)), ((9.6, YV), (11.2, YA)), ((11.2, YA), (13.8, YV)), ((13.8, YV), (17.2, YA))):
    varal((p0[0], p0[1], 2.60), (p1[0], p1[1], 2.60), 0.25, 12)

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

# ------------------------------------------------------------------ poda: o que das árvores grandes encostaria nos sobrados
# (folhas e galhos dentro do cilindro de cada caracol ou do volume de cada casa saem, como numa poda de verdade)
PODA_MATS = ('leaf_mango', 'leaf_palm', 'leaf_palm_rachis', 'leaf_palm_base', 'leaf_goiaba', 'leaf_banana', 'leaf_jabu',
             'leaf_citrus', 'leaf_core', 'leaf_core_big', 'leaf_amend', 'leaf_amend_red', 'leaf_areca', 'leaf_vine_light',
             'fruit_mango', 'fruit_goiaba', 'fruit_banana', 'fruit_black', 'fruit_lemon', 'coconut', 'stem_banana',
             'bark_dark', 'bark_palm', 'bark_jabu', 'bark_goiaba')


def podar(mats, cilindros, caixas):
    for store in (G, GS):
        for mat in mats:
            g = store.get(mat)
            if g is None or g.n == 0:
                continue
            V = np.concatenate(g.v)
            fora = np.zeros(len(V), bool)
            for cx, cy, r, z0, z1 in cilindros:
                fora |= (np.hypot(V[:, 0] - cx, V[:, 1] - cy) < r) & (V[:, 2] > z0) & (V[:, 2] < z1)
            for x0, x1, y0, y1, z0, z1 in caixas:
                fora |= (V[:, 0] > x0) & (V[:, 0] < x1) & (V[:, 1] > y0) & (V[:, 1] < y1) & (V[:, 2] > z0) & (V[:, 2] < z1)
            if fora.any():
                for k in list(g.f):
                    g.f[k] = [fa[~fora[fa].any(axis=1)] for fa in g.f[k]]


podar(PODA_MATS, [(e['cx'], e['cy'], R1CAR + 0.14, -0.1, GUARDA + 0.5) for e in EXTRA['espirais']],
      [(cs['x'][0] - 0.03, cs['x'][1] + 0.03, cs['y'][0] - 0.03, cs['y'][1] + 0.03, -0.1, GUARDA + 0.3) for cs in EXTRA['casas']])
podar(('leaf_vine',), [], [(cs['x'][0] + TP, cs['x'][1] - TP, cs['y'][0] + TP, cs['y'][1] - TP, 0.0, DECK - 0.05) for cs in EXTRA['casas']])

objs = geo.build_objects()
print('objects', len(objs), 'polys', sum(len(o.data.polygons) for o in objs))
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'chacara.blend'))
