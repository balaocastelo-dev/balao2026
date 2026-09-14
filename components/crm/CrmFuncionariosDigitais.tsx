"use client";

import { useCallback, useEffect, useState } from "react";
import CrmJuliaPanel from "./CrmJuliaPanel";
import CrmCarlaPanel from "./CrmCarlaPanel";

// ============================================================
// Aba "Funcionários digitais" do /crm.
//
// Antes a Júlia e a Carla ficavam empilhadas ACIMA das abas, sempre abertas:
// quem entrava no painel para ver o número do dia passava por dois blocos de
// robô antes de chegar aos números, e o Beto só existia numa tela cheia
// separada, atrás de um botão na barra de cima. Três funcionários digitais em
// três lugares diferentes.
//
// Agora é um lugar só. Cada um aparece no mesmo formato de cartão, e a tela
// cheia do Beto continua existindo — mas como destino do cartão dele, que é
// onde o QR Code precisa de espaço.
// ============================================================

interface Props {
  /** Abre a tela cheia do Beto (QR Code do número próprio dele). */
  onAbrirBeto: () => void;
}

export default function CrmFuncionariosDigitais({ onAbrirBeto }: Props) {
  return (
    <div className="space-y-6">
      <CartaoBling />
      <CrmJuliaPanel />
      <CrmCarlaPanel />
      <CartaoBeto onAbrir={onAbrirBeto} />
    </div>
  );
}

/* ---------------------------------------------------------------- *
 * Beto — resumo + porta para a tela cheia
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
            <h3 className="font-semibold text-white">Beto</h3>
            <p className="text-xs text-slate-400">
              Prospector · número próprio
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
                : "Não conectado · a Carla e o Rafa dependem daqui"}
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
