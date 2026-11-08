// ============================================================
// Consignados — vitrine dos aparelhos usados que os clientes deixaram na loja
// em consignação (pedido do Thiago, 28/10/2026). Giro rápido: entram, aparecem
// no site e saem.
//
// Os dados vêm do MEU BLING (ERP próprio, em www.balao.info/sistema), pelas
// rotas públicas, sem senha:
//   GET {base}/api/v1/publico/consignados           → { data: ItemConsignado[] }
//   GET {base}/api/v1/publico/consignados/{numero}  → ItemConsignado (404 = vendido)
//
// A base é o destino real do rewrite /sistema em next.config.ts (a VPS), para
// o servidor da Vercel não dar a volta por www.balao.info. Dá para trocar
// pela variável MEU_BLING_URL_PUBLICA.
//
// Se o MEU BLING estiver fora do ar (ou a rota ainda não existir), tudo aqui
// devolve lista vazia / null: a página mostra o aviso de "novos consignados
// chegam toda semana" e o build nunca quebra.
// ============================================================

import { SITE_CONFIG } from "@/lib/config";

export const BASE_PADRAO_DO_MEU_BLING = "https://srv1963897.hstgr.cloud/sistema";

/** Tempo máximo esperando o MEU BLING antes de desistir e mostrar a página vazia. */
const TEMPO_LIMITE_MS = 5000;

/** De quanto em quanto tempo (segundos) a vitrine é refeita. */
export const REVALIDAR_CONSIGNADOS = 120;

export const TIPOS_DE_CONSIGNADO = ["NOTEBOOK", "PC", "PC_GAMER", "CELULAR", "TABLET", "GAMES", "MONITOR", "OUTRO"] as const;
export type TipoDeConsignado = (typeof TIPOS_DE_CONSIGNADO)[number];

export const ROTULO_DO_TIPO: Record<TipoDeConsignado, string> = {
  NOTEBOOK: "Notebooks",
  PC: "PCs",
  PC_GAMER: "PC Gamer",
  CELULAR: "Celulares",
  TABLET: "Tablets",
  GAMES: "Games",
  MONITOR: "Monitores",
  OUTRO: "Outros",
};

export interface ItemConsignado {
  numero: number;
  slug: string;
  titulo: string;
  tipo: TipoDeConsignado;
  marca: string | null;
  modelo: string | null;
  estado: string | null;
  acessorios: string | null;
  detalhes: string | null;
  preco: number;
  codigo: string;
  destaque: boolean;
  novidade: boolean;
  desde: string;
  fotos: string[];
  garantia: string;
}

export function baseDoMeuBling(): string {
  const env = process.env.MEU_BLING_URL_PUBLICA?.trim();
  return (env || BASE_PADRAO_DO_MEU_BLING).replace(/\/+$/, "");
}

/** "macbook-air-m1-8gb-c12" → 12. Devolve null quando o final não é "-c<numero>". */
export function numeroDoSlug(slug: string): number | null {
  const achado = /(?:^|-)c(\d+)$/i.exec(slug.trim());
  if (!achado) return null;
  const n = Number(achado[1]);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

/** 1234.56 → "R$ 1.234,56". */
export function formatarPreco(valor: number): string {
  return valor
    .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    .replace(/ /g, " ");
}

export function hrefDoConsignado(item: Pick<ItemConsignado, "slug">): string {
  return `/consignados/${item.slug}`;
}

export function urlDoConsignado(item: Pick<ItemConsignado, "slug">): string {
  return `https://www.balao.info${hrefDoConsignado(item)}`;
}

/** Destaques primeiro; depois os que chegaram por último. */
export function ordenarConsignados(itens: ItemConsignado[]): ItemConsignado[] {
  return [...itens].sort((a, b) => {
    if (a.destaque !== b.destaque) return a.destaque ? -1 : 1;
    return (Date.parse(b.desde) || 0) - (Date.parse(a.desde) || 0);
  });
}

/** Mensagem pronta para o WhatsApp da loja quando o cliente aperta "Quero este". */
export function mensagemDoConsignado(item: Pick<ItemConsignado, "titulo" | "codigo" | "slug">): string {
  return `Olá! Quero o consignado *${item.titulo}* (código ${item.codigo}) que vi no site: ${urlDoConsignado(item)}`;
}

export function linkDoWhatsAppDoConsignado(item: Pick<ItemConsignado, "titulo" | "codigo" | "slug">): string {
  return `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(mensagemDoConsignado(item))}`;
}

// ---------------------------------------------------------------- leitura

const texto = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);

/** Confere o que veio do MEU BLING; item sem o mínimo (número, slug, título, preço) fica de fora. */
export function normalizarItem(bruto: unknown): ItemConsignado | null {
  if (!bruto || typeof bruto !== "object") return null;
  const r = bruto as Record<string, unknown>;
  const numero = Number(r.numero);
  const preco = Number(r.preco);
  const slug = texto(r.slug);
  const titulo = texto(r.titulo);
  if (!Number.isSafeInteger(numero) || numero <= 0 || !slug || !titulo || !Number.isFinite(preco) || preco <= 0) return null;
  const tipo = TIPOS_DE_CONSIGNADO.includes(r.tipo as TipoDeConsignado) ? (r.tipo as TipoDeConsignado) : "OUTRO";
  const fotos = Array.isArray(r.fotos) ? r.fotos.filter((f): f is string => typeof f === "string" && /^https:\/\//i.test(f)) : [];
  return {
    numero,
    slug,
    titulo,
    tipo,
    marca: texto(r.marca),
    modelo: texto(r.modelo),
    estado: texto(r.estado),
    acessorios: texto(r.acessorios),
    detalhes: texto(r.detalhes),
    preco,
    codigo: texto(r.codigo) ?? `CONS-${numero}`,
    destaque: r.destaque === true,
    novidade: r.novidade === true,
    desde: texto(r.desde) ?? new Date(0).toISOString(),
    fotos,
    garantia: texto(r.garantia) ?? "3 meses de garantia da loja",
  };
}

async function buscar(caminho: string): Promise<Response> {
  return fetch(`${baseDoMeuBling()}${caminho}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
    next: { revalidate: REVALIDAR_CONSIGNADOS, tags: ["consignados"] },
  });
}

/** Todos os consignados à venda, já na ordem da vitrine. Qualquer falha vira []. */
export async function listarConsignados(): Promise<ItemConsignado[]> {
  try {
    const resposta = await buscar("/api/v1/publico/consignados");
    if (!resposta.ok) return [];
    const corpo = (await resposta.json()) as { data?: unknown };
    if (!Array.isArray(corpo?.data)) return [];
    return ordenarConsignados(corpo.data.map(normalizarItem).filter((i): i is ItemConsignado => i !== null));
  } catch {
    return [];
  }
}

/**
 * Um consignado pelo número.
 * - item: está à venda;
 * - "vendido": o MEU BLING respondeu 404 (vendido ou retirado) → a página dá notFound();
 * - null: não deu para perguntar (fora do ar, tempo esgotado).
 */
export async function buscarConsignado(numero: number): Promise<ItemConsignado | "vendido" | null> {
  try {
    const resposta = await buscar(`/api/v1/publico/consignados/${numero}`);
    if (resposta.status === 404) return "vendido";
    if (!resposta.ok) return null;
    const item = normalizarItem(await resposta.json());
    return item && item.numero === numero ? item : null;
  } catch {
    return null;
  }
}
