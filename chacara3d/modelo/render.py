"""Renderiza as vistas nomeadas do chacara.blend com o Cycles (CPU)."""
import bpy, sys, os, math, time, argparse
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__))
LOW = -1.0
VIEWS = {
    # nome: (câmera, alvo, lente, azimute do sol em graus, elevação do sol em graus, exposição)
    'piscina_tropical':  ((44.95, 4.25, 1.78), (34.5, 1.9, 0.45), 22, 62, 56, 0.0),
    'churrasqueira':     ((42.7, 1.7, 1.7), (39.7, 9.0, 1.35), 20, -100, 34, 0.25),
    'chuveirao':         ((43.2, 3.3, 1.6), (45.25, 0.05, 1.25), 24, 100, 55, 0.3),
    'deck_lago':         ((51.15, 4.75, LOW + 1.5), (46.5, 4.7, -0.2), 18, 22, 40, 0.0),
    'lago_carpas':       ((50.4, 6.0, 0.55), (48.55, 4.75, -0.7), 22, 20, 55, 0.2),
    'vista_do_deck':     ((45.2, 4.7, 1.75), (55.0, 5.2, -0.3), 20, 110, 50, 0.0),
    'cinema_pergolado':  ((57.8, 6.6, LOW + 1.6), (53.4, 1.0, -0.15), 20, 125, 46, 0.1),
    'faixa_tropical':    ((37.0, 4.45, 1.5), (41.3, 0.1, 1.0), 26, 75, 55, 0.2),
    'hidro_mangueira':   ((45.6, 4.85, 1.72), (34.0, 3.9, 0.8), 22, 70, 55, 0.0),
    'gramado_pomar':     ((31.0, 4.5, 1.7), (8.0, 5.2, 1.8), 24, 80, 50, 0.0),
    'vilinha':           ((1.6, 5.3, 1.65), (13.0, 4.7, 1.6), 20, 160, 44, 0.0),
    'vilinha_praca':     ((15.2, 5.7, 1.6), (9.0, 2.2, 1.45), 20, 50, 46, 0.0),
    'tiny_house':        ((14.9, 4.9, 1.5), (11.0, 8.2, 1.55), 24, -60, 42, 0.1),
    'jabuticabeira':     ((8.6, 5.5, 1.45), (11.2, 2.4, 1.75), 28, 75, 50, 0.1),
    'goiabeira_coqueiros': ((15.3, 4.2, 1.55), (21.0, 8.9, 3.1), 22, -40, 45, 0.1),
}


def setup(scene, res, samples):
    scene.render.engine = 'CYCLES'
    c = scene.cycles
    c.device = 'CPU'; c.samples = samples; c.use_adaptive_sampling = True; c.adaptive_threshold = 0.03
    c.use_denoising = True
    try:
        c.denoiser = 'OPENIMAGEDENOISE'
    except Exception as e:
        print('denoiser', e)
    c.max_bounces = 6; c.diffuse_bounces = 3; c.glossy_bounces = 3; c.transmission_bounces = 6; c.transparent_max_bounces = 10
    c.caustics_reflective = False; c.caustics_refractive = False
    scene.render.threads_mode = 'FIXED'; scene.render.threads = 2
    scene.render.resolution_x = res; scene.render.resolution_y = int(res * 2 / 3); scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'JPEG'; scene.render.image_settings.quality = 92
    scene.render.use_persistent_data = True
    scene.view_settings.view_transform = 'AgX'
    try:
        scene.view_settings.look = 'AgX - Medium High Contrast'
    except Exception as e:
        print('look', e)
    # ambiente (world)
    w = bpy.data.worlds.get('W') or bpy.data.worlds.new('W')
    scene.world = w
    try:
        w.use_nodes = True
    except Exception:
        pass
    nt = w.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputWorld'); bg = nt.nodes.new('ShaderNodeBackground')
    sky = nt.nodes.new('ShaderNodeTexSky')
    types = [e.identifier for e in sky.bl_rna.properties['sky_type'].enum_items]
    print('sky types', types)
    for t in ('MULTIPLE_SCATTERING', 'NISHITA', 'SINGLE_SCATTERING'):
        if t in types:
            sky.sky_type = t; break
    for k, v in (('sun_disc', False), ('sun_elevation', math.radians(45)), ('altitude', 600.0), ('air_density', 1.0),
                 ('dust_density', 1.2), ('aerosol_density', 1.2), ('ozone_density', 1.0)):
        if hasattr(sky, k):
            try:
                setattr(sky, k, v)
            except Exception as e:
                print(k, e)
    bg2 = nt.nodes.new('ShaderNodeBackground'); lp = nt.nodes.new('ShaderNodeLightPath'); mx = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(sky.outputs[0], bg.inputs[0]); nt.links.new(sky.outputs[0], bg2.inputs[0])
    bg.inputs[1].default_value = SKY; bg2.inputs[1].default_value = SKY * CAMSKY
    nt.links.new(lp.outputs['Is Camera Ray'], mx.inputs[0]); nt.links.new(bg.outputs[0], mx.inputs[1]); nt.links.new(bg2.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], out.inputs[0])
    sun = bpy.data.lights.new('Sun', 'SUN'); sun.energy = SUN; sun.angle = math.radians(1.2); sun.color = (1.0, 0.94, 0.84)
    so = bpy.data.objects.new('Sun', sun); scene.collection.objects.link(so)
    cam = bpy.data.cameras.new('Cam'); co = bpy.data.objects.new('Cam', cam); scene.collection.objects.link(co)
    cam.sensor_width = 36; cam.clip_start = 0.05; cam.clip_end = 600
    scene.camera = co
    return sky, so, co


