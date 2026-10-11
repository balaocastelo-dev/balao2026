// ============================================================
// Página /pcgamer: só PC gamer, separado em fileiras.
//
// Pedido do Thiago em 11/10/2026. A página mostrava "máquinas e peças" achadas
// por palavra solta ("gamer", "rtx", "gabinete"...): entravam gabinete, cooler
// e cadeira. Agora só entra produto da categoria Computadores/PC/PC Gamer, e
// cada fileira é um corte dessa categoria:
//
//    1. entrada: vídeo integrado ou placa de até 2 GB
//    2. intermediário: placa de 3 ou 4 GB
//    3. top: placa de 6 GB
//    4. placa de 8 GB (entram as de 10 e 11 GB)
//    5. placa de 12 GB ou mais
//    6. setups completos, com monitor
//    7. só AMD Ryzen 5
//    8. só AMD Ryzen 7
//    9. só AMD Ryzen 9
//   10. PCs de elite: placa de 16 GB ou mais, do mais caro para o mais barato
//
// As fileiras 1 a 5 são só da torre; quem vem com monitor fica na fileira 6.
// Um produto que já apareceu numa fileira não se repete nas de baixo, a não
// ser que a fileira de baixo não tenha outro para mostrar.
//
// Nada aqui é cadastro: a memória da placa, o processador e o monitor são
// lidos do título do produto (lib/catalogo/ficha.ts). Quando o título não
// deixa saber a memória da placa, o produto fica fora das fileiras 1 a 5 em
// vez de entrar na errada.
// ============================================================

import { lerFicha, tituloDaMaquina } from "@/lib/catalogo/ficha";
import { parsePriceToNumber, type Product } from "@/lib/utils";

export const RAIZ_PC_GAMER = "Computadores/PC/PC Gamer";

/** Quantos cards cada fileira mostra. */
export const POR_FILEIRA = 12;

/** A partir de quantos GB na placa a máquina é "de elite". */
export const VRAM_DE_ELITE = 16;

export type IdDaFileira =
  | "entrada"
  | "ate-4gb"
  | "ate-6gb"
  | "8gb"
  | "12gb-ou-mais"
  | "setups"
  | "ryzen-5"
  | "ryzen-7"
  | "ryzen-9"
  | "elite";

type ProdutoDeVitrine = Pick<Product, "id" | "name" | "price" | "category" | "availability">;

export interface LeituraDoPc {
  /**
   * "sem": vídeo integrado, sem placa dedicada.
   * "dedicada": tem placa e dá para saber a memória dela.
   * "desconhecida": o título fala em placa, mas não diz qual nem de quantos GB.
   */
  placa: "sem" | "dedicada" | "desconhecida";
  /** Memória da placa dedicada, em GB. Só existe quando `placa` é "dedicada". */
  vramGb: number | null;
  /** O anúncio inclui monitor. */
  comMonitor: boolean;
  /** Linha do processador AMD: Ryzen 3, 5, 7 ou 9. Vazio em Intel ou quando o título não diz. */
  ryzen: 3 | 5 | 7 | 9 | null;
  /** Preço à vista, em reais. */
  valor: number;
  /** "Ryzen 5 5600 com RTX 5060": serve para a fileira não repetir a mesma configuração. */
  titulo: string;
}

const semAcento = (s: unknown) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

// ---------- placa de vídeo ----------

const VIDEO_INTEGRADO = /\bvega\b|\bintegrad|\buhd\b|\biris\b|radeon graphics/;

/** "Placa 3050", "Placa 1650": o modelo sem o "RTX"/"GTX" na frente. */
const PLACA_SO_COM_NUMERO = /\bplaca (\d{4})\b/;

/**
 * Memória dita sem o modelo: "Placa de Vídeo GeForce 4GB", "GeForce GTX 4G",
 * "Vga 8GB", "Vídeo 4gb". Não vale quando o número é a RAM ("8GB Ddr4").
 */
const VRAM_SEM_MODELO =
  /\b(?:placa de video|video|vga|geforce|gtx|gt|gpu)(?: (?:de|geforce|gtx|gt|radeon|rx|dedicada))*\s+(\d{1,2}) ?gb?\b(?! ?(?:ram|ddr|de ram))/;

const MEMORIAS_DE_PLACA = [1, 2, 3, 4, 6, 8, 10, 11, 12, 16, 24];

/** O título fala em placa de vídeo dedicada, mesmo sem dizer qual. */
const FALA_EM_PLACA = /\bplaca de video\b|\bvga\b|\bgeforce\b|\bgtx\b|\brtx\b|\bradeon rx\b/;

// ---------- monitor ----------

