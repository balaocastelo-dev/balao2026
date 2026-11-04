import type { PaginaDeCaptacao } from "../tipos";

const MENSAGEM =
  "Olá! Quero fazer upgrade no meu notebook. Modelo: ____. Quero ( ) SSD ( ) memória. Pode me passar preço e prazo?";

export const upgradeSsd: PaginaDeCaptacao = {
  slug: "upgrade-ssd",
  nome: "Upgrade de SSD e memória",
  chamada: "Troca de HD por SSD e aumento de memória no Cambuí, com a peça da loja e os arquivos preservados quando o disco permite.",
  seo: {
    titulo: "Upgrade de SSD e Memória em Campinas | Pronto no Dia – Balão Anchieta",
    descricao:
      "Notebook lento? Trocamos HD por SSD e aumentamos a memória no Cambuí, com peça na loja e seus arquivos preservados. Preço pelo WhatsApp.",
    palavras: [
      "upgrade ssd notebook campinas",
      "trocar hd por ssd campinas",
      "colocar ssd no notebook",
      "aumentar memória ram notebook campinas",
      "upgrade notebook cambuí",
      "clonar hd para ssd",
      "ssd sata ou nvme notebook",
      "8 ou 16 gb de ram notebook",
    ],
    tipoDeServico: "Upgrade de SSD e memória RAM",
    catalogo: ["Troca de HD por SSD", "Clonagem de disco", "Aumento de memória RAM"],
  },
  hero: {
    contexto: "Bancada própria no Cambuí, em Campinas",
    titulo: "Seu notebook lento volta a andar, sem perder os arquivos",
    texto:
      "Traga o notebook à Av. Anchieta. A bancada confirma se ele aceita SSD SATA ou NVMe, troca com peça da loja e devolve a máquina testada. Quando o disco permite, os arquivos vão junto na clonagem. Preço e prazo confirmados pelo WhatsApp.",
    imagem: { src: "/images/landing/v2/manutencao.jpg", alt: "Notebook aberto na bancada da loja durante um upgrade de SSD" },
    mensagem: MENSAGEM,
    botao: "Pedir preço no WhatsApp",
    secundario: { rotulo: "Ver SSDs em estoque", href: "#vitrine" },
    fatos: [
      { valor: "Peça da loja", rotulo: "SSD e memória no mesmo balcão" },
      { valor: "Compatibilidade", rotulo: "SATA ou NVMe conferidos pelo modelo" },
      { valor: "Arquivos", rotulo: "clonagem quando o disco permite" },
      { valor: "Orçamento antes", rotulo: "nada é feito sem a sua aprovação" },
    ],
  },
  assistente: {
    titulo: "Diga o modelo e o que você quer",
    texto: "Com isso a equipe já separa a peça e responde preço e prazo.",
    abertura: MENSAGEM,
    botao: "Enviar para a bancada",
    perguntas: [
      { rotulo: "Quero", pergunta: "O que você quer fazer?", opcoes: ["Trocar HD por SSD", "Aumentar a memória", "SSD e memória"] },
      { rotulo: "Hoje tem", pergunta: "O notebook tem HD ou SSD hoje?", opcoes: ["HD", "SSD", "Não sei"] },
      { rotulo: "Uso", pergunta: "Para que você usa?", opcoes: ["Estudo e navegação", "Trabalho com vários programas", "Jogos ou edição"] },
    ],
  },
  secoes: [
    {
      tipo: "texto",
      titulo: "Seu notebook fica mais rápido — sem perder arquivos",
      paragrafos: [
        "Notebook com HD mecânico espera o disco girar para abrir o Windows, o navegador e cada pasta. A troca por SSD tira essa espera. A memória entra quando o sistema vive no limite: muitas abas, planilha e reunião ao mesmo tempo.",
        "Na Balão da Informática Anchieta a peça sai do estoque da loja e a troca é feita na bancada da Av. Anchieta, 789, no Cambuí. Você não compra o disco num site e leva para outro lugar instalar. Mande o modelo no WhatsApp (19) 98751-0267 e receba preço e prazo fechados antes de sair de casa.",
        "Os arquivos não precisam ficar para trás. Quando o disco ainda lê, a bancada clona o sistema para o SSD. Se o HD já falha, o caminho pode ser recuperação de dados, e você fica sabendo disso antes de aprovar qualquer serviço.",
      ],
    },
    {
      tipo: "vitrine",
      titulo: "Quanto custa o upgrade (peça + instalação)",
      texto:
        "A vitrine mostra o preço da peça que está no catálogo agora. A instalação e a clonagem não estão nesse valor: preço e prazo confirmados pelo WhatsApp, depois que a bancada vê o modelo. O valor final muda se o notebook pede SATA ou NVMe e conforme a capacidade.",
      regras: [
        {
          id: "ssd-sata",
          titulo: "SSD SATA",
          subtitulo: "Para notebooks e PCs que não têm slot M.2 NVMe",
          categorias: ["Hardware/SSD"],
          nomeContem: ["sata"],
          excluir: ["externo", "portatil", "case", "gaveta", "adaptador", "suporte", "cabo", "dissipador", "nvme"],
          ordem: "menor",
          limite: 8,
          verTodos: { rotulo: "Ver todos os SSDs", href: "/categoria/hardware-ssd" },
        },
        {
          id: "ssd-nvme",
          titulo: "SSD NVMe",
          subtitulo: "Para quem tem slot M.2. A bancada confirma pelo modelo",
          categorias: ["Hardware/SSD"],
          nomeContem: ["nvme"],
          excluir: ["externo", "portatil", "case", "gaveta", "adaptador", "suporte", "cabo"],
          ordem: "menor",
          limite: 8,
        },
        {
          id: "memoria",
          titulo: "Memória RAM",
          subtitulo: "DDR4 e DDR5. O tipo certo depende do notebook",
          categorias: ["Hardware/Memória RAM"],
          excluir: ["ddr3", "ddr2"],
          ordem: "menor",
          limite: 8,
          porMarca: 4,
        },
      ],
    },
    {
      tipo: "retorno",
      titulo: "Pedir retorno rápido",
      texto: "Deixe o modelo e se hoje o notebook tem HD ou SSD. A equipe responde preço e prazo no WhatsApp.",
      assunto: "Upgrade de SSD ou memória",
      campos: [
        { nome: "modelo", rotulo: "Modelo do notebook" },
        { nome: "disco", rotulo: "Tem HD ou SSD hoje?", opcoes: ["Não sei", "HD", "SSD"] },
      ],
    },
    {
      tipo: "regras",
      titulo: "SSD SATA ou NVMe, e quanta memória faz sentido",
      texto: "Dois pontos decidem o orçamento. Os dois se resolvem com o modelo do notebook.",
      itens: [
        {
          titulo: "SSD SATA x NVMe: qual o seu aceita",
          texto:
            "Notebook mais antigo costuma ter baia de 2,5 polegadas e aceita SSD SATA, no lugar do HD. Modelo mais novo pode ter slot M.2 e aceitar NVMe, que é outro encaixe. Alguns aceitam os dois; outros têm a memória ou o disco soldados e não aceitam troca. Mande o modelo no WhatsApp que a bancada diz qual peça serve antes de você comprar.",
        },
        {
          titulo: "Quanta memória RAM faz sentido",
          texto:
            "8 GB ainda serve para navegador, documento e vídeo. 16 GB é o ponto em que trabalho com muitas abas, planilha e reunião deixa de travar. Acima disso faz sentido para edição e para quem deixa muita coisa aberta. Nem todo notebook aceita mais memória: a bancada olha o modelo e diz se dá para ampliar ou se a memória já vem no máximo.",
        },
      ],
    },
    {
      tipo: "texto",
      titulo: "Antes e depois: o que muda na prática",
      paragrafos: [
        "O que a pessoa sente no primeiro dia é o sistema abrir e os programas deixarem de pensar antes de responder. Menu, navegador e pasta passam a acompanhar o clique. Isso é o efeito de tirar o HD mecânico do caminho.",
        "A loja ainda não publica nesta página um tempo de boot medido na bancada. Quando o técnico cronometra o antes e o depois do seu notebook, ele mostra na hora da retirada. Não usamos número de outra máquina no lugar da sua.",
        "Memória não deixa o Windows ligar mais rápido do mesmo jeito que o SSD. Ela muda o uso com tudo aberto: se o notebook pede tempo quando você junta navegador, PDF e planilha, o gargalo pode ser a RAM, não o disco. A bancada separa os dois antes de indicar a troca.",
      ],
    },
    {
      tipo: "passos",
      titulo: "Como funciona no balcão do Cambuí",
      texto: "Quatro passos, do modelo até a retirada. Preço e prazo confirmados pelo WhatsApp.",
      itens: [
        { titulo: "Mande o modelo", texto: "Pelo WhatsApp, com o que você quer: SSD, memória ou os dois. A equipe diz se a peça cabe e o que tem em estoque." },
        { titulo: "Traga o notebook", texto: "Av. Anchieta, 789, Cambuí. Segunda a sexta, 9h às 18h. Sábado, 9h às 13h. Em Campinas e região, a coleta por motoboy é combinada à parte." },
        { titulo: "Troca e clonagem", texto: "A bancada instala a peça. Quando o disco ainda lê, clona o sistema para você não recomeçar do zero." },
        { titulo: "Retire testado", texto: "Você confere o notebook ligado no balcão antes de levar. Nada é feito sem a sua aprovação do orçamento." },
      ],
    },
    {
      tipo: "texto",
      titulo: "Quando não vale fazer upgrade",
      paragrafos: [
        "SSD não conserta placa queimada, tela quebrada nem bateria que não segura carga. Se o notebook desliga sozinho, esquenta até apagar ou não liga, o caminho é o conserto, não a troca de disco. A página de assistência explica esses casos.",
        "Também não vale quando o processador já não roda o que você precisa e o valor da peça mais a mão de obra chega perto de um notebook novo ou seminovo da loja. A bancada fala isso antes de você gastar. Ver notebooks à venda ajuda a comparar com a máquina que você já tem.",
      ],
    },
    {
      tipo: "atalhos",
      titulo: "Se o problema não for só lentidão",
      itens: [
        { titulo: "Conserto de notebook", texto: "Não liga, esquenta, tela, teclado ou líquido.", href: "/manutencao", imagem: "/images/landing/v2/manutencao.jpg" },
        { titulo: "Notebooks", texto: "Quando trocar de máquina compensa mais que o upgrade.", href: "/notebooks", imagem: "/images/landing/v2/notebooks.jpg" },
        { titulo: "Peças de hardware", texto: "SSD, memória e o resto do estoque, com filtro.", href: "/categoria/hardware" },
        { titulo: "Formatação com backup", texto: "Quando a lentidão é de sistema, não de disco.", href: "/formatacao", imagem: "/images/landing/v2/sistemas.jpg" },
        { titulo: "Envio e entrega", texto: "Motoboy em Campinas e região, combinado no WhatsApp.", href: "/envio-e-entrega", imagem: "/images/landing/v2/envio-e-entrega.jpg" },
        { titulo: "Fale conosco", texto: "Telefone, WhatsApp e o balcão da Av. Anchieta.", href: "/fale-conosco" },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Quanto custa trocar HD por SSD no notebook em Campinas?",
      resposta:
        "Na Balão da Informática Anchieta, no Cambuí, o upgrade soma a peça e a instalação, com clonagem dos arquivos quando o disco permite. O valor final depende do modelo (SATA ou NVMe) e é confirmado pelo WhatsApp (19) 98751-0267 antes do serviço. Preço e prazo confirmados pelo WhatsApp.",
    },
    {
      pergunta: "O upgrade de SSD fica pronto no mesmo dia?",
      resposta:
        "Depende da peça em estoque e da agenda da bancada. Com a peça na loja, a bancada própria da Av. Anchieta, 789 faz a troca e o cliente retira o notebook testado no balcão. Preço e prazo confirmados pelo WhatsApp.",
    },
    {
      pergunta: "Vale a pena colocar SSD em notebook antigo?",
      resposta:
        "Para notebooks com HD mecânico, o SSD costuma ser o upgrade que mais muda o uso do dia a dia. A loja avisa quando o conserto não compensa e mostra notebook novo ou seminovo no mesmo endereço.",
    },
    {
      pergunta: "Perco meus arquivos na troca do HD?",
      resposta:
        "Não, quando o disco ainda lê: a bancada clona o sistema para o SSD. Se o HD já estiver falhando, o caso pode ir para recuperação de dados, e você aprova isso antes.",
    },
    {
      pergunta: "Meu notebook aceita SSD NVMe ou só SATA?",
      resposta:
        "Depende do modelo. Mande o modelo no WhatsApp que a bancada diz o encaixe antes de separar a peça. Alguns notebooks não aceitam troca de disco.",
    },
    {
      pergunta: "8 GB ou 16 GB de RAM?",
      resposta:
        "8 GB atende uso leve. 16 GB é o ponto para quem trabalha com muitas abas e programas juntos. A bancada confirma se o seu modelo aceita o aumento.",
    },
  ],
  tituloDasPerguntas: "Perguntas frequentes",
  temas: ["upgrade", "ssd", "memoria", "notebook", "assistencia", "manutencao"],
  termosDoBlog: ["ssd", "memória ram", "upgrade", "hd", "notebook lento", "nvme"],
  relacionadas: ["manutencao", "notebooks", "formatacao", "envio-e-entrega"],
  final: {
    titulo: "Mande o modelo e receba o preço fechado",
    texto: "A loja fica na Av. Anchieta, 789, Cambuí. Segunda a sexta, 9h às 18h. Sábado, 9h às 13h. Preço e prazo confirmados pelo WhatsApp.",
    botao: "Chamar no WhatsApp",
    mensagem: MENSAGEM,
  },
};
