// ============================================================
// Leitura de uma categoria da KaBuM!.
//
// A página de categoria já traz os produtos dentro do
// <script id="__NEXT_DATA__"> — não precisa de navegador nem de JavaScript,
// um GET simples devolve tudo.
//
// Regras de convivência, para a leitura durar:
//  - uma página por vez, com pausa entre elas;
//  - nunca usar `sort=`: o robots.txt deles veda as URLs ordenadas;
//  - 403 ou 429 é "pare": a função devolve `bloqueado` e quem chama NÃO
//    insiste nem tenta contornar.
// ============================================================

import { lerParcelas } from "./calculo";

export const HOSTS_KABUM = new Set(["www.kabum.com.br", "kabum.com.br"]);
export const ITENS_POR_PAGINA = 100;

const FILTRO_SO_KABUM = Buffer.from(JSON.stringify({ kabum_product: ["true"] })).toString("base64");

const CABECALHOS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml",
  "accept-language": "pt-BR,pt;q=0.9",
};

export interface ItemDeOrigem {
  codigo: string;
  nome: string;
  marca: string | null;
  /** Caminho de categoria como a fonte escreve: "Hardware/SSD/SSD NVMe". */
  categoria: string;
  vendedor: string | null;
  marketplace: boolean;
  openbox: boolean;
  preVenda: boolean;
  disponivel: boolean;
  pix: number;
  cartao: number;
  parcelas: number;
  oferta: string | null;
  url: string;
  foto: string;
  fotos: string[];
  garantia: string | null;
}

export interface PaginaDeOrigem {
  itens: ItemDeOrigem[];
  totalDePaginas: number;
  anunciado: number | null;
  /** Trilha da categoria na fonte: "Computadores/PC/PC Gamer". */
  trilha: string;
}

export type ResultadoDaLeitura =
  | { ok: true; pagina: PaginaDeOrigem }
  | { ok: false; motivo: "bloqueado" | "sem_dados" | "rede" | "link_invalido"; detalhe: string };

// ---------- link ----------

export interface LinkDeCategoria {
  caminho: string;
  /** O link já veio com o filtro "vendido pela KaBuM!" marcado? */
  soLojaNoLink: boolean;
}

/**
 * Aceita o link que o Thiago cola no painel e devolve só o que interessa: o
 * caminho da categoria. Parâmetros de página, ordenação e rastreio caem fora.
 */
export function interpretarLinkKabum(entrada: string): LinkDeCategoria | null {
  const texto = String(entrada || "").trim();
  if (!texto) return null;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(texto) ? texto : `https://${texto}`);
  } catch {
    return null;
  }
  if (!HOSTS_KABUM.has(url.hostname.toLowerCase())) return null;

  const caminho = url.pathname
    .split("/")
    .map((p) => p.trim())
    .filter(Boolean)
    .join("/");

  // Página de produto, busca, carrinho e afins não são categoria.
  if (!caminho || !/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(caminho)) return null;
  if (/^(produto|busca|carrinho|precarrinho|login|minha-conta|hotsite|promocao|mundos|cadastro)(\/|$)/.test(caminho)) {
    return null;
  }

  let soLojaNoLink = false;
  const filtros = url.searchParams.get("facet_filters");
  if (filtros) {
    try {
      const lido = JSON.parse(Buffer.from(filtros, "base64").toString("utf8"));
      soLojaNoLink = Array.isArray(lido?.kabum_product) && lido.kabum_product.map(String).includes("true");
    } catch {
      soLojaNoLink = false;
    }
  }

  return { caminho, soLojaNoLink };
}

export function montarUrlDaCategoria(caminho: string, soLoja: boolean, pagina: number): string {
  const q = new URLSearchParams({ page_number: String(pagina), page_size: String(ITENS_POR_PAGINA) });
  if (soLoja) q.set("facet_filters", FILTRO_SO_KABUM);
  return `https://www.kabum.com.br/${caminho}?${q.toString()}`;
}

// ---------- preço ----------

interface OfertaCrua {
  name?: string;
  price?: number;
  priceWithDiscount?: number;
  startsAt?: number;
  endsAt?: number;
}

/**
 * O preço que a KaBuM! realmente está cobrando.
 *
 * Com oferta vigente, vale o preço da oferta — é o que aparece na página e o
 * que a loja paga se comprar agora. O preço "de tabela" (`price`) continua no
 * payload e é mais alto; usá-lo deixaria o site caro sem motivo. O preço Prime
 * fica de fora: depende de assinatura.
 */
export function precosDaKabum(
  p: { price?: number; priceWithDiscount?: number; offer?: OfertaCrua | null },
  agoraEmSegundos = Date.now() / 1000
): { pix: number; cartao: number; oferta: string | null } {
  const o = p.offer;
  const vigente =
    !!o &&
    Number(o.price) > 0 &&
    Number(o.priceWithDiscount) > 0 &&
    (!o.startsAt || o.startsAt <= agoraEmSegundos) &&
    (!o.endsAt || o.endsAt >= agoraEmSegundos);

  if (vigente) {
    return { pix: Number(o!.priceWithDiscount), cartao: Number(o!.price), oferta: o!.name || "oferta" };
  }
  const cartao = Number(p.price) || 0;
  const pix = Number(p.priceWithDiscount) || cartao;
  return { pix, cartao: cartao || pix, oferta: null };
}

