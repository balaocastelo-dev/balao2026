// ============================================================
// Fontes de preço: o que vai para o banco.
//
// Duas coisas moram aqui:
//  - a tabela `fontes_preco`, com o link de cada categoria, a margem e o
//    andamento da leitura;
//  - as colunas `origem_*` de `products`, que guardam o preço lido na fonte.
//    O preço de venda (`price`, `price_card`) é sempre recalculado a partir
//    delas — nunca é a fonte da verdade.
//
// Este projeto não roda migração no deploy, então a estrutura é conferida e
// criada na primeira chamada (`garantirEstrutura`).
// ============================================================

import { randomUUID } from "crypto";
import { turso, isTursoActive } from "@/lib/turso";
import { buildCategoryNodesFromPaths } from "@/lib/utils";
import { calcularVenda, decidirPreco, normalizarMargem } from "./calculo";
import type { ItemDeOrigem } from "./kabum";
import { montarProduto, motivoDeRecusa, type ProdutoDeOrigem, type RegrasDaFonte } from "./produto";

type Linha = Record<string, unknown>;

export interface Fonte extends RegrasDaFonte {
  site: string;
  url: string;
  caminho: string;
  ativa: boolean;
  intervalo_min: number;
  ordem: number;
  passo_pagina: number;
  passo_inicio: string | null;
  passo_total_pag: number | null;
  passo_lidos: number;
  passo_falhas: number;
  travada_ate: string | null;
  ultima_coleta_em: string | null;
  ultima_tentativa_em: string | null;
  ultimo_status: string | null;
  ultimo_erro: string | null;
  ultimo_total: number | null;
  ultimo_removidos: number | null;
  criada_em: string | null;
  /** Preenchidos só na listagem do painel. */
  produtos?: number;
  retidos?: number;
}

export const TABELA_DE_RESERVA = "products_antes_da_troca";
const RESERVA_DE_CATEGORIAS = "categories_antes_da_troca";

const agoraIso = () => new Date().toISOString();
const num = (v: unknown, padrao = 0) => (Number.isFinite(Number(v)) ? Number(v) : padrao);
const numOuNulo = (v: unknown) => (v === null || v === undefined || v === "" || !Number.isFinite(Number(v)) ? null : Number(v));
const txtOuNulo = (v: unknown) => (v === null || v === undefined || v === "" ? null : String(v));

function exigirBanco() {
  if (!isTursoActive()) throw new Error("Banco de dados não configurado");
}

// ---------- estrutura ----------

const COLUNAS_DE_ORIGEM: Record<string, string> = {
  fonte_id: "VARCHAR(64) NULL",
  origem_codigo: "VARCHAR(64) NULL",
  origem_pix: "DOUBLE NULL",
  origem_cartao: "DOUBLE NULL",
  origem_parcelas: "INT NULL",
  origem_visto_em: "VARCHAR(40) NULL",
  retido_pix: "DOUBLE NULL",
  retido_cartao: "DOUBLE NULL",
  retido_desde: "VARCHAR(40) NULL",
};

let estruturaPronta: Promise<void> | null = null;

async function criarEstrutura() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS fontes_preco (
      id VARCHAR(64) PRIMARY KEY,
      nome VARCHAR(190) NOT NULL,
      site VARCHAR(32) NOT NULL DEFAULT 'kabum',
      url TEXT NOT NULL,
      caminho VARCHAR(190) NOT NULL,
      so_loja TINYINT NOT NULL DEFAULT 1,
      margem DOUBLE NOT NULL DEFAULT 33,
      ativa TINYINT NOT NULL DEFAULT 1,
      intervalo_min INT NOT NULL DEFAULT 120,
      preco_min DOUBLE NULL,
      preco_max DOUBLE NULL,
      trilha TEXT NULL,
      categoria_destino TEXT NULL,
      ordem INT NOT NULL DEFAULT 0,
      passo_pagina INT NOT NULL DEFAULT 0,
      passo_inicio VARCHAR(40) NULL,
      passo_total_pag INT NULL,
      passo_lidos INT NOT NULL DEFAULT 0,
      passo_falhas INT NOT NULL DEFAULT 0,
      travada_ate VARCHAR(40) NULL,
      ultima_coleta_em VARCHAR(40) NULL,
      ultima_tentativa_em VARCHAR(40) NULL,
      ultimo_status VARCHAR(32) NULL,
      ultimo_erro TEXT NULL,
      ultimo_total INT NULL,
      ultimo_removidos INT NULL,
      criada_em VARCHAR(40) NULL
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const colunas = await turso.execute(
    "SELECT COLUMN_NAME AS nome FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products'"
  );
  const existentes = new Set(colunas.rows.map((r) => String((r as Linha).nome).toLowerCase()));
  if (existentes.size === 0) throw new Error("A tabela products não existe neste banco.");

  for (const [coluna, tipo] of Object.entries(COLUNAS_DE_ORIGEM)) {
    if (!existentes.has(coluna)) {
      await turso.execute(`ALTER TABLE products ADD COLUMN ${coluna} ${tipo}`);
    }
  }

  const indice = await turso.execute(
    "SELECT COUNT(*) AS n FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND INDEX_NAME = 'idx_products_fonte'"
  );
  if (num((indice.rows[0] as Linha)?.n) === 0) {
    await turso.execute("CREATE INDEX idx_products_fonte ON products (fonte_id)");
  }
}

