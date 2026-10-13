// ============================================================
// Importação de fornecedor que o servidor não consegue ler sozinho.
//
// Os catálogos da Kyte (TechSupri, Robson Atacado e outros fornecedores
// locais) recusam servidores. O catálogo é capturado pelo navegador da loja
// (public/captura-fornecedor.js) e chega aqui inteiro ou em lotes. Cada importação é uma PASSADA,
// igual à da KaBuM!: grava/atualiza o que veio e, no último lote, tira do site
// o que sumiu do fornecedor (com a mesma trava: passada pequena demais não
// apaga nada).
// ============================================================

import { invalidarCacheCategorias, invalidarCacheProdutos } from "@/lib/cache";
import { turso } from "@/lib/turso";
import {
  acrescentarCategorias,
  atualizarFonte,
  buscarFonte,
  concluirPassada,
  criarFonte,
  garantirEstrutura,
  gravarAndamento,
  gravarPagina,
  type Fonte,
} from "./banco";
import { REGRA_TECHSUPRI, type RegraDeMargem } from "./margem";
import { fotosTemMarca } from "./marca-dagua";
import {
  fotoDaKyte,
  identificarLink,
  paraItemKyte,
  PREFIXO_KYTE,
  PREFIXO_TECHSUPRI,
  SITE_KYTE,
  SITE_TECHSUPRI,
  URL_TECHSUPRI,
  type OpcoesDoFornecedor,
  type ProdutoCapturado,
} from "./techsupri";
import type { ItemDeOrigem } from "./kabum";
import { identificarLinkTob, SITE_TOB } from "./tob";
import { buscarFoto } from "./fotos";

const LOTE = 150;

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Produto NOVO sem foto ganha a foto do mesmo produto na KaBuM!, enquanto
 * houver tempo. Quem já tem foto no site fica com ela. O que não achar entra
 * com a foto provisória e tenta de novo na próxima importação.
 */
async function completarFotos(itens: ItemDeOrigem[], limiteMs: number): Promise<number> {
  const semFoto = itens.filter((i) => !i.foto);
  if (semFoto.length === 0) return 0;
  const comFotoNoSite = new Set<string>();
  for (let i = 0; i < semFoto.length; i += 500) {
    const ids = semFoto.slice(i, i + 500).map((x) => x.codigo);
    const res = await turso.execute({
      sql: `SELECT id FROM products WHERE id IN (${ids.map(() => "?").join(", ")})
              AND image IS NOT NULL AND image <> '' AND image NOT LIKE '%produto-sem-foto%'`,
      args: ids,
    });
    for (const r of res.rows) comFotoNoSite.add(String((r as Record<string, unknown>).id));
  }
  let achadas = 0;
  for (const item of semFoto) {
    if (comFotoNoSite.has(item.codigo) || !item.disponivel) continue;
    if (Date.now() + 15_000 > limiteMs) break;
    const busca = await buscarFoto(item.nome);
    if (!busca.ok) {
      if (busca.motivo === "bloqueado") break;
      continue;
    }
    if (busca.achada) {
      item.foto = busca.achada.foto;
      item.fotos = busca.achada.fotos.slice(0, 6);
      achadas++;
    }
    await dormir(800);
  }
  return achadas;
}

/** A fonte da TechSupri; cria na primeira importação. */
export async function fonteDaTechsupri(): Promise<Fonte> {
  await garantirEstrutura();
  const res = await turso.execute({ sql: "SELECT id FROM fontes_preco WHERE site = ? LIMIT 1", args: [SITE_TECHSUPRI] });
  const id = res.rows[0] ? String((res.rows[0] as Record<string, unknown>).id) : null;
  if (id) {
    const fonte = await buscarFonte(id);
    if (fonte) return fonte;
  }
  return criarFonte({
    nome: "TechSupri (fornecedor local)",
    site: SITE_TECHSUPRI,
    url: URL_TECHSUPRI,
    caminho: "techsupri.kyte.site",
    so_loja: true,
    margem: REGRA_TECHSUPRI.minima,
    regra_margem: REGRA_TECHSUPRI,
    pronta_entrega: true,
    fornecedor: "TechSupri",
    marca_dagua: true,
    // O agendador não lê esta fonte (ver coleta.ts); o intervalo só aparece no painel.
    intervalo_min: 24 * 60,
  });
}

/** Sites de fonte que chegam por importação do navegador (catálogos da Kyte). */
export const SITES_POR_IMPORTACAO = [SITE_TECHSUPRI, SITE_KYTE];

