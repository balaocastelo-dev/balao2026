import type { PaginaDeCaptacao } from "../tipos";

export const sistemas: PaginaDeCaptacao = {
  slug: "sistemas",
  nome: "Criação de sites, lojas virtuais e sistemas",
  chamada: "Site, loja virtual, sistema interno e automação de WhatsApp feitos pela mesma equipe que roda a Balão.",
  seo: {
    titulo: "Criação de sites, lojas virtuais e sistemas em Campinas | Balão",
    descricao:
      "Sites, lojas virtuais, sistemas internos e automação de WhatsApp para pequenas empresas de Campinas, feitos pela equipe que criou os sistemas da própria Balão.",
    palavras: [
      "criação de sites em Campinas",
      "empresa que faz loja virtual em Campinas",
      "sistema sob medida para pequena empresa Campinas",
      "desenvolvimento de sistema web Campinas",
      "automação de WhatsApp para empresa Campinas",
      "CRM de WhatsApp para loja",
      "site com catálogo de produtos atualizado automaticamente",
      "sistema de caixa com nota fiscal para loja",
      "agente de IA para atendimento no WhatsApp",
      "criação de site no Cambuí Campinas",
    ],
    tipoDeServico: "Desenvolvimento de sites, lojas virtuais e sistemas sob medida",
  },
  hero: {
    contexto: "Sites e sistemas feitos no Cambuí, em Campinas",
    titulo: "O sistema que a sua empresa precisa, feito por quem usa o próprio todos os dias",
    texto:
      "A Balão vende pelo site, atende pelo WhatsApp, fecha a venda no caixa e acompanha as metas num painel, tudo em sistemas que a nossa equipe construiu. É essa experiência que levamos para o site, a loja virtual ou o sistema interno da sua empresa.",
    imagem: {
      src: "/images/landing/v2/sistemas.jpg",
      alt: "Estação de trabalho de desenvolvedor com dois monitores mostrando gráficos",
    },
    mensagem: "Olá! Vim pela página de sistemas da Balão e quero conversar sobre um projeto para a minha empresa.",
    botao: "Contar meu projeto no WhatsApp",
    secundario: { rotulo: "Ver o que já está rodando", href: "#secao-1" },
    fatos: [
      { valor: "Em uso real", rotulo: "a própria loja roda nesses sistemas" },
      { valor: "Milhares", rotulo: "de produtos no site, atualizados sozinhos" },
      { valor: "WhatsApp", rotulo: "CRM com vendedora digital" },
      { valor: "Proposta antes", rotulo: "escopo, prazo e valor antes de começar" },
    ],
  },
  assistente: {
    titulo: "Conte o projeto em três toques",
    texto: "Com isso a equipe já chega na conversa sabendo do que se trata.",
    abertura: "Olá! Vim pela página de sistemas e quero conversar sobre um projeto.",
    fecho: "Posso mandar exemplos ou prints do que imagino?",
    botao: "Enviar para a equipe",
    perguntas: [
      {
        rotulo: "Projeto",
        pergunta: "O que você precisa?",
        varias: true,
        opcoes: ["Site institucional", "Loja virtual", "Sistema interno", "Automação de WhatsApp", "Agente de IA", "Ainda não sei"],
      },
      {
        rotulo: "Empresa",
        pergunta: "Qual o tamanho da empresa?",
        opcoes: ["Só eu", "De 2 a 10 pessoas", "De 11 a 50 pessoas", "Mais de 50"],
      },
      {
        rotulo: "Prazo",
        pergunta: "Para quando você precisa?",
        opcoes: ["O quanto antes", "Nos próximos meses", "Ainda estou pesquisando"],
      },
    ],
  },
  secoes: [
    {
      tipo: "beneficios",
      titulo: "A prova está na própria loja",
      texto:
        "Antes de oferecer sistema para alguém, a equipe resolveu os problemas da Balão. Tudo isto está no ar e em uso no balcão do Cambuí.",
      itens: [
        {
          titulo: "Site com milhares de produtos que se atualizam sozinhos",
          texto: "O catálogo de www.balao.info lê preço e estoque dos fornecedores, aplica a margem da loja e marca o que tem pronta entrega, sem ninguém digitar produto por produto.",
        },
        {
          titulo: "CRM de WhatsApp com vendedora digital",
          texto: "As conversas do WhatsApp da loja ficam organizadas por cliente e por assunto. Quando não há vendedor livre, uma vendedora digital responde com os produtos do site.",
        },
        {
          titulo: "Caixa do balcão com nota fiscal",
          texto: "O caixa da loja usa os produtos do site, registra a venda por vendedor e emite a nota fiscal pelo sistema de gestão que a loja já usava.",
        },
        {
          titulo: "Painel de vendas com metas",
          texto: "Vendas e orçamentos viram pontos num telão, com a meta de cada vendedor. A equipe vê o dia andando sem abrir planilha.",
        },
      ],
    },
    {
      tipo: "dores",
      titulo: "Sinais de que a empresa já precisa de um sistema",
      texto: "Quase toda pequena empresa chega aqui pelo mesmo caminho: o que funcionava com cinco clientes não funciona mais com cinquenta.",
      itens: [
        {
          titulo: "Tudo depende de planilha",
          texto: "Estoque, pedidos e clientes em arquivos diferentes, cada um atualizado por uma pessoa. Basta um esquecimento para vender o que não tem.",
        },
        {
          titulo: "O WhatsApp virou bagunça",
          texto: "Conversas perdidas, cliente sem resposta no fim de semana, ninguém sabe quem atendeu quem. Dá para organizar e responder mesmo fora do horário.",
        },
        {
          titulo: "O site está parado",
          texto: "Página antiga, sem preço, sem produto e que não aparece no Google. Para o cliente, parece que a empresa fechou.",
        },
        {
          titulo: "A mesma informação digitada três vezes",
          texto: "Pedido no papel, depois no sistema, depois na nota. Integrar as pontas tira o retrabalho e os erros de digitação.",
        },
        {
          titulo: "Ninguém sabe quanto vendeu hoje",
          texto: "Sem um painel simples, o dono só descobre o resultado no fim do mês. Com os números à vista, dá para agir no meio do caminho.",
        },
        {
          titulo: "O sistema pronto não serve",
          texto: "Programa de prateleira que obriga a empresa a mudar o jeito de trabalhar, ou que cobra por função que você nunca usa.",
        },
      ],
    },
    {
      tipo: "comparativo",
      titulo: "Site, loja virtual ou sistema interno?",
      texto: "Muita gente chega pedindo \"um site\" quando o que resolve é outra coisa. Esta tabela ajuda a começar a conversa.",
      colunas: ["Projeto", "Para quem serve", "O que costuma ter"],
      linhas: [
        ["Site institucional", "Prestador de serviço, consultório, escritório", "Páginas de serviço, contato pelo WhatsApp, endereço e preparo para o Google"],
        ["Loja virtual", "Quem vende produto e quer receber pedido pela internet", "Catálogo com foto e preço, carrinho, pagamento e aviso de pedido"],
        ["Sistema interno", "Empresa com processo próprio: estoque, ordens de serviço, agenda", "Cadastro, telas por função, relatórios e acesso por senha"],
        ["Automação de WhatsApp", "Quem recebe muita mensagem e perde cliente na demora", "Conversas organizadas, respostas prontas e avisos automáticos"],
        ["Agente de IA", "Quem quer atender ou tirar dúvidas fora do horário", "Respostas com base nos seus produtos e regras, passando para uma pessoa quando precisa"],
      ],
    },
    {
      tipo: "passos",
      titulo: "Como um projeto acontece",
      texto: "Sem contrato de letra miúda e sem sumir no meio do caminho. Você acompanha cada etapa.",
      itens: [
        {
          titulo: "Conversa",
          texto: "Você conta como a empresa trabalha hoje e o que quer resolver. Prints, planilhas e exemplos de outros sites ajudam muito.",
        },
        {
          titulo: "Proposta",
          texto: "A equipe devolve o que será feito, em que ordem, o prazo e o valor. Nada começa antes de você aprovar.",
        },
        {
          titulo: "Construção por partes",
          texto: "O projeto é entregue em etapas que você vê funcionando, para corrigir o rumo cedo em vez de descobrir tudo no fim.",
        },
        {
          titulo: "No ar e em uso",
          texto: "Publicação, ajustes com o uso real e orientação para quem vai usar no dia a dia.",
        },
      ],
    },
    { tipo: "especial", id: "formulario-sistemas" },
    {
      tipo: "texto",
      titulo: "Quando vale fazer sob medida, e quando não vale",
      paragrafos: [
        "Sistema sob medida não é sempre a resposta. Se existe uma ferramenta pronta que faz o que a sua empresa precisa por uma mensalidade justa, a equipe diz isso na primeira conversa. O sob medida compensa quando o seu jeito de trabalhar é o que diferencia a empresa, quando você paga por três ferramentas que não conversam entre si, ou quando a ferramenta pronta trava o crescimento.",
        "Foi o caso da própria Balão. A loja precisava mostrar milhares de produtos com preço certo, vindos de fornecedores diferentes, e nenhuma solução pronta fazia isso do jeito da loja. O mesmo aconteceu com o WhatsApp: as conversas precisavam ficar ligadas aos produtos do site e às vendas do balcão. Construir dentro de casa permitiu juntar as pontas.",
        "Um bom projeto começa pequeno. Em vez de tentar resolver tudo de uma vez, a equipe propõe a primeira parte que já traz resultado, por exemplo o catálogo no site ou a organização do WhatsApp, e o resto vem depois, com o que se aprendeu usando.",
        "Site também é para ser achado. As páginas são escritas para quem procura no Google e nos assistentes de IA, com endereço, serviços e perguntas frequentes bem organizados, do mesmo jeito que as páginas da Balão.",
      ],
      lista: [
        "Integração com o sistema de gestão (ERP) que a empresa já usa, quando ele permite",
        "Telas pensadas para o celular, porque é nele que o cliente chega",
        "Pagamento por Pix na loja virtual, como no site da Balão",
      ],
    },
    {
      tipo: "atalhos",
      titulo: "Continue por aqui",
      texto: "Para quem quer ir além do site e colocar a inteligência artificial para trabalhar na empresa.",
      itens: [
        {
          titulo: "Funcionários digitais com IA",
          texto: "Agentes que atendem, respondem e organizam tarefas da empresa.",
          href: "/sistemasdeia",
          imagem: "/images/sistemasdeia/ia-hero.webp",
        },
        {
          titulo: "Blog da Balão",
          texto: "Artigos sobre tecnologia, IA no computador e equipamentos para empresa.",
          href: "/blog",
        },
        {
          titulo: "Licenças Windows e Office",
          texto: "Licença original para as máquinas da empresa.",
          href: "/microsoft",
          imagem: "/images/landing/v2/microsoft.jpg",
        },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Quanto custa criar um site ou sistema para a minha empresa?",
      resposta:
        "Depende do que o projeto precisa fazer: um site de poucas páginas e um sistema com estoque e nota fiscal são trabalhos muito diferentes. Depois da conversa, a equipe manda uma proposta por escrito com o escopo, o prazo e o valor, e nada começa sem a sua aprovação.",
    },
    {
      pergunta: "Quanto tempo leva para ficar pronto?",
      resposta:
        "O prazo sai na proposta, conforme o tamanho do projeto. Para chegar mais rápido a algo útil, a equipe costuma entregar por partes, começando pelo que já traz resultado.",
    },
    {
      pergunta: "Vocês fazem loja virtual com catálogo grande?",
      resposta:
        "Sim. O site da própria Balão tem milhares de produtos com preço e estoque lidos dos fornecedores e atualizados sem digitação manual. Esse mesmo tipo de solução pode ser adaptado ao seu catálogo.",
    },
    {
      pergunta: "Dá para automatizar o atendimento no WhatsApp?",
      resposta:
        "Dá. A Balão usa um CRM de WhatsApp próprio, com as conversas organizadas e uma vendedora digital que responde quando não há vendedor livre. Para a sua empresa, a equipe avalia o volume de mensagens e o que faz sentido automatizar.",
    },
    {
      pergunta: "O sistema conversa com o meu ERP ou emissor de nota fiscal?",
      resposta:
        "Muitas vezes, sim. O caixa da Balão emite nota pelo sistema de gestão que a loja já usava. A possibilidade depende de o seu sistema permitir integração, e isso é conferido antes da proposta.",
    },
    {
      pergunta: "Vocês atendem empresas fora de Campinas?",
      resposta:
        "O foco é Campinas e região, com conversa pelo WhatsApp e na loja do Cambuí. Se a sua empresa é de outra cidade, conte o projeto pelo WhatsApp e a equipe diz como pode atender.",
    },
    {
      pergunta: "E depois que o site estiver no ar, quem cuida?",
      resposta:
        "A manutenção e os ajustes depois da entrega são combinados na proposta. A equipe também orienta quem vai usar o sistema no dia a dia.",
    },
  ],
  temas: ["sistemas", "empresa", "ia", "whatsapp", "site"],
  termosDoBlog: ["empresa", "ia local", "inteligência artificial", "sistema", "site", "whatsapp", "automação"],
  relacionadas: ["microsoft", "manutencao", "sobre-a-empresa", "sobre-nos"],
  final: {
    titulo: "Conte o que a sua empresa precisa resolver",
    texto: "Uma mensagem com o tipo de projeto e como vocês trabalham hoje já basta para começar. A equipe fica na loja do Cambuí, na Av. Anchieta.",
    botao: "Falar sobre o meu projeto",
  },
};
