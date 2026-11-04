import type { PaginaDeCaptacao } from "../tipos";

const MENSAGEM =
  "Olá! Meu notebook ____ (marca/modelo) está com este problema: ____. Pode me dar uma ideia de preço e prazo?";

export const manutencao: PaginaDeCaptacao = {
  slug: "manutencao",
  nome: "Conserto de notebook",
  chamada: "Diga o defeito e receba a causa provável, o preço e o prazo pelo WhatsApp, antes de aprovar o serviço.",
  seo: {
    titulo: "Conserto de Notebook em Campinas (Cambuí) | Orçamento pelo WhatsApp",
    descricao:
      "Conserto de notebook no Cambuí: diga o defeito e receba causa provável, preço e prazo pelo WhatsApp. Bancada própria, garantia e nota fiscal.",
    palavras: [
      "conserto notebook campinas",
      "notebook não liga campinas",
      "troca de tela notebook campinas",
      "notebook esquentando e desligando",
      "assistência técnica notebook cambuí",
      "conserto de notebook perto de mim",
      "notebook molhou o que fazer",
      "orçamento de notebook campinas",
    ],
    tipoDeServico: "Conserto de notebook",
    catalogo: [
      "Notebook não liga ou não carrega",
      "Limpeza e pasta térmica",
      "Troca de tela",
      "Teclado, dobradiça e líquido",
      "Upgrade de SSD e memória",
    ],
  },
  hero: {
    contexto: "Bancada própria no Cambuí, em Campinas",
    titulo: "Seu notebook de volta, sem susto no orçamento",
    texto:
      "Diga o sintoma. A Balão da Informática Anchieta aponta a causa provável, manda preço e prazo pelo WhatsApp e só começa depois da sua aprovação. A bancada fica na Av. Anchieta, 789.",
    imagem: { src: "/images/landing/v2/manutencao.jpg", alt: "Mãos de técnico limpando a ventoinha de um notebook aberto na bancada" },
    mensagem: MENSAGEM,
    botao: "Descrever o defeito no WhatsApp",
    secundario: { rotulo: "Escolher o sintoma", href: "#secao-2" },
    fatos: [
      { valor: "Orçamento antes", rotulo: "nada é feito sem a sua aprovação" },
      { valor: "Garantia legal", rotulo: "do serviço, com nota fiscal" },
      { valor: "Seus dados", rotulo: "backup quando o serviço apaga disco" },
      { valor: "Motoboy", rotulo: "coleta em Campinas e região, a combinar" },
    ],
  },
  assistente: {
    titulo: "Qual é o defeito?",
    texto: "Três toques e a mensagem já descreve o caso para o técnico.",
    abertura: MENSAGEM,
    fecho: "Posso mandar foto ou vídeo do problema?",
    botao: "Enviar para o técnico",
    perguntas: [
      { rotulo: "Aparelho", pergunta: "O que precisa de conserto?", opcoes: ["Notebook", "PC de mesa", "PC gamer", "All-in-one", "MacBook"] },
      {
        rotulo: "Problema",
        pergunta: "O que está acontecendo?",
        varias: true,
        opcoes: ["Não liga", "Esquenta ou desliga", "Tela quebrada ou com listras", "Muito lento", "Teclado, dobradiça ou líquido"],
      },
      { rotulo: "Marca", pergunta: "Qual a marca?", opcoes: ["Dell", "Lenovo", "Acer", "HP", "Asus", "Samsung", "Outra"] },
    ],
  },
  secoes: [
    {
      tipo: "texto",
      titulo: "Seu notebook de volta sem susto no orçamento",
      paragrafos: [
        "Quem procura conserto em Campinas compara três ou quatro assistências com pressa: o notebook parou e o trabalho ou a aula não esperam. O que dá para saber antes de sair de casa é a causa provável, não o preço fechado. Preço fechado pede o aparelho na bancada ou, no mínimo, o modelo e um vídeo do defeito.",
        "Na Av. Anchieta, 789, a Balão da Informática Anchieta testa, explica e espera a aprovação no WhatsApp (19) 98751-0267. Peça, mão de obra e o prazo daquele caso vêm nessa mensagem. Nada começa antes do sim. Preço e prazo confirmados pelo WhatsApp.",
      ],
    },
    {
      tipo: "dores",
      titulo: "Qual é o defeito?",
      texto: "Escolha o sintoma. A causa provável abaixo é o que a bancada mais separa no teste. O valor de cada um não está nesta página.",
      itens: [
        {
          titulo: "Não liga ou não carrega",
          texto: "As causas mais comuns são carregador, conector de energia, bateria ou placa-mãe. O teste separa o defeito de fonte do reparo de placa antes de qualquer gasto. Traga o carregador junto.",
        },
        {
          titulo: "Esquenta e desliga sozinho",
          texto: "Poeira e pasta térmica ressecada são a primeira hipótese. A bancada mede a temperatura. Limpeza entra quando o teste mostra calor; placa já danificada é outro orçamento, dito antes.",
        },
        {
          titulo: "Tela quebrada, com listras ou escura",
          texto: "Pode ser a tela, o cabo (flat) ou a placa de vídeo. Trocar a tela sem esse teste é o jeito mais comum de gastar duas vezes. O modelo define a peça.",
        },
        {
          titulo: "Lento",
          texto: "Se liga e só demora, o caminho costuma ser SSD e memória, não conserto de placa. A página de upgrade explica SATA, NVMe e quando formatar não resolve.",
        },
        {
          titulo: "Teclado, dobradiça ou líquido",
          texto: "Tecla morta e dobradiça torta pedem o modelo para a peça. Líquido: desligue, tire da tomada, não ligue “para ver” e não seque com secador. Traga. Quanto menos ele ligar molhado, menor a chance de a placa entrar no orçamento.",
        },
      ],
    },
    {
      tipo: "retorno",
      titulo: "Pedir retorno rápido",
      texto: "Conte o que aconteceu e a marca. A equipe retorna no WhatsApp com a causa provável e pede o que faltar para fechar preço e prazo.",
      assunto: "Conserto de notebook",
      campos: [
        { nome: "sintoma", rotulo: "O que aconteceu?", opcoes: ["Não liga", "Esquenta", "Tela", "Lento", "Outro"] },
        { nome: "modelo", rotulo: "Marca e modelo" },
      ],
    },
    {
      tipo: "passos",
      titulo: "Como funciona o orçamento",
      texto: "Você aprova pelo WhatsApp. Sem essa aprovação, o notebook espera.",
      itens: [
        { titulo: "Conte o sintoma", texto: "Mensagem, foto ou vídeo. Dá para adiantar a causa provável; o preço fecha com o modelo ou com o aparelho na banca." },
        { titulo: "A bancada testa", texto: "Fonte, vídeo, disco, temperatura. O teste separa o conserto simples do reparo de placa." },
        { titulo: "Você decide", texto: "Preço e prazo chegam no WhatsApp. Não aprovou, não mexe. A condição do diagnóstico é a que a equipe passar nessa conversa." },
        { titulo: "Retire testado", texto: "Serviço feito, conferido no balcão, com nota fiscal e garantia legal." },
      ],
    },
    {
      tipo: "texto",
      titulo: "Garantia, nota fiscal e seus dados",
      paragrafos: [
        "O serviço de assistência sai com nota fiscal e com a garantia legal do serviço. Peça nova segue a garantia de quem fabricou a peça. Esta página não publica um número de dias além do que a lei já prevê para o serviço: na dúvida, pergunte no balcão o que cobre o seu caso.",
        "Formatação e troca de disco passam por backup do que for combinado: documentos, fotos e favoritos. Se o disco já não lê, o assunto vira recuperação de dados, e você autoriza antes. A loja não abre o notebook e descobre arquivo perdido no fim.",
      ],
    },
    {
      tipo: "texto",
      titulo: "Moro fora de Campinas ou não posso ir",
      paragrafos: [
        "A loja busca notebook e PC com motoboy em Campinas e na região (Sumaré, Hortolândia, Valinhos, Vinhedo, Paulínia e cidades vizinhas que a equipe confirmar). O custo e o prazo dessa coleta não estão tabelados aqui. Preço e prazo confirmados pelo WhatsApp.",
        "Quem pode vir, retira no balcão. Horário: segunda a sexta, 9h às 18h. Sábado, 9h às 13h. Atendimento urgente, quando a agenda permitir, está na página própria.",
      ],
    },
    {
      tipo: "vitrine",
      titulo: "Peças que a loja já tem para o upgrade",
      texto: "SSD e memória saem do catálogo abaixo. A instalação é orçada à parte. Preço e prazo confirmados pelo WhatsApp.",
      regras: [
        {
          id: "ssd",
          titulo: "SSD para trocar o HD",
          subtitulo: "NVMe para quem tem slot M.2, SATA para notebooks e PCs mais antigos",
          categorias: ["Hardware/SSD"],
          excluir: ["externo", "portatil", "case", "gaveta", "adaptador", "suporte", "cabo", "dissipador"],
          precoMin: 180,
          precoMax: 700,
          ordem: "maior",
          verTodos: { rotulo: "Ver todos os SSDs, com filtros", href: "/categoria/hardware-ssd" },
        },
        {
          id: "memoria",
          titulo: "Memória RAM",
          subtitulo: "DDR4 e DDR5; o técnico confirma o tipo e a frequência do seu computador",
          categorias: ["Hardware/Memória RAM"],
          excluir: ["ddr3", "ddr2"],
          precoMin: 400,
          precoMax: 1700,
          porMarca: 4,
          ordem: "menor",
        },
        {
          id: "manutencao",
          titulo: "Pasta térmica e limpeza",
          subtitulo: "Para quem faz a manutenção em casa",
          categorias: ["Hardware/Coolers/Pasta Térmica", "Informática/Limpeza e Manutenção"],
          nomeContem: ["pasta", "limpa", "limpeza", "spray", "alcool", "isopropilico", "pincel", "kit"],
          ordem: "menor",
          limite: 8,
        },
      ],
    },
    {
      tipo: "atalhos",
      titulo: "Siga pelo que você precisa",
      itens: [
        { titulo: "Upgrade de SSD e memória", texto: "Notebook lento com HD.", href: "/upgrade-ssd", imagem: "/images/landing/v2/manutencao.jpg" },
        { titulo: "Formatação com backup", texto: "Vírus ou sistema, com arquivos salvos.", href: "/formatacao", imagem: "/images/landing/v2/sistemas.jpg" },
        { titulo: "Urgente", texto: "Quando não dá para esperar a semana.", href: "/urgente" },
        { titulo: "Recuperação de dados", texto: "Disco que já não abre.", href: "/recuperacaodados", imagem: "/images/landing/v2/recuperacaodados.jpg" },
        { titulo: "Reparo Apple", texto: "MacBook e iPhone, na mesma loja.", href: "/reparoapple", imagem: "/images/landing/v2/reparoapple.jpg" },
        { titulo: "Carregadores", texto: "Fonte pela foto da etiqueta.", href: "/carregadores", imagem: "/images/landing/v2/carregadores.jpg" },
        { titulo: "Dell", texto: "Inspiron, Latitude, Vostro, XPS e G.", href: "/notebook-dell", imagem: "/images/landing/v2/manutencao.jpg" },
        { titulo: "Lenovo", texto: "IdeaPad, ThinkPad, Legion e Yoga.", href: "/notebook-lenovo", imagem: "/images/landing/v2/manutencao.jpg" },
        { titulo: "Acer", texto: "Aspire, Nitro e Predator.", href: "/notebook-acer", imagem: "/images/landing/v2/manutencao.jpg" },
        { titulo: "HP", texto: "Pavilion, Victus, ProBook e EliteBook.", href: "/notebook-hp", imagem: "/images/landing/v2/manutencao.jpg" },
        { titulo: "Asus", texto: "VivoBook, TUF e ROG.", href: "/notebook-asus", imagem: "/images/landing/v2/manutencao.jpg" },
        { titulo: "Samsung", texto: "Book, Galaxy Book e Odyssey.", href: "/notebook-samsung", imagem: "/images/landing/v2/manutencao.jpg" },
        { titulo: "Fale conosco", texto: "Telefone e WhatsApp da loja.", href: "/fale-conosco" },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Quanto custa consertar um notebook em Campinas?",
      resposta:
        "Depende do defeito. Na Balão da Informática Anchieta (Av. Anchieta, 789, Cambuí) a troca de tela, a limpeza com pasta térmica e o reparo de conector ou fonte têm valores diferentes. O orçamento é enviado pelo WhatsApp (19) 98751-0267 e nada é feito sem aprovação. A loja também busca o equipamento com motoboy; o custo da coleta é confirmado na mesma conversa. Preço e prazo confirmados pelo WhatsApp.",
    },
    {
      pergunta: "Meu notebook não liga, o que pode ser?",
      resposta:
        "As causas mais comuns são carregador, conector de energia, bateria ou placa-mãe. Na bancada da loja o teste separa o defeito de fonte do reparo de placa antes de qualquer serviço.",
    },
    {
      pergunta: "A assistência cobra para fazer orçamento?",
      resposta:
        "O orçamento é enviado pelo WhatsApp antes de qualquer serviço, e nada é feito sem a sua aprovação. A condição do diagnóstico é confirmada pelo WhatsApp (19) 98751-0267.",
    },
    {
      pergunta: "Vale a pena trocar a tela?",
      resposta:
        "Vale quando a tela custa menos do que seguir sem o notebook e o resto da máquina está saudável. A bancada avisa quando o valor da peça chega perto de um notebook novo ou seminovo.",
    },
    {
      pergunta: "Perco meus arquivos no conserto?",
      resposta:
        "Não, quando o serviço é combinado com backup. Se o disco já está falhando, o caso vira recuperação de dados e você fica sabendo antes.",
    },
    {
      pergunta: "Consertam MacBook?",
      resposta: "Sim, na página de reparo Apple, no mesmo endereço. A Balão não é canal do fabricante.",
    },
  ],
  tituloDasPerguntas: "Perguntas frequentes",
  temas: ["assistencia", "notebook", "pc", "upgrade", "ssd", "memoria", "manutencao", "dados"],
  termosDoBlog: ["manutenção", "notebook", "ssd", "diagnóstico", "esquenta", "lento", "tela", "não liga"],
  relacionadas: ["upgrade-ssd", "formatacao", "recuperacaodados", "carregadores"],
  final: {
    titulo: "Mande o modelo e o defeito",
    texto: "Uma mensagem já adianta a causa provável. A bancada fica na Av. Anchieta, 789, Cambuí. Preço e prazo confirmados pelo WhatsApp.",
    botao: "Falar com a assistência",
    mensagem: MENSAGEM,
  },
};
