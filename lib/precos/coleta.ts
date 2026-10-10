// ============================================================
// A leitura das fontes, em passos curtos.
//
// A Vercel corta a função em poucos segundos, e uma categoria grande tem
// dezenas de páginas. Por isso a leitura de uma fonte é uma PASSADA feita em
// passos: cada passo lê algumas páginas, grava, anota em que página parou e
// devolve. O próximo passo (o agendador ou o botão do painel) continua dali.
//
// Só quando a passada chega ao fim é que os produtos que sumiram da fonte
// saem do site.
// ============================================================

import { invalidarCacheProdutos, invalidarCacheCategorias } from "@/lib/cache";
import {
  acrescentarCategorias,
  adiarFontesDoSite,
  buscarFonte,
  concluirPassada,
  destravarFonte,
  gravarAndamento,
  gravarPagina,
  listarFontes,
  travarFonte,
  type Fonte,
} from "./banco";
import { lerPaginaDaCategoria } from "./kabum";

/** Pausa entre uma página e a próxima. */
const PAUSA_ENTRE_PAGINAS_MS = 1500;
/** Depois de tantas falhas seguidas na mesma página, a passada é abandonada. */
const FALHAS_PARA_DESISTIR = 3;

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type EstadoDoPasso = "concluida" | "em_andamento" | "ocupada" | "bloqueada" | "erro" | "suspeita";

export interface ResumoDoPasso {
  fonte: string;
  estado: EstadoDoPasso;
  pagina: number;
  totalDePaginas: number | null;
  gravados: number;
  novos: number;
  retidos: number;
  removidos: number;
  mensagem: string | null;
}

/** A fonte está na hora de ser lida de novo? */
export function estaVencida(fonte: Fonte, agora = Date.now()): boolean {
  if (!fonte.ativa) return false;
  if (fonte.passo_pagina > 0) return true; // passada pela metade: termina primeiro
  // Depois de bloqueio ou erro, espera o intervalo inteiro antes de tentar de novo.
  const referencia = fonte.ultima_tentativa_em || fonte.ultima_coleta_em;
  if (!referencia) return true;
  return agora - Date.parse(referencia) >= fonte.intervalo_min * 60_000;
}

/**
 * Lê páginas de UMA fonte até acabar a passada ou o tempo.
 * @param limiteMs instante (Date.now()) em que o passo precisa ter terminado.
 */
