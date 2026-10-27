# -*- coding: utf-8 -*-
# ============================================================
#  SENTINELA DE VENDAS — Balão da Informática
#  Lê as vendas do MEU BLING (www.balao.info/sistema) e manda o relatório no Telegram.
#
#  Desde 25/10/2026 o Bling saiu de vez (pedido do Thiago): este script NÃO fala mais
#  com o Bling. Ele pergunta ao site (www.balao.info/api/pc/sistema/vendas) com a chave
#  do PC da loja (o mesmo arquivo do pareamento da Arena: %USERPROFILE%\.balao-arena\chave.txt),
#  e o site pergunta ao MEU BLING. Nenhuma chave nova no PC.
#
#  Uso:  python sentinela-vendas-telegram.py [hoje|previa|semana|mes|teste]
#  Agendado (Agendador de Tarefas do Windows, nomes antigos mantidos):
#    BionicSentinelaVendas         todo dia às 19h        (hoje)
#    BionicSentinelaVendasPrevia   todo dia às 13h        (previa)
#    BionicSentinelaVendasSemanal  sábado às 14h          (semana)
#    BionicSentinelaVendasMensal   todo dia às 19h05; só manda no último dia do mês (mes)
#  Fonte deste arquivo: repositório balao2026, scripts/sentinela-vendas/.
#  Instalado em: C:\Users\user\Documents\07-Scripts\sentinela-vendas-telegram.py
# ============================================================
import datetime
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

SITE = os.environ.get("BALAO_SITE", "https://www.balao.info").rstrip("/")
ARQ_CHAVE = os.path.join(os.path.expanduser("~"), ".balao-arena", "chave.txt")
ENV_BOT = r"C:\Users\user\Documents\opencode-telegram\bot.env"


def ler_env(path, chave):
    for linha in open(path, encoding="utf-8"):
        if linha.strip().startswith(chave + "="):
            return linha.split("=", 1)[1].strip()
    return None


def reais(v):
    return f"R$ {float(v or 0):,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def telegram(msg):
    token = ler_env(ENV_BOT, "TELEGRAM_BOT_TOKEN")
    chat = (ler_env(ENV_BOT, "ALLOWED_CHAT_IDS") or "").split(",")[0]
    data = urllib.parse.urlencode({"chat_id": chat, "text": msg, "parse_mode": "HTML"}).encode()
    req = urllib.request.Request(f"https://api.telegram.org/bot{token}/sendMessage", data=data)
    return json.loads(urllib.request.urlopen(req, timeout=20).read()).get("ok", False)


def chave_do_pc():
    if not os.path.exists(ARQ_CHAVE):
        raise RuntimeError(
            "Falta a chave do PC da loja (%USERPROFILE%\\.balao-arena\\chave.txt). "
            "Gere em www.balao.info/painel/arena → Ligação com o PC e rode o pareamento."
        )
    return open(ARQ_CHAVE, encoding="utf-8").read().strip()


def vendas(de, ate, abrir=None):
    """Vendas (pedidos) do MEU BLING entre duas datas, com os totais calculados pelo site."""
    abrir = abrir or urllib.request.urlopen
    url = f"{SITE}/api/pc/sistema/vendas?de={de}&ate={ate}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {chave_do_pc()}", "Accept": "application/json",
                                               "User-Agent": "balao-sentinela-vendas/2.0"})
    try:
        return json.loads(abrir(req, timeout=60).read())
    except urllib.error.HTTPError as e:
        try:
            erro = json.loads(e.read().decode("utf-8", "ignore")).get("erro")
        except Exception:
            erro = None
        raise RuntimeError(erro or f"o site respondeu {e.code}") from None


LINHA = "━━━━━━━━━━━━━━━━━━"
DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]
MEDALHAS = ["🥇", "🥈", "🥉"]
MAX_PEDIDOS_LISTADOS = 15


