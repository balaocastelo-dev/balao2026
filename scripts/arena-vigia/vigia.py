"""Vigia da Arena: leva as vendas e os orçamentos do Bling para a corrida do site.

Roda no PC do Thiago a cada 2 minutos (tarefa \\BalaoFabrica\\Arena Vigia).
Por que no PC: o token do Bling só existe aqui. A sentinela do Bionic
(07-Scripts\\bling-oauth) renova a cada 2 minutos e cada renovação invalida a
anterior, então o vigia só LÊ o arquivo de tokens — nunca renova.

O que faz a cada volta:
  1. lista pedidos de venda e propostas comerciais dos últimos 3 dias
     (de hora em hora, dos últimos 40 dias, para pegar cancelamento antigo;
     na primeira vez, dos últimos 3 meses, para o hall da fama);
  2. abre o detalhe só do que é novo ou mudou (é lá que vêm o vendedor e os
     itens — a listagem do Bling não traz o vendedor);
  3. manda para www.balao.info/api/arena/bling, que pontua e põe no telão.

Só usa a biblioteca padrão do Python. Uso:
  python vigia.py              uma volta (é o que a tarefa agendada roda)
  python vigia.py --conferir   confere Bling e site sem gravar nada
  python vigia.py --desde 2026-09-01   varre desde uma data
"""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
import socket
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

VERSAO = "1.0"
AQUI = Path(__file__).resolve().parent
CASA = Path(os.environ.get("USERPROFILE") or os.environ.get("HOME") or ".")

PADRAO = {
    "site": "https://www.balao.info",
    "arquivo_chave": str(CASA / ".balao-arena" / "chave.txt"),
    "bling_tokens": r"C:\Users\user\Documents\07-Scripts\bling-oauth\bling_tokens.json",
    "pasta_dados": str(AQUI / "dados"),
    "dias_da_volta": 3,
    "dias_da_hora": 40,
    "meses_da_primeira": 3,
}

API = "https://api.bling.com.br/Api/v3"


# ------------------------------------------------------------------ config e registro

def carregar_config() -> dict:
    cfg = dict(PADRAO)
    arq = AQUI / "config.json"
    if arq.exists():
        try:
            cfg.update(json.loads(arq.read_text(encoding="utf-8")))
        except Exception as e:
            print(f"[config] config.json ignorado: {e}")
    Path(cfg["pasta_dados"]).mkdir(parents=True, exist_ok=True)
    return cfg


class Registro:
    def __init__(self, pasta: str):
        self.arq = Path(pasta) / "vigia.log"

    def __call__(self, *partes):
        linha = f"{dt.datetime.now():%Y-%m-%d %H:%M:%S} " + " ".join(str(p) for p in partes)
        print(linha)
        try:
            if self.arq.exists() and self.arq.stat().st_size > 2_000_000:
                self.arq.replace(self.arq.with_suffix(".log.1"))
            with self.arq.open("a", encoding="utf-8") as f:
                f.write(linha + "\n")
        except OSError:
            pass


# ------------------------------------------------------------------ HTTP

class ErroHttp(Exception):
    def __init__(self, status: int, corpo: str):
        super().__init__(f"HTTP {status}: {corpo[:200]}")
        self.status = status
        self.corpo = corpo


