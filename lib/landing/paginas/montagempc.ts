import type { PaginaDeCaptacao } from "../tipos";

export const montagempc: PaginaDeCaptacao = {
  slug: "montagempc",
  nome: "Montagem de PC sob medida",
  chamada: "Diga o que você joga ou faz e quanto quer gastar: a loja escolhe as peças, monta, testa e mostra o PC ligado antes de você pagar.",
  seo: {
    titulo: "Montagem de PC em Campinas | Com Suas Peças ou as Nossas – Balão Anchieta",
    descricao:
      "Montagem de PC no Cambuí com cable management e teste de estresse. Traga suas peças ou compre com a gente. Preço fechado pelo WhatsApp.",
    palavras: [
      "montagem de PC em Campinas",
      "montar PC gamer sob medida Campinas",
      "loja para montar computador no Cambuí",
      "orçamento de PC gamer pelo WhatsApp",
      "PC para edição de vídeo em Campinas",
      "montar PC para rodar IA local",
      "quais peças comprar para montar um PC",
      "montagem de PC com teste antes de pagar",
      "PC para trabalho e estudo Campinas",
      "montar PC gamer para jogar em 1440p",
      "organização de cabos no gabinete",
    ],
    tipoDeServico: "Montagem de computadores sob medida",
  },
  hero: {
    contexto: "Montagem de PC sob medida no Cambuí, em Campinas",
    titulo: "Um PC montado para o que você faz, testado na sua frente",
    texto:
      "Conte o que você joga ou em que trabalha e quanto quer investir. A Balão monta a configuração com peças do estoque da loja, organiza os cabos, testa e mostra o computador ligado antes de você pagar.",
    imagem: {
      src: "/images/landing/v2/montagempc.jpg",
      alt: "Mãos encaixando uma placa de vídeo na placa-mãe durante a montagem de um PC",
    },
    mensagem:
      "Olá! Quero montar um PC. ( ) Já tenho as peças ( ) Quero comprar com vocês. Lista/uso: ____. Qual o preço e o prazo?",
    botao: "Pedir preço e prazo",
    secundario: { rotulo: "Ver as peças em estoque", href: "#vitrine" },
    fatos: [
      { valor: "Você vê ligado", rotulo: "e testa antes de pagar" },
      { valor: "Peças do estoque", rotulo: "a configuração sai do que está na loja" },
      { valor: "10% no Pix", rotulo: "ou até 10x sem juros no cartão" },
      { valor: "Bancada no Cambuí", rotulo: "a mesma que dá o suporte depois" },
    ],
  },
  assistente: {
    titulo: "Monte o pedido do seu PC",
    texto: "Três respostas e o vendedor já chega com uma configuração na mão.",
    abertura:
      "Olá! Quero montar um PC. ( ) Já tenho as peças ( ) Quero comprar com vocês. Lista/uso: ____. Qual o preço e o prazo?",
    fecho: "Posso mandar a lista dos programas ou jogos que uso?",
    botao: "Enviar para o vendedor",
    perguntas: [
      {
        rotulo: "Uso principal",
        pergunta: "Para que vai ser o PC?",
        varias: true,
        opcoes: [
          "Jogos competitivos (alto FPS)",
          "Jogos pesados ou em 4K",
          "Edição de vídeo e foto",
          "IA local",
          "Trabalho e estudo",
        ],
      },
      { rotulo: "Faixa de orçamento", pergunta: "Quanto quer investir?", opcoes: ["Entrada", "Intermediário", "Alto desempenho", "Sem limite"] },
      {
        rotulo: "Já tenho",
        pergunta: "Já tem alguma coisa?",
        varias: true,
        opcoes: ["Nada, quero tudo", "Monitor", "Teclado e mouse", "Algumas peças do PC antigo"],
      },
    ],
  },
  secoes: [
    {
      tipo: "passos",
      titulo: "Seu PC montado, testado e pronto para retirar",
      texto: "Você não precisa saber o nome de nenhuma peça. Precisa saber o que quer fazer com o computador.",
      itens: [
        {
          titulo: "Conte o uso e a faixa",
          texto: "Os jogos ou programas que você usa, a resolução do monitor e quanto quer investir. O assistente acima já monta a mensagem.",
        },
        {
          titulo: "Receba a configuração",
          texto: "O vendedor monta a lista com o que tem em estoque e explica o papel de cada peça. Quer trocar alguma? Ajustamos.",
        },
        {
          titulo: "A bancada monta e testa",
          texto: "Montagem, organização dos cabos, conferência de temperatura e um teste com carga antes de chamar você.",
        },
        {
          titulo: "Veja ligado e pague",
          texto: "Você confere o PC funcionando na loja e só então paga: Pix com desconto, cartão em até 10x ou combinamos a entrega.",
        },
      ],
    },
    {
      tipo: "comparativo",
      titulo: "Cada uso pede um PC diferente",
      texto:
        "O erro mais comum é gastar onde não precisa. Um PC para jogo competitivo e um PC para edição de vídeo podem custar parecido e ter peças bem diferentes.",
      colunas: ["Uso", "Onde vale investir", "Onde dá para economizar"],
      linhas: [
        [
          "Jogos competitivos",
          "Processador com núcleos rápidos e monitor de alta taxa de atualização",
          "Placa de vídeo não precisa ser de topo para 1080p",
        ],
        ["Jogos pesados e 4K", "Placa de vídeo com bastante memória (VRAM) e fonte de qualidade", "Processador intermediário costuma dar conta"],
        ["Edição de vídeo", "Memória RAM em quantidade, SSD rápido e processador com muitos núcleos", "Iluminação e gabinete de vitrine"],
        ["IA local", "Placa de vídeo com o máximo de VRAM que a faixa permite e memória RAM em dobro", "Gabinete e periféricos"],
        ["Trabalho e estudo", "SSD e memória suficientes para várias abas e programas abertos", "Placa de vídeo dedicada, quase sempre dispensável"],
      ],
    },
    {
      tipo: "texto",
      titulo: "Como a loja escolhe as peças para você",
      paragrafos: [
        "A conta começa pelo que mais pesa no seu uso. Em jogos, quem define a resolução e o FPS é a placa de vídeo; o processador entra para não segurar a placa e para manter o jogo estável em títulos competitivos. Em edição de vídeo e em IA local, a memória pesa tanto quanto o processamento: projetos grandes e modelos de linguagem precisam caber na RAM e na memória da placa de vídeo.",
        "Depois vêm as peças que ninguém vê, mas que decidem se o PC dura. A fonte precisa entregar a potência da placa de vídeo com folga e ter boa eficiência; fonte fraca é a causa mais comum de PC que reinicia no meio do jogo. A placa-mãe precisa aceitar o processador e a memória escolhidos e ter os conectores de que você precisa. O gabinete tem de comportar a placa de vídeo e o cooler e deixar o ar circular.",
        "Por fim, a refrigeração. Air cooler bom resolve a maioria dos processadores; water cooler entra quando o processador esquenta muito ou quando você quer o gabinete mais limpo por dentro. Se você já tem monitor, SSD ou memória que servem, o vendedor diz o que dá para aproveitar e o orçamento cai.",
      ],
      lista: [
        "Placa de vídeo dimensionada para a resolução do seu monitor",
        "Fonte com folga para a placa de vídeo, nunca no limite",
        "Placa-mãe compatível com processador e memória, sem pagar por recurso que você não vai usar",
        "Gabinete com espaço para o ar circular e para upgrades",
      ],
      imagem: { src: "/pc_campanha.jpg", alt: "Mesa com PC montado e três monitores ligados" },
      lado: "direita",
    },
    {
      tipo: "beneficios",
      titulo: "O que está incluso",
      texto: "Montar é a parte rápida. O que diferencia um PC bem montado é o cuidado antes e depois de encaixar as peças.",
      itens: [
        {
          titulo: "Compatibilidade conferida",
          texto: "Soquete do processador, tipo de memória, tamanho da placa de vídeo, altura do cooler e potência da fonte, antes de abrir qualquer caixa.",
        },
        {
          titulo: "Cabos organizados",
          texto: "Os cabos passam por trás da bandeja da placa-mãe e ficam presos. O ar circula melhor e a manutenção futura fica mais fácil.",
        },
        {
          titulo: "Ventoinhas no sentido certo",
          texto: "Ar frio entrando pela frente ou por baixo, ar quente saindo por trás e por cima, para a placa de vídeo e o processador respirarem.",
        },
        {
          titulo: "Teste com carga",
          texto: "O PC é ligado, a memória é configurada na velocidade certa e a temperatura é observada com o computador trabalhando.",
        },
      ],
    },
    {
      tipo: "texto",
      titulo: "Duas formas: suas peças ou as nossas",
      paragrafos: [
        "O caminho mais comum é comprar as peças na loja. A montagem entra no pacote que o vendedor fecha com você: organização dos cabos, conferência de compatibilidade, memória na velocidade certa e teste de temperatura antes de você ver o PC ligado.",
        "Se as peças já foram compradas em outro lugar, mande a lista pelo WhatsApp. A equipe revisa a compatibilidade nessa conversa e diz se a bancada monta e qual é o valor da mão de obra. Essa condição não está tabelada nesta página. Preço e prazo confirmados pelo WhatsApp (19) 98751-0267.",
        "Windows não vem escondido na montagem. Quem já tem licença, usa a sua. Quem não tem, inclui a licença da página de Microsoft no orçamento.",
      ],
    },
    {
      tipo: "texto",
      titulo: "Antes de comprar as peças: checagem de compatibilidade",
      paragrafos: [
        "Mande a lista ou o link do carrinho antes de pagar em outro site. Soquete, tipo de memória, tamanho da placa de vídeo, altura do cooler e potência da fonte são conferidos nessa mensagem. É o jeito de não chegar com peça que não encaixa.",
        "A coleta das peças ou do gabinete por motoboy, se você não puder trazer, é combinada à parte. Preço e prazo confirmados pelo WhatsApp.",
      ],
    },
    {
      tipo: "texto",
      titulo: "Se uma peça vier com defeito",
      paragrafos: [
        "Peça comprada na loja volta para o mesmo balcão: a garantia é a do fabricante da peça, e o serviço de montagem tem a garantia legal. A equipe testa de novo e trata a troca com o fornecedor.",
        "Peça que você trouxe de outra loja não entra na garantia da Balão. Se o teste mostrar defeito, a bancada para, te avisa e não troca a peça por conta própria. O que fazer com o vendedor de origem é com você. A loja não publica uma política diferente desta.",
      ],
    },
    {
      tipo: "retorno",
      titulo: "Pedir retorno rápido",
      texto: "Cole a lista de peças ou diga o uso. Diga se as peças já estão com você.",
      assunto: "Montagem de PC",
      campos: [
        { nome: "lista", rotulo: "Cole a lista de peças ou o link do carrinho" },
        { nome: "pecas", rotulo: "Já tem as peças?", opcoes: ["Não, quero comprar na loja", "Sim"] },
      ],
    },
    {
      tipo: "vitrine",
      titulo: "As peças que estão na loja hoje",
      texto:
        "A configuração do seu PC sai daqui. Os preços são os do site; o vendedor monta o pacote e confere a compatibilidade entre as peças.",
      regras: [
        {
          id: "placas-de-video",
          titulo: "Placas de vídeo",
          subtitulo: "A peça que mais pesa no FPS e na resolução",
          categorias: ["Hardware/Placa de vídeo (VGA)/Placa de vídeo Nvidia", "Hardware/Placa de vídeo (VGA)/Placa de vídeo AMD"],
          excluir: ["quadro", "cabo", "suporte", "extensor"],
          precoMin: 2500,
          precoMax: 9500,
          porMarca: 3,
          verTodos: { rotulo: "Ver todas as placas de vídeo, com filtros", href: "/categoria/hardware-placa-de-video-vga" },
        },
        {
          id: "processadores",
          titulo: "Processadores",
          subtitulo: "AMD Ryzen e Intel Core, do básico ao de muitos núcleos",
          categorias: ["Hardware/Processadores"],
          precoMin: 900,
          precoMax: 2800,
          porMarca: 6,
          verTodos: { rotulo: "Ver todos os processadores", href: "/categoria/hardware-processadores" },
        },
        {
          id: "fontes",
          titulo: "Fontes",
          subtitulo: "Potência com folga para a placa de vídeo escolhida",
          categorias: ["Hardware/Fontes"],
          nomeContem: ["80 plus", "cybenetics"],
          precoMin: 380,
          precoMax: 1200,
          porMarca: 2,
          verTodos: { rotulo: "Ver todas as fontes", href: "/categoria/hardware-fontes" },
        },
        {
          id: "air-coolers",
          titulo: "Air coolers",
          subtitulo: "Resolvem a maioria dos processadores com pouca manutenção",
          categorias: ["Hardware/Coolers/Air Cooler"],
          precoMin: 100,
          ordem: "menor",
          limite: 10,
          verTodos: { rotulo: "Ver todos os air coolers", href: "/categoria/hardware-coolers-air-cooler" },
        },
      ],
    },
    {
      tipo: "atalhos",
      titulo: "Prefere outro caminho?",
      texto: "Nem todo mundo quer escolher do zero. Estas páginas ajudam a decidir.",
      itens: [
        {
          titulo: "PC gamer pronto",
          texto: "Configurações já montadas, separadas pela placa de vídeo. Escolha e leve.",
          href: "/pcgamer",
          imagem: "/images/landing/v2/pcgamer.jpg",
        },
        {
          titulo: "Qual PC gamer comprar",
          texto: "Faixas de 3, 5 e 8 mil antes de fechar a lista.",
          href: "/qual-pc-gamer",
          imagem: "/images/landing/v2/pcgamer.jpg",
        },
        {
          titulo: "Monte o seu",
          texto: "Outro caminho para a configuração.",
          href: "/monteseupc",
        },
        {
          titulo: "Hardware",
          texto: "Placa, processador, fonte e memória com filtro.",
          href: "/categoria/hardware",
        },
        {
          titulo: "Upgrade de SSD",
          texto: "Quando o PC que você já tem só precisa de disco ou memória.",
          href: "/upgrade-ssd",
          imagem: "/images/landing/v2/manutencao.jpg",
        },
        {
          titulo: "Veja um PC por dentro em 3D",
          texto: "O papel de cada peça, o caminho do ar e a organização dos cabos, girando o modelo.",
          href: "/pcgamer3d",
        },
        {
          titulo: "Upgrade do PC que você já tem",
          texto: "SSD, memória e limpeza na assistência técnica, quando trocar tudo não é preciso.",
          href: "/manutencao",
        },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Quanto custa montar um PC em Campinas?",
      resposta:
        "Na Balão da Informática Anchieta, no Cambuí, a montagem com peças da loja entra na compra combinada no orçamento e inclui organização dos cabos, atualização de BIOS quando cabe e teste de temperatura. Com peças do cliente, o valor da mão de obra é passado depois da lista. Preço e prazo confirmados pelo WhatsApp.",
    },
    {
      pergunta: "Vocês montam PC com peças compradas em outra loja?",
      resposta:
        "Mande a lista pelo WhatsApp (19) 98751-0267. A bancada da Av. Anchieta, 789 revisa a compatibilidade e diz se monta e em que condição. A loja monta de rotina com as peças do próprio estoque.",
    },
    {
      pergunta: "Quanto tempo leva a montagem?",
      resposta:
        "O prazo começa quando as peças estão na loja, com teste de temperatura e estabilidade antes da retirada. Preço e prazo confirmados pelo WhatsApp.",
    },
    {
      pergunta: "Quanto custa montar um PC gamer?",
      resposta:
        "Depende dos jogos, da resolução do monitor e das peças escolhidas. Mande o uso e a faixa de orçamento pelo WhatsApp e o vendedor responde com uma configuração e o preço total; os preços de cada peça também estão na vitrine desta página.",
    },
    {
      pergunta: "Posso ver o PC funcionando antes de pagar?",
      resposta:
        "Pode. O PC é montado, testado e ligado na loja para você conferir antes do pagamento. Se você comprar pelo WhatsApp e receber em casa, tem os 7 dias de arrependimento previstos no Código de Defesa do Consumidor.",
    },
    {
      pergunta: "Vocês montam com as peças que eu comprei em outro lugar?",
      resposta:
        "Pergunte no WhatsApp com a lista das peças. A loja monta com as peças do próprio estoque; quando o cliente traz alguma peça, a equipe avalia o caso e diz como pode ajudar.",
    },
    {
      pergunta: "Dá para aproveitar peças do meu PC antigo?",
      resposta:
        "Muitas vezes, sim. Monitor, teclado, mouse e às vezes o SSD ou o gabinete podem ser aproveitados. Mande o que você tem e o vendedor diz o que serve para a nova configuração.",
    },
    {
      pergunta: "Qual a diferença entre comprar um PC gamer pronto e montar sob medida?",
      resposta:
        "O PC pronto já tem a configuração fechada e é mais rápido de levar. O sob medida parte do seu uso: dá para colocar mais memória para edição, mais VRAM para IA local ou economizar onde você não precisa.",
    },
    {
      pergunta: "Precisa de water cooler?",
      resposta:
        "Na maioria dos casos, não. Um bom air cooler dá conta da maior parte dos processadores; o water cooler entra quando o processador esquenta muito ou quando você prefere o visual mais limpo dentro do gabinete.",
    },
    {
      pergunta: "O PC já vai com Windows?",
      resposta:
        "A loja vende licenças de Windows e Office e pode entregar o PC com o sistema instalado. Diga no pedido se você já tem uma licença ou se quer incluir uma no orçamento.",
    },
    {
      pergunta: "Como funciona a garantia de um PC montado?",
      resposta:
        "Cada peça nova tem a garantia do fabricante, e o serviço de montagem tem a garantia legal. Se algo der problema, você volta ao mesmo balcão no Cambuí.",
    },
  ],
  temas: ["pc", "montagem", "pcgamer", "upgrade", "memoria", "ssd", "compra", "garantia", "licenca"],
  termosDoBlog: ["montagem", "montar pc", "pc gamer", "placa de vídeo", "fonte", "processador", "memória ram", "ia local", "upgrade", "vram"],
  tituloDasPerguntas: "Perguntas frequentes",
  relacionadas: ["pcgamer", "qual-pc-gamer", "upgrade-ssd", "pcgamer3d"],
  final: {
    titulo: "Conte o que você quer fazer com o PC",
    texto:
      "Os jogos ou programas e a faixa de orçamento bastam para o vendedor montar a primeira configuração. A loja fica na Av. Anchieta, no Cambuí, e você vê o PC ligado antes de pagar.",
    botao: "Montar meu PC pelo WhatsApp",
  },
};
