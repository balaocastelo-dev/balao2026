import type { PaginaDeCaptacao } from "../tipos";

type Marca = {
  slug: string;
  nome: string;
  marca: string;
  linhas: string;
  titulo: string;
  descricao: string;
  palavras: string[];
  intro: string[];
  blocos: { titulo: string; texto: string }[];
  pecas: string;
  garantia: string;
};

const MARCAS: Marca[] = [
  {
    slug: "notebook-dell",
    nome: "Notebook Dell",
    marca: "Dell",
    linhas: "Inspiron, Vostro, Latitude, XPS e G",
    titulo: "Conserto de Notebook Dell em Campinas (Cambuí)",
    descricao:
      "Conserto de notebook Dell em Campinas: tela, bateria, carregador e placa com bancada própria no Cambuí. Mande o modelo pelo WhatsApp.",
    palavras: [
      "assistência técnica dell campinas",
      "conserto notebook dell campinas",
      "dell inspiron cambuí",
      "dell latitude campinas",
      "carregador dell campinas",
      "tela de notebook dell",
      "assistência independente dell",
      "notebook dell não liga",
    ],
    intro: [
      "A Balão da Informática Anchieta conserta notebook Dell na bancada da Av. Anchieta, 789, no Cambuí. É assistência especializada e independente: a loja não fala em nome da Dell e não usa logo do fabricante. O orçamento sai pelo WhatsApp (19) 98751-0267 antes de qualquer troca.",
      "O que identifica o seu Dell é a Service Tag, o código curto na etiqueta de baixo. Com ela a equipe sabe a geração, se a memória é soldada e qual tela e fonte o chassi usa. Sem esse código, “Inspiron 15” ainda é uma família inteira, não um aparelho.",
      "Linhas que chegam ao balcão: Inspiron e Vostro de uso diário, Latitude de empresa, XPS fino e a linha G, que é a gamer da marca. Cada uma pede peça diferente. Preço e prazo confirmados pelo WhatsApp, depois do modelo.",
    ],
    blocos: [
      {
        titulo: "Inspiron e Vostro",
        texto:
          "São os Dell de casa e de pequeno escritório. A bancada separa lentidão (disco e memória) de defeito de carga, tela e teclado. Em vários Inspiron a memória ainda tem soquete; em outros, mais novos, vem soldada. Só o modelo fecha essa conta.",
      },
      {
        titulo: "Latitude de empresa",
        texto:
          "Latitude costuma ter etiqueta de patrimônio e senha de BIOS. Se a empresa bloqueou o disco ou a BIOS, avise antes: sem essa senha a bancada não formata nem troca o disco. Vários modelos ainda aceitam mais RAM; a geração recente nem sempre.",
      },
      {
        titulo: "XPS e linha G",
        texto:
          "XPS é chassi fino: a abertura pede cuidado e a peça é específica daquela geração. A linha G trabalha quente, como todo notebook gamer, e a limpeza com pasta entra na avaliação quando ele desliga sozinho. Não é um defeito “da marca”; é o que o teste de temperatura mostra no seu aparelho.",
      },
    ],
    pecas:
      "Carregador Dell muda de pino e de potência conforme a linha. A página de carregadores pede a foto da etiqueta (volts, watts e o conector). A loja confirma se aquela fonte está para retirar no balcão. Bateria e tela também dependem da Service Tag: a equipe diz se tem ou se encomenda, sem prometer data nesta página.",
    garantia:
      "Se o Dell ainda está na garantia do fabricante, o caminho é a própria Dell: abrir o aparelho numa assistência independente pode encerrar essa cobertura. Fora da garantia de fábrica, o reparo fica com a garantia legal do serviço da loja, nota fiscal e o mesmo balcão para retorno. A loja não é canal do fabricante.",
  },
  {
    slug: "notebook-lenovo",
    nome: "Notebook Lenovo",
    marca: "Lenovo",
    linhas: "IdeaPad, ThinkPad, Legion, LOQ e Yoga",
    titulo: "Conserto de Notebook Lenovo em Campinas (Cambuí)",
    descricao:
      "Conserto de notebook Lenovo em Campinas: IdeaPad, ThinkPad e Legion na bancada do Cambuí. Mande o modelo pelo WhatsApp e receba o orçamento.",
    palavras: [
      "conserto notebook lenovo campinas",
      "assistência técnica lenovo campinas",
      "thinkpad cambuí",
      "ideapad campinas",
      "lenovo legion assistência",
      "carregador lenovo campinas",
      "notebook lenovo não liga",
      "assistência independente lenovo",
    ],
    intro: [
      "Notebook Lenovo é atendido na bancada própria da Balão da Informática Anchieta, Av. Anchieta, 789, Cambuí. Assistência especializada e independente, sem vínculo com a Lenovo. Mande o modelo pelo WhatsApp (19) 98751-0267. Preço e prazo confirmados pelo WhatsApp.",
      "O número que importa está na etiqueta de baixo, no formato longo que começa parecido com “82” ou no MT-M do ThinkPad. “IdeaPad 3” sozinho não diz a tela nem o carregador. Foto dessa etiqueta adianta o orçamento.",
      "As famílias não compartilham peça: IdeaPad de casa, Yoga que dobra, ThinkPad de empresa, Legion e LOQ de jogo. A bancada trata cada uma pelo modelo, não por um texto genérico de marca.",
    ],
    blocos: [
      {
        titulo: "IdeaPad e Yoga",
        texto:
          "IdeaPad é o volume de casa e de estudo. Yoga soma a dobradiça da tela que vira. Os dois pedem o modelo exato para tela, teclado e bateria. Se a dobradiça está dura ou a tampa abriu torto, pare de forçar e traga: continuar abrindo costuma rasgar o flat da tela, e aí o conserto deixa de ser só a carcaça.",
      },
      {
        titulo: "ThinkPad",
        texto:
          "ThinkPad de empresa muitas vezes tem senha de supervisor e disco criptografado. Traga a senha ou a pessoa que administra a máquina. Sem isso, trocar SSD ou formatar não devolve o computador. Vários ThinkPad ainda aceitam RAM e disco; a linha mais fina solda os dois. O modelo responde.",
      },
      {
        titulo: "Legion e LOQ",
        texto:
          "São as linhas que jogam, então esquentam mais. Limpeza e pasta entram quando o teste mostra temperatura alta e desligamento. A fonte desses modelos é mais forte que a de um IdeaPad: não sirva um carregador “porque encaixou”. A etiqueta de watts manda.",
      },
      {
        titulo: "Líquido no Lenovo",
        texto:
          "Desligue, tire da tomada, não aperte tecla para “ver se voltou” e não ponha no sol. Alguns ThinkPad têm furo de dreno; isso não seca a placa. Traga o aparelho. Quanto menos ele ligar molhado, maior a chance de o reparo ficar na troca de teclado e não na placa.",
      },
    ],
    pecas:
      "O pino do carregador Lenovo não é único: retangular, USB-C e o plugue quadrado antigo convivem na marca. Foto da fonte velha evita comprar a errada. A página de carregadores é o caminho, e o estoque do dia é confirmado no WhatsApp, não nesta página.",
    garantia:
      "Dentro da garantia de fábrica, acione a Lenovo. Fora dela, a loja faz o reparo com garantia legal do serviço, nota e retorno no mesmo balcão. Não somos canal da marca.",
  },
  {
    slug: "notebook-acer",
    nome: "Notebook Acer",
    marca: "Acer",
    linhas: "Aspire, Nitro, Predator, Spin e TravelMate",
    titulo: "Conserto de Notebook Acer em Campinas (Cambuí)",
    descricao:
      "Conserto de notebook Acer em Campinas: Aspire, Nitro e Predator com bancada própria no Cambuí. Orçamento pelo WhatsApp, antes de abrir.",
    palavras: [
      "assistência acer nitro campinas",
      "conserto notebook acer campinas",
      "acer aspire cambuí",
      "acer predator campinas",
      "carregador acer campinas",
      "notebook acer esquentando",
      "tela acer campinas",
      "assistência independente acer",
    ],
    intro: [
      "A bancada da Balão da Informática Anchieta, no Cambuí, conserta Acer Aspire, Nitro, Predator, Spin e TravelMate. É assistência independente: não há vínculo com a Acer. O modelo completo, aquele da etiqueta de baixo com letras e números juntos, é o que permite orçar. “Nitro 5” ainda é uma geração inteira.",
      "Mande foto da etiqueta e do defeito no WhatsApp (19) 98751-0267. Preço e prazo confirmados pelo WhatsApp. Nada é aberto sem a sua aprovação.",
    ],
    blocos: [
      {
        titulo: "Aspire de todo dia",
        texto:
          "Aspire é a linha de estudo e de casa. Lentidão aqui muitas vezes é HD ou SSD pequeno, não “vírus” como primeira hipótese. A página de upgrade de SSD explica quando a troca de disco rende mais que formatar. Tela, teclado e carga seguem o modelo: a Acer reaproveita pouco entre gerações.",
      },
      {
        titulo: "Nitro e Predator",
        texto:
          "Nitro e Predator são gamer e trabalham quentes. Se desliga no jogo ou o ventilador grita, a bancada mede temperatura antes de trocar peça. Limpeza e pasta resolvem uma parte desses casos; placa já danificada por calor é outro orçamento, e você ouve os dois. Não publicamos aqui uma lista de “defeito típico” sem o aparelho na mesa.",
      },
      {
        titulo: "Spin e TravelMate",
        texto:
          "Spin dobra a tela; a dobradiça e o flat sofrem se a tampa é forçada. TravelMate é a linha de trabalho, às vezes com senha da empresa. Avise se o disco é criptografado. Nos dois, o carregador certo é o da etiqueta, não um universal “que entrou no plugue”.",
      },
    ],
    pecas:
      "Fonte Acer costuma ser o plugue amarelo redondo ou USB-C, com potência escrita na etiqueta. A loja confirma o carregador pela foto, na página de carregadores. Tela de Nitro não serve em Aspire. Por isso o orçamento espera o modelo, e o prazo de encomenda — quando a peça não está na loja — é dito na conversa, não chutado aqui.",
    garantia:
      "Garantia de fábrica ainda vigente: fale com a Acer antes de abrir. Depois que ela acaba, o serviço fica com a garantia legal da loja, nota fiscal e o balcão da Av. Anchieta para qualquer retorno.",
  },
  {
    slug: "notebook-hp",
    nome: "Notebook HP",
    marca: "HP",
    linhas: "Pavilion, Victus, Omen, ProBook e EliteBook",
    titulo: "Conserto de Notebook HP em Campinas (Cambuí)",
    descricao:
      "Conserto de notebook HP em Campinas: Pavilion, Victus, ProBook e EliteBook no Cambuí. Mande o modelo e receba o orçamento no WhatsApp.",
    palavras: [
      "conserto notebook hp campinas",
      "assistência técnica hp campinas",
      "hp pavilion cambuí",
      "hp elitebook campinas",
      "carregador hp campinas",
      "hp victus assistência",
      "notebook hp não liga",
      "assistência independente hp",
    ],
    intro: [
      "HP Pavilion, Victus, Omen, ProBook e EliteBook passam pela bancada da Balão da Informática Anchieta, Av. Anchieta, 789. Assistência especializada e independente, sem relação com a HP. O código do produto (aquele “15-dw…” mais o SKU longo da etiqueta) evita orçar a tela errada.",
      "WhatsApp (19) 98751-0267. Preço e prazo confirmados pelo WhatsApp. Diagnóstico e aprovação vêm antes da troca.",
    ],
    blocos: [
      {
        titulo: "Pavilion",
        texto:
          "Pavilion é o HP de casa. Dobradiça que range, teclado com tecla morta e tela com listra são triagens diferentes: a listra pode ser o flat, a tela ou a placa, e o teste separa isso antes de você comprar uma tela. Lentidão segue a mesma lógica das outras marcas: disco primeiro, formatação se o sistema for o problema.",
      },
      {
        titulo: "Victus e Omen",
        texto:
          "Victus e Omen jogam e esquentam. A fonte é de mais watts que a de um Pavilion, e o pino (muitas vezes o azul, em parte da linha) não é detalhe estético: fonte fraca faz o notebook desligar na placa de vídeo. Traga a fonte junto quando o defeito é “só no jogo”.",
      },
      {
        titulo: "ProBook e EliteBook",
        texto:
          "São as linhas de empresa. Senha de BIOS, computrace e disco criptografado travam o serviço se ninguém da empresa autoriza. A memória, em vários EliteBook, ainda é acessível; em outros, soldada. A etiqueta diz a geração. Peça corporativa às vezes demora mais para chegar: o prazo de encomenda é o que a loja te passar, não um número fixo desta página.",
      },
    ],
    pecas:
      "Carregador HP: foto da etiqueta, porque o plugue azul, o USB-C e o pino fino antigo não se misturam, e a potência também não. A página de carregadores recebe esse pedido. Estoque do dia, só pelo WhatsApp.",
    garantia:
      "Se a garantia da HP ainda vale, use o fabricante. Fora dela, a loja repara com garantia legal do serviço e nota. Não somos assistência da HP.",
  },
  {
    slug: "notebook-asus",
    nome: "Notebook Asus",
    marca: "Asus",
    linhas: "VivoBook, Zenbook, TUF e ROG",
    titulo: "Conserto de Notebook Asus em Campinas (Cambuí)",
    descricao:
      "Conserto de notebook Asus em Campinas: VivoBook, TUF e ROG na bancada do Cambuí. Mande o modelo pelo WhatsApp para orçar.",
    palavras: [
      "assistência asus campinas",
      "conserto notebook asus campinas",
      "asus tuf cambuí",
      "asus rog campinas",
      "vivobook assistência campinas",
      "carregador asus campinas",
      "notebook asus não carrega",
      "assistência independente asus",
    ],
    intro: [
      "Asus VivoBook, Zenbook, TUF e ROG são atendidos na Av. Anchieta, 789, pela Balão da Informática Anchieta. Assistência independente, sem vínculo com a Asus. O modelo costuma ser curto na tampa (um “X515” ou “FA506”) e longo na etiqueta. Os dois ajudam; a etiqueta fecha a peça.",
      "Chame no WhatsApp (19) 98751-0267 com o defeito em uma frase: não liga, não carrega, esquenta, tela, teclado. Preço e prazo confirmados pelo WhatsApp.",
    ],
    blocos: [
      {
        titulo: "VivoBook",
        texto:
          "É a linha de volume. Muitos ainda trocam disco e memória; a geração fina solda. “Está lento” aqui começa pelo que tem dentro, não pela formatação automática. Se a dobradiça cedeu e a tela ficou bamba, trazer cedo evita romper o cabo da imagem.",
      },
      {
        titulo: "Zenbook",
        texto:
          "Zenbook é chassi fino e, em vários modelos, tela OLED ou de alta resolução que não se troca por uma tela genérica de outro Asus. A abertura também não é a de um VivoBook. Por isso o orçamento de tela espera o modelo e a confirmação da peça, em vez de uma faixa inventada.",
      },
      {
        titulo: "TUF e ROG",
        texto:
          "TUF e ROG são as linhas de jogo. Fonte de muitos watts, muitas vezes USB-C ou o plugue grosso da marca, e temperatura alta sob carga. Traga o carregador original do aparelho quando o sintoma é desligar no jogo: a bancada precisa saber se a fonte entrega o que a placa pede. Limpeza só entra depois da medição.",
      },
    ],
    pecas:
      "Não existe “carregador Asus” único. A foto da etiqueta (voltagem e watts) e do plugue é o pedido. A loja vê se tem para retirada e, se não tiver, diz que precisa encomendar. O prazo dessa encomenda não está fixado nesta página.",
    garantia:
      "Garantia de fábrica em dia: procure a Asus. Depois disso, o reparo é da loja, com garantia legal, nota fiscal e retorno no Cambuí. A Balão não representa a marca.",
  },
  {
    slug: "notebook-samsung",
    nome: "Notebook Samsung",
    marca: "Samsung",
    linhas: "Book, Galaxy Book e Odyssey",
    titulo: "Conserto de Notebook Samsung em Campinas (Cambuí)",
    descricao:
      "Conserto de notebook Samsung em Campinas: Book, Galaxy Book e Odyssey no Cambuí. Mande o modelo. A peça é confirmada no WhatsApp.",
    palavras: [
      "conserto notebook samsung campinas",
      "assistência galaxy book campinas",
      "samsung book cambuí",
      "samsung odyssey campinas",
      "carregador samsung notebook",
      "notebook samsung não liga",
      "tela galaxy book campinas",
      "assistência independente samsung",
    ],
    intro: [
      "Book, Galaxy Book e Odyssey são os Samsung que a bancada da Balão da Informática Anchieta recebe na Av. Anchieta, 789. A loja é assistência independente. Não há vínculo com a Samsung e não usamos logo da marca.",
      "Peça de Samsung depende muito da geração, e várias linhas saíram de circulação no Brasil. Por isso esta página não promete peça em estoque. Mande o modelo completo no WhatsApp (19) 98751-0267 e a equipe diz se tem, se encomenda ou se o conserto não compensa. Preço e prazo confirmados pelo WhatsApp.",
    ],
    blocos: [
      {
        titulo: "Galaxy Book e linha Book",
        texto:
          "Galaxy Book recente é fino e, em parte dos modelos, usa USB-C para carregar. Book mais antigo usa fonte com pino próprio. Confundir os dois queima porta ou simplesmente não carrega. A etiqueta da fonte antiga resolve a dúvida. Tela e bateria pedem o número exato de baixo, não só “Galaxy Book 15”.",
      },
      {
        titulo: "Odyssey",
        texto:
          "Odyssey é a linha gamer da marca, mais rara no balcão do que um Book. Esquenta como os outros gamer. A avaliação é a mesma: temperatura medida, fonte conferida, e só então limpeza ou troca. Não trate anúncio de “pasta genérica” como igual ao serviço: a bancada testa depois.",
      },
      {
        titulo: "Quando a peça não compensa",
        texto:
          "Se a tela ou a placa de um Samsung fora de linha custa perto de um notebook novo, a loja fala isso antes. Notebooks à venda e seminovos estão no mesmo endereço, para você comparar com o conserto em vez de descobrir a conta no fim.",
      },
    ],
    pecas:
      "Carregador: foto da etiqueta, como nas outras marcas, pela página de carregadores. Não afirmamos pronta entrega de fonte Samsung. O que tiver no balcão no dia, o WhatsApp confirma.",
    garantia:
      "Aparelho ainda coberto pela Samsung: acione o fabricante. Fora dessa cobertura, o serviço da loja tem garantia legal, nota e o mesmo balcão. Não somos assistência da Samsung.",
  },
];

