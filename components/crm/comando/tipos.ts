// Tipos do Centro de Comando. O servidor responde em português (é o mesmo
// vocabulário que a loja usa), então os campos ficam em português também.

export type PonteComando = {
  /** Chamada ao servidor do WhatsApp já com o ingresso do painel. */
  chamar: <T>(caminho: string, init?: RequestInit) => Promise<T>;
  /** Abre a conversa no atendimento (volta para a tela de chat). */
  abrirConversa?: (chatId: string) => void;
  /** Fotos possíveis do contato, em ordem de preferência. */
  fotoDoContato?: (chatId: string) => string[];
  /** Nome que o vendedor cadastrou, quando existir. */
  nomeDoVendedor?: (id: string | null) => string | null;
};

export type ResumoOperacao = {
  periodoDias: number;
  totais: { entradas: number; saidas: number; conversas: number };
  porDia: { dia: string; entradas: number; saidas: number; conversas: number }[];
  porHora: { hora: number; total: number }[];
  porVendedor: { vendedorId: string; enviadas: number; conversas: number }[];
  primeiraResposta: {
    rodadas: number;
    respondidas: number;
    semResposta: number;
    medianaSegundos: number;
    mediaSegundos: number;
  };
  funil: { etapa: string; total: number }[];
  interesses: { chave: string; nome: string; contatos: number }[];
  aguardando: number;
};

export type ContatoResumo = {
  chatId: string;
  numero: string | null;
  nome: string | null;
  nomeWhatsapp: string | null;
  foto: string | null;
  vendedorId: string | null;
  etapa: string;
  primeiraEm: string | null;
  ultimaEm: string | null;
  ultimaDirecao: "in" | "out" | null;
  previa: string | null;
  entradas: number;
  saidas: number;
  optin: boolean;
  optout: boolean;
  interesses: { chave: string; nome: string }[];
  etiquetas: string[];
};

export type ContatoCompleto = Omit<ContatoResumo, "interesses"> & {
  notas: { id: number; texto: string; autor: string | null; em: string }[];
  interesses: { chave: string; nome: string; pontos: number; ultimaEm: string | null }[];
  consentimento: { acao: string; canal: string; texto: string | null; em: string; por: string | null }[];
};

export type Segmento = { chave: string; nome: string; contatos: number; recentes: number };

export type Etiqueta = { id: string; nome: string; cor: string; automatica: boolean; usos: number };

export type RespostaRapida = {
  id: string;
  atalho: string | null;
  titulo: string;
  texto: string;
  categoria: string | null;
  usos: number;
};

export type AchadoBusca = {
  id: string;
  chatId: string;
  direcao: "in" | "out";
  corpo: string;
  em: string;
  nome: string;
};

export type ModuloComando = "painel" | "clientes" | "agente" | "catalogo" | "equipe" | "ajustes";

// ---- agente JUL.IA (whatsapp-server/agente) ----
export type RespostaDoAgente = { tipo: "texto"; texto: string } | { tipo: "produto"; produtoId: string; nome?: string | null };

export type SugestaoDoAgente = {
  id: string;
  chatId: string;
  nome: string | null;
  respostas: RespostaDoAgente[];
  criadaEm: number;
};

export type EstadoDoAgente = {
  config: {
    modo: "desligado" | "copiloto" | "automatico";
    publico: "teste" | "clientes";
    vendaAutomatica: boolean;
    ligadoEm: number | null;
  };
  numerosDeTeste: string[];
  trabalhador: {
    online: boolean;
    ultimaBatida: number | null;
    info: {
      versao?: string;
      modelo?: string;
      modeloNaPlaca?: boolean;
      esperando?: string | null;
      catalogo?: { produtos: number; atualizadoEm: string | null };
      atendidas?: number;
      erros?: number;
    } | null;
  };
  hoje: Record<string, number> | null;
  fila: number;
  pensando: { chatId: string; nome: string | null }[];
  sugestoes: SugestaoDoAgente[];
  conversas: {
    chatId: string;
    nome: string | null;
    numero: string;
    situacao: "ativo" | "humano" | "transferida";
    ate: number | null;
    motivo: string | null;
  }[];
  recentes: { tipo: string; em: number; chatId?: string; nome?: string | null; texto?: string }[];
};

export type ConversaDoAgente = {
  modo: "desligado" | "copiloto" | "automatico";
  pode: boolean;
  motivo: string | null;
  situacao: "ativo" | "humano" | "transferida";
  ate: number | null;
  respondida: boolean;
};