export function garantirEstrutura(): Promise<void> {
  exigirBanco();
  if (!estruturaPronta) {
    estruturaPronta = criarEstrutura().catch((erro) => {
      estruturaPronta = null; // tenta de novo na próxima chamada
      throw erro;
    });
  }
  return estruturaPronta;
}

// ---------- fontes ----------

function paraFonte(r: Linha): Fonte {
  return {
    id: String(r.id),
    nome: String(r.nome ?? ""),
    site: String(r.site ?? "kabum"),
    url: String(r.url ?? ""),
    caminho: String(r.caminho ?? ""),
    so_loja: num(r.so_loja, 1) === 1,
    margem: num(r.margem, 33),
    ativa: num(r.ativa, 1) === 1,
    intervalo_min: num(r.intervalo_min, 120),
    preco_min: numOuNulo(r.preco_min),
    preco_max: numOuNulo(r.preco_max),
    trilha: txtOuNulo(r.trilha),
    categoria_destino: txtOuNulo(r.categoria_destino),
    ordem: num(r.ordem),
    passo_pagina: num(r.passo_pagina),
    passo_inicio: txtOuNulo(r.passo_inicio),
    passo_total_pag: numOuNulo(r.passo_total_pag),
    passo_lidos: num(r.passo_lidos),
    passo_falhas: num(r.passo_falhas),
    travada_ate: txtOuNulo(r.travada_ate),
    ultima_coleta_em: txtOuNulo(r.ultima_coleta_em),
    ultima_tentativa_em: txtOuNulo(r.ultima_tentativa_em),
    ultimo_status: txtOuNulo(r.ultimo_status),
    ultimo_erro: txtOuNulo(r.ultimo_erro),
    ultimo_total: numOuNulo(r.ultimo_total),
    ultimo_removidos: numOuNulo(r.ultimo_removidos),
    criada_em: txtOuNulo(r.criada_em),
  };
}

export async function listarFontes(opcoes: { comContagem?: boolean } = {}): Promise<Fonte[]> {
  await garantirEstrutura();
  const res = await turso.execute("SELECT * FROM fontes_preco ORDER BY ordem ASC, nome ASC");
  const fontes = res.rows.map((r) => paraFonte(r as Linha));
  if (!opcoes.comContagem || fontes.length === 0) return fontes;

  const contagem = await turso.execute(
    "SELECT fonte_id, COUNT(*) AS total, SUM(CASE WHEN retido_desde IS NULL THEN 0 ELSE 1 END) AS retidos FROM products WHERE fonte_id IS NOT NULL GROUP BY fonte_id"
  );
  const porFonte = new Map(contagem.rows.map((r) => [String((r as Linha).fonte_id), r as Linha]));
  return fontes.map((f) => ({
    ...f,
    produtos: num(porFonte.get(f.id)?.total),
    retidos: num(porFonte.get(f.id)?.retidos),
  }));
}

export async function buscarFonte(id: string): Promise<Fonte | null> {
  await garantirEstrutura();
  const res = await turso.execute({ sql: "SELECT * FROM fontes_preco WHERE id = ? LIMIT 1", args: [id] });
  return res.rows[0] ? paraFonte(res.rows[0] as Linha) : null;
}

export interface DadosDaFonte {
  nome: string;
  url: string;
  caminho: string;
  site?: string;
  so_loja?: boolean;
  margem?: number;
  ativa?: boolean;
  intervalo_min?: number;
  preco_min?: number | null;
  preco_max?: number | null;
  trilha?: string | null;
  categoria_destino?: string | null;
  ordem?: number;
}

const limitarIntervalo = (v: unknown) => Math.min(24 * 60, Math.max(30, Math.round(num(v, 120))));

