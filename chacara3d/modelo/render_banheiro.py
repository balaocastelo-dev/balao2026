"""Fotos do projeto marcando a área do banheiro externo do quintal de baixo (ao lado da escada que sobe para a
churrasqueira, do lado oposto ao laguinho).

    python render_banheiro.py PASTA [--res 1400] [--samples 32] [--vistas planta,quintal,laje] [--estudo]

Roda o build.py inteiro, tira o que fica atrás de quem olha (garagem, pergolado, cinema e as árvores do gramado),
põe uma caixa laranja transparente no lugar do banheiro e renderiza. Com --estudo, no lugar da caixa entra o
estudo do banheiro (medidas no banheiro.py) e há também a vista `nicho`. Grava PASTA/<vista>.jpg e
PASTA/<vista>_pontos.json (onde caem na foto os cantos da área e os rótulos), que o legenda_banheiro.py usa.
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
ap.add_argument('--vistas', default='planta,quintal,laje'); ap.add_argument('--estudo', action='store_true'); ap.add_argument('--modelo', type=int, default=1)
args = ap.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:])
os.makedirs(args.saida, exist_ok=True)

src = open(os.path.join(HERE, 'build.py'), encoding='utf-8').read()
cut = src.index("objs = geo.build_objects()")
ns = {'__file__': os.path.join(HERE, 'build.py'), '__name__': 'banheiro'}
exec(compile(src[:cut], 'build.py', 'exec'), ns)
geo = ns['geo']; O = ns['obra']
LOW, EDGE, WH = ns['LOW'], ns['EDGE'], ns['WH']

# ---- área do banheiro: encostada no muro de arrimo, do lado da escada até o muro lateral (medidas do modelo;
# a distância da escada ao muro lateral ainda não foi medida no local)
BX0, BX1 = O.FACE, O.FACE + 2.00
BY0, BY1 = O.ESCADA_Y1 + 0.25, O.LARGURA
BZ1 = LOW + 2.60                                    # altura de um banheiro (2,60 do chão de baixo = 1,60 acima da laje)


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


planta_so = set(args.vistas.split(',')) <= {'planta'}
_yt = 4.6 if args.estudo else 10.3                    # no estudo a garagem fica (o banheiro termina perto dela)
TIRAR = [(51.3, 60.5, -0.3, _yt, LOW + 0.006, 9.0),          # garagem, pergolado e cinema
         (51.3, 60.5, -0.3, _yt, LOW - 0.05, 9.0, ('wood_z', 'bark_cane', 'stone_cut', 'screen', 'wood_x', 'cushion', 'cushion_teal', 'couro', 'wood_y'))]
if planta_so:
    TIRAR.append((44.0, 52.0, -0.3, 4.5, 1.25, 12.0, ('bark_dark',)))          # na planta fica só o tronco da amendoeira
if args.estudo:
    import banheiro as B
    TIRAR.append((B.XB0 - 0.02, B.XB1 + 0.05, B.YB0 - B.PISO_FRENTE - 0.02, B.YB1, LOW + 0.012, LOW + 3.2))  # o que estava no lugar
    TIRAR.append((52.2, B.XB1 + 0.15, 6.7, 10.2, LOW - 0.03, 4.0, ('rooftile', 'wood_y', 'wood_x', 'wood_z', 'stone_cut')))  # garagem encolhe
COPA = ('leaf_amend', 'leaf_amend_red', 'leaf_core_big')
ARVORES = ('leaf_mango', 'leaf_core', 'leaf_bg', 'leaf_palm', 'leaf_palm_base', 'leaf_palm_rachis', 'leaf_areca', 'leaf_citrus',
           'leaf_goiaba', 'leaf_jabu', 'leaf_vine', 'leaf_vine_light', 'bark_palm', 'bark_jabu', 'bark_goiaba', 'fruit_mango',
           'fruit_goiaba', 'fruit_black', 'fruit_lemon', 'fruit_red', 'coconut', 'terrain', 'street', 'wall_sand', 'wall_moss', 'wall_out')
recortar((24.0, 60.5, -0.3, 10.3, -3.0, 12.0), TIRAR, tirar_mats=ARVORES + (COPA if planta_so else ()))
if planta_so:
    _h = (1.25 - LOW) / 3.4
    geo.disc('bark_dark', (O.ARVORE[0] + 0.35 * _h, O.ARVORE[1] - 0.12 * _h), 0.235, 1.24, seg=20)
geo.box('wall_sand', 60.0, 60.15, -0.15, 10.15, LOW - 0.04, LOW + WH)        # muro do fundo
geo.box('terrain', 0.0, 90.0, -40.0, 40.0, LOW - 0.6, LOW - 0.55)
for y0_, y1_ in ((-0.15, 0.0), (10.0, 10.15)):                              # muros laterais do terreno
    geo.box('wall_sand', 24.0, EDGE, y0_, y1_, -0.04, WH)
    geo.box('wall_sand', EDGE, 60.15, y0_, y1_, LOW - 0.04, LOW + WH)

# ---- a marca do banheiro: piso laranja, caixa transparente e as arestas (ou o estudo, com --estudo)
if args.estudo:
    import plants as P
    B.construir(geo, P, np.random.default_rng(31), args.modelo)
    BZ1 = B.topo(args.modelo)
    # a cobertura da garagem encolhe até o banheiro: vigas, piso e pilares refeitos a partir de GX
    GX = B.XB1 + 0.15; zbm = ns['zbm']; GZH = ns['GZH']
    geo.box('wood_x', GX, 58.7, 6.92, 7.08, zbm - 0.18, zbm)
    geo.box('wood_x', GX, 58.7, 9.9, 9.98, GZH - 0.32, GZH - 0.13)
    geo.box('wood_z', GX, GX + 0.16, 6.92, 7.08, LOW, zbm - 0.18)
    geo.box('wood_z', GX, GX + 0.12, 9.86, 9.98, LOW, GZH - 0.32)
    geo.box('stone_cut', GX, 58.7, 6.9, 9.98, LOW - 0.01, LOW + 0.012)
geo.m_plain('marca_piso', (1.0, 0.42, 0.04), 0.6, **{'Alpha': 0.55})
geo.m_plain('marca_caixa', (1.0, 0.45, 0.06), 0.5, **{'Alpha': 0.16})
geo.m_emit('marca_aresta', (1.0, 0.38, 0.02), 2.2)
if not args.estudo:
    geo.box('marca_piso', BX0, BX1, BY0, BY1 - 0.005, LOW + 0.006, LOW + 0.016)
    geo.box('marca_caixa', BX0 + 0.005, BX1, BY0, BY1 - 0.01, LOW + 0.02, BZ1)
    cantos = [(BX0, BY0), (BX1, BY0), (BX1, BY1), (BX0, BY1)]
    for i in range(4):
        (xa, ya), (xb, yb) = cantos[i], cantos[(i + 1) % 4]
        for zz in (LOW + 0.02, BZ1):
            geo.tube('marca_aresta', [(xa, ya, zz), (xb, yb, zz)], 0.018, seg=6)
        geo.tube('marca_aresta', [(xa, ya, LOW + 0.02), (xa, ya, BZ1)], 0.018, seg=6)

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

PX0, PX1, PY0, PY1 = 43.4, 52.4, -0.25, 10.45          # recorte da planta
VISTAS = {
    # nome: (câmera, alvo, lente, azimute do sol, elevação do sol, exposição)
    'planta': (((PX0 + PX1) / 2, (PY0 + PY1) / 2, 14.0), ((PX0 + PX1) / 2, (PY0 + PY1) / 2 + 0.0001, -1.0), 0, 215, 62, 0.15),
    'quintal': ((52.0, 5.6, LOW + 1.7), (46.6, 7.5, -0.3), 18, 215, 52, 0.1),
    'laje': ((44.0, 3.0, 1.65), (47.2, 7.9, -0.75), 17, 215, 55, 0.05),
    'nicho': ((50.9, 6.3, LOW + 1.55), (46.5, 8.3, LOW + 1.05), 22, 215, 52, 0.1),
}
if args.estudo:                                        # o estudo fica de frente para o poço: câmeras viradas para ele
    VISTAS.update({
        'quintal': ((52.1, 2.9, LOW + 1.75), (50.0, 8.7, LOW + 1.15), 16, 215, 52, 0.1),
        'alto': ((54.2, 2.4, LOW + 3.7), (49.9, 8.6, LOW + 0.9), 17, 215, 52, 0.1),
        'nicho': (((B.XN0 + B.XN1) / 2, 5.85, LOW + 1.55), ((B.XN0 + B.XN1) / 2, 9.6, LOW + 1.0), 20, 215, 52, 0.1),
        'laje': ((44.1, 3.9, 1.7), (49.0, 8.6, -0.6), 17, 215, 55, 0.05),
    })
# pontos que o legenda_banheiro.py usa (cantos do piso e do topo da área, e onde ficam as coisas em volta)
PONTOS = {
    'piso': [(BX0, BY0, LOW + 0.02), (BX1, BY0, LOW + 0.02), (BX1, BY1, LOW + 0.02), (BX0, BY1, LOW + 0.02)],
    'topo': [(BX0, BY0, BZ1), (BX1, BY0, BZ1), (BX1, BY1, BZ1), (BX0, BY1, BZ1)],
    'escada': [(O.ESCADA_X0 + O.ESCADA_N * O.ESCADA_PISO * 0.55, (O.ESCADA_Y0 + O.ESCADA_Y1) / 2, LOW * 0.45)],
    'poco': [(O.POCO[0], O.POCO[1], LOW + 0.7)],
    'lago': [(float(O.LAGO[:, 0].mean()), float(O.LAGO[:, 1].mean()), LOW)],
    'churrasqueira': [(43.6, 8.3, 2.6)],
}
MEDIDAS = {'largura': BY1 - BY0, 'fundo': BX1 - BX0, 'altura': BZ1 - LOW}
if args.estudo:
    PONTOS.update({
        'banheiro1': [((B.XA0 + B.XA1) / 2, B.YB0 - 0.02, LOW + 1.3)],
        'banheiro2': [((B.XC0 + B.XC1) / 2, B.YB0 - 0.02, LOW + 1.3)],
        'pia': [(B.CUBAS[0][0], B.CUBAS[0][1], B.BANC_Z + 0.1)],
        'jardineira': [((B.XB0 + B.XB1) / 2 + 0.9, B.YB0 - B.MARQUISE + 0.2, B.ZT + 0.3)],
        'corredor': [(B.XB0 - 0.5, B.YB0 + 1.0, LOW + 0.05)],
    })
    MEDIDAS.update({'estudo': True, 'largura': B.LARG, 'fundo': B.FUNDO, 'banheiro': [B.CAB, B.LIVRE], 'nicho': B.NICHO,
                    'pe_direito': B.PD, 'acima_da_laje': B.topo(args.modelo), 'afastamento': B.AFASTAMENTO, 'ate_poco': B.ATE_POCO,
                    'modelo': args.modelo, 'modelo_nome': B.MODELOS[args.modelo]['nome'], 'modelo_desc': B.MODELOS[args.modelo]['desc']})


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
