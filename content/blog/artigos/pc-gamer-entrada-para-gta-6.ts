import type { Artigo, Fonte } from "@/lib/blog/tipos";

const ROCKSTARVI: Fonte = {
  nome: "Rockstar Games — página oficial de Grand Theft Auto VI",
  url: "https://www.rockstargames.com/VI",
  data: "consulta em 19 de novembro de 2026",
};

const YAHOOPC: Fonte = {
  nome: "Yahoo / Just Jared — “GTA 6 PC Release Date: Is Grand Theft Auto VI Coming to PC?”",
  url: "https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html",
  data: "15 de novembro de 2026",
};

const STEAM: Fonte = {
  nome: "Steam — Pesquisa de hardware e software",
  url: "https://store.steampowered.com/hwsurvey/",
  data: "setembro de 2026",
};

const TAKETWO: Fonte = {
  nome: "Take-Two Interactive — comunicado de pré-venda de Grand Theft Auto VI",
  url: "https://taketwointeractivesoftwareinc.gcs-web.com/news-releases/news-release-details/rockstar-games-announces-pre-orders-grand-theft-auto-vi/",
  data: "24 de junho de 2026",
};

const artigo: Artigo = {
  slug: "pc-gamer-entrada-para-gta-6",
  titulo: "PC gamer de entrada pensando no GTA 6",
  resumo: "Entrada, aqui, é jogar em Full HD os jogos de agora, com placa dedicada, 16 GB e SSD. Peça orçamento. Não é um PC de GTA 6.",
  categoria: "guias",
  etiquetas: [
    "GTA 6",
    "PC gamer",
    "Entrada",
  ],
  capa: {
    src: "/blog/capas/pc-gamer-entrada-para-gta-6.webp",
    alt: "Capa de PC de entrada em Full HD com placa dedicada, memória e SSD, sem o rótulo de PC de GTA 6",
    largura: 1536,
    altura: 1024,
    pronta: true,
  },
  publicadoEm: "2026-11-11T18:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "PC gamer de entrada pensando no GTA 6",
    palavrasChave: [
      "pc gamer de entrada",
      "pc gamer full hd",
      "montar pc de entrada",
      "placa dedicada 16 gb ssd",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "PC gamer de entrada pensando no GTA 6 mistura uma faixa de máquina com um jogo sem ficha de PC. Chamar esse computador de “PC de GTA 6” ignora o corte: até 19 de novembro de 2026 não havia requisito para copiar. A [página da Rockstar](https://www.rockstargames.com/VI) lista console. A faixa de entrada se define sem esse nome.",
    },
    {
      tipo: "paragrafo",
      texto: "Entrada, nesta página, é o computador que joga em Full HD os jogos de agora, com placa de vídeo dedicada, 16 GB de memória e SSD. O orçamento não fica escrito aqui. O pedido é de orçamento, feito no dia, com a sua lista de jogos. Não é uma configuração oficial de GTA 6.",
    },
    {
      tipo: "resumo",
      itens: [
        "**Entrada joga Full HD agora.** É a faixa para os títulos que você já abre, não para uma ficha futura.",
        "**Placa dedicada entra.** Vídeo integrado fica de fora quando o jogo de hoje já pede placa própria.",
        "**16 GB e SSD são o piso comum.** Memória para a sessão e disco para o jogo não morar num HD.",
        "**O nome certo não é PC de GTA 6.** Até 19 de novembro de 2026 esse requisito não existia.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Entrada é a faixa que joga os títulos de agora",
    },
    {
      tipo: "paragrafo",
      texto: "Faixa de entrada não é o gabinete com luz mais fraco da prateleira. É a máquina em que os jogos que você lista rodam em Full HD, no ajuste que você aceita. Se a lista tem jogo pesado de hoje, a faixa sobe dentro do Full HD. GTA 6 não está na lista, porque não tem versão de PC.",
    },
    {
      tipo: "paragrafo",
      texto: "Full HD é também o parque mais comum. Na Steam de setembro de 2026, 47,91% dos PCs usavam essa resolução, como está no [artigo da pesquisa](/blog/steam-setembro-2026-vram-16gb). Entrada casa com esse parque de propósito. Quad HD é outra faixa, tratada na matéria de [monitor](/blog/monitor-para-gta-6), e pede mais placa. Começar em Quad HD e chamar de entrada empurra o orçamento para fora do nome.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/pc-gamer-entrada-para-gta-6-faixa.webp",
        alt: "Desenho de bancada com quatro peças da faixa de entrada: placa de vídeo dedicada, 16 GB de memória, SSD e tela Full HD",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Placa dedicada, 16 GB, SSD e tela Full HD definem a faixa. O nome do jogo não entra no rótulo.",
    },
    {
      tipo: "paragrafo",
      texto: "O [comunicado da Take-Two](https://taketwointeractivesoftwareinc.gcs-web.com/news-releases/news-release-details/rockstar-games-announces-pre-orders-grand-theft-auto-vi/) marca o dia 19 de novembro de 2026 para console. A [checagem do Yahoo](https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html), em 15 de novembro de 2026, não achou PC. Por isso a faixa de entrada não “se prepara para o lançamento”. Ela atende a semana em que você vai usar a máquina.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Full HD, placa dedicada, 16 GB e SSD",
    },
    {
      tipo: "paragrafo",
      texto: "Placa dedicada é a linha que separa esta faixa de um computador de escritório. O vídeo integrado do processador desenha tela de trabalho e jogo leve. Nos jogos pesados de agora, em Full HD, ele é o primeiro a ficar sem fôlego. A categoria de [placas de vídeo](/categoria/hardware-placa-de-video-vga) existe para essa peça ter nome, escolhido pelos seus jogos, não pelo nome GTA 6.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Vídeo integrado fica fora dessa faixa",
    },
    {
      tipo: "paragrafo",
      texto: "Dá para jogar coisa leve no vídeo integrado. Não é a faixa desta página. Se o pedido é “PC gamer de entrada”, a placa dedicada entra. Se o pedido é só estudo e um jogo ocasional muito leve, a conversa muda de caminho. Misturar os dois pedidos produz uma máquina que não atende nenhum dos dois.",
    },
    {
      tipo: "paragrafo",
      texto: "Memória de 16 GB é o piso comum do PC de jogo hoje, e SSD tira o jogo do HD. Os dois estão explicados, sem virar ficha, nas matérias de [memória](/blog/memoria-ram-para-gta-6) e de [SSD](/blog/ssd-para-gta-6). Trinta e dois gigabytes só entram se você já grava ou deixa muita janela aberta. Não entram porque “GTA 6 vai pedir”.",
    },
    {
      tipo: "destaque",
      tom: "atencao",
      titulo: "Entrada não é PC de GTA 6",
      texto: "Placa dedicada, 16 GB e SSD em Full HD descrevem uma faixa para os jogos de agora. Até 19 de novembro de 2026 a Rockstar não publicou requisito que transforme essa faixa numa configuração de GTA 6.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que essa faixa não promete",
    },
    {
      tipo: "paragrafo",
      texto: "Não promete Quad HD, não promete taxa alta de competitivo e não promete um jogo sem versão de PC. Duas placas dedicadas diferentes cabem em Full HD, conforme os jogos da sua lista. Cravar um chip como “o de entrada para GTA 6” seria fabricar a ficha que a Rockstar não publicou.",
    },
    {
      tipo: "tabela",
      titulo: "O que a faixa de entrada faz e o que ela não promete",
      colunas: [
        "Peça",
        "Papel nos jogos de agora",
        "O que não promete",
      ],
      linhas: [
        [
          "Placa dedicada",
          "Tira o jogo pesado do vídeo integrado",
          "Rodar GTA 6 sem ficha",
        ],
        [
          "16 GB de RAM",
          "Piso comum da sessão de jogo",
          "Requisito do título",
        ],
        [
          "SSD",
          "Abre jogo grande sem esperar o HD",
          "Um tamanho oficial de PC",
        ],
        [
          "Tela Full HD",
          "Combina com essa faixa de placa",
          "Quad HD, que pede outra máquina",
        ],
      ],
      colunaDestaque: 1,
      fonte: YAHOOPC,
      nota: "Até 15 de novembro de 2026 a reportagem do Yahoo não achou requisito de PC. A faixa é de uso atual.",
    },
    {
      tipo: "paragrafo",
      texto: "Processador desta faixa acompanha a placa, em vez de sobrar ou faltar. A matéria de [processador](/blog/processador-para-gta-6) mostra como ver esse equilíbrio sem citar um modelo “certo”. Fonte e gabinete cabem a placa escolhida. A categoria de [PCs gamer](/categoria/computadores-pc-pc-gamer) junta o conjunto, ainda sem o rótulo do jogo.",
    },
    {
      tipo: "chamada",
      tema: "pc-gamer",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que dizer no pedido de orçamento",
    },
    {
      tipo: "paragrafo",
      texto: "O orçamento só presta se você disser o uso. Liste dois ou três jogos que você abre hoje, diga se o monitor é Full HD e se a máquina também grava ou estuda com muitas abas. Com isso, placa, memória e disco saem de uma faixa real. O pedido se faz em [qual PC gamer](/qual-pc-gamer) ou na [montagem](/montagempc).",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/pc-gamer-entrada-para-gta-6-pedido.webp",
        alt: "Fluxo do pedido de orçamento: listar os jogos de hoje, dizer se a tela é Full HD, pedir placa dedicada com 16 GB e SSD, e não chamar de PC de GTA 6",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Jogos, tela e as três peças da faixa. O nome PC de GTA 6 fica de fora do pedido.",
    },
    {
      tipo: "paragrafo",
      texto: "Notebook de entrada é outro pedido: a tela vem junto, a placa é a que cabe no chassi e a memória às vezes vem soldada. Se a mobilidade importa na sua semana, a conversa está em [notebooks](/notebooks). Se a mesa é fixa, o desktop de entrada continua sendo a faixa desta página. GTA 6 não escolhe entre os dois.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que conferir na máquina ligada",
    },
    {
      tipo: "paragrafo",
      texto: "Antes de fechar, a máquina ligada abre um jogo da sua lista, em Full HD, e mostra a placa dedicada em uso, não o vídeo integrado. O SSD aparece como disco do sistema. A memória aparece com 16 GB reconhecidos. São conferências sobre os jogos de agora, feitas na sua frente. Não são uma pontuação de GTA 6.",
    },
    {
      tipo: "paragrafo",
      texto: "Se alguma dessas conferências falha, a faixa não foi entregue, mesmo que a caixa diga gamer. O guia geral, com o mesmo corte de data, está em [PC para GTA 6](/blog/pc-para-gta-6-sem-requisito-oficial). A leitura local, para quem vai montar em Campinas, continua em [PC gamer e GTA 6](/blog/pc-gamer-gta-6-campinas), sem transformar a cidade num requisito.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/pc-gamer-entrada-para-gta-6-fecho.webp",
        alt: "Quatro peças da faixa de entrada: placa dedicada, 16 GB de RAM, SSD e tela Full HD, sem o rótulo de PC de GTA 6",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Entrada é o PC que joga em Full HD o que você já joga. O orçamento é do dia, no WhatsApp.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "A faixa fica definida por uso: Full HD nos jogos de agora",
        "Placa dedicada, 16 GB e SSD são peças observáveis, não slogan",
        "O orçamento pede a sua lista, então não nasce genérico",
      ],
      contras: [
        "Não é um PC de GTA 6 e não cabe esse rótulo",
        "Quad HD e competitivo de taxa alta são outra faixa",
        "Sem a lista de jogos, o orçamento não tem o que acertar",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Antes de pedir o orçamento",
    },
    {
      tipo: "paragrafo",
      texto: "Peça o orçamento pelo WhatsApp (19) 98751-0267 ou no balcão da Balão da Informática Anchieta, Av. Anchieta, 789, Cambuí, Campinas. Diga os jogos, a tela e se a máquina também grava. O valor é o do dia em que você pergunta, e esta página não o antecipa.",
    },
    {
      tipo: "paragrafo",
      texto: "Você vê a máquina ligada com um jogo da sua lista antes de decidir. Se o que você quer é jogar GTA 6 no dia 19, o publicado até aqui é o console, e a resposta tem de ser essa. A decisão é pedir orçamento de um PC de entrada para Full HD atual, e não de um PC de GTA 6.",
    },
    {
      tipo: "chamada",
      titulo: "Quer orçamento de entrada para Full HD?",
      texto: "Mande os jogos que você abre hoje e a resolução da tela. O retorno descreve essa faixa, sem chamar a máquina de PC de GTA 6.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "O que é um PC gamer de entrada?",
      resposta: "Nesta página, é o computador que joga em Full HD os títulos de agora, com placa de vídeo dedicada, 16 GB de memória e SSD. Não é um modelo único. O orçamento sai da lista de jogos que você informa.",
    },
    {
      pergunta: "Esse PC roda GTA 6?",
      resposta: "Não há como afirmar. Até 19 de novembro de 2026 a Rockstar não anunciou versão de PC nem requisito. A faixa de entrada atende os jogos de hoje em Full HD. Chamá-la de PC de GTA 6 é o rótulo que esta página recusa.",
    },
    {
      pergunta: "Dá para começar sem placa dedicada?",
      resposta: "Dá para um uso leve, e esse uso não é a faixa de entrada descrita aqui. Nos jogos pesados de agora, em Full HD, o vídeo integrado é o primeiro limite. Se o pedido é PC gamer de entrada, a placa dedicada faz parte da definição.",
    },
    {
      pergunta: "O que informar no orçamento?",
      resposta: "Os jogos que você abre hoje, se a tela é Full HD e se a máquina também grava ou estuda com muitas abas. Com isso, placa, memória e disco têm critério. Sem isso, o pedido vira um chassi genérico, e GTA 6 continua sem ficha para preencher o buraco.",
    },
    {
      pergunta: "Entrada serve para Quad HD?",
      resposta: "Não é a proposta desta faixa. Quad HD pede mais placa para o mesmo ajuste, nos jogos que você já roda. Se a tela nova é Quad HD, o pedido deixa de ser entrada e a conversa muda de faixa. Full HD é o casamento desta página.",
    },
  ],
  fontes: [
    ROCKSTARVI,
    YAHOOPC,
    STEAM,
    TAKETWO,
  ],
};

export default artigo;