def pedir(url: str, metodo="GET", dados=None, cabecalhos=None, espera=30):
    corpo = None
    cab = {"Accept": "application/json", "User-Agent": f"balao-arena-vigia/{VERSAO}"}
    cab.update(cabecalhos or {})
    if dados is not None:
        corpo = json.dumps(dados).encode("utf-8")
        cab["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=corpo, method=metodo, headers=cab)
    try:
        with urllib.request.urlopen(req, timeout=espera) as r:
            texto = r.read().decode("utf-8") or "{}"
            return json.loads(texto)
    except urllib.error.HTTPError as e:
        raise ErroHttp(e.code, e.read().decode("utf-8", "replace")) from None


# ------------------------------------------------------------------ Bling (só leitura)

class Bling:
    def __init__(self, arquivo_tokens: str, log):
        self.arquivo = Path(arquivo_tokens)
        self.log = log
        self._ultima = 0.0
        self.chamadas = 0

    def _token(self) -> str:
        try:
            return json.loads(self.arquivo.read_text(encoding="utf-8"))["access_token"]
        except FileNotFoundError:
            raise RuntimeError(f"sem acesso ao Bling: falta {self.arquivo}") from None

    def get(self, caminho: str, params: dict | None = None) -> dict:
        url = f"{API}/{caminho.lstrip('/')}"
        if params:
            url += "?" + urllib.parse.urlencode(params, doseq=True)
        for tentativa in range(4):
            espaco = self._ultima + 0.4 - time.time()  # limite da conta: 3 por segundo
            if espaco > 0:
                time.sleep(espaco)
            self._ultima = time.time()
            self.chamadas += 1
            try:
                return pedir(url, cabecalhos={"Authorization": f"Bearer {self._token()}"})
            except ErroHttp as e:
                if e.status == 429 and tentativa < 3:
                    time.sleep(1.5 * (tentativa + 1))
                    continue
                if e.status == 401 and tentativa == 0:
                    self.log("Bling 401: esperando a sentinela do Bionic renovar o token")
                    time.sleep(75)
                    continue
                raise
        return {}

    def listar(self, caminho: str, params: dict, teto_paginas=60):
        for pagina in range(1, teto_paginas + 1):
            r = self.get(caminho, {**params, "pagina": pagina, "limite": 100})
            dados = r.get("data") or []
            yield from dados
            if len(dados) < 100:
                return


# ------------------------------------------------------------------ montagem dos documentos

def _id(v) -> str | None:
    s = "".join(ch for ch in str(v or "") if ch.isdigit())
    return s if s and s != "0" else None


def assinatura_da_lista(x: dict, tipo: str) -> str:
    """O que, na listagem, muda quando o documento muda."""
    sit = x.get("situacao")
    sit = sit.get("id") if isinstance(sit, dict) else sit
    return f"{tipo}|{x.get('numero')}|{x.get('data')}|{x.get('total')}|{sit}|{(x.get('contato') or {}).get('id')}"


def documento_de_venda(det: dict) -> dict:
    sit = det.get("situacao") or {}
    contato = det.get("contato") or {}
    return {
        "tipo": "venda",
        "blingId": _id(det.get("id")),
        "numero": str(det.get("numero") or ""),
        "data": str(det.get("data") or "")[:10],
        "vendedorBlingId": _id((det.get("vendedor") or {}).get("id")),
        "contatoId": _id(contato.get("id")),
        "contatoNome": contato.get("nome") or None,
        "total": float(det.get("total") or 0),
        "situacaoId": sit.get("id") if isinstance(sit, dict) else None,
        "situacao": None,
        "itens": [
            {"descricao": str(i.get("descricao") or "")[:200], "quantidade": i.get("quantidade") or 1, "valor": i.get("valor") or 0}
            for i in (det.get("itens") or [])
        ],
    }


def documento_de_orcamento(det: dict, nome_contato: str | None = None) -> dict:
    contato = det.get("contato") or {}
    return {
        "tipo": "orcamento",
        "blingId": _id(det.get("id")),
        "numero": str(det.get("numero") or ""),
        "data": str(det.get("data") or "")[:10],
        "vendedorBlingId": _id((det.get("vendedor") or {}).get("id")),
        "contatoId": _id(contato.get("id")),
        "contatoNome": contato.get("nome") or nome_contato,
        "total": float(det.get("total") or 0),
        "situacaoId": None,
        "situacao": str(det.get("situacao") or "")[:60] or None,
        "itens": [
            {
                "descricao": str((i.get("produto") or {}).get("descricao") or i.get("descricao") or "")[:200],
                "quantidade": i.get("quantidade") or 1,
                "valor": i.get("valor") or 0,
            }
            for i in (det.get("itens") or [])
        ],
    }


def assinar(doc: dict) -> str:
    return hashlib.sha1(json.dumps(doc, sort_keys=True, ensure_ascii=False).encode("utf-8")).hexdigest()


# ------------------------------------------------------------------ estado local

class Estado:
    def __init__(self, pasta: str):
        self.arq = Path(pasta) / "estado.json"
        try:
            self.d = json.loads(self.arq.read_text(encoding="utf-8"))
        except Exception:
            self.d = {}
        self.d.setdefault("docs", {})  # id -> {lista, doc, enviado}

    def salvar(self):
        # Esquece o que tem mais de 6 meses, para o arquivo não crescer sem fim.
        corte = (dt.date.today() - dt.timedelta(days=190)).isoformat()
        self.d["docs"] = {k: v for k, v in self.d["docs"].items() if (v.get("doc") or {}).get("data", "9") >= corte}
        tmp = self.arq.with_suffix(".tmp")
        tmp.write_text(json.dumps(self.d, ensure_ascii=False), encoding="utf-8")
        tmp.replace(self.arq)


# ------------------------------------------------------------------ a volta

def desde_da_volta(cfg: dict, estado: Estado, hoje: dt.date, pedido_do_site: str | None, forcado: str | None):
    if forcado:
        return forcado, "pedida na linha de comando"
    if pedido_do_site:
        return pedido_do_site, "pedida no painel"
    if not estado.d.get("primeira_feita"):
        m = hoje.month - cfg["meses_da_primeira"]
        a = hoje.year
        while m < 1:
            m += 12
            a -= 1
        return dt.date(a, m, 1).isoformat(), "primeira carga"
    ultima_hora = estado.d.get("ultima_completa")
    if not ultima_hora or time.time() - ultima_hora > 3600:
        return (hoje - dt.timedelta(days=cfg["dias_da_hora"])).isoformat(), "revisão de hora em hora"
    return (hoje - dt.timedelta(days=cfg["dias_da_volta"])).isoformat(), "volta"


def coletar(bling: Bling, estado: Estado, desde: str, ate: str, log) -> list[dict]:
    """Devolve os documentos novos ou mudados desde a última volta."""
    mudados = []
    docs = estado.d["docs"]

    for x in bling.listar("pedidos/vendas", {"dataInicial": desde, "dataFinal": ate}):
        chave = f"venda:{x.get('id')}"
        lista = assinatura_da_lista(x, "venda")
        anterior = docs.get(chave)
        if anterior and anterior.get("lista") == lista and anterior.get("doc"):
            continue
        det = bling.get(f"pedidos/vendas/{x['id']}").get("data") or {}
        if not det:
            continue
        doc = documento_de_venda(det)
        docs[chave] = {"lista": lista, "doc": doc, "enviado": (anterior or {}).get("enviado")}
        mudados.append(chave)

    for x in bling.listar("propostas-comerciais", {"dataInicial": desde, "dataFinal": ate}):
        chave = f"orcamento:{x.get('id')}"
        lista = assinatura_da_lista(x, "orcamento")
        anterior = docs.get(chave)
        if anterior and anterior.get("lista") == lista and anterior.get("doc"):
            continue
        det = bling.get(f"propostas-comerciais/{x['id']}").get("data") or {}
        if not det:
            continue
        doc = documento_de_orcamento(det, (x.get("contato") or {}).get("nome"))
        docs[chave] = {"lista": lista, "doc": doc, "enviado": (anterior or {}).get("enviado")}
        mudados.append(chave)

    log(f"Bling: {len(mudados)} novos ou mudados desde {desde} ({bling.chamadas} chamadas)")
    return mudados


def vendedores_do_bling(bling: Bling) -> list[dict]:
    lista = []
    for v in bling.listar("vendedores", {}, teto_paginas=5):
        nome = ((v.get("contato") or {}).get("nome") or "").strip()
        if v.get("id"):
            lista.append({"id": str(v["id"]), "nome": nome})
    return lista


def enviar(cfg: dict, chave: str, corpo: dict) -> dict:
    return pedir(
        f"{cfg['site'].rstrip('/')}/api/arena/bling",
        metodo="POST",
        dados=corpo,
        cabecalhos={"Authorization": f"Bearer {chave}"},
        espera=60,
    )


def uma_volta(cfg: dict, forcado: str | None = None, conferir: bool = False) -> int:
    log = Registro(cfg["pasta_dados"])
    trava = Path(cfg["pasta_dados"]) / "rodando.trava"
    if trava.exists() and time.time() - trava.stat().st_mtime < 20 * 60 and not conferir:
        log("Outra volta ainda está rodando; pulo esta.")
        return 0
    trava.write_text(str(os.getpid()), encoding="utf-8")
    try:
        try:
            chave = Path(cfg["arquivo_chave"]).read_text(encoding="utf-8").strip()
        except FileNotFoundError:
            log(f"Falta a chave do vigia em {cfg['arquivo_chave']}. Gere em www.balao.info/painel/arena → Conexão com o Bling.")
            return 2

        site_url = f"{cfg['site'].rstrip('/')}/api/arena/bling"
        try:
            ping = pedir(site_url, cabecalhos={"Authorization": f"Bearer {chave}"})
        except ErroHttp as e:
            log(f"O site recusou a chave ({e.status}). Gere outra no painel e rode o instalar.ps1 de novo.")
            return 3
        pedido_do_site = ping.get("varrerDesde")

        estado = Estado(cfg["pasta_dados"])
        bling = Bling(cfg["bling_tokens"], log)
        hoje = dt.date.today()
        desde, motivo = desde_da_volta(cfg, estado, hoje, pedido_do_site, forcado)
        log(f"Volta ({motivo}): de {desde} a {hoje.isoformat()}")

        erro = None
        try:
            coletar(bling, estado, desde, hoje.isoformat(), log)
        except Exception as e:  # o que já foi coletado ainda é enviado
            erro = f"{type(e).__name__}: {e}"[:300]
            log("Erro lendo o Bling:", erro)

        a_enviar = []
        for k, v in estado.d["docs"].items():
            doc = v.get("doc")
            if not doc:
                continue
            ass = assinar(doc)
            # Na varredura pedida, reenvia tudo da janela (o site pula o que já tem).
            reenviar = (pedido_do_site or forcado) and doc.get("data", "") >= desde
            if v.get("enviado") != ass or reenviar:
                a_enviar.append((k, doc, ass))

        vendedores = None
        if not estado.d.get("vendedores_em") or time.time() - estado.d["vendedores_em"] > 3600:
            try:
                vendedores = vendedores_do_bling(bling)
            except Exception as e:
                log("Não li os vendedores do Bling:", e)

        if conferir:
            log(f"[conferir] site ok; {len(a_enviar)} documentos seriam enviados; "
                f"{len(vendedores or [])} vendedores no Bling. Nada foi gravado.")
            return 0

        enviados = 0
        lotes = [a_enviar[i:i + 300] for i in range(0, len(a_enviar), 300)] or [[]]
        for n, lote in enumerate(lotes):
            corpo = {
                "vigia": {"versao": VERSAO, "maquina": socket.gethostname(), "erro": erro},
                "documentos": [d for _, d, _ in lote],
            }
            if n == 0 and vendedores:
                corpo["vendedores"] = vendedores
            if n == len(lotes) - 1 and pedido_do_site and not erro:
                corpo["varreduraFeita"] = pedido_do_site
            r = enviar(cfg, chave, corpo)
            for k, _, ass in lote:
                estado.d["docs"][k]["enviado"] = ass
            enviados += r.get("gravados", 0)

        if vendedores:
            estado.d["vendedores_em"] = time.time()
        if not erro:
            estado.d["primeira_feita"] = True
            if motivo != "volta":
                estado.d["ultima_completa"] = time.time()
        estado.salvar()
        log(f"Site: {len(a_enviar)} enviados, {enviados} gravados.")
        return 0 if not erro else 1
    finally:
        try:
            trava.unlink()
        except OSError:
            pass


def main(argv: list[str]) -> int:
    cfg = carregar_config()
    forcado = None
    if "--desde" in argv:
        i = argv.index("--desde")
        forcado = argv[i + 1] if i + 1 < len(argv) else None
        try:
            dt.date.fromisoformat(forcado or "")
        except ValueError:
            print("Use --desde AAAA-MM-DD")
            return 2
    return uma_volta(cfg, forcado=forcado, conferir="--conferir" in argv)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