/** Como os produtos desta fonte viram itens: prefixo do código, fornecedor, fotos. */
export function opcoesDaFonte(fonte: Fonte): OpcoesDoFornecedor {
  return {
    prefixo: fonte.site === SITE_TECHSUPRI ? PREFIXO_TECHSUPRI : PREFIXO_KYTE,
    vendedor: fonte.fornecedor || fonte.nome,
    urlDoCatalogo: fonte.site === SITE_TECHSUPRI ? URL_TECHSUPRI : fonte.url,
    usarFotoDoFornecedor: fonte.marca_dagua === false,
  };
}

/** A fonte do fornecedor da Kyte cujo catálogo fica neste endereço (host). */
export async function fonteDoHost(host: string): Promise<Fonte | null> {
  await garantirEstrutura();
  const limpo = String(host || "").toLowerCase().trim();
  if (!limpo) return null;
  const res = await turso.execute({
    sql: `SELECT id FROM fontes_preco WHERE caminho = ? AND site IN (${SITES_POR_IMPORTACAO.map(() => "?").join(", ")}) LIMIT 1`,
    args: [limpo, ...SITES_POR_IMPORTACAO],
  });
  const id = res.rows[0] ? String((res.rows[0] as Record<string, unknown>).id) : null;
  if (id) return buscarFonte(id);
  // A TechSupri tem também o catálogo antigo (techsupri.catalog.kyte.site).
  if (/^techsupri\.(catalog\.)?kyte\.site$/.test(limpo)) return fonteDaTechsupri();
  return null;
}

/** Margem de quem chega novo pelo link: 66% para tudo, até o Thiago mudar. */
export const MARGEM_PADRAO_DE_FORNECEDOR = 66;

export interface NovoFornecedor {
  url: string;
  nome?: string | null;
  margem?: number | null;
  regra_margem?: RegraDeMargem | null;
  pronta_entrega?: boolean;
}

/** Cadastra um fornecedor da Kyte a partir do link do catálogo. */
export async function cadastrarFornecedorKyte(dados: NovoFornecedor): Promise<Fonte> {
  const link = identificarLink(dados.url);
  if (!link || link.plataforma !== "kyte") throw new Error("Esse link não é de um catálogo da Kyte.");
  if (await fonteDoHost(link.host)) throw new Error("Este fornecedor já está cadastrado.");
  const nome = String(dados.nome || "").trim().slice(0, 120) || link.nomeSugerido;
  return criarFonte({
    nome,
    site: SITE_KYTE,
    url: link.url,
    caminho: link.host,
    so_loja: true,
    margem: dados.margem ?? MARGEM_PADRAO_DE_FORNECEDOR,
    regra_margem: dados.regra_margem ?? null,
    pronta_entrega: dados.pronta_entrega !== false,
    fornecedor: nome,
    intervalo_min: 24 * 60,
  });
}

/** A fonte da TOB deste representante (caminho = host/c/slug), se já existir. */
export async function fonteDaTob(caminho: string): Promise<Fonte | null> {
  await garantirEstrutura();
  const res = await turso.execute({
    sql: "SELECT id FROM fontes_preco WHERE site = ? AND caminho = ? LIMIT 1",
    args: [SITE_TOB, String(caminho || "").toLowerCase()],
  });
  const id = res.rows[0] ? String((res.rows[0] as Record<string, unknown>).id) : null;
  return id ? buscarFonte(id) : null;
}

/**
 * Cadastra a TOB Distribuição (catálogo do representante) pelo link. O
 * servidor lê esse catálogo sozinho: depois de cadastrar, "Ler agora" no
 * painel (ou o agendador, uma vez por dia) traz os produtos.
 */
export async function cadastrarFornecedorTob(dados: NovoFornecedor): Promise<Fonte> {
  const link = identificarLinkTob(dados.url);
  if (!link) throw new Error("Esse link não é do catálogo da TOB (catalogotob.tobdistribuicao.com.br/c/…).");
  if (await fonteDaTob(link.caminho)) throw new Error("Este fornecedor já está cadastrado.");
  const nome = String(dados.nome || "").trim().slice(0, 120) || link.nomeSugerido;
  return criarFonte({
    nome,
    site: SITE_TOB,
    url: link.url,
    caminho: link.caminho,
    so_loja: true,
    margem: dados.margem ?? MARGEM_PADRAO_DE_FORNECEDOR,
    regra_margem: dados.regra_margem ?? null,
    pronta_entrega: dados.pronta_entrega !== false,
    fornecedor: nome,
    intervalo_min: 24 * 60,
  });
}

/**
 * Na primeira importação, confere se as fotos do fornecedor têm a marca dele
 * (marca d'água, logo). Fotos limpas vão para o site; carimbadas, não — aí a
 * foto vem de busca na internet. O Thiago pode mudar a decisão no painel.
 */
