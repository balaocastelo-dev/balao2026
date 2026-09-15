"use client";

import { useCallback, useEffect, useState } from "react";

// ============================================================
// Painel da JUL.IA (atendente digital) dentro do /crm.
//
// Fala com o servidor de WhatsApp pelos mesmos endereços REST do resto do
// painel: /api/crm/ia/*. O cérebro dela (Ollama local) é chamado pelo
// servidor via JULIA_IA_URL — este painel só mostra o estado e dá os botões.
// ============================================================

interface IAEstado {
  vendedorId: string;
  modo: "off" | "copilot" | "autopilot";
  autolead: boolean;
  configurada: boolean;
  url: string;
  sugestoes: { chatId: string; texto: string; hora: number }[];
  stats: { respostas: number; sugestoes: number; falhas: number };
  ultimaAcao: { tipo: string; nome: string; hora: number } | null;
  processando: number;
}

const SERVIDOR =
  process.env.NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL || "http://localhost:4100";

const MODOS = [
  { id: "off", rotulo: "Desligada", cor: "bg-white/10 text-slate-300" },
  { id: "copilot", rotulo: "Copiloto", cor: "bg-sky-500/20 text-sky-200" },
  { id: "autopilot", rotulo: "Autopiloto", cor: "bg-emerald-500/20 text-emerald-200" },
] as const;

function horaDe(ts: number | null | undefined) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function CrmJuliaPanel() {
  const [ia, setIa] = useState<IAEstado | null>(null);
  const [avisos, setAvisos] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const r = await fetch(`${SERVIDOR}/api/crm/ia/estado`, { cache: "no-store" });
      const d = await r.json();
      setIa(d?.ia || null);
    } catch {
      // Servidor de atendimento fora do ar: mantém o último estado na tela.
    }
  }, []);

  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 15_000);
    return () => clearInterval(t);
  }, [carregar]);

  const configurar = async (modo: "off" | "copilot" | "autopilot" | null, autolead?: boolean) => {
    setCarregando(true);
    setAvisos(null);
    try {
      const r = await fetch(`${SERVIDOR}/api/crm/ia/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo, autolead }),
      });
      const d = await r.json();
      if (d?.ok) {
        setIa(d.ia);
        setAvisos({ tipo: "ok", texto: "Configuração da JUL.IA atualizada." });
      } else {
        setAvisos({ tipo: "erro", texto: d?.erro || "Não consegui atualizar." });
      }
    } catch {
      setAvisos({ tipo: "erro", texto: "Sem conexão com o servidor de atendimento." });
    } finally {
      setCarregando(false);
      carregar();
    }
  };

  const agir = async (acao: "enviar" | "descartar", chatId: string) => {
    setAvisos(null);
    try {
      const r = await fetch(`${SERVIDOR}/api/crm/ia/${acao}-sugestao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      });
      const d = await r.json();
      setAvisos({ tipo: d?.ok ? "ok" : "erro", texto: d?.mensagem || d?.erro || "Feito." });
    } catch {
      setAvisos({ tipo: "erro", texto: "Sem conexão com o servidor de atendimento." });
    } finally {
      carregar();
    }
  };

  const ativa = ia?.modo !== "off";

  return (
    <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${
              ativa ? "bg-emerald-500/15" : "bg-white/5"
            }`}
          >
            🤖
          </span>
          <div>
            <h2 className="text-sm font-bold text-white">JUL.IA · Atendente Digital</h2>
            <p className="text-xs text-slate-400">
              {ia?.configurada === false
                ? "cérebro offline — falta JULIA_IA_URL na VPS"
                : ativa
                  ? `trabalhando em modo ${ia?.modo}${ia?.processando ? ` · ${ia.processando} chat(s) agora` : ""}`
                  : "desligada — ligue para ela começar a atender"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-slate-950/60 p-1">
          {MODOS.map((m) => (
            <button
              key={m.id}
              disabled={carregando}
              onClick={() => configurar(m.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-40 ${
                ia?.modo === m.id ? m.cor : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {m.rotulo}
            </button>
          ))}
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={Boolean(ia?.autolead)}
            disabled={carregando}
            onChange={(e) => configurar(null, e.target.checked)}
            className="h-4 w-4 accent-emerald-500"
          />
          Pegar leads novos sozinha
        </label>
      </div>

      {avisos && (
        <div
          className={`mb-3 rounded-lg border px-3 py-2 text-xs ${
            avisos.tipo === "ok"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/30 bg-red-500/10 text-red-200"
          }`}
        >
          {avisos.texto}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5">
          <div className="text-lg font-bold tabular-nums text-emerald-300">{ia?.stats.respostas ?? 0}</div>
          <div className="text-[11px] text-slate-400">respostas enviadas</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5">
          <div className="text-lg font-bold tabular-nums text-sky-300">{ia?.stats.sugestoes ?? 0}</div>
          <div className="text-[11px] text-slate-400">sugestões dadas</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5">
          <div className="text-lg font-bold tabular-nums text-amber-300">{ia?.stats.falhas ?? 0}</div>
          <div className="text-[11px] text-slate-400">falhas</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5">
          <div className="truncate text-sm font-semibold text-slate-200">
            {ia?.ultimaAcao ? `${ia.ultimaAcao.tipo} · ${ia.ultimaAcao.nome}` : "—"}
          </div>
          <div className="text-[11px] text-slate-400">última ação às {horaDe(ia?.ultimaAcao?.hora)}</div>
        </div>
      </div>

      {ia?.modo === "copilot" && (
        <div className="mt-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Aguardando sua aprovação ({ia.sugestoes.length})
          </h3>
          {ia.sugestoes.length === 0 ? (
            <p className="text-xs text-slate-500">
              Nenhuma sugestão pendente. Quando um cliente atribuído à JUL.IA falar, a resposta dela aparece aqui.
            </p>
          ) : (
            <ul className="space-y-2">
              {ia.sugestoes.map((s) => (
                <li
                  key={s.chatId}
                  className="flex flex-col gap-2 rounded-xl border border-sky-500/20 bg-sky-500/[0.04] p-3 sm:flex-row sm:items-start"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 text-[11px] font-semibold text-sky-300">
                      às {horaDe(s.hora)}
                    </div>
                    <p className="whitespace-pre-line text-xs text-slate-200">{s.texto}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => agir("enviar", s.chatId)}
                      className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-400"
                    >
                      Enviar
                    </button>
                    <button
                      onClick={() => agir("descartar", s.chatId)}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/5"
                    >
                      Descartar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        Copiloto: ela sugere e um humano envia · Autopiloto: ela responde sozinha os clientes atribuídos a ela
        (e leads novos, com a opção marcada). Ela nunca fala por cima de um vendedor e nunca repete a mesma
        resposta.
      </p>
    </section>
  );
}
