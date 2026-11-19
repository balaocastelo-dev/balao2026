import { p, h2, ul, ol, rapida, img, nota, tabela, pros, chamada, fontes } from "./blocos.mjs";

const loja = "Balão da Informática Anchieta, loja de informática em Campinas";

export const maquinas = [
  {
    slug: "pc-para-gta-6-sem-requisito-oficial",
    titulo: "PC para GTA 6: como escolher a máquina enquanto espera",
    seoTitulo: "PC para GTA 6: o que decidir sem ficha oficial",
    resumo:
      "PC para GTA 6 sem ficha oficial: escolha pela sua tela e pelos jogos que você já roda. Veja o histórico de GTA V e RDR2 e o que montar agora.",
    palavrasChave: ["pc para gta 6", "qual pc roda gta 6", "computador para gta 6", "pc gamer gta 6"],
    etiquetas: ["GTA 6", "PC gamer", "Montagem"],
    capaAlt: "Estação de jogo no escuro, com gabinete iluminado, um PC para GTA 6 quando a versão existir.",
    fontes: fontes("rockstarVi", "yahooPc", "gtavPc", "rdr2Pc", "wikiGtav", "wikiRdr2"),
    blocos: [
      p("PC para GTA 6, hoje, é uma escolha de bom senso e não de ficha técnica. A Rockstar não anunciou versão de computador, nem pré-venda, nem a lista de peças. Dá para montar uma máquina excelente para os mundos abertos que já estão no PC, para GTA V e para uma live, e deixar essa máquina pronta para o dia em que o anúncio sair."),
      rapida([
        "Na estreia de 19 de novembro de 2026, Grand Theft Auto VI está no PS5 e no Xbox Series X|S.",
        "GTA V chegou ao PC em 14 de abril de 2015 e Red Dead Redemption 2 em 5 de novembro de 2019, ambos depois dos consoles. É histórico, não calendário do GTA 6.",
        "A compra certa agora começa pela resolução do monitor e pelos jogos que você abre toda semana.",
      ]),
      h2("Qual PC para GTA 6 faz sentido comprar agora"),
      p("Comece pela tela. Full HD pede uma placa mais contida e ainda entrega cidade nítida em 24 polegadas. Quad HD, em 27, pede mais GPU e mais memória de vídeo. 4K pede o topo. Essa conta vale para os jogos grandes de hoje e está detalhada em [monitor para GTA 6](/blog/monitor-para-gta-6) e em [placa de vídeo](/blog/placa-de-video-para-gta-6). Sem a tela definida, qualquer lista de peças é vitrine."),
      p("O segundo passo é o uso real. Só jogar, de noite, com o Discord fechado, é uma máquina. Jogar com navegador, mapa e captura é outra, com 32 GB de RAM e um processador que não esteja no limite. A matéria de [memória](/blog/memoria-ram-para-gta-6) e a de [processador](/blog/processador-para-gta-6) separam os dois casos. O disco, quase sempre, é SSD NVMe com folga, como está em [SSD](/blog/ssd-para-gta-6)."),
      img(
        "Notebook e desktop na mesma mesa: os dois jogam. A escolha é mobilidade contra peça trocável.",
        "Computador, notebook e teclado numa mesa, opções de PC para GTA 6 enquanto a ficha não sai.",
      ),
      h2("O que a Rockstar já fez no PC, como histórico"),
      p("GTA V saiu nos consoles em 17 de setembro de 2013 e no PC em 14 de abril de 2015. O newswire da versão de computador fala em resolução alta, 60 quadros, muitos ajustes gráficos e controle de densidade de carros e pedestres. Red Dead Redemption 2 saiu nos consoles em 26 de outubro de 2018 e no PC em 5 de novembro de 2019, com melhorias gráficas anunciadas pela própria Rockstar. As datas de PC estão nos newswires. As de console, na Wikipedia, só como calendário."),
      p("O intervalo foi de cerca de 19 meses no GTA V e de pouco mais de um ano no Red Dead. Ninguém prometeu que Grand Theft Auto VI vai repetir a conta. O uso prático desse histórico é outro: não pare a sua vida de jogador esperando um mês que não foi marcado, e não compre uma chave de PC que não está à venda. Quem quer a campanha em novembro usa console. Quem quer o computador monta para o que já joga."),
      tabela({
        titulo: "Três caminhos, sem ficha inventada",
        colunas: ["Seu plano", "O que fazer agora", "O que não fazer"],
        linhas: [
          ["Jogar a campanha na semana da estreia", "PS5 ou Xbox Series X|S", "Comprar “chave de PC” em anúncio"],
          ["Jogar no PC e topar esperar", "Montar para a sua tela e para o GTA V", "Guardar o dinheiro parado sem usar a máquina"],
          ["Transmitir os jogos que já tem", "Folga de CPU, 32 GB e um SSD com espaço", "Gravar em disco cheio achando que a live espera o GTA 6"],
        ],
        fonte: "rockstarVi",
        nota: "A coluna do console segue a lista oficial. A coluna do PC é preparação, não requisito publicado.",
      }),
      img(
        "Mesa de demonstração: gabinete, tela e fone juntos. É assim que a configuração fecha, não peça por peça no escuro.",
        "Monitor, gabinete com luz e headset, demonstração de um PC para GTA 6 na prática.",
      ),
      h2("As três faixas que a loja usa"),
      ul([
        "[PC gamer de entrada](/blog/pc-gamer-entrada-para-gta-6): Full HD, jogos atuais no alto, sem transmitir em qualidade pesada.",
        "[PC intermediário](/blog/pc-gamer-intermediario-para-gta-6): Quad HD e folga de memória de vídeo.",
        "[Alto desempenho](/blog/pc-gamer-alto-desempenho-gta-6): tela exigente, captura e anos de folga.",
      ]),
      p("Se a máquina atual só precisa de uma peça, o caminho é o [upgrade](/blog/upgrade-do-pc-antes-do-gta-6), não uma torre nova. Notebook contra desktop está em [notebook ou desktop](/blog/notebook-gamer-ou-desktop-gta-6)."),
      pros(
        "Montar agora é uma boa ideia quando",
        [
          "O PC atual já sofre nos jogos que você abre toda semana.",
          "Você sabe a resolução do monitor e o que mais roda junto do jogo.",
          "A máquina nova vai ser usada, não embalada à espera de um anúncio.",
        ],
        [
          "A única frase do orçamento é “tem de rodar GTA 6 no ultra”.",
          "Você viu uma lista de peças num vídeo sem fonte.",
          "O console da sala resolveria a estreia e o PC está ótimo para o que você joga.",
        ],
      ),
      img(
        "A placa dentro do gabinete é o pedaço que a resolução da tela vai cobrar.",
        "Placa de vídeo dentro de um gabinete escuro, coração de um PC para GTA 6 no futuro.",
      ),
      nota(
        "dica",
        "O que dizer no WhatsApp",
        "Resolução do monitor, três jogos que você mais abre, e se vai transmitir. Com isso a equipe fecha uma configuração. Sem isso, qualquer lista é genérica.",
      ),
      chamada({
        tema: "pc-gamer",
        titulo: "Quer a configuração em cima da sua tela?",
        texto: `A ${loja} monta e mostra a máquina ligada. Av. Anchieta, 789, Cambuí, Campinas. WhatsApp (19) 98751-0267. Telefone (19) 3255-1661.`,
        rotulo: "Pedir orçamento",
        href: "/montagempc",
        mensagem: "Olá! Li a matéria de PC para GTA 6 e quero uma configuração para o meu monitor.",
      }),
      p("Em Campinas, o atendimento presencial está em [PC gamer no Cambuí](/blog/pc-gamer-gta-6-campinas). A série inteira fica em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "Qual PC roda GTA 6?",
        resposta:
          "Ainda não há ficha. A Rockstar não anunciou a versão de PC. Dá para montar pela resolução da sua tela e pelos jogos de mundo aberto que você já joga.",
      },
      {
        pergunta: "GTA 6 vai sair para PC?",
        resposta:
          "Não foi anunciado. A estreia de 19 de novembro de 2026 é em PS5 e Xbox Series X|S. GTA V e Red Dead Redemption 2 chegaram ao PC depois, e isso não marca a data deste jogo.",
      },
      {
        pergunta: "Vale montar um PC antes do anúncio?",
        resposta:
          "Vale se ele melhora o que você já joga. Não vale se a máquina for ficar parada esperando uma ficha que não existe.",
      },
      {
        pergunta: "Quanto custa um PC para GTA 6?",
        resposta:
          "Não publicamos preço de peça nem de máquina pronta: muda toda semana. O orçamento sai na loja, em cima do seu monitor e dos seus jogos.",
      },
      {
        pergunta: "Por onde começo a escolha?",
        resposta:
          "Pela tela. Full HD, Quad HD ou 4K mudam a placa, a memória de vídeo e o restante da configuração.",
      },
    ],
  },
  {
    slug: "pc-gamer-entrada-para-gta-6",
    titulo: "PC gamer de entrada para GTA 6: o que montar em Full HD",
    seoTitulo: "PC gamer de entrada para GTA 6 em Full HD",
    resumo:
      "PC gamer de entrada para GTA 6 em Full HD: placa com folga de VRAM, 16 GB e SSD. Para os jogos de hoje, sem a ficha que a Rockstar não publicou.",
    palavrasChave: ["pc gamer de entrada para gta 6", "pc gamer barato full hd", "pc de entrada gta 6", "computador gamer full hd"],
    etiquetas: ["GTA 6", "PC gamer", "Full HD", "Entrada"],
    capaAlt: "Gabinete com luz e monitor numa mesa, exemplo de PC gamer de entrada para GTA 6 em Full HD.",
    fontes: fontes("rockstarVi", "yahooPc"),
    blocos: [
      p("PC gamer de entrada para GTA 6, do jeito que a loja monta, é uma máquina de Full HD para os jogos que já estão no mercado. A Rockstar não publicou a versão de computador, então esta faixa não promete “roda o GTA 6”. Ela promete outra coisa, que a gente sustenta: cidade fluida em 1080p nos mundos abertos atuais, com SSD e memória que não estouram no primeiro mês."),
      rapida([
        "A faixa de entrada mira Full HD, em geral numa tela de 24 polegadas.",
        "16 GB de RAM jogam com o sistema enxuto. SSD NVMe guarda o Windows e os jogos da semana.",
        "Transmitir em qualidade alta fica para a faixa de cima. Aqui o foco é jogar bem.",
      ]),
      h2("PC gamer de entrada para GTA 6: para quem é"),
      p("É para quem está saindo de um computador de escritório ou de um notebook fino e quer jogar de verdade em Full HD. Também é para quem já tem um monitor de 1080p bom e não pretende trocar a tela este ano. Se o plano é um Quad HD de 27 polegadas, esta faixa fica curta e o texto certo é o [PC intermediário](/blog/pc-gamer-intermediario-para-gta-6)."),
      p("A placa de vídeo é o centro do orçamento. Em Full HD, dá para jogar qualidade alta nos lançamentos atuais sem ir ao topo da tabela, desde que a memória de vídeo não seja o menor número da prateleira. A comparação entre 8 GB e 16 GB na mesma família de chip está na análise da [RTX 5060 Ti](/blog/rtx-5060-ti-8gb-ou-16gb). Use aquilo como exemplo de geração atual, não como modelo obrigatório do GTA 6."),
      img(
        "Mesa escura, monitor e teclado: a entrada bem feita parece setup de quem joga, não sobra de escritório.",
        "Monitor, teclado e mouse numa mesa, PC gamer de entrada para GTA 6 em Full HD.",
      ),
      tabela({
        titulo: "O que entra numa configuração de Full HD",
        colunas: ["Peça", "Nesta faixa", "Pode ficar para depois"],
        linhas: [
          ["Placa de vídeo", "Modelo atual com folga de VRAM para 1080p", "Topo de linha pensado em 4K"],
          ["Processador", "Chip recente de 6 núcleos", "O mais caro da soquete, se você não transmite"],
          ["Memória", "16 GB em dois pentes", "32 GB, a menos que você já deixe tudo aberto"],
          ["Disco", "SSD NVMe de 1 TB", "HD “porque cabe mais jogo”"],
          ["Fonte", "Com folga e conector da placa", "Fonte genérica sem marca legível"],
        ],
        nota: "Faixa de montagem da loja para jogos atuais em Full HD. Não é lista oficial de Grand Theft Auto VI.",
      }),
      h2("Onde a entrada economiza, e onde não pode"),
      p("Economiza no processador de vitrine, no cooler extravagante e no gabinete que parece aquário. Não economiza na fonte nem no SSD. Fonte fraca desliga a máquina no pico da placa. HD no lugar do SSD devolve a tela de carregamento que você queria deixar para trás. Gabinete pequeno demais, que não respira, transforma peça boa em peça quente. A bancada mede isso antes de fechar a tampa."),
      p("Dezesseis gigabytes de RAM, em dois pentes, fecham a faixa. Se você já sabe que joga com dez guias e o Discord, suba para 32 GB agora: é o upgrade mais simples e evita abrir o gabinete de novo em dois meses. A conta está em [memória RAM](/blog/memoria-ram-para-gta-6)."),
      img(
        "O pedido começa no balcão, com a tela e os jogos que você realmente abre.",
        "Balcão da Balão da Informática Anchieta, onde se pede um PC gamer de entrada para GTA 6.",
      ),
      pros(
        "A entrada acerta quando",
        [
          "O monitor é Full HD e vai continuar assim.",
          "Você joga mais do que transmite.",
          "A fonte e o SSD não foram o item cortado do orçamento.",
        ],
        [
          "Você já separou um Quad HD e quer “ir levando” com placa de Full HD.",
          "O gabinete não tem entrada de ar e a placa fica colada no vidro.",
          "A compra só se justifica se alguém garantir o GTA 6. Ninguém pode.",
        ],
      ),
      ol([
        "Diga a resolução e o tamanho do monitor.",
        "Cite dois jogos que você quer ver fluidos.",
        "Diga se o PC também é de trabalho ou de aula, para não faltar porta e memória.",
        "Peça para ver a máquina ligada antes de levar. É o padrão da loja.",
      ]),
      p("Um degrau acima está o [intermediário](/blog/pc-gamer-intermediario-para-gta-6). Quem já tem PC e só troca peça olha o [upgrade](/blog/upgrade-do-pc-antes-do-gta-6). A visão geral, sem faixa, está em [PC para GTA 6](/blog/pc-para-gta-6-sem-requisito-oficial)."),
      img(
        "Caixa e atendimento no mesmo balcão: a máquina não sai sem alguém conferir o pedido.",
        "Balcão do caixa da loja em Campinas, retirada de um PC gamer de entrada para GTA 6.",
      ),
      chamada({
        tema: "pc-gamer",
        titulo: "Quer fechar um Full HD sem peça sobrando?",
        texto: `A ${loja} monta a faixa de entrada e mostra ligada. Av. Anchieta, 789, Cambuí. WhatsApp (19) 98751-0267.`,
        rotulo: "Montar em Full HD",
        href: "/montagempc",
        mensagem: "Olá! Li a matéria de PC gamer de entrada para GTA 6 e quero uma máquina de Full HD.",
      }),
      p("As máquinas prontas também estão na categoria de [PC gamer](/categoria/computadores-pc-pc-gamer). A série do jogo fica em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "PC de entrada roda GTA 6?",
        resposta:
          "Não há como afirmar: a Rockstar não publicou a versão de PC. A faixa de entrada é desenhada para jogos atuais em Full HD.",
      },
      {
        pergunta: "Quantos GB de RAM na entrada?",
        resposta:
          "16 GB em dois pentes, se você joga com o resto fechado. 32 GB se Discord, navegador e jogo ficam abertos juntos.",
      },
      {
        pergunta: "Precisa de SSD?",
        resposta:
          "Sim. HD no lugar do SSD devolve carregamento longo. Um NVMe de 1 TB cabe sistema e os jogos da rotação.",
      },
      {
        pergunta: "Dá para transmitir nessa faixa?",
        resposta:
          "Dá uma live simples, com o codificador da placa, se o jogo estiver folgado. Qualidade alta e jogo pesado juntos pedem a faixa de cima.",
      },
      {
        pergunta: "Qual o preço?",
        resposta:
          "Não fixamos preço no blog. O orçamento sai na loja, com as peças do dia, para o seu monitor.",
      },
    ],
  },
];
