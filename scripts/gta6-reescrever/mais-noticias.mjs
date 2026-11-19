import { p, h2, ul, rapida, img, nota, tabela, citacao, chamada, fontes } from "./blocos.mjs";

const loja = "Balão da Informática Anchieta, loja de informática em Campinas";

export const maisNoticias = [
  {
    slug: "gta-6-lucia-e-jason",
    titulo: "Lucia e Jason em GTA 6: a dupla que a Rockstar apresentou",
    seoTitulo: "Lucia e Jason: quem são os protagonistas de GTA 6",
    resumo:
      "Lucia e Jason são a dupla jogável de GTA 6. A Rockstar os apresenta como Lucia Caminos e Jason Duval, no meio de uma conspiração em Leonida.",
    palavrasChave: ["lucia e jason", "lucia caminos", "jason duval", "protagonistas gta 6"],
    etiquetas: ["GTA 6", "Lucia", "Jason", "História"],
    capaAlt: "Hotéis e palmeiras de Miami Beach, cenário que ambienta Lucia e Jason em GTA 6.",
    fontes: fontes("rockstarSinopse", "rockstarMidia", "rockstarTrailer"),
    blocos: [
      p("Lucia e Jason são os dois protagonistas de Grand Theft Auto VI. A página de mídia da Rockstar batiza os clipes como Lucia Caminos e Jason Duval. A sinopse oficial não entrega a biografia inteira: entrega o vínculo. Quando um golpe fácil dá errado, os dois precisam um do outro para sair vivos de uma conspiração que atravessa Leonida."),
      rapida([
        "Lucia Caminos e Jason Duval são os nomes nos clipes oficiais. No texto corrido, a Rockstar usa Lucia e Jason.",
        "A campanha é a história dos dois em Vice City e no estado de Leonida, não um modo solo com personagem mudo.",
        "Trailer 1 apresenta Lucia. Trailer 2 coloca Jason ao lado dela. O vídeo longo de agosto de 2026 mostra os dois em ação.",
      ]),
      h2("Quem são Lucia e Jason, pelo que a Rockstar escreveu"),
      p("A sinopse diz que os dois sempre souberam que as regras estão contra eles. Não é um casal colado no cartaz por marketing vazio: o texto marca dependência. Um precisa do outro. Isso muda o jeito de ler os trailers. Quando a câmera corta de um para o outro, a Rockstar está mostrando a dupla da campanha, no mesmo espírito de Michael, Franklin e Trevor em GTA V, só que aqui são dois e a sinopse apoia o laço entre eles."),
      citacao({
        texto:
          "Jason and Lucia have always known the deck is stacked against them. But when an easy score goes wrong, they find themselves on the darkest side of the sunniest place in America, in the middle of a criminal conspiracy stretching across the state of Leonida.",
        autor: "Rockstar Games",
        cargo: "sinopse oficial de Grand Theft Auto VI",
        fonte: "rockstarSinopse",
      }),
      p("Em português: eles sabem que o jogo é desfavorável, o golpe fácil dá errado, e os dois caem no lado mais escuro do lugar mais ensolarado dos Estados Unidos, no meio de uma conspiração que cruza o estado de Leonida. A sinopse oficial para nesse gancho. Apelido, idade e ficha criminal completa não estão nesse parágrafo, e por isso ficam de fora."),
      img(
        "Jogar a campanha, na estreia, é no console. A dupla já está nomeada no site.",
        "Pessoa de headset e controle jogando, no clima da campanha de Lucia e Jason em GTA 6.",
      ),
      h2("O que cada trailer acrescenta sobre a dupla"),
      p("O Trailer 1, de 4 de dezembro de 2023, é o vídeo de Lucia. É por ele que o público conhece a protagonista antes de saber o par. O Trailer 2, de 6 de maio de 2025, traz Jason para o mesmo quadro. Se você só tem dez minutos, assista esses dois nessa ordem e deixe o resto para quando quiser mais gameplay. A lista com duração está em [trailers de GTA 6](/blog/gta-6-trailers-oficiais)."),
      p("An Extended Look, de 27 de agosto de 2026, dura quase 27 minutos. A PlayStation descreve esse vídeo como captura in-game no PS5. É o lugar para ver os dois se movendo no mundo, não só posando. Se você quer chegar na campanha sem saber o golpe, pare antes desse vídeo: meia hora mostra bem mais do que um teaser."),
      tabela({
        titulo: "Onde a dupla aparece no material oficial",
        colunas: ["Material", "O que mostra da dupla", "Data"],
        linhas: [
          ["Trailer 1", "Lucia, Vice City e Leonida", "4 de dezembro de 2023"],
          ["Trailer 2", "Jason ao lado de Lucia", "6 de maio de 2025"],
          ["Clipes da página de mídia", "Lucia Caminos e Jason Duval, com nome e sobrenome", "página de mídia"],
          ["An Extended Look", "Os dois em gameplay longo no PS5", "27 de agosto de 2026"],
        ],
        fonte: "rockstarMidia",
      }),
      img(
        "A avenida de Miami à noite sugere a cidade. A conspiração, no texto, atravessa o estado inteiro.",
        "Avenida de Miami à noite com rastros de luz, clima de Vice City para Lucia e Jason.",
      ),
      h2("O que ainda não dá para afirmar"),
      ul([
        "Não há ficha oficial de idade, emprego ou endereço dos dois além do que a sinopse e os vídeos mostram.",
        "Elenco secundário só entra aqui quando a Rockstar assina o nome. Lista de wiki não substitui o site.",
        "Não há campanha de PC anunciada. Jogar Lucia e Jason na estreia é no PS5 ou no Xbox Series X|S.",
      ]),
      p("O estado e a cidade estão na matéria do [mapa](/blog/gta-6-mapa-leonida-e-vice-city). O dia de começar a campanha está no [lançamento](/blog/gta-6-lancamento-19-novembro-2026)."),
      img(
        "Crepúsculo, palmeira e rua acesa: o postal da dupla, fotografado em Miami Beach.",
        "Miami Beach no crepúsculo com palmeiras, paisagem ligada a Lucia e Jason em GTA 6.",
      ),
      nota(
        "dica",
        "Ordem boa para conhecer os dois",
        "Sinopse no site, Trailer 1, Trailer 2. Só depois, se você quiser gameplay, An Extended Look. A página de mídia confirma os sobrenomes nos clipes.",
      ),
      chamada({
        tema: "games",
        titulo: "Vai jogar a campanha no console?",
        texto: `Se o controle falha ou o console não liga na hora H, a ${loja} avalia PlayStation e Xbox no Cambuí. Av. Anchieta, 789. WhatsApp (19) 98751-0267.`,
        rotulo: "Levar o console",
        href: "/assistenciagames",
        mensagem: "Olá! Li a matéria de Lucia e Jason e quero ver meu console antes de jogar GTA 6.",
      }),
      p("Se você vai chegar na campanha sem spoiler, pare no Trailer 2. O vídeo longo de agosto mostra os dois em movimento por quase meia hora, e aí a surpresa do golpe diminui. A série está reunida em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "Quem são Lucia e Jason em GTA 6?",
        resposta:
          "São os protagonistas da campanha. A Rockstar os apresenta como Lucia Caminos e Jason Duval e descreve os dois presos a uma conspiração no estado de Leonida.",
      },
      {
        pergunta: "Dá para jogar só com um deles?",
        resposta:
          "A sinopse trata a história como a dos dois, obrigados a contar um com o outro. A Rockstar não publicou um modo em que você escolhe um e apaga o outro.",
      },
      {
        pergunta: "Qual vídeo apresenta cada um?",
        resposta:
          "O Trailer 1, de dezembro de 2023, apresenta Lucia. O Trailer 2, de maio de 2025, coloca Jason na mesma história.",
      },
      {
        pergunta: "Os sobrenomes são oficiais?",
        resposta:
          "Sim. A página de mídia da Rockstar nomeia os clipes como Lucia Caminos e Jason Duval.",
      },
      {
        pergunta: "A campanha já está no PC?",
        resposta:
          "Não foi anunciada para computador. Na estreia de 19 de novembro de 2026, Lucia e Jason estão no PS5 e no Xbox Series X|S.",
      },
    ],
  },
  {
    slug: "gta-6-preco-e-edicoes",
    titulo: "Preço do GTA 6: Standard, Ultimate e o pacote Vintage",
    seoTitulo: "Preço do GTA 6: edições e o que cada uma inclui",
    resumo:
      "O preço do GTA 6 anunciado pela Take-Two é US$ 79,99 na Standard e US$ 99,99 na Ultimate. Veja o que entra em cada edição e o que não vira preço em reais.",
    palavrasChave: ["preço do gta 6", "gta 6 ultimate", "gta 6 standard", "edições gta 6"],
    etiquetas: ["GTA 6", "Preço", "Edições", "Take-Two"],
    capaAlt: "Console com o controle na frente, para quem compara o preço do GTA 6 nas duas edições.",
    fontes: fontes("takeTwo", "playstation", "psSuporte", "rockstarVi"),
    blocos: [
      p("O preço do GTA 6 que a Take-Two publicou no comunicado de pré-venda, em 24 de junho de 2026, é de US$ 79,99 na edição padrão e US$ 99,99 na Ultimate Edition. Os dois valores são em dólar, para PlayStation 5 e Xbox Series X|S. O preço em reais é o da PlayStation Store, da Microsoft Store ou da loja onde você compra, e muda. Um número em real copiado de anúncio envelhece e vira promessa falsa."),
      rapida([
        "Standard: US$ 79,99, o jogo base. Ultimate: US$ 99,99, com veículos, armas, roupas e ações extras na história de Jason e Lucia.",
        "Quem compra até 19 de novembro de 2026, pelo comunicado, leva o Vintage Vice City Pack. Reserva digital inclui um mês de GTA+.",
        "Não existe preço de PC porque não existe versão de PC anunciada.",
      ]),
      h2("Preço do GTA 6: as duas edições do comunicado"),
      p("A edição padrão é o jogo. A Ultimate, no texto da Take-Two, “amplifica a experiência” com uma coleção exclusiva de veículos, armas, roupas e ações espalhadas pela história de Jason e Lucia. A diferença de US$ 20, no preço americano, é essa coleção. Não é um segundo mapa e não é um passe de um ano inteiro: é o que a frase lista. Se a loja brasileira descrever outro pacote, vale a descrição da loja na hora da compra, não um print antigo."),
      p("A página da PlayStation repete o gancho da Ultimate: coleção exclusiva de veículos, armas, roupas e ações na história dos dois. O suporte da PlayStation ainda avisa que a melhoria da Standard para a Ultimate, tanto na digital quanto na caixa com código, só é vendida na PlayStation Store. Ou seja, quem comprou a padrão e se arrependeu não resolve isso na prateleira física."),
      img(
        "PS5 na mesa: a edição que você escolhe é a do console, não uma caixa de PC.",
        "PlayStation 5 em pé com o controle ao lado, console do preço do GTA 6 anunciado.",
      ),
      tabela({
        titulo: "O que a Take-Two colocou no comunicado",
        colunas: ["Edição ou bônus", "Valor anunciado", "O que o texto promete"],
        linhas: [
          ["Standard", "US$ 79,99", "O jogo, campanha single-player"],
          ["Ultimate Edition", "US$ 99,99", "Veículos, armas, roupas e ações extras na história"],
          ["Vintage Vice City Pack", "Incluso nas compras até 19/11/2026", "Itens que citam a Vice City antiga, de quando o neon brilhava mais"],
          ["Um mês de GTA+", "Reserva digital", "Mês grátis, já resgatável, com a biblioteca de jogos do GTA+"],
        ],
        fonte: "takeTwo",
        nota: "Valores em dólar, do comunicado de 24 de junho de 2026. O preço em reais fica na loja em que você paga.",
      }),
      h2("Caixa, código e o que não está incluso"),
      p("A versão de loja física é uma caixa com código de download. A Take-Two marcou a chegada dessa caixa para 12 de novembro de 2026, para dar tempo de pré-carga. Você não leva o jogo gravado num disco cheio. Leva o direito de baixar, e o console precisa dos gigabytes. O espaço está na matéria de [pré-carga](/blog/gta-6-pre-carga-e-tamanho)."),
      p("GTA+ é o serviço da série em GTA Online, não um modo novo do GTA 6. O mês grátis da reserva digital serve para quem já joga GTA V e quer a biblioteca do serviço. Se você não liga para GTA Online, esse bônus não muda a campanha de Lucia e Jason."),
      img(
        "No Xbox a conta é a mesma: duas edições, preço de dólar no comunicado, preço de real na Microsoft Store.",
        "Console Xbox branco e controle, outra vitrine do preço do GTA 6.",
      ),
      h2("Como escolher sem se perder no extra"),
      ul([
        "Quer só a campanha: Standard resolve. A história é a mesma.",
        "Quer os itens espalhados na história dos dois: Ultimate. Leia a lista na loja no dia, porque o comunicado fala em coleção, não enumera cada carro.",
        "Vai comprar até o dia 19: o Vintage Vice City Pack entra nas compras feitas antes de 20 de novembro de 2026, pelo texto da Take-Two.",
        "Joga no PC e espera uma chave: não há edição de computador à venda. Desconfie de anúncio com preço de PC.",
      ]),
      p("Os aparelhos estão em [GTA 6 vai sair para PC?](/blog/gta-6-plataformas-ps5-xbox-e-pc). O dia e a hora no Brasil estão no [lançamento](/blog/gta-6-lancamento-19-novembro-2026)."),
      img(
        "O pacote Vintage cita a Vice City antiga. A praia da foto é Flórida de verdade, só o clima.",
        "Praia da Flórida vista de cima, clima do pacote Vintage no preço do GTA 6.",
      ),
      nota(
        "atencao",
        "Preço em reais",
        "Não fixamos valor em real. A cotação e a política de cada loja mudam, e um número velho neste blog viraria promessa. Confira na PlayStation Store, na Microsoft Store ou no varejo na hora de pagar.",
      ),
      chamada({
        tema: "games",
        titulo: "Dúvida na hora de pagar a edição?",
        texto: `A ${loja} não vende a chave do jogo, e também não inventa preço. Se o console precisa de revisão antes da estreia, o balcão é na Av. Anchieta, 789, Cambuí. WhatsApp (19) 98751-0267.`,
        rotulo: "Falar com a loja",
        href: "/assistenciagames",
        mensagem: "Olá! Li a matéria do preço do GTA 6 e quero ver se meu console está pronto.",
      }),
      p("Mais respostas curtas estão nas [perguntas frequentes](/blog/gta-6-perguntas-frequentes). A série inteira fica em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "Qual é o preço do GTA 6?",
        resposta:
          "No comunicado da Take-Two, a edição padrão custa US$ 79,99 e a Ultimate custa US$ 99,99. O valor em reais é o da loja em que você compra.",
      },
      {
        pergunta: "O que a Ultimate tem a mais?",
        resposta:
          "A Take-Two descreve uma coleção exclusiva de veículos, armas, roupas e ações espalhadas pela história de Jason e Lucia. Não é outro mapa.",
      },
      {
        pergunta: "O que é o Vintage Vice City Pack?",
        resposta:
          "É o bônus de quem compra até 19 de novembro de 2026, com itens que remetem à Vice City antiga. Entra nas compras feitas antes de 20 de novembro, pelo comunicado.",
      },
      {
        pergunta: "A caixa já vem com o jogo no disco?",
        resposta:
          "Não. A versão física anunciada é uma caixa com código de download. O console ainda precisa de espaço para a pré-carga.",
      },
      {
        pergunta: "Tem preço de GTA 6 para PC?",
        resposta:
          "Não. A pré-venda publicada é de PlayStation 5 e Xbox Series X|S. Anúncio de preço para computador, antes de a Rockstar anunciar essa versão, não é oficial.",
      },
    ],
  },
  {
    slug: "gta-6-perguntas-frequentes",
    titulo: "Perguntas sobre GTA 6: data, PC, preço e pré-carga",
    seoTitulo: "Perguntas sobre GTA 6 respondidas com fonte oficial",
    resumo:
      "Perguntas sobre GTA 6 com resposta curta e fonte: data, plataformas, preço em dólar, pré-carga de 212 GB e o que a Rockstar ainda não publicou.",
    palavrasChave: ["perguntas sobre gta 6", "faq gta 6", "dúvidas gta 6", "gta 6 resumo"],
    etiquetas: ["GTA 6", "Perguntas", "Rockstar"],
    capaAlt: "Pessoa de fone no computador, pesquisando as perguntas sobre GTA 6 mais comuns.",
    fontes: fontes("rockstarVi", "takeTwo", "playstation", "psSuporte", "verge", "yahooPc"),
    blocos: [
      p("Perguntas sobre GTA 6 se repetem desde o primeiro trailer, e a maioria tem resposta curta no site da Rockstar, no comunicado da Take-Two ou na página da PlayStation. Esta matéria junta essas respostas e aponta o texto da série em que cada uma está desenvolvida. O que não está na fonte fica de fora."),
      rapida([
        "Estreia em 19 de novembro de 2026, no PS5 e no Xbox Series X|S.",
        "Preço anunciado em dólar: US$ 79,99 na Standard e US$ 99,99 na Ultimate. O real é o da loja.",
        "Pré-carga desde 10 de novembro para quem reservou, com pelo menos 212 GB livres no PS5. PC não foi anunciado.",
      ]),
      h2("Perguntas sobre GTA 6 que a página oficial já fecha"),
      p("A data é 19 de novembro de 2026. Ela está no topo do site da Rockstar e no newswire de 6 de novembro de 2025, quando a empresa trocou a data anterior. No PS5, o suporte marca a liberação à meia-noite no fuso de quem joga. Em Brasília, isso é 00:00 do dia 19. O passo a passo da noite está no [lançamento](/blog/gta-6-lancamento-19-novembro-2026)."),
      p("As plataformas da estreia são PlayStation 5, PS5 Pro e Xbox Series X|S. Computador não está na lista. A Yahoo, em 15 de novembro de 2026, registrou a ausência de data de PC, de pré-venda e de requisitos. A conversa completa, com o histórico de GTA V e Red Dead Redemption 2, está em [GTA 6 vai sair para PC?](/blog/gta-6-plataformas-ps5-xbox-e-pc)."),
      img(
        "Parte da conversa acontece no balcão, quando a dúvida deixa de ser o jogo e passa a ser o computador de casa.",
        "Parede de acessórios da Balão da Informática Anchieta, loja em Campinas que responde dúvidas de PC ligadas a GTA 6.",
      ),
      tabela({
        titulo: "Resposta em uma linha",
        colunas: ["Pergunta", "Resposta curta", "Onde ler mais"],
        linhas: [
          ["Quando lança?", "19 de novembro de 2026", "Newswire da Rockstar"],
          ["Em qual aparelho?", "PS5, PS5 Pro e Xbox Series X|S", "Site da Rockstar e da PlayStation"],
          ["Quanto custa?", "US$ 79,99 ou US$ 99,99", "Comunicado da Take-Two"],
          ["Quanto espaço?", "Pelo menos 212 GB no PS5", "Página da PlayStation"],
          ["Tem no PC?", "Não anunciado", "Lista oficial, sem computador"],
        ],
        fonte: "rockstarVi",
      }),
      h2("Preço, edição e caixa"),
      p("US$ 79,99 é a Standard. US$ 99,99 é a Ultimate, com a coleção de veículos, armas, roupas e ações na história de Jason e Lucia. Compras até 19 de novembro de 2026 levam o Vintage Vice City Pack, e a reserva digital leva um mês de GTA+. Nada disso é preço em reais. A matéria de [preço](/blog/gta-6-preco-e-edicoes) separa cada bônus."),
      p("A caixa da loja traz um código, não o jogo gravado. Ela chegou às prateleiras em 12 de novembro para permitir a pré-carga. Raspar o código sem espaço livre só gera uma barra de download. O número e o calendário estão em [pré-carga e tamanho](/blog/gta-6-pre-carga-e-tamanho)."),
      img(
        "Praia da Flórida, de drone: o clima de Leonida, não um mapa com escala.",
        "Praia da Flórida vista de cima, cenário que ilustra as perguntas sobre GTA 6 e Vice City.",
      ),
      h2("História, cidade e vídeos"),
      p("Lucia Caminos e Jason Duval são os protagonistas. A sinopse os coloca juntos numa conspiração que atravessa Leonida, com Vice City como a cidade. Os sobrenomes estão nos clipes da página de mídia. A dupla tem matéria própria: [Lucia e Jason](/blog/gta-6-lucia-e-jason). O cenário tem outra: [mapa](/blog/gta-6-mapa-leonida-e-vice-city)."),
      p("Há cinco vídeos oficiais na página do Launch Trailer. O mais longo é An Extended Look, de 27 de agosto de 2026, com 26 minutos e 48 segundos, descrito pela PlayStation como captura in-game no PS5. A ordem para assistir está em [trailers](/blog/gta-6-trailers-oficiais)."),
      ul([
        "Quer jogar na estreia: console da lista, espaço livre, sistema atualizado de dia.",
        "Quer esperar o PC: não compre chave paralela. O precedente de GTA V e RDR2 é histórico, não data.",
        "Quer montar computador agora: monte para a sua tela e para os jogos de hoje. Comece por [PC para GTA 6](/blog/pc-para-gta-6-sem-requisito-oficial).",
      ]),
      img(
        "Quem joga no sofá separa o controle. Quem joga no PC espera o anúncio.",
        "Controle de videogame em close, objeto das perguntas sobre GTA 6 no console.",
      ),
      h2("O que esta página não chuta"),
      p("Não há lista de bairros, não há requisito de PC, não há preço em reais e não há data de computador. Quando a Rockstar publicar qualquer um desses itens, a fonte vai ser o newswire, a Take-Two ou a loja oficial do console. Até lá, a série deste blog separa o que já está escrito do que é vontade de fã."),
      chamada({
        tema: "geral",
        titulo: "A dúvida saiu do jogo e foi para o PC?",
        texto: `A ${loja} responde no WhatsApp (19) 98751-0267 e no balcão da Av. Anchieta, 789, Cambuí. Telefone (19) 3255-1661. Leve o modelo da tela e diga quais jogos você já roda.`,
        rotulo: "Chamar a loja",
        href: "/fale-conosco",
        mensagem: "Olá! Li as perguntas sobre GTA 6 e quero orientação para o meu computador.",
      }),
      p("Quando uma resposta daqui envelhecer, a fonte para conferir é o site da Rockstar, não um recorte antigo. A data, o aparelho e o preço em dólar já estão nas matérias linkadas acima. Todos os textos estão em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "Quando lança GTA 6?",
        resposta: "19 de novembro de 2026, para PlayStation 5 e Xbox Series X|S. No PS5, à meia-noite no horário local.",
      },
      {
        pergunta: "GTA 6 tem versão de PC?",
        resposta: "Não foi anunciada. Não há pré-venda de computador nem ficha técnica de PC no site da Rockstar.",
      },
      {
        pergunta: "Quanto custa?",
        resposta:
          "A Take-Two anunciou US$ 79,99 na Standard e US$ 99,99 na Ultimate. O preço em reais é o da loja, e não fica fixo neste blog.",
      },
      {
        pergunta: "Quantos gigabytes precisa?",
        resposta:
          "A PlayStation pede pelo menos 212 GB livres no PS5. A pré-carga de quem reservou começou em 10 de novembro de 2026.",
      },
      {
        pergunta: "Quem são os protagonistas?",
        resposta: "Lucia Caminos e Jason Duval. A história dos dois se passa em Vice City e no estado de Leonida.",
      },
      {
        pergunta: "A caixa física já instala sozinha?",
        resposta: "Não. A caixa traz um código de download. O console ainda precisa baixar o jogo e ter espaço livre.",
      },
    ],
  },
  {
    slug: "gta-6-pre-carga-e-tamanho",
    titulo: "Pré-carga do GTA 6: quando começa e quantos GB separa",
    seoTitulo: "Pré-carga do GTA 6: data, espaço e código na caixa",
    resumo:
      "A pré-carga do GTA 6 começou em 10 de novembro de 2026 para quem reservou. No PS5, separe pelo menos 212 GB e não conte com o disco da caixa.",
    palavrasChave: ["pré-carga do gta 6", "gta 6 212 gb", "tamanho gta 6", "download gta 6"],
    etiquetas: ["GTA 6", "Pré-carga", "PS5", "Armazenamento"],
    capaAlt: "Gabinete de PC com luz interna, ao lado da conversa sobre a pré-carga do GTA 6 nos consoles.",
    fontes: fontes("rockstarPreload", "playstation", "psSuporte", "verge", "takeTwo"),
    blocos: [
      p("A pré-carga do GTA 6 começou em 10 de novembro de 2026 para quem já tinha reservado. A página Pre-Load Now da Rockstar avisa que o download antecipado está liberado e que, se você ainda não reservou, essa é a hora de chegar em 19 de novembro com o jogo no console. O número que trava a instalação, no PS5, é o espaço: a PlayStation pede pelo menos 212 GB livres."),
      rapida([
        "PS5: pré-carga desde 10 de novembro de 2026, à meia-noite no horário local, para quem reservou.",
        "Xbox Series X|S: a Rockstar marcou o início para 10 de novembro às 00:00 GMT, conforme a The Verge.",
        "212 GB é o piso que a PlayStation publica para o PS5. Não é ficha de PC, porque versão de computador não foi anunciada.",
      ]),
      h2("Pré-carga do GTA 6: quem pode baixar e quando"),
      p("Não é um download aberto para qualquer conta. O texto da Rockstar e o da PlayStation falam em quem reservou. Sem reserva, a pré-carga não começa. Com reserva digital, o console baixa sozinho se houver espaço e se a conta for a mesma da compra. Vale conferir o e-mail da loja e ver se a licença está na biblioteca antes de culpar a internet."),
      p("No PS5, o horário de início é meia-noite local de 10 de novembro. No Xbox, a The Verge registrou o horário que a Rockstar passou: 10 de novembro às 00:00 GMT, não à meia-noite de Brasília. Quem deixou para a véspera no Xbox pode ter achado a pré-carga “atrasada” só por comparar com o fuso errado. A estreia em si, no PS5, é outra meia-noite: a de 19 de novembro, no fuso local, explicada no [lançamento](/blog/gta-6-lancamento-19-novembro-2026)."),
      img(
        "Consoles diferentes, fusos diferentes. O calendário oficial evita achar que o download falhou.",
        "Controles de videogame sobre a mesa, cena da pré-carga do GTA 6 em mais de um aparelho.",
      ),
      tabela({
        titulo: "Espaço e calendário da pré-carga",
        colunas: ["Console", "Início da pré-carga", "Espaço que a fonte cita"],
        linhas: [
          ["PlayStation 5", "10/11/2026, meia-noite local", "Pelo menos 212 GB livres"],
          ["Xbox Series X|S", "10/11/2026, 00:00 GMT", "Até 212 GB, conforme o aparelho"],
          ["Caixa com código", "Nas lojas a partir de 12/11/2026", "O código só dispara o mesmo download"],
        ],
        fonte: "playstation",
        nota: "O “até 212 GB, conforme o aparelho” é a formulação que a The Verge atribui à Rockstar. O piso de 212 GB no PS5 está na página da PlayStation.",
      }),
      h2("Por que 212 GB não cabem “no que sobrou”"),
      p("Duzentos e doze gigabytes é o jogo, não o sistema, não a captura de tela e não o outro jogo que você jurou que ia apagar depois. Na prática, apague o que não joga mais até sobrar os 212 GB e ainda uma folga. Captura em 4K e um segundo jogo grande comem essa folga numa tarde. Se o console mostra “espaço insuficiente” no meio da barra, a pré-carga para e você chega na meia-noite do dia 19 baixando em vez de jogando."),
      p("SSD externo ajuda no PS5 quando o interno lotou, desde que o acessório seja compatível com jogos de PS5. A página da PlayStation, no passo a passo, aponta as opções de armazenamento extra. Não compre o primeiro disco de USB antigo: jogo de PS5 não roda de pendrive lento. Se a dúvida é qual gaveta serve, leve o modelo do console na loja antes de abrir a embalagem."),
      img(
        "No computador a conversa de espaço é outra: SSD para os jogos que já estão instalados.",
        "SSD sobre a mesa, peça que conversa com o tamanho da pré-carga do GTA 6 no console.",
      ),
      h2("Caixa com código não pula o download"),
      p("A Take-Two descreveu a versão de loja como caixa com código, à venda a partir de 12 de novembro de 2026, justamente para a pré-carga. Raspar o código instala o mesmo arquivo. Quem comprou a caixa e guardou na estante até a noite do dia 19 ainda vai esperar a barra. O preço das edições, em dólar, está em [preço do GTA 6](/blog/gta-6-preco-e-edicoes)."),
      ul([
        "Confira se a reserva está na conta certa, a do console da sala.",
        "Atualize o sistema de dia.",
        "Libere no mínimo 212 GB no PS5 e deixe folga.",
        "Deixe o console em repouso, ligado na tomada, não desligue no filtro de linha.",
        "Na noite do dia 19, abra o jogo. Se a barra ainda anda, a pré-carga não terminou.",
      ]),
      p("No PC, 212 GB não é requisito de Grand Theft Auto VI. É o tamanho que a PlayStation publicou para o console. Quando uma versão de computador existir, o instalador pode ser outro número. Enquanto isso, o guia de [SSD para GTA 6](/blog/ssd-para-gta-6) serve para organizar os jogos que você já tem, com folga de verdade."),
      img(
        "Pilha de HDs lembra o óbvio: espaço acaba, e acaba na véspera.",
        "Discos rígidos empilhados, imagem do espaço que a pré-carga do GTA 6 exige no console.",
      ),
      chamada({
        tema: "upgrade",
        titulo: "O console lotou ou o PC está sem disco?",
        texto: `A ${loja} instala SSD e confere armazenamento no Cambuí. Av. Anchieta, 789, Campinas. WhatsApp (19) 98751-0267. Telefone (19) 3255-1661.`,
        rotulo: "Ver upgrade de SSD",
        href: "/upgrade-ssd",
        mensagem: "Olá! Li a matéria da pré-carga do GTA 6 e quero ajuda com espaço em disco.",
      }),
      p("As outras respostas rápidas estão nas [perguntas frequentes](/blog/gta-6-perguntas-frequentes) e na série [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "Quando começou a pré-carga do GTA 6?",
        resposta:
          "Em 10 de novembro de 2026, para quem reservou. No PS5, à meia-noite no horário local. No Xbox Series X|S, às 00:00 GMT, segundo a Rockstar na cobertura da The Verge.",
      },
      {
        pergunta: "Quantos GB o GTA 6 ocupa no PS5?",
        resposta:
          "A PlayStation pede pelo menos 212 GB livres. A Rockstar falou em até 212 GB conforme o aparelho. Deixe folga além desse número.",
      },
      {
        pergunta: "Sem reserva dá para pré-carregar?",
        resposta: "Não. A Rockstar e a PlayStation limitam a pré-carga a quem reservou o jogo.",
      },
      {
        pergunta: "A caixa física evita o download?",
        resposta:
          "Não. A caixa traz um código. O arquivo é o mesmo, e o espaço necessário continua valendo.",
      },
      {
        pergunta: "212 GB é o requisito do PC?",
        resposta:
          "Não. É o número publicado para o console. A Rockstar não anunciou versão de PC nem o tamanho de um instalador de computador.",
      },
    ],
  },
];
