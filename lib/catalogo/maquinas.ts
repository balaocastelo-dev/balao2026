// ============================================================
// Geração do processador e placa de vídeo de cada computador, para os filtros
// da parte de computadores (pedido do Thiago em 18/10/2026).
//
// Tudo sai do título, pela mesma leitura da ficha (`lerFicha`) que a página
// Premium e a /pcgamer já usam. Na dúvida, o computador fica fora da opção:
// um "Intel Core i5" sem modelo não entra em "12ª geração", e um "Placa de
// vídeo 4GB" sem modelo não entra em "GeForce GTX 1650".
// ============================================================

import { lerFicha, type FichaDaMaquina } from "@/lib/catalogo/ficha";
import { lerPc } from "@/lib/catalogo/pc-gamer";
import type { Product } from "@/lib/utils";

export interface OpcaoDeMaquina {
  /** Vai na URL: "intel-12", "ryzen-5000", "rtx-4060", "integrado". */
  chave: string;
  rotulo: string;
  /** Quanto maior, mais para cima na lista (mais nova / mais forte). */
  peso: number;
  grupo: "Intel" | "AMD" | "Apple" | "NVIDIA" | "Integrado";
}

/** Só PC, PC gamer, mini PC, desktop, workstation, iMac e notebook. Monitor não. */
const CATEGORIA_DE_COMPUTADOR = /^computadores\/(pc|notebooks)(\/|$)|^automacao comercial\/pdv e all in one/;

const semAcento = (s: unknown) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .trim();

export function ehComputador(produto: Pick<Product, "category">): boolean {
  return CATEGORIA_DE_COMPUTADOR.test(semAcento(produto.category));
}

/** A página mostra os blocos de geração e placa? Só na parte de computadores. */
export function caminhoDeComputadores(caminho: string): boolean {
  const c = semAcento(caminho);
  return c === "computadores" || /^computadores\/(pc|notebooks)(\/|$)/.test(c);
}

// ---------- geração ----------

export function geracaoDoProcessador(processador: string | null): OpcaoDeMaquina | null {
  if (!processador) return null;

  const apple = processador.match(/^Apple M([1-5])\b/);
  if (apple) return { chave: `apple-m${apple[1]}`, rotulo: `Apple M${apple[1]}`, peso: 300 + Number(apple[1]), grupo: "Apple" };

  const ryzenAi = processador.match(/^AMD Ryzen AI [3579] (\d)\d{2}$/);
  if (ryzenAi) {
    const serie = Number(ryzenAi[1]) * 100;
    return { chave: `ryzen-ai-${serie}`, rotulo: `AMD Ryzen AI ${serie}`, peso: 200 + 95, grupo: "AMD" };
  }
  const ryzen = processador.match(/^AMD Ryzen (?:[3579] )?(\d)(\d{2,3})[A-Z0-9]*$/);
  if (ryzen) {
    const tresDigitos = ryzen[2].length === 2; // "Ryzen 7 260" = série 200
    const serie = Number(ryzen[1]) * (tresDigitos ? 100 : 1000);
    const peso = 200 + (tresDigitos ? 90 : Number(ryzen[1]) * 10);
    return { chave: `ryzen-${serie}`, rotulo: `AMD Ryzen ${serie}`, peso, grupo: "AMD" };
  }

  const ultra = processador.match(/^Intel Core Ultra (?:[3579] )?(\d)\d{2}[A-Z]*$/);
  if (ultra) {
    return { chave: `ultra-${ultra[1]}`, rotulo: `Intel Core Ultra Série ${ultra[1]}`, peso: 180 + Number(ultra[1]), grupo: "Intel" };
  }
  const coreNovo = processador.match(/^Intel Core [3579] (\d)\d{2}[A-Z]*$/);
  if (coreNovo) {
    return { chave: `core-${coreNovo[1]}`, rotulo: `Intel Core Série ${coreNovo[1]}`, peso: 170 + Number(coreNovo[1]), grupo: "Intel" };
  }

  let geracao: number | null = null;
  const modelo = processador.match(/^Intel Core i[3579] (\d{4,5})[A-Z]*$/);
  if (modelo) {
    const n = modelo[1];
    // 5 dígitos (12400F, 10100) e os 4 dígitos de notebook que começam com 1
    // (1135G7, 1235U): os dois primeiros. Senão o primeiro (4790 = 4ª, 9400F = 9ª).
    geracao = n.length === 5 || n.charAt(0) === "1" ? Number(n.slice(0, 2)) : Number(n.charAt(0));
  } else {
    const dita = processador.match(/^Intel Core i[3579] de (\d{1,2})ª geração$/);
    if (dita) geracao = Number(dita[1]);
  }
  if (geracao && geracao >= 1 && geracao <= 14) {
    return { chave: `intel-${geracao}`, rotulo: `Intel ${geracao}ª geração`, peso: 100 + geracao, grupo: "Intel" };
  }
  return null;
}

