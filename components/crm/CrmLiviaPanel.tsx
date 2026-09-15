"use client";

import { useCallback, useEffect, useState } from "react";

// ============================================================
// LIV.IA — cartão da caixa de entrada da loja no /crm.
//
// Ela nasce em modo RASCUNHO: o texto vai para os rascunhos do Gmail e um
// humano solta. Por isso este cartão não tem botão de "enviar" — o rascunho
// se revisa no próprio Gmail, que é onde dá para corrigir uma frase no
// celular. Aqui se vê o que ela fez, quantos rascunhos esperam, e se a
// prospecção pode continuar.
// ============================================================

interface EstadoDoWorker {
  ativo?: boolean;
  caixa?: string | null;
  pendencias?: string[];
  ultimaRodada?: string | null;
  ultimoErro?: string | null;
  vistos?: number;
  rascunhos?: number;
  arquivados?: number;
}

interface EstadoDoSite {
  modo?: "rascunho" | "automatico";
  podeProspectar?: boolean;
  motivo?: string;
  prospeccao?: {
    teto: number;
    enviadosHoje: number;
    restam: number;
    enviados7d: number;
    taxaDeRejeicao: number;
    alarme: boolean;
    motivoDoAlarme: string | null;
  };
}

interface Recente {
  remetente: string;
  assunto: string | null;
  classificacao: string | null;
  acao: string | null;
  leadPara: string | null;
  quando: string;
}

interface Semana {
  total: number;
  porClassificacao: Record<string, number>;
  rascunhosEsperando: number;
  respondidos: number;
}

const ROTULO: Record<string, string> = {
  orcamento: "orçamento",
  suporte: "suporte",
  fornecedor: "fornecedor",
  financeiro: "financeiro",
  rejeicao: "e-mail devolvido",
  descadastro: "descadastro",
  informativo: "automático",
  outro: "a triar",
};

