"""Abre a página de conferência no Chromium sem tela (Playwright) e salva as capturas.

    python3 conferir.py --dados PASTA_DO_GLB --saida PASTA_DAS_IMAGENS [--so grade,cenas,closes]

Serve o repositório (para o three.js de public/chacara3d/vendor/three) e a pasta do
GLB em /dados/. Falha se a página registrar erro no console.
"""
import argparse
import functools
import http.server
import os
import sys
import threading

from playwright.sync_api import sync_playwright

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.normpath(os.path.join(AQUI, '..', '..'))

CLOSES = [
    ('bolo', '&ang=-25&alt=24'),
    ('mesa_bolo', '&ang=-35&alt=20'),
    ('cortador_grama', '&ang=-40&alt=24'),
    ('cabine_dj', '&ang=-30&alt=26'),
    ('cabine_dj', '&ang=180&alt=38'),
    ('trelica_luzes', '&ang=-20&alt=12&sil=1'),
    ('boia_rosquinha', '&ang=-30&alt=35'),
    ('boia_flamingo', '&ang=-50&alt=18'),
    ('boia_colchao', '&ang=-35&alt=30'),
    ('cadeira_festa', '&ang=-35&alt=18'),
    ('arco_baloes', '&ang=-15&alt=10&sil=1'),
    ('travessa_carne', '&ang=-30&alt=40'),
    ('espeto_carne', '&ang=-30&alt=15'),
    ('puff', '&ang=-35&alt=20'),
    ('caixa_som_grande', '&ang=-30&alt=12'),
    ('painel_led', '&ang=-10&alt=8'),
    ('painel_led', '&ang=160&alt=15'),
]


class Servidor(http.server.SimpleHTTPRequestHandler):
    dados = None

    def translate_path(self, path):
        p = path.split('?', 1)[0]
        if p.startswith('/dados/'):
            return os.path.join(self.dados, p[len('/dados/'):])
        return super().translate_path(path)

    def log_message(self, *a):
        pass


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dados', default=os.path.join(RAIZ, 'public', 'chacara3d', 'cenarios'))
    ap.add_argument('--saida', required=True)
    ap.add_argument('--so', default='grade,cenas,closes')
    ap.add_argument('--closes', default='')
    ap.add_argument('--grade-objs', default='', help='folha extra com estes objetos (4 colunas)')
    ap.add_argument('--nome-grade', default='folha_extra.png')
    a = ap.parse_args()
    os.makedirs(a.saida, exist_ok=True)
    Servidor.dados = os.path.abspath(a.dados)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Servidor, directory=RAIZ))
    porta = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{porta}/chacara3d/cenarios/conferir.html?glb=/dados/aderecos.glb'
    import json
    info = json.load(open(os.path.join(a.dados, 'aderecos.json'), encoding='utf-8'))
    n = len(info['aderecos'])
    cols = 8
    linhas = -(-n // cols)
    trabalhos = []
    so = a.so.split(',')
    if 'grade' in so:
        trabalhos.append(('folha_contato.png', f'&modo=grade&cols={cols}&w=2400&h={linhas * 300}', 2400, linhas * 300))
    if a.grade_objs:
        objs = a.grade_objs.split(',')
        lin = -(-len(objs) // 4)
        trabalhos.append((a.nome_grade, f'&modo=grade&cols=4&w=2400&h={lin * 560}&objs={a.grade_objs}', 2400, lin * 560))
    if 'cenas' in so:
        for chave, c in info['cenarios'].items():
            if any(x in info['aderecos'] for x in c['aderecos']):
                trabalhos.append((f'cena_{chave}.png', f'&modo=cena&cenario={chave}&w=2400&h=900', 2400, 900))
    if 'closes' in so:
        filtro = set(x for x in a.closes.split(',') if x)
        vistos = {}
        for nome, extra in CLOSES:
            if nome not in info['aderecos'] or (filtro and nome not in filtro):
                continue
            k = vistos.get(nome, 0)
            vistos[nome] = k + 1
            arq = f'close_{nome}' + (f'_{k + 1}' if k else '') + '.png'
            trabalhos.append((arq, f'&modo=close&obj={nome}{extra}&w=1200&h=900', 1200, 900))
        if 'trelica_luzes' in info['aderecos'] and (not filtro or 'trelica_luzes' in filtro):
            trabalhos.append(('close_trelica_luzes_noite.png', '&modo=close&obj=trelica_luzes&ang=-20&alt=12&noite=1', 1200, 900))
        if 'cabine_dj' in info['aderecos'] and (not filtro or 'cabine_dj' in filtro):
            trabalhos.append(('close_cabine_dj_noite.png', '&modo=close&obj=cabine_dj&ang=-30&alt=20&noite=1', 1200, 900))
    falhas = 0
    with sync_playwright() as pw:
        nav = pw.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
                                       '--ignore-gpu-blocklist'])
        for arq, q, w, h in trabalhos:
            pag = nav.new_page(viewport={'width': w, 'height': h})
            msgs = []
            pag.on('console', lambda m: msgs.append((m.type, m.text)))
            pag.on('pageerror', lambda e: msgs.append(('pageerror', str(e))))
            pag.goto(base + q)
            pag.wait_for_function('window.__pronto', timeout=600000)
            r = pag.evaluate('window.__pronto')
            pag.screenshot(path=os.path.join(a.saida, arq))
            erros = [m for m in msgs if m[0] in ('error', 'pageerror')] + [('erro', e) for e in r.get('erros', [])]
            avisos = [m for m in msgs if m[0] == 'warning']
            print(f'{arq}: programas={r.get("programas")} chamadas={r.get("chamadas")} erros={len(erros)} avisos={len(avisos)}', flush=True)
            for e in erros + avisos[:5]:
                print('   ', e)
            falhas += len(erros)
            pag.close()
        nav.close()
    srv.shutdown()
    sys.exit(1 if falhas else 0)


if __name__ == '__main__':
    main()
