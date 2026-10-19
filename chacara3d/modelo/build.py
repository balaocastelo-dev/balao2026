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
# interior das casas da vilinha
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
# casas da vilinha (acabamentos modernos)
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
# laguinho orgânico
m_plain('pedra_cinza', (0.15, 0.15, 0.14), 0.88, noise=0.4, nscale=5, bump=0.6)
m_plain('pedra_ferrugem', (0.25, 0.15, 0.085), 0.88, noise=0.4, nscale=6, bump=0.6)
m_plain('pedra_bege', (0.30, 0.24, 0.155), 0.88, noise=0.4, nscale=5, bump=0.6)
m_plain('argamassa', (0.30, 0.28, 0.25), 0.95, noise=0.3, nscale=18, bump=0.3)
m_plain('veu_agua', (0.70, 0.84, 0.90), 0.03, **{'Alpha': 0.28})
m_plain('ninfeia', (0.10, 0.28, 0.06), 0.35, noise=0.15, nscale=12)
m_plain('flor_ninfeia', (0.95, 0.55, 0.70), 0.5)
# casas container da vilinha (chapa pintada, quinas, caixilhos brancos)
m_plain('chapa_azul', (0.024, 0.038, 0.082), 0.5)                                # azul-marinho da foto
m_plain('chapa_amarela', (0.83, 0.46, 0.021), 0.5)
m_plain('chapa_verde', (0.026, 0.127, 0.07), 0.5)
m_plain('pintura_amarela', (0.95, 0.60, 0.012), 0.45)                           # quinas e requadros (azul e verde)
m_plain('pintura_marinho', (0.022, 0.036, 0.08), 0.45)                          # quinas e requadros da amarela
m_plain('esquadria_branca', (0.86, 0.86, 0.84), 0.35)

# ------------------------------------------------------------------ constantes
WH = 2.3                      # altura do muro
PX0, PX1, PY0, PY1, PD = 34.2, 44.0, 1.1, 4.7, 1.4   # piscina
from obra import LOW, EDGE, FACE    # nível do quintal de baixo (x > 46) e a beira da laje; medidas da obra no obra.py
import obra


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


# guarda-corpo na beira da laje, menos onde ficam o deck e a escada
GUARDA_BEIRA = []
_cortes = sorted([(obra.DY0, obra.DY1), (obra.ESCADA_Y0, obra.ESCADA_Y1)])
_y = 0.12
for _a, _b in _cortes + [(9.95, 9.95)]:
    if _a - _y > 0.05:
        GUARDA_BEIRA.append((_y, _a))
    _y = max(_y, _b)
for _a, _b in GUARDA_BEIRA:
    guarda((EDGE - 0.04, _a), (EDGE - 0.04, _b), 0.0)

# ------------------------------------------------------------------ deck de madeira sobre o laguinho das carpas
# Medidas do Thiago: deck de 2 m de fundo x 3 m de largura, 1 m acima do quintal de baixo, saindo do piso da piscina.
# Projeto para a obra (19/10/2026): tábuas de cumaru de 10 x 2,5 cm ao longo do muro, barrotes de 6 x 16 a cada
# 49 cm apoiados numa viga de apoio presa no muro de arrimo e numa viga de 12 x 20 cm do lado de fora, em dois
# pilares de 12 x 12 nos cantos do deck, com sapata de concreto; os pilares ficam na borda de pedras, fora da água.
from obra import DX0, DX1, DY0, DY1, DTAB, DBAR, ZB0, ZV0, ZV1, BARROTES, VX0, VX1, PILARES, N_TABUAS, GUARDA_H
nb = N_TABUAS
for i in range(nb):                              # 19 tábuas de 3,00 com junta de 5 mm
    x0 = DX0 + i * (DX1 - DX0) / nb
    box('wood_y', x0 + 0.0025, x0 + (DX1 - DX0) / nb - 0.0025, DY0, DY1, ZB0, 0.0)
for yy in BARROTES:
    box('wood_x', DX0 + 0.08, DX1, yy - 0.03, yy + 0.03, ZB0 - DBAR, ZB0)
box('wood_y', DX0 + 0.08, DX0 + 0.20, DY0, DY1, ZB0 - DBAR - 0.12, ZB0 - DBAR)          # viga de apoio no muro de arrimo
box('wood_y', VX0, VX1, DY0, DY1, ZV0, ZV1)                                           # viga externa
for _px, py_ in PILARES:                                                               # pilares 12 x 12 nos cantos
    box('wood_z', VX0, VX1, py_ - 0.06, py_ + 0.06, LOW + 0.05, ZV0)
    box('concrete', VX0 - 0.09, VX1 + 0.09, py_ - 0.15, py_ + 0.15, LOW - 0.02, LOW + 0.05)
box('wood_y', DX1, DX1 + 0.025, DY0, DY1, ZB0 - DBAR, 0.0)                            # testeira
guarda((DX0, DY0 + 0.04), (DX1 - 0.04, DY0 + 0.04), 0.0)
guarda((DX1 - 0.04, DY0 + 0.04), (DX1 - 0.04, DY1 - 0.04), 0.0)
guarda((DX1 - 0.04, DY1 - 0.04), (DX0, DY1 - 0.04), 0.0)
# laguinho orgânico (pedido do Thiago em 19/10/2026, com foto de referência): contorno curvo, borda de pedras
# arredondadas meio enterradas, cascata de lajes de pedra descendo do muro de arrimo, plantas na beira e na água.
# Fundo em degraus: talude, prateleira de plantas a 30 cm e o meio com 1,00 m de água para as carpas; perto do
# muro de arrimo fica raso (não cavar fundo junto ao pé do muro). Os pilares do deck ficam fora da água.
from obra import ZAGUA, PROF, LAGO, catmull, dentro_lago, dist_borda, prof_lago, GRAMA, CY0, CY1, LAJES


def pedra(mat, c, r, rng, R=None, seg=10, rings=6):
    """Pedra arredondada irregular (elipsoide com o raio deformado), facetada."""
    rx, ry, rz = r
    fase = rng.uniform(0, 2 * math.pi, 6)
    vs = []
    for j in range(rings + 1):
        th = math.pi * j / rings
        for i in range(seg):
            ph = 2 * math.pi * i / seg
            k = (1 + 0.16 * math.sin(2 * ph + fase[0]) * math.sin(th) + 0.11 * math.sin(3 * ph + fase[1]) + 0.08 * math.cos(2 * th + fase[2])
                 + 0.06 * math.sin(5 * ph + fase[3]) * math.sin(2 * th + fase[4]))
            v = np.array([rx * k * math.sin(th) * math.cos(ph), ry * k * math.sin(th) * math.sin(ph), rz * k * math.cos(th)])
            if v[2] > 0.7 * rz:
                v[2] = 0.7 * rz + (v[2] - 0.7 * rz) * 0.4    # topo mais chato
            vs.append(v)
    V = np.array(vs)
    if R is not None:
        V = V @ np.asarray(R).T
    V = V + np.asarray(c, float)
    F = []
    for j in range(rings):
        for i in range(seg):
            a, b = j * seg + i, j * seg + (i + 1) % seg
            F.append([a, b, b + seg, a + seg])
    G[mat].add(V, F)


# muro de arrimo na beira da laje: bloco com revestimento de pedras arredondadas assentadas com argamassa (as juntas
# aparecem entre as pedras), capa de pedra lisa no topo; embaixo do deck o topo é uma cinta de concreto com a viga de apoio
PEDRAS_MURO = ('pedra_cinza', 'pedra_bege', 'pedra_cinza', 'pedra_ferrugem', 'pedra_bege', 'pedra_cinza')
rm = np.random.default_rng(57)
for y0m, y1m in obra.MURO_TRECHOS:
    box('argamassa', EDGE, FACE + 0.02, y0m, y1m, LOW - 0.02, -obra.MURO_CINTA)
    z_ = LOW - 0.03; fila = 0
    while z_ < -obra.MURO_CINTA - 0.05:
        h = rm.uniform(0.17, 0.27); y_ = y0m + (0.0 if fila % 2 == 0 else -rm.uniform(0.08, 0.16)); fila += 1
        while y_ < y1m:
            ry = rm.uniform(0.13, 0.25); yc = y_ + ry
            no_deck = DY0 - 0.02 < yc < DY1 + 0.02
            topo = (ZB0 - DBAR - 0.14) if no_deck else -obra.MURO_CINTA
            rz = min(h / 2 * rm.uniform(0.85, 1.02), (topo - z_) / 2)
            if rz > 0.05 and y0m + 0.06 < yc < y1m - 0.06:
                pedra(PEDRAS_MURO[int(rm.integers(len(PEDRAS_MURO)))], (FACE + 0.015, min(yc, y1m - 0.08), z_ + rz + rm.uniform(-0.01, 0.01)),
                      (rm.uniform(0.07, 0.10), ry * rm.uniform(0.95, 1.05), rz), rm, R=rotx(rm.uniform(-0.12, 0.12)), seg=9, rings=5)
            y_ += 2 * ry * rm.uniform(0.86, 0.96)
        z_ += h * rm.uniform(0.86, 0.94)
    for yy0, yy1 in ((y0m, min(y1m, DY0)), (max(y0m, DY1), y1m)):
        if yy1 > yy0:
            box('stone_cut', EDGE, FACE + 0.10, yy0, yy1, -obra.MURO_CINTA, 0.0)                 # capa de pedra no topo
    if y0m < DY1 and y1m > DY0:
        box('concrete', EDGE, FACE + 0.005, max(y0m, DY0), min(y1m, DY1), ZB0 - DBAR - 0.16, ZB0)   # cinta onde a viga de apoio é chumbada

