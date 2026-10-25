// ============================================================
// Arena: quanto cada documento vale, em reais.
//
// Pedido do Thiago (12/10/2026, tarde): "esquece a lógica de pontos. Tudo deve
// ser calculado em valores: venda conta como valor, licença como valor, cada
// ordem de serviço conta como valor."
//
//  - Venda do MEU BLING (/sistema, desde 25/10/2026) e do Bling (histórico até
//    24/10): o total do pedido. As licenças (Windows/Office) já estão
//    dentro desse total; aqui só se separa quanto delas, para o placar mostrar.
//  - Orçamento: aparece no placar (quantos), mas vale R$ 0.
//  - Ordem de serviço (Fechamento da assistência): mão de obra + peças.
//  - Cancelado no MEU BLING (situação de cancelamento): R$ 0.
//  - Histórico do Bling: cancelado/estornado R$ 0; em digitação espera.
//
// Funções puras: a gravação e o "Recalcular" do painel usam as mesmas.
// ============================================================

export interface RegrasDeValor {
  /** Item é licença se o nome tiver uma destas palavras… */
  licencaPalavras: string[];
  /** …e nenhuma destas (para "Cadeira Office" e "Notebook com Windows 11" não contarem). */
  licencaExcluir: string[];
}

export const REGRAS_PADRAO: RegrasDeValor = {
  licencaPalavras: ["windows 11", "windows 10", "windows", "office", "microsoft 365", "m365"],
  licencaExcluir: [
    "notebook", "computador", "desktop", "pc ", "pc gamer", "all in one", "cadeira", "mesa",
    "teclado", "mouse", "monitor", "gabinete", "tablet",
  ],
};

/** Situações de pedido de venda no Bling (módulo 98310, conferido em 15/09). Só para o histórico. */
export const SITUACOES_QUE_ZERAM = new Set([12, 32597, 32598]); // cancelado, aguardando estorno, estornado
/** Em digitação: o pedido ainda está sendo montado — espera virar "em aberto". */
export const SITUACOES_PENDENTES = new Set([21]);

export interface ItemDoDocumento {
  descricao: string;
  quantidade: number;
  /** Valor unitário (como o Bling manda). */
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

export type StatusDoDocumento = "valido" | "cancelado" | "pendente" | "ignorado";

export interface Valoracao {
  status: StatusDoDocumento;
  valor: number;
  motivo: string | null;
  licencas: number;
  valorLicencas: number;
}

const normalizar = (s: string) =>
  ` ${s}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ") + " ";

/** O item é uma licença de Windows/Office? */
export function ehLicenca(descricao: string, regras: RegrasDeValor): boolean {
  const d = normalizar(descricao);
  const tem = regras.licencaPalavras.some((p) => p.trim() && d.includes(normalizar(p).trim()));
  if (!tem) return false;
  return !regras.licencaExcluir.some((p) => {
    const x = normalizar(p);
    // "pc " termina em espaço de propósito: casa "PC Office" mas não "PCIe".
    return p.trim() && d.includes(p.endsWith(" ") ? x.slice(0, -1) : x.trim());
  });
}

export const centavos = (v: number) => Math.round((Number(v) || 0) * 100) / 100;

/** Unidades e reais das licenças de uma venda. */
export function licencasDa(itens: ItemDoDocumento[], regras: RegrasDeValor): { unidades: number; valor: number } {
  let unidades = 0;
  let valor = 0;
  for (const i of itens) {
    if (!ehLicenca(i.descricao || "", regras)) continue;
    const q = Math.max(1, Math.round(Number(i.quantidade) || 1));
    unidades += q;
    valor += Math.max(0, Number(i.valor) || 0) * q;
  }
  return { unidades, valor: centavos(valor) };
}

export function valorar(doc: DocumentoDoBling, regras: RegrasDeValor): Valoracao {
  if (doc.tipo === "orcamento") {
    return { status: "valido", valor: 0, motivo: null, licencas: 0, valorLicencas: 0 };
  }
  const lic = licencasDa(doc.itens, regras);
  if (doc.situacaoId != null && SITUACOES_QUE_ZERAM.has(doc.situacaoId)) {
    return { status: "cancelado", valor: 0, motivo: "Cancelado no Bling", licencas: lic.unidades, valorLicencas: lic.valor };
  }
  if (doc.situacaoId != null && SITUACOES_PENDENTES.has(doc.situacaoId)) {
    return { status: "pendente", valor: 0, motivo: "Em digitação no Bling", licencas: lic.unidades, valorLicencas: lic.valor };
  }
  return { status: "valido", valor: centavos(Math.max(0, doc.total)), motivo: null, licencas: lic.unidades, valorLicencas: lic.valor };
}

/** Uma venda do MEU BLING (/sistema), já limpa, como a Arena guarda. */
export interface DocumentoDoSistema {
  sistemaId: string;
  numero: string;
  data: string; // AAAA-MM-DD
  vendedorId: string | null;
  vendedorNome: string | null;
  contatoNome: string | null;
  total: number;
  situacaoId: number | null;
  situacao: string | null;
  cancelada: boolean;
  /** Vazio quando os itens ainda não foram lidos (a lista do sistema não traz itens). */
  itens: ItemDoDocumento[];
}

/** Venda do MEU BLING: o total; cancelada lá vale R$ 0. Todo pedido não cancelado conta. */
export function valorarDoSistema(doc: Pick<DocumentoDoSistema, "total" | "cancelada" | "itens">, regras: RegrasDeValor): Valoracao {
  const lic = licencasDa(doc.itens, regras);
  if (doc.cancelada) {
    return { status: "cancelado", valor: 0, motivo: "Cancelado no sistema", licencas: lic.unidades, valorLicencas: lic.valor };
  }
  return { status: "valido", valor: centavos(Math.max(0, Number(doc.total) || 0)), motivo: null, licencas: lic.unidades, valorLicencas: lic.valor };
}

/** Junta o que veio do painel com o padrão. */
export function normalizarRegras(entrada: unknown): RegrasDeValor {
  const e = (entrada && typeof entrada === "object" ? entrada : {}) as Record<string, unknown>;
  const lista = (v: unknown, padrao: string[]) => {
    if (Array.isArray(v)) return v.map((s) => String(s)).filter((s) => s.trim()).slice(0, 60);
    if (typeof v === "string") return v.split(/[,\n]/).map((s) => s.trimStart()).filter((s) => s.trim()).slice(0, 60);
    return padrao;
  };
  return {
    licencaPalavras: lista(e.licencaPalavras, REGRAS_PADRAO.licencaPalavras),
    licencaExcluir: lista(e.licencaExcluir, REGRAS_PADRAO.licencaExcluir),
  };
}

/** "R$ 12.345" (sem centavos) para telão, placar e avisos. */
export function reais(v: number, comCentavos = false): string {
  return (Number(v) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: comCentavos ? 2 : 0,
    maximumFractionDigits: comCentavos ? 2 : 0,
  });
}
