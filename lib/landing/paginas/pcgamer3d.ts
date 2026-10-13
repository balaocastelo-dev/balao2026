import type { PaginaDeCaptacao } from "../tipos";

export const pcgamer3d: PaginaDeCaptacao = {
  slug: "pcgamer3d",
  nome: "PC gamer por dentro, em 3D",
  chamada: "Gire um PC gamer em 3D e entenda o papel de cada peça, o caminho do ar e a organização dos cabos antes de comprar.",
  seo: {
    titulo: "PC Gamer por Dentro em 3D: Peças, Airflow e Cabos | Balão Campinas",
    descricao:
      "Veja um PC gamer por dentro em 3D: o que faz cada peça, como o ar circula e por que os cabos ficam escondidos. Montagem explicada pela bancada da Balão, em Campinas.",
    palavras: [
      "PC gamer por dentro em 3D",
      "o que faz cada peça do PC gamer",
      "airflow PC gamer como posicionar ventoinhas",
      "organização de cabos no gabinete",
      "water cooler ou air cooler qual escolher",
      "pressão positiva no gabinete",
      "ordem de montagem de um PC",
      "pasta térmica como aplicar",
      "PC gamer esquentando muito o que fazer",
      "montagem de PC gamer em Campinas",
    ],
    tipoDeServico: "Montagem de computadores gamer",
  },
  hero: {
    contexto: "A bancada da Balão, no Cambuí, explica",
    titulo: "Entenda o PC gamer por dentro antes de comprar o seu",
    texto:
      "Gire o modelo em 3D e veja o que faz cada peça, por onde o ar entra e sai e por que um PC bem montado esquenta menos e faz menos barulho. Quando quiser o seu, a bancada da loja monta do mesmo jeito.",
    imagem: {
      src: "/images/landing/v2/pcgamer3d.jpg",
      alt: "Peças de um PC gamer separadas no ar, em vista explodida, com luz vermelha",
    },
    mensagem: "Olá! Vim pela página do PC gamer em 3D da Balão e quero tirar uma dúvida sobre montagem.",
    botao: "Tirar dúvida com a bancada",
    secundario: { rotulo: "Ver o papel de cada peça", href: "#secao-2" },
    fatos: [
      { valor: "Modelo 3D", rotulo: "gire e aproxime cada peça" },
      { valor: "7 etapas", rotulo: "da ordem de montagem da bancada" },
      { valor: "Ar no caminho certo", rotulo: "entra frio pela frente, sai quente por trás" },
      { valor: "Bancada no Cambuí", rotulo: "a mesma que monta o seu PC" },
    ],
  },
  assistente: {
    titulo: "Pergunte para quem monta",
    texto: "Escolha a sua dúvida: um técnico da bancada responde no WhatsApp.",
    abertura: "Olá! Vim pela página do PC gamer em 3D e tenho uma dúvida de montagem.",
    fecho: "Posso mandar uma foto do meu PC por dentro?",
    botao: "Enviar para a bancada",
    perguntas: [
      {
        rotulo: "Situação",
        pergunta: "Qual é o seu caso?",
        opcoes: ["Vou comprar o primeiro PC gamer", "Quero melhorar o PC que já tenho", "Meu PC esquenta ou faz barulho", "Só quero entender as peças"],
      },
      {
        rotulo: "Dúvida",
        pergunta: "Sobre o que você quer saber?",
        varias: true,
        opcoes: [
          "Water cooler ou air cooler",
          "Quantas ventoinhas e onde",
          "Gabinete com vidro e iluminação",
          "Organização de cabos",
          "Fonte para a minha placa",
          "Pasta térmica",
        ],
      },
    ],
  },
  secoes: [
    { tipo: "especial", id: "modelo-3d" },
    {
      tipo: "beneficios",
      titulo: "O que você está vendo no modelo",
      texto: "Cada peça tem um trabalho. Entender esse trabalho ajuda a saber onde vale gastar mais e onde não precisa.",
      itens: [
        {
          titulo: "Placa-mãe",
          texto: "A base onde tudo se liga. Define qual processador e qual memória entram e quantos SSDs e conexões o PC pode ter.",
        },
        {
          titulo: "Processador",
          texto: "Organiza o jogo: física, inteligência dos personagens e o preparo de cada quadro. Pesa mais em jogos competitivos de FPS alto.",
        },
        {
          titulo: "Placa de vídeo",
          texto: "Desenha a imagem. É a maior peça e a que mais esquenta, por isso precisa de ar frio chegando por baixo e pela frente.",
        },
        {
          titulo: "Memória RAM e SSD",
          texto: "A RAM guarda o que o jogo está usando agora; o SSD guarda os jogos e carrega as fases. SSD NVMe fica direto na placa-mãe, sem cabo.",
        },
        {
          titulo: "Fonte",
          texto: "Transforma a energia da tomada para cada peça. Fica embaixo, separada do resto, com a própria entrada de ar.",
        },
        {
          titulo: "Cooler e ventoinhas",
          texto: "Tiram o calor do processador e empurram o ar pelo gabinete. Não é a quantidade que importa, é o sentido de cada uma.",
        },
      ],
    },
    {
      tipo: "texto",
      titulo: "Airflow: o caminho do ar dentro do gabinete",
      paragrafos: [
        "Ar quente sobe. Um gabinete bem montado usa isso a favor: as ventoinhas da frente e de baixo puxam ar frio de fora, e as de trás e de cima expulsam o ar quente que a placa de vídeo e o processador acabaram de aquecer. Quando uma ventoinha é instalada ao contrário, as duas brigam e o ar quente fica girando dentro do gabinete.",
        "Também conta o equilíbrio entre o ar que entra e o que sai. Com um pouco mais de ar entrando do que saindo (pressão positiva), o ar escapa pelas frestas e a poeira entra só pelos filtros, o que deixa a limpeza mais fácil. Com mais saída do que entrada, o gabinete puxa poeira por qualquer abertura.",
        "Gabinete com frente de vidro fechado é bonito, mas respira pior do que um com frente em tela. Na hora de escolher, a bancada olha as entradas de ar laterais e de baixo, o espaço para a placa de vídeo e onde cabe o radiador, se houver water cooler.",
      ],
      lista: [
        "Frente e baixo: ventoinhas puxando ar para dentro",
        "Trás e topo: ventoinhas jogando ar para fora",
        "Filtros nas entradas, para a poeira ficar do lado de fora",
        "Placa de vídeo com espaço livre embaixo para respirar",
      ],
    },
    {
      tipo: "texto",
      titulo: "Por que os cabos ficam escondidos",
      paragrafos: [
        "Organizar cabos não é só estética. Cabo solto na frente da placa de vídeo ou das ventoinhas atrapalha o caminho do ar, acumula poeira e pode encostar nas pás. Por isso a bancada passa os cabos da fonte, do painel frontal e das ventoinhas por trás da bandeja da placa-mãe e prende tudo com abraçadeiras.",
        "O planejamento vem antes de montar: a bancada decide por onde cada cabo vai passar antes de encaixar a primeira peça. Cabos de energia da placa de vídeo ficam bem encaixados e sem dobra forçada no conector. Quando o PC volta para limpeza ou upgrade, o trabalho é muito mais rápido, porque tudo está no lugar certo.",
        "Fonte modular, em que você só liga os cabos que usa, ajuda a deixar o gabinete limpo, mas não é obrigatória: com uma fonte comum, os cabos que sobram ficam guardados no compartimento de baixo.",
      ],
    },
    {
      tipo: "passos",
      titulo: "A ordem em que a bancada monta",
      texto: "A sequência evita retrabalho e protege as peças. É a mesma que a loja segue nos PCs que entrega.",
      itens: [
        {
          titulo: "Planejar e descarregar a estática",
          texto: "Painéis do gabinete removidos, parafusos separados e o caminho dos cabos decidido. Antes de tocar nas peças, o técnico descarrega a eletricidade estática.",
        },
        {
          titulo: "Placa-mãe fora do gabinete",
          texto: "Processador, memória e SSD NVMe entram com a placa-mãe apoiada na bancada, onde dá para ver cada trava e encaixe.",
        },
        {
          titulo: "Pasta térmica e cooler",
          texto: "Superfície limpa, quantidade certa de pasta e aperto em cruz, aos poucos, para a pressão ficar igual em todo o processador.",
        },
        {
          titulo: "Fonte e cabos principais",
          texto: "A fonte entra e os cabos já seguem por trás da bandeja, presos e sem curvas forçadas.",
        },
        {
          titulo: "Ventoinhas e radiador",
          texto: "Cada ventoinha no sentido certo: entrada na frente e embaixo, saída atrás e em cima, com os filtros no lugar.",
        },
        {
          titulo: "Placa de vídeo por último",
          texto: "Por ser a maior peça, ela entra no fim, bem presa e sem tensão nos cabos de energia.",
        },
        {
          titulo: "Primeiro boot e testes",
          texto: "O PC é ligado, a memória é configurada na velocidade certa e as temperaturas são conferidas com o computador trabalhando.",
        },
      ],
    },
    {
      tipo: "comparativo",
      titulo: "Water cooler ou air cooler?",
      texto: "As duas soluções funcionam. A escolha depende do processador, do gabinete e do que você prefere.",
      colunas: ["Ponto", "Air cooler", "Water cooler"],
      linhas: [
        ["Como funciona", "Dissipador de metal com ventoinha em cima do processador", "Líquido leva o calor até um radiador com ventoinhas"],
        ["Quando é a melhor escolha", "Maioria dos processadores para jogo", "Processadores que esquentam muito ou trabalho pesado contínuo"],
        ["Espaço no gabinete", "Precisa de altura livre acima do processador", "Precisa de lugar para o radiador na frente ou no topo"],
        ["Manutenção", "Limpar a poeira das aletas", "Limpar o radiador; o circuito é selado"],
        ["Visual", "Mais discreto", "Deixa a área do processador livre e mais limpa"],
      ],
    },
    {
      tipo: "vitrine",
      titulo: "Refrigeração e base: as peças do modelo, na loja",
      texto:
        "O que tira o calor e onde tudo se liga. Os preços são os do site; a bancada confere se o radiador e as ventoinhas cabem no seu gabinete.",
      regras: [
        {
          id: "water-coolers",
          titulo: "Water coolers",
          subtitulo: "240 mm e 360 mm para processadores que esquentam mais",
          categorias: ["Hardware/Coolers/Water Cooler"],
          nomeContem: ["240mm", "280mm", "360mm", "420mm", "240", "280", "360", "420"],
          precoMin: 350,
          precoMax: 3200,
          porMarca: 2,
          verTodos: { rotulo: "Ver todos os water coolers", href: "/categoria/hardware-coolers-water-cooler" },
        },
        {
          id: "ventoinhas",
          titulo: "Ventoinhas para o airflow",
          subtitulo: "120 mm e 140 mm, avulsas ou em kit",
          categorias: ["Hardware/Coolers/FAN"],
          precoMin: 80,
          porMarca: 2,
          limite: 10,
          verTodos: { rotulo: "Ver todas as ventoinhas", href: "/categoria/hardware-coolers-fan" },
        },
        {
          id: "placas-mae",
          titulo: "Placas-mãe",
          subtitulo: "AM5 e Intel com DDR5, para quem monta do zero",
          categorias: ["Hardware/Placas-mãe"],
          nomeContem: ["ddr5"],
          precoMin: 900,
          precoMax: 6000,
          porMarca: 3,
          verTodos: { rotulo: "Ver todas as placas-mãe", href: "/categoria/hardware-placas-mae" },
        },
        {
          id: "pasta-termica",
          titulo: "Pasta térmica",
          subtitulo: "Para trocar quando o cooler sai do lugar",
          categorias: ["Hardware/Coolers/Pasta Térmica"],
          ordem: "menor",
          limite: 6,
        },
      ],
    },
    {
      tipo: "atalhos",
      titulo: "Entendeu? Agora escolha o seu",
      texto: "Duas formas de sair daqui com um PC gamer montado do jeito que você acabou de ver.",
      itens: [
        {
          titulo: "Montagem sob medida",
          texto: "Diga o uso e a faixa de orçamento; a loja escolhe as peças, monta e mostra ligado.",
          href: "/montagempc",
        },
        {
          titulo: "PC gamer pronto",
          texto: "Configurações montadas, separadas pela placa de vídeo.",
          href: "/pcgamer",
        },
        {
          titulo: "Meu PC esquenta",
          texto: "Limpeza, pasta térmica e revisão das ventoinhas na assistência técnica.",
          href: "/manutencao",
        },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Qual é a ordem certa de montar um PC?",
      resposta:
        "Primeiro processador, memória e SSD na placa-mãe fora do gabinete; depois cooler, placa-mãe no gabinete, fonte e cabos, ventoinhas e, por último, a placa de vídeo. Essa sequência evita retrabalho e deixa os encaixes à vista.",
    },
    {
      pergunta: "Como posicionar as ventoinhas do gabinete?",
      resposta:
        "As da frente e de baixo puxam ar para dentro; as de trás e do topo jogam ar para fora. Um pouco mais de ar entrando do que saindo ajuda a manter a poeira nos filtros.",
    },
    {
      pergunta: "Water cooler é melhor que air cooler?",
      resposta:
        "Não necessariamente. Um bom air cooler resolve a maioria dos processadores para jogo; o water cooler vale para processadores que esquentam muito, trabalho pesado contínuo ou para quem quer a área do processador mais limpa.",
    },
    {
      pergunta: "De quanto em quanto tempo trocar a pasta térmica?",
      resposta:
        "Não há prazo fixo: a pasta precisa ser trocada sempre que o cooler é removido e quando as temperaturas sobem sem outra explicação. Na dúvida, a assistência técnica mede a temperatura e diz se é a hora.",
    },
    {
      pergunta: "Organizar os cabos muda a temperatura?",
      resposta:
        "Ajuda, principalmente quando havia cabos soltos na frente das ventoinhas ou da placa de vídeo. Além do ar circular melhor, a poeira acumula menos e a limpeza fica mais rápida.",
    },
    {
      pergunta: "Gabinete com vidro esquenta mais?",
      resposta:
        "A lateral de vidro não atrapalha; o que pesa é a frente. Gabinete com frente de vidro fechado respira pior que um com frente em tela, a não ser que tenha entradas de ar laterais ou embaixo.",
    },
    {
      pergunta: "A Balão monta o PC desse jeito?",
      resposta:
        "Sim. A bancada da loja no Cambuí monta seguindo essas etapas, organiza os cabos e testa com carga antes de mostrar o PC ligado para você. Veja a página de montagem sob medida para pedir o orçamento.",
    },
  ],
  temas: ["pcgamer", "montagem", "pc", "upgrade", "games"],
  termosDoBlog: ["montagem", "airflow", "water cooler", "cooler", "pasta térmica", "gabinete", "fonte", "pc gamer", "placa de vídeo"],
  relacionadas: ["montagempc", "pcgamer", "manutencao"],
  final: {
    titulo: "Ficou alguma dúvida sobre as peças?",
    texto:
      "Mande a pergunta ou uma foto do seu PC por dentro: quem responde é a equipe que monta. A bancada fica na loja da Av. Anchieta, no Cambuí.",
    botao: "Perguntar para a bancada",
  },
};
