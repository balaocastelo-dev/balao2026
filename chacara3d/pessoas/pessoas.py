"""Gera as pessoas animadas da Chácara 3D (homem, mulher e criança) em GLB.

Uso (com o Blender como módulo de Python, como em ../bichos e ../modelo):

    python pessoas.py                     # os três, em ../../public/chacara3d/pessoas/
    python pessoas.py homem               # só um
    python pessoas.py --saida /tmp/x      # outra pasta
    python pessoas.py --anims parado,andando   # só algumas animações (para testar)

Lê só arquivos deste diretório (makehuman/ e cmu/); o resultado sai igual a cada
execução. Além dos GLB grava `pessoas.json` com convenções, visuais e animações.
"""
import argparse
import json
import os
import sys
import time

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)

import numpy as np  # noqa: E402

import animacoes as AN  # noqa: E402
import corpo  # noqa: E402
import exportar  # noqa: E402
import malha as M  # noqa: E402
import mh  # noqa: E402
import ossos as O  # noqa: E402
import pose as PZ  # noqa: E402
import roupas as R  # noqa: E402
import textura as TX  # noqa: E402
import visuais as VI  # noqa: E402

SAIDA_PADRAO = os.path.normpath(os.path.join(AQUI, '..', '..', 'public', 'chacara3d', 'pessoas'))
FPS = 30
ORDEM = ('homem', 'mulher', 'crianca')
DESCRICAO = {
    'homem': 'homem adulto (~1,76 m), corpo do MakeHuman (CC0)',
    'mulher': 'mulher adulta (~1,63 m), corpo do MakeHuman (CC0)',
    'crianca': 'criança de 8–9 anos (~1,30 m), corpo do MakeHuman (CC0)',
}


def preparar_corpo(tipo):
    C = corpo.construir(tipo)
    V, F, UV, W = corpo.decimar(C, corpo.TIPOS[tipo]['tris'])
    Fo, UVo = [], []
    for f, uv in zip(C.olho_F, C.olho_UV):
        for k in range(1, len(f) - 1):
            Fo.append([f[0], f[k], f[k + 1]])
            UVo.append([uv[0], uv[k], uv[k + 1]])
    d = dict(juntas=C.juntas, pega_e=C.quadro_pega_e, pega_d=C.quadro_pega_d, V=V, F=F, UV=UV,
             W=O.limitar(W, 4), olho_V=C.olho_V, olho_F=np.array(Fo), olho_UV=np.array(UVo),
             pe=corpo.pontos_do_pe(C), Vfull=C.V, Fq=C.Fq, Wfull=C.W, cab=C.cab, cau=C.cau,
             marcos=corpo.marcos(C), UVq=C.UVq, alvos=C.alvos_usados)
    return d


def malha_olhos(d):
    UV = np.asarray(d['olho_UV'], float).copy()
    UV[..., 1] = 1.0 - UV[..., 1]
    W = np.zeros((len(d['olho_V']), len(O.NOMES)))
    W[:, O.INDICE['cabeca']] = 1.0
    return M.Malha(d['olho_V'], d['olho_F'], UV, W)


