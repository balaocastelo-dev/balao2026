import { p, h2, ul, ol, rapida, img, nota, tabela, pros, chamada, fontes } from "./blocos.mjs";

const loja = "Balão da Informática Anchieta, loja de informática em Campinas";

export const lives = [
  {
    slug: "pc-para-live-de-gta-6",
    titulo: "PC para live de GTA 6: o que a transmissão pede a mais",
    seoTitulo: "PC para live de GTA 6: jogo e transmissão juntos",
    resumo:
      "PC para live de GTA 6 joga e codifica ao mesmo tempo. Veja CPU, RAM e NVENC, e teste hoje no GTA V: a versão nova de PC não foi anunciada.",
    palavrasChave: ["pc para live de gta 6", "pc para transmitir gta", "computador para stream", "live de gta"],
    etiquetas: ["GTA 6", "Live", "PC gamer", "Streaming"],
    capaAlt: "Pessoa de fone e microfone transmitindo, um PC para live de GTA 6 no futuro e de GTA V hoje.",
    fontes: fontes("rockstarVi", "obsNvenc", "obs"),
    blocos: [
      p("PC para live de GTA 6 carrega duas tarefas, e só uma delas existe hoje. Jogar um mundo aberto pesa. Codificar a imagem e enviar para a Twitch, o YouTube ou a Kick pesa de novo. A Rockstar não anunciou o GTA 6 para computador, então o treino é nos jogos que você já transmite, GTA V incluído. A máquina que aguenta as duas cargas agora é a que estará menos apertada quando a versão de PC, se sair, chegar."),
      rapida([
        "Separe jogo e codificador. NVENC, na placa NVIDIA, tira a live do processador. A OBS documenta esse caminho.",
        "32 GB de RAM cabem o jogo, o OBS, o navegador do chat e o Discord. 16 GB enchem.",
        "Grave cinco minutos em disco antes de abrir a live. Se o arquivo local já falha, a internet nem entrou na história.",
      ]),
      h2("PC para live de GTA 6: as duas cargas"),
      p("A primeira carga é o jogo: placa de vídeo na resolução da sua tela, como em [placa de vídeo para GTA 6](/blog/placa-de-video-para-gta-6), e processador que não esteja no talo só com a cidade cheia. A segunda é o OBS, ou o programa que você usa, transformando o quadro em vídeo. Se as duas caem no mesmo chip, o jogo soluça na hora em que você lê o chat. O guia de NVENC da OBS mostra como deixar a placa codificar. Quem está na AMD usa o codificador da própria placa, com o mesmo princípio: não fazer os dois trabalhos no processador se a GPU pode fazer um deles."),
      p("Memória é o terceiro pedaço, e o mais barato de errar. Jogo grande, cena do OBS com câmera e alerta, Chrome do painel e Discord passam de 16 GB com facilidade. A matéria de [memória RAM](/blog/memoria-ram-para-gta-6) explica o salto para 32 GB. Disco cheio também derruba a gravação local, que é o seu teste. O [SSD](/blog/ssd-para-gta-6) precisa de folga, não só de velocidade."),
      img(
        "Microfone de mesa, notebook e fone: a live começa pelo áudio, e o PC precisa sobrar para o jogo não cair enquanto você fala.",
        "Microfone, notebook e fone num espaço de gravação, canto de um PC para live de GTA 6.",
      ),
      tabela({
        titulo: "O que a live soma em cima do jogo",
        colunas: ["Peça", "Só jogar", "Jogar e transmitir"],
        linhas: [
          ["Placa", "Desenha o jogo", "Desenha o jogo e, se der, codifica"],
          ["Processador", "Cidade, trânsito, física", "O mesmo, mais o que a placa não codificar"],
          ["RAM", "16 GB com o resto fechado", "32 GB com OBS, chat e Discord"],
          ["Disco", "O jogo instalado", "O jogo, mais a gravação local de teste"],
        ],
        nota: "Comparação para os jogos de hoje. Grand Theft Auto VI não tem ficha de PC.",
      }),
      h2("O teste que evita a live ruim"),
      ol([
        "Abra o jogo que você já transmite, em GTA V se for o caso, na qualidade que você usa.",
        "No OBS, arme a cena com jogo, câmera e microfone. O guia rápido da OBS é o ponto de partida, e a matéria de [OBS](/blog/obs-para-live-de-jogo) traduz para a mesa.",
        "Grave cinco minutos em disco, sem ir ao ar.",
        "Assista. Se o quadro caiu ou a voz estourou, ajuste antes de chamar plateia.",
        "Só então teste a subida da internet, na matéria de [internet para live](/blog/internet-para-fazer-live).",
      ]),
      p("A faixa de máquina que já nasce com essa folga é a de [alto desempenho](/blog/pc-gamer-alto-desempenho-gta-6). Dá para transmitir numa faixa menor, com o jogo em Full HD e a codificação na placa, desde que o teste local passe."),
      img(
        "Luz no gabinete não transmite por você. O que transmite é folga de placa, memória e um teste gravado.",
        "Gabinete com luz colorida, máquina usada como PC para live de GTA 6 e dos jogos de hoje.",
      ),
      pros(
        "A live cabe no PC quando",
        [
          "A gravação local de cinco minutos fica estável.",
          "O codificador é o da placa, não um x264 no máximo em cima de um chip já cheio.",
          "Sobram 32 GB e espaço em disco.",
        ],
        [
          "Você descobre o limite com a live aberta e a plateia esperando.",
          "O jogo está em HD e a gravação também.",
          "O microfone é o do fone, colado no teclado, e você só percebe no VOD.",
        ],
      ),
      p("Áudio e cara da cena estão em [microfone](/blog/microfone-para-live-de-jogo), [webcam](/blog/webcam-para-stream) e [setup](/blog/setup-de-streamer-para-gta-6)."),
      img(
        "Na loja, o gabinete da estante é o tipo de torre que a gente abre para ver se a fonte aguenta a placa da live.",
        "Gabinete na estante da Balão da Informática Anchieta, PC para live de GTA 6 conferido no balcão.",
      ),
      chamada({
        tema: "pc-gamer",
        titulo: "Quer folga para jogar e gravar?",
        texto: `A ${loja} monta a máquina com a live em mente. Av. Anchieta, 789, Cambuí. WhatsApp (19) 98751-0267.`,
        rotulo: "Montar para transmitir",
        href: "/montagempc",
        mensagem: "Olá! Li a matéria de PC para live de GTA 6 e quero uma máquina que jogue e grave ao mesmo tempo.",
      }),
      p("A série está em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "Dá para transmitir GTA 6 no PC?",
        resposta:
          "A versão de PC não foi anunciada. Dá para montar e treinar a live no GTA V e nos jogos que você já tem, com jogo e codificador separados.",
      },
      {
        pergunta: "Preciso de 32 GB para live?",
        resposta:
          "Na prática, sim, se o OBS, o chat e o Discord ficam abertos com o jogo. Com 16 GB o disco vira memória e a live soluça.",
      },
      {
        pergunta: "NVENC ajuda?",
        resposta:
          "Ajuda nas placas NVIDIA: a própria OBS documenta o codificador da GPU. A ideia é a mesma nas placas AMD. O processador deixa de fazer os dois trabalhos.",
      },
      {
        pergunta: "Como sei se o PC aguenta?",
        resposta:
          "Grave cinco minutos com a cena completa e assista. Se o arquivo local já cai de quadro ou corta a voz, a internet não é o problema.",
      },
      {
        pergunta: "Qual faixa de PC comprar?",
        resposta:
          "A de alto desempenho, se a live é rotina. Uma faixa menor transmite em Full HD se o teste local passar e a codificação ficar na placa.",
      },
    ],
  },
  {
    slug: "obs-para-live-de-jogo",
    titulo: "OBS para live de jogo: como montar a primeira transmissão",
    seoTitulo: "OBS para live de jogo: cenas, encoder e teste",
    resumo:
      "OBS para live de jogo: uma cena simples, o codificador da placa e um teste gravado. O passo a passo antes de abrir a Twitch ou o YouTube.",
    palavrasChave: ["obs para live de jogo", "configurar obs", "obs studio live", "cena obs gta"],
    etiquetas: ["OBS", "Live", "Streaming", "GTA 6"],
    capaAlt: "Notebook, microfone e câmera numa mesa, o ponto de partida do OBS para live de jogo.",
    fontes: fontes("obs", "obsNvenc", "twitch", "youtube"),
    blocos: [
      p("OBS para live de jogo é o programa gratuito que junta a tela, a sua voz e a câmera num vídeo só. O guia de início rápido do próprio OBS é a fonte. Esta matéria traduz isso para quem quer transmitir GTA, hoje no GTA V, sem se perder em filtro. O GTA 6 de PC não foi anunciado. O OBS que você aprende agora serve para qualquer jogo que já esteja instalado."),
      rapida([
        "Uma cena com o jogo em tela cheia, a webcam num canto e o microfone na mistura já é uma live.",
        "Prefira o codificador da placa. O guia de NVENC da OBS explica o caminho nas GeForce.",
        "Grave em disco antes de ir ao ar. A Central de Criadores da Twitch e a ajuda do YouTube entram depois que o arquivo local está bom.",
      ]),
      h2("OBS para live de jogo: a primeira cena"),
      p("Abra o OBS e crie uma cena chamada Jogo. Nela, uma fonte de captura do jogo, ou da tela, em tela cheia. Por cima, a webcam, pequena, num canto que não tape o minimapa. O microfone entra no misturador, não como enfeite. Alerta de seguidor, borda animada e três câmeras ficam para a segunda semana. A primeira live boa é legível: dá para ver o jogo e ouvir você."),
      p("O áudio estoura com facilidade. Fale no volume em que você comenta a partida e olhe a barrinha. Se ela bate no vermelho, baixe o ganho. Se o teclado aparece mais alto do que a voz, afaste o microfone das teclas ou troque o tipo, assunto da matéria de [microfone](/blog/microfone-para-live-de-jogo). Fone fechado evita que o som do jogo volte para o microfone."),
      img(
        "Celular, microfone e fone na mesma mesa. No OBS, cada um vira uma fonte. Comece com poucos.",
        "Celular, microfone e fone na mesa, fontes de uma cena de OBS para live de jogo.",
      ),
      h2("Codificador: deixe a placa trabalhar"),
      p("No menu de configuração, a saída em modo avançado deixa escolher o codificador. Nas GeForce, NVENC é a escolha que o guia da OBS detalha: a placa codifica e o processador continua com o jogo. Qualidade, preset e bitrate mudam com a sua internet. Não copie um número de vídeo de 2022. Use o assistente de configuração automática do OBS como ponto de partida e compare com a recomendação atual da plataforma, na Central de Criadores da Twitch ou na ajuda de transmissão do YouTube."),
      p("x264 no processador serve quando a placa não tem codificador decente ou quando você grava um arquivo pesado com o jogo fechado. No meio da partida, ele compete com a cidade. Se o teste mostrar queda de quadro só quando a live arma, volte o codificador para a GPU."),
      tabela({
        titulo: "Três cenas que bastam no começo",
        colunas: ["Cena", "O que tem", "Quando usar"],
        linhas: [
          ["Jogo", "Captura, webcam pequena, microfone", "Quase a live inteira"],
          ["Pausa", "Tela parada e a sua câmera maior", "Banheiro, água, carregando"],
          ["Começo e fim", "Seu nome e o jogo do dia", "Trinta segundos, não um filme"],
        ],
        nota: "Roteiro simples. O manual do programa é o guia de início rápido da OBS.",
      }),
      img(
        "Mãos no teclado e no mouse: a captura do jogo é a fonte principal. O resto não pode tapar a mira.",
        "Mãos no teclado e no mouse com luz colorida, captura de jogo dentro do OBS para live.",
      ),
      ol([
        "Instale o OBS pelo site oficial e rode o assistente.",
        "Monte a cena Jogo com captura, câmera e microfone.",
        "Fale um minuto e olhe se a barra de áudio estoura.",
        "Grave localmente, assista, e só então conecte a chave da plataforma.",
        "A chave da Twitch ou do YouTube fica no painel do criador, não em print de terceiros.",
      ]),
      pros(
        "OBS estável",
        [
          "Poucas fontes. Cada navegador aberto na cena come memória.",
          "Codificador da placa e teste gravado.",
          "Cena de pausa pronta, para você não transmitir a área de trabalho sem querer.",
        ],
        [
          "Dez alertas piscando em cima do minimapa.",
          "Bitrate copiado de um vídeo antigo, maior do que a sua subida aguenta.",
          "Atualizar o OBS no minuto em que a live ia começar.",
        ],
      ),
      p("A máquina que segura isso está em [PC para live](/blog/pc-para-live-de-gta-6). A subida da rede, em [internet para fazer live](/blog/internet-para-fazer-live). Onde criar o canal, em [Twitch, YouTube ou Kick](/blog/comecar-no-twitch-youtube-ou-kick)."),
      img(
        "Monitores no corredor da loja: é o tipo de tela em que a cena do OBS tem de continuar legível.",
        "Monitores na Balão da Informática Anchieta, referência de tela para configurar o OBS para live de jogo.",
      ),
      nota(
        "atencao",
        "Chave de transmissão",
        "A chave é a senha da sua live. Não cole em print, não mande em grupo. Se vazou, gere outra no painel da plataforma.",
      ),
      chamada({
        tema: "pc-gamer",
        titulo: "O OBS está pronto e o PC não acompanha?",
        texto: `A ${loja} vê se falta memória, placa ou disco. Av. Anchieta, 789, Cambuí. WhatsApp (19) 98751-0267.`,
        rotulo: "Ver a máquina",
        href: "/montagempc",
        mensagem: "Olá! Li a matéria de OBS para live de jogo e quero ver se meu PC aguenta transmitir.",
      }),
      p("A série do jogo está em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "OBS serve para live de GTA?",
        resposta:
          "Serve. É o programa gratuito que captura o jogo, a câmera e o microfone. Hoje isso vale para o GTA V. O GTA 6 de PC ainda não foi anunciado.",
      },
      {
        pergunta: "Qual codificador usar?",
        resposta:
          "O da placa, quando ela tem. Nas GeForce, a OBS documenta o NVENC. Deixe o x264 para quando a GPU não puder codificar.",
      },
      {
        pergunta: "Quantas cenas eu preciso?",
        resposta:
          "Três chegam: jogo, pausa, e uma de começo e fim. O resto é enfeite que come memória.",
      },
      {
        pergunta: "Como testar sem ir ao ar?",
        resposta:
          "Grave localmente por alguns minutos e assista. Quadro caindo ou voz estourando se resolve antes da plateia entrar.",
      },
      {
        pergunta: "Onde pego a chave da live?",
        resposta:
          "No painel de criador da Twitch ou na ajuda de transmissão do YouTube, na sua conta. Não use chave que apareceu em tutorial.",
      },
    ],
  },
];
