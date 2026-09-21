// Tipos do módulo de Status (espelham o que o servidor devolve em /api/status).

export type RegraRecorrencia =
  | { tipo: "unica"; data: string; hora: string }
  | { tipo: "diaria" | "dias_uteis"; horarios: string[]; inicio?: string; fim?: string }
  | { tipo: "semanal"; dias: number[]; horarios: string[]; inicio?: string; fim?: string };

export interface StatusConteudo {
  id: string;
  titulo: string;
  tipo: "texto" | "imagem" | "video";
  texto: string;
  link: string | null;
  corFundo: string;
  fonte: number;
  midia: string | null;
  midiaMime: string | null;
  categoria: string | null;
  campanha: string | null;
  assinar: boolean;
  selo: boolean;
  modelo: boolean;
  criadoPor: string;
  criadoEm: string;
  atualizadoEm: string;
  textoFinal: string;
}

export interface StatusAgendamento {
  id: string;
  conteudoId: string;
  regra: RegraRecorrencia;
  descricao: string;
  recorrente: boolean;
  situacao: "ativo" | "pausado" | "finalizado" | "cancelado";
  proximaEm: string | null;
  criadoPor: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface StatusExecucao {
  id: string;
  agendamentoId: string | null;
  conteudoId: string;
  previstoPara: string;
  situacao: "publicando" | "publicado" | "falhou" | "incerto" | "perdido" | "cancelado";
  tentativa: number;
  origem: string;
  disparadoPor: string;
  iniciadoEm: string;
  concluidoEm: string | null;
  erro: string | null;
}

export interface StatusConfig {
  assinatura: { ativa: boolean; texto: string };
  toleranciaAtrasoMin: number;
  diasDeAlerta: number;
  minimoPorDia: number;
}

export interface StatusResumo {
  config: StatusConfig;
  categorias: string[];
  cores: string[];
  conteudos: StatusConteudo[];
  agendamentos: StatusAgendamento[];
  execucoes: StatusExecucao[];
  alertas: { diasSemStatus: string[]; diasFracos: string[]; falhasRecentes: number; janelaDias: number };
}

export interface StatusRecebido {
  id: string;
  autor: string;
  autorNome: string | null;
  tipo: "texto" | "imagem" | "video";
  texto: string;
  mime: string | null;
  recebidoEm: string;
  vistoEm: string | null;
  midia: string | null;
}

export interface ItemCalendario {
  quando: string;
  data: string;
  conteudoId: string;
  agendamentoId: string | null;
  execucaoId?: string;
  titulo: string;
  tipo: string;
  campanha: string | null;
  categoria: string | null;
  recorrente: boolean;
  situacao: string;
}

export interface EntradaHistorico {
  id: number;
  em: string;
  usuario: string;
  acao: string;
  titulo: string | null;
  conteudoId: string | null;
  detalhes: Record<string, unknown>;
}

/** O que o módulo precisa do painel (injeção, sem depender do CRM inteiro). */
export interface PonteStatus {
  chamar: <T = Record<string, unknown>>(caminho: string, init?: RequestInit) => Promise<T>;
  urlMidia: (url: string | null | undefined) => string;
  fotoDoContato: (chatId: string) => string[];
  nomeDoContato: (chatId: string) => string | null;
  responderStatus: (s: StatusRecebido, texto: string) => void;
  avisar: (msg: string) => void;
  /** Escuta um evento do socket do painel; devolve a função que desliga. */
  ouvir: (evento: string, fn: (dados: unknown) => void) => () => void;
  ehAdmin: boolean;
}
