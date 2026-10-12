"""Gera os adereços dos cenários da Chácara 3D num único GLB (+ aderecos.json).

Uso (Python com o Blender como módulo, igual a `modelo/` e `bichos/`):

    python aderecos.py                      # todos -> ../../public/chacara3d/cenarios/
    python aderecos.py --so bolo,cortador_grama --saida /tmp/x   # só alguns (para conferir)

Cinco cenários: aniversário, cineminha à noite, trabalho na chácara, piscina com
churrasco e rave. Cada adereço é um nó raiz com o nome combinado (o motor clona
pelo nome). Tudo é modelado por código, sem marcas, e sai igual a cada execução.
"""
import argparse
import json
import math
import os
import re
import sys
import time

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
sys.path.insert(0, os.path.join(AQUI, '..', 'bichos'))

import bpy  # noqa: E402
import numpy as np  # noqa: E402

import base as B  # noqa: E402
import glb  # noqa: E402
import materiais as MAT  # noqa: E402
import aniversario  # noqa: E402
import cinema  # noqa: E402
import trabalho  # noqa: E402
import piscina  # noqa: E402
import rave  # noqa: E402

SAIDA_PADRAO = os.path.normpath(os.path.join(AQUI, '..', '..', 'public', 'chacara3d', 'cenarios'))

CENARIOS = [
    ('aniversario', 'Festa de aniversário', aniversario.ADERECOS),
    ('cinema', 'Reunião no cineminha à noite', cinema.ADERECOS),
    ('trabalho', 'Trabalhadores limpando a chácara, colhendo frutas e cortando grama', trabalho.ADERECOS),
    ('piscina', 'Festa na piscina com churrasqueira lotada', piscina.ADERECOS),
    ('rave', 'Rave lotada à noite', rave.ADERECOS),
]

CONVENCOES = {
    'unidade': 'metro',
    'eixos': 'glTF: Y para cima; a frente do objeto olha para +Z; a direita do objeto (vista de quem está de frente para ele) é -X',
    'origem': 'no ponto de apoio: no chão (y = 0), no centro da base',
    'origem_de_mao': 'objetos de segurar na mão têm a origem no ponto onde a mão pega e o cabo/eixo ao longo de +Y',
    'duas_pegas': 'objetos de duas mãos têm filhos vazios pega_d (mão direita) e pega_e (mão esquerda); nas ferramentas de cabo comprido a origem fica na pega_d',
    'apoio': 'objetos de mão que também ficam sobre a mesa (copo_festa, lata, copo_drink) têm o filho vazio apoio no fundo: para pousar, ponha o apoio sobre a superfície',
    'clonar': 'clonar o nó raiz pelo nome (ex.: gltf.scene.getObjectByName("bolo").clone()) e zerar a posição do clone antes de pôr no lugar; os raízes estão todos na origem',
    'baloes': 'cada cor de balão é um material próprio (balao_vermelho, balao_rosa, balao_branco, balao_dourado, balao_azul, balao_amarelo, balao_lilas), compartilhado entre cacho_baloes e arco_baloes: para trocar o tema, mudar a cor do material (ou clonar o material no clone)',
    'emissivos': 'materiais que o motor acende: ' + ', '.join(MAT.EMISSIVOS_COMBINADOS) + ' (emissiveIntensity vem de KHR_materials_emissive_strength)',
    'materiais': 'só MeshStandardMaterial (cor, rugosidade, metálico, normal, emissão); vidro e bebida com mistura (BLEND); folhas secas e tela da peneira com recorte (MASK)',
    'sombras': 'castShadow/receiveShadow ficam por conta do motor; as malhas são fechadas onde dá, e os tecidos finos são de dupla face',
}


# objetos de mão (origem na pega) e a faixa (origem na linha das pontas): não vão para o chão
NAO_ASSENTAR = {'faixa_parabens', 'copo_festa', 'lata', 'copo_drink', 'espeto_carne', 'espeto_linguica', 'pegador',
                'bastao_neon', 'rastelo', 'vassoura', 'peneira_piscina'}


def assentar(raiz):
    """Se alguma parte passou abaixo do chão (cravos do pneu, ruído), sobe tudo até encostar em z = 0."""
    import mathutils
    zs = []
    for ob in [raiz] + list(raiz.children_recursive):
        if ob.type == 'MESH' and len(ob.data.vertices):
            M = ob.matrix_world if ob is not raiz else mathutils.Matrix.Identity(4)
            v = B.verts(ob)
            v4 = np.c_[v, np.ones(len(v))] @ np.array(M).T
            zs.append(v4[:, 2].min())
    bpy.context.view_layer.update()
    zmin = min(zs)
    if zmin < -0.0005:
        B.mover(raiz, (0, 0, -zmin))
        for c in raiz.children:
            c.location.z += -zmin


