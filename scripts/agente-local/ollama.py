"""Cliente mínimo do Ollama local (http://127.0.0.1:11434)."""
from __future__ import annotations

import base64
import time

from rede import pedir


class Ollama:
    def __init__(self, url: str = "http://127.0.0.1:11434"):
        self.url = url.rstrip("/")

    def modelos(self) -> list[str]:
        return [m["name"] for m in pedir(f"{self.url}/api/tags", espera=15).get("models", [])]

    def carregados(self) -> list[str]:
        return [m["name"] for m in pedir(f"{self.url}/api/ps", espera=10).get("models", [])]

    def conversar(self, modelo: str, mensagens: list[dict], *, ferramentas=None, contexto=8192,
                  temperatura=0.3, manter="30m", formato=None, pensar=False, espera=60, max_saida=384) -> dict:
        """Uma chamada ao modelo. Devolve a mensagem dele, com "_medida" (só números: tokens e tempos).

        - `contexto` tem de ser o MESMO de quem divide o modelo (URA, fábrica): o Ollama
          recarrega o modelo (4 a 8 s) toda vez que muda. O padrão da casa é 8192.
        - `max_saida` corta resposta que desanda (uma resposta de WhatsApp tem ~100 tokens).
        - `espera`: passou disso, desiste (quem chamou decide o que fazer, nunca o cliente esperando).
        """
        corpo = {
            "model": modelo,
            "messages": mensagens,
            "stream": False,
            "keep_alive": manter,
            "options": {"num_ctx": contexto, "temperature": temperatura, "num_predict": max_saida},
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
        inicio = time.time()
        r = pedir(f"{self.url}/api/chat", metodo="POST", dados=corpo, espera=espera)
        msg = dict(r.get("message") or {})
        msg["_medida"] = {
            "ms": int((time.time() - inicio) * 1000),
            "carga_ms": int((r.get("load_duration") or 0) / 1e6),
            "entrada": r.get("prompt_eval_count") or 0,
            "entrada_ms": int((r.get("prompt_eval_duration") or 0) / 1e6),
            "saida": r.get("eval_count") or 0,
            "saida_ms": int((r.get("eval_duration") or 0) / 1e6),
        }
        return msg

    def ver(self, modelo: str, imagem, pergunta: str, *, espera=180) -> str:
        """Modelo de visão: descreve a imagem (ou as imagens). Sai da placa logo depois (keep_alive 0)."""
        imagens = imagem if isinstance(imagem, (list, tuple)) else [imagem]
        msg = self.conversar(
            modelo,
            [{"role": "user", "content": pergunta, "images": [base64.b64encode(i).decode() for i in imagens]}],
            manter=0,
            contexto=4096,
            max_saida=200,
            temperatura=0.1,
            pensar=None,
            espera=espera,
        )
        return (msg.get("content") or "").strip()
