"""JUL.IA — trabalhador local do agente de vendas do WhatsApp da Balão.

Roda no PC do Thiago (tarefa do Agendador do Windows, instalada pelo
instalar.ps1). Puxa da VPS as conversas que precisam de resposta, entende
texto, áudio, foto e vídeo com modelos locais (Ollama + faster-whisper), busca
no catálogo do site, emite orçamento e pedido no Bling e devolve a resposta.
Liga e desliga no Centro de Comando do /crm (aba JUL.IA). Sem API paga.

  python julia.py              laço contínuo (o que a tarefa agendada roda)
  python julia.py --conferir   confere tudo (VPS, Ollama, Whisper, ffmpeg, catálogo, Bling) sem mandar nada
  python julia.py --conversar  conversa com a JUL.IA aqui no terminal, como se fosse um cliente
                               (catálogo de verdade, Bling simulado, nada vai para o WhatsApp)
  python julia.py --uma-vez    atende uma conversa (se houver) e sai
"""
from __future__ import annotations

import argparse
import logging
import logging.handlers
import os
import shutil
import sys
import time
import traceback
from pathlib import Path

import config as C
from bling import Bling
from catalogo import Catalogo
from cerebro import Atendimento
from ollama import Ollama
from placa import Placa
from rede import ErroHttp
from sentidos import Sentidos
from vps import Vps

VERSAO = "2026-10-12"
log = logging.getLogger("julia")


def configurar_log(pasta: str):
    log.setLevel(logging.INFO)
    fmt = logging.Formatter("%(asctime)s %(message)s", "%d/%m %H:%M:%S")
    arq = logging.handlers.RotatingFileHandler(Path(pasta) / "julia.log", maxBytes=5_000_000, backupCount=3, encoding="utf-8")
    arq.setFormatter(fmt)
    log.addHandler(arq)
    if sys.stdout:  # pythonw (a tarefa agendada) não tem tela
        tela = logging.StreamHandler(sys.stdout)
        tela.setFormatter(fmt)
        log.addHandler(tela)


