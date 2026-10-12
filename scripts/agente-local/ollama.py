"""Cliente mínimo do Ollama local (http://127.0.0.1:11434)."""
from __future__ import annotations

import base64

from rede import pedir


class Ollama:
    def __init__(self, url: str = "http://127.0.0.1:11434"):
        self.url = url.rstrip("/")

    def modelos(self) -> list[str]:
        return [m["name"] for m in pedir(f"{self.url}/api/tags", espera=15).get("models", [])]

    def carregados(self) -> list[str]:
        return [m["name"] for m in pedir(f"{self.url}/api/ps", espera=10).get("models", [])]

    def conversar(self, modelo: str, mensagens: list[dict], *, ferramentas=None, contexto=16384,
                  temperatura=0.3, manter="30m", formato=None, pensar=False, espera=180) -> dict:
        corpo = {
            "model": modelo,
            "messages": mensagens,
            "stream": False,
            "keep_alive": manter,
            "options": {"num_ctx": contexto, "temperature": temperatura},
        }
        if ferramentas:
            corpo["tools"] = ferramentas
        if formato:
            corpo["format"] = formato
        # qwen3 "pensa" antes de responder (mais lento, e às vezes devolve
        # content vazio). gpt-oss aceita "low|medium|high".
        if "gpt-oss" in modelo:
            corpo["think"] = "low"
        elif pensar is not None:
            corpo["think"] = bool(pensar)
        return pedir(f"{self.url}/api/chat", metodo="POST", dados=corpo, espera=espera).get("message", {})

    def ver(self, modelo: str, imagem, pergunta: str, *, espera=180) -> str:
        """Modelo de visão: descreve a imagem (ou as imagens). Sai da placa logo depois (keep_alive 0)."""
        imagens = imagem if isinstance(imagem, (list, tuple)) else [imagem]
        msg = self.conversar(
            modelo,
            [{"role": "user", "content": pergunta, "images": [base64.b64encode(i).decode() for i in imagens]}],
            manter=0,
            contexto=4096,
            temperatura=0.1,
            pensar=None,
            espera=espera,
        )
        return (msg.get("content") or "").strip()
