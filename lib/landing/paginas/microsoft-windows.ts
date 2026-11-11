import type { PaginaDeCaptacao } from "../tipos";

// Windows 10/11 Pro. Sem preço, sem garantia em dias, sem CSP, sem
// "parceiro" e sem logo. A frase de origem, a nota fiscal de venda e o
// 12x sem juros para CNPJ estão confirmados.

const MENSAGEM =
  "Olá! Preciso de licença Windows ____ (10/11 Pro) para __ computador(es), (  ) PF (  ) empresa. Vocês instalam e emitem nota?";

export const microsoftWindows: PaginaDeCaptacao = {
  slug: "microsoft/windows",
  nome: "Licença Windows",
  chamada: "Windows 10 e 11 Pro originais, com nota fiscal de venda, ativação e instalação no Cambuí.",
  seo: {
    titulo: "Licença Windows 11 Pro Original com Nota Fiscal",
    descricao:
      "Licença Windows 10 e 11 Pro original com nota fiscal de venda e técnico que instala e ativa. OEM, Retail ou volume em Campinas. 12x sem juros.",
    palavras: [
      "licença windows 11 pro original",
      "comprar windows 11 pro com nota fiscal",
      "windows 11 pro oem ou retail",
      "licença windows para empresa campinas",
      "ativar windows original",
      "windows 10 fim do suporte migrar",
      "licença windows por volume",
      "instalar windows 11 campinas",
    ],
    tipoDeServico: "Venda, ativação e instalação de licença Windows",
    catalogo: ["Windows 11 Pro", "Windows 10 Pro", "Licença OEM", "Licença Retail", "Licenciamento por volume", "Ativação e instalação"],
  },
  hero: {
    contexto: "Licença Windows no Cambuí, em Campinas",
    titulo: "Windows original, com nota fiscal de venda e técnico que instala",
    texto:
      "Windows 10 Pro ou Windows 11 Pro, com licenças originais adquiridas de fornecedores oficiais Microsoft. A venda sai com nota fiscal de venda. A equipe da Balão da Informática Anchieta faz a ativação e a instalação e, antes, confere se o computador roda o Windows 11. No cartão, 12x sem juros para pessoa física e para CNPJ. O valor sai no orçamento pelo WhatsApp.",
    imagem: { src: "/images/landing/v3/microsoft/microsoft.webp", alt: "Escritório claro com notebook e monitor prontos para uso com Windows e Office" },
    mensagem: MENSAGEM,
    botao: "Pedir a licença no WhatsApp",
    secundario: { rotulo: "OEM, Retail ou volume?", href: "#secao-2" },
    fatos: [
      { valor: "OEM ou Retail", rotulo: "a modalidade vai por escrito no orçamento" },
      { valor: "Nota de venda", rotulo: "a venda sai com nota fiscal de venda" },
      { valor: "12x sem juros", rotulo: "no cartão, também para CNPJ" },
      { valor: "Instala", rotulo: "ativação e instalação pela equipe da loja" },
    ],
  },
  assistente: {
    titulo: "Qual Windows, para quantas máquinas",
    texto: "A mensagem já sai com edição, quantidade e se é pessoa física ou empresa.",
    abertura: MENSAGEM,
    botao: "Enviar para a loja",
    perguntas: [
      { rotulo: "Edição", pergunta: "Qual Windows você precisa?", opcoes: ["Windows 11 Pro", "Windows 10 Pro", "Não sei, quero ajuda"] },
      { rotulo: "Quantidade", pergunta: "Para quantos computadores?", opcoes: ["1", "2 a 5", "Mais de 5"] },
      { rotulo: "Perfil", pergunta: "Pessoa física ou empresa?", opcoes: ["Pessoa física", "Empresa (CNPJ)"] },
    ],
  },
  secoes: [
    {
      tipo: "texto",
      titulo: "Windows original, com nota fiscal de venda e instalado por técnico",
      paragrafos: [
        "Comprar a chave e descobrir na semana seguinte que a ativação caiu é o medo de quem já viu anúncio barato demais. Na Balão da Informática Anchieta o caminho é outro: licenças originais adquiridas de fornecedores oficiais Microsoft, modalidade dita no orçamento (OEM, Retail ou volume) e nota fiscal de venda. A ativação e a instalação ficam com a equipe da loja, na Av. Anchieta, 789, no Cambuí.",
        "Antes de fechar o Windows 11, a equipe confere se a máquina cumpre o que o sistema pede: processador compatível, TPM 2.0 e inicialização segura. Muita máquina de poucos anos passa. A muito antiga não passa, e você fica sabendo antes de pagar uma licença que não vai ligar. Essa checagem é feita pelo WhatsApp, com uma foto de Configurações, ou na loja. Não é um serviço com preço publicado à parte.",
        "O Windows 10 teve o suporte encerrado em 14 de outubro de 2025. Ele continua ligando, mas deixou de receber as atualizações de segurança regulares. Para computador de banco, e-mail e trabalho, o caminho recomendado é o Windows 11, quando o hardware aceita. O valor da licença e o da instalação saem juntos no orçamento pelo WhatsApp (19) 98751-0267, em 12x sem juros no cartão, para pessoa física e para CNPJ.",
      ],
    },
    {
      tipo: "comparativo",
      titulo: "OEM, Retail (ESD) e volume: qual é a sua",
      texto: "As três são licença original. O que muda é se ela fica presa ao computador e como a empresa controla várias máquinas.",
      colunas: ["Modalidade", "Pode ir para outro computador?", "Quando faz sentido"],
      linhas: [
        ["OEM", "Não. Fica no primeiro computador em que é ativada", "Máquina que vai ficar com essa licença"],
        ["Retail (ESD ou FPP)", "Sim, um dispositivo por vez, depois de sair da máquina antiga", "Quem troca de computador de tempos em tempos"],
        ["Volume (contrato empresarial)", "Segue o contrato da empresa, não uma chave solta", "Vários computadores sob a mesma conta"],
      ],
    },
    {
      tipo: "texto",
      titulo: "Como reconhecer uma licença fora das regras",
      paragrafos: [
        "Licença original tem modalidade. OEM, Retail ou volume não são detalhes de vendedor: são a regra de uso. Se quem vende não escreve qual das três você está comprando, não há o que conferir depois. A nota fiscal de venda é o outro documento. Sem ela, a empresa não tem o que mostrar se um dia precisarem revisar o software.",
        "Preço muito abaixo do que se pratica no mercado costuma indicar chave repassada fora das regras de licenciamento. Esse tipo de chave pode ser bloqueado numa atualização. A Balão da Informática Anchieta não trabalha com isso. Também não instala programa de terceiros para forçar ativação: o Windows é ativado com licenças originais adquiridas de fornecedores oficiais Microsoft.",
        "Para a empresa, o risco prático é simples. Numa revisão, pedem a licença de cada máquina. Chave sem nota e sem modalidade vira compra de novo, às pressas. Regularizar com calma, com a modalidade certa por computador, custa menos susto do que esperar essa conversa chegar.",
      ],
      lista: [
        "Peça a modalidade por escrito: OEM, Retail ou volume",
        "A venda na loja sai com nota fiscal de venda",
        "Desconfie de quem não explica se a licença muda de computador",
        "Ativação feita com programa de terceiros não é o serviço da loja",
      ],
    },
    {
      tipo: "texto",
      titulo: "Windows 10 para 11: seu computador é compatível?",
      paragrafos: [
        "O Windows 11 pede processador de 64 bits que esteja na lista de compatibilidade, TPM 2.0 e inicialização segura. Memória e disco também entram: 4 GB de RAM e 64 GB de armazenamento são o piso, e na prática um SSD e 8 GB ou mais deixam o uso confortável. O ponto que mais reprova máquina antiga é o processador ou a ausência de TPM 2.0, não a falta de um programa.",
        "Se o computador não passa, há dois caminhos honestos. Um é o upgrade de SSD, memória ou, quando compensa, de plataforma, feito na bancada. O outro é um computador novo, montado na loja ou um notebook, já com a licença no orçamento. Os dois links estão abaixo. A equipe diz qual dos dois faz sentido depois de ver a configuração, não antes.",
        "Na troca de Windows 10 para 11, muitos arquivos podem permanecer. Quando a instalação pede formatação, o backup é combinado antes, na página de formatação. Nada é apagado no escuro.",
      ],
    },
    {
      tipo: "atalhos",
      titulo: "Se a máquina não roda o Windows 11",
      itens: [
        {
          titulo: "Upgrade de SSD e memória",
          texto: "Quando o disco e a memória é que limitam, antes de trocar o computador inteiro.",
          href: "/upgrade-ssd",
          imagem: "/images/landing/v3/android/manutencao.webp", alt: "Técnico limpando a ventoinha e trocando a pasta térmica de um notebook aberto",
        },
        {
          titulo: "Montagem de PC",
          texto: "Computador novo, com a licença de Windows no mesmo orçamento se você pedir.",
          href: "/montagempc",
          imagem: "/images/landing/v3/microsoft/montagempc.webp", alt: "Técnico instalando SSD na placa-mãe de um computador de mesa aberto",
        },
        {
          titulo: "PC gamer",
          texto: "Máquina pronta. A licença de Windows é tratada à parte, se ainda não vier com o equipamento.",
          href: "/pcgamer",
          imagem: "/images/landing/v3/microsoft-windows/pcgamer-workstation.webp", alt: "Estação de trabalho com gabinete de vidro, monitor, teclado e mouse em escritório claro",
        },
        {
          titulo: "Formatação com backup",
          texto: "Reinstalar com os arquivos salvos, quando o caso for o sistema e não a licença.",
          href: "/formatacao",
          imagem: "/images/landing/v3/microsoft-windows-server/sistemas.webp", alt: "Rack de servidor com cabos de rede organizados e luzes de status em sala técnica de empresa",
        },
      ],
    },
    {
      tipo: "texto",
      titulo: "Para empresas: regularizar o parque",
      paragrafos: [
        "Escritório com parte das máquinas sem licença, ou ainda no Windows 10, é o pedido mais comum de empresa. O levantamento pede a quantidade de computadores, a edição que cada um mostra em Configurações e se alguém acessa a máquina de fora. Com isso a loja separa quem precisa de Pro (acesso remoto, criptografia de disco, domínio) e quem pode ficar numa edição mais simples.",
        "Windows 11 Pro é o que costuma servir para empresa: BitLocker, Área de Trabalho Remota para o computador ser acessado, entrada em domínio e políticas. O Home atende casa e estudo. A passagem de Home para Pro, quando a licença permite, não exige formatar. A equipe confirma o caso no orçamento.",
        "Várias máquinas podem entrar num licenciamento por volume, que é um contrato empresarial, em vez de uma compra solta por computador. Qual modalidade cabe no seu número de PCs é decisão do orçamento, não de um anúncio. Mande o CNPJ e a quantidade pelo formulário. A proposta volta com nota fiscal de venda.",
      ],
    },
    {
      tipo: "texto",
      titulo: "Preço e formas de pagamento",
      paragrafos: [
        "O preço de cada licença não é publicado nesta página e o preço de tabela de terceiros também não é repetido aqui como se fosse o da loja. O orçamento pelo WhatsApp (19) 98751-0267 informa a modalidade, o valor e se a ativação e a instalação entram naquele pedido.",
        "No cartão, o parcelamento é em 12x sem juros, para pessoa física e para CNPJ. A venda sai com nota fiscal de venda. Retirada no balcão da Av. Anchieta, 789, Cambuí. Em Campinas e região, a coleta por motoboy pode ser combinada; o custo dela é confirmado na conversa, não nesta página.",
      ],
    },
    {
      tipo: "retorno",
      titulo: "Pedir retorno rápido",
      texto: "Pessoa física ou empresa, quantos computadores e qual Windows está hoje. A equipe retorna com a modalidade e o orçamento.",
      assunto: "Licença Windows",
      campos: [
        { nome: "perfil", rotulo: "Pessoa física ou empresa?", opcoes: ["Pessoa física", "Empresa (CNPJ)"] },
        { nome: "quantidade", rotulo: "Quantos computadores?" },
        { nome: "windows", rotulo: "Windows atual", opcoes: ["Windows 10", "Windows 11 Home", "Windows 11 Pro", "Sem sistema", "Não sei"] },
      ],
    },
    {
      tipo: "vitrine",
      titulo: "Vai trocar de computador? Notebooks que já saem com Windows 11",
      texto: "Estes modelos vêm de fábrica com o Windows 11. Os que saem sem ele podem receber licença original na loja, no mesmo orçamento.",
      regras: [
        {
          id: "notebooks-windows",
          titulo: "Notebooks com Windows 11 de fábrica",
          subtitulo: "Ativação de fábrica, pronta para usar",
          categorias: ["Computadores/Notebooks"],
          nomeComeca: ["notebook"],
          nomeContem: ["windows 11", "win 11", "win11", "w11", "win 11h", "w11h", "windows 11 home", "windows 11 pro"],
          porMarca: 3,
          ordem: "menor",
          limite: 8,
          verTodos: { rotulo: "Ver todos os notebooks", href: "/notebooks" },
        },
      ],
    },
    {
      tipo: "atalhos",
      titulo: "Siga para o resto do licenciamento",
      itens: [
        {
          titulo: "Hub de licenças",
          texto: "Windows, servidor e Office no mesmo levantamento.",
          href: "/microsoft",
          imagem: "/images/landing/v3/microsoft/microsoft.webp", alt: "Escritório claro com notebook e monitor prontos para uso com Windows e Office",
        },
        {
          titulo: "Office e Microsoft 365",
          texto: "Word, Excel e e-mail, compra única ou assinatura.",
          href: "/microsoft/office-365",
          imagem: "/images/landing/v3/microsoft-office-365/notebooks.webp", alt: "Pessoa trabalhando em planilha no notebook em mesa de escritório clara",
        },
        {
          titulo: "Windows Server",
          texto: "Quando a empresa tem servidor, a conta inclui núcleos e CALs.",
          href: "/microsoft/windows-server",
          imagem: "/images/landing/v3/microsoft-windows-server/sistemas.webp", alt: "Rack de servidor com cabos de rede organizados e luzes de status em sala técnica de empresa",
        },
        {
          titulo: "Manutenção",
          texto: "Se o computador também tem defeito de hardware, a bancada vê os dois.",
          href: "/manutencao",
          imagem: "/images/landing/v3/android/manutencao.webp", alt: "Técnico limpando a ventoinha e trocando a pasta térmica de um notebook aberto",
        },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Qual a diferença entre licença Windows OEM e Retail?",
      resposta:
        "A OEM fica vinculada ao primeiro computador em que é ativada e não pode ser transferida; a Retail (ESD/FPP) pode ser movida para outro PC, desde que usada em um só dispositivo por vez. Empresas com muitas máquinas costumam usar licenciamento por volume.",
    },
    {
      pergunta: "Onde comprar licença Windows 11 Pro original em Campinas?",
      resposta:
        "A Balão da Informática Anchieta, na Av. Anchieta, 789, Cambuí, vende licença Windows original com nota fiscal de venda e faz instalação e ativação com técnico; orçamento pelo WhatsApp (19) 98751-0267.",
    },
    {
      pergunta: "Chave de Windows muito barata é confiável?",
      resposta:
        "Preços muito abaixo do mercado costumam indicar chaves revendidas fora das regras de licenciamento, que podem ser bloqueadas; exija nota fiscal de venda e a modalidade (OEM, Retail ou volume) por escrito.",
    },
    {
      pergunta: "Meu computador roda o Windows 11?",
      resposta:
        "Depende do processador, do TPM 2.0 e da inicialização segura. Mande uma foto de Configurações no WhatsApp ou traga o computador à loja. A equipe confere antes da compra da licença.",
    },
    {
      pergunta: "Dá para parcelar a licença no CNPJ?",
      resposta:
        "Sim. São 12x sem juros no cartão, para pessoa física e para CNPJ. A venda sai com nota fiscal de venda. O valor sai no orçamento pelo WhatsApp.",
    },
    {
      pergunta: "Vocês instalam o Windows na loja?",
      resposta:
        "Sim. A ativação e a instalação são feitas pela equipe. O computador pode vir ao Cambuí. Se a instalação pede formatação, o backup é combinado antes.",
    },
  ],
  tituloDasPerguntas: "Perguntas frequentes",
  temas: ["licenca", "empresa", "windows", "pc", "notebook"],
  termosDoBlog: ["windows", "windows 11", "windows 10", "licença", "formatar", "tpm"],
  relacionadas: ["microsoft", "microsoft/office-365", "montagempc", "manutencao"],
  final: {
    titulo: "Diga a edição, a quantidade e se é empresa",
    texto: "Av. Anchieta, 789, Cambuí. Segunda a sexta, 9h às 18h. Sábado, 9h às 13h. Licença original, nota fiscal de venda, ativação e instalação. 12x sem juros também para CNPJ.",
    botao: "Chamar no WhatsApp",
    mensagem: MENSAGEM,
  },
};
