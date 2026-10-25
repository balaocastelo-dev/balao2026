#!/usr/bin/env python3
"""Robo de cotacoes - Balao da Informatica. So usa a biblioteca padrao do Python.

  python3 proposta.py autoteste
  python3 proposta.py calcular pedido.json          -> grava pedido.calc.json; imprime resumo, ITENS_BLING e OBS_INTERNA
  python3 proposta.py pdf pedido.calc.json NUMERO saida.pdf   -> grava o PDF; imprime SHA256 e BASE64
  python3 proposta.py html pedido.calc.json NUMERO  -> imprime o corpo HTML do e-mail
  python3 proposta.py conferir pedido.calc.json NUMERO --rascunho ID_DO_RASCUNHO
        -> le o resultado do get_draft(RAW) no registro desta sessao; RASCUNHO OK somente se o anexo for identico
           ao PDF, o texto do e-mail for o gerado pelo comando html e o destinatario for o e-mail do cliente
  python3 proposta.py conferir pedido.calc.json NUMERO raw.txt   -> o mesmo, a partir de uma copia manual do campo raw

Regra de negocio: preco de venda = custo de referencia x 1,50, ao centavo.
Custo de referencia: preco do site www.balao.info (fonte com "origem": "site") quando existir;
senao, media de pelo menos 2 lojas, descartando precos que fogem mais de 40% da mediana.
"""
import base64, glob, hashlib, html, json, os, quopri, re, sys, time, unicodedata, zlib
from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP
from statistics import median

MARGEM = Decimal("0.50")
RAZAO, CNPJ = "BALAO DA INFORMATICA MORALES LTDA", "34.397.947/0001-08"
ENDERECO, FONE, WHATS = "Av. Anchieta, 789 - Cambuí - Campinas/SP", "(19) 3255-1661", "(19) 98751-0267"
EMAIL, SITE, RESP = "balaocastelo@gmail.com", "www.balao.info", "Thiago Herrera"


