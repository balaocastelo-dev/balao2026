// ============================================================
// PDV (www.balao.info/pdv): os tipos que o balcão, a API e o /sistema dividem.
//
// Pedido do Thiago (12/10/2026): produtos só do site.
// Pedido do Thiago (22/10/2026): as vendas vão para o /sistema (MEU BLING, o
// ERP próprio da loja) e não mais para o Bling. Do /sistema vêm os vendedores,
// os clientes, as vendas do dia e a nota fiscal. Ver docs/pdv.md.
// ============================================================

export type FormaDePagamento = "pix" | "dinheiro" | "credito" | "debito" | "boleto" | "outro";

export const NOMES_DAS_FORMAS: Record<FormaDePagamento, string> = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  credito: "Cartão de crédito",
  debito: "Cartão de débito",
  boleto: "Boleto",
  outro: "Outro",
};

/** Tabela de preço do site: à vista (Pix/dinheiro) ou no cartão. */
export type Tabela = "vista" | "cartao";

export interface ProdutoDoPdv {
  id: string;
  nome: string;
  foto: string | null;
  categoria: string;
  marca: string | null;
  precoVista: number;
  precoCartao: number | null;
  slug: string | null;
  prontaEntrega: boolean;
}

export interface ItemDaVenda {
  /** id do produto no site; "avulso-…" para item digitado no balcão. */
  produtoId: string;
  nome: string;
  foto: string | null;
  quantidade: number;
  /** Valor unitário cobrado (já na tabela escolhida, com ajuste do vendedor). */
  valor: number;
  /** Preço do site na hora da venda, para o comprovante mostrar o desconto. */
  valorDoSite: number | null;
}

export interface Pagamento {
  forma: FormaDePagamento;
  valor: number;
  /** Só no dinheiro: quanto o cliente entregou. */
  recebido?: number | null;
  /** Só no crédito. */
  parcelas?: number | null;
}

export interface ClienteDaVenda {
  nome: string;
  documento: string; // só dígitos; vazio = consumidor final
  email: string;
  telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  /** id do contato no /sistema, quando já existe lá. */
  sistemaId?: number | null;
}

export interface Desconto {
  tipo: "valor" | "percentual";
  valor: number;
}

/** Situação da venda no caminho até o /sistema. */
export type EstadoNoSistema = "pendente" | "enviando" | "no-sistema" | "erro";

export type EstadoDaNota =
  | "nao-pedida"
  | "pendente" // pedida, ainda não criada no /sistema
  | "gerada" // criada no /sistema, ainda não foi para a Sefaz
  | "enviada" // na Sefaz, esperando o retorno
  | "autorizada"
  | "rejeitada"
  | "cancelada"
  | "erro";

export interface NotaDaVenda {
  estado: EstadoDaNota;
  /** id da nota no /sistema */
  notaId: number | null;
  numero: string | null;
  serie: string | null;
  chave: string | null;
  /** link público (assinado) do DANFE em PDF — é o que o QR do cupom abre */
  linkDanfe: string | null;
  mensagem: string | null;
  atualizadaEm: string | null;
}

export interface VendaDoPdv {
  id: string; // PDV-AAMMDD-XXXX
  criadaEm: string; // ISO
  dia: string; // AAAA-MM-DD, relógio de Campinas
  operador: string; // quem estava logado (painel ou balcão)
  vendedor: { id: string; nome: string } | null; // vendedor do /sistema
  cliente: ClienteDaVenda;
  tabela: Tabela;
  itens: ItemDaVenda[];
  desconto: Desconto | null;
  pagamentos: Pagamento[];
  subtotal: number;
  valorDoDesconto: number;
  total: number;
  troco: number;
  observacao: string;
  pedirNota: boolean;
  sistema: {
    estado: EstadoNoSistema;
    /** id da venda no /sistema */
    vendaId: number | null;
    numero: string | null;
    tentativas: number;
    ultimaTentativa: string | null;
    mensagem: string | null;
  };
  /** venda feita antes de 22/10/2026, quando o PDV mandava para o Bling */
  legadoBling?: { pedidoId: string | null; numero: string | null } | null;
  nota: NotaDaVenda;
  cancelada?: boolean;
}

/** Uma linha da lista "vendas do dia": do PDV, do /sistema, ou dos dois. */
export interface LinhaDoDia {
  chave: string; // id do PDV ou "sistema-<id>"
  origem: "pdv" | "sistema";
  pdvId: string | null;
  vendaId: number | null;
  numero: string | null;
  hora: string | null; // HH:MM
  cliente: string;
  vendedor: string | null;
  total: number;
  situacao: string; // texto para a tela
  estadoNoSistema: EstadoNoSistema;
  nota: { estado: EstadoDaNota; numero: string | null; linkDanfe: string | null } | null;
  cancelada: boolean;
}

export const CLIENTE_VAZIO: ClienteDaVenda = {
  nome: "",
  documento: "",
  email: "",
  telefone: "",
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
  sistemaId: null,
};

export const NOTA_NAO_PEDIDA: NotaDaVenda = {
  estado: "nao-pedida",
  notaId: null,
  numero: null,
  serie: null,
  chave: null,
  linkDanfe: null,
  mensagem: null,
  atualizadaEm: null,
};

/** Situação da nota no /sistema (NotaFiscal.situacao) → estado do balcão. */
export function estadoDaNotaNoSistema(situacao: string | null | undefined): EstadoDaNota {
  switch (String(situacao || "").toUpperCase()) {
    case "AUTORIZADA":
      return "autorizada";
    case "PROCESSANDO":
      return "enviada";
    case "PENDENTE":
      return "gerada";
    case "REJEITADA":
    case "DENEGADA":
      return "rejeitada";
    case "CANCELADA":
    case "INUTILIZADA":
      return "cancelada";
    case "ERRO":
      return "erro";
    default:
      return "gerada";
  }
}
