"""Confere os GLB das pessoas depois de gerar (só lê os arquivos, não precisa do Blender).

    python verificar.py                 # os três, em ../../public/chacara3d/pessoas/
    python verificar.py --pasta /tmp/x  # outra pasta

O que confere:
- visuais e animações com os nomes combinados (avisa o que falta ou sobra);
- esqueleto igual nos três arquivos (nomes, ordem e pais);
- pesos: até 4 ossos por vértice, soma exata (255 em uint8), índices válidos;
- máscara COLOR_0 com soma <= 1; materiais `pessoa` e `olhos`;
- triângulos por visual (adulto ~9k, criança ~7k) e tamanho total (<= ~7 MB);
- animações: todos os ossos com rotação, só o `quadril` com translação, valores finitos,
  último quadro igual ao primeiro (laço);
- pés: altura do pé mais baixo em cada quadro (afundando ou flutuando), pé de apoio
  escorregando nas animações de andar (velocidade do pé no chão contra velocidade_m_s);
- sentadas: altura do assento (vértices do bumbum) contra o combinado nas notas.
Sai com código 1 se achar erro; os avisos não reprovam.
"""
import argparse
import json
import os
import struct
import sys

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
PASTA = os.path.normpath(os.path.join(AQUI, '..', '..', 'public', 'chacara3d', 'pessoas'))

VISUAIS = {
    'homem': ['casual', 'camisa', 'regata', 'praia', 'praia_2', 'trabalho', 'noite'],
    'mulher': ['casual', 'vestido', 'praia', 'praia_2', 'trabalho', 'noite'],
    'crianca': ['menino', 'menina', 'praia_menino', 'praia_menina'],
}
ANIMACOES = [
    'parado', 'parado_2', 'conversando', 'ouvindo', 'andando', 'andando_devagar', 'correndo', 'acenando',
    'batendo_palmas', 'rindo', 'bebendo',
    'sentado', 'sentado_conversando', 'sentado_comendo', 'sentado_assistindo', 'sentado_chao', 'sentado_borda',
    'deitado',
    'dancando_1', 'dancando_2', 'dancando_3', 'pulando', 'dj', 'cantando_parabens',
    'na_agua', 'nadando_parado',
    'cortando_grama', 'rastelando', 'varrendo', 'colhendo_alto', 'carregando_cesto', 'limpando_piscina', 'grelhando',
]
LIMITE_TRI = {'homem': 9000, 'mulher': 9000, 'crianca': 7000}
# animações em que nenhum pé precisa tocar o chão em algum momento
SEM_CHAO = {'pulando', 'correndo', 'nadando_parado', 'sentado_borda', 'deitado', 'sentado_chao'}
ANDAR = {'andando', 'andando_devagar', 'correndo', 'cortando_grama', 'carregando_cesto'}
ASSENTO = {'sentado': 0.45, 'sentado_conversando': 0.45, 'sentado_comendo': 0.45, 'sentado_assistindo': 0.45,
           'sentado_borda': 0.0, 'sentado_chao': 0.0}

TIPOS_C = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
N_COMP = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}
NORM = {np.int8: 127.0, np.uint8: 255.0, np.int16: 32767.0, np.uint16: 65535.0}


class GLB:
    def __init__(self, caminho):
        b = open(caminho, 'rb').read()
        magico, _ver, total = struct.unpack('<III', b[:12])
        assert magico == 0x46546C67 and total == len(b), 'cabeçalho GLB inválido'
        n0, _ = struct.unpack('<II', b[12:20])
        self.js = json.loads(b[20:20 + n0])
        o = 20 + n0
        n1, _ = struct.unpack('<II', b[o:o + 8])
        self.bin = b[o + 8:o + 8 + n1]
        self.tamanho = len(b)

    def acessor(self, i, cru=False):
        a = self.js['accessors'][i]
        bv = self.js['bufferViews'][a['bufferView']]
        dt = TIPOS_C[a['componentType']]
        nc = N_COMP[a['type']]
        item = np.dtype(dt).itemsize * nc
        passo = bv.get('byteStride', item)
        ini = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
        n = a['count']
        buf = np.frombuffer(self.bin, np.uint8, count=passo * (n - 1) + item, offset=ini)
        buf = np.concatenate([buf, np.zeros(passo - item, np.uint8)]).reshape(n, passo)[:, :item]
        arr = np.ascontiguousarray(buf).view(dt).reshape(n, nc)
        if cru or not a.get('normalized'):
            return arr.astype(np.float64) if dt == np.float32 else arr
        return np.maximum(arr.astype(np.float64) / NORM[dt], -1.0)


