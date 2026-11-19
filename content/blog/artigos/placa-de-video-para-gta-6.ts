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

const artigo: Artigo = {
  slug: "placa-de-video-para-gta-6",
  titulo: "Placa de vídeo para GTA 6: o que dá para decidir",
  resumo: "Sem ficha de GTA 6, a placa se escolhe pela tela e pelos jogos atuais. A diferença de 8 e 16 GB é lição da Steam e da RTX 5060 Ti.",
  categoria: "hardware",
  etiquetas: [
    "GTA 6",
    "Placa de vídeo",
    "VRAM",
  ],
  capa: {
    src: "/blog/capas/placa-de-video-para-gta-6.webp",
    alt: "Capa sobre escolha de placa de vídeo pela tela atual, com o selo de 8 ou 16 GB de memória de vídeo",
    largura: 1536,
    altura: 1024,
    pronta: true,
  },
  publicadoEm: "2026-11-13T18:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "Placa de vídeo para GTA 6 sem requisito oficial",
    palavrasChave: [
      "placa de vídeo para gta 6",
      "vram para gta 6",
      "8gb ou 16gb",
      "placa de vídeo full hd",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "A pergunta da placa de vídeo para GTA 6 chega antes da única informação que a responderia. Consulta feita até 19 de novembro de 2026: a Rockstar ainda não tinha versão de PC, nem pré-venda, nem lista de hardware. Sem essa lista, nenhuma placa é “a de GTA 6”. Dá para escolher a placa por outra porta, e ela está na sua mesa.",
    },
    {
      tipo: "paragrafo",
      texto: "A porta é a resolução em que você joga agora e os jogos que você já abre. Full HD pede menos placa do que Quad HD. Memória de vídeo de 8 GB ou de 16 GB entra como lição desses jogos, não como linha de uma ficha inexistente. A [página oficial](https://www.rockstargames.com/VI) continua listando console.",
    },
    {
      tipo: "resumo",
      itens: [
        "**Não existe placa oficial de GTA 6.** Até 19 de novembro de 2026 não havia versão de PC nem requisito.",
        "**A tela manda na escolha.** Full HD e Quad HD não pedem a mesma placa nos jogos que você já roda.",
        "**8 GB e 16 GB são lição atual.** A Steam de setembro e a comparação da RTX 5060 Ti descrevem jogos de hoje.",
        "**Fonte e gabinete entram juntos.** Placa nova em fonte curta só troca o problema de lugar.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "A resolução escolhe a placa",
    },
    {
      tipo: "paragrafo",
      texto: "Comece pelo monitor, não pelo nome do chip. Se a tela é Full HD, a placa precisa segurar os jogos que você já joga nessa resolução. Se a tela é Quad HD, a mesma sessão ocupa mais a placa. GTA 6 não muda essa conta enquanto não tiver versão de PC.",
    },
    {
      tipo: "paragrafo",
      texto: "Quem está para trocar os dois ao mesmo tempo decide a tela primeiro. Levar a placa e só depois ver que o monitor continua em Full HD não muda a imagem. O caminho inverso, Quad HD com placa curta, deixa o ajuste no chão nos jogos de agora. A matéria de [monitor](/blog/monitor-para-gta-6) trata a tela como essa primeira escolha.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/placa-de-video-para-gta-6-cenario.webp",
        alt: "Quatro cartões de cenário de placa: Full HD, Quad HD, 8 GB de VRAM e 16 GB de VRAM, sem ficha de GTA 6",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "A tela e o ajuste de hoje mudam a placa. Nenhum cartão preenche uma ficha que a Rockstar não publicou.",
    },
    {
      tipo: "paragrafo",
      texto: "Há um atalho ruim: olhar um vídeo de console e concluir a placa de PC. O console não publica a peça equivalente, e a Rockstar não publicou requisito. A [checagem do Yahoo em 15 de novembro de 2026](https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html) ainda não achou data de PC, pré-venda nem ficha. Sem ficha, o atalho é chute com capa de comparação.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que a Steam de setembro realmente mede",
    },
    {
      tipo: "paragrafo",
      texto: "A pesquisa de hardware da Steam de setembro de 2026, já comentada no [artigo da loja](/blog/steam-setembro-2026-vram-16gb), mostra placas de 16 GB de VRAM em 27,21% dos PCs e placas de 8 GB em 26,71%. Na mesma amostra, Full HD está em 47,91% e 1440p em 27,04%. São fatias do parque da Steam, não o mínimo de GTA 6.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/placa-de-video-para-gta-6-vram.webp",
        alt: "Barras da pesquisa Steam de setembro de 2026 com 27,21 por cento em 16 GB e 26,71 por cento em 8 GB de VRAM",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "16 GB e 8 GB estão quase empatados. O gráfico descreve PCs que já jogam, não o que GTA 6 exige.",
    },
    {
      tipo: "paragrafo",
      texto: "A leitura útil é modesta. Memória de 16 GB já é tão comum quanto a de 8 GB entre quem joga na plataforma, e a tela mais comum continua sendo Full HD. Estúdios olham para esse parque quando ajustam textura dos jogos atuais. Isso não autoriza a frase “GTA 6 pede 16 GB”. Autoriza a frase “seu monitor e seus jogos de hoje cabem em quanto”.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Parque instalado não é exigência",
    },
    {
      tipo: "paragrafo",
      texto: "Uma pesquisa de hardware conta máquinas que aceitaram participar. Ela não mede venda da semana e não recebe um documento da Rockstar. Se amanhã a fatia de 16 GB subir, o jogo de PC de GTA 6 continua sem número até alguém da empresa publicar. Use o gráfico para se localizar no parque. Não use para preencher uma ficha em branco.",
    },
    {
      tipo: "destaque",
      tom: "nota",
      titulo: "O percentual não é requisito",
      texto: "27,21% e 26,71% descrevem PCs na Steam em setembro de 2026. Eles não dizem quanta memória de vídeo GTA 6 vai usar, porque essa versão de PC não foi anunciada até 19 de novembro de 2026.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "A lição da RTX 5060 Ti fica nos jogos atuais",
    },
    {
      tipo: "paragrafo",
      texto: "A [comparação entre a RTX 5060 Ti de 8 GB e a de 16 GB](/blog/rtx-5060-ti-8gb-ou-16gb) serve aqui como aula de jogo que já existe. As duas versões dividem o chip, e a memória é o que separa. Em Full HD, com ajuste moderado, 8 GB costumam acompanhar. Quando a tela sobe ou a textura vai ao máximo, a de menos memória fica sem espaço.",
    },
    {
      tipo: "tabela",
      titulo: "O que a lição atual permite decidir",
      colunas: [
        "Situação de hoje",
        "O que observar",
        "O que não concluir",
      ],
      linhas: [
        [
          "Full HD e ajuste moderado",
          "8 GB ainda acompanham vários jogos",
          "Que GTA 6 cabe em 8 GB",
        ],
        [
          "Quad HD ou textura no alto",
          "16 GB seguram o que 8 GB esgotam",
          "Que 16 GB são a ficha oficial",
        ],
        [
          "Steam, setembro de 2026",
          "16 GB em 27,21% e 8 GB em 26,71%",
          "Que o parque é o requisito",
        ],
        [
          "PC sem anúncio",
          "Não há placa “de GTA 6”",
          "Escolher um modelo pelo nome do jogo",
        ],
      ],
      colunaDestaque: 1,
      fonte: STEAM,
      nota: "Percentuais da pesquisa de setembro de 2026. A coluna da direita é a conclusão que a fonte não autoriza.",
    },
    {
      tipo: "paragrafo",
      texto: "Essa aula não migra para GTA 6. O jogo não está na tabela de testes dessa comparação, e não poderia estar: não há versão de PC com requisito para encaixar numa bancada. Quem transformar aqueles resultados em “placa recomendada para GTA 6” muda o assunto no meio da frase. O assunto era jogo atual.",
    },
    {
      tipo: "chamada",
      tema: "placas-de-video",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Fonte, gabinete e conector entram juntos",
    },
    {
      tipo: "paragrafo",
      texto: "A placa que a sua tela pede ainda tem de caber e de ligar. Comprimento, slots e conector variam na mesma família de chip. A fonte precisa de folga e do cabo certo, não de um número de jogo sem ficha. A categoria de [fontes](/categoria/hardware-fontes) e a de [placas de vídeo](/categoria/hardware-placa-de-video-vga) cruzam as duas peças.",
    },
    {
      tipo: "paragrafo",
      texto: "Gabinete apertado e fonte no limite são o tipo de erro que aparece na primeira semana, nos jogos que você já tem. Não aparece numa lista de GTA 6. Se a fonte atual foi dimensionada para uma placa antiga, a troca da placa puxa a fonte junto. Ignorar isso e falar só em gigabytes de VRAM é decidir metade da máquina.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Quando a placa atual ainda serve",
    },
    {
      tipo: "paragrafo",
      texto: "A placa atual serve quando os jogos que você abre, na sua resolução e no ajuste que você aceita, rodam sem a memória de vídeo estourar. Trocar agora para chegar “preparada no GTA 6” antecipa uma ficha que não existe. Espere saber o que a tela, se mudar, vai pedir.",
    },
    {
      tipo: "paragrafo",
      texto: "A placa pede troca quando o limite já está nos jogos de hoje: Quad HD com ajuste que você quer e uma placa que só segura Full HD, ou 8 GB esgotados nas texturas que você já usa. A referência de PC inteiro, sem transformar isso em requisito, está em [PC para GTA 6](/blog/pc-para-gta-6-sem-requisito-oficial). A decisão continua sendo a sessão desta semana.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "A placa fica amarrada à tela e aos jogos que você já abre",
        "8 GB e 16 GB entram com fonte, como lição da Steam e da 5060 Ti",
        "Fonte, cabo e gabinete entram na mesma decisão da placa",
      ],
      contras: [
        "Nenhuma linha desta página diz qual placa GTA 6 vai exigir",
        "Quad HD de hoje pode pedir troca mesmo sem o jogo novo",
        "Uma pesquisa de parque não vira mínimo oficial no mês seguinte",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Antes de levar a placa",
    },
    {
      tipo: "paragrafo",
      texto: "Leve o modelo da fonte, o tamanho do gabinete e a resolução do monitor à Balão da Informática Anchieta, Av. Anchieta, 789, Cambuí, Campinas, ou chame no WhatsApp (19) 98751-0267. Com esses três dados a equipe vê se a placa dos seus jogos de hoje cabe na máquina que você já tem.",
    },
    {
      tipo: "paragrafo",
      texto: "Não há, até 19 de novembro de 2026, uma placa para separar da prateleira com o nome de GTA 6. Se alguém oferecer nesse rótulo, peça a página da Rockstar. A decisão é escolher a placa pela resolução e pelos jogos que você já roda, e tratar 8 ou 16 GB como lição de jogo atual.",
    },
    {
      tipo: "chamada",
      titulo: "A placa é para qual tela?",
      texto: "Diga a resolução e dois jogos que você abre toda semana. A indicação sai desses dois dados, não de um requisito que a Rockstar não publicou.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "Qual placa de vídeo roda GTA 6?",
      resposta: "Nenhuma foi anunciada para isso. Até 19 de novembro de 2026 não havia versão de PC nem requisito. A placa se escolhe pela resolução e pelos jogos que você já joga. Chamar um modelo de placa de GTA 6 é chute.",
    },
    {
      pergunta: "8 GB de VRAM vão bastar para GTA 6?",
      resposta: "Não há como saber pela ficha, porque a ficha não existe. Em jogos atuais, 8 GB acompanham Full HD com ajuste moderado e ficam curtos quando a tela ou a textura sobem. Essa lição está na comparação da RTX 5060 Ti e não migra para GTA 6.",
    },
    {
      pergunta: "A pesquisa da Steam diz o que o jogo exige?",
      resposta: "Não. Em setembro de 2026, 16 GB de VRAM estavam em 27,21% dos PCs e 8 GB em 26,71%. É uma foto do parque da Steam. Não é mínimo, recomendado nem ideal de um jogo cuja versão de PC não foi anunciada.",
    },
    {
      pergunta: "A RTX 5060 Ti de 16 GB é a placa de GTA 6?",
      resposta: "Não. A comparação de 8 GB e 16 GB mostra como a memória se comporta em jogos que já existem, com o mesmo chip. GTA 6 não entra nessa tabela. Usar o nome do jogo na conclusão troca o assunto.",
    },
  ],
  fontes: [
    ROCKSTARVI,
    YAHOOPC,
    STEAM,
  ],
};

export default artigo;
