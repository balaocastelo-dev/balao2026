"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Check, RefreshCw } from "lucide-react";
import type { DashboardMetrics } from "@/lib/dashboard-metrics";

// A faixa do topo do Início: o dia até agora e se as duas coisas que derrubam
// a loja quando param — o banco de dados e o WhatsApp — estão de pé.
//
// Vermelho só aparece aqui quando há algo para resolver. Enquanto está tudo
// certo, a faixa fica calada.

type Banco = {
  configurado: boolean;
  conecta: boolean;
  emPausa: boolean;
  produtos: number | null;
  espelhoProdutos: number;
};

type WhatsApp = {
  ok?: boolean;
  connected?: boolean;
  phoneNumber?: string | null;
  mensagem?: string;
};

type Leitura<T> = { estado: "carregando" } | { estado: "ok"; dado: T } | { estado: "falhou" };

function reais(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Meia-noite de hoje até agora, no relógio de quem está olhando. */
function hojeAteAgora() {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  const fim = new Date();
  fim.setHours(23, 59, 59, 999);
  return { inicio: inicio.toISOString(), fim: fim.toISOString() };
}

function Numero({
  rotulo,
  valor,
  detalhe,
  href,
}: {
  rotulo: string;
  valor: string;
  detalhe?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="block rounded-lg px-4 py-3 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#E60012]"
    >
      <dt className="text-sm text-slate-600">{rotulo}</dt>
      <dd className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{valor}</dd>
      {detalhe ? <dd className="mt-0.5 text-xs text-slate-500">{detalhe}</dd> : null}
    </Link>
  );
}

function Situacao({
  nome,
  certo,
  texto,
  href,
  acao,
}: {
  nome: string;
  /** null enquanto ainda não se sabe. */
  certo: boolean | null;
  texto: string;
  href?: string;
  acao?: string;
}) {
  return (
    <li className="flex flex-wrap items-start gap-x-3 gap-y-2 px-4 py-3">
      <span
        aria-hidden
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          certo === false
            ? "bg-[#E60012] text-white"
            : certo === true
              ? "bg-slate-900 text-white"
              : "bg-slate-200 text-slate-500"
        }`}
      >
        {certo === false ? <AlertTriangle size={12} /> : certo === true ? <Check size={12} /> : null}
      </span>
      <div className="min-w-[12rem] flex-1">
        <p className="text-sm font-semibold text-slate-900">{nome}</p>
        <p className={`text-sm ${certo === false ? "text-[#b8000e]" : "text-slate-600"}`}>{texto}</p>
      </div>
      {href && acao ? (
        <Link
          href={href}
          prefetch={false}
          className="ml-8 shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#E60012] sm:ml-0"
        >
          {acao}
        </Link>
      ) : null}
    </li>
  );
}

export default function AgoraNaLoja() {
  const [numeros, setNumeros] = useState<Leitura<DashboardMetrics>>({ estado: "carregando" });
  const [banco, setBanco] = useState<Leitura<Banco>>({ estado: "carregando" });
  const [whats, setWhats] = useState<Leitura<WhatsApp>>({ estado: "carregando" });
  const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null);
  // Começa "atualizando": a primeira leitura sai sozinha, ao abrir.
  const [atualizando, setAtualizando] = useState(true);

  const carregar = useCallback(async () => {
    const { inicio, fim } = hojeAteAgora();

    const lerJson = async <T,>(url: string): Promise<T> => {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      return (await r.json()) as T;
    };

    await Promise.all([
      lerJson<DashboardMetrics>(
        `/api/painel/metrics?startDate=${encodeURIComponent(inicio)}&endDate=${encodeURIComponent(fim)}`
      )
        .then((dado) => setNumeros({ estado: "ok", dado }))
        .catch(() => setNumeros({ estado: "falhou" })),
      lerJson<{ banco: Banco }>("/api/health")
        .then((j) => setBanco({ estado: "ok", dado: j.banco }))
        .catch(() => setBanco({ estado: "falhou" })),
      lerJson<WhatsApp>("/api/crm/status")
        .then((dado) => setWhats({ estado: "ok", dado }))
        .catch(() => setWhats({ estado: "falhou" })),
    ]);

    setAtualizadoEm(new Date());
    setAtualizando(false);
  }, []);

  useEffect(() => {
    // A primeira leitura sai logo depois de a tela montar.
    const primeira = window.setTimeout(() => void carregar(), 0);
    // De cinco em cinco minutos, e só com a aba à vista. O banco da loja tem
    // cota de conexões por hora: um Início esquecido aberto num monitor não
    // pode gastar a cota que o site precisa para vender. Para ver na hora,
    // existe o botão Atualizar.
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible") void carregar();
    }, 5 * 60_000);
    return () => {
      window.clearTimeout(primeira);
      window.clearInterval(t);
    };
  }, [carregar]);

  const m = numeros.estado === "ok" ? numeros.dado : null;
  const traco = numeros.estado === "carregando" ? "…" : "—";

  // --- Banco de dados ---
  let bancoCerto: boolean | null = null;
  let bancoTexto = "Conferindo…";
  if (banco.estado === "falhou") {
    bancoCerto = false;
    bancoTexto = "Não consegui conferir o banco agora.";
  } else if (banco.estado === "ok") {
    const b = banco.dado;
    const total = (b.produtos ?? 0).toLocaleString("pt-BR");
    const copia =
      b.espelhoProdutos > 0
        ? ` O site segue mostrando o catálogo pela cópia de segurança (${b.espelhoProdutos.toLocaleString("pt-BR")} produtos), mas cadastros e pedidos novos podem falhar.`
        : " E não há cópia de segurança do catálogo disponível.";
    if (b.conecta) {
      bancoCerto = true;
      bancoTexto = `Funcionando, com ${total} produtos no catálogo.`;
    } else if (!b.configurado) {
      bancoCerto = false;
      bancoTexto = `Não está configurado nesta hospedagem.${copia}`;
    } else if (b.emPausa) {
      bancoCerto = false;
      bancoTexto = `Em pausa: passou do limite de conexões por hora da hospedagem e volta sozinho.${copia}`;
    } else {
      bancoCerto = false;
      bancoTexto = `Sem conexão agora.${copia}`;
    }
  }

  // --- WhatsApp ---
  let whatsCerto: boolean | null = null;
  let whatsTexto = "Conferindo…";
  if (whats.estado === "falhou") {
    whatsCerto = false;
    whatsTexto = "Não consegui conferir o WhatsApp agora.";
  } else if (whats.estado === "ok") {
    const w = whats.dado;
    if (w.connected) {
      whatsCerto = true;
      whatsTexto = w.phoneNumber ? `Conectado no número ${w.phoneNumber}.` : "Conectado.";
    } else if (w.ok === false) {
      whatsCerto = false;
      whatsTexto = "O servidor do WhatsApp não respondeu.";
    } else {
      whatsCerto = false;
      whatsTexto = "Desconectado. É preciso ler o QR Code com o celular da loja.";
    }
  }

  return (
    <section aria-labelledby="agora-na-loja" className="rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <h2 id="agora-na-loja" className="text-base font-bold text-slate-900">
          Hoje na loja
        </h2>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {atualizadoEm ? (
            <span>
              Atualizado às{" "}
              {atualizadoEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setAtualizando(true);
              void carregar();
            }}
            disabled={atualizando}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#E60012] disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw size={13} className={atualizando ? "animate-spin" : ""} />
            Atualizar
          </button>
        </div>
      </div>

      {numeros.estado === "falhou" ? (
        <p className="px-4 py-4 text-sm text-[#b8000e]">
          Não consegui carregar os números de hoje. Se o banco estiver em pausa, eles voltam
          sozinhos quando ele voltar.
        </p>
      ) : (
        <dl className="grid grid-cols-2 gap-1 p-1 lg:grid-cols-4">
          <Numero
            rotulo="Faturamento"
            valor={m ? reais(m.totalRevenue) : traco}
            detalhe={m ? `Ticket médio de ${reais(m.ticketAverage)}` : undefined}
            href="/painel/indicadores"
          />
          <Numero
            rotulo="Pedidos"
            valor={m ? m.totalOrders.toLocaleString("pt-BR") : traco}
            detalhe={m ? `${m.serviceOrders.total} ordens de serviço` : undefined}
            href="/painel/pedidos"
          />
          <Numero
            rotulo="Visitantes no site"
            valor={m ? m.totalVisits.toLocaleString("pt-BR") : traco}
            href="/painel/indicadores"
          />
          <Numero
            rotulo="Contatos pelo site"
            valor={m?.leadKpis ? m.leadKpis.total.toLocaleString("pt-BR") : traco}
            detalhe={
              m?.leadKpis
                ? `${m.leadKpis.whatsappClicks} pelo WhatsApp, ${m.leadKpis.phoneClicks} por telefone`
                : undefined
            }
            href="/painel/indicadores"
          />
        </dl>
      )}

      <ul className="divide-y divide-slate-200 border-t border-slate-200">
        <Situacao
          nome="WhatsApp da loja"
          certo={whatsCerto}
          texto={whatsTexto}
          href="/painel/crm"
          acao={whatsCerto === false ? "Abrir o atendimento" : undefined}
        />
        <Situacao nome="Banco de dados" certo={bancoCerto} texto={bancoTexto} />
      </ul>
    </section>
  );
}