export async function conferirMarcaDagua(fonte: Fonte, produtos: ProdutoCapturado[]): Promise<Fonte> {
  if (fonte.marca_dagua !== null) return fonte;
  const urls = [...new Set(produtos.map((p) => fotoDaKyte(p.image)).filter(Boolean))];
  if (urls.length < 8) return fonte;
  try {
    const analise = await fotosTemMarca(urls, { limite: 24 });
    if (analise.fotos < 6) return fonte;
    return (await atualizarFonte(fonte.id, { marca_dagua: analise.temMarca })) || fonte;
  } catch {
    return fonte;
  }
}

export interface ResultadoDaImportacao {
  fonte: string;
  inicio: string;
  recebidos: number;
  gravados: number;
  novos: number;
  retidos: number;
  recusados: number;
  removidos: number;
  suspeita: boolean;
  concluida: boolean;
  fotosAchadas: number;
  /** Excluídos no painel: ficaram de fora (produtos_bloqueados). */
  bloqueados: number;
}

export interface OpcoesDaImportacao {
  inicio?: string | null;
  final?: boolean;
  limiteMs?: number;
  buscarFotos?: boolean;
}

/** Importa um lote de produtos da TechSupri (mantido para a tarefa diária). */
export async function importarTechsupri(produtos: ProdutoCapturado[], opcoes: OpcoesDaImportacao = {}): Promise<ResultadoDaImportacao> {
  return importarDoFornecedor(await fonteDaTechsupri(), produtos, opcoes);
}

/**
 * Importa um lote de produtos de um fornecedor da Kyte.
 * @param inicio  devolvido pelo primeiro lote; os lotes seguintes repetem o mesmo valor.
 * @param final   true no último lote: fecha a passada e remove o que sumiu.
 */
export async function importarDoFornecedor(
  fonteAntes: Fonte,
  produtos: ProdutoCapturado[],
  opcoes: OpcoesDaImportacao = {}
): Promise<ResultadoDaImportacao> {
  if (!SITES_POR_IMPORTACAO.includes(fonteAntes.site)) throw new Error("Esta fonte não recebe importação.");
  const fonte = await conferirMarcaDagua(fonteAntes, produtos);
  const inicio = opcoes.inicio && !Number.isNaN(Date.parse(opcoes.inicio)) ? opcoes.inicio : new Date().toISOString();

  const comoItem = opcoesDaFonte(fonte);
  const itens = produtos.map((p) => paraItemKyte(p, comoItem)).filter((i): i is ItemDeOrigem => !!i);
  const saida: ResultadoDaImportacao = {
    fonte: fonte.nome, inicio, recebidos: produtos.length,
    gravados: 0, novos: 0, retidos: 0, recusados: produtos.length - itens.length,
    removidos: 0, suspeita: false, concluida: false, fotosAchadas: 0, bloqueados: 0,
  };

  if (opcoes.buscarFotos !== false) {
    saida.fotosAchadas = await completarFotos(itens, opcoes.limiteMs ?? Date.now() + 60_000);
  }

  const agora = new Date().toISOString();
  for (let i = 0; i < itens.length; i += LOTE) {
    const r = await gravarPagina(fonte, itens.slice(i, i + LOTE), agora);
    saida.gravados += r.gravados;
    saida.novos += r.novos;
    saida.retidos += r.retidos;
    saida.recusados += r.recusados;
    saida.bloqueados += r.bloqueados;
  }

  if (opcoes.final) {
    const fim = await concluirPassada(fonte, inicio);
    saida.removidos = fim.removidos;
    saida.suspeita = fim.suspeita;
    saida.concluida = true;
    await gravarAndamento(fonte.id, {
      passo_pagina: 0, passo_inicio: null, passo_falhas: 0, passo_lidos: 0,
      ultima_coleta_em: agora, ultima_tentativa_em: null,
      ultimo_status: fim.suspeita ? "suspeita" : "ok",
      ultimo_erro: fim.suspeita
        ? `A importação trouxe ${fim.total} produtos ou menos, menos da metade do que havia. Nada foi removido.`
        : null,
      ultimo_total: fim.total,
      ultimo_removidos: fim.removidos,
    });
  }

  // No fim da passada o menu é conferido sempre: categorias trocadas à mão
  // (ou por regra nova) aparecem no menu sem esperar produto novo.
  if (saida.novos > 0 || saida.removidos > 0 || opcoes.final) {
    await acrescentarCategorias().catch(() => 0);
    invalidarCacheCategorias();
  }
  if (saida.gravados > 0 || saida.removidos > 0) invalidarCacheProdutos();
  return saida;
}
