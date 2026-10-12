"""O cérebro da JUL.IA: conversa com o modelo local e as ferramentas dele.

O modelo (Ollama, no PC) escreve a resposta e decide quando buscar produto,
mostrar produto, guardar dado, emitir orçamento, fechar venda ou chamar um
vendedor. Tudo o que é número, documento e Bling passa por código:

- produto, preço, foto e link vêm do catálogo do site (catalogo.py);
- a resposta só sai se cada "R$" dela veio de uma ferramenta;
- o orçamento e a confirmação do pedido são mensagens prontas, montadas aqui;
- venda só com orçamento emitido, dados completos e "sim" na última mensagem.
"""
from __future__ import annotations

import datetime as dt
import json
import re
import time

import regras as R
from bling import mensagem_de_erro
from catalogo import nome_curto, preco, reais

LOJA = {
    "nome": "Balão da Informática Castelo",
    "endereco": "Av. Anchieta, 789 - Cambuí, Campinas - SP",
    "horario": "segunda a sexta das 9h às 18h, sábado das 9h às 13h",
    "site": "www.balao.info",
}

INSTRUCOES = f"""Você é a JUL.IA, assistente digital (um robô) de vendas da {LOJA['nome']}, loja de informática em Campinas-SP ({LOJA['endereco']}). Você atende clientes pelo WhatsApp da loja. Horário da loja: {LOJA['horario']}.

Seu trabalho: entender o que o cliente precisa, ajudar a escolher um produto do catálogo do site {LOJA['site']}, montar o orçamento e, quando ele confirmar, registrar o pedido.

Como conduzir a conversa:
- Assim que o cliente disser o tipo de produto (notebook, PC gamer, monitor, cadeira...), chame buscar_produtos NA HORA, com as características que ele pediu na busca (ex.: "pc gamer rtx 4060", "notebook i5 16gb") (com preco_maximo se ele disse quanto quer gastar) e mostre de 1 a 3 opções com mostrar_produto, dizendo em uma frase por que cada uma serve. Só pergunte antes de buscar se você não souber nem o tipo do produto.
- Se o cliente perguntar de especificação (memória, processador, tela), chame detalhes_do_produto e responda só com o que estiver escrito lá.
- Quando ele escolher ("quero esse", "gostei do primeiro"), chame emitir_orcamento com o id do produto escolhido (os produtos já mostrados estão listados na situação da conversa, em ordem). O orçamento vai pronto para o cliente; depois só pergunte se pode fechar o pedido.
- Para fechar: peça aos poucos o que faltar (nome completo, CPF ou CNPJ, forma de pagamento: Pix, cartão ou boleto, e retirada na loja ou entrega com CEP e endereço), guarde com salvar_dados e, quando o cliente confirmar, chame emitir_venda.

Nunca peça permissão para buscar e nunca diga que "vai buscar": busque. Se nada servir, diga que no momento não tem no site e ofereça um vendedor.

Regras que você nunca quebra:
1. Só ofereça produtos que a ferramenta buscar_produtos devolveu nesta conversa. Nunca invente produto, modelo, especificação, preço, estoque, prazo ou promoção. Se não achar, diga que não encontrou no site e ofereça um vendedor.
2. Preços: use exatamente os valores das ferramentas (à vista no Pix, no cartão, parcelamento). Não dê desconto nem condição especial; se pedirem, chame um vendedor.
3. Nunca fale de custo, fornecedor, margem ou de outras lojas e sites. Só mande link do {LOJA['site']}.
4. Não prometa nada que as ferramentas não fazem (mandar link, comprovante, reservar, separar, entregar em tal dia). O que vai ao cliente é só o seu texto, os produtos de mostrar_produto e o orçamento/pedido das ferramentas. Nunca diga que o pedido foi feito sem emitir_venda ter dado certo.
5. Escreva como no WhatsApp: texto simples e curto (1 a 4 frases), simpático e direto, no máximo 1 emoji, uma pergunta por vez. Sem listas longas, sem markdown e sem links (o cartão do produto já leva foto, preço e link). Para destacar, *uma palavra entre asteriscos*. Português do Brasil.
6. Chame chamar_vendedor quando: o cliente pedir uma pessoa; for conserto ou assistência técnica, troca, garantia, reclamação, pedido antigo, nota fiscal, consignado, compra para empresa com condição especial, frete ou prazo de entrega, desconto; ou quando você não souber. Diga ao cliente que um vendedor vai continuar o atendimento.
7. Foto, áudio e vídeo do cliente chegam como descrição ou transcrição entre colchetes. Use isso para entender o pedido.
8. Se perguntarem, diga que é a assistente digital (robô) da loja."""

