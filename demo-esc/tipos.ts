/** Tipos compartilhados do escritório virtual. Sem dependência de rede nem de 3D. */

export type StatusCadastro = "ativo" | "em_breve";

export type StatusVisual =
  | "trabalhando"
  | "em_conversa"
  | "ocioso"
  | "em_reuniao"
  | "em_breve";

export type Lugar = "mesa" | "visita" | "reuniao" | "cafe";

export type AgenteEquipe = {
  id: string;
  nome: string;
  papel: string;
  /** Cor chapada do boneco e do brilho do monitor, em #rrggbb. */
  cor: string;
  emoji: string;
  status: StatusCadastro;
  /** Tarefas que ele reveza no modo demonstração. */
  tarefas: string[];
};

export type AgenteCena = {
  id: string;
  status: StatusVisual;
  tarefa: string;
  ultimaFala: string;
  falandoCom: string | null;
  whatsappConectado: boolean;
  lugar: Lugar;
};

export type EventoConversa = {
  em: number;
  hora: string;
  de: string;
  para: string;
  texto: string;
};

export type EstadoEscritorio = {
  modo: "demonstracao" | "ao_vivo";
  agentes: AgenteCena[];
  eventos: EventoConversa[];
  conversas: number;
  tarefasConcluidas: number;
  revisao: number;
  selecionadoId: string | null;
};

/** Contrato JSON do feed. Campos em inglês de propósito: é a integração. */
export type AgenteFeed = {
  id: string;
  name: string;
  status: StatusVisual;
  currentTask: string;
  lastMessage: string;
  talkingTo: string | null;
  whatsappConnected: boolean;
};

export type EventoFeed = {
  at: string;
  from: string;
  to: string;
  text: string;
};

export type FeedStatus = {
  updatedAt: string;
  agents: AgenteFeed[];
  events: EventoFeed[];
};

export const ROTULO_STATUS: Record<StatusVisual, string> = {
  trabalhando: "Trabalhando",
  em_conversa: "Em conversa",
  ocioso: "Disponível",
  em_reuniao: "Em reunião",
  em_breve: "Em breve",
};

export const COR_STATUS: Record<StatusVisual, string> = {
  trabalhando: "#3ddc6a",
  em_conversa: "#ffd23a",
  ocioso: "#e7e9f2",
  em_reuniao: "#c084fc",
  em_breve: "#9aa4b8",
};

export const STATUS_VALIDOS: readonly StatusVisual[] = [
  "trabalhando",
  "em_conversa",
  "ocioso",
  "em_reuniao",
  "em_breve",
];

/** Feed com mais de 5 minutos deixa de mandar na cena. */
export const FEED_VALIDADE_MS = 5 * 60 * 1000;
