"""A placa de vídeo é uma só: URA primeiro, renders da fábrica não dividem.

Mesmo sinal que a fábrica usa (publisher/capa_blog.py e avatar/fila_avatar.py):
- URA em ligação: `asterisk -rx 'core show channels count'` no WSL;
- render em andamento: processo python de vídeo/avatar/foto da fábrica rodando.

A JUL.IA espera a placa ficar livre antes de pegar a próxima conversa. O
cliente espera alguns segundos a mais; a ligação da URA não engasga e o render
não estoura a memória da placa (o que deixa tudo ~100 vezes mais lento, sem erro).
"""
from __future__ import annotations

import json
import os
import subprocess
import time

OCUPANTES = ["video_diario.py", "video_dica.py", "fila_avatar.py", "run_avatar.py", "upscale_seedvr2.py",
             "criar_figurino.py", "capa_blog.py"]
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


class Placa:
    def __init__(self, respeitar: bool = True, validade_s: float = 15):
        self.respeitar = respeitar
        self.validade_s = validade_s
        self._em = 0.0
        self._motivo = None

    def ocupada(self) -> str | None:
        """Motivo para esperar, ou None se a placa está livre para a JUL.IA."""
        if not self.respeitar:
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