def esc(t):
    """Texto vindo do sistema (nome de cliente/vendedor) seguro para o HTML do Telegram."""
    return str(t or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def corta(t, n):
    t = " ".join(str(t or "").split())
    return t if len(t) <= n else t[: n - 1].rstrip() + "…"


def plural(n, um, varios):
    return f"{n} {um if n == 1 else varios}"


def nome_vendedor(v):
    vend = v.get("vendedor") or {}
    return " ".join(str(vend.get("nome") or "").split()) or "Sem vendedor"


def resumo(r, titulo, subtitulo="", icone="📊", um_dia=True):
    """Mensagem em seções: resumo, por vendedor, maior venda e pedidos (ou maiores vendas no período)."""
    validas = [v for v in r.get("vendas", []) if not v.get("cancelada")]
    t = r.get("totais") or {}
    total = float(t.get("valor", sum(float(v.get("total") or 0) for v in validas)))
    n = int(t.get("quantidade", len(validas)))
    tick = total / n if n else 0
    canceladas = int(t.get("canceladas") or 0)

    b = [f"{icone} <b>{esc(titulo)}</b>"]
    if subtitulo:
        b.append(subtitulo)
    b += [LINHA, "", "💰 <b>RESUMO</b>",
          f"💵 Faturamento: <b>{reais(total)}</b>",
          f"🧾 Pedidos: <b>{n}</b>",
          f"🎫 Ticket médio: <b>{reais(tick)}</b>"]
    if canceladas:
        b.append(f"❌ {plural(canceladas, 'cancelada', 'canceladas')} (fora da conta)")

    if not validas:
        b += ["", "😴 Nenhuma venda registrada no período."]
        return "\n".join(b)

    por = t.get("porVendedor") or []
    if por:
        b += ["", LINHA, "", "👥 <b>POR VENDEDOR</b>"]
        for i, p in enumerate(por[:10]):
            valor = float(p.get("valor") or 0)
            pct = round(valor * 100 / total) if total else 0
            qtd = int(p.get("quantidade") or 0)
            icon = MEDALHAS[i] if i < len(MEDALHAS) else "🔹"
            b.append(f"{icon} <b>{esc(corta(p.get('nome') or 'Sem vendedor', 26))}</b>")
            b.append(f"      {reais(valor)} · {plural(qtd, 'pedido', 'pedidos')} · {pct}%")

    top = max(validas, key=lambda v: float(v.get("total") or 0))
    b += ["", LINHA, "", "🏆 <b>MAIOR VENDA</b>",
          f"👤 {esc(corta(top.get('cliente') or 'Cliente não informado', 60))}",
          f"💵 <b>{reais(top.get('total'))}</b>"]
    detalhe = []
    if top.get("numero"):
        detalhe.append(f"🔢 Pedido nº {esc(top['numero'])}")
    detalhe.append(f"🧑‍💼 {esc(corta(nome_vendedor(top), 26))}")
    b.append(" · ".join(detalhe))

    ordenadas = sorted(validas, key=lambda v: float(v.get("total") or 0), reverse=True)
    if um_dia:
        lista, cab = ordenadas[:MAX_PEDIDOS_LISTADOS], "🛒 <b>PEDIDOS</b>"
    else:
        lista, cab = ordenadas[:5], "🔝 <b>5 MAIORES VENDAS</b>"
    b += ["", LINHA, "", cab]
    for v in lista:
        num = f"nº {esc(v['numero'])} · " if v.get("numero") else ""
        b.append(f"▪️ {num}<b>{reais(v.get('total'))}</b>")
        b.append(f"      👤 {esc(corta(v.get('cliente') or 'Cliente não informado', 34))}"
                 f" · 🧑‍💼 {esc(nome_vendedor(v).split()[0])}")
    if um_dia and len(ordenadas) > len(lista):
        b.append(f"➕ e mais {plural(len(ordenadas) - len(lista), 'pedido', 'pedidos')}")
    return "\n".join(b)


def enviar(partes, rotulo):
    partes.append(f"{LINHA}\n🤖 <i>Relatório automático · dados do MEU BLING</i>")
    ok = telegram("\n\n".join(partes))
    print(f"{rotulo} ENVIADO:", ok)


def data_br(d):
    return f"{DIAS_SEMANA[d.weekday()]}, {d:%d/%m/%Y}"


def main():
    modo = sys.argv[1] if len(sys.argv) > 1 else "hoje"
    hoje = datetime.date.today()
    h = hoje.strftime("%Y-%m-%d")
    try:
        agora = datetime.datetime.now().strftime("%H:%M")
        if modo == "teste":
            enviar(["🧪 <b>TESTE da sentinela de vendas</b>",
                    resumo(vendas(h, h), "VENDAS DE HOJE", f"📅 {data_br(hoje)} · ⏰ até {agora}", "💰")], "TESTE")
        elif modo == "previa":
            enviar([resumo(vendas(h, h), "PRÉVIA DO FATURAMENTO",
                           f"📅 {data_br(hoje)} · ⏰ parcial até {agora}", "📊")], "PRÉVIA")
        elif modo == "semana":
            ini = hoje - datetime.timedelta(days=(hoje.weekday() + 1) % 7)  # domingo da semana
            enviar([resumo(vendas(ini.strftime("%Y-%m-%d"), h), "RELATÓRIO SEMANAL",
                           f"📅 {ini:%d/%m} a {hoje:%d/%m/%Y}", "📅", um_dia=False)], "SEMANAL")
        elif modo == "mes":
            if (hoje + datetime.timedelta(days=1)).month == hoje.month:
                print("Não é último dia do mês. Saindo.")
                return
            ini = hoje.replace(day=1)
            enviar([resumo(vendas(ini.strftime("%Y-%m-%d"), h), "RELATÓRIO MENSAL",
                           f"📅 {ini:%d/%m} a {hoje:%d/%m/%Y}", "🗓️", um_dia=False)], "MENSAL")
        else:
            enviar([resumo(vendas(h, h), "FECHAMENTO DO DIA", f"📅 {data_br(hoje)} · ⏰ até {agora}", "💰")], "DIÁRIO")
    except Exception as e:
        try:
            telegram(f"⚠️ <b>Sentinela de vendas ({modo}) com erro</b>\n<code>{str(e)[:200]}</code>")
        except Exception:
            pass
        print("ERRO:", e)
        sys.exit(1)


if __name__ == "__main__":
    main()
