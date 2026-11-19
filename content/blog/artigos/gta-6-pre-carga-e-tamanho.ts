import type { Artigo, Fonte } from "@/lib/blog/tipos";

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

const TAKETWO: Fonte = {
  nome: "Take-Two Interactive — comunicado de pré-venda de Grand Theft Auto VI",
  url: "https://taketwointeractivesoftwareinc.gcs-web.com/news-releases/news-release-details/rockstar-games-announces-pre-orders-grand-theft-auto-vi/",
  data: "24 de junho de 2026",
};

const VERGETAMANHO: Fonte = {
  nome: "The Verge — “GTA VI’s download will need up to 212GB of hard drive space”",
  url: "https://www.theverge.com/games/1025271/gta-vi-storage-space-rockstar-games",
  data: "novembro de 2026",
};

const XBOX: Fonte = {
  nome: "Xbox Wire — Grand Theft Auto VI no Xbox Cloud Gaming",
  url: "https://news.xbox.com/en-us/2026/11/10/grand-theft-auto-6-comes-to-xbox-cloud-gaming-november-19/",
  data: "10 de novembro de 2026",
};

const ROCKSTARMIDIA: Fonte = {
  nome: "Rockstar Games — mídia oficial de Grand Theft Auto VI",
  url: "https://www.rockstargames.com/VI/launch-trailer",
  data: "consulta em 19 de novembro de 2026",
};

const ROCKSTARVI: Fonte = {
  nome: "Rockstar Games — página oficial de Grand Theft Auto VI",
  url: "https://www.rockstargames.com/VI",
  data: "consulta em 19 de novembro de 2026",
};