def trava_unica(pasta: str):
    """Uma JUL.IA por PC: a tarefa agendada pode tentar abrir de novo."""
    caminho = Path(pasta) / "julia.trava"
    arq = open(caminho, "a+")
    try:
        if os.name == "nt":
            import msvcrt

            msvcrt.locking(arq.fileno(), msvcrt.LK_NBLCK, 1)
        else:
            import fcntl

            fcntl.flock(arq.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        print("A JUL.IA já está rodando neste PC.")
        sys.exit(0)
    return arq


class Trabalhador:
    def __init__(self, cfg: dict, vps: Vps | None):
        self.cfg = cfg
        self.vps = vps
        self.ollama = Ollama(cfg["ollama_url"])
        self.catalogo = Catalogo(cfg["pasta_dados"], buscar_remoto=vps.catalogo if vps else None)
        self.placa = Placa(cfg.get("respeitar_placa", True))
        self.sentidos = Sentidos(cfg, self.ollama, baixar=vps.midia if vps else (lambda _id: (b"", "")), registrar=log.info)
        self.bling_real = Bling(cfg["bling_tokens"], vendedor_id=cfg.get("bling_vendedor_id"))
        self.bling_teste = Bling(cfg["bling_tokens"], simular=True)
        self.ultima_batida = 0.0
        self.atendidas = 0
        self.erros = 0
        self.motivo_espera = None

    def bling_para(self, trabalho: dict) -> Bling:
        teste = (trabalho.get("config") or {}).get("publico") == "teste"
        return self.bling_teste if teste and not self.cfg.get("bling_no_teste") else self.bling_real

    def atender(self, trabalho: dict) -> dict:
        inicio = time.time()
        memoria = dict(trabalho.get("memoria") or {})
        trabalho["memoria"] = memoria
        transcricoes = self.sentidos.entender(trabalho.get("mensagens") or [], memoria)
        resultado = Atendimento(
            trabalho=trabalho,
            ollama=self.ollama,
            modelo=self.cfg["modelo"],
            catalogo=self.catalogo,
            bling=self.bling_para(trabalho),
            contexto=int(self.cfg.get("contexto") or 16384),
            registrar=log.info,
        ).responder()
        resultado.update({"id": trabalho["id"], "chatId": trabalho["chatId"], "ultimaId": trabalho.get("ultimaId"),
                          "transcricoes": transcricoes, "duracaoMs": int((time.time() - inicio) * 1000)})
        return resultado

    def batida(self, forcar=False):
        if not self.vps or (not forcar and time.time() - self.ultima_batida < 15):
            return
        self.ultima_batida = time.time()
        try:
            carregados = self.ollama.carregados()
        except Exception:
            carregados = None
        info = {
            "versao": VERSAO,
            "modelo": self.cfg["modelo"],
            "ollama": carregados is not None,
            "modeloNaPlaca": bool(carregados and any(m.startswith(self.cfg["modelo"]) for m in carregados)),
            "esperando": self.motivo_espera,
            "catalogo": {"produtos": len(self.catalogo.produtos), "atualizadoEm": self.catalogo.atualizado_em},
            "atendidas": self.atendidas,
            "erros": self.erros,
            "computador": os.environ.get("COMPUTERNAME") or "",
        }
        try:
            self.vps.batida(info)
        except Exception as e:
            log.info(f"[vps] batida falhou: {e}")

    def uma_rodada(self) -> bool:
        """Atende uma conversa, se houver. Devolve True se trabalhou."""
        self.batida()
        self.catalogo.atualizar()
        self.sentidos.soltar_placa()
        self.motivo_espera = self.placa.ocupada()
        if self.motivo_espera:
            return False
        r = self.vps.trabalho()
        trabalho = r.get("trabalho")
        if not trabalho:
            return False
        sufixo = str(trabalho.get("chatId", ""))[-9:]
        log.info(f"[julia] atendendo …{sufixo} ({len(trabalho.get('mensagens') or [])} mensagens)")
        try:
            resultado = self.atender(trabalho)
            self.atendidas += 1
        except Exception as e:
            self.erros += 1
            log.info(f"[julia] erro …{sufixo}: {e}\n{traceback.format_exc(limit=3)}")
            resultado = {"id": trabalho["id"], "chatId": trabalho["chatId"], "erro": str(e)[:400]}
        resposta = self.vps.resultado(resultado)
        log.info(f"[julia] …{sufixo}: {len(resultado.get('respostas') or [])} resposta(s) em {resultado.get('duracaoMs', 0)} ms -> {resposta}")
        return True

    def laco(self):
        log.info(f"[julia] JUL.IA {VERSAO} no ar: modelo {self.cfg['modelo']}, VPS {self.cfg['vps_url']}")
        self.catalogo.atualizar(forcar=True)
        espera = float(self.cfg.get("intervalo_s") or 2)
        while True:
            try:
                trabalhou = self.uma_rodada()
                time.sleep(0.2 if trabalhou else espera)
            except ErroHttp as e:
                log.info(f"[vps] {e}")
                time.sleep(30 if e.status in (401, 409) else 10)
            except Exception as e:
                log.info(f"[julia] laço: {e}")
                time.sleep(10)


# ---------------------------------------------------------------- comandos
def conferir(cfg: dict) -> int:
    ok = True

    def linha(nome, bom, detalhe=""):
        nonlocal ok
        ok = ok and bom
        print(f"  {'OK ' if bom else 'FALTA'}  {nome}{(': ' + detalhe) if detalhe else ''}")

    print("Conferindo a JUL.IA (nada é enviado a cliente)\n")
    try:
        segredo = C.ler_segredo(cfg)
        linha("segredo da VPS", True, cfg["arquivo_segredo"])
    except SystemExit as e:
        linha("segredo da VPS", False, str(e))
        segredo = None
    vps = Vps(cfg["vps_url"], segredo) if segredo else None
    if vps:
        try:
            r = vps.batida({"versao": VERSAO, "conferindo": True})
            modo = (r.get("config") or {}).get("modo")
            linha("VPS", True, f"{cfg['vps_url']} (agente {modo})")
        except Exception as e:
            linha("VPS", False, str(e)[:200])
    o = Ollama(cfg["ollama_url"])
    try:
        modelos = o.modelos()
        linha("Ollama", True, f"{len(modelos)} modelos")
        linha(f"modelo de conversa {cfg['modelo']}", any(m == cfg["modelo"] or m.startswith(cfg["modelo"] + ":") for m in modelos),
              "" if cfg["modelo"] in modelos else f"rode: ollama pull {cfg['modelo']}")
        visao = Sentidos(cfg, o, baixar=None).modelo_visao()
        linha("modelo de visão", bool(visao), visao or "rode: ollama pull qwen2.5vl:7b")
    except Exception as e:
        linha("Ollama", False, f"{e} (o Ollama está aberto?)")
    try:
        import faster_whisper  # noqa: F401

        linha("faster-whisper", True)
    except Exception as e:
        linha("faster-whisper", False, f"{e} (rode o instalar.ps1)")
    linha("ffmpeg (vídeo)", bool(shutil.which("ffmpeg")), "" if shutil.which("ffmpeg") else "sem ffmpeg no PATH: vídeo fica sem análise")
    cat = Catalogo(cfg["pasta_dados"], buscar_remoto=vps.catalogo if vps else None)
    cat.atualizar(forcar=True)
    linha("catálogo do site", bool(cat.produtos), f"{len(cat.produtos)} produtos, de {cat.atualizado_em}")
    b = Bling(cfg["bling_tokens"]).conferir()
    linha("Bling (leitura)", b.get("token_lido") and all(b.get(k) == "ok" for k in ("contatos", "propostas", "pedidos")),
          ", ".join(f"{k}: {v}" for k, v in b.items() if k in ("contatos", "propostas", "pedidos", "erro")))
    motivo = Placa(True, 0).ocupada()
    linha("placa de vídeo", True, motivo or "livre")
    print("\nTudo certo." if ok else "\nFalta alguma coisa acima.")
    return 0 if ok else 1


def conversar(cfg: dict) -> int:
    """Você é o cliente; nada sai do PC (Bling simulado, sem WhatsApp)."""
    segredo = None
    try:
        segredo = C.ler_segredo(cfg)
    except SystemExit:
        pass
    vps = Vps(cfg["vps_url"], segredo) if segredo else None
    t = Trabalhador(cfg, vps)
    t.bling_real = t.bling_teste  # nunca de verdade aqui
    t.catalogo.atualizar(forcar=True)
    if not t.catalogo.produtos:
        print("Sem catálogo: rode uma vez com a VPS acessível (segredo instalado).")
        return 1
    print(f"Conversa de teste com a JUL.IA ({cfg['modelo']}, {len(t.catalogo.produtos)} produtos). Ctrl+C sai.\n")
    mensagens, dados, memoria, n = [], {}, {}, 0
    while True:
        try:
            texto = input("você> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            return 0
        if not texto:
            continue
        n += 1
        mensagens.append({"id": f"T{n}", "de": "cliente", "tipo": "texto", "texto": texto})
        trabalho = {"id": f"teste{n}", "chatId": "teste@c.us", "nome": "Teste", "numero": "5519984515960",
                    "primeiraVez": not memoria.get("apresentou"), "mensagens": mensagens[-30:], "dados": dados,
                    "memoria": memoria, "config": {"modo": "automatico", "publico": "teste", "vendaAutomatica": True}}
        r = t.atender(trabalho)
        dados, memoria = r["dados"], r["memoria"]
        for resp in r["respostas"]:
            if resp["tipo"] == "texto":
                print(f"\nJUL.IA> {resp['texto']}\n")
                mensagens.append({"id": f"J{n}", "de": "julia", "tipo": "texto", "texto": resp["texto"]})
            else:
                p = t.catalogo.produto(resp["produtoId"])
                print(f"   [cartão do produto: {p and p.get('name')} — R$ {p and p.get('price')}]")
        for a in r["acoes"]:
            print(f"   [{a['tipo']} {'nº ' + str(a.get('numero')) if a.get('numero') else 'ERRO: ' + str(a.get('erro'))}]")
        if r.get("transferir"):
            print(f"   [chamou um vendedor: {r['transferir']['motivo']}]")
        print(f"   ({r['duracaoMs'] / 1000:.1f} s)")


def main():
    ap = argparse.ArgumentParser(description="JUL.IA — agente local do WhatsApp da Balão")
    ap.add_argument("--conferir", action="store_true")
    ap.add_argument("--conversar", action="store_true")
    ap.add_argument("--uma-vez", action="store_true")
    a = ap.parse_args()
    cfg = C.carregar()
    if a.conferir:
        sys.exit(conferir(cfg))
    if a.conversar:
        sys.exit(conversar(cfg))
    configurar_log(cfg["pasta_dados"])
    _trava = trava_unica(cfg["pasta_dados"])  # noqa: F841 (segura o arquivo aberto)
    t = Trabalhador(cfg, Vps(cfg["vps_url"], C.ler_segredo(cfg)))
    if a.uma_vez:
        t.catalogo.atualizar(forcar=True)
        t.uma_rodada()
        return
    t.laco()


if __name__ == "__main__":
    main()
