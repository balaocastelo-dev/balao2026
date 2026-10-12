// Tipos da Arena (corrida de vendas do telão da loja). Ver docs/arena.md.

import type { Periodo } from "./periodos";

/** Modelos de kart desenhados no telão (todos originais). */
export const KARTS = ["foguete", "classico", "buggy", "formula", "monster", "turbo"] as const;
export type ModeloDeKart = (typeof KARTS)[number];

export const CORES_DE_KART = [
  "#E60012", "#1E6BFF", "#00B86B", "#FFB800", "#9B4DFF", "#FF5FA2",
  "#00C2D1", "#FF7A00", "#2D2D2D", "#8BC34A",
];

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
  metaSemana: number | null;
  metaMes: number | null;
  ativo: boolean;
}

export type TipoDeLancamento = "venda" | "orcamento" | "manual";
export type StatusGravado = "valido" | "cancelado" | "pendente" | "ignorado" | "anulado";

export interface Lancamento {
  id: string;
  tipo: TipoDeLancamento;
  origem: "bling" | "manual";
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
  licencas: number;
  pontos: number;
  detalhe: DetalheDosPontos | null;
  /** Multiplicador da hora do turbo, congelado quando o documento chegou (1 = sem turbo). */
  turbo: number;
  status: StatusGravado;
  motivo: string | null;
  anuladoManual: boolean;
  pontosManual: number | null;
  /** Resumo do documento do Bling: se mudar, os pontos são refeitos. */
  assinatura?: string | null;
}

export interface DetalheDosPontos {
  base: number;
  licencas: number;
  /** +pontos pelo valor da venda (a cada R$ X). */
  ticket: number;
  conversao: number;
  /** Pontos a mais pela hora do turbo. */
  turbo?: number;
}

export interface AjustesDaCorrida {
  titulo: string;
  /** O que o telão mostra: a corrida da semana, a do mês ou as duas alternando. */
  periodoTelao: Periodo | "alternar";
  /** 0 = soma das metas dos pilotos. */
  metaGlobalSemana: number;
  metaGlobalMes: number;
  /** Meta de quem não tem meta própria. */
  metaPadraoSemana: number;
  metaPadraoMes: number;
  som: boolean;
}

export const CORRIDA_PADRAO: AjustesDaCorrida = {
  titulo: "Grande Prêmio Balão",
  periodoTelao: "alternar",
  metaGlobalSemana: 0,
  metaGlobalMes: 0,
  metaPadraoSemana: 60,
  metaPadraoMes: 240,
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

/** Hora do turbo: pontos multiplicados em horários fracos (ou ligada à mão no painel). */
export interface JanelaDoTurbo {
  /** 0 = domingo … 6 = sábado. */
  dias: number[];
  /** "14:00" — horário da loja. */
  das: string;
  ate: string;
}

export interface AjustesDoTurbo {
  janelas: JanelaDoTurbo[];
  multiplicador: number;
  /** Turbo ligado à mão até este instante (ISO), ou null. */
  manualAte: string | null;
  manualMultiplicador: number;
}

export const TURBO_PADRAO: AjustesDoTurbo = { janelas: [], multiplicador: 2, manualAte: null, manualMultiplicador: 2 };

/** Avisos da Arena num grupo (ou número) do WhatsApp, pela linha da loja. */
export interface AjustesDoWhatsApp {
  ativo: boolean;
  /** "1203…@g.us" (grupo) ou número com DDI. */
  destino: string;
  nomeDestino: string;
  meta: boolean;
  equipe: boolean;
  lideranca: boolean;
  turbo: boolean;
}

export const WHATSAPP_PADRAO: AjustesDoWhatsApp = {
  ativo: false,
  destino: "",
  nomeDestino: "",
  meta: true,
  equipe: true,
  lideranca: false,
  turbo: true,
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
  pontos: number;
  meta: number;
  /** 0 a 1+ (passa de 1 quando a meta é batida). */
  progresso: number;
  posicao: number;
  vendas: number;
  orcamentos: number;
  licencas: number;
  conversoes: number;
  chegou: boolean;
}

export interface PlacarDoPeriodo {
  periodo: Periodo;
  rotulo: string;
  inicio: string;
  fim: string;
  terminaEm: string;
  linhas: LinhaDoPlacar[];
  equipe: { pontos: number; meta: number; progresso: number };
}

/** Uma jogada pública (sem cliente e sem reais). */
export interface JogadaPublica {
  id: string;
  tipo: TipoDeLancamento;
  pilotoId: string | null;
  pontos: number;
  licencas: number;
  conversao: boolean;
  turbo: number;
  data: string;
  registradoEm: string;
}

/** O que o telão e as páginas dos pilotos recebem. Público: sem nome de cliente e sem valor em reais. */
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
  hallDaFama: { rotulo: string; periodo: Periodo; campeao: string | null; foto: string | null; cor: string | null; pontos: number; chegaram: number }[];
  turbo: AjustesDoTurbo;
  /** O que vale cada coisa (para a página do piloto dizer quanto falta). */
  regras: { venda: number; orcamento: number; licencaBonus: number; conversaoBonus: number; ticketFaixa: number; ticketPontos: number };
  vigiaUltimaVez: string | null;
  geradoEm: string;
}
