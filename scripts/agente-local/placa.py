"""A placa de vídeo é uma só, e a JUL.IA vem primeiro.

Decisões do Thiago (12/10/2026): das 8h às 18h a JUL.IA tem prioridade na placa
sobre a URA e sobre os renders da fábrica (ela atende dezenas de vezes mais
que a URA e é venda acontecendo); de madrugada (fora desse horário) a
prioridade é da criação de conteúdo, e a JUL.IA espera render e ligação.

Como a prioridade funciona das 8h às 18h:
- a JUL.IA não espera nada: nem ligação da URA, nem render da fábrica;
- quando pega uma conversa, grava em dados/placa-julia.txt até quando precisa
  da placa (agora + 10 min, renovado a cada conversa). A fábrica lê esse sinal
  junto com o da URA (avatar/fila_avatar.py, avatar/vigiar.py,
  publisher/capa_blog.py, publisher/crescimento.py): render não começa e, se
  estiver no meio, derruba o ComfyUI na hora e tenta de novo depois;
- a fábrica descarrega o qwen3 para renderizar. Se a JUL.IA pega uma conversa
  com o modelo fora da placa, espera a memória da placa liberar (até 30 s)
  antes de chamar o modelo: com a memória ocupada ele carrega pela metade e
  fica dezenas de vezes mais lento (em 12/10, às 5h30, nem chegou a carregar).

A URA divide o mesmo qwen3 (uma vaga do Ollama é sempre dela) e ninguém
derruba ligação: a prioridade da JUL.IA é sobre o que pode esperar.
"""
from __future__ import annotations

import json
import os
import subprocess
import time
from pathlib import Path

# Horário em que a JUL.IA vem primeiro (fora dele, a fábrica vem primeiro).
PRIORIDADE_DAS, PRIORIDADE_ATE = 8, 18

# O sinal que a fábrica lê (o caminho está escrito também nos arquivos dela).
ARQUIVO_DO_SINAL = "placa-julia.txt"
MINUTOS_DE_PRIORIDADE = 10
# Memória livre na placa para o qwen3:14b carregar inteiro (pesos + 3 vagas de 8192).
GB_PARA_O_MODELO = 13.0
ESPERA_MAXIMA_S = 30

# Scripts da fábrica que cedem a placa à JUL.IA (conferido no --conferir).
FABRICA = Path(r"C:\Users\user\balao-content-factory")
QUEM_CEDE = ["avatar/fila_avatar.py", "avatar/vigiar.py", "publisher/capa_blog.py", "publisher/crescimento.py"]

OCUPANTES = ["video_diario.py", "video_dica.py", "video_pauta.py", "fila_avatar.py", "run_avatar.py", "upscale_seedvr2.py",
             "criar_figurino.py", "capa_blog.py", "kontext_corpo.py", "plano_aberto.py", "corpo_inteiro.py"]
SO_OLHAM = ("--ver", "--painel", "--montar-teste", "--proximo")


def _rodar(cmd, espera=30):
    return subprocess.run(cmd, capture_output=True, text=True, timeout=espera,
                          creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))


def ligacoes_na_ura() -> int:
    if os.name != "nt":
        return 0
    try:
        r = _rodar(["wsl.exe", "-d", "Ubuntu", "-u", "root", "--", "sh", "-lc", "asterisk -rx 'core show channels count'"], 20)
        for ln in (r.stdout or "").splitlines():
            if "active call" in ln:
                return int(ln.split()[0])
    except Exception:
        pass
    return 0


def render_da_fabrica() -> str | None:
    if os.name != "nt":
        return None
    try:
        r = _rodar(["powershell", "-NoProfile", "-Command",
                    "Get-CimInstance Win32_Process -Filter \"Name='python.exe' or Name='pythonw.exe'\" | "
                    "Select-Object ProcessId, CommandLine | ConvertTo-Json -Compress"], 60)
        procs = json.loads(r.stdout or "[]")
        procs = [procs] if isinstance(procs, dict) else procs
    except Exception:
        return None
    for p in procs:
        linha = (p.get("CommandLine") or "").lower()
        if p.get("ProcessId") == os.getpid() or any(s in linha for s in SO_OLHAM):
            continue
        for nome in OCUPANTES:
            if nome in linha:
                return nome
    return None