def quat_para_mat(q):
    x, y, z, w = q / np.linalg.norm(q)
    return np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                     [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                     [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])


def amostrar(t, ts, vs):
    """Interpolação linear (quatérnios por nlerp, suficiente a 30 qps)."""
    if t <= ts[0]:
        return vs[0]
    if t >= ts[-1]:
        return vs[-1]
    i = np.searchsorted(ts, t) - 1
    w = (t - ts[i]) / max(ts[i + 1] - ts[i], 1e-9)
    a, b = vs[i], vs[i + 1]
    if len(a) == 4 and np.dot(a, b) < 0:
        b = -b
    return a * (1 - w) + b * w


class Pessoa:
    def __init__(self, caminho):
        self.g = GLB(caminho)
        js = self.g.js
        self.nos = js['nodes']
        pele = js['skins'][0]
        self.juntas = pele['joints']
        self.ibm = self.g.acessor(pele['inverseBindMatrices']).reshape(-1, 4, 4).transpose(0, 2, 1)
        self.nomes = [self.nos[j]['name'] for j in self.juntas]
        self.pai = {}
        for i, n in enumerate(self.nos):
            for c in n.get('children', []):
                self.pai[c] = i
        self.anims = {a['name']: a for a in js.get('animations', [])}
        self.visuais = {}
        for i, n in enumerate(self.nos):
            if 'mesh' in n:
                self.visuais[n['name']] = js['meshes'][n['mesh']]

    def local_repouso(self, j):
        n = self.nos[j]
        M = np.eye(4)
        if 'rotation' in n:
            M[:3, :3] = quat_para_mat(np.array(n['rotation']))
        if 'translation' in n:
            M[:3, 3] = n['translation']
        return M

    def canais(self, nome):
        a = self.anims[nome]
        out = {}
        for c in a['channels']:
            s = a['samplers'][c['sampler']]
            ts = self.g.acessor(s['input'])[:, 0]
            vs = self.g.acessor(s['output'])
            out[(c['target']['node'], c['target']['path'])] = (ts, vs)
        return out

    def mundos(self, canais, t):
        """Matrizes no mundo das juntas no tempo t."""
        W = {}
        for j in self.juntas:
            M = self.local_repouso(j)
            if (j, 'rotation') in canais:
                ts, vs = canais[(j, 'rotation')]
                M[:3, :3] = quat_para_mat(amostrar(t, ts, vs))
            if (j, 'translation') in canais:
                ts, vs = canais[(j, 'translation')]
                M[:3, 3] = amostrar(t, ts, vs)
            p = self.pai.get(j)
            W[j] = (W[p] @ M) if p in W else M
        return W

    def primitiva(self, visual, k=0):
        p = self.visuais[visual]['primitives'][k]
        at = p['attributes']
        V = self.g.acessor(at['POSITION'])
        Jn = self.g.acessor(at['JOINTS_0'], cru=True).astype(int)
        Wc = self.g.acessor(at['WEIGHTS_0'], cru=True).astype(int)
        C = self.g.acessor(at['COLOR_0']) if 'COLOR_0' in at else None
        F = self.g.acessor(p['indices'], cru=True).reshape(-1, 3)
        return V, Jn, Wc, C, F, p

    def pele(self, V, Jn, Wc, mundos):
        S = np.stack([mundos[j] @ self.ibm[i] for i, j in enumerate(self.juntas)])
        Vh = np.c_[V, np.ones(len(V))]
        out = np.zeros((len(V), 3))
        for k in range(4):
            Mk = S[Jn[:, k]]
            out += (Wc[:, k] / 255.0)[:, None] * np.einsum('nij,nj->ni', Mk, Vh)[:, :3]
        return out


