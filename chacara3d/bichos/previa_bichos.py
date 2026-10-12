"""Prévias renderizadas a partir dos GLBs exportados (o que o motor vai receber).

As cores de pelo/penas são recompostas pelas máscaras COLOR_0 com as cores
sugeridas do bichos.json, como o motor faria.
"""
import json
import math
import os
import numpy as np
import bpy
from mathutils import Vector

import previa

LOCOMOCAO = {
    'cachorro': ['andando', 'trotando', 'correndo', 'farejando'],
    'galinha': ['andando', 'correndo', 'ciscando', 'bicando'],
    'galo': ['andando', 'correndo', 'ciscando', 'cantando'],
}


def srgb_lin(h):
    c = np.array([int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)])
    return tuple(np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4))


MANTER = {'objects': ('sol', 'chao', 'camera'), 'meshes': ('chao',), 'materials': ('chao_neutro',),
          'armatures': (), 'actions': ()}


def importar(caminho):
    for tipo, manter in MANTER.items():
        col = getattr(bpy.data, tipo)
        for it in list(col):
            if it.name not in manter:
                col.remove(it)
    cena = bpy.context.scene
    cena.render.fps = 30
    antes = set(cena.objects.keys())
    bpy.ops.import_scene.gltf(filepath=caminho)
    novos = [o for o in cena.objects if o.name not in antes]
    arm = next(o for o in novos if o.type == 'ARMATURE')
    malha = next(o for o in novos if o.type == 'MESH' and o.parent == arm)
    for o in novos:
        if o not in (arm, malha):
            o.hide_render = True      # esferas que o importador cria para desenhar ossos
    return arm, malha


def materiais_previa(malha, cores):
    """Como o motor: pelo/penas pelas máscaras; as outras peças com a cor lisa do material."""
    me = malha.data
    attr = me.color_attributes[0].name if len(me.color_attributes) else 'Color'
    for i, m in enumerate(me.materials):
        if not m:
            continue
        if m.name in ('pelo', 'penas'):
            me.materials[i] = previa.material_mascaras(
                'previa_' + m.name, [srgb_lin(cores['principal']), srgb_lin(cores['secundaria']),
                                     srgb_lin(cores.get('pele', cores['secundaria']))], rug=0.8, atributo=attr)
        elif m.name in cores:
            rug = {'olho': 0.08, 'lingua': 0.45, 'crista': 0.5, 'bico_pernas': 0.45}.get(m.name, 0.6)
            novo = bpy.data.materials.new('previa_' + m.name)
            novo.use_nodes = True
            b = next(n for n in novo.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
            b.inputs['Base Color'].default_value = (*srgb_lin(cores[m.name]), 1.0)
            b.inputs['Roughness'].default_value = rug
            me.materials[i] = novo


def por_acao(arm, nome, quadro):
    acao = bpy.data.actions[nome]
    ad = arm.animation_data or arm.animation_data_create()
    ad.action = acao
    try:
        if ad.action_slot is None and len(acao.slots):
            ad.action_slot = acao.slots[0]
    except Exception:
        pass
    bpy.context.scene.frame_set(int(quadro))


def previas(nome, caminho, pasta):
    os.makedirs(pasta, exist_ok=True)
    info = json.load(open(os.path.join(os.path.dirname(caminho), 'bichos.json'), encoding='utf-8'))['bichos'][nome]
    cena = previa.preparar((560, 420), 24)
    arm, malha = importar(caminho)
    materiais_previa(malha, info['cores_sugeridas_srgb'])
    # Blender (Z para cima) depois da importação: o bicho olha para -Y
    t = info['tamanho_m']
    comp, alt = t['comprimento_z'], t['altura_y']
    meio = 0.45 * alt
    parado = 'parado' if 'parado' in info['animacoes'] else 'parada'
    por_acao(arm, parado, 0)
    quadro = max(comp, alt * 1.4) * 1.18
    vistas = {
        'lado': ((quadro * 2.0, 0.0, meio), (0, 0, meio), 0, quadro),
        'tres_quartos': ((quadro * 1.15, -quadro * 1.4, alt * 1.1 + 0.1 * quadro), (0, -0.04 * comp, meio * 0.95), 45, None),
        'cima': ((0.0, 0.0001, quadro * 2.5), (0, 0, 0), 0, quadro),
    }
    feitas = []
    for v, (p, a, lente, orto) in vistas.items():
        previa.camera(p, a, lente, orto)
        f = os.path.join(pasta, f'{nome}_{v}.png')
        previa.renderizar(f)
        feitas.append(f)
    # folhas de contato dos ciclos
    cena.render.resolution_x, cena.render.resolution_y = 360, 270
    cena.cycles.samples = 12
    for an in LOCOMOCAO[nome] + [k for k in info['animacoes'] if not info['animacoes'][k]['repete']][:0]:
        if an not in info['animacoes']:
            continue
        q = info['animacoes'][an]['quadros'] - 1
        idx = np.linspace(0, q, 9)[:-1].round().astype(int)
        imgs = []
        for k in idx:
            por_acao(arm, an, k)
            previa.camera((quadro * 2.0, -0.0, meio), (0, 0, meio), 0, quadro * 1.05)
            f = os.path.join(pasta, f'_q_{nome}_{an}_{k:03d}.png')
            previa.renderizar(f)
            imgs.append(f)
        folha = os.path.join(pasta, f'{nome}_ciclo_{an}.png')
        previa.montar_tira(imgs, folha, colunas=4, rotulos=[f'{an} q{k}' for k in idx])
        for f in imgs:
            os.remove(f)
        feitas.append(folha)
    return feitas
