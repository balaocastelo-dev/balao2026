import type { PaginaDeCaptacao } from "../tipos";

export const consignacao: PaginaDeCaptacao = {
  slug: "consignacao",
  nome: "Consignação de notebook, PC, console e iPhone usados",
  chamada: "Deixe o usado na vitrine da loja do Cambuí: a equipe avalia, expõe e atende o comprador por você.",
  seo: {
    titulo: "Vender notebook, PC ou iPhone usado em consignação em Campinas | Balão",
    descricao:
      "Venda seu notebook, PC gamer, MacBook, iPhone ou console usado em consignação na loja do Cambuí, em Campinas. Avaliação pelo WhatsApp, vitrine e comprador atendidos.",
    palavras: [
      "vender notebook usado em Campinas",
      "consignação de computador Campinas",
      "onde vender PC gamer usado Campinas",
      "vender MacBook usado Campinas",
      "vender iPhone usado com segurança Campinas",
      "vender PlayStation usado Campinas",
      "loja que vende usado em consignação Cambuí",
      "como vender notebook usado sem cair em golpe",
      "quanto vale meu notebook usado",
      "consignação de eletrônicos Campinas",
    ],
    tipoDeServico: "Consignação de computadores e eletrônicos usados",
  },
  hero: {
    contexto: "Consignação na loja do Cambuí, em Campinas",
    titulo: "Venda seu usado sem marcar encontro com estranho",
    texto:
      "Notebook, PC, MacBook, iPhone ou console que ficou parado: mande as fotos, a equipe avalia e diz se tem saída. O aparelho fica exposto na loja, quem atende o comprador é a Balão e você recebe quando ele for vendido.",
    imagem: {
      src: "/images/landing/v2/consignacao.jpg",
      alt: "Notebook, console e smartphone usados sobre a mesa sendo fotografados por um celular",
    },
    mensagem: "Olá! Vim pela página de consignação da Balão e quero avaliar um aparelho usado para vender.",
    botao: "Mandar fotos para avaliação",
    secundario: { rotulo: "Ver como funciona", href: "#secao-2" },
    fatos: [
      { valor: "Loja física", rotulo: "o comprador vê o aparelho no Cambuí" },
      { valor: "Teste na hora", rotulo: "quem compra liga e testa antes de pagar" },
      { valor: "Sem curioso", rotulo: "a equipe responde as perguntas por você" },
      { valor: "Condições claras", rotulo: "tudo combinado na avaliação" },
    ],
  },
  assistente: {
    titulo: "Avaliação em três toques",
    texto: "Responda e a mensagem vai pronta para quem avalia. Depois é só mandar as fotos.",
    abertura: "Olá! Vim pela página de consignação e quero vender um aparelho usado.",
    fecho: "Posso mandar as fotos (frente, costas, tela ligada e etiqueta do modelo)?",
    botao: "Enviar para avaliação",
    perguntas: [
      {
        rotulo: "Aparelho",
        pergunta: "O que você quer vender?",
        opcoes: ["Notebook", "MacBook", "PC de mesa ou gamer", "iPhone", "iPad", "Console", "Placa de vídeo ou peça", "Monitor"],
      },
      {
        rotulo: "Estado",
        pergunta: "Como ele está?",
        opcoes: ["Perfeito, quase sem uso", "Funciona, com marcas de uso", "Com defeito"],
      },
      {
        rotulo: "Acompanha",
        pergunta: "O que vai junto?",
        varias: true,
        opcoes: ["Caixa original", "Carregador ou fonte", "Nota fiscal", "Controle ou acessórios", "Só o aparelho"],
      },
    ],
  },
  secoes: [
    // Faixa "Consignados em destaque" (MEU BLING): o que já está à venda por
    // consignação. Some sozinha quando não há nenhum. Ver app/consignacao/page.tsx.
    { tipo: "especial", id: "faixa-consignados" },
    {
      tipo: "dores",
      titulo: "Por que tanta gente desiste de vender sozinha",
      texto:
        "Anunciar um usado parece simples até chegarem as primeiras mensagens. A consignação existe para tirar de você a parte chata e arriscada da venda.",
      itens: [
        {
          titulo: "Encontro com desconhecido",
          texto: "Marcar na sua casa ou num estacionamento com quem você nunca viu. Na consignação o comprador vai até a loja, não até você.",
        },
        {
          titulo: "Comprovante falso e Pix agendado",
          texto: "O golpe mais comum em venda de eletrônico usado. Aqui quem recebe do comprador é a loja, e você recebe da loja.",
        },
        {
          titulo: "Dezenas de curiosos",
          texto: "\"Ainda tem?\", \"Faz por menos?\", \"Aceita troca?\". A equipe da loja responde essas conversas no seu lugar.",
        },
        {
          titulo: "Comprador com medo de levar defeito",
          texto: "Quem compra usado quer ver funcionando. Na loja o aparelho é ligado e testado na frente do cliente, o que ajuda a fechar.",
        },
        {
          titulo: "Não saber quanto pedir",
          texto: "Preço alto demais encalha; baixo demais é dinheiro perdido. A avaliação parte do estado real do aparelho e do que ele vale no mercado hoje.",
        },
        {
          titulo: "Aparelho parado perdendo valor",
          texto: "Notebook e celular valem menos a cada lançamento. Quanto antes ele vai para a vitrine, melhor costuma ser o valor.",
        },
      ],
    },
    {
      tipo: "passos",
      titulo: "Como a consignação funciona",
      texto: "Do primeiro contato até o dinheiro na sua mão, você acompanha tudo pelo WhatsApp da loja.",
      itens: [
        {
          titulo: "Mande as fotos",
          texto: "Pelo WhatsApp, com o modelo, o estado e o que acompanha. Com isso a equipe já diz se o aparelho tem procura.",
        },
        {
          titulo: "Traga para avaliar",
          texto: "Na loja do Cambuí o aparelho é conferido de perto. Valor de venda, a parte da loja e o prazo de exposição são combinados ali, antes de ele ficar.",
        },
        {
          titulo: "Ele vai para a vitrine",
          texto: "O aparelho fica exposto na loja e a equipe atende quem se interessa, mostra funcionando e responde as dúvidas.",
        },
        {
          titulo: "Vendeu, você recebe",
          texto: "Quando o aparelho é vendido, a loja avisa e acerta com você o valor que foi combinado na avaliação.",
        },
      ],
    },
    {
      tipo: "comparativo",
      titulo: "Anunciar sozinho ou deixar em consignação?",
      texto: "As duas formas funcionam. A diferença está em quem faz o trabalho e em quem corre o risco.",
      colunas: ["O que muda", "Anunciar por conta própria", "Consignação na Balão"],
      linhas: [
        ["Onde o comprador vê o aparelho", "Na sua casa ou num lugar marcado", "Na loja do Cambuí, em horário comercial"],
        ["Quem responde as mensagens", "Você, a qualquer hora", "A equipe da loja"],
        ["Teste antes da compra", "Improvisado, sem bancada", "Ligado e testado no balcão"],
        ["Risco de golpe no pagamento", "Fica com você", "Quem recebe do comprador é a loja"],
        ["O que fica com você", "O valor inteiro da venda", "O valor combinado, menos a parte da loja"],
      ],
    },
    {
      tipo: "texto",
      titulo: "O que faz um usado vender melhor",
      paragrafos: [
        "O que mais pesa no valor de um usado é o estado e o modelo. Um notebook com SSD, bateria que segura carga e tela sem mancha tem procura; o mesmo modelo com HD mecânico e bateria viciada vale bem menos, e às vezes uma troca barata antes da venda devolve parte dessa diferença. Na avaliação a equipe diz se compensa mexer em alguma coisa ou se é melhor vender como está.",
        "Caixa, carregador original e nota fiscal também contam. Para quem compra, eles mostram de onde o aparelho veio e que ele foi bem cuidado. Em iPhone, MacBook e console isso faz mais diferença ainda, porque o comprador tem medo de aparelho bloqueado ou de origem duvidosa.",
        "Antes de entregar, copie os seus arquivos e saia das contas: Apple ID e Buscar iPhone, conta Google, conta Microsoft, PlayStation Network ou Xbox. Aparelho preso a uma conta não pode ser vendido. Se precisar de ajuda com o backup ou com a formatação, a assistência técnica da loja faz isso no mesmo endereço.",
        "A consignação nem sempre é o melhor caminho. Aparelho muito antigo ou de valor baixo costuma não compensar o tempo de vitrine, e a equipe fala isso com franqueza na avaliação, antes de você deixar qualquer coisa na loja.",
      ],
      lista: [
        "Fotos com a tela ligada ajudam a avaliar sem você sair de casa",
        "Diga a idade aproximada e se já foi aberto ou consertado",
        "Defeito conhecido deve ser contado: ele entra na conta do valor, e o comprador fica sabendo",
      ],
    },
    {
      tipo: "marcas",
      titulo: "O que dá para deixar em consignação",
      texto: "Se o seu aparelho não está na lista, mande a foto do mesmo jeito: a equipe diz se ele tem saída.",
      marcas: [
        "Notebook Dell, Lenovo, Acer, Asus e HP",
        "MacBook Air e MacBook Pro",
        "iPhone",
        "iPad",
        "PC gamer completo",
        "Placa de vídeo",
        "PlayStation 5 e PlayStation 4",
        "Xbox Series",
        "Nintendo Switch",
        "Monitor gamer",
      ],
    },
    {
      tipo: "vitrine",
      titulo: "Vai vender o antigo para comprar outro?",
      texto:
        "É o caso mais comum no balcão. Conte na avaliação o que você pretende comprar: a equipe conversa sobre as duas coisas no mesmo atendimento. Estes são notebooks novos do catálogo de hoje.",
      regras: [
        {
          id: "notebooks-novos",
          titulo: "Notebooks novos para o próximo passo",
          subtitulo: "Para estudar, trabalhar e usar no dia a dia",
          categorias: ["Computadores/Notebooks"],
          excluir: ["gamer", "gaming", "rtx", "macbook", "capa", "case", "mochila", "suporte", "carregador", "fonte"],
          precoMin: 2500,
          precoMax: 9000,
          ordem: "menor",
          limite: 8,
          porMarca: 2,
          verTodos: { rotulo: "Ver todos os notebooks", href: "/notebooks" },
        },
        {
          id: "macbooks",
          titulo: "MacBook para quem vende o Mac antigo",
          subtitulo: "Air e Pro com chip da Apple",
          categorias: ["Computadores/Notebooks/Macbook"],
          ordem: "menor",
          limite: 6,
          porMarca: 6,
        },
      ],
    },
    {
      tipo: "atalhos",
      titulo: "Quer comprar um usado em vez de vender?",
      texto: "Os seminovos da loja ficam numa página própria, com foto do aparelho de verdade.",
      itens: [
        { titulo: "Seminovos", texto: "Notebooks e aparelhos usados revisados, à venda na loja.", href: "/seminovos" },
        { titulo: "Notebooks novos", texto: "Os modelos do catálogo, só notebooks, com filtros.", href: "/notebooks", imagem: "/images/landing/v2/notebooks.jpg" },
        { titulo: "Assistência técnica", texto: "Backup, formatação e conserto antes de vender.", href: "/manutencao", imagem: "/images/landing/v2/manutencao.jpg" },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Como funciona a consignação de aparelho usado?",
      resposta:
        "Você deixa o aparelho na loja, a Balão expõe, atende os interessados e faz a venda. Quando ele é vendido, você recebe o valor combinado na avaliação. Até lá o aparelho continua sendo seu.",
    },
    {
      pergunta: "Quanto a loja cobra para vender em consignação?",
      resposta:
        "A parte da loja é combinada na avaliação, conforme o aparelho e o valor de venda. Você fica sabendo de tudo antes de deixar o aparelho, e só deixa se concordar.",
    },
    {
      pergunta: "Quanto vale o meu notebook usado?",
      resposta:
        "Depende do modelo, do processador, do estado da tela e da bateria e do que acompanha. Mande fotos e o modelo pelo WhatsApp: a equipe diz uma faixa de valor e se ele tem procura antes de você vir à loja.",
    },
    {
      pergunta: "Em quanto tempo o aparelho é vendido?",
      resposta:
        "Não existe prazo certo: depende do modelo, do estado e do valor pedido. Aparelho com procura e preço justo costuma sair mais rápido, e o tempo que ele fica exposto é combinado na avaliação.",
    },
    {
      pergunta: "Vocês aceitam iPhone, MacBook e console?",
      resposta:
        "Sim, além de notebook, PC de mesa e PC gamer. O iPhone e o MacBook precisam estar fora do Apple ID e do Buscar, e o console fora da sua conta; aparelho bloqueado não pode ser vendido.",
    },
    {
      pergunta: "Posso deixar um aparelho com defeito?",
      resposta:
        "Mande o caso pelo WhatsApp. Às vezes um conserto barato na assistência da loja aumenta bem o valor de venda; outras vezes vale vender no estado, avisando o comprador. A equipe mostra as duas contas antes.",
    },
    {
      pergunta: "O que acontece com os meus arquivos e contas?",
      resposta:
        "O ideal é você copiar os arquivos e sair das contas antes de entregar. Se precisar, a assistência da loja faz o backup e a formatação, para o aparelho não ir à vitrine com nada seu.",
    },
  ],
  temas: ["usados", "consignacao", "compra", "notebook", "apple", "iphone", "games", "pc", "pcgamer"],
  termosDoBlog: ["seminovo", "usado", "notebook", "macbook", "iphone", "backup", "vale a pena"],
  relacionadas: ["notebooks", "reparoapple", "manutencao", "assistenciagames"],
  final: {
    titulo: "Mande as fotos e descubra quanto vale",
    texto: "Modelo, estado e o que acompanha já bastam para a primeira resposta. A vitrine fica na loja do Cambuí, na Av. Anchieta.",
    botao: "Avaliar meu usado",
    mensagem: "Olá! Quero avaliar um aparelho usado para deixar em consignação na Balão. Vou mandar as fotos.",
  },
};