def q(v):
    return Decimal(str(v)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def brl(v):
    i, _, c = f"{q(v):,.2f}".partition(".")
    return "R$ " + i.replace(",", ".") + "," + c


def dmy(d):
    return f"{d:%d/%m/%Y}"


# ---------------------------------------------------------------- calculo
def custo_referencia(fontes):
    precos = [(f, q(f["preco"])) for f in fontes if Decimal(str(f.get("preco") or 0)) > 0]
    if not precos:
        raise ValueError("item sem nenhuma fonte de preco")
    site = [p for f, p in precos if f.get("origem") == "site"]
    if site:
        return min(site), "preco do site www.balao.info", []
    net = [p for _, p in precos]
    if len(net) < 2:
        raise ValueError("item fora do site precisa de pelo menos 2 lojas pesquisadas")
    med = Decimal(str(median(net)))
    usados = [p for p in net if abs(p - med) <= med * Decimal("0.40")]
    avisos = []
    if len(usados) < len(net):
        avisos.append(f"{len(net) - len(usados)} preco(s) descartado(s) por fugir mais de 40% da mediana")
    if len(usados) < 2:
        raise ValueError("precos pesquisados muito diferentes entre si; confirme se sao o mesmo produto")
    media = q(sum(usados) / len(usados))
    if max(usados) - min(usados) > media * Decimal("0.50"):
        avisos.append("precos com dispersao alta; confira se todas as lojas vendem o mesmo produto")
    return media, f"media de {len(usados)} lojas", avisos


def calcular(pedido):
    if not pedido.get("itens"):
        raise ValueError("pedido sem itens")
    itens, total, custo_total, avisos = [], Decimal(0), Decimal(0), []
    for n, it in enumerate(pedido["itens"], 1):
        qtd = Decimal(str(it["quantidade"]))
        if qtd <= 0 or qtd != qtd.to_integral_value():
            raise ValueError(f"item {n}: quantidade invalida")
        custo, criterio, av = custo_referencia(it["fontes"])
        unit = q(custo * (1 + MARGEM))
        sub = q(unit * qtd)
        total += sub
        custo_total += q(custo * qtd)
        avisos += [f"item {n}: {a}" for a in av]
        itens.append({**it, "n": n, "quantidade": int(qtd), "unidade": it.get("unidade") or "UN",
                      "custo": str(custo), "criterio": criterio, "unitario": str(unit), "subtotal": str(sub)})
    return {**pedido, "itens": itens, "total": str(q(total)), "custo_total": str(q(custo_total)), "avisos": avisos}


def resumo(c):
    linhas = [f"{it['n']}. {it['descricao'][:70]} | qtd {it['quantidade']} | custo {brl(it['custo'])} ({it['criterio']}) "
              f"| venda {brl(it['unitario'])} | subtotal {brl(it['subtotal'])}" for it in c["itens"]]
    linhas.append(f"TOTAL {brl(c['total'])} | custo total {brl(c['custo_total'])}")
    linhas += ["AVISO: " + a for a in c["avisos"]]
    bling = [{"produto": {"descricao": it["descricao"][:120]}, "codigo": "", "unidade": it["unidade"][:6],
              "descricaoDetalhada": (it.get("detalhes") or "")[:250],
              "quantidade": it["quantidade"], "valor": float(it["unitario"])} for it in c["itens"]]
    interna = " | ".join(f"{it['n']}) custo {brl(it['custo'])} ({it['criterio']}: "
                         + ", ".join(f"{f.get('loja', '?')} {brl(f['preco'])}" for f in it["fontes"]) + ")"
                         for it in c["itens"])
    return "\n".join(linhas), bling, (interna + " | venda = custo x 1,50")[:1500]


def datas(c):
    emissao = date.fromisoformat(c["data"])
    return emissao, emissao + timedelta(days=int(c.get("validade_dias") or 15))


def condicoes(c):
    cli, cond = c.get("cliente") or {}, c.get("condicoes") or {}
    _, validade = datas(c)
    pares = [("Validade da proposta", f"{int(c.get('validade_dias') or 15)} dias (até {dmy(validade)})"),
             ("Pagamento", cond.get("pagamento")), ("Frete", cond.get("frete")),
             ("Prazo de entrega", cond.get("prazo_entrega")), ("Garantia", cond.get("garantia")),
             ("Faturamento", f"Nota fiscal em nome do CNPJ {cli['cnpj']}" if cli.get("cnpj") else "Com emissão de nota fiscal"),
             ("Observações", c.get("observacoes"))]
    return [(k, str(v)) for k, v in pares if v]


# ------------------------------------------------------------------- PDF
_W = ("278 278 355 556 556 889 667 191 333 333 389 584 278 333 278 278 556 556 556 556 556 556 556 556 556 556 278 278 "
      "584 584 584 556 1015 667 667 722 722 667 611 778 722 278 500 667 556 833 722 778 667 778 722 667 611 722 667 944 "
      "667 667 611 278 278 278 469 556 333 556 556 500 556 556 278 556 556 222 222 500 222 833 556 556 556 556 333 500 "
      "278 556 500 722 500 500 500 334 260 334 584").split()
LARG = {chr(32 + i): int(w) for i, w in enumerate(_W)}


def largura(s, tam, negrito=False):
    t = 0
    for ch in s:
        base = unicodedata.normalize("NFD", ch)[0]
        t += LARG.get(ch) or LARG.get(base) or 556
    return t * tam / 1000 * (1.06 if negrito and not re.fullmatch(r"[R$ 0-9.,]*", s) else 1)


def quebrar(s, tam, larg_max, negrito=False):
    linhas, atual = [], ""
    for palavra in str(s).split():
        tent = (atual + " " + palavra).strip()
        if atual and largura(tent, tam, negrito) > larg_max:
            linhas.append(atual)
            atual = palavra
        else:
            atual = tent
    return linhas + [atual] if atual else linhas or [""]


class Pagina:
    def __init__(self):
        self.ops, self.y = [], 0.0

    def cor(self, r, g, b):
        self.ops.append(f"{r} {g} {b} rg")

    def ret(self, x, y, w, h):
        self.ops.append(f"{x} {y:.1f} {w} {h} re f")

    def txt(self, x, y, s, tam=9, negrito=False, direita=False):
        s = str(s)
        if direita:
            x -= largura(s, tam, negrito)
        b = s.encode("cp1252", "replace").replace(b"\\", b"\\\\").replace(b"(", b"\\(").replace(b")", b"\\)")
        self.ops.append(f"BT /F{2 if negrito else 1} {tam} Tf {x:.1f} {y:.1f} Td (" + b.decode("latin-1") + ") Tj ET")


def montar_pdf(c, numero):
    emissao, validade = datas(c)
    cli = c.get("cliente") or {}
    pags = []
    VERM, PRETO, CINZA, BRANCO = (0.835, 0, 0), (0.07, 0.07, 0.07), (0.4, 0.4, 0.4), (1, 1, 1)

    def nova():
        p = Pagina()
        pags.append(p)
        if len(pags) == 1:
            p.cor(*PRETO); p.ret(0, 772, 595, 70)
            p.cor(*VERM); p.ret(0, 768, 595, 4)
            p.cor(*BRANCO)
            p.txt(40, 812, "BALÃO DA INFORMÁTICA", 18, True)
            p.txt(40, 797, f"{RAZAO} - CNPJ {CNPJ}", 8.5)
            p.txt(40, 785, f"{ENDERECO} - {FONE} - WhatsApp {WHATS}", 8.5)
            p.txt(555, 812, SITE, 9, True, True)
            p.txt(555, 797, EMAIL, 8.5, False, True)
            p.cor(*PRETO)
            p.txt(40, 738, f"PROPOSTA COMERCIAL Nº {numero}", 15, True)
            p.txt(555, 744, f"Emissão: {dmy(emissao)}", 9.5, False, True)
            p.txt(555, 731, f"Válida até: {dmy(validade)}", 9.5, True, True)
            p.y = 712
        else:
            p.cor(*CINZA); p.txt(40, 805, f"Proposta Comercial nº {numero} - {RAZAO} (continuação)", 8)
            p.cor(*PRETO); p.y = 780
        return p

    def espaco(p, altura):
        return nova() if p.y - altura < 60 else p

    p = nova()
    # cliente
    linhas = [(l, 10.5, True) for l in quebrar(cli.get("nome") or "Cliente", 10.5, 490, True)]
    if cli.get("cnpj"):
        linhas.append((f"CNPJ {cli['cnpj']}", 9, False))
    contato = " - ".join(x for x in (cli.get("contato"), cli.get("email"), cli.get("telefone")) if x)
    linhas += [(l, 9, False) for l in quebrar("A/C " + contato, 9, 490)] if contato else []
    linhas += [(l, 9, False) for l in quebrar("Referência: " + c["referencia"], 9, 490)] if c.get("referencia") else []
    alt = 24 + 13 * len(linhas)
    p.cor(0.94, 0.94, 0.94); p.ret(40, p.y - alt, 515, alt)
    p.cor(*CINZA); p.txt(50, p.y - 13, "CLIENTE", 7.5, True)
    p.cor(*PRETO)
    y = p.y - 27
    for l, tam, neg in linhas:
        p.txt(50, y, l, tam, neg); y -= 13
    p.y -= alt + 22

    def cabecalho(p):
        p.cor(*PRETO)
        for x, s, d in ((40, "Nº", False), (62, "DESCRIÇÃO", False), (400, "QTD.", True), (478, "UNITÁRIO", True), (555, "TOTAL", True)):
            p.txt(x, p.y, s, 8, True, d)
        p.ret(40, p.y - 5, 515, 1.2)
        p.y -= 19

    cabecalho(p)
    for it in c["itens"]:
        desc = quebrar(it["descricao"], 9.5, 265)
        det = quebrar(it["detalhes"], 8, 265) if it.get("detalhes") else []
        alt = 12 * len(desc) + 10 * len(det) + 8
        if p.y - alt < 60:
            p = nova(); cabecalho(p)
        p.cor(*PRETO)
        p.txt(40, p.y, it["n"], 9.5)
        p.txt(400, p.y, f"{it['quantidade']} {it['unidade']}", 9.5, False, True)
        p.txt(478, p.y, brl(it["unitario"]), 9.5, False, True)
        p.txt(555, p.y, brl(it["subtotal"]), 9.5, False, True)
        y = p.y
        for l in desc:
            p.txt(62, y, l, 9.5); y -= 12
        p.cor(*CINZA)
        for l in det:
            p.txt(62, y, l, 8); y -= 10
        p.cor(0.8, 0.8, 0.8); p.ret(40, y + 5, 515, 0.5)
        p.y = y - 8
    p = espaco(p, 40)
    p.cor(*VERM); p.ret(355, p.y - 16, 200, 26)
    p.cor(*BRANCO); p.txt(365, p.y - 7, "VALOR TOTAL", 9, True); p.txt(547, p.y - 8, brl(c["total"]), 13, True, True)
    p.y -= 46
    p = espaco(p, 30)
    p.cor(*PRETO); p.txt(40, p.y, "CONDIÇÕES COMERCIAIS", 9, True); p.ret(40, p.y - 5, 515, 0.5); p.y -= 20
    for rot, val in condicoes(c):
        ls = quebrar(val, 9, 395)
        p = espaco(p, 13 * len(ls))
        p.cor(*PRETO); p.txt(40, p.y, rot + ":", 9, True)
        for l in ls:
            p.txt(150, p.y, l, 9); p.y -= 13
    p = espaco(p, 70)
    p.y -= 22
    p.cor(*PRETO); p.txt(40, p.y, f"Campinas, {dmy(emissao)}.", 9); p.y -= 26
    p.txt(40, p.y, RESP, 10, True); p.y -= 12
    p.txt(40, p.y, f"{RAZAO} - CNPJ {CNPJ}", 8.5); p.y -= 11
    p.txt(40, p.y, f"{FONE} - WhatsApp {WHATS} - {EMAIL}", 8.5)
    for i, pg in enumerate(pags, 1):
        pg.cor(*CINZA); pg.txt(40, 36, f"{RAZAO} - CNPJ {CNPJ} - {SITE}", 7.5)
        pg.txt(555, 36, f"Proposta nº {numero} - página {i} de {len(pags)}", 7.5, False, True)

    # objetos: 1 catalogo, 2 paginas, 3 e 4 fontes, depois (pagina, conteudo) por pagina
    n = len(pags)
    objs = [b"<</Type/Catalog/Pages 2 0 R>>",
            ("<</Type/Pages/Count %d/Kids[%s]>>" % (n, " ".join(f"{5 + 2 * i} 0 R" for i in range(n)))).encode(),
            b"<</Type/Font/Subtype/Type1/BaseFont/Helvetica/Encoding/WinAnsiEncoding>>",
            b"<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold/Encoding/WinAnsiEncoding>>"]
    for i, pg in enumerate(pags):
        dados = zlib.compress("\n".join(pg.ops).encode("latin-1"), 9)
        objs.append(("<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 3 0 R/F2 4 0 R>>>>"
                     "/Contents %d 0 R>>" % (6 + 2 * i)).encode())
        objs.append(b"<</Filter/FlateDecode/Length %d>>stream\n" % len(dados) + dados + b"\nendstream")
    out = bytearray(b"%PDF-1.4\n%chk:0000000000000000\n")
    pos = []
    for i, o in enumerate(objs, 1):
        pos.append(len(out))
        out += b"%d 0 obj\n" % i + o + b"\nendobj\n"
    xref = len(out)
    out += b"xref\n0 %d\n0000000000 65535 f \n" % (len(objs) + 1) + b"".join(b"%010d 00000 n \n" % x for x in pos)
    out += b"trailer\n<</Size %d/Root 1 0 R>>\nstartxref\n%d\n%%%%EOF\n" % (len(objs) + 1, xref)
    return selar(bytes(out))


def selar(pdf):
    zerado = pdf[:14] + b"0" * 16 + pdf[30:]
    return pdf[:14] + hashlib.sha256(zerado).hexdigest()[:16].encode() + pdf[30:]


def integro(pdf):
    return pdf[:14] == b"%PDF-1.4\n%chk:" and pdf.rstrip().endswith(b"%%EOF") and selar(pdf) == pdf


# ----------------------------------------------------------------- e-mail
def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def html_email(c, numero):
    b2, b1 = "border-bottom:2px solid #111111", "border-bottom:1px solid #cccccc"
    cab = "".join('<td%s style="%s"><b>%s</b></td>' % (' align="right"' if d else "", b2, t)
                  for t, d in (("Item", 0), ("Descrição", 0), ("Qtd.", 1), ("Unitário", 1), ("Total", 1)))
    linhas = ""
    for it in c["itens"]:
        det = f'<br><span style="color:#555555;font-size:12px">{esc(it["detalhes"])}</span>' if it.get("detalhes") else ""
        linhas += (f'<tr><td style="{b1}">{it["n"]}</td><td style="{b1}">{esc(it["descricao"])}{det}</td>'
                   f'<td align="right" style="{b1}">{it["quantidade"]} {esc(it["unidade"])}</td>'
                   f'<td align="right" style="{b1}">{brl(it["unitario"])}</td>'
                   f'<td align="right" style="{b1}">{brl(it["subtotal"])}</td></tr>')
    cond = "<br>".join(f"{esc(k)}: {esc(v)}" for k, v in condicoes(c))
    ref = f' ({esc(c["referencia"])})' if c.get("referencia") else ""
    return ('<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111111;line-height:1.5">'
            f'<p>{esc(c.get("saudacao") or "Olá!")}</p>'
            f'<p>Em atenção à sua solicitação de orçamento{ref}, segue nossa <b>Proposta Comercial nº {numero}</b>, '
            'também em anexo (PDF):</p>'
            f'<table cellpadding="7" cellspacing="0" style="border-collapse:collapse;font-size:14px"><tr>{cab}</tr>{linhas}'
            f'<tr><td colspan="4" align="right"><b>Valor total</b></td><td align="right"><b>{brl(c["total"])}</b></td></tr></table>'
            f'<p><b>Condições</b><br>{cond}</p>'
            f'<p><b>Dados do fornecedor</b><br>{RAZAO} - CNPJ {CNPJ}<br>{ENDERECO} - {FONE} - WhatsApp {WHATS}</p>'
            '<p>Permanecemos à disposição para qualquer esclarecimento.</p>'
            f'<p>Atenciosamente,<br><br><b>{RESP}</b><br>Balão da Informática<br>'
            f'<a href="https://{SITE}">{SITE}</a></p></div>')


# ---------------------------------------------------- conferencia do rascunho
def _mimes(txt):
    """O campo raw (base64url da mensagem inteira, ou um pedaco dele) decodificado nas 4 fases possiveis."""
    m = re.search(r'"raw"\s*:\s*"([^"]+)"', txt)
    raw = "".join((m.group(1) if m else txt).split()).replace("-", "+").replace("_", "/").rstrip("=")
    for desloc in range(4):
        t = raw[desloc:]
        try:
            yield base64.b64decode(t[: len(t) - len(t) % 4]).decode("latin-1")
        except Exception:
            pass


def pdfs_no_raw(txt):
    achados = []
    for mime in _mimes(txt):
        for m in re.finditer(r"JVBERi0[A-Za-z0-9+/=\r\n]+", mime):
            try:
                achados.append(base64.b64decode("".join(m.group(0).split())))
            except Exception:
                pass
    return achados


def visivel(marcado):
    return " ".join(html.unescape(re.sub(r"<[^>]+>", " ", marcado)).split())


def corpo_e_destino(txt):
    """(texto visivel do corpo HTML, cabecalho To) do rascunho, ou (None, None) se o raw nao traz o comeco da mensagem."""
    for mime in _mimes(txt):
        m = re.search(r"Content-Type: text/html[^\r\n]*\r\n(?:Content-Transfer-Encoding: ([\w-]+)\r\n)?\r\n(.*?)\r\n--", mime, re.S)
        para = re.search(r"^To: (.*(?:\r\n[ \t].*)*)", mime, re.M)
        if m and para:
            corpo = m.group(2).encode("latin-1")
            cod = (m.group(1) or "").lower()
            corpo = quopri.decodestring(corpo) if cod == "quoted-printable" else base64.b64decode(corpo) if cod == "base64" else corpo
            return visivel(corpo.decode("utf-8", "replace")), para.group(1)
    return None, None


def conferir(c, numero, txt, manual=False):
    """(ok, mensagem) comparando o rascunho do Gmail com o que este script gera para a proposta."""
    pdf, esperado = montar_pdf(c, numero), visivel(html_email(c, numero))
    problemas = []
    if not (integro(pdf) and any(a == pdf for a in pdfs_no_raw(txt))):
        problemas.append("o PDF anexado e diferente do PDF gerado")
    corpo, para = corpo_e_destino(txt)
    if corpo is None:
        if not manual:
            problemas.append("nao achei o texto do e-mail no raw")
    else:
        if corpo != esperado:
            i = next((k for k, (x, y) in enumerate(zip(corpo, esperado)) if x != y), min(len(corpo), len(esperado)))
            problemas.append(f"o texto do e-mail difere do gerado pelo comando html (perto de: ...{corpo[max(0, i - 30):i + 30]}...)")
        email = ((c.get("cliente") or {}).get("email") or "").lower()
        if not email or email not in para.lower():
            problemas.append(f"o destinatario ({para}) nao e o e-mail do cliente no pedido ({email or 'vazio'})")
    if problemas:
        return False, ("RASCUNHO NAO CONFERE: NAO ENVIE. " + "; ".join(problemas) + ". Apague o rascunho (delete_draft) e "
                       "crie de novo, copiando o BASE64 e o HTML com cuidado.")
    return True, (f"RASCUNHO OK proposta {numero} anexo sha256={hashlib.sha256(pdf).hexdigest()[:16]} bytes={len(pdf)}"
                  + ("" if corpo is not None else " (copia manual: so o anexo foi conferido)"))


def _textos(o):
    if isinstance(o, str):
        yield o
    elif isinstance(o, dict):
        for v in o.values():
            yield from _textos(v)
    elif isinstance(o, list):
        for v in o:
            yield from _textos(v)


def arquivos_do_registro():
    bases = [os.environ.get("CLAUDE_CONFIG_DIR"), os.path.expanduser("~/.claude"), "/root/.claude", "/home/claude/.claude"]
    arqs = {a for b in bases if b for a in glob.glob(os.path.join(b, "projects", "*", "*.jsonl"))}
    return sorted(arqs, key=os.path.getmtime, reverse=True)[:6]


def raws_do_registro(ident, espera=14):
    """Resultados de ferramenta, gravados no registro desta sessao, que citam `ident` e trazem o campo raw."""
    limite = time.time() + espera
    while True:
        achados = []
        for arq in arquivos_do_registro():
            for linha in open(arq, encoding="utf-8", errors="replace"):
                if ident in linha and "raw" in linha:
                    try:
                        achados += [t for t in _textos(json.loads(linha))
                                    if ident in t and re.search(r'"raw"\s*:\s*"[\w=-]{200}', t)]
                    except ValueError:
                        pass
        if achados or time.time() > limite:
            return achados
        time.sleep(2)


# ---------------------------------------------------------------- testes
EXEMPLO = {"data": "2026-10-09", "validade_dias": 15, "referencia": "REQ 0000", "saudacao": "Olá Maria, bom dia!",
           "cliente": {"nome": "Cliente de Teste Ltda", "cnpj": "00.000.000/0001-00", "contato": "Maria", "email": "m@x.com"},
           "condicoes": {"pagamento": "Faturado, com prazo de 30 dias.", "frete": "CIF (por nossa conta), já incluso."},
           "itens": [{"descricao": "A", "detalhes": "detalhe (teste)", "quantidade": 10,
                      "fontes": [{"origem": "site", "loja": "balao.info", "preco": 199.9}, {"loja": "X", "preco": 150}]},
                     {"descricao": "B", "quantidade": 3,
                      "fontes": [{"loja": "X", "preco": 100}, {"loja": "Y", "preco": 110}, {"loja": "Z", "preco": 400}]}]}


MARCAS = ("79965b197c3b", "e6381ce16693")


def autoteste():
    assert q(Decimal("590") * (1 + MARGEM)) == Decimal("885.00") and q(Decimal("33.33") * (1 + MARGEM)) == Decimal("50.00")
    c = calcular(EXEMPLO)
    a, b = c["itens"]
    assert (a["custo"], a["unitario"], a["subtotal"]) == ("199.90", "299.85", "2998.50"), a
    assert (b["custo"], b["unitario"], b["subtotal"]) == ("105.00", "157.50", "472.50"), b
    assert c["total"] == "3471.00" and c["custo_total"] == "2314.00" and len(c["avisos"]) == 1
    for ruim in ([{"loja": "X", "preco": 100}], [], [{"loja": "X", "preco": 10}, {"loja": "Y", "preco": 1000}]):
        try:
            calcular({"itens": [{"descricao": "C", "quantidade": 1, "fontes": ruim}]})
            raise SystemExit("autoteste FALHOU: aceitou fontes insuficientes")
        except ValueError:
            pass
    assert brl("1234.5") == "R$ 1.234,50"
    pdf = montar_pdf(c, 123)
    assert integro(pdf) and not integro(pdf.replace(b"595", b"596")) and montar_pdf(c, 123) == pdf
    fluxo = zlib.decompress(pdf.split(b"stream\n")[1].split(b"\nendstream")[0]).decode("latin-1")
    assert "(R$ 3.471,00)" in fluxo and "PROPOSTA COMERCIAL N\xba 123" in fluxo and "24/10/2026" in fluxo
    h = html_email(c, 123)
    assert "R$ 3.471,00" in h and "nº 123" in h and "Olá Maria, bom dia!" in h and "detalhe (teste)" in h
    for m in re.finditer(rb"(\d{10}) 00000 n ", pdf):  # cada entrada do xref aponta para o inicio de um objeto
        assert re.match(rb"\d+ 0 obj\n", pdf[int(m.group(1)):]), "xref do PDF errado"
    marcas = (hashlib.sha256(fluxo.encode("latin-1")).hexdigest()[:12], hashlib.sha256(h.encode()).hexdigest()[:12])
    assert marcas == MARCAS, f"ERRO DE COPIA NO SCRIPT: layout do PDF ou HTML difere do original {marcas}"
    b64 = base64.b64encode(pdf).decode()

    def raw_de(corpo, para="Maria <m@x.com>", anexo=b64):
        mime = ("Date: x\r\nTo: " + para + "\r\nSubject: Re: t\r\nContent-Type: multipart/mixed; boundary=\"B\"\r\n\r\n--B\r\n"
                "Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n"
                + quopri.encodestring(corpo.encode("utf-8")).decode("latin-1").replace("\n", "\r\n") + "\r\n--B\r\n"
                "Content-Type: application/pdf; name=p.pdf\r\nContent-Transfer-Encoding: base64\r\n\r\n"
                + "".join(anexo[i:i + 76] + "\r\n" for i in range(0, len(anexo), 76)) + "--B--\r\n")
        return base64.urlsafe_b64encode(mime.encode("latin-1")).decode()

    bom = raw_de(h.replace('href="https://www.balao.info"', 'href="https://www.google.com/url?q=x&amp;sa=E"'))
    assert conferir(c, 123, bom)[0] and conferir(c, 123, '{"id":"r1","raw":"%s","threadId":"t"}' % bom)[0]
    for ruim in (raw_de(h.replace("R$ 3.471,00", "R$ 3.417,00")), raw_de(h, "outro@y.com"), raw_de(h, anexo=b64[:900] + "AAAA" + b64[904:]),
                 bom[:1200] + ("A" if bom[1200] != "A" else "B") + bom[1201:], bom[:2000]):
        assert not conferir(c, 123, ruim)[0]
    assert not conferir(c, 124, bom)[0] and pdfs_no_raw(bom) == [pdf]
    cauda = bom[bom.find(base64.urlsafe_b64encode(b"JVBERi0xLjQK").decode()[:8]) - 40:]
    assert not conferir(c, 123, cauda)[0] and conferir(c, 123, cauda, manual=True)[0] and not conferir(c, 124, cauda, manual=True)[0]
    print("AUTOTESTE OK")


if __name__ == "__main__":
    cmd, args = (sys.argv[1] if len(sys.argv) > 1 else ""), sys.argv[2:]
    if cmd == "autoteste":
        autoteste()
    elif cmd == "calcular":
        autoteste()
        c = calcular(json.load(open(args[0], encoding="utf-8")))
        saida = re.sub(r"\.json$", "", args[0]) + ".calc.json"
        json.dump(c, open(saida, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        texto, bling, interna = resumo(c)
        print(texto, "ITENS_BLING=" + json.dumps(bling, ensure_ascii=False), "OBS_INTERNA=" + interna, "GRAVADO " + saida, sep="\n")
    elif cmd in ("pdf", "html"):
        c = json.load(open(args[0], encoding="utf-8"))
        if calcular(c)["total"] != c["total"]:
            raise SystemExit("o arquivo .calc.json foi alterado depois do calculo; rode 'calcular' de novo")
        if cmd == "html":
            print(html_email(c, int(args[1])))
        else:
            pdf = montar_pdf(c, int(args[1]))
            open(args[2], "wb").write(pdf)
            print(f"PDF {args[2]} bytes={len(pdf)} SHA256={hashlib.sha256(pdf).hexdigest()}")
            print("BASE64=" + base64.b64encode(pdf).decode())
    elif cmd == "conferir":
        c, numero = json.load(open(args[0], encoding="utf-8")), int(args[1])
        if calcular(c)["total"] != c["total"]:
            raise SystemExit("o arquivo .calc.json foi alterado depois do calculo; rode 'calcular' de novo")
        if args[2] == "--rascunho":
            textos = raws_do_registro(args[3])
            if not textos:
                print("NAO ACHEI o resultado do get_draft(RAW) deste rascunho no registro da sessao. Chame get_draft com "
                      "messageFormat RAW e rode de novo; se continuar, copie o campo raw para raw.txt (do marcador do PDF "
                      "ate o fim) e rode: conferir pedido.calc.json NUMERO raw.txt")
                sys.exit(2)
            res = [conferir(c, numero, t) for t in textos]
        else:
            res = [conferir(c, numero, open(args[2], encoding="utf-8").read(), manual=True)]
        ok, msg = next((r for r in res if r[0]), res[0])
        print(msg)
        sys.exit(0 if ok else 1)
    else:
        raise SystemExit(__doc__)
