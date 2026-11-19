import type { Artigo, Fonte } from "@/lib/blog/tipos";

const ROCKSTARVI: Fonte = {
  nome: "Rockstar Games — página oficial de Grand Theft Auto VI",
  url: "https://www.rockstargames.com/VI",
  data: "consulta em 19 de novembro de 2026",
};

const YAHOOPC: Fonte = {
  nome: "Yahoo / Just Jared — “GTA 6 PC Release Date: Is Grand Theft Auto VI Coming to PC?”",
  url: "https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html",
  data: "15 de novembro de 2026",
};

const ROCKSTARDATA: Fonte = {
  nome: "Rockstar Games — “Grand Theft Auto VI is Now Set to Launch November 19, 2026”",
  url: "https://www.rockstargames.com/newswire/article/ak3ak31a49a221/grand-theft-auto-vi-is-now-set-to-launch-november-19-2026",
  data: "6 de novembro de 2025",
};

const artigo: Artigo = {
  slug: "notebook-gamer-ou-desktop-gta-6",
  titulo: "Notebook gamer ou desktop para quando sair o GTA 6",
  resumo: "A placa do notebook em geral não se troca. RAM e SSD às vezes sim, conforme o modelo. O desktop troca peça com mais ar e mais espaço.",
  categoria: "guias",
  etiquetas: [
    "GTA 6",
    "Notebook",
    "Desktop",
    "Upgrade",
  ],
  capa: {
    src: "/blog/capas/notebook-gamer-ou-desktop-gta-6.webp",
    alt: "Teclado de notebook e mouse sem fio, em close.",
    largura: 1536,
    altura: 1024,
    pronta: false,
  },
  publicadoEm: "2026-11-10T15:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "Notebook gamer ou desktop para o GTA 6",
    palavrasChave: [
      "notebook gamer ou desktop",
      "notebook para gta 6",
      "desktop ou notebook gamer",
      "upgrade de notebook gamer",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "Notebook gamer ou desktop, para quando sair GTA 6, é uma escolha de formato, não de requisito. O jogo de computador não foi anunciado até 19 de novembro de 2026, então nenhum dos dois “já vem pronto para o GTA”. O que muda agora é o que você consegue trocar depois e quanto ar a peça tem para trabalhar.",
    },
    {
      tipo: "paragrafo",
      texto: "A placa de vídeo do notebook, em geral, não se troca. Memória e SSD às vezes se trocam, às vezes não, e isso depende do modelo, não da palavra gamer na tampa. O desktop troca placa, fonte e disco com mais folga e dissipa calor com mais ar. Dizer que todo notebook aceita upgrade é o erro que este texto evita.",
    },
    {
      tipo: "resumo",
      itens: [
        "**A placa do notebook em geral fica.** Ela não é uma peça de gaveta como a do desktop.",
        "**RAM e SSD às vezes entram.** Só o modelo, olhado por dentro, confirma o encaixe.",
        "**O desktop troca com mais espaço e mais ar.** A contrapartida é ficar na mesa.",
        "**GTA 6 não escolhe o formato.** Não há versão de PC nem requisito para copiar.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que cada formato deixa você trocar",
    },
    {
      tipo: "paragrafo",
      texto: "O desktop é uma caixa de peças com padrão de encaixe. Placa de vídeo, fonte, SSD e, dentro do que a placa-mãe aceita, memória e processador podem sair. O limite é compatibilidade e espaço, o mesmo limite do guia de [upgrade](/blog/upgrade-do-pc-antes-do-gta-6). O notebook é um volume fechado, desenhado em torno de uma placa que quase sempre nasce soldada.",
    },
    {
      tipo: "tabela",
      titulo: "O que cada formato costuma permitir",
      colunas: [
        "Peça",
        "Notebook gamer",
        "Desktop",
      ],
      linhas: [
        [
          "Placa de vídeo",
          "Em geral não se troca",
          "Troca, se fonte e espaço aguentam",
        ],
        [
          "Memória",
          "Às vezes, conforme o modelo",
          "Troca no limite da placa-mãe",
        ],
        [
          "SSD",
          "Às vezes, conforme o modelo",
          "Troca com mais folga de baia",
        ],
        [
          "Calor",
          "Volume fino e menos ar",
          "Gabinete com mais ar em volta",
        ],
      ],
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/notebook-gamer-ou-desktop-gta-6-formatos.webp",
        alt: "Teclado com luz roxa no balcão da frente do corredor.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Teclado com luz roxa no balcão da frente do corredor. Foto da loja, na Av. Anchieta, 789, Cambuí.",
    },
    {
      tipo: "paragrafo",
      texto: "Portabilidade puxa o outro lado. Se você joga em mais de um cômodo, viaja ou não tem mesa fixa, o notebook carrega a sessão. O desktop não. Essa vantagem é real e não precisa ser disfarçada de upgrade. São critérios diferentes. Misturar os dois num “melhor para GTA 6” finge uma ficha que a [página oficial](https://www.rockstargames.com/VI) não publicou.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "A placa do notebook quase sempre fica",
    },
    {
      tipo: "paragrafo",
      texto: "No notebook gamer, a placa de vídeo costuma estar soldada na placa principal. Não há um slot largo para você sacar uma e enfiar outra, como no desktop. Quando a placa fica curta para o jogo que você já joga, o caminho usual não é troca de GPU. É conviver com o ajuste gráfico mais baixo ou trocar o aparelho.",
    },
    {
      tipo: "paragrafo",
      texto: "Existem módulos externos e um ou outro projeto raro com placa substituível. Não são a regra da prateleira, e este texto não trata exceção como norma. Se o vendedor diz que “depois você troca a placa”, peça o nome do encaixe. Na maior parte dos modelos, esse encaixe não existe. A promessa só vale se o modelo mostrar o caminho.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Memória e SSD dependem do modelo",
    },
    {
      tipo: "paragrafo",
      texto: "RAM e SSD são o pedaço que às vezes se abre. Alguns notebooks têm soquete de memória e baia de SSD. Outros trazem a memória soldada e um único SSD já ocupado. Outros aceitam um segundo disco e não aceitam mais RAM. A tampa é que mostra. Foto de divulgação e a palavra gamer não mostram.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Modelo parecido não é o mesmo encaixe",
    },
    {
      tipo: "paragrafo",
      texto: "Dois notebooks da mesma marca, com tela parecida, podem divergir por dentro de um ano para o outro. Um aceita pente. O outro soldou a memória. Por isso ninguém honesto promete upgrade de notebook sem ver o modelo. A [página de notebooks](/notebooks) é o catálogo. A resposta de encaixe continua sendo do aparelho concreto, não da categoria.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/notebook-gamer-ou-desktop-gta-6-escolha.webp",
        alt: "Estantes brancas do corredor, com caixas e monitores.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Estantes brancas do corredor, com caixas e monitores. Foto da loja, na Av. Anchieta, 789, Cambuí.",
    },
    {
      tipo: "destaque",
      tom: "atencao",
      titulo: "Não é todo notebook que abre",
      texto: "Dizer que dá para aumentar a RAM ou trocar o SSD de qualquer notebook gamer é falso. Dá em alguns modelos. A placa de vídeo, na regra geral, permanece a que veio de fábrica.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O desktop respira e aceita peça com mais folga",
    },
    {
      tipo: "paragrafo",
      texto: "O mesmo jogo esquenta menos apertado quando há mais ar e um cooler à altura da peça. O desktop ganha nisso: gabinete, ventoinha e fonte ficam acessíveis. Dá para trocar a placa se a fonte e o espaço permitem, e dá para completar a memória se a placa-mãe aceita. É o caminho de quem pretende ficar vários anos na mesma caixa, trocando o que ficar curto.",
    },
    {
      tipo: "paragrafo",
      texto: "Essa folga não é requisito de GTA 6. É física de computador. A faixa de [entrada](/blog/pc-gamer-entrada-para-gta-6), a intermediária e a alta descrevem uso de tela e de captura, e cabem num desktop com mais naturalidade justamente porque a peça se troca. No notebook, você escolhe a faixa inteira no dia da compra, porque a placa tende a ficar.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Os dois esperam a mesma ficha, que não existe",
    },
    {
      tipo: "paragrafo",
      texto: "O [Yahoo](https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html), em 15 de novembro de 2026, não encontrou versão de PC, pré-venda nem requisito. O dia 19 de novembro de 2026 continua sendo de console. Esperar “o notebook do GTA” ou “o desktop do GTA” é esperar um documento que não está no ar. O guia [sem requisito](/blog/pc-para-gta-6-sem-requisito-oficial) é o que dá para ler enquanto isso.",
    },
    {
      tipo: "paragrafo",
      texto: "Se o orçamento não fecha num aparelho novo, o [seminovo](/seminovos) existe como caminho, com o mesmo cuidado: no notebook, a placa que está dentro é a placa que fica. No desktop seminovo, ainda cabe perguntar fonte, espaço e memória. Nenhum dos dois formatos recebe um selo de GTA 6 por ser seminovo ou por ser novo.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/notebook-gamer-ou-desktop-gta-6-fecho.webp",
        alt: "Corredor da loja, com o balcão branco, estantes e as luminárias em X no teto.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Corredor da loja, com o balcão branco, estantes e as luminárias em X no teto. Foto da loja, na Av. Anchieta, 789, Cambuí.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "O notebook leva o jogo com você, e essa vantagem fica explícita em vez de virar promessa de upgrade",
        "O desktop deixa trocar placa, fonte e disco, com mais ar, quando a compatibilidade fecha",
        "RAM e SSD de notebook ficam condicionados ao modelo, então a tampa decide no lugar do folheto",
      ],
      contras: [
        "A placa do notebook, na regra geral, não se troca quando o jogo de hoje aperta",
        "Nem todo notebook aceita mais memória ou outro SSD, mesmo entre modelos parecidos",
        "Nenhum formato antecipa GTA 6 no PC, porque a versão de computador não foi anunciada",
      ],
    },
    {
      tipo: "chamada",
      tema: "notebooks",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Olhar a tampa antes de prometer troca",
    },
    {
      tipo: "paragrafo",
      texto: "Na Balão da Informática Anchieta, Av. Anchieta, 789, no Cambuí, Campinas, a equipe olha a tampa do notebook porque é isso que diz se a RAM e o SSD daquele modelo se trocam. A placa de vídeo, em geral, permanece. No desktop, a conversa é outra: fonte, espaço e placa-mãe. Você vê o aparelho ligado antes de pagar.",
    },
    {
      tipo: "paragrafo",
      texto: "Mande o modelo no WhatsApp (19) 98751-0267. O orçamento é o do dia, porque o preço muda. A resposta pode ser que aquele notebook não aceita o upgrade que você imaginou. Essa resposta é o serviço. Não é falta de peça “para o GTA”, já que essa peça oficial não existe.",
    },
    {
      tipo: "chamada",
      titulo: "Notebook ou desktop: qual dos dois você usa hoje?",
      texto: "Diga o modelo do notebook ou as peças do desktop. A equipe olha o que dá para trocar e o que permanece.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "Dá para trocar a placa de vídeo do notebook gamer?",
      resposta: "Em geral, não. A placa costuma vir soldada. Troca de GPU é regra de desktop, não de notebook. Se alguém promete a troca, peça o encaixe daquele modelo. Sem esse encaixe, a promessa não se sustenta.",
    },
    {
      pergunta: "Todo notebook gamer aceita mais RAM e SSD?",
      resposta: "Não. Alguns têm soquete de memória e baia livre. Outros trazem a memória soldada ou o SSD único já cheio. Modelos parecidos divergem. Só a tampa daquele modelo responde.",
    },
    {
      pergunta: "Desktop esquenta menos que notebook?",
      resposta: "O desktop tem mais ar e mais espaço para trocar o que refrigera a peça. O notebook concentra a mesma carga num volume fino. Isso não torna o desktop a configuração de GTA 6. Torna o formato mais folgado para upgrade.",
    },
    {
      pergunta: "Qual dos dois compro para o dia 19 de novembro?",
      resposta: "Nenhum dos dois, se a meta é GTA 6 nesse dia. O lançamento publicado é de PlayStation 5 e Xbox Series. Notebook e desktop continuam sendo escolha para os jogos de PC que você já joga.",
    },
  ],
  fontes: [
    ROCKSTARVI,
    YAHOOPC,
    ROCKSTARDATA,
  ],
};

export default artigo;
