"""Confere os GLBs exportados e faz as imagens de prévia a partir deles.

    python verificar.py                       # confere os três
    python verificar.py --previas DIR         # também renderiza as prévias em DIR

O que é conferido (no arquivo, como o motor vai ler):
- caixa em metros, frente em +Z (cabeça na frente da cauda), pé no chão;
- triângulos dentro do orçamento; nenhum NaN; até 4 ossos por vértice e pesos somando 1;
- lista e duração das animações, canais (rotação de todos os ossos, sem escala,
  translação só no osso do corpo), laços que fecham (último quadro = primeiro);
- a importação de volta no Blender funciona e a malha deformada não tem NaN.
"""
import argparse
import json
import math
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import numpy as np  # noqa: E402
import glb  # noqa: E402

PASTA = os.path.normpath(os.path.join(AQUI, '..', '..', 'public', 'chacara3d', 'bichos'))
ORCAMENTO = {'cachorro': 9000, 'galinha': 4500, 'galo': 5500}
OSSO_CORPO = {'cachorro': ('quadril', 'lingua'), 'galinha': ('corpo',), 'galo': ('corpo',)}
OSSO_FRENTE = {'cachorro': 'cabeca', 'galinha': 'cabeca', 'galo': 'cabeca'}
OSSO_TRAS = {'cachorro': 'cauda_3', 'galinha': 'cauda', 'galo': 'cauda'}


def conferir_arquivo(nome, caminho, info_json):
    js, b = glb.ler(caminho)
    rel = {'arquivo': os.path.basename(caminho), 'bytes': os.path.getsize(caminho)}
    nos = js['nodes']
    nomes = [n.get('name', '') for n in nos]
    pele = js['skins'][0]
    juntas = pele['joints']
    tris = 0
    pos_all, w_all, j_all = [], [], []
    mats = []
    nan = False
    for m in js['meshes']:
        for p in m['primitives']:
            pos = glb.acessor(js, b, p['attributes']['POSITION']).astype(float)
            nrm = glb.acessor(js, b, p['attributes']['NORMAL']).astype(float)
            ji = glb.acessor(js, b, p['attributes']['JOINTS_0']).astype(int)
            wi = glb.acessor(js, b, p['attributes']['WEIGHTS_0']).astype(float)
            idx = glb.acessor(js, b, p['indices'])
            tris += len(idx.ravel()) // 3
            nan |= bool(np.isnan(pos).any() or np.isnan(nrm).any() or np.isnan(wi).any())
            mat = js['materials'][p['material']]['name']
            mats.append(mat)
            if 'COLOR_0' in p['attributes']:
                cor = glb.acessor(js, b, p['attributes']['COLOR_0'])
                if mat in ('pelo', 'penas'):
                    s = cor[:, :3].sum(axis=1)
                    rel[f'cor_{mat}'] = dict(componentes=int(cor.shape[1]), min=float(cor.min()), max=float(cor.max()),
                                             soma_rgb_min=round(float(s.min()), 3), soma_rgb_max=round(float(s.max()), 3))
            pos_all.append(pos)
            w_all.append(wi)
            j_all.append(ji)
    P = np.concatenate(pos_all)
    W = np.concatenate(w_all)
    J = np.concatenate(j_all)
    soma = W.sum(axis=1)
    rel['triangulos'] = int(tris)
    rel['orcamento'] = ORCAMENTO[nome]
    rel['dentro_do_orcamento'] = tris <= ORCAMENTO[nome]
    rel['materiais'] = sorted(set(mats))
    rel['pesos_soma_min_max'] = [round(float(soma.min()), 5), round(float(soma.max()), 5)]
    rel['influencias_max'] = int((W > 0).sum(axis=1).max())
    rel['caixa_min'] = P.min(axis=0).round(4).tolist()
    rel['caixa_max'] = P.max(axis=0).round(4).tolist()
    rel['tamanho_m'] = (P.max(axis=0) - P.min(axis=0)).round(3).tolist()
    # frente: vértices presos à cabeça contra os presos à cauda (eixo Z do glTF)
    nome_j = [nomes[j] for j in juntas]
    i_frente = nome_j.index(OSSO_FRENTE[nome])
    i_tras = nome_j.index(OSSO_TRAS[nome])
    dom = J[np.arange(len(J)), W.argmax(axis=1)]
    zf = P[dom == i_frente][:, 2].mean()
    zt = P[dom == i_tras][:, 2].mean()
    rel['frente_mais_z'] = bool(zf > 0.1 and zt < 0)
    rel['z_cabeca_cauda'] = [round(float(zf), 3), round(float(zt), 3)]
    rel['pe_no_chao_y_min'] = round(float(P[:, 1].min()), 4)
    rel['nan'] = nan
    # animações
    anims = {}
    for a in js.get('animations', []):
        dur = 0.0
        canais = {}
        fecha = True
        for ch in a['channels']:
            s = a['samplers'][ch['sampler']]
            t = glb.acessor(js, b, s['input']).ravel()
            v = glb.acessor(js, b, s['output']).astype(float)
            if np.isnan(v).any():
                nan = True
            dur = max(dur, float(t.max()))
            no = nomes[ch['target']['node']]
            canais.setdefault(ch['target']['path'], set()).add(no)
            esperado = info_json.get(a['name'], {}).get('repete', False)
            if esperado and len(v) > 1:
                if ch['target']['path'] == 'rotation':
                    d = 1 - abs(float(np.dot(v[0], v[-1]) / (np.linalg.norm(v[0]) * np.linalg.norm(v[-1]))))
                    fecha &= d < 1e-5
                else:
                    fecha &= float(np.abs(v[0] - v[-1]).max()) < 1e-5
        rot = canais.get('rotation', set())
        juntas_sem_raiz = {nomes[j] for j in juntas} - {'raiz'}
        anims[a['name']] = dict(
            duracao_s=round(dur, 4), repete=info_json.get(a['name'], {}).get('repete'),
            laco_fecha=fecha if info_json.get(a['name'], {}).get('repete') else None,
            rotacao_todos_ossos=juntas_sem_raiz <= rot,
            translacao=sorted(canais.get('translation', set())), escala=sorted(canais.get('scale', set())))
    rel['animacoes'] = anims
    rel['nan'] = nan
    return rel


