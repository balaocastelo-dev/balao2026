import type { PaginaDeCaptacao } from "../tipos";

// Trocas e devoluções. Ângulo: quem já comprou e tem um problema (desistiu,
// veio com defeito, chegou avariado) e quer saber, sem juridiquês, o que a lei
// garante e como pedir. Base: CDC arts. 18, 26 e 49. O diferencial é a bancada
// técnica no mesmo endereço, que avalia o produto na hora.
// A página antiga mostrava o e-mail sac@balaodainformatica.com.br (errado),
// "Fale Conosco", "postagem reversa sem custo" e "análise técnica de até 30
// dias" com troca por produto novo: nada disso foi confirmado e saiu. O canal
// é WhatsApp, telefone e balcão.
export const trocasEDevolucoes: PaginaDeCaptacao = {
  slug: "trocas-e-devolucoes",
  nome: "Trocas e devoluções",
  chamada: "Desistiu da compra ou o produto deu defeito? O que a lei garante e como pedir pelo WhatsApp.",
  seo: {
    titulo: "Trocas, devoluções e garantia em Campinas | Balão da Informática",
    descricao:
      "Desistência em 7 dias na compra pelo site ou WhatsApp, garantia legal de 90 dias e avaliação do defeito na bancada do Cambuí. Peça a troca pelo WhatsApp.",
    palavras: [
      "trocas e devoluções Balão da Informática",
      "direito de arrependimento 7 dias compra online",
      "produto com defeito o que fazer Campinas",
      "garantia legal 90 dias produto durável",
      "trocar produto com defeito loja de informática Campinas",
      "devolver produto comprado pelo WhatsApp",
      "garantia de notebook Campinas",
      "produto chegou quebrado o que fazer",
      "Código de Defesa do Consumidor troca de produto",
      "assistência técnica garantia Cambuí",
    ],
  },
  hero: {
    contexto: "Política de trocas da loja do Cambuí, em Campinas",
    titulo: "Problema com a compra? A gente resolve com você, como manda a lei",
    texto:
      "Desistiu da compra feita pelo site ou pelo WhatsApp, o produto veio com defeito ou chegou avariado: mande o número do pedido e fotos no WhatsApp, ou traga à loja. A bancada técnica fica no mesmo endereço e avalia o produto na hora.",
    imagem: {
      src: "/images/landing/v2/trocas-e-devolucoes.jpg",
      alt: "Mãos com luvas conferindo um notebook aberto sobre a bancada, ao lado da caixa original",
    },
    mensagem: "Olá! Vim pela página de trocas e devoluções da Balão e preciso de ajuda com uma compra.",
    botao: "Pedir troca ou devolução",
    secundario: { rotulo: "Ver os prazos da lei", href: "#secao-1" },
    fatos: [
      { valor: "7 dias", rotulo: "para desistir da compra feita fora da loja" },
      { valor: "90 dias", rotulo: "de garantia legal em produto durável e serviço" },
      { valor: "+ fabricante", rotulo: "a garantia do fabricante soma à legal" },
      { valor: "Bancada", rotulo: "avaliação técnica no mesmo endereço" },
    ],
  },
  assistente: {
    titulo: "Conte o que aconteceu",
    texto: "Duas respostas e a equipe já sabe por onde começar.",
    abertura: "Olá! Vim pela página de trocas e devoluções e preciso resolver uma compra.",
    fecho: "Vou mandar o número do pedido ou da nota e fotos do produto.",
    botao: "Enviar para a equipe",
    perguntas: [
      {
        rotulo: "Motivo",
        pergunta: "O que aconteceu?",
        opcoes: ["Desisti da compra", "O produto deu defeito", "Chegou avariado na entrega", "Dúvida sobre a garantia"],
      },
      {
        rotulo: "Onde comprou",
        pergunta: "Onde foi a compra?",
        opcoes: ["Pelo site", "Pelo WhatsApp", "No balcão da loja"],
      },
    ],
  },
  secoes: [
    {
      tipo: "regras",
      titulo: "O que a lei garante, em palavras simples",
      texto:
        "A política da Balão segue o Código de Defesa do Consumidor. Cada situação tem um prazo e um caminho diferente.",
      itens: [
        {
          titulo: "Desistência em 7 dias (compra fora da loja)",
          texto:
            "Comprou pelo site ou pelo WhatsApp sem vir à loja? Você pode desistir em até 7 dias a contar do recebimento, sem precisar explicar o motivo. Os valores pagos são devolvidos (art. 49 do CDC).",
          pontos: [
            "Vale para compra feita a distância: site e WhatsApp",
            "Devolva o produto com a caixa, os acessórios e a nota fiscal",
            "Avise dentro do prazo pelo WhatsApp com o número do pedido",
          ],
        },
        {
          titulo: "Produto com defeito: garantia legal",
          texto:
            "Produto durável, como notebook, SSD ou console, tem 90 dias de garantia legal para reclamar de defeito; serviço também tem 90 dias (art. 26 do CDC). A garantia do fabricante vem somada a esse prazo.",
          pontos: [
            "Garantia legal: 90 dias para produto durável e para serviço",
            "Garantia do fabricante: o prazo que vem na caixa ou no manual",
            "Vale para compra no site, no WhatsApp ou no balcão",
          ],
        },
        {
          titulo: "Prazo para resolver o defeito",
          texto:
            "Pela lei, o fornecedor tem até 30 dias para resolver o defeito (art. 18 do CDC). Se não resolver nesse prazo, você pode escolher entre a troca por outro produto igual, a devolução do valor pago ou o abatimento do preço.",
        },
        {
          titulo: "Avaria na entrega",
          texto:
            "Se a caixa chegou amassada, aberta ou molhada, fotografe antes de abrir e mande no WhatsApp logo em seguida, com o número do pedido. A foto do momento da entrega deixa tudo mais simples.",
        },
      ],
    },
    {
      tipo: "passos",
      titulo: "Como pedir a troca ou a devolução",
      texto: "Sem e-mail e sem protocolo perdido: o pedido começa numa conversa com a equipe da loja.",
      itens: [
        {
          titulo: "Chame no WhatsApp",
          texto: "Mande o número do pedido ou da nota fiscal, o que aconteceu e fotos ou vídeo do produto. Se preferir, ligue para (19) 3255-1661.",
        },
        {
          titulo: "Traga ou combine o envio",
          texto: "Em Campinas e região, traga ao balcão do Cambuí ou combine a retirada. De outra cidade, a equipe orienta como devolver.",
        },
        {
          titulo: "A bancada avalia",
          texto: "O técnico testa o produto no mesmo endereço e mostra o que encontrou. Muitas vezes o diagnóstico sai na hora.",
        },
        {
          titulo: "Troca, reparo ou devolução",
          texto: "Conforme o caso e o que a lei prevê: reparo, troca por outro igual ou devolução do valor pago.",
        },
      ],
    },
    {
      tipo: "texto",
      titulo: "Por que ter a assistência no mesmo endereço faz diferença",
      paragrafos: [
        "Em boa parte das lojas, um produto com defeito entra numa fila: vai para o fabricante, volta semanas depois e você fica sem saber o que foi feito. Na Balão, o produto é avaliado pela bancada técnica que fica na própria loja do Cambuí. Muitas vezes o técnico encontra a causa na hora, com você no balcão.",
        "Isso ajuda a separar três situações bem diferentes. Às vezes não é defeito: é configuração, driver, um cabo trocado ou uma incompatibilidade que se resolve em minutos. Às vezes é defeito de fabricação, e aí vale a garantia legal e a do fabricante. E às vezes o dano veio de fora, como queda ou líquido, e o caso vira um orçamento de conserto, que você aprova ou não.",
        "Quando o defeito é coberto, a equipe explica o caminho: reparo na loja, troca ou acionamento do fabricante, conforme o produto. Se o fabricante tiver assistência própria, a loja orienta como acionar e acompanha com você pelo WhatsApp.",
      ],
      lista: [
        "Teste do produto na sua frente, sempre que possível",
        "Diagnóstico explicado antes de qualquer decisão",
        "Orientação sobre a garantia do fabricante quando for o caso",
      ],
      imagem: {
        src: "/images/apple/iphone/iphone-interno-reparo.png",
        alt: "Smartphone aberto na mão de um técnico, com a bancada e a marca da Balão da Informática ao fundo",
      },
      lado: "direita",
    },
    {
      tipo: "regras",
      titulo: "Quando a garantia não cobre",
      texto:
        "A garantia cobre defeito de fabricação e falha do serviço. Ela não cobre danos causados depois da entrega. Nesses casos a bancada pode fazer um orçamento de conserto, se você quiser.",
      itens: [
        {
          titulo: "Situações fora da garantia",
          texto: "Estes casos não entram como defeito e são avaliados como conserto:",
          pontos: [
            "Mau uso ou uso fora do que o fabricante indica",
            "Dano físico: queda, pancada, tela trincada, conector forçado",
            "Contato com líquido ou umidade",
            "Lacre de garantia rompido ou aparelho aberto fora da assistência",
          ],
        },
        {
          titulo: "Na desistência em 7 dias",
          texto: "Para devolver por arrependimento, o produto precisa voltar completo, como foi entregue:",
          pontos: [
            "Caixa, manuais, cabos e acessórios que vieram junto",
            "Nota fiscal ou número do pedido",
            "Sem danos causados pelo uso",
          ],
        },
      ],
    },
    {
      tipo: "comparativo",
      titulo: "Qual é o seu caso?",
      texto: "Um resumo para saber por onde começar antes de chamar a equipe.",
      colunas: ["Situação", "O que vale", "O que mandar no WhatsApp"],
      linhas: [
        ["Comprei pelo site ou WhatsApp e desisti", "7 dias para desistir, com devolução dos valores pagos", "Número do pedido e data em que recebeu"],
        ["O produto deu defeito", "Garantia legal de 90 dias e garantia do fabricante", "Número do pedido ou da nota e vídeo do defeito"],
        ["Chegou com a caixa danificada", "Avaliação da avaria na entrega", "Fotos da embalagem e do produto"],
        ["Comprei no balcão e mudei de ideia", "Sem defeito, a troca é combinada com a loja", "Nota fiscal e o que você quer trocar"],
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Qual é o prazo para devolver um produto comprado pela internet?",
      resposta:
        "São 7 dias a contar do recebimento, pelo direito de arrependimento do art. 49 do Código de Defesa do Consumidor. Vale para compra feita fora da loja, como pelo site ou pelo WhatsApp, e os valores pagos são devolvidos. Avise dentro do prazo pelo WhatsApp com o número do pedido.",
    },
    {
      pergunta: "Comprei na loja física. Posso devolver em 7 dias?",
      resposta:
        "O direito de arrependimento da lei vale para compra feita fora da loja. Na compra no balcão, se o produto não tem defeito, a troca é combinada com a equipe; se tem defeito, vale a garantia legal de 90 dias e a do fabricante.",
    },
    {
      pergunta: "Qual é a garantia de um produto com defeito?",
      resposta:
        "Produto durável tem 90 dias de garantia legal para reclamar de defeito, pelo art. 26 do CDC, e a garantia do fabricante vem somada. Traga o produto ou mande vídeo do defeito no WhatsApp para a bancada avaliar.",
    },
    {
      pergunta: "Em quanto tempo o defeito é resolvido?",
      resposta:
        "A lei dá até 30 dias para o fornecedor resolver o defeito. Como a bancada fica na loja, muitos casos são avaliados na hora; se não for resolvido no prazo, você pode pedir troca, devolução do valor ou abatimento do preço.",
    },
    {
      pergunta: "Como peço a troca? Tem e-mail?",
      resposta:
        "O pedido é feito pelo WhatsApp (19) 98751-0267, pelo telefone (19) 3255-1661 ou no balcão da Av. Anchieta, 789, no Cambuí. Mande o número do pedido ou da nota e fotos do produto.",
    },
    {
      pergunta: "A garantia cobre tela quebrada ou líquido derramado?",
      resposta:
        "Não. Queda, pancada, líquido e lacre rompido não são defeito de fabricação. A bancada pode fazer um orçamento de conserto, e você decide se quer seguir.",
    },
    {
      pergunta: "O produto chegou com a caixa amassada. O que eu faço?",
      resposta:
        "Fotografe a embalagem antes de abrir e mande as fotos no WhatsApp com o número do pedido, no mesmo dia. A equipe avalia e orienta a troca.",
    },
  ],
  temas: ["garantia", "compra", "entrega", "assistencia"],
  termosDoBlog: ["garantia", "defeito", "troca", "devolução", "direito do consumidor"],
  relacionadas: ["envio-e-entrega", "como-comprar", "manutencao", "sobre-a-empresa"],
  final: {
    titulo: "Mande o pedido e as fotos, a equipe responde",
    texto:
      "Número do pedido ou da nota, o que aconteceu e uma foto ou vídeo. Se preferir, traga o produto ao balcão do Cambuí: a bancada fica no mesmo endereço.",
    botao: "Falar sobre a minha compra",
  },
};