FERRAMENTAS = [
    {"type": "function", "function": {
        "name": "buscar_produtos",
        "description": "Busca produtos disponíveis no site da loja. Use as palavras do produto, sem frases: 'notebook i5 16gb', 'pc gamer rtx 4060', 'cadeira gamer', 'monitor 27'.",
        "parameters": {"type": "object", "properties": {
            "busca": {"type": "string", "description": "Tipo do produto e características (marca, processador, memória...)."},
            "preco_maximo": {"type": "number", "description": "Preço máximo à vista em reais, se o cliente disse quanto quer gastar."},
            "preco_minimo": {"type": "number"},
            "ordem": {"type": "string", "enum": ["relevancia", "menor_preco", "maior_preco"]},
        }, "required": ["busca"]}}},
    {"type": "function", "function": {
        "name": "detalhes_do_produto",
        "description": "Descrição completa de um produto (configuração, especificações) pelo id que veio da busca.",
        "parameters": {"type": "object", "properties": {"id": {"type": "string"}}, "required": ["id"]}}},
    {"type": "function", "function": {
        "name": "mostrar_produto",
        "description": "Manda ao cliente a foto, o preço e o link do produto (id da busca). Até 3 por resposta.",
        "parameters": {"type": "object", "properties": {"id": {"type": "string"}}, "required": ["id"]}}},
    {"type": "function", "function": {
        "name": "salvar_dados",
        "description": "Guarda dados que o cliente informou para o pedido. Mande só o que ele disse.",
        "parameters": {"type": "object", "properties": {
            "nome": {"type": "string", "description": "Nome completo"},
            "cpf_cnpj": {"type": "string"},
            "email": {"type": "string"},
            "pagamento": {"type": "string", "enum": ["pix", "cartao", "boleto", "dinheiro"]},
            "entrega": {"type": "string", "enum": ["retirada", "entrega"]},
            "cep": {"type": "string"}, "endereco": {"type": "string"}, "numero": {"type": "string"},
            "complemento": {"type": "string"}, "bairro": {"type": "string"},
            "cidade": {"type": "string"}, "uf": {"type": "string"},
        }}}},
    {"type": "function", "function": {
        "name": "emitir_orcamento",
        "description": "Emite o orçamento (proposta comercial no sistema da loja) com os produtos escolhidos e manda ao cliente.",
        "parameters": {"type": "object", "properties": {"itens": {"type": "array", "items": {"type": "object", "properties": {
            "id": {"type": "string"}, "quantidade": {"type": "integer"}}, "required": ["id"]}}}, "required": ["itens"]}}},
    {"type": "function", "function": {
        "name": "emitir_venda",
        "description": "Registra o pedido de venda do último orçamento. Só depois de o cliente confirmar que quer fechar e de os dados estarem completos.",
        "parameters": {"type": "object", "properties": {}}}},
    {"type": "function", "function": {
        "name": "chamar_vendedor",
        "description": "Passa a conversa para um vendedor humano.",
        "parameters": {"type": "object", "properties": {"motivo": {"type": "string"}}, "required": ["motivo"]}}},
]

# Recado do sistema no meio da conversa vai como "user" marcado (o modelo de chat
# do Qwen só aceita system no começo).
NOTA = "[Nota interna do sistema da loja, não é o cliente falando] "

CAMPOS_DO_CLIENTE = {"nome", "cpf_cnpj", "email", "pagamento", "entrega", "cep", "endereco", "numero",
                     "complemento", "bairro", "cidade", "uf"}
MAX_RODADAS = 6
MAX_CARTOES = 3
MAX_ORCAMENTOS_POR_DIA = 3

# O histórico que vai ao modelo: só a conversa de agora. O que aconteceu antes
# (produtos mostrados, orçamento, dados) está na memória da conversa e vai na
# "situação". Histórico grande deixa cada resposta mais lenta e não ajuda.
JANELA_DA_CONVERSA_S = 24 * 3600
MAX_MENSAGENS_NO_HISTORICO = 16
MAX_CARACTERES_NO_HISTORICO = 6000
MAX_CARACTERES_POR_MENSAGEM = 600

# "até 3 mil", "no máximo 2500", "tenho uns 4 mil": vira preço máximo da busca.
TETO_DE_PRECO = re.compile(r"\b(ate|no maximo|maximo|menos de|abaixo de|uns|umas|por volta|em torno|orcamento de|tenho|gastar)\b")


def conversa_atual(mensagens: list[dict] | None) -> list[dict]:
    """As mensagens que importam para responder agora: últimas 24 h, no máximo 16 e uns 6 mil
    caracteres (mensagem comprida de vendedor é cortada). Não muda a lista recebida."""
    msgs = [dict(m) for m in (mensagens or [])]
    if not msgs:
        return []
    ultimo = max((m.get("em") or 0) for m in msgs)
    if ultimo:
        msgs = [m for m in msgs if not m.get("em") or m["em"] >= ultimo - JANELA_DA_CONVERSA_S * 1000]
    msgs = msgs[-MAX_MENSAGENS_NO_HISTORICO:]
    for m in msgs:
        t = m.get("texto") or ""
        if m.get("de") != "cliente" and len(t) > MAX_CARACTERES_POR_MENSAGEM:
            m["texto"] = t[:MAX_CARACTERES_POR_MENSAGEM].rsplit(" ", 1)[0] + " […]"
    total = sum(len(m.get("texto") or "") for m in msgs)
    while len(msgs) > 2 and total > MAX_CARACTERES_NO_HISTORICO:
        total -= len(msgs[0].get("texto") or "")
        msgs.pop(0)
    return msgs


def agora_sp() -> str:
    # O PC está no fuso de São Paulo.
    return dt.datetime.now().strftime("%d/%m/%Y %H:%M (%A)")


