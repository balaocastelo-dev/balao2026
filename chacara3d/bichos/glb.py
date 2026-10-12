"""Leitura e enxugamento de arquivos GLB (sem dependências além do json/struct/numpy).

Depois da exportação do Blender, tira das animações os canais que não mudam nada
(escala sempre 1, posição dos ossos que não se deslocam, osso `raiz` parado) e
remonta o arquivo só com os dados ainda usados.
"""
import json
import struct
import numpy as np

TIPOS = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
COMPS = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT2': 4, 'MAT3': 9, 'MAT4': 16}


def ler(caminho):
    d = open(caminho, 'rb').read()
    magic, versao, total = struct.unpack('<III', d[:12])
    assert magic == 0x46546C67, 'não é GLB'
    pos = 12
    js, binario = None, b''
    while pos < total:
        n, tipo = struct.unpack('<II', d[pos:pos + 8])
        bloco = d[pos + 8:pos + 8 + n]
        if tipo == 0x4E4F534A:
            js = json.loads(bloco.decode('utf-8'))
        elif tipo == 0x004E4942:
            binario = bloco
        pos += 8 + n
    return js, binario


def escrever(caminho, js, binario):
    texto = json.dumps(js, separators=(',', ':'), ensure_ascii=False).encode('utf-8')
    texto += b' ' * ((4 - len(texto) % 4) % 4)
    binario = binario + b'\0' * ((4 - len(binario) % 4) % 4)
    total = 12 + 8 + len(texto) + 8 + len(binario)
    with open(caminho, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, total))
        f.write(struct.pack('<II', len(texto), 0x4E4F534A))
        f.write(texto)
        f.write(struct.pack('<II', len(binario), 0x004E4942))
        f.write(binario)


def acessor(js, binario, i):
    """Dados de um accessor como array numpy (normalizado vira float)."""
    a = js['accessors'][i]
    bv = js['bufferViews'][a['bufferView']]
    tipo = TIPOS[a['componentType']]
    nc = COMPS[a['type']]
    ini = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    passo = bv.get('byteStride', 0)
    tam = np.dtype(tipo).itemsize * nc
    if passo and passo != tam:
        bruto = np.frombuffer(binario, dtype=np.uint8, count=passo * a['count'], offset=ini).reshape(a['count'], passo)
        arr = bruto[:, :tam].copy().view(tipo).reshape(a['count'], nc)
    else:
        arr = np.frombuffer(binario, dtype=tipo, count=a['count'] * nc, offset=ini).reshape(a['count'], nc)
    if a.get('normalized'):
        arr = arr.astype(np.float64) / np.iinfo(tipo).max
    return arr


def enxugar_animacoes(js, binario, manter_posicao=('quadril',), tirar_nos=('raiz',)):
    """Tira canais inúteis das animações e remonta o binário."""
    nomes = {i: n.get('name', '') for i, n in enumerate(js['nodes'])}
    for anim in js.get('animations', []):
        novos, usados = [], []
        for ch in anim['channels']:
            alvo = ch['target']
            no = nomes.get(alvo.get('node'), '')
            cam = alvo['path']
            if cam == 'scale' or no in tirar_nos:
                continue
            if cam == 'translation' and no not in manter_posicao:
                continue
            novos.append(ch)
        mapa = {}
        amostras = []
        for ch in novos:
            s = ch['sampler']
            if s not in mapa:
                mapa[s] = len(amostras)
                amostras.append(anim['samplers'][s])
            ch['sampler'] = mapa[s]
        anim['channels'] = novos
        anim['samplers'] = amostras
    return compactar(js, binario)


def compactar(js, binario):
    """Remove accessors e bufferViews que ninguém usa e refaz o buffer."""
    usados = set()

    def marca(i):
        if i is not None:
            usados.add(i)
    for m in js.get('meshes', []):
        for p in m['primitives']:
            for v in p['attributes'].values():
                marca(v)
            marca(p.get('indices'))
            for t in p.get('targets', []):
                for v in t.values():
                    marca(v)
    for s in js.get('skins', []):
        marca(s.get('inverseBindMatrices'))
    for a in js.get('animations', []):
        for s in a['samplers']:
            marca(s['input'])
            marca(s['output'])
    velhos = js['accessors']
    mapa_ac = {}
    novos_ac = []
    for i in sorted(usados):
        mapa_ac[i] = len(novos_ac)
        novos_ac.append(velhos[i])
    for m in js.get('meshes', []):
        for p in m['primitives']:
            p['attributes'] = {k: mapa_ac[v] for k, v in p['attributes'].items()}
            if 'indices' in p:
                p['indices'] = mapa_ac[p['indices']]
            if 'targets' in p:
                p['targets'] = [{k: mapa_ac[v] for k, v in t.items()} for t in p['targets']]
    for s in js.get('skins', []):
        if 'inverseBindMatrices' in s:
            s['inverseBindMatrices'] = mapa_ac[s['inverseBindMatrices']]
    for a in js.get('animations', []):
        for s in a['samplers']:
            s['input'] = mapa_ac[s['input']]
            s['output'] = mapa_ac[s['output']]
    js['accessors'] = novos_ac
    # bufferViews
    bv_usados = sorted({a['bufferView'] for a in novos_ac if 'bufferView' in a} |
                       {im['bufferView'] for im in js.get('images', []) if 'bufferView' in im})
    novo_bin = bytearray()
    mapa_bv = {}
    novos_bv = []
    for i in bv_usados:
        bv = dict(js['bufferViews'][i])
        ini = bv.get('byteOffset', 0)
        dados = binario[ini:ini + bv['byteLength']]
        while len(novo_bin) % 4:
            novo_bin.append(0)
        bv['byteOffset'] = len(novo_bin)
        bv['buffer'] = 0
        novo_bin.extend(dados)
        mapa_bv[i] = len(novos_bv)
        novos_bv.append(bv)
    for a in novos_ac:
        if 'bufferView' in a:
            a['bufferView'] = mapa_bv[a['bufferView']]
    for im in js.get('images', []):
        if 'bufferView' in im:
            im['bufferView'] = mapa_bv[im['bufferView']]
    js['bufferViews'] = novos_bv
    js['buffers'] = [{'byteLength': len(novo_bin)}]
    return js, bytes(novo_bin)