/** "Monitor 23\"", "Tela 23", "+ 19 Polegadas", "... SSD 240GB 24\"". */
const COM_MONITOR = /\bmonitor\b|\btela \d{2}\b|\b\d{2}(?:[.,]\d)? ?(?:"|''|”|polegadas\b|pol\b)/;

// ---------- processador ----------

function linhaDoRyzen(processador: string | null): LeituraDoPc["ryzen"] {
  if (!processador) return null;
  const comNivel = processador.match(/^AMD Ryzen (?:AI )?([3579])\b/);
  if (comNivel) return Number(comNivel[1]) as LeituraDoPc["ryzen"];
  // "AMD Ryzen 5600G": sem o nível, o segundo dígito do modelo diz a linha
  // (x9xx = Ryzen 9; x7xx e x8xx = 7; x4xx a x6xx = 5; abaixo disso = 3).
  const soModelo = processador.match(/^AMD Ryzen \d(\d)\d{2}/);
  if (!soModelo) return null;
  const centena = Number(soModelo[1]);
  if (centena >= 9) return 9;
  if (centena >= 7) return 7;
  if (centena >= 4) return 5;
  return 3;
}

// ---------- leitura ----------

export function lerPc(produto: Pick<Product, "name" | "category" | "price">): LeituraDoPc {
  const nome = semAcento(produto.name);
  let ficha = lerFicha(produto);

  // "Placa 3050" não é lido como placa; com o prefixo, é.
  if (!ficha.placaDeVideo && PLACA_SO_COM_NUMERO.test(nome)) {
    const comPrefixo = nome.replace(PLACA_SO_COM_NUMERO, (_, n: string) => `${Number(n) >= 2000 ? "rtx" : "gtx"} ${n}`);
    const relida = lerFicha({ name: comPrefixo, category: produto.category });
    if (relida.vramGb != null) ficha = relida;
  }

  let placa: LeituraDoPc["placa"];
  let vramGb: number | null = null;

  if (ficha.vramGb != null) {
    placa = "dedicada";
    vramGb = ficha.vramGb;
  } else if (ficha.placaDeVideo) {
    // Modelo que a tabela não conhece: tem placa, não se sabe de quanto.
    placa = "desconhecida";
  } else {
    const dita = nome.match(VRAM_SEM_MODELO);
    const gb = dita ? Number(dita[1]) : NaN;
    if (!VIDEO_INTEGRADO.test(nome) && MEMORIAS_DE_PLACA.includes(gb)) {
      placa = "dedicada";
      vramGb = gb;
    } else if (!VIDEO_INTEGRADO.test(nome) && FALA_EM_PLACA.test(nome)) {
      placa = "desconhecida";
    } else {
      placa = "sem";
    }
  }

  return {
    placa,
    vramGb,
    comMonitor: COM_MONITOR.test(nome),
    ryzen: linhaDoRyzen(ficha.processador),
    valor: parsePriceToNumber(produto.price),
    titulo: tituloDaMaquina(produto, ficha),
  };
}

// ---------- as fileiras ----------

export interface DefinicaoDaFileira {
  id: IdDaFileira;
  titulo: string;
  subtitulo: string;
  /** "maior": do mais caro para o mais barato. O padrão é do mais barato para o mais caro. */
  ordem?: "maior";
  entra: (pc: LeituraDoPc) => boolean;
}

const torreComPlaca = (pc: LeituraDoPc, de: number, ate: number) =>
  !pc.comMonitor && pc.placa === "dedicada" && pc.vramGb! > de && pc.vramGb! <= ate;

export const FILEIRAS: DefinicaoDaFileira[] = [
  {
    id: "entrada",
    titulo: "PC gamer de entrada",
    subtitulo: "Vídeo integrado ou placa de vídeo de até 2 GB.",
    entra: (pc) => !pc.comMonitor && (pc.placa === "sem" || (pc.placa === "dedicada" && pc.vramGb! <= 2)),
  },
  {
    id: "ate-4gb",
    titulo: "PC gamer intermediário",
    subtitulo: "Placa de vídeo de 3 ou 4 GB.",
    entra: (pc) => torreComPlaca(pc, 2, 4),
  },
  {
    id: "ate-6gb",
    titulo: "PC gamer top",
    subtitulo: "Placa de vídeo de 6 GB.",
    entra: (pc) => torreComPlaca(pc, 4, 6),
  },
  {
    id: "8gb",
    titulo: "PC gamer com placa de 8 GB",
    subtitulo: "Placa de vídeo de 8 a 11 GB.",
    entra: (pc) => torreComPlaca(pc, 6, 11),
  },
  {
    id: "12gb-ou-mais",
    titulo: "PC gamer com placa de 12 GB ou mais",
    subtitulo: "Placa de vídeo de 12, 16, 24 ou 32 GB.",
    entra: (pc) => torreComPlaca(pc, 11, Infinity),
  },
  {
    id: "setups",
    titulo: "Setups completos com tela",
    subtitulo: "Computador e monitor no mesmo pedido.",
    entra: (pc) => pc.comMonitor,
  },
  {
    id: "ryzen-5",
    titulo: "PC gamer com AMD Ryzen 5",
    subtitulo: "Só máquinas com processador AMD Ryzen 5.",
    entra: (pc) => pc.ryzen === 5,
  },
  {
    id: "ryzen-7",
    titulo: "PC gamer com AMD Ryzen 7",
    subtitulo: "Só máquinas com processador AMD Ryzen 7.",
    entra: (pc) => pc.ryzen === 7,
  },
  {
    id: "ryzen-9",
    titulo: "PC gamer com AMD Ryzen 9",
    subtitulo: "Só máquinas com processador AMD Ryzen 9.",
    entra: (pc) => pc.ryzen === 9,
  },
  {
    id: "elite",
    titulo: "PCs de elite",
    subtitulo: `As máquinas mais fortes da loja: placa de vídeo de ${VRAM_DE_ELITE} GB ou mais.`,
    ordem: "maior",
    entra: (pc) => pc.placa === "dedicada" && pc.vramGb! >= VRAM_DE_ELITE,
  },
];

export interface Fileira<T> {
  id: IdDaFileira;
  titulo: string;
  subtitulo: string;
  /** Os cards da fileira. */
  produtos: T[];
  /** Quantos produtos do catálogo atendem ao critério da fileira. */
  total: number;
}

export interface VitrineDePcGamer<T> {
  fileiras: Fileira<T>[];
  /** Quantos PCs gamer a loja tem à venda. */
  total: number;
}

const naCategoria = (categoria: unknown) => {
  const atual = String(categoria || "");
  return atual === RAIZ_PC_GAMER || atual.startsWith(`${RAIZ_PC_GAMER}/`);
};

const indisponivel = (p: ProdutoDeVitrine) => /indispon|esgotad|sem estoque/i.test(String(p.availability || ""));

/**
 * Monta as fileiras da página. Fileira sem nenhum produto que atenda ao
 * critério não aparece.
 *
 * Dentro de cada fileira, primeiro entra uma máquina de cada configuração
 * (processador + placa), para a linha não ser doze vezes o mesmo PC de
 * vendedores diferentes; se sobrar lugar, entram as repetidas.
 */
export function montarFileiras<T extends ProdutoDeVitrine>(produtos: T[], porFileira = POR_FILEIRA): VitrineDePcGamer<T> {
  const vistos = new Set<string>();
  const pcs: { produto: T; pc: LeituraDoPc }[] = [];

  for (const produto of Array.isArray(produtos) ? produtos : []) {
    if (!produto || !naCategoria(produto.category) || indisponivel(produto)) continue;
    const id = String(produto.id || "");
    if (!id || vistos.has(id) || !String(produto.name || "").trim()) continue;
    const pc = lerPc(produto);
    if (!(pc.valor > 0)) continue;
    vistos.add(id);
    pcs.push({ produto, pc });
  }

  const porNome = (a: { produto: T }, b: { produto: T }) =>
    String(a.produto.name).localeCompare(String(b.produto.name), "pt-BR");
  const crescente = [...pcs].sort((a, b) => a.pc.valor - b.pc.valor || porNome(a, b));
  const decrescente = [...pcs].sort((a, b) => b.pc.valor - a.pc.valor || porNome(a, b));

  const jaMostrados = new Set<string>();
  const fileiras: Fileira<T>[] = [];
  const limite = Math.max(1, porFileira);

  for (const definicao of FILEIRAS) {
    const candidatos = (definicao.ordem === "maior" ? decrescente : crescente).filter((item) => definicao.entra(item.pc));
    if (candidatos.length === 0) continue;

    // Ordem de preferência: (1) configuração que a fileira ainda não tem, de
    // produto que não apareceu acima; (2) o mesmo, repetindo configuração;
    // (3) produto que já apareceu numa fileira de cima. O terceiro passo só
    // acontece com catálogo pequeno: garante que a fileira não suma só porque
    // as máquinas dela já foram mostradas.
    const livres = candidatos.filter((item) => !jaMostrados.has(String(item.produto.id)));
    const jaVistos = candidatos.filter((item) => jaMostrados.has(String(item.produto.id)));

    const escolhidos: T[] = [];
    const configuracoes = new Set<string>();
    const repetidos: T[] = [];
    for (const item of livres) {
      if (escolhidos.length >= limite) break;
      if (configuracoes.has(item.pc.titulo)) {
        repetidos.push(item.produto);
        continue;
      }
      configuracoes.add(item.pc.titulo);
      escolhidos.push(item.produto);
    }
    for (const produto of [...repetidos, ...jaVistos.map((item) => item.produto)]) {
      if (escolhidos.length >= limite) break;
      escolhidos.push(produto);
    }

    // A sobra entra depois das configurações diferentes, mas a fileira
    // continua na ordem de preço.
    const posicao = new Map(candidatos.map((item, i) => [String(item.produto.id), i]));
    escolhidos.sort((a, b) => posicao.get(String(a.id))! - posicao.get(String(b.id))!);

    for (const produto of escolhidos) jaMostrados.add(String(produto.id));
    fileiras.push({
      id: definicao.id,
      titulo: definicao.titulo,
      subtitulo: definicao.subtitulo,
      produtos: escolhidos,
      total: candidatos.length,
    });
  }

  return { fileiras, total: pcs.length };
}
