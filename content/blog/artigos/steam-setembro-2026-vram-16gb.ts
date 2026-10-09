import type { Artigo, Fonte } from "@/lib/blog/tipos";

const STEAM: Fonte = {
  nome: "Steam — Pesquisa de hardware e software",
  url: "https://store.steampowered.com/hwsurvey/",
  data: "setembro de 2026",
};

const PCGUIDE: Fonte = {
  nome: "PC Guide — “16GB VRAM continues to grow in latest Steam survey”",
  url: "https://www.pcguide.com/news/16gb-vram-continues-to-grow-in-latest-steam-survey-widening-the-gap-to-12gb-and-8gb-graphics-card-owners/",
  data: "setembro de 2026, sobre os dados de agosto",
};

const artigo: Artigo = {
  slug: "steam-setembro-2026-vram-16gb",
  titulo: "Steam de setembro: 16 GB de VRAM seguem à frente dos 8 GB",
  resumo:
    "Na pesquisa da Steam de setembro de 2026, placas de 16 GB estão em 27,21% dos PCs, contra 26,71% das de 8 GB. Veja o que isso muda na compra.",
  categoria: "noticias",
  etiquetas: ["Placa de vídeo", "VRAM", "Steam", "Upgrade"],
  capa: {
    src: "/blog/capas/steam-setembro-2026-vram-16gb.webp",
    alt: "Três barras horizontais: a vermelha e a cinza quase do mesmo tamanho, a terceira com a metade",
    largura: 1536,
    altura: 1024,
    pronta: true,
  },
  publicadoEm: "2026-10-09T03:05:00.000Z",
  autor: { nome: "Equipe Balão da Informática", url: "/sobre-nos" },
  origem: "autoral",
  seo: {
    titulo: "Steam de setembro: 16 GB de VRAM à frente dos 8 GB",
    palavrasChave: ["pesquisa de hardware da steam", "placa de vídeo 16gb", "8gb de vram", "steam setembro 2026"],
  },

  blocos: [
    {
      tipo: "paragrafo",
      texto:
        "As placas de vídeo com 16 GB de memória continuam sendo as mais comuns entre os jogadores de PC. Na pesquisa de hardware e software da Steam referente a setembro de 2026, elas aparecem em 27,21% dos computadores. As de 8 GB, que lideraram por anos, vêm logo atrás, com 26,71%.",
    },
    {
      tipo: "paragrafo",
      texto:
        "A distância é de meio ponto percentual e encolheu no mês: as de 8 GB cresceram 0,97 ponto e as de 16 GB, 0,29. Em agosto, segundo o PC Guide, os números eram 26,92% e 25,75%. As duas faixas seguem praticamente empatadas, com as placas de 12 GB em terceiro lugar.",
    },

    { tipo: "titulo", nivel: 2, texto: "O que a pesquisa mostra" },
    {
      tipo: "tabela",
      titulo: "Memória de vídeo nos computadores dos jogadores",
      colunas: ["Memória de vídeo", "Agosto de 2026", "Setembro de 2026"],
      linhas: [
        ["16 GB", "26,92%", "**27,21%**"],
        ["8 GB", "25,75%", "**26,71%**"],
        ["12 GB", "12,99%", "**13,06%**"],
      ],
      colunaDestaque: 2,
      fonte: STEAM,
      nota: "Números de agosto conforme publicados pelo PC Guide.",
    },
    {
      tipo: "paragrafo",
      texto:
        "Nas telas, o Full HD segue na frente: 47,91% dos jogadores usam 1920 × 1080 como resolução principal, e 27,04% já estão em 2560 × 1440. É a combinação que mais pesa sobre a memória de vídeo — resolução maior e texturas melhores ocupam mais espaço.",
    },
    {
      tipo: "destaque",
      tom: "nota",
      titulo: "Como ler esses números",
      texto:
        "A Steam publica a pesquisa todo mês, a partir de uma amostra de usuários que aceitam participar. Ela não mede vendas, e sim o que está instalado nos computadores de quem joga pela plataforma. Variações de um mês para o outro merecem cautela; o que conta é a tendência ao longo do ano.",
    },

    { tipo: "titulo", nivel: 2, texto: "O que isso muda para quem vai comprar" },
    {
      tipo: "paragrafo",
      texto:
        "Para quem está montando ou atualizando um computador, o dado importa por um motivo prático: os estúdios dimensionam texturas e efeitos olhando para o hardware que os jogadores têm. Com 16 GB tão presentes quanto 8 GB, a tendência é que os ajustes mais altos dos próximos jogos passem a contar com essa memória.",
    },
    {
      tipo: "paragrafo",
      texto:
        "Isso não aposenta as placas de 8 GB. Em Full HD, com jogos competitivos e qualidade média ou alta, elas continuam atendendo bem. O ponto de atenção é para quem joga lançamentos no máximo ou em 1440p: a diferença aparece nos testes, como mostramos na [comparação entre a RTX 5060 Ti de 8 GB e a de 16 GB](/blog/rtx-5060-ti-8gb-ou-16gb).",
    },
    {
      tipo: "paragrafo",
      texto:
        "Antes de trocar de placa, confira também a resolução do seu monitor e a fonte do computador. A memória de vídeo é soldada e não pode ser ampliada depois, então a escolha é feita na compra. Se a dúvida é por onde começar o upgrade, a [assistência técnica](/manutencao) da loja pode avaliar a máquina com você.",
    },
    { tipo: "chamada", tema: "placas-de-video" },
  ],

  fontes: [STEAM, PCGUIDE],
};

export default artigo;
