export type FuncaoItem = {
  href: string;
  title: string;
  description: string;
  image: string;
};

export type FuncaoCategory = {
  slug: string;
  title: string;
  description: string;
  items: FuncaoItem[];
};

const IMAGES = {
  loja: "/images/pcs/escritorio.svg",
  gamer: "/images/pcs/pc-gamer.svg",
  servico: "/images/prizes/repair.png",
  premium: "/images/pcs/workstation.svg",
  blog: "/images/pcs/programacao.svg",
  apple: "/images/apple/subcategories/iphone-card.png",
  gestao: "/images/pcs/arquitetura.svg",
  contato: "/images/pcs/custo-beneficio.svg",
};

export const FUNCOES_CATALOG: FuncaoCategory[] = [
  {
    slug: "principal",
    title: "Site Principal e Navegacao",
    description: "Paginas principais da loja, catalogo, compra e apoio ao cliente.",
    items: [
      {
        href: "/",
        title: "Home",
        description: "Pagina inicial com vitrine principal, destaques, busca e acesso a todas as areas do site.",
        image: IMAGES.loja,
      },
      {
        href: "/departamentos",
        title: "Departamentos",
        description: "Central para navegar pelos departamentos e familias principais da loja.",
        image: IMAGES.loja,
      },
      {
        href: "/categoria/[slug]",
        title: "Categorias",
        description: "Lista produtos por categoria, ajudando o cliente a encontrar tipos especificos de item.",
        image: IMAGES.loja,
      },
      {
        href: "/product/[id]",
        title: "Produto Completo",
        description: "Pagina detalhada do produto com informacoes, compra e conversao.",
        image: IMAGES.loja,
      },
      {
        href: "/p/[slug]",
        title: "Produto Curto",
        description: "Atalho curto para o produto, usado em links mais limpos e compartilhamento.",
        image: IMAGES.loja,
      },
      {
        href: "/cart",
        title: "Carrinho",
        description: "Area onde o cliente revisa itens, aplica cupom e segue para o pagamento.",
        image: IMAGES.loja,
      },
      {
        href: "/thank-you",
        title: "Pos Compra",
        description: "Pagina apos compra com acompanhamento, Pix e orientacoes para o cliente.",
        image: IMAGES.contato,
      },
      {
        href: "/fale-conosco",
        title: "Fale Conosco",
        description: "Pagina de contato com formulario, telefone, email e captacao de lead.",
        image: IMAGES.contato,
      },
      {
        href: "/como-comprar",
        title: "Como Comprar",
        description: "Explica como funciona o processo de compra e atendimento da loja.",
        image: IMAGES.contato,
      },
      {
        href: "/envio-e-entrega",
        title: "Envio e Entrega",
        description: "Mostra regras, prazos e informacoes sobre envio e entrega.",
        image: IMAGES.contato,
      },
      {
        href: "/trocas-e-devolucoes",
        title: "Trocas e Devolucoes",
        description: "Pagina com politica de devolucao, troca e pos-venda.",
        image: IMAGES.contato,
      },
      {
        href: "/seguranca-e-privacidade",
        title: "Seguranca e Privacidade",
        description: "Explica privacidade, seguranca e uso de dados do site.",
        image: IMAGES.contato,
      },
      {
        href: "/sobre-nos",
        title: "Sobre Nos",
        description: "Pagina institucional apresentando a empresa e seu posicionamento.",
        image: IMAGES.contato,
      },
      {
        href: "/sobre-a-empresa",
        title: "Sobre a Empresa",
        description: "Complementa a area institucional com mais contexto sobre o negocio.",
        image: IMAGES.contato,
      },
      {
        href: "/unsubscribe",
        title: "Descadastro",
        description: "Permite remover um email da lista de comunicacao e marketing.",
        image: IMAGES.contato,
      },
    ],
  },
  {
    slug: "comercial",
    title: "Paginas Comerciais",
    description: "Paginas de venda direta, campanhas, nichos e vitrines especiais.",
    items: [
      {
        href: "/pcgamer",
        title: "PC Gamer",
        description: "Landing page comercial para vender PCs gamer e captar clientes desse nicho.",
        image: IMAGES.gamer,
      },
      {
        href: "/pcgamer3d",
        title: "PC Gamer 3D",
        description: "Versao mais visual e impactante da pagina de PC gamer.",
        image: IMAGES.gamer,
      },
      {
        href: "/notebooks",
        title: "Notebooks",
        description: "Landing page focada em notebooks e suas categorias principais.",
        image: IMAGES.loja,
      },
      {
        href: "/carregadores",
        title: "Carregadores",
        description: "Pagina comercial focada em carregadores e acessorios de energia.",
        image: IMAGES.loja,
      },
      {
        href: "/tonner",
        title: "Tonner",
        description: "Landing page para venda de tonner e suprimentos de impressao.",
        image: IMAGES.loja,
      },
      {
        href: "/seminovos",
        title: "Seminovos",
        description: "Vitrine de produtos usados ou seminovos com oportunidade de venda rapida.",
        image: IMAGES.loja,
      },
      {
        href: "/promocao",
        title: "Promocao",
        description: "Pagina de campanhas promocionais e ofertas especiais.",
        image: IMAGES.loja,
      },
      {
        href: "/servicos-e-ofertas",
        title: "Servicos e Ofertas",
        description: "Une servicos da empresa com oportunidades comerciais em uma unica area.",
        image: IMAGES.loja,
      },
      {
        href: "/premium",
        title: "Premium",
        description: "Pagina para linhas premium, configuracoes especiais e produtos de alto valor.",
        image: IMAGES.premium,
      },
      {
        href: "/monteseupc",
        title: "Monte Seu PC",
        description: "Ajuda o cliente a escolher ou montar um computador personalizado.",
        image: IMAGES.premium,
      },
      {
        href: "/montagempc",
        title: "Montagem de PC",
        description: "Pagina comercial para vender servico de montagem e configuracao.",
        image: IMAGES.premium,
      },
      {
        href: "/gerador",
        title: "Gerador",
        description: "Ferramenta especial do site para gerar configuracoes ou conteudos internos.",
        image: IMAGES.premium,
      },
      {
        href: "/consignacao",
        title: "Consignacao",
        description: "Pagina voltada para consignacao e modelos especiais de venda.",
        image: IMAGES.loja,
      },
      {
        href: "/roleta",
        title: "Roleta",
        description: "Pagina promocional gamificada para engajamento e captacao.",
        image: IMAGES.gamer,
      },
      {
        href: "/vitrine",
        title: "Vitrine",
        description: "Central de paginas comerciais especiais montadas para vendas e campanhas.",
        image: IMAGES.loja,
      },
      {
        href: "/vitrine/[slug]",
        title: "Pagina de Vitrine",
        description: "Pagina dinamica de vitrine com promocao, campanha ou oferta especifica.",
        image: IMAGES.loja,
      },
      {
        href: "/microsoft",
        title: "Microsoft",
        description: "Pagina tematica voltada para produtos ou servicos relacionados a Microsoft.",
        image: IMAGES.premium,
      },
      {
        href: "/arena",
        title: "Arena",
        description: "Area comercial ou operacional dedicada ao projeto Arena.",
        image: IMAGES.gamer,
      },
    ],
  },
  {
    slug: "assistencia",
    title: "Assistencia e Servicos Tecnicos",
    description: "Paginas de reparo, manutencao e servicos tecnicos especializados.",
    items: [
      {
        href: "/manutencao",
        title: "Manutencao",
        description: "Pagina principal de manutencao e servicos tecnicos gerais.",
        image: IMAGES.servico,
      },
      {
        href: "/assistenciagames",
        title: "Assistencia Games",
        description: "Pagina de atendimento e reparo para consoles e equipamentos gamers.",
        image: IMAGES.gamer,
      },
      {
        href: "/reparoapple",
        title: "Reparo Apple",
        description: "Landing focada em consertos e assistencia tecnica para Apple.",
        image: IMAGES.apple,
      },
      {
        href: "/recuperacaodados",
        title: "Recuperacao de Dados",
        description: "Servico para recuperar arquivos e dados perdidos de clientes.",
        image: IMAGES.servico,
      },
      {
        href: "/telaiphone",
        title: "Tela iPhone",
        description: "Pagina de reparo voltada para troca ou conserto de tela de iPhone.",
        image: IMAGES.apple,
      },
      {
        href: "/sistemas",
        title: "Sistemas",
        description: "Pagina para apresentar sistemas, implantacoes e solucoes tecnicas.",
        image: IMAGES.gestao,
      },
    ],
  },
  {
    slug: "seo",
    title: "SEO Regional e Captacao",
    description: "Paginas criadas para captar busca local, urgencia e intencao quente.",
    items: [
      {
        href: "/regiao",
        title: "Hub Regional",
        description: "Pagina central das cidades e servicos atendidos na regiao.",
        image: IMAGES.contato,
      },
      {
        href: "/regiao/[city]/[service]",
        title: "Pagina Regional",
        description: "Pagina local por cidade e servico para gerar lead organico e comercial.",
        image: IMAGES.contato,
      },
      {
        href: "/urgente",
        title: "Hub Urgente",
        description: "Pagina central para buscas de quem precisa de solucao rapida.",
        image: IMAGES.servico,
      },
      {
        href: "/urgente/[slug]",
        title: "Problema Urgente",
        description: "Pagina criada para captar pesquisas urgentes por problema especifico.",
        image: IMAGES.servico,
      },
      {
        href: "/especialidades",
        title: "Especialidades",
        description: "Pagina de autoridade mostrando conhecimentos e especializacoes da empresa.",
        image: IMAGES.gestao,
      },
    ],
  },
  {
    slug: "conteudo",
    title: "Blog e Conteudo",
    description: "Paginas de conteudo, artigos e areas de autoridade da marca.",
    items: [
      {
        href: "/blog",
        title: "Blog",
        description: "Lista principal dos artigos publicados no blog da empresa.",
        image: IMAGES.blog,
      },
      {
        href: "/blog/[slug]",
        title: "Artigo do Blog",
        description: "Pagina individual de artigo para atrair trafego organico e educar o cliente.",
        image: IMAGES.blog,
      },
    ],
  },
  {
    slug: "apple",
    title: "Area Apple",
    description: "Subsite e paginas focadas em produtos e servicos Apple.",
    items: [
      {
        href: "/wendell/apple",
        title: "Hub Apple",
        description: "Pagina principal da area Apple com acesso para as subcategorias.",
        image: "/images/apple/hub-hero.webp",
      },
      {
        href: "/wendell/apple/iphone",
        title: "Apple iPhone",
        description: "Pagina da linha iPhone na area Apple.",
        image: "/images/apple/subcategories/iphone-card.png",
      },
      {
        href: "/wendell/apple/ipad",
        title: "Apple iPad",
        description: "Pagina da linha iPad na area Apple.",
        image: "/images/apple/subcategories/ipad-card.png",
      },
      {
        href: "/wendell/apple/imac",
        title: "Apple iMac",
        description: "Pagina da linha iMac na area Apple.",
        image: "/images/apple/subcategories/imac-card.png",
      },
      {
        href: "/wendell/apple/mac-mini",
        title: "Apple Mac Mini",
        description: "Pagina da linha Mac Mini na area Apple.",
        image: "/images/apple/subcategories/macmini-card.png",
      },
      {
        href: "/wendell/apple/macbook",
        title: "Apple MacBook",
        description: "Pagina da linha MacBook na area Apple.",
        image: "/images/apple/subcategories/macbook-card.png",
      },
      {
        href: "/wendell/apple/apple-watch",
        title: "Apple Watch",
        description: "Pagina da linha Apple Watch na area Apple.",
        image: "/images/apple/subcategories/watch-card.png",
      },
      {
        href: "/wendell/apple/blog",
        title: "Blog Apple",
        description: "Lista dos artigos da area Apple.",
        image: IMAGES.blog,
      },
      {
        href: "/wendell/apple/blog/[slug]",
        title: "Artigo Apple",
        description: "Pagina individual de conteudo do blog Apple.",
        image: IMAGES.blog,
      },
    ],
  },
  {
    slug: "operacao",
    title: "Sistemas Internos",
    description: "Paginas protegidas e operacionais usadas no dia a dia do negocio.",
    items: [
      {
        href: "/painel",
        title: "Painel",
        description: "Painel protegido com metricas de vendas, visitas e conversoes.",
        image: IMAGES.gestao,
      },
      {
        href: "/dashboard",
        title: "Dashboard",
        description: "Dashboard executivo antigo que ainda serve como base visual e operacional.",
        image: IMAGES.gestao,
      },
      {
        href: "/controle",
        title: "Controle de Pecas",
        description: "Sistema de controle de pecas da assistencia tecnica.",
        image: IMAGES.servico,
      },
      {
        href: "/controle/admin",
        title: "Controle Admin",
        description: "Administracao do sistema de controle de pecas.",
        image: IMAGES.gestao,
      },
      {
        href: "/controle/senha",
        title: "Controle Senha",
        description: "Pagina da senha dinamica usada no sistema de controle.",
        image: IMAGES.gestao,
      },
      {
        href: "/pdv",
        title: "PDV",
        description: "Area de operacao para ponto de venda e atendimento interno.",
        image: IMAGES.gestao,
      },
      {
        href: "/fechamento",
        title: "Fechamento",
        description: "Pagina de fechamento operacional e financeiro.",
        image: IMAGES.gestao,
      },
      {
        href: "/funcoes",
        title: "Funcoes",
        description: "Pagina protegida que centraliza os atalhos para todas as funcoes do site.",
        image: IMAGES.gestao,
      },
    ],
  },
  {
    slug: "admin",
    title: "Administracao",
    description: "Paginas de gestao do catalogo, conteudo e operacao interna.",
    items: [
      {
        href: "/admin",
        title: "Admin Principal",
        description: "Entrada principal do painel administrativo.",
        image: IMAGES.gestao,
      },
      {
        href: "/admin/produtos",
        title: "Admin Produtos",
        description: "Gestao dos produtos da loja.",
        image: IMAGES.gestao,
      },
      {
        href: "/admin/pedidos",
        title: "Admin Pedidos",
        description: "Gestao dos pedidos realizados no site.",
        image: IMAGES.gestao,
      },
      {
        href: "/admin/categorias",
        title: "Admin Categorias",
        description: "Gerencia categorias e organizacao do catalogo.",
        image: IMAGES.gestao,
      },
      {
        href: "/admin/carrossel",
        title: "Admin Carrossel",
        description: "Gerencia banners e imagens do carrossel da home.",
        image: IMAGES.gestao,
      },
      {
        href: "/admin/barra",
        title: "Admin Barra",
        description: "Gerencia a barra superior e avisos do site.",
        image: IMAGES.gestao,
      },
      {
        href: "/admin/cupons",
        title: "Admin Cupons",
        description: "Gerencia cupons promocionais e regras de desconto.",
        image: IMAGES.gestao,
      },
      {
        href: "/admin/home-blocks",
        title: "Admin Home Blocks",
        description: "Edita os blocos de conteudo da pagina inicial.",
        image: IMAGES.gestao,
      },
      {
        href: "/admin/paginas",
        title: "Admin Paginas",
        description: "Gerencia paginas especiais e vitrines dinamicas.",
        image: IMAGES.gestao,
      },
      {
        href: "/admin/importacao",
        title: "Admin Importacao",
        description: "Ferramenta para importar dados, produtos ou estrutura.",
        image: IMAGES.gestao,
      },
      {
        href: "/admin/ai-settings",
        title: "Admin AI Settings",
        description: "Configura automacoes e recursos de inteligencia artificial.",
        image: IMAGES.gestao,
      },
      {
        href: "/admin/test-migration",
        title: "Admin Test Migration",
        description: "Pagina tecnica para testar migracoes e ajustes internos.",
        image: IMAGES.gestao,
      },
      {
        href: "/arena/admin",
        title: "Arena Admin",
        description: "Administracao da area Arena e seus recursos internos.",
        image: IMAGES.gestao,
      },
    ],
  },
];

export const FUNCOES_TOTAL = FUNCOES_CATALOG.reduce(
  (total, category) => total + category.items.length,
  0
);
