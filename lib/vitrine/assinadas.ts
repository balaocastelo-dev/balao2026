// ============================================================
// Setups assinados da Vitrine (pedido do Thiago em 25/10).
//
// A /vitrine estava com "Curadoria 0" e "Nenhuma página publicada ainda".
// O Thiago pediu cinco setups completos entre R$ 5.000 e R$ 10.000.
//
// Cada setup aponta para um PC completo DE VERDADE do catálogo (pelo id do
// produto). Nome do produto, preço, fotos e disponibilidade são lidos AO VIVO
// do catálogo a cada exibição — nada de preço gravado que fica velho (o mesmo
// problema do carrinho corrigido no mesmo dia, ver lib/carrinho/precos.ts).
// Se o produto sumir do catálogo ou o preço sair da faixa, o setup some da
// vitrine sozinho.
//
// Para trocar um setup: mude o `produto` (id do produto no catálogo) e o texto.
// As páginas feitas pelo painel (/painel/gerador, tabela vitrine_pages)
// continuam valendo e aparecem junto destas.
// ============================================================

import type { Product } from "@/lib/utils";
import { parsePriceToNumber } from "@/lib/utils";
import { extractParts } from "./core";
import type { VitrineCategory, VitrinePageRecord } from "./types";
import { candidatos, diaDeHoje, rankingDoDia, QUANTOS_POR_DIA, setupDoProduto } from "./rotativa";

export const FAIXA_MINIMA = 5000;
export const FAIXA_MAXIMA = 10000;
/** Quantos sorteados a vitrine confere no catálogo, no máximo, por montagem. */
export const MAXIMO_DE_CONFERENCIAS = 25;

export interface SetupAssinado {
  /** Endereço da página: /p/<slug>. */
  slug: string;
  titulo: string;
  categoria: VitrineCategory;
  /** id (ou slug) do produto no catálogo. */
  produto: string;
  /** Uma frase para quem está escolhendo: para que serve este setup. */
  chamada: string;
  aplicacoes: string[];
  /** Data fixa de publicação (ordena a vitrine: o mais recente primeiro). */
  publicado_em: string;
}

