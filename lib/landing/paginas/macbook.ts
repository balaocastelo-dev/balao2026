import type { PaginaDeCaptacao } from "../tipos";

const MENSAGEM =
  "Olá! Quero orçamento de conserto de MacBook. Modelo (Air ou Pro, ano ou chip): ____. Defeito: ____. Pode me passar preço e prazo?";

export const macbook: PaginaDeCaptacao = {
  slug: "macbook",
  nome: "Conserto de MacBook",
  chamada: "MacBook Air e MacBook Pro no Cambuí: tela, bateria, teclado e o Mac que não liga, com orçamento antes.",
  seo: {
    titulo: "Assistência Especializada em MacBook em Campinas | Balão Anchieta",
    descricao:
      "Conserto de MacBook Air e Pro no Cambuí: tela, bateria, teclado e placa. Reparo em média 60 minutos, conforme o defeito e a peça. Até 12x sem juros.",
    palavras: [
      "conserto de macbook campinas",
      "assistência macbook cambuí",
      "troca de tela macbook campinas",
      "troca de bateria macbook",
      "macbook não liga campinas",
      "teclado de macbook com defeito",
      "macbook caiu líquido",
      "macbook air ou pro conserto",
    ],
    tipoDeServico: "Conserto de MacBook",
    marca: "Apple",
    catalogo: [
      "Troca de tela de MacBook",
      "Troca de bateria de MacBook",
      "Troca de teclado e trackpad",
      "Diagnóstico de MacBook que não liga",
      "Limpeza e manutenção",
    ],
  },
  hero: {
    contexto: "Especialista em Apple no Cambuí, em Campinas",
    titulo: "MacBook Air ou Pro de volta ao uso, com orçamento antes",
    texto:
      "Tela, bateria, teclado, líquido ou Mac que não liga: a bancada da Balão da Informática Anchieta testa o modelo e manda o orçamento pelo WhatsApp. Assistência especializada e independente, na Av. Anchieta, 789. O reparo é rápido: em média 60 minutos, conforme o defeito e a peça. Parcelamento em até 12x sem juros. Preço confirmado pelo WhatsApp.",
    imagem: {
      src: "/images/landing/v3/macbook/macbook-hero.webp",
      alt: "Técnico de luvas trabalhando na placa de um MacBook aberto na bancada",
    },
    mensagem: MENSAGEM,
    botao: "Pedir preço no WhatsApp",
    secundario: { rotulo: "Ver os defeitos de MacBook", href: "#secao-1" },
    fatos: [
      { valor: "Em média 60 min", rotulo: "conforme o defeito e a peça" },
      { valor: "Até 12x", rotulo: "sem juros no cartão" },
      { valor: "Especialista", rotulo: "assistência Apple independente" },
      { valor: "Air e Pro", rotulo: "orçamento pelo modelo, antes de abrir" },
    ],
  },
  assistente: {
    titulo: "Diga se é Air ou Pro e o que aconteceu",
    texto: "Com o modelo a equipe já separa o que precisa olhar.",
    abertura: MENSAGEM,
    fecho: "Posso mandar a foto da tela Sobre Este Mac e do defeito?",
    botao: "Enviar para a bancada",
    perguntas: [
      { rotulo: "Linha", pergunta: "Qual MacBook?", opcoes: ["MacBook Air", "MacBook Pro", "Não sei"] },
      {
        rotulo: "Defeito",
        pergunta: "O que está acontecendo?",
        varias: true,
        opcoes: ["Não liga", "Tela", "Bateria", "Teclado ou trackpad", "Molhou", "Lento ou esquentando"],
      },
      { rotulo: "Liga?", pergunta: "Ele ainda liga?", opcoes: ["Liga", "Liga com defeito", "Não liga"] },
    ],
  },
  secoes: [
    {
      tipo: "texto",
      titulo: "Conserto de MacBook na mesma loja que vende Apple",
      paragrafos: [
        "MacBook Air e MacBook Pro compartilham o nome e quase nada da peça. O ano e o chip mudam tela, bateria, teclado e se o armazenamento pode ser trocado. Por isso o orçamento começa pelo modelo, no menu da maçã, em Sobre Este Mac, ou pelo número de série na caixa.",
        "A Balão da Informática Anchieta é especialista em Apple e faz todos os serviços Apple e Android. No MacBook, a assistência é especializada e independente: a loja não fala em nome da Apple e não usa o logo da marca. A bancada fica na Av. Anchieta, 789, Cambuí, em Campinas. WhatsApp (19) 98751-0267. Telefone (19) 3255-1661.",
        "O reparo é rápido: em média 60 minutos, conforme o defeito e a peça. Placa, peça fora de estoque ou líquido espalhado podem levar mais, e você fica sabendo disso antes de aprovar. O pagamento do serviço pode ser parcelado em até 12x sem juros. Preço confirmado pelo WhatsApp.",
      ],
    },
    {
      tipo: "dores",
      titulo: "O que mais chega de MacBook Air e Pro",
      texto: "O sintoma aponta o caminho. O teste na bancada confirma se é peça ou placa.",
      itens: [
        {
          titulo: "Não liga ou fica na maçã",
          texto: "Pode ser bateria esgotada, carregador, conector ou placa. Traga o carregador que você usa: ele entra no teste.",
        },
        {
          titulo: "Tela com mancha, linha ou trinca",
          texto: "A bancada vê se o defeito está no painel ou no cabo, antes de falar em troca de tela.",
        },
        {
          titulo: "Bateria que não segura ou está estufada",
          texto: "Bateria estufada deforma o fundo do MacBook. Pare de carregar e traga. Não aperte a carcaça.",
        },
        {
          titulo: "Tecla morta ou trackpad sem clique",
          texto: "Líquido e desgaste são as causas mais comuns. O histórico (caiu bebida, já foi aberto) encurta o diagnóstico.",
        },
        {
          titulo: "Caiu líquido",
          texto: "Desligue, não carregue e não ligue para testar. Quanto antes chega à bancada, melhor a chance de limitar a corrosão.",
        },
        {
          titulo: "Lento ou esquentando",
          texto: "Pode ser sistema, armazenamento ou poeira. Se o caso for disco, a página de upgrade de SSD explica a troca. Se não ligar, não é upgrade.",
        },
      ],
    },
    {
      tipo: "retorno",
      titulo: "Pedir retorno rápido",
      texto: "Deixe o modelo e o defeito. A equipe responde preço e prazo no WhatsApp.",
      assunto: "Conserto de MacBook",
      campos: [
        { nome: "modelo", rotulo: "Modelo (Air ou Pro, ano ou chip)" },
        {
          nome: "defeito",
          rotulo: "Defeito",
          opcoes: ["Não sei descrever", "Não liga", "Tela", "Bateria", "Teclado ou trackpad", "Molhou", "Lento"],
        },
      ],
    },
    {
      tipo: "passos",
      titulo: "Como o MacBook é atendido no Cambuí",
      texto: "Quatro passos. Preço e prazo confirmados pelo WhatsApp.",
      itens: [
        { titulo: "Mande o modelo", texto: "Air ou Pro, o ano e o que aconteceu. Foto da tela Sobre Este Mac ajuda." },
        { titulo: "Traga à loja", texto: "Av. Anchieta, 789, Cambuí. Segunda a sexta, 9h às 18h. Sábado, 9h às 13h. Em Campinas e região, a coleta por motoboy é combinada à parte." },
        { titulo: "Aprove o orçamento", texto: "A bancada diz a causa, as opções de peça, o valor e o prazo. Nada começa sem o seu ok. Parcelamento em até 12x sem juros." },
        { titulo: "Retire testado", texto: "Você confere o Mac ligado no balcão. O reparo é rápido: em média 60 minutos, conforme o defeito e a peça." },
      ],
    },
    {
      tipo: "regras",
      titulo: "O que muda de um MacBook para outro",
      itens: [
        {
          titulo: "Air e Pro não usam a mesma peça",
          texto: "Tamanho da tela, ano e chip definem a peça. “MacBook 13” não basta para orçar. O modelo exato evita comprar a tela errada.",
        },
        {
          titulo: "Assistência especializada e independente",
          texto: "A Balão é especialista em Apple e atende a linha inteira, além de celulares Android. Não é canal do fabricante. As opções de peça são explicadas no orçamento.",
        },
        {
          titulo: "Quando o conserto não compensa",
          texto: "Placa muito danificada em modelo antigo pode chegar perto de um MacBook novo da loja. A bancada fala isso antes de você gastar. A vitrine abaixo mostra o que está no catálogo.",
        },
      ],
    },
    {
      tipo: "atalhos",
      titulo: "Se o caso for outro aparelho",
      itens: [
        { titulo: "Serviços Apple", texto: "O hub da linha: iPhone, iPad, iMac, Mac mini e Watch.", href: "/reparoapple", imagem: "/images/landing/v3/reparoapple/reparoapple.webp", alt: "Bancada de assistência técnica com notebook, celular no suporte, lupa iluminada e ferramentas organizadas" },
        { titulo: "iMac", texto: "O Mac de mesa: tela, fonte e o que não liga.", href: "/imac", imagem: "/images/landing/v3/imac/imac-hero.webp", alt: "Computador tudo-em-um azul sobre a mesa durante avaliação técnica, com chave de precisão na mão do técnico" },
        { titulo: "iPhone", texto: "Tela, bateria, carga e aparelho que molhou.", href: "/iphone", imagem: "/images/landing/v3/iphone/telaiphone.webp", alt: "Técnico de luvas avaliando um iPhone com a tela trincada na bancada de reparo" },
        { titulo: "Celular Android", texto: "A mesma bancada, para Samsung, Motorola e outras marcas.", href: "/android", imagem: "/images/landing/v3/android/como-comprar.webp", alt: "Cliente entregando o celular ao técnico no balcão da loja" },
        { titulo: "Upgrade de SSD", texto: "Quando a lentidão é de disco e o modelo aceita troca.", href: "/upgrade-ssd", imagem: "/images/landing/v3/android/manutencao.webp", alt: "Técnico limpando a ventoinha e trocando a pasta térmica de um notebook aberto" },
        { titulo: "Notebooks de outras marcas", texto: "Dell, Lenovo, Acer, HP, Asus e Samsung.", href: "/manutencao", imagem: "/images/landing/v3/android/manutencao.webp", alt: "Técnico limpando a ventoinha e trocando a pasta térmica de um notebook aberto" },
      ],
    },
    {
      tipo: "vitrine",
      titulo: "MacBook à venda, se trocar compensar",
      texto: "A vitrine mostra o preço do aparelho novo no catálogo de hoje. O conserto não está nesse valor: preço confirmado pelo WhatsApp.",
      regras: [
        {
          id: "macbook",
          titulo: "MacBook Air e MacBook Pro",
          subtitulo: "Air para o dia a dia, Pro para trabalho pesado",
          categorias: ["Computadores/Notebooks/Macbook"],
          ordem: "menor",
          porMarca: 6,
          limite: 8,
          verTodos: { rotulo: "Ver todos os MacBooks", href: "/categoria/computadores-notebooks-macbook" },
        },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Vocês consertam MacBook Air e MacBook Pro em Campinas?",
      resposta:
        "Sim. A Balão da Informática Anchieta, na Av. Anchieta, 789, Cambuí, é especialista em Apple e faz o conserto de MacBook Air e MacBook Pro em assistência especializada e independente. Mande o modelo no WhatsApp (19) 98751-0267.",
    },
    {
      pergunta: "Quanto tempo leva o conserto do MacBook?",
      resposta:
        "O reparo é rápido: em média 60 minutos, conforme o defeito e a peça. Defeito de placa ou peça que precisa ser encomendada leva mais. Preço e prazo confirmados pelo WhatsApp.",
    },
    {
      pergunta: "Dá para parcelar o conserto do MacBook?",
      resposta: "Sim. Parcelamento em até 12x sem juros. O valor depende do modelo e do defeito e é confirmado pelo WhatsApp antes do serviço.",
    },
    {
      pergunta: "Quanto custa trocar tela ou bateria de MacBook?",
      resposta:
        "Depende do ano e do chip. Esta página não publica o valor. Preço confirmado pelo WhatsApp (19) 98751-0267, depois que a bancada vê o modelo. Nada é feito sem a sua aprovação.",
    },
    {
      pergunta: "Meu MacBook caiu líquido. O que eu faço?",
      resposta: "Desligue, não carregue e não ligue para testar. Traga o quanto antes à loja do Cambuí, com o carregador.",
    },
    {
      pergunta: "A loja é canal da Apple?",
      resposta:
        "Não. É assistência especializada e independente. A equipe explica as opções de peça no orçamento e não usa o logo da marca. Para aparelho ainda na garantia do fabricante, o caminho é acionar o próprio fabricante.",
    },
  ],
  tituloDasPerguntas: "Perguntas frequentes",
  temas: ["apple", "macbook", "notebook", "assistencia", "manutencao"],
  termosDoBlog: ["macbook", "macbook air", "macbook pro", "bateria", "teclado", "apple"],
  relacionadas: ["reparoapple", "imac", "iphone", "upgrade-ssd"],
  final: {
    titulo: "Mande o modelo do MacBook e receba o preço",
    texto: "Av. Anchieta, 789, Cambuí. Segunda a sexta, 9h às 18h. Sábado, 9h às 13h. Preço confirmado pelo WhatsApp.",
    botao: "Chamar no WhatsApp",
    mensagem: MENSAGEM,
  },
};
