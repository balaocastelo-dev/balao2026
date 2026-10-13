import type { PaginaDeCaptacao } from "../tipos";

// Lead quente e com pressa: a pessoa acabou de perder arquivos. O conselho que
// mais ajuda vem primeiro (pare de usar o disco), depois o que cada mídia
// costuma ter, como funciona e, no fim, o backup para não passar por isso de
// novo. Sem taxa de sucesso, sem prazo e sem "laboratório" que a loja não
// confirmou.
export const recuperacaodados: PaginaDeCaptacao = {
  slug: "recuperacaodados",
  nome: "Recuperação de dados",
  chamada: "Perdeu fotos ou documentos? Pare de usar o disco e fale com a bancada antes de tentar qualquer coisa.",
  seo: {
    titulo: "Recuperação de Dados em Campinas: HD, SSD, Pen Drive e Cartão | Balão",
    descricao:
      "Perdeu arquivos de HD, SSD, pen drive, cartão de memória ou notebook que não liga? Pare de usar o disco e traga à bancada do Cambuí, em Campinas. Orçamento antes.",
    palavras: [
      "recuperação de dados em Campinas",
      "recuperar arquivos de HD externo Campinas",
      "HD externo não reconhece o que fazer",
      "HD fazendo barulho de estalo",
      "recuperar fotos de cartão de memória Campinas",
      "pen drive pedindo para formatar",
      "recuperar arquivos apagados sem querer",
      "notebook não liga como recuperar arquivos",
      "recuperação de dados SSD Campinas",
      "formatei o HD por engano",
      "recuperação de dados Cambuí",
    ],
    tipoDeServico: "Recuperação de dados",
  },
  hero: {
    contexto: "Recuperação de dados no Cambuí, em Campinas",
    titulo: "Seus arquivos de volta: o primeiro passo é parar de usar o disco",
    texto:
      "HD que não aparece, SSD que sumiu, pen drive pedindo formatação, cartão da câmera ilegível ou notebook que não liga. Desligue, não instale nenhum programa e fale com a bancada: o técnico avalia a mídia e manda o orçamento antes de qualquer tentativa.",
    imagem: {
      src: "/images/landing/v2/recuperacaodados.jpg",
      alt: "HD aberto na bancada, com o prato e a cabeça de leitura à mostra, e a mão de técnico de luva",
    },
    mensagem: "Olá! Vim pela página de recuperação de dados da Balão. Perdi arquivos e já parei de usar o disco. Podem me ajudar?",
    botao: "Falar com a bancada agora",
    secundario: { rotulo: "O que fazer e o que evitar", href: "#secao-1" },
    fatos: [
      { valor: "Pare de usar", rotulo: "o disco: é o que mais ajuda agora" },
      { valor: "Orçamento antes", rotulo: "nada é tentado sem a sua aprovação" },
      { valor: "Todas as mídias", rotulo: "HD, SSD, pen drive, cartão e notebook" },
      { valor: "Backup na loja", rotulo: "SSD e HD externo para guardar a cópia" },
    ],
  },
  assistente: {
    titulo: "Conte o que aconteceu",
    texto: "Três respostas e o técnico já sabe por onde começar.",
    abertura: "Olá! Vim pela página de recuperação de dados e preciso recuperar arquivos.",
    fecho: "Já parei de usar o disco. Quando posso levar à loja?",
    botao: "Enviar para a bancada",
    perguntas: [
      {
        rotulo: "Mídia",
        pergunta: "Onde estavam os arquivos?",
        opcoes: ["HD externo", "SSD externo", "HD ou SSD do computador", "Notebook que não liga", "Pen drive", "Cartão de memória"],
      },
      {
        rotulo: "O que aconteceu",
        pergunta: "O que está acontecendo?",
        varias: true,
        opcoes: [
          "Não aparece no computador",
          "Faz estalo ou barulho estranho",
          "Pede para formatar",
          "Apaguei sem querer",
          "Formatei por engano",
          "Caiu ou molhou",
          "Arquivos sumiram ou não abrem",
        ],
      },
      {
        rotulo: "O que precisa voltar",
        pergunta: "O que é mais importante recuperar?",
        varias: true,
        opcoes: ["Fotos e vídeos", "Documentos e planilhas", "Arquivos de trabalho ou da empresa", "Tudo o que der"],
      },
    ],
  },
  secoes: [
    {
      tipo: "regras",
      titulo: "Nos primeiros minutos, o que fazer e o que evitar",
      texto:
        "O que você faz agora pesa mais do que qualquer programa. A maior parte dos casos que complicam na bancada complicou antes, em casa, com a mídia ainda sendo usada.",
      itens: [
        {
          titulo: "Faça agora",
          texto: "O objetivo é congelar a mídia do jeito que está, sem gravar nada novo nela.",
          pontos: [
            "Desligue o computador ou desconecte o HD, SSD, pen drive ou cartão",
            "Anote o que aconteceu: queda, barulho, mensagem na tela, o que você clicou",
            "Separe a lista do que é mais importante (pasta, tipo de arquivo, data)",
            "Mande uma mensagem para a bancada antes de tentar qualquer coisa",
          ],
        },
        {
          titulo: "Evite",
          texto: "Cada uma dessas tentativas pode gravar por cima do que você quer de volta ou piorar um dano físico.",
          pontos: [
            "Formatar quando o Windows ou o celular pedirem",
            "Instalar programa de recuperação no mesmo disco onde estavam os arquivos",
            "Ligar e desligar um HD que faz estalo para ver se volta",
            "Abrir o HD, bater nele ou colocar no congelador",
            "Reinstalar o sistema no computador que perdeu os arquivos",
          ],
        },
      ],
    },
    {
      tipo: "dores",
      titulo: "Cada mídia perde arquivos de um jeito",
      texto: "Saber qual é o seu caso ajuda o técnico a responder de primeira. Estes são os que mais chegam ao balcão.",
      itens: [
        {
          titulo: "HD externo que não aparece",
          texto: "Pode ser o cabo, o circuito da caixinha USB ou o próprio disco. Às vezes o disco está bom e só a parte USB falhou.",
        },
        {
          titulo: "HD com estalo, chiado ou que não gira",
          texto: "Sinal de dano mecânico. Quanto menos tempo ligado, melhor: cada tentativa pode riscar o prato onde os dados estão gravados.",
        },
        {
          titulo: "SSD que sumiu de repente",
          texto: "SSD costuma falhar sem aviso, por controladora ou firmware. Desligue e não fique reconectando em vários computadores.",
        },
        {
          titulo: "Pen drive ou cartão pedindo formatação",
          texto: "O sistema de arquivos se corrompeu, muitas vezes por tirar sem ejetar. Não formate: os arquivos costumam continuar lá.",
        },
        {
          titulo: "Apagou ou formatou por engano",
          texto: "Os arquivos ficam no disco até algo novo ocupar o lugar. Parar de usar na hora é o que mantém a chance de recuperar.",
        },
        {
          titulo: "Notebook que não liga",
          texto: "Na maioria das vezes o defeito é na placa ou na fonte, e o disco está inteiro. Os arquivos podem ser copiados direto dele.",
        },
      ],
    },
    {
      tipo: "texto",
      titulo: "Por que parar de usar faz tanta diferença",
      paragrafos: [
        "Quando você apaga um arquivo ou formata um disco, o sistema não limpa os dados na hora: ele só marca aquele espaço como livre. O conteúdo continua gravado até que algo novo ocupe o mesmo lugar. Por isso, abrir o navegador, baixar um programa de recuperação ou deixar o Windows trabalhar no mesmo disco pode apagar de vez justamente o que você quer de volta.",
        "No HD mecânico o risco é outro. Ele guarda os dados em pratos que giram rápido, lidos por uma cabeça que passa a uma fração de milímetro da superfície. Se o HD caiu ou começou a estalar, essa cabeça pode estar encostando no prato. A cada vez que ele é ligado, o dano aumenta. Aqui, o melhor que você pode fazer é não ligar mais e deixar a avaliação com o técnico.",
        "SSD, pen drive e cartão de memória não têm peças móveis e falham de outro jeito: por defeito na controladora ou corrupção do sistema de arquivos. Num SSD em uso, arquivos apagados podem ser limpos pelo próprio sistema em pouco tempo, então desligar logo conta ainda mais. Em todos os casos, o técnico avalia a mídia, diz o que conseguiu ver e manda o orçamento. Você decide se segue.",
      ],
      lista: [
        "Não grave nada no disco afetado, nem programa de recuperação",
        "HD com barulho: não ligue de novo",
        "SSD: desligue logo, mesmo que ainda apareça",
        "Pen drive e cartão: não aceite formatar",
      ],
    },
    {
      tipo: "comparativo",
      titulo: "Defeito lógico ou físico?",
      texto: "É a primeira coisa que o diagnóstico separa, porque muda o caminho da recuperação e o orçamento.",
      colunas: ["O que você vê", "O que costuma ser", "O que fazer até chegar à loja"],
      linhas: [
        ["Arquivo apagado ou disco formatado", "Lógico: os dados ainda estão no disco", "Parar de usar e não instalar nada nele"],
        ["Pede para formatar ao conectar", "Lógico: sistema de arquivos corrompido", "Clicar em cancelar e desconectar"],
        ["Aparece, mas os arquivos não abrem", "Lógico ou setores com defeito", "Não copiar e colar repetidas vezes"],
        ["Estalo, chiado ou disco que não gira", "Físico: mecânica do HD", "Não ligar de novo"],
        ["Caiu, molhou ou queimou", "Físico: placa ou mecânica", "Não secar no secador e não ligar"],
        ["Notebook não liga", "Quase sempre fora do disco", "Trazer o notebook inteiro"],
      ],
    },
    {
      tipo: "passos",
      titulo: "Como a recuperação acontece",
      texto: "Você acompanha pelo WhatsApp e só paga pelo que aprovar.",
      itens: [
        {
          titulo: "Conte o caso",
          texto: "Pelo WhatsApp: qual mídia, o que aconteceu e o que é mais importante recuperar. Uma foto da etiqueta do disco ajuda.",
        },
        {
          titulo: "Traga a mídia desligada",
          texto: "À loja do Cambuí, de segunda a sábado. Notebook que não liga vem inteiro, com o carregador.",
        },
        {
          titulo: "Diagnóstico e orçamento",
          texto: "O técnico avalia se o defeito é lógico ou físico, diz o que conseguiu ver e manda valor e caminho. Você decide.",
        },
        {
          titulo: "Confira e guarde a cópia",
          texto: "Você confere os arquivos recuperados e escolhe onde ficam: num disco seu ou num SSD ou HD externo novo.",
        },
      ],
    },
    {
      tipo: "texto",
      titulo: "Para não passar por isso de novo",
      paragrafos: [
        "Todo disco um dia falha. HD mecânico se desgasta, SSD pode parar sem aviso, pen drive e cartão de memória se corrompem quando são tirados com arquivo sendo gravado. A única proteção de verdade é ter os arquivos importantes em mais de um lugar.",
        "Uma regra simples que funciona para casa e para empresa: três cópias dos arquivos importantes, em dois tipos de mídia diferentes, e uma delas fora do computador do dia a dia. Na prática, isso pode ser o computador, um SSD ou HD externo atualizado toda semana e uma nuvem. Pen drive e cartão de memória servem para transportar arquivos, não para guardar a única cópia.",
        "Se você não sabe por onde começar, pergunte no balcão: a equipe indica o tamanho de disco para o seu volume de fotos e documentos e ajuda a programar a cópia automática no computador.",
      ],
      lista: [
        "SSD externo: rápido, leve e resiste melhor a pancada",
        "HD externo: mais espaço pelo mesmo investimento, bom para backup semanal",
        "Faça a cópia com frequência e confira de vez em quando se ela abre",
      ],
    },
    {
      tipo: "vitrine",
      titulo: "Onde guardar a cópia depois da recuperação",
      texto:
        "Disco novo para receber os arquivos recuperados e virar o seu backup. Os itens com a faixa Pronta entrega estão com fornecedor local.",
      regras: [
        {
          id: "ssd-externo",
          titulo: "SSD externo portátil",
          subtitulo: "Rápido e resistente para levar na mochila e fazer a cópia dos arquivos importantes",
          categorias: ["Hardware/SSD/SSD Externo", "Armazenamento/HD e SSD Externo"],
          nomeContem: ["ssd", "drive portatil"],
          excluir: ["sata", "case", "gaveta", "adaptador", "cabo"],
          ordem: "menor",
          limite: 10,
          verTodos: { rotulo: "Ver todos os SSDs externos", href: "/categoria/hardware-ssd-ssd-externo" },
        },
        {
          id: "hd-externo",
          titulo: "HD externo para backup",
          subtitulo: "Mais espaço para guardar anos de fotos, vídeos e documentos",
          categorias: ["Hardware/Disco Rígido (HD)/Pessoal/Externo", "Armazenamento/HD e SSD Externo"],
          excluir: ["ssd", "case", "gaveta"],
          ordem: "menor",
          limite: 8,
          verTodos: { rotulo: "Ver HDs e SSDs externos", href: "/categoria/armazenamento-hd-e-ssd-externo" },
        },
        {
          id: "transporte",
          titulo: "Case, pen drive e cartão de memória",
          subtitulo: "Case para ler o HD de um notebook antigo; pen drive e cartão novos para substituir o que falhou",
          categorias: ["Armazenamento/Cases para HD e SSD", "Armazenamento/Pen Drive", "Armazenamento/Cartão de Memória"],
          excluir: ["4gb", "8gb"],
          ordem: "maior",
          porMarca: 2,
          limite: 10,
        },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Dá para recuperar arquivos apagados da lixeira?",
      resposta:
        "Muitas vezes sim, desde que o disco não tenha sido muito usado depois. O arquivo apagado continua gravado até algo novo ocupar o espaço; por isso o mais importante é parar de usar o disco e não instalar programa nele. Em SSD a chance cai mais rápido, então desligue logo.",
    },
    {
      pergunta: "Meu HD externo está fazendo barulho de estalo. O que eu faço?",
      resposta:
        "Desligue e não conecte de novo. Estalo, chiado ou disco que não gira costumam ser dano mecânico, e cada vez que ele liga o dano pode aumentar. Traga para a bancada avaliar antes de qualquer tentativa.",
    },
    {
      pergunta: "Meu notebook não liga. Perdi meus arquivos?",
      resposta:
        "Na maioria das vezes, não. Quando o notebook não liga, o defeito costuma estar na placa, na fonte ou na bateria, e o disco segue inteiro. O técnico pode copiar os arquivos direto do disco e, à parte, orçar o conserto do notebook.",
    },
    {
      pergunta: "O pen drive ou o cartão de memória pede para formatar. Formato?",
      resposta:
        "Não. Esse aviso aparece quando o sistema de arquivos se corrompe, e formatar apaga a estrutura que ajuda a encontrar os arquivos. Clique em cancelar, tire o pen drive ou o cartão e traga para avaliação.",
    },
    {
      pergunta: "Programa de recuperação gratuito funciona?",
      resposta:
        "Em exclusão simples, às vezes funciona, mas nunca instale o programa no mesmo disco onde estavam os arquivos. Se o disco tem barulho, falhas de leitura ou sumiu do computador, o programa força a leitura e pode piorar. Nesses casos, deixe com a bancada.",
    },
    {
      pergunta: "Quanto custa a recuperação de dados?",
      resposta:
        "Depende do tipo de mídia e do defeito, lógico ou físico; por isso o valor sai depois do diagnóstico. O técnico manda o orçamento pelo WhatsApp e nada é feito sem a sua aprovação. Pergunte no WhatsApp como funciona o diagnóstico do seu caso.",
    },
    {
      pergunta: "Quanto tempo demora para recuperar os arquivos?",
      resposta:
        "Varia muito de um caso para outro: um pen drive corrompido não se compara a um HD com dano mecânico. O prazo vem junto com o orçamento, depois que o técnico avalia a mídia.",
    },
    {
      pergunta: "Formatei o HD por engano. Ainda dá?",
      resposta:
        "Muitas vezes dá, principalmente se foi uma formatação rápida e nada foi gravado depois. Não reinstale o sistema e não copie arquivos novos para ele. Desconecte e traga para a bancada.",
    },
  ],
  temas: ["dados", "assistencia", "ssd", "notebook", "backup", "empresa"],
  termosDoBlog: ["backup", "recuperação de dados", "hd externo", "ssd externo", "pen drive", "cartão de memória", "arquivos", "ssd"],
  relacionadas: ["manutencao", "notebooks", "reparoapple"],
  final: {
    titulo: "Pare de usar o disco e mande o caso agora",
    texto:
      "Uma mensagem com a mídia, o que aconteceu e o que é mais importante já adianta o diagnóstico. A bancada fica na loja do Cambuí, na Av. Anchieta, 789.",
    botao: "Falar com a bancada",
    mensagem: "Olá! Perdi arquivos e já parei de usar o disco. Quero saber como trazer para avaliação.",
  },
};
