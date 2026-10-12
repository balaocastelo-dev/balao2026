// ============================================================
// Conflitos de detalhe entre o nome do produto e o anúncio de onde a foto
// foi tirada. Auditoria de 12/10/2026, pedida pelo Thiago depois que o
// "Cooler para Processador Redragon Effect CC2000" (air cooler, TechSupri)
// saiu no site com a foto do "Water Cooler Redragon Effect CCW-3017 360mm".
//
// A busca de foto achava produtos "parecidos" e aceitava. A conferência foto a
// foto mostrou que o parecido quase sempre é OUTRO produto:
//   - outro tipo (water x air cooler, capa x controle, pasta térmica x adesivo);
//   - outra marca (Furukawa no cabo Exbom, Elgin na pilha Mox, Hrebos no Kaidi);
//   - outro modelo da mesma linha (KD 305 x KD 330M, MTG 098 x MTG 099);
//   - outra medida (2 m x 3 m, 20 W x 30 W, 32 GB x 128 GB);
//   - outra quantidade (2 pilhas x cartela de 4, unidade x kit);
//   - outra plataforma (Switch x Switch 2, PS4 x PS5);
//   - conector trocado (P10 fêmea/P2 macho x P10 macho/P2 fêmea).
// Regra do Thiago: a foto tem de ser do produto exato; melhor sem foto do que
// errada. Qualquer conflito destes recusa a foto.
// ============================================================

import { modelosDoNome } from "./fotos";

const semAcento = (s: unknown) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase();

/** Texto normalizado com espaço nas pontas: " cabo hdmi 2.0 3 metros ". */
function texto(t: string): string {
  return ` ${semAcento(t).replace(/(\d),(\d)/g, "$1.$2").replace(/[^a-z0-9.&]+/g, " ").replace(/\s+/g, " ").trim()} `;
}

// ---------- tipo do produto ----------

/** Grupos de palavras que dizem O QUE o produto é (sinônimos no mesmo grupo). */
const GRUPOS_DE_TIPO: string[][] = [
  ["cabo", "extensor"],
  ["adaptador", "conversor", "duplicador", "splitter", "divisor"],
  ["carregador", "fonte"],
  ["capa", "case", "capinha", "estojo", "bolsa"],
  ["pelicula"],
  ["protetor"],
  ["grip"],
  ["suporte", "base", "dock", "stand"],
  ["controle", "joystick", "gamepad"],
  ["mouse"],
  ["mousepad", "deskpad"],
  ["teclado"],
  ["fone", "headset", "headphone", "earbuds"],
  ["caixa"],
  ["pilha", "bateria"],
  ["cartucho"],
  ["toner"],
  ["tinta", "refil", "garrafa"],
  ["hub"],
  ["filtro"],
  ["cooler", "ventoinha", "fan"],
  ["pasta"],
  ["adesivo"],
  ["microfone"],
  ["webcam", "camera"],
  ["roteador", "repetidor"],
  ["antena"],
  ["balanca"],
  ["calculadora"],
  ["projetor"],
  ["cartao"],
  ["pen"],
  ["ssd"],
  ["memoria"],
  ["placa"],
  ["monitor"],
  ["chip"],
  ["tampa"],
  ["lampada"],
  ["impressora", "multifuncional"],
  ["inversor"],
  ["radio", "walkie"],
  ["relogio", "smartwatch"],
  ["boneco", "action"],
  ["jogo"],
  ["volante"],
  ["console"],
];

const TIPO_DA_PALAVRA = new Map<string, number>();
GRUPOS_DE_TIPO.forEach((grupo, i) => grupo.forEach((p) => TIPO_DA_PALAVRA.set(p, i)));

const singular = (p: string) => (p.length > 4 && p.endsWith("s") ? p.slice(0, -1) : p);

/** O primeiro tipo de produto que aparece no nome (índice do grupo), ou null. */
export function tipoDoNome(nome: string): number | null {
  const n = texto(nome).replace(/ mouse pad /g, " mousepad ").replace(/ pen drive /g, " pen ");
  for (const p of n.trim().split(" ")) {
    const g = TIPO_DA_PALAVRA.get(singular(p));
    if (g !== undefined) return g;
  }
  return null;
}

// ---------- cooler: água x ar ----------

const WATER = / (water ?cooler|watercooler|refrigeracao liquida|aio|radiador) /;

// ---------- medidas ----------

interface Medida {
  nome: string;
  re: RegExp;
}

