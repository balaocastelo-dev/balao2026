#!/usr/bin/env python3
"""Gera todas as texturas de folhagem e de casca do passeio 3D da chácara.

Uso:
    python3 folhagem.py              # gera tudo
    python3 folhagem.py manga banana # só as que forem citadas

Tudo é procedural (nada baixado) e determinístico: cada textura tem a sua
semente fixa. Saídas (dentro do repositório):

    public/chacara3d/tex/folhas/<nome>.png     folhas, RGBA com alfa reto (cor = albedo sRGB)
    public/chacara3d/tex/folhas/<nome>_n.png   mapa normal da folha (OpenGL: verde = para o topo)
    public/chacara3d/tex/<nome>_c.jpg          casca: albedo
    public/chacara3d/tex/<nome>_n.jpg          casca: normal (OpenGL)
    public/chacara3d/tex/<nome>_orm.jpg        casca: R = oclusão, G = rugosidade, B = 0
    public/chacara3d/tex/folhas.json           catálogo (tipo, tamanho, rugosidade, translucidez...)

Mapeamento (o three.js carrega com flipY: v = 0 é a linha de BAIXO da imagem):
    cacho  - carta quadrada; o raminho entra em (u = 0,5, v = 0) e as folhas vão para v = 1.
    tira   - folha desenrolada: u = 0 margem, 0,5 nervura central, 1 outra margem; v = 0 base, 1 ponta.
    fronde - um lado da folha da palmeira: u = 0 base da fronde, 1 ponta; v = 0 ráquis, 1 ponta dos folíolos.
    casca  - sem emenda; u em volta do tronco, v ao longo dele.
"""
import os
import sys
import json
import time
import numpy as np
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)

from folhagem_nucleo import sangrar, gravar_rgba, gravar_rgb_png, gravar_jpg, normal_para_rgb, u8  # noqa: E402
import folhagem_cachos as cachos  # noqa: E402
import folhagem_tiras as tiras  # noqa: E402
import folhagem_frondes as frondes  # noqa: E402
import folhagem_cascas as cascas  # noqa: E402

RAIZ = os.path.abspath(os.path.join(AQUI, '..', '..'))
DIR_TEX = os.path.join(RAIZ, 'public', 'chacara3d', 'tex')
DIR_FOLHAS = os.path.join(DIR_TEX, 'folhas')
CATALOGO_JSON = os.path.join(DIR_TEX, 'folhas.json')

VERDE_LUZ = [0.55, 0.72, 0.16]      # luz atravessando folha verde comum (sRGB 0..1)