export async function lerFonteAte(fonteId: string, limiteMs: number): Promise<ResumoDoPasso> {
  let fonte = await buscarFonte(fonteId);
  if (!fonte) throw new Error("Fonte não encontrada.");

  const resumo: ResumoDoPasso = {
    fonte: fonte.nome,
    estado: "em_andamento",
    pagina: fonte.passo_pagina,
    totalDePaginas: fonte.passo_total_pag,
    gravados: 0,
    novos: 0,
    retidos: 0,
    removidos: 0,
    mensagem: null,
  };

  // Só a KaBuM! é lida pelo servidor. Fornecedor com proteção contra robôs
  // (TechSupri, na Kyte) é atualizado por importação, pelo navegador da loja.
  if (fonte.site !== "kabum") {
    return { ...resumo, estado: "erro", mensagem: "Esta fonte é atualizada por importação, não pela leitura automática." };
  }

  if (!(await travarFonte(fonte.id, 90))) {
    return { ...resumo, estado: "ocupada", mensagem: "Esta fonte já está sendo lida agora." };
  }

  let mudouAlgo = false;
  try {
    let inicio = fonte.passo_inicio;
    let pagina = fonte.passo_pagina;
    let lidos = fonte.passo_lidos;

    if (pagina <= 0 || !inicio) {
      inicio = new Date().toISOString();
      pagina = 1;
      lidos = 0;
      await gravarAndamento(fonte.id, { passo_pagina: 1, passo_inicio: inicio, passo_lidos: 0, passo_falhas: 0, passo_total_pag: null });
    }

    for (;;) {
      const leitura = await lerPaginaDaCategoria(fonte.caminho, fonte.so_loja, pagina);
      const agora = new Date().toISOString();

      if (!leitura.ok) {
        if (leitura.motivo === "bloqueado") {
          // Bloqueio é "pare": zera a passada e só volta no próximo intervalo.
          await gravarAndamento(fonte.id, {
            passo_pagina: 0, passo_inicio: null, passo_falhas: 0,
            ultima_tentativa_em: agora, ultimo_status: "bloqueado", ultimo_erro: leitura.detalhe,
          });
          // O bloqueio é do site inteiro: as outras fontes dele também esperam.
          await adiarFontesDoSite(fonte.site, agora);
          return { ...resumo, estado: "bloqueada", pagina, mensagem: `A fonte recusou a leitura (${leitura.detalhe}).` };
        }

        const falhas = fonte.passo_falhas + 1;
        if (falhas >= FALHAS_PARA_DESISTIR) {
          await gravarAndamento(fonte.id, {
            passo_pagina: 0, passo_inicio: null, passo_falhas: 0,
            ultima_tentativa_em: agora, ultimo_status: "erro", ultimo_erro: leitura.detalhe,
          });
          return { ...resumo, estado: "erro", pagina, mensagem: `Leitura abandonada na página ${pagina}: ${leitura.detalhe}.` };
        }
        await gravarAndamento(fonte.id, { passo_falhas: falhas, ultimo_erro: leitura.detalhe });
        return { ...resumo, estado: "em_andamento", pagina, mensagem: `Página ${pagina} falhou (${leitura.detalhe}); tenta de novo no próximo passo.` };
      }

      const { itens, totalDePaginas, trilha } = leitura.pagina;
      const gravacao = await gravarPagina(fonte, itens, agora);
      mudouAlgo = mudouAlgo || gravacao.gravados > 0;
      lidos += gravacao.gravados;
      resumo.gravados += gravacao.gravados;
      resumo.novos += gravacao.novos;
      resumo.retidos += gravacao.retidos;
      resumo.totalDePaginas = totalDePaginas;
      resumo.pagina = pagina;

      const acabou = pagina >= totalDePaginas || itens.length === 0;
      if (acabou) {
        const fim = await concluirPassada(fonte, inicio);
        resumo.removidos = fim.removidos;
        mudouAlgo = mudouAlgo || fim.removidos > 0;
        await gravarAndamento(fonte.id, {
          passo_pagina: 0, passo_inicio: null, passo_falhas: 0, passo_lidos: 0, passo_total_pag: totalDePaginas,
          ...(trilha && !fonte.trilha ? { trilha } : {}),
          ultima_coleta_em: agora, ultima_tentativa_em: null,
          ultimo_status: fim.suspeita ? "suspeita" : "ok",
          ultimo_erro: fim.suspeita
            ? `A leitura trouxe ${lidos} produtos, menos da metade dos ${fim.total} que havia. Nada foi removido.`
            : null,
          ultimo_total: fim.total,
          ultimo_removidos: fim.removidos,
        });
        if (resumo.novos > 0) {
          await acrescentarCategorias().catch(() => 0);
          invalidarCacheCategorias();
        }
        resumo.estado = fim.suspeita ? "suspeita" : "concluida";
        resumo.mensagem = fim.suspeita ? "A leitura veio pequena demais; nenhum produto foi removido." : null;
        return resumo;
      }

      pagina += 1;
      await gravarAndamento(fonte.id, {
        passo_pagina: pagina, passo_lidos: lidos, passo_falhas: 0, passo_total_pag: totalDePaginas,
        ...(trilha && !fonte.trilha ? { trilha } : {}),
      });
      fonte = { ...fonte, passo_falhas: 0, trilha: fonte.trilha || trilha || null };

      // Só começa outra página se sobrar tempo para lê-la e gravá-la.
      if (Date.now() + PAUSA_ENTRE_PAGINAS_MS + 8000 > limiteMs) {
        resumo.pagina = pagina;
        return resumo;
      }
      // Renova a trava: a leitura continua.
      await gravarAndamento(fonte.id, { travada_ate: new Date(Date.now() + 90_000).toISOString() });
      await dormir(PAUSA_ENTRE_PAGINAS_MS);
    }
  } finally {
    await destravarFonte(fonteId).catch(() => {});
    if (mudouAlgo) invalidarCacheProdutos();
  }
}

/**
 * O que o agendador roda: lê as fontes vencidas, a mais atrasada primeiro,
 * enquanto houver tempo.
 */
export async function rodarAgendado(orcamentoMs: number): Promise<ResumoDoPasso[]> {
  const limite = Date.now() + orcamentoMs;
  const fontes = (await listarFontes())
    .filter((f) => f.site === "kabum" && estaVencida(f))
    .sort((a, b) => {
      // Passada pela metade vem antes; depois, a que está há mais tempo sem ler.
      if ((a.passo_pagina > 0) !== (b.passo_pagina > 0)) return a.passo_pagina > 0 ? -1 : 1;
      return String(a.ultima_coleta_em || "").localeCompare(String(b.ultima_coleta_em || ""));
    });

  const feitos: ResumoDoPasso[] = [];
  for (const fonte of fontes) {
    if (Date.now() + 12_000 > limite) break;
    try {
      const passo = await lerFonteAte(fonte.id, limite);
      feitos.push(passo);
      // Bloqueio numa fonte vale para o site inteiro: não adianta tentar as outras.
      if (passo.estado === "bloqueada") break;
    } catch (erro) {
      feitos.push({
        fonte: fonte.nome, estado: "erro", pagina: 0, totalDePaginas: null,
        gravados: 0, novos: 0, retidos: 0, removidos: 0, mensagem: String((erro as Error)?.message || erro),
      });
    }
  }
  return feitos;
}
