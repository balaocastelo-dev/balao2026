import type { PaginaDeCaptacao } from "../tipos";

// Página especial: a vitrine de notebooks entra pelo bloco
// { tipo: "especial", id: "vitrine-notebooks" } (só notebooks em cards,
// regra do Thiago). O page.tsx é do coordenador.
export const notebooks: PaginaDeCaptacao = {
  slug: "notebooks",
  nome: "Notebooks em Campinas",
  chamada: "Diga para que vai usar e receba duas ou três opções que fazem sentido, para ver ligadas no balcão.",
  seo: {
    titulo: "Notebook em Campinas (Cambuí): escolha pelo seu uso | Balão da Informática",
    descricao:
      "Notebook para estudo, escritório, design, jogos e programação no Cambuí, em Campinas. Veja ligado antes de levar e conte com a assistência no mesmo endereço.",
    palavras: [
      "notebook em Campinas",
      "loja de notebook no Cambuí",
      "qual notebook comprar para estudar",
      "notebook para trabalho e escritório Campinas",
      "notebook para design e edição de vídeo",
      "notebook gamer Campinas",
      "notebook para programação",
      "notebook com 16GB de RAM e SSD",
      "MacBook Air em Campinas",
      "notebook Lenovo, Acer, Asus e Dell Campinas",
      "comprar notebook parcelado sem juros Campinas",
    ],
    tipoDeServico: "Venda de notebooks com assistência técnica",
  },
  hero: {
    contexto: "Loja de informática no Cambuí, em Campinas",
    titulo: "O notebook certo para o que você faz, sem pagar pelo que não vai usar",
    texto:
      "Conte se é para estudar, trabalhar, editar, jogar ou programar. A equipe da Balão indica os modelos que fazem sentido, você vê o notebook ligado no balcão e a assistência técnica fica no mesmo endereço depois da compra.",
    imagem: { src: "/images/landing/v2/notebooks.jpg", alt: "Notebook fino aberto sobre uma mesa de madeira, ao lado de uma xícara de café" },
    mensagem: "Olá! Vim pela página de notebooks da Balão e quero ajuda para escolher um notebook.",
    botao: "Pedir indicação no WhatsApp",
    secundario: { rotulo: "Como escolher pelo uso", href: "#secao-1" },
    fatos: [
      { valor: "Ligado no balcão", rotulo: "você vê e testa antes de levar" },
      { valor: "Assistência", rotulo: "no mesmo endereço, para upgrade e garantia" },
      { valor: "10% no Pix", rotulo: "ou até 10x sem juros no cartão" },
      { valor: "Nota fiscal", rotulo: "e garantia do fabricante" },
    ],
  },
  assistente: {
    titulo: "Indicação em três toques",
    texto: "Responda e o vendedor já começa pelo modelo certo, não pela lista inteira.",
    abertura: "Olá! Vim pela página de notebooks e quero uma indicação.",
    fecho: "Pode me mandar duas ou três opções e me dizer o que tem para retirar hoje?",
    botao: "Enviar para o vendedor",
    perguntas: [
      {
        rotulo: "Uso",
        pergunta: "Para que vai usar?",
        varias: true,
        opcoes: ["Estudo", "Trabalho e escritório", "Design e edição", "Jogos", "Programação", "Uso da casa"],
      },
      {
        rotulo: "O que mais pesa",
        pergunta: "O que é mais importante para você?",
        opcoes: ["Preço", "Leveza", "Bateria", "Desempenho"],
      },
      {
        rotulo: "Faixa",
        pergunta: "Em que faixa você pensa?",
        opcoes: ["O essencial, bem resolvido", "Intermediário", "Topo de linha", "Ainda não sei"],
      },
    ],
  },
  secoes: [
    {
      tipo: "texto",
      titulo: "Comece pelo uso, não pela ficha técnica",
      paragrafos: [
        "A maioria das pessoas que chega ao balcão já viu dezenas de anúncios e está em dúvida entre números: i5 ou i7, 8 ou 16 GB, 256 ou 512 GB. A pergunta que resolve a escolha vem antes: o que você vai fazer no notebook todo dia, e onde ele vai ficar. Quem estuda e carrega o notebook na mochila precisa de leveza e bateria; quem edita vídeo precisa de processador, memória e tela boa; quem joga precisa de placa de vídeo dedicada e refrigeração.",
        "Com o uso definido, sobra pouca coisa para decidir. Um notebook de entrada bem montado, com SSD e memória suficientes, atende estudo e escritório por anos. Pagar por placa de vídeo de jogo para quem só usa navegador, planilha e reunião é gastar duas vezes: no preço e na bateria, que dura menos.",
        "Por isso o primeiro passo no WhatsApp é contar a rotina. A equipe responde com duas ou três opções da vitrine, explica a diferença entre elas em linguagem de balcão e diz o que pode ser retirado hoje e o que precisa ser pedido.",
      ],
      lista: [
        "Notebook para estudo: leve, com boa bateria e SSD",
        "Notebook para trabalho: 16 GB de memória para muitas abas, planilhas e reuniões",
        "Notebook para criar e jogar: processador forte, placa de vídeo e tela com boa cor",
      ],
    },
    {
      tipo: "comparativo",
      titulo: "O que cada uso pede de verdade",
      texto: "A conta que fazemos com você antes de indicar um modelo.",
      colunas: ["Uso", "O que precisa ter", "Onde dá para economizar"],
      linhas: [
        ["Estudo", "SSD, 8 a 16 GB de memória, bateria que aguenta o dia, pouco peso", "Placa de vídeo dedicada e tela de alta taxa de atualização"],
        ["Trabalho e escritório", "16 GB de memória, SSD, tela Full HD, teclado confortável, webcam razoável", "Processador de topo: um intermediário atual dá conta"],
        ["Design e edição", "Processador forte, 16 a 32 GB, SSD de 512 GB ou mais, tela com boa reprodução de cor", "Visual gamer e luzes no teclado"],
        ["Jogos", "Placa de vídeo dedicada, 16 GB, boa refrigeração, tela de 144 Hz ou mais", "Peso e bateria: notebook gamer vive perto da tomada"],
        ["Programação", "16 GB ou mais, SSD rápido, processador com vários núcleos, tela confortável", "Placa de vídeo, salvo para quem trabalha com IA ou jogos"],
      ],
    },
    { tipo: "especial", id: "vitrine-notebooks" },
    {
      tipo: "beneficios",
      titulo: "A ficha técnica em linguagem de balcão",
      texto: "Seis itens decidem se o notebook vai ser bom no seu dia a dia. O resto da ficha é detalhe.",
      itens: [
        {
          titulo: "Processador",
          texto: "É o motor. Para estudo e escritório, um modelo intermediário de geração recente basta. Edição de vídeo, jogos e programação pesada pedem os modelos mais fortes da linha. Geração nova costuma valer mais que um nome maior de geração antiga.",
        },
        {
          titulo: "Memória RAM",
          texto: "É a mesa de trabalho: quanto mais memória, mais coisas abertas ao mesmo tempo sem travar. Hoje, 8 GB é o mínimo para uso leve; 16 GB é o ponto certo para quase todo mundo. Pergunte se a memória do modelo pode ser ampliada depois.",
        },
        {
          titulo: "SSD",
          texto: "É onde ficam o sistema e os arquivos. SSD é o que faz o notebook ligar e abrir programas rápido. 256 GB serve para quem guarda tudo na nuvem; 512 GB é mais folgado para fotos, programas e jogos.",
        },
        {
          titulo: "Tela",
          texto: "Full HD é o mínimo para não cansar a vista. Painel IPS tem cor e ângulo de visão melhores. Quem joga ganha com 144 Hz; quem edita foto e vídeo deve olhar a fidelidade de cor. Tela fosca reflete menos.",
        },
        {
          titulo: "Bateria",
          texto: "A autonomia anunciada é medida em teste leve; no uso real ela é menor. Notebooks finos com processador de baixo consumo e MacBooks com chip Apple são os que mais aguentam longe da tomada.",
        },
        {
          titulo: "Peso",
          texto: "Até cerca de 1,5 kg o notebook vai na mochila sem incomodar. Modelos gamer de 15 ou 16 polegadas passam de 2 kg, fora a fonte, que costuma ser grande. Se vai carregar todo dia, peso entra na conta.",
        },
      ],
    },
    {
      tipo: "passos",
      titulo: "Do WhatsApp ao notebook na sua mão",
      texto: "Você decide com o aparelho ligado na frente, não por foto de anúncio.",
      itens: [
        { titulo: "Conte o uso", texto: "Pelo assistente acima ou direto no WhatsApp: o que vai fazer, o que pesa mais e a faixa que tem em mente." },
        { titulo: "Receba as opções", texto: "Duas ou três indicações com a diferença explicada, e a informação do que tem para retirar hoje e do que precisa ser pedido." },
        { titulo: "Veja ligado", texto: "No balcão do Cambuí você liga, testa teclado, tela e som e tira as dúvidas com quem vende e com quem conserta." },
        { titulo: "Leve pronto", texto: "Pague com 10% de desconto no Pix ou parcele em até 10x sem juros no cartão. Se precisar de configuração, combine com a equipe." },
      ],
    },
    {
      tipo: "texto",
      titulo: "Depois da compra, a assistência continua no mesmo endereço",
      paragrafos: [
        "Comprar notebook em loja que também tem bancada faz diferença nos anos seguintes. Se um dia precisar de mais memória, de um SSD maior, de limpeza interna ou de troca de bateria, você volta ao mesmo balcão, com quem já conhece o seu modelo. O notebook novo tem a garantia do fabricante, e a equipe orienta o caminho quando for preciso acioná-la.",
        "Alguns modelos da vitrine saem de fábrica com Linux ou KeepOS, que deixam o preço mais baixo. Se você precisa de Windows, a loja instala e ativa uma licença original: veja a página de licenças Microsoft. E se o notebook antigo ainda funciona, ele pode virar dinheiro pela consignação da loja.",
      ],
      lista: [
        "Upgrade de memória e SSD feito na bancada da loja, quando o modelo permite",
        "Windows e Office originais instalados e ativados",
        "Carregadores e fontes de notebook no balcão",
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Qual notebook comprar para estudar?",
      resposta:
        "Para estudo, priorize SSD, 8 a 16 GB de memória, boa bateria e pouco peso. Placa de vídeo dedicada não é necessária, a não ser que o curso use programas de 3D, engenharia ou edição de vídeo. Conte o curso no WhatsApp e a equipe indica os modelos que dão conta.",
    },
    {
      pergunta: "8 GB de memória RAM ainda é suficiente em notebook?",
      resposta:
        "Serve para uso leve, como navegador, documentos e vídeo. Para trabalho com muitas abas, planilhas grandes, reuniões e programas de edição, 16 GB é o ponto certo hoje. Pergunte se o modelo aceita ampliação de memória, porque nem todos aceitam.",
    },
    {
      pergunta: "SSD de 256 GB é pouco?",
      resposta:
        "Depende de quanto você guarda no notebook. Para quem usa nuvem e programas leves, 256 GB atende; para fotos, vídeos, jogos e programas pesados, 512 GB ou mais evita aperto. Em vários modelos dá para trocar o SSD depois na bancada da loja.",
    },
    {
      pergunta: "Posso ver o notebook ligado antes de comprar?",
      resposta:
        "Sim. No balcão do Cambuí você liga, testa e tira dúvidas antes de pagar. Como parte da vitrine é pedida ao fornecedor quando a venda sai, pergunte no WhatsApp o que tem para retirar hoje e combine a visita.",
    },
    {
      pergunta: "O notebook veio com Linux ou KeepOS. Dá para colocar Windows?",
      resposta:
        "Dá. A loja instala e ativa o Windows 11 original no notebook, e você pode sair com ele pronto para usar. Peça junto com a compra no WhatsApp ou no balcão.",
    },
    {
      pergunta: "Qual é a garantia do notebook?",
      resposta:
        "Notebook novo tem a garantia do fabricante e sai com nota fiscal. Compra fechada pelo site ou pelo WhatsApp também tem 7 dias de arrependimento, como prevê o Código de Defesa do Consumidor.",
    },
    {
      pergunta: "Dá para parcelar o notebook?",
      resposta:
        "Sim, em até 10x sem juros no cartão, fechando pelo WhatsApp ou no balcão. No Pix o desconto é de 10%; pedido feito pelo site termina no Pix, com o QR code na tela.",
    },
  ],
  temas: ["notebook", "compra", "upgrade", "ssd", "memoria", "assistencia", "apple", "licenca"],
  termosDoBlog: ["notebook", "escolher notebook", "ssd", "memória ram", "macbook", "bateria", "notebook gamer"],
  relacionadas: ["manutencao", "microsoft", "carregadores", "consignacao"],
  final: {
    titulo: "Conte para que é o notebook e receba as opções",
    texto: "Uma mensagem com o uso e o que pesa mais já basta para a equipe indicar os modelos certos. Depois, é só ver ligado na loja da Av. Anchieta, no Cambuí.",
    botao: "Pedir indicação de notebook",
  },
};
