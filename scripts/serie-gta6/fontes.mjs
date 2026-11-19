/**
 * Fontes consultadas em 19 de novembro de 2026.
 * Fato de GTA 6 só entra na matéria se estiver numa destas páginas.
 */

export function nomeConst(chave) {
  return chave.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^(\d)/, "F_$1").toUpperCase();
}

/** Marca de fonte para tabela e citação. O emissor troca pelo const do arquivo. */
export function f(chave) {
  return { __fonte: nomeConst(chave) };
}

export const FONTES = {
  rockstarData: {
    nome: "Rockstar Games — “Grand Theft Auto VI is Now Set to Launch November 19, 2026”",
    url: "https://www.rockstargames.com/newswire/article/ak3ak31a49a221/grand-theft-auto-vi-is-now-set-to-launch-november-19-2026",
    data: "6 de novembro de 2025",
  },
  rockstarVI: {
    nome: "Rockstar Games — página oficial de Grand Theft Auto VI",
    url: "https://www.rockstargames.com/VI",
    data: "consulta em 19 de novembro de 2026",
  },
  rockstarMidia: {
    nome: "Rockstar Games — mídia oficial de Grand Theft Auto VI",
    url: "https://www.rockstargames.com/VI/launch-trailer",
    data: "consulta em 19 de novembro de 2026",
  },
  takeTwo: {
    nome: "Take-Two Interactive — comunicado de pré-venda de Grand Theft Auto VI",
    url: "https://taketwointeractivesoftwareinc.gcs-web.com/news-releases/news-release-details/rockstar-games-announces-pre-orders-grand-theft-auto-vi/",
    data: "24 de junho de 2026",
  },
  playstation: {
    nome: "PlayStation — página de Grand Theft Auto VI",
    url: "https://www.playstation.com/en-us/games/grand-theft-auto-vi/",
    data: "consulta em 19 de novembro de 2026",
  },
  psSuporte: {
    nome: "PlayStation — suporte de Grand Theft Auto VI",
    url: "https://www.playstation.com/en-us/support/games/gta-vi-support/",
    data: "consulta em 19 de novembro de 2026",
  },
  xbox: {
    nome: "Xbox Wire — Grand Theft Auto VI no Xbox Cloud Gaming",
    url: "https://news.xbox.com/en-us/2026/11/10/grand-theft-auto-6-comes-to-xbox-cloud-gaming-november-19/",
    data: "10 de novembro de 2026",
  },
  vergeAtraso: {
    nome: "The Verge — “Grand Theft Auto VI launch delayed until November 2026”, Jay Peters",
    url: "https://www.theverge.com/news/816005/grand-theft-auto-vi-gta-g-delayed-november-2026",
    data: "6 de novembro de 2025",
  },
  reuters: {
    nome: "Reuters — “Take-Two delays GTA VI for second time to November next year”",
    url: "https://www.reuters.com/business/media-telecom/take-two-interactive-further-delays-gta-vi-november-next-year-2025-11-06/",
    data: "6 de novembro de 2025",
  },
  vergeTamanho: {
    nome: "The Verge — “GTA VI’s download will need up to 212GB of hard drive space”",
    url: "https://www.theverge.com/games/1025271/gta-vi-storage-space-rockstar-games",
    data: "novembro de 2026",
  },
  yahooPc: {
    nome: "Yahoo / Just Jared — “GTA 6 PC Release Date: Is Grand Theft Auto VI Coming to PC?”",
    url: "https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html",
    data: "15 de novembro de 2026",
  },
  polygon: {
    nome: "Polygon — “GTA 6 Sets PC Release Date, New Report Says”",
    url: "https://www.polygon.com/gta-6-pc-release-q1-2027-rumor/",
    data: "2026",
  },
  steam: {
    nome: "Steam — Pesquisa de hardware e software",
    url: "https://store.steampowered.com/hwsurvey/",
    data: "setembro de 2026",
  },
  obs: {
    nome: "OBS Project — OBS Studio",
    url: "https://obsproject.com/",
    data: "consulta em 19 de novembro de 2026",
  },
};
