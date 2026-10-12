// ============================================================
// Arena: quanto vale cada coisa.
//
// Pedido do Thiago (12/10/2026): cada venda vale ponto, cada orçamento vale
// ponto, venda de licença do Windows 11 ou do Office vale bônus. Tudo aqui é
// editável no painel (/painel/arena → Pontuação); os números abaixo são só o
// ponto de partida.
//
// Funções puras: recebem o documento e o contexto já levantado do banco e
// devolvem os pontos com o detalhe de cada parcela. É isso que deixa o
// "Recalcular" do painel refazer a temporada inteira sem chamar o Bling.
// ============================================================

import type { DetalheDosPontos } from "./tipos";

export interface RegrasDePontos {
  /** Pontos de cada pedido de venda válido. */
  venda: number;
  /** Pontos de cada orçamento (proposta comercial). */
  orcamento: number;
  /** Bônus por unidade de licença (Windows/Office) vendida. */
  licencaBonus: number;
  /** Item é licença se o nome tiver uma destas palavras… */
  licencaPalavras: string[];
  /** …e nenhuma destas (para "Cadeira Office" e "Notebook com Windows 11" não contarem). */
  licencaExcluir: string[];
  /** Bônus do ticket: +ticketPontos a cada ticketFaixa reais da venda. 0 desliga. */
  ticketFaixa: number;
  ticketPontos: number;
  /** Bônus da venda quando o mesmo cliente recebeu orçamento antes. */
  conversaoBonus: number;
  /** Janela (dias) para o orçamento anterior contar como conversão. */
  conversaoDias: number;
  /** Orçamento abaixo deste valor não pontua (0 = qualquer valor). */
  orcamentoMinimo: number;
  /** Mesmo vendedor, mesmo cliente, mesmo dia: só o primeiro orçamento pontua. */
  umOrcamentoPorClienteDia: boolean;
}

export const REGRAS_PADRAO: RegrasDePontos = {
  venda: 10,
  orcamento: 2,
  licencaBonus: 15,
  licencaPalavras: ["windows 11", "windows 10", "windows", "office", "microsoft 365", "m365"],
  licencaExcluir: [
    "notebook", "computador", "desktop", "pc ", "pc gamer", "all in one", "cadeira", "mesa",
    "teclado", "mouse", "monitor", "gabinete", "tablet",
  ],
  ticketFaixa: 500,
  ticketPontos: 1,
  conversaoBonus: 5,
  conversaoDias: 30,
  orcamentoMinimo: 100,
  umOrcamentoPorClienteDia: true,
};

/** Situações de pedido de venda no Bling (módulo 98310, conferido em 15/09). */
export const SITUACOES_QUE_TIRAM_PONTOS = new Set([12, 32597, 32598]); // cancelado, aguardando estorno, estornado
/** Em digitação: o pedido ainda está sendo montado — espera virar "em aberto". */
export const SITUACOES_PENDENTES = new Set([21]);

export interface ItemDoDocumento {
  descricao: string;
  quantidade: number;
  valor: number;
}

export interface DocumentoDoBling {
  tipo: "venda" | "orcamento";
  blingId: string;
  numero: string;
  data: string; // AAAA-MM-DD
  vendedorBlingId: string | null;
  contatoId: string | null;
  contatoNome: string | null;
  total: number;
  situacaoId: number | null;
  situacao: string | null;
  itens: ItemDoDocumento[];
}

export interface ContextoDoDocumento {
  /** Venda: o mesmo cliente teve orçamento dentro da janela de conversão. */
  temOrcamentoAnterior?: boolean;
  /** Orçamento: já existe outro orçamento válido do mesmo vendedor, cliente e dia. */
  repetidoNoDia?: boolean;
}

export type StatusDoLancamento = "valido" | "cancelado" | "pendente" | "ignorado";

export interface Pontuacao {
  status: StatusDoLancamento;
  pontos: number;
  motivo: string | null;
  licencas: number;
  detalhe: DetalheDosPontos;
}

