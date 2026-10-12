// ============================================================
// Arena: o placar de um período (semana ou mês), em reais.
//
// A meta da equipe (R$ 63 mil na semana, R$ 250 mil no mês — pedido de 12/10)
// é dividida entre os pilotos ativos, vendedores e técnicos. Quem tem meta
// própria fica com ela; o resto da meta da equipe é dividido em partes iguais
// entre os demais. A linha de chegada de cada um é a meta dele, e a posição na
// corrida é quanto da própria meta já fez (empate: mais reais).
// ============================================================

import { dentro, type JanelaDoPeriodo, type Periodo } from "./periodos";
import { centavos } from "./valores";
import type { AjustesDaCorrida, Lancamento, LinhaDoPlacar, Piloto, PlacarDoPeriodo } from "./tipos";

/** Liga o lançamento ao piloto: manual e OS pelo id, Bling pelo vendedor. */
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

export function metaGlobal(periodo: Periodo, ajustes: AjustesDaCorrida): number {
  return periodo === "semana" ? ajustes.metaGlobalSemana : ajustes.metaGlobalMes;
}

/**
 * A meta de cada piloto ativo no período: a própria, ou a parte dele no que
 * sobra da meta da equipe. Arredonda para cima, de 10 em 10 reais, para a soma
 * nunca ficar abaixo da meta da equipe.
 */
export function dividirMetas(pilotos: Piloto[], periodo: Periodo, ajustes: AjustesDaCorrida): Map<string, { meta: number; propria: boolean }> {
  const ativos = pilotos.filter((p) => p.ativo);
  const propria = (p: Piloto) => {
    const v = periodo === "semana" ? p.metaSemana : p.metaMes;
    return Number(v) > 0 ? Number(v) : null;
  };
  const comPropria = ativos.filter((p) => propria(p) !== null);
  const semPropria = ativos.filter((p) => propria(p) === null);
  const somaPropria = comPropria.reduce((t, p) => t + propria(p)!, 0);
  const sobra = Math.max(0, metaGlobal(periodo, ajustes) - somaPropria);
  const parte = semPropria.length ? Math.ceil(sobra / semPropria.length / 10) * 10 : 0;
  const out = new Map<string, { meta: number; propria: boolean }>();
  for (const p of comPropria) out.set(p.id, { meta: propria(p)!, propria: true });
  for (const p of semPropria) out.set(p.id, { meta: Math.max(1, parte), propria: false });
  return out;
}

type Somas = Pick<LinhaDoPlacar, "valor" | "vendas" | "valorVendas" | "orcamentos" | "os" | "valorOS" | "licencas" | "valorLicencas">;

export function montarPlacar(
  pilotos: Piloto[],
  lancamentos: Lancamento[],
  j: JanelaDoPeriodo,
  ajustes: AjustesDaCorrida
): PlacarDoPeriodo {
  const ativos = pilotos.filter((p) => p.ativo);
  const { porBling, porId } = indexarPilotos(ativos);
  const metas = dividirMetas(ativos, j.periodo, ajustes);
  const soma = new Map<string, Somas>();
  for (const p of ativos) soma.set(p.id, { valor: 0, vendas: 0, valorVendas: 0, orcamentos: 0, os: 0, valorOS: 0, licencas: 0, valorLicencas: 0 });

  for (const l of lancamentos) {
    if (l.status !== "valido" || !dentro(l.data, j)) continue;
    const p = pilotoDoLancamento(l, porBling, porId);
    if (!p) continue;
    const s = soma.get(p.id)!;
    const v = Number(l.valor) || 0;
    s.valor += v;
    if (l.tipo === "venda") {
      s.vendas += 1;
      s.valorVendas += v;
      s.licencas += l.licencas || 0;
      s.valorLicencas += l.valorLicencas || 0;
    } else if (l.tipo === "orcamento") {
      s.orcamentos += 1;
    } else if (l.tipo === "os") {
      s.os += 1;
      s.valorOS += v;
    }
  }

  const linhas: LinhaDoPlacar[] = ativos.map((p) => {
    const s = soma.get(p.id)!;
    const { meta, propria } = metas.get(p.id)!;
    const valor = centavos(s.valor);
    return {
      piloto: p,
      ...s,
      valor,
      valorVendas: centavos(s.valorVendas),
      valorOS: centavos(s.valorOS),
      valorLicencas: centavos(s.valorLicencas),
      meta,
      metaPropria: propria,
      progresso: Math.max(0, valor) / meta,
      posicao: 0,
      chegou: valor >= meta,
    };
  });
  linhas.sort((a, b) => b.progresso - a.progresso || b.valor - a.valor || a.piloto.nome.localeCompare(b.piloto.nome));
  linhas.forEach((l, i) => (l.posicao = i + 1));

  const valorEquipe = centavos(linhas.reduce((t, l) => t + Math.max(0, l.valor), 0));
  const global = metaGlobal(j.periodo, ajustes);
  const metaEquipe = Math.max(1, global > 0 ? global : linhas.reduce((t, l) => t + l.meta, 0));

  return {
    periodo: j.periodo,
    rotulo: j.rotulo,
    inicio: j.inicio,
    fim: j.fim,
    terminaEm: j.terminaEm,
    linhas,
    equipe: { valor: valorEquipe, meta: metaEquipe, progresso: valorEquipe / metaEquipe },
  };
}

/**
 * Meta sugerida: a média do que o piloto fez nas semanas (ou meses) passadas
 * com 15% a mais, arredondada de 500 em 500 reais. Sem histórico, null.
 */
export function sugerirMeta(valoresPorPeriodo: number[]): number | null {
  if (!valoresPorPeriodo.some((v) => v > 0)) return null;
  const media = valoresPorPeriodo.reduce((a, b) => a + b, 0) / valoresPorPeriodo.length;
  return Math.max(500, Math.ceil((media * 1.15) / 500) * 500);
}
