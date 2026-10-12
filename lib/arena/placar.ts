// ============================================================
// Arena: o placar de um período (semana ou mês).
//
// A linha de chegada de cada piloto é a META DELE, não um número igual para
// todos: assim o vendedor que está começando também cruza a linha. A posição
// na corrida é o quanto da própria meta cada um já fez (empate: mais pontos).
// ============================================================

import { dentro, type JanelaDoPeriodo, type Periodo } from "./periodos";
import type { AjustesDaCorrida, Lancamento, LinhaDoPlacar, Piloto, PlacarDoPeriodo } from "./tipos";

/** Liga o lançamento ao piloto: manual pelo id, Bling pelo vendedor. */
export function pilotoDoLancamento(l: Pick<Lancamento, "pilotoId" | "blingVendedorId">, porBling: Map<string, Piloto>, porId: Map<string, Piloto>): Piloto | null {
  if (l.pilotoId) return porId.get(l.pilotoId) ?? null;
  if (l.blingVendedorId) return porBling.get(l.blingVendedorId) ?? null;
  return null;
}

export function indexarPilotos(pilotos: Piloto[]) {
  const porBling = new Map<string, Piloto>();
  const porId = new Map<string, Piloto>();
  for (const p of pilotos) {
    porId.set(p.id, p);
    if (p.blingVendedorId) porBling.set(p.blingVendedorId, p);
  }
  return { porBling, porId };
}

export function metaDoPiloto(p: Piloto, periodo: Periodo, ajustes: AjustesDaCorrida): number {
  const propria = periodo === "semana" ? p.metaSemana : p.metaMes;
  const padrao = periodo === "semana" ? ajustes.metaPadraoSemana : ajustes.metaPadraoMes;
  return Math.max(1, Number(propria) > 0 ? Number(propria) : padrao);
}

export function montarPlacar(
  pilotos: Piloto[],
  lancamentos: Lancamento[],
  j: JanelaDoPeriodo,
  ajustes: AjustesDaCorrida
): PlacarDoPeriodo {
  const ativos = pilotos.filter((p) => p.ativo);
  const { porBling, porId } = indexarPilotos(ativos);
  const soma = new Map<string, Omit<LinhaDoPlacar, "piloto" | "meta" | "progresso" | "posicao" | "chegou">>();
  for (const p of ativos) soma.set(p.id, { pontos: 0, vendas: 0, orcamentos: 0, licencas: 0, conversoes: 0 });

  for (const l of lancamentos) {
    if (l.status !== "valido" || !dentro(l.data, j)) continue;
    const p = pilotoDoLancamento(l, porBling, porId);
    if (!p) continue;
    const s = soma.get(p.id)!;
    s.pontos += l.pontos;
    if (l.tipo === "venda") {
      s.vendas += 1;
      s.licencas += l.licencas;
      if (l.detalhe && l.detalhe.conversao > 0) s.conversoes += 1;
    } else if (l.tipo === "orcamento") {
      s.orcamentos += 1;
    }
  }

  const linhas: LinhaDoPlacar[] = ativos.map((p) => {
    const s = soma.get(p.id)!;
    const meta = metaDoPiloto(p, j.periodo, ajustes);
    const pontos = Math.round(s.pontos * 10) / 10;
    return { piloto: p, ...s, pontos, meta, progresso: Math.max(0, pontos) / meta, posicao: 0, chegou: pontos >= meta };
  });
  linhas.sort((a, b) => b.progresso - a.progresso || b.pontos - a.pontos || a.piloto.nome.localeCompare(b.piloto.nome));
  linhas.forEach((l, i) => (l.posicao = i + 1));

  const pontosEquipe = linhas.reduce((t, l) => t + Math.max(0, l.pontos), 0);
  const metaGlobalAjuste = j.periodo === "semana" ? ajustes.metaGlobalSemana : ajustes.metaGlobalMes;
  const metaEquipe = Math.max(1, metaGlobalAjuste > 0 ? metaGlobalAjuste : linhas.reduce((t, l) => t + l.meta, 0));

  return {
    periodo: j.periodo,
    rotulo: j.rotulo,
    inicio: j.inicio,
    fim: j.fim,
    terminaEm: j.terminaEm,
    linhas,
    equipe: { pontos: Math.round(pontosEquipe * 10) / 10, meta: metaEquipe, progresso: pontosEquipe / metaEquipe },
  };
}

/**
 * Meta sugerida: a média de pontos das semanas (ou meses) passadas com 15% a
 * mais, arredondada de 5 em 5. Sem histórico, devolve null (fica a padrão).
 */
export function sugerirMeta(pontosPorPeriodo: number[]): number | null {
  const comMovimento = pontosPorPeriodo.filter((p) => p > 0);
  if (comMovimento.length === 0) return null;
  const media = pontosPorPeriodo.reduce((a, b) => a + b, 0) / pontosPorPeriodo.length;
  return Math.max(5, Math.ceil((media * 1.15) / 5) * 5);
}