def aim(scene, sky, so, co, v):
    loc, tgt, lens, az, el, ex = v
    co.location = loc
    d = Vector(tgt) - Vector(loc)
    co.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    co.data.lens = lens
    a, e = math.radians(az), math.radians(el)
    s = Vector((math.cos(e) * math.cos(a), math.cos(e) * math.sin(a), math.sin(e)))
    so.rotation_euler = (-s).to_track_quat('-Z', 'Y').to_euler()
    if hasattr(sky, 'sun_elevation'):
        sky.sun_elevation = e
    if hasattr(sky, 'sun_rotation'):
        sky.sun_rotation = math.radians(90) - a
    scene.view_settings.exposure = EXPO + ex


ap = argparse.ArgumentParser()
ap.add_argument('views', nargs='*'); ap.add_argument('--res', type=int, default=960); ap.add_argument('--samples', type=int, default=24)
ap.add_argument('--out', default=os.path.join(HERE, 'out')); ap.add_argument('--sky', type=float, default=0.22)
ap.add_argument('--sun', type=float, default=4.5); ap.add_argument('--camsky', type=float, default=0.45); ap.add_argument('--expo', type=float, default=0.0)
args = ap.parse_args()
SKY, SUN, EXPO, CAMSKY = args.sky, args.sun, args.expo, args.camsky
bpy.ops.wm.open_mainfile(filepath=os.path.join(HERE, 'chacara.blend'))
scene = bpy.context.scene
sky, so, co = setup(scene, args.res, args.samples)
os.makedirs(args.out, exist_ok=True)
for name in (args.views or (list(VIEWS) + ['planta'])):
    t0 = time.time()
    if name == 'planta':
        aim(scene, sky, so, co, ((30.0, 5.0, 60.0), (30.0, 5.001, 0.0), 50, 60, 62, 0.0))
        co.data.type = 'ORTHO'; co.data.ortho_scale = 64.0
        for ob in scene.objects:
            if ob.name.split('.')[0] in ('leaf_amend', 'leaf_amend_red', 'leaf_mango', 'leaf_core_big_s', 'fruit_mango_s'):
                ob.hide_render = True
        co.rotation_euler = (0, 0, 0)
        scene.render.resolution_x = int(args.res * 1.6); scene.render.resolution_y = int(args.res * 1.6 * 14 / 64)
    else:
        co.data.type = 'PERSP'
        for ob in scene.objects:
            ob.hide_render = False
        scene.render.resolution_x = args.res; scene.render.resolution_y = int(args.res * 2 / 3)
        aim(scene, sky, so, co, VIEWS[name])
    scene.render.filepath = os.path.join(args.out, name + '.jpg')
    bpy.ops.render.render(write_still=True)
    print('RENDERED', name, round(time.time() - t0, 1), 's', flush=True)