const artigo: Artigo = {
  slug: "gta-6-pre-carga-e-tamanho",
  titulo: "Pré-carga de GTA 6: tamanho, data e a caixa sem disco",
  resumo: "A pré-carga de GTA 6 ficou em 10 de novembro de 2026. No PS5 são pelo menos 212 GB, e a caixa física traz código, sem disco.",
  categoria: "noticias",
  etiquetas: [
    "GTA 6",
    "Pré-carga",
    "PS5",
  ],
  capa: {
    src: "/blog/capas/gta-6-pre-carga-e-tamanho.webp",
    alt: "Capa sobre a pré-carga de GTA 6, o espaço em gigabytes no console e a caixa física sem disco",
    largura: 1536,
    altura: 1024,
    pronta: true,
  },
  publicadoEm: "2026-11-14T12:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "Pré-carga de GTA 6: tamanho e a caixa sem disco",
    palavrasChave: [
      "pré-carga gta 6",
      "tamanho gta 6",
      "gta 6 212 gb",
      "gta 6 sem disco",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "Quem vai baixar GTA 6 precisa de duas respostas antes de olhar a caixa: em que dia a pré-carga abre e quanto espaço separar. As duas já foram escritas, e as duas já foram ditas de mais de um jeito. A pré-carga que ficou de pé é 10 de novembro de 2026. O número de gigabytes depende de qual frase você está lendo, e de qual aparelho.",
    },
    {
      tipo: "paragrafo",
      texto: "A caixa física não resolve nenhuma das duas. A PlayStation informa que o físico é um código na caixa, sem disco. O arquivo ainda precisa caber no console. No PS5, o mínimo publicado é de pelo menos 212 GB. A The Verge fala num arquivo de até 212 GB, conforme o aparelho. Não são a mesma medida com duas palavras.",
    },
    {
      tipo: "resumo",
      itens: [
        "**A pré-carga ficou em 10 de novembro de 2026.** É o que a PlayStation e a Rockstar falam em novembro.",
        "**Junho tinha citado 12 de novembro.** Essa frase é do comunicado da Take-Two daquele mês.",
        "**No PS5, pelo menos 212 GB.** Esse mínimo é da PlayStation, não de todos os aparelhos.",
        "**A caixa não tem disco.** O código não dispensa o download nem o espaço.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Qual data de pré-carga ficou de pé",
    },
    {
      tipo: "paragrafo",
      texto: "Em 24 de junho de 2026, o comunicado da Take-Two citou pré-carga para 12 de novembro. Em novembro de 2026, a PlayStation e a Rockstar falam em 10 de novembro. A regra é a mesma da data de lançamento: fica a frase mais nova das páginas oficiais. Se um texto ainda diz 12 de novembro e não cita a atualização, ele descreve o comunicado de junho.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-6-pre-carga-e-tamanho-calendario.webp",
        alt: "Linha do tempo da pré-carga de GTA 6, do comunicado de junho à data de 10 de novembro de 2026",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "A data que vale é a das páginas de novembro. A de junho explica por que ainda se lê 12 de novembro.",
    },
    {
      tipo: "paragrafo",
      texto: "Na PlayStation, a pré-carga de 10 de novembro de 2026 começa à meia-noite no fuso de quem joga. Não vira um horário único de Brasília para todas as contas. O dia é que não muda. O vídeo Pre-Load Now, na página de mídia, também é de 10 de novembro de 2026. O nome e a data batem. A cena não entra aqui.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Meia-noite local não é o relógio do dia 19",
    },
    {
      tipo: "paragrafo",
      texto: "O dia 19 de novembro de 2026 é o lançamento, não a abertura da pré-carga. No [Xbox Wire de 10 de novembro de 2026](https://news.xbox.com/en-us/2026/11/10/grand-theft-auto-6-comes-to-xbox-cloud-gaming-november-19/), a nuvem é citada a partir da 1h da manhã, horário do Leste dos Estados Unidos, nesse dia 19. São relógios diferentes. Pré-carga é o arquivo antes. Esse horário do Wire é o da nuvem no dia do lançamento.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Como ler os dois números de 212 GB",
    },
    {
      tipo: "paragrafo",
      texto: "A [PlayStation](https://www.playstation.com/en-us/games/grand-theft-auto-vi/) fala em pelo menos 212 GB no PS5. “Pelo menos” é mínimo: o console precisa ter esse espaço livre, e a frase não diz que todo aparelho para nesse número. O [suporte](https://www.playstation.com/en-us/support/games/gta-vi-support/) é a outra página da marca usada para essa ficha. Não há, nesse par, um segundo mínimo publicado para o PS5 Pro.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-6-pre-carga-e-tamanho-espaco.webp",
        alt: "Camadas separam o mínimo de 212 GB no PS5, o limite da The Verge e a caixa de GTA 6 sem disco",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "As duas linhas usam 212 e não dizem a mesma coisa. A caixa sem disco não apaga nenhuma delas.",
    },
    {
      tipo: "paragrafo",
      texto: "A [The Verge](https://www.theverge.com/games/1025271/gta-vi-storage-space-rockstar-games) escreve outra frase: um arquivo de pré-carga de até 212 GB, conforme o aparelho. “Até” é teto informado por essa reportagem, e “conforme o aparelho” avisa que o arquivo muda. Somar as duas falas num único “o jogo tem 212 GB” apaga a diferença. Dá para citar as duas. Não dá para fundir.",
    },
    {
      tipo: "tabela",
      titulo: "Espaço e data, cada um com a fonte",
      colunas: [
        "Fonte",
        "O que diz do espaço",
        "O que diz da pré-carga",
      ],
      linhas: [
        [
          "PlayStation",
          "Pelo menos 212 GB no PS5",
          "10 nov 2026, meia-noite local",
        ],
        [
          "The Verge",
          "Até 212 GB, conforme o aparelho",
          "Frase usada aqui é a do tamanho",
        ],
        [
          "Take-Two, junho",
          "Sem gigabytes no trecho usado",
          "Citou 12 nov 2026",
        ],
        [
          "Rockstar, nov 2026",
          "Sem gigabytes neste trecho",
          "Fala em 10 nov 2026",
        ],
        [
          "Caixa física",
          "Código, sem disco",
          "O download continua",
        ],
      ],
      nota: "O mínimo da PlayStation e o teto da The Verge não foram unidos num tamanho só.",
    },
    {
      tipo: "destaque",
      tom: "atencao",
      titulo: "Não una os dois 212",
      texto: "Pelo menos 212 GB é o que a PlayStation informa para o PS5. Até 212 GB, conforme o aparelho, é a frase da The Verge. As duas ficam separadas.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que a caixa física contém",
    },
    {
      tipo: "paragrafo",
      texto: "A PlayStation diz que a edição física é um código na caixa, sem disco. Você leva a caixa para casa e ainda precisa baixar o jogo. O espaço do PS5 continua valendo: pelo menos 212 GB, na frase dessa marca. Escolher o físico para “não depender de download” contraria o que a página escreveu. A caixa organiza a compra. O arquivo ocupa o console.",
    },
    {
      tipo: "paragrafo",
      texto: "Isso não informa o tamanho no Xbox. O Xbox Wire descreve o jogo nativo no Series X e no Series S, e também a nuvem no Xbox One e nos Series, com gráfico de Series S quando o caminho é a nuvem. O jogo da nuvem é comprado à parte, e a disponibilidade varia por país. Gigabytes não estão nesse texto. Aparelho por aparelho está em [plataformas](/blog/gta-6-plataformas-ps5-xbox-e-pc).",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que isso não diz sobre o computador",
    },
    {
      tipo: "paragrafo",
      texto: "Não há versão de PC anunciada até 19 de novembro de 2026, então não há pré-carga de PC nem tamanho de arquivo de PC. Os 212 GB falam de console e do arquivo conforme o aparelho, na The Verge. Não são requisito de placa, memória ou processador. Levar o número do PS5 para a peça do computador converte frase de console em ficha que ninguém publicou.",
    },
    {
      tipo: "paragrafo",
      texto: "O preço da edição, em dólares, está noutra matéria, a de [preço](/blog/gta-6-preco-e-edicoes). Os vídeos, inclusive o Pre-Load Now, estão em [trailers](/blog/gta-6-trailers-oficiais). Dúvidas vizinhas estão nas [perguntas frequentes](/blog/gta-6-perguntas-frequentes). A série junta os temas em [GTA 6 no blog](/blog/gta-6). Espaço de pré-carga responde o console. Não responde a máquina que você vai montar.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "A data de 10 de novembro fica no lugar da cita de 12 de novembro, com a página mais nova",
        "Os dois usos de 212 GB continuam com fonte e frase diferentes",
        "A caixa sem disco evita a expectativa de jogar sem baixar o arquivo",
      ],
      contras: [
        "Não há um tamanho único publicado para todos os aparelhos",
        "O Xbox Wire não informa gigabytes",
        "Não existe pré-carga de PC anunciada para citar",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Se o espaço do console virou compra de armazenamento",
    },
    {
      tipo: "paragrafo",
      texto: "Separar espaço no PS5 é conta de console. Na Balão da Informática Anchieta, Av. Anchieta, 789, Cambuí, Campinas, você vê a máquina ligada e diz quanto espaço já usa nos jogos de hoje. O número do PS5 não é copiado para uma peça de computador.",
    },
    {
      tipo: "paragrafo",
      texto: "Chame no WhatsApp (19) 98751-0267 ou veja os [PCs gamer](/pcgamer). A caixa sem disco explica a edição física do console. Não escolhe armazenamento, placa nem memória para uma versão de PC que a Rockstar não anunciou. A decisão de hoje é o computador dos jogos que você já roda.",
    },
    {
      tipo: "chamada",
      titulo: "Os gigabytes do console não são ficha de PC.",
      texto: "Se a pergunta é o computador, diga os jogos e o espaço que você já usa. A equipe mostra a máquina ligada.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "Quando começa a pré-carga de GTA 6?",
      resposta: "Em novembro de 2026, a PlayStation e a Rockstar falam em 10 de novembro, à meia-noite no fuso local na PlayStation. O comunicado da Take-Two, em junho, tinha citado 12 de novembro. Fica a data mais nova.",
    },
    {
      pergunta: "GTA 6 ocupa quantos GB?",
      resposta: "A PlayStation informa pelo menos 212 GB no PS5. A The Verge informa um arquivo de até 212 GB, conforme o aparelho. Não dê aos dois a mesma frase, e não use nenhum deles como requisito de PC.",
    },
    {
      pergunta: "A mídia física de GTA 6 vem com disco?",
      resposta: "Não, no que a PlayStation publicou. A caixa traz um código, sem disco. O jogo ainda é baixado, e o espaço no PS5 continua necessário.",
    },
    {
      pergunta: "A pré-carga de 12 de novembro ainda vale?",
      resposta: "Essa data está no comunicado de 24 de junho de 2026. As páginas da PlayStation e da Rockstar, em novembro de 2026, falam em 10 de novembro. O texto de junho explica a confusão. Não é o plano atual.",
    },
  ],
  fontes: [
    PLAYSTATION,
    PSSUPORTE,
    TAKETWO,
    VERGETAMANHO,
    XBOX,
    ROCKSTARMIDIA,
    ROCKSTARVI,
  ],
};

export default artigo;