export const SETUPS_ASSINADOS: SetupAssinado[] = [
  {
    slug: "setup-27-polegadas-rtx-3060-12gb",
    titulo: "Setup 27\" · Core i5 12400F + RTX 3060 12 GB",
    categoria: "PC Gamer",
    produto: "pc-gamer-completo-skill-intel-core-i5-12400f-16gb-rtx-3060-12gb-ssd-512gb-m-2-monitor-27-ips-100hz-sk27016-751808",
    chamada:
      "O topo da faixa: RTX 3060 com 12 GB de memória de vídeo para jogos mais pesados, live e edição, num monitor IPS de 27 polegadas.",
    aplicacoes: ["Jogos", "Streaming", "Edição de vídeo"],
    publicado_em: "2026-10-25T21:05:00.000Z",
  },
  {
    slug: "setup-competitivo-180hz-rx-6600",
    titulo: "Setup Competitivo 180 Hz · Ryzen 5 5600GT + RX 6600",
    categoria: "PC Gamer",
    produto: "pc-gamer-completo-baloinfo-new-g-ryzen-5-5600gt-16gb-radeon-rx-6600-8gb-ssd-m2-1tb-monitor-24-180hz---skr12",
    chamada:
      "RX 6600 com monitor de 24 polegadas e 180 Hz: mais quadros por segundo em CS2, Valorant e Fortnite, e SSD de 1 TB para a biblioteca de jogos.",
    aplicacoes: ["Jogos competitivos", "Estudos", "Navegação"],
    publicado_em: "2026-10-25T21:04:00.000Z",
  },
  {
    slug: "setup-am5-ddr5-rx-6600",
    titulo: "Setup AM5 pronto para upgrade · Ryzen 5 7500F + RX 6600",
    categoria: "PC Gamer",
    produto: "pc-gamer-completo-baloinfo-frag-amd-ryzen-5-7500f-am5-radeon-rx-6600-8gb-b650-16gb-ddr5-ssd-512gb-nvme-monitor-23-75hz-kit-gamer---pgbp-fra247",
    chamada:
      "Plataforma atual (AM5, memória DDR5 e placa B650): roda bem hoje e aceita processador mais novo depois, sem trocar a placa-mãe. Vem com monitor e kit gamer.",
    aplicacoes: ["Jogos", "Upgrade futuro", "Estudos"],
    publicado_em: "2026-10-25T21:03:00.000Z",
  },
  {
    slug: "setup-branco-180hz-rtx-3050",
    titulo: "Setup Branco 180 Hz · Ryzen 5 5500 + RTX 3050",
    categoria: "PC Gamer",
    produto: "912198",
    chamada:
      "Setup todo branco com monitor de 24 polegadas e 180 Hz, RTX 3050 com DLSS e SSD de 1 TB: bonito na mesa e rápido nos jogos competitivos.",
    aplicacoes: ["Jogos competitivos", "Setup branco", "Estudos"],
    publicado_em: "2026-10-25T21:02:00.000Z",
  },
  {
    slug: "setup-entrada-full-hd-rx-6600",
    titulo: "Setup Entrada Full HD · Ryzen 5 5500 + RX 6600",
    categoria: "PC Gamer",
    produto: "pc-gamer-completo-baloinfo-frag-amd-ryzen-5-5500-radeon-rx-6600-8gb-b450-16gb-ddr4-ssd-512gb-nvme-monitor-23-75hz-kit-gamer---pgbp-fra218",
    chamada:
      "O primeiro setup completo que roda os jogos atuais em Full HD: PC com RX 6600 de 8 GB, monitor de 23 polegadas e kit gamer, tudo junto.",
    aplicacoes: ["Jogos em Full HD", "Estudos", "Navegação"],
    publicado_em: "2026-10-25T21:01:00.000Z",
  },
];

