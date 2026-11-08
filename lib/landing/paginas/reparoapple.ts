import type { PaginaDeCaptacao } from "../tipos";

// Hub dos serviços Apple. As páginas por aparelho são /macbook, /imac e
// /iphone (tela e bateria de iPhone continuam em /telaiphone). iPad, Mac mini
// e Apple Watch seguem em /wendell/apple. Celular Android tem página própria.
// Assistência especializada e independente, sem logo da marca. Prazo só com
// "em média" e "conforme o defeito e a peça".

const MENSAGEM =
  "Olá! Quero orçamento de serviço Apple. Aparelho: ____. Defeito: ____. Pode me passar preço e prazo?";

export const reparoapple: PaginaDeCaptacao = {
  slug: "reparoapple",
  nome: "Serviços Apple",
  chamada: "Hub da assistência Apple no Cambuí: iPhone, MacBook, iMac, iPad, Mac mini e Apple Watch, com orçamento antes.",
  seo: {
    titulo: "Serviços Apple em Campinas | Especialista no Cambuí – Balão Anchieta",
    descricao:
      "Especialista em Apple no Cambuí: iPhone, MacBook e iMac com assistência independente. Reparo em média 60 minutos, conforme o defeito e a peça. Até 12x sem juros.",
    palavras: [
      "serviços apple campinas",
      "assistência técnica apple cambuí",
      "especialista em apple campinas",
      "conserto de iphone campinas",
      "conserto de macbook campinas",
      "conserto de imac campinas",
      "assistência apple independente",
      "conserto de ipad campinas",
    ],
    tipoDeServico: "Assistência técnica para aparelhos Apple",
    marca: "Apple",
    catalogo: [
      "Conserto de iPhone",
      "Conserto de MacBook",
      "Conserto de iMac",
      "Conserto de iPad",
      "Conserto de Mac mini",
      "Conserto de Apple Watch",
    ],
  },
  hero: {
    contexto: "Especialista em Apple no Cambuí, em Campinas",
    titulo: "Todos os serviços Apple, com orçamento antes de abrir",
    texto:
      "iPhone, iPad, MacBook, iMac, Mac mini e Apple Watch. A Balão da Informática Anchieta é especialista em Apple e faz todos os serviços Apple e Android, com assistência especializada e independente. O reparo é rápido: em média 60 minutos, conforme o defeito e a peça. Parcelamento em até 12x sem juros. Preço confirmado pelo WhatsApp. Loja na Av. Anchieta, 789.",
    imagem: {
      src: "/images/landing/v3/reparoapple/reparoapple.webp",
      alt: "Bancada de assistência técnica com notebook, celular no suporte, lupa iluminada e ferramentas organizadas",
    },
    mensagem: MENSAGEM,
    botao: "Pedir preço no WhatsApp",
    secundario: { rotulo: "Escolher o aparelho", href: "#secao-1" },
    fatos: [
      { valor: "Em média 60 min", rotulo: "conforme o defeito e a peça" },
      { valor: "Até 12x", rotulo: "sem juros no cartão" },
      { valor: "Especialista", rotulo: "assistência Apple independente" },
      { valor: "Apple e Android", rotulo: "todos os serviços na mesma bancada" },
    ],
  },
  assistente: {
    titulo: "Diga o aparelho e o defeito",
    texto: "A mensagem vai pronta para a bancada.",
    abertura: MENSAGEM,
    fecho: "Posso mandar foto do aparelho e o modelo que aparece em Ajustes?",
    botao: "Enviar para a bancada",
    perguntas: [
      {
        rotulo: "Aparelho",
        pergunta: "Qual aparelho?",
        opcoes: ["iPhone", "iPad", "MacBook", "iMac", "Mac mini", "Apple Watch", "Android"],
      },
      {
        rotulo: "Defeito",
        pergunta: "O que está acontecendo?",
        varias: true,
        opcoes: ["Não liga", "Não carrega", "Molhou", "Tela", "Bateria", "Teclado", "Lento", "Outro defeito"],
      },
      {
        rotulo: "Situação",
        pergunta: "O aparelho ainda liga?",
        opcoes: ["Liga normalmente", "Liga com defeito", "Não liga de jeito nenhum"],
      },
    ],
  },
  secoes: [
    {
      tipo: "atalhos",
      titulo: "Escolha o aparelho",
      texto: "Cada página trata de um aparelho. O que vale para todos está nesta.",
      itens: [
        { titulo: "iPhone", texto: "Tela, bateria, carga, câmera e líquido.", href: "/iphone", imagem: "/images/landing/v3/iphone/telaiphone.webp", alt: "Técnico de luvas avaliando um iPhone com a tela trincada na bancada de reparo" },
        { titulo: "Tela e bateria de iPhone", texto: "Trinca, toque e saúde da bateria, em detalhe.", href: "/telaiphone", imagem: "/images/landing/v3/reparoapple/iphone-card.webp", alt: "Celular com câmera tripla em suporte de bancada ao lado de pinça e chaves de precisão" },
        { titulo: "MacBook", texto: "Air e Pro: tela, bateria, teclado e o que não liga.", href: "/macbook", imagem: "/images/landing/v3/macbook/macbook-hero.webp", alt: "Técnico de luvas trabalhando na placa de um MacBook aberto na bancada" },
        { titulo: "iMac", texto: "Mac de mesa: tela, fonte e lentidão.", href: "/imac", imagem: "/images/landing/v3/imac/imac-hero.webp", alt: "Computador tudo-em-um azul sobre a mesa durante avaliação técnica, com chave de precisão na mão do técnico" },
        { titulo: "iPad", texto: "Vidro, bateria e conector.", href: "/wendell/apple/ipad", imagem: "/images/landing/v3/reparoapple/ipad-card.webp", alt: "Tablet prateado sobre manta de reparo com chave de precisão ao lado" },
        { titulo: "Mac mini", texto: "Não liga, desliga sozinho e portas.", href: "/wendell/apple/mac-mini", imagem: "/images/landing/v3/reparoapple/macmini-card.webp", alt: "Computador compacto aberto mostrando a placa interna, com ferramentas de precisão ao redor" },
        { titulo: "Apple Watch", texto: "Vidro, bateria e relógio que não carrega.", href: "/wendell/apple/apple-watch", imagem: "/images/landing/v3/reparoapple/watch-card.webp", alt: "Relógio inteligente com pulseira esportiva sobre manta de reparo ao lado de uma pinça" },
        { titulo: "Celular Android", texto: "Samsung, Motorola e outras marcas, na mesma bancada.", href: "/android", imagem: "/images/landing/v3/android/como-comprar.webp", alt: "Cliente entregando o celular ao técnico no balcão da loja" },
        { titulo: "Especialista por aparelho", texto: "Como achar o modelo exato antes de vir.", href: "/wendell/apple", imagem: "/images/landing/v3/reparoapple/wendell-apple.webp", alt: "Técnico fazendo microsolda em placa de celular sob microscópio" },
      ],
    },
    {
      tipo: "texto",
      titulo: "Assistência especializada e independente",
      paragrafos: [
        "A Balão da Informática Anchieta é especialista em Apple. Faz todos os serviços Apple e Android na bancada da Av. Anchieta, 789, Cambuí, em Campinas. A assistência é especializada e independente: a loja não fala em nome da Apple e não usa o logo da marca.",
        "O reparo é rápido: em média 60 minutos, conforme o defeito e a peça. Placa, líquido ou peça que precisa ser encomendada passam desse tempo, e o prazo vai escrito no orçamento. O pagamento pode ser parcelado em até 12x sem juros. Preço confirmado pelo WhatsApp (19) 98751-0267. Telefone (19) 3255-1661.",
        "Aparelho Apple é integrado: a mesma placa cuida de carga, tela e biometria. Um iPhone que não carrega pode ter só sujeira no conector. Um MacBook que não liga pode ter só a bateria esgotada. O teste vem antes do orçamento para você não pagar peça que não resolve.",
      ],
      lista: [
        "Teste de carga, bateria e conector",
        "Inspeção de líquido e de queda",
        "Conferência do modelo e das opções de peça",
        "Orçamento no WhatsApp antes de começar",
      ],
      imagem: {
        src: "/images/landing/v3/iphone/iphone-interno-reparo.webp",
        alt: "Smartphone aberto na bancada com a tela suspensa por ventosa e técnico usando pinça nos componentes internos",
      },
      lado: "direita",
    },
    {
      tipo: "retorno",
      titulo: "Pedir retorno rápido",
      texto: "Aparelho e defeito. A equipe responde preço e prazo no WhatsApp.",
      assunto: "Serviço Apple",
      campos: [
        { nome: "aparelho", rotulo: "Aparelho e modelo" },
        {
          nome: "defeito",
          rotulo: "Defeito",
          opcoes: ["Não sei descrever", "Não liga", "Não carrega", "Tela", "Bateria", "Molhou", "Teclado"],
        },
      ],
    },
    {
      tipo: "dores",
      titulo: "Defeitos que aparecem em mais de um aparelho",
      texto: "O primeiro trabalho é separar peça trocável de placa.",
      itens: [
        {
          titulo: "Não liga ou fica na maçã",
          texto: "Bateria, carregador, conector ou placa. O teste com fonte de bancada mostra se o aparelho puxa energia.",
        },
        {
          titulo: "Não carrega",
          texto: "Sujeira no conector resolve parte dos casos. Quando não resolve, a peça ou o cabo flexível entram no orçamento.",
        },
        {
          titulo: "Caiu líquido",
          texto: "Desligue, não carregue e não ligue para testar. Arroz não seca a placa. Quanto antes chega, melhor.",
        },
        {
          titulo: "Tela quebrada ou sem toque",
          texto: "No iPhone e no iPad a tela sai em conjunto. No MacBook e no iMac a bancada vê se o defeito é cabo ou painel.",
        },
        {
          titulo: "Bateria fraca ou estufada",
          texto: "Bateria estufada levanta tela de iPhone, iPad e Apple Watch ou deforma o fundo do MacBook. Pare de carregar.",
        },
        {
          titulo: "Lento",
          texto: "No Mac, pode ser disco ou sistema. A bancada diz se o caminho é conserto, formatação ou upgrade, antes de você gastar.",
        },
      ],
    },
    {
      tipo: "passos",
      titulo: "Como o serviço acontece",
      texto: "Segunda a sexta, 9h às 18h. Sábado, 9h às 13h.",
      itens: [
        { titulo: "Mande o modelo", texto: "Ajustes, Sobre Este Mac ou a caixa. Foto do problema ajuda. Não envie senha de ID Apple." },
        { titulo: "Traga à loja", texto: "Av. Anchieta, 789, Cambuí. Em Campinas e região, a coleta por motoboy é combinada à parte." },
        { titulo: "Aprove", texto: "Causa, opções de peça, valor e prazo. Parcelamento em até 12x sem juros. Nada começa sem a sua aprovação." },
        { titulo: "Retire testado", texto: "Você confere o aparelho no balcão. O reparo é rápido: em média 60 minutos, conforme o defeito e a peça." },
      ],
    },
    {
      tipo: "comparativo",
      titulo: "Consertar ou trocar",
      texto: "A conta é feita no balcão, com o preço do conserto ao lado do aparelho novo.",
      colunas: ["Situação", "Costuma compensar consertar", "Quando pensar em trocar"],
      linhas: [
        ["Tela quebrada, aparelho bom", "Troca da tela", "Modelo antigo, já sem atualização"],
        ["Bateria durando pouco", "Troca da bateria", "Quando outras peças também estão no fim"],
        ["Não carrega", "Limpeza ou troca do conector", "Defeito de placa somado a outros problemas"],
        ["Molhou", "Limpeza, se avaliado cedo", "Oxidação espalhada"],
        ["Mac lento", "Disco ou sistema, depois do teste", "Quando o uso pede outro aparelho"],
      ],
    },
    {
      tipo: "vitrine",
      titulo: "Se a conta pedir aparelho novo",
      texto: "Preço do produto no catálogo. O conserto é outro valor, confirmado pelo WhatsApp.",
      regras: [
        {
          id: "iphone",
          titulo: "iPhone",
          categorias: ["Celular & Smartphone/Smartphones/iPhone"],
          excluir: ["1tb", "2tb"],
          ordem: "menor",
          porMarca: 4,
          limite: 8,
          verTodos: { rotulo: "Ver iPhones", href: "/categoria/celular-smartphone-smartphones-iphone" },
        },
        {
          id: "macbook",
          titulo: "MacBook",
          categorias: ["Computadores/Notebooks/Macbook"],
          ordem: "menor",
          porMarca: 6,
          limite: 8,
          verTodos: { rotulo: "Ver MacBooks", href: "/categoria/computadores-notebooks-macbook" },
        },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Quais serviços Apple a Balão faz?",
      resposta:
        "Todos os serviços Apple do balcão: iPhone, iPad, MacBook, iMac, Mac mini e Apple Watch, além de celulares Android. A loja é especialista em Apple, com assistência especializada e independente, na Av. Anchieta, 789, Cambuí.",
    },
    {
      pergunta: "Quanto tempo leva o reparo?",
      resposta:
        "O reparo é rápido: em média 60 minutos, conforme o defeito e a peça. Placa, líquido ou peça encomendada podem levar mais. Preço e prazo confirmados pelo WhatsApp (19) 98751-0267.",
    },
    {
      pergunta: "Dá para parcelar o conserto?",
      resposta: "Sim. Parcelamento em até 12x sem juros. O valor depende do aparelho e do defeito e não está publicado nesta página.",
    },
    {
      pergunta: "Quanto custa?",
      resposta: "Preço confirmado pelo WhatsApp, depois do modelo e do defeito. Nenhum serviço começa sem a sua aprovação.",
    },
    {
      pergunta: "A assistência é canal da Apple?",
      resposta:
        "Não. É assistência especializada e independente. A loja não usa o logo da marca e não fala em nome do fabricante. Aparelho ainda na garantia do fabricante deve ser encaminhado ao fabricante.",
    },
    {
      pergunta: "Vou perder meus dados?",
      resposta:
        "Troca de tela, bateria ou conector em geral não apaga o aparelho. Faça backup se ele ainda liga. Se não liga, avise: a recuperação de dados entra na conversa antes do serviço.",
    },
    {
      pergunta: "Meu aparelho caiu na água. O que eu faço?",
      resposta: "Desligue, não carregue e não ligue para testar. Não use arroz. Traga o quanto antes à loja do Cambuí.",
    },
  ],
  tituloDasPerguntas: "Perguntas frequentes",
  temas: ["apple", "iphone", "macbook", "imac", "assistencia", "android"],
  termosDoBlog: ["apple", "iphone", "macbook", "ipad", "imac", "apple watch", "bateria"],
  relacionadas: ["macbook", "imac", "iphone", "android"],
  final: {
    titulo: "Mande o aparelho e o defeito",
    texto: "Av. Anchieta, 789, Cambuí. Segunda a sexta, 9h às 18h. Sábado, 9h às 13h. Preço confirmado pelo WhatsApp.",
    botao: "Chamar no WhatsApp",
    mensagem: MENSAGEM,
  },
};
