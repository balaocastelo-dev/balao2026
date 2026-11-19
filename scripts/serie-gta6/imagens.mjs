/**
 * Ilustrações originais da série GTA 6.
 *
 * Nada aqui é arte, print ou logo da Rockstar. É gráfico nosso, nas cores do
 * blog, desenhado em SVG e gravado em WebP. Cada arquivo leva dados da própria
 * matéria — por isso uma capa não serve em outra.
 */
import sharp from "sharp";

const LARGURA_CAPA = 1536;
const ALTURA_CAPA = 1024;
const LARGURA_CORPO = 1600;
const ALTURA_CORPO = 900;

const FUNDO = "#090d16";
const CARTAO = "#17223a";
const TRACO = "#2b3b5a";
const CLARO = "#9aabc4";
const TEXTO = "#f4f6fb";
const VERMELHO = "#E60012";

function escapar(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function quebrar(texto, maximo) {
  const palavras = String(texto || "").split(/\s+/).filter(Boolean);
  const linhas = [];
  let atual = "";
  for (const palavra of palavras) {
    const teste = atual ? `${atual} ${palavra}` : palavra;
    if (teste.length > maximo && atual) {
      linhas.push(atual);
      atual = palavra;
    } else {
      atual = teste;
    }
  }
  if (atual) linhas.push(atual);
  return linhas.length ? linhas : [""];
}

function texto(x, y, conteudo, { tamanho = 28, peso = 600, cor = TEXTO, ancora = "start" } = {}) {
  return `<text x="${x}" y="${y}" fill="${cor}" font-family="Inter, sans-serif" font-size="${tamanho}" font-weight="${peso}" text-anchor="${ancora}">${escapar(conteudo)}</text>`;
}

function linhas(x, y, conteudo, maximo, opcoes, passo) {
  return quebrar(conteudo, maximo)
    .map((linha, i) => texto(x, y + i * (passo || opcoes.tamanho * 1.25), linha, opcoes))
    .join("");
}

function semente(chave) {
  let h = 2166136261;
  for (let i = 0; i < chave.length; i += 1) {
    h ^= chave.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function motivo(chave) {
  const n = semente(chave);
  const pecas = [];
  const tipo = n % 5;
  if (tipo === 0) {
    for (let i = 0; i < 8; i += 1) {
      const y = 80 + i * 70;
      const w = 180 + ((n >> (i % 12)) & 255);
      pecas.push(`<rect x="${980}" y="${y}" width="${Math.min(w, 420)}" height="28" rx="6" fill="${i === 2 ? VERMELHO : CARTAO}"/>`);
    }
  } else if (tipo === 1) {
    for (let i = 0; i < 5; i += 1) {
      const r = 70 + i * 48;
      pecas.push(`<circle cx="1240" cy="340" r="${r}" fill="none" stroke="${i === 1 ? VERMELHO : TRACO}" stroke-width="${i === 1 ? 10 : 4}"/>`);
    }
  } else if (tipo === 2) {
    for (let c = 0; c < 6; c += 1) {
      for (let l = 0; l < 5; l += 1) {
        const aceso = (n >> (c + l)) & 1;
        pecas.push(`<rect x="${1000 + c * 78}" y="${90 + l * 90}" width="58" height="58" rx="10" fill="${aceso ? VERMELHO : CARTAO}"/>`);
      }
    }
  } else if (tipo === 3) {
    pecas.push(`<path d="M980 80 H1460 V280 H1120 V480 H1460 V760" fill="none" stroke="${TRACO}" stroke-width="8"/>`);
    pecas.push(`<circle cx="980" cy="80" r="14" fill="${VERMELHO}"/>`);
    pecas.push(`<circle cx="1460" cy="760" r="14" fill="${VERMELHO}"/>`);
  } else {
    for (let i = 0; i < 14; i += 1) {
      pecas.push(`<line x1="${1000 + i * 28}" y1="40" x2="${1180 + i * 28}" y2="620" stroke="${i % 4 === 0 ? VERMELHO : TRACO}" stroke-width="3"/>`);
    }
  }
  return pecas.join("");
}

function base(largura, altura, miolo) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}" viewBox="0 0 ${largura} ${altura}">
  <rect width="${largura}" height="${altura}" fill="${FUNDO}"/>
  <rect width="${largura}" height="12" fill="${VERMELHO}"/>
  ${miolo}
</svg>`;
}

function capa(spec, slug) {
  const titulo = quebrar(spec.titulo, 22).slice(0, 4);
  const tituloSvg = titulo
    .map((linha, i) => texto(72, 250 + i * 78, linha, { tamanho: 64, peso: 700 }))
    .join("");
  const apoio = spec.apoio ? linhas(72, 250 + titulo.length * 78 + 16, spec.apoio, 42, { tamanho: 26, peso: 500, cor: CLARO }, 36) : "";
  const selo = spec.selo
    ? `<rect x="1040" y="160" width="420" height="230" rx="18" fill="${CARTAO}"/>
       ${texto(1250, 250, spec.selo, { tamanho: 26, peso: 600, cor: CLARO, ancora: "middle" })}
       ${texto(1250, 330, spec.numero || "", { tamanho: 48, peso: 700, cor: TEXTO, ancora: "middle" })}`
    : "";
  return base(
    LARGURA_CAPA,
    ALTURA_CAPA,
    `${motivo(`${slug}:${spec.kicker || "capa"}`)}
     ${texto(72, 140, spec.kicker || "Série GTA 6", { tamanho: 26, peso: 700, cor: VERMELHO })}
     ${tituloSvg}
     ${apoio}
     ${selo}
     ${texto(72, 960, "Balão da Informática Anchieta", { tamanho: 24, peso: 600, cor: CLARO })}`,
  );
}

function tituloDoCorpo(spec) {
  return `${texto(64, 78, spec.kicker || "Série GTA 6", { tamanho: 20, peso: 700, cor: VERMELHO })}
    ${linhas(64, 128, spec.titulo, 42, { tamanho: 36, peso: 700 }, 46)}`;
}

function rodape(nota) {
  return `${texto(64, 850, nota || "Ilustração original da Balão da Informática Anchieta. Não é arte oficial.", {
    tamanho: 18,
    peso: 500,
    cor: CLARO,
  })}`;
}

function timeline(spec) {
  const itens = spec.itens.slice(0, 6);
  const passo = Math.min(210, Math.floor(1400 / itens.length));
  const blocos = itens
    .map((item, i) => {
      const x = 80 + i * passo;
      return `<line x1="${x}" y1="430" x2="${x + passo - 24}" y2="430" stroke="${TRACO}" stroke-width="6"/>
        <circle cx="${x}" cy="430" r="16" fill="${i === itens.length - 1 ? VERMELHO : CARTAO}" stroke="${VERMELHO}" stroke-width="4"/>
        ${linhas(x, 300, item.quando, 16, { tamanho: 22, peso: 700, cor: VERMELHO }, 28)}
        ${linhas(x, 490, item.texto, 18, { tamanho: 20, peso: 500, cor: TEXTO }, 28)}`;
    })
    .join("");
  return base(LARGURA_CORPO, ALTURA_CORPO, `${tituloDoCorpo(spec)}${blocos}${rodape(spec.nota)}`);
}

function colunas(spec) {
  const cols = spec.colunas.slice(0, 3);
  const largura = cols.length === 2 ? 700 : 460;
  const blocos = cols
    .map((col, i) => {
      const x = 64 + i * (largura + 28);
      const itens = col.itens
        .slice(0, 6)
        .map((item, j) => linhas(x + 28, 340 + j * 72, item, cols.length === 2 ? 36 : 26, { tamanho: 22, peso: 500 }, 28))
        .join("");
      const destaque = spec.destaque === i;
      return `<rect x="${x}" y="230" width="${largura}" height="560" rx="18" fill="${CARTAO}" stroke="${destaque ? VERMELHO : TRACO}" stroke-width="${destaque ? 4 : 2}"/>
        ${texto(x + 28, 290, col.titulo, { tamanho: 26, peso: 700, cor: destaque ? VERMELHO : TEXTO })}
        ${itens}`;
    })
    .join("");
  return base(LARGURA_CORPO, ALTURA_CORPO, `${tituloDoCorpo(spec)}${blocos}${rodape(spec.nota)}`);
}

function barras(spec) {
  const itens = spec.itens.slice(0, 6);
  const maximo = Math.max(...itens.map((i) => i.valor), 1);
  const blocos = itens
    .map((item, i) => {
      const y = 240 + i * 96;
      const w = Math.max(12, Math.round((item.valor / maximo) * 860));
      return `${texto(64, y + 28, item.nome, { tamanho: 24, peso: 600 })}
        <rect x="520" y="${y}" width="${w}" height="42" rx="8" fill="${item.destaque ? VERMELHO : "#31466f"}"/>
        ${texto(520 + w + 16, y + 30, item.rotulo || String(item.valor), { tamanho: 22, peso: 700 })}`;
    })
    .join("");
  return base(LARGURA_CORPO, ALTURA_CORPO, `${tituloDoCorpo(spec)}${blocos}${rodape(spec.nota)}`);
}

function camadas(spec) {
  const itens = spec.itens.slice(0, 6);
  const blocos = itens
    .map((item, i) => {
      const y = 230 + i * 100;
      return `<rect x="64" y="${y}" width="1470" height="84" rx="14" fill="${CARTAO}"/>
        <rect x="64" y="${y}" width="10" height="84" fill="${VERMELHO}"/>
        ${texto(100, y + 36, item.nome, { tamanho: 24, peso: 700 })}
        ${texto(420, y + 36, item.texto, { tamanho: 22, peso: 500, cor: CLARO })}`;
    })
    .join("");
  return base(LARGURA_CORPO, ALTURA_CORPO, `${tituloDoCorpo(spec)}${blocos}${rodape(spec.nota)}`);
}

function fluxo(spec) {
  const passos = spec.passos.slice(0, 4);
  const largura = 320;
  const blocos = passos
    .map((passo, i) => {
      const x = 64 + i * 380;
      return `<rect x="${x}" y="340" width="${largura}" height="220" rx="18" fill="${CARTAO}" stroke="${i === passos.length - 1 ? VERMELHO : TRACO}" stroke-width="3"/>
        ${texto(x + 24, 400, String(i + 1).padStart(2, "0"), { tamanho: 22, peso: 700, cor: VERMELHO })}
        ${linhas(x + 24, 460, passo, 22, { tamanho: 24, peso: 600 }, 34)}
        ${i < passos.length - 1 ? `<path d="M ${x + largura + 8} 450 H ${x + 360}" stroke="${VERMELHO}" stroke-width="4"/>` : ""}`;
    })
    .join("");
  return base(LARGURA_CORPO, ALTURA_CORPO, `${tituloDoCorpo(spec)}${blocos}${rodape(spec.nota)}`);
}

function cartoes(spec) {
  const itens = spec.itens.slice(0, 6);
  const cols = itens.length > 3 ? 3 : itens.length;
  const largura = cols === 2 ? 700 : 460;
  const blocos = itens
    .map((item, i) => {
      const col = i % cols;
      const lin = Math.floor(i / cols);
      const x = 64 + col * (largura + 28);
      const y = 230 + lin * 280;
      return `<rect x="${x}" y="${y}" width="${largura}" height="250" rx="18" fill="${CARTAO}"/>
        ${texto(x + 28, y + 64, item.titulo, { tamanho: 26, peso: 700 })}
        ${linhas(x + 28, y + 120, item.texto, cols === 2 ? 38 : 26, { tamanho: 22, peso: 500, cor: CLARO }, 32)}`;
    })
    .join("");
  return base(LARGURA_CORPO, ALTURA_CORPO, `${tituloDoCorpo(spec)}${blocos}${rodape(spec.nota)}`);
}

function setup(spec) {
  const pontos = [
    { x: 180, y: 280, w: 520, h: 280, ...spec.pecas[0] },
    { x: 760, y: 240, w: 280, h: 180, ...spec.pecas[1] },
    { x: 1100, y: 240, w: 360, h: 180, ...spec.pecas[2] },
    { x: 760, y: 480, w: 700, h: 220, ...spec.pecas[3] },
  ];
  const blocos = pontos
    .map(
      (p) => `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="18" fill="${CARTAO}" stroke="${TRACO}" stroke-width="3"/>
        ${texto(p.x + 24, p.y + 54, p.nome, { tamanho: 24, peso: 700 })}
        ${linhas(p.x + 24, p.y + 100, p.texto, Math.floor(p.w / 14), { tamanho: 20, peso: 500, cor: CLARO }, 28)}`,
    )
    .join("");
  return base(LARGURA_CORPO, ALTURA_CORPO, `${tituloDoCorpo(spec)}${blocos}${rodape(spec.nota)}`);
}

const DESENHOS = { capa, timeline, colunas, barras, camadas, fluxo, cartoes, setup };

export function svgDaImagem(spec, slug) {
  const desenhar = DESENHOS[spec.layout];
  if (!desenhar) throw new Error(`Layout de imagem desconhecido: ${spec.layout}`);
  return desenhar(spec, slug);
}

export async function gravarWebp(spec, slug, destino) {
  const svg = svgDaImagem(spec, slug);
  const largura = spec.layout === "capa" ? LARGURA_CAPA : LARGURA_CORPO;
  const altura = spec.layout === "capa" ? ALTURA_CAPA : ALTURA_CORPO;
  await sharp(Buffer.from(svg)).resize(largura, altura).webp({ quality: 82 }).toFile(destino);
  return { largura, altura };
}
