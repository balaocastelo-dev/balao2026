// ============================================================
// Conteúdo da página /servicos-e-ofertas (pedido do Thiago em 12/10/2026:
// "um ímã de leads", bonita, rápida, bem preenchida e fácil de achar pelo
// Google e pelas IAs).
//
// Tudo o que a página afirma sobre a loja está aqui, num lugar só, para
// conferir e mudar sem mexer no desenho. Regra: só entra o que o Thiago já
// disse ou o que o site já anunciava (10% no Pix, 10x sem juros, tela de
// iPhone em até 3 horas, retirada no balcão). Preço de serviço não entra:
// o orçamento é sempre pelo WhatsApp.
// ============================================================

import { SITE_CONFIG } from "@/lib/config";

export const URL_DA_PAGINA = "https://www.balao.info/servicos-e-ofertas";

/** Etiqueta que vai no fim de toda mensagem, para o CRM saber de onde veio. */
export const ORIGEM = "(vim pela página Serviços e Ofertas do site)";

export function linkDoWhatsApp(mensagem: string): string {
  return `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(`${mensagem} ${ORIGEM}`)}`;
}

/** "O que você precisa?" — cada botão abre o WhatsApp já com o assunto. */
export interface Necessidade {
  id: string;
  rotulo: string;
  mensagem: string;
}

export const NECESSIDADES: Necessidade[] = [
  { id: "notebook", rotulo: "Consertar notebook", mensagem: "Olá! Meu notebook está com problema e quero um orçamento de conserto." },
  { id: "iphone", rotulo: "Tela ou bateria de iPhone", mensagem: "Olá! Quero orçar a troca de tela/bateria do meu iPhone." },
  { id: "pc-gamer", rotulo: "Montar PC gamer", mensagem: "Olá! Quero montar um PC gamer sob medida. Posso passar o que vou jogar e o meu orçamento?" },
  { id: "upgrade", rotulo: "Upgrade (SSD, memória, placa)", mensagem: "Olá! Quero fazer um upgrade no meu computador (SSD, memória ou placa de vídeo)." },
  { id: "dados", rotulo: "Recuperar arquivos", mensagem: "Olá! Perdi arquivos de um HD/SSD/pendrive e preciso recuperar." },
  { id: "console", rotulo: "Consertar videogame", mensagem: "Olá! Meu videogame está com defeito e quero um orçamento." },
  { id: "empresa", rotulo: "Suporte para empresa", mensagem: "Olá! Sou de uma empresa da região e quero suporte de TI / contrato de manutenção." },
  { id: "comprar", rotulo: "Comprar com desconto", mensagem: "Olá! Quero comprar um produto e saber o melhor preço no Pix e a disponibilidade." },
];

export interface Servico {
  id: string;
  titulo: string;
  /** Uma linha que diz o resultado para o cliente. */
  resumo: string;
  itens: string[];
  /** Página própria do serviço. */
  href: string;
  foto: string;
  fotoAlt: string;
  mensagem: string;
  /** Selo curto no canto da foto (só o que a loja já anuncia). */
  selo?: string;
}

