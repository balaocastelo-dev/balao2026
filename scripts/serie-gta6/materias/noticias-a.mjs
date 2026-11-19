import { f } from "../fontes.mjs";
import { chamada, destaque, fecho, fig, h2, h3, p, pros, resumo } from "../blocos.mjs";

const capa = (alt, kicker, titulo, apoio, selo, numero) => ({
  id: "capa",
  papel: "capa",
  layout: "capa",
  alt,
  kicker,
  titulo,
  apoio,
  selo,
  numero,
});

export const noticiasA = [
  {
    slug: "gta-6-lancamento-19-novembro-2026",
    titulo: "GTA 6 chega em 19 de novembro de 2026: o que foi confirmado",
    seoTitulo: "GTA 6 em 19 de novembro de 2026: o que foi confirmado",
    resumo:
      "A Rockstar fixou GTA 6 para 19 de novembro de 2026, no PS5 e no Xbox Series. Veja qual data vale e o que ainda não foi anunciado.",
    categoria: "noticias",
    etiquetas: ["GTA 6", "Lançamento", "Rockstar"],
    publicadoEm: "2026-11-18T16:00:00.000Z",
    palavrasChave: ["gta 6 lançamento", "data gta 6", "gta 6 19 de novembro", "quando sai gta 6"],
    fontes: ["rockstarData", "vergeAtraso", "reuters", "playstation", "takeTwo"],
    imagens: [
      capa(
        "Capa escura com a data 19 nov 2026 em destaque e o título sobre o lançamento de GTA 6",
        "Notícias · GTA 6",
        "19 de novembro de 2026",
        "A data que a Rockstar fixou para PS5 e Xbox Series.",
        "Lançamento",
        "19 nov",
      ),
      {
        id: "datas",
        papel: "corpo",
        layout: "timeline",
        alt: "Linha do tempo com a janela de 2025, a data de maio de 2026 e o lançamento em 19 de novembro de 2026",
        titulo: "As datas que a Rockstar chegou a anunciar",
        nota: "Janela de 2025 e 26 de maio de 2026 conforme Reuters e The Verge. Data final no comunicado da Rockstar.",
        legenda: "A data que vale é a última. As anteriores explicam por que a busca ainda mostra maio de 2026.",
        itens: [
          { quando: "2025", texto: "Janela inicial do anúncio" },
          { quando: "26 mai 2026", texto: "Data seguinte, depois trocada" },
          { quando: "19 nov 2026", texto: "Lançamento no console" },
        ],
      },
      {
        id: "confirmado",
        papel: "corpo",
        layout: "colunas",
        alt: "Duas colunas: o que já foi anunciado para o lançamento de GTA 6 e o que ainda não tem comunicado oficial",
        titulo: "Anunciado e ainda em aberto",
        nota: "Consulta às páginas da Rockstar, da PlayStation e da Take-Two em 19 de novembro de 2026.",
        legenda: "Separar o que tem fonte do que é espera evita comprar peça por um requisito que não existe.",
        destaque: 0,
        colunas: [
          { titulo: "Já tem fonte", itens: ["19 de novembro de 2026", "PS5 e Xbox Series", "Campanha solo", "Edições Standard e Ultimate"] },
          { titulo: "Sem comunicado", itens: ["Versão de PC", "Requisito de hardware", "Preço em reais", "Modo online no lançamento"] },
        ],
      },
    ],
    blocos: [
      p("Quem pesquisa a data de GTA 6 ainda encontra maio de 2026 no meio dos resultados. Essa data existiu: a Rockstar chegou a anunciá-la e depois a trocou. O lançamento marcado para os consoles é 19 de novembro de 2026, uma quinta-feira."),
      p("A resposta curta está no comunicado da própria Rockstar, de 6 de novembro de 2025: o jogo passa a sair nessa data, no PlayStation 5 e no Xbox Series X|S. Até 19 de novembro de 2026 não havia versão de PC anunciada. O resto desta matéria é o caminho das datas e o que isso muda para quem está montando computador."),
      resumo([
        "**A data de console é 19 de novembro de 2026.** Foi a Rockstar quem fixou, depois de duas janelas anteriores.",
        "**PS5 e Xbox Series estão no lançamento.** A página oficial lista essas plataformas, não o PC.",
        "**Maio de 2026 ficou para trás.** A Reuters registrou essa data como a promessa anterior.",
        "**Requisito de PC não existe.** Sem versão anunciada, não há configuração oficial para copiar.",
      ]),
      h2("Qual data vale quando as notícias se contradizem"),
      p("A regra prática é ficar com o comunicado mais novo da empresa que faz o jogo. Em 6 de novembro de 2025 a Rockstar escreveu que Grand Theft Auto VI passaria a sair na quinta-feira, 19 de novembro de 2026. O texto pede desculpas pela espera extra e diz que os meses a mais serviriam para terminar o jogo no nível de acabamento que o público espera."),
      {
        tipo: "citacao",
        texto: "Lamentamos acrescentar mais tempo a uma espera que sabemos já ser longa, mas esses meses a mais vão permitir terminar o jogo com o nível de acabamento que vocês esperam e merecem.",
        autor: "Rockstar Games",
        cargo: "comunicado de 6 de novembro de 2025",
        fonte: f("rockstarData"),
        traduzida: true,
      },
      p("A [The Verge](https://www.theverge.com/news/816005/grand-theft-auto-vi-gta-g-delayed-november-2026) publicou a mesma frase no mesmo dia e lembrou o que vinha antes: a data vigente era 26 de maio de 2026, e antes disso havia uma janela em 2025. A [Reuters](https://www.reuters.com/business/media-telecom/take-two-interactive-further-delays-gta-vi-november-next-year-2025-11-06/) tratou o anúncio como o segundo adiamento. Por isso um guia antigo ainda pode dizer maio. Não é que o autor tenha inventado: é que a data mudou."),
      fig("datas"),
      h2("O que essa quinta-feira inclui"),
      p("A [página oficial](https://www.rockstargames.com/VI) mostra PlayStation 5 e Xbox Series X|S, com a chamada de que o jogo rende melhor no PS5. A [PlayStation](https://www.playstation.com/en-us/games/grand-theft-auto-vi/) confirma o dia 19 de novembro de 2026 também para o PS5 Pro e diz que o jogo não roda no PlayStation 4. Não é um detalhe de compatibilidade escondido: está na pergunta frequente da loja."),
      p("O mesmo texto da PlayStation responde que Grand Theft Auto VI é uma experiência de um jogador. Quem espera um modo online no dia do lançamento não encontra essa promessa ali. O [comunicado da Take-Two](https://taketwointeractivesoftwareinc.gcs-web.com/news-releases/news-release-details/rockstar-games-announces-pre-orders-grand-theft-auto-vi/), de 24 de junho de 2026, repete a data, as duas famílias de console e o preço em dólares da edição padrão. O preço em reais não está nesse comunicado."),
      h3("Meia-noite local, não um horário único no mundo"),
      p("O suporte da PlayStation marca o lançamento à meia-noite no fuso de quem joga, no PlayStation 5. Não dá para transformar isso num único horário de Brasília e achar que vale para todas as lojas: cada vitrine pode liberar o download no fuso dela. O que não muda é o dia."),
      destaque(
        "Como ler uma data antiga",
        "Se o texto diz 26 de maio de 2026 e não cita o comunicado de novembro de 2025, ele descreve uma promessa que a Rockstar substituiu. A data de console que ficou de pé é 19 de novembro de 2026.",
        "atencao",
      ),
      h2("O que o dia do lançamento não responde"),
      fig("confirmado"),
      p("Três perguntas continuam sem página oficial. A primeira é a versão de PC: o site da Rockstar, o comunicado da Take-Two e a matéria da PlayStation listam console. A segunda é o requisito de hardware, que só faria sentido depois de uma versão de computador. A terceira é o preço em reais, que cada loja define e que este blog não copia de anúncio velho."),
      p("Há relatos de imprensa sobre uma janela de PC em 2027. Enquanto a Rockstar não publicar data, isso permanece relato, não calendário. O artigo sobre [plataformas de GTA 6](/blog/gta-6-plataformas-ps5-xbox-e-pc) separa o que cada aparelho faz no lançamento, e o de [PC para GTA 6](/blog/pc-para-gta-6-sem-requisito-oficial) explica o que dá para decidir sem requisito."),
      h2("O que muda para quem está comprando computador"),
      p("Comprar uma placa “porque o GTA 6 pede” é decidir com um número que não foi publicado. O que dá para fazer agora é outro: escolher a máquina pelos jogos que você já roda e pela tela que você já tem, e deixar folga de memória e de SSD para quando a ficha oficial existir. Trocar de peça no susto, na semana do console, não aproxima o PC de um jogo que ainda não tem versão de PC."),
      p("A série inteira está em [GTA 6 no blog](/blog/gta-6). A data de console responde quando o jogo chega na sala. Não responde qual fonte, qual placa ou qual quantidade de memória comprar."),
      pros(
        ["A data de console tem dono: o comunicado da Rockstar, não um fórum", "Dá para ignorar guias que ainda citam maio de 2026 como se fosse o plano atual", "Fica claro o que não comprar enquanto o PC não for anunciado"],
        ["Quem quer jogar no dia 19 precisa de console, não de um PC montado no escuro", "A data já mudou duas vezes; um novo comunicado pode mudá-la de novo", "Preço em reais e requisito de PC continuam fora do anúncio"],
      ),
      h2("Antes de decidir na loja"),
      p("Na Balão da Informática Anchieta, na Av. Anchieta, 789, no Cambuí, em Campinas, a conversa começa pelo uso: quais jogos você roda hoje, em que monitor, e se a máquina também vai transmitir. O computador sai montado para isso. GTA 6 entra na conta quando a Rockstar publicar versão e requisito, não antes."),
      p("O orçamento é do dia em que você pergunta, no WhatsApp (19) 98751-0267 ou no balcão. Este texto não trava preço de peça. A decisão honesta, hoje, é tratar 19 de novembro de 2026 como a data de console e deixar o PC fora dessa fila até haver ficha oficial."),
      fecho(
        "Quer montar sem chutar requisito de GTA 6?",
        "Diga quais jogos você joga hoje e qual é o seu monitor. A equipe indica a máquina por esse uso e mostra ela ligada antes do pagamento.",
      ),
    ],
    perguntas: [
      {
        pergunta: "GTA 6 já lançou?",
        resposta:
          "O lançamento de console marcado pela Rockstar é 19 de novembro de 2026, para PlayStation 5 e Xbox Series X|S. Uma matéria antiga que ainda cita 26 de maio de 2026 está desatualizada: essa data foi substituída em novembro de 2025.",
      },
      {
        pergunta: "Dá para jogar GTA 6 no PC nesse dia?",
        resposta:
          "Até 19 de novembro de 2026 a Rockstar não tinha anunciado versão de PC, nem pré-venda, nem requisito. O que está à venda para o dia do lançamento é o jogo de console.",
      },
      {
        pergunta: "Por que tanta gente ainda fala em maio de 2026?",
        resposta:
          "Porque essa foi a data anunciada antes. A Reuters e a The Verge registram a troca para 19 de novembro de 2026. Quando duas datas circulam, vale a do comunicado mais novo.",
      },
      {
        pergunta: "O jogo tem modo online no lançamento?",
        resposta:
          "A página da PlayStation descreve Grand Theft Auto VI como uma experiência de um jogador. Um modo online no dia do lançamento não está nessa resposta.",
      },
    ],
  },
  {
    slug: "gta-6-plataformas-ps5-xbox-e-pc",
    titulo: "GTA 6 no PS5 e no Xbox Series: e o PC, foi anunciado?",
    seoTitulo: "GTA 6 no PS5 e no Xbox: e o PC foi anunciado?",
    resumo:
      "No lançamento, GTA 6 está no PS5 e no Xbox Series. O PC não foi anunciado até 19 de novembro de 2026. Veja o que cada aparelho faz.",
    categoria: "noticias",
    etiquetas: ["GTA 6", "PS5", "Xbox", "PC"],
    publicadoEm: "2026-11-17T15:00:00.000Z",
    palavrasChave: ["gta 6 ps5", "gta 6 xbox", "gta 6 pc", "gta 6 plataformas"],
    fontes: ["rockstarVI", "playstation", "xbox", "yahooPc", "takeTwo", "psSuporte"],
    imagens: [
      capa(
        "Capa com o selo de quatro casos e o título sobre PS5, Xbox Series e a ausência de anúncio de PC",
        "Notícias · plataformas",
        "PS5, Xbox e o PC",
        "O que entra no dia 19 e o que a Rockstar não listou.",
        "Plataformas",
        "4 casos",
      ),
      {
        id: "aparelhos",
        papel: "corpo",
        layout: "cartoes",
        alt: "Cartões comparando PS5, Xbox Series, Xbox One via nuvem e PC sem anúncio oficial",
        titulo: "Quatro aparelhos, quatro situações",
        nota: "PS5 e Xbox Series nas páginas oficiais. Nuvem no Xbox Wire de 10 de novembro de 2026. PC sem anúncio.",
        legenda: "Nuvem não é a versão de console rodando no aparelho. PC sem data não é versão atrasada confirmada.",
        itens: [
          { titulo: "PS5 e PS5 Pro", texto: "Versão nativa. Não roda no PS4. No Pro há PSSR e sombra com ray tracing." },
          { titulo: "Xbox Series X e S", texto: "Versão nativa. É a família que a Take-Two lista no lançamento." },
          { titulo: "Xbox One", texto: "Só por nuvem, com gráfico de Series S, e o jogo é comprado à parte." },
          { titulo: "PC", texto: "Fora da lista oficial até 19 de novembro de 2026. Sem pré-venda e sem requisito." },
        ],
      },
      {
        id: "nativo",
        papel: "corpo",
        layout: "colunas",
        alt: "Colunas separando jogo instalado no console e jogo transmitido pela nuvem",
        titulo: "Instalado no aparelho ou só na nuvem",
        nota: "Xbox Wire, 10 de novembro de 2026.",
        legenda: "Quem tem Xbox One não instala o jogo: transmite. A diferença importa na hora de escolher o aparelho.",
        destaque: 0,
        colunas: [
          { titulo: "Roda no aparelho", itens: ["PlayStation 5", "PS5 Pro", "Xbox Series X", "Xbox Series S"] },
          { titulo: "Não é o mesmo caso", itens: ["Xbox One, só nuvem", "PS4, não roda", "PC, sem anúncio", "Nuvem varia por país"] },
        ],
      },
    ],
    blocos: [
      p("A pergunta de balcão, nesta semana, é se o computador que a pessoa já tem roda GTA 6 no dia do lançamento. A página do jogo não lista PC. Lista PlayStation 5 e Xbox Series X|S."),
      p("Até 19 de novembro de 2026 a Rockstar não anunciou versão de computador, pré-venda de PC nem requisito. Dá para jogar no dia 19 num PS5 ou num Xbox Series. Nos outros aparelhos, ou não roda, ou só existe um caminho de nuvem com letra miúda."),
      resumo([
        "**PS5, PS5 Pro e Xbox Series são o lançamento.** É o que a Rockstar e a Take-Two publicaram.",
        "**PS4 fica de fora.** A PlayStation diz isso na pergunta frequente, sem ambiguidade.",
        "**Xbox One entra só pela nuvem.** O Xbox Wire avisa que o gráfico é o do Series S e que o jogo se compra à parte.",
        "**PC não está na lista.** Relato de imprensa não substitui a página da Rockstar.",
      ]),
      h2("O que a página oficial coloca no dia 19"),
      p("A [página da Rockstar](https://www.rockstargames.com/VI) mostra dois selos: PlayStation 5 e Xbox Series X|S, e diz que o jogo rende melhor no PS5. A [Take-Two](https://taketwointeractivesoftwareinc.gcs-web.com/news-releases/news-release-details/rockstar-games-announces-pre-orders-grand-theft-auto-vi/) repete essas plataformas no comunicado de pré-venda. Não há uma terceira coluna para Windows."),
      fig("aparelhos"),
      p("No ecossistema da Sony, a [página do jogo](https://www.playstation.com/en-us/games/grand-theft-auto-vi/) marca PS5 e PS5 Pro. O Pro ganha clareza extra pelo PSSR, a reconstrução de imagem da Sony, e sombra com ray tracing, desde que a tela seja compatível. O mesmo texto diz que o DualSense usa vibração e gatilho adaptativo. Nada disso aparece como promessa de PC, porque o PC não está nessa página."),
      h2("PlayStation 4 e Xbox One não são o mesmo “não”"),
      p("No PS4 a resposta é fechada: a PlayStation escreve que o jogo só roda em consoles PlayStation 5. Não há modo de compatibilidade anunciado, nem versão reduzida."),
      p("No Xbox One a resposta é outra, e está no [Xbox Wire de 10 de novembro de 2026](https://news.xbox.com/en-us/2026/11/10/grand-theft-auto-6-comes-to-xbox-cloud-gaming-november-19/). O jogo pode ser transmitido pela nuvem nesse console, com os gráficos do Xbox Series S, a partir da 1h da manhã no horário do Leste dos Estados Unidos no dia 19. Não é o jogo instalado no Xbox One. A compra do jogo é separada, e a disponibilidade da nuvem muda por país e por aparelho. Quem está no Brasil precisa checar a loja da Microsoft da própria conta, em vez de assumir que o anúncio americano vale aqui."),
      fig("nativo"),
      h3("Series S não é Series X com outro nome"),
      p("Os dois estão no lançamento nativo. O Xbox Wire trata o Series X como a experiência de console mais alta da marca e o Series S como o caminho nativo mais barato. Quando o jogo é só nuvem, inclusive num Series, o gráfico informado é o do Series S. São três experiências, não uma."),
      h2("O PC ficou de fora do comunicado"),
      p("Em 15 de novembro de 2026, uma [reportagem do Just Jared republicada no Yahoo](https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html) conferiu o site oficial e um relatório da Take-Two: as plataformas do dia 19 continuavam sendo PS5 e Xbox Series, sem data de PC, sem pré-venda de PC e sem requisito. A mesma reportagem lembra o intervalo histórico de GTA V e de Red Dead Redemption 2, que chegaram ao computador depois do console. Isso é precedente, não calendário de GTA 6."),
      destaque(
        "Relato não é data",
        "Há matéria citando fontes anônimas sobre um PC no começo de 2027. A Rockstar não confirmou. Tratar essa janela como plano de compra é decidir em cima de um boato.",
        "atencao",
      ),
      p("O histórico, como essa reportagem resume, é de espera: GTA V saiu em console em setembro de 2013 e no PC em abril de 2015; Red Dead Redemption 2 saiu em console em outubro de 2018 e no PC em novembro de 2019. O intervalo mudou de um jogo para o outro. Não serve para marcar o mês de GTA 6 no computador."),
      h2("O que fazer com o computador enquanto isso"),
      p("Se a meta é jogar no dia 19, o aparelho da lista oficial é um console da geração atual, não um upgrade de placa feito no escuro. Se a meta é estar pronto para uma versão de PC que ainda não existe, o caminho é outro e está no guia de [PC para GTA 6](/blog/pc-para-gta-6-sem-requisito-oficial): montar para os jogos de agora, com folga, e esperar a ficha."),
      p("A [data de lançamento](/blog/gta-6-lancamento-19-novembro-2026) e a [série completa](/blog/gta-6) fecham o contexto. Plataforma é a primeira pergunta. Requisito de PC é uma pergunta que a Rockstar ainda não abriu."),
      pros(
        ["Dá para saber, com fonte, em qual aparelho o jogo existe no dia 19", "PS4 e Xbox One deixam de ser tratados como se fossem a mesma limitação", "O PC sai da lista de compra de lançamento sem virar promessa de que nunca virá"],
        ["A nuvem do Xbox depende de país, conta e compra à parte", "Um anúncio de PC pode surgir depois desta matéria", "Quem só tem PC não joga no dia 19 com o que foi publicado até agora"],
      ),
      h2("Antes de trocar de aparelho"),
      p("Na Balão da Informática Anchieta, Av. Anchieta, 789, Cambuí, Campinas, a equipe não vende console no lugar de uma conversa sobre o PC que você já tem. Se o uso é jogo de computador hoje, o papo é a [montagem](/montagempc) para esses jogos. GTA 6 no dia 19 não entra nessa conta enquanto a versão de PC não existir."),
      p("Chame no WhatsApp (19) 98751-0267 e diga qual aparelho você tem. A resposta honesta pode ser “esse PC não é o caminho do dia 19”. Escolha o aparelho pela lista oficial, não pelo desejo de que o PC já esteja nela."),
      fecho(
        "Seu PC é para os jogos de agora ou para o dia 19?",
        "Conte o que você joga hoje. Se a meta for GTA 6 no lançamento, a conversa começa pela lista de consoles, não por uma placa sem requisito.",
      ),
    ],
    perguntas: [
      {
        pergunta: "GTA 6 roda no PS4 ou no Xbox One?",
        resposta:
          "No PS4, não: a PlayStation diz que só os consoles PlayStation 5 rodam o jogo. No Xbox One, o Xbox Wire anuncia transmissão pela nuvem, não uma versão instalada, com gráfico de Series S e compra do jogo à parte.",
      },
      {
        pergunta: "O PS5 Pro muda alguma coisa?",
        resposta:
          "A página da PlayStation diz que no PS5 Pro o jogo usa PSSR e sombra com ray tracing, em tela compatível. Continua sendo a mesma versão de PS5, com um modo de imagem mais alto.",
      },
      {
        pergunta: "Vai ter GTA 6 no Steam no lançamento?",
        resposta:
          "Até 19 de novembro de 2026 não havia pré-venda de PC em loja nenhuma anunciada pela Rockstar, inclusive Steam. O comunicado da Take-Two cita PlayStation Store, Microsoft Store e Rockstar Games Store para o jogo de console.",
      },
      {
        pergunta: "Posso ir montando o PC com a configuração do PS5?",
        resposta:
          "Não há equivalência publicada. O console não informa a peça de PC correspondente, e a Rockstar não publicou requisito de computador. Montar “no olho” é chute.",
      },
    ],
  },
];