def verificar(pasta):
    erros, avisos = [], []
    info = {}
    try:
        dados = json.load(open(os.path.join(pasta, 'pessoas.json'), encoding='utf-8'))
    except Exception as e:
        dados = {'pessoas': {}}
        erros.append(f'pessoas.json: {e}')
    esqueleto_ref = None
    total = 0
    for tipo in ('homem', 'mulher', 'crianca'):
        cam = os.path.join(pasta, tipo + '.glb')
        if not os.path.exists(cam):
            erros.append(f'{tipo}.glb não existe')
            continue
        p = Pessoa(cam)
        total += p.g.tamanho
        print(f'\n== {tipo}.glb  {p.g.tamanho / 1024:.0f} KB')
        js = p.g.js
        # esqueleto
        esq = [(p.nomes[i], p.nos[p.pai[j]]['name'] if p.pai.get(j) in p.juntas else None)
               for i, j in enumerate(p.juntas)]
        if esqueleto_ref is None:
            esqueleto_ref = esq
        elif esq != esqueleto_ref:
            erros.append(f'{tipo}: esqueleto diferente do primeiro arquivo')
        # materiais
        mats = [m['name'] for m in js['materials']]
        if set(mats) != {'pessoa', 'olhos'}:
            erros.append(f'{tipo}: materiais {mats}')
        # visuais
        vis = list(p.visuais)
        falta = [v for v in VISUAIS[tipo] if v not in vis]
        sobra = [v for v in vis if v not in VISUAIS[tipo]]
        if falta:
            erros.append(f'{tipo}: visuais faltando {falta}')
        if sobra:
            avisos.append(f'{tipo}: visuais a mais {sobra}')
        for v in vis:
            tri = 0
            for k, prim in enumerate(p.visuais[v]['primitives']):
                V, Jn, Wc, C, F, pr = p.primitiva(v, k)
                tri += len(F)
                s = Wc.sum(1)
                if not np.all(s == 255):
                    erros.append(f'{tipo}/{v}: {np.sum(s != 255)} vértices com soma de pesos != 255')
                if Jn.max() >= len(p.juntas):
                    erros.append(f'{tipo}/{v}: índice de osso inválido')
                if not np.all(np.isfinite(V)):
                    erros.append(f'{tipo}/{v}: posição não finita')
                mat = js['materials'][pr['material']]['name']
                if mat == 'pessoa':
                    if C is None:
                        erros.append(f'{tipo}/{v}: sem COLOR_0')
                    elif C.sum(1).max() > 1.02:
                        erros.append(f'{tipo}/{v}: máscara com soma {C.sum(1).max():.2f} > 1')
            lim = LIMITE_TRI[tipo]
            marca = '' if tri <= lim * 1.06 else '  << acima de ~' + str(lim)
            if tri > lim * 1.06:
                avisos.append(f'{tipo}/{v}: {tri} triângulos (alvo ~{lim})')
            print(f'   visual {v:14s} {tri:6d} triângulos{marca}')
        # animações
        nomes = list(p.anims)
        falta = [a for a in ANIMACOES if a not in nomes]
        sobra = [a for a in nomes if a not in ANIMACOES]
        if falta:
            erros.append(f'{tipo}: animações faltando {falta}')
        if sobra:
            avisos.append(f'{tipo}: animações a mais {sobra}')
        no_quadril = p.juntas[p.nomes.index('quadril')]
        V, Jn, Wc, C, F, _ = p.primitiva(vis[0], 0)
        dom = np.array(p.nomes)[Jn[np.arange(len(Jn)), Wc.argmax(1)]]
        pe_e = np.isin(dom, ['pe_e', 'dedos_pe_e'])
        pe_d = np.isin(dom, ['pe_d', 'dedos_pe_d'])
        bumbum = np.isin(dom, ['quadril', 'coxa_e', 'coxa_d'])
        meta = dados.get('pessoas', {}).get(tipo, {}).get('animacoes', {})
        print('   animação              dur(s)  pé mais baixo (min/máx por quadro)  escorrega  assento')
        for nome in nomes:
            a = p.anims[nome]
            can = p.canais(nome)
            rot = {n for (n, c) in can if c == 'rotation'}
            tra = {n for (n, c) in can if c == 'translation'}
            if rot != set(p.juntas):
                erros.append(f'{tipo}/{nome}: {len(set(p.juntas) - rot)} ossos sem rotação')
            if tra != {no_quadril}:
                erros.append(f'{tipo}/{nome}: translação em ossos além do quadril')
            dur = max(ts[-1] for ts, _ in can.values())
            for (n, c), (ts, vs) in can.items():
                if not np.all(np.isfinite(vs)):
                    erros.append(f'{tipo}/{nome}: valores não finitos')
                    break
                if abs(ts[-1] - dur) > 1e-4 or ts[0] != 0:
                    erros.append(f'{tipo}/{nome}: canal com tempos fora do laço')
                    break
                a0, a1 = vs[0], vs[-1]
                if c == 'rotation' and np.dot(a0, a1) < 0:
                    a1 = -a1
                if np.abs(a0 - a1).max() > 2e-3:
                    erros.append(f'{tipo}/{nome}: laço não fecha em {p.nos[n]["name"]} ({c})')
                    break
            # pés, escorregão e assento
            n_q = int(round(dur * 30))
            baixos, pes, assento = [], [], []
            for q in range(n_q):
                Wm = p.mundos(can, q / 30)
                Pe = p.pele(V[pe_e], Jn[pe_e], Wc[pe_e], Wm)
                Pd = p.pele(V[pe_d], Jn[pe_d], Wc[pe_d], Wm)
                baixos.append(min(Pe[:, 1].min(), Pd[:, 1].min()))
                pes.append((Pe[:, 1].min(), Pe[:, 2].mean(), Pd[:, 1].min(), Pd[:, 2].mean()))
                if nome in ASSENTO:
                    # só o que fica em cima do assento: atrás dos joelhos (como no ajuste das sentadas)
                    Pb = p.pele(V[bumbum], Jn[bumbum], Wc[bumbum], Wm)
                    zk = min(Wm[p.juntas[p.nomes.index('canela_e')]][2, 3], Wm[p.juntas[p.nomes.index('canela_d')]][2, 3])
                    sob = Pb[:, 2] < zk - 0.12
                    assento.append(Pb[sob, 1].min() if sob.any() else Pb[:, 1].min())
            baixos = np.array(baixos)
            pes = np.array(pes)
            txt_esc = ''
            v = meta.get(nome, {}).get('velocidade_m_s')
            if nome in ANDAR and v:
                erro_v = []
                for yi, zi in ((0, 1), (2, 3)):
                    dz = (np.roll(pes[:, zi], -1) - pes[:, zi]) * 30
                    apoio = pes[:, yi] < pes[:, yi].min() + 0.025
                    apoio &= np.roll(apoio, -1)
                    if apoio.any():
                        erro_v.append(np.median(np.abs(dz[apoio] + v)))
                e = max(erro_v) if erro_v else 0.0
                txt_esc = f'{e:5.2f} m/s'
                if e > 0.25 * v:
                    avisos.append(f'{tipo}/{nome}: pé de apoio escorrega {e:.2f} m/s (andando a {v:.2f})')
            # ferramenta de cabo presa na pega_d: a mão esquerda tem de estar sobre o eixo +Y
            fer = meta.get(nome, {}).get('ferramenta') or {}
            if 'mao_esquerda_em_y' in fer:
                jd, je = p.juntas[p.nomes.index('pega_d')], p.juntas[p.nomes.index('pega_e')]
                fora = []
                for q in range(0, n_q, 3):
                    Wm = p.mundos(can, q / 30)
                    o, y, e = Wm[jd][:3, 3], Wm[jd][:3, 1], Wm[je][:3, 3]
                    fora.append(np.linalg.norm(e - o - ((e - o) @ y) * y))
                if max(fora) > 0.025:
                    avisos.append(f'{tipo}/{nome}: mão esquerda a {max(fora) * 100:.1f} cm do cabo')
            txt_ass = ''
            if assento:
                ya = float(np.mean(assento))
                txt_ass = f'{ya:5.2f} m'
                alvo = ASSENTO[nome]
                if abs(ya - alvo) > 0.04:
                    avisos.append(f'{tipo}/{nome}: assento a {ya:.2f} m (combinado {alvo:.2f})')
            if nome not in ('sentado_borda', 'nadando_parado') and baixos.min() < -0.015:
                avisos.append(f'{tipo}/{nome}: pé afunda {baixos.min() * 100:.1f} cm')
            # criança na cadeira de adulto (assento a 0,45 m): pés pendurados, de propósito
            pendurado = tipo == 'crianca' and nome.startswith('sentado')
            if nome not in SEM_CHAO and not pendurado:
                if baixos.max() > 0.03:
                    avisos.append(f'{tipo}/{nome}: pé flutua {baixos.max() * 100:.1f} cm')
            print(f'   {nome:20s} {dur:6.2f}  {baixos.min() * 100:6.1f} / {baixos.max() * 100:5.1f} cm'
                  f'                  {txt_esc:9s}  {txt_ass}')
        info[tipo] = p
    print(f'\ntotal: {total / 1024 / 1024:.2f} MB')
    if total > 7.3 * 1024 * 1024:
        avisos.append(f'total {total / 1024 / 1024:.2f} MB acima de ~7 MB')
    for a in avisos:
        print('AVISO:', a)
    for e in erros:
        print('ERRO:', e)
    print('ok' if not erros else f'{len(erros)} erro(s)')
    return not erros


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--pasta', default=PASTA)
    a = ap.parse_args()
    sys.exit(0 if verificar(a.pasta) else 1)


if __name__ == '__main__':
    main()
