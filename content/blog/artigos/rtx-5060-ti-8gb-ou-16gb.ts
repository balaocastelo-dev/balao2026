import type { Artigo, Fonte } from "@/lib/blog/tipos";

const TECHSPOT: Fonte = {
  nome: "TechSpot — “Instantly Obsolete: Nvidia RTX 5060 Ti 8GB Review”, Steven Walton",
  url: "https://www.techspot.com/review/2980-nvidia-geforce-rtx-5060-ti-8gb/",
  data: "abril de 2025",
};

const TOMS: Fonte = {
  nome: "Tom's Hardware — “Reviews show the Nvidia RTX 5060 Ti 8GB matches the 16GB model in most tests, falls behind in DLSS 4”",
  url: "https://www.tomshardware.com/pc-components/gpus/reviews-show-the-nvidia-rtx-5060-ti-8gb-matches-the-16gb-model-in-most-tests-falls-behind-in-dlss-4",
  data: "abril de 2025",
};

const NVIDIA: Fonte = {
  nome: "NVIDIA — ficha técnica da família GeForce RTX 5060",
  url: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/",
  data: "consulta em outubro de 2026",
};

const STEAM: Fonte = {
  nome: "Steam — Pesquisa de hardware e software",
  url: "https://store.steampowered.com/hwsurvey/",
  data: "setembro de 2026",
};

