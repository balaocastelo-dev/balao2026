import type { PaginaDeCaptacao } from "../tipos";

export const assistenciagames: PaginaDeCaptacao = {
  slug: "assistenciagames",
  nome: "Conserto de videogame e controle",
  chamada: "PS5, PS4, Xbox e Switch esquentando, sem imagem ou com controle puxando sozinho: diagnóstico e orçamento antes do conserto.",
  seo: {
    titulo: "Conserto de PS5, Xbox, Switch e Controle em Campinas (Cambuí) | Balão",
    descricao:
      "Conserto de PS5, PS4, Xbox Series, Xbox One e Switch no Cambuí, em Campinas: console esquentando, sem imagem, sem ler disco e controle com drift. Orçamento antes.",
    palavras: [
      "conserto de PS5 em Campinas",
      "PS5 esquentando e desligando sozinho",
      "controle PS5 puxando sozinho conserto",
      "drift no controle DualSense Campinas",
      "conserto de Xbox Series S em Campinas",
      "PS4 fazendo barulho de turbina limpeza",
      "Nintendo Switch não liga Campinas",
      "conserto de Joy-Con com drift",
      "PS5 sem imagem conector HDMI",
      "assistência técnica de videogame no Cambuí",
      "PS4 não lê disco conserto",
      "limpeza de videogame em Campinas",
    ],
    tipoDeServico: "Assistência técnica de consoles de videogame e controles",
  },
  hero: {
    contexto: "Assistência de videogame no Cambuí, em Campinas",
    titulo: "Volte a jogar sem console desligando nem controle andando sozinho",
    texto:
      "PS5, PS4, Xbox Series, Xbox One e Nintendo Switch: a bancada da Balão descobre por que o console esquenta, não liga ou ficou sem imagem, e por que o analógico puxa para um lado. O orçamento chega pelo WhatsApp e o conserto só começa com a sua aprovação.",
    imagem: {
      src: "/images/landing/v2/assistenciagames.jpg",
      alt: "Mãos de técnico consertando um console branco aberto na bancada, com o controle ao lado",
    },
    mensagem: "Olá! Vim pela página de conserto de videogame da Balão e quero um orçamento para o meu console/controle.",
    botao: "Pedir orçamento no WhatsApp",
    secundario: { rotulo: "Ver os defeitos mais comuns", href: "#secao-1" },
    fatos: [
      { valor: "Orçamento antes", rotulo: "o conserto só começa com o seu OK" },
      { valor: "90 dias", rotulo: "de garantia no serviço, como manda a lei" },
      { valor: "Console e controle", rotulo: "PlayStation, Xbox e Nintendo Switch" },
      { valor: "Loja no Cambuí", rotulo: "traga o aparelho de segunda a sábado" },
    ],
  },
  assistente: {
    titulo: "Orçamento do seu videogame",
    texto: "Escolha o aparelho e o defeito: a mensagem chega pronta para o técnico.",
    abertura: "Olá! Vim pela página de conserto de videogame e quero um orçamento.",
    fecho: "Posso mandar um vídeo do defeito?",
    botao: "Enviar para o técnico",
    perguntas: [
      { rotulo: "Conserto de", pergunta: "O que vai para a bancada?", opcoes: ["Console", "Controle", "Console e controle"] },
      { rotulo: "Plataforma", pergunta: "Qual é o modelo?", opcoes: ["PS5", "PS4", "Xbox Series X ou S", "Xbox One", "Nintendo Switch"] },
      {
        rotulo: "Defeito",
        pergunta: "O que está acontecendo?",
        varias: true,
        opcoes: [
          "Esquenta ou desliga sozinho",
          "Ventoinha muito barulhenta",
          "Não liga",
          "Liga, mas fica sem imagem",
          "Não lê ou não solta o disco",
          "Analógico puxando sozinho",
          "Botão ou gatilho falhando",
          "Controle não carrega ou não conecta",
        ],
      },
    ],
  },
  secoes: [
    {
      tipo: "dores",
      titulo: "Os defeitos que mais chegam à bancada de games",
      texto:
        "Quase todo videogame avisa antes de parar: a ventoinha fica mais alta, o controle começa a mexer a câmera sozinho, a imagem pisca. Quanto antes ele chega, mais simples costuma ser o conserto.",
      itens: [
        {
          titulo: "Esquenta, faz barulho de turbina e desliga",
          texto:
            "Poeira presa no dissipador e na ventoinha e pasta térmica ressecada. O console que desliga no meio da partida está se protegendo do calor. Limpeza interna e troca do composto térmico costumam resolver.",
        },
        {
          titulo: "Analógico puxando sozinho (drift)",
          texto:
            "O sensor do analógico se desgasta com o uso e passa a registrar movimento sem você tocar. Limpeza alivia por pouco tempo; o que resolve é trocar o analógico.",
        },
        {
          titulo: "Liga, mas a TV fica sem imagem",
          texto:
            "Pode ser o cabo, a entrada da TV, o conector HDMI do console ou o circuito de vídeo da placa. O teste na bancada separa o defeito simples do que exige reparo na placa.",
        },
        {
          titulo: "Não liga ou liga e apaga",
          texto:
            "Fonte interna, curto na placa ou botão de liga. Depois de queda de energia ou tempestade, a fonte é a primeira suspeita.",
        },
        {
          titulo: "Não lê disco ou não ejeta",
          texto:
            "Lente suja ou gasta, mecanismo travado ou cabo do leitor solto. Vale para PS4, PS5 com leitor, Xbox One e Xbox Series X.",
        },
        {
          titulo: "Controle não carrega ou não conecta",
          texto:
            "Conector USB-C gasto, bateria cansada ou falha na conexão sem fio. Antes de comprar outro, vale o diagnóstico: muitas vezes é uma peça só.",
        },
      ],
    },
    {
      tipo: "passos",
      titulo: "Do WhatsApp ao videogame funcionando",
      texto: "Sem protocolo e sem surpresa no fim. Você acompanha tudo pela conversa com a loja.",
      itens: [
        {
          titulo: "Mande o defeito",
          texto: "Modelo e o que acontece. Um vídeo curto do drift, do barulho ou da tela preta ajuda muito a adiantar a causa.",
        },
        {
          titulo: "Traga à loja",
          texto: "No Cambuí, de segunda a sábado. Traga o console com o cabo de força e, se o problema é no controle, o controle.",
        },
        {
          titulo: "Receba o orçamento",
          texto: "O técnico abre, encontra a causa e manda valor e prazo pelo WhatsApp. Você aprova ou não.",
        },
        {
          titulo: "Retire testado",
          texto: "O aparelho é ligado e testado na sua frente, com garantia de 90 dias no serviço.",
        },
      ],
    },
    {
      tipo: "texto",
      titulo: "Por que o videogame esquenta e o que a limpeza resolve",
      paragrafos: [
        "Os consoles atuais concentram processador e vídeo num chip só, resfriado por um dissipador de metal e uma ventoinha que puxa o ar do ambiente. Com o tempo, poeira, pelo de animal e gordura de cozinha formam uma camada de feltro nas aletas do dissipador. O ar passa a sair mais quente, a ventoinha acelera para compensar e o barulho aumenta. Quando nem isso basta, o console desliga para não queimar.",
        "Cada modelo tem o seu jeito. O PS4, principalmente as versões Fat e Pro, fica barulhento quando a poeira acumula. O PS5 sai de fábrica com metal líquido entre o chip e o dissipador, um material diferente da pasta térmica comum, que não se mexe sem necessidade e exige cuidado de quem abre. O Xbox Series X joga o ar quente pelo topo e sofre quando fica dentro de um rack fechado. O Nintendo Switch esquenta mais quando está no dock, ligado à TV.",
        "Por isso o primeiro passo na bancada é abrir e olhar. Às vezes basta a limpeza interna; outras vezes a ventoinha já está com folga no eixo ou o composto térmico secou e precisa ser trocado. Se o calor já danificou algum componente da placa, você fica sabendo antes de aprovar qualquer gasto.",
      ],
      lista: [
        "Deixe espaço livre atrás, dos lados e em cima do console",
        "Evite rack fechado, tapete e colchão embaixo do aparelho",
        "Ventoinha mais alta que o normal é o primeiro aviso: não espere desligar",
      ],
    },
    {
      tipo: "texto",
      titulo: "Drift no controle: o que é e quando vale consertar",
      paragrafos: [
        "Drift é quando o personagem anda ou a câmera gira sem você encostar no analógico. Acontece no DualSense do PS5, no DualShock 4 do PS4, no controle do Xbox e nos Joy-Con do Switch. A causa mais comum é o desgaste do sensor interno do analógico, que mede a posição por contato. Sujeira acelera o problema, mas raramente é a única causa.",
        "Spray e limpeza resolvem por alguns dias, quando resolvem. O conserto que dura é a troca do analógico. Se o controle também está com bateria fraca, gatilho falhando e conector gasto, o técnico faz a conta com você: às vezes o conserto completo chega perto de um controle novo, e aí vale saber antes.",
        "Para quem joga muitas horas por dia, existem controles com analógico de efeito Hall, que medem a posição por campo magnético e não por contato. Eles têm uma fileira própria na vitrine abaixo; pergunte no WhatsApp quais funcionam no seu console.",
      ],
    },
    {
      tipo: "comparativo",
      titulo: "Consertar ou trocar?",
      texto: "A conta que o técnico faz com você no balcão.",
      colunas: ["Defeito", "O que costuma resolver", "Quando pensar em trocar"],
      linhas: [
        ["Esquenta e desliga", "Limpeza interna e troca do composto térmico", "Quando o calor já danificou a placa"],
        ["Analógico com drift", "Troca do analógico", "Controle com bateria, gatilho e conector também gastos"],
        ["Sem imagem", "Cabo, conector HDMI ou reparo no circuito de vídeo", "Quando o chip de vídeo está danificado"],
        ["Não lê disco", "Limpeza ou troca da lente ou do leitor", "Se você já joga quase tudo em versão digital"],
        ["Não liga", "Reparo ou troca da fonte interna", "Placa com curto sem reparo"],
      ],
    },
    {
      tipo: "marcas",
      titulo: "Aparelhos que chegam à bancada",
      texto: "Console e controle das três marcas. Seu modelo não está aqui? Pergunte no WhatsApp.",
      marcas: [
        "PS5",
        "PS5 Slim",
        "PS5 Pro",
        "PS4",
        "PS4 Slim",
        "PS4 Pro",
        "Xbox Series X",
        "Xbox Series S",
        "Xbox One",
        "Xbox One S",
        "Nintendo Switch",
        "Switch OLED",
        "Switch Lite",
        "DualSense",
        "DualShock 4",
        "Controle Xbox",
        "Joy-Con",
      ],
    },
    {
      tipo: "vitrine",
      titulo: "Controles, consoles e acessórios na loja",
      texto:
        "Para ter um segundo controle enquanto o seu está na bancada, ou para quando o conserto não compensa. Os itens com faixa \"Pronta entrega\" estão aqui perto e saem rápido.",
      regras: [
        {
          id: "controles",
          titulo: "Controles para PlayStation, Xbox e Switch",
          subtitulo: "Originais e de marcas conhecidas; alguns com analógico de efeito Hall",
          categorias: ["Games/Playstation", "Games/Xbox", "Games/Nintendo", "Games/Acessórios Gamer/Joystick"],
          nomeContem: ["controle", "dualsense", "joy-con"],
          excluir: [
            "capa",
            "tampa",
            "protetor",
            "grip",
            "carregador",
            "base",
            "bateria",
            "case",
            "dock",
            "ps2",
            "ps3",
            "play 2",
            "xbox 360",
            "x-box 360",
            "xbox360",
            "lcd",
            "portao",
            "celular",
            "racing",
            "suporte",
            "compativel",
            "console",
            "kit",
          ],
          precoMin: 500,
          precoMax: 1100,
          porMarca: 3,
        },
        {
          id: "efeito-hall",
          titulo: "Controles com analógico de efeito Hall",
          subtitulo: "O analógico mede a posição por ímã, sem o contato que causa o drift",
          categorias: ["Games"],
          nomeContem: ["hall"],
          excluir: ["case", "capa"],
          ordem: "menor",
          limite: 8,
        },
        {
          id: "consoles",
          titulo: "Consoles",
          subtitulo: "PlayStation, Xbox e Nintendo Switch",
          categorias: ["Games/Consoles", "Games/Playstation/Consoles Playstation", "Games/Nintendo/Consoles Nintendo"],
          excluir: ["tampa", "case", "capa", "pelicula", "portal"],
          precoMin: 1500,
          limite: 10,
        },
        {
          id: "acessorios",
          titulo: "Acessórios que poupam o console e o controle",
          subtitulo: "Bases de carregamento, suportes, leitor de disco e expansão de armazenamento",
          categorias: ["Games/Playstation", "Games/Xbox", "Games/Nintendo", "Games/Acessórios Gamer"],
          nomeContem: ["base", "dock", "suporte vertical", "leitor de disco", "cartao de expansao", "ssd", "headset", "fone"],
          excluir: ["controle", "joystick", "volante", "pal de selfie"],
          precoMin: 120,
          limite: 10,
        },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Quanto custa consertar um PS5?",
      resposta:
        "Depende do defeito: limpeza, troca de analógico, conector HDMI e reparo de placa têm custos bem diferentes. Por isso o técnico abre, encontra a causa e só então manda o orçamento pelo WhatsApp. Nada é feito sem a sua aprovação.",
    },
    {
      pergunta: "Meus jogos e saves são apagados no conserto?",
      resposta:
        "Na maioria dos consertos, não: limpeza, troca de ventoinha, de conector ou de analógico não mexem no armazenamento. Se o defeito exigir reinstalar o sistema, você fica sabendo antes. Por segurança, ative o salvamento na nuvem da sua conta antes de trazer o console.",
    },
    {
      pergunta: "Controle com drift tem conserto?",
      resposta:
        "Tem. O que resolve de forma duradoura é a troca do analógico desgastado; limpeza e spray só aliviam por pouco tempo. Se o controle tiver outros defeitos juntos, o técnico compara o conserto com o preço de um controle novo antes de você decidir.",
    },
    {
      pergunta: "Meu PS5 liga, mas não dá imagem. É a entrada HDMI?",
      resposta:
        "Às vezes é, mas teste antes outro cabo HDMI e outra entrada da TV. Se continuar sem imagem, traga o console: o técnico confere o conector, o circuito de vídeo e a fonte e diz qual é o caso.",
    },
    {
      pergunta: "De quanto em quanto tempo devo limpar o videogame?",
      resposta:
        "Não há regra fixa; depende do ambiente. Casa com poeira, animais ou fumaça pede limpeza mais cedo. O sinal mais claro é a ventoinha mais alta que o normal e o console mais quente ao toque.",
    },
    {
      pergunta: "Quanto tempo o console fica na loja?",
      resposta:
        "Depende do defeito e de a peça estar ou não na loja. O técnico informa o prazo junto com o orçamento, antes de você aprovar.",
    },
    {
      pergunta: "Qual é a garantia do conserto?",
      resposta:
        "O serviço tem garantia de 90 dias, como prevê o Código de Defesa do Consumidor. Peças novas seguem a garantia do fabricante, e qualquer problema volta para o mesmo balcão no Cambuí.",
    },
    {
      pergunta: "Vocês aceitam meu videogame usado?",
      resposta:
        "A loja trabalha com consignação de usados: você deixa o aparelho e a loja vende para você. Veja a página de consignação ou pergunte no WhatsApp se o seu modelo entra.",
    },
  ],
  temas: ["games", "assistencia", "usados", "garantia", "compra"],
  termosDoBlog: ["ps5", "playstation", "xbox", "nintendo switch", "console", "videogame", "controle", "drift", "games"],
  relacionadas: ["manutencao", "consignacao", "pcgamer", "promocao"],
  final: {
    titulo: "Mande o defeito do seu videogame agora",
    texto:
      "O modelo e um vídeo do problema já adiantam o diagnóstico. A bancada fica na loja da Av. Anchieta, no Cambuí, de segunda a sábado.",
    botao: "Falar com a assistência de games",
  },
};
