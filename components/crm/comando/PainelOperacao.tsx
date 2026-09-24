"use client";

import { useCallback, useEffect, useState } from "react";
import type { PonteComando, ResumoOperacao, ContatoResumo } from "./tipos";
import {
  BarrasPorDia,
  BarrasPorHora,
  Indicador,
  ListaComBarra,
  Secao,
  Vazio,
  formatarDuracao,
  COR_SAIDA,
  COR_ALERTA,
} from "./graficos";

const PERIODOS = [
  { dias: 1, rotulo: "Hoje" },
  { dias: 7, rotulo: "7 dias" },
  { dias: 30, rotulo: "30 dias" },
  { dias: 90, rotulo: "90 dias" },
];

const NOMES_DE_ETAPA: Record<string, string> = {
  novos: "Novos Leads",
  atendimento: "Em Atendimento",
  orcamento: "Orçamento Enviado",
  negociacao: "Em Negociação",
  pagamento: "Aguardando Pix / Pgto",
  ganho: "Venda Fechada / Ganho",
  consignados: "Consignados",
  posvenda: "Pós-Venda & Garantia",
  perdido: "Perdido / Sem Retorno",
};

export default function PainelOperacao({
  ponte,
  aoEscolherSegmento,
}: {
  ponte: PonteComando;
  aoEscolherSegmento?: (chave: string) => void;
}) {
  const [dias, setDias] = useState(7);
  const [resumo, setResumo] = useState<ResumoOperacao | null>(null);
  const [fila, setFila] = useState<ContatoResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const [r, f] = await Promise.all([
        ponte.chamar<ResumoOperacao & { ok: boolean }>(`/api/comando/resumo?dias=${dias}`),
        ponte.chamar<{ itens: ContatoResumo[] }>(`/api/comando/fila?limite=12`),
      ]);
      setResumo(r);
      setFila(f.itens || []);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não consegui carregar os números.");
    } finally {
      setCarregando(false);
    }
  }, [ponte, dias]);

  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 60_000);
    return () => clearInterval(t);
  }, [carregar]);

  if (erro) {
    return (
      <div className="rounded-xl border border-[#c2571a]/40 bg-[#fdf1e8] p-4 text-sm text-[#a8471a]">
        <p className="font-semibold">{erro}</p>
        <p className="mt-1 text-xs">
          O painel da operação lê o banco do servidor. Se ele acabou de subir, os números aparecem em
          alguns segundos.
        </p>
        <button
          type="button"
          onClick={carregar}
          className="mt-3 cursor-pointer rounded-lg bg-[#0f9d58] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0a6e3d]"
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  if (!resumo && carregando) return <Carregando />;
  if (!resumo) return null;

  const pr = resumo.primeiraResposta;
  const taxaResposta = pr.rodadas ? Math.round((pr.respondidas / pr.rodadas) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-lg border border-[#e3e3e3] bg-white p-0.5">
          {PERIODOS.map((p) => (
            <button
              key={p.dias}
              type="button"
              onClick={() => setDias(p.dias)}
              className={`cursor-pointer rounded-md px-3 py-1 text-xs font-bold transition-colors ${
                dias === p.dias ? "bg-[#0f9d58] text-white" : "text-[#5f6368] hover:bg-[#f0f2f5]"
              }`}
            >
              {p.rotulo}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={carregar}
          className="cursor-pointer rounded-lg border border-[#e3e3e3] bg-white px-3 py-1 text-xs font-semibold text-[#5f6368] hover:bg-[#f0f2f5]"
        >
          {carregando ? "Atualizando…" : "🔄 Atualizar"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <Indicador
          titulo="Conversas"
          valor={resumo.totais.conversas.toLocaleString("pt-BR")}
          detalhe={`no período de ${resumo.periodoDias} dia(s)`}
        />
        <Indicador
          titulo="Recebidas"
          valor={resumo.totais.entradas.toLocaleString("pt-BR")}
          detalhe="mensagens de clientes"
        />
        <Indicador
          titulo="Enviadas"
          valor={resumo.totais.saidas.toLocaleString("pt-BR")}
          detalhe="mensagens da loja"
        />
        <Indicador
          titulo="1ª resposta"
          valor={pr.respondidas ? formatarDuracao(pr.medianaSegundos) : "—"}
          detalhe={`mediana · ${taxaResposta}% respondidos`}
          destaque={pr.medianaSegundos > 0 && pr.medianaSegundos <= 600}
          atencao={pr.medianaSegundos > 1800}
        />
        <Indicador
          titulo="Esperando"
          valor={String(resumo.aguardando)}
          detalhe="clientes sem resposta"
          atencao={resumo.aguardando > 0}
        />
      </div>

      {pr.semResposta > 0 && (
        <div className="rounded-xl border border-[#c2571a]/40 bg-[#fdf1e8] px-4 py-2.5 text-xs text-[#a8471a]">
          <strong>{pr.semResposta}</strong> cliente(s) escreveram no período e{" "}
          <strong>não tiveram nenhuma resposta</strong>. É o vazamento mais caro da operação — cada um
          deles é uma venda que foi embora em silêncio.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Secao
          titulo="Movimento por dia"
          ajuda="O que chegou de cliente e o que a loja respondeu."
        >
          <BarrasPorDia dados={resumo.porDia} />
        </Secao>

        <Secao
          titulo="Horário em que o cliente procura"
          ajuda="Só mensagens recebidas — é isto que define a escala de atendimento."
        >
          <BarrasPorHora dados={resumo.porHora} />
        </Secao>

        <Secao titulo="Fila de espera" ajuda="Quem falou por último e ainda não foi respondido.">
          {fila.length === 0 ? (
            <Vazio texto="Ninguém esperando. 👏" />
          ) : (
            <ul className="divide-y divide-[#f0f2f5]">
              {fila.map((c) => (
                <li key={c.chatId}>
                  <button
                    type="button"
                    onClick={() => ponte.abrirConversa?.(c.chatId)}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 py-2 text-left hover:bg-[#f0f2f5]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-bold text-[#202124]">
                        {c.nome || c.nomeWhatsapp || c.numero || "Contato"}
                      </span>
                      <span className="block truncate text-[11px] text-[#5f6368]">{c.previa || "—"}</span>
                    </span>
                    <span className="shrink-0 text-[10px] tabular-nums text-[#5f6368]">
                      {desdeQuando(c.ultimaEm)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Secao>

        <Secao titulo="Funil de atendimento" ajuda="Onde estão os clientes no quadro do Kanban.">
          <ListaComBarra
            itens={resumo.funil.map((f) => ({
              rotulo: NOMES_DE_ETAPA[f.etapa] || f.etapa,
              valor: f.total,
            }))}
          />
        </Secao>

        <Secao
          titulo="Assuntos dos clientes"
          ajuda="Detectado sozinho pela conversa e pelos produtos que a loja enviou. Clique para ver a lista."
        >
          <ListaComBarra
            itens={resumo.interesses.map((i) => ({
              rotulo: i.nome,
              valor: i.contatos,
              chave: i.chave,
            }))}
            aoClicar={aoEscolherSegmento}
          />
        </Secao>

        <Secao titulo="Por vendedor" ajuda="Mensagens enviadas e conversas atendidas no período.">
          <ListaComBarra
            cor={COR_SAIDA}
            itens={resumo.porVendedor.map((v) => ({
              rotulo: ponte.nomeDoVendedor?.(v.vendedorId) || v.vendedorId || "Sem dono",
              valor: v.enviadas,
              detalhe: `${v.conversas} conversa(s)`,
            }))}
          />
          {resumo.porVendedor.length === 0 && (
            <p className="mt-2 text-[11px] text-[#5f6368]">
              Aparece aqui a partir do momento em que cada vendedor entra com o PIN dele — é assim que
              o servidor sabe quem respondeu.
            </p>
          )}
        </Secao>
      </div>

      <p className="pb-2 text-center text-[11px] text-[#5f6368]">
        Os números começam a contar a partir do dia em que o banco foi ligado. O que é anterior a isso
        vem da importação do histórico, que pode levar alguns minutos na primeira vez.
      </p>
    </div>
  );
}

function Carregando() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl border border-[#e3e3e3] bg-[#f0f2f5]" />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-xl border border-[#e3e3e3] bg-[#f0f2f5]" />
    </div>
  );
}

function desdeQuando(iso: string | null) {
  if (!iso) return "";
  const minutos = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutos < 1) return "agora";
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `há ${horas}h`;
  return `há ${Math.round(horas / 24)}d`;
}

export { COR_ALERTA };
