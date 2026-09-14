"use client";

import { useCallback, useEffect, useState } from "react";

// ============================================================
// Aba do Beto no /crm — número PRÓPRIO do prospector.
//
// O Beto roda num container separado na VPS, exposto em
// /beto/* do mesmo domínio. Esta aba mostra o QR Code dele (uma
// leitura só, como o número da loja), o estado do worker e os
// controles: ligar/desligar, teto diário e mensagem de primeiro contato.
// ============================================================

interface BetoEstado {
  ativo: boolean;
  maxDia: number;
  mensagem: string;
  enviadosHoje: number;
  stats: {
    total: number;
    novo: number;
    fila: number;
    contatado: number;
    respondeu: number;
    convertido: number;
    descartado: number;
    optout: number;
    hoje: number;
    semNome: number;
  } | null;
  ultimaAcao: { tipo: string; whatsapp: string; em: number } | null;
  tokenConfigurado: boolean;
  horarioComercial: boolean;
}

interface StatusWhats {
  estado: string;
  connected: boolean;
  phoneNumber: string | null;
  conversas?: { total: number; mensagens: number };
}

interface Conversa {
  chatId: string;
  nome: string;
  numero: string | null;
  ultimaMensagem: string;
  direcao: "in" | "out" | null;
  quando: number | null;
}

const BETO_SERVER =
  process.env.NEXT_PUBLIC_BETO_PANEL_SERVER_URL ||
  "https://srv1963897.hstgr.cloud/beto";

