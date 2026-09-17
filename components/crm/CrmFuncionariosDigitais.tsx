"use client";

import { useCallback, useEffect, useState } from "react";
import CrmJuliaPanel from "./CrmJuliaPanel";
import CrmCarlaPanel from "./CrmCarlaPanel";
import CrmLiviaPanel from "./CrmLiviaPanel";

// ============================================================
// Aba "Funcionários digitais" do /crm.
//
// Antes a JUL.IA e a CLAUD.IA ficavam empilhadas ACIMA das abas, sempre abertas:
// quem entrava no painel para ver o número do dia passava por dois blocos de
// robô antes de chegar aos números, e a VITOR.IA só existia numa tela cheia
// separada, atrás de um botão na barra de cima. Três funcionários digitais em
// três lugares diferentes.
//
// Agora é um lugar só. Cada um aparece no mesmo formato de cartão, e a tela
// cheia da VITOR.IA continua existindo — mas como destino do cartão dela, que é
// onde o QR Code precisa de espaço.
// ============================================================

interface Props {
  /** Abre a tela cheia da VITOR.IA (QR Code do número próprio dela). */
  onAbrirBeto: () => void;
}

export default function CrmFuncionariosDigitais({ onAbrirBeto }: Props) {
  return (
    <div className="space-y-6">
      <CartaoBling />
      <CrmJuliaPanel />
      <CrmCarlaPanel />
      <CartaoBeto onAbrir={onAbrirBeto} />
      <CartaoRafa />
      <CrmLiviaPanel />
    </div>
  );
}

/* ---------------------------------------------------------------- *
 * VITOR.IA — resumo + porta para a tela cheia
 * ---------------------------------------------------------------- */

function CartaoBeto({ onAbrir }: { onAbrir: () => void }) {
  const [estado, setEstado] = useState<{
    ativo?: boolean;
    enviadosHoje?: number;
    maxDia?: number;
  } | null>(null);

  const servidor = (process.env.NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL || "").replace(/\/$/, "");

  const carregar = useCallback(async () => {
    if (!servidor) return;
    try {
      const r = await fetch(`${servidor}/api/crm/beto/estado`, { cache: "no-store" });
      if (r.ok) setEstado(await r.json());
    } catch {
      // Servidor de WhatsApp fora do ar não pode derrubar o painel inteiro.
    }
  }, [servidor]);

  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 30_000);
    return () => clearInterval(t);
  }, [carregar]);

  const ligado = Boolean(estado?.ativo);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${
              ligado ? "bg-amber-500/15" : "bg-white/5"
            }`}
          >
            🎯
          </span>
          <div>
            <h3 className="font-semibold text-white">VITOR.IA</h3>
            <p className="text-xs text-slate-400">
              Prospectora · número próprio
              {estado
                ? ligado
                  ? ` · ${estado.enviadosHoje ?? 0}/${estado.maxDia ?? 0} hoje`
                  : " · desligado"
                : " · sem contato com o servidor"}
            </p>
          </div>
        </div>
        <button
          onClick={onAbrir}
          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20"
        >
          Abrir QR Code e controles
        </button>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- *
 * Bling — o ERP de onde vêm os números de verdade
 * ---------------------------------------------------------------- */

interface EstadoBling {
  configurado: boolean;
  conectado: boolean;
  pendencias: string[];
  expiraEm: string | null;
  conectadoEm?: string | null;
  ultimoErro: string | null;
}

function CartaoBling() {
  const [estado, setEstado] = useState<EstadoBling | null>(null);

  const carregar = useCallback(async () => {
    try {
      const r = await fetch("/api/bling/status", { cache: "no-store" });
      if (r.ok) setEstado(await r.json());
    } catch {
      // idem: painel não cai por causa do ERP.
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const conectado = Boolean(estado?.conectado);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${
              conectado ? "bg-emerald-500/15" : "bg-white/5"
            }`}
          >
            🔗
          </span>
          <div>
            <h3 className="font-semibold text-white">Bling</h3>
            <p className="text-xs text-slate-400">
              {conectado
                ? "Conectado · pedidos, clientes e contas a receber"
                : "Não conectado · a CLAUD.IA e a MAR.IA dependem daqui"}
            </p>
          </div>
        </div>

        {estado?.configurado && !conectado && (
          // Link normal, não fetch: o Bling responde com um redirecionamento
          // para a tela de autorização dele, que precisa acontecer no
          // navegador, com o Thiago logado.
          <a
            href="/api/bling/conectar"
            className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-400"
          >
            Conectar ao Bling
          </a>
        )}
      </div>

      {estado && !estado.configurado && estado.pendencias.length > 0 && (
        <ul className="mt-3 space-y-1 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-200">
          {estado.pendencias.map((p) => (
            <li key={p}>• {p}</li>
          ))}
        </ul>
      )}

      {estado?.ultimoErro && (
        <p className="mt-3 rounded-xl bg-red-500/10 p-3 text-xs text-red-200">
          Último erro: {estado.ultimoErro}
        </p>
      )}
    </section>
  );
}


