"""Catálogo do site, guardado aqui no PC, e a busca que o agente usa.

A fonte é a VPS (/api/agente/catalogo), que espelha o site a cada 30 minutos.
Nunca o banco MySQL da Hostinger: ele tem cota de conexões por hora e uma
varredura derrubaria o site. Custo e fornecedor nem chegam aqui (a VPS corta).

A JUL.IA só pode oferecer o que está neste arquivo. É por isso que preço,
foto e link nunca saem da cabeça do modelo: saem daqui.
"""
from __future__ import annotations

import json
import re
import time
import unicodedata
from pathlib import Path

PALAVRAS_VAZIAS = set(
    """a o as os de da do das dos e em no na nos nas um uma uns umas para pra pro com sem por que qual quais
    quero queria gostaria preciso procuro procurando tem tenho voces vcs voce vc me mim algum alguma bom boa
    melhor barato barata baratos baratas top legal ai ate mais menos ou muito muita uso usar""".split()
)

# O cliente fala de um jeito, o catálogo escreve de outro.
SINONIMOS = {
    "note": ["notebook"],
    "notebooks": ["notebook"],
    "laptop": ["notebook"],
    "pc": ["pc", "computador"],
    "computador": ["computador", "pc"],
    "desktop": ["computador", "pc"],
    "gamer": ["gamer"],
    "jogo": ["gamer"],
    "jogos": ["gamer"],
    "jogar": ["gamer"],
    "placa": ["placa"],
    "video": ["video", "geforce", "radeon", "rtx", "gtx"],
    "gpu": ["placa de video", "geforce", "radeon"],
    "memoria": ["memoria", "ram"],
    "ram": ["memoria", "ram"],
    "hd": ["hd", "disco"],
    "fone": ["fone", "headset"],
    "headset": ["headset", "fone"],
    "celular": ["smartphone", "celular", "iphone"],
    "smartphone": ["smartphone", "celular"],
    "impressora": ["impressora", "multifuncional"],
    "cartucho": ["cartucho"],
    "toner": ["toner"],
    "wifi": ["wifi", "wi-fi", "roteador"],
    "roteador": ["roteador"],
    "mac": ["macbook", "mac", "imac"],
    "macbook": ["macbook"],
    "cadeira": ["cadeira"],
    "monitor": ["monitor"],
    "teclado": ["teclado"],
    "mouse": ["mouse"],
    "nobreak": ["nobreak", "no-break"],
    "fio": ["fio", "wireless", "bluetooth"],
    "estabilizador": ["estabilizador"],
}


# Tipos de produto que o cliente pede pelo nome, mesmo que o catálogo de hoje
# não tenha nenhum (pediu mouse e não há mouse: a resposta é "não tenho", não o
# PC que vem com mouse).
TIPOS_CONHECIDOS = set(
    """notebook pc computador monitor mouse teclado headset fone impressora multifuncional cartucho toner
    webcam mousepad gabinete cooler fonte placa memoria ssd hd processador roteador cadeira mesa nobreak
    estabilizador tablet ipad iphone smartphone celular macbook imac console controle projetor caixa
    microfone carregador cabo adaptador hub switch smartwatch""".split()
)


def sem_acento(t: str) -> str:
    t = unicodedata.normalize("NFKD", str(t or "")).encode("ascii", "ignore").decode()
    return t.lower()


def palavras(t: str) -> list[str]:
    return re.findall(r"[a-z0-9]+(?:[.,][0-9]+)?", sem_acento(t))


def preco(valor) -> float:
    """'5.039,37' / 'R$ 5.599,30' / 5039.37 -> 5039.37"""
    if valor is None or valor == "":
        return 0.0
    if isinstance(valor, (int, float)):
        return float(valor)
    s = re.sub(r"[^\d,.-]", "", str(valor))
    if not s:
        return 0.0
    if "," in s:
        s = s.replace(".", "").replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return 0.0


def reais(v: float) -> str:
    inteiro, centavos = f"{v:,.2f}".split(".")
    return "R$ " + inteiro.replace(",", ".") + "," + centavos


def limpar_nome(nome: str) -> str:
    """Nome como o cliente deve ler: sem aspas sobrando nem "( Balão.info)" colado pelo importador."""
    n = unicodedata.normalize("NFC", str(nome or ""))
    n = re.sub(r"\(\s*bal\w*\.info\s*\)", "", n, flags=re.I)
    n = re.sub(r'"{2,}', '"', n)
    n = n.strip().strip('"').strip()
    return re.sub(r"\s{2,}", " ", n)


def nome_curto(nome: str, limite: int = 110) -> str:
    n = re.split(r" - [A-Z0-9-]{5,}$", limpar_nome(nome))[0].strip()
    return n if len(n) <= limite else n[: limite - 1].rstrip() + "…"


