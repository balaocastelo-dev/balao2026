import type { PaginaDeCaptacao } from "../tipos";

// Página de UM serviço: tela e bateria de iPhone. Quem chega aqui já sabe o
// aparelho e quase sempre o defeito; quer saber se é tela ou bateria, se pode
// continuar usando e o que muda de uma peça para outra. Nada sobre peça
// "original Apple" ou "True Tone preservado": o técnico explica as opções de
// tela do modelo no orçamento. Da página antiga saíram: "pronto em até 3
// horas", "garantia de até 1 ano", "True Tone 100% preservado", "saúde 100%",
// "vedação no padrão de fábrica" e a lista de modelos "com peça em estoque".
export const telaiphone: PaginaDeCaptacao = {
  slug: "telaiphone",
  nome: "Troca de tela e bateria de iPhone",
  chamada: "Tela trincada, toque falhando, bateria que não dura ou estufada: orçamento pelo modelo do seu iPhone.",
  seo: {
    titulo: "Troca de Tela e Bateria de iPhone em Campinas (Cambuí) | Balão",
    descricao:
      "Tela de iPhone trincada, toque falhando ou bateria que não dura? Troca de tela e de bateria no Cambuí, em Campinas, com orçamento pelo modelo antes do serviço.",
    palavras: [
      "troca de tela de iPhone em Campinas",
      "troca de bateria de iPhone Campinas",
      "tela de iPhone trincada o que fazer",
      "touch do iPhone falhando sozinho",
      "bateria de iPhone estufada",
      "saúde da bateria do iPhone abaixo de 80%",
      "iPhone descarregando rápido",
      "iPhone com mancha verde na tela",
      "troca de tela iPhone 13 Campinas",
      "troca de bateria iPhone 11 Cambuí",
      "iPhone não carrega Campinas",
    ],
    tipoDeServico: "Troca de tela e bateria de iPhone",
  },
  hero: {
    contexto: "Tela e bateria de iPhone no Cambuí, em Campinas",
    titulo: "Seu iPhone com tela inteira e bateria que dura o dia",
    texto:
      "Diga o modelo e o que aconteceu: tela trincada, toque falhando, manchas, bateria acabando rápido ou estufada. O técnico responde pelo WhatsApp com as opções para o seu iPhone e o orçamento antes de abrir o aparelho.",
    imagem: {
      src: "/images/landing/v2/telaiphone.jpg",
      alt: "Mãos de técnico com luvas segurando um smartphone de tela trincada, com a tela nova ao lado na bancada",
    },
    mensagem: "Olá! Vim pela página de tela e bateria de iPhone da Balão e quero um orçamento.",
    botao: "Orçar pelo meu modelo",
    secundario: { rotulo: "Tela ou bateria? Veja pelos sintomas", href: "#secao-2" },
    fatos: [
      { valor: "Pelo modelo", rotulo: "orçamento para o seu iPhone, antes de abrir" },
      { valor: "Opções de tela", rotulo: "o técnico explica a diferença entre elas" },
      { valor: "90 dias", rotulo: "de garantia no serviço, como manda a lei" },
      { valor: "Cambuí", rotulo: "bancada na loja da Av. Anchieta" },
    ],
  },
  assistente: {
    titulo: "Orçamento pelo modelo",
    texto: "Três toques e o técnico já sabe qual peça olhar.",
    abertura: "Olá! Vim pela página de tela e bateria de iPhone e quero um orçamento.",
    fecho: "Posso mandar uma foto da tela ou da tela de Saúde da Bateria?",
    botao: "Enviar para o técnico",
    perguntas: [
      {
        rotulo: "Modelo",
        pergunta: "Qual é o seu iPhone?",
        opcoes: [
          "iPhone 11 ou anterior",
          "iPhone SE",
          "iPhone 12",
          "iPhone 13",
          "iPhone 14",
          "iPhone 15",
          "iPhone 16",
          "iPhone 17 ou mais novo",
          "Não sei o modelo",
        ],
      },
      {
        rotulo: "O que aconteceu",
        pergunta: "O que está acontecendo?",
        varias: true,
        opcoes: [
          "Tela trincada",
          "Toque falhando ou sozinho",
          "Manchas, listras ou tela preta",
          "Bateria acabando rápido",
          "Bateria estufada",
          "Não carrega",
        ],
      },
      {
        rotulo: "Saúde da bateria",
        pergunta: "Em Ajustes > Bateria, como está a saúde?",
        opcoes: ["Acima de 80%", "Abaixo de 80%", "Aparece Serviço", "Não sei ou não liga"],
      },
    ],
  },
  secoes: [
    {
      tipo: "dores",
      titulo: "Reconhece algum destes sinais?",
      texto: "Os três primeiros apontam para a tela; os três últimos, para a bateria ou a carga. Às vezes vêm juntos, depois de uma queda.",
      itens: [
        {
          titulo: "Vidro trincado",
          texto: "Mesmo com a imagem perfeita, a trinca deixa entrar poeira e umidade e costuma avançar com o tempo. Quanto antes trocar, menos risco para o resto do aparelho.",
        },
        {
          titulo: "Toque falhando ou clicando sozinho",
          texto: "O vidro trincado ou a pressão de uma queda afetam a camada de toque. Aparece como área morta, toque fantasma ou teclado digitando sozinho.",
        },
        {
          titulo: "Manchas, listras ou tela preta",
          texto: "Mancha verde ou roxa, linhas coloridas ou tela preta com o iPhone tocando são sinal de dano no painel. Aqui a troca da tela é o caminho.",
        },
        {
          titulo: "Bateria que não chega ao fim do dia",
          texto: "Bateria gasta descarrega rápido e pode desligar o iPhone com carga na tela, principalmente no frio ou abrindo a câmera.",
        },
        {
          titulo: "Tela levantando no canto",
          texto: "Quase sempre é a bateria estufada empurrando a tela por dentro. Pare de carregar e traga logo: é o único caso em que esperar é arriscado.",
        },
        {
          titulo: "Não carrega ou só carrega de um jeito",
          texto: "Muitas vezes é sujeira no conector. O técnico limpa e testa antes de falar em troca de peça.",
        },
      ],
    },
    {
      tipo: "comparativo",
      titulo: "Tela ou bateria? Pelos sintomas",
      texto: "Um guia rápido para chegar ao balcão sabendo o que pedir. O teste na bancada confirma.",
      colunas: ["O que você vê", "Costuma ser", "O que fazer até chegar à loja"],
      linhas: [
        ["Vidro trincado, imagem normal", "Tela (vidro e toque são uma peça só)", "Uma película por cima para não se cortar"],
        ["Toque fantasma ou área que não responde", "Tela", "Bloquear o iPhone quando não estiver usando"],
        ["Mancha, listra ou tela preta", "Tela (painel danificado)", "Fazer backup se ainda der para ver algo"],
        ["Descarrega rápido, desliga com carga", "Bateria", "Olhar a saúde em Ajustes > Bateria"],
        ["Tela levantando ou fresta na lateral", "Bateria estufada", "Parar de carregar e trazer logo"],
        ["Não carrega", "Conector sujo, cabo ou bateria", "Testar outro cabo e carregador"],
      ],
    },
    {
      tipo: "texto",
      titulo: "Por que não continuar usando com a tela quebrada",
      paragrafos: [
        "A tela do iPhone é um conjunto: vidro, camada de toque e painel de imagem colados numa peça só. Por isso, mesmo quando só o vidro parece trincado, a troca é da tela inteira. E é também por isso que esperar costuma sair caro: a trinca deixa passar poeira e umidade, a pressão do dedo sobre o vidro solto vai marcando o painel, e o que era só um risco vira mancha, listra ou toque fantasma.",
        "Há ainda o risco do dia a dia. Lascas de vidro cortam o dedo e o rosto, e com o vidro aberto o iPhone perde parte da proteção contra respingos. Película por cima da trinca ajuda a não se cortar até chegar à loja, mas não conserta nada.",
        "Na hora do orçamento, o técnico explica as opções de tela disponíveis para o seu modelo e a diferença entre elas, além do que muda no aparelho depois da troca. Assim você escolhe sabendo o que está levando.",
      ],
      lista: [
        "Faça backup no iCloud ou no computador enquanto a tela ainda deixa",
        "Evite apertar a região trincada",
        "Se a tela levantou, o problema pode ser a bateria",
      ],
      imagem: {
        src: "/images/apple/iphone/iphone-reparo-bancada.png",
        alt: "iPhone fechado na mão do técnico de luva preta, com dois iPhones abertos na bancada e o microscópio ao fundo",
      },
      lado: "direita",
    },
    {
      tipo: "texto",
      titulo: "Quando a saúde da bateria pede troca",
      paragrafos: [
        "Bateria de celular é peça de desgaste: a cada ciclo de carga ela guarda um pouco menos. O iPhone mostra quanto ela ainda segura em Ajustes > Bateria > Saúde e Carregamento (o nome muda um pouco conforme a versão do iOS). O número é a capacidade atual comparada à de quando a bateria era nova.",
        "Na prática, abaixo de 80% a maioria das pessoas já sente: o iPhone não chega ao fim do dia e pode desligar sozinho com carga na tela. Para evitar esses desligamentos, o próprio iOS pode reduzir o desempenho, e o aparelho parece lento. Se aparecer a mensagem de Serviço nessa tela, o sistema está dizendo que a bateria já não está boa.",
        "Bateria estufada é diferente: não é questão de duração, é segurança. Ela empurra a tela por dentro e pode danificar outras peças. Pare de carregar, não aperte e traga o iPhone à loja. Na troca, o técnico também explica as opções de bateria para o seu modelo e o que aparece nos Ajustes depois.",
      ],
      lista: [
        "Acima de 80% e durando o dia: ainda não precisa trocar",
        "Abaixo de 80% ou desligando sozinho: hora de orçar",
        "Mensagem de Serviço: troca recomendada",
        "Estufada: pare de carregar e traga logo",
      ],
    },
    {
      tipo: "passos",
      titulo: "Do orçamento ao iPhone na mão",
      texto: "Você acompanha pelo WhatsApp da loja.",
      itens: [
        { titulo: "Mande o modelo", texto: "Em Ajustes > Geral > Sobre. Uma foto da tela ou da Saúde da Bateria ajuda o técnico a responder de primeira." },
        { titulo: "Receba as opções", texto: "O técnico explica as opções de tela ou de bateria para o seu modelo, o valor e o prazo." },
        { titulo: "Traga à loja", texto: "Av. Anchieta, 789, no Cambuí. Faça backup antes, se o iPhone ainda deixar." },
        { titulo: "Teste no balcão", texto: "Toque, imagem, carga e câmera testados com você, com garantia de 90 dias no serviço." },
      ],
    },
    {
      tipo: "vitrine",
      titulo: "Para proteger o iPhone ou trocar de aparelho",
      texto:
        "Capa e carregador para a tela e a bateria novas durarem mais. E, se a conta não fechar para o seu modelo, os iPhones novos à venda.",
      regras: [
        {
          id: "magsafe",
          titulo: "Capa e carregamento MagSafe",
          subtitulo: "Capa para iPhone, bateria portátil e suporte com encaixe magnético",
          categorias: [
            "Celular & Smartphone/Acessórios para Smartphones/Capas e Películas",
            "Celular & Smartphone/Carregadores e Power Banks",
            "Celular & Smartphone/Suportes",
          ],
          nomeContem: ["magsafe"],
          ordem: "maior",
          limite: 8,
        },
        {
          id: "carregador-cabo",
          titulo: "Carregador e cabo para iPhone",
          subtitulo: "Lightning para os modelos até o iPhone 14, USB-C a partir do iPhone 15",
          categorias: [
            "Celular & Smartphone/Carregadores e Power Banks",
            "Celular & Smartphone/Acessórios para Smartphones/Carregadores",
            "Informática/Cabos e Adaptadores",
          ],
          nomeContem: ["iphone", "lightning", "apple"],
          excluir: ["watch", "applewatch", "relogio", "magsafe", "veicular", "p2", "otg", "macbook"],
          ordem: "maior",
          porMarca: 2,
          limite: 12,
        },
        {
          id: "iphone-novo",
          titulo: "Se preferir trocar de iPhone",
          subtitulo: "Novos, com garantia do fabricante",
          categorias: ["Celular & Smartphone/Smartphones/iPhone"],
          excluir: ["1tb", "2tb"],
          ordem: "menor",
          porMarca: 8,
          limite: 8,
          verTodos: { rotulo: "Ver todos os iPhones", href: "/categoria/celular-smartphone-smartphones-iphone" },
        },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Quanto custa trocar a tela do iPhone?",
      resposta:
        "Depende do modelo e da opção de tela escolhida, por isso o orçamento sai pelo modelo do seu iPhone. Mande o modelo e uma foto pelo WhatsApp: o técnico responde com as opções e o valor antes de abrir o aparelho.",
    },
    {
      pergunta: "Trocar a tela apaga minhas fotos?",
      resposta:
        "Não. A troca de tela e de bateria não mexe no armazenamento do iPhone. Mesmo assim, faça backup no iCloud ou no computador antes, como em qualquer conserto.",
    },
    {
      pergunta: "Posso continuar usando o iPhone com a tela trincada?",
      resposta:
        "Dá para usar por pouco tempo, mas não é recomendado. A trinca deixa entrar poeira e umidade, costuma avançar e pode chegar ao painel de imagem, além do risco de se cortar. Uma película por cima ajuda até chegar à loja.",
    },
    {
      pergunta: "Com quantos por cento de saúde devo trocar a bateria do iPhone?",
      resposta:
        "Abaixo de 80% é o ponto em que a maioria das pessoas já sente a diferença e o iOS pode reduzir o desempenho. Se aparecer a mensagem de Serviço em Ajustes > Bateria, ou se a bateria estufou, a troca é recomendada.",
    },
    {
      pergunta: "Minha tela está levantando. É a tela ou a bateria?",
      resposta:
        "Quase sempre é a bateria estufada empurrando a tela por dentro. Pare de carregar o iPhone, não aperte a tela e traga logo à loja para o técnico avaliar.",
    },
    {
      pergunta: "A tela nova funciona igual à antiga?",
      resposta:
        "Depende da opção de tela disponível para o seu modelo. No orçamento, o técnico explica as opções e o que muda de uma para outra, para você decidir antes de qualquer serviço.",
    },
    {
      pergunta: "Meu iPhone não carrega. Preciso trocar a bateria?",
      resposta:
        "Nem sempre. Muitas vezes o problema é sujeira no conector ou o cabo. O técnico limpa e testa primeiro e só fala em troca de peça se for preciso.",
    },
    {
      pergunta: "Qual é a garantia da troca de tela e bateria?",
      resposta: "O serviço tem garantia de 90 dias, como prevê o Código de Defesa do Consumidor.",
    },
  ],
  temas: ["iphone", "apple", "assistencia", "garantia"],
  termosDoBlog: ["iphone", "bateria", "tela", "apple", "celular", "carregador"],
  relacionadas: ["reparoapple", "wendell/apple", "carregadores", "recuperacaodados"],
  final: {
    titulo: "Mande o modelo do seu iPhone e o que aconteceu",
    texto:
      "Com o modelo e uma foto, o técnico já responde com as opções de tela ou de bateria. A bancada fica na loja do Cambuí, na Av. Anchieta, 789.",
    botao: "Orçar tela ou bateria",
  },
};
