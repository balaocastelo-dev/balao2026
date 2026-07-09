import { SITE_CONFIG } from "@/lib/config";

export type Neighborhood = {
  slug: string;
  name: string;
  region: string;
  description: string;
  landmarks: string[];
  nearbyNeighborhoods: string[];
  distanceFromStore: string;
  mainServices: string[];
  localKeywords: string[];
};

export const CAMPINAS_NEIGHBORHOODS: Neighborhood[] = [
  {
    slug: "cambui",
    name: "Cambuí",
    region: "Região Central",
    description:
      "O Cambuí é um dos bairros mais tradicionais e valorizados de Campinas. Com infraestrutura completa, ruas arborizadas e alta concentração de comércios, restaurantes e serviços, é referência em qualidade de vida no interior paulista. A Balão da Informática atende o Cambuí com loja física na Av. Anchieta, assistência técnica, venda de PCs, notebooks e periféricos.",
    landmarks: [
      "Via Norte-Sul",
      "Centro de Convivência",
      "Lagoa do Taquaral",
      "Av. Júlio de Mesquita",
      "Rua Maria Monteiro",
    ],
    nearbyNeighborhoods: ["Centro", "Bosque", "Taquaral", "Guanabara", "Nova Campinas"],
    distanceFromStore: "Loja física no bairro",
    mainServices: [
      "Assistência técnica de computadores",
      "Conserto de notebooks",
      "Venda de PC Gamer",
      "Periféricos e acessórios",
      "Upgrade de SSD e memória",
    ],
    localKeywords: [
      "informática no Cambuí",
      "loja de computador Cambuí Campinas",
      "assistência técnica Cambuí",
      "conserto notebook Cambuí",
      "PC Gamer Cambuí",
      "peças de informática Cambuí",
      "upgrade SSD Cambuí",
      "manutenção computador Cambuí",
    ],
  },
  {
    slug: "centro",
    name: "Centro",
    region: "Região Central",
    description:
      "O Centro de Campinas é o coração comercial e cultural da cidade. Com mistura de tradição e modernidade, abriga escritórios, bancos, shoppings e pontos históricos. A Balão da Informática atende o Centro com atendimento rápido, venda de equipamentos e assistência técnica para empresas e residências.",
    landmarks: [
      "Catedral Metropolitana",
      "Mercado Municipal",
      "Rua Barão de Jaguara",
      "Av. Francisco Glicerio",
      "Estação Cultura",
    ],
    nearbyNeighborhoods: ["Cambuí", "Bosque", "Vila Itapura", "Guanabara"],
    distanceFromStore: "5 minutos de carro",
    mainServices: [
      "Assistência técnica para empresas",
      "Venda de notebooks corporativos",
      "Suporte de TI",
      "Impressoras e tonners",
      "Licenças Microsoft",
    ],
    localKeywords: [
      "informática Centro Campinas",
      "loja de computador Centro",
      "assistência técnica Centro Campinas",
      "notebook corporativo Centro",
      "suporte TI Centro Campinas",
      "impressora Centro Campinas",
    ],
  },
  {
    slug: "bosque",
    name: "Bosque",
    region: "Região Central",
    description:
      "O Bosque é um bairro residencial tranquilo e arborizado, localizado entre o Cambuí e o Centro de Campinas. Com boa infraestrutura e fácil acesso, é ideal para quem busca qualidade de vida perto de tudo. A Balão da Informática atende o bairro com loja física próxima e atendimento por WhatsApp.",
    landmarks: [
      "Bosque dos Jequitibás",
      "Rua Dr. Moraes Sales",
      "Av. Heitor Penteado",
      "Parque Taquaral",
    ],
    nearbyNeighborhoods: ["Cambuí", "Centro", "Vila Itapura"],
    distanceFromStore: "3 minutos de carro",
    mainServices: [
      "Conserto de notebooks",
      "Venda de PCs e periféricos",
      "Manutenção de computadores",
      "Recuperação de dados",
    ],
    localKeywords: [
      "informática Bosque Campinas",
      "loja de computador Bosque",
      "conserto notebook Bosque",
      "assistência técnica Bosque",
    ],
  },
  {
    slug: "taquaral",
    name: "Taquaral",
    region: "Região Central",
    description:
      "O Taquaral é uma região nobre de Campinas, conhecida pela Lagoa do Taquaral, parques e alta qualidade de vida. Com condomínios de alto padrão e excelente infraestrutura, é um dos endereços mais valorizados da cidade. A Balão da Informática atende o Taquaral com atendimento personalizado e entrega rápida.",
    landmarks: [
      "Lagoa do Taquaral",
      "Parque Taquaral",
      "Centro de Convivência",
      "Av. Moraes Sales",
    ],
    nearbyNeighborhoods: ["Cambuí", "Barão Geraldo", "Nova Campinas"],
    distanceFromStore: "5 minutos de carro",
    mainServices: [
      "PC Gamer de alto desempenho",
      "Workstations profissionais",
      "Upgrade de hardware",
      "Consultoria em TI",
    ],
    localKeywords: [
      "informática Taquaral Campinas",
      "PC Gamer Taquaral",
      "loja de computador Taquaral",
      "assistência técnica Taquaral",
      "workstation Taquaral",
    ],
  },
  {
    slug: "guanabara",
    name: "Guanabara",
    region: "Região Central",
    description:
      "O Guanabara é um bairro comercial e residencial bem localizado, com fácil acesso às principais vias de Campinas. Possui grande concentração de lojas, supermercados e serviços. A Balão da Informática atende o Guanabara com venda de equipamentos e assistência técnica.",
    landmarks: [
      "Shopping Iguatemi",
      "Av. Norte-Sul",
      "Rua Siqueira Campos",
      "Supermercado Guanabara",
    ],
    nearbyNeighborhoods: ["Cambuí", "Centro", "Jardim Chapadão", "Taquaral"],
    distanceFromStore: "4 minutos de carro",
    mainServices: [
      "Venda de notebooks",
      "Periféricos gamer",
      "Assistência técnica",
      "Carregadores e acessórios",
    ],
    localKeywords: [
      "informática Guanabara Campinas",
      "loja de computador Guanabara",
      "notebook Guanabara",
      "assistência técnica Guanabara",
    ],
  },
  {
    slug: "castelo",
    name: "Castelo",
    region: "Região Norte",
    description:
      "O Castelo é um bairro residencial da zona norte de Campinas, com crescimento acelerado e boa infraestrutura. Fica próximo à Av. Anchieta, onde está localizada a loja da Balão da Informática. Atendimento rápido para moradores do bairro e região.",
    landmarks: [
      "Av. Anchieta",
      "Rua José Paulino",
      "Shopping Castelo",
      "Parque Castelo",
    ],
    nearbyNeighborhoods: ["Cambuí", "Jardim Chapadão", "Jardim Aurora", "Nova Campinas"],
    distanceFromStore: "Loja física no bairro",
    mainServices: [
      "Venda de PCs e notebooks",
      "Assistência técnica",
      "Upgrade de hardware",
      "Periféricos e acessórios",
    ],
    localKeywords: [
      "informática Castelo Campinas",
      "loja de computador Castelo",
      "assistência técnica Castelo",
      "notebook Castelo",
      "PC Gamer Castelo",
    ],
  },
  {
    slug: "nova-campinas",
    name: "Nova Campinas",
    region: "Região Central",
    description:
      "Nova Campinas é uma região em desenvolvimento com condomínios residenciais e comercial em expansão. Localizada entre o Cambuí e o Chapadão, oferece boa infraestrutura e acesso facilitado. A Balão da Informática atende Nova Campinas com entrega rápida e suporte técnico.",
    landmarks: [
      "Av. Dr. Moraes Sales",
      "Rua Oscar Freire",
      "Shopping Nova Campinas",
    ],
    nearbyNeighborhoods: ["Cambuí", "Castelo", "Jardim Chapadão", "Taquaral"],
    distanceFromStore: "5 minutos de carro",
    mainServices: [
      "Venda de notebooks e PCs",
      "Assistência técnica",
      "Manutenção preventiva",
      "Upgrade de SSD e memória",
    ],
    localKeywords: [
      "informática Nova Campinas",
      "loja de computador Nova Campinas",
      "assistência técnica Nova Campinas",
      "notebook Nova Campinas",
    ],
  },
  {
    slug: "jardim-planalto",
    name: "Jardim Planalto",
    region: "Região Central",
    description:
      "O Jardim Planalto é um bairro residencial tranquilo, com ruas arborizadas e boa qualidade de vida. Próximo ao Cambuí e ao Centro, é ideal para quem busca acesso rápido aos principais pontos da cidade. A Balão da Informática atende a região com atendimento personalizado.",
    landmarks: [
      "Av. Júlio de Mesquita",
      "Rua Rio de Janeiro",
      "Parque Planalto",
    ],
    nearbyNeighborhoods: ["Cambuí", "Centro", "Bosque", "Vila Itapura"],
    distanceFromStore: "4 minutos de carro",
    mainServices: [
      "Conserto de notebooks",
      "Venda de PCs",
      "Suporte técnico",
      "Periféricos",
    ],
    localKeywords: [
      "informática Jardim Planalto Campinas",
      "loja de computador Jardim Planalto",
      "conserto notebook Jardim Planalto",
    ],
  },
  {
    slug: "barao-geraldo",
    name: "Barão Geraldo",
    region: "Região Norte",
    description:
      "Barão Geraldo é um dos distritos mais importantes de Campinas, sede da Unicamp e polo tecnológico. Com grande demanda por soluções de TI, é uma região estratégica para a Balão da Informática atender empresas, estudantes e profissionais de tecnologia.",
    landmarks: [
      "Unicamp",
      "Rodovia SP-340",
      "Shopping Barão",
      "Av. Vital Brazil",
    ],
    nearbyNeighborhoods: ["Taquaral", "Jardim Santa Mônica", "Jardim São Marcos"],
    distanceFromStore: "15 minutos de carro",
    mainServices: [
      "Workstations para pesquisadores",
      "PC Gamer para estudantes",
      "Notebooks acadêmicos",
      "Suporte técnico para empresas",
    ],
    localKeywords: [
      "informática Barão Geraldo",
      "loja de computador Barão Geraldo",
      "PC Gamer Barão Geraldo",
      "notebook Barão Geraldo",
      "assistência técnica Barão Geraldo",
      "loja de informática Unicamp",
    ],
  },
  {
    slug: "chapadao",
    name: "Jardim Chapadão",
    region: "Região Norte",
    description:
      "O Jardim Chapadão é um bairro residencial de grande porte na zona norte de Campinas. Com intensa atividade comercial e fácil acesso, é uma das regiões mais movimentadas da cidade. A Balão da Informática atende o Chapadão com atendimento rápido e entrega na região.",
    landmarks: [
      "Av. Dr. Moraes Sales",
      "Rua Augusto Storniolo",
      "Shopping Pátio Chapadão",
    ],
    nearbyNeighborhoods: ["Guanabara", "Jardim Aurora", "Castelo", "Nova Campinas"],
    distanceFromStore: "8 minutos de carro",
    mainServices: [
      "Venda de notebooks",
      "Assistência técnica",
      "Periféricos e acessórios",
      "Carregadores e cabos",
    ],
    localKeywords: [
      "informática Chapadão Campinas",
      "loja de computador Chapadão",
      "notebook Chapadão",
      "assistência técnica Chapadão",
    ],
  },
];

export function getNeighborhoodBySlug(slug: string): Neighborhood | undefined {
  return CAMPINAS_NEIGHBORHOODS.find((n) => n.slug === slug);
}

export function getAllNeighborhoodSlugs(): string[] {
  return CAMPINAS_NEIGHBORHOODS.map((n) => n.slug);
}

export function getNeighborhoodWhatsAppUrl(neighborhood: Neighborhood): string {
  const message = `Olá! Vim pelo site e quero atendimento da Balão da Informática para a região do ${neighborhood.name} em Campinas.`;
  return `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(message)}`;
}