def reimportar(caminho):
    """Importa o GLB numa cena vazia do Blender e confere a pose de cada animação."""
    import bpy
    for tipo in ('objects', 'meshes', 'armatures', 'materials', 'actions'):
        col = getattr(bpy.data, tipo)
        for it in list(col):
            col.remove(it)
    bpy.context.scene.render.fps = 30
    bpy.ops.import_scene.gltf(filepath=caminho)
    arm = next(o for o in bpy.context.scene.objects if o.type == 'ARMATURE')
    malha = next(o for o in bpy.context.scene.objects if o.type == 'MESH')
    rel = {}
    cena = bpy.context.scene
    for acao in bpy.data.actions:
        ad = arm.animation_data or arm.animation_data_create()
        ad.action = acao
        try:
            if ad.action_slot is None and len(acao.slots):
                ad.action_slot = acao.slots[0]
        except Exception:
            pass
        ini, fim = acao.frame_range
        piores = 0.0
        for f in np.linspace(ini, fim, 5):
            cena.frame_set(int(round(f)))
            dg = bpy.context.evaluated_depsgraph_get()
            me = malha.evaluated_get(dg).to_mesh()
            co = np.zeros(len(me.vertices) * 3)
            me.vertices.foreach_get('co', co)
            malha.evaluated_get(dg).to_mesh_clear()
            if np.isnan(co).any():
                piores = float('nan')
            co = co.reshape(-1, 3)
            piores = min(piores, float(co[:, 2].min())) if not math.isnan(piores) else piores
        rel[acao.name] = {'z_min_blender': round(piores, 4), 'quadros': [int(ini), int(fim)]}
    return rel


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('bichos', nargs='*', default=['cachorro', 'galinha', 'galo'])
    ap.add_argument('--pasta', default=PASTA)
    ap.add_argument('--previas', default=None)
    ap.add_argument('--sem-blender', action='store_true')
    args = ap.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:])
    info = json.load(open(os.path.join(args.pasta, 'bichos.json'), encoding='utf-8'))
    saida = {}
    for nome in args.bichos:
        caminho = os.path.join(args.pasta, f'{nome}.glb')
        rel = conferir_arquivo(nome, caminho, info['bichos'][nome]['animacoes'])
        if not args.sem_blender:
            rel['reimportacao'] = reimportar(caminho)
        saida[nome] = rel
        if args.previas:
            import previa_bichos
            previa_bichos.previas(nome, caminho, args.previas)
    print(json.dumps(saida, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
