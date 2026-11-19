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
  slug: "setup-de-streamer-para-gta-6",
  titulo: "Setup de streamer para GTA 6: mesa, captura e folga",
  resumo: "Mesa, captura e folga resolvem o setup agora. GTA 6 de PC não foi anunciado até 19 de novembro de 2026, então o canto serve ao jogo que você já transmite.",
  categoria: "guias",
  etiquetas: [
    "GTA 6",
    "Setup",
    "Live",
  ],
  capa: {
    src: "/blog/capas/setup-de-streamer-para-gta-6.webp",
    alt: "Pessoa de headset olhando para o monitor, no escuro.",
    largura: 1536,
    altura: 1024,
    pronta: false,
  },
  publicadoEm: "2026-11-09T12:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "Setup de streamer para GTA 6: mesa e captura",
    palavrasChave: [
      "setup de streamer gta 6",
      "setup para live",
      "captura de jogo",
      "obs studio live",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "Você pode arrumar a mesa para transmitir antes de existir um GTA 6 de computador. Até 19 de novembro de 2026 a [página da Rockstar](https://www.rockstargames.com/VI) não anunciava essa versão: o lançamento está em PlayStation 5 e Xbox Series. Uma checagem de 15 de novembro, republicada no [Yahoo](https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html), também não achou data de PC nem requisito. O canto serve ao jogo que você já abre, com lugar para a captura.",
    },
    {
      tipo: "paragrafo",
      texto: "Setup, neste texto, são três coisas. A mesa é o lugar da tela, do microfone e da câmera. A captura é o programa que junta o jogo com a sua voz. A folga é o que sobra de máquina para esse programa não disputar o processador com o jogo. Cor de luz e marca de cadeira ficam fora dessa conta.",
    },
    {
      tipo: "resumo",
      itens: [
        "**A mesa organiza voz e rosto.** O microfone chega perto da boca e a câmera fica na linha do rosto.",
        "**A captura junta o jogo e você.** O OBS Studio faz isso e é um programa gratuito.",
        "**Folga é máquina sobrando.** O jogo aberto e o programa de live rodam ao mesmo tempo.",
        "**GTA 6 de PC não tem ficha.** Não dá para copiar um requisito que a Rockstar não publicou.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que a mesa precisa sustentar",
    },
    {
      tipo: "paragrafo",
      texto: "A mesa que presta para live deixa o microfone perto da boca e a câmera na altura do rosto, sem roubar o mouse. Você olha para a tela em que joga. Se houver segunda tela, ela fica para o programa de captura. Cabo no caminho da mão faz você esbarrar nele no meio da partida. Fixe o cabo antes de pensar em outro acessório.",
    },
    {
      tipo: "paragrafo",
      texto: "Não existe medida oficial de mesa para GTA 6, porque não existe ficha de PC. Decida pelo alcance do seu braço. O microfone tem de chegar perto da boca, e a câmera tem de ver o rosto sem você se inclinar para fora da cadeira. Se o enquadramento só funciona quando você se entorta, a mesa está mal distribuída. Trocar de marca não corrige o alcance.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/setup-de-streamer-para-gta-6-zonas.webp",
        alt: "Microfone no pedestal, ligado a um notebook.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Microfone no pedestal, ligado a um notebook. Foto de George Milton (Pexels).",
    },
    {
      tipo: "paragrafo",
      texto: "O desenho acima não é lista de compra. São quatro zonas do mesmo canto. A tela fica à frente, a voz no caminho da boca, o rosto na linha da câmera, e a folga fica dentro do gabinete. Essa última zona é a que decide se a captura aguenta a partida. Mudar objeto de lugar sem conferir o alcance só desloca o problema para outro canto da mesa.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Como a captura divide o computador",
    },
    {
      tipo: "paragrafo",
      texto: "O programa gratuito para juntar jogo, voz e câmera é o OBS Studio, no site [obsproject.com](https://obsproject.com/). Uma cena é o arranjo que a pessoa do outro lado vê. Fonte é o jogo, o microfone ou a câmera. Você pode ter uma cena só de jogo e outra com o rosto, e trocar no meio. O caminho dos controles está no guia de [OBS para live de jogo](/blog/obs-para-live-de-jogo).",
    },
    {
      tipo: "paragrafo",
      texto: "O codificador transforma a imagem no que vai ser enviado. Se a placa tem codificador, use o dela, e o processador fica mais livre para o jogo e a voz. Quando a placa não tem, o codificador do processador faz o serviço, e a folga de CPU deixa de ser detalhe. Este texto não publica um número para copiar. Esse valor muda com a internet e com a plataforma.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Cena não é overlay",
    },
    {
      tipo: "paragrafo",
      texto: "Overlay é desenho por cima da imagem: borda, alerta, caixa de conversa. Cena é a organização das fontes. Dá para transmitir com uma cena limpa, só o jogo e a voz inteligível, antes de qualquer desenho. Se o áudio falha, um overlay caprichado não corrige a frase. A ordem prática é fonte de jogo, fonte de microfone, fonte de câmera, e só então o enfeite, se ainda fizer falta.",
    },
    {
      tipo: "tabela",
      titulo: "O que o canto resolve e o que o anúncio não diz",
      colunas: [
        "Zona",
        "Você resolve agora",
        "Ainda sem anúncio",
      ],
      linhas: [
        [
          "Mesa",
          "Alcance da voz e do rosto",
          "Medida oficial de setup",
        ],
        [
          "Captura",
          "Jogo e OBS ao mesmo tempo",
          "Número único de envio",
        ],
        [
          "Folga",
          "Sobra para a captura",
          "Requisito de GTA 6",
        ],
        [
          "Console",
          "PS5 e Xbox Series em 19 nov 2026",
          "Versão de PC",
        ],
      ],
      fonte: ROCKSTARVI,
      nota: "A linha de console segue a página da Rockstar. A checagem de PC republicada no Yahoo é de 15 de novembro de 2026. Não há número de envio nesta tabela.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Onde a folga aparece na prática",
    },
    {
      tipo: "paragrafo",
      texto: "Folga é o que sobra quando o jogo já está aberto. Se o processador fica no limite só com a partida, a captura e a voz não têm para onde ir. Você percebe isso quando a imagem da live engasga e, no seu monitor, a partida ainda parece andando. São duas cargas no mesmo instante. A máquina precisa das duas juntas.",
    },
    {
      tipo: "paragrafo",
      texto: "Memória e disco entram do mesmo jeito, sem quantidade mágica. O jogo ocupa memória. O programa de captura ocupa mais um tanto. Um disco quase cheio atrapalha a gravação local. Não há número oficial para GTA 6, porque o requisito não foi publicado. O guia de [PC para live de GTA 6](/blog/pc-para-live-de-gta-6) separa essa folga da ficha que ainda não existe.",
    },
    {
      tipo: "destaque",
      tom: "atencao",
      titulo: "Sem ficha, sem cópia de console",
      texto: "A página da Rockstar lista PlayStation 5 e Xbox Series. Copiar a peça de um console para o gabinete não cria requisito de GTA 6. A folga que você separa é para o jogo que já roda e para a captura.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que esse canto não antecipa",
    },
    {
      tipo: "paragrafo",
      texto: "A [PlayStation](https://www.playstation.com/en-us/games/grand-theft-auto-vi/) descreve Grand Theft Auto VI como experiência de um jogador, no console em 19 de novembro de 2026. Essa frase não diz como um PC vai se comportar, nem promete modo online no dia. Chamar a mesa de hoje de setup de GTA 6 mistura um canto real com um anúncio que não chegou. Quando a ficha existir, você compara com a máquina que já tem.",
    },
    {
      tipo: "paragrafo",
      texto: "Quem já transmite GTA V, inclusive a cena de RP da comunidade, tem um jogo de computador para ocupar essa mesa. O que essa cena é, e o que ela não é dentro de GTA 6, está em [GTA RP e o que o GTA 6 não é](/blog/gta-rp-e-o-que-o-gta-6-nao-e). Os anúncios da série ficam em [GTA 6 no blog](/blog/gta-6). O buraco do requisito está em [PC para GTA 6](/blog/pc-para-gta-6-sem-requisito-oficial).",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "A ordem para não repetir compra",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/setup-de-streamer-para-gta-6-ordem.webp",
        alt: "Teclado, mouse e controles numa mesa clara.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Teclado, mouse e controles numa mesa clara. Foto de Minh Phuc (Pexels).",
    },
    {
      tipo: "paragrafo",
      texto: "Deixe o jogo que você já joga estável na tela em que você joga. Abra o OBS e monte uma cena com o jogo e o microfone, sem overlay. Ouça se a voz fica inteligível e se a máquina aguenta os dois juntos. Só então pense em câmera e enfeite. A distância da boca muda mais essa prova do que a marca, como explica o [microfone para live](/blog/microfone-para-live-de-jogo).",
    },
    {
      tipo: "paragrafo",
      texto: "Se a prova falha na voz, não é a luz de fundo que resolve. Se falha porque o computador não aguenta jogo e captura, não é um fundo virtual. Você anota qual dos dois aconteceu e leva essa frase para quem for olhar a máquina. A [montagem](/montagempc) começa por esse uso. Um jogo sem versão de PC não vira a primeira linha do pedido.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/setup-de-streamer-para-gta-6-fecho.webp",
        alt: "Notebook, monitor e webcam numa mesa clara.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Notebook, monitor e webcam numa mesa clara. Foto de Ella Wei (Pexels).",
    },
    {
      tipo: "pros-contras",
      pros: [
        "A mesa, a captura e a folga viram três decisões separadas, cada uma com um sinal claro",
        "O OBS entra como programa gratuito, com cena e fonte, antes de qualquer overlay",
        "O codificador da placa, quando existe, deixa o processador mais livre para o jogo e a voz",
      ],
      contras: [
        "Não há requisito de GTA 6 para copiar nesta data",
        "Um número de envio chutado aqui ficaria errado na sua internet",
        "Cadeira, luz colorida e overlay não corrigem voz ruim nem máquina no limite",
      ],
    },
    {
      tipo: "chamada",
      tema: "montagem",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Quando o canto vira conversa de máquina",
    },
    {
      tipo: "paragrafo",
      texto: "Na Balão da Informática Anchieta, Av. Anchieta, 789, Cambuí, Campinas, você conta qual jogo já transmite, em qual monitor, e se a voz cabe junto com a captura. A equipe mostra a máquina ligada. GTA 6 só entra nessa conversa quando a Rockstar publicar versão de PC e o requisito correspondente.",
    },
    {
      tipo: "paragrafo",
      texto: "Chame no WhatsApp (19) 98751-0267 e diga o que falhou na prova: a voz, a folga, ou as duas. A decisão é montar para o uso de hoje. Enquanto a ficha do computador não existir, não há peça de GTA 6 para adivinhar no balcão.",
    },
    {
      tipo: "chamada",
      titulo: "A Balão da Informática Anchieta olha essa folga com você.",
      texto: "No WhatsApp (19) 98751-0267, diga o jogo que já abre e se a live engasga com ele aberto. A decisão é a máquina desse uso, mostrada ligada.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "Dá para montar um setup de GTA 6 sem versão de PC?",
      resposta: "Dá para montar o canto do jogo que você já transmite. Até 19 de novembro de 2026 a Rockstar não tinha anunciado GTA 6 para computador, nem requisito. A mesa, o OBS e a folga servem a essa espera. Não copiam uma ficha que não foi publicada.",
    },
    {
      pergunta: "Qual programa junta o jogo, a voz e a câmera?",
      resposta: "O OBS Studio, gratuito em obsproject.com. Você organiza cenas e fontes. Se a placa tem codificador, use o dela. Se não tem, o codificador fica no processador. Overlay vem depois da voz inteligível.",
    },
    {
      pergunta: "O que é folga num computador de live?",
      resposta: "É o que sobra de processador, memória e disco com o jogo já aberto, para o programa de captura e a voz rodarem juntos. Se a partida sozinha ocupa a máquina inteira, a live engasga mesmo com a imagem local ainda andando.",
    },
    {
      pergunta: "Overlay deixa a live pronta?",
      resposta: "Não. Overlay é desenho por cima. A ordem que importa é jogo estável, cena com microfone, áudio inteligível e só então câmera e enfeite. Um alerta bonito não conserta frase que ninguém entende.",
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
