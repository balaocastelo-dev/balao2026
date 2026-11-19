import type { Artigo, Fonte } from "@/lib/blog/tipos";

const ROCKSTARVI: Fonte = {
  nome: "Rockstar Games — página oficial de Grand Theft Auto VI",
  url: "https://www.rockstargames.com/VI",
  data: "consulta em 19 de novembro de 2026",
};

const PLAYSTATION: Fonte = {
  nome: "PlayStation — página de Grand Theft Auto VI",
  url: "https://www.playstation.com/en-us/games/grand-theft-auto-vi/",
  data: "consulta em 19 de novembro de 2026",
};

const VERGEATRASO: Fonte = {
  nome: "The Verge — “Grand Theft Auto VI launch delayed until November 2026”, Jay Peters",
  url: "https://www.theverge.com/news/816005/grand-theft-auto-vi-gta-g-delayed-november-2026",
  data: "6 de novembro de 2025",
};

const PSSUPORTE: Fonte = {
  nome: "PlayStation — suporte de Grand Theft Auto VI",
  url: "https://www.playstation.com/en-us/support/games/gta-vi-support/",
  data: "consulta em 19 de novembro de 2026",
};

const artigo: Artigo = {
  slug: "gta-6-lucia-e-jason",
  titulo: "Lucia e Jason em GTA 6: o que se sabe dos dois",
  resumo: "O texto oficial de GTA 6 chama os dois de Jason e Lucia. Os sobrenomes Duval e Caminos saem na The Verge, não na Rockstar.",
  categoria: "noticias",
  etiquetas: [
    "GTA 6",
    "Lucia",
    "Jason",
  ],
  capa: {
    src: "/blog/capas/gta-6-lucia-e-jason.webp",
    alt: "Hotéis e palmeiras de Miami Beach no fim da tarde.",
    largura: 1536,
    altura: 1024,
    pronta: false,
  },
  publicadoEm: "2026-11-15T15:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "Lucia e Jason em GTA 6: o que se sabe",
    palavrasChave: [
      "lucia gta 6",
      "jason gta 6",
      "lucia caminos",
      "jason duval",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "Quem pesquisa Lucia e Jason em GTA 6 mistura nome oficial, sobrenome de reportagem e frase que a Rockstar não escreveu. Dá para separar as três coisas. O texto oficial usa Jason e Lucia. Os sobrenomes Jason Duval e Lucia Caminos estão numa matéria da The Verge. Biografia além da sinopse não está nessas páginas.",
    },
    {
      tipo: "paragrafo",
      texto: "A sinopse diz que os dois sempre souberam que o jogo está contra eles, que um golpe fácil dá errado, e que a história corre no lado mais escuro do lugar mais ensolarado dos Estados Unidos, numa conspiração no estado de Leonida. É uma experiência de um jogador. O resto que circula sobre a vida deles não tem, aqui, uma frase para acompanhar.",
    },
    {
      tipo: "resumo",
      itens: [
        "**Os nomes oficiais são Jason e Lucia.** É assim que a sinopse os chama.",
        "**Duval e Caminos são da The Verge.** A data dessa matéria é 6 de novembro de 2025.",
        "**A sinopse diz o conflito, não a ficha.** Golpe fácil que dá errado, no estado de Leonida.",
        "**Não há voz em português do Brasil.** O anúncio traz inglês com voz e português só em texto.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Quais nomes estão no texto oficial",
    },
    {
      tipo: "paragrafo",
      texto: "A [página de Grand Theft Auto VI](https://www.rockstargames.com/VI) apresenta os dois como Jason e Lucia. Não é apelido de fórum nem abreviação. Quando o texto oficial precisa dizer quem vive a história, usa esses nomes. A matéria dos [trailers](/blog/gta-6-trailers-oficiais) não substitui essa frase: vídeo datado não é a sinopse, e cena não entra como fonte de nome neste texto.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-6-lucia-e-jason-dupla.webp",
        alt: "Pessoa de headset e controle, jogando com luz verde.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Pessoa de headset e controle, jogando com luz verde. Foto de Ian van der Linde (Pexels).",
    },
    {
      tipo: "paragrafo",
      texto: "O jogo é anunciado como experiência de um jogador, na página da PlayStation e no comunicado da Take-Two. Jason e Lucia são as pessoas dessa campanha solo, no que a sinopse conta. Um modo online no dia do lançamento não está nessa resposta. Procurar os dois dentro de um modo que a página não promete é adiantar um anúncio que não existe.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "De onde saem os sobrenomes",
    },
    {
      tipo: "paragrafo",
      texto: "Jason Duval e Lucia Caminos aparecem na [The Verge de 6 de novembro de 2025](https://www.theverge.com/news/816005/grand-theft-auto-vi-gta-g-delayed-november-2026). A reportagem é de imprensa, no dia em que a data do jogo mudou para 19 de novembro de 2026. O sobrenome cabe numa citação dessa matéria. Não cabe como se fosse uma linha da sinopse, porque o trecho oficial usado aqui diz Jason e Lucia.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-6-lucia-e-jason-origem.webp",
        alt: "Avenida do centro de Miami à noite, com rastros de luz.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Avenida do centro de Miami à noite, com rastros de luz. Foto de Marcelo Gonzalez (Pexels).",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Sobrenome de imprensa não é frase da Rockstar",
    },
    {
      tipo: "paragrafo",
      texto: "As duas informações podem conviver, desde que cada uma leve a fonte. Escrever “Lucia Caminos, como a Rockstar apresentou” atribui à empresa uma frase que, nestas páginas, está na The Verge. Escrever só Lucia, quando a pergunta é o nome oficial, fica fiel ao texto da Rockstar. A escolha depende de qual fonte você está disposto a mostrar.",
    },
    {
      tipo: "tabela",
      titulo: "O que cada fonte põe no nome",
      colunas: [
        "Dado",
        "Onde está",
        "Limite",
      ],
      linhas: [
        [
          "Jason e Lucia",
          "Texto oficial",
          "Nomes da sinopse",
        ],
        [
          "Jason Duval",
          "The Verge, 6 nov 2025",
          "Não é linha da sinopse",
        ],
        [
          "Lucia Caminos",
          "The Verge, 6 nov 2025",
          "Não é linha da sinopse",
        ],
        [
          "Golpe fácil dá errado",
          "Sinopse oficial",
          "Sem idade nem ofício",
        ],
        [
          "Voz em português",
          "PlayStation",
          "Português do Brasil é só texto",
        ],
      ],
      nota: "Sinopse na página da Rockstar. Sobrenomes na The Verge. Idioma na PlayStation.",
    },
    {
      tipo: "destaque",
      tom: "nota",
      titulo: "Como assinar o sobrenome",
      texto: "Jason Duval e Lucia Caminos pedem a The Verge de 6 de novembro de 2025. O texto oficial usado aqui diz Jason e Lucia.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que a sinopse diz que os dois enfrentam",
    },
    {
      tipo: "citacao",
      texto: "Jason e Lucia sempre souberam que o jogo está contra eles. Um golpe fácil dá errado, no lado mais escuro do lugar mais ensolarado dos Estados Unidos, numa conspiração no estado de Leonida.",
      autor: "Rockstar Games",
      cargo: "sinopse oficial de Grand Theft Auto VI",
      fonte: ROCKSTARVI,
      traduzida: true,
    },
    {
      tipo: "paragrafo",
      texto: "A frase responde o conflito, não a ficha civil. Não há idade, ofício, parentesco nem cidade de origem nesse trecho. “O jogo está contra eles” é a formulação da sinopse, no sentido de que a situação pesa contra os dois. Não é uma lista de sistemas do videogame. O lugar chamado na frase, o estado de Leonida, está destrinchado na matéria do [mapa](/blog/gta-6-mapa-leonida-e-vice-city).",
    },
    {
      tipo: "paragrafo",
      texto: "A [PlayStation](https://www.playstation.com/en-us/games/grand-theft-auto-vi/) publica a mesma sinopse: os dois, o golpe que dá errado e Leonida. Esse texto não acrescenta família nem emprego. O que a sinopse firma é o nome, o golpe e o estado. Frase que não está nesse texto não deve ser assinada pela Rockstar.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que não dá para afirmar sobre os dois",
    },
    {
      tipo: "paragrafo",
      texto: "Idioma é outra pergunta, e a resposta não é biografia. No anúncio da PlayStation, inglês tem voz e texto. Português do Brasil tem texto, sem voz. Você pode ler o jogo em português. Não há, nesse anúncio, dublagem em português do Brasil para Jason, Lucia ou qualquer outro personagem. Isso não diz de que país eles são. Diz qual faixa de áudio foi anunciada.",
    },
    {
      tipo: "paragrafo",
      texto: "O que sobra de concreto é pouco, e é o que dá para repetir: dois nomes oficiais, dois sobrenomes numa reportagem, um golpe que dá errado, um estado e uma campanha solo. A série junta o resto em [GTA 6 no blog](/blog/gta-6). Personagem anunciado não publica versão de PC, não publica requisito e não escolhe peça de computador.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/gta-6-lucia-e-jason-fecho.webp",
        alt: "Miami Beach no crepúsculo, com palmeiras e a rua acesa.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Miami Beach no crepúsculo, com palmeiras e a rua acesa. Foto de Jojo Tesini (Pexels).",
    },
    {
      tipo: "pros-contras",
      pros: [
        "Jason e Lucia ficam como os nomes do texto oficial, fáceis de checar na página da Rockstar",
        "Duval e Caminos ficam atribuídos à The Verge, com data",
        "A sinopse diz o conflito sem completar idade, ofício ou parentesco",
      ],
      contras: [
        "Não há ficha biográfica nessas páginas",
        "Português do Brasil não traz voz no anúncio",
        "Frase que não está na sinopse não deve ser assinada pela Rockstar",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Se a dúvida saiu do nome e foi para o computador",
    },
    {
      tipo: "paragrafo",
      texto: "Saber o nome dos dois não muda o aparelho. Quem quiser falar do computador passa na Balão da Informática Anchieta, Av. Anchieta, 789, Cambuí, Campinas, ou chama no WhatsApp (19) 98751-0267. A conversa é o que você joga hoje, não a sinopse.",
    },
    {
      tipo: "paragrafo",
      texto: "A equipe mostra a máquina ligada e separa essa visita da ficha de Jason e Lucia. Nome anunciado não substitui versão de PC, que segue sem data. Você vê o computador funcionar com os jogos que já tem, e a decisão fica nesse uso.",
    },
    {
      tipo: "chamada",
      titulo: "Nome de personagem não é ficha de hardware.",
      texto: "Fale dos jogos e da tela que você já tem. A máquina é mostrada ligada antes de você decidir.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "Qual é o nome oficial de Lucia e de Jason?",
      resposta: "O texto oficial os chama de Lucia e Jason. Os sobrenomes Lucia Caminos e Jason Duval aparecem na The Verge de 6 de novembro de 2025, e pedem essa fonte quando forem usados.",
    },
    {
      pergunta: "O que a sinopse diz que acontece com os dois?",
      resposta: "Diz que sempre souberam que o jogo está contra eles, que um golpe fácil dá errado e que há uma conspiração no estado de Leonida, no lado mais escuro do lugar mais ensolarado dos Estados Unidos.",
    },
    {
      pergunta: "Jason e Lucia falam português?",
      resposta: "O anúncio não traz voz em português do Brasil. Inglês tem voz e texto. Português do Brasil fica só no texto. Isso informa a faixa de áudio, não a origem dos personagens.",
    },
    {
      pergunta: "Dá para completar a biografia dos dois com o que foi anunciado?",
      resposta: "Não. A sinopse dá os nomes, o golpe que dá errado e o estado de Leonida. Idade, ofício, parentesco e frase que não está nesse texto ficam de fora.",
    },
  ],
  fontes: [
    ROCKSTARVI,
    PLAYSTATION,
    VERGEATRASO,
    PSSUPORTE,
  ],
};

export default artigo;