def gerar(tipo, saida, so_anims=None, log=print):
    t0 = time.time()
    d = preparar_corpo(tipo)
    log(f'{tipo}: corpo {len(d["F"])} triângulos ({time.time() - t0:.0f} s)')
    base = R.Base(d, tipo)
    esq = PZ.Esqueleto(d['juntas'], d['pega_e'], d['pega_d'])
    # visuais
    visuais = []
    info_vis = {}
    for nome, f, desc, cats in VI.visuais(base):
        m = f()
        m.W = O.limitar(m.W, 4)
        visuais.append((nome, m))
        info_vis[nome] = dict(descricao=desc, categorias=cats)
    log(f'{tipo}: {len(visuais)} visuais ({time.time() - t0:.0f} s)')
    # textura
    pint = TX.Pintor(base, d, tipo)
    img = pint.tudo()
    tex = TX.para_jpeg(img)
    olho = TX.olho_jpeg(os.path.join(mh.PASTA_MH, 'eyes', 'materials', 'brown_eye.png'))
    log(f'{tipo}: textura {len(tex) // 1024} KB ({time.time() - t0:.0f} s)')
    # animações
    ctx = AN.Ctx(tipo, esq, d['pe'], d['marcos'], d['V'], d['W'])
    anims, info_an = [], {}
    for nome, fn in AN.todas():
        if so_anims and nome not in so_anims:
            continue
        r = fn(ctx)
        poses = r['poses'] + [r['poses'][0]]       # laço: o último quadro repete o primeiro
        rots = {o: [] for o in O.NOMES}
        trans = []
        for Rw, pq in poses:
            L = esq.locais(Rw)
            for o in O.NOMES:
                rots[o].append(L[o])
            trans.append(pq)
        anims.append((nome, {o: np.array(v) for o, v in rots.items()}, np.array(trans)))
        n = len(poses)
        inf = dict(duracao_s=round((n - 1) / FPS, 4), repete=True, quadros=n)
        if r.get('velocidade'):
            inf['velocidade_m_s'] = round(float(r['velocidade']), 3)
        for k_, v_ in r.items():
            if k_ in ('poses', 'velocidade', 'previa'):
                continue
            inf[k_] = v_
        info_an[nome] = inf
    log(f'{tipo}: {len(anims)} animações ({time.time() - t0:.0f} s)')
    caminho = os.path.join(saida, f'{tipo}.glb')
    gerador = 'chacara3d/pessoas/pessoas.py (MakeHuman CC0 + CMU mocap)'
    tam, info_m = exportar.exportar(caminho, tipo, esq, visuais, malha_olhos(d),
                                    {'detalhe': (tex, 'image/jpeg'), 'olho': (olho, 'image/jpeg')}, anims, gerador)
    for im in info_m:
        info_vis[im['nome']].update(triangulos=im['triangulos'], triangulos_sem_olhos=im['triangulos_corpo'],
                                    vertices=im['vertices'])
    log(f'{tipo}: {caminho} {tam / 1024:.0f} KB ({time.time() - t0:.0f} s)')
    J = d['juntas']
    medidas = dict(altura_m=round(float(max(m.V[:, 1].max() for _, m in visuais if True)), 3),
                   altura_corpo_m=round(float(d['V'][:, 1].max()), 3),
                   quadril_m=round(float(J['quadril'][1]), 3), ombro_m=round(float(J['braco_e'][1]), 3),
                   olhos_m=round(float(d['marcos']['olhos'][1]), 3),
                   pega_d_repouso_m=[round(float(x), 3) for x in J['pega_d']],
                   pega_e_repouso_m=[round(float(x), 3) for x in J['pega_e']])
    return dict(arquivo=os.path.basename(caminho), descricao=DESCRICAO[tipo], medidas=medidas,
                ossos=list(O.NOMES), visuais=info_vis, animacoes=info_an, bytes=os.path.getsize(caminho),
                alvos_makehuman=d['alvos']), img


CONVENCOES = {
    'unidade': 'metro',
    'eixos': 'glTF Y para cima; a pessoa olha para +Z; esquerda da pessoa = +X (sufixo _e), direita = −X (_d)',
    'origem': 'no chão, entre os pés (debaixo dos tornozelos); nas sentadas e na deitada, veja as notas de cada animação',
    'escala': 'o motor pode aplicar uma escala uniforme de 0,94–1,06 no nó da pessoa',
    'quadros_por_segundo': FPS,
    'animacoes_no_lugar': 'nenhuma animação anda com a raiz; o motor desloca a pessoa. Só o osso `quadril` tem '
                          'translação (balanço, pulo, sentar).',
    'velocidade': 'nas animações de andar/correr/carregar, velocidade_m_s é a velocidade que casa com a passada (pé '
                  'no chão sem escorregar). Para outra velocidade, timeScale = v / velocidade_m_s.',
    'canais': 'todas as animações têm rotação de todos os ossos (troca sem pose sobrando); todas são laços: o '
              'último quadro é igual ao primeiro',
    'repouso_dos_ossos': 'todos os ossos têm rotação de repouso identidade (eixos do mundo), menos pega_e/pega_d; '
                         'assim girar `cabeca` em Y vira a cabeça para a esquerda (olhar procedural por cima)',
    'pele': 'cada visual é uma malha com esqueleto (skin), até 4 ossos por vértice, pesos normalizados (uint8)',
    'visuais': 'cada visual é um nó com o nome do visual; o nó tem uma malha com duas primitivas: material '
               '`pessoa` (corpo, roupa, cabelo, calçado) e material `olhos`. Todas as malhas usam o mesmo esqueleto. '
               'O motor clona o arquivo (SkeletonUtils.clone) e deixa visível só um visual por pessoa.',
    'formato': 'GLB 2.0 com KHR_mesh_quantization: posição em int16 normalizado (a escala de 2 m está nas matrizes '
               'inversas de ligação da pele) e normal em int8; TEXCOORD_0 uint16, COLOR_0/JOINTS_0/WEIGHTS_0 uint8; '
               'rotações das animações em int16 normalizado, com chaves reduzidas (interpolação linear). O GLTFLoader '
               'do three.js r170 lê tudo sem configuração extra.',
    'sola': 'no repouso a sola do pé descalço fica a 1,2 cm do chão e os calçados ocupam essa folga; nos visuais '
            'descalços a planta desce até o chão. Assim todos os visuais pisam em y = 0 com o mesmo esqueleto.',
}