function quandoLegivel(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function CrmLiviaPanel() {
  const [worker, setWorker] = useState<EstadoDoWorker | null>(null);
  const [site, setSite] = useState<EstadoDoSite | null>(null);
  const [recentes, setRecentes] = useState<Recente[]>([]);
  const [semana, setSemana] = useState<Semana | null>(null);
  const [mexendo, setMexendo] = useState(false);

  const servidor = (process.env.NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL || "").replace(/\/$/, "");

  const carregar = useCallback(async () => {
    // Cada fonte cai sozinha: a VPS fora do ar não pode esconder os números
    // que o site já sabe, e vice-versa.
    if (servidor) {
      try {
        const r = await fetch(`${servidor}/api/crm/livia/estado`, { cache: "no-store" });
        if (r.ok) setWorker(await r.json());
      } catch { setWorker(null); }
    }
    try {
      const r = await fetch("/api/livia/estado", { cache: "no-store" });
      if (r.ok) setSite(await r.json());
    } catch { /* painel não cai por causa disto */ }
    try {
      const r = await fetch("/api/livia/recentes", { cache: "no-store" });
      if (r.ok) {
        const d = await r.json();
        setRecentes(d.recentes || []);
        setSemana(d.semana || null);
      }
    } catch { /* idem */ }
  }, [servidor]);

  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 60_000);
    return () => clearInterval(t);
  }, [carregar]);

  async function alternar() {
    if (!servidor) return;
    setMexendo(true);
    try {
      const r = await fetch(`${servidor}/api/crm/livia/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !worker?.ativo }),
      });
      if (r.ok) setWorker(await r.json());
    } catch { /* o estado seguinte vem no próximo carregar */ }
    setMexendo(false);
  }

  async function rodarAgora() {
    if (!servidor) return;
    setMexendo(true);
    try {
      await fetch(`${servidor}/api/crm/livia/rodar`, { method: "POST" });
      await carregar();
    } catch { /* idem */ }
    setMexendo(false);
  }

  const ligada = Boolean(worker?.ativo);
  const faltando = worker?.pendencias || [];
  const semServidor = !worker;
  const p = site?.prospeccao;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${
              ligada ? "bg-sky-500/15" : "bg-white/5"
            }`}
          >
            ✉️
          </span>
          <div>
            <h3 className="font-semibold text-white">LIV.IA</h3>
            <p className="text-xs text-slate-400">
              Caixa de entrada da loja
              {worker?.caixa ? ` · ${worker.caixa}` : ""}
              {semServidor
                ? " · sem contato com o servidor"
                : ligada
                  ? ` · ${site?.modo === "automatico" ? "respondendo sozinha" : "modo rascunho"}`
                  : " · desligada"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {ligada && (
            <button
              onClick={rodarAgora}
              disabled={mexendo}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
            >
              Ler agora
            </button>
          )}
          <button
            onClick={alternar}
            disabled={mexendo || semServidor || (!ligada && faltando.length > 0)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:opacity-40 ${
              ligada
                ? "border border-white/15 text-slate-300 hover:bg-white/5"
                : "border border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"
            }`}
          >
            {ligada ? "Desligar LIV.IA" : "Ligar LIV.IA"}
          </button>
        </div>
      </div>

      {faltando.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200">
          <p className="font-semibold">Falta configurar na VPS para ela poder ligar:</p>
          <ul className="mt-1 space-y-0.5">
            {faltando.map((f) => <li key={f}>• {f}</li>)}
          </ul>
          <p className="mt-2 text-amber-200/70">
            LIVIA_SENHA_APP é a senha de app do Google (16 caracteres), não a senha normal da conta.
          </p>
        </div>
      )}

      {worker?.ultimoErro && (
        <p className="mt-3 text-xs text-rose-300">Último erro: {worker.ultimoErro}</p>
      )}

      {/* ---- o que ela fez ---- */}
      {semana && semana.total > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Numero rotulo="E-mails (7 dias)" valor={String(semana.total)} />
          <Numero
            rotulo="Rascunhos esperando"
            valor={String(semana.rascunhosEsperando)}
            destaque={semana.rascunhosEsperando > 0}
          />
          <Numero rotulo="Respondidos" valor={String(semana.respondidos)} />
          <Numero rotulo="Última leitura" valor={quandoLegivel(worker?.ultimaRodada)} />
        </div>
      )}

      {semana && semana.rascunhosEsperando > 0 && (
        <p className="mt-3 rounded-lg border border-sky-500/20 bg-sky-500/5 px-3 py-2 text-xs text-sky-200">
          {semana.rascunhosEsperando} resposta(s) esperando você na pasta de rascunhos do Gmail.
        </p>
      )}

      {/* ---- rampa de aquecimento ---- */}
      {p && (
        <div className="mt-4 rounded-xl border border-white/10 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Prospecção por e-mail</span>
            <span className={p.alarme ? "text-rose-300" : "text-slate-400"}>
              {p.enviadosHoje}/{p.teto} hoje
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full ${p.alarme ? "bg-rose-500" : "bg-sky-500"}`}
              style={{ width: `${p.teto ? Math.min(100, (p.enviadosHoje / p.teto) * 100) : 0}%` }}
            />
          </div>
          <p className={`mt-2 text-xs ${p.alarme ? "text-rose-300" : "text-slate-400"}`}>
            {p.alarme
              ? `Parada: ${p.motivoDoAlarme}. Envio frio com rejeição alta derruba a reputação da caixa da loja inteira.`
              : site?.motivo || "sem envios ainda"}
          </p>
        </div>
      )}

      {/* ---- últimos e-mails ---- */}
      {recentes.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold text-slate-300">Últimos e-mails</p>
          <ul className="space-y-1.5">
            {recentes.slice(0, 8).map((e, i) => (
              <li key={i} className="flex items-baseline gap-2 text-xs">
                <span className="shrink-0 text-slate-500">{quandoLegivel(e.quando)}</span>
                <span className="min-w-0 flex-1 truncate text-slate-300">
                  {e.assunto || "(sem assunto)"}
                  <span className="text-slate-500"> — {e.remetente}</span>
                </span>
                <span className="shrink-0 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400">
                  {ROTULO[e.classificacao || "outro"] || e.classificacao}
                </span>
                {e.leadPara === "julia" && (
                  <span className="shrink-0 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-300">
                    → JUL.IA
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Numero({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 p-3">
      <p className="text-[11px] text-slate-400">{rotulo}</p>
      <p className={`mt-0.5 text-lg font-semibold ${destaque ? "text-sky-300" : "text-white"}`}>
        {valor}
      </p>
    </div>
  );
}
