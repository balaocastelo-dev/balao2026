"""Ouvir e ver: áudio, foto e vídeo do cliente viram texto para o cérebro.

- Áudio: faster-whisper, o mesmo modelo da URA (large-v3-turbo na placa de
  vídeo). Sem placa, cai para o "small" no processador.
- Foto: modelo de visão do Ollama (qwen2.5vl:7b no PC), que sai da placa logo
  depois de responder (keep_alive 0).
- Vídeo: ffmpeg tira o áudio (vai para o Whisper) e três quadros (vão para o
  modelo de visão).

A transcrição volta para a VPS e aparece no CRM para o vendedor também.
"""
from __future__ import annotations

import gc
import os
import shutil
import subprocess
import tempfile
import threading
import time
from pathlib import Path

PERGUNTA_FOTO = (
    "Esta foto foi enviada por um cliente para uma loja de informática pelo WhatsApp. "
    "Descreva em português, em até 3 frases e sem inventar: o que é o produto ou equipamento, "
    "marca e modelo se estiverem legíveis, defeitos visíveis e textos importantes (tela, etiqueta, erro)."
)
PERGUNTA_VIDEO = (
    "Estes são três quadros de um vídeo que um cliente mandou para uma loja de informática pelo WhatsApp. "
    "Descreva em português, em até 3 frases e sem inventar, o que aparece: produto ou equipamento, marca e modelo "
    "se legíveis, defeito ou problema visível, textos na tela."
)
TIPOS_DE_AUDIO = ("audio", "ptt")
MAX_MIDIAS_POR_RODADA = 6


