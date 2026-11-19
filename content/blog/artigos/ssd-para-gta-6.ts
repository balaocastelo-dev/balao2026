import type { Artigo, Fonte } from "@/lib/blog/tipos";

const PSSUPORTE: Fonte = {
  nome: "PlayStation — suporte de Grand Theft Auto VI",
  url: "https://www.playstation.com/en-us/support/games/gta-vi-support/",
  data: "consulta em 19 de novembro de 2026",
};

const VERGETAMANHO: Fonte = {
  nome: "The Verge — “GTA VI’s download will need up to 212GB of hard drive space”",
  url: "https://www.theverge.com/games/1025271/gta-vi-storage-space-rockstar-games",
  data: "novembro de 2026",
};

const PLAYSTATION: Fonte = {
  nome: "PlayStation — página de Grand Theft Auto VI",
  url: "https://www.playstation.com/en-us/games/grand-theft-auto-vi/",
  data: "consulta em 19 de novembro de 2026",
};

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

const artigo: Artigo = {
  slug: "ssd-para-gta-6",
  titulo: "SSD para GTA 6: o que o tamanho no console ensina",
  resumo: "O PS5 pede pelo menos 212 GB, e isso é número de console. Num PC, o hábito útil para jogo grande é SSD com folga, não um HD.",
  categoria: "hardware",
  etiquetas: [
    "GTA 6",
    "SSD",
    "Armazenamento",
  ],
  capa: {
    src: "/blog/capas/ssd-para-gta-6.webp",
    alt: "Capa com 212 GB marcado como número de console e o hábito de SSD com folga no PC",
    largura: 1536,
    altura: 1024,
    pronta: true,
  },
  publicadoEm: "2026-11-12T18:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "SSD para GTA 6: o que o console ensina",
    palavrasChave: [
      "ssd para gta 6",
      "gta 6 212 gb",
      "ssd ou hd para jogo",
      "espaço em disco para jogo",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "O número 212 GB já saiu do console e entrou em lista de PC. Ele não nasceu nessa lista. Até 19 de novembro de 2026 ninguém da Rockstar publicou tamanho de instalação para computador, porque o PC não estava anunciado. O que existe, com fonte, é espaço de console. Tratar os dois como a mesma conta é o erro que esta página desfaz.",
    },
    {
      tipo: "paragrafo",
      texto: "No computador, o hábito que presta para jogo grande é outro: SSD no lugar de HD, com folga sobrando depois da instalação. Isso vale para os jogos que você já tem e que ocupam dezenas de gigabytes. Não é um requisito oficial de GTA 6. É a diferença entre abrir o jogo e esperar o disco mecânico alcançar o arquivo.",
    },
    {
      tipo: "resumo",
      itens: [
        "**212 GB são número de console.** O suporte da PlayStation fala em pelo menos 212 GB no PS5.",
        "**Até 212 GB, conforme o aparelho.** É o que a The Verge atribui à Rockstar. Continua sendo console.",
        "**Dá para inferir um jogo grande.** Se um dia houver PC, a instalação tende a ser pesada. A inferência está rotulada.",
        "**O hábito útil é SSD com folga.** HD fica para arquivo. Nenhum dos dois é ficha oficial.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "212 GB é conta de console",
    },
    {
      tipo: "paragrafo",
      texto: "O suporte da PlayStation pede pelo menos 212 GB livres no PS5 para Grand Theft Auto VI. A [página de suporte](https://www.playstation.com/en-us/support/games/gta-vi-support/) é o lugar dessa frase, não um fórum. A [The Verge](https://www.theverge.com/games/1025271/gta-vi-storage-space-rockstar-games) registra outro recorte: a Rockstar falou em um arquivo de até 212 GB, conforme o aparelho. As duas frases não são a mesma medida com duas palavras.",
    },
    {
      tipo: "paragrafo",
      texto: "“Pelo menos 212 GB” é o espaço que o console precisa ter livre. “Até 212 GB” é o teto do arquivo conforme o aparelho, do jeito que a The Verge reportou. Um PS5 e um Xbox Series não são obrigados a ocupar o mesmo número. Nenhum dos dois textos descreve uma pasta no Windows. A [página do jogo](https://www.rockstargames.com/VI) segue sem versão de PC.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/ssd-para-gta-6-gigas.webp",
        alt: "Duas colunas separando o espaço publicado para o console e o hábito de disco num PC sem ficha de GTA 6",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "212 GB descreve o aparelho de console. No computador, a decisão útil é SSD com espaço sobrando.",
    },
    {
      tipo: "paragrafo",
      texto: "A [página da PlayStation](https://www.playstation.com/en-us/games/grand-theft-auto-vi/) confirma o jogo no console e não converte esse espaço em disco de computador. Em 15 de novembro de 2026, a [reportagem no Yahoo](https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html) ainda não achava data de PC, pré-venda nem requisito. Sem requisito, 212 GB não migram para a lista de peças.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "A inferência cabe numa frase, e só nela",
    },
    {
      tipo: "paragrafo",
      texto: "Dá para inferir uma coisa, e ela precisa ir rotulada. Um jogo que pede centenas de gigabytes no console tende, se um dia existir em PC, a ser um jogo grande também. Textura, áudio e mundo aberto não encolhem só porque o sistema operacional mudou. Isso é inferência. Não é tamanho de instalação, não é requisito e não é cota para comprar um SSD de uma capacidade cravada.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Inferência rotulada, não ficha",
    },
    {
      tipo: "paragrafo",
      texto: "A frase permitida é: “se houver versão de PC, espere um jogo grande”. A frase proibida é: “o PC precisa de 212 GB porque o PS5 precisa”. A primeira admite que o número de computador não foi publicado. A segunda cola o console na peça. Até 19 de novembro de 2026 só a primeira sobrevive ao contato com a fonte.",
    },
    {
      tipo: "destaque",
      tom: "atencao",
      titulo: "Console não vira requisito",
      texto: "Pelo menos 212 GB no PS5 e até 212 GB conforme o aparelho são dados de console, com fonte. Não são o tamanho de uma futura instalação no PC, que a Rockstar não publicou.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "SSD com folga é o hábito que presta",
    },
    {
      tipo: "paragrafo",
      texto: "Jogo grande em HD mecânico é a sessão que não começa: a tela de carregamento espera o disco achar o arquivo. SSD lê esse arquivo sem essa espera, e é assim que PC de jogo é montado hoje. A troca está em [upgrade de SSD](/upgrade-ssd) e na categoria de [SSDs](/categoria/hardware-ssd). O motivo é o jogo que você já instalou, não uma ficha de GTA 6.",
    },
    {
      tipo: "tabela",
      titulo: "O que o número é e o que ele não é",
      colunas: [
        "Frase",
        "O que ela é",
        "O que ela não é",
      ],
      linhas: [
        [
          "Pelo menos 212 GB no PS5",
          "Espaço livre publicado pela PlayStation",
          "Requisito de computador",
        ],
        [
          "Até 212 GB conforme o aparelho",
          "Teto citado pela The Verge",
          "Tamanho de instalação no Windows",
        ],
        [
          "Jogo grande, se houver PC",
          "Inferência, rotulada como inferência",
          "Cota oficial de disco",
        ],
        [
          "SSD com faixa livre",
          "Hábito para jogo grande hoje",
          "Ficha de GTA 6",
        ],
      ],
      colunaDestaque: 1,
      fonte: PSSUPORTE,
      nota: "A linha da The Verge está na matéria dela. Nenhuma linha informa gigabytes de PC.",
    },
    {
      tipo: "paragrafo",
      texto: "Capacidade do SSD é outra decisão, e ela olha para a sua biblioteca. Se os jogos que você mantém instalados já enchem o disco atual, o próximo precisa caber essa biblioteca e ainda sobrar. Se você apaga o jogo ao terminar, um SSD menor resolve. GTA 6 não entra nessa soma enquanto o tamanho de PC não existir.",
    },
    {
      tipo: "chamada",
      tema: "upgrade",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "HD fica para arquivo, não para o jogo",
    },
    {
      tipo: "paragrafo",
      texto: "HD mecânico continua útil para foto, vídeo antigo e backup. Ele guarda arquivo grande e é lento para textura. Deixar o sistema e os jogos no SSD, e o arquivo morto no HD, é um arranjo que a máquina de hoje aguenta bem. O jogo que você abre toda semana não mora nesse arquivo morto.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/ssd-para-gta-6-disco.webp",
        alt: "Fluxo em quatro passos para sair do HD, escolher SSD com sobra, deixar faixa livre e não copiar os 212 GB",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "A ordem é trocar o tipo de disco e sobrar espaço. O número do console não entra na conta.",
    },
    {
      tipo: "paragrafo",
      texto: "Há quem some 212 GB, o Windows e uma margem redonda e saia com um SSD “oficial”. A soma parece cuidadosa e continua sendo chute, porque o primeiro termo não é de PC. A matéria de [PC sem requisito](/blog/pc-para-gta-6-sem-requisito-oficial) recusa a mesma operação na máquina inteira. Disco é só o lugar onde ela fica mais tentadora, porque o número existe.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Quanto deixar livre sem inventar número",
    },
    {
      tipo: "paragrafo",
      texto: "Encher o SSD até o último arquivo piora a vida útil prática: o disco precisa de espaço para gravar e apagar sem viver no limite. Deixar uma faixa livre é hábito, não uma porcentagem oficial de GTA 6. Não há, nesta página, um percentual mágico. Há o conselho de não instalar a biblioteca inteira em cima do último gigabyte livre.",
    },
    {
      tipo: "paragrafo",
      texto: "Na hora de trocar, o formato também importa. Notebook fino e PC de mesa não usam a mesma peça, e um SSD de gaveta não entra num encaixe soldado. O [upgrade de SSD](/upgrade-ssd) começa pelo modelo da máquina. A memória, que é outra falta, está em [RAM para GTA 6](/blog/memoria-ram-para-gta-6), com o mesmo aviso: piso de hoje não é ficha do jogo.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "212 GB ficam com a fonte e com o aparelho certo, o console",
        "A inferência de jogo grande está escrita como inferência",
        "SSD com folga serve aos jogos que você já instalou",
      ],
      contras: [
        "Não há tamanho oficial de instalação no PC",
        "Somar 212 GB ao Windows não produz uma cota",
        "HD mecânico segue lento para o jogo, mesmo com muito espaço",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Antes de trocar o disco",
    },
    {
      tipo: "paragrafo",
      texto: "A troca de disco é serviço de upgrade na Balão da Informática Anchieta, Av. Anchieta, 789, Cambuí, Campinas. Chame no WhatsApp (19) 98751-0267 com o modelo do computador e diga se o jogo está num HD. A equipe confere o encaixe antes de indicar o SSD.",
    },
    {
      tipo: "paragrafo",
      texto: "Não leve os 212 GB como tamanho do pedido. Leve a biblioteca que você quer manter instalada e uma faixa livre em cima dela. A decisão é sair do HD para um SSD com espaço sobrando, e deixar os 212 GB como dado de console.",
    },
    {
      tipo: "chamada",
      titulo: "O jogo grande ainda está num HD?",
      texto: "Mande o modelo da máquina. A troca vai para um SSD com folga, sem usar o número do console como se fosse requisito de PC.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "GTA 6 ocupa 212 GB no PC?",
      resposta: "Esse número não foi publicado para PC. Até 19 de novembro de 2026 não havia versão de computador. No PS5, o suporte pede pelo menos 212 GB, e a The Verge fala em até 212 GB conforme o aparelho. Os dois dados são de console.",
    },
    {
      pergunta: "HD ainda serve para um jogo grande?",
      resposta: "Serve para arquivo e backup. Para o jogo que você abre, o HD mecânico deixa a sessão esperando o disco. SSD é o hábito atual de PC de jogo. Isso não é um requisito oficial de GTA 6, é prática para os jogos que já existem.",
    },
    {
      pergunta: "Quanto de SSD deixar livre?",
      resposta: "O bastante para a biblioteca que você mantém instalada, mais uma faixa livre para o disco não viver no último arquivo. Não há percentual oficial de GTA 6. Copiar 212 GB para essa conta mistura console e PC.",
    },
    {
      pergunta: "Posso comprar o SSD já contando o tamanho do console?",
      resposta: "Pode comprar o SSD que a sua biblioteca de hoje pede, com folga. Não pode tratar 212 GB como cota de PC. Se um dia a Rockstar publicar o tamanho da versão de computador, esse número substitui a inferência. Até lá, a inferência não vira pedido.",
    },
  ],
  fontes: [
    PSSUPORTE,
    VERGETAMANHO,
    PLAYSTATION,
    ROCKSTARVI,
    YAHOOPC,
  ],
};

export default artigo;
