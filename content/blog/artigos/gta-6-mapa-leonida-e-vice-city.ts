import type { Artigo, Fonte } from "@/lib/blog/tipos";

const ROCKSTARVI: Fonte = {
  nome: "Rockstar Games — página oficial de Grand Theft Auto VI",
  url: "https://www.rockstargames.com/VI",
  data: "consulta em 19 de novembro de 2026",
};

const PLAYSTATION: Fonte = {
  nome: "PlayStation — página de Grand Theft Auto VI",
  url: "https://www.playstation.com/en-us/games/grand-theft-auto-vi/",
  data: "consulta em 19 de novembro de 2026",
};

const TAKETWO: Fonte = {
  nome: "Take-Two Interactive — comunicado de pré-venda de Grand Theft Auto VI",
  url: "https://taketwointeractivesoftwareinc.gcs-web.com/news-releases/news-release-details/rockstar-games-announces-pre-orders-grand-theft-auto-vi/",
  data: "24 de junho de 2026",
};

const artigo: Artigo = {
  slug: "gta-6-mapa-leonida-e-vice-city",
  titulo: "Mapa de GTA 6: Leonida, Vice City e o que foi mostrado",
  resumo: "A sinopse de GTA 6 situa a história no estado de Leonida. Vice City está no nome do pacote, e os outros lugares não formam um mapa.",
  categoria: "noticias",
  etiquetas: [
    "GTA 6",
    "Mapa",
    "Leonida",
    "Vice City",
  ],
  capa: {
    src: "/blog/capas/gta-6-mapa-leonida-e-vice-city.webp",
    alt: "Capa com o nome Leonida e o aviso de que os lugares citados de GTA 6 não formam um mapa completo",
    largura: 1536,
    altura: 1024,
    pronta: true,
  },
  publicadoEm: "2026-11-16T12:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "Mapa de GTA 6: Leonida e Vice City",
    palavrasChave: [
      "mapa gta 6",
      "leonida gta 6",
      "vice city gta 6",
      "mapa de gta 6",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "Quem busca o mapa de GTA 6 espera bairro, distância e o desenho de Vice City. O que saiu com nome de lugar é mais curto que um atlas. Dá para repetir a frase da sinopse, o nome de um pacote e sete nomes de uma descrição de edição. Não dá para traçar caminho com isso.",
    },
    {
      tipo: "paragrafo",
      texto: "A sinopse oficial situa a conspiração no estado de Leonida e fala no lado mais escuro do lugar mais ensolarado dos Estados Unidos. Vice City, nos textos usados aqui, aparece no nome Vintage Vice City Pack. Os sete outros nomes estão na descrição da Ultimate Edition na PlayStation. A lista não se apresenta como mapa completo.",
    },
    {
      tipo: "resumo",
      itens: [
        "**Leonida é o estado da sinopse.** A frase fala em conspiração nesse estado, não em quilômetros.",
        "**Vice City está no nome do pacote.** Vintage Vice City Pack não é um mapa da cidade.",
        "**Sete nomes vêm da descrição da Ultimate.** São nomes da edição, não um atlas.",
        "**Distância e mapa completo não saíram.** Citar o nome não mede a viagem.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que a sinopse fixa sobre o lugar",
    },
    {
      tipo: "paragrafo",
      texto: "A [página oficial](https://www.rockstargames.com/VI) descreve Jason e Lucia no lado mais escuro do lugar mais ensolarado dos Estados Unidos, numa conspiração no estado de Leonida. Essa é a frase de cenário. Ela não lista cidade, não mede o estado e não desenha estrada. O que os dois fazem nessa história está na matéria de [Lucia e Jason](/blog/gta-6-lucia-e-jason), junto com a sinopse completa.",
    },
    {
      tipo: "paragrafo",
      texto: "“Lugar mais ensolarado dos Estados Unidos” é imagem da sinopse, não coordenada. Não transforma Leonida num mapa que dê para imprimir, e não autoriza completar a geografia com o que um leitor espera de jogos anteriores. O que está escrito é o estado e essa frase. O que não está escrito continua fora.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Quais nomes aparecem na descrição da Ultimate",
    },
    {
      tipo: "paragrafo",
      texto: "A descrição da Ultimate Edition na [PlayStation](https://www.playstation.com/en-us/games/grand-theft-auto-vi/) cita sete nomes: Mount Kalaga, Lake Leonida, Washington Beach, Gambit Bay, Watson Bay, Stockyard e Vercetti Estate. São nomes dessa descrição. Não são apresentados como a lista inteira de lugares, nem como bônus com endereço, nem como rota.",
    },
    {
      tipo: "tabela",
      titulo: "Nomes na descrição da Ultimate Edition",
      colunas: [
        "Nome",
        "Onde está escrito",
      ],
      linhas: [
        [
          "Mount Kalaga",
          "Descrição da Ultimate na PlayStation",
        ],
        [
          "Lake Leonida",
          "Descrição da Ultimate na PlayStation",
        ],
        [
          "Washington Beach",
          "Descrição da Ultimate na PlayStation",
        ],
        [
          "Gambit Bay",
          "Descrição da Ultimate na PlayStation",
        ],
        [
          "Watson Bay",
          "Descrição da Ultimate na PlayStation",
        ],
        [
          "Stockyard",
          "Descrição da Ultimate na PlayStation",
        ],
        [
          "Vercetti Estate",
          "Descrição da Ultimate na PlayStation",
        ],
      ],
      fonte: PLAYSTATION,
      nota: "Nomes da descrição da edição. Não formam um mapa completo nem um atlas.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-6-mapa-leonida-e-vice-city-nomes.webp",
        alt: "Cartões com Leonida na sinopse, Vice City no pacote e os nomes da descrição da Ultimate de GTA 6",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Cada cartão é uma fonte diferente. Juntar os quatro num atlas é um passo que nenhuma delas deu.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Nome na descrição não é rota",
    },
    {
      tipo: "paragrafo",
      texto: "Dá para dizer que Mount Kalaga e Watson Bay aparecem nessa descrição. Não dá para dizer quanto tempo a viagem leva, o que existe no meio ou se os dois ficam no mesmo condado. A tabela esgota o que essa página lista. Qualquer mapa desenhado em cima dela é ilustração de fã, não comunicado.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Por que essa lista não é o mapa",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-6-mapa-leonida-e-vice-city-leitura.webp",
        alt: "Duas colunas separam os nomes que já foram publicados sobre o lugar de GTA 6 e o que não é um mapa",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "A coluna da esquerda é nome publicado. A da direita é pergunta que essas páginas não respondem.",
    },
    {
      tipo: "paragrafo",
      texto: "Um mapa responde vizinhança, escala e o que ficou de fora. Essa lista não responde nenhuma das três. São sete nomes, numa descrição de edição, mais o estado na sinopse. Tratar isso como o território inteiro de GTA 6 é concluir o que a página não concluiu. Se sair um mapa oficial depois, a lista pode crescer. Até lá, o honesto é citar a fonte e parar.",
    },
    {
      tipo: "destaque",
      tom: "atencao",
      titulo: "Sete nomes não fecham Leonida",
      texto: "Dá para repetir Mount Kalaga, Lake Leonida, Washington Beach, Gambit Bay, Watson Bay, Stockyard e Vercetti Estate com a descrição da Ultimate. Não dá para medir a viagem entre eles.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Onde Vice City aparece no anúncio",
    },
    {
      tipo: "paragrafo",
      texto: "No [comunicado da Take-Two](https://taketwointeractivesoftwareinc.gcs-web.com/news-releases/news-release-details/rockstar-games-announces-pre-orders-grand-theft-auto-vi/), de 24 de junho de 2026, compras feitas antes de 20 de novembro de 2026 incluem o Vintage Vice City Pack. Vice City, aqui, é parte do nome desse pacote. O comunicado não descreve o conteúdo do pacote e não desenha a cidade. Preço e prazo dessa compra estão na matéria de [preço e edições](/blog/gta-6-preco-e-edicoes).",
    },
    {
      tipo: "paragrafo",
      texto: "Os [trailers oficiais](/blog/gta-6-trailers-oficiais) também não servem, neste texto, como fonte de geografia. A página de mídia dá nome e data de vídeo, não uma legenda de cada plano. Quem quer o que foi mostrado com fonte fica com Leonida, com a frase do lugar ensolarado, com o pacote e com os sete nomes. A série está em [GTA 6 no blog](/blog/gta-6).",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-6-mapa-leonida-e-vice-city-fecho.webp",
        alt: "Quatro leituras do mapa de GTA 6: sinopse oficial, nome na edição, não é atlas e sem escala inventada",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Leonida e Vice City estão na sinopse. Nomes da Ultimate Edition não fecham um mapa.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "Cada nome fica com a página que o publicou, e a sinopse não é obrigada a funcionar como atlas",
        "Vice City permanece no nome do pacote, em vez de virar mapa da cidade sem texto que diga isso",
        "A descrição da Ultimate deixa de ser lida como a lista inteira de lugares",
      ],
      contras: [
        "Não dá para planejar caminho entre Mount Kalaga e Watson Bay com o que foi publicado",
        "Um mapa oficial posterior pode ampliar essa lista",
        "Cena de trailer não entra como fonte de lugar neste texto",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Se o nome do lugar virou desculpa para trocar de PC",
    },
    {
      tipo: "paragrafo",
      texto: "Um nome de lugar não escolhe processador nem tela. Na Balão da Informática Anchieta, Av. Anchieta, 789, no Cambuí, em Campinas, a conversa começa pelo computador que você usa agora. A equipe liga a máquina para você ver. Leonida não entra como ficha de peça.",
    },
    {
      tipo: "paragrafo",
      texto: "O WhatsApp (19) 98751-0267 recebe o que você já joga. Os nomes desta matéria ficam na sinopse e na descrição da edição. Se houver compra de computador, ela é pelos jogos de hoje, com a máquina ligada na sua frente, não por um atlas que a Rockstar ainda não publicou.",
    },
    {
      tipo: "chamada",
      titulo: "O lugar publicado não escolhe o computador.",
      texto: "Conte o que você roda agora. A máquina é montada para esse uso, e você a vê ligada.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "GTA 6 se passa em Vice City?",
      resposta: "Nos textos usados aqui, Vice City aparece no nome Vintage Vice City Pack, do comunicado da Take-Two. A sinopse oficial nomeia o estado de Leonida. Um mapa da cidade não foi publicado nessas páginas.",
    },
    {
      pergunta: "O que é Leonida em GTA 6?",
      resposta: "É o estado citado na sinopse oficial, onde a história envolve uma conspiração. A mesma frase fala no lado mais escuro do lugar mais ensolarado dos Estados Unidos. Não há medida nem mapa desse estado nessas páginas.",
    },
    {
      pergunta: "A lista da Ultimate Edition é o mapa inteiro?",
      resposta: "Não. Mount Kalaga, Lake Leonida, Washington Beach, Gambit Bay, Watson Bay, Stockyard e Vercetti Estate são nomes da descrição da edição na PlayStation. A própria lista não é apresentada como atlas completo.",
    },
    {
      pergunta: "Dá para saber a distância entre esses lugares?",
      resposta: "Não com o que foi publicado. As páginas citam os nomes e não informam vizinhança, escala nem tempo de viagem. Tratar a lista como rota é um acréscimo que a fonte não faz.",
    },
  ],
  fontes: [
    ROCKSTARVI,
    PLAYSTATION,
    TAKETWO,
  ],
};

export default artigo;
