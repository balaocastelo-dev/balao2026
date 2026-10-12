"""Conversa com a VPS: pega trabalho, devolve resultado, bate o ponto.

A conexão sai sempre daqui. O PC não abre porta na internet e não precisa de
túnel (o túnel do Cloudflare da JUL.IA antiga mudava de endereço a cada
reinício e derrubava o atendimento).
"""
from __future__ import annotations

import urllib.parse

from rede import pedir


class Vps:
    def __init__(self, url: str, segredo: str):
        self.url = url.rstrip("/")
        self.cab = {"x-agente-segredo": segredo}

    def trabalho(self) -> dict:
        return pedir(f"{self.url}/api/agente/trabalho", cabecalhos=self.cab, espera=30)

    def resultado(self, corpo: dict) -> dict:
        return pedir(f"{self.url}/api/agente/resultado", metodo="POST", dados=corpo, cabecalhos=self.cab, espera=60)

    def batida(self, info: dict) -> dict:
        return pedir(f"{self.url}/api/agente/batida", metodo="POST", dados=info, cabecalhos=self.cab, espera=20)

    def catalogo(self) -> dict:
        return pedir(f"{self.url}/api/agente/catalogo", cabecalhos=self.cab, espera=120)

    def midia(self, mensagem_id: str) -> tuple[bytes, str]:
        return pedir(
            f"{self.url}/api/agente/midia/{urllib.parse.quote(str(mensagem_id), safe='')}",
            cabecalhos=self.cab,
            espera=120,
            cru=True,
        )
