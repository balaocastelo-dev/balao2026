"""Gravação do GLB das pessoas (sem o exportador do Blender: o arquivo é montado aqui).

Assim os quadros dos ossos ficam exatamente como definidos em `ossos.py` (rotação de
repouso identidade, menos as pegas), e os atributos saem compactos:
POSITION/NORMAL float, TEXCOORD_0 uint16 normalizado, COLOR_0 RGBA uint8 normalizado
(máscara), JOINTS_0 uint8, WEIGHTS_0 uint8 normalizado (soma exata 255).
As rotações das animações vão em int16 normalizado (permitido no glTF 2.0).
"""
import json
import struct

import numpy as np


class Escritor:
    def __init__(self):
        self.bin = bytearray()
        self.js = {'asset': {'version': '2.0'}, 'scenes': [{'nodes': []}], 'scene': 0, 'nodes': [], 'meshes': [],
                   'accessors': [], 'bufferViews': [], 'buffers': [], 'materials': [], 'animations': [],
                   'skins': [], 'textures': [], 'images': [], 'samplers': []}

    # ------------------------------------------------------------------ dados
    def _alinha(self, n=4):
        while len(self.bin) % n:
            self.bin.append(0)

    def vista(self, dados, alvo=None):
        self._alinha()
        ini = len(self.bin)
        self.bin.extend(dados)
        bv = {'buffer': 0, 'byteOffset': ini, 'byteLength': len(dados)}
        if alvo:
            bv['target'] = alvo
        self.js['bufferViews'].append(bv)
        return len(self.js['bufferViews']) - 1

    def acessor(self, arr, tipo, comp, normalizado=False, alvo=None, minmax=False):
        arr = np.ascontiguousarray(arr)
        bv = self.vista(arr.tobytes(), alvo)
        n = arr.shape[0]
        a = {'bufferView': bv, 'componentType': comp, 'count': int(n), 'type': tipo}
        if normalizado:
            a['normalized'] = True
        if minmax:
            a2 = arr.reshape(n, -1)
            a['min'] = [float(x) for x in a2.min(0)]
            a['max'] = [float(x) for x in a2.max(0)]
        self.js['accessors'].append(a)
        return len(self.js['accessors']) - 1

    # ------------------------------------------------------------------ texturas e materiais
    def imagem(self, dados, mime):
        bv = self.vista(dados)
        self.js['images'].append({'bufferView': bv, 'mimeType': mime})
        if not self.js['samplers']:
            self.js['samplers'].append({'magFilter': 9729, 'minFilter': 9987, 'wrapS': 33071, 'wrapT': 33071})
        self.js['textures'].append({'source': len(self.js['images']) - 1, 'sampler': 0})
        return len(self.js['textures']) - 1

    def material(self, nome, textura=None, rug=0.8, metal=0.0, extras=None):
        m = {'name': nome, 'pbrMetallicRoughness': {'baseColorFactor': [1, 1, 1, 1], 'metallicFactor': metal,
                                                     'roughnessFactor': rug}}
        if textura is not None:
            m['pbrMetallicRoughness']['baseColorTexture'] = {'index': textura}
        if extras:
            m['extras'] = extras
        self.js['materials'].append(m)
        return len(self.js['materials']) - 1

    # ------------------------------------------------------------------ malhas
    def primitiva(self, V, N, UV, COR, J, W, F, material, escala_pos=None):
        """Com `escala_pos` (KHR_mesh_quantization): posição em int16 normalizado (valor = P / escala_pos,
        a escala vai nas matrizes inversas de ligação da pele) e normal em int8 normalizado."""
        if escala_pos:
            q = np.clip(np.round(np.asarray(V) / escala_pos * 32767), -32767, 32767).astype(np.int16)
            q4 = np.zeros((len(q), 4), np.int16)
            q4[:, :3] = q
            bv = self.vista(q4.tobytes(), 34962)
            self.js['bufferViews'][bv]['byteStride'] = 8
            self.js['accessors'].append({'bufferView': bv, 'componentType': 5122, 'count': int(len(q)), 'type': 'VEC3',
                                         'normalized': True, 'min': [int(x) for x in q.min(0)],
                                         'max': [int(x) for x in q.max(0)]})
            pos = len(self.js['accessors']) - 1
            Nn = np.asarray(N, float)
            Nn = Nn / np.maximum(np.linalg.norm(Nn, axis=1, keepdims=True), 1e-12)
            n8 = np.zeros((len(Nn), 4), np.int8)
            n8[:, :3] = np.clip(np.round(Nn * 127), -127, 127).astype(np.int8)
            bv = self.vista(n8.tobytes(), 34962)
            self.js['bufferViews'][bv]['byteStride'] = 4
            self.js['accessors'].append({'bufferView': bv, 'componentType': 5120, 'count': int(len(Nn)), 'type': 'VEC3',
                                         'normalized': True})
            nor = len(self.js['accessors']) - 1
            at = {'POSITION': pos, 'NORMAL': nor}
            for e in ('extensionsUsed', 'extensionsRequired'):
                self.js.setdefault(e, [])
                if 'KHR_mesh_quantization' not in self.js[e]:
                    self.js[e].append('KHR_mesh_quantization')
        else:
            V = np.asarray(V, np.float32)
            N = np.asarray(N, np.float32)
            at = {'POSITION': self.acessor(V, 'VEC3', 5126, alvo=34962, minmax=True),
                  'NORMAL': self.acessor(N, 'VEC3', 5126, alvo=34962)}
        if UV is not None:
            uv = np.clip(np.round(np.asarray(UV) * 65535), 0, 65535).astype(np.uint16)
            at['TEXCOORD_0'] = self.acessor(uv, 'VEC2', 5123, normalizado=True, alvo=34962)
        if COR is not None:
            c = np.clip(np.round(np.asarray(COR) * 255), 0, 255).astype(np.uint8)
            at['COLOR_0'] = self.acessor(c, 'VEC4', 5121, normalizado=True, alvo=34962)
        at['JOINTS_0'] = self.acessor(np.asarray(J, np.uint8), 'VEC4', 5121, alvo=34962)
        at['WEIGHTS_0'] = self.acessor(pesos_u8(W), 'VEC4', 5121, normalizado=True, alvo=34962)
        F = np.asarray(F)
        tipo = np.uint16 if F.max() < 65535 else np.uint32
        ind = self.acessor(F.astype(tipo).ravel(), 'SCALAR', 5123 if tipo == np.uint16 else 5125, alvo=34963)
        return {'attributes': at, 'indices': ind, 'material': material, 'mode': 4}

    def malha(self, nome, primitivas):
        self.js['meshes'].append({'name': nome, 'primitives': primitivas})
        return len(self.js['meshes']) - 1

    def no(self, **k):
        self.js['nodes'].append(k)
        return len(self.js['nodes']) - 1

    # ------------------------------------------------------------------ fim
    def gravar(self, caminho):
        js = {k: v for k, v in self.js.items() if v != []}
        self._alinha()
        js['buffers'] = [{'byteLength': len(self.bin)}]
        texto = json.dumps(js, separators=(',', ':'), ensure_ascii=False).encode('utf-8')
        texto += b' ' * ((4 - len(texto) % 4) % 4)
        total = 12 + 8 + len(texto) + 8 + len(self.bin)
        with open(caminho, 'wb') as f:
            f.write(struct.pack('<III', 0x46546C67, 2, total))
            f.write(struct.pack('<II', len(texto), 0x4E4F534A))
            f.write(texto)
            f.write(struct.pack('<II', len(self.bin), 0x004E4942))
            f.write(bytes(self.bin))
        return total


