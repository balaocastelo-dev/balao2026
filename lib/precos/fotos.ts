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

const UNIDADE = /^(\d+(\.\d+)?(gb|tb|mb|w|v|mah|m|cm|mm|hz|ml|g|kg|pol|x|un|pcs|k|mbps|gbps|dpi)|\d{1,2}(\.\d+)?a)$/;

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
    if (temNumero && temLetra && (p.length >= 3 || /^[a-z]\d$/.test(p)) && !UNIDADE.test(p)) pedacos.add(p);
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
  camuflado: "camuflado", camuflada: "camuflado", bege: "bege", nude: "bege", marrom: "marrom",
};

/** Palavras que, no começo do nome achado, dizem que é OUTRA coisa (acessório do produto). */
const OUTRO_TIPO = new Set([
  "carregador", "kit", "capa", "case", "suporte", "pelicula", "base", "dock", "refil", "bateria", "console", "adaptador", "volante",
]);

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
  // Com fio x sem fio: a foto de um não serve para o outro.
  const conexao = (t: string) => {
    const n = " " + semAcento(t).replace(/[^a-z0-9]+/g, " ") + " ";
    if (/ sem fio | wireless | bluetooth | s fio /.test(n)) return "sem";
    if (/ com fio | c fio /.test(n)) return "com";
    return null;
  };
  const conexaoA = conexao(doFornecedor);
  const conexaoB = conexao(achado);
  if (conexaoA && conexaoB && conexaoA !== conexaoB) return 0;
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

/** Termo curto: marca + modelos ("onikuma-k8"). Segunda tentativa quando o nome inteiro não acha nada. */
export function termoCurto(nome: string, marca: string | null): string | null {
  const modelos = modelosDoNome(nome).filter((m) => !/^\d+$/.test(m) || m.length >= 3);
  if (modelos.length === 0) return null;
  const partes = [marca ? semAcento(marca).replace(/[^a-z0-9]+/g, "-") : "", ...modelos.slice(0, 2)].filter(Boolean);
  return partes.join("-");
}

export type Avaliador = (doFornecedor: string, achado: string) => number;

export async function buscarFotoNaKabum(
  nome: string,
  buscar: typeof fetch = fetch,
  termoPronto?: string,
  avaliar: Avaliador = semelhanca,
  minima = NOTA_MINIMA
): Promise<ResultadoDaBusca> {
  const termo = termoPronto || termoDeBusca(nome);
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
      const nota = avaliar(nome, item.nome);
      if (nota >= minima && (!melhor || nota > melhor.nota)) {
        melhor = { foto: item.foto, fotos: item.fotos.length ? item.fotos : [item.foto], nome: item.nome, codigo: item.codigo, nota };
      }
    }
    return { ok: true, achada: melhor };
  } catch (erro) {
    return { ok: false, motivo: "rede", detalhe: String((erro as Error)?.message || erro) };
  }
}

// ---------- Kalunga (segunda tentativa) ----------
//
// Quando a KaBuM! não tem o produto, a Kalunga costuma ter (cartucho, toner,
// cabo, pilha, papelaria). A busca `/busca/1?q=` é permitida pelo robots.txt
// deles. Mesmas regras: uma por vez, com pausa; 403/429 encerra.

/** Lê os produtos (nome e foto) do HTML da busca da Kalunga. Separado para teste. */
export function produtosDaBuscaKalunga(html: string): { nome: string; foto: string; codigo: string }[] {
  const saida: { nome: string; foto: string; codigo: string }[] = [];
  const re = /<a class="blocoproduto__link[^"]*" href="\/prod\/[^"]*\/(\d+)" title="([^"]+)"/g;
  for (const m of String(html || "").matchAll(re)) {
    const codigo = m[1];
    const nome = m[2].replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#39;/g, "'");
    if (saida.some((p) => p.codigo === codigo)) continue;
    saida.push({ codigo, nome, foto: `https://img.kalunga.com.br/fotosdeprodutos/${codigo}.webp` });
  }
  return saida;
}

