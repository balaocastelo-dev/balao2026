import type { PaginaDeCaptacao } from "../tipos";

// Hub Apple: a porta de entrada do especialista Apple da loja, organizada por
// aparelho. Quem chega aqui ainda não escolheu o assunto; a página mostra as
// seis linhas, ensina a achar o modelo exato e leva à subpágina certa. O
// serviço geral (defeitos, diagnóstico, consertar ou trocar) fica em
// /reparoapple, e tela e bateria de iPhone em /telaiphone. Sem os depoimentos
// da página antiga (inventados) e sem "até 1h", "garantia de até 1 ano",
// "True Tone", "motoboy leva e traz", "12x" e "técnicos certificados".
export const wendellApple: PaginaDeCaptacao = {
  slug: "wendell/apple",
  nome: "Especialista Apple",
  chamada: "iPhone, MacBook, iPad, iMac, Mac mini e Apple Watch: escolha o aparelho e fale com a bancada Apple da loja.",
  seo: {
    titulo: "Especialista Apple em Campinas: iPhone, Mac, iPad e Watch | Balão",
    descricao:
      "Especialista Apple no Cambuí, em Campinas: iPhone, MacBook, iPad, iMac, Mac mini e Apple Watch. Escolha o aparelho, diga o modelo e receba o orçamento no WhatsApp.",
    palavras: [
      "especialista Apple em Campinas",
      "assistência Apple Cambuí",
      "conserto de iMac em Campinas",
      "conserto de Mac mini Campinas",
      "conserto de Apple Watch Campinas",
      "conserto de iPad em Campinas",
      "assistência de MacBook Air e Pro Campinas",
      "como saber o modelo do meu iPhone",
      "como saber o modelo do meu MacBook",
      "loja Apple em Campinas assistência",
    ],
    tipoDeServico: "Assistência técnica Apple por aparelho",
  },
  hero: {
    contexto: "Especialista Apple da Balão, no Cambuí",
    titulo: "Do iPhone ao Mac mini, a bancada Apple que conhece o seu modelo",
    texto:
      "Cada aparelho Apple tem os seus defeitos típicos e as suas peças. Escolha o seu abaixo, veja o que costuma acontecer com ele e mande o modelo exato pelo WhatsApp: o técnico responde já sabendo do que se trata.",
    imagem: {
      src: "/images/landing/v2/wendell-apple.jpg",
      alt: "Notebook, smartphone, tablet e relógio inteligente sobre a bancada branca, com o microscópio do técnico ao fundo",
    },
    mensagem: "Olá! Vim pela página do especialista Apple da Balão e quero falar sobre o meu aparelho.",
    botao: "Falar com o especialista Apple",
    secundario: { rotulo: "Escolher o meu aparelho", href: "#secao-1" },
    fatos: [
      { valor: "6 aparelhos", rotulo: "iPhone, MacBook, iPad, iMac, Mac mini e Watch" },
      { valor: "Pelo modelo", rotulo: "o técnico responde sabendo qual é o seu" },
      { valor: "Orçamento antes", rotulo: "nada é feito sem a sua aprovação" },
      { valor: "Venda e conserto", rotulo: "Apple novo e bancada no mesmo balcão" },
    ],
  },
  assistente: {
    titulo: "Qual é o seu Apple?",
    texto: "Escolha o aparelho e o que você precisa; a mensagem vai pronta.",
    abertura: "Olá! Vim pela página do especialista Apple.",
    fecho: "Posso mandar o modelo que aparece nos Ajustes e uma foto?",
    botao: "Enviar para o especialista",
    perguntas: [
      {
        rotulo: "Aparelho",
        pergunta: "Qual aparelho?",
        opcoes: ["iPhone", "MacBook Air", "MacBook Pro", "iPad", "iMac", "Mac mini", "Apple Watch"],
      },
      {
        rotulo: "Preciso de",
        pergunta: "O que você precisa?",
        opcoes: ["Conserto", "Tela ou bateria", "Avaliar se vale consertar", "Comprar um Apple novo", "Configurar o aparelho"],
      },
      {
        rotulo: "Idade do aparelho",
        pergunta: "Quanto tempo ele tem?",
        opcoes: ["Menos de 2 anos", "De 2 a 5 anos", "Mais de 5 anos", "Não sei"],
      },
    ],
  },
  secoes: [
    {
      tipo: "atalhos",
      titulo: "Escolha o seu aparelho",
      texto: "Cada página mostra os defeitos que mais aparecem naquela linha e o que o técnico precisa saber para orçar.",
      itens: [
        {
          titulo: "iPhone",
          texto: "Tela, bateria, conector de carga, câmera, aparelho que molhou ou não liga.",
          href: "/wendell/apple/iphone",
          imagem: "/images/apple/subcategories/iphone-card.png",
        },
        {
          titulo: "MacBook Air e MacBook Pro",
          texto: "Bateria, tela, teclado, trackpad, carregador e Mac que não liga.",
          href: "/wendell/apple/macbook",
          imagem: "/images/apple/subcategories/macbook-card.png",
        },
        {
          titulo: "iPad",
          texto: "Vidro e tela, bateria, conector e iPad que não carrega.",
          href: "/wendell/apple/ipad",
          imagem: "/images/apple/subcategories/ipad-card.png",
        },
        {
          titulo: "iMac",
          texto: "Lentidão, tela, fonte e iMac que não liga.",
          href: "/wendell/apple/imac",
          imagem: "/images/apple/subcategories/imac-card.png",
        },
        {
          titulo: "Mac mini",
          texto: "Não liga, desliga sozinho, portas e lentidão.",
          href: "/wendell/apple/mac-mini",
          imagem: "/images/apple/subcategories/macmini-card.png",
        },
        {
          titulo: "Apple Watch",
          texto: "Vidro trincado, bateria estufada e relógio que não carrega.",
          href: "/wendell/apple/apple-watch",
          imagem: "/images/apple/subcategories/watch-card.png",
        },
      ],
    },
    {
      tipo: "dados",
      titulo: "Como achar o modelo exato",
      texto:
        "\"iPhone 13\" ou \"MacBook Air\" não bastam: dentro da mesma linha há tamanhos, chips e anos diferentes, com peças diferentes. Com o modelo exato, o orçamento sai certo de primeira.",
      linhas: [
        ["iPhone", "Ajustes > Geral > Sobre > Nome do Modelo"],
        ["iPad", "Ajustes > Geral > Sobre > Nome do Modelo"],
        ["MacBook, iMac e Mac mini", "Menu Apple (a maçã no canto) > Sobre Este Mac: aparecem o ano e o chip"],
        ["Apple Watch", "No iPhone, app Watch > Geral > Sobre; ou a caixa do relógio, com o tamanho em mm"],
        ["Aparelho que não liga", "Número de série na caixa, na nota fiscal ou gravado no próprio aparelho"],
      ],
    },
    {
      tipo: "comparativo",
      titulo: "O que mais chega de cada aparelho",
      texto: "Um resumo do balcão para você chegar sabendo o que pode ser e o que levar.",
      colunas: ["Aparelho", "Defeitos que mais aparecem", "O que trazer junto"],
      linhas: [
        ["iPhone", "Tela trincada, bateria gasta, conector sujo, queda na água", "Senha de desbloqueio e backup feito"],
        ["MacBook", "Bateria, teclado depois de líquido, tela, não liga", "O carregador original ou o que você usa"],
        ["iPad", "Vidro trincado, bateria, não carrega", "Cabo e carregador"],
        ["iMac", "Lentidão, tela com manchas, não liga", "Só o iMac; teclado e mouse se tiverem defeito"],
        ["Mac mini", "Não liga, desliga sozinho, portas falhando", "O cabo de energia"],
        ["Apple Watch", "Vidro trincado, bateria estufada, não carrega", "A base de carregamento"],
      ],
    },
    {
      tipo: "texto",
      titulo: "Por que um balcão Apple, e não só uma bancada",
      paragrafos: [
        "Quem tem um aparelho Apple quase sempre tem mais de um: o iPhone conversa com o Mac, o Apple Watch depende do iPhone, as fotos estão no iCloud. Um defeito num deles mexe com os outros, e a decisão entre consertar e trocar passa por isso. Por isso, na Balão, venda e assistência ficam no mesmo endereço, e a mesma equipe que testa o seu aparelho mostra as opções novas quando o conserto não compensa.",
        "Na prática, o especialista Apple cuida de três coisas. A primeira é o diagnóstico: descobrir se o defeito é peça trocável ou placa antes de falar em preço. A segunda é a escolha da peça: para tela e bateria pode haver mais de uma opção para o mesmo modelo, e o técnico explica a diferença no orçamento. A terceira é a conta honesta: quando o aparelho já não recebe atualização do sistema ou o conserto chega perto do preço de um novo, você ouve isso antes de gastar.",
        "Se o seu caso é tela ou bateria de iPhone, a página de troca de tela e bateria explica os sintomas e a saúde da bateria em detalhe. Para qualquer outro defeito, a página de assistência Apple mostra como o diagnóstico funciona e os cuidados antes de trazer o aparelho.",
      ],
      imagem: { src: "/images/apple/hub-hero-real.png", alt: "Balcão de atendimento da Balão da Informática com a marca da loja na parede" },
      lado: "esquerda",
    },
    {
      tipo: "atalhos",
      titulo: "Já sabe o que precisa?",
      itens: [
        {
          titulo: "Troca de tela e bateria de iPhone",
          texto: "Sintomas, saúde da bateria e orçamento pelo modelo.",
          href: "/telaiphone",
        },
        {
          titulo: "Assistência Apple: diagnóstico e conserto",
          texto: "Não liga, não carrega, molhou, teclado, lentidão.",
          href: "/reparoapple",
        },
        {
          titulo: "Recuperação de dados",
          texto: "Mac ou iPhone que não liga e arquivos sem backup.",
          href: "/recuperacaodados",
        },
      ],
    },
    {
      tipo: "vitrine",
      titulo: "Mac de mesa e energia para o seu Apple",
      texto: "O iMac novo à venda no site e as fontes e carregadores que mais saem no balcão Apple.",
      regras: [
        {
          id: "imac",
          titulo: "iMac",
          subtitulo: "O Mac de mesa com tela Retina, para casa e escritório",
          categorias: ["Computadores/PC/Computador IMAC"],
          nomeComeca: ["imac"],
          ordem: "menor",
          porMarca: 8,
          limite: 8,
        },
        {
          id: "energia-apple",
          titulo: "Fontes de MacBook e carregadores Apple",
          subtitulo: "Fonte para MacBook, carregador USB-C e base de Apple Watch",
          categorias: ["Energia/Fontes para Notebook", "Celular & Smartphone/Carregadores e Power Banks", "Informática/Cabos e Adaptadores"],
          nomeContem: ["macbook", "apple watch", "applewatch", "apple original"],
          excluir: ["lightning"],
          ordem: "maior",
          porMarca: 3,
          limite: 8,
        },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "A Balão é assistência autorizada Apple?",
      resposta:
        "Não. A Balão é uma loja de informática com assistência técnica própria no Cambuí, que atende aparelhos Apple. O técnico explica no orçamento as opções de peça para o seu modelo e o que muda em cada uma.",
    },
    {
      pergunta: "Quais aparelhos Apple vocês atendem?",
      resposta:
        "iPhone, iPad, MacBook Air, MacBook Pro, iMac, Mac mini e Apple Watch. Mande o modelo e o defeito pelo WhatsApp para confirmar o seu caso.",
    },
    {
      pergunta: "Como sei o modelo exato do meu iPhone ou Mac?",
      resposta:
        "No iPhone e no iPad, em Ajustes > Geral > Sobre. No Mac, no menu da maçã > Sobre Este Mac, que mostra o ano e o chip. Se o aparelho não liga, o número de série na caixa ou na nota fiscal resolve.",
    },
    {
      pergunta: "Vale a pena consertar um Apple com mais de cinco anos?",
      resposta:
        "Depende do defeito e de o aparelho ainda receber atualização do sistema. Tela, bateria e teclado costumam compensar; placa muito danificada em modelo antigo, nem sempre. O técnico faz essa conta com você antes do serviço.",
    },
    {
      pergunta: "Vocês vendem iPhone, MacBook e iMac novos?",
      resposta:
        "Sim. O site mostra os Apple novos com preço e disponibilidade do dia, e você pode fechar pelo site no Pix ou pelo WhatsApp e no balcão para parcelar no cartão.",
    },
    {
      pergunta: "Qual é a garantia do conserto?",
      resposta:
        "O serviço de assistência tem garantia de 90 dias, como prevê o Código de Defesa do Consumidor. Aparelho novo comprado na loja tem a garantia do fabricante.",
    },
  ],
  temas: ["apple", "iphone", "assistencia", "notebook", "compra"],
  termosDoBlog: ["apple", "iphone", "macbook", "imac", "mac mini", "ipad", "apple watch", "macos", "ios"],
  relacionadas: ["reparoapple", "telaiphone", "recuperacaodados", "notebooks"],
  final: {
    titulo: "Diga o aparelho e o modelo, e a bancada Apple responde",
    texto:
      "Com o modelo exato e uma foto, o especialista já adianta o que pode ser. A loja fica no Cambuí, na Av. Anchieta, 789.",
    botao: "Falar com o especialista Apple",
  },
};
