export type LeadIntent = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  urgency: string;
  city: string;
  serviceLabel: string;
  primaryHref: string;
  problems: string[];
  faqs: { question: string; answer: string }[];
};

export const LEAD_INTENTS: LeadIntent[] = [
  {
    slug: "notebook-nao-liga-campinas",
    title: "Notebook não liga em Campinas",
    shortTitle: "Notebook não liga",
    description:
      "Página para captar quem está procurando assistência urgente para notebook que não liga, não carrega ou desliga sozinho em Campinas.",
    urgency:
      "Se o notebook não liga, cada hora parada pode significar trabalho perdido, aula atrasada ou prejuízo. O objetivo desta página é gerar contato rápido.",
    city: "Campinas",
    serviceLabel: "Conserto de Notebook",
    primaryHref: "/manutencao",
    problems: [
      "Notebook sem sinal de energia",
      "Bateria não carrega",
      "Luz acende mas não dá imagem",
      "Desliga sozinho depois de alguns minutos",
    ],
    faqs: [
      {
        question: "Notebook que não liga tem conserto?",
        answer: "Na maior parte dos casos sim. O reparo pode envolver fonte, conector, bateria, tela, memória ou placa.",
      },
      {
        question: "Vocês fazem diagnóstico rápido?",
        answer: "Sim. O foco é entender a causa e já passar uma direção de reparo o quanto antes.",
      },
    ],
  },
  {
    slug: "pc-lento-campinas",
    title: "PC lento em Campinas",
    shortTitle: "PC lento",
    description:
      "Página para captar buscas de urgência relacionadas a computador travando, demorando para abrir e prejudicando produtividade ou vendas.",
    urgency:
      "Muita gente procura solução para PC lento quando já perdeu tempo demais. Essa é uma busca quente e com chance alta de conversão.",
    city: "Campinas",
    serviceLabel: "Otimização e Upgrade",
    primaryHref: "/manutencao",
    problems: [
      "Computador demora para ligar",
      "Sistema trava com frequência",
      "HD antigo deixando tudo lento",
      "Máquina sem memória suficiente para trabalhar",
    ],
    faqs: [
      {
        question: "Trocar para SSD resolve lentidão?",
        answer: "Em muitos casos sim. A troca de HD por SSD costuma gerar uma melhora grande no tempo de abertura e uso do sistema.",
      },
      {
        question: "Preciso formatar?",
        answer: "Nem sempre. Primeiro avaliamos se o ganho vem de upgrade, limpeza, correção de software ou ambos.",
      },
    ],
  },
  {
    slug: "ps5-superaquecendo-campinas",
    title: "PS5 superaquecendo em Campinas",
    shortTitle: "PS5 superaquecendo",
    description:
      "Capta quem está com console esquentando, desligando ou com sujeira interna e procura assistência na região de Campinas.",
    urgency:
      "Quando o PS5 começa a superaquecer, o cliente quer resolver rápido antes de perder o aparelho ou ficar sem jogar.",
    city: "Campinas",
    serviceLabel: "Assistência em Games",
    primaryHref: "/assistenciagames",
    problems: [
      "PS5 esquentando demais",
      "Console desligando sozinho",
      "Barulho forte na ventilação",
      "Necessidade de limpeza e troca térmica",
    ],
    faqs: [
      {
        question: "Superaquecimento pode danificar o console?",
        answer: "Sim. O ideal é parar de usar até o equipamento ser avaliado para evitar dano maior.",
      },
      {
        question: "Vocês limpam e trocam material térmico?",
        answer: "Sim. Esse é um dos serviços mais procurados para consoles com aquecimento anormal.",
      },
    ],
  },
  {
    slug: "iphone-tela-quebrada-campinas",
    title: "iPhone com tela quebrada em Campinas",
    shortTitle: "Tela quebrada de iPhone",
    description:
      "Página para captar urgência de iPhone com tela quebrada, touch falhando ou vidro trincado em Campinas.",
    urgency:
      "Quem quebra a tela do iPhone normalmente busca solução no mesmo dia. Essa é uma das buscas mais quentes para reparo Apple.",
    city: "Campinas",
    serviceLabel: "Reparo Apple",
    primaryHref: "/reparoapple",
    problems: [
      "Tela trincada ou sem imagem",
      "Touch falhando",
      "iPhone com risco de piorar o dano",
      "Necessidade de orçamento rápido",
    ],
    faqs: [
      {
        question: "Tela quebrada piora se continuar usando?",
        answer: "Pode piorar sim, principalmente se houver dano em touch, display ou infiltração de umidade.",
      },
      {
        question: "Vocês passam orçamento antes?",
        answer: "Sim. O reparo só segue após análise e aprovação.",
      },
    ],
  },
];

export function getLeadIntent(slug: string) {
  return LEAD_INTENTS.find((intent) => intent.slug === slug);
}
