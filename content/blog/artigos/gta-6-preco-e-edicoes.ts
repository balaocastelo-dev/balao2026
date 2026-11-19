import type { Artigo, Fonte } from "@/lib/blog/tipos";

const TAKETWO: Fonte = {
  nome: "Take-Two Interactive — comunicado de pré-venda de Grand Theft Auto VI",
  url: "https://taketwointeractivesoftwareinc.gcs-web.com/news-releases/news-release-details/rockstar-games-announces-pre-orders-grand-theft-auto-vi/",
  data: "24 de junho de 2026",
};

const PLAYSTATION: Fonte = {
  nome: "PlayStation — página de Grand Theft Auto VI",
  url: "https://www.playstation.com/en-us/games/grand-theft-auto-vi/",
  data: "consulta em 19 de novembro de 2026",
};

const ROCKSTARDATA: Fonte = {
  nome: "Rockstar Games — “Grand Theft Auto VI is Now Set to Launch November 19, 2026”",
  url: "https://www.rockstargames.com/newswire/article/ak3ak31a49a221/grand-theft-auto-vi-is-now-set-to-launch-november-19-2026",
  data: "6 de novembro de 2025",
};

const artigo: Artigo = {
  slug: "gta-6-preco-e-edicoes",
  titulo: "Preço de GTA 6: Standard, Ultimate e o que vem junto",
  resumo: "A Take-Two anunciou a Standard a 79,99 dólares e a Ultimate a 99,99 dólares. O valor em reais não está nesse comunicado.",
  categoria: "noticias",
  etiquetas: [
    "GTA 6",
    "Preço",
    "Edições",
  ],
  capa: {
    src: "/blog/capas/gta-6-preco-e-edicoes.webp",
    alt: "Capa com as duas edições de GTA 6 e a indicação de que o preço anunciado está em dólares",
    largura: 1536,
    altura: 1024,
    pronta: true,
  },
  publicadoEm: "2026-11-15T12:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "Preço de GTA 6: Standard e Ultimate",
    palavrasChave: [
      "preço gta 6",
      "gta 6 standard",
      "gta 6 ultimate",
      "pré-venda gta 6",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "Quem procura o preço de GTA 6 encontra número em real e conversão feita em casa. O documento que fixa valor é outro. Em 24 de junho de 2026, a Take-Two anunciou a edição Standard a 79,99 dólares e a Ultimate a 99,99 dólares. O valor em reais não está nesse comunicado, e este texto não inventa a conversão.",
    },
    {
      tipo: "paragrafo",
      texto: "O mesmo texto chama o jogo solo de maior e mais imersiva evolução da série, abre a pré-venda em 25 de junho de 2026 e descreve dois acréscimos de compra: o Vintage Vice City Pack antes de 20 de novembro de 2026, e um mês de GTA+ na pré-venda digital. Não descreve o miolo do pacote nem uma ficha completa do que separa as edições além do preço.",
    },
    {
      tipo: "resumo",
      itens: [
        "**Standard: 79,99 dólares. Ultimate: 99,99 dólares.** Os dois números são do comunicado da Take-Two.",
        "**Reais não estão no comunicado.** Converter o dólar por conta própria não cria preço oficial.",
        "**Pré-venda desde 25 de junho de 2026.** A digital inclui um mês de GTA+.",
        "**Antes de 20 de novembro entra o pacote.** O nome é Vintage Vice City Pack. O conteúdo não está descrito aqui.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Qual número está no comunicado",
    },
    {
      tipo: "paragrafo",
      texto: "A [Take-Two](https://taketwointeractivesoftwareinc.gcs-web.com/news-releases/news-release-details/rockstar-games-announces-pre-orders-grand-theft-auto-vi/) publicou dois preços em dólares para o jogo de console, com lançamento em 19 de novembro de 2026 no PS5 e no Xbox Series X|S. Standard fica em 79,99 dólares. Ultimate fica em 99,99 dólares. Não há terceira edição nesse texto, e não há linha em real ao lado.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-6-preco-e-edicoes-precos.webp",
        alt: "Barras com o preço anunciado da Standard e da Ultimate de GTA 6, ambas em dólares",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "As barras comparam os preços publicados em dólares. Não há coluna em reais porque o comunicado não traz essa coluna.",
    },
    {
      tipo: "tabela",
      titulo: "Preços e acréscimos no comunicado de junho",
      colunas: [
        "Item",
        "O que está escrito",
      ],
      linhas: [
        [
          "Standard",
          "79,99 dólares",
        ],
        [
          "Ultimate",
          "99,99 dólares",
        ],
        [
          "Pré-venda",
          "Desde 25 de junho de 2026",
        ],
        [
          "Pré-venda digital",
          "Um mês de GTA+",
        ],
        [
          "Antes de 20 nov 2026",
          "Vintage Vice City Pack",
        ],
        [
          "Valor em reais",
          "Não está no comunicado",
        ],
      ],
      fonte: TAKETWO,
      nota: "Preços em dólares, como no comunicado. Este texto não converte para real.",
    },
    {
      tipo: "paragrafo",
      texto: "No mesmo comunicado, a franquia, e não só GTA V, aparece com mais de 470 milhões de unidades vendidas. O número mede o histórico da marca. Não diz quantas pessoas vão comprar GTA 6 e não muda os 79,99 dólares. Também não produz um valor em reais. Tratar esse total como escassez seria acrescentar uma frase que a Take-Two não escreveu.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Por que esse número não vira real",
    },
    {
      tipo: "paragrafo",
      texto: "O preço anunciado é o preço em dólares. Câmbio e imposto não estão no comunicado, e mudam sem a Rockstar reeditar o texto. Copiar um valor em reais de um anúncio antigo, ou multiplicar 79,99 por um câmbio do dia, fabrica um número que esta matéria não pode assinar. Em dólares, está escrito. Em reais, não está.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Dólar no comunicado, real fora dele",
    },
    {
      tipo: "paragrafo",
      texto: "Quando alguém perguntar “quanto custa em reais”, a frase completa é que o comunicado não diz. A matéria do [lançamento](/blog/gta-6-lancamento-19-novembro-2026) separa a data, que a Rockstar fixou, do que continua em aberto. Preço em reais entra nesse segundo grupo, junto com a versão de PC, que até 19 de novembro de 2026 não tinha sido anunciada.",
    },
    {
      tipo: "destaque",
      tom: "atencao",
      titulo: "Não converta o comunicado",
      texto: "79,99 dólares e 99,99 dólares são os preços publicados. Não são valores em reais. Este texto não faz a conta e não publica o resultado.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que a data da compra muda",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-6-preco-e-edicoes-incluso.webp",
        alt: "Colunas separam o que o comunicado de pré-venda de GTA 6 publica e o que ele não informa",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Pacote e mês de GTA+ estão ligados à compra, não a uma lista completa do que a Ultimate acrescenta.",
    },
    {
      tipo: "paragrafo",
      texto: "A pré-venda começou em 25 de junho de 2026. Na pré-venda digital, o comunicado inclui um mês de GTA+. Ele não descreve o que a assinatura entrega além desse mês. Compras antes de 20 de novembro de 2026 incluem o Vintage Vice City Pack. O nome do pacote está escrito. O conteúdo, não.",
    },
    {
      tipo: "paragrafo",
      texto: "Esses acréscimos estão ligados à data e ao tipo de compra. O comunicado não diz que valem só para a Ultimate. A diferença explícita entre as edições é o preço: 79,99 dólares e 99,99 dólares. Os nomes da descrição da Ultimate estão na matéria do [mapa](/blog/gta-6-mapa-leonida-e-vice-city). Nome na descrição não é a ficha do dólar a mais.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que as duas edições não esclarecem",
    },
    {
      tipo: "paragrafo",
      texto: "Falta, nestes trechos, um inventário fechado da Ultimate. Dá para pagar o preço publicado. Não dá para montar, só com este comunicado, a lista de roupa, veículo ou missão que separa as edições. Quem precisar dessa lista tem de ir à página da edição no dia da compra e ler o que estiver escrito ali, não completar com catálogo antigo.",
    },
    {
      tipo: "paragrafo",
      texto: "O comunicado de junho citava pré-carga em 12 de novembro. Em novembro de 2026, a PlayStation e a Rockstar falam em 10 de novembro. Data e espaço estão na matéria de [pré-carga](/blog/gta-6-pre-carga-e-tamanho). Preço e arquivo são decisões diferentes, uma em dólares e a outra em gigabytes. Nenhuma está em reais. A série segue em [GTA 6 no blog](/blog/gta-6).",
    },
    {
      tipo: "pros-contras",
      pros: [
        "Os dois preços têm dono e moeda: o comunicado da Take-Two, em dólares",
        "O pacote e o mês de GTA+ ficam ligados à data da compra, como o texto escreve",
        "O valor em reais fica de fora, em vez de uma conversão feita para esta matéria",
      ],
      contras: [
        "Não há, aqui, a lista do que a Ultimate acrescenta além do preço",
        "O conteúdo do Vintage Vice City Pack não está descrito no trecho usado",
        "A pré-carga citada em junho como 12 de novembro foi depois falada como 10 de novembro",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Se o preço do jogo virou conversa de computador",
    },
    {
      tipo: "paragrafo",
      texto: "O número em dólares fica no comunicado da Take-Two. Na Balão da Informática Anchieta, Av. Anchieta, 789, Cambuí, Campinas, esta conversa não converte esse número e não publica valor de peça. Você vê a máquina ligada e fala dos jogos que já roda.",
    },
    {
      tipo: "paragrafo",
      texto: "A [montagem](/montagempc) parte desse uso. Chame no WhatsApp (19) 98751-0267 e diga o monitor. GTA 6 no computador entra na conta quando existir versão e requisito publicados. Até lá, o preço do jogo de console e a máquina da sua casa são assuntos separados, e só o primeiro tem número oficial, em dólares.",
    },
    {
      tipo: "chamada",
      titulo: "Quer montar para os jogos que você já tem?",
      texto: "Diga o monitor e os jogos de hoje. A equipe monta por esse uso e mostra a máquina ligada.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "Quanto custa GTA 6?",
      resposta: "No comunicado da Take-Two, de 24 de junho de 2026, a Standard custa 79,99 dólares e a Ultimate custa 99,99 dólares. O valor em reais não está nesse texto.",
    },
    {
      pergunta: "Qual a diferença entre Standard e Ultimate?",
      resposta: "A diferença explícita no comunicado é o preço em dólares. O texto não traz, nos trechos usados aqui, um inventário do que a Ultimate acrescenta. Pacote e mês de GTA+ estão ligados à data e à pré-venda, não a uma edição só.",
    },
    {
      pergunta: "O que vem na pré-venda de GTA 6?",
      resposta: "A pré-venda começou em 25 de junho de 2026. A pré-venda digital inclui um mês de GTA+. Compras antes de 20 de novembro de 2026 incluem o Vintage Vice City Pack. O comunicado não descreve o conteúdo desse pacote.",
    },
    {
      pergunta: "GTA 6 vai custar quanto em reais?",
      resposta: "O comunicado não publica valor em reais. Converter 79,99 dólares por câmbio do dia não cria um preço oficial. O número que dá para citar continua sendo o dólar anunciado.",
    },
  ],
  fontes: [
    TAKETWO,
    PLAYSTATION,
    ROCKSTARDATA,
  ],
};

export default artigo;
