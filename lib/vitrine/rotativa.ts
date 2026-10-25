// ============================================================
// Vitrine rotativa (pedido do Thiago em 25/10, à noite).
//
// "Deixa a vitrine rotativa e todo dia ela muda sozinha os computadores."
// Todo dia (virada do dia no horário de Brasília) a /vitrine escolhe cinco
// PCs completos DIFERENTES do catálogo, entre R$ 5.000 e R$ 10.000 no Pix.
// Regras (puras, testadas em __tests__/lib/vitrine-rotativa.test.ts):
//   - só PC Gamer Completo com placa de vídeo dedicada (RTX, GTX 16xx,
//     RX 6000/7000/9000, Arc) e monitor no conjunto — nada de vídeo integrado;
//   - um por faixa de preço (5–6, 6–7, 7–8, 8–9, 9–10 mil), para a vitrine
//     ir da entrada ao topo; faixa vazia é completada pelas outras;
//   - "Pronta entrega" tem preferência dentro da faixa;
//   - sem dois setups com o mesmo processador + placa de vídeo;
//   - a escolha é sorteada com a data como semente: o mesmo dia dá sempre o
//     mesmo resultado (todo mundo vê a mesma vitrine), o dia seguinte muda.
// O título e a frase de cada setup são montados só com o que está no nome do
// produto (processador, placa, monitor, Hz, SSD, kit) — nada inventado.
// ============================================================

import type { Product } from "@/lib/utils";
import { parsePriceToNumber } from "@/lib/utils";
import { extractParts } from "./core";
import type { SetupAssinado } from "./assinadas";

export const CAMINHO_PC_GAMER_COMPLETO = "Computadores/PC/PC Gamer/PC Gamer Completo";
export const QUANTOS_POR_DIA = 5;
export const FAIXAS: [number, number][] = [
  [5000, 6000],
  [6000, 7000],
  [7000, 8000],
  [8000, 9000],
  [9000, 10000],
];

const sem = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Placa de vídeo dedicada e atual, pelo nome do produto. */
export function placaDedicada(nome: string): string | null {
  const t = sem(nome);
  const m =
    t.match(/\brtx\s?-?(\d{4})(\s?ti|\s?super)?\b/) ||
    t.match(/\bgtx\s?(16\d0)(\s?ti|\s?super)?\b/) ||
    t.match(/\brx\s?([679]\d{3})(\s?xt)?\b/) ||
    t.match(/\barc\s?([ab]\d{3})\b/);
  if (!m) return null;
  const marca = m[0].replace(/\d.*$/, "").trim().toUpperCase().replace("-", "");
  return `${marca} ${m[1]}${m[2] ? ` ${m[2].trim().toUpperCase()}` : ""}`.replace(/\s+/g, " ");
}

/**
 * A placa aguenta "os jogos atuais em Full HD"? (RTX 2060 para cima,
 * RX 6600 para cima, Arc A750/A770/B5xx.) RX 6400/6500 e GTX 16xx ficam fora.
 */
export function placaBoa(placa: string | null): boolean {
  if (!placa) return false;
  const m = placa.match(/^(RTX|GTX|RX|ARC) ([AB]?)(\d{3,4})/);
  if (!m) return false;
  const n = Number(m[3]);
  if (m[1] === "RTX") return n >= 2060;
  if (m[1] === "RX") return n >= 6600;
  if (m[1] === "ARC") return (m[2] === "A" && n >= 750) || m[2] === "B";
  return false;
}

/**
 * Processador recente o bastante para a faixa de preço: Intel de 9ª geração
 * para cima (ou Core Ultra), Ryzen série 3000 para cima. Se o nome não disser
 * o processador, não barra.
 */