rp = np.random.default_rng(31)
# fundo (manta escura) e espelho d'água numa grade de 8 cm; a borda serrilhada fica embaixo das pedras
gx = np.linspace(EDGE + 0.08, 50.30, 54); gy = np.linspace(2.70, 7.50, 61)
GX, GY = np.meshgrid(gx, gy, indexing='ij')
dentro = dentro_lago(GX, GY)
borda = dist_borda(GX, GY)
perto = dentro | (borda < 0.12)
ZF = np.where(dentro, ZAGUA - prof_lago(GX, GY), ZAGUA + 0.02)
vf, ff, vw, fw, vg, fg, vp, fp = [], [], [], [], [], [], [], []
for i in range(len(gx) - 1):
    for j in range(len(gy) - 1):
        cel = [(i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1)]
        if all(perto[a, b] for a, b in cel):
            k = len(vf); vf += [[gx[a], gy[b], ZF[a, b]] for a, b in cel]; ff.append([k, k + 1, k + 2, k + 3])
        if all(dentro[a, b] or borda[a, b] < 0.06 for a, b in cel):
            k = len(vw); vw += [[gx[a], gy[b], ZAGUA] for a, b in cel]; fw.append([k, k + 1, k + 2, k + 3])
        if not all(dentro[a, b] for a, b in cel):
            k = len(vp); vp += [[gx[a], gy[b], LOW - 0.004] for a, b in cel]; fp.append([k, k + 1, k + 2, k + 3])
G['pond_floor'].add(vf, ff)
G['water_pond'].add(vw, fw)
G['pedrisco'].add(vp, fp)                               # chão da área do laguinho (com o buraco do lago)
# faixa de grama de contorno livre em volta do laguinho (por cima do pedrisco): contorno de fora no obra.py (GRAMA)
from mathutils import geometry as _mgeo, Vector as _V
ZG = LOW + 0.003                                        # um pouco acima do pedrisco (sem brigar com ele no render)
laco_f = [_V((x_, y_, ZG)) for x_, y_ in GRAMA]; laco_d = [_V((x_, y_, ZG)) for x_, y_ in LAGO]
G['grass'].add([tuple(v) for v in laco_f + laco_d], [list(t) for t in _mgeo.tessellate_polygon([laco_f, laco_d])])
# borda de pedras arredondadas, meio enterradas, uma encostada na outra
PEDRAS = ('pedra_bege', 'pedra_cinza', 'pedra_bege', 'pedra_ferrugem', 'pedra_cinza')
seg_len = np.sqrt(((np.roll(LAGO, -1, axis=0) - LAGO) ** 2).sum(axis=1)); s_acum = np.concatenate([[0], np.cumsum(seg_len)])
per = s_acum[-1]
s = 0.0
while s < per - 0.15:
    k = np.searchsorted(s_acum, s) - 1; k = max(0, min(k, len(LAGO) - 1))
    p = LAGO[k]; q = LAGO[(k + 1) % len(LAGO)]
    tng = (q - p) / (np.linalg.norm(q - p) + 1e-9); nrm = np.array([tng[1], -tng[0]])
    if dentro_lago(*(p + nrm * 0.3)):
        nrm = -nrm                                      # normal para fora
    r = rp.uniform(0.13, 0.36) if rp.random() < 0.8 else rp.uniform(0.30, 0.42)
    c = p + nrm * rp.uniform(0.0, 0.12)
    if c[0] < EDGE + 0.30:                              # junto ao muro de arrimo as pedras são menores
        r *= 0.75
    laje = rp.random() < 0.22                           # de vez em quando uma laje chata, de pisar
    pedra(PEDRAS[int(rp.integers(len(PEDRAS)))], (c[0], c[1], LOW - (0.03 if laje else 0.04)),
          (r * rp.uniform(1.1, 1.5), r * rp.uniform(0.8, 1.0), r * (rp.uniform(0.22, 0.32) if laje else rp.uniform(0.45, 0.75))), rp,
          R=rotz(rp.uniform(0, math.pi)), seg=int(rp.integers(7, 11)))
    if rp.random() < 0.35:                              # algumas pedras de trás, maiores, fazendo o segundo nível
        c2 = p + nrm * rp.uniform(0.28, 0.42); r2 = rp.uniform(0.20, 0.34)
        if c2[0] > EDGE + 0.25:
            pedra(PEDRAS[int(rp.integers(len(PEDRAS)))], (c2[0], c2[1], LOW + 0.02), (r2 * 1.2, r2, r2 * 0.7), rp, R=rotz(rp.uniform(0, math.pi)))
    s += r * rp.uniform(1.25, 1.6)
# pedras em volta da base dos pilares do deck
for py_ in (DY0 + 0.06, DY1 - 0.06):
    for a in (0.4, 2.1, 3.8, 5.3):
        pedra('pedra_cinza', (VX0 + 0.06 + 0.24 * math.cos(a), py_ + 0.24 * math.sin(a), LOW - 0.02), (0.17, 0.14, 0.11), rp, R=rotz(a))
# cascata de lajes de pedra descendo do muro de arrimo (a água sai de um cano escondido entre as pedras)
for k, (av, zt) in enumerate(LAJES):
    obox('pedra_cinza', (EDGE + 0.08 + av / 2, (CY0 + CY1) / 2 + rp.uniform(-0.03, 0.03), zt - 0.04), (av, CY1 - CY0 + 0.08 - 0.06 * k, 0.08),
         rotz(rp.uniform(-0.05, 0.05)))
    zb = LAJES[k + 1][1] if k + 1 < len(LAJES) else ZAGUA
    lip = EDGE + 0.08 + av + 0.01                                # véu de água caindo da beira de cada laje, em filetes
    ts = np.linspace(0, 1, 8); y_ = CY0 + 0.12 + 0.03 * k
    while y_ < CY1 - 0.14 - 0.03 * k:
        w_ = rp.uniform(0.06, 0.16); ya, yb = y_, min(y_ + w_, CY1 - 0.12 - 0.03 * k)
        sx = rp.uniform(0.09, 0.14)
        vv = [(lip + sx * t, yy, zt - (zt - zb) * t * t) for t in ts for yy in (ya, yb)]
        G['veu_agua'].add(vv, [[2 * i, 2 * i + 1, 2 * i + 3, 2 * i + 2] for i in range(len(ts) - 1)])
        y_ = yb + rp.uniform(0.01, 0.04)