# nome, tipo, função, semente, gera normal, rugosidade, cor da luz atravessando, descrição, extras
TEXTURAS = [
    # ---------------------------------------------------------------- cachos
    ('manga', 'cacho', cachos.cacho_manga, 101, True, 0.42, [0.50, 0.66, 0.14],
     'Mangueira: raminho com dois verticilos de folhas lanceoladas coriáceas, verde-escuras e brilhantes, '
     'e um broto de folhas novas cor de cobre/bronze.', dict(carta_m=0.8)),
    ('amendoeira', 'cacho', cachos.cacho_amendoeira, 102, True, 0.48, [0.55, 0.70, 0.15],
     'Amendoeira-da-praia: roseta de folhas grandes obovadas na ponta do ramo, verde médio-escuro; uma '
     'folha avermelhando na roseta de trás.', dict(carta_m=0.85)),
    ('amendoeira_vermelha', 'cacho', cachos.cacho_amendoeira_vermelha, 103, True, 0.55, [0.85, 0.30, 0.08],
     'Amendoeira-da-praia no "outono" tropical: folhas vermelhas, laranja, amarelas e marrons.', dict(carta_m=0.85)),
    ('jabuticaba', 'cacho', cachos.cacho_jabuticaba, 104, True, 0.40, [0.48, 0.66, 0.14],
     'Jabuticabeira: raminhos finos com folhinhas opostas lanceoladas, verde-escuras, pares novos cor de '
     'salmão nas pontas.', dict(carta_m=0.45)),
    ('goiaba', 'cacho', cachos.cacho_goiaba, 105, True, 0.72, [0.60, 0.74, 0.20],
     'Goiabeira: folhas ovais foscas, opostas cruzadas, com nervuras laterais paralelas bem marcadas '
     '(afundadas em cima, em relevo no mapa normal).', dict(carta_m=0.6)),
    ('citrico', 'cacho', cachos.cacho_citrico, 106, True, 0.38, [0.48, 0.68, 0.12],
     'Limoeiro/laranjeira: folhas elípticas brilhantes verde-escuras, alternas, pecíolo com asa; ramo '
     'verde com espinhos.', dict(carta_m=0.5)),
    ('fundo', 'cacho', cachos.cacho_fundo, 107, True, 0.60, [0.42, 0.58, 0.12],
     'Massa de folhagem genérica, densa e mais escura, para árvores longe (atrás dos muros).', dict(carta_m=1.6)),
    ('trepadeira', 'cacho', cachos.cacho_trepadeira, 108, True, 0.50, [0.45, 0.65, 0.12],
     'Trepadeira de muro (unha-de-gato, Ficus pumila): folhinhas cordiformes em hastes rasteiras, quase '
     'todas de frente; para cartas encostadas no muro.', dict(carta_m=0.45)),
    ('maracuja', 'cacho', cachos.cacho_maracuja, 109, True, 0.45, [0.52, 0.70, 0.14],
     'Maracujazeiro: folhas trilobadas serrilhadas, gavinhas enroladas e uma flor branca e roxa.',
     dict(carta_m=0.6)),
    # ---------------------------------------------------------------- tiras
    ('banana', 'tira', tiras.tira_banana, 201, True, 0.55, [0.62, 0.78, 0.18],
     'Bananeira: verde vivo, nervura central grossa e clara, nervuras laterais finíssimas quase '
     'perpendiculares, 8-11 rasgos de vento (transparentes) e margens secas. Pensada para tira "paddle" '
     'com largura/comprimento ~0,3.', {}),
    ('tropical_larga', 'tira', tiras.tira_tropical_larga, 202, True, 0.45, [0.50, 0.70, 0.15],
     'Helicônia/estrelítzia: verde médio-escuro, nervuras laterais paralelas a ~60°, dois ou três '
     'rasguinhos na margem. Tira "paddle", largura/comprimento ~0,3.', {}),
    ('tropical', 'tira', tiras.tira_tropical, 203, True, 0.50, [0.55, 0.72, 0.16],
     'Folha tropical menor (alpínia, filodendro xanadu): verde médio, nervuras laterais curvas.', {}),
    ('dracena', 'tira', tiras.tira_dracena, 204, True, 0.45, [0.62, 0.74, 0.20],
     'Dracena "massangeana": fita verde com faixa central larga amarelo-esverdeada e nervuras finas '
     'paralelas ao comprimento.', {}),
    ('rafis', 'tira', tiras.tira_rafis, 205, True, 0.35, [0.42, 0.62, 0.12],
     'Segmento de folha de ráfis: verde-escuro brilhante, costelas paralelas, ponta truncada e dentada '
     '(recortada no alfa).', {}),
    ('capim', 'tira', tiras.tira_capim, 206, False, 0.60, [0.58, 0.72, 0.22],
     'Folhas em fita/capim (moreia, cebolinha, alecrim, liriope): verde a verde-acinzentado, nervuras '
     'paralelas finas, base mais escura e pontinha levemente seca.', {}),
    ('grama_preta', 'tira', tiras.tira_grama_preta, 207, False, 0.45, [0.30, 0.42, 0.10],
     'Grama-preta (Ophiopogon): verde muito escuro, quase preto, nervuras paralelas finas.', {}),
    ('lima', 'tira', tiras.tira_lima, 208, True, 0.40, [0.70, 0.82, 0.22],
     'Folha lanceolada verde-limão brilhante (pacová, manjericão, asplênio) com nervuras laterais.', {}),
    ('bromelia', 'tira', tiras.tira_bromelia, 209, False, 0.35, [0.55, 0.70, 0.18],
     'Folha de bromélia: verde com faixas transversais prateadas discretas e espinhos miúdos na margem '
     '(dentes recortados no alfa); brilhante.', {}),
    ('samambaia', 'tira', tiras.tira_samambaia, 210, False, 0.55, [0.55, 0.72, 0.16],
     'Fronde de samambaia como tira: ráquis em u = 0,5 e folíolos dos dois lados; o resto é '
     'transparente. Pensada para tira "lance" com largura/comprimento ~0,1.', {}),
    ('taioba_roxa', 'tira', tiras.tira_taioba_roxa, 211, True, 0.70, [0.45, 0.10, 0.22],
     'Taioba/inhame roxo (Colocasia "black magic"): roxo quase preto, aveludado, nervuras mais escuras. '
     'Tira "heart".', {}),
    ('flor_vermelha', 'tira', tiras.tira_flor_vermelha, 212, False, 0.35, [0.95, 0.25, 0.10],
     'Bráctea de helicônia bico-de-papagaio: vermelho cerado, borda e ponta verde-amareladas.', {}),
    ('flor_laranja', 'tira', tiras.tira_flor_laranja, 213, False, 0.38, [1.00, 0.55, 0.12],
     'Bráctea laranja (alpínia/helicônia): laranja com amarelo nas bordas e na ponta.', {}),
    # ---------------------------------------------------------------- frondes
    ('coqueiro', 'fronde', frondes.fronde_coqueiro, 301, True, 0.45, [0.62, 0.74, 0.18],
     'Um lado da fronde do coqueiro: 86 folíolos estreitos, dobrados em V (no mapa normal), verde-amarelado '
     'a verde médio, pontas secas e alguns rasgados.', {}),
    ('areca', 'fronde', frondes.fronde_areca, 302, True, 0.45, [0.70, 0.80, 0.22],
     'Um lado da fronde da areca-bambu: mais clara e amarelada, folíolos mais arqueados e densos, ráquis '
     'amarela.', {}),
    # ---------------------------------------------------------------- cascas
    ('casca_escura', 'casca', cascas.casca_escura, 401, True, None, None,
     'Casca de mangueira/amendoeira/citros: cinza-marrom escura, áspera, fissuras verticais e placas soltando.',
     dict(tamanho_m=[0.6, 0.6])),
    ('casca_coqueiro', 'casca', cascas.casca_coqueiro, 402, True, None, None,
     'Estipe do coqueiro: cinza-marrom com anéis de cicatriz a cada 6-10 cm e fibras verticais.',
     dict(tamanho_m=[0.5, 0.5])),
    ('casca_goiaba', 'casca', cascas.casca_goiaba, 403, True, None, None,
     'Tronco de goiabeira: liso, descascando em placas finas (bege, cinza-esverdeado e marrom-acobreado).',
     dict(tamanho_m=[0.5, 0.5])),
    ('casca_jabuticaba', 'casca', cascas.casca_jabuticaba, 404, True, None, None,
     'Tronco de jabuticabeira: liso, manchado de bege, cinza e marrom claro, soltando lascas.',
     dict(tamanho_m=[0.5, 0.5])),
    ('cana', 'casca', cascas.cana, 405, True, None, None,
     'Caule de dracena/cana: verde-amarronzado com anéis de cicatriz bem próximos.', dict(tamanho_m=[0.3, 0.3])),
]