export function processadorAtual(nome: string): boolean {
  const t = sem(nome);
  const geracao = t.match(/\b(\d{1,2})\s?(?:a|ª|º|°)?\s?(?:geracao|ger\b)/) || t.match(/\bi[3579]\s?(\d{1,2})\s?(?:a|ª|º|°)(?=\s|$|,)/);
  const intel = t.match(/\bi[3579][\s-]?(\d{4,5})[a-z]{0,2}\b/);
  if (intel) {
    const d = intel[1];
    return (d.length === 5 ? Number(d.slice(0, 2)) : Number(d[0])) >= 9;
  }
  if (geracao) return Number(geracao[1]) >= 9;
  if (/\bultra\s?[579]\b/.test(t)) return true;
  const ryzen = t.match(/\bryzen\s?[3579]\s?(\d)\d{3}/);
  if (ryzen) return Number(ryzen[1]) >= 3;
  return true;
}

export function temMonitor(nome: string): boolean {
  return /\bmonitor\b|\btela\s?\d{2}/.test(sem(nome));
}

export function ehProntaEntrega(p: Product): boolean {
  return sem(String(p.availability || "")).includes("pronta");
}

/** Dia no horário de Brasília, "2026-10-25". */
export function diaDeHoje(agora = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(agora);
}

