"""Regras que não dependem do modelo: documentos, confirmação, o que pode sair na resposta.

O modelo de linguagem conversa; quem decide se um CPF vale, se o cliente
confirmou mesmo ou se um preço existe é o código. Um modelo local de 14 bilhões
de parâmetros acerta muito, mas "muito" não basta para emitir pedido.
"""
from __future__ import annotations

import re
import unicodedata

UFS = set("AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split())


def digitos(t) -> str:
    return re.sub(r"\D", "", str(t or ""))


def cpf_valido(cpf: str) -> bool:
    c = digitos(cpf)
    if len(c) != 11 or c == c[0] * 11:
        return False
    for n in (9, 10):
        soma = sum(int(c[i]) * (n + 1 - i) for i in range(n))
        dv = (soma * 10) % 11 % 10
        if dv != int(c[n]):
            return False
    return True


def cnpj_valido(cnpj: str) -> bool:
    c = digitos(cnpj)
    if len(c) != 14 or c == c[0] * 14:
        return False
    for n in (12, 13):
        pesos = list(range(n - 7, 1, -1)) + list(range(9, 1, -1))
        soma = sum(int(c[i]) * pesos[i] for i in range(n))
        dv = 11 - soma % 11
        dv = 0 if dv >= 10 else dv
        if dv != int(c[n]):
            return False
    return True


def documento_valido(doc: str) -> bool:
    d = digitos(doc)
    return cpf_valido(d) if len(d) == 11 else cnpj_valido(d) if len(d) == 14 else False


EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
CEP = re.compile(r"\b(\d{5})-?(\d{3})\b")


def extrair_dados(texto: str) -> dict:
    """CPF/CNPJ, e-mail e CEP escritos pelo cliente (o nome fica com o modelo)."""
    achados = {}
    for bruto in re.findall(r"\d[\d.\-/ ]{9,20}\d", texto or ""):
        d = digitos(bruto)
        if len(d) in (11, 14) and documento_valido(d):
            achados["cpf_cnpj"] = d
            break
    m = EMAIL.search(texto or "")
    if m:
        achados["email"] = m.group(0).lower()
    m = re.search(r"cep\D{0,6}(\d{5})-?(\d{3})", texto or "", re.I) or (
        CEP.search(texto or "") if re.search(r"\d{5}-\d{3}", texto or "") else None
    )
    if m:
        achados["cep"] = m.group(1) + m.group(2)
    t = sem_acento(texto)
    if re.search(r"\bpix\b", t):
        achados["pagamento"] = "pix"
    elif re.search(r"\b(cartao|credito|debito|parcelad)", t):
        achados["pagamento"] = "cartao"
    elif re.search(r"\bboleto\b", t):
        achados["pagamento"] = "boleto"
    elif re.search(r"\b(dinheiro|especie)\b", t):
        achados["pagamento"] = "dinheiro"
    if re.search(r"\b(retir\w*|busco|buscar|pego na loja|passo na loja|vou ai|vou na loja)\b", t):
        achados["entrega"] = "retirada"
    elif re.search(r"\b(entreg\w*|frete|(envi\w*|mand\w*) (pra|para) (minha|meu|o meu|a minha) (casa|endereco|trabalho|empresa|escritorio))\b", t):
        achados["entrega"] = "entrega"
    return achados


def sem_acento(t: str) -> str:
    return unicodedata.normalize("NFKD", str(t or "")).encode("ascii", "ignore").decode().lower()


# Confirmação de compra: tem de estar na ÚLTIMA mensagem do cliente.
SIM = re.compile(
    r"\b(sim|pode (fechar|emitir|mandar|fazer|seguir|confirmar)|fecha(do|r)?|fechou|confirmo|confirmad[oa]|quero (sim|esse|essa|comprar|fechar)|"
    r"vou levar|bora|manda (bala|ver)|pode ser|ok|okay|beleza|blz|combinado|perfeito|isso mesmo|com certeza|positivo|claro)\b"
)
NAO = re.compile(r"\b(nao|ainda nao|depois|vou pensar|pensar|talvez|calma|espera|aguarda|cancela|desisti|mais barato|desconto)\b")


DESCONTO = re.compile(r"\b(desconto|descontinho|abaixa|abaixar|faz por|faria por|melhor preco|menor preco|chorar|negociar|negocia|cobre(m)? a oferta)\b")


ASSISTENCIA = re.compile(
    r"\b(consert\w*|arrum\w*|repar\w*|manuten\w*|format\w*|nao liga|parou de funcionar|nao funciona|quebr\w*|trinc\w*|"
    r"defeito\w*|assistencia|garantia|troca de tela|trocar (a|essa|minha|esta) tela|bateria viciada|esquentando|travando|"
    r"tela azul|virus|orcamento de (conserto|reparo))\b"
)


def pediu_assistencia(texto: str) -> bool:
    """Conserto, defeito, garantia: é com a equipe técnica, não com a vendedora digital."""
    return bool(ASSISTENCIA.search(sem_acento(texto)))


def pediu_desconto(texto: str) -> bool:
    return bool(DESCONTO.search(sem_acento(texto)))


def confirmou_compra(texto: str) -> bool:
    t = sem_acento(texto)
    return bool(SIM.search(t)) and not NAO.search(t)


# ---------------------------------------------------------------- resposta
CONCORRENTES = re.compile(
    r"\b(kabum|mercado ?livre|amazon|pichau|terabyte|magalu|magazine luiza|americanas|shopee|aliexpress|casas bahia|"
    r"fast ?shop|submarino|carrefour)\b",
    re.I,
)
SEGREDOS_DA_LOJA = re.compile(r"\b(custo|fornecedor|fornecedores|margem|lucro|pre[cç]o de compra)\b", re.I)
LINK = re.compile(r"https?://[^\s)]+", re.I)
VALOR = re.compile(r"R\$\s*([\d.]+(?:,\d{1,2})?)")


def valor_de(texto: str) -> float:
    t = texto.replace(".", "").replace(",", ".")
    try:
        return round(float(t), 2)
    except ValueError:
        return -1.0


def valores_citados(texto: str) -> set[float]:
    """Dinheiro que o cliente escreveu: "5 mil", "R$ 4.500", "3500 reais", "2k"."""
    t = sem_acento(texto)
    achados = set()
    for m in re.finditer(r"(\d+(?:[.,]\d+)?)\s*(mil|k)\b", t):
        achados.add(round(float(m.group(1).replace(",", ".")) * 1000, 2))
    for m in re.finditer(r"(?:r\$\s*)(\d[\d.]*(?:,\d{1,2})?)|(\d[\d.]*(?:,\d{1,2})?)\s*(?:reais|conto)", t):
        achados.add(valor_de(m.group(1) or m.group(2)))
    return {v for v in achados if v > 0}


PRECO_NA_FRASE = re.compile(
    r"\b(?:ate|uns|umas|no maximo|por volta de|em torno de|na faixa de|de)?\s*(?:r\$\s*)?\d+(?:[.,]\d+)?\s*(?:mil|k|reais|conto)\b"
    r"|r\$\s*\d[\d.,]*"
)


DISSE_QUE_NAO_TEM = re.compile(r"\bnao (temos|tem|encontrei|achei|ha|trabalhamos|vendemos)\b|\bem falta\b|\besgotad")


def so_disse_que_nao_tem(texto: str) -> bool:
    """"Não temos esse modelo no site" (sem oferecer outro): os cartões da busca não vão."""
    t = sem_acento(texto)
    oferece = re.search(r"\b(mas|porem|separei|veja|olha|alternativ\w*|opco\w*|opca\w*|(tenho|temos) (estas|estes|essas|esses|outr\w*|alguns|algumas|sim))\b", t)
    return bool(DISSE_QUE_NAO_TEM.search(t)) and not oferece


def sem_precos(texto: str) -> str:
    """A frase do cliente sem o valor ("notebook pra estudar até 3 mil" -> "notebook pra estudar"),
    para buscar no catálogo: o valor vai como preço máximo, não como palavra."""
    return " ".join(PRECO_NA_FRASE.sub(" ", sem_acento(texto)).split())


def problemas_da_resposta(texto: str, precos_permitidos: set[float]) -> list[str]:
    """O que impede a resposta de ir para o cliente."""
    problemas = []
    for m in VALOR.finditer(texto or ""):
        v = valor_de(m.group(1))
        if not any(abs(v - p) < 0.011 for p in precos_permitidos):
            problemas.append(f"o valor R$ {m.group(1)} não veio das ferramentas (só use preços que buscar_produtos devolveu)")
    if CONCORRENTES.search(texto or ""):
        problemas.append("citou outra loja ou site; fale só da Balão")
    if SEGREDOS_DA_LOJA.search(texto or ""):
        problemas.append("falou de custo, fornecedor ou margem; isso é interno da loja")
    for link in LINK.findall(texto or ""):
        if not re.match(r"https?://(www\.)?balao\.info(/|$)", link, re.I):
            problemas.append(f"link fora do site da loja ({link})")
    return problemas


PEDIDO_FEITO = re.compile(
    r"\b(pedido|compra|venda)\b(?:\s+n[ºo°.]*\s*\S+)?\s+(?:foi\s+|est[aá]\s+(?:sendo\s+)?|j[aá]\s+(?:foi\s+|est[aá]\s+)?|ficou\s+)?"
    r"(registrad|confirmad|realizad|finalizad|efetuad|emitid|fechad|feit|pront|processad)[oa]\b",
    re.I,
)
CONDICIONAL = re.compile(r"\b(se|quando|assim que|depois que|antes de|para que|pra que|posso|podemos|quer que|deseja)\b", re.I)
NUMERO_DE_DOC = re.compile(r"\b(pedido|venda|or[cç]amento|proposta)\b\s*(?:n[ºo°.]*|n[uú]mero)\s*:?\s*\**\s*([A-Z0-9-]+)", re.I)


PROMESSAS = re.compile(
    r"\b(comprovante|link de pagamento|link para pagamento|nota fiscal (ser[aá]|vai)|vou te (enviar|mandar) o link|"
    r"reservad[oa] para (voc[eê]|vc)|separad[oa] para (voc[eê]|vc))\b",
    re.I,
)


def afirmacoes_falsas(texto: str, *, venda_feita: bool, numeros_validos: set[str]) -> list[str]:
    """O modelo diz que fez o que não fez (pedido registrado, número inventado)."""
    problemas = []
    frases = re.split(r"(?<=[.!?\n])\s+", texto or "")
    afirmou = any(PEDIDO_FEITO.search(f) and not f.rstrip().endswith("?") and not CONDICIONAL.search(f) for f in frases)
    if not venda_feita and afirmou:
        problemas.append("disse que o pedido foi registrado, mas emitir_venda não foi chamada com sucesso; "
                         "se o cliente confirmou e os dados estão completos, chame emitir_venda; senão, peça o que falta")
    if PROMESSAS.search(texto or ""):
        problemas.append("prometeu comprovante, link de pagamento, nota ou reserva; isso é com o vendedor, não prometa")
    for m in NUMERO_DE_DOC.finditer(texto or ""):
        if m.group(2).strip("*").upper() not in {n.upper() for n in numeros_validos}:
            problemas.append(f"citou {m.group(1).lower()} nº {m.group(2)} que não existe")
    return problemas


VOU_FAZER = re.compile(
    r"\b(vou (buscar|verificar|pesquisar|procurar|consultar|checar|olhar|emitir|gerar|fazer|preparar|montar|registrar|criar|fechar|enviar|mandar)|"
    r"um momento|s[oó] um (instante|momento)|aguarde)\b",
    re.I,
)
LIMITE_DE_TEXTO = 450


def problemas_de_estilo(texto: str) -> list[str]:
    """Não barram a resposta (na segunda tentativa ela sai assim mesmo), mas pedem conserto."""
    p = []
    if len(texto or "") > LIMITE_DE_TEXTO:
        p.append("a resposta está longa demais para WhatsApp: no máximo 4 frases curtas, sem lista (os cartões já mostram os detalhes)")
    return p


def encurtar(texto: str, limite: int = LIMITE_DE_TEXTO) -> str:
    """Resposta comprida demais vira as primeiras frases que cabem, mantendo a pergunta do fim
    (sem outra ida ao modelo). Uma frase só, enorme, fica como está."""
    t = (texto or "").strip()
    if len(t) <= limite:
        return t
    frases = [f for f in re.split(r"(?<=[.!?])\s+|\n+", t) if f.strip()]
    pergunta = frases[-1] if len(frases) > 1 and frases[-1].rstrip().endswith("?") else ""
    corpo = frases[:-1] if pergunta else frases
    escolhidas, tamanho = [], len(pergunta)
    for f in corpo:
        if escolhidas and tamanho + len(f) + 1 > limite:
            break
        escolhidas.append(f)
        tamanho += len(f) + 1
    if pergunta:
        escolhidas.append(pergunta)
    return " ".join(x.strip() for x in escolhidas).strip() or t


def limpar_texto(texto: str) -> str:
    """Tira o "pensamento" e o markdown que o WhatsApp não mostra."""
    t = re.sub(r"<think>.*?</think>", "", texto or "", flags=re.S)
    t = re.sub(r"\*\*(.+?)\*\*", r"*\1*", t)  # **negrito** -> *negrito*
    t = re.sub(r"__(.+?)__", r"_\1_", t)
    # Link nenhum no texto: o cartão do produto já leva o link certo (o modelo
    # inventa caminhos como /produto/123, que não existem).
    t = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", t)
    t = re.sub(r"[ \t]*(ver|veja|confira|acesse)( (o|mais|aqui|no site|o produto|produto|detalhes))*\s*(:|\.)?\s*https?://\S+", "", t, flags=re.I)
    t = re.sub(r"https?://\S+", "", t)
    t = re.sub(r"[ \t]*\b(ver|veja|saiba) (o produto|produto|mais|detalhes)\.?(?=\s|$)", "", t, flags=re.I)
    t = re.sub(r"^#{1,6}\s*", "", t, flags=re.M)
    t = re.sub(r"[ \t]+\n", "\n", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()
