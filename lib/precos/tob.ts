// ============================================================
// Fornecedor local TOB Distribuição (catálogo do representante, ex.:
// https://catalogotob.tobdistribuicao.com.br/c/julianacambui).
//
// Pedido do Thiago em 13/10: fornecedor local, com a faixa PRONTA ENTREGA e
// margem configurável por categoria, igual aos da Kyte.
//
// Diferente da Kyte, este catálogo NÃO recusa servidores: a página chama uma
// função pública (POST /api/apps/<app>/functions/getCatalog {slug}) que
// devolve o catálogo inteiro em JSON (representante, 25 categorias e ~1.070
// produtos com preço, estoque e foto). Então a TOB é lida pelo agendador do
// site, uma vez por dia, como a KaBuM! — sem precisar do Chrome da loja.
//
// O preço do catálogo é o do representante: base_price × (1 + margem dele).
// A margem do representante "julianacambui" é 0%, e a margem do Balão vem por
// cima, pelo painel (Preços por fonte > Margem por categoria).
//
// Funções puras (testadas em __tests__/lib/tob.test.ts), menos lerCatalogoTob.
// ============================================================

import type { ItemDeOrigem } from "./kabum";
import { ehCartuchoCompativel } from "./techsupri";

export const SITE_TOB = "tob";
export const PREFIXO_TOB = "tob-";
export const HOST_TOB = "catalogotob.tobdistribuicao.com.br";
/** Aplicativo do catálogo (Base44). Conferido em 13/10 na página do catálogo. */
export const APP_TOB = "6a8cac9fe8865c46b84db6b6";

export interface RepresentanteTob {
  id?: string;
  name?: string;
  commercial_name?: string;
  slug?: string;
  margin_percent?: number | null;
  product_margins?: Record<string, number | string> | null;
  show_prices?: boolean;
  status?: string;
}

export interface CategoriaTob {
  id: string;
  name: string;
  slug?: string;
}

export interface ProdutoTob {
  id: string;
  sku?: string | null;
  description?: string | null;
  base_price?: number | null;
  stock?: number | null;
  status?: string | null;
  category_id?: string | null;
  photo?: string | null;
  specifications?: string | null;
  not_in_last_import?: boolean | null;
}

export interface CatalogoTob {
  rep: RepresentanteTob | null;
  categories: CategoriaTob[];
  products: ProdutoTob[];
}

const semAcento = (s: unknown) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase();

// ---------- link ----------

export interface LinkDaTob {
  plataforma: "tob";
  host: string;
  slug: string;
  url: string;
  /** Caminho gravado na fonte: identifica o catálogo (host + representante). */
  caminho: string;
  nomeSugerido: string;
}

/** Reconhece o link do catálogo da TOB (com ou sem ?cat=…). */
export function identificarLinkTob(texto: string): LinkDaTob | null {
  let url: URL;
  try {
    url = new URL(String(texto || "").trim().replace(/^(?!https?:\/\/)/i, "https://"));
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (host !== HOST_TOB) return null;
  const m = url.pathname.match(/^\/c\/([A-Za-z0-9_-]{2,60})\/?$/);
  if (!m) return null;
  const slug = m[1].toLowerCase();
  return {
    plataforma: "tob",
    host,
    slug,
    url: `https://${host}/c/${slug}`,
    caminho: `${host}/c/${slug}`,
    nomeSugerido: "TOB Distribuição",
  };
}

/** O representante (slug) gravado no caminho da fonte. */
export function slugDoCaminho(caminho: string): string | null {
  const m = String(caminho || "").match(/\/c\/([a-z0-9_-]{2,60})$/i);
  return m ? m[1].toLowerCase() : null;
}

// ---------- leitura ----------

export type LeituraDaTob =
  | { ok: true; catalogo: CatalogoTob }
  | { ok: false; motivo: "bloqueado" | "sem_dados" | "rede"; detalhe: string };

/** Lê o catálogo inteiro do representante (uma chamada, ~5 MB). */
export async function lerCatalogoTob(slug: string, buscar: typeof fetch = fetch): Promise<LeituraDaTob> {
  let resposta: Response;
  try {
    resposta = await buscar(`https://${HOST_TOB}/api/apps/${APP_TOB}/functions/getCatalog`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ slug }),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
  } catch (erro) {
    return { ok: false, motivo: "rede", detalhe: String((erro as Error)?.message || erro) };
  }
  if (resposta.status === 403 || resposta.status === 429) {
    return { ok: false, motivo: "bloqueado", detalhe: `HTTP ${resposta.status}` };
  }
  if (!resposta.ok) return { ok: false, motivo: "rede", detalhe: `HTTP ${resposta.status}` };
  let dados: Partial<CatalogoTob> & { error?: unknown };
  try {
    dados = await resposta.json();
  } catch {
    return { ok: false, motivo: "sem_dados", detalhe: "a resposta não é JSON" };
  }
  if (!dados || dados.error || !Array.isArray(dados.products)) {
    return { ok: false, motivo: "sem_dados", detalhe: dados?.error ? String(dados.error) : "catálogo sem produtos" };
  }
  return {
    ok: true,
    catalogo: {
      rep: dados.rep || null,
      categories: Array.isArray(dados.categories) ? dados.categories : [],
      products: dados.products,
    },
  };
}

