"""Gera os bichos animados da Chácara 3D (cachorro, galinha e galo) em GLB.

Uso (com o Blender como módulo de Python, igual ao `modelo/`):

    python bichos.py                 # os três, em ../../public/chacara3d/bichos/
    python bichos.py cachorro        # só um
    python bichos.py --saida /tmp/x  # outra pasta

Tudo é feito por código e o resultado sai igual a cada execução. Além dos GLBs
grava `bichos.json`, com as animações, medidas e convenções que o motor usa.
"""
import argparse
import json
import os
import sys
import time

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)

import numpy as np  # noqa: E402
import bpy  # noqa: E402

import cena  # noqa: E402
import glb  # noqa: E402
import esqueleto as E  # noqa: E402

SAIDA_PADRAO = os.path.normpath(os.path.join(AQUI, '..', '..', 'public', 'chacara3d', 'bichos'))


def exportar(caminho, malha, arm, acoes, manter_posicao):
    """Exporta só a malha e a armadura, com todas as ações, e enxuga o GLB."""
    E.empilhar_acoes(arm, acoes)
    for ob in list(bpy.context.scene.objects):
        ob.select_set(ob in (malha, arm))
    bpy.context.view_layer.objects.active = arm
    bpy.ops.export_scene.gltf(
        filepath=caminho, export_format='GLB', use_selection=True,
        export_animation_mode='ACTIONS', export_force_sampling=True, export_frame_step=1,
        export_optimize_animation_size=False, export_anim_slide_to_zero=False,
        export_reset_pose_bones=True, export_rest_position_armature=True,
        export_vertex_color='ACTIVE', export_all_vertex_colors=False,
        export_active_vertex_color_when_no_material=True,
        export_texcoords=False, export_normals=True, export_tangents=False,
        export_skins=True, export_influence_nb=4, export_all_influences=False, export_def_bones=False,
        export_yup=True, export_apply=False, export_cameras=False, export_lights=False, export_extras=False,
        export_materials='EXPORT', export_image_format='NONE', export_morph=False)
    js, binario = glb.ler(caminho)
    js, binario = glb.enxugar_animacoes(js, binario, manter_posicao=manter_posicao)
    js['asset']['generator'] = 'chacara3d/bichos/bichos.py (Blender ' + bpy.app.version_string + ')'
    glb.escrever(caminho, js, binario)


def gerar_cachorro(saida, passo):
    import cachorro
    import cachorro_anim as CA
    from cachorro_pose import PoseCachorro
    cena.limpar_cena()
    malha, arm, F = cachorro.construir(passo)
    esq = E.Esqueleto(arm)
    pc = PoseCachorro(esq)
    acoes, info = [], {}
    for nome, fn in CA.ANIMACOES:
        params, repete, vel = fn(pc)
        quadros = [pc.resolver(p)[1] for p in params]
        acoes.append(E.gravar_acao(arm, nome, quadros, com_posicao=('quadril', 'lingua')))
        info[nome] = dict(duracao_s=round((len(params) - 1) / E.FPS, 4), repete=repete,
                          quadros=len(params))
        if vel > 0:
            info[nome]['velocidade_m_s'] = vel
    caminho = os.path.join(saida, 'cachorro.glb')
    exportar(caminho, malha, arm, acoes, ('quadril', 'lingua'))
    return caminho, info, cachorro.medidas(F)


def gerar_ave(saida, passo, galo):
    import galinha
    import galinha_anim as GA
    from galinha_pose import PoseAve
    cena.limpar_cena()
    malha, arm, F = galinha.construir(galo=galo, passo=passo)
    esq = E.Esqueleto(arm)
    pa = PoseAve(esq, galo=galo)
    acoes, info = [], {}
    for nome, fn in GA.animacoes(galo):
        params, repete, vel = fn(pa)
        quadros = [pa.resolver(p)[1] for p in params]
        acoes.append(E.gravar_acao(arm, nome, quadros, com_posicao=('corpo',)))
        info[nome] = dict(duracao_s=round((len(params) - 1) / E.FPS, 4), repete=repete,
                          quadros=len(params))
        if vel > 0:
            info[nome]['velocidade_m_s'] = vel
    caminho = os.path.join(saida, 'galo.glb' if galo else 'galinha.glb')
    exportar(caminho, malha, arm, acoes, ('corpo',))
    return caminho, info, galinha.medidas(galo, F)


def medir(caminho):
    """Mede o GLB exportado (no espaço do glTF): caixa, triângulos, ossos, materiais."""
    js, binario = glb.ler(caminho)
    tris = 0
    mn, mx = np.full(3, np.inf), np.full(3, -np.inf)
    for m in js['meshes']:
        for p in m['primitives']:
            a = js['accessors'][p['attributes']['POSITION']]
            mn = np.minimum(mn, a['min'])
            mx = np.maximum(mx, a['max'])
            tris += js['accessors'][p['indices']]['count'] // 3
    ossos = [js['nodes'][j]['name'] for j in js['skins'][0]['joints']]
    mats = [m['name'] for m in js['materials']]
    return dict(triangulos=int(tris), caixa_min_m=[round(float(x), 4) for x in mn],
                caixa_max_m=[round(float(x), 4) for x in mx],
                tamanho_m={'largura_x': round(float(mx[0] - mn[0]), 3), 'altura_y': round(float(mx[1] - mn[1]), 3),
                           'comprimento_z': round(float(mx[2] - mn[2]), 3)},
                ossos=ossos, materiais=mats, bytes=os.path.getsize(caminho))