export const SERVICOS: Servico[] = [
  {
    id: "manutencao",
    titulo: "Conserto de notebook e PC",
    resumo: "Diagnóstico na bancada da loja, orçamento antes de qualquer troca.",
    itens: ["Tela, bateria, teclado e dobradiça", "Notebook que não liga ou esquenta", "Formatação com backup e limpeza"],
    href: "/manutencao",
    foto: "/images/servicos-e-ofertas/manutencao.webp",
    fotoAlt: "Técnico consertando notebook na bancada da assistência técnica em Campinas",
    mensagem: "Olá! Quero orçar o conserto do meu notebook/PC.",
  },
  {
    id: "reparoapple",
    titulo: "Reparo Apple: iPhone, MacBook, iPad",
    resumo: "Troca de tela e bateria de iPhone em até 3 horas.",
    itens: ["Tela e bateria de iPhone", "MacBook e iMac: placa, SSD, tela", "iPad e Apple Watch"],
    href: "/reparoapple",
    foto: "/images/servicos-e-ofertas/reparoapple.webp",
    fotoAlt: "Reparo de iPhone e MacBook na assistência Apple da Balão da Informática no Cambuí",
    mensagem: "Olá! Quero orçar um reparo no meu aparelho Apple.",
    selo: "Até 3 horas",
  },
  {
    id: "montagempc",
    titulo: "Montagem de PC gamer sob medida",
    resumo: "Peças escolhidas para o seu jogo e o seu orçamento, testadas antes da entrega.",
    itens: ["Organização de cabos caprichada", "Teste de estresse e temperatura", "Upgrade pensado para o futuro"],
    href: "/montagempc",
    foto: "/images/servicos-e-ofertas/montagempc.webp",
    fotoAlt: "Montagem de PC gamer com water cooler e iluminação RGB em Campinas",
    mensagem: "Olá! Quero montar um PC gamer sob medida.",
  },
  {
    id: "recuperacaodados",
    titulo: "Recuperação de dados",
    resumo: "Fotos, documentos e arquivos de HD, SSD, pendrive e cartão de memória.",
    itens: ["HD que não monta ou faz barulho", "SSD que sumiu do sistema", "Arquivo apagado por engano"],
    href: "/recuperacaodados",
    foto: "/images/servicos-e-ofertas/recuperacaodados.webp",
    fotoAlt: "Laboratório de recuperação de dados de HD e SSD em Campinas",
    mensagem: "Olá! Preciso recuperar arquivos de um HD/SSD.",
  },
  {
    id: "assistenciagames",
    titulo: "Assistência de videogames",
    resumo: "PlayStation, Xbox e Nintendo Switch de volta ao jogo.",
    itens: ["Troca de conector HDMI", "Limpeza e troca de pasta / metal líquido", "Controle com drift"],
    href: "/assistenciagames",
    foto: "/images/servicos-e-ofertas/assistenciagames.webp",
    fotoAlt: "Conserto de PS5, Xbox e Nintendo Switch em Campinas",
    mensagem: "Olá! Quero orçar o conserto do meu videogame.",
  },
  {
    id: "sistemas",
    titulo: "Sites, sistemas e TI para empresas",
    resumo: "Site que aparece no Google, automação e suporte de TI para o seu negócio.",
    itens: ["Criação de site e loja virtual", "Redes, servidores e backup", "Contrato de suporte mensal"],
    href: "/sistemas",
    foto: "/images/servicos-e-ofertas/sistemas.webp",
    fotoAlt: "Desenvolvimento de sites e sistemas para empresas de Campinas",
    mensagem: "Olá! Tenho uma empresa e quero falar sobre site, sistema ou suporte de TI.",
  },
  {
    id: "seminovos",
    titulo: "Seminovos e consignação",
    resumo: "Compre seminovo revisado ou deixe o seu equipamento para vender na loja.",
    itens: ["Notebooks e MacBooks revisados", "Venda o seu aparelho em consignação", "Garantia da loja"],
    href: "/seminovos",
    foto: "/images/servicos-e-ofertas/seminovos.webp",
    fotoAlt: "Notebooks e MacBooks seminovos revisados à venda em Campinas",
    mensagem: "Olá! Quero saber dos seminovos / deixar um aparelho em consignação.",
  },
  {
    id: "tonner",
    titulo: "Impressoras, toners e cartuchos",
    resumo: "Suprimentos para casa e escritório, com entrega rápida na região.",
    itens: ["Cartuchos originais", "Toners para escritório", "Instalação de impressora Wi-Fi"],
    href: "/tonner",
    foto: "/images/servicos-e-ofertas/tonner.webp",
    fotoAlt: "Toners, cartuchos e impressoras para empresas em Campinas",
    mensagem: "Olá! Preciso de toner/cartucho ou ajuda com impressora.",
  },
];

/** Por que comprar e consertar aqui (ditado pelo Thiago, ver memória do projeto). */
export const DIFERENCIAIS = [
  { titulo: "Loja física no Cambuí", texto: "Veja o PC ligado, teste antes de pagar e retire na hora. Nada de caixa fechada chegando pelo correio." },
  { titulo: "Bancada própria", texto: "Montagem, configuração, garantia e conserto no mesmo lugar. Se der problema, você sabe onde nos achar." },
  { titulo: "Atendimento direto", texto: "No WhatsApp você fala com a equipe da loja, que conhece o produto e o serviço." },
  { titulo: "Entrega rápida na região", texto: "Entrega e retirada local no mesmo dia em Campinas e cidades vizinhas, conforme disponibilidade." },
  { titulo: "Pix com 10% e 10x sem juros", texto: "Desconto à vista no Pix ou parcelamento em até 10x sem juros no cartão." },
  { titulo: "Mais de 25 anos de marca", texto: "Confiança regional, mais de 700 avaliações no Google e 20 mil seguidores no Instagram." },
];