const artigo: Artigo = {
  slug: "rtx-5060-ti-8gb-ou-16gb",
  titulo: "RTX 5060 Ti de 8 GB ou 16 GB: o que os testes mostram",
  resumo:
    "As duas RTX 5060 Ti têm o mesmo chip e quase o mesmo nome. Veja onde os 8 GB bastam, onde eles travam e qual versão combina com o seu monitor.",
  categoria: "analises",
  etiquetas: ["Placa de vídeo", "RTX 5060 Ti", "VRAM", "PC gamer", "Upgrade"],
  capa: {
    src: "/blog/capas/rtx-5060-ti-8gb-ou-16gb.webp",
    alt: "Grade de chips de memória: uma fileira com 8 apagados e duas fileiras com 16 acesos em vermelho",
    largura: 1536,
    altura: 1024,
    pronta: true,
  },
  publicadoEm: "2026-10-09T03:10:00.000Z",
  autor: { nome: "Equipe Balão da Informática", url: "/sobre-nos" },
  origem: "autoral",
  destaque: 10,
  seo: {
    titulo: "RTX 5060 Ti 8 GB ou 16 GB: o que os testes mostram",
    palavrasChave: [
      "rtx 5060 ti 8gb ou 16gb",
      "rtx 5060 ti 16gb vale a pena",
      "8gb de vram é suficiente",
      "placa de vídeo para 1440p",
      "placa de vídeo campinas",
    ],
  },

  blocos: [
    {
      tipo: "paragrafo",
      texto:
        "A RTX 5060 Ti é vendida em duas versões que dividem o nome, o chip gráfico e quase toda a ficha técnica. A única diferença está na memória de vídeo: 8 GB em uma, 16 GB na outra. Na prateleira as caixas são parecidas; na tela, dependendo do jogo, podem parecer placas de gerações diferentes.",
    },
    {
      tipo: "paragrafo",
      texto:
        "A resposta curta: em Full HD, com jogos competitivos e qualidade média ou alta, a versão de 8 GB entrega praticamente o mesmo que a de 16 GB. Em 1440p, com texturas no máximo, ray tracing ou geração de quadros, os 8 GB acabam antes do jogo — e a queda não é de alguns quadros, chega perto da metade. A seguir estão os números, de onde eles vieram e como decidir pelo seu monitor.",
    },
    {
      tipo: "resumo",
      itens: [
        "**Mesmo chip, mesmo consumo.** Nas duas versões são 4.608 núcleos CUDA e 180 W; só a memória muda.",
        "**Em Full HD com ajustes moderados, empatam.** Nos testes do TechSpot, vários jogos rodaram de forma muito parecida nas duas.",
        "**Quando a memória acaba, o tombo é grande.** Em Final Fantasy XVI a 1440p, a de 16 GB fez 74 fps contra 41 fps da de 8 GB.",
        "**A escolha é pelo monitor e pelo tempo de uso.** Full HD e jogos leves aceitam 8 GB; 1440p ou vários anos sem trocar pedem 16 GB.",
      ],
    },

    { tipo: "titulo", nivel: 2, texto: "O que muda entre as duas versões (e o que não muda)" },
    {
      tipo: "paragrafo",
      texto:
        "A Nvidia lista as duas placas na mesma coluna da ficha técnica, separadas por uma barra: 16 GB / 8 GB de memória GDDR7. Todo o resto é igual — quantidade de núcleos, barramento de memória, consumo, conector de energia e saídas de vídeo. Na prática, enquanto o jogo couber em 8 GB, o desempenho das duas é o mesmo, porque o processador gráfico é o mesmo.",
    },
    {
      tipo: "tabela",
      titulo: "Ficha técnica das duas versões",
      colunas: ["", "RTX 5060 Ti 8 GB", "RTX 5060 Ti 16 GB"],
      linhas: [
        ["Memória de vídeo", "8 GB GDDR7", "**16 GB GDDR7**"],
        ["Núcleos CUDA", "4.608", "4.608"],
        ["Barramento de memória", "128 bits", "128 bits"],
        ["Consumo da placa", "180 W", "180 W"],
        ["Fonte recomendada", "600 W", "600 W"],
        ["Alimentação", "1 conector PCIe de 8 pinos", "1 conector PCIe de 8 pinos"],
        ["Saídas de vídeo", "3 DisplayPort e 1 HDMI", "3 DisplayPort e 1 HDMI"],
      ],
      fonte: NVIDIA,
      nota: "Valores do projeto de referência; tamanho e ventoinhas variam conforme o fabricante. A fonte recomendada considera um computador com Ryzen 9 9950X.",
    },
    {
      tipo: "paragrafo",
      texto:
        "Por isso a pergunta certa não é “qual é mais rápida”, e sim “os meus jogos, na minha resolução, cabem em 8 GB?”. A memória de vídeo guarda texturas, geometria e os quadros que a placa está montando. Quanto maior a resolução e a qualidade das texturas, mais espaço o jogo ocupa. Quando esse espaço acaba, a placa passa a buscar dados na memória do sistema, que é muito mais lenta.",
    },

    { tipo: "titulo", nivel: 2, texto: "Onde 8 GB ainda bastam" },
    {
      tipo: "paragrafo",
      texto:
        "Em Full HD, com ajustes médios ou altos e sem ray tracing pesado, a maior parte dos jogos cabe em 8 GB. É o cenário de quem joga títulos competitivos e quer taxa de quadros alta em um [monitor gamer](/categoria/computadores-monitores-monitor-gamer) de 144 Hz ou mais. No levantamento do Tom's Hardware sobre os primeiros testes publicados, a versão de 8 GB chegou a ficar ligeiramente à frente em Counter-Strike 2.",
    },
    {
      tipo: "paragrafo",
      texto:
        "Os testes do TechSpot, montados justamente para achar o limite dos 8 GB, também registram empates. Em Alan Wake 2 a 1440p, com DLSS no modo qualidade e preset alto, o desempenho das duas foi “muito similar”. Em Hogwarts Legacy a 1440p no ultra, sem ray tracing, a média de quadros ficou parecida. Em Indiana Jones e o Grande Círculo a 1080p no médio, a de 8 GB fez 114 fps e a de 16 GB foi 7% mais rápida.",
    },
    {
      tipo: "paragrafo",
      texto:
        "Esse ainda é o uso mais comum. Na pesquisa de hardware da Steam de setembro de 2026, 47,91% dos jogadores têm um monitor Full HD como tela principal, contra 27,04% em 1440p. Se você está no primeiro grupo e não pretende trocar de monitor, pagar pela memória extra é pagar por um espaço que os seus jogos não ocupam hoje.",
    },

    { tipo: "titulo", nivel: 2, texto: "Onde os 8 GB travam" },
    {
      tipo: "paragrafo",
      texto:
        "O quadro muda quando a resolução sobe ou as texturas vão para o máximo. Nos testes do TechSpot, a diferença deixa de ser de porcentagem e passa a ser de categoria: um jogo fluido de um lado, um jogo que engasga do outro.",
    },
    {
      tipo: "benchmark",
      titulo: "Média de quadros por segundo nas duas versões",
      unidade: "fps",
      grupos: [
        {
          rotulo: "Final Fantasy XVI",
          detalhe: "1440p, DLSS qualidade, ultra",
          barras: [
            { nome: "16 GB", valor: 74, destaque: true },
            { nome: "8 GB", valor: 41 },
          ],
        },
        {
          rotulo: "Assassin's Creed Shadows",
          detalhe: "1440p, DLSS balanceado, muito alto",
          barras: [
            { nome: "16 GB", valor: 66, destaque: true },
            { nome: "8 GB", valor: 44 },
          ],
        },
        {
          rotulo: "Spider-Man 2",
          detalhe: "1080p nativo, muito alto",
          barras: [
            { nome: "16 GB", valor: 78, destaque: true },
            { nome: "8 GB", valor: 49 },
          ],
        },
        {
          rotulo: "Star Wars Jedi: Survivor",
          detalhe: "4K, DLSS desempenho, épico",
          barras: [
            { nome: "16 GB", valor: 68, destaque: true },
            { nome: "8 GB", valor: 32 },
          ],
        },
      ],
      fonte: TECHSPOT,
      nota: "Sistema de teste: Ryzen 7 9800X3D e 32 GB de DDR5-6000. Barra maior é resultado melhor.",
    },
    {
      tipo: "paragrafo",
      texto:
        "Repare em Spider-Man 2: a diferença aparece já em Full HD, sem nenhum recurso de upscaling. Com a qualidade no muito alto, a placa de 16 GB foi quase 60% mais rápida. Não é um problema só de quem joga em 1440p ou 4K; depende de quanta memória o jogo pede.",
    },
    {
      tipo: "paragrafo",
      texto:
        "Em alguns testes o resultado nem chegou a virar número. O TechSpot relata que Indiana Jones e o Grande Círculo fechou sozinho na placa de 8 GB sempre que o ajuste passava do médio, enquanto a de 16 GB rodou normalmente.",
    },
    {
      tipo: "citacao",
      texto: "Se você vai gastar 400 dólares ou mais, a placa precisa ter 16 GB.",
      autor: "Steven Walton",
      cargo: "autor do teste do TechSpot, na conclusão",
      fonte: TECHSPOT,
      traduzida: true,
    },

    { tipo: "titulo", nivel: 2, texto: "Por que a média de fps esconde o problema" },
    {
      tipo: "paragrafo",
      texto:
        "A média de quadros por segundo conta só parte da história. Quando a memória de vídeo enche, a placa passa a trocar dados com a memória do sistema no meio da partida. O que você sente é o engasgo: a imagem para por uma fração de segundo ao virar a câmera ou entrar em uma área nova.",
    },
    {
      tipo: "paragrafo",
      texto:
        "Por isso os testes também medem o “1% low”, a média dos piores momentos. Em Final Fantasy XVI a 1440p nativo no ultra, o TechSpot mediu média 58% maior na placa de 16 GB — e os piores momentos 218% melhores. Uma está jogável e a outra não, mesmo que as duas mostrem um número aceitável no contador.",
    },
    {
      tipo: "destaque",
      tom: "dica",
      titulo: "O custo real dos 8 GB",
      texto:
        "Baixar a qualidade das texturas costuma resolver. Esse é o preço da versão de 8 GB: o chip tem força para o ajuste mais alto, mas é a memória que decide até onde você pode ir.",
    },

    { tipo: "titulo", nivel: 2, texto: "Ray tracing e geração de quadros também ocupam memória" },
    {
      tipo: "paragrafo",
      texto:
        "Os recursos que mais chamam atenção na linha RTX 50 têm um custo que não aparece na caixa: ray tracing e a geração de quadros do DLSS 4 usam memória de vídeo adicional. Em uma placa de 8 GB, ligar esses recursos pode ser exatamente o que faz a memória transbordar.",
    },
    {
      tipo: "paragrafo",
      texto:
        "O Tom's Hardware reuniu os primeiros testes publicados e registrou que, em Cyberpunk 2077 com geração de múltiplos quadros em 4x, a versão de 16 GB entregou desempenho 22% maior. No TechSpot, Hogwarts Legacy a 1440p com ray tracing ficou injogável na placa de 8 GB, com a de 16 GB marcando média 62% maior.",
    },
    {
      tipo: "paragrafo",
      texto:
        "Se a sua ideia é comprar uma RTX 5060 Ti para usar esses recursos, a versão de 8 GB entrega o chip, mas não o espaço que eles pedem.",
    },
    { tipo: "chamada", tema: "placas-de-video" },

    { tipo: "titulo", nivel: 2, texto: "O resto do computador: fonte, conector e gabinete" },
    {
      tipo: "paragrafo",
      texto:
        "Como o consumo é o mesmo, a exigência elétrica também é: 180 W na placa, fonte de 600 W recomendada pela Nvidia e um conector PCIe de 8 pinos. Quem já tem uma fonte de qualidade nessa faixa não precisa trocar nada para instalar qualquer uma das duas. Se a sua é genérica ou antiga, vale ler [como escolher a fonte ideal para PC gamer](/blog/fonte-ideal-para-pc-gamer) antes do upgrade.",
    },
    {
      tipo: "paragrafo",
      texto:
        "O tamanho muda conforme o fabricante: há modelos de duas e de três ventoinhas, e os maiores não cabem em todo gabinete compacto. Meça o espaço livre e confira as entradas de vídeo do seu monitor. Em uma [montagem sob medida](/montagempc), essa conferência é parte do trabalho.",
    },

    { tipo: "titulo", nivel: 2, texto: "Qual escolher: três perfis" },
    {
      tipo: "tabela",
      colunas: ["Seu uso", "Monitor", "Versão indicada", "Por quê"],
      linhas: [
        [
          "Jogos competitivos e títulos leves",
          "Full HD, 144 Hz ou mais",
          "**8 GB**",
          "Esses jogos ocupam pouca memória, e o chip é o mesmo.",
        ],
        [
          "Lançamentos com qualidade alta",
          "Full HD ou 1440p",
          "**16 GB**",
          "É onde os testes mostram a de 16 GB de 50% a 80% à frente.",
        ],
        [
          "Ray tracing, geração de quadros ou vários anos sem trocar",
          "1440p",
          "**16 GB**",
          "Os recursos novos pedem mais memória, e ela não pode ser ampliada depois.",
        ],
      ],
      colunaDestaque: 2,
    },
    {
      tipo: "paragrafo",
      texto:
        "A memória de vídeo é soldada na placa. Diferentemente da [memória RAM](/categoria/hardware-memoria-ram) do computador, não existe upgrade de 8 para 16 GB: a decisão é tomada na compra. Quem leva a de 8 GB para “ver se dá” e descobre que não dá precisa vender a placa e comprar outra.",
    },
    {
      tipo: "paragrafo",
      texto:
        "Pese também o tempo de uso. Na mesma pesquisa da Steam, as placas com 16 GB já aparecem em 27,21% dos computadores, à frente das de 8 GB, com 26,71%. É um sinal de para onde os estúdios tendem a dimensionar as texturas dos próximos jogos.",
    },

    { tipo: "titulo", nivel: 2, texto: "Prós e contras da versão de 16 GB" },
    {
      tipo: "paragrafo",
      texto:
        "O veredito abaixo é da versão de 16 GB, porque é nela que a RTX 5060 Ti entrega tudo o que o chip consegue fazer.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "Roda em 1440p com texturas no máximo sem engasgar por falta de memória",
        "Tem espaço para ray tracing e para a geração de quadros do DLSS 4",
        "Mesmo consumo e mesma fonte da versão de 8 GB",
        "Mais folga de memória para os próximos lançamentos",
      ],
      contras: [
        "Custa bem mais que a versão de 8 GB",
        "Em Full HD com jogos leves, não entrega nada a mais",
        "O nome idêntico ao da versão de 8 GB confunde na hora da compra",
      ],
    },

    { tipo: "titulo", nivel: 2, texto: "Antes de fechar a compra" },
    {
      tipo: "paragrafo",
      texto:
        "Confira três coisas: a resolução do seu monitor, a lista dos jogos que você de fato joga e o nome completo do produto. O número de gigabytes aparece no nome e na caixa, geralmente como “8G” ou “16G”. Um preço bem abaixo dos demais quase sempre indica a versão de 8 GB.",
    },
    {
      tipo: "paragrafo",
      texto:
        "Na loja do Cambuí, em Campinas, dá para ver o computador ligado e testar antes de pagar, e a assistência técnica fica no mesmo endereço para quem precisa de ajuda com instalação ou fonte. Escolha pela tela que você usa e pelo tempo que pretende ficar com a placa: é isso que decide se 8 GB são economia ou arrependimento.",
    },
    {
      tipo: "chamada",
      titulo: "Mande a lista dos seus jogos",
      texto:
        "Diga quais jogos você joga e qual é o seu monitor. A equipe responde qual das duas versões resolve o seu caso.",
      rotulo: "Perguntar no WhatsApp",
      mensagem:
        "Olá! Li a comparação da RTX 5060 Ti de 8 GB e 16 GB no blog e quero ajuda para escolher. Meus jogos e meu monitor são: ",
    },
  ],

  analise: {
    item: { nome: "GeForce RTX 5060 Ti 16 GB", marca: "NVIDIA", categoria: "Placa de vídeo" },
    nota: 8.3,
    indicadoPara: "Quem joga em 1440p, ou em Full HD com tudo no máximo",
    veredito:
      "A RTX 5060 Ti de 16 GB é a versão que faz sentido para quem joga lançamentos em qualidade alta, usa monitor 1440p ou quer ficar alguns anos sem trocar de placa. A de 8 GB tem o mesmo chip e atende bem jogos competitivos em Full HD, mas fica sem memória justamente nos recursos que a linha RTX 50 anuncia. Se a diferença de preço couber no orçamento, a memória extra é o que mantém a placa útil por mais tempo.",
    criterios: [
      { nome: "Desempenho em Full HD", nota: 9 },
      { nome: "Desempenho em 1440p", nota: 8 },
      { nome: "Memória de vídeo", nota: 9.5 },
      { nome: "Consumo e fonte", nota: 8.5 },
      { nome: "Custo", nota: 6.5 },
    ],
  },

  metodologia:
    "Esta análise compara dados publicados; não é um teste feito na nossa bancada. Os números de desempenho são do TechSpot e do levantamento do Tom's Hardware, ambos de abril de 2025. A ficha técnica é a oficial da Nvidia e os dados de uso são da pesquisa de hardware da Steam de setembro de 2026. A nota é a média dos cinco critérios.",

  perguntas: [
    {
      pergunta: "8 GB de VRAM ainda são suficientes em 2026?",
      resposta:
        "Para jogos competitivos e para a maioria dos títulos em Full HD com qualidade média ou alta, sim. Para lançamentos com texturas no máximo, ray tracing ou resolução 1440p, os testes mostram quedas grandes de desempenho e engasgos por falta de memória.",
    },
    {
      pergunta: "Dá para aumentar a memória de vídeo depois?",
      resposta:
        "Não. A memória de vídeo é soldada na placa e não pode ser trocada nem ampliada. Para ter mais VRAM é preciso trocar a placa inteira.",
    },
    {
      pergunta: "A RTX 5060 Ti de 16 GB precisa de uma fonte mais forte que a de 8 GB?",
      resposta:
        "Não. As duas consomem 180 W, e a Nvidia recomenda fonte de 600 W para ambas, com um conector PCIe de 8 pinos.",
    },
    {
      pergunta: "A versão de 16 GB é mais rápida em todos os jogos?",
      resposta:
        "Não. O chip é o mesmo; enquanto o jogo cabe em 8 GB, o desempenho é praticamente igual. A diferença aparece quando o jogo precisa de mais memória do que a versão de 8 GB tem.",
    },
    {
      pergunta: "Como saber qual versão estou comprando?",
      resposta:
        "Confira a quantidade de memória no nome completo do produto e na caixa, normalmente escrita como 8G ou 16G. O nome RTX 5060 Ti é o mesmo nas duas.",
    },
  ],

  fontes: [TECHSPOT, TOMS, NVIDIA, STEAM],
};

export default artigo;