/**
 * Geração da Intel escrita fora do lugar que a ficha lê: "4ª Geração Intel
 * Core i3", "I3,6º Geração", "Sexta Geração", "Geração 8", "6a Geração",
 * "i5 6300hq". Só para Intel Core i3/i5/i7/i9.
 */
const ORDINAIS: Record<string, number> = {
  primeira: 1, segunda: 2, terceira: 3, quarta: 4, quinta: 5, sexta: 6, setima: 7, oitava: 8, nona: 9, decima: 10,
};

export function geracaoIntelNoTitulo(nome: string): OpcaoDeMaquina | null {
  const t = semAcento(nome).replace(/[º°]/g, "ª").replace(/\.\s*ª/g, "ª");
  if (!/\bi[3579]\b|\bcore i[3579]|\bci[3579]\d{4}/.test(t)) return null;
  let n: number | null = null;
  const antes = t.match(/\b(\d{1,2})\s*(?:ª|a\b)?\s*(?:geracao|gera\.|ger\b|gen\b)/);
  const depois = t.match(/\b(?:geracao|gen)\s*(\d{1,2})\b(?!\s*(?:gb|tb))/);
  const porExtenso = t.match(new RegExp(`\\b(${Object.keys(ORDINAIS).join("|")})\\s*geracao`));
  const colada = t.match(/\bi[3579]\s*[,-]?\s*(\d{1,2})\s*(?:ª|th\b|nd\b|rd\b|st\b)/);
  const modelo = t.match(/\bc?i[3579]\s*[-–]?\s*(\d{4,5})[a-z]{0,3}\b(?!\s*(?:gb|tb|mb|mhz|ghz|w\b))/);
  if (antes) n = Number(antes[1]);
  else if (porExtenso) n = ORDINAIS[porExtenso[1]];
  else if (depois) n = Number(depois[1]);
  else if (colada) n = Number(colada[1]);
  else if (modelo) {
    const m = modelo[1];
    n = m.length === 5 || m.charAt(0) === "1" ? Number(m.slice(0, 2)) : Number(m.charAt(0));
  }
  if (!n || n < 1 || n > 14) return null;
  return { chave: `intel-${n}`, rotulo: `Intel ${n}ª geração`, peso: 100 + n, grupo: "Intel" };
}

/**
 * Ryzen escrito só pelo modelo, sem a palavra "Ryzen": "PC Gamer KaBuM!
 * 5500F", "PC Gamer 5 5600g". Só vale quando o título não fala de Intel e o
 * número não é de placa de vídeo (RTX 5060, RX 7600).
 */
export function ryzenSoPeloModelo(nome: string): OpcaoDeMaquina | null {
  const t = semAcento(nome);
  if (/\bintel\b|\bi[3579]\b|\bcore\b|\bathlon\b|\bceleron\b|\bpentium\b/.test(t)) return null;
  const m = t.match(/(?<!\b(?:rtx|gtx|rx|gt)\s?)\b([2-9])\d{3}(?:x3d|gt|ge|xt|g|f|x)\b/);
  if (!m) return null;
  const serie = Number(m[1]) * 1000;
  return { chave: `ryzen-${serie}`, rotulo: `AMD Ryzen ${serie}`, peso: 200 + Number(m[1]) * 10, grupo: "AMD" };
}

// ---------- placa de vídeo ----------

