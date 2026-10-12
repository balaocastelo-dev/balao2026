// Tipos da Arena (corrida de vendas do telão da loja). Ver docs/arena.md.

import type { Periodo } from "./periodos";

/** Modelos de kart desenhados no telão (todos originais). */
export const KARTS = ["foguete", "classico", "buggy", "formula", "monster", "turbo"] as const;
export type ModeloDeKart = (typeof KARTS)[number];

export const CORES_DE_KART = [
  "#E60012", "#1E6BFF", "#00B86B", "#FFB800", "#9B4DFF", "#FF5FA2",
  "#00C2D1", "#FF7A00", "#2D2D2D", "#8BC34A",
];

/** Quem corre: vendedor (vendas do Bling) ou técnico (ordens de serviço do Fechamento da assistência). */
export type FuncaoDoPiloto = "vendedor" | "tecnico";

export interface Piloto {
  id: string;
  /** Endereço da página do piloto: www.balao.info/arena/<slug>. */
  slug: string;
  nome: string;
  apelido: string | null;
  foto: string | null;
  cor: string;
  kart: ModeloDeKart;
  numero: number;
  blingVendedorId: string | null;
  funcao: FuncaoDoPiloto;
  /** Meta própria em reais. Vazio = a parte dele na divisão da meta da equipe. */
  metaSemana: number | null;
  metaMes: number | null;
  ativo: boolean;
}

export type TipoDeLancamento = "venda" | "orcamento" | "os" | "manual";
export type StatusGravado = "valido" | "cancelado" | "pendente" | "ignorado" | "anulado";

/**
 * Um documento que entra na corrida. Desde 12/10 (tarde) tudo conta em REAIS:
 * venda = total do pedido, ordem de serviço = mão de obra + peças, lançamento
 * à mão = o valor digitado. Orçamento aparece no placar, mas vale R$ 0.
 */
export interface Lancamento {
  id: string;
  tipo: TipoDeLancamento;
  origem: "bling" | "assistencia" | "manual";
  blingId: string | null;
  numero: string | null;
  blingVendedorId: string | null;
  pilotoId: string | null;
  contatoId: string | null;
  contatoNome: string | null;
  data: string;
  registradoEm: string;
  historico: boolean;
  total: number;
  situacaoId: number | null;
  situacao: string | null;
  itens: { descricao: string; quantidade: number; valor: number }[];
  /** Unidades de licença (Windows/Office) na venda. */
  licencas: number;
  /** Quanto das licenças em reais (já está dentro do valor da venda). */
  valorLicencas: number;
  /** O que conta na corrida, em reais. */
  valor: number;
  status: StatusGravado;
  motivo: string | null;
  anuladoManual: boolean;
  /** Valor trocado à mão no painel (null = o do documento). */
  valorManual: number | null;
  /** Resumo do documento do Bling: se mudar, o valor é refeito. */
  assinatura?: string | null;
}

export interface AjustesDaCorrida {
  titulo: string;
  /** O que o telão mostra: a corrida da semana, a do mês ou as duas alternando. */
  periodoTelao: Periodo | "alternar";
  /** Meta da equipe em reais, dividida entre vendedores e técnicos (menos quem tem meta própria). */
  metaGlobalSemana: number;
  metaGlobalMes: number;
  som: boolean;
}

export const CORRIDA_PADRAO: AjustesDaCorrida = {
  titulo: "Grande Prêmio Balão",
  periodoTelao: "alternar",
  metaGlobalSemana: 63_000,
  metaGlobalMes: 250_000,
  som: true,
};

export interface Premio {
  ativo: boolean;
  titulo: string;
  /** Link do anúncio no Airbnb. */
  link: string;
  /** Foto do anúncio (lida do link ou colada à mão). */
  imagem: string;
  local: string;
  descricao: string;
  /** A viagem é da meta global de qual período. */
  periodo: Periodo;
}

export const PREMIO_PADRAO: Premio = {
  ativo: false,
  titulo: "",
  link: "",
  imagem: "",
  local: "",
  descricao: "",
  periodo: "mes",
};

/** Avisos da Arena num grupo (ou número) do WhatsApp, pela linha da loja. */
export interface AjustesDoWhatsApp {
  ativo: boolean;
  /** "1203…@g.us" (grupo) ou número com DDI. */
  destino: string;
  nomeDestino: string;
  meta: boolean;
  equipe: boolean;
  lideranca: boolean;
}

export const WHATSAPP_PADRAO: AjustesDoWhatsApp = {
  ativo: false,
  destino: "",
  nomeDestino: "",
  meta: true,
  equipe: true,
  lideranca: false,
};

export interface SituacaoDoVigia {
  ultimaVez: string | null;
  versao: string | null;
  maquina: string | null;
  ultimoLote: number;
  ultimoErro: string | null;
}

export interface LinhaDoPlacar {
  piloto: Piloto;
  /** Reais feitos no período. */
  valor: number;
  /** Meta em reais (a própria ou a parte dele na divisão). */
  meta: number;
  metaPropria: boolean;
  /** 0 a 1+ (passa de 1 quando a meta é batida). */
  progresso: number;
  posicao: number;
  vendas: number;
  valorVendas: number;
  orcamentos: number;
  os: number;
  valorOS: number;
  licencas: number;
  valorLicencas: number;
  chegou: boolean;
}

export interface PlacarDoPeriodo {
  periodo: Periodo;
  rotulo: string;
  inicio: string;
  fim: string;
  terminaEm: string;
  linhas: LinhaDoPlacar[];
  equipe: { valor: number; meta: number; progresso: number };
}

/** Uma jogada da corrida (sem nome de cliente). */
export interface JogadaPublica {
  id: string;
  tipo: TipoDeLancamento;
  pilotoId: string | null;
  valor: number;
  licencas: number;
  data: string;
  registradoEm: string;
}

/** O que o telão e as páginas dos pilotos recebem. Sem nome de cliente; os valores em reais aparecem (pedido de 12/10). */
export interface EstadoDoTelao {
  titulo: string;
  periodoTelao: AjustesDaCorrida["periodoTelao"];
  som: boolean;
  semana: PlacarDoPeriodo;
  mes: PlacarDoPeriodo;
  premio: Omit<Premio, "ativo"> | null;
  /** As últimas jogadas da loja (o telão comemora as que ainda não viu). */
  recentes: JogadaPublica[];
  /** As últimas de cada piloto, para a página dele. */
  jogadasPorPiloto: Record<string, JogadaPublica[]>;
  hallDaFama: { rotulo: string; periodo: Periodo; campeao: string | null; foto: string | null; cor: string | null; valor: number; chegaram: number }[];
  vigiaUltimaVez: string | null;
  geradoEm: string;
}
