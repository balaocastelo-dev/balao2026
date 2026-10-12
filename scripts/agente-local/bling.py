"""Bling (API v3) a partir do PC: contato, proposta comercial e pedido de venda.

O acesso é o mesmo da sentinela do Bionic (07-Scripts\\bling-oauth). Aqui só se
LÊ o arquivo de tokens: a tarefa BionicSentinelaTempoReal renova a cada 2
minutos, e cada renovação do Bling invalida o refresh_token anterior — renovar
daqui derrubaria a sentinela (e ela a nós). Com 401, espera a sentinela.

Limite da conta: 3 pedidos por segundo.

Simulado: no modo teste da JUL.IA (só os números do Thiago) nada vai para o
Bling de verdade, para teste não virar pedido no relatório de vendas.
"""
from __future__ import annotations

import datetime as dt
import json
import secrets
import time
import urllib.parse
from pathlib import Path

from rede import ErroHttp, pedir

API = "https://api.bling.com.br/Api/v3"


def hoje() -> str:
    return dt.date.today().isoformat()


def mensagem_de_erro(e: Exception) -> str:
    """O Bling explica o erro num JSON; o vendedor precisa ler a explicação, não o código."""
    if isinstance(e, ErroHttp):
        try:
            j = json.loads(e.corpo)
            err = j.get("error") or {}
            partes = [err.get("description") or err.get("message") or ""]
            for f in err.get("fields") or []:
                partes.append(f.get("msg") or f.get("element") or "")
            texto = "; ".join(p for p in partes if p)
            if texto:
                return f"Bling recusou ({e.status}): {texto}"[:300]
        except Exception:
            pass
        return f"Bling respondeu {e.status}"
    return str(e)[:300]


