import type { PaginaDeCaptacao } from "../tipos";

const MENSAGEM =
  "Olá! Quero orçamento de conserto de iMac. Modelo ou ano: ____. Defeito: ____. Pode me passar preço e prazo?";

export const imac: PaginaDeCaptacao = {
  slug: "imac",
  nome: "Conserto de iMac",
  chamada: "iMac no Cambuí: não liga, tela com mancha, lentidão ou fonte, com diagnóstico antes do orçamento.",
  seo: {
    titulo: "Conserto de iMac em Campinas | Assistência no Cambuí",
    descricao:
      "Conserto de iMac no Cambuí: não liga, tela, lentidão e fonte. Assistência independente. Reparo em média 60 minutos, conforme o defeito e a peça. Até 12x sem juros.",
    palavras: [
      "conserto de imac campinas",
      "assistência imac cambuí",
      "imac não liga",
      "tela de imac com mancha",
      "imac lento o que fazer",
      "manutenção de imac campinas",
      "fonte de imac",
      "imac assistência independente",
    ],
    tipoDeServico: "Conserto de iMac",
    marca: "Apple",
    catalogo: ["Diagnóstico de iMac", "Reparo de tela de iMac", "iMac que não liga", "Limpeza e manutenção de iMac"],
  },
  hero: {
    contexto: "Especialista em Apple no Cambuí, em Campinas",
    titulo: "iMac que não liga ou ficou lento: a bancada vê antes de orçar",
    texto:
      "O iMac é um Mac de mesa, com tela e fonte no mesmo corpo. A Balão da Informática Anchieta diagnostica no Cambuí e só abre o aparelho depois do orçamento. Assistência especializada e independente. O reparo é rápido: em média 60 minutos, conforme o defeito e a peça. Parcelamento em até 12x sem juros. Preço confirmado pelo WhatsApp.",
    imagem: {
      src: "/images/landing/v3/imac/imac-hero.webp",
      alt: "Computador tudo-em-um azul sobre a mesa durante avaliação técnica, com chave de precisão na mão do técnico",
    },
    mensagem: MENSAGEM,
    botao: "Pedir preço no WhatsApp",
    secundario: { rotulo: "Ver o que a bancada olha", href: "#secao-2" },
    fatos: [
      { valor: "Em média 60 min", rotulo: "conforme o defeito e a peça" },
      { valor: "Até 12x", rotulo: "sem juros no cartão" },
      { valor: "Especialista", rotulo: "assistência Apple independente" },
      { valor: "Mac de mesa", rotulo: "tela, fonte e placa no mesmo corpo" },
    ],
  },
  assistente: {
    titulo: "Ano do iMac e o sintoma",
    texto: "Isso já adianta se o caso é tela, fonte ou sistema.",
    abertura: MENSAGEM,
    fecho: "Posso mandar o ano que aparece em Sobre Este Mac?",
    botao: "Enviar para a bancada",
    perguntas: [
      { rotulo: "Tela", pergunta: "Qual o tamanho da tela, se você souber?", opcoes: ["21,5 polegadas", "24 polegadas", "27 polegadas", "Não sei"] },
      {
        rotulo: "Defeito",
        pergunta: "O que está acontecendo?",
        varias: true,
        opcoes: ["Não liga", "Tela com mancha ou listra", "Lento", "Desliga sozinho", "Barulho ou esquenta"],
      },
      { rotulo: "Uso", pergunta: "Ele é de casa ou do trabalho?", opcoes: ["Casa", "Trabalho", "Os dois"] },
    ],
  },
  secoes: [
    {
      tipo: "texto",
      titulo: "iMac pede outro conserto que o MacBook",
      paragrafos: [
        "No iMac a tela, a fonte e a placa estão no mesmo chassi. Um risco na imagem pode ser o painel; um iMac que não acende pode ser a fonte. Abrir sem teste troca peça que não era o defeito. A bancada separa isso antes do preço.",
        "A loja é especialista em Apple e faz todos os serviços Apple e Android, com assistência especializada e independente. Não fala em nome da Apple e não usa o logo da marca. O endereço é Av. Anchieta, 789, Cambuí, Campinas. WhatsApp (19) 98751-0267. Telefone (19) 3255-1661.",
        "O reparo é rápido: em média 60 minutos, conforme o defeito e a peça. iMac de 27 polegadas e defeito de placa costumam ficar mais tempo na bancada, e o prazo sai no orçamento, não nesta página. Parcelamento em até 12x sem juros. Preço confirmado pelo WhatsApp.",
      ],
    },
    {
      tipo: "dores",
      titulo: "Defeitos de iMac que a bancada já conhece",
      itens: [
        {
          titulo: "Não liga",
          texto: "Sem luz nenhuma, o caminho começa pela energia. Com a maçã acesa e a tela escura, o teste segue para vídeo e placa.",
        },
        {
          titulo: "Mancha, listra ou imagem cortada",
          texto: "Pode ser o painel ou o cabo interno. A bancada não troca a tela inteira sem ver qual dos dois é.",
        },
        {
          titulo: "Lento para abrir e para salvar",
          texto: "Sistema cheio e armazenamento no fim da vida parecem a mesma coisa. O diagnóstico diz se formatar resolve ou se o disco é que pede atenção.",
        },
        {
          titulo: "Desliga sozinho ou esquenta a ponto de parar",
          texto: "Poeira e temperatura entram na avaliação. Não é o mesmo serviço de um notebook fino: o iMac abre por outro caminho.",
        },
      ],
    },
    {
      tipo: "retorno",
      titulo: "Pedir retorno rápido",
      texto: "Ano do iMac e o defeito bastam para a equipe retornar no WhatsApp com preço e prazo.",
      assunto: "Conserto de iMac",
      campos: [
        { nome: "modelo", rotulo: "Ano ou tamanho da tela" },
        { nome: "defeito", rotulo: "Defeito", opcoes: ["Não sei descrever", "Não liga", "Tela", "Lento", "Desliga sozinho"] },
      ],
    },
    {
      tipo: "passos",
      titulo: "Do WhatsApp até a retirada",
      texto: "O iMac vem sem teclado e mouse, a menos que eles também tenham defeito.",
      itens: [
        { titulo: "Mande o ano", texto: "Sobre Este Mac mostra o ano e o chip. Se não liga, o número de série na caixa ou na base resolve." },
        { titulo: "Traga o iMac", texto: "Av. Anchieta, 789, Cambuí. Segunda a sexta, 9h às 18h. Sábado, 9h às 13h. Motoboy em Campinas e região é combinado à parte, porque o iMac é grande." },
        { titulo: "Aprove", texto: "Causa, opções e valor no WhatsApp. Parcelamento em até 12x sem juros. Nada começa sem a sua aprovação." },
        { titulo: "Teste no balcão", texto: "Você vê o iMac ligado antes de levar. O reparo é rápido: em média 60 minutos, conforme o defeito e a peça." },
      ],
    },
    {
      tipo: "comparativo",
      titulo: "iMac, MacBook ou Mac mini",
      texto: "Cada um tem página. O hub junta a linha inteira.",
      colunas: ["Aparelho", "Quando é este", "Para onde ir"],
      linhas: [
        ["iMac", "Tela e computador no mesmo corpo, em cima da mesa", "Esta página"],
        ["MacBook", "Notebook Air ou Pro, com bateria e teclado", "Página de MacBook"],
        ["Mac mini", "Caixa pequena, usa monitor, teclado e mouse à parte", "Página de Mac mini"],
      ],
    },
    {
      tipo: "atalhos",
      titulo: "Outros aparelhos da mesma bancada",
      itens: [
        { titulo: "Serviços Apple", texto: "Hub com iPhone, iPad, MacBook, Mac mini e Watch.", href: "/reparoapple", imagem: "/images/landing/v3/reparoapple/reparoapple.webp", alt: "Bancada de assistência técnica com notebook, celular no suporte, lupa iluminada e ferramentas organizadas" },
        { titulo: "MacBook", texto: "Air e Pro: tela, bateria e teclado.", href: "/macbook", imagem: "/images/landing/v3/macbook/macbook-hero.webp", alt: "Técnico de luvas trabalhando na placa de um MacBook aberto na bancada" },
        { titulo: "Mac mini", texto: "Não liga, desliga sozinho e portas.", href: "/wendell/apple/mac-mini", imagem: "/images/landing/v3/reparoapple/macmini-card.webp", alt: "Computador compacto aberto mostrando a placa interna, com ferramentas de precisão ao redor" },
        { titulo: "iPhone", texto: "Tela, bateria e conector.", href: "/iphone", imagem: "/images/landing/v3/iphone/telaiphone.webp", alt: "Técnico de luvas avaliando um iPhone com a tela trincada na bancada de reparo" },
        { titulo: "Celular Android", texto: "Samsung, Motorola e outras marcas.", href: "/android", imagem: "/images/landing/v3/android/como-comprar.webp", alt: "Cliente entregando o celular ao técnico no balcão da loja" },
        { titulo: "Recuperação de dados", texto: "iMac que não liga e arquivos sem backup.", href: "/recuperacaodados", imagem: "/images/landing/v3/android/recuperacaodados.webp", alt: "Técnico segurando um SSD ao lado de notebook e disco externo para recuperação de dados" },
      ],
    },
    {
      tipo: "vitrine",
      titulo: "iMac novo, se a conta pedir troca",
      texto: "Preço do aparelho no catálogo. O conserto é outro valor, confirmado pelo WhatsApp.",
      regras: [
        {
          id: "imac",
          titulo: "iMac",
          subtitulo: "O Mac de mesa que está no catálogo agora",
          categorias: ["Computadores/PC/Computador IMAC"],
          nomeComeca: ["imac"],
          ordem: "menor",
          porMarca: 8,
          limite: 8,
          verTodos: { rotulo: "Ver iMac", href: "/categoria/computadores-pc-computador-imac" },
        },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Vocês consertam iMac em Campinas?",
      resposta:
        "Sim. A assistência é especializada e independente, na Av. Anchieta, 789, Cambuí. A Balão é especialista em Apple e atende iMac junto com o resto da linha e com celulares Android.",
    },
    {
      pergunta: "O conserto do iMac fica pronto no mesmo dia?",
      resposta:
        "O reparo é rápido: em média 60 minutos, conforme o defeito e a peça. Tela grande ou placa podem passar disso. Preço e prazo confirmados pelo WhatsApp (19) 98751-0267.",
    },
    {
      pergunta: "Dá para parcelar?",
      resposta: "Sim. Parcelamento em até 12x sem juros. O valor do serviço não está nesta página: é confirmado pelo WhatsApp.",
    },
    {
      pergunta: "Quanto custa consertar um iMac que não liga?",
      resposta: "Só depois do teste. Pode ser fonte, placa ou outro ponto. Preço confirmado pelo WhatsApp, antes de qualquer serviço.",
    },
    {
      pergunta: "Preciso levar teclado e mouse?",
      resposta: "Só se eles também apresentarem defeito. Para o iMac em si, o aparelho basta. Se não liga, leve a caixa ou anote o número de série.",
    },
    {
      pergunta: "A Balão usa logo da Apple ou é canal do fabricante?",
      resposta:
        "Não. É assistência especializada e independente, especialista em Apple, sem logo da marca e sem falar em nome do fabricante.",
    },
  ],
  tituloDasPerguntas: "Perguntas frequentes",
  temas: ["apple", "imac", "assistencia", "manutencao"],
  termosDoBlog: ["imac", "mac", "apple", "não liga", "tela"],
  relacionadas: ["reparoapple", "macbook", "iphone", "android"],
  final: {
    titulo: "Mande o ano do iMac",
    texto: "Av. Anchieta, 789, Cambuí. Segunda a sexta, 9h às 18h. Sábado, 9h às 13h. Preço confirmado pelo WhatsApp.",
    botao: "Chamar no WhatsApp",
    mensagem: MENSAGEM,
  },
};
