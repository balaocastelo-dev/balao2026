"""HTTP com a biblioteca padrão (nada para instalar além do faster-whisper)."""
from __future__ import annotations

import json
import urllib.error
import urllib.request


class ErroHttp(Exception):
    def __init__(self, status: int, corpo: str, url: str):
        super().__init__(f"HTTP {status} em {url}: {corpo[:300]}")
        self.status = status
        self.corpo = corpo
        self.url = url


def pedir(url: str, *, metodo: str = "GET", dados=None, cabecalhos: dict | None = None, espera: float = 60, cru: bool = False):
    corpo = None
    h = {"accept": "application/json", **(cabecalhos or {})}
    if dados is not None:
        corpo = json.dumps(dados, ensure_ascii=False).encode("utf-8")
        h["content-type"] = "application/json"
    req = urllib.request.Request(url, data=corpo, method=metodo, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=espera) as r:
            conteudo = r.read()
            if cru:
                return conteudo, r.headers.get("content-type", "")
            return json.loads(conteudo.decode("utf-8") or "{}")
    except urllib.error.HTTPError as e:
        texto = e.read().decode("utf-8", "ignore")
        raise ErroHttp(e.code, texto, url) from None
