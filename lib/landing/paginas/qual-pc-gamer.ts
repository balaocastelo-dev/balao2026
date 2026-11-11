import type { PaginaDeCaptacao } from "../tipos";

const MENSAGEM =
  "Olá! Li o guia de PC gamer. Tenho até R$ ____ e jogo ____. Qual PC vocês recomendam e tem para ver rodando?";

export const qualPcGamer: PaginaDeCaptacao = {
  slug: "qual-pc-gamer",
  nome: "Qual PC gamer comprar",
  chamada: "Três faixas de orçamento para escolher um PC gamer e ver a máquina ligada na loja do Cambuí antes de pagar.",
  seo: {
    titulo: "Qual PC Gamer Comprar com 3, 5 ou 8 Mil em 2026",
    descricao:
      "Guia de PC gamer nas faixas de 3, 5 e 8 mil: o que observar em cada uma e onde ver a máquina ligada no Cambuí, em Campinas.",
    palavras: [
      "qual pc gamer comprar até 5 mil",
      "pc gamer até 3 mil",
      "pc gamer até 8 mil",
      "melhor pc gamer custo benefício 2026",
      "rtx 5060 ou rx 7600",
      "pc para valorant fortnite gta",
      "pc gamer campinas",
      "testar pc gamer antes de comprar",
    ],
    tipoDeServico: "Orientação e venda de PC gamer",
    artigo: true,
  },
  hero: {
    contexto: "Guia da loja do Cambuí · atualizado em 4 de novembro de 2026",
    titulo: "Qual PC gamer comprar em cada faixa",
    texto:
      "Três faixas — cerca de 3, 5 e 8 mil — e o que cada uma consegue fazer de verdade. A vitrine abaixo mostra PCs que estão no catálogo da loja agora. FPS medido na bancada ainda não está nesta página: você vê a máquina ligada no Cambuí, com hora marcada pelo WhatsApp.",
    imagem: { src: "/images/landing/v2/pcgamer.jpg", alt: "PC gamer ligado na loja, ao lado de um monitor" },
    mensagem: MENSAGEM,
    botao: "Pedir indicação no WhatsApp",
    secundario: { rotulo: "Ver a resposta rápida", href: "#secao-1" },
    fatos: [
      { valor: "Três faixas", rotulo: "leve, Full HD e tela melhor" },
      { valor: "Catálogo real", rotulo: "a vitrine é o estoque do site" },
      { valor: "Ver ligado", rotulo: "na Av. Anchieta, antes de pagar" },
      { valor: "10% no Pix", rotulo: "ou até 10x sem juros no cartão" },
    ],
  },
  assistente: {
    titulo: "Sua faixa, seu jogo, sua tela",
    texto: "A equipe responde com o que tem para ver rodando.",
    abertura: MENSAGEM,
    botao: "Pedir a indicação",
    perguntas: [
      { rotulo: "Faixa", pergunta: "Qual faixa cabe no orçamento?", opcoes: ["Até 3 mil", "Até 5 mil", "Até 8 mil", "Acima disso"] },
      { rotulo: "Jogos", pergunta: "O que você mais joga?", opcoes: ["Valorant, CS2 ou LoL", "Fortnite", "GTA e mundo aberto", "Lançamentos pesados"] },
      { rotulo: "Monitor", pergunta: "Já tem monitor?", opcoes: ["Full HD", "2K ou 144 Hz", "4K", "Ainda não tenho"] },
    ],
  },
  secoes: [
    {
      tipo: "beneficios",
      titulo: "Resposta rápida: o que comprar em cada faixa",
      texto:
        "Isto é um mapa, não uma ficha de FPS. O PC certo é o que está na loja no dia e cabe no seu monitor. Preço e prazo confirmados pelo WhatsApp.",
      itens: [
        {
          titulo: "Até 3 mil",
          texto: "Jogos leves e competitivos em Full HD, com ajuste de qualidade. Placa de vídeo dedicada de entrada ou vídeo integrado forte, desde que o anúncio não chame de gamer uma máquina que não roda o seu jogo.",
        },
        {
          titulo: "Até 5 mil",
          texto: "A faixa em que Full HD fica confortável na maior parte dos jogos. Processador de 6 núcleos, 16 GB em dois pentes e SSD NVMe são o miolo. A placa fica na conversa entre a linha RTX 5060 e a RX 7600, conforme o que a loja tiver.",
        },
        {
          titulo: "Até 8 mil",
          texto: "Sobra para monitor melhor, 1440p ou para quem joga e ainda grava. Mais placa de vídeo, e memória com folga se você deixa o jogo junto com o navegador e a gravação.",
        },
      ],
    },
    {
      tipo: "vitrine",
      titulo: "O que o catálogo tem hoje, por faixa",
      texto:
        "Os preços são os do site, neste momento. Se uma faixa aparecer vazia, é porque não há PC gamer do catálogo naquele intervalo. Pergunte no WhatsApp o que dá para ver ligado na loja.",
      regras: [
        {
          id: "faixa-3",
          titulo: "Até 3 mil",
          subtitulo: "O que o catálogo lista nesta faixa agora",
          categorias: ["Computadores/PC/PC Gamer"],
          precoMax: 3000,
          ordem: "menor",
          limite: 8,
          verTodos: { rotulo: "Ver todos os PCs gamer", href: "/pcgamer" },
        },
        {
          id: "faixa-5",
          titulo: "De 3 a 5 mil",
          subtitulo: "Full HD com mais folga",
          categorias: ["Computadores/PC/PC Gamer"],
          precoMin: 3000,
          precoMax: 5000,
          ordem: "menor",
          limite: 8,
        },
        {
          id: "faixa-8",
          titulo: "De 5 a 8 mil",
          subtitulo: "Para tela melhor ou para jogar e gravar",
          categorias: ["Computadores/PC/PC Gamer"],
          precoMin: 5000,
          precoMax: 8000,
          ordem: "menor",
          limite: 8,
        },
      ],
    },
    {
      tipo: "retorno",
      titulo: "Pedir retorno rápido",
      texto: "Faixa, jogo e se você já tem monitor. A resposta vem no WhatsApp com o que dá para ver na loja.",
      assunto: "Guia de PC gamer",
      campos: [
        { nome: "orcamento", rotulo: "Orçamento", opcoes: ["Até 3 mil", "Até 5 mil", "Até 8 mil", "Acima de 8 mil"] },
        { nome: "jogos", rotulo: "Jogos" },
        { nome: "monitor", rotulo: "Já tem monitor?", opcoes: ["Não", "Full HD", "2K ou 144 Hz", "4K", "Não sei"] },
      ],
    },
    {
      tipo: "texto",
      titulo: "Até 3 mil: jogos leves e competitivos",
      paragrafos: [
        "Nesta faixa o dinheiro acaba rápido se for para gabinete com vidro e luz. O que muda o jogo é ter placa de vídeo, mesmo de entrada, ou um processador com vídeo integrado que a loja confirme rodar o título que você joga. Valorant, LoL e CS2 em qualidade média cabem melhor aqui do que um lançamento no ultra.",
        "Desconfie de anúncio que escreve gamer e entrega só vídeo integrado sem dizer isso. Para emulador e jogo leve, vídeo integrado serve. Para lançamento, não. A Balão separa isso na conversa, antes de você pagar.",
        "16 GB de RAM em um pente só deixa a porta fechada para o segundo. Dois pentes de 8 GB usam o canal duplo e ainda permitem trocar um deles depois. SSD NVMe, não HD, para o mapa do jogo não demorar uma vida para carregar.",
      ],
    },
    {
      tipo: "texto",
      titulo: "Até 5 mil: Full HD com folga",
      paragrafos: [
        "É a faixa que a maior parte de quem joga em Full HD procura em 2026. O miolo equilibrado, no que se vê no mercado, é processador de 6 núcleos, placa na conversa entre GeForce RTX 5060 e Radeon RX 7600, 16 GB de RAM em dois pentes e SSD NVMe. Qual das duas placas está na loja muda com o estoque: nenhuma das duas é promessa fixa desta página.",
        "RTX 5060 e RX 7600 não são a mesma compra. Uma pode ter recurso de quadro gerado por software e a outra pode entregar mais quadro bruto num jogo específico. Sem medição nossa publicada aqui, a escolha é pelo jogo que você mais abre e pelo preço do dia. Venha ver as duas ligadas, se as duas estiverem na loja, ou peça no WhatsApp qual está disponível.",
        "Fonte com folga e gabinete que respira pesam mais do que ventoinha colorida. A página de montagem explica o que a bancada confere antes de fechar o parafuso.",
      ],
    },
    {
      tipo: "texto",
      titulo: "Até 8 mil: tela melhor e quem grava",
      paragrafos: [
        "Subir de 5 para 8 mil não é para o mesmo Full HD com luz a mais. O salto aparece quando o monitor é 1440p, quando você quer qualidade alta sem ficar mexendo em opção gráfica, ou quando o PC também grava e edita. A placa de vídeo leva a maior parte desse dinheiro.",
        "32 GB de RAM passam a fazer sentido se o jogo divide a máquina com navegador, chamada e gravação. Para só jogar, 16 GB em dois pentes continuam o ponto de partida, e o dinheiro que sobra vai melhor para a placa.",
        "A loja não publica FPS desta faixa. O que dá para fazer é sentar na Av. Anchieta e ver o jogo que você joga, na configuração que está montada. Agende pelo WhatsApp (19) 98751-0267.",
      ],
    },
    {
      tipo: "regras",
      titulo: "Armadilhas que encarecem depois",
      itens: [
        {
          titulo: "PC gamer sem placa de vídeo",
          texto: "Serve para jogo leve e emulador. Para lançamento, a placa dedicada é o que desenha o quadro. Leia a ficha: vídeo integrado precisa estar escrito com clareza, não escondido na palavra gamer.",
        },
        {
          titulo: "Fonte genérica no limite",
          texto: "Fonte fraca derruba o PC no meio da partida e, no pior caso, leva outra peça junto. A bancada não fecha montagem com fonte no talo da placa de vídeo.",
        },
        {
          titulo: "Um pente de RAM só",
          texto: "Um pente de 16 GB funciona, mas deixa desempenho na mesa e obriga a trocar o pente inteiro no próximo upgrade. Dois pentes são o padrão que a loja prefere indicar.",
        },
      ],
    },
    {
      tipo: "texto",
      titulo: "E o monitor?",
      paragrafos: [
        "Placa forte em monitor de 60 Hz deixa quadro na mesa que a tela não mostra. Monitor de alta taxa com placa fraca também não se completa. Case os dois: Full HD de alta taxa pede uma placa que segure o FPS competitivo; 1440p pede mais memória de vídeo.",
        "Se você já tem monitor, diga a resolução e os hertz no WhatsApp. A indicação muda. Se ainda não tem, a vitrine de monitores da página de PC gamer ajuda a escolher junto, em vez de comprar a tela errada depois.",
      ],
    },
    {
      tipo: "texto",
      titulo: "Venha ver rodando no Cambuí",
      paragrafos: [
        "Guia de site nacional não liga o PC na sua frente. Aqui liga. A Balão da Informática Anchieta fica na Av. Anchieta, 789, Cambuí, Campinas. Segunda a sexta, 9h às 18h. Sábado, 9h às 13h. Você vê a máquina, pergunta da fonte e da garantia da peça, e decide no balcão.",
        "Pagamento com 10% de desconto no Pix ou até 10x sem juros no cartão, como no resto da loja. Nota fiscal na venda. Entrega por motoboy em Campinas, Sumaré, Hortolândia, Valinhos e região, com preço e prazo confirmados pelo WhatsApp. Para uma configuração que não está na vitrine, a montagem sob medida parte do seu jogo e da sua faixa.",
      ],
    },
    {
      tipo: "atalhos",
      titulo: "Siga para a máquina",
      itens: [
        { titulo: "PC gamer pronto", texto: "Fileiras por placa de vídeo, com o catálogo de hoje.", href: "/pcgamer", imagem: "/images/landing/v2/pcgamer.jpg" },
        { titulo: "Monte o seu", texto: "Peças escolhidas para o seu jogo, montadas na loja.", href: "/monteseupc" },
        { titulo: "Montagem na bancada", texto: "Cabos, BIOS e teste antes de você pagar.", href: "/montagempc", imagem: "/images/landing/v2/montagempc.jpg" },
        { titulo: "Queda de preço", texto: "O que baixou de verdade no catálogo.", href: "/queda-de-preco" },
        { titulo: "Seminovos", texto: "Quando a faixa pede uma máquina revisada.", href: "/seminovos", imagem: "/images/landing/v2/notebooks.jpg" },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Qual o melhor PC gamer até 5 mil em 2026?",
      resposta:
        "Para Full HD, a combinação mais equilibrada é processador de 6 núcleos com placa de vídeo dedicada na conversa entre RTX 5060 e RX 7600, 16 GB de RAM em dois pentes e SSD NVMe. Na Balão da Informática Anchieta, o modelo e o preço de cada faixa são os da vitrine e do WhatsApp (19) 98751-0267. A página não publica FPS medido.",
    },
    {
      pergunta: "PC gamer sem placa de vídeo vale a pena?",
      resposta:
        "Só para jogos leves e emuladores. Para lançamentos é preciso placa dedicada. Muitos anúncios chamam de gamer máquinas só com vídeo integrado.",
    },
    {
      pergunta: "Onde testar um PC gamer antes de comprar em Campinas?",
      resposta:
        "Na loja da Av. Anchieta, 789, Cambuí, com agendamento pelo WhatsApp (19) 98751-0267.",
    },
    {
      pergunta: "16 GB de RAM bastam?",
      resposta:
        "Para jogar, sim, de preferência em dois pentes. 32 GB entram quando você grava, edita ou deixa muita coisa aberta junto com o jogo.",
    },
    {
      pergunta: "A loja entrega em Sumaré, Hortolândia ou Valinhos?",
      resposta:
        "Sim. A entrega por motoboy em Campinas e região é combinada pelo WhatsApp. Preço e prazo confirmados pelo WhatsApp.",
    },
  ],
  tituloDasPerguntas: "Perguntas frequentes",
  temas: ["pcgamer", "pc", "games", "compra", "montagem", "upgrade"],
  termosDoBlog: ["pc gamer", "placa de vídeo", "rtx", "fps", "fonte", "memória ram"],
  relacionadas: ["pcgamer", "montagempc", "promocao", "pcgamer3d"],
  final: {
    titulo: "Diga a faixa e o jogo",
    texto: "A equipe responde o que tem para ver rodando na Av. Anchieta. Preço e prazo confirmados pelo WhatsApp.",
    botao: "Chamar no WhatsApp",
    mensagem: MENSAGEM,
  },
};
