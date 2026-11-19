import type { Artigo, Fonte } from "@/lib/blog/tipos";

const ROCKSTARVI: Fonte = {
  nome: "Rockstar Games — página oficial de Grand Theft Auto VI",
  url: "https://www.rockstargames.com/VI",
  data: "consulta em 19 de novembro de 2026",
};

const PLAYSTATION: Fonte = {
  nome: "PlayStation — página de Grand Theft Auto VI",
  url: "https://www.playstation.com/en-us/games/grand-theft-auto-vi/",
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

const TAKETWO: Fonte = {
  nome: "Take-Two Interactive — comunicado de pré-venda de Grand Theft Auto VI",
  url: "https://taketwointeractivesoftwareinc.gcs-web.com/news-releases/news-release-details/rockstar-games-announces-pre-orders-grand-theft-auto-vi/",
  data: "24 de junho de 2026",
};

const PSSUPORTE: Fonte = {
  nome: "PlayStation — suporte de Grand Theft Auto VI",
  url: "https://www.playstation.com/en-us/support/games/gta-vi-support/",
  data: "consulta em 19 de novembro de 2026",
};

const artigo: Artigo = {
  slug: "gta-6-plataformas-ps5-xbox-e-pc",
  titulo: "GTA 6 no PS5 e no Xbox Series: e o PC, foi anunciado?",
  resumo: "No lançamento, GTA 6 está no PS5 e no Xbox Series. O PC não foi anunciado até 19 de novembro de 2026. Veja o que cada aparelho faz.",
  categoria: "noticias",
  etiquetas: [
    "GTA 6",
    "PS5",
    "Xbox",
    "PC",
  ],
  capa: {
    src: "/blog/capas/gta-6-plataformas-ps5-xbox-e-pc.webp",
    alt: "Capa com o selo de quatro casos e o título sobre PS5, Xbox Series e a ausência de anúncio de PC",
    largura: 1536,
    altura: 1024,
    pronta: true,
  },
  publicadoEm: "2026-11-17T15:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "GTA 6 no PS5 e no Xbox: e o PC foi anunciado?",
    palavrasChave: [
      "gta 6 ps5",
      "gta 6 xbox",
      "gta 6 pc",
      "gta 6 plataformas",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "A pergunta de balcão, nesta semana, é se o computador que a pessoa já tem roda GTA 6 no dia do lançamento. A página do jogo não lista PC. Lista PlayStation 5 e Xbox Series X|S.",
    },
    {
      tipo: "paragrafo",
      texto: "Até 19 de novembro de 2026 a Rockstar não anunciou versão de computador, pré-venda de PC nem requisito. Dá para jogar no dia 19 num PS5 ou num Xbox Series. Nos outros aparelhos, ou não roda, ou só existe um caminho de nuvem com letra miúda.",
    },
    {
      tipo: "resumo",
      itens: [
        "**PS5, PS5 Pro e Xbox Series são o lançamento.** É o que a Rockstar e a Take-Two publicaram.",
        "**PS4 fica de fora.** A PlayStation diz isso na pergunta frequente, sem ambiguidade.",
        "**Xbox One entra só pela nuvem.** O Xbox Wire avisa que o gráfico é o do Series S e que o jogo se compra à parte.",
        "**PC não está na lista.** Relato de imprensa não substitui a página da Rockstar.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que a página oficial coloca no dia 19",
    },
    {
      tipo: "paragrafo",
      texto: "A [página da Rockstar](https://www.rockstargames.com/VI) mostra dois selos: PlayStation 5 e Xbox Series X|S, e diz que o jogo rende melhor no PS5. A [Take-Two](https://taketwointeractivesoftwareinc.gcs-web.com/news-releases/news-release-details/rockstar-games-announces-pre-orders-grand-theft-auto-vi/) repete essas plataformas no comunicado de pré-venda. Não há uma terceira coluna para Windows.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-6-plataformas-ps5-xbox-e-pc-aparelhos.webp",
        alt: "Cartões comparando PS5, Xbox Series, Xbox One via nuvem e PC sem anúncio oficial",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Nuvem não é a versão de console rodando no aparelho. PC sem data não é versão atrasada confirmada.",
    },
    {
      tipo: "paragrafo",
      texto: "No ecossistema da Sony, a [página do jogo](https://www.playstation.com/en-us/games/grand-theft-auto-vi/) marca PS5 e PS5 Pro. O Pro ganha clareza extra pelo PSSR, a reconstrução de imagem da Sony, e sombra com ray tracing, desde que a tela seja compatível. O mesmo texto diz que o DualSense usa vibração e gatilho adaptativo. Nada disso aparece como promessa de PC, porque o PC não está nessa página.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "PlayStation 4 e Xbox One não são o mesmo “não”",
    },
    {
      tipo: "paragrafo",
      texto: "No PS4 a resposta é fechada: a PlayStation escreve que o jogo só roda em consoles PlayStation 5. Não há modo de compatibilidade anunciado, nem versão reduzida.",
    },
    {
      tipo: "paragrafo",
      texto: "No Xbox One a resposta é outra, e está no [Xbox Wire de 10 de novembro de 2026](https://news.xbox.com/en-us/2026/11/10/grand-theft-auto-6-comes-to-xbox-cloud-gaming-november-19/). O jogo pode ser transmitido pela nuvem nesse console, com os gráficos do Xbox Series S, a partir da 1h da manhã no horário do Leste dos Estados Unidos no dia 19. Não é o jogo instalado no Xbox One. A compra do jogo é separada, e a disponibilidade da nuvem muda por país e por aparelho. Quem está no Brasil precisa checar a loja da Microsoft da própria conta, em vez de assumir que o anúncio americano vale aqui.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-6-plataformas-ps5-xbox-e-pc-nativo.webp",
        alt: "Colunas separando jogo instalado no console e jogo transmitido pela nuvem",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Quem tem Xbox One não instala o jogo: transmite. A diferença importa na hora de escolher o aparelho.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Series S não é Series X com outro nome",
    },
    {
      tipo: "paragrafo",
      texto: "Os dois estão no lançamento nativo. O Xbox Wire trata o Series X como a experiência de console mais alta da marca e o Series S como o caminho nativo mais barato. Quando o jogo é só nuvem, inclusive num Series, o gráfico informado é o do Series S. São três experiências, não uma.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O PC ficou de fora do comunicado",
    },
    {
      tipo: "paragrafo",
      texto: "Em 15 de novembro de 2026, uma [reportagem do Just Jared republicada no Yahoo](https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html) conferiu o site oficial e um relatório da Take-Two: as plataformas do dia 19 continuavam sendo PS5 e Xbox Series, sem data de PC, sem pré-venda de PC e sem requisito. A mesma reportagem lembra o intervalo histórico de GTA V e de Red Dead Redemption 2, que chegaram ao computador depois do console. Isso é precedente, não calendário de GTA 6.",
    },
    {
      tipo: "destaque",
      tom: "atencao",
      titulo: "Relato não é data",
      texto: "Há matéria citando fontes anônimas sobre um PC no começo de 2027. A Rockstar não confirmou. Tratar essa janela como plano de compra é decidir em cima de um boato.",
    },
    {
      tipo: "paragrafo",
      texto: "O histórico, como essa reportagem resume, é de espera: GTA V saiu em console em setembro de 2013 e no PC em abril de 2015; Red Dead Redemption 2 saiu em console em outubro de 2018 e no PC em novembro de 2019. O intervalo mudou de um jogo para o outro. Não serve para marcar o mês de GTA 6 no computador.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que fazer com o computador enquanto isso",
    },
    {
      tipo: "paragrafo",
      texto: "Se a meta é jogar no dia 19, o aparelho da lista oficial é um console da geração atual, não um upgrade de placa feito no escuro. Se a meta é estar pronto para uma versão de PC que ainda não existe, o caminho é outro e está no guia de [PC para GTA 6](/blog/pc-para-gta-6-sem-requisito-oficial): montar para os jogos de agora, com folga, e esperar a ficha.",
    },
    {
      tipo: "paragrafo",
      texto: "A [data de lançamento](/blog/gta-6-lancamento-19-novembro-2026) e a [série completa](/blog/gta-6) fecham o contexto. Plataforma é a primeira pergunta. Requisito de PC é uma pergunta que a Rockstar ainda não abriu.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-6-plataformas-ps5-xbox-e-pc-fecho.webp",
        alt: "Quatro caminhos de aparelho no dia 19: PS5 nativo, Xbox Series nativo, Xbox One só na nuvem e PC sem anúncio",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "PS4 fica de fora. A nuvem do Xbox One não é o jogo instalado, e o PC não está na lista.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "Dá para saber, com fonte, em qual aparelho o jogo existe no dia 19",
        "PS4 e Xbox One deixam de ser tratados como se fossem a mesma limitação",
        "O PC sai da lista de compra de lançamento sem virar promessa de que nunca virá",
      ],
      contras: [
        "A nuvem do Xbox depende de país, conta e compra à parte",
        "Um anúncio de PC pode surgir depois desta matéria",
        "Quem só tem PC não joga no dia 19 com o que foi publicado até agora",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Antes de trocar de aparelho",
    },
    {
      tipo: "paragrafo",
      texto: "Na Balão da Informática Anchieta, Av. Anchieta, 789, Cambuí, Campinas, a equipe não vende console no lugar de uma conversa sobre o PC que você já tem. Se o uso é jogo de computador hoje, o papo é a [montagem](/montagempc) para esses jogos. GTA 6 no dia 19 não entra nessa conta enquanto a versão de PC não existir.",
    },
    {
      tipo: "paragrafo",
      texto: "Chame no WhatsApp (19) 98751-0267 e diga qual aparelho você tem. A resposta honesta pode ser “esse PC não é o caminho do dia 19”. Escolha o aparelho pela lista oficial, não pelo desejo de que o PC já esteja nela.",
    },
    {
      tipo: "chamada",
      titulo: "Seu PC é para os jogos de agora ou para o dia 19?",
      texto: "Conte o que você joga hoje. Se a meta for GTA 6 no lançamento, a conversa começa pela lista de consoles, não por uma placa sem requisito.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "GTA 6 roda no PS4 ou no Xbox One?",
      resposta: "No PS4, não: a PlayStation diz que só os consoles PlayStation 5 rodam o jogo. No Xbox One, o Xbox Wire anuncia transmissão pela nuvem, não uma versão instalada, com gráfico de Series S e compra do jogo à parte.",
    },
    {
      pergunta: "O PS5 Pro muda alguma coisa?",
      resposta: "A página da PlayStation diz que no PS5 Pro o jogo usa PSSR e sombra com ray tracing, em tela compatível. Continua sendo a mesma versão de PS5, com um modo de imagem mais alto.",
    },
    {
      pergunta: "Vai ter GTA 6 no Steam no lançamento?",
      resposta: "Até 19 de novembro de 2026 não havia pré-venda de PC em loja nenhuma anunciada pela Rockstar, inclusive Steam. O comunicado da Take-Two cita PlayStation Store, Microsoft Store e Rockstar Games Store para o jogo de console.",
    },
    {
      pergunta: "Posso ir montando o PC com a configuração do PS5?",
      resposta: "Não há equivalência publicada. O console não informa a peça de PC correspondente, e a Rockstar não publicou requisito de computador. Montar “no olho” é chute.",
    },
  ],
  fontes: [
    ROCKSTARVI,
    PLAYSTATION,
    XBOX,
    YAHOOPC,
    TAKETWO,
    PSSUPORTE,
  ],
};

export default artigo;
