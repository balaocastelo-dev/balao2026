"""Fotos do projeto do deck e do laguinho para a obra (Cycles, só a área do deck).

    python render_deck.py PASTA [--res 1600] [--samples 48] [--vistas quintal,piscina,estrutura]

Roda o build.py inteiro, recorta só a área do deck (tira a casa na árvore, a amendoeira, a churrasqueira e o
poço, que tampariam a vista) e renderiza as vistas. Na vista "estrutura" saem metade das tábuas e a água, para
aparecer o que fica embaixo, e as peças ganham números (a legenda vai em PASTA/estrutura_pontos.json).
"""
import os, sys, math, json, argparse, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import numpy as np
import bpy
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

ap = argparse.ArgumentParser()
ap.add_argument('saida'); ap.add_argument('--res', type=int, default=1600); ap.add_argument('--samples', type=int, default=48)
ap.add_argument('--vistas', default='quintal,piscina,estrutura')
args = ap.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:])
os.makedirs(args.saida, exist_ok=True)

src = open(os.path.join(HERE, 'build.py'), encoding='utf-8').read()
cut = src.index("objs = geo.build_objects()")
ns = {'__file__': os.path.join(HERE, 'build.py'), '__name__': 'deck'}
exec(compile(src[:cut], 'build.py', 'exec'), ns)
geo = ns['geo']
LOW, EDGE = ns['LOW'], ns['EDGE']


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


TIRAR = [(46.3, 50.8, -0.3, 2.66, LOW + 0.006, 9.0),   # amendoeira, casa na árvore e balanço (a grama e o chão ficam)
         (50.3, 60.5, -0.3, 10.3, LOW + 0.006, 9.0),     # poço, garagem, pergolado e cinema
         (30.0, 44.45, -0.3, 10.3, -3.0, 0.05),        # piscina
         (40.0, 45.85, -0.3, 10.3, -0.035, 9.0),        # churrasqueira, chuveirão e vasos acima do piso
        ]
estrutura = 'estrutura' in args.vistas.split(',') and len(args.vistas.split(',')) == 1
if estrutura:
    # metade das tábuas sai (as que ficam do lado de fora), a água e os peixes também
    TIRAR.append((46.95, 48.1, 3.15, 6.25, -0.03, 0.01, ('wood_y',)))
    TIRAR.append((44.0, 52.0, -1.0, 11.0, -3.0, 9.0, ('ninfeia', 'flor_ninfeia')))
ARVORES = ('leaf_amend', 'leaf_amend_red', 'leaf_mango', 'leaf_core', 'leaf_core_big', 'leaf_bg', 'leaf_palm', 'leaf_palm_base',
           'leaf_palm_rachis', 'leaf_areca', 'leaf_citrus', 'leaf_goiaba', 'leaf_jabu', 'leaf_vine', 'leaf_vine_light', 'bark_dark',
           'bark_palm', 'bark_jabu', 'bark_goiaba', 'fruit_mango', 'fruit_goiaba', 'fruit_black', 'fruit_lemon', 'fruit_red',
           'coconut', 'rope', 'caco', 'terrain', 'street', 'wall_sand', 'wall_moss', 'wall_out', 'wall_white')
recortar((43.6, 60.5, -0.3, 10.3, -3.0, 9.0), TIRAR,
         tirar_mats=ARVORES + (('water_pond', 'veu_agua', 'koi_o', 'koi_w', 'koi_k', 'leaf_purple', 'stem_purple') if estrutura else ()))
# chão de novo, só na área (o recorte tira as peças grandes que passam da caixa)
geo.box('caco', 43.6, EDGE, -0.3, 10.3, -0.04, 0.0)                         # piso da piscina (nível 0,00)
geo.box('pedrisco', EDGE, 60.0, -0.3, 2.70, LOW - 0.04, LOW - 0.004)         # quintal de baixo onde o recorte tirou o chão
geo.box('pedrisco', 50.30, 60.0, 2.70, 10.3, LOW - 0.04, LOW - 0.004)
geo.box('wall_sand', 60.0, 60.15, -0.15, 10.15, LOW - 0.04, LOW + ns['WH'])     # muro do fundo (sem o portão)
geo.box('terrain', 20.0, 80.0, -40.0, 40.0, LOW - 0.6, LOW - 0.55)           # fundo neutro bem abaixo
for y0_, y1_ in ((-0.15, 0.0), (10.0, 10.15)):                                # muros laterais do terreno
    geo.box('wall_sand', 43.6, EDGE, y0_, y1_, -0.04, ns['WH'])
    geo.box('wall_sand', EDGE, 60.15, y0_, y1_, LOW - 0.04, LOW + ns['WH'])