def construir(so=None):
    B.limpar_cena()
    raizes = []
    for chave, titulo, lista in CENARIOS:
        for item in lista:
            nome, fn, desc = item[0], item[1], item[2]
            if so and nome not in so:
                continue
            t0 = time.time()
            raiz = fn()
            if nome not in NAO_ASSENTAR:
                assentar(raiz)
            raiz.name = nome
            raiz.data.name = nome if raiz.data else nome
            raizes.append((chave, nome, desc, raiz))
            print(f'  {nome:22s} {time.time() - t0:5.1f} s  {B.contar_tris(raiz) if raiz.type == "MESH" else 0:6d} tri', flush=True)
    # nada de peça solta: só ficam os raízes e seus filhos
    manter = set()
    for _, _, _, r in raizes:
        manter.add(r.name)
        for c in r.children_recursive:
            manter.add(c.name)
    soltas = [o for o in bpy.data.objects if o.name not in manter]
    if soltas:
        print('  peças soltas removidas:', sorted(o.name for o in soltas)[:12], len(soltas))
    for o in soltas:
        bpy.data.objects.remove(o)
    return raizes


def exportar(caminho):
    bpy.ops.export_scene.gltf(
        filepath=caminho, export_format='GLB', use_selection=False,
        export_yup=True, export_apply=False, export_texcoords=True, export_normals=True,
        export_tangents=False, export_materials='EXPORT', export_image_format='AUTO',
        export_vertex_color='ACTIVE', export_all_vertex_colors=False,
        export_active_vertex_color_when_no_material=True,
        export_cameras=False, export_lights=False, export_extras=False,
        export_animations=False, export_skins=False, export_morph=False)


# ----------------------------------------------------------------- pós-processamento

MANTER_UV = {'tela_led'}


def _tem_textura(m):
    return any(k in m for k in ('baseColorTexture', 'normalTexture')) or \
        'baseColorTexture' in m.get('pbrMetallicRoughness', {}) or 'emissiveTexture' in m


def _novo_acessor(js, binario, arr, tipo, alvo=34962, normalizado=False, minmax=False):
    """Acrescenta um accessor (com bufferView próprio) ao fim do binário."""
    comp = {np.float32: 5126, np.int8: 5120, np.uint8: 5121, np.int16: 5122, np.uint16: 5123, np.uint32: 5125}
    arr = np.ascontiguousarray(arr)
    dados = arr.tobytes()
    off = len(binario)
    pad = (4 - off % 4) % 4
    binario += b'\0' * pad
    off += pad
    passo = arr.shape[1] * arr.dtype.itemsize if arr.ndim == 2 else 0
    bv = {'buffer': 0, 'byteOffset': off, 'byteLength': len(dados)}
    if alvo:
        bv['target'] = alvo
    # atributos de vértice precisam de passo múltiplo de 4
    if alvo == 34962 and passo % 4:
        largura = passo + (4 - passo % 4)
        cheio = np.zeros((arr.shape[0], largura), dtype=np.uint8)
        cheio[:, :passo] = arr.view(np.uint8).reshape(arr.shape[0], passo)
        dados = cheio.tobytes()
        bv['byteLength'] = len(dados)
        bv['byteStride'] = largura
    binario += dados
    js['bufferViews'].append(bv)
    tipos = {1: 'SCALAR', 2: 'VEC2', 3: 'VEC3', 4: 'VEC4'}
    a = {'bufferView': len(js['bufferViews']) - 1, 'componentType': comp[arr.dtype.type],
         'count': int(arr.shape[0]), 'type': tipos[arr.shape[1] if arr.ndim == 2 else 1]}
    if normalizado:
        a['normalized'] = True
    if minmax:
        a['min'] = arr.min(axis=0).tolist()
        a['max'] = arr.max(axis=0).tolist()
    js['accessors'].append(a)
    return len(js['accessors']) - 1, binario


