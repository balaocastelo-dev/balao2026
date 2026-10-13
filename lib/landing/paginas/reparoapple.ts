import type { PaginaDeCaptacao } from "../tipos";

// A página de SERVIÇO Apple, para quem chega pelo Google com um defeito em
// qualquer aparelho da marca. Ângulo: diagnóstico antes do orçamento, seus
// dados e sua conta Apple protegidos, e a conta honesta entre consertar e
// trocar. Tela e bateria de iPhone têm página própria (/telaiphone); o hub por
// aparelho é /wendell/apple. Da página antiga saíram: "até 3 horas", "True Tone
// 100% preservado", "garantia de até 1 ano", "12x", "motoboy segurado",
// "laser", "EEPROM", "economia de 70%" e "técnicos certificados".
export const reparoapple: PaginaDeCaptacao = {
  slug: "reparoapple",
  nome: "Assistência técnica Apple",
  chamada: "iPhone, iPad, MacBook, iMac, Mac mini e Apple Watch: diagnóstico e orçamento antes do conserto.",
  seo: {
    titulo: "Assistência Técnica Apple em Campinas: iPhone, iPad e MacBook | Balão",
    descricao:
      "Conserto de iPhone, iPad, MacBook, iMac, Mac mini e Apple Watch no Cambuí, em Campinas. Diagnóstico na bancada, orçamento no WhatsApp e 90 dias de garantia.",
    palavras: [
      "assistência técnica Apple em Campinas",
      "conserto de iPhone Campinas",
      "conserto de MacBook Campinas",
      "conserto de iPad Cambuí",
      "MacBook não liga o que fazer",
      "iPhone caiu na água o que fazer",
      "conserto de Apple Watch Campinas",
      "manutenção de iMac Campinas",
      "conserto de Mac mini Campinas",
      "iPhone não carrega Campinas",
      "assistência Apple perto de mim Campinas",
    ],
    tipoDeServico: "Assistência técnica para aparelhos Apple",
  },
  hero: {
    contexto: "Assistência Apple no Cambuí, em Campinas",
    titulo: "Seu iPhone, iPad ou Mac funcionando de novo, com orçamento antes",
    texto:
      "Não liga, não carrega, caiu na água, tela ou bateria: a bancada da Balão testa o aparelho, explica o que encontrou e manda o orçamento pelo WhatsApp. Seus arquivos e a sua conta Apple ficam com você.",
    imagem: {
      src: "/images/landing/v2/reparoapple.jpg",
      alt: "Mãos de técnico abrindo um smartphone com ventosa sob o microscópio da bancada",
    },
    mensagem: "Olá! Vim pela página de assistência Apple da Balão e quero um orçamento para o meu aparelho.",
    botao: "Pedir orçamento no WhatsApp",
    secundario: { rotulo: "Ver os defeitos mais comuns", href: "#secao-1" },
    fatos: [
      { valor: "Orçamento antes", rotulo: "nada é feito sem a sua aprovação" },
      { valor: "6 linhas Apple", rotulo: "iPhone, iPad, MacBook, iMac, Mac mini e Watch" },
      { valor: "90 dias", rotulo: "de garantia no serviço, como manda a lei" },
      { valor: "Loja no Cambuí", rotulo: "bancada e balcão no mesmo endereço" },
    ],
  },
  assistente: {
    titulo: "Diga o aparelho e o defeito",
    texto: "A mensagem vai pronta para o técnico Apple.",
    abertura: "Olá! Vim pela página de assistência Apple e quero um orçamento.",
    fecho: "Posso mandar foto do aparelho e o modelo que aparece em Ajustes?",
    botao: "Enviar para o técnico",
    perguntas: [
      {
        rotulo: "Aparelho",
        pergunta: "Qual aparelho Apple?",
        opcoes: ["iPhone", "iPad", "MacBook", "iMac", "Mac mini", "Apple Watch"],
      },
      {
        rotulo: "Defeito",
        pergunta: "O que está acontecendo?",
        varias: true,
        opcoes: [
          "Não liga",
          "Não carrega",
          "Molhou ou caiu líquido",
          "Tela quebrada ou com manchas",
          "Bateria fraca ou estufada",
          "Teclado ou trackpad falhando",
          "Lento ou travando",
          "Outro defeito",
        ],
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
      tipo: "dores",
      titulo: "Os defeitos Apple que mais chegam ao balcão",
      texto:
        "Muitos têm a mesma origem em aparelhos diferentes. O primeiro trabalho da bancada é separar o que é peça (tela, bateria, conector) do que é placa.",
      itens: [
        {
          titulo: "Não liga ou fica na maçã",
          texto: "Pode ser bateria esgotada, carregador, conector ou placa. O teste com fonte de bancada mostra se o aparelho puxa energia e por onde começar.",
        },
        {
          titulo: "Não carrega ou só carrega em uma posição",
          texto: "Muitas vezes é sujeira no conector Lightning ou USB-C. Quando não é, pode ser o próprio conector ou o cabo flexível que liga ele à placa.",
        },
        {
          titulo: "Caiu na água ou em outro líquido",
          texto: "Desligue, não carregue e não ligue para testar. A oxidação avança com o aparelho energizado, e quanto antes ele chega à bancada, melhor.",
        },
        {
          titulo: "Tela quebrada, manchada ou sem toque",
          texto: "No iPhone e no iPad a tela é trocada como conjunto; no MacBook e no iMac o técnico confere antes se o defeito não está no cabo ou na placa de vídeo.",
        },
        {
          titulo: "Bateria fraca ou estufada",
          texto: "Bateria estufando levanta a tela do iPhone, do iPad e do Apple Watch ou deforma o fundo do MacBook. Pare de carregar e traga logo.",
        },
        {
          titulo: "MacBook com tecla falhando ou lento",
          texto: "Teclas mortas costumam vir de líquido ou desgaste. Lentidão em Mac antigo pode ser disco cheio ou com defeito; o diagnóstico diz qual.",
        },
      ],
    },
    {
      tipo: "texto",
      titulo: "O que a bancada olha antes de dar o preço",
      paragrafos: [
        "Aparelho Apple é muito integrado: a mesma placa cuida de carga, tela, câmera e biometria. Por isso um sintoma pode ter mais de uma causa. Um iPhone que não carrega pode ter só fiapo de bolso no conector; um MacBook que não liga pode ter só a bateria esgotada. O teste vem antes do orçamento justamente para você não pagar por peça que não resolve.",
        "No diagnóstico, o técnico confere se o aparelho puxa energia, como estão bateria e conector, se há sinal de líquido ou de queda e se o defeito está numa peça trocável ou na placa. Com isso, manda pelo WhatsApp o que encontrou, o que recomenda, o valor e o prazo. Se houver mais de uma opção de peça para o seu modelo, ele explica a diferença entre elas.",
        "Quando o conserto não compensa — um aparelho antigo com placa muito danificada, por exemplo —, você fica sabendo antes de gastar, e pode conversar ali mesmo sobre recuperar os arquivos ou trocar de aparelho.",
      ],
      lista: [
        "Teste de carga, bateria e conector",
        "Inspeção de sinais de líquido e de queda",
        "Conferência do modelo exato e das opções de peça",
        "Orçamento por escrito no WhatsApp antes de começar",
      ],
      imagem: {
        src: "/images/apple/iphone/iphone-interno-reparo.png",
        alt: "iPhone aberto, sem a tampa traseira, na mão do técnico diante da bancada da Balão da Informática",
      },
      lado: "direita",
    },
    {
      tipo: "regras",
      titulo: "Antes de trazer o seu aparelho",
      texto: "Quatro cuidados que protegem os seus dados e deixam o atendimento mais rápido.",
      itens: [
        {
          titulo: "Faça backup se o aparelho ainda liga",
          texto: "iPhone e iPad pelo iCloud ou pelo computador; Mac pelo Time Machine num disco externo. Se não liga mais, avise: o caso pode incluir recuperação de dados.",
        },
        {
          titulo: "Saiba a senha de desbloqueio",
          texto: "O técnico precisa testar tela, toque, câmera e carga depois do conserto. Combine no balcão como fazer o teste final com você.",
        },
        {
          titulo: "Traga o carregador",
          texto: "Principalmente para MacBook e Apple Watch. Ajuda a descobrir se o defeito está no aparelho ou no carregador.",
        },
        {
          titulo: "Conte o histórico",
          texto: "Caiu, molhou, já foi aberto antes, atualizou o sistema e parou? Cada detalhe encurta o diagnóstico.",
        },
      ],
    },
    {
      tipo: "comparativo",
      titulo: "Consertar ou trocar o aparelho?",
      texto: "A conta que fazemos com você no balcão, sem empurrar nenhum dos dois lados.",
      colunas: ["Situação", "Costuma compensar consertar", "Quando pensar em trocar"],
      linhas: [
        ["Tela quebrada, aparelho bom", "Troca da tela", "Modelo muito antigo, já sem atualização do sistema"],
        ["Bateria durando pouco", "Troca da bateria", "Quando outras peças também estão no fim"],
        ["Não carrega", "Limpeza ou troca do conector", "Defeito na placa somado a outros problemas"],
        ["Molhou", "Limpeza e reparo, se avaliado cedo", "Oxidação espalhada pela placa"],
        ["Mac lento", "Diagnóstico de disco e sistema", "Processador que não dá conta do que você usa"],
      ],
    },
    {
      tipo: "passos",
      titulo: "Como o conserto acontece",
      texto: "Você acompanha tudo pelo WhatsApp da loja.",
      itens: [
        { titulo: "Mande o modelo e o defeito", texto: "O modelo aparece em Ajustes, em Sobre este Mac ou na caixa. Foto do problema ajuda." },
        { titulo: "Traga à loja", texto: "Av. Anchieta, 789, no Cambuí, de segunda a sábado. Em Campinas e região, pergunte sobre retirada." },
        { titulo: "Aprove o orçamento", texto: "O técnico testa, diz a causa, as opções de peça, o valor e o prazo. Você decide." },
        { titulo: "Teste e retire", texto: "Aparelho testado com você no balcão e garantia de 90 dias no serviço." },
      ],
    },
    {
      tipo: "atalhos",
      titulo: "Atendimento por aparelho",
      texto: "Tela e bateria de iPhone têm página própria. Para os outros aparelhos, veja o que muda de um para outro.",
      itens: [
        {
          titulo: "Tela e bateria de iPhone",
          texto: "Tela trincada, toque falhando, bateria fraca ou estufada.",
          href: "/telaiphone",
          imagem: "/images/apple/subcategories/iphone-card.png",
        },
        {
          titulo: "Especialista Apple por aparelho",
          texto: "iPhone, MacBook, iPad, iMac, Mac mini e Apple Watch, um a um.",
          href: "/wendell/apple",
          imagem: "/images/apple/subcategories/macbook-card.png",
        },
        {
          titulo: "Recuperação de dados",
          texto: "Aparelho que não liga e arquivos sem backup.",
          href: "/recuperacaodados",
        },
      ],
    },
    {
      tipo: "vitrine",
      titulo: "Se a conta pedir aparelho novo",
      texto:
        "Quando o conserto não compensa, estes são os Apple novos à venda no site, com garantia do fabricante. Pergunte no balcão sobre a configuração do aparelho novo.",
      regras: [
        {
          id: "iphone",
          titulo: "iPhone",
          subtitulo: "Dos modelos de entrada aos Pro, com garantia do fabricante",
          categorias: ["Celular & Smartphone/Smartphones/iPhone"],
          excluir: ["1tb", "2tb"],
          ordem: "menor",
          porMarca: 4,
          limite: 10,
          verTodos: { rotulo: "Ver todos os iPhones", href: "/categoria/celular-smartphone-smartphones-iphone" },
        },
        {
          id: "macbook",
          titulo: "MacBook Air e MacBook Pro",
          subtitulo: "Air para o dia a dia, Pro para trabalho pesado",
          categorias: ["Computadores/Notebooks/Macbook"],
          ordem: "menor",
          porMarca: 6,
          limite: 10,
          verTodos: { rotulo: "Ver todos os MacBooks", href: "/categoria/computadores-notebooks-macbook" },
        },
        {
          id: "ipad",
          titulo: "iPad",
          subtitulo: "iPad, iPad Air e iPad Pro",
          categorias: ["Tablets, iPads e E-readers/Apple iPad"],
          excluir: ["1 tb", "1tb", "2tb"],
          ordem: "menor",
          porMarca: 4,
          limite: 10,
          verTodos: { rotulo: "Ver todos os iPads", href: "/categoria/tablets-ipads-e-e-readers-apple-ipad" },
        },
        {
          id: "watch-airpods",
          titulo: "Apple Watch e AirPods",
          subtitulo: "Para completar o conjunto com o iPhone",
          categorias: ["Celular & Smartphone/Wearables/Apple"],
          ordem: "menor",
          porMarca: 4,
          limite: 10,
          verTodos: { rotulo: "Ver Apple Watch e AirPods", href: "/categoria/celular-smartphone-wearables-apple" },
        },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Vocês consertam todos os aparelhos Apple?",
      resposta:
        "A bancada atende iPhone, iPad, MacBook, iMac, Mac mini e Apple Watch. Para um defeito específico, mande o modelo e o problema no WhatsApp: o técnico diz se faz e como.",
    },
    {
      pergunta: "Meu iPhone caiu na água. O que eu faço?",
      resposta:
        "Desligue o aparelho, não carregue e não ligue para testar. Arroz não resolve: a oxidação continua por dentro com o aparelho energizado. Traga o quanto antes para a bancada avaliar.",
    },
    {
      pergunta: "Vou perder meus dados no conserto?",
      resposta:
        "Troca de tela, bateria ou conector normalmente não mexe nos seus arquivos. Mesmo assim, faça backup no iCloud ou no computador se o aparelho ainda liga. Se ele não liga, avise: o técnico considera a recuperação dos dados no orçamento.",
    },
    {
      pergunta: "Preciso tirar a conta Apple ou desativar o Buscar antes?",
      resposta:
        "Pergunte no WhatsApp para o seu caso: o técnico diz o que precisa ser feito antes de você trazer o aparelho e combina o teste final com você no balcão. Nunca passe a senha do seu ID Apple por mensagem.",
    },
    {
      pergunta: "Qual é a garantia do conserto Apple?",
      resposta:
        "O serviço tem garantia de 90 dias, como prevê o Código de Defesa do Consumidor. O técnico explica no orçamento as opções de peça disponíveis para o seu modelo.",
    },
    {
      pergunta: "Quanto custa o conserto de iPhone ou MacBook?",
      resposta:
        "Depende do modelo e do defeito, por isso o valor sai depois do teste. Mande o modelo e o problema pelo WhatsApp; nenhum serviço é feito sem a sua aprovação.",
    },
    {
      pergunta: "Vale a pena consertar um MacBook antigo?",
      resposta:
        "Muitas vezes sim, quando o defeito é bateria, tela ou teclado e o Mac ainda recebe atualização do sistema. Se a placa está muito danificada, o técnico diz antes de você gastar.",
    },
  ],
  temas: ["apple", "iphone", "assistencia", "notebook", "dados", "garantia"],
  termosDoBlog: ["apple", "iphone", "macbook", "ipad", "apple watch", "imac", "mac mini", "bateria"],
  relacionadas: ["telaiphone", "wendell/apple", "recuperacaodados", "manutencao"],
  final: {
    titulo: "Mande o modelo e o defeito agora",
    texto:
      "Uma mensagem com o aparelho e o que aconteceu já adianta o diagnóstico. A bancada Apple fica na loja do Cambuí, na Av. Anchieta, 789.",
    botao: "Falar com a assistência Apple",
  },
};
