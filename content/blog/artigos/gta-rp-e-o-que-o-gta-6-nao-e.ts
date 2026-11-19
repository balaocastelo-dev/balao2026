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

const PLAYSTATION: Fonte = {
  nome: "PlayStation — página de Grand Theft Auto VI",
  url: "https://www.playstation.com/en-us/games/grand-theft-auto-vi/",
  data: "consulta em 19 de novembro de 2026",
};

const OBS: Fonte = {
  nome: "OBS Project — OBS Studio",
  url: "https://obsproject.com/",
  data: "consulta em 19 de novembro de 2026",
};

const artigo: Artigo = {
  slug: "gta-rp-e-o-que-o-gta-6-nao-e",
  titulo: "GTA RP e GTA 6: o que o PC precisa e o que não existe",
  resumo: "GTA RP hoje é cena de GTA V, inclusive FiveM, não um modo de GTA 6. O PC precisa rodar esse jogo e ainda sobrar processador para a voz.",
  categoria: "guias",
  etiquetas: [
    "GTA 6",
    "GTA RP",
    "PC",
  ],
  capa: {
    src: "/blog/capas/gta-rp-e-o-que-o-gta-6-nao-e.webp",
    alt: "Pessoa de fone jogando no sofá, à noite.",
    largura: 1536,
    altura: 1024,
    pronta: false,
  },
  publicadoEm: "2026-11-07T18:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "GTA RP e GTA 6: o que existe e o que não",
    palavrasChave: [
      "gta rp",
      "gta rp e gta 6",
      "pc para gta rp",
      "fivem e gta 6",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "Quando alguém pede um PC para GTA RP, quase sempre fala do jogo que já existe no computador: GTA V, na cena da comunidade. O nome que mais aparece nessa cena é FiveM. Isso não é um modo oficial de GTA 6, nem um recurso do lançamento de console. Tratar os dois como o mesmo produto faz você montar máquina para um anúncio que não saiu.",
    },
    {
      tipo: "paragrafo",
      texto: "O que o computador precisa, em termos gerais, cabe numa frase. Ele tem de rodar o GTA V e ainda sobrar processador para a voz, no programa de captura ou no papo da live. Se a partida sozinha ocupa a máquina inteira, o RP e a transmissão disputam um processador sem resto. Não há, nesta página, uma lista de peça copiada de GTA 6.",
    },
    {
      tipo: "resumo",
      itens: [
        "**GTA RP de hoje é GTA V.** A cena é da comunidade, e FiveM é o nome mais citado.",
        "**Não é modo oficial de GTA 6.** A PlayStation descreve o lançamento como um jogador.",
        "**O PC roda o GTA V e sobra voz.** Sem resto de processador, a fala não cabe.",
        "**Esta página não ensina servidor.** Nem instalação de mod, nem jeito de burlar o jogo.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O RP que existe hoje é de GTA V",
    },
    {
      tipo: "paragrafo",
      texto: "GTA RP, do jeito que a busca usa o termo, é interpretação numa cidade da comunidade, em cima de GTA V. As regras, os personagens e o servidor são dessa cena, não de um menu oficial de GTA 6. FiveM é parte desse universo de GTA V. Citar o nome serve para você reconhecer a conversa. Não serve para instalar nada a partir daqui.",
    },
    {
      tipo: "paragrafo",
      texto: "Você entra com o GTA V que já joga no PC, mais a voz, mais o que a comunidade daquela cidade pede na porta dela. Este blog não reproduz esse pedido e não indica download. Se o computador não abre o GTA V de forma estável, a conversa de RP ainda não começou. A live, se você transmitir, é uma camada a mais, não um atalho para ignorar o jogo.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-rp-e-o-que-o-gta-6-nao-e-existe.webp",
        alt: "Console e controle brancos sobre uma superfície reflexiva.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Console e controle brancos sobre uma superfície reflexiva. Foto de Imthiyaz Syed (Pexels).",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que a página de GTA 6 não promete",
    },
    {
      tipo: "paragrafo",
      texto: "A [página da Rockstar](https://www.rockstargames.com/VI) lista PlayStation 5 e Xbox Series. Até 19 de novembro de 2026 não havia versão de computador nessa página. A checagem de 15 de novembro republicada no [Yahoo](https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html) também não encontrou data de PC, pré-venda de PC nem requisito. Sem essa versão, não existe RP de GTA 6 para o qual você possa separar peça.",
    },
    {
      tipo: "paragrafo",
      texto: "A [PlayStation](https://www.playstation.com/en-us/games/grand-theft-auto-vi/) descreve Grand Theft Auto VI como experiência de um jogador. Um modo de interpretação no lançamento não está nessa descrição. O dia 19 de novembro de 2026 é data de console, para a campanha solo anunciada. Quem espera um servidor oficial de RP nesse dia está lendo um desejo, não o texto da página. O índice dos anúncios está em [GTA 6 no blog](/blog/gta-6).",
    },
    {
      tipo: "tabela",
      titulo: "GTA RP de hoje e GTA 6 anunciado",
      colunas: [
        "Pergunta",
        "O que existe",
        "O que não foi anunciado",
      ],
      linhas: [
        [
          "Qual jogo",
          "GTA V no PC",
          "GTA 6 de computador",
        ],
        [
          "Quem sustenta o RP",
          "A comunidade, inclusive FiveM",
          "Um modo oficial de GTA 6",
        ],
        [
          "O lançamento de 19 nov 2026",
          "PS5 e Xbox Series",
          "RP no dia do console",
        ],
        [
          "O que a máquina faz",
          "Roda GTA V e sobra voz",
          "Requisito publicado de GTA 6",
        ],
      ],
      fonte: PLAYSTATION,
      nota: "A coluna do anúncio usa a página da PlayStation e a página da Rockstar, consultadas até 19 de novembro de 2026. FiveM é nome da cena de GTA V, não instrução de instalação.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Por que o passo a passo fica de fora",
    },
    {
      tipo: "paragrafo",
      texto: "Três pedidos não entram neste texto. Não ensinamos a instalar mod, não ensinamos a burlar a proteção do jogo e não ensinamos a montar servidor. São procedimentos que mudam, que podem quebrar a instalação e que não cabem num guia de loja. O limite é de propósito. Você sai daqui sabendo o que o PC precisa em termos gerais, não com uma receita de cidade particular.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que o seu PC precisa, em termos gerais",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-rp-e-o-que-o-gta-6-nao-e-maquina.webp",
        alt: "Pessoa de headset numa mesa de jogo com neon.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Pessoa de headset numa mesa de jogo com neon. Foto de Matheus Bertelli (Pexels).",
    },
    {
      tipo: "paragrafo",
      texto: "A primeira condição é rodar o GTA V: o jogo abre, permanece jogável e não toma o computador inteiro a ponto de a voz falhar. A segunda é sobrar processador para essa voz. Na live, a fala pode estar no programa de captura e no papo ao mesmo tempo. Sem resto, a frase corta enquanto a cidade ainda se move na sua tela.",
    },
    {
      tipo: "paragrafo",
      texto: "Não há número de peça nesta página, de propósito. O que o GTA V pede varia com a cena que você frequenta, e o requisito de GTA 6 não foi publicado. Copiar uma lista de fórum e chamar isso de ficha oficial é o erro que o guia de [PC para GTA 6 sem requisito](/blog/pc-para-gta-6-sem-requisito-oficial) existe para evitar. A máquina honesta aguenta o jogo de hoje com voz.",
    },
    {
      tipo: "destaque",
      tom: "atencao",
      titulo: "FiveM não é GTA 6",
      texto: "FiveM nomeia a cena de comunidade em GTA V. GTA 6, até 19 de novembro de 2026, não tinha versão de PC nem um modo de RP no texto da PlayStation. São assuntos diferentes, em jogos diferentes.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Transmitir essa cena e ainda ter voz",
    },
    {
      tipo: "paragrafo",
      texto: "Se você vai mostrar o RP, a captura entra como terceira carga: jogo, voz e programa. O OBS Studio, gratuito em [obsproject.com](https://obsproject.com/), organiza isso em cenas e fontes. O codificador fica na placa quando ela tem um, e no processador quando não tem. O programa está em [OBS para live de jogo](/blog/obs-para-live-de-jogo), e o canto físico está no [setup de streamer](/blog/setup-de-streamer-para-gta-6).",
    },
    {
      tipo: "paragrafo",
      texto: "Transmitir RP mostra a sessão para quem chegar. Não produz plateia nem pagamento. Se a voz não se entende, a cidade mais caprichada continua opaca. Acerte jogo estável e frase inteligível antes de overlay. O guia de [PC para live de GTA 6](/blog/pc-para-live-de-gta-6) trata a folga dessa transmissão sem fingir que a ficha do jogo novo já saiu.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Escolher a máquina pelo jogo que existe",
    },
    {
      tipo: "paragrafo",
      texto: "A escolha prática é o computador que roda o que você já abre, com resto para a voz. GTA 6 fica de fora até haver versão de PC e requisito. Montar um PC de RP de GTA 6 hoje é dar nome de lançamento a uma cena de GTA V. A página de [PC gamer](/pcgamer) aponta essa máquina.",
    },
    {
      tipo: "paragrafo",
      texto: "Se o GTA V já roda e a voz já cabe, você não precisa de outra máquina só porque GTA 6 teve data de console. Data de console não é data de PC. Se o jogo não deixa espaço para você falar, o próximo passo é essa folga, em termos gerais, e não um tutorial de servidor. Mod e burla continuam fora desta página.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-rp-e-o-que-o-gta-6-nao-e-fecho.webp",
        alt: "Balão inflável branco e vermelho na calçada da loja.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Balão inflável branco e vermelho na calçada da loja. Foto da loja, na Av. Anchieta, 789, Cambuí.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "Fica claro que o RP de hoje é cena de GTA V, com FiveM na comunidade",
        "O PC tem uma exigência geral: rodar esse jogo e sobrar processador para a voz",
        "GTA 6 permanece no que foi anunciado: console, um jogador, sem versão de PC nesta data",
      ],
      contras: [
        "Não há passo a passo de mod, de burla nem de servidor",
        "Não há requisito oficial de GTA 6 para copiar",
        "Transmitir a sessão não promete audiência nem pagamento",
      ],
    },
    {
      tipo: "chamada",
      tema: "pc-gamer",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "A máquina do jogo que já abre",
    },
    {
      tipo: "paragrafo",
      texto: "Na Balão da Informática Anchieta, Av. Anchieta, 789, Cambuí, Campinas, a conversa de GTA RP começa pelo GTA V que você já joga e pelo que sobra quando a voz entra. Você vê a máquina ligada. Ninguém aqui monta “PC de GTA 6 RP”, porque esse modo não foi anunciado e a versão de computador também não.",
    },
    {
      tipo: "paragrafo",
      texto: "Chame no WhatsApp (19) 98751-0267 e diga se o GTA V roda e se a frase corta com o jogo aberto. A decisão é configurar para esse uso. Servidor, instalação de mod e qualquer burla ficam fora do pedido, junto com qualquer peça atribuída a um requisito que a Rockstar não publicou.",
    },
    {
      tipo: "chamada",
      titulo: "A Balão da Informática Anchieta monta para o jogo que existe.",
      texto: "No WhatsApp (19) 98751-0267, diga como o GTA V se comporta com a voz aberta. A decisão para nesse uso.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "GTA RP é um modo oficial de GTA 6?",
      resposta: "Não. O RP que se joga hoje é cena de comunidade em GTA V, e FiveM é o nome mais citado dessa cena. A PlayStation descreve GTA 6 como experiência de um jogador. Um modo de RP não está nesse anúncio.",
    },
    {
      pergunta: "O que o PC precisa para essa cena?",
      resposta: "Em termos gerais, rodar o GTA V e ainda sobrar processador para a voz. Se você transmite, a captura é mais uma carga. Não há lista de peça de GTA 6, porque o requisito de PC não foi publicado.",
    },
    {
      pergunta: "Este guia ensina a montar servidor ou a instalar mod?",
      resposta: "Não. Não há passo a passo de mod, de burla nem de servidor. O texto só separa o que a cena é, o que GTA 6 não anunciou e o que o computador precisa em termos gerais.",
    },
    {
      pergunta: "GTA 6 de PC já tem data para jogar RP?",
      resposta: "Até 19 de novembro de 2026 a versão de PC não estava anunciada, nem um modo de RP. O dia 19 de novembro de 2026 é lançamento de console, no PS5 e no Xbox Series, descrito como um jogador.",
    },
    {
      pergunta: "Transmitir GTA RP garante audiência ou pagamento?",
      resposta: "Não. A transmissão mostra a sessão para quem chegar. Não produz plateia nem pagamento. Voz inteligível e jogo estável são condições da live, não uma promessa de retorno.",
    },
  ],
  fontes: [
    ROCKSTARVI,
    YAHOOPC,
    PLAYSTATION,
    OBS,
  ],
};

export default artigo;