function pesoDaPlaca(chave: string): number {
  const nv = chave.match(/^(rtx|gtx|gt) (\d{3,4})(?: (ti super|ti|super))?$/);
  if (nv) {
    const base = nv[1] === "rtx" ? 30000 : nv[1] === "gtx" ? 20000 : 10000;
    const extra = nv[3] === "ti super" ? 3 : nv[3] === "ti" ? 2 : nv[3] === "super" ? 1 : 0;
    return base + Number(nv[2]) * 4 + extra;
  }
  const rx = chave.match(/^rx (\d{3,4})(?: (xtx|xt))?$/);
  if (rx) {
    const n = Number(rx[1]);
    return (n >= 1000 ? 30000 + n * 4 : 20000 + n * 4) + (rx[2] === "xtx" ? 2 : rx[2] === "xt" ? 1 : 0);
  }
  const arc = chave.match(/^arc ([ab])(\d{3})$/);
  if (arc) return (arc[1] === "b" ? 20000 : 10000) + Number(arc[2]);
  return 0;
}

function chaveDaPlaca(rotulo: string): string {
  return rotulo
    .toLowerCase()
    .replace(/^geforce |^radeon |^intel /, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function placaDoComputador(produto: Pick<Product, "name" | "category" | "price">, ficha: FichaDaMaquina = lerFicha(produto)): OpcaoDeMaquina | null {
  if (ficha.placaDeVideo) {
    const chave = chaveDaPlaca(ficha.placaDeVideo);
    const grupo = ficha.fabricanteDaPlaca === "amd" ? "AMD" : ficha.fabricanteDaPlaca === "intel" ? "Intel" : "NVIDIA";
    return { chave: chave.replace(/\s+/g, "-"), rotulo: ficha.placaDeVideo, peso: pesoDaPlaca(chave), grupo };
  }
  // Sem modelo de placa: só conta como "integrado" quando o título não fala
  // de placa nenhuma (ou diz que é integrada). "Placa de vídeo 4GB" fica fora.
  if (ficha.appleSilicon || lerPc(produto).placa === "sem") {
    return { chave: "integrado", rotulo: "Vídeo integrado (sem placa)", peso: -1, grupo: "Integrado" };
  }
  return null;
}

// ---------- leitura com memória ----------

export interface LeituraDaMaquina {
  geracao: OpcaoDeMaquina | null;
  placa: OpcaoDeMaquina | null;
}

const lidas = new WeakMap<object, LeituraDaMaquina>();
const VAZIA: LeituraDaMaquina = { geracao: null, placa: null };

/** Lê uma vez por produto: os filtros passam pela lista várias vezes. */
export function lerMaquina(produto: Product): LeituraDaMaquina {
  if (!ehComputador(produto)) return VAZIA;
  const guardada = lidas.get(produto);
  if (guardada) return guardada;
  const ficha = lerFicha(produto);
  const geracao =
    geracaoDoProcessador(ficha.processador) ??
    (!ficha.processador || ficha.processador.startsWith("Intel Core i") ? geracaoIntelNoTitulo(produto.name) : null) ??
    (!ficha.processador ? ryzenSoPeloModelo(produto.name) : null);
  const leitura = { geracao, placa: placaDoComputador(produto, ficha) };
  lidas.set(produto, leitura);
  return leitura;
}

export interface OpcaoContada extends OpcaoDeMaquina {
  total: number;
}

/** Conta as opções e põe na ordem: por fabricante, da mais nova/forte para baixo. */
export function contarOpcoes(produtos: Product[], campo: keyof LeituraDaMaquina, ordemDosGrupos: OpcaoDeMaquina["grupo"][]): OpcaoContada[] {
  const porChave = new Map<string, OpcaoContada>();
  for (const p of produtos) {
    const opcao = lerMaquina(p)[campo];
    if (!opcao) continue;
    const atual = porChave.get(opcao.chave);
    if (atual) atual.total++;
    else porChave.set(opcao.chave, { ...opcao, total: 1 });
  }
  const grupo = (o: OpcaoDeMaquina) => {
    const i = ordemDosGrupos.indexOf(o.grupo);
    return i < 0 ? ordemDosGrupos.length : i;
  };
  return [...porChave.values()].sort((a, b) => grupo(a) - grupo(b) || b.peso - a.peso || a.rotulo.localeCompare(b.rotulo, "pt-BR"));
}
