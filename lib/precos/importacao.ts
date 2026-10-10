// ============================================================
// Importação de fornecedor que o servidor não consegue ler sozinho.
//
// A TechSupri (Kyte) recusa servidores. O catálogo é capturado pelo navegador
// da loja e chega aqui inteiro ou em lotes. Cada importação é uma PASSADA,
// igual à da KaBuM!: grava/atualiza o que veio e, no último lote, tira do site
// o que sumiu do fornecedor (com a mesma trava: passada pequena demais não
// apaga nada).
// ============================================================

import { invalidarCacheCategorias, invalidarCacheProdutos } from "@/lib/cache";
import { turso } from "@/lib/turso";
import {
  acrescentarCategorias,
  buscarFonte,
  concluirPassada,
  criarFonte,
  garantirEstrutura,
  gravarAndamento,
  gravarPagina,
  type Fonte,
} from "./banco";
import { REGRA_TECHSUPRI } from "./margem";
import { paraItemTechsupri, SITE_TECHSUPRI, URL_TECHSUPRI, type ProdutoCapturado } from "./techsupri";
import type { ItemDeOrigem } from "./kabum";
import { buscarFotoNaKabum } from "./fotos";

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
    const busca = await buscarFotoNaKabum(item.nome);
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
    // O agendador não lê esta fonte (ver coleta.ts); o intervalo só aparece no painel.
    intervalo_min: 24 * 60,
  });
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
}

/**
 * Importa um lote de produtos da TechSupri.
 * @param inicio  devolvido pelo primeiro lote; os lotes seguintes repetem o mesmo valor.
 * @param final   true no último lote: fecha a passada e remove o que sumiu.
 */
export async function importarTechsupri(
  produtos: ProdutoCapturado[],
  opcoes: { inicio?: string | null; final?: boolean; limiteMs?: number } = {}
): Promise<ResultadoDaImportacao> {
  const fonte = await fonteDaTechsupri();
  const inicio = opcoes.inicio && !Number.isNaN(Date.parse(opcoes.inicio)) ? opcoes.inicio : new Date().toISOString();

  const itens = produtos.map(paraItemTechsupri).filter((i): i is ItemDeOrigem => !!i);
  const saida: ResultadoDaImportacao = {
    fonte: fonte.nome, inicio, recebidos: produtos.length,
    gravados: 0, novos: 0, retidos: 0, recusados: produtos.length - itens.length,
    removidos: 0, suspeita: false, concluida: false, fotosAchadas: 0,
  };

  saida.fotosAchadas = await completarFotos(itens, opcoes.limiteMs ?? Date.now() + 60_000);

  const agora = new Date().toISOString();
  for (let i = 0; i < itens.length; i += LOTE) {
    const r = await gravarPagina(fonte, itens.slice(i, i + LOTE), agora);
    saida.gravados += r.gravados;
    saida.novos += r.novos;
    saida.retidos += r.retidos;
    saida.recusados += r.recusados;
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

  if (saida.novos > 0 || saida.removidos > 0) {
    await acrescentarCategorias().catch(() => 0);
    invalidarCacheCategorias();
  }
  if (saida.gravados > 0 || saida.removidos > 0) invalidarCacheProdutos();
  return saida;
}
