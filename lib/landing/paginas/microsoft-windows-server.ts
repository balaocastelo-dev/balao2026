import type { PaginaDeCaptacao } from "../tipos";

// Windows Server. Regras de núcleo e CAL seguem a orientação pública de
// licenciamento (mínimo de 16 núcleos por servidor e 8 por processador;
// CAL da versão cobre a mesma versão e as anteriores). Sem preço, sem
// certificação, sem CSP e sem "parceiro".

const MENSAGEM =
  "Olá! Preciso licenciar Windows Server para __ usuários e __ computadores, (  ) com acesso remoto. Podem montar uma proposta com nota fiscal?";

export const microsoftWindowsServer: PaginaDeCaptacao = {
  slug: "microsoft/windows-server",
  nome: "Windows Server",
  chamada: "Windows Server com a conta de núcleos e CALs explicada, nota fiscal de venda e instalação no Cambuí.",
  seo: {
    titulo: "Windows Server 2025: Licenças e CALs Explicadas",
    descricao:
      "Standard ou Datacenter, núcleos e CAL por usuário ou dispositivo, com exemplo de escritório. Nota fiscal de venda e 12x sem juros no CNPJ.",
    palavras: [
      "windows server 2025 licenciamento",
      "cal windows server usuário ou dispositivo",
      "windows server standard ou datacenter",
      "quantas cals preciso",
      "licença rds windows server",
      "windows server 2022 ou 2025",
      "servidor para pequena empresa campinas",
      "licença windows server campinas",
    ],
    tipoDeServico: "Licenciamento e instalação de Windows Server",
    catalogo: ["Windows Server Standard", "Windows Server Datacenter", "CAL por usuário", "CAL por dispositivo", "CAL de acesso remoto", "Instalação do servidor"],
  },
  hero: {
    contexto: "Windows Server para empresas no Cambuí, em Campinas",
    titulo: "A conta do servidor: núcleos, CALs e quem acessa de fora",
    texto:
      "Windows Server com licenças originais adquiridas de fornecedores oficiais Microsoft, e nota fiscal de venda. A Balão da Informática Anchieta faz a conta de núcleos e de CALs para a sua empresa e a instalação. Mande quantos usuários e quantos computadores. No cartão, 12x sem juros também para CNPJ. O valor sai no orçamento pelo WhatsApp.",
    imagem: { src: "/images/landing/v3/microsoft-windows-server/sistemas.webp", alt: "Rack de servidor com cabos de rede organizados e luzes de status em sala técnica de empresa" },
    mensagem: MENSAGEM,
    botao: "Pedir a conta no WhatsApp",
    secundario: { rotulo: "Ver o exemplo de 10 pessoas", href: "#secao-5" },
    fatos: [
      { valor: "16 núcleos", rotulo: "é o mínimo por servidor, mesmo com menos núcleos físicos" },
      { valor: "CAL", rotulo: "uma por usuário ou uma por dispositivo" },
      { valor: "Nota de venda", rotulo: "a venda sai com nota fiscal de venda" },
      { valor: "12x sem juros", rotulo: "no cartão, também para CNPJ" },
    ],
  },
  assistente: {
    titulo: "Mande usuários, aparelhos e se há acesso remoto",
    texto: "É o bastante para a equipe dizer se a conta fecha em Standard e quantas CALs entram.",
    abertura: MENSAGEM,
    botao: "Enviar para a loja",
    perguntas: [
      { rotulo: "Edição", pergunta: "Qual edição você imagina?", opcoes: ["Standard", "Datacenter", "Não sei"] },
      { rotulo: "Acesso remoto", pergunta: "Alguém trabalha por área de trabalho remota?", opcoes: ["Sim", "Não", "Não sei"] },
      { rotulo: "Usuários", pergunta: "Quantas pessoas usam o servidor?", opcoes: ["Até 10", "11 a 25", "Mais de 25"] },
    ],
  },
  secoes: [
    {
      tipo: "texto",
      titulo: "Licenciamento de Windows Server sem dor de cabeça",
      paragrafos: [
        "Servidor de escritório contábil, clínica ou pequena indústria em Campinas costuma guardar arquivos, o sistema da empresa e as contas dos funcionários. A licença errada aparece tarde: na hora em que uma pessoa a mais entra, ou na hora em que o acesso remoto para de aceitar conexão. A Balão da Informática Anchieta é especialista nesse licenciamento e trabalha com licenças originais adquiridas de fornecedores oficiais Microsoft.",
        "A venda sai com nota fiscal de venda. A ativação e a instalação são feitas pela equipe. O que esta página faz, antes do preço, é a conta: edição, núcleos e CALs. O valor não está publicado aqui e o preço de tabela de terceiros também não é copiado como se fosse o da loja. O orçamento sai pelo WhatsApp (19) 98751-0267, em 12x sem juros no cartão, para pessoa física e para CNPJ.",
        "Mande três dados: número de usuários, número de computadores e se o time acessa o servidor por área de trabalho remota. Com isso a proposta já nasce com a edição e a quantidade. O escopo da implantação (arquivos, usuários, cópia de segurança) é combinado nessa mesma conversa, porque muda de empresa para empresa.",
      ],
    },
    {
      tipo: "regras",
      titulo: "Edições: Essentials, Standard e Datacenter",
      texto: "A edição depende do tamanho da empresa e de quantas máquinas virtuais o servidor vai rodar. A escolha final entra no orçamento.",
      itens: [
        {
          titulo: "Essentials",
          texto: "Cabe em empresa pequena, até 25 usuários e 50 dispositivos, num servidor de um processador, com até 10 núcleos e uma máquina virtual. É edição pensada para vir junto do hardware do servidor. Se a empresa passa desses limites, ou precisa de mais virtualização, o caminho é o Standard.",
        },
        {
          titulo: "Standard",
          texto: "É a edição da maioria dos escritórios. Licencia os núcleos físicos e, com todos os núcleos cobertos, permite duas máquinas virtuais, além do sistema que só existe para rodá-las. Exige CAL para quem acessa. Poucas máquinas virtuais: Standard.",
        },
        {
          titulo: "Datacenter",
          texto: "Mesma conta de núcleos e as mesmas CALs. A diferença é a virtualização: máquinas virtuais sem o teto de duas. Compensa quando o servidor existe para hospedar muitos sistemas isolados. Ambiente simples de arquivos não precisa dela.",
        },
      ],
    },
    {
      tipo: "texto",
      titulo: "Núcleos: a conta mínima",
      paragrafos: [
        "No Standard e no Datacenter, a licença acompanha os núcleos físicos do servidor. A regra publicada para o Windows Server 2025 é: todos os núcleos físicos entram na conta, com um piso de 8 núcleos por processador e de 16 núcleos por servidor. Um processador de 6 núcleos não licencia 6. Licencia 16, porque o piso do servidor é 16. Dois processadores de 8 núcleos também fecham em 16. Dois de 12 fecham em 24, porque aí o piso já foi superado.",
        "Existe outro modo, por máquina virtual, com piso de 8 núcleos por máquina virtual. Ele não está disponível para qualquer compra: a orientação de licenciamento restringe esse modo a assinatura ou a contrato com cobertura de atualização ativa. Para o servidor físico de uma empresa pequena, a conta usual continua sendo a dos núcleos físicos, com o piso de 16.",
        "A equipe confirma a conta em cima do processador real, não em cima de um anúncio. Uma foto da configuração ou o modelo do servidor bastam para o orçamento não chutar núcleo.",
      ],
      lista: [
        "Piso: 16 licenças de núcleo por servidor",
        "Piso: 8 licenças de núcleo por processador",
        "Processador com menos de 16 núcleos ainda pede as 16",
        "A conta por máquina virtual tem regra própria e não substitui o caso físico comum",
      ],
    },
    {
      tipo: "comparativo",
      titulo: "CALs: usuário, dispositivo e acesso remoto",
      texto: "A licença do servidor não inclui as pessoas. Quem acessa precisa de CAL. A escolha é por usuário ou por dispositivo, e o acesso remoto soma outra CAL.",
      colunas: ["", "CAL por usuário", "CAL por dispositivo"],
      linhas: [
        ["O que cobre", "Uma pessoa, em qualquer aparelho dela", "Um aparelho, usado por qualquer pessoa"],
        ["Quando costuma ser menos", "Mais aparelhos do que pessoas", "Mais pessoas do que aparelhos, revezando o mesmo PC"],
        ["Acesso remoto", "Soma uma CAL de área de trabalho remota por usuário", "Soma uma CAL de área de trabalho remota por dispositivo"],
        ["Misturar os dois tipos", "Pode, desde que cada acesso esteja coberto por um dos dois", "Pode, com o mesmo cuidado"],
      ],
    },
    {
      tipo: "dados",
      titulo: "Exemplo: escritório de 10 pessoas",
      texto:
        "Dez pessoas, quinze computadores, um servidor com um processador de até 16 núcleos, sem dezenas de máquinas virtuais. É um exemplo de conta, não uma tabela de preço. O valor sai no orçamento pelo WhatsApp.",
      linhas: [
        ["Licença do servidor", "16 núcleos, edição Standard"],
        ["Por que 16", "O piso por servidor é 16, mesmo que o processador tenha menos"],
        ["CAL base", "10 por usuário, em vez de 15 por dispositivo"],
        ["Por que por usuário", "Há mais computadores do que pessoas; a CAL de usuário cobre o notebook e o outro aparelho da mesma pessoa"],
        ["Se as 10 trabalham de fora", "Mais 10 CALs de área de trabalho remota, somadas às 10 de base"],
        ["Se ninguém trabalha de fora", "As CALs de acesso remoto ficam de fora; administrar o servidor não é a mesma coisa que o time inteiro trabalhar nele"],
        ["Edição", "Standard, enquanto houver poucas máquinas virtuais"],
      ],
    },
    {
      tipo: "texto",
      titulo: "Implantação na loja, com o escopo combinado",
      paragrafos: [
        "Licença sem instalação deixa o servidor na caixa. A Balão da Informática Anchieta faz a ativação e a instalação. O que entra além disso — usuários, pastas, cópia de segurança, impressora na rede — depende do que a empresa já tem e é escrito no orçamento. Não há um pacote único publicado nesta página, porque um escritório de arquivos e um que roda o sistema de gestão não pedem o mesmo trabalho.",
        "Se o disco do servidor antigo já não abre, pare de reinsalar por cima e fale de recuperação de dados antes. Se a empresa também precisa de acompanhamento de rede e máquinas no mês a mês, o caminho vizinho é o de sites e suporte de TI, no mesmo endereço.",
        "A CAL de uma versão permite acesso a essa versão e às anteriores. Uma CAL do Windows Server 2025 cobre o Server 2025 e também o Server 2022. O contrário não vale: CAL antiga não cobre servidor mais novo. Por isso a versão da CAL entra no orçamento junto com a versão do servidor.",
      ],
    },
    {
      tipo: "texto",
      titulo: "Proposta, nota e parcelamento",
      paragrafos: [
        "A proposta lista edição, núcleos, CALs de base e, se houver, CALs de acesso remoto. A venda sai com nota fiscal de venda. São licenças originais adquiridas de fornecedores oficiais Microsoft. No cartão, 12x sem juros para pessoa física e para CNPJ.",
        "Nenhum valor está nesta página de propósito. Servidor e CAL mudam com o processador e com o número de pessoas, e copiar um preço de vitrine alheia induz a empresa a comprar núcleo a menos. O orçamento é pelo WhatsApp (19) 98751-0267 ou pelo telefone (19) 3255-1661. Loja na Av. Anchieta, 789, Cambuí, de segunda a sexta, das 9h às 18h, e sábado das 9h às 13h.",
      ],
    },
    {
      tipo: "retorno",
      titulo: "Pedir retorno rápido",
      texto: "Usuários, dispositivos, se há acesso remoto e o CNPJ. A equipe devolve a conta de núcleos e CALs.",
      assunto: "Windows Server",
      campos: [
        { nome: "usuarios", rotulo: "Número de usuários" },
        { nome: "dispositivos", rotulo: "Número de dispositivos" },
        { nome: "remoto", rotulo: "Acesso remoto?", opcoes: ["Sim", "Não", "Não sei"] },
        { nome: "cnpj", rotulo: "CNPJ" },
      ],
    },
    {
      tipo: "atalhos",
      titulo: "O que combina com o servidor",
      itens: [
        {
          titulo: "Hub de licenças",
          texto: "Windows dos PCs e Office no mesmo levantamento.",
          href: "/microsoft",
          imagem: "/images/landing/v3/microsoft/microsoft.webp", alt: "Escritório claro com notebook e monitor prontos para uso com Windows e Office",
        },
        {
          titulo: "Windows nos computadores",
          texto: "Cada PC da empresa também precisa da licença certa.",
          href: "/microsoft/windows",
          imagem: "/images/landing/v3/microsoft/microsoft.webp", alt: "Escritório claro com notebook e monitor prontos para uso com Windows e Office",
        },
        {
          titulo: "Recuperação de dados",
          texto: "Disco de servidor que já não abre, antes de reinstalar.",
          href: "/recuperacaodados",
          imagem: "/images/landing/v3/android/recuperacaodados.webp", alt: "Técnico segurando um SSD ao lado de notebook e disco externo para recuperação de dados",
        },
        {
          titulo: "Suporte de TI",
          texto: "Rede, backup e acompanhamento, além da licença.",
          href: "/sistemas",
          imagem: "/images/landing/v3/microsoft-windows-server/sistemas.webp", alt: "Rack de servidor com cabos de rede organizados e luzes de status em sala técnica de empresa",
        },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Quantas CALs de Windows Server minha empresa precisa?",
      resposta:
        "É preciso uma CAL base para cada usuário ou cada dispositivo que acessa o servidor (a escolha é por usuário ou por dispositivo), mais CALs RDS se houver acesso por área de trabalho remota. A Balão da Informática Anchieta faz esse cálculo grátis pelo WhatsApp (19) 98751-0267.",
    },
    {
      pergunta: "Windows Server Standard ou Datacenter?",
      resposta:
        "O Standard atende a maioria das pequenas empresas com poucas máquinas virtuais; o Datacenter compensa em ambientes muito virtualizados. Os dois são licenciados por núcleo físico e exigem CALs.",
    },
    {
      pergunta: "CAL do Windows Server 2025 serve para o Server 2022?",
      resposta:
        "Sim, CALs de uma versão permitem acesso à mesma versão e às anteriores, segundo a orientação de licenciamento da Microsoft.",
    },
    {
      pergunta: "Um servidor de um processador pequeno licencia quantos núcleos?",
      resposta:
        "No mínimo 16 núcleos por servidor e 8 por processador, mesmo que o chip tenha menos. A conta exata sai em cima do modelo do servidor, no orçamento pelo WhatsApp.",
    },
    {
      pergunta: "A venda sai com nota e parcela para CNPJ?",
      resposta:
        "Sim. A venda sai com nota fiscal de venda e o cartão parcela em 12x sem juros para pessoa física e para CNPJ. São licenças originais adquiridas de fornecedores oficiais Microsoft.",
    },
    {
      pergunta: "Vocês instalam o servidor?",
      resposta:
        "Sim. A ativação e a instalação são feitas pela equipe da loja. Usuários, pastas e cópia de segurança entram no orçamento, conforme o que a empresa já tem.",
    },
  ],
  tituloDasPerguntas: "Perguntas frequentes",
  temas: ["licenca", "empresa", "servidor", "windows"],
  termosDoBlog: ["servidor", "windows server", "backup", "empresa", "rede"],
  relacionadas: ["microsoft", "microsoft/windows", "sistemas", "recuperacaodados"],
  final: {
    titulo: "Mande usuários, computadores e se o acesso é remoto",
    texto: "Av. Anchieta, 789, Cambuí. Segunda a sexta, 9h às 18h. Sábado, 9h às 13h. Conta de núcleos e CALs, nota fiscal de venda e 12x sem juros também para CNPJ.",
    botao: "Chamar no WhatsApp",
    mensagem: MENSAGEM,
  },
};