SEQUENCIAS = {
    'cachorro': {
        'osso_raiz': 'raiz', 'osso_corpo': 'quadril', 'pose_de_ligacao': 'em pé (igual ao primeiro quadro de parado)',
        'uma_vez': {
            'sentando': 'de parado/em pé para sentado', 'levantando': 'de sentado para em pé',
            'deitando': 'de em pé para deitado (senta e escorrega as patas)',
            'levantando_do_chao': 'de deitado para em pé',
        },
        'encadeamento': ['parado -> sentando -> sentado -> levantando -> parado',
                         'parado -> deitando -> deitado -> levantando_do_chao -> parado'],
    },
    'galinha': {
        'osso_raiz': 'raiz', 'osso_corpo': 'corpo', 'pose_de_ligacao': 'em pé (igual ao primeiro quadro de parada)',
        'uma_vez': {'sacudindo': 'começa e termina em pé, na pose de parada'},
    },
    'galo': {
        'osso_raiz': 'raiz', 'osso_corpo': 'corpo', 'pose_de_ligacao': 'em pé (igual ao primeiro quadro de parada)',
        'uma_vez': {'sacudindo': 'começa e termina em pé, na pose de parada',
                    'cantando': 'começa e termina em pé, na pose de parada'},
    },
}

CONVENCOES = {
    'unidade': 'metro',
    'eixos': 'glTF Y para cima; o bicho olha para +Z; esquerda do bicho = +X',
    'origem': 'no chão, centrada entre as patas (no meio do corpo)',
    'animacoes_no_lugar': 'nenhuma animação anda com a raiz; o motor desloca o bicho. '
                          'O osso do corpo (quadril/corpo) só balança (sobe e desce, gira) e é o único que tem translação.',
    'velocidade': 'para as marchas, velocidade_m_s é a velocidade de deslocamento que casa com a passada '
                  '(pata no chão sem escorregar). Para outra velocidade, ajustar timeScale = v / velocidade_m_s.',
    'pele': 'uma malha com esqueleto (skin), até 4 ossos por vértice, pesos normalizados',
    'quadros_por_segundo': E.FPS,
    'canais': 'todas as animações têm rotação de todos os ossos (troca de animação sem pose sobrando)',
    'cabeca': 'osso `cabeca` disponível para o olhar procedural por cima da animação',
    'cor_de_vertice': 'COLOR_0 é MÁSCARA (linear), não cor. O GLTFLoader do three.js liga vertexColors '
                      'sozinho quando há COLOR_0: o motor deve desligar (material.vertexColors = false) e misturar '
                      'as cores com as máscaras no shader (onBeforeCompile), ex.: cor = R*principal + G*secundaria + B*pele.',
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('bichos', nargs='*', default=['cachorro', 'galinha', 'galo'])
    ap.add_argument('--saida', default=SAIDA_PADRAO)
    ap.add_argument('--passo', type=float, default=None, help='tamanho da grade da forma (m)')
    args = ap.parse_args([a for a in sys.argv[1:] if a != '--'] if '--' not in sys.argv else
                         sys.argv[sys.argv.index('--') + 1:])
    os.makedirs(args.saida, exist_ok=True)
    caminho_json = os.path.join(args.saida, 'bichos.json')
    try:
        dados = json.load(open(caminho_json, encoding='utf-8'))
    except Exception:
        dados = {}
    dados['convencoes'] = CONVENCOES
    dados.setdefault('bichos', {})
    for b in args.bichos:
        t0 = time.time()
        if b == 'cachorro':
            import cachorro
            caminho, anims, medidas = gerar_cachorro(args.saida, args.passo or 0.0028)
            extra = cachorro.descricao()
        elif b in ('galinha', 'galo'):
            import galinha
            caminho, anims, medidas = gerar_ave(args.saida, args.passo or 0.0018, galo=(b == 'galo'))
            extra = galinha.descricao(galo=(b == 'galo'))
        else:
            raise SystemExit(f'bicho desconhecido: {b}')
        med = medir(caminho)
        dados['bichos'][b] = dict(arquivo=os.path.basename(caminho), **extra, medidas_m=medidas, **med,
                                  animacoes=anims, sequencias=SEQUENCIAS[b])
        print(f'{b}: {med["triangulos"]} triângulos, {med["bytes"] / 1024:.0f} KB, {time.time() - t0:.0f} s')
    ordem = {k: dados['bichos'][k] for k in ('cachorro', 'galinha', 'galo') if k in dados['bichos']}
    dados['bichos'] = ordem
    with open(caminho_json, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)
        f.write('\n')


if __name__ == '__main__':
    main()