// (?<![a-z0-9.]) impede pegar código de produto ("cf258a", "kd330m").
const MEDIDAS: Medida[] = [
  { nome: "metros", re: /(?<![a-z0-9.])(\d+(?:\.\d+)?) ?(?:m|mt|mts|metro|metros)(?![a-z0-9])/g },
  { nome: "mm", re: /(?<![a-z0-9.])(\d+(?:\.\d+)?) ?mm(?![a-z0-9])/g },
  { nome: "watts", re: /(?<![a-z0-9.])(\d+(?:\.\d+)?) ?w(?![a-z0-9])/g },
  { nome: "mah", re: /(?<![a-z0-9.])(\d+) ?mah(?![a-z0-9])/g },
  { nome: "volts", re: /(?<![a-z0-9.])(\d+(?:\.\d+)?) ?v(?![a-z0-9])/g },
  { nome: "lumens", re: /(?<![a-z0-9.])(\d+) ?lumens?(?![a-z0-9])/g },
  { nome: "ml", re: /(?<![a-z0-9.])(\d+) ?ml(?![a-z0-9])/g },
];

/** Capacidades de armazenamento em GB ("1TB" e "1000GB" contam igual). */
function capacidades(t: string): Set<string> {
  const saida = new Set<string>();
  for (const m of t.matchAll(/(?<![a-z0-9.])(\d+(?:\.\d+)?) ?(gb|tb)(?![a-z0-9])/g)) {
    saida.add(String(Number(m[1]) * (m[2] === "tb" ? 1000 : 1)));
  }
  return saida;
}

/**
 * Palavras que mudam a versão do produto: "S40" e "S40 Pro", "NV3" e "NV3 Mini",
 * "DualSense" e "DualSense Edge", "Fire TV Stick HD" e "4K".
 */
const VARIANTES = ["pro", "mini", "max", "plus", "lite", "edge", "ultra", "slim", "oled", "4k", "8k", "xl", "se", "kids", "elite", "deluxe", "gold", "premium"];

function valores(t: string, re: RegExp): Set<string> {
  const saida = new Set<string>();
  for (const m of t.matchAll(re)) saida.add(String(Number(m[1])));
  return saida;
}

// ---------- quantidade ----------

const NUMEROS: Record<string, number> = { um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, dez: 10 };

/** Quantas unidades o anúncio vende (1 quando não diz). */
export function quantidadeDoNome(nome: string): number {
  const n = texto(nome);
  const achados: number[] = [];
  const num = (s: string) => (NUMEROS[s] ?? Number(s));
  const UNIDADES = "(?:un|und|unid|unidades?|pcs|pecas?|pilhas?|baterias?|ventoinhas?|fans?|controles?|radios?|cartuchos?|cabos?|peliculas?|grips?)";
  for (const m of n.matchAll(new RegExp(` (?:c|com|kit|kit c|kit com|pack|cartela com|blister com|caixa com|conjunto c|conjunto com) (\\d+|dois|duas|tres|quatro|cinco|seis|dez) (?:[a-z]+ )?${UNIDADES}(?![a-z0-9])`, "g"))) {
    achados.push(num(m[1]));
  }
  for (const m of n.matchAll(new RegExp(` (\\d+|dois|duas|tres|quatro|cinco|seis|dez) ?${UNIDADES}(?![a-z0-9])`, "g"))) {
    achados.push(num(m[1]));
  }
  if (/ (par|pares|1 par) /.test(n)) achados.push(2);
  // "4 Suporte De Pilhas…", "2 Bateria De Lítio…": número solto no começo.
  const inicio = n.match(/^ (\d{1,2}) [a-z]/);
  if (inicio && Number(inicio[1]) > 1) achados.push(Number(inicio[1]));
  const validos = achados.filter((x) => x > 0 && x < 500);
  return validos.length ? Math.max(...validos) : 1;
}

// ---------- plataforma ----------

/** Plataformas citadas: ps2…ps5, x360, xone, xseries, sw, sw2, swlite, swoled. */
export function plataformasDoNome(nome: string): Set<string> {
  const n = texto(nome).replace(/ playstation ?(\d) /g, " ps$1 ").replace(/ play ?(\d) /g, " ps$1 ");
  const saida = new Set<string>();
  for (const m of n.matchAll(/ ps ?([2-5]) /g)) saida.add(`ps${m[1]}`);
  if (/ xbox ?360 | x360 /.test(n)) saida.add("x360");
  if (/ xbox one /.test(n)) saida.add("xone");
  if (/ (xbox )?series [xs] | xbox series /.test(n)) saida.add("xseries");
  if (/ switch /.test(n) || / nintendo /.test(n) && / (lite|oled|joy ?con) /.test(n)) {
    if (/ switch ?2 /.test(n)) saida.add("sw2");
    if (/ (switch )?lite /.test(n)) saida.add("swlite");
    if (/ oled /.test(n)) saida.add("swoled");
    if (!/ switch ?2 | lite | oled /.test(n)) saida.add("sw");
  }
  return saida;
}