MASCARAS = {
    'COLOR_0': 'RGBA linear (uint8 normalizado) é MÁSCARA, não cor: R = peça de cima (camiseta, blusa, vestido, '
               'biquíni de cima, uniforme, maiô), G = peça de baixo (bermuda, calça, saia, sunga, biquíni de baixo), '
               'B = pele, A = cabelo e sobrancelhas. Onde R+G+B+A = 0 é calçado/acessório (boné, chapéu, sola, '
               'tiras do chinelo, elástico do cabelo; e a camiseta de baixo do visual `camisa`). Soma ≤ 1; as '
               'transições são suaves (linha do cabelo, sobrancelhas).',
    'mistura': 'o GLTFLoader liga vertexColors quando há COLOR_0: o motor desliga (vertexColors = false), lê o '
               'atributo `color` (vec4) e mistura no shader: cor = R·cima + G·baixo + B·pele + A·cabelo + '
               '(1 − soma)·acessório, depois × textura de detalhe (map).',
    'detalhe': 'TEXCOORD_0 + textura do material `pessoa` (JPEG sRGB 1024², uma por arquivo, compartilhada pelos '
               'visuais): dobras, costuras, cavidades, mechas, sobrancelhas, contorno dos olhos, narinas e lábios. '
               'Valor ~0,90 nas áreas lisas (≈0,79 depois da conversão sRGB→linear). A pele é neutra (cinza) e '
               'serve a qualquer tom; os lábios são levemente mais rosados.',
    'olhos': 'material `olhos` com textura própria (esclera e íris castanha do MakeHuman), sem máscara',
    'preto_e_branco': 'para conferir as máscaras: ver chacara3d/pessoas/previa/previa.js (materialPessoa)',
}

PEGAS = {
    'ossos': 'pega_e e pega_d, filhos de mao_e/mao_d, sem pesos',
    'origem': 'no ponto de pegada, dentro da mão: no meio do anel formado pelos dedos dobrados (onde passa o eixo '
              'de um cabo ou o centro de um copo segurado)',
    'eixos': 'Y = eixo do cabo, saindo pelo lado do polegar/indicador (do nó do mínimo para o nó do indicador); '
             'Z = para onde os dedos apontam (do punho para os nós), perpendicular a Y; X = Y × Z (na mão direita '
             'aponta para a palma, na esquerda para o dorso)',
    'como_usar': 'modele o objeto com a origem no ponto de pegada e o eixo do cabo (ou o eixo de um copo, boca '
                 'para cima) em +Y e prenda como filho do osso pega_d (ou pega_e), sem rotação nem deslocamento. '
                 'Com a mão em repouso (braço solto) o +Y fica mais ou menos para a frente/baixo; nas animações '
                 'com objeto (bebendo, ferramentas) o +Y fica certo.',
    'copo': 'copo de ~11 cm: centro do copo na origem da pega; a borda fica em +Y a ~5,5 cm (bebendo encosta a '
            'borda na boca)',
    'ferramentas_de_cabo': 'rastelo, vassoura, peneira da piscina e pegador: presos na pega_d com o cabo em +Y; '
                           'nessas animações o +Y aponta da mão direita para a esquerda e a mão esquerda fica sobre '
                           'a linha do cabo (distâncias nas notas de cada animação)',
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('pessoas', nargs='*', default=list(ORDEM))
    ap.add_argument('--saida', default=SAIDA_PADRAO)
    ap.add_argument('--anims', default=None, help='lista separada por vírgula (teste)')
    args = ap.parse_args([a for a in sys.argv[1:] if a != '--'] if '--' not in sys.argv else
                         sys.argv[sys.argv.index('--') + 1:])
    os.makedirs(args.saida, exist_ok=True)
    caminho_json = os.path.join(args.saida, 'pessoas.json')
    try:
        dados = json.load(open(caminho_json, encoding='utf-8'))
    except Exception:
        dados = {}
    dados['convencoes'] = CONVENCOES
    dados['mascaras'] = MASCARAS
    dados['pegas'] = PEGAS
    dados.setdefault('pessoas', {})
    so = args.anims.split(',') if args.anims else None
    for p in args.pessoas:
        info, _img = gerar(p, args.saida, so)
        dados['pessoas'][p] = info
    dados['pessoas'] = {k: dados['pessoas'][k] for k in ORDEM if k in dados['pessoas']}
    dados['bytes_total'] = sum(v['bytes'] for v in dados['pessoas'].values())
    with open(caminho_json, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)
        f.write('\n')


if __name__ == '__main__':
    main()
