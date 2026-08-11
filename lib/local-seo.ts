import { SITE_CONFIG } from "@/lib/config";

export type RegionalCity = {
  slug: string;
  name: string;
  state: string;
  neighborhoods: string[];
};

export type RegionalService = {
  slug: string;
  shortName: string;
  headline: string;
  description: string;
  serviceType: string;
  hero: string;
  benefits: string[];
  problems: string[];
  faqs: { question: string; answer: string }[];
  primaryHref: string;
};

export const REGIONAL_CITIES: RegionalCity[] = [
  {
    slug: "campinas",
    name: "Campinas",
    state: "SP",
    neighborhoods: ["Cambuí", "Taquaral", "Castelo", "Barão Geraldo", "Nova Campinas", "Centro"],
  },
  {
    slug: "sumare",
    name: "Sumaré",
    state: "SP",
    neighborhoods: ["Centro", "Nova Veneza", "Maria Antonia", "Matão", "Jardim Denadai"],
  },
  {
    slug: "hortolandia",
    name: "Hortolândia",
    state: "SP",
    neighborhoods: ["Centro", "Jardim Amanda", "Rosolém", "Nova Europa", "Remanso Campineiro"],
  },
  {
    slug: "paulinia",
    name: "Paulínia",
    state: "SP",
    neighborhoods: ["Centro", "Betel", "João Aranha", "Morumbi", "Parque da Represa"],
  },
  {
    slug: "valinhos",
    name: "Valinhos",
    state: "SP",
    neighborhoods: ["Centro", "Vila Santana", "Jardim Pinheiros", "Paiquerê", "Parque Portugal"],
  },
  {
    slug: "vinhedo",
    name: "Vinhedo",
    state: "SP",
    neighborhoods: ["Centro", "Capela", "Jardim Itália", "Nova Vinhedo", "Marambaia"],
  },
];