// ---------- produto ----------

/** Desfaz entidades HTML que vêm nos nomes ("7&amp;Z"). */
function textoLimpo(s: unknown): string {
  return String(s ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .replace(/[.\s]+$/, "")
    .trim();
}

/** O preço que o representante mostra (base × margem dele). */
export function precoDaTob(p: ProdutoTob, rep: RepresentanteTob | null): number {
  const base = Number(p.base_price) || 0;
  if (!(base > 0)) return 0;
  const porProduto = rep?.product_margins && p.sku ? rep.product_margins[p.sku] : undefined;
  const margem = porProduto != null && porProduto !== "" ? Number(porProduto) || 0 : Number(rep?.margin_percent) || 0;
  return Math.round(base * (1 + margem / 100) * 100) / 100;
}

const MARCAS_CONHECIDAS: [RegExp, string][] = [
  [/\btob\b/, "TOB"],
  [/\bk ?-?mex\b/, "K-Mex"],
  [/\bduex\b/, "Duex"],
  [/\bknup\b/, "Knup"],
  [/\bgoldentec\b/, "Goldentec"],
  [/\bmotorola\b/, "Motorola"],
  [/\bbrazil ?pc\b/, "Brazil PC"],
  [/\bvinik\b/, "Vinik"],
  [/\bmdx\b/, "MDX"],
  [/\btanca\b/, "Tanca"],
  [/\bvx ?pro\b/, "VXPro"],
  [/\btronos\b/, "Tronos"],
  [/\bhayom\b/, "Hayom"],
  [/\bgigabyte\b/, "Gigabyte"],
  [/\basus\b/, "Asus"],
  [/\bmsi\b/, "MSI"],
  [/\bseagate\b/, "Seagate"],
  [/\bkingston\b/, "Kingston"],
  [/\bpatriot\b/, "Patriot"],
  [/\bbrother\b/, "Brother"],
  [/\bepson\b/, "Epson"],
  [/\bragtech\b/, "Ragtech"],
  [/\bintelbras\b/, "Intelbras"],
  [/\baitek\b/, "Aitek"],
  [/\brevenger\b/, "Revenger"],
  [/\bredragon\b/, "Redragon"],
  [/\bamd\b|\bryzen\b/, "AMD"],
  [/\bintel\b/, "Intel"],
];

/** Marca pelo nome; computador montado é da TOB mesmo com processador Intel/AMD. */
export function marcaDaTob(nome: string): string | null {
  const n = ` ${semAcento(nome).replace(/[^a-z0-9]+/g, " ")} `;
  if (/ toner | tinta /.test(n)) {
    // Suprimento: a marca é do fabricante do suprimento, não a da impressora.
    return null;
  }
  for (const [re, marca] of MARCAS_CONHECIDAS) if (re.test(n)) return marca;
  return null;
}

/** Categoria do site para o produto da TOB (categoria dela + nome). */
export function categoriaDaTob(nome: string, categoriaTob: string | null | undefined): string {
  const n = ` ${semAcento(nome).replace(/[^a-z0-9.+ -]+/g, " ").replace(/\s+/g, " ")} `;
  const c = semAcento(categoriaTob).trim();

  // Regras pelo nome que valem em qualquer categoria da TOB.
  if (/ mochila /.test(n)) return "Informática/Acessórios";
  if (/ fonte universal notebook | fonte (para )?notebook /.test(n)) return "Energia/Fontes para Notebook";

  switch (c) {
    case "computadores":
      if (/ all in one /.test(n)) return "Computadores/PC/Computador All in One";
      if (/ gamer /.test(n)) return "Computadores/PC/PC Gamer/PC Gamer Completo";
      if (/ mini pc | slim /.test(n)) return "Computadores/PC/Computador Mini PC";
      return "Computadores/PC/Computador Desktop";
    case "automacao/pdv":
      if (/ leitor /.test(n)) return "Automação Comercial/Leitor de Código de Barras";
      if (/ impressora /.test(n)) return "Automação Comercial/Impressora Térmica";
      if (/ gaveta /.test(n)) return "Automação Comercial/Gaveta de Dinheiro";
      if (/ balanca /.test(n)) return "Automação Comercial/Balança";
      if (/ all in one | pdv /.test(n)) return "Automação Comercial/PDV e All in One";
      return "Automação Comercial/Acessórios";
    case "kit upgrade":
      return "Hardware/Kit Hardware/Kit Upgrade";
    case "placa-mae":
      return / amd | am4 | am5 | ryzen | a320 | a520 | b450 | b550 | b650 | x570 /.test(n)
        ? "Hardware/Placas-mãe/Placa-Mãe AMD"
        : "Hardware/Placas-mãe/Placa-Mãe Intel";
    case "memoria ram":
      if (/ ddr5 /.test(n)) return "Hardware/Memória RAM/DDR 5";
      if (/ ddr3 /.test(n)) return "Hardware/Memória RAM/DDR 3";
      return "Hardware/Memória RAM/DDR 4";
    case "processador":
      return / amd | ryzen | athlon /.test(n) ? "Hardware/Processadores/Processador AMD" : "Hardware/Processadores/Processador Intel";
    case "ssd/m.2":
      return / nvme | m\.2 | m2 | pcie /.test(n) ? "Hardware/SSD/SSD PCIe NVMe" : "Hardware/SSD/SSD SATA";
    case "disco rigido":
      return / externo /.test(n) ? "Hardware/Disco Rígido (HD)/Pessoal/Externo" : "Hardware/Disco Rígido (HD)/Pessoal/Interno";
    case "fonte":
      return "Hardware/Fontes";
    case "teclados/mouses":
      if (/ kit /.test(n) || (/ teclado /.test(n) && / mouse /.test(n))) return "Periféricos/Kit Teclado e Mouse";
      if (/ mouse pad | mousepad /.test(n)) return "Periféricos/Mouse Pad";
      if (/ mouse /.test(n)) return "Periféricos/Mouses";
      if (/ teclado /.test(n)) return "Periféricos/Teclados";
      return "Periféricos/Acessórios";
    case "cooler":
      if (/ water ?cooler /.test(n)) return "Hardware/Coolers/Water Cooler";
      if (/ fan | ventoinha /.test(n) && !/ processador /.test(n)) return "Hardware/Coolers/FAN";
      return "Hardware/Coolers/Air Cooler";
    case "gabinete":
      return "Hardware/Gabinetes";
    case "placa de video":
      return / radeon | amd | rx ?\d/.test(n) ? "Hardware/Placa de vídeo (VGA)/Placa de vídeo AMD" : "Hardware/Placa de vídeo (VGA)/Placa de vídeo Nvidia";
    case "monitor":
      return / gamer | 144 ?hz | 165 ?hz | 180 ?hz | 240 ?hz /.test(n) ? "Computadores/Monitores/Monitor Gamer" : "Computadores/Monitores/Monitor Office";
    case "seguranca":
      if (/ dvr | nvr /.test(n)) return "Segurança/DVR e NVR";
      if (/ kit /.test(n)) return "Segurança/Kit CFTV";
      if (/ camera /.test(n)) return "Segurança/Câmeras";
      return "Segurança/Acessórios";
    case "headset":
      if (/ headset /.test(n)) return "Periféricos/Headset";
      if (/ bluetooth | sem fio | tws /.test(n)) return "Áudio/Fone de Ouvido/Bluetooth";
      return "Áudio/Fone de Ouvido/Fone de Ouvido com Fio";
    case "notebook":
      return "Computadores/Notebooks";
    case "projetores":
      return "Eletrônicos/Projetores";
    case "rede":
      if (/ switch /.test(n)) return "Conectividade/Switch";
      if (/ cabo /.test(n)) return "Conectividade/Cabo de Rede";
      if (/ roteador /.test(n)) return "Conectividade/Dispositivo de Rede/Roteador";
      return "Conectividade/Dispositivo de Rede";
    case "cabos":
      return "Informática/Cabos e Adaptadores";
    case "acessorios":
      if (/ joystick | controle /.test(n)) return "Games/Acessórios Gamer";
      return "Informática/Acessórios";
    case "cadeiras":
      return / gamer /.test(n) ? "Espaço Gamer/Cadeiras Gamer/Mais Marcas" : "Escritório/Home Office/Cadeira de Escritório";
    case "impressoras":
      if (/ toner /.test(n)) return "Impressão/Toners";
      if (/ tinta | cartucho /.test(n)) return "Impressão/Tintas e Cartuchos";
      return "Impressão/Impressoras";
    case "energia":
      if (/ nobreak /.test(n)) return "Energia/Protetor Eletrônico/Nobreak";
      if (/ estabilizador /.test(n)) return / bivolt /.test(n) ? "Energia/Estabilizadores de Energia/Estabilizador Bivolt" : "Energia/Estabilizadores de Energia/Estabilizador Mono";
      if (/ filtro de linha /.test(n)) return "Energia/Protetor Eletrônico/Filtro de Linha";
      return "Energia/Acessórios";
    case "caixa de som":
      return "Áudio/Caixa de Som";
    default:
      return "Informática/Acessórios";
  }
}

export interface OpcoesDaTob {
  prefixo: string;
  vendedor: string;
  urlDoCatalogo: string;
  usarFotoDoFornecedor: boolean;
}

/** Produto da TOB no formato do resto do sistema de preços. */
export function paraItemTob(
  p: ProdutoTob,
  categorias: Map<string, string>,
  rep: RepresentanteTob | null,
  opcoes: OpcoesDaTob,
  codigo?: string
): ItemDeOrigem | null {
  const id = String(p?.id || "").trim();
  const sku = String(p?.sku || "").trim();
  const nome = textoLimpo(p?.description);
  if (!id || !nome || !/^[A-Za-z0-9-]{1,60}$/.test(sku || id)) return null;
  if (ehCartuchoCompativel(nome)) return null;
  const preco = precoDaTob(p, rep);
  const foto = opcoes.usarFotoDoFornecedor && /^https:\/\//.test(String(p.photo || "")) ? String(p.photo) : "";
  const estoque = Number(p.stock);
  return {
    codigo: codigo || `${opcoes.prefixo}${sku || id}`,
    nome,
    marca: marcaDaTob(nome),
    categoria: categoriaDaTob(nome, categorias.get(String(p.category_id || "")) || null),
    vendedor: opcoes.vendedor,
    marketplace: false,
    openbox: false,
    preVenda: false,
    disponivel:
      preco > 0 &&
      (p.status == null || p.status === "active") &&
      !p.not_in_last_import &&
      (p.stock == null || !Number.isFinite(estoque) || estoque > 0),
    pix: preco,
    cartao: preco,
    parcelas: 0,
    oferta: null,
    url: opcoes.urlDoCatalogo,
    foto,
    fotos: foto ? [foto] : [],
    garantia: null,
  };
}

/** O catálogo inteiro em itens; SKU repetido ganha o id no código. */
export function itensDaTob(catalogo: CatalogoTob, opcoes: OpcoesDaTob): ItemDeOrigem[] {
  const categorias = new Map(catalogo.categories.map((c) => [String(c.id), String(c.name || "")]));
  const usados = new Set<string>();
  const saida: ItemDeOrigem[] = [];
  for (const p of catalogo.products) {
    const sku = String(p?.sku || "").trim();
    let codigo = `${opcoes.prefixo}${sku || String(p?.id || "").trim()}`;
    if (usados.has(codigo)) codigo = `${codigo}-${String(p?.id || "").slice(-6)}`;
    const item = paraItemTob(p, categorias, catalogo.rep, opcoes, codigo);
    if (!item) continue;
    usados.add(item.codigo);
    saida.push(item);
  }
  return saida;
}
