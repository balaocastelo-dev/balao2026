import { p, h2, ul, rapida, img, nota, tabela, pros, chamada, fontes } from "./blocos.mjs";

const loja = "Balão da Informática Anchieta, loja de informática em Campinas";

export const maisPecas = [
  {
    slug: "ssd-para-gta-6",
    titulo: "SSD para GTA 6: por que o disco muda a hora de jogar",
    seoTitulo: "SSD para GTA 6: espaço, NVMe e o que instalar",
    resumo:
      "SSD para GTA 6: no PS5 são pelo menos 212 GB. No PC, o NVMe evita a cidade carregando na curva. Veja a folga e o que não deixar no HD.",
    palavrasChave: ["ssd para gta 6", "espaço em disco gta 6", "nvme para jogo", "hd ou ssd gta 6"],
    etiquetas: ["GTA 6", "SSD", "Armazenamento"],
    capaAlt: "SSD NVMe encaixado numa placa, o disco que muda o carregamento de jogos como GTA 6.",
    fontes: fontes("playstation", "verge", "rockstarVi"),
    blocos: [
      p("SSD para GTA 6 entra na conversa por um número que já existe, e por um que ainda não existe. No PlayStation 5, a PlayStation pede pelo menos 212 GB livres para a pré-carga. No computador, a Rockstar não publicou instalador nem versão. O que já dá para fazer é tirar jogo grande de HD antigo e deixar folga num SSD NVMe, porque mundo aberto lê a cidade enquanto você dirige."),
      rapida([
        "212 GB é o piso do PS5, publicado pela PlayStation. Não é o tamanho de um futuro instalador de PC.",
        "No computador, jogo grande vai para SSD. HD fica para arquivo, foto e o que você não abre toda noite.",
        "Deixe espaço livre além do instalador. Disco cheio até a tampa fica lento e falha na atualização.",
      ]),
      h2("SSD para GTA 6: o que o número do console ensina"),
      p("Duzentos e doze gigabytes, no console, já incluem o cuidado de apagar coisa antes da estreia. A The Verge registrou a frase da Rockstar de “até 212 GB, conforme o aparelho”. A página da PlayStation é mais direta: libere no mínimo 212 GB. Quem tem o PS5 encontra o calendário na matéria de [pré-carga](/blog/gta-6-pre-carga-e-tamanho). Quem está no PC usa o número como aviso de escala. Um jogo desse tamanho, mais o sistema, mais a captura da jogada, não cabe num SSD de 256 GB que já guarda o Windows e dois lançamentos."),
      p("HD mecânico ainda guarda arquivo com competência. Ele não serve como disco do jogo quando a cidade é transmitida do armazenamento para a memória no meio do movimento. A pausa para “ler” a próxima quadra é o sintoma clássico. SSD, em especial NVMe encaixado na placa-mãe, corta essa espera nos jogos atuais. Quando a versão de PC do GTA 6 existir, a tendência de a Rockstar pedir SSD já apareceu em GTA V e em Red Dead no computador. Tendência não é ficha. É motivo para não comprar HD “porque tem mais terabyte pelo mesmo dinheiro”."),
      img(
        "HD externo resolve backup. Não resolve a cidade carregando no meio da avenida.",
        "HD externo com cabo USB, armazenamento que não substitui o SSD para GTA 6 e jogos de mundo aberto.",
      ),
      tabela({
        titulo: "Onde colocar cada tipo de arquivo",
        colunas: ["Arquivo", "Disco certo", "Motivo"],
        linhas: [
          ["Windows e o jogo que você abre toda noite", "SSD NVMe", "Leitura o tempo todo, inclusive enquanto você dirige"],
          ["Jogo que você abre uma vez por mês", "SSD, se couber", "Ainda sofre em HD, só dói menos"],
          ["Foto, vídeo da família, instalador velho", "HD ou nuvem", "Não precisa da velocidade do NVMe"],
          ["Captura de gameplay", "SSD com folga", "Gravar em disco cheio derruba o quadro"],
        ],
        nota: "Organização para o PC de hoje. O tamanho oficial de um GTA 6 de computador não foi publicado.",
      }),
      h2("Quanta folga deixar"),
      p("Uma regra simples, sem inventar o instalador futuro: separe um SSD de 1 TB para sistema e jogos se você guarda mais de dois títulos grandes, ou de 2 TB se você não apaga nada. Encha no máximo até sobrar uns 15% a 20% livres. Atualização de jogo e o arquivo de paginação precisam desse ar. Disco em 98% falha do jeito mais chato, no meio do patch, na sexta à noite."),
      p("NVMe e SATA são os dois formatos comuns. NVMe é o pente na placa-mãe, mais rápido. SATA é o de 2,5 polegadas, ainda ótimo para jogo, desde que não seja HDD. Se a placa-mãe só tem um slot NVMe e ele já está ocupado pelo sistema, um segundo SSD SATA continua sendo um salto enorme em relação ao HD. A loja olha os slots antes de vender um pente que não tem onde morar."),
      img(
        "Disco portátil é cópia de segurança. O jogo do dia a dia fica dentro da máquina.",
        "HD portátil com cabo ao lado, backup separado do SSD para GTA 6 e do sistema.",
      ),
      pros(
        "Sinais de que o disco é o gargalo",
        [
          "A partida demora minutos numa tela de carregamento.",
          "A textura da rua chega atrasada, borrosa, e fica nítida dois segundos depois.",
          "O jogo está num HD e o Windows, num SSD pequeno demais para recebê-lo.",
        ],
        [
          "Comprar o NVMe mais rápido da tabela e deixar 40 GB livres.",
          "Instalar o jogo num HD externo USB porque “é de um terabyte”.",
          "Apagar a pasta do jogo à mão em vez de desinstalar pela loja. Sobra arquivo quebrado.",
        ],
      ),
      h2("Como migrar sem perder a save"),
      ul([
        "Desinstale pela Steam, pela Epic ou pelo launcher, e instale de novo no SSD. É mais limpo do que copiar pasta.",
        "Save na nuvem, quando o jogo oferece, tira o medo da troca.",
        "Anote quanto espaço o título ocupa hoje e some a folga. Não compre o disco do tamanho exato.",
        "Se o Windows está num SSD de 240 GB lotado, o ganho maior é clonar o sistema para um NVMe maior, serviço que a bancada faz.",
      ]),
      p("A memória que segura o pedaço já carregado está em [memória RAM para GTA 6](/blog/memoria-ram-para-gta-6). A ordem de troca da máquina inteira está no [upgrade](/blog/upgrade-do-pc-antes-do-gta-6)."),
      img(
        "Por dentro do gabinete, o NVMe fica escondido na placa. O espaço livre é que aparece na hora de jogar.",
        "Interior de gabinete com ventoinhas, onde o SSD para GTA 6 é instalado na placa-mãe.",
      ),
      chamada({
        tema: "upgrade",
        titulo: "Quer o jogo no SSD e o Windows junto?",
        texto: `A ${loja} instala e clona disco no Cambuí. Av. Anchieta, 789. WhatsApp (19) 98751-0267. Traga o gabinete ou o notebook.`,
        rotulo: "Ver upgrade de SSD",
        href: "/upgrade-ssd",
        mensagem: "Olá! Li a matéria de SSD para GTA 6 e quero instalar um NVMe no meu PC.",
      }),
      p("Mais da série em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "GTA 6 vai ocupar quanto no PC?",
        resposta:
          "Não há número oficial. No PS5, a PlayStation pede pelo menos 212 GB. Use isso como escala, não como ficha de computador.",
      },
      {
        pergunta: "HD ainda serve para jogo grande?",
        resposta:
          "Serve para arquivo. Para mundo aberto, o SSD evita a cidade carregando no meio do movimento. HD externo USB é backup, não disco de jogo.",
      },
      {
        pergunta: "NVMe ou SSD SATA?",
        resposta:
          "NVMe é mais rápido e é a primeira escolha se a placa-mãe tem slot livre. SATA ainda é um salto grande em relação ao HD e cabe quando o slot NVMe já está ocupado.",
      },
      {
        pergunta: "Preciso deixar espaço sobrando?",
        resposta:
          "Sim. Disco cheio fica lento e a atualização falha. Mire em sobrar uma folga clara, não em encher até o último gigabyte.",
      },
      {
        pergunta: "Dá para mudar o jogo de disco sem perder o save?",
        resposta:
          "Dá, desinstalando pela loja e instalando no SSD, com o save na nuvem quando o jogo oferece. Copiar a pasta à mão costuma deixar arquivo pela metade.",
      },
    ],
  },
  {
    slug: "monitor-para-gta-6",
    titulo: "Monitor para GTA 6: a tela que define o resto do PC",
    seoTitulo: "Monitor para GTA 6: Full HD, Quad HD e taxa",
    resumo:
      "Monitor para GTA 6: a tela define a placa. Full HD, Quad HD ou 4K, mais a taxa, mudam o PC antes mesmo de existir ficha oficial.",
    palavrasChave: ["monitor para gta 6", "full hd ou quad hd", "monitor gamer 144 hz", "tela para gta 6"],
    etiquetas: ["GTA 6", "Monitor", "Full HD", "Quad HD"],
    capaAlt: "Notebook e monitor lado a lado, comparação de tela para jogar de olho em GTA 6.",
    fontes: fontes("rockstarVi", "gtavPc"),
    blocos: [
      p("O monitor para GTA 6 é a compra que deveria vir antes da placa, não depois. A Rockstar não publicou resolução oficial de PC, porque não publicou a versão. A sua tela, essa sim, já existe. Ela diz quantos pixels a placa vai desenhar toda vez que você girar a câmera, em qualquer mundo aberto que já esteja instalado."),
      rapida([
        "Full HD gasta menos placa e combina com quem quer fluidez alta sem trocar a GPU inteira.",
        "Quad HD é o meio-termo em que a cidade fica nítida e a placa precisa acompanhar.",
        "Taxa de 144 Hz só aparece se a placa entrega quadros perto disso. Monitor rápido com placa fraca mostra a mesma fluidez de antes, só que na tela nova.",
      ]),
      h2("Monitor para GTA 6: escolha a resolução com calma"),
      p("Full HD, 1920 por 1080, continua o caminho de quem joga em tela de 24 polegadas e quer folga. O pixel é maior, a placa sofre menos, e uma GPU de entrada ainda segura qualidade alta nos jogos atuais. Quad HD, 2560 por 1440, em 27 polegadas, é onde a maior parte de quem troca de tela hoje para. A imagem fica mais limpa em textura de rua, placa e letreiro. O custo é direto: a placa trabalha bem mais por quadro. 4K em monitor grande é vitrine. Sem uma GPU à altura, você baixa a resolução interna e pagou a tela à toa."),
      p("GTA V no PC, em 2015, já deixava o jogador escolher resolução alta, mais de um monitor e um controle de densidade da cidade. É recurso daquele jogo, citado no newswire da Rockstar, não uma especificação do GTA 6. A lição que sobra é prática: num mundo aberto, resolução e quantidade de coisa na tela são ajustes seus. Comprar os dois no escuro, tela 4K e placa de Full HD, é o combo que a bancada mais desfaz."),
      img(
        "Notebook na frente e monitor atrás: a tela grande é a que define a placa, não o tamanho do gabinete.",
        "Monitor e notebook abertos na mesma mesa, escolha de monitor para GTA 6 pela resolução.",
      ),
      tabela({
        titulo: "Resolução, tamanho e o que a placa sente",
        colunas: ["Tela", "Tamanho em que fica boa", "Consequência no PC"],
        linhas: [
          ["Full HD", "24 polegadas", "Placa de entrada ainda joga qualidade alta nos títulos atuais"],
          ["Quad HD", "27 polegadas", "Pede placa de meio de tabela e folga de VRAM"],
          ["4K", "32 polegadas ou mais", "Pede placa de topo e 16 GB de VRAM na geração atual"],
        ],
        nota: "Combinação usada na loja para os jogos de hoje. Não é resolução oficial de Grand Theft Auto VI.",
      }),
      h2("Taxa, painel e o que não muda o jogo"),
      p("144 Hz é o salto que você sente em câmera rápida, corrida e tiro. Em jogo cinematográfico, com a câmera mais parada, a diferença para 60 Hz existe e é menor do que o anúncio sugere. Mundo aberto fica no meio: a cidade se mexe, o carro vira, e a taxa alta ajuda se a placa acompanha. Ligue o cabo certo. HDMI velho ou o cabo que veio com a TV da sala podem limitar a tela a 60 Hz mesmo com o monitor anunciando 165. DisplayPort, na maioria dos monitores gamer, é o cabo que entrega a taxa da caixa."),
      p("IPS favorece cor e ângulo, bom para quem também trabalha na mesma tela. VA entrega contraste mais fundo, bom de noite. Os dois jogam bem. TN ficou para trás em cor. Curvatura em 27 polegadas é gosto. Em 32, ela ajuda a não virar a cabeça. Nada disso substitui a pergunta da resolução. Um monitor curvo Full HD continua sendo Full HD na hora de escolher a [placa de vídeo](/blog/placa-de-video-para-gta-6)."),
      img(
        "Monitor curvo, teclado e fone: a mesa fecha em volta da tela, não o contrário.",
        "Monitor curvo com teclado e fone, setup de monitor para GTA 6 em Quad HD ou Full HD.",
      ),
      pros(
        "Uma tela nova vale a pena quando",
        [
          "A atual é Full HD de 60 Hz e você já tem placa sobrando, medida no contador de quadros.",
          "Você trabalha e joga no mesmo lugar e a tela pequena cansou a vista.",
          "O próximo PC vai ser escolhido em volta dessa resolução, com orçamento honesto.",
        ],
        [
          "Comprar 4K para “ver o GTA 6 bonito” sem GPU que desenhe 4K nos jogos de hoje.",
          "Ignorar o suporte VESA e descobrir que o braço articulado não fura a tela.",
          "Usar o cabo antigo e achar que o monitor veio com defeito.",
        ],
      ),
      h2("O que medir na sua mesa antes de pedir"),
      ul([
        "Profundidade da mesa. Monitor de 27 com pé grande come o mousepad.",
        "Se você quer braço articulado. Confira o padrão VESA atrás da tela.",
        "A resolução que a placa aguenta hoje, num jogo que você já tem, no contador de quadros.",
        "Se a segunda tela é para live, chat ou mapa. Aí o combo é outro, e está no [setup de streamer](/blog/setup-de-streamer-para-gta-6).",
      ]),
      p("As faixas de máquina que conversam com cada tela estão no [PC de entrada](/blog/pc-gamer-entrada-para-gta-6), no [intermediário](/blog/pc-gamer-intermediario-para-gta-6) e no [alto desempenho](/blog/pc-gamer-alto-desempenho-gta-6)."),
      img(
        "Luz baixa, tela e áudio no mesmo plano: é a mesa de quem joga de noite e também grava.",
        "Monitor, teclado e equipamento de áudio numa mesa, canto de jogo pensado como monitor para GTA 6.",
      ),
      chamada({
        tema: "pc-gamer",
        titulo: "Quer ver a tela ligada, do tamanho real?",
        texto: `Na ${loja} o monitor sai da caixa e liga no balcão. Av. Anchieta, 789, Cambuí, Campinas. WhatsApp (19) 98751-0267.`,
        rotulo: "Ver monitores gamer",
        href: "/categoria/computadores-monitores-monitor-gamer",
        mensagem: "Olá! Li a matéria de monitor para GTA 6 e quero ver Full HD e Quad HD na loja.",
      }),
      p("A série completa está em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "Qual monitor comprar para GTA 6?",
        resposta:
          "Não há resolução oficial de PC. Escolha Full HD se a prioridade é fluidez com a placa que você tem, ou Quad HD se quer mais nitidez e aceita uma GPU à altura.",
      },
      {
        pergunta: "144 Hz faz diferença em mundo aberto?",
        resposta:
          "Faz na câmera e na direção, se a placa entrega quadros perto disso. Monitor de 144 Hz com jogo travado em 60 mostra 60.",
      },
      {
        pergunta: "27 ou 24 polegadas?",
        resposta:
          "24 combina com Full HD. 27 combina com Quad HD. Full HD em 27 deixa o pixel grande e a imagem mais mole.",
      },
      {
        pergunta: "Posso usar a TV da sala?",
        resposta:
          "Pode, em modo jogo, para reduzir atraso. Confira se o cabo e a entrada entregam a taxa que você quer. Muita TV trava em 60 Hz na entrada errada.",
      },
      {
        pergunta: "A tela muda a placa que eu preciso?",
        resposta:
          "Muda mais do que qualquer outro periférico. Quad HD e 4K puxam a GPU para cima. Full HD deixa a placa de entrada viva por mais tempo.",
      },
    ],
  },
  {
    slug: "perifericos-para-gta-6",
    titulo: "Periféricos para GTA 6: o que muda na mão e no ouvido",
    seoTitulo: "Periféricos para GTA 6: mouse, teclado e controle",
    resumo:
      "Periféricos para GTA 6: controle no console, mouse e teclado no PC, fone que separa o motor do tiro. A ordem certa, sem gastar no acessório errado.",
    palavrasChave: ["periféricos para gta 6", "controle ou teclado gta 6", "mouse para gta", "fone para gta 6"],
    etiquetas: ["GTA 6", "Periféricos", "Controle", "Headset"],
    capaAlt: "Teclado mecânico e mouse num mousepad, periféricos para jogar no PC de olho em GTA 6.",
    fontes: fontes("rockstarVi", "gtavPc", "playstation"),
    blocos: [
      p("Periféricos para GTA 6 dependem de onde você vai jogar. Na estreia, o caminho anunciado é o controle, no PlayStation 5 ou no Xbox Series X|S. No computador, quando a versão existir, GTA V já mostrou que mouse, teclado e controle convivem: o newswire de 2015 citava os dois jeitos de mirar. Enquanto o PC do GTA 6 não tem página, dá para acertar a mesa para os jogos que você já abre."),
      rapida([
        "No console, o controle oficial resolve. Gatilho gasto e analógico torto atrapalham mais do que qualquer skin.",
        "No PC, mouse com sensor decente e teclado em que você não erra o WASD mudam a direção mais do que um LED a mais.",
        "Fone fechado ajuda a ouvir motor e passo. Microfone de live é outro produto, tratado na matéria própria.",
      ]),
      h2("Periféricos para GTA 6 no console e no PC"),
      p("Quem vai jogar em 19 de novembro está no sofá ou na cadeira com um DualSense ou com o controle do Xbox. Antes da estreia, vale testar drift: deixe o analógico em paz e veja se a câmera anda sozinha. Analógico cansado estraga corrida e mira, e a troca do controle custa menos do que insistir. A assistência de games da loja vê controle que não responde antes de você culpar o jogo novo."),
      p("No PC, a escolha clássica de GTA é mouse para mirar e teclado para andar, com o controle guardado para voar e dirigir se você preferir o analógico no veículo. Não há jeito oficial do GTA 6 nessa disputa, porque não há versão de PC. O que funciona nos jogos atuais é ter os dois conectados. Muita placa-mãe já aceita o controle de Xbox por cabo ou receptor, e o DualSense funciona por cabo em vários jogos, com recursos extras só em alguns títulos. Teste no jogo que você já tem antes de comprar um adaptador caro."),
      img(
        "Fone, mouse e teclado fecham a mesa de quem joga no PC. No console, o controle continua sendo o principal.",
        "Headset, mouse e teclado numa mesa, conjunto de periféricos para GTA 6 no computador.",
      ),
      tabela({
        titulo: "O que comprar primeiro",
        colunas: ["Se o que você tem hoje", "Troque primeiro", "Pode esperar"],
        linhas: [
          ["Controle com analógico torto", "O controle", "Skin, carregador extra, controle de elite"],
          ["Mouse genérico de escritório", "Um mouse com sensor decente e mousepad", "Teclado cheio de macro"],
          ["Som pela caixinha do monitor", "Um fone fechado", "Placa de som dedicada"],
          ["Tudo novo, mesa apertada", "Mousepad grande e espaço para o cotovelo", "LED, suporte de cabo, enfeite"],
        ],
        nota: "Ordem prática para a mesa de hoje. Não é lista oficial de acessórios de Grand Theft Auto VI.",
      }),
      h2("Mouse, teclado e o fone da partida"),
      p("Mouse leve, com sensor que não treme na velocidade que você usa, resolve mira. DPI altíssimo no anúncio não é qualidade. Ajuste até o giro de 180 graus caber no mousepad sem você levantar o pulso duas vezes. Teclado mecânico é conforto e duração, não um aumento de quadro. O que importa no GTA, quando você joga no teclado, é não errar a tecla de correr e a de entrar no carro. Um membrana decente, com tecla que não gruda, já serve."),
      p("Fone fechado isola o ventilador do PC e o barulho da casa, e deixa o motor do carro e o passo na calçada no lugar certo do estéreo. Fone aberto é ótimo para música e ruim para não vazar som no microfone da live. Se a ideia é transmitir, o fone da partida e o microfone da voz são compras separadas. O microfone está em [microfone para live](/blog/microfone-para-live-de-jogo). Caixinha Bluetooth em jogo competitivo acrescenta atraso. Para campanha, muita gente aceita. Para dirigir colado, cabo ou receptor de baixa latência é mais honesto."),
      img(
        "O fone em cima do teclado é o teste rápido: se a concha tapa o ouvido inteiro, o motor do carro não briga com a sala.",
        "Fone sobre teclado iluminado com mouse ao lado, periféricos para GTA 6 numa mesa de PC.",
      ),
      pros(
        "Vale o dinheiro",
        [
          "Controle novo quando o atual tem drift ou gatilho morto.",
          "Mouse e mousepad se você ainda usa o kit que veio com o computador do escritório.",
          "Fone com fio se o sem fio corta no meio da perseguição.",
        ],
        [
          "Controle profissional pelo triplo do preço só por causa da estreia.",
          "Teclado de pulso iluminado que não cabe na mesa e empurra o mouse para fora.",
          "Comprar acessório de PC achando que isso adianta uma versão de GTA 6 que não foi anunciada.",
        ],
      ),
      h2("Uma mesa que não briga com você"),
      ul([
        "Mousepad largo o bastante para a câmera girar sem bater no teclado.",
        "Cabo de controle com folga, ou pilha carregada antes da sessão, não no meio dela.",
        "Fone com a concha em volta do ouvido, não em cima, se a ideia é isolamento.",
        "Nada de LED que refleta na tela. A matéria do [monitor](/blog/monitor-para-gta-6) explica por que a tela vem primeiro.",
      ]),
      p("Quem monta a máquina em volta dessa mesa olha o [PC de entrada](/blog/pc-gamer-entrada-para-gta-6) ou o [intermediário](/blog/pc-gamer-intermediario-para-gta-6), conforme a resolução. No sofá, o caminho da estreia está em [plataformas](/blog/gta-6-plataformas-ps5-xbox-e-pc)."),
      img(
        "Teclado, mouse e headset claros, do tipo que a loja deixa provar na mão.",
        "Teclado, mouse e headset numa mesa, periféricos para GTA 6 à prova antes da compra.",
      ),
      chamada({
        tema: "games",
        titulo: "Controle falhando ou mesa de PC pela metade?",
        texto: `A ${loja} avalia controle de PlayStation e Xbox e separa mouse, teclado e fone no Cambuí. Av. Anchieta, 789. WhatsApp (19) 98751-0267.`,
        rotulo: "Falar com a loja",
        href: "/assistenciagames",
        mensagem: "Olá! Li a matéria de periféricos para GTA 6 e quero ver controle, mouse ou fone.",
      }),
      p("A série está em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "GTA 6 é melhor no controle ou no teclado?",
        resposta:
          "Na estreia, o jogo anunciado é de console, então o controle é o caminho. No PC, GTA V aceita os dois. O GTA 6 ainda não tem versão de computador para comparar.",
      },
      {
        pergunta: "Preciso de controle novo para o PS5?",
        resposta:
          "Só se o atual tem analógico torto, gatilho morto ou drift. Um controle saudável joga a campanha inteira. Skin e controle de elite são gosto, não requisito.",
      },
      {
        pergunta: "Qual mouse serve para GTA no PC?",
        resposta:
          "Um mouse com sensor estável e um mousepad em que a câmera gira sem você levantar o braço. DPI alto no anúncio não substitui esse ajuste.",
      },
      {
        pergunta: "Fone Bluetooth serve?",
        resposta:
          "Para campanha, muita gente acha aceitável. Para dirigir e mirar com precisão, cabo ou receptor de jogo evita o atraso do Bluetooth comum.",
      },
      {
        pergunta: "O fone da partida serve para live?",
        resposta:
          "Ouve bem. O microfone embutido costuma pegar o teclado e o ventilador. Para transmitir, o microfone é outra compra.",
      },
    ],
  },
];