def pos_processar(caminho, nomes_raiz, quantizar=True):
    js, binario = glb.ler(caminho)
    binario = bytearray(binario)
    # 1) nomes dos nós sem o sufixo .001 do Blender
    for n in js['nodes']:
        if 'name' in n:
            n['name'] = re.sub(r'\.\d{3}$', '', n['name'])
    for m in js.get('meshes', []):
        m['name'] = re.sub(r'\.\d{3}$', '', m.get('name', ''))
    # 2) materiais: dupla face, mistura/recorte, sem extensões que pedem o material "físico"
    for m in js['materials']:
        info = MAT.info_gltf(m['name'])
        m['doubleSided'] = info['doubleSided']
        if not m['doubleSided']:
            m.pop('doubleSided')
        m['alphaMode'] = info['alphaMode']
        if info['alphaMode'] == 'MASK':
            m['alphaCutoff'] = info['alphaCutoff']
        else:
            m.pop('alphaCutoff', None)
        if info['alphaMode'] == 'OPAQUE':
            m.pop('alphaMode')
        ext = m.get('extensions', {})
        for k in list(ext):
            if k not in ('KHR_materials_emissive_strength',):
                ext.pop(k)
        if not ext:
            m.pop('extensions', None)
    usadas = set()
    for m in js['materials']:
        for k in list(m.get('extensions', {})):
            usadas.add(k)
    # 3) primitivas: tira UV de quem não tem textura e cor de vértice toda branca
    tem_tex = {i: _tem_textura(m) or m['name'] in MANTER_UV for i, m in enumerate(js['materials'])}
    for me in js['meshes']:
        for p in me['primitives']:
            at = p['attributes']
            if not tem_tex.get(p.get('material'), False):
                for k in [k for k in at if k.startswith('TEXCOORD')]:
                    at.pop(k)
            if 'COLOR_0' in at:
                c = glb.acessor(js, bytes(binario), at['COLOR_0'])
                if np.all(c[:, :3] > 0.995):
                    at.pop('COLOR_0')
    # 4) quantização (KHR_mesh_quantization): normal em int8, UV em uint16 quando cabe em 0..1,
    #    cor de vértice em uint8
    if quantizar:
        for me in js['meshes']:
            for p in me['primitives']:
                at = p['attributes']
                if 'NORMAL' in at:
                    nrm = glb.acessor(js, bytes(binario), at['NORMAL']).astype(np.float64)
                    q = np.clip(np.round(nrm * 127), -127, 127).astype(np.int8)
                    at['NORMAL'], binario = _novo_acessor(js, binario, q, np.int8, normalizado=True)
                if 'COLOR_0' in at:
                    c = glb.acessor(js, bytes(binario), at['COLOR_0']).astype(np.float64)
                    q = np.clip(np.round(c * 255), 0, 255).astype(np.uint8)
                    at['COLOR_0'], binario = _novo_acessor(js, binario, q, np.uint8, normalizado=True)
                if 'TEXCOORD_0' in at:
                    uv = glb.acessor(js, bytes(binario), at['TEXCOORD_0']).astype(np.float64)
                    if uv.min() >= -1e-6 and uv.max() <= 1 + 1e-6:
                        q = np.clip(np.round(uv * 65535), 0, 65535).astype(np.uint16)
                        at['TEXCOORD_0'], binario = _novo_acessor(js, binario, q, np.uint16, normalizado=True)
        usadas.add('KHR_mesh_quantization')
        js['extensionsRequired'] = sorted(set(js.get('extensionsRequired', [])) | {'KHR_mesh_quantization'})
    js['extensionsUsed'] = sorted(usadas | set(e for e in js.get('extensionsUsed', [])
                                               if e in ('KHR_texture_transform',)))
    if not js['extensionsUsed']:
        js.pop('extensionsUsed')
    js['buffers'] = [{'byteLength': len(binario)}]
    js, binario = glb.compactar(js, bytes(binario))
    # 5) cena: só os raízes, na ordem
    idx = {n.get('name'): i for i, n in enumerate(js['nodes'])}
    js['scenes'][0]['nodes'] = [idx[n] for n in nomes_raiz if n in idx]
    js['asset']['generator'] = 'chacara3d/cenarios/aderecos.py (Blender ' + bpy.app.version_string + ')'
    glb.escrever(caminho, js, binario)
    return js, binario


# ----------------------------------------------------------------- relatório (aderecos.json)

def _matriz_no(n):
    if 'matrix' in n:
        return np.array(n['matrix'], dtype=float).reshape(4, 4).T
    t = np.array(n.get('translation', [0, 0, 0]), dtype=float)
    q = n.get('rotation', [0, 0, 0, 1])
    s = np.array(n.get('scale', [1, 1, 1]), dtype=float)
    x, y, z, w = q
    R = np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                  [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                  [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])
    M = np.eye(4)
    M[:3, :3] = R * s[None, :]
    M[:3, 3] = t
    return M


