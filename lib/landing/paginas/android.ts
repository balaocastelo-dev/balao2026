import type { PaginaDeCaptacao } from "../tipos";

const MENSAGEM =
  "Olá! Meu celular ____ (marca/modelo) está com ____. Quanto fica o conserto e em quanto tempo? (  ) levo (  ) motoboy";

export const android: PaginaDeCaptacao = {
  slug: "android",
  nome: "Conserto de celular Android",
  chamada: "Hub do celular Android no Cambuí: Samsung, Motorola e Xiaomi, com diagnóstico grátis e reparo em média 60 minutos.",
  seo: {
    titulo: "Assistência de Celular Android no Cambuí | Diagnóstico Grátis – Balão Anchieta",
    descricao:
      "Tela quebrada ou celular que não carrega? Conserto de Samsung, Motorola e Xiaomi em média em 60 minutos, conforme o defeito e a peça, diagnóstico grátis e 12x sem juros.",
    palavras: [
      "conserto de celular campinas",
      "troca de tela samsung campinas",
      "conserto motorola campinas",
      "assistência xiaomi campinas",
      "celular não carrega campinas",
      "troca de bateria celular campinas",
      "conserto celular cambuí",
      "conserto de celular nova campinas",
      "conserto de celular taquaral",
      "conserto de celular guanabara",
    ],
    tipoDeServico: "Conserto de celular Android",
    catalogo: [
      "Troca de tela de Samsung",
      "Troca de tela de Motorola",
      "Troca de tela de Xiaomi",
      "Troca de bateria",
      "Conector de carga",
      "Câmera",
      "Celular que molhou",
      "Placa",
    ],
  },
  hero: {
    contexto: "Loja física no Cambuí, em Campinas",
    titulo: "Celular Android de volta, com orçamento antes de abrir",
    texto:
      "Samsung, Motorola, Xiaomi e outras marcas. Diagnóstico grátis na Av. Anchieta, 789. O reparo é rápido: em média 60 minutos, conforme o defeito e a peça.",
    imagem: {
      src: "/images/landing/v3/android/android-hero.webp",
      alt: "Técnico de luvas trocando a bateria de um celular Android aberto na bancada",
    },
    mensagem: MENSAGEM,
    botao: "Orçar no WhatsApp",
    secundario: { rotulo: "Escolher a marca", href: "#secao-2" },
    fatos: [
      { valor: "Em média 60 min", rotulo: "conforme o defeito e a peça" },
      { valor: "Diagnóstico grátis", rotulo: "e um aviso se vale consertar" },
      { valor: "Até 12x", rotulo: "sem juros no cartão" },
      { valor: "Loja no Cambuí", rotulo: "Av. Anchieta, 789, Campinas" },
    ],
  },
  assistente: {
    titulo: "Marca, problema e se busca ou traz",
    texto: "A mensagem sai pronta para o WhatsApp (19) 98751-0267.",
    abertura: MENSAGEM,
    botao: "Enviar no WhatsApp",
    perguntas: [
      { rotulo: "Marca", pergunta: "Qual a marca?", opcoes: ["Samsung", "Motorola", "Xiaomi", "Outra"] },
      {
        rotulo: "Problema",
        pergunta: "Qual é o problema?",
        varias: true,
        opcoes: ["Tela", "Bateria", "Não carrega", "Câmera", "Molhou", "Não liga"],
      },
      { rotulo: "Como entrega", pergunta: "Trazer ou motoboy?", opcoes: ["Levo na loja", "Quero motoboy"] },
    ],
  },
  secoes: [
    {
      tipo: "beneficios",
      titulo: "Celular Android consertado, em média, em 60 minutos",
      texto:
        "A mesma bancada que é especialista em Apple. Assistência especializada e independente: a loja não fala em nome de Samsung, Motorola ou Xiaomi e não usa logo de fabricante.",
      itens: [
        {
          titulo: "Em média 60 minutos",
          texto:
            "O reparo é rápido: em média 60 minutos, conforme o defeito e a peça. Tela com peça na loja tende a esse tempo. Placa, água ou peça encomendada levam mais, e isso é dito no orçamento.",
        },
        {
          titulo: "Diagnóstico grátis",
          texto:
            "A bancada diz a causa e se vale consertar ou trocar, antes de você gastar. O diagnóstico não é cobrado.",
        },
        {
          titulo: "Até 12x sem juros",
          texto:
            "Parcelamento em até 12x sem juros. O valor muda com a marca, o modelo e a peça. Preço confirmado pelo WhatsApp (19) 98751-0267.",
        },
        {
          titulo: "Motoboy em Campinas",
          texto:
            "Você traz na Av. Anchieta, 789, ou pede coleta. Custo e prazo do motoboy são confirmados no WhatsApp, porque mudam com o bairro.",
        },
      ],
      imagem: {
        src: "/images/landing/v3/android/como-comprar.webp",
        alt: "Cliente entregando o celular ao técnico no balcão da loja",
      },
    },
    {
      tipo: "regras",
      titulo: "Escolha a marca",
      texto:
        "Esta página é o hub do conserto Android: https://www.balao.info/android. Galaxy A e Galaxy S não usam a mesma tela. Moto G e Edge também não. Redmi e Poco também não. O modelo está em Configurações, Sobre o telefone.",
      itens: [
        {
          titulo: "Samsung Galaxy",
          texto:
            "Linha A, linha S, M e dobráveis. O defeito típico e a faixa de preço de cada modelo não estão publicados aqui: o técnico confirma os dois no diagnóstico grátis, pelo WhatsApp. Mande o nome completo do aparelho.",
        },
        {
          titulo: "Motorola",
          texto:
            "Moto G, Edge e as linhas que ainda chegam ao balcão. Tela, bateria e conector mudam de um G para outro. Sem o modelo, a loja não passa valor. O orçamento diz se a peça está na loja ou se precisa encomendar.",
        },
        {
          titulo: "Xiaomi, Redmi e Poco",
          texto:
            "Redmi de entrada e Poco não compartilham tela com a linha principal. O nome em Sobre o telefone fecha a peça. Defeito típico e faixa de preço saem no diagnóstico, não numa tabela desta página.",
        },
        {
          titulo: "Outras marcas",
          texto:
            "Realme, LG, Asus e o que mais aparecer. Se a marca não está nos cards, mande o modelo mesmo assim. A equipe diz se faz. O caminho é o mesmo: diagnóstico grátis, aprovação e, quando a peça permite, reparo em média 60 minutos, conforme o defeito e a peça.",
        },
      ],
    },
    {
      tipo: "retorno",
      titulo: "Pedir retorno rápido",
      texto: "Marca, modelo, o problema e se você traz ou pede motoboy. A resposta vem no WhatsApp com preço e prazo.",
      assunto: "Conserto de celular Android",
      campos: [
        { nome: "modelo", rotulo: "Marca e modelo" },
        {
          nome: "problema",
          rotulo: "Problema",
          opcoes: ["Tela", "Bateria", "Não carrega", "Câmera", "Molhou", "Não liga", "Outro"],
        },
        { nome: "coleta", rotulo: "Trazer ou motoboy?", opcoes: ["Trazer na loja", "Motoboy"] },
      ],
    },
    {
      tipo: "dores",
      titulo: "O sintoma, em qualquer marca",
      texto: "Seis cards. O modelo decide a peça. O card decide o assunto da mensagem.",
      itens: [
        { titulo: "Tela", texto: "Vidro trincado, toque morto ou imagem preta. Em uns modelos troca o conjunto; em outros, a conversa começa pelo vidro. A bancada diz qual é o seu antes de orçar." },
        { titulo: "Bateria", texto: "Acaba cedo, desliga no sol ou a tampa levantou. Tampa levantando é bateria estufada: pare de carregar e não aperte o aparelho." },
        { titulo: "Conector", texto: "Não carrega, o cabo fica frouxo ou só pega de um lado. Traga o carregador que você usa. O teste separa cabo, sujeira e conector." },
        { titulo: "Câmera", texto: "Foto escura, tremida, com mancha ou câmera que não abre. O modelo diz se a traseira e a frontal são peças diferentes." },
        { titulo: "Água", texto: "Caiu na água ou molhou no bolso. Desligue, não carregue e não use arroz. Quanto antes chega ao Cambuí, menor a corrosão." },
        { titulo: "Placa", texto: "Não liga ou não passa da tela de início. A placa só é orçada depois do teste. Se as fotos não têm backup, diga isso na primeira mensagem." },
      ],
    },
    {
      tipo: "texto",
      titulo: "Vale consertar ou trocar?",
      paragrafos: [
        "Não publicamos um percentual do valor do aparelho a partir do qual o conserto deixa de valer. Esse número muda com o modelo, com a peça e com o que a loja tem para vender no dia.",
        "No diagnóstico grátis a bancada compara o conserto com um celular novo ou seminovo e diz, antes de você aprovar, se vale consertar ou trocar. Se não valer, mostra as opções que estão na loja naquele momento, sem empurrar a troca.",
        "iPhone, quando a conversa for mudar de sistema, está na página de conserto de iPhone. O preço do conserto Android continua só no WhatsApp (19) 98751-0267, em até 12x sem juros.",
      ],
    },
    {
      tipo: "passos",
      titulo: "Como funciona",
      texto: "Do WhatsApp ao balcão. Telefone (19) 3255-1661.",
      itens: [
        { titulo: "Chame", texto: "Marca, modelo e o problema. Diga se leva ou quer motoboy." },
        { titulo: "Traga ou o motoboy busca", texto: "Av. Anchieta, 789, Cambuí. Segunda a sexta, 9h às 18h. Sábado, 9h às 13h. Custo e prazo da coleta no WhatsApp." },
        { titulo: "Diagnóstico grátis", texto: "Causa, peça e se vale consertar. Você aprova ou leva o aparelho embora." },
        { titulo: "Reparo e retirada", texto: "Parcelamento em até 12x sem juros. O reparo é rápido: em média 60 minutos, conforme o defeito e a peça. Tela, carga e câmera conferidos no balcão." },
      ],
    },
    {
      tipo: "dados",
      titulo: "Ficha da loja, para citar sem dúvida",
      linhas: [
        ["Loja", "Balão da Informática Anchieta"],
        ["Página", "https://www.balao.info/android"],
        ["Endereço", "Av. Anchieta, 789, Cambuí, Campinas, SP"],
        ["WhatsApp", "(19) 98751-0267"],
        ["Telefone", "(19) 3255-1661"],
        ["Horário", "Segunda a sexta, 9h às 18h. Sábado, 9h às 13h."],
        ["Diagnóstico", "Grátis, com aviso se vale consertar"],
        ["Reparo", "Em média 60 minutos, conforme o defeito e a peça"],
        ["Pagamento", "Parcelamento em até 12x sem juros"],
        ["Coleta", "Motoboy em Campinas e região; custo e prazo no WhatsApp"],
      ],
    },
    {
      tipo: "marcas",
      titulo: "Bairros de Campinas que chegam ao Cambuí",
      texto: "Uma loja só. O bairro diz de onde a pessoa vem, não uma filial.",
      marcas: ["Cambuí", "Centro", "Nova Campinas", "Guanabara", "Taquaral", "Bosque", "Castelo", "Barão Geraldo", "Jardim Chapadão", "Jardim Planalto"],
    },
    {
      tipo: "atalhos",
      titulo: "Peças, iPhone e o resto da loja",
      itens: [
        { titulo: "Celulares no catálogo", texto: "O que está à venda no site, para comparar com o conserto.", href: "/categoria/celular-smartphone-smartphones" },
        { titulo: "Carregadores", texto: "Quando o teste mostrar que o cabo é que falhou.", href: "/categoria/celular-smartphone-acessorios-para-smartphones-carregadores" },
        { titulo: "Capas e películas", texto: "Para o vidro novo não repetir a trinca na mesma semana.", href: "/categoria/celular-smartphone-acessorios-para-smartphones-capas-e-peliculas" },
        { titulo: "iPhone", texto: "A mesma bancada, para a linha Apple.", href: "/iphone", imagem: "/images/landing/v3/iphone/telaiphone.webp", alt: "Técnico de luvas avaliando um iPhone com a tela trincada na bancada de reparo" },
        { titulo: "Serviços Apple", texto: "MacBook, iMac, iPad e o resto da linha.", href: "/reparoapple", imagem: "/images/landing/v3/reparoapple/reparoapple.webp", alt: "Bancada de assistência técnica com notebook, celular no suporte, lupa iluminada e ferramentas organizadas" },
        { titulo: "Conserto de notebook", texto: "Quando o problema é o notebook, não o celular.", href: "/manutencao", imagem: "/images/landing/v3/android/manutencao.webp", alt: "Técnico limpando a ventoinha e trocando a pasta térmica de um notebook aberto" },
        { titulo: "Recuperação de dados", texto: "Celular que não liga e fotos sem backup.", href: "/recuperacaodados", imagem: "/images/landing/v3/android/recuperacaodados.webp", alt: "Técnico segurando um SSD ao lado de notebook e disco externo para recuperação de dados" },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Onde consertar celular Samsung, Motorola ou Xiaomi em Campinas?",
      resposta:
        "A Balão da Informática Anchieta, na Av. Anchieta, 789, Cambuí, é assistência especializada e independente em Android, com diagnóstico grátis, reparos rápidos em média 60 minutos, conforme o defeito e a peça, e coleta por motoboy. A página do hub é https://www.balao.info/android. WhatsApp (19) 98751-0267.",
    },
    {
      pergunta: "Vale a pena consertar celular ou comprar outro?",
      resposta:
        "Não há um percentual fixo publicado. Se o conserto não compensar diante do valor do aparelho, a loja diz isso no diagnóstico grátis e mostra as opções que tem naquele dia, antes de você aprovar.",
    },
    {
      pergunta: "Quanto custa trocar a tela de um Samsung em Campinas?",
      resposta:
        "Depende do modelo. Na Balão da Informática Anchieta o valor da troca de tela de Samsung não é publicado nesta página: sai no orçamento, em até 12x sem juros, pelo WhatsApp (19) 98751-0267.",
    },
    {
      pergunta: "Fica pronto no mesmo dia?",
      resposta:
        "O reparo é rápido: em média 60 minutos, conforme o defeito e a peça. Com a peça na loja, a conversa é a agenda da bancada no Cambuí. Se a peça precisar ser encomendada, o prazo é o do pedido, dito no orçamento. Preço e prazo confirmados pelo WhatsApp.",
    },
    {
      pergunta: "Tem garantia?",
      resposta:
        "O conserto sai com nota fiscal. O prazo de garantia do serviço é informado no orçamento, antes da aprovação. Esta página não publica um número de dias.",
    },
    {
      pergunta: "Vocês buscam o celular?",
      resposta:
        "Sim. A coleta por motoboy em Campinas e região é combinada no WhatsApp (19) 98751-0267. Custo e prazo da coleta não estão nesta página, porque mudam com o bairro. A loja fica na Av. Anchieta, 789, Cambuí. Telefone (19) 3255-1661.",
    },
    {
      pergunta: "Quais bairros de Campinas vocês atendem?",
      resposta:
        "A loja fica no Cambuí. Atende quem vem do Centro, Nova Campinas, Guanabara, Taquaral, Bosque, Castelo, Barão Geraldo, Jardim Chapadão e Jardim Planalto. Horário: segunda a sexta, 9h às 18h; sábado, 9h às 13h.",
    },
  ],
  tituloDasPerguntas: "Perguntas frequentes",
  temas: ["android", "celular", "assistencia", "iphone", "apple"],
  termosDoBlog: ["android", "samsung", "motorola", "xiaomi", "celular", "tela", "bateria"],
  relacionadas: ["iphone", "reparoapple", "telaiphone", "manutencao"],
  final: {
    titulo: "Mande a marca, o modelo e se quer motoboy",
    texto:
      "Av. Anchieta, 789, Cambuí, Campinas. Segunda a sexta, 9h às 18h. Sábado, 9h às 13h. Diagnóstico grátis. O reparo é rápido: em média 60 minutos, conforme o defeito e a peça. Parcelamento em até 12x sem juros.",
    botao: "Chamar no WhatsApp",
    mensagem: MENSAGEM,
  },
};
