import type { PaginaDeCaptacao } from "../tipos";

// Envio e entrega. Ângulo: quem já escolheu o produto e quer saber quando e
// como ele chega. Três jeitos de receber, sem prazo prometido: a entrega local
// é combinada pelo WhatsApp e o frete de fora sai no carrinho pelo CEP.
// A página antiga prometia "Centro de Distribuição", "3 tentativas", "Minha
// Conta" e rastreio por e-mail; nada disso existe e ficou de fora.
export const envioEEntrega: PaginaDeCaptacao = {
  slug: "envio-e-entrega",
  nome: "Envio e entrega",
  chamada: "Retire no Cambuí, receba por motoboy em Campinas e região ou calcule o frete pelo CEP.",
  seo: {
    titulo: "Entrega em Campinas e região, retirada no Cambuí e envio | Balão",
    descricao:
      "Retire na loja do Cambuí, receba por motoboy em Campinas, Valinhos, Paulínia, Sumaré e região ou calcule o frete pelo CEP. Quer hoje? Chame no WhatsApp.",
    palavras: [
      "entrega de informática em Campinas",
      "entrega por motoboy Campinas",
      "retirar na loja Cambuí Campinas",
      "loja de informática com entrega no mesmo dia Campinas",
      "pronta entrega Campinas informática",
      "entrega de eletrônicos Valinhos",
      "entrega de informática Paulínia e Sumaré",
      "entrega Hortolândia e Vinhedo informática",
      "frete loja de informática Campinas",
      "comprar SSD e retirar hoje Campinas",
    ],
  },
  hero: {
    contexto: "Loja no Cambuí, em Campinas, com entrega na região",
    titulo: "Seu produto na mão do jeito mais rápido para você",
    texto:
      "Retire no balcão da Av. Anchieta, receba por motoboy em Campinas e região ou peça o envio para outra cidade com o frete calculado pelo CEP. Quer receber hoje? Mande o produto e o seu CEP no WhatsApp e a equipe diz o que dá para fazer.",
    imagem: {
      src: "/images/landing/v2/envio-e-entrega.jpg",
      alt: "Mãos passando uma caixa de papelão sobre o balcão da loja, com uma moto de entrega estacionada do lado de fora",
    },
    mensagem: "Olá! Vim pela página de envio e entrega da Balão. Quero receber hoje: vou mandar o produto e o meu CEP.",
    botao: "Quero receber hoje",
    secundario: { rotulo: "Ver o que tem pronta entrega", href: "#vitrine" },
    fatos: [
      { valor: "Retirada", rotulo: "no balcão do Cambuí, quando o produto está na loja" },
      { valor: "Motoboy", rotulo: "em Campinas e região, combinado no WhatsApp" },
      { valor: "Frete pelo CEP", rotulo: "para outras cidades, no carrinho do site" },
      { valor: "Pronta entrega", rotulo: "faixa nos produtos de fornecedor da região" },
    ],
  },
  assistente: {
    titulo: "Dá para receber hoje?",
    texto: "Responda e a equipe confere disponibilidade e entrega de uma vez.",
    abertura: "Olá! Vim pela página de envio e entrega e quero saber como recebo o meu pedido.",
    fecho: "Vou mandar o link ou a foto do produto e o meu CEP.",
    botao: "Perguntar pelo WhatsApp",
    perguntas: [
      {
        rotulo: "Produto",
        pergunta: "O que você quer receber?",
        opcoes: ["Produto que vi no site", "Peça ou acessório", "Notebook ou PC", "Console ou controle", "Ainda vou escolher"],
      },
      {
        rotulo: "Onde",
        pergunta: "Para onde vai?",
        opcoes: ["Campinas", "Valinhos ou Vinhedo", "Paulínia, Sumaré ou Hortolândia", "Outra cidade"],
      },
      {
        rotulo: "Como",
        pergunta: "Como prefere receber?",
        opcoes: ["Retirar na loja", "Entrega por motoboy", "Envio pelo CEP", "O que for mais rápido"],
      },
    ],
  },
  secoes: [
    {
      tipo: "regras",
      titulo: "Três jeitos de receber",
      texto:
        "O jeito certo depende de onde você está e de onde o produto está. Em qualquer um deles, uma mensagem no WhatsApp antes evita viagem perdida.",
      itens: [
        {
          titulo: "Retirar na loja",
          texto:
            "Quando o produto está na loja do Cambuí, você retira na hora. Dá para ver ligado, conferir a caixa e sair com a nota fiscal.",
          pontos: [
            "Confirme pelo WhatsApp que o produto está separado antes de vir",
            "Av. Anchieta, 789, Cambuí: seg. a sex. 9h às 18h, sáb. 9h às 13h",
            "Paga no balcão no Pix ou no cartão em até 10x sem juros",
          ],
        },
        {
          titulo: "Entrega por motoboy em Campinas e região",
          texto:
            "Para Campinas, Valinhos, Vinhedo, Paulínia, Sumaré, Hortolândia e cidades vizinhas, a entrega é feita por motoboy e combinada pelo WhatsApp.",
          pontos: [
            "A equipe confirma o produto, o endereço e o custo da entrega",
            "Pergunte: muitas vezes sai no mesmo dia, conforme o horário e a disponibilidade",
            "Combine quem vai receber e um telefone para o motoboy",
          ],
        },
        {
          titulo: "Envio para outras cidades",
          texto:
            "Fora da região, o pedido é enviado e o frete é calculado no carrinho do site, a partir do CEP. As opções e o prazo de transporte aparecem antes de você fechar.",
          pontos: [
            "Coloque o produto no carrinho e digite o CEP para ver o frete",
            "O pedido do site é pago no Pix, com o QR code na tela",
            "Para acompanhar, chame no WhatsApp com o número do pedido",
          ],
        },
        {
          titulo: "Não sabe qual escolher?",
          texto:
            "Mande o produto e o CEP no WhatsApp. A equipe diz onde o produto está, se dá para retirar ou entregar hoje e quanto fica a entrega.",
        },
      ],
    },
    {
      tipo: "passos",
      titulo: "Quer receber hoje? O caminho mais curto",
      texto: "Sem cadastro e sem formulário: é uma conversa com a equipe da loja.",
      itens: [
        { titulo: "Mande o produto e o CEP", texto: "O link do site, uma foto ou só o nome do produto. Com o CEP a equipe já calcula a entrega." },
        { titulo: "A equipe confere", texto: "Se o produto está na loja ou no fornecedor da região, e qual é o horário possível para retirar ou entregar." },
        { titulo: "Você paga", texto: "Pix com 10% de desconto ou cartão em até 10x sem juros, combinado na conversa ou no balcão." },
        { titulo: "Retira ou recebe", texto: "Você passa no balcão do Cambuí ou o motoboy leva até o endereço combinado." },
      ],
    },
    {
      tipo: "vitrine",
      titulo: "Pronta entrega: o que costuma sair mais rápido",
      texto:
        "Produtos com a faixa Pronta entrega vêm de fornecedores aqui da região, por isso costumam estar disponíveis para retirar ou entregar logo. Confirme no WhatsApp antes de sair de casa.",
      regras: [
        {
          id: "games",
          titulo: "Games: controles, volantes e acessórios",
          subtitulo: "PlayStation, Xbox e Nintendo Switch para retirar ou receber",
          categorias: ["Games/Consoles", "Games/Playstation", "Games/Xbox", "Games/Nintendo"],
          excluir: ["case", "capa", "pelicula", "suporte", "cabo"],
          soProntaEntrega: true,
          precoMin: 600,
          limite: 10,
          porMarca: 3,
          verTodos: { rotulo: "Ver tudo o que está em pronta entrega", href: "/?pronta=1" },
        },
        {
          id: "audio",
          titulo: "Som e headset",
          subtitulo: "Caixas de som, fones Bluetooth e headsets",
          categorias: ["Áudio/Caixa de Som", "Áudio/Headset", "Áudio/Fone de Ouvido"],
          excluir: ["airpods", "cx"],
          soProntaEntrega: true,
          precoMin: 300,
          limite: 10,
          porMarca: 3,
        },
        {
          id: "armazenamento",
          titulo: "SSD, HD externo e pen drive",
          subtitulo: "Para o upgrade de hoje ou para o backup",
          categorias: ["Hardware/SSD", "Armazenamento/HD e SSD Externo", "Armazenamento/Pen Drive"],
          soProntaEntrega: true,
          precoMin: 150,
          limite: 10,
        },
        {
          id: "perifericos",
          titulo: "Teclado e mouse",
          subtitulo: "Mecânicos, gamer e kits sem fio",
          categorias: ["Periféricos/Teclados", "Periféricos/Mouses", "Periféricos/Kits Teclado e Mouse"],
          soProntaEntrega: true,
          precoMin: 200,
          limite: 10,
        },
        {
          id: "tablets-relogios",
          titulo: "Tablets e smartwatches",
          subtitulo: "Para presente ou para trocar hoje",
          categorias: ["Tablets, iPads e E-readers/Tablets", "Celular & Smartphone/Wearables"],
          excluir: ["watch ultra"],
          soProntaEntrega: true,
          precoMin: 400,
          limite: 10,
        },
        {
          id: "rede",
          titulo: "Roteadores e repetidores",
          subtitulo: "Para o Wi-Fi que não alcança a casa toda",
          categorias: ["Conectividade/Dispositivo de Rede"],
          soProntaEntrega: true,
          precoMin: 300,
          limite: 8,
        },
      ],
    },
    {
      tipo: "comparativo",
      titulo: "Onde você está e o jeito mais rápido",
      texto: "Uma referência para começar a conversa. O horário e o produto mudam a resposta; a equipe confirma no WhatsApp.",
      colunas: ["Você está em", "O jeito mais rápido", "Como combinar"],
      linhas: [
        ["Cambuí e centro de Campinas", "Retirar no balcão ou motoboy", "Mande o produto; a loja fica na Av. Anchieta"],
        ["Outros bairros de Campinas", "Motoboy", "Mande o produto e o CEP no WhatsApp"],
        ["Valinhos, Vinhedo, Paulínia, Sumaré, Hortolândia", "Motoboy ou retirada no Cambuí", "Pergunte o custo e o horário da entrega"],
        ["Outra cidade ou estado", "Envio pelo site", "Frete e prazo aparecem no carrinho pelo CEP"],
      ],
    },
    {
      tipo: "texto",
      titulo: "Por que alguns produtos chegam mais rápido que outros",
      paragrafos: [
        "O catálogo do site reúne produtos que estão na loja, produtos de fornecedores aqui da região e produtos que vêm de distribuidores de fora. Os que vêm de fornecedor da região aparecem com a faixa Pronta entrega: são os que costumam estar disponíveis para retirar ou para o motoboy levar no mesmo dia. Os demais podem levar mais tempo para chegar à loja, e a equipe informa o prazo antes de você pagar.",
        "Na entrega local, o que define o horário é a combinação entre o produto estar separado, o endereço e o movimento do dia. Por isso a loja não promete prazo fixo na página: pergunte no WhatsApp e você recebe uma resposta concreta para o seu caso. Em boa parte dos pedidos de Campinas e região dá para receber no mesmo dia.",
        "Na hora de receber, confira a embalagem antes de assinar ou de dispensar o entregador. Se a caixa vier amassada, aberta ou molhada, fotografe e chame no WhatsApp logo em seguida. Isso vale para a entrega por motoboy e para o envio de fora, e acelera qualquer troca.",
      ],
      lista: [
        "Faixa Pronta entrega: fornecedor da região, costuma sair mais rápido",
        "Produto sem a faixa: a equipe informa o prazo antes do pagamento",
        "Caixa danificada na entrega: foto antes de abrir e mensagem no WhatsApp",
      ],
    },
    {
      tipo: "loja",
      titulo: "Prefere retirar? O balcão é aqui",
      texto:
        "Avise no WhatsApp que está vindo e a equipe deixa o produto separado. Dá para ver funcionando, tirar dúvida e sair com a nota fiscal.",
    },
  ],
  perguntas: [
    {
      pergunta: "Vocês entregam no mesmo dia em Campinas?",
      resposta:
        "Muitas vezes sim, mas depende do produto e do horário do pedido. Mande o produto e o seu CEP no WhatsApp: a equipe confere se ele está na loja ou no fornecedor da região e combina a entrega por motoboy.",
    },
    {
      pergunta: "Quais cidades recebem entrega por motoboy?",
      resposta:
        "Campinas e cidades da região, como Valinhos, Vinhedo, Paulínia, Sumaré e Hortolândia. Para outros endereços próximos, pergunte no WhatsApp; o custo é combinado conforme o endereço.",
    },
    {
      pergunta: "Posso comprar e retirar na loja?",
      resposta:
        "Pode. Confirme pelo WhatsApp que o produto está na loja, peça para separar e retire no balcão da Av. Anchieta, 789, no Cambuí. Você paga no Pix ou no cartão em até 10x sem juros e sai com a nota fiscal.",
    },
    {
      pergunta: "Como calculo o frete para outra cidade?",
      resposta:
        "Coloque o produto no carrinho do site e digite o CEP: as opções de envio e o prazo de transporte aparecem antes de você fechar o pedido. O pedido feito pelo site é pago no Pix, com o QR code na tela.",
    },
    {
      pergunta: "O que significa a faixa Pronta entrega?",
      resposta:
        "Significa que o produto vem de um fornecedor aqui da região. Por isso ele costuma estar disponível rápido para retirar ou para a entrega local; ainda assim, confirme no WhatsApp antes de sair de casa.",
    },
    {
      pergunta: "Como acompanho o meu pedido?",
      resposta:
        "Chame no WhatsApp da loja com o número do pedido ou o seu nome. A equipe informa em que pé está a separação, a entrega ou o envio.",
    },
    {
      pergunta: "O produto chegou com a caixa danificada. E agora?",
      resposta:
        "Fotografe a embalagem antes de abrir e mande no WhatsApp junto com o número do pedido. A equipe orienta a troca; veja também a página de trocas e devoluções.",
    },
  ],
  temas: ["entrega", "compra", "ofertas", "garantia"],
  termosDoBlog: ["entrega", "frete", "pronta entrega", "campinas", "comprar"],
  relacionadas: ["como-comprar", "trocas-e-devolucoes", "promocao", "carregadores"],
  final: {
    titulo: "Quer receber hoje? Mande o produto e o CEP",
    texto:
      "Com essas duas informações a equipe responde se dá para retirar no Cambuí, mandar por motoboy ou enviar pelo CEP, e quanto fica.",
    botao: "Mandar produto e CEP",
  },
};
