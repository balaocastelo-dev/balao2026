"""Fotos do banheiro duplo externo do quintal de baixo (modelo 2, perto do poço, com o estacionamento ao lado).

    python render_banheiro.py PASTA [--res 1400] [--samples 32] [--vistas frente,portao,laje,nicho,planta]

Desde 10/11/2026 o banheiro está no build.py (medidas no banheiro.py): aqui só se tiram as árvores do fundo (e, na
planta, o telhado dos banheiros e a copa da amendoeira, para aparecer o que fica embaixo) e se renderiza. Grava
PASTA/<vista>.jpg e PASTA/<vista>_pontos.json (onde caem na foto as partes), que o legenda_banheiro.py usa.
"""
import os, sys, math, json, argparse, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import numpy as np
import bpy
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

ap = argparse.ArgumentParser()
ap.add_argument('saida'); ap.add_argument('--res', type=int, default=1400); ap.add_argument('--samples', type=int, default=32)
ap.add_argument('--vistas', default='frente,portao,laje,nicho,planta')
args = ap.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:])
os.makedirs(args.saida, exist_ok=True)

src = open(os.path.join(HERE, 'build.py'), encoding='utf-8').read()
cut = src.index("objs = geo.build_objects()")
ns = {'__file__': os.path.join(HERE, 'build.py'), '__name__': 'banheiro'}
exec(compile(src[:cut], 'build.py', 'exec'), ns)
geo = ns['geo']; O = ns['obra']
LOW, EDGE, WH = ns['LOW'], ns['EDGE'], ns['WH']

def recortar(manter, tirar, tirar_mats=()):
    """Tira as faces fora da caixa `manter` ou dentro de alguma caixa de `tirar` (x0, x1, y0, y1, z0, z1[, materiais])."""
    for store in (geo.G, geo.GS):
        for mat in list(store.keys()):
            g = store[mat]
            if g.n == 0:
                continue
            if mat in tirar_mats:
                for k in list(g.f):
                    g.f[k] = [fa[:0] for fa in g.f[k]]
                continue
            V = np.concatenate(g.v)
            x, y, z = V[:, 0], V[:, 1], V[:, 2]
            m = manter
            fora = ~((x > m[0]) & (x < m[1]) & (y > m[2]) & (y < m[3]) & (z > m[4]) & (z < m[5]))
            for b in tirar:
                if len(b) > 6 and mat not in b[6]:
                    continue
                fora |= (x > b[0]) & (x < b[1]) & (y > b[2]) & (y < b[3]) & (z > b[4]) & (z < b[5])
            for k in list(g.f):
                g.f[k] = [fa[~fora[fa].any(axis=1)] for fa in g.f[k]]


import banheiro as B
planta_so = set(args.vistas.split(',')) <= {'planta'}
TIRAR = []
if planta_so:                                          # na planta: sem o telhado dos banheiros e da vaga, sem a copa
    TIRAR.append((B.T_X0 - 0.1, B.T_X1 + 0.1, B.T_YF - 0.2, B.YB1 + 0.05, LOW + B.PD + 0.005, 6.0,
                  ('rooftile', 'wood_x', 'wood_y', 'metal_dark', 'forro', 'brick')))
    TIRAR.append((44.0, 52.0, -0.3, 6.5, 1.25, 12.0, ('bark_dark',)))           # fica só o tronco da amendoeira
COPA = ('leaf_amend', 'leaf_amend_red', 'leaf_core_big')
ARVORES = ('leaf_mango', 'leaf_core', 'leaf_bg', 'leaf_palm', 'leaf_palm_base', 'leaf_palm_rachis', 'leaf_areca', 'leaf_citrus',
           'leaf_goiaba', 'leaf_jabu', 'bark_palm', 'bark_jabu', 'bark_goiaba', 'fruit_mango',
           'fruit_goiaba', 'fruit_black', 'fruit_lemon', 'fruit_red', 'coconut')
