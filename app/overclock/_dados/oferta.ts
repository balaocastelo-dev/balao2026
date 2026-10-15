/**
 * Os números da página de vendas do Overclock (www.balao.info/overclock).
 *
 * Tudo o que aparece como preço, prazo ou resultado sai daqui — a página, o
 * JSON-LD e a calculadora leem a mesma fonte. Mudou o preço? Muda só aqui.
 */

/** WhatsApp de vendas do Overclock (é o WhatsApp do Balão, que vende o produto). */
export const WHATSAPP_VENDAS = "5519987510267";

export function linkWhatsAppVendas(mensagem: string) {
  return `https://wa.me/${WHATSAPP_VENDAS}?text=${encodeURIComponent(mensagem)}`;
}

export const LINK_QUERO = linkWhatsAppVendas(
  "Olá! Vi o Overclock em balao.info/overclock e quero saber mais para a minha loja.",
);

export const LINK_DEMONSTRACAO = linkWhatsAppVendas(
  "Olá! Vi o Overclock em balao.info/overclock e quero agendar uma demonstração ao vivo.",
);

export type FormaDePagamento = {
  id: "avista" | "cartao" | "boleto";
  nome: string;
  /** O preço por extenso, numa linha (usado no JSON-LD). */
  destaque: string;
  /** Linha pequena acima do valor no cartão ("12× de"). */
  prefixo?: string;
  /** Valor grande do cartão. */
  valor: string;
  /** Linha de baixo (como paga e quanto dá no total). */
  detalhe: string;
  /** Total pago, em reais. */
  total: number;
  parcelas: number;
  valorParcela: number;
  observacao?: string;
};

export const FORMAS_DE_PAGAMENTO: FormaDePagamento[] = [
  {
    id: "avista",
    nome: "À vista",
    destaque: "R$ 49.999,99",
    valor: "R$ 49.999,99",
    detalhe: "No PIX ou transferência",
    total: 49999.99,
    parcelas: 1,
    valorParcela: 49999.99,
  },
  {
    id: "cartao",
    nome: "Cartão de crédito",
    destaque: "12× de R$ 4.999,99",
    prefixo: "12× de",
    valor: "R$ 4.999,99",
    detalhe: "Total de R$ 59.999,88",
    total: 59999.88,
    parcelas: 12,
    valorParcela: 4999.99,
  },
  {
    id: "boleto",
    nome: "Boleto",
    destaque: "12× de R$ 9.999,99",
    prefixo: "12× de",
    valor: "R$ 9.999,99",
    detalhe: "Entrada + 11 boletos. Total de R$ 119.999,88",
    total: 119999.88,
    parcelas: 12,
    valorParcela: 9999.99,
    observacao: "Sujeito a análise",
  },
];

export const INCLUIDO_EM_TODOS = [
  "Instalação acompanhada: a gente instala junto com você, pela tela de configuração",
  "90 dias de suporte",
  "12 meses de atualizações",
  "Código entregue no GitHub da sua loja",
  "Licença de uso para 1 loja (um CNPJ), sem revenda",
];

/**
 * O caso real, das faturas do Google Ads da loja Balão da Informática.
 * Não arredondar para cima nem trocar estes números.
 */
export const CASO_GOOGLE_ADS = {
  maiorMes: 5231, // out/2025
  maiorMesRotulo: "out/2025",
  mediaDiaMaiorMes: 169,
  mediaDiaPeriodo: 104, // abr/2025 a fev/2026
  mediaMesPeriodo: 3100, // ~R$ 3,1 mil
  totalInvestido: 52000, // "mais de R$ 52 mil"
  semAnuncioDesde: "março de 2026",
};
