import type { CategoriaSlug } from "./tipos";

/**
 * A capa desenhada de um artigo que não tem foto.
 *
 * Artigo publicado pela rotina diária chega sem imagem — e foto de banco de
 * imagens, além de custar licença, deixa todo blog com a mesma cara. Aqui cada
 * artigo ganha um desenho próprio, sempre o mesmo para o mesmo endereço, na
 * família das capas feitas à mão: fundo carbono, peças em cinza-azulado e um
 * único acento no Vermelho Balão.
 *
 * O desenho não tem texto (o título fica no cartão, ao lado ou por cima) e
 * concentra o que chama atenção no terço de cima: é a parte que sobra à
 * mostra quando a capa é cortada ou recebe o título por cima.
 */

export const LARGURA_DO_FUNDO = 1200;
export const ALTURA_DO_FUNDO = 800;

const CARBONO = "#090d16";
const PECA = "#17223a";
const TRACO = "#2b3b5a";
const CLARO = "#4a5f85";
const VERMELHO = "#E60012";
const VERMELHO_CLARO = "#ff5964";

export type Motivo = "modulos" | "barras" | "aneis" | "linhas" | "pontos" | "trilhas";

/** Cada categoria sorteia entre três desenhos; assim a lista não fica toda igual. */
const MOTIVOS: Record<CategoriaSlug, Motivo[]> = {
  hardware: ["modulos", "trilhas", "barras"],
  analises: ["barras", "modulos", "linhas"],
  guias: ["pontos", "linhas", "barras"],
  noticias: ["linhas", "pontos", "trilhas"],
  assistencia: ["aneis", "trilhas", "pontos"],
};