class Bling:
    def __init__(self, arquivo_tokens: str, *, simular: bool = False, vendedor_id=None,
                 http=pedir, dormir=time.sleep, espera_401_s: float = 75):
        self.arquivo = Path(arquivo_tokens)
        self.simular = simular
        self.vendedor_id = vendedor_id
        self.http = http
        self.dormir = dormir
        self.espera_401_s = espera_401_s
        self._ultima = 0.0

    # ------------------------------------------------------------ base
    def _token(self) -> str:
        try:
            return json.loads(self.arquivo.read_text(encoding="utf-8"))["access_token"]
        except FileNotFoundError:
            raise RuntimeError(f"sem acesso ao Bling: falta {self.arquivo}") from None

    def _chamar(self, metodo: str, caminho: str, dados=None, params: dict | None = None):
        url = f"{API}/{caminho.lstrip('/')}"
        if params:
            url += "?" + urllib.parse.urlencode(params, doseq=True)
        for tentativa in range(4):
            espaco = 0.4 - (time.time() - self._ultima)
            if espaco > 0:
                self.dormir(espaco)
            self._ultima = time.time()
            try:
                return self.http(url, metodo=metodo, dados=dados,
                                 cabecalhos={"Authorization": f"Bearer {self._token()}"}, espera=30)
            except ErroHttp as e:
                if e.status == 429 and tentativa < 3:
                    self.dormir(1.5 * (tentativa + 1))
                    continue
                if e.status == 401 and tentativa == 0:
                    # A sentinela do Bionic renova em até 2 minutos.
                    self.dormir(self.espera_401_s)
                    continue
                raise
        return {}

    # ------------------------------------------------------------ contato
    def achar_contato(self, documento: str | None = None, telefone: str | None = None):
        if self.simular:
            return None
        if documento:
            r = self._chamar("GET", "contatos", params={"numeroDocumento": documento, "limite": 1})
            if r.get("data"):
                return r["data"][0]["id"]
        if telefone:
            r = self._chamar("GET", "contatos", params={"telefone": telefone[-11:], "limite": 1})
            if r.get("data"):
                return r["data"][0]["id"]
        return None

    def criar_contato(self, dados: dict, telefone: str) -> int | str:
        if self.simular:
            return f"SIM-{secrets.token_hex(3)}"
        doc = dados.get("cpf_cnpj") or ""
        corpo = {
            "nome": (dados.get("nome") or f"Cliente WhatsApp {telefone[-4:]}")[:120],
            "situacao": "A",
            "tipo": "J" if len(doc) == 14 else "F",
            "celular": telefone[-11:],
        }
        if doc:
            corpo["numeroDocumento"] = doc
        if dados.get("email"):
            corpo["email"] = dados["email"]
        if dados.get("cep") or dados.get("endereco"):
            corpo["endereco"] = {"geral": {k2: str(dados.get(k1) or "") for k1, k2 in (
                ("endereco", "endereco"), ("numero", "numero"), ("complemento", "complemento"),
                ("bairro", "bairro"), ("cep", "cep"), ("cidade", "municipio"), ("uf", "uf"))}}
        r = self._chamar("POST", "contatos", dados=corpo)
        return r["data"]["id"]

    def contato_para(self, dados: dict, telefone: str):
        doc = dados.get("cpf_cnpj") or None
        existente = self.achar_contato(doc, None) if doc else self.achar_contato(None, telefone)
        return existente or self.criar_contato(dados, telefone)

    # ------------------------------------------------------------ documentos
    @staticmethod
    def _itens_proposta(itens):
        return [{"produto": {"descricao": i["nome"][:120]}, "codigo": f"SITE-{i['id']}"[:60],
                 "quantidade": i["quantidade"], "valor": round(i["valor"], 2), "unidade": "UN"} for i in itens]

    @staticmethod
    def _itens_pedido(itens):
        return [{"descricao": i["nome"][:120], "codigo": f"SITE-{i['id']}"[:60],
                 "quantidade": i["quantidade"], "valor": round(i["valor"], 2), "unidade": "UN"} for i in itens]

    def _numero(self, caminho: str, ident) -> str:
        try:
            r = self._chamar("GET", f"{caminho}/{ident}")
            return str((r.get("data") or {}).get("numero") or ident)
        except Exception:
            return str(ident)

    def criar_proposta(self, contato_id, itens: list[dict], *, observacoes: str, observacao_interna: str) -> dict:
        if self.simular:
            return {"id": f"SIM-{secrets.token_hex(3)}", "numero": f"TESTE-{secrets.randbelow(9000) + 1000}", "simulado": True}
        corpo = {
            "data": hoje(),
            "contato": {"id": int(contato_id)},
            "itens": self._itens_proposta(itens),
            "parcelas": [],
            "observacoes": observacoes[:1000],
            "observacaoInterna": observacao_interna[:1000],
        }
        if self.vendedor_id:
            corpo["vendedor"] = {"id": int(self.vendedor_id)}
        r = self._chamar("POST", "propostas-comerciais", dados=corpo)
        ident = r["data"]["id"]
        return {"id": ident, "numero": self._numero("propostas-comerciais", ident)}

    def _forma_de_pagamento(self, pagamento: str):
        alvo = {"pix": "pix", "cartao": "cart", "boleto": "boleto", "dinheiro": "dinheiro"}.get(pagamento or "", "")
        if not alvo:
            return None
        r = self._chamar("GET", "formas-pagamentos", params={"limite": 100})
        for f in r.get("data") or []:
            if alvo in str(f.get("descricao", "")).lower():
                return f["id"]
        return None

    def criar_pedido(self, contato_id, itens: list[dict], *, observacoes: str, observacoes_internas: str,
                     pagamento: str | None = None, entrega: dict | None = None) -> dict:
        if self.simular:
            return {"id": f"SIM-{secrets.token_hex(3)}", "numero": f"TESTE-{secrets.randbelow(9000) + 1000}", "simulado": True}
        total = round(sum(i["valor"] * i["quantidade"] for i in itens), 2)
        corpo = {
            "data": hoje(),
            "dataSaida": hoje(),
            "dataPrevista": hoje(),
            "contato": {"id": int(contato_id)},
            "itens": self._itens_pedido(itens),
            "parcelas": [],
            "observacoes": observacoes[:1000],
            "observacoesInternas": observacoes_internas[:1000],
        }
        if self.vendedor_id:
            corpo["vendedor"] = {"id": int(self.vendedor_id)}
        if entrega:
            corpo["transporte"] = {"etiqueta": {k2: str(entrega.get(k1) or "") for k1, k2 in (
                ("nome", "nome"), ("endereco", "endereco"), ("numero", "numero"), ("complemento", "complemento"),
                ("bairro", "bairro"), ("cep", "cep"), ("cidade", "municipio"), ("uf", "uf"))}}
        try:
            r = self._chamar("POST", "pedidos/vendas", dados=corpo)
        except ErroHttp as e:
            # Conta configurada para exigir parcela: uma parcela só, na forma escolhida.
            if "parcela" not in e.corpo.lower():
                raise
            forma = self._forma_de_pagamento(pagamento)
            if not forma:
                raise
            corpo["parcelas"] = [{"dataVencimento": hoje(), "valor": total, "formaPagamento": {"id": forma}}]
            r = self._chamar("POST", "pedidos/vendas", dados=corpo)
        ident = r["data"]["id"]
        return {"id": ident, "numero": self._numero("pedidos/vendas", ident)}

    # ------------------------------------------------------------ conferência (só leitura)
    def conferir(self) -> dict:
        saida = {"tokens": str(self.arquivo), "simulado": self.simular}
        try:
            self._token()
            saida["token_lido"] = True
        except Exception as e:
            saida["token_lido"] = False
            saida["erro"] = str(e)
            return saida
        for nome, caminho in (("contatos", "contatos"), ("propostas", "propostas-comerciais"), ("pedidos", "pedidos/vendas")):
            try:
                self._chamar("GET", caminho, params={"limite": 1})
                saida[nome] = "ok"
            except Exception as e:
                saida[nome] = mensagem_de_erro(e)
        return saida
