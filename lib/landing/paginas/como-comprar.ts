import type { PaginaDeCaptacao } from "../tipos";

// Como comprar. Ângulo: quem achou o produto e está decidindo POR ONDE fechar.
// Três caminhos com vantagens diferentes (site no Pix com desconto, WhatsApp
// para parcelar e tirar dúvida, balcão para ver ligado) e as provas de que a
// loja existe (CNPJ, endereço, nota fiscal).
// A página antiga dizia "100% seguro", cartão em 12x, boleto, login com
// e-mail e senha e e-mail de confirmação; nada disso vale hoje e saiu.
export const comoComprar: PaginaDeCaptacao = {
  slug: "como-comprar",
  nome: "Como comprar",
  chamada: "Pelo site no Pix com 10% de desconto, pelo WhatsApp em até 10x sem juros ou no balcão do Cambuí.",
  seo: {
    titulo: "Como comprar na Balão: site, WhatsApp ou loja no Cambuí, Campinas",
    descricao:
      "Compre pelo site no Pix com 10% de desconto, pelo WhatsApp em até 10x sem juros no cartão ou no balcão do Cambuí, em Campinas, vendo o produto funcionando.",
    palavras: [
      "como comprar na Balão da Informática",
      "loja de informática confiável em Campinas",
      "comprar notebook parcelado sem juros Campinas",
      "desconto no Pix loja de informática",
      "comprar pelo WhatsApp loja de informática",
      "loja de informática no Cambuí",
      "balao.info é confiável",
      "comprar PC gamer e testar antes Campinas",
      "loja de informática com nota fiscal Campinas",
      "parcelar em 10x sem juros informática Campinas",
    ],
  },
  hero: {
    contexto: "Loja de informática no Cambuí, em Campinas, e no site",
    titulo: "Escolha o jeito de comprar que combina com você",
    texto:
      "Pelo site, o pedido termina no Pix com 10% de desconto. Pelo WhatsApp, você fala com a equipe, tira dúvida de compatibilidade e parcela em até 10x sem juros no cartão. No balcão do Cambuí, vê funcionando, testa e já sai com o produto.",
    imagem: {
      src: "/images/landing/v2/como-comprar.jpg",
      alt: "Mãos segurando um smartphone sobre a mesa, ao lado de uma caixinha lacrada e de um notebook aberto",
    },
    mensagem: "Olá! Vim pela página de como comprar da Balão e quero fechar uma compra pelo WhatsApp.",
    botao: "Comprar pelo WhatsApp",
    secundario: { rotulo: "Comparar os três jeitos", href: "#secao-1" },
    fatos: [
      { valor: "10% no Pix", rotulo: "em pedido do site, com QR code na tela" },
      { valor: "10x sem juros", rotulo: "no cartão, pelo WhatsApp ou no balcão" },
      { valor: "Nota fiscal", rotulo: "em toda compra, com CNPJ da loja" },
      { valor: "Loja física", rotulo: "Av. Anchieta, 789, no Cambuí" },
    ],
  },
  assistente: {
    titulo: "Fechar pelo WhatsApp",
    texto: "Responda e a mensagem já chega pronta para o vendedor.",
    abertura: "Olá! Vim pela página de como comprar e quero fechar uma compra.",
    fecho: "Vou mandar o link ou o nome do produto.",
    botao: "Enviar para o vendedor",
    perguntas: [
      {
        rotulo: "O que procura",
        pergunta: "O que você quer comprar?",
        opcoes: ["Notebook", "PC ou PC gamer", "Peça para upgrade", "Console ou acessório", "Periférico", "Outro produto"],
      },
      {
        rotulo: "Pagamento",
        pergunta: "Como prefere pagar?",
        opcoes: ["Pix com desconto", "Cartão em até 10x", "Ainda não sei"],
      },
      {
        rotulo: "Recebimento",
        pergunta: "Como quer receber?",
        opcoes: ["Retirar no Cambuí", "Entrega em Campinas e região", "Envio para outra cidade"],
      },
    ],
  },
  secoes: [
    {
      tipo: "comparativo",
      titulo: "Site, WhatsApp ou balcão: o que muda",
      texto: "Os três caminhos levam ao mesmo catálogo e à mesma equipe. O que muda é a forma de pagar e o quanto você quer conversar antes.",
      colunas: ["O que muda", "Pelo site", "Pelo WhatsApp ou no balcão"],
      linhas: [
        ["Pagamento", "Pix com 10% de desconto, QR code na tela", "Pix com 10% de desconto ou cartão em até 10x sem juros"],
        ["Ajuda na escolha", "Você escolhe sozinho pelo catálogo e filtros", "A equipe confere compatibilidade e indica opções"],
        ["Ver funcionando", "Pelas fotos e pela ficha do produto", "No balcão, ligado e testado antes de pagar"],
        ["Receber", "Frete calculado pelo CEP no carrinho", "Retirada na hora ou motoboy combinado em Campinas e região"],
        ["Melhor para", "Quem já sabe o que quer e paga no Pix", "Quem quer parcelar, tirar dúvida ou levar hoje"],
      ],
    },
    {
      tipo: "regras",
      titulo: "Os três caminhos, passo a passo",
      itens: [
        {
          titulo: "Pelo site",
          texto: "Para quem já sabe o que quer e vai pagar no Pix.",
          pontos: [
            "Coloque o produto no carrinho",
            "Digite o CEP para calcular o frete e escolha a opção de envio",
            "Preencha seus dados e o endereço e confirme o pedido",
            "Pague no Pix pelo QR code que aparece na tela, com 10% de desconto",
          ],
        },
        {
          titulo: "Pelo WhatsApp",
          texto: "Para parcelar no cartão, tirar dúvida ou pedir indicação.",
          pontos: [
            "Mande o link do produto ou conte o que precisa",
            "A equipe confere estoque, compatibilidade e prazo",
            "Pague no Pix com desconto ou no cartão em até 10x sem juros",
            "Combine a retirada, o motoboy ou o envio",
          ],
        },
        {
          titulo: "No balcão do Cambuí",
          texto: "Para ver funcionando e sair com o produto na mão.",
          pontos: [
            "Av. Anchieta, 789: seg. a sex. 9h às 18h, sáb. 9h às 13h",
            "Peça para ligar e testar antes de pagar",
            "Pague no Pix ou no cartão em até 10x sem juros",
            "Saia com o produto e a nota fiscal",
          ],
        },
        {
          titulo: "Não achou no site?",
          texto:
            "O catálogo é grande, mas não tem tudo. Mande no WhatsApp o modelo que procura: a equipe diz se consegue e em quanto tempo.",
        },
      ],
    },
    {
      tipo: "quedas",
      titulo: "Para começar: o que baixou de preço esta semana",
      texto: "Produtos cujo preço caiu de verdade nos últimos dias, com o preço de antes ao lado. Dá para fechar pelo site, pelo WhatsApp ou no balcão.",
      limite: 8,
    },
    {
      tipo: "texto",
      titulo: "Como saber se a loja é de verdade antes de comprar",
      paragrafos: [
        "Comprar tecnologia pela internet exige um cuidado básico: saber quem está do outro lado. A Balão da Informática tem nome empresarial e CNPJ públicos (Balão da Informática Castelo, CNPJ 34.397.947/0001-08), endereço físico aberto ao público na Av. Anchieta, 789, no Cambuí, e mais de 700 avaliações no Google que qualquer pessoa pode ler antes de comprar.",
        "Toda compra sai com nota fiscal, seja pelo site, pelo WhatsApp ou no balcão. No Pix, confira que o recebedor é a Balão da Informática Castelo antes de confirmar o pagamento. Se tiver qualquer dúvida sobre um pedido, um link ou uma mensagem que diga ser da loja, ligue para (19) 3255-1661 ou chame no WhatsApp oficial (19) 98751-0267.",
        "Outra vantagem de comprar de uma loja com endereço: se o produto der problema, você sabe onde levar. A assistência técnica fica no mesmo endereço e avalia o produto no balcão, e a política de trocas segue o Código de Defesa do Consumidor.",
      ],
      lista: [
        "CNPJ 34.397.947/0001-08, Balão da Informática Castelo",
        "Loja física na Av. Anchieta, 789, Cambuí, Campinas",
        "Nota fiscal em toda compra",
        "Mais de 700 avaliações públicas no Google",
      ],
      imagem: { src: "/images/apple/hub-hero-real.png", alt: "Balcão de atendimento da Balão da Informática com a marca da loja na parede" },
      lado: "esquerda",
    },
    {
      tipo: "atalhos",
      titulo: "Antes de fechar, vale ler",
      itens: [
        { titulo: "Envio e entrega", texto: "Retirada, motoboy em Campinas e região e frete pelo CEP.", href: "/envio-e-entrega" },
        { titulo: "Trocas e devoluções", texto: "Os 7 dias de desistência e a garantia legal, explicados.", href: "/trocas-e-devolucoes" },
        { titulo: "Sobre a empresa", texto: "CNPJ, endereço, horário e contatos da loja.", href: "/sobre-a-empresa" },
        { titulo: "Queda de preço", texto: "Todos os produtos que baixaram de preço nos últimos dias.", href: "/queda-de-preco" },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "A Balão da Informática é confiável?",
      resposta:
        "Sim: é uma loja física no Cambuí, em Campinas, com mais de 25 anos de marca, CNPJ 34.397.947/0001-08 e mais de 700 avaliações no Google. Toda compra sai com nota fiscal, e você pode visitar a loja antes de comprar.",
    },
    {
      pergunta: "Como funciona o desconto no Pix?",
      resposta:
        "O pagamento no Pix tem 10% de desconto. No site, o pedido termina com o QR code na tela; pelo WhatsApp ou no balcão, a equipe passa a chave ou o QR code da loja.",
    },
    {
      pergunta: "Dá para parcelar no cartão?",
      resposta:
        "Dá, em até 10x sem juros. O parcelamento no cartão é feito pelo WhatsApp ou no balcão da loja; o pedido feito pelo site é pago no Pix.",
    },
    {
      pergunta: "Preciso criar conta para comprar pelo site?",
      resposta:
        "Não. No carrinho você informa o CEP, seus dados de contato e o endereço de entrega, confirma o pedido e paga no Pix pelo QR code na tela.",
    },
    {
      pergunta: "Posso ver o produto funcionando antes de pagar?",
      resposta:
        "Pode, no balcão da Av. Anchieta, 789. Peça para ligar e testar; com PC e notebook isso é o padrão da loja. Avise no WhatsApp antes para a equipe separar o produto.",
    },
    {
      pergunta: "Como sei se uma peça é compatível com o meu computador?",
      resposta:
        "Mande no WhatsApp o modelo do seu computador ou uma foto da etiqueta e o link da peça. A equipe confere antes da compra; se preferir, traga a máquina e a bancada instala na loja.",
    },
    {
      pergunta: "A compra sai com nota fiscal?",
      resposta: "Sim, toda compra sai com nota fiscal em nome de Balão da Informática Castelo, seja pelo site, pelo WhatsApp ou no balcão.",
    },
  ],
  temas: ["compra", "entrega", "ofertas", "garantia"],
  termosDoBlog: ["comprar", "vale a pena", "como escolher", "pix", "campinas"],
  relacionadas: ["envio-e-entrega", "trocas-e-devolucoes", "promocao", "notebooks"],
  final: {
    titulo: "Achou o produto? Feche do seu jeito",
    texto:
      "Mande o link no WhatsApp para parcelar ou tirar dúvida, finalize no site pelo Pix ou passe no balcão do Cambuí para ver funcionando.",
    botao: "Fechar pelo WhatsApp",
  },
};
