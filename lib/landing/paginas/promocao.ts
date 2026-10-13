import type { PaginaDeCaptacao } from "../tipos";

export const promocao: PaginaDeCaptacao = {
  slug: "promocao",
  nome: "Promoções de informática",
  chamada: "Só o que baixou de preço de verdade, com o \"de / por\" que estava no site, e o que tem para levar hoje.",
  seo: {
    titulo: "Promoção de informática em Campinas: preços que baixaram | Balão",
    descricao:
      "Ofertas de informática em Campinas com queda de preço real (\"de / por\" do próprio site), pronta entrega no Cambuí, monitores, SSDs e periféricos.",
    palavras: [
      "promoção de informática em Campinas",
      "ofertas de monitor em Campinas",
      "SSD em promoção Campinas",
      "queda de preço em eletrônicos",
      "loja de informática com pronta entrega Campinas",
      "periféricos gamer em oferta Campinas",
      "desconto no Pix informática Campinas",
      "onde comprar SSD barato em Campinas",
      "promoção de headset e teclado gamer",
      "ofertas de informática no Cambuí",
    ],
  },
  hero: {
    contexto: "Ofertas da loja do Cambuí, em Campinas",
    titulo: "Pague menos no que você já ia comprar",
    texto:
      "Aqui só entra oferta que dá para conferir: produtos cujo preço baixou no site nos últimos dias, com o valor de antes ao lado, e o que está na loja para levar hoje. Se o que você procura não está aqui, peça para a equipe avisar quando baixar.",
    imagem: {
      src: "/images/landing/v2/promocao.jpg",
      alt: "Pirâmide de caixas pretas e brancas sem marca sob luz vermelha, com headset e mouse ao lado",
    },
    mensagem: "Olá! Vim pela página de promoções da Balão e quero ser avisado quando um produto baixar de preço.",
    botao: "Me avise quando baixar",
    secundario: { rotulo: "Ver o que baixou", href: "#secao-1" },
    fatos: [
      { valor: "De / por real", rotulo: "o \"de\" é o preço que estava no site" },
      { valor: "10% no Pix", rotulo: "de desconto no pagamento à vista" },
      { valor: "Até 10x", rotulo: "sem juros no cartão, pelo WhatsApp ou no balcão" },
      { valor: "Pronta entrega", rotulo: "retire na loja do Cambuí" },
    ],
  },
  assistente: {
    titulo: "Receba a oferta certa, não todas",
    texto: "Diga o que procura e a equipe avisa quando aparecer preço bom nisso.",
    abertura: "Olá! Vim pela página de promoções e quero ser avisado de ofertas.",
    fecho: "Se já tiver um modelo em mente, posso mandar o nome ou o link?",
    botao: "Quero ser avisado",
    perguntas: [
      {
        rotulo: "Procuro",
        pergunta: "O que você está procurando?",
        varias: true,
        opcoes: ["Notebook", "PC gamer ou peças", "Monitor", "SSD ou memória", "Teclado, mouse ou headset", "Console e controle", "Celular ou tablet", "Impressora e toner"],
      },
      {
        rotulo: "Faixa",
        pergunta: "Que tipo de compra é?",
        opcoes: ["Algo de entrada", "Intermediário", "Topo de linha", "Ainda não sei"],
      },
      {
        rotulo: "Avisos",
        pergunta: "Como quer receber?",
        opcoes: ["Só quando baixar o que pedi", "Ofertas desse tipo de produto", "Só desta vez"],
      },
    ],
  },
  secoes: [
    {
      tipo: "quedas",
      titulo: "Baixou de preço nesta semana",
      texto:
        "Produtos que ficaram mais baratos no site nos últimos sete dias. O preço riscado é o que estava aqui antes; se voltar a subir, o produto sai da lista.",
      limite: 12,
    },
    {
      tipo: "vitrine",
      titulo: "Para levar hoje",
      texto:
        "Estes produtos vêm de fornecedores de Campinas e aparecem com a faixa \"Pronta entrega\". Pergunte no WhatsApp: muitas vezes dá para retirar no mesmo dia na loja do Cambuí.",
      regras: [
        {
          id: "pronta-entrega",
          titulo: "Pronta entrega no Cambuí",
          subtitulo: "Armazenamento, games, rede e energia de fornecedor local",
          soProntaEntrega: true,
          categorias: [
            "Hardware/SSD",
            "Armazenamento/HD e SSD Externo",
            "Armazenamento/Pen Drive",
            "Armazenamento/Cartão de Memória",
            "Games/Playstation",
            "Games/Xbox",
            "Games/Nintendo",
            "Games/Consoles",
            "Conectividade/Dispositivo de Rede",
            "Conectividade/Switch",
            "Energia/Nobreak",
          ],
          excluir: ["cabo", "adaptador", "capa", "pelicula", "suporte", "case"],
          precoMin: 150,
          porMarca: 2,
          limite: 12,
        },
      ],
    },
    {
      tipo: "vitrine",
      titulo: "Fileiras que mais saem",
      texto: "Monitor, SSD e periférico: três compras em que vale a pena esperar o preço certo. Os preços acompanham o catálogo do site.",
      regras: [
        {
          id: "monitores",
          titulo: "Monitores para trabalho e jogo",
          subtitulo: "De 22 a 32 polegadas, Full HD e QHD",
          categorias: ["Computadores/Monitores"],
          excluir: ["suporte", "braco", "cabo"],
          precoMin: 600,
          precoMax: 1800,
          ordem: "menor",
          porMarca: 2,
          limite: 12,
        },
        {
          id: "ssds",
          titulo: "SSD para acelerar o computador",
          subtitulo: "SATA para computadores mais antigos, NVMe para quem tem slot M.2",
          categorias: ["Hardware/SSD/SSD PCIe NVMe", "Hardware/SSD/SSD SATA", "Hardware/SSD/SSD M.2 SATA"],
          excluir: ["externo", "portatil", "case", "gaveta", "adaptador", "dissipador", "128gb"],
          precoMin: 300,
          precoMax: 1500,
          ordem: "menor",
          porMarca: 2,
          limite: 12,
          verTodos: { rotulo: "Ver todos os SSDs, com filtros", href: "/categoria/hardware-ssd" },
        },
        {
          id: "perifericos",
          titulo: "Teclado, mouse e headset",
          subtitulo: "Para jogar e para o escritório",
          categorias: ["Periféricos/Teclados", "Periféricos/Mouses", "Periféricos/Kits Teclado e Mouse", "Áudio/Headset"],
          excluir: ["mousepad", "cabo", "adaptador", "suporte"],
          precoMin: 250,
          precoMax: 1400,
          porMarca: 2,
          limite: 12,
        },
      ],
    },
    {
      tipo: "regras",
      titulo: "Como funcionam as ofertas daqui",
      texto: "Promoção só vale se dá para confiar nela. Estas são as regras desta página.",
      itens: [
        {
          titulo: "O \"de\" é o preço que estava no site",
          texto: "A lista de quedas compara o preço de hoje com o preço que o mesmo produto tinha aqui antes. Nada de preço de mercado inventado para parecer desconto.",
          pontos: [
            "Entra quando baixa pelo menos 2%, para não mostrar oscilação de centavos",
            "Fica na lista por sete dias depois da última queda",
            "Se o preço voltar a subir, sai na hora",
          ],
        },
        {
          titulo: "Como pagar",
          texto: "O desconto de 10% no Pix vale para a compra à vista. O pedido feito pelo site termina no Pix, com o QR code na tela.",
          pontos: [
            "Para parcelar em até 10x sem juros no cartão, feche pelo WhatsApp ou no balcão",
            "Pagamento na loja do Cambuí, de segunda a sábado",
          ],
        },
        {
          titulo: "Preço e estoque mudam",
          texto: "Os preços acompanham os fornecedores e são relidos várias vezes ao dia. Antes de sair de casa, confirme pelo WhatsApp se o produto continua com o mesmo valor e disponível.",
        },
        {
          titulo: "Garantia de produto novo",
          texto: "Produto novo tem a garantia do fabricante. Compra feita pelo site ou pelo WhatsApp tem 7 dias de arrependimento, como prevê o Código de Defesa do Consumidor.",
        },
      ],
    },
    {
      tipo: "texto",
      titulo: "Como saber se uma promoção é boa de verdade",
      paragrafos: [
        "O desconto que aparece no anúncio diz pouco. O que importa é quanto o produto custava há alguns dias e quanto ele custa hoje. Muita \"promoção\" de data especial é só o preço voltando ao normal depois de uma alta. Por isso a lista de quedas desta página só usa o preço que o próprio site mostrava antes, e não um valor de referência qualquer.",
        "Em informática os preços mudam rápido: dólar, lançamento de geração nova e estoque do fornecedor mexem no valor de SSD, memória, placa de vídeo e monitor de uma semana para outra. Quem tem um modelo em mente costuma economizar mais esperando a queda do que comprando no primeiro anúncio. É para isso que serve o aviso pelo WhatsApp: você diz o que quer e a equipe chama quando o preço baixar.",
        "Antes de fechar, compare a especificação e não só o preço. Dois SSDs de 1 TB podem ter velocidades muito diferentes; dois monitores de 27 polegadas podem ter painel, resolução e taxa de atualização diferentes. Se ficar em dúvida entre duas ofertas, mande os dois links no WhatsApp e a equipe diz qual atende melhor o seu uso.",
      ],
      lista: [
        "Confira o \"de / por\" e a data em que o preço baixou",
        "Compare a especificação, não só o tamanho ou a capacidade",
        "Some o desconto do Pix ao preço da oferta antes de decidir",
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "As promoções da Balão são reais?",
      resposta:
        "Sim. A lista de quedas mostra só produtos cujo preço baixou no próprio site nos últimos sete dias, e o preço riscado é o que estava aqui antes. Se o preço volta a subir, o produto sai da lista.",
    },
    {
      pergunta: "Como ser avisado quando um produto baixar de preço?",
      resposta:
        "Chame no WhatsApp e diga o produto ou o tipo de produto que você quer. A equipe avisa quando aparecer um preço bom nisso, sem mandar oferta de tudo.",
    },
    {
      pergunta: "O desconto do Pix vale para produto em promoção?",
      resposta:
        "O pagamento no Pix tem 10% de desconto. Na hora de fechar, confirme o valor final pelo WhatsApp ou no balcão, porque preço e condição podem mudar ao longo do dia.",
    },
    {
      pergunta: "Posso parcelar a oferta no cartão?",
      resposta:
        "Pode, em até 10x sem juros. O pedido pelo site termina no Pix; para parcelar, feche a compra pelo WhatsApp ou no balcão da loja.",
    },
    {
      pergunta: "O que quer dizer \"Pronta entrega\"?",
      resposta:
        "É o produto que vem de fornecedor de Campinas e costuma estar disponível para retirar rápido. Pergunte no WhatsApp antes de ir: muitas vezes dá para retirar no mesmo dia na loja do Cambuí.",
    },
    {
      pergunta: "Vocês entregam as ofertas em Campinas e região?",
      resposta:
        "Sim, por motoboy em Campinas, Valinhos, Vinhedo, Paulínia, Sumaré, Hortolândia e região. O valor e o horário são combinados pelo WhatsApp.",
    },
  ],
  temas: ["ofertas", "compra", "entrega", "ssd", "pc", "pcgamer", "notebook", "games"],
  termosDoBlog: ["ssd", "monitor", "upgrade", "placa de vídeo", "memória ram", "pc gamer", "vale a pena"],
  relacionadas: ["pcgamer", "notebooks", "envio-e-entrega", "como-comprar"],
  final: {
    titulo: "Diga o que você quer e espere o preço baixar",
    texto: "Um produto ou um tipo de produto basta. A equipe avisa pelo WhatsApp e separa na loja do Cambuí, na Av. Anchieta.",
    botao: "Quero ser avisado",
    mensagem: "Olá! Quero ser avisado quando baixar o preço de: ",
  },
};
