import type { PaginaDeCaptacao } from "../tipos";

// Sobre nós. Ângulo: o porquê e o como da loja, para quem quer saber se vale
// confiar o computador ou a compra à Balão. Loja de bairro no Cambuí que vende
// e conserta, mostra funcionando antes de cobrar e é atendida por quem entende
// do que vende. Os dados formais (CNPJ, endereço, contatos) ficam na
// /sobre-a-empresa.
// A página antiga falava em "mais de 20 anos", missão de "liderar o mercado",
// "principal parceira de tecnologia no Brasil", "melhores marcas" e "cumprimos
// prazos": sem base, tudo fora. Nada de ano de fundação, nomes, prêmios ou
// números além dos confirmados.

const foto = (slug: string) => `/images/landing/v2/${slug}.jpg`;
export const sobreNos: PaginaDeCaptacao = {
  slug: "sobre-nos",
  nome: "Sobre a Balão",
  chamada: "Loja de bairro no Cambuí que vende e conserta, e mostra funcionando antes de você pagar.",
  seo: {
    titulo: "Sobre a Balão da Informática: loja e assistência no Cambuí, Campinas",
    descricao:
      "Mais de 25 anos de Balão da Informática em Campinas: loja de bairro no Cambuí que vende e conserta, mostra funcionando antes de cobrar e atende pelo WhatsApp.",
    palavras: [
      "Balão da Informática Campinas história",
      "loja de informática tradicional em Campinas",
      "loja de informática de bairro no Cambuí",
      "loja de informática com assistência técnica própria Campinas",
      "loja de informática confiável Campinas",
      "onde comprar computador e consertar no mesmo lugar Campinas",
      "Balão da Informática Castelo",
      "loja de informática na Av. Anchieta Campinas",
      "assistência técnica de confiança Cambuí",
    ],
  },
  hero: {
    contexto: "Mais de 25 anos de Balão da Informática em Campinas",
    titulo: "Uma loja de bairro que vende, conserta e mostra funcionando",
    texto:
      "A Balão é uma loja de informática de rua no Cambuí, com a bancada técnica no mesmo endereço do balcão. Você vê o produto ligado antes de pagar, fala com quem entende do que vende e, se algo der errado depois, sabe exatamente onde voltar.",
    imagem: {
      src: "/images/landing/v2/sobre-nos.jpg",
      alt: "Balcão da loja com um PC gamer ligado em luz vermelha e duas mãos apontando para ele",
    },
    mensagem: "Olá! Vim pela página sobre a Balão e quero conversar com a equipe.",
    botao: "Falar com a equipe",
    secundario: { rotulo: "Como a gente trabalha", href: "#secao-1" },
    fatos: [
      { valor: "Mais de 25 anos", rotulo: "de marca em Campinas" },
      { valor: "700+", rotulo: "avaliações no Google" },
      { valor: "Loja e bancada", rotulo: "no mesmo endereço, no Cambuí" },
      { valor: "Teste antes", rotulo: "você vê ligado antes de pagar" },
    ],
  },
  assistente: {
    titulo: "Como podemos ajudar?",
    texto: "Escolha e a mensagem chega para a pessoa certa da loja.",
    abertura: "Olá! Vim pela página sobre a Balão.",
    fecho: "Posso mandar foto do que preciso?",
    botao: "Enviar para a loja",
    perguntas: [
      {
        rotulo: "Preciso",
        pergunta: "O que você precisa hoje?",
        opcoes: ["Comprar um produto", "Consertar um aparelho", "Vender um usado", "Sistema ou site para a empresa"],
      },
      {
        rotulo: "Atendimento",
        pergunta: "Como prefere ser atendido?",
        opcoes: ["Pelo WhatsApp", "Vou passar na loja"],
      },
    ],
  },
  secoes: [
    {
      tipo: "beneficios",
      titulo: "O nosso jeito de trabalhar",
      texto: "Não é uma lista de valores na parede. São as coisas que acontecem todo dia no balcão do Cambuí.",
      itens: [
        {
          titulo: "Você vê funcionando antes de pagar",
          texto: "PC e notebook são ligados e testados na sua frente. Na montagem sob medida, o PC é testado antes de ir para você.",
        },
        {
          titulo: "Quem atende entende do que vende",
          texto: "A mesma equipe vende e conserta. Por isso a pergunta sobre compatibilidade, upgrade ou uso tem resposta concreta.",
        },
        {
          titulo: "Orçamento antes do serviço",
          texto: "Na assistência, nada é feito sem você aprovar. Se o conserto não compensa, você ouve isso antes de gastar.",
        },
        {
          titulo: "Você sabe onde voltar",
          texto: "Loja de rua, com endereço e telefone fixo. Se algo der problema, a bancada fica no mesmo lugar onde você comprou.",
        },
        {
          titulo: "Retira na hora",
          texto: "Quando o produto está na loja, você sai com ele. Em Campinas e região, o motoboy leva, combinado pelo WhatsApp.",
        },
        {
          titulo: "Atendimento pelo WhatsApp da loja",
          texto: "Quem responde é a equipe, vendedor ou dono. Quando ninguém está disponível, a vendedora digital adianta o atendimento.",
        },
      ],
      imagem: { src: "/images/apple/hub-hero-real.png", alt: "Balcão de atendimento da Balão da Informática com a marca da loja na parede" },
    },
    {
      tipo: "texto",
      titulo: "Uma marca de Campinas há mais de 25 anos",
      paragrafos: [
        "A Balão da Informática está em Campinas há mais de 25 anos. Nesse tempo o que se vende mudou muito, do computador de mesa ao notebook fino, ao console e ao celular, mas o jeito de atender continuou o mesmo: balcão aberto, gente que entende do assunto e o produto ligado na frente do cliente.",
        "Hoje a loja fica na Av. Anchieta, no Cambuí. É uma loja de bairro: muita gente chega a pé, traz o notebook que esquentou, pergunta qual SSD serve ou passa para ver um PC gamer funcionando antes de decidir. A bancada técnica fica no mesmo endereço, e é isso que faz a diferença no dia a dia. Quem vende uma peça sabe se ela vai funcionar no seu aparelho, porque é a mesma equipe que instala.",
        "Juntar loja e assistência também muda a conversa sobre conserto. Quando o reparo não compensa, o técnico diz isso antes de você gastar e mostra as alternativas, novas ou seminovas. E quando o aparelho antigo ainda tem valor, ele pode ir para a vitrine da loja em consignação.",
      ],
    },
    {
      tipo: "texto",
      titulo: "Uma loja pequena que roda em sistemas próprios",
      paragrafos: [
        "O site que você está lendo, o catálogo com preços atualizados, o CRM que organiza as conversas do WhatsApp, o caixa do balcão e o painel de vendas foram feitos pela própria equipe da Balão. Não foi para parecer moderna: foi para responder mais rápido, manter o catálogo do site atualizado e organizar as conversas do WhatsApp para que nenhuma se perca.",
        "Essa experiência virou serviço. A mesma equipe cria sites, lojas virtuais e sistemas para outras empresas, e o primeiro cliente é a própria loja.",
      ],
      lista: [
        "Site e catálogo com preços atualizados",
        "CRM de WhatsApp com vendedora digital",
        "Caixa do balcão com nota fiscal",
        "Painel de vendas",
      ],
      imagem: { src: "/pc_campanha.jpg", alt: "Mesa com PC de vidro iluminado e três monitores com código e gráficos na tela" },
      lado: "esquerda",
    },
    {
      tipo: "atalhos",
      titulo: "O que fazemos no dia a dia",
      texto: "Cada serviço tem uma página com os detalhes e o atalho para o WhatsApp.",
      itens: [
        { titulo: "Assistência de notebook e PC", texto: "Diagnóstico e orçamento antes de mexer.", href: "/manutencao", imagem: foto("manutencao") },
        { titulo: "Reparo Apple", texto: "iPhone, iPad, MacBook, iMac, Mac mini e Apple Watch.", href: "/reparoapple", imagem: foto("reparoapple") },
        { titulo: "Montagem de PC sob medida", texto: "Peças do estoque, montado e testado na loja.", href: "/montagempc", imagem: foto("montagempc") },
        { titulo: "Notebooks", texto: "Para ver ligados no balcão antes de escolher.", href: "/notebooks", imagem: foto("notebooks") },
        { titulo: "Consignação de usados", texto: "A loja expõe e vende o seu usado.", href: "/consignacao", imagem: foto("consignacao") },
        { titulo: "Sites e sistemas", texto: "Feitos pela equipe que fez os da Balão.", href: "/sistemas", imagem: foto("sistemas") },
      ],
    },
    {
      tipo: "loja",
      titulo: "Venha conhecer o balcão",
      texto: "A melhor forma de saber como a gente trabalha é passar na loja. Traga o aparelho, a dúvida ou a lista do que precisa.",
    },
  ],
  perguntas: [
    {
      pergunta: "Há quanto tempo a Balão da Informática existe?",
      resposta:
        "A marca Balão da Informática está em Campinas há mais de 25 anos. Hoje a loja fica na Av. Anchieta, 789, no Cambuí, com a assistência técnica no mesmo endereço.",
    },
    {
      pergunta: "A Balão vende e conserta no mesmo lugar?",
      resposta:
        "Sim. O balcão de vendas e a bancada técnica ficam na mesma loja, no Cambuí. Por isso dá para comprar uma peça e sair com ela instalada, ou consertar o aparelho e já ver o substituto se o reparo não compensar.",
    },
    {
      pergunta: "Posso testar o produto antes de pagar?",
      resposta:
        "Pode. PC e notebook são ligados e testados no balcão antes do pagamento. Avise pelo WhatsApp que está vindo para a equipe separar o que você quer ver.",
    },
    {
      pergunta: "Quem responde no WhatsApp da loja?",
      resposta:
        "A equipe da loja, vendedor ou dono. Quando ninguém da equipe está disponível, uma vendedora digital adianta o atendimento e passa a conversa para uma pessoa.",
    },
    {
      pergunta: "A Balão é uma rede ou franquia?",
      resposta:
        "Não. É uma loja de rua no Cambuí, em Campinas, com uma única loja física. Vende também pelo site www.balao.info e pelo WhatsApp, com entrega na região e envio para outras cidades.",
    },
    {
      pergunta: "Onde vejo as avaliações dos clientes?",
      resposta:
        "No Google: a loja tem mais de 700 avaliações públicas, que você pode ler antes de vir. O link fica na faixa logo abaixo do topo desta página.",
    },
  ],
  temas: ["compra", "assistencia", "empresa", "sistemas", "usados"],
  termosDoBlog: ["campinas", "cambuí", "loja de informática", "assistência", "manutenção"],
  relacionadas: ["sobre-a-empresa", "manutencao", "como-comprar", "envio-e-entrega"],
  final: {
    titulo: "Diga o que precisa, a equipe responde",
    texto: "Pelo WhatsApp da loja ou no balcão da Av. Anchieta, no Cambuí. Comprar, consertar ou só tirar uma dúvida.",
    botao: "Chamar a equipe",
  },
};