function quando(ts: number | null | undefined) {
  if (!ts) return "—";
  const d = new Date(ts);
  const hoje = new Date();
  const mesmaData = d.toDateString() === hoje.toDateString();
  return mesmaData
    ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default function CrmBetoAdmin({
  onVoltar,
  sairLabel,
}: {
  onVoltar: () => void;
  sairLabel: string;
}) {
  const [status, setStatus] = useState<StatusWhats | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [beto, setBeto] = useState<BetoEstado | null>(null);
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [form, setForm] = useState({ maxDia: "20", mensagem: "" });
  const [avisos, setAvisos] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const [rStatus, rQr, rBeto] = await Promise.all([
        fetch(`${BETO_SERVER}/api/status`, { cache: "no-store" }).then((r) => r.json()),
        fetch(`${BETO_SERVER}/api/qr`, { cache: "no-store" }).then((r) => r.json()),
        fetch(`${BETO_SERVER}/api/crm/beto/estado`, { cache: "no-store" }).then((r) => r.json()),
      ]);
      setStatus(rStatus);
      setQr(rQr?.qrCode || rQr?.qr || null);
      if (rBeto?.ok) {
        setBeto(rBeto as BetoEstado);
        setForm((f) => ({
          maxDia: String(rBeto.maxDia ?? f.maxDia),
          mensagem: rBeto.mensagem ?? f.mensagem,
        }));
      }
    } catch {
      // servidor fora do ar: mantém o último estado
    }

    try {
      const r = await fetch("/api/crm-beto/conversas", { cache: "no-store" });
      const d = await r.json();
      if (d?.ok) setConversas(d.conversas || []);
    } catch {
      // conversas ficam vazias se o proxy não responder
    }
  }, []);

  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 10_000);
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
      if (form.mensagem.trim()) body.mensagem = form.mensagem.trim();

      const r = await fetch(`${BETO_SERVER}/api/crm/beto/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (d?.ok) {
        setBeto(d as BetoEstado);
        setAvisos({ tipo: "ok", texto: "Beto atualizado." });
      } else {
        setAvisos({ tipo: "erro", texto: d?.erro || "Não consegui atualizar." });
      }
    } catch {
      setAvisos({ tipo: "erro", texto: "Sem conexão com o servidor do Beto." });
    } finally {
      setCarregando(false);
    }
  };

  const conectado = Boolean(status?.connected);
  const s = beto?.stats;

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-2.5 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
            Balão · Beto — prospector digital
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onVoltar}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
            >
              {sairLabel}
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid max-w-[1500px] gap-4 px-4 py-6 lg:grid-cols-5 lg:px-8">
          {/* ---------- QR / conexão ---------- */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">
            <h2 className="mb-1 text-sm font-bold text-white">Conexão do WhatsApp</h2>
            <p className="mb-4 text-xs text-slate-400">
              Número PRÓPRIO do Beto — a loja usa outro. Leia este QR uma vez com o
              aparelho que vai receber as conversas de prospecção.
            </p>

            {conectado ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                <div className="text-lg font-bold text-emerald-300">
                  Conectado como {status?.phoneNumber || "—"}
                </div>
                <div className="mt-1 text-xs text-emerald-200/70">
                  {status?.conversas?.total ?? 0} conversas ·{" "}
                  {status?.conversas?.mensagens ?? 0} mensagens
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
                <p className="mb-3 text-xs text-amber-200">
                  Estado: <b>{status?.estado || "conectando…"}</b> — escaneie para começar
                </p>
                {qr ? (
                  // O qrCode já vem em data URL do servidor.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qr}
                    alt="QR Code do número do Beto"
                    className="mx-auto w-56 rounded-lg border border-white/10 bg-white p-2"
                  />
                ) : (
                  <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-lg border border-dashed border-white/20 text-xs text-slate-500">
                    {status?.estado === "loading"
                      ? "abrindo o WhatsApp…"
                      : "QR não disponível agora"}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ---------- controles ---------- */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-3">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white">Disparos do Beto</h2>
                <p className="text-xs text-slate-400">
                  {beto?.tokenConfigurado === false
                    ? "faltando BETO_TOKEN — os disparos não saem"
                    : beto?.horarioComercial === false
                      ? "fora do horário comercial (9h–18h)"
                      : beto?.ativo
                        ? `ligado · ${beto.enviadosHoje}/${beto.maxDia} enviados hoje`
                        : "desligado"}
                </p>
              </div>
              <button
                onClick={() => configurar(!beto?.ativo)}
                disabled={carregando || !conectado}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition disabled:opacity-40 ${
                  beto?.ativo
                    ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                    : "bg-emerald-500 text-white hover:bg-emerald-400"
                }`}
              >
                {beto?.ativo ? "Desligar Beto" : "Ligar Beto"}
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

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-400">
                  Teto diário (anti-ban — comece baixo: 20)
                </span>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={form.maxDia}
                  onChange={(e) => setForm({ ...form, maxDia: e.target.value })}
                  className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/60"
                />
              </label>
              <div className="flex items-end">
                <button
                  onClick={() => configurar()}
                  disabled={carregando}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50"
                >
                  Salvar configuração
                </button>
              </div>
            </div>

            <label className="mt-3 flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-400">
                Mensagem de primeiro contato — use {"{nome}"} para o nome da pessoa
              </span>
              <textarea
                rows={5}
                value={form.mensagem}
                onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 font-mono text-xs text-white outline-none focus:border-amber-500/60"
              />
            </label>

            <div className="mt-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5">
                <div className="text-lg font-bold tabular-nums text-slate-200">{s?.novo ?? "—"}</div>
                <div className="text-[11px] text-slate-400">na fila</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5">
                <div className="text-lg font-bold tabular-nums text-emerald-300">{s?.contatado ?? "—"}</div>
                <div className="text-[11px] text-slate-400">contatados</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5">
                <div className="text-lg font-bold tabular-nums text-sky-300">{s?.respondeu ?? "—"}</div>
                <div className="text-[11px] text-slate-400">responderam</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5">
                <div className="text-lg font-bold tabular-nums text-amber-300">
                  {beto?.enviadosHoje ?? "—"}
                </div>
                <div className="text-[11px] text-slate-400">enviados hoje</div>
              </div>
            </div>

            {beto?.ultimaAcao && (
              <p className="mt-3 text-[11px] text-slate-500">
                Última ação: {beto.ultimaAcao.tipo} · {beto.ultimaAcao.whatsapp} · às{" "}
                {quando(beto.ultimaAcao.em)}
              </p>
            )}
          </section>

          {/* ---------- conversas do número do Beto ---------- */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-5">
            <h2 className="mb-3 text-sm font-bold text-white">
              Conversas do número do Beto ({conversas.length})
            </h2>
            {conversas.length === 0 ? (
              <p className="text-xs text-slate-500">
                Nenhuma conversa ainda. Quando ele começar a disparar, quem responder aparece aqui.
              </p>
            ) : (
              <ul className="space-y-2">
                {conversas.map((c) => (
                  <li
                    key={c.chatId}
                    className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white">
                        {c.nome || c.numero || "—"}
                        {c.direcao === "in" && (
                          <span className="ml-2 rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                            respondeu
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-slate-400">{c.ultimaMensagem}</p>
                    </div>
                    <span className="shrink-0 text-[11px] text-slate-500">{quando(c.quando)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
