"""Roda a página de conferência no Chromium sem tela (Playwright) e salva as imagens.

    python previa.py folha spec.json saida.png
    python previa.py multidao spec.json saida.png

Sobe um servidor local que serve `public/chacara3d/` em /chacara3d/ (three.js e os GLB)
e esta pasta em /previa/.
"""
import http.server
import json
import os
import socketserver
import sys
import threading

AQUI = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(AQUI, '..', '..', '..'))
PUBLICO = os.path.join(REPO, 'public')


class Manipulador(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        p = path.split('?')[0].split('#')[0]
        if p.startswith('/previa/'):
            return os.path.join(AQUI, p[len('/previa/'):])
        if p.startswith('/extra/'):
            return os.path.join(os.environ.get('PREVIA_EXTRA', '/tmp'), p[len('/extra/'):])
        return os.path.join(PUBLICO, p.lstrip('/'))

    def log_message(self, *a):
        pass

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


class Servidor:
    def __enter__(self):
        socketserver.TCPServer.allow_reuse_address = True
        self.srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), Manipulador)
        self.porta = self.srv.server_address[1]
        self.t = threading.Thread(target=self.srv.serve_forever, daemon=True)
        self.t.start()
        return self

    def __exit__(self, *a):
        self.srv.shutdown()


class Navegador:
    """Mantém um Chromium aberto para várias folhas."""

    def __enter__(self):
        from playwright.sync_api import sync_playwright
        os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
        self.serv = Servidor().__enter__()
        self.pw = sync_playwright().start()
        self.nav = self.pw.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
                                                 '--ignore-gpu-blocklist'])
        self.pag = self.nav.new_page(viewport={'width': 1400, 'height': 900})
        self.console = []
        self.pag.on('console', lambda m: self.console.append(f'{m.type}: {m.text}'))
        self.pag.on('pageerror', lambda e: self.console.append(f'pageerror: {e}'))
        self.pag.goto(f'http://127.0.0.1:{self.serv.porta}/previa/previa.html')
        self.pag.wait_for_function('window.__pronto === true', timeout=60000)
        return self

    def __exit__(self, *a):
        self.nav.close()
        self.pw.stop()
        self.serv.__exit__()

    def folha(self, spec, saida):
        r = self.pag.evaluate('s => window.folha(s)', spec)
        self.pag.set_viewport_size({'width': int(r['largura']), 'height': int(r['altura'])})
        self.pag.screenshot(path=saida, clip={'x': 0, 'y': 0, 'width': r['largura'], 'height': r['altura']})
        return r

    def multidao(self, spec, saida):
        r = self.pag.evaluate('s => window.multidao(s)', spec)
        self.pag.set_viewport_size({'width': spec.get('larg', 1280), 'height': spec.get('alt', 720)})
        self.pag.screenshot(path=saida, clip={'x': 0, 'y': 0, 'width': spec.get('larg', 1280), 'height': spec.get('alt', 720)})
        return r


def main():
    modo, arq, saida = sys.argv[1:4]
    spec = json.load(open(arq))
    with Navegador() as nav:
        r = getattr(nav, modo)(spec, saida)
        print(json.dumps(r, ensure_ascii=False))
        for l in nav.console:
            print(l)


if __name__ == '__main__':
    main()