def _rel(caminho):
    return os.path.relpath(caminho, DIR_TEX).replace(os.sep, '/')


def gerar(entrada):
    nome, tipo, func, semente, com_normal, rug, transl, desc, extras = entrada
    rng = np.random.default_rng(semente)
    t0 = time.time()
    item = dict(tipo=tipo)
    if tipo == 'casca':
        tam = extras['tamanho_m']
        n = int(round(1024))
        r = func(rng, n=n, tamanho_m=tam[0])
        arq = [gravar_jpg(os.path.join(DIR_TEX, f'{nome}_c.jpg'), u8(r['cor']), 88),
               gravar_jpg(os.path.join(DIR_TEX, f'{nome}_n.jpg'), normal_para_rgb(r['normal']), 92),
               gravar_jpg(os.path.join(DIR_TEX, f'{nome}_orm.jpg'),
                          np.dstack([u8(r['ao']), u8(r['rug']), np.zeros_like(u8(r['ao']))]), 92)]
        item.update(px=[n, n], tamanho_m=tam, rugosidade=round(float(r['rug'].mean()), 2), desc=desc,
                    arquivos=dict(cor=_rel(arq[0]), normal=_rel(arq[1]), orm=_rel(arq[2])))
    else:
        rgb, alfa, nrm = func(rng)
        rgb = sangrar(rgb, alfa)
        arq = gravar_rgba(os.path.join(DIR_FOLHAS, f'{nome}.png'), rgb, alfa)
        h, w = alfa.shape
        item.update(px=[w, h], rugosidade=rug, translucidez_cor=transl, desc=desc,
                    arquivos=dict(cor=_rel(arq[0])))
        if len(arq) > 1:
            item['arquivos']['webp'] = _rel(arq[1])
        if com_normal and nrm is not None:
            n8 = normal_para_rgb(nrm)
            cn = gravar_rgb_png(os.path.join(DIR_FOLHAS, f'{nome}_n.png'), n8)
            item['arquivos']['normal'] = _rel(cn)
            if os.path.getsize(cn) > 1.5e6:
                cw = cn[:-4] + '.webp'
                Image.fromarray(n8, 'RGB').save(cw, quality=92, method=6)
                item['arquivos']['normal_webp'] = _rel(cw)
        if 'carta_m' in extras:
            item['carta_m'] = extras['carta_m']
        item['cobertura'] = round(float((alfa >= 0.5).mean()), 3)
    print(f'{nome:22s} {tipo:7s} {time.time() - t0:6.1f} s', flush=True)
    return nome, item


def _gravar_catalogo(catalogo):
    ordem = [e[0] for e in TEXTURAS]
    catalogo = {k: catalogo[k] for k in sorted(catalogo, key=ordem.index) if k in ordem}
    os.makedirs(DIR_TEX, exist_ok=True)
    with open(CATALOGO_JSON, 'w', encoding='utf-8') as f:
        json.dump(catalogo, f, ensure_ascii=False, indent=1)
        f.write('\n')


def main(nomes):
    escolhidas = [e for e in TEXTURAS if not nomes or e[0] in nomes]
    desconhecidas = set(nomes) - {e[0] for e in TEXTURAS}
    if desconhecidas:
        sys.exit('não conheço: ' + ', '.join(sorted(desconhecidas)))
    catalogo = {}
    if os.path.exists(CATALOGO_JSON):
        with open(CATALOGO_JSON, encoding='utf-8') as f:
            catalogo = json.load(f)
    for e in escolhidas:
        nome, item = gerar(e)
        catalogo[nome] = item
        _gravar_catalogo(catalogo)        # grava a cada textura: uma falha não perde o resto


if __name__ == '__main__':
    main(sys.argv[1:])
