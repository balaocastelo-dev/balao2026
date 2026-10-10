// ============================================================
// Foto para produto de fornecedor que não tem foto utilizável.
//
// As fotos da TechSupri têm marca d'água do fornecedor. Este módulo procura o
// mesmo produto na busca da KaBuM! (Thiago autorizou usar as fotos de lá) e
// só aceita quando o nome bate de verdade: o modelo (o pedaço com número,
// "AX12", "CF258A", "664") precisa aparecer nos dois nomes.
//
// `/busca/<termo>` é permitido pelo robots.txt da KaBuM! (só a busca com "?"
// é vedada). Uma busca por vez, com pausa; 403/429 encerra.
// ============================================================

import { interpretarPagina } from "./kabum";

const semAcento = (s: unknown) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase();

/** Palavras que não ajudam a reconhecer o produto. */
const VAZIAS = new Set([
  "de", "da", "do", "das", "dos", "e", "com", "para", "p", "c", "em", "a", "o", "sem", "fio", "original", "compativel",
  "novo", "kit", "unidade", "un", "und", "pcs", "cor", "preto", "preta", "branco", "branca", "azul", "vermelho",
  "rosa", "verde", "cinza", "colorido", "color", "black", "white", "gamer", "pro", "plus", "max", "mini", "the",
]);

export function palavrasDoNome(nome: string): string[] {
  return semAcento(nome)
    .replace(/(\d),(\d)/g, "$1.$2")
    .split(/[^a-z0-9.]+/)
    .map((p) => p.replace(/^\.+|\.+$/g, ""))
    .filter((p) => p.length >= 2 && !VAZIAS.has(p));
}

const UNIDADE = /^\d+(gb|tb|mb|w|v|mah|m|cm|mm|hz|ml|g|kg|pol|x|un|pcs)$/;

/**
 * Pedaços de modelo: têm letra e número ("ax12", "cf258a") ou são números de
 * 3+ dígitos ("664"). Palavra curta seguida de número pequeno também vira
 * modelo ("AX 12", "Flip 6" -> "ax12", "flip6").
 */
export function modelosDoNome(nome: string): string[] {
  const pedacos = new Set<string>();
  const palavras = palavrasDoNome(nome);
  for (const p of palavras) {
    const temNumero = /\d/.test(p);
    const temLetra = /[a-z]/.test(p);
    if (temNumero && temLetra && p.length >= 3 && !UNIDADE.test(p)) pedacos.add(p);
    else if (temNumero && !temLetra && /^\d{3,}$/.test(p)) pedacos.add(p);
  }
  const soltas = semAcento(nome).split(/[^a-z0-9]+/).filter(Boolean);
  for (let i = 0; i + 1 < soltas.length; i++) {
    if (/^[a-z]{2,5}$/.test(soltas[i]) && /^\d{1,3}$/.test(soltas[i + 1]) && !VAZIAS.has(soltas[i])) {
      pedacos.add(soltas[i] + soltas[i + 1]);
    }
  }
  return [...pedacos];
}

/** O modelo aparece no nome achado (junto, "ax12", ou separado, "ax 12" / "ax-12")? */
function temModelo(achado: string, modelo: string): boolean {
  const texto = " " + semAcento(achado).replace(/[^a-z0-9.]+/g, " ") + " ";
  if (texto.includes(` ${modelo} `) || texto.replace(/ /g, "  ").includes(modelo)) {
    // `includes` solto aceita "cf258a" dentro de "cf258ab"; tudo bem, é o mesmo cartucho em outra embalagem.
    if (texto.includes(modelo)) return true;
  }
  const m = modelo.match(/^([a-z]{2,5})(\d{1,3})$/);
  return !!m && new RegExp(`\\b${m[1]}[ ]?${m[2]}\\b`).test(texto);
}

const CORES: Record<string, string> = {
  preto: "preto", preta: "preto", black: "preto", bk: "preto",
  colorido: "color", color: "color", tricolor: "color", colorida: "color", cores: "color", coloridos: "color",
  ciano: "azul", cyan: "azul", azul: "azul", blue: "azul",
  magenta: "magenta", amarelo: "amarelo", yellow: "amarelo",
  branco: "branco", branca: "branco", white: "branco",
  vermelho: "vermelho", vermelha: "vermelho", red: "vermelho",
  rosa: "rosa", pink: "rosa", roxo: "roxo", roxa: "roxo", purple: "roxo", lilas: "roxo",
  verde: "verde", green: "verde", cinza: "cinza", grafite: "cinza", gray: "cinza", grey: "cinza",
  dourado: "dourado", gold: "dourado", prata: "prata", silver: "prata", laranja: "laranja", orange: "laranja",
  camuflado: "camuflado", camuflada: "camuflado",
};

/** Palavras que, no começo do nome achado, dizem que é OUTRA coisa (acessório do produto). */
const OUTRO_TIPO = new Set(["carregador", "kit", "capa", "case", "suporte", "pelicula", "base", "dock", "refil", "bateria"]);

