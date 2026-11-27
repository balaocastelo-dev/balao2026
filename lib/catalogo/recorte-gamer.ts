import { lerFicha } from "@/lib/catalogo/ficha";

// ============================================================
// O que não é PC gamer, mesmo quando o catálogo gravou nessa categoria.
//
// Gabinete, PC de escritório (Office / Escritório, inclusive i3-2120 e
// i5-3470) e peça solta não podem aparecer na vitrine gamer. O produto
// continua no catálogo: só muda o caminho em que ele é mostrado.
// Gabinete vai para Hardware/Gabinetes. PC de escritório vai para
// Computadores/PC/Computador Desktop. Peça solta vai para a prateleira
// do tipo dela.
// ============================================================

export const RAIZ_PC_GAMER = "Computadores/PC/PC Gamer";
export const CATEGORIA_GABINETE = "Hardware/Gabinetes";
export const CATEGORIA_ESCRITORIO = "Computadores/PC/Computador Desktop";

const DESTINOS_DE_PECA: { teste: RegExp; categoria: string }[] = [
  { teste: /^(placa de video|vga|gpu)\b/, categoria: "Hardware/Placa de vídeo (VGA)" },
  { teste: /^(memoria|pente)\b/, categoria: "Hardware/Memória RAM" },
  { teste: /^(ssd|nvme|hd|disco)\b/, categoria: "Hardware/SSD" },
  { teste: /^(fonte)\b/, categoria: "Hardware/Fontes" },
  { teste: /^(cooler|water cooler|ventoinha|air cooler)\b/, categoria: "Hardware/Coolers" },
  { teste: /^(monitor)\b/, categoria: "Computadores/Monitores" },
  { teste: /^(teclado|mouse|headset|fone)\b/, categoria: "Periféricos" },
  { teste: /^(processador)\b/, categoria: "Hardware/Processadores" },
  { teste: /^(cadeira)\b/, categoria: "Espaço Gamer/Cadeiras Gamer" },
  { teste: /^(gabinete|case)\b/, categoria: CATEGORIA_GABINETE },
];

const semAcento = (s: unknown) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/**
 * Placa de vídeo dedicada no título: RTX, GTX, GT de verdade, RX, Arc e
 * equivalentes. "Gabinete gamer", Vega, Intel HD/UHD/Iris e Radeon Graphics
 * não contam — são o gabinete ou o vídeo integrado do processador.
 */
export function temGpuDedicada(nome: string): boolean {
  const n = semAcento(nome);
  if (!n) return false;
  if (lerFicha({ name: nome, category: RAIZ_PC_GAMER }).placaDeVideo) return true;
  if (/\b(rtx|gtx)\s*\d{3,4}\b/.test(n)) return true;
  if (/\bgt\s*(610|630|640|710|720|730|740|1030)\b/.test(n)) return true;
  if (/\brx\s*\d{3,4}\b/.test(n)) return true;
  if (/\barc\s*[ab]\s*\d{3}\b/.test(n)) return true;
  if (/\b(nvidia|nvidea|geforce|quadro)\b/.test(n)) return true;
  if (/\bradeon\s+(hd|rx|r[579])\b/.test(n)) return true;
  return false;
}

function noComputador(categoria: string) {
  return categoria === "Computadores/PC" || categoria.startsWith("Computadores/PC/");
}

/** PC de escritório pelo nome: "PC Office", "PC Escritório", "Computador Office". */
export function ehPcDeEscritorio(nome: string): boolean {
  const n = semAcento(nome);
  return /\b(pc|computador|cpu)\s+(office|escritorio)\b/.test(n) || /\b(office|escritorio)\s+(kabum|tob)\b/.test(n);
}

/** O anúncio é a peça, não um computador montado. */
export function ehPecaSolta(nome: string): boolean {
  const n = semAcento(nome);
  return DESTINOS_DE_PECA.some((d) => d.teste.test(n));
}

/**
 * Não entra na vitrine "PC gamer" (home e /pcgamer), qualquer que seja
 * a categoria gravada.
 */
export function foraDaVitrineGamer(nome: string): boolean {
  const n = semAcento(nome);
  if (!n) return true;
  if (ehPcDeEscritorio(nome)) return true;
  if (ehPecaSolta(nome)) return true;
  if (/\b(office|escritorio)\b/.test(n) && !/\b(gamer|rtx|gtx|geforce|radeon)\b/.test(n)) return true;
  // Sem RTX, GTX, RX, Arc ou equivalente, não é vitrine gamer.
  if (!temGpuDedicada(nome)) return true;
  return false;
}

/** Para onde o produto deve ir. Null = fica na categoria em que está. */
export function destinoForaDoGamer(nome: string): string | null {
  if (ehPcDeEscritorio(nome)) return CATEGORIA_ESCRITORIO;
  const n = semAcento(nome);
  if (/\b(office|escritorio)\b/.test(n) && !/\b(gamer|rtx|gtx|geforce|radeon)\b/.test(n)) {
    return CATEGORIA_ESCRITORIO;
  }
  const peca = DESTINOS_DE_PECA.find((d) => d.teste.test(n));
  return peca ? peca.categoria : null;
}

/**
 * Categoria usada na loja. Só mexe em produto que está em Computadores/PC
 * (onde o gabinete e o PC office foram parar dentro de PC Gamer).
 */
export function categoriaCorrigida(nome: string, categoria: string): string {
  const atual = String(categoria || "");
  // Só o ramo de computador. "PC Gamer/..." de uma fonte com destino próprio
  // (teste de trilha) não entra aqui.
  if (!noComputador(atual)) return atual;
  return destinoForaDoGamer(nome) || atual;
}

export function ajustarCategoria<T extends { name?: string; category?: string }>(produto: T): T {
  const category = categoriaCorrigida(String(produto?.name || ""), String(produto?.category || ""));
  if (category === produto.category) return produto;
  return { ...produto, category };
}

/**
 * A página desta categoria precisa olhar também o que ainda está gravado
 * em PC Gamer, porque o banco só é reescrito na próxima leitura de preço.
 * Não vale para Computadores/PC: essa busca já traz o PC Gamer.
 */
export function buscaRecebeRecorte(caminho: string): boolean {
  const alvo = String(caminho || "");
  if (!alvo) return false;
  if (alvo === "Computadores/PC" || RAIZ_PC_GAMER.startsWith(`${alvo}/`) || alvo.startsWith(`${RAIZ_PC_GAMER}/`) || alvo === RAIZ_PC_GAMER) {
    return false;
  }
  const destinos = [CATEGORIA_GABINETE, CATEGORIA_ESCRITORIO, ...DESTINOS_DE_PECA.map((d) => d.categoria)];
  return destinos.some((d) => d === alvo || d.startsWith(`${alvo}/`));
}
