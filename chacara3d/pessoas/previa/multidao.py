"""Teste de multidão no Chromium sem tela: carrega os três GLB com o GLTFLoader do three.js r170,
clona 20 pessoas com SkeletonUtils.clone (cada uma com um visual, cores e animação diferentes,
escala 0,94–1,06) e tira uma foto. Falha se houver erro no console ou animação/visual ausente.

    python multidao.py saida.png
"""
import json
import os
import random
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from previa import Navegador  # noqa: E402

PUBLICO = os.path.normpath(os.path.join(AQUI, '..', '..', '..', 'public', 'chacara3d', 'pessoas'))

# (arquivo, visual, animação, objeto na pega_d)
GENTE = [
    ('homem', 'casual', 'conversando', None), ('mulher', 'casual', 'ouvindo', None),
    ('homem', 'camisa', 'bebendo', 'copo'), ('mulher', 'vestido', 'rindo', None),
    ('crianca', 'menino', 'correndo', None), ('crianca', 'menina', 'batendo_palmas', None),
    ('homem', 'regata', 'dancando_1', None), ('mulher', 'noite', 'dancando_2', None),
    ('homem', 'noite', 'pulando', None), ('mulher', 'praia', 'dancando_3', None),
    ('homem', 'trabalho', 'varrendo', 'cabo:-0.95:0.6'), ('mulher', 'trabalho', 'rastelando', 'cabo:-1.0:0.55'),
    ('homem', 'praia', 'andando', None), ('mulher', 'praia_2', 'andando_devagar', None),
    ('crianca', 'praia_menino', 'acenando', None), ('crianca', 'praia_menina', 'cantando_parabens', None),
    ('homem', 'praia_2', 'parado', None), ('mulher', 'casual', 'parado_2', None),
    ('homem', 'casual', 'acenando', None), ('mulher', 'vestido', 'cantando_parabens', None),
]


def main():
    saida = sys.argv[1] if len(sys.argv) > 1 else os.path.join(AQUI, 'multidao.png')
    dados = json.load(open(os.path.join(PUBLICO, 'pessoas.json'), encoding='utf-8'))
    rnd = random.Random(7)
    pessoas = []
    for i, (arq, vis, anim, obj) in enumerate(GENTE):
        info = dados['pessoas'][arq]
        dur = info['animacoes'][anim]['duracao_s']
        lin, col = divmod(i, 5)
        p = dict(arquivo=f'/chacara3d/pessoas/{arq}.glb', visual=vis, anim=anim,
                 x=(col - 2) * 1.35 + rnd.uniform(-0.2, 0.2), z=(1.5 - lin) * 1.3 + rnd.uniform(-0.2, 0.2),
                 giro=rnd.uniform(-0.6, 0.6), escala=round(rnd.uniform(0.94, 1.06), 3), t=round(rnd.uniform(0, dur), 2))
        if obj:
            p['objetos'] = {'pega_d': obj}
        pessoas.append(p)
    spec = dict(arquivos=[f'/chacara3d/pessoas/{a}.glb' for a in ('homem', 'mulher', 'crianca')], pessoas=pessoas,
                larg=1600, alt=900, cam=[0.0, 3.4, 10.5], olhar=[0.0, 0.8, 0.0], quadros=12)
    with Navegador() as nav:
        r = nav.multidao(spec, saida)
        console = list(nav.console)
    print(json.dumps({k: v for k, v in r.items() if k != 'info'}, ensure_ascii=False))
    for linha in console:
        print('console:', linha)
    ruins = [c for c in console if c.startswith(('error', 'pageerror', 'warning'))]
    if r['erros'] or ruins:
        print('FALHOU')
        sys.exit(1)
    print('ok:', saida)


if __name__ == '__main__':
    main()