const normalizar = (s: string) =>
  ` ${s}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ") + " ";

/** O item é uma licença de Windows/Office? */
export function ehLicenca(descricao: string, regras: RegrasDePontos): boolean {
  const d = normalizar(descricao);
  const tem = regras.licencaPalavras.some((p) => p.trim() && d.includes(normalizar(p).trim()));
  if (!tem) return false;
  return !regras.licencaExcluir.some((p) => {
    const x = normalizar(p);
    // "pc " termina em espaço de propósito: casa "PC Office" mas não "PCIe".
    return p.trim() && d.includes(p.endsWith(" ") ? x.slice(0, -1) : x.trim());
  });
}

export function contarLicencas(itens: ItemDoDocumento[], regras: RegrasDePontos): number {
  let n = 0;
  for (const i of itens) {
    if (ehLicenca(i.descricao || "", regras)) n += Math.max(1, Math.round(Number(i.quantidade) || 1));
  }
  return n;
}

const zerado: DetalheDosPontos = { base: 0, licencas: 0, ticket: 0, conversao: 0 };

export function pontuar(
  doc: DocumentoDoBling,
  regras: RegrasDePontos,
  ctx: ContextoDoDocumento = {}
): Pontuacao {
  if (doc.tipo === "venda") {
    const licencas = contarLicencas(doc.itens, regras);
    if (doc.situacaoId != null && SITUACOES_QUE_TIRAM_PONTOS.has(doc.situacaoId)) {
      return { status: "cancelado", pontos: 0, motivo: "Cancelado no Bling", licencas, detalhe: { ...zerado } };
    }
    if (doc.situacaoId != null && SITUACOES_PENDENTES.has(doc.situacaoId)) {
      return { status: "pendente", pontos: 0, motivo: "Em digitação no Bling", licencas, detalhe: { ...zerado } };
    }
    const base = regras.venda;
    const lic = licencas * regras.licencaBonus;
    const ticket =
      regras.ticketFaixa > 0 && regras.ticketPontos > 0
        ? Math.floor(Math.max(0, doc.total) / regras.ticketFaixa) * regras.ticketPontos
        : 0;
    const conversao = ctx.temOrcamentoAnterior ? regras.conversaoBonus : 0;
    return {
      status: "valido",
      pontos: base + lic + ticket + conversao,
      motivo: null,
      licencas,
      detalhe: { base, licencas: lic, ticket, conversao },
    };
  }

  // Orçamento
  if (regras.orcamentoMinimo > 0 && doc.total < regras.orcamentoMinimo) {
    return {
      status: "ignorado",
      pontos: 0,
      motivo: `Abaixo do mínimo de R$ ${regras.orcamentoMinimo}`,
      licencas: 0,
      detalhe: { ...zerado },
    };
  }
  if (regras.umOrcamentoPorClienteDia && ctx.repetidoNoDia) {
    return {
      status: "ignorado",
      pontos: 0,
      motivo: "Outro orçamento do mesmo cliente no mesmo dia já contou",
      licencas: 0,
      detalhe: { ...zerado },
    };
  }
  return {
    status: "valido",
    pontos: regras.orcamento,
    motivo: null,
    licencas: 0,
    detalhe: { ...zerado, base: regras.orcamento },
  };
}

/** Junta o que veio do painel com o padrão, sem aceitar número negativo ou absurdo. */
export function normalizarRegras(entrada: unknown): RegrasDePontos {
  const e = (entrada && typeof entrada === "object" ? entrada : {}) as Record<string, unknown>;
  const n = (v: unknown, padrao: number, max = 10000) => {
    const x = Number(v);
    return Number.isFinite(x) && x >= 0 ? Math.min(x, max) : padrao;
  };
  const lista = (v: unknown, padrao: string[]) => {
    if (Array.isArray(v)) return v.map((s) => String(s)).filter((s) => s.trim()).slice(0, 60);
    if (typeof v === "string") return v.split(/[,\n]/).map((s) => s.trimStart()).filter((s) => s.trim()).slice(0, 60);
    return padrao;
  };
  const P = REGRAS_PADRAO;
  return {
    venda: n(e.venda, P.venda),
    orcamento: n(e.orcamento, P.orcamento),
    licencaBonus: n(e.licencaBonus, P.licencaBonus),
    licencaPalavras: lista(e.licencaPalavras, P.licencaPalavras),
    licencaExcluir: lista(e.licencaExcluir, P.licencaExcluir),
    // (turboFaixa/turboPontos: nomes da primeira versão, de 12/10 de manhã)
    ticketFaixa: n(e.ticketFaixa ?? e.turboFaixa, P.ticketFaixa, 1_000_000),
    ticketPontos: n(e.ticketPontos ?? e.turboPontos, P.ticketPontos),
    conversaoBonus: n(e.conversaoBonus, P.conversaoBonus),
    conversaoDias: n(e.conversaoDias, P.conversaoDias, 365),
    orcamentoMinimo: n(e.orcamentoMinimo, P.orcamentoMinimo, 1_000_000),
    umOrcamentoPorClienteDia:
      typeof e.umOrcamentoPorClienteDia === "boolean" ? e.umOrcamentoPorClienteDia : P.umOrcamentoPorClienteDia,
  };
}

/**
 * Aplica a hora do turbo: o total do documento vezes o multiplicador
 * (congelado quando o documento chegou). Só vale para o que pontua.
 */
export function comTurbo(p: Pontuacao, multiplicador: number): Pontuacao {
  const m = Number.isFinite(multiplicador) && multiplicador > 1 ? Math.min(multiplicador, 10) : 1;
  if (m === 1 || p.status !== "valido" || p.pontos <= 0) return p;
  const total = Math.round(p.pontos * m * 10) / 10;
  return { ...p, pontos: total, detalhe: { ...p.detalhe, turbo: Math.round((total - p.pontos) * 10) / 10 } };
}
