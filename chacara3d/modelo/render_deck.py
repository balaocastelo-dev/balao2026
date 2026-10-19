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
ap.add_argument('--vistas', default='quintal,cascata,laje')
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


O = ns['obra']
TIRAR = [(51.3, 60.5, -0.3, 10.3, LOW + 0.006, 9.0),     # garagem, pergolado e cinema (atrás de quem olha o lago)
         (30.0, 44.45, -0.3, 10.3, -3.0, 0.05),        # piscina
         (40.0, 45.85, -0.3, 10.3, -0.035, 9.0),        # churrasqueira, chuveirão e vasos acima do piso
        ]
sem_copa = set(args.vistas.split(',')) <= {'planta', 'estrutura'}
estrutura = 'estrutura' in args.vistas.split(',') and len(args.vistas.split(',')) == 1
if estrutura:
    # o lago vazio: saem a água, os peixes e as plantas de dentro d'água, para aparecer o fundo
    TIRAR.append((44.0, 52.0, -1.0, 11.0, -3.0, 9.0, ('ninfeia', 'flor_ninfeia')))
COPA = ('leaf_amend', 'leaf_amend_red', 'leaf_core_big')       # a amendoeira fica nas vistas em perspectiva, sai na planta e na estrutura
if sem_copa:
    TIRAR.append((44.0, 52.0, -0.3, 4.5, 1.25, 12.0, ('bark_dark',)))   # na planta e na estrutura fica só o tronco
ARVORES = ('leaf_mango', 'leaf_core', 'leaf_bg', 'leaf_palm', 'leaf_palm_base',
           'leaf_palm_rachis', 'leaf_areca', 'leaf_citrus', 'leaf_goiaba', 'leaf_jabu', 'leaf_vine', 'leaf_vine_light',
           'bark_palm', 'bark_jabu', 'bark_goiaba', 'fruit_mango', 'fruit_goiaba', 'fruit_black', 'fruit_lemon', 'fruit_red',
           'coconut', 'rope', 'caco', 'terrain', 'street', 'wall_sand', 'wall_moss', 'wall_out', 'wall_white')
recortar((43.6, 60.5, -0.3, 10.3, -3.0, 12.0), TIRAR,
         tirar_mats=ARVORES + (COPA if sem_copa else ()) + (('water_pond', 'veu_agua', 'koi_o', 'koi_w', 'koi_k', 'leaf_purple', 'stem_purple') if estrutura else ()))
# chão de novo onde o recorte tirou as peças grandes que passam da caixa
geo.box('caco', 43.6, EDGE, -0.3, 10.3, -0.04, 0.0)                         # piso da piscina (nível 0,00)
if sem_copa:                                                                 # tampa do tronco cortado da amendoeira
    _h = (1.25 - LOW) / 3.4
    geo.disc('bark_dark', (O.ARVORE[0] + 0.35 * _h, O.ARVORE[1] - 0.12 * _h), 0.235, 1.24, seg=20)
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

# enquadramento a partir do lago (obra.py)
LX0, LX1 = float(O.LAGO[:, 0].min()), float(O.LAGO[:, 0].max()); LY0, LY1 = float(O.LAGO[:, 1].min()), float(O.LAGO[:, 1].max())
CXc, CYc = (EDGE - 0.4 + LX1) / 2, (LY0 + max(LY1, O.ESCADA_Y1)) / 2
PLANTA_W, PLANTA_H = 6.6, 6.0
CY_ = O.CASCATA['origem'][1]
VISTAS = {
    # nome: (câmera, alvo, lente, azimute do sol, elevação do sol, exposição)
    'quintal': ((LX1 + 1.5, O.POCO[1] - 0.9, LOW + 1.7), (EDGE + 0.9, (LY0 + LY1) / 2 + 0.3, -0.85), 19, 215, 52, 0.1),
    'cascata': ((LX1 - 0.4, 0.45, LOW + 1.45), (EDGE + 0.2, CY_ + 0.1, -0.6), 19, 215, 50, 0.1),
    'laje': ((EDGE - 0.35, O.ESCADA_Y0 + 0.45, 1.7), (EDGE + 2.1, (LY0 + LY1) / 2 - 0.2, -1.05), 18, 215, 55, 0.05),
    'estrutura': ((LX1 + 1.2, O.POCO[1] - 1.1, LOW + 1.9), (EDGE + 1.6, (LY0 + LY1) / 2 - 0.1, -1.15), 19, 215, 58, 0.2),
    'planta': ((CXc, CYc, 12.0), (CXc, CYc + 0.0001, -1.0), 0, 215, 62, 0.15),
}
# pontos numerados da vista do lago vazio (centro de cada coisa)
_gx, _gy = np.meshgrid(np.arange(LX0, LX1, 0.05), np.arange(LY0, LY1, 0.05), indexing='ij')
_dd = O.dentro_lago(_gx, _gy)
_pp = np.where(_dd, O.prof_lago(_gx, _gy), -1)
_kf = np.unravel_index(np.argmax(_pp + 0.001 * _gx), _pp.shape)
_ks = np.argwhere(_dd & (np.abs(_pp - O.PRAT_PROF) < 0.01) & (_gx > EDGE + 2.5)); _ks = tuple(_ks[np.argmax(_gy[_ks[:, 0], _ks[:, 1]])]) if len(_ks) else _kf
_kb = int(np.argmin(np.hypot(O.LAGO[:, 0] - (LX1 - 0.2), O.LAGO[:, 1] - (LY1 - 1.0))))
_co = np.array(O.CASCATA['origem']); _cd = np.array([math.cos(O.CASCATA['ang']), math.sin(O.CASCATA['ang'])])
_br = lambda v: f'{v:.2f}'.replace('.', ',')
PONTOS = [
    (1, f'Guarda-corpo de madeira de {_br(O.GUARDA_H)} m na beira da laje (vão entre balaústres até 9 cm)', (EDGE - 0.04, CY_ - 0.9, 0.95)),
    (2, 'Muro de arrimo novo, revestido de pedra (desnível de 1,00 m)', (O.FACE + 0.06, 1.2, -0.55)),
    (3, 'Cascata de lajes de pedra (3 quedas) descendo do alto do muro', tuple(_co + _cd * 0.45) + (O.CASCATA['lajes'][1][1],)),
    (4, 'Borda de pedras arredondadas, meio enterradas', (float(O.LAGO[_kb, 0]), float(O.LAGO[_kb, 1]), LOW + 0.1)),
    (5, f'Prateleira de plantas a {round(O.PRAT_PROF * 100)} cm de fundo', (float(_gx[_ks]), float(_gy[_ks]), O.ZAGUA - O.PRAT_PROF)),
    (6, f'Parte funda: {_br(O.PROF)} m de água', (float(_gx[_kf]), float(_gy[_kf]), O.ZAGUA - O.PROF)),
    (7, 'Amendoeira: o lago fica a 1,20 m do tronco', (O.ARVORE[0], O.ARVORE[1], LOW + 1.3)),
    (8, 'Poço: o lago fica a 1,50 m da boca', (O.POCO[0], O.POCO[1] - O.POCO_R, LOW + 0.5)),
]


def mirar(v):
    loc, tgt, lens, az, el, ex = v
    co.location = loc
    co.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    if lens == 0:                                       # planta: câmera ortográfica olhando de cima
        cam.type = 'ORTHO'; cam.ortho_scale = PLANTA_W; co.rotation_euler = (0, 0, 0)
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
    scene.render.resolution_x = args.res; scene.render.resolution_y = int(args.res * (PLANTA_H / PLANTA_W if nome == 'planta' else 2 / 3))
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
