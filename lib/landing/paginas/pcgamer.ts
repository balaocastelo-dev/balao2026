import type { PaginaDeCaptacao } from "../tipos";

export const pcgamer: PaginaDeCaptacao = {
  slug: "pcgamer",
  nome: "PC gamer pronto",
  chamada: "PC gamer no Cambuí: escolha pelo jogo, veja ligado na loja e retire no balcão quando estiver em estoque.",
  seo: {
    titulo: "PC Gamer em Campinas: Veja Rodando e Leve Hoje | Balão da Informática Anchieta",
    descricao:
      "PC gamer pronto no Cambuí: escolha pelo seu jogo, veja rodando na loja e leve hoje. 10% no Pix ou 10x sem juros. Fale no WhatsApp.",
    palavras: [
      "PC gamer pronto em Campinas",
      "comprar PC gamer no Cambuí",
      "PC gamer RTX 5060 Campinas",
      "PC gamer para jogar em 1440p",
      "PC gamer para 4K qual placa de vídeo",
      "PC gamer Ryzen 7 Campinas",
      "quanto de VRAM preciso para jogar",
      "PC gamer com monitor Campinas",
      "PC gamer parcelado sem juros Campinas",
      "loja de PC gamer em Campinas",
      "PC gamer para Valinhos, Paulínia e Sumaré",
    ],
    tipoDeServico: "Venda de computadores gamer montados",
  },
  hero: {
    contexto: "PC gamer pronto no Cambuí, em Campinas",
    titulo: "O PC gamer certo para o seu monitor e os seus jogos",
    texto:
      "As máquinas estão separadas pela placa de vídeo, que é o que decide a resolução e o FPS. Escolha a fileira do seu jogo, tire a dúvida no WhatsApp e veja o PC ligado na loja antes de pagar.",
    imagem: {
      src: "/images/landing/v2/pcgamer.jpg",
      alt: "PC gamer com lateral de vidro e luz vermelha ao lado de um monitor curvo mostrando uma paisagem de jogo",
    },
    mensagem:
      "Olá! Quero um PC gamer para jogar ____ em monitor ____. Meu orçamento é de até R$ ____. Quais vocês têm pronta entrega?",
    botao: "Ver pronta entrega no WhatsApp",
    secundario: { rotulo: "Como escolher a placa de vídeo", href: "#secao-2" },
    fatos: [
      { valor: "Veja ligado", rotulo: "e teste antes de pagar" },
      { valor: "10% no Pix", rotulo: "ou até 10x sem juros no cartão" },
      { valor: "Retire na hora", rotulo: "quando o PC está na loja" },
      { valor: "Entrega local", rotulo: "Campinas e região, combinada no WhatsApp" },
    ],
  },
  assistente: {
    titulo: "Qual PC gamer serve para você?",
    texto: "Diga o que joga e em que tela: o vendedor responde com as opções certas.",
    abertura:
      "Olá! Quero um PC gamer para jogar ____ em monitor ____. Meu orçamento é de até R$ ____. Quais vocês têm pronta entrega?",
    fecho: "Pode me mandar duas ou três opções com fotos?",
    botao: "Pedir indicação",
    perguntas: [
      {
        rotulo: "Jogos",
        pergunta: "O que você mais joga?",
        varias: true,
        opcoes: [
          "Competitivos (CS2, Valorant, LoL, Fortnite)",
          "Lançamentos pesados",
          "Mundo aberto e simuladores",
          "Jogos leves e emuladores",
          "Jogo e também faço lives ou edito vídeo",
        ],
      },
      {
        rotulo: "Monitor",
        pergunta: "Em que tela você vai jogar?",
        opcoes: ["1080p (Full HD)", "1440p (QHD)", "4K", "Monitor de alta taxa (144 Hz ou mais)", "Ainda não tenho monitor"],
      },
      { rotulo: "Faixa", pergunta: "Quanto quer investir?", opcoes: ["Entrada", "Intermediário", "Alto desempenho", "Sem limite"] },
    ],
  },
  secoes: [
    { tipo: "especial", id: "fileiras-pcgamer" },
    {
      tipo: "texto",
      titulo: "Como escolher um PC gamer: comece pela placa de vídeo",
      paragrafos: [
        "Em jogo, quem desenha cada quadro na tela é a placa de vídeo. É ela que decide em qual resolução você joga e com quantos quadros por segundo (FPS). Por isso as fileiras desta página estão separadas pela memória da placa (a VRAM): é o jeito mais rápido de achar o PC que acompanha o seu monitor.",
        "A VRAM guarda as texturas e os efeitos do jogo. Quando ela acaba, o jogo não fecha, mas engasga: aparecem travadas curtas e texturas borradas, mesmo com o FPS médio alto. Em 1080p, 8 GB ainda rodam a maioria dos jogos com ajustes; lançamentos pesados já pedem mais. Em 1440p, o mais tranquilo é ter 12 GB ou mais. Em 4K, a conversa começa nos 16 GB.",
        "Depois da placa vem o processador. Em jogos competitivos, com FPS alto em 1080p, ele pesa mais, porque precisa preparar muitos quadros por segundo; em 4K, quem limita é quase sempre a placa. Um Ryzen 5 ou Core i5 atual acompanha bem as placas intermediárias; Ryzen 7, Ryzen 9 e Core i7 ou i9 fazem sentido com placas de topo, em jogos que usam muito o processador ou para quem também faz live e edita vídeo.",
        "Por fim, memória e fonte. Para jogar hoje, 16 GB de RAM é o ponto de partida e 32 GB dão folga para jogo com navegador, Discord e gravação abertos. A fonte precisa entregar a potência da placa de vídeo com sobra e ter boa eficiência: é a peça que mais derruba PC gamer quando é fraca.",
      ],
    },
    {
      tipo: "comparativo",
      titulo: "Placa de vídeo para cada resolução",
      texto: "Um ponto de partida para escolher a fileira. O vendedor confere com os jogos que você mais joga.",
      colunas: ["Resolução do monitor", "Memória de vídeo (VRAM) recomendada", "Para quem é"],
      linhas: [
        ["1080p, jogos leves e competitivos", "Vídeo integrado a 6 GB", "Quem joga LoL, Valorant, CS2 e Fortnite em qualidade média"],
        ["1080p, lançamentos", "8 GB, de preferência 12 GB", "Quem quer jogos novos em qualidade alta"],
        ["1440p", "12 a 16 GB", "Quem tem monitor QHD e quer imagem mais nítida sem perder fluidez"],
        ["4K ou alta taxa em 1440p", "16 GB ou mais", "Quem quer o máximo de qualidade ou monitor de 240 Hz em QHD"],
      ],
    },
    {
      tipo: "beneficios",
      titulo: "Por que comprar na loja física e não num site nacional",
      texto: "O PC é caro e tem muitas peças. Comprar perto de casa muda o que acontece depois.",
      itens: [
        {
          titulo: "Você vê funcionando",
          texto: "O PC é ligado na loja para você conferir antes de pagar. Quando ele já está aqui, você leva na hora.",
        },
        {
          titulo: "Dá para ajustar a configuração",
          texto: "Quer mais memória, um SSD maior ou outra placa? O vendedor diz o que dá para trocar e quanto muda.",
        },
        {
          titulo: "Suporte no mesmo endereço",
          texto: "A assistência técnica fica na loja. Upgrade, limpeza e garantia são resolvidos no mesmo balcão do Cambuí.",
        },
        {
          titulo: "Pagamento sem complicação",
          texto: "10% de desconto no Pix ou até 10x sem juros no cartão, fechando pelo WhatsApp ou no balcão.",
        },
      ],
    },
    {
      tipo: "texto",
      titulo: "Garantia, nota fiscal e upgrade depois",
      paragrafos: [
        "PC comprado aqui sai com nota fiscal. A peça nova segue a garantia de quem a fabricou. O serviço de montagem, quando entra, segue a garantia legal. O prazo de cada peça não é um número único: está na nota e na conversa, e a loja não publica um prazo genérico nesta página.",
        "Upgrade depois acontece no mesmo balcão do Cambuí. Memória, SSD, placa e limpeza não exigem mandar o computador para outra cidade. A página de montagem e a de upgrade de notebook explicam os serviços vizinhos.",
      ],
    },
    {
      tipo: "texto",
      titulo: "Pagamento e entrega",
      paragrafos: [
        "10% de desconto no Pix ou até 10x sem juros no cartão, fechando pelo WhatsApp ou no balcão, como no resto da loja. Pedido pelo site termina no Pix.",
        "Retirada no balcão quando o PC está na loja. Entrega por motoboy em Campinas, Sumaré, Hortolândia, Valinhos e região: preço e prazo confirmados pelo WhatsApp. Não há frete fixo publicado aqui.",
      ],
    },
    {
      tipo: "retorno",
      titulo: "Pedir retorno rápido",
      texto: "Jogo, faixa e monitor. A equipe responde quais PCs dá para ver ligados.",
      assunto: "PC gamer pronto",
      campos: [
        { nome: "jogo", rotulo: "Qual jogo você mais joga?" },
        { nome: "orcamento", rotulo: "Orçamento aproximado", opcoes: ["Até 3 mil", "Até 5 mil", "Até 8 mil", "Acima de 8 mil"] },
        { nome: "monitor", rotulo: "Monitor", opcoes: ["Full HD", "2K", "144 Hz", "Não sei"] },
      ],
    },
    {
      tipo: "vitrine",
      titulo: "Monitor gamer para acompanhar o PC",
      texto:
        "Não adianta placa para 144 FPS num monitor de 60 Hz. Se ainda não tem monitor, escolha junto: a resolução e a taxa de atualização dele dizem qual fileira de PC faz sentido.",
      regras: [
        {
          id: "monitor-1080p",
          titulo: "Monitores Full HD de alta taxa",
          subtitulo: "Para jogos competitivos em 1080p",
          categorias: ["Computadores/Monitores/Monitor Gamer"],
          nomeContem: ["full hd", "fhd"],
          precoMax: 4000,
          ordem: "menor",
          limite: 10,
        },
        {
          id: "monitor-1440p",
          titulo: "Monitores QHD e 4K",
          subtitulo: "Para quem quer imagem mais nítida com placa de 12 GB ou mais",
          categorias: ["Computadores/Monitores/Monitor Gamer"],
          nomeContem: ["qhd", "quad hd", "2k", "4k", "uhd"],
          precoMax: 7000,
          ordem: "menor",
          limite: 10,
        },
      ],
    },
    {
      tipo: "atalhos",
      titulo: "Não achou a configuração exata?",
      texto: "Se nenhuma fileira bate com o que você precisa, a loja monta do zero ou mostra como cada peça trabalha.",
      itens: [
        {
          titulo: "Qual PC gamer comprar",
          texto: "As faixas de 3, 5 e 8 mil, sem FPS inventado.",
          href: "/qual-pc-gamer",
          imagem: "/images/landing/v2/pcgamer.jpg",
        },
        {
          titulo: "Montagem de PC sob medida",
          texto: "Diga o uso e a faixa de orçamento; a loja escolhe as peças e monta.",
          href: "/montagempc",
          imagem: "/images/landing/v2/montagempc.jpg",
        },
        {
          titulo: "Monte o seu PC",
          texto: "Outro caminho para fechar a configuração.",
          href: "/monteseupc",
        },
        {
          titulo: "Overclock",
          texto: "Sistema da loja para quem vende informática.",
          href: "/overclock",
        },
        {
          titulo: "Seminovos",
          texto: "Quando a faixa pede máquina revisada.",
          href: "/seminovos",
        },
        {
          titulo: "Envio e entrega",
          texto: "Motoboy em Campinas e região.",
          href: "/envio-e-entrega",
          imagem: "/images/landing/v2/envio-e-entrega.jpg",
        },
        {
          titulo: "Como comprar",
          texto: "Pix, cartão e retirada no balcão.",
          href: "/como-comprar",
          imagem: "/images/landing/v2/como-comprar.jpg",
        },
        {
          titulo: "PC gamer por dentro, em 3D",
          texto: "Gire o modelo e veja o papel de cada peça antes de escolher.",
          href: "/pcgamer3d",
        },
        {
          titulo: "Ofertas da semana",
          texto: "Produtos que baixaram de preço de verdade.",
          href: "/promocao",
        },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Onde comprar PC gamer em Campinas e testar antes?",
      resposta:
        "Na Balão da Informática Anchieta, na Av. Anchieta, 789, Cambuí, o PC é ligado na loja para você testar antes de pagar e, se estiver em estoque, sai na hora. Agendamento pelo WhatsApp (19) 98751-0267.",
    },
    {
      pergunta: "A loja entrega PC gamer em Sumaré, Hortolândia ou Valinhos?",
      resposta:
        "Sim, a entrega por motoboy em Campinas e região é combinada pelo WhatsApp. Preço e prazo confirmados pelo WhatsApp.",
    },
    {
      pergunta: "Quais formas de pagamento para PC gamer?",
      resposta:
        "10% de desconto no Pix ou até 10x sem juros no cartão, com nota fiscal e garantia do fabricante nas peças.",
    },
    {
      pergunta: "Qual placa de vídeo eu preciso para jogar em 1440p?",
      resposta:
        "Para 1440p, o mais tranquilo é uma placa com 12 GB de VRAM ou mais. Com 8 GB dá para jogar muitos títulos, mas os lançamentos pesados pedem reduzir texturas. Mande os jogos que você joga e o vendedor indica a fileira certa.",
    },
    {
      pergunta: "8 GB de VRAM ainda servem?",
      resposta:
        "Servem para 1080p na maioria dos jogos, com ajustes nos lançamentos mais pesados. Para 1440p, 4K ou para quem quer o PC atualizado por mais tempo, 12 ou 16 GB fazem diferença. O blog da Balão tem testes comparando as duas versões da mesma placa.",
    },
    {
      pergunta: "Ryzen ou Intel para jogar?",
      resposta:
        "As duas marcas têm boas opções; o que importa é o processador estar à altura da placa de vídeo. Em jogos competitivos com FPS alto, processadores com mais cache e núcleos rápidos ajudam. Por isso a página também separa os PCs por Ryzen 5, 7 e 9.",
    },
    {
      pergunta: "Quanta memória RAM um PC gamer precisa?",
      resposta:
        "16 GB é o ponto de partida para jogar hoje. 32 GB dão folga para quem deixa navegador, Discord e gravação abertos junto com o jogo, ou faz live e edita vídeo.",
    },
    {
      pergunta: "Posso ver o PC funcionando antes de comprar?",
      resposta:
        "Pode. O PC é ligado na loja do Cambuí para você conferir antes de pagar, e quando ele já está aqui você leva na hora. Se preferir receber em casa, a entrega em Campinas e região é combinada pelo WhatsApp.",
    },
    {
      pergunta: "Dá para trocar uma peça da configuração?",
      resposta:
        "Muitas vezes, sim: mais memória, SSD maior ou outra placa de vídeo. Pergunte no WhatsApp; se a mudança for grande, a montagem sob medida costuma ser o melhor caminho.",
    },
    {
      pergunta: "Como funciona o pagamento e a garantia?",
      resposta:
        "No Pix há 10% de desconto; no cartão, até 10x sem juros fechando pelo WhatsApp ou no balcão. Cada peça segue a garantia do fabricante e, na compra a distância, você tem 7 dias de arrependimento.",
    },
  ],
  temas: ["pcgamer", "pc", "games", "compra", "entrega", "garantia", "upgrade"],
  termosDoBlog: ["pc gamer", "placa de vídeo", "vram", "rtx", "fps", "processador", "memória ram", "fonte", "steam"],
  tituloDasPerguntas: "Perguntas frequentes",
  relacionadas: ["qual-pc-gamer", "montagempc", "pcgamer3d", "promocao"],
  final: {
    titulo: "Diga o que você joga e em que tela",
    texto:
      "Com isso o vendedor separa duas ou três opções da vitrine, com fotos. A loja fica na Av. Anchieta, no Cambuí, e você vê o PC ligado antes de pagar.",
    botao: "Escolher meu PC gamer",
  },
};
