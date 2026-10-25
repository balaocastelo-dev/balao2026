"""MEU BLING (/sistema) a partir do PC: orçamento e pedido de venda da JUL.IA.

Decisão do Thiago (25/10/2026): o Bling saiu de tudo. A JUL.IA grava no MEU
BLING, o ERP próprio da loja, passando pelo site:

    PC → POST https://www.balao.info/api/pc/sistema/documentos → MEU BLING
    PC → GET  https://www.balao.info/api/pc/sistema/status

O PC não recebe chave nova: usa a "chave do PC da loja", a mesma do vigia da
Arena (gravada pelo `python vigia.py --parear`). A chave nunca é impressa nem
vai para o log.

O MEU BLING acha ou cria o cliente sozinho a partir do objeto `cliente`; por
isso `contato_para` só monta esse objeto (com o CPF/CNPJ validado aqui).

Cada documento leva um `idExterno` (julia-<tipo>-<id>, 6 a 40 caracteres): se a
mesma gravação for repetida (rede caiu, trabalho refeito), o MEU BLING devolve o
documento que já existe em vez de criar outro.

Simulado: no modo teste da JUL.IA (só os números do Thiago) nada sai do PC,
para teste não virar venda no relatório.
"""
from __future__ import annotations

import hashlib
import json
import re
import secrets
import time
from pathlib import Path

import regras as R
from rede import ErroHttp, pedir

SITE = "https://www.balao.info"
ROTA_DOCUMENTOS = "/api/pc/sistema/documentos"
ROTA_STATUS = "/api/pc/sistema/status"
AGENTE = "JUL.IA"
COMO_PAREAR = (
    "No PowerShell: cd $HOME\\balao-arena-vigia ; py -3 vigia.py --parear  "
    "e aprove o computador em www.balao.info/painel/arena. "
    "Se a chave estiver em outro lugar, ponha o caminho em \"arquivo_chave_pc\" no config.json da JUL.IA."
)


def casa() -> Path:
    import os

    return Path(os.environ.get("USERPROFILE") or os.environ.get("HOME") or ".")


def caminhos_da_chave(explicito: str | None = None, base: Path | None = None) -> list[Path]:
    """Onde procurar a chave do PC da loja, na ordem.

    1. o caminho explícito do config da JUL.IA (`arquivo_chave_pc`);
    2. o `arquivo_chave` do config.json do vigia da Arena, se ele mudou o padrão;
    3. o padrão do vigia: %USERPROFILE%\\.balao-arena\\chave.txt;
    4. a pasta de dados do vigia (%USERPROFILE%\\balao-arena-vigia\\dados\\chave.txt).
    """
    if explicito:
        return [Path(explicito)]
    base = base or casa()
    saida: list[Path] = []
    cfg_vigia = base / "balao-arena-vigia" / "config.json"
    try:
        outro = json.loads(cfg_vigia.read_text(encoding="utf-8")).get("arquivo_chave")
        if outro:
            saida.append(Path(outro))
    except Exception:
        pass
    saida.append(base / ".balao-arena" / "chave.txt")
    saida.append(base / "balao-arena-vigia" / "dados" / "chave.txt")
    return saida


def id_externo(tipo: str, *partes) -> str:
    """julia-<tipo>-<id>, só letras, números, - e _, de 6 a 40 caracteres."""
    tipo = re.sub(r"[^a-z]", "", str(tipo).lower())[:6] or "doc"
    base = "-".join(re.sub(r"[^A-Za-z0-9_-]", "", str(p)) for p in partes if p is not None and str(p) != "")
    prefixo = f"julia-{tipo}-"
    if not base or len(prefixo) + len(base) > 40:
        base = hashlib.sha1("|".join(str(p) for p in partes).encode("utf-8")).hexdigest()[: 40 - len(prefixo)]
    return prefixo + base


def site_id(item: dict) -> str:
    """Id do produto no site. Aceita o formato antigo do Bling (SITE-<id>)."""
    bruto = str(item.get("siteId") or item.get("id") or "").strip()
    return bruto[5:] if bruto.upper().startswith("SITE-") else bruto