for k in range(9):                                              # pedras empilhadas de cada lado e embaixo das lajes
    lado = CY0 - 0.12 if k % 2 == 0 else CY1 + 0.12
    zc = LOW + 0.10 + (k // 2) * 0.26
    pedra(PEDRAS[k % 5], (EDGE + 0.30 - 0.03 * (k // 2), lado, zc), (0.26, 0.20, 0.17), rp, R=rotz(rp.uniform(0, math.pi)))
for k, (av, zt) in enumerate(LAJES[:-1]):
    pedra('pedra_bege', (EDGE + 0.20, (CY0 + CY1) / 2, zt - 0.22), (0.16, 0.30, 0.15), rp)
P.mound('leaf_fern', (EDGE + 0.30, CY0 - 0.25, -0.05), rng, n=22, L=0.55, W=0.12, e=(0.1, 1.2), droop=0.9, r0=0.06)
P.mound('leaf_fern', (EDGE + 0.28, CY1 + 0.28, -0.32), rng, n=18, L=0.5, W=0.11, e=(0.1, 1.2), droop=0.9, r0=0.06)
koi = [(48.9, 4.3, 0.3, 'koi_o'), (48.6, 5.2, 2.2, 'koi_w'), (49.3, 5.5, 1.2, 'koi_o'), (48.2, 4.7, 4.0, 'koi_k'),
       (49.0, 3.7, 5.1, 'koi_w'), (47.4, 5.1, 0.9, 'koi_o'), (49.5, 4.75, 2.9, 'koi_o'), (47.6, 4.2, 3.5, 'koi_w'), (48.6, 6.1, 1.9, 'koi_o')]
for kx, ky, ka, km in koi:
    R = rotz(ka)
    zk = ZAGUA - 0.14
    ellipsoid(km, (kx, ky, zk), (0.25, 0.07, 0.055), seg=10, rings=6, R=R)
    tail = np.array([kx, ky, zk]) - R @ np.array([0.3, 0, 0])
    ellipsoid(km, tail, (0.09, 0.015, 0.06), seg=6, rings=4, R=R)
    ellipsoid('koi_w' if km != 'koi_w' else 'koi_o', np.array([kx, ky, zk + 0.035]) + R @ np.array([0.06, 0, 0]), (0.09, 0.05, 0.03), seg=7, rings=4, R=R)
# ninfeias boiando (folhas redondas com um corte) e uma flor
for nx, ny, nr in ((49.35, 4.35, 0.22), (49.55, 4.9, 0.17), (49.15, 4.75, 0.14), (48.75, 3.55, 0.2), (48.4, 3.85, 0.13), (49.45, 5.7, 0.18)):
    a0 = rp.uniform(0, 2 * math.pi)
    pts = [(nx, ny, ZAGUA + 0.006)] + [(nx + nr * math.cos(a0 + t), ny + nr * math.sin(a0 + t), ZAGUA + 0.006) for t in np.linspace(0.25, 2 * math.pi - 0.25, 16)]
    G['ninfeia'].add(pts, [[0, i, i + 1] for i in range(1, 16)])
for fx_, fy_ in ((49.3, 4.55), (48.85, 3.75)):
    for a in np.linspace(0, 2 * math.pi, 8, endpoint=False):
        ellipsoid('flor_ninfeia', (fx_ + 0.05 * math.cos(a), fy_ + 0.05 * math.sin(a), ZAGUA + 0.04), (0.055, 0.025, 0.02), seg=6, rings=3, R=rotz(a))
    ellipsoid('flower_orange', (fx_, fy_, ZAGUA + 0.05), 0.025, seg=6, rings=3)
# chão do quintal de baixo fora da área do laguinho
for a in ((50.30, 60, 0, 10), (EDGE, 50.30, 0, 2.70), (EDGE, 50.30, 7.50, 10)):
    box('pedrisco', a[0], a[1], a[2], a[3], LOW - 0.04, LOW)
# escada
for i in range(obra.ESCADA_N):
    box('stone_cut', EDGE + 0.08 + obra.ESCADA_PISO * i, EDGE + 0.08 + obra.ESCADA_PISO * (i + 1), obra.ESCADA_Y0, obra.ESCADA_Y1, LOW,
        LOW * (i + 1) / (obra.ESCADA_N + 1))
box('stone_cut', EDGE - 0.3, EDGE + 0.08, obra.ESCADA_Y0, obra.ESCADA_Y1, -0.02, 0.02)
# plantas na beira do laguinho (como na foto: samambaias, folhagens, moreia, papiro e taioba roxa na água)
P.papiro((49.78, 5.45, ZAGUA - 0.25), rng, n=16, H=1.0); P.papiro((48.28, 6.18, ZAGUA - 0.25), rng, n=10)
P.inhame((49.55, 3.55, LOW), rng, n=7); P.inhame((47.75, 6.95, LOW), rng, n=6)
P.mound('leaf_fern', (50.45, 4.4, LOW), rng, n=26, L=0.6, W=0.13, e=(0.1, 1.2), droop=0.9, r0=0.07)
P.mound('leaf_fern', (48.2, 2.45, LOW), rng, n=22, L=0.55, W=0.12, e=(0.1, 1.2), droop=0.9, r0=0.06)
P.pacova((50.4, 6.4, LOW), rng, 1.0); P.pacova((47.4, 7.55, LOW), rng, 0.9)
P.moreia((50.35, 3.3, LOW), rng); P.moreia((49.75, 6.95, LOW), rng); P.moreia((46.75, 2.95, LOW), rng, 0.8)
P.asplenio((49.0, 2.55, LOW), rng, 1.0); P.xanadu((48.9, 7.15, LOW), rng, 1.0); P.xanadu((46.6, 7.6, LOW), rng, 0.9)
P.alpinia((50.55, 5.4, LOW), rng, n=6, H=1.3)

# ------------------------------------------------------------------ poço antigo com cara de poço de fazenda
WC = obra.POCO
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
am = P.amendoeira((obra.ARVORE[0], obra.ARVORE[1], LOW), rng)
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
JABU, GOIA, LIMAO = (14.0, 2.2), (19.2, 8.2), (27.2, 1.5)         # árvores do pomar que saíram do caminho das casas
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
# moreias ao pé dos muros, fora das casas, das escadas (com folga), do banco e das árvores
for xx in np.arange(1.5, 28.0, 1.7):
    if not (1.2 < xx < 13.7) and not (16.0 < xx < 26.0) and abs(xx - JABU[0]) > 0.9 and abs(xx - LIMAO[0]) > 1.2:
        P.moreia((xx, 0.45, 0.0), rng, 0.8)
for xx in np.arange(7.8, 33.0, 1.7):
    if not (8.1 < xx < 18.2) and min(abs(xx - c) for c in (6.9, GOIA[0], 21.2, 23.7, 26.4, 30.4)) > 1.2:
        P.moreia((xx, 9.5, 0.0), rng, 0.8)
P.heliconia((1.0, 1.2, 0), rng, n=9, H=1.8, spread=0.3); P.heliconia((1.75, 0.55, 0), rng, n=7, H=1.5, flower='flower_orange', spread=0.3)


# ------------------------------------------------------------------ a vilinha: três casas container com terraço aberto
# Pedido do Thiago (15/10/2026): as casas da vilinha no modelo "casa container com terraço" da foto que ele mandou.
# Um container por casa, de 7 x 3 m (a medida que ele deu para a vilinha), com sala, cozinha, banheiro e quarto;
# em cima, um terraço de cumaru com guarda-corpo, mesa, cadeiras e vasos, sem cobertura (pedido do Thiago em
# 15/10/2026, depois de ver o telhado metálico da foto: o deck fica aberto para o céu);
# escada metálica reta do lado de fora, na lateral. Chapa ondulada pintada, quinas e requadros de outra cor,
# janelas de 1,00 x 1,00 e porta de vidro de 0,80 x 2,00 com caixilho branco.
# A ponta lisa (sem aberturas) de cada casa recebe projeção mapeada.
CL, CD = 7.0, 3.0                       # comprimento ao longo do muro e fundo
TP, TD = 0.12, 0.08                     # parede do container (chapa + isolamento + forro) e divisória interna
IU, ID = CL - 2 * TP, CD - 2 * TP       # medidas internas: 6,76 x 2,76
Z0C, ZTC = 0.10, 2.70                   # base e topo do container (apoiado em sapatas de concreto)
PISO, FORRO = 0.25, 2.55                # piso e forro de dentro (pé-direito de 2,30)
DECK = 2.76                             # piso do terraço (réguas de cumaru sobre o teto do container)
GUARDA = DECK + 1.10                    # guarda-corpo (na foto é de 0,80; a norma pede 1,10)
ONDA, FUNDO_ONDA = 0.28, 0.035          # chapa ondulada trapezoidal: passo e profundidade
NESC, LARG = 14, 0.80                   # escada de fora: espelhos e largura (na foto é de 0,60)
ESPE, PISE = DECK / NESC, 0.23          # espelho (0,197) e pisada
PAT = 0.85                              # patamar da escada no alto, encostado no muro
rv = np.random.default_rng(23)
PLANTIO_TERRACO = []                    # (tipo, topo do vaso) dos vasos do terraço, plantados depois da poda
LUZ_QUENTE, LUZ_LED = [1.0, 0.82, 0.62], [1.0, 0.72, 0.42]

EXTRA = {'colisores': [], 'pisos': [], 'portas': [], 'luzes': [], 'ventiladores': [], 'lugares': [], 'casas': [],
         'espirais': [], 'escadas': [], 'paredes_projecao': []}


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


def perfil_onda(a, a0, passo, prof):
    """Recuo da chapa trapezoidal no ponto a (0 na crista, prof no vale)."""
    q = passo / 4
    t = ((a - a0) % passo) / q
    if t < 1:
        return 0.0
    if t < 2:
        return prof * (t - 1)
    if t < 3:
        return prof
    return prof * (4 - t)


def pontos_onda(a, b, a0, passo):
    """Pontos do perfil entre a e b (as quebras da chapa trapezoidal e as duas pontas)."""
    q = passo / 4
    k0 = int(math.floor((a - a0) / q)) + 1
    k1 = int(math.ceil((b - a0) / q))
    return [a] + [a0 + k * q for k in range(k0, k1) if a + 1e-4 < a0 + k * q < b - 1e-4] + [b]


class Casa:
    """Referência local de uma casa: u corre ao longo do muro a partir da ponta lisa (u = 0) até a ponta da
    escada (u = 7); d vai do muro de fundo (0) até a fachada (3). A casa azul é espelhada (X = x1 - u).
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

    def viga(self, mat, q0, q1, w, h):
        beam(mat, self.p(*q0), self.p(*q1), w, h)

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
        for a, b, za, zb in self._pedacos(a0, a1, z0, z1, vaos):
            self._peca(mat, eixo, a, b, b0, b1, za, zb, col)

    def _pedacos(self, a0, a1, z0, z1, vaos):
        cortes = sorted(set([a0, a1] + [q for v in vaos for q in v[:2] if a0 < q < a1]))
        out = []
        for a, b in zip(cortes[:-1], cortes[1:]):
            vs = sorted([v for v in vaos if v[0] <= a + 1e-6 and v[1] >= b - 1e-6], key=lambda v: v[2])
            z = z0
            for v in vs:
                if v[2] - z > 1e-4:
                    out.append((a, b, z, min(v[2], z1)))
                z = max(z, v[3])
            if z1 - z > 1e-4:
                out.append((a, b, z, z1))
        return out

    def _peca(self, mat, eixo, a, b, b0, b1, za, zb, col=False):
        if eixo == 'u':
            self.caixa(mat, a, b, b0, b1, za, zb, col)
        else:
            self.caixa(mat, b0, b1, a, b, za, zb, col)

    def chapa(self, mat, eixo, a0, a1, bfora, para_dentro, z0, z1, vaos=(), passo=ONDA, prof=FUNDO_ONDA):
        """Chapa ondulada trapezoidal de container, de a0 a a1 ao longo do eixo ('u' ou 'd'), com a crista no
        plano bfora e o vale para dentro (para_dentro = +1 ou -1 no outro eixo), de z0 a z1, com vãos."""
        for a, b, za, zb in self._pedacos(a0, a1, z0, z1, vaos):
            pts = pontos_onda(a, b, a0, passo)
            verts, faces = [], []
            for x, y in zip(pts[:-1], pts[1:]):
                i = len(verts)
                for aa, zz in ((x, za), (y, za), (y, zb), (x, zb)):
                    bb = bfora + para_dentro * perfil_onda(aa, a0, passo, prof)
                    verts.append(self.p(aa, bb, zz) if eixo == 'u' else self.p(bb, aa, zz))
                faces.append([i, i + 1, i + 2, i + 3])
            G[mat].add(verts, faces)

    def requadro(self, eixo, a0, a1, z0, z1, bfora, para_dentro, mat='esquadria_branca', larg=0.06, sai=0.015, peitoril=True):
        """Requadro de chapa em volta de um vão: moldura por fora e o forro das quatro faces do vão."""
        bo = bfora - para_dentro * sai                 # face de fora da moldura
        bi = bfora + para_dentro * TP                  # face de dentro da parede
        pecas = [(a0 - larg, a0, z0 - (larg if peitoril else 0.0), z1 + larg), (a1, a1 + larg, z0 - (larg if peitoril else 0.0), z1 + larg),
                 (a0, a1, z1, z1 + larg)]
        if peitoril:
            pecas.append((a0 - larg, a1 + larg, z0 - larg, z0))
        for a, b, za, zb in pecas:
            self._peca(mat, eixo, a, b, bo, bfora, za, zb)
        for a, b, za, zb in ((a0, a0 + 0.012, z0, z1), (a1 - 0.012, a1, z0, z1), (a0, a1, z1 - 0.012, z1)) + (((a0, a1, z0, z0 + 0.012),) if peitoril else ()):
            self._peca(mat, eixo, a, b, bfora, bi, za, zb)

    def esquadria(self, eixo, a0, a1, z0, z1, bm, folhas=2, travessa=None, vidro='vidro', col=False, f=0.05, mat_q='aluminio_preto'):
        """Caixilho com vidro, no meio da parede (bm = posição no outro eixo)."""
        pecas = [(a0, a0 + f, z0, z1), (a1 - f, a1, z0, z1), (a0 + f, a1 - f, z0, z0 + f), (a0 + f, a1 - f, z1 - f, z1)]
        for k in range(1, folhas):
            am = a0 + (a1 - a0) * k / folhas
            pecas.append((am - f / 2, am + f / 2, z0 + f, z1 - f))
        if travessa is not None:
            pecas.append((a0 + f, a1 - f, travessa - f / 2, travessa + f / 2))
        for a, b, za, zb in pecas:
            self._peca(mat_q, eixo, a, b, bm - 0.03, bm + 0.03, za, zb)
        self._peca(vidro, eixo, a0 + f, a1 - f, bm - 0.004, bm + 0.004, z0 + f, z1 - f)
        if col:
            if eixo == 'u':
                self.colide(a0, a1, bm - 0.025, bm + 0.025, z0, z1)
            else:
                self.colide(bm - 0.025, bm + 0.025, a0, a1, z0, z1)

    def guarda_corpo(self, q0, q1, z, quina, h=1.10):
        """Guarda-corpo de aço preto com barras horizontais e corrimão na cor das quinas (como na foto)."""
        (ua, da), (ub, db) = q0, q1
        L = math.hypot(ub - ua, db - da)
        n = max(1, int(math.ceil(L / 1.15)))
        for k in range(n + 1):
            uu, dd = ua + (ub - ua) * k / n, da + (db - da) * k / n
            self.caixa('aluminio_preto', uu - 0.025, uu + 0.025, dd - 0.025, dd + 0.025, z, z + h - 0.05)
        for zz in (0.14, 0.36, 0.58, 0.80):
            self.tubo('aluminio_preto', [(ua, da, z + zz), (ub, db, z + zz)], 0.012, seg=6)
        w = 0.035
        if abs(ub - ua) > abs(db - da):
            self.caixa(quina, min(ua, ub) - w, max(ua, ub) + w, da - w, da + w, z + h - 0.05, z + h)
        else:
            self.caixa(quina, ua - w, ua + w, min(da, db) - w, max(da, db) + w, z + h - 0.05, z + h)
        self.colide(min(ua, ub) - 0.03, max(ua, ub) + 0.03, min(da, db) - 0.03, max(da, db) + 0.03, z, z + h)

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


def container(x0, side, espelho, nome, corpo, quina, tecido):
    """Casa container de 7 x 3 m encostada no muro, frente para o gramado, terraço aberto em cima e escada
    reta de fora na ponta u = 7 (sobe da frente para o fundo e chega a um patamar junto ao muro)."""
    c = Casa(x0, side, espelho)
    I = c.i
    sg = c.sd
    porta = (2.70, 3.50)                                   # vão da porta de entrada (iu): abre no hall
    pu0, pu1 = porta[0] + TP, porta[1] + TP
    ZP = PISO + 2.00                                       # porta de 0,80 x 2,00, como na foto
    jan_q = (0.65 + TP, 1.65 + TP, PISO + 1.00, PISO + 2.00)   # janelas de 1,00 x 1,00 com o topo na altura da porta
    jan_s = (4.70 + TP, 5.70 + TP, PISO + 1.00, PISO + 2.00)
    vaos_frente = [(pu0, pu1, 0.0, ZP), jan_q, jan_s]
    BF = CD - TP / 2                                       # meio da parede da frente
    z_ch0, z_ch1 = Z0C + 0.14, ZTC - 0.16                  # a chapa fica entre a longarina de baixo e a de cima

    # ============================================================ estrutura do container
    # sapatas de concreto e chapa do fundo
    for u in (0.10, CL / 2, CL - 0.10):
        for d in (0.17, CD - 0.17):
            c.caixa('concrete', u - 0.18, u + 0.18, d - 0.16, d + 0.16, 0.0, Z0C)
    c.caixa('aluminio_preto', 0.05, CL - 0.05, 0.05, CD - 0.05, Z0C, Z0C + 0.02)
    # chapa ondulada (crista no plano da parede, vale para dentro) e forro de dentro com isolamento
    c.chapa(corpo, 'u', 0.0, CL, CD, -1, z_ch0, z_ch1, vaos_frente)
    c.chapa(corpo, 'u', 0.0, CL, 0.0, 1, z_ch0, z_ch1)
    c.chapa(corpo, 'd', 0.0, CD, 0.0, 1, z_ch0, z_ch1)                                    # ponta lisa (projeção)
    c.chapa(corpo, 'd', 0.0, CD, CL, -1, z_ch0, z_ch1)
    c.parede('house_white', 'u', 0.0, CL, CD - TP, CD - 0.04, Z0C, ZTC, vaos_frente)
    c.parede('house_white', 'u', 0.0, CL, 0.04, TP, Z0C, ZTC)
    c.parede('house_white', 'd', TP, CD - TP, 0.04, TP, Z0C, ZTC)
    c.parede('house_white', 'd', TP, CD - TP, CL - TP, CL - 0.04, Z0C, ZTC)
    # colunas de canto e longarinas (a moldura pintada da foto); a de cima vai até o piso do terraço
    for ua, ub in ((-0.01, 0.15), (CL - 0.15, CL + 0.01)):
        for da, db in ((0.0, 0.15), (CD - 0.15, CD + 0.01)):
            c.caixa(quina, ua, ub, da, db, Z0C, ZTC)
    for za, zb in ((Z0C, z_ch0), (z_ch1, DECK + 0.02)):
        c.caixa(quina, 0.0, CL, CD - 0.12, CD + 0.012, za, zb)
        c.caixa(quina, 0.0, CL, 0.0, 0.12, za, zb)
        c.caixa(quina, -0.012, 0.12, 0.12, CD - 0.12, za, zb)
        c.caixa(quina, CL - 0.12, CL + 0.012, 0.12, CD - 0.12, za, zb)
    # piso e forro
    I('piso_madeira', 0, IU, 0, ID, Z0C + 0.02, PISO)
    c.ipiso(0, IU, 0, ID, PISO)
    I('gesso', 0, IU, 0, ID, FORRO, FORRO + 0.03)
    # terraço: réguas de cumaru sobre o teto do container, por dentro das longarinas
    c.caixa('deck_ipe', 0.12, CL - 0.12, 0.12, CD - 0.12, ZTC - 0.04, DECK)
    c.piso(0.0, CL, 0.0, CD, DECK)
    # soleira, degrau de cumaru e pisantes até o caminho
    c.caixa('aluminio_preto', pu0, pu1, CD - TP, CD + 0.012, PISO - 0.012, PISO)
    c.piso(pu0, pu1, CD - TP - 0.01, CD + 0.012, PISO)
    c.caixa('deck_ipe', pu0 - 0.15, pu1 + 0.15, CD + 0.012, CD + 0.47, 0.0, 0.13)
    c.piso(pu0 - 0.15, pu1 + 0.15, CD + 0.012, CD + 0.47, 0.13)
    xd = c.X((pu0 + pu1) / 2)
    y0p, y1p = c.Y(CD + 0.47 + 0.40), path_y(xd)
    npath = max(1, int(round(abs(y1p - y0p) / 0.8)))
    for k in range(npath):
        obox('stone_step', (xd, y0p + (y1p - y0p) * k / npath, 0.017), (0.8, 0.45, 0.03))

    # ============================================================ divisórias de drywall
    c.iparede('house_white', 'd', 0.0, ID, 2.30, 2.30 + TD, PISO, FORRO, [(1.95, 2.70, PISO, PISO + 2.05)])   # quarto | banheiro e hall
    c.iparede('house_white', 'u', 2.38, 3.80, 1.75, 1.75 + TD, PISO, FORRO, [(2.72, 3.32, PISO, PISO + 2.05)])  # frente do banheiro
    I('house_white', 3.80, 3.80 + TD, 0.0, 1.83, PISO, FORRO, col=True)                                   # banheiro | sala
    for a0, a1 in ((2.30, 2.38),):
        I('aluminio_preto', a0 - 0.01, a1 + 0.01, 1.95, 2.70, PISO + 2.05, PISO + 2.07)
    I('aluminio_preto', 2.72, 3.32, 1.74, 1.84, PISO + 2.05, PISO + 2.07)

    # ============================================================ quarto (iu 0–2,30): cama de casal, guarda-roupa
    cu0, cu1 = 0.40, 1.78
    I('tecido_grafite', cu0 - 0.04, cu1 + 0.04, 0.0, 0.08, PISO + 0.30, PISO + 1.10)                  # cabeceira estofada
    I('laca_grafite', cu0 + 0.05, cu1 - 0.05, 0.10, 1.90, PISO, PISO + 0.28)
    I('tecido_branco', cu0 + 0.02, cu1 - 0.02, 0.08, 1.96, PISO + 0.28, PISO + 0.50)
    I(tecido, cu0, cu1, 0.75, 1.98, PISO + 0.44, PISO + 0.54)
    I('tecido_terra', cu0 - 0.01, cu1 + 0.01, 1.52, 1.80, PISO + 0.49, PISO + 0.555)
    for a in (cu0 + 0.36, cu1 - 0.36):
        c.elip('tecido_branco', c.ip(a, 0.30, PISO + 0.58), (0.30, 0.15, 0.08), seg=12, rings=6)
    c.caixa_g('cushion', c.ip((cu0 + cu1) / 2, 0.46, PISO + 0.62), (0.40, 0.12, 0.26), 0.0)
    c.icol(cu0 - 0.04, cu1 + 0.04, 0.0, 1.98, PISO, PISO + 0.56)
    I('madeira_clara', 0.0, 0.34, 0.03, 0.40, PISO + 0.40, PISO + 0.56, col=True)                     # criado-mudo suspenso
    c.tubo('aluminio_preto', [c.ip(0.17, 0.22, FORRO), c.ip(0.17, 0.22, PISO + 1.15)], 0.004, seg=3)
    c.elip('bulb', c.ip(0.17, 0.22, PISO + 1.08), (0.07, 0.07, 0.07), seg=10, rings=6)
    c.luz(nome, 0.17, 0.22, PISO + 1.0, LUZ_LED, 0.3, 2.5, 0, 'quarto')
    c.elip('louca', c.ip(0.20, 0.30, PISO + 0.61), (0.05, 0.05, 0.05), seg=8, rings=5)
    I('laca_grafite', 1.84, 2.30, 0.0, 0.58, PISO, PISO + 2.20, col=True)                             # guarda-roupa
    I('aluminio_preto', 1.84, 1.86, 0.58, 0.60, PISO + 0.10, PISO + 2.10)
    I('white', 0.55, 1.45, 0.0, 0.22, PISO + 1.82, PISO + 2.10)                                       # ar-condicionado
    I('aluminio_preto', 0.59, 1.41, 0.215, 0.22, PISO + 1.84, PISO + 1.87)
    I('tapete', 0.10, 2.22, 2.02, 2.66, PISO, PISO + 0.008)
    c.elip('bulb', c.ip(1.10, 1.30, FORRO - 0.004), (0.06, 0.06, 0.006), seg=12, rings=3)
    c.luz(nome, 1.10, 1.30, FORRO - 0.12, LUZ_QUENTE, 0.7, 4.0, 0, 'quarto')

    # ============================================================ banheiro (iu 2,38–3,80 x id 0–1,75)
    I('porcelanato', 2.38, 3.80, 0.0, 1.75, PISO, PISO + 0.005)
    I('porcelanato', 2.38, 3.80, 0.0, 0.006, PISO, FORRO)
    I('porcelanato', 2.38, 2.386, 0.0, 1.75, PISO, FORRO)
    I('porcelanato', 3.794, 3.80, 0.0, 1.75, PISO, FORRO)
    I('porcelanato', 2.38, 2.72, 1.744, 1.75, PISO, FORRO)
    I('porcelanato', 3.32, 3.80, 1.744, 1.75, PISO, FORRO)
    # box no fundo (1,42 x 0,85): vidro fixo de um lado, chuveiro de teto, ralo linear, nicho
    I('vidro', 2.386, 3.05, 0.844, 0.856, PISO + 0.01, PISO + 2.0)
    I('aluminio_preto', 2.386, 3.05, 0.84, 0.86, PISO + 2.0, PISO + 2.02)
    I('aluminio_preto', 3.03, 3.05, 0.84, 0.86, PISO, PISO + 2.0)
    c.icol(2.38, 3.06, 0.83, 0.87, PISO, PISO + 2.02)
    I('aluminio_preto', 2.95, 3.25, 0.28, 0.58, FORRO - 0.02, FORRO)
    I('aluminio_preto', 2.45, 3.74, 0.78, 0.82, PISO + 0.005, PISO + 0.008)
    I('aluminio_preto', 3.05, 3.15, 0.006, 0.02, PISO + 0.95, PISO + 1.05)
    I('laca_grafite', 2.50, 2.90, 0.006, 0.012, PISO + 1.20, PISO + 1.50)
    I('porcelanato', 2.50, 2.90, 0.006, 0.10, PISO + 1.20, PISO + 1.22)
    # bacia suspensa na parede da sala
    I('louca', 3.62, 3.794, 1.04, 1.36, PISO + 0.24, PISO + 0.40)
    c.elip('louca', c.ip(3.47, 1.20, PISO + 0.34), (0.19, 0.17, 0.07), seg=14, rings=6)
    c.elip('white', c.ip(3.46, 1.20, PISO + 0.405), (0.18, 0.17, 0.012), seg=14, rings=4)
    I('aluminio_preto', 3.786, 3.794, 1.11, 1.29, PISO + 0.95, PISO + 1.07)
    c.icol(3.27, 3.80, 1.02, 1.38, PISO, PISO + 0.42)
    # bancada estreita suspensa na parede do quarto, cuba de apoio, espelho redondo com LED
    I('madeira_clara', 2.386, 2.73, 0.95, 1.50, PISO + 0.70, PISO + 0.74)
    I('laca_grafite', 2.386, 2.71, 0.97, 1.48, PISO + 0.48, PISO + 0.70)
    c.icol(2.38, 2.73, 0.93, 1.52, PISO + 0.48, PISO + 0.74)
    c.cil('louca', c.ip(2.56, 1.225, PISO + 0.74), 0.14, 0.11, seg=18, r_top=0.16)
    c.cil('granite', c.ip(2.56, 1.225, PISO + 0.85), 0.15, 0.003, seg=18)
    c.tubo('aluminio_preto', [c.ip(2.386, 1.225, PISO + 0.98), c.ip(2.53, 1.225, PISO + 0.98), c.ip(2.56, 1.225, PISO + 0.95)], 0.011, seg=6)
    c.disco_v('bulb', c.ip(2.390, 1.225, PISO + 1.48), 0.26, 'u', esp=0.004)
    c.disco_v('espelho', c.ip(2.398, 1.225, PISO + 1.48), 0.24, 'u', esp=0.008)
    c.tubo('aluminio_preto', [c.ip(3.40, 1.744, PISO + 1.0), c.ip(3.74, 1.744, PISO + 1.0)], 0.009, seg=5)      # toalheiro
    c.caixa_g('tecido_branco', c.ip(3.57, 1.725, PISO + 0.86), (0.28, 0.03, 0.30))
    I('aluminio_preto', 3.30, 3.50, 1.30, 1.50, FORRO - 0.01, FORRO)                                  # exaustor
    c.elip('bulb', c.ip(3.10, 1.20, FORRO - 0.004), (0.05, 0.05, 0.006), seg=10, rings=3)
    c.luz(nome, 3.10, 1.20, FORRO - 0.12, LUZ_QUENTE, 0.5, 3.0, 0, 'banheiro')
    # porta de correr embutida (só o batente e a borda da folha aparecem)
    for a0, a1 in ((2.72, 2.735), (3.305, 3.32)):
        I('aluminio_preto', a0, a1, 1.75, 1.83, PISO, PISO + 2.05)
    I('madeira_clara', 2.735, 2.775, 1.775, 1.805, PISO + 0.01, PISO + 2.03)

    # ============================================================ hall da entrada
    I('wood_x', 3.30, 3.76, 1.83, 1.855, PISO + 1.25, PISO + 1.80)                                    # quadro
    I('quadro', 3.33, 3.73, 1.855, 1.86, PISO + 1.28, PISO + 1.77)
    c.elip('bulb', c.ip(3.10, 2.30, FORRO - 0.004), (0.05, 0.05, 0.006), seg=10, rings=3)
    c.luz(nome, 3.10, 2.30, FORRO - 0.12, LUZ_QUENTE, 0.45, 3.0, 0, 'hall')

    # ============================================================ sala e cozinha (iu 3,88–6,76)
    # painel ripado de cumaru com a TV na parede do fundo e rack suspenso
    for k in range(17):
        a = 4.25 + k * 0.092
        I('wood_z', a, a + 0.055, 0.0, 0.025, PISO + 0.25, PISO + 1.85)
    I('aluminio_preto', 4.25, 5.82, 0.0, 0.012, PISO + 0.25, PISO + 1.85)
    I('tela_tv', 4.48, 5.59, 0.025, 0.06, PISO + 0.92, PISO + 1.55)
    I('aluminio_preto', 4.48, 5.59, 0.06, 0.062, PISO + 0.92, PISO + 0.935)
    I('laca_grafite', 4.30, 5.78, 0.0, 0.36, PISO + 0.30, PISO + 0.48, col=True)
    I('bulb', 4.33, 5.75, 0.28, 0.34, PISO + 0.295, PISO + 0.30)
    c.elip('louca', c.ip(4.55, 0.20, PISO + 0.56), (0.06, 0.06, 0.08), seg=10, rings=6)
    for k, m in enumerate(('quadro', 'cushion_teal', 'tecido_terra')):
        I(m, 5.30 + 0.035 * k, 5.33 + 0.035 * k, 0.08, 0.30, PISO + 0.48, PISO + 0.72 - 0.03 * k)
    # sofá de dois lugares sob a janela, de frente para a TV
    s0, s1, sd0 = 4.45, 5.95, 2.00
    I('aluminio_preto', s0 + 0.06, s1 - 0.06, sd0 + 0.06, ID - 0.04, PISO, PISO + 0.08)
    I('tecido_grafite', s0, s1, sd0, ID, PISO + 0.08, PISO + 0.30)
    for k in range(2):
        a = s0 + 0.10 + k * (s1 - s0 - 0.20) / 2
        I('tecido_grafite', a + 0.005, a + (s1 - s0 - 0.20) / 2 - 0.005, sd0 + 0.01, ID - 0.20, PISO + 0.30, PISO + 0.45)
        I('tecido_grafite', a + 0.005, a + (s1 - s0 - 0.20) / 2 - 0.005, ID - 0.21, ID - 0.02, PISO + 0.30, PISO + 0.78)
    for a in (s0, s1 - 0.10):
        I('tecido_grafite', a, a + 0.10, sd0, ID, PISO + 0.30, PISO + 0.60)
    c.icol(s0, s1, sd0, ID, PISO, PISO + 0.78)
    for k, (m, a) in enumerate(((tecido, 4.78), ('cushion', 5.20), ('tecido_terra', 5.62))):
        c.caixa_g(m, c.ip(a, ID - 0.30, PISO + 0.62), (0.40, 0.13, 0.38), 0.25 * (k - 1))
    # mesa de centro baixa e tapete
    I('madeira_clara', 4.80, 5.55, 1.15, 1.55, PISO + 0.26, PISO + 0.30)
    for a, b in ((4.83, 1.18), (5.49, 1.18), (4.83, 1.49), (5.49, 1.49)):
        I('aluminio_preto', a, a + 0.03, b, b + 0.03, PISO, PISO + 0.26)
    c.elip('louca', c.ip(5.05, 1.35, PISO + 0.33), (0.13, 0.13, 0.04), seg=14, rings=5, zmin=-0.2)
    I('tapete', 4.25, 5.98, 0.55, 2.10, PISO, PISO + 0.008)
    I('white', 3.88, 4.10, 0.35, 1.25, PISO + 1.82, PISO + 2.10)                                    # ar-condicionado na parede do banheiro
    I('aluminio_preto', 4.095, 4.10, 0.39, 1.21, PISO + 1.84, PISO + 1.87)
    # cozinha linear na parede da ponta da escada
    I('inox', 6.10, IU, 0.0, 0.68, PISO, PISO + 1.85, col=True)                                       # geladeira
    I('aluminio_preto', 6.095, 6.10, 0.0, 0.68, PISO + 1.15, PISO + 1.155)
    I('aluminio_preto', 6.07, 6.09, 0.52, 0.55, PISO + 0.55, PISO + 1.05)
    I('aluminio_preto', 6.07, 6.09, 0.52, 0.55, PISO + 1.25, PISO + 1.70)
    I('aluminio_preto', 6.22, IU, 0.70, 2.30, PISO, PISO + 0.12)
    I('laca_grafite', 6.16, IU, 0.70, 2.30, PISO + 0.12, PISO + 0.88, col=True)
    I('quartzo', 6.14, IU, 0.70, 2.30, PISO + 0.88, PISO + 0.92)
    I('quartzo', IU - 0.012, IU, 0.70, 2.30, PISO + 0.92, PISO + 1.50)                                # frontão
    for zc in (PISO + 0.45, PISO + 0.82):
        I('aluminio_preto', 6.158, 6.16, 0.70, 2.30, zc - 0.012, zc)
    I('inox', 6.24, 6.66, 0.92, 1.38, PISO + 0.915, PISO + 0.922)                                   # cuba
    I('aluminio_preto', 6.28, 6.62, 0.96, 1.34, PISO + 0.921, PISO + 0.924)
    c.tubo('aluminio_preto', [c.ip(6.72, 1.15, PISO + 0.92), c.ip(6.72, 1.15, PISO + 1.30), c.ip(6.68, 1.15, PISO + 1.42),
                              c.ip(6.54, 1.15, PISO + 1.44), c.ip(6.46, 1.15, PISO + 1.36)], 0.014, seg=6)
    I('tela_tv', 6.24, 6.68, 1.62, 2.18, PISO + 0.92, PISO + 0.926)                                 # cooktop de duas bocas
    for b in (1.76, 2.04):
        c.anel('granite', 6.46 + TP, b + TP, 0.07, 0.085, PISO + 0.927, seg=16)
    I('madeira_clara', 6.41, IU, 0.70, 2.30, PISO + 1.55, PISO + 2.20)                                # aéreos
    I('bulb', 6.44, 6.50, 0.72, 2.28, PISO + 1.545, PISO + 1.55)
    I('aluminio_preto', 6.408, 6.41, 0.70, 2.30, PISO + 1.55, PISO + 1.575)
    I('laca_grafite', 6.30, IU, 2.32, ID, PISO, PISO + 2.20, col=True)                                # despenseiro
    I('aluminio_preto', 6.295, 6.30, 2.36, 2.38, PISO + 0.6, PISO + 1.6)
    c.luz(nome, 6.45, 1.50, PISO + 1.45, LUZ_LED, 0.45, 3.0, 0, 'cozinha')
    for a, b in ((4.80, 0.90), (4.80, 1.90), (5.80, 1.40)):
        c.elip('bulb', c.ip(a, b, FORRO - 0.004), (0.045, 0.045, 0.006), seg=10, rings=3)
    c.luz(nome, 5.00, 1.40, FORRO - 0.12, LUZ_QUENTE, 0.9, 5.0, 0, 'sala')

    # ============================================================ fachada: janelas e porta de caixilho branco
    for jan in (jan_q, jan_s):
        c.esquadria('u', *jan, BF, folhas=2, mat_q='esquadria_branca')
        c.requadro('u', jan[0], jan[1], jan[2], jan[3], CD, -1)
    c.requadro('u', pu0, pu1, PISO, ZP, CD, -1, peitoril=False)
    # arandela preta ao lado da porta (luz para cima e para baixo)
    c.cil('aluminio_preto', (pu1 + 0.30, CD + 0.08, 1.80), 0.045, 0.30, seg=12)
    c.caixa('aluminio_preto', pu1 + 0.28, pu1 + 0.32, CD, CD + 0.05, 1.92, 1.98)
    c.elip('bulb', (pu1 + 0.30, CD + 0.08, 1.797), (0.035, 0.035, 0.005), seg=10, rings=3)
    c.elip('bulb', (pu1 + 0.30, CD + 0.08, 2.103), (0.035, 0.035, 0.005), seg=10, rings=3)
    c.luz(nome, porta[1] + 0.30, CD - TP + 0.25, 1.95, LUZ_LED, 0.4, 3.5, 0, 'entrada')
    # canteiros ao pé da fachada (escondem a fresta das sapatas)
    for lado, (ua, ub) in enumerate(((0.18, pu0 - 0.35), (pu1 + 0.50, CL - 0.18))):
        c.caixa('mulch', ua, ub, CD + 0.012, CD + 0.48, 0.0, 0.012)
        for k, a in enumerate(np.arange(ua + 0.25, ub - 0.1, 0.55)):
            q = c.p(a, CD + 0.26, 0.012)
            if k % 3 == 0:
                P.moreia(q, rv, 0.7)
            elif k % 3 == 1:
                P.xanadu(q, rv, 0.65)
            else:
                P.bromelia(q, rv, 0.85)

    # ============================================================ terraço aberto (sem cobertura)
    zg = DECK + 0.02
    c.guarda_corpo((0.05, CD - 0.05), (CL - 0.05, CD - 0.05), zg, quina)
    c.guarda_corpo((0.05, 0.05), (CL - 0.05, 0.05), zg, quina)
    c.guarda_corpo((0.05, 0.05), (0.05, CD - 0.05), zg, quina)
    c.guarda_corpo((CL - 0.05, PAT), (CL - 0.05, CD - 0.05), zg, quina)          # vão para o patamar da escada
    # mesa de cumaru com quatro cadeiras pretas (o lado da frente fica livre para passar até as espreguiçadeiras)
    tu0, tu1, td0, td1 = 2.70, 3.90, 1.30, 2.00
    c.caixa('madeira_clara', tu0, tu1, td0, td1, DECK + 0.72, DECK + 0.76)
    for a in (tu0 + 0.06, tu1 - 0.10):
        for b in (td0 + 0.06, td1 - 0.10):
            c.caixa('aluminio_preto', a, a + 0.04, b, b + 0.04, DECK, DECK + 0.72)
    c.colide(tu0, tu1, td0, td1, DECK, DECK + 0.76)
    for uu in (3.00, 3.60):
        cadeira(c, uu - TP, 1.00 - TP, math.pi / 2, z=DECK, assento='aluminio_preto')
    cadeira(c, 2.42 - TP, 1.65 - TP, 0.0, z=DECK, assento='aluminio_preto')
    cadeira(c, 4.18 - TP, 1.65 - TP, math.pi, z=DECK, assento='aluminio_preto')
    c.elip('louca', (3.20, 1.62, DECK + 0.80), (0.14, 0.14, 0.045), seg=14, rings=5, zmin=-0.3)
    for k in range(5):
        c.elip(('fruit_orange', 'fruit_lemon', 'fruit_red', 'fruit_orange', 'fruit_lemon')[k],
               (3.12 + 0.05 * (k % 3), 1.57 + 0.05 * (k // 3), DECK + 0.83), 0.035, seg=8, rings=5)
    # duas espreguiçadeiras na ponta lisa, viradas para o gramado, com mesinha
    for a0 in (0.42, 1.32):
        a1 = a0 + 0.62
        c.caixa('aluminio_preto', a0, a0 + 0.03, 0.80, 2.58, zg, zg + 0.30)
        c.caixa('aluminio_preto', a1 - 0.03, a1, 0.80, 2.58, zg, zg + 0.30)
        c.caixa('aluminio_preto', a0, a1, 2.55, 2.58, zg, zg + 0.30)
        c.caixa('cushion', a0 + 0.02, a1 - 0.02, 1.28, 2.57, zg + 0.28, zg + 0.38)
        beam('cushion', c.p((a0 + a1) / 2, 1.30, zg + 0.34), c.p((a0 + a1) / 2, 0.80, zg + 0.92), 0.58, 0.09)
        beam('aluminio_preto', c.p(a0 + 0.015, 1.30, zg + 0.30), c.p(a0 + 0.015, 0.84, zg + 0.82), 0.03, 0.03)
        beam('aluminio_preto', c.p(a1 - 0.015, 1.30, zg + 0.30), c.p(a1 - 0.015, 0.84, zg + 0.82), 0.03, 0.03)
        c.caixa_g(tecido, ((a0 + a1) / 2, 1.02, zg + 0.72), (0.12, 0.40, 0.22), 0.0)
        c.colide(a0, a1, 0.72, 2.58, DECK, DECK + 0.95)
    c.cil('madeira_clara', (1.18, 0.62, zg + 0.44), 0.15, 0.03, seg=18)
    c.cil('aluminio_preto', (1.18, 0.62, zg), 0.02, 0.44, seg=6)
    c.cil('aluminio_preto', (1.18, 0.62, zg), 0.11, 0.015, seg=14)
    c.colide(1.03, 1.33, 0.47, 0.77, DECK, DECK + 0.47)
    # vasos com plantas junto ao guarda-corpo (como na foto); as plantas entram depois da poda das árvores
    # grandes (senão a areca, que usa os materiais do coqueiro, seria podada junto)
    for k, (u, d) in enumerate(((0.40, 0.40), (2.15, 0.40), (5.60, 0.40), (6.52, 2.60))):
        top = P.pot(c.p(u, d, zg), 0.24, 0.52, mat='pot_fiber')
        PLANTIO_TERRACO.append((k, top))
        c.colide(u - 0.25, u + 0.25, d - 0.25, d + 0.25, DECK, DECK + 1.2)

    # fita de LED na base do guarda-corpo e duas luzes baixas (o terraço fica aberto para o céu)
    for (ua, da), (ub, db) in (((0.10, CD - 0.10), (CL - 0.10, CD - 0.10)), ((0.10, 0.10), (CL - 0.10, 0.10)), ((0.10, 0.10), (0.10, CD - 0.10)),
                               ((CL - 0.10, PAT + 0.05), (CL - 0.10, CD - 0.10))):
        if abs(ub - ua) > abs(db - da):
            c.caixa('bulb', ua, ub, da - 0.006, da + 0.006, DECK + 0.03, DECK + 0.045)
        else:
            c.caixa('bulb', ua - 0.006, ua + 0.006, da, db, DECK + 0.03, DECK + 0.045)
    c.luz(nome, 1.60 - TP, 1.60 - TP, DECK + 0.6, LUZ_LED, 0.45, 4.0, 2, 'terraco')
    c.luz(nome, 5.20 - TP, 1.60 - TP, DECK + 0.6, LUZ_LED, 0.45, 4.0, 2, 'terraco')

    # ============================================================ escada de fora: reta, sobe da frente para o fundo
    us0, us1 = CL + 0.02, CL + 0.02 + LARG                  # 7,02 a 7,82
    dpe = PAT + (NESC - 1) * PISE                           # pé da escada (3,84: avança 0,84 à frente da casa)
    for k in range(1, NESC):                                # 13 degraus; o 14º espelho chega ao patamar
        d1 = PAT + (NESC - k) * PISE
        d0 = d1 - PISE
        zt = ESPE * k
        c.caixa('deck_ipe', us0 + 0.03, us1 - 0.03, d0, d1 + 0.02, zt - 0.04, zt)
        c.piso(us0, us1, d0, d1, zt)
    # patamar no alto, encostado no muro, no nível do terraço
    c.caixa('deck_ipe', CL, us1 + 0.04, 0.0, PAT, DECK - 0.05, DECK)
    c.caixa('aluminio_preto', CL, us1 + 0.04, 0.0, PAT, DECK - 0.17, DECK - 0.05)
    c.piso(CL, us1 + 0.04, 0.0, PAT, DECK)
    # longarinas de aço preto e pilares do patamar
    for u in (us0 + 0.02, us1 - 0.02):
        c.viga('aluminio_preto', (u, dpe + 0.05, 0.02), (u, PAT, DECK - 0.15), 0.04, 0.24)
    c.caixa('aluminio_preto', us1 - 0.04, us1 + 0.04, 0.0, 0.08, 0.0, DECK - 0.17)
    c.colide(us1 - 0.05, us1 + 0.05, 0.0, 0.09, 0.0, DECK - 0.17)
    c.caixa('aluminio_preto', us1 - 0.04, us1 + 0.04, PAT - 0.08, PAT, 0.0, DECK - 0.17)
    c.caixa('concrete', us0, us1, dpe - 0.05, dpe + 0.25, 0.0, 0.02)
    # guarda-corpo do lado de fora (montantes pretos e corrimão na cor das quinas)
    for k in range(1, NESC):
        d1 = PAT + (NESC - k) * PISE
        c.tubo('aluminio_preto', [(us1 - 0.02, d1 - PISE / 2, ESPE * k), (us1 - 0.02, d1 - PISE / 2, ESPE * k + 0.90)], 0.011, seg=5)
    c.viga(quina, (us1 - 0.02, dpe, 0.90 + ESPE), (us1 - 0.02, PAT, DECK + 0.90), 0.05, 0.04)
    c.colide(us1 - 0.04, us1 + 0.04, PAT, dpe, 0.0, DECK + 1.0)
    c.guarda_corpo((us1 + 0.0, PAT), (us1 + 0.0, 0.05), zg, quina)
    c.guarda_corpo((us1 + 0.0, 0.05), (CL, 0.05), zg, quina)
    xs_ = c.fx(CL, us1 + 0.05); ys_ = c.fy(0.0, dpe)
    EXTRA['escadas'].append({'casa': nome, 'x': [round(xs_[0], 3), round(xs_[1], 3)], 'y': [round(ys_[0], 3), round(ys_[1], 3)]})

    # ============================================================ dados para o passeio
    ah = porta[1] - 0.01 + TP                              # dobradiça do lado da sala
    EXTRA['portas'].append({'casa': nome, 'cor': 'esquadria_branca', 'estilo': 'vidro',
                            'dobradica': [round(v, 3) for v in c.p(ah, CD - 0.06, PISO)],
                            'fechada': [1.0 if c.X(pu0) > c.X(ah) else -1.0, 0.0],
                            'para_dentro': [0.0, -float(sg)], 'largura': round(porta[1] - porta[0] - 0.02, 3), 'altura': round(ZP - PISO - 0.01, 3)})
    ex, ey = c.p(*c.ip(3.15, 2.25, 0))[:2]
    bx, by = c.p(*c.ip(5.0, 1.0, 0))[:2]
    EXTRA['lugares'].append([nome, round(ex, 3), round(ey, 3), round(math.atan2(by - ey, bx - ex), 4), PISO])
    mx, my = c.p(5.30, 1.50, 0)[:2]
    EXTRA['lugares'].append(['Terraço da ' + nome.lower(), round(mx, 3), round(my, 3), round(c.ang(math.pi / 2), 4), DECK])
    EXTRA['casas'].append({'nome': nome, 'x': [round(c.x0, 3), round(c.x1, 3)], 'y': [round(v, 3) for v in c.fy(0.0, CD)],
                           'piso': PISO, 'teto': FORRO, 'deck': DECK, 'frente': round(c.Y(CD), 3),
                           'volume': [round(v, 3) for v in c.fx(0.0, us1 + 0.05)] + [round(v, 3) for v in c.fy(0.0, CD)] + [round(DECK + 2.2, 3)]})   # poda deixa 2,5 m livres sobre o terraço
    EXTRA['paredes_projecao'].append({'nome': 'Parede da ' + nome.lower(), 'x0': round(c.X(0.0), 3), 'x1': round(c.X(0.0), 3),
                                      'y0': round(c.fy(0.0, CD)[0], 3), 'y1': round(c.fy(0.0, CD)[1], 3), 'z0': Z0C, 'z1': ZTC,
                                      'normal': [float(-c.su), 0.0]})
    return c


CASAS = [container(4.5, 0, True, 'Casa azul', 'chapa_azul', 'pintura_amarela', 'tecido_azul'),          # escada a oeste, ponta lisa para a pracinha
         container(16.5, 0, False, 'Casa amarela', 'chapa_amarela', 'pintura_marinho', 'tecido_amarelo'),
         container(8.5, 1, False, 'Casa verde', 'chapa_verde', 'pintura_amarela', 'tecido_verde')]
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

# ------------------------------------------------------------------ poda: o que das árvores grandes encostaria nas casas
# (folhas e galhos dentro de cada casa, até 2,5 m acima do terraço, e da escada saem, como numa poda de verdade)
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


podar(PODA_MATS, [], [(t[0] - 0.05, t[1] + 0.05, t[2] - 0.05, t[3] + 0.05, -0.1, t[4] + 0.3) for t in (cs['volume'] for cs in EXTRA['casas'])]
      + [(e['x'][0] - 0.1, e['x'][1] + 0.1, e['y'][0] - 0.1, e['y'][1] + 0.1, -0.1, GUARDA + 0.3) for e in EXTRA['escadas']])
podar(('leaf_vine',), [], [(cs['x'][0] + TP, cs['x'][1] - TP, cs['y'][0] + TP, cs['y'][1] - TP, 0.0, FORRO) for cs in EXTRA['casas']])
for k, top in PLANTIO_TERRACO:                                  # plantas dos vasos do terraço, já depois da poda
    if k in (0, 3):
        P.areca(top, rv, H=1.6, stems=5)
    elif k == 1:
        P.moreia(top, rv, 0.9); P.bromelia(top, rv, 0.8)
    else:
        P.xanadu(top, rv, 0.9)

# ------------------------------------------------------------------ quintal de baixo para o passeio
# deck, escada, lago, poço e amendoeira saem do obra.py: o passeio lê daqui (terreno.json) em vez de ter as medidas no código
_Gx = np.arange(LAGO[:, 0].min() - 0.05, LAGO[:, 0].max() + 0.05, 0.1)
_Gy = np.arange(LAGO[:, 1].min() - 0.05, LAGO[:, 1].max() + 0.05, 0.1)
_CX, _CY = np.meshgrid(_Gx + 0.05, _Gy + 0.05, indexing='ij')
_nado = dentro_lago(_CX, _CY) & (prof_lago(_CX, _CY) >= 0.55)          # onde as carpas nadam (fundo de 55 cm ou mais)
_cont = [LAGO[0]]
for _p in LAGO[1:]:
    if np.hypot(*(_p - _cont[-1])) >= 0.18:
        _cont.append(_p)
_ilx = np.nonzero(_nado.any(axis=1))[0]
EXTRA['quintal'] = {
    'deck': [round(DX0, 3), round(DX1, 3), round(DY0, 3), round(DY1, 3), 0.0],
    'escada': {'x0': round(FACE, 3), 'piso': obra.ESCADA_PISO, 'n': obra.ESCADA_N, 'y': [obra.ESCADA_Y0, obra.ESCADA_Y1],
               'espelho': round(-LOW / (obra.ESCADA_N + 1), 4)},
    'lago': {'nivel': round(ZAGUA, 3), 'ret': [round(float(v), 3) for v in (LAGO[:, 0].min(), LAGO[:, 0].max(), LAGO[:, 1].min(), LAGO[:, 1].max())],
             'contorno': [[round(float(a), 3), round(float(b), 3)] for a, b in _cont],
             'centro': [round(float(v), 3) for v in (_CX[_nado].mean(), _CY[_nado].mean())],
             'nado': {'x0': round(float(_Gx[0]), 3), 'y0': round(float(_Gy[0]), 3), 'passo': 0.1, 'nx': len(_Gx), 'ny': len(_Gy),
                      'bits': ''.join('1' if v else '0' for v in _nado.ravel())}},
}
EXTRA['quintal']['lugares'] = {'Deck': [round(DX0 + 0.45, 2), round((DY0 + DY1) / 2, 2), 0.0],
                                'Lago': [round(float(LAGO[:, 0].max()) + 0.55, 2), round(float(obra.C_LAGO[1]), 2), round(math.pi, 4)]}
EXTRA.setdefault('circulos', [])
EXTRA['circulos'] += [[obra.ARVORE[0], obra.ARVORE[1], 0.45, LOW, 4.0], [obra.POCO[0], obra.POCO[1], obra.POCO_R + 0.03, LOW, 0.2]]
for _a, _b in GUARDA_BEIRA:                                   # guarda-corpo da beira da laje
    colisor(EDGE - 0.1, EDGE + 0.02, _a, _b, 0.0, 1.1)
colisor(DX0, DX1, DY0 - 0.04, DY0 + 0.06, 0.0, 1.1)             # guarda-corpo do deck (três lados)
colisor(DX1 - 0.08, DX1 + 0.02, DY0, DY1, 0.0, 1.1)
colisor(DX0, DX1, DY1 - 0.06, DY1 + 0.04, 0.0, 1.1)
for _px, _py in PILARES:                                        # pilares do deck, embaixo
    colisor(VX0, VX1, _py - 0.06, _py + 0.06, LOW, ZV0)
colisor(VX0, VX1, DY0, DY1, ZV0, ZV1)                           # viga externa (bate a cabeça embaixo do deck)

objs = geo.build_objects()
print('objects', len(objs), 'polys', sum(len(o.data.polygons) for o in objs))
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'chacara.blend'))
