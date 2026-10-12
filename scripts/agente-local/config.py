"""Configuração do trabalhador da JUL.IA no PC do Thiago.

Tudo tem padrão; o que mudar vai em `config.json` ao lado deste arquivo (sem
segredo nenhum) ou em variável de ambiente. Segredos ficam fora da pasta:

- o segredo da VPS em %USERPROFILE%\\.balao-agente\\segredo.txt, gravado pelo
  `deploy-evo.ps1 -Agente` (vem da VPS por ssh, sem aparecer na tela);
- o acesso ao Bling é o mesmo arquivo que a sentinela do Bionic renova a cada
  2 minutos (07-Scripts\\bling-oauth\\bling_tokens.json). Aqui só LEMOS: renovar
  daqui trocaria o refresh_token e derrubaria a sentinela.
"""
from __future__ import annotations

import json
import os
from pathlib import Path

AQUI = Path(__file__).resolve().parent
CASA = Path(os.environ.get("USERPROFILE") or os.environ.get("HOME") or ".")

PADRAO = {
    # VPS onde mora o WhatsApp da loja.
    "vps_url": "https://srv1963897.hstgr.cloud",
    "arquivo_segredo": str(CASA / ".balao-agente" / "segredo.txt"),
    # Ollama local. O qwen3:14b é o mesmo que a URA deixa carregado no horário
    # da loja: uma cópia só na placa serve os dois.
    "ollama_url": "http://127.0.0.1:11434",
    "modelo": "qwen3:14b",
    "modelo_visao": "",  # vazio = o primeiro instalado de MODELOS_DE_VISAO
    # Contexto do modelo: o MESMO da URA e da fábrica. Se cada um pede um, o
    # Ollama recarrega o modelo (4 a 8 s) a cada troca. O padrão do Ollama no PC
    # fica em 8192 (OLLAMA_CONTEXT_LENGTH) e as rotinas da fábrica já usam 8192.
    "contexto": 8192,
    # Conversas atendidas ao mesmo tempo. Fica sempre uma vaga do Ollama para a
    # URA: com OLLAMA_NUM_PARALLEL=3, são 2 da JUL.IA (com 2, só 1).
    "paralelo": 2,
    # Tempo máximo de uma resposta. Passou, o cliente recebe "um vendedor vai
    # continuar" em vez de ficar esperando.
    "prazo_s": 70,
    # Whisper: o mesmo modelo da URA (já baixado no cache do PC).
    "whisper_modelo": "deepdml/faster-whisper-large-v3-turbo-ct2",
    "whisper_dispositivo": "cuda",
    # Bling
    "bling_tokens": r"C:\Users\user\Documents\07-Scripts\bling-oauth\bling_tokens.json",
    "bling_vendedor_id": None,  # id do vendedor no Bling para a JUL.IA (opcional)
    # No modo teste (só os números do Thiago) o Bling é SIMULADO, para teste
    # não virar pedido de verdade no relatório. true = usar o Bling de verdade
    # também no teste.
    "bling_no_teste": False,
    # Placa de vídeo: a JUL.IA tem prioridade (Thiago, 12/10/2026). Ela não espera
    # URA nem render; a fábrica é que cede (placa.py). true = jeito antigo.
    "respeitar_placa": False,
    "pasta_dados": str(AQUI / "dados"),
    "intervalo_s": 2.0,
}

MODELOS_DE_VISAO = ["qwen2.5vl", "qwen3-vl", "llama3.2-vision", "gemma3", "minicpm-v", "llava"]


def carregar() -> dict:
    cfg = dict(PADRAO)
    arq = AQUI / "config.json"
    if arq.exists():
        try:
            cfg.update(json.loads(arq.read_text(encoding="utf-8")))
        except Exception as e:  # config quebrada não pode derrubar o agente
            print(f"[config] config.json ignorado: {e}")
    for chave in list(cfg):
        v = os.environ.get("JULIA_" + chave.upper())
        if v is not None:
            if isinstance(PADRAO.get(chave), bool):
                cfg[chave] = v.strip().lower() in ("1", "true", "sim", "yes")
            elif isinstance(PADRAO.get(chave), (int, float)) and not isinstance(PADRAO.get(chave), bool):
                cfg[chave] = type(PADRAO[chave])(v)
            else:
                cfg[chave] = v
    Path(cfg["pasta_dados"]).mkdir(parents=True, exist_ok=True)
    return cfg


def ler_segredo(cfg: dict) -> str:
    caminho = Path(cfg["arquivo_segredo"])
    if not caminho.exists():
        raise SystemExit(
            f"Falta o segredo da VPS em {caminho}.\n"
            "Rode na pasta do projeto: .\\whatsapp-server\\deploy-evo.ps1 -Agente  (pede a senha de root)."
        )
    return caminho.read_text(encoding="utf-8").strip()