FUNDO = ('terrain', 'street', 'wall_sand', 'wall_moss', 'wall_out')        # refeitos simples logo abaixo
TIRAR.append((0.0, 45.6, -1.0, 11.0, -3.0, 20.0, ARVORES))                  # as árvores do gramado (a pitangueira fica)
recortar((24.0, 60.5, -0.3, 10.3, -3.0, 12.0), TIRAR, tirar_mats=FUNDO + (COPA if planta_so else ()))
if planta_so:
    _h = (1.25 - LOW) / 3.4
    geo.disc('bark_dark', (O.ARVORE[0] + 0.35 * _h, O.ARVORE[1] - 0.12 * _h), 0.235, 1.24, seg=20)
geo.box('wall_sand', 60.0, 60.15, -0.15, 10.15, LOW - 0.04, LOW + WH)        # muro do fundo
geo.box('terrain', 0.0, 90.0, -40.0, 40.0, LOW - 0.6, LOW - 0.55)
for y0_, y1_ in ((-0.15, 0.0), (10.0, 10.15)):                              # muros laterais do terreno
    geo.box('wall_sand', 24.0, EDGE, y0_, y1_, -0.04, WH)
    geo.box('wall_sand', EDGE, 60.15, y0_, y1_, LOW - 0.04, LOW + WH)

objs = geo.build_objects()
scene = bpy.context.scene

# ---- Cycles, céu e sol (como o render_deck.py)
scene.render.engine = 'CYCLES'
c = scene.cycles
c.device = 'CPU'; c.samples = args.samples; c.use_adaptive_sampling = True; c.adaptive_threshold = 0.02
c.use_denoising = True
c.max_bounces = 6; c.diffuse_bounces = 3; c.glossy_bounces = 3; c.transmission_bounces = 6; c.transparent_max_bounces = 12
scene.render.image_settings.file_format = 'JPEG'; scene.render.image_settings.quality = 93
scene.view_settings.view_transform = 'AgX'
try:
    scene.view_settings.look = 'AgX - Medium High Contrast'
except Exception:
    pass
w = bpy.data.worlds.new('W'); scene.world = w
try:
    w.use_nodes = True
except Exception:
    pass
nt = w.node_tree; nt.nodes.clear()
out = nt.nodes.new('ShaderNodeOutputWorld'); bg = nt.nodes.new('ShaderNodeBackground'); sky = nt.nodes.new('ShaderNodeTexSky')
for t in ('MULTIPLE_SCATTERING', 'NISHITA', 'SINGLE_SCATTERING'):
    if t in [e.identifier for e in sky.bl_rna.properties['sky_type'].enum_items]:
        sky.sky_type = t; break
if hasattr(sky, 'sun_disc'):
    sky.sun_disc = False
nt.links.new(sky.outputs[0], bg.inputs[0]); bg.inputs[1].default_value = 0.28
nt.links.new(bg.outputs[0], out.inputs[0])
sun = bpy.data.lights.new('Sol', 'SUN'); sun.energy = 4.2; sun.angle = math.radians(1.5); sun.color = (1.0, 0.95, 0.86)
so = bpy.data.objects.new('Sol', sun); scene.collection.objects.link(so)
cam = bpy.data.cameras.new('Cam'); co = bpy.data.objects.new('Cam', cam); scene.collection.objects.link(co)
cam.sensor_width = 36; cam.clip_start = 0.05; cam.clip_end = 400
scene.camera = co

