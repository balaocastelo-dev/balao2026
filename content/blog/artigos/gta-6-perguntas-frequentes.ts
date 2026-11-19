import type { Artigo, Fonte } from "@/lib/blog/tipos";

const ROCKSTARVI: Fonte = {
  nome: "Rockstar Games — página oficial de Grand Theft Auto VI",
  url: "https://www.rockstargames.com/VI",
  data: "consulta em 19 de novembro de 2026",
};

const ROCKSTARDATA: Fonte = {
  nome: "Rockstar Games — “Grand Theft Auto VI is Now Set to Launch November 19, 2026”",
  url: "https://www.rockstargames.com/newswire/article/ak3ak31a49a221/grand-theft-auto-vi-is-now-set-to-launch-november-19-2026",
  data: "6 de novembro de 2025",
};

const TAKETWO: Fonte = {
  nome: "Take-Two Interactive — comunicado de pré-venda de Grand Theft Auto VI",
  url: "https://taketwointeractivesoftwareinc.gcs-web.com/news-releases/news-release-details/rockstar-games-announces-pre-orders-grand-theft-auto-vi/",
  data: "24 de junho de 2026",
};

const PLAYSTATION: Fonte = {
  nome: "PlayStation — página de Grand Theft Auto VI",
  url: "https://www.playstation.com/en-us/games/grand-theft-auto-vi/",
  data: "consulta em 19 de novembro de 2026",
};

const PSSUPORTE: Fonte = {
  nome: "PlayStation — suporte de Grand Theft Auto VI",
  url: "https://www.playstation.com/en-us/support/games/gta-vi-support/",
  data: "consulta em 19 de novembro de 2026",
};

const XBOX: Fonte = {
  nome: "Xbox Wire — Grand Theft Auto VI no Xbox Cloud Gaming",
  url: "https://news.xbox.com/en-us/2026/11/10/grand-theft-auto-6-comes-to-xbox-cloud-gaming-november-19/",
  data: "10 de novembro de 2026",
};

const YAHOOPC: Fonte = {
  nome: "Yahoo / Just Jared — “GTA 6 PC Release Date: Is Grand Theft Auto VI Coming to PC?”",
  url: "https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html",
  data: "15 de novembro de 2026",
};

const POLYGON: Fonte = {
  nome: "Polygon — “GTA 6 Sets PC Release Date, New Report Says”",
  url: "https://www.polygon.com/gta-6-pc-release-q1-2027-rumor/",
  data: "2026",
};

const VERGEATRASO: Fonte = {
  nome: "The Verge — “Grand Theft Auto VI launch delayed until November 2026”, Jay Peters",
  url: "https://www.theverge.com/news/816005/grand-theft-auto-vi-gta-g-delayed-november-2026",
  data: "6 de novembro de 2025",
};

const REUTERS: Fonte = {
  nome: "Reuters — “Take-Two delays GTA VI for second time to November next year”",
  url: "https://www.reuters.com/business/media-telecom/take-two-interactive-further-delays-gta-vi-november-next-year-2025-11-06/",
  data: "6 de novembro de 2025",
};