// ---------- marca ----------

/** Marcas que aparecem nos fornecedores e nos anúncios de onde as fotos vêm. */
const MARCAS = [
  // grandes
  "logitech", "apple", "sony", "xiaomi", "samsung", "jbl", "dell", "hp", "lenovo", "acer", "asus", "motorola", "lg", "intelbras",
  "tramontina", "weg", "panasonic", "philips", "duracell", "microsoft", "attack shark", "8bitdo", "redragon", "havit", "sandisk",
  "kingston", "seagate", "tp link", "tplink", "edifier", "hyperx", "razer", "corsair", "amazon", "baseus", "ugreen", "multilaser",
  "epson", "canon", "brother", "positivo", "elgin", "gp", "furukawa", "orico", "vention", "comtac", "mercusys", "nintendo",
  // pequenas, comuns nos fornecedores locais
  "exbom", "knup", "kaidi", "lehmox", "tomate", "it blue", "itblue", "hmaston", "h maston", "mox", "hrebos", "xcell", "x cell",
  "altomex", "kapbom", "aitek", "sigma", "peining", "imenso", "pmcell", "sumexr", "inova", "mekede", "leininn", "pix link",
  "kenko", "maxmidia", "baofeng", "feir", "dobe", "oivo", "onikuma", "rise mode", "hayonik", "trust", "jsaux", "implastec",
  "toply", "evolut", "chinamate", "ollix", "byqualy", "masterprint", "naticon", "grasep", "joog", "revenger", "aula", "ipega",
  "infokit", "luatek", "bmax", "b max", "flex", "shinka", "storm tech", "lotus", "bringit", "bestbattery", "kokay", "pure power", "snowdog",
  "husky", "rise", "storm", "classe", "alfacell", "fortrek", "mymax", "bright", "c3tech", "c3 tech", "pcyes", "goldentec",
];

const MARCA_DA_LINHA: [RegExp, string][] = [
  [/ (playstation|dualsense|dualshock) /, "sony"],
  [/ (xbox) /, "microsoft"],
  [/ (iphone|ipad|macbook|airpods|apple watch) /, "apple"],
  [/ (galaxy) /, "samsung"],
  [/ (mi band|redmi|poco) /, "xiaomi"],
  [/ (echo dot|echo show|echo spot|echo pop|fire tv|kindle|alexa) /, "amazon"],
];

export function marcasDoNome(nome: string): Set<string> {
  const n = texto(nome);
  const saida = new Set<string>();
  // "tp link" e "tplink", "it blue" e "itblue", "h maston" e "hmaston" viram a mesma marca.
  for (const m of MARCAS) if (n.includes(` ${m} `)) saida.add(m.replace(/ /g, ""));
  for (const [re, marca] of MARCA_DA_LINHA) if (re.test(n)) saida.add(marca);
  if (saida.has("rise") || saida.has("risemode")) {
    saida.delete("rise");
    saida.add("risemode");
  }
  saida.delete("storm"); // "storm" sozinho é nome de produto (Rise Mode Storm), não marca
  return saida;
}

// ---------- modelo da mesma linha ----------

/** Códigos letra+número do nome, juntos: "KD 305" -> "kd305", "MTG-098" -> "mtg098". */
function codigos(nome: string): string[] {
  const n = semAcento(nome).replace(/([a-z]{2,5})[ -]?(\d{2,5})/g, "$1$2");
  return modelosDoNome(n).filter((m) => /^[a-z]{2,5}\d{2,5}[a-z]?$/.test(m));
}

// ---------- conectores (macho/fêmea) ----------

function pontas(nome: string): Set<string> {
  const n = texto(nome).replace(/ tipo c /g, " usbc ").replace(/ type c /g, " usbc ").replace(/ usb c /g, " usbc ");
  const saida = new Set<string>();
  for (const m of n.replace(/ dvi [di] /g, " dvi ").matchAll(/ (hdmi|vga|dvi|displayport|p2|p3|p10|rca|usbc|usb|lightning|rj45) (macho|femea) /g)) {
    saida.add(`${m[1]}:${m[2]}`);
  }
  return saida;
}

// ---------- cor ----------

