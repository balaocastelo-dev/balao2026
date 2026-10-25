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


def resumo(r, titulo, icone="💰"):
    validas = [v for v in r.get("vendas", []) if not v.get("cancelada")]
    t = r.get("totais") or {}
    total = float(t.get("valor", sum(float(v.get("total") or 0) for v in validas)))
    n = int(t.get("quantidade", len(validas)))
    tick = total / n if n else 0
    linhas = [f"{icone} <b>{titulo}</b>", f"💵 <b>{reais(total)}</b>", f"🧾 {n} pedidos · 🎫 ticket {reais(tick)}"]
    if t.get("canceladas"):
        linhas.append(f"❌ {t['canceladas']} cancelada(s), fora da conta")
    if validas:
        top = max(validas, key=lambda v: float(v.get("total") or 0))
        linhas.append(f"🥇 Maior: {str(top.get('cliente') or '?')[:28]} — {reais(top.get('total'))}")
    por = t.get("porVendedor") or []
    if por:
        linhas.append("👥 " + " · ".join(f"{p['nome'].split()[0] if p.get('nome') else '?'} {reais(p['valor'])}" for p in por[:6]))
    return "\n".join(linhas)


def enviar(partes, rotulo):
    partes.append("<i>🤖 Relatório automático — dados do MEU BLING</i>")
    ok = telegram("\n\n".join(partes))
    print(f"{rotulo} ENVIADO:", ok)


def main():
    modo = sys.argv[1] if len(sys.argv) > 1 else "hoje"
    hoje = datetime.date.today()
    h = hoje.strftime("%Y-%m-%d")
    try:
        if modo == "teste":
            enviar(["🤖 <b>TESTE da sentinela de vendas (MEU BLING)</b>", resumo(vendas(h, h), f"Vendas de hoje ({hoje:%d/%m})")], "TESTE")
        elif modo == "previa":
            enviar([resumo(vendas(h, h), f"📊 PRÉVIA do faturamento — {hoje:%d/%m/%Y} (13h)", "📊")], "PRÉVIA")
        elif modo == "semana":
            ini = hoje - datetime.timedelta(days=(hoje.weekday() + 1) % 7)  # domingo da semana
            enviar([resumo(vendas(ini.strftime("%Y-%m-%d"), h), f"📅 Relatório Semanal ({ini:%d/%m}–{hoje:%d/%m})", "📅")], "SEMANAL")
        elif modo == "mes":
            if (hoje + datetime.timedelta(days=1)).month == hoje.month:
                print("Não é último dia do mês. Saindo.")
                return
            ini = hoje.replace(day=1)
            enviar([resumo(vendas(ini.strftime("%Y-%m-%d"), h), f"🗓️ Relatório Mensal — {hoje:%m/%Y}", "🗓️")], "MENSAL")
        else:
            enviar([resumo(vendas(h, h), f"Vendas de hoje — {hoje:%d/%m/%Y}")], "DIÁRIO")
    except Exception as e:
        try:
            telegram(f"⚠️ <b>Sentinela de vendas ({modo}) com erro</b>\n<code>{str(e)[:200]}</code>")
        except Exception:
            pass
        print("ERRO:", e)
        sys.exit(1)


if __name__ == "__main__":
    main()
