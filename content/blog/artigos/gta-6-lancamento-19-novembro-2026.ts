import type { Artigo, Fonte } from "@/lib/blog/tipos";

const ROCKSTARDATA: Fonte = {
  nome: "Rockstar Games — “Grand Theft Auto VI is Now Set to Launch November 19, 2026”",
  url: "https://www.rockstargames.com/newswire/article/ak3ak31a49a221/grand-theft-auto-vi-is-now-set-to-launch-november-19-2026",
  data: "6 de novembro de 2025",
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

const PLAYSTATION: Fonte = {
  nome: "PlayStation — página de Grand Theft Auto VI",
  url: "https://www.playstation.com/en-us/games/grand-theft-auto-vi/",
  data: "consulta em 19 de novembro de 2026",
};

const TAKETWO: Fonte = {
  nome: "Take-Two Interactive — comunicado de pré-venda de Grand Theft Auto VI",
  url: "https://taketwointeractivesoftwareinc.gcs-web.com/news-releases/news-release-details/rockstar-games-announces-pre-orders-grand-theft-auto-vi/",
  data: "24 de junho de 2026",
};

const artigo: Artigo = {
  slug: "gta-6-lancamento-19-novembro-2026",
  titulo: "GTA 6 chega em 19 de novembro de 2026: o que foi confirmado",
  resumo: "A Rockstar fixou GTA 6 para 19 de novembro de 2026, no PS5 e no Xbox Series. Veja qual data vale e o que ainda não foi anunciado.",
  categoria: "noticias",
  etiquetas: [
    "GTA 6",
    "Lançamento",
    "Rockstar",
  ],
  capa: {
    src: "/blog/capas/gta-6-lancamento-19-novembro-2026.webp",
    alt: "Capa escura com a data 19 nov 2026 em destaque e o título sobre o lançamento de GTA 6",
    largura: 1536,
    altura: 1024,
    pronta: true,
  },
  publicadoEm: "2026-11-18T16:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "GTA 6 em 19 de novembro de 2026: o que foi confirmado",
    palavrasChave: [
      "gta 6 lançamento",
      "data gta 6",
      "gta 6 19 de novembro",
      "quando sai gta 6",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "Quem pesquisa a data de GTA 6 ainda encontra maio de 2026 no meio dos resultados. Essa data existiu: a Rockstar chegou a anunciá-la e depois a trocou. O lançamento marcado para os consoles é 19 de novembro de 2026, uma quinta-feira.",
    },
    {
      tipo: "paragrafo",
      texto: "A resposta curta está no comunicado da própria Rockstar, de 6 de novembro de 2025: o jogo passa a sair nessa data, no PlayStation 5 e no Xbox Series X|S. Até 19 de novembro de 2026 não havia versão de PC anunciada. O resto desta matéria é o caminho das datas e o que isso muda para quem está montando computador.",
    },
    {
      tipo: "resumo",
      itens: [
        "**A data de console é 19 de novembro de 2026.** Foi a Rockstar quem fixou, depois de duas janelas anteriores.",
        "**PS5 e Xbox Series estão no lançamento.** A página oficial lista essas plataformas, não o PC.",
        "**Maio de 2026 ficou para trás.** A Reuters registrou essa data como a promessa anterior.",
        "**Requisito de PC não existe.** Sem versão anunciada, não há configuração oficial para copiar.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Qual data vale quando as notícias se contradizem",
    },
    {
      tipo: "paragrafo",
      texto: "A regra prática é ficar com o comunicado mais novo da empresa que faz o jogo. Em 6 de novembro de 2025 a Rockstar escreveu que Grand Theft Auto VI passaria a sair na quinta-feira, 19 de novembro de 2026. O texto pede desculpas pela espera extra e diz que os meses a mais serviriam para terminar o jogo no nível de acabamento que o público espera.",
    },
    {
      tipo: "citacao",
      texto: "Lamentamos acrescentar mais tempo a uma espera que sabemos já ser longa, mas esses meses a mais vão permitir terminar o jogo com o nível de acabamento que vocês esperam e merecem.",
      autor: "Rockstar Games",
      cargo: "comunicado de 6 de novembro de 2025",
      fonte: ROCKSTARDATA,
      traduzida: true,
    },
    {
      tipo: "paragrafo",
      texto: "A [The Verge](https://www.theverge.com/news/816005/grand-theft-auto-vi-gta-g-delayed-november-2026) publicou a mesma frase no mesmo dia e lembrou o que vinha antes: a data vigente era 26 de maio de 2026, e antes disso havia uma janela em 2025. A [Reuters](https://www.reuters.com/business/media-telecom/take-two-interactive-further-delays-gta-vi-november-next-year-2025-11-06/) tratou o anúncio como o segundo adiamento. Por isso um guia antigo ainda pode dizer maio. Não é que o autor tenha inventado: é que a data mudou.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-6-lancamento-19-novembro-2026-datas.webp",
        alt: "Linha do tempo com a janela de 2025, a data de maio de 2026 e o lançamento em 19 de novembro de 2026",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "A data que vale é a última. As anteriores explicam por que a busca ainda mostra maio de 2026.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que essa quinta-feira inclui",
    },
    {
      tipo: "paragrafo",
      texto: "A [página oficial](https://www.rockstargames.com/VI) mostra PlayStation 5 e Xbox Series X|S, com a chamada de que o jogo rende melhor no PS5. A [PlayStation](https://www.playstation.com/en-us/games/grand-theft-auto-vi/) confirma o dia 19 de novembro de 2026 também para o PS5 Pro e diz que o jogo não roda no PlayStation 4. Não é um detalhe de compatibilidade escondido: está na pergunta frequente da loja.",
    },
    {
      tipo: "paragrafo",
      texto: "O mesmo texto da PlayStation responde que Grand Theft Auto VI é uma experiência de um jogador. Quem espera um modo online no dia do lançamento não encontra essa promessa ali. O [comunicado da Take-Two](https://taketwointeractivesoftwareinc.gcs-web.com/news-releases/news-release-details/rockstar-games-announces-pre-orders-grand-theft-auto-vi/), de 24 de junho de 2026, repete a data, as duas famílias de console e o preço em dólares da edição padrão. O preço em reais não está nesse comunicado.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Meia-noite local, não um horário único no mundo",
    },
    {
      tipo: "paragrafo",
      texto: "O suporte da PlayStation marca o lançamento à meia-noite no fuso de quem joga, no PlayStation 5. Não dá para transformar isso num único horário de Brasília e achar que vale para todas as lojas: cada vitrine pode liberar o download no fuso dela. O que não muda é o dia.",
    },
    {
      tipo: "destaque",
      tom: "atencao",
      titulo: "Como ler uma data antiga",
      texto: "Se o texto diz 26 de maio de 2026 e não cita o comunicado de novembro de 2025, ele descreve uma promessa que a Rockstar substituiu. A data de console que ficou de pé é 19 de novembro de 2026.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que o dia do lançamento não responde",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-6-lancamento-19-novembro-2026-confirmado.webp",
        alt: "Duas colunas: o que já foi anunciado para o lançamento de GTA 6 e o que ainda não tem comunicado oficial",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Separar o que tem fonte do que é espera evita comprar peça por um requisito que não existe.",
    },
    {
      tipo: "paragrafo",
      texto: "Três perguntas continuam sem página oficial. A primeira é a versão de PC: o site da Rockstar, o comunicado da Take-Two e a matéria da PlayStation listam console. A segunda é o requisito de hardware, que só faria sentido depois de uma versão de computador. A terceira é o preço em reais, que cada loja define e que este blog não copia de anúncio velho.",
    },
    {
      tipo: "paragrafo",
      texto: "Há relatos de imprensa sobre uma janela de PC em 2027. Enquanto a Rockstar não publicar data, isso permanece relato, não calendário. O artigo sobre [plataformas de GTA 6](/blog/gta-6-plataformas-ps5-xbox-e-pc) separa o que cada aparelho faz no lançamento, e o de [PC para GTA 6](/blog/pc-para-gta-6-sem-requisito-oficial) explica o que dá para decidir sem requisito.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que muda para quem está comprando computador",
    },
    {
      tipo: "paragrafo",
      texto: "Comprar uma placa “porque o GTA 6 pede” é decidir com um número que não foi publicado. O que dá para fazer agora é outro: escolher a máquina pelos jogos que você já roda e pela tela que você já tem, e deixar folga de memória e de SSD para quando a ficha oficial existir. Trocar de peça no susto, na semana do console, não aproxima o PC de um jogo que ainda não tem versão de PC.",
    },
    {
      tipo: "paragrafo",
      texto: "A série inteira está em [GTA 6 no blog](/blog/gta-6). A data de console responde quando o jogo chega na sala. Não responde qual fonte, qual placa ou qual quantidade de memória comprar.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "A data de console tem dono: o comunicado da Rockstar, não um fórum",
        "Dá para ignorar guias que ainda citam maio de 2026 como se fosse o plano atual",
        "Fica claro o que não comprar enquanto o PC não for anunciado",
      ],
      contras: [
        "Quem quer jogar no dia 19 precisa de console, não de um PC montado no escuro",
        "A data já mudou duas vezes; um novo comunicado pode mudá-la de novo",
        "Preço em reais e requisito de PC continuam fora do anúncio",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Antes de decidir na loja",
    },
    {
      tipo: "paragrafo",
      texto: "Na Balão da Informática Anchieta, na Av. Anchieta, 789, no Cambuí, em Campinas, a conversa começa pelo uso: quais jogos você roda hoje, em que monitor, e se a máquina também vai transmitir. O computador sai montado para isso. GTA 6 entra na conta quando a Rockstar publicar versão e requisito, não antes.",
    },
    {
      tipo: "paragrafo",
      texto: "O orçamento é do dia em que você pergunta, no WhatsApp (19) 98751-0267 ou no balcão. Este texto não trava preço de peça. A decisão honesta, hoje, é tratar 19 de novembro de 2026 como a data de console e deixar o PC fora dessa fila até haver ficha oficial.",
    },
    {
      tipo: "chamada",
      titulo: "Quer montar sem chutar requisito de GTA 6?",
      texto: "Diga quais jogos você joga hoje e qual é o seu monitor. A equipe indica a máquina por esse uso e mostra ela ligada antes do pagamento.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "GTA 6 já lançou?",
      resposta: "O lançamento de console marcado pela Rockstar é 19 de novembro de 2026, para PlayStation 5 e Xbox Series X|S. Uma matéria antiga que ainda cita 26 de maio de 2026 está desatualizada: essa data foi substituída em novembro de 2025.",
    },
    {
      pergunta: "Dá para jogar GTA 6 no PC nesse dia?",
      resposta: "Até 19 de novembro de 2026 a Rockstar não tinha anunciado versão de PC, nem pré-venda, nem requisito. O que está à venda para o dia do lançamento é o jogo de console.",
    },
    {
      pergunta: "Por que tanta gente ainda fala em maio de 2026?",
      resposta: "Porque essa foi a data anunciada antes. A Reuters e a The Verge registram a troca para 19 de novembro de 2026. Quando duas datas circulam, vale a do comunicado mais novo.",
    },
    {
      pergunta: "O jogo tem modo online no lançamento?",
      resposta: "A página da PlayStation descreve Grand Theft Auto VI como uma experiência de um jogador. Um modo online no dia do lançamento não está nessa resposta.",
    },
  ],
  fontes: [
    ROCKSTARDATA,
    VERGEATRASO,
    REUTERS,
    PLAYSTATION,
    TAKETWO,
  ],
};

export default artigo;
