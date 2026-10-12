// ============================================================
// Entregas por motoboy (99Entrega) — os tipos.
//
// Pedido do Thiago (12/10/2026): chamar motoboy da 99 a partir do site para
// entregar os pedidos. A API da 99 só é liberada para conta da 99 Empresas,
// com token pedido por e-mail (api-suporte@99app.com). Enquanto o token não
// chega, o módulo roda no modo "simulado": cotação calculada aqui, corrida de
// mentira, nada sai para a 99 nem para o cliente.
// ============================================================

/** De onde vem a cotação e quem cria a corrida. */
export type ModoDaEntrega = "simulado" | "real";

export type VeiculoDaEntrega = "moto" | "carro";

export interface Endereco {
  cep: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
}

export interface PedidoDeCotacao {
  destino: Endereco;
  /** Valor dos produtos (sem frete), em reais. A 99 limita o valor declarado. */
  valorDosProdutos: number;
  veiculo?: VeiculoDaEntrega;
}

export interface Cotacao {
  modo: ModoDaEntrega;
  veiculo: VeiculoDaEntrega;
  /** Preço que a loja paga à 99, em reais. */
  preco: number;
  /** Minutos até o entregador chegar no destino, estimados. */
  minutos: number;
  /** Distância em linha reta (simulado) ou a que a 99 informar. */
  distanciaKm: number | null;
  /** true quando a distância foi chutada por falta de coordenada do CEP. */
  distanciaEstimada: boolean;
}

/** A resposta que o carrinho e o painel recebem. */
export type ResultadoDaCotacao =
  | { disponivel: true; cotacao: Cotacao }
  | { disponivel: false; motivo: string };

export type SituacaoDaEntrega =
  | "solicitada" // pedimos à 99, ainda sem entregador
  | "a_caminho_da_loja" // entregador aceitou e vem buscar
  | "coletada" // saiu da loja
  | "entregue"
  | "cancelada"
  | "falhou";

export interface MudancaDeSituacao {
  situacao: SituacaoDaEntrega;
  em: string;
  observacao?: string;
}

export interface Entrega {
  /** Id nosso (ent_…). */
  id: string;
  /** Id da corrida na 99 (no simulado, "sim_…"). */
  idNaParceira: string;
  modo: ModoDaEntrega;
  pedidoId: string;
  cliente: { nome: string; whatsapp: string };
  destino: Endereco;
  valorDosProdutos: number;
  veiculo: VeiculoDaEntrega;
  preco: number;
  situacao: SituacaoDaEntrega;
  historico: MudancaDeSituacao[];
  /** Código que o cliente informa ao entregador (a 99 manda por SMS). */
  codigoDeVerificacao?: string;
  linkDeAcompanhamento?: string;
  entregador?: { nome?: string; placa?: string; telefone?: string };
  criadaEm: string;
  atualizadaEm: string;
}

/** O que cada parceira de entrega precisa saber fazer. */
export interface ProvedorDeEntrega {
  modo: ModoDaEntrega;
  cotar(pedido: PedidoDeCotacao): Promise<Cotacao>;
  criar(dados: {
    pedidoId: string;
    destino: Endereco;
    valorDosProdutos: number;
    veiculo: VeiculoDaEntrega;
    cliente: { nome: string; whatsapp: string };
  }): Promise<{ idNaParceira: string; preco: number; codigoDeVerificacao?: string; linkDeAcompanhamento?: string }>;
  cancelar(idNaParceira: string): Promise<void>;
}