// Sorteio com semente (mulberry32 sobre o hash do dia).
function semente(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619);
  return h >>> 0;
}
function sorteador(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function embaralhar<T>(itens: T[], aleatorio: () => number): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export interface Candidato {
  produto: Product;
  preco: number;
  placa: string;
  chave: string;
}

export function candidatos(produtos: Product[]): Candidato[] {
  const saida: Candidato[] = [];
  for (const p of produtos) {
    const preco = parsePriceToNumber(p.price);
    if (!(preco >= FAIXAS[0][0] && preco <= FAIXAS[FAIXAS.length - 1][1])) continue;
    const nome = String(p.name || "");
    const placa = placaDedicada(nome);
    if (!placaBoa(placa) || !placa || !processadorAtual(nome) || !temMonitor(nome) || !p.image) continue;
    const cpu = sem(extractParts(nome).processador || "?");
    saida.push({ produto: p, preco, placa, chave: `${cpu}|${placa.toLowerCase()}` });
  }
  return saida;
}

/**
 * Ordem de preferência do dia: primeiro um de cada faixa de preço (pronta
 * entrega antes), depois todo o resto, sem repetir processador + placa.
 * Quem monta a vitrine confere cada um no catálogo e vai descendo a lista.
 */
export function rankingDoDia(produtos: Product[], dia: string): Product[] {
  const aleatorio = sorteador(semente(`vitrine:${dia}`));
  const todos = embaralhar(candidatos(produtos), aleatorio);
  todos.sort((a, b) => Number(ehProntaEntrega(b.produto)) - Number(ehProntaEntrega(a.produto)));

  const primeiro: Candidato[] = [];
  const usados = new Set<Candidato>();
  const chaves = new Set<string>();
  for (const [min, max] of FAIXAS) {
    const c = todos.find((x) => x.preco >= min && x.preco < max + (max === 10000 ? 0.01 : 0) && !chaves.has(x.chave));
    if (c) {
      primeiro.push(c);
      usados.add(c);
      chaves.add(c.chave);
    }
  }
  const resto = todos.filter((c) => !usados.has(c));
  return [...primeiro, ...resto].map((c) => c.produto);
}

/** Os cinco PCs do dia, do mais barato para o mais caro (sem conferir no catálogo). */
export function escolherDoDia(produtos: Product[], dia: string, quantos = QUANTOS_POR_DIA): Product[] {
  const escolhidos: Product[] = [];
  const chaves = new Set<string>();
  for (const p of rankingDoDia(produtos, dia)) {
    if (escolhidos.length >= quantos) break;
    const chave = candidatos([p])[0]?.chave;
    if (!chave || chaves.has(chave)) continue;
    chaves.add(chave);
    escolhidos.push(p);
  }
  return escolhidos.sort((a, b) => parsePriceToNumber(a.price) - parsePriceToNumber(b.price));
}

// ---------- título e frase, só com o que está no nome ----------

function hertz(nome: string): number | null {
  const m = sem(nome).match(/(\d{2,3})\s?hz\b/);
  return m ? Number(m[1]) : null;
}
function polegadas(nome: string): string | null {
  const m = nome.match(/(\d{2}(?:[.,]\d)?)\s?(?:"|”|''|polegadas|pol\b)/i);
  return m ? m[1].replace(".", ",") : null;
}
/** "Ryzen 5 5600G", "Core i5 12400F", "Core i9 11ª geração". */
export function cpuCurta(nome: string): string {
  const t = sem(nome);
  const ryzen = t.match(/\bryzen\s?([3579])\s?(\d{4}[a-z]{0,2})\b/);
  if (ryzen) return `Ryzen ${ryzen[1]} ${ryzen[2].toUpperCase()}`;
  const intel = t.match(/\b(?:core\s?)?i([3579])[\s-]?(\d{4,5})([a-z]{0,2})\b/);
  if (intel) return `Core i${intel[1]} ${intel[2]}${intel[3].toUpperCase()}`;
  const ultra = t.match(/\bultra\s?([579])\s?(\d{3}[a-z]?)\b/);
  if (ultra) return `Core Ultra ${ultra[1]} ${ultra[2].toUpperCase()}`;
  const geracao = t.match(/\bi([3579])\s?(\d{1,2})\s?(?:a|ª|º|°)/);
  if (geracao) return `Core i${geracao[1]} ${geracao[2]}ª geração`;
  return "";
}

export function setupDoProduto(p: Product, dia: string, identificador = String(p.id)): SetupAssinado {
  const nome = String(p.name || "");
  const t = sem(nome);
  const placa = placaDedicada(nome) || "placa de vídeo dedicada";
  const cpu = cpuCurta(nome);
  const hz = hertz(nome);
  const pol = polegadas(nome);
  const branco = /\bbranc[oa]\b/.test(t);
  const plataformaNova = /\bam5\b|\bddr5\b|\bb650\b|\bb760\b|\bz790\b/.test(t);
  const kit = /\bkit\b|\bcombo\b|teclado|mouse|headset/.test(t);
  const ssd1tb = /\b(1|2)\s?tb\b/.test(t);
  // "RTX 3060 12gb", "Rx 6600 8GB": a memória que vem logo depois do modelo da placa.
  const vram = t.match(/\b(?:rtx|gtx|rx|arc)\s?-?[a-z]?\d{3,4}(?:\s?(?:ti|xt|super))?\s?(8|10|12|16)\s?gb\b/);

  let rotulo = "Full HD";
  if (hz && hz >= 144) rotulo = `Competitivo ${hz} Hz`;
  else if (plataformaNova) rotulo = "Plataforma nova";
  else if (branco) rotulo = "Branco";
  else if (pol && Number(pol.replace(",", ".")) >= 27) rotulo = `${pol}"`;

  const frases: string[] = [];
  frases.push(
    `${cpu ? `${cpu} com ` : ""}${placa}${vram ? ` de ${vram[1]} GB` : ""}: placa de vídeo dedicada para rodar os jogos atuais em Full HD.`
  );
  if (pol || hz) {
    frases.push(`Vem com monitor${pol ? ` de ${pol} polegadas` : ""}${hz ? ` e ${hz} Hz` : ""}${hz && hz >= 144 ? ", ideal para jogos competitivos" : ""}.`);
  } else {
    frases.push("Vem com monitor, pronto para ligar e jogar.");
  }
  const extras: string[] = [];
  if (ssd1tb) extras.push("SSD de 1 TB para a biblioteca de jogos");
  if (kit) extras.push("kit gamer junto");
  if (plataformaNova) extras.push("plataforma atual, que aceita upgrade depois");
  if (branco) extras.push("visual todo branco");
  if (extras.length) frases.push(`${extras[0].charAt(0).toUpperCase()}${extras[0].slice(1)}${extras.slice(1).map((e) => `, ${e}`).join("")}.`);

  const aplicacoes = [hz && hz >= 144 ? "Jogos competitivos" : "Jogos em Full HD", "Estudos", "Navegação"];

  return {
    slug: `setup-${identificador}`,
    titulo: `Setup ${rotulo} · ${cpu ? `${cpu} + ` : ""}${placa}`,
    categoria: "PC Gamer",
    produto: identificador,
    chamada: frases.join(" "),
    aplicacoes,
    publicado_em: `${dia}T03:00:00.000Z`,
  };
}
