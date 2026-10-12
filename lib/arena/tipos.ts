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
  detalhe: { base: number; licencas: number; turbo: number; conversao: number } | null;
  status: StatusGravado;
  motivo: string | null;
  anuladoManual: boolean;
  pontosManual: number | null;
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

/** O que o telão recebe. Público: sem nome de cliente e sem valor em reais. */
export interface EstadoDoTelao {
  titulo: string;
  periodoTelao: AjustesDaCorrida["periodoTelao"];
  som: boolean;
  semana: PlacarDoPeriodo;
  mes: PlacarDoPeriodo;
  premio: Omit<Premio, "ativo"> | null;
  recentes: {
    id: string;
    tipo: TipoDeLancamento;
    pilotoId: string | null;
    pontos: number;
    licencas: number;
    conversao: boolean;
    registradoEm: string;
  }[];
  hallDaFama: { rotulo: string; periodo: Periodo; campeao: string | null; foto: string | null; cor: string | null; pontos: number; chegaram: number }[];
  vigiaOnline: boolean;
  geradoEm: string;
}