def relatorio(js, binario, raizes, caminho_glb):
    nos = js['nodes']
    idx = {n.get('name'): i for i, n in enumerate(nos)}
    mats = js['materials']
    saida = {'arquivo': os.path.basename(caminho_glb), 'bytes': os.path.getsize(caminho_glb),
             'convencoes': CONVENCOES, 'cenarios': {}, 'aderecos': {}}
    for chave, titulo, lista in CENARIOS:
        saida['cenarios'][chave] = {'titulo': titulo, 'aderecos': [it[0] for it in lista]}
    total_tris = 0
    for chave, nome, desc, _ in raizes:
        i = idx[nome]
        pts = []
        tris = 0
        usados = []
        especiais = {}

        def visitar(k, M, raiz=False):
            nonlocal tris
            n = nos[k]
            M2 = M @ _matriz_no(n) if not raiz else np.eye(4)
            if 'mesh' in n:
                for p in js['meshes'][n['mesh']]['primitives']:
                    pos = glb.acessor(js, binario, p['attributes']['POSITION']).astype(float)
                    pts.append(pos @ M2[:3, :3].T + M2[:3, 3])
                    tris += js['accessors'][p['indices']]['count'] // 3
                    mn = mats[p['material']]['name']
                    if mn not in usados:
                        usados.append(mn)
            nm = n.get('name', '')
            if not raiz and re.match(r'^(pega_[de]|cabeca_movel_\d+|inclina_\d+|saida|apoio|ponta_[de]|lente|bocal)$', nm):
                especiais[nm] = [round(float(v), 4) for v in M2[:3, 3]]
            for c in n.get('children', []):
                visitar(c, M2)
        visitar(i, np.eye(4), raiz=True)
        P = np.concatenate(pts)
        mn, mx = P.min(axis=0), P.max(axis=0)
        emiss = [m for m in usados if any(c > 0 for c in mats[[x['name'] for x in mats].index(m)].get('emissiveFactor', [0, 0, 0]))]
        item = {
            'cenario': chave,
            'descricao': desc,
            'tamanho_m': {'x': round(float(mx[0] - mn[0]), 3), 'y': round(float(mx[1] - mn[1]), 3), 'z': round(float(mx[2] - mn[2]), 3)},
            'caixa_min': [round(float(v), 3) for v in mn],
            'caixa_max': [round(float(v), 3) for v in mx],
            'triangulos': int(tris),
            'materiais': usados,
        }
        if especiais:
            item['filhos_especiais'] = especiais
        if emiss:
            item['emissivos'] = emiss
        extra = next((it[3] for _, _, lista in CENARIOS for it in lista if it[0] == nome and len(it) > 3), None)
        if extra:
            item['notas'] = extra
        saida['aderecos'][nome] = item
        total_tris += tris
    saida['triangulos_total'] = int(total_tris)
    saida['materiais'] = {
        m['name']: {k: v for k, v in {
            'cor_base_linear': [round(c, 4) for c in m.get('pbrMetallicRoughness', {}).get('baseColorFactor', [1, 1, 1, 1])],
            'rugosidade': m.get('pbrMetallicRoughness', {}).get('roughnessFactor', 1),
            'metalico': m.get('pbrMetallicRoughness', {}).get('metallicFactor', 1),
            'emissivo': m.get('emissiveFactor'),
            'forca_emissao': m.get('extensions', {}).get('KHR_materials_emissive_strength', {}).get('emissiveStrength'),
            'textura': 'baseColorTexture' in m.get('pbrMetallicRoughness', {}) or None,
            'normal': 'normalTexture' in m or None,
            'alphaMode': m.get('alphaMode'),
            'doubleSided': m.get('doubleSided'),
        }.items() if v is not None} for m in mats}
    return saida


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--saida', default=SAIDA_PADRAO)
    ap.add_argument('--so', default='')
    ap.add_argument('--sem-quantizar', action='store_true')
    a = ap.parse_args(sys.argv[1:] if '--' not in sys.argv else sys.argv[sys.argv.index('--') + 1:])
    so = set(x for x in a.so.split(',') if x) or None
    os.makedirs(a.saida, exist_ok=True)
    t0 = time.time()
    raizes = construir(so)
    caminho = os.path.join(a.saida, 'aderecos.glb')
    exportar(caminho)
    js, binario = pos_processar(caminho, [r[1] for r in raizes], quantizar=not a.sem_quantizar)
    rel = relatorio(js, binario, raizes, caminho)
    with open(os.path.join(a.saida, 'aderecos.json'), 'w', encoding='utf-8') as f:
        json.dump(rel, f, ensure_ascii=False, indent=2)
    print(f'{caminho}: {os.path.getsize(caminho) / 1e6:.2f} MB, {rel["triangulos_total"]} triângulos, '
          f'{len(raizes)} adereços, {time.time() - t0:.0f} s')


if __name__ == '__main__':
    main()
