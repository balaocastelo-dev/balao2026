import type { PaginaDeCaptacao } from "../tipos";

const MENSAGEM =
  "Olá! Meu iPhone ____ (modelo) está com ____. Quanto fica e em quanto tempo? (  ) levo na loja (  ) quero coleta por motoboy";

export const iphone: PaginaDeCaptacao = {
  slug: "iphone",
  nome: "Conserto de iPhone",
  chamada: "iPhone no Cambuí: diagnóstico grátis, reparo em média 60 minutos, conforme o defeito e a peça, e 12x sem juros.",
  seo: {
    titulo: "Conserto de iPhone em Campinas | Em Média 60 Minutos",
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
      src: "/images/landing/v3/iphone/telaiphone.webp",
      alt: "Técnico de luvas avaliando um iPhone com a tela trincada na bancada de reparo",
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
        src: "/images/landing/v3/reparoapple/hub-hero.webp",
        alt: "Bancada clara com notebook, computador tudo-em-um, celular e kit de ferramentas de precisão",
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
          texto: "Trinca, toque falhando, mancha ou imagem cortada. A tela do iPhone sai em conjunto. A opção de peça e o aviso do iOS entram no orçamento. Os sintomas de tela e de bateria estão mais abaixo nesta página.",
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
      tipo: "comparativo",
      titulo: "Tela ou bateria? Pelos sintomas",
      texto: "Um guia rápido para chegar ao balcão sabendo o que pedir. O teste na bancada confirma.",
      colunas: ["O que você vê", "Costuma ser", "O que fazer até chegar à loja"],
      linhas: [
        ["Vidro trincado, imagem normal", "Tela (vidro e toque são uma peça só)", "Uma película por cima para não se cortar"],
        ["Toque fantasma ou área que não responde", "Tela", "Bloquear o iPhone quando não estiver usando"],
        ["Mancha, listra ou tela preta", "Tela (painel danificado)", "Fazer backup se ainda der para ver algo"],
        ["Descarrega rápido, desliga com carga", "Bateria", "Olhar a saúde em Ajustes > Bateria"],
        ["Tela levantando ou fresta na lateral", "Bateria estufada", "Parar de carregar e trazer logo"],
        ["Não carrega", "Conector sujo, cabo ou bateria", "Testar outro cabo e carregador"],
      ],
    },
    {
      tipo: "texto",
      titulo: "Por que não continuar usando com a tela quebrada",
      paragrafos: [
        "A tela do iPhone é um conjunto: vidro, camada de toque e painel de imagem colados numa peça só. Por isso, mesmo quando só o vidro parece trincado, a troca é da tela inteira. Esperar costuma sair caro: a trinca deixa passar poeira e umidade, a pressão do dedo sobre o vidro solto vai marcando o painel, e o que era só um risco vira mancha, listra ou toque fantasma.",
        "Há ainda o risco do dia a dia. Lascas de vidro cortam o dedo e o rosto, e com o vidro aberto o iPhone perde parte da proteção contra respingos. Película por cima da trinca ajuda a não se cortar até chegar à loja, mas não conserta nada.",
        "Na hora do orçamento, o técnico explica as opções de tela disponíveis para o seu modelo e a diferença entre elas, além do que muda no aparelho depois da troca. Assim você escolhe sabendo o que está levando.",
      ],
      lista: [
        "Faça backup no iCloud ou no computador enquanto a tela ainda deixa",
        "Evite apertar a região trincada",
        "Se a tela levantou, o problema pode ser a bateria",
      ],
    },
    {
      tipo: "texto",
      titulo: "Quando a saúde da bateria pede troca",
      paragrafos: [
        "Bateria de celular é peça de desgaste: a cada ciclo de carga ela guarda um pouco menos. O iPhone mostra quanto ela ainda segura em Ajustes > Bateria > Saúde e Carregamento (o nome muda um pouco conforme a versão do iOS). O número é a capacidade atual comparada à de quando a bateria era nova.",
        "Na prática, abaixo de 80% a maioria das pessoas já sente: o iPhone não chega ao fim do dia e pode desligar sozinho com carga na tela. Para evitar esses desligamentos, o próprio iOS pode reduzir o desempenho, e o aparelho parece lento. Se aparecer a mensagem de Serviço nessa tela, o sistema está dizendo que a bateria já não está boa.",
        "Bateria estufada é diferente: não é questão de duração, é segurança. Ela empurra a tela por dentro e pode danificar outras peças. Pare de carregar, não aperte e traga o iPhone à loja. Na troca, o técnico também explica as opções de bateria para o seu modelo e o que aparece nos Ajustes depois.",
      ],
      lista: [
        "Acima de 80% e durando o dia: ainda não precisa trocar",
        "Abaixo de 80% ou desligando sozinho: hora de orçar",
        "Mensagem de Serviço: troca recomendada",
        "Estufada: pare de carregar e traga logo",
      ],
    },
    {
      tipo: "passos",
      titulo: "Como funciona",
      texto: "Cinco passos. Preço e prazo confirmados pelo WhatsApp (19) 98751-0267. Telefone (19) 3255-1661.",
      itens: [
        { titulo: "Chame no WhatsApp", texto: "Modelo e o problema. Diga se leva na loja ou quer coleta por motoboy. Não envie a senha do ID Apple." },
        { titulo: "Traga ou o motoboy busca", texto: "Av. Anchieta, 789, Cambuí. Segunda a quinta, 8h às 18h. Sexta, 8h às 17h. Sábado, 8h às 13h. Custo e prazo da coleta são confirmados na conversa." },
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
        ["Horário", "Segunda a quinta, 8h às 18h. Sexta, 8h às 17h. Sábado, 8h às 13h."],
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
        { titulo: "Serviços Apple", texto: "O hub da linha: MacBook, iMac, iPad, Mac mini e Watch.", href: "/reparoapple", imagem: "/images/landing/v3/reparoapple/reparoapple.webp", alt: "Bancada de assistência técnica com notebook, celular no suporte, lupa iluminada e ferramentas organizadas" },
        { titulo: "Especialista por aparelho", texto: "Como achar o modelo exato antes de vir.", href: "/wendell/apple", imagem: "/images/landing/v3/reparoapple/wendell-apple.webp", alt: "Técnico fazendo microsolda em placa de celular sob microscópio" },
        { titulo: "MacBook", texto: "Air e Pro, no mesmo endereço.", href: "/macbook", imagem: "/images/landing/v3/macbook/macbook-hero.webp", alt: "Técnico de luvas trabalhando na placa de um MacBook aberto na bancada" },
        { titulo: "Celular Android", texto: "Samsung, Motorola e Xiaomi, na mesma bancada.", href: "/android", imagem: "/images/landing/v3/reparoapple/hub-hero.webp", alt: "Bancada clara com notebook, computador tudo-em-um, celular e kit de ferramentas de precisão" },
        { titulo: "iPhones à venda", texto: "Quando trocar compensar mais que consertar.", href: "/categoria/celular-smartphone-smartphones-iphone" },
        { titulo: "Capas e películas", texto: "Para sair da loja com o vidro protegido.", href: "/categoria/celular-smartphone-acessorios-para-smartphones-capas-e-peliculas" },
        { titulo: "Recuperação de dados", texto: "iPhone que não liga e fotos sem backup.", href: "/recuperacaodados", imagem: "/images/landing/v3/android/recuperacaodados.webp", alt: "Técnico segurando um SSD ao lado de notebook e disco externo para recuperação de dados" },
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
      pergunta: "Posso continuar usando o iPhone com a tela trincada?",
      resposta:
        "Dá para usar por pouco tempo, mas não é recomendado. A trinca deixa entrar poeira e umidade, costuma avançar e pode chegar ao painel de imagem, além do risco de se cortar. Uma película por cima ajuda até chegar à loja.",
    },
    {
      pergunta: "Com quantos por cento de saúde devo trocar a bateria do iPhone?",
      resposta:
        "Abaixo de 80% é o ponto em que a maioria das pessoas já sente a diferença e o iOS pode reduzir o desempenho. Se aparecer a mensagem de Serviço em Ajustes > Bateria, ou se a bateria estufou, a troca é recomendada.",
    },
    {
      pergunta: "Minha tela está levantando. É a tela ou a bateria?",
      resposta:
        "Quase sempre é a bateria estufada empurrando a tela por dentro. Pare de carregar o iPhone, não aperte a tela e traga logo à loja para o técnico avaliar.",
    },
    {
      pergunta: "A tela nova funciona igual à antiga?",
      resposta:
        "Depende da opção de tela disponível para o seu modelo. No orçamento, o técnico explica as opções e o que muda de uma para outra, para você decidir antes de qualquer serviço.",
    },
    {
      pergunta: "Meu iPhone não carrega. Preciso trocar a bateria?",
      resposta:
        "Nem sempre. Muitas vezes o problema é sujeira no conector ou o cabo. O técnico limpa e testa primeiro e só fala em troca de peça se for preciso.",
    },
    {
      pergunta: "Quais bairros de Campinas a loja atende?",
      resposta:
        "A loja fica no Cambuí. Atende quem vem do Centro, Nova Campinas, Guanabara, Taquaral, Bosque, Castelo, Barão Geraldo, Jardim Chapadão e Jardim Planalto. Horário: segunda a quinta, 8h às 18h; sexta, 8h às 17h; sábado, 8h às 13h.",
    },
  ],
  tituloDasPerguntas: "Perguntas frequentes",
  temas: ["iphone", "apple", "assistencia", "android", "celular"],
  termosDoBlog: ["iphone", "bateria", "tela", "apple", "celular", "cambuí"],
  relacionadas: ["reparoapple", "android", "macbook", "imac"],
  final: {
    titulo: "Mande o modelo e diga se traz ou pede motoboy",
    texto:
      "Av. Anchieta, 789, Cambuí, Campinas. Segunda a quinta, 8h às 18h. Sexta, 8h às 17h. Sábado, 8h às 13h. Diagnóstico grátis. O reparo é rápido: em média 60 minutos, conforme o defeito e a peça. Parcelamento em até 12x sem juros.",
    botao: "Chamar no WhatsApp",
    mensagem: MENSAGEM,
  },
};