/* ---------------------------------------------------------------- *
 * MAR.IA — 7h o setor, 19h o fechamento
 * ---------------------------------------------------------------- */

interface EstadoRafa {
  ativo?: boolean;
  horaManha?: number;
  horaNoite?: number;
  agoraNaLoja?: string;
  destinoConfigurado?: boolean;
  tokenConfigurado?: boolean;
  ultimoEnvio?: { manha?: string; noite?: string };
  ultimoErro?: string | null;
}

function CartaoRafa() {
  const [rafa, setRafa] = useState<EstadoRafa | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const servidor = (process.env.NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL || "").replace(/\/$/, "");

  const carregar = useCallback(async () => {
    if (!servidor) return;
    try {
      const r = await fetch(`${servidor}/api/crm/rafa/estado`, { cache: "no-store" });
      if (r.ok) setRafa(await r.json());
    } catch {
      // servidor fora do ar não derruba o painel
    }
  }, [servidor]);

  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 30_000);
    return () => clearInterval(t);
  }, [carregar]);

  const acionar = async (caminho: string, corpo: Record<string, unknown>) => {
    if (!servidor) return;
    setOcupado(true);
    setAviso(null);
    try {
      const r = await fetch(`${servidor}${caminho}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });
      const dados = await r.json();
      setRafa(dados);
      if (dados?.erro) setAviso(String(dados.erro));
      else if (caminho.endsWith("enviar")) setAviso("Relatório enviado.");
    } catch (erro) {
      setAviso((erro as Error).message);
    } finally {
      setOcupado(false);
    }
  };

  const ligado = Boolean(rafa?.ativo);
  const faltaConfig = rafa && (!rafa.destinoConfigurado || !rafa.tokenConfigurado);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${
              ligado ? "bg-sky-500/15" : "bg-white/5"
            }`}
          >
            📊
          </span>
          <div>
            <h3 className="font-semibold text-white">MAR.IA</h3>
            <p className="text-xs text-slate-400">
              Analista · {rafa?.horaManha ?? 7}h o setor, {rafa?.horaNoite ?? 19}h o fechamento
              {rafa?.agoraNaLoja ? ` · na loja agora: ${rafa.agoraNaLoja}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={ocupado || !servidor}
            onClick={() => acionar("/api/crm/rafa/config", { ativo: !ligado })}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50 ${
              ligado
                ? "border border-white/10 text-slate-300 hover:bg-white/5"
                : "bg-sky-500 text-white hover:bg-sky-400"
            }`}
          >
            {ligado ? "Desligar" : "Ligar"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <button
          disabled={ocupado || !servidor}
          onClick={() => acionar("/api/crm/rafa/enviar", { tipo: "manha" })}
          className="rounded-lg border border-white/10 px-3 py-1.5 font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
        >
          Mandar o das 7h agora
        </button>
        <button
          disabled={ocupado || !servidor}
          onClick={() => acionar("/api/crm/rafa/enviar", { tipo: "fechamento" })}
          className="rounded-lg border border-white/10 px-3 py-1.5 font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
        >
          Mandar o fechamento agora
        </button>
      </div>

      {faltaConfig && (
        <ul className="mt-3 space-y-1 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-200">
          {!rafa?.destinoConfigurado && <li>• RAFA_WHATSAPP não configurado (para qual número vai)</li>}
          {!rafa?.tokenConfigurado && <li>• BETO_TOKEN não configurado (a MAR.IA usa o mesmo)</li>}
        </ul>
      )}

      {rafa?.ultimoEnvio && (rafa.ultimoEnvio.manha || rafa.ultimoEnvio.noite) && (
        <p className="mt-3 text-xs text-slate-500">
          Último envio · manhã: {rafa.ultimoEnvio.manha || "—"} · noite: {rafa.ultimoEnvio.noite || "—"}
        </p>
      )}

      {(aviso || rafa?.ultimoErro) && (
        <p className="mt-3 rounded-xl bg-white/5 p-3 text-xs text-slate-300">
          {aviso || rafa?.ultimoErro}
        </p>
      )}
    </section>
  );
}