class Atendimento:
    """Uma rodada: as mensagens novas do cliente viram uma resposta."""

    def __init__(self, *, trabalho: dict, ollama, modelo: str, catalogo, bling, contexto: int = 8192, registrar=print,
                 prazo_s: float = 70):
        trabalho = {**trabalho, "mensagens": conversa_atual(trabalho.get("mensagens"))}
        self.t = trabalho
        self.prazo_s = prazo_s
        self.medidas: list[dict] = []
        self.ollama = ollama
        self.modelo = modelo
        self.catalogo = catalogo
        self.bling = bling
        self.contexto = contexto
        self.registrar = registrar
        self.dados = dict(trabalho.get("dados") or {})
        self.memoria = dict(trabalho.get("memoria") or {})
        self.memoria.setdefault("produtos", {})
        self.config = trabalho.get("config") or {}
        self.cartoes: list[str] = []
        self.ultimos_achados: list[dict] = []
        self.extras: list[str] = []  # mensagens prontas (orçamento, pedido)
        self.acoes: list[dict] = []
        self.transferir = None
        self.precos: set[float] = set()
        for p in self.memoria["produtos"].values():
            self.precos.update(p.get("precos") or [])
        orc = self.memoria.get("orcamento")
        if orc:
            self.precos.add(round(orc.get("total", 0), 2))
            for i in orc.get("itens", []):
                self.precos.add(round(i["valor"], 2))
                self.precos.add(round(i["valor"] * i["quantidade"], 2))

    # ------------------------------------------------------------ contexto
    def ultima_do_cliente(self) -> str:
        for m in reversed(self.t.get("mensagens") or []):
            if m.get("de") == "cliente":
                return m.get("conteudo") or m.get("texto") or ""
        return ""

    def palavras_do_cliente(self) -> str:
        """O que o cliente ESCREVEU ou FALOU por último, sem a descrição que o modelo de visão fez da foto
        (ela cita defeitos de propósito, e "tela trincada" na foto do notebook velho não é pedido de conserto)."""
        return re.sub(r"\[(foto|v[ií]deo)[^\]]*\]", " ", self.ultima_do_cliente(), flags=re.I).strip()

    def _mensagens_do_modelo(self) -> list[dict]:
        lista = []
        for m in self.t.get("mensagens") or []:
            texto = (m.get("conteudo") or m.get("texto") or "").strip()
            if not texto:
                continue
            if m["de"] == "cliente":
                papel = "user"
            else:
                papel = "assistant"
                if m["de"] == "loja":
                    texto = f"(mensagem escrita por um vendedor humano da loja) {texto}"
            if lista and lista[-1]["role"] == papel:
                lista[-1]["content"] += "\n" + texto
            else:
                lista.append({"role": papel, "content": texto})
        if lista and lista[0]["role"] == "assistant":
            lista.insert(0, {"role": "user", "content": "(início da conversa)"})
        return lista

    def _situacao(self) -> str:
        partes = [f"Agora: {agora_sp()}."]
        nome_whats = self.t.get("nome")
        if nome_whats:
            partes.append(f"Nome no WhatsApp: {nome_whats}.")
        if self.t.get("primeiraVez"):
            partes.append("É a sua primeira resposta nesta conversa: comece com 'Oi! Aqui é a JUL.IA, assistente digital da Balão da Informática 🎈'.")
        if self.dados:
            mostrar = {k: v for k, v in self.dados.items() if k != "cpf_cnpj"}
            if self.dados.get("cpf_cnpj"):
                mostrar["cpf_cnpj"] = "informado"
            partes.append("Dados do cliente já guardados: " + json.dumps(mostrar, ensure_ascii=False))
        if self.memoria["produtos"]:
            vistos = [f"opção {n}: id {i} = {p['nome']} ({p['preco']})" for n, (i, p) in enumerate(self._mostrados()[-6:], 1)]
            if vistos:
                partes.append("Produtos já mostrados ao cliente, em ordem: " + "; ".join(vistos))
        orc = self.memoria.get("orcamento")
        if orc:
            partes.append(f"Orçamento nº {orc['numero']} já emitido: " + ", ".join(
                f"{i['quantidade']}x {i['nome']}" for i in orc["itens"]) + f"; total à vista {reais(orc['total'])}.")
        venda = self.memoria.get("venda")
        if venda:
            partes.append(f"Pedido nº {venda['numero']} já registrado. Não emita outro; para qualquer mudança, chame um vendedor.")
        if self.config.get("vendaAutomatica") is False:
            partes.append("Fechamento de pedido está com os vendedores: quando o cliente quiser fechar, chame chamar_vendedor.")
        return "\n".join(partes)

    def _mostrados(self) -> list:
        """Produtos que o cliente VIU (cartão enviado), na ordem em que viu."""
        ordem = self.memoria.get("mostrados") or []
        return [(i, self.memoria["produtos"][i]) for i in ordem if i in self.memoria["produtos"]]

    def consulta_do_cliente(self) -> str:
        """O que o cliente pediu, para buscar no catálogo: a fala do áudio entra, a descrição da foto não."""
        t = self.ultima_do_cliente()
        t = re.sub(r"\[(foto|v[ií]deo)[^\]]*\]", " ", t, flags=re.I)
        t = re.sub(r"\[[áa]udio do cliente:\s*([^\]]*)\]", r"\1", t, flags=re.I)
        t = re.sub(r"\[[^\]]*\]", " ", t)
        return " ".join(t.split())[:200]

    def _fala_de_produto(self, texto: str) -> bool:
        from catalogo import TIPOS_CONHECIDOS, palavras

        tipos = TIPOS_CONHECIDOS | getattr(self.catalogo, "_tipos", set())
        return any(p in tipos or p.rstrip("s") in tipos for p in palavras(texto))

    def _teto(self, texto: str):
        valores = R.valores_citados(texto)
        return max(valores) if valores and TETO_DE_PRECO.search(R.sem_acento(texto)) else None

    def _chamar_modelo(self, conversa, inicio, ferramentas=None) -> dict | None:
        """Uma chamada ao modelo dentro do prazo da resposta. None = estourou o prazo."""
        resta = self.prazo_s - (time.time() - inicio)
        if resta < 5:
            return None
        try:
            msg = self.ollama.conversar(self.modelo, conversa, ferramentas=ferramentas, contexto=self.contexto,
                                        espera=max(5, min(60, int(resta))))
        except TimeoutError:
            return None
        medida = msg.pop("_medida", None) if isinstance(msg, dict) else None
        if medida:
            self.medidas.append(medida)
        return msg

    def pediu_produto(self) -> bool:
        """A última mensagem do cliente fala de um tipo de produto?"""
        from catalogo import TIPOS_CONHECIDOS, palavras

        tipos = TIPOS_CONHECIDOS | getattr(self.catalogo, "_tipos", set())
        return any(p in tipos or p.rstrip("s") in tipos for p in palavras(self.ultima_do_cliente()))

    # ------------------------------------------------------------ ferramentas
    def _lembrar_produto(self, resumo: dict):
        p = self.catalogo.produto(resumo["id"])
        if not p:
            return
        precos = sorted(self.catalogo.precos_de(p))
        self.precos.update(precos)
        self.memoria["produtos"][str(resumo["id"])] = {"nome": resumo["nome"][:140], "preco": resumo["preco_a_vista_pix"], "precos": precos}
        if len(self.memoria["produtos"]) > 30:
            self.memoria["produtos"].pop(next(iter(self.memoria["produtos"])))

    def f_buscar_produtos(self, busca="", preco_maximo=None, preco_minimo=None, ordem="relevancia"):
        for v in (preco_maximo, preco_minimo):
            if v:
                try:
                    self.precos.add(round(float(v), 2))
                except (TypeError, ValueError):
                    pass
        achados = self.catalogo.buscar(busca, preco_maximo=preco_maximo or None, preco_minimo=preco_minimo or None,
                                       ordem=ordem if ordem in ("relevancia", "menor_preco", "maior_preco") else "relevancia")
        for r in achados:
            self._lembrar_produto(r)
        if achados:
            self.ultimos_achados = achados
            return {"produtos": achados}
        tipo = self.catalogo.tipo_da_busca(busca)
        if tipo and tipo != R.sem_acento(busca).strip():
            parecidos = self.catalogo.buscar(tipo, preco_maximo=preco_maximo or None, preco_minimo=preco_minimo or None)
            if parecidos:
                self.ultimos_achados = parecidos
                for r in parecidos:
                    self._lembrar_produto(r)
                return {"produtos": parecidos, "aviso": f"Não há exatamente '{busca}' no site. Estes são {tipo}s do site: diga isso ao cliente e mostre os mais próximos do que ele pediu."}
        saida = {"produtos": [], "dica": "Não há esse produto no site agora. Diga isso ao cliente em uma frase e ofereça chamar um vendedor para ver na loja."}
        if preco_maximo:
            sem_teto = self.catalogo.buscar(busca, ordem="menor_preco", limite=1)
            if sem_teto:
                self._lembrar_produto(sem_teto[0])
                saida["mais_em_conta_acima_do_valor"] = sem_teto[0]
                saida["dica"] = "Não há nessa faixa de preço. Diga isso e apresente o mais em conta que existe."
        return saida

    def f_detalhes_do_produto(self, id=""):
        d = self.catalogo.detalhes(id)
        if not d:
            return {"erro": "produto não encontrado ou indisponível"}
        self._lembrar_produto(d)
        return d

    def f_mostrar_produto(self, id=""):
        p = self.catalogo.produto(id)
        if not p:
            return {"ok": False, "erro": "produto não encontrado ou indisponível no site"}
        if str(p.get("id")) in self.cartoes:
            return {"ok": True, "obs": "já vai junto nesta resposta"}
        if len(self.cartoes) >= MAX_CARTOES:
            return {"ok": False, "erro": f"no máximo {MAX_CARTOES} produtos por resposta"}
        self.cartoes.append(str(p.get("id")))
        self._lembrar_produto(self.catalogo.resumo(p))
        mostrados = [i for i in (self.memoria.get("mostrados") or []) if i != str(p.get("id"))] + [str(p.get("id"))]
        self.memoria["mostrados"] = mostrados[-12:]
        return {"ok": True, "vai_para_o_cliente": "foto, preço e link do site"}

    def f_salvar_dados(self, **campos):
        salvos, erros = [], []
        for k, v in campos.items():
            if k not in CAMPOS_DO_CLIENTE or v in (None, ""):
                continue
            v = str(v).strip()
            if k == "cpf_cnpj":
                if not R.documento_valido(v):
                    erros.append("CPF/CNPJ inválido: peça para o cliente conferir")
                    continue
                v = R.digitos(v)
            elif k == "email":
                if not R.EMAIL.fullmatch(v):
                    erros.append("e-mail inválido")
                    continue
                v = v.lower()
            elif k == "cep":
                if len(R.digitos(v)) != 8:
                    erros.append("CEP inválido")
                    continue
                v = R.digitos(v)
            elif k == "uf":
                v = v.upper()[:2]
                if v not in R.UFS:
                    erros.append("UF inválida")
                    continue
            elif k == "nome":
                v = " ".join(v.split())[:120]
            elif k == "pagamento" and v not in ("pix", "cartao", "boleto", "dinheiro"):
                continue
            elif k == "entrega" and v not in ("retirada", "entrega"):
                continue
            self.dados[k] = v
            salvos.append(k)
        return {"salvo": salvos, "erros": erros, "faltam_para_fechar": self.faltam()}

    def cliente_confirmou(self) -> bool:
        """"Sim" na última mensagem, ou um "sim" já dado a ESTE orçamento numa mensagem anterior."""
        orc = self.memoria.get("orcamento") or {}
        if R.confirmou_compra(self.ultima_do_cliente()):
            if orc:
                self.memoria["confirmou"] = str(orc.get("numero"))
            return True
        return bool(orc) and self.memoria.get("confirmou") == str(orc.get("numero"))

    def faltam(self) -> list[str]:
        f = []
        if len(str(self.dados.get("nome", "")).split()) < 2:
            f.append("nome completo")
        if not self.dados.get("cpf_cnpj"):
            f.append("CPF ou CNPJ")
        if not self.dados.get("pagamento"):
            f.append("forma de pagamento (Pix, cartão ou boleto)")
        if not self.dados.get("entrega"):
            f.append("retirada na loja ou entrega")
        elif self.dados["entrega"] == "entrega":
            for k, nome in (("cep", "CEP"), ("endereco", "endereço (rua)"), ("numero", "número"), ("cidade", "cidade"), ("uf", "estado (UF)")):
                if not self.dados.get(k):
                    f.append(nome)
        return f

    def f_emitir_orcamento(self, itens=None):
        if self.memoria.get("venda"):
            return {"ok": False, "erro": "já existe pedido nesta conversa; para mudar, chame um vendedor"}
        dia = dt.date.today().isoformat()
        cont = self.memoria.get("orcamentosHoje") or {}
        if cont.get("dia") == dia and cont.get("n", 0) >= MAX_ORCAMENTOS_POR_DIA:
            return {"ok": False, "erro": "limite de orçamentos de hoje nesta conversa; chame um vendedor"}
        lista = []
        for item in itens or []:
            p = self.catalogo.produto((item or {}).get("id"))
            if not p:
                return {"ok": False, "erro": f"produto {item.get('id')} não está disponível no site"}
            q = int((item or {}).get("quantidade") or 1)
            if q < 1 or q > 20:
                return {"ok": False, "erro": "quantidade entre 1 e 20; acima disso, chame um vendedor"}
            lista.append({"id": str(p.get("id")), "nome": nome_curto(p.get("name"), 100), "quantidade": q, "valor": round(preco(p.get("price")), 2)})
        if not lista:
            return {"ok": False, "erro": "sem itens"}
        total = round(sum(i["valor"] * i["quantidade"] for i in lista), 2)
        try:
            contato = self.bling.contato_para({**self.dados, "nome": self.dados.get("nome") or self.t.get("nome")}, self.t.get("numero") or "")
            prop = self.bling.criar_proposta(
                contato, lista,
                observacoes=f"Orçamento feito pela JUL.IA (assistente digital) pelo WhatsApp. Preços à vista no Pix, do site www.balao.info em {dt.date.today():%d/%m/%Y}. Válido por 3 dias, sujeito a disponibilidade.",
                observacao_interna=f"WhatsApp {self.t.get('numero')} · conversa da JUL.IA",
            )
        except Exception as e:
            erro = mensagem_de_erro(e)
            self.acoes.append({"tipo": "orcamento", "erro": erro, "total": total, "itens": lista})
            return {"ok": False, "erro": erro, "instrucao": "Diga ao cliente que um vendedor vai conferir o orçamento e chame chamar_vendedor."}
        self.memoria["orcamento"] = {"numero": str(prop["numero"]), "id": str(prop["id"]), "itens": lista, "total": total, "em": int(time.time())}
        self.memoria.pop("confirmou", None)
        self.memoria["orcamentosHoje"] = {"dia": dia, "n": (cont.get("n", 0) if cont.get("dia") == dia else 0) + 1}
        self.precos.add(total)
        if self._no_cartao(lista):
            self.precos.add(self._no_cartao(lista))
        for i in lista:
            self.precos.update({i["valor"], round(i["valor"] * i["quantidade"], 2)})
        self.acoes.append({"tipo": "orcamento", "numero": str(prop["numero"]), "blingId": str(prop["id"]), "total": total, "itens": lista})
        self.extras.append(self._texto_do_orcamento(prop, lista, total))
        return {"ok": True, "numero": str(prop["numero"]), "total_a_vista": reais(total),
                "instrucao": "O orçamento completo já vai para o cliente. Não repita itens nem valores: só pergunte se pode fechar o pedido."}

    def _no_cartao(self, lista) -> float | None:
        """Total no cartão (preço de cartão do site), ou None se algum item não tem."""
        soma = 0.0
        for i in lista:
            p = self.catalogo.produto(i["id"])
            v = preco(p.get("price_card")) if p else 0
            if v <= 0:
                return None
            soma += v * i["quantidade"]
        return round(soma, 2)

    def _texto_do_orcamento(self, prop, lista, total) -> str:
        linhas = [f"🧾 *Orçamento nº {prop['numero']}*" + (" (teste)" if prop.get("simulado") else "")]
        for i in lista:
            linhas.append(f"• {i['quantidade']} × {i['nome']} — {reais(i['valor'])}")
        linhas.append(f"*Total à vista no Pix: {reais(total)}*")
        cartao = self._no_cartao(lista)
        if cartao:
            p = self.catalogo.produto(lista[0]["id"])
            parcelas = f" ({p['installment']})" if len(lista) == 1 and lista[0]["quantidade"] == 1 and p and p.get("installment") else ""
            linhas.append(f"No cartão: {reais(cartao)}{parcelas}")
        linhas.append("Válido por 3 dias, sujeito a disponibilidade.")
        return "\n".join(linhas)

    def f_emitir_venda(self):
        if self.config.get("vendaAutomatica") is False:
            self.transferir = {"motivo": "cliente quer fechar o pedido (venda automática desligada)"}
            return {"ok": False, "instrucao": "O fechamento é com um vendedor: avise que ele vai continuar agora."}
        if self.memoria.get("venda"):
            return {"ok": False, "erro": f"pedido nº {self.memoria['venda']['numero']} já registrado"}
        orc = self.memoria.get("orcamento")
        if not orc:
            return {"ok": False, "erro": "emita o orçamento primeiro (emitir_orcamento) para o cliente ver o total"}
        if not self.cliente_confirmou():
            return {"ok": False, "erro": "o cliente ainda não confirmou com clareza; pergunte se pode fechar o pedido"}
        faltam = self.faltam()
        if faltam:
            return {"ok": False, "faltam": faltam, "instrucao": "Peça o que falta, uma coisa por vez."}
        # O preço do orçamento vale se o site não mudou; mudou, o vendedor confere.
        for i in orc["itens"]:
            p = self.catalogo.produto(i["id"])
            if not p:
                self.transferir = {"motivo": f"produto do orçamento {orc['numero']} saiu do site"}
                return {"ok": False, "instrucao": "Um item saiu do site. Avise que um vendedor vai conferir e continuar."}
        entrega = None
        if self.dados.get("entrega") == "entrega":
            entrega = {**self.dados}
        pagamento = {"pix": "Pix", "cartao": "cartão", "boleto": "boleto", "dinheiro": "dinheiro"}.get(self.dados.get("pagamento"), "")
        # No cartão vale o preço de cartão do site (o à vista é o do Pix).
        itens = [dict(i) for i in orc["itens"]]
        no_cartao = self.dados.get("pagamento") == "cartao"
        if no_cartao:
            for i in itens:
                p = self.catalogo.produto(i["id"])
                if p and preco(p.get("price_card")) > 0:
                    i["valor"] = round(preco(p["price_card"]), 2)
        total = round(sum(i["valor"] * i["quantidade"] for i in itens), 2)
        modo = "Retirada na loja" if self.dados.get("entrega") == "retirada" else "Entrega (frete a combinar)"
        try:
            contato = self.bling.contato_para(self.dados, self.t.get("numero") or "")
            ped = self.bling.criar_pedido(
                contato, itens,
                observacoes=f"Pedido feito pela JUL.IA (assistente digital) pelo WhatsApp, a partir do orçamento nº {orc['numero']}. Pagamento: {pagamento}. {modo}.",
                observacoes_internas=f"WhatsApp {self.t.get('numero')}. Conferir pagamento e {modo.lower()} com o cliente.",
                pagamento=self.dados.get("pagamento"),
                entrega=entrega,
            )
        except Exception as e:
            erro = mensagem_de_erro(e)
            self.acoes.append({"tipo": "venda", "erro": erro, "total": total, "itens": itens})
            self.transferir = {"motivo": f"cliente confirmou a compra, mas o pedido não entrou no Bling: {erro}"}
            return {"ok": False, "instrucao": "Diga que o pedido está confirmado e que um vendedor vai finalizar agora."}
        self.memoria["venda"] = {"numero": str(ped["numero"]), "id": str(ped["id"]), "total": total, "em": int(time.time())}
        self.acoes.append({"tipo": "venda", "numero": str(ped["numero"]), "blingId": str(ped["id"]), "total": total, "itens": itens})
        self.precos.add(total)
        self.extras.append(
            f"✅ *Pedido nº {ped['numero']} registrado*" + (" (teste)" if ped.get("simulado") else "") + "\n"
            + (f"Total no cartão: {reais(total)}\n" if no_cartao else f"Total à vista: {reais(total)}\n")
            + f"Pagamento: {pagamento} · {modo}\n"
            + "Um vendedor da loja vai falar com você agora para combinar o pagamento"
            + (" e a retirada." if self.dados.get("entrega") == "retirada" else ", o frete e a entrega.")
        )
        # Pagamento e entrega são com gente.
        self.transferir = {"motivo": f"venda nº {ped['numero']} fechada pela JUL.IA: combinar pagamento e {modo.lower()}"}
        return {"ok": True, "numero": str(ped["numero"]), "instrucao": "A confirmação já vai para o cliente. Agradeça em uma frase curta, sem repetir valores."}

    def f_chamar_vendedor(self, motivo=""):
        self.transferir = {"motivo": (motivo or "pedido do agente")[:200]}
        return {"ok": True, "instrucao": "Avise o cliente, em uma frase, que um vendedor vai continuar o atendimento (no horário da loja)."}

    def executar(self, nome: str, argumentos) -> dict:
        if isinstance(argumentos, str):
            try:
                argumentos = json.loads(argumentos or "{}")
            except json.JSONDecodeError:
                argumentos = {}
        argumentos = argumentos if isinstance(argumentos, dict) else {}
        fn = getattr(self, "f_" + str(nome), None)
        if not fn:
            return {"erro": f"ferramenta {nome} não existe"}
        try:
            return fn(**argumentos)
        except TypeError as e:
            return {"erro": f"argumentos inválidos: {e}"}

    # ------------------------------------------------------------ rodada
    def responder(self) -> dict:
        inicio = time.time()
        # Documento, e-mail e CEP escritos pelo cliente entram sem depender do modelo.
        # (o que o cliente acabou de escrever vale mais que o de antes: "pix" depois de "cartão")
        for m in self.t.get("mensagens") or []:
            if m.get("de") == "cliente":
                for k, v in R.extrair_dados(m.get("conteudo") or m.get("texto") or "").items():
                    self.dados[k] = v if k in ("pagamento", "entrega") else self.dados.get(k, v)
        self.cliente_confirmou()

        # Um system só, no começo: o modelo de chat do Qwen ignora system no meio da conversa.
        pronta = None
        if R.pediu_desconto(self.palavras_do_cliente()):
            self.transferir = {"motivo": "cliente pediu desconto ou condição especial"}
            pronta = "Desconto e condição especial quem vê é um vendedor da loja: já chamei um para falar com você 🙂"
        elif R.pediu_assistencia(self.palavras_do_cliente()) and not self.memoria.get("orcamento"):
            self.transferir = {"motivo": "assistência técnica, conserto ou garantia"}
            pronta = "Conserto, assistência técnica e garantia são com a nossa equipe da loja: já chamei um vendedor para te atender 🙂"
        if pronta:
            texto = pronta
            if self.t.get("primeiraVez"):
                texto = "Oi! Aqui é a JUL.IA, assistente digital da Balão da Informática 🎈\n" + texto
            self.memoria["apresentou"] = True
            return self._resultado([{"tipo": "texto", "texto": texto}], inicio)

        conversa = [
            {"role": "system", "content": INSTRUCOES + "\n\nSituação desta conversa:\n" + self._situacao()},
            *self._mensagens_do_modelo(),
        ]
        # Valores que o próprio cliente falou ("até uns 5 mil") podem ser repetidos.
        for m in self.t.get("mensagens") or []:
            if m.get("de") == "cliente":
                self.precos.update(R.valores_citados(m.get("conteudo") or m.get("texto") or ""))
        texto = ""
        usadas: list[str] = []
        empurroes = 0
        estourou = False

        # Primeiro pedido de produto da conversa: o código já busca (com as
        # palavras do cliente) antes de chamar o modelo. Ele recebe as opções
        # prontas e vai direto mostrar e responder: uma ida ao modelo a menos
        # (antes ele perguntava, levava um empurrão e só depois buscava).
        if not self._mostrados() and not self.memoria.get("orcamento"):
            consulta = self.consulta_do_cliente()
            if self._fala_de_produto(consulta):
                args = {"busca": R.sem_precos(consulta) or consulta}
                teto = self._teto(consulta)
                if teto:
                    args["preco_maximo"] = teto
                saida = self.f_buscar_produtos(**args)

                self.registrar(f"[cerebro] busca antes do modelo: {len(saida.get('produtos') or [])} produto(s)")
                conversa.append({"role": "assistant", "content": "",
                                 "tool_calls": [{"function": {"name": "buscar_produtos", "arguments": args}}]})
                conversa.append({"role": "tool", "content": json.dumps(saida, ensure_ascii=False), "tool_name": "buscar_produtos"})
                usadas.append("buscar_produtos")
                if saida.get("produtos"):
                    # O Qwen segue recado como "user" marcado (no resultado da ferramenta ele ignorava
                    # e listava os produtos com preço, o que os cartões já mostram).
                    conversa.append({"role": "user", "content": NOTA + (
                        "Os 3 primeiros produtos da busca já vão para o cliente como cartões, com foto, preço e link "
                        "(para mandar outros, chame mostrar_produto com os ids). Responda ao cliente com 1 frase curta e "
                        "1 pergunta (para que vai usar, ou qual prefere). Não liste os produtos e não repita nomes nem preços. "
                        "Se nenhum servir para o que ele pediu, diga isso.")})

        for _ in range(MAX_RODADAS):
            msg = self._chamar_modelo(conversa, inicio, ferramentas=FERRAMENTAS)
            if msg is None:
                estourou = True
                break
            chamadas = msg.get("tool_calls") or []
            if not chamadas:
                texto = R.limpar_texto(msg.get("content") or "")
                # Empurrões (no máximo 2): o cliente disse o produto e o modelo só
                # perguntou; ou o modelo disse "vou buscar"/"um momento" sem buscar.
                nota = None
                if not usadas and not self._mostrados() and self.pediu_produto() and not self.memoria.get("orcamento"):
                    nota = "O cliente já disse o tipo de produto. Chame buscar_produtos agora e mostre opções com mostrar_produto antes de perguntar mais."
                elif R.VOU_FAZER.search(texto) and not usadas:
                    nota = ("Não diga que vai fazer: faça agora com as ferramentas (emitir_orcamento para orçamento, emitir_venda para "
                            "pedido, detalhes_do_produto para especificação, buscar_produtos para produto) e responda com o resultado.")
                if nota and empurroes < 2:
                    empurroes += 1
                    conversa.append({"role": "assistant", "content": texto})
                    conversa.append({"role": "user", "content": NOTA + nota})
                    continue
                break
            conversa.append({"role": "assistant", "content": msg.get("content") or "", "tool_calls": chamadas})
            for c in chamadas:
                f = c.get("function") or {}
                usadas.append(str(f.get("name")))
                saida = self.executar(f.get("name"), f.get("arguments"))
                nome_f = str(f.get("name"))
                args = f.get("arguments") if nome_f in ("buscar_produtos", "detalhes_do_produto", "mostrar_produto", "emitir_orcamento") else ""
                self.registrar(f"[cerebro] ferramenta {nome_f} {json.dumps(args, ensure_ascii=False) if args else ''}".rstrip())
                conversa.append({"role": "tool", "content": json.dumps(saida, ensure_ascii=False), "tool_name": f.get("name")})
        else:
            texto = ""

        # Buscou, achou e não mostrou: o texto do modelo fala das opções, então
        # o cliente recebe as duas primeiras (senão "o segundo" não teria a que se referir).
        # (Se o próprio texto diz que não tem o que o cliente pediu, nada de cartão.)
        if ("buscar_produtos" in usadas and not self.cartoes and self.ultimos_achados
                and not R.so_disse_que_nao_tem(texto)):
            for r in self.ultimos_achados[:MAX_CARTOES]:
                self.f_mostrar_produto(r["id"])

        # O cliente disse "sim", há orçamento e os dados estão completos, mas o
        # modelo não registrou: o código registra (a confirmação foi conferida aqui).
        if ("emitir_venda" not in usadas and not self.memoria.get("venda") and self.memoria.get("orcamento")
                and self.config.get("vendaAutomatica") is not False and self.cliente_confirmou() and not self.faltam()):
            self.registrar("[cerebro] o cliente confirmou e o modelo não chamou emitir_venda: o código registra")
            if self.f_emitir_venda().get("ok"):
                texto = "Muito obrigada pela compra! 😊"

        # Passou do prazo sem resposta: o cliente não fica esperando.
        if estourou and not texto and not self.extras:
            if self.cartoes:
                texto = "Separei estas opções para você 👇 Qual delas te interessa mais?"
            else:
                self.registrar(f"[cerebro] passou do prazo ({self.prazo_s:.0f} s): chamo um vendedor")
                texto = "Deixa eu chamar um vendedor para te atender, só um instante 🙂"
                self.transferir = self.transferir or {"motivo": "a JUL.IA demorou demais para responder (computador ocupado)"}

        # Confere antes de deixar sair. Uma chance de consertar; depois, gente.
        for tentativa in range(2):
            numeros = {str(d["numero"]) for d in (self.memoria.get("orcamento"), self.memoria.get("venda")) if d}
            problemas = (R.problemas_da_resposta(texto, self.precos)
                         + R.afirmacoes_falsas(texto, venda_feita=bool(self.memoria.get("venda")), numeros_validos=numeros)) if texto else ["resposta vazia"]
            if not problemas:
                # Só comprida demais: o código encurta (sem outra ida ao modelo).
                if R.problemas_de_estilo(texto):
                    texto = R.encurtar(texto)
                break
            if tentativa == 1:
                self.registrar(f"[cerebro] resposta barrada: {problemas}")
                texto = "Deixa eu confirmar isso com um vendedor para te passar certinho, só um instante 🙂"
                self.transferir = self.transferir or {"motivo": "a JUL.IA não conseguiu responder com segurança: " + "; ".join(problemas)[:180]}
                self.cartoes = []
                break
            conversa.append({"role": "assistant", "content": texto})
            conversa.append({"role": "user", "content": NOTA + "Sua última resposta não pode ir para o cliente: " + "; ".join(problemas)
                             + ". Reescreva a resposta corrigindo isso (sem chamar ferramentas)."})
            msg = self._chamar_modelo(conversa, inicio)
            texto = R.limpar_texto((msg or {}).get("content") or "")

        if self.t.get("primeiraVez") and "JUL.IA" not in texto:
            # Sem "Oi! Aqui é a JUL.IA... Oi, Thiago!": tira a saudação do modelo.
            texto = re.sub(r"^\s*(oi|ol[aá]|opa|e a[ií]|bom dia|boa tarde|boa noite)\b[^.!?\n]*[.!?,]*\s*", "", texto, flags=re.I)
            texto = "Oi! Aqui é a JUL.IA, assistente digital da Balão da Informática 🎈\n" + texto
        self.memoria["apresentou"] = True

        respostas = []
        if texto:
            respostas.append({"tipo": "texto", "texto": texto})
        respostas += [{"tipo": "produto", "produtoId": i} for i in self.cartoes]
        respostas += [{"tipo": "texto", "texto": e} for e in self.extras]
        return self._resultado(respostas, inicio)

    def _resultado(self, respostas, inicio):
        return {
            "respostas": respostas,
            "dados": self.dados,
            "memoria": self.memoria,
            "acoes": self.acoes,
            "transferir": self.transferir,
            "duracaoMs": int((time.time() - inicio) * 1000),
            "modelo": self.modelo,
            # Só números (para o log do PC): quantas idas ao modelo e onde foi o tempo.
            "medidas": {
                "chamadas": len(self.medidas),
                "modelo_ms": sum(m.get("ms", 0) for m in self.medidas),
                "carga_ms": sum(m.get("carga_ms", 0) for m in self.medidas),
                "entrada": sum(m.get("entrada", 0) for m in self.medidas),
                "saida": sum(m.get("saida", 0) for m in self.medidas),
            },
        }