function semente(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i += 1) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Sorteio que se repete: a mesma semente dá sempre a mesma sequência. */
function sorteador(inicio: number) {
  let a = inicio >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Sorteio = {
  /** Inteiro de `min` a `max`, com os dois incluídos. */
  entre: (min: number, max: number) => number;
  chance: (p: number) => boolean;
};

function criarSorteio(chave: string): Sorteio {
  const proximo = sorteador(semente(chave));
  return {
    entre: (min, max) => min + Math.floor(proximo() * (max - min + 1)),
    chance: (p) => proximo() < p,
  };
}

const n = (valor: number) => Number(valor.toFixed(1));

function modulos(s: Sorteio): string {
  const colunas = 8;
  const linhas = 10;
  const largura = 118;
  const altura = 62;
  const vao = 14;
  const x0 = (LARGURA_DO_FUNDO - (colunas * largura + (colunas - 1) * vao)) / 2;
  const y0 = 56;

  // O acento: uma ou duas fileiras quase inteiras, ou um bloco.
  const fileira = s.entre(1, 2);
  const fileiras = s.entre(1, 2);
  const de = s.entre(0, 3);
  const ate = s.chance(0.5) ? colunas - 1 : s.entre(de + 2, colunas - 1);

  const pecas: string[] = [];
  for (let l = 0; l < linhas; l += 1) {
    for (let c = 0; c < colunas; c += 1) {
      const x = x0 + c * (largura + vao);
      const y = y0 + l * (altura + vao);
      const acesa = l >= fileira && l < fileira + fileiras && c >= de && c <= ate;
      pecas.push(
        `<rect x="${n(x)}" y="${y}" width="${largura}" height="${altura}" rx="9" fill="${acesa ? VERMELHO : PECA}" stroke="${acesa ? VERMELHO_CLARO : TRACO}" stroke-width="1.5"/>`,
      );
      // Os contatos da peça: duas fileiras de pontos.
      for (let p = 0; p < 6; p += 1) {
        for (let q = 0; q < 2; q += 1) {
          pecas.push(
            `<circle cx="${n(x + 24 + p * 14)}" cy="${y + 24 + q * 14}" r="2" fill="${acesa ? "#ffb3b8" : CLARO}" opacity="${acesa ? 0.9 : 0.55}"/>`,
          );
        }
      }
    }
  }
  return pecas.join("");
}

function barras(s: Sorteio): string {
  const quantas = 16;
  const largura = 40;
  const vao = 24;
  const x0 = (LARGURA_DO_FUNDO - (quantas * largura + (quantas - 1) * vao)) / 2;
  const base = 360;
  const acesa = s.entre(3, quantas - 4);

  const pecas: string[] = [];
  // As linhas de referência do gráfico.
  for (let i = 0; i < 4; i += 1) {
    pecas.push(`<line x1="${n(x0 - 30)}" y1="${base - i * 90}" x2="${n(LARGURA_DO_FUNDO - x0 + 30)}" y2="${base - i * 90}" stroke="${TRACO}" stroke-width="1.5" stroke-dasharray="3 9"/>`);
  }
  let alturaAnterior = s.entre(90, 200);
  for (let i = 0; i < quantas; i += 1) {
    // Cada barra parte da vizinha, para o conjunto ter desenho de curva e não de ruído.
    const altura = Math.max(48, Math.min(290, alturaAnterior + s.entre(-70, 70)));
    alturaAnterior = altura;
    const x = x0 + i * (largura + vao);
    const vermelha = i === acesa;
    pecas.push(
      `<rect x="${n(x)}" y="${base - altura}" width="${largura}" height="${altura}" rx="7" fill="${vermelha ? VERMELHO : PECA}" stroke="${vermelha ? VERMELHO_CLARO : TRACO}" stroke-width="1.5"/>`,
    );
    // O reflexo embaixo da linha de base.
    pecas.push(`<rect x="${n(x)}" y="${base + 16}" width="${largura}" height="${n(altura * 0.9)}" rx="7" fill="${vermelha ? VERMELHO : PECA}" opacity="${vermelha ? 0.16 : 0.5}"/>`);
  }
  pecas.push(`<line x1="${n(x0 - 30)}" y1="${base + 8}" x2="${n(LARGURA_DO_FUNDO - x0 + 30)}" y2="${base + 8}" stroke="${CLARO}" stroke-width="2"/>`);
  return pecas.join("");
}

function aneis(s: Sorteio): string {
  const cx = s.entre(380, 820);
  const cy = s.entre(170, 230);
  const aceso = s.entre(2, 4);
  const pecas: string[] = [];

  for (let i = 1; i <= 13; i += 1) {
    const raio = 34 + i * 52;
    const grosso = i % 3 === 0;
    pecas.push(`<circle cx="${cx}" cy="${cy}" r="${raio}" fill="none" stroke="${grosso ? CLARO : TRACO}" stroke-width="${grosso ? 2.5 : 1.5}" opacity="${grosso ? 0.75 : 1}"/>`);
    if (i === aceso) {
      // Um trecho do anel em vermelho, como a trilha que o cabeçote está lendo.
      const volta = 2 * Math.PI * raio;
      const trecho = volta * (s.entre(18, 34) / 100);
      const giro = s.entre(180, 330);
      pecas.push(
        `<circle cx="${cx}" cy="${cy}" r="${raio}" fill="none" stroke="${VERMELHO}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${n(trecho)} ${n(volta)}" transform="rotate(${giro} ${cx} ${cy})"/>`,
      );
    }
  }
  pecas.push(`<circle cx="${cx}" cy="${cy}" r="34" fill="${PECA}" stroke="${CLARO}" stroke-width="2"/>`);
  pecas.push(`<circle cx="${cx}" cy="${cy}" r="9" fill="${CLARO}"/>`);
  return pecas.join("");
}

function linhas(s: Sorteio): string {
  const x0 = 96;
  const total = LARGURA_DO_FUNDO - 2 * x0;
  const acesa = s.entre(1, 3);
  const pecas: string[] = [];

  for (let i = 0; i < 13; i += 1) {
    const y = 64 + i * 56;
    const comprimento = total * (s.entre(34, 96) / 100);
    const vermelha = i === acesa;
    // O marcador da linha e a linha: lê-se como uma lista ordenada.
    pecas.push(`<rect x="${x0}" y="${y}" width="26" height="26" rx="6" fill="${vermelha ? VERMELHO : PECA}" stroke="${vermelha ? VERMELHO_CLARO : TRACO}" stroke-width="1.5"/>`);
    pecas.push(
      `<rect x="${x0 + 46}" y="${y}" width="${n(comprimento - 46)}" height="26" rx="13" fill="${vermelha ? VERMELHO : PECA}" stroke="${vermelha ? VERMELHO_CLARO : TRACO}" stroke-width="1.5"/>`,
    );
  }
  return pecas.join("");
}

function pontos(s: Sorteio): string {
  const passo = 38;
  const colunas = 30;
  const linhasDePontos = 20;
  const x0 = (LARGURA_DO_FUNDO - (colunas - 1) * passo) / 2;
  const y0 = 50;
  // Uma onda clara atravessa a grade; o acento é um bloco de pontos sobre ela.
  const fase = s.entre(0, 628) / 100;
  const amplitude = s.entre(2, 4);
  const centro = s.entre(4, 6);
  const blocoEm = s.entre(5, colunas - 11);

  const pecas: string[] = [];
  for (let l = 0; l < linhasDePontos; l += 1) {
    for (let c = 0; c < colunas; c += 1) {
      const onda = centro + Math.sin(c / 3.2 + fase) * amplitude;
      const perto = Math.abs(l - onda);
      const noBloco = c >= blocoEm && c < blocoEm + 6 && perto < 1.1;
      const cor = noBloco ? VERMELHO : perto < 1.1 ? CLARO : TRACO;
      const raio = noBloco ? 9 : perto < 1.1 ? 7 : 4.5;
      pecas.push(`<circle cx="${n(x0 + c * passo)}" cy="${y0 + l * passo}" r="${raio}" fill="${cor}"/>`);
    }
  }
  return pecas.join("");
}

function trilhas(s: Sorteio): string {
  const quantas = 15;
  const vao = 68;
  const x0 = (LARGURA_DO_FUNDO - (quantas - 1) * vao) / 2;
  const acesa = s.entre(3, quantas - 4);
  const pecas: string[] = [];

  for (let i = 0; i < quantas; i += 1) {
    const x = x0 + i * vao;
    const desce = s.entre(70, 250);
    const lado = s.chance(0.5) ? 1 : -1;
    const desvio = s.entre(1, 2) * (vao / 2) * lado;
    const depois = s.entre(60, 330);
    const fim = desce + Math.abs(desvio) + depois;
    const vermelha = i === acesa;
    const cor = vermelha ? VERMELHO : i % 4 === 0 ? CLARO : TRACO;
    // A trilha desce, dobra em 45 graus e termina num ponto de solda.
    pecas.push(
      `<path d="M ${n(x)} -10 V ${desce} l ${n(desvio)} ${n(Math.abs(desvio))} v ${depois}" fill="none" stroke="${cor}" stroke-width="${vermelha ? 7 : 3.5}" stroke-linecap="round" stroke-linejoin="round"/>`,
    );
    pecas.push(`<circle cx="${n(x + desvio)}" cy="${n(fim)}" r="${vermelha ? 14 : 10}" fill="${CARBONO}" stroke="${cor}" stroke-width="${vermelha ? 7 : 3.5}"/>`);
  }
  return pecas.join("");
}

const DESENHOS: Record<Motivo, (s: Sorteio) => string> = { modulos, barras, aneis, linhas, pontos, trilhas };

export function motivoDoFundo(chave: string, categoria: CategoriaSlug): Motivo {
  const opcoes = MOTIVOS[categoria] ?? MOTIVOS.guias;
  return opcoes[semente(`${chave}:motivo`) % opcoes.length];
}

/** O desenho completo, em SVG. */
export function desenharFundo(chave: string, categoria: CategoriaSlug): string {
  const motivo = motivoDoFundo(chave, categoria);
  const desenho = DESENHOS[motivo](criarSorteio(chave));

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGURA_DO_FUNDO}" height="${ALTURA_DO_FUNDO}" viewBox="0 0 ${LARGURA_DO_FUNDO} ${ALTURA_DO_FUNDO}">`,
    "<defs>",
    `<radialGradient id="brilho" cx="50%" cy="0%" r="75%"><stop offset="0" stop-color="${VERMELHO}" stop-opacity="0.2"/><stop offset="0.55" stop-color="${VERMELHO}" stop-opacity="0"/></radialGradient>`,
    // Some de cima para baixo: o terço de cima fica vivo, o resto vira textura.
    `<linearGradient id="some" x1="0" y1="0" x2="0" y2="1"><stop offset="0.3" stop-color="${CARBONO}" stop-opacity="0"/><stop offset="0.6" stop-color="${CARBONO}" stop-opacity="0.75"/><stop offset="1" stop-color="${CARBONO}" stop-opacity="0.92"/></linearGradient>`,
    "</defs>",
    `<rect width="${LARGURA_DO_FUNDO}" height="${ALTURA_DO_FUNDO}" fill="${CARBONO}"/>`,
    `<rect width="${LARGURA_DO_FUNDO}" height="${ALTURA_DO_FUNDO}" fill="url(#brilho)"/>`,
    desenho,
    `<rect width="${LARGURA_DO_FUNDO}" height="${ALTURA_DO_FUNDO}" fill="url(#some)"/>`,
    "</svg>",
  ].join("");
}