export async function criarFonte(dados: DadosDaFonte, id: string = randomUUID()): Promise<Fonte> {
  await garantirEstrutura();

  const repetida = await turso.execute({
    sql: "SELECT id FROM fontes_preco WHERE site = ? AND caminho = ? LIMIT 1",
    args: [dados.site || "kabum", dados.caminho],
  });
  if (repetida.rows.length > 0) throw new Error("Esta categoria já está cadastrada como fonte.");

  const ordem =
    dados.ordem ??
    num(((await turso.execute("SELECT MAX(ordem) AS m FROM fontes_preco")).rows[0] as Linha)?.m, -1) + 1;

  await turso.execute({
    sql: `INSERT INTO fontes_preco
            (id, nome, site, url, caminho, so_loja, margem, ativa, intervalo_min, preco_min, preco_max, trilha, categoria_destino, ordem, criada_em)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      dados.nome.trim().slice(0, 190),
      dados.site || "kabum",
      dados.url,
      dados.caminho,
      dados.so_loja === false ? 0 : 1,
      normalizarMargem(dados.margem ?? 33),
      dados.ativa === false ? 0 : 1,
      limitarIntervalo(dados.intervalo_min ?? 120),
      numOuNulo(dados.preco_min),
      numOuNulo(dados.preco_max),
      txtOuNulo(dados.trilha),
      txtOuNulo(dados.categoria_destino),
      ordem,
      agoraIso(),
    ],
  });
  return (await buscarFonte(id))!;
}

export type AlteracaoDaFonte = Partial<
  Pick<DadosDaFonte, "nome" | "so_loja" | "margem" | "ativa" | "intervalo_min" | "preco_min" | "preco_max" | "categoria_destino">
>;

export async function atualizarFonte(id: string, mudanca: AlteracaoDaFonte): Promise<Fonte | null> {
  await garantirEstrutura();
  const campos: Record<string, string | number | null> = {};

  if (mudanca.nome !== undefined) campos.nome = String(mudanca.nome).trim().slice(0, 190);
  if (mudanca.so_loja !== undefined) campos.so_loja = mudanca.so_loja ? 1 : 0;
  if (mudanca.margem !== undefined) campos.margem = normalizarMargem(mudanca.margem);
  if (mudanca.ativa !== undefined) campos.ativa = mudanca.ativa ? 1 : 0;
  if (mudanca.intervalo_min !== undefined) campos.intervalo_min = limitarIntervalo(mudanca.intervalo_min);
  if (mudanca.preco_min !== undefined) campos.preco_min = numOuNulo(mudanca.preco_min);
  if (mudanca.preco_max !== undefined) campos.preco_max = numOuNulo(mudanca.preco_max);
  if (mudanca.categoria_destino !== undefined) campos.categoria_destino = txtOuNulo(mudanca.categoria_destino);

  const chaves = Object.keys(campos);
  if (chaves.length > 0) {
    await turso.execute({
      sql: `UPDATE fontes_preco SET ${chaves.map((k) => `${k} = ?`).join(", ")} WHERE id = ?`,
      args: [...chaves.map((k) => campos[k]), id],
    });
  }
  return buscarFonte(id);
}

/** Apaga a fonte e os produtos que vieram dela. */
export async function removerFonte(id: string): Promise<{ produtosRemovidos: number }> {
  await garantirEstrutura();
  const apagados = await turso.execute({ sql: "DELETE FROM products WHERE fonte_id = ?", args: [id] });
  await turso.execute({ sql: "DELETE FROM fontes_preco WHERE id = ?", args: [id] });
  return { produtosRemovidos: apagados.rowsAffected };
}

// ---------- trava ----------

/** Só uma leitura por fonte de cada vez (painel e agendador podem coincidir). */
export async function travarFonte(id: string, segundos: number): Promise<boolean> {
  const agora = agoraIso();
  const ate = new Date(Date.now() + segundos * 1000).toISOString();
  const res = await turso.execute({
    sql: "UPDATE fontes_preco SET travada_ate = ? WHERE id = ? AND (travada_ate IS NULL OR travada_ate < ?)",
    args: [ate, id, agora],
  });
  return res.rowsAffected === 1;
}

export async function destravarFonte(id: string): Promise<void> {
  await turso.execute({ sql: "UPDATE fontes_preco SET travada_ate = NULL WHERE id = ?", args: [id] });
}

/** Depois de um bloqueio, nenhuma fonte parada do mesmo site tenta antes do intervalo dela. */
export async function adiarFontesDoSite(site: string, agora: string): Promise<void> {
  await turso.execute({
    sql: "UPDATE fontes_preco SET ultima_tentativa_em = ? WHERE site = ? AND passo_pagina = 0",
    args: [agora, site],
  });
}

export async function gravarAndamento(id: string, campos: Record<string, string | number | null>): Promise<void> {
  const chaves = Object.keys(campos);
  if (chaves.length === 0) return;
  await turso.execute({
    sql: `UPDATE fontes_preco SET ${chaves.map((k) => `${k} = ?`).join(", ")} WHERE id = ?`,
    args: [...chaves.map((k) => campos[k]), id],
  });
}

// ---------- produtos ----------

const COLUNAS_DO_PRODUTO = [
  "id", "name", "price", "price_card", "discount_pix", "installment", "brand", "availability", "source_url",
  "image", "image_urls", "description", "specs", "category", "slug", "cost", "supplier", "created_at",
  "fonte_id", "origem_codigo", "origem_pix", "origem_cartao", "origem_parcelas", "origem_visto_em",
  "retido_pix", "retido_cartao", "retido_desde",
] as const;

// Numa releitura só muda o que vem da fonte. Nome, categoria, descrição, ficha
// e endereço (slug) ficam como estão: o que for ajustado à mão no painel de
// produtos sobrevive, e o link do produto não muda. A foto só é trocada
// enquanto ainda apontar para a fonte — depois de copiada para o servidor da
// loja, não é mais sobrescrita.
const AO_REPETIR = `
  price = VALUES(price),
  price_card = VALUES(price_card),
  discount_pix = VALUES(discount_pix),
  installment = VALUES(installment),
  availability = VALUES(availability),
  source_url = VALUES(source_url),
  image = IF(image IS NULL OR image = '' OR image LIKE '%kabum.com.br%', VALUES(image), image),
  image_urls = IF(image IS NULL OR image = '' OR image LIKE '%kabum.com.br%', VALUES(image_urls), image_urls),
  cost = VALUES(cost),
  supplier = VALUES(supplier),
  fonte_id = VALUES(fonte_id),
  origem_codigo = VALUES(origem_codigo),
  origem_pix = VALUES(origem_pix),
  origem_cartao = VALUES(origem_cartao),
  origem_parcelas = VALUES(origem_parcelas),
  origem_visto_em = VALUES(origem_visto_em),
  retido_pix = VALUES(retido_pix),
  retido_cartao = VALUES(retido_cartao),
  retido_desde = VALUES(retido_desde)`;

interface Retencao {
  pix: number;
  cartao: number;
  desde: string;
}

function valoresDoProduto(p: ProdutoDeOrigem, vistoEm: string, slug: string, retencao: Retencao | null) {
  return [
    p.id, p.name, p.venda.price, p.venda.price_card, p.venda.discount_pix, p.venda.installment, p.brand,
    p.availability, p.source_url, p.image, JSON.stringify(p.image_urls), p.description, JSON.stringify(p.specs),
    p.category, slug, p.cost, p.supplier, vistoEm,
    p.fonte_id, p.origem_codigo, p.origem_pix, p.origem_cartao, p.origem_parcelas, vistoEm,
    retencao?.pix ?? null, retencao?.cartao ?? null, retencao?.desde ?? null,
  ];
}

function sqlDeInsercao(quantidade: number, aoRepetir: boolean) {
  const linha = `(${COLUNAS_DO_PRODUTO.map(() => "?").join(", ")})`;
  return (
    `INSERT INTO products (${COLUNAS_DO_PRODUTO.join(", ")}) VALUES ${Array(quantidade).fill(linha).join(", ")}` +
    (aoRepetir ? ` ON DUPLICATE KEY UPDATE ${AO_REPETIR}` : "")
  );
}

export interface ResultadoDaPagina {
  gravados: number;
  novos: number;
  retidos: number;
  recusados: number;
  deOutraFonte: number;
}

/**
 * Grava uma página lida da fonte.
 *
 * Para cada item: recusa o que não entra (indisponível, openbox, marketplace
 * quando a fonte é "só loja", fora da faixa), pula o que já pertence a outra
 * fonte, e segura o preço quando a queda é grande demais para ser verdade.
 */
export async function gravarPagina(fonte: Fonte, itens: ItemDeOrigem[], agora: string): Promise<ResultadoDaPagina> {
  const saida: ResultadoDaPagina = { gravados: 0, novos: 0, retidos: 0, recusados: 0, deOutraFonte: 0 };

  const aceitos: ItemDeOrigem[] = [];
  const vistos = new Set<string>();
  for (const item of itens) {
    if (vistos.has(item.codigo)) continue;
    vistos.add(item.codigo);
    if (motivoDeRecusa(item, fonte)) saida.recusados++;
    else aceitos.push(item);
  }
  if (aceitos.length === 0) return saida;

  const atuais = await turso.execute({
    sql: `SELECT id, fonte_id, origem_pix, origem_cartao, origem_parcelas, retido_desde FROM products WHERE id IN (${aceitos.map(() => "?").join(", ")})`,
    args: aceitos.map((i) => i.codigo),
  });
  const porId = new Map(atuais.rows.map((r) => [String((r as Linha).id), r as Linha]));

  const valores: unknown[] = [];
  let linhas = 0;

  for (const item of aceitos) {
    const atual = porId.get(item.codigo);
    if (atual?.fonte_id && String(atual.fonte_id) !== fonte.id) {
      saida.deOutraFonte++;
      continue;
    }

    let produto = montarProduto(item, fonte);
    let retencao: Retencao | null = null;

    if (atual) {
      const anterior = num(atual.origem_pix);
      const decisao = decidirPreco(anterior, item.pix, txtOuNulo(atual.retido_desde), agora);
      if (decisao.acao === "reter") {
        // Mantém o preço de origem anterior; o novo fica guardado ao lado,
        // esperando aprovação no painel ou a confirmação pelo tempo.
        retencao = { pix: item.pix, cartao: item.cartao, desde: decisao.desde };
        const cartaoAnterior = num(atual.origem_cartao) || anterior;
        const parcelas = num(atual.origem_parcelas);
        produto = {
          ...produto,
          cost: anterior,
          origem_pix: anterior,
          origem_cartao: cartaoAnterior,
          origem_parcelas: parcelas,
          venda: calcularVenda({ pix: anterior, cartao: cartaoAnterior, parcelas }, fonte.margem),
        };
        saida.retidos++;
      }
    } else {
      saida.novos++;
    }

    valores.push(...valoresDoProduto(produto, agora, produto.slug, retencao));
    linhas++;
  }

  if (linhas > 0) {
    await turso.execute({ sql: sqlDeInsercao(linhas, true), args: valores });
    saida.gravados = linhas;
  }
  return saida;
}

/**
 * Fecha uma passada completa da fonte: o que não apareceu desta vez saiu da
 * fonte (esgotou ou foi retirado) e sai do site também.
 *
 * Guarda: se a passada trouxe menos da metade do que havia, o mais provável é
 * a leitura ter falhado, não a loja ter esvaziado. Aí nada é apagado.
 */
export async function concluirPassada(
  fonte: Fonte,
  inicio: string
): Promise<{ total: number; removidos: number; suspeita: boolean }> {
  const contar = async (extra: string, args: unknown[]) =>
    num(
      ((await turso.execute({ sql: `SELECT COUNT(*) AS n FROM products WHERE fonte_id = ? ${extra}`, args: [fonte.id, ...args] }))
        .rows[0] as Linha)?.n
    );

  const antes = await contar("", []);
  const vistos = await contar("AND origem_visto_em >= ?", [inicio]);

  if (antes >= 20 && vistos < antes * 0.5) {
    return { total: antes, removidos: 0, suspeita: true };
  }

  const apagados = await turso.execute({
    sql: "DELETE FROM products WHERE fonte_id = ? AND (origem_visto_em IS NULL OR origem_visto_em < ?)",
    args: [fonte.id, inicio],
  });
  return { total: vistos, removidos: apagados.rowsAffected, suspeita: false };
}

// ---------- margem ----------

const TAMANHO_DO_LOTE = 200;

function sqlDeReprecificacao(linhas: { id: string; price: string; price_card: string; installment: string; discount_pix: string }[]) {
  const colunas = ["price", "price_card", "installment", "discount_pix"] as const;
  const args: unknown[] = [];
  const partes = colunas.map((coluna) => {
    const casos = linhas
      .map((l) => {
        args.push(l.id, l[coluna]);
        return "WHEN ? THEN ?";
      })
      .join(" ");
    return `${coluna} = CASE id ${casos} ELSE ${coluna} END`;
  });
  args.push(...linhas.map((l) => l.id));
  return {
    sql: `UPDATE products SET ${partes.join(", ")} WHERE id IN (${linhas.map(() => "?").join(", ")})`,
    args,
  };
}

/** Recalcula o preço de venda de todos os produtos da fonte com a margem atual. */
export async function recalcularMargem(fonte: Fonte): Promise<number> {
  await garantirEstrutura();
  const res = await turso.execute({
    sql: "SELECT id, origem_pix, origem_cartao, origem_parcelas FROM products WHERE fonte_id = ? AND origem_pix > 0",
    args: [fonte.id],
  });

  const linhas = res.rows.map((r) => {
    const l = r as Linha;
    const venda = calcularVenda(
      { pix: num(l.origem_pix), cartao: num(l.origem_cartao) || num(l.origem_pix), parcelas: num(l.origem_parcelas) },
      fonte.margem
    );
    return { id: String(l.id), price: venda.price, price_card: venda.price_card, installment: venda.installment, discount_pix: venda.discount_pix };
  });
  if (linhas.length === 0) return 0;

  const comandos = [];
  for (let i = 0; i < linhas.length; i += TAMANHO_DO_LOTE) {
    comandos.push(sqlDeReprecificacao(linhas.slice(i, i + TAMANHO_DO_LOTE)));
  }
  // Uma transação só: ou a fonte inteira muda de preço, ou nada muda.
  await turso.batch(comandos, "write");
  return linhas.length;
}

// ---------- quedas retidas ----------

export interface ProdutoRetido {
  id: string;
  nome: string;
  fonte_id: string;
  origem_pix: number;
  retido_pix: number;
  retido_desde: string;
  source_url: string | null;
}

export async function listarRetidos(limite = 200): Promise<ProdutoRetido[]> {
  await garantirEstrutura();
  const res = await turso.execute(
    `SELECT id, name, fonte_id, origem_pix, retido_pix, retido_desde, source_url FROM products WHERE retido_desde IS NOT NULL ORDER BY retido_desde DESC LIMIT ${Math.trunc(limite)}`
  );
  return res.rows.map((r) => {
    const l = r as Linha;
    return {
      id: String(l.id),
      nome: String(l.name ?? ""),
      fonte_id: String(l.fonte_id ?? ""),
      origem_pix: num(l.origem_pix),
      retido_pix: num(l.retido_pix),
      retido_desde: String(l.retido_desde ?? ""),
      source_url: txtOuNulo(l.source_url),
    };
  });
}

/** Aceita o preço novo dos produtos retidos (todos da fonte, ou só os ids dados). */
export async function aceitarRetidos(fonte: Fonte, ids?: string[]): Promise<number> {
  await garantirEstrutura();
  const filtroIds = ids && ids.length ? ` AND id IN (${ids.map(() => "?").join(", ")})` : "";
  const res = await turso.execute({
    sql: `SELECT id, retido_pix, retido_cartao, origem_parcelas FROM products WHERE fonte_id = ? AND retido_desde IS NOT NULL${filtroIds}`,
    args: [fonte.id, ...(ids && ids.length ? ids : [])],
  });
  if (res.rows.length === 0) return 0;

  const comandos = res.rows.map((r) => {
    const l = r as Linha;
    const pix = num(l.retido_pix);
    const cartao = num(l.retido_cartao) || pix;
    const venda = calcularVenda({ pix, cartao, parcelas: num(l.origem_parcelas) }, fonte.margem);
    return {
      sql: `UPDATE products SET price = ?, price_card = ?, installment = ?, discount_pix = ?, cost = ?, origem_pix = ?, origem_cartao = ?,
              retido_pix = NULL, retido_cartao = NULL, retido_desde = NULL WHERE id = ?`,
      args: [venda.price, venda.price_card, venda.installment, venda.discount_pix, pix, pix, cartao, String(l.id)],
    };
  });
  await turso.batch(comandos, "write");
  return comandos.length;
}

// ---------- categorias ----------

/** Cria no menu as categorias que os produtos novos trouxeram. Não apaga nenhuma. */
export async function acrescentarCategorias(): Promise<number> {
  const caminhos = await turso.execute(
    "SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category <> '' ORDER BY category"
  );
  const nos = buildCategoryNodesFromPaths(caminhos.rows.map((r) => String((r as Linha).category)));

  const atuais = await turso.execute("SELECT id, full_path, slug, display_order FROM categories");
  const caminhosAtuais = new Set(atuais.rows.map((r) => String((r as Linha).full_path ?? (r as Linha).id)));
  const slugsAtuais = new Set(atuais.rows.map((r) => String((r as Linha).slug)));
  let ordem = atuais.rows.reduce((m, r) => Math.max(m, num((r as Linha).display_order)), -1);

  let criadas = 0;
  for (const no of nos) {
    if (caminhosAtuais.has(no.full_path) || slugsAtuais.has(no.slug)) continue;
    await turso.execute({
      sql: "INSERT INTO categories (id, name, slug, parent_id, display_order, icon, active, full_path) VALUES (?, ?, ?, ?, ?, ?, 1, ?)",
      args: [no.id, no.name, no.slug, no.parent_id, ++ordem, null, no.full_path],
    });
    criadas++;
  }
  return criadas;
}

// ---------- troca do catálogo ----------

export interface SituacaoDaTroca {
  produtos: number;
  comFonte: number;
  semFonte: number;
  reserva: number | null;
}

async function tabelaExiste(nome: string): Promise<boolean> {
  const existe = await turso.execute({
    sql: "SELECT COUNT(*) AS n FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
    args: [nome],
  });
  return num((existe.rows[0] as Linha)?.n) > 0;
}

async function contarReserva(): Promise<number | null> {
  if (!(await tabelaExiste(TABELA_DE_RESERVA))) return null;
  return num(((await turso.execute(`SELECT COUNT(*) AS n FROM ${TABELA_DE_RESERVA}`)).rows[0] as Linha)?.n);
}

export async function situacaoDaTroca(): Promise<SituacaoDaTroca> {
  await garantirEstrutura();
  const res = await turso.execute(
    "SELECT COUNT(*) AS total, SUM(CASE WHEN fonte_id IS NULL THEN 0 ELSE 1 END) AS com FROM products"
  );
  const total = num((res.rows[0] as Linha)?.total);
  const com = num((res.rows[0] as Linha)?.com);
  return { produtos: total, comFonte: com, semFonte: total - com, reserva: await contarReserva() };
}

export interface CargaInicial {
  coletadoEm: string;
  fontes: (DadosDaFonte & { id: string; itens: ItemDeOrigem[] })[];
}

export interface ResultadoDaTroca {
  antes: number;
  reserva: number;
  fontes: number;
  produtos: number;
  categorias: number;
  porFonte: { nome: string; produtos: number }[];
}

/**
 * Troca o catálogo inteiro de uma vez.
 *
 * 1. guarda uma cópia do catálogo atual em `products_antes_da_troca`;
 * 2. numa transação só, apaga tudo e grava os produtos das fontes;
 * 3. refaz o menu de categorias a partir do catálogo novo.
 *
 * Se qualquer gravação do passo 2 falhar, a transação é desfeita e o site
 * continua exatamente como estava. Em nenhum momento a loja fica vazia.
 */
export async function trocarCatalogo(carga: CargaInicial): Promise<ResultadoDaTroca> {
  await garantirEstrutura();
  const agora = agoraIso();

  const antes = num(((await turso.execute("SELECT COUNT(*) AS n FROM products")).rows[0] as Linha)?.n);

  // A troca depende de transação. Tabela MyISAM não desfaz um DELETE: se a
  // gravação falhasse no meio, a loja ficaria pela metade.
  const motor = await turso.execute(
    "SELECT ENGINE AS motor FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products'"
  );
  const nomeDoMotor = String((motor.rows[0] as Linha)?.motor || "");
  if (nomeDoMotor.toLowerCase() !== "innodb") {
    throw new Error(`A tabela products usa o motor "${nomeDoMotor}", que não tem transação. Nada foi alterado.`);
  }

  // 1. Cópia de segurança. Só é criada uma vez: rodar a troca de novo não pode
  // sobrescrever a cópia do catálogo original com o catálogo já trocado.
  let reserva = await contarReserva();
  if (reserva === null) {
    await turso.execute(`CREATE TABLE ${TABELA_DE_RESERVA} AS SELECT * FROM products`);
    reserva = (await contarReserva()) ?? 0;
    if (reserva !== antes) {
      throw new Error(`A cópia de segurança ficou com ${reserva} produtos, mas o catálogo tem ${antes}. Nada foi alterado.`);
    }
  }
  if (!(await tabelaExiste(RESERVA_DE_CATEGORIAS))) {
    await turso.execute(`CREATE TABLE ${RESERVA_DE_CATEGORIAS} AS SELECT * FROM categories`);
  }

  // Endereço (slug) dos produtos que continuam: o link antigo segue valendo.
  const slugs = await turso.execute("SELECT id, slug FROM products WHERE slug IS NOT NULL AND slug <> ''");
  const slugAntigo = new Map(slugs.rows.map((r) => [String((r as Linha).id), String((r as Linha).slug)]));

  // Monta tudo em memória antes de tocar no banco.
  const linhas: unknown[][] = [];
  const caminhos: string[] = [];
  const usados = new Set<string>();
  const porFonte: { nome: string; produtos: number }[] = [];
  const fontes: Fonte[] = [];

  carga.fontes.forEach((dados, indice) => {
    const fonte: Fonte = paraFonte({
      ...dados,
      so_loja: dados.so_loja === false ? 0 : 1,
      ativa: dados.ativa === false ? 0 : 1,
      margem: normalizarMargem(dados.margem ?? 33),
      intervalo_min: limitarIntervalo(dados.intervalo_min ?? 120),
      ordem: dados.ordem ?? indice,
    });
    fontes.push(fonte);

    let quantos = 0;
    for (const item of dados.itens) {
      if (usados.has(item.codigo) || motivoDeRecusa(item, fonte)) continue;
      usados.add(item.codigo);
      const produto = montarProduto(item, fonte);
      linhas.push(valoresDoProduto(produto, carga.coletadoEm, slugAntigo.get(produto.id) || produto.slug, null));
      caminhos.push(produto.category);
      quantos++;
    }
    porFonte.push({ nome: fonte.nome, produtos: quantos });
  });

  if (linhas.length === 0) throw new Error("A carga não tem nenhum produto válido. Nada foi alterado.");
  if (antes >= 100 && linhas.length < antes * 0.25) {
    throw new Error(`A carga tem só ${linhas.length} produtos contra ${antes} no ar. Nada foi alterado.`);
  }

  // 2. Troca numa transação só.
  const tx = await turso.transaction("write");
  try {
    await tx.execute("DELETE FROM products");
    await tx.execute("DELETE FROM fontes_preco");
    for (const f of fontes) {
      await tx.execute({
        sql: `INSERT INTO fontes_preco
                (id, nome, site, url, caminho, so_loja, margem, ativa, intervalo_min, preco_min, preco_max, trilha, categoria_destino, ordem,
                 ultima_coleta_em, ultimo_status, ultimo_total, ultimo_removidos, criada_em)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ok', ?, 0, ?)`,
        args: [
          f.id, f.nome, f.site, f.url, f.caminho, f.so_loja ? 1 : 0, f.margem, f.ativa ? 1 : 0, f.intervalo_min,
          f.preco_min, f.preco_max, f.trilha, f.categoria_destino, f.ordem, carga.coletadoEm,
          porFonte[fontes.indexOf(f)].produtos, agora,
        ],
      });
    }
    for (let i = 0; i < linhas.length; i += TAMANHO_DO_LOTE) {
      const lote = linhas.slice(i, i + TAMANHO_DO_LOTE);
      await tx.execute({ sql: sqlDeInsercao(lote.length, false), args: lote.flat() });
    }
    await tx.commit();
  } catch (erro) {
    await tx.rollback().catch(() => {});
    throw erro;
  }

  // 3. Menu de categorias do catálogo novo (na ordem das fontes).
  const slugsVistos = new Set<string>();
  const nos = buildCategoryNodesFromPaths(caminhos).filter((no) => {
    // `categories.slug` é UNIQUE: dois caminhos que virem o mesmo slug
    // derrubariam o menu inteiro. Fica o primeiro.
    if (slugsVistos.has(no.slug)) return false;
    slugsVistos.add(no.slug);
    return true;
  });
  await turso.batch(
    [
      { sql: "DELETE FROM categories", args: [] },
      ...nos.map((no) => ({
        sql: "INSERT INTO categories (id, name, slug, parent_id, display_order, icon, active, full_path) VALUES (?, ?, ?, ?, ?, ?, 1, ?)",
        args: [no.id, no.name, no.slug, no.parent_id, no.display_order, null, no.full_path],
      })),
    ],
    "write"
  );

  return { antes, reserva, fontes: fontes.length, produtos: linhas.length, categorias: nos.length, porFonte };
}

/** Desfaz a troca: devolve o catálogo guardado na cópia de segurança. */
export async function desfazerTroca(): Promise<{ restaurados: number }> {
  await garantirEstrutura();
  const reserva = await contarReserva();
  if (!reserva) throw new Error("Não há cópia de segurança para restaurar.");

  const colunas = await turso.execute({
    sql: "SELECT COLUMN_NAME AS nome FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION",
    args: [TABELA_DE_RESERVA],
  });
  const lista = colunas.rows.map((r) => `\`${String((r as Linha).nome)}\``).join(", ");

  const tx = await turso.transaction("write");
  try {
    await tx.execute("DELETE FROM products");
    await tx.execute(`INSERT INTO products (${lista}) SELECT ${lista} FROM ${TABELA_DE_RESERVA}`);
    await tx.execute("UPDATE fontes_preco SET ativa = 0");
    if (await tabelaExiste(RESERVA_DE_CATEGORIAS)) {
      await tx.execute("DELETE FROM categories");
      await tx.execute(`INSERT INTO categories SELECT * FROM ${RESERVA_DE_CATEGORIAS}`);
    }
    await tx.commit();
  } catch (erro) {
    await tx.rollback().catch(() => {});
    throw erro;
  }
  return { restaurados: reserva };
}
