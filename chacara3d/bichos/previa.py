"""Imagens de conferência (Cycles na CPU): céu com sol, chão neutro, câmeras fixas.

Usado pela verificação; não faz parte dos GLBs. As cores do pelo e das penas
são recompostas a partir das máscaras de cor de vértice, como o motor faria.
"""
import math
import bpy
import numpy as np
from mathutils import Vector


def preparar(res=(480, 360), amostras=24):
    cena = bpy.context.scene
    cena.render.engine = 'CYCLES'
    c = cena.cycles
    c.device = 'CPU'
    c.samples = amostras
    c.use_adaptive_sampling = True
    c.adaptive_threshold = 0.05
    c.use_denoising = True
    try:
        c.denoiser = 'OPENIMAGEDENOISE'
    except Exception:
        pass
    c.max_bounces = 4
    c.diffuse_bounces = 2
    c.glossy_bounces = 2
    c.transparent_max_bounces = 4
    cena.render.threads_mode = 'FIXED'
    cena.render.threads = 2
    cena.render.resolution_x, cena.render.resolution_y = res
    cena.render.resolution_percentage = 100
    cena.render.image_settings.file_format = 'PNG'
    cena.render.film_transparent = False
    cena.view_settings.view_transform = 'AgX'
    try:
        cena.view_settings.look = 'AgX - Medium High Contrast'
    except Exception:
        pass
    w = bpy.data.worlds.get('ceu') or bpy.data.worlds.new('ceu')
    cena.world = w
    try:
        w.use_nodes = True
    except Exception:
        pass
    nt = w.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputWorld')
    bg = nt.nodes.new('ShaderNodeBackground')
    ceu = nt.nodes.new('ShaderNodeTexSky')
    tipos = [e.identifier for e in ceu.bl_rna.properties['sky_type'].enum_items]
    for t in ('MULTIPLE_SCATTERING', 'NISHITA', 'SINGLE_SCATTERING'):
        if t in tipos:
            ceu.sky_type = t
            break
    try:
        ceu.sun_elevation = math.radians(45)
        ceu.sun_rotation = math.radians(150)
        ceu.sun_disc = False
    except Exception:
        pass
    bg.inputs['Strength'].default_value = 0.25
    nt.links.new(ceu.outputs['Color'], bg.inputs['Color'])
    nt.links.new(bg.outputs['Background'], out.inputs['Surface'])
    # sol
    if 'sol' not in bpy.data.objects:
        ld = bpy.data.lights.new('sol', 'SUN')
        ld.energy = 3.2
        ld.angle = math.radians(3)
        ld.color = (1.0, 0.96, 0.9)
        sol = bpy.data.objects.new('sol', ld)
        cena.collection.objects.link(sol)
        sol.rotation_euler = (math.radians(42), 0, math.radians(150))
    # chão neutro
    if 'chao' not in bpy.data.objects:
        me = bpy.data.meshes.new('chao')
        s = 20
        me.from_pydata([(-s, -s, 0), (s, -s, 0), (s, s, 0), (-s, s, 0)], [], [(0, 1, 2, 3)])
        ob = bpy.data.objects.new('chao', me)
        cena.collection.objects.link(ob)
        m = bpy.data.materials.new('chao_neutro')
        m.use_nodes = True
        b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
        b.inputs['Base Color'].default_value = (0.32, 0.31, 0.28, 1)
        b.inputs['Roughness'].default_value = 0.9
        me.materials.append(m)
    return cena


def camera(pos, alvo, lente=50, orto=None):
    cena = bpy.context.scene
    cam = bpy.data.objects.get('camera')
    if cam is None:
        cd = bpy.data.cameras.new('camera')
        cam = bpy.data.objects.new('camera', cd)
        cena.collection.objects.link(cam)
    cd = cam.data
    if orto:
        cd.type = 'ORTHO'
        cd.ortho_scale = orto
    else:
        cd.type = 'PERSP'
        cd.lens = lente
    cd.clip_start = 0.01
    cam.location = Vector(pos)
    d = Vector(alvo) - Vector(pos)
    cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    cena.camera = cam
    return cam


def renderizar(caminho):
    bpy.context.scene.render.filepath = caminho
    bpy.ops.render.render(write_still=True)


def material_mascaras(nome, cores, rug=0.75, atributo='Color'):
    """Material de prévia: cor = R*c0 + G*c1 + B*c2 usando a cor de vértice."""
    m = bpy.data.materials.get(nome) or bpy.data.materials.new(nome)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Roughness'].default_value = rug
    attr = nt.nodes.new('ShaderNodeVertexColor')
    attr.layer_name = atributo
    sep = nt.nodes.new('ShaderNodeSeparateColor')
    nt.links.new(attr.outputs['Color'], sep.inputs['Color'])
    soma = None
    for i, canal in enumerate(('Red', 'Green', 'Blue')):
        esc = nt.nodes.new('ShaderNodeVectorMath')
        esc.operation = 'SCALE'
        esc.inputs[0].default_value = cores[i]
        nt.links.new(sep.outputs[canal], esc.inputs['Scale'])
        if soma is None:
            soma = esc
        else:
            ad = nt.nodes.new('ShaderNodeVectorMath')
            ad.operation = 'ADD'
            nt.links.new(soma.outputs[0], ad.inputs[0])
            nt.links.new(esc.outputs[0], ad.inputs[1])
            soma = ad
    nt.links.new(soma.outputs[0], bsdf.inputs['Base Color'])
    nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    return m


def montar_tira(caminhos, saida, colunas=4, rotulos=None):
    """Junta várias imagens numa folha de contato."""
    from PIL import Image, ImageDraw
    ims = [Image.open(c).convert('RGB') for c in caminhos]
    w, h = ims[0].size
    linhas = math.ceil(len(ims) / colunas)
    folha = Image.new('RGB', (w * colunas, h * linhas), (30, 30, 30))
    d = ImageDraw.Draw(folha)
    for i, im in enumerate(ims):
        x, y = (i % colunas) * w, (i // colunas) * h
        folha.paste(im, (x, y))
        if rotulos:
            d.text((x + 6, y + 4), rotulos[i], fill=(255, 255, 255))
    folha.save(saida)
    return saida