PX0, PX1, PY0, PY1 = 45.5, 60.4, -0.25, 10.45          # recorte da planta (o quintal de baixo inteiro)
XM = (B.XN0 + B.XN1) / 2
VISTAS = {
    # nome: (câmera, alvo, lente, azimute do sol, elevação do sol, exposição)
    'planta': (((PX0 + PX1) / 2, (PY0 + PY1) / 2, 14.0), ((PX0 + PX1) / 2, (PY0 + PY1) / 2 + 0.0001, -1.0), 0, 215, 62, 0.15),
    'frente': ((XM, 4.35, LOW + 1.6), (XM, 9.6, LOW + 1.4), 14, 215, 52, 0.1),
    'portao': ((59.5, 4.1, LOW + 1.7), (52.6, 8.7, LOW + 1.25), 16, 215, 52, 0.1),
    'laje': ((44.4, 3.0, 1.75), (52.2, 8.6, -0.3), 21, 215, 55, 0.05),
    'nicho': ((XM, 5.5, LOW + 1.55), (XM, 9.7, LOW + 1.05), 20, 215, 52, 0.1),
}
# pontos que o legenda_banheiro.py usa
PONTOS = {
    'banheiro1': [((B.XA0 + B.XA1) / 2, B.YB0 - 0.02, LOW + 1.3)],
    'banheiro2': [((B.XC0 + B.XC1) / 2, B.YB0 - 0.02, LOW + 1.3)],
    'pia': [(B.CUBAS[0][0], B.CUBAS[0][1], B.BANC_Z + 0.1)],
    'vaga': [((B.XB1 + B.T_X1) / 2, (B.T_YF + B.T_YT) / 2 - 0.3, LOW + 0.05)],
    'poco': [(O.POCO[0], O.POCO[1], LOW + 0.7)],
    'escada': [(O.ESCADA_X0 + O.ESCADA_N * O.ESCADA_PISO * 0.55, (O.ESCADA_Y0 + O.ESCADA_Y1) / 2, LOW * 0.45)],
    'portao': [(59.95, 5.2, LOW + 1.2)],
    'cinema': [(55.2, 2.0, LOW + 1.0)],
}
R = B.resumo()
MEDIDAS = {'local': 'barracao', 'largura': B.LARG, 'fundo': B.FUNDO, 'banheiro': [B.CAB, B.LIVRE], 'nicho': B.NICHO,
           'pe_direito': B.PD, 'da_beira': R['da_beira'], 'ate_poco': B.ATE_POCO, 'vaga': B.VAGA, 'telhado': R['telhado'],
           'modelo': 2, 'modelo_nome': B.MODELOS[2]['nome']}


def mirar(v):
    loc, tgt, lens, az, el, ex = v
    co.location = loc
    co.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    if lens == 0:
        cam.type = 'ORTHO'; cam.ortho_scale = max(PX1 - PX0, PY1 - PY0); co.rotation_euler = (0, 0, 0)
    else:
        cam.type = 'PERSP'; cam.lens = lens
    a, e = math.radians(az), math.radians(el)
    s = Vector((math.cos(e) * math.cos(a), math.cos(e) * math.sin(a), math.sin(e)))
    so.rotation_euler = (-s).to_track_quat('-Z', 'Y').to_euler()
    if hasattr(sky, 'sun_elevation'):
        sky.sun_elevation = e
    if hasattr(sky, 'sun_rotation'):
        sky.sun_rotation = math.radians(90) - a
    scene.view_settings.exposure = ex


for nome in args.vistas.split(','):
    t0 = time.time()
    if nome == 'planta':
        scene.render.resolution_y = args.res; scene.render.resolution_x = int(args.res * (PX1 - PX0) / (PY1 - PY0))
    else:
        scene.render.resolution_x = args.res; scene.render.resolution_y = int(args.res * 2 / 3)
    scene.render.resolution_percentage = 100
    mirar(VISTAS[nome])
    scene.render.filepath = os.path.join(args.saida, nome + '.jpg')
    bpy.ops.render.render(write_still=True)
    bpy.context.view_layer.update()
    pts = {}
    for k, lst in PONTOS.items():
        pts[k] = []
        for p in lst:
            q = world_to_camera_view(scene, co, Vector(p))
            pts[k].append([q.x, 1 - q.y, q.z])
    json.dump({'pontos': pts, 'medidas': MEDIDAS, 'vista': nome}, open(os.path.join(args.saida, nome + '_pontos.json'), 'w'),
              ensure_ascii=False, indent=1)
    print('FOTO', nome, round(time.time() - t0, 1), 's', flush=True)
