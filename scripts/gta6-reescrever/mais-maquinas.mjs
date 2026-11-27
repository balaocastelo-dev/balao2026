import { p, h2, ul, ol, rapida, img, nota, tabela, pros, chamada, fontes } from "./blocos.mjs";

const loja = "Balão da Informática Anchieta, loja de informática em Campinas";

export const maisMaquinas = [
  {
    slug: "pc-gamer-intermediario-para-gta-6",
    titulo: "PC gamer intermediário para GTA 6: a faixa do Quad HD",
    seoTitulo: "PC gamer intermediário para GTA 6 em Quad HD",
    resumo:
      "PC gamer intermediário para GTA 6 é a faixa do Quad HD: mais placa e 32 GB se você deixa tudo aberto. Sem ficha oficial, a tela de 1440p manda.",
    palavrasChave: ["pc gamer intermediário para gta 6", "pc quad hd gta 6", "pc gamer 1440p", "configuração intermediária gta 6"],
    etiquetas: ["GTA 6", "PC gamer", "Quad HD"],
    capaAlt: "Gabinete branco aberto com as ventoinhas à mostra, PC gamer intermediário para GTA 6.",
    fontes: fontes("rockstarVi", "nvidia"),
    blocos: [
      p("PC gamer intermediário para GTA 6, na prática da loja, é a máquina de Quad HD. A Rockstar ainda não publicou versão de PC, então a faixa não cita modelo “recomendado pelo jogo”. Ela responde a uma tela de 2560 por 1440, em geral de 27 polegadas, com placa, memória de vídeo e RAM suficientes para os mundos abertos que já estão no computador."),
      rapida([
        "Quad HD tem bem mais pixels que o Full HD. A placa sobe um degrau em relação à faixa de entrada.",
        "12 GB ou 16 GB de VRAM deixam textura alta mais confortável nesta resolução, na geração atual.",
        "32 GB de RAM entram se você joga com Discord, navegador ou captura. 16 GB só com o jogo sozinho.",
      ]),
      h2("PC gamer intermediário para GTA 6 em 1440p"),
      p("O salto do Full HD para o Quad HD é o que mais muda o orçamento. Não é um detalhe de monitor: é quase o dobro de pixels, e a placa desenha cada um deles. Quem chega pedindo “o mesmo PC de entrada, só que com a tela maior” leva para casa uma máquina que vai baixar qualidade em todo lançamento. O [monitor](/blog/monitor-para-gta-6) explica o tamanho. A [placa](/blog/placa-de-video-para-gta-6) explica a memória de vídeo."),
      p("Nesta faixa a fonte também sobe. Placa de Quad HD puxa mais no pico, e o conector tem de existir de verdade, não num adaptador improvisado. Gabinete com entrada de ar na frente deixa de ser estética e vira necessidade: a placa de meio de tabela esquenta numa cidade cheia, com o jogo rodando por horas."),
      img(
        "Placa e processador na mesma mesa: no Quad HD os dois importam, e a placa importa mais.",
        "Placa de vídeo e processadores sobre a mesa, peças de um PC gamer intermediário para GTA 6.",
      ),
      tabela({
        titulo: "Entrada e intermediário, lado a lado",
        colunas: ["", "Entrada", "Intermediário"],
        linhas: [
          ["Tela", "Full HD, cerca de 24 polegadas", "Quad HD, cerca de 27 polegadas"],
          ["Placa", "Folga em 1080p", "Um degrau acima, com mais VRAM"],
          ["RAM", "16 GB, ou 32 se já abre tudo", "32 GB na maior parte dos pedidos"],
          ["Live", "Simples, se o jogo estiver folgado", "Cabe captura sem sufocar o jogo"],
        ],
        colunaDestaque: 2,
        nota: "Comparação das faixas da loja para jogos atuais. Não é recomendação oficial de Grand Theft Auto VI.",
      }),
      h2("VRAM nesta resolução"),
      p("Em Quad HD, textura alta e o navegador aberto ao mesmo tempo apertam os 8 GB. A análise da [RTX 5060 Ti de 8 GB ou 16 GB](/blog/rtx-5060-ti-8gb-ou-16gb) mostra, com teste de terceiros, onde a memória separa as duas versões do mesmo chip. A ficha da família está no site da NVIDIA. Traga esse aprendizado para a faixa intermediária: prefira o modelo com mais VRAM quando o preço não dobra a máquina inteira. O GTA 6 não confirmou esse número. Os jogos que você já tem, em 1440p, confirmam."),
      p("Processador de 6 ou 8 núcleos, recente, segura a rua cheia e ainda deixa espaço se o OBS entrar. Não é obrigatório o topo da linha. É obrigatório não ser um quatro núcleos de plataforma morta. Se a sua máquina atual já tem um chip bom e uma placa fraca, o [upgrade](/blog/upgrade-do-pc-antes-do-gta-6) troca a GPU e para por aí."),
      img(
        "Na vitrine dá para ver a máquina pronta, não só a lista.",
        "Vitrine da Balão da Informática Anchieta com telas de PC, onde se vê um PC gamer intermediário para GTA 6.",
      ),
      pros(
        "A faixa intermediária combina com você se",
        [
          "O próximo monitor é Quad HD, ou o atual já é.",
          "Você quer textura alta sem desligar todo o resto do PC.",
          "Uma live ocasional faz parte do plano.",
        ],
        [
          "A tela vai continuar Full HD por anos. Aí a entrada rende mais.",
          "Você quer 4K nativo. Aí a conversa é a faixa alta.",
          "Alguém garantiu “ultra no GTA 6”. Essa garantia não existe.",
        ],
      ),
      p("A faixa de baixo está no [PC de entrada](/blog/pc-gamer-entrada-para-gta-6). A de cima, no [alto desempenho](/blog/pc-gamer-alto-desempenho-gta-6). O mapa geral da escolha está em [PC para GTA 6](/blog/pc-para-gta-6-sem-requisito-oficial)."),
      img(
        "As caixas de placa na parede vermelha são o cardápio do Quad HD. A equipe cruza com a sua fonte e o seu gabinete.",
        "Prateleira de placas de vídeo na loja, opções de PC gamer intermediário para GTA 6.",
      ),
      chamada({
        tema: "pc-gamer",
        titulo: "Quad HD na sua mesa, configuração na nossa",
        texto: `Diga o modelo do monitor no WhatsApp (19) 98751-0267. A ${loja} fecha a faixa intermediária e mostra a máquina ligada. Av. Anchieta, 789, Cambuí.`,
        rotulo: "Montar em Quad HD",
        href: "/montagempc",
        mensagem: "Olá! Li a matéria de PC gamer intermediário para GTA 6 e quero uma máquina de Quad HD.",
      }),
      p("Máquinas da categoria em [PC gamer](/categoria/computadores-pc-pc-gamer). Série completa em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "O que é um PC intermediário para GTA 6?",
        resposta:
          "Na loja, é a configuração de Quad HD para os jogos atuais, com mais placa e mais folga de memória do que a faixa de Full HD. Não existe ficha oficial do GTA 6.",
      },
      {
        pergunta: "16 GB de VRAM fazem diferença em 1440p?",
        resposta:
          "Na geração atual, sim, quando a textura alta e outros programas dividem a placa. A análise da RTX 5060 Ti mostra um caso concreto. Não é número do GTA 6.",
      },
      {
        pergunta: "Preciso de 32 GB de RAM?",
        resposta:
          "Se Discord, navegador ou captura ficam abertos, sim. Se você joga em tela cheia e fecha o resto, 16 GB em dois pentes ainda atendem.",
      },
      {
        pergunta: "Serve para live?",
        resposta:
          "Serve para uma live ocasional, melhor do que a faixa de entrada. Live como atividade principal pede a faixa alta e a matéria de PC para live.",
      },
      {
        pergunta: "Posso começar no Full HD e subir depois?",
        resposta:
          "Pode, se a fonte e o gabinete já nascerem com folga para a próxima placa. Senão a “economia” vira troca de três peças.",
      },
    ],
  },
  {
    slug: "pc-gamer-alto-desempenho-gta-6",
    titulo: "PC gamer de alto desempenho para GTA 6 e para a live",
    seoTitulo: "PC gamer de alto desempenho para GTA 6",
    resumo:
      "PC gamer de alto desempenho para GTA 6 mira tela exigente e captura juntas. Sem ficha oficial, a folga é para os jogos de hoje e para a live.",
    palavrasChave: ["pc gamer de alto desempenho para gta 6", "pc high end gta 6", "pc para 4k e live", "pc gamer topo"],
    etiquetas: ["GTA 6", "PC gamer", "Alto desempenho", "Live"],
    capaAlt: "Gabinete aberto sobre a mesa, base de um PC gamer de alto desempenho para GTA 6.",
    fontes: fontes("rockstarVi", "obsNvenc"),
    blocos: [
      p("PC gamer de alto desempenho para GTA 6 é a máquina de quem não quer escolher entre imagem pesada e outra tarefa aberta. A Rockstar não publicou ficha de PC. O que esta faixa entrega, hoje, é folga em Quad HD ou em 4K nos jogos atuais, com processador e memória para capturar a partida sem derrubar o jogo."),
      rapida([
        "A placa é de topo da geração, com 16 GB de VRAM quando o alvo é 4K ou textura no máximo em Quad HD.",
        "32 GB de RAM são o padrão. O processador tem núcleos de sobra para o jogo e para o codificador.",
        "Fonte, gabinete e refrigeração entram no orçamento. Topo de linha mal ventilado vira topo barulhento.",
      ]),
      h2("PC gamer de alto desempenho para GTA 6"),
      p("Esta faixa existe para três pessoas. A primeira já joga em 4K ou vai para um monitor grande e não aceita baixar a resolução interna. A segunda transmite ou grava toda semana e cansou de fechar programa para o jogo ficar estável. A terceira troca de PC a cada muitos anos e prefere folga agora a abrir o gabinete todo Natal. Se nenhuma das três é você, o [intermediário](/blog/pc-gamer-intermediario-para-gta-6) gasta melhor."),
      p("O codificador de vídeo da placa, como o NVENC nas GeForce, tira a live do processador. O guia da OBS sobre NVENC explica o caminho. Isso não é configuração de GTA 6: é o jeito atual de transmitir jogo pesado sem derreter o chip. A matéria de [PC para live](/blog/pc-para-live-de-gta-6) junta as duas cargas. Sem essa segunda carga, metade do processador de topo fica olhando a partida."),
      img(
        "Gabinete aberto no balcão, lateral de acrílico: no alto desempenho a refrigeração aparece, não se esconde.",
        "Gabinete branco aberto no balcão da loja, PC gamer de alto desempenho para GTA 6 à mostra.",
      ),
      tabela({
        titulo: "Onde o dinheiro desta faixa vai",
        colunas: ["Peça", "Por que sobe", "Erro comum"],
        linhas: [
          ["Placa de vídeo", "4K e textura alta comem GPU e VRAM", "Topo de GPU com monitor Full HD"],
          ["Processador", "Jogo e captura ao mesmo tempo", "Chip de topo com 16 GB e disco cheio"],
          ["Memória", "32 GB viram o piso de quem deixa tudo aberto", "Um pente só, canal simples"],
          ["Fonte e gabinete", "Pico de energia e ar de verdade", "Fonte no limite e vidro sem entrada"],
        ],
        nota: "Distribuição para jogos atuais e live. Grand Theft Auto VI não tem configuração oficial de PC.",
      }),
      h2("Refrigeração e barulho"),
      p("Placa e processador de topo só entregam o clock da caixa se o gabinete troca o ar. Três ventoinhas jogando ar quente contra um vidro lacrado não são refrigeração. Na montagem, a loja escolhe o fluxo: frente puxando, traseira e topo empurrando, e um cooler à altura do processador. Water cooler é opção quando o gabinete cabe o radiador, não um enfeite obrigatório."),
      p("Barulho importa numa live. Microfone bom pega ventoinha gritando. Se você transmite, o alto desempenho inclui curva de fan decente e o microfone no lugar certo, assuntos de [microfone para live](/blog/microfone-para-live-de-jogo) e de [setup](/blog/setup-de-streamer-para-gta-6). Uma máquina silenciosa o bastante para a voz sair limpa vale mais do que mais 5% de quadro que ninguém ouve."),
      img(
        "Monitor curvo, gabinete e caixa de som: a faixa alta só faz sentido se a mesa acompanha.",
        "Mesa com gabinete, monitor curvo e caixas de som, PC gamer de alto desempenho para GTA 6 em uso.",
      ),
      pros(
        "Vale subir para esta faixa",
        [
          "Sua tela é Quad HD alta ou 4K e a placa atual já pede qualidade média.",
          "Você grava ou transmite toda semana.",
          "A fonte e o gabinete atuais não cabem a próxima placa.",
        ],
        [
          "O monitor é Full HD de 60 Hz. O dinheiro rende mais em outra coisa, ou nem precisa sair.",
          "Você quer a máquina só para o dia em que o GTA 6 chegar ao PC.",
          "O orçamento corta a fonte para caber a placa. O PC desliga no primeiro pico.",
        ],
      ),
      p("A visão sem faixa está em [PC para GTA 6](/blog/pc-para-gta-6-sem-requisito-oficial). Quem está em Campinas vê a máquina no [balcão do Cambuí](/blog/pc-gamer-gta-6-campinas)."),
      img(
        "Ventoinha colorida no balcão: luz é o detalhe. Ar entrando e saindo é o que segura o clock.",
        "Gabinete branco com ventoinhas na loja, refrigeração de um PC gamer de alto desempenho para GTA 6.",
      ),
      chamada({
        tema: "pc-gamer",
        titulo: "Quer folga de verdade, não só a placa mais cara?",
        texto: `A ${loja} equilibra placa, fonte e ar. Av. Anchieta, 789, Cambuí, Campinas. WhatsApp (19) 98751-0267.`,
        rotulo: "Montar o alto desempenho",
        href: "/montagempc",
        mensagem: "Olá! Li a matéria de PC gamer de alto desempenho para GTA 6 e quero uma máquina com folga para jogar e gravar.",
      }),
      p("Categoria de [PC gamer](/categoria/computadores-pc-pc-gamer). Série em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "Quando o PC de alto desempenho vale a pena?",
        resposta:
          "Quando a tela é exigente ou você joga e captura ao mesmo tempo. Em Full HD, a faixa de baixo entrega o mesmo jogo por menos.",
      },
      {
        pergunta: "Ele roda GTA 6 no máximo?",
        resposta:
          "Ninguém pode afirmar. Não há ficha de PC. A faixa é folga para os jogos pesados de hoje e para a live.",
      },
      {
        pergunta: "Preciso de water cooler?",
        resposta:
          "Não por padrão. Precisa de gabinete que troque o ar e de um cooler à altura do processador. Water cooler entra quando o radiador cabe e o ruído da live pede.",
      },
      {
        pergunta: "32 GB não são excesso?",
        resposta:
          "Não se o OBS, o navegador e o jogo ficam abertos. Para só jogar em tela cheia, 16 GB ainda atendem, e aí a faixa alta inteira talvez não seja a sua.",
      },
      {
        pergunta: "A fonte pode ser a da máquina antiga?",
        resposta:
          "Só se a potência real e o conector da placa nova estiverem folgados. No topo, a fonte antiga costuma ser o primeiro item a trocar.",
      },
    ],
  },
  {
    slug: "upgrade-do-pc-antes-do-gta-6",
    titulo: "Upgrade de PC para GTA 6: o que trocar primeiro",
    seoTitulo: "Upgrade de PC para GTA 6: a ordem que vale a pena",
    resumo:
      "Upgrade de PC para GTA 6 na ordem que se sente: SSD se o jogo está em HD, depois RAM, placa e fonte. O sintoma do seu PC é quem manda.",
    palavrasChave: ["upgrade de pc para gta 6", "o que trocar no pc", "melhorar pc para gta", "upgrade gamer"],
    etiquetas: ["GTA 6", "Upgrade", "PC gamer"],
    capaAlt: "Caixas de placa de vídeo na estante da loja, primeiro destino de um upgrade de PC para GTA 6.",
    fontes: fontes("rockstarVi", "steam"),
    blocos: [
      p("Upgrade de PC para GTA 6 começa pelo sintoma, não por uma lista genérica. A Rockstar não publicou a peça que o jogo vai pedir. O seu computador, esse, já avisa o que dói: demora para carregar, trava quando a rua enche, ou fica sem memória assim que o Discord abre. Cada sintoma tem uma primeira troca."),
      rapida([
        "Jogo em HD ou carregamento longo: SSD primeiro.",
        "Tela cheia de programas e o disco acendendo no meio da partida: memória.",
        "Quadro baixo com a cidade na tela, e o processador folgado: placa de vídeo, depois de conferir a fonte.",
      ]),
      h2("Upgrade de PC para GTA 6: a ordem"),
      p("A ordem que a bancada usa é curta. Se o jogo está num HD, nada mais importa até ele ir para um SSD: você sentiria a placa nova esperando o disco. Se a memória está em 8 GB ou num pente só de 16 GB com tudo aberto, o próximo passo é RAM em canal duplo. Se os dois já estão certos e o contador de quadros cai na cidade, aí sim a placa de vídeo, desde que a fonte aguente. Processador fica por último, salvo quando a plataforma inteira já não aceita as outras peças."),
      p("Trocar as quatro de uma vez é montar um PC novo e chamar de upgrade. Às vezes é o caminho, quando a placa-mãe é antiga demais. Na maioria das máquinas de poucos anos, uma ou duas peças mudam a noite de jogo. A pesquisa de hardware da Steam ajuda a ver o que é comum hoje. O seu Gerenciador de Tarefas diz o que está faltando aí, que é o número que importa."),
      img(
        "Por dentro, a placa e o cooler mostram por onde o upgrade começa. O disco, muitas vezes, nem aparece na foto e é o primeiro a trocar.",
        "Interior de um PC gamer com placa de vídeo e cooler, alvo de um upgrade de PC para GTA 6.",
      ),
      tabela({
        titulo: "Sintoma e primeira troca",
        colunas: ["O que você sente", "Troque primeiro", "Não troque ainda"],
        linhas: [
          ["Demora minutos para abrir o jogo", "SSD", "Placa de vídeo"],
          ["Textura chega atrasada, borrosa", "SSD, se o jogo está em HD", "Mais RGB"],
          ["Disco em 100% com Discord e jogo", "Memória, para 32 GB em dois pentes", "Processador de topo"],
          ["Poucos quadros, GPU em 99%", "Placa, se a fonte permitir", "Só a memória"],
          ["Rua cheia engasga, GPU folgada", "Processador ou plataforma", "Outra placa igual"],
        ],
        nota: "Diagnóstico de jogos atuais. Não é ordem oficial para Grand Theft Auto VI.",
      }),
      h2("Fonte, o item que segura as outras trocas"),
      p("Placa nova com fonte velha é a combinação que desliga o PC na hora em que a cidade fica bonita. Antes de fechar a GPU, a loja lê a potência real da fonte e os conectores. Se não há o cabo, ou a margem é nenhuma, a fonte entra no mesmo pedido. É menos glamouroso do que a caixa da placa e evita a volta no dia seguinte."),
      p("Gabinete entra na mesma conversa quando a placa não cabe no comprimento ou quando não há de onde o ar entrar. Medir o espaço com uma trena, no balcão, é mais barato do que descobrir em casa que a tampa não fecha. O guia da placa está em [placa de vídeo para GTA 6](/blog/placa-de-video-para-gta-6). O do disco, em [SSD](/blog/ssd-para-gta-6)."),
      img(
        "Memória vista de cima: dois pentes iguais, no par de slots certo, antes de pensar em chip novo.",
        "Módulo de memória em close, etapa de upgrade de PC para GTA 6 quando a RAM é o gargalo.",
      ),
      pros(
        "Upgrade cirúrgico",
        [
          "Uma peça resolve o sintoma que você descreveu.",
          "A plataforma ainda aceita SSD, RAM ou uma GPU atual.",
          "Você continua na mesma tela, então o alvo é claro.",
        ],
        [
          "Trocar processador numa placa-mãe que não aceita nada mais novo.",
          "Comprar placa de 4K para monitor Full HD.",
          "Fazer tudo “por causa do GTA 6” sem usar a máquina nos jogos de hoje.",
        ],
      ),
      ol([
        "Anote a resolução do monitor.",
        "Abra o jogo que mais pesa e veja se a placa ou o processador está no talo.",
        "Diga se o jogo está em SSD ou em HD.",
        "Mande foto da etiqueta da fonte. A equipe cruza com a placa que cabe.",
      ]),
      p("Se nada da plataforma se salva, as faixas novas estão no [entrada](/blog/pc-gamer-entrada-para-gta-6), no [intermediário](/blog/pc-gamer-intermediario-para-gta-6) e no [alto desempenho](/blog/pc-gamer-alto-desempenho-gta-6)."),
      img(
        "A bancada da loja é onde a peça nova é provada, não só vendida na caixa.",
        "Bancada da Balão da Informática Anchieta, onde se faz o upgrade de PC para GTA 6.",
      ),
      chamada({
        tema: "upgrade",
        titulo: "Manda o sintoma, não uma lista pronta",
        texto: `WhatsApp (19) 98751-0267, com foto da fonte e o modelo da placa-mãe. A ${loja} diz a primeira troca. Av. Anchieta, 789, Cambuí, Campinas. Telefone (19) 3255-1661.`,
        rotulo: "Pedir o diagnóstico",
        href: "/manutencao",
        mensagem: "Olá! Li a matéria de upgrade de PC para GTA 6 e quero saber o que trocar primeiro no meu computador.",
      }),
      p("A série está em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "O que trocar primeiro no PC?",
        resposta:
          "Se o jogo está em HD, o SSD. Se a memória estoura com os programas abertos, a RAM. Se a placa está em 99% e o resto folga, a GPU, depois de ver a fonte.",
      },
      {
        pergunta: "Upgrade deixa o PC pronto para GTA 6?",
        resposta:
          "Deixa melhor para os jogos de hoje. A Rockstar não publicou a ficha de PC, então ninguém crava a peça do GTA 6.",
      },
      {
        pergunta: "Vale trocar só a placa de vídeo?",
        resposta:
          "Vale quando o processador ainda aguenta e a fonte tem conector e potência. Sem isso, a placa nova não entrega o que a caixa promete.",
      },
      {
        pergunta: "8 GB de RAM ainda dá?",
        resposta:
          "Para jogo atual com qualquer coisa aberta ao lado, não. O piso prático é 16 GB em dois pentes, e 32 GB se você transmite ou deixa o navegador aberto.",
      },
      {
        pergunta: "Quando é melhor montar outro PC?",
        resposta:
          "Quando a placa-mãe não aceita SSD decente, nem memória atual, nem uma GPU que caiba. Aí o upgrade vira troca de quase tudo, e a montagem nova sai mais limpa.",
      },
    ],
  },
  {
    slug: "notebook-gamer-ou-desktop-gta-6",
    titulo: "Notebook gamer ou desktop para GTA 6: qual combina",
    seoTitulo: "Notebook gamer ou desktop para GTA 6",
    resumo:
      "Notebook gamer ou desktop para GTA 6: um você leva, o outro você abre e troca a peça. Veja qual combina com a mesa, a tomada e a tela.",
    palavrasChave: ["notebook gamer ou desktop", "notebook para gta 6", "desktop ou notebook gamer", "qual comprar para gta 6"],
    etiquetas: ["GTA 6", "Notebook", "Desktop", "PC gamer"],
    capaAlt: "Teclado de notebook e mouse sem fio, escolha entre notebook gamer ou desktop para GTA 6.",
    fontes: fontes("rockstarVi"),
    blocos: [
      p("Notebook gamer ou desktop para GTA 6 é uma escolha de vida de mesa, não de ficha do jogo. A versão de PC não foi anunciada. Os dois formatos já rodam os mundos abertos de hoje, com uma diferença que não muda com o próximo lançamento: o notebook você leva, o desktop você abre e troca."),
      rapida([
        "Desktop ganha em peça trocável, temperatura e preço da mesma performance.",
        "Notebook gamer ganha se você joga em mais de um lugar ou não tem mesa fixa.",
        "Os dois pedem a mesma pergunta: qual tela, Full HD ou Quad HD, você vai usar de verdade.",
      ]),
      h2("Notebook gamer ou desktop: o que cada um faz melhor"),
      p("No desktop, a placa de vídeo é a de mesa, com mais consumo e mais folga térmica. Daqui a dois anos você troca essa placa e o resto fica. A fonte se troca. A memória se troca. O gabinete fica no lugar, ligado num monitor de verdade, que é onde a imagem do jogo aparece grande. Se a sua vida de jogar acontece numa mesa só, em casa, o desktop é o formato que envelhece melhor."),
      p("No notebook, tudo está soldado ou quase. A placa é a versão de baixo consumo, com outro nome e outro fôlego. Ele esquenta no colo e no edredom, e precisa de mesa e de respiro embaixo. Em troca, você joga na sala, no quarto e na viagem, numa tela que já vem no pacote. Para quem divide a casa, muda de cômodo ou não quer um gabinete ocupando o canto, o notebook é o formato honesto."),
      img(
        "No balcão, o teclado com luz já dá o tamanho da escolha: máquina que você carrega ou torre que fica.",
        "Teclado iluminado no balcão da loja, comparação de notebook gamer ou desktop para GTA 6.",
      ),
      tabela({
        titulo: "Desktop e notebook, no uso real",
        colunas: ["", "Desktop", "Notebook gamer"],
        linhas: [
          ["Trocar a placa daqui a anos", "Sim", "Quase nunca"],
          ["Levar para outro cômodo", "Com esforço", "Sim"],
          ["Temperatura em sessão longa", "Melhor, se o gabinete respira", "Esquenta, precisa de mesa firme"],
          ["Tela", "Você escolhe o monitor", "A que vem na tampa, mais um monitor externo se quiser"],
          ["Tomada e barulho", "Fonte grande, mais controle do ruído", "Carregador forte, ventoinha perto do microfone"],
        ],
        nota: "Comparação de formato. Nenhum dos dois tem configuração oficial de Grand Theft Auto VI.",
      }),
      h2("Tela, tomada e live"),
      p("Notebook Full HD de 15 ou 16 polegadas conversa com uma GPU de entrada ou de meio. A mesma polegada em Quad HD pede mais placa e mais bateria na tomada, porque jogar no carregador é o normal: na bateria, o desempenho cai. Desktop em Quad HD é a matéria do [PC intermediário](/blog/pc-gamer-intermediario-para-gta-6). Não misture os alvos."),
      p("Para live, o desktop deixa o microfone longe da ventoinha e cabe uma segunda tela para o chat. O notebook dá, com fone e microfone externos, e com o carregador na parede. Os dois sofrem se você tapa a entrada de ar. A matéria de [PC para live](/blog/pc-para-live-de-gta-6) assume uma torre. Dá para adaptar, sabendo que a margem é menor."),
      img(
        "Estantes com caixa e monitor: dá para ver os dois formatos no corredor, ligados, antes de decidir.",
        "Estantes da loja com caixas e monitores, onde se compara notebook gamer ou desktop para GTA 6.",
      ),
      pros(
        "Desktop na mesa fixa",
        [
          "Você troca a placa daqui a anos sem trocar o resto.",
          "A temperatura em sessão longa fica mais fácil de controlar.",
          "O monitor é o que você escolhe, no tamanho da sua mesa.",
        ],
        [
          "A torre não vai na mochila.",
          "O monitor é uma compra à parte.",
          "Se você muda de cômodo toda semana, o notebook incomoda menos.",
        ],
      ),
      p("Quem fica no desktop segue para [PC para GTA 6](/blog/pc-para-gta-6-sem-requisito-oficial). Quem fica no notebook pode ver os modelos em [notebooks](/notebooks) e, se for máquina usada com procedência, os [seminovos](/seminovos)."),
      img(
        "O corredor da loja junta balcão, estante e as luminárias do teto. É o caminho entre a pergunta e a máquina ligada.",
        "Corredor da Balão da Informática Anchieta, loja onde se escolhe notebook gamer ou desktop para GTA 6.",
      ),
      nota(
        "dica",
        "Prove os dois",
        "Peça para abrir um jogo no notebook e no desktop, na mesma resolução. O barulho e o calor aparecem em dez minutos, coisa que ficha técnica não mostra.",
      ),
      chamada({
        tema: "notebooks",
        titulo: "Quer ver os dois ligados, lado a lado?",
        texto: `A ${loja} tem notebook e desktop no Cambuí. Av. Anchieta, 789. WhatsApp (19) 98751-0267. Telefone (19) 3255-1661.`,
        rotulo: "Ver notebooks",
        href: "/notebooks",
        mensagem: "Olá! Li a matéria de notebook gamer ou desktop para GTA 6 e quero ver os dois na loja.",
      }),
      p("A série está em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "Notebook gamer roda GTA 6?",
        resposta:
          "Não há ficha de PC para afirmar. Um notebook gamer atual roda os mundos abertos de hoje na resolução da tela dele, ligado na tomada.",
      },
      {
        pergunta: "Desktop é sempre melhor?",
        resposta:
          "É melhor para trocar peça, temperatura e o mesmo desempenho por menos dinheiro. Perde se você precisa levar o computador para outro lugar.",
      },
      {
        pergunta: "Dá para usar monitor externo no notebook?",
        resposta:
          "Dá, e a imagem fica maior. A placa continua sendo a do notebook, então Quad HD externo pede uma GPU que aguente esses pixels.",
      },
      {
        pergunta: "Notebook esquentando é defeito?",
        resposta:
          "Sessão longa esquenta. Defeito é desligar, travar ou a ventoinha gritar desde o primeiro minuto. A bancada limpa e avalia antes de condenar a máquina.",
      },
      {
        pergunta: "Qual dos dois a loja recomenda?",
        resposta:
          "Desktop se a mesa é fixa. Notebook se a mochila faz parte da rotina. Os dois se provam ligados na loja, no Cambuí.",
      },
    ],
  },
  {
    slug: "pc-gamer-gta-6-campinas",
    titulo: "PC gamer para GTA 6 em Campinas: o que a loja monta",
    seoTitulo: "PC gamer para GTA 6 em Campinas",
    resumo:
      "PC gamer para GTA 6 em Campinas se monta na Balão da Informática Anchieta, no Cambuí. Você vê a máquina ligada e leva orçamento pelo WhatsApp ou no balcão.",
    palavrasChave: ["pc gamer para gta 6 em campinas", "pc gamer campinas", "computador gamer cambuí", "montar pc campinas"],
    etiquetas: ["GTA 6", "Campinas", "PC gamer", "Cambuí"],
    capaAlt: "Fachada da Balão da Informática Anchieta, na Av. Anchieta, loja de PC gamer para GTA 6 em Campinas.",
    fontes: fontes("rockstarVi"),
    blocos: [
      p("PC gamer para GTA 6 em Campinas se resolve numa loja, não num fórum. A Balão da Informática Anchieta fica na Av. Anchieta, 789, Cambuí, e monta o computador em cima da sua tela e dos jogos que você já abre. A versão de PC do GTA 6 não foi anunciada pela Rockstar. A máquina que sai daqui é para o que você joga agora, com peça que dá para ver ligada antes de pagar."),
      rapida([
        "A loja é no Cambuí: Av. Anchieta, 789. Telefone (19) 3255-1661. WhatsApp (19) 98751-0267.",
        "Horário de balcão: segunda a quinta, das 8h às 18h. Sexta, das 8h às 17h. Sábado, das 8h às 13h.",
        "Você diz a resolução do monitor e dois ou três jogos. A equipe fecha a configuração e mostra a máquina funcionando.",
      ]),
      h2("PC gamer para GTA 6 em Campinas, na prática"),
      p("Quem chega por causa do GTA 6 costuma ter uma de três histórias. A primeira quer jogar no computador os mundos abertos que já ama, GTA V incluído, e aproveita a estreia nos consoles como empurrão para arrumar o PC. A segunda transmite e precisa de folga. A terceira está com uma torre de 2019 que abre o jogo e pede paciência. As três saem com máquinas diferentes. Nenhuma sai com um adesivo de “pronto para o GTA 6”, porque essa ficha não existe."),
      p("O caminho das faixas está escrito: [entrada em Full HD](/blog/pc-gamer-entrada-para-gta-6), [intermediário em Quad HD](/blog/pc-gamer-intermediario-para-gta-6) e [alto desempenho](/blog/pc-gamer-alto-desempenho-gta-6). Se a torre atual só precisa de uma peça, o [upgrade](/blog/upgrade-do-pc-antes-do-gta-6) evita trocar o que ainda serve. Quem mora em outra cidade e quer só o texto geral começa por [PC para GTA 6](/blog/pc-para-gta-6-sem-requisito-oficial)."),
      img(
        "No fim do corredor, a parede vermelha e a escada. É loja de balcão, não galpão em que a máquina sai sem você ver.",
        "Corredor da Balão da Informática Anchieta no Cambuí, loja de PC gamer para GTA 6 em Campinas.",
      ),
      h2("O que levar e o que falar no balcão"),
      ul([
        "Resolução e tamanho do monitor. Se não souber, uma foto da etiqueta atrás da tela resolve.",
        "Os jogos que você abre toda semana, não o jogo da moda que você viu num vídeo.",
        "Se vai transmitir, gravar aula ou só jogar.",
        "Uma foto da fonte, se a ideia é upgrade. Potência e conector mudam a placa que cabe.",
      ]),
      p("Com isso o orçamento fica curto e concreto. Sem isso, qualquer configuração “gamer” serve para uma pessoa genérica, não para a sua mesa. O atendimento também começa pelo WhatsApp, se você quiser adiantar a lista antes de atravessar a Anchieta. A mensagem cai com a equipe da loja, no número (19) 98751-0267."),
      tabela({
        titulo: "Como ser atendido",
        colunas: ["Canal", "Para que serve", "O que já ajuda"],
        linhas: [
          ["WhatsApp (19) 98751-0267", "Adiantar a configuração e tirar dúvida de peça", "Foto do monitor, dos jogos e da fonte"],
          ["Telefone (19) 3255-1661", "Horário, peça e se a máquina está pronta", "Seu nome e o que ficou combinado"],
          ["Balcão, Av. Anchieta, 789", "Ver a máquina ligada e fechar", "Tempo para sentar e olhar a tela"],
        ],
        nota: "Atendimento da Balão da Informática Anchieta, no Cambuí. Preço de peça não fica fixo no site: muda, e o orçamento é do dia.",
      }),
      img(
        "Totem e vitrine na entrada. Dá para olhar a máquina exposta antes mesmo de sentar no balcão.",
        "Totem e vitrine na entrada da loja, primeiro contato de quem busca PC gamer para GTA 6 em Campinas.",
      ),
      h2("O que acontece depois do orçamento"),
      p("A montagem é feita na própria loja. Você não leva uma caixa de peças para descobrir em casa que a tampa não fecha. O passo a passo da bancada está na matéria de [montagem de PC gamer em Campinas](/blog/montagem-pc-gamer-campinas). Se preferir um computador que já está na categoria, olhe os [PCs gamer](/categoria/computadores-pc-pc-gamer) e venha ver o que está exposto. Seminovo testado também existe, para quem quer entrar no Full HD gastando menos, na página de [seminovos](/seminovos)."),
      p("Assistência fica no mesmo endereço. Quando a máquina que saiu daqui, ou a que você já tinha, esquenta ou desliga, a bancada de [manutenção](/manutencao) é no Cambuí, não um código de postagem para outro estado. Isso pesa mais do que qualquer adesivo na hora de escolher onde montar."),
      img(
        "Balcão curvo, iMac e caixas de computador. É aqui que a configuração vira máquina com seu nome.",
        "Balcão da Balão da Informática Anchieta, onde se fecha o PC gamer para GTA 6 em Campinas.",
      ),
      pros(
        "Por que resolver aqui",
        [
          "Você vê a máquina ligada antes de pagar.",
          "Montagem e assistência no mesmo endereço do Cambuí.",
          "O orçamento parte da sua tela, não de uma lista copiada.",
        ],
        [
          "Quem quer garantia escrita de desempenho no GTA 6. Essa frase a loja não assina.",
          "Quem precisa retirar fora do horário de balcão sem combinar antes.",
          "Quem mora longe e não quer frete: dá para adiantar pelo WhatsApp e combinar a retirada.",
        ],
      ),
      nota(
        "dica",
        "Horário",
        "Segunda a quinta, das 8h às 18h. Sexta, das 8h às 17h. Sábado, das 8h às 13h. Domingo a loja fecha. Se for sábado, chegue com folga: o balcão para às 13h.",
      ),
      chamada({
        tema: "pc-gamer",
        titulo: "Vem ver a máquina ou chama no WhatsApp",
        texto: `Balão da Informática Anchieta, loja de informática em Campinas. Av. Anchieta, 789, Cambuí. WhatsApp (19) 98751-0267. Telefone (19) 3255-1661.`,
        rotulo: "Chamar a loja",
        href: "/montagempc",
        mensagem: "Olá! Li a matéria de PC gamer para GTA 6 em Campinas e quero um orçamento.",
      }),
      p("O mapa das matérias está em [GTA 6 no blog](/blog/gta-6). A história da loja, em [sobre nós](/sobre-nos)."),
    ],
    perguntas: [
      {
        pergunta: "Onde montar um PC gamer em Campinas?",
        resposta:
          "Na Balão da Informática Anchieta, Av. Anchieta, 789, Cambuí. A máquina é montada na loja e você pode vê-la ligada antes de pagar.",
      },
      {
        pergunta: "A loja garante que o PC roda GTA 6?",
        resposta:
          "Não. A Rockstar não publicou a versão de PC. A configuração é feita para a sua tela e para os jogos que você já joga.",
      },
      {
        pergunta: "Qual o horário?",
        resposta: "Segunda a quinta, das 8h às 18h. Sexta, das 8h às 17h. Sábado, das 8h às 13h.",
      },
      {
        pergunta: "Dá para orçar pelo WhatsApp?",
        resposta:
          "Dá, no (19) 98751-0267. Mande a resolução do monitor e os jogos que você mais abre. O telefone fixo é (19) 3255-1661.",
      },
      {
        pergunta: "Tem assistência se der problema?",
        resposta:
          "Tem, no mesmo endereço do Cambuí. Montagem e manutenção ficam juntas, sem mandar a máquina para outra cidade.",
      },
    ],
  },
  {
    slug: "montagem-pc-gamer-campinas",
    titulo: "Montagem de PC gamer em Campinas: o passo a passo da loja",
    seoTitulo: "Montagem de PC gamer em Campinas, no Cambuí",
    resumo:
      "Montagem de PC gamer em Campinas, no Cambuí: a Balão da Informática Anchieta escolhe as peças, monta, testa e mostra a máquina ligada antes de você levar.",
    palavrasChave: ["montagem de pc gamer em campinas", "montar pc campinas", "montagem de computador cambuí", "pc gamer sob medida"],
    etiquetas: ["Campinas", "Montagem", "PC gamer", "Cambuí"],
    capaAlt: "Porta da Balão da Informática Anchieta na Av. Anchieta, entrada da montagem de PC gamer em Campinas.",
    fontes: fontes("rockstarVi"),
    blocos: [
      p("Montagem de PC gamer em Campinas, do jeito que a Balão da Informática Anchieta faz, é um serviço de balcão no Cambuí: as peças são escolhidas para a sua tela, a torre é montada na loja e você vê o sistema ligar antes de ir embora. Se o motivo da visita é o GTA 6, a conversa inclui um limite claro. A Rockstar não publicou versão de PC, então a montagem mira os jogos que você já roda."),
      rapida([
        "Endereço: Av. Anchieta, 789, Cambuí, Campinas. WhatsApp (19) 98751-0267. Telefone (19) 3255-1661.",
        "A ordem é conversa, peças compatíveis, montagem, teste e máquina ligada na sua frente.",
        "Fonte, tamanho de placa e respiro do gabinete são conferidos antes, não depois da tampa fechada.",
      ]),
      h2("Montagem de PC gamer em Campinas, etapa por etapa"),
      p("Primeiro a conversa. Resolução do monitor, jogos da semana, se há live, se o computador também é de trabalho. Com isso a faixa aparece: [entrada](/blog/pc-gamer-entrada-para-gta-6), [intermediário](/blog/pc-gamer-intermediario-para-gta-6) ou [alto desempenho](/blog/pc-gamer-alto-desempenho-gta-6). Quem já tem torre e quer só uma peça desvia para o [upgrade](/blog/upgrade-do-pc-antes-do-gta-6) e não paga montagem de um PC inteiro à toa."),
      p("Depois a compatibilidade. Processador e placa-mãe no mesmo soquete. Memória do tipo que a placa aceita, em dois pentes. Placa de vídeo que cabe no gabinete e que a fonte alimenta com o conector certo. SSD no slot que existe, não no que a gente gostaria que existisse. Essa checagem é o miolo do serviço. Lista bonita de internet fura em algum desses pontos com frequência."),
      img(
        "Mesas de atendimento com monitor, no Cambuí. A montagem começa sentado, não com a peça já no carrinho.",
        "Mesas de atendimento da loja, primeira etapa da montagem de PC gamer em Campinas.",
      ),
      ol([
        "Você conta a tela, os jogos e se vai transmitir.",
        "A equipe fecha as peças que combinam entre si.",
        "A bancada monta, passa cabo e liga o sistema.",
        "A máquina abre na sua frente, com o jogo ou o teste combinado.",
        "Você leva a torre e sabe onde voltar se precisar.",
      ]),
      tabela({
        titulo: "O que a montagem confere",
        colunas: ["Item", "Por que trava a entrega", "Como a loja vê"],
        linhas: [
          ["Soquete", "Processador que não encaixa não liga", "Modelo da placa-mãe e do chip juntos"],
          ["Fonte", "Pico sem cabo desliga o PC", "Etiqueta de potência e conectores"],
          ["Gabinete", "Placa comprida não fecha a tampa", "Medida antes de parafusar"],
          ["Memória", "Um pente só deixa desempenho na mesa", "Kit duplo, perfil ligado na BIOS"],
          ["Disco", "Jogo em HD volta a carregar devagar", "Sistema e jogo no SSD"],
        ],
        nota: "Roteiro da bancada da loja. Não é checklist oficial de nenhum jogo.",
      }),
      img(
        "Mesa branca e mostruário de placas, no canto do atendimento. A peça é escolhida olhando, não só pelo nome.",
        "Mostruário de placas na mesa de atendimento, escolha de peça na montagem de PC gamer em Campinas.",
      ),
      h2("Teste, pasta e o que você leva para casa"),
      p("Montar não é só parafusar. Pasta térmica no processador, cooler firme, cabo que não encosta na ventoinha, e um teste que liga de verdade. Você não precisa entender cada fio. Precisa ver a tela acender e o sistema reconhecer a placa e o disco. Se algo falha, falha na loja, com a peça ainda na bancada."),
      p("O endereço de volta é o mesmo. Manutenção, limpeza e upgrade futuro ficam na [assistência](/manutencao) do Cambuí. Quem quer conhecer a loja antes de fechar lê [PC gamer para GTA 6 em Campinas](/blog/pc-gamer-gta-6-campinas), com horário e o que trazer. Segunda a quinta, das 8h às 18h. Sexta, das 8h às 17h. Sábado, das 8h às 13h."),
      img(
        "Escada e parede vermelha com o quadro da loja. A montagem mora neste endereço, não num estoque distante.",
        "Escada e parede da Balão da Informática Anchieta, sede da montagem de PC gamer em Campinas.",
      ),
      pros(
        "Montar na loja em vez de em casa",
        [
          "Peça incompatível é trocada antes do pagamento final, não depois de um tutorial.",
          "Teste com a máquina aberta, se precisar ajustar cabo.",
          "Assistência no mesmo lugar quando o verão apertar o gabinete.",
        ],
        [
          "Quem gosta de montar e já tem experiência, ferramenta e paciência para a BIOS.",
          "Quem quer uma lista sem ver a máquina. Dá para orçar pelo WhatsApp, e a entrega ainda passa pelo teste.",
          "Quem pede garantia de FPS num jogo sem ficha de PC. A loja não inventa esse número.",
        ],
      ),
      nota(
        "dica",
        "Adiantar pelo WhatsApp",
        "Mande a resolução do monitor e os jogos no (19) 98751-0267. Quando você chegar na Av. Anchieta, 789, a conversa já está no meio, não no zero.",
      ),
      chamada({
        tema: "montagem",
        titulo: "Quer montar com teste na sua frente?",
        texto: `Balão da Informática Anchieta, loja de informática em Campinas. Av. Anchieta, 789, Cambuí. WhatsApp (19) 98751-0267. Telefone (19) 3255-1661.`,
        rotulo: "Agendar a montagem",
        href: "/montagempc",
        mensagem: "Olá! Li a matéria de montagem de PC gamer em Campinas e quero montar uma máquina.",
      }),
      p("Peças de placa, quando a dúvida é só a GPU, estão em [placas de vídeo](/categoria/hardware-placa-de-video-vga). A série do jogo está em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "Onde montar um PC gamer em Campinas?",
        resposta:
          "Na Balão da Informática Anchieta, Av. Anchieta, 789, Cambuí. A montagem e o teste acontecem na loja.",
      },
      {
        pergunta: "Eu vejo o computador ligando?",
        resposta:
          "Vê. O padrão é mostrar a máquina ligada antes de você levar, com placa e disco reconhecidos.",
      },
      {
        pergunta: "Posso levar peças que eu já comprei?",
        resposta:
          "Combine antes pelo WhatsApp. A equipe confere se elas combinam entre si. Peça incompatível não entra numa montagem que a loja vai testar.",
      },
      {
        pergunta: "Quanto tempo leva?",
        resposta:
          "Depende da fila do dia e de a peça estar na loja. O horário de balcão é de segunda a quinta, das 8h às 18h, sexta das 8h às 17h, e sábado das 8h às 13h. Confirme no (19) 3255-1661 ou no WhatsApp.",
      },
      {
        pergunta: "A montagem já deixa o PC pronto para GTA 6?",
        resposta:
          "Deixa pronto para os jogos que você combinou e para a sua tela. A versão de PC do GTA 6 não foi anunciada, então a loja não assina desempenho desse jogo.",
      },
    ],
  },
];