export const REGIONAL_SERVICES: RegionalService[] = [
  {
    slug: "assistencia-tecnica",
    shortName: "Assistência Técnica",
    headline: "Assistência técnica para computadores e notebooks",
    description: "Diagnóstico, conserto, limpeza, upgrade e recuperação de desempenho para PCs e notebooks.",
    serviceType: "Assistência técnica de computadores e notebooks",
    hero: "Seu computador ou notebook parou, ficou lento ou começou a falhar? Nossa equipe atende com laboratório próprio, diagnóstico rápido e suporte real.",
    benefits: [
      "Diagnóstico ágil por técnicos especializados",
      "Serviço com garantia e suporte pós-venda",
      "Atendimento para clientes residenciais e empresas",
      "Retirada na loja ou envio de equipamentos",
    ],
    problems: [
      "Notebook não liga ou não carrega",
      "PC travando, lento ou reiniciando",
      "Superaquecimento e barulho excessivo",
      "Troca de SSD, memória, tela ou teclado",
    ],
    faqs: [
      {
        question: "Quanto tempo leva o diagnóstico?",
        answer: "Na maior parte dos casos, o diagnóstico é feito em até 24 horas úteis.",
      },
      {
        question: "Vocês fazem orçamento antes do reparo?",
        answer: "Sim. O equipamento é analisado e o reparo só é iniciado após sua aprovação.",
      },
      {
        question: "Tem garantia?",
        answer: "Sim. O serviço e as peças substituídas contam com garantia legal, com suporte da equipe.",
      },
    ],
    primaryHref: "/manutencao",
  },
  {
    slug: "conserto-notebook",
    shortName: "Conserto de Notebook",
    headline: "Conserto de notebook com foco em agilidade e custo-benefício",
    description: "Troca de tela, carcaça, teclado, bateria, reparo de placa e upgrades para notebooks de trabalho, estudo e uso profissional.",
    serviceType: "Conserto de notebook",
    hero: "Atendemos notebooks que não ligam, esquentam, travam ou sofreram queda. O objetivo é colocar o equipamento de volta ao trabalho o mais rápido possível.",
    benefits: [
      "Peças e upgrades instalados com segurança",
      "Atendimento para linhas Dell, Lenovo, Acer, Asus, Samsung e Apple",
      "Suporte para notebooks corporativos e domésticos",
      "Opções de upgrade para ganhar velocidade sem trocar de máquina",
    ],
    problems: [
      "Tela quebrada ou sem imagem",
      "Teclado e touchpad com falha",
      "Bateria fraca ou notebook desligando sozinho",
      "Carcaça, dobradiça e conector de energia danificados",
    ],
    faqs: [
      {
        question: "Vale a pena consertar notebook antigo?",
        answer: "Em muitos casos sim, principalmente quando o reparo envolve SSD, memória, tela ou bateria e o restante da máquina ainda está saudável.",
      },
      {
        question: "Vocês fazem upgrade de SSD e memória?",
        answer: "Sim. Avaliamos compatibilidade e instalamos upgrades para melhorar velocidade e vida útil do notebook.",
      },
      {
        question: "A troca de tela é feita com garantia?",
        answer: "Sim. A substituição e a mão de obra são entregues com garantia.",
      },
    ],
    primaryHref: "/notebooks",
  },
  {
    slug: "pc-gamer",
    shortName: "PC Gamer",
    headline: "PC Gamer, upgrade e montagem profissional",
    description: "Montagem, upgrade, limpeza e otimização para setups gamer, stream e estações de alto desempenho.",
    serviceType: "Montagem e upgrade de PC Gamer",
    hero: "Se você quer vender, montar ou ajustar um setup gamer de verdade, precisa de páginas que capturem intenção e atendimento rápido. Esta é a vitrine para isso.",
    benefits: [
      "Consultoria para configuração ideal por faixa de uso",
      "Montagem com testes, ajuste térmico e acabamento profissional",
      "Upgrade de placa de vídeo, fonte, SSD e memória",
      "Atendimento para gamer, stream e workstation",
    ],
    problems: [
      "PC Gamer esquentando ou desligando",
      "Queda de FPS e gargalos no setup",
      "Dúvida sobre compatibilidade de peças",
      "Necessidade de montar um setup pronto para jogar",
    ],
    faqs: [
      {
        question: "Vocês montam PC Gamer completo?",
        answer: "Sim. A equipe monta, testa e entrega o setup pronto para uso com orientação na escolha das peças.",
      },
      {
        question: "Posso fazer upgrade no meu PC atual?",
        answer: "Sim. Avaliamos compatibilidade e sugerimos upgrades com melhor custo-benefício.",
      },
      {
        question: "O PC sai testado?",
        answer: "Sim. Os equipamentos passam por testes de estabilidade e validação térmica antes da entrega.",
      },
    ],
    primaryHref: "/pcgamer",
  },
  {
    slug: "reparo-apple",
    shortName: "Reparo Apple",
    headline: "Reparo Apple para iPhone, iPad, MacBook e iMac",
    description: "Atendimento para linha Apple com foco em reparo, diagnóstico, troca de tela, bateria e manutenção avançada.",
    serviceType: "Reparo Apple",
    hero: "Quem procura reparo Apple na região geralmente quer rapidez, transparência e alguém que realmente entenda do equipamento. É isso que esta página entrega.",
    benefits: [
      "Atendimento especializado para linha Apple",
      "Diagnóstico claro e aprovação antes do serviço",
      "Suporte para iPhone, iPad, MacBook e iMac",
      "Atendimento local com WhatsApp direto",
    ],
    problems: [
      "Tela de iPhone quebrada",
      "MacBook sem ligar ou aquecendo",
      "Troca de bateria e conectores",
      "iPad com vidro, touch ou carga com defeito",
    ],
    faqs: [
      {
        question: "Vocês atendem só iPhone?",
        answer: "Não. Também atendemos iPad, MacBook, iMac e outros equipamentos Apple conforme o defeito.",
      },
      {
        question: "O reparo é aprovado antes?",
        answer: "Sim. Após o diagnóstico, o orçamento é apresentado antes de iniciar o serviço.",
      },
      {
        question: "Atendem equipamentos molhados ou sem ligar?",
        answer: "Sim. Esses casos passam por análise específica para verificar chance de recuperação e custo do reparo.",
      },
    ],
    primaryHref: "/reparoapple",
  },
];

export function getRegionalCity(citySlug: string) {
  return REGIONAL_CITIES.find((city) => city.slug === citySlug);
}

export function getRegionalService(serviceSlug: string) {
  return REGIONAL_SERVICES.find((service) => service.slug === serviceSlug);
}

export function buildRegionalServicePath(citySlug: string, serviceSlug: string) {
  return `/regiao/${citySlug}/${serviceSlug}`;
}

export function buildRegionalWhatsAppMessage(cityName: string, serviceHeadline: string) {
  return `Olá! Quero atendimento para ${serviceHeadline.toLowerCase()} em ${cityName}. Pode me ajudar?`;
}

export function buildRegionalWhatsAppUrl(cityName: string, serviceHeadline: string) {
  return `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
    buildRegionalWhatsAppMessage(cityName, serviceHeadline)
  )}`;
}