def mensagem_de_erro(e: Exception) -> str:
    """O vendedor precisa ler o motivo, não o código."""
    if isinstance(e, ErroHttp):
        motivo = ""
        try:
            motivo = str(json.loads(e.corpo).get("erro") or "")
        except Exception:
            pass
        if e.status == 401:
            return "o site recusou a chave do PC da loja (pareie de novo com vigia.py --parear)"
        if e.status in (502, 503, 504):
            return f"MEU BLING fora do ar ({e.status})" + (f": {motivo}" if motivo else "")
        if motivo:
            return f"MEU BLING recusou ({e.status}): {motivo}"[:300]
        return f"MEU BLING respondeu {e.status}"
    if isinstance(e, TimeoutError):
        return "o site demorou para responder (MEU BLING)"
    return str(e)[:300]


class SemChave(RuntimeError):
    pass


class Sistema:
    def __init__(self, arquivo_chave: str | None = None, *, site: str = SITE, simular: bool = False,
                 vendedor_id=None, http=pedir, dormir=time.sleep, base: Path | None = None):
        self.arquivo_chave = arquivo_chave or None
        self.site = (site or SITE).rstrip("/")
        self.simular = simular
        self.vendedor_id = vendedor_id
        self.http = http
        self.dormir = dormir
        self.base = base

    # ------------------------------------------------------------ base
    def _achar_chave(self) -> tuple[Path | None, str | None]:
        for c in caminhos_da_chave(self.arquivo_chave, self.base):
            try:
                texto = c.read_text(encoding="utf-8").strip()
            except (FileNotFoundError, IsADirectoryError, PermissionError):
                continue
            if texto:
                return c, texto
        return None, None

    def _chave(self) -> str:
        _, chave = self._achar_chave()
        if not chave:
            onde = ", ".join(str(c) for c in caminhos_da_chave(self.arquivo_chave, self.base))
            raise SemChave(f"falta a chave do PC da loja (procurei em {onde}). {COMO_PAREAR}")
        return chave

    def _chamar(self, metodo: str, rota: str, dados=None, espera: float = 30):
        cab = {"Authorization": f"Bearer {self._chave()}"}
        for tentativa in range(2):
            try:
                return self.http(f"{self.site}{rota}", metodo=metodo, dados=dados, cabecalhos=cab, espera=espera)
            except ErroHttp as e:
                # Fora do ar: uma segunda tentativa. O idExterno garante que não duplica.
                if e.status in (502, 503, 504) and tentativa == 0:
                    self.dormir(3)
                    continue
                raise
            except (TimeoutError, ConnectionError):
                if tentativa == 0:
                    self.dormir(3)
                    continue
                raise
        return {}

    # ------------------------------------------------------------ cliente
    def contato_para(self, dados: dict, telefone: str) -> dict:
        """O objeto `cliente` que o MEU BLING usa para achar ou criar o cadastro."""
        doc = R.digitos(dados.get("cpf_cnpj"))
        if doc and not R.documento_valido(doc):
            doc = ""  # CPF/CNPJ inválido não vai para o cadastro
        fone = R.digitos(telefone)
        if fone.startswith("55") and len(fone) > 11:
            fone = fone[2:]
        cliente = {
            "nome": (str(dados.get("nome") or "").strip() or f"Cliente WhatsApp {fone[-4:]}")[:120],
            "documento": doc,
            "email": str(dados.get("email") or "")[:120],
            "telefone": fone[-11:],
        }
        for k in ("cep", "endereco", "numero", "complemento", "bairro", "cidade", "uf"):
            cliente[k] = str(dados.get(k) or "")[:120]
        cliente["cep"] = R.digitos(cliente["cep"])[:8]
        cliente["uf"] = cliente["uf"].upper()[:2]
        return cliente

    # ------------------------------------------------------------ documentos
    @staticmethod
    def _itens(itens: list[dict]) -> list[dict]:
        saida = []
        for i in itens:
            item = {"siteId": site_id(i), "nome": str(i["nome"])[:160],
                    "quantidade": int(i["quantidade"]), "valor": round(float(i["valor"]), 2)}
            if i.get("foto"):
                item["foto"] = str(i["foto"])
            saida.append(item)
        return saida

    def _vendedor(self):
        try:
            return int(self.vendedor_id) if self.vendedor_id not in (None, "") else None
        except (TypeError, ValueError):
            return None

    def _criar(self, tipo: str, cliente: dict, itens: list[dict], observacoes: str, internas: str, ident: str | None) -> dict:
        if self.simular:
            return {"id": f"SIM-{secrets.token_hex(3)}", "numero": f"TESTE-{secrets.randbelow(9000) + 1000}", "simulado": True}
        if not isinstance(cliente, dict):
            raise ValueError("cliente inválido para o MEU BLING")
        corpo_itens = self._itens(itens)
        if not ident:
            # Sem id da conversa: o mesmo conteúdo no mesmo dia vira o mesmo documento.
            ident = id_externo(tipo[:3], time.strftime("%Y%m%d"),
                               json.dumps([cliente.get("documento"), cliente.get("telefone"), corpo_itens], sort_keys=True))
        corpo = {
            "idExterno": ident,
            "tipo": tipo,
            "agente": AGENTE,
            "vendedorId": self._vendedor(),
            "cliente": cliente,
            "itens": corpo_itens,
            "observacoes": (observacoes or "")[:1000],
            "observacoesInternas": (internas or "")[:1000],
        }
        r = self._chamar("POST", ROTA_DOCUMENTOS, dados=corpo, espera=30)
        doc = (r or {}).get("documento") or {}
        if not doc.get("id"):
            raise RuntimeError("o MEU BLING não devolveu o documento")
        return {"id": doc["id"], "numero": str(doc.get("numero") or doc["id"]), "criada": bool(r.get("criada", True))}

    def criar_proposta(self, contato, itens: list[dict], *, observacoes: str, observacao_interna: str,
                       id_externo: str | None = None) -> dict:
        """Orçamento no MEU BLING (situação inicial de orçamentos)."""
        return self._criar("ORCAMENTO", contato, itens, observacoes, observacao_interna, id_externo)

    def criar_pedido(self, contato, itens: list[dict], *, observacoes: str, observacoes_internas: str,
                     pagamento: str | None = None, entrega: dict | None = None, id_externo: str | None = None) -> dict:
        """Pedido EM ABERTO no MEU BLING: o vendedor confere pagamento e entrega.

        Pagamento e modo de entrega já vão escritos nas observações; o endereço vai no cliente.
        """
        return self._criar("PEDIDO", contato, itens, observacoes, observacoes_internas, id_externo)

    # ------------------------------------------------------------ conferência (só leitura)
    def conferir(self) -> dict:
        arq, chave = self._achar_chave()
        saida = {"site": self.site, "simulado": self.simular, "chave": str(arq) if arq else None, "chave_lida": bool(chave)}
        if not chave:
            onde = ", ".join(str(c) for c in caminhos_da_chave(self.arquivo_chave, self.base))
            saida["erro"] = f"falta a chave do PC da loja (procurei em {onde}). {COMO_PAREAR}"
            return saida
        try:
            r = self._chamar("GET", ROTA_STATUS, espera=15)
        except ErroHttp as e:
            if e.status == 401:
                saida["erro"] = f"o site recusou a chave do PC da loja ({arq}). {COMO_PAREAR}"
            else:
                saida["erro"] = mensagem_de_erro(e)
            return saida
        except Exception as e:
            saida["erro"] = f"sem resposta do site: {mensagem_de_erro(e)}"
            return saida
        s = (r or {}).get("sistema") or {}
        saida["ligado"] = bool(s.get("ligado"))
        if not saida["ligado"]:
            saida["erro"] = f"MEU BLING desligado ou fora do ar: {s.get('motivo') or 'sem motivo'}"
        return saida