def pesos_u8(W):
    """Pesos em uint8 normalizado com soma exata 255 (o maior absorve o arredondamento)."""
    W = np.asarray(W, float)
    W = W / np.maximum(W.sum(1, keepdims=True), 1e-12)
    q = np.floor(W * 255 + 0.5).astype(int)
    falta = 255 - q.sum(1)
    i = np.argmax(W, axis=1)
    q[np.arange(len(q)), i] += falta
    return np.clip(q, 0, 255).astype(np.uint8)


def quat_de_matriz(R):
    """Matriz 3x3 -> quatérnio (x, y, z, w)."""
    R = np.asarray(R, float)
    t = np.trace(R)
    if t > 0:
        s = np.sqrt(t + 1.0) * 2
        w = 0.25 * s
        x = (R[2, 1] - R[1, 2]) / s
        y = (R[0, 2] - R[2, 0]) / s
        z = (R[1, 0] - R[0, 1]) / s
    elif R[0, 0] > R[1, 1] and R[0, 0] > R[2, 2]:
        s = np.sqrt(1.0 + R[0, 0] - R[1, 1] - R[2, 2]) * 2
        w = (R[2, 1] - R[1, 2]) / s
        x = 0.25 * s
        y = (R[0, 1] + R[1, 0]) / s
        z = (R[0, 2] + R[2, 0]) / s
    elif R[1, 1] > R[2, 2]:
        s = np.sqrt(1.0 + R[1, 1] - R[0, 0] - R[2, 2]) * 2
        w = (R[0, 2] - R[2, 0]) / s
        x = (R[0, 1] + R[1, 0]) / s
        y = 0.25 * s
        z = (R[1, 2] + R[2, 1]) / s
    else:
        s = np.sqrt(1.0 + R[2, 2] - R[0, 0] - R[1, 1]) * 2
        w = (R[1, 0] - R[0, 1]) / s
        x = (R[0, 2] + R[2, 0]) / s
        y = (R[1, 2] + R[2, 1]) / s
        z = 0.25 * s
    q = np.array([x, y, z, w])
    return q / np.linalg.norm(q)


