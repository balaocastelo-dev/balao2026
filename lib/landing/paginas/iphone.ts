import type { PaginaDeCaptacao } from "../tipos";

const MENSAGEM =
  "Olá! Meu iPhone ____ (modelo) está com ____. Quanto fica e em quanto tempo? (  ) levo na loja (  ) quero coleta por motoboy";

export const iphone: PaginaDeCaptacao = {
  slug: "iphone",
  nome: "Conserto de iPhone",
  chamada: "iPhone no Cambuí: diagnóstico grátis, reparo em média 60 minutos, conforme o defeito e a peça, e 12x sem juros.",
  seo: {
    titulo: "Conserto de iPhone em Campinas | Em média 60 min – Balão Anchieta",
    descricao:
      "iPhone com tela quebrada ou bateria fraca? Diagnóstico grátis no Cambuí, reparo em média de 60 minutos, conforme o defeito e a peça, e 12x sem juros.",
    palavras: [
      "conserto iphone campinas",
      "troca de tela iphone campinas",
      "troca de bateria iphone campinas",
      "assistência iphone cambuí",
      "iphone não liga campinas",
      "troca de vidro traseiro iphone",
      "face id não funciona",
      "iphone peça desconhecida",
      "coleta de iphone motoboy campinas",
      "conserto de iphone nova campinas",
    ],
    tipoDeServico: "Conserto de iPhone",
    catalogo: [
      "Troca de tela de iPhone",
      "Troca de bateria de iPhone",
      "Vidro traseiro",
      "Câmera",
      "Conector de carga",
      "Face ID",
      "Placa",
      "iPhone que molhou",
    ],
  },
  hero: {
    contexto: "Loja física no Cambuí, em Campinas",
    titulo: "iPhone com defeito: orçamento no WhatsApp antes de abrir",
    texto:
      "Tela, bateria, conector, câmera, Face ID, placa ou água. Diagnóstico grátis na Av. Anchieta, 789. O reparo é rápido: em média 60 minutos, conforme o defeito e a peça.",
    imagem: {
      src: "/images/landing/v2/telaiphone.jpg",
      alt: "Técnico de luvas avaliando um smartphone com a tela trincada na bancada",
    },
    mensagem: MENSAGEM,
    botao: "Orçar no WhatsApp",
    secundario: { rotulo: "Ver os defeitos", href: "#secao-4" },
    fatos: [
      { valor: "Em média 60 min", rotulo: "conforme o defeito e a peça" },
      { valor: "Diagnóstico grátis", rotulo: "antes de qualquer serviço" },
      { valor: "Até 12x", rotulo: "sem juros no cartão" },
      { valor: "Loja no Cambuí", rotulo: "Av. Anchieta, 789, Campinas" },
    ],
  },
  assistente: {
    titulo: "Modelo, o problema e se busca ou traz",
    texto: "A mensagem sai pronta para o WhatsApp (19) 98751-0267.",
    abertura: MENSAGEM,
    botao: "Enviar no WhatsApp",
    perguntas: [
      {
        rotulo: "Modelo",
        pergunta: "Qual é o seu iPhone?",
        opcoes: ["iPhone 11 ou 12", "iPhone 13 ou 14", "iPhone 15 ou 16", "iPhone 17 ou mais novo", "Não sei"],
      },
      {
        rotulo: "Problema",
        pergunta: "Qual é o problema?",
        varias: true,
        opcoes: ["Tela", "Bateria", "Vidro traseiro", "Câmera", "Face ID", "Conector", "Placa", "Molhou"],
      },
      { rotulo: "Como entrega", pergunta: "Prefere trazer ou motoboy?", opcoes: ["Levo na loja", "Quero coleta por motoboy"] },
    ],
  },
  secoes: [
    {
      tipo: "beneficios",
      titulo: "Seu iPhone pronto, em média, em 60 minutos",
      texto:
        "Assistência especializada e independente no Cambuí. A Balão da Informática Anchieta não fala em nome da Apple e não usa o logo da marca.",
      itens: [
        {
          titulo: "Em média 60 minutos",
          texto:
            "O reparo é rápido: em média 60 minutos, conforme o defeito e a peça. Tela e bateria com peça na loja tendem a esse tempo. Placa, água ou peça encomendada podem levar mais, e o prazo sai no orçamento.",
        },
        {
          titulo: "Diagnóstico grátis",
          texto:
            "A bancada olha o aparelho e explica a causa antes de qualquer serviço. Você aprova ou não. O diagnóstico não é cobrado.",
        },
        {
          titulo: "Até 12x sem juros",
          texto:
            "Parcelamento em até 12x sem juros. O valor depende do modelo e do tipo de peça e é confirmado pelo WhatsApp (19) 98751-0267.",
        },
        {
          titulo: "Buscamos com motoboy",
          texto:
            "Você pode trazer à Av. Anchieta, 789, ou pedir coleta por motoboy em Campinas e região. Custo e prazo da coleta são confirmados no WhatsApp, porque mudam com o bairro.",
        },
      ],
      imagem: {
        src: "/images/apple/hub-hero-real.png",
        alt: "Balcão da loja Balão da Informática Anchieta no Cambuí, em Campinas",
      },
    },
    {
      tipo: "regras",
      titulo: "Preço por modelo e serviço",
      texto:
        "Do iPhone 11 ao iPhone 17, tela, bateria, vidro traseiro e câmera não têm o mesmo valor. Esta página não publica tabela. Preço confirmado pelo WhatsApp.",
      itens: [
        {
          titulo: "Tela, bateria, vidro traseiro e câmera",
          texto:
            "Cada geração muda a peça. “iPhone 13” ainda pode ser mini, padrão, Pro ou Pro Max. O nome em Ajustes, Geral, Sobre, ou o da caixa, é o que fecha o orçamento. Sem esse nome, a loja não chuta um valor.",
        },
        {
          titulo: "Tipos de peça: o que cada um significa",
          texto:
            "Para o mesmo modelo pode haver mais de uma opção. Peça original é a do fabricante, no padrão de pareamento de fábrica. Recondicionada é uma peça usada, revisada. Compatível é feita por outro fabricante para aquele modelo. Qual opção está disponível para o seu iPhone, e o que muda entre elas, a bancada explica no orçamento. A política de cada tipo não está publicada nesta página.",
        },
        {
          titulo: "Aviso de peça desconhecida no iOS",
          texto:
            "Depois de algumas trocas, o iPhone pode mostrar uma mensagem de peça desconhecida ou um aviso importante sobre bateria ou tela. Isso indica que a peça não foi pareada como a que saiu de fábrica. Pode mudar o que aparece em saúde da bateria ou em ajustes da imagem. Não é um defeito escondido: a bancada avisa essa possibilidade antes de você aprovar, para a opção de peça do seu modelo.",
        },
      ],
    },
    {
      tipo: "retorno",
      titulo: "Pedir retorno rápido",
      texto: "Modelo, o problema e se você traz ou pede motoboy. A equipe responde preço e prazo no WhatsApp.",
      assunto: "Conserto de iPhone",
      campos: [
        { nome: "modelo", rotulo: "Modelo do iPhone" },
        {
          nome: "problema",
          rotulo: "Problema (tela/bateria/outro)",
          opcoes: ["Tela", "Bateria", "Vidro traseiro", "Câmera", "Face ID", "Conector", "Placa", "Molhou", "Outro"],
        },
        { nome: "coleta", rotulo: "Prefere trazer ou motoboy?", opcoes: ["Trazer na loja", "Coleta por motoboy"] },
      ],
    },
    {
      tipo: "dores",
      titulo: "Defeitos que consertamos",
      texto: "Sete casos. O card é o assunto da mensagem. O teste diz se é peça ou placa.",
      itens: [
        {
          titulo: "Tela",
          texto: "Trinca, toque falhando, mancha ou imagem cortada. A tela do iPhone sai em conjunto. A opção de peça e o aviso do iOS entram no orçamento. O detalhe de tela e de bateria está na página própria.",
        },
        {
          titulo: "Bateria",
          texto: "Acaba no meio do dia, desliga com carga ou está estufada. Estufada levanta a tela: pare de carregar e não aperte. A saúde aparece em Ajustes, Bateria.",
        },
        {
          titulo: "Conector",
          texto: "Não carrega, só carrega de lado ou o cabo pede um ângulo. Muitas vezes é sujeira. Quando não é, o conector entra no orçamento depois do teste, e não no lugar da bateria.",
        },
        {
          titulo: "Câmera",
          texto: "Foto embaçada, preta, sem foco ou com mancha fixa. Queda e líquido são as causas mais comuns. O modelo define se a câmera é uma peça à parte.",
        },
        {
          titulo: "Face ID",
          texto: "Parou depois de queda ou de uma troca de tela. Entra no diagnóstico grátis. A bancada diz se dá para recuperar antes de você aprovar. Não há promessa de que todo Face ID volta.",
        },
        {
          titulo: "Placa",
          texto: "Não liga, reinicia ou morreu depois de queda ou líquido. A placa só entra no orçamento depois do teste. Se havia fotos sem backup, avise na primeira mensagem.",
        },
        {
          titulo: "Molhou",
          texto: "Caiu na água, no vaso ou tomou chuva. Desligue, não carregue e não coloque em arroz. Quanto antes chega ao Cambuí, menor a corrosão.",
        },
      ],
    },
    {
      tipo: "passos",
      titulo: "Como funciona",
      texto: "Cinco passos. Preço e prazo confirmados pelo WhatsApp (19) 98751-0267. Telefone (19) 3255-1661.",
      itens: [
        { titulo: "Chame no WhatsApp", texto: "Modelo e o problema. Diga se leva na loja ou quer coleta por motoboy. Não envie a senha do ID Apple." },
        { titulo: "Traga ou o motoboy busca", texto: "Av. Anchieta, 789, Cambuí. Segunda a sexta, 9h às 18h. Sábado, 9h às 13h. Custo e prazo da coleta são confirmados na conversa." },
        { titulo: "Diagnóstico grátis", texto: "A bancada diz a causa e as opções de peça. Você vê o que muda, inclusive o aviso de peça no iOS, antes de decidir." },
        { titulo: "Você aprova", texto: "Nada começa sem o ok. Parcelamento em até 12x sem juros. O reparo é rápido: em média 60 minutos, conforme o defeito e a peça." },
        { titulo: "Retire testado", texto: "Toque, carga e câmera conferidos no balcão, com você por perto para desbloquear se precisar." },
      ],
    },
    {
      tipo: "texto",
      titulo: "Seus dados e sua privacidade",
      paragrafos: [
        "Faça backup no iCloud ou no computador se o iPhone ainda liga. Troca de tela, bateria ou conector em geral não apaga o aparelho. O backup é o seguro, não uma condição escondida.",
        "Não pedimos a senha do ID Apple pelo WhatsApp. No balcão, o teste final pode ser feito com você desbloqueando. Se o iPhone não liga e há arquivos sem cópia, a recuperação de dados entra na conversa antes do serviço, na página própria desse assunto.",
        "O que a bancada precisa saber antes de você sair de casa — senha de tela, conta ou modo perdido — é dito no seu caso, no WhatsApp, e não numa regra genérica desta página.",
      ],
    },
    {
      tipo: "texto",
      titulo: "Garantia e nota fiscal",
      paragrafos: [
        "O conserto sai com nota fiscal. O prazo de garantia do serviço é informado no orçamento, antes da aprovação. Esta página não publica um número de dias.",
        "Aparelho novo comprado na loja segue a garantia do fabricante, que é outra conversa e não se mistura com o conserto. A assistência é especializada e independente, com laboratório próprio na Av. Anchieta, 789, Cambuí, Campinas.",
      ],
    },
    {
      tipo: "dados",
      titulo: "Ficha da loja, para citar sem dúvida",
      linhas: [
        ["Loja", "Balão da Informática Anchieta"],
        ["Endereço", "Av. Anchieta, 789, Cambuí, Campinas, SP"],
        ["WhatsApp", "(19) 98751-0267"],
        ["Telefone", "(19) 3255-1661"],
        ["Horário", "Segunda a sexta, 9h às 18h. Sábado, 9h às 13h."],
        ["Diagnóstico", "Grátis, antes de qualquer serviço"],
        ["Reparo", "Em média 60 minutos, conforme o defeito e a peça"],
        ["Pagamento", "Parcelamento em até 12x sem juros"],
        ["Coleta", "Motoboy em Campinas e região; custo e prazo no WhatsApp"],
      ],
    },
    {
      tipo: "marcas",
      titulo: "Bairros de Campinas que chegam ao Cambuí",
      texto: "A loja é uma só, no Cambuí. Quem vem destes bairros usa o mesmo balcão. Motoboy é combinado à parte.",
      marcas: ["Cambuí", "Centro", "Nova Campinas", "Guanabara", "Taquaral", "Bosque", "Castelo", "Barão Geraldo", "Jardim Chapadão", "Jardim Planalto"],
    },
    {
      tipo: "atalhos",
      titulo: "Siga para o aparelho ou para a peça",
      itens: [
        { titulo: "Serviços Apple", texto: "O hub da linha: MacBook, iMac, iPad, Mac mini e Watch.", href: "/reparoapple", imagem: "/images/landing/v2/reparoapple.jpg" },
        { titulo: "Especialista por aparelho", texto: "Como achar o modelo exato antes de vir.", href: "/wendell/apple", imagem: "/images/landing/v2/wendell-apple.jpg" },
        { titulo: "Tela e bateria", texto: "Trinca, toque e saúde da bateria, em detalhe.", href: "/telaiphone", imagem: "/images/landing/v2/telaiphone.jpg" },
        { titulo: "MacBook", texto: "Air e Pro, no mesmo endereço.", href: "/macbook", imagem: "/images/apple/macbook-hero.webp" },
        { titulo: "Celular Android", texto: "Samsung, Motorola e Xiaomi, na mesma bancada.", href: "/android", imagem: "/images/apple/hub-hero-real.png" },
        { titulo: "iPhones à venda", texto: "Quando trocar compensar mais que consertar.", href: "/categoria/celular-smartphone-smartphones-iphone" },
        { titulo: "Capas e películas", texto: "Para sair da loja com o vidro protegido.", href: "/categoria/celular-smartphone-acessorios-para-smartphones-capas-e-peliculas" },
        { titulo: "Recuperação de dados", texto: "iPhone que não liga e fotos sem backup.", href: "/recuperacaodados", imagem: "/images/landing/v2/recuperacaodados.jpg" },
      ],
    },
    {
      tipo: "vitrine",
      titulo: "iPhone novo, se o conserto não compensar",
      texto: "A vitrine é o preço do aparelho no catálogo de hoje. O conserto é outro valor, confirmado pelo WhatsApp.",
      regras: [
        {
          id: "iphone",
          titulo: "iPhone",
          subtitulo: "Modelos à venda no site",
          categorias: ["Celular & Smartphone/Smartphones/iPhone"],
          excluir: ["1tb", "2tb"],
          ordem: "menor",
          porMarca: 4,
          limite: 8,
          verTodos: { rotulo: "Ver todos os iPhones", href: "/categoria/celular-smartphone-smartphones-iphone" },
        },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Quanto tempo leva para consertar um iPhone em Campinas?",
      resposta:
        "Na Balão da Informática Anchieta, no Cambuí, reparos rápidos como tela e bateria levam em média 60 minutos, conforme o defeito e a peça; reparos de placa dependem do diagnóstico, que é grátis.",
    },
    {
      pergunta: "Quanto custa trocar a tela do iPhone em Campinas?",
      resposta:
        "Depende do modelo e do tipo de peça. Na Balão da Informática Anchieta o valor da troca de tela não é publicado nesta página: sai no orçamento, em até 12x sem juros, pelo WhatsApp (19) 98751-0267.",
    },
    {
      pergunta: "A Balão é canal da Apple?",
      resposta:
        "Não. É uma assistência especializada e independente em Apple, com laboratório próprio na Av. Anchieta, 789, diagnóstico grátis e garantia própria. A loja não usa o logo da marca. O prazo da garantia do conserto é informado no orçamento, não nesta página.",
    },
    {
      pergunta: "A peça é original? Aparece aviso de peça desconhecida?",
      resposta:
        "Pode haver mais de uma opção para o mesmo modelo: original, recondicionada ou compatível. O iOS pode mostrar aviso de peça desconhecida depois de algumas trocas. A bancada explica o que cada opção significa, e se esse aviso pode aparecer, antes de você aprovar. A política de cada tipo é dita no orçamento.",
    },
    {
      pergunta: "Perco meus dados no conserto?",
      resposta:
        "Troca de tela, bateria ou conector em geral não apaga o iPhone. Mesmo assim, faça backup se ele liga. Não envie a senha do ID Apple pelo WhatsApp. Se o aparelho não liga, avise: a recuperação de dados entra antes do serviço.",
    },
    {
      pergunta: "Parcela? Vocês buscam o iPhone?",
      resposta:
        "Sim. Parcelamento em até 12x sem juros. A coleta por motoboy em Campinas e região existe; custo e prazo da coleta são confirmados pelo WhatsApp (19) 98751-0267. A loja fica na Av. Anchieta, 789, Cambuí. Telefone (19) 3255-1661.",
    },
    {
      pergunta: "Quais bairros de Campinas a loja atende?",
      resposta:
        "A loja fica no Cambuí. Atende quem vem do Centro, Nova Campinas, Guanabara, Taquaral, Bosque, Castelo, Barão Geraldo, Jardim Chapadão e Jardim Planalto. Horário: segunda a sexta, 9h às 18h; sábado, 9h às 13h.",
    },
  ],
  tituloDasPerguntas: "Perguntas frequentes",
  temas: ["iphone", "apple", "assistencia", "android", "celular"],
  termosDoBlog: ["iphone", "bateria", "tela", "apple", "celular", "cambuí"],
  relacionadas: ["reparoapple", "telaiphone", "android", "macbook"],
  final: {
    titulo: "Mande o modelo e diga se traz ou pede motoboy",
    texto:
      "Av. Anchieta, 789, Cambuí, Campinas. Segunda a sexta, 9h às 18h. Sábado, 9h às 13h. Diagnóstico grátis. O reparo é rápido: em média 60 minutos, conforme o defeito e a peça. Parcelamento em até 12x sem juros.",
    botao: "Chamar no WhatsApp",
    mensagem: MENSAGEM,
  },
};
