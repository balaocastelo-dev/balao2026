import type { PaginaDeCaptacao } from "../tipos";

export const carregadores: PaginaDeCaptacao = {
  slug: "carregadores",
  nome: "Carregadores e fontes de notebook",
  chamada: "Notebook sem carga? Mande a foto da etiqueta da fonte e saiba qual serve, para retirar ou receber em Campinas.",
  seo: {
    titulo: "Carregador e fonte de notebook em Campinas (Cambuí) | Balão da Informática",
    descricao:
      "Fonte de notebook Dell, HP, Lenovo, Acer, Asus, Samsung, MacBook e USB-C no Cambuí, em Campinas. Mande foto da etiqueta no WhatsApp e confira a fonte certa.",
    palavras: [
      "carregador de notebook em Campinas",
      "fonte de notebook Cambuí",
      "carregador Dell Campinas",
      "fonte notebook Lenovo Campinas",
      "carregador notebook HP pino azul",
      "fonte Acer e Asus Campinas",
      "carregador MacBook USB-C Campinas",
      "carregador USB-C 65W para notebook",
      "notebook não carrega o que fazer",
      "como saber a fonte certa do notebook",
      "carregador de celular turbo original Campinas",
      "entrega de carregador por motoboy Campinas",
    ],
    tipoDeServico: "Venda de carregadores e fontes de notebook",
  },
  hero: {
    contexto: "Fontes e carregadores no Cambuí, em Campinas",
    titulo: "Seu notebook carregando de novo hoje, com a fonte certa",
    texto:
      "Mande uma foto da etiqueta da fonte antiga ou da parte de baixo do notebook. A equipe confere voltagem, amperagem, potência e o tipo de pino, diz qual serve e combina a retirada no Cambuí ou a entrega por motoboy em Campinas e região.",
    imagem: { src: "/images/landing/v2/carregadores.jpg", alt: "Carregadores de notebook e carregadores USB-C com cabos, vistos de cima sobre a bancada" },
    mensagem: "Olá! Vim pela página de carregadores da Balão. Meu notebook está sem carga e preciso de uma fonte. Posso mandar foto da etiqueta?",
    botao: "Mandar foto da etiqueta",
    secundario: { rotulo: "Ver fontes e carregadores", href: "#vitrine" },
    fatos: [
      { valor: "Foto da etiqueta", rotulo: "basta isso para conferir a fonte" },
      { valor: "Retire no balcão", rotulo: "Av. Anchieta, no Cambuí" },
      { valor: "Motoboy", rotulo: "entrega local combinada no WhatsApp" },
      { valor: "Bancada", rotulo: "testa se o defeito é fonte ou notebook" },
    ],
  },
  assistente: {
    titulo: "Ache a fonte certa em três toques",
    texto: "Com essas respostas e uma foto, o atendente diz qual serve sem você precisar trazer o notebook.",
    abertura: "Olá! Vim pela página de carregadores e preciso de uma fonte.",
    fecho: "Vou mandar a foto da etiqueta da fonte antiga (voltagem, amperagem, watts e pino).",
    botao: "Enviar para a loja",
    perguntas: [
      {
        rotulo: "Para",
        pergunta: "O carregador é para quê?",
        opcoes: ["Notebook", "MacBook", "Celular", "Tablet ou iPad", "Outro aparelho"],
      },
      {
        rotulo: "Marca",
        pergunta: "Qual a marca?",
        opcoes: ["Dell", "HP", "Lenovo", "Acer", "Asus", "Samsung", "Positivo", "Apple", "Outra"],
      },
      { rotulo: "Urgência", pergunta: "Para quando precisa?", opcoes: ["Hoje", "Esta semana", "Sem pressa"] },
    ],
  },
  secoes: [
    {
      tipo: "dores",
      titulo: "O notebook não carrega: é a fonte ou é o notebook?",
      texto: "Antes de comprar fonte nova, vale olhar os sinais. Muitas vezes dá para saber pelo WhatsApp; quando não dá, a bancada testa no balcão.",
      itens: [
        {
          titulo: "A luz da fonte não acende",
          texto: "Fonte queimada ou cabo rompido perto do plugue ou do pino. É o caso mais comum, e a troca da fonte resolve.",
        },
        {
          titulo: "Carrega só com o cabo em certa posição",
          texto: "Fio partido por dentro ou conector do notebook frouxo. Se o problema for o conector da placa, é conserto de bancada, não fonte nova.",
        },
        {
          titulo: "Aviso de carregador de baixa potência",
          texto: "A fonte entrega menos watts do que o notebook pede. Ele liga, mas carrega devagar ou descarrega mesmo na tomada.",
        },
        {
          titulo: "Liga na tomada, mas sem a fonte desliga",
          texto: "A bateria chegou ao fim da vida útil. Fonte nova não resolve; a bateria é que precisa ser trocada.",
        },
        {
          titulo: "Fonte esquentando muito ou com cheiro",
          texto: "Pare de usar. Fonte com defeito pode mandar tensão instável para o notebook e danificar o circuito de carga.",
        },
        {
          titulo: "Perdeu ou esqueceu o carregador",
          texto: "Com a foto da etiqueta do notebook ou o modelo, a equipe indica a fonte certa para retirar ou receber por motoboy.",
        },
      ],
    },
    {
      tipo: "texto",
      titulo: "Como achar o carregador certo do seu notebook",
      paragrafos: [
        "Toda fonte de notebook tem uma etiqueta com quatro informações que decidem se ela serve. A voltagem de saída (V) precisa ser a mesma da fonte original: 19 V, 19,5 V ou 20 V são as mais comuns. A amperagem (A) e a potência (W) precisam ser iguais ou maiores; uma fonte de 90 W funciona onde ia uma de 65 W, porque o notebook só puxa o que precisa, mas o contrário não. E o pino tem de encaixar firme e ter o mesmo diâmetro, inclusive o pino central fino que algumas marcas usam para o notebook reconhecer a fonte.",
        "Nos notebooks mais novos e nos MacBooks, a carga é pela porta USB-C. Aí o que manda é o padrão USB-C PD (Power Delivery): o carregador e o notebook combinam a tensão sozinhos, e o importante é a potência. Notebooks leves costumam carregar bem com 45 W; a maioria dos ultrafinos pede 65 W; modelos maiores pedem mais. O cabo também conta: acima de 60 W, ele precisa ser próprio para 100 W ou mais, senão a carga fica limitada.",
        "Fonte errada estraga mais do que parece. Voltagem acima da original pode queimar o circuito de carga da placa. Fonte fraca faz o notebook usar a bateria mesmo ligado na tomada, e esse vaivém de carga e descarga gasta a bateria antes do tempo. Fonte de má qualidade, com tensão instável, esquenta e encurta a vida da bateria. Por isso a equipe confere a etiqueta antes de indicar.",
      ],
      lista: [
        "Foto da etiqueta da fonte antiga: voltagem, amperagem, watts e o desenho do pino",
        "Se não tem a fonte, foto da etiqueta embaixo do notebook ou o modelo exato",
        "Notebook com porta USB-C: confira se ela tem o símbolo de carga ou de raio",
      ],
    },
    {
      tipo: "vitrine",
      titulo: "Fontes e carregadores na loja",
      texto: "Fontes para as marcas mais comuns, universais e USB-C. Se o seu modelo não aparecer, pergunte no WhatsApp com a foto da etiqueta.",
      regras: [
        {
          id: "fontes-notebook",
          titulo: "Fontes de notebook",
          subtitulo: "Dell, HP, Lenovo, Acer, Asus, Samsung, Positivo, MacBook e universais",
          categorias: ["Energia/Fontes para Notebook"],
          porMarca: 3,
          limite: 16,
          verTodos: { rotulo: "Ver todas as fontes de notebook", href: "/categoria/energia-fontes-para-notebook" },
        },
        {
          id: "usb-c-potencia",
          titulo: "Carregadores USB-C de 45 W para cima",
          subtitulo: "Power Delivery para notebook com USB-C, MacBook, tablet e celular",
          categorias: ["Celular & Smartphone/Carregadores e Power Banks", "Celular & Smartphone/Acessórios para Smartphones/Carregadores"],
          nomeContem: ["45w", "65w", "67w", "87w", "100w", "120w", "140w"],
          excluir: ["power bank", "veicular", "portatil", "relogio", "bateria", "lanterna", "tomada"],
          precoMin: 60,
          porMarca: 3,
        },
        {
          id: "celular",
          titulo: "Carregador de celular",
          subtitulo: "Originais Apple, Samsung e Motorola e turbo USB-C de boa marca",
          categorias: ["Celular & Smartphone/Carregadores e Power Banks", "Celular & Smartphone/Acessórios para Smartphones/Carregadores"],
          nomeContem: ["original", "20w", "25w", "30w", "35w", "pd"],
          excluir: ["power bank", "veicular", "portatil", "relogio", "bateria", "lanterna", "xbox", "moto", "inducao", "indutivo", "5w", "tomada", "45w", "65w"],
          precoMin: 70,
          porMarca: 3,
        },
        {
          id: "power-bank",
          titulo: "Bateria portátil (power bank)",
          subtitulo: "Para quem passa o dia fora e não pode ficar sem carga",
          categorias: ["Celular & Smartphone/Carregadores e Power Banks", "Celular & Smartphone/Acessórios para Smartphones/Carregadores"],
          nomeContem: ["power bank", "portatil"],
          excluir: ["relogio", "lanterna"],
          precoMin: 150,
          porMarca: 2,
          limite: 8,
        },
      ],
    },
    {
      tipo: "marcas",
      titulo: "Marcas de notebook atendidas",
      texto: "Há fonte na loja para estas marcas. Para modelos menos comuns, a fonte universal com o pino certo costuma resolver; mande a etiqueta e a equipe confirma.",
      marcas: ["Dell", "HP", "Lenovo", "Acer", "Asus", "Samsung", "Positivo", "Apple MacBook", "Sony", "LG", "Toshiba", "Itautec", "CCE"],
    },
    {
      tipo: "passos",
      titulo: "Da foto da etiqueta à fonte na sua mão",
      itens: [
        { titulo: "Mande a foto", texto: "Da etiqueta da fonte antiga ou da parte de baixo do notebook, pelo WhatsApp." },
        { titulo: "Receba a indicação", texto: "A equipe confere voltagem, amperagem, watts e pino e diz qual fonte serve e se está na loja." },
        { titulo: "Retire ou receba", texto: "Retire no balcão do Cambuí ou combine a entrega por motoboy em Campinas e região. Pergunte: muitas vezes sai no mesmo dia." },
        { titulo: "Teste no notebook", texto: "Se trouxer o notebook à loja, a fonte é testada nele antes de você pagar." },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Como saber qual carregador serve no meu notebook?",
      resposta:
        "Olhe a etiqueta da fonte antiga: a voltagem (V) tem de ser igual, a amperagem (A) e a potência (W) iguais ou maiores, e o pino do mesmo tipo e diâmetro. Se preferir, mande a foto no WhatsApp e a equipe confere para você.",
    },
    {
      pergunta: "Posso usar carregador de potência maior no notebook?",
      resposta:
        "Pode, desde que a voltagem e o pino sejam os mesmos. O notebook puxa só a potência de que precisa, então uma fonte de 90 W funciona onde ia uma de 65 W. O contrário, fonte mais fraca, faz o notebook carregar devagar ou não carregar.",
    },
    {
      pergunta: "Carregador de celular USB-C carrega notebook?",
      resposta:
        "Só se o notebook carrega pela USB-C e o carregador for USB-C PD com potência suficiente. Carregador de celular de 20 ou 25 W até pode manter um notebook leve desligado carregando, mas com ele em uso a carga não acompanha; para a maioria, o certo é 65 W.",
    },
    {
      pergunta: "Meu notebook não carrega mesmo com fonte nova. O que pode ser?",
      resposta:
        "Pode ser o conector de carga do notebook, a bateria no fim da vida útil ou o circuito de carga da placa. Nesses casos, traga o notebook à assistência técnica da loja, que testa e passa o orçamento antes de qualquer serviço.",
    },
    {
      pergunta: "Vocês entregam carregador em Campinas?",
      resposta:
        "Sim, por motoboy em Campinas e região, como Valinhos, Paulínia, Sumaré, Hortolândia e Vinhedo, combinando pelo WhatsApp. Pergunte o prazo para o seu bairro: muitas vezes sai no mesmo dia. Também dá para retirar no balcão do Cambuí.",
    },
    {
      pergunta: "Tem carregador para MacBook?",
      resposta:
        "Sim, há fontes para MacBook com conector MagSafe e com USB-C. Mande o modelo do MacBook ou a foto da fonte antiga para a equipe indicar a potência certa.",
    },
    {
      pergunta: "Qual é a garantia do carregador?",
      resposta:
        "A garantia segue a do fabricante de cada produto. Compra fechada pelo site ou pelo WhatsApp também tem 7 dias de arrependimento, como prevê o Código de Defesa do Consumidor.",
    },
  ],
  temas: ["notebook", "energia", "assistencia", "entrega", "apple", "celular"],
  termosDoBlog: ["fonte", "carregador", "bateria", "notebook não carrega", "usb-c", "notebook"],
  relacionadas: ["manutencao", "notebooks", "envio-e-entrega", "reparoapple"],
  final: {
    titulo: "Mande a foto da etiqueta e saiba qual fonte serve",
    texto: "Com a etiqueta da fonte antiga ou do notebook, a equipe responde qual carregador serve e se dá para retirar hoje no Cambuí ou receber por motoboy.",
    botao: "Mandar foto no WhatsApp",
  },
};