class Catalogo:
    def __init__(self, pasta: str, buscar_remoto=None, validade_s: int = 30 * 60):
        self.arquivo = Path(pasta) / "catalogo.json"
        self.buscar_remoto = buscar_remoto
        self.validade_s = validade_s
        self.produtos: list[dict] = []
        self.por_id: dict[str, dict] = {}
        self.atualizado_em = None
        self.lido_em = 0.0
        self._indice: list[tuple[dict, str, str, str]] = []
        self._vocabulario: set[str] = set()
        self._tipos: set[str] = set()
        if self.arquivo.exists():
            try:
                self._usar(json.loads(self.arquivo.read_text(encoding="utf-8")))
            except Exception:
                pass

    def _usar(self, dados: dict):
        produtos = [p for p in (dados.get("produtos") or []) if p and p.get("name") and preco(p.get("price")) > 0]
        if not produtos:
            return
        self.produtos = produtos
        self.por_id = {}
        for p in produtos:
            self.por_id[str(p.get("id"))] = p
            if p.get("slug"):
                self.por_id.setdefault(str(p["slug"]), p)
        self.atualizado_em = dados.get("atualizadoEm")
        self._indice = [
            (p, " ".join(palavras(p.get("name"))), " ".join(palavras(str(p.get("category", "")).replace("/", " "))), sem_acento(p.get("brand") or ""))
            for p in produtos
        ]
        # Palavras que existem no catálogo (para ignorar "faculdade", "trabalho"...)
        # e os tipos de produto (primeira palavra do nome que se repete).
        self._vocabulario = set()
        contagem: dict[str, int] = {}
        for _, nome, cat, marca in self._indice:
            self._vocabulario.update(nome.split())
            self._vocabulario.update(cat.split())
            if marca:
                self._vocabulario.add(marca)
            primeira = nome.split(" ", 1)[0]
            contagem[primeira] = contagem.get(primeira, 0) + 1
        self._tipos = {t for t, n in contagem.items() if n >= 3 and not re.fullmatch(r"[0-9.,]+", t)}

    def atualizar(self, forcar: bool = False) -> bool:
        if not forcar and self.produtos and time.time() - self.lido_em < self.validade_s:
            return False
        if not self.buscar_remoto:
            return False
        try:
            dados = self.buscar_remoto()
        except Exception as e:
            print(f"[catalogo] não atualizei (sigo com a cópia de {self.atualizado_em}): {e}")
            self.lido_em = time.time() - self.validade_s + 120  # tenta de novo em 2 min
            return False
        antes = len(self.produtos)
        self._usar(dados)
        if self.produtos and (len(self.produtos) != antes or True):
            tmp = self.arquivo.with_suffix(".tmp")
            tmp.write_text(json.dumps({"atualizadoEm": self.atualizado_em, "produtos": self.produtos}, ensure_ascii=False), encoding="utf-8")
            tmp.replace(self.arquivo)
        self.lido_em = time.time()
        return True

    def disponivel(self, p: dict) -> bool:
        a = sem_acento(p.get("availability") or "disponivel")
        return "indispon" not in a and "esgot" not in a and preco(p.get("price")) > 0

    def produto(self, ident) -> dict | None:
        p = self.por_id.get(str(ident).strip())
        return p if p and self.disponivel(p) else None

    def resumo(self, p: dict) -> dict:
        """O que o modelo vê de um produto: só o que pode ser dito ao cliente."""
        saida = {
            "id": str(p.get("id")),
            "nome": nome_curto(p.get("name")),
            "preco_a_vista_pix": reais(preco(p.get("price"))),
            "categoria": str(p.get("category") or "").split("/")[-1],
        }
        if preco(p.get("price_card")) > 0:
            saida["preco_no_cartao"] = reais(preco(p.get("price_card")))
        if p.get("installment"):
            saida["parcelamento"] = str(p["installment"])
        if p.get("brand"):
            saida["marca"] = p["brand"]
        return saida

    def buscar(self, busca: str, *, preco_minimo: float | None = None, preco_maximo: float | None = None,
               ordem: str = "relevancia", limite: int = 6) -> list[dict]:
        termos = [t for t in palavras(busca) if t not in PALAVRAS_VAZIAS]
        conhecida = lambda t: any(x in self._vocabulario or any(v.startswith(x) for v in self._vocabulario if len(x) >= 4)
                                  for x in SINONIMOS.get(t, [t]))
        # Palavra que o catálogo não usa ("faculdade", "trabalho") não pode zerar a busca.
        termos = [t for t in termos if t in TIPOS_CONHECIDOS or conhecida(t)] if self._vocabulario else termos
        if not termos:
            return []
        grupos = [(t, SINONIMOS.get(t, [t])) for t in termos]
        so_numero = lambda t: re.fullmatch(r"[0-9.,]+", t) is not None
        # Número de modelo (4060, 664, 990) é obrigatório; número curto ("15"
        # de "iphone 15") só ajuda a ordenar.
        obrigatorios = [g for g in grupos if not so_numero(g[0]) or len(g[0]) >= 3]
        opcionais = [g for g in grupos if so_numero(g[0]) and len(g[0]) < 3]
        # O tipo de produto pedido: a primeira palavra que é tipo no catálogo
        # ("notebook", "placa", "cadeira"). "rtx 4060" ou "samsung" não têm tipo.
        tipo = next((sin for t, sin in grupos if any(x in self._tipos or x in TIPOS_CONHECIDOS for x in sin)), [])
        folga = 1 if len(obrigatorios) >= 4 else 0  # pergunta longa pode ter uma palavra que o catálogo não usa

        def casa(termo: str, texto: str) -> bool:
            return re.search(r"(^| )" + re.escape(termo), texto) is not None

        achados = []
        for p, nome, cat, marca in self._indice:
            if not self.disponivel(p):
                continue
            pontos = 0
            faltaram = 0
            for _, sinonimos in obrigatorios:
                melhor = 0
                for termo in sinonimos:
                    if casa(termo, nome):
                        melhor = max(melhor, 3)
                    elif casa(termo, cat):
                        melhor = max(melhor, 2)
                    elif termo == marca:
                        melhor = max(melhor, 2)
                if melhor:
                    pontos += melhor
                else:
                    faltaram += 1
            if faltaram > folga:
                continue
            for _, sinonimos in opcionais:
                if any(casa(t, nome) for t in sinonimos):
                    pontos += 2
            # É mesmo o produto pedido, e não um acessório ("suporte de placa de vídeo",
            # "memória para notebook")? O nome começa pelo tipo, ou a última parte da
            # categoria é o tipo.
            ultima_cat = sem_acento(str(p.get("category") or "").split("/")[-1])
            eh_do_tipo = any(nome.startswith(t + " ") or nome == t or casa(t, ultima_cat) for t in tipo)
            if eh_do_tipo:
                pontos += 5
            achados.append((pontos, eh_do_tipo, preco(p.get("price")), p, faltaram))
        if not achados:
            return []
        # Achou o que casa com TUDO ("pc gamer rtx 4060"): só esses. A folga
        # (uma palavra a menos) é só para quando não há nenhum exato.
        if any(a[4] == 0 for a in achados):
            achados = [a for a in achados if a[4] == 0]
        if tipo:
            # Pediu mouse e não há mouse: vazio, e não o PC que vem com mouse.
            achados = [a for a in achados if a[1]]
        # Faixa de preço depois do tipo: "notebook até 3 mil" sem notebook nessa
        # faixa volta vazio (o agente diz o mais em conta), e não memória para notebook.
        if preco_minimo:
            achados = [a for a in achados if a[2] >= preco_minimo]
        if preco_maximo:
            achados = [a for a in achados if a[2] <= preco_maximo]
        if not achados:
            return []
        if ordem == "menor_preco":
            achados.sort(key=lambda x: (x[2], -x[0]))
        elif ordem == "maior_preco":
            achados.sort(key=lambda x: (-x[2], -x[0]))
        else:
            achados.sort(key=lambda x: (-x[0], x[2]))
            corte = achados[0][0] - 1
            melhores = [a for a in achados if a[0] >= corte]
            if len(melhores) > limite:
                # Relevância parecida: espalha os preços (mais em conta, meio, mais caro),
                # tirando as pontas fora da curva (máquina de 40 mil no meio de notebooks de 3).
                melhores.sort(key=lambda x: x[2])
                n = len(melhores)
                if n >= 10:
                    melhores = melhores[n // 10 : n - n // 10]
                    n = len(melhores)
                idx = sorted({round(i * (n - 1) / (limite - 1)) for i in range(limite)})
                achados = [melhores[i] for i in idx]
        return [self.resumo(a[3]) for a in achados[:limite]]

    def tipo_da_busca(self, busca: str) -> str | None:
        """A palavra de tipo de produto da busca ("monitor" em "monitor gamer 144hz")."""
        for t in palavras(busca):
            for x in SINONIMOS.get(t, [t]):
                if x in self._tipos or x in TIPOS_CONHECIDOS:
                    return x
        return None

    def detalhes(self, ident) -> dict | None:
        p = self.produto(ident)
        if not p:
            return None
        d = self.resumo(p)
        d["nome_completo"] = str(p.get("name"))
        if p.get("description"):
            d["descricao"] = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", str(p["description"])))[:900]
        d["link"] = f"https://www.balao.info/product/{p.get('slug') or p.get('id')}"
        return d

    def precos_de(self, p: dict) -> set[float]:
        """Todo valor em reais que pode aparecer numa resposta sobre este produto."""
        v = {round(preco(p.get("price")), 2)}
        if preco(p.get("price_card")) > 0:
            v.add(round(preco(p.get("price_card")), 2))
        m = re.search(r"(\d+)\s*x\s*de\s*R?\$?\s*([\d.,]+)", str(p.get("installment") or ""), re.I)
        if m:
            v.add(round(preco(m.group(2)), 2))
        return v