def quats_de_matrizes(Rs):
    q = np.array([quat_de_matriz(R) for R in Rs])
    for i in range(1, len(q)):
        if np.dot(q[i], q[i - 1]) < 0:
            q[i] = -q[i]
    return q


def reduzir_chaves(valores, tol, laco=False):
    """Escolhe as chaves (índices) para que a interpolação linear entre elas não se afaste
    mais que `tol` de nenhum quadro (busca gulosa da frente para trás)."""
    n = len(valores)
    if n <= 2:
        return np.arange(n)
    manter = [0]
    i = 0
    while i < n - 1:
        j = i + 2
        melhor = i + 1
        while j < n:
            t = (np.arange(i + 1, j) - i) / (j - i)
            interp = valores[i][None] + t[:, None] * (valores[j] - valores[i])[None]
            err = np.abs(interp - valores[i + 1:j]).max()
            if err > tol:
                break
            melhor = j
            j += 1
        manter.append(melhor)
        i = melhor
    return np.array(manter)


def gravar_animacao(esc, nome, nos_ossos, rot_locais, trans_quadril, no_quadril, fps=30, tol_rot=0.0015,
                    tol_pos=0.0008):
    """`rot_locais`: dict osso -> array (n, 3, 3); `trans_quadril`: (n, 3) translação local do quadril."""
    canais, amostras = [], []
    n = len(trans_quadril)
    tempos_todos = np.arange(n, dtype=np.float32) / fps
    cache_t = {}

    def tempos(idx):
        k = tuple(idx)
        if k not in cache_t:
            cache_t[k] = esc.acessor(tempos_todos[idx], 'SCALAR', 5126, minmax=True)
        return cache_t[k]

    for osso, Rs in rot_locais.items():
        q = quats_de_matrizes(Rs)
        idx = reduzir_chaves(q, tol_rot)
        qi = np.clip(np.round(q[idx] * 32767), -32767, 32767).astype(np.int16)
        saida = esc.acessor(qi, 'VEC4', 5122, normalizado=True)
        amostras.append({'input': tempos(idx), 'output': saida, 'interpolation': 'LINEAR'})
        canais.append({'sampler': len(amostras) - 1, 'target': {'node': nos_ossos[osso], 'path': 'rotation'}})
    T = np.asarray(trans_quadril, np.float32)
    idx = reduzir_chaves(T, tol_pos)
    saida = esc.acessor(T[idx], 'VEC3', 5126)
    amostras.append({'input': tempos(idx), 'output': saida, 'interpolation': 'LINEAR'})
    canais.append({'sampler': len(amostras) - 1, 'target': {'node': no_quadril, 'path': 'translation'}})
    esc.js['animations'].append({'name': nome, 'channels': canais, 'samplers': amostras})