def memoria_livre_gb() -> float | None:
    """Memória livre na placa de vídeo (nvidia-smi), ou None se não deu para ver."""
    try:
        r = _rodar(["nvidia-smi", "--query-gpu=memory.free", "--format=csv,noheader,nounits"], 15)
        return round(int((r.stdout or "").strip().splitlines()[0]) / 1024, 1)
    except Exception:
        return None


def fabrica_que_nao_cede(pasta: Path = FABRICA) -> list[str]:
    """Scripts da fábrica que ainda não leem o sinal da JUL.IA (vazio = todos cedem)."""
    faltam = []
    for rel in QUEM_CEDE:
        arq = pasta / rel
        try:
            if ARQUIVO_DO_SINAL not in arq.read_text(encoding="utf-8", errors="ignore"):
                faltam.append(rel)
        except OSError:
            pass  # script que não existe neste PC não conta
    return faltam


class Placa:
    def __init__(self, pasta_dados: str | None = None, respeitar: bool = False, validade_s: float = 15,
                 memoria_livre=memoria_livre_gb, dormir=time.sleep, agora=time.time,
                 das: int = PRIORIDADE_DAS, ate: int = PRIORIDADE_ATE):
        # respeitar=True: a JUL.IA espera URA e render o dia todo (o jeito antigo).
        self.respeitar = respeitar
        self.das, self.ate = das, ate
        self.validade_s = validade_s
        self.sinal = Path(pasta_dados) / ARQUIVO_DO_SINAL if pasta_dados else None
        self.memoria_livre = memoria_livre
        self.dormir = dormir
        self.agora = agora
        self._em = 0.0
        self._motivo = None

    # ------------------------------------------------------------ prioridade
    def julia_primeiro(self) -> bool:
        """Das 8h às 18h (hora do PC, São Paulo) a placa é da JUL.IA; fora disso, da fábrica."""
        if self.respeitar:
            return False
        hora = time.localtime(self.agora()).tm_hour
        return self.das <= hora < self.ate

    def pedir(self, minutos: float = MINUTOS_DE_PRIORIDADE):
        """A JUL.IA vai precisar da placa: a fábrica cede (lê este arquivo junto com a URA).
        Só no horário dela; de madrugada a fábrica não é interrompida."""
        if not self.sinal or not self.julia_primeiro():
            return
        try:
            ate = self.agora() + minutos * 60
            atual = float(self.sinal.read_text().strip() or 0) if self.sinal.exists() else 0
            if ate > atual:
                tmp = self.sinal.with_suffix(".tmp")
                tmp.write_text(f"{ate:.0f}")
                tmp.replace(self.sinal)
        except (OSError, ValueError):
            pass

    def esperar_memoria(self, gb: float = GB_PARA_O_MODELO, maximo_s: float = ESPERA_MAXIMA_S) -> float:
        """Espera a fábrica soltar a placa (até `maximo_s`). Devolve quantos segundos esperou."""
        inicio = self.agora()
        while True:
            livre = self.memoria_livre()
            if livre is None or livre >= gb or self.agora() - inicio >= maximo_s:
                return self.agora() - inicio
            self.dormir(2)

    # ------------------------------------------------------------ madrugada
    def ocupada(self) -> str | None:
        """Motivo para a JUL.IA esperar, ou None. No horário dela, nunca espera; de madrugada
        espera ligação da URA e render da fábrica (a criação de conteúdo vem primeiro)."""
        if self.julia_primeiro():
            return None
        if time.time() - self._em < self.validade_s:
            return self._motivo
        motivo = None
        n = ligacoes_na_ura()
        if n:
            motivo = f"URA em ligação ({n})"
        else:
            r = render_da_fabrica()
            if r:
                motivo = f"render da fábrica ({r})"
        self._em, self._motivo = time.time(), motivo
        return motivo
