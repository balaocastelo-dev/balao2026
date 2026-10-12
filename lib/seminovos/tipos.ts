// ============================================================
// Seminovos: o que é um aparelho da vitrine e o que é um lead.
//
// Pedido do Thiago (12/10/2026): a página /seminovos tem de ser um ímã de
// leads, com produtos de verdade e foto de verdade. Até então não existia
// nenhum seminovo cadastrado no site e a "vitrine" mostrava cabo de força e
// fonte de notebook. Agora cada aparelho é cadastrado em /painel/seminovos,
// com as fotos tiradas na loja, e só aparece na página se existir.
// ============================================================

export type Situacao = "disponivel" | "reservado" | "vendido";
export type Grau = "A" | "B";

export interface Seminovo {
  id: string;
  /** Lenovo, Dell, HP, Apple… */
  marca: string;
  /** ThinkPad T14 Gen 2, Latitude 5420, MacBook Air M1… */
  modelo: string;
  processador: string;
  memoria: string;
  armazenamento: string;
  tela: string;
  placaDeVideo?: string;
  /** Saúde da bateria, como o vendedor mediu: "89%" ou "dura 5 h". */
  bateria?: string;
  sistema?: string;
  grau: Grau;
  garantiaMeses: number;
  precoVista: number;
  /** Preço no cartão; vazio = igual ao à vista. */
  precoCartao?: number;
  /** Em quantas vezes sem juros (vazio = não mostra parcelamento). */
  parcelas?: number;
  /** Detalhes que o cliente precisa saber: risco na tampa, teclado sem ç… */
  observacoes?: string;
  destaque?: boolean;
  /** Chaves das fotos na gaveta (a primeira é a capa). */
  fotos: string[];
  situacao: Situacao;
  criadoEm: string;
  atualizadoEm: string;
}

export type Interesse = "comprar" | "reservar" | "lista" | "vender";
export type StatusDoLead = "novo" | "atendido" | "vendido" | "perdido";

export interface LeadSeminovo {
  id: string;
  criadoEm: string;
  nome: string;
  whatsapp: string;
  email?: string;
  interesse: Interesse;
  uso?: string;
  orcamento?: string;
  preferencias?: string;
  aparelhoId?: string;
  aparelhoNome?: string;
  origem: {
    pagina: string;
    bloco?: string;
    utm?: Record<string, string>;
    referrer?: string;
  };
  status: StatusDoLead;
  nota?: string;
}

export const USOS = [
  { valor: "estudo", rotulo: "Estudo e faculdade" },
  { valor: "escritorio", rotulo: "Escritório e home office" },
  { valor: "programacao", rotulo: "Programação" },
  { valor: "design", rotulo: "Design, foto e vídeo" },
  { valor: "empresa", rotulo: "Vários para a empresa" },
  { valor: "outro", rotulo: "Outro uso" },
] as const;

export const ORCAMENTOS = [
  { valor: "ate-1500", rotulo: "Até R$ 1.500" },
  { valor: "1500-2500", rotulo: "R$ 1.500 a R$ 2.500" },
  { valor: "2500-4000", rotulo: "R$ 2.500 a R$ 4.000" },
  { valor: "acima-4000", rotulo: "Acima de R$ 4.000" },
  { valor: "nao-sei", rotulo: "Ainda não sei" },
] as const;

export const INTERESSES: Record<Interesse, string> = {
  comprar: "Quer opções do estoque",
  reservar: "Quer reservar um aparelho",
  lista: "Lista de espera (avisar quando chegar)",
  vender: "Quer vender o usado (consignação)",
};

export const STATUS_DO_LEAD: Record<StatusDoLead, string> = {
  novo: "Novo",
  atendido: "Atendido",
  vendido: "Comprou",
  perdido: "Não comprou",
};

export function rotuloDoUso(valor?: string) {
  return USOS.find((u) => u.valor === valor)?.rotulo ?? valor ?? "";
}

export function rotuloDoOrcamento(valor?: string) {
  return ORCAMENTOS.find((o) => o.valor === valor)?.rotulo ?? valor ?? "";
}

export function nomeDoAparelho(s: Pick<Seminovo, "marca" | "modelo">) {
  const marca = s.marca.trim();
  const modelo = s.modelo.trim();
  return modelo.toLowerCase().startsWith(marca.toLowerCase()) ? modelo : `${marca} ${modelo}`.trim();
}
