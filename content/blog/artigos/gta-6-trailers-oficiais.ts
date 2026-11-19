import type { Artigo, Fonte } from "@/lib/blog/tipos";

const ROCKSTARMIDIA: Fonte = {
  nome: "Rockstar Games — mídia oficial de Grand Theft Auto VI",
  url: "https://www.rockstargames.com/VI/launch-trailer",
  data: "consulta em 19 de novembro de 2026",
};

const PLAYSTATION: Fonte = {
  nome: "PlayStation — página de Grand Theft Auto VI",
  url: "https://www.playstation.com/en-us/games/grand-theft-auto-vi/",
  data: "consulta em 19 de novembro de 2026",
};

const ROCKSTARVI: Fonte = {
  nome: "Rockstar Games — página oficial de Grand Theft Auto VI",
  url: "https://www.rockstargames.com/VI",
  data: "consulta em 19 de novembro de 2026",
};

const artigo: Artigo = {
  slug: "gta-6-trailers-oficiais",
  titulo: "Trailers de GTA 6: o que cada vídeo oficial mostrou",
  resumo: "A página de mídia da Rockstar lista cinco vídeos oficiais de GTA 6, com data. Este texto não narra cenas: registra o que cada página confirma.",
  categoria: "noticias",
  etiquetas: [
    "GTA 6",
    "Trailers",
    "Rockstar",
  ],
  capa: {
    src: "/blog/capas/gta-6-trailers-oficiais.webp",
    alt: "Capa escura com cinco datas e o título sobre os vídeos oficiais de GTA 6 na página de mídia",
    largura: 1536,
    altura: 1024,
    pronta: true,
  },
  publicadoEm: "2026-11-16T15:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "Trailers de GTA 6: o que a Rockstar mostrou",
    palavrasChave: [
      "trailers de gta 6",
      "trailer gta 6",
      "extended look gta 6",
      "pre-load now gta 6",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "Quem procura os trailers de GTA 6 encontra cortes, reposts e vídeos sem data misturados ao resultado. A lista datada está na página de mídia da Rockstar. São cinco vídeos: Trailer 1, Trailer 2, An Extended Look, Launch Trailer e Pre-Load Now. Cada um entra aqui pelo nome e pela data que essa página publica.",
    },
    {
      tipo: "paragrafo",
      texto: "A página não descreve cenas, e este texto também não descreve. Completar um plano com memória de quem assistiu seria tratar suposição como anúncio. O dado extra, e só para um dos cinco, vem de outra página oficial: a PlayStation diz que An Extended Look é captura in-game no PS5. O dia do jogo não é a data de nenhum trailer.",
    },
    {
      tipo: "resumo",
      itens: [
        "**São cinco vídeos com data.** A lista é a página de mídia da Rockstar, não um corte solto.",
        "**An Extended Look tem um complemento.** A PlayStation informa captura in-game no PS5.",
        "**A data do vídeo não é a do jogo.** O lançamento de console segue 19 de novembro de 2026.",
        "**Cena, preço em reais e PC ficam de fora.** Essas páginas não publicam isso.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Qual vídeo corresponde a qual data",
    },
    {
      tipo: "paragrafo",
      texto: "A ordem que importa é a cronológica, porque a busca costuma embaralhar os anos. O Trailer 1 é de 4 de dezembro de 2023. O Trailer 2 é de 6 de maio de 2025. An Extended Look é de 27 de agosto de 2026. O Launch Trailer é de 15 de outubro de 2026. O Pre-Load Now é de 10 de novembro de 2026.",
    },
    {
      tipo: "tabela",
      titulo: "Vídeos na página de mídia de GTA 6",
      colunas: [
        "Vídeo",
        "Data",
        "O que dá para afirmar",
      ],
      linhas: [
        [
          "Trailer 1",
          "4 dez 2023",
          "Está na página, com essa data",
        ],
        [
          "Trailer 2",
          "6 mai 2025",
          "Está na página, com essa data",
        ],
        [
          "An Extended Look",
          "27 ago 2026",
          "PlayStation: captura in-game no PS5",
        ],
        [
          "Launch Trailer",
          "15 out 2026",
          "Está na página, com essa data",
        ],
        [
          "Pre-Load Now",
          "10 nov 2026",
          "Vídeo com esse nome na mesma página",
        ],
      ],
      fonte: ROCKSTARMIDIA,
      nota: "A linha do Extended Look também usa a página da PlayStation. Nenhuma linha descreve cena.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-6-trailers-oficiais-videos.webp",
        alt: "Linha do tempo com os cinco vídeos oficiais de GTA 6, de dezembro de 2023 a novembro de 2026",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "A ordem é a das datas. Um repost sem data não substitui um vídeo desta lista.",
    },
    {
      tipo: "paragrafo",
      texto: "O Trailer 1 é o mais antigo dessa lista, e o Pre-Load Now é o mais novo. O intervalo entre eles é o tempo em que a Rockstar foi publicando material, não um roteiro para reconstruir de cabeça. Se o vídeo que você viu não tem uma dessas cinco datas na página de mídia, ele não entra no lugar de um deles.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que a PlayStation acrescenta a um deles",
    },
    {
      tipo: "paragrafo",
      texto: "An Extended Look, de 27 de agosto de 2026, é o único com uma frase a mais. A [página da PlayStation](https://www.playstation.com/en-us/games/grand-theft-auto-vi/) diz que esse vídeo é captura in-game no PS5. A frase vale para esse vídeo. Não autoriza escrever a mesma coisa no Trailer 1, no Trailer 2, no Launch Trailer ou no Pre-Load Now, porque essas linhas não trazem o mesmo rótulo.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Captura no PS5 não é configuração de computador",
    },
    {
      tipo: "paragrafo",
      texto: "Captura in-game no PS5 significa, no texto da PlayStation, que a imagem saiu daquele console. Não publica resolução-alvo, não lista peça e não abre versão de PC. Até 19 de novembro de 2026 a página do jogo segue em PlayStation 5 e Xbox Series X|S. Quem procura requisito de computador não acha esse número num trailer.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que nenhum desses vídeos anuncia",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-6-trailers-oficiais-limites.webp",
        alt: "Duas colunas separam o que a página de mídia confirma e o que um trailer de GTA 6 não anuncia",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Captura in-game vale para o Extended Look, porque a PlayStation escreveu isso. Não vale para os outros por tabela.",
    },
    {
      tipo: "paragrafo",
      texto: "O preço em dólares está no comunicado da Take-Two, não numa leitura de trailer. O valor em reais não está nesse comunicado. Assistir de novo ao vídeo não faz esse número aparecer. A página de mídia entrega nome e data. Moeda e valor ficam no texto da Take-Two.",
    },
    {
      tipo: "paragrafo",
      texto: "Jason e Lucia estão no texto oficial, e o que se sabe dos dois está na matéria de [Lucia e Jason](/blog/gta-6-lucia-e-jason). Trailer datado não substitui a sinopse. Misturar as duas fontes é o jeito mais rápido de atribuir uma frase a quem não a escreveu.",
    },
    {
      tipo: "paragrafo",
      texto: "A data de lançamento tampouco muda porque um trailer saiu em outubro. O Launch Trailer é de 15 de outubro de 2026. O dia marcado para os consoles continua 19 de novembro de 2026, como está na matéria do [lançamento](/blog/gta-6-lancamento-19-novembro-2026). Data de publicação do vídeo e data de ligar o jogo são perguntas diferentes.",
    },
    {
      tipo: "destaque",
      tom: "atencao",
      titulo: "Fora da lista não entra no lugar",
      texto: "Corte, reação e repost sem data na página de mídia não substituem o Trailer 1, o Trailer 2, o An Extended Look, o Launch Trailer nem o Pre-Load Now.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Qual vídeo abrir conforme a pergunta",
    },
    {
      tipo: "paragrafo",
      texto: "Se a pergunta é a pré-carga, o vídeo da lista é o Pre-Load Now, de 10 de novembro de 2026. O nome e a data batem com o dia em que a PlayStation e a Rockstar, em novembro de 2026, falam em pré-carga. O que esse arquivo ocupa, e por que a caixa física não evita o download, está na matéria de [pré-carga](/blog/gta-6-pre-carga-e-tamanho). O vídeo, sozinho, não informa gigabytes.",
    },
    {
      tipo: "paragrafo",
      texto: "Se a pergunta é quem são as pessoas da sinopse, o caminho é o texto oficial, não uma narração de cena. A [página do jogo](https://www.rockstargames.com/VI) e a [página de mídia](https://www.rockstargames.com/VI/launch-trailer) servem a coisas diferentes: uma apresenta o jogo, a outra reúne os vídeos. A série inteira está em [GTA 6 no blog](/blog/gta-6). Trailer responde qual vídeo existe. Não responde mapa, edição nem peça.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-6-trailers-oficiais-fecho.webp",
        alt: "Quatro tipos de vídeo oficial de GTA 6: trailer, olhar estendido, trailer de lançamento e aviso de pré-carga",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "A página de mídia data os vídeos. Só o Extended Look tem, na PlayStation, a frase de captura in-game.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "Cada vídeo fica com a data da página de mídia, e o repost deixa de competir com ela",
        "A captura in-game fica restrita ao Extended Look, que é o vídeo sobre o qual a PlayStation escreveu isso",
        "A data de lançamento permanece no comunicado, separada do dia em que o trailer foi ao ar",
      ],
      contras: [
        "Quem busca um roteiro de cenas não encontra isso nestas páginas",
        "Um vídeo novo pode entrar na página de mídia depois desta matéria",
        "Nome e data não trazem preço em reais, mapa completo nem requisito de PC",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Se o vídeo virou vontade de trocar de computador",
    },
    {
      tipo: "paragrafo",
      texto: "Na Balão da Informática Anchieta, um trailer não vira lista de peças. O endereço é Av. Anchieta, 789, Cambuí, Campinas. Você conta quais jogos já roda e em qual monitor, e vê a máquina ligada. O WhatsApp é (19) 98751-0267. A conversa cabe no que o computador faz hoje.",
    },
    {
      tipo: "paragrafo",
      texto: "A [montagem](/montagempc) segue esse uso. GTA 6 no computador continua sem versão anunciada, então não há ficha para copiar de um vídeo. Os cinco trailers explicam a mídia oficial. A máquina, se você for montar agora, é a dos jogos que você já tem, mostrada ligada antes de decidir.",
    },
    {
      tipo: "chamada",
      titulo: "O vídeo não diz qual peça comprar.",
      texto: "Diga os jogos de hoje e o monitor. A equipe indica a máquina por esse uso e mostra ela ligada.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "Quantos trailers oficiais de GTA 6 a Rockstar publicou?",
      resposta: "A página de mídia reúne cinco vídeos datados: Trailer 1 em 4 de dezembro de 2023, Trailer 2 em 6 de maio de 2025, An Extended Look em 27 de agosto de 2026, Launch Trailer em 15 de outubro de 2026 e Pre-Load Now em 10 de novembro de 2026.",
    },
    {
      pergunta: "An Extended Look é imagem do jogo rodando?",
      resposta: "A PlayStation diz que An Extended Look é captura in-game no PS5. Essa frase é sobre esse vídeo. Os outros quatro não recebem o mesmo rótulo nas páginas usadas aqui.",
    },
    {
      pergunta: "O trailer mostra o preço de GTA 6?",
      resposta: "O preço anunciado está no comunicado da Take-Two, em dólares, não numa descrição de cena. O valor em reais não aparece nesse comunicado, e os vídeos da página de mídia não substituem essa fonte.",
    },
    {
      pergunta: "O Pre-Load Now muda o dia do lançamento?",
      resposta: "Não. O vídeo é de 10 de novembro de 2026 e acompanha a pré-carga falada para essa data. O lançamento de console marcado pela Rockstar continua 19 de novembro de 2026.",
    },
  ],
  fontes: [
    ROCKSTARMIDIA,
    PLAYSTATION,
    ROCKSTARVI,
  ],
};

export default artigo;
