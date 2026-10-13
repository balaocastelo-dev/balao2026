import type { PaginaDeCaptacao } from "../tipos";

// Sobre a empresa. Ângulo: a ficha de quem quer checar a loja antes de
// comprar (e do Google e das IAs, que precisam entender quem é a empresa):
// razão social, CNPJ, endereço com CEP, contatos, horário, o que vende e
// conserta e a área atendida. O porquê e o jeito de trabalhar ficam na
// /sobre-nos.
// A página antiga dizia "uma das maiores redes de varejo do Brasil",
// "Centros de Distribuição" e "lojas" no plural, CEP 13025-000 e
// "Inscrição Estadual 000.000.000.000": tudo isso saiu.

const foto = (slug: string) => `/images/landing/v2/${slug}.jpg`;
export const sobreAEmpresa: PaginaDeCaptacao = {
  slug: "sobre-a-empresa",
  nome: "Dados da empresa",
  chamada: "Razão social, CNPJ, endereço, horário e contatos oficiais da Balão da Informática no Cambuí.",
  seo: {
    titulo: "Balão da Informática Castelo: CNPJ, endereço e contatos em Campinas",
    descricao:
      "Dados oficiais da Balão da Informática Castelo: CNPJ 34.397.947/0001-08, Av. Anchieta, 789, Cambuí, Campinas/SP, telefone, WhatsApp, horário e Instagram.",
    palavras: [
      "Balão da Informática Castelo CNPJ",
      "Balão da Informática endereço Campinas",
      "Balão da Informática Av. Anchieta 789 Cambuí",
      "telefone Balão da Informática Campinas",
      "WhatsApp Balão da Informática",
      "horário Balão da Informática Cambuí",
      "loja de informática no Cambuí Campinas",
      "assistência técnica de informática Cambuí",
      "loja de informática perto do Centro de Campinas",
      "balao.info é a loja oficial",
    ],
    tipoDeServico: "Loja de informática e assistência técnica",
    imagem: "/images/apple/hub-hero-real.png",
  },
  hero: {
    contexto: "Dados oficiais da loja",
    titulo: "Quem é a Balão da Informática, com todos os dados para conferir",
    texto:
      "Antes de comprar, é justo saber com quem você está falando. Aqui estão a razão social, o CNPJ, o endereço da loja no Cambuí e os únicos contatos oficiais. Na dúvida sobre qualquer mensagem em nome da loja, confira por eles.",
    imagem: {
      src: "/images/apple/hub-hero-real.png",
      alt: "Balcão de atendimento da Balão da Informática, com a marca da loja na parede e a vitrine de acessórios ao lado",
    },
    mensagem: "Olá! Vim pela página de dados da empresa da Balão e quero confirmar uma informação.",
    botao: "Falar com a loja",
    secundario: { rotulo: "Ver os dados", href: "#secao-1" },
    fatos: [
      { valor: "CNPJ", rotulo: "34.397.947/0001-08" },
      { valor: "Cambuí", rotulo: "Av. Anchieta, 789, Campinas/SP" },
      { valor: "Mais de 25 anos", rotulo: "de marca em Campinas" },
      { valor: "700+", rotulo: "avaliações públicas no Google" },
    ],
  },
  assistente: {
    titulo: "Quer confirmar alguma coisa?",
    texto: "Escolha o assunto e a mensagem vai pronta para a equipe.",
    abertura: "Olá! Vim pela página de dados da empresa.",
    botao: "Enviar para a loja",
    perguntas: [
      {
        rotulo: "Assunto",
        pergunta: "O que você quer confirmar?",
        opcoes: ["Se uma mensagem é da loja", "Dados para nota ou cadastro", "Horário e como chegar", "Um pedido que fiz"],
      },
      {
        rotulo: "Sou",
        pergunta: "Você é:",
        opcoes: ["Cliente", "Empresa", "Fornecedor"],
      },
    ],
  },
  secoes: [
    {
      tipo: "dados",
      titulo: "Dados da empresa",
      texto: "Os mesmos que aparecem na nota fiscal e no recebedor do Pix.",
      linhas: [
        ["Nome fantasia", "Balão da Informática"],
        ["Razão social", "Balão da Informática Castelo"],
        ["CNPJ", "34.397.947/0001-08"],
        ["Endereço", "Av. Anchieta, 789, Cambuí, Campinas/SP"],
        ["CEP", "13015-101"],
        ["Atividade", "Loja de informática e assistência técnica"],
        ["Site oficial", "www.balao.info"],
      ],
    },
    {
      tipo: "dados",
      titulo: "Contatos oficiais e horário",
      texto: "Os únicos canais de atendimento da loja. Pedido de pagamento por outro número ou outro nome não é da Balão.",
      linhas: [
        ["Telefone", "(19) 3255-1661"],
        ["WhatsApp", "(19) 98751-0267"],
        ["Instagram", "@balaodainformatica_castelo"],
        ["Segunda a sexta", "9h às 18h"],
        ["Sábado", "9h às 13h"],
        ["Domingo", "Fechado; o WhatsApp recebe mensagens"],
      ],
    },
    {
      tipo: "atalhos",
      titulo: "O que a loja vende e conserta",
      texto: "Loja e bancada técnica ficam no mesmo endereço. Cada área tem uma página com os detalhes.",
      itens: [
        { titulo: "Assistência de notebook e PC", texto: "Diagnóstico, conserto, upgrade e formatação com backup.", href: "/manutencao", imagem: foto("manutencao") },
        { titulo: "Reparo Apple", texto: "iPhone, iPad, MacBook, iMac, Mac mini e Apple Watch.", href: "/reparoapple", imagem: foto("reparoapple") },
        { titulo: "Recuperação de dados", texto: "HD, SSD, pen drive e cartão de memória.", href: "/recuperacaodados", imagem: foto("recuperacaodados") },
        { titulo: "Assistência de consoles", texto: "PlayStation, Xbox, Nintendo Switch e controles.", href: "/assistenciagames", imagem: foto("assistenciagames") },
        { titulo: "Notebooks", texto: "Novos, para ver ligados no balcão.", href: "/notebooks", imagem: foto("notebooks") },
        { titulo: "PC gamer e montagem", texto: "Montados na loja e testados antes da entrega.", href: "/montagempc", imagem: foto("montagempc") },
        { titulo: "Toner e cartucho", texto: "Cartucho e tinta originais; toner original e compatível.", href: "/tonner", imagem: foto("tonner") },
        { titulo: "Windows e Office", texto: "Licenças originais, com instalação se precisar.", href: "/microsoft", imagem: foto("microsoft") },
        { titulo: "Consignação de usados", texto: "Seu usado exposto e vendido pela loja.", href: "/consignacao", imagem: foto("consignacao") },
        { titulo: "Sites e sistemas", texto: "A mesma equipe que fez os sistemas da loja.", href: "/sistemas", imagem: foto("sistemas") },
        { titulo: "Carregadores e fontes", texto: "A fonte certa para o seu notebook.", href: "/carregadores", imagem: foto("carregadores") },
        { titulo: "Todos os serviços", texto: "O mapa completo do que a loja faz.", href: "/servicos-e-ofertas", imagem: "/images/servicos-e-ofertas/capa.webp" },
      ],
    },
    {
      tipo: "texto",
      titulo: "Área atendida e como a loja funciona",
      paragrafos: [
        "A Balão da Informática é uma loja de rua no Cambuí, em Campinas, com uma única loja física: a da Av. Anchieta, 789. Ali ficam o balcão de vendas e a bancada de assistência técnica. O atendimento presencial acontece nesse endereço, de segunda a sábado.",
        "O site www.balao.info mostra o catálogo com preços atualizados e recebe pedidos com pagamento no Pix. O WhatsApp da loja atende vendas, orçamentos de conserto e acompanhamento de pedidos; quem responde é a equipe da loja e, quando não há vendedor disponível, uma vendedora digital adianta o atendimento até alguém da equipe assumir.",
        "A entrega local por motoboy cobre Campinas e cidades da região, como Valinhos, Vinhedo, Paulínia, Sumaré e Hortolândia, e é combinada pelo WhatsApp. Para outras cidades, o envio é feito com o frete calculado no carrinho pelo CEP.",
      ],
      lista: [
        "Uma loja física: Av. Anchieta, 789, Cambuí, Campinas/SP",
        "Entrega local em Campinas e região, combinada pelo WhatsApp",
        "Envio para outras cidades com frete calculado pelo CEP",
        "Nota fiscal em toda compra",
      ],
    },
    {
      tipo: "regras",
      titulo: "Como conferir se uma mensagem é mesmo da loja",
      texto: "Golpes usando nome de loja conhecida acontecem. Estes cuidados valem para qualquer compra.",
      itens: [
        {
          titulo: "Confira o número",
          texto: "O WhatsApp oficial é (19) 98751-0267 e o telefone fixo é (19) 3255-1661. Mensagem de outro número dizendo ser da loja merece desconfiança.",
        },
        {
          titulo: "Confira o recebedor do Pix",
          texto: "No Pix, o recebedor aparece como Balão da Informática Castelo, CNPJ 34.397.947/0001-08. Se aparecer outro nome, não pague e ligue para a loja.",
        },
        {
          titulo: "Confira o endereço do site",
          texto: "O site oficial é www.balao.info. Página com outro endereço vendendo em nome da Balão não é da loja.",
        },
        {
          titulo: "Na dúvida, ligue ou venha",
          texto: "Ligue para o fixo ou passe no balcão do Cambuí. A equipe confirma na hora se o pedido, o link ou a mensagem é da loja.",
        },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Qual é o CNPJ da Balão da Informática?",
      resposta:
        "O CNPJ é 34.397.947/0001-08, com a razão social Balão da Informática Castelo. É o mesmo que aparece na nota fiscal e no recebedor do Pix.",
    },
    {
      pergunta: "Onde fica a Balão da Informática em Campinas?",
      resposta:
        "Na Av. Anchieta, 789, no Cambuí, em Campinas/SP, CEP 13015-101. A loja e a bancada de assistência técnica ficam no mesmo endereço.",
    },
    {
      pergunta: "Qual é o horário de funcionamento?",
      resposta:
        "De segunda a sexta, das 9h às 18h, e aos sábados, das 9h às 13h. O WhatsApp (19) 98751-0267 recebe mensagens fora desse horário e a equipe responde no próximo período de atendimento.",
    },
    {
      pergunta: "Qual é o WhatsApp oficial da loja?",
      resposta:
        "É o (19) 98751-0267. O telefone fixo é (19) 3255-1661 e o Instagram é @balaodainformatica_castelo; outros números falando em nome da loja não são oficiais.",
    },
    {
      pergunta: "A Balão tem outras lojas?",
      resposta:
        "Não. A loja física é uma só, no Cambuí. As vendas a distância acontecem pelo site www.balao.info e pelo WhatsApp da loja.",
    },
    {
      pergunta: "A Balão atende fora de Campinas?",
      resposta:
        "Sim. Há entrega por motoboy em cidades da região, como Valinhos, Vinhedo, Paulínia, Sumaré e Hortolândia, combinada pelo WhatsApp, e envio para outras cidades com o frete calculado pelo CEP no site.",
    },
  ],
  temas: ["compra", "assistencia", "empresa", "garantia", "entrega"],
  termosDoBlog: ["campinas", "cambuí", "loja de informática", "assistência"],
  relacionadas: ["sobre-nos", "como-comprar", "trocas-e-devolucoes", "envio-e-entrega"],
  final: {
    titulo: "Conferiu? Agora é só falar com a loja",
    texto: "Pelo WhatsApp oficial, pelo telefone fixo ou no balcão da Av. Anchieta, no Cambuí.",
    botao: "Chamar no WhatsApp oficial",
  },
};