const COR_DA_PALAVRA: Record<string, string> = {
  preto: "preto", preta: "preto", black: "preto", branco: "branco", branca: "branco", white: "branco",
  azul: "azul", blue: "azul", vermelho: "vermelho", vermelha: "vermelho", red: "vermelho", rosa: "rosa", pink: "rosa",
  roxo: "roxo", roxa: "roxo", purple: "roxo", lilas: "roxo", verde: "verde", green: "verde", cinza: "cinza", gray: "cinza",
  grey: "cinza", grafite: "cinza", prata: "prata", silver: "prata", dourado: "dourado", dourada: "dourado", gold: "dourado",
  amarelo: "amarelo", amarela: "amarelo", yellow: "amarelo", laranja: "laranja", orange: "laranja",
  camuflado: "camuflado", camuflada: "camuflado", camo: "camuflado", bege: "bege", marrom: "marrom",
};

function coresDoTexto(n: string): Set<string> {
  const saida = new Set<string>();
  for (const p of n.trim().split(" ")) if (COR_DA_PALAVRA[p]) saida.add(COR_DA_PALAVRA[p]);
  return saida;
}

// ---------- tudo junto ----------

/**
 * Motivo pelo qual a foto do anúncio `achado` NÃO serve para o produto
 * `doFornecedor`, ou null quando nada se contradiz.
 */
export function conflitoDeDetalhe(doFornecedor: string, achado: string): string | null {
  const a = texto(doFornecedor);
  const b = texto(achado);

  const tipoA = tipoDoNome(doFornecedor);
  const tipoB = tipoDoNome(achado);
  const SUPRIMENTO = / (cartucho|cartuchos|tinta|tintas|refil|toner|garrafa) /;
  const doisSuprimentos = SUPRIMENTO.test(a) && SUPRIMENTO.test(b);
  if (!doisSuprimentos && tipoA !== null && tipoB !== null && tipoA !== tipoB) return "outro tipo de produto";

  if (/ cooler /.test(a + b) && WATER.test(a) !== WATER.test(b)) return "water cooler x air cooler";

  for (const { nome, re } of MEDIDAS) {
    const va = valores(a, re);
    const vb = valores(b, re);
    if (va.size && vb.size && ![...va].some((v) => vb.has(v))) return `medida diferente (${nome})`;
  }

  const ga1 = capacidades(a);
  const gb1 = capacidades(b);
  if (ga1.size && gb1.size && ![...ga1].some((v) => gb1.has(v))) return "capacidade diferente";

  if (quantidadeDoNome(doFornecedor) !== quantidadeDoNome(achado)) return "quantidade diferente";

  // Versão: a palavra (Pro, Mini, Edge, 4K…) tem de estar nos dois ou em nenhum.
  // Suprimento fica de fora: "XL" de cartucho já tem regra própria.
  if (!doisSuprimentos) {
    for (const v of VARIANTES) {
      if (a.includes(` ${v} `) !== b.includes(` ${v} `)) return `outra versão (${v})`;
    }
  }

  const pa = plataformasDoNome(doFornecedor);
  const pb = plataformasDoNome(achado);
  if (pa.size && pb.size && ![...pa].some((p) => pb.has(p))) return "outra plataforma";

  const ma = marcasDoNome(doFornecedor);
  const mb = marcasDoNome(achado);
  // Todas as marcas do nome têm de estar no anúncio da foto ("Toner Brother
  // ... Evolut" não pega foto de toner Brother de outro fabricante).
  if (ma.size && ![...ma].every((m) => mb.has(m))) return [...mb].some((m) => !ma.has(m)) ? "outra marca" : "marca não confirmada";
  if (!ma.size && mb.size) {
    // Produto sem marca no nome não pega foto de produto de marca conhecida.
    return "foto de produto de marca";
  }

  const ca = codigos(doFornecedor);
  const cb = codigos(achado);
  const bate = (x: string, y: string) => x === y || x.startsWith(y) || y.startsWith(x);
  if (ca.length && !ca.some((c) => cb.some((d) => bate(c, d)))) {
    for (const codigo of ca) {
      const prefixo = codigo.match(/^[a-z]+/)![0];
      if (cb.some((c) => c.startsWith(prefixo) && /^\d/.test(c.slice(prefixo.length)))) return `outro modelo (${codigo})`;
    }
  }

  // Cor: se o nome diz a cor, o anúncio da foto tem de dizer a mesma.
  // (Suprimento tem regra própria de cor em suprimentoConfere.)
  if (!doisSuprimentos) {
    const ka = coresDoTexto(a);
    const kb = coresDoTexto(b);
    if (ka.size && (!kb.size || ![...ka].some((c) => kb.has(c)))) return "cor diferente ou não confirmada";
  }

  const ga = pontas(doFornecedor);
  const gb = pontas(achado);
  if (ga.size >= 2 && gb.size >= 2 && [...ga].some((g) => !gb.has(g))) return "conectores trocados";

  return null;
}
