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

const ROCKSTARDATA: Fonte = {
  nome: "Rockstar Games — “Grand Theft Auto VI is Now Set to Launch November 19, 2026”",
  url: "https://www.rockstargames.com/newswire/article/ak3ak31a49a221/grand-theft-auto-vi-is-now-set-to-launch-november-19-2026",
  data: "6 de novembro de 2025",
};

const artigo: Artigo = {
  slug: "montagem-pc-gamer-campinas",
  titulo: "Montagem de PC gamer em Campinas para quem espera",
  resumo: "A montagem em Campinas usa o monitor e os jogos que você já tem. Sem requisito de GTA 6, a lista de peças não copia uma ficha que não existe.",
  categoria: "guias",
  etiquetas: [
    "GTA 6",
    "Campinas",
    "Montagem",
    "PC gamer",
  ],
  capa: {
    src: "/blog/capas/montagem-pc-gamer-campinas.webp",
    alt: "Capa da montagem de PC gamer em Campinas com quatro dados do uso atual e sem lista oficial de GTA 6",
    largura: 1536,
    altura: 1024,
    pronta: true,
  },
  publicadoEm: "2026-11-10T12:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "Montagem de PC gamer em Campinas, sem chute",
    palavrasChave: [
      "montagem de pc gamer campinas",
      "montar pc em campinas",
      "montagem de computador gamer",
      "pc gamer sob medida campinas",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "Montar um PC gamer em Campinas, enquanto você espera GTA 6 no computador, só fica honesto se a lista sair dos jogos que você já roda. A versão de PC não foi anunciada até 19 de novembro de 2026, e requisito oficial não existe. Qualquer montagem “já no padrão do GTA” é chute com aparência de plano.",
    },
    {
      tipo: "paragrafo",
      texto: "A espera, aqui, é real: o console tem data, 19 de novembro de 2026, e o computador não tem. Quem mora em Campinas e quer uma máquina nova nesse intervalo monta para o monitor, para a biblioteca atual e, se for o caso, para gravar. O jogo futuro fica de fora da lista até a Rockstar escrever a ficha.",
    },
    {
      tipo: "resumo",
      itens: [
        "**A montagem começa pela tela e pelos jogos de hoje.** Sem isso, a peça não tem critério.",
        "**GTA 6 não entra na lista.** Não há versão de PC nem requisito para copiar.",
        "**Fonte, gabinete e placa-mãe cortam o que não cabe.** Compatibilidade vem antes do desejo.",
        "**A lista se explica pelos jogos de hoje.** Não há frase de GTA 6 para cumprir.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que a montagem em Campinas usa como base",
    },
    {
      tipo: "paragrafo",
      texto: "A base é local no atendimento e geral no critério. Você está em Campinas e quer ver a máquina. O critério, porém, não é um mapa da cidade: é Full HD ou Quad HD, placa dedicada recente na entrada, folga de VRAM no meio, placa forte com 32 GB e captura na faixa alta. Esses nomes estão nos guias de [entrada](/blog/pc-gamer-entrada-para-gta-6), [meio](/blog/pc-gamer-intermediario-para-gta-6) e [alta](/blog/pc-gamer-alto-desempenho-gta-6).",
    },
    {
      tipo: "paragrafo",
      texto: "A [página da Rockstar](https://www.rockstargames.com/VI) não entrega um quarto nome. O [Yahoo](https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html) também não achou a lista em 15 de novembro de 2026. Por isso a montagem em Campinas não tem “kit GTA”. Tem kit do seu uso. A diferença parece pequena na conversa e é a diferença entre critério e adivinhação.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Quais dados você precisa levar",
    },
    {
      tipo: "paragrafo",
      texto: "Quatro dados bastam para a lista deixar de ser genérica. A resolução do monitor. Dois ou três jogos que você considera pesados hoje. Se a máquina também vai gravar ou transmitir. Se já existe um gabinete ou uma fonte que você pretende reaproveitar. Com isso, a montagem escolhe faixa e corta peça incompatível. Sem isso, sobra catálogo.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/montagem-pc-gamer-campinas-passos-montagem.webp",
        alt: "Fluxo da montagem: dizer a tela, listar os jogos, checar compatibilidade e ver a máquina ligada",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Sem tela e sem jogos, a lista de peças não tem de onde sair.",
    },
    {
      tipo: "tabela",
      titulo: "O que você leva para a montagem",
      colunas: [
        "Dado",
        "Para que serve",
        "Se faltar",
      ],
      linhas: [
        [
          "Resolução do monitor",
          "Separa Full HD e Quad HD",
          "A faixa fica sem critério",
        ],
        [
          "Jogos pesados de hoje",
          "Mede a carga que você já tem",
          "A lista vira catálogo",
        ],
        [
          "Grava ou transmite",
          "Diz se a captura entra",
          "A faixa alta fica sem motivo",
        ],
        [
          "Peça reaproveitada",
          "Fonte, gabinete ou placa-mãe",
          "A peça nova pode não caber",
        ],
      ],
    },
    {
      tipo: "paragrafo",
      texto: "O texto [qual PC gamer](/qual-pc-gamer) ajuda a nomear o uso antes de chegar nas peças. A página de [montagem](/montagempc) é o serviço. A categoria de [PCs gamer](/categoria/computadores-pc-pc-gamer) mostra o tipo de máquina pronta. Nenhum desses endereços publica requisito de GTA 6, porque não há de onde copiar.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Onde a compatibilidade corta a lista",
    },
    {
      tipo: "paragrafo",
      texto: "Peça nova em placa-mãe velha é o corte mais comum de quem já tem computador e chama isso de montagem. O soquete do processador, o tipo da memória e a potência da fonte não negociam com o nome do jogo. Se você vai reaproveitar algo, esse algo manda na lista tanto quanto o monitor. Ignorar a peça antiga para “já deixar pronto” produz um computador que não liga.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Monitor primeiro, placa depois",
    },
    {
      tipo: "paragrafo",
      texto: "A placa se escolhe depois da tela, não antes. Full HD com placa dedicada recente, 16 GB de RAM e SSD fecha a entrada. Quad HD pede a folga de VRAM da [pesquisa da Steam](/blog/steam-setembro-2026-vram-16gb) e da [RTX 5060 Ti](/blog/rtx-5060-ti-8gb-ou-16gb). Captura e 32 GB puxam a alta. Começar pela placa mais forte e descobrir a tela no fim inverte a montagem e empurra folga para quem não descreveu esse uso.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/montagem-pc-gamer-campinas-bancada.webp",
        alt: "Bancada de montagem com monitor, lista de jogos, fonte e gabinete como limites da escolha da placa",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "A placa não abre a conversa. A tela e o espaço físico abrem.",
    },
    {
      tipo: "destaque",
      tom: "nota",
      titulo: "Reaproveitar também é compatibilidade",
      texto: "Gabinete apertado e fonte no limite não recebem placa forte porque a cidade é Campinas. O encaixe é físico. Se não cabe, a montagem muda a peça ou muda a caixa.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que fica de fora quando não há requisito",
    },
    {
      tipo: "paragrafo",
      texto: "Fica de fora qualquer linha do tipo “mínimo para GTA 6” e “recomendado para GTA 6”. Fica de fora traduzir console em processador. Fica de fora cravar fluidez do jogo no PC. Nada disso foi medido, porque o jogo de computador não foi anunciado. A montagem que promete esses números está vendendo uma frase, não uma máquina verificável.",
    },
    {
      tipo: "paragrafo",
      texto: "O que fica dentro é verificável. O computador liga. Os jogos que você citou abrem. A tela é a sua. Se você grava, há folga para essa tarefa nos jogos de hoje, não no GTA. O relato de [PC para live](/blog/pc-para-live-de-gta-6) separa essa segunda carga. O de [upgrade](/blog/upgrade-do-pc-antes-do-gta-6) serve se a conversa for troca, não caixa nova.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Como as três faixas entram sem virar preço",
    },
    {
      tipo: "paragrafo",
      texto: "Este texto não traz valor de peça. Preço muda, e o orçamento é o do dia em que você pergunta. As faixas existem para você reconhecer o uso: entrada no Full HD, intermediária no Quad HD com folga de VRAM, alta com placa forte, 32 GB, SSD rápido e captura. Campinas não cria uma quarta faixa. A cidade é onde a máquina é montada e mostrada.",
    },
    {
      tipo: "paragrafo",
      texto: "Quem espera o jogo de console no dia 19 não precisa de montagem para essa data. Precisa do console da lista oficial. Quem espera uma versão de PC que ainda não tem calendário pode montar agora só se o uso atual já justifica. Esperar sentado também é uma decisão válida. Montar por ansiedade não encurta o anúncio da Rockstar.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "A lista nasce do monitor e dos jogos que você citou, então dá para explicar cada peça",
        "Fonte, gabinete e placa-mãe cortam incompatibilidade antes de a caixa fechar",
        "Cada peça da lista tem um uso de hoje, sem uma frase sobre GTA 6 que ninguém pode cumprir",
      ],
      contras: [
        "Sem os quatro dados, a montagem vira catálogo e qualquer faixa parece servir",
        "Reaproveitar peça velha pode impedir a placa que você tinha em mente",
        "Uma ficha futura de PC pode não bater com a máquina montada neste intervalo",
      ],
    },
    {
      tipo: "chamada",
      tema: "montagem",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Ver a máquina ligada no Cambuí",
    },
    {
      tipo: "paragrafo",
      texto: "A montagem da Balão da Informática Anchieta acontece na Av. Anchieta, 789, no Cambuí, em Campinas. O computador sai montado para o uso que você descreveu, e você o vê ligado antes de pagar. A assistência técnica fica nesse mesmo endereço. Não há prazo inventado para “ficar pronto para o GTA”, porque esse pronto não tem ficha.",
    },
    {
      tipo: "paragrafo",
      texto: "Chame no WhatsApp (19) 98751-0267 e mande a resolução da tela e os jogos pesados. O orçamento sai nessa conversa, no preço do dia. Se a peça que você viu em outro lugar não cabe na fonte ou no gabinete, a montagem diz isso antes de fechar. O critério continua sendo o uso, não o nome do jogo que ainda não tem PC.",
    },
    {
      tipo: "chamada",
      titulo: "Vai montar em Campinas sem copiar uma ficha imaginária?",
      texto: "Traga o monitor e a lista dos jogos de hoje. A montagem segue isso, e você vê o computador ligado antes de pagar.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "A montagem em Campinas já deixa o PC pronto para GTA 6?",
      resposta: "Não. Pronto para GTA 6 exigiria requisito, e até 19 de novembro de 2026 a Rockstar não publicou versão de PC. A montagem fica pronta para os jogos e a tela que você informar, e você vê a máquina ligada.",
    },
    {
      pergunta: "Quais informações eu mando antes?",
      resposta: "Resolução do monitor, dois ou três jogos pesados que você já joga, se vai gravar ou transmitir, e se pretende reaproveitar gabinete ou fonte. Com isso a faixa e a compatibilidade têm de onde sair.",
    },
    {
      pergunta: "Posso reaproveitar a fonte antiga?",
      resposta: "Só se ela tem folga e o conector da placa nova. Fonte no limite não sustenta placa forte. O gabinete também precisa ter comprimento e ar. Se não fecha, a montagem troca a fonte ou a caixa, em vez de forçar.",
    },
    {
      pergunta: "A montagem inclui eu ver o computador funcionando?",
      resposta: "Sim. Na Anchieta você vê a máquina ligada antes de pagar. O que aparece nessa demonstração são os jogos do seu uso, não GTA 6, que não tem versão de PC para instalar e mostrar.",
    },
  ],
  fontes: [
    ROCKSTARVI,
    YAHOOPC,
    ROCKSTARDATA,
  ],
};

export default artigo;