class Sentidos:
    def __init__(self, cfg: dict, ollama, baixar, registrar=print):
        self.cfg = cfg
        self.ollama = ollama
        self.baixar = baixar  # (mensagem_id) -> (bytes, mimetype)
        self.registrar = registrar
        self._whisper = None
        self._whisper_usado = 0.0
        self._trava = threading.Lock()
        self._modelo_visao = None

    # ------------------------------------------------------------ áudio
    def _carregar_whisper(self):
        from faster_whisper import WhisperModel  # só aqui: o resto funciona sem ele

        modelo = self.cfg.get("whisper_modelo") or "deepdml/faster-whisper-large-v3-turbo-ct2"
        dispositivo = self.cfg.get("whisper_dispositivo") or "cuda"
        try:
            self._whisper = WhisperModel(modelo, device=dispositivo, compute_type="float16" if dispositivo == "cuda" else "int8")
        except Exception as e:
            self.registrar(f"[sentidos] Whisper na placa falhou ({e}); uso o small no processador")
            self._whisper = WhisperModel("small", device="cpu", compute_type="int8")

    def soltar_placa(self, ocioso_s: float = 600):
        """Whisper parado há 10 min sai da placa (a fábrica e a URA precisam dela)."""
        with self._trava:
            if self._whisper is not None and time.time() - self._whisper_usado > ocioso_s:
                self._whisper = None
                gc.collect()

    def transcrever(self, conteudo: bytes, sufixo: str = ".ogg") -> str:
        with self._trava:
            if self._whisper is None:
                self._carregar_whisper()
            self._whisper_usado = time.time()
            with tempfile.NamedTemporaryFile(suffix=sufixo, delete=False) as f:
                f.write(conteudo)
                caminho = f.name
            try:
                segmentos, _ = self._whisper.transcribe(caminho, language="pt", vad_filter=True, beam_size=1)
                return " ".join(s.text.strip() for s in segmentos).strip()
            finally:
                try:
                    os.unlink(caminho)
                except OSError:
                    pass

    # ------------------------------------------------------------ visão
    def modelo_visao(self) -> str | None:
        if self._modelo_visao:
            return self._modelo_visao
        from config import MODELOS_DE_VISAO

        instalados = self.ollama.modelos()
        pedido = self.cfg.get("modelo_visao")
        if pedido and pedido in instalados:
            self._modelo_visao = pedido
        else:
            for prefixo in MODELOS_DE_VISAO:
                achado = next((m for m in instalados if m.startswith(prefixo)), None)
                if achado:
                    self._modelo_visao = achado
                    break
        return self._modelo_visao

    def descrever_imagem(self, conteudo: bytes) -> str:
        modelo = self.modelo_visao()
        if not modelo:
            return ""
        return self.ollama.ver(modelo, conteudo, PERGUNTA_FOTO)

    # ------------------------------------------------------------ vídeo
    def entender_video(self, conteudo: bytes) -> tuple[str, str]:
        ffmpeg = shutil.which("ffmpeg")
        if not ffmpeg:
            return "", ""
        pasta = Path(tempfile.mkdtemp(prefix="julia-video-"))
        try:
            video = pasta / "video.mp4"
            video.write_bytes(conteudo)
            audio = pasta / "audio.wav"
            subprocess.run([ffmpeg, "-y", "-loglevel", "error", "-i", str(video), "-vn", "-ac", "1", "-ar", "16000", str(audio)],
                           timeout=120, check=False)
            fala = self.transcrever(audio.read_bytes(), ".wav") if audio.exists() and audio.stat().st_size > 2000 else ""
            # Três quadros (10%, 50% e 90% do vídeo), numa pergunta só ao modelo de visão.
            duracao = 0.0
            ffprobe = shutil.which("ffprobe")
            if ffprobe:
                r = subprocess.run([ffprobe, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video)],
                                   capture_output=True, text=True, timeout=60, check=False)
                try:
                    duracao = float((r.stdout or "0").strip() or 0)
                except ValueError:
                    duracao = 0.0
            quadros = []
            for i, fracao in enumerate((0.1, 0.5, 0.9)):
                saida = pasta / f"q{i}.jpg"
                subprocess.run([ffmpeg, "-y", "-loglevel", "error", "-ss", f"{duracao * fracao:.2f}", "-i", str(video),
                                "-frames:v", "1", "-vf", "scale=640:-1", str(saida)], timeout=60, check=False)
                if saida.exists():
                    quadros.append(saida.read_bytes())
            modelo = self.modelo_visao()
            visto = self.ollama.ver(modelo, quadros, PERGUNTA_VIDEO) if quadros and modelo else ""
            return fala, visto
        finally:
            shutil.rmtree(pasta, ignore_errors=True)

    # ------------------------------------------------------------ conversa
    def entender(self, mensagens: list[dict], memoria: dict) -> list[dict]:
        """Preenche `conteudo` de cada mensagem; devolve as transcrições novas (para a VPS)."""
        descricoes = memoria.setdefault("descricoes", {})
        novas_transcricoes = []
        pendentes = [m for m in mensagens if m.get("midia") and m.get("de") == "cliente"][-MAX_MIDIAS_POR_RODADA:]
        for m in mensagens:
            texto = (m.get("texto") or "").strip()
            tipo = m.get("tipo") or "texto"
            if not m.get("midia"):
                m["conteudo"] = texto
                continue
            partes = []
            try:
                if tipo in TIPOS_DE_AUDIO:
                    fala = m.get("transcricao") or descricoes.get(m["id"])
                    if not fala and m in pendentes:
                        conteudo, _ = self.baixar(m["id"])
                        fala = self.transcrever(conteudo)
                        if fala:
                            novas_transcricoes.append({"id": m["id"], "texto": fala})
                            descricoes[m["id"]] = fala
                    partes.append(f"[áudio do cliente: {fala}]" if fala else "[áudio que não deu para entender]")
                elif tipo in ("image", "sticker"):
                    if tipo == "sticker":
                        partes.append("[figurinha]")
                    else:
                        visto = descricoes.get(m["id"])
                        if not visto and m in pendentes:
                            conteudo, _ = self.baixar(m["id"])
                            visto = self.descrever_imagem(conteudo)
                            if visto:
                                descricoes[m["id"]] = visto
                        partes.append(f"[foto: {visto}]" if visto else "[foto]")
                elif tipo == "video":
                    visto = descricoes.get(m["id"])
                    if not visto and m in pendentes:
                        conteudo, _ = self.baixar(m["id"])
                        fala, imagem = self.entender_video(conteudo)
                        if fala:
                            novas_transcricoes.append({"id": m["id"], "texto": fala})
                        visto = " ".join(x for x in (f"fala: {fala}" if fala else "", f"imagem: {imagem}" if imagem else "") if x)
                        if visto:
                            descricoes[m["id"]] = visto
                    partes.append(f"[vídeo — {visto}]" if visto else "[vídeo]")
                elif tipo == "document":
                    partes.append(f"[documento: {(m.get('midia') or {}).get('nome') or 'arquivo'}]")
                else:
                    partes.append(f"[{tipo}]")
            except Exception as e:
                self.registrar(f"[sentidos] não consegui ler a mídia {m.get('id')}: {e}")
                partes.append(f"[{tipo} que não consegui abrir]")
            if texto:
                partes.append(texto)
            m["conteudo"] = " ".join(partes)
        # A memória guarda só as 30 descrições mais novas.
        if len(descricoes) > 30:
            for chave in list(descricoes)[:-30]:
                descricoes.pop(chave, None)
        return novas_transcricoes
