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

const artigo: Artigo = {
  slug: "perifericos-para-gta-6",
  titulo: "Periféricos para GTA 6: mouse, teclado e headset",
  resumo: "Mouse, teclado e headset não fazem o jogo rodar. Veja o que melhora a sessão de hoje e por que nenhuma marca é obrigatória.",
  categoria: "hardware",
  etiquetas: [
    "GTA 6",
    "Periféricos",
    "Mouse",
  ],
  capa: {
    src: "/blog/capas/perifericos-para-gta-6.webp",
    alt: "Capa com mouse, teclado e headset como peças de sessão, sem marca obrigatória e sem fazer o jogo rodar",
    largura: 1536,
    altura: 1024,
    pronta: true,
  },
  publicadoEm: "2026-11-12T12:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "Periféricos para GTA 6: mouse, teclado, headset",
    palavrasChave: [
      "periféricos para gta 6",
      "mouse para jogar",
      "teclado para jogo",
      "headset para jogo",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "Periférico para GTA 6 no PC esbarra no mesmo muro das outras peças: até 19 de novembro de 2026 não havia versão de computador anunciada. Mouse, teclado e headset não derrubam esse muro. Eles não instalam o jogo, não desenham o quadro e não criam um requisito. Servem para outra coisa, menor e mais honesta: a sessão que você já tem deixar de incomodar.",
    },
    {
      tipo: "paragrafo",
      texto: "A peça certa é a que resolve um incômodo observável. Mouse com sensor decente, teclado que você aguenta por horas, headset se a sala é barulhenta. Nenhuma marca é obrigatória. Quem vende um modelo como “o de GTA 6” está emprestando um nome de jogo a um conforto que você pode testar na mão, sem ficha oficial. A [página da Rockstar](https://www.rockstargames.com/VI) não lista periférico de PC.",
    },
    {
      tipo: "resumo",
      itens: [
        "**Periférico não faz o jogo rodar.** Placa, processador, memória e disco é que sustentam a sessão.",
        "**Mouse pede sensor estável.** O formato tem de caber na sua mão, não numa lista de marca.",
        "**Teclado pede horas.** Mecânico ou membrana é conforto, não requisito de jogo.",
        "**Headset pede sala.** Se o ambiente é quieto, o fone é opção. Se não é, ele vira ferramenta.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Periférico não liga o jogo",
    },
    {
      tipo: "paragrafo",
      texto: "Um mouse novo não compensa placa sem folga, nem teclado novo abre um jogo que está num HD lotado. A ordem de gasto, quando o orçamento é um só, começa pela máquina que roda os jogos de hoje. O guia de [PC sem requisito](/blog/pc-para-gta-6-sem-requisito-oficial) fica antes desta página de propósito. Periférico entra depois, no ponto em que a sessão já roda e ainda incomoda.",
    },
    {
      tipo: "paragrafo",
      texto: "Isso também corta o atalho do controle. No console, GTA 6 será jogado com o controle da plataforma. Nada disso foi publicado como esquema de PC, porque o PC não foi anunciado. Comprar controle “oficial de PC para GTA 6” repete o chute das outras peças. A [checagem do Yahoo](https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html), em 15 de novembro de 2026, não achou essa versão.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/perifericos-para-gta-6-pecas.webp",
        alt: "Quatro cartões de periférico: mouse com sensor decente, teclado para horas, headset para sala barulhenta e o que não faz o jogo rodar",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Sensor, tecla e fone mudam como você joga. Nenhum deles publica uma versão de PC que não existe.",
    },
    {
      tipo: "paragrafo",
      texto: "Dá para jogar mundo aberto com mouse e teclado ou com controle no computador, nos jogos que já existem. A escolha é sua mão, não uma norma. Se você passa horas num controle e odeia teclado, o controle genérico que você já usa nos outros jogos continua válido. Ele não precisa de um selo com o nome de um jogo sem versão de PC.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Mouse: sensor decente e a sua mão",
    },
    {
      tipo: "paragrafo",
      texto: "Sensor decente é o que acompanha o movimento sem acelerar sozinho e sem travar no meio do pano. Aceleração escondida, aquela que muda a distância conforme a velocidade da mão, atrapalha a mira nos jogos em que a mira importa. Para mundo aberto, o mesmo sensor evita o cursor que foge no mapa. Não há um DPI obrigatório. Há um sensor que não mente e uma mão que não cansa.",
    },
    {
      tipo: "paragrafo",
      texto: "Peso, formato e o lado dos botões são prova de mão, não de tabela. Mouse leve demais para quem segura firme, ou largo demais para quem tem a mão pequena, vira incômodo na segunda hora. Por isso a escolha acontece com a mão em cima, não pelo ranking de um jogo que ainda não tem PC. A categoria de [PC gamer](/categoria/computadores-pc-pc-gamer) é a máquina; o mouse só aponta dentro dela.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Tecla macia ou mecânica é conforto",
    },
    {
      tipo: "paragrafo",
      texto: "Teclado mecânico faz barulho e tem curso que muita gente prefere em sessão longa. Membrana é mais quieta e, para outras pessoas, menos cansativa. Nenhum dos dois faz o jogo rodar melhor. Se você escreve e joga na mesma mesa, o ruído da tecla também é decisão de casa, não de GTA 6. Aguentar horas é o critério. A marca na caixa não é.",
    },
    {
      tipo: "destaque",
      tom: "atencao",
      titulo: "Marca não é requisito",
      texto: "Não existe mouse, teclado ou headset oficial de GTA 6 no PC. Até 19 de novembro de 2026 a versão de computador não foi anunciada. O que existe é a peça que a sua sessão de hoje aguenta.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Teclado para horas, não para a caixa",
    },
    {
      tipo: "paragrafo",
      texto: "Tecla baixa de notebook e tecla de desktop não cansam do mesmo jeito, e o pulso acusa antes do jogo. Um teclado com luz e sem conforto perde de um teclado sem luz que você esquece que está usando. A matéria de [monitor](/blog/monitor-para-gta-6) trata a distância da tela, que é a outra metade da postura.",
    },
    {
      tipo: "tabela",
      titulo: "O que observar e o que ignorar",
      colunas: [
        "Peça",
        "Vale observar",
        "Dá para ignorar",
      ],
      linhas: [
        [
          "Mouse",
          "Sensor estável e formato na mão",
          "Marca dita como obrigatória",
        ],
        [
          "Teclado",
          "Conforto por várias horas",
          "Tecla “de GTA” ou luz extra",
        ],
        [
          "Headset",
          "Isolar sala barulhenta",
          "Achar que o fone faz o jogo rodar",
        ],
        [
          "Controle",
          "O que você já usa nos outros jogos",
          "Selo oficial de um PC não anunciado",
        ],
      ],
      colunaDestaque: 1,
      fonte: ROCKSTARVI,
      nota: "A página do jogo, em 19 de novembro de 2026, não lista periférico de PC.",
    },
    {
      tipo: "paragrafo",
      texto: "Layout com teclado numérico ajuda quem usa o computador para além do jogo. Layout compacto libera pano para o mouse. As duas escolhas são de mesa. Nenhuma está numa ficha de GTA 6, e não estará enquanto a Rockstar não publicar versão de PC. Até lá, o teclado que você já aguenta horas não precisa ser trocado por causa de um nome.",
    },
    {
      tipo: "chamada",
      tema: "notebooks",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Headset se a sala não deixa ouvir",
    },
    {
      tipo: "paragrafo",
      texto: "Headset fechado isola a sala. Headset aberto deixa você ouvir a casa. Se o ambiente é quieto, a caixa de som pode bastar. Se há gente, televisão ou rua, o fone deixa de ser enfeite e passa a ser a condição para ouvir o jogo. É condição da sala, não requisito do título.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/perifericos-para-gta-6-ordem.webp",
        alt: "Fluxo em quatro passos: acertar a máquina, apontar o incômodo, trocar só essa peça e ignorar marca obrigatória",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Primeiro o computador que roda os jogos de hoje. Depois, só a peça que hoje atrapalha a sessão.",
    },
    {
      tipo: "paragrafo",
      texto: "Microfone entra na mesma peça quando você fala com outras pessoas enquanto joga. Um microfone que só capta o ventilador da máquina atrapalha mais do que a falta de luz no teclado. Dá para perceber isso numa chamada de um minuto. Não dá para perceber numa caixa que promete “som de GTA 6”, porque esse som de PC não foi especificado.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "No notebook a peça já vem grudada",
    },
    {
      tipo: "paragrafo",
      texto: "No notebook, o teclado, o trackpad e os alto-falantes já vieram. Se o trackpad perde o cursor e o teclado cansa na primeira hora, mouse e teclado externos mudam a sessão sem trocar a máquina. A tela, porém, continua sendo a do notebook, e é ela que limita a placa. A página de [notebooks](/notebooks) serve para ver o conjunto. O periférico não transforma vídeo integrado em placa dedicada.",
    },
    {
      tipo: "paragrafo",
      texto: "Alto-falante pequeno em quarto barulhento é o caso clássico do headset, no notebook e no desktop. A [manutenção](/manutencao) entra só quando a tecla falha ou o conector do fone não responde: aí é defeito, não upgrade. Defeito não se resolve com uma marca “de GTA 6”. Resolve com o conserto da peça que quebrou. O jogo, sem versão de PC, continua fora dessa ordem de serviço.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "O gasto fica na peça que hoje incomoda, não num kit com nome de jogo",
        "Sensor, conforto e sala são critérios que você confere na hora",
        "Nenhuma marca entra como obrigatória",
      ],
      contras: [
        "Periférico não faz um jogo sem versão de PC rodar",
        "Controle de console não vira esquema oficial de computador",
        "Notebook com vídeo integrado não muda porque o mouse é novo",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Antes de completar a mesa",
    },
    {
      tipo: "paragrafo",
      texto: "Mouse, teclado e headset você experimenta na mão. A Balão da Informática Anchieta recebe na Av. Anchieta, 789, no Cambuí, em Campinas, e responde no WhatsApp (19) 98751-0267. Leve o que você usa hoje, se a dúvida for troca, e diga o que cansou: mira, tecla ou barulho.",
    },
    {
      tipo: "paragrafo",
      texto: "Se a máquina ainda não roda os jogos que você já tem, o periférico espera. A decisão é acertar o computador primeiro e completar a mesa só no ponto que hoje atrapalha a sessão, sem marca obrigatória e sem chamar a peça de equipamento de GTA 6.",
    },
    {
      tipo: "chamada",
      titulo: "O que incomoda: mira, tecla ou barulho?",
      texto: "Diga qual dos três cansa na sessão atual. A peça indicada resolve esse ponto, e não um jogo que ainda não tem versão de PC.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "Qual mouse é obrigatório para GTA 6?",
      resposta: "Nenhum. Até 19 de novembro de 2026 não havia versão de PC nem lista de periférico. O que importa num mouse, para os jogos de hoje, é sensor estável e formato que a sua mão aguenta. Marca obrigatória não existe.",
    },
    {
      pergunta: "Teclado mecânico é necessário?",
      resposta: "Não. Mecânico e membrana cansam pessoas diferentes, e o critério é aguentar horas. O teclado não faz o jogo rodar. Se você já passa a sessão sem notar a tecla, trocar por causa de GTA 6 não melhora nada.",
    },
    {
      pergunta: "Headset faz o jogo ficar melhor?",
      resposta: "Faz a sala ficar de fora, quando a sala compete com o som. Em ambiente quieto, a caixa pode bastar. O fone não instala o jogo e não substitui placa, memória ou SSD. Também não há headset oficial de GTA 6 para PC.",
    },
    {
      pergunta: "No notebook, o que trocar primeiro?",
      resposta: "Se o trackpad e o teclado cansam, mouse e teclado externos mudam a sessão. A tela e a placa do notebook continuam as mesmas. Periférico não converte vídeo integrado em placa dedicada, nem cria uma versão de PC de GTA 6.",
    },
  ],
  fontes: [
    ROCKSTARVI,
    YAHOOPC,
  ],
};

export default artigo;