objs = geo.build_objects()
scene = bpy.context.scene

# ---- Cycles, céu e sol (como o render.py)
scene.render.engine = 'CYCLES'
c = scene.cycles
c.device = 'CPU'; c.samples = args.samples; c.use_adaptive_sampling = True; c.adaptive_threshold = 0.02
c.use_denoising = True
c.max_bounces = 6; c.diffuse_bounces = 3; c.glossy_bounces = 3; c.transmission_bounces = 6; c.transparent_max_bounces = 10
scene.render.threads_mode = 'AUTO'
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

VISTAS = {
    # nome: (câmera, alvo, lente, azimute do sol, elevação do sol, exposição)
    'quintal': ((51.3, 8.8, LOW + 1.65), (47.6, 4.9, -0.75), 22, 215, 48, 0.1),
    'piscina': ((45.55, 9.2, 1.7), (48.4, 4.7, -1.0), 20, 215, 52, 0.05),
    'estrutura': ((51.6, 1.1, LOW + 2.25), (47.9, 4.9, -0.85), 20, 215, 55, 0.25),
    'planta': ((48.2, 5.0, 12.0), (48.2, 5.0001, -1.0), 0, 215, 62, 0.15),
}
# pontos numerados da vista da estrutura (centro de cada peça)
B = ns
PONTOS = [
    (1, 'Tábuas de cumaru 10 x 2,5 cm (19 peças de 3,00 m, junta de 5 mm)', (46.5, 3.9, 0.0)),
    (2, 'Barrotes de cumaru 6 x 16 cm, 7 peças a cada 49 cm', (47.45, B['BARROTES'][1], B['ZB0'] - 0.08)),
    (3, 'Viga externa de cumaru 12 x 20 cm, 3,00 m', (B['VX0'] + 0.06, 4.7, (B['ZV0'] + B['ZV1']) / 2)),
    (4, 'Pilar de cumaru 12 x 12 cm com sapata de concreto (fora da água)', (B['VX0'] + 0.06, B['DY0'] + 0.06, -0.75)),
    (5, 'Viga de apoio 6 x 12 cm chumbada no muro de arrimo', (B['DX0'] + 0.14, 4.4, B['ZB0'] - B['DBAR'] - 0.06)),
    (6, 'Muro de arrimo existente (desnível de 1,00 m)', (EDGE + 0.04, 2.95, -0.45)),
    (7, 'Cascata de lajes de pedra (3 quedas) com pedras empilhadas', (EDGE + 0.45, 6.8, -0.42)),
    (8, 'Borda de pedras arredondadas, meio enterradas', (49.95, 5.6, LOW + 0.1)),
    (9, 'Prateleira de plantas a 30 cm de fundo', (49.55, 6.15, B['ZAGUA'] - 0.30)),
    (10, 'Parte funda: 1,00 m de água para as carpas', (48.85, 4.6, B['ZAGUA'] - 1.0)),
    (11, 'Guarda-corpo de madeira 1,10 m (vão entre balaústres até 9 cm)', (48.0, 5.3, 0.95)),
]


def mirar(v):
    loc, tgt, lens, az, el, ex = v
    co.location = loc
    co.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    if lens == 0:                                       # planta: câmera ortográfica olhando de cima
        cam.type = 'ORTHO'; cam.ortho_scale = 6.4; co.rotation_euler = (0, 0, 0)
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
    scene.render.resolution_x = args.res; scene.render.resolution_y = int(args.res * (5.6 / 6.4 if nome == 'planta' else 2 / 3))
    scene.render.resolution_percentage = 100
    mirar(VISTAS[nome])
    scene.render.filepath = os.path.join(args.saida, nome + '.jpg')
    bpy.ops.render.render(write_still=True)
    if nome == 'estrutura':
        bpy.context.view_layer.update()
        pts = []
        for n, txt, p in PONTOS:
            q = world_to_camera_view(scene, co, Vector(p))
            pts.append({'n': n, 'texto': txt, 'x': q.x, 'y': 1 - q.y})
        json.dump(pts, open(os.path.join(args.saida, 'estrutura_pontos.json'), 'w'), ensure_ascii=False, indent=1)
    print('FOTO', nome, round(time.time() - t0, 1), 's', flush=True)
