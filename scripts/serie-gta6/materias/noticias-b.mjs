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

export const noticiasB = [
  {
    slug: "gta-6-trailers-oficiais",
    titulo: "Trailers de GTA 6: o que cada vídeo oficial mostrou",
    seoTitulo: "Trailers de GTA 6: o que a Rockstar mostrou",
    resumo:
      "A página de mídia da Rockstar lista cinco vídeos oficiais de GTA 6, com data. Este texto não narra cenas: registra o que cada página confirma.",
    categoria: "noticias",
    etiquetas: ["GTA 6", "Trailers", "Rockstar"],
    publicadoEm: "2026-11-16T15:00:00.000Z",
    palavrasChave: ["trailers de gta 6", "trailer gta 6", "extended look gta 6", "pre-load now gta 6"],
    fontes: ["rockstarMidia", "playstation", "rockstarVI"],
    imagens: [
      capa(
        "Capa escura com cinco datas e o título sobre os vídeos oficiais de GTA 6 na página de mídia",
        "Notícias · trailers",
        "Cinco vídeos oficiais",
        "Nome e data na página de mídia, sem narrar cena.",
        "Mídia",
        "5 vídeos",
      ),
      {
        id: "videos",
        papel: "corpo",
        layout: "timeline",
        alt: "Linha do tempo com os cinco vídeos oficiais de GTA 6, de dezembro de 2023 a novembro de 2026",
        titulo: "Os cinco vídeos, pela data publicada",
        nota: "Datas na página de mídia da Rockstar. Nenhuma marca descreve cena.",
        legenda: "A ordem é a das datas. Um repost sem data não substitui um vídeo desta lista.",
        itens: [
          { quando: "4 dez 2023", texto: "Trailer 1" },
          { quando: "6 mai 2025", texto: "Trailer 2" },
          { quando: "27 ago 2026", texto: "An Extended Look" },
          { quando: "15 out 2026", texto: "Launch Trailer" },
          { quando: "10 nov 2026", texto: "Pre-Load Now" },
        ],
      },
      {
        id: "limites",
        papel: "corpo",
        layout: "colunas",
        alt: "Duas colunas separam o que a página de mídia confirma e o que um trailer de GTA 6 não anuncia",
        titulo: "O que o vídeo sustenta e o que ele não entrega",
        nota: "Página de mídia da Rockstar e página da PlayStation, consultadas para esta série.",
        legenda: "Captura in-game vale para o Extended Look, porque a PlayStation escreveu isso. Não vale para os outros por tabela.",
        destaque: 0,
        colunas: [
          {
            titulo: "A página confirma",
            itens: ["Cinco vídeos com data", "Extended Look: captura no PS5", "Pre-Load Now em 10 nov 2026", "Lançamento segue em 19 nov"],
          },
          {
            titulo: "O vídeo não entrega",
            itens: ["Lista de cenas", "Preço em reais", "Requisito de PC", "Mapa completo"],
          },
        ],
      },
    ],
    blocos: [
      p("Quem procura os trailers de GTA 6 encontra cortes, reposts e vídeos sem data misturados ao resultado. A lista datada está na página de mídia da Rockstar. São cinco vídeos: Trailer 1, Trailer 2, An Extended Look, Launch Trailer e Pre-Load Now. Cada um entra aqui pelo nome e pela data que essa página publica."),
      p("A página não descreve cenas, e este texto também não descreve. Completar um plano com memória de quem assistiu seria tratar suposição como anúncio. O dado extra, e só para um dos cinco, vem de outra página oficial: a PlayStation diz que An Extended Look é captura in-game no PS5. O dia do jogo não é a data de nenhum trailer."),
      resumo([
        "**São cinco vídeos com data.** A lista é a página de mídia da Rockstar, não um corte solto.",
        "**An Extended Look tem um complemento.** A PlayStation informa captura in-game no PS5.",
        "**A data do vídeo não é a do jogo.** O lançamento de console segue 19 de novembro de 2026.",
        "**Cena, preço em reais e PC ficam de fora.** Essas páginas não publicam isso.",
      ]),
      h2("Qual vídeo corresponde a qual data"),
      p("A ordem que importa é a cronológica, porque a busca costuma embaralhar os anos. O Trailer 1 é de 4 de dezembro de 2023. O Trailer 2 é de 6 de maio de 2025. An Extended Look é de 27 de agosto de 2026. O Launch Trailer é de 15 de outubro de 2026. O Pre-Load Now é de 10 de novembro de 2026."),
      {
        tipo: "tabela",
        titulo: "Vídeos na página de mídia de GTA 6",
        colunas: ["Vídeo", "Data", "O que dá para afirmar"],
        linhas: [
          ["Trailer 1", "4 dez 2023", "Está na página, com essa data"],
          ["Trailer 2", "6 mai 2025", "Está na página, com essa data"],
          ["An Extended Look", "27 ago 2026", "PlayStation: captura in-game no PS5"],
          ["Launch Trailer", "15 out 2026", "Está na página, com essa data"],
          ["Pre-Load Now", "10 nov 2026", "Vídeo com esse nome na mesma página"],
        ],
        fonte: f("rockstarMidia"),
        nota: "A linha do Extended Look também usa a página da PlayStation. Nenhuma linha descreve cena.",
      },
      fig("videos"),
      p("O Trailer 1 é o mais antigo dessa lista, e o Pre-Load Now é o mais novo. O intervalo entre eles é o tempo em que a Rockstar foi publicando material, não um roteiro para reconstruir de cabeça. Se o vídeo que você viu não tem uma dessas cinco datas na página de mídia, ele não entra no lugar de um deles."),
      h2("O que a PlayStation acrescenta a um deles"),
      p("An Extended Look, de 27 de agosto de 2026, é o único com uma frase a mais. A [página da PlayStation](https://www.playstation.com/en-us/games/grand-theft-auto-vi/) diz que esse vídeo é captura in-game no PS5. A frase vale para esse vídeo. Não autoriza escrever a mesma coisa no Trailer 1, no Trailer 2, no Launch Trailer ou no Pre-Load Now, porque essas linhas não trazem o mesmo rótulo."),
      h3("Captura no PS5 não é configuração de computador"),
      p("Captura in-game no PS5 significa, no texto da PlayStation, que a imagem saiu daquele console. Não publica resolução-alvo, não lista peça e não abre versão de PC. Até 19 de novembro de 2026 a página do jogo segue em PlayStation 5 e Xbox Series X|S. Quem procura requisito de computador não acha esse número num trailer."),
      h2("O que nenhum desses vídeos anuncia"),
      fig("limites"),
      p("O preço em dólares está no comunicado da Take-Two, não numa leitura de trailer. O valor em reais não está nesse comunicado. Assistir de novo ao vídeo não faz esse número aparecer. A página de mídia entrega nome e data. Moeda e valor ficam no texto da Take-Two."),
      p("Jason e Lucia estão no texto oficial, e o que se sabe dos dois está na matéria de [Lucia e Jason](/blog/gta-6-lucia-e-jason). Trailer datado não substitui a sinopse. Misturar as duas fontes é o jeito mais rápido de atribuir uma frase a quem não a escreveu."),
      p("A data de lançamento tampouco muda porque um trailer saiu em outubro. O Launch Trailer é de 15 de outubro de 2026. O dia marcado para os consoles continua 19 de novembro de 2026, como está na matéria do [lançamento](/blog/gta-6-lancamento-19-novembro-2026). Data de publicação do vídeo e data de ligar o jogo são perguntas diferentes."),
      destaque(
        "Fora da lista não entra no lugar",
        "Corte, reação e repost sem data na página de mídia não substituem o Trailer 1, o Trailer 2, o An Extended Look, o Launch Trailer nem o Pre-Load Now.",
        "atencao",
      ),
      h2("Qual vídeo abrir conforme a pergunta"),
      p("Se a pergunta é a pré-carga, o vídeo da lista é o Pre-Load Now, de 10 de novembro de 2026. O nome e a data batem com o dia em que a PlayStation e a Rockstar, em novembro de 2026, falam em pré-carga. O que esse arquivo ocupa, e por que a caixa física não evita o download, está na matéria de [pré-carga](/blog/gta-6-pre-carga-e-tamanho). O vídeo, sozinho, não informa gigabytes."),
      p("Se a pergunta é quem são as pessoas da sinopse, o caminho é o texto oficial, não uma narração de cena. A [página do jogo](https://www.rockstargames.com/VI) e a [página de mídia](https://www.rockstargames.com/VI/launch-trailer) servem a coisas diferentes: uma apresenta o jogo, a outra reúne os vídeos. A série inteira está em [GTA 6 no blog](/blog/gta-6). Trailer responde qual vídeo existe. Não responde mapa, edição nem peça."),
      pros(
        [
          "Cada vídeo fica com a data da página de mídia, e o repost deixa de competir com ela",
          "A captura in-game fica restrita ao Extended Look, que é o vídeo sobre o qual a PlayStation escreveu isso",
          "A data de lançamento permanece no comunicado, separada do dia em que o trailer foi ao ar",
        ],
        [
          "Quem busca um roteiro de cenas não encontra isso nestas páginas",
          "Um vídeo novo pode entrar na página de mídia depois desta matéria",
          "Nome e data não trazem preço em reais, mapa completo nem requisito de PC",
        ],
      ),
      h2("Se o vídeo virou vontade de trocar de computador"),
      p("Na Balão da Informática Anchieta, um trailer não vira lista de peças. O endereço é Av. Anchieta, 789, Cambuí, Campinas. Você conta quais jogos já roda e em qual monitor, e vê a máquina ligada. O WhatsApp é (19) 98751-0267. A conversa cabe no que o computador faz hoje."),
      p("A [montagem](/montagempc) segue esse uso. GTA 6 no computador continua sem versão anunciada, então não há ficha para copiar de um vídeo. Os cinco trailers explicam a mídia oficial. A máquina, se você for montar agora, é a dos jogos que você já tem, mostrada ligada antes de decidir."),
      fecho(
        "O vídeo não diz qual peça comprar.",
        "Diga os jogos de hoje e o monitor. A equipe indica a máquina por esse uso e mostra ela ligada.",
      ),
    ],
    perguntas: [
      {
        pergunta: "Quantos trailers oficiais de GTA 6 a Rockstar publicou?",
        resposta:
          "A página de mídia reúne cinco vídeos datados: Trailer 1 em 4 de dezembro de 2023, Trailer 2 em 6 de maio de 2025, An Extended Look em 27 de agosto de 2026, Launch Trailer em 15 de outubro de 2026 e Pre-Load Now em 10 de novembro de 2026.",
      },
      {
        pergunta: "An Extended Look é imagem do jogo rodando?",
        resposta:
          "A PlayStation diz que An Extended Look é captura in-game no PS5. Essa frase é sobre esse vídeo. Os outros quatro não recebem o mesmo rótulo nas páginas usadas aqui.",
      },
      {
        pergunta: "O trailer mostra o preço de GTA 6?",
        resposta:
          "O preço anunciado está no comunicado da Take-Two, em dólares, não numa descrição de cena. O valor em reais não aparece nesse comunicado, e os vídeos da página de mídia não substituem essa fonte.",
      },
      {
        pergunta: "O Pre-Load Now muda o dia do lançamento?",
        resposta:
          "Não. O vídeo é de 10 de novembro de 2026 e acompanha a pré-carga falada para essa data. O lançamento de console marcado pela Rockstar continua 19 de novembro de 2026.",
      },
    ],
  },
  {
    slug: "gta-6-mapa-leonida-e-vice-city",
    titulo: "Mapa de GTA 6: Leonida, Vice City e o que foi mostrado",
    seoTitulo: "Mapa de GTA 6: Leonida e Vice City",
    resumo:
      "A sinopse de GTA 6 situa a história no estado de Leonida. Vice City está no nome do pacote, e os outros lugares não formam um mapa.",
    categoria: "noticias",
    etiquetas: ["GTA 6", "Mapa", "Leonida", "Vice City"],
    publicadoEm: "2026-11-16T12:00:00.000Z",
    palavrasChave: ["mapa gta 6", "leonida gta 6", "vice city gta 6", "mapa de gta 6"],
    fontes: ["rockstarVI", "playstation", "takeTwo"],
    imagens: [
      capa(
        "Capa com o nome Leonida e o aviso de que os lugares citados de GTA 6 não formam um mapa completo",
        "Notícias · mapa",
        "Nomes, não um mapa",
        "Leonida na sinopse. Os outros nomes não fecham um atlas.",
        "Lugares",
        "7 nomes",
      ),
      {
        id: "nomes",
        papel: "corpo",
        layout: "cartoes",
        alt: "Cartões com Leonida na sinopse, Vice City no pacote e os nomes da descrição da Ultimate de GTA 6",
        titulo: "Quatro jeitos de ler o que foi publicado",
        nota: "Sinopse na página da Rockstar. Pacote no comunicado da Take-Two. Nomes na PlayStation.",
        legenda: "Cada cartão é uma fonte diferente. Juntar os quatro num atlas é um passo que nenhuma delas deu.",
        itens: [
          { titulo: "Leonida", texto: "Estado citado na sinopse oficial." },
          { titulo: "Vice City", texto: "Nome do pacote de pré-venda, não um atlas." },
          { titulo: "Sete nomes", texto: "Estão na descrição da Ultimate." },
          { titulo: "Sem mapa", texto: "Distância e lista completa não saíram." },
        ],
      },
      {
        id: "leitura",
        papel: "corpo",
        layout: "colunas",
        alt: "Duas colunas separam os nomes que já foram publicados sobre o lugar de GTA 6 e o que não é um mapa",
        titulo: "O que dá para citar e o que não foi medido",
        nota: "Descrição da Ultimate Edition na PlayStation e sinopse oficial. Não é um atlas.",
        legenda: "A coluna da esquerda é nome publicado. A da direita é pergunta que essas páginas não respondem.",
        destaque: 0,
        colunas: [
          {
            titulo: "Dá para citar",
            itens: ["Estado de Leonida", "Frase do lugar ensolarado", "Sete nomes na Ultimate", "Pacote Vintage Vice City"],
          },
          {
            titulo: "Não foi publicado",
            itens: ["Mapa completo", "Distância entre lugares", "Lista de bairros", "Tamanho do estado"],
          },
        ],
      },
    ],
    blocos: [
      p("Quem busca o mapa de GTA 6 espera bairro, distância e o desenho de Vice City. O que saiu com nome de lugar é mais curto que um atlas. Dá para repetir a frase da sinopse, o nome de um pacote e sete nomes de uma descrição de edição. Não dá para traçar caminho com isso."),
      p("A sinopse oficial situa a conspiração no estado de Leonida e fala no lado mais escuro do lugar mais ensolarado dos Estados Unidos. Vice City, nos textos usados aqui, aparece no nome Vintage Vice City Pack. Os sete outros nomes estão na descrição da Ultimate Edition na PlayStation. A lista não se apresenta como mapa completo."),
      resumo([
        "**Leonida é o estado da sinopse.** A frase fala em conspiração nesse estado, não em quilômetros.",
        "**Vice City está no nome do pacote.** Vintage Vice City Pack não é um mapa da cidade.",
        "**Sete nomes vêm da descrição da Ultimate.** São nomes da edição, não um atlas.",
        "**Distância e mapa completo não saíram.** Citar o nome não mede a viagem.",
      ]),
      h2("O que a sinopse fixa sobre o lugar"),
      p("A [página oficial](https://www.rockstargames.com/VI) descreve Jason e Lucia no lado mais escuro do lugar mais ensolarado dos Estados Unidos, numa conspiração no estado de Leonida. Essa é a frase de cenário. Ela não lista cidade, não mede o estado e não desenha estrada. O que os dois fazem nessa história está na matéria de [Lucia e Jason](/blog/gta-6-lucia-e-jason), junto com a sinopse completa."),
      p("“Lugar mais ensolarado dos Estados Unidos” é imagem da sinopse, não coordenada. Não transforma Leonida num mapa que dê para imprimir, e não autoriza completar a geografia com o que um leitor espera de jogos anteriores. O que está escrito é o estado e essa frase. O que não está escrito continua fora."),
      h2("Quais nomes aparecem na descrição da Ultimate"),
      p("A descrição da Ultimate Edition na [PlayStation](https://www.playstation.com/en-us/games/grand-theft-auto-vi/) cita sete nomes: Mount Kalaga, Lake Leonida, Washington Beach, Gambit Bay, Watson Bay, Stockyard e Vercetti Estate. São nomes dessa descrição. Não são apresentados como a lista inteira de lugares, nem como bônus com endereço, nem como rota."),
      {
        tipo: "tabela",
        titulo: "Nomes na descrição da Ultimate Edition",
        colunas: ["Nome", "Onde está escrito"],
        linhas: [
          ["Mount Kalaga", "Descrição da Ultimate na PlayStation"],
          ["Lake Leonida", "Descrição da Ultimate na PlayStation"],
          ["Washington Beach", "Descrição da Ultimate na PlayStation"],
          ["Gambit Bay", "Descrição da Ultimate na PlayStation"],
          ["Watson Bay", "Descrição da Ultimate na PlayStation"],
          ["Stockyard", "Descrição da Ultimate na PlayStation"],
          ["Vercetti Estate", "Descrição da Ultimate na PlayStation"],
        ],
        fonte: f("playstation"),
        nota: "Nomes da descrição da edição. Não formam um mapa completo nem um atlas.",
      },
      fig("nomes"),
      h3("Nome na descrição não é rota"),
      p("Dá para dizer que Mount Kalaga e Watson Bay aparecem nessa descrição. Não dá para dizer quanto tempo a viagem leva, o que existe no meio ou se os dois ficam no mesmo condado. A tabela esgota o que essa página lista. Qualquer mapa desenhado em cima dela é ilustração de fã, não comunicado."),
      h2("Por que essa lista não é o mapa"),
      fig("leitura"),
      p("Um mapa responde vizinhança, escala e o que ficou de fora. Essa lista não responde nenhuma das três. São sete nomes, numa descrição de edição, mais o estado na sinopse. Tratar isso como o território inteiro de GTA 6 é concluir o que a página não concluiu. Se sair um mapa oficial depois, a lista pode crescer. Até lá, o honesto é citar a fonte e parar."),
      destaque(
        "Sete nomes não fecham Leonida",
        "Dá para repetir Mount Kalaga, Lake Leonida, Washington Beach, Gambit Bay, Watson Bay, Stockyard e Vercetti Estate com a descrição da Ultimate. Não dá para medir a viagem entre eles.",
        "atencao",
      ),
      h2("Onde Vice City aparece no anúncio"),
      p("No [comunicado da Take-Two](https://taketwointeractivesoftwareinc.gcs-web.com/news-releases/news-release-details/rockstar-games-announces-pre-orders-grand-theft-auto-vi/), de 24 de junho de 2026, compras feitas antes de 20 de novembro de 2026 incluem o Vintage Vice City Pack. Vice City, aqui, é parte do nome desse pacote. O comunicado não descreve o conteúdo do pacote e não desenha a cidade. Preço e prazo dessa compra estão na matéria de [preço e edições](/blog/gta-6-preco-e-edicoes)."),
      p("Os [trailers oficiais](/blog/gta-6-trailers-oficiais) também não servem, neste texto, como fonte de geografia. A página de mídia dá nome e data de vídeo, não uma legenda de cada plano. Quem quer o que foi mostrado com fonte fica com Leonida, com a frase do lugar ensolarado, com o pacote e com os sete nomes. A série está em [GTA 6 no blog](/blog/gta-6)."),
      pros(
        [
          "Cada nome fica com a página que o publicou, e a sinopse não é obrigada a funcionar como atlas",
          "Vice City permanece no nome do pacote, em vez de virar mapa da cidade sem texto que diga isso",
          "A descrição da Ultimate deixa de ser lida como a lista inteira de lugares",
        ],
        [
          "Não dá para planejar caminho entre Mount Kalaga e Watson Bay com o que foi publicado",
          "Um mapa oficial posterior pode ampliar essa lista",
          "Cena de trailer não entra como fonte de lugar neste texto",
        ],
      ),
      h2("Se o nome do lugar virou desculpa para trocar de PC"),
      p("Um nome de lugar não escolhe processador nem tela. Na Balão da Informática Anchieta, Av. Anchieta, 789, no Cambuí, em Campinas, a conversa começa pelo computador que você usa agora. A equipe liga a máquina para você ver. Leonida não entra como ficha de peça."),
      p("O WhatsApp (19) 98751-0267 recebe o que você já joga. Os nomes desta matéria ficam na sinopse e na descrição da edição. Se houver compra de computador, ela é pelos jogos de hoje, com a máquina ligada na sua frente, não por um atlas que a Rockstar ainda não publicou."),
      fecho(
        "O lugar publicado não escolhe o computador.",
        "Conte o que você roda agora. A máquina é montada para esse uso, e você a vê ligada.",
      ),
    ],
    perguntas: [
      {
        pergunta: "GTA 6 se passa em Vice City?",
        resposta:
          "Nos textos usados aqui, Vice City aparece no nome Vintage Vice City Pack, do comunicado da Take-Two. A sinopse oficial nomeia o estado de Leonida. Um mapa da cidade não foi publicado nessas páginas.",
      },
      {
        pergunta: "O que é Leonida em GTA 6?",
        resposta:
          "É o estado citado na sinopse oficial, onde a história envolve uma conspiração. A mesma frase fala no lado mais escuro do lugar mais ensolarado dos Estados Unidos. Não há medida nem mapa desse estado nessas páginas.",
      },
      {
        pergunta: "A lista da Ultimate Edition é o mapa inteiro?",
        resposta:
          "Não. Mount Kalaga, Lake Leonida, Washington Beach, Gambit Bay, Watson Bay, Stockyard e Vercetti Estate são nomes da descrição da edição na PlayStation. A própria lista não é apresentada como atlas completo.",
      },
      {
        pergunta: "Dá para saber a distância entre esses lugares?",
        resposta:
          "Não com o que foi publicado. As páginas citam os nomes e não informam vizinhança, escala nem tempo de viagem. Tratar a lista como rota é um acréscimo que a fonte não faz.",
      },
    ],
  },
  {
    slug: "gta-6-lucia-e-jason",
    titulo: "Lucia e Jason em GTA 6: o que se sabe dos dois",
    seoTitulo: "Lucia e Jason em GTA 6: o que se sabe",
    resumo:
      "O texto oficial de GTA 6 chama os dois de Jason e Lucia. Os sobrenomes Duval e Caminos saem na The Verge, não na Rockstar.",
    categoria: "noticias",
    etiquetas: ["GTA 6", "Lucia", "Jason"],
    publicadoEm: "2026-11-15T15:00:00.000Z",
    palavrasChave: ["lucia gta 6", "jason gta 6", "lucia caminos", "jason duval"],
    fontes: ["rockstarVI", "playstation", "vergeAtraso", "psSuporte"],
    imagens: [
      capa(
        "Capa com os nomes Lucia e Jason e a separação entre o texto oficial de GTA 6 e o sobrenome publicado na imprensa",
        "Notícias · personagens",
        "Lucia e Jason",
        "Nomes oficiais e o que a imprensa acrescentou.",
        "Nomes",
        "2 fontes",
      ),
      {
        id: "dupla",
        papel: "corpo",
        layout: "cartoes",
        alt: "Cartões com os nomes oficiais de Jason e Lucia, os sobrenomes da The Verge e o limite do que não foi escrito",
        titulo: "O que cada fonte põe nos dois nomes",
        nota: "Texto oficial na Rockstar. Sobrenomes na The Verge de 6 de novembro de 2025.",
        legenda: "Jason e Lucia são o texto oficial. Duval e Caminos pedem a matéria da The Verge ao lado.",
        itens: [
          { titulo: "Nomes oficiais", texto: "Jason e Lucia, na sinopse." },
          { titulo: "Sobrenomes", texto: "Duval e Caminos, na The Verge." },
          { titulo: "O golpe", texto: "Um golpe fácil dá errado." },
          { titulo: "Fora do texto", texto: "Idade e ofício não saíram." },
        ],
      },
      {
        id: "origem",
        papel: "corpo",
        layout: "colunas",
        alt: "Colunas separam o que o texto oficial diz de Jason e Lucia e o que só a The Verge publicou",
        titulo: "Texto oficial e imprensa, lado a lado",
        nota: "Sinopse na página da Rockstar. Sobrenomes na The Verge, 6 de novembro de 2025.",
        legenda: "A coluna da imprensa não vira frase da Rockstar. As duas podem ser citadas, cada uma com o seu dono.",
        destaque: 0,
        colunas: [
          {
            titulo: "No texto oficial",
            itens: ["Jason", "Lucia", "O jogo está contra eles", "Um golpe fácil dá errado"],
          },
          {
            titulo: "Na The Verge",
            itens: ["Jason Duval", "Lucia Caminos", "Publicado em 6 nov 2025", "Não é a sinopse da Rockstar"],
          },
        ],
      },
    ],
    blocos: [
      p("Quem pesquisa Lucia e Jason em GTA 6 mistura nome oficial, sobrenome de reportagem e frase que a Rockstar não escreveu. Dá para separar as três coisas. O texto oficial usa Jason e Lucia. Os sobrenomes Jason Duval e Lucia Caminos estão numa matéria da The Verge. Biografia além da sinopse não está nessas páginas."),
      p("A sinopse diz que os dois sempre souberam que o jogo está contra eles, que um golpe fácil dá errado, e que a história corre no lado mais escuro do lugar mais ensolarado dos Estados Unidos, numa conspiração no estado de Leonida. É uma experiência de um jogador. O resto que circula sobre a vida deles não tem, aqui, uma frase para acompanhar."),
      resumo([
        "**Os nomes oficiais são Jason e Lucia.** É assim que a sinopse os chama.",
        "**Duval e Caminos são da The Verge.** A data dessa matéria é 6 de novembro de 2025.",
        "**A sinopse diz o conflito, não a ficha.** Golpe fácil que dá errado, no estado de Leonida.",
        "**Não há voz em português do Brasil.** O anúncio traz inglês com voz e português só em texto.",
      ]),
      h2("Quais nomes estão no texto oficial"),
      p("A [página de Grand Theft Auto VI](https://www.rockstargames.com/VI) apresenta os dois como Jason e Lucia. Não é apelido de fórum nem abreviação. Quando o texto oficial precisa dizer quem vive a história, usa esses nomes. A matéria dos [trailers](/blog/gta-6-trailers-oficiais) não substitui essa frase: vídeo datado não é a sinopse, e cena não entra como fonte de nome neste texto."),
      fig("dupla"),
      p("O jogo é anunciado como experiência de um jogador, na página da PlayStation e no comunicado da Take-Two. Jason e Lucia são as pessoas dessa campanha solo, no que a sinopse conta. Um modo online no dia do lançamento não está nessa resposta. Procurar os dois dentro de um modo que a página não promete é adiantar um anúncio que não existe."),
      h2("De onde saem os sobrenomes"),
      p("Jason Duval e Lucia Caminos aparecem na [The Verge de 6 de novembro de 2025](https://www.theverge.com/news/816005/grand-theft-auto-vi-gta-g-delayed-november-2026). A reportagem é de imprensa, no dia em que a data do jogo mudou para 19 de novembro de 2026. O sobrenome cabe numa citação dessa matéria. Não cabe como se fosse uma linha da sinopse, porque o trecho oficial usado aqui diz Jason e Lucia."),
      fig("origem"),
      h3("Sobrenome de imprensa não é frase da Rockstar"),
      p("As duas informações podem conviver, desde que cada uma leve a fonte. Escrever “Lucia Caminos, como a Rockstar apresentou” atribui à empresa uma frase que, nestas páginas, está na The Verge. Escrever só Lucia, quando a pergunta é o nome oficial, fica fiel ao texto da Rockstar. A escolha depende de qual fonte você está disposto a mostrar."),
      {
        tipo: "tabela",
        titulo: "O que cada fonte põe no nome",
        colunas: ["Dado", "Onde está", "Limite"],
        linhas: [
          ["Jason e Lucia", "Texto oficial", "Nomes da sinopse"],
          ["Jason Duval", "The Verge, 6 nov 2025", "Não é linha da sinopse"],
          ["Lucia Caminos", "The Verge, 6 nov 2025", "Não é linha da sinopse"],
          ["Golpe fácil dá errado", "Sinopse oficial", "Sem idade nem ofício"],
          ["Voz em português", "PlayStation", "Português do Brasil é só texto"],
        ],
        nota: "Sinopse na página da Rockstar. Sobrenomes na The Verge. Idioma na PlayStation.",
      },
      destaque(
        "Como assinar o sobrenome",
        "Jason Duval e Lucia Caminos pedem a The Verge de 6 de novembro de 2025. O texto oficial usado aqui diz Jason e Lucia.",
        "nota",
      ),
      h2("O que a sinopse diz que os dois enfrentam"),
      {
        tipo: "citacao",
        texto:
          "Jason e Lucia sempre souberam que o jogo está contra eles. Um golpe fácil dá errado, no lado mais escuro do lugar mais ensolarado dos Estados Unidos, numa conspiração no estado de Leonida.",
        autor: "Rockstar Games",
        cargo: "sinopse oficial de Grand Theft Auto VI",
        fonte: f("rockstarVI"),
        traduzida: true,
      },
      p("A frase responde o conflito, não a ficha civil. Não há idade, ofício, parentesco nem cidade de origem nesse trecho. “O jogo está contra eles” é a formulação da sinopse, no sentido de que a situação pesa contra os dois. Não é uma lista de sistemas do videogame. O lugar chamado na frase, o estado de Leonida, está destrinchado na matéria do [mapa](/blog/gta-6-mapa-leonida-e-vice-city)."),
      p("A [PlayStation](https://www.playstation.com/en-us/games/grand-theft-auto-vi/) publica a mesma sinopse: os dois, o golpe que dá errado e Leonida. Esse texto não acrescenta família nem emprego. O que a sinopse firma é o nome, o golpe e o estado. Frase que não está nesse texto não deve ser assinada pela Rockstar."),
      h2("O que não dá para afirmar sobre os dois"),
      p("Idioma é outra pergunta, e a resposta não é biografia. No anúncio da PlayStation, inglês tem voz e texto. Português do Brasil tem texto, sem voz. Você pode ler o jogo em português. Não há, nesse anúncio, dublagem em português do Brasil para Jason, Lucia ou qualquer outro personagem. Isso não diz de que país eles são. Diz qual faixa de áudio foi anunciada."),
      p("O que sobra de concreto é pouco, e é o que dá para repetir: dois nomes oficiais, dois sobrenomes numa reportagem, um golpe que dá errado, um estado e uma campanha solo. A série junta o resto em [GTA 6 no blog](/blog/gta-6). Personagem anunciado não publica versão de PC, não publica requisito e não escolhe peça de computador."),
      pros(
        [
          "Jason e Lucia ficam como os nomes do texto oficial, fáceis de checar na página da Rockstar",
          "Duval e Caminos ficam atribuídos à The Verge, com data",
          "A sinopse diz o conflito sem completar idade, ofício ou parentesco",
        ],
        [
          "Não há ficha biográfica nessas páginas",
          "Português do Brasil não traz voz no anúncio",
          "Frase que não está na sinopse não deve ser assinada pela Rockstar",
        ],
      ),
      h2("Se a dúvida saiu do nome e foi para o computador"),
      p("Saber o nome dos dois não muda o aparelho. Quem quiser falar do computador passa na Balão da Informática Anchieta, Av. Anchieta, 789, Cambuí, Campinas, ou chama no WhatsApp (19) 98751-0267. A conversa é o que você joga hoje, não a sinopse."),
      p("A equipe mostra a máquina ligada e separa essa visita da ficha de Jason e Lucia. Nome anunciado não substitui versão de PC, que segue sem data. Você vê o computador funcionar com os jogos que já tem, e a decisão fica nesse uso."),
      fecho(
        "Nome de personagem não é ficha de hardware.",
        "Fale dos jogos e da tela que você já tem. A máquina é mostrada ligada antes de você decidir.",
      ),
    ],
    perguntas: [
      {
        pergunta: "Qual é o nome oficial de Lucia e de Jason?",
        resposta:
          "O texto oficial os chama de Lucia e Jason. Os sobrenomes Lucia Caminos e Jason Duval aparecem na The Verge de 6 de novembro de 2025, e pedem essa fonte quando forem usados.",
      },
      {
        pergunta: "O que a sinopse diz que acontece com os dois?",
        resposta:
          "Diz que sempre souberam que o jogo está contra eles, que um golpe fácil dá errado e que há uma conspiração no estado de Leonida, no lado mais escuro do lugar mais ensolarado dos Estados Unidos.",
      },
      {
        pergunta: "Jason e Lucia falam português?",
        resposta:
          "O anúncio não traz voz em português do Brasil. Inglês tem voz e texto. Português do Brasil fica só no texto. Isso informa a faixa de áudio, não a origem dos personagens.",
      },
      {
        pergunta: "Dá para completar a biografia dos dois com o que foi anunciado?",
        resposta:
          "Não. A sinopse dá os nomes, o golpe que dá errado e o estado de Leonida. Idade, ofício, parentesco e frase que não está nesse texto ficam de fora.",
      },
    ],
  },
  {
    slug: "gta-6-preco-e-edicoes",
    titulo: "Preço de GTA 6: Standard, Ultimate e o que vem junto",
    seoTitulo: "Preço de GTA 6: Standard e Ultimate",
    resumo:
      "A Take-Two anunciou a Standard a 79,99 dólares e a Ultimate a 99,99 dólares. O valor em reais não está nesse comunicado.",
    categoria: "noticias",
    etiquetas: ["GTA 6", "Preço", "Edições"],
    publicadoEm: "2026-11-15T12:00:00.000Z",
    palavrasChave: ["preço gta 6", "gta 6 standard", "gta 6 ultimate", "pré-venda gta 6"],
    fontes: ["takeTwo", "playstation", "rockstarData"],
    imagens: [
      capa(
        "Capa com as duas edições de GTA 6 e a indicação de que o preço anunciado está em dólares",
        "Notícias · preço",
        "Dois preços em dólar",
        "Standard e Ultimate, como no comunicado. Sem valor em reais.",
        "Edições",
        "2 preços",
      ),
      {
        id: "precos",
        papel: "corpo",
        layout: "barras",
        alt: "Barras com o preço anunciado da Standard e da Ultimate de GTA 6, ambas em dólares",
        titulo: "Os dois preços do comunicado, em dólares",
        nota: "Take-Two, 24 jun 2026. Valores em dólares. Reais não estão no texto.",
        legenda: "As barras comparam os preços publicados em dólares. Não há coluna em reais porque o comunicado não traz essa coluna.",
        itens: [
          { nome: "Standard", valor: 7999, rotulo: "79,99 dólares" },
          { nome: "Ultimate", valor: 9999, rotulo: "99,99 dólares" },
        ],
      },
      {
        id: "incluso",
        papel: "corpo",
        layout: "colunas",
        alt: "Colunas separam o que o comunicado de pré-venda de GTA 6 publica e o que ele não informa",
        titulo: "O que o comunicado escreve e o que ele deixa de fora",
        nota: "Comunicado da Take-Two de 24 de junho de 2026.",
        legenda: "Pacote e mês de GTA+ estão ligados à compra, não a uma lista completa do que a Ultimate acrescenta.",
        destaque: 0,
        colunas: [
          {
            titulo: "Está no comunicado",
            itens: ["Standard: 79,99 dólares", "Ultimate: 99,99 dólares", "Pré-venda desde 25 jun", "GTA+ na pré-venda digital", "Pacote antes de 20 nov"],
          },
          {
            titulo: "Não está nele",
            itens: ["Valor em reais", "Miolo do Vice City Pack", "Lista completa da Ultimate", "Requisito de PC"],
          },
        ],
      },
    ],
    blocos: [
      p("Quem procura o preço de GTA 6 encontra número em real e conversão feita em casa. O documento que fixa valor é outro. Em 24 de junho de 2026, a Take-Two anunciou a edição Standard a 79,99 dólares e a Ultimate a 99,99 dólares. O valor em reais não está nesse comunicado, e este texto não inventa a conversão."),
      p("O mesmo texto chama o jogo solo de maior e mais imersiva evolução da série, abre a pré-venda em 25 de junho de 2026 e descreve dois acréscimos de compra: o Vintage Vice City Pack antes de 20 de novembro de 2026, e um mês de GTA+ na pré-venda digital. Não descreve o miolo do pacote nem uma ficha completa do que separa as edições além do preço."),
      resumo([
        "**Standard: 79,99 dólares. Ultimate: 99,99 dólares.** Os dois números são do comunicado da Take-Two.",
        "**Reais não estão no comunicado.** Converter o dólar por conta própria não cria preço oficial.",
        "**Pré-venda desde 25 de junho de 2026.** A digital inclui um mês de GTA+.",
        "**Antes de 20 de novembro entra o pacote.** O nome é Vintage Vice City Pack. O conteúdo não está descrito aqui.",
      ]),
      h2("Qual número está no comunicado"),
      p("A [Take-Two](https://taketwointeractivesoftwareinc.gcs-web.com/news-releases/news-release-details/rockstar-games-announces-pre-orders-grand-theft-auto-vi/) publicou dois preços em dólares para o jogo de console, com lançamento em 19 de novembro de 2026 no PS5 e no Xbox Series X|S. Standard fica em 79,99 dólares. Ultimate fica em 99,99 dólares. Não há terceira edição nesse texto, e não há linha em real ao lado."),
      fig("precos"),
      {
        tipo: "tabela",
        titulo: "Preços e acréscimos no comunicado de junho",
        colunas: ["Item", "O que está escrito"],
        linhas: [
          ["Standard", "79,99 dólares"],
          ["Ultimate", "99,99 dólares"],
          ["Pré-venda", "Desde 25 de junho de 2026"],
          ["Pré-venda digital", "Um mês de GTA+"],
          ["Antes de 20 nov 2026", "Vintage Vice City Pack"],
          ["Valor em reais", "Não está no comunicado"],
        ],
        fonte: f("takeTwo"),
        nota: "Preços em dólares, como no comunicado. Este texto não converte para real.",
      },
      p("No mesmo comunicado, a franquia, e não só GTA V, aparece com mais de 470 milhões de unidades vendidas. O número mede o histórico da marca. Não diz quantas pessoas vão comprar GTA 6 e não muda os 79,99 dólares. Também não produz um valor em reais. Tratar esse total como escassez seria acrescentar uma frase que a Take-Two não escreveu."),
      h2("Por que esse número não vira real"),
      p("O preço anunciado é o preço em dólares. Câmbio e imposto não estão no comunicado, e mudam sem a Rockstar reeditar o texto. Copiar um valor em reais de um anúncio antigo, ou multiplicar 79,99 por um câmbio do dia, fabrica um número que esta matéria não pode assinar. Em dólares, está escrito. Em reais, não está."),
      h3("Dólar no comunicado, real fora dele"),
      p("Quando alguém perguntar “quanto custa em reais”, a frase completa é que o comunicado não diz. A matéria do [lançamento](/blog/gta-6-lancamento-19-novembro-2026) separa a data, que a Rockstar fixou, do que continua em aberto. Preço em reais entra nesse segundo grupo, junto com a versão de PC, que até 19 de novembro de 2026 não tinha sido anunciada."),
      destaque(
        "Não converta o comunicado",
        "79,99 dólares e 99,99 dólares são os preços publicados. Não são valores em reais. Este texto não faz a conta e não publica o resultado.",
        "atencao",
      ),
      h2("O que a data da compra muda"),
      fig("incluso"),
      p("A pré-venda começou em 25 de junho de 2026. Na pré-venda digital, o comunicado inclui um mês de GTA+. Ele não descreve o que a assinatura entrega além desse mês. Compras antes de 20 de novembro de 2026 incluem o Vintage Vice City Pack. O nome do pacote está escrito. O conteúdo, não."),
      p("Esses acréscimos estão ligados à data e ao tipo de compra. O comunicado não diz que valem só para a Ultimate. A diferença explícita entre as edições é o preço: 79,99 dólares e 99,99 dólares. Os nomes da descrição da Ultimate estão na matéria do [mapa](/blog/gta-6-mapa-leonida-e-vice-city). Nome na descrição não é a ficha do dólar a mais."),
      h2("O que as duas edições não esclarecem"),
      p("Falta, nestes trechos, um inventário fechado da Ultimate. Dá para pagar o preço publicado. Não dá para montar, só com este comunicado, a lista de roupa, veículo ou missão que separa as edições. Quem precisar dessa lista tem de ir à página da edição no dia da compra e ler o que estiver escrito ali, não completar com catálogo antigo."),
      p("O comunicado de junho citava pré-carga em 12 de novembro. Em novembro de 2026, a PlayStation e a Rockstar falam em 10 de novembro. Data e espaço estão na matéria de [pré-carga](/blog/gta-6-pre-carga-e-tamanho). Preço e arquivo são decisões diferentes, uma em dólares e a outra em gigabytes. Nenhuma está em reais. A série segue em [GTA 6 no blog](/blog/gta-6)."),
      pros(
        [
          "Os dois preços têm dono e moeda: o comunicado da Take-Two, em dólares",
          "O pacote e o mês de GTA+ ficam ligados à data da compra, como o texto escreve",
          "O valor em reais fica de fora, em vez de uma conversão feita para esta matéria",
        ],
        [
          "Não há, aqui, a lista do que a Ultimate acrescenta além do preço",
          "O conteúdo do Vintage Vice City Pack não está descrito no trecho usado",
          "A pré-carga citada em junho como 12 de novembro foi depois falada como 10 de novembro",
        ],
      ),
      h2("Se o preço do jogo virou conversa de computador"),
      p("O número em dólares fica no comunicado da Take-Two. Na Balão da Informática Anchieta, Av. Anchieta, 789, Cambuí, Campinas, esta conversa não converte esse número e não publica valor de peça. Você vê a máquina ligada e fala dos jogos que já roda."),
      p("A [montagem](/montagempc) parte desse uso. Chame no WhatsApp (19) 98751-0267 e diga o monitor. GTA 6 no computador entra na conta quando existir versão e requisito publicados. Até lá, o preço do jogo de console e a máquina da sua casa são assuntos separados, e só o primeiro tem número oficial, em dólares."),
      fecho(
        "Quer montar para os jogos que você já tem?",
        "Diga o monitor e os jogos de hoje. A equipe monta por esse uso e mostra a máquina ligada.",
      ),
    ],
    perguntas: [
      {
        pergunta: "Quanto custa GTA 6?",
        resposta:
          "No comunicado da Take-Two, de 24 de junho de 2026, a Standard custa 79,99 dólares e a Ultimate custa 99,99 dólares. O valor em reais não está nesse texto.",
      },
      {
        pergunta: "Qual a diferença entre Standard e Ultimate?",
        resposta:
          "A diferença explícita no comunicado é o preço em dólares. O texto não traz, nos trechos usados aqui, um inventário do que a Ultimate acrescenta. Pacote e mês de GTA+ estão ligados à data e à pré-venda, não a uma edição só.",
      },
      {
        pergunta: "O que vem na pré-venda de GTA 6?",
        resposta:
          "A pré-venda começou em 25 de junho de 2026. A pré-venda digital inclui um mês de GTA+. Compras antes de 20 de novembro de 2026 incluem o Vintage Vice City Pack. O comunicado não descreve o conteúdo desse pacote.",
      },
      {
        pergunta: "GTA 6 vai custar quanto em reais?",
        resposta:
          "O comunicado não publica valor em reais. Converter 79,99 dólares por câmbio do dia não cria um preço oficial. O número que dá para citar continua sendo o dólar anunciado.",
      },
    ],
  },
  {
    slug: "gta-6-perguntas-frequentes",
    titulo: "GTA 6: perguntas frequentes com o que já foi anunciado",
    seoTitulo: "GTA 6: perguntas frequentes do que foi anunciado",
    resumo:
      "As dúvidas de GTA 6 abaixo usam só o que já foi anunciado, com o link da matéria. O que ainda não tem página fica marcado como em aberto.",
    categoria: "noticias",
    etiquetas: ["GTA 6", "Dúvidas", "Lançamento"],
    publicadoEm: "2026-11-14T15:00:00.000Z",
    palavrasChave: ["perguntas gta 6", "dúvidas gta 6", "gta 6 vai ter pc", "gta 6 idioma"],
    fontes: ["rockstarVI", "rockstarData", "takeTwo", "playstation", "psSuporte", "xbox", "yahooPc", "polygon", "vergeAtraso", "reuters"],
    imagens: [
      capa(
        "Capa de perguntas frequentes de GTA 6 dividindo o que já foi anunciado e o que segue sem comunicado",
        "Notícias · dúvidas",
        "Anunciado e em aberto",
        "Cada resposta leva à matéria que tem a fonte.",
        "Dúvidas",
        "em aberto",
      ),
      {
        id: "aberto",
        papel: "corpo",
        layout: "colunas",
        alt: "Duas colunas com o que já foi anunciado de GTA 6 e o que ainda não tem comunicado oficial",
        titulo: "Anunciado de um lado, em aberto do outro",
        nota: "Páginas da Rockstar, da PlayStation, da Take-Two e do Xbox Wire.",
        legenda: "A coluna em aberto não é palpite. É pergunta que essas páginas ainda não responderam.",
        destaque: 0,
        colunas: [
          {
            titulo: "Já tem página",
            itens: ["19 nov 2026 no console", "PS5 e Xbox Series", "79,99 e 99,99 dólares", "Pré-carga em 10 nov", "Campanha solo"],
          },
          {
            titulo: "Sem comunicado",
            itens: ["Versão de PC", "Valor em reais", "Requisito de PC", "Mapa completo", "Voz em português"],
          },
        ],
      },
      {
        id: "rota",
        papel: "corpo",
        layout: "fluxo",
        alt: "Fluxo com quatro passos para achar a matéria de data, preço, pré-carga e nomes de GTA 6",
        titulo: "Qual matéria abre cada dúvida",
        nota: "Cada passo é uma matéria desta série, com a fonte daquele tema.",
        legenda: "A tabela desta página resume. O link leva ao texto que cita a página oficial.",
        passos: ["Data e consoles", "Preço em dólares", "Pré-carga e caixa", "Nomes e vídeos"],
      },
    ],
    blocos: [
      p("Quem chega com uma dúvida de GTA 6 quase sempre mistura data antiga, preço convertido e boato de PC. Esta página separa o que já tem comunicado do que ainda não tem, e manda cada tema para a matéria que cita a fonte. Não completa lacuna com fórum. Se a célula diz “em aberto”, a página oficial ainda não escreveu a resposta."),
      p("A data de console é 19 de novembro de 2026, no PS5 e no Xbox Series X|S. O preço anunciado é 79,99 dólares na Standard e 99,99 dólares na Ultimate. A pré-carga falada em novembro de 2026 é 10 de novembro. O PC, o valor em reais e o requisito de computador não estão nesses comunicados. O mapa abaixo é o índice. O parágrafo de cada tema diz o limite."),
      resumo([
        "**Console em 19 de novembro de 2026.** PS5, PS5 Pro e Xbox Series. PC sem anúncio até essa data.",
        "**Preço só em dólares.** 79,99 e 99,99. Reais não estão no comunicado.",
        "**Pré-carga em 10 de novembro.** No PS5, pelo menos 212 GB. A caixa traz código, sem disco.",
        "**O que não tem página continua em aberto.** Mapa completo, voz em português e requisito de PC.",
      ]),
      h2("Data, consoles e o PC"),
      p("A Rockstar fixou o lançamento de console para 19 de novembro de 2026. Antes houve uma janela em 2025 e, depois, 26 de maio de 2026. A Reuters e a The Verge registraram a troca em 6 de novembro de 2025. Quando um guia ainda diz maio, ele descreve uma promessa substituída. O passo a passo está na matéria do [lançamento](/blog/gta-6-lancamento-19-novembro-2026)."),
      p("No dia 19, o jogo está no PS5, no PS5 Pro e no Xbox Series X e S. Não roda no PS4. No Pro, a PlayStation cita PSSR e ray tracing de sombra. No Xbox One há caminho de nuvem, com gráfico de Series S, jogo comprado à parte e disponibilidade que varia por país. O detalhe de cada aparelho está em [plataformas](/blog/gta-6-plataformas-ps5-xbox-e-pc)."),
      fig("aberto"),
      p("PC não foi anunciado até 19 de novembro de 2026. Em 15 de novembro, uma checagem do Just Jared republicada no [Yahoo](https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html) ainda não achou data, pré-venda nem requisito. A página da Rockstar, até essa data, segue sem versão de computador."),
      p("O [Polygon](https://www.polygon.com/gta-6-pc-release-q1-2027-rumor/) relata um boato de PC no começo de 2027, sem confirmação da Rockstar. O histórico citado nessa reportagem é de jogos anteriores: GTA V em console em setembro de 2013 e no PC em abril de 2015, e Red Dead Redemption 2 em console em outubro de 2018 e no PC em novembro de 2019. Precedente, não calendário."),
      h2("Preço, idioma e classificação"),
      p("A Take-Two, em 24 de junho de 2026, anunciou a Standard a 79,99 dólares e a Ultimate a 99,99 dólares. A pré-venda digital inclui um mês de GTA+, e compras antes de 20 de novembro de 2026 incluem o Vintage Vice City Pack. O valor em reais não está no comunicado. Conta, pacote e o que não vem escrito estão na matéria de [preço e edições](/blog/gta-6-preco-e-edicoes)."),
      p("No idioma, a PlayStation anuncia inglês com voz e texto, e português do Brasil só com texto, sem voz. As classificações indicadas nessa página são ESRB M e PEGI 18. Não há, nestes textos, uma classificação brasileira para copiar. O jogo é anunciado como campanha solo. Um modo online no lançamento não está nessa resposta."),
      h2("Pré-carga, tamanho e a caixa"),
      p("A pré-carga que a PlayStation e a Rockstar falam em novembro de 2026 é 10 de novembro, à meia-noite no fuso de quem joga. O comunicado de junho tinha citado 12 de novembro. No espaço, a PlayStation fala em pelo menos 212 GB no PS5. A The Verge fala num arquivo de até 212 GB, conforme o aparelho. São duas frases, não um tamanho único."),
      p("A caixa física traz código, não disco. Comprar a caixa não dispensa o download nem o espaço. O Xbox Wire de 10 de novembro de 2026 descreve versão nativa no Series e nuvem, sem um número de gigabytes neste conjunto de fatos. A conta inteira, com a tabela das fontes, está na matéria de [pré-carga](/blog/gta-6-pre-carga-e-tamanho)."),
      fig("rota"),
      h3("O que a tabela não fecha sozinha"),
      {
        tipo: "tabela",
        titulo: "Anunciado e ainda sem comunicado",
        colunas: ["Tema", "Anunciado", "Sem comunicado"],
        linhas: [
          ["Data de console", "19 de novembro de 2026", "Versão de PC"],
          ["Aparelhos", "PS5, PS5 Pro, Xbox Series", "PS4 não roda"],
          ["Preço", "79,99 e 99,99 dólares", "Valor em reais"],
          ["Idioma", "Inglês com voz; português só texto", "Voz em português"],
          ["Pré-carga", "10 de novembro de 2026", "A cita de junho, 12 de novembro"],
          ["Espaço no PS5", "Pelo menos 212 GB", "Requisito de computador"],
          ["Lugar", "Leonida e nomes na Ultimate", "Mapa completo"],
        ],
        colunaDestaque: 1,
        nota: "Cada linha tem matéria própria nesta série. O espaço “até 212 GB, conforme o aparelho” é frase da The Verge, separada do mínimo da PlayStation.",
      },
      h2("Personagens, lugar e vídeos"),
      p("O texto oficial chama os dois de Jason e Lucia. Os sobrenomes Jason Duval e Lucia Caminos estão na The Verge de 6 de novembro de 2025, não como frase da sinopse. A sinopse fala num golpe fácil que dá errado e numa conspiração no estado de Leonida. Idade e ofício não entram. O texto está em [Lucia e Jason](/blog/gta-6-lucia-e-jason)."),
      p("Os lugares que dá para citar são Leonida, na sinopse, e sete nomes na descrição da Ultimate: Mount Kalaga, Lake Leonida, Washington Beach, Gambit Bay, Watson Bay, Stockyard e Vercetti Estate. Não são um atlas. Vice City aparece no nome do pacote de pré-venda. A matéria do [mapa](/blog/gta-6-mapa-leonida-e-vice-city) mantém cada nome na fonte dele. Os cinco vídeos datados estão em [trailers](/blog/gta-6-trailers-oficiais)."),
      destaque(
        "Comunicado mais novo ganha do antigo",
        "Maio de 2026 deixou de ser a data de lançamento em novembro de 2025. A pré-carga citada como 12 de novembro no comunicado de junho foi depois falada como 10 de novembro. Quando duas datas circulam, fique com a página mais nova.",
        "nota",
      ),
      p("A série inteira, com o que já foi publicado e o que continua em aberto, está em [GTA 6 no blog](/blog/gta-6). Dúvida de peça, enquanto não houver requisito de PC, não se resolve nesta tabela. O guia de [PC para GTA 6](/blog/pc-para-gta-6-sem-requisito-oficial) explica o que dá para decidir sem essa ficha. Esta página não acrescenta número que a Rockstar não tenha escrito."),
      pros(
        [
          "Cada tema aponta para a matéria que carrega a fonte, em vez de repetir o comunicado inteiro",
          "O que não foi anunciado fica na coluna em aberto, sem completar com boato",
          "Data de lançamento e data de pré-carga usam a página mais nova quando houve troca",
        ],
        [
          "Uma página nova da Rockstar pode mudar uma linha depois desta matéria",
          "O relato de PC no começo de 2027 segue sem confirmação",
          "Preço em reais, mapa completo e requisito de computador continuam fora do anúncio",
        ],
      ),
      h2("Se a pergunta que sobrou é sobre o computador"),
      p("Dúvida que a página oficial não responde também não vira palpite de balcão. Na Balão da Informática Anchieta, Av. Anchieta, 789, Cambuí, Campinas, a equipe olha o computador que você já tem e mostra a máquina ligada. GTA 6 sem versão de PC fica fora dessa configuração."),
      p("O WhatsApp é (19) 98751-0267. Para a máquina de agora, o caminho é a página de [PC gamer](/pcgamer). As linhas em aberto desta tabela continuam em aberto até um comunicado novo. Você decide pelo uso de hoje, com o equipamento funcionando na sua frente."),
      fecho(
        "A lista em aberto não vira configuração.",
        "Mande o que você joga hoje. Enquanto não houver versão de PC, a conversa fica nesse uso, com a máquina ligada.",
      ),
    ],
    perguntas: [
      {
        pergunta: "GTA 6 vai ter versão de PC no lançamento?",
        resposta:
          "Até 19 de novembro de 2026, não havia versão de PC anunciada, nem pré-venda, nem requisito. O que está marcado para essa data é o jogo de PS5 e Xbox Series. Relato de início de 2027 não é calendário.",
      },
      {
        pergunta: "Qual é o preço de GTA 6 em reais?",
        resposta:
          "O comunicado da Take-Two não traz valor em reais. Os preços anunciados são 79,99 dólares na Standard e 99,99 dólares na Ultimate. Conversão de câmbio não é preço oficial.",
      },
      {
        pergunta: "GTA 6 tem dublagem em português?",
        resposta:
          "Não na forma anunciada. Inglês tem voz e texto. Português do Brasil tem texto, sem voz. É o que a página da PlayStation informa.",
      },
      {
        pergunta: "Qual é o tamanho da pré-carga de GTA 6?",
        resposta:
          "A PlayStation fala em pelo menos 212 GB no PS5. A The Verge fala em até 212 GB, conforme o aparelho. Não são a mesma frase, e a caixa física traz código, sem disco.",
      },
    ],
  },
  {
    slug: "gta-6-pre-carga-e-tamanho",
    titulo: "Pré-carga de GTA 6: tamanho, data e a caixa sem disco",
    seoTitulo: "Pré-carga de GTA 6: tamanho e a caixa sem disco",
    resumo:
      "A pré-carga de GTA 6 ficou em 10 de novembro de 2026. No PS5 são pelo menos 212 GB, e a caixa física traz código, sem disco.",
    categoria: "noticias",
    etiquetas: ["GTA 6", "Pré-carga", "PS5"],
    publicadoEm: "2026-11-14T12:00:00.000Z",
    palavrasChave: ["pré-carga gta 6", "tamanho gta 6", "gta 6 212 gb", "gta 6 sem disco"],
    fontes: ["playstation", "psSuporte", "takeTwo", "vergeTamanho", "xbox", "rockstarMidia", "rockstarVI"],
    imagens: [
      capa(
        "Capa sobre a pré-carga de GTA 6, o espaço em gigabytes no console e a caixa física sem disco",
        "Notícias · pré-carga",
        "A caixa não tem disco",
        "A data que ficou e o espaço que a caixa não evita.",
        "Arquivo",
        "10 nov",
      ),
      {
        id: "calendario",
        papel: "corpo",
        layout: "timeline",
        alt: "Linha do tempo da pré-carga de GTA 6, do comunicado de junho à data de 10 de novembro de 2026",
        titulo: "Qual frase de pré-carga ficou de pé",
        nota: "Junho: Take-Two citou 12 nov. Novembro: PlayStation e Rockstar falam 10 nov.",
        legenda: "A data que vale é a das páginas de novembro. A de junho explica por que ainda se lê 12 de novembro.",
        itens: [
          { quando: "24 jun 2026", texto: "Comunicado cita 12 nov" },
          { quando: "10 nov 2026", texto: "Páginas falam em pré-carga" },
          { quando: "19 nov 2026", texto: "Lançamento no console" },
        ],
      },
      {
        id: "espaco",
        papel: "corpo",
        layout: "camadas",
        alt: "Camadas separam o mínimo de 212 GB no PS5, o limite da The Verge e a caixa de GTA 6 sem disco",
        titulo: "Cada frase de espaço com a fonte dela",
        nota: "PlayStation: pelo menos 212 GB no PS5. The Verge: até 212 GB, conforme o aparelho.",
        legenda: "As duas linhas usam 212 e não dizem a mesma coisa. A caixa sem disco não apaga nenhuma delas.",
        itens: [
          { nome: "PlayStation", texto: "Pelo menos 212 GB no PS5" },
          { nome: "The Verge", texto: "Até 212 GB, conforme o aparelho" },
          { nome: "Take-Two, junho", texto: "Pré-carga citada para 12 nov 2026" },
          { nome: "Novembro de 2026", texto: "PlayStation e Rockstar: 10 nov" },
          { nome: "Caixa física", texto: "Código na caixa, sem disco" },
        ],
      },
    ],
    blocos: [
      p("Quem vai baixar GTA 6 precisa de duas respostas antes de olhar a caixa: em que dia a pré-carga abre e quanto espaço separar. As duas já foram escritas, e as duas já foram ditas de mais de um jeito. A pré-carga que ficou de pé é 10 de novembro de 2026. O número de gigabytes depende de qual frase você está lendo, e de qual aparelho."),
      p("A caixa física não resolve nenhuma das duas. A PlayStation informa que o físico é um código na caixa, sem disco. O arquivo ainda precisa caber no console. No PS5, o mínimo publicado é de pelo menos 212 GB. A The Verge fala num arquivo de até 212 GB, conforme o aparelho. Não são a mesma medida com duas palavras."),
      resumo([
        "**A pré-carga ficou em 10 de novembro de 2026.** É o que a PlayStation e a Rockstar falam em novembro.",
        "**Junho tinha citado 12 de novembro.** Essa frase é do comunicado da Take-Two daquele mês.",
        "**No PS5, pelo menos 212 GB.** Esse mínimo é da PlayStation, não de todos os aparelhos.",
        "**A caixa não tem disco.** O código não dispensa o download nem o espaço.",
      ]),
      h2("Qual data de pré-carga ficou de pé"),
      p("Em 24 de junho de 2026, o comunicado da Take-Two citou pré-carga para 12 de novembro. Em novembro de 2026, a PlayStation e a Rockstar falam em 10 de novembro. A regra é a mesma da data de lançamento: fica a frase mais nova das páginas oficiais. Se um texto ainda diz 12 de novembro e não cita a atualização, ele descreve o comunicado de junho."),
      fig("calendario"),
      p("Na PlayStation, a pré-carga de 10 de novembro de 2026 começa à meia-noite no fuso de quem joga. Não vira um horário único de Brasília para todas as contas. O dia é que não muda. O vídeo Pre-Load Now, na página de mídia, também é de 10 de novembro de 2026. O nome e a data batem. A cena não entra aqui."),
      h3("Meia-noite local não é o relógio do dia 19"),
      p("O dia 19 de novembro de 2026 é o lançamento, não a abertura da pré-carga. No [Xbox Wire de 10 de novembro de 2026](https://news.xbox.com/en-us/2026/11/10/grand-theft-auto-6-comes-to-xbox-cloud-gaming-november-19/), a nuvem é citada a partir da 1h da manhã, horário do Leste dos Estados Unidos, nesse dia 19. São relógios diferentes. Pré-carga é o arquivo antes. Esse horário do Wire é o da nuvem no dia do lançamento."),
      h2("Como ler os dois números de 212 GB"),
      p("A [PlayStation](https://www.playstation.com/en-us/games/grand-theft-auto-vi/) fala em pelo menos 212 GB no PS5. “Pelo menos” é mínimo: o console precisa ter esse espaço livre, e a frase não diz que todo aparelho para nesse número. O [suporte](https://www.playstation.com/en-us/support/games/gta-vi-support/) é a outra página da marca usada para essa ficha. Não há, nesse par, um segundo mínimo publicado para o PS5 Pro."),
      fig("espaco"),
      p("A [The Verge](https://www.theverge.com/games/1025271/gta-vi-storage-space-rockstar-games) escreve outra frase: um arquivo de pré-carga de até 212 GB, conforme o aparelho. “Até” é teto informado por essa reportagem, e “conforme o aparelho” avisa que o arquivo muda. Somar as duas falas num único “o jogo tem 212 GB” apaga a diferença. Dá para citar as duas. Não dá para fundir."),
      {
        tipo: "tabela",
        titulo: "Espaço e data, cada um com a fonte",
        colunas: ["Fonte", "O que diz do espaço", "O que diz da pré-carga"],
        linhas: [
          ["PlayStation", "Pelo menos 212 GB no PS5", "10 nov 2026, meia-noite local"],
          ["The Verge", "Até 212 GB, conforme o aparelho", "Frase usada aqui é a do tamanho"],
          ["Take-Two, junho", "Sem gigabytes no trecho usado", "Citou 12 nov 2026"],
          ["Rockstar, nov 2026", "Sem gigabytes neste trecho", "Fala em 10 nov 2026"],
          ["Caixa física", "Código, sem disco", "O download continua"],
        ],
        nota: "O mínimo da PlayStation e o teto da The Verge não foram unidos num tamanho só.",
      },
      destaque(
        "Não una os dois 212",
        "Pelo menos 212 GB é o que a PlayStation informa para o PS5. Até 212 GB, conforme o aparelho, é a frase da The Verge. As duas ficam separadas.",
        "atencao",
      ),
      h2("O que a caixa física contém"),
      p("A PlayStation diz que a edição física é um código na caixa, sem disco. Você leva a caixa para casa e ainda precisa baixar o jogo. O espaço do PS5 continua valendo: pelo menos 212 GB, na frase dessa marca. Escolher o físico para “não depender de download” contraria o que a página escreveu. A caixa organiza a compra. O arquivo ocupa o console."),
      p("Isso não informa o tamanho no Xbox. O Xbox Wire descreve o jogo nativo no Series X e no Series S, e também a nuvem no Xbox One e nos Series, com gráfico de Series S quando o caminho é a nuvem. O jogo da nuvem é comprado à parte, e a disponibilidade varia por país. Gigabytes não estão nesse texto. Aparelho por aparelho está em [plataformas](/blog/gta-6-plataformas-ps5-xbox-e-pc)."),
      h2("O que isso não diz sobre o computador"),
      p("Não há versão de PC anunciada até 19 de novembro de 2026, então não há pré-carga de PC nem tamanho de arquivo de PC. Os 212 GB falam de console e do arquivo conforme o aparelho, na The Verge. Não são requisito de placa, memória ou processador. Levar o número do PS5 para a peça do computador converte frase de console em ficha que ninguém publicou."),
      p("O preço da edição, em dólares, está noutra matéria, a de [preço](/blog/gta-6-preco-e-edicoes). Os vídeos, inclusive o Pre-Load Now, estão em [trailers](/blog/gta-6-trailers-oficiais). Dúvidas vizinhas estão nas [perguntas frequentes](/blog/gta-6-perguntas-frequentes). A série junta os temas em [GTA 6 no blog](/blog/gta-6). Espaço de pré-carga responde o console. Não responde a máquina que você vai montar."),
      pros(
        [
          "A data de 10 de novembro fica no lugar da cita de 12 de novembro, com a página mais nova",
          "Os dois usos de 212 GB continuam com fonte e frase diferentes",
          "A caixa sem disco evita a expectativa de jogar sem baixar o arquivo",
        ],
        [
          "Não há um tamanho único publicado para todos os aparelhos",
          "O Xbox Wire não informa gigabytes",
          "Não existe pré-carga de PC anunciada para citar",
        ],
      ),
      h2("Se o espaço do console virou compra de armazenamento"),
      p("Separar espaço no PS5 é conta de console. Na Balão da Informática Anchieta, Av. Anchieta, 789, Cambuí, Campinas, você vê a máquina ligada e diz quanto espaço já usa nos jogos de hoje. O número do PS5 não é copiado para uma peça de computador."),
      p("Chame no WhatsApp (19) 98751-0267 ou veja os [PCs gamer](/pcgamer). A caixa sem disco explica a edição física do console. Não escolhe armazenamento, placa nem memória para uma versão de PC que a Rockstar não anunciou. A decisão de hoje é o computador dos jogos que você já roda."),
      fecho(
        "Os gigabytes do console não são ficha de PC.",
        "Se a pergunta é o computador, diga os jogos e o espaço que você já usa. A equipe mostra a máquina ligada.",
      ),
    ],
    perguntas: [
      {
        pergunta: "Quando começa a pré-carga de GTA 6?",
        resposta:
          "Em novembro de 2026, a PlayStation e a Rockstar falam em 10 de novembro, à meia-noite no fuso local na PlayStation. O comunicado da Take-Two, em junho, tinha citado 12 de novembro. Fica a data mais nova.",
      },
      {
        pergunta: "GTA 6 ocupa quantos GB?",
        resposta:
          "A PlayStation informa pelo menos 212 GB no PS5. A The Verge informa um arquivo de até 212 GB, conforme o aparelho. Não dê aos dois a mesma frase, e não use nenhum deles como requisito de PC.",
      },
      {
        pergunta: "A mídia física de GTA 6 vem com disco?",
        resposta:
          "Não, no que a PlayStation publicou. A caixa traz um código, sem disco. O jogo ainda é baixado, e o espaço no PS5 continua necessário.",
      },
      {
        pergunta: "A pré-carga de 12 de novembro ainda vale?",
        resposta:
          "Essa data está no comunicado de 24 de junho de 2026. As páginas da PlayStation e da Rockstar, em novembro de 2026, falam em 10 de novembro. O texto de junho explica a confusão. Não é o plano atual.",
      },
    ],
  },
];