const artigo: Artigo = {
  slug: "gta-6-perguntas-frequentes",
  titulo: "GTA 6: perguntas frequentes com o que já foi anunciado",
  resumo: "As dúvidas de GTA 6 abaixo usam só o que já foi anunciado, com o link da matéria. O que ainda não tem página fica marcado como em aberto.",
  categoria: "noticias",
  etiquetas: [
    "GTA 6",
    "Dúvidas",
    "Lançamento",
  ],
  capa: {
    src: "/blog/capas/gta-6-perguntas-frequentes.webp",
    alt: "Capa de perguntas frequentes de GTA 6 dividindo o que já foi anunciado e o que segue sem comunicado",
    largura: 1536,
    altura: 1024,
    pronta: true,
  },
  publicadoEm: "2026-11-14T15:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "GTA 6: perguntas frequentes do que foi anunciado",
    palavrasChave: [
      "perguntas gta 6",
      "dúvidas gta 6",
      "gta 6 vai ter pc",
      "gta 6 idioma",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "Quem chega com uma dúvida de GTA 6 quase sempre mistura data antiga, preço convertido e boato de PC. Esta página separa o que já tem comunicado do que ainda não tem, e manda cada tema para a matéria que cita a fonte. Não completa lacuna com fórum. Se a célula diz “em aberto”, a página oficial ainda não escreveu a resposta.",
    },
    {
      tipo: "paragrafo",
      texto: "A data de console é 19 de novembro de 2026, no PS5 e no Xbox Series X|S. O preço anunciado é 79,99 dólares na Standard e 99,99 dólares na Ultimate. A pré-carga falada em novembro de 2026 é 10 de novembro. O PC, o valor em reais e o requisito de computador não estão nesses comunicados. O mapa abaixo é o índice. O parágrafo de cada tema diz o limite.",
    },
    {
      tipo: "resumo",
      itens: [
        "**Console em 19 de novembro de 2026.** PS5, PS5 Pro e Xbox Series. PC sem anúncio até essa data.",
        "**Preço só em dólares.** 79,99 e 99,99. Reais não estão no comunicado.",
        "**Pré-carga em 10 de novembro.** No PS5, pelo menos 212 GB. A caixa traz código, sem disco.",
        "**O que não tem página continua em aberto.** Mapa completo, voz em português e requisito de PC.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Data, consoles e o PC",
    },
    {
      tipo: "paragrafo",
      texto: "A Rockstar fixou o lançamento de console para 19 de novembro de 2026. Antes houve uma janela em 2025 e, depois, 26 de maio de 2026. A Reuters e a The Verge registraram a troca em 6 de novembro de 2025. Quando um guia ainda diz maio, ele descreve uma promessa substituída. O passo a passo está na matéria do [lançamento](/blog/gta-6-lancamento-19-novembro-2026).",
    },
    {
      tipo: "paragrafo",
      texto: "No dia 19, o jogo está no PS5, no PS5 Pro e no Xbox Series X e S. Não roda no PS4. No Pro, a PlayStation cita PSSR e ray tracing de sombra. No Xbox One há caminho de nuvem, com gráfico de Series S, jogo comprado à parte e disponibilidade que varia por país. O detalhe de cada aparelho está em [plataformas](/blog/gta-6-plataformas-ps5-xbox-e-pc).",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-6-perguntas-frequentes-aberto.webp",
        alt: "Duas colunas com o que já foi anunciado de GTA 6 e o que ainda não tem comunicado oficial",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "A coluna em aberto não é palpite. É pergunta que essas páginas ainda não responderam.",
    },
    {
      tipo: "paragrafo",
      texto: "PC não foi anunciado até 19 de novembro de 2026. Em 15 de novembro, uma checagem do Just Jared republicada no [Yahoo](https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html) ainda não achou data, pré-venda nem requisito. A página da Rockstar, até essa data, segue sem versão de computador.",
    },
    {
      tipo: "paragrafo",
      texto: "O [Polygon](https://www.polygon.com/gta-6-pc-release-q1-2027-rumor/) relata um boato de PC no começo de 2027, sem confirmação da Rockstar. O histórico citado nessa reportagem é de jogos anteriores: GTA V em console em setembro de 2013 e no PC em abril de 2015, e Red Dead Redemption 2 em console em outubro de 2018 e no PC em novembro de 2019. Precedente, não calendário.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Preço, idioma e classificação",
    },
    {
      tipo: "paragrafo",
      texto: "A Take-Two, em 24 de junho de 2026, anunciou a Standard a 79,99 dólares e a Ultimate a 99,99 dólares. A pré-venda digital inclui um mês de GTA+, e compras antes de 20 de novembro de 2026 incluem o Vintage Vice City Pack. O valor em reais não está no comunicado. Conta, pacote e o que não vem escrito estão na matéria de [preço e edições](/blog/gta-6-preco-e-edicoes).",
    },
    {
      tipo: "paragrafo",
      texto: "No idioma, a PlayStation anuncia inglês com voz e texto, e português do Brasil só com texto, sem voz. As classificações indicadas nessa página são ESRB M e PEGI 18. Não há, nestes textos, uma classificação brasileira para copiar. O jogo é anunciado como campanha solo. Um modo online no lançamento não está nessa resposta.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Pré-carga, tamanho e a caixa",
    },
    {
      tipo: "paragrafo",
      texto: "A pré-carga que a PlayStation e a Rockstar falam em novembro de 2026 é 10 de novembro, à meia-noite no fuso de quem joga. O comunicado de junho tinha citado 12 de novembro. No espaço, a PlayStation fala em pelo menos 212 GB no PS5. A The Verge fala num arquivo de até 212 GB, conforme o aparelho. São duas frases, não um tamanho único.",
    },
    {
      tipo: "paragrafo",
      texto: "A caixa física traz código, não disco. Comprar a caixa não dispensa o download nem o espaço. O Xbox Wire de 10 de novembro de 2026 descreve versão nativa no Series e nuvem, sem um número de gigabytes neste conjunto de fatos. A conta inteira, com a tabela das fontes, está na matéria de [pré-carga](/blog/gta-6-pre-carga-e-tamanho).",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-6-perguntas-frequentes-rota.webp",
        alt: "Fluxo com quatro passos para achar a matéria de data, preço, pré-carga e nomes de GTA 6",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "A tabela desta página resume. O link leva ao texto que cita a página oficial.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "O que a tabela não fecha sozinha",
    },
    {
      tipo: "tabela",
      titulo: "Anunciado e ainda sem comunicado",
      colunas: [
        "Tema",
        "Anunciado",
        "Sem comunicado",
      ],
      linhas: [
        [
          "Data de console",
          "19 de novembro de 2026",
          "Versão de PC",
        ],
        [
          "Aparelhos",
          "PS5, PS5 Pro, Xbox Series",
          "PS4 não roda",
        ],
        [
          "Preço",
          "79,99 e 99,99 dólares",
          "Valor em reais",
        ],
        [
          "Idioma",
          "Inglês com voz; português só texto",
          "Voz em português",
        ],
        [
          "Pré-carga",
          "10 de novembro de 2026",
          "A cita de junho, 12 de novembro",
        ],
        [
          "Espaço no PS5",
          "Pelo menos 212 GB",
          "Requisito de computador",
        ],
        [
          "Lugar",
          "Leonida e nomes na Ultimate",
          "Mapa completo",
        ],
      ],
      colunaDestaque: 1,
      nota: "Cada linha tem matéria própria nesta série. O espaço “até 212 GB, conforme o aparelho” é frase da The Verge, separada do mínimo da PlayStation.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Personagens, lugar e vídeos",
    },
    {
      tipo: "paragrafo",
      texto: "O texto oficial chama os dois de Jason e Lucia. Os sobrenomes Jason Duval e Lucia Caminos estão na The Verge de 6 de novembro de 2025, não como frase da sinopse. A sinopse fala num golpe fácil que dá errado e numa conspiração no estado de Leonida. Idade e ofício não entram. O texto está em [Lucia e Jason](/blog/gta-6-lucia-e-jason).",
    },
    {
      tipo: "paragrafo",
      texto: "Os lugares que dá para citar são Leonida, na sinopse, e sete nomes na descrição da Ultimate: Mount Kalaga, Lake Leonida, Washington Beach, Gambit Bay, Watson Bay, Stockyard e Vercetti Estate. Não são um atlas. Vice City aparece no nome do pacote de pré-venda. A matéria do [mapa](/blog/gta-6-mapa-leonida-e-vice-city) mantém cada nome na fonte dele. Os cinco vídeos datados estão em [trailers](/blog/gta-6-trailers-oficiais).",
    },
    {
      tipo: "destaque",
      tom: "nota",
      titulo: "Comunicado mais novo ganha do antigo",
      texto: "Maio de 2026 deixou de ser a data de lançamento em novembro de 2025. A pré-carga citada como 12 de novembro no comunicado de junho foi depois falada como 10 de novembro. Quando duas datas circulam, fique com a página mais nova.",
    },
    {
      tipo: "paragrafo",
      texto: "A série inteira, com o que já foi publicado e o que continua em aberto, está em [GTA 6 no blog](/blog/gta-6). Dúvida de peça, enquanto não houver requisito de PC, não se resolve nesta tabela. O guia de [PC para GTA 6](/blog/pc-para-gta-6-sem-requisito-oficial) explica o que dá para decidir sem essa ficha. Esta página não acrescenta número que a Rockstar não tenha escrito.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-6-perguntas-frequentes-fecho.webp",
        alt: "Quatro respostas curtas de GTA 6: data de console, PC sem anúncio, preço em dólares e campanha solo",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Cada cartão aponta para um fato publicado. O que não está aqui continua sem comunicado.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "Cada tema aponta para a matéria que carrega a fonte, em vez de repetir o comunicado inteiro",
        "O que não foi anunciado fica na coluna em aberto, sem completar com boato",
        "Data de lançamento e data de pré-carga usam a página mais nova quando houve troca",
      ],
      contras: [
        "Uma página nova da Rockstar pode mudar uma linha depois desta matéria",
        "O relato de PC no começo de 2027 segue sem confirmação",
        "Preço em reais, mapa completo e requisito de computador continuam fora do anúncio",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Se a pergunta que sobrou é sobre o computador",
    },
    {
      tipo: "paragrafo",
      texto: "Dúvida que a página oficial não responde também não vira palpite de balcão. Na Balão da Informática Anchieta, Av. Anchieta, 789, Cambuí, Campinas, a equipe olha o computador que você já tem e mostra a máquina ligada. GTA 6 sem versão de PC fica fora dessa configuração.",
    },
    {
      tipo: "paragrafo",
      texto: "O WhatsApp é (19) 98751-0267. Para a máquina de agora, o caminho é a página de [PC gamer](/pcgamer). As linhas em aberto desta tabela continuam em aberto até um comunicado novo. Você decide pelo uso de hoje, com o equipamento funcionando na sua frente.",
    },
    {
      tipo: "chamada",
      titulo: "A lista em aberto não vira configuração.",
      texto: "Mande o que você joga hoje. Enquanto não houver versão de PC, a conversa fica nesse uso, com a máquina ligada.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "GTA 6 vai ter versão de PC no lançamento?",
      resposta: "Até 19 de novembro de 2026, não havia versão de PC anunciada, nem pré-venda, nem requisito. O que está marcado para essa data é o jogo de PS5 e Xbox Series. Relato de início de 2027 não é calendário.",
    },
    {
      pergunta: "Qual é o preço de GTA 6 em reais?",
      resposta: "O comunicado da Take-Two não traz valor em reais. Os preços anunciados são 79,99 dólares na Standard e 99,99 dólares na Ultimate. Conversão de câmbio não é preço oficial.",
    },
    {
      pergunta: "GTA 6 tem dublagem em português?",
      resposta: "Não na forma anunciada. Inglês tem voz e texto. Português do Brasil tem texto, sem voz. É o que a página da PlayStation informa.",
    },
    {
      pergunta: "Qual é o tamanho da pré-carga de GTA 6?",
      resposta: "A PlayStation fala em pelo menos 212 GB no PS5. A The Verge fala em até 212 GB, conforme o aparelho. Não são a mesma frase, e a caixa física traz código, sem disco.",
    },
  ],
  fontes: [
    ROCKSTARVI,
    ROCKSTARDATA,
    TAKETWO,
    PLAYSTATION,
    PSSUPORTE,
    XBOX,
    YAHOOPC,
    POLYGON,
    VERGEATRASO,
    REUTERS,
  ],
};

export default artigo;
