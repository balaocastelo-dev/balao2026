"use client";

import { useCallback, useEffect, useState } from "react";

// ============================================================
// Painel da CLAUD.IA (cobradora & reativação) dentro do /crm.
//
// Ela trabalha no NÚMERO DA LOJA (clientes conhecidos), diferente da VITOR.IA.
// Este painel mostra o estado do worker, liga/desliga, teto diário e as
// duas mensagens (cobrança e reativação), além dos números vindos do site
// via /api/carla/stats (fechada pela senha do painel).
// ============================================================

interface CarlaEstado {
  ativo: boolean;
  maxDia: number;
  mensagemCobranca: string;
  mensagemReativacao: string;
  enviadosHoje: number;
  ultimaAcao: { tipo: string; whatsapp: string; em: number } | null;
  tokenConfigurado: boolean;
  horarioComercial: boolean;
}

interface CarlaStats {
  contatos: number;
  enviadasCobranca: number;
  enviadasReativacao: number;
  responderam: number;
  optouts: number;
  pendenciasRestantes: number;
}

const SERVIDOR =
  process.env.NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL || "http://localhost:4100";

function horaDe(ts: number | null | undefined) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function CrmCarlaPanel() {
  const [carla, setCarla] = useState<CarlaEstado | null>(null);
  const [stats, setStats] = useState<CarlaStats | null>(null);
  const [form, setForm] = useState({ maxDia: "10", mensagemCobranca: "", mensagemReativacao: "" });
  const [avisos, setAvisos] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const r = await fetch(`${SERVIDOR}/api/crm/carla/estado`, { cache: "no-store" });
      const d = await r.json();
      if (d?.ok) {
        setCarla(d as CarlaEstado);
        setForm((f) => ({
          maxDia: String(d.maxDia ?? f.maxDia),
          mensagemCobranca: d.mensagemCobranca ?? f.mensagemCobranca,
          mensagemReativacao: d.mensagemReativacao ?? f.mensagemReativacao,
        }));
      }
    } catch {
      // mantém o último estado
    }
    try {
      const r = await fetch("/api/carla/stats", { cache: "no-store" });
      const d = await r.json();
      if (d?.ok) setStats(d.stats);
    } catch {
      // sem stats por enquanto
    }
  }, []);

  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 15_000);
    return () => clearInterval(t);
  }, [carregar]);

  const configurar = async (ativo?: boolean) => {
    setCarregando(true);
    setAvisos(null);
    try {
      const body: Record<string, unknown> = {};
      if (typeof ativo === "boolean") body.ativo = ativo;
      const maxDia = Number(form.maxDia);
      if (Number.isFinite(maxDia) && maxDia >= 1) body.maxDia = maxDia;
      if (form.mensagemCobranca.trim()) body.mensagemCobranca = form.mensagemCobranca.trim();
      if (form.mensagemReativacao.trim()) body.mensagemReativacao = form.mensagemReativacao.trim();

      const r = await fetch(`${SERVIDOR}/api/crm/carla/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (d?.ok) {
        setCarla(d as CarlaEstado);
        setAvisos({ tipo: "ok", texto: "CLAUD.IA atualizada." });
      } else {
        setAvisos({ tipo: "erro", texto: d?.erro || "Não consegui atualizar." });
      }
    } catch {
      setAvisos({ tipo: "erro", texto: "Sem conexão com o servidor de atendimento." });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${
              carla?.ativo ? "bg-violet-500/15" : "bg-white/5"
            }`}
          >
            📞
          </span>
          <div>
            <h2 className="text-sm font-bold text-white">CLAUD.IA · Cobradora & Reativação</h2>
            <p className="text-xs text-slate-400">
              {carla?.ativo
                ? `trabalhando no número da loja · ${carla.enviadosHoje}/${carla.maxDia} hoje`
                : "desligada — cobrança de pendências e reativação de clientes antigos"}
            </p>
          </div>
        </div>
        <button
          onClick={() => configurar(!carla?.ativo)}
          disabled={carregando}
          className={`rounded-lg px-4 py-2 text-sm font-bold transition disabled:opacity-40 ${
            carla?.ativo
              ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
              : "bg-violet-500 text-white hover:bg-violet-400"
          }`}
        >
          {carla?.ativo ? "Desligar CLAUD.IA" : "Ligar CLAUD.IA"}
        </button>
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

      <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-5">
        <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5">
          <div className="text-lg font-bold tabular-nums text-red-300">{stats?.pendenciasRestantes ?? "—"}</div>
          <div className="text-[11px] text-slate-400">pedidos pendentes</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5">
          <div className="text-lg font-bold tabular-nums text-violet-300">{stats?.enviadasCobranca ?? 0}</div>
          <div className="text-[11px] text-slate-400">cobranças enviadas</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5">
          <div className="text-lg font-bold tabular-nums text-sky-300">{stats?.enviadasReativacao ?? 0}</div>
          <div className="text-[11px] text-slate-400">reativações enviadas</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5">
          <div className="text-lg font-bold tabular-nums text-emerald-300">{stats?.responderam ?? 0}</div>
          <div className="text-[11px] text-slate-400">responderam</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5">
          <div className="text-lg font-bold tabular-nums text-amber-300">
            {carla?.enviadosHoje ?? 0}
          </div>
          <div className="text-[11px] text-slate-400">enviados hoje</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-400">
            Teto diário (anti-ban — cobrança é cliente seu, pode subir com calma)
          </span>
          <input
            type="number"
            min={1}
            max={500}
            value={form.maxDia}
            onChange={(e) => setForm({ ...form, maxDia: e.target.value })}
            className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none focus:border-violet-500/60"
          />
        </label>
        <div className="flex items-end">
          <button
            onClick={() => configurar()}
            disabled={carregando}
            className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:opacity-50"
          >
            Salvar configuração
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-400">
            Mensagem de cobrança — use {"{nome}"} e {"{valor}"}
          </span>
          <textarea
            rows={5}
            value={form.mensagemCobranca}
            onChange={(e) => setForm({ ...form, mensagemCobranca: e.target.value })}
            className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 font-mono text-xs text-white outline-none focus:border-violet-500/60"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-400">
            Mensagem de reativação — use {"{nome}"}
          </span>
          <textarea
            rows={5}
            value={form.mensagemReativacao}
            onChange={(e) => setForm({ ...form, mensagemReativacao: e.target.value })}
            className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 font-mono text-xs text-white outline-none focus:border-violet-500/60"
          />
        </label>
      </div>

      {carla?.ultimaAcao && (
        <p className="mt-3 text-[11px] text-slate-500">
          Última ação: {carla.ultimaAcao.tipo} · {carla.ultimaAcao.whatsapp} · às{" "}
          {horaDe(carla.ultimaAcao.em)}
        </p>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        Cobrança primeiro (dinheiro parado é prioridade), depois reativação dos contatos da VITOR.IA que não
        responderam em 3+ dias. Ela nunca escreve para quem tem conversa recente com a loja e respeita
        "sair" na hora.
      </p>
    </section>
  );
}
