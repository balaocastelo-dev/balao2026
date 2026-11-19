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

const ROCKSTARDATA: Fonte = {
  nome: "Rockstar Games — “Grand Theft Auto VI is Now Set to Launch November 19, 2026”",
  url: "https://www.rockstargames.com/newswire/article/ak3ak31a49a221/grand-theft-auto-vi-is-now-set-to-launch-november-19-2026",
  data: "6 de novembro de 2025",
};

const artigo: Artigo = {
  slug: "pc-gamer-intermediario-para-gta-6",
  titulo: "PC gamer intermediário para mundo aberto e GTA 6",
  resumo: "A faixa intermediária é folga de VRAM e monitor Quad HD para os jogos de agora. GTA 6 ainda não tem versão de PC nem requisito.",
  categoria: "guias",
  etiquetas: [
    "GTA 6",
    "PC intermediário",
    "Quad HD",
    "VRAM",
  ],
  capa: {
    src: "/blog/capas/pc-gamer-intermediario-para-gta-6.webp",
    alt: "Gabinete branco aberto, com as ventoinhas à mostra.",
    largura: 1536,
    altura: 1024,
    pronta: false,
  },
  publicadoEm: "2026-11-11T15:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "PC intermediário para mundo aberto e GTA 6",
    palavrasChave: [
      "pc gamer intermediário",
      "pc intermediário para gta 6",
      "pc quad hd",
      "folga de vram",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "Mundo aberto em monitor Quad HD pede folga de memória de vídeo para os jogos que você já abre, não uma ficha de GTA 6. A faixa intermediária deste guia é essa combinação: placa com folga de VRAM e tela Quad HD. Ela organiza a compra de agora. Não substitui um requisito que a Rockstar não publicou.",
    },
    {
      tipo: "paragrafo",
      texto: "A [página oficial](https://www.rockstargames.com/VI), consultada em 19 de novembro de 2026, segue em PlayStation 5 e Xbox Series. A [reportagem do Yahoo](https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html), de 15 de novembro, olhou o site e um relatório da Take-Two e também não achou data de PC, pré-venda de computador nem lista de hardware. O console tem dia marcado. O computador ainda não entrou nessa lista.",
    },
    {
      tipo: "resumo",
      itens: [
        "**Intermediário, aqui, é Quad HD com folga de VRAM.** O critério são os jogos que você já roda.",
        "**A entrada permanece no Full HD.** Placa dedicada recente, 16 GB de RAM e SSD.",
        "**A Steam descreve o parque, não o jogo.** 16 GB e 8 GB de VRAM estão quase empatados.",
        "**Não existe configuração de GTA 6 para copiar.** Até 19 de novembro de 2026 não havia versão de PC.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que a faixa intermediária reúne",
    },
    {
      tipo: "paragrafo",
      texto: "Na prática, a faixa intermediária não é um rótulo solto no meio do catálogo. É a máquina de quem já usa, ou já decidiu usar, monitor Quad HD, e por isso precisa de placa com folga de memória de vídeo. A entrada, no mesmo critério, fica no Full HD, com placa dedicada recente, 16 GB de memória e SSD. Nenhuma das duas é a lista de GTA 6.",
    },
    {
      tipo: "paragrafo",
      texto: "Os 16 GB de RAM continuam o piso desta conversa, também na faixa do meio. O que muda em relação à entrada é a tela e a folga da placa, não um salto obrigatório para 32 GB. Esses 32 GB, o SSD mais rápido e a margem para capturar vídeo pertencem à faixa alta, no guia de [alto desempenho](/blog/pc-gamer-alto-desempenho-gta-6).",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/pc-gamer-intermediario-para-gta-6-faixas.webp",
        alt: "Displays da vitrine de entrada, com telas mostrando computadores.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Displays da vitrine de entrada, com telas mostrando computadores. Foto da loja, na Av. Anchieta, 789, Cambuí.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que a Steam mediu em setembro de 2026",
    },
    {
      tipo: "paragrafo",
      texto: "A [pesquisa de hardware da Steam](https://store.steampowered.com/hwsurvey/) de setembro de 2026 descreve o parque de quem joga na plataforma. Placas com 16 GB de VRAM aparecem em 27,21% dos computadores. As de 8 GB aparecem em 26,71%. As duas faixas estão próximas. Isso não elege uma delas como número de nenhum jogo que ainda não tem ficha.",
    },
    {
      tipo: "tabela",
      titulo: "Recortes da pesquisa da Steam em setembro de 2026",
      colunas: [
        "Recorte",
        "Participação",
        "O que a pesquisa pergunta",
      ],
      linhas: [
        [
          "16 GB de VRAM",
          "27,21%",
          "Memória da placa no parque",
        ],
        [
          "8 GB de VRAM",
          "26,71%",
          "Memória da placa no parque",
        ],
        [
          "Full HD",
          "47,91%",
          "Resolução principal da tela",
        ],
        [
          "Quad HD",
          "27,04%",
          "Resolução principal da tela",
        ],
      ],
      fonte: STEAM,
      nota: "VRAM e resolução são perguntas separadas. Nenhuma linha é requisito de GTA 6.",
    },
    {
      tipo: "paragrafo",
      texto: "Na mesma pesquisa, 47,91% usam Full HD como resolução principal e 27,04% usam Quad HD. O Full HD ainda é a maior fatia. O Quad HD já é grande o bastante para a faixa intermediária existir como escolha real. Os dois percentuais medem tela instalada. Não medem Grand Theft Auto VI, que nem tem versão de computador anunciada.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Resolução da pesquisa não é meta do jogo",
    },
    {
      tipo: "paragrafo",
      texto: "Ler 27,04% e concluir que a Rockstar vai mirar essa tela inverte a fonte. A Steam pergunta o que está ligado na casa de quem joga hoje. O estúdio, se publicar PC, escreve outra página, com mínimo e recomendado. Até 19 de novembro de 2026 essa página não existia. O desenho desta matéria só compara a VRAM do parque.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/pc-gamer-intermediario-para-gta-6-vram.webp",
        alt: "Placa de vídeo e processadores dispostos sobre a mesa.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Placa de vídeo e processadores dispostos sobre a mesa. Foto de Andrey Matveev (Pexels).",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Onde 8 GB e 16 GB mudam a conversa",
    },
    {
      tipo: "paragrafo",
      texto: "Folga de VRAM, na faixa intermediária, é margem para o Quad HD nos jogos que você já trata como pesados. O retrato do parque está no artigo da [pesquisa de setembro](/blog/steam-setembro-2026-vram-16gb). A diferença, dentro de uma mesma família, entre a versão de 8 GB e a de 16 GB está no texto da [RTX 5060 Ti](/blog/rtx-5060-ti-8gb-ou-16gb). Os dois textos ajudam a escolher peça para o uso atual.",
    },
    {
      tipo: "paragrafo",
      texto: "Eles não fecham GTA 6. Uma placa de 16 GB pode ser folga de verdade no seu monitor e ainda assim não ser o número que a Rockstar vai escrever. Uma de 8 GB pode bastar em Full HD, no critério da entrada, e apertar quando a tela sobe para Quad HD. O monitor que você tem decide antes da vontade de “estar preparado” para um jogo sem ficha.",
    },
    {
      tipo: "destaque",
      tom: "atencao",
      titulo: "Nenhuma faixa é a do GTA 6",
      texto: "Entrada, intermediária e alta organizam o computador pelos jogos e pela tela de hoje. As três esperam a página oficial. Nenhuma delas é requisito de Grand Theft Auto VI.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que essa faixa não afirma sobre o GTA 6",
    },
    {
      tipo: "paragrafo",
      texto: "Esta faixa não afirma modo alto, médio ou baixo de GTA 6 no computador, porque esse modo não foi anunciado. Também não traduz o console para peça de PC. O dia 19 de novembro de 2026 é o lançamento de PlayStation 5 e Xbox Series, fixado pela Rockstar. Se a sua meta é jogar nesse dia, o caminho publicado é o console, não esta faixa.",
    },
    {
      tipo: "paragrafo",
      texto: "Também não dá para copiar o espaço em disco do console e chamar isso de cota do seu SSD. O guia de [PC para GTA 6 sem requisito](/blog/pc-para-gta-6-sem-requisito-oficial) separa o que já dá para decidir. A série está em [GTA 6 no blog](/blog/gta-6). O disco da faixa intermediária tem de caber os jogos que você instala agora, com sobra para o sistema respirar.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Como ela fica entre a entrada e a alta",
    },
    {
      tipo: "paragrafo",
      texto: "A [faixa de entrada](/blog/pc-gamer-entrada-para-gta-6) atende Full HD com placa dedicada recente, 16 GB de RAM e SSD. Você sobe para a intermediária quando a tela é Quad HD e a placa precisa de folga de VRAM para acompanhar essa tela nos jogos de agora. Se a tela continua Full HD, a entrada não perde o sentido só porque existe uma faixa acima.",
    },
    {
      tipo: "paragrafo",
      texto: "A alta entra quando você quer placa forte, 32 GB, SSD rápido e margem para capturar vídeo enquanto joga. Isso é outro uso. Comprar a alta com monitor Full HD e sem captura desloca a máquina para uma folga que a sua rotina não pede. O critério é a tela e a tarefa, não o receio de um jogo que ainda não tem versão de PC.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/pc-gamer-intermediario-para-gta-6-fecho.webp",
        alt: "Prateleiras brancas com caixas de placa de vídeo, na parede vermelha da loja.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Prateleiras brancas com caixas de placa de vídeo, na parede vermelha da loja. Foto da loja, na Av. Anchieta, 789, Cambuí.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "A faixa do meio fica presa à tela Quad HD e à folga de VRAM, dois pontos que você consegue apontar",
        "A pesquisa da Steam entra como retrato do parque e sai da conversa antes de virar ficha de jogo",
        "Entrada e alta continuam visíveis, cada uma com o uso dela, sem uma quarta lista inventada para GTA 6",
      ],
      contras: [
        "Quando a Rockstar publicar números, esta faixa pode ficar curta ou larga demais para o jogo",
        "Quad HD com pouca memória de vídeo continua apertado, e o guia não escolhe o modelo da placa",
        "O valor da peça muda, então o texto não trava orçamento nem substitui a conversa do dia",
      ],
    },
    {
      tipo: "chamada",
      tema: "pc-gamer",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Pedir essa faixa no balcão",
    },
    {
      tipo: "paragrafo",
      texto: "Na Balão da Informática Anchieta, na Av. Anchieta, 789, no Cambuí, em Campinas, a faixa intermediária se monta em cima do seu monitor e dos jogos que você já abre. Você vê o computador ligado antes de pagar. Ninguém apresenta essa máquina como a configuração de GTA 6, porque essa lista não foi publicada pela Rockstar.",
    },
    {
      tipo: "paragrafo",
      texto: "O orçamento sai no WhatsApp (19) 98751-0267, ou no balcão, no dia em que você pergunta, porque o preço da peça muda. Leve a resolução do monitor e o nome dos jogos pesados que você mantém instalados. A equipe cruza isso com a folga de VRAM e devolve uma máquina para o uso de hoje.",
    },
    {
      tipo: "chamada",
      titulo: "Quer a faixa intermediária para o monitor que você tem?",
      texto: "Diga a resolução da tela e os jogos de hoje. A equipe monta nessa medida e mostra a máquina ligada antes do pagamento.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "PC intermediário roda GTA 6?",
      resposta: "Não há como afirmar isso. Até 19 de novembro de 2026 a Rockstar não tinha anunciado versão de PC nem requisito. A faixa intermediária deste guia é Quad HD com folga de VRAM para os jogos que você já roda, não uma ficha do jogo.",
    },
    {
      pergunta: "Quad HD pede 16 GB de VRAM?",
      resposta: "O guia não transforma 16 GB num mínimo universal. Em setembro de 2026 a Steam mostrava 16 GB em 27,21% dos PCs e 8 GB em 26,71%. No Quad HD, a folga de memória de vídeo pesa mais do que no Full HD. O modelo certo depende dos jogos que você abre hoje.",
    },
    {
      pergunta: "Posso ficar na faixa de entrada?",
      resposta: "Pode, se o seu monitor é Full HD e a placa dedicada recente, com 16 GB de RAM e SSD, dá conta dos jogos que você já joga. Subir de faixa sem mudar de tela não aproxima você de um requisito que não existe.",
    },
    {
      pergunta: "Os percentuais da Steam são o recomendado do jogo?",
      resposta: "Não. São a fatia de computadores na pesquisa de setembro de 2026. Full HD estava em 47,91% e Quad HD em 27,04%, como resolução principal. Isso descreve o parque. Não descreve GTA 6.",
    },
  ],
  fontes: [
    ROCKSTARVI,
    YAHOOPC,
    STEAM,
    ROCKSTARDATA,
  ],
};

export default artigo;
