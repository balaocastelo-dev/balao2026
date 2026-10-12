"use client";

// Painel → Entregas por motoboy (99Entrega).
// Cota e chama o motoboy para os pedidos do site; acompanha as corridas.
// No modo simulado nada sai para a 99 nem para o cliente (lib/entregas).

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bike, RefreshCw, Send, XCircle, FastForward, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Order } from "@/lib/db";
import type { Entrega, ResultadoDaCotacao } from "@/lib/entregas/tipos";
import { ROTULO_DA_SITUACAO, encerrada } from "@/lib/entregas/regras";

const reais = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const dataCurta = (s: string) =>
  new Date(s).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

const COR: Record<Entrega["situacao"], string> = {
  solicitada: "bg-amber-100 text-amber-800",
  a_caminho_da_loja: "bg-blue-100 text-blue-800",
  coletada: "bg-indigo-100 text-indigo-800",
  entregue: "bg-green-100 text-green-800",
  cancelada: "bg-gray-200 text-gray-700",
  falhou: "bg-red-100 text-red-800",
};

type Cotada = ResultadoDaCotacao & { carregando?: boolean };

export default function EntregasPage() {
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [modo, setModo] = useState<"simulado" | "real">("simulado");
  const [avisoInterno, setAvisoInterno] = useState(false);
  const [cotacoes, setCotacoes] = useState<Record<string, Cotada>>({});
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const [rp, re] = await Promise.all([fetch("/api/orders", { cache: "no-store" }), fetch("/api/entregas/painel", { cache: "no-store" })]);
      const jp = await rp.json().catch(() => []);
      const je = await re.json().catch(() => ({}));
      if (Array.isArray(jp)) setPedidos(jp);
      if (je.ok) {
        setEntregas(je.entregas);
        setModo(je.modo);
        setAvisoInterno(Boolean(je.avisoInterno));
      } else if (je.erro) setErro(je.erro);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Pedidos dos últimos 15 dias que ainda não foram entregues nem cancelados.
  const paraEntregar = useMemo(() => {
    const limite = Date.now() - 15 * 24 * 3600_000;
    return pedidos
      .filter((p) => p.status !== "delivered" && p.status !== "cancelled")
      .filter((p) => new Date(p.created_at).getTime() >= limite)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [pedidos]);

  const corridaAberta = (pedidoId: string) => entregas.find((e) => e.pedidoId === pedidoId && !encerrada(e.situacao));

  async function acao(corpo: Record<string, string>, chave: string) {
    setOcupado(chave);
    setErro("");
    try {
      const r = await fetch("/api/entregas/painel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.erro || "Não deu certo.");
      return j;
    } catch (e) {
      setErro((e as Error).message);
      return null;
    } finally {
      setOcupado(null);
    }
  }

  async function cotar(pedidoId: string) {
    setCotacoes((c) => ({ ...c, [pedidoId]: { disponivel: false, motivo: "", carregando: true } }));
    const j = await acao({ acao: "cotar", pedidoId }, `cotar-${pedidoId}`);
    setCotacoes((c) => ({ ...c, [pedidoId]: j ? (j as ResultadoDaCotacao) : { disponivel: false, motivo: "Falhou a cotação." } }));
  }

  async function chamar(pedidoId: string) {
    const aviso = modo === "simulado" ? "Modo SIMULADO: nenhuma corrida será pedida à 99. Continuar?" : "Chamar um motoboy da 99 agora? A corrida será cobrada.";
    if (!confirm(aviso)) return;
    if (await acao({ acao: "chamar", pedidoId }, `chamar-${pedidoId}`)) carregar();
  }

  async function cancelar(id: string) {
    if (!confirm("Cancelar esta corrida?")) return;
    if (await acao({ acao: "cancelar", id }, `cancelar-${id}`)) carregar();
  }

  async function avancar(id: string) {
    if (await acao({ acao: "avancar", id }, `avancar-${id}`)) carregar();
  }

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Bike className="text-[#E60012]" />
          Entregas por motoboy (99)
        </h2>
        <button onClick={carregar} className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
          <RefreshCw size={16} className={carregando ? "animate-spin" : ""} /> Atualizar
        </button>
      </div>

      {modo === "simulado" ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 flex gap-3">
          <AlertTriangle className="shrink-0 mt-0.5" size={18} />
          <div>
            <b>Modo simulado.</b> A 99 ainda não mandou o token da API. Os preços aqui são estimativas da loja e as corridas são de
            teste: nada é pedido à 99 e nenhum cliente recebe mensagem. A opção de motoboy fica escondida no carrinho.
            {!avisoInterno && " Para receber os avisos das corridas no WhatsApp, cadastre ENTREGA_AVISO_INTERNO na Vercel."}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-900 flex gap-3">
          <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
          <div>
            <b>Ligado na 99.</b> Cada corrida chamada aqui é real e cobrada na conta 99 Empresas.
          </div>
        </div>
      )}

      <p className="text-sm text-gray-600">
        A 99 só leva itens de até R$ 500 que caibam no baú da moto (35 × 40 × 30 cm, até 10 kg). Pedidos acima disso aparecem como
        “não pode ir de motoboy”.
      </p>

      {erro && <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm p-3">{erro}</div>}

      <section>
        <h3 className="font-semibold text-gray-800 mb-3">Pedidos para entregar</h3>
        {carregando && !pedidos.length ? (
          <p className="text-sm text-gray-500">Carregando…</p>
        ) : !paraEntregar.length ? (
          <p className="text-sm text-gray-500">Nenhum pedido em aberto nos últimos 15 dias.</p>
        ) : (
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl bg-white">
            {paraEntregar.map((p) => {
              const aberta = corridaAberta(p.id);
              const cot = cotacoes[p.id];
              return (
                <div key={p.id} className="p-4 flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      #{p.id.slice(0, 8)} · {p.customer_name} · {reais(Number(p.total))}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {dataCurta(p.created_at)} · {p.address?.street}, {p.address?.number} — {p.address?.city} · CEP {p.address?.cep}
                    </div>
                    {cot && !cot.carregando && (
                      <div className={`text-xs mt-1 ${cot.disponivel ? "text-green-700" : "text-red-700"}`}>
                        {cot.disponivel
                          ? `${reais(cot.cotacao.preco)} · ~${cot.cotacao.minutos} min · ${cot.cotacao.distanciaKm} km${cot.cotacao.distanciaEstimada ? " (distância estimada)" : ""}${cot.cotacao.modo === "simulado" ? " · simulado" : ""}`
                          : cot.motivo}
                      </div>
                    )}
                  </div>
                  {aberta ? (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full self-start md:self-center ${COR[aberta.situacao]}`}>
                      {ROTULO_DA_SITUACAO[aberta.situacao]}
                    </span>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => cotar(p.id)}
                        disabled={ocupado !== null}
                        className="text-sm px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                      >
                        {cot?.carregando ? "Cotando…" : "Cotar"}
                      </button>
                      <button
                        onClick={() => chamar(p.id)}
                        disabled={ocupado !== null || (cot !== undefined && !cot.carregando && !cot.disponivel)}
                        className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-[#E60012] text-white hover:bg-[#c50010] disabled:opacity-50"
                      >
                        <Send size={14} /> Chamar motoboy
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-3">Corridas</h3>
        {!entregas.length ? (
          <p className="text-sm text-gray-500">Nenhuma corrida ainda.</p>
        ) : (
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl bg-white">
            {entregas.map((e) => (
              <div key={e.id} className="p-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${COR[e.situacao]}`}>{ROTULO_DA_SITUACAO[e.situacao]}</span>
                    {e.modo === "simulado" && <span className="text-[10px] uppercase tracking-wide text-amber-700 font-bold">simulado</span>}
                    <span className="font-medium text-gray-900">
                      #{e.pedidoId.slice(0, 8)} · {e.cliente.nome}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {dataCurta(e.criadaEm)} · {reais(e.preco)} · {e.destino.rua}, {e.destino.numero}
                    {e.codigoDeVerificacao ? ` · código ${e.codigoDeVerificacao}` : ""}
                    {e.entregador?.nome ? ` · ${e.entregador.nome}${e.entregador.placa ? ` (${e.entregador.placa})` : ""}` : ""}
                  </div>
                  {e.linkDeAcompanhamento && (
                    <a href={e.linkDeAcompanhamento} target="_blank" rel="noreferrer" className="text-xs text-blue-700 underline">
                      Acompanhar na 99
                    </a>
                  )}
                </div>
                {!encerrada(e.situacao) && (
                  <div className="flex gap-2">
                    {e.modo === "simulado" && (
                      <button
                        onClick={() => avancar(e.id)}
                        disabled={ocupado !== null}
                        className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <FastForward size={14} /> Avançar
                      </button>
                    )}
                    <button
                      onClick={() => cancelar(e.id)}
                      disabled={ocupado !== null}
                      className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      <XCircle size={14} /> Cancelar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
