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

const TAKETWO: Fonte = {
  nome: "Take-Two Interactive — comunicado de pré-venda de Grand Theft Auto VI",
  url: "https://taketwointeractivesoftwareinc.gcs-web.com/news-releases/news-release-details/rockstar-games-announces-pre-orders-grand-theft-auto-vi/",
  data: "24 de junho de 2026",
};

const POLYGON: Fonte = {
  nome: "Polygon — “GTA 6 Sets PC Release Date, New Report Says”",
  url: "https://www.polygon.com/gta-6-pc-release-q1-2027-rumor/",
  data: "2026",
};

const artigo: Artigo = {
  slug: "pc-para-gta-6-sem-requisito-oficial",
  titulo: "PC para GTA 6: requisito oficial ainda não existe",
  resumo: "Até 19 de novembro de 2026 não há requisito de PC para GTA 6. Veja o que dá para decidir pelos jogos e pelo monitor de hoje, com folga.",
  categoria: "guias",
  etiquetas: [
    "GTA 6",
    "PC",
    "Requisitos",
  ],
  capa: {
    src: "/blog/capas/pc-para-gta-6-sem-requisito-oficial.webp",
    alt: "Capa com a frase de compra sem ficha oficial e o selo de corte em 19 de novembro de 2026",
    largura: 1536,
    altura: 1024,
    pronta: true,
  },
  publicadoEm: "2026-11-18T14:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "PC para GTA 6: ainda não há requisito oficial",
    palavrasChave: [
      "pc para gta 6",
      "requisito gta 6 pc",
      "gta 6 vai ter pc",
      "configuração de pc para gta 6",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "A busca por um PC para GTA 6 devolve tabelas de peça com cara de ficha oficial. Essa ficha não tem dono. Até 19 de novembro de 2026 a Rockstar não anunciou versão de computador, pré-venda de PC nem requisito. A [página do jogo](https://www.rockstargames.com/VI) lista PlayStation 5 e Xbox Series. O dia 19 é lançamento de console.",
    },
    {
      tipo: "paragrafo",
      texto: "Dá para comprar agora por outro critério. Você escolhe a máquina pelos jogos que já roda e pelo monitor que já usa, e deixa folga de memória e de disco. Trocar placa no susto, copiando um número de console, não aproxima o computador de um jogo sem versão.",
    },
    {
      tipo: "resumo",
      itens: [
        "**Não há requisito de PC.** Até 19 de novembro de 2026 a Rockstar não publicou versão, pré-venda nem configuração.",
        "**19 de novembro é console.** PS5 e Xbox Series estão na página oficial. O computador não está.",
        "**O precedente não marca mês.** GTA V e Red Dead Redemption 2 chegaram ao PC depois, em intervalos diferentes.",
        "**A compra de hoje tem outro critério.** Jogos atuais, tela atual e folga. O resto espera a ficha.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que estava publicado até 19 de novembro de 2026",
    },
    {
      tipo: "paragrafo",
      texto: "A página da Rockstar mostra PlayStation 5 e Xbox Series X|S, com a chamada de que o jogo rende melhor no PS5. O [comunicado da Take-Two](https://taketwointeractivesoftwareinc.gcs-web.com/news-releases/news-release-details/rockstar-games-announces-pre-orders-grand-theft-auto-vi/), de 24 de junho de 2026, repete essas plataformas na pré-venda e não abre linha para Windows. Não há uma terceira coluna escondida no rodapé.",
    },
    {
      tipo: "paragrafo",
      texto: "Em 15 de novembro de 2026, a [reportagem do Just Jared no Yahoo](https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html) conferiu o site oficial e um relatório da Take-Two. Seguia sem data de PC, sem pré-venda de PC e sem requisito. O corte desta página é essa data de propósito: um comunicado novo muda o quadro, e um guia eterno envelhece mal.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/pc-para-gta-6-sem-requisito-oficial-precedente.webp",
        alt: "Linha do tempo com GTA V em 2013 e 2015 e Red Dead Redemption 2 em 2018 e 2019, do console ao PC",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Os dois jogos chegaram ao PC depois do console, com esperas diferentes. Isso é precedente, não mês marcado.",
    },
    {
      tipo: "paragrafo",
      texto: "O histórico que essa reportagem resume serve para uma coisa só. GTA V saiu em console em setembro de 2013 e no PC em abril de 2015. Red Dead Redemption 2 saiu em console em outubro de 2018 e no PC em novembro de 2019. Os dois chegaram ao computador depois. A espera não teve a mesma duração, então não vira régua.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Precedente de PC não marca o mês",
    },
    {
      tipo: "paragrafo",
      texto: "A [Polygon](https://www.polygon.com/gta-6-pc-release-q1-2027-rumor/) publicou um relato de PC no início de 2027, apoiado em fontes que não se identificam. A Rockstar não confirmou a janela. Tratar o começo de 2027 como mês de compra é decidir em cima de um boato. Precedente mostra que a espera já ocorreu. Não mostra em qual mês este jogo aparece no computador.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "O intervalo antigo não é régua",
    },
    {
      tipo: "paragrafo",
      texto: "De GTA V foram cerca de um ano e meio entre o console e o PC. De Red Dead Redemption 2, pouco mais de um ano. Se os dois prazos fossem regra, eles coincidiriam. Não coincidem. A única data que entra num plano é a que a Rockstar escrever. Sem essa frase, o calendário de PC fica em branco.",
    },
    {
      tipo: "destaque",
      tom: "atencao",
      titulo: "Relato não é calendário",
      texto: "Início de 2027 circula como matéria, não como comunicado. Até 19 de novembro de 2026 a Rockstar não confirmou versão de PC. Comprar peça com essa janela como prazo é chute.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que dá para decidir sem ficha",
    },
    {
      tipo: "paragrafo",
      texto: "A tabela abaixo separa o que você observa na própria mesa do que exigiria uma ficha. Jogos que já abrem, tela em Full HD ou Quad HD, memória no piso comum de 16 GB e jogo num SSD são decisões de PC atual. Requisito de GTA 6, data de computador e modelo “certo” do jogo não são. As duas colunas não se misturam.",
    },
    {
      tipo: "tabela",
      titulo: "O que dá para decidir e o que seria chute",
      colunas: [
        "Pergunta",
        "Dá para decidir",
        "Seria chute",
      ],
      linhas: [
        [
          "Uso de hoje",
          "Jogos e monitor que você já tem",
          "Tratar GTA 6 como se tivesse ficha",
        ],
        [
          "Tela",
          "Full HD ou Quad HD muda a placa",
          "Inventar a resolução que o jogo vai exigir",
        ],
        [
          "Memória e disco",
          "16 GB e SSD são hábito atual",
          "Copiar o número do console para o PC",
        ],
        [
          "Data de PC",
          "Sem anúncio até 19 nov 2026",
          "Marcar início de 2027 como plano",
        ],
      ],
      colunaDestaque: 1,
      fonte: YAHOOPC,
      nota: "A coluna do meio é critério de compra. A da direita não tem página da Rockstar.",
    },
    {
      tipo: "paragrafo",
      texto: "A [montagem](/montagempc) cabe na coluna do meio: a máquina sai para os jogos que você descreve, não para um requisito imaginado. Há um chute fácil de não perceber, que é colar os 212 GB do console na lista de peças. Esse número é de aparelho de console. A matéria de [SSD](/blog/ssd-para-gta-6) desmonta essa conta com a fonte.",
    },
    {
      tipo: "paragrafo",
      texto: "Folga também tem limite. Dezesseis gigabytes de memória são ponto de partida comum. Trinta e dois cabem quando navegador, Discord e captura ficam abertos. SSD no lugar de HD é prática para jogo grande. Nada disso é “o que GTA 6 pede”. É o que um computador de agora aguenta sem viver no limite o tempo todo.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "A tela e os jogos de hoje mandam na compra",
    },
    {
      tipo: "paragrafo",
      texto: "Se o monitor é Full HD e os jogos que você abre cabem nele, a máquina não sobe de faixa por um título sem versão de PC. Se você já quer Quad HD nos jogos atuais, a placa muda por causa dessa tela. A ordem é a tela primeiro. Invertida, a compra acerta o boato e erra a mesa.",
    },
    {
      tipo: "paragrafo",
      texto: "O contexto da série está em [GTA 6 no blog](/blog/gta-6). As plataformas do dia 19 estão em [PS5, Xbox e o PC](/blog/gta-6-plataformas-ps5-xbox-e-pc). Quem quer computador para o uso de agora segue para [PC gamer](/pcgamer) ou para [qual PC gamer](/qual-pc-gamer). Nenhum desses caminhos exige uma ficha que a Rockstar não escreveu.",
    },
    {
      tipo: "chamada",
      tema: "pc-gamer",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Folga útil e folga que é desculpa",
    },
    {
      tipo: "paragrafo",
      texto: "A folga útil é a que o seu uso de hoje já explica. Memória para as janelas abertas, SSD para o jogo não morar num HD, fonte com sobra para a placa dessa tela. A desculpa começa quando a folga ganha nome de modelo cravado como o chip de GTA 6. Sem ficha, não há chip certo.",
    },
    {
      tipo: "paragrafo",
      texto: "O processador que não limita os jogos que você já joga, a placa que combina com a sua tela e a fonte que alimenta essa placa fecham a conta. O detalhe de cada uma está nas matérias de [placa de vídeo](/blog/placa-de-video-para-gta-6), [processador](/blog/processador-para-gta-6) e [memória](/blog/memoria-ram-para-gta-6). Elas repetem o mesmo corte: decisão de PC atual, nunca requisito oficial.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/pc-para-gta-6-sem-requisito-oficial-decisao.webp",
        alt: "Duas colunas separando o que dá para decidir no PC de hoje e o que seria chute sobre GTA 6",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Jogos, tela, memória e disco dá para observar. Requisito, data de PC e tamanho de console não.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "A data de console fica fora da lista de peças do computador",
        "Dá para montar pelos jogos e pela tela que você já usa",
        "Memória e SSD entram como folga de máquina atual, com limite claro",
      ],
      contras: [
        "Quem quer jogar no dia 19 não resolve isso com um PC",
        "Um anúncio posterior de PC deixa a parte da ficha deste guia para trás",
        "Adiar a máquina que você usa hoje também não melhora a sessão desta semana",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Antes de fechar o computador",
    },
    {
      tipo: "paragrafo",
      texto: "Na Balão da Informática Anchieta, na Av. Anchieta, 789, no Cambuí, em Campinas, a conversa começa pela lista de jogos que você abre hoje e pelo monitor que está na mesa. O WhatsApp é (19) 98751-0267. Traga também se a máquina grava ou só joga: isso muda memória e disco, e não depende de GTA 6.",
    },
    {
      tipo: "paragrafo",
      texto: "Você vê a configuração pensada para esse uso, não uma ficha emprestada de fórum. Se a meta for jogar no dia 19, o caminho publicado até aqui é o console, e a loja diz isso com clareza. A decisão é montar para o uso atual, com folga, e deixar GTA 6 fora da lista até existir ficha oficial.",
    },
    {
      tipo: "chamada",
      titulo: "Quer montar para os jogos de hoje, com folga?",
      texto: "Diga a tela e os jogos que você já abre. A máquina sai desse uso, e GTA 6 só entra na conversa quando houver requisito publicado.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "GTA 6 já tem requisito de PC?",
      resposta: "Não. Até 19 de novembro de 2026 a Rockstar não anunciou versão de computador, pré-venda de PC nem requisito. A página oficial e o comunicado da Take-Two listam PlayStation 5 e Xbox Series. Lista de peça com cara de ficha oficial não tem essa origem.",
    },
    {
      pergunta: "Posso copiar o hardware do PS5 para montar o PC?",
      resposta: "Não há equivalência publicada. O console não informa a peça de computador correspondente, e a Rockstar não publicou configuração de PC. Usar o aparelho da Sony como lista de compra é chute, do mesmo tipo que inventar um requisito.",
    },
    {
      pergunta: "O PC de GTA 6 chega no começo de 2027?",
      resposta: "A Polygon publicou um relato nesse sentido, com fontes não identificadas. A Rockstar não confirmou. GTA V e Red Dead Redemption 2 chegaram ao PC depois do console, em intervalos diferentes. Precedente não é calendário.",
    },
    {
      pergunta: "Vale comprar peça agora por causa de GTA 6?",
      resposta: "Vale comprar o que os seus jogos e o seu monitor de hoje pedem, com folga de memória e de SSD. Não vale trocar peça porque um número de GTA 6 “pede”, já que esse número não foi publicado até 19 de novembro de 2026.",
    },
    {
      pergunta: "19 de novembro de 2026 é a data do PC?",
      resposta: "Não. É a data de lançamento marcada para PlayStation 5 e Xbox Series. Tratar esse dia como estreia de computador contradiz a página da Rockstar e o comunicado de pré-venda da Take-Two.",
    },
  ],
  fontes: [
    ROCKSTARVI,
    YAHOOPC,
    TAKETWO,
    POLYGON,
  ],
};

export default artigo;
