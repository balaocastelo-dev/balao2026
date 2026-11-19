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
  slug: "pc-para-live-de-gta-6",
  titulo: "PC para fazer live de GTA 6: o que a transmissão pede",
  resumo: "A live pede folga além do jogo, porque alguém precisa codificar o vídeo. Sem PC de GTA 6, a máquina de hoje é a dos jogos que você já transmite.",
  categoria: "guias",
  etiquetas: [
    "GTA 6",
    "Live",
    "Transmissão",
    "PC gamer",
  ],
  capa: {
    src: "/blog/capas/pc-para-live-de-gta-6.webp",
    alt: "Capa sobre PC para live com duas cargas, o jogo e a codificação de vídeo, sem requisito de GTA 6",
    largura: 1536,
    altura: 1024,
    pronta: true,
  },
  publicadoEm: "2026-11-09T18:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "PC para live de GTA 6: o que a transmissão pede",
    palavrasChave: [
      "pc para live de gta 6",
      "pc para transmitir jogo",
      "computador para live",
      "codificar vídeo enquanto joga",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "Um PC para live de GTA 6 teria de rodar o jogo e, ao mesmo tempo, codificar vídeo para a transmissão. São duas cargas. A segunda não vem de graça dentro da primeira. O problema, hoje, é anterior: até 19 de novembro de 2026 não existe versão de PC do jogo, então não existe o PC dessa live. O que existe é a máquina dos jogos que você já transmite.",
    },
    {
      tipo: "paragrafo",
      texto: "A [página oficial](https://www.rockstargames.com/VI) lista PlayStation 5 e Xbox Series no dia 19 de novembro de 2026. O [Yahoo](https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html) não achou requisito de computador em 15 de novembro. Planejar bitrate, resolução de live ou placa “do GTA” em cima disso é desenhar em cima de uma página em branco. A folga se mede na live que já está no ar.",
    },
    {
      tipo: "resumo",
      itens: [
        "**A transmissão codifica vídeo além de rodar o jogo.** As duas tarefas dividem a máquina.",
        "**Sem versão de PC, não há PC de live de GTA 6.** Há o PC da live que você já faz.",
        "**O codificador pode ser da placa ou do processador.** O programa dessa escolha é o OBS.",
        "**32 GB e placa forte são a folga da faixa alta.** Entram quando a captura já faz parte do uso.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que a transmissão acrescenta ao jogo",
    },
    {
      tipo: "paragrafo",
      texto: "Jogar pede que a placa desenhe o quadro a tempo. Transmitir pede que outro recurso leia esse quadro, comprima e envie, ou grave. Se os dois usam o mesmo teto sem folga, um deles perde: o jogo soluça ou o vídeo da live sai picado. A folga da transmissão é exatamente esse segundo trabalho, não um enfeite em cima de uma máquina que já estava no limite.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/pc-para-live-de-gta-6-cargas.webp",
        alt: "Camadas da live: o jogo, o codificador de vídeo, o áudio e a folga de memória e disco",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Se uma camada falta, a transmissão cai mesmo com o jogo ainda aberto.",
    },
    {
      tipo: "tabela",
      titulo: "Carga de jogar e carga de transmitir",
      colunas: [
        "Tarefa",
        "Quem executa",
        "Sem folga",
      ],
      linhas: [
        [
          "Desenhar o jogo",
          "Placa de vídeo",
          "O quadro soluça",
        ],
        [
          "Codificar o vídeo",
          "Placa, se tiver, ou processador",
          "A live sai picada",
        ],
        [
          "Voz e som do jogo",
          "Fontes de áudio",
          "Uma faixa cobre a outra",
        ],
        [
          "Guardar a sessão",
          "Disco, de preferência SSD",
          "O HD segura os dois",
        ],
      ],
    },
    {
      tipo: "paragrafo",
      texto: "Por isso a faixa alta desta série fala em placa forte, 32 GB, SSD rápido e margem para capturar. Ela está no guia de [alto desempenho](/blog/pc-gamer-alto-desempenho-gta-6). Se você só joga em Full HD, com placa dedicada recente, 16 GB e SSD, está na entrada e não deve subir para a alta só porque um dia talvez transmita GTA 6. A live que conta é a que você faz agora.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Por que a live de hoje não é a de GTA 6",
    },
    {
      tipo: "paragrafo",
      texto: "A live de GTA 6 no PC pediria o jogo instalado num computador. Esse instalador não foi anunciado. Transmitir o console com uma placa de captura é outro arranjo, com outro aparelho, e não transforma o PC em “o PC do jogo”. Este texto fica no computador que joga e codifica ao mesmo tempo. Sem o jogo de PC, o ensaio é com o que você já abre.",
    },
    {
      tipo: "paragrafo",
      texto: "Quando a Rockstar publicar versão e números, dá para perguntar se a folga de hoje ainda cobre o jogo mais a codificação. Antes disso, a pergunta não tem denominador. O guia [sem requisito](/blog/pc-para-gta-6-sem-requisito-oficial) segura essa espera. A série está em [GTA 6](/blog/gta-6). Tratar a live futura como se a ficha já existisse só produz peça comprada no escuro.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Codificar vídeo é uma segunda tarefa",
    },
    {
      tipo: "paragrafo",
      texto: "O programa que organiza cena, fonte e codificador na maior parte das lives de jogo é o OBS Studio. O que configurar nele, sem número inventado de bitrate, está no texto de [OBS para live](/blog/obs-para-live-de-jogo). O arranjo de mesa, luz e retorno fica em [setup de quem transmite](/blog/setup-de-streamer-para-gta-6). Aqui o assunto é a máquina que aguenta as duas cargas.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Codificador da placa ou do processador",
    },
    {
      tipo: "paragrafo",
      texto: "Se a placa de vídeo oferece codificador por hardware, a compressão do vídeo pode sair dela e deixar o processador mais livre para o jogo. Se não oferece, a codificação cai no processador. As duas saídas funcionam. A escolha não é um preset milagroso: é o que o seu hardware expõe. O OBS mostra as opções daquela máquina. Este guia não elege uma marca de codificador como obrigatória.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/pc-para-live-de-gta-6-duas.webp",
        alt: "Duas colunas separam a carga de só jogar e a carga extra de transmitir ou gravar ao mesmo tempo",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "GTA 6 no PC não está em nenhuma coluna, porque essa versão não foi anunciada.",
    },
    {
      tipo: "destaque",
      tom: "atencao",
      titulo: "A folga é além do jogo",
      texto: "Uma máquina que mal roda o jogo não ganha live por instalar o OBS. A codificação pede margem própria. Sem essa margem, ou o jogo ou o vídeo cede.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Voz, jogo e captura disputam a mesma máquina",
    },
    {
      tipo: "paragrafo",
      texto: "Além do quadro, a live carrega a sua voz, o som do jogo e, se você usa, a câmera. Cada fonte é leve sozinha e pesada juntas quando a memória já está cheia. 16 GB podem bastar para jogar e ficar curtos quando entram voz, navegador do chat e gravação local. 32 GB são a margem da faixa alta justamente para essa pilha, não um número de GTA 6.",
    },
    {
      tipo: "paragrafo",
      texto: "O disco entra se você guarda a live no computador, além de enviar. Gravação local escreve o tempo todo. HD mecânico nessa função segura o jogo e a gravação juntos. SSD é o piso das faixas deste blog por isso também. O [upgrade](/blog/upgrade-do-pc-antes-do-gta-6) lembra a ordem: disco e memória antes da placa, se o sintoma for espera e uso escapando para o HD.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Memória e disco para quem grava e joga",
    },
    {
      tipo: "paragrafo",
      texto: "Quem transmite e ainda guarda cópia local precisa de espaço contínuo, não de um disco no limite no dia da live. Apagar a sessão antiga faz parte do uso. Não há um tamanho oficial para “a live de GTA 6”, então não invento gigabytes de gravação. O tamanho é o das suas sessões atuais, vezes o quanto você aceita guardar antes de arquivar fora da máquina.",
    },
    {
      tipo: "paragrafo",
      texto: "A placa forte da faixa alta só se justifica se a tela e a codificação já pedem essa margem hoje. Quad HD com folga de memória de vídeo, sem live, continua sendo a [faixa intermediária](/blog/pc-gamer-intermediario-para-gta-6). Subir de faixa porque a transmissão de GTA 6 “vai pedir” é decidir com um jogo que não está no PC. Subir porque a sua live atual já soluça é decidir com evidência.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "A live fica descrita como segunda carga, então a folga deixa de ser um adjetivo vago",
        "Sem versão de PC, a máquina se mede nos jogos que você já transmite, não num GTA imaginário",
        "Codificador da placa ou do processador entra como escolha do hardware que você tem, via OBS",
      ],
      contras: [
        "Não há como saber se a folga de hoje cobre GTA 6 mais a codificação",
        "16 GB que bastam para jogar podem ficar curtos quando chat, voz e gravação entram juntos",
        "Este texto não fixa bitrate nem resolução de live: esses números mudam e moram na documentação",
      ],
    },
    {
      tipo: "chamada",
      tema: "pc-gamer",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Montar para a live que você já faz",
    },
    {
      tipo: "paragrafo",
      texto: "Na Balão da Informática Anchieta, na Av. Anchieta, 789, Cambuí, Campinas, a máquina de live se monta em cima do jogo que você já transmite. Diga se o vídeo sai pela placa ou pelo processador e qual é o monitor. A demonstração é com o computador aceso, antes do pagamento. Ninguém chama essa máquina de PC de GTA 6.",
    },
    {
      tipo: "paragrafo",
      texto: "O WhatsApp (19) 98751-0267 recebe o nome do jogo da sua live e se você também grava cópia local. O orçamento é o do dia, porque o preço muda. A assistência fica no mesmo endereço se a fonte ou o calor forem o limite da codificação. A folga é para a transmissão que existe, não para a que ainda não tem jogo de PC.",
    },
    {
      tipo: "chamada",
      titulo: "A live de hoje já tem máquina à altura?",
      texto: "Diga qual jogo você transmite e se o vídeo é pela placa ou pelo processador. A folga é calculada em cima disso.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "Qual PC transmite GTA 6?",
      resposta: "Nenhum que dê para cravar hoje. Não há versão de PC nem requisito até 19 de novembro de 2026. A live pede folga para codificar vídeo além do jogo. Enquanto o jogo de computador não existe, essa folga é a dos jogos que você já transmite.",
    },
    {
      pergunta: "Só instalar o OBS basta para fazer live?",
      resposta: "O OBS organiza cena e codificador. Ele não cria folga de máquina. Se o jogo já ocupa o teto, a codificação empurra o quadro ou o vídeo. O que configurar no programa está no guia de OBS, sem bitrate inventado.",
    },
    {
      pergunta: "A codificação tem de ser na placa de vídeo?",
      resposta: "Não. Se a placa oferece codificador por hardware, dá para usar. Se não oferece, o processador codifica. As duas vias são válidas. A certa é a que a sua máquina expõe no OBS, não uma marca escolhida daqui.",
    },
    {
      pergunta: "16 GB de RAM aguentam live?",
      resposta: "Aguentam em usos leves e ficam curtos quando jogo, voz, chat e gravação local dividem os 16 GB. A faixa alta reserva 32 GB para essa pilha. Isso não é requisito de GTA 6. É margem para a live que você já faz.",
    },
  ],
  fontes: [
    ROCKSTARVI,
    YAHOOPC,
    ROCKSTARDATA,
  ],
};

export default artigo;