function mensagem(marca: string) {
  return `Olá! Tenho um notebook ${marca} modelo ____ com o problema ____. Vocês conseguem consertar? Preço e prazo?`;
}

function outras(atual: string) {
  return MARCAS.filter((m) => m.slug !== atual).map((m) => ({
    titulo: m.nome,
    texto: m.linhas,
    href: `/${m.slug}`,
    imagem: "/images/landing/v2/manutencao.jpg",
  }));
}

export const paginasDeMarca: PaginaDeCaptacao[] = MARCAS.map((m) => {
  const texto = mensagem(m.marca);
  return {
    slug: m.slug,
    nome: `Conserto de notebook ${m.marca}`,
    chamada: `Assistência independente para notebook ${m.marca} (${m.linhas}) no Cambuí, com orçamento antes de abrir.`,
    seo: {
      titulo: m.titulo,
      descricao: m.descricao,
      palavras: m.palavras,
      tipoDeServico: `Conserto de notebook ${m.marca}`,
      marca: m.marca,
      catalogo: ["Diagnóstico de notebook", "Troca de tela", "Troca de teclado", "Bateria e conector", "Limpeza interna"],
    },
    hero: {
      contexto: "Assistência independente no Cambuí, em Campinas",
      titulo: `Conserto de notebook ${m.marca} no Cambuí`,
      texto: `Bancada própria para ${m.linhas}. Assistência especializada e independente, sem vínculo com o fabricante. Mande o modelo no WhatsApp e receba o orçamento antes de qualquer serviço. Preço e prazo confirmados pelo WhatsApp.`,
      imagem: { src: "/images/landing/v2/manutencao.jpg", alt: `Notebook aberto na bancada para conserto` },
      mensagem: texto,
      botao: "Mandar o modelo no WhatsApp",
      secundario: { rotulo: "Ver as linhas", href: "#secao-2" },
      fatos: [
        { valor: "Independente", rotulo: "não somos canal do fabricante" },
        { valor: "Orçamento antes", rotulo: "nada é aberto sem aprovação" },
        { valor: "Laboratório", rotulo: "na própria loja da Av. Anchieta" },
        { valor: "Nota fiscal", rotulo: "e garantia legal do serviço" },
      ],
    },
    assistente: {
      titulo: "Modelo e defeito",
      texto: "A mensagem já leva a marca. Falta o modelo que está na etiqueta.",
      abertura: texto,
      botao: "Enviar para a bancada",
      perguntas: [
        { rotulo: "Linha", pergunta: `Qual linha é o seu ${m.marca}?`, opcoes: [...m.linhas.split(", ").slice(0, 4), "Não sei"] },
        {
          rotulo: "Defeito",
          pergunta: "O que aconteceu?",
          opcoes: ["Não liga ou não carrega", "Tela", "Esquenta", "Teclado ou dobradiça", "Lento"],
        },
      ],
    },
    secoes: [
      {
        tipo: "texto",
        titulo: `Conserto de notebook ${m.marca} no Cambuí`,
        paragrafos: m.intro,
      },
      {
        tipo: "regras",
        titulo: `O que a bancada confere num ${m.marca}`,
        texto: "Isto é o roteiro do diagnóstico, não uma lista de defeitos inventada. A causa do seu aparelho sai do teste.",
        itens: m.blocos,
      },
      {
        tipo: "texto",
        titulo: `Peças e carregadores ${m.marca}`,
        paragrafos: [m.pecas, "O conserto de notebook, para qualquer marca, está na página de assistência. Apple fica à parte, na página de reparo Apple."],
      },
      {
        tipo: "retorno",
        titulo: "Pedir retorno rápido",
        texto: "Marca já preenchida. Falta o modelo da etiqueta e o defeito.",
        assunto: `Notebook ${m.marca}`,
        campos: [
          { nome: "marca", rotulo: "Marca", valor: m.marca },
          { nome: "modelo", rotulo: "Modelo" },
          { nome: "defeito", rotulo: "Defeito" },
        ],
      },
      {
        tipo: "texto",
        titulo: "Seu notebook ainda está na garantia de fábrica?",
        paragrafos: [m.garantia],
      },
      {
        tipo: "texto",
        titulo: "Preço e prazo",
        paragrafos: [
          "Tela, bateria, teclado, conector e limpeza não têm o mesmo valor, e o valor muda com o modelo. Esta página não publica faixa. Preço e prazo confirmados pelo WhatsApp (19) 98751-0267.",
          "Se você não pode vir ao Cambuí, a coleta por motoboy em Campinas e região é combinada na mesma conversa, com o custo à parte. Não há tabela de bairro publicada aqui.",
          "Enquanto a peça não está confirmada, não marque compromisso em cima de um prazo. A equipe só fala data quando sabe se a peça está na loja ou se precisa encomendar.",
        ],
      },
      {
        tipo: "atalhos",
        titulo: "Outras marcas e a assistência",
        itens: [
          { titulo: "Conserto de notebook", texto: "Por sintoma, qualquer marca.", href: "/manutencao", imagem: "/images/landing/v2/manutencao.jpg" },
          { titulo: "Carregadores", texto: "Fonte conferida pela etiqueta.", href: "/carregadores", imagem: "/images/landing/v2/carregadores.jpg" },
          { titulo: "Upgrade de SSD", texto: "Quando o caso é lentidão de disco.", href: "/upgrade-ssd", imagem: "/images/landing/v2/manutencao.jpg" },
          { titulo: "Serviços Apple", texto: "MacBook, iPhone e iMac, na assistência independente.", href: "/reparoapple", imagem: "/images/landing/v2/reparoapple.jpg" },
          { titulo: "Licenças", texto: "Windows, se a formatação entrar no serviço.", href: "/microsoft", imagem: "/images/landing/v2/microsoft.jpg" },
          ...outras(m.slug).slice(0, 3),
        ],
      },
    ],
    perguntas: [
      {
        pergunta: `Onde consertar notebook ${m.marca} em Campinas?`,
        resposta: `A Balão da Informática Anchieta, na Av. Anchieta, 789, Cambuí, conserta notebooks ${m.marca} (${m.linhas}) em laboratório próprio, com orçamento pelo WhatsApp (19) 98751-0267 e garantia legal do serviço. A loja é assistência independente.`,
      },
      {
        pergunta: `A Balão da Informática Anchieta é assistência especializada em ${m.marca}?`,
        resposta: `Sim, é uma assistência técnica independente e especializada em notebooks ${m.marca}, com laboratório próprio no Cambuí. O orçamento sai pelo WhatsApp e o serviço tem a garantia legal da loja. Para notebook ainda na garantia do fabricante, o indicado é acionar o próprio fabricante.`,
      },
      {
        pergunta: `Vocês têm carregador ${m.marca} para pronta entrega?`,
        resposta: `O estoque muda. A loja confirma pelo WhatsApp (19) 98751-0267 se o carregador desse modelo está para retirada no balcão. Mande a foto da etiqueta da fonte antiga, com voltagem, watts e o tipo de pino.`,
      },
      {
        pergunta: "Quanto tempo a peça demora?",
        resposta:
          "Se estiver na loja, a conversa é sobre a agenda da bancada. Se precisar encomendar, o prazo é o que o fornecedor passar naquele pedido. Preço e prazo confirmados pelo WhatsApp.",
      },
    ],
    tituloDasPerguntas: "Perguntas frequentes",
    temas: ["assistencia", "notebook", "manutencao", m.marca.toLowerCase()],
    termosDoBlog: ["notebook", m.marca.toLowerCase(), "tela", "bateria", "carregador"],
    relacionadas: ["manutencao", "carregadores", "upgrade-ssd", "reparoapple"],
    final: {
      titulo: `Mande o modelo do ${m.marca}`,
      texto: "Av. Anchieta, 789, Cambuí. Segunda a sexta, 9h às 18h. Sábado, 9h às 13h. Preço e prazo confirmados pelo WhatsApp.",
      botao: "Chamar no WhatsApp",
      mensagem: texto,
    },
  };
});

export const notebookDell = paginasDeMarca[0];
export const notebookLenovo = paginasDeMarca[1];
export const notebookAcer = paginasDeMarca[2];
export const notebookHp = paginasDeMarca[3];
export const notebookAsus = paginasDeMarca[4];
export const notebookSamsung = paginasDeMarca[5];
