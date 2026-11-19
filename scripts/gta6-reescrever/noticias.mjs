import { p, h2, ul, ol, rapida, img, nota, tabela, citacao, chamada, fontes } from "./blocos.mjs";

const loja = "Balão da Informática Anchieta, loja de informática em Campinas";

export const noticias = [
  {
    slug: "gta-6-lancamento-19-novembro-2026",
    titulo: "Lançamento do GTA 6: o que acontece em 19 de novembro",
    seoTitulo: "Lançamento do GTA 6: 19 de novembro de 2026",
    resumo:
      "O lançamento do GTA 6 é 19 de novembro de 2026, no PS5 e no Xbox Series X|S. Veja o horário, a pré-carga e o que a Rockstar ainda não anunciou.",
    palavrasChave: ["lançamento do gta 6", "gta 6 19 de novembro", "data gta 6", "grand theft auto vi lançamento"],
    etiquetas: ["GTA 6", "Lançamento", "Rockstar", "PlayStation 5", "Xbox Series"],
    capaAlt: "Controle de PlayStation 5 sobre o console, no dia do lançamento do GTA 6.",
    fontes: fontes("rockstarVi", "rockstarData", "playstation", "psSuporte", "vergeAdiamento", "reuters"),
    blocos: [
      p("O lançamento do GTA 6 é 19 de novembro de 2026. A Rockstar Games deixou a data na página oficial de Grand Theft Auto VI e no newswire: o jogo chega nesse dia para PlayStation 5 e Xbox Series X|S. Se você quer jogar na estreia, o caminho anunciado é o console."),
      rapida([
        "Grand Theft Auto VI estreia em 19 de novembro de 2026 para PlayStation 5, PS5 Pro e Xbox Series X|S.",
        "No PS5, o suporte da PlayStation marca a liberação à meia-noite no fuso de quem joga. No Brasil, isso é 00:00 de Brasília.",
        "A página oficial não lista computador. Versão de PC e ficha técnica de PC não foram anunciadas.",
      ]),
      h2("O que o lançamento do GTA 6 confirma"),
      p("A data vigente saiu no newswire da Rockstar em 6 de novembro de 2025, com o título de que Grand Theft Auto VI passava a estrear em 19 de novembro de 2026. A Reuters tratou o aviso como mais um adiamento. A The Verge, no mesmo dia, registrou que a data anterior era 26 de maio de 2026. Por isso um guia antigo ainda pode falar em maio: a data mudou, e a que vale é a de novembro."),
      p("A página da PlayStation confirma o jogo para PS5 e PS5 Pro. A da Rockstar coloca PlayStation 5 e Xbox Series X|S lado a lado, com o selo de que roda melhor no PS5. Isso é marketing da própria Rockstar, não um teste nosso. O que dá para afirmar é a lista de aparelhos, não qual dos dois consoles fica mais bonito na sua sala."),
      img(
        "O controle do PS5 é o caminho anunciado para jogar GTA 6 no dia 19.",
        "Controle de PlayStation 5 apoiado no console, aparelho do lançamento do GTA 6.",
      ),
      h2("Que horas o jogo destrava no Brasil"),
      p("No PlayStation 5, o suporte oficial diz que Grand Theft Auto VI libera à meia-noite no horário local de 19 de novembro de 2026. Para quem está em Campinas, em São Paulo ou em qualquer cidade no horário de Brasília, a virada é 00:00 do dia 19. Não é meio-dia, e não é o horário da costa leste dos Estados Unidos."),
      p("No Xbox Series X|S a Rockstar detalhou o fuso da pré-carga (meia-noite de GMT em 10 de novembro), não uma frase igual à da PlayStation para a hora de abrir o jogo. Na dúvida, o horário que manda é o da Microsoft Store na sua conta. Chegar meia hora antes e deixar o console ligado evita a corrida de baixar um pedaço que faltou."),
      tabela({
        titulo: "Calendário oficial até a estreia",
        colunas: ["Quando", "O que acontece", "Onde está escrito"],
        linhas: [
          ["6 de novembro de 2025", "A data passa a ser 19 de novembro de 2026", "Newswire da Rockstar e Reuters"],
          ["10 de novembro de 2026", "Começa a pré-carga de quem reservou", "Página Pre-Load Now e suporte da PlayStation"],
          ["12 de novembro de 2026", "Caixa com código de download nas lojas", "Comunicado de pré-venda da Take-Two"],
          ["19 de novembro de 2026", "Estreia em PS5 e Xbox Series X|S", "Página oficial de Grand Theft Auto VI"],
        ],
        fonte: "rockstarVi",
        nota: "A linha da caixa está no comunicado de pré-venda da Take-Two, de 24 de junho de 2026. O restante está na Rockstar e na PlayStation.",
      }),
      h2("O que fazer na noite da estreia"),
      p("Atualize o sistema do console de dia, não às 23h50. A pré-carga, para quem reservou o digital, começou em 10 de novembro. Se a barra ainda não chegou ao fim, o jogo não vai estar pronto só porque o relógio virou. O guia de [pré-carga e espaço](/blog/gta-6-pre-carga-e-tamanho) explica os 212 GB."),
      p("A caixa física leva um código para baixar, não o jogo inteiro no disco. Comprar a caixa em 12 de novembro serviu para entrar na pré-carga. Comprar a caixa na semana da estreia ainda exige download. Separe espaço antes de raspar o código."),
      img(
        "Vice City pega o clima de uma cidade costeira da Flórida. A foto é Miami, não um mapa do jogo.",
        "Orla de Miami de dia, clima visual de Vice City no lançamento do GTA 6.",
      ),
      h2("O que ainda não tem data"),
      p("Computador não aparece na lista. Não há pré-venda de PC, nem página de requisitos, nem anúncio de Steam ou de Rockstar Launcher para Grand Theft Auto VI. Quem vender chave de PC nesta semana não está vendendo o jogo que a Rockstar pôs à venda."),
      p("O histórico da empresa é outro assunto, e vale como histórico: GTA V chegou ao PC em 14 de abril de 2015, depois dos consoles, e Red Dead Redemption 2 em 5 de novembro de 2019. Isso não marca um mês para o GTA 6. A conta de quanto tempo demorou está na matéria de [plataformas](/blog/gta-6-plataformas-ps5-xbox-e-pc)."),
      ul([
        "Jogo base, edições e o pacote Vintage Vice City: matéria de [preço](/blog/gta-6-preco-e-edicoes).",
        "Lucia Caminos e Jason Duval, com a sinopse oficial: [a dupla](/blog/gta-6-lucia-e-jason).",
        "Leonida e Vice City, sem completar o mapa no chute: [o cenário](/blog/gta-6-mapa-leonida-e-vice-city).",
      ]),
      img(
        "Quem vai jogar no sofá já pode deixar o controle carregado antes da meia-noite.",
        "Pessoa segurando um controle, com a mesa de jogo ao lado, na estreia do GTA 6.",
      ),
      h2("E se o seu plano é o computador"),
      p("Dá para montar ou melhorar o PC para os jogos de mundo aberto que você já joga, para GTA V e para uma live. Não dá para gravar na nota que a máquina foi feita para o GTA 6. A Rockstar não publicou essa ficha. O ponto de partida está em [PC para GTA 6](/blog/pc-para-gta-6-sem-requisito-oficial)."),
      chamada({
        tema: "pc-gamer",
        titulo: "Quer um PC para os jogos que você já roda?",
        texto: `Na ${loja}, a conversa começa pelo monitor e pelos jogos de hoje. O orçamento sai no WhatsApp (19) 98751-0267 ou no balcão da Av. Anchieta, 789, Cambuí.`,
        rotulo: "Pedir um orçamento",
        href: "/montagempc",
        mensagem: "Olá! Li a matéria do lançamento do GTA 6 e quero orçamento de um PC para os jogos que eu já rodo.",
      }),
      p("A série inteira está em [GTA 6 no blog](/blog/gta-6). A loja fica na Av. Anchieta, 789, Cambuí, Campinas, com telefone (19) 3255-1661."),
    ],
    perguntas: [
      {
        pergunta: "Qual é a data do lançamento do GTA 6?",
        resposta:
          "19 de novembro de 2026. A Rockstar publicou essa data no newswire de 6 de novembro de 2025 e ela continua na página oficial do jogo.",
      },
      {
        pergunta: "GTA 6 sai para PC no lançamento?",
        resposta:
          "Não foi anunciado. A página oficial lista PlayStation 5 e Xbox Series X|S. Não há pré-venda de computador nem ficha técnica de PC.",
      },
      {
        pergunta: "A que horas libera no PS5 no Brasil?",
        resposta:
          "O suporte da PlayStation marca meia-noite no horário local de 19 de novembro de 2026. No horário de Brasília, isso é 00:00 do dia 19.",
      },
      {
        pergunta: "A caixa física já traz o jogo instalado?",
        resposta:
          "Não. A Take-Two descreveu a versão de loja como uma caixa com código de download. Você ainda precisa de espaço livre no console.",
      },
      {
        pergunta: "Dá para confiar numa data de maio que ainda circula?",
        resposta:
          "Não. Maio de 2026 foi uma data anterior. A The Verge registrou a troca, e a data que a Rockstar mantém no ar é 19 de novembro de 2026.",
      },
    ],
  },
  {
    slug: "gta-6-plataformas-ps5-xbox-e-pc",
    titulo: "GTA 6 vai sair para PC? O que a Rockstar confirmou",
    seoTitulo: "GTA 6 vai sair para PC? Plataformas oficiais",
    resumo:
      "GTA 6 vai sair para PC? Até a estreia, a Rockstar só confirmou PS5 e Xbox Series X|S. Veja cada aparelho e o histórico de GTA V e RDR2.",
    palavrasChave: ["gta 6 vai sair para pc", "gta 6 ps5", "gta 6 xbox series", "plataformas gta 6"],
    etiquetas: ["GTA 6", "PS5", "Xbox Series", "PC"],
    capaAlt: "PlayStation 5 e controle DualSense, um dos aparelhos em que GTA 6 vai sair.",
    fontes: fontes("rockstarVi", "playstation", "yahooPc", "gtavPc", "rdr2Pc", "wikiGtav", "wikiRdr2"),
    blocos: [
      p("GTA 6 vai sair para PC? Até 19 de novembro de 2026, a resposta publicada pela Rockstar é que o lançamento é de PlayStation 5 e Xbox Series X|S. A página oficial não tem computador, e a cobertura da Yahoo em 15 de novembro registrou o mesmo: sem data de PC, sem pré-venda e sem ficha de computador."),
      rapida([
        "No dia da estreia, Grand Theft Auto VI está anunciado para PS5, PS5 Pro e Xbox Series X|S.",
        "Não há versão de PC anunciada, nem ficha técnica, nem página de pré-venda para computador.",
        "GTA V e Red Dead Redemption 2 chegaram ao PC depois dos consoles. Isso é histórico, não um calendário do GTA 6.",
      ]),
      h2("GTA 6 vai sair para PC? O que está escrito"),
      p("A lista que importa é a da própria Rockstar: PlayStation 5 e Xbox Series X|S, com a frase de que o jogo roda melhor no PS5. A PlayStation acrescenta o PS5 Pro na página do jogo. PS4 não aparece. Xbox One não aparece. Steam, Epic Games Store e Rockstar Launcher não têm página de Grand Theft Auto VI."),
      p("Um anúncio de loja, um código vazado ou um vídeo com “ficha vazada” não substitui essa lista. Quando a versão de computador existir, ela deve sair no newswire da Rockstar, num comunicado da Take-Two ou numa loja oficial. Até lá, tratar rumor como ficha é o jeito mais rápido de comprar peça pelo motivo errado."),
      img(
        "O Xbox Series está na lista oficial, ao lado do PlayStation 5.",
        "Console Xbox e controle, plataforma em que GTA 6 vai sair na estreia.",
      ),
      h2("O que cada aparelho anunciado entrega"),
      p("No PS5 e no PS5 Pro, a página da PlayStation é a ficha de compra: reserva, pré-carga a partir de 10 de novembro à meia-noite local, e pelo menos 212 GB livres. No Xbox Series X e no Series S, a compra é pela Microsoft Store ou pelo varejo. Os dois estão no mesmo anúncio da Rockstar. A empresa não publicou uma tabela comparando resolução ou taxa de quadros entre Series X e Series S, então não há número honesto para repetir."),
      tabela({
        titulo: "Onde GTA 6 está anunciado na estreia",
        colunas: ["Aparelho", "Na estreia de 19/11/2026", "Onde confirmar"],
        linhas: [
          ["PlayStation 5 e PS5 Pro", "Sim", "Página da PlayStation e site da Rockstar"],
          ["Xbox Series X e Series S", "Sim", "Página oficial da Rockstar"],
          ["PS4 e Xbox One", "Não listados", "Fora da página oficial"],
          ["PC, Steam ou launcher da Rockstar", "Não anunciado", "Sem página de pré-venda"],
        ],
        fonte: "rockstarVi",
        nota: "A linha do PS5 Pro está na página da PlayStation. As outras seguem a lista da Rockstar.",
      }),
      h2("Histórico de PC da Rockstar, rotulado como histórico"),
      p("GTA V saiu em 17 de setembro de 2013 para PlayStation 3 e Xbox 360. O PC veio em 14 de abril de 2015, cerca de 19 meses depois, com o newswire da Rockstar anunciando a versão para computador. Red Dead Redemption 2 saiu em 26 de outubro de 2018 nos consoles e em 5 de novembro de 2019 no PC, pouco mais de um ano depois. As duas datas de PC estão nos newswires da Rockstar. As de console estão na Wikipedia, usadas aqui só como calendário."),
      p("O intervalo não é uma lei. Ninguém na Rockstar disse que Grand Theft Auto VI vai repetir 13 ou 19 meses. Serve para uma coisa prática: quem espera o PC pode passar um bom tempo no GTA V, no Red Dead e nos outros jogos de mundo aberto que já estão no computador. Quem quer a campanha nova na semana da estreia precisa de um console da lista."),
      img(
        "O PC fica para quando a Rockstar publicar a versão. Até lá, a mesa serve para os jogos que já existem.",
        "Mesa com gabinete, dois monitores e teclado, setup de PC à espera de uma versão de GTA 6.",
      ),
      h2("Como decidir sem comprar no susto"),
      ul([
        "Quer a campanha em novembro de 2026: PS5, PS5 Pro ou Xbox Series X|S.",
        "Já tem um desses consoles: reserve espaço e veja a [pré-carga](/blog/gta-6-pre-carga-e-tamanho).",
        "Só joga no PC e topa esperar: não compre chave paralela. Acompanhe o newswire.",
        "Vai montar computador agora: monte para a tela e para os jogos de hoje. O guia é [PC para GTA 6](/blog/pc-para-gta-6-sem-requisito-oficial).",
      ]),
      p("O [lançamento](/blog/gta-6-lancamento-19-novembro-2026) detalha o horário no Brasil. As edições e o valor em dólar estão em [preço do GTA 6](/blog/gta-6-preco-e-edicoes)."),
      img(
        "No PS5, o controle é o jeito anunciado de jogar a campanha na estreia.",
        "Gatilhos de um controle de PlayStation em close, aparelho da lista oficial de GTA 6.",
      ),
      nota(
        "atencao",
        "Chave de PC à venda",
        "Se uma loja ou um anúncio oferecer Grand Theft Auto VI para computador antes de a Rockstar anunciar essa versão, não é o produto oficial. A pré-venda publicada é de console.",
      ),
      chamada({
        tema: "games",
        titulo: "Console na bancada, PC na mesa ao lado",
        texto: `A ${loja} avalia PlayStation e Xbox e monta computador para os jogos que já estão no PC. Av. Anchieta, 789, Cambuí. WhatsApp (19) 98751-0267.`,
        rotulo: "Falar com a loja",
        href: "/assistenciagames",
        mensagem: "Olá! Li a matéria das plataformas do GTA 6 e quero orientação de console ou de PC.",
      }),
      p("O restante da série está em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "GTA 6 vai sair para PC?",
        resposta:
          "A Rockstar não anunciou. Em 19 de novembro de 2026 o jogo estreia em PlayStation 5 e Xbox Series X|S. Não há pré-venda de PC nem requisitos publicados.",
      },
      {
        pergunta: "Roda em PS4 ou Xbox One?",
        resposta:
          "Não estão na lista oficial. A página da Rockstar cita PlayStation 5 e Xbox Series X|S. A PlayStation cita também o PS5 Pro.",
      },
      {
        pergunta: "Qual console a Rockstar recomenda?",
        resposta:
          "A página oficial diz que o jogo roda melhor no PlayStation 5. Isso é o texto da Rockstar, não um comparativo independente de desempenho.",
      },
      {
        pergunta: "GTA V e Red Dead demoraram quanto para chegar ao PC?",
        resposta:
          "GTA V chegou ao PC em 14 de abril de 2015, cerca de 19 meses depois dos consoles. Red Dead Redemption 2 chegou em 5 de novembro de 2019, pouco mais de um ano depois. É histórico, não uma data do GTA 6.",
      },
      {
        pergunta: "Vale comprar um PC agora por causa do GTA 6?",
        resposta:
          "Vale se o computador novo melhora os jogos que você já joga e a tela que você já tem. Não vale se a única promessa da compra for rodar GTA 6, porque essa ficha não existe.",
      },
    ],
  },
  {
    slug: "gta-6-trailers-oficiais",
    titulo: "Trailers de GTA 6: o que cada vídeo oficial mostra",
    seoTitulo: "Trailers de GTA 6: os vídeos oficiais da Rockstar",
    resumo:
      "Os trailers de GTA 6 oficiais são cinco vídeos no site da Rockstar. Veja a ordem, o que cada um acrescentou e onde assistir sem spoilers inventados.",
    palavrasChave: ["trailers de gta 6", "trailer gta 6", "gta 6 extended look", "vídeos oficiais gta 6"],
    etiquetas: ["GTA 6", "Trailers", "Rockstar"],
    capaAlt: "Mesa de jogo com monitor e gabinete iluminado, pronta para ver os trailers de GTA 6.",
    fontes: fontes("rockstarTrailer", "rockstarMidia", "playstation", "rockstarVi"),
    blocos: [
      p("Os trailers de GTA 6 que importam estão na própria Rockstar. A página do Launch Trailer lista cinco vídeos oficiais, com data e duração. É por essa lista que dá para acompanhar o jogo sem misturar cena de fã, corte de TikTok e material de imprensa."),
      rapida([
        "São cinco vídeos no site da Rockstar: Trailer 1, Trailer 2, An Extended Look, Launch Trailer e Pre-Load Now.",
        "O Trailer 1 é de 4 de dezembro de 2023. O Launch Trailer é de 15 de outubro de 2026. A data de estrear o jogo continua 19 de novembro de 2026.",
        "A PlayStation descreve An Extended Look como captura in-game no PS5. Esse rótulo é desse vídeo, não dos outros.",
      ]),
      h2("Trailers de GTA 6, na ordem em que a Rockstar publicou"),
      p("Trailer 1, de 4 de dezembro de 2023, dura 1 minuto e 31 segundos. Foi o primeiro contato com Lucia, com Vice City e com o estado de Leonida. Trailer 2, de 6 de maio de 2025, dura 2 minutos e 47 segundos e coloca Jason ao lado de Lucia. Os dois estão na página do Launch Trailer, que também guarda os vídeos seguintes."),
      p("An Extended Look, de 27 de agosto de 2026, dura 26 minutos e 48 segundos. É o vídeo longo, o que mais se aproxima de ver o jogo andando. A página da PlayStation diz que essa apresentação é captura in-game no PS5. A frase vale para esse vídeo. Não copie o mesmo rótulo para o Trailer 1 ou para o Launch Trailer, porque a Rockstar não escreveu isso neles."),
      img(
        "Mouse e teclado bastam para assistir. O jogo, na estreia, está anunciado para console.",
        "Mouse e teclado com luz azul, setup para assistir aos trailers de GTA 6.",
      ),
      tabela({
        titulo: "Os cinco vídeos oficiais",
        colunas: ["Vídeo", "Data no site da Rockstar", "Duração"],
        linhas: [
          ["Trailer 1", "4 de dezembro de 2023", "1:31"],
          ["Trailer 2", "6 de maio de 2025", "2:47"],
          ["An Extended Look", "27 de agosto de 2026", "26:48"],
          ["Launch Trailer", "15 de outubro de 2026", "página do vídeo"],
          ["Pre-Load Now", "10 de novembro de 2026", "0:30"],
        ],
        fonte: "rockstarTrailer",
        nota: "A duração do Launch Trailer não está no recorte usado aqui. A data está. Assista na página da Rockstar para ver o corte completo.",
      }),
      h2("O que cada um serve"),
      ul([
        "Trailer 1: o tom, Lucia, Vice City e Leonida. Bom para quem nunca viu nada.",
        "Trailer 2: Jason entra na história ao lado de Lucia. É o vídeo da dupla.",
        "An Extended Look: quase meia hora. Separe tempo e fone. É o que mais mostra o jogo em movimento.",
        "Launch Trailer: o convite da reta final, com a música Flower in a Hurricane, creditada na página a Justice com Tame Impala, SZA e King Gizzard & The Lizard Wizard.",
        "Pre-Load Now: aviso de 30 segundos para quem já reservou. Não é um trailer de história.",
      ]),
      p("A página de mídia da Rockstar ainda separa clipes curtos com os nomes Lucia Caminos e Jason Duval, artes e capturas. Esses arquivos são material de divulgação. Não são a campanha, e não entregam a lista de missões."),
      img(
        "O neon de Miami ajuda a imaginar Vice City. O mapa jogável é o que a Rockstar mostrar no jogo, não esta foto.",
        "Horizonte de Miami com palmeiras, clima dos trailers de GTA 6 em Vice City.",
      ),
      h2("Como assistir sem se perder em recorte"),
      p("Prefira o site da Rockstar ou o canal oficial. Um clipe de 15 segundos corta a piada no meio e inventa contexto. Se você quer chegar na campanha com surpresa, fique no Trailer 1 e no Trailer 2 e deixe An Extended Look para depois: 26 minutos mostram bem mais gameplay do que um teaser."),
      p("Data de publicar vídeo não muda a data de jogar. O Launch Trailer é de outubro. A estreia continua 19 de novembro de 2026, como está na matéria do [lançamento](/blog/gta-6-lancamento-19-novembro-2026). Quem reserva agora olha a [pré-carga](/blog/gta-6-pre-carga-e-tamanho), não espera um sexto trailer para liberar o console."),
      nota(
        "dica",
        "Onde clicar",
        "A página do Launch Trailer reúne os cinco vídeos. A de mídia reúne clipes, artes e capturas para download. As duas são da Rockstar.",
      ),
      img(
        "Palmeira, prédio e mar: o cartão-postal que os vídeos usam o tempo inteiro.",
        "Prédios de Miami, palmeiras e o mar, paisagem citada nos trailers de GTA 6.",
      ),
      h2("O que os vídeos não entregam"),
      p("Eles não publicam requisito de computador, preço em reais nem a planta do mapa. Lucia e Jason estão apresentados na matéria da [dupla](/blog/gta-6-lucia-e-jason). Leonida e Vice City estão na matéria do [cenário](/blog/gta-6-mapa-leonida-e-vice-city). Se a pergunta é aparelho, ela está em [GTA 6 vai sair para PC?](/blog/gta-6-plataformas-ps5-xbox-e-pc)."),
      chamada({
        tema: "pc-gamer",
        titulo: "Viu os vídeos e quer montar o canto de jogar?",
        texto: `A ${loja} monta o PC para os jogos que já estão no computador e para ver trailer em tela grande. WhatsApp (19) 98751-0267 ou Av. Anchieta, 789, Cambuí.`,
        rotulo: "Montar com a loja",
        href: "/montagempc",
        mensagem: "Olá! Vi a matéria dos trailers de GTA 6 e quero montar um canto para jogar.",
      }),
      p("Todos os textos da série estão em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "Quantos trailers oficiais de GTA 6 existem?",
        resposta:
          "A página do Launch Trailer lista cinco vídeos: Trailer 1, Trailer 2, An Extended Look, o próprio Launch Trailer e Pre-Load Now.",
      },
      {
        pergunta: "Qual vídeo mostra mais o jogo?",
        resposta:
          "An Extended Look, de 27 de agosto de 2026, com 26 minutos e 48 segundos. A PlayStation descreve esse vídeo como captura in-game no PS5.",
      },
      {
        pergunta: "Onde assistir sem cair em corte de fã?",
        resposta:
          "No site da Rockstar, na página do Launch Trailer e na página de mídia. É a fonte que tem data e duração.",
      },
      {
        pergunta: "O Launch Trailer mudou o dia do jogo?",
        resposta:
          "Não. O vídeo é de 15 de outubro de 2026. A estreia continua 19 de novembro de 2026 no PS5 e no Xbox Series X|S.",
      },
      {
        pergunta: "Algum trailer anunciou a versão de PC?",
        resposta:
          "Não. Os vídeos divulgam o jogo de console. A página oficial segue sem computador na lista de plataformas.",
      },
    ],
  },
  {
    slug: "gta-6-mapa-leonida-e-vice-city",
    titulo: "Mapa de GTA 6: Leonida, Vice City e o que já foi mostrado",
    seoTitulo: "Mapa de GTA 6: Leonida, Vice City e o que se sabe",
    resumo:
      "O mapa de GTA 6 confirmado tem o estado de Leonida e a cidade de Vice City. Veja a sinopse oficial e o que ainda é só clima de Flórida.",
    palavrasChave: ["mapa de gta 6", "leonida gta 6", "vice city gta 6", "cenário gta 6"],
    etiquetas: ["GTA 6", "Leonida", "Vice City", "Mapa"],
    capaAlt: "Palmeira na beira do mar em Miami Beach, clima do mapa de GTA 6 em Vice City.",
    fontes: fontes("rockstarSinopse", "rockstarMidia", "rockstarVi"),
    blocos: [
      p("O mapa de GTA 6, no que a Rockstar escreveu, cabe em dois nomes: o estado de Leonida e a cidade de Vice City. A sinopse oficial coloca Jason e Lucia no meio de uma conspiração que atravessa Leonida, “no lado mais escuro do lugar mais ensolarado dos Estados Unidos”. O resto é cenário de divulgação, não uma planta com escala."),
      rapida([
        "Leonida é o estado fictício. Vice City é a cidade. Os dois nomes estão no site da Rockstar.",
        "A sinopse não entrega bairros, estradas nem tempo de travessia. Mapa completo é coisa de jogar, ou de um guia posterior da própria Rockstar.",
        "As fotos desta matéria são de Miami e de Miami Beach, para o clima. Não são captura do jogo.",
      ]),
      h2("Mapa de GTA 6: os nomes que já estão no site"),
      p("Vice City volta como cidade. Na série, ela sempre foi a leitura da Rockstar de uma metrópole costeira, com praia, neon e excesso. Leonida é o estado em volta, o nome novo que a campanha usa para dizer que a história não fica presa num bairro só. A página de mídia separa capturas com o rótulo Vice City e outras com Jason e Lucia. Isso confirma que a cidade é cenário mostrado, não um easter egg de fã."),
      citacao({
        texto:
          "Jason and Lucia have always known the deck is stacked against them. But when an easy score goes wrong, they find themselves on the darkest side of the sunniest place in America, in the middle of a criminal conspiracy stretching across the state of Leonida.",
        autor: "Rockstar Games",
        cargo: "sinopse oficial de Grand Theft Auto VI",
        fonte: "rockstarSinopse",
      }),
      p("A frase está em inglês no site. Em português direto: os dois sabem que o jogo é desfavorável, um golpe fácil dá errado, e eles param no lado mais escuro do lugar mais ensolarado dos Estados Unidos, no meio de uma conspiração que cruza Leonida. É gancho de história. Não é lista de regiões."),
      img(
        "Ocean Drive à noite é o tipo de rua que Vice City cita. A foto é Miami Beach de verdade.",
        "Ocean Drive à noite com letreiros coloridos, referência visual do mapa de GTA 6.",
      ),
      h2("O que dá para esperar de um mundo aberto da Rockstar"),
      p("Quem jogou GTA V lembra de Los Santos e do condado em volta: cidade densa, estrada, interior, e a travessia como parte da brincadeira. Leonida, pelo texto, pede um desenho parecido, com a conspiração atravessando o estado. Parecido não é igual. Enquanto a Rockstar não publicar um mapa com nomes de bairro, qualquer “lista completa de distritos” que circule em vídeo é fã completando o que ainda não foi entregue."),
      p("Para o computador, isso muda uma escolha prática mesmo sem ficha do GTA 6. Mundo aberto grande pede disco rápido, porque a cidade entra na memória conforme você dirige, e pede placa à altura da tela, porque a rua cheia é o que a GPU desenha. Esse raciocínio está no guia de [SSD](/blog/ssd-para-gta-6) e no de [placa de vídeo](/blog/placa-de-video-para-gta-6), sempre como preparação para jogos desse tipo, não como requisito oficial."),
      tabela({
        titulo: "O que está confirmado e o que é clima",
        colunas: ["Elemento", "Situação", "Fonte"],
        linhas: [
          ["Estado de Leonida", "Nome oficial na sinopse", "Site da Rockstar"],
          ["Vice City", "Cidade oficial, com capturas rotuladas", "Página de mídia"],
          ["Miami e Miami Beach", "Inspiração visual desta matéria, não mapa do jogo", "Fotos de arquivo"],
          ["Lista de bairros e tempo de viagem", "Não publicada", "Fora do site oficial"],
        ],
        fonte: "rockstarMidia",
      }),
      img(
        "Rua cheia e neon ajudam a ler o tom. Não desenham a missão.",
        "Rua de Miami Beach à noite com neon, clima do mapa de GTA 6 em Vice City.",
      ),
      h2("Como usar isso na hora de jogar"),
      ul([
        "Quer a história: leia a sinopse e veja o Trailer 2, em que a dupla aparece junta. O roteiro dos vídeos está em [trailers](/blog/gta-6-trailers-oficiais).",
        "Quer não tomar spoiler de mapa: evite vídeo com “todos os segredos do mapa”. O jogo acaba de estrear nos consoles.",
        "Quer reconhecer o clima: Vice City é praia, noite e excesso. As fotos de Miami ilustram isso e param por aí.",
      ]),
      p("Quem são os dois no meio dessa conspiração está na matéria de [Lucia e Jason](/blog/gta-6-lucia-e-jason). O dia de entrar no estado, de console, está no [lançamento](/blog/gta-6-lancamento-19-novembro-2026). Se você vai jogar no sofá, carregue o controle de dia e deixe o console atualizado. A meia-noite não é hora de descobrir que o sistema pediu um patch."),
      img(
        "Hotéis na beira da rua, de noite: o postal que a série usa desde os Vice City antigos.",
        "Hotéis iluminados à noite em Miami, paisagem associada a Vice City no mapa de GTA 6.",
      ),
      chamada({
        tema: "pc-gamer",
        titulo: "Mundo aberto no PC que você já tem",
        texto: `Enquanto Leonida não chega ao computador, a ${loja} ajusta o PC para os mundos abertos que já rodam. Av. Anchieta, 789, Cambuí, Campinas. WhatsApp (19) 98751-0267.`,
        rotulo: "Falar da minha máquina",
        href: "/pcgamer",
        mensagem: "Olá! Li a matéria do mapa de GTA 6 e quero ver se meu PC aguenta os mundos abertos que eu já jogo.",
      }),
      p("A série completa está em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "Qual é o mapa de GTA 6?",
        resposta:
          "O que a Rockstar nomeou é o estado de Leonida e a cidade de Vice City. Não há um mapa oficial com todos os bairros publicado no site.",
      },
      {
        pergunta: "Vice City é Miami?",
        resposta:
          "Vice City é a cidade fictícia da série, no estado fictício de Leonida. O visual conversa com a Flórida. As fotos de Miami ilustram o clima e não são cena do jogo.",
      },
      {
        pergunta: "Dá para atravessar o estado inteiro?",
        resposta:
          "A sinopse diz que a conspiração atravessa Leonida. O tamanho jogável, as estradas e o tempo de viagem a Rockstar ainda não publicou numa ficha.",
      },
      {
        pergunta: "O mapa muda a escolha do PC?",
        resposta:
          "Mundo aberto costuma pedir SSD e uma placa à altura da sua tela. Isso é padrão de jogos grandes atuais, não um requisito publicado para o GTA 6.",
      },
      {
        pergunta: "Onde ver a cidade sem spoiler de missão?",
        resposta:
          "Nas capturas rotuladas Vice City, na página de mídia da Rockstar, e nos trailers oficiais. Fuja de compilação de “todos os lugares secretos”.",
      },
    ],
  },
];