export const PASSOS = [
  { titulo: "Chame no WhatsApp", texto: "Diga o que precisa ou mande uma foto do problema. Leva 30 segundos." },
  { titulo: "Receba o orçamento", texto: "A equipe responde com preço, prazo e opções, antes de qualquer serviço." },
  { titulo: "Resolva", texto: "Traga na loja do Cambuí, retire na hora ou receba em casa na região." },
];

export const CIDADES = [
  "Campinas", "Valinhos", "Vinhedo", "Paulínia", "Sumaré", "Hortolândia", "Indaiatuba", "Americana", "Jaguariúna",
];

export const BAIRROS = [
  "Cambuí", "Centro", "Guanabara", "Taquaral", "Castelo", "Nova Campinas", "Jardim Chapadão", "Barão Geraldo",
  "Sousas", "Botafogo", "Bosque", "Jardim Proença",
];

export const PERGUNTAS = [
  {
    question: "Onde tem assistência técnica de informática no Cambuí, em Campinas?",
    answer: `A Balão da Informática fica na ${SITE_CONFIG.address}, com bancada própria para conserto de notebook, PC, iPhone, MacBook e videogames. Atendimento ${SITE_CONFIG.openingHoursDisplay}, e orçamento pelo WhatsApp ${SITE_CONFIG.whatsapp.display}.`,
  },
  {
    question: "Quanto tempo demora para trocar a tela ou a bateria do iPhone?",
    answer: "A troca de tela e de bateria de iPhone é feita em até 3 horas na loja do Cambuí, conforme o modelo e a disponibilidade da peça. Confirme o seu modelo pelo WhatsApp antes de vir.",
  },
  {
    question: "Como faço um orçamento de conserto?",
    answer: "Chame no WhatsApp, diga o aparelho e o defeito e, se puder, mande uma foto. A equipe responde com o preço, o prazo e as opções. O serviço só começa depois que você aprova o orçamento.",
  },
  {
    question: "Vocês montam PC gamer sob medida em Campinas?",
    answer: "Sim. As peças são escolhidas para os jogos ou programas que você usa e para o seu orçamento, montadas e testadas na nossa bancada antes da entrega, com garantia da loja.",
  },
  {
    question: "Se eu comprar uma peça, vocês instalam?",
    answer: "Sim. Na compra de SSD, memória RAM, placa de vídeo, cooler ou fonte você pode deixar a instalação com a gente na loja física, com desconto promocional na mão de obra.",
  },
  {
    question: "Os produtos têm garantia e nota fiscal?",
    answer: "Sim. Todos os produtos novos saem com nota fiscal eletrônica e garantia. Pagando à vista no Pix você ganha 10% de desconto, ou parcela em até 10x sem juros no cartão.",
  },
  {
    question: "Posso retirar o produto na loja no mesmo dia?",
    answer: "Sim, para produtos com pronta entrega. Confirme a disponibilidade pelo WhatsApp e retire no balcão da Av. Anchieta, 789, no Cambuí. Na região de Campinas também fazemos entrega local rápida.",
  },
  {
    question: "Vocês atendem empresas?",
    answer: "Sim. Atendemos empresas de Campinas e região com suporte de TI, redes, manutenção preventiva, venda de equipamentos com nota e criação de sites e sistemas. Chamados de empresas têm prioridade.",
  },
  {
    question: "Vocês recuperam arquivos de HD ou SSD com defeito?",
    answer: "Sim. Recuperamos fotos, documentos e arquivos de HD, SSD, pendrive e cartão de memória, inclusive de discos que não aparecem mais no computador. A avaliação é feita na loja.",
  },
  {
    question: "Quais cidades vocês atendem?",
    answer: `A loja fica no Cambuí, em Campinas, e atende ${CIDADES.slice(1).join(", ")} e o restante da região metropolitana. Produtos também vão para todo o Brasil.`,
  },
];
