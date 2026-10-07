// ============================================================
// Do item lido na fonte ao produto do site.
//
// Função pura: decide se o item entra, onde ele cai no menu, como se chama e
// quanto custa. O banco só grava o que sair daqui.
// ============================================================

import { calcularVenda, normalizarMargem, type PrecoDeVenda } from "./calculo";
import type { ItemDeOrigem } from "./kabum";

export interface RegrasDaFonte {
  id: string;
  nome: string;
  /** true = só o que é vendido e entregue pela própria loja de origem. */
  so_loja: boolean;
  margem: number;
  preco_min: number | null;
  preco_max: number | null;
  /** Trilha da categoria na fonte: "Computadores/PC/PC Gamer". */
  trilha: string | null;
  /** Se preenchido, troca a trilha da fonte por este caminho no menu do site. */
  categoria_destino: string | null;
}

export type MotivoDeRecusa =
  | "indisponivel"
  | "openbox"
  | "pre_venda"
  | "sem_preco"
  | "marketplace"
  | "abaixo_da_faixa"
  | "acima_da_faixa";

/** Devolve o motivo da recusa, ou null se o item entra no site. */
export function motivoDeRecusa(item: ItemDeOrigem, fonte: RegrasDaFonte): MotivoDeRecusa | null {
  if (!item.disponivel) return "indisponivel";
  if (item.openbox) return "openbox";
  if (item.preVenda) return "pre_venda";
  if (!(item.pix > 0)) return "sem_preco";
  // O filtro já vai na URL; esta checagem é a segunda tranca, para o caso de a
  // fonte ignorar o filtro e devolver anúncio de terceiro.
  if (fonte.so_loja && item.marketplace) return "marketplace";
  if (fonte.preco_min != null && item.pix < fonte.preco_min) return "abaixo_da_faixa";
  if (fonte.preco_max != null && item.pix > fonte.preco_max) return "acima_da_faixa";
  return null;
}

// ---------- categoria ----------

const limparCaminho = (caminho: string) =>
  String(caminho || "")
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean)
    .join("/");

export function categoriaNoSite(item: ItemDeOrigem, fonte: RegrasDaFonte): string {
  const daFonte = limparCaminho(item.categoria) || limparCaminho(fonte.trilha || "") || fonte.nome;
  const destino = limparCaminho(fonte.categoria_destino || "");
  if (!destino) return daFonte;

  const trilha = limparCaminho(fonte.trilha || "");
  if (trilha && (daFonte === trilha || daFonte.startsWith(`${trilha}/`))) {
    const resto = daFonte.slice(trilha.length).replace(/^\//, "");
    return resto ? `${destino}/${resto}` : destino;
  }
  return destino;
}

// ---------- nome ----------

// Marcas de PEÇA: fazem parte da configuração e nunca saem do nome.
const MARCAS_DE_PECA = new Set([
  "intel", "amd", "nvidia", "ryzen", "geforce", "radeon", "asus", "gigabyte", "msi", "asrock",
  "kingston", "corsair", "redragon", "windows", "linux", "outros", "generico", "genérico", "generic",
]);

const escaparRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Nos PCs que servem só de referência (a loja monta com peça própria), o nome
 * não pode carregar a marca de quem montou o original: o cliente compraria um
 * "PC Gamer Fulano" e receberia um PC montado no Balão.
 *
 * Tira a marca e o vendedor do título quando aparecem por extenso. Não pega
 * tudo — nome de montadora escrito de outro jeito ("By Fulano", código de
 * modelo) continua lá.
 */
export function nomeSemMontadora(nome: string, marca: string | null, vendedor: string | null): string {
  let saida = String(nome || "");
  for (const termo of [marca, vendedor]) {
    const limpo = String(termo || "").trim();
    if (limpo.length < 3 || MARCAS_DE_PECA.has(limpo.toLowerCase())) continue;
    saida = saida.replace(new RegExp(`(^|[\\s,(-])${escaparRegex(limpo)}(?=$|[\\s,).-])`, "gi"), "$1");
  }
  return saida
    .replace(/\s+-\s*$/g, "")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,-]+|[\s,-]+$/g, "")
    .trim();
}

export function slugDoProduto(nome: string, codigo: string): string {
  const base = String(nome || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 110)
    .replace(/-+$/g, "");
  return `${base || "produto"}-${codigo}`;
}

// ---------- produto ----------

export interface ProdutoDeOrigem {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  slug: string;
  image: string;
  image_urls: string[];
  description: string;
  specs: Record<string, string>;
  availability: string;
  source_url: string;
  supplier: string;
  cost: number;
  fonte_id: string;
  origem_codigo: string;
  origem_pix: number;
  origem_cartao: number;
  origem_parcelas: number;
  venda: PrecoDeVenda;
}

export function montarProduto(item: ItemDeOrigem, fonte: RegrasDaFonte): ProdutoDeOrigem {
  const referencia = !fonte.so_loja;
  const name = referencia ? nomeSemMontadora(item.nome, item.marca, item.vendedor) || item.nome : item.nome;
  const marca = referencia ? null : item.marca;
  const venda = calcularVenda(
    { pix: item.pix, cartao: item.cartao, parcelas: item.parcelas },
    normalizarMargem(fonte.margem)
  );

  const specs: Record<string, string> = {};
  if (marca) specs["Marca"] = marca;
  if (item.garantia && !referencia) specs["Garantia"] = item.garantia;

  const partes = [name + "."];
  if (marca) partes.push(`Marca: ${marca}.`);
  partes.push(
    referencia
      ? "Montado e testado na Balão da Informática, no Cambuí, em Campinas."
      : "Vendido pela Balão da Informática, no Cambuí, em Campinas."
  );

  return {
    id: item.codigo,
    name,
    brand: marca,
    category: categoriaNoSite(item, fonte),
    slug: slugDoProduto(name, item.codigo),
    image: item.foto || item.fotos[0] || "",
    image_urls: item.fotos.length ? item.fotos : item.foto ? [item.foto] : [],
    description: partes.join(" "),
    specs,
    availability: "Disponível",
    source_url: item.url,
    supplier: referencia ? item.vendedor || fonte.nome : "KaBuM!",
    cost: item.pix,
    fonte_id: fonte.id,
    origem_codigo: item.codigo,
    origem_pix: item.pix,
    origem_cartao: item.cartao > 0 ? item.cartao : item.pix,
    origem_parcelas: item.parcelas,
    venda,
  };
}
