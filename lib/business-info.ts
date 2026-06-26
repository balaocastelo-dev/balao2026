/**
 * Fonte única de dados oficiais da unidade Balão da Informática Castelo.
 * Use sempre este arquivo para exibir informações de contato, endereço,
 * horário de funcionamento e dados institucionais no site.
 */

export const BUSINESS_INFO = {
  /** Nome comercial da loja */
  name: "Balão da Informática Castelo",

  /** Razão social */
  legalName: "Balão da Informática Castelo",

  /** CNPJ */
  cnpj: "34.397.947/0001-08",

  /** Endereço completo formatado para exibição */
  address: "Av. Anchieta, 789 – Cambuí, Campinas – SP",

  /** Logradouro (para JSON-LD) */
  streetAddress: "Av. Anchieta, 789",

  /** Bairro */
  neighborhood: "Cambuí",

  /** Cidade */
  city: "Campinas",

  /** Estado (sigla) */
  state: "SP",

  /** CEP */
  postalCode: "13012-100",

  /** País */
  country: "BR",

  /** Telefone fixo — formato de exibição */
  phone: {
    display: "(19) 3255-1661",
    number: "551932551661",
    e164: "+55 19 3255-1661",
  },

  /** WhatsApp principal */
  whatsapp: {
    display: "(19) 98751-0267",
    number: "5519987510267",
    e164: "+55 19 98751-0267",
    /** Link direto com mensagem pré-preenchida */
    href: "https://wa.me/5519987510267?text=Ol%C3%A1%21%20Vim%20pelo%20site%20do%20Bal%C3%A3o%20da%20Inform%C3%A1tica%20Castelo%20e%20gostaria%20de%20atendimento.",
    /** Mensagem pré-preenchida (versão legível) */
    defaultMessage:
      "Olá! Vim pelo site do Balão da Informática Castelo e gostaria de atendimento.",
  },

  /** E-mail oficial */
  email: "balaocastelo@gmail.com",

  /** Site oficial */
  site: "https://www.balao.info",

  /** Horário de funcionamento da loja física */
  openingHours: {
    weekdays: "Segunda a sexta: 08h às 18h",
    saturday: "Sábado: 08h às 13h",
    /** Texto completo para exibição */
    full: "Seg. a Sex. das 08h às 18h | Sáb. das 08h às 13h",
    /** Formato ISO 8601 para JSON-LD */
    iso: ["Mo-Fr 08:00-18:00", "Sa 08:00-13:00"],
  },

  /** Atendimento via WhatsApp */
  whatsappSupport: "Atendimento via WhatsApp 24h por dia com agente de IA e atendimento humano.",

  /** Texto institucional curto */
  tagline:
    "Loja de informática em Campinas com especialidade em PCs Gamer, notebooks, assistência técnica e seminovos. Atendimento presencial e WhatsApp 24h.",

  /** Redes sociais */
  social: {
    instagram: "https://instagram.com/balaodainformatica",
    facebook: "https://facebook.com/balaodainformatica",
  },

  /** Área de atendimento */
  areaServed: [
    "Campinas",
    "Região Metropolitana de Campinas",
    "Sumaré",
    "Hortolândia",
    "Paulínia",
    "Valinhos",
    "Vinhedo",
    "Brasil",
  ],
} as const;

/** Atalho para o link do WhatsApp com mensagem padrão */
export const WA_HREF = BUSINESS_INFO.whatsapp.href;

/** Helper: gera link do WhatsApp com mensagem personalizada */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${BUSINESS_INFO.whatsapp.number}?text=${encodeURIComponent(message)}`;
}