// ---------- página ----------

/** O que interessa do produto como a KaBuM! o entrega (o payload tem dezenas de campos). */
interface ProdutoCru {
  code?: number | string;
  name?: string;
  friendlyName?: string;
  sellerName?: string;
  category?: string;
  manufacturer?: { name?: string } | null;
  image?: string;
  images?: unknown[];
  price?: number;
  priceWithDiscount?: number;
  maxInstallment?: string;
  available?: boolean;
  warranty?: string;
  offer?: OfertaCrua | null;
  flags?: { isMarketplace?: boolean; isOpenbox?: boolean; isPreOrder?: boolean } | null;
}

interface CatalogoCru {
  data?: ProdutoCru[];
  meta?: { breadcrumb?: { name?: string }[]; totalPagesCount?: number; totalItemsCount?: number } | null;
}

function extrairCatalogo(html: string): CatalogoCru | null {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  try {
    let dados = JSON.parse(m[1])?.props?.pageProps?.data;
    if (typeof dados === "string") dados = JSON.parse(dados);
    return (dados?.catalogServer as CatalogoCru) || null;
  } catch {
    return null;
  }
}

function paraItem(p: ProdutoCru, agoraEmSegundos: number): ItemDeOrigem | null {
  const codigo = p?.code;
  const nome = typeof p?.name === "string" ? p.name.trim() : "";
  if (!codigo || !nome) return null;

  const { pix, cartao, oferta } = precosDaKabum(p, agoraEmSegundos);
  const fotos = Array.isArray(p.images) ? p.images.filter((u): u is string => typeof u === "string").slice(0, 6) : [];

  return {
    codigo: String(codigo),
    nome,
    marca: p.manufacturer?.name ? String(p.manufacturer.name).trim() : null,
    categoria: typeof p.category === "string" ? p.category : "",
    vendedor: p.sellerName ? String(p.sellerName).trim() : null,
    marketplace: !!p.flags?.isMarketplace,
    openbox: !!p.flags?.isOpenbox,
    preVenda: !!p.flags?.isPreOrder,
    disponivel: !!p.available,
    pix,
    cartao,
    parcelas: lerParcelas(p.maxInstallment),
    oferta,
    url: `https://www.kabum.com.br/produto/${codigo}/${p.friendlyName || ""}`.replace(/\/$/, ""),
    foto: typeof p.image === "string" ? p.image : fotos[0] || "",
    fotos,
    garantia: p.warranty ? String(p.warranty) : null,
  };
}

/** Transforma o HTML de uma página de categoria em itens. Separado para teste. */
export function interpretarPagina(html: string, agoraEmSegundos = Date.now() / 1000): PaginaDeOrigem | null {
  const catalogo = extrairCatalogo(html);
  if (!catalogo || !Array.isArray(catalogo.data)) return null;

  const itens: ItemDeOrigem[] = [];
  for (const cru of catalogo.data) {
    const item = paraItem(cru, agoraEmSegundos);
    if (item) itens.push(item);
  }

  const trilha = Array.isArray(catalogo.meta?.breadcrumb)
    ? catalogo.meta.breadcrumb.map((b) => String(b?.name || "").trim()).filter(Boolean).join("/")
    : "";

  return {
    itens,
    totalDePaginas: Math.max(1, Number(catalogo.meta?.totalPagesCount) || 1),
    anunciado: Number.isFinite(Number(catalogo.meta?.totalItemsCount)) ? Number(catalogo.meta?.totalItemsCount) : null,
    trilha,
  };
}

export async function lerPaginaDaCategoria(
  caminho: string,
  soLoja: boolean,
  pagina: number,
  buscar: typeof fetch = fetch
): Promise<ResultadoDaLeitura> {
  if (!/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(caminho)) {
    return { ok: false, motivo: "link_invalido", detalhe: caminho };
  }

  const url = montarUrlDaCategoria(caminho, soLoja, pagina);
  try {
    const resposta = await buscar(url, {
      headers: CABECALHOS,
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });

    if (resposta.status === 403 || resposta.status === 429) {
      return { ok: false, motivo: "bloqueado", detalhe: `a KaBuM! respondeu ${resposta.status}` };
    }
    if (!resposta.ok) {
      return { ok: false, motivo: "rede", detalhe: `a KaBuM! respondeu ${resposta.status}` };
    }

    const lida = interpretarPagina(await resposta.text());
    if (!lida) {
      return { ok: false, motivo: "sem_dados", detalhe: "a página veio sem a lista de produtos" };
    }
    return { ok: true, pagina: lida };
  } catch (erro) {
    return { ok: false, motivo: "rede", detalhe: String((erro as Error)?.message || erro) };
  }
}
