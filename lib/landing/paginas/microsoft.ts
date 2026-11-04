import type { PaginaDeCaptacao } from "../tipos";

// Hub de licenciamento. A URL /microsoft já existia: aqui ela passa a
// distribuir Windows, Windows Server e Office/365, em vez de misturar os
// três num texto só. Licença não está no catálogo de produtos.
//
// Pode: "licenças originais adquiridas de fornecedores oficiais Microsoft",
// nota fiscal de venda, 12x sem juros também para CNPJ, ativação e instalação.
// Não pode: parceiro, Partner, CSP, revenda oficial/autorizada, distribuidor
// oficial, certificação de técnico, preço, prazo de garantia, logo de fabricante.

const MENSAGEM =
  "Olá! Quero regularizar as licenças Microsoft da minha empresa: __ computadores, (  ) tem servidor, (  ) usa Office. Podem fazer um levantamento?";

export const microsoft: PaginaDeCaptacao = {
  slug: "microsoft",
  nome: "Licenciamento Microsoft",
  chamada: "Windows, Windows Server e Office originais para empresa e pessoa física, com nota fiscal de venda e ativação no Cambuí.",
  seo: {
    titulo: "Licenciamento Microsoft para Empresas em Campinas | Balão da Informática Anchieta",
    descricao:
      "Regularize Windows, Windows Server e Office com licença original, nota fiscal de venda e técnico no Cambuí. 12x sem juros também no CNPJ.",
    palavras: [
      "licenciamento microsoft para empresas campinas",
      "regularizar software empresa",
      "licença microsoft original com nota fiscal",
      "auditoria de software microsoft",
      "comprar licenças microsoft campinas",
      "windows server e office campinas",
      "licença windows para empresa cambuí",
      "nota fiscal de venda software campinas",
    ],
    tipoDeServico: "Licenciamento de Windows, Windows Server e Office",
    catalogo: ["Licença Windows 10 e 11 Pro", "Licenciamento de Windows Server", "Office e Microsoft 365", "Ativação e instalação"],
    partes: [
      { nome: "Licença Windows 10 e 11 Pro", url: "https://www.balao.info/microsoft/windows" },
      { nome: "Windows Server, núcleos e CALs", url: "https://www.balao.info/microsoft/windows-server" },
      { nome: "Office 2024 e Microsoft 365", url: "https://www.balao.info/microsoft/office-365" },
    ],
  },
  hero: {
    contexto: "Licenciamento Microsoft no Cambuí, em Campinas",
    titulo: "Windows, Windows Server e Office originais, num só balcão",
    texto:
      "A Balão da Informática Anchieta é especialista em licenciamento de Windows, Windows Server e Microsoft Office. São licenças originais adquiridas de fornecedores oficiais Microsoft, com nota fiscal de venda, ativação e instalação. Para pessoa física e para CNPJ, o cartão parcela em 12x sem juros. O levantamento da sua empresa sai pelo WhatsApp.",
    imagem: { src: "/images/landing/v2/microsoft.jpg", alt: "Mesa de escritório com monitor e notebook em um ambiente de trabalho" },
    mensagem: MENSAGEM,
    botao: "Pedir levantamento no WhatsApp",
    secundario: { rotulo: "Escolher a licença", href: "#secao-2" },
    fatos: [
      { valor: "Originais", rotulo: "licenças originais adquiridas de fornecedores oficiais Microsoft" },
      { valor: "Nota de venda", rotulo: "a venda sai com nota fiscal de venda" },
      { valor: "12x sem juros", rotulo: "no cartão, para pessoa física e CNPJ" },
      { valor: "No Cambuí", rotulo: "ativação e instalação na Av. Anchieta" },
    ],
  },
  assistente: {
    titulo: "Diga o tamanho da empresa",
    texto: "Com isso a equipe já sabe se o caso é um computador, um parque inteiro ou um servidor.",
    abertura: MENSAGEM,
    fecho: "Posso mandar a quantidade de computadores e se existe servidor?",
    botao: "Enviar para a loja",
    perguntas: [
      {
        rotulo: "Preciso de",
        pergunta: "O que a empresa precisa regularizar?",
        varias: true,
        opcoes: ["Windows nos PCs", "Windows Server", "Office ou Microsoft 365", "Ainda não sei"],
      },
      {
        rotulo: "Servidor",
        pergunta: "A empresa tem servidor?",
        opcoes: ["Sim", "Não", "Não sei"],
      },
      {
        rotulo: "Computadores",
        pergunta: "Quantos computadores entram na conta?",
        opcoes: ["1", "2 a 10", "Mais de 10"],
      },
    ],
  },
  secoes: [
    {
      tipo: "texto",
      titulo: "Software Microsoft original para a sua empresa, num só lugar",
      paragrafos: [
        "Quem cuida de um escritório em Campinas quase nunca precisa de um produto só. O computador pede Windows Pro, cada pessoa pede Word, Excel e e-mail, e o servidor de arquivos ou do sistema pede Windows Server com as licenças de acesso. Comprar cada um num site diferente, sem saber a modalidade, é o caminho mais comum para uma chave que para de valer na atualização seguinte.",
        "Nesta página a Balão da Informática Anchieta junta os três. A loja é especialista nesse licenciamento e trabalha com licenças originais adquiridas de fornecedores oficiais Microsoft. A venda sai com nota fiscal de venda. A ativação e a instalação são feitas pela equipe, na loja da Av. Anchieta, 789, no Cambuí. O valor de cada licença não está publicado aqui: o orçamento sai pelo WhatsApp (19) 98751-0267.",
        "O levantamento começa com quatro números: quantos computadores, se existe servidor, quantas pessoas usam o Office e se alguém acessa o sistema de fora. Com isso a equipe separa o que é Windows, o que é servidor e o que é assinatura, e devolve uma proposta só. Pessoa física com um computador também é atendida: o caminho é o mesmo, com menos itens.",
      ],
    },
    {
      tipo: "atalhos",
      titulo: "O que você precisa",
      texto: "Escolha o assunto. Cada página explica a regra de uso e leva ao mesmo WhatsApp, já com a mensagem do caso.",
      itens: [
        {
          titulo: "Windows 10 e 11 Pro",
          texto: "OEM, Retail e volume: qual licença fica no computador e qual pode mudar de máquina.",
          href: "/microsoft/windows",
          imagem: "/images/landing/v2/microsoft.jpg",
        },
        {
          titulo: "Windows Server",
          texto: "Standard ou Datacenter, núcleos mínimos e CALs por usuário ou por dispositivo.",
          href: "/microsoft/windows-server",
          imagem: "/images/landing/v2/sistemas.jpg",
        },
        {
          titulo: "Office e Microsoft 365",
          texto: "Compra única ou assinatura, para casa, autônomo ou empresa, com instalação.",
          href: "/microsoft/office-365",
          imagem: "/images/landing/v2/notebooks.jpg",
        },
        {
          titulo: "Sites e suporte de TI",
          texto: "Quando a empresa também precisa de rede, backup ou sistema, além da licença.",
          href: "/sistemas",
          imagem: "/images/landing/v2/sistemas.jpg",
        },
      ],
    },
    {
      tipo: "passos",
      titulo: "Regularização em 3 passos",
      texto: "O levantamento não publica preço nesta página. A proposta, com nota fiscal de venda, sai na conversa.",
      itens: [
        {
          titulo: "Levantamento",
          texto: "Você manda quantos computadores existem, se há servidor, qual Office está em uso e se o acesso remoto faz parte do dia. Pode ser pelo formulário ou pelo WhatsApp.",
        },
        {
          titulo: "Proposta com nota fiscal de venda",
          texto: "A equipe indica a modalidade de cada licença e manda o orçamento. A venda sai com nota fiscal de venda. No cartão, 12x sem juros para pessoa física e para CNPJ.",
        },
        {
          titulo: "Ativação e instalação",
          texto: "A equipe ativa e instala. O computador pode vir à loja do Cambuí. Se o caso pedir outro jeito de atendimento, isso entra no orçamento, sem prazo prometido nesta página.",
        },
      ],
    },
    {
      tipo: "regras",
      titulo: "Regras que todo gestor deve saber",
      texto: "Três regras evitam comprar a licença errada. O detalhe de cada uma está na página do produto.",
      itens: [
        {
          titulo: "OEM, Retail e volume",
          texto: "A OEM fica no primeiro computador em que é ativada e não muda de máquina. A Retail (ESD ou caixa) vale em um dispositivo por vez e pode ser transferida. O volume é contrato empresarial, para muitas máquinas. Nenhuma das três é uma chave solta sem modalidade.",
          pontos: ["Veja a comparação na página de Windows", "Peça a modalidade por escrito no orçamento"],
        },
        {
          titulo: "Servidor pede núcleo e CAL",
          texto: "Licenciar o Windows Server não basta. Cada pessoa ou cada aparelho que acessa o servidor precisa de uma CAL, e o acesso por área de trabalho remota pede outra licença em cima. Um escritório de dez pessoas quase nunca se resolve só com a licença do servidor.",
          pontos: ["A conta de núcleos e CALs está na página de Windows Server"],
        },
        {
          titulo: "Office de compra única não é assinatura",
          texto: "O Office 2024 é pago uma vez e fica naquela versão. O Microsoft 365 é assinatura, com aplicativos atualizados e, nos planos de empresa, e-mail e Teams. Oferta de uso sem prazo, apresentada como se a assinatura fosse eterna, não é um produto da Microsoft.",
          pontos: ["A escolha por perfil está na página de Office e Microsoft 365"],
        },
      ],
    },
    {
      tipo: "beneficios",
      titulo: "Por que fechar com a loja do Cambuí",
      texto: "O que a Balão da Informática Anchieta confirma neste atendimento, sem preço publicado na página.",
      itens: [
        {
          titulo: "Licença com origem declarada",
          texto: "São licenças originais adquiridas de fornecedores oficiais Microsoft, para Windows, Windows Server, Office e Microsoft 365.",
        },
        {
          titulo: "Nota fiscal de venda",
          texto: "A venda da licença sai com nota fiscal de venda. O documento acompanha o orçamento fechado, não um tipo de nota inventado no anúncio.",
        },
        {
          titulo: "12x sem juros também no CNPJ",
          texto: "O parcelamento em 12x sem juros no cartão vale para pessoa física e para empresa. O valor de cada item sai no orçamento pelo WhatsApp.",
        },
        {
          titulo: "Ativação e instalação",
          texto: "A equipe ativa e instala. Quem só manda a chave deixa a empresa na dúvida na hora de ligar o computador. Aqui o técnico da loja faz essa etapa.",
        },
      ],
    },
    {
      tipo: "texto",
      titulo: "O que uma auditoria costuma olhar",
      paragrafos: [
        "Uma revisão de software pergunta, em linguagem simples, se cada computador tem licença da edição que está instalada e se o servidor tem CALs para quem acessa. Planilha de controle, nota de compra e a modalidade (OEM, Retail ou volume) são o que a empresa mostra. Chave sem nota e sem modalidade é o item que mais atrapalha nessa hora.",
        "A Balão da Informática Anchieta não substitui o contador nem o jurídico da empresa. O que a loja faz é o levantamento das licenças, a proposta com nota fiscal de venda e a ativação e instalação. Se o escritório está abrindo agora, se o contador pediu regularização ou se o parque ainda está no Windows 10, o caminho é o mesmo: mande os números pelo WhatsApp.",
      ],
    },
    {
      tipo: "retorno",
      titulo: "Pedir retorno rápido",
      texto: "CNPJ, quantidade de computadores, se existe servidor e qual Office a empresa usa. A equipe retorna no WhatsApp com o levantamento.",
      assunto: "Licenciamento Microsoft",
      campos: [
        { nome: "cnpj", rotulo: "CNPJ" },
        { nome: "computadores", rotulo: "Número de computadores" },
        { nome: "servidor", rotulo: "Tem servidor?", opcoes: ["Sim", "Não", "Não sei"] },
        { nome: "office", rotulo: "Usa Office? Qual?" },
      ],
    },
    {
      tipo: "atalhos",
      titulo: "Quando a licença não é o único assunto",
      itens: [
        {
          titulo: "Formatação com backup",
          texto: "Sistema reinstalado, com os arquivos combinados antes.",
          href: "/formatacao",
          imagem: "/images/landing/v2/sistemas.jpg",
        },
        {
          titulo: "Montagem de PC",
          texto: "Computador novo, e a licença de Windows entra no orçamento se você pedir.",
          href: "/montagempc",
          imagem: "/images/landing/v2/montagempc.jpg",
        },
        {
          titulo: "Notebooks",
          texto: "Máquinas novas. As que saem sem Windows podem receber a licença na loja.",
          href: "/notebooks",
          imagem: "/images/landing/v2/notebooks.jpg",
        },
        {
          titulo: "Fale conosco",
          texto: "Endereço, telefone e horário da loja no Cambuí.",
          href: "/fale-conosco",
          imagem: "/images/landing/v2/sobre-nos.jpg",
        },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Onde regularizar licenças Microsoft de uma empresa em Campinas?",
      resposta:
        "A Balão da Informática Anchieta, na Av. Anchieta, 789, Cambuí, é especializada em licenciamento de Windows, Windows Server e Office, com licença original, nota fiscal de venda e instalação por técnico; levantamento pelo WhatsApp (19) 98751-0267.",
    },
    {
      pergunta: "Quais licenças Microsoft uma pequena empresa precisa?",
      resposta:
        "Normalmente: Windows Pro em cada PC, Office ou Microsoft 365 por usuário e, se houver servidor, Windows Server licenciado por núcleo mais CALs por usuário ou dispositivo.",
    },
    {
      pergunta: "A venda da licença sai com nota fiscal?",
      resposta:
        "Sim. A venda sai com nota fiscal de venda. São licenças originais adquiridas de fornecedores oficiais Microsoft. O orçamento, com a modalidade de cada item, sai pelo WhatsApp (19) 98751-0267.",
    },
    {
      pergunta: "Empresa com CNPJ parcela em quantas vezes?",
      resposta:
        "Em 12x sem juros no cartão, tanto para pessoa física quanto para CNPJ. O valor de cada licença não está nesta página: ele sai no orçamento pelo WhatsApp.",
    },
    {
      pergunta: "Vocês instalam o que foi comprado?",
      resposta:
        "Sim. A ativação e a instalação são feitas pela equipe da loja. O computador pode vir ao Cambuí. Outra forma de atendimento, quando o caso pedir, é combinada no orçamento.",
    },
  ],
  tituloDasPerguntas: "Perguntas frequentes",
  temas: ["licenca", "empresa", "windows", "office", "servidor"],
  termosDoBlog: ["windows", "windows 11", "windows 10", "office", "microsoft", "licença", "servidor"],
  relacionadas: ["microsoft/windows", "microsoft/windows-server", "microsoft/office-365", "sistemas"],
  final: {
    titulo: "Mande os números da empresa e receba o levantamento",
    texto: "Av. Anchieta, 789, Cambuí. Segunda a sexta, 9h às 18h. Sábado, 9h às 13h. Licenças originais, nota fiscal de venda e 12x sem juros também para CNPJ. Orçamento pelo WhatsApp.",
    botao: "Chamar no WhatsApp",
    mensagem: MENSAGEM,
  },
};