export async function buscarFotoNaKalunga(nome: string, buscar: typeof fetch = fetch): Promise<ResultadoDaBusca> {
  const termo = termoDeBusca(nome).replace(/-/g, " ");
  if (!termo) return { ok: true, achada: null };
  try {
    const resposta = await buscar(`https://www.kalunga.com.br/busca/1?q=${encodeURIComponent(termo)}`, {
      headers: CABECALHOS,
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    if (resposta.status === 403 || resposta.status === 429) {
      return { ok: false, motivo: "bloqueado", detalhe: `a Kalunga respondeu ${resposta.status}` };
    }
    if (!resposta.ok) return { ok: true, achada: null };
    let melhor: FotoAchada | null = null;
    for (const item of produtosDaBuscaKalunga(await resposta.text()).slice(0, 30)) {
      const nota = semelhanca(nome, item.nome);
      if (nota >= NOTA_MINIMA && (!melhor || nota > melhor.nota)) {
        melhor = { foto: item.foto, fotos: [item.foto], nome: item.nome, codigo: item.codigo, nota };
      }
    }
    return { ok: true, achada: melhor };
  } catch (erro) {
    return { ok: false, motivo: "rede", detalhe: String((erro as Error)?.message || erro) };
  }
}

/** KaBuM! primeiro; se não achar, Americanas. */
export async function buscarFoto(nome: string, buscar: typeof fetch = fetch): Promise<ResultadoDaBusca> {
  const kabum = await buscarFotoNaKabum(nome, buscar);
  if (!kabum.ok || kabum.achada) return kabum;
  return buscarFotoNaAmericanas(nome, buscar);
}

// ---------- Americanas (terceira tentativa) ----------
//
// A Americanas tem muito acessório de marketplace que a KaBuM! não vende
// (controle genérico, cabo, suporte). A busca pública deles (VTEX) devolve
// JSON, e o robots.txt libera o site inteiro, inclusive para agentes.

interface ProdutoAmericanas {
  productId?: string;
  productName?: string;
  items?: { images?: { imageUrl?: string }[] }[];
}

export function produtosDaBuscaAmericanas(json: unknown): { nome: string; foto: string; fotos: string[]; codigo: string }[] {
  const lista = (json as { products?: ProdutoAmericanas[] })?.products;
  if (!Array.isArray(lista)) return [];
  const saida: { nome: string; foto: string; fotos: string[]; codigo: string }[] = [];
  for (const p of lista) {
    const fotos = (p.items || [])
      .flatMap((i) => i.images || [])
      .map((i) => String(i.imageUrl || ""))
      .filter((u) => /^https:\/\/[a-z0-9.-]+\.vtexassets\.com\//.test(u))
      .slice(0, 6);
    if (!p.productName || fotos.length === 0) continue;
    saida.push({ nome: String(p.productName), foto: fotos[0], fotos, codigo: String(p.productId || "") });
  }
  return saida;
}

export async function buscarFotoNaAmericanas(
  nome: string,
  buscar: typeof fetch = fetch,
  termos?: string[],
  avaliar: Avaliador = semelhanca,
  minima = NOTA_MINIMA
): Promise<ResultadoDaBusca> {
  // A busca deles exige todas as palavras: termo comprido não acha nada.
  // Tenta do mais específico ao mais solto.
  const palavras = termoDeBusca(nome).split("-").filter(Boolean);
  const tentativas = [...new Set([...(termos || []), palavras.slice(0, 5).join(" "), palavras.slice(0, 3).join(" ")])]
    .map((t) => t.replace(/-/g, " ").trim())
    .filter(Boolean);
  let melhor: FotoAchada | null = null;
  try {
    for (const termo of tentativas) {
      const url = `https://www.americanas.com.br/api/io/_v/api/intelligent-search/product_search/?query=${encodeURIComponent(termo)}&count=20&page=1&locale=pt-BR`;
      const resposta = await buscar(url, {
        headers: { ...CABECALHOS, accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(12_000),
      });
      if (resposta.status === 403 || resposta.status === 429) {
        return { ok: false, motivo: "bloqueado", detalhe: `a Americanas respondeu ${resposta.status}` };
      }
      if (!resposta.ok) continue;
      for (const item of produtosDaBuscaAmericanas(await resposta.json())) {
        const nota = avaliar(nome, item.nome);
        if (nota >= minima && (!melhor || nota > melhor.nota)) {
          melhor = { foto: item.foto, fotos: item.fotos, nome: item.nome, codigo: item.codigo, nota };
        }
      }
      if (melhor) break;
    }
    return { ok: true, achada: melhor };
  } catch (erro) {
    return { ok: false, motivo: "rede", detalhe: String((erro as Error)?.message || erro) };
  }
}


// ---------- foto ilustrativa ----------
//
// Para o que não tem foto do produto exato em lugar nenhum (cabo genérico,
// acessório de marca pequena), vale uma foto do MESMO TIPO de produto,
// marcada no site como "Imagem ilustrativa". O endereço da foto ganha o
// final #ilustrativa, que o navegador ignora e o site usa para mostrar o aviso.

export const MARCA_ILUSTRATIVA = "#ilustrativa";

export function ehIlustrativa(url: string | null | undefined): boolean {
  return String(url || "").endsWith(MARCA_ILUSTRATIVA);
}

/** Palavras do tipo de produto: sem marca, sem código de modelo, sem cor. */
export function palavrasGenericas(nome: string, marcas: string[] = []): string[] {
  const fora = new Set(marcas.map((m) => semAcento(m).replace(/[^a-z0-9]+/g, "")));
  const modelos = new Set(modelosDoNome(nome));
  return palavrasDoNome(nome).filter((p) => {
    if (fora.has(p.replace(/[^a-z0-9]/g, ""))) return false;
    if (CORES[p]) return false;
    if (modelos.has(p) && !/^(cat[5-7]e?|ps[2-5]|v8|p2|p10|4k|8k|usb3|hdmi2)$/.test(p)) return false;
    if (/^\d+$/.test(p) && p.length < 3) return false;
    return true;
  });
}

const CONECTORES = new Set(["hdmi", "vga", "dvi", "displayport", "rca", "p2", "p10", "lightning", "v8", "rj45", "sata"]);
const GENERICOS = new Set(["cat5", "cat6", "cat5e", "ps2", "ps3", "ps4", "ps5", "usb3", "hdmi2"]);

const singularIl = (p: string) => (p.length > 3 && p.endsWith("s") ? p.slice(0, -1) : p);

/**
 * 0 a 1 para foto ilustrativa:
 *  - com modelo no nome e o modelo batendo, vale (cor diferente não importa);
 *  - sem isso, o tipo (primeira palavra) precisa aparecer no achado e pelo
 *    menos metade das palavras do tipo de produto também.
 * Acessório no lugar do produto continua recusado (foto de carregador não
 * ilustra pilha).
 */
export function semelhancaIlustrativa(doFornecedor: string, achado: string, marcas: string[] = []): number {
  const primeiraAchada = semAcento(achado).split(/[^a-z0-9]+/).filter(Boolean)[0] || "";
  const palavrasForn = semAcento(doFornecedor).split(/[^a-z0-9]+/).filter(Boolean);
  if (OUTRO_TIPO.has(primeiraAchada) && !palavrasForn.includes(primeiraAchada)) return 0;

  // Conector que só o achado tem (HDMI, VGA, USB-C...) é outro produto.
  const conectores = (t: string) => new Set(semAcento(t).split(/[^a-z0-9]+/).filter((p) => CONECTORES.has(p)));
  const conForn = conectores(doFornecedor);
  for (const c of conectores(achado)) if (!conForn.has(c)) return 0;

  // O tipo (primeira palavra que diz o que é) precisa estar no começo do nome achado.
  const tipo = singularIl(palavrasForn.find((p) => p.length >= 3 && !VAZIAS.has(p)) || "");
  const inicioAchado = palavrasDoNome(achado).slice(0, 3).map(singularIl);
  if (!tipo || !inicioAchado.includes(tipo)) return 0;

  // Modelo distintivo batendo: mesma peça, talvez outra cor.
  const modelos = modelosDoNome(doFornecedor).filter((m) => m.length >= 4 && !GENERICOS.has(m));
  if (modelos.length > 0) {
    const bateu = modelos.filter((m) => temModelo(achado, m));
    if (bateu.length === modelos.length) return 0.9;
  }

  const achadas = new Set(palavrasDoNome(achado).map(singularIl));
  const genericas = palavrasGenericas(doFornecedor, marcas).map(singularIl);
  if (genericas.length === 0) return 0;
  const comuns = genericas.filter((p) => achadas.has(p)).length;
  const cobertura = comuns / genericas.length;
  return cobertura >= 0.5 ? 0.5 + cobertura * 0.4 : 0;
}

export function termoGenerico(nome: string, marcas: string[] = []): string {
  return palavrasGenericas(nome, marcas).slice(0, 4).join("-").replace(/\./g, "");
}
