import { p, h2, ul, ol, rapida, img, nota, tabela, pros, chamada, fontes } from "./blocos.mjs";

const loja = "Balão da Informática Anchieta, loja de informática em Campinas";

export const maisLives = [
  {
    slug: "setup-de-streamer-para-gta-6",
    titulo: "Setup de streamer para GTA 6: o que fica na mesa",
    seoTitulo: "Setup de streamer para GTA 6: mesa, luz e áudio",
    resumo:
      "Setup de streamer para GTA 6 se monta em zonas: tela e jogo na frente, microfone de lado, luz na cara e cabo de rede no PC. Dá para treinar hoje, no GTA V.",
    palavrasChave: ["setup de streamer para gta 6", "mesa de streamer", "setup para live", "canto de transmissão"],
    etiquetas: ["GTA 6", "Setup", "Live", "Streamer"],
    capaAlt: "Pessoa de headset olhando o monitor no escuro, setup de streamer para GTA 6.",
    fontes: fontes("obs", "rockstarVi"),
    blocos: [
      p("Setup de streamer para GTA 6 é a mesa em que você joga e fala ao mesmo tempo, sem o cabo puxar o microfone e sem a luz estourar a webcam. A versão de PC do jogo não foi anunciada. O canto que você arruma agora serve para o GTA V e para qualquer outro jogo que já entra na sua live. A ordem é zona, não shopping de LED."),
      rapida([
        "Zona 1, na sua frente: monitor na altura dos olhos e mouse com espaço para girar a câmera.",
        "Zona 2, ao lado da boca: microfone fora do teclado. Zona 3: luz na cara, não atrás da cabeça.",
        "O PC fica onde ventoinha e cabo de rede alcançam, de preferência com Ethernet, não com Wi-Fi no limite.",
      ]),
      h2("Setup de streamer para GTA 6 em três zonas"),
      p("A zona do jogo é o monitor, o teclado e o mouse. A tela na altura dos olhos evita você encolhido duas horas. O mousepad largo cabe o giro da câmera em terceira pessoa, típico de GTA. Se o teclado empurra o mouse para a borda da mesa, a mira sofre e a live também, porque você se mexe inteiro a cada curva. A matéria de [periféricos](/blog/perifericos-para-gta-6) entra nesse pedaço."),
      p("A zona da voz fica fora do caminho das teclas. Microfone de mesa num braço, ao lado da boca, ou um dinâmico perto dos lábios e longe do teclado mecânico. Headset com microfone embutido é o começo, não o teto. A diferença está em [microfone para live](/blog/microfone-para-live-de-jogo). A zona da cara é uma luz à frente, difusa, e a câmera na altura dos olhos. Janela atrás de você vira silhueta. O ajuste fino está em [webcam](/blog/webcam-para-stream)."),
      img(
        "Pedestal ao lado do notebook: o microfone não mora em cima do teclado.",
        "Microfone no pedestal ligado a um notebook, zona de voz de um setup de streamer para GTA 6.",
      ),
      tabela({
        titulo: "O que fica em cada zona da mesa",
        colunas: ["Zona", "Itens", "Erro que a live denuncia"],
        linhas: [
          ["Jogo", "Monitor, teclado, mouse, controle", "Mouse sem espaço e você acertando o copo"],
          ["Voz", "Microfone e fone fechado", "Teclado mais alto do que a fala"],
          ["Rosto", "Webcam e uma luz de frente", "Rosto escuro com a janela atrás"],
          ["Máquina", "PC, Ethernet, tomada com folga", "Wi-Fi e ventoinha gritando no microfone"],
        ],
        nota: "Arrumação da mesa. Não é lista de produto oficial de nenhum jogo.",
      }),
      h2("Cabo, cadeira e o que não precisa no primeiro mês"),
      p("Cabo solto puxa o microfone no meio da frase e derruba o controle no chão. Um velcro ou uma canaleta resolve mais do que um hub cheio de LED. A cadeira precisa aguentar a sessão. Não precisa ser a de corrida do anúncio: precisa não doer a lombar na segunda hora. Apoio de pé e mesa na altura do cotovelo mudam mais a live longa do que a cor do gabinete."),
      p("Deixe para depois o painel de LED na parede, o stream deck e a segunda câmera. Eles comem USB e atenção. Uma cena simples no [OBS](/blog/obs-para-live-de-jogo) com essa mesa já transmite. O PC que segura jogo e codificador está em [PC para live](/blog/pc-para-live-de-gta-6)."),
      img(
        "Teclado, mouse e controles na mesma mesa clara. Cada um tem lugar, senão a câmera do jogo briga com o copo.",
        "Teclado, mouse e controles numa mesa, organização de um setup de streamer para GTA 6.",
      ),
      pros(
        "Mesa pronta para transmitir",
        [
          "Monitor na altura dos olhos e mouse com curso livre.",
          "Microfone fora do teclado e luz na cara.",
          "Cabo de rede no PC e ventoinha que não domina a voz.",
        ],
        [
          "Tudo comprado num kit de LED antes de testar uma gravação de cinco minutos.",
          "Webcam contra a janela do meio-dia.",
          "Gabinete colado no microfone porque não havia outro canto.",
        ],
      ),
      p("A internet que sai dessa mesa está em [internet para fazer live](/blog/internet-para-fazer-live). O canal, em [Twitch, YouTube ou Kick](/blog/comecar-no-twitch-youtube-ou-kick)."),
      img(
        "Notebook, monitor e webcam na mesma mesa: a segunda tela, quando existe, mostra o chat, não o jogo duplicado.",
        "Notebook, monitor e webcam, setup de streamer para GTA 6 com o chat à parte.",
      ),
      chamada({
        tema: "pc-gamer",
        titulo: "A mesa está certa e o PC não?",
        texto: `A ${loja} monta a torre com folga para jogar e gravar. Av. Anchieta, 789, Cambuí, Campinas. WhatsApp (19) 98751-0267.`,
        rotulo: "Montar o PC da live",
        href: "/montagempc",
        mensagem: "Olá! Li a matéria de setup de streamer para GTA 6 e quero um PC que aguente a live.",
      }),
      p("A série está em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "O que não pode faltar num setup de streamer?",
        resposta:
          "Tela na altura dos olhos, espaço de mouse, microfone fora do teclado, luz na cara e um PC com folga para jogar e codificar.",
      },
      {
        pergunta: "Preciso de dois monitores?",
        resposta:
          "Não para começar. Um monitor joga, e o chat pode ficar no celular ou numa segunda tela quando a live já for rotina.",
      },
      {
        pergunta: "LED melhora a live?",
        resposta:
          "Melhora o clima se não estourar a câmera nem refletir na tela. Luz difusa na cara vem antes da fita colorida na parede.",
      },
      {
        pergunta: "Dá para montar isso para GTA 6?",
        resposta:
          "A mesa serve hoje para o GTA V e para outros jogos. A versão de PC do GTA 6 não foi anunciada, então o treino é no que você já transmite.",
      },
      {
        pergunta: "Onde coloco o gabinete?",
        resposta:
          "Onde a ventoinha não sopre no microfone e o cabo de rede alcance. Em cima da mesa, colado no mic, a voz fica com ruído de turbina.",
      },
    ],
  },
  {
    slug: "microfone-para-live-de-jogo",
    titulo: "Microfone para live de jogo: como a voz chega limpa",
    seoTitulo: "Microfone para live de jogo: dinâmico ou condensador",
    resumo:
      "Microfone para live de jogo: dinâmico aguenta quarto barulhento, condensador pede sala quieta. Veja distância, suporte e o teste de um minuto no OBS.",
    palavrasChave: ["microfone para live de jogo", "microfone para stream", "dinâmico ou condensador", "mic para gta"],
    etiquetas: ["Microfone", "Live", "Áudio", "GTA 6"],
    capaAlt: "Microfone e fone num setup de gravação, escolha de microfone para live de jogo.",
    fontes: fontes("obs"),
    blocos: [
      p("Microfone para live de jogo decide se a plateia entende a chamada ou ouve o teclado. O GTA, no PC, ainda é o GTA V na hora de treinar: a versão nova não foi anunciada para computador. O microfone que você escolhe agora vale para essa live e para a próxima. A regra curta é distância e tipo, não a marca mais falada do mês."),
      rapida([
        "Quarto com ventilador, rua e teclado alto: microfone dinâmico, perto da boca.",
        "Sala quieta e tratada: condensador revela detalhe, e também revela o cachorro.",
        "Fone fechado. Caixa de som aberta volta o jogo para o microfone e vira eco.",
      ]),
      h2("Microfone para live de jogo: dinâmico ou condensador"),
      p("Dinâmico perdoa ambiente. Ele quer a voz perto e ignora boa parte do que está longe, inclusive o clique da tecla e o carro na rua. É a escolha da maioria das mesas de quarto, que não têm parede acústica. Condensador é mais sensível. Em sala quieta, a voz fica cheia. Em quarto comum, ele grava o ventilador do PC, a cadeira e a conversa do lado. Se você não tratou a sala, comece pelo dinâmico."),
      p("USB facilita: liga e aparece no OBS. Interface de áudio com microfone XLR dá mais controle e mais cabo. Para a primeira live séria, USB dinâmico resolve. XLR entra quando você já sabe que o gargalo é o pré-amp, não o hábito de falar longe. O guia rápido da OBS mostra onde o dispositivo de áudio é escolhido. Se o programa está no microfone do monitor, nenhum dinâmico caro entra na live."),
      img(
        "Microfone e câmera apontados para o mesmo lugar: os dois precisam ver você, não o teto.",
        "Microfone e câmera na mesma mesa, posição de um microfone para live de jogo.",
      ),
      tabela({
        titulo: "Qual tipo combina com a sua sala",
        colunas: ["Sua sala", "Tipo", "Distância"],
        linhas: [
          ["Ventilador, janela para a rua, teclado mecânico", "Dinâmico", "Perto da boca, ao lado, não na frente do sopro"],
          ["Quarto fechado, PC silencioso", "Condensador serve", "Um palmo, com o ganho mais baixo"],
          ["Você anda pela sala enquanto fala", "Headset, por enquanto", "O de mesa vai ficar para trás"],
          ["Caixa de som em vez de fone", "Nenhum fica limpo", "Troque para fone fechado antes de trocar o mic"],
        ],
        nota: "Escolha de formato. Modelo e preço mudam. A loja mostra o que está no balcão no dia.",
      }),
      h2("Posição, ganho e o teste de um minuto"),
      p("O microfone fica ao lado da boca, apontado para ela, não de frente para o sopro das plosivas. Um palmo de distância no dinâmico é ponto de partida. Mais longe, você aumenta o ganho e o quarto entra junto. No OBS, fale a frase que você usa quando morre no jogo, no volume real, e olhe a barra. Verde no meio, sem bater no teto. Se bate, baixe. Se nem se mexe, aproxime, não só aumente o ganho."),
      p("Filtro de ruído ajuda um ventilador constante. Não faz milagre em teclado colado na cápsula. Afaste primeiro, filtre depois. Suporte de braço tira o mic da mesa e do impacto do mouse. Pedestal de mesa também serve se não dançar quando você apoia o pulso. Choque mecânico, aquele suporte que segura o mic por elástico, corta a batida na mesa."),
      img(
        "Headset na frente de dois monitores: o microfone do fone é o ensaio. O de mesa é o passo seguinte.",
        "Headset e teclado na frente de dois monitores, comparação com um microfone para live de jogo.",
      ),
      pros(
        "Voz limpa",
        [
          "Dinâmico perto da boca em quarto comum.",
          "Fone fechado, para o jogo não voltar ao mic.",
          "Teste de um minuto no OBS antes de abrir a live.",
        ],
        [
          "Condensador no máximo no meio da sala, longe da boca.",
          "Microfone em cima do teclado mecânico.",
          "Caixa de som alta e microfone sensível no mesmo metro.",
        ],
      ),
      ol([
        "Escolha o tipo pela sala, não pelo vídeo de unboxing.",
        "Posicione ao lado da boca e prenda o cabo.",
        "Selecione esse dispositivo no OBS, não o do monitor.",
        "Grave um minuto, assista de fone, e ajuste ganho.",
      ]),
      p("A cena inteira está em [OBS para live](/blog/obs-para-live-de-jogo). A mesa, em [setup de streamer](/blog/setup-de-streamer-para-gta-6)."),
      img(
        "Fone, teclado e mousepad: se o mic mora aqui no meio, ele grava a tecla. Puxe para o lado da boca.",
        "Fone, teclado mecânico e mousepad, mesa em que o microfone para live de jogo precisa sair de cima das teclas.",
      ),
      chamada({
        tema: "geral",
        titulo: "Quer ouvir o microfone antes de levar?",
        texto: `Na ${loja} você testa o mic no balcão do Cambuí. Av. Anchieta, 789. WhatsApp (19) 98751-0267.`,
        rotulo: "Falar com a loja",
        href: "/fale-conosco",
        mensagem: "Olá! Li a matéria de microfone para live de jogo e quero testar um modelo na loja.",
      }),
      p("A série está em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "Dinâmico ou condensador para live de jogo?",
        resposta:
          "Dinâmico se o quarto tem barulho de teclado, ventilador ou rua. Condensador se a sala é quieta. Na dúvida, dinâmico perdoa mais.",
      },
      {
        pergunta: "USB ou XLR?",
        resposta:
          "USB para começar: liga e aparece no OBS. XLR com interface quando você já sabe que quer mais controle. Os dois ficam ruins se o mic está longe.",
      },
      {
        pergunta: "O microfone do headset serve?",
        resposta:
          "Serve para ensaiar e para call. Para uma live em que a voz é parte do canal, um microfone dedicado perto da boca é outro patamar.",
      },
      {
        pergunta: "Por que o teclado sai mais alto que eu?",
        resposta:
          "Porque o mic está em cima das teclas ou o ganho está alto demais. Afaste, abaixe o ganho e só então pense em filtro.",
      },
      {
        pergunta: "Preciso de mesa de som?",
        resposta:
          "Não para a primeira live. O misturador do OBS e um mic decente resolvem. Mesa entra quando há mais de uma fonte de verdade.",
      },
    ],
  },
  {
    slug: "webcam-para-stream",
    titulo: "Webcam para stream: o rosto nítido sem complicar a cena",
    seoTitulo: "Webcam para stream: luz, enquadramento e 1080p",
    resumo:
      "Webcam para stream fica nítida com luz na cara, câmera na altura dos olhos e 1080p. Veja enquadramento, fundo e o que deixar para depois da primeira live.",
    palavrasChave: ["webcam para stream", "câmera para live", "iluminação para webcam", "webcam 1080p"],
    etiquetas: ["Webcam", "Live", "Streaming"],
    capaAlt: "Monitor com uma câmera ao lado e fone na mesa, webcam para stream na altura dos olhos.",
    fontes: fontes("obs"),
    blocos: [
      p("Webcam para stream mostra a sua cara enquanto o jogo ocupa o resto da tela. 1080p já basta para uma janela no canto. O que separa a imagem aceitável da silhueta escura é a luz na frente do rosto e a câmera na altura dos olhos, não o sensor mais caro. Dá para acertar isso hoje, numa live de GTA V ou de qualquer jogo. O GTA 6 de PC ainda não tem data."),
      rapida([
        "Luz difusa na sua frente. Janela atrás vira você num vulto.",
        "Câmera na altura dos olhos, ou um pouco acima. No peito, o ângulo é de reunião cansada.",
        "1080p a 30 quadros está ótimo numa janela pequena. 4K na webcam não salva luz ruim.",
      ]),
      h2("Webcam para stream: luz antes de resolução"),
      p("Sensor de webcam enxerga pouco no escuro. Se a única luz é o monitor, o rosto fica azul e granulado, e você aumenta o ganho digital até aparecer ruído. Uma luminária difusa, ou um ring light fraco, na sua frente e um pouco acima, resolve a maior parte dos quartos. Não aponte o LED cru para o olho a dez centímetros. Difunda com um papel, uma cúpula ou só recuando a luz."),
      p("Fundo bagunçado compete com você. Não precisa de estúdio: precisa de uma parede, uma estante arrumada ou a profundidade desfocada se a câmera oferecer. No OBS, a fonte de vídeo entra por cima do jogo, pequena, num canto que não tape o que importa no GTA, como o minimapa. A matéria de [OBS](/blog/obs-para-live-de-jogo) mostra essa cena mínima."),
      img(
        "Headset e mesa à noite: sem uma luz na cara, a câmera só registra o brilho do monitor.",
        "Pessoa de headset numa mesa de jogo à noite, situação em que a webcam para stream precisa de luz frontal.",
      ),
      tabela({
        titulo: "Ajuste da câmera, do mais barato ao mais caro",
        colunas: ["Ajuste", "Efeito", "Custo"],
        linhas: [
          ["Luz na frente do rosto", "Acaba com o grão e a silhueta", "Uma luminária que você já pode ter"],
          ["Altura dos olhos", "Para de filmar a narina", "Um apoio ou o monitor com a câmera em cima"],
          ["1080p e janela pequena", "Nítido no canto da live", "A webcam de entrada atual"],
          ["Câmera de foto com captura", "Mais controle, mais cabo e atraso para configurar", "Só quando a webcam já está bem iluminada e ainda não basta"],
        ],
        nota: "Ordem prática. Especificação de modelo muda. Prove a imagem no OBS, não na caixa.",
      }),
      h2("Enquadramento e o que cortar"),
      p("Do peito para cima, com um pouco de ar acima da cabeça, é o quadro clássico de comentário. Colado no queixo, qualquer gesto sai da tela. Largo demais, você vira um ponto e o quarto vira o assunto. Se você olha para o monitor e não para a lente, tudo bem: a plateia entende que você está jogando. A lente um pouco acima do monitor faz esse olhar ficar natural, não para baixo."),
      p("Fundo virtual come processamento e falha no cabelo e no fone. Use quando a parede for impossível, e teste se o PC da live, descrito em [PC para live](/blog/pc-para-live-de-gta-6), ainda segura o jogo. Às vezes desligar o fundo devolve o quadro que faltava. A mesa em volta da câmera está no [setup](/blog/setup-de-streamer-para-gta-6)."),
      img(
        "No balcão, teclado e monitor mostram a altura certa: a câmera mora em cima da tela, não no colo.",
        "Teclado e monitor no balcão da loja, referência de altura para a webcam para stream.",
      ),
      pros(
        "Imagem que a gente assiste",
        [
          "Luz frontal difusa e câmera na altura dos olhos.",
          "Janela pequena, sem tapar a interface do jogo.",
          "Fundo simples, que não pisca nem compete com você.",
        ],
        [
          "Única luz é o monitor, e o ganho da câmera no máximo.",
          "Webcam 4K no escuro, achando que resolução cria luz.",
          "Fundo virtual pesado num PC que já luta com o jogo.",
        ],
      ),
      p("O áudio que acompanha essa cara está em [microfone para live](/blog/microfone-para-live-de-jogo). Um rosto nítido com voz de teclado ainda é uma live pela metade."),
      img(
        "As luminárias em X no teto da loja são ambiente. Na sua mesa, a luz que vale é a que bate na cara, de frente.",
        "Luminárias no teto da Balão da Informática Anchieta, lembrete de que a webcam para stream depende da luz.",
      ),
      nota(
        "dica",
        "Teste de trinta segundos",
        "Grave no OBS com a luz que você vai usar de noite, não ao meio-dia. Assista mudo. Se der para ver o olho e o fone, a câmera passou.",
      ),
      chamada({
        tema: "geral",
        titulo: "Quer ver a webcam na tela da loja?",
        texto: `A ${loja} mostra a imagem no balcão do Cambuí. Av. Anchieta, 789. WhatsApp (19) 98751-0267.`,
        rotulo: "Chamar a loja",
        href: "/fale-conosco",
        mensagem: "Olá! Li a matéria de webcam para stream e quero ver um modelo na loja.",
      }),
      p("A série está em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "Qual webcam comprar para stream?",
        resposta:
          "Uma de 1080p já serve na janela do canto, desde que haja luz na sua frente e a câmera esteja na altura dos olhos.",
      },
      {
        pergunta: "Preciso de 4K?",
        resposta:
          "Não para começar. 4K na webcam não corrige quarto escuro e pesa mais no PC. Luz boa em 1080p aparece melhor.",
      },
      {
        pergunta: "A câmera do celular serve?",
        resposta:
          "Serve de ensaio, com um app que o OBS enxergue como câmera. Para a rotina, uma webcam fixa no monitor treme menos e liga sozinha.",
      },
      {
        pergunta: "Onde posicionar?",
        resposta:
          "Em cima do monitor, na altura dos olhos, filmando do peito para cima. Embaixo, o ângulo filma o nariz e o teto some.",
      },
      {
        pergunta: "Fundo virtual vale a pena?",
        resposta:
          "Só se a parede for impossível e o PC ainda sobrar quadro. Ele erra no cabelo e no fone e gasta processamento.",
      },
    ],
  },
  {
    slug: "internet-para-fazer-live",
    titulo: "Internet para fazer live: o que medir antes de abrir",
    seoTitulo: "Internet para fazer live: upload, cabo e teste",
    resumo:
      "Internet para fazer live depende da subida, não do download do anúncio. Use cabo, meça na hora da live e deixe folga acima do bitrate.",
    palavrasChave: ["internet para fazer live", "upload para stream", "quantos megas para live", "cabo ou wifi para transmitir"],
    etiquetas: ["Internet", "Live", "Streaming"],
    capaAlt: "Cabo de rede Ethernet com conector RJ-45, o caminho estável de internet para fazer live.",
    fontes: fontes("obs", "twitch", "youtube"),
    blocos: [
      p("Internet para fazer live é a subida, o upload, estável na hora em que você transmite. A propaganda do plano fala o download, que baixa jogo e página. Quem assiste a sua live depende do caminho contrário. O OBS manda o vídeo para a Twitch, o YouTube ou a Kick. Se essa subida oscila, a imagem para, mesmo com o PC sobrando."),
      rapida([
        "Cabo Ethernet no PC. Wi-Fi serve para o celular, e oscila quando o micro-ondas ou a parede entram no meio.",
        "Meça a subida no horário da live, não às três da tarde de um domingo vazio.",
        "O bitrate do OBS precisa caber na subida com folga. O número certo é o da recomendação atual da plataforma, não um print antigo.",
      ]),
      h2("Internet para fazer live: subida, cabo e horário"),
      p("Faça um teste de velocidade no computador que vai transmitir, com cabo, no horário em que a live acontece. Anote a subida, não só a descida. Repita em dois dias. Se um dia dá um número e no outro cai pela metade, o problema é estabilidade, e bitrate alto só vai piorar. O assistente do OBS sugere um ponto de partida. A Central de Criadores da Twitch e a ajuda de transmissão do YouTube publicam a recomendação vigente. Use a de agora, porque essas tabelas mudam."),
      p("Deixe folga. Se o OBS manda quase o total da sua subida, qualquer outra pessoa da casa num vídeo já derruba a live. Feche backup de nuvem e atualização de jogo antes de ir ao ar. Baixar o GTA e transmitir ao mesmo tempo, no mesmo enlace, é o jeito clássico de culpar a plataforma por um congestionamento que está na sua rede."),
      img(
        "Roteador ao lado do monitor: perto do PC o cabo é curto, e curto é bom. Wi-Fi atravessando a casa é que falha.",
        "Roteador ao lado de um monitor, cenário de internet para fazer live com cabo em vez de Wi-Fi.",
      ),
      tabela({
        titulo: "O que medir de verdade",
        colunas: ["Medida", "Por que importa", "O que ignorar"],
        linhas: [
          ["Upload no horário da live", "É o vídeo saindo", "O download gigante do anúncio do plano"],
          ["Teste repetido", "Mostra se oscila", "Um único teste às 15h"],
          ["Cabo no PC da live", "Tira o Wi-Fi do caminho", "O celular ao lado do roteador, que não é o PC"],
          ["Bitrate abaixo da subida, com folga", "Cabe o vídeo e o resto da casa", "O maior número que um tutorial de 2021 citou"],
        ],
        nota: "Método de teste. O valor em megabits recomendado está na documentação atual da Twitch, do YouTube e do assistente do OBS.",
      }),
      h2("Wi-Fi, cabo e o resto da casa"),
      p("Wi-Fi 5 GHz, perto do roteador, às vezes aguenta uma live leve. Parede, micro-ondas e o videogame de outra pessoa no mesmo rádio derrubam quadro sem o PC ter culpa. Cabo não discute com a parede. Se o roteador está longe, um cabo passado com cuidado, ou um par de adaptadores que você teste de verdade, vale mais do que trocar de plano às cegas. Meça de novo depois da mudança. Se o número não mudou, o limite é o plano ou o horário, não o rádio."),
      p("Quem divide a conexão combina a regra da noite de live: sem download grande na mesma hora. Isso é conversa de casa, e resolve mais do que o modo turbo do roteador. O PC em si, se a gravação local é boa e só a live ao vivo trava, está inocente. A matéria de [PC para live](/blog/pc-para-live-de-gta-6) separa esse diagnóstico. O [OBS](/blog/obs-para-live-de-jogo) é onde o bitrate se ajusta."),
      img(
        "Antena e cabo no mesmo roteador. Para a live, use o cabo. Deixe o Wi-Fi para o celular do chat, se precisar.",
        "Roteador Wi-Fi com antenas e cabo, escolha de internet para fazer live pelo Ethernet.",
      ),
      pros(
        "Live sem travar no meio",
        [
          "Ethernet no computador que transmite.",
          "Upload medido no horário real, com folga acima do bitrate.",
          "Download grande pausado enquanto você está no ar.",
        ],
        [
          "Testar a velocidade no celular e achar que o PC, do outro lado da casa, tem o mesmo número.",
          "Subir o bitrate porque a imagem “ficou mais nítida no preview” e a subida não cabe.",
          "Trocar de plano sem medir. Às vezes o cabo já resolvia.",
        ],
      ),
      p("Onde abrir o canal, depois que a rede passa no teste, está em [Twitch, YouTube ou Kick](/blog/comecar-no-twitch-youtube-ou-kick)."),
      img(
        "Headset e tela no escuro: se a imagem parar, olhe a subida antes de culpar o jogo.",
        "Pessoa de headset jogando no escuro, live que depende de internet estável para fazer live.",
      ),
      nota(
        "dica",
        "Ordem do diagnóstico",
        "Grave local primeiro. Se o arquivo no disco está liso e só a transmissão ao vivo trava, é rede. Se o arquivo local já soluça, é PC, e a internet nem foi testada ainda.",
      ),
      chamada({
        tema: "geral",
        titulo: "A rede passa e o PC não?",
        texto: `A ${loja} olha memória, placa e disco no Cambuí. Av. Anchieta, 789, Campinas. WhatsApp (19) 98751-0267.`,
        rotulo: "Chamar a loja",
        href: "/fale-conosco",
        mensagem: "Olá! Li a matéria de internet para fazer live e quero ver se o travamento é o PC ou a rede.",
      }),
      p("A série está em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "Quantos megas preciso para fazer live?",
        resposta:
          "O número que importa é a subida, e ele tem de caber o bitrate do OBS com folga. A recomendação vigente está na Twitch, no YouTube e no assistente do OBS. Meça no seu horário, não copie um tutorial antigo.",
      },
      {
        pergunta: "Wi-Fi serve para transmitir?",
        resposta:
          "Perto do roteador, às vezes. Cabo é mais estável. Parede e outros aparelhos no mesmo Wi-Fi derrubam a live sem o PC ter culpa.",
      },
      {
        pergunta: "Download alto garante a live?",
        resposta:
          "Não. Download baixa arquivo. A live usa a subida. Plano com download enorme e upload curto trava a transmissão.",
      },
      {
        pergunta: "Como saber se o problema é a internet?",
        resposta:
          "Grave no disco. Se o arquivo local está bom e só a live ao vivo trava, é a subida ou a estabilidade da rede.",
      },
      {
        pergunta: "Posso baixar o jogo durante a live?",
        resposta:
          "Pode, e a imagem vai sofrer se os dois dividirem o mesmo enlace no limite. Pause atualização e backup antes de abrir.",
      },
    ],
  },
  {
    slug: "gta-rp-e-o-que-o-gta-6-nao-e",
    titulo: "GTA RP hoje roda em GTA V: o que muda com o GTA 6",
    seoTitulo: "GTA RP hoje é GTA V: o que o GTA 6 ainda não é",
    resumo:
      "GTA RP hoje roda em GTA V, com a regra do servidor. GTA 6 estreia a campanha no console. Não há RP de GTA 6 para montar PC em cima.",
    palavrasChave: ["gta rp", "gta rp gta 6", "servidor de gta rp", "gta v rp"],
    etiquetas: ["GTA RP", "GTA V", "GTA 6", "PC"],
    capaAlt: "Pessoa de fone jogando no sofá à noite, o clima de uma sessão de GTA RP.",
    fontes: fontes("rockstarVi", "gtavPc", "yahooPc"),
    blocos: [
      p("GTA RP, do jeito que a gente assiste e joga hoje, acontece em GTA V. É um servidor com regras, personagem e outros jogadores, em cima do jogo que está no PC desde 14 de abril de 2015. Grand Theft Auto VI estreia a campanha em 19 de novembro de 2026 no PS5 e no Xbox Series X|S. A Rockstar não anunciou versão de PC nem um modo de RP desse jogo. Tratar os dois como a mesma coisa é o atalho para comprar peça pelo motivo errado."),
      rapida([
        "RP de hoje: GTA V no computador, num servidor da comunidade, com as regras daquele servidor.",
        "GTA 6 na estreia: campanha de Lucia e Jason, no console. Não é um servidor de RP.",
        "O PC para RP se monta para o GTA V que você já entra, com folga se você também transmite.",
      ]),
      h2("GTA RP é o jogo de hoje, não o trailer de amanhã"),
      p("Num servidor de RP você cria um personagem, entra numa cidade cheia de outras pessoas e segue a regra da casa: polícia, médico, civil, o que o servidor oferecer. Isso pede o GTA V instalado, uma conta na plataforma que o servidor usa e um PC que segure a cidade com vários jogadores na tela. Não pede o GTA 6. Quem anuncia “PC pronto para o RP do GTA 6” está vendendo um produto que a Rockstar não colocou à venda."),
      p("A campanha nova é outra noite. Lucia Caminos e Jason Duval, em Leonida, no console, como está na matéria da [dupla](/blog/gta-6-lucia-e-jason) e na de [plataformas](/blog/gta-6-plataformas-ps5-xbox-e-pc). Dá para gostar das duas coisas. Não dá para usar o mesmo atalho de instalação. A Yahoo, em 15 de novembro de 2026, registrou a ausência de anúncio de PC. Enquanto essa página não existir, o RP continua no GTA V."),
      img(
        "Console e controle: é por aqui que a campanha do GTA 6 entra na sala. O RP de hoje, no PC, é outra instalação.",
        "Console e controle brancos, aparelho da campanha, distinto do PC em que o GTA RP de GTA V roda.",
      ),
      tabela({
        titulo: "RP de hoje e campanha nova",
        colunas: ["", "GTA RP agora", "GTA 6 na estreia"],
        linhas: [
          ["Jogo", "GTA V", "Grand Theft Auto VI"],
          ["Onde", "PC, em servidor da comunidade", "PS5 e Xbox Series X|S"],
          ["O que você faz", "Personagem num servidor, com regra", "Campanha de Lucia e Jason"],
          ["O que a Rockstar publicou de PC", "GTA V está no PC desde 2015", "Versão de PC do GTA 6 não anunciada"],
        ],
        fonte: "rockstarVi",
        nota: "A data de PC do GTA V está no newswire de 14 de abril de 2015. A lista de estreia do GTA 6 está na página oficial.",
      }),
      h2("O PC que o RP de verdade pede"),
      p("Cidade com muitos jogadores pede o mesmo trio de sempre: SSD para a cidade não carregando no meio da rua, memória folgada se você deixa o Discord e o navegador do servidor abertos, e uma placa à altura da sua tela. Se você transmite o RP, soma o codificador. Isso está em [PC para live](/blog/pc-para-live-de-gta-6) e em [SSD](/blog/ssd-para-gta-6). Nada disso é ficha do GTA 6. É o que segura o GTA V lotado, que é o jogo que o servidor roda."),
      p("Leia a regra do servidor antes de entrar com o personagem que você viu num clipe. Cada comunidade tem tom, whitelist e o que acontece se você quebra a regra. Isso não é configuração de PC, e muda mais a sua noite do que mais 10% de quadro. Microfone funciona aqui como no resto da live: se ninguém entende você, o personagem não existe. O guia é o de [microfone](/blog/microfone-para-live-de-jogo)."),
      img(
        "Mesa com neon e headset: é o setup de quem entra no servidor e também de quem assiste. O jogo por trás, hoje, é GTA V.",
        "Pessoa de headset numa mesa com neon, ambiente de quem joga GTA RP em GTA V.",
      ),
      pros(
        "Entrar no RP sem confusão",
        [
          "Instalar o GTA V e seguir o tutorial do servidor que você escolheu.",
          "PC com SSD, RAM folgada e a placa da sua tela.",
          "Microfone compreensível e a regra lida antes do primeiro personagem.",
        ],
        [
          "Comprar peça “para o RP do GTA 6” antes de existir versão de PC.",
          "Achar que a campanha do console já é um servidor de RP.",
          "Entrar num servidor sem ler o que acontece se você atira à toa.",
        ],
      ),
      p("A escolha da máquina, sem misturar os dois jogos, está em [PC para GTA 6](/blog/pc-para-gta-6-sem-requisito-oficial). Quem está em Campinas vê a torre no [Cambuí](/blog/pc-gamer-gta-6-campinas)."),
      img(
        "O balão da calçada marca a loja. Lá dentro a conversa é o PC do jogo que você já abre, não uma ficha que não existe.",
        "Balão inflável na calçada da Balão da Informática Anchieta, loja que monta PC para GTA RP em GTA V.",
      ),
      chamada({
        tema: "pc-gamer",
        titulo: "O RP trava na sua máquina?",
        texto: `A ${loja} olha disco, memória e placa para o GTA V que o servidor usa. Av. Anchieta, 789, Cambuí. WhatsApp (19) 98751-0267.`,
        rotulo: "Pedir orçamento",
        href: "/montagempc",
        mensagem: "Olá! Li a matéria de GTA RP e quero um PC estável para jogar GTA V em servidor.",
      }),
      p("A série está em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "GTA RP já é no GTA 6?",
        resposta:
          "Não. O RP que roda hoje é em GTA V, no PC. O GTA 6 estreia a campanha no PS5 e no Xbox Series X|S. Não há RP oficial desse jogo anunciado.",
      },
      {
        pergunta: "Preciso de um PC específico para RP?",
        resposta:
          "Precisa de um PC que rode GTA V com a cidade cheia, de preferência em SSD, com memória para o Discord e o navegador. Se você transmite, soma folga de codificação.",
      },
      {
        pergunta: "A campanha do GTA 6 substitui o servidor?",
        resposta:
          "Não. São modos diferentes. A campanha é a história de Lucia e Jason. O RP é um servidor com regra, em cima do GTA V.",
      },
      {
        pergunta: "Vale montar PC agora por causa do RP do GTA 6?",
        resposta:
          "Vale montar para o RP que existe, o de GTA V. Não vale pagar a mais por uma versão de GTA 6 que a Rockstar não anunciou.",
      },
      {
        pergunta: "Onde entra o microfone?",
        resposta:
          "No RP a voz é o personagem. Um microfone perto da boca, com o teclado mais baixo, deixa a cidade entender você. O guia de microfone detalha a escolha.",
      },
    ],
  },
  {
    slug: "comecar-no-twitch-youtube-ou-kick",
    titulo: "Começar no Twitch, YouTube ou Kick com live de jogo",
    seoTitulo: "Começar no Twitch, YouTube ou Kick em 2026",
    resumo:
      "Começar no Twitch, YouTube ou Kick pede conta, chave guardada e uma cena testada. Veja a diferença de cada um e o primeiro passo, sem pular o ensaio.",
    palavrasChave: ["começar no twitch", "twitch youtube ou kick", "primeira live", "abrir canal de jogos"],
    etiquetas: ["Twitch", "YouTube", "Kick", "Live"],
    capaAlt: "Pessoa na mesa de jogo com luz neon, pronta para começar no Twitch, YouTube ou Kick.",
    fontes: fontes("twitch", "youtube", "obs"),
    blocos: [
      p("Começar no Twitch, no YouTube ou na Kick é abrir uma conta, proteger a chave de transmissão e fazer uma live curta que você mesmo assiste depois. O jogo pode ser GTA V, outro que você já domina, ou o que a sua mesa aguenta. GTA 6 de PC não foi anunciado, então a primeira transmissão não depende dele. Depende de uma cena estável e de você aparecer mais de uma vez."),
      rapida([
        "Twitch é a praça clássica de live de jogo, com a Central de Criadores explicando o painel.",
        "YouTube junta live e vídeo gravado. A ajuda oficial descreve como transmitir.",
        "Kick é a terceira porta. As regras e o painel mudam: leia os termos da própria Kick antes de levar a sua comunidade para lá.",
      ]),
      h2("Começar no Twitch, YouTube ou Kick: por onde"),
      p("Twitch continua o lugar em que a live de jogo é o produto principal. Você cria a conta, confirma o e-mail, pega a chave no painel e cola no OBS. A Central de Criadores é a página que a própria Twitch mantém, e é melhor do que um tutorial com print velho da interface. YouTube serve para quem já pensa em deixar o VOD e o corte no mesmo canal em que a live acontece. A ajuda do YouTube descreve o caminho de transmitir. Os dois pedem a mesma cena técnica. Muda a plateia e o hábito de descoberta."),
      p("A Kick entrou na conversa de quem quer uma terceira vitrine. Como o painel e as regras não são os da Twitch, não copie o passo a passo de uma na outra. Crie a conta no site oficial, leia o que eles pedem de idade e de conteúdo, e só então conecte o OBS. Qualquer das três fica ruim se a chave vaza. Gere outra na hora. A matéria de [OBS](/blog/obs-para-live-de-jogo) mostra onde essa chave entra, e por que ela não vai para print."),
      img(
        "Luz vermelha e azul na mesa: a plataforma muda, a cena é a mesma. Jogo legível, voz limpa, teste feito.",
        "Pessoa jogando no PC com luz colorida, primeira live para começar no Twitch, YouTube ou Kick.",
      ),
      tabela({
        titulo: "As três portas, sem preferência escondida",
        colunas: ["Plataforma", "O que combina", "Onde ler o oficial"],
        linhas: [
          ["Twitch", "Live de jogo como programa principal", "Central de Criadores"],
          ["YouTube", "Quem também publica vídeo e deixa o VOD trabalhar", "Ajuda de transmissão ao vivo"],
          ["Kick", "Quem quer uma terceira comunidade e aceita ler a regra de lá", "O site e os termos da própria Kick"],
        ],
        nota: "A Kick não tem, aqui, um guia único tão estável quanto o da Twitch e o do YouTube. Confira no site oficial no dia em que for abrir a conta.",
      }),
      h2("A primeira semana, sem plateia imaginária"),
      ol([
        "Escolha um jogo que você consegue narrar sem olhar tutorial a cada minuto. GTA V serve, se você já joga.",
        "Deixe a cena pronta: jogo, voz, e câmera só se a luz ajudar. Webcam no escuro atrapalha mais do que some.",
        "Faça uma live curta, de verdade, mesmo que só seu amigo assista. Grave e assista você mesmo.",
        "Anote uma coisa só para melhorar na seguinte: áudio, enquadramento ou o assunto. Não as três.",
        "Volte no horário que você disse que voltaria. Canal nasce de repetição, não de estreia com overlay de cinema.",
      ]),
      p("A parte chata que evita a live muda é a rede e o PC. [Internet](/blog/internet-para-fazer-live) na subida, com cabo. [PC para live](/blog/pc-para-live-de-gta-6) se a gravação local já cai. [Microfone](/blog/microfone-para-live-de-jogo) se a voz perde para o teclado. Resolver isso antes de convidar a cidade inteira é o que separa a segunda live da desistência."),
      img(
        "Monitor iluminando o rosto no escuro: funciona como ensaio. Para a live com câmera, uma luz de frente ainda ajuda.",
        "Homem jogando no escuro, ensaio visual de quem vai começar no Twitch, YouTube ou Kick.",
      ),
      pros(
        "Primeira live que você consegue repetir",
        [
          "Um jogo que você já sabe jogar.",
          "Chave guardada, cena testada, cabo na rede.",
          "Horário curto e uma melhoria só por vez.",
        ],
        [
          "Overlay de dez alertas na estreia.",
          "Jogo que você nunca abriu, ao vivo, com plateia.",
          "Trocar de plataforma toda semana antes de ter o hábito.",
        ],
      ),
      p("A mesa em volta está no [setup de streamer](/blog/setup-de-streamer-para-gta-6). Se o jogo da estreia for RP, leia antes [o que o GTA RP é](/blog/gta-rp-e-o-que-o-gta-6-nao-e): hoje ele roda em GTA V."),
      img(
        "Luz colorida e cadeira: o clima ajuda, e não substitui a segunda live na semana seguinte.",
        "Jovem jogando com luz colorida, rotina de quem começou no Twitch, YouTube ou Kick.",
      ),
      nota(
        "dica",
        "Idade e regra",
        "Cada plataforma tem idade mínima e regra de conteúdo. Leia antes de abrir. Jogo com classificação alta não é desculpa para ignorar o termo.",
      ),
      chamada({
        tema: "pc-gamer",
        titulo: "A conta está feita e o PC não segura?",
        texto: `A ${loja} monta a máquina da live no Cambuí. Av. Anchieta, 789, Campinas. WhatsApp (19) 98751-0267. Telefone (19) 3255-1661.`,
        rotulo: "Montar para a primeira live",
        href: "/montagempc",
        mensagem: "Olá! Li a matéria de como começar no Twitch, YouTube ou Kick e quero um PC para transmitir.",
      }),
      p("A série do jogo está em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "Onde começar a transmitir jogo?",
        resposta:
          "Twitch, se a live é o principal. YouTube, se você também quer o vídeo gravado no mesmo canal. Kick, se você leu os termos de lá e quer essa comunidade. A técnica do OBS é a mesma.",
      },
      {
        pergunta: "Preciso de GTA 6 para a primeira live?",
        resposta:
          "Não. A versão de PC não foi anunciada. Comece num jogo que você já sabe jogar, como o GTA V.",
      },
      {
        pergunta: "Quantas pessoas precisam assistir?",
        resposta:
          "Zero na primeira. O objetivo é você assistir o próprio VOD, corrigir uma coisa e voltar no horário combinado.",
      },
      {
        pergunta: "Posso usar a mesma cena nas três?",
        resposta:
          "Pode. Muda a chave e o painel. Não mude a chave de uma plataforma na configuração da outra, e não compartilhe a chave.",
      },
      {
        pergunta: "O que preparar antes de abrir?",
        resposta:
          "Cena testada no OBS, microfone sem estourar, cabo de rede e o bitrate cabendo na sua subida. Sem isso, a plataforma não salva a live.",
      },
    ],
  },
];
