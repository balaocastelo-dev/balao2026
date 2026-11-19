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
  slug: "pc-gamer-alto-desempenho-gta-6",
  titulo: "PC gamer de alto desempenho para mundo aberto",
  resumo: "A faixa alta junta placa forte, 32 GB, SSD rápido e folga para capturar. Não é a configuração de GTA 6: o PC ainda não tem requisito.",
  categoria: "guias",
  etiquetas: [
    "GTA 6",
    "Alto desempenho",
    "Captura",
    "PC gamer",
  ],
  capa: {
    src: "/blog/capas/pc-gamer-alto-desempenho-gta-6.webp",
    alt: "Gabinete aberto sobre uma mesa, pronto para montagem.",
    largura: 1536,
    altura: 1024,
    pronta: false,
  },
  publicadoEm: "2026-11-11T12:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "PC de alto desempenho para mundo aberto",
    palavrasChave: [
      "pc gamer alto desempenho",
      "pc forte para mundo aberto",
      "pc para gravar gameplay",
      "32 gb ram pc gamer",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "Alto desempenho, neste guia, é folga de verdade: placa forte, 32 GB de memória, SSD rápido e margem para capturar vídeo enquanto o jogo está aberto. Serve para mundo aberto que você já joga e, se for o caso, para gravar essa sessão. Não é a configuração de GTA 6. Essa configuração não foi escrita.",
    },
    {
      tipo: "paragrafo",
      texto: "Até 19 de novembro de 2026 a [página do jogo](https://www.rockstargames.com/VI) listava console. O [Yahoo](https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html), em 15 de novembro, registrou a ausência de data de PC, de pré-venda e de requisito. Comprar a faixa alta “para chegar primeiro” no GTA é pagar folga por um número que a Rockstar ainda não escolheu.",
    },
    {
      tipo: "resumo",
      itens: [
        "**A faixa alta é placa forte, 32 GB, SSD rápido e folga para capturar.** O uso é o de hoje.",
        "**Ela fica acima do Quad HD com folga de VRAM.** Esse patamar é a faixa intermediária.",
        "**Gravar e jogar ao mesmo tempo pesa mais do que só jogar.** A folga existe para essa segunda tarefa.",
        "**GTA 6 no PC segue sem ficha.** O dia 19 de novembro de 2026 é de console.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que a faixa alta coloca na mesa",
    },
    {
      tipo: "paragrafo",
      texto: "Placa forte, aqui, não é um modelo com nome de prateleira. É uma placa com margem acima do que a tela Quad HD já pede nos seus jogos atuais, sobrando processamento gráfico para a captura. Os 32 GB de RAM entram porque jogo e gravação dividem a mesma memória. O SSD rápido encurta a carga do mapa que você abre toda sessão.",
    },
    {
      tipo: "paragrafo",
      texto: "A [faixa intermediária](/blog/pc-gamer-intermediario-para-gta-6) para antes disso: folga de VRAM e monitor Quad HD, sem exigir 32 GB nem captura. A entrada para ainda antes, no Full HD, com placa dedicada recente, 16 GB de RAM e SSD. Se o seu uso cabe numa dessas duas, a faixa alta é excesso, não preparação.",
    },
    {
      tipo: "tabela",
      titulo: "O que a faixa alta inclui",
      colunas: [
        "Item",
        "Função no uso de hoje",
        "O que não é",
      ],
      linhas: [
        [
          "Placa forte",
          "Folga gráfica acima do Quad HD",
          "Modelo oficial de GTA 6",
        ],
        [
          "32 GB de RAM",
          "Jogo e captura na mesma memória",
          "Mínimo publicado do jogo",
        ],
        [
          "SSD rápido",
          "Menos espera para abrir o mapa",
          "Cota copiada do console",
        ],
        [
          "Captura",
          "Margem para gravar enquanto joga",
          "Requisito de computador",
        ],
      ],
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/pc-gamer-alto-desempenho-gta-6-camadas-alta.webp",
        alt: "Gabinete branco aberto no balcão, com a lateral de acrílico.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Gabinete branco aberto no balcão, com a lateral de acrílico. Foto da loja, na Av. Anchieta, 789, Cambuí.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Para quem essa folga se justifica",
    },
    {
      tipo: "paragrafo",
      texto: "A faixa alta se justifica quando você já sente o limite: joga em Quad HD, mantém outros programas abertos e ainda grava ou transmite. Também se justifica quando o mundo aberto que você joga hoje enche a memória e o disco lento segura a viagem pelo mapa. O sintoma é do seu uso, não de um trailer.",
    },
    {
      tipo: "paragrafo",
      texto: "Se você joga em Full HD, não grava e não deixa dezenas de abas junto do jogo, a descrição é a faixa de entrada. Se a tela é Quad HD e você não captura, a descrição é a intermediária. Subir de nome sem subir de tarefa não deixa o computador mais perto de um jogo sem versão de PC. Deixa a máquina maior do que a rotina.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Capturar vídeo pede máquina além do jogo",
    },
    {
      tipo: "paragrafo",
      texto: "Gravar a tela ou transmitir ao vivo é uma segunda carga. O jogo desenha o quadro. Outro trecho da máquina comprime esse quadro em vídeo. As duas coisas acontecem juntas. Por isso a faixa alta fala em folga para capturar, e não só em “placa boa para jogar”. O detalhe da live, com codificador e cenas, está no guia de [PC para live](/blog/pc-para-live-de-gta-6).",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Gravar não transforma a faixa em ficha",
    },
    {
      tipo: "paragrafo",
      texto: "Ter margem para capturar os jogos de hoje não significa que a mesma margem cobre GTA 6. O jogo de PC não tem requisito, então não há como medir a sobra. Você dimensiona a captura para o que já vai ao ar. Quando a Rockstar publicar números, a conta se refaz. Até lá, a faixa alta é honesta só se o seu uso atual já pede essa folga.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/pc-gamer-alto-desempenho-gta-6-mesa.webp",
        alt: "Mesa com gabinete, monitor curvo e caixas de som.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Mesa com gabinete, monitor curvo e caixas de som. Foto de Minh Phuc (Pexels).",
    },
    {
      tipo: "destaque",
      tom: "nota",
      titulo: "Captura é uso, não previsão",
      texto: "32 GB e placa forte entram quando você joga e grava ao mesmo tempo hoje. Não entram como tradução de um console, nem como recomendado de um PC que a Rockstar não anunciou.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Fonte, calor e gabinete entram antes do desejo",
    },
    {
      tipo: "paragrafo",
      texto: "Placa forte puxa mais energia e sopra mais calor. A fonte precisa ter folga e conector compatível. O gabinete precisa de espaço para o comprimento da placa e de ar que saia de verdade. Sem esses dois, a placa forte existe na caixa e perde o fôlego dentro do computador. A compatibilidade decide antes da vontade de estar na faixa alta.",
    },
    {
      tipo: "paragrafo",
      texto: "Memória de vídeo também entra nessa conta, sem virar ficha de GTA 6. O parque medido pela Steam em setembro de 2026 está no texto de [16 GB e 8 GB](/blog/steam-setembro-2026-vram-16gb): 27,21% e 26,71%. A comparação dentro de uma família de placa está no texto da [RTX 5060 Ti](/blog/rtx-5060-ti-8gb-ou-16gb). São referências de compra atual. O Full HD ainda era 47,91% das telas, e o Quad HD, 27,04%.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que continua sem página oficial",
    },
    {
      tipo: "paragrafo",
      texto: "Nada nesta faixa antecipa o dia 19 de novembro de 2026 no computador. Esse dia, no comunicado da Rockstar, é de PlayStation 5 e Xbox Series. O guia de [PC sem requisito oficial](/blog/pc-para-gta-6-sem-requisito-oficial) é o lugar para a decisão que já dá para tomar. A série completa fica em [GTA 6](/blog/gta-6). Alto desempenho não fura essa fila.",
    },
    {
      tipo: "paragrafo",
      texto: "Também não há quadro por segundo para prometer. Qualquer número de fluidez atribuído a GTA 6 no PC seria invenção, porque o jogo de computador não foi anunciado e não foi medido. A faixa alta descreve folga de peça e de tarefa. Não descreve um resultado de teste que ninguém publicou para esse jogo.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/pc-gamer-alto-desempenho-gta-6-fecho.webp",
        alt: "Gabinete branco com ventoinhas coloridas, sobre o balcão da loja.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Gabinete branco com ventoinhas coloridas, sobre o balcão da loja. Foto da loja, na Av. Anchieta, 789, Cambuí.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "A folga fica nomeada: placa forte, 32 GB, SSD rápido e margem para capturar, cada item com uma função",
        "Quem só joga em Full HD consegue ver que esta faixa não é a próxima obrigação",
        "Fonte, calor e espaço do gabinete entram antes da placa, então o desejo não pula a compatibilidade",
      ],
      contras: [
        "Sem ficha de PC, ninguém sabe se a faixa alta será justa, curta ou larga para GTA 6",
        "Placa forte em gabinete fechado e fonte no limite desperdiça a folga que o nome promete",
        "Capturar vídeo pede configuração à parte, e este texto não substitui o guia da live",
      ],
    },
    {
      tipo: "chamada",
      tema: "pc-gamer",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Quando o pedido é a faixa alta",
    },
    {
      tipo: "paragrafo",
      texto: "Na Balão da Informática Anchieta, Av. Anchieta, 789, Cambuí, Campinas-SP, a faixa alta só entra se você descreve captura, Quad HD ou um mundo aberto que já aperta a máquina atual. A máquina aparece ligada antes do pagamento. A assistência técnica fica no mesmo endereço, se a fonte ou o calor forem o limite de verdade.",
    },
    {
      tipo: "paragrafo",
      texto: "Chame no WhatsApp (19) 98751-0267 e diga se você grava enquanto joga. O orçamento é o do dia, porque o preço muda. A equipe não entrega essa máquina como “o PC do GTA 6”. Entrega a folga do uso que você já tem, com a máquina acesa na sua frente.",
    },
    {
      tipo: "chamada",
      titulo: "A faixa alta é para o uso que você já tem?",
      texto: "Conte se você grava enquanto joga e qual é o monitor. A máquina sai para esse uso, e você a vê ligada.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "PC de alto desempenho roda GTA 6?",
      resposta: "Não dá para afirmar. A faixa alta deste guia é placa forte, 32 GB, SSD rápido e folga para capturar os jogos de hoje. Até 19 de novembro de 2026 não havia versão de PC nem requisito publicado pela Rockstar.",
    },
    {
      pergunta: "Preciso de 32 GB para jogar em Quad HD?",
      resposta: "Quad HD com folga de VRAM é o critério da faixa intermediária, que não exige 32 GB. Os 32 GB entram na faixa alta quando o jogo divide a memória com captura ou com muitos programas abertos. Se você só joga, a conta pode parar antes.",
    },
    {
      pergunta: "A faixa alta serve para transmitir?",
      resposta: "Ela reserva folga para capturar vídeo além do jogo. O que a live pede de codificador, cena e áudio está no guia de PC para live. Sem o jogo de PC de GTA 6, essa folga vale para o que você já transmite.",
    },
    {
      pergunta: "Posso montar a faixa alta num gabinete antigo?",
      resposta: "Só se a fonte aguenta a placa, o conector existe e o comprimento cabe com ar para sair. Gabinete apertado e fonte no limite anulam a folga. A compatibilidade vem antes do nome da faixa.",
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