function coresDoNome(nome: string): Set<string> {
  const saida = new Set<string>();
  for (const p of semAcento(nome).split(/[^a-z]+/)) if (CORES[p]) saida.add(CORES[p]);
  return saida;
}

/**
 * 0 a 1: quanto o nome achado na KaBuM! parece o do fornecedor.
 *
 * Zero quando o modelo não bate (todos os modelos do fornecedor precisam
 * aparecer; com 3 ou mais, basta 2/3) ou quando as cores se contradizem
 * (cartucho preto não pega foto do colorido).
 */
export function semelhanca(doFornecedor: string, achado: string): number {
  const modelos = modelosDoNome(doFornecedor);
  if (modelos.length > 0) {
    const bateu = modelos.filter((m) => temModelo(achado, m));
    const exigido = modelos.length >= 3 ? Math.ceil((modelos.length * 2) / 3) : modelos.length;
    if (bateu.length < exigido) return 0;
  }
  const primeiraAchada = semAcento(achado).split(/[^a-z0-9]+/).filter(Boolean)[0] || "";
  if (OUTRO_TIPO.has(primeiraAchada) && !semAcento(doFornecedor).split(/[^a-z0-9]+/).includes(primeiraAchada)) return 0;
  const coresA = coresDoNome(doFornecedor);
  const coresB = coresDoNome(achado);
  if (coresA.size && coresB.size && ![...coresA].some((c) => coresB.has(c))) return 0;

  const a = new Set(palavrasDoNome(doFornecedor));
  const b = new Set(palavrasDoNome(achado));
  if (a.size === 0 || b.size === 0) return 0;
  let comuns = 0;
  for (const p of a) if (b.has(p)) comuns++;
  // Quanto do nome do fornecedor aparece no achado pesa mais que o contrário:
  // o título da KaBuM! costuma ser bem mais comprido.
  const cobertura = comuns / a.size;
  const precisao = comuns / b.size;
  const nota = 0.75 * cobertura + 0.25 * precisao;
  // Sem modelo para conferir, só vale se quase todo o nome do fornecedor estiver lá.
  if (modelos.length === 0 && cobertura < 0.85) return 0;
  // Kit ou combo no achado, sem ser kit no fornecedor: a foto mostra outra coisa.
  const ehKit = (t: string) => /\b(kit|combo)\b|\+/.test(semAcento(t));
  let ajuste = ehKit(achado) && !ehKit(doFornecedor) ? 0.75 : 1;
  // Cor a mais no achado (preto + colorido quando o fornecedor diz só preto).
  if (coresA.size && [...coresB].some((c) => !coresA.has(c))) ajuste *= 0.85;
  return nota * ajuste;
}

export const NOTA_MINIMA = 0.55;

/** O termo de busca: marca + tipo + modelo, sem enfeite. */
export function termoDeBusca(nome: string): string {
  return semAcento(nome)
    .replace(/(\d),(\d)/g, "$1$2")
    .split(/[^a-z0-9]+/)
    .filter((p) => p && !VAZIAS.has(p))
    .slice(0, 7)
    .join("-");
}

export interface FotoAchada {
  foto: string;
  fotos: string[];
  nome: string;
  codigo: string;
  nota: number;
}

export type ResultadoDaBusca = { ok: true; achada: FotoAchada | null } | { ok: false; motivo: "bloqueado" | "rede"; detalhe: string };

const CABECALHOS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml",
  "accept-language": "pt-BR,pt;q=0.9",
};

export async function buscarFotoNaKabum(nome: string, buscar: typeof fetch = fetch): Promise<ResultadoDaBusca> {
  const termo = termoDeBusca(nome);
  if (!termo) return { ok: true, achada: null };
  try {
    const resposta = await buscar(`https://www.kabum.com.br/busca/${encodeURIComponent(termo)}`, {
      headers: CABECALHOS,
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    if (resposta.status === 403 || resposta.status === 429) {
      return { ok: false, motivo: "bloqueado", detalhe: `a KaBuM! respondeu ${resposta.status}` };
    }
    if (!resposta.ok) return { ok: true, achada: null };
    const pagina = interpretarPagina(await resposta.text());
    if (!pagina) return { ok: true, achada: null };

    let melhor: FotoAchada | null = null;
    for (const item of pagina.itens.slice(0, 30)) {
      if (!item.foto) continue;
      const nota = semelhanca(nome, item.nome);
      if (nota >= NOTA_MINIMA && (!melhor || nota > melhor.nota)) {
        melhor = { foto: item.foto, fotos: item.fotos.length ? item.fotos : [item.foto], nome: item.nome, codigo: item.codigo, nota };
      }
    }
    return { ok: true, achada: melhor };
  } catch (erro) {
    return { ok: false, motivo: "rede", detalhe: String((erro as Error)?.message || erro) };
  }
}