const reais = (v: number) =>
  `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Monta a página da vitrine a partir do produto lido agora do catálogo.
 * Devolve null se o produto não existe, não tem preço ou saiu da faixa.
 */
export function montarPaginaAssinada(setup: SetupAssinado, produto: Product | null): VitrinePageRecord | null {
  if (!produto) return null;
  const preco = parsePriceToNumber(produto.price);
  if (!(preco >= FAIXA_MINIMA && preco <= FAIXA_MAXIMA)) return null;

  const pecas = extractParts(produto.name || "", setup.categoria);
  const fotos = [produto.image, ...(produto.image_urls ?? [])]
    .map((u) => String(u || "").trim())
    .filter((u, i, todas) => u && todas.indexOf(u) === i);

  return {
    id: `assinado-${setup.slug}`,
    nome_pc: setup.titulo,
    slug: setup.slug,
    categoria: setup.categoria,
    descricao_original: setup.chamada,
    processador: pecas.processador || "",
    placa_video: pecas.placa_video || "",
    memoria_ram: pecas.memoria_ram || "",
    armazenamento: pecas.armazenamento || "",
    sistema_operacional: pecas.sistema_operacional || "",
    resfriamento: pecas.resfriamento || "",
    aplicacoes: setup.aplicacoes,
    extras: {
      assinado: "sim",
      chamada: setup.chamada,
      price_text: reais(preco),
      // A página /p/[slug] lê o produto principal daqui (link "comprar",
      // fotos e WhatsApp). O preço vem do catálogo agora, não de cópia.
      main_product: {
        id: produto.id,
        name: produto.name,
        price: reais(preco),
        price_card: produto.price_card,
        image: produto.image,
        image_urls: fotos,
        slug: produto.slug,
        product_url: `/product/${produto.slug || produto.id}`,
        availability: produto.availability,
      },
    } as unknown as Record<string, string>,
    images: fotos[0] ? { hero: fotos[0] } : {},
    image_prompts: {},
    status: "publicada",
    data_criacao: setup.publicado_em,
    data_publicacao: setup.publicado_em,
  };
}

/**
 * As páginas da vitrine HOJE: os cinco PCs sorteados do dia (lib/vitrine/rotativa.ts),
 * completados pelos setups fixos acima se o catálogo não tiver cinco que sirvam.
 */
function precoDaPagina(p: VitrinePageRecord): number {
  return parsePriceToNumber(p.extras?.price_text);
}

export async function paginasDaVitrine(
  listarPcsCompletos: () => Promise<Product[]>,
  buscar: (id: string) => Promise<Product | null>,
  agora = new Date()
): Promise<VitrinePageRecord[]> {
  const dia = diaDeHoje(agora);
  const pcs = await listarPcsCompletos().catch(() => [] as Product[]);
  const paginas: VitrinePageRecord[] = [];
  const usados = new Set<string>();

  // A lista da categoria pode trazer produto que a busca individual não acha,
  // ou com preço diferente do que o checkout cobra (achado em 25/10). Por isso
  // cada sorteado é conferido pela MESMA busca da página do produto e do
  // checkout, e a vitrine usa o registro dela.
  const chaves = new Set<string>();
  let tentativas = 0;
  for (const sorteado of rankingDoDia(pcs, dia)) {
    if (paginas.length >= QUANTOS_POR_DIA || tentativas >= MAXIMO_DE_CONFERENCIAS) break;
    tentativas++;
    let identificador = String(sorteado.id);
    let real = await buscar(identificador).catch(() => null);
    if (!real && sorteado.slug && sorteado.slug !== identificador) {
      identificador = sorteado.slug;
      real = await buscar(identificador).catch(() => null);
    }
    const conferido = real ? candidatos([real])[0] : undefined;
    if (!real || !conferido || chaves.has(conferido.chave) || usados.has(String(real.id))) continue;
    const pagina = montarPaginaAssinada(setupDoProduto(real, dia, identificador), real);
    if (pagina) {
      paginas.push(pagina);
      chaves.add(conferido.chave);
      usados.add(String(real.id));
    }
  }
  paginas.sort((a, b) => precoDaPagina(a) - precoDaPagina(b));

  if (paginas.length < QUANTOS_POR_DIA) {
    for (const setup of SETUPS_ASSINADOS) {
      if (paginas.length >= QUANTOS_POR_DIA) break;
      const produto = await buscar(setup.produto).catch(() => null);
      if (!produto || usados.has(String(produto.id))) continue;
      const pagina = montarPaginaAssinada(setup, produto);
      if (pagina) {
        paginas.push(pagina);
        usados.add(String(produto.id));
      }
    }
  }
  paginas.sort((a, b) => precoDaPagina(a) - precoDaPagina(b));
  return paginas;
}

/**
 * Página /p/<slug> de um setup: os fixos pelo slug e os do sorteio por
 * "setup-<id do produto>". O link de um setup de ontem continua abrindo
 * enquanto o PC estiver no catálogo e dentro da faixa.
 */
export async function paginaAssinadaPorSlug(
  slug: string,
  buscar: (id: string) => Promise<Product | null>,
  agora = new Date()
): Promise<VitrinePageRecord | null> {
  const fixo = SETUPS_ASSINADOS.find((s) => s.slug === slug);
  if (fixo) return montarPaginaAssinada(fixo, await buscar(fixo.produto).catch(() => null));

  if (!slug.startsWith("setup-")) return null;
  const produto = await buscar(slug.slice("setup-".length)).catch(() => null);
  if (!produto || candidatos([produto]).length === 0) return null;
  return montarPaginaAssinada(setupDoProduto(produto, diaDeHoje(agora)), produto);
}
