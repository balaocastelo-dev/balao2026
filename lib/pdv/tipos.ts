// ============================================================
// PDV (www.balao.info/pdv): os tipos que o balcão, a API e o Bling dividem.
//
// Pedido do Thiago (12/10/2026): produtos só do site; do Bling vêm os
// vendedores, as vendas e a nota fiscal. Venda feita aqui vai para o Bling na
// hora; venda feita no Bling aparece aqui. Ver docs/pdv.md.
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
  /** id do contato no Bling, quando já existe lá. */
  blingId?: string | null;
}

export interface Desconto {
  tipo: "valor" | "percentual";
  valor: number;
}

/** Situação da venda no caminho até o Bling. */
export type EstadoNoBling = "pendente" | "enviando" | "no-bling" | "erro";

export type EstadoDaNota =
  | "nao-pedida"
  | "pendente" // pedida, ainda não gerada no Bling
  | "gerada" // existe no Bling, ainda não foi para a Sefaz
  | "enviada" // na Sefaz, esperando o retorno
  | "autorizada"
  | "rejeitada"
  | "cancelada"
  | "erro";

export interface NotaDaVenda {
  estado: EstadoDaNota;
  blingId: string | null;
  numero: string | null;
  serie: string | null;
  chave: string | null;
  linkDanfe: string | null;
  linkPdf: string | null;
  mensagem: string | null;
  atualizadaEm: string | null;
}

export interface VendaDoPdv {
  id: string; // PDV-AAMMDD-XXXX
  criadaEm: string; // ISO
  dia: string; // AAAA-MM-DD, relógio de Campinas
  operador: string; // quem estava logado (painel ou balcão)
  vendedor: { id: string; nome: string } | null; // vendedor do Bling
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
  bling: {
    estado: EstadoNoBling;
    pedidoId: string | null;
    numero: string | null;
    contatoId: string | null;
    tentativas: number;
    ultimaTentativa: string | null;
    mensagem: string | null;
  };
  nota: NotaDaVenda;
  cancelada?: boolean;
}

/** Uma linha da lista "vendas do dia": do PDV, do Bling, ou dos dois. */
export interface LinhaDoDia {
  chave: string; // id do PDV ou "bling-<id>"
  origem: "pdv" | "bling";
  pdvId: string | null;
  blingId: string | null;
  numero: string | null;
  hora: string | null; // HH:MM (só as do PDV têm hora)
  cliente: string;
  vendedor: string | null;
  total: number;
  situacao: string; // texto para a tela
  situacaoId: number | null;
  estadoNoBling: EstadoNoBling;
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
  blingId: null,
};

export const NOTA_NAO_PEDIDA: NotaDaVenda = {
  estado: "nao-pedida",
  blingId: null,
  numero: null,
  serie: null,
  chave: null,
  linkDanfe: null,
  linkPdf: null,
  mensagem: null,
  atualizadaEm: null,
};

/** Situações de pedido da conta do Balão (módulo 98310), conferidas em 15/09. */
export const SITUACOES_DO_PEDIDO: Record<number, string> = {
  6: "Em aberto",
  9: "Atendido",
  12: "Cancelado",
  15: "Em andamento",
  18: "Venda agenciada",
  21: "Em digitação",
  24: "Verificado",
  32597: "Aguardando estorno",
  32598: "Estornado",
};

export const SITUACOES_CANCELADAS = new Set([12, 32597, 32598]);

/** Situações de NF-e do Bling. */
export function estadoDaNotaNoBling(situacao: number | null | undefined): EstadoDaNota {
  switch (Number(situacao)) {
    case 5:
    case 6:
    case 7:
      return "autorizada";
    case 2:
      return "cancelada";
    case 4:
    case 9:
      return "rejeitada";
    case 3:
    case 8:
    case 10:
      return "enviada";
    case 1:
    case 0:
      return "gerada";
    default:
      return "gerada";
  }
}
