"""Folhas de contato das pessoas (no Chromium, com o three.js r170, como o motor vê).

    python folhas.py PASTA_SAIDA [homem mulher crianca] [--so visuais|animacoes] [--anims a,b]

- visuais_<pessoa>.png: cada visual de frente, de lado e de costas, com luz de dia;
- anim_<pessoa>_<n>.png: quadros-chave de cada animação (seis por animação, de 3/4 e de lado).
As cores de cada pessoa são sorteadas como o motor faria (pele, cabelo, roupa de cima e
de baixo, acessório).
"""
import json
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from previa import Navegador  # noqa: E402

PUBLICO = os.path.normpath(os.path.join(AQUI, '..', '..', '..', 'public', 'chacara3d', 'pessoas'))

CORES = [
    dict(pele='#c68863', cabelo='#2b1a12', cima='#2f5d9e', baixo='#d8cfb8', acess='#f2f2f2'),
    dict(pele='#f1c9a5', cabelo='#8a6038', cima='#c23b30', baixo='#2e3e5c', acess='#2a2a2a'),
    dict(pele='#6b3f28', cabelo='#1b1210', cima='#e8e3d6', baixo='#3d7a4a', acess='#7a5230'),
    dict(pele='#a86d4a', cabelo='#3d2616', cima='#d9a520', baixo='#1f3a5f', acess='#c7b48a'),
]

CENARIO = {
    'sentado': dict(cenario='cadeira'), 'sentado_conversando': dict(cenario='cadeira'),
    'sentado_comendo': dict(cenario='cadeira'), 'sentado_assistindo': dict(cenario='cadeira'),
    'sentado_borda': dict(cenario='borda', chao_y=-1.35), 'deitado': dict(cenario='espreguicadeira'),
    'grelhando': dict(cenario='bancada'), 'dj': dict(cenario='mesa_dj'),
}
OBJETOS = {
    'bebendo': {'pega_d': 'copo'}, 'rastelando': {'pega_d': 'cabo'}, 'varrendo': {'pega_d': 'cabo'},
    'limpando_piscina': {'pega_d': 'eixos'}, 'grelhando': {'pega_d': 'eixos'},
}


def marcas(a):
    """Pontos de apoio documentados nas notas (para conferir onde as mãos vão)."""
    m = []
    g = a.get('guidao_m')
    if g:
        for s in (1, -1):
            m.append(dict(pos=[s * g['meia_largura'], g['altura'], g['frente']], r=0.025, cor='#f0f'))
    if a.get('cesto_m'):
        m.append(dict(pos=a['cesto_m'], r=0.12, cor='#c9a25a'))
    if a.get('fruta_m'):
        for s in (1, -1):
            m.append(dict(pos=[s * 0.12, a['fruta_m'], 0.32], r=0.04, cor='#f80'))
    return m


def folha_visuais(nav, tipo, info, saida):
    cel = []
    alt = info['medidas']['altura_m']
    for i, nome in enumerate(info['visuais']):
        cores = CORES[i % len(CORES)]
        for v in ('frente', 'lado', 'costas'):
            cel.append(dict(visual=nome, vista=v, cores=cores, rotulo=f'{nome} ({v})', alvoY=alt * 0.52,
                            dist=4.4 * alt / 1.76))
    spec = dict(arquivo=f'/chacara3d/pessoas/{tipo}.glb', colunas=6, celulas=cel, larg=230, alt=380)
    return nav.folha(spec, os.path.join(saida, f'visuais_{tipo}.png'))


def folha_animacoes(nav, tipo, info, saida, so=None, por_folha=6, quadros=6, arquivo=None, prefixo='anim'):
    nomes = [n for n in info['animacoes'] if not so or n in so]
    visuais = list(info['visuais'])
    alt = info['medidas']['altura_m']
    res = []
    for f0 in range(0, len(nomes), por_folha):
        cel = []
        for j, nome in enumerate(nomes[f0:f0 + por_folha]):
            a = info['animacoes'][nome]
            dur = a['duracao_s']
            vis = visuais[(f0 + j) % len(visuais)]
            cores = CORES[(f0 + j) % len(CORES)]
            for q in range(quadros):
                t = dur * q / quadros
                vista = 'tres_quartos' if q % 2 == 0 else 'lado'
                c = dict(visual=vis, anim=nome, t=round(t, 3), vista=vista, cores=cores,
                         rotulo=f'{nome} {t:.2f}s', alvoY=alt * 0.5, dist=4.6 * alt / 1.76)
                c.update(CENARIO.get(nome, {}))
                if nome in OBJETOS:
                    c['objetos'] = OBJETOS[nome]
                fer = a.get('ferramenta')
                if fer and 'mao_esquerda_em_y' in fer:
                    ya = fer.get('cabeca_em_y', 0.0)
                    yb = fer.get('peneira_em_y', fer['mao_esquerda_em_y'] + 0.15)
                    c['objetos'] = {'pega_d': f'cabo:{ya}:{min(yb, 1.6)}'}
                c['marcas'] = marcas(a)
                if nome == 'sentado_borda':
                    c['alvoY'] = 0.0
                if a.get('mesa_m'):
                    c['cenario_k'] = a['mesa_m']
                if a.get('bancada_m'):
                    c['cenario_k'] = a['bancada_m']
                if nome in ('na_agua', 'nadando_parado'):
                    c['cenario'] = 'agua'
                    c['cenario_k'] = a.get('linha_dagua_m', 1.2)
                cel.append(c)
        spec = dict(arquivo=arquivo or f'/chacara3d/pessoas/{tipo}.glb', colunas=quadros, celulas=cel, larg=210, alt=300)
        caminho = os.path.join(saida, f'{prefixo}_{tipo}_{f0 // por_folha + 1}.png')
        res.append(nav.folha(spec, caminho))
    return res


def main():
    args = [a for a in sys.argv[1:]]
    saida = args.pop(0)
    so = None
    modo = None
    if '--anims' in args:
        i = args.index('--anims')
        so = args[i + 1].split(',')
        del args[i:i + 2]
    if '--so' in args:
        i = args.index('--so')
        modo = args[i + 1]
        del args[i:i + 2]
    tipos = args or ['homem', 'mulher', 'crianca']
    os.makedirs(saida, exist_ok=True)
    dados = json.load(open(os.path.join(PUBLICO, 'pessoas.json'), encoding='utf-8'))
    with Navegador() as nav:
        for t in tipos:
            info = dados['pessoas'][t]
            if modo in (None, 'visuais'):
                r = folha_visuais(nav, t, info, saida)
                print(t, 'visuais', r['erros'])
            if modo in (None, 'animacoes'):
                for r in folha_animacoes(nav, t, info, saida, so):
                    print(t, 'animações', r['erros'])
        for l in nav.console:
            print(l)


if __name__ == '__main__':
    main()
