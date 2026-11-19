import type { Artigo, Fonte } from "@/lib/blog/tipos";

const OBS: Fonte = {
  nome: "OBS Project — OBS Studio",
  url: "https://obsproject.com/",
  data: "consulta em 19 de novembro de 2026",
};

const ROCKSTARVI: Fonte = {
  nome: "Rockstar Games — página oficial de Grand Theft Auto VI",
  url: "https://www.rockstargames.com/VI",
  data: "consulta em 19 de novembro de 2026",
};

const artigo: Artigo = {
  slug: "microfone-para-live-de-jogo",
  titulo: "Microfone para live de jogo: o que muda a voz",
  resumo: "Dinâmico costuma ignorar mais a sala. Condensador pega mais detalhe e mais ruído. Perto da boca muda a voz mais do que a marca do microfone.",
  categoria: "guias",
  etiquetas: [
    "GTA 6",
    "Microfone",
    "Live",
  ],
  capa: {
    src: "/blog/capas/microfone-para-live-de-jogo.webp",
    alt: "Capa sobre microfone de live mostrando que a distância da boca pesa mais do que a marca",
    largura: 1536,
    altura: 1024,
    pronta: true,
  },
  publicadoEm: "2026-11-08T18:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "Microfone para live: o que muda a voz de fato",
    palavrasChave: [
      "microfone para live",
      "microfone dinâmico ou condensador",
      "voz na live de jogo",
      "posição do microfone",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "A voz da sua live fica inteligível ou fica um murmúrio, e isso aparece antes de qualquer desenho na tela. Quem assiste perdoa gráfico simples. Não perdoa frase que precisa adivinhar. O que muda esse resultado, na prática, é a distância da boca, o tipo de microfone e o barulho da sala. O logotipo entra por último, e não há um modelo obrigatório para começar.",
    },
    {
      tipo: "paragrafo",
      texto: "Este texto não elege um aparelho. Dinâmico e condensador fazem trabalhos diferentes, e os dois podem servir, conforme o quarto em que você senta. A [página da Rockstar](https://www.rockstargames.com/VI) também não indica microfone de GTA 6: a versão de computador não estava anunciada até 19 de novembro de 2026. A voz que você arruma é a da live que já existe.",
    },
    {
      tipo: "resumo",
      itens: [
        "**Perto da boca pesa mais que a marca.** A distância muda a voz antes do logotipo.",
        "**Dinâmico costuma ignorar mais a sala.** Teclado e eco entram menos.",
        "**Condensador pega detalhe e ruído.** Sala quieta combina mais com ele.",
        "**Não há modelo obrigatório.** Você ouve uma gravação curta e decide.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que a outra pessoa escuta de fato",
    },
    {
      tipo: "paragrafo",
      texto: "Do outro lado, a pessoa não vê a caixa do microfone. Ela ouve frase, respiração e o que a sala acrescenta: ventilador, teclado, rua, eco. Se a frase se entende de primeira, a voz cumpriu o papel. Se ela pede repetição, o problema está nesse caminho, não num overlay que ainda nem entrou. Grave um minuto no lugar em que você realmente joga.",
    },
    {
      tipo: "paragrafo",
      texto: "Grave com o jogo aberto ou com o teclado em uso, porque é assim que a live acontece. Uma frase lida em silêncio, longe da mesa, descreve outro cômodo. Ouça no fone, não só na caixa do monitor, e anote o que sobra: sopro na letra P, clique de tecla, ou voz fina demais. Esse bilhete vale mais do que a lista de recursos impressa na embalagem.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Dinâmico e condensador em salas reais",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/microfone-para-live-de-jogo-tipos.webp",
        alt: "Duas colunas comparam microfone dinâmico, que ignora mais a sala, e condensador, que pega mais detalhe e mais ruído",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "O dinâmico costuma deixar o quarto mais de fora. O condensador traz detalhe e também o ruído que estiver por perto.",
    },
    {
      tipo: "paragrafo",
      texto: "O microfone dinâmico costuma ignorar mais a sala. Ele favorece o que está perto e deixa teclado, cadeira e janela um pouco mais de fora. Em quarto sem tratamento, com eco e com gente passando, esse comportamento ajuda. Você não ganha um estúdio. Você ganha uma voz em que o quarto ocupa menos espaço. A posição perto da boca continua obrigatória, senão o dinâmico também fica opaco.",
    },
    {
      tipo: "paragrafo",
      texto: "O condensador pega mais detalhe da voz e, junto, mais ruído. Respiração, mouse, ventilador e a parede que devolve o som aparecem com mais clareza. Num cômodo quieto, isso pode soar presente e próximo. Num cômodo vivo, a mesma qualidade vira distração. Nenhum dos dois tipos apaga uma sala ruim sozinho. Eles só escolhem o quanto dessa sala viaja com a sua frase.",
    },
    {
      tipo: "tabela",
      titulo: "Qual comportamento combina com qual sala",
      colunas: [
        "Sua sala",
        "Comportamento que costuma caber",
        "O que você ainda ajusta",
      ],
      linhas: [
        [
          "Eco, teclado, rua",
          "Dinâmico, que ignora mais o quarto",
          "Chegar da boca",
        ],
        [
          "Quarto quieto",
          "Condensador, mais detalhe e mais ruído",
          "Ganho e posição",
        ],
        [
          "Sem tratamento nenhum",
          "Nenhum tipo apaga a sala sozinho",
          "Posição primeiro",
        ],
        [
          "Qualquer logotipo",
          "Não há modelo obrigatório",
          "Ouvir a gravação",
        ],
      ],
      nota: "Comparação de uso para você escolher o comportamento. Não é ranking de marca nem medição de bancada.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Sala pequena não é estúdio",
    },
    {
      tipo: "paragrafo",
      texto: "Tapete, cortina e estante cheia mudam o eco mais do que um adesivo no microfone. Você não precisa reformar o quarto para transmitir. Precisa saber o que a gravação está captando. Se a voz volta como se estivesse num banheiro, aproxime o microfone e tire a fonte do som de trás de você. Tratar a sala inteira é outro projeto, e não é o primeiro passo.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Perto da boca, antes da marca",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/microfone-para-live-de-jogo-ordem-voz.webp",
        alt: "Barras em ordem de atenção da voz na live: perto da boca, tipo do microfone, a sala e a marca",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "A barra maior é o que você ajusta primeiro. A marca fica por último porque não apaga distância nem sala.",
    },
    {
      tipo: "paragrafo",
      texto: "A posição perto da boca muda mais a voz do que a marca. Um palmo a mais de distância já mistura o quarto na frase, e um microfone caro no fundo da mesa continua longe. Deixe a cápsula na direção da boca, um pouco ao lado, para o sopro não estourar, e firme o suporte. Essa regulagem você faz hoje, com o aparelho que já tem.",
    },
    {
      tipo: "paragrafo",
      texto: "Trocar de marca sem mudar a distância repete o mesmo defeito com outra logo. Se a gravação só ficou clara quando você aproximou, o passo seguinte não é um modelo novo: é um braço ou um apoio que mantenha essa distância. Se aproximar piorou o sopro e o clique, aí o tipo e o ganho entram na conversa. A marca, sozinha, não decide nenhum dos dois casos.",
    },
    {
      tipo: "destaque",
      tom: "nota",
      titulo: "Ouça antes de trocar",
      texto: "Grave um minuto no lugar real, com teclado e cadeira. Se a frase se entende perto da boca, a marca não é o próximo passo. Se a sala domina mesmo perto, o tipo do microfone passa a importar.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que o computador faz com essa voz",
    },
    {
      tipo: "paragrafo",
      texto: "O microfone precisa de uma entrada livre, e o programa de captura precisa receber essa fonte. No OBS, a voz entra na cena no mesmo lugar em que o jogo entra. O guia de [OBS para live de jogo](/blog/obs-para-live-de-jogo) mostra essa organização. Se o processador já está no limite com o jogo, a voz disputa espaço com a partida. A folga está no [setup de streamer](/blog/setup-de-streamer-para-gta-6).",
    },
    {
      tipo: "paragrafo",
      texto: "Filtro no programa ajuda depois que a distância está certa. Reduzir ruído num microfone que está do outro lado da mesa deixa a voz abafada e o teclado ainda presente. Use o filtro para aparar o que sobrou, não para compensar um aparelho longe. A câmera, que é outro ingrediente da cena, tem página própria em [webcam para stream](/blog/webcam-para-stream). Uma não conserta a outra.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que não vale decidir no escuro",
    },
    {
      tipo: "paragrafo",
      texto: "Não há produto obrigatório nesta página. Dois dinâmicos de marcas diferentes podem se parecer mais entre si do que um dinâmico e um condensador da mesma prateleira. Por isso a primeira pergunta é o quarto, não o catálogo. Você descreve eco, teclado e o quanto consegue aproximar da boca. Com isso, o tipo fica óbvio na maior parte das vezes, e a marca vira preferência, não salvação.",
    },
    {
      tipo: "paragrafo",
      texto: "Quem está começando no [Twitch, YouTube ou Kick](/blog/comecar-no-twitch-youtube-ou-kick) precisa de áudio inteligível antes de overlay. Essa exigência não muda com a plataforma. Um título honesto com voz opaca continua difícil de acompanhar. Acerte a gravação de um minuto, no horário em que você joga, e só então abra a transmissão. A plataforma não devolve a frase que o microfone não captou.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/microfone-para-live-de-jogo-fecho.webp",
        alt: "Quatro decisões do microfone: distância da boca, ruído da sala, dinâmico ou condensador, e a marca por último",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Dinâmico ignora mais a sala. Condensador pega mais detalhe e mais barulho. A posição pesa nos dois.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "A distância da boca é um ajuste que você faz sem trocar de aparelho",
        "Dinâmico e condensador ficam ligados ao tipo de sala, não a um ranking de marca",
        "Uma gravação de um minuto no lugar real mostra o defeito antes da compra",
      ],
      contras: [
        "Nenhum tipo apaga eco, teclado e rua se o microfone está longe",
        "Filtro no programa não substitui posição",
        "Não existe modelo oficial para GTA 6 nem um aparelho obrigatório para começar",
      ],
    },
    {
      tipo: "chamada",
      tema: "geral",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Levar a voz para quem monta",
    },
    {
      tipo: "paragrafo",
      texto: "Na Balão da Informática Anchieta, na Av. Anchieta, 789, no Cambuí, em Campinas, leve a gravação de um minuto ou descreva o quarto: eco, teclado, janela, distância que o braço alcança. A conversa é sobre o comportamento do microfone, não sobre um modelo único. A máquina, se entrar, é a que ainda tem folga para a voz.",
    },
    {
      tipo: "paragrafo",
      texto: "O WhatsApp da loja é (19) 98751-0267. A decisão é esta: se a frase se entende perto da boca, mantenha o aparelho e fixe a posição. Se a sala domina mesmo assim, escolha o tipo pelo quarto. Marca vem depois, e só se ainda fizer diferença nessa gravação.",
    },
    {
      tipo: "chamada",
      titulo: "A Balão da Informática Anchieta ouve o problema da sala.",
      texto: "No WhatsApp (19) 98751-0267, conte a distância e o barulho do quarto. A decisão é a voz inteligível no lugar em que você joga.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "Microfone dinâmico ou condensador para um quarto comum?",
      resposta: "No quarto com eco, teclado e rua, o dinâmico costuma ignorar mais a sala. O condensador entrega mais detalhe e também mais ruído, e combina mais com um cômodo quieto. Os dois ainda dependem de ficar perto da boca.",
    },
    {
      pergunta: "A marca do microfone muda mais do que a posição?",
      resposta: "Não. Chegar a cápsula da boca muda mais a voz do que trocar o logotipo. Um aparelho caro no fundo da mesa continua longe. Primeiro fixe a distância. Depois avalie se a marca ainda faz alguma diferença.",
    },
    {
      pergunta: "Existe um microfone obrigatório para live de jogo?",
      resposta: "Não. Não há modelo obrigatório, e GTA 6 de PC não publicou uma indicação porque a versão de computador não estava anunciada até 19 de novembro de 2026. A escolha começa pela sala e pela gravação.",
    },
    {
      pergunta: "O computador influencia a voz da live?",
      resposta: "Influencia na folga. O programa de captura precisa receber o microfone, e o processador precisa sobrar para a voz com o jogo aberto. Filtro ajuda depois da posição certa. Não conserta um microfone do outro lado da mesa.",
    },
    {
      pergunta: "Devo colocar overlay antes de acertar o áudio?",
      resposta: "Não. A pessoa do outro lado precisa entender a frase antes de ver alerta e borda. Grave um minuto no lugar real. Se a voz falha, o próximo passo é distância, tipo ou folga da máquina.",
    },
  ],
  fontes: [
    OBS,
    ROCKSTARVI,
  ],
};

export default artigo;
