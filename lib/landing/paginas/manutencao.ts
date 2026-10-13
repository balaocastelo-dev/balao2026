import type { PaginaDeCaptacao } from "../tipos";

export const manutencao: PaginaDeCaptacao = {
  slug: "manutencao",
  nome: "Assistência técnica de computador e notebook",
  chamada: "Lento, esquentando, sem ligar ou com tela quebrada: diagnóstico e orçamento antes de mexer.",
  seo: {
    titulo: "Assistência Técnica de Computador e Notebook em Campinas (Cambuí) | Balão da Informática",
    descricao:
      "Conserto de notebook e PC no Cambuí, em Campinas: lentidão, calor, tela, teclado, SSD, memória e formatação com backup. Orçamento no WhatsApp antes do serviço.",
    palavras: [
      "assistência técnica de notebook em Campinas",
      "conserto de computador Campinas",
      "manutenção de notebook Cambuí",
      "notebook esquentando Campinas",
      "computador lento o que fazer",
      "troca de tela de notebook Campinas",
      "upgrade de SSD notebook",
      "formatação com backup Campinas",
      "limpeza de notebook e troca de pasta térmica",
      "assistência técnica perto de mim Campinas",
    ],
    tipoDeServico: "Assistência técnica de computadores e notebooks",
  },
  hero: {
    contexto: "Bancada própria no Cambuí, em Campinas",
    titulo: "Seu computador de volta ao normal, sem susto no orçamento",
    texto:
      "Notebook lento, esquentando, desligando sozinho ou que não liga: a bancada da Balão descobre a causa, manda o orçamento pelo WhatsApp e só começa o serviço depois que você aprovar.",
    imagem: { src: "/images/landing/v2/manutencao.jpg", alt: "Mãos de técnico limpando a ventoinha de um notebook aberto na bancada" },
    mensagem: "Olá! Vim pela página de assistência técnica da Balão e quero um orçamento para o meu computador/notebook.",
    botao: "Pedir orçamento no WhatsApp",
    secundario: { rotulo: "Ver o que fazemos", href: "#secao-1" },
    fatos: [
      { valor: "Orçamento antes", rotulo: "nada é feito sem a sua aprovação" },
      { valor: "90 dias", rotulo: "de garantia no serviço, como manda a lei" },
      { valor: "Backup", rotulo: "seus arquivos ficam com você" },
      { valor: "Peças na loja", rotulo: "SSD e memória para trocar na hora" },
    ],
  },
  assistente: {
    titulo: "Orçamento em três toques",
    texto: "Responda e a mensagem já vai pronta para o técnico.",
    abertura: "Olá! Vim pela página de assistência técnica e quero um orçamento.",
    fecho: "Posso mandar foto ou vídeo do problema?",
    botao: "Enviar para o técnico",
    perguntas: [
      { rotulo: "Aparelho", pergunta: "O que precisa de conserto?", opcoes: ["Notebook", "PC de mesa", "PC gamer", "All-in-one", "MacBook"] },
      {
        rotulo: "Problema",
        pergunta: "O que está acontecendo?",
        varias: true,
        opcoes: ["Muito lento", "Esquenta ou desliga", "Não liga", "Tela quebrada ou com listras", "Teclado falhando", "Vírus ou janelas estranhas", "Quero formatar", "Quero um upgrade"],
      },
      { rotulo: "Urgência", pergunta: "Para quando você precisa?", opcoes: ["Hoje", "Esta semana", "Sem pressa"] },
    ],
  },
  secoes: [
    {
      tipo: "dores",
      titulo: "Os defeitos que mais chegam ao balcão",
      texto:
        "Quase todo problema de computador começa com um sinal pequeno. Quanto antes ele chega à bancada, mais barato costuma ser o conserto.",
      itens: [
        {
          titulo: "Lento para ligar e para abrir tudo",
          texto: "Na maioria das vezes é HD mecânico cansado, pouca memória ou sistema cheio de programas. Um SSD e uma limpeza de sistema mudam o dia a dia.",
        },
        {
          titulo: "Esquenta, faz barulho ou desliga sozinho",
          texto: "Poeira na ventoinha e pasta térmica ressecada. Limpeza interna e pasta nova devolvem a temperatura e evitam dano na placa.",
        },
        {
          titulo: "Não liga ou não carrega",
          texto: "Pode ser carregador, conector, bateria ou placa. O teste separa o que é barato (fonte) do que exige reparo.",
        },
        {
          titulo: "Tela quebrada, com listras ou escura",
          texto: "Trocamos tela e flat de notebook e conferimos se o defeito não está na placa de vídeo antes de você gastar.",
        },
        {
          titulo: "Teclado com teclas mortas",
          texto: "Líquido derramado ou desgaste. Troca do teclado ou do conjunto, conforme o modelo.",
        },
        {
          titulo: "Vírus, propaganda e janelas sozinhas",
          texto: "Limpeza do sistema ou formatação com backup dos documentos, fotos e favoritos do navegador.",
        },
      ],
    },
    {
      tipo: "passos",
      titulo: "Como o conserto acontece",
      texto: "Sem chamado, sem protocolo e sem surpresa no fim. Você acompanha tudo pelo WhatsApp.",
      itens: [
        { titulo: "Conte o problema", texto: "Pelo WhatsApp, com foto ou vídeo se puder. Muitas vezes dá para adiantar a causa provável." },
        { titulo: "Traga à loja", texto: "No Cambuí, de segunda a sábado. Se for em Campinas e região, combine a retirada." },
        { titulo: "Receba o orçamento", texto: "O técnico testa, encontra a causa e manda valor e prazo. Você decide." },
        { titulo: "Retire funcionando", texto: "Serviço feito, testado na sua frente e com garantia de 90 dias." },
      ],
    },
    {
      tipo: "vitrine",
      titulo: "Peças para o upgrade, prontas na loja",
      texto:
        "SSD e memória são os dois upgrades que mais fazem diferença em computador lento. A bancada confere a compatibilidade com o seu modelo antes da troca.",
      regras: [
        {
          id: "ssd",
          titulo: "SSD para trocar o HD",
          subtitulo: "NVMe para quem tem slot M.2, SATA para notebooks e PCs mais antigos",
          categorias: ["Hardware/SSD"],
          excluir: ["externo", "portatil", "case", "gaveta", "adaptador", "suporte", "cabo", "dissipador"],
          precoMin: 180,
          precoMax: 700,
          ordem: "maior",
          verTodos: { rotulo: "Ver todos os SSDs, com filtros", href: "/categoria/hardware-ssd" },
        },
        {
          id: "memoria",
          titulo: "Memória RAM",
          subtitulo: "DDR4 e DDR5; o técnico confirma o tipo e a frequência do seu computador",
          categorias: ["Hardware/Memória RAM"],
          excluir: ["ddr3", "ddr2"],
          precoMin: 400,
          precoMax: 1700,
          porMarca: 4,
          ordem: "menor",
        },
        {
          id: "manutencao",
          titulo: "Pasta térmica e limpeza",
          subtitulo: "Para quem faz a manutenção em casa",
          categorias: ["Hardware/Coolers/Pasta Térmica", "Informática/Limpeza e Manutenção"],
          nomeContem: ["pasta", "limpa", "limpeza", "spray", "alcool", "isopropilico", "pincel", "kit"],
          ordem: "menor",
          limite: 8,
        },
      ],
    },
    {
      tipo: "texto",
      titulo: "Formatação não é o primeiro remédio",
      paragrafos: [
        "Muita gente chega pedindo formatação porque o computador ficou lento. Às vezes é isso mesmo; em muitos casos, porém, o gargalo está no disco. Um HD mecânico de cinco anos atrás faz o Windows atual parecer travado, e formatar só esconde o problema por algumas semanas.",
        "Por isso o primeiro passo na bancada é o diagnóstico: saúde do disco, temperatura, memória em uso e o que está abrindo junto com o sistema. Com isso na mão, o técnico diz se compensa trocar o HD por um SSD, colocar mais memória, só limpar o sistema ou, em último caso, formatar com backup.",
        "Quando o conserto não compensa — um notebook muito antigo com placa danificada, por exemplo — você ouve isso antes de gastar, junto com as opções de notebook novo ou seminovo da loja.",
      ],
      lista: [
        "Backup de documentos, fotos e favoritos antes de qualquer formatação",
        "Clonagem do sistema na troca de HD por SSD, quando o disco permite",
        "Teste de temperatura depois da limpeza interna",
      ],
      imagem: { src: "/images/landing/v2/trocas-e-devolucoes.jpg", alt: "Mãos de luva conferindo um notebook na bancada antes do diagnóstico" },
    },
    {
      tipo: "comparativo",
      titulo: "Consertar, fazer upgrade ou trocar?",
      texto: "A conta que o técnico faz com você no balcão.",
      colunas: ["Situação", "O que costuma resolver", "Quando pensar em trocar"],
      linhas: [
        ["Lento, mas liga normal", "SSD e mais memória", "Processador muito antigo para o que você usa"],
        ["Esquenta e desliga", "Limpeza interna e pasta térmica", "Placa já danificada pelo calor"],
        ["Tela quebrada", "Troca da tela", "Quando a tela custa perto de um notebook novo"],
        ["Não liga", "Fonte, conector ou bateria", "Placa sem reparo ou peça fora de linha"],
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Quanto custa o diagnóstico?",
      resposta:
        "Pergunte pelo WhatsApp antes de trazer: a equipe passa a condição do momento. O importante é que nenhum serviço é feito sem você aprovar o orçamento.",
    },
    {
      pergunta: "Perco meus arquivos no conserto?",
      resposta:
        "Não. Quando o serviço envolve formatação ou troca de disco, fazemos backup de documentos, fotos e favoritos antes. Se o disco já está falhando, o caso vira recuperação de dados e você fica sabendo antes.",
    },
    {
      pergunta: "Trocar o HD por SSD vale a pena em notebook antigo?",
      resposta:
        "Na maioria das vezes, sim: é o upgrade que mais muda a velocidade de ligar e abrir programas. O técnico confere se o seu notebook aceita SSD SATA ou NVMe e se o resto da máquina acompanha.",
    },
    {
      pergunta: "Qual é a garantia do serviço?",
      resposta: "Serviço de assistência tem garantia de 90 dias, como prevê o Código de Defesa do Consumidor. As peças novas seguem a garantia do fabricante.",
    },
    {
      pergunta: "Vocês atendem empresas?",
      resposta:
        "Sim. Para empresa, mande quantas máquinas e qual o problema principal; a equipe combina a melhor forma de atender, na loja ou retirando os equipamentos.",
    },
    {
      pergunta: "Consertam MacBook e iMac?",
      resposta: "Sim, a assistência Apple fica no mesmo endereço. Veja a página de reparo Apple para os detalhes.",
    },
  ],
  temas: ["assistencia", "notebook", "pc", "upgrade", "ssd", "memoria", "manutencao", "dados"],
  termosDoBlog: ["manutenção", "notebook", "ssd", "memória ram", "diagnóstico", "fonte", "esquenta", "lento", "upgrade", "pc não liga"],
  relacionadas: ["recuperacaodados", "carregadores", "reparoapple", "notebooks"],
  final: {
    titulo: "Traga o computador ou mande o problema agora",
    texto: "Uma mensagem com o modelo e o defeito já adianta o diagnóstico. A bancada fica na loja do Cambuí, na Av. Anchieta.",
    botao: "Falar com a assistência",
  },
};
