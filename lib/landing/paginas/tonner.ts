import type { PaginaDeCaptacao } from "../tipos";

// Regra do Thiago: cartucho e tinta só ORIGINAL; toner original e compatível.
// As fileiras de cartucho e tinta excluem qualquer "compatível".
export const tonner: PaginaDeCaptacao = {
  slug: "tonner",
  nome: "Toner e cartucho em Campinas",
  chamada: "Toner original e compatível, cartucho e tinta originais, com entrega por motoboy para casa e escritório.",
  seo: {
    titulo: "Toner e cartucho em Campinas com entrega | Balão da Informática (Cambuí)",
    descricao:
      "Toner original e compatível, cartucho e tinta originais HP, Brother, Epson, Samsung e Canon no Cambuí, em Campinas. Entrega por motoboy para casa e empresa.",
    palavras: [
      "toner em Campinas",
      "toner compatível Campinas",
      "cartucho HP original Campinas",
      "toner Brother Campinas",
      "toner HP CF283A Campinas",
      "tinta Epson original Campinas",
      "refil de tinta Epson EcoTank Cambuí",
      "toner para empresa com entrega Campinas",
      "onde comprar toner no Cambuí",
      "toner compatível ou original qual a diferença",
      "cartucho Canon original Campinas",
      "toner Samsung compatível Campinas",
    ],
    tipoDeServico: "Venda de toner, cartucho e tinta para impressoras",
  },
  hero: {
    contexto: "Suprimentos de impressão no Cambuí, em Campinas",
    titulo: "A impressora imprimindo de novo, sem sair do escritório",
    texto:
      "Diga a marca e o modelo da impressora e a equipe da Balão confere o toner, o cartucho ou a tinta certos. Retire no balcão do Cambuí ou receba por motoboy em Campinas e região, para casa ou para a empresa.",
    imagem: { src: "/images/landing/v2/tonner.jpg", alt: "Mãos encaixando um cartucho de toner numa impressora a laser aberta" },
    mensagem: "Olá! Vim pela página de toner e cartucho da Balão e preciso de suprimento para a minha impressora.",
    botao: "Pedir toner ou cartucho",
    secundario: { rotulo: "Ver toners e cartuchos", href: "#vitrine" },
    fatos: [
      { valor: "Cartucho e tinta", rotulo: "só originais" },
      { valor: "Toner", rotulo: "original ou compatível, você escolhe" },
      { valor: "Motoboy", rotulo: "entrega local combinada no WhatsApp" },
      { valor: "10% no Pix", rotulo: "ou até 10x sem juros no cartão" },
    ],
  },
  assistente: {
    titulo: "Suprimento certo em três toques",
    texto: "Com a impressora e o que precisa, a equipe responde se tem e quanto fica.",
    abertura: "Olá! Vim pela página de toner e cartucho e preciso de suprimento.",
    fecho: "Posso mandar foto da etiqueta da impressora ou do cartucho/toner usado?",
    botao: "Enviar para a loja",
    perguntas: [
      {
        rotulo: "Impressora",
        pergunta: "Qual a marca da impressora?",
        opcoes: ["HP", "Brother", "Epson", "Samsung", "Canon", "Lexmark", "Outra"],
      },
      {
        rotulo: "Preciso de",
        pergunta: "O que você precisa?",
        varias: true,
        opcoes: ["Toner", "Cartucho", "Tinta ou refil", "Não sei, quero ajuda"],
      },
      {
        rotulo: "Para",
        pergunta: "É para casa ou empresa?",
        opcoes: ["Casa, uma unidade", "Empresa, uma unidade", "Empresa, várias unidades"],
      },
    ],
  },
  secoes: [
    {
      tipo: "comparativo",
      titulo: "Toner, cartucho ou tinta: qual é o da sua impressora",
      texto: "Cada tipo de impressora usa um suprimento diferente. Saber qual é a sua evita comprar errado.",
      colunas: ["Impressora", "O que ela usa", "O que vendemos"],
      linhas: [
        ["Laser (preto e branco ou colorida)", "Toner: pó dentro de um cartucho rígido, que rende muitas páginas", "Original e compatível"],
        ["Jato de tinta com cartucho", "Cartucho com cabeça de impressão e tinta, preto e colorido", "Só original"],
        ["Tanque de tinta (EcoTank e similares)", "Refil em frasco, que você despeja no tanque da impressora", "Só original"],
      ],
    },
    {
      tipo: "texto",
      titulo: "Toner compatível ou original: a diferença sem enrolação",
      paragrafos: [
        "O toner original é feito pelo fabricante da impressora. O compatível é um cartucho novo feito por outra fábrica para o mesmo modelo, com o mesmo encaixe e chip que a impressora reconhece. Os compatíveis que a loja vende são de marcas de linha, com rendimento parecido com o do original, e custam bem menos. Para escritório que imprime muito, a economia ao longo do ano é grande.",
        "Vale ser honesto sobre o que muda. Em impressão de texto do dia a dia, a diferença costuma ser pequena ou nenhuma. Em impressoras que estão na garantia do fabricante, ou em trabalhos em que a cor e o preto precisam ser exatos, o original é a escolha mais segura. Por isso a loja vende as duas opções e explica qual faz sentido para o seu caso.",
        "Cartucho de jato de tinta e tinta de tanque são outra história: a loja só vende os originais. No jato de tinta, a cabeça de impressão e a tinta trabalham juntas, e tinta de qualidade ruim entope bico e mancha papel. É uma decisão da casa para não vender o que dá dor de cabeça depois.",
      ],
      lista: [
        "O rendimento do toner vem no nome do produto, em milhares de páginas (2K, 6.5K, 12K)",
        "Toner de alto rendimento (com X ou XL no código) custa mais e rende mais por página",
        "Na dúvida, mande foto do toner usado: o código está na etiqueta",
      ],
    },
    {
      tipo: "vitrine",
      titulo: "Toner, cartucho e tinta na loja",
      texto: "Se o código do seu não aparecer aqui, pergunte no WhatsApp: a equipe confere com os fornecedores.",
      regras: [
        {
          id: "toners",
          titulo: "Toner para impressora laser",
          subtitulo: "Compatíveis de linha para HP, Brother e Samsung; o original do seu modelo, peça no WhatsApp. K = mil páginas",
          categorias: ["Impressão/Toners"],
          porMarca: 6,
          limite: 16,
          ordem: "menor",
          verTodos: { rotulo: "Ver todos os toners", href: "/categoria/impressao-toners" },
        },
        {
          id: "cartuchos",
          titulo: "Cartucho original para jato de tinta",
          subtitulo: "HP, Canon e Epson, só originais",
          categorias: ["Impressão/Cartuchos"],
          nomeContem: ["cartucho"],
          // "934" sai: custo muito abaixo do original e o nome não diz "Original".
          excluir: ["compativel", "compatível", "remanufaturado", "recarga", "similar", "934"],
          porMarca: 6,
          limite: 16,
          verTodos: { rotulo: "Ver todos os cartuchos", href: "/categoria/impressao-cartuchos" },
        },
        {
          id: "tintas",
          titulo: "Tinta original para impressora de tanque",
          subtitulo: "Refis Epson para EcoTank e linhas de tanque",
          categorias: ["Impressão/Tintas"],
          nomeContem: ["tinta", "refil"],
          excluir: ["compativel", "compatível", "similar", "paralela"],
          porMarca: 12,
          ordem: "menor",
          verTodos: { rotulo: "Ver todas as tintas", href: "/categoria/impressao-tintas" },
        },
      ],
    },
    {
      tipo: "marcas",
      titulo: "Impressoras atendidas",
      texto: "Há suprimento na loja para estas marcas. Para outros modelos, mande o código do toner ou do cartucho no WhatsApp.",
      marcas: ["HP", "Brother", "Epson", "Samsung", "Canon", "Lexmark"],
    },
    {
      tipo: "regras",
      titulo: "Para empresa e escritório",
      texto: "Quem imprime todo dia não pode ficar esperando toner acabar para pedir.",
      itens: [
        {
          titulo: "Pedido pelo WhatsApp",
          texto: "Mande a lista de impressoras do escritório ou os códigos dos toners e as quantidades. A equipe responde o que tem e o que precisa ser pedido.",
          pontos: ["Toner original ou compatível, conforme a impressora e o uso", "Nota fiscal para a empresa"],
        },
        {
          titulo: "Entrega em Campinas e região",
          texto: "Motoboy para o escritório em Campinas, Valinhos, Paulínia, Sumaré, Hortolândia, Vinhedo e arredores, combinado pelo WhatsApp. Pergunte o prazo: muitas vezes sai no mesmo dia.",
          pontos: ["Retirada no balcão do Cambuí", "Pagamento com 10% de desconto no Pix ou parcelado no cartão"],
        },
      ],
    },
    {
      tipo: "passos",
      titulo: "Como pedir",
      itens: [
        { titulo: "Diga a impressora", texto: "Marca e modelo, ou foto da etiqueta do toner ou cartucho usado." },
        { titulo: "Escolha a opção", texto: "Para toner, original ou compatível; a equipe explica a diferença de preço e de rendimento." },
        { titulo: "Retire ou receba", texto: "No balcão do Cambuí ou por motoboy em Campinas e região." },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Toner compatível estraga a impressora?",
      resposta:
        "Toner compatível novo, de marca de linha, não estraga a impressora em uso normal. Ele tem o mesmo encaixe e chip do original e rendimento parecido. Se a impressora ainda está na garantia do fabricante, ou se o trabalho exige cor exata, prefira o original.",
    },
    {
      pergunta: "Qual a diferença entre toner original e compatível?",
      resposta:
        "O original é feito pelo fabricante da impressora; o compatível é um cartucho novo de outra fábrica, feito para o mesmo modelo. O compatível custa bem menos e rende parecido no texto do dia a dia. A loja vende os dois e indica qual compensa para o seu volume de impressão.",
    },
    {
      pergunta: "Vocês vendem cartucho compatível ou tinta paralela?",
      resposta:
        "Não. Cartucho de jato de tinta e tinta de tanque, a loja vende só originais. No jato de tinta, tinta de baixa qualidade entope a cabeça de impressão, e o prejuízo depois é maior que a economia.",
    },
    {
      pergunta: "Como sei qual toner serve na minha impressora?",
      resposta:
        "O código está na etiqueta do toner usado (por exemplo CF283A, TN-3442 ou D111S) e no manual da impressora. Mande foto do toner ou o modelo da impressora no WhatsApp e a equipe confere.",
    },
    {
      pergunta: "Vocês entregam toner em Campinas?",
      resposta:
        "Sim, por motoboy em Campinas e região, combinando pelo WhatsApp. Pergunte o prazo para o seu bairro: muitas vezes sai no mesmo dia. Também dá para retirar no balcão do Cambuí.",
    },
    {
      pergunta: "Vendem para empresa com nota fiscal?",
      resposta:
        "Sim. Mande os modelos das impressoras e as quantidades pelo WhatsApp; a equipe passa o que tem para entrega e emite nota fiscal para a empresa.",
    },
    {
      pergunta: "O que significa 2K, 6.5K ou 12K no nome do toner?",
      resposta:
        "É o rendimento estimado em milhares de páginas: 2K são cerca de 2 mil páginas. O número é medido pelo fabricante com cerca de 5% da folha impressa, então páginas cheias de imagem rendem menos.",
    },
  ],
  temas: ["impressao", "empresa", "entrega", "compra"],
  termosDoBlog: ["toner", "cartucho", "impressora", "tinta", "impressão"],
  relacionadas: ["envio-e-entrega", "microsoft", "manutencao", "sistemas"],
  final: {
    titulo: "Diga a impressora e receba o suprimento certo",
    texto: "Marca, modelo e o que precisa: com isso a equipe confere o toner, o cartucho ou a tinta e combina a retirada no Cambuí ou a entrega por motoboy.",
    botao: "Pedir no WhatsApp",
  },
};
