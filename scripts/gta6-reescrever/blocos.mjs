/** Atalhos dos blocos tipados do blog. O emissor grava o .ts. */

export const F = {
  rockstarVi: {
    nome: "Rockstar Games — página oficial de Grand Theft Auto VI",
    url: "https://www.rockstargames.com/VI",
    data: "consulta em 19 de novembro de 2026",
  },
  rockstarData: {
    nome: "Rockstar Games — “Grand Theft Auto VI is Now Set to Launch November 19, 2026”",
    url: "https://www.rockstargames.com/newswire/article/ak3ak31a49a221/grand-theft-auto-vi-is-now-set-to-launch-november-19-2026",
    data: "6 de novembro de 2025",
  },
  rockstarMidia: {
    nome: "Rockstar Games — mídia oficial de Grand Theft Auto VI",
    url: "https://www.rockstargames.com/VI/media",
    data: "consulta em 19 de novembro de 2026",
  },
  rockstarPreload: {
    nome: "Rockstar Games — “Grand Theft Auto VI: Pre-Load Now”",
    url: "https://www.rockstargames.com/VI/pre-load-now",
    data: "10 de novembro de 2026",
  },
  rockstarTrailer: {
    nome: "Rockstar Games — Launch Trailer e a lista dos vídeos oficiais",
    url: "https://www.rockstargames.com/VI/launch-trailer",
    data: "15 de outubro de 2026",
  },
  rockstarSinopse: {
    nome: "Rockstar Games — sinopse oficial de Grand Theft Auto VI",
    url: "https://www.rockstargames.com/VI",
    data: "consulta em 19 de novembro de 2026",
  },
  takeTwo: {
    nome: "Take-Two — “Rockstar Games Announces Pre-Orders for Grand Theft Auto VI”",
    url: "https://taketwointeractivesoftwareinc.gcs-web.com/news-releases/news-release-details/rockstar-games-announces-pre-orders-grand-theft-auto-vi",
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
  verge: {
    nome: "The Verge — “GTA VI’s download will need up to 212GB of hard drive space”",
    url: "https://www.theverge.com/games/1025271/gta-vi-storage-space-rockstar-games",
    data: "novembro de 2026",
  },
  vergeAdiamento: {
    nome: "The Verge — cobertura do adiamento para novembro de 2026",
    url: "https://www.theverge.com/news/816005/grand-theft-auto-vi-gta-g-delayed-november-2026",
    data: "6 de novembro de 2025",
  },
  reuters: {
    nome: "Reuters — Take-Two adia GTA VI para novembro do ano seguinte",
    url: "https://www.reuters.com/business/media-telecom/take-two-interactive-further-delays-gta-vi-november-next-year-2025-11-06/",
    data: "6 de novembro de 2025",
  },
  yahooPc: {
    nome: "Yahoo / Just Jared — “GTA 6 PC Release Date: Is Grand Theft Auto VI Coming to PC?”",
    url: "https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html",
    data: "15 de novembro de 2026",
  },
  gtavPc: {
    nome: "Rockstar Games — “Grand Theft Auto V Is Now Available for PC”",
    url: "https://www.rockstargames.com/newswire/article/25o2411812a31k/grand-theft-auto-v-is-now-available-for-pc",
    data: "14 de abril de 2015",
  },
  rdr2Pc: {
    nome: "Rockstar Games — “Red Dead Redemption 2 Coming to PC November 5th”",
    url: "https://www.rockstargames.com/newswire/article/9k1248838o2974/Red-Dead-Redemption-2-Coming-to-PC-November-5th",
    data: "4 de outubro de 2019",
  },
  wikiGtav: {
    nome: "Wikipedia — Grand Theft Auto V (datas de lançamento)",
    url: "https://en.wikipedia.org/wiki/Grand_Theft_Auto_V",
    data: "consulta em 19 de novembro de 2026",
  },
  wikiRdr2: {
    nome: "Wikipedia — Red Dead Redemption 2 (datas de lançamento)",
    url: "https://en.wikipedia.org/wiki/Red_Dead_Redemption_2",
    data: "consulta em 19 de novembro de 2026",
  },
  obs: {
    nome: "OBS Studio — guia de início rápido",
    url: "https://obsproject.com/kb/quick-start-guide",
    data: "consulta em 19 de novembro de 2026",
  },
  obsNvenc: {
    nome: "OBS Studio — guia de NVENC",
    url: "https://obsproject.com/kb/nvenc-performance-guide",
    data: "consulta em 19 de novembro de 2026",
  },
  twitch: {
    nome: "Twitch — Central de Criadores",
    url: "https://help.twitch.tv/s/article/creator-dashboard",
    data: "consulta em 19 de novembro de 2026",
  },
  youtube: {
    nome: "Ajuda do YouTube — transmitir ao vivo",
    url: "https://support.google.com/youtube/answer/2474026",
    data: "consulta em 19 de novembro de 2026",
  },
  nvidia: {
    nome: "NVIDIA — família GeForce RTX 5060",
    url: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/",
    data: "consulta em 19 de novembro de 2026",
  },
  steam: {
    nome: "Steam — pesquisa de hardware e software",
    url: "https://store.steampowered.com/hwsurvey/",
    data: "consulta em 19 de novembro de 2026",
  },
};

export const p = (texto) => ({ tipo: "paragrafo", texto });
export const h2 = (texto) => ({ tipo: "titulo", nivel: 2, texto });
export const h3 = (texto) => ({ tipo: "titulo", nivel: 3, texto });
export const ul = (itens) => ({ tipo: "lista", itens });
export const ol = (itens) => ({ tipo: "lista", ordenada: true, itens });
export const rapida = (itens) => ({ tipo: "resumo", titulo: "Resposta rápida", itens });
export const img = (legenda, alt) => ({ tipo: "imagem", legenda, alt });
export const nota = (tom, titulo, texto) => ({ tipo: "destaque", tom, titulo, texto });
export const pros = (titulo, prosItens, contras) => ({ tipo: "pros-contras", titulo, pros: prosItens, contras });
export const chamada = (campos) => ({ tipo: "chamada", ...campos });

export function tabela({ titulo, colunas, linhas, fonte, nota: notaTabela, colunaDestaque }) {
  return {
    tipo: "tabela",
    titulo,
    colunas,
    linhas,
    ...(fonte ? { fonte: F[fonte] } : {}),
    ...(notaTabela ? { nota: notaTabela } : {}),
    ...(colunaDestaque != null ? { colunaDestaque } : {}),
  };
}

export function citacao({ texto, autor, cargo, fonte, traduzida = true }) {
  return { tipo: "citacao", texto, autor, cargo, fonte: F[fonte], traduzida };
}

export function fontes(...chaves) {
  return chaves.map((c) => F[c]);
}
